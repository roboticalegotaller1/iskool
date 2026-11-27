import WebSocket from 'ws';
import crypto from 'node:crypto';
import https from 'node:https';

const KEEP_ALIVE_IPV4_AGENT = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 30000,
  maxSockets: 12,
  family: 4,
});

/**
 * Cliente Directo de Síntesis Neuronal Institucional (0 Tokens).
 * Genera audio MP3 nativo a 24 kHz / 96 kbps directamente desde Node.js sin spawn de subprocesos,
 * conservando la claridad consonántica y naturalidad fonética latinoamericana e internacional.
 */

const GATEWAY_BASE = 'speech.platform.bing.com/consumer/speech/synthesize/readaloud';
const TRUSTED_CLIENT_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';
const WSS_URL = `wss://${GATEWAY_BASE}/edge/v1?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}`;
const CLIENT_FULL_VERSION = '143.0.3650.75';
const CLIENT_MAJOR_VERSION = CLIENT_FULL_VERSION.split('.')[0];
const SEC_MS_GEC_VERSION = `2-${CLIENT_FULL_VERSION}`;
const ORIGIN_HEADER = 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold';

const WIN_EPOCH = 11644473600;
const S_TO_NS = 1e9;

const SHA256_INITIAL = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
] as const;

const SHA256_STATE = [
  0xfd9fbea2, 0x91243ce7, 0xbe499094, 0xcd2e1e0a,
  0x6c006f49, 0x04bd35ab, 0xfeb0a7e4, 0x03effbd2,
] as const;

const SHA256_SCHEDULE = [
  0xeb24bf9e, 0x1558691f, 0xa0c09ee2, 0x0cfa32ba,
  0xa622ee8c, 0xd1dd9491, 0xc0dd25a0, 0xf9e70ab6,
  0xf0c31573, 0x7058ce4e, 0x7188e606, 0x00e5ab33,
  0xd258b060, 0x72766564,
] as const;

const SHA256_ROUND_CONSTANTS = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
] as const;

const SHA256_ADJUSTMENT = 0xc9dc06a7;
const SHA256_BLOCK_CONSTANTS = [
  ...SHA256_ROUND_CONSTANTS.slice(0, 14),
  SHA256_ADJUSTMENT,
  ...SHA256_ROUND_CONSTANTS.slice(15),
] as const;
const SHA256_SIGMA0_ADJUSTMENT = 0x059c0b80;
const SHA256_SIGMA1_ADJUSTMENT = 0x000b92c0;

const CS64_COEFFICIENTS: ReadonlyArray<readonly [number, number]> = [
  [0xe82e91b1, 0xb32700d0],
  [0x44de24c6, 0x88dff51d],
  [0x3beb65bc, 0x29514038],
  [0xc89c5933, 0xb328cbdf],
  [0x8d1ec211, 0xd405b4d5],
  [0x314ef5d5, 0x26e55f3c],
  [0xe92491b1, 0x607801c6],
  [0xf0a5b9d5, 0x82b2c1fb],
  [0x06064cf3, 0xfa51a3da],
  [0xda79fa60, 0x207cc464],
  [0xbed20560, 0x3c3c74f3],
  [0x89f9c9f8, 0xd2d14b61],
  [0x35fa38c6, 0xbb04a2c1],
  [0xcb49e3c6, 0xc5626167],
];
const CS64_FACTOR = 0x82893933;
const CS64_ADJUSTMENT0 = 0xf2f90b1a;
const CS64_ADJUSTMENT1 = 0x0b1a0000;

interface WsClientLike {
  on(event: string, listener: (...args: any[]) => void): void;
  send(data: string): void;
  close(): void;
  terminate(): void;
}
type WsConstructor = new (address: string, options?: Record<string, unknown>) => WsClientLike;

function getWsConstructor(): WsConstructor {
  return WebSocket as unknown as WsConstructor;
}

let clockSkewSeconds = 0;

function rotr32(v: number, n: number): number {
  return ((v >>> n) | (v << (32 - n))) >>> 0;
}

