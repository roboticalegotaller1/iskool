import {
  ClassroomOmrBatchReport,
  ExamVariantCode,
  GeneratedExamVariant
} from './deterministicExamOmrEngine';

export type OmrPdfExportScope =
  | 'single_variant'
  | 'all_4_variants_pack'
  | 'teacher_answer_key'
  | 'psychometrics_kardex_report';

export interface OmrPdfExportParams {
  examTitle: string;
  schoolName: string;
  schoolShortName: string;
  groupName: string;
  notebookPage: number;
  penaltyPerError: number;
  scope: OmrPdfExportScope;
  selectedVariantCode?: ExamVariantCode;
  variants: GeneratedExamVariant[];
  batchReport?: ClassroomOmrBatchReport | null;
  cctCode?: string;
  campusName?: string;
  schoolCycle?: string;
}

/**
 * Convierte una cadena UTF-8 a bytes WinAnsi (CP1252) escapados para literales PDF (...)
 * soportando acentos en español (á, é, í, ó, ú, ñ, Á, É, Í, Ó, Ú, Ñ, ¿, ¡, °).
 */
function encodePdfTextLiteral(input: string): string {
  const sanitized = (input || '')
    .replace(/•/g, '-')
    .replace(/✓/g, 'OK')
    .replace(/✕/g, 'X')
    .replace(/→/g, '->')
    .replace(/—/g, '-')
    .replace(/–/g, '-')
    .replace(/[“”«»]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, '');

  let out = '(';
  for (let i = 0; i < sanitized.length; i++) {
    const code = sanitized.charCodeAt(i);
    const ch = sanitized[i];
    if (ch === '(' || ch === ')' || ch === '\\') {
      out += '\\' + ch;
    } else if (code >= 0x20 && code <= 0x7e) {
      out += ch;
    } else if (code >= 0xa0 && code <= 0xff) {
      out += '\\' + code.toString(8).padStart(3, '0');
    }
  }
  out += ')';
  return out;
}

/**
 * Divide un texto largo en líneas completas sin truncar palabras
 */
