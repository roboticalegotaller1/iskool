import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { validateApiAuth } from '@/lib/authValidator';
import { isPlatformSuperUser } from '@/types';
import { isDemoSandboxContext } from '@/lib/demo/demoSandboxConfig';
import { recordEphemeralVaultItem } from '@/lib/demo/demoEphemeralVault';
import { z } from 'zod';

const ReassignSchema = z.object({
  schoolId: z.string().optional(),
  masterTeacherName: z.string().min(2).max(150).optional().default('Prof. Israel López Ángeles'),
  masterTeacherId: z.string().min(1).max(100).optional().default('usr-teacher-1'),
});

/**
 * Obtiene el directorio raíz canónico de las planeaciones pedagógicas.
 */
function getVaultPlanningsDir(): string {
  const envPath = process.env.CURRICULAR_VAULT_PATH || process.env.VAULT_PATH;
  if (envPath && fs.existsSync(envPath)) {
    const sub = path.join(envPath, 'planeaciones');
    return fs.existsSync(sub) ? sub : envPath;
  }

  const localProjectPlannings = path.join(process.cwd(), 'planeaciones');
  return localProjectPlannings;
}

function getAllMarkdownFiles(dirPath: string): string[] {
  let results: string[] = [];
  try {
    if (!fs.existsSync(dirPath)) return results;
    const list = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const item of list) {
      const fullPath = path.join(dirPath, item.name);
      if (item.isDirectory()) {
        results = results.concat(getAllMarkdownFiles(fullPath));
      } else if (item.isFile() && item.name.endsWith('.md')) {
        results.push(fullPath);
      }
    }
  } catch (err) {
    console.warn('Error leyendo directorio en Bóveda Curricular:', err);
  }
  return results;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Verificación estricta de Autenticación Zero-Trust
    const auth = await validateApiAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ success: false, error: 'No autorizado. Se requiere sesión activa.' }, { status: 401 });
    }

    // 2. Control de Autorización: Exclusivo para Super Usuarios de Plataforma (previene sobrescritura masiva cross-school)
    if (!isPlatformSuperUser(auth.user)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Acceso denegado: Se requieren privilegios de Super Usuario de plataforma para reasignar planeaciones en la Bóveda Curricular.' 
      }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({
        success: false,
        error: 'Cuerpo JSON inválido o malformado.'
      }, { status: 400 });
    }
    const parsed = ReassignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ 
        success: false, 
        error: parsed.error.issues[0]?.message || 'Parámetros de reasignación inválidos.' 
      }, { status: 400 });
    }

    const { schoolId, masterTeacherName, masterTeacherId } = parsed.data;

    if (
      isDemoSandboxContext({
        email: auth.user.email,
        schoolId: schoolId || auth.user.school_id,
        userId: auth.user.id,
        tenantId: auth.user.tenant_id,
      })
    ) {
      recordEphemeralVaultItem('reassign', {
        actorEmail: auth.user.email,
        title: `Reasignación demo a ${masterTeacherName}`,
        payload: { schoolId, masterTeacherId, masterTeacherName },
      });
      return NextResponse.json({
        success: true,
        demoSandbox: true,
        persistedInVault: false,
        message: `Modo Cuentas Demo: Reasignación simulada en memoria para ${masterTeacherName} (0 escrituras en Bóveda Curricular).`,
        filesProcessed: 0,
        filesReassigned: 0,
        masterTeacher: {
          id: masterTeacherId,
          name: masterTeacherName,
        },
      });
    }

    const vaultDir = getVaultPlanningsDir();
    const allFiles = getAllMarkdownFiles(vaultDir);

    let updatedCount = 0;

    for (const filePath of allFiles) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        let updated = content;
        
        // Reasignación y acreditación oficial de autoría docente
        if (content.includes('**Docente:**') && !content.includes(masterTeacherName)) {
          updated = updated.replace(/\*\*Docente:\*\*.*$/m, `**Docente:** ${masterTeacherName}`);
          updatedCount++;
        }

        if (updated !== content) {
          fs.writeFileSync(filePath, updated, 'utf-8');
        }
      } catch (fileErr) {
        console.warn(`Error procesando archivo ${filePath}:`, fileErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Planeaciones de la Bóveda Curricular preservadas y reacreditadas exitosamente al ${masterTeacherName}`,
      filesProcessed: allFiles.length,
      filesReassigned: updatedCount,
      masterTeacher: {
        id: masterTeacherId,
        name: masterTeacherName
      }
    });
  } catch (error: any) {
    console.error('Error en reasignación de Bóveda Curricular:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
