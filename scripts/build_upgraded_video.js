const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;

const framesDir = path.join(__dirname, '..', 'temp_video_frames');
const tempClipsDir = path.join(__dirname, '..', 'temp_video_clips');
const outputDir = path.join(__dirname, '..');
if (!fs.existsSync(tempClipsDir)) fs.mkdirSync(tempClipsDir, { recursive: true });

const FPS = 30;

const scenes = [
  {
    id: 1,
    duration: 10.0,
    zoomExpr: "zoompan=z='min(zoom+0.0006,1.06)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
  },
  {
    id: 2,
    duration: 10.0,
    zoomExpr: "zoompan=z='min(zoom+0.0007,1.07)':x='iw/2-(iw/zoom/2)-50':y='ih/2-(ih/zoom/2)'"
  },
  {
    id: 3,
    duration: 10.0,
    zoomExpr: "zoompan=z='min(zoom+0.0007,1.07)':x='iw/2-(iw/zoom/2)-40':y='ih/2-(ih/zoom/2)'"
  },
  {
    id: 4,
    duration: 10.0,
    zoomExpr: "zoompan=z='min(zoom+0.0007,1.07)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
  },
  {
    id: 5,
    duration: 10.0,
    zoomExpr: "zoompan=z='min(zoom+0.0007,1.07)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
  },
  {
    id: 6,
    duration: 10.0,
    zoomExpr: "zoompan=z='min(zoom+0.0008,1.08)':x='iw/2-(iw/zoom/2)-30':y='ih/2-(ih/zoom/2)+20'"
  },
  {
    id: 7,
    duration: 10.0,
    zoomExpr: "zoompan=z='min(zoom+0.0007,1.07)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
  },
  {
    id: 8,
    duration: 5.0,
    zoomExpr: "zoompan=z='min(zoom+0.0008,1.05)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
  },
  {
    id: 9,
    duration: 5.0,
    zoomExpr: "zoompan=z='min(zoom+0.0008,1.05)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
  },
  {
    id: 10,
    duration: 10.0,
    zoomExpr: "zoompan=z='min(zoom+0.0006,1.06)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
  }
];

console.log('🎬 Encoding 10 High-Impact Visual Clips with Ken Burns Motion...');
const clipFiles = [];

for (const s of scenes) {
  const slideImg = path.join(framesDir, `scene_slide_${s.id}.png`);
  const clipPath = path.join(tempClipsDir, `upgraded_clip_${s.id}.mp4`);
  clipFiles.push(clipPath);

  const totalFrames = Math.round(s.duration * FPS);
  console.log(`🎥 Scene ${s.id} (${s.duration}s @ ${FPS}fps = ${totalFrames} frames)...`);

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
  console.log(`✅ Scene ${s.id} encoded.`);
}

console.log('\n🎞️ Concatenating all 10 clips into single 90s master video stream...');
const concatListPath = path.join(tempClipsDir, 'upgraded_concat_list.txt');
const concatContent = clipFiles.map(f => `file '${f.replace(/\\/g, '/')}'`).join('\n');
fs.writeFileSync(concatListPath, concatContent, 'utf8');

const rawVideoPath = path.join(tempClipsDir, 'upgraded_raw_90s.mp4');
const concatRes = spawnSync(ffmpeg, [
  '-y',
  '-f', 'concat',
  '-safe', '0',
  '-i', concatListPath,
  '-c', 'copy',
  rawVideoPath
]);
if (concatRes.status !== 0) {
  console.error('Concat error:', concatRes.stderr.toString());
  process.exit(1);
}
console.log(`✅ 90s visual stream ready: ${rawVideoPath}`);

console.log('\n🚀 Multiplexing final MP4 with high-energy commercial soundtrack...');
const soundtrackPath = path.join(outputDir, 'commercial_soundtrack_90s.wav');
const finalMp4Path = path.join(outputDir, 'ISkool_Presentacion_Comercial_90s.mp4');

const finalMuxArgs = [
  '-y',
  '-i', rawVideoPath,
  '-i', soundtrackPath,
  '-c:v', 'copy',
  '-c:a', 'aac',
  '-b:a', '256k',
  '-movflags', '+faststart',
  '-t', '90.0',
  finalMp4Path
];

const muxRes = spawnSync(ffmpeg, finalMuxArgs);
if (muxRes.status !== 0) {
  console.error('Mux error:', muxRes.stderr.toString());
  process.exit(1);
}

const stats = fs.statSync(finalMp4Path);
console.log('\n======================================================');
console.log('🎉 VIDEO COMERCIAL DE ALTO IMPACTO ACTUALIZADO:');
console.log(`📁 Archivo: ${finalMp4Path}`);
console.log(`📊 Tamaño: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
console.log('⏱️ Duración: EXACTAMENTE 90 SEGUNDOS (01:30)');
console.log('🎯 Calidad: Full HD 1080p @ 30fps · Audio 256 kbps');
console.log('======================================================');
