const fs = require('fs');
const path = require('path');

const sampleRate = 44100;
const totalDuration = 90.0;
const totalSamples = Math.floor(sampleRate * totalDuration);
const numChannels = 2;
const bytesPerSample = 2; // 16-bit

const buffer = Buffer.alloc(44 + totalSamples * numChannels * bytesPerSample);

// Write WAV Header
buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + totalSamples * numChannels * bytesPerSample, 4);
buffer.write('WAVE', 8);
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16); // Subchunk1Size
buffer.writeUInt16LE(1, 20); // PCM
buffer.writeUInt16LE(numChannels, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(sampleRate * numChannels * bytesPerSample, 28);
buffer.writeUInt16LE(numChannels * bytesPerSample, 32);
buffer.writeUInt16LE(16, 34); // Bits per sample
buffer.write('data', 36);
buffer.writeUInt32LE(totalSamples * numChannels * bytesPerSample, 40);

// Chord progression: Cmaj9, Am9, Fmaj9, G6
// Note frequencies (Hz)
const chords = [
  // Cmaj9: C3 (130.81), G3 (196.00), B3 (246.94), D4 (293.66), E4 (329.63), G4 (392.00)
  [130.81, 196.00, 246.94, 293.66, 329.63, 392.00],
  // Am9: A2 (110.00), E3 (164.81), G3 (196.00), B3 (246.94), C4 (261.63), E4 (329.63)
  [110.00, 164.81, 196.00, 246.94, 261.63, 329.63],
  // Fmaj9: F2 (87.31), C3 (130.81), E3 (164.81), G3 (196.00), A3 (220.00), C4 (261.63)
  [87.31, 130.81, 164.81, 196.00, 220.00, 261.63],
  // Gsus4 / G6: G2 (98.00), D3 (146.83), G3 (196.00), B3 (246.94), D4 (293.66), E4 (329.63)
  [98.00, 146.83, 196.00, 246.94, 293.66, 329.63]
];

const chordDuration = 5.0; // 5 seconds per chord

let offset = 44;
for (let i = 0; i < totalSamples; i++) {
  const t = i / sampleRate;
  
  // Overall fade in / fade out
  let masterGain = 0.18; // Soft background level
  if (t < 2.0) {
    masterGain *= (t / 2.0);
  } else if (t > totalDuration - 3.0) {
    masterGain *= Math.max(0, (totalDuration - t) / 3.0);
  }

  // Determine chord
  const chordIdx = Math.floor((t / chordDuration) % chords.length);
  const currentChord = chords[chordIdx];
  const chordTime = (t % chordDuration) / chordDuration;
  // Smooth envelope for each chord change
  const chordEnv = Math.sin(chordTime * Math.PI);

  let sampleLeft = 0;
  let sampleRight = 0;

  for (let n = 0; n < currentChord.length; n++) {
    const freq = currentChord[n];
    // Gentle detune and chorus
    const osc1 = Math.sin(2 * Math.PI * freq * t);
    const osc2 = Math.sin(2 * Math.PI * (freq * 1.002) * t);
    const osc3 = 0.3 * Math.sin(2 * Math.PI * (freq * 2) * t); // subtle octave harmonic

    const voice = (osc1 + osc2 + osc3) * 0.25;
    // Stereo panning based on note frequency
    const pan = 0.3 + 0.4 * (n / currentChord.length);
    sampleLeft += voice * (1 - pan);
    sampleRight += voice * pan;
  }

  sampleLeft *= masterGain * (0.6 + 0.4 * chordEnv);
  sampleRight *= masterGain * (0.6 + 0.4 * chordEnv);

  // Clamp to 16-bit range
  const intL = Math.max(-32767, Math.min(32767, Math.floor(sampleLeft * 32767)));
  const intR = Math.max(-32767, Math.min(32767, Math.floor(sampleRight * 32767)));

  buffer.writeInt16LE(intL, offset);
  buffer.writeInt16LE(intR, offset + 2);
  offset += 4;
}

const outputPath = path.join(__dirname, '..', 'temp_video_audio', 'ambient_music.wav');
fs.writeFileSync(outputPath, buffer);
console.log(`✅ Ambient background music generated: ${outputPath} (${(buffer.length / (1024 * 1024)).toFixed(2)} MB)`);
