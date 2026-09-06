import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { lenguajesF6Data, NodeMetadataF6 } from './fase6_data_lenguajes';
import { saberesF6Data } from './fase6_data_saberes';
import { eticaF6Data } from './fase6_data_etica';
import { humanoF6Data } from './fase6_data_humano';

const ALL_F6_PLANNINGS: NodeMetadataF6[] = [
  ...lenguajesF6Data,
  ...saberesF6Data,
  ...eticaF6Data,
  ...humanoF6Data
];

const OBSIDIAN_VAULT_ROOT = 'C:\\Users\\kami-\\Desktop\\2025-2026\\iskool\\obsidean\\brain\\iskool';
const TARGET_DIR = path.join(OBSIDIAN_VAULT_ROOT, 'planeaciones', 'Secundaria_Fase_6_NEM2024');

function getSpanishDateInLetters(date: Date = new Date()): string {
  const day = date.getDate();
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  return `${day} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
}

function sanitizeFilename(name: string): string {
  return name
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 110);
}

function generateMarkdownContent(node: NodeMetadataF6): string {
  const sanitizeTitle = sanitizeFilename(node.tituloProyecto);
  const nowStr = getSpanishDateInLetters();

  return `---
id: "${node.id}"
folio: "SEC-F6-T${String(node.temaNum).padStart(3, '0')}"
title: "${node.tituloProyecto}"
tema_numero: ${node.temaNum}
tema_titulo: "${node.temaTitulo}"
nivel: "Secundaria"
fase: "Fase 6"
grado: "${node.gradoDisplay}"
campo_formativo: "${node.campo}"
disciplina: "${node.materia}"
profesor: "Prof. Israel López Ángeles"
profesor_id: "usr-teacher-1"
profesor_email: "israel.lopez@iskool.edu.mx"
ciclo_escolar: "2025-2026"
temporalidad: "2 semanas (10 sesiones de 50 min)"
metodologia_nem: "${node.campo === 'Lenguajes' ? 'Aprendizaje Basado en Proyectos Comunitarios' : node.campo === 'Saberes y Pensamiento Científico' ? 'Aprendizaje Basado en Indagación (STEAM)' : node.campo === 'Ética, Naturaleza y Sociedades' ? 'Aprendizaje Basado en Problemas (ABP)' : 'Aprendizaje Servicio (AS)'}"
ejes_articuladores:
${node.ejes.map(e => `  - "[[${e}]]"`).join('\n')}
tags:
  - planeacion_docente
  - iskool
  - secundaria_fase6
  - nem_2024
  - ${node.campoTag}
  - ${node.materia.toLowerCase().replace(/[^a-z0-9]/g, '_')}
created_at: "${nowStr}"
updated_at: "${nowStr}"
synced_iskool_db: true
---

# Planeación Didáctica: ${node.tituloProyecto}

> [!INFO] Ficha Técnica y Curricular (NEM 2024 - Fase 6)
> - **Docente Titular:** [[Prof. Israel López Ángeles]] (\`usr-teacher-1\`)
> - **Nivel y Fase:** Educación Secundaria — [[Fase 6 (1º, 2º y 3º de Secundaria)]]
> - **Grado:** **${node.gradoDisplay}**
> - **Campo Formativo:** [[${node.campo}]]
> - **Disciplina / Materia:** [[${node.materia}]]
> - **Contenido Sintético Oficial SEP 2024:** *${node.temaTitulo}*
> - **MOC General:** [[00_Indice_Maestro_Secundaria_Fase6_NEM2024]]

---

## 🎯 Proceso de Desarrollo de Aprendizaje (PDA Oficial SEP 2024)
\`\`\`text
${node.pda}
\`\`\`

---

## ❓ Preguntas Detonadoras e Indagación Crítica
${node.detonadoras.map(d => `- **${d}**`).join('\n')}

---

## 📋 Secuencia Didáctica Detallada (10 Sesiones de 50 Minutos)

\`\`\`mermaid
graph LR
  A[Fase 1: Indagación y Saberes Previos] --> B[Fase 2: Experimentación y Modelado]
  B --> C[Fase 3: Prototipado y Análisis Crítico]
  C --> D[Fase 4: Comunicación y Evaluación Auténtica]
\`\`\`

### 🚀 Sesiones 1 y 2: Indagación, Diagnóstico y Recuperación de Saberes
- **Inicio (15 min):** ${node.inicioDetalle}
- **Desarrollo (30 min):** Planteamiento del reto integrador, conformación de equipos colaborativos y delimitación del alcance del proyecto.
- **Cierre (5 min):** Registro en la bitácora individual de metas de aprendizaje.

### 🔬 Sesiones 3 a 7: Desarrollo Metodológico, Trabajo Experimental y Producción
- **Inicio (10 min):** Reactivación de compromisos y revisión del cronograma de trabajo.
- **Desarrollo (35 min):** ${node.desarrolloDetalle}
- **Cierre (5 min):** Coevaluación intermedia mediante lista de cotejo y retroalimentación entre pares.

### 🏁 Sesiones 8 a 10: Integración, Socialización Comunitaria y Evaluación
- **Inicio (10 min):** Ensayos de presentación y ajuste final de entregables.
- **Desarrollo (30 min):** ${node.cierreDetalle}
- **Cierre (10 min):** Metacognición grupal, balance de impacto social y firma del acta de entrega de proyectos.

---

## 📊 Rúbrica Analítica de Evaluación Formativa y Auténtica

| Nivel de Desempeño | Criterios Curriculares y Evidencias Observables | Ponderación |
| :--- | :--- | :---: |
| **Excelente (10)** | ${node.evaluacionCriterios[0]} con fundamentación teórica sólida, rigurosa y aplicación práctica contextualizada. | 40% |
| **Satisfactorio (8-9)** | ${node.evaluacionCriterios[1]} de manera autónoma, estructurada y con calidad metodológica. | 35% |
| **En Proceso (6-7)** | ${node.evaluacionCriterios[2]} con apoyo docente y áreas de mejora identificadas. | 25% |

---

## 📦 Materiales, Recursos Didácticos y Entregable Final

- **Materiales y Recursos:** ${node.materiales}
- **Entregable Principal:** \`${node.entregable}\`
- **Instrumentos de Evaluación:** Rúbrica analítica, bitácora de coevaluación entre pares, lista de verificación de entregables.

---

## 🔗 Enlaces Bidireccionales (Obsidian Knowledge Graph)
- [[00_Indice_Maestro_Secundaria_Fase6_NEM2024]]
- [[${node.campo}]]
- [[${node.materia}]]
- [[Secundaria_${node.grado}]]
- [[Prof_Israel_Lopez_Angeles]]
`;
}

function generateMasterIndex(plannings: NodeMetadataF6[]): string {
  const nowStr = getSpanishDateInLetters();

  const lenguajes = plannings.filter(p => p.campo === 'Lenguajes');
  const saberes = plannings.filter(p => p.campo === 'Saberes y Pensamiento Científico');
  const etica = plannings.filter(p => p.campo === 'Ética, Naturaleza y Sociedades');
  const humano = plannings.filter(p => p.campo === 'De lo Humano y lo Comunitario');

  const renderSection = (title: string, list: NodeMetadataF6[]) => {
    return `### ${title} (${list.length} Planeaciones Didácticas)

| Tema | Grado | Disciplina | Título del Proyecto | Archivo Obsidian |
| :---: | :---: | :---: | :--- | :--- |
${list.map(p => {
  const filename = `T${String(p.temaNum).padStart(3, '0')}_${p.materia.replace(/[^a-zA-Z0-9]/g, '')}_${sanitizeFilename(p.tituloProyecto)}`;
  return `| ${p.temaNum} | ${p.gradoDisplay} | ${p.materia} | **${p.tituloProyecto}** | [[${filename}]] |`;
}).join('\n')}
`;
  };

  return `---
id: "moc-secundaria-fase6-nem2024"
title: "Índice Maestro MOC - Planeaciones Fase 6 Secundaria (NEM 2024)"
fase: "Fase 6"
nivel: "Educación Secundaria (1º, 2º y 3º)"
total_planeaciones: ${plannings.length}
profesor_titular: "Prof. Israel López Ángeles"
profesor_id: "usr-teacher-1"
ciclo_escolar: "2025-2026"
created_at: "${nowStr}"
updated_at: "${nowStr}"
tags:
  - moc
  - indice_maestro
  - iskool
  - secundaria_fase6
  - nem_2024
---

# 📚 Índice Maestro (MOC): Planeaciones Didácticas Fase 6 Secundaria (NEM 2024)

> [!NOTE] Metadatos del Repositorio Curricular
> - **Total de Planeaciones:** **${plannings.length} Planeaciones Didácticas Nuevas** (50 por Campo Formativo).
> - **Docente Responsable:** [[Prof. Israel López Ángeles]] (\`usr-teacher-1\`).
> - **Documento Base Oficial:** *PROGRAMA DE ESTUDIO PARA LA EDUCACIÓN SECUNDARIA: PROGRAMA SINTÉTICO DE LA FASE 6 (SEP 2024)*.
> - **Grados Cubiertos:** 1º, 2º y 3º de Secundaria en todas sus disciplinas formativas.

---

## 🗺️ Mapa de Campos Formativos (Fase 6)

\`\`\`mermaid
mindmap
  root((Fase 6: Secundaria))
    Lenguajes (50)
      Español (1º, 2º, 3º)
      Inglés (1º, 2º, 3º)
      Artes Visuales y Teatro
    Saberes y Pensamiento Científico (50)
      Matemáticas (1º, 2º, 3º)
      Biología (1º)
      Física (2º)
      Química (3º)
    Ética, Naturaleza y Sociedades (50)
      Geografía (1º)
      Historia (1º, 2º, 3º)
      Formación Cívica y Ética (1º, 2º, 3º)
    De lo Humano y lo Comunitario (50)
      Tecnología (1º, 2º, 3º)
      Tutoría y Socioemocional (1º, 2º, 3º)
      Educación Física (1º, 2º, 3º)
\`\`\`

---

## 📑 Catálogo de Planeaciones por Campo Formativo

${renderSection('1. 📖 Lenguajes', lenguajes)}

---

${renderSection('2. 🔬 Saberes y Pensamiento Científico', saberes)}

---

${renderSection('3. ⚖️ Ética, Naturaleza y Sociedades', etica)}

---

${renderSection('4. 🤝 De lo Humano y lo Comunitario', humano)}

---

## 📌 Enlaces Curriculares y MOCs Relacionados
- [[00_Indice_Maestro_Primaria_Fase4_NEM]]
- [[00_Indice_Maestro_Primaria_Fase5_NEM]]
- [[Prof_Israel_Lopez_Angeles]]
- [[ISkool_Core_System]]
`;
}

function run() {
  console.log(`[Fase 6 Generator] Total plannings to generate: ${ALL_F6_PLANNINGS.length}`);

  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }

  let generatedCount = 0;

  for (const node of ALL_F6_PLANNINGS) {
    const subfolder = path.join(TARGET_DIR, node.grado, node.materiaFolder);
    if (!fs.existsSync(subfolder)) {
      fs.mkdirSync(subfolder, { recursive: true });
    }

    const filename = `T${String(node.temaNum).padStart(3, '0')}_${node.materia.replace(/[^a-zA-Z0-9]/g, '')}_${sanitizeFilename(node.tituloProyecto)}.md`;
    const filePath = path.join(subfolder, filename);
    const content = generateMarkdownContent(node);

    fs.writeFileSync(filePath, content, 'utf-8');
    generatedCount++;
  }

  // Generate Master Index
  const masterIndexPath = path.join(TARGET_DIR, '00_Indice_Maestro_Secundaria_Fase6_NEM2024.md');
  const masterIndexContent = generateMasterIndex(ALL_F6_PLANNINGS);
  fs.writeFileSync(masterIndexPath, masterIndexContent, 'utf-8');

  console.log(`[Fase 6 Generator] Successfully wrote ${generatedCount} planning files + Master MOC.`);

  // Git operations in Obsidian vault
  try {
    console.log('[Git Sync] Staging changes in Obsidian vault...');
    execSync('git add planeaciones/Secundaria_Fase_6_NEM2024', {
      cwd: OBSIDIAN_VAULT_ROOT,
      stdio: 'inherit'
    });

    const status = execSync('git status --porcelain', {
      cwd: OBSIDIAN_VAULT_ROOT,
      encoding: 'utf-8'
    });

    if (status.trim().length > 0) {
      console.log('[Git Sync] Committing changes...');
      execSync('git commit -m "feat(fase6): 200 new high-rigor plannings (50 per Campo) for Prof. Israel Lopez Angeles - SEP NEM 2024"', {
        cwd: OBSIDIAN_VAULT_ROOT,
        stdio: 'inherit'
      });

      console.log('[Git Sync] Pushing to remote repository...');
      execSync('git push origin main', {
        cwd: OBSIDIAN_VAULT_ROOT,
        stdio: 'inherit'
      });
      console.log('[Git Sync] Obsidian vault remote push SUCCESSFUL!');
    } else {
      console.log('[Git Sync] Obsidian vault already up to date.');
    }
  } catch (err: any) {
    console.error('[Git Sync Error]', err.message);
  }
}

run();
