const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const targetDir = path.join(__dirname, '..', 'public', 'images', 'languages', '3d');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const images = [
  {
    src: 'C:/Users/kami-/.gemini/antigravity-ide/brain/638279bd-30ac-46eb-8d99-8bc736940f33/avatar_3d_mentor_male_1791944417051.jpg',
    outName: 'mentor_male_3d.webp'
  },
  {
    src: 'C:/Users/kami-/.gemini/antigravity-ide/brain/638279bd-30ac-46eb-8d99-8bc736940f33/avatar_3d_mentor_female_1791944436329.jpg',
    outName: 'mentor_female_3d.webp'
  },
  {
    src: 'C:/Users/kami-/.gemini/antigravity-ide/brain/638279bd-30ac-46eb-8d99-8bc736940f33/avatar_3d_ada_lovelace_1791944474944.jpg',
    outName: 'ada_lovelace_3d.webp'
  },
  {
    src: 'C:/Users/kami-/.gemini/antigravity-ide/brain/638279bd-30ac-46eb-8d99-8bc736940f33/avatar_3d_shakespeare_1791944500324.jpg',
    outName: 'shakespeare_3d.webp'
  },
  {
    src: 'C:/Users/kami-/.gemini/antigravity-ide/brain/638279bd-30ac-46eb-8d99-8bc736940f33/avatar_3d_abraham_lincoln_1791944525559.jpg',
    outName: 'abraham_lincoln_3d.webp'
  },
  {
    src: 'C:/Users/kami-/.gemini/antigravity-ide/brain/638279bd-30ac-46eb-8d99-8bc736940f33/avatar_3d_marie_curie_1791944556374.jpg',
    outName: 'marie_curie_3d.webp'
  },
  {
    src: 'C:/Users/kami-/.gemini/antigravity-ide/brain/638279bd-30ac-46eb-8d99-8bc736940f33/avatar_3d_napoleon_1791944582892.jpg',
    outName: 'napoleon_3d.webp'
  }
];

async function processAll() {
  for (const img of images) {
    const outPath = path.join(targetDir, img.outName);
    console.log(`Processing ${img.src} -> ${outPath}`);
    await sharp(img.src)
      .resize(1024, 1024, { fit: 'cover', position: 'top' })
      .webp({ quality: 84, effort: 5 })
      .toFile(outPath);
    
    const stats = fs.statSync(outPath);
    console.log(`Created ${img.outName}: ${(stats.size / 1024).toFixed(1)} KB`);
  }
  console.log('All 3D avatars optimized and compressed successfully.');
}

processAll().catch(err => {
  console.error(err);
  process.exit(1);
});
