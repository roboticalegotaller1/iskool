import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';

const OBSIDIAN_VAULT_PATH = 'C:\\Users\\kami-\\Desktop\\2025-2026\\iskool\\obsidean\\brain\\iskool';
const VAULT_PLANNINGS = path.join(OBSIDIAN_VAULT_PATH, 'planeaciones');

function getAllMarkdownFiles(dirPath: string): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dirPath)) return results;
  const list = fs.readdirSync(dirPath);
  for (const file of list) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllMarkdownFiles(filePath));
    } else if (file.endsWith('.md')) {
      results.push(filePath);
    }
  }
  return results;
}

async function searchQuadraticTopic() {
  console.log('🔍 Iniciando medición de búsqueda para "x^{2}" / "x^2" / "x²" en la bóveda de Obsidian...');
  console.log(`📂 Ruta: ${VAULT_PLANNINGS}\n`);

  // Medición 1: Recolección y escaneo completo en disco
  const startDisk = performance.now();
  const allFiles = getAllMarkdownFiles(VAULT_PLANNINGS);
  const diskCollectTime = performance.now() - startDisk;
  console.log(`📊 Total de archivos Markdown encontrados: ${allFiles.length} (indexados en ${diskCollectTime.toFixed(2)} ms)`);

  const startSearch = performance.now();
  
  const matches: { filePath: string; filename: string; title: string; pda: string; grado: string; materia: string; serie?: string }[] = [];

  // Búsqueda de patrones: x^{2}, x^2, x2, x², cuadrática, etc.
  const searchRegex = /(?:x\^\{?2\}?|x²|Ax\^?2|cuadratic|ecuaciones cuadráticas|progresión cuadrática|variación cuadrática)/i;

  for (const filePath of allFiles) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (searchRegex.test(content)) {
      const filename = path.basename(filePath);
      const titleMatch = content.match(/^tema:\s*"?(.*?)"?$/m) || content.match(/^title:\s*"?(.*?)"?$/m) || content.match(/^#\s*(?:📚\s*)?(?:🚀\s*)?(?:Proyecto Didáctico Integral:\s*)?(?:Proyecto de Codiseño Comunitario:\s*)?(.*)$/m);
      const title = titleMatch ? titleMatch[1].trim() : filename;

      const pdaMatch = content.match(/## 🎯 (?:I\.\s*)?Proceso de Desarrollo de Aprendizaje[\s\S]*?>\s*\*\*"?([\s\S]*?)"?\*\*/);
      const pda = pdaMatch ? pdaMatch[1].trim() : '';

      const gradoMatch = content.match(/^grado:\s*"?(.*?)"?$/m);
      const materiaMatch = content.match(/^materia:\s*"?(.*?)"?$/m);
      const serieMatch = content.match(/^serie:\s*"?(.*?)"?$/m);

      matches.push({
        filePath,
        filename,
        title,
        pda,
        grado: gradoMatch ? gradoMatch[1] : '',
        materia: materiaMatch ? materiaMatch[1] : '',
        serie: serieMatch ? serieMatch[1] : 'Serie 1'
      });
    }
  }

  const searchTime = performance.now() - startSearch;
  const totalTime = performance.now() - startDisk;

  console.log(`\n⏱️ TIEMPO DE BÚSQUEDA EXHAUSTIVA SOBRE ${allFiles.length} ARCHIVOS:`);
  console.log(`   ⚡ Tiempo de escaneo y lectura de contenido: ${searchTime.toFixed(2)} ms (${(searchTime / 1000).toFixed(3)} segundos)`);
  console.log(`   ⚡ Tiempo total con I/O de disco completo: ${totalTime.toFixed(2)} ms (${(totalTime / 1000).toFixed(3)} segundos)`);

  console.log(`\n📌 RESULTADOS ENCONTRADOS:`);
  console.log(`   🎯 Total de planeaciones con el tema "x²" / "x^{2}" / Cuadráticas: ${matches.length}`);

  // Agrupación por Títulos Únicos y Variantes
  const uniqueTitles = new Map<string, number>();
  for (const m of matches) {
    const count = uniqueTitles.get(m.title) || 0;
    uniqueTitles.set(m.title, count + 1);
  }

  console.log(`\n📋 LISTA DE TÍTULOS CURRICULARES Y TOTAL DE VARIANTES:`);
  let idx = 1;
  for (const [title, count] of uniqueTitles.entries()) {
    console.log(`   ${idx}. "${title}" → ${count} planeaciones generadas`);
    idx++;
  }

  // Muestra de archivos concretos
  console.log(`\n🔍 MUESTRA DE LAS PRIMERAS 10 PLANEACIONES INDIVIDUALES:`);
  matches.slice(0, 10).forEach((m, i) => {
    console.log(`   ${i + 1}. [${m.grado} - ${m.materia}] ${m.filename}`);
    if (m.pda) console.log(`      PDA: ${m.pda.substring(0, 110)}...`);
  });

  // Medición 2: Búsqueda vía Endpoint API en memoria de ISkool
  console.log(`\n🌐 Probando consulta a la API de ISkool (/api/obsidian?q=ecuaciones cuadraticas)...`);
  try {
    const apiStart = performance.now();
    const res = await fetch('http://localhost:3000/api/obsidian?q=' + encodeURIComponent('ecuaciones cuadraticas'), {
      headers: {
        'x-user-id': 'usr-teacher-israel',
        'x-user-role': 'teacher'
      }
    });
    const apiData = await res.json();
    const apiTime = performance.now() - apiStart;
    console.log(`   ⚡ Tiempo de respuesta API ISkool: ${apiTime.toFixed(2)} ms`);
    console.log(`   ✅ Encontrado en API: ${apiData.found} | Archivo: ${apiData.filename} | Título: ${apiData.planning?.title}`);
  } catch (err: any) {
    console.warn(`   Aviso API:`, err.message);
  }
}

searchQuadraticTopic().catch(console.error);