function wrapTextLines(text: string, maxCharsPerLine: number): string[] {
  const words = (text || '').trim().split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const w of words) {
    if (!current) {
      current = w;
    } else if ((current + ' ' + w).length <= maxCharsPerLine) {
      current += ' ' + w;
    } else {
      lines.push(current);
      current = w;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [''];
}

/**
 * Dibuja un círculo vectorial en PDF usando 4 curvas de Bézier cúbicas
 */
function pdfCircleCmd(cx: number, cy: number, r: number, fill = false): string {
  const k = 0.552284749831 * r;
  const cmds = [
    `${(cx + r).toFixed(2)} ${cy.toFixed(2)} m`,
    `${(cx + r).toFixed(2)} ${(cy + k).toFixed(2)} ${(cx + k).toFixed(2)} ${(cy + r).toFixed(2)} ${cx.toFixed(2)} ${(cy + r).toFixed(2)} c`,
    `${(cx - k).toFixed(2)} ${(cy + r).toFixed(2)} ${(cx - r).toFixed(2)} ${(cy + k).toFixed(2)} ${(cx - r).toFixed(2)} ${cy.toFixed(2)} c`,
    `${(cx - r).toFixed(2)} ${(cy - k).toFixed(2)} ${(cx - k).toFixed(2)} ${(cy - r).toFixed(2)} ${cx.toFixed(2)} ${(cy - r).toFixed(2)} c`,
    `${(cx + k).toFixed(2)} ${(cy - r).toFixed(2)} ${(cx + r).toFixed(2)} ${(cy - k).toFixed(2)} ${(cx + r).toFixed(2)} ${cy.toFixed(2)} c`,
    fill ? 'B' : 'S'
  ];
  return cmds.join('\n');
}

/**
 * Comando de texto posicionado en coordenadas PDF (F1 = Helvetica, F2 = Helvetica-Bold)
 */
function pdfTextCmd(
  x: number,
  y: number,
  text: string,
  fontSize = 9,
  bold = false,
  rgb: [number, number, number] = [0.08, 0.1, 0.14]
): string {
  const fontRef = bold ? '/F2' : '/F1';
  return [
    'BT',
    `${rgb[0].toFixed(2)} ${rgb[1].toFixed(2)} ${rgb[2].toFixed(2)} rg`,
    `${fontRef} ${fontSize} Tf`,
    `${x.toFixed(2)} ${y.toFixed(2)} Td`,
    `${encodePdfTextLiteral(text)} Tj`,
    'ET'
  ].join('\n');
}

/**
 * Dibuja el Escudo / Emblema Institucional Vectorial Oficial del Colegio en la cabecera del PDF
 */
function drawOfficialSchoolShieldVector(
  x: number,
  y: number,
  schoolShortName: string,
  isIbime: boolean
): string {
  const cmds: string[] = [];
  const primaryRgb: [number, number, number] = isIbime ? [0.06, 0.15, 0.27] : [0.12, 0.20, 0.42];
  const accentRgb: [number, number, number] = isIbime ? [0.89, 0.11, 0.08] : [0.05, 0.48, 0.35];

  // Fondo exterior del escudo académico
  cmds.push(`${primaryRgb[0]} ${primaryRgb[1]} ${primaryRgb[2]} rg 0.85 0.72 0.28 RG 1.2 w`);
  cmds.push(`${x} ${y + 8} 36 38 re B`);

  // Franja heráldica superior (Carmesí IBIME o Esmeralda Institucional)
  cmds.push(`${accentRgb[0]} ${accentRgb[1]} ${accentRgb[2]} rg`);
  cmds.push(`${x + 2} ${y + 34} 32 10 re f`);

  // Libro abierto vectorial al centro del escudo
  cmds.push('1 1 1 rg 0.85 0.72 0.28 RG 0.7 w');
  cmds.push(`${x + 7} ${y + 20} 10 10 re B`);
  cmds.push(`${x + 19} ${y + 20} 10 10 re B`);

  // Monograma oficial en la franja superior y base del escudo
  const monogram = (schoolShortName || 'IBIME').slice(0, 6).toUpperCase();
  cmds.push(pdfTextCmd(x + 4.5, y + 36.5, monogram, 6.8, true, [1, 1, 1]));
  cmds.push(pdfTextCmd(x + 6, y + 11, 'SEP-NEM', 5.8, true, [0.95, 0.85, 0.45]));

  return cmds.join('\n');
}

/**
 * Dibuja el Marco Perimetral OMR, las 4 Marcas Fiduciales y el Membrete Institucional Oficial del Colegio
 */
function drawInstitutionalHeaderAndFrame(
  ops: string[],
  params: OmrPdfExportParams,
  rightBadgeTopText: string,
  rightBadgeSubText: string,
  rightBadgeSeedText?: string
): void {
  const isIbime =
    (params.schoolShortName || '').toUpperCase().includes('IBIME') ||
    (params.schoolName || '').toUpperCase().includes('IBIME');

  const cct = params.cctCode || (isIbime ? '15PPR3322G' : '09PES0248K');
  const campus = params.campusName || (isIbime ? 'Campus Montes (Sede Matriz & CCH UNAM)' : 'Campus Central');
  const cycle = params.schoolCycle || '2025-2026';

  // 1. Marcas Fiduciales Ópticas en las 4 esquinas (Alineación de cámara OMR)
  ops.push('0.05 0.08 0.12 rg');
  ops.push('24 754 13 13 re f'); // Superior Izquierda
  ops.push('575 754 13 13 re f'); // Superior Derecha
  ops.push('24 24 13 13 re f');  // Inferior Izquierda
  ops.push('575 24 13 13 re f');  // Inferior Derecha

  // Marco perimetral de lectura óptica
  ops.push('0.74 0.79 0.85 RG 0.8 w');
  ops.push('42 32 528 728 re S');

  // 2. Cabecera Institucional con Identidad Oficial del Colegio (y = 686..752, alto 66pt)
  if (isIbime) {
    ops.push('0.96 0.98 1.00 rg 0.06 0.15 0.27 RG 1.1 w');
  } else {
    ops.push('0.95 0.98 0.96 rg 0.08 0.48 0.34 RG 1.1 w');
  }
  ops.push('48 686 516 66 re B');

  // Barra superior carmesí/dorada de identidad institucional
  ops.push(isIbime ? '0.89 0.11 0.08 rg' : '0.06 0.42 0.30 rg');
  ops.push('48 748 516 4 re f');

  // Escudo Vectorial Oficial a la izquierda (x=54, y=692)
  ops.push(drawOfficialSchoolShieldVector(54, 692, params.schoolShortName || 'IBIME', isIbime));

  // Textos de Identidad Institucional del Colegio
  ops.push(
    pdfTextCmd(
      98,
      737,
      `${params.schoolName.toUpperCase()} (${params.schoolShortName.toUpperCase()})`,
      9.8,
      true,
      isIbime ? [0.06, 0.15, 0.27] : [0.04, 0.38, 0.28]
    )
  );
  const compactCampus = campus
    .replace(/\s*\(Sede Matriz & CCH UNAM\)/i, ' (Sede Matriz & CCH)')
    .slice(0, 38);
  ops.push(
    pdfTextCmd(
      98,
      725,
      `CCT SEP: ${cct}  |  ${compactCampus}  |  Ciclo ${cycle}`,
      7.0,
      true,
      isIbime ? [0.76, 0.10, 0.08] : [0.18, 0.28, 0.38]
    )
  );
  ops.push(
    pdfTextCmd(
      98,
      712,
      (params.examTitle || 'Evaluacion Curricular Hibrida SEP NEM 2024').slice(0, 68),
      9.6,
      true,
      [0.06, 0.09, 0.15]
    )
  );
  ops.push(
    pdfTextCmd(
      98,
      694,
      `Grupo: ${params.groupName}   |   Sello Libreta: Pag. ${params.notebookPage}   |   Penalizacion Error: -${params.penaltyPerError.toFixed(2)} pts`,
      7.6,
      false,
      [0.24, 0.29, 0.37]
    )
  );

  // Recuadro Derecho: Variante Anti-Copia y Folio OMR
  ops.push(isIbime ? '0.06 0.15 0.27 rg' : '0.06 0.48 0.34 rg');
  ops.push('464 692 94 50 re f');
  ops.push(pdfTextCmd(478, 724, rightBadgeTopText, 12.5, true, [1, 1, 1]));
  ops.push(pdfTextCmd(472, 710, rightBadgeSubText, 7.2, true, [0.90, 0.96, 1.0]));
  if (rightBadgeSeedText) {
    ops.push(pdfTextCmd(472, 698, rightBadgeSeedText, 6.8, false, [0.98, 0.84, 0.42]));
  }
}

/**
 * Dibuja el Pie de Página Institucional Oficial con numeración de página y metadatos verificables
 */
function drawInstitutionalFooter(
  ops: string[],
  params: OmrPdfExportParams,
  folioCode: string,
  pageNum: number,
  totalPagesForVariant: number
): void {
  const isIbime =
    (params.schoolShortName || '').toUpperCase().includes('IBIME') ||
    (params.schoolName || '').toUpperCase().includes('IBIME');
  const cct = params.cctCode || (isIbime ? '15PPR3322G' : '09PES0248K');

  ops.push('0.82 0.86 0.90 RG 0.7 w');
  ops.push('48 48 516 0.5 re S');
  ops.push(
    pdfTextCmd(
      50,
      37,
      `${params.schoolName} (CCT ${cct})  |  Folio OMR: ${folioCode}  |  Sello Libreta: Pag. ${params.notebookPage}  |  0 Tokens`,
      7.0,
      true,
      [0.26, 0.32, 0.40]
    )
  );
  ops.push(
    pdfTextCmd(
      504,
      37,
      `Pag. ${pageNum} de ${totalPagesForVariant}`,
      7.2,
      true,
      [0.10, 0.16, 0.26]
    )
  );
}

/**
 * Construye las páginas PDF (1 o más páginas con paginación automática y CERO superposición)
 * para una Variante (Fila A, B, C o D).
 */
function buildVariantOmrPageStreams(
  variant: GeneratedExamVariant,
  params: OmrPdfExportParams
): string[] {
  const rawPages: Array<(totalPages: number) => string> = [];
  const totalQuestions = variant.questions.length;
  const rowsPerColumn = Math.ceil(totalQuestions / 2);
  const omrRowStep = 13.5;
  const firstOmrRowY = 610;
  const lastOmrRowY = firstOmrRowY - Math.max(0, rowsPerColumn - 1) * omrRowStep;
  // El borde inferior de la caja OMR se calcula dinámicamente debajo del último renglón de burbujas
  const omrBoxTopY = 678;
  const omrBoxBottomY = Math.min(542, lastOmrRowY - 10);
  const omrBoxHeight = omrBoxTopY - omrBoxBottomY;

  let currentOps: string[] = [];
  let pageIndex = 1;

  // Iniciar Página 1 con Cabecera Institucional + Bloque 1 (Hoja Óptica OMR en 2 Columnas)
  drawInstitutionalHeaderAndFrame(
    currentOps,
    params,
    `FILA ${variant.variantCode}`,
    variant.folioCode,
    `Semilla #${variant.seed}`
  );

  // 3. Bloque 1: Datos del Alumno y Matriz Óptica OMR en 2 Columnas (Ajuste Dinámico sin Desborde)
  currentOps.push('0.98 0.99 1.00 rg 0.78 0.83 0.90 RG 0.8 w');
  currentOps.push(`48 ${omrBoxBottomY.toFixed(2)} 516 ${omrBoxHeight.toFixed(2)} re B`);

  currentOps.push(
    pdfTextCmd(
      56,
      664,
      '1. DATOS DEL ALUMNO(A) Y MATRIZ DE LECTURA OPTICA OMR (DOBLE COLUMNA CON CORRECCION LIMPIA)',
      8.2,
      true,
      [0.08, 0.14, 0.25]
    )
  );
  currentOps.push(
    pdfTextCmd(
      56,
      650,
      'Nombre del Alumno(a): ___________________________________________________',
      8.2,
      false
    )
  );
  currentOps.push(
    pdfTextCmd(402, 650, 'No. Lista: [____]   Fecha: ___/___/2026', 8.2, true)
  );
  currentOps.push(
    pdfTextCmd(
      56,
      636,
      'INSTRUCCION DE CORRECCION LIMPIA: Rellena completamente el circulo (O). Si te equivocas, tacha con X el error y rellena la fila derecha (Corr).',
      7.0,
      true,
      [0.72, 0.14, 0.18]
    )
  );

  // Encabezados de las 2 columnas de la Rejilla OMR
  currentOps.push(pdfTextCmd(56, 623, 'REACTIVO', 6.8, true, [0.2, 0.25, 0.35]));
  currentOps.push(pdfTextCmd(96, 623, 'PRINCIPAL (A-D)', 6.8, true, [0.05, 0.45, 0.32]));
  currentOps.push(pdfTextCmd(188, 623, 'CORRECCION (A-D)', 6.8, true, [0.75, 0.20, 0.22]));

  currentOps.push(pdfTextCmd(312, 623, 'REACTIVO', 6.8, true, [0.2, 0.25, 0.35]));
  currentOps.push(pdfTextCmd(352, 623, 'PRINCIPAL (A-D)', 6.8, true, [0.05, 0.45, 0.32]));
  currentOps.push(pdfTextCmd(444, 623, 'CORRECCION (A-D)', 6.8, true, [0.75, 0.20, 0.22]));

  // Línea divisoria vertical entre Columna Izquierda y Columna Derecha OMR
  currentOps.push('0.84 0.88 0.93 RG 0.6 w');
  currentOps.push(`304 ${(omrBoxBottomY + 6).toFixed(2)} 0.5 ${(630 - omrBoxBottomY - 6).toFixed(2)} re S`);

  const letters: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];

  for (let i = 0; i < totalQuestions; i++) {
    const q = variant.questions[i];
    const isRightCol = i >= rowsPerColumn;
    const rowIdx = isRightCol ? i - rowsPerColumn : i;
    const rowY = firstOmrRowY - rowIdx * omrRowStep;
    const baseX = isRightCol ? 312 : 56;

    // Franja alternada por renglón para lectura clara
    if (rowIdx % 2 === 0) {
      currentOps.push('0.94 0.96 0.99 rg');
      currentOps.push(`${baseX - 2} ${(rowY - 3.5).toFixed(2)} 244 11.5 re f`);
    }

    currentOps.push(
      pdfTextCmd(baseX, rowY, `Preg. #${q.variantQuestionNumber}`, 7.4, true, [0.1, 0.14, 0.22])
    );

    // 4 Burbujas Principales (A, B, C, D)
    letters.forEach((ltr, lIdx) => {
      const cx = baseX + 46 + lIdx * 18;
      const cy = rowY + 2.5;
      currentOps.push('1 1 1 rg 0.15 0.22 0.32 RG 0.85 w');
      currentOps.push(pdfCircleCmd(cx, cy, 4.6, true));
      currentOps.push(pdfTextCmd(cx - 2.3, rowY + 0.3, ltr, 6.2, true, [0.15, 0.22, 0.32]));
    });

    // Flecha hacia Corrección Limpia
    currentOps.push(pdfTextCmd(baseX + 116, rowY, 'Corr:', 6.3, true, [0.68, 0.22, 0.22]));

    // 4 Burbujas de Corrección Limpia (A, B, C, D)
    letters.forEach((ltr, lIdx) => {
      const cx = baseX + 140 + lIdx * 18;
      const cy = rowY + 2.5;
      currentOps.push('1 0.98 0.98 rg 0.78 0.28 0.30 RG 0.75 w');
      currentOps.push(pdfCircleCmd(cx, cy, 4.4, true));
      currentOps.push(pdfTextCmd(cx - 2.2, rowY + 0.3, ltr, 6.0, true, [0.75, 0.20, 0.22]));
    });

    // Puntaje compacto a la derecha de la fila
    currentOps.push(
      pdfTextCmd(baseX + 210, rowY, `${q.points}p`, 6.5, false, [0.38, 0.44, 0.52])
    );
  }

  // 4. Inicio del Bloque 2: Cuadernillo de Reactivos Barajados (Estrictamente debajo de omrBoxBottomY)
  let cursorY = omrBoxBottomY - 18;

  currentOps.push('0.06 0.15 0.27 rg');
  currentOps.push(`48 ${(cursorY - 4).toFixed(2)} 516 16 re f`);
  currentOps.push(
    pdfTextCmd(
      54,
      cursorY,
      `2. CUADERNILLO DE REACTIVOS BARAJADOS - FILA ${variant.variantCode} (Semilla Determinista #${variant.seed} • ${totalQuestions} Reactivos)`,
      8.4,
      true,
      [1, 1, 1]
    )
  );
  cursorY -= 18;

  const flushCurrentPageAndStartNew = () => {
    const capturedOps = [...currentOps];
    const capturedPageNum = pageIndex;
    rawPages.push((totalPages) => {
      const pageStream = [...capturedOps];
      drawInstitutionalFooter(pageStream, params, variant.folioCode, capturedPageNum, totalPages);
      return pageStream.join('\n');
    });

    pageIndex += 1;
    currentOps = [];
    drawInstitutionalHeaderAndFrame(
      currentOps,
      params,
      `FILA ${variant.variantCode}`,
      variant.folioCode,
      `Continuacion Pag. ${pageIndex}`
    );

    currentOps.push('0.06 0.15 0.27 rg');
    currentOps.push('48 662 516 16 re f');
    currentOps.push(
      pdfTextCmd(
        54,
        666,
        `2. CUADERNILLO DE REACTIVOS BARAJADOS - FILA ${variant.variantCode} (CONTINUACION - PAGINA ${pageIndex})`,
        8.4,
        true,
        [1, 1, 1]
      )
    );
    cursorY = 646;
  };

  for (let i = 0; i < variant.questions.length; i++) {
    const q = variant.questions[i];
    const wrappedStem = wrapTextLines(
      `${q.variantQuestionNumber}. [${q.pdaReference}] ${q.stem} (${q.points} pts)`,
      94
    );

    const optALines = wrapTextLines(`A) ${q.options[0] || ''}`, 46);
    const optBLines = wrapTextLines(`B) ${q.options[1] || ''}`, 46);
    const optCLines = wrapTextLines(`C) ${q.options[2] || ''}`, 46);
    const optDLines = wrapTextLines(`D) ${q.options[3] || ''}`, 46);

    const rowABLines = Math.max(optALines.length, optBLines.length);
    const rowCDLines = Math.max(optCLines.length, optDLines.length);

    const neededHeight =
      q.type === 'open_rubric'
        ? wrappedStem.length * 10.5 + 36
        : wrappedStem.length * 10.5 + rowABLines * 9.5 + rowCDLines * 9.5 + 10;

    // Si el reactivo no cabe íntegramente antes del pie de página (y = 58), saltar a página nueva
    if (cursorY - neededHeight < 58) {
      flushCurrentPageAndStartNew();
    }

    // Fondo sutil del enunciado del reactivo
    currentOps.push('0.96 0.98 1.00 rg');
    currentOps.push(
      `50 ${(cursorY - (wrappedStem.length - 1) * 10.2 - 3).toFixed(2)} 512 ${(wrappedStem.length * 10.2 + 5).toFixed(2)} re f`
    );

    wrappedStem.forEach((line, lineIdx) => {
      currentOps.push(
        pdfTextCmd(
          54,
          cursorY,
          line,
          8.1,
          lineIdx === 0,
          lineIdx === 0 ? [0.06, 0.10, 0.18] : [0.14, 0.19, 0.27]
        )
      );
      cursorY -= 10.2;
    });

    cursorY -= 1.5;

    if (q.type === 'open_rubric') {
      currentOps.push('0.98 0.99 1.00 rg 0.75 0.80 0.88 RG 0.6 w');
      currentOps.push(`58 ${(cursorY - 22).toFixed(2)} 498 26 re B`);
      currentOps.push(
        pdfTextCmd(
          64,
          cursorY - 9,
          `Respuesta argumentada (Conceptos clave SEP: ${(q.expectedKeywords || []).join(', ')}):`,
          7.2,
          false,
          [0.35, 0.42, 0.50]
        )
      );
      cursorY -= 30;
    } else {
      // Renderizar fila de incisos A) y B) completos (multilínea sin truncar)
      for (let lineIdx = 0; lineIdx < rowABLines; lineIdx++) {
        if (optALines[lineIdx]) {
          currentOps.push(
            pdfTextCmd(
              62,
              cursorY,
              lineIdx === 0 ? optALines[lineIdx] : `    ${optALines[lineIdx]}`,
              7.6,
              lineIdx === 0,
              [0.16, 0.20, 0.28]
            )
          );
        }
        if (optBLines[lineIdx]) {
          currentOps.push(
            pdfTextCmd(
              312,
              cursorY,
              lineIdx === 0 ? optBLines[lineIdx] : `    ${optBLines[lineIdx]}`,
              7.6,
              lineIdx === 0,
              [0.16, 0.20, 0.28]
            )
          );
        }
        cursorY -= 9.4;
      }

      cursorY -= 1.5;

      // Renderizar fila de incisos C) y D) completos (multilínea sin truncar)
      for (let lineIdx = 0; lineIdx < rowCDLines; lineIdx++) {
        if (optCLines[lineIdx]) {
          currentOps.push(
            pdfTextCmd(
              62,
              cursorY,
              lineIdx === 0 ? optCLines[lineIdx] : `    ${optCLines[lineIdx]}`,
              7.6,
              lineIdx === 0,
              [0.16, 0.20, 0.28]
            )
          );
        }
        if (optDLines[lineIdx]) {
          currentOps.push(
            pdfTextCmd(
              312,
              cursorY,
              lineIdx === 0 ? optDLines[lineIdx] : `    ${optDLines[lineIdx]}`,
              7.6,
              lineIdx === 0,
              [0.16, 0.20, 0.28]
            )
          );
        }
        cursorY -= 9.4;
      }

      cursorY -= 5;
    }
  }

  // Cerrar la última página de la variante
  const finalOps = [...currentOps];
  const finalPageNum = pageIndex;
  rawPages.push((totalPages) => {
    const pageStream = [...finalOps];
    drawInstitutionalFooter(pageStream, params, variant.folioCode, finalPageNum, totalPages);
    return pageStream.join('\n');
  });

  const totalVariantPages = rawPages.length;
  return rawPages.map((fn) => fn(totalVariantPages));
}

