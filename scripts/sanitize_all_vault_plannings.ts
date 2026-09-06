import fs from 'fs';
import path from 'path';
import {
  cleanCoreTopicName,
  classifyPedagogicalDomain,
  generateFinalProjectProposal,
  generateDetonatingQuestions,
  getArticulatedPdas,
  generateChronometerSessions,
  formatSpanishDateInLetters
} from '../src/lib/curriculumEngine';

const LOCAL_PLANNINGS_DIR = path.resolve(__dirname, '../planeaciones');
const EXTERNAL_VAULT_DIR = 'C:\\Users\\kami-\\Desktop\\2025-2026\\iskool\\obsidean\\brain\\iskool\\planeaciones';

interface PlanningFileMeta {
  filePath: string;
  filename: string;
  levelKey: string;
  fase: string;
  grade: string;
  subject: string;
  campoFormativo: string;
  topic: string;
  cleanTopic: string;
}

function getAllMarkdownFiles(dirPath: string): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dirPath)) return results;
  const list = fs.readdirSync(dirPath);
  for (const file of list) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllMarkdownFiles(filePath));
    } else if (file.endsWith('.md') && !file.startsWith('00_')) {
      results.push(filePath);
    }
  }
  return results;
}

function parsePlanningMeta(filePath: string): PlanningFileMeta {
  const content = fs.readFileSync(filePath, 'utf8');
  const filename = path.basename(filePath);

  const titleMatch = content.match(/^#\s+(.+)$/m) || content.match(/title:\s*"([^"]+)"/);
  const materiaMatch = content.match(/asignatura:\s*"([^"]+)"/) || content.match(/materia:\s*"([^"]+)"/) || content.match(/\*\*Asignatura:\*\*\s*(.+)/);
  const nivelMatch = content.match(/nivel:\s*"([^"]+)"/) || content.match(/\*\*Nivel \/ Fase:\*\*\s*(.+)/);
  const gradoMatch = content.match(/grado:\s*"([^"]+)"/) || content.match(/\*\*Grado:\*\*\s*(.+)/);
  const temaMatch = content.match(/tema:\s*"([^"]+)"/);

  let rawTitle = titleMatch ? titleMatch[1].replace(/^(?:📚\s*)?(?:Proyecto didáctico(?:\s+integral)?|Planeación(?:\s+didáctica)?|Secuencia(?:\s+didáctica)?|Unidad(?:\s+didáctica)?|Tema|Propuesta(?:\s+pedagógica)?):\s*/i, '').trim() : filename.replace(/\.md$/, '');
  let rawMateria = materiaMatch ? materiaMatch[1].trim() : '';
  let rawNivel = nivelMatch ? nivelMatch[1].trim() : '';
  let rawGrado = gradoMatch ? gradoMatch[1].trim() : '';
  let rawTema = temaMatch ? temaMatch[1].trim() : rawTitle;

  const lowerPath = filePath.toLowerCase();
  const lowerNivel = rawNivel.toLowerCase();

  // Nivel y Fase
  let levelKey = 'primaria-baja';
  let fase = 'Fase 3';
  let grade = rawGrado || '1º y 2º Grado';

  if (lowerPath.includes('preescolar') || lowerNivel.includes('preescolar')) {
    levelKey = 'preescolar';
    fase = 'Fase 2';
    grade = rawGrado || 'Preescolar';
  } else if (lowerPath.includes('secundaria') || lowerNivel.includes('secundaria') || lowerPath.includes('fase_6') || lowerPath.includes('14-15')) {
    levelKey = 'secundaria';
    fase = 'Fase 6';
    if (lowerPath.includes('1er_grado') || lowerPath.includes('1_de_secundaria')) grade = '1º de Secundaria';
    else if (lowerPath.includes('2do_grado') || lowerPath.includes('2_de_secundaria')) grade = '2º de Secundaria';
    else if (lowerPath.includes('3er_grado') || lowerPath.includes('3_de_secundaria')) grade = '3º de Secundaria';
    else grade = rawGrado || 'Secundaria';
  } else if (lowerPath.includes('preparatoria') || lowerPath.includes('bachillerato') || lowerNivel.includes('prepa')) {
    levelKey = 'preparatoria';
    fase = 'MCCEMS';
    grade = rawGrado || 'Bachillerato';
  } else if (lowerPath.includes('primaria_fase_5') || lowerPath.includes('primaria_alta') || lowerPath.includes('5to_grado') || lowerPath.includes('6to_grado') || lowerNivel.includes('alta')) {
    levelKey = 'primaria-alta';
    fase = 'Fase 5';
    if (lowerPath.includes('5to_grado') || lowerPath.includes('5_grado')) grade = '5º de Primaria';
    else if (lowerPath.includes('6to_grado') || lowerPath.includes('6_grado')) grade = '6º de Primaria';
    else grade = rawGrado || '5º y 6º Grado';
  } else if (lowerPath.includes('primaria_fase_4') || lowerPath.includes('primaria_media') || lowerPath.includes('3er_grado') || lowerPath.includes('4to_grado') || lowerNivel.includes('media')) {
    levelKey = 'primaria-media';
    fase = 'Fase 4';
    if (lowerPath.includes('3er_grado') || lowerPath.includes('3_de_primaria')) grade = '3º de Primaria';
    else if (lowerPath.includes('4to_grado') || lowerPath.includes('4_de_primaria')) grade = '4º de Primaria';
    else grade = rawGrado || '3º y 4º Grado';
  } else {
    levelKey = 'primaria-baja';
    fase = 'Fase 3';
    if (lowerPath.includes('1er_grado') || lowerPath.includes('1_de_primaria')) grade = '1º de Primaria';
    else if (lowerPath.includes('2do_grado') || lowerPath.includes('2_de_primaria')) grade = '2º de Primaria';
    else grade = rawGrado || '1º y 2º Grado';
  }

  // Materia y Campo Formativo
  let subject = rawMateria;
  if (!subject) {
    if (lowerPath.includes('matematicas')) subject = 'Matemáticas';
    else if (lowerPath.includes('ciencias_naturales') || lowerPath.includes('ciencias') || lowerPath.includes('biologia')) subject = 'Ciencias Naturales';
    else if (lowerPath.includes('fisica')) subject = 'Física';
    else if (lowerPath.includes('quimica')) subject = 'Química';
    else if (lowerPath.includes('historia')) subject = 'Historia';
    else if (lowerPath.includes('geografia')) subject = 'Geografía';
    else if (lowerPath.includes('formacion_civica') || lowerPath.includes('civica')) subject = 'Formación Cívica y Ética';
    else if (lowerPath.includes('espanol') || lowerPath.includes('lenguajes')) subject = 'Español (Lenguajes)';
    else if (lowerPath.includes('artes')) subject = 'Artes';
    else if (lowerPath.includes('ingles')) subject = 'Inglés';
    else if (lowerPath.includes('tutoria') || lowerPath.includes('socioemocional')) subject = 'Tutoría y Educación Socioemocional';
    else if (lowerPath.includes('educacion_fisica') || lowerPath.includes('vida_saludable')) subject = 'Educación Física y Vida Saludable';
    else if (lowerPath.includes('tecnologia')) subject = 'Tecnología';
    else if (lowerPath.includes('entidad')) subject = 'La Entidad donde Vivo';
    else subject = 'Proyectos Comunitarios';
  }

  // Normalizar nombre de asignatura
  const cleanSub = subject.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  let campoFormativo = 'Saberes y Pensamiento Científico';

  if (cleanSub.includes('leng') || cleanSub.includes('esp') || cleanSub.includes('lect') || cleanSub.includes('artes') || cleanSub.includes('ingles')) {
    campoFormativo = 'Lenguajes';
  } else if (cleanSub.includes('etic') || cleanSub.includes('socied') || cleanSub.includes('civic') || cleanSub.includes('hist') || cleanSub.includes('geog') || cleanSub.includes('entidad')) {
    campoFormativo = 'Ética, Naturaleza y Sociedades';
  } else if (cleanSub.includes('humano') || cleanSub.includes('comunit') || cleanSub.includes('fisica') || cleanSub.includes('socioemocional') || cleanSub.includes('vida') || cleanSub.includes('tutoria') || cleanSub.includes('tecnolog')) {
    campoFormativo = 'De lo Humano y lo Comunitario';
  } else {
    campoFormativo = 'Saberes y Pensamiento Científico';
  }

  // Limpiar tema
  let cleanTopic = cleanCoreTopicName(rawTema || rawTitle);
  // Quitar sufijos comunes de variantes
  cleanTopic = cleanTopic.replace(/\s*-\s*Variante\s+\d+.*$/i, '');
  cleanTopic = cleanTopic.replace(/\s*-\s*Modalidad\s+Innovadora\s+\d+.*$/i, '');
  cleanTopic = cleanTopic.replace(/^[🚀📚🔍🎯💡✨]\s*/i, '');
  cleanTopic = cleanTopic.replace(/^(?:Proyecto de Codiseño Comunitario:\s*)/i, '');
  cleanTopic = cleanTopic.trim();

  return {
    filePath,
    filename,
    levelKey,
    fase,
    grade,
    subject,
    campoFormativo,
    topic: rawTitle,
    cleanTopic
  };
}

