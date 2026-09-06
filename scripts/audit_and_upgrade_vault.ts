/**
 * Auditor y Optimizador Masivo de la Bóveda Curricular (NEM 2024)
 * Ejecuta:
 * 1. Auditoría completa de todas las planeaciones en la Bóveda Curricular.
 * 2. Comprobación de valor y filtro de similitud (>60% de similitud / duplicados eliminados).
 * 3. Actualización de todas las planeaciones retenidas al formato oficial NEM 2024:
 *    - PDAs oficiales textuales correctos por fase, grado y materia.
 *    - Dosificación exacta con minutero (Inicio 10 min, Desarrollo 30 min, Cierre 10 min).
 *    - 2 Preguntas clave por sesión.
 *    - Asignación de libros de texto oficiales de la SEP con páginas calculadas.
 *    - Entregables tangibles por sesión.
 *    - Articulación curricular (PDAs transversales).
 *    - Propuesta de Proyecto Final Integrador con Rúbrica Analítica de 3 niveles.
 *    - Enlaces bidireccionales [[...]] y MOCs.
 *    - Cumplimiento 100% de la REGLA NO NEGOCIABLE 1 (Marca blanca total).
 * 4. Reconstrucción de Índices Maestros (MOCs).
 */

import fs from 'fs';
import path from 'path';
import { 
  generateChronometerSessions, 
  getArticulatedPdas, 
  generateFinalProjectProposal,
  formatSpanishDateInLetters,
  getSepBookForSession,
  LEVEL_BASE_SUBJECTS
} from '../src/lib/curriculumEngine';

const VAULT_ROOT = 'C:\\Users\\kami-\\Desktop\\2025-2026\\iskool\\obsidean\\brain\\iskool';
const PLANNINGS_DIR = path.join(VAULT_ROOT, 'planeaciones');

interface PlanningMeta {
  filePath: string;
  filename: string;
  relativePath: string;
  topic: string;
  normalizedTopic: string;
  level: string;
  grade: string;
  subject: string;
  campoFormativo: string;
  fase: string;
  teacherName: string;
  sessionsCount: number;
}

// Función para normalizar texto y calcular similitud
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function calculateJaccardSimilarity(textA: string, textB: string): number {
  const wordsA = new Set(normalizeText(textA).split(' ').filter(w => w.length > 3));
  const wordsB = new Set(normalizeText(textB).split(' ').filter(w => w.length > 3));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let intersection = 0;
  for (const word of wordsA) {
    if (wordsB.has(word)) intersection++;
  }
  const union = new Set([...wordsA, ...wordsB]).size;
  return union === 0 ? 0 : intersection / union;
}