/**
 * Construye la página PDF de Clave Maestra del Profesor (Todas las variantes A, B, C y D) con Identidad Oficial
 */
function buildTeacherAnswerKeyPageStream(params: OmrPdfExportParams): string {
  const ops: string[] = [];

  drawInstitutionalHeaderAndFrame(
    ops,
    params,
    'CLAVES OMR',
    'FILAS A, B, C, D',
    'USO DOCENTE'
  );

  let y = 666;
  params.variants.forEach((v) => {
    ops.push('0.95 0.97 0.99 rg 0.78 0.84 0.90 RG 0.8 w');
    ops.push(`48 ${y - 40} 516 50 re B`);

    ops.push(
      pdfTextCmd(
        58,
        y - 4,
        `FILA ${v.variantCode}   |   Folio: ${v.folioCode}   |   Semilla Determinista: #${v.seed}`,
        9.0,
        true,
        [0.05, 0.42, 0.30]
      )
    );

    const keySummary = v.answerKey
      .map((k) => `Preg ${k.questionNumber}: [${k.correctLetter}] (${k.points}pts)`)
      .join('   |   ');

    const wrappedKeyLines = wrapTextLines(keySummary, 98);
    wrappedKeyLines.slice(0, 2).forEach((kLine, kIdx) => {
      ops.push(pdfTextCmd(58, y - 18 - kIdx * 12, kLine, 7.8, true, [0.12, 0.16, 0.24]));
    });
    y -= 58;
  });

  // Resumen de Explicaciones y Rúbrica Determinista
  const refVariant = params.variants[0];
  if (refVariant) {
    ops.push(
      pdfTextCmd(
        48,
        y - 4,
        'FUNDAMENTACION PEDAGOGICA Y RUBRICA DETERMINISTA POR REACTIVO (FILA BASE A):',
        8.6,
        true,
        [0.08, 0.14, 0.25]
      )
    );
    y -= 18;

    refVariant.questions.forEach((q) => {
      if (y < 62) return;
      ops.push(
        pdfTextCmd(
          52,
          y,
          `#${q.variantQuestionNumber} (Clave Fila A: ${q.correctOptionLetter}) - ${q.stem.slice(0, 86)}`,
          7.6,
          true,
          [0.08, 0.12, 0.20]
        )
      );
      y -= 10;
      ops.push(
        pdfTextCmd(
          62,
          y,
          `Justificacion SEP: ${(q.explanation || 'Verificado en Boveda Curricular.').slice(0, 96)}`,
          7.1,
          false,
          [0.28, 0.34, 0.42]
        )
      );
      y -= 13;
    });
  }

  drawInstitutionalFooter(ops, params, 'CLAVE-DOCENTE-ABCD', 1, 1);
  return ops.join('\n');
}

