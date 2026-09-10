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

// Tempo: 112 BPM (Elegant, smooth, reassuring keynote tempo)
const bpm = 112;
const beatSec = 60 / bpm; // ~0.535s
const measureSec = beatSec * 4; // ~2.14s

// Warm Piano Chords in D major / B minor (Inspiring, prestigious, hopeful)
// Dmaj7, Bm7, Gmaj7, Asus4 -> A
const chords = [
  // Dmaj7: D3 (146.83), F#3 (185.00), A3 (220.00), C#4 (277.18), E4 (329.63)
  { root: 73.42, notes: [146.83, 185.00, 220.00, 277.18, 329.63] },
  // Bm7: B2 (123.47), D3 (146.83), F#3 (185.00), A3 (220.00), D4 (293.66)
  { root: 61.74, notes: [123.47, 146.83, 185.00, 220.00, 293.66] },
  // Gmaj7: G2 (98.00), B2 (123.47), D3 (146.83), F#3 (185.00), G3 (196.00)
  { root: 49.00, notes: [98.00, 123.47, 146.83, 185.00, 246.94] },
  // A9 / Asus4: A2 (110.00), C#3 (138.59), E3 (164.81), G3 (196.00), B3 (246.94)
  { root: 55.00, notes: [110.00, 138.59, 164.81, 220.00, 246.94] }
];

// Scene change transitions for soft audio swells (seconds)
const transitions = [9.0, 20.0, 31.0, 43.0, 55.0, 67.0, 77.0, 84.0];

console.log('🎵 Synthesizing warm, elegant, acoustic corporate soundtrack (112 BPM, Zero Noise)...');

// Helper: Synthesize rich acoustic grand piano tone with realistic physical decay
function pianoNote(freq, dt) {
  if (dt < 0) return 0;
  // Natural piano envelope: instant attack, natural multi-exponential decay
  const env1 = Math.exp(-dt * 2.2);
  const env2 = Math.exp(-dt * 0.8);
  const totalEnv = env1 * 0.7 + env2 * 0.3;
  
  // Harmonics: fundamental, 2nd, 3rd, 4th (decreasing amplitude)
  const h1 = Math.sin(2 * Math.PI * freq * dt) * 0.55;
  const h2 = Math.sin(2 * Math.PI * freq * 2.001 * dt) * 0.25;
  const h3 = Math.sin(2 * Math.PI * freq * 3.003 * dt) * 0.12;
  const h4 = Math.sin(2 * Math.PI * freq * 4.004 * dt) * 0.05;
  
  return (h1 + h2 + h3 + h4) * totalEnv;
}

