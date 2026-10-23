const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

sharp.cache(false);

const uploadsDir = 'C:/Users/kami-/.gemini/antigravity-ide/brain/857a2b8b-6bf7-44b2-a4b6-0eba05c0008a/.user_uploaded';
const outputDir = path.join(__dirname, '..', 'public', 'redisenos_assets', 'huellitas');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const scenes = [
  {
    src: path.join(uploadsDir, 'media_1792756538204.jpg'),
    dest: path.join(outputDir, 'reino_huellitas_main_scene.jpg'),
    maxDim: 1280,
    quality: 82
  },
  {
    src: path.join(uploadsDir, 'media_1792756811174.jpg'),
    dest: path.join(outputDir, 'reino_huellitas_tablet_challenge.jpg'),
    maxDim: 1280,
    quality: 82
  },
  {
    src: path.join(uploadsDir, 'media_1792756820370.jpg'),
    dest: path.join(outputDir, 'reino_huellitas_companion_customizer.jpg'),
    maxDim: 1280,
    quality: 82
  }
];

async function run() {
  for (const item of scenes) {
    if (!fs.existsSync(item.src)) {
      console.warn(`File not found: ${item.src}`);
      continue;
    }
    const inputBuf = fs.readFileSync(item.src);
    const meta = await sharp(inputBuf).metadata();
    console.log(`Original ${path.basename(item.src)}: ${meta.width}x${meta.height}, ${(inputBuf.length / 1024).toFixed(1)} KB`);

    const processedBuf = await sharp(inputBuf)
      .resize({
        width: item.maxDim,
        height: item.maxDim,
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: item.quality, mozjpeg: true })
      .toBuffer();

    fs.writeFileSync(item.dest, processedBuf);
    console.log(`Saved compressed ${path.basename(item.dest)}: ${(processedBuf.length / 1024).toFixed(1)} KB (Target < 300KB)`);
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
