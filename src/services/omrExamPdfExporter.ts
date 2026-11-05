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
    .replace(/[“”]/g, '"')
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
 * Divide un texto largo en líneas que caben en un ancho máximo de caracteres
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
 * Construye el flujo gráfico PDF de una página de Examen + Hoja Óptica OMR para una Variante (A, B, C o D)
 */
function buildVariantOmrPageStream(
  variant: GeneratedExamVariant,
  params: OmrPdfExportParams
): string {
  const ops: string[] = [];

  // 1. Marcas Fiduciales Ópticas en las 4 esquinas (Alineación de cámara OMR)
  ops.push('0.05 0.08 0.12 rg');
  ops.push('24 752 14 14 re f'); // Superior Izquierda
  ops.push('574 752 14 14 re f'); // Superior Derecha
  ops.push('24 24 14 14 re f'); // Inferior Izquierda
  ops.push('574 24 14 14 re f'); // Inferior Derecha

  // Marco perimetral de lectura óptica
  ops.push('0.75 0.80 0.86 RG 0.8 w');
  ops.push('42 32 528 726 re S');

  // 2. Cabecera Institucional
  ops.push('0.95 0.98 0.96 rg 0.10 0.58 0.42 RG 1 w');
  ops.push('48 696 516 54 re B');

  ops.push(
    pdfTextCmd(
      58,
      735,
      `${params.schoolName.toUpperCase()} (${params.schoolShortName}) - SISTEMA DE EVALUACION OPTICA OMR`,
      8.5,
      true,
      [0.04, 0.42, 0.30]
    )
  );
  ops.push(
    pdfTextCmd(
      58,
      721,
      (params.examTitle || 'Evaluacion Curricular Hibrida SEP NEM').slice(0, 72),
      11,
      true,
      [0.06, 0.09, 0.15]
    )
  );
  ops.push(
    pdfTextCmd(
      58,
      706,
      `Grupo: ${params.groupName}   |   Sello Libreta: Pag. ${params.notebookPage}   |   Penalizacion Error: -${params.penaltyPerError.toFixed(2)} pts`,
      8,
      false,
      [0.25, 0.30, 0.38]
    )
  );

  // Insignia de FILA A/B/C/D a la derecha de la cabecera
  ops.push('0.06 0.48 0.34 rg');
  ops.push('466 703 90 40 re f');
  ops.push(pdfTextCmd(478, 726, `FILA ${variant.variantCode}`, 14, true, [1, 1, 1]));
  ops.push(pdfTextCmd(474, 711, variant.folioCode, 7.5, true, [0.85, 0.98, 0.90]));

  // 3. Bloque de Datos del Alumno y Matriz de Matrícula / Burbujas OMR
  ops.push('0.98 0.99 1.00 rg 0.82 0.86 0.92 RG 0.8 w');
  ops.push('48 534 516 154 re B');

  ops.push(pdfTextCmd(56, 674, '1. DATOS DEL ALUMNO Y MATRIZ DE IDENTIFICACION OPTICA', 8.5, true, [0.1, 0.15, 0.25]));
  ops.push(pdfTextCmd(56, 658, 'Nombre del Alumno(a): ______________________________________________________', 8.5, false));
  ops.push(pdfTextCmd(415, 658, 'No. Lista: [____]   Fecha: ___/___/2026', 8.5, true));
  ops.push(
    pdfTextCmd(
      56,
      643,
      'INSTRUCCION DE CORRECCION LIMPIA: Rellena completamente el circulo (●). Si te equivocas, tacha con X el error y rellena la fila derecha de Correccion.',
      7.2,
      true,
      [0.72, 0.15, 0.20]
    )
  );

  // Encabezados de la Rejilla de Burbujas OMR (Columna Izquierda: Burbujas Principales | Columna Derecha: Burbujas de Corrección Limpia)
  ops.push(pdfTextCmd(58, 626, 'REACTIVO', 7.5, true, [0.2, 0.25, 0.35]));
  ops.push(pdfTextCmd(118, 626, 'RESPUESTA PRINCIPAL (A - D)', 7.5, true, [0.05, 0.45, 0.32]));
  ops.push(pdfTextCmd(295, 626, 'FILA DE CORRECCION LIMPIA (Usar solo si tachaste con X un error)', 7.5, true, [0.75, 0.20, 0.22]));

  const maxOmrRows = Math.min(8, variant.questions.length);
  const letters: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];

  for (let i = 0; i < maxOmrRows; i++) {
    const q = variant.questions[i];
    const rowY = 610 - i * 16;

    // Alternar franja suave por renglón
    if (i % 2 === 0) {
      ops.push('0.94 0.96 0.98 rg');
      ops.push(`54 ${rowY - 4} 504 14 re f`);
    }

    ops.push(pdfTextCmd(62, rowY, `Preg. #${q.variantQuestionNumber}`, 8, true, [0.1, 0.14, 0.22]));

    // 4 Burbujas principales (A, B, C, D)
    letters.forEach((ltr, lIdx) => {
      const cx = 128 + lIdx * 34;
      const cy = rowY + 3;
      ops.push('1 1 1 rg 0.15 0.22 0.32 RG 0.9 w');
      ops.push(pdfCircleCmd(cx, cy, 5.5, true));
      ops.push(pdfTextCmd(cx - 2.6, rowY + 0.5, ltr, 6.8, true, [0.15, 0.22, 0.32]));
    });

    // Separador flecha hacia fila de corrección
    ops.push(pdfTextCmd(268, rowY, '-> Corr:', 7, true, [0.65, 0.25, 0.25]));

    // 4 Burbujas de Corrección Limpia (A, B, C, D)
    letters.forEach((ltr, lIdx) => {
      const cx = 315 + lIdx * 34;
      const cy = rowY + 3;
      ops.push('1 0.98 0.98 rg 0.78 0.28 0.30 RG 0.8 w');
      ops.push(pdfCircleCmd(cx, cy, 5.2, true));
      ops.push(pdfTextCmd(cx - 2.5, rowY + 0.5, ltr, 6.5, true, [0.75, 0.20, 0.22]));
    });

    // Valor en puntos
    ops.push(pdfTextCmd(462, rowY, `(${q.points} pts | Bloom ${q.bloomLevel})`, 7, false, [0.35, 0.4, 0.48]));
  }

  // 4. Cuadernillo de Reactivos Barajados para esta Variante
  ops.push(
    pdfTextCmd(
      48,
      516,
      `2. CUADERNILLO DE REACTIVOS BARAJADOS - FILA ${variant.variantCode} (Semilla Determinista #${variant.seed})`,
      9,
      true,
      [0.06, 0.1, 0.18]
    )
  );

  let cursorY = 498;
  for (let i = 0; i < variant.questions.length; i++) {
    const q = variant.questions[i];
    if (cursorY < 65) break;

    const wrappedStem = wrapTextLines(
      `${q.variantQuestionNumber}. [${q.pdaReference}] ${q.stem}`,
      94
    );

    wrappedStem.forEach((line, lineIdx) => {
      ops.push(
        pdfTextCmd(
          52,
          cursorY,
          line,
          8.3,
          lineIdx === 0,
          lineIdx === 0 ? [0.06, 0.10, 0.18] : [0.15, 0.20, 0.28]
        )
      );
      cursorY -= 11;
    });

    if (q.type === 'open_rubric') {
      ops.push('0.97 0.98 0.99 rg 0.75 0.80 0.88 RG 0.6 w');
      ops.push(`62 ${cursorY - 22} 494 28 re B`);
      ops.push(
        pdfTextCmd(
          68,
          cursorY - 10,
          `Respuesta argumentada (Conceptos clave SEP: ${(q.expectedKeywords || []).join(', ')}):`,
          7.2,
          false,
          [0.35, 0.42, 0.50]
        )
      );
      cursorY -= 32;
    } else {
      // Mostrar opciones A, B, C, D en 2 columnas compactas
      const optA = `A) ${(q.options[0] || '').slice(0, 44)}`;
      const optB = `B) ${(q.options[1] || '').slice(0, 44)}`;
      const optC = `C) ${(q.options[2] || '').slice(0, 44)}`;
      const optD = `D) ${(q.options[3] || '').slice(0, 44)}`;

      ops.push(pdfTextCmd(64, cursorY, optA, 7.8, false, [0.18, 0.22, 0.30]));
      ops.push(pdfTextCmd(316, cursorY, optB, 7.8, false, [0.18, 0.22, 0.30]));
      cursorY -= 11;
      ops.push(pdfTextCmd(64, cursorY, optC, 7.8, false, [0.18, 0.22, 0.30]));
      ops.push(pdfTextCmd(316, cursorY, optD, 7.8, false, [0.18, 0.22, 0.30]));
      cursorY -= 14;
    }
  }

  // 5. Pie de Página Institucional con Sello de Libreta y Folio QR
  ops.push('0.85 0.88 0.92 RG 0.7 w');
  ops.push('48 48 516 0.5 re S');
  ops.push(
    pdfTextCmd(
      52,
      37,
      `Folio OMR: ${variant.folioCode}  |  Sello Fisico: Pag. ${params.notebookPage}  |  Calificacion Optica Determinista (0 Tokens) - ${params.schoolShortName}`,
      7.2,
      true,
      [0.30, 0.36, 0.44]
    )
  );

  return ops.join('\n');
}

