import { describe, it, expect } from 'vitest';
import { useCrmStore } from '../src/store/useCrmStore';
import {
  normalizeCampusKey,
  executeEnrollmentBridge,
  mapStageToPhase
} from '../src/services/admissionsPipelineService';

describe('CEO EMPRESAS: Pipeline Quirúrgico de Reclutamiento, Onboarding & Headhunting B2B', () => {
  it('1. Carga íntegra y rigor técnico de Seeds Corporativos para los 3 Holdings Empresariales', () => {
    const store = useCrmStore.getState();
    const allLeads = store.leads;
    const allCandidates = store.candidates;

    // A. BMW Group México (emp-bmw)
    const bmwLeads = allLeads.filter(l => l.school_id === 'emp-bmw');
    expect(bmwLeads.length).toBeGreaterThanOrEqual(8);
    expect(bmwLeads.every(l => l.pipeline_type === 'corporate_recruitment')).toBe(true);

    const bmwCandidates = allCandidates.filter(c => bmwLeads.some(l => l.id === c.lead_id));
    expect(bmwCandidates.length).toBeGreaterThanOrEqual(8);
    expect(bmwCandidates.some(c => c.position_title?.includes('Robótica'))).toBe(true);
    expect(bmwCandidates.some(c => c.position_title?.includes('Baterías') || c.position_title?.includes('Tren Motriz'))).toBe(true);

    // Verificar campos corporativos de BMW
    const sampleBmwLead = bmwLeads.find(l => l.proposed_salary !== undefined);
    expect(sampleBmwLead).toBeDefined();
    expect(sampleBmwLead?.proposed_salary).toContain('MXN');
    expect(sampleBmwLead?.recruiter_name).toBeDefined();

    // B. Grupo Comercial Vanguardia Retail (emp-ventas)
    const retailLeads = allLeads.filter(l => l.school_id === 'emp-ventas');
    expect(retailLeads.length).toBeGreaterThanOrEqual(6);
    expect(retailLeads.every(l => l.pipeline_type === 'corporate_recruitment')).toBe(true);

    const retailCandidates = allCandidates.filter(c => retailLeads.some(l => l.id === c.lead_id));
    expect(retailCandidates.length).toBeGreaterThanOrEqual(6);
    expect(retailCandidates.some(c => c.position_title?.includes('Omnicanal') || c.position_title?.includes('Retail'))).toBe(true);

    // C. Innovasoft Dynamics Cloud & AI (emp-tech)
    const techLeads = allLeads.filter(l => l.school_id === 'emp-tech');
    expect(techLeads.length).toBeGreaterThanOrEqual(5);
    expect(techLeads.every(l => l.pipeline_type === 'corporate_recruitment')).toBe(true);

    const techCandidates = allCandidates.filter(c => techLeads.some(l => l.id === c.lead_id));
    expect(techCandidates.length).toBeGreaterThanOrEqual(5);
    expect(techCandidates.some(c => c.position_title?.includes('AI Architect') || c.position_title?.includes('Cloud') || c.position_title?.includes('Backend'))).toBe(true);
  });

  it('2. Aislamiento Multi-Tenant y Filtrado Reactivo Multisede por Planta Industrial / HUB', () => {
    const store = useCrmStore.getState();
    const allLeads = store.leads;

    // Plantas BMW: San Luis Potosí y Santa Fe CDMX
    const slpLeads = allLeads.filter(
      l => l.school_id === 'emp-bmw' && normalizeCampusKey(l.campus_id) === 'bmw-slp'
    );
    const cdmxBmwLeads = allLeads.filter(
      l => l.school_id === 'emp-bmw' && normalizeCampusKey(l.campus_id) === 'bmw-cdmx'
    );

    expect(slpLeads.length).toBeGreaterThanOrEqual(4);
    expect(cdmxBmwLeads.length).toBeGreaterThanOrEqual(2);

    // Aislamiento: Ningún lead de BMW debe perturbar las consultas de IBIME
    const ibimeLeads = allLeads.filter(l => l.school_id === 'sch-ibime');
    expect(ibimeLeads.every(l => !l.school_id?.startsWith('emp-'))).toBe(true);
    expect(ibimeLeads.every(l => l.pipeline_type !== 'corporate_recruitment')).toBe(true);

    // Centros Vanguardia Retail
    const mtyRetailLeads = allLeads.filter(
      l => l.school_id === 'emp-ventas' && normalizeCampusKey(l.campus_id) === 'ventas-mty'
    );
    const gdlRetailLeads = allLeads.filter(
      l => l.school_id === 'emp-ventas' && normalizeCampusKey(l.campus_id) === 'ventas-gdl'
    );
    expect(mtyRetailLeads.length).toBeGreaterThanOrEqual(2);
    expect(gdlRetailLeads.length).toBeGreaterThanOrEqual(2);

    // Tech Hubs Innovasoft
    const gdlTechLeads = allLeads.filter(
      l => l.school_id === 'emp-tech' && normalizeCampusKey(l.campus_id) === 'tech-gdl'
    );
    expect(gdlTechLeads.length).toBeGreaterThanOrEqual(2);
  });

  it('3. Alta patronal y contrato formalizado vía Puente Quirúrgico (CONTR-2026-XXXX)', () => {
    const store = useCrmStore.getState();

    // Crear un candidato de Reclutamiento para BMW
    const leadId = store.createLead({
      school_id: 'emp-bmw',
      campus_id: 'cmp-bmw-slp',
      campus_name: 'Planta San Luis Potosí (SLP)',
      pipeline_type: 'corporate_recruitment',
      stage: 'registered',
      tutor_first_name: 'Ing. Rodrigo',
      tutor_last_name_1: 'Valenzuela',
      tutor_last_name_2: 'Soto',
      tutor_last_name: 'Valenzuela Soto',
      tutor_email: 'rodrigo.valenzuela@bmw-talent.mx',
      tutor_phone: '444-123-9988',
      source_channel: 'headhunting',
      priority: 'hot',
      target_academic_year: '2026',
      proposed_salary: '$92,000 MXN / mes',
      department: 'Ingeniería de Automatización',
      recruiter_name: 'Lic. Mónica Arrieta',
      recruiter_title: 'Lead Talent Acquisition'
    });

    const candidateId = store.addCandidate({
      lead_id: leadId,
      first_name: 'Rodrigo',
      last_name_1: 'Valenzuela',
      last_name_2: 'Soto',
      last_name: 'Valenzuela Soto',
      target_level: 'corporativo',
      position_title: 'Senior PLC & SCADA Specialist',
      proposed_salary: '$92,000 MXN / mes',
      technical_score: 96,
      certifications: ['Siemens TIA Portal Expert', 'KUKA Certified Robot Specialist'],
      status: 'active'
    });

    // 1 -> 2: Atracción -> Entrevista Inicial
    store.changeLeadStage(leadId, 'tour_scheduled');
    expect(mapStageToPhase(useCrmStore.getState().leads.find(l => l.id === leadId)!.stage)).toBe(2);

    // 2 -> 3: Entrevista -> Pruebas Técnicas
    store.changeLeadStage(leadId, 'evaluation');
    expect(mapStageToPhase(useCrmStore.getState().leads.find(l => l.id === leadId)!.stage)).toBe(3);

    // 3 -> 4: Pruebas -> Propuesta Económica
    store.changeLeadStage(leadId, 'reservation');
    expect(mapStageToPhase(useCrmStore.getState().leads.find(l => l.id === leadId)!.stage)).toBe(4);

    // 4 -> 5: Propuesta -> Contratado & Alta IMSS
    store.changeLeadStage(leadId, 'enrolled');
    const finalLead = useCrmStore.getState().leads.find(l => l.id === leadId)!;
    expect(mapStageToPhase(finalLead.stage)).toBe(5);

    // Ejecutar Puente de Conversión Corporativo
    const bridgeResult = executeEnrollmentBridge({
      leadId: finalLead.id,
      candidateId: candidateId,
      notes: 'Oferta económica aceptada. Alta IMSS procesada ante ventanilla patronal.'
    });

    expect(bridgeResult.success).toBe(true);
    expect(bridgeResult.folioNumber).toBeDefined();
    // Debe generar folio corporativo CONTR-2026-XXXX en vez de matrícula escolar
    expect(bridgeResult.folioNumber?.startsWith('CONTR-2026-')).toBe(true);

    // Verificar actividad de auditoría corporativa registrada
    const activities = useCrmStore.getState().activities.filter(a => a.lead_id === leadId);
    expect(activities.some(a => a.title.includes('Alta Patronal IMSS'))).toBe(true);

    // Verificar que el candidato fue actualizado a 'enrolled'
    const updatedCandidate = useCrmStore.getState().candidates.find(c => c.id === candidateId);
    expect(updatedCandidate?.status).toBe('enrolled');
  });

  it('4. Preservación estricta de no regresión del Pipeline Educativo Escolar (IBIME)', () => {
    const store = useCrmStore.getState();

    // Crear un prospecto educativo estándar
    const eduLeadId = store.createLead({
      school_id: 'sch-ibime',
      campus_id: 'lagos',
      campus_name: 'Campus Lagos de Guadalupe',
      pipeline_type: 'new_enrollment',
      stage: 'reservation',
      tutor_first_name: 'Patricia',
      tutor_last_name: 'López Domínguez',
      tutor_phone: '55-3344-5566',
      tutor_email: 'patricia@ibime-family.mx',
      source_channel: 'referral',
      priority: 'hot',
      target_academic_year: '2026-2027'
    });

    const eduCandId = store.addCandidate({
      lead_id: eduLeadId,
      first_name: 'Sofía',
      last_name_1: 'López',
      last_name_2: 'Domínguez',
      last_name: 'López Domínguez',
      target_level: 'secundaria',
      target_grade: '1°',
      status: 'active'
    });

    // Ejecutar puente para prospecto educativo
    const eduBridgeResult = executeEnrollmentBridge({
      leadId: eduLeadId,
      candidateId: eduCandId,
      paymentMethod: 'SPEI'
    });

    expect(eduBridgeResult.success).toBe(true);
    // Para escuelas debe seguir generando folio MATR-2026-XXXX
    expect(eduBridgeResult.folioNumber?.startsWith('MATR-2026-')).toBe(true);

    const eduActivities = useCrmStore.getState().activities.filter(a => a.lead_id === eduLeadId);
    expect(eduActivities.some(a => a.title.includes('Inscripción Formalizada'))).toBe(true);
  });
});
