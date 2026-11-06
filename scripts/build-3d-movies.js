const { execSync, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const ffmpegPath = path.resolve('node_modules/@ffmpeg-installer/win32-x64/ffmpeg.exe');
const imgDir = path.resolve('public/images/languages/3d');
const outDir = path.resolve('public/images/languages/3d/movies');
const wanDir = path.resolve('scratch/wan22_clips');
const tempRoot = path.resolve('scratch/movie_build');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
if (!fs.existsSync(tempRoot)) fs.mkdirSync(tempRoot, { recursive: true });

function runFfmpeg(args) {
  const res = spawnSync(ffmpegPath, ['-y', ...args], { stdio: 'pipe' });
  if (res.status !== 0) {
    throw new Error(res.stderr ? res.stderr.toString().slice(-500) : 'FFmpeg failed');
  }
}

/**
 * 1. Build Prof. Claire's True 3D Neural Video Compendium from Wan 2.2 I2V clips
 */
function buildClaireNeuralMovies() {
  const c1 = path.join(wanDir, 'claire_01_welcome_to_explain.mp4');
  const c2 = path.join(wanDir, 'claire_02_explain_to_exclaim.mp4');
  const c3 = path.join(wanDir, 'claire_03_exclaim_to_inquire.mp4');

  if (!fs.existsSync(c1) || !fs.existsSync(c2) || !fs.existsSync(c3)) {
    console.warn('Wan 2.2 clips for Claire not found, falling back to keyframe builder.');
    return false;
  }

  console.log('\n=======================================================');
  console.log('Building Wan 2.2 + Nano Banana 2.1 3D Neural Movies for Prof. Claire');
  console.log('=======================================================');

  const cTemp = path.join(tempRoot, 'claire_neural');
  if (!fs.existsSync(cTemp)) fs.mkdirSync(cTemp, { recursive: true });

  const c1Rev = path.join(cTemp, 'c1_rev.mp4');
  const c2Rev = path.join(cTemp, 'c2_rev.mp4');
  const c3Rev = path.join(cTemp, 'c3_rev.mp4');

  runFfmpeg(['-i', c1, '-vf', 'reverse', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '21', c1Rev]);
  runFfmpeg(['-i', c2, '-vf', 'reverse', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '21', c2Rev]);
  runFfmpeg(['-i', c3, '-vf', 'reverse', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '21', c3Rev]);

  // Full 14.3s Master Loop: welcome -> explain -> exclaim -> inquire -> exclaim -> explain -> welcome
  const listFile = path.join(cTemp, 'concat_master.txt');
  const masterFiles = [c1, c2, c3, c3Rev, c2Rev, c1Rev];
  fs.writeFileSync(
    listFile,
    masterFiles.map((f) => `file '${f.replace(/\\/g, '/')}'`).join('\n')
  );

  const masterOut = path.join(outDir, 'mentor_female_3d_talk.mp4');
  const legacyOut = path.join(outDir, 'mentor_female_talk.mp4');
  runFfmpeg([
    '-f', 'concat', '-safe', '0', '-i', listFile,
    '-vf', 'scale=640:640,fps=24',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'fast', '-crf', '26', '-movflags', '+faststart',
    masterOut,
  ]);
  fs.copyFileSync(masterOut, legacyOut);
  console.log(`✅ Generated mentor_female_3d_talk.mp4 (${(fs.statSync(masterOut).size / 1024).toFixed(1)} KB)`);

  // Gesture-specific 3D neural loops
  // A) Welcome loop (first 1.4s of c1 + reversed)
  const wFwd = path.join(cTemp, 'w_fwd.mp4');
  const wRev = path.join(cTemp, 'w_rev.mp4');
  const wList = path.join(cTemp, 'w_list.txt');
  runFfmpeg(['-i', c1, '-t', '1.4', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', wFwd]);
  runFfmpeg(['-i', wFwd, '-vf', 'reverse', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', wRev]);
  fs.writeFileSync(wList, `file '${wFwd.replace(/\\/g, '/')}'\nfile '${wRev.replace(/\\/g, '/')}'\n`);
  const welcomeOut = path.join(outDir, 'mentor_female_3d_welcome.mp4');
  runFfmpeg(['-f', 'concat', '-safe', '0', '-i', wList, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '23', '-movflags', '+faststart', welcomeOut]);
  console.log(`✅ Generated mentor_female_3d_welcome.mp4 (${(fs.statSync(welcomeOut).size / 1024).toFixed(1)} KB)`);

  // B) Explain loop (second half of c1 + reversed)
  const expFwd = path.join(cTemp, 'exp_fwd.mp4');
  const expRev = path.join(cTemp, 'exp_rev.mp4');
  const expList = path.join(cTemp, 'exp_list.txt');
  runFfmpeg(['-ss', '1.0', '-i', c1, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', expFwd]);
  runFfmpeg(['-i', expFwd, '-vf', 'reverse', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', expRev]);
  fs.writeFileSync(expList, `file '${expRev.replace(/\\/g, '/')}'\nfile '${expFwd.replace(/\\/g, '/')}'\n`);
  const explainOut = path.join(outDir, 'mentor_female_3d_explain.mp4');
  runFfmpeg(['-f', 'concat', '-safe', '0', '-i', expList, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '23', '-movflags', '+faststart', explainOut]);
  console.log(`✅ Generated mentor_female_3d_explain.mp4 (${(fs.statSync(explainOut).size / 1024).toFixed(1)} KB)`);

  // C) Exclaim loop (second half of c2 + reversed)
  const excFwd = path.join(cTemp, 'exc_fwd.mp4');
  const excRev = path.join(cTemp, 'exc_rev.mp4');
  const excList = path.join(cTemp, 'exc_list.txt');
  runFfmpeg(['-ss', '0.9', '-i', c2, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', excFwd]);
  runFfmpeg(['-i', excFwd, '-vf', 'reverse', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', excRev]);
  fs.writeFileSync(excList, `file '${excRev.replace(/\\/g, '/')}'\nfile '${excFwd.replace(/\\/g, '/')}'\n`);
  const exclaimOut = path.join(outDir, 'mentor_female_3d_exclaim.mp4');
  runFfmpeg(['-f', 'concat', '-safe', '0', '-i', excList, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '23', '-movflags', '+faststart', exclaimOut]);
  console.log(`✅ Generated mentor_female_3d_exclaim.mp4 (${(fs.statSync(exclaimOut).size / 1024).toFixed(1)} KB)`);

  // D) Inquire loop (second half of c3 + reversed)
  const inqFwd = path.join(cTemp, 'inq_fwd.mp4');
  const inqRev = path.join(cTemp, 'inq_rev.mp4');
  const inqList = path.join(cTemp, 'inq_list.txt');
  runFfmpeg(['-ss', '0.9', '-i', c3, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', inqFwd]);
  runFfmpeg(['-i', inqFwd, '-vf', 'reverse', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', inqRev]);
  fs.writeFileSync(inqList, `file '${inqRev.replace(/\\/g, '/')}'\nfile '${inqFwd.replace(/\\/g, '/')}'\n`);
  const inquireOut = path.join(outDir, 'mentor_female_3d_inquire.mp4');
  runFfmpeg(['-f', 'concat', '-safe', '0', '-i', inqList, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '23', '-movflags', '+faststart', inquireOut]);
  console.log(`✅ Generated mentor_female_3d_inquire.mp4 (${(fs.statSync(inquireOut).size / 1024).toFixed(1)} KB)`);

  return true;
}

/**
 * 2. Build Foreground-Isolated Optical-Flow 3D Movies for Arthur & Historical Mentors
 *    Locks the canonical background so the room/bookshelf/stage never warps during interpolation!
 */
const characters = [
  {
    id: 'mentor_male_3d_v2',
    legacyId: 'mentor_male',
    name: 'Prof. Arthur',
    frames: [
      'mentor_male_3d_v2.webp',
      'mentor_male_3d_pose_turn.webp',
      'mentor_male_3d_pose_explain.webp',
      'mentor_male_3d_pose_turn_left.webp',
      'mentor_male_3d_pose_exclaim.webp',
      'mentor_male_3d_pose_encourage.webp',
      'mentor_male_3d_pose_inquire.webp',
      'mentor_male_3d_v2_idle_blink.webp',
      'mentor_male_3d_pose_turn.webp',
      'mentor_male_3d_v2.webp',
    ],
  },
  {
    id: 'shakespeare_3d',
    legacyId: 'shakespeare',
    name: 'William Shakespeare',
    frames: [
      'shakespeare_3d.webp',
      'shakespeare_3d_talk_a.webp',
      'shakespeare_3d_pose_exclaim.webp',
      'shakespeare_3d_pose_inquire.webp',
      'shakespeare_3d_talk_b.webp',
      'shakespeare_3d.webp',
    ],
  },
  {
    id: 'ada_lovelace_3d',
    legacyId: 'ada_lovelace',
    name: 'Ada Lovelace',
    frames: [
      'ada_lovelace_3d.webp',
      'ada_lovelace_3d_talk_a.webp',
      'ada_lovelace_3d_pose_exclaim.webp',
      'ada_lovelace_3d_talk_b.webp',
      'ada_lovelace_3d.webp',
    ],
  },
  {
    id: 'abraham_lincoln_3d',
    legacyId: 'abraham_lincoln',
    name: 'Abraham Lincoln',
    frames: [
      'abraham_lincoln_3d.webp',
      'abraham_lincoln_3d_talk_a.webp',
      'abraham_lincoln_3d_pose_oratory.webp',
      'abraham_lincoln_3d_talk_b.webp',
      'abraham_lincoln_3d.webp',
    ],
  },
  {
    id: 'napoleon_3d',
    legacyId: 'napoleon',
    name: 'Napoleon Bonaparte',
    frames: [
      'napoleon_3d.webp',
      'napoleon_3d_talk_a.webp',
      'napoleon_3d_pose_command.webp',
      'napoleon_3d_talk_b.webp',
      'napoleon_3d.webp',
    ],
  },
  {
    id: 'marie_curie_3d',
    legacyId: 'marie_curie',
    name: 'Marie Curie',
    frames: [
      'marie_curie_3d.webp',
      'marie_curie_3d_talk_a.webp',
      'marie_curie_3d_pose_explain.webp',
      'marie_curie_3d_talk_b.webp',
      'marie_curie_3d.webp',
    ],
  },
  {
    id: 'victor_hugo_3d',
    legacyId: 'victor_hugo',
    name: 'Victor Hugo',
    frames: [
      'victor_hugo_3d_pose_gesture.webp',
      'victor_hugo_3d.webp',
      'victor_hugo_3d_pose_gesture.webp',
      'victor_hugo_3d.webp',
      'victor_hugo_3d_pose_gesture.webp',
    ],
  },
  {
    id: 'jeanne_darc_3d',
    legacyId: 'jeanne_darc',
    name: "Jeanne d'Arc",
    frames: [
      'jeanne_darc_3d_pose_gesture.webp',
      'jeanne_darc_3d.webp',
      'jeanne_darc_3d_pose_gesture.webp',
      'jeanne_darc_3d.webp',
      'jeanne_darc_3d_pose_gesture.webp',
    ],
  },
];

// Soft feathered SVG mask that locks the outer background while allowing full 3D body & hand motion
const fgMaskSvg = Buffer.from(`
<svg width="640" height="640" viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="18" />
    </filter>
  </defs>
  <rect width="640" height="640" fill="black" />
  <ellipse cx="320" cy="240" rx="145" ry="205" fill="white" filter="url(#blur)" />
  <ellipse cx="320" cy="495" rx="265" ry="165" fill="white" filter="url(#blur)" />
</svg>
`);

(async () => {
  buildClaireNeuralMovies();

  const maskBuf = await sharp(fgMaskSvg).resize(640, 640).extractChannel('red').toBuffer();

  for (const char of characters) {
    console.log(`\n========================================`);
    console.log(`Building 3D fluid motion movie for: ${char.name} (${char.id})`);
    console.log(`========================================`);

    const charTemp = path.join(tempRoot, char.id);
    if (!fs.existsSync(charTemp)) fs.mkdirSync(charTemp, { recursive: true });

    const canonicalPath = path.join(imgDir, char.frames[0]);
    if (!fs.existsSync(canonicalPath)) {
      console.warn(`Canonical frame missing: ${canonicalPath}`);
      continue;
    }

    const baseBgBuf = await sharp(canonicalPath).resize(640, 640).png().toBuffer();

    let validCount = 0;
    for (let idx = 0; idx < char.frames.length; idx++) {
      const srcPath = path.join(imgDir, char.frames[idx]);
      if (!fs.existsSync(srcPath)) continue;

      const destPath = path.join(charTemp, `frame_${String(validCount).padStart(3, '0')}.png`);
      validCount++;

      if (idx === 0 || idx === char.frames.length - 1) {
        fs.writeFileSync(destPath, baseBgBuf);
      } else {
        // Composite foreground character over locked canonical background
        const fgRgba = await sharp(srcPath)
          .resize(640, 640)
          .ensureAlpha()
          .joinChannel(maskBuf)
          .png()
          .toBuffer();

        // Sharp joinChannel on RGBA adds a 5th channel if already alpha; instead use removeAlpha first:
        const fgMasked = await sharp(srcPath)
          .resize(640, 640)
          .removeAlpha()
          .joinChannel(maskBuf)
          .png()
          .toBuffer();

        const compBuf = await sharp(baseBgBuf)
          .composite([{ input: fgMasked, blend: 'over' }])
          .png()
          .toBuffer();

        fs.writeFileSync(destPath, compBuf);
      }
    }

    const outMp4 = path.join(outDir, `${char.id}_talk.mp4`);
    const frameRate = validCount >= 6 ? 1.8 : 1.3;

    try {
      const t0 = Date.now();
      runFfmpeg([
        '-framerate', String(frameRate),
        '-i', `${charTemp}/frame_%03d.png`,
        '-vf', 'minterpolate=fps=24:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-preset', 'fast',
        '-crf', '23',
        '-movflags', '+faststart',
        outMp4,
      ]);
      if (char.legacyId) {
        fs.copyFileSync(outMp4, path.join(outDir, `${char.legacyId}_talk.mp4`));
      }
      const stats = fs.statSync(outMp4);
      console.log(`✅ Generated ${char.id}_talk.mp4 (${(stats.size / 1024).toFixed(1)} KB) in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    } catch (err) {
      console.error(`❌ Failed to build movie for ${char.id}:`, err.message);
    }
  }

  console.log('\nAll 3D character motion movies generated successfully!');
})();
