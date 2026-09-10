const fs = require('fs');
const content = fs.readFileSync('presentacion_ejecutiva_iskool.html', 'utf8');
const lines = content.split('\n');

[944, 1030, 1116, 1202, 1294, 1380, 1559].forEach(lineNum => {
  console.log('=== LINE ' + lineNum + ' ===');
  for (let i = Math.max(0, lineNum - 18); i < lineNum; i++) {
    const l = lines[i].trim();
    if (l && !l.startsWith('<img') && !l.startsWith('data:')) {
      console.log('  ' + l);
    }
  }
});