/**
 * Construye la página PDF del Acta Oficial de Calificaciones OMR, Kardex SEP y Psicometría con Identidad Oficial
 */
function buildPsychometricsReportPageStream(
  report: ClassroomOmrBatchReport,
  params: OmrPdfExportParams
): string {
  const ops: string[] = [];

  drawInstitutionalHeaderAndFrame(
    ops,
    params,
    `PROM: ${report.averageGrade10}`,
    `APROB: ${report.approvalRatePercent}%`,
    'ACTA KARDEX SEP'
  );

  // Tabla de Calificaciones por Alumno
  ops.push(
    pdfTextCmd(
      48,
      668,
      '1. PADRON DE CALIFICACIONES INDIVIDUALES (SINCRONIZADO CON KARDEX SEP Y SELLO PAG. ' +
        params.notebookPage +
        ')',
      8.6,
      true,
      [0.08, 0.12, 0.20]
    )
  );

  ops.push('0.90 0.93 0.96 rg');
  ops.push('48 648 516 15 re f');
  ops.push(pdfTextCmd(54, 652, 'NO. / MATRICULA', 7.4, true));
  ops.push(pdfTextCmd(135, 652, 'ALUMNO(A)', 7.4, true));
  ops.push(pdfTextCmd(290, 652, 'FILA', 7.4, true));
  ops.push(pdfTextCmd(325, 652, 'ACIERTOS / ERR / CORR', 7.4, true));
  ops.push(pdfTextCmd(430, 652, 'CALIF. SEP', 7.4, true));
  ops.push(pdfTextCmd(485, 652, 'NIVEL NEM', 7.4, true));

  let y = 634;
  report.studentResults.slice(0, 14).forEach((stu, idx) => {
    if (idx % 2 === 0) {
      ops.push('0.97 0.98 0.99 rg');
      ops.push(`48 ${y - 4} 516 14 re f`);
    }
    ops.push(pdfTextCmd(54, y, `${stu.listNumber}. ${stu.studentId}`, 7.4, false));
    ops.push(pdfTextCmd(135, y, stu.studentName.slice(0, 28), 7.6, true));
    ops.push(pdfTextCmd(294, y, `Fila ${stu.variantCode}`, 7.4, true, [0.05, 0.45, 0.32]));
    ops.push(
      pdfTextCmd(
        325,
        y,
        `${stu.correctCount} OK / ${stu.incorrectCount} Err / ${stu.correctedBubblesCount} Corr`,
        7.4,
        false
      )
    );
    ops.push(pdfTextCmd(438, y, `${stu.finalGrade10.toFixed(1)}`, 8.0, true, [0.06, 0.38, 0.28]));
    ops.push(pdfTextCmd(485, y, stu.masteryLevel.split(' ')[0], 7.1, false));
    y -= 14.5;
  });

  // Sección 2: Psicometría por Reactivo
  y -= 8;
  ops.push(
    pdfTextCmd(
      48,
      y,
      '2. ANALISIS PSICOMETRICO DE DIFICULTAD Y DISTRACTORES POR REACTIVO (0 TOKENS)',
      8.6,
      true,
      [0.08, 0.12, 0.20]
    )
  );
  y -= 15;

  report.itemPsychometrics.slice(0, 8).forEach((item, idx) => {
    if (y < 78) return;
    ops.push(
      pdfTextCmd(
        54,
        y,
        `Reactivo #${idx + 1}: ${item.correctRatePercent}% Aciertos [${item.difficultyLabel}] - ${item.stem.slice(0, 68)}`,
        7.5,
        true,
        [0.12, 0.16, 0.24]
      )
    );
    y -= 10.5;
    ops.push(
      pdfTextCmd(
        64,
        y,
        `Distractor mas frecuente detectado: "${item.mostFrequentDistractor.slice(0, 80)}"`,
        7.1,
        false,
        [0.68, 0.20, 0.22]
      )
    );
    y -= 13.5;
  });

  // Firmas institucionales
  ops.push('0.75 0.80 0.86 RG 0.8 w');
  ops.push('70 62 180 0.5 re S');
  ops.push('350 62 180 0.5 re S');
  ops.push(pdfTextCmd(95, 52, 'Firma Docente Titular SEP', 7.4, true, [0.25, 0.3, 0.38]));
  ops.push(pdfTextCmd(368, 52, `Sello Oficial Direccion (${params.schoolShortName})`, 7.4, true, [0.25, 0.3, 0.38]));

  drawInstitutionalFooter(ops, params, 'ACTA-KARDEX-OMR', 1, 1);
  return ops.join('\n');
}

