import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const filesToProcess = [
  {
    src: 'public/redisenos_assets/gamification_secundaria_gremio_esports_1792732846760.jpg',
    dest: 'public/redisenos_assets/gremio_cyber/cyber_master_hub_scene.jpg',
    width: 1920,
    quality: 85
  },
  {
    src: 'public/redisenos_assets/gamification_quiz_secundaria_cyber_duel_1792734640480.jpg',
    dest: 'public/redisenos_assets/gremio_cyber/cyber_arena_duel_scene.jpg',
    width: 1920,
    quality: 85
  },
  {
    src: 'public/redisenos_assets/gamification_avatar_secundaria_customizer_1792734666483.jpg',
    dest: 'public/redisenos_assets/gremio_cyber/cyber_locker_scene.jpg',
    width: 1920,
    quality: 85
  },
  {
    src: 'public/redisenos_assets/enemy_cyber_glitch_dragon_1792738786143.jpg',
    dest: 'public/redisenos_assets/gremio_cyber/cyber_raid_boss_chronos.jpg',
    width: 1280,
    quality: 85
  },
  {
    src: 'public/redisenos_assets/gamification_teacher_universal_studio_1792734542445.jpg',
    dest: 'public/redisenos_assets/gremio_cyber/cyber_teacher_studio.jpg',
    width: 1920,
    quality: 85
  }
];

async function run() {
  for (const item of filesToProcess) {
    if (!fs.existsSync(item.src)) {
      console.error(`Source file not found: ${item.src}`);
      continue;
    }
    const info = await sharp(item.src)
      .resize({ width: item.width, withoutEnlargement: true })
      .jpeg({ quality: item.quality, mozjpeg: true })
      .toFile(item.dest);
    console.log(`Saved: ${item.dest} (${(info.size / 1024).toFixed(1)} KB)`);
  }
}

run().catch(console.error);