/**
 * Construye la página PDF de Clave Maestra del Profesor (Todas las variantes A, B, C y D)
 */
function buildTeacherAnswerKeyPageStream(params: OmrPdfExportParams): string {
  const ops: string[] = [];

  ops.push('0.08 0.12 0.20 rg');
  ops.push('42 696 528 56 re f');
  ops.push(
    pdfTextCmd(
      54,
      734,
      `HOJA MAESTRA DE CLAVES DE RESPUESTA (DOCENTE) - ${params.schoolName.toUpperCase()}`,
      10,
      true,
      [0.45, 0.95, 0.75]
    )
  );
  ops.push(
    pdfTextCmd(
      54,
      718,
      `${params.examTitle}   |   Grupo: ${params.groupName}   |   4 Variantes Anti-Copia (A, B, C, D)`,
      8.8,
      true,
      [1, 1, 1]
    )
  );
  ops.push(
    pdfTextCmd(
      54,
      704,
      `Generado con Algoritmo Determinista Mulberry32 + Fisher-Yates (Consumo: 0 Tokens)   |   Sello Libreta: Pag. ${params.notebookPage}`,
      7.8,
      false,
      [0.80, 0.86, 0.94]
    )
  );

  let y = 668;
  params.variants.forEach((v) => {
    ops.push('0.95 0.97 0.99 rg 0.78 0.84 0.90 RG 0.8 w');
    ops.push(`48 ${y - 42} 516 54 re B`);

    ops.push(
      pdfTextCmd(
        58,
        y - 4,
        `FILA ${v.variantCode}   |   Folio: ${v.folioCode}   |   Semilla: #${v.seed}`,
        9.5,
        true,
        [0.05, 0.42, 0.30]
      )
    );

    const keySummary = v.answerKey
      .map((k) => `Preg ${k.questionNumber}: [${k.correctLetter}] (${k.points}pts)`)
      .join('   |   ');

    ops.push(pdfTextCmd(58, y - 20, keySummary.slice(0, 102), 8, true, [0.12, 0.16, 0.24]));
    if (keySummary.length > 102) {
      ops.push(pdfTextCmd(58, y - 33, keySummary.slice(102, 204), 8, true, [0.12, 0.16, 0.24]));
    }
    y -= 68;
  });

  // Resumen de Explicaciones y Rúbrica Determinista
  const refVariant = params.variants[0];
  if (refVariant) {
    ops.push(
      pdfTextCmd(
        48,
        y - 6,
        'FUNDAMENTACION PEDAGOGICA Y RUBRICA DETERMINISTA POR REACTIVO (FILA BASE A):',
        9,
        true,
        [0.1, 0.15, 0.25]
      )
    );
    y -= 22;

    refVariant.questions.forEach((q) => {
      if (y < 60) return;
      ops.push(
        pdfTextCmd(
          52,
          y,
          `#${q.variantQuestionNumber} (Resp: ${q.correctOptionLetter}) - ${q.stem.slice(0, 82)}`,
          8,
          true,
          [0.08, 0.12, 0.20]
        )
      );
      y -= 11;
      ops.push(
        pdfTextCmd(
          62,
          y,
          `Justificacion SEP: ${(q.explanation || 'Verificado en Boveda Curricular.').slice(0, 92)}`,
          7.5,
          false,
          [0.28, 0.34, 0.42]
        )
      );
      y -= 15;
    });
  }

  return ops.join('\n');
}

