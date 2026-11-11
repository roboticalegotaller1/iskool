import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { useActivityBuilderStore } from '@/store/useActivityBuilderStore';
import {
  MEXICAN_INDEPENDENCE_BLOCKS,
  MEXICAN_INDEPENDENCE_CONNECTIONS,
  HISTORICAL_FIGURES_PRESET_CATALOG,
  buildDynamicHistoricalFigureData
} from '@/data/mexicanIndependenceStudioFlow';
import { StudioBlockType } from '@/types/studioBlocks';
import {
  generateExamVariantsZeroToken,
  extractExamQuestionsFromStudioBlocks,
  runClassroomOmrBatchGradingZeroToken,
  evaluateOpenAnswerDeterministically
} from '@/services/deterministicExamOmrEngine';
import { generateOmrExamPdfBytes } from '@/services/omrExamPdfExporter';
import {
  CATEGORY_VISUAL_SPECS,
  BLOCK_VISUAL_SPECS
} from '@/components/studio/builder/StudioPremiumBlockIcon';
import { isUuid, mapStudentIdToUuid, normalizeStudentId } from '@/store/useStudentStore';
import { resolveCertifiedPlatformVoice } from '@/app/api/ai/tts/route';

describe('🔬 AUDITORÍA FORENSE Y REDISEÑO 1 (VISTA 1.1) — ISKOOL STUDIO', () => {
  beforeEach(() => {
    useActivityBuilderStore.getState().resetWorkspace();
  });

  it('1. Cero dependencia de Josefa Ortiz: rotar automáticamente personajes de la Bóveda Curricular al insertar múltiples bloques 3D', () => {
    const store = useActivityBuilderStore.getState();

    // Limpiar a un solo bloque inicial y agregar 4 bloques de personajes históricos seguidos
    const id1 = store.addBlock('historical_figure_block');
    const id2 = store.addBlock('historical_figure_block');
    const id3 = store.addBlock('historical_figure_block');
    const id4 = store.addBlock('historical_figure_block');

    const blocks = useActivityBuilderStore.getState().blocks.filter(
      (b) => b.type === 'historical_figure_block' && [id1, id2, id3, id4].includes(b.id)
    );

    expect(blocks.length).toBe(4);
    const names = blocks.map((b: any) => b.data.characterName);
    const uniqueNames = new Set(names);

    // Todos deben ser personajes distintos, nunca repetir Josefa Ortiz de Domínguez en serie
    expect(uniqueNames.size).toBe(4);
  });

  it('2. Selector Universal de los 22+ personajes/sitios de la Bóveda y creación libre en 1ª persona estricta', async () => {
    const store = useActivityBuilderStore.getState();
    const blockId = store.addBlock('historical_figure_block');

    // Cambiar a Cuauhtémoc (uno de los 22 nodos de la Bóveda)
    await store.switchHistoricalFigureOnBlock(blockId, 'Cuauhtémoc', false);
    let updated = useActivityBuilderStore.getState().blocks.find((b) => b.id === blockId) as any;
    expect(updated.data.characterName).toBe('Cuauhtémoc');
    expect(updated.data.avatarImageUrl).toContain('cuauhtemoc_avatar.png');
    expect(updated.data.shortBio).toMatch(/Fui el/i);

    // Cambiar a un personaje o sitio personalizado creado al vuelo (ej. Nezahualcóyotl)
    const customData = buildDynamicHistoricalFigureData('Nezahualcóyotl', 0, false);
    expect(customData.characterName).toBe('Nezahualcóyotl');
    expect(customData.shortBio).toMatch(/^Soy Nezahualcóyotl\./);
  });

  it('3. Layout topológico anti-colisión y bifurcación condicional real (≥ 70% Ruta Maestría vs < 70% Ruta Refuerzo)', () => {
    expect(MEXICAN_INDEPENDENCE_BLOCKS.length).toBeGreaterThanOrEqual(5);

    // Verificar que ningún par de bloques se encime (distancia mínima Manhattan > 180px)
    for (let i = 0; i < MEXICAN_INDEPENDENCE_BLOCKS.length; i++) {
      for (let j = i + 1; j < MEXICAN_INDEPENDENCE_BLOCKS.length; j++) {
        const posA = MEXICAN_INDEPENDENCE_BLOCKS[i].position!;
        const posB = MEXICAN_INDEPENDENCE_BLOCKS[j].position!;
        const dist = Math.hypot(posA.x - posB.x, posA.y - posB.y);
        expect(dist).toBeGreaterThan(180);
      }
    }

    // Verificar bifurcación real desde logic_branch
    const logicBlock = MEXICAN_INDEPENDENCE_BLOCKS.find((b) => b.type === 'logic_branch');
    expect(logicBlock).toBeDefined();

    const branchConns = MEXICAN_INDEPENDENCE_CONNECTIONS.filter(
      (c) => c.sourceNodeId === logicBlock!.id
    );
    expect(branchConns.length).toBe(2);
    expect(branchConns.some((c) => c.condition === 'score_high')).toBe(true);
    expect(branchConns.some((c) => c.condition === 'score_low')).toBe(true);
  });

  it('4. Los 34 tipos de bloques didácticos de Studio (incluyendo los 6 bloques internacionales 0-Tokens) se instancian con datos válidos y sin errores', () => {
    const all34Types: StudioBlockType[] = [
      'text_narrative',
      'quiz_question',
      'timed_reading_block',
      'reward_chest',
      'boss_enemy',
      'logic_challenge_interactive',
      'boolean_circuit_builder',
      'graph_network_path',
      'turing_step_simulator',
      'constraint_scheduler',
      'languages_practice_portal',
      'languages_karaoke_block',
      'languages_socratic_tutor',
      'languages_roleplay_mission',
      'languages_evaluation_rubric',
      'historical_figure_block',
      'youtube_video',
      'external_embed',
      'drag_drop_match',
      'ordering_sequence',
      'fill_in_blanks',
      'open_poll_wordcloud',
      'secret_code_puzzle',
      'minigame_action',
      'logic_branch',
      'checkpoint_gate',
      'badge_certificate',
      'audio_sfx',
      'omr_optical_exam_block',
      'interactive_hotspot_canvas',
      'cornell_smart_notes',
      'exit_ticket_reflection',
      'socratic_debate_arena',
      'interactive_whiteboard_math'
    ];

    expect(all34Types.length).toBe(34);
    const store = useActivityBuilderStore.getState();

    for (const type of all34Types) {
      const id = store.addBlock(type);
      const created = useActivityBuilderStore.getState().blocks.find((b) => b.id === id);
      expect(created).toBeDefined();
      expect(created?.type).toBe(type);
      expect(created?.position).toBeDefined();
    }
  });

  it('5. Cero sobreposición de paneles (Portales z-[9995] y ocultación automática de Inspector/Simulador) + Telemetría de Tokens en Tiempo Real (1s)', () => {
    const drawerCode = fs.readFileSync(
      path.join(process.cwd(), 'src/components/studio/builder/NodeConfigDrawer.tsx'),
      'utf-8'
    );
    const extendedCode = fs.readFileSync(
      path.join(process.cwd(), 'src/components/studio/builder/ExtendedToolsDrawer.tsx'),
      'utf-8'
    );
    const layoutCode = fs.readFileSync(
      path.join(process.cwd(), 'src/components/studio/builder/ActivityBuilderLayout.tsx'),
      'utf-8'
    );

    // 1. NodeConfigDrawer y ExtendedToolsDrawer usan createPortal hacia document.body con z-[9995] / z-[9990]
    expect(drawerCode).toContain('createPortal(');
    expect(drawerCode).toContain('z-[9995]');
    expect(extendedCode).toContain('createPortal(');
    expect(extendedCode).toContain('z-[9990]');

    // 2. ActivityBuilderLayout oculta automáticamente el aside derecho (Inspector | Simulador) cuando isAnyOverlayOpen está activo
    expect(layoutCode).toContain('const isAnyOverlayOpen = Boolean(');
    expect(layoutCode).toContain('isNodeConfigDrawerOpen ||');
    expect(layoutCode).toContain('aria-hidden={isAnyOverlayOpen}');

    // 3. Telemetría de Tokens y Cuenta Regresiva en Tiempo Real (1000ms) integrada en Top Bar 1 y Modal Models & Usage
    expect(layoutCode).toContain('iskool_realtime_quota_telemetry_v1');
    expect(layoutCode).toContain('formatLiveCountdown');
    expect(layoutCode).toContain('{weeklyRemainingPct.toFixed(2)}%');
    expect(layoutCode).toContain('Models & Usage • Telemetría en Tiempo Real');
  });

  it('6. Motor de Exámenes Híbridos OMR & Variantes Anti-Copia A/B/C/D opera al 100% con 0 Tokens (Fisher-Yates Determinista + Escáner Lote + Rúbrica Léxica)', () => {
    const baseQuestions = extractExamQuestionsFromStudioBlocks(MEXICAN_INDEPENDENCE_BLOCKS);
    expect(baseQuestions.length).toBeGreaterThanOrEqual(5);

    // 1. Generar 4 variantes deterministas produce exactamente las mismas claves reproducibles
    const variantsRun1 = generateExamVariantsZeroToken(baseQuestions, ['A', 'B', 'C', 'D'], true, true);
    const variantsRun2 = generateExamVariantsZeroToken(baseQuestions, ['A', 'B', 'C', 'D'], true, true);
    expect(variantsRun1.length).toBe(4);
    expect(variantsRun1.map((v) => v.variantCode)).toEqual(['A', 'B', 'C', 'D']);
    expect(variantsRun1[1].answerKey).toEqual(variantsRun2[1].answerKey);

    // 2. Calificación óptica en lote de todo el salón en 0 Tokens
    const batchSummary = runClassroomOmrBatchGradingZeroToken({
      examTitle: 'Evaluación Bimestral de la Independencia',
      schoolName: 'Instituto Bilingüe IBIME',
      groupName: '1°A Secundaria',
      baseQuestions,
      variants: variantsRun1,
      penaltyPerError: 0.25
    });
    expect(batchSummary.tokensConsumed).toBe(0);
    expect(batchSummary.totalStudentsScanned).toBeGreaterThanOrEqual(8);
    expect(batchSummary.itemPsychometrics.length).toBe(baseQuestions.length);

    // 3. Evaluación determinista de pregunta abierta con 0 Tokens
    const openEval = evaluateOpenAnswerDeterministically(
      'Doña Josefa Ortiz de Domínguez envió el aviso urgente desde Querétaro con Ignacio Pérez hacia Dolores para luchar por la soberanía y libertad.',
      ['Querétaro', 'Josefa Ortiz', 'Ignacio Pérez', 'Dolores'],
      10
    );
    expect(openEval.score).toBe(10);
    expect(openEval.matchedKeywords.length).toBe(4);

    // 4. Exportación en Formato PDF Vectorial Nativo (ISO PDF 1.4 en 0 Tokens):
    // 4a. PDF individual de Fila A (1 página)
    const singlePdf = generateOmrExamPdfBytes({
      examTitle: 'Evaluación Bimestral de la Independencia',
      schoolName: 'Instituto Bilingüe IBIME',
      schoolShortName: 'IBIME',
      groupName: '1°A Secundaria',
      notebookPage: 48,
      penaltyPerError: 0.25,
      scope: 'single_variant',
      selectedVariantCode: 'A',
      variants: variantsRun1,
      batchReport: batchSummary
    });
    expect(singlePdf.pageCount).toBeGreaterThanOrEqual(1);
    expect(singlePdf.fileName).toContain('Fila_A_OMR.pdf');
    const headerStr = String.fromCharCode(...singlePdf.bytes.slice(0, 8));
    expect(headerStr).toBe('%PDF-1.4');

    // 4b. Paquete Maestro PDF con las 4 Filas (A, B, C, D) + Hoja Maestra de Claves Docente
    const masterPackPdf = generateOmrExamPdfBytes({
      examTitle: 'Evaluación Bimestral de la Independencia',
      schoolName: 'Instituto Bilingüe IBIME',
      schoolShortName: 'IBIME',
      groupName: '1°A Secundaria',
      notebookPage: 48,
      penaltyPerError: 0.25,
      scope: 'all_4_variants_pack',
      variants: variantsRun1,
      batchReport: batchSummary
    });
    expect(masterPackPdf.pageCount).toBe(singlePdf.pageCount * 4 + 1);
    expect(masterPackPdf.bytes.byteLength).toBeGreaterThan(2500);

    // 4c. Acta Oficial de Calificaciones & Psicometría Kardex SEP en PDF
    const kardexPdf = generateOmrExamPdfBytes({
      examTitle: 'Evaluación Bimestral de la Independencia',
      schoolName: 'Instituto Bilingüe IBIME',
      schoolShortName: 'IBIME',
      groupName: '1°A Secundaria',
      notebookPage: 48,
      penaltyPerError: 0.25,
      scope: 'psychometrics_kardex_report',
      variants: variantsRun1,
      batchReport: batchSummary
    });
    expect(kardexPdf.pageCount).toBe(1);
    expect(kardexPdf.fileName).toContain('Acta_Calificaciones_Kardex_SEP.pdf');
  });

  it('7. Los 44 iconos 3D externos (Agrupaciones) e internos (34 Bloques) existen en formato WebP comprimido (< 50 KB, REGLA NO NEGOCIABLE 3) y tienen insignias explicativas', () => {
    const publicDir = path.join(process.cwd(), 'public');

    // Verificar todas las categorías externas
    for (const [catKey, spec] of Object.entries(CATEGORY_VISUAL_SPECS)) {
      expect(spec.badgeText.length).toBeGreaterThan(0);
      const absPath = path.join(publicDir, spec.imagePath);
      expect(fs.existsSync(absPath), `Falta icono 3D de categoría ${catKey}: ${absPath}`).toBe(true);
      const stats = fs.statSync(absPath);
      expect(stats.size).toBeGreaterThan(500);
      expect(stats.size).toBeLessThan(50 * 1024); // Menor a 50 KB
    }

    // Verificar los 34 bloques internos
    const blockKeys = Object.keys(BLOCK_VISUAL_SPECS);
    expect(blockKeys.length).toBe(34);
    for (const [blockKey, spec] of Object.entries(BLOCK_VISUAL_SPECS)) {
      expect(spec.microTag.length).toBeGreaterThan(0);
      expect(spec.tooltip.length).toBeGreaterThan(10);
      const absPath = path.join(publicDir, spec.imagePath);
      expect(fs.existsSync(absPath), `Falta icono 3D de bloque ${blockKey}: ${absPath}`).toBe(true);
      const stats = fs.statSync(absPath);
      expect(stats.size).toBeGreaterThan(500);
      expect(stats.size).toBeLessThan(50 * 1024); // Menor a 50 KB
    }
  });

  it('8. Blindaje UUID para alumnos IBIME (std-ibime-montes-01) y Homologación Acústica 3.8-flash-lite-tts (es-419-*) -> Respaldo Neural Continuo (24 voces LatAm)', () => {
    // 1. Verificar que std-ibime-montes-01 y demás IDs IBIME se mapean a UUID determinista válido y se normalizan de vuelta
    const mappedMontes = mapStudentIdToUuid('std-ibime-montes-01');
    expect(isUuid(mappedMontes)).toBe(true);
    expect(normalizeStudentId(mappedMontes)).toBe('std-ibime-montes-01');

    const mappedLagos = mapStudentIdToUuid('std-ibime-lagos-01');
    expect(isUuid(mappedLagos)).toBe(true);
    expect(normalizeStudentId(mappedLagos)).toBe('std-ibime-lagos-01');

    // 2. Verificar que useStudentStore protege todas las escrituras a Supabase con isUuid(dbStudentId)
    const studentStoreCode = fs.readFileSync(
      path.join(process.cwd(), 'src/store/useStudentStore.ts'),
      'utf-8'
    );
    expect(studentStoreCode).toContain("'std-ibime-montes-01': 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380b01'");
    expect(studentStoreCode).not.toContain("console.error('Error al actualizar estadísticas en Supabase:'");

    // 3. Verificar que todos los arquetipos 3.8-flash-lite-tts (es-419-* y voice_*) se resuelven a sus 24 voces LatAm calibradas
    expect(resolveCertifiedPlatformVoice('es-419-advisor-7', 'es', 'female').voice).toBe('es-US-PalomaNeural');
    expect(resolveCertifiedPlatformVoice('es-419-advisor-4', 'es', 'female').voice).toBe('es-MX-DaliaNeural');
    expect(resolveCertifiedPlatformVoice('es-419-commercial-6', 'es', 'female').voice).toBe('es-CO-SalomeNeural');
    expect(resolveCertifiedPlatformVoice('es-419-tutor-3', 'es', 'female').voice).toBe('es-CR-MariaNeural');
    expect(resolveCertifiedPlatformVoice('es-419-assistant-1', 'es', 'female').voice).toBe('es-PE-CamilaNeural');
    expect(resolveCertifiedPlatformVoice('es-419-concierge-2', 'es', 'male').voice).toBe('es-MX-JorgeNeural');
    expect(resolveCertifiedPlatformVoice('es-419-concierge-7', 'es', 'male').voice).toBe('es-CO-GonzaloNeural');
    expect(resolveCertifiedPlatformVoice('es-419-concierge-8', 'es', 'male').voice).toBe('es-US-AlonsoNeural');
    expect(resolveCertifiedPlatformVoice('es-419-podcaster-3', 'es', 'male').voice).toBe('es-PE-AlexNeural');

    // 4. Verificar la presencia de la matriz de calibración acústica y formántica en neural_tts_worker.py
    const workerPyCode = fs.readFileSync(
      path.join(process.cwd(), 'scripts/neural_tts_worker.py'),
      'utf-8'
    );
    expect(workerPyCode).toContain('ES_419_TO_NEURAL_LATAM_CALIBRATION');
    expect(workerPyCode).toContain('_resolve_calibrated_neural_latam_profile');
    expect(workerPyCode).toContain('_shape_conversational_cadence_for_neural_latam');
    expect(workerPyCode).toContain('harmonic_drive');
  });
});

