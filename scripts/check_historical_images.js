const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 1. Analyze files in personajes_historicos
const dir = 'personajes_historicos';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));

const imageUsage = new Map(); // imgUrl -> [{ file, line, field }]

files.forEach(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    // Check YAML fields: imageUrl, avatarImageUrl
    const yamlMatch = trimmed.match(/(?:imageUrl|avatarImageUrl|historicalPhotoUrl):\s*["']?([^"'\r\n]+)["']?/);
    if (yamlMatch) {
      const url = yamlMatch[1].trim();
      if (!imageUsage.has(url)) imageUsage.set(url, []);
      imageUsage.get(url).push({ file: f, line: idx + 1, type: 'yaml', context: trimmed });
    }
    // Check Markdown image syntax: ![alt](url)
    const mdMatches = [...trimmed.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)];
    mdMatches.forEach(m => {
      const url = m[2].trim();
      if (!imageUsage.has(url)) imageUsage.set(url, []);
      imageUsage.get(url).push({ file: f, line: idx + 1, type: 'markdown', alt: m[1] });
    });
  });
});

// Also check src/app/api/ai/historical-figure/route.ts
const routeFile = 'src/app/api/ai/historical-figure/route.ts';
if (fs.existsSync(routeFile)) {
  const content = fs.readFileSync(routeFile, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    const match = trimmed.match(/(?:imageUrl|avatarImageUrl|historicalPhotoUrl):\s*["']([^"'\r\n]+)["']/);
    if (match) {
      const url = match[1].replace(/,$/, '').trim();
      if (!imageUsage.has(url)) imageUsage.set(url, []);
      imageUsage.get(url).push({ file: 'route.ts', line: idx + 1, type: 'code' });
    }
  });
}

console.log('=== 1. REPEATED URLS ACROSS OR WITHIN FIGURES ===');
let repeatedUrlsCount = 0;
for (const [url, usages] of imageUsage.entries()) {
  if (usages.length > 1) {
    repeatedUrlsCount++;
    console.log(`\nURL: "${url}" (aparece ${usages.length} veces):`);
    usages.forEach(u => console.log(`   - ${u.file}:${u.line} ${u.isAvatar ? '[AVATAR]' : ''}`));
  }
}
if (repeatedUrlsCount === 0) {
  console.log('No se encontraron URLs repetidas.');
}

// 2. Check binary hashes of images in public/images/history
const imgDir = 'public/images/history';
if (fs.existsSync(imgDir)) {
  const imgs = fs.readdirSync(imgDir);
  const hashes = new Map();
  imgs.forEach(img => {
    const full = path.join(imgDir, img);
    if (fs.statSync(full).isFile()) {
      const buf = fs.readFileSync(full);
      const hash = crypto.createHash('sha256').update(buf).digest('hex');
      if (!hashes.has(hash)) hashes.set(hash, []);
      hashes.get(hash).push({ img, size: buf.length });
    }
  });

  console.log('\n=== 2. DUPLICATE BINARY FILES (IDENTICAL SHA-256 HASH) ===');
  let duplicateHashesCount = 0;
  for (const [h, list] of hashes.entries()) {
    if (list.length > 1) {
      duplicateHashesCount++;
      console.log(`\nHash ${h.slice(0, 12)} (${list[0].size} bytes):`);
      list.forEach(item => console.log(`   - public/images/history/${item.img}`));
    }
  }
  if (duplicateHashesCount === 0) {
    console.log('No se encontraron archivos binarios idénticos.');
  }

  // 3. Check for missing files referenced in markdown
  console.log('\n=== 3. MISSING REFERENCED IMAGE FILES ===');
  for (const [url, usages] of imageUsage.entries()) {
    if (url.startsWith('/images/history/')) {
      const filename = url.replace('/images/history/', '');
      const localPath = path.join(imgDir, filename);
      if (!fs.existsSync(localPath)) {
        console.log(`Falta archivo local: "${localPath}"`);
        usages.forEach(u => console.log(`   - Referenciado en: ${u.file}:${u.line}`));
      }
    }
  }
}
