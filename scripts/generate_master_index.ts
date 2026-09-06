import fs from 'fs';
import path from 'path';

const VAULT_BASE = 'C:\\Users\\kami-\\Desktop\\2025-2026\\iskool\\obsidean\\brain\\iskool\\planeaciones\\Secundaria';

export function buildMasterIndex() {
  console.log(`🗺️ Construyendo Índice Maestro de Nodos Curriculares de Secundaria...`);

  // Scan all .md files recursively in Secundaria
  function getFiles(dir: string): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(getFiles(fullPath));
      } else if (file.endsWith('.md') && !file.startsWith('00_')) {
        results.push(fullPath);
      }
    });
    return results;
  }

  const files = getFiles(VAULT_BASE);
  console.log(`Total de nodos encontrados: ${files.length}`);

  interface ParsedNode {
    relPath: string;
    fileNameNoExt: string;
    title: string;
    campo: string;
    materia: string;
    grado: string;
    tema: string;
    duracion: string;
    pda: string;
  }

  const nodes: ParsedNode[] = [];

  for (const f of files) {
    const content = fs.readFileSync(f, 'utf8');
    const relPath = path.relative(VAULT_BASE, f).replace(/\\/g, '/');
    const fileNameNoExt = path.basename(f, '.md');

    const campoMatch = content.match(/campo_formativo:\s*"([^"]+)"/);
    const materiaMatch = content.match(/materia:\s*"([^"]+)"/);
    const gradoMatch = content.match(/grado:\s*"([^"]+)"/);
    const temaMatch = content.match(/tema:\s*"([^"]+)"/);
    const titleMatch = content.match(/#\s+(.+)/);
    const duracionMatch = content.match(/- \*\*Duración Estimada:\*\*\s*(.+)/);
    const pdaMatch = content.match(/## 🎯 I\. Proceso de Desarrollo de Aprendizaje \(PDA\)\s+>\s+\*\*([^\*]+)\*\*/);

    nodes.push({
      relPath,
      fileNameNoExt,
      title: titleMatch ? titleMatch[1].trim() : fileNameNoExt,
      campo: campoMatch ? campoMatch[1].trim() : 'General',
      materia: materiaMatch ? materiaMatch[1].trim() : 'General',
      grado: gradoMatch ? gradoMatch[1].trim() : 'Secundaria',
      tema: temaMatch ? temaMatch[1].trim() : '',
      duracion: duracionMatch ? duracionMatch[1].trim() : '2 sesiones de 50 minutos',
      pda: pdaMatch ? pdaMatch[1].trim() : ''
    });
  }

  // Agrupar por Campo Formativo y Materia
  const camposOrder = [
    'Lenguajes',
    'Saberes y Pensamiento Científico',
    'Etica, Naturaleza y Sociedades',
    'De lo Humano y lo Comunitario'
  ];

  let indexMarkdown = `---
tags: [iskool, indice_maestro, moc, segundo_cerebro, fase6_secundaria]
titulo: "Mapa de Nodos Curriculares: Secundaria NEM 2022"
docente: "Prof. Israel López Ángeles"
total_planeaciones: ${nodes.length}
fecha_actualizacion: "${new Date().toISOString()}"
---

# 🗺️ Mapa de Nodos Curriculares: Secundaria NEM 2022 (Fase 6)
**Super Usuario Creador:** Prof. Israel López Ángeles  
**Institución:** Colegio Anglo Mexicano / Plataforma ISkool  
**Total de Nodos Curriculares:** ${nodes.length} Planeaciones Especializadas  

Este nodo actúa como el **Centro de Enlace (Map of Content - MOC)** y Segundo Cerebro de la Bóveda de Obsidian, estructurando y vinculando mediante enlaces bidireccionales cada una de las planeaciones didácticas de Secundaria bajo la **Nueva Escuela Mexicana (NEM 2022)** con dosificación exacta de **50 minutos**.

---

## 📊 Resumen Ejecutivo del Ecosistema Curricular

| Campo Formativo | Asignaturas Vinculadas | Nodos Activos | Dosificación |
| :--- | :--- | :---: | :---: |
| **🗣️ Lenguajes** | Español, Inglés, Artes | ${nodes.filter(n => n.campo.includes('Lenguajes')).length} | Bloques de 50 min |
| **🧬 Saberes y Pensamiento Científico** | Matemáticas, Biología, Física, Química | ${nodes.filter(n => n.campo.includes('Saberes')).length} | Bloques de 50 min |
| **🌍 Ética, Naturaleza y Sociedades** | Geografía, Historia, Formación Cívica y Ética | ${nodes.filter(n => n.campo.includes('Etica') || n.campo.includes('Ética')).length} | Bloques de 50 min |
| **🤝 De lo Humano y lo Comunitario** | Tecnología, Educación Física, Tutoría Socioemocional | ${nodes.filter(n => n.campo.includes('Humano')).length} | Bloques de 50 min |
| **TOTAL** | **13 Asignaturas de Secundaria** | **${nodes.length} Nodos** | **100% Cobertura NEM** |

---
`;

  for (const campo of camposOrder) {
    const campoNodes = nodes.filter(n => n.campo.toLowerCase().includes(campo.toLowerCase().substring(0, 5)));
    const icon = campo.includes('Lenguajes') ? '🗣️' : campo.includes('Saberes') ? '🧬' : campo.includes('Etica') ? '🌍' : '🤝';

    indexMarkdown += `\n## ${icon} Campo Formativo: ${campo}\n\n`;

    // Agrupar por materia dentro del campo
    const materias = Array.from(new Set(campoNodes.map(n => n.materia)));
    for (const mat of materias) {
      indexMarkdown += `### 📖 ${mat}\n\n`;
      const matNodes = campoNodes.filter(n => n.materia === mat);

      for (const node of matNodes) {
        indexMarkdown += `- **${node.grado}:** [[${node.relPath.replace(/\.md$/, '')}|${node.title}]]  \n`;
        indexMarkdown += `  - *Tema:* ${node.tema}  \n`;
        indexMarkdown += `  - *Duración:* ${node.duracion}  \n`;
        if (node.pda) {
          indexMarkdown += `  - *PDA:* \`${node.pda.substring(0, 110)}...\`  \n`;
        }
        indexMarkdown += `\n`;
      }
    }
  }

  indexMarkdown += `\n---
## 🌐 Conexiones en el Grafo del Segundo Cerebro
- [[3_de_Secundaria_Fase_6_14-15_anos/General/Matematicas/Planeacion_Modelado_y_Exploracion_Geometrica_de_Funciones_Cuadraticas_y_Parabolas_y_ax_bx_c_1787024824495|Planeación: Parábolas y Funciones Cuadráticas (3º Secundaria)]]
- Tags Globales: #fase6_secundaria #iskool #planeacion_nem #segundo_cerebro

*Estructura validada y sincronizada para el portal docente de ISkool & Obsidian Vault.*
`;

  const masterIndexPath = path.join(VAULT_BASE, '00_Indice_Maestro_Secundaria_NEM.md');
  fs.writeFileSync(masterIndexPath, indexMarkdown, 'utf8');
  console.log(`⭐ Índice Maestro Actualizado con ${nodes.length} nodos: ${masterIndexPath}`);
}

buildMasterIndex();
