import fs from 'fs';
import path from 'path';
import { marked } from 'marked';

// Carga perezosa y segura de DOMPurify para evitar fallos en frío en entornos serverless (AWS Amplify)
let cachedDomPurify: { sanitize: (html: string, cfg?: Record<string, unknown>) => string } | null | undefined;
function getDomPurify() {
  if (cachedDomPurify !== undefined) return cachedDomPurify;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('isomorphic-dompurify');
    const instance = mod?.default || mod;
    if (instance && typeof instance.sanitize === 'function') {
      cachedDomPurify = instance;
      return cachedDomPurify;
    }
  } catch {
    // Respaldo determinista sin dependencias de DOM si el runtime serverless omite hojas CSS de jsdom
  }
  cachedDomPurify = null;
  return null;
}

const ALLOWED_HTML_TAGS = new Set([
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'b', 'i', 'strong', 'em', 'strike',
  'code', 'hr', 'br', 'div', 'span', 'pre', 'blockquote', 'ul', 'ol', 'li',
  'table', 'thead', 'tbody', 'tr', 'th', 'td', 'details', 'summary', 'mark'
]);

const ALLOWED_HTML_ATTRS = new Set([
  'href', 'title', 'class', 'id', 'target', 'rel', 'align', 'width', 'height',
  'data-vault-link', 'data-pda'
]);

function fallbackSanitizeHtml(dirtyHtml: string): string {
  // 1. Remover bloques peligrosos completos con su contenido
  let clean = dirtyHtml
    .replace(/<(script|iframe|object|embed|style|form)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<(script|iframe|object|embed|style|form|input|button)\b[^>]*\/?>/gi, '');

  // 2. Filtrar etiquetas y atributos contra lista blanca estricta
  clean = clean.replace(/<(\/?)([a-zA-Z0-9-]+)([^>]*)>/g, (_full, closing: string, rawTag: string, rawAttrs: string) => {
    const tag = rawTag.toLowerCase();
    if (!ALLOWED_HTML_TAGS.has(tag)) return '';
    if (closing) return `</${tag}>`;

    const safeAttrs: string[] = [];
    const attrRegex = /([a-zA-Z0-9-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
    let m: RegExpExecArray | null;
    while ((m = attrRegex.exec(rawAttrs)) !== null) {
      const name = m[1].toLowerCase();
      const val = (m[2] ?? m[3] ?? m[4] ?? '').trim();
      if (!ALLOWED_HTML_ATTRS.has(name) || name.startsWith('on') || name === 'style') continue;
      if (name === 'href' && /^(javascript|vbscript|data):/i.test(val.replace(/[\u0000-\u0020]+/g, ''))) continue;
      const escaped = val.replace(/"/g, '&quot;');
      safeAttrs.push(`${name}="${escaped}"`);
    }
    return safeAttrs.length > 0 ? `<${tag} ${safeAttrs.join(' ')}>` : `<${tag}>`;
  });
  return clean;
}

// Configurar marked para tablas y GitHub Flavored Markdown (GFM)
marked.setOptions({
  gfm: true,
  breaks: true,
});

/**
 * Obtiene el directorio raíz canónico de la Bóveda Curricular.
 */
export function getVaultPlanningsDir(): string {
  const envPath = process.env.CURRICULAR_VAULT_PATH || process.env.VAULT_PATH;
  if (envPath && fs.existsSync(/*turbopackIgnore: true*/ envPath)) {
    const sub = path.join(envPath, 'planeaciones');
    return fs.existsSync(/*turbopackIgnore: true*/ sub) ? sub : envPath;
  }

  const localProjectPlannings = path.join(process.cwd(), 'planeaciones');
  return localProjectPlannings;
}

export interface PlanningFrontmatter {
  title?: string;
  tema?: string;
  nivel?: string;
  fase?: string;
  grado?: string;
  asignatura?: string;
  disciplina?: string;
  materia?: string;
  campo_formativo?: string;
  pda?: string;
  fecha_creacion?: string;
  created_at?: string;
  updated_at?: string;
  tags?: string[];
  docente?: string;
  total_planeaciones?: number;
  [key: string]: unknown;
}

export interface ParsedVaultDoc {
  slug: string[];
  slugString: string;
  filePath: string;
  filename: string;
  frontmatter: PlanningFrontmatter;
  title: string;
  rawContent: string;
  markdownBody: string;
  renderedHtml: string;
  lastModified: number;
}

// =========================================================================
// CACHÉ EN MEMORIA PARA RENDERIZADO ESTÁTICO / ISR (< 2ms)
// =========================================================================
const docCacheBySlug = new Map<string, ParsedVaultDoc>();
const docCacheByFilename = new Map<string, ParsedVaultDoc>();
let allSlugsCache: string[][] | null = null;
let lastScanTimestamp = 0;
const VAULT_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hora de persistencia en memoria

/**
 * Sanitiza HTML usando DOMPurify con lista blanca estricta para prevenir XSS.
 */
export function sanitizeHtml(dirtyHtml: string): string {
  if (!dirtyHtml) return '';
  const purify = getDomPurify();
  if (purify) {
    try {
      return purify.sanitize(dirtyHtml, {
        ALLOWED_TAGS: Array.from(ALLOWED_HTML_TAGS),
        ALLOWED_ATTR: Array.from(ALLOWED_HTML_ATTRS),
        ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
        FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'style'],
        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style']
      });
    } catch {
      return fallbackSanitizeHtml(dirtyHtml);
    }
  }
  return fallbackSanitizeHtml(dirtyHtml);
}

/**
 * Transforma enlaces estilo Bóveda Curricular [[Destino|Etiqueta]] en enlaces HTML seguros.
 */
export function transformWikiLinksToHtml(markdown: string): string {
  const encodeVaultPath = (raw: string) =>
    raw
      .trim()
      .replace(/\.md$/, '')
      .split('/')
      .filter(Boolean)
      .map((seg) => encodeURIComponent(seg))
      .join('/');

  // Patrón 1: [[Destino|Etiqueta]]
  const withPipe = markdown.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, (_match, target, label) => {
    const cleanTarget = encodeVaultPath(target);
    return `[${label.trim()}](/planeaciones/${cleanTarget})`;
  });

  // Patrón 2: [[Destino]]
  return withPipe.replace(/\[\[([^\]]+)\]\]/g, (_match, target) => {
    const rawTarget = target.trim();
    const cleanTarget = encodeVaultPath(rawTarget);
    return `[${rawTarget}](/planeaciones/${cleanTarget})`;
  });
}