function buildSanitizedNEMMarkdown(meta: PlanningFileMeta): string {
  const cleanTopic = meta.cleanTopic;
  const project = generateFinalProjectProposal(meta.levelKey, meta.subject, cleanTopic);
  const pdas = getArticulatedPdas(meta.levelKey, meta.subject, cleanTopic);
  const detonatingQuestions = generateDetonatingQuestions(cleanTopic, meta.levelKey, meta.subject);
  const sessions = generateChronometerSessions(meta.levelKey, meta.subject, cleanTopic, 10);
  const formattedDate = formatSpanishDateInLetters(new Date());

  // Encontrar el PDA principal alineado con el campo formativo de la asignatura
  let mainPdaObj = pdas.find(p => {
    const cf = p.campoFormativo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (meta.campoFormativo.includes('Saberes') && cf.includes('saberes')) return true;
    if (meta.campoFormativo.includes('Ética') && (cf.includes('etica') || cf.includes('entidad') || cf.includes('sociedad') || cf.includes('conciencia'))) return true;
    if (meta.campoFormativo.includes('Lenguajes') && (cf.includes('lengua') || cf.includes('espanol') || cf.includes('artes'))) return true;
    if (meta.campoFormativo.includes('Humano') && (cf.includes('humano') || cf.includes('comunitario') || cf.includes('socioemocional'))) return true;
    return false;
  }) || pdas[0];

  const mainPdaText = mainPdaObj?.pda || `Aplica los contenidos y saberes fundamentales vinculados a "${cleanTopic}" mediante la indagación comunitaria y el pensamiento crítico.`;

  // Reordenar transversales para que el principal esté bien destacado y los otros 3 articulen
  const crossPdas = pdas.filter(p => p !== mainPdaObj);

  const tagLevel = meta.levelKey.replace(/-/g, '_');
  const tagSubject = meta.subject.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
  const tagGrade = meta.grade.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');

  let md = `---
tags: [iskool, planeacion_nem, segundo_cerebro, boveda_curricular, nivel_${tagLevel}, materia_${tagSubject}, grado_${tagGrade}]
docente: "Prof. Israel López Ángeles"
nivel: "${meta.levelKey}"
fase_nem: "${meta.fase}"
grado: "${meta.grade}"
asignatura: "${meta.subject}"
campo_formativo: "${meta.campoFormativo}"
tema: "${cleanTopic}"
duracion: "10 sesiones de 50 minutos (Total: 500 min / 2 semanas lectivas)"
ejes_articuladores: ["Pensamiento Crítico", "Inclusión", "Vida Saludable", "Apropiación de las Culturas a través de la Lectura y la Escritura"]
producto_integrador: "${project.productoFinal}"
fecha_elaboracion: "${formattedDate}"
created_at: "${formattedDate}"
updated_at: "${formattedDate}"
---

# 📚 Proyecto Didáctico Integral: ${cleanTopic}

> **Docente Titular:** [[Prof_Israel_Lopez_Angeles|Prof. Israel López Ángeles]]  
> **Nivel y Fase:** ${meta.levelKey.toUpperCase()} • ${meta.fase} (${meta.grade})  
> **Campo Formativo:** ${meta.campoFormativo}  
> **Asignatura:** ${meta.subject}  
> **Temporalidad:** 10 sesiones de 50 minutos (Total: 500 min / 2 semanas lectivas)  
> **Producto Central Integrador:** *${project.productoFinal}*  
> **Índice Curricular:** [[00_Indice_Maestro_Boveda_Curricular|Bóveda Curricular Central]]  

---

## 🎯 I. Proceso de Desarrollo de Aprendizaje (PDA Principal)

\`\`\`yaml
PDA: "${mainPdaText}"
\`\`\`

### 🔗 Articulación Curricular con otros Campos Formativos:
${crossPdas.map((p, idx) => `**${idx + 1}. ${p.campoFormativo}:**\n- *PDA:* ${p.pda}\n- *Vínculo formativo:* ${p.relacion}`).join('\n\n')}

---

## 🏘️ II. Diagnóstico Comunitario y Propuesta de Proyecto Integrador

**Problemática Situada:**  
${project.problematicaComunitaria}

**Propósito del Proyecto:**  
${project.proposito}

**Impacto Social y Transformador:**  
${project.impactoSocial}

---

## ❓ III. Preguntas Detonadoras para el Salón (Apertura y Conflicto Cognitivo)
${detonatingQuestions.map((q, idx) => `${idx + 1}. ${q}`).join('\n')}

---

## 📅 IV. Secuencia Didáctica Completa (Dosificación en 10 Bloques de 50 Minutos)

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

## 📊 V. Rúbrica Analítica Formativa de Evaluación (NEM 2024)

| Criterio Pedagógico | Nivel Sobresaliente (3 pts) | Nivel Satisfactorio (2 pts) | Nivel En Proceso (1 pt) |
| :--- | :--- | :--- | :--- |
| **${project.rubrica.criterio1.nombre}** | ${project.rubrica.criterio1.sobresaliente} | ${project.rubrica.criterio1.satisfactorio} | ${project.rubrica.criterio1.enProceso} |
| **${project.rubrica.criterio2.nombre}** | ${project.rubrica.criterio2.sobresaliente} | ${project.rubrica.criterio2.satisfactorio} | ${project.rubrica.criterio2.enProceso} |
| **${project.rubrica.criterio3.nombre}** | ${project.rubrica.criterio3.sobresaliente} | ${project.rubrica.criterio3.satisfactorio} | ${project.rubrica.criterio3.enProceso} |

---

## 🛠️ VI. Recursos y Materiales Didácticos
- Libros de Texto Gratuitos Oficiales de la SEP asignados con páginas específicas y dinámicas formativas.
- Materiales manipulables y de indagación comunitaria.
- Evidencia final del proyecto: **${project.productoFinal}**.

---
*Documento Curricular Oficial generado para ISkool • Bóveda Central de Conocimiento.*
`;

  return md;
}

