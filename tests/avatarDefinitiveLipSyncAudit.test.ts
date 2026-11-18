import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { getHistoricalMouthConfig } from '@/lib/historicalVoiceEngine';
import { CHARACTER_3D_RIGS } from '@/components/languages/HumanGesticulatingAvatar';

describe('🔬 AUDITORÍA DEFINITIVA DE LIP-SYNC ANATÓMICO Y LANDMARKS X-RAY (39 AVATARES)', () => {
  it('1. En los 9 rigs 3D con sonrisa abierta, lowerLipTopY cae estrictamente sobre el bermellón labial inferior (luma >= 84, cero cavidad oscura)', async () => {
    const openSmile3DRigs: Array<{ id: string; file: string }> = [
      { id: 'ada_lovelace', file: 'public/images/languages/3d/ada_lovelace_3d.webp' },
      { id: 'claire', file: 'public/images/languages/3d/mentor_female_3d.webp' },
      { id: 'arthur', file: 'public/images/languages/3d/mentor_male_3d_v2.webp' },
      { id: 'shakespeare', file: 'public/images/languages/3d/shakespeare_3d.webp' },
      { id: 'napoleon', file: 'public/images/languages/3d/napoleon_3d.webp' },
      { id: 'marie_curie', file: 'public/images/languages/3d/marie_curie_3d.webp' },
    ];

    for (const rig of openSmile3DRigs) {
      const cfg = getHistoricalMouthConfig(rig.id);
      expect(cfg.lowerLipTopY, `${rig.id} debe definir lowerLipTopY`).toBeDefined();
      expect(cfg.teethBottomY, `${rig.id} debe definir teethBottomY`).toBeDefined();
      expect(cfg.upperLipBottomY, `${rig.id} debe definir upperLipBottomY`).toBeDefined();
      expect(cfg.lowerLipTopY!).toBeGreaterThan(cfg.teethBottomY!);

      const { data } = await sharp(path.join(process.cwd(), rig.file))
        .resize(1024, 1024, { fit: 'fill' })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      const sampleY = Math.ceil(cfg.lowerLipTopY!);
      const idx = (sampleY * 1024 + Math.round(cfg.cx)) * 4;
      const luma = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];

      expect(
        luma,
        `${rig.id} en (cx=${cfg.cx}, y=${sampleY}) cayó en cavidad oscura (luma=${luma.toFixed(1)}) -> riesgo de doble boca`
      ).toBeGreaterThanOrEqual(84);
    }
  });

  it('2. Todas las poses 3D de los 9 rigs son 1024x1024 WebP optimizados (< 300 KB)', async () => {
    for (const [rigId, rig] of Object.entries(CHARACTER_3D_RIGS)) {
      const urls = new Set<string>([
        rig.idle,
        ...(Object.values(rig.poseCompendium).filter(Boolean) as string[]),
      ]);
      for (const rel of urls) {
        const abs = path.join(process.cwd(), 'public', rel.replace(/^\//, ''));
        expect(fs.existsSync(abs), `Falta pose ${rel} en ${rigId}`).toBe(true);
        const stat = fs.statSync(abs);
        expect(stat.size / 1024, `${rel} excede 300KB`).toBeLessThan(300);
        const meta = await sharp(abs).metadata();
        expect(meta.format).toBe('webp');
      }
    }
  });

  it('3. Los 30 retratos históricos 2D tienen landmarks anatómicos simétricos y consistentes', () => {
    const all30Keys = [
      'josefa',
      'zapata',
      'juarez',
      'sor juana',
      'morelos',
      'cuauhtemoc',
      'allende',
      'carmen serdan',
      'aquiles serdan',
      'madero',
      'cardenas',
      'calles',
      'flores magon',
      'guadalupe victoria',
      'quintana roo',
      'belisario',
      'felipe angeles',
      'diaz ordaz',
      'posada',
      'villa',
      'hidalgo',
      'leona vicario',
      'personaje_generico',
      'napoleon.jpg',
      'shakespeare.jpg',
      'abraham_lincoln.jpg',
      'ada_lovelace.jpg',
      'marie_curie.jpg',
      'victor_hugo.jpg',
      'jeanne_darc.jpg',
    ];

    for (const key of all30Keys) {
      const cfg = getHistoricalMouthConfig(key);
      expect(cfg.x1, `${key}: x1 < cx`).toBeLessThan(cfg.cx);
      expect(cfg.cx, `${key}: cx < x2`).toBeLessThan(cfg.x2);
      expect(cfg.leftEyeX!, `${key}: leftEyeX < cx`).toBeLessThan(cfg.cx);
      expect(cfg.cx, `${key}: cx < rightEyeX`).toBeLessThan(cfg.rightEyeX!);
      const eyeMidX = (cfg.leftEyeX! + cfg.rightEyeX!) * 0.5;
      // Mouth horizontal center must align reasonably with inter-pupillary center (no 30px cheek drift!)
      expect(
        Math.abs(cfg.cx - eyeMidX),
        `${key}: desfase horizontal boca vs ojos excesivo (cx=${cfg.cx}, eyeMidX=${eyeMidX})`
      ).toBeLessThanOrEqual(24);
      expect(cfg.eyeY!, `${key}: eyeY < cy`).toBeLessThan(cfg.cy - 38);
      expect(cfg.chinY!, `${key}: chinY > cy`).toBeGreaterThan(cfg.cy + 20);
    }
  });

  it('4. Motor gráfico NanoBananaLipSyncCanvas usa malla monótona continua por columna y alineación de puente facial superior', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src/components/common/NanoBananaLipSyncCanvas.tsx'),
      'utf8'
    );
    expect(src).toContain('computeUpperFaceBridgeShift');
    expect(src).toContain('measurePoseMouthAnatomy');
    expect(src).toContain('traceOralSpline');
    expect(src).toContain('srcUpperLipBotY');
    expect(src).toContain('srcTeethBotY');
    expect(src).toContain('srcLowerLipY');
    // Prohibido usar forward-scattering sobre lowerLipTopY que duplique cavidad bucal
    expect(src).not.toContain('dstBaseY + dy');
  });
});
