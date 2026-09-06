import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const OBSIDIAN_VAULT_ROOT = 'C:\\Users\\kami-\\Desktop\\2025-2026\\iskool\\obsidean\\brain\\iskool';
const PLANNED_DIR = path.join(OBSIDIAN_VAULT_ROOT, 'planeaciones');

function getSpanishDateInLetters(date: Date = new Date()): string {
  const day = date.getDate();
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  return `${day} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
}

function getAllMarkdownFiles(dir: string): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getAllMarkdownFiles(fullPath));
    } else if (item.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

function updateMarkdownFiles() {
  const files = getAllMarkdownFiles(PLANNED_DIR);
  console.log(`[Date Updater] Found ${files.length} markdown files in Obsidian vault.`);

  const todayLetters = getSpanishDateInLetters(new Date());
  let modifiedCount = 0;

  for (const filePath of files) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    // Replace ISO dates like created_at: "2026-08-18" or created_at: 2026-08-18
    if (/created_at:\s*"?(?:\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4})"?/i.test(content)) {
      content = content.replace(/created_at:\s*"?(?:\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4})"?/gi, `created_at: "${todayLetters}"`);
      modified = true;
    }

    if (/updated_at:\s*"?(?:\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4})"?/i.test(content)) {
      content = content.replace(/updated_at:\s*"?(?:\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4})"?/gi, `updated_at: "${todayLetters}"`);
      modified = true;
    }

    if (/fecha_creacion:\s*"?(?:\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4}|[0-9T:.Z-]+)"?/i.test(content)) {
      content = content.replace(/fecha_creacion:\s*"?(?:\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4}|[0-9T:.Z-]+)"?/gi, `fecha_creacion: "${todayLetters}"`);
      modified = true;
    }

    if (/fecha:\s*"?(?:\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4})"?/i.test(content)) {
      content = content.replace(/fecha:\s*"?(?:\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4})"?/gi, `fecha: "${todayLetters}"`);
      modified = true;
    }

    if (/\*\*Fecha:\*\*\s*(?:\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4})/i.test(content)) {
      content = content.replace(/\*\*Fecha:\*\*\s*(?:\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4})/gi, `**Fecha de Elaboración:** ${todayLetters}`);
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf-8');
      modifiedCount++;
    }
  }

  console.log(`[Date Updater] Successfully updated dates with month in letters in ${modifiedCount} files.`);

  // Git Commit and Push in Obsidian
  try {
    console.log('[Git Sync] Adding changes in Obsidian repo...');
    execSync('git add planeaciones', { cwd: OBSIDIAN_VAULT_ROOT, stdio: 'inherit' });
    const status = execSync('git status --porcelain', { cwd: OBSIDIAN_VAULT_ROOT, encoding: 'utf-8' });
    if (status.trim().length > 0) {
      console.log('[Git Sync] Committing date format updates...');
      execSync('git commit -m "refactor(dates): update all planning dates to Spanish letter format (e.g. 18 de agosto de 2026)"', {
        cwd: OBSIDIAN_VAULT_ROOT,
        stdio: 'inherit'
      });
      console.log('[Git Sync] Pushing to remote repository...');
      execSync('git push origin main', { cwd: OBSIDIAN_VAULT_ROOT, stdio: 'inherit' });
      console.log('🚀 [Git Sync] Obsidian vault push SUCCESSFUL!');
    } else {
      console.log('[Git Sync] No changes to commit in Obsidian.');
    }
  } catch (err: any) {
    console.error('[Git Sync Error]', err.message);
  }
}

updateMarkdownFiles();
