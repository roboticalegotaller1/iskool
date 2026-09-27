const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('===============================================================');
console.log('🔍 ISKOOL ASSET & REPOSITORY AUDIT (DevOps & Full-Stack Senior)');
console.log('===============================================================\n');

// 1. Git Tracked Files Audit
console.log('--- 1. RASTREO EN GIT ---');
const trackedFiles = execSync('git ls-files', { encoding: 'utf8' }).split('\n').filter(Boolean);
console.log(`Total de archivos rastreados en Git: ${trackedFiles.length}`);

let totalTrackedBytes = 0;
const trackedByDir = {};
const heavyTracked = [];

trackedFiles.forEach(file => {
  try {
    const stat = fs.statSync(file);
    totalTrackedBytes += stat.size;
    const topDir = file.includes('/') ? file.split('/')[0] : '(raíz)';
    trackedByDir[topDir] = (trackedByDir[topDir] || 0) + stat.size;
    
    if (stat.size > 300 * 1024) {
      heavyTracked.push({
        file,
        size: stat.size,
        sizeKB: (stat.size / 1024).toFixed(1),
        sizeMB: (stat.size / (1024 * 1024)).toFixed(2)
      });
    }
  } catch (e) {
    // Archivo referenciado pero inexistente en disco
  }
});

console.log(`Peso total del árbol rastreado: ${(totalTrackedBytes / (1024 * 1024)).toFixed(2)} MB`);
console.log('\nPeso rastreado por directorio principal:');
Object.entries(trackedByDir)
  .sort((a, b) => b[1] - a[1])
  .forEach(([dir, size]) => {
    console.log(`  - ${dir.padEnd(25)}: ${(size / (1024 * 1024)).toFixed(2)} MB`);
  });

console.log(`\nArchivos rastreados > 300 KB (rompen Regla No Negociable 3): ${heavyTracked.length}`);
console.log(`Archivos rastreados > 500 KB: ${heavyTracked.filter(h => h.size > 500 * 1024).length}`);
console.log(`Archivos rastreados > 1 MB: ${heavyTracked.filter(h => h.size > 1024 * 1024).length}`);

console.log('\n--- TOP 25 ARCHIVOS MÁS PESADOS EN GIT ---');
heavyTracked.sort((a, b) => b.size - a.size);
heavyTracked.slice(0, 25).forEach((h, i) => {
  console.log(`  ${(i + 1).toString().padStart(2)}. [${h.sizeMB} MB / ${h.sizeKB} KB] ${h.file}`);
});

// 2. Fugas en .gitignore y Cachés
console.log('\n--- 2. DETECCIÓN DE FUGAS EN .gitignore ---');
const leakCandidates = [
  { name: '.obsidian (Bóveda / Plugins / Temas)', pattern: f => f.startsWith('.obsidian/') },
  { name: 'presentation_screenshots (Capturas temporales de scripts)', pattern: f => f.startsWith('presentation_screenshots/') },
  { name: 'verify_frames (Frames de validación de video)', pattern: f => f.includes('verify_frames') },
  { name: 'Archivos PDF en raíz (Manuales y presentaciones generadas)', pattern: f => !f.includes('/') && f.endsWith('.pdf') },
  { name: 'Renderers HTML pesados (> 1MB)', pattern: f => f.endsWith('.html') && heavyTracked.some(h => h.file === f && h.size > 1024 * 1024) },
];

leakCandidates.forEach(leak => {
  const matches = trackedFiles.filter(leak.pattern);
  const size = matches.reduce((acc, f) => {
    try { return acc + fs.statSync(f).size; } catch(e) { return acc; }
  }, 0);
  console.log(`  * ${leak.name}: ${matches.length} archivos rastreados (${(size / (1024 * 1024)).toFixed(2)} MB)`);
});

// 3. Imágenes en public/
console.log('\n--- 3. DETALLE DE IMÁGENES EN public/ ---');
const publicImages = [];
function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      scanDir(full);
    } else if (/\.(png|jpe?g|webp|gif|svg)$/i.test(f)) {
      publicImages.push({
        path: path.relative(process.cwd(), full).replace(/\\/g, '/'),
        size: stat.size,
        ext: path.extname(f).toLowerCase()
      });
    }
  });
}
scanDir(path.join(process.cwd(), 'public'));

const heavyPublicImages = publicImages.filter(img => img.size > 300 * 1024);
const totalPublicImgSize = publicImages.reduce((acc, img) => acc + img.size, 0);
const heavyPublicImgSize = heavyPublicImages.reduce((acc, img) => acc + img.size, 0);

console.log(`Total imágenes en public/: ${publicImages.length} (${(totalPublicImgSize / (1024 * 1024)).toFixed(2)} MB)`);
console.log(`Imágenes en public/ > 300 KB: ${heavyPublicImages.length} (${(heavyPublicImgSize / (1024 * 1024)).toFixed(2)} MB)`);

// 4. Paquetes y objetos Git
console.log('\n--- 4. TAMAÑO DE OBJETOS GIT (git count-objects) ---');
try {
  const countObjects = execSync('git count-objects -v', { encoding: 'utf8' });
  console.log(countObjects.trim());
} catch (e) {
  console.log('No se pudo ejecutar git count-objects');
}

console.log('\n===============================================================');
console.log('✅ AUDITORÍA COMPLETADA');
console.log('===============================================================');
