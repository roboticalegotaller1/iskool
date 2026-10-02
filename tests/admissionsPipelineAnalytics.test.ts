/**
 * @file admissionsPipelineAnalytics.test.ts
 * @description Suite de Pruebas Unitarias e Integración para la Lógica de Negocio,
 * Conectividad Analítica en Vivo y Puente hacia Control Escolar del CRM Unificado (Fase 3).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useCrmStore } from '../src/store/useCrmStore';
import { useSchoolAdminStore } from '../src/store/useSchoolAdminStore';
import { 
  computeAdmissionsPipelineMetrics,
  executeEnrollmentBridge,
  IBIME_CAMPUS_CAPACITY_TARGETS,
  normalizeCampusKey
} from '../src/services/admissionsPipelineService';
import { executeAnalyticQuery } from '../src/services/executiveAnalyticsEngine';
import { 
  createAdmissionsLeadAction, 
  updateLeadStageAction, 
  getConsolidatedPipelineAnalyticsAction 
} from '../src/app/actions/admissionsActions';
import { CRM_LEADS_SEED, CRM_CANDIDATES_SEED } from '../src/store/seeds/crmSeeds';

describe('FASE 3: Lógica de Negocio y Conectividad con el Motor Analítico del CEO', () => {

  beforeEach(() => {
    // Reset stores to seed state
    useCrmStore.setState({
      leads: [...CRM_LEADS_SEED],
      candidates: [...CRM_CANDIDATES_SEED]
    });
  });

  describe('1. Computación de Métricas Agregadas y Consolidado (4 Sedes)', () => {
    it('calculates consolidated metrics with 3,900 physical seats and 3,740 target seats', () => {
      const { leads, candidates } = useCrmStore.getState();
      const report = computeAdmissionsPipelineMetrics(leads, candidates, 'all', '2026-2027');

      expect(report.campusId).toBe('all');
      expect(report.campusName).toContain('Consolidado IBIME');
      expect(report.capacity.totalPhysicalSeats).toBe(3900);
      expect(report.capacity.targetSeats).toBe(3740);
      expect(report.capacity.baseEnrolledSeats).toBe(3620);

      // Verify 5 phases are present and correctly structured
      expect(report.phases).toHaveLength(5);
      expect(report.phases[0].phaseCode).toBe('P1_LEAD');
      expect(report.phases[1].phaseCode).toBe('P2_TOUR');
      expect(report.phases[2].phaseCode).toBe('P3_EVAL');
      expect(report.phases[3].phaseCode).toBe('P4_ASSIGN');
      expect(report.phases[4].phaseCode).toBe('P5_ENROLLED');

      // Financial projections
      expect(report.financial.projectedPipelineValueMXN).toBeGreaterThan(0);
      expect(report.speed.avgDaysToEnroll).toBe(9.5);
    });

    it('filters accurately for individual campuses (Montes, Lagos, San Cristóbal, Coacalco)', () => {
      const { leads, candidates } = useCrmStore.getState();

      const montesReport = computeAdmissionsPipelineMetrics(leads, candidates, 'montes', '2026-2027');
      expect(montesReport.capacity.totalPhysicalSeats).toBe(1100);
      expect(montesReport.capacity.targetSeats).toBe(1060);
      expect(montesReport.campusName).toBe('Campus Montes');

      const lagosReport = computeAdmissionsPipelineMetrics(leads, candidates, 'lagos', '2026-2027');
      expect(lagosReport.capacity.totalPhysicalSeats).toBe(950);
      expect(lagosReport.capacity.targetSeats).toBe(920);

      const coacalcoReport = computeAdmissionsPipelineMetrics(leads, candidates, 'coacalco', '2026-2027');
      expect(coacalcoReport.capacity.totalPhysicalSeats).toBe(900);
      expect(coacalcoReport.capacity.targetSeats).toBe(850);
    });
  });

  describe('2. Reactividad en Tiempo Real ante Mutaciones de Fase', () => {
    it('recalculates occupancy and conversion rate when a lead is advanced to Phase 5', () => {
      const { leads, candidates } = useCrmStore.getState();
      const initialReport = computeAdmissionsPipelineMetrics(leads, candidates, 'all');
      const initialEnrolledCount = initialReport.capacity.newlyEnrolledFromCrm;

      // Find an active lead in Phase 1 or 2
      const candidateToEnroll = candidates.find(c => c.status === 'active');
      expect(candidateToEnroll).toBeDefined();

      if (candidateToEnroll) {
        // Execute the bridge to enroll
        const bridgeResult = executeEnrollmentBridge({
          leadId: candidateToEnroll.lead_id,
          candidateId: candidateToEnroll.id,
          paymentMethod: 'SPEI'
        });

        expect(bridgeResult.success).toBe(true);

        // Fetch updated state and recompute
        const updatedLeads = useCrmStore.getState().leads;
        const updatedCandidates = useCrmStore.getState().candidates;
        const updatedReport = computeAdmissionsPipelineMetrics(updatedLeads, updatedCandidates, 'all');

        expect(updatedReport.capacity.newlyEnrolledFromCrm).toBe(initialEnrolledCount + 1);
        expect(updatedReport.capacity.currentOccupiedSeats).toBe(initialReport.capacity.currentOccupiedSeats + 1);
        expect(updatedReport.phases[4].candidateCount).toBe(initialReport.phases[4].candidateCount + 1);
      }
    });
  });

  describe('3. Conexión con el Motor Analítico del CEO (executiveAnalyticsEngine)', () => {
    it('routes natural language admissions inquiries to ADMISSIONS_PIPELINE domain at 0 tokens', () => {
      const query = '¿Cómo va el embudo de admisiones y la ocupación de matrícula?';
      const mockSources = {
        schoolId: 'sch-ibime',
        isSuperUser: true,
        institutionsList: [],
        detailedStudents: [],
        campusesList: [],
        groupsList: [],
        attendanceList: [],
        billingRecords: [],
        teachersList: [],
        staffPayroll: []
      };
      const result = executeAnalyticQuery(query, mockSources);

      expect(result.domain).toBe('ADMISSIONS_PIPELINE');
      expect(result.tokenCost).toBe(0);
      expect(result.reportTitle).toContain('Admisiones');
      expect(result.directAnswer).toContain('3,740');
      expect(result.directAnswer).toContain('3,900');
      expect(result.kpis.length).toBeGreaterThanOrEqual(4);
      expect(result.chart).toBeDefined();
      expect(result.table.rows.length).toBe(5); // 5 departmental phases
    });

    it('accurately identifies campus-specific queries in the AI engine', () => {
      const query = 'Embudo de admisiones y meta de asientos en Campus Montes';
      const mockSources = {
        schoolId: 'sch-ibime',
        isSuperUser: false,
        institutionsList: [],
        detailedStudents: [],
        campusesList: [],
        groupsList: [],
        attendanceList: [],
        billingRecords: [],
        teachersList: [],
        staffPayroll: []
      };
      const result = executeAnalyticQuery(query, mockSources);

      expect(result.domain).toBe('ADMISSIONS_PIPELINE');
      expect(result.schoolName).toBe('Campus Montes');
      expect(result.directAnswer).toContain('Campus Montes');
    });
  });

  describe('4. Server Actions y Validación de Entrada', () => {
    it('validates mandatory SEP surname fields in createAdmissionsLeadAction', async () => {
      const invalidRes = await createAdmissionsLeadAction({
        school_id: 'sch-ibime',
        campus_id: 'montes',
        tutor_first_name: '',
        tutor_last_name_1: ''
      });

      expect(invalidRes.success).toBe(false);
      expect(invalidRes.error).toContain('Norma SEP');

      const validRes = await createAdmissionsLeadAction({
        school_id: 'sch-ibime',
        campus_id: 'montes',
        tutor_first_name: 'Roberto',
        tutor_last_name_1: 'Cisneros',
        tutor_last_name_2: 'Paredes',
        candidate_first_name: 'Camila',
        target_level: 'primaria',
        target_grade: '1°'
      });

      expect(validRes.success).toBe(true);
      expect(validRes.data?.leadId).toBeDefined();
      expect(validRes.data?.candidateId).toBeDefined();
    });

    it('updates lead stage safely via updateLeadStageAction', async () => {
      const res = await updateLeadStageAction('lead-test-123', 'tour_scheduled');
      expect(res.success).toBe(true);
      expect(res.data?.stage).toBe('tour_scheduled');
    });

    it('returns target capacity details in getConsolidatedPipelineAnalyticsAction', async () => {
      const res = await getConsolidatedPipelineAnalyticsAction('all', '2026-2027');
      expect(res.success).toBe(true);
      expect(res.data?.targetCapacity.targetSeats).toBe(3740);
      expect(res.data?.targetCapacity.totalCapacity).toBe(3900);
    });
  });
});
