const fs = require('fs');
const path = require('path');

const sampleRate = 44100;
const totalDuration = 90.0;
const totalSamples = Math.floor(sampleRate * totalDuration);
const numChannels = 2;

const buffer = Buffer.alloc(44 + totalSamples * numChannels * 2);

// WAV Header
buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + totalSamples * numChannels * 2, 4);
buffer.write('WAVE', 8);
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20); // PCM
buffer.writeUInt16LE(numChannels, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(sampleRate * numChannels * 2, 28);
buffer.writeUInt16LE(numChannels * 2, 32);
buffer.writeUInt16LE(16, 34);
buffer.write('data', 36);
buffer.writeUInt32LE(totalSamples * numChannels * 2, 40);

const bpm = 120;
const beatSec = 60 / bpm; // 0.5s per beat
const measureSec = beatSec * 4; // 2.0s per measure

// Chord progression: Cmaj9 (C, E, G, B, D), Am9 (A, C, E, G, B), Fmaj9 (F, A, C, E, G), Gsus4/G (G, C, D, G, B)
const chords = [
  { root: 65.41, notes: [130.81, 196.00, 246.94, 293.66, 329.63] }, // C
  { root: 55.00, notes: [110.00, 164.81, 196.00, 246.94, 261.63] }, // Am
  { root: 43.65, notes: [87.31, 130.81, 164.81, 220.00, 261.63] },  // F
  { root: 49.00, notes: [98.00, 146.83, 196.00, 261.63, 293.66] }   // G
];

// Scene transition timestamps for SFX (seconds)
const transitions = [0, 10, 20, 30, 40, 50, 60, 70, 75, 80];
// UI interaction chime timestamps (seconds)
const chimes = [4, 14, 24, 34, 44, 54, 64, 72, 77, 84];

console.log('🎵 Synthesizing high-production commercial corporate soundtrack (120 BPM)...');

let offset = 44;
for (let i = 0; i < totalSamples; i++) {
  const t = i / sampleRate;

  // Master envelope (fade in at start, fade out at end)
  let masterVol = 0.85;
  if (t < 1.5) masterVol *= (t / 1.5);
  if (t > totalDuration - 2.5) masterVol *= Math.max(0, (totalDuration - t) / 2.5);

  const measureIdx = Math.floor(t / (measureSec * 2)) % chords.length;
  const chord = chords[measureIdx];
  const beatTime = (t % beatSec) / beatSec;
  const measureTime = (t % measureSec) / measureSec;

  let left = 0;
  let right = 0;

  // 1. Kick Drum (warm thumping pulse on beats 1, 2, 3, 4)
  if (t > 2.0 && t < totalDuration - 2.0) {
    const kickDecay = Math.exp(-beatTime * 18);
    const kickFreq = 120 * Math.exp(-beatTime * 25) + 45;
    const kick = Math.sin(2 * Math.PI * kickFreq * beatTime) * kickDecay * 0.38;
    left += kick;
    right += kick;
  }

  // 2. Crisp Hi-Hat (on eighth notes)
  if (t > 4.0 && t < totalDuration - 3.0) {
    const eighthTime = (t % (beatSec / 2)) / (beatSec / 2);
    if ((t % beatSec) >= beatSec / 2) { // off-beat
      const hatDecay = Math.exp(-eighthTime * 35);
      const noise = ((Math.sin(i * 1337.1) % 1) - 0.5) * 0.08 * hatDecay;
      left += noise * 0.7;
      right += noise * 1.3;
    }
  }

  // 3. Sub-Bass Synth
  const bassEnv = Math.exp(-beatTime * 4);
  const bass = Math.sin(2 * Math.PI * chord.root * t) * (0.18 + 0.12 * bassEnv);
  left += bass;
  right += bass;

  // 4. Lush Ambient Pad (chord tones with stereo width)
  let padL = 0;
  let padR = 0;
  for (let n = 0; n < chord.notes.length; n++) {
    const f = chord.notes[n];
    const osc1 = Math.sin(2 * Math.PI * f * t);
    const osc2 = Math.sin(2 * Math.PI * (f * 1.002) * t);
    const pan = n / chord.notes.length;
    padL += (osc1 * 0.6 + osc2 * 0.4) * (1 - pan * 0.5);
    padR += (osc1 * 0.4 + osc2 * 0.6) * (0.5 + pan * 0.5);
  }
  const padGain = 0.06;
  left += padL * padGain;
  right += padR * padGain;

  // 5. Arpeggio / Melody Bell (flowing 16th notes)
  if (t > 6.0 && t < totalDuration - 4.0) {
    const sixteenth = Math.floor((t / (beatSec / 4))) % chord.notes.length;
    const arpFreq = chord.notes[sixteenth] * 2; // octave up
    const arpTime = (t % (beatSec / 4)) / (beatSec / 4);
    const arpEnv = Math.exp(-arpTime * 14);
    const bell = Math.sin(2 * Math.PI * arpFreq * arpTime) * arpEnv * 0.07;
    left += bell * 0.8;
    right += bell * 1.2;
  }

  // 6. Transition SFX (Whoosh at scene changes)
  for (const transT of transitions) {
    const dt = t - transT;
    if (dt >= -0.4 && dt <= 0.6) {
      const whooshEnv = Math.sin(((dt + 0.4) / 1.0) * Math.PI);
      const whooshNoise = ((Math.sin(i * 999.7) % 1) - 0.5) * whooshEnv * 0.16;
      left += whooshNoise;
      right += whooshNoise;
    }
  }

  // 7. Interaction Chime SFX (Pops/Chimes on key features)
  for (const chimeT of chimes) {
    const dt = t - chimeT;
    if (dt >= 0 && dt <= 0.5) {
      const chimeEnv = Math.exp(-dt * 10);
      const chime1 = Math.sin(2 * Math.PI * 1046.50 * dt) * 0.08 * chimeEnv; // C6
      const chime2 = Math.sin(2 * Math.PI * 1318.51 * dt) * 0.06 * chimeEnv; // E6
      const chime3 = Math.sin(2 * Math.PI * 1567.98 * dt) * 0.05 * chimeEnv; // G6
      left += (chime1 + chime2) * 0.7;
      right += (chime2 + chime3) * 0.7;
    }
  }

  // Master Volume & Limiter
  left *= masterVol;
  right *= masterVol;

  const finalL = Math.max(-0.95, Math.min(0.95, left));
  const finalR = Math.max(-0.95, Math.min(0.95, right));

  buffer.writeInt16LE(Math.floor(finalL * 32767), offset);
  buffer.writeInt16LE(Math.floor(finalR * 32767), offset + 2);
  offset += 4;
}

const outPath = path.join(__dirname, '..', 'commercial_soundtrack_90s.wav');
fs.writeFileSync(outPath, buffer);
console.log(`✅ Commercial soundtrack generated: ${outPath} (${(buffer.length / (1024 * 1024)).toFixed(2)} MB)`);