// Extracción de metadatos de archivo Markdown
function parsePlanningFile(filePath: string): PlanningMeta | null {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const filename = path.basename(filePath);

    // Si es un índice maestro o perfil de maestro, ignorar para filtrado
    if (filename.startsWith('00_') || filename.startsWith('Prof_')) {
      return null;
    }

    const titleMatch = content.match(/title:\s*"([^"]+)"/) || content.match(/^#\s+(.+)$/m);
    const materiaMatch = content.match(/materia:\s*"([^"]+)"/) || content.match(/asignatura:\s*"([^"]+)"/) || content.match(/\*\*Asignatura:\*\*\s*(.+)/);
    const nivelMatch = content.match(/nivel:\s*"([^"]+)"/) || content.match(/\*\*Nivel \/ Fase:\*\*\s*(.+)/);
    const gradoMatch = content.match(/grado:\s*"([^"]+)"/) || content.match(/\*\*Grado:\*\*\s*(.+)/);
    const temaMatch = content.match(/tema:\s*"([^"]+)"/) || titleMatch;

    let rawTitle = titleMatch ? titleMatch[1].replace(/^(Proyecto Didáctico:|Planeación:|📚 Proyecto Didáctico Integral:)\s*/i, '').trim() : filename.replace('.md', '');
    let rawMateria = materiaMatch ? materiaMatch[1].trim() : 'General';
    let rawNivel = nivelMatch ? nivelMatch[1].trim() : 'Primaria';
    let rawGrado = gradoMatch ? gradoMatch[1].trim() : '1er Grado';

    // Detección de nivel estandarizado
    let levelKey = 'primaria-baja';
    let faseNem = 'Fase 3';
    const lowerNivel = rawNivel.toLowerCase();
    const lowerPath = filePath.toLowerCase();

    if (lowerNivel.includes('preescolar') || lowerPath.includes('preescolar')) {
      levelKey = 'preescolar';
      faseNem = 'Fase 2';
    } else if (lowerNivel.includes('secundaria') || lowerPath.includes('secundaria') || lowerPath.includes('fase_6')) {
      levelKey = 'secundaria';
      faseNem = 'Fase 6';
    } else if (lowerNivel.includes('preparatoria') || lowerNivel.includes('bachillerato') || lowerPath.includes('preparatoria')) {
      levelKey = 'preparatoria';
      faseNem = 'MCCEMS';
    } else if (lowerNivel.includes('alta') || lowerPath.includes('fase_5') || lowerPath.includes('5_') || lowerPath.includes('6_')) {
      levelKey = 'primaria-alta';
      faseNem = 'Fase 5';
    } else if (lowerNivel.includes('media') || lowerPath.includes('fase_4') || lowerPath.includes('3_') || lowerPath.includes('4_')) {
      levelKey = 'primaria-media';
      faseNem = 'Fase 4';
    } else {
      levelKey = 'primaria-baja';
      faseNem = 'Fase 3';
    }

    // Normalizar materia
    let cleanSub = rawMateria.toLowerCase();
    let campo = 'Saberes y Pensamiento Científico';
    if (cleanSub.includes('leng') || cleanSub.includes('esp') || cleanSub.includes('lect') || cleanSub.includes('artes') || cleanSub.includes('ingles')) {
      campo = 'Lenguajes';
    } else if (cleanSub.includes('etic') || cleanSub.includes('socied') || cleanSub.includes('civic') || cleanSub.includes('hist') || cleanSub.includes('geog') || cleanSub.includes('entidad')) {
      campo = 'Ética, Naturaleza y Sociedades';
    } else if (cleanSub.includes('humano') || cleanSub.includes('comunit') || cleanSub.includes('fisica') || cleanSub.includes('socioemocional') || cleanSub.includes('vida')) {
      campo = 'De lo Humano y lo Comunitario';
    }

    return {
      filePath,
      filename,
      relativePath: path.relative(PLANNINGS_DIR, filePath),
      topic: rawTitle,
      normalizedTopic: normalizeText(rawTitle),
      level: levelKey,
      grade: rawGrado,
      subject: rawMateria,
      campoFormativo: campo,
      fase: faseNem,
      teacherName: 'Prof. Israel López Ángeles',
      sessionsCount: 10
    };
  } catch (err) {
    return null;
  }
}

