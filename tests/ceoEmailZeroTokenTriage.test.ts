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

  describe('5. Triage Profundo Especializado en Normativa Escolar Mexicana (SEP, AEFCM, LGDNNA, RVOE, SAT)', () => {
    it('debe clasificar oficios con emplazamiento de Supervisión de Zona / AEFCM sobre RVOE y CCT como ATENCION_CEO', () => {
      const result = classifyZeroTokenEmail(
        'OFICIO URGENTE: Apercibimiento y revisión de RVOE en CCT 15PJN0421Z',
        'Se notifica a la Dirección Técnica que la AEFCM y la Supervisión de Zona han programado visita de inspección extraordinaria de RVOE.',
        'supervision.zona@aefcm.gob.mx',
        'Supervisión Escolar AEFCM',
        undefined,
        tenantId
      );

      expect(result.quadrant).toBe('ATENCION_CEO');
      expect(result.badge.label).toBe('🔴 ATENCIÓN INMEDIATA CEO');
      expect(result.urgency).toBe('CRITICA');
      expect(result.category).toContain('Supervisión Oficial SEP');
      expect(result.assigned_department).toBe('Dirección General / Supervisión Escolar');
    });

    it('debe clasificar reportes de salvaguarda de menores bajo LGDNNA / SIPINNA / presunto maltrato como ATENCION_CEO', () => {
      const result = classifyZeroTokenEmail(
        'Activación urgente: Protocolo de prevención y actuación LGDNNA / SIPINNA',
        'Notificación de presunto maltrato infantil y vulneración al interés superior de la niñez para intervención inmediata.',
        'trabajo.social@ibime.edu.mx',
        'Trabajo Social',
        undefined,
        tenantId
      );

      expect(result.quadrant).toBe('ATENCION_CEO');
      expect(result.badge.label).toBe('🔴 ATENCIÓN INMEDIATA CEO');
      expect(result.urgency).toBe('CRITICA');
      expect(result.category).toContain('Salvaguarda y Protección de Menores');
      expect(result.recommended_action).toContain('Protocolo Oficial de Salvaguarda de la SEP');
    });

    it('debe clasificar órdenes judiciales de juzgado familiar sobre restricción de custodia como ATENCION_CEO', () => {
      const result = classifyZeroTokenEmail(
        'Notificación Juzgado Familiar: Medida cautelar de custodia y orden de restricción',
        'Se adjunta resolución del juzgado familiar sobre guarda y custodia con prohibición de entrega de menor a progenitor no custodio.',
        'notificaciones@tribunal.gob.mx',
        'Juzgado Familiar',
        undefined,
        tenantId
      );

      expect(result.quadrant).toBe('ATENCION_CEO');
      expect(result.badge.label).toBe('🔴 ATENCIÓN INMEDIATA CEO');
      expect(result.urgency).toBe('CRITICA');
    });

    it('debe clasificar alertas de reclamación PROFECO por presunta retención de documentos (Art. 149 LGE) como ATENCION_CEO', () => {
      const result = classifyZeroTokenEmail(
        'Notificación de queja PROFECO por retención de documentos oficiales',
        'Reclamación formal de tutor por presunta retención de boleta oficial contraviniendo el artículo 149 de la Ley General de Educación.',
        'quejas@profeco.gob.mx',
        'PROFECO',
        undefined,
        tenantId
      );

      expect(result.quadrant).toBe('ATENCION_CEO');
      expect(result.badge.label).toBe('🔴 ATENCIÓN INMEDIATA CEO');
      expect(result.urgency).toBe('CRITICA');
    });

    it('debe clasificar accidentes graves con ambulancia y póliza de seguro escolar como ATENCION_CEO', () => {
      const result = classifyZeroTokenEmail(
        'Urgencia Médica: Alumno herido con fractura en patio central',
        'Se solicitó ambulancia de la Cruz Roja y se activó la póliza de seguro escolar contra accidentes para traslado hospitalario.',
        'enfermeria@ibime.edu.mx',
        'Servicio Médico',
        undefined,
        tenantId
      );

      expect(result.quadrant).toBe('ATENCION_CEO');
      expect(result.badge.label).toBe('🔴 ATENCIÓN INMEDIATA CEO');
      expect(result.urgency).toBe('CRITICA');
      expect(result.category).toContain('Accidente Escolar');
    });

    it('debe clasificar convocatorias al Consejo Técnico Escolar (CTE) y Programa Analítico como ATENCION_CEO', () => {
      const result = classifyZeroTokenEmail(
        'Convocatoria: Sesión ordinaria de Consejo Técnico Escolar (CTE) y codiseño curricular',
        'Agenda para la sesión de CTE de fin de mes, revisión del Programa Analítico y acuerdos de la Nueva Escuela Mexicana.',
        'supervision.pedagogica@edomex.gob.mx',
        'Supervisión Escolar',
        undefined,
        tenantId
      );

      expect(result.quadrant).toBe('ATENCION_CEO');
      expect(result.badge.label).toBe('🔴 ATENCIÓN INMEDIATA CEO');
      expect(result.category).toContain('Consejo Técnico Escolar');
    });

    it('debe clasificar trámites de certificación oficial SEP (SIGED, SINCE, certificados QR, kardex) como DELEGADO_CON_SLA (Control Escolar)', () => {
      const result = classifyZeroTokenEmail(
        'Solicitud de Certificado Oficial Electrónico con Folio Digital QR',
        'Solicito la emisión de duplicado de certificado escolar y validación de historial académico en plataforma SIGED / SINCE.',
        'tutor.familia@gmail.com',
        'Padre de Familia',
        undefined,
        tenantId
      );

      expect(result.quadrant).toBe('DELEGADO_CON_SLA');
      expect(result.badge.label).toBe('🟡 DELEGADO OPERATIVO');
      expect(result.assigned_department).toBe('Departamento de Control Escolar y Secretaría Oficial');
      expect(result.assigned_role).toBe('Control Escolar Oficial (SIGED / SEP)');
      expect(result.sla_hours).toBe(48);
    });

    it('debe clasificar trámites de Becas SEP por incorporación RVOE (5%) como DELEGADO_CON_SLA (Comité de Becas)', () => {
      const result = classifyZeroTokenEmail(
        'Convocatoria y Solicitud de Beca SEP por Incorporación RVOE',
        'Presento solicitud de beca por incorporación a la SEP correspondiente al porcentaje de exención del 5% establecido por la normativa.',
        'solicitud.beca@gmail.com',
        'Tutor Solicitante',
        undefined,
        tenantId
      );

      expect(result.quadrant).toBe('DELEGADO_CON_SLA');
      expect(result.badge.label).toBe('🟡 DELEGADO OPERATIVO');
      expect(result.assigned_department).toBe('Comité de Becas e Incorporación RVOE');
      expect(result.assigned_role).toBe('Comité de Becas SEP');
      expect(result.sla_hours).toBe(48);
    });

    it('debe clasificar solicitudes de facturas CFDI con complemento educativo IEDU (SAT) como DELEGADO_CON_SLA (Tesorería)', () => {
      const result = classifyZeroTokenEmail(
        'Solicitud de CFDI con complemento educativo IEDU para el SAT',
        'Requiero factura de colegiatura con el complemento educativo IEDU para deducción personal en el SAT.',
        'padre.factura@gmail.com',
        'Contador de Familia',
        undefined,
        tenantId
      );

      expect(result.quadrant).toBe('DELEGADO_CON_SLA');
      expect(result.badge.label).toBe('🟡 DELEGADO OPERATIVO');
      expect(result.category).toContain('Facturación CFDI');
    });

    it('debe clasificar justificantes médicos con receta o incapacidad IMSS como DELEGADO_CON_SLA (Servicio Médico)', () => {
      const result = classifyZeroTokenEmail(
        'Justificante médico e incapacidad IMSS de alumno',
        'Adjunto receta médica y justificante médico por reposo prescrito para el alumno.',
        'familia.enfermedad@gmail.com',
        'Madre de Familia',
        undefined,
        tenantId
      );

      expect(result.quadrant).toBe('DELEGADO_CON_SLA');
      expect(result.badge.label).toBe('🟡 DELEGADO OPERATIVO');
      expect(result.assigned_department).toBe('Servicio Médico Escolar');
      expect(result.assigned_role).toBe('Médico Escolar');
    });

    it('debe clasificar circulares cívicas y efemérides SEP (honores a la bandera, 20 de noviembre, NEM) como INFORMATIVO', () => {
      const result = classifyZeroTokenEmail(
        'Circular de Acto Cívico: Honores a la bandera y conmemoración del 20 de noviembre',
        'Aviso de desfile cívico y participación de la escolta escolar en la conmemoración de la Revolución Mexicana dentro de los proyectos de la Nueva Escuela Mexicana (NEM).',
        'comunicacion@ibime.edu.mx',
        'Comunicación Institucional',
        undefined,
        tenantId
      );

      expect(result.quadrant).toBe('INFORMATIVO');
      expect(result.badge.label).toBe('🔵 INFORMATIVO');
      expect(result.category).toBe('Nueva Escuela Mexicana (NEM) & Vida Cívica Escolar');
    });

    it('debe clasificar ofertas de proveedores de mobiliario y butacas escolares como SPAM_DESCARTADO', () => {
      const result = classifyZeroTokenEmail(
        'Catálogo de butacas escolares y mobiliario escolar con descuento',
        'Le enviamos cotización especial en butacas escolares, pizarrones interactivos en oferta y lockers para su colegio.',
        'ventas@mobiliario-escolar-mexico.com',
        'Mobiliario Escolar',
        undefined,
        tenantId
      );

      expect(result.quadrant).toBe('SPAM_DESCARTADO');
      expect(result.badge.label).toBe('🟣 SPAM / PROMOCIÓN');
      expect(result.gmailCategory).toBe('promociones');
    });
  });
});
