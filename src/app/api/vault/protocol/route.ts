import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * Endpoint de Sincronización y Persistencia de Protocolos y Directivas Institucionales
 * en la Bóveda Central de Conocimiento (Segundo Cerebro).
 * Escribe archivos Markdown (.md) con Frontmatter YAML y enlaces bidireccionales [[...]].
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      title,
      cluster = 'general',
      bovedaPath = '',
      content = '',
      kpis = [],
      summary = '',
      isOptimized = false,
      wikilinks = []
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Título requerido' }, { status: 400 });
    }

    // Directorio de protocolos en la Bóveda Curricular
    const protocolsDir = path.join(process.cwd(), 'planeaciones', 'Protocolos_Institucionales');
    if (!fs.existsSync(protocolsDir)) {
      fs.mkdirSync(protocolsDir, { recursive: true });
    }

    const safeFilename = title
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/_+/g, '_');

    const filePath = path.join(protocolsDir, `${safeFilename}.md`);
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

${content.trim() || summary.trim()}

---
*Documento canónico indexado en la Bóveda Central de Conocimiento | ISkool Red Nacional.*
`;

    fs.writeFileSync(filePath, markdownContent, 'utf8');

    return NextResponse.json({
      success: true,
      persisted: true,
      filePath: `planeaciones/Protocolos_Institucionales/${safeFilename}.md`,
      updatedAt: dateStr
    });
  } catch (err: any) {
    console.error('Error al persistir protocolo en Bóveda Central:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Error interno al guardar archivo' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title');
    if (!title) {
      return NextResponse.json({ success: false, error: 'Título requerido' }, { status: 400 });
    }

    const safeFilename = title
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/_+/g, '_');

    const filePath = path.join(process.cwd(), 'planeaciones', 'Protocolos_Institucionales', `${safeFilename}.md`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return NextResponse.json({ success: true, deleted: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
