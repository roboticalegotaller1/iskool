import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const brainDir = 'C:\\Users\\kami-\\.gemini\\antigravity-ide\\brain\\0227a18f-11ff-470d-8b55-208b40ddbd6b';
const targetDir = 'c:\\Users\\kami-\\.gemini\\antigravity-ide\\scratch\\ISkool\\public\\redisenos_assets\\torneo_tcg';

const cards = [
  { src: 'card_tcg_marie_curie_1793071689567.jpg', dest: 'tcg_card_marie_curie.jpg', width: 800 },
  { src: 'card_tcg_einstein_1793071730756.jpg', dest: 'tcg_card_albert_einstein.jpg', width: 800 },
  { src: 'card_tcg_leonardo_davinci_1793071777178.jpg', dest: 'tcg_card_leonardo_davinci.jpg', width: 800 },
  { src: 'card_tcg_galileo_galilei_1793071824693.jpg', dest: 'tcg_card_galileo_galilei.jpg', width: 800 },
  { src: 'card_tcg_nikola_tesla_1793071875816.jpg', dest: 'tcg_card_nikola_tesla.jpg', width: 800 },
  { src: 'card_tcg_charles_darwin_1793071927969.jpg', dest: 'tcg_card_charles_darwin.jpg', width: 800 },
  { src: 'card_tcg_hypatia_1793071981051.jpg', dest: 'tcg_card_hypatia_alexandria.jpg', width: 800 }
];

async function run() {
  for (const c of cards) {
    const srcPath = path.join(brainDir, c.src);
    const destPath = path.join(targetDir, c.dest);
    if (fs.existsSync(srcPath)) {
      await sharp(srcPath)
        .resize({ width: c.width, fit: 'inside' })
        .jpeg({ quality: 82, progressive: true })
        .toFile(destPath);
      const s = fs.statSync(destPath);
      console.log(`✅ Optimizado: ${c.dest} (${(s.size / 1024).toFixed(1)} KB)`);
    } else {
      console.error(`❌ No encontrado: ${srcPath}`);
    }
  }
}

run().catch(console.error);
