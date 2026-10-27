import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const brainDir = 'C:\\Users\\kami-\\.gemini\\antigravity-ide\\brain\\0227a18f-11ff-470d-8b55-208b40ddbd6b';
const targetDir = 'c:\\Users\\kami-\\.gemini\\antigravity-ide\\scratch\\ISkool\\public\\redisenos_assets\\cronicas';

const items = [
  { src: 'card_tcg_newton_fullart_1793067542136.jpg', dest: 'tcg_card_newton.jpg', width: 800 },
  { src: 'card_tcg_termodinamica_1793067567214.jpg', dest: 'tcg_card_termodinamica.jpg', width: 800 },
  { src: 'card_tcg_teoria_celular_1793067594689.jpg', dest: 'tcg_card_celular.jpg', width: 800 },
  { src: 'card_tcg_maya_cero_1793067625215.jpg', dest: 'tcg_card_maya.jpg', width: 800 },
  { src: 'alquimia_hierba_lacandona_1793067655780.jpg', dest: 'alquimia_hierba.jpg', width: 512 },
  { src: 'alquimia_roca_basalto_1793067693768.jpg', dest: 'alquimia_roca.jpg', width: 512 },
  { src: 'alquimia_pocion_ciencia_1793067727511.jpg', dest: 'alquimia_pocion.jpg', width: 512 }
];

async function run() {
  for (const item of items) {
    const srcPath = path.join(brainDir, item.src);
    const destPath = path.join(targetDir, item.dest);
    if (fs.existsSync(srcPath)) {
      await sharp(srcPath)
        .resize({ width: item.width, fit: 'inside' })
        .jpeg({ quality: 82, progressive: true })
        .toFile(destPath);
      const s = fs.statSync(destPath);
      console.log(`✅ Optimizado: ${item.dest} (${(s.size / 1024).toFixed(1)} KB)`);
    } else {
      console.error(`❌ No encontrado: ${srcPath}`);
    }
  }
}

run().catch(console.error);
