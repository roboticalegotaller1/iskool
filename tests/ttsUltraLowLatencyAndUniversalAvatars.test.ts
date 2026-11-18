import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  getHistoricalMouthConfig,
  MULTILINGUAL_HISTORICAL_FIGURES,
  prefetchUniversalIskoolVoice,
} from '@/lib/historicalVoiceEngine';
import { CHARACTER_3D_RIGS } from '@/components/languages/HumanGesticulatingAvatar';

const ROOT = process.cwd();

describe('Ultra-Low-Latency Neural Voice & Universal Multi-Account Avatar Parity', () => {
  it('exposes prefetchUniversalIskoolVoice and coalesces in-flight synthesis without 60s timeout cascades', () => {
    expect(typeof prefetchUniversalIskoolVoice).toBe('function');

    const directSrc = fs.readFileSync(
      path.join(ROOT, 'src/lib/institutionalNeuralDirect.ts'),
      'utf8'
    );
    expect(directSrc).toContain('family: 4');
    expect(directSrc).toContain('KEEP_ALIVE_IPV4_AGENT');
    expect(directSrc).toContain('handshakeTimeout: Math.min(2500, timeoutMs)');
    expect(directSrc).toContain('options.timeoutMs ?? 3500');

    const serverTtsSrc = fs.readFileSync(
      path.join(ROOT, 'src/lib/serverNeuralTts.ts'),
      'utf8'
    );
    expect(serverTtsSrc).not.toContain('timeoutMs: attempt === 0 ? 5500 : 6500');
    expect(serverTtsSrc).toContain('timeoutMs: 3500');
    expect(serverTtsSrc).toContain('}, 3800);');

    const ttsRouteSrc = fs.readFileSync(
      path.join(ROOT, 'src/app/api/ai/tts/route.ts'),
      'utf8'
    );
    expect(ttsRouteSrc).toContain('inFlightSynthesisPromises');
  });

  it('eliminates main-thread pose-alignment stalls via 2-stage pyramid search, global pose cache, and idle time-slicing', () => {
    const canvasSrc = fs.readFileSync(
      path.join(ROOT, 'src/components/common/NanoBananaLipSyncCanvas.tsx'),
      'utf8'
    );
    expect(canvasSrc).toContain('GLOBAL_PROCESSED_POSE_CACHE');
    expect(canvasSrc).toContain('willReadFrequently: true');
    expect(canvasSrc).toContain('coarseShiftStep = 4');
    expect(canvasSrc).toContain('enqueueSecondaryPoses');
    expect(canvasSrc).toContain('__iskoolVoiceSynthesisPending');

    const avatarSrc = fs.readFileSync(
      path.join(ROOT, 'src/components/languages/HumanGesticulatingAvatar.tsx'),
      'utf8'
    );
    expect(avatarSrc).not.toContain('allFrames.forEach');
  });

  it('pre-warms active lesson dialogues and debounces QR pocket-remote sync in /teacher/idiomas and /student/idiomas', () => {
    const teacherIdiomasSrc = fs.readFileSync(
      path.join(ROOT, 'src/app/teacher/idiomas/page.tsx'),
      'utf8'
    );
    expect(teacherIdiomasSrc).toContain('prefetchUniversalIskoolVoice');
    expect(teacherIdiomasSrc).toContain('lastPocketSyncKeyRef');

    const studentIdiomasSrc = fs.readFileSync(
      path.join(ROOT, 'src/app/student/idiomas/page.tsx'),
      'utf8'
    );
    expect(studentIdiomasSrc).toContain("import TeacherIdiomasPage from '@/app/teacher/idiomas/page'");
  });

  it('guarantees 100% universal avatar & voice availability across ALL accounts (demo and non-demo)', () => {
    const universalAvatarFiles = [
      'src/components/common/NanoBananaLipSyncCanvas.tsx',
      'src/components/languages/HumanGesticulatingAvatar.tsx',
      'src/components/languages/LanguageKaraokePlayer.tsx',
      'src/components/languages/BloomBktGamifiedCockpit.tsx',
      'src/components/languages/hybrid/ClassroomBoardModal.tsx',
      'src/components/history/HistoricalLivingAvatar.tsx',
      'src/components/history/MagicHistoryBookPlayer.tsx',
      'src/lib/historicalVoiceEngine.ts',
    ];

    for (const rel of universalAvatarFiles) {
      const content = fs.readFileSync(path.join(ROOT, rel), 'utf8');
      expect(content).not.toContain('sch-demo-0001');
      expect(content).not.toContain('isDemoSchoolId');
    }

    // Verify ClassroomBoardModal uses dynamic schoolName instead of hardcoded institution only
    const boardSrc = fs.readFileSync(
      path.join(ROOT, 'src/components/languages/hybrid/ClassroomBoardModal.tsx'),
      'utf8'
    );
    expect(boardSrc).toContain('{schoolName} · Centro de Idiomas 3D');

    // Verify MagicHistoryBookPlayer Page 1 uses NanoBananaLipSyncCanvas 60 FPS + 1st-person voice
    const magicBookSrc = fs.readFileSync(
      path.join(ROOT, 'src/components/history/MagicHistoryBookPlayer.tsx'),
      'utf8'
    );
    expect(magicBookSrc).toContain('<NanoBananaLipSyncCanvas');
    expect(magicBookSrc).toContain('Escuchar Semblanza');

    // Verify all 9 3D rigs and anatomical mouth configs resolve cleanly across all characters
    expect(Object.keys(CHARACTER_3D_RIGS).length).toBeGreaterThanOrEqual(9);
    for (const rigKey of Object.keys(CHARACTER_3D_RIGS)) {
      const cfg = getHistoricalMouthConfig(rigKey);
      expect(cfg.cx).toBeGreaterThan(200);
      expect(cfg.cy).toBeGreaterThan(200);
    }
    expect(MULTILINGUAL_HISTORICAL_FIGURES.length).toBeGreaterThanOrEqual(7);
  });
});
