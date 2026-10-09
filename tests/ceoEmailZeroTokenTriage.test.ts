import { describe, it, expect, beforeEach } from 'vitest';
import { 
  HermeticEmailBrainService,
  classifyZeroTokenEmail,
  LearnedTriageMemoryService
} from '@/lib/services/hermetic-email-brain.service';

describe('🎯 TRIAGE ZERO-TOKENS (4 CUADRANTES CANÓNICOS & APRENDIZAJE ADAPTATIVO)', () => {
  const tenantId = 'e1000000-0000-0000-0000-000000000001';

  beforeEach(() => {
    // Limpiar reglas aprendidas antes de cada prueba
    LearnedTriageMemoryService.inMemoryRules.delete(tenantId);
  });

  describe('1. Resolución Quirúrgica de Error Fatal (Gamma y Promociones Comerciales)', () => {
    it('debe clasificar "Ya llegó el nuevo Gamma" como SPAM_DESCARTADO (🟣 SPAM / PROMOCIÓN, 0 Tokens)', () => {
      const result = classifyZeroTokenEmail(
        'Ya llegó el nuevo Gamma',
        'Gamma 5: nuestra mayor actualización hasta ahora. Crea presentaciones con IA en segundos.',
        'hello@gamma.app',
        'Gamma',
        undefined,
        tenantId
      );

      expect(result.quadrant).toBe('SPAM_DESCARTADO');
      expect(result.badge.label).toBe('🟣 SPAM / PROMOCIÓN');
      expect(result.gmailCategory).toBe('promociones');
      expect(result.urgency).toBe('BAJA');
    });

    it('debe clasificar reclamo de compra de Base de King Cama como SPAM_DESCARTADO', () => {
      const result = classifyZeroTokenEmail(
        'Te respondieron sobre el reclamo de Base De King Cama Matrimonial Cama Tamaño De Metal 190cm Negro',
        'El vendedor te respondió sobre el reclamo CHICV TECHNOLOGY SA DE CV: Estimado cliente...',
        'carlos.duran.1418@gmail.com',
        'Carlos Durán',
        undefined,
        tenantId
      );

      expect(result.quadrant).toBe('SPAM_DESCARTADO');
      expect(result.badge.label).toBe('🟣 SPAM / PROMOCIÓN');
      expect(result.gmailCategory).toBe('promociones');
    });

    it('debe clasificar boletines de Inversión Financiera / Wall Street como SPAM_DESCARTADO', () => {
      const result = classifyZeroTokenEmail(
        'Inversión financiera',
        'TOP STORY 📰 Financial Stocks Have Their Worst Month vs the Market in Over 30 Years',
        'carlos.duran.1418@gmail.com',
        'Carlos Durán',
        undefined,
        tenantId
      );

      expect(result.quadrant).toBe('SPAM_DESCARTADO');
      expect(result.badge.label).toBe('🟣 SPAM / PROMOCIÓN');
      expect(result.gmailCategory).toBe('promociones');
    });

    it('debe clasificar ventas en frío de rediseño web (Carlos Durán) como SPAM_DESCARTADO', () => {
      const result = classifyZeroTokenEmail(
        'Diseño ...',
        'Estimado Israel, ¿Sabía que una página web desactualizada puede hacerle perder hasta un 70% de clientes?',
        'carlos.duran.1418@gmail.com',
        'Carlos Durán',
        undefined,
        tenantId
      );

      expect(result.quadrant).toBe('SPAM_DESCARTADO');
      expect(result.badge.label).toBe('🟣 SPAM / PROMOCIÓN');
      expect(result.gmailCategory).toBe('promociones');
    });

    it('debe clasificar recompensas (Prime Opinion, Google Play, Club Cinépolis, ASM Careers) como SPAM_DESCARTADO', () => {
      const prime = classifyZeroTokenEmail('Obtén ingreso...', 'Prime Opinion Saldo 124 Puntos', 'surveys@primeopinion.com', 'Prime Opinion');
      expect(prime.quadrant).toBe('SPAM_DESCARTADO');

      const cinepolis = classifyZeroTokenEmail('Seleccioné las p...', 'Arma la salida al cine en Club Cinépolis', 'info@cinepolis.com', 'Club Cinépolis');
      expect(cinepolis.quadrant).toBe('SPAM_DESCARTADO');

      const play = classifyZeroTokenEmail('Tus Puntos de Play te esperan...', 'Instala Google Play Games', 'googleplay@google.com', 'Google Play');
      expect(play.quadrant).toBe('SPAM_DESCARTADO');

      const asm = classifyZeroTokenEmail('ASM Career Connections', 'Apply for Open Jobs. View this email in your browser.', 'jobs@asm.org', 'ASM Careers');
      expect(asm.quadrant).toBe('SPAM_DESCARTADO');
    });
  });

  describe('2. División INFORMATIVO (🔵 0 Tokens)', () => {
    it('debe clasificar confirmaciones de registro y webinars de Zoom (#FestivalCiberLatam2026) como INFORMATIVO', () => {
      const r1 = classifyZeroTokenEmail(
        'Fabricar al candidato #FestivalCiberLatam2026 Confirmation',
        'Hi israel lopez, Thank you for registering for Fabricar al candidato #FestivalCiberLatam2026. You can find information about this webinar below.',
        'no-reply@zoom.us',
        'Zoom'
      );
      expect(r1.quadrant).toBe('INFORMATIVO');
      expect(r1.badge.label).toBe('🔵 INFORMATIVO');
      expect(r1.gmailCategory).toBe('actualizaciones');

      const r2 = classifyZeroTokenEmail(
        'Legislar lo que no entiendes #FestivalCiberLatam2026 Confirmation',
        'Hi israel lopez, Thank you for registering for Legislar lo que no entiendes. Please submit questions to...',
        'no-reply@zoom.us',
        'Zoom'
      );
      expect(r2.quadrant).toBe('INFORMATIVO');
    });

    it('debe clasificar webinars académicos (JMBE Live!) como INFORMATIVO', () => {
      const result = classifyZeroTokenEmail(
        'You Won\'t Want To Miss These Three JMBE Live! Webinars for Biology Educators',
        'Join JMBE authors and editors for three free discussions on teaching, learning and student success.',
        'journals@asm.org',
        'ASM Journals'
      );
      expect(result.quadrant).toBe('INFORMATIVO');
      expect(result.badge.label).toBe('🔵 INFORMATIVO');
    });

    it('debe clasificar avisos de servicio social universitario concluidos (UNAM Acatlán) como INFORMATIVO', () => {
      const result = classifyZeroTokenEmail(
        'Validació... CONSTANCIA DE LIBERACION DE SERVICIO SOCIAL',
        'Estimado(a) LOPEZ ANGELES ISRAEL: Te confirmamos que has concluido con los trámites necesarios...',
        'tramites.ss@acatlan.unam.mx',
        'Trámites SS'
      );
      expect(result.quadrant).toBe('INFORMATIVO');
      expect(result.badge.label).toBe('🔵 INFORMATIVO');
    });

    it('debe clasificar avisos de términos de plataformas externas (Dropbox) como INFORMATIVO', () => {
      const result = classifyZeroTokenEmail(
        'Actualización a las condiciones de servicio de Dropbox',
        'Hola, Israel: Siempre estamos buscando maneras de mejorar la experiencia de Dropbox...',
        'no-reply@dropbox.com',
        'Dropbox'
      );
      expect(result.quadrant).toBe('INFORMATIVO');
      expect(result.badge.label).toBe('🔵 INFORMATIVO');
    });
  });

  describe('3. División ATENCIÓN INMEDIATA CEO (🔴 0 Tokens)', () => {
    it('debe clasificar convocatorias oficiales urgentes de CTE como ATENCION_CEO', () => {
      const result = classifyZeroTokenEmail(
        'CTE urgente',
        'Se notifica que tendrá cte urgente mañana a las 3 pm ,confirme asistencia.',
        'israell35mac@gmail.com',
        'Israel Lopez'
      );
      expect(result.quadrant).toBe('ATENCION_CEO');
      expect(result.badge.label).toBe('🔴 ATENCIÓN INMEDIATA CEO');
      expect(result.urgency).toBe('CRITICA');
      expect(result.gmailCategory).toBe('principal');
    });

    it('debe clasificar oficios de Supervisión de Zona SEP como ATENCION_CEO', () => {
      const result = classifyZeroTokenEmail(
        'Recepción de Oficio de Supervisión Escolar Zona 14',
        'Se solicita entrega de carpetas de evaluación para revisión de la inspección SEP.',
        'supervision.zona14@edomex.gob.mx',
        'Supervisión Escolar'
      );
      expect(result.quadrant).toBe('ATENCION_CEO');
      expect(result.badge.label).toBe('🔴 ATENCIÓN INMEDIATA CEO');
    });

    it('debe clasificar incidencias de alumno herido como ATENCION_CEO', () => {
      const result = classifyZeroTokenEmail(
        'Urgente: Alumno herido en cancha',
        'Reporte de alumno herido tras caída en la cancha escolar.',
        'prefectura@colegio.edu.mx',
        'Prefectura'
      );
      expect(result.quadrant).toBe('ATENCION_CEO');
      expect(result.badge.label).toBe('🔴 ATENCIÓN INMEDIATA CEO');
      expect(result.urgency).toBe('CRITICA');
    });
  });

  describe('4. Aprendizaje Adaptativo Local (0 Tokens Cost)', () => {
    it('debe permitir enseñar al sistema que un remitente o dominio es Spam y recordarlo sin tokens', () => {
      // Registrar aprendizaje: el dominio 'despacho-rediseño.com' es SPAM
      LearnedTriageMemoryService.learnPattern(tenantId, {
        patternType: 'domain',
        patternValue: 'despacho-rediseño.com',
        targetQuadrant: 'SPAM_DESCARTADO',
        reason: 'Publicidad de diseño web descartada por Dirección'
      });

      const result = classifyZeroTokenEmail(
        'Propuesta comercial exclusiva para su colegio',
        'Le ofrecemos rediseño integral de su portal educativo',
        'ventas@despacho-rediseño.com',
        'Agencia Digital',
        undefined,
        tenantId
      );

      expect(result.quadrant).toBe('SPAM_DESCARTADO');
      expect(result.badge.label).toBe('🟣 SPAM / PROMOCIÓN');
    });

    it('debe permitir enseñar al sistema que un remitente es ATENCION_CEO y recordarlo', () => {
      LearnedTriageMemoryService.learnPattern(tenantId, {
        patternType: 'sender',
        patternValue: 'abogado.corporativo@despacholegal.com',
        targetQuadrant: 'ATENCION_CEO',
        reason: 'Asesor legal externo directo'
      });

      const result = classifyZeroTokenEmail(
        'Estatus de contrato',
        'Envío documento firmado.',
        'abogado.corporativo@despacholegal.com',
        'Lic. Méndez',
        undefined,
        tenantId
      );

      expect(result.quadrant).toBe('ATENCION_CEO');
      expect(result.badge.label).toBe('🔴 ATENCIÓN INMEDIATA CEO');
    });
  });
});
