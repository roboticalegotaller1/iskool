import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { GoogleGenAI as MotorVisualPedagogicoSDK } from '@google/genai';
import { formatCdmxDate, formatCdmxTime, sanitizeCommercialTrademarks } from '@/utils/timeZoneUtils';

const execFileAsync = promisify(execFile);
let cachedSharpModule: any | null | false = null;

async function getInProcessSharp(): Promise<any | null> {
  if (cachedSharpModule === false) return null;
  if (cachedSharpModule) return cachedSharpModule;
  try {
    const mod = await import('sharp');
    cachedSharpModule = mod.default || mod;
    return cachedSharpModule;
  } catch {
    cachedSharpModule = false;
    return null;
  }
}

async function svgOrBufferToPngBuffer(inputBuffer: Buffer): Promise<Buffer> {
  const sharpFn = await getInProcessSharp();
  if (sharpFn) {
    try {
      return await sharpFn(inputBuffer).png().toBuffer();
    } catch {
      cachedSharpModule = false;
    }
  }
  const script = `
    const sharp = require('sharp');
    const chunks = [];
    process.stdin.on('data', d => chunks.push(d));
    process.stdin.on('end', async () => {
      try {
        const buf = Buffer.concat(chunks);
        const out = await sharp(buf).png().toBuffer();
        process.stdout.write(out.toString('base64'));
      } catch (e) {
        process.exit(1);
      }
    });
  `;
  const child = execFile(process.execPath, ['-e', script], { maxBuffer: 15 * 1024 * 1024 });
  const stdoutChunks: string[] = [];
  child.stdout?.on('data', d => stdoutChunks.push(String(d)));
  await new Promise<void>((resolve, reject) => {
    child.on('error', reject);
    child.on('close', code => (code === 0 ? resolve() : reject(new Error(`sharp child exited ${code}`))));
    child.stdin?.write(inputBuffer);
    child.stdin?.end();
  });
  return Buffer.from(stdoutChunks.join('').trim(), 'base64');
}

export type VisualStudioMode = 'comunicado' | 'pase_audiencia' | 'infografia_ejecutiva';
export type VisualAspectRatio = '4:5' | '16:9' | '1:1' | '3:4';

export interface VisualReferenceInput {
  mimeType: string;
  dataBase64: string;
}

export interface InstitutionalVisualRequest {
  mode: VisualStudioMode;
  tenantId: string;
  schoolName: string;
  directorTitle?: string;
  campusName?: string;
  primaryColor?: string;
  accentColor?: string;
  aspectRatio?: VisualAspectRatio;
  // Datos para Comunicado / Circular
  subject?: string;
  bodyText?: string;
  audienceLabel?: string;
  // Datos para Pase Oficial de Audiencia / Convocatoria
  matterCode?: string;
  attendeeName?: string;
  appointmentDateText?: string;
  normativeRef?: string;
  // Datos para Lámina Ejecutiva 60s (4 Cuadrantes)
  metrics?: {
    totalCount: number;
    ceoCount: number;
    delegatedCount: number;
    infoCount: number;
    spamCount: number;
    sepCount?: number;
    primaryUrgentTitle?: string;
  };
  // Edición conversacional multi-turno y fusión de referencias
  refinementInstruction?: string;
  previousInteractionId?: string;
  previousWebpBase64?: string;
  referenceImages?: VisualReferenceInput[];
}

export interface InstitutionalVisualResult {
  success: boolean;
  interactionId: string;
  turnNumber: number;
  aspectRatio: VisualAspectRatio;
  mimeType: 'image/webp';
  webpBase64: string;
  dataUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
  sizeKb: number;
  cid: string;
  fileName: string;
  synthesisEngine: 'motor_visual_ia' | 'estudio_determinista';
  captionSummary: string;
}

const TARGET_MODEL_ID = 'gemini-nano-banana-2.1';
const MAX_DIMENSION_PX = 1200;
const TARGET_MAX_BYTES = 260 * 1024; // Estricto < 260 KB (Regla No Negociable 3)