let offset = 44;
for (let i = 0; i < totalSamples; i++) {
  const t = i / sampleRate;

  // Master fade in (0 to 2s) and fade out (87s to 90s)
  let masterVol = 0.82;
  if (t < 2.0) masterVol *= (t / 2.0);
  if (t > totalDuration - 2.5) masterVol *= Math.max(0, (totalDuration - t) / 2.5);

  const measureIdx = Math.floor(t / (measureSec * 2)) % chords.length;
  const chord = chords[measureIdx];
  const beatInMeasure = (t % (measureSec * 2));
  const beatTime = (t % beatSec) / beatSec;

  let left = 0;
  let right = 0;

  // 1. Warm Acoustic Grand Piano Chords (played gently every 2 measures with arpeggio spread)
  const chordInterval = measureSec * 2;
  const chordAge = t % chordInterval;
  
  for (let n = 0; n < chord.notes.length; n++) {
    // Slight humanization strum delay (0.025s per note)
    const noteDelay = n * 0.025;
    const noteDt = chordAge - noteDelay;
    if (noteDt > 0) {
      const pNote = pianoNote(chord.notes[n], noteDt);
      // Stereo acoustic spread
      const pan = (n / (chord.notes.length - 1)) - 0.5; // -0.5 to +0.5
      left += pNote * (0.5 - pan * 0.35) * 0.28;
      right += pNote * (0.5 + pan * 0.35) * 0.28;
    }
  }

  // 2. Secondary soft piano melodic ostinato (gentle motif in the higher register on beat 3)
  if (t > 4.0 && t < totalDuration - 3.0) {
    const motifTime = (t % measureSec);
    // Note at 1.0s and 1.6s of each measure
    const n1Dt = motifTime - (measureSec * 0.5);
    const n2Dt = motifTime - (measureSec * 0.75);
    if (n1Dt > 0 && n1Dt < 1.5) {
      const melNote1 = pianoNote(chord.notes[chord.notes.length - 1] * 1.5, n1Dt) * 0.10;
      left += melNote1 * 0.65;
      right += melNote1 * 0.35;
    }
    if (n2Dt > 0 && n2Dt < 1.5) {
      const melNote2 = pianoNote(chord.notes[chord.notes.length - 2] * 1.5, n2Dt) * 0.09;
      left += melNote2 * 0.35;
      right += melNote2 * 0.65;
    }
  }

  // 3. Warm Upright Bass / Cello (Deep, comforting, non-aggressive foundation)
  if (t > 2.0) {
    const bassDt = t % measureSec;
    const bassEnv = Math.exp(-bassDt * 1.2);
    // Clean fundamental + soft 2nd harmonic
    const bassTone = Math.sin(2 * Math.PI * chord.root * t) * 0.65 +
                     Math.sin(2 * Math.PI * chord.root * 2 * t) * 0.25;
    const bassOut = bassTone * bassEnv * 0.22;
    left += bassOut;
    right += bassOut;
  }

  // 4. Soft Heartbeat Pulse (Very low 50Hz warm thump on whole measure downbeats)
  if (t > 6.0 && t < totalDuration - 3.0) {
    const kickDt = (t % measureSec);
    if (kickDt < 0.35) {
      const kEnv = Math.exp(-kickDt * 12);
      const kFreq = 58 * Math.exp(-kickDt * 15) + 38;
      const kick = Math.sin(2 * Math.PI * kFreq * kickDt) * kEnv * 0.18;
      left += kick;
      right += kick;
    }
  }

  // 5. Cinematic Ambient Pad (Lush, wide, warm analog string texture)
  let padL = 0;
  let padR = 0;
  for (let n = 0; n < chord.notes.length; n++) {
    const f = chord.notes[n];
    // Gentle detuned sines for warm chorus without harshness
    const s1 = Math.sin(2 * Math.PI * f * t);
    const s2 = Math.sin(2 * Math.PI * (f * 1.001) * t + 1.0);
    padL += (s1 * 0.6 + s2 * 0.4);
    padR += (s1 * 0.4 + s2 * 0.6);
  }
  const padGain = 0.038;
  left += padL * padGain;
  right += padR * padGain;

  // 6. Smooth Cinematic Swell at Transitions (Warm sub-bass lift, NO white noise)
  for (const transT of transitions) {
    const dt = t - transT;
    if (dt >= -0.8 && dt <= 0.8) {
      const swellEnv = Math.sin(((dt + 0.8) / 1.6) * Math.PI);
      // Warm 110Hz sine swell with gentle rise and fall
      const swellTone = Math.sin(2 * Math.PI * 110 * t) * swellEnv * 0.08;
      left += swellTone;
      right += swellTone;
    }
  }

  // Master Volume & Limiter
  left *= masterVol;
  right *= masterVol;

  const finalL = Math.max(-0.92, Math.min(0.92, left));
  const finalR = Math.max(-0.92, Math.min(0.92, right));

  buffer.writeInt16LE(Math.floor(finalL * 32767), offset);
  buffer.writeInt16LE(Math.floor(finalR * 32767), offset + 2);
  offset += 4;
}

const outPath = path.join(__dirname, '..', 'commercial_soundtrack_90s.wav');
fs.writeFileSync(outPath, buffer);
console.log(`✅ Warm acoustic corporate soundtrack generated: ${outPath} (${(buffer.length / (1024 * 1024)).toFixed(2)} MB)`);
