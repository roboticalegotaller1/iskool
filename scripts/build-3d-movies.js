const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ffmpegPath = path.resolve('node_modules/@ffmpeg-installer/win32-x64/ffmpeg.exe');
const imgDir = path.resolve('public/images/languages/3d');
const outDir = path.resolve('public/images/languages/3d/movies');
const tempRoot = path.resolve('scratch/movie_build');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
if (!fs.existsSync(tempRoot)) fs.mkdirSync(tempRoot, { recursive: true });

const characters = [
  {
    id: 'mentor_female',
    name: 'Prof. Claire',
    frames: [
      'mentor_female_3d.webp',
      'mentor_female_3d_talk_a.webp',
      'mentor_female_3d_talk_b.webp',
      'mentor_female_3d_talk_c.webp',
      'mentor_female_3d_talk_a.webp',
      'mentor_female_3d.webp'
    ]
  },
  {
    id: 'mentor_male',
    name: 'Prof. Arthur',
    frames: [
      'mentor_male_3d_v2.webp',
      'mentor_male_3d_talk_a.webp',
      'mentor_male_3d_talk_b.webp',
      'mentor_male_3d_talk_c.webp',
      'mentor_male_3d_talk_a.webp',
      'mentor_male_3d_v2.webp'
    ]
  },
  {
    id: 'shakespeare',
    name: 'William Shakespeare',
    frames: [
      'shakespeare_3d.webp',
      'shakespeare_3d_talk.webp',
      'shakespeare_3d_talk_b.webp',
      'shakespeare_3d_talk.webp',
      'shakespeare_3d.webp'
    ]
  },
  {
    id: 'ada_lovelace',
    name: 'Ada Lovelace',
    frames: [
      'ada_lovelace_3d.webp',
      'ada_lovelace_3d_talk.webp',
      'ada_lovelace_3d_talk_b.webp',
      'ada_lovelace_3d_talk.webp',
      'ada_lovelace_3d.webp'
    ]
  },
  {
    id: 'abraham_lincoln',
    name: 'Abraham Lincoln',
    frames: [
      'abraham_lincoln_3d.webp',
      'abraham_lincoln_3d_talk.webp',
      'abraham_lincoln_3d_talk_b.webp',
      'abraham_lincoln_3d_talk.webp',
      'abraham_lincoln_3d.webp'
    ]
  },
  {
    id: 'napoleon',
    name: 'Napoleon Bonaparte',
    frames: [
      'napoleon_3d.webp',
      'napoleon_3d_talk.webp',
      'napoleon_3d_talk_b.webp',
      'napoleon_3d_talk.webp',
      'napoleon_3d.webp'
    ]
  },
  {
    id: 'marie_curie',
    name: 'Marie Curie',
    frames: [
      'marie_curie_3d.webp',
      'marie_curie_3d_talk.webp',
      'marie_curie_3d.webp'
    ]
  }
];

for (const char of characters) {
  console.log(`\n========================================`);
  console.log(`Building 3D fluid motion movie for: ${char.name} (${char.id})`);
  console.log(`========================================`);

  const charTemp = path.join(tempRoot, char.id);
  if (!fs.existsSync(charTemp)) fs.mkdirSync(charTemp, { recursive: true });

  // 1. Prepare frames scaled to 640x640 (optimal resolution, crisp on retina, under 150KB)
  char.frames.forEach((fName, idx) => {
    const srcPath = path.join(imgDir, fName);
    const destPath = path.join(charTemp, `frame_${String(idx).padStart(3, '0')}.png`);
    if (!fs.existsSync(srcPath)) {
      console.warn(`Frame not found: ${srcPath}`);
      return;
    }
    execSync(`"${ffmpegPath}" -y -i "${srcPath}" -vf "scale=640:640" "${destPath}"`, { stdio: 'ignore' });
  });

  const outMp4 = path.join(outDir, `${char.id}_talk.mp4`);
  const frameRate = char.frames.length >= 5 ? 1.7 : 1.3;

  // 2. Optical-flow motion interpolation with minterpolate at 24 fps
  const cmd = `"${ffmpegPath}" -y -framerate ${frameRate} -i "${charTemp}/frame_%03d.png" -vf "minterpolate=fps=24:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1" -c:v libx264 -pix_fmt yuv420p -preset fast -crf 23 -movflags +faststart "${outMp4}"`;

  try {
    const t0 = Date.now();
    execSync(cmd, { stdio: 'inherit' });
    const stats = fs.statSync(outMp4);
    console.log(`✅ Generated ${char.id}_talk.mp4 (${(stats.size / 1024).toFixed(1)} KB) in ${((Date.now() - t0)/1000).toFixed(1)}s`);
  } catch (err) {
    console.error(`❌ Failed to build movie for ${char.id}:`, err.message);
  }
}

console.log('\nAll 3D character motion movies generated successfully!');
