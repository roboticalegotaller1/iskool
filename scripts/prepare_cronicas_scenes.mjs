import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const sourceDir = 'C:\\Users\\kami-\\.gemini\\antigravity-ide\\brain\\7c1b550f-a889-4311-abec-4547336878b7';
const targetDir = 'c:\\Users\\kami-\\.gemini\\antigravity-ide\\scratch\\ISkool\\public\\redisenos_assets\\cronicas';

const tasks = [
  {
    src: 'gamification_primaria_alta_cronicas_1792732799979.jpg',
    dest: 'cronicas_main_hub_scene.jpg',
    width: 1920,
    height: 1080
  },
  {
    src: 'gamification_quiz_primaria_alta_tcg_1792734618682.jpg',
    dest: 'cronicas_tcg_arena_scene.jpg',
    width: 1920,
    height: 1080
  },
  {
    src: 'gamification_avatar_primaria_baja_album_1792734760601.jpg',
    dest: 'cronicas_album_customizer_scene.jpg',
    width: 1920,
    height: 1080
  },
  {
    src: 'gamification_teacher_universal_studio_1792734542445.jpg',
    dest: 'cronicas_teacher_studio_scene.jpg',
    width: 1920,
    height: 1080
  }
];

async function processScenes() {
  for (const t of tasks) {
    const srcPath = path.join(sourceDir, t.src);
    const destPath = path.join(targetDir, t.dest);

    if (fs.existsSync(srcPath)) {
      await sharp(srcPath)
        .resize({ width: 1600, height: 900, fit: 'inside' })
        .jpeg({ quality: 80, progressive: true })
        .toFile(destPath);
      const stat = fs.statSync(destPath);
      console.log(`✅ Procesado: ${t.dest} -> ${(stat.size / 1024).toFixed(1)} KB`);
    } else {
      console.error(`❌ No encontrado: ${srcPath}`);
    }
  }
}

processScenes().catch(console.error);