function rol16(v: number): number {
  return ((v << 16) | (v >>> 16)) >>> 0;
}

function sigma0(v: number): number {
  return (rotr32(v, 7) ^ rotr32(v, 18) ^ (v >>> 3)) >>> 0;
}

function sigma1(v: number): number {
  return (rotr32(v, 17) ^ rotr32(v, 19) ^ (v >>> 10)) >>> 0;
}

function sha256Rounds(state: readonly number[], words: number[], firstRound = 0): number[] {
  let [a, b, c, d, e, f, g, h] = state;
  const constants = firstRound === 14 ? SHA256_BLOCK_CONSTANTS : SHA256_ROUND_CONSTANTS;
  for (let i = firstRound; i < 64; i++) {
    const s1 = (rotr32(e, 6) ^ rotr32(e, 11) ^ rotr32(e, 25)) >>> 0;
    const ch = (g ^ (e & (f ^ g))) >>> 0;
    const t1 = (h + s1 + ch + constants[i] + words[i]) >>> 0;
    const s0 = (rotr32(a, 2) ^ rotr32(a, 13) ^ rotr32(a, 22)) >>> 0;
    const maj = ((a & b) | (c & (a | b))) >>> 0;
    const t2 = (s0 + maj) >>> 0;
    h = g;
    g = f;
    f = e;
    e = (d + t1) >>> 0;
    d = c;
    c = b;
    b = a;
    a = (t1 + t2) >>> 0;
  }
  return [a, b, c, d, e, f, g, h];
}

function expandSha256Schedule(words: number[], firstWord = 16): void {
  for (let i = firstWord; i < 64; i++) {
    const x = words[i - 2];
    const y = words[i - 15];
    words[i] = (sigma1(x) + words[i - 7] + sigma0(y) + words[i - 16]) >>> 0;
  }
}

function sha256Init(first7: Buffer): number[] {
  const words = new Array<number>(64).fill(0);
  words[14] = (first7[0] << 16) | (first7[1] << 8) | first7[2];
  words[15] = ((first7[3] << 24) | (first7[4] << 16) | (first7[5] << 8) | first7[6]) >>> 0;
  for (let i = 16; i < 30; i++) {
    let val = SHA256_SCHEDULE[i - 16] >>> 0;
    if (i - 2 >= 14) {
      val = (val + (i === 16 ? (sigma1(words[i - 2]) ^ SHA256_SIGMA1_ADJUSTMENT) >>> 0 : sigma1(words[i - 2]))) >>> 0;
    }
    if (i - 7 >= 14) {
      val = (val + words[i - 7]) >>> 0;
    }
    if (i - 15 >= 14) {
      val = (val + (i === 29 ? (sigma0(words[i - 15]) ^ SHA256_SIGMA0_ADJUSTMENT) >>> 0 : sigma0(words[i - 15]))) >>> 0;
    }
    words[i] = val >>> 0;
  }
  words[30] = (
    sigma1(words[28]) +
    words[23] +
    sigma0(words[15]) +
    words[14] +
    SHA256_ADJUSTMENT -
    SHA256_ROUND_CONSTANTS[14]
  ) >>> 0;
  expandSha256Schedule(words, 31);
  const working = sha256Rounds(SHA256_STATE, words, 14);
  return SHA256_INITIAL.map((x, idx) => (x + working[idx]) >>> 0);
}

function sha256Digest(dataBuf: Buffer): Buffer {
  if (dataBuf.length < 7) {
    throw new Error('Salt demasiado corto para token de sesión');
  }
  const length = 57 + dataBuf.length;
  const rem = dataBuf.subarray(7);
  const padZeroCount = ((55 - length) % 64 + 64) % 64;
  const padded = Buffer.alloc(rem.length + 1 + padZeroCount + 8);
  rem.copy(padded, 0);
  padded[rem.length] = 0x80;
  const bitOffset = rem.length + 1 + padZeroCount;
  const totalBits = length * 8;
  padded.writeUInt32BE(Math.floor(totalBits / 0x100000000), bitOffset);
  padded.writeUInt32BE(totalBits >>> 0, bitOffset + 4);

  let state = sha256Init(dataBuf.subarray(0, 7));
  const words = new Array<number>(64);
  for (let offset = 0; offset < padded.length; offset += 64) {
    for (let i = 0; i < 16; i++) {
      words[i] = padded.readUInt32BE(offset + i * 4);
    }
    expandSha256Schedule(words, 16);
    const working = sha256Rounds(state, words, 0);
    state = state.map((x, idx) => (x + working[idx]) >>> 0);
  }
  const out = Buffer.alloc(32);
  for (let i = 0; i < 8; i++) out.writeUInt32BE(state[i], i * 4);
  return out;
}

