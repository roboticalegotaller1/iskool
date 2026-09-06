/**
 * Generador Canónico de XML Fiscal SAT CFDI 4.0 con Complemento IEDU V1.0
 * Cumplimiento del Anexo 20 del SAT y Decreto Fiscal de Colegiaturas Educativas
 */

import { CfdiStampRequest, CfdiStampResponse, IeduComplementData } from '@/types';

export interface BuildCfdiXmlOptions {
  request: CfdiStampRequest;
  uuid?: string;
  fechaTimbrado?: string;
  selloSat?: string;
  selloCfd?: string;
  noCertificadoSat?: string;
  noCertificadoEmisor?: string;
  rfcProvCertif?: string;
}

/**
 * Escapa caracteres especiales para XML seguro
 */
function escapeXml(str: string | undefined): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Construye el documento XML completo del CFDI 4.0 con Complemento IEDU
 */
export function buildCfdi40Xml(options: BuildCfdiXmlOptions): string {
  const { request, uuid, fechaTimbrado, selloSat, selloCfd, noCertificadoSat, noCertificadoEmisor, rfcProvCertif } = options;

  const fechaComprobante = request.fecha || new Date().toISOString().replace(/\.\d{3}Z$/, '');
  const subtotalFormatted = request.subtotal.toFixed(2);
  const totalFormatted = request.total.toFixed(2);
  const descuentoAttr = request.descuento && request.descuento > 0 ? ` Descuento="${request.descuento.toFixed(2)}"` : '';

  // Determinar si algún concepto incluye el complemento IEDU
  const hasIedu = request.items.some(it => !!it.ieduComplement);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<cfdi:Comprobante `;
  xml += `xmlns:cfdi="http://www.sat.gob.mx/cfd/4" `;
  xml += `xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" `;
  if (hasIedu) {
    xml += `xmlns:iedu="http://www.sat.gob.mx/iedu" `;
  }
  xml += `xsi:schemaLocation="http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd`;
  if (hasIedu) {
    xml += ` http://www.sat.gob.mx/iedu http://www.sat.gob.mx/sitio_internet/cfd/iedu/iedu.xsd`;
  }
  xml += `" `;
  xml += `Version="4.0" `;
  xml += `Serie="F" `;
  xml += `Folio="${escapeXml(request.receiptNumber)}" `;
  xml += `Fecha="${fechaComprobante}" `;
  xml += `Sello="${escapeXml(selloCfd || 'SELLODIGITAL_CFD_PROCESADO_POR_EL_MOTOR_FISCAL_SAT')}" `;
  xml += `FormaPago="${escapeXml(request.formaPago || '03')}" `;
  xml += `NoCertificado="${escapeXml(noCertificadoEmisor || '30001000000500003416')}" `;
  xml += `Certificado="MIIF...CERTIFICADO_DIGITAL_DEL_EMISOR..." `;
  xml += `CondicionesDePago="Pago en una sola exhibición" `;
  xml += `SubTotal="${subtotalFormatted}"${descuentoAttr} `;
  xml += `Moneda="${escapeXml(request.moneda || 'MXN')}" `;
  xml += `Total="${totalFormatted}" `;
  xml += `TipoDeComprobante="I" `;
  xml += `Exportacion="01" `;
  xml += `MetodoPago="${escapeXml(request.metodoPago || 'PUE')}" `;
  xml += `LugarExpedicion="${escapeXml(request.emisor.codigoPostal || '06700')}">\n`;

  // Emisor
  xml += `  <cfdi:Emisor `;
  xml += `Rfc="${escapeXml(request.emisor.rfc)}" `;
  xml += `Nombre="${escapeXml(request.emisor.nombre.toUpperCase())}" `;
  xml += `RegimenFiscal="${escapeXml(request.emisor.regimenFiscal)}"/>\n`;

  // Receptor
  xml += `  <cfdi:Receptor `;
  xml += `Rfc="${escapeXml(request.receptor.rfc.toUpperCase())}" `;
  xml += `Nombre="${escapeXml(request.receptor.nombre.toUpperCase())}" `;
  xml += `DomicilioFiscalReceptor="${escapeXml(request.receptor.domicilioFiscalReceptor)}" `;
  xml += `RegimenFiscalReceptor="${escapeXml(request.receptor.regimenFiscalReceptor)}" `;
  xml += `UsoCFDI="${escapeXml(request.receptor.usoCFDI)}"/>\n`;

  // Conceptos
  xml += `  <cfdi:Conceptos>\n`;
  for (const item of request.items) {
    const itemImporte = item.importe.toFixed(2);
    const itemValorUnit = item.valorUnitario.toFixed(2);
    const itemDescAttr = item.descuento && item.descuento > 0 ? ` Descuento="${item.descuento.toFixed(2)}"` : '';

    xml += `    <cfdi:Concepto `;
    xml += `ClaveProdServ="${escapeXml(item.claveProdServ || '86121500')}" `;
    if (item.noIdentificacion) {
      xml += `NoIdentificacion="${escapeXml(item.noIdentificacion)}" `;
    }
    xml += `Cantidad="${item.cantidad}" `;
    xml += `ClaveUnidad="${escapeXml(item.claveUnidad || 'E48')}" `;
    xml += `Unidad="${escapeXml(item.unidad || 'Servicio')}" `;
    xml += `Descripcion="${escapeXml(item.descripcion)}" `;
    xml += `ValorUnitario="${itemValorUnit}" `;
    xml += `Importe="${itemImporte}"${itemDescAttr} `;
    xml += `ObjetoImp="${escapeXml(item.objetoImp || '01')}">\n`;

    // Complemento Concepto IEDU (si aplica a colegiaturas)
    if (item.ieduComplement) {
      const iedu = item.ieduComplement;
      xml += `      <cfdi:ComplementoConcepto>\n`;
      xml += `        <iedu:instEducativas `;
      xml += `version="1.0" `;
      xml += `nombreAlumno="${escapeXml(iedu.nombreAlumno.toUpperCase())}" `;
      xml += `CURP="${escapeXml(iedu.curp.toUpperCase())}" `;
      xml += `nivelEducativo="${escapeXml(iedu.nivelEducativo)}" `;
      xml += `autRVOE="${escapeXml(iedu.autRvoe)}"`;
      if (iedu.rfcPago) {
        xml += ` rfcPago="${escapeXml(iedu.rfcPago.toUpperCase())}"`;
      }
      xml += `/>\n`;
      xml += `      </cfdi:ComplementoConcepto>\n`;
    }

    xml += `    </cfdi:Concepto>\n`;
  }
  xml += `  </cfdi:Conceptos>\n`;

  // Complemento Timbre Fiscal Digital (si ya fue timbrado)
  if (uuid) {
    xml += `  <cfdi:Complemento>\n`;
    xml += `    <tfd:TimbreFiscalDigital `;
    xml += `xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" `;
    xml += `xsi:schemaLocation="http://www.sat.gob.mx/TimbreFiscalDigital http://www.sat.gob.mx/sitio_internet/cfd/TimbreFiscalDigital/TimbreFiscalDigitalv11.xsd" `;
    xml += `Version="1.1" `;
    xml += `UUID="${escapeXml(uuid)}" `;
    xml += `FechaTimbrado="${escapeXml(fechaTimbrado || new Date().toISOString())}" `;
    xml += `RfcProvCertif="${escapeXml(rfcProvCertif || 'PAC080721NN7')}" `;
    xml += `SelloCFD="${escapeXml(selloCfd || 'SELLOCFD_EMISOR_FIRMADO')}" `;
    xml += `NoCertificadoSAT="${escapeXml(noCertificadoSat || '00001000000504465028')}" `;
    xml += `SelloSAT="${escapeXml(selloSat || 'SELLOSAT_AUTORIZADO_CFDI_4_0')}"/>\n`;
    xml += `  </cfdi:Complemento>\n`;
  }

  xml += `</cfdi:Comprobante>`;
  return xml;
}

/**
 * Genera la cadena de consulta QR oficial del SAT para validación instantánea
 * https://verificacfdi.facturaelectronica.sat.gob.mx/default.aspx?id=...&re=...&rr=...&tt=...&fe=...
 */
export function buildSatQrUrl(params: {
  uuid: string;
  rfcEmisor: string;
  rfcReceptor: string;
  total: number;
  selloCfd: string;
}): string {
  const last8Sello = params.selloCfd.slice(-8);
  const totalFormatted = params.total.toFixed(6);
  return `https://verificacfdi.facturaelectronica.sat.gob.mx/default.aspx?id=${params.uuid}&re=${params.rfcEmisor}&rr=${params.rfcReceptor}&tt=${totalFormatted}&fe=${last8Sello}`;
}
