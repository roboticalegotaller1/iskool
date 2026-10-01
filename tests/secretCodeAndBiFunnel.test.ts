import { describe, it, expect } from 'vitest';
import { 
  ENROLLMENT_FUNNEL_SEED, 
  HOLDING_GROWTH_UNIT_ECONOMICS,
  CAMPUS_ADMISSIONS_BREAKDOWN_SEED,
  ACQUISITION_CHANNELS_SEED,
  DETAILED_APPLICANT_LEADS_SEED 
} from '@/store/seeds/executiveBiSeeds';

describe('🧩 SECRET CODE PUZZLE - TOLERANCIA A ACENTOS Y MAYÚSCULAS', () => {
  const normalizeSecretText = (text: string): string => {
    return (text || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toUpperCase();
  };

  it('debe validar respuestas secretas sin importar acentos (e.g., FUERZA vs FUÉRZA vs fuerza)', () => {
    const secretAnswer = 'FUERZA';
    
    expect(normalizeSecretText('fuerza')).toBe(normalizeSecretText(secretAnswer));
    expect(normalizeSecretText('FUÉRZA')).toBe(normalizeSecretText(secretAnswer));
    expect(normalizeSecretText('  fúerza  ')).toBe(normalizeSecretText(secretAnswer));
    expect(normalizeSecretText('Fuerza')).toBe(normalizeSecretText(secretAnswer));
  });

  it('debe validar respuestas con acentos en la clave oficial (e.g. MÉXICO, REVOLUCIÓN)', () => {
    const answerWithAccent = 'MÉXICO';
    
    expect(normalizeSecretText('mexico')).toBe(normalizeSecretText(answerWithAccent));
    expect(normalizeSecretText('MÉXICO')).toBe(normalizeSecretText(answerWithAccent));
    expect(normalizeSecretText('México')).toBe(normalizeSecretText(answerWithAccent));
    expect(normalizeSecretText('   MEXICO   ')).toBe(normalizeSecretText(answerWithAccent));
  });

  it('debe validar respuestas complejas como SOBERANÍA, INDEPENDENCIA, CONSTITUCIÓN', () => {
    expect(normalizeSecretText('soberania')).toBe(normalizeSecretText('SOBERANÍA'));
    expect(normalizeSecretText('constitucion')).toBe(normalizeSecretText('CONSTITUCIÓN'));
    expect(normalizeSecretText('Árbol')).toBe(normalizeSecretText('arbol'));
  });

  it('debe rechazar respuestas incorrectas independientemente de los acentos', () => {
    expect(normalizeSecretText('POTENCIA')).not.toBe(normalizeSecretText('FUERZA'));
    expect(normalizeSecretText('ESPAÑA')).not.toBe(normalizeSecretText('MÉXICO'));
  });
});

describe('📊 EMBUDO DE ADMISIONES & UNIT ECONOMICS BI SEEDS', () => {
  it('debe contener las 4 etapas del embudo con porcentajes consistentes', () => {
    expect(ENROLLMENT_FUNNEL_SEED.length).toBe(4);
    const [leads, tours, evaluations, enrolled] = ENROLLMENT_FUNNEL_SEED;

    expect(leads.count).toBeGreaterThan(tours.count);
    expect(tours.count).toBeGreaterThan(evaluations.count);
    expect(evaluations.count).toBeGreaterThan(enrolled.count);
    expect(enrolled.passRate).toBe(100);
  });

  it('debe tener métricas de Unit Economics coherentes (LTV, CAC, ratio)', () => {
    const { averageCACMxn, projectedLTVMxn, ltvToCacRatio, overallConversionRatePct } = HOLDING_GROWTH_UNIT_ECONOMICS;
    
    expect(averageCACMxn).toBeGreaterThan(0);
    expect(projectedLTVMxn).toBeGreaterThan(averageCACMxn);
    expect(ltvToCacRatio).toBeGreaterThan(3.0); // Benchmark de industria mínimo 3x
    expect(overallConversionRatePct).toBeGreaterThan(20.0);
  });

  it('debe tener datos de benchmark para los 4 planteles IBIME', () => {
    expect(CAMPUS_ADMISSIONS_BREAKDOWN_SEED.length).toBe(4);
    const campuses = CAMPUS_ADMISSIONS_BREAKDOWN_SEED.map(c => c.campusId);
    expect(campuses).toContain('cmp-montes');
    expect(campuses).toContain('cmp-lagos');
    expect(campuses).toContain('cmp-sancristobal');
    expect(campuses).toContain('cmp-coacalco');

    CAMPUS_ADMISSIONS_BREAKDOWN_SEED.forEach(campus => {
      expect(campus.registeredLeads).toBeGreaterThan(0);
      expect(campus.enrolledStudents).toBeGreaterThan(0);
      expect(campus.fulfillmentPct).toBeGreaterThan(50);
      expect(campus.revenueGeneratedMxn).toBeGreaterThan(0);
    });
  });

  it('debe tener canales de adquisición con cálculo de ROAS', () => {
    expect(ACQUISITION_CHANNELS_SEED.length).toBeGreaterThanOrEqual(4);
    ACQUISITION_CHANNELS_SEED.forEach(ch => {
      expect(ch.cacMxn).toBeGreaterThan(0);
      expect(ch.roasRatio).toBeGreaterThan(10);
      expect(ch.conversionRatePct).toBeGreaterThan(0);
    });
  });

  it('debe tener expedientes detallados de aspirantes para el directorio en vivo', () => {
    expect(DETAILED_APPLICANT_LEADS_SEED.length).toBeGreaterThanOrEqual(10);
    DETAILED_APPLICANT_LEADS_SEED.forEach(lead => {
      expect(lead.id).toBeDefined();
      expect(lead.studentName.length).toBeGreaterThan(3);
      expect(lead.tutorName.length).toBeGreaterThan(3);
      expect(lead.tutorPhone).toBeDefined();
      expect(lead.campusName).toBeDefined();
      expect(['leads', 'tours', 'evaluations', 'enrolled']).toContain(lead.stage);
      expect(lead.conversionProbabilityPct).toBeGreaterThanOrEqual(0);
      expect(lead.conversionProbabilityPct).toBeLessThanOrEqual(100);
    });
  });
});
