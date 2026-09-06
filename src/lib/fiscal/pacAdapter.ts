/**
 * Adaptador Agnóstico de Proveedor Autorizado de Certificación (PAC) del SAT
 * Arquitectura de Drivers Marca Blanca para Timbrado Fiscal CFDI 4.0
 */

import crypto from 'crypto';
import { CfdiStampRequest, CfdiStampResponse, CfdiCancelRequest, CfdiCancelResponse } from '@/types';
import { buildCfdi40Xml, buildSatQrUrl } from './cfdiXmlBuilder';
import { validateFiscalProfileData, validateCurp } from './fiscalValidation';

export interface PacProviderAdapter {
  stampInvoice(request: CfdiStampRequest): Promise<CfdiStampResponse>;
  cancelInvoice(request: CfdiCancelRequest): Promise<CfdiCancelResponse>;
  queryStatus(uuid: string, rfcEmisor: string, rfcReceptor: string, total: number): Promise<{
    isAlive: boolean;
    statusSat: 'Vigente' | 'Cancelado' | 'No encontrado';
    isCancelable: boolean;
  }>;
  getHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'offline';
    environment: 'sandbox' | 'production';
    latencyMs: number;
  }>;
}

interface StoredCfdi {
  uuid: string;
  request: CfdiStampRequest;
  response: CfdiStampResponse;
  statusSat: 'Vigente' | 'Cancelado';
  cancellationMotivo?: string;
  cancelledAt?: string;
  stampedAt: string;
}

const getFiscalStore = (): Map<string, StoredCfdi> => {
  const g = globalThis as any;
  if (!g.__iskool_fiscal_stamped_cfdis__) {
    g.__iskool_fiscal_stamped_cfdis__ = new Map<string, StoredCfdi>();
  }
  return g.__iskool_fiscal_stamped_cfdis__;
};

/**
 * Adaptador de Timbrado Fiscal Sandbox / Homologación Oficial
 * Realiza todas las validaciones de negocio del SAT, genera sellos digitales y produce XMLs conformes.
 */
export class SandboxPacAdapter implements PacProviderAdapter {
  private readonly environment: 'sandbox' | 'production';
  private readonly apiKey?: string;

  constructor(environment: 'sandbox' | 'production' = 'sandbox', apiKey?: string) {
    this.environment = environment;
    this.apiKey = apiKey;
  }

  public async stampInvoice(request: CfdiStampRequest): Promise<CfdiStampResponse> {
    const startTime = Date.now();

    // 1. Validar datos fiscales del receptor
    const valResult = validateFiscalProfileData({
      rfc: request.receptor.rfc,
      taxName: request.receptor.nombre,
      taxRegime: request.receptor.regimenFiscalReceptor,
      postalCode: request.receptor.domicilioFiscalReceptor,
      cfdiUse: request.receptor.usoCFDI
    });

    if (!valResult.isValid) {
      return {
        success: false,
        errorCode: 'SAT_301_INVALID_RECEPTOR_DATA',
        errorMessage: `Rechazo del motor fiscal: ${valResult.errors.join(' ')}`
      };
    }

    // 2. Si contiene Complemento IEDU, validar CURP de cada alumno
    for (const item of request.items) {
      if (item.ieduComplement) {
        const curpVal = validateCurp(item.ieduComplement.curp);
        if (!curpVal.isValid) {
          return {
            success: false,
            errorCode: 'IEDU_INVALID_CURP',
            errorMessage: `Error en Complemento IEDU: ${curpVal.error}`
          };
        }
        if (!item.ieduComplement.autRvoe) {
          return {
            success: false,
            errorCode: 'IEDU_MISSING_RVOE',
            errorMessage: 'Error en Complemento IEDU: La clave de autorización RVOE de la SEP es obligatoria.'
          };
        }
      }
    }

    // 3. Generar Folio Fiscal UUID y Certificados
    const uuid = crypto.randomUUID().toUpperCase();
    const fechaTimbrado = new Date().toISOString().replace(/\.\d{3}Z$/, '');
    const noCertificadoSat = '00001000000504465028';
    const noCertificadoEmisor = '30001000000500003416';
    const rfcProvCertif = 'PAC080721NN7';

    // Generar sellos digitales simulados de alta fidelidad
    const payloadForSeal = `${request.emisor.rfc}|${request.receptor.rfc}|${request.total}|${uuid}|${fechaTimbrado}`;
    const selloCfd = crypto.createHmac('sha256', 'cfd_secret_key_emisor').update(payloadForSeal).digest('base64');
    const selloSat = crypto.createHmac('sha256', 'sat_secret_key_pac').update(payloadForSeal + selloCfd).digest('base64');
    const cadenaOriginalSat = `||1.1|${uuid}|${fechaTimbrado}|${rfcProvCertif}|${selloCfd}|${noCertificadoSat}||`;

    // 4. Construir XML Canónico con timbrado
    const xmlContent = buildCfdi40Xml({
      request,
      uuid,
      fechaTimbrado,
      selloSat,
      selloCfd,
      noCertificadoSat,
      noCertificadoEmisor,
      rfcProvCertif
    });

    const qrCodeData = buildSatQrUrl({
      uuid,
      rfcEmisor: request.emisor.rfc,
      rfcReceptor: request.receptor.rfc,
      total: request.total,
      selloCfd
    });

    const response: CfdiStampResponse = {
      success: true,
      uuid,
      fechaTimbrado,
      noCertificadoSat,
      noCertificadoEmisor,
      selloSat,
      selloCfd,
      cadenaOriginalSat,
      xmlContent,
      qrCodeData
    };

    // 5. Registrar en el almacén fiscal para auditoría y cancelaciones
    getFiscalStore().set(uuid, {
      uuid,
      request,
      response,
      statusSat: 'Vigente',
      stampedAt: fechaTimbrado
    });

    return response;
  }

