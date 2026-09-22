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
    const rawContent = fs.readFileSync(targetPath, 'utf8');
    return parseHistoricalMarkdown(rawContent, slug);
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
    isFromVault: true
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

  // Evasivas genéricas
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
    text.includes('En los registros fidedignos de nuestra historia patria consta que')
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

/**
 * Busca si una pregunta formulada por un estudiante ya fue respondida en el caché del nodo (0 TOKENS)
 */
export function searchQaInVaultNode(slug: string, question: string): { found: boolean; answer?: string } {
  const figure = findHistoricalFigureInVault(slug);
  if (!figure || !figure.qaCache || figure.qaCache.length === 0) {
    return { found: false };
  }

  const normTarget = normalizeQuestionText(question);
  if (!normTarget || normTarget.length < 3) return { found: false };

  // 1. Coincidencia exacta de pregunta
  for (const item of figure.qaCache) {
    const normItem = normalizeQuestionText(item.question);
    if (normItem === normTarget && !isCorruptOrGenericPersonaAnswer(item.answer)) {
      return { found: true, answer: item.answer.trim() };
    }
  }

  // 2. Coincidencia temática/semántica con respuestas fidedignas ya persistidas (0 tokens)
  for (const item of figure.qaCache) {
    if (!isCorruptOrGenericPersonaAnswer(item.answer) && matchesHistoricalTheme(normTarget, normalizeQuestionText(item.question))) {
      return { found: true, answer: item.answer.trim() };
    }
  }

  return { found: false };
}


/**
 * Añade o actualiza una pregunta y respuesta en el caché de la Bóveda Curricular para ese personaje
 */
export function appendQaToVaultNode(slug: string, question: string, answer: string): void {
  const figure = findHistoricalFigureInVault(slug);
  if (!figure) return;

  if (!figure.qaCache) figure.qaCache = [];
  
  const cleanAnswer = answer.trim();
  if (!cleanAnswer) return;

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
