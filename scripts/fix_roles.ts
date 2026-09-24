import fs from 'fs';
import path from 'path';

function walk(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath, fileList);
    } else if (file.endsWith('.md')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const allMdFiles = walk('knowledge/english');
let replacedCount = 0;

for (const filePath of allMdFiles) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  if (content.includes('role: master')) {
    content = content.replace(/role: master\b/g, 'role: mastery');
    changed = true;
  }
  if (content.includes('role: core')) {
    content = content.replace(/role: core\b/g, 'role: consolidate');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf-8');
    replacedCount++;
    console.log('Fixed role in:', filePath);
  }
}

console.log('Total files updated:', replacedCount);