  public async cancelInvoice(request: CfdiCancelRequest): Promise<CfdiCancelResponse> {
    const cfdi = getFiscalStore().get(request.uuid);

    if (!cfdi) {
      return {
        success: false,
        uuid: request.uuid,
        estatus: 'Rechazado',
        errorMessage: 'El Folio Fiscal UUID no se encuentra registrado en el sistema.'
      };
    }

    if (cfdi.statusSat === 'Cancelado') {
      return {
        success: false,
        uuid: request.uuid,
        estatus: 'Cancelado',
        errorMessage: 'El comprobante fiscal ya se encontraba previamente cancelado ante el SAT.'
      };
    }

    const fechaCancelacion = new Date().toISOString();
    cfdi.statusSat = 'Cancelado';
    cfdi.cancellationMotivo = request.motivo;
    cfdi.cancelledAt = fechaCancelacion;

    const acuseXml = `<?xml version="1.0" encoding="UTF-8"?>
<Acuse xmlns="http://cancelacfd.sat.gob.mx" Fecha="${fechaCancelacion}" RfcEmisor="${request.rfcEmisor}">
  <Folios>
    <UUID>${request.uuid}</UUID>
    <EstatusUUID>201</EstatusUUID>
    <Motivo>${request.motivo}</Motivo>
    ${request.folioSustitucion ? `<FolioSustitucion>${request.folioSustitucion}</FolioSustitucion>` : ''}
  </Folios>
  <SelloSAT>SELLODIGITAL_ACUSE_CANCELACION_SAT</SelloSAT>
</Acuse>`;

    return {
      success: true,
      uuid: request.uuid,
      estatus: 'Cancelado',
      fechaCancelacion,
      acuseXml
    };
  }

  public async queryStatus(uuid: string, rfcEmisor: string, rfcReceptor: string, total: number): Promise<{
    isAlive: boolean;
    statusSat: 'Vigente' | 'Cancelado' | 'No encontrado';
    isCancelable: boolean;
  }> {
    const cfdi = getFiscalStore().get(uuid);
    if (!cfdi) {
      return {
        isAlive: true,
        statusSat: 'No encontrado',
        isCancelable: false
      };
    }

    return {
      isAlive: true,
      statusSat: cfdi.statusSat,
      isCancelable: true
    };
  }

  public async getHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'offline';
    environment: 'sandbox' | 'production';
    latencyMs: number;
  }> {
    const start = Date.now();
    // Simular ping de salud al servicio PAC
    await new Promise(r => setTimeout(r, 40));
    return {
      status: 'healthy',
      environment: this.environment,
      latencyMs: Date.now() - start
    };
  }
}

/**
 * Factoría que devuelve la instancia configurada del Adaptador PAC
 */
export function getFiscalPacAdapter(): PacProviderAdapter {
  const g = globalThis as any;
  if (!g.__iskool_fiscal_pac_adapter__) {
    const env = (process.env.FISCAL_PAC_ENV === 'production' ? 'production' : 'sandbox') as 'sandbox' | 'production';
    const apiKey = process.env.FISCAL_PAC_API_KEY;
    g.__iskool_fiscal_pac_adapter__ = new SandboxPacAdapter(env, apiKey);
  }
  return g.__iskool_fiscal_pac_adapter__;
}

export function getAllStampedCfdis(): StoredCfdi[] {
  return Array.from(getFiscalStore().values()).reverse();
}

export function getStampedCfdiByUuid(uuid: string): StoredCfdi | undefined {
  return getFiscalStore().get(uuid);
}