/**
 * Ensambla un archivo binario PDF 1.4 multipágina válido (ISO 32000-1) a partir de una lista de streams de página
 */
export function assembleMultiPagePdfBytes(pageStreams: string[]): Uint8Array {
  const objects: string[] = [];

  // Obj 1: Catalog
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');

  // Obj 2: Pages (se rellena con los IDs de cada página)
  const pageObjIds: number[] = [];
  const firstPageObjId = 5;
  for (let i = 0; i < pageStreams.length; i++) {
    pageObjIds.push(firstPageObjId + i * 2);
  }
  objects.push(
    `2 0 obj\n<< /Type /Pages /Kids [${pageObjIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageStreams.length} >>\nendobj`
  );

  // Obj 3: Font F1 (Helvetica con WinAnsiEncoding para acentos en español)
  objects.push(
    '3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj'
  );

  // Obj 4: Font F2 (Helvetica-Bold con WinAnsiEncoding)
  objects.push(
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj'
  );

  // Añadir pares (Page Obj, Content Stream Obj)
  pageStreams.forEach((streamContent, idx) => {
    const pageId = firstPageObjId + idx * 2;
    const contentId = pageId + 1;

    objects.push(
      `${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>\nendobj`
    );
    objects.push(
      `${contentId} 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream\nendobj`
    );
  });

  // Construir tabla xref con offsets exactos
  let body = '%PDF-1.4\n';
  const offsets: number[] = [0];

  for (const obj of objects) {
    offsets.push(body.length);
    body += obj + '\n';
  }

  const xrefStart = body.length;
  body += `xref\n0 ${objects.length + 1}\n`;
  body += '0000000000 65535 f \n';
  for (let i = 1; i < offsets.length; i++) {
    body += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }

  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  // Codificar cada carácter en un byte (compatible con bytes Latin1/WinAnsi)
  const bytes = new Uint8Array(body.length);
  for (let i = 0; i < body.length; i++) {
    bytes[i] = body.charCodeAt(i) & 0xff;
  }
  return bytes;
}

