import fs from 'fs';
import path from 'path';

// Files to parse:
const files = {
  columns: 'C:\\Users\\kami-\\brain\\steps\\3204.txt', // will resolve dynamically below
  authUsers: 'C:\\Users\\kami-\\brain\\steps\\3188.txt',
  g1: 'C:\\Users\\kami-\\brain\\steps\\3192.txt',
  g2: 'C:\\Users\\kami-\\brain\\steps\\3194.txt',
  g3: 'C:\\Users\\kami-\\brain\\steps\\3196.txt',
  g4: 'C:\\Users\\kami-\\brain\\steps\\3198.txt',
  g5: 'C:\\Users\\kami-\\brain\\steps\\3200.txt',
};

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
const columnTypeMap = {}; // "schema.table.column" -> { data_type, udt_name }
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
  if (udt.startsWith('_') || dtype === 'ARRAY') { // Array type in Postgres
    if (Array.isArray(val)) {
      // Format as ARRAY['a', 'b']
      const elements = val.map(item => `'${String(item).replace(/'/g, "''")}'`).join(', ');
      return `ARRAY[${elements}]::${udt.startsWith('_') ? udt.substring(1) + '[]' : 'text[]'}`;
    }
  }
  if (typeof val === 'object') {
    return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
  }
  // string, date, timestamp, uuid
  return `'${String(val).replace(/'/g, "''")}'`;
}

