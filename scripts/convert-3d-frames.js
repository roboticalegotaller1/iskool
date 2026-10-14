const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ffmpegPath = path.resolve('node_modules/@ffmpeg-installer/win32-x64/ffmpeg.exe');
const artifactDir = 'C:\\Users\\kami-\\.gemini\\antigravity-ide\\brain\\9a79c26f-7b3c-4f99-b67d-a16db2e5f23f';
const outputDir = path.resolve('public/images/languages/3d');

const filesToConvert = [
  { src: 'arthur_gesture_talk_a_1792005344448.jpg', dest: 'mentor_male_3d_talk_a.webp' },
  { src: 'arthur_gesture_talk_b_1792005368224.jpg', dest: 'mentor_male_3d_talk_b.webp' },
  { src: 'arthur_gesture_talk_c_1792005394979.jpg', dest: 'mentor_male_3d_talk_c.webp' },
  { src: 'claire_gesture_talk_a_1792005422904.jpg', dest: 'mentor_female_3d_talk_a.webp' },
  { src: 'claire_gesture_talk_b_1792005446746.jpg', dest: 'mentor_female_3d_talk_b.webp' },
  { src: 'claire_gesture_talk_c_1792005475777.jpg', dest: 'mentor_female_3d_talk_c.webp' },
  { src: 'shakespeare_gesture_talk_1792005508402.jpg', dest: 'shakespeare_3d_talk.webp' },
  { src: 'ada_gesture_talk_1792005544266.jpg', dest: 'ada_lovelace_3d_talk.webp' },
  { src: 'lincoln_gesture_talk_1792005591812.jpg', dest: 'abraham_lincoln_3d_talk.webp' },
  { src: 'napoleon_gesture_talk_1792005627488.jpg', dest: 'napoleon_3d_talk.webp' }
];

for (const item of filesToConvert) {
  const input = path.join(artifactDir, item.src);
  const output = path.join(outputDir, item.dest);
  if (!fs.existsSync(input)) {
    console.warn(`File not found: ${input}`);
    continue;
  }
  // Convert to WebP, quality 85, scale to 1024x1024 or proportional
  const cmd = `"${ffmpegPath}" -y -i "${input}" -vf "scale=1024:1024:force_original_aspect_ratio=decrease,pad=1024:1024:(ow-iw)/2:(oh-ih)/2:color=0x00000000" -c:v libwebp -quality 85 "${output}"`;
  try {
    execSync(cmd, { stdio: 'inherit' });
    const stats = fs.statSync(output);
    console.log(`Successfully converted ${item.dest}: ${(stats.size / 1024).toFixed(1)} KB`);
  } catch (err) {
    console.error(`Failed to convert ${item.src}:`, err.message);
  }
}
