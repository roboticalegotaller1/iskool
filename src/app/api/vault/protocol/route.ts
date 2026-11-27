import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { validateApiAuth } from '@/lib/authValidator';
import { isPlatformSuperUser } from '@/types';
import { isDemoSandboxContext } from '@/lib/demo/demoSandboxConfig';
import { recordEphemeralVaultItem } from '@/lib/demo/demoEphemeralVault';

function sanitizeVaultSegment(raw: string): string {
  return raw
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Endpoint de Sincronización y Persistencia de Protocolos y Directivas Institucionales
 * en la Bóveda Central de Conocimiento (Segundo Cerebro).
 * Escribe archivos Markdown (.md) con Frontmatter YAML y enlaces bidireccionales [[...]],
 * aislados por subcarpeta de escuela para prevenir colisiones cross-tenant.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await validateApiAuth(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ success: false, error: 'No autorizado. Se requiere sesión activa.' }, { status: 401 });
    }

    const allowedRoles = ['admin', 'superadmin', 'director', 'coordinator', 'owner', 'ceo'];
    if (!auth.user.role || !allowedRoles.includes(auth.user.role.toLowerCase())) {
      return NextResponse.json({ success: false, error: 'Prohibido: Rol no autorizado para editar protocolos directivos.' }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Cuerpo JSON inválido o malformado.' }, { status: 400 });
    }

    const {
      id,
      title,
      schoolId: requestedSchoolId,
      cluster = 'general',
      bovedaPath = '',
      content = '',
      kpis = [],
      summary = '',
      isOptimized = false,
      wikilinks = []
    } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Título requerido' }, { status: 400 });
    }

    const isSuper = isPlatformSuperUser(auth.user);
    if (!isSuper && requestedSchoolId && auth.user.school_id && requestedSchoolId !== auth.user.school_id) {
      return NextResponse.json(
        { success: false, error: 'Prohibido: No puedes editar protocolos de otra institución.' },
        { status: 403 }
      );
    }

    const resolvedSchoolId = isSuper
      ? String(requestedSchoolId || auth.user.school_id || 'global')
      : String(auth.user.school_id || 'global');

    if (
      isDemoSandboxContext({
        email: auth.user.email,
        schoolId: resolvedSchoolId,
        userId: auth.user.id,
        tenantId: auth.user.tenant_id,
      })
    ) {
      const eph = recordEphemeralVaultItem('protocol', {
        actorEmail: auth.user.email,
        title: title.trim(),
        payload: { cluster, bovedaPath },
      });
      return NextResponse.json({
        success: true,
        demoSandbox: true,
        persisted: false,
        persistedInVault: false,
        ephemeralId: eph.id,
        filePath: `sandbox-ephemeral/protocol_${eph.id}.md`,
        updatedAt: new Date().toISOString(),
        message: 'Modo Cuentas Demo: Protocolo simulado en sesión sin escribir en Bóveda Curricular.',
      });
    }

    const safeSchoolId = sanitizeVaultSegment(resolvedSchoolId);
    if (!safeSchoolId) {
      return NextResponse.json({ success: false, error: 'Identificador de institución inválido.' }, { status: 400 });
    }

    const safeFilename = sanitizeVaultSegment(title);
    if (!safeFilename) {
      return NextResponse.json({ success: false, error: 'Nombre de protocolo inválido o vacío tras sanitización.' }, { status: 400 });
    }

    // Directorio de protocolos en la Bóveda Curricular aislado por escuela
    const baseProtocolsDir = path.resolve(process.cwd(), 'planeaciones', 'Protocolos_Institucionales');
    const protocolsDir = path.resolve(baseProtocolsDir, safeSchoolId);
    if (!protocolsDir.startsWith(baseProtocolsDir + path.sep)) {
      return NextResponse.json({ success: false, error: 'Ruta de directorio no permitida' }, { status: 400 });
    }
    if (!fs.existsSync(protocolsDir)) {
      fs.mkdirSync(protocolsDir, { recursive: true });
    }

    const filePath = path.resolve(protocolsDir, `${safeFilename}.md`);
    if (!filePath.startsWith(protocolsDir + path.sep)) {
      return NextResponse.json({ success: false, error: 'Ruta de archivo no permitida' }, { status: 400 });
    }

    const dateStr = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });

    const kpisYaml = Array.isArray(kpis) && kpis.length > 0
      ? kpis.map((k: any) => `  - label: "${k.label}"\n    value: "${k.value}"`).join('\n')
      : '  - label: "Estatus"\n    value: "Vigente"';

    const linksYaml = Array.isArray(wikilinks) && wikilinks.length > 0
      ? wikilinks.map((link: string) => `  - "[[${link}]]"`).join('\n')
      : '  - "[[Bóveda Central]]"';

    const markdownContent = `---
id: "${id || safeFilename}"
titulo: "${title.trim()}"
school_id: "${safeSchoolId}"
tipo: "protocolo_institucional"
segundo_cerebro: "Bóveda Central de Conocimiento"
cluster: "${cluster}"
ruta_boveda: "${bovedaPath}"
optimizado_ia: ${isOptimized ? 'true' : 'false'}
fecha_actualizacion: "${dateStr}"
kpis:
${kpisYaml}
sinapsis:
${linksYaml}
tags: [boveda_central, protocolo_directivo, segundo_cerebro, iskool, seguridad_escolar]
---

# ${title.trim()}

${String(content || '').trim() || String(summary || '').trim()}

---
*Documento canónico indexado en la Bóveda Central de Conocimiento | ISkool Red Nacional.*
`;

    fs.writeFileSync(filePath, markdownContent, 'utf8');

    return NextResponse.json({
      success: true,
      persisted: true,
      filePath: `planeaciones/Protocolos_Institucionales/${safeSchoolId}/${safeFilename}.md`,
      updatedAt: dateStr
    });
  } catch (err: any) {
    console.error('Error al persistir protocolo en Bóveda Central:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno al guardar archivo',
        ...(process.env.NODE_ENV !== 'production' ? { details: err?.message } : {})
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await validateApiAuth(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ success: false, error: 'No autorizado. Se requiere sesión activa.' }, { status: 401 });
    }

    const allowedRoles = ['admin', 'superadmin', 'director', 'coordinator', 'owner', 'ceo'];
    if (!auth.user.role || !allowedRoles.includes(auth.user.role.toLowerCase())) {
      return NextResponse.json({ success: false, error: 'Prohibido: Rol no autorizado para consultar protocolos.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title');
    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Título requerido' }, { status: 400 });
    }

    const isSuper = isPlatformSuperUser(auth.user);
    const requestedSchoolId = searchParams.get('schoolId');
    if (!isSuper && requestedSchoolId && auth.user.school_id && requestedSchoolId !== auth.user.school_id) {
      return NextResponse.json({ success: false, error: 'Prohibido: No puedes consultar protocolos de otra institución.' }, { status: 403 });
    }

    const resolvedSchoolId = isSuper
      ? String(requestedSchoolId || auth.user.school_id || 'global')
      : String(auth.user.school_id || 'global');
    const safeSchoolId = sanitizeVaultSegment(resolvedSchoolId);
    const safeFilename = sanitizeVaultSegment(title);
    if (!safeSchoolId || !safeFilename) {
      return NextResponse.json({ success: false, error: 'Parámetros de protocolo inválidos.' }, { status: 400 });
    }

    const baseProtocolsDir = path.resolve(process.cwd(), 'planeaciones', 'Protocolos_Institucionales');
    const protocolsDir = path.resolve(baseProtocolsDir, safeSchoolId);
    if (!protocolsDir.startsWith(baseProtocolsDir + path.sep)) {
      return NextResponse.json({ success: false, error: 'Ruta no permitida' }, { status: 400 });
    }

    const filePath = path.resolve(protocolsDir, `${safeFilename}.md`);
    if (!filePath.startsWith(protocolsDir + path.sep)) {
      return NextResponse.json({ success: false, error: 'Ruta no permitida' }, { status: 400 });
    }

    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return NextResponse.json({
        success: true,
        filePath: `planeaciones/Protocolos_Institucionales/${safeSchoolId}/${safeFilename}.md`,
        content
      });
    }

    // Respaldo de lectura heredada exclusivamente para Super Usuarios de Plataforma
    if (isSuper) {
      const legacyPath = path.resolve(baseProtocolsDir, `${safeFilename}.md`);
      if (legacyPath.startsWith(baseProtocolsDir + path.sep) && fs.existsSync(legacyPath)) {
        const content = fs.readFileSync(legacyPath, 'utf8');
        return NextResponse.json({
          success: true,
          legacy: true,
          filePath: `planeaciones/Protocolos_Institucionales/${safeFilename}.md`,
          content
        });
      }
    }

    return NextResponse.json({ success: false, error: 'Protocolo no encontrado' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno al consultar protocolo',
        ...(process.env.NODE_ENV !== 'production' ? { details: err?.message } : {})
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await validateApiAuth(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ success: false, error: 'No autorizado. Se requiere sesión activa.' }, { status: 401 });
    }

    const allowedRoles = ['admin', 'superadmin', 'director', 'coordinator', 'owner', 'ceo'];
    if (!auth.user.role || !allowedRoles.includes(auth.user.role.toLowerCase())) {
      return NextResponse.json({ success: false, error: 'Prohibido: Rol no autorizado para eliminar protocolos.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title');
    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Título requerido' }, { status: 400 });
    }

    const isSuper = isPlatformSuperUser(auth.user);
    const requestedSchoolId = searchParams.get('schoolId');
    if (!isSuper && requestedSchoolId && auth.user.school_id && requestedSchoolId !== auth.user.school_id) {
      return NextResponse.json({ success: false, error: 'Prohibido: No puedes eliminar protocolos de otra institución.' }, { status: 403 });
    }

    const resolvedSchoolId = isSuper
      ? String(requestedSchoolId || auth.user.school_id || 'global')
      : String(auth.user.school_id || 'global');

    if (
      isDemoSandboxContext({
        email: auth.user.email,
        schoolId: resolvedSchoolId,
        userId: auth.user.id,
        tenantId: auth.user.tenant_id,
      })
    ) {
      return NextResponse.json({
        success: true,
        demoSandbox: true,
        persistedInVault: false,
        deleted: true,
        message: 'Modo Cuentas Demo: Eliminación simulada en sesión sin afectar archivos de Bóveda Curricular.',
      });
    }

    const safeSchoolId = sanitizeVaultSegment(resolvedSchoolId);
    const safeFilename = sanitizeVaultSegment(title);
    if (!safeSchoolId || !safeFilename) {
      return NextResponse.json({ success: false, error: 'Nombre de protocolo inválido o vacío tras sanitización.' }, { status: 400 });
    }

    const baseProtocolsDir = path.resolve(process.cwd(), 'planeaciones', 'Protocolos_Institucionales');
    const protocolsDir = path.resolve(baseProtocolsDir, safeSchoolId);
    if (!protocolsDir.startsWith(baseProtocolsDir + path.sep)) {
      return NextResponse.json({ success: false, error: 'Ruta no permitida' }, { status: 400 });
    }

    const filePath = path.resolve(protocolsDir, `${safeFilename}.md`);
    if (!filePath.startsWith(protocolsDir + path.sep)) {
      return NextResponse.json({ success: false, error: 'Ruta no permitida' }, { status: 400 });
    }

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    } else if (isSuper) {
      const legacyPath = path.resolve(baseProtocolsDir, `${safeFilename}.md`);
      if (legacyPath.startsWith(baseProtocolsDir + path.sep) && fs.existsSync(legacyPath)) {
        fs.unlinkSync(legacyPath);
      }
    }

    return NextResponse.json({ success: true, deleted: true });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno al eliminar protocolo',
        ...(process.env.NODE_ENV !== 'production' ? { details: err?.message } : {})
      },
      { status: 500 }
    );
  }
}
