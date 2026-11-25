import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  findStudioMasterClassInVault,
  parseTopicAndGrade,
} from '@/lib/services/studioVaultEngine.service';

describe('Estudio ISkool — Clase Maestra Vault-First (0 Tokens) y Diagramas WebP', () => {
  it('parseTopicAndGrade extrae tema y grado consistentemente desde texto libre o campos separados', () => {
    const a = parseTopicAndGrade('ecuaciones de segundo grado, 2do de secundaria');
    const b = parseTopicAndGrade('ecuaciones de segundo grado', '2º de Secundaria', 'Fase 6');

    expect(a.cleanTopic.toLowerCase()).toBe('ecuaciones de segundo grado');
    expect(a.gradeLabel).toBe('2º de Secundaria');
    expect(a.faseNem).toBe('Fase 6');
    expect(a.canonicalKey).toBe(b.canonicalKey);
  });

  it('recupera "ecuaciones de segundo grado, 2do de secundaria" desde la Bóveda Curricular a 0 tokens y $0.00 MXN', () => {
    const cached = findStudioMasterClassInVault('ecuaciones de segundo grado, 2do de secundaria');
    expect(cached).not.toBeNull();
    expect(cached!.tokenTelemetry.fromVault).toBe(true);
    expect(cached!.tokenTelemetry.totalTokens).toBe(0);
    expect(cached!.tokenTelemetry.costUsd).toBe(0);
    expect(cached!.tokenTelemetry.costMxn).toBe(0);
    expect(cached!.tokenTelemetry.savedTokens).toBeGreaterThan(0);
    expect(cached!.persistedInVault).toBe(true);
    expect(cached!.planeacionViewerUrl).toMatch(/^\/planeaciones\/Estudio_Interactivo\/Fase_6\//);

    const blockTypes = cached!.blocks.map((b) => b.type);
    expect(blockTypes).toContain('text_narrative');
    expect(blockTypes).toContain('interactive_hotspot_canvas');
    expect(blockTypes).toContain('interactive_whiteboard_math');
    expect(blockTypes).toContain('external_embed');
    expect(blockTypes).toContain('ordering_sequence');
    expect(blockTypes).toContain('drag_drop_match');
    expect(blockTypes.filter((t) => t === 'quiz_question').length).toBeGreaterThanOrEqual(3);
    expect(blockTypes).toContain('cornell_smart_notes');
    expect(blockTypes).toContain('exit_ticket_reflection');
    expect(blockTypes).toContain('boss_enemy');
    expect(blockTypes).toContain('reward_chest');
    expect(cached!.relatedResources.length).toBeGreaterThanOrEqual(3);
  });

  it('el diagrama pedagógico WebP existe en public/images/studio y cumple Regla No Negociable 3 (< 300 KB)', () => {
    const webpPath = path.join(
      process.cwd(),
      'public',
      'images',
      'studio',
      'diagrama_ecuaciones_segundo_grado_2sec.webp'
    );
    expect(fs.existsSync(webpPath)).toBe(true);
    const sizeBytes = fs.statSync(webpPath).size;
    expect(sizeBytes).toBeGreaterThan(10_000);
    expect(sizeBytes).toBeLessThan(300_000);
  });
});
