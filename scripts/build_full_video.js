const fs = require('fs');
const path = require('path');
const { spawnSync, execSync } = require('child_process');
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;

const framesDir = path.join(__dirname, '..', 'temp_video_frames');
const audioDir = path.join(__dirname, '..', 'temp_video_audio');
const outputDir = path.join(__dirname, '..');
const tempClipsDir = path.join(outputDir, 'temp_video_clips');
if (!fs.existsSync(tempClipsDir)) fs.mkdirSync(tempClipsDir, { recursive: true });

const FPS = 30;

const scenes = [
  {
    id: 1,
    duration: 12.0,
    zoomExpr: "zoompan=z='min(zoom+0.0005,1.06)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'",
    voiceDelay: 0.3
  },
  {
    id: 2,
    duration: 12.0,
    zoomExpr: "zoompan=z='min(zoom+0.0006,1.07)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'",
    voiceDelay: 0.3
  },
  {
    id: 3,
    duration: 14.5,
    zoomExpr: "zoompan=z='min(zoom+0.0005,1.07)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'",
    voiceDelay: 0.4
  },
  {
    id: 4,
    duration: 15.0,
    zoomExpr: "zoompan=z='min(zoom+0.0005,1.075)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'",
    voiceDelay: 0.4
  },
  {
    id: 5,
    duration: 14.0,
    zoomExpr: "zoompan=z='min(zoom+0.0005,1.07)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'",
    voiceDelay: 0.3
  },
  {
    id: 6,
    duration: 11.5,
    zoomExpr: "zoompan=z='min(zoom+0.0006,1.07)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'",
    voiceDelay: 0.3
  },
  {
    id: 7,
    duration: 11.0,
    zoomExpr: "zoompan=z='min(zoom+0.0006,1.065)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'",
    voiceDelay: 0.3
  }
];

console.log('🎬 Step 1: Rendering dynamic Ken Burns video clips for all 7 scenes...');

const clipFiles = [];
for (const s of scenes) {
  const slideImg = path.join(framesDir, `scene_slide_${s.id}.png`);
  const clipPath = path.join(tempClipsDir, `clip_${s.id}.mp4`);
  clipFiles.push(clipPath);

  const totalFrames = Math.round(s.duration * FPS);
  console.log(`🎥 Encoding Scene ${s.id} (${s.duration}s @ ${FPS}fps = ${totalFrames} frames)...`);

  const filter = `${s.zoomExpr}:d=${totalFrames}:s=1920x1080:fps=${FPS}`;
  const args = [
    '-y',
    '-loop', '1',
    '-i', slideImg,
    '-vf', filter,
    '-t', s.duration.toString(),
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-pix_fmt', 'yuv420p',
    clipPath
  ];

  const res = spawnSync(ffmpeg, args);
  if (res.status !== 0) {
    console.error(`Error rendering clip ${s.id}:`, res.stderr.toString());
    process.exit(1);
  }
  console.log(`✅ Scene ${s.id} clip encoded.`);
}

console.log('\n🎞️ Step 2: Concatenating video clips into unified 90-second video stream...');
const concatListPath = path.join(tempClipsDir, 'concat_list.txt');
const concatContent = clipFiles.map(f => `file '${f.replace(/\\/g, '/')}'`).join('\n');
fs.writeFileSync(concatListPath, concatContent, 'utf8');

const rawVideoPath = path.join(tempClipsDir, 'raw_visual_90s.mp4');
const concatRes = spawnSync(ffmpeg, [
  '-y',
  '-f', 'concat',
  '-safe', '0',
  '-i', concatListPath,
  '-c', 'copy',
  rawVideoPath
]);
if (concatRes.status !== 0) {
  console.error('Error concatenating clips:', concatRes.stderr.toString());
  process.exit(1);
}
console.log(`✅ Unified 90s video stream assembled: ${rawVideoPath}`);

console.log('\n🎙️ Step 3: Compiling complete synchronized audio timeline...');
// Calculate exact start times for each voiceover
let currentTime = 0;
const voiceInputs = [];
const filterParts = [];

scenes.forEach((s, idx) => {
  const wavPath = path.join(audioDir, `final_voice_${s.id}.wav`);
  voiceInputs.push('-i', wavPath);
  const startMs = Math.round((currentTime + s.voiceDelay) * 1000);
  filterParts.push(`[${idx + 1}:a]adelay=${startMs}|${startMs}[a${idx + 1}]`);
  currentTime += s.duration;
});

// Ambient music input
const ambientMusicPath = path.join(audioDir, 'ambient_music.wav');
const totalInputs = scenes.length + 1; // 7 voices + 1 music
// Mix all delayed voice streams together
const mixLabels = scenes.map((_, idx) => `[a${idx + 1}]`).join('');
const filterComplex = [
  ...filterParts,
  `${mixLabels}amix=inputs=${scenes.length}:dropout_transition=0:normalize=0[voices]`,
  `[0:a]volume=0.22,lowpass=f=3500[music]`,
  `[music][voices]amix=inputs=2:duration=first:dropout_transition=0:normalize=0[final_audio]`
].join(';');

const finalWavPath = path.join(tempClipsDir, 'final_soundtrack_90s.wav');
const audioArgs = [
  '-y',
  '-i', ambientMusicPath,
  ...voiceInputs,
  '-filter_complex', filterComplex,
  '-map', '[final_audio]',
  '-t', '90',
  finalWavPath
];

console.log('🎛️ Mixing voices with ambient music & audio ducking...');
const audioRes = spawnSync(ffmpeg, audioArgs);
if (audioRes.status !== 0) {
  console.error('Error mixing audio:', audioRes.stderr.toString());
  process.exit(1);
}
console.log(`✅ Master audio soundtrack generated: ${finalWavPath}`);

console.log('\n🚀 Step 4: Multiplexing video and audio into final MP4 presentation...');
const finalMp4Path = path.join(outputDir, 'ISkool_Presentacion_Comercial_90s.mp4');

const finalMuxArgs = [
  '-y',
  '-i', rawVideoPath,
  '-i', finalWavPath,
  '-c:v', 'copy',
  '-c:a', 'aac',
  '-b:a', '192k',
  '-movflags', '+faststart',
  '-t', '90.0',
  finalMp4Path
];

const muxRes = spawnSync(ffmpeg, finalMuxArgs);
if (muxRes.status !== 0) {
  console.error('Error multiplexing final video:', muxRes.stderr.toString());
  process.exit(1);
}

const stats = fs.statSync(finalMp4Path);
console.log('\n======================================================');
console.log(`🎉 VIDEO COMERCIAL GENERADO CON ÉXITO:`);
console.log(`📁 Ruta: ${finalMp4Path}`);
console.log(`📊 Tamaño del archivo: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
console.log('⏱️ Duración: EXACTAMENTE 90 SEGUNDOS (1:30)');
console.log('======================================================');

// Inspect with ffmpeg to verify streams
const verify = spawnSync(ffmpeg, ['-i', finalMp4Path]);
console.log('\n🔍 FFMPEG STREAM REPORT:');
console.log(verify.stderr.toString().split('\n').filter(l => l.includes('Duration:') || l.includes('Stream #')).join('\n'));