function generateInsert(schema, table, rows, conflictClause = 'ON CONFLICT DO NOTHING') {
  if (!rows || rows.length === 0) return '';
  const cols = Object.keys(rows[0]);
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

console.log('Loaded rows summary:');
console.log('auth.users:', authUsersData.length);
console.log('g1:', Object.keys(g1Data).map(k => `${k}: ${g1Data[k]?.length || 0}`).join(', '));
console.log('g2:', Object.keys(g2Data).map(k => `${k}: ${g2Data[k]?.length || 0}`).join(', '));
console.log('g3:', Object.keys(g3Data).map(k => `${k}: ${g3Data[k]?.length || 0}`).join(', '));
console.log('g4:', Object.keys(g4Data).map(k => `${k}: ${g4Data[k]?.length || 0}`).join(', '));
console.log('g5:', Object.keys(g5Data).map(k => `${k}: ${g5Data[k]?.length || 0}`).join(', '));

// We'll write partitioned migration scripts or a single unified script
const sqlStatements = [];

sqlStatements.push(`-- Disable user creation triggers on auth.users during initial migration
ALTER TABLE auth.users DISABLE TRIGGER ALL;
`);

// 1. auth.users
sqlStatements.push(generateInsert('auth', 'users', authUsersData, 'ON CONFLICT (id) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password, email_confirmed_at = EXCLUDED.email_confirmed_at, raw_app_meta_data = EXCLUDED.raw_app_meta_data, raw_user_meta_data = EXCLUDED.raw_user_meta_data'));

// 2. auth.identities
if (g4Data.auth_identities && g4Data.auth_identities.length > 0) {
  sqlStatements.push(generateInsert('auth', 'identities', g4Data.auth_identities, 'ON CONFLICT (id) DO NOTHING'));
}

// 3. schools
if (g1Data.schools) {
  sqlStatements.push(generateInsert('public', 'schools', g1Data.schools, 'ON CONFLICT (id) DO NOTHING'));
}

// 4. profiles
if (g1Data.profiles) {
  sqlStatements.push(generateInsert('public', 'profiles', g1Data.profiles, 'ON CONFLICT (id) DO NOTHING'));
}

// Re-enable triggers on auth.users
sqlStatements.push(`ALTER TABLE auth.users ENABLE TRIGGER ALL;\n`);

// 5. school_settings
if (g1Data.school_settings) {
  sqlStatements.push(generateInsert('public', 'school_settings', g1Data.school_settings, 'ON CONFLICT (id) DO NOTHING'));
}

// 6. subjects
if (g1Data.subjects) {
  sqlStatements.push(generateInsert('public', 'subjects', g1Data.subjects, 'ON CONFLICT (id) DO NOTHING'));
}

// 7. levels_grades
if (g1Data.levels_grades) {
  sqlStatements.push(generateInsert('public', 'levels_grades', g1Data.levels_grades, 'ON CONFLICT (id) DO NOTHING'));
}

// 8. nem_campos_formativos
if (g1Data.nem_campos_formativos) {
  sqlStatements.push(generateInsert('public', 'nem_campos_formativos', g1Data.nem_campos_formativos, 'ON CONFLICT (id) DO NOTHING'));
}

// 9. nem_pdas
if (g1Data.nem_pdas) {
  sqlStatements.push(generateInsert('public', 'nem_pdas', g1Data.nem_pdas, 'ON CONFLICT (id) DO NOTHING'));
}

// 10. students
if (g2Data.students) {
  sqlStatements.push(generateInsert('public', 'students', g2Data.students, 'ON CONFLICT (id) DO NOTHING'));
}

// 11. student_stats
if (g2Data.student_stats) {
  sqlStatements.push(generateInsert('public', 'student_stats', g2Data.student_stats, 'ON CONFLICT (id) DO NOTHING'));
}

// 12. student_avatars
if (g2Data.student_avatars) {
  sqlStatements.push(generateInsert('public', 'student_avatars', g2Data.student_avatars, 'ON CONFLICT (student_id) DO NOTHING'));
}

// 13. badges
if (g2Data.badges) {
  sqlStatements.push(generateInsert('public', 'badges', g2Data.badges, 'ON CONFLICT (id) DO NOTHING'));
}

// 14. student_badges
if (g2Data.student_badges) {
  sqlStatements.push(generateInsert('public', 'student_badges', g2Data.student_badges, 'ON CONFLICT (id) DO NOTHING'));
}

// 15. missions
if (g3Data.missions) {
  sqlStatements.push(generateInsert('public', 'missions', g3Data.missions, 'ON CONFLICT (id) DO NOTHING'));
}

// 16. quests
if (g3Data.quests) {
  sqlStatements.push(generateInsert('public', 'quests', g3Data.quests, 'ON CONFLICT (id) DO NOTHING'));
}

// 17. quest_attempts
if (g3Data.quest_attempts) {
  sqlStatements.push(generateInsert('public', 'quest_attempts', g3Data.quest_attempts, 'ON CONFLICT (id) DO NOTHING'));
}

// 18. pdas
if (g3Data.pdas) {
  sqlStatements.push(generateInsert('public', 'pdas', g3Data.pdas, 'ON CONFLICT (id) DO NOTHING'));
}

// 19. shop_artifacts
if (g3Data.shop_artifacts) {
  sqlStatements.push(generateInsert('public', 'shop_artifacts', g3Data.shop_artifacts, 'ON CONFLICT (id) DO NOTHING'));
}

// 20. student_inventory
if (g3Data.student_inventory) {
  sqlStatements.push(generateInsert('public', 'student_inventory', g3Data.student_inventory, 'ON CONFLICT (id) DO NOTHING'));
}

// 21. student_messages
if (g3Data.student_messages) {
  sqlStatements.push(generateInsert('public', 'student_messages', g3Data.student_messages, 'ON CONFLICT (id) DO NOTHING'));
}

// 22. guild_bosses
if (g4Data.guild_bosses) {
  sqlStatements.push(generateInsert('public', 'guild_bosses', g4Data.guild_bosses, 'ON CONFLICT (id) DO NOTHING'));
}

// 23. coop_parties
if (g4Data.coop_parties) {
  sqlStatements.push(generateInsert('public', 'coop_parties', g4Data.coop_parties, 'ON CONFLICT (id) DO NOTHING'));
}

// 24. party_members
if (g4Data.party_members) {
  sqlStatements.push(generateInsert('public', 'party_members', g4Data.party_members, 'ON CONFLICT (id) DO NOTHING'));
}

// 25. community_activities
if (g4Data.community_activities) {
  sqlStatements.push(generateInsert('public', 'community_activities', g4Data.community_activities, 'ON CONFLICT (id) DO NOTHING'));
}

// 26. portfolio_items
if (g5Data.portfolio_items) {
  sqlStatements.push(generateInsert('public', 'portfolio_items', g5Data.portfolio_items, 'ON CONFLICT (id) DO NOTHING'));
}

// 27. portfolio_feedback
if (g5Data.portfolio_feedback) {
  sqlStatements.push(generateInsert('public', 'portfolio_feedback', g5Data.portfolio_feedback, 'ON CONFLICT (id) DO NOTHING'));
}

const fullSql = sqlStatements.join('\n');
fs.writeFileSync('scripts/migrate_all_data.sql', fullSql, 'utf8');
console.log('Saved scripts/migrate_all_data.sql. Total bytes:', fullSql.length);