/**
 * Construye la página PDF del Acta Oficial de Calificaciones OMR, Kardex SEP y Psicometría
 */
function buildPsychometricsReportPageStream(
  report: ClassroomOmrBatchReport,
  params: OmrPdfExportParams
): string {
  const ops: string[] = [];

  ops.push('0.06 0.38 0.28 rg');
  ops.push('42 696 528 56 re f');
  ops.push(
    pdfTextCmd(
      54,
      734,
      `ACTA OFICIAL DE CALIFICACION OPTICA OMR Y KARDEX SEP - ${params.schoolName.toUpperCase()}`,
      9.8,
      true,
      [1, 1, 1]
    )
  );
  ops.push(
    pdfTextCmd(
      54,
      718,
      `Examen: ${report.examTitle}   |   Grupo: ${report.groupName}`,
      8.8,
      true,
      [0.85, 0.98, 0.92]
    )
  );
  ops.push(
    pdfTextCmd(
      54,
      704,
      `Alumnos Escaneados: ${report.totalStudentsScanned}   |   Promedio Grupal: ${report.averageGrade10}/10   |   Aprobacion: ${report.approvalRatePercent}%   |   Consumo IA: 0 Tokens`,
      7.8,
      false,
      [0.90, 0.96, 0.92]
    )
  );

  // Tabla de Calificaciones por Alumno
  ops.push(
    pdfTextCmd(
      48,
      674,
      '1. PADRON DE CALIFICACIONES INDIVIDUALES (SINCRONIZADO CON KARDEX SEP Y SELLO PAG. ' +
        params.notebookPage +
        ')',
      8.8,
      true,
      [0.08, 0.12, 0.20]
    )
  );

  ops.push('0.90 0.93 0.96 rg');
  ops.push('48 654 516 15 re f');
  ops.push(pdfTextCmd(54, 658, 'NO. / MATRICULA', 7.5, true));
  ops.push(pdfTextCmd(135, 658, 'ALUMNO(A)', 7.5, true));
  ops.push(pdfTextCmd(290, 658, 'FILA', 7.5, true));
  ops.push(pdfTextCmd(325, 658, 'ACIERTOS / ERR / CORR', 7.5, true));
  ops.push(pdfTextCmd(430, 658, 'CALIF. SEP', 7.5, true));
  ops.push(pdfTextCmd(485, 658, 'NIVEL NEM', 7.5, true));

  let y = 640;
  report.studentResults.slice(0, 14).forEach((stu, idx) => {
    if (idx % 2 === 0) {
      ops.push('0.97 0.98 0.99 rg');
      ops.push(`48 ${y - 4} 516 14 re f`);
    }
    ops.push(pdfTextCmd(54, y, `${stu.listNumber}. ${stu.studentId}`, 7.5, false));
    ops.push(pdfTextCmd(135, y, stu.studentName.slice(0, 28), 7.8, true));
    ops.push(pdfTextCmd(294, y, `Fila ${stu.variantCode}`, 7.5, true, [0.05, 0.45, 0.32]));
    ops.push(
      pdfTextCmd(
        325,
        y,
        `${stu.correctCount} OK / ${stu.incorrectCount} Err / ${stu.correctedBubblesCount} Corr`,
        7.5,
        false
      )
    );
    ops.push(pdfTextCmd(438, y, `${stu.finalGrade10.toFixed(1)}`, 8.2, true, [0.06, 0.38, 0.28]));
    ops.push(pdfTextCmd(485, y, stu.masteryLevel.split(' ')[0], 7.2, false));
    y -= 15;
  });

  // Sección 2: Psicometría por Reactivo
  y -= 10;
  ops.push(
    pdfTextCmd(
      48,
      y,
      '2. ANALISIS PSICOMETRICO DE DIFICULTAD Y DISTRACTORES POR REACTIVO (0 TOKENS)',
      8.8,
      true,
      [0.08, 0.12, 0.20]
    )
  );
  y -= 16;

  report.itemPsychometrics.slice(0, 8).forEach((item, idx) => {
    if (y < 75) return;
    ops.push(
      pdfTextCmd(
        54,
        y,
        `Reactivo #${idx + 1}: ${item.correctRatePercent}% Aciertos [${item.difficultyLabel}] - ${item.stem.slice(0, 66)}`,
        7.6,
        true,
        [0.12, 0.16, 0.24]
      )
    );
    y -= 11;
    ops.push(
      pdfTextCmd(
        64,
        y,
        `Distractor mas frecuente detectado: "${item.mostFrequentDistractor.slice(0, 78)}"`,
        7.2,
        false,
        [0.68, 0.20, 0.22]
      )
    );
    y -= 14;
  });

  // Firmas institucionales
  ops.push('0.75 0.80 0.86 RG 0.8 w');
  ops.push('70 52 180 0.5 re S');
  ops.push('350 52 180 0.5 re S');
  ops.push(pdfTextCmd(95, 40, 'Firma Docente Titular SEP', 7.5, true, [0.25, 0.3, 0.38]));
  ops.push(pdfTextCmd(368, 40, `Sello Espejo Ejecutivo CEO (${params.schoolShortName})`, 7.5, true, [0.25, 0.3, 0.38]));

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
      pageStreams.push(buildVariantOmrPageStream(targetVariant, params));
    }
    fileName = `${cleanTitle}_Fila_${targetCode}_OMR.pdf`;
  } else if (params.scope === 'all_4_variants_pack') {
    params.variants.forEach((v) => {
      pageStreams.push(buildVariantOmrPageStream(v, params));
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
      pageStreams.push(buildVariantOmrPageStream(fallback, params));
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