function wordsLe4Even(buf: Buffer): number[] {
  const rem = (4 - (buf.length % 4)) % 4;
  const padded = rem === 0 ? buf : Buffer.concat([buf, Buffer.alloc(rem)]);
  if (padded.length === 0) return [];
  const words: number[] = [];
  for (let i = 0; i < padded.length; i += 4) {
    words.push(padded.readUInt32LE(i));
  }
  if (words.length % 2 === 1) words.push(0);
  return words;
}

function cs64Digest(dataBuf: Buffer, digestBuf: Buffer): string {
  const keyA = (digestBuf.readUInt32LE(0) | 1) >>> 0;
  const keyB = (digestBuf.readUInt32LE(4) | 1) >>> 0;
  const factors = [
    Math.imul(keyA, CS64_FACTOR) >>> 0,
    Math.imul(keyB, CS64_FACTOR) >>> 0,
  ];
  const terms = CS64_COEFFICIENTS.map(([coeff], idx) => Math.imul(coeff, factors[idx % 2]) >>> 0);
  const offsets = CS64_COEFFICIENTS.map(([, off]) => off >>> 0);

  const prefixed = Buffer.concat([Buffer.from([0]), dataBuf]);
  const msgWords = wordsLe4Even(prefixed);
  for (let i = 0; i < msgWords.length; i++) {
    const w = msgWords[i];
    let term = Math.imul(w, i % 2 === 0 ? keyA : keyB) >>> 0;
    let offset = Math.imul(rol16(w), i % 2 === 0 ? 0xef0569fb : 0xc31713db) >>> 0;
    if (i === 0) {
      term = (term + (Math.imul(CS64_ADJUSTMENT0, factors[0]) >>> 0)) >>> 0;
      offset = (offset + CS64_ADJUSTMENT1) >>> 0;
    }
    terms.push(term);
    offsets.push(offset);
  }

  let swapAcc = 0;
  let swapLast = 0;
  let state = 0;
  let acc = 0;
  for (let i = 0; i < terms.length; i += 2) {
    const x = terms[i];
    const y = terms[i + 1];
    let t = rol16((offsets[i] + x) >>> 0);
    let q = Math.imul(t, 0x76f50f34) >>> 0;
    swapAcc = (swapAcc + ((Math.imul(rol16(q), 0xc3efea97) + q) >>> 0)) >>> 0;

    t = rol16((offsets[i + 1] + y) >>> 0);
    q = Math.imul(t, 0x1881ce3c) >>> 0;
    swapLast = (Math.imul(rol16(q), 0x35bd1ec9) + q) >>> 0;
    swapAcc = (swapAcc + swapLast) >>> 0;

    state = (Math.imul(state, keyA) + x) >>> 0;
    state = Math.imul(rol16(state), 0xcf98b111) >>> 0;
    state = Math.imul(rol16(state), 0x87085b9f) >>> 0;
    state = Math.imul(rol16(state), 0x12ceb96d) >>> 0;
    state = Math.imul(rol16(state), 0x257e1d83) >>> 0;
    acc = (acc + state) >>> 0;

    t = (Math.imul(state, keyB) + y) >>> 0;
    t = Math.imul(rol16(t), 0xa27416f5) >>> 0;
    t = Math.imul(rol16(t), 0xd38396ff) >>> 0;
    state = Math.imul(rol16(Math.imul(rol16(t), 0x7c932b89) >>> 0), 0xbfa49f69) >>> 0;
    acc = (acc + state) >>> 0;
  }
  const outBuf = Buffer.alloc(8);
  outBuf.writeUInt32LE((swapLast ^ state) >>> 0, 0);
  outBuf.writeUInt32LE((swapAcc ^ acc) >>> 0, 4);
  return outBuf.toString('hex').toUpperCase();
}

