import { describe, it, expect } from 'vitest';
import { HermeticEmailBrainService, InboundEmailDTO, HermeticAuthSession } from '@/lib/services/hermetic-email-brain.service';
import { CeoStyleLearnerService } from '@/lib/services/ceoStyleLearner';

describe('⚡ REGLAS MANDATORIAS DE BANDEJA INTELIGENTE Y MOTOR ADAPTATIVO VIP (0 TOKENS)', () => {
  const mockSession: HermeticAuthSession = {
    user: {
      id: 'usr-ibime',
      email: 'direccion@ibime.edu.mx',
      app_metadata: {
        tenant_id: 'e1000000-0000-0000-0000-000000000001',
        role: 'CEO',
        institution_name: 'Instituto Bilingüe IBIME'
      }
    },
    tenant_id: 'e1000000-0000-0000-0000-000000000001',
    institution_name: 'Instituto Bilingüe IBIME',
    role: 'CEO'
  };

  describe('1. Regla Inviolable: Palabras Clave Obligatorias -> ATENCIÓN INMEDIATA CEO', () => {
    it('debe marcar como ATENCION_CEO cualquier correo que contenga "supervision" o "supervisión"', async () => {
      const email1: InboundEmailDTO = {
        sender_email: 'zona14@edomex.gob.mx',
        sender_name: 'Supervisión Escolar',
        subject: 'Revisión y supervision de planeaciones',
        body_text: 'Se solicita la entrega de evidencias para la supervision de zona escolar.'
      };
      const res1 = await HermeticEmailBrainService.processInboundEmail(email1, mockSession);
      expect(res1.quadrant).toBe('ATENCION_CEO');

      const email2: InboundEmailDTO = {
        sender_email: 'zona14@edomex.gob.mx',
        sender_name: 'Supervisión Escolar',
        subject: 'Documentación pendiente',
        body_text: 'Atenta entrega de documentación requerida para supervisión de zona escolar.'
      };
      const res2 = await HermeticEmailBrainService.processInboundEmail(email2, mockSession);
      expect(res2.quadrant).toBe('ATENCION_CEO');
    });

    it('debe marcar como ATENCION_CEO cualquier correo que contenga "SEP" o "sep"', async () => {
      const emailSepUpper: InboundEmailDTO = {
        sender_email: 'tramites@sep.gob.mx',
        sender_name: 'Ventanilla Oficial',
        subject: 'Acuse de Matrícula SEP',
        body_text: 'Se confirma la validación de las listas de matrícula ante la SEP.'
      };
      const resSepUpper = await HermeticEmailBrainService.processInboundEmail(emailSepUpper, mockSession);
      expect(resSepUpper.quadrant).toBe('ATENCION_CEO');

      const emailSepLower: InboundEmailDTO = {
        sender_email: 'contacto@educacion.gob.mx',
        sender_name: 'Control Escolar',
        subject: 'Oficio de registro',
        body_text: 'Lineamientos emitidos por la sep para el nuevo ciclo.'
      };
      const resSepLower = await HermeticEmailBrainService.processInboundEmail(emailSepLower, mockSession);
      expect(resSepLower.quadrant).toBe('ATENCION_CEO');
    });

    it('debe marcar como ATENCION_CEO cualquier correo que contenga "CTE" o "cte"', async () => {
      const emailCte: InboundEmailDTO = {
        sender_email: 'coordinacion@ibime.edu.mx',
        sender_name: 'Coordinación Académica',
        subject: 'CTE pospuesto',
        body_text: 'Se notifica que el CTE queda pospuesto para nueva fecha acordada con supervisión escolar de zona.'
      };
      const resCte = await HermeticEmailBrainService.processInboundEmail(emailCte, mockSession);
      expect(resCte.quadrant).toBe('ATENCION_CEO');
      expect(resCte.category).toContain('Consejo Técnico Escolar');
    });
  });

  describe('2. Motor Adaptativo VIP con Coste 0 Tokens (Estilo Spark Workspace)', () => {
    it('debe aprender del estilo de redacción del CEO a partir de respuestas enviadas sin consumir tokens', () => {
      const reply = `Estimada Comunidad Escolar:\n\nHe recibido de manera directa su comunicación. En nuestro plantel la seguridad y el seguimiento institucional son un compromiso prioritario.\n\nHe instruido a Coordinación Técnica desahogar el requerimiento de forma inmediata.\n\nAtentamente,\nDirección General\nInstituto Bilingüe IBIME`;

      const profile = CeoStyleLearnerService.learnFromSentReply(
        'e1000000-0000-0000-0000-000000000001',
        reply,
        'Consulta de lineamientos',
        'padres@ibime.edu.mx',
        'Lic. Patricia Sandoval Morales',
        'Instituto Bilingüe IBIME'
      );

      expect(profile.defaultGreeting).toBe('Estimada Comunidad Escolar');
      expect(profile.defaultSignOff).toContain('Atentamente');
      expect(profile.totalRepliesAnalyzed).toBeGreaterThanOrEqual(1);
    });

    it('debe generar borradores predictivos con 0 tokens usando el perfil aprendido del CEO', () => {
      const prediction = CeoStyleLearnerService.predictDraftResponse(
        'e1000000-0000-0000-0000-000000000001',
        {
          subject: 'Oficio urgente de supervisión escolar',
          body: 'Favor de entregar el concentrado de evaluaciones SEP.',
          sender_name: 'Supervisión Zona 14',
          sender_email: 'supervision@edomex.gob.mx',
          schoolName: 'Instituto Bilingüe IBIME',
          directorTitle: 'Lic. Patricia Sandoval Morales'
        }
      );

      expect(prediction.tokenCost).toBe(0);
      expect(prediction.confidence).toBeGreaterThan(0.9);
      expect(prediction.body).toContain('Supervisión de Zona');
      expect(prediction.body).toContain('Lic. Patricia Sandoval Morales');
    });

    it('debe verificar que correos con supervision/sep/cte activan isCeoImmediateAttention de forma determinista', () => {
      expect(CeoStyleLearnerService.isCeoImmediateAttention('Aviso de supervisión', 'Detalle')).toBe(true);
      expect(CeoStyleLearnerService.isCeoImmediateAttention('Sesión de CTE', 'Revisión')).toBe(true);
      expect(CeoStyleLearnerService.isCeoImmediateAttention('Oficio SEP', 'Validación')).toBe(true);
      expect(CeoStyleLearnerService.isCeoImmediateAttention('Recordatorio de Pago de Colegiatura', 'Importe mensual')).toBe(false);
    });
  });
});
