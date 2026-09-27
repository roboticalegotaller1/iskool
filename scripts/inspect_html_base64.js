const fs = require('fs');

const html = fs.readFileSync('public/high_tech_renderer_v3.html', 'utf8');
const regex = /data:image\/([a-zA-Z]+);base64,([^"']+)/g;
let match;
let count = 0;
let totalBytes = 0;

while ((match = regex.exec(html)) !== null) {
  count++;
  const format = match[1];
  const b64Data = match[2];
  const byteLength = Buffer.from(b64Data, 'base64').length;
  totalBytes += byteLength;
  console.log(`Image ${count}: ${format} - ${(byteLength / 1024).toFixed(1)} KB`);
}

console.log(`Total images: ${count}`);
console.log(`Total decoded raw bytes: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB`);
console.log(`HTML file total size: ${(fs.statSync('public/high_tech_renderer_v3.html').size / (1024 * 1024)).toFixed(2)} MB`);