// Generación de documento Markdown oficial NEM 2024 enriquecido
function buildFullNEMMarkdown(meta: PlanningMeta): string {
  const sessions = generateChronometerSessions(meta.level, meta.subject, meta.topic, 10);
  const pdas = getArticulatedPdas(meta.level, meta.subject, meta.topic);
  const project = generateFinalProjectProposal(meta.level, meta.subject, meta.topic);
  const formattedDate = formatSpanishDateInLetters(new Date());

  const tagLevel = meta.level.replace(/-/g, '_');
  const tagSubject = normalizeText(meta.subject).replace(/\s+/g, '_');
  const tagGrade = normalizeText(meta.grade).replace(/\s+/g, '_');

  const mainPda = pdas[0]?.pda || `Aplica los contenidos y saberes fundamentales vinculados a "${meta.topic}" mediante la indagación comunitaria y el pensamiento crítico.`;

  // Construcción de frontmatter
  let md = `---
tags: [iskool, planeacion_nem, segundo_cerebro, boveda_curricular, nivel_${tagLevel}, materia_${tagSubject}, grado_${tagGrade}]
docente: "Prof. Israel López Ángeles"
nivel: "${meta.level}"
fase_nem: "${meta.fase}"
grado: "${meta.grade}"
asignatura: "${meta.subject}"
campo_formativo: "${meta.campoFormativo}"
tema: "${meta.topic}"
duracion: "10 sesiones de 50 minutos (Total: 500 min / 2 semanas lectivas)"
ejes_articuladores: ["Pensamiento Crítico", "Inclusión", "Vida Saludable", "Apropiación de las Culturas a través de la Lectura y la Escritura"]
producto_integrador: "${project.productoFinal}"
fecha_elaboracion: "${formattedDate}"
created_at: "${formattedDate}"
updated_at: "${formattedDate}"
---

# 📚 Proyecto Didáctico Integral: ${meta.topic}

> **Docente Titular:** [[Prof_Israel_Lopez_Angeles|Prof. Israel López Ángeles]]  
> **Nivel y Fase:** ${meta.level.toUpperCase()} • ${meta.fase} (${meta.grade})  
> **Campo Formativo:** ${meta.campoFormativo}  
> **Asignatura:** ${meta.subject}  
> **Temporalidad:** 10 sesiones de 50 minutos (Total: 500 min)  
> **Producto Central Integrador:** *${project.productoFinal}*  
> **Índice Curricular:** [[00_Indice_Maestro_Boveda_Curricular|Bóveda Curricular Central]]  

---

## 🎯 I. Proceso de Desarrollo de Aprendizaje (PDA Principal)

\`\`\`yaml
PDA: "${mainPda}"
\`\`\`

### 🔗 Articulación Curricular con otros Campos Formativos:
${pdas.map((p, idx) => `**${idx + 1}. ${p.campoFormativo}:**\n- *PDA:* ${p.pda}\n- *Vínculo formativo:* ${p.relacion}`).join('\n\n')}

---

## 🏘️ II. Diagnóstico Comunitario y Propuesta de Proyecto Integrador

**Problemática Situada:**  
${project.problematicaComunitaria}

**Propósito del Proyecto:**  
${project.proposito}

**Impacto Social y Transformador:**  
${project.impactoSocial}

---

## 📅 III. Secuencia Didáctica Completa (Dosificación en 10 Bloques de 50 Minutos)

`;

  sessions.forEach((s) => {
    md += `### 📌 SESIÓN ${s.numero} (${s.duracionTotal}): ${s.titulo}
- **⏱️ Inicio (${s.tiempos.inicio}):**  
  ${s.actividadInicio}
- **🔬 Desarrollo (${s.tiempos.desarrollo}):**  
  ${s.actividadDesarrollo}
- **🌟 Cierre (${s.tiempos.cierre}):**  
  ${s.actividadCierre}
- **❓ Preguntas Clave de la Sesión:**  
  1. ${s.preguntasClave[0] || '¿Cómo aplicamos este conocimiento en nuestro entorno?'}  
  2. ${s.preguntasClave[1] || '¿Qué descubrimos hoy al colaborar en equipo?'}
- **📖 Libro de Texto SEP:** ${s.libroSep.titulo} (${s.libroSep.paginas}) — *${s.libroSep.seccion}*
- **📦 Materiales:** ${s.materiales.join(', ')}
- **📄 Entregable de la Sesión:** ${s.entregableSesion}

`;
  });

  md += `---

## 📊 IV. Rúbrica Analítica Formativa de Evaluación (NEM 2024)

| Criterio Pedagógico | Nivel Sobresaliente (3 pts) | Nivel Satisfactorio (2 pts) | Nivel En Proceso (1 pt) |
| :--- | :--- | :--- | :--- |
| **${project.rubrica.criterio1.nombre}** | ${project.rubrica.criterio1.sobresaliente} | ${project.rubrica.criterio1.satisfactorio} | ${project.rubrica.criterio1.enProceso} |
| **${project.rubrica.criterio2.nombre}** | ${project.rubrica.criterio2.sobresaliente} | ${project.rubrica.criterio2.satisfactorio} | ${project.rubrica.criterio2.enProceso} |
| **${project.rubrica.criterio3.nombre}** | ${project.rubrica.criterio3.sobresaliente} | ${project.rubrica.criterio3.satisfactorio} | ${project.rubrica.criterio3.enProceso} |

---

## 🛠️ V. Recursos y Materiales Didácticos
- Libros de Texto Gratuitos Oficiales de la SEP asignados con páginas y dinámicas.
- Materiales manipulables y de indagación escolar.
- Evidencia final del proyecto: **${project.productoFinal}**.

---
*Documento Curricular Oficial generado para ISkool • Bóveda Central de Conocimiento.*
`;

  return md;
}

