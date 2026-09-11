import fs from 'fs';
import path from 'path';

const brainSteps = 'C:/Users/kami-/.gemini/antigravity-ide/brain/9bbaf7a3-7b1e-4080-9897-d70b3a0add02/.system_generated/steps';

function extractJson(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(content);
  const text = parsed.result || content;
  const match = text.match(/<untrusted-data-[^>]+>\r?\n(\[[\s\S]*?\])\r?\n<\/untrusted-data-[^>]+>/);
  return JSON.parse(match[1]);
}

const g5Data = extractJson(path.join(brainSteps, '3200', 'output.txt'))[0].g5;
const items = g5Data.portfolio_items || [];

function escapeSqlValue(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'number') return String(val);
  return `'${String(val).replace(/'/g, "''")}'`;
}

function generateInsert(rows) {
  if (!rows || rows.length === 0) return '';
  const cols = Object.keys(rows[0]);
  const colList = cols.map(c => `"${c}"`).join(', ');
  const valuesLines = rows.map(r => {
    const vals = cols.map(c => escapeSqlValue(r[c])).join(', ');
    return `  (${vals})`;
  }).join(',\n');
  return `INSERT INTO public.portfolio_items (${colList})\nVALUES\n${valuesLines}\nON CONFLICT (id) DO NOTHING;\n`;
}

const standardItems = [];
const largeItems = [];

items.forEach((it, idx) => {
  const urlLen = (it.file_url || '').length;
  if (urlLen < 100000) {
    standardItems.push(it);
  } else {
    largeItems.push({ idx, item: it });
  }
});

console.log('Standard items (<100KB):', standardItems.length);
console.log('Large items (>=100KB):', largeItems.length);

const mid = Math.ceil(standardItems.length / 2);
const std1 = standardItems.slice(0, mid);
const std2 = standardItems.slice(mid);

fs.writeFileSync('scripts/portfolio_items_std1.sql', generateInsert(std1), 'utf8');
fs.writeFileSync('scripts/portfolio_items_std2.sql', generateInsert(std2), 'utf8');
console.log('Saved std1:', fs.statSync('scripts/portfolio_items_std1.sql').size);
console.log('Saved std2:', fs.statSync('scripts/portfolio_items_std2.sql').size);

for (const { idx, item } of largeItems) {
  const file = `scripts/portfolio_item_${idx}.sql`;
  fs.writeFileSync(file, generateInsert([item]), 'utf8');
  console.log(`Saved ${file}, size:`, fs.statSync(file).size);
}
