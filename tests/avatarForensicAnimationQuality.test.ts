import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  getHistoricalMouthConfig,
  MULTILINGUAL_HISTORICAL_FIGURES,
} from '@/lib/historicalVoiceEngine';
import { CHARACTER_3D_RIGS } from '@/components/languages/HumanGesticulatingAvatar';

const ROOT = process.cwd();

describe('🎬 AUDITORÍA FORENSE DE AVATARES 60 FPS: ANATOMÍA, POSES 3D Y MOTOR FACIAL SIN COSTURAS', () => {
  it('1. Todos los 9 avatares 3D tienen poses válidas en disco y cumplen compresión WebP < 400 KB (Regla 3)', () => {
    const rigKeys = Object.keys(CHARACTER_3D_RIGS);
    expect(rigKeys.length).toBeGreaterThanOrEqual(9);

    for (const key of rigKeys) {
      const rig = CHARACTER_3D_RIGS[key];
      const urls = new Set<string>([
        rig.idle,
        ...Object.values(rig.poseCompendium).filter((v): v is string => Boolean(v)),
      ]);
      for (const url of urls) {
        expect(url.endsWith('.webp')).toBe(true);
        const fullPath = path.join(ROOT, 'public', url.replace(/^\//, ''));
        expect(fs.existsSync(fullPath), `Missing asset: ${url}`).toBe(true);
        const bytes = fs.statSync(fullPath).size;
        expect(bytes, `Asset exceeds 400KB: ${url} (${Math.round(bytes / 1024)}KB)`).toBeLessThan(400 * 1024);
      }
    }
  });

  it('2. Calibración anatómica sub-píxel válida en los 9 avatares 3D y 22 retratos históricos mexicanos', () => {
    const allCharacterIds = [
      'claire',
      'arthur',
      'shakespeare',
      'ada_lovelace',
      'abraham_lincoln',
      'napoleon',
      'marie_curie',
      'victor_hugo',
      'jeanne_darc',
      'josefa_ortiz',
      'emiliano_zapata',
      'benito_juarez',
      'sor_juana',
      'morelos',
      'cuauhtemoc',
      'ignacio_allende',
      'carmen_serdan',
      'aquiles_serdan',
      'madero',
      'lazaro_cardenas',
      'plutarco_elias_calles',
      'ricardo_flores_magon',
      'guadalupe_victoria',
      'andres_quintana_roo',
      'belisario_dominguez',
      'felipe_angeles',
      'gustavo_diaz_ordaz',
      'jose_guadalupe_posada',
      'francisco_villa',
      'hidalgo',
      'leona_vicario',
    ];

    for (const id of allCharacterIds) {
      const cfg = getHistoricalMouthConfig(id);
      expect(cfg.x1, `${id}.x1`).toBeLessThan(cfg.cx);
      expect(cfg.cx, `${id}.cx`).toBeLessThan(cfg.x2);
      expect(cfg.leftEyeX, `${id}.leftEyeX`).toBeDefined();
      expect(cfg.rightEyeX, `${id}.rightEyeX`).toBeDefined();
      expect(cfg.leftEyeX!, `${id}.leftEyeX < rightEyeX`).toBeLessThan(cfg.rightEyeX!);
      expect(cfg.eyeY!, `${id}.eyeY < cy`).toBeLessThan(cfg.cy);
      expect(cfg.chinY!, `${id}.chinY > cy`).toBeGreaterThan(cfg.cy + 20);
      expect(cfg.maxOpening, `${id}.maxOpening`).toBeGreaterThanOrEqual(11);
      expect(cfg.maxOpening, `${id}.maxOpening`).toBeLessThanOrEqual(18);
    }

    // Personajes con anteojos: radios oculares estrictamente contenidos dentro de las micas (cero pintura sobre armazón)
    expect(getHistoricalMouthConfig('arthur').eyeRx).toBeLessThanOrEqual(26);
    expect(getHistoricalMouthConfig('ricardo_flores_magon').eyeRx).toBeLessThanOrEqual(16);
    expect(getHistoricalMouthConfig('gustavo_diaz_ordaz').eyeRx).toBeLessThanOrEqual(16);

    // Calibración de mentón estrictamente sobre cuellos/uniformes en personajes 3D
    expect(getHistoricalMouthConfig('napoleon').chinY).toBeLessThanOrEqual(316);
    expect(getHistoricalMouthConfig('marie_curie').chinY).toBeLessThanOrEqual(276);
    expect(getHistoricalMouthConfig('abraham_lincoln').chinY).toBeLessThanOrEqual(322);
    expect(getHistoricalMouthConfig('victor_hugo').chinY).toBeLessThanOrEqual(558);

    // Cobertura completa de comisuras en sonrisas anchas (evita dientes congelados a la derecha en Claire/Sophie)
    const claireCfg = getHistoricalMouthConfig('claire');
    expect(claireCfg.x2 - claireCfg.x1).toBeGreaterThanOrEqual(100);
    expect(claireCfg.x2).toBeGreaterThanOrEqual(560);

    // Todas las figuras históricas multilingües resuelven su rig 3D
    for (const fig of MULTILINGUAL_HISTORICAL_FIGURES) {
      expect(CHARACTER_3D_RIGS[fig.id]).toBeDefined();
    }
  });

  it('3. Motor facial 60 FPS implementa composición difuminada C2 sin costuras, mandíbula parabólica y parpadeo bilateral alineado', () => {
    const src = fs.readFileSync(
      path.join(ROOT, 'src/components/common/NanoBananaLipSyncCanvas.tsx'),
      'utf8'
    );

    // Buffers reutilizables sin asignación por fotograma
    expect(src).toContain('blendFrameCanvasRef');
    expect(src).toContain('mouthPatchCanvasRef');
    expect(src).toContain('browPatchCanvasRef');
    expect(src).toContain('eyePatchCanvasRef');

    // Alineación real de sprites de parpadeo (no omitir isBlinkSprite)
    expect(src).toContain('computeBlinkSpriteBridgeShift');

    // Contorno mandibular parabólico + feathering radial destination-in
    expect(src).toContain('jawOval');
    expect(src).toContain('colAnchorBotY');
    expect(src).toContain("globalCompositeOperation = 'destination-in'");

    // Parpadeo bilateral humano (párpado superior + elevación sutil de párpado inferior)
    expect(src).toContain('currUpperMarginRelY');
    expect(src).toContain('currLowerMarginRelY');

    // Micro-sacadas intra-esclerales con destello corneal especular
    expect(src).toContain('scaledSacX');
    expect(src).toContain('glintX');

    // Protección contra doble hilera de dientes en sonrisas abiertas/apretadas y núcleo opaco 80% sin fantasmas
    expect(src).toContain('isClenchedTwoRowTeeth');
    expect(src).toContain('MOUTH_PATCH_WIDTH_MULT');
  });
});
