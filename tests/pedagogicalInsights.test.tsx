import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { POST as pedagogicalInsightsHandler } from '@/app/api/vault/pedagogical-insights/route';
import { InstitutionalMemoryAdvisor } from '@/components/studio/InstitutionalMemoryAdvisor';
import { NextRequest } from 'next/server';

describe('Fase 9: Endpoint POST /api/vault/pedagogical-insights', () => {
  it('retorna fricciones ordenadas por relevancia y tasa de dominio para temas conocidos', async () => {
    const req = new NextRequest('http://localhost:3000/api/vault/pedagogical-insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subjectId: 'matematicas',
        gradeLevel: '4',
        topicKeywords: ['fracciones', 'equivalentes']
      })
    });

    const response = await pedagogicalInsightsHandler(req);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.found).toBe(true);
    expect(data.totalMemoriesFound).toBeGreaterThanOrEqual(2);
    expect(data.metrics.averageMasteryRate).toBeGreaterThan(0);
    expect(data.metrics.totalStudentsEvaluated).toBeGreaterThan(0);

    // Verificar que las fricciones estén ordenadas por relevancia
    expect(data.frictionPoints.length).toBeGreaterThan(0);
    const firstFriction = data.frictionPoints[0];
    expect(firstFriction.severity).toBe('alta');
    expect(firstFriction.occurrences).toBeGreaterThanOrEqual(1);

    // Verificar presencia de intervenciones y citas wiki
    expect(data.interventions.length).toBeGreaterThan(0);
    expect(data.citedMemories.length).toBeGreaterThan(0);
    expect(data.citedMemories[0].wikiLink).toContain('[[planeaciones/Memorias_Institucionales/');
  });

  it('retorna found: false de forma limpia ante temas sin registros históricos', async () => {
    const req = new NextRequest('http://localhost:3000/api/vault/pedagogical-insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subjectId: 'astronomia_cuantica_inexistente',
        gradeLevel: '99',
        topicKeywords: ['particulas_subatomicas_ficticias']
      })
    });

    const response = await pedagogicalInsightsHandler(req);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.found).toBe(false);
    expect(data.frictionPoints.length).toBe(0);
    expect(data.interventions.length).toBe(0);
    expect(data.recommendations.length).toBeGreaterThan(0);
  });
});

describe('Fase 9: Componente UI InstitutionalMemoryAdvisor', () => {
  const mockInsightsData = {
    success: true,
    found: true,
    query: { subject: 'matematicas', gradeLevel: '4', topicKeywords: ['fracciones'] },
    totalMemoriesFound: 3,
    cyclesCovered: ['2024-2025', '2025-2026'],
    metrics: { averageMasteryRate: 0.72, totalStudentsEvaluated: 85 },
    frictionPoints: [
      {
        friction: 'conversion_impropia_mixta',
        occurrences: 2,
        severity: 'alta' as const,
        cycles: ['2024-2025', '2025-2026']
      }
    ],
    interventions: [
      {
        intervention: 'Uso de material manipulable con regletas de fracciones',
        reportedBy: ['Prof. Roberto Garcia'],
        impactScore: 0.9
      }
    ],
    recommendations: ['Dedicar 10 minutos iniciales a fracciones manipulables'],
    citedMemories: [
      {
        cycle: '2025-2026',
        cohort: '4A',
        teacher: 'Prof. Roberto Garcia',
        wikiLink: '[[planeaciones/Memorias_Institucionales/2025-2026/Memoria_Test.md]]'
      }
    ]
  };

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockInsightsData)
      })
    ));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renderiza tarjeta de lecciones con badge de fricción alta y tasa de dominio tras debounce', async () => {
    render(
      <InstitutionalMemoryAdvisor
        topic="fracciones equivalentes"
        gradeLevel="4"
        subjectId="matematicas"
      />
    );

    // Esperar al debounce de 600ms y resolución del fetch
    await waitFor(
      () => {
        expect(screen.getByText('Bóveda Institucional: Lecciones Aprendidas')).toBeDefined();
        expect(screen.getByText(/Fricción Alta/i)).toBeDefined();
        expect(screen.getByText(/72% Dominio Histórico/i)).toBeDefined();
      },
      { timeout: 2000 }
    );
  });

  it('permite colapsar y expandir la tarjeta', async () => {
    render(
      <InstitutionalMemoryAdvisor
        topic="fracciones equivalentes"
        gradeLevel="4"
        subjectId="matematicas"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Fricciones Conceptuales Detectadas/i)).toBeDefined();
    }, { timeout: 2000 });

    const collapseBtn = screen.getByLabelText(/colapsar lecciones/i);
    fireEvent.click(collapseBtn);

    // Al colapsar, el detalle de fricciones ya no se muestra
    expect(screen.queryByText(/Fricciones Conceptuales Detectadas/i)).toBeNull();

    // Al expandir de nuevo, vuelve a mostrarse
    const expandBtn = screen.getByLabelText(/expandir lecciones/i);
    fireEvent.click(expandBtn);
    expect(screen.getByText(/Fricciones Conceptuales Detectadas/i)).toBeDefined();
  });

  it('permite desestimar la tarjeta y mostrar el botón discreto de recuperación', async () => {
    render(
      <InstitutionalMemoryAdvisor
        topic="fracciones equivalentes"
        gradeLevel="4"
        subjectId="matematicas"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Bóveda Institucional: Lecciones Aprendidas')).toBeDefined();
    });

    const dismissBtn = screen.getByLabelText(/desestimar lecciones por ahora/i);
    fireEvent.click(dismissBtn);

    // Debe mostrar el botón discreto
    const restoreBtn = screen.getByTitle(/ver lecciones aprendidas de la bóveda curricular/i);
    expect(restoreBtn).toBeDefined();

    // Reabrir
    fireEvent.click(restoreBtn);
    expect(screen.getByText('Bóveda Institucional: Lecciones Aprendidas')).toBeDefined();
  });

  it('ejecuta onApplyRecommendation con un solo clic al presionar Incorporar a Planeación', async () => {
    const handleApply = vi.fn();

    render(
      <InstitutionalMemoryAdvisor
        topic="fracciones equivalentes"
        gradeLevel="4"
        subjectId="matematicas"
        onApplyRecommendation={handleApply}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Incorporar a Planeación/i)).toBeDefined();
    });

    const applyBtn = screen.getByText(/Incorporar a Planeación/i);
    fireEvent.click(applyBtn);

    expect(handleApply).toHaveBeenCalledWith('Uso de material manipulable con regletas de fracciones');
    expect(screen.getByText('Incorporada')).toBeDefined();
  });
});
