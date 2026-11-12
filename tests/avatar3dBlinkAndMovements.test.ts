import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  computePhysiologicalBlink,
  buildContextualMovementSequence,
  ConcreteAvatarGesture,
} from '@/components/common/NanoBananaLipSyncCanvas';
import { GESTURE_OPTIONS, CHARACTER_3D_RIGS } from '@/components/languages/HumanGesticulatingAvatar';
import { getHistoricalMouthConfig } from '@/lib/historicalVoiceEngine';

const ALL_11_ACTIVE_MOVEMENTS: ConcreteAvatarGesture[] = [
  'welcome',
  'wave',
  'explain',
  'point',
  'pronounce',
  'inquire',
  'think',
  'exclaim',
  'celebrate',
  'encourage',
  'calm',
];

const ALL_12_MOVEMENTS: ConcreteAvatarGesture[] = [
  'welcome',
  'wave',
  'explain',
  'point',
  'pronounce',
  'inquire',
  'think',
  'exclaim',
  'celebrate',
  'encourage',
  'calm',
  'listen',
];

describe('🎭 AVATAR 3D EN VIVO (60 FPS) — PARPADEO ANATÓMICO Y COMPENDIO DE 12 MOVIMIENTOS', () => {
  it('1. Curva fisiológica de parpadeo cierra al 100% en sello tarsal y abre suavemente sin saltos', () => {
    expect(computePhysiologicalBlink(0)).toBe(0);
    expect(computePhysiologicalBlink(-0.1)).toBe(0);
    expect(computePhysiologicalBlink(1)).toBe(0);
    expect(computePhysiologicalBlink(1.2)).toBe(0);

    // Cierre descendente progresivo (0 -> 0.34)
    const c1 = computePhysiologicalBlink(0.12);
    const c2 = computePhysiologicalBlink(0.26);
    expect(c1).toBeGreaterThan(0.02);
    expect(c2).toBeGreaterThan(c1);

    // Sello tarsal completo (0.34 -> 0.48)
    expect(computePhysiologicalBlink(0.36)).toBe(1.0);
    expect(computePhysiologicalBlink(0.45)).toBe(1.0);

    // Apertura orgánica ascendente (0.48 -> 1.00)
    const o1 = computePhysiologicalBlink(0.62);
    const o2 = computePhysiologicalBlink(0.84);
    expect(o1).toBeLessThan(1.0);
    expect(o1).toBeGreaterThan(o2);
    expect(o2).toBeGreaterThan(0);
  });

  it('2. Director contextual de movimientos genera secuencias pedagógicas ricas y cubre los 12 movimientos', () => {
    const fullSeq = buildContextualMovementSequence('Let us practice today.');
    expect(fullSeq).toEqual(expect.arrayContaining(ALL_12_MOVEMENTS));

    const phoneticSeq = buildContextualMovementSequence('Listen and repeat this syllable sound.');
    expect(phoneticSeq[0]).toBe('pronounce');

    const questionSeq = buildContextualMovementSequence('What would you like to order today?');
    expect(questionSeq[0]).toBe('inquire');

    const praiseSeq = buildContextualMovementSequence('Bravo! Excellent work today!');
    expect(praiseSeq[0]).toBe('exclaim');
    expect(praiseSeq).toContain('celebrate');

    const calmSeq = buildContextualMovementSequence('Respira, vamos paso a paso y despacio.');
    expect(calmSeq[0]).toBe('calm');
  });

  it('3. GESTURE_OPTIONS expone los 13 modos (Auto + 12 Movimientos 3D)', () => {
    expect(GESTURE_OPTIONS.length).toBe(13);
    const ids = GESTURE_OPTIONS.map((g) => g.id);
    expect(ids).toContain('auto');
    for (const mov of ALL_12_MOVEMENTS) {
      expect(ids).toContain(mov);
    }
  });

  it('4. Calibración anatómica sub-píxel de ojos y boca para mentores y los 7 personajes históricos 3D', () => {
    const claireCfg = getHistoricalMouthConfig('claire');
    expect(claireCfg.leftEyeX).toBe(442);
    expect(claireCfg.leftEyeY).toBe(278);
    expect(claireCfg.rightEyeX).toBe(576);
    expect(claireCfg.rightEyeY).toBe(263);
    expect(claireCfg.eyeRx).toBe(48);
    expect(claireCfg.eyeRy).toBe(39);

    const arthurCfg = getHistoricalMouthConfig('arthur');
    expect(arthurCfg.leftEyeX).toBe(412);
    expect(arthurCfg.leftEyeY).toBe(207);
    expect(arthurCfg.rightEyeX).toBe(496);
    expect(arthurCfg.rightEyeY).toBe(208);
    expect(arthurCfg.eyeRx).toBe(34);
    expect(arthurCfg.eyeRy).toBe(27);

    const expectedHistoricalEyes: Array<[string, number, number, number, number, number, number]> = [
      ['ada_lovelace', 456, 292, 564, 294, 38, 28],
      ['shakespeare', 458, 224, 540, 224, 28, 22],
      ['abraham_lincoln', 472, 190, 542, 190, 22, 15],
      ['marie_curie', 474, 202, 528, 200, 20, 15],
      ['napoleon', 474, 217, 534, 216, 20, 14],
      ['victor_hugo', 442, 307, 562, 307, 30, 18],
      ['jeanne_darc', 436, 314, 566, 314, 40, 27],
    ];

    for (const [id, lx, ly, rx, ry, erx, ery] of expectedHistoricalEyes) {
      const cfg = getHistoricalMouthConfig(id);
      expect(cfg.leftEyeX, `${id}.leftEyeX`).toBe(lx);
      expect(cfg.leftEyeY, `${id}.leftEyeY`).toBe(ly);
      expect(cfg.rightEyeX, `${id}.rightEyeX`).toBe(rx);
      expect(cfg.rightEyeY, `${id}.rightEyeY`).toBe(ry);
      expect(cfg.eyeRx, `${id}.eyeRx`).toBe(erx);
      expect(cfg.eyeRy, `${id}.eyeRy`).toBe(ery);
    }
  });

  it('5. Todos los activos 3D (.webp < 300KB) y clips cinemáticos (.mp4) de los 9 rigs existen en disco', () => {
    const allRigKeys = [
      'claire',
      'arthur',
      'shakespeare',
      'ada_lovelace',
      'abraham_lincoln',
      'napoleon',
      'marie_curie',
      'victor_hugo',
      'jeanne_darc',
    ];

    for (const rigKey of allRigKeys) {
      const rig = CHARACTER_3D_RIGS[rigKey];
      expect(rig, `Missing rig: ${rigKey}`).toBeDefined();

      // Verificar idle + 12 poses del compendio + blink (< 300 KB WebP)
      const webpSet = new Set<string>([rig.idle]);
      for (const mov of ALL_12_MOVEMENTS) {
        const poseUrl = rig.poseCompendium[mov];
        expect(poseUrl, `Missing poseCompendium.${mov} on ${rigKey}`).toBeTruthy();
        webpSet.add(poseUrl!);
      }
      expect(rig.poseCompendium.blink, `Missing poseCompendium.blink on ${rigKey}`).toBeTruthy();
      webpSet.add(rig.poseCompendium.blink!);

      for (const relWebp of webpSet) {
        const fullWebp = path.join(process.cwd(), 'public', relWebp.replace(/^\//, ''));
        expect(fs.existsSync(fullWebp), `Missing 3D pose asset on disk: ${relWebp}`).toBe(true);
        const sizeKb = fs.statSync(fullWebp).size / 1024;
        expect(sizeKb, `Asset ${relWebp} exceeds 300KB WebP limit (${sizeKb.toFixed(1)}KB)`).toBeLessThan(300);
      }

      // Verificar talkMovie + los 11 clips .mp4 de movimientos activos
      const movieSet = new Set<string>([rig.talkMovie]);
      for (const mov of ALL_11_ACTIVE_MOVEMENTS) {
        const movUrl = rig.gestureMovies?.[mov];
        expect(movUrl, `Missing gestureMovies.${mov} on ${rigKey}`).toBeTruthy();
        movieSet.add(movUrl!);
      }

      for (const relMovie of movieSet) {
        const fullMovie = path.join(process.cwd(), 'public', relMovie.replace(/^\//, ''));
        expect(fs.existsSync(fullMovie), `Missing 3D movie on disk: ${relMovie}`).toBe(true);
        expect(fs.statSync(fullMovie).size, `3D movie too small: ${relMovie}`).toBeGreaterThan(20_000);
      }
    }
  });

  it('6. Cero deformación 2D de manos/fondo (handZones eliminado) y los 11 gestos activos cableados a clips 3D .mp4 en los 9 rigs', () => {
    for (const [rigKey, rig] of Object.entries(CHARACTER_3D_RIGS)) {
      for (const mov of ALL_11_ACTIVE_MOVEMENTS) {
        expect(rig.gestureMovies?.[mov], `${rigKey}.gestureMovies.${mov}`).toMatch(/\.mp4$/);
      }
    }

    const canvasSrc = fs.readFileSync(
      path.join(process.cwd(), 'src/components/common/NanoBananaLipSyncCanvas.tsx'),
      'utf8'
    );
    expect(canvasSrc).not.toContain('handZones');
    expect(canvasSrc).not.toContain('headBuffer');
    expect(canvasSrc).toContain('videoPoolRef');
    expect(canvasSrc).toContain('dataset.videoActive');
  });
});

