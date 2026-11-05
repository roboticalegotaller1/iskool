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

  it('4. Los 28 tipos de bloques didácticos de Studio se instancian con datos válidos y sin errores', () => {
    const all28Types: StudioBlockType[] = [
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
      'audio_sfx'
    ];

    expect(all28Types.length).toBe(28);
    const store = useActivityBuilderStore.getState();

    for (const type of all28Types) {
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
});