export function generateInstitutionalSessionToken(unixTimestampSeconds?: number): string {
  const baseTs = unixTimestampSeconds ?? (Date.now() / 1000 + clockSkewSeconds);
  let ticks = baseTs + WIN_EPOCH;
  ticks -= ticks % 300;
  ticks *= S_TO_NS / 100;
  const strToHash = Buffer.from(`${Math.round(ticks)}${TRUSTED_CLIENT_TOKEN}`, 'ascii');
  const digest = sha256Digest(strToHash);
  const cs64 = cs64Digest(strToHash, digest);
  return `${cs64}-${digest.toString('hex').toUpperCase()}`;
}

export function enforceAntiCastilianVoice(voiceId: string): string {
  const clean = (voiceId || '').trim();
  const lower = clean.toLowerCase();
  if (!clean || lower.includes('es-es') || lower.includes('es_es') || lower.includes('castellano') || lower.includes('spain')) {
    if (lower.includes('alvaro') || lower.includes('arnau') || lower.includes('male') || lower.includes('masc')) {
      return 'es-MX-JorgeNeural';
    }
    return 'es-MX-DaliaNeural';
  }
  return clean;
}

function inferLocaleFromVoice(voiceId: string): string {
  const parts = voiceId.split('-');
  if (parts.length >= 2) {
    return `${parts[0]}-${parts[1]}`;
  }
  return 'es-MX';
}

function sanitizeRateString(rate?: string): string {
  const match = String(rate || '+0%').match(/([+-]?\d+)/);
  const val = match ? Math.max(-12, Math.min(15, parseInt(match[1], 10))) : 0;
  return val >= 0 ? `+${val}%` : `${val}%`;
}

function sanitizePitchString(pitch?: string): string {
  const match = String(pitch || '+0Hz').match(/([+-]?\d+)/);
  const val = match ? Math.max(-6, Math.min(6, parseInt(match[1], 10))) : 0;
  return val >= 0 ? `+${val}Hz` : `${val}Hz`;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function prepareCleanSpokenText(rawText: string): string {
  let clean = (rawText || '')
    // Desplegar alias fonéticos si llegaron en formato SSML
    .replace(/<sub\s+alias="([^"]+)"[^>]*>[\s\S]*?<\/sub>/gi, '$1')
    // Convertir <break> a pausas ortográficas reales (la pasarela WS cierra con 1007 ante <break>)
    .replace(/<break\s+time="(\d+)ms"[^>]*\/?>/gi, (_m, msStr) => (parseInt(msStr, 10) > 220 ? '. ' : ', '))
    .replace(/<break[^>]*\/?>/gi, ', ')
    // Desenvolver cualquier otra etiqueta XML/SSML
    .replace(/<[^>]+>/g, ' ')
    // Proteger ortografía natural (garantiza que jamás llegue acento artificial 'pátria')
    .replace(/\bPátria(s?)\b/g, 'Patria$1')
    .replace(/\bpátria(s?)\b/g, 'patria$1');

  // Reemplazar caracteres de control incompatibles (0..8, 11..12, 14..31)
  let safeChars = '';
  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i);
    if ((code >= 0 && code <= 8) || code === 11 || code === 12 || (code >= 14 && code <= 31)) {
      safeChars += ' ';
    } else {
      safeChars += clean[i];
    }
  }

  clean = safeChars
    .replace(/([,;:])\s*,\s*/g, '$1 ')
    .replace(/\.\s*\.\s*(?!\.)/g, '. ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return clean;
}

