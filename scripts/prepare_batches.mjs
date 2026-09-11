import fs from 'fs';
import path from 'path';

const brainSteps = 'C:\\Users\\kami-\\.gemini\\antigravity-ide\\brain\\9bbaf7a3-7b1e-4080-9897-d70b3a0add02\\.system_generated\\steps';

function extractJson(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(content);
  const text = parsed.result || content;
  const match = text.match(/<untrusted-data-[^>]+>\r?\n(\[[\s\S]*?\])\r?\n<\/untrusted-data-[^>]+>/);
  if (match) {
    return JSON.parse(match[1]);
  }
  throw new Error(`Could not extract JSON from ${filePath}`);
}

const columnsData = extractJson(path.join(brainSteps, '3204', 'output.txt'));
const columnTypeMap = {};
for (const col of columnsData) {
  columnTypeMap[`${col.table_schema}.${col.table_name}.${col.column_name}`] = col;
}

function escapeSqlValue(schema, table, column, val) {
  if (val === null || val === undefined) return 'NULL';
  const meta = columnTypeMap[`${schema}.${table}.${column}`] || columnTypeMap[`public.${table}.${column}`];
  const udt = meta ? meta.udt_name : '';
  const dtype = meta ? meta.data_type : '';

  if (typeof val === 'boolean') {
    return val ? 'TRUE' : 'FALSE';
  }
  if (typeof val === 'number') {
    return String(val);
  }
  if (udt === 'jsonb' || udt === 'json' || dtype === 'jsonb' || dtype === 'json') {
    const str = typeof val === 'string' ? val : JSON.stringify(val);
    return `'${str.replace(/'/g, "''")}'::jsonb`;
  }
  if (udt.startsWith('_') || dtype === 'ARRAY') {
    if (Array.isArray(val)) {
      const elements = val.map(item => `'${String(item).replace(/'/g, "''")}'`).join(', ');
      return `ARRAY[${elements}]::${udt.startsWith('_') ? udt.substring(1) + '[]' : 'text[]'}`;
    }
  }
  if (typeof val === 'object') {
    return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
  }
  return `'${String(val).replace(/'/g, "''")}'`;
}

const generatedColumns = new Set([
  'auth.users.confirmed_at',
  'auth.identities.email'
]);

function generateInsert(schema, table, rows, conflictClause = 'ON CONFLICT DO NOTHING') {
  if (!rows || rows.length === 0) return '';
  const cols = Object.keys(rows[0]).filter(c => !generatedColumns.has(`${schema}.${table}.${c}`));
  const colList = cols.map(c => `"${c}"`).join(', ');
  
  const valuesLines = rows.map(r => {
    const vals = cols.map(c => escapeSqlValue(schema, table, c, r[c])).join(', ');
    return `  (${vals})`;
  }).join(',\n');

  return `INSERT INTO ${schema}.${table} (${colList})\nVALUES\n${valuesLines}\n${conflictClause};\n`;
}

// Load data
const authUsersData = extractJson(path.join(brainSteps, '3188', 'output.txt'))[0].json_agg;
const g1Data = extractJson(path.join(brainSteps, '3192', 'output.txt'))[0].g1;
const g2Data = extractJson(path.join(brainSteps, '3194', 'output.txt'))[0].g2;
const g3Data = extractJson(path.join(brainSteps, '3196', 'output.txt'))[0].g3;
const g4Data = extractJson(path.join(brainSteps, '3198', 'output.txt'))[0].g4;
const g5Data = extractJson(path.join(brainSteps, '3200', 'output.txt'))[0].g5;

// Batch 1: Core & Auth
const b1 = [
  `-- Temporarily make handle_new_user a no-op to prevent duplicate inserts during migration
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$ 
BEGIN 
  RETURN NEW; 
END; 
$$ LANGUAGE plpgsql;

-- Clear initial seed placeholder rows so exact foreign key UUIDs from source match
DELETE FROM public.nem_pdas;
DELETE FROM public.nem_campos_formativos;
DELETE FROM public.levels_grades;
`,
  generateInsert('auth', 'users', authUsersData, 'ON CONFLICT (id) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password, email_confirmed_at = EXCLUDED.email_confirmed_at, raw_app_meta_data = EXCLUDED.raw_app_meta_data, raw_user_meta_data = EXCLUDED.raw_user_meta_data'),
  generateInsert('auth', 'identities', g4Data.auth_identities, 'ON CONFLICT (id) DO NOTHING'),
  generateInsert('public', 'schools', g1Data.schools, 'ON CONFLICT (id) DO NOTHING'),
  generateInsert('public', 'profiles', g1Data.profiles, 'ON CONFLICT (id) DO NOTHING'),
  generateInsert('public', 'school_settings', g1Data.school_settings, 'ON CONFLICT (id) DO NOTHING'),
  generateInsert('public', 'levels_grades', g1Data.levels_grades, 'ON CONFLICT (id) DO NOTHING'),
  generateInsert('public', 'nem_campos_formativos', g1Data.nem_campos_formativos, 'ON CONFLICT (id) DO NOTHING'),
  generateInsert('public', 'nem_pdas', g1Data.nem_pdas, 'ON CONFLICT (id) DO NOTHING'),
  generateInsert('public', 'subjects', g1Data.subjects, 'ON CONFLICT (id) DO NOTHING')
].join('\n');
fs.writeFileSync('scripts/batch1_core.sql', b1, 'utf8');

