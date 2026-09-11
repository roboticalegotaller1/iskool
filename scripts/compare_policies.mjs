import fs from 'fs';

const brainSteps = 'C:/Users/kami-/.gemini/antigravity-ide/brain/9bbaf7a3-7b1e-4080-9897-d70b3a0add02/.system_generated/steps';

function extractJson(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(content);
  const text = parsed.result || content;
  const match = text.match(/<untrusted-data-[^>]+>\r?\n(\[[\s\S]*?\])\r?\n<\/untrusted-data-[^>]+>/);
  return JSON.parse(match[1]);
}

const src = extractJson(brainSteps + '/3495/output.txt');
const tgt = extractJson(brainSteps + '/3497/output.txt');
const tgtMap = new Set(tgt.map(p => p.tablename + '.' + p.policyname));
const missing = src.filter(p => !tgtMap.has(p.tablename + '.' + p.policyname));

console.log('Missing count:', missing.length);

let ddl = '';
for (const p of missing) {
  let roleStr = p.roles || '{public}';
  roleStr = roleStr.replace(/^{|}$/g, '');
  if (!roleStr) roleStr = 'public';
  
  const forCmd = p.cmd === 'ALL' ? '' : `FOR ${p.cmd} `;
  const toRole = `TO ${roleStr} `;
  const usingClause = p.qual ? `USING (${p.qual}) ` : (p.cmd !== 'INSERT' ? 'USING (true) ' : '');
  const checkClause = p.with_check ? `WITH CHECK (${p.with_check})` : '';
  
  ddl += `DO $$ BEGIN\n`;
  ddl += `  IF to_regclass('public.${p.tablename}') IS NOT NULL THEN\n`;
  ddl += `    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = '${p.tablename}' AND policyname = '${p.policyname.replace(/'/g, "''")}') THEN\n`;
  ddl += `      CREATE POLICY "${p.policyname}" ON public.${p.tablename} ${forCmd}${toRole}${usingClause}${checkClause};\n`;
  ddl += `    END IF;\n`;
  ddl += `  END IF;\n`;
  ddl += `END $$;\n\n`;
}

fs.writeFileSync('scripts/missing_policies.sql', ddl, 'utf8');
console.log('Saved scripts/missing_policies.sql, size:', fs.statSync('scripts/missing_policies.sql').size);
