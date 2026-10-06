import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import LaboratorioPedagógicoPage from '@/app/portal/ceo/laboratorio-pedagogico/page';
import fs from 'fs';
import path from 'path';

describe('🖥️ VISTA DEL LABORATORIO PEDAGÓGICO & TEST CASES', () => {
  const pagePath = path.join(
    process.cwd(),
    'src',
    'app',
    'portal',
    'ceo',
    'laboratorio-pedagogico',
    'page.tsx'
  );

  it('debe existir el archivo page.tsx en src/app/portal/ceo/laboratorio-pedagogico/', () => {
    expect(fs.existsSync(pagePath)).toBe(true);
  });

  const pageContent = fs.readFileSync(pagePath, 'utf-8');

  it('debe envolver el contenido en LaboratorioAuthGate', () => {
    expect(pageContent).toContain('<LaboratorioAuthGate');
    expect(pageContent).toContain('</LaboratorioAuthGate>');
  });

  it('debe contener la insignia de Bóveda 100% Hermética y Cifrada', () => {
    expect(pageContent).toContain('Bóveda 100% Hermética y Cifrada');
  });

  it('debe incluir selector de cuenta receptora dinámica', () => {
    expect(pageContent).toContain('direccion@');
    expect(pageContent).toContain('cobranza@');
    expect(pageContent).toContain('controlescolar@');
    expect(pageContent).toContain('coordinacion@');
  });

  it('debe ofrecer presets de casos canónicos para prueba instantánea', () => {
    expect(pageContent).toContain('Caso Crítico: Acoso en Recreo');
    expect(pageContent).toContain('Logística: Retraso Ruta 4');
    expect(pageContent).toContain('Cobranza: Factura CFDI Octubre');
    expect(pageContent).toContain('Control Escolar: Kardex SEP');
  });

  it('debe soportar la ingesta mediante pegado y arrastre de archivos .eml', () => {
    expect(pageContent).toContain('onDragOver');
    expect(pageContent).toContain('onDrop');
    expect(pageContent).toContain('.eml');
  });

  it('debe contener el botón de procesamiento en tiempo real con cerebro institucional', () => {
    expect(pageContent).toContain('⚡ Procesar en Tiempo Real con Cerebro Institucional');
  });

  it('debe renderizar el panel dividido con cuadrantes, explicabilidad, borrador y procedencia', () => {
    expect(pageContent).toContain('Cuadrante 1: Atención CEO & Gobernanza');
    expect(pageContent).toContain('¿Por qué te lo muestro? (Explicabilidad Directiva)');
    expect(pageContent).toContain('Borrador de Respuesta Oficial');
    expect(pageContent).toContain('Procedencia Institucional Verificada');
    expect(pageContent).toContain('Aprobar Despacho Oficial');
    expect(pageContent).toContain('Copiar Borrador');
  });

  it('debe respetar estrictamente la Regla No Negociable 1 (sin menciones a marcas comerciales prohibidas)', () => {
    const lower = pageContent.toLowerCase();
    expect(lower).not.toContain('gemini');
    expect(lower).not.toContain('obsidian');
    expect(lower).not.toContain('canvas lms');
    expect(lower).not.toContain('google classroom');
    expect(lower).not.toContain('blackboard');
  });
});
