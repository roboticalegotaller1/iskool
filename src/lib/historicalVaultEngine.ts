import fs from 'fs';
import path from 'path';
import { 
  HistoricalFigureBlockData, 
  HistoricalFigureMoment, 
  HistoricalKeyLocation, 
  HistoricalVerificationQuestion, 
  BookSpineStyle 
} from '@/types/studioBlocks';

/**
 * Rutas canónicas para la Bóveda Curricular / Segundo Cerebro
 * Cumple estrictamente con la Marca Blanca Institucional.
 */
export function getHistoricalVaultDirs(): { localDir: string; desktopDir: string | null } {
  const localDir = path.join(process.cwd(), 'personajes_historicos');
  if (!fs.existsSync(localDir)) {
    try {
      fs.mkdirSync(localDir, { recursive: true });
    } catch {
      // Ignorar si no se puede crear
    }
  }

  const desktopVaultRoot = 'C:\\Users\\kami-\\Desktop\\2025-2026\\iskool\\obsidean\\brain\\iskool';
  let desktopDir: string | null = null;
  if (fs.existsSync(desktopVaultRoot)) {
    desktopDir = path.join(desktopVaultRoot, 'personajes_historicos');
    if (!fs.existsSync(desktopDir)) {
      try {
        fs.mkdirSync(desktopDir, { recursive: true });
      } catch {
        // Ignorar si falla
      }
    }
  }

  return { localDir, desktopDir };
}

/**
 * Normaliza nombres a slugs limpios para nombres de archivo y enlaces bidireccionales
 */
export function normalizeHistoricalSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Normaliza texto para búsqueda exacta de preguntas en el caché de la Bóveda Curricular
 */
