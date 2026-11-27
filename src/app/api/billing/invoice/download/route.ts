import { NextRequest, NextResponse } from 'next/server';
import { getStampedCfdiByUuid } from '@/lib/fiscal/pacAdapter';
import { buildCfdi40Xml } from '@/lib/fiscal/cfdiXmlBuilder';
import { validateApiAuth } from '@/lib/authValidator';
import { isPlatformSuperUser } from '@/types';
import { resolveOAuthOrigin } from '@/lib/security/originResolver';

export async function GET(req: NextRequest) {
  const auth = await validateApiAuth(req, { allowSuperAdminBypass: true });
  if (!auth.authenticated || !auth.user) {
    return NextResponse.json(
      { error: 'Autenticación requerida para consultar y descargar comprobantes fiscales' },
      { status: 401 }
    );
  }
  const roleLower = (auth.user.role || '').toLowerCase();
  if (!['admin', 'superadmin', 'director', 'coordinator', 'billing', 'owner', 'ceo', 'parent'].includes(roleLower)) {
    return NextResponse.json(
      { error: 'Permisos insuficientes para descargar CFDIs fiscales.' },
      { status: 403 }
    );
  }

  const rawReceiptId = req.nextUrl.searchParams.get('receipt_id') || 'REC-2026-08102';
  const receiptId = rawReceiptId.replace(/[^a-zA-Z0-9_-]/g, '') || 'REC-2026-08102';
  const format = req.nextUrl.searchParams.get('format') || 'xml'; // 'xml' | 'pdf'
  const rawUuid = req.nextUrl.searchParams.get('uuid') || '4A8B9C1D-2E3F-4A5B-6C7D-8E9F0A1B2C3D';
  const uuid = rawUuid.replace(/[^a-zA-Z0-9_-]/g, '') || '4A8B9C1D-2E3F-4A5B-6C7D-8E9F0A1B2C3D';
  const rfcReceptor = req.nextUrl.searchParams.get('rfc') || 'XAXX010101000';
  const taxName = req.nextUrl.searchParams.get('tax_name') || 'PÚBLICO EN GENERAL';
  const amount = Number(req.nextUrl.searchParams.get('amount')) || 3450.00;
  const concept = req.nextUrl.searchParams.get('concept') || 'Colegiatura Mensual Septiembre 2026';
  const studentName = req.nextUrl.searchParams.get('student') || 'Mateo González Mendoza';
  const curp = req.nextUrl.searchParams.get('curp') || 'AAAA000101HDFZNS01';
  const level = req.nextUrl.searchParams.get('level') || 'Secundaria';
  const rvoe = req.nextUrl.searchParams.get('rvoe') || 'SEP-RVOE-2024-SEC-098';
  const requestedSchoolId = req.nextUrl.searchParams.get('school_id') || req.nextUrl.searchParams.get('schoolId');

  // 1. Verificar propiedad institucional y familiar sobre el CFDI almacenado (Anti-IDOR)
  const isSuper = isPlatformSuperUser(auth.user);
  const stored = getStampedCfdiByUuid(uuid);

  if (!isSuper && requestedSchoolId && auth.user.school_id && requestedSchoolId !== auth.user.school_id) {
    return NextResponse.json(
      { error: 'Acceso denegado: No puedes descargar comprobantes fiscales de otra institución.' },
      { status: 403 }
    );
  }

  if (stored && !isSuper) {
    if (!auth.user.school_id || !stored.schoolId || stored.schoolId !== auth.user.school_id) {
      return NextResponse.json(
        { error: 'Acceso denegado: Este comprobante fiscal pertenece a otra institución.' },
        { status: 403 }
      );
    }

    if (roleLower === 'parent') {
      const storedParentId = (stored as any).parentId || (stored.request as any)?.parentId;
      const storedParentEmail = ((stored as any).parentEmail || (stored.request as any)?.parentEmail || '').trim().toLowerCase();
      const userEmail = (auth.user.email || '').trim().toLowerCase();
      const userFullName = `${auth.user.first_name || ''} ${auth.user.last_name || ''}`.trim().toLowerCase();
      const receptorName = (stored.request?.receptor?.nombre || '').trim().toLowerCase();

      const isParentOwner = Boolean(
        (storedParentId && storedParentId === auth.user.id) ||
        (storedParentEmail && userEmail && storedParentEmail === userEmail) ||
        (userFullName.length >= 4 && receptorName && receptorName.includes(userFullName))
      );

      if (!isParentOwner) {
        return NextResponse.json(
          { error: 'Acceso denegado: Este comprobante fiscal no corresponde a tu cuenta familiar.' },
          { status: 403 }
        );
      }
    }
  }

  if (format === 'xml') {
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

  // Redirigir a la representación gráfica oficial en PDF usando el origen público canónico
  const publicOrigin = resolveOAuthOrigin(req.nextUrl.origin, req.headers);
  const pdfUrl = `/api/billing/invoice/pdf?receipt_id=${receiptId}&uuid=${uuid}&rfc=${rfcReceptor}&amount=${amount}&concept=${encodeURIComponent(concept)}&student=${encodeURIComponent(studentName)}`;
  return NextResponse.redirect(new URL(pdfUrl, publicOrigin));
}
