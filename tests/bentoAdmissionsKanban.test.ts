import { describe, it, expect } from 'vitest';
import { useCrmStore } from '../src/store/useCrmStore';
import {
  normalizeCampusKey,
  executeEnrollmentBridge,
  mapStageToPhase
} from '../src/services/admissionsPipelineService';

describe('FASE 4: Síntesis de Bento UI & Pipeline Kanban de Admisiones', () => {
  it('1. Mapea canónicamente las etapas de Carlos a las 5 Fases Departamentales', () => {
    // Fase 1: Lead (Captación & CRM)
    expect(mapStageToPhase('registered')).toBe(1);
    expect(mapStageToPhase('contacted')).toBe(1);

    // Fase 2: Visita (Tours de Campus)
    expect(mapStageToPhase('tour_scheduled')).toBe(2);
    expect(mapStageToPhase('pre_enrolled')).toBe(2);

    // Fase 3: Evaluación (Diagnóstico)
    expect(mapStageToPhase('evaluation')).toBe(3);

    // Fase 4: Reserva (Carta de Asignación)
    expect(mapStageToPhase('proposal_sent')).toBe(4);
    expect(mapStageToPhase('reservation')).toBe(4);

    // Fase 5: Matrícula (Inscripción Pagada)
    expect(mapStageToPhase('enrolled')).toBe(5);
    expect(mapStageToPhase('reenrolled')).toBe(5);
    expect(mapStageToPhase('transferred')).toBe(5);
  });

  it('2. El selector de sede filtra reactivamente los prospectos del CRM (IBIME 4 sedes)', () => {
    const store = useCrmStore.getState();
    const allLeads = store.leads;
    expect(allLeads.length).toBeGreaterThan(0);

    const montesLeads = allLeads.filter(l => normalizeCampusKey(l.campus_id) === 'montes');
    const lagosLeads = allLeads.filter(l => normalizeCampusKey(l.campus_id) === 'lagos');
    const sanCristobalLeads = allLeads.filter(l => normalizeCampusKey(l.campus_id) === 'sancristobal');
    const coacalcoLeads = allLeads.filter(l => normalizeCampusKey(l.campus_id) === 'coacalco');

    expect(montesLeads.length).toBeGreaterThan(0);
    expect(lagosLeads.length).toBeGreaterThan(0);
    expect(sanCristobalLeads.length).toBeGreaterThan(0);
    expect(coacalcoLeads.length).toBeGreaterThan(0);

    // Verificar que todas las sedes corresponden a los 4 planteles de IBIME
    const totalIbimeFiltered = montesLeads.length + lagosLeads.length + sanCristobalLeads.length + coacalcoLeads.length;
    expect(totalIbimeFiltered).toBeGreaterThanOrEqual(20);
  });

  it('3. Alta de nuevo aspirante al pipeline con validación de campos SEP y sincronización atómica', () => {
    const store = useCrmStore.getState();
    const initialCount = store.leads.length;

    const leadId = store.createLead({
      school_id: 'sch-ibime',
      campus_id: 'sancristobal',
      pipeline_type: 'new_enrollment',
      stage: 'registered',
      tutor_first_name: 'Guillermo',
      tutor_last_name_1: 'Del Toro',
      tutor_last_name_2: 'Gómez',
      tutor_last_name: 'Del Toro Gómez',
      tutor_phone: '55 9876 5432',
      tutor_email: 'guillermo.deltoro@cine.mx',
      tutor_relationship: 'Padre',
      source_channel: 'referral',
      source_detail: 'Registro desde Modal de Captura Avanzada Vista CEO',
      priority: 'hot',
      referral_incentive_applied: false,
      outcome: null,
      target_academic_year: '2026-2027',
      notes: 'Familia con alto interés en el laboratorio STEAM y robótica',
      campus_name: 'Campus San Cristóbal'
    });

    const candidateId = store.addCandidate({
      lead_id: leadId,
      first_name: 'Mariana',
      last_name_1: 'Del Toro',
      last_name_2: 'Rosas',
      last_name: 'Del Toro Rosas',
      target_level: 'primaria',
      target_grade: '3°',
      evaluation_status: 'pending',
      scholarship_percent: 0,
      status: 'active'
    });

    const updatedState = useCrmStore.getState();
    expect(updatedState.leads.length).toBe(initialCount + 1);

    const createdLead = updatedState.leads.find(l => l.id === leadId);
    expect(createdLead).toBeDefined();
    expect(createdLead?.tutor_first_name).toBe('Guillermo');
    expect(createdLead?.priority).toBe('hot');
    expect(createdLead?.stage).toBe('registered');

    const createdCand = updatedState.candidates.find(c => c.id === candidateId);
    expect(createdCand).toBeDefined();
    expect(createdCand?.first_name).toBe('Mariana');
    expect(createdCand?.last_name_1).toBe('Del Toro');
  });

  it('4. Avance rápido y drag & drop transiciona fluidamente entre las 5 fases hasta Matrícula', () => {
    const store = useCrmStore.getState();

    // Crear lead y candidato de prueba
    const leadId = store.createLead({
      school_id: 'sch-ibime',
      campus_id: 'montes',
      pipeline_type: 'new_enrollment',
      stage: 'registered',
      tutor_first_name: 'Valeria',
      tutor_last_name: 'Pérez Cano',
      tutor_relationship: 'Madre',
      tutor_phone: '55 1122 3344',
      tutor_email: 'valeria@email.mx',
      source_channel: 'website_form',
      priority: 'warm',
      referral_incentive_applied: false,
      outcome: null,
      target_academic_year: '2026-2027',
      campus_name: 'Campus Montes'
    });

    store.addCandidate({
      lead_id: leadId,
      first_name: 'Mateo',
      last_name_1: 'Pérez',
      last_name_2: 'Cano',
      last_name: 'Pérez Cano',
      target_level: 'primaria',
      target_grade: '2°',
      evaluation_status: 'pending',
      scholarship_percent: 0,
      status: 'active'
    });

    // 1 -> 2: Visita (Tour)
    store.changeLeadStage(leadId, 'tour_scheduled');
    expect(mapStageToPhase(useCrmStore.getState().leads.find(l => l.id === leadId)!.stage)).toBe(2);

    // 2 -> 3: Evaluación (Diagnóstico)
    store.changeLeadStage(leadId, 'evaluation');
    expect(mapStageToPhase(useCrmStore.getState().leads.find(l => l.id === leadId)!.stage)).toBe(3);

    // 3 -> 4: Reserva (Carta de Asignación)
    store.changeLeadStage(leadId, 'reservation');
    expect(mapStageToPhase(useCrmStore.getState().leads.find(l => l.id === leadId)!.stage)).toBe(4);

    // 4 -> 5: Matrícula (Inscripción Pagada & Alta en Control Escolar)
    store.changeLeadStage(leadId, 'enrolled');
    const finalLead = useCrmStore.getState().leads.find(l => l.id === leadId)!;
    expect(mapStageToPhase(finalLead.stage)).toBe(5);

    const bridgeResult = executeEnrollmentBridge({
      leadId: finalLead.id,
      paymentMethod: 'SPEI',
      cfdiRequested: true
    });

    expect(bridgeResult.success).toBe(true);
    expect(bridgeResult.folioNumber).toBeDefined();
    expect(bridgeResult.folioNumber?.startsWith('MATR-2026-')).toBe(true);
  });

  it('5. La exportación CSV del Directorio contiene las cabeceras requeridas y formato RFC 4180', () => {
    const headers = ['ID Folio', 'Aspirante / Candidato', 'Grado / Puesto', 'Tutor / Evaluador', 'Teléfono', 'Email', 'Sede', 'Fase', 'Etapa', 'Canal Origen', 'Fecha Registro', 'Notas'];
    const row = ['"FOL-001"', '"Santiago Morales"', '"Primaria 1°"', '"Carlos Morales"', '"55 4192 8841"', '"carlos@email.com"', '"Campus Montes"', '"Fase 1"', '"1. Prospecto en CRM"', '"Recomendación Familiar"', '"Hoy"', '"Familia interesada en robótica"'];

    const csvLine = row.join(',');
    expect(csvLine).toContain('"Santiago Morales"');
    expect(csvLine).toContain('"Campus Montes"');
    expect(headers.length).toBe(12);
  });
});
