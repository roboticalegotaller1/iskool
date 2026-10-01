import fs from 'fs';
import path from 'path';
import { 
  parseHistoricalMarkdown, 
  serializeHistoricalToMarkdown, 
  normalizeQuestionText 
} from '../src/lib/historicalVaultEngine';
import { villaQAs } from './data/villa_qa';
import { josefaQAs } from './data/josefa_qa';
import { hidalgoQAs } from './data/hidalgo_qa';
import { queretaroQAs } from './data/queretaro_qa';

interface QAPair {
  question: string;
  answer: string;
}

export function mergeQaIntoFile(filePath: string, newQas: QAPair[]): { added: number; total: number } {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File does not exist: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const slug = path.basename(filePath, '.md');
  const parsed = parseHistoricalMarkdown(raw, slug);

  if (!parsed.qaCache) parsed.qaCache = [];

  let added = 0;
  for (const item of newQas) {
    const qClean = item.question.trim();
    const aClean = item.answer.trim();
    if (!qClean || !aClean) continue;

    const normTarget = normalizeQuestionText(qClean);
    const existingIdx = parsed.qaCache.findIndex(i => normalizeQuestionText(i.question) === normTarget);

    if (existingIdx !== -1) {
      parsed.qaCache[existingIdx].question = qClean;
      parsed.qaCache[existingIdx].answer = aClean;
      parsed.qaCache[existingIdx].timestamp = Date.now();
      added++;
    } else {
      parsed.qaCache.push({
        question: qClean,
        answer: aClean,
        timestamp: Date.now()
      });
      added++;
    }
  }

  const serialized = serializeHistoricalToMarkdown(parsed, slug);
  fs.writeFileSync(filePath, serialized, 'utf8');

  return { added, total: parsed.qaCache.length };
}

export function runPopulation() {
  const root = path.resolve(__dirname, '..');
  const dir = path.join(root, 'personajes_historicos');

  const targets = [
    { file: path.join(dir, 'francisco_villa.md'), qas: villaQAs, name: 'Francisco Villa' },
    { file: path.join(dir, 'josefa_ortiz_de_dominguez.md'), qas: josefaQAs, name: 'Josefa Ortiz de Domínguez' },
    { file: path.join(dir, 'miguel_hidalgo_y_costilla.md'), qas: hidalgoQAs, name: 'Miguel Hidalgo y Costilla' },
    { file: path.join(dir, 'santiago_de_queretaro.md'), qas: queretaroQAs, name: 'Santiago de Querétaro' }
  ];

  console.log('--- Iniciando Población de la Bóveda Curricular Histórica ---');
  for (const t of targets) {
    const res = mergeQaIntoFile(t.file, t.qas);
    console.log(`[${t.name}] Éxito: +${res.added} procesadas. Total en Bóveda: ${res.total}`);
  }
  console.log('--- Población Completa ---');
}

// Ejecutar si se invoca directamente
runPopulation();

