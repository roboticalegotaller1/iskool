import fs from 'fs';
import path from 'path';

function walk(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (file !== '.index') results = results.concat(walk(full));
    } else if (file.endsWith('.md')) {
      results.push(full);
    }
  });
  return results;
}

const files = walk('knowledge/english');
console.log('Total markdown files:', files.length);
const byDir: Record<string, number> = {};
const byCefr: Record<string, number> = {};
const bySkill: Record<string, number> = {};
const byGrade: Record<string, number> = {};

files.forEach(f => {
  const rel = path.relative('knowledge/english', f);
  const top = rel.split(path.sep).slice(0, 2).join('/');
  byDir[top] = (byDir[top] || 0) + 1;

  const content = fs.readFileSync(f, 'utf-8');
  const cefrMatch = content.match(/cefr:\s*\n((?:\s*-\s*[^\n]+\n)+)/);
  if (cefrMatch) {
    const levels = cefrMatch[1].split('\n').map(l => l.replace(/^\s*-\s*/, '').trim()).filter(Boolean);
    levels.forEach(lvl => {
      byCefr[lvl] = (byCefr[lvl] || 0) + 1;
    });
  }

  const gradesMatch = content.match(/grades:\s*\n((?:\s*-\s*[^\n]+\n)+)/);
  if (gradesMatch) {
    const grades = gradesMatch[1].split('\n').map(l => l.replace(/^\s*-\s*/, '').trim()).filter(Boolean);
    grades.forEach(g => {
      byGrade[g] = (byGrade[g] || 0) + 1;
    });
  }
});

console.log('Files by directory:', JSON.stringify(byDir, null, 2));
console.log('Files by CEFR:', JSON.stringify(byCefr, null, 2));
console.log('Files by Grade:', JSON.stringify(byGrade, null, 2));
