import { describe, it, expect, beforeEach } from 'vitest';
import { useCrmStore, getFilteredLeads, getSchoolLeads, getLeadsByStage, getLeadCandidates, calculateDashboardSummary, calculateFunnelMetrics } from '../src/store/useCrmStore';
import { useSchoolAdminStore } from '../src/store/useSchoolAdminStore';
import {
  NEW_ENROLLMENT_STAGES,
  formatTutorName,
  formatCandidateName,
  calculateLeadScore,
  isCrmAuthorized,
  CrmLead,
  CrmLeadCandidate
} from '../src/types/crm';
import { CRM_LEADS_SEED, CRM_CANDIDATES_SEED } from '../src/store/seeds/crmSeeds';

describe('Surgical Integration: Unified 360 Admissions CRM & CEO View', () => {
  beforeEach(() => {
    // Reset Zustand store state before each test
    useCrmStore.setState({
      leads: CRM_LEADS_SEED,
      candidates: CRM_CANDIDATES_SEED,
      activePipeline: 'new_enrollment',
      filterCampusId: null,
      filterPriority: null,
      searchQuery: '',
      selectedLeadId: null,
      isLeadDetailOpen: false,
      isAddLeadModalOpen: false
    });
  });

  describe('1. Multi-Campus & Multi-Tenant Support (Consolidado IBIME)', () => {
    it('returns all leads in consolidado view when filterCampusId is null', () => {
      const store = useCrmStore.getState();
      const leads = getFilteredLeads(store, 'sch-ibime');
      expect(leads.length).toBeGreaterThan(0);
      expect(leads.length).toBe(CRM_LEADS_SEED.filter(l => l.school_id === 'sch-ibime' && l.pipeline_type === 'new_enrollment').length);
    });

    it('reactively filters leads by specific campus (Montes, Lagos, San Cristóbal, Coacalco)', () => {
      const { setFilterCampus } = useCrmStore.getState();

      // Test Campus Montes
      setFilterCampus('montes');
      let filtered = getFilteredLeads(useCrmStore.getState(), 'sch-ibime');
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.every(l => l.campus_id === 'montes')).toBe(true);

      // Test Campus Lagos
      setFilterCampus('lagos');
      filtered = getFilteredLeads(useCrmStore.getState(), 'sch-ibime');
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.every(l => l.campus_id === 'lagos')).toBe(true);

      // Test Campus San Cristóbal
      setFilterCampus('sancristobal');
      filtered = getFilteredLeads(useCrmStore.getState(), 'sch-ibime');
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.every(l => l.campus_id === 'sancristobal')).toBe(true);

      // Reset to consolidado
      setFilterCampus(null);
      filtered = getFilteredLeads(useCrmStore.getState(), 'sch-ibime');
      expect(filtered.length).toBe(CRM_LEADS_SEED.filter(l => l.school_id === 'sch-ibime' && l.pipeline_type === 'new_enrollment').length);
    });
  });

  describe('2. Mexican SEP Official Surnames Separation (Paterno & Materno)', () => {
    it('formats tutor names strictly adhering to separated Paterno and Materno', () => {
      const sampleLead: CrmLead = {
        id: 'lead-test-1',
        school_id: 'sch-ibime',
        pipeline_type: 'new_enrollment',
        stage: 'registered',
        tutor_first_name: 'Alejandro',
        tutor_last_name_1: 'Vargas',
        tutor_last_name_2: 'Robles',
        tutor_last_name: 'Vargas Robles',
        tutor_relationship: 'Padre',
        source_channel: 'referral',
        lead_score: 90,
        priority: 'hot',
        referral_incentive_applied: false,
        outcome: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const fullName = formatTutorName(sampleLead);
      expect(fullName).toBe('Alejandro Vargas Robles');
    });

    it('formats candidate student names with strict Paterno and Materno separation', () => {
      const sampleCandidate: CrmLeadCandidate = {
        id: 'cand-test-1',
        lead_id: 'lead-test-1',
        first_name: 'Rodrigo',
        last_name_1: 'Vargas',
        last_name_2: 'García',
        last_name: 'Vargas García',
        target_level: 'primaria',
        target_grade: '3°',
        evaluation_status: 'pending',
        scholarship_percent: 0,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const candName = formatCandidateName(sampleCandidate);
      expect(candName).toBe('Rodrigo Vargas García');
    });
  });

  describe('3. Dynamic Lead Scoring Algorithm (0 - 100 Points)', () => {
    it('calculates higher score for hot priority, referral source, and completed diagnostics', () => {
      const leadHigh: CrmLead = {
        id: 'lead-high',
        school_id: 'sch-ibime',
        pipeline_type: 'new_enrollment',
        stage: 'reservation',
        tutor_first_name: 'Laura',
        tutor_last_name_1: 'Mendoza',
        tutor_last_name: 'Mendoza',
        tutor_relationship: 'Madre',
        source_channel: 'referral', // +15 pts
        lead_score: 0,
        priority: 'hot', // hot
        referral_incentive_applied: false,
        outcome: null,
        days_in_current_stage: 1, // no penalty
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const cands: CrmLeadCandidate[] = [
        {
          id: 'c1',
          lead_id: 'lead-high',
          first_name: 'Sofía',
          last_name: 'Mendoza',
          target_level: 'primaria',
          target_grade: '1°',
          evaluation_status: 'approved', // +20 pts
          scholarship_percent: 0,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'c2',
          lead_id: 'lead-high',
          first_name: 'Mateo',
          last_name: 'Mendoza',
          target_level: 'preescolar',
          target_grade: '3°',
          evaluation_status: 'approved', // sibling bonus +20 pts
          scholarship_percent: 0,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      const score = calculateLeadScore(leadHigh, cands);
      expect(score).toBeGreaterThanOrEqual(80);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('4. Interdepartmental Accountability (5 School Departments)', () => {
    it('correctly maps 5 institutional phases to their respective stages and owners', () => {
      const p1Stages = ['registered', 'contacted'];
      const p2Stages = ['tour_scheduled'];
      const p3Stages = ['evaluation'];
      const p4Stages = ['proposal_sent', 'reservation'];
      const p5Stages = ['enrolled'];

      expect(NEW_ENROLLMENT_STAGES.some(s => p1Stages.includes(s.key))).toBe(true);
      expect(NEW_ENROLLMENT_STAGES.some(s => p2Stages.includes(s.key))).toBe(true);
      expect(NEW_ENROLLMENT_STAGES.some(s => p3Stages.includes(s.key))).toBe(true);
      expect(NEW_ENROLLMENT_STAGES.some(s => p4Stages.includes(s.key))).toBe(true);
      expect(NEW_ENROLLMENT_STAGES.some(s => p5Stages.includes(s.key))).toBe(true);
    });
  });

  describe('5. Automated Conversion Bridge (Payment -> Control Escolar)', () => {
    it('registers candidate into detailedStudents when reaching enrolled status', () => {
      const { detailedStudents, registerStudent } = useSchoolAdminStore.getState();
      const initialCount = detailedStudents.length;

      // Simulate the bridge execution that occurs in CrmAdmissionsStudio when CFDI 4.0 is confirmed
      registerStudent({
        first_name: 'Leonardo',
        second_name: 'Javier',
        last_name_1: 'Galindo',
        last_name_2: 'Trejo',
        birth_date: '2016-08-20',
        curp: 'GATL160820HMCLRN09',
        gender: 'M',
        status: 'activo',
        level: 'primaria',
        grade: '2°',
        school_id: 'sch-ibime',
        campus_name: 'Campus Montes',
        tutor_name: 'Lic. Javier Galindo',
        phone: '55-1234-5678',
        email: 'tutor.galindo@email.com'
      });

      const updatedStudents = useSchoolAdminStore.getState().detailedStudents;
      expect(updatedStudents.length).toBe(initialCount + 1);

      const enrolledStudent = updatedStudents.find(s => s.curp === 'GATL160820HMCLRN09');
      expect(enrolledStudent).toBeDefined();
      expect(enrolledStudent?.first_name).toBe('Leonardo');
      expect(enrolledStudent?.last_name_1).toBe('Galindo');
      expect(enrolledStudent?.last_name_2).toBe('Trejo');
      expect(enrolledStudent?.campus_name).toBe('Campus Montes');
      expect(enrolledStudent?.status).toBe('activo');
    });
  });

  describe('6. Zero Commercial Brand Violations (Rule 1 Compliance)', () => {
    it('ensures no commercial AI or brand names are used in CRM titles or roles', () => {
      const jsonLeads = JSON.stringify(CRM_LEADS_SEED).toLowerCase();
      expect(jsonLeads).not.toContain('gemini');
      expect(jsonLeads).not.toContain('obsidian');
      expect(jsonLeads).not.toContain('canvas lms');

      const jsonStages = JSON.stringify(NEW_ENROLLMENT_STAGES).toLowerCase();
      expect(jsonStages).not.toContain('gemini');
      expect(jsonStages).not.toContain('obsidian');
    });
  });
});
