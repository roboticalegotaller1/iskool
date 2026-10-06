import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('📬 CONSOLA DE CORREO INSTITUCIONAL & SUITE EJECUTIVA 360° (CEOEmailCommunicationsModal)', () => {
  const componentPath = path.join(
    process.cwd(),
    'src',
    'components',
    'admin',
    'CEOEmailCommunicationsModal.tsx'
  );

  it('debe existir el archivo CEOEmailCommunicationsModal.tsx en src/components/admin/', () => {
    expect(fs.existsSync(componentPath)).toBe(true);
  });

  const content = fs.readFileSync(componentPath, 'utf-8');

  it('debe definir las 7 pestañas estratégicas de la Suite Ejecutiva', () => {
    expect(content).toContain("'inbox'");
    expect(content).toContain("'laboratorio'");
    expect(content).toContain("'google'");
    expect(content).toContain("'redactar'");
    expect(content).toContain("'directorio'");
    expect(content).toContain("'bitacora'");
    expect(content).toContain("'roi'");
  });

  it('debe implementar la diferenciación estricta entre Correos Usables y Correos No Usables', () => {
    expect(content).toContain('Correos Usables & Asuntos Clave');
    expect(content).toContain('Correos No Usables / Descartados');
    expect(content).toContain('inboxFilter');
    expect(content).toContain('usableSubFilter');
  });

  it('debe permitir conectar y enlazar cuentas reales de Google (Workspace o Gmail personal)', () => {
    expect(content).toContain("provider: 'google'");
    expect(content).toContain('signInWithOAuth');
    expect(content).toContain('customGoogleEmailInput');
    expect(content).toContain('connectedEmail');
    expect(content).toContain('@ibime.edu.mx');
    expect(content).toContain('@gmail.com');
  });

  it('debe incluir el Laboratorio de Ingesta en Vivo con casos canónicos predefinidos', () => {
    expect(content).toContain('Laboratorio de Ingesta & Test Cases');
    expect(content).toContain('HermeticEmailBrainService.processInboundEmail');
    expect(content).toContain('Campus Montes');
    expect(content).toContain('CFDI 4.0');
    expect(content).toContain('Ruta 4');
  });

  it('debe incorporar las 15 fases de inteligencia pedagógica y ejecutiva', () => {
    // Fases de triage y cuadrantes
    expect(content).toContain('Atención Inmediata CEO');
    expect(content).toContain('Delegado con SLA');
    expect(content).toContain('Informativo');
    expect(content).toContain('SPAM_DESCARTADO');

    // Explicabilidad y Grounding en Bóveda Curricular
    expect(content).toContain('¿Por qué te lo muestro?');
    expect(content).toContain('Bóveda Curricular');
    expect(content).toContain('why_shown');

    // Detección de patrones emergentes
    expect(content).toContain('Patrón Proactivo Detectado');
    expect(content).toContain('familias');

    // SLA y timers
    expect(content).toContain('sla_hours');
    expect(content).toContain('sla_remaining_text');

    // Borradores y telemetría ROI
    expect(content).toContain('suggested_draft_reply');
    expect(content).toContain('ROI & Telemetría');
  });

  it('debe contar con el diálogo matutino "Ponte al día conmigo" (Morning Executive Briefing)', () => {
    expect(content).toContain('Ponte al día conmigo');
    expect(content).toContain('showCatchupModal');
  });

  it('debe mantener compatibilidad total con los props del portal CEO', () => {
    expect(content).toContain('interface CEOEmailCommunicationsModalProps');
    expect(content).toContain('isOpen: boolean;');
    expect(content).toContain('onClose: () => void;');
    expect(content).toContain('holding: OrganizationHolding;');
    expect(content).toContain('schoolId?: string;');
    expect(content).toContain('selectedCampusId?: string;');
    expect(content).toContain('onTriggerToast: (msg: string) => void;');
  });

  it('debe cumplir de forma rigurosa con la Regla No Negociable 1 (Marca Blanca e Imposibilidad de Exponer Marcas Comerciales)', () => {
    const lower = content.toLowerCase();
    expect(lower).not.toContain('gemini');
    expect(lower).not.toContain('obsidian');
    expect(lower).not.toContain('canvas lms');
    expect(lower).not.toContain('google classroom');
    expect(lower).not.toContain('blackboard');
  });
});
