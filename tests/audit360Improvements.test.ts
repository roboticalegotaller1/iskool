import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import {
  isSafeUploadFileName,
  calculateOptimalDimensions,
  compressImageFile,
} from '@/utils/imageCompressor';
import { isPrivateOrReservedIp } from '@/lib/security/ssrfValidator';
import { isCorruptOrGenericPersonaAnswer } from '@/lib/historicalVaultEngine';
import { transformWikiLinksToHtml } from '@/lib/vaultMarkdownEngine';
import { createSafeLocalStorage } from '@/utils/safeLocalStorage';
import { convertXlsxBufferToCsv } from '@/utils/safeXlsxToCsv';
import { GET as getRedisenosDoc, resolveRedesignDocFile } from '@/app/api/redisenos-docs/route';

describe('Auditoría Quirúrgica Integral 360° — Verificación de Mejoras y Blindaje', () => {
  it('1. Validador de archivos bloquea dobles extensiones peligrosas y respeta SVG / escalado Regla 3', async () => {
    expect(isSafeUploadFileName('evidencia_alumno.webp')).toBe(true);
    expect(isSafeUploadFileName('shell.php.png')).toBe(false);
    expect(isSafeUploadFileName('payload.phtml')).toBe(false);

    const dims = calculateOptimalDimensions(2560, 1440, 1280, 1280);
    expect(dims).toEqual({ width: 1280, height: 720 });

    const svgBlob = new Blob(['<svg xmlns="http://www.w3.org/2000/svg"></svg>'], {
      type: 'image/svg+xml',
    });
    const svgFile = new File([svgBlob], 'logo_institucional.svg', { type: 'image/svg+xml' });
    const processed = await compressImageFile(svgFile);
    expect(processed.name).toBe('logo_institucional.svg');
  });

  it('2. Validador perimetral anti-SSRF bloquea direcciones IPv4-mapeadas sobre IPv6', () => {
    expect(isPrivateOrReservedIp('::ffff:127.0.0.1')).toBe(true);
    expect(isPrivateOrReservedIp('::ffff:169.254.169.254')).toBe(true);
    expect(isPrivateOrReservedIp('::ffff:7f00:1')).toBe(true);
    expect(isPrivateOrReservedIp('::1')).toBe(true);
    expect(isPrivateOrReservedIp('8.8.8.8')).toBe(false);
  });

  it('3. Canon de 1ª persona histórica permite giros legítimos y rechaza muletillas/anacronismos', () => {
    expect(
      isCorruptOrGenericPersonaAnswer(
        'Como dama principal de Querétaro avisé de inmediato a los conjurados sobre el cateo de septiembre de 1810.',
        'Josefa Ortiz de Domínguez'
      )
    ).toBe(false);

    expect(
      isCorruptOrGenericPersonaAnswer(
        'Como General Francisco Villa, afirmo que cabalgué al frente de la División del Norte.',
        'Francisco Villa'
      )
    ).toBe(true);

    expect(
      isCorruptOrGenericPersonaAnswer(
        'En la campaña del norte (1916) defendimos la soberanía con mis Dorados frente a la expedición punitiva.',
        'Francisco Villa'
      )
    ).toBe(false);

    expect(
      isCorruptOrGenericPersonaAnswer(
        'Aparecí en una producción animada moderna (2010) sobre la historia nacional.',
        'Josefa Ortiz de Domínguez'
      )
    ).toBe(true);
  });

  it('4. Bóveda Curricular codifica segmentos anidados sin destruir barras de ruta', () => {
    const html = transformWikiLinksToHtml('Consulta [[Primaria_Fase_3/Plan 01.md|Ver Plan]] hoy.');
    expect(html).toContain('[Ver Plan](/planeaciones/Primaria_Fase_3/Plan%2001)');
  });

  it('5. Almacenamiento seguro Zustand resiste QuotaExceededError sin lanzar excepciones', () => {
    const originalWindow = globalThis.window;
    const mockRemove = new Set<string>();
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        localStorage: {
          length: 1,
          key: () => 'iskool_raw_emails_demo',
          getItem: () => null,
          setItem: () => {
            throw new Error('QuotaExceededError');
          },
          removeItem: (k: string) => {
            mockRemove.add(k);
          },
        },
      },
    });

    try {
      const safeStorage = createSafeLocalStorage();
      expect(() => safeStorage.setItem('iskool_school_admin_store', '{"ok":true}')).not.toThrow();
      expect(mockRemove.has('iskool_raw_emails_demo')).toBe(true);
    } finally {
      Object.defineProperty(globalThis, 'window', {
        configurable: true,
        value: originalWindow,
      });
    }
  });

  it('6. Lector documental /api/redisenos-docs entrega fichas válidas y bloquea path traversal', async () => {
    const validPath = resolveRedesignDocFile('01');
    expect(validPath).toBeTruthy();
    expect(resolveRedesignDocFile('../../package.json')).toBeNull();

    const okReq = new NextRequest('http://localhost:3000/api/redisenos-docs?id=01');
    const okRes = await getRedisenosDoc(okReq);
    expect(okRes.status).toBe(200);
    const okData = await okRes.json();
    expect(okData.success).toBe(true);
    expect(typeof okData.content).toBe('string');
    expect(okData.content.length).toBeGreaterThan(50);

    const traversalReq = new NextRequest('http://localhost:3000/api/redisenos-docs?id=../../package.json');
    const traversalRes = await getRedisenosDoc(traversalReq);
    expect(traversalRes.status).toBe(404);
  });

  it('7. Lector nativo OOXML (.xlsx -> CSV) procesa compresión DEFLATE, rechaza corrupción/exceso y mantiene motor STT intacto', async () => {
    const encoder = new TextEncoder();

    const deflateRaw = async (data: Uint8Array): Promise<Uint8Array> => {
      const cs = new CompressionStream('deflate-raw');
      const writer = cs.writable.getWriter();
      const reader = cs.readable.getReader();
      const writePromise = (async () => {
        await writer.write(new Uint8Array(data));
        await writer.close();
      })();
      const parts: Uint8Array[] = [];
      let total = 0;
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          parts.push(value);
          total += value.byteLength;
        }
      }
      await writePromise;
      const out = new Uint8Array(total);
      let pos = 0;
      for (const p of parts) {
        out.set(p, pos);
        pos += p.byteLength;
      }
      return out;
    };

    const buildTestZip = async (files: Array<{ name: string; content: string }>): Promise<Uint8Array> => {
      const localParts: Uint8Array[] = [];
      const centralParts: Uint8Array[] = [];
      let offset = 0;

      for (const file of files) {
        const nameBytes = encoder.encode(file.name);
        const rawBytes = encoder.encode(file.content);
        const compressed = await deflateRaw(rawBytes);

        const lfh = new Uint8Array(30 + nameBytes.length);
        const lfhView = new DataView(lfh.buffer);
        lfhView.setUint32(0, 0x04034b50, true);
        lfhView.setUint16(4, 20, true);
        lfhView.setUint16(8, 8, true);
        lfhView.setUint32(18, compressed.length, true);
        lfhView.setUint32(22, rawBytes.length, true);
        lfhView.setUint16(26, nameBytes.length, true);
        lfh.set(nameBytes, 30);

        localParts.push(lfh, compressed);

        const cdh = new Uint8Array(46 + nameBytes.length);
        const cdhView = new DataView(cdh.buffer);
        cdhView.setUint32(0, 0x02014b50, true);
        cdhView.setUint16(4, 20, true);
        cdhView.setUint16(6, 20, true);
        cdhView.setUint16(10, 8, true);
        cdhView.setUint32(20, compressed.length, true);
        cdhView.setUint32(24, rawBytes.length, true);
        cdhView.setUint16(28, nameBytes.length, true);
        cdhView.setUint32(42, offset, true);
        cdh.set(nameBytes, 46);

        centralParts.push(cdh);
        offset += lfh.length + compressed.length;
      }

      const centralDirOffset = offset;
      let centralDirSize = 0;
      for (const c of centralParts) centralDirSize += c.length;

      const eocd = new Uint8Array(22);
      const eocdView = new DataView(eocd.buffer);
      eocdView.setUint32(0, 0x06054b50, true);
      eocdView.setUint16(8, files.length, true);
      eocdView.setUint16(10, files.length, true);
      eocdView.setUint32(12, centralDirSize, true);
      eocdView.setUint32(16, centralDirOffset, true);

      const totalSize = centralDirOffset + centralDirSize + eocd.length;
      const archive = new Uint8Array(totalSize);
      let cursor = 0;
      for (const p of localParts) {
        archive.set(p, cursor);
        cursor += p.length;
      }
      for (const c of centralParts) {
        archive.set(c, cursor);
        cursor += c.length;
      }
      archive.set(eocd, cursor);
      return archive;
    };

    const xlsxBytes = await buildTestZip([
      {
        name: '[Content_Types].xml',
        content: '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"></Types>',
      },
      {
        name: 'xl/workbook.xml',
        content: '<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Alumnos" sheetId="1" r:id="rId1"/></sheets></workbook>',
      },
      {
        name: 'xl/_rels/workbook.xml.rels',
        content: '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Target="worksheets/sheet1.xml"/></Relationships>',
      },
      {
        name: 'xl/sharedStrings.xml',
        content: '<?xml version="1.0" encoding="UTF-8"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><si><t>Valentina</t></si><si><t>Hernández &amp; Silva</t></si><si><t>Primaria Torres</t></si><si><t>4º</t></si></sst>',
      },
      {
        name: 'xl/worksheets/sheet1.xml',
        content: '<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="D1" t="s"><v>2</v></c><c r="E1" t="s"><v>3</v></c></row><row r="2"><c r="A2" t="inlineStr"><is><t>Mateo</t></is></c><c r="B2" t="inlineStr"><is><t>Ortiz, Jr.</t></is></c><c r="C2"><v>6</v></c></row></sheetData></worksheet>',
      },
    ]);

    const csv = await convertXlsxBufferToCsv(xlsxBytes);
    expect(csv).toBe('Valentina,Hernández & Silva,,Primaria Torres,4º\nMateo,"Ortiz, Jr.",6');

    await expect(convertXlsxBufferToCsv(encoder.encode('not-a-zip-archive'))).rejects.toThrow();
    await expect(convertXlsxBufferToCsv(xlsxBytes, { maxFileBytes: 128 })).rejects.toThrow();

    const sttMod = await import('@xenova/transformers');
    expect(typeof sttMod.pipeline).toBe('function');
  });
});