function buildMasterIndexMarkdown(metas: PlanningFileMeta[]): string {
  const formattedDate = formatSpanishDateInLetters(new Date());

  // Agrupar por fase y materia
  const byFase: Record<string, PlanningFileMeta[]> = {};
  for (const m of metas) {
    const f = m.fase || 'Otras Fases';
    if (!byFase[f]) byFase[f] = [];
    byFase[f].push(m);
  }

  let moc = `---
tags: [iskool, indice_maestro, moc, segundo_cerebro, boveda_curricular]
titulo: "Índice Maestro de Nodos Curriculares NEM 2024"
docente: "Prof. Israel López Ángeles"
total_planeaciones: ${metas.length}
fecha_actualizacion: "${formattedDate}"
---

# 🗺️ Índice Maestro de la Bóveda Curricular (NEM 2024)
**Super Usuario Creador:** [[Prof_Israel_Lopez_Angeles|Prof. Israel López Ángeles]]  
**Institución:** Plataforma Educativa ISkool  
**Total de Nodos Curriculares Saneados:** ${metas.length} Planeaciones Oficiales  
**Última Actualización:** ${formattedDate}  

Este nodo actúa como el **Centro de Enlace (Map of Content - MOC)** y Segundo Cerebro de la Bóveda Curricular, estructurando y vinculando mediante enlaces bidireccionales cada una de las planeaciones didácticas bajo la **Nueva Escuela Mexicana (NEM 2024)** con dosificación exacta de **50 minutos**, libros de texto de la SEP verificados y rúbricas analíticas formativas.

---

## 📊 Resumen de Nodos por Fase Curricular

| Fase NEM | Nivel Educativo | Nodos Curriculares | Dosificación |
| :--- | :--- | :---: | :---: |
`;

  for (const [faseName, list] of Object.entries(byFase)) {
    moc += `| **${faseName}** | ${list[0]?.levelKey || 'NEM'} | ${list.length} | 10 Bloques de 50 min |\n`;
  }

  moc += `\n---\n\n## 📚 Directorio de Nodos Curriculares\n\n`;

  for (const [faseName, list] of Object.entries(byFase)) {
    moc += `### 🏷️ ${faseName} (${list.length} Nodos)\n\n`;
    for (const item of list) {
      const filenameNoExt = item.filename.replace(/\.md$/, '');
      moc += `- [[${filenameNoExt}|${item.cleanTopic}]] — *${item.subject} (${item.grade})*\n`;
    }
    moc += `\n`;
  }

  moc += `\n---\n*Índice Maestro generado automáticamente por ISkool • Bóveda Central de Conocimiento.* \n`;
  return moc;
}

