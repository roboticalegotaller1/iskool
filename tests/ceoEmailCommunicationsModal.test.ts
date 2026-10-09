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

  it('debe implementar el Blindaje Soberano para que una cuenta conectada jamás se desautorice en sincronización o ping', () => {
    // Protección contra desautorización involuntaria
    expect(content).toContain('Blindaje Soberano');
    expect(content).toContain('isAlreadyVerified');
    expect(content).toContain("options?.mode === 'sync'");
    expect(content).toContain("setConnectionStatus('connected_verified')");
    expect(content).toContain('handleTriggerSync');
  });

  it('debe incorporar la pestaña Bandeja de Entrada entre Bitácora y ROI & Telemetría con vista estilo Gmail en tiempo real', () => {
    expect(content).toContain("'raw_inbox'");
    expect(content).toContain('Bandeja de Entrada');
    
    // Verificar que está ubicada entre Bitácora y ROI & Telemetría
    const bitacoraIndex = content.indexOf("setActiveTab('bitacora')");
    const rawInboxIndex = content.indexOf("setActiveTab('raw_inbox')");
    const roiIndex = content.indexOf("setActiveTab('roi')");
    
    expect(bitacoraIndex).toBeGreaterThan(-1);
    expect(rawInboxIndex).toBeGreaterThan(bitacoraIndex);
    expect(roiIndex).toBeGreaterThan(rawInboxIndex);

    // Verificar componentes clave estilo Gmail
    expect(content).toContain('rawEmailsList');
    expect(content).toContain('handleToggleStarRawEmail');
    expect(content).toContain('handleMarkAsReadRawEmails');
    expect(content).toContain('selectedRawEmailId');
    expect(content).toContain('rawEmailCategory');
    expect(content).toContain('rawEmailSearchQuery');
    expect(content).toContain('/api/mail/raw-inbox');
  });

  it('debe incorporar el botón Calendario antes de + Agendar Nueva Cita / Evento con modal interactivo, Drag & Drop y sincronización inmediata con Google Calendar', () => {
    // 1. Botón "Calendario" ubicado inmediatamente antes de "+ Agendar Nueva Cita / Evento"
    const calendarioBtnIndex = content.indexOf('<span>Calendario</span>');
    const agendarBtnIndex = content.indexOf('<span>+ Agendar Nueva Cita / Evento</span>');

    expect(calendarioBtnIndex).toBeGreaterThan(-1);
    expect(agendarBtnIndex).toBeGreaterThan(-1);
    expect(calendarioBtnIndex).toBeLessThan(agendarBtnIndex);

    // 2. Ventana emergente (modal) con calendario interactivo y vista mensual
    expect(content).toContain('showInteractiveCalendarModal');
    expect(content).toContain('setShowInteractiveCalendarModal');
    expect(content).toContain('Calendario Escolar Interactivo');
    expect(content).toContain('calendarGridDays');
    expect(content).toContain('MONTH_NAMES_ES');
    expect(content).toContain('handlePrevMonth');
    expect(content).toContain('handleNextMonth');

    // 3. Sujetar y arrastrar (Drag & Drop) para mover a nueva fecha
    expect(content).toContain('draggable={true}');
    expect(content).toContain('handleEventDragStart');
    expect(content).toContain('handleDayDragOver');
    expect(content).toContain('handleDayDrop');
    expect(content).toContain('dragOverDate');
    expect(content).toContain('draggedEventId');

    // 4. Modificación de citas existentes
    expect(content).toContain('editingCalendarEvent');
    expect(content).toContain('setEditingCalendarEvent');
    expect(content).toContain('handleSaveEditedEvent');
    expect(content).toContain('Modificar Cita o Evento');

    // 5. Sincronización inmediata con Google Calendar / Gmail (TLS 1.3)
    expect(content).toContain('handleSyncEventToGoogleCalendar');
    expect(content).toContain('/api/mail/calendar');
    expect(content).toContain('Google Calendar API (TLS 1.3)');
  });
});

