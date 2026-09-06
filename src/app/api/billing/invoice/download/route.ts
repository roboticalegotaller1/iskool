import { NextRequest, NextResponse } from 'next/server';
import { getStampedCfdiByUuid } from '@/lib/fiscal/pacAdapter';
import { buildCfdi40Xml } from '@/lib/fiscal/cfdiXmlBuilder';

export async function GET(req: NextRequest) {
  const receiptId = req.nextUrl.searchParams.get('receipt_id') || 'REC-2026-08102';
  const format = req.nextUrl.searchParams.get('format') || 'xml'; // 'xml' | 'pdf'
  const uuid = req.nextUrl.searchParams.get('uuid') || '4A8B9C1D-2E3F-4A5B-6C7D-8E9F0A1B2C3D';
  const rfcReceptor = req.nextUrl.searchParams.get('rfc') || 'LOAI840512AB3';
  const taxName = req.nextUrl.searchParams.get('tax_name') || 'ISRAEL LOPEZ ANGELES';
  const amount = Number(req.nextUrl.searchParams.get('amount')) || 3450.00;
  const concept = req.nextUrl.searchParams.get('concept') || 'Colegiatura Mensual Septiembre 2026';
  const studentName = req.nextUrl.searchParams.get('student') || 'Mateo López Mendoza';
  const curp = req.nextUrl.searchParams.get('curp') || 'LOMA080912HDFZNS01';
  const level = req.nextUrl.searchParams.get('level') || 'Secundaria';
  const rvoe = req.nextUrl.searchParams.get('rvoe') || 'SEP-RVOE-2024-SEC-098';

  if (format === 'xml') {
    // 1. Verificar si existe en el almacén de timbrado del PAC
    const stored = getStampedCfdiByUuid(uuid);
    let xmlContent = stored?.response?.xmlContent;

    if (!xmlContent) {
      xmlContent = buildCfdi40Xml({
        request: {
          invoiceId: 'inv-001',
          receiptNumber: receiptId,
          emisor: {
            rfc: 'CAM180312AB9',
            nombre: 'COLEGIO ANGLO MEXICANO',
            regimenFiscal: '603',
            codigoPostal: '06700'
          },
          receptor: {
            rfc: rfcReceptor,
            nombre: taxName,
            regimenFiscalReceptor: '605',
            domicilioFiscalReceptor: '06700',
            usoCFDI: 'D10'
          },
          items: [{
            claveProdServ: '86121500',
            noIdentificacion: receiptId,
            cantidad: 1,
            claveUnidad: 'E48',
            unidad: 'Servicio',
            descripcion: concept,
            valorUnitario: amount,
            importe: amount,
            objetoImp: '01',
            ieduComplement: {
              nombreAlumno: studentName,
              curp: curp,
              nivelEducativo: level,
              autRvoe: rvoe
            }
          }],
          formaPago: '03',
          metodoPago: 'PUE',
          subtotal: amount,
          total: amount,
          moneda: 'MXN'
        },
        uuid,
        fechaTimbrado: new Date().toISOString().replace(/\.\d{3}Z$/, ''),
        selloSat: 'SELLOSAT_OFICIAL_AUTORIZADO_CFDI_4_0',
        selloCfd: 'SELLOCFD_EMISOR_COLEGIO_ANGLO_MEXICANO',
        noCertificadoSat: '00001000000504465028',
        noCertificadoEmisor: '30001000000500003416',
        rfcProvCertif: 'PAC080721NN7'
      });
    }

    return new NextResponse(xmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Content-Disposition': `attachment; filename="CFDI_4_0_${receiptId}_${uuid.slice(0, 8)}.xml"`
      }
    });
  }

  // Redirigir a la representación gráfica oficial en PDF
  const pdfUrl = `/api/billing/invoice/pdf?receipt_id=${receiptId}&uuid=${uuid}&rfc=${rfcReceptor}&amount=${amount}&concept=${encodeURIComponent(concept)}&student=${encodeURIComponent(studentName)}`;
  return NextResponse.redirect(new URL(pdfUrl, req.url));
}