export function normalizeQuestionText(q: string): string {
  return q
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[¿?¡!.,:;()"'`_/\-\\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

interface CachedHistoricalFigure {
  data: HistoricalFigureBlockData;
  mtimeMs: number;
  filePath: string;
}

const historicalFigureMemoryCache = new Map<string, CachedHistoricalFigure>();

export function invalidateHistoricalFigureCache(slug?: string): void {
  if (slug) {
    historicalFigureMemoryCache.delete(slug);
  } else {
    historicalFigureMemoryCache.clear();
  }
}

/**
 * Busca un personaje o sitio histórico en la Bóveda Curricular (Búsqueda Prioritaria / Cache-First)
 */
export function findHistoricalFigureInVault(nameOrSlug: string): HistoricalFigureBlockData | null {
  if (!nameOrSlug || !nameOrSlug.trim()) return null;

  let slug = normalizeHistoricalSlug(nameOrSlug);
  const { localDir, desktopDir } = getHistoricalVaultDirs();

  const ALIASES: Record<string, string> = {
    'josefa_ortiz': 'josefa_ortiz_de_dominguez',
    'josefa': 'josefa_ortiz_de_dominguez',
    'la_corregidora': 'josefa_ortiz_de_dominguez',
    'corregidora': 'josefa_ortiz_de_dominguez',
    'dona_josefa': 'josefa_ortiz_de_dominguez',
    'dona_josefa_ortiz_de_dominguez': 'josefa_ortiz_de_dominguez',
    'pancho_villa': 'francisco_villa',
    'villa': 'francisco_villa',
    'doroteo_arango': 'francisco_villa',
    'centauro_del_norte': 'francisco_villa',
    'el_centauro_del_norte': 'francisco_villa',
    'general_francisco_villa': 'francisco_villa',
  };

  if (ALIASES[slug]) {
    slug = ALIASES[slug];
  }

  let targetPath = path.join(localDir, `${slug}.md`);
  if (!fs.existsSync(targetPath) && desktopDir) {
    const dPath = path.join(desktopDir, `${slug}.md`);
    if (fs.existsSync(dPath)) {
      targetPath = dPath;
    }
  }

  // Si no se encuentra con coincidencia exacta de slug, buscar en los directorios por coincidencia de nombre o prefijo
  if (!fs.existsSync(targetPath)) {
    const searchDirs = [localDir];
    if (desktopDir) searchDirs.push(desktopDir);

    for (const d of searchDirs) {
      if (!fs.existsSync(d)) continue;
      const files = fs.readdirSync(d).filter(f => f.endsWith('.md'));
      
      // 1. Coincidencia por inicio de nombre de archivo o contención
      for (const file of files) {
        const fileBase = file.replace(/\.md$/, '');
        if (fileBase === slug || fileBase.startsWith(slug) || slug.startsWith(fileBase) || fileBase.includes(slug)) {
          targetPath = path.join(d, file);
          slug = fileBase;
          break;
        }
      }
      if (fs.existsSync(targetPath)) break;

      // 2. Coincidencia inspeccionando el título/frontmatter
      for (const file of files) {
        try {
          const filePath = path.join(d, file);
          const raw = fs.readFileSync(filePath, 'utf8');
          const titleMatch = raw.match(/^title:\s*(.+)$/m);
          if (titleMatch) {
            const fileTitleSlug = normalizeHistoricalSlug(titleMatch[1]);
            if (fileTitleSlug === slug || fileTitleSlug.includes(slug) || slug.includes(fileTitleSlug)) {
              targetPath = filePath;
              slug = file.replace(/\.md$/, '');
              break;
            }
          }
        } catch {
          // continuar
        }
      }
      if (fs.existsSync(targetPath)) break;
    }
  }

  if (!fs.existsSync(targetPath)) {
    return null;
  }

  try {
    const stat = fs.statSync(targetPath);
    const cached = historicalFigureMemoryCache.get(slug);
    if (cached && cached.mtimeMs === stat.mtimeMs && cached.filePath === targetPath) {
      return cached.data;
    }

    const rawContent = fs.readFileSync(targetPath, 'utf8');
    const parsed = parseHistoricalMarkdown(rawContent, slug);
    historicalFigureMemoryCache.set(slug, {
      data: parsed,
      mtimeMs: stat.mtimeMs,
      filePath: targetPath
    });
    return parsed;
  } catch (err) {
    console.error(`Error leyendo nodo de Bóveda Curricular [${slug}]:`, err);
    return null;
  }
}

/**
 * Parser de archivos Markdown con Frontmatter YAML y secciones estructuradas
 */
export function parseHistoricalMarkdown(rawContent: string, slug: string): HistoricalFigureBlockData {
  let frontmatterText = '';
  let bodyText = rawContent;

  if (rawContent.startsWith('---')) {
    const endIdx = rawContent.indexOf('---', 3);
    if (endIdx !== -1) {
      frontmatterText = rawContent.substring(3, endIdx).trim();
      bodyText = rawContent.substring(endIdx + 3).trim();
    }
  }

  // Parsear campos simples de YAML Frontmatter
  const getFmValue = (key: string): string => {
    const match = frontmatterText.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
    if (!match) return '';
    let val = match[1].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.substring(1, val.length - 1);
    }
    return val;
  };

  const characterName = getFmValue('title') || slug.replace(/_/g, ' ');
  const historicalEra = getFmValue('eraOrPeriod') || 'Independencia de México (1810)';
  const birthDeathDates = getFmValue('birthOrEstablishment') + (getFmValue('deathOrPresentState') ? ` - ${getFmValue('deathOrPresentState')}` : '');
  const isGeographicSite = getFmValue('entityType') === 'geographic_site' || getFmValue('isGeographicSite') === 'true';
  const rawSpine = getFmValue('bookSpineStyle') as BookSpineStyle;
  const bookSpineStyle: BookSpineStyle = ['codice_antiguo', 'tomo_imperial', 'diario_republicano', 'grimorio_dorado', 'cuaderno_cronista'].includes(rawSpine)
    ? rawSpine
    : 'diario_republicano';
  const avatarImageUrl = getFmValue('avatarImageUrl') || '/images/history/josefa_ortiz_avatar.png';
  const voiceId = getFmValue('voiceId');
  const voiceCohort = getFmValue('voiceCohort') as HistoricalFigureBlockData['voiceCohort'];
  const voiceRate = getFmValue('voiceRate');
  const voicePitch = getFmValue('voicePitch');
  const oratoricalTone = getFmValue('oratoricalTone');
  const narratorMode = getFmValue('narratorMode');

  // Parsear secciones del cuerpo
  const sections = bodyText.split(/^##\s+/m);
  let shortBio = '';
  let detailedContext = '';
  const moments: HistoricalFigureMoment[] = [];
  const keyLocations: HistoricalKeyLocation[] = [];
  let videoClip: HistoricalFigureBlockData['videoClip'] = undefined;
  const qaCache: Array<{ question: string; answer: string; timestamp?: number }> = [];
  const verificationQuestions: HistoricalVerificationQuestion[] = [];

  sections.forEach(sec => {
    const trimmed = sec.trim();
    if (!trimmed) return;
    const lines = trimmed.split('\n');
    const header = lines[0].trim().toLowerCase();
    const content = lines.slice(1).join('\n').trim();

    if (header.includes('biografía') || header.includes('contexto')) {
      const paragraphs = content.split('\n\n').map(p => p.trim()).filter(Boolean);
      shortBio = paragraphs[0] || '';
      detailedContext = paragraphs.slice(1).join('\n\n') || paragraphs[0] || '';
    } else if (header.includes('momentos') || header.includes('novela gráfica') || header.includes('comic')) {
      // Parsear bloques de momentos clave
      const momentBlocks = content.split(/^###\s+/m);
      momentBlocks.forEach((mBlock, idx) => {
        const mTrim = mBlock.trim();
        if (!mTrim) return;
        const mLines = mTrim.split('\n');
        const mTitle = mLines[0].trim();
        const mBody = mLines.slice(1).join('\n');

        const yearMatch = mBody.match(/\*\*Fecha\*\*:\s*([^\n]+)/i);
        const locMatch = mBody.match(/\*\*Lugar\*\*:\s*([^\n]+)/i);
        const coordsMatch = mBody.match(/\*\*Coordenadas\*\*:\s*([0-9.-]+)\s*,\s*([0-9.-]+)/i);
        const imgMatch = mBody.match(/!\[.*?\]\((.*?)\)/);
        const captionMatch = mBody.match(/\*\*Narrativa\*\*:\s*([^\n]+)/i) || mBody.match(/>\s*(.+)/);

        moments.push({
          id: `m-${idx + 1}`,
          yearOrPeriod: yearMatch ? yearMatch[1].trim() : '1810',
          title: mTitle || `Momento Histórico ${idx + 1}`,
          description: mBody.replace(/\*\*.*?\*\*:[^\n]+/g, '').replace(/!\[.*?\]\(.*?\)/g, '').trim(),
          imageUrl: imgMatch ? imgMatch[1].trim() : '/images/history/josefa_conspiracion_comic_1.png',
          locationName: locMatch ? locMatch[1].trim() : 'Santiago de Querétaro',
          coordinates: {
            lat: coordsMatch ? parseFloat(coordsMatch[1]) : 20.5930,
            lng: coordsMatch ? parseFloat(coordsMatch[2]) : -100.3920
          },
          narrativeCaption: captionMatch ? captionMatch[1].trim() : mTitle
        });
      });
    } else if (header.includes('cartogr') || header.includes('hitos') || header.includes('mapa')) {
      const locBlocks = content.split(/^###\s+/m);
      locBlocks.forEach((lBlock, idx) => {
        const lTrim = lBlock.trim();
        if (!lTrim) return;
        const lLines = lTrim.split('\n');
        const lTitle = lLines[0].trim();
        const lBody = lLines.slice(1).join('\n');

        const coordsMatch = lBody.match(/\*\*Coordenadas\*\*:\s*([0-9.-]+)\s*,\s*([0-9.-]+)/i);
        const stateMatch = lBody.match(/\*\*Estado\*\*:\s*([^\n]+)/i);
        const imgMatch = lBody.match(/!\[.*?\]\((.*?)\)/);

        keyLocations.push({
          id: `loc-${idx + 1}`,
          name: lTitle,
          stateOrCountry: stateMatch ? stateMatch[1].trim() : 'Querétaro, México',
          coordinates: {
            lat: coordsMatch ? parseFloat(coordsMatch[1]) : 20.5930,
            lng: coordsMatch ? parseFloat(coordsMatch[2]) : -100.3920
          },
          significance: lBody.replace(/\*\*.*?\*\*:[^\n]+/g, '').replace(/!\[.*?\]\(.*?\)/g, '').trim(),
          imageUrl: imgMatch ? imgMatch[1].trim() : undefined,
          currentDayPhoto: imgMatch ? imgMatch[1].trim() : undefined
        });
      });
    } else if (header.includes('cápsula') || header.includes('video') || header.includes('cinematogr')) {
      const vUrlMatch = content.match(/\*\*URL\*\*:\s*([^\n]+)/i) || content.match(/https?:\/\/[^\s)]+/);
      const vDurMatch = content.match(/\*\*Duración\*\*:\s*([0-9]+)/i);
      const vTitleMatch = content.match(/\*\*Título\*\*:\s*([^\n]+)/i);
      const scriptMatch = content.match(/\*\*Guion\*\*:\s*([\s\S]+)/i);

      videoClip = {
        videoUrl: vUrlMatch ? (Array.isArray(vUrlMatch) ? vUrlMatch[1] || vUrlMatch[0] : vUrlMatch) : 'https://youtu.be/25cq1V8AsTg',
        durationSeconds: vDurMatch ? parseInt(vDurMatch[1], 10) : 20,
        title: vTitleMatch ? vTitleMatch[1].trim() : 'Cápsula Histórica Narrada',
        narratorScript: scriptMatch ? scriptMatch[1].trim() : 'Momento clave de la historia insurgente narrado con emoción.'
      };
    } else if (header.includes('preguntas y respuestas') || header.includes('caché') || header.includes('registro')) {
      // Parsear Q&A caché
      const qaBlocks = content.split(/^###\s+Q:\s*/m);
      qaBlocks.forEach(qa => {
        const qaTrim = qa.trim();
        if (!qaTrim) return;
        const [qLine, ...aLines] = qaTrim.split(/\n\s*A:\s*/);
        if (qLine && aLines.length > 0) {
          qaCache.push({
            question: qLine.trim(),
            answer: aLines.join('\n').trim(),
            timestamp: Date.now()
          });
        }
      });
    } else if (header.includes('verificación') || header.includes('reactivos') || header.includes('preguntas clave')) {
      const qBlocks = content.split(/^###\s+/m);
      qBlocks.forEach((qBlock, idx) => {
        const qTrim = qBlock.trim();
        if (!qTrim) return;
        const qLines = qTrim.split('\n');
        const qQuestion = qLines[0].trim();
        const qBody = qLines.slice(1).join('\n');

        const options: string[] = [];
        let correctIndex = 0;
        const optionMatches = qBody.match(/- \[[ xX]\]\s*([^\n]+)/g);
        if (optionMatches) {
          optionMatches.forEach((optStr, optIdx) => {
            const isCorr = optStr.includes('[x]') || optStr.includes('[X]');
            if (isCorr) correctIndex = optIdx;
            options.push(optStr.replace(/- \[[ xX]\]\s*/, '').trim());
          });
        }

        const expMatch = qBody.match(/\*\*Retroalimentación\*\*:\s*([^\n]+)/i);
        const pdaMatch = qBody.match(/\*\*PDA\*\*:\s*([^\n]+)/i);

        if (qQuestion && options.length > 0) {
          verificationQuestions.push({
            id: `vq-${idx + 1}`,
            question: qQuestion,
            options,
            correctIndex,
            explanation: expMatch ? expMatch[1].trim() : '¡Excelente comprensión del acontecimiento histórico!',
            pdaRelevance: pdaMatch ? pdaMatch[1].trim() : 'Ética, Naturaleza y Sociedades'
          });
        }
      });
    }
  });

  return {
    characterName,
    isGeographicSite,
    historicalEra,
    birthDeathDates,
    shortBio: shortBio || `${characterName} es un personaje fundamental en la historia.`,
    detailedContext: detailedContext || shortBio,
    avatarImageUrl,
    bookSpineStyle,
    moments,
    keyLocations,
    videoClip,
    verificationQuestions,
    qaCache,
    vaultNodeSlug: slug,
    isFromVault: true,
    voiceId: voiceId || undefined,
    voiceCohort: voiceCohort || undefined,
    voiceRate: voiceRate || undefined,
    voicePitch: voicePitch || undefined,
    oratoricalTone: oratoricalTone || undefined,
    narratorMode: narratorMode || undefined
  };
}

/**
 * Serializa y guarda la información del personaje/sitio en la Bóveda Curricular.
 * Guarda en el proyecto local y en el Segundo Cerebro de escritorio si existe.
 */
export function saveHistoricalFigureToVault(data: HistoricalFigureBlockData): { success: boolean; localPath: string; desktopPath?: string } {
  const slug = data.vaultNodeSlug || normalizeHistoricalSlug(data.characterName);
  const { localDir, desktopDir } = getHistoricalVaultDirs();

  const markdownContent = serializeHistoricalToMarkdown(data, slug);
  const localPath = path.join(localDir, `${slug}.md`);

  try {
    fs.writeFileSync(localPath, markdownContent, 'utf8');

    let desktopPath: string | undefined = undefined;
    if (desktopDir && fs.existsSync(desktopDir)) {
      desktopPath = path.join(desktopDir, `${slug}.md`);
      try {
        fs.writeFileSync(desktopPath, markdownContent, 'utf8');
      } catch (dErr) {
        console.warn('No se pudo duplicar al Segundo Cerebro de escritorio:', dErr);
      }
    }

    invalidateHistoricalFigureCache(slug);
    return { success: true, localPath, desktopPath };
  } catch (err) {
    console.error(`Error guardando en Bóveda Curricular [${slug}]:`, err);
    return { success: false, localPath };
  }
}

/**
 * Convierte un objeto HistoricalFigureBlockData a formato Markdown estructurado para Bóveda Curricular
 */
export function serializeHistoricalToMarkdown(data: HistoricalFigureBlockData, slug: string): string {
  const today = new Date().toISOString().split('T')[0];
  const tagsList = [
    `"[[${slug}]]"`,
    `"[[personajes_historicos]]"`,
    `"[[${normalizeHistoricalSlug(data.historicalEra || 'historia')}]]"`
  ];

  let md = `---
title: "${data.characterName}"
type: "historical_node"
entityType: "${data.isGeographicSite ? 'geographic_site' : 'character'}"
eraOrPeriod: "${data.historicalEra || 'Historia de México'}"
birthOrEstablishment: "${data.birthDeathDates?.split('-')[0]?.trim() || ''}"
deathOrPresentState: "${data.birthDeathDates?.split('-')[1]?.trim() || ''}"
bookSpineStyle: "${data.bookSpineStyle || 'diario_republicano'}"
avatarImageUrl: "${data.avatarImageUrl || '/images/history/josefa_ortiz_avatar.png'}"
voiceId: "${data.voiceId || ''}"
voiceCohort: "${data.voiceCohort || ''}"
voiceRate: "${data.voiceRate || '-5%'}"
voicePitch: "${data.voicePitch || '-2Hz'}"
oratoricalTone: "${data.oratoricalTone || ''}"
narratorMode: "${data.narratorMode || ''}"
tags:
${tagsList.map(t => `  - ${t}`).join('\n')}
lastUpdated: "${today}"
---

# ${data.characterName}

## Biografía y Contexto Histórico
${data.shortBio}

${data.detailedContext}

## 4 Momentos Históricos Clave (Novela Gráfica)
${(data.moments || []).map((m, idx) => `### ${m.title || `Momento ${idx + 1}`}
**Fecha**: ${m.yearOrPeriod}
**Lugar**: ${m.locationName}
**Coordenadas**: ${m.coordinates.lat}, ${m.coordinates.lng}
**Narrativa**: ${m.narrativeCaption}

![${m.title}](${m.imageUrl})

${m.description}
`).join('\n')}

## Hitos Cartográficos y Geográficos
${(data.keyLocations || []).map(loc => `### ${loc.name}
**Estado**: ${loc.stateOrCountry}
**Coordenadas**: ${loc.coordinates.lat}, ${loc.coordinates.lng}

${loc.significance}
${loc.imageUrl ? `\n![${loc.name}](${loc.imageUrl})\n` : ''}
`).join('\n')}

## Cápsula Cinematográfica y Video
${data.videoClip ? `**Título**: ${data.videoClip.title}
**URL**: ${data.videoClip.videoUrl}
**Duración**: ${data.videoClip.durationSeconds} segundos

**Guion**:
${data.videoClip.narratorScript}
` : 'No se ha configurado cápsula de video aún.'}

## Registro de Preguntas y Respuestas (Caché Bóveda Curricular - 0 Tokens)
${(data.qaCache && data.qaCache.length > 0) 
  ? data.qaCache.map(qa => `### Q: ${qa.question}\nA: ${qa.answer}\n`).join('\n')
  : '<!-- Las preguntas realizadas por los alumnos se guardan aquí para reutilizarse con 0 tokens -->'
}

## 5 Preguntas Clave de Verificación Formativa
${(data.verificationQuestions || []).map((q, idx) => `### ${idx + 1}. ${q.question.replace(/^(\d+\.\s*)+/, '').trim()}
${q.options.map((opt, oIdx) => `- [${oIdx === q.correctIndex ? 'x' : ' '}] ${opt}`).join('\n')}

**Retroalimentación**: ${q.explanation}
**PDA**: ${q.pdaRelevance || 'Ética, Naturaleza y Sociedades'}
`).join('\n\n')}
`;

  return md;
}

/**
 * Validador estricto para rechazar respuestas genéricas, evasivas, con marcas
 * o que violen el canon de 1ª persona estricta.
 */
export function isCorruptOrGenericPersonaAnswer(answer: string): boolean {
  if (!answer || answer.trim().length < 20) return true;
  
  const text = answer.trim();

  // Prefijos metadiscursivos prohibidos ("Como General...", "Como Doña Josefa...", etc.)
  if (/^Como\s+[A-ZÁÉÍÓÚÑ]/i.test(text)) return true;
  if (text.includes('no fue un capricho de cuartel')) return true;
  if (text.includes('Con la serenidad del deber cumplido, afirmo que')) return true;
  if (text.includes('Como General Francisco Villa')) return true;
  if (text.includes('Como Doña Josefa')) return true;
  if (text.includes('Como Miguel Hidalgo')) return true;
  if (text.includes('Como José María Morelos')) return true;
  if (text.includes('Como Leona Vicario')) return true;
  if (text.includes('Como Ignacio Allende')) return true;

  // Fugas de Metadatos, Scratchpad o Prompt del Sistema (TERMINANTEMENTE PROHIBIDO)
  if (
    text.includes('* Persona:') ||
    text.includes('Persona:') ||
    text.includes('Constraint') ||
    text.includes('Audience:') ||
    text.includes('Historical records for') ||
    text.includes('Direct Answer') ||
    text.includes('Conciseness') ||
    text.includes('thoughtSignature') ||
    text.includes('Desired Output:') ||
    text.includes('Simple response:') ||
    /(persona:|audience:|constraint\s*\d|historical records for|direct answer|conciseness)/i.test(text) ||
    /^\s*\*\s*(persona|audience|constraint|question|instruction):/im.test(text)
  ) {
    return true;
  }

  // Evasivas genéricas y sermones abstractos prohibidos
  if (
    text.includes('Escudriña en los documentos') ||
    text.includes('Escudrina en los documentos') ||
    text.includes('miro con beneplácito') ||
    text.includes('Respecto a lo que me interrogas sobre') ||
    text.includes('he de responderte en primera persona y con la verdad histórica') ||
    text.includes('Escudriña en nuestras memorias') ||
    text.includes('Escudrina en nuestras memorias') ||
    text.includes('En aquellos años definitorios en Querétaro') ||
    text.includes('Frente a tu interrogante, ten por seguro') ||
    text.includes('En los registros documentales de nuestra historia patria consta que') ||
    text.includes('En los registros fidedignos de nuestra historia patria consta que') ||
    text.includes('Sobre lo que me preguntas, vivimos una época de profunda prueba') ||
    text.includes('Sobre lo que me preguntas, vivimos una época') ||
    text.includes('cada pensamiento, conversación y decisión en mi vida estuvo guiada por la rectitud moral') ||
    text.includes('En aquellos tiempos novohispanos cada pensamiento') ||
    text.includes('mi compromiso estuvo siempre enfocado en defender la justicia, la verdad') ||
    text.includes('En cada momento de mi trayectoria histórica actué con absoluta convicción cívica') ||
    text.includes('la templanza cívica y la lealtad a los principios eran la brújula innegociable') ||
    text.includes('Consagré mi existencia al mandato supremo de la libertad humana') ||
    text.includes('Consagre mi existencia al mandato supremo') ||
    text.includes('Mi causa en Dolores no buscó honores mundanos') ||
    text.includes('Mi causa en Dolores no busco honores mundanos') ||
    text.includes('devolver el pan, la justicia y la dignidad a los desposeídos')
  ) {
    return true;
  }

  // Anacronismos y farándula
  if (
    text.includes('exterminador') ||
    text.includes('El vestido de novia') ||
    text.includes('película animada') ||
    text.includes('película') ||
    text.includes('Héroes verdaderos') ||
    text.includes('Trayectoria') ||
    text.includes('Alicia de Roc') ||
    /\(19\d\d\)|\(20\d\d\)/.test(text)
  ) {
    return true;
  }

  // Habla en 3ª persona sobre sí mismo
  if (/^(Francisco Villa|Josefa Ortiz|Miguel Hidalgo|Benito Ju[aá]rez|Emiliano Zapata)\s+(fue|era|naci[oó]|muri[oó]|falleci[oó])/i.test(text)) {
    return true;
  }

  return false;
}

/**
 * Comparador temático/semántico para preguntas clave de historia
 */
export function matchesHistoricalTheme(q1: string, q2: string): boolean {
  const norm1 = normalizeQuestionText(q1);
  const norm2 = normalizeQuestionText(q2);

  // Muerte / Causa de muerte / Asesinato
  const deathRegex = /(muert|muri[oó]|morir|moriste|fallec|asesin|mataron|te mataron|lo mataron|quien te mat|quien lo mat|como te mat|como lo mat|como fue tu muerte|como fue su muerte|de que murio|de que moriste|emboscad|parral)/i;
  if (deathRegex.test(norm1) && deathRegex.test(norm2)) return true;

  // Nacimiento / Origen
  const birthRegex = /(donde naciste|donde naci[oó]|de donde eres|de donde era|lugar de nacimiento|ciudad natal|tierra natal)/i;
  if (birthRegex.test(norm1) && birthRegex.test(norm2)) return true;

  // Caballo / Animales
  const horseRegex = /(caballo|yegua|siete leguas)/i;
  if (horseRegex.test(norm1) && horseRegex.test(norm2)) return true;

  // Armas
  const weaponRegex = /(arma|armas|pistola|revolver|fusil|mauser|carabina|30-30)/i;
  if (weaponRegex.test(norm1) && weaponRegex.test(norm2)) return true;

  // Batallas
  const battleRegex = /(batalla|combate|toma de|zacatecas|ciudad juarez|torreon)/i;
  if (battleRegex.test(norm1) && battleRegex.test(norm2)) return true;

  // Causa / Por qué luchó
  const whyFightRegex = /(por que luchaste|por que lucho|que te motivo|que lo motivo|por que te levantaste)/i;
  if (whyFightRegex.test(norm1) && whyFightRegex.test(norm2)) return true;

  // Mensaje a los estudiantes
  const messageRegex = /(mensaje|consejo|que le dices a los j[oó]venes)/i;
  if (messageRegex.test(norm1) && messageRegex.test(norm2)) return true;

  return false;
}

export interface HistoricalQuestionAnalysis {
  normalizedQuestion: string;
  isNegated: boolean;
  interrogativeType: 
    | 'ASKING_NAMES'        // ¿cómo se llamaba(n)?, ¿quiénes eran?, ¿cuáles eran los nombres?
    | 'ASKING_COUNT'        // ¿cuántos?, ¿qué cantidad?
    | 'ASKING_LOCATION'     // ¿dónde?, ¿hacia dónde?
    | 'ASKING_DATE_TIME'    // ¿cuándo?, ¿en qué año?, ¿qué fecha?
    | 'ASKING_AGE'          // ¿qué edad?, ¿cuántos años?
    | 'ASKING_CAUSE_WHY'    // ¿por qué?, ¿cuál fue el motivo?
    | 'ASKING_METHOD_HOW'   // ¿cómo hiciste?, ¿de qué manera?
    | 'ASKING_CONFIRMATION' // ¿alguna vez?, ¿es verdad que?, ¿fuiste?
    | 'GENERAL';
  targetEntity: 
    | 'ENEMIES_RIVALS'
    | 'TRAITORS_BETRAYAL'
    | 'FRIENDS_ALLIES'
    | 'CHILDREN'
    | 'SPOUSE'
    | 'PARENTS'
    | 'SISTER'
    | 'CONSPIRATORS'
    | 'ALCAIDE_PEREZ'
    | 'WEAPONS'
    | 'WOUNDS_COMBAT'
    | 'CLOTHING'
    | 'FOOD'
    | 'DEATH_BURIAL'
    | 'BIRTHPLACE'
    | 'PRISON_CONVENT'
    | 'TACONEO_ALERT'
    | 'IDENTITY'
    | 'GENERAL';
  specificIntent: string;
  requiredKeywords?: string[];
  instructionForAI: string;
}

/**
 * Analizador Sintáctico y Semántico de Preguntas Históricas
 * Descompone el tipo de interrogación, polaridad (negación/aversión) y la entidad objetivo.
 */
export function analyzeHistoricalQuestion(question: string): HistoricalQuestionAnalysis {
  const norm = normalizeQuestionText(question);

  // Detección profunda de polaridad negativa, aversión o rechazo
  const isNegated = /(no te gust|no le gust|no te agrad|no le agrad|no comias|no comia|no querias|no queria|te desagrad|le desagrad|desagrad|disgust|odiab|detestab|rechazab|aborrec|repudi|asco|asquito|mal sabor|que te chocaba|que te fastidiaba|en contra de|repugnan)/i.test(norm);

  let interrogativeType: HistoricalQuestionAnalysis['interrogativeType'] = 'GENERAL';
  if (/(como se llamab|cual.*nombre|como se llama|quienes eran|quienes fueron|nombres de|que nombres|quien era|quien fue)/i.test(norm)) {
    interrogativeType = 'ASKING_NAMES';
  } else if (/(cuantos|cuantas|que cantidad|a cuantos|numero de)/i.test(norm)) {
    interrogativeType = 'ASKING_COUNT';
  } else if (/(donde|de donde|en que lugar|hacia donde|a donde|en que ciudad)/i.test(norm)) {
    interrogativeType = 'ASKING_LOCATION';
  } else if (/(cuando|en que ano|en que fecha|que dia|en que epoca)/i.test(norm)) {
    interrogativeType = 'ASKING_DATE_TIME';
  } else if (/(que edad|cuantos anos)/i.test(norm)) {
    interrogativeType = 'ASKING_AGE';
  } else if (/(por que|cual fue el motivo|a razon de|para que|a causa de)/i.test(norm)) {
    interrogativeType = 'ASKING_CAUSE_WHY';
  } else if (/(como hiciste|de que forma|como lograste|como avisaste|como te comunicabas|de que manera)/i.test(norm)) {
    interrogativeType = 'ASKING_METHOD_HOW';
  } else if (/(alguna vez|es verdad que|acaso|llegaste a|sufriste|tuviste|fuiste|saliste)/i.test(norm)) {
    interrogativeType = 'ASKING_CONFIRMATION';
  }

  // Identificación estricta de entidad objetivo (prioridad a entidades específicas sobre identidad general)
  let targetEntity: HistoricalQuestionAnalysis['targetEntity'] = 'GENERAL';
  if (/(enemig|adversari|rival|opositor|antagonist|contra quien luch|perseguidor|virrey|calleja|venegas|bataller|gachupin|realistas|ejercito realista)/i.test(norm)) {
    targetEntity = 'ENEMIES_RIVALS';
  } else if (/(traici|traidor|delat|delator|quien te delato|quien delato|quien te traiciono|quien los traiciono|arias|arriaga|buera)/i.test(norm)) {
    targetEntity = 'TRAITORS_BETRAYAL';
  } else if (/(amig|amiga|amistad|confidente|aliad|companero de lucha)/i.test(norm)) {
    targetEntity = 'FRIENDS_ALLIES';
  } else if (/(hijo|hija|hijos|hijas|descendencia|vastago|pequenos|ninos)/i.test(norm)) {
    targetEntity = 'CHILDREN';
  } else if (/(esposo|marido|conyuge|miguel dominguez|matrimonio|boda|casaste)/i.test(norm)) {
    targetEntity = 'SPOUSE';
  } else if (/(padres|papa|mama|progenitor)/i.test(norm)) {
    targetEntity = 'PARENTS';
  } else if (/(hermana|maria sotero)/i.test(norm)) {
    targetEntity = 'SISTER';
  } else if (/(conspirad|allende|hidalgo|aldama|abasolo|companeros)/i.test(norm)) {
    targetEntity = 'CONSPIRATORS';
  } else if (/(alcaide|ignacio perez|mensajero|jinete)/i.test(norm)) {
    targetEntity = 'ALCAIDE_PEREZ';
  } else if (/(herid|balazo|disparo|sangre|lastim|dolor fisico)/i.test(norm)) {
    targetEntity = 'WOUNDS_COMBAT';
  } else if (/(muert|moriste|muri[oó]|fallec|tumba|restos|panteon)/i.test(norm)) {
    targetEntity = 'DEATH_BURIAL';
  } else if (/(donde naciste|donde naci[oó]|de donde eres|de donde era|de donde fue|lugar de nacimiento|ciudad natal|tierra natal|donde creciste|donde es originari|de que estado eres)/i.test(norm)) {
    targetEntity = 'BIRTHPLACE';
  } else if (/(tacon|taconeo|zapato|tres golpes|golpeaste)/i.test(norm)) {
    targetEntity = 'TACONEO_ALERT';
  } else if (/(prisi|carcel|convento|santa clara|santa teresa|incomunicad)/i.test(norm)) {
    targetEntity = 'PRISON_CONVENT';
  } else if (/(arma|fusil|pistola|30-30|mauser|sable|espada)/i.test(norm)) {
    targetEntity = 'WEAPONS';
  } else if (/(ropa|vestid|sayas|rebozo|peineta)/i.test(norm)) {
    targetEntity = 'CLOTHING';
  } else if (/(comida|platillo|guiso|chocolate|manjar|alimento|comer|desayun|cenab|pan|atole)/i.test(norm)) {
    targetEntity = 'FOOD';
  } else if (
    /(quien eres tu|quien eres|como te llamas|cual es tu nombre|presentate|dime quien eres|hablame de ti|cuentame sobre ti|cual es tu biografia|dime tu biografia)/i.test(norm)
  ) {
    if (!/(enemig|espos|marid|hij|padr|herman|amig|virrey|alcaide|traidor|autor|personaje|rival|presidente)/i.test(norm)) {
      targetEntity = 'IDENTITY';
    }
  }

  // Sintetizar intención fina y directrices de validación
  let specificIntent = 'GENERAL_QUESTION';
  let requiredKeywords: string[] | undefined = undefined;
  let instructionForAI = 'Responde con fidelidad histórica en primera persona, contestando directamente la pregunta en la primera oración.';

  if (targetEntity === 'ENEMIES_RIVALS') {
    specificIntent = 'ENEMIES_RIVALS';
    instructionForAI = 'El estudiante pregunta quién era tu enemigo, adversario o contra quién luchabas. Responde directamente en primera persona indicando con nombres y hechos históricos reales quiénes fueron tus mayores opresores y adversarios (los virreyes Francisco Xavier Venegas y Félix María Calleja, los jueces de la Real Audiencia y los delatores que vendieron la conspiración como Joaquín Arias). Queda TERMINANTEMENTE PROHIBIDO hablar de tu propia biografía o presentarte como si fueras tu propio enemigo.';
  } else if (targetEntity === 'TRAITORS_BETRAYAL') {
    specificIntent = 'TRAITORS_BETRAYAL';
    instructionForAI = 'El estudiante pregunta quién te traicionó o delató la conspiración. Menciona en la primera oración con nombres exactos a los delatores: el capitán Joaquín Arias, Francisco Buera y Rafael Arriaga, explicando cómo vendieron la conjura a inicios de septiembre de 1810.';
  } else if (targetEntity === 'FRIENDS_ALLIES') {
    specificIntent = 'FRIENDS_ALLIES';
    instructionForAI = 'El estudiante pregunta quiénes eran tus amigos o aliados de mayor confianza. Menciona con afecto y respeto patriótico a don Miguel Hidalgo, Ignacio Allende, Juan Aldama, el alcaide Ignacio Pérez y heroínas como Leona Vicario.';
  } else if (targetEntity === 'IDENTITY') {
    specificIntent = 'WHO_AM_I';
    instructionForAI = 'Preséntate con dignidad en primera persona indicando tu nombre, lugar de origen y tu papel histórico en la independencia.';
  } else if (targetEntity === 'CHILDREN') {
    if (interrogativeType === 'ASKING_NAMES') {
      specificIntent = 'CHILDREN_NAMES';
      requiredKeywords = ['Mariano', 'Miguel', 'Dolores', 'Micaela', 'Juana', 'Josefa', 'Magdalena', 'Manuela', 'Ignacio', 'Camilo'];
      instructionForAI = 'El estudiante pide expresamente los NOMBRES de tus hijos. Menciona en la primera oración sus nombres reales (Mariano, Miguel, Dolores, Micaela, Juana, Josefa, Magdalena, Manuela, Ignacio, Camilo) y aclara que con don Miguel tuviste catorce hijos. Queda terminantemente prohibido evadir dar los nombres o hablar en abstracto.';
    } else if (interrogativeType === 'ASKING_COUNT') {
      specificIntent = 'CHILDREN_COUNT';
      requiredKeywords = ['catorce', '14'];
      instructionForAI = 'El estudiante pregunta cuántos hijos tuviste. Contesta de inmediato que tuviste catorce hijos con don Miguel Domínguez (además de criar a dos de su primer matrimonio).';
    } else if (norm.includes('prision') || norm.includes('carcel') || norm.includes('convento') || norm.includes('quedo') || norm.includes('cuido')) {
      specificIntent = 'CHILDREN_CARE_PRISON';
      instructionForAI = 'Explica directamente quién cuidó de tus hijos mientras estuviste recluida en los conventos de Santa Clara y Santa Teresa.';
    } else {
      specificIntent = 'CHILDREN_GENERAL';
    }
  } else if (targetEntity === 'SPOUSE') {
    if (interrogativeType === 'ASKING_NAMES') {
      specificIntent = 'SPOUSE_NAME';
      requiredKeywords = ['Miguel Domínguez', 'Miguel Dominguez'];
      instructionForAI = 'Indica directamente el nombre de tu esposo: don Miguel Domínguez Trujillo, Corregidor de Querétaro.';
    } else if (interrogativeType === 'ASKING_DATE_TIME') {
      specificIntent = 'MARRIAGE_DATE';
      requiredKeywords = ['1791'];
      instructionForAI = 'Indica el año de tu matrimonio (1791 en la Ciudad de México).';
    }
  } else if (targetEntity === 'PARENTS') {
    if (interrogativeType === 'ASKING_NAMES') {
      specificIntent = 'PARENTS_NAMES';
      requiredKeywords = ['Juan José Ortiz', 'María Manuela Girón', 'Juan Jose', 'Manuela Giron'];
      instructionForAI = 'Indica los nombres de tus padres: don Juan José Ortiz y doña María Manuela Girón.';
    }
  } else if (targetEntity === 'SISTER') {
    if (interrogativeType === 'ASKING_NAMES') {
      specificIntent = 'SISTER_NAME';
      requiredKeywords = ['María Sotero', 'Maria Sotero'];
      instructionForAI = 'Indica el nombre de tu hermana mayor: María Sotero Ortiz.';
    }
  } else if (targetEntity === 'FOOD') {
    if (isNegated) {
      specificIntent = 'FOOD_DISLIKES';
      instructionForAI = 'El estudiante pregunta qué comida NO le gustaba, le causaba aversión o repudiaba al personaje histórico. Contesta de inmediato en primera persona señalando los excesos culinarios virreinales que repudiaba (los pesados banquetes peninsulares rebosantes de manteca rancia, carnes grasosas y bacalao seco importado servidos con insolencia mientras el pueblo pasaba hambre) y los alimentos descompuestos o agrios (atoles agrios, frijoles desabridos, pan duro y mohoso) que sufrió durante su encierro en los conventos de Santa Clara y Santa Teresa. Queda TERMINANTEMENTE PROHIBIDO responder con platillos favoritos como mole, manchamanteles o chocolate.';
    } else {
      specificIntent = 'FOOD_FAVORITES';
      instructionForAI = 'El estudiante pregunta cuál era tu comida o platillo favorito. Menciona con afecto los manjares novohispanos como el mole de olla, el manchamanteles y el chocolate de metate batido con molinillo.';
    }
  } else if (targetEntity === 'WOUNDS_COMBAT') {
    specificIntent = 'WOUNDS_COMBAT_HURT';
    instructionForAI = 'Aclara directamente en la primera oración si saliste herida o no: no combatiste en las líneas de fuego con armas y no sufriste heridas de bala, pero tu padecimiento físico fue una grave afección pleuropulmonar por el encierro en los conventos de Santa Clara y Santa Teresa.';
  } else if (targetEntity === 'BIRTHPLACE') {
    specificIntent = 'BIRTHPLACE';
    instructionForAI = 'El estudiante pregunta expresamente DÓNDE NACISTE o cuál es tu lugar de origen. Contesta de inmediato en la primera oración en primera persona indicando tu lugar exacto de nacimiento (ciudad, hacienda o poblado y estado) y fecha de nacimiento. Queda TERMINANTEMENTE PROHIBIDO dar discursos políticos, sermones morales o hablar de la causa en general.';
  } else if (targetEntity === 'DEATH_BURIAL') {
    if (interrogativeType === 'ASKING_LOCATION') {
      specificIntent = 'RESTING_PLACE';
      requiredKeywords = ['Panteón de los Queretanos Ilustres', 'Queretanos Ilustres', 'Santa Teresa'];
    } else if (interrogativeType === 'ASKING_AGE') {
      specificIntent = 'DEATH_AGE';
      requiredKeywords = ['60 años', '60 anos', 'sesenta'];
    } else {
      specificIntent = 'DEATH_CAUSE';
      instructionForAI = 'Indica cómo y cuándo moriste: falleciste el 2 de marzo de 1829 a los 60 años en la Ciudad de México por una afección pulmonar.';
    }
  }

  return {
    normalizedQuestion: norm,
    isNegated,
    interrogativeType,
    targetEntity,
    specificIntent,
    requiredKeywords,
    instructionForAI
  };
}

/**
 * Validador estricto de concordancia semántica entre la pregunta y la respuesta.
 * Evita que respuestas genéricas o no pertinentes se entreguen o se almacenen en caché.
 */
export function isAnswerSemanticallyAligned(question: string, answer: string): boolean {
  if (!answer || isCorruptOrGenericPersonaAnswer(answer)) return false;
  const analysis = analyzeHistoricalQuestion(question);
  const normAnswer = answer.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // 1. Guardián de Identidad Cruzada: Si la pregunta indaga sobre enemigos, traidores, cónyuge, hijos o terceros,
  // la respuesta JAMÁS puede ser una auto-presentación biográfica ("Soy [Nombre]...").
  const isSelfIntroduction = /^(soy|mi nombre es)\s+([a-z\s]+)(conocida|conocido|llamada|llamado|naci|consagre)/i.test(normAnswer);
  if (['ENEMIES_RIVALS', 'TRAITORS_BETRAYAL', 'SPOUSE', 'CHILDREN', 'PARENTS', 'SISTER', 'ALCAIDE_PEREZ', 'FOOD_DISLIKES', 'WEAPONS', 'WOUNDS_COMBAT'].includes(analysis.specificIntent)) {
    if (isSelfIntroduction) {
      console.warn(`[SemanticGuard] Rechazada auto-presentación para pregunta de entidad externa: "${analysis.specificIntent}"`);
      return false;
    }
  }

  // 2. Guardián de Enemigos/Rivales: La respuesta DEBE contener al menos una referencia a los adversarios, opresores o virreyes
  if (analysis.specificIntent === 'ENEMIES_RIVALS') {
    const hasEnemyContext = /(enemig|virrey|virreyes|venegas|calleja|bataller|audiencia|corona|opresi|tiran|traidor|arias|arriaga|realista|adversari|huerta|terrateniente|pershing|maximiliano|frances|invasor|conservador|miramon|mejia|inquisicion|carranza|guajardo|hacendado|porfirio)/i.test(normAnswer);
    if (!hasEnemyContext) {
      console.warn(`[SemanticGuard] Rechazada respuesta a enemigos que no menciona adversarios u opresores.`);
      return false;
    }
  }

  // 3. Guardián de Traición/Delación: Debe contener a los delatores o hechos de la denuncia
  if (analysis.specificIntent === 'TRAITORS_BETRAYAL') {
    const hasBetrayalContext = /(delat|traici|arias|arriaga|buera|denuncia|cateo|descubier|elizondo|guajardo|carranco|salas barraza)/i.test(normAnswer);
    if (!hasBetrayalContext) return false;
  }

  // 4. Si la pregunta es sobre comida que NO le gustaba / aversión (FOOD_DISLIKES):
  if (analysis.specificIntent === 'FOOD_DISLIKES') {
    // Prohibir terminantemente respuestas que afirmen predilección o platillos favoritos
    if (/(predilecci[oó]n entra[nñ]able|platillo favorito|comida favorita|manjar predilecto|disfrutaba sobremanera|delicia|me encantaba)/i.test(normAnswer)) {
      return false;
    }
    // Debe contener términos verídicos de desagrado, desprecio o raciones carcelarias
    const hasDislikeTerms = /(desagrad|repudi|rechaz|aver|pesad|ranc|convento|prision|encierro|desabr|agri|miser|privaci|derroche|opulen)/i.test(normAnswer);
    if (!hasDislikeTerms) {
      return false;
    }
  }

  // 5. Si la pregunta es sobre comida favorita (FOOD_FAVORITES):
  if (analysis.specificIntent === 'FOOD_FAVORITES') {
    if (/(repudiaba con vehemencia|me desagradaban|raciones miserables|atoles agrios)/i.test(normAnswer) && !/(predileccion|favorit|disfrutaba|manjar)/i.test(normAnswer)) {
      return false;
    }
  }

  // 6. Si la pregunta es sobre lugar de nacimiento u origen (BIRTHPLACE):
  if (analysis.specificIntent === 'BIRTHPLACE') {
    const hasBirthTerms = /(naci|origen|originari|tierra natal|cuna|hacienda|rancho|ciudad|pueblo|penjamo|guanajuato|valladolid|morelia|durango|coyotada|guelatao|oaxaca|chihuahua|san miguel|guadalajara)/i.test(normAnswer);
    if (!hasBirthTerms) {
      console.warn(`[SemanticGuard] Rechazada respuesta a lugar de nacimiento que no menciona el lugar ni el verbo nacer.`);
      return false;
    }
  }

  // 7. Si la pregunta requería palabras clave obligatorias (como nombres concretos o fechas)
  if (analysis.requiredKeywords && analysis.requiredKeywords.length > 0) {
    const hasAnyRequired = analysis.requiredKeywords.some(kw => {
      const normKw = kw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return normAnswer.includes(normKw);
    });
    if (!hasAnyRequired) {
      return false; // La respuesta NO respondió lo preguntado
    }
  }

  return true;
}

/**
 * Busca si una pregunta formulada por un estudiante ya fue respondida en el caché del nodo (0 TOKENS)
 * REGLA ESTRICTA: Coincidencia EXACTA de pregunta y validación de concordancia semántica.
 * Si no es coincidencia exacta, retorna { found: false } para que el sistema use tokens reales de inmediato.
 */
export function searchQaInVaultNode(slug: string, question: string): { found: boolean; answer?: string } {
  const figure = findHistoricalFigureInVault(slug);
  if (!figure || !figure.qaCache || figure.qaCache.length === 0) {
    return { found: false };
  }

  const normTarget = normalizeQuestionText(question);
  if (!normTarget || normTarget.length < 3) return { found: false };

  // Coincidencia EXACTA de la pregunta en la Bóveda Curricular
  // Se erradica el matching difuso temático para no generar falsos positivos con polaridades opuestas.
  for (const item of figure.qaCache) {
    const normItem = normalizeQuestionText(item.question);
    if (normItem === normTarget) {
      if (isAnswerSemanticallyAligned(question, item.answer)) {
        return { found: true, answer: item.answer.trim() };
      } else {
        console.warn(`[Bóveda Curricular] Entrada en caché para "${item.question}" no concuerda semánticamente con la pregunta. Descartada para re-inferencia.`);
      }
    }
  }

  return { found: false };
}

/**
 * Añade o actualiza una pregunta y respuesta en el caché de la Bóveda Curricular para ese personaje
 * Exige concordancia semántica estricta para garantizar que el archivo Markdown de la Bóveda se mantenga inmaculado.
 */
export function appendQaToVaultNode(slug: string, question: string, answer: string): void {
  const figure = findHistoricalFigureInVault(slug);
  if (!figure) return;

  if (!figure.qaCache) figure.qaCache = [];
  
  const cleanAnswer = answer.trim();
  if (!cleanAnswer || !isAnswerSemanticallyAligned(question, cleanAnswer)) return;

  const normTarget = normalizeQuestionText(question);
  const existingIdx = figure.qaCache.findIndex(i => normalizeQuestionText(i.question) === normTarget);
  
  if (existingIdx !== -1) {
    figure.qaCache[existingIdx].question = question.trim();
    figure.qaCache[existingIdx].answer = cleanAnswer;
    figure.qaCache[existingIdx].timestamp = Date.now();
  } else {
    figure.qaCache.push({
      question: question.trim(),
      answer: cleanAnswer,
      timestamp: Date.now()
    });
  }
  saveHistoricalFigureToVault(figure);
}

/**
 * Lista todos los personajes y sitios históricos disponibles en la Bóveda Curricular
 */
export function listAllHistoricalFiguresInVault(): Array<{ 
  slug: string; 
  name: string; 
  era?: string; 
  isGeographicSite?: boolean; 
  bookSpineStyle: BookSpineStyle;
  shortBio: string;
  avatarImageUrl: string;
}> {
  const { localDir, desktopDir } = getHistoricalVaultDirs();
  const resultMap = new Map<string, {
    slug: string; 
    name: string; 
    era?: string; 
    isGeographicSite?: boolean; 
    bookSpineStyle: BookSpineStyle;
    shortBio: string;
    avatarImageUrl: string;
  }>();

  const scanDir = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) return;
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      const slug = file.replace(/\.md$/, '');
      if (resultMap.has(slug)) continue;

      try {
        const content = fs.readFileSync(path.join(dirPath, file), 'utf8');
        const parsed = parseHistoricalMarkdown(content, slug);
        resultMap.set(slug, {
          slug,
          name: parsed.characterName,
          era: parsed.historicalEra,
          isGeographicSite: parsed.isGeographicSite,
          bookSpineStyle: parsed.bookSpineStyle,
          shortBio: parsed.shortBio,
          avatarImageUrl: parsed.avatarImageUrl
        });
      } catch (err) {
        console.warn(`Error al escanear archivo de Bóveda [${file}]:`, err);
      }
    }
  };

  scanDir(localDir);
  if (desktopDir) {
    scanDir(desktopDir);
  }

  return Array.from(resultMap.values());
}
