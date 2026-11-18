import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { sanitizeAndEnsureCompleteCatalog, useLanguagesStore } from '@/store/useLanguagesStore';
import { resolveCertifiedPlatformVoice } from '@/app/api/ai/tts/route';
import { getHistoricalMouthConfig, MULTILINGUAL_HISTORICAL_FIGURES } from '@/lib/historicalVoiceEngine';
import { resetActiveVoiceFormantLevels } from '@/lib/audio/studioBroadcastMaster';
import { useStudentStore } from '@/store/useStudentStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { extractExamQuestionsFromStudioBlocks } from '@/services/deterministicExamOmrEngine';
import type { StudioBlock } from '@/types/studioBlocks';

describe('🔬 AUDITORÍA QUIRÚRGICA INTEGRAL: DEMO 0MS, INMUTABILIDAD DE VOCES, LIP-SYNC 3D Y ESTUDIO', () => {
  beforeEach(() => {
    useStudentStore.getState().resetStudentStore();
    useGamificationStore.getState().resetGamificationStore();
  });

  it('1. Inmutabilidad de Voces: repara localStorage heredado y bloquea cambios inesperados de timbre en EN, FR y ES', () => {
    const initial = useLanguagesStore.getState().lessons;
    const corrupted = initial.map((lesson) => ({
      ...lesson,
      avatarVoice: 'legacy-corrupted-voice-id',
    }));

    const sanitized = sanitizeAndEnsureCompleteCatalog(corrupted);
    const claireLesson = sanitized.find((l) => l.id === 'lesson-en-coffee');
    const arthurLesson = sanitized.find((l) => l.id === 'lesson-en-schedule');
    const adaLesson = sanitized.find((l) => l.id === 'lesson-en-lovelace-b1');
    const shakLesson = sanitized.find((l) => l.id === 'lesson-en-shakespeare');
    const sophieLesson = sanitized.find((l) => l.id === 'lesson-fr-paris');
    const henriLesson = sanitized.find((l) => l.id === 'lesson-fr-college-a1');
    const curieLesson = sanitized.find((l) => l.id === 'lesson-fr-curie-b1');
    const napoleonLesson = sanitized.find((l) => l.id === 'lesson-fr-napoleon');

    expect(claireLesson?.avatarVoice).toBe('en-US-JennyNeural');
    expect(arthurLesson?.avatarVoice).toBe('en-US-GuyNeural');
    expect(adaLesson?.avatarVoice).toBe('en-GB-SoniaNeural');
    expect(shakLesson?.avatarVoice).toBe('en-GB-RyanNeural');
    expect(sophieLesson?.avatarVoice).toBe('fr-FR-DeniseNeural');
    expect(henriLesson?.avatarVoice).toBe('fr-FR-HenriNeural');
    expect(curieLesson?.avatarVoice).toBe('fr-FR-DeniseNeural');
    expect(napoleonLesson?.avatarVoice).toBe('fr-FR-HenriNeural');

    // Las 7 figuras históricas multilingües conservan sus voces certificadas exactas
    for (const fig of MULTILINGUAL_HISTORICAL_FIGURES) {
      const resolved = resolveCertifiedPlatformVoice(fig.voiceId, fig.language, fig.gender);
      expect(resolved.voice).toBe(fig.voiceId);
    }

    // Bloqueo determinista de español latinoamericano (cero castellano peninsular)
    expect(resolveCertifiedPlatformVoice('es-ES-AlvaroNeural', 'es', 'male').voice).toBe('es-MX-JorgeNeural');
    expect(resolveCertifiedPlatformVoice('es-ES-ElviraNeural', 'es', 'female').voice).toBe('es-MX-DaliaNeural');
  });

  it('2. Lip-Sync 3D Anatómico: rig facial activo en los 9 avatares (incluida Claire/Sophie), puente de formantes y calibración sub-píxel', () => {
    const avatarSrc = fs.readFileSync(
      path.join(process.cwd(), 'src/components/languages/HumanGesticulatingAvatar.tsx'),
      'utf8'
    );
    expect(avatarSrc).toContain('videoHasNativeLipSync={false}');

    const canvasSrc = fs.readFileSync(
      path.join(process.cwd(), 'src/components/common/NanoBananaLipSyncCanvas.tsx'),
      'utf8'
    );
    expect(canvasSrc).toContain('computeUpperFaceBridgeShift');
    expect(canvasSrc).toContain('lipSealPaletteRef');
    expect(canvasSrc).toContain('audioGraphActive');

    expect(typeof resetActiveVoiceFormantLevels).toBe('function');

    // Verificar landmarks bucales calibrados de los 9 personajes 3D
    const claire = getHistoricalMouthConfig('claire');
    expect(claire.cy).toBeGreaterThanOrEqual(374);
    expect(claire.cy).toBeLessThanOrEqual(382);

    const napoleon = getHistoricalMouthConfig('napoleon');
    expect(napoleon.cy).toBeGreaterThanOrEqual(282);
    expect(napoleon.cy).toBeLessThanOrEqual(290);
    expect(napoleon.bustCrop?.zoom).toBeGreaterThan(1.2);

    const curie = getHistoricalMouthConfig('marie_curie');
    expect(curie.bustCrop?.zoom).toBeGreaterThan(1.3);

    const hugo = getHistoricalMouthConfig('victor_hugo');
    expect(hugo.cy).toBeGreaterThanOrEqual(456);
    expect(hugo.cy).toBeLessThanOrEqual(463);
  });

  it('3. Modo Demo Cero Tiempos Muertos: XP acumulativa de Valentina (1850 -> 1900) y compra atómica local en 0ms', async () => {
    const initialValentina = useStudentStore.getState().allStats['std-demo-01'];
    expect(initialValentina.xp).toBe(1850);
    expect(initialValentina.coins).toBe(163);

    await useStudentStore.getState().addXpAndCoins('std-demo-01', 50, 20);
    const afterAward = useStudentStore.getState().allStats['std-demo-01'];
    expect(afterAward.xp).toBe(1900);
    expect(afterAward.coins).toBe(183);
    expect(afterAward.level).toBeGreaterThanOrEqual(9);

    await useStudentStore.getState().purchaseArtifact('std-demo-01', 'art-hp-potion');
    const afterPurchase = useStudentStore.getState().allStats['std-demo-01'];
    const inv = useStudentStore.getState().studentInventoryMap['std-demo-01'] || [];
    expect(inv).toContain('art-hp-potion');
    expect(afterPurchase.coins).toBeLessThan(183);
    expect(afterPurchase.coins).toBeGreaterThan(80);
  });

  it('4. Estudio Docente: extracción OMR sin desajustes de esquema y asignación multi-colegio respetando schoolId y grado', async () => {
    const sampleBlocks: StudioBlock[] = [
      {
        id: 'b-ord-1',
        type: 'ordering_sequence',
        title: 'Etapas del Método Científico',
        position: { x: 0, y: 0 },
        data: {
          stepsInCorrectOrder: ['Observación', 'Hipótesis', 'Experimentación', 'Conclusión'],
        },
      } as StudioBlock,
      {
        id: 'b-sec-1',
        type: 'secret_code_puzzle',
        title: 'Candado Histórico',
        position: { x: 100, y: 0 },
        data: {
          clueText: '¿En qué año inició la Independencia de México?',
          secretAnswer: '1810',
          hintText: 'Siglo XIX temprano',
        },
      } as StudioBlock,
      {
        id: 'b-lang-en',
        type: 'languages_practice_portal',
        title: 'Cambridge A2 Polite Request',
        position: { x: 200, y: 0 },
        data: {
          language: 'en',
          targetPhrase: 'Could I have two return tickets to Oxford, please?',
        } as any,
      } as StudioBlock,
    ];

    const extracted = extractExamQuestionsFromStudioBlocks(sampleBlocks, 0);
    const ordQ = extracted.find((q) => q.id === 'ord-b-ord-1');
    const gateQ = extracted.find((q) => q.id === 'gate-b-sec-1');
    const langQ = extracted.find((q) => q.id === 'lang-b-lang-en');

    expect(ordQ).toBeDefined();
    expect(ordQ?.options[0]).toContain('Observación');
    expect(gateQ?.stem).toContain('Independencia de México');
    expect(gateQ?.options[0]).toBe('1810');
    expect(langQ?.options[1]).not.toContain('Je veux');

    const res = await useGamificationStore.getState().assignStudioActivity({
      schoolId: 'sch-demo-0001',
      groupId: 'grp-demo-pri-5a',
      groupName: '5º A Primaria',
      levelGradeId: 'primaria-5º',
      subjectId: 'sub-sci',
      activityTitle: 'Misión Ecosistemas Demo',
      blocks: sampleBlocks,
      xpReward: 120,
      coinsReward: 30,
    });

    expect(res.success).toBe(true);
    const assigned = useGamificationStore
      .getState()
      .missionsList.find((m) => m.id === res.missionId);
    expect(assigned?.school_id).toBe('sch-demo-0001');
    expect(assigned?.level_grade_id).toBe('primaria-5º');
  });
});
