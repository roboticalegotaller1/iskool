const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;

const audioDir = path.join(__dirname, '..', 'temp_video_audio');
const tempClipsDir = path.join(__dirname, '..', 'temp_video_clips');
const outputDir = path.join(__dirname, '..');

const sampleRate = 44100;
const totalDuration = 90.0;
const totalSamples = Math.floor(sampleRate * totalDuration);

// Read ambient music (stereo 44100 16-bit)
const musicPath = path.join(audioDir, 'ambient_music.wav');
const musicBuf = fs.readFileSync(musicPath);
const musicDataOffset = 44;

// Master stereo float buffers
const masterLeft = new Float32Array(totalSamples);
const masterRight = new Float32Array(totalSamples);

// 1. Load ambient music
console.log('🎵 Loading ambient background music...');
for (let i = 0; i < totalSamples; i++) {
  const byteIdx = musicDataOffset + i * 4;
  if (byteIdx + 3 < musicBuf.length) {
    const sL = musicBuf.readInt16LE(byteIdx) / 32768.0;
    const sR = musicBuf.readInt16LE(byteIdx + 2) / 32768.0;
    masterLeft[i] = sL * 0.18;
    masterRight[i] = sR * 0.18;
  }
}

// 2. Scene timing definitions
const scenes = [
  { id: 1, duration: 12.0, delay: 0.3 },
  { id: 2, duration: 12.0, delay: 0.3 },
  { id: 3, duration: 14.5, delay: 0.4 },
  { id: 4, duration: 15.0, delay: 0.4 },
  { id: 5, duration: 14.0, delay: 0.3 },
  { id: 6, duration: 11.5, delay: 0.3 },
  { id: 7, duration: 11.0, delay: 0.3 }
];

console.log('🎙️ Layering Spanish narration voiceovers...');
let currentTime = 0;

scenes.forEach(s => {
  const wavPath = path.join(audioDir, `final_voice_${s.id}.wav`);
  const buf = fs.readFileSync(wavPath);
  
  // Read voice WAV header: sampleRate, channels, bits
  const channels = buf.readUInt16LE(22);
  const vSampleRate = buf.readUInt32LE(24);
  const bitsPerSample = buf.readUInt16LE(34);
  
  // Find 'data' chunk
  let dataOffset = 12;
  while (dataOffset < buf.length - 8) {
    const chunkId = buf.toString('ascii', dataOffset, dataOffset + 4);
    const chunkSize = buf.readUInt32LE(dataOffset + 4);
    if (chunkId === 'data') {
      dataOffset += 8;
      break;
    }
    dataOffset += 8 + chunkSize;
  }

  const numVoiceSamples = Math.floor((buf.length - dataOffset) / (channels * (bitsPerSample / 8)));
  const startTime = currentTime + s.delay;
  const startSample = Math.floor(startTime * sampleRate);

  console.log(`- Scene ${s.id} starting at ${startTime.toFixed(2)}s (Sample: ${startSample})`);

  for (let vi = 0; vi < numVoiceSamples; vi++) {
    // Resample if needed
    const t = vi / vSampleRate;
    const targetIdx = startSample + Math.floor(t * sampleRate);
    if (targetIdx >= totalSamples) break;

    const sampleByte = dataOffset + vi * (bitsPerSample / 8) * channels;
    if (sampleByte + 1 < buf.length) {
      const val = buf.readInt16LE(sampleByte) / 32768.0;
      // High presence voice gain
      const voiceGain = 0.95;
      masterLeft[targetIdx] += val * voiceGain;
      masterRight[targetIdx] += val * voiceGain;
    }
  }

  currentTime += s.duration;
});

// 3. Write final mixed stereo 44.1kHz 16-bit WAV
console.log('💾 Writing final mastered soundtrack...');
const outBuffer = Buffer.alloc(44 + totalSamples * 4);
outBuffer.write('RIFF', 0);
outBuffer.writeUInt32LE(36 + totalSamples * 4, 4);
outBuffer.write('WAVE', 8);
outBuffer.write('fmt ', 12);
outBuffer.writeUInt32LE(16, 16);
outBuffer.writeUInt16LE(1, 20); // PCM
outBuffer.writeUInt16LE(2, 22); // Stereo
outBuffer.writeUInt32LE(sampleRate, 24);
outBuffer.writeUInt32LE(sampleRate * 4, 28);
outBuffer.writeUInt16LE(4, 32);
outBuffer.writeUInt16LE(16, 34);
outBuffer.write('data', 36);
outBuffer.writeUInt32LE(totalSamples * 4, 40);

let outOffset = 44;
for (let i = 0; i < totalSamples; i++) {
  // Soft limiter to prevent any digital clipping
  const left = Math.max(-0.99, Math.min(0.99, masterLeft[i]));
  const right = Math.max(-0.99, Math.min(0.99, masterRight[i]));

  outBuffer.writeInt16LE(Math.floor(left * 32767), outOffset);
  outBuffer.writeInt16LE(Math.floor(right * 32767), outOffset + 2);
  outOffset += 4;
}

const finalWavPath = path.join(tempClipsDir, 'mastered_audio_90s.wav');
fs.writeFileSync(finalWavPath, outBuffer);
console.log(`✅ Mastered soundtrack written to: ${finalWavPath}`);

// 4. Mux with existing raw video!
const rawVideoPath = path.join(tempClipsDir, 'raw_visual_90s.mp4');
const finalMp4Path = path.join(outputDir, 'ISkool_Presentacion_Comercial_90s.mp4');

console.log('\n🚀 Final Multiplexing to MP4...');
const muxRes = spawnSync(ffmpeg, [
  '-y',
  '-i', rawVideoPath,
  '-i', finalWavPath,
  '-c:v', 'copy',
  '-c:a', 'aac',
  '-b:a', '192k',
  '-movflags', '+faststart',
  '-t', '90.0',
  finalMp4Path
]);

if (muxRes.status !== 0) {
  console.error('Mux error:', muxRes.stderr.toString());
  process.exit(1);
}

const stats = fs.statSync(finalMp4Path);
console.log('\n======================================================');
console.log('🎉 PROCESO COMPLETADO EXITOSAMENTE');
console.log(`📁 Video Final: ${finalMp4Path}`);
console.log(`📊 Tamaño: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
console.log('⏱️ Duración: 90 Segundos Exactos (01:30)');
console.log('======================================================');
