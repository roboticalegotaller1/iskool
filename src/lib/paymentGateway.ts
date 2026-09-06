/**
 * Capa de Abstracción Financiera — PaymentGateway (Marca Blanca Institucional)
 * Estándar de Seguridad Bancaria • Cero Gamificación
 * Manejo agnóstico de sesiones de pago, checkout, tokens de enlace seguro (Magic Links) y webhooks.
 */

import crypto from 'crypto';
import { 
  Invoice, 
  PaymentHistoryItem, 
  PaymentGatewaySessionParams, 
  PaymentGatewaySessionResult, 
  PaymentWebhookPayload,
  BillingProfile,
  TaxRegimeCode,
  CfdiUseCode
} from '@/types';

export class PaymentGatewayService {
  private static instance: PaymentGatewayService;
  private readonly gatewayProviderName: string = 'PaymentGateway';
  private readonly baseUrl: string = process.env.NEXT_PUBLIC_APP_URL || 'https://iskool.edu.mx';

  private constructor() {}

  public static getInstance(): PaymentGatewayService {
    if (!PaymentGatewayService.instance) {
      PaymentGatewayService.instance = new PaymentGatewayService();
    }
    return PaymentGatewayService.instance;
  }

  /**
   * Generar sesión de checkout segura en pasarela financiera
   */
  public async createCheckoutSession(params: PaymentGatewaySessionParams): Promise<PaymentGatewaySessionResult> {
    // Generación de identificador único de sesión de cobro
    const sessionId = `chk_sess_${crypto.randomBytes(16).toString('hex')}`;
    const referenceCode = `REF-${params.invoiceNumber}-${Date.now().toString().slice(-6)}`;
    
    // Cálculo de vigencia (default: 72 horas)
    const expiresAt = params.expiresAt || new Date(Date.now() + 72 * 3600 * 1000).toISOString();

    // En un entorno de producción con pasarela activa, aquí se invoca la API REST del procesador financiero.
    // La URL de checkout redirige a la interfaz segura bancaria con cifrado TLS 1.3.
    const checkoutUrl = `${this.baseUrl}/checkout/${sessionId}?ref=${encodeURIComponent(referenceCode)}`;

    return {
      sessionId,
      checkoutUrl,
      referenceCode,
      expiresAt,
      status: 'active'
    };
  }

  /**
   * Generar Token Criptográfico y Magic Link para pago rápido sin contraseña
   */
  public generateMagicToken(invoiceId: string, parentId: string, hoursValid: number = 72): {
    rawToken: string;
    tokenHash: string;
    expiresAt: string;
    magicLinkUrl: string;
  } {
    // Generar 32 bytes de entropía criptográfica segura
    const rawToken = crypto.randomBytes(32).toString('hex');
    
    // Hash SHA-256 para almacenamiento seguro en base de datos
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    
    const expiresAt = new Date(Date.now() + hoursValid * 3600 * 1000).toISOString();
    const magicLinkUrl = `${this.baseUrl}/pay/magic/${rawToken}`;

    return {
      rawToken,
      tokenHash,
      expiresAt,
      magicLinkUrl
    };
  }

  /**
   * Verificar firma criptográfica de Webhooks entrantes del proveedor financiero
   */
  public verifyWebhookSignature(payloadRaw: string, signatureHeader: string, webhookSecret: string): boolean {
    if (!signatureHeader || !webhookSecret) return false;

    try {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(payloadRaw)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signatureHeader, 'utf-8'),
        Buffer.from(expectedSignature, 'utf-8')
      );
    } catch (e) {
      return false;
    }
  }

  /**
   * Validador estricto de RFC (Registro Federal de Contribuyentes) ante el SAT
   */
  public static validateRFC(rfc: string): { isValid: boolean; type?: 'fisica' | 'moral'; error?: string } {
    const cleanRFC = rfc.trim().toUpperCase();
    
    // Persona Física: 4 letras + 6 números + 3 caracteres homoclave (13 caracteres)
    const regexFisica = /^[A-Z&Ñ]{4}[0-9]{6}[A-Z0-9]{3}$/;
    
    // Persona Moral: 3 letras + 6 números + 3 caracteres homoclave (12 caracteres)
    const regexMoral = /^[A-Z&Ñ]{3}[0-9]{6}[A-Z0-9]{3}$/;

    if (regexFisica.test(cleanRFC)) {
      return { isValid: true, type: 'fisica' };
    }
    if (regexMoral.test(cleanRFC)) {
      return { isValid: true, type: 'moral' };
    }

    return { 
      isValid: false, 
      error: 'El RFC debe contener 12 dígitos para persona moral o 13 para persona física con formato válido SAT.' 
    };
  }

  /**
   * Catálogo Oficial de Regímenes Fiscales SAT
   */
  public static getTaxRegimes(): { code: TaxRegimeCode; label: string; appliesTo: 'fisica' | 'moral' | 'ambas' }[] {
    return [
      { code: '601', label: '601 - General de Ley Personas Morales', appliesTo: 'moral' },
      { code: '603', label: '603 - Personas Morales con Fines no Lucrativos', appliesTo: 'moral' },
      { code: '605', label: '605 - Sueldos y Salarios e Ingresos Asimilados a Salarios', appliesTo: 'fisica' },
      { code: '606', label: '606 - Arrendamiento', appliesTo: 'fisica' },
      { code: '608', label: '608 - Demás ingresos', appliesTo: 'fisica' },
      { code: '612', label: '612 - Personas Físicas con Actividades Empresariales y Profesionales', appliesTo: 'fisica' },
      { code: '616', label: '616 - Sin obligaciones fiscales', appliesTo: 'fisica' },
      { code: '621', label: '621 - Incorporación Fiscal', appliesTo: 'fisica' },
      { code: '625', label: '625 - Actividades Empresariales con ingresos a través de Plataformas Tecnológicas', appliesTo: 'fisica' },
      { code: '626', label: '626 - Régimen Simplificado de Confianza (RESICO)', appliesTo: 'ambas' },
    ];
  }

  /**
   * Catálogo Oficial de Usos de CFDI SAT
   */
  public static getCfdiUses(): { code: CfdiUseCode; label: string; recommended?: boolean }[] {
    return [
      { code: 'D10', label: 'D10 - Pagos por servicios educativos (Colegiaturas) [Deducción Personal]', recommended: true },
      { code: 'G03', label: 'G03 - Gastos en general' },
      { code: 'G01', label: 'G01 - Adquisición de mercancías' },
      { code: 'S01', label: 'S01 - Sin efectos fiscales' },
      { code: 'CP01', label: 'CP01 - Pagos' }
    ];
  }
}

export const paymentGateway = PaymentGatewayService.getInstance();