function splitCleanTextIntoTurns(text: string, maxUtf8Bytes = 280): string[] {
  if (Buffer.byteLength(text, 'utf8') <= maxUtf8Bytes) {
    return [text];
  }
  const sentences = text.split(/(?<=[.!?])\s+/);
  const turns: string[] = [];
  let current = '';
  for (const s of sentences) {
    const candidate = current ? `${current} ${s}` : s;
    if (Buffer.byteLength(candidate, 'utf8') <= maxUtf8Bytes) {
      current = candidate;
    } else {
      if (current) turns.push(current);
      if (Buffer.byteLength(s, 'utf8') <= maxUtf8Bytes) {
        current = s;
      } else {
        // División segura por palabras si una sola oración excede el límite
        const words = s.split(/\s+/);
        let sub = '';
        for (const w of words) {
          const next = sub ? `${sub} ${w}` : w;
          if (Buffer.byteLength(next, 'utf8') <= maxUtf8Bytes) {
            sub = next;
          } else {
            if (sub) turns.push(sub);
            sub = w;
          }
        }
        current = sub;
      }
    }
  }
  if (current) turns.push(current);
  return turns.length > 0 ? turns : [text];
}

function synthesizeSingleTurnWs(
  plainText: string,
  voiceId: string,
  rate: string,
  pitch: string,
  outputFormat: string,
  timeoutMs: number
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const WebSocket = getWsConstructor();
    const connId = crypto.randomBytes(16).toString('hex');
    const secMsGec = generateInstitutionalSessionToken();
    const muid = crypto.randomBytes(16).toString('hex').toUpperCase();
    const url = `${WSS_URL}&ConnectionId=${connId}&Sec-MS-GEC=${secMsGec}&Sec-MS-GEC-Version=${SEC_MS_GEC_VERSION}`;

    const ws = new WebSocket(url, {
      agent: KEEP_ALIVE_IPV4_AGENT,
      family: 4,
      handshakeTimeout: Math.min(2500, timeoutMs),
      headers: {
        Pragma: 'no-cache',
        'Cache-Control': 'no-cache',
        Origin: ORIGIN_HEADER,
        'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${CLIENT_MAJOR_VERSION}.0.0.0 Safari/537.36 Edg/${CLIENT_MAJOR_VERSION}.0.0.0`,
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.9',
        Cookie: `muid=${muid};`,
      },
    });

    const audioChunks: Buffer[] = [];
    let settled = false;
    const finishOk = (buf: Buffer) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { ws.close(); } catch {}
      resolve(buf);
    };
    const finishErr = (err: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { ws.terminate(); } catch {}
      reject(err);
    };

    const timer = setTimeout(() => {
      finishErr(new Error(`Timeout en síntesis directa (${timeoutMs}ms)`));
    }, timeoutMs);

    ws.on('open', () => {
      const ts = new Date().toUTCString().replace('GMT', 'GMT+0000 (Coordinated Universal Time)');
      ws.send(
        `X-Timestamp:${ts}\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n` +
        JSON.stringify({
          context: {
            synthesis: {
              audio: {
                metadataoptions: {
                  sentenceBoundaryEnabled: 'false',
                  wordBoundaryEnabled: 'false',
                },
                outputFormat,
              },
            },
          },
        }) +
        '\r\n'
      );

      const reqId = crypto.randomBytes(16).toString('hex');
      const locale = inferLocaleFromVoice(voiceId);
      const escapedBody = escapeXml(plainText);
      const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='${locale}'><voice name='${voiceId}'><prosody pitch='${pitch}' rate='${rate}' volume='+0%'>${escapedBody}</prosody></voice></speak>`;
      ws.send(
        `X-RequestId:${reqId}\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:${ts}Z\r\nPath:ssml\r\n\r\n${ssml}`
      );
    });

    ws.on('message', (data: Buffer | string, isBinary: boolean) => {
      if (!isBinary) {
        const msg = data.toString();
        if (msg.includes('Path:turn.end')) {
          const combined = Buffer.concat(audioChunks);
          if (combined.length > 256) {
            finishOk(combined);
          } else {
            finishErr(new Error('Respuesta de síntesis vacía'));
          }
        }
        return;
      }

      const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
      if (buf.length < 2) return;
      const headerLen = buf.readUInt16BE(0);
      if (2 + headerLen > buf.length) return;
      const headerText = buf.subarray(2, 2 + headerLen).toString('utf8');
      if (headerText.includes('Path:audio')) {
        audioChunks.push(buf.subarray(2 + headerLen));
      }
    });

    ws.on('unexpected-response', (_req: any, res: { statusCode?: number; headers?: Record<string, string | string[]> }) => {
      const serverDateHeader = res?.headers?.date;
      if (typeof serverDateHeader === 'string') {
        const parsedMs = Date.parse(serverDateHeader);
        if (Number.isFinite(parsedMs)) {
          clockSkewSeconds = parsedMs / 1000 - Date.now() / 1000;
        }
      }
      const err: any = new Error(`HTTP ${res?.statusCode || 'desconocido'} en pasarela neuronal`);
      err.statusCode = res?.statusCode;
      finishErr(err);
    });

    ws.on('error', (err: Error) => {
      finishErr(err);
    });

    ws.on('close', (code: number) => {
      if (!settled) {
        const combined = Buffer.concat(audioChunks);
        if (combined.length > 256) {
          finishOk(combined);
        } else {
          finishErr(new Error(`Conexión cerrada (${code}) sin datos de audio`));
        }
      }
    });
  });
}

export async function synthesizeDirectInstitutionalNeural(options: {
  text: string;
  voice?: string;
  rate?: string;
  pitch?: string;
  timeoutMs?: number;
}): Promise<Buffer> {
  const voiceId = enforceAntiCastilianVoice(options.voice || 'es-MX-DaliaNeural');
  const rate = sanitizeRateString(options.rate);
  const pitch = sanitizePitchString(options.pitch);
  const timeoutMs = options.timeoutMs ?? 3500;
  const cleanText = prepareCleanSpokenText(options.text);

  if (!cleanText || cleanText.length < 1) {
    throw new Error('Texto vacío para síntesis directa');
  }

  const turns = splitCleanTextIntoTurns(cleanText);
  const perTurnTimeoutMs =
    turns.length > 1
      ? Math.max(timeoutMs, 7500)
      : Math.max(timeoutMs, cleanText.length > 180 ? 5500 : timeoutMs);
  const primaryFormat = /multilingualneural$|eloiseneural$/i.test(voiceId)
    ? 'audio-24khz-48kbitrate-mono-mp3'
    : 'audio-24khz-96kbitrate-mono-mp3';

  // Pool acotado a máximo 3 conexiones WebSocket simultáneas por solicitud preservando el orden exacto de los bloques
  const MAX_CONCURRENT_WS_TURNS = 3;
  const turnBuffers = new Array<Buffer>(turns.length);
  let nextTurnIndex = 0;
  let hasFailed = false;

  const runWorker = async () => {
    while (!hasFailed) {
      const currentIdx = nextTurnIndex++;
      if (currentIdx >= turns.length) return;
      const turnText = turns[currentIdx];
      try {
        turnBuffers[currentIdx] = await synthesizeSingleTurnWs(
          turnText,
          voiceId,
          rate,
          pitch,
          primaryFormat,
          perTurnTimeoutMs
        );
      } catch (firstErr: any) {
        try {
          // Reintento único inmediato ajustando reloj (403) o con bitrate estándar 48kbps
          const fallbackFmt = firstErr?.statusCode === 403
            ? primaryFormat
            : 'audio-24khz-48kbitrate-mono-mp3';
          turnBuffers[currentIdx] = await synthesizeSingleTurnWs(
            turnText,
            voiceId,
            rate,
            pitch,
            fallbackFmt,
            Math.min(6000, perTurnTimeoutMs)
          );
        } catch (retryErr) {
          hasFailed = true;
          throw retryErr;
        }
      }
    }
  };

  const workerCount = Math.min(MAX_CONCURRENT_WS_TURNS, turns.length);
  await Promise.all(Array.from({ length: workerCount }, () => runWorker()));

  return Buffer.concat(turnBuffers);
}
