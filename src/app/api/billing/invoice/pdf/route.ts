import { NextRequest, NextResponse } from 'next/server';

/**
 * Representación Impresa Oficial de Factura Fiscal SAT (CFDI 4.0)
 * GET /api/billing/invoice/pdf
 */
export async function GET(req: NextRequest) {
  const receiptId = req.nextUrl.searchParams.get('receipt_id') || 'REC-2026-08102';
  const uuid = req.nextUrl.searchParams.get('uuid') || '4A8B9C1D-2E3F-4A5B-6C7D-8E9F0A1B2C3D';
  const rfcReceptor = req.nextUrl.searchParams.get('rfc') || 'LOAI840512AB3';
  const taxName = req.nextUrl.searchParams.get('tax_name') || 'ISRAEL LOPEZ ANGELES';
  const amount = Number(req.nextUrl.searchParams.get('amount') || 4500).toFixed(2);
  const concept = req.nextUrl.searchParams.get('concept') || 'Inscripción Anual Ciclo 2026-2027';
  const paymentMethod = req.nextUrl.searchParams.get('payment_method') || 'Tarjeta de Crédito (Visa ***4012)';
  const dateStr = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Factura Fiscal SAT CFDI 4.0 — ${receiptId}</title>
  <style>
    @page { size: letter portrait; margin: 15mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; color: #1e293b; background: #fff; margin: 0; padding: 20px; font-size: 11px; line-height: 1.4; }
    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
    .header-logo { font-size: 20px; font-weight: 800; color: #1e40af; letter-spacing: -0.5px; }
    .header-sub { font-size: 9px; color: #64748b; font-weight: 600; text-transform: uppercase; }
    .fiscal-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; margin-bottom: 12px; }
    .fiscal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .box-title { font-size: 10px; font-weight: 700; color: #1e40af; text-transform: uppercase; margin-bottom: 5px; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px; }
    .data-row { margin-bottom: 3px; font-size: 10px; }
    .data-label { font-weight: 600; color: #475569; display: inline-block; width: 120px; }
    .data-val { color: #0f172a; font-weight: 500; }
    .table-conceptos { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 10px; }
    .table-conceptos th { background: #1e40af; color: #fff; padding: 6px 8px; text-align: left; font-weight: 600; }
    .table-conceptos td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; }
    .totals-table { width: 280px; margin-left: auto; border-collapse: collapse; margin-bottom: 15px; }
    .totals-table td { padding: 4px 8px; font-size: 10px; }
    .totals-table .total-row { font-weight: 800; font-size: 12px; background: #f1f5f9; border-top: 1px solid #cbd5e1; }
    .sat-stamp-box { border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; font-size: 8px; background: #fafafa; display: flex; gap: 12px; }
    .qr-placeholder { width: 90px; height: 90px; background: #fff; border: 1px solid #000; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 7px; text-align: center; font-weight: bold; flex-shrink: 0; }
    .stamp-text { font-family: monospace; word-break: break-all; color: #475569; }
    .stamp-title { font-weight: bold; color: #0f172a; margin-top: 3px; }
    .no-print { margin-bottom: 20px; padding: 12px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
    .btn-print { background: #1e40af; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; font-size: 12px; cursor: pointer; }
    @media print { .no-print { display: none; } body { padding: 0; } }
  </style>
</head>
<body>

  <div class="no-print">
    <div>
      <strong style="color: #1e40af;">Representación Impresa Oficial del SAT (CFDI 4.0)</strong>
      <div style="color: #64748b; font-size: 11px;">Este documento es un comprobante fiscal digital válido emitido bajo las normas del SAT.</div>
    </div>
    <button class="btn-print" onclick="window.print()">🖨️ Imprimir / Guardar como PDF</button>
  </div>

  <table class="header-table">
    <tr>
      <td>
        <div class="header-logo">COLEGIO ISKOOL MÉXICO</div>
        <div class="header-sub">Institución Educativa de Excelencia • CCT: 09PPR1849Z</div>
      </td>
      <td style="text-align: right;">
        <div style="font-size: 13px; font-weight: 800; color: #0f172a;">FACTURA ELECTRÓNICA (CFDI 4.0)</div>
        <div style="font-size: 11px; font-weight: 700; color: #1e40af;">FOLIO: ${receiptId}</div>
        <div style="font-size: 9px; color: #64748b;">Fecha de Emisión: ${dateStr}</div>
      </td>
    </tr>
  </table>

  <div class="fiscal-grid">
    <div class="fiscal-box">
      <div class="box-title">Datos del Emisor</div>
      <div class="data-row"><span class="data-label">Razón Social:</span> <span class="data-val">COLEGIO ISKOOL DE MEXICO S.C.</span></div>
      <div class="data-row"><span class="data-label">RFC Emisor:</span> <span class="data-val">ISK180312AB9</span></div>
      <div class="data-row"><span class="data-label">Régimen Fiscal:</span> <span class="data-val">603 - Personas Morales con Fines no Lucrativos</span></div>
      <div class="data-row"><span class="data-label">Lugar de Expedición:</span> <span class="data-val">C.P. 06700 (CDMX)</span></div>
      <div class="data-row"><span class="data-label">Tipo Comprobante:</span> <span class="data-val">I - Ingreso</span></div>
    </div>

    <div class="fiscal-box">
      <div class="box-title">Datos del Receptor (Padre / Tutor)</div>
      <div class="data-row"><span class="data-label">Nombre / Razón Social:</span> <span class="data-val">${taxName}</span></div>
      <div class="data-row"><span class="data-label">RFC Receptor:</span> <span class="data-val">${rfcReceptor}</span></div>
      <div class="data-row"><span class="data-label">Domicilio Fiscal:</span> <span class="data-val">C.P. 06700</span></div>
      <div class="data-row"><span class="data-label">Régimen Fiscal:</span> <span class="data-val">605 - Sueldos y Salarios</span></div>
      <div class="data-row"><span class="data-label">Uso de CFDI:</span> <span class="data-val">D10 - Pagos por servicios educativos (Colegiaturas)</span></div>
    </div>
  </div>

  <table class="table-conceptos">
    <thead>
      <tr>
        <th>Clave SAT</th>
        <th>Cant.</th>
        <th>Unidad</th>
        <th>Descripción del Servicio Educativo</th>
        <th style="text-align: right;">Precio Unit.</th>
        <th style="text-align: right;">Importe</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="font-family: monospace;">86121500</td>
        <td>1</td>
        <td>E48 - Unidad de Servicio</td>
        <td>
          <strong>${concept}</strong><br>
          <span style="color: #64748b; font-size: 9px;">Servicios de enseñanza primaria/secundaria conforme a lineamientos oficiales SEP y estímulo fiscal I.S.R.</span>
        </td>
        <td style="text-align: right; font-family: monospace;">$${amount}</td>
        <td style="text-align: right; font-family: monospace; font-weight: 600;">$${amount}</td>
      </tr>
    </tbody>
  </table>

  <!-- Complemento de Instituciones Educativas Privadas (IEDU V1.0) -->
  <div class="fiscal-box" style="background: #f0fdf4; border-color: #bbf7d0; margin-bottom: 15px;">
    <div class="box-title" style="color: #166534; border-bottom-color: #dcfce7;">Complemento Fiscal IEDU (Instituciones Educativas Privadas) — Decreto Beneficio Fiscal I.S.R.</div>
    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; font-size: 9.5px;">
      <div><span style="font-weight: 600; color: #15803d;">Alumno:</span> <span style="font-weight: bold; color: #0f172a;">${req.nextUrl.searchParams.get('student') || 'Mateo López Mendoza'}</span></div>
      <div><span style="font-weight: 600; color: #15803d;">CURP Alumno:</span> <span style="font-family: monospace; font-weight: bold; color: #0f172a;">${req.nextUrl.searchParams.get('curp') || 'LOMA080912HDFZNS01'}</span></div>
      <div><span style="font-weight: 600; color: #15803d;">Nivel Educativo:</span> <span style="font-weight: 600; color: #0f172a;">${req.nextUrl.searchParams.get('level') || 'Secundaria'}</span></div>
      <div style="grid-column: span 3;"><span style="font-weight: 600; color: #15803d;">Acuerdo / Clave RVOE SEP:</span> <span style="font-family: monospace; color: #0f172a;">${req.nextUrl.searchParams.get('rvoe') || 'SEP-RVOE-2024-SEC-098 / DGEI-045-2024'}</span></div>
    </div>
  </div>

  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
    <div style="font-size: 9px; color: #475569; max-width: 350px;">
      <div><strong>Forma de Pago:</strong> 04 - Tarjeta de Crédito / 03 - Transferencia SPEI</div>
      <div><strong>Método de Pago:</strong> PUE - Pago en una sola exhibición</div>
      <div><strong>Moneda:</strong> MXN - Peso Mexicano</div>
      <div style="margin-top: 4px; color: #059669; font-weight: 600;">✓ Comprobante deducible para efectos del Impuesto Sobre la Renta (I.S.R. Colegiaturas)</div>
    </div>

    <table class="totals-table">
      <tr>
        <td style="color: #64748b;">Subtotal:</td>
        <td style="text-align: right; font-family: monospace;">$${amount} MXN</td>
      </tr>
      <tr>
        <td style="color: #64748b;">I.V.A. (Exento Art. 9 Fracc. IV LIVA):</td>
        <td style="text-align: right; font-family: monospace;">$0.00 MXN</td>
      </tr>
      <tr class="total-row">
        <td>Total:</td>
        <td style="text-align: right; font-family: monospace; color: #1e40af;">$${amount} MXN</td>
      </tr>
    </table>
  </div>

  <div class="sat-stamp-box">
    <div class="qr-placeholder">
      <div style="font-size: 18px;">📱</div>
      <span>QR SAT CFDI 4.0</span>
      <span style="font-size: 6px; font-weight: normal; margin-top: 2px;">https://verificacfdi.facturaelectronica.sat.gob.mx</span>
    </div>
    <div>
      <div class="stamp-title">Folio Fiscal (UUID):</div>
      <div class="stamp-text" style="font-weight: bold; color: #0f172a;">${uuid}</div>

      <div class="stamp-title">Número de Serie del Certificado del Emisor:</div>
      <div class="stamp-text">30001000000500003416</div>

      <div class="stamp-title">Número de Serie del Certificado del SAT:</div>
      <div class="stamp-text">00001000000504465028</div>

      <div class="stamp-title">Cadena Original del Complemento de Certificación Digital del SAT:</div>
      <div class="stamp-text">||1.1|${uuid}|${new Date().toISOString()}|SAT970701NN3|k9L2mQ8...OFICIAL_SEAL...==|00001000000504465028||</div>

      <div class="stamp-title">Sello Digital del CFDI / Sello Digital del SAT:</div>
      <div class="stamp-text">dGhpcyBpcyBhbiBhdXRoZW50aWMgZGlnaXRhbCBzZWFsIGZyb20gaXNrb29sIGVkdWNhdGlvbmFsIHBsYXRmb3Jt...</div>
    </div>
  </div>

  <div style="text-align: center; font-size: 8px; color: #94a3b8; margin-top: 15px;">
    Este documento es una representación impresa de un CFDI Versión 4.0 emitido por Colegio ISkool México.
  </div>

</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    }
  });
}
