/**
 * Lector nativo seguro de archivos tabulares OOXML (.xlsx) a texto CSV.
 * Opera sin dependencias externas aplicando límites estrictos de tamaño de archivo,
 * volumen descomprimido (protección anti-ZIP-bomb), filas y columnas máximas.
 */

export interface SafeXlsxOptions {
  maxFileBytes?: number;
  maxRows?: number;
  maxCols?: number;
  maxUncompressedEntryBytes?: number;
}

interface ZipCentralEntry {
  name: string;
  compressionMethod: number;
  compressedSize: number;
  uncompressedSize: number;
  localHeaderOffset: number;
}

const DEFAULT_MAX_FILE_BYTES = 5 * 1024 * 1024;
const DEFAULT_MAX_ROWS = 5000;
const DEFAULT_MAX_COLS = 64;
const DEFAULT_MAX_UNCOMPRESSED_BYTES = 15 * 1024 * 1024;

const ZIP_LOCAL_HEADER_SIG = 0x04034b50;
const ZIP_CENTRAL_DIR_SIG = 0x02014b50;
const ZIP_EOCD_SIG = 0x06054b50;

const utf8Decoder = new TextDecoder('utf-8');

function normalizeZipPath(rawPath: string): string {
  const cleaned = rawPath.replace(/\\/g, '/').replace(/^\/+/, '');
  const segments: string[] = [];
  for (const part of cleaned.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') {
      segments.pop();
    } else {
      segments.push(part);
    }
  }
  return segments.join('/');
}

function findEndOfCentralDirectory(view: DataView, byteLength: number): number {
  const minOffset = Math.max(0, byteLength - 65557);
  for (let offset = byteLength - 22; offset >= minOffset; offset--) {
    if (view.getUint32(offset, true) === ZIP_EOCD_SIG) {
      return offset;
    }
  }
  return -1;
}

function parseZipDirectory(bytes: Uint8Array): Map<string, ZipCentralEntry> {
  if (
    bytes.length < 22 ||
    bytes[0] !== 0x50 ||
    bytes[1] !== 0x4b ||
    bytes[2] !== 0x03 ||
    bytes[3] !== 0x04
  ) {
    throw new Error('El archivo no corresponde a un libro de hoja de cálculo .xlsx válido.');
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const eocdOffset = findEndOfCentralDirectory(view, bytes.byteLength);
  if (eocdOffset < 0) {
    throw new Error('Estructura ZIP incompleta o dañada en el libro .xlsx.');
  }

  const entryCount = view.getUint16(eocdOffset + 10, true);
  const centralDirSize = view.getUint32(eocdOffset + 12, true);
  const centralDirOffset = view.getUint32(eocdOffset + 16, true);

  if (centralDirOffset + centralDirSize > bytes.byteLength) {
    throw new Error('Índice central fuera de rango en el libro .xlsx.');
  }

  const entries = new Map<string, ZipCentralEntry>();
  let cursor = centralDirOffset;

  for (let i = 0; i < entryCount && cursor + 46 <= centralDirOffset + centralDirSize; i++) {
    if (view.getUint32(cursor, true) !== ZIP_CENTRAL_DIR_SIG) {
      throw new Error('Registro de directorio central corrupto en el libro .xlsx.');
    }

    const compressionMethod = view.getUint16(cursor + 10, true);
    const compressedSize = view.getUint32(cursor + 20, true);
    const uncompressedSize = view.getUint32(cursor + 24, true);
    const fileNameLen = view.getUint16(cursor + 28, true);
    const extraLen = view.getUint16(cursor + 30, true);
    const commentLen = view.getUint16(cursor + 32, true);
    const localHeaderOffset = view.getUint32(cursor + 42, true);

    const nameStart = cursor + 46;
    const nameEnd = nameStart + fileNameLen;
    if (nameEnd > bytes.byteLength) {
      throw new Error('Nombre de entrada fuera de rango en el libro .xlsx.');
    }

    const name = normalizeZipPath(utf8Decoder.decode(bytes.subarray(nameStart, nameEnd)));
    if (name) {
      entries.set(name, {
        name,
        compressionMethod,
        compressedSize,
        uncompressedSize,
        localHeaderOffset,
      });
    }

    cursor = nameEnd + extraLen + commentLen;
  }

  return entries;
}

async function extractZipEntryBytes(
  bytes: Uint8Array,
  entry: ZipCentralEntry,
  maxUncompressedBytes: number
): Promise<Uint8Array> {
  if (entry.uncompressedSize > maxUncompressedBytes || entry.compressedSize > maxUncompressedBytes) {
    throw new Error(`Entrada "${entry.name}" excede el límite seguro de expansión.`);
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const offset = entry.localHeaderOffset;
  if (offset + 30 > bytes.byteLength || view.getUint32(offset, true) !== ZIP_LOCAL_HEADER_SIG) {
    throw new Error(`Cabecera local inválida para "${entry.name}".`);
  }

  const localNameLen = view.getUint16(offset + 26, true);
  const localExtraLen = view.getUint16(offset + 28, true);
  const dataStart = offset + 30 + localNameLen + localExtraLen;
  const dataEnd = dataStart + entry.compressedSize;

  if (dataEnd > bytes.byteLength) {
    throw new Error(`Contenido comprimido truncado para "${entry.name}".`);
  }

  const compressedSlice = bytes.subarray(dataStart, dataEnd);

  if (entry.compressionMethod === 0) {
    if (compressedSlice.byteLength > maxUncompressedBytes) {
      throw new Error(`Entrada "${entry.name}" supera el tamaño máximo permitido.`);
    }
    return compressedSlice;
  }

  if (entry.compressionMethod !== 8) {
    throw new Error(`Método de compresión no soportado (${entry.compressionMethod}).`);
  }

  const DecompressionStreamCtor = globalThis.DecompressionStream;
  if (typeof DecompressionStreamCtor !== 'function') {
    throw new Error('Entorno sin soporte nativo de descompresión DEFLATE.');
  }

  const stream = new DecompressionStreamCtor('deflate-raw');
  const writer = stream.writable.getWriter();
  const reader = stream.readable.getReader();

  const writePromise = (async () => {
    try {
      await writer.write(new Uint8Array(compressedSlice));
      await writer.close();
    } catch {
      // Si se cancela por exceso de tamaño, el lector ya emitió el error correspondiente
    }
  })();

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value) {
      totalBytes += value.byteLength;
      if (totalBytes > maxUncompressedBytes) {
        await reader.cancel().catch(() => undefined);
        throw new Error(`Expansión excesiva bloqueada en "${entry.name}".`);
      }
      chunks.push(value);
    }
  }

  await writePromise;

  const output = new Uint8Array(totalBytes);
  let pos = 0;
  for (const chunk of chunks) {
    output.set(chunk, pos);
    pos += chunk.byteLength;
  }
  return output;
}