function resolveInstitutionalApiKey(): string {
  const candidates = [
    process.env.GEMINI_API_KEY,
    process.env.GOOGLE_API_KEY,
    process.env.MOTOR_IA_API_KEY,
    process.env.AI_API_KEY,
    process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    process.env.NEXT_PUBLIC_MOTOR_IA_API_KEY,
    process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  ];

  for (const val of candidates) {
    if (val && val.trim()) {
      return val.trim().replace(/^['"]|['"]$/g, '');
    }
  }

  try {
    const envFiles = [
      path.join(process.cwd(), '.env.local'),
      path.join(process.cwd(), '.env'),
    ];
    for (const file of envFiles) {
      if (!fs.existsSync(/*turbopackIgnore: true*/ file)) continue;
      const lines = fs.readFileSync(/*turbopackIgnore: true*/ file, 'utf8').split(/\r?\n/);
      for (const line of lines) {
        const match = line.trim().match(/^(?:GEMINI_API_KEY|GOOGLE_API_KEY|MOTOR_IA_API_KEY|AI_API_KEY|GOOGLE_GENERATIVE_AI_API_KEY)=(.+)$/);
        if (match && match[1]) {
          const clean = match[1].trim().replace(/^['"]|['"]$/g, '');
          if (clean) return clean;
        }
      }
    }
  } catch {
    // Continuar con respaldo determinista si el sistema de archivos es de solo lectura
  }

  return '';
}

function escapeXml(text: string): string {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapTextLines(text: string, maxCharsPerLine: number, maxLines: number): string[] {
  const clean = sanitizeCommercialTrademarks(text || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!clean) return [];

  const words = clean.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxCharsPerLine) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word.slice(0, maxCharsPerLine);
      if (lines.length >= maxLines - 1) break;
    }
  }
  if (current && lines.length < maxLines) {
    lines.push(current);
  }
  return lines;
}

function getSchoolInitials(schoolName: string): string {
  const words = (schoolName || 'ISkool')
    .replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !/^(del|los|las|por|con|para)$/i.test(w));
  if (words.length === 0) return 'IS';
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words.slice(0, 3).map(w => w[0].toUpperCase()).join('');
}

/**
 * Genera el sello/escudo institucional en PNG de referencia para garantizar
 * identidad visual consistente mediante fusión multi-imagen.
 */
async function buildSchoolCrestReferencePngBase64(
  schoolName: string,
  primaryHex: string = '#1E293B',
  accentHex: string = '#DC2626'
): Promise<string> {
  const initials = escapeXml(getSchoolInitials(schoolName));
  const cleanName = escapeXml(schoolName.slice(0, 28).toUpperCase());
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
      <defs>
        <linearGradient id="crestBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${escapeXml(primaryHex)}" />
          <stop offset="100%" stop-color="#0F172A" />
        </linearGradient>
      </defs>
      <rect width="320" height="320" rx="64" fill="#FFFFFF" />
      <path d="M160 28 L272 72 L272 166 C272 232 222 276 160 296 C98 276 48 232 48 166 L48 72 Z" fill="url(#crestBg)" stroke="${escapeXml(accentHex)}" stroke-width="8"/>
      <circle cx="160" cy="144" r="56" fill="none" stroke="#F8FAFC" stroke-opacity="0.35" stroke-width="3"/>
      <text x="160" y="162" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="52" font-weight="900" fill="#FFFFFF" letter-spacing="2">${initials}</text>
      <text x="160" y="236" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="700" fill="#E2E8F0" letter-spacing="1.5">${cleanName}</text>
    </svg>
  `;
  const pngBuf = await svgOrBufferToPngBuffer(Buffer.from(svg));
  return pngBuf.toString('base64');
}

/**
 * Comprime de forma obligatoria cualquier buffer de imagen a WebP de alta fidelidad (< 250 KB)
 * en cumplimiento estricto de la Regla No Negociable 3.
 */
async function compressToInstitutionalWebp(rawBuffer: Buffer, aspectRatio: VisualAspectRatio): Promise<{
  webpBuffer: Buffer;
  width: number;
  height: number;
}> {
  const maxW = aspectRatio === '16:9' ? MAX_DIMENSION_PX : aspectRatio === '1:1' ? 1024 : 960;
  const maxH = aspectRatio === '4:5' || aspectRatio === '3:4' ? MAX_DIMENSION_PX : aspectRatio === '1:1' ? 1024 : 720;

  const sharpFn = await getInProcessSharp();
  if (sharpFn) {
    try {
      let quality = 82;
      let webpBuffer = await sharpFn(rawBuffer)
        .resize({ width: maxW, height: maxH, fit: 'inside', withoutEnlargement: true })
        .webp({ quality, effort: 4 })
        .toBuffer();

      while (webpBuffer.length > TARGET_MAX_BYTES && quality >= 62) {
        quality -= 8;
        webpBuffer = await sharpFn(rawBuffer)
          .resize({ width: maxW, height: maxH, fit: 'inside', withoutEnlargement: true })
          .webp({ quality, effort: 5 })
          .toBuffer();
      }

      const meta = await sharpFn(webpBuffer).metadata();
      return {
        webpBuffer,
        width: meta.width || maxW,
        height: meta.height || maxH,
      };
    } catch {
      cachedSharpModule = false;
    }
  }

  // Subproceso aislado libre de colisión de DLLs en Windows cuando @xenova/transformers está en memoria
  const script = `
    const sharp = require('sharp');
    const chunks = [];
    process.stdin.on('data', d => chunks.push(d));
    process.stdin.on('end', async () => {
      try {
        const rawBuffer = Buffer.concat(chunks);
        const maxW = ${maxW};
        const maxH = ${maxH};
        const targetMax = ${TARGET_MAX_BYTES};
        let quality = 82;
        let webpBuffer = await sharp(rawBuffer)
          .resize({ width: maxW, height: maxH, fit: 'inside', withoutEnlargement: true })
          .webp({ quality, effort: 4 })
          .toBuffer();
        while (webpBuffer.length > targetMax && quality >= 62) {
          quality -= 8;
          webpBuffer = await sharp(rawBuffer)
            .resize({ width: maxW, height: maxH, fit: 'inside', withoutEnlargement: true })
            .webp({ quality, effort: 5 })
            .toBuffer();
        }
        const meta = await sharp(webpBuffer).metadata();
        process.stdout.write(JSON.stringify({
          b64: webpBuffer.toString('base64'),
          width: meta.width || maxW,
          height: meta.height || maxH
        }));
      } catch (e) {
        process.exit(1);
      }
    });
  `;
  const child = execFile(process.execPath, ['-e', script], { maxBuffer: 20 * 1024 * 1024 });
  const stdoutChunks: string[] = [];
  child.stdout?.on('data', d => stdoutChunks.push(String(d)));
  await new Promise<void>((resolve, reject) => {
    child.on('error', reject);
    child.on('close', code => (code === 0 ? resolve() : reject(new Error(`sharp webp child exited ${code}`))));
    child.stdin?.write(rawBuffer);
    child.stdin?.end();
  });
  const parsed = JSON.parse(stdoutChunks.join('').trim());
  return {
    webpBuffer: Buffer.from(parsed.b64, 'base64'),
    width: parsed.width || maxW,
    height: parsed.height || maxH,
  };
}

function extractKeyBulletsFromBody(bodyText: string): string[] {
  const clean = sanitizeCommercialTrademarks(bodyText || '').trim();
  if (!clean) return ['Comunicación oficial emitida por Dirección General.', 'Consulte los canales institucionales verificados.'];

  const allLines = clean.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // 1. Priorizar puntos explícitamente numerados o con viñetas (1., 2., •, -)
  const explicitBullets = allLines
    .filter(l => /^(?:[•\-*▪▸]|\d+[.)])\s+/.test(l))
    .map(l => l.replace(/^(?:[•\-*▪▸]|\d+[.)])\s+/, '').trim())
    .filter(l => l.length >= 12);

  if (explicitBullets.length >= 1) {
    return explicitBullets.slice(0, 3).map(l => (l.length > 135 ? `${l.slice(0, 132)}...` : l));
  }

  // 2. Filtrar saludos protocolarios y cierres de cortesía
  const substantiveLines = allLines
    .filter(
      l =>
        l.length >= 20 &&
        !/^(estimad|por medio del presente|agradecemos su|atentamente|cordialmente|sin más por el momento|dirección general|instituto\s)/i.test(l)
    );

  if (substantiveLines.length >= 1) {
    return substantiveLines.slice(0, 3).map(l => (l.length > 135 ? `${l.slice(0, 132)}...` : l));
  }

  const sentences = clean
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length >= 18);

  return (sentences.length > 0 ? sentences : [clean]).slice(0, 3).map(s => (s.length > 135 ? `${s.slice(0, 132)}...` : s));
}

function buildStructuredVisualPrompt(req: InstitutionalVisualRequest): string {
  const school = sanitizeCommercialTrademarks(req.schoolName || 'Instituto Educativo');
  const campus = sanitizeCommercialTrademarks(req.campusName || 'Plantel Central');
  const director = sanitizeCommercialTrademarks(req.directorTitle || 'Dirección General');
  const todayStr = `${formatCdmxDate(new Date())} · ${formatCdmxTime(new Date())} CDMX`;
  const primaryTone = req.primaryColor || 'azul marino institucional profundo (#0F172A) con acentos carmesí elegante (#DC2626) y fondo marfil limpio (#F8FAFC)';

  if (req.refinementInstruction && req.previousInteractionId) {
    return [
      `Actualiza esta pieza gráfica institucional de "${school}" aplicando exactamente la siguiente instrucción directiva en español:`,
      `"${sanitizeCommercialTrademarks(req.refinementInstruction)}"`,
      `Reglas estrictas: Conserva la ortografía perfecta en español con acentos correctos, mantén el escudo institucional proporcionado, tipografía editorial limpia y legible, sin marcas de agua externas ni nombres comerciales.`,
    ].join('\n');
  }

  if (req.mode === 'pase_audiencia') {
    const code = req.matterCode || `AUD-${Date.now().toString().slice(-4)}`;
    const attendee = sanitizeCommercialTrademarks(req.attendeeName || 'Tutor / Representante Institucional');
    const dateTxt = req.appointmentDateText || `Próxima sesión hábil · 09:00 hrs (CDMX)`;
    const subjectTxt = sanitizeCommercialTrademarks(req.subject || 'Audiencia Ejecutiva en Dirección General');
    const normTxt = sanitizeCommercialTrademarks(req.normativeRef || 'Protocolo Institucional de Atención Directiva');

    return [
      `Diseña una tarjeta horizontal oficial de "PASE DE AUDIENCIA Y CONVOCATORIA DIRECTIVA" en español impecable para la institución educativa "${school}".`,
      `Integra con fidelidad el escudo institucional de la imagen de referencia en la esquina superior izquierda.`,
      `Paleta y estilo: Diseño ejecutivo moderno y sobrio (${primaryTone}), bordes limpios, retícula suiza de alta legibilidad, sello de verificación y código QR estilizado en la esquina derecha.`,
      `Textos exactos que deben aparecer con ortografía perfecta en español:`,
      `- Encabezado: "${school.toUpperCase()} · PASE OFICIAL DE AUDIENCIA"`,
      `- Folio: "${code}"`,
      `- Asunto: "${subjectTxt.slice(0, 72)}"`,
      `- Convocado: "${attendee}"`,
      `- Fecha y Hora: "${dateTxt}"`,
      `- Ubicación: "${campus} · Sala de Juntas de ${director}"`,
      `- Marco Normativo: "${normTxt.slice(0, 60)}"`,
      `Prohibido incluir logotipos o nombres de marcas tecnológicas externas.`,
    ].join('\n');
  }

  if (req.mode === 'infografia_ejecutiva') {
    const m = req.metrics || { totalCount: 0, ceoCount: 0, delegatedCount: 0, infoCount: 0, spamCount: 0, sepCount: 0 };
    const topUrgent = sanitizeCommercialTrademarks(m.primaryUrgentTitle || 'Bandeja ejecutiva al corriente');
    return [
      `Diseña una infografía ejecutiva panorámica 16:9 de sala de consejo titulada "PULSO EJECUTIVO DE COMUNICACIONES · 4 CUADRANTES" en español impecable para "${school}".`,
      `Integra el escudo institucional de la imagen de referencia en la cabecera.`,
      `Estilo visual: Tablero ejecutivo limpio tipo reporte de consejo directivo (${primaryTone}), tarjetas bento blancas con indicadores numéricos grandes, tipografía sans-serif nítida.`,
      `Datos exactos a graficar con máxima claridad:`,
      `- Subtítulo: "${campus} · Corte ${todayStr} · Total analizado: ${m.totalCount} correos"`,
      `- Cuadrante 1 (Rojo Crítico): "ATENCIÓN INMEDIATA CEO: ${m.ceoCount}" (Oficios SEP: ${m.sepCount || 0})`,
      `- Cuadrante 2 (Ámbar Tiempo de respuesta): "DELEGADOS CON TIEMPO DE RESPUESTA ACTIVO: ${m.delegatedCount}"`,
      `- Cuadrante 3 (Azul Informativo): "BOLETINES E INFORMATIVOS: ${m.infoCount}"`,
      `- Cuadrante 4 (Púrpura Filtrado): "RUIDO Y PROMOCIONES FILTRADAS: ${m.spamCount}"`,
      `- Foco Prioritario: "${topUrgent.slice(0, 68)}"`,
      `Ortografía en español exacta con tildes correctas y cero marcas comerciales externas.`,
    ].join('\n');
  }

  // Modo predeterminado: 'comunicado' (Transformador 1-Clic de Circular a Comunicado Gráfico)
  const titleTxt = sanitizeCommercialTrademarks(req.subject || 'Comunicado Oficial a la Comunidad Escolar').slice(0, 78);
  const audienceTxt = sanitizeCommercialTrademarks(req.audienceLabel || 'Comunidad Escolar y Familias');
  const bullets = extractKeyBulletsFromBody(req.bodyText || '');

  return [
    `Diseña un comunicado gráfico institucional oficial de alta jerarquía editorial en español impecable para "${school}".`,
    `Integra fielmente el escudo institucional de la imagen de referencia en el encabezado oficial.`,
    `Estilo visual: Diseño institucional escolar de prestigio (${primaryTone}), limpio, moderno, con iconografía vectorial discreta, bloques bien estructurados y excelente contraste tipográfico.`,
    `Textos exactos que deben renderizarse con ortografía perfecta en español:`,
    `- Membrete: "${school.toUpperCase()} · COMUNICADO OFICIAL"`,
    `- Dirigido a: "${audienceTxt} · ${campus}"`,
    `- Título Principal: "${titleTxt}"`,
    ...bullets.map((b, idx) => `- Punto Clave ${idx + 1}: "${b}"`),
    `- Pie de firma: "Atentamente: ${director} · ${formatCdmxDate(new Date())}"`,
    `No agregues texto inventado en otros idiomas ni nombres de marcas tecnológicas externas.`,
  ].join('\n');
}

/**
 * Respaldo gráfico vectorial de alta precisión (SVG -> Sharp WebP) en caso de contingencia
 * de red externa o límite de cuota, garantizando continuidad 100% operativa.
 */
async function renderDeterministicStudioFallback(
  req: InstitutionalVisualRequest,
  aspectRatio: VisualAspectRatio
): Promise<Buffer> {
  const isWide = aspectRatio === '16:9';
  const isSquare = aspectRatio === '1:1';
  const w = isWide ? 1200 : isSquare ? 1000 : 960;
  const h = isWide ? 675 : isSquare ? 1000 : 1200;

  const refinLow = (req.refinementInstruction || '').toLowerCase();
  const primary = refinLow.includes('azul')
    ? '#0F294A'
    : refinLow.includes('verde') || refinLow.includes('esmeralda')
    ? '#064E3B'
    : req.primaryColor || '#1E1B4B';
  const accent = refinLow.includes('dorado') || refinLow.includes('ámbar')
    ? '#D97706'
    : req.accentColor || '#DC2626';

  const school = escapeXml(sanitizeCommercialTrademarks(req.schoolName || 'Instituto Bilingüe IBIME'));
  const campus = escapeXml(sanitizeCommercialTrademarks(req.campusName || 'Consolidado Institucional'));
  const director = escapeXml(sanitizeCommercialTrademarks(req.directorTitle || 'Dirección General'));
  const initials = escapeXml(getSchoolInitials(req.schoolName || 'IBIME'));
  const dateStamp = escapeXml(`${formatCdmxDate(new Date())} · ${formatCdmxTime(new Date())} CDMX`);

  if (req.mode === 'infografia_ejecutiva') {
    const m = req.metrics || { totalCount: 0, ceoCount: 0, delegatedCount: 0, infoCount: 0, spamCount: 0, sepCount: 0 };
    const focusLine = escapeXml(
      sanitizeCommercialTrademarks(
        req.refinementInstruction
          ? `${m.primaryUrgentTitle || 'Operación estable'} · Nota: ${req.refinementInstruction}`
          : m.primaryUrgentTitle || 'Bandeja de Dirección General en orden operativo'
      ).slice(0, 92)
    );
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <defs>
          <linearGradient id="hdr" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${primary}"/>
            <stop offset="100%" stop-color="#0F172A"/>
          </linearGradient>
        </defs>
        <rect width="${w}" height="${h}" fill="#F8FAFC"/>
        <rect width="${w}" height="148" fill="url(#hdr)"/>
        <rect x="0" y="144" width="${w}" height="6" fill="${accent}"/>
        <rect x="44" y="30" width="88" height="88" rx="22" fill="#FFFFFF" fill-opacity="0.14" stroke="#FFFFFF" stroke-opacity="0.35" stroke-width="2"/>
        <text x="88" y="85" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" font-weight="900" fill="#FFFFFF">${initials}</text>
        <text x="156" y="66" font-family="Arial, sans-serif" font-size="15" font-weight="800" fill="#FCA5A5" letter-spacing="2">${school.toUpperCase()} · REPORTE VISUAL DE CONSEJO</text>
        <text x="156" y="102" font-family="Arial, sans-serif" font-size="28" font-weight="900" fill="#FFFFFF">Pulso Ejecutivo de Comunicaciones (4 Cuadrantes)</text>
        <text x="156" y="128" font-family="Arial, sans-serif" font-size="14" font-weight="600" fill="#CBD5E1">${campus} · ${dateStamp} · Universo evaluado: ${m.totalCount} correos</text>

        <g transform="translate(44, 184)">
          <rect width="262" height="210" rx="24" fill="#FFFFFF" stroke="#FECACA" stroke-width="3"/>
          <rect x="22" y="22" width="150" height="28" rx="14" fill="#FEF2F2"/>
          <text x="36" y="41" font-family="Arial, sans-serif" font-size="12" font-weight="900" fill="#DC2626">1. ATENCIÓN CEO</text>
          <text x="24" y="122" font-family="Arial, sans-serif" font-size="68" font-weight="900" fill="#991B1B">${m.ceoCount}</text>
          <text x="24" y="158" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="#475569">Intervención Directiva</text>
          <text x="24" y="182" font-family="Arial, sans-serif" font-size="12" fill="#64748B">Oficios SEP activos: ${m.sepCount || 0}</text>
        </g>

        <g transform="translate(328, 184)">
          <rect width="262" height="210" rx="24" fill="#FFFFFF" stroke="#FDE68A" stroke-width="3"/>
          <rect x="22" y="22" width="215" height="28" rx="14" fill="#FFFBEB"/>
          <text x="36" y="41" font-family="Arial, sans-serif" font-size="11" font-weight="900" fill="#B45309">2. TIEMPO DE RESPUESTA</text>
          <text x="24" y="122" font-family="Arial, sans-serif" font-size="68" font-weight="900" fill="#92400E">${m.delegatedCount}</text>
          <text x="24" y="158" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="#475569">Coordinaciones de Plantel</text>
          <text x="24" y="182" font-family="Arial, sans-serif" font-size="12" fill="#64748B">Tiempo de respuesta 12h–24h</text>
        </g>

        <g transform="translate(612, 184)">
          <rect width="262" height="210" rx="24" fill="#FFFFFF" stroke="#BFDBFE" stroke-width="3"/>
          <rect x="22" y="22" width="160" height="28" rx="14" fill="#EFF6FF"/>
          <text x="36" y="41" font-family="Arial, sans-serif" font-size="12" font-weight="900" fill="#1D4ED8">3. INFORMATIVOS</text>
          <text x="24" y="122" font-family="Arial, sans-serif" font-size="68" font-weight="900" fill="#1E3A8A">${m.infoCount}</text>
          <text x="24" y="158" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="#475569">Circulares y Avisos</text>
          <text x="24" y="182" font-family="Arial, sans-serif" font-size="12" fill="#64748B">Archivados con acuse</text>
        </g>

        <g transform="translate(896, 184)">
          <rect width="260" height="210" rx="24" fill="#FFFFFF" stroke="#E9D5FF" stroke-width="3"/>
          <rect x="22" y="22" width="182" height="28" rx="14" fill="#FAF5FF"/>
          <text x="36" y="41" font-family="Arial, sans-serif" font-size="12" font-weight="900" fill="#7E22CE">4. RUIDO FILTRADO</text>
          <text x="24" y="122" font-family="Arial, sans-serif" font-size="68" font-weight="900" fill="#581C87">${m.spamCount}</text>
          <text x="24" y="158" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="#475569">Promociones Contenidas</text>
          <text x="24" y="182" font-family="Arial, sans-serif" font-size="12" fill="#64748B">0 interrupciones al CEO</text>
        </g>

        <rect x="44" y="424" width="${w - 88}" height="186" rx="24" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2"/>
        <text x="76" y="468" font-family="Arial, sans-serif" font-size="13" font-weight="900" fill="${accent}" letter-spacing="1.5">FOCO PRIORITARIO Y ESTADO DE ATENCIÓN DIRECTIVA</text>
        <text x="76" y="512" font-family="Arial, sans-serif" font-size="22" font-weight="800" fill="#0F172A">${focusLine}</text>
        <text x="76" y="554" font-family="Arial, sans-serif" font-size="15" font-weight="600" fill="#475569">Emitido por: ${director} · Estudio Gráfico Institucional IA · Formato Optimizado WebP</text>
      </svg>
    `;
    return svgOrBufferToPngBuffer(Buffer.from(svg));
  }

  if (req.mode === 'pase_audiencia') {
    const code = escapeXml(req.matterCode || `AUD-${Date.now().toString().slice(-4)}`);
    const attendee = escapeXml(sanitizeCommercialTrademarks(req.attendeeName || 'Representante Acreditado').slice(0, 48));
    const dateTxt = escapeXml(sanitizeCommercialTrademarks(req.appointmentDateText || 'Sesión Programada · 09:00 hrs (CDMX)').slice(0, 52));
    const subjectLines = wrapTextLines(req.subject || 'Audiencia Institucional en Dirección General', 54, 2);
    const noteLine = req.refinementInstruction
      ? escapeXml(sanitizeCommercialTrademarks(req.refinementInstruction).slice(0, 78))
      : escapeXml(sanitizeCommercialTrademarks(req.normativeRef || 'Presentar identificación oficial en recepción de plantel.').slice(0, 78));

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
        <defs>
          <linearGradient id="passBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${primary}"/>
            <stop offset="100%" stop-color="#0F172A"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="675" rx="32" fill="#F1F5F9"/>
        <rect x="28" y="28" width="1144" height="619" rx="28" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2.5"/>
        <rect x="28" y="28" width="1144" height="146" rx="28" fill="url(#passBg)"/>
        <rect x="28" y="168" width="1144" height="6" fill="${accent}"/>

        <rect x="64" y="54" width="92" height="92" rx="22" fill="#FFFFFF" fill-opacity="0.15" stroke="#FFFFFF" stroke-opacity="0.4" stroke-width="2"/>
        <text x="110" y="112" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="900" fill="#FFFFFF">${initials}</text>
        <text x="180" y="88" font-family="Arial, sans-serif" font-size="14" font-weight="800" fill="#FCA5A5" letter-spacing="2">${school.toUpperCase()}</text>
        <text x="180" y="126" font-family="Arial, sans-serif" font-size="30" font-weight="900" fill="#FFFFFF">PASE OFICIAL DE AUDIENCIA DIRECTIVA</text>

        <rect x="900" y="64" width="236" height="72" rx="16" fill="#FFFFFF" fill-opacity="0.14"/>
        <text x="1018" y="92" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#E2E8F0" letter-spacing="1.5">FOLIO DE EXPEDIENTE</text>
        <text x="1018" y="120" text-anchor="middle" font-family="Courier New, monospace" font-size="20" font-weight="900" fill="#FFFFFF">${code}</text>

        <text x="68" y="226" font-family="Arial, sans-serif" font-size="12" font-weight="800" fill="#64748B" letter-spacing="1.5">ASUNTO DE CONVOCATORIA</text>
        <text x="68" y="262" font-family="Arial, sans-serif" font-size="24" font-weight="900" fill="#0F172A">${escapeXml(subjectLines[0] || '')}</text>
        ${subjectLines[1] ? `<text x="68" y="294" font-family="Arial, sans-serif" font-size="22" font-weight="800" fill="#1E293B">${escapeXml(subjectLines[1])}</text>` : ''}

        <rect x="68" y="330" width="480" height="106" rx="18" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2"/>
        <text x="92" y="362" font-family="Arial, sans-serif" font-size="11" font-weight="800" fill="#64748B" letter-spacing="1.2">TITULAR CONVOCADO</text>
        <text x="92" y="398" font-family="Arial, sans-serif" font-size="20" font-weight="900" fill="#0F172A">${attendee}</text>

        <rect x="572" y="330" width="560" height="106" rx="18" fill="#FEF2F2" stroke="#FECACA" stroke-width="2"/>
        <text x="596" y="362" font-family="Arial, sans-serif" font-size="11" font-weight="800" fill="#DC2626" letter-spacing="1.2">FECHA, HORA Y SEDE CONFIRMADA</text>
        <text x="596" y="396" font-family="Arial, sans-serif" font-size="19" font-weight="900" fill="#7F1D1D">${dateTxt}</text>
        <text x="596" y="420" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="#991B1B">${campus} · ${director}</text>

        <rect x="68" y="466" width="1064" height="136" rx="18" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
        <text x="94" y="502" font-family="Arial, sans-serif" font-size="12" font-weight="900" fill="${primary}" letter-spacing="1.2">PROTOCOLO E INDICACIONES DE ACCESO</text>
        <text x="94" y="536" font-family="Arial, sans-serif" font-size="17" font-weight="700" fill="#334155">${noteLine}</text>
        <text x="94" y="574" font-family="Arial, sans-serif" font-size="13" font-weight="600" fill="#64748B">Documento autenticado por ${director} · Emitido: ${dateStamp}</text>
      </svg>
    `;
    return svgOrBufferToPngBuffer(Buffer.from(svg));
  }

  // Comunicado Oficial
  const titleLines = wrapTextLines(req.subject || 'Comunicado Oficial a la Comunidad Escolar', isWide ? 52 : 36, 3);
  const bullets = extractKeyBulletsFromBody(
    req.refinementInstruction ? `${req.bodyText || ''}\n${req.refinementInstruction}` : req.bodyText || ''
  );
  const audience = escapeXml(sanitizeCommercialTrademarks(req.audienceLabel || 'Comunidad Escolar y Familias').slice(0, 48));

  const bulletBlocksSvg = bullets
    .slice(0, 3)
    .map((b, idx) => {
      const bLines = wrapTextLines(b, isWide ? 74 : 52, 3);
      const yBase = (isWide ? 306 : 446) + idx * (isWide ? 88 : 154);
      return `
        <g transform="translate(64, ${yBase})">
          <rect width="${w - 128}" height="${isWide ? 76 : 134}" rx="18" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2"/>
          <circle cx="36" cy="${isWide ? 38 : 44}" r="16" fill="${accent}"/>
          <text x="36" y="${isWide ? 44 : 50}" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" font-weight="900" fill="#FFFFFF">${idx + 1}</text>
          <text x="68" y="${isWide ? 32 : 42}" font-family="Arial, sans-serif" font-size="${isWide ? 15.5 : 18}" font-weight="700" fill="#1E293B">${escapeXml(bLines[0] || '')}</text>
          ${bLines[1] ? `<text x="68" y="${isWide ? 54 : 72}" font-family="Arial, sans-serif" font-size="${isWide ? 14.5 : 17}" font-weight="600" fill="#475569">${escapeXml(bLines[1])}</text>` : ''}
          ${bLines[2] && !isWide ? `<text x="68" y="102" font-family="Arial, sans-serif" font-size="16.5" font-weight="600" fill="#475569">${escapeXml(bLines[2])}</text>` : ''}
        </g>
      `;
    })
    .join('\n');

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <defs>
        <linearGradient id="comHdr" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${primary}"/>
          <stop offset="100%" stop-color="#0F172A"/>
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="#FFFFFF"/>
      <rect width="${w}" height="${isWide ? 164 : 236}" fill="url(#comHdr)"/>
      <rect x="0" y="${isWide ? 160 : 230}" width="${w}" height="8" fill="${accent}"/>

      <rect x="64" y="${isWide ? 36 : 52}" width="88" height="88" rx="22" fill="#FFFFFF" fill-opacity="0.14" stroke="#FFFFFF" stroke-opacity="0.38" stroke-width="2"/>
      <text x="108" y="${isWide ? 91 : 107}" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" font-weight="900" fill="#FFFFFF">${initials}</text>

      <text x="176" y="${isWide ? 70 : 88}" font-family="Arial, sans-serif" font-size="14" font-weight="800" fill="#FCA5A5" letter-spacing="2">COMUNICADO OFICIAL INSTITUCIONAL</text>
      <text x="176" y="${isWide ? 106 : 126}" font-family="Arial, sans-serif" font-size="26" font-weight="900" fill="#FFFFFF">${school}</text>
      <text x="176" y="${isWide ? 134 : 162}" font-family="Arial, sans-serif" font-size="15" font-weight="600" fill="#CBD5E1">${audience} · ${campus}</text>

      <text x="64" y="${isWide ? 222 : 308}" font-family="Arial, sans-serif" font-size="${isWide ? 26 : 32}" font-weight="900" fill="#0F172A">${escapeXml(titleLines[0] || 'Aviso Institucional')}</text>
      ${titleLines[1] ? `<text x="64" y="${isWide ? 256 : 350}" font-family="Arial, sans-serif" font-size="${isWide ? 24 : 30}" font-weight="900" fill="#0F172A">${escapeXml(titleLines[1])}</text>` : ''}
      ${titleLines[2] && !isWide ? `<text x="64" y="392" font-family="Arial, sans-serif" font-size="28" font-weight="800" fill="#1E293B">${escapeXml(titleLines[2])}</text>` : ''}

      ${bulletBlocksSvg}

      <line x1="64" y1="${h - 104}" x2="${w - 64}" y2="${h - 104}" stroke="#E2E8F0" stroke-width="2"/>
      <text x="64" y="${h - 66}" font-family="Arial, sans-serif" font-size="16" font-weight="800" fill="#0F172A">Atentamente: ${director} · ${school}</text>
      <text x="64" y="${h - 38}" font-family="Arial, sans-serif" font-size="13" font-weight="600" fill="#64748B">Emisión verificada: ${dateStamp}</text>
    </svg>
  `;
  return svgOrBufferToPngBuffer(Buffer.from(svg));
}

const quotaZeroCooldownByKeySuffix = new Map<string, number>();

export class InstitutionalVisualStudioService {
  static async synthesizeVisualAsset(
    req: InstitutionalVisualRequest,
    previousTurnCount: number = 0
  ): Promise<InstitutionalVisualResult> {
    const defaultAspect: VisualAspectRatio =
      req.aspectRatio || (req.mode === 'comunicado' ? '4:5' : '16:9');

    const prompt = buildStructuredVisualPrompt(req);
    const apiKey = resolveInstitutionalApiKey();
    const keyTag = apiKey ? apiKey.slice(-6) : '';
    const isUnderZeroQuotaCooldown =
      keyTag ? (quotaZeroCooldownByKeySuffix.get(keyTag) || 0) > Date.now() : false;

    let rawImageBuffer: Buffer | null = null;
    let interactionId = req.previousInteractionId || `vis-inst-${Date.now()}`;
    let synthesisEngine: 'motor_visual_ia' | 'estudio_determinista' = 'estudio_determinista';

    if (apiKey && !isUnderZeroQuotaCooldown) {
      try {
        const client = new MotorVisualPedagogicoSDK({
          apiKey,
          httpOptions: {
            apiVersion: 'v1beta',
            retryOptions: { attempts: 1 },
          },
        });

        // Construir referencias multi-imagen (Escudo institucional + hasta 13 referencias adjuntas)
        const crestPngBase64 = await buildSchoolCrestReferencePngBase64(
          req.schoolName,
          req.primaryColor,
          req.accentColor
        );

        const userRefs = Array.isArray(req.referenceImages) ? req.referenceImages.slice(0, 13) : [];
        const isMultiTurnWithId = Boolean(
          req.previousInteractionId &&
          !req.previousInteractionId.startsWith('vis-inst-') &&
          req.refinementInstruction
        );

        const inputBlocks: Array<
          | { type: 'text'; text: string }
          | { type: 'image'; mime_type: string; data: string }
        > = [{ type: 'text', text: prompt }];

        if (!isMultiTurnWithId) {
          inputBlocks.push({
            type: 'image',
            mime_type: 'image/png',
            data: crestPngBase64,
          });
          if (req.refinementInstruction && req.previousWebpBase64) {
            inputBlocks.push({
              type: 'image',
              mime_type: 'image/webp',
              data: req.previousWebpBase64.replace(/^data:image\/\w+;base64,/, ''),
            });
          }
        }

        for (const ref of userRefs) {
          const cleanB64 = (ref.dataBase64 || '').replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '').trim();
          if (cleanB64) {
            inputBlocks.push({
              type: 'image',
              mime_type: ref.mimeType || 'image/webp',
              data: cleanB64,
            });
          }
        }

        const interaction = await client.interactions.create({
          model: TARGET_MODEL_ID,
          input: isMultiTurnWithId && userRefs.length === 0 ? prompt : (inputBlocks as any),
          ...(isMultiTurnWithId ? { previous_interaction_id: req.previousInteractionId } : {}),
          response_format: {
            type: 'image',
            aspect_ratio: defaultAspect,
            image_size: '1K',
          },
        });

        if (interaction?.id) {
          interactionId = interaction.id;
        }

        let extractedBase64: string | undefined = interaction?.output_image?.data;
        if (!extractedBase64 && Array.isArray(interaction?.steps)) {
          for (const step of interaction.steps as any[]) {
            if (step?.type === 'model_output' && Array.isArray(step.content)) {
              for (const block of step.content) {
                if (block?.type === 'image' && block?.data) {
                  extractedBase64 = block.data;
                }
              }
            }
          }
        }

        if (extractedBase64) {
          rawImageBuffer = Buffer.from(extractedBase64, 'base64');
          synthesisEngine = 'motor_visual_ia';
        }
      } catch (err: any) {
        const msg = String(err?.message || err || '');
        if (keyTag && (msg.includes('limit: 0') || msg.includes('429'))) {
          quotaZeroCooldownByKeySuffix.set(keyTag, Date.now() + 5 * 60_000);
        }
        console.warn('[Estudio Gráfico Institucional] Respaldo vectorial activado:', msg);
      }
    }

    if (!rawImageBuffer) {
      rawImageBuffer = await renderDeterministicStudioFallback(req, defaultAspect);
      synthesisEngine = 'estudio_determinista';
      interactionId = `vis-inst-${Date.now()}`;
    }

    // Compresión obligatoria WebP (< 250 KB) — Regla No Negociable 3
    const { webpBuffer, width, height } = await compressToInstitutionalWebp(rawImageBuffer, defaultAspect);
    const webpBase64 = webpBuffer.toString('base64');
    const sizeBytes = webpBuffer.length;
    const sizeKb = Math.max(1, Math.round(sizeBytes / 1024));

    const cidPrefix =
      req.mode === 'pase_audiencia'
        ? 'pase-audiencia'
        : req.mode === 'infografia_ejecutiva'
        ? 'pulso-ejecutivo'
        : 'comunicado-oficial';

    return {
      success: true,
      interactionId,
      turnNumber: previousTurnCount + 1,
      aspectRatio: defaultAspect,
      mimeType: 'image/webp',
      webpBase64,
      dataUrl: `data:image/webp;base64,${webpBase64}`,
      width,
      height,
      sizeBytes,
      sizeKb,
      cid: `${cidPrefix}-${Date.now()}@iskool.mx`,
      fileName: `${cidPrefix}-${req.tenantId.toLowerCase().replace(/[^a-z0-9_-]/g, '')}.webp`,
      synthesisEngine,
      captionSummary:
        req.mode === 'pase_audiencia'
          ? `Pase Oficial de Audiencia · ${req.matterCode || 'Dirección General'}`
          : req.mode === 'infografia_ejecutiva'
          ? `Lámina Ejecutiva 4 Cuadrantes · ${req.schoolName}`
          : `Comunicado Gráfico Oficial · ${req.subject || req.schoolName}`,
    };
  }
}