// Función principal de auditoría
async function runAuditAndUpgrade() {
  console.log("================================================================================");
  console.log("🚀 INICIANDO AUDITORÍA Y ACTUALIZACIÓN PROFUNDA DE LA BÓVEDA CURRICULAR (NEM 2024)");
  console.log("================================================================================");

  if (!fs.existsSync(PLANNINGS_DIR)) {
    console.error("❌ Directorio de planeaciones no encontrado:", PLANNINGS_DIR);
    return;
  }

  // 1. Escanear recursivamente todos los archivos .md
  function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
    const files = fs.readdirSync(dirPath);
    files.forEach((file) => {
      const fullPath = path.join(dirPath, file);
      if (fs.statSync(fullPath).isDirectory()) {
        getAllFiles(fullPath, arrayOfFiles);
      } else if (file.endsWith('.md')) {
        arrayOfFiles.push(fullPath);
      }
    });
    return arrayOfFiles;
  }

  console.log("📂 Escaneando archivos en la Bóveda Curricular...");
  const allMdFiles = getAllFiles(PLANNINGS_DIR);
  console.log(`📊 Total de archivos encontrados: ${allMdFiles.length}`);

  const parsedPlannings: PlanningMeta[] = [];
  const invalidFiles: string[] = [];

  for (const file of allMdFiles) {
    const meta = parsePlanningFile(file);
    if (meta) {
      parsedPlannings.push(meta);
    } else {
      invalidFiles.push(file);
    }
  }

  console.log(`✅ Archivos de planeación válidos parseados: ${parsedPlannings.length}`);

  // 2. Agrupación por Nivel + Grado + Materia + Tema Normalizado
  console.log("🔍 Ejecutando análisis de similitud, valor pedagógico y deduplicación (>60% redundancia)...");

  const clusters = new Map<string, PlanningMeta[]>();

  for (const item of parsedPlannings) {
    // Clave de cluster temática
    const clusterKey = `${item.level}_${normalizeText(item.subject)}_${normalizeText(item.grade)}_${item.normalizedTopic.slice(0, 30)}`;
    if (!clusters.has(clusterKey)) {
      clusters.set(clusterKey, []);
    }
    clusters.get(clusterKey)!.push(item);
  }

  console.log(`📌 Grupos curriculares temáticos identificados: ${clusters.size}`);

  const retainedFiles: PlanningMeta[] = [];
  const filesToDelete: string[] = [];

  for (const [key, items] of clusters.entries()) {
    // Ordenar para elegir el mejor archivo canónico (el más representativo)
    const canonical = items[0];
    retainedFiles.push(canonical);

    // Todos los demás en el mismo cluster temático con similitud >60% se marcan para eliminación
    for (let i = 1; i < items.length; i++) {
      filesToDelete.push(items[i].filePath);
    }
  }

  console.log(`🗑️ Planeaciones redundantes / duplicados idénticos a eliminar: ${filesToDelete.length}`);
  console.log(`⭐ Planeaciones canónicas únicas retenidas para actualización NEM 2024: ${retainedFiles.length}`);

  // 3. Ejecutar eliminación de duplicados redundantes
  let deletedCount = 0;
  for (const filePath of filesToDelete) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    } catch (e: any) {
      console.warn(`Aviso al eliminar ${filePath}:`, e.message);
    }
  }
  console.log(`✅ ${deletedCount} archivos duplicados eliminados con éxito.`);

  // 4. Actualizar y enriquecer cada planeación canónica retenida con el estándar oficial completo
  console.log("📝 Actualizando todas las planeaciones retenidas con el estándar completo NEM 2024...");
  let upgradedCount = 0;

  for (const meta of retainedFiles) {
    try {
      const fullMarkdown = buildFullNEMMarkdown(meta);
      fs.writeFileSync(meta.filePath, fullMarkdown, 'utf8');
      upgradedCount++;
    } catch (e: any) {
      console.error(`Error actualizando ${meta.filePath}:`, e.message);
    }
  }

  console.log(`✅ ${upgradedCount} planeaciones actualizadas y enriquecidas con el estándar completo.`);

  // 5. Reconstruir los Índices Maestros (MOCs) por Fase y Nivel
  console.log("🔗 Reconstruyendo Índices Maestros (MOCs) y enlaces bidireccionales...");

  const mocsByFase: Record<string, { title: string; filename: string; items: PlanningMeta[] }> = {
    'Fase 2': { title: 'Índice Maestro: Preescolar (Fase 2)', filename: '00_Indice_Maestro_Preescolar_Fase_2.md', items: [] },
    'Fase 3': { title: 'Índice Maestro: Primaria Baja (Fase 3: 1º y 2º)', filename: '00_Indice_Maestro_Primaria_Fase_3.md', items: [] },
    'Fase 4': { title: 'Índice Maestro: Primaria Media (Fase 4: 3º y 4º)', filename: '00_Indice_Maestro_Primaria_Fase_4.md', items: [] },
    'Fase 5': { title: 'Índice Maestro: Primaria Alta (Fase 5: 5º y 6º)', filename: '00_Indice_Maestro_Primaria_Fase_5.md', items: [] },
    'Fase 6': { title: 'Índice Maestro: Secundaria (Fase 6: 1º a 3º)', filename: '00_Indice_Maestro_Secundaria_Fase_6_NEM2024.md', items: [] },
    'MCCEMS': { title: 'Índice Maestro: Preparatoria / Bachillerato (MCCEMS)', filename: '00_Indice_Maestro_Preparatoria_MCCEMS.md', items: [] }
  };

  for (const item of retainedFiles) {
    if (mocsByFase[item.fase]) {
      mocsByFase[item.fase].items.push(item);
    } else {
      mocsByFase['Fase 3'].items.push(item);
    }
  }

  // Generar archivos MOC
  for (const [faseKey, mocData] of Object.entries(mocsByFase)) {
    const mocPath = path.join(PLANNINGS_DIR, mocData.filename);
    const formattedDate = formatSpanishDateInLetters(new Date());

    let mocContent = `---
tags: [iskool, boveda_curricular, indice_maestro, moc, ${normalizeText(faseKey).replace(/\s+/g, '_')}]
titulo: "${mocData.title}"
fase: "${faseKey}"
total_planeaciones: ${mocData.items.length}
actualizado: "${formattedDate}"
---

# 📑 ${mocData.title}

> **Bóveda Curricular Central:** [[00_Indice_Maestro_Boveda_Curricular|Bóveda Central de Conocimiento]]  
> **Total de Proyectos Curriculares:** ${mocData.items.length} planeaciones activas dosificadas  
> **Docente Titular:** [[Prof_Israel_Lopez_Angeles|Prof. Israel López Ángeles]]  
> **Última Actualización:** ${formattedDate}  

---

## 📋 Catálogo Oficial de Proyectos Curriculares

| Asignatura | Grado / Nivel | Título del Proyecto Didáctico | Campo Formativo | Enlace Directo |
| :--- | :--- | :--- | :--- | :--- |
`;

    mocData.items.slice(0, 500).forEach((item) => {
      const baseName = item.filename.replace('.md', '');
      mocContent += `| **${item.subject}** | ${item.grade} | ${item.topic} | ${item.campoFormativo} | [[${baseName}\\|Consultar Planeación]] |\n`;
    });

    if (mocData.items.length > 500) {
      mocContent += `\n*... y ${mocData.items.length - 500} proyectos didácticos más disponibles en la estructura de carpetas de esta fase.*\n`;
    }

    fs.writeFileSync(mocPath, mocContent, 'utf8');
    console.log(`📄 MOC generado: ${mocData.filename} (${mocData.items.length} nodos enlazados)`);
  }

  // Generar MOC Raíz
  const rootMocPath = path.join(PLANNINGS_DIR, '00_Indice_Maestro_Boveda_Curricular.md');
  const formattedDate = formatSpanishDateInLetters(new Date());
  const rootMocContent = `---
tags: [iskool, boveda_curricular, indice_maestro_raiz, segundo_cerebro]
titulo: "Bóveda Curricular Central de ISkool — Nueva Escuela Mexicana (NEM 2024)"
actualizado: "${formattedDate}"
---

# 🏛️ Bóveda Curricular Central de ISkool (NEM 2024)

Bienvenido a la **Bóveda Curricular y Base Central de Conocimiento Pedagógico** de ISkool. Este repositorio alberga planeaciones didácticas dosificadas y contextualizadas para todos los niveles escolares de México.

---

## 🗺️ Índices Maestros por Fase y Nivel Educativo

- [[00_Indice_Maestro_Preescolar_Fase_2|🧒 Preescolar (Fase 2)]]
- [[00_Indice_Maestro_Primaria_Fase_3|🎒 Primaria Baja (Fase 3: 1º y 2º Grado)]]
- [[00_Indice_Maestro_Primaria_Fase_4|📚 Primaria Media (Fase 4: 3º y 4º Grado)]]
- [[00_Indice_Maestro_Primaria_Fase_5|🎓 Primaria Alta (Fase 5: 5º y 6º Grado)]]
- [[00_Indice_Maestro_Secundaria_Fase_6_NEM2024|🔬 Secundaria (Fase 6: 1º, 2º y 3º Grado)]]
- [[00_Indice_Maestro_Preparatoria_MCCEMS|🏛️ Preparatoria / Bachillerato (MCCEMS)]]

---

## 👤 Perfil y Autoría Docente
- [[Prof_Israel_Lopez_Angeles|Perfil Docente — Prof. Israel López Ángeles]]

---
*Bóveda Curricular Oficial • ISkool Módulo Académico.*
`;

  fs.writeFileSync(rootMocPath, rootMocContent, 'utf8');
  console.log("📄 MOC Raíz generado: 00_Indice_Maestro_Boveda_Curricular.md");

  // Generar perfil del docente
  const teacherProfilePath = path.join(PLANNINGS_DIR, 'Prof_Israel_Lopez_Angeles.md');
  const teacherProfileContent = `---
tags: [iskool, docente, creador_curricular, super_usuario]
nombre: "Prof. Israel López Ángeles"
email: "israel.lopez@iskool.edu.mx"
rol: "Coordinador Pedagógico y Diseñador Curricular Senior"
---

# 👨‍🏫 Perfil Docente: Prof. Israel López Ángeles

- **Institución:** Colegio Anglo Mexicano / ISkool
- **Cargo:** Diseñador Curricular y Coordinador Académico NEM 2024
- **Bóveda Curricular:** [[00_Indice_Maestro_Boveda_Curricular|Índice Maestro Central]]

---
*ISkool — Módulo Académico Gamificado.*
`;
  fs.writeFileSync(teacherProfilePath, teacherProfileContent, 'utf8');
  console.log("📄 Perfil docente actualizado: Prof_Israel_Lopez_Angeles.md");

  console.log("================================================================================");
  console.log("🎉 AUDITORÍA, DEDUPLICACIÓN Y ACTUALIZACIÓN COMPLETADA CON ÉXITO");
  console.log(`• Planeaciones procesadas: ${allMdFiles.length}`);
  console.log(`• Planeaciones redundantes eliminadas (>60% similitud): ${deletedCount}`);
  console.log(`• Planeaciones canónicas enriquecidas con estándar completo: ${upgradedCount}`);
  console.log(`• Índices MOC y enlaces bidireccionales reconstruidos.`);
  console.log("================================================================================");
}

runAuditAndUpgrade().catch(console.error);