function decodeXmlEntities(raw: string): string {
  return raw.replace(/&(lt|gt|amp|quot|apos|#\d+|#x[0-9a-fA-F]+);/g, (_, entity: string) => {
    switch (entity) {
      case 'lt':
        return '<';
      case 'gt':
        return '>';
      case 'amp':
        return '&';
      case 'quot':
        return '"';
      case 'apos':
        return "'";
      default: {
        const codePoint = entity.startsWith('#x')
          ? Number.parseInt(entity.slice(2), 16)
          : Number.parseInt(entity.slice(1), 10);
        if (!Number.isFinite(codePoint) || codePoint <= 0 || codePoint > 0x10ffff) {
          return '';
        }
        return String.fromCodePoint(codePoint);
      }
    }
  });
}

function getXmlAttribute(attrSource: string, attrName: string): string | null {
  const escapedName = attrName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`(?:^|\\s)${escapedName}="([^"]*)"`).exec(attrSource);
  return match ? decodeXmlEntities(match[1]) : null;
}

function extractTextNodes(xmlFragment: string): string {
  let out = '';
  const textRegex = /<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g;
  let m: RegExpExecArray | null;
  while ((m = textRegex.exec(xmlFragment)) !== null) {
    out += m[1];
  }
  return decodeXmlEntities(out);
}

function parseSharedStrings(xml: string): string[] {
  const strings: string[] = [];
  const siRegex = /<si\b[^>]*>([\s\S]*?)<\/si>/g;
  let m: RegExpExecArray | null;
  while ((m = siRegex.exec(xml)) !== null) {
    const cleaned = m[1].replace(/<rPh\b[^>]*>[\s\S]*?<\/rPh>/g, '');
    strings.push(extractTextNodes(cleaned));
  }
  return strings;
}

async function resolveFirstSheetPath(
  entries: Map<string, ZipCentralEntry>,
  bytes: Uint8Array,
  maxUncompressedBytes: number
): Promise<string> {
  const workbookEntry = entries.get('xl/workbook.xml');
  const relsEntry = entries.get('xl/_rels/workbook.xml.rels');

  if (workbookEntry && relsEntry) {
    const workbookXml = utf8Decoder.decode(
      await extractZipEntryBytes(bytes, workbookEntry, maxUncompressedBytes)
    );
    const relsXml = utf8Decoder.decode(
      await extractZipEntryBytes(bytes, relsEntry, maxUncompressedBytes)
    );

    const firstSheetMatch = /<sheet\b([^>]+)\/?>/.exec(workbookXml);
    const rId = firstSheetMatch ? getXmlAttribute(firstSheetMatch[1], 'r:id') : null;

    if (rId) {
      const relRegex = /<Relationship\b([^>]+)\/?>/g;
      let relMatch: RegExpExecArray | null;
      while ((relMatch = relRegex.exec(relsXml)) !== null) {
        const attrs = relMatch[1];
        if (getXmlAttribute(attrs, 'Id') === rId) {
          const target = getXmlAttribute(attrs, 'Target');
          if (target) {
            const candidate = normalizeZipPath(
              target.startsWith('/') || target.startsWith('xl/') ? target : `xl/${target}`
            );
            if (entries.has(candidate)) {
              return candidate;
            }
          }
        }
      }
    }
  }

  if (entries.has('xl/worksheets/sheet1.xml')) {
    return 'xl/worksheets/sheet1.xml';
  }

  for (const name of entries.keys()) {
    if (name.startsWith('xl/worksheets/') && name.endsWith('.xml')) {
      return name;
    }
  }

  throw new Error('No se encontró ninguna hoja tabular válida en el archivo .xlsx.');
}