// Batch 2: Students & Avatars & Badges, then restore handle_new_user
const restoreTriggerSql = `
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    new.email
  )
  ON CONFLICT (id) DO NOTHING;

  IF COALESCE(new.raw_user_meta_data->>'role', 'student') = 'student' THEN
    INSERT INTO public.students (id, school_id)
    VALUES (new.id, '00000000-0000-0000-0000-000000000000')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.student_stats (student_id)
    VALUES (new.id)
    ON CONFLICT (student_id) DO NOTHING;

    INSERT INTO public.student_avatars (student_id, avatar_name)
    VALUES (new.id, COALESCE(new.raw_user_meta_data->>'first_name', 'Héroe'))
    ON CONFLICT (student_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

const b2 = [
  generateInsert('public', 'students', g2Data.students, 'ON CONFLICT (id) DO NOTHING'),
  generateInsert('public', 'student_stats', g2Data.student_stats, 'ON CONFLICT (student_id) DO NOTHING'),
  generateInsert('public', 'student_avatars', g2Data.student_avatars, 'ON CONFLICT (student_id) DO NOTHING'),
  generateInsert('public', 'badges', g2Data.badges, 'ON CONFLICT (id) DO NOTHING'),
  generateInsert('public', 'student_badges', g2Data.student_badges, 'ON CONFLICT (student_id, badge_id) DO NOTHING'),
  restoreTriggerSql
].join('\n');
fs.writeFileSync('scripts/batch2_students.sql', b2, 'utf8');

// Batch 3: Missions, Quests, PDAs, Shop, Inventory
const b3 = [
  generateInsert('public', 'missions', g3Data.missions, 'ON CONFLICT (id) DO NOTHING'),
  generateInsert('public', 'quests', g3Data.quests, 'ON CONFLICT (id) DO NOTHING'),
  generateInsert('public', 'quest_attempts', g3Data.quest_attempts, 'ON CONFLICT (id) DO NOTHING'),
  generateInsert('public', 'pdas', g3Data.pdas, 'ON CONFLICT (id) DO NOTHING'),
  'DELETE FROM public.shop_artifacts;',
  generateInsert('public', 'shop_artifacts', g3Data.shop_artifacts, 'ON CONFLICT (id) DO NOTHING'),
  generateInsert('public', 'student_inventory', g3Data.student_inventory, 'ON CONFLICT (student_id, artifact_id) DO NOTHING'),
  generateInsert('public', 'student_messages', g3Data.student_messages, 'ON CONFLICT (id) DO NOTHING')
].join('\n');
fs.writeFileSync('scripts/batch3_missions_inventory.sql', b3, 'utf8');

// Batch 4: Guild, Parties, Community Activities
const b4 = [
  generateInsert('public', 'guild_bosses', g4Data.guild_bosses, 'ON CONFLICT (id) DO NOTHING'),
  generateInsert('public', 'coop_parties', g4Data.coop_parties, 'ON CONFLICT (id) DO NOTHING'),
  generateInsert('public', 'party_members', g4Data.party_members, 'ON CONFLICT (party_id, student_id) DO NOTHING'),
  generateInsert('public', 'community_activities', g4Data.community_activities, 'ON CONFLICT (id) DO NOTHING')
].join('\n');
fs.writeFileSync('scripts/batch4_activities_guild.sql', b4, 'utf8');

// Batch 5: Portfolio Items in payload-sized chunks (max 1.5MB per batch)
const portfolioRows = g5Data.portfolio_items || [];
let currentChunk = [];
let currentSize = 0;
let chunkIndex = 1;

for (const row of portfolioRows) {
  const rowSize = JSON.stringify(row).length;
  if (currentChunk.length > 0 && currentSize + rowSize > 1200000) {
    const sql = generateInsert('public', 'portfolio_items', currentChunk, 'ON CONFLICT (id) DO NOTHING');
    fs.writeFileSync(`scripts/batch5_portfolio_chunk_${chunkIndex}.sql`, sql, 'utf8');
    chunkIndex++;
    currentChunk = [row];
    currentSize = rowSize;
  } else {
    currentChunk.push(row);
    currentSize += rowSize;
  }
}
if (currentChunk.length > 0) {
  const sql = generateInsert('public', 'portfolio_items', currentChunk, 'ON CONFLICT (id) DO NOTHING');
  fs.writeFileSync(`scripts/batch5_portfolio_chunk_${chunkIndex}.sql`, sql, 'utf8');
  chunkIndex++;
}
console.log(`Portfolio items total ${portfolioRows.length}, created ${chunkIndex - 1} chunks.`);

const b6 = generateInsert('public', 'portfolio_feedback', g5Data.portfolio_feedback, 'ON CONFLICT (id) DO NOTHING');
fs.writeFileSync('scripts/batch6_portfolio_feedback.sql', b6, 'utf8');

console.log('All batch files written successfully!');
