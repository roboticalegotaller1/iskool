import fs from 'fs';

const extract = (p) => {
  const c = fs.readFileSync(p, 'utf8');
  const parsed = JSON.parse(c);
  const text = parsed.result || c;
  const m = text.match(/<untrusted-data-[^>]+>\r?\n(\[[\s\S]*?\])\r?\n<\/untrusted-data-[^>]+>/);
  return JSON.parse(m[1]);
};

const src = extract('C:/Users/kami-/.gemini/antigravity-ide/brain/9bbaf7a3-7b1e-4080-9897-d70b3a0add02/.system_generated/steps/3204/output.txt').filter(c => c.table_schema === 'public');
const tgt = extract('C:/Users/kami-/.gemini/antigravity-ide/brain/9bbaf7a3-7b1e-4080-9897-d70b3a0add02/.system_generated/steps/3324/output.txt').filter(c => c.table_schema === 'public');

const tgtCols = new Set(tgt.map(c => c.table_name + '.' + c.column_name));
const missing = src.filter(c => !tgtCols.has(c.table_name + '.' + c.column_name));

console.log('Missing columns in target:', missing.length);
const statements = [];
for (const m of missing) {
  let typeStr = m.udt_name;
  if (m.data_type === 'ARRAY') {
    typeStr = m.udt_name.startsWith('_') ? m.udt_name.substring(1) + '[]' : 'text[]';
  } else if (m.data_type === 'character varying') {
    typeStr = 'varchar';
  }
  const def = m.column_default ? ' DEFAULT ' + m.column_default : '';
  statements.push(`ALTER TABLE public.${m.table_name} ADD COLUMN IF NOT EXISTS "${m.column_name}" ${typeStr}${def};`);
}

const sql = statements.join('\n');
console.log(sql);
fs.writeFileSync('scripts/add_missing_columns.sql', sql, 'utf8');
