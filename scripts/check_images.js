const fs = require('fs');
const content = fs.readFileSync('presentacion_ejecutiva_iskool.html', 'utf8');
const lines = content.split('\n');

[944, 1030, 1116, 1202, 1294, 1380, 1559].forEach(lineNum => {
  const start = Math.max(0, lineNum - 40);
  const snippet = lines.slice(start, lineNum).join('\n');
  const titleMatch = snippet.match(/class=["']slide-title["'][^>]*>([\s\S]*?)<\/h[1-3]>/);
  const subMatch = snippet.match(/class=["']slide-subtitle["'][^>]*>([\s\S]*?)<\/p>/);
  console.log('--- Line ' + lineNum + ' ---');
  if (titleMatch) console.log('Title: ' + titleMatch[1].replace(/<[^>]+>/g, '').trim());
  if (subMatch) console.log('Subtitle: ' + subMatch[1].replace(/<[^>]+>/g, '').trim());
});
