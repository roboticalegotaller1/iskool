const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ffmpegPath = path.resolve('node_modules/@ffmpeg-installer/win32-x64/ffmpeg.exe');
const imgDir = path.resolve('public/images/languages/3d');
const outDir = path.resolve('public/images/languages/3d/movies');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Create an input file list for concat or image sequence
// Let's create an input sequence of Claire's poses:
// Idle -> Talk A -> Talk B -> Talk C -> Talk A -> Idle
const frames = [
  path.join(imgDir, 'mentor_female_3d.webp'),
  path.join(imgDir, 'mentor_female_3d_talk_a.webp'),
  path.join(imgDir, 'mentor_female_3d_talk_b.webp'),
  path.join(imgDir, 'mentor_female_3d_talk_c.webp'),
  path.join(imgDir, 'mentor_female_3d_talk_a.webp'),
  path.join(imgDir, 'mentor_female_3d.webp'),
];

console.log('Frames to interpolate:', frames);

// Test 1: Using concat filter with crossfade/fade or minterpolate
// Let's test creating a sequence at 2 fps, then interpolating to 24 fps with minterpolate
// First create a temp folder with frames numbered
const tempDir = path.resolve('scratch/interpol_test');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

// Copy frames with repeated duration or sequence
frames.forEach((f, idx) => {
  const dest = path.join(tempDir, `frame_${String(idx).padStart(3, '0')}.png`);
  execSync(`"${ffmpegPath}" -y -i "${f}" -vf "scale=512:512" "${dest}"`, { stdio: 'inherit' });
});

console.log('Converted test frames to 512x512 PNG');

// Now run minterpolate from 2 fps to 24 fps
const testOut = path.join(outDir, 'claire_talk_minterpolate.mp4');
const cmd = `"${ffmpegPath}" -y -framerate 1.5 -i "${tempDir}/frame_%03d.png" -vf "minterpolate=fps=24:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1" -c:v libx264 -pix_fmt yuv420p -preset fast "${testOut}"`;

console.log('Running minterpolate command...');
const start = Date.now();
try {
  execSync(cmd, { stdio: 'inherit' });
  console.log(`Success! Video saved to ${testOut} in ${(Date.now() - start)/1000}s`);
  const stats = fs.statSync(testOut);
  console.log(`Size: ${(stats.size / 1024).toFixed(1)} KB`);
} catch (e) {
  console.error('Minterpolate failed:', e.message);
}