function columnLettersToIndex(letters: string): number {
  let index = 0;
  for (let i = 0; i < letters.length; i++) {
    const code = letters.charCodeAt(i);
    if (code < 65 || code > 90) return -1;
    index = index * 26 + (code - 64);
  }
  return index - 1;
}

function formatCsvCell(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function convertXlsxBufferToCsv(
  input: ArrayBuffer | Uint8Array,
  options: SafeXlsxOptions = {}
): Promise<string> {
  const maxFileBytes = options.maxFileBytes ?? DEFAULT_MAX_FILE_BYTES;
  const maxRows = options.maxRows ?? DEFAULT_MAX_ROWS;
  const maxCols = options.maxCols ?? DEFAULT_MAX_COLS;
  const maxUncompressedBytes = options.maxUncompressedEntryBytes ?? DEFAULT_MAX_UNCOMPRESSED_BYTES;

  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  if (bytes.byteLength === 0 || bytes.byteLength > maxFileBytes) {
    throw new Error('El archivo excede el tamaño máximo permitido para lectura segura.');
  }

  const entries = parseZipDirectory(bytes);

  let sharedStrings: string[] = [];
  const sharedStringsEntry = entries.get('xl/sharedStrings.xml');
  if (sharedStringsEntry) {
    const ssBytes = await extractZipEntryBytes(bytes, sharedStringsEntry, maxUncompressedBytes);
    sharedStrings = parseSharedStrings(utf8Decoder.decode(ssBytes));
  }

  const firstSheetPath = await resolveFirstSheetPath(entries, bytes, maxUncompressedBytes);
  const sheetEntry = entries.get(firstSheetPath);
  if (!sheetEntry) {
    throw new Error('No fue posible leer la hoja principal del archivo .xlsx.');
  }

  const sheetXml = utf8Decoder.decode(
    await extractZipEntryBytes(bytes, sheetEntry, maxUncompressedBytes)
  );

  const csvLines: string[] = [];
  const rowRegex = /<row\b[^>]*>([\s\S]*?)<\/row>/g;
  const cellRegex = /<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g;
  let rowMatch: RegExpExecArray | null;
  let parsedRows = 0;

  while (parsedRows < maxRows && (rowMatch = rowRegex.exec(sheetXml)) !== null) {
    parsedRows++;
    const rowContent = rowMatch[1];
    const rowCells: string[] = [];
    let fallbackCol = 0;

    cellRegex.lastIndex = 0;
    let cellMatch: RegExpExecArray | null;
    while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
      const attrs = cellMatch[1];
      const cellBody = cellMatch[2] ?? '';

      const refAttr = getXmlAttribute(attrs, 'r');
      let colIndex = fallbackCol;
      if (refAttr) {
        const colLettersMatch = /^([A-Z]+)\d+$/i.exec(refAttr.trim());
        if (colLettersMatch) {
          const parsedCol = columnLettersToIndex(colLettersMatch[1].toUpperCase());
          if (parsedCol >= 0) colIndex = parsedCol;
        }
      }
      fallbackCol = colIndex + 1;

      if (colIndex < 0 || colIndex >= maxCols) continue;

      let value = '';
      if (cellBody) {
        const cellType = getXmlAttribute(attrs, 't') ?? 'n';
        if (cellType === 'inlineStr') {
          value = extractTextNodes(cellBody);
        } else if (cellType === 'e') {
          value = '';
        } else {
          const vMatch = /<v\b[^>]*>([\s\S]*?)<\/v>/.exec(cellBody);
          const rawValue = vMatch ? decodeXmlEntities(vMatch[1]) : '';
          if (cellType === 's') {
            const strIdx = Number.parseInt(rawValue, 10);
            value = Number.isInteger(strIdx) && strIdx >= 0 ? (sharedStrings[strIdx] ?? '') : '';
          } else if (cellType === 'b') {
            value = rawValue.trim() === '1' ? 'TRUE' : 'FALSE';
          } else {
            value = rawValue;
          }
        }
      }

      rowCells[colIndex] = value;
    }

    let lastNonEmpty = -1;
    for (let i = rowCells.length - 1; i >= 0; i--) {
      if (rowCells[i] !== undefined && rowCells[i] !== '') {
        lastNonEmpty = i;
        break;
      }
    }

    if (lastNonEmpty >= 0) {
      const formatted: string[] = [];
      for (let i = 0; i <= lastNonEmpty; i++) {
        formatted.push(formatCsvCell(rowCells[i] ?? ''));
      }
      csvLines.push(formatted.join(','));
    }
  }

  return csvLines.join('\n');
}