/**
 * Convierte cualquier texto Markdown a HTML seguro y sanitizado con DOMPurify.
 */
export function renderSanitizedMarkdown(markdown: string): string {
  if (!markdown) return '';
  const transformed = transformWikiLinksToHtml(markdown);
  const rawHtml = marked.parse(transformed) as string;
  return sanitizeHtml(rawHtml);
}

/**
 * Parsea el Frontmatter YAML de un archivo Markdown.
 */
export function parseFrontmatter(rawContent: string): { frontmatter: PlanningFrontmatter; body: string } {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
  const match = rawContent.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: {}, body: rawContent };
  }

  const yamlBlock = match[1];
  const body = match[2];
  const frontmatter: PlanningFrontmatter = {};

  const lines = yamlBlock.split('\n');
  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > -1) {
      const key = line.slice(0, colonIdx).trim();
      let value = line.slice(colonIdx + 1).trim();

      // Limpiar comillas
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      // Arrays simples en YAML: tags: [a, b]
      if (value.startsWith('[') && value.endsWith(']')) {
        const arrayItems = value.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
        (frontmatter as Record<string, unknown>)[key] = arrayItems;
      } else if (!isNaN(Number(value)) && value !== '') {
        (frontmatter as Record<string, unknown>)[key] = Number(value);
      } else {
        (frontmatter as Record<string, unknown>)[key] = value;
      }
    }
  }

  return { frontmatter, body };
}

/**
 * Recopila todos los archivos Markdown de forma recursiva.
 */
function scanVaultFiles(dirPath: string, rootPath: string = dirPath): Array<{ fullPath: string; relPath: string; slug: string[] }> {
  let results: Array<{ fullPath: string; relPath: string; slug: string[] }> = [];
  if (!fs.existsSync(dirPath)) return results;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(scanVaultFiles(fullPath, rootPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const relPath = path.relative(rootPath, fullPath).replace(/\\/g, '/');
      const slugParts = relPath.replace(/\.md$/, '').split('/');
      results.push({ fullPath, relPath, slug: slugParts });
    }
  }
  return results;
}

/**
 * Pre-calienta e indexa la totalidad de la Bóveda Curricular.
 */
