import fs from 'fs';
import path from 'path';

const VAULT_ROOT = 'C:\\Users\\kami-\\Desktop\\2025-2026\\iskool\\obsidean\\brain\\iskool';
const PLANNINGS_DIR = path.join(VAULT_ROOT, 'planeaciones');

interface AnalyticsResult {
  totalFiles: number;
  totalPlannings: number;
  totalInstructionalHours: number;
  totalSessions: number;
  byFase: Record<string, number>;
  byLevel: Record<string, number>;
  byCampo: Record<string, number>;
  bySubject: Record<string, number>;
  byGrade: Record<string, number>;
  ejesCount: Record<string, number>;
  sepBooksReferenced: Record<string, number>;
  totalBidirectionalLinks: number;
  productTypes: Record<string, number>;
  schemaFiles: { name: string; sizeBytes: number; lineCount: number }[];
}

function runAnalytics(): AnalyticsResult {
  const result: AnalyticsResult = {
    totalFiles: 0,
    totalPlannings: 0,
    totalInstructionalHours: 0,
    totalSessions: 0,
    byFase: {},
    byLevel: {},
    byCampo: {},
    bySubject: {},
    byGrade: {},
    ejesCount: {},
    sepBooksReferenced: {},
    totalBidirectionalLinks: 0,
    productTypes: {},
    schemaFiles: []
  };

  function scanDir(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== '.git' && entry.name !== '.obsidian' && entry.name !== '.smart-env') {
          scanDir(fullPath);
        }
      } else if (entry.isFile()) {
        result.totalFiles++;

        if (entry.name.endsWith('.md')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const lines = content.split('\n').length;

          // Count links
          const links = content.match(/\[\[([^\]]+)\]\]/g) || [];
          result.totalBidirectionalLinks += links.length;

          // Check if schema/doc
          if (!fullPath.includes('planeaciones')) {
            result.schemaFiles.push({
              name: entry.name,
              sizeBytes: fs.statSync(fullPath).size,
              lineCount: lines
            });
            continue;
          }

          // If planning file
          if (!entry.name.startsWith('00_') && !entry.name.startsWith('Prof_')) {
            result.totalPlannings++;
            result.totalSessions += 10;
            result.totalInstructionalHours += (10 * 50) / 60;

            const faseMatch = content.match(/fase_nem:\s*"([^"]+)"/);
            const nivelMatch = content.match(/nivel:\s*"([^"]+)"/);
            const gradoMatch = content.match(/grado:\s*"([^"]+)"/);
            const campoMatch = content.match(/campo_formativo:\s*"([^"]+)"/);
            const subMatch = content.match(/asignatura:\s*"([^"]+)"/);

            const fase = faseMatch ? faseMatch[1] : 'Fase 3';
            const nivel = nivelMatch ? nivelMatch[1] : 'Primaria';
            const grado = gradoMatch ? gradoMatch[1] : '1er Grado';
            const campo = campoMatch ? campoMatch[1] : 'Saberes y Pensamiento Científico';
            const sub = subMatch ? subMatch[1] : 'General';

            result.byFase[fase] = (result.byFase[fase] || 0) + 1;
            result.byLevel[nivel] = (result.byLevel[nivel] || 0) + 1;
            result.byGrade[grado] = (result.byGrade[grado] || 0) + 1;
            result.byCampo[campo] = (result.byCampo[campo] || 0) + 1;
            result.bySubject[sub] = (result.bySubject[sub] || 0) + 1;

            // Books
            const bookMatches = content.match(/📖 Libro de Texto SEP:\s*([^\(]+)/g) || [];
            bookMatches.forEach(b => {
              const cleanBook = b.replace(/📖 Libro de Texto SEP:\s*/, '').trim();
              result.sepBooksReferenced[cleanBook] = (result.sepBooksReferenced[cleanBook] || 0) + 1;
            });

            // Ejes
            const ejesMatches = content.match(/ejes_articuladores:\s*\[(.*?)\]/);
            if (ejesMatches) {
              const ejesList = ejesMatches[1].split(',').map(e => e.replace(/["']/g, '').trim());
              ejesList.forEach(e => {
                if (e) result.ejesCount[e] = (result.ejesCount[e] || 0) + 1;
              });
            }
          }
        }
      }
    }
  }

  scanDir(VAULT_ROOT);
  return result;
}

const analytics = runAnalytics();
console.log(JSON.stringify(analytics, null, 2));