/**
 * Genera los bytes binarios del documento PDF según el alcance solicitado (0 Tokens)
 */
export function generateOmrExamPdfBytes(params: OmrPdfExportParams): {
  bytes: Uint8Array;
  fileName: string;
  pageCount: number;
} {
  const cleanTitle = (params.examTitle || 'Examen_OMR_SEP')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 36);

  const pageStreams: string[] = [];
  let fileName = `${cleanTitle}_OMR.pdf`;

  if (params.scope === 'single_variant') {
    const targetCode = params.selectedVariantCode || 'A';
    const targetVariant =
      params.variants.find((v) => v.variantCode === targetCode) || params.variants[0];
    if (targetVariant) {
      pageStreams.push(...buildVariantOmrPageStreams(targetVariant, params));
    }
    fileName = `${cleanTitle}_Fila_${targetCode}_OMR.pdf`;
  } else if (params.scope === 'all_4_variants_pack') {
    params.variants.forEach((v) => {
      pageStreams.push(...buildVariantOmrPageStreams(v, params));
    });
    pageStreams.push(buildTeacherAnswerKeyPageStream(params));
    fileName = `${cleanTitle}_Paquete_4_Filas_ABCD_y_Claves_OMR.pdf`;
  } else if (params.scope === 'teacher_answer_key') {
    pageStreams.push(buildTeacherAnswerKeyPageStream(params));
    fileName = `${cleanTitle}_Hoja_Maestra_Claves_Docente.pdf`;
  } else if (params.scope === 'psychometrics_kardex_report' && params.batchReport) {
    pageStreams.push(buildPsychometricsReportPageStream(params.batchReport, params));
    fileName = `${cleanTitle}_Acta_Calificaciones_Kardex_SEP.pdf`;
  } else {
    const fallback = params.variants[0];
    if (fallback) {
      pageStreams.push(...buildVariantOmrPageStreams(fallback, params));
    }
  }

  const bytes = assembleMultiPagePdfBytes(pageStreams);
  return {
    bytes,
    fileName,
    pageCount: pageStreams.length
  };
}

/**
 * Descarga directamente el archivo .pdf en el navegador del docente (0 Tokens)
 */
export function downloadOmrExamPdf(params: OmrPdfExportParams): {
  fileName: string;
  pageCount: number;
  byteLength: number;
} {
  const { bytes, fileName, pageCount } = generateOmrExamPdfBytes(params);

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  return {
    fileName,
    pageCount,
    byteLength: bytes.byteLength
  };
}