export function buildOrGetVaultIndex(): void {
  const now = Date.now();
  if (docCacheBySlug.size > 0 && (now - lastScanTimestamp < VAULT_CACHE_TTL_MS)) {
    return;
  }

  const vaultDir = getVaultPlanningsDir();
  if (!fs.existsSync(/*turbopackIgnore: true*/ vaultDir)) return;

  const scanned = scanVaultFiles(vaultDir);
  const slugsList: string[][] = [];

  for (const item of scanned) {
    try {
      const raw = fs.readFileSync(/*turbopackIgnore: true*/ item.fullPath, 'utf8');
      const stat = fs.statSync(/*turbopackIgnore: true*/ item.fullPath);
      const { frontmatter, body } = parseFrontmatter(raw);

      // Extracción de título canónico
      const rawTitle = frontmatter.title || 
                       frontmatter.tema || 
                       frontmatter.titulo || 
                       raw.match(/^#\s+(.*)$/m)?.[1]?.trim() || 
                       path.basename(item.fullPath, '.md').replace(/^Planeacion_/, '').replace(/_/g, ' ');
      const title = String(rawTitle);
      const filename = path.basename(item.fullPath);
      const isMasterIndex = item.slug.length === 1 || filename.startsWith('00_Indice_Maestro') || filename.includes('ISkool_Core');
      const renderedHtml = isMasterIndex ? renderSanitizedMarkdown(body) : '';
      const slugString = item.slug.join('/');

      const doc: ParsedVaultDoc = {
        slug: item.slug,
        slugString,
        filePath: item.fullPath,
        filename,
        frontmatter,
        title,
        rawContent: raw,
        markdownBody: body,
        renderedHtml,
        lastModified: stat.mtimeMs
      };

      // Indexación por ruta jerárquica
      docCacheBySlug.set(slugString.toLowerCase(), doc);
      
      // Indexación por nombre de archivo (para resolver enlaces simples o planos)
      const baseNameNoExt = path.basename(item.fullPath, '.md').toLowerCase();
      docCacheByFilename.set(baseNameNoExt, doc);

      slugsList.push(item.slug);

      // Si es un índice o archivo de raíz, registrar también con slug de un solo segmento
      if (item.slug.length === 1) {
        slugsList.push([item.slug[0]]);
      }
    } catch (e) {
      console.warn(`[Bóveda Curricular] Error indexando ${item.fullPath}:`, e);
    }
  }

  allSlugsCache = slugsList;
  lastScanTimestamp = now;
  console.log(`🚀 [Bóveda Curricular]: Indexadas ${docCacheBySlug.size} planeaciones en memoria (Pre-renderizado y Sanitizado listo).`);
}

/**
 * Obtiene todos los slugs de la bóveda para generateStaticParams() de Next.js SSG.
 */
export function getAllVaultPlanningSlugs(): Array<{ slug: string[] }> {
  buildOrGetVaultIndex();
  if (!allSlugsCache) return [];
  return allSlugsCache.map(slug => ({ slug }));
}

/**
 * Recupera una planeación pre-renderizada desde la memoria por su slug.
 */
export function getVaultPlanningBySlug(slug: string[]): ParsedVaultDoc | null {
  buildOrGetVaultIndex();
  if (!slug || slug.length === 0) return null;

  const searchKey = slug.join('/').toLowerCase();
  let foundDoc: ParsedVaultDoc | null = null;
  
  // 1. Coincidencia exacta por ruta
  if (docCacheBySlug.has(searchKey)) {
    foundDoc = docCacheBySlug.get(searchKey)!;
  } else {
    // 2. Coincidencia por nombre de archivo último segmento
    const lastSegment = slug[slug.length - 1].toLowerCase().replace(/\.md$/, '');
    if (docCacheByFilename.has(lastSegment)) {
      foundDoc = docCacheByFilename.get(lastSegment)!;
    } else {
      // 3. Coincidencia aproximada o con decodificación
      const decodedSearch = decodeURIComponent(searchKey);
      if (docCacheBySlug.has(decodedSearch)) {
        foundDoc = docCacheBySlug.get(decodedSearch)!;
      }
    }
  }

  if (foundDoc && !foundDoc.renderedHtml) {
    foundDoc.renderedHtml = renderSanitizedMarkdown(foundDoc.markdownBody);
  }

  return foundDoc;
}

/**
 * Invalida la caché de la bóveda para cuando se guarda una nueva planeación.
 */
export function invalidateVaultCache(): void {
  docCacheBySlug.clear();
  docCacheByFilename.clear();
  allSlugsCache = null;
  lastScanTimestamp = 0;
}