async function runSanitization() {
  console.log("================================================================================");
  console.log("🌿 INICIANDO SANEAMIENTO PEDAGÓGICO UNIVERSAL DE LA BÓVEDA CURRICULAR (NEM 2024)");
  console.log("================================================================================");

  const localFiles = getAllMarkdownFiles(LOCAL_PLANNINGS_DIR);
  console.log(`📁 Archivos encontrados en repositorio local: ${localFiles.length}`);

  let externalFiles: string[] = [];
  if (fs.existsSync(EXTERNAL_VAULT_DIR)) {
    externalFiles = getAllMarkdownFiles(EXTERNAL_VAULT_DIR);
    console.log(`📁 Archivos encontrados en bóveda externa: ${externalFiles.length}`);
  }

  // Parsear y procesar todos los archivos locales
  const processedMetas: PlanningFileMeta[] = [];
  let updatedCount = 0;

  for (const filePath of localFiles) {
    try {
      const meta = parsePlanningMeta(filePath);
      const newContent = buildSanitizedNEMMarkdown(meta);

      // Escribir en repositorio local
      fs.writeFileSync(filePath, newContent, 'utf8');

      // Si existe el directorio externo, escribirlo también allí en la ruta equivalente
      const relPath = path.relative(LOCAL_PLANNINGS_DIR, filePath);
      if (fs.existsSync(EXTERNAL_VAULT_DIR)) {
        const extPath = path.join(EXTERNAL_VAULT_DIR, relPath);
        const extDir = path.dirname(extPath);
        if (!fs.existsSync(extDir)) fs.mkdirSync(extDir, { recursive: true });
        fs.writeFileSync(extPath, newContent, 'utf8');
      }

      processedMetas.push(meta);
      updatedCount++;

      if (updatedCount % 50 === 0 || updatedCount === localFiles.length) {
        console.log(`✅ Procesadas y saneadas ${updatedCount}/${localFiles.length} planeaciones...`);
      }
    } catch (err: any) {
      console.error(`❌ Error procesando archivo ${filePath}:`, err?.message || err);
    }
  }

  // Generar y actualizar el Índice Maestro MOC
  console.log("🗺️ Generando Índice Maestro (00_Indice_Maestro_Boveda_Curricular.md)...");
  const masterIndexContent = buildMasterIndexMarkdown(processedMetas);

  const localMocPath = path.join(LOCAL_PLANNINGS_DIR, '00_Indice_Maestro_Boveda_Curricular.md');
  fs.writeFileSync(localMocPath, masterIndexContent, 'utf8');

  if (fs.existsSync(EXTERNAL_VAULT_DIR)) {
    const extMocPath = path.join(EXTERNAL_VAULT_DIR, '00_Indice_Maestro_Boveda_Curricular.md');
    fs.writeFileSync(extMocPath, masterIndexContent, 'utf8');
  }

  console.log("================================================================================");
  console.log(`🎉 SANEAMIENTO COMPLETADO CON ÉXITO: ${updatedCount} planeaciones 100% saneadas.`);
  console.log("================================================================================");
}

runSanitization().catch(console.error);
