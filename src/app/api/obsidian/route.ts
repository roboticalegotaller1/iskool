import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { validateApiAuth } from '@/lib/authValidator';
import { 
  generateChronometerSessions,
  generateChronometer10Sessions, 
  getArticulatedPdas, 
  generateFinalProjectProposal,
  cleanCoreTopicName,
  generateDetonatingQuestions,
  sanitizeSpanishPedagogicalGrammar
} from '@/lib/curriculumEngine';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

const OBSIDIAN_VAULT_PATH = process.env.OBSIDIAN_VAULT_PATH || 'C:\\Users\\kami-\\Desktop\\2025-2026\\iskool\\obsidean\\brain\\iskool';

const ObsidianQuerySchema = z.object({
  q: z.string().trim().min(1, 'El parámetro de búsqueda "q" es requerido').max(300),
  level: z.string().trim().max(100).optional().default(''),
  grade: z.string().trim().max(100).optional().default(''),
  subject: z.string().trim().max(100).optional().default(''),
  sessions: z.string().trim().max(10).optional().default('10')
});

const ObsidianPlanningSchema = z.object({
  title: z.string().trim().min(2, 'El título es obligatorio y debe contener al menos 2 caracteres').max(250),
  teacherName: z.string().trim().max(150).optional(),
  levelName: z.string().trim().max(100).optional(),
  nivel: z.string().trim().max(100).optional(),
  gradeName: z.string().trim().max(100).optional(),
  grado: z.string().trim().max(100).optional(),
  fase: z.string().trim().max(100).optional(),
  subjectName: z.string().trim().max(150).optional(),
  asignatura: z.string().trim().max(150).optional(),
  campoFormativo: z.string().trim().max(200).optional(),
  ejesArticuladores: z.array(z.string()).optional(),
  duration: z.string().trim().max(100).optional(),
  pda: z.string().trim().max(500).optional(),
  preguntasDetonadoras: z.array(z.string()).optional(),
  inicio: z.string().trim().max(5000).optional(),
  desarrollo: z.string().trim().max(5000).optional(),
  cierre: z.string().trim().max(5000).optional(),
  evaluacion: z.string().trim().max(5000).optional(),
  materiales: z.string().trim().max(5000).optional(),
  syncGit: z.boolean().optional(),
  isSuperUser: z.boolean().optional()
});

const SPANISH_STOPWORDS = new Set([
  'de', 'la', 'el', 'los', 'las', 'un', 'una', 'unos', 'unas',
  'en', 'y', 'a', 'para', 'por', 'con', 'sin', 'al', 'del',
  'que', 'como', 'sobre', 'su', 'sus', 'mi', 'mis', 'tu', 'tus',
  'alumnos', 'alumnas', 'estudiantes', 'ninos', 'ninas',
  'segundo', 'tercero', 'cuarto', 'quinto', 'sexto', 'primer', 'primero',
  'grado', 'grados', 'fase', 'fases', 'clase', 'tema', 'planeacion',
  'planeaciones', 'proyecto', 'proyectos', 'sesion', 'sesiones',
  'hice', 'daba', 'resultado', 'hacer', 'crear', 'generar', 'verificar'
]);

function cleanString(str: string) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function sanitizeFolderName(str: string): string {
  if (!str) return 'General';
  const clean = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  const safe = clean.replace(/[^a-zA-Z0-9\s_-]/g, '').replace(/\s+/g, '_');
  return safe || 'General';
}

function getAllMarkdownFiles(dirPath: string): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dirPath)) return results;
  const list = fs.readdirSync(dirPath);
  for (const file of list) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllMarkdownFiles(filePath));
    } else if (file.endsWith('.md')) {
      results.push(filePath);
    }
  }
  return results;
}

function formatSpanishDateInLetters(dateInput?: string | Date): string {
  const d = dateInput ? (typeof dateInput === 'string' && dateInput.includes('de') ? null : new Date(dateInput)) : new Date();
  if (!d || isNaN(d.getTime())) {
    if (typeof dateInput === 'string' && dateInput.length > 0) return dateInput;
    return formatSpanishDateInLetters(new Date());
  }
  const day = d.getDate();
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  return `${day} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
}

interface CachedNodeMeta {
  filePath: string;
  filename: string;
  cleanFilename: string;
  cleanPath: string;
  cleanTopic: string;
  cleanPda: string;
}

let vaultIndexCache: CachedNodeMeta[] | null = null;
let lastIndexTime = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos

function getOrBuildVaultIndex(planningsDir: string): CachedNodeMeta[] {
  const now = Date.now();
  if (vaultIndexCache && (now - lastIndexTime) < CACHE_TTL_MS) {
    return vaultIndexCache;
  }

  const allFiles = getAllMarkdownFiles(planningsDir);
  const newIndex: CachedNodeMeta[] = [];

  for (const filePath of allFiles) {
    const filename = path.basename(filePath);
    const cleanFilename = cleanString(filename);
    const cleanPath = cleanString(filePath);

    // Extracción ultrarrápida de tema/pda desde el nombre o metadatos de ruta
    let cleanTopic = cleanFilename.replace(/^planeacion_/, '').replace(/\.md$/, '').replace(/_/g, ' ');
    let cleanPda = '';

    newIndex.push({
      filePath,
      filename,
      cleanFilename,
      cleanPath,
      cleanTopic,
      cleanPda
    });
  }

  vaultIndexCache = newIndex;
  lastIndexTime = now;
  return newIndex;
}

export async function GET(request: NextRequest) {
  try {
    // 1. Validación de Sesión y Autenticación
    const auth = await validateApiAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json(
        { found: false, error: auth.error || 'No autorizado. Se requiere sesión activa.' },
        { status: 401 }
      );
    }

    // 2. Sanitización y validación de parámetros con Zod
    const { searchParams } = new URL(request.url);
    const parsedQuery = ObsidianQuerySchema.safeParse({
      q: searchParams.get('q') || '',
      level: searchParams.get('level') || '',
      grade: searchParams.get('grade') || '',
      subject: searchParams.get('subject') || '',
      sessions: searchParams.get('sessions') || '10'
    });

    if (!parsedQuery.success) {
      return NextResponse.json(
        { found: false, error: parsedQuery.error.issues[0]?.message || 'Parámetros inválidos' },
        { status: 400 }
      );
    }

    const { q: query, level: levelParam, grade: gradeParam, subject: subjectParam, sessions: sessionsParam } = parsedQuery.data;
    const sessionCount = parseInt(sessionsParam || '10', 10) || 10;
    
    if (!fs.existsSync(OBSIDIAN_VAULT_PATH)) {
      return NextResponse.json({ found: false, note: null });
    }

    const isSearchingIndependence = /independ|hidalgo|morelos|allende|aldama|josefa|iturbide|dolores/i.test(query);
    const isSearchingRevolution = !isSearchingIndependence && /revoluc|madero|zapata|villa|carranza|porfir/i.test(query);

    let cleanQuery = cleanString(query);
    if (isSearchingIndependence) {
      cleanQuery = cleanQuery.replace(/independ[a-z]*/i, 'independencia');
    }
    if (isSearchingRevolution) {
      cleanQuery = cleanQuery.replace(/revoluc[a-z]*/i, 'revolucion');
    }

    let queryWords = cleanQuery
      .split(/[\s,;+-_/]+/)
      .map(w => w.trim())
      .filter(w => w.length >= 3 && !SPANISH_STOPWORDS.has(w));

    if (isSearchingIndependence && !queryWords.includes('independencia')) {
      queryWords.push('independencia');
    }
    if (isSearchingRevolution && !queryWords.includes('revolucion')) {
      queryWords.push('revolucion');
    }

    // Expansión semántica para términos matemáticos y científicos
    if (/(?:x\^?\{?2\}?|x²|x2|cuadrat)/i.test(query)) {
      queryWords.push('cuadratica', 'cuadraticas', 'algebra');
    }
    if (/(?:pi|π|circulo|circunf)/i.test(query)) {
      queryWords.push('circunferencia', 'circulo', 'pi');
    }
    if (/(?:pitagoras|trigono)/i.test(query)) {
      queryWords.push('pitagoras', 'triangulo', 'trigonometria');
    }
    if (/(?:ph|acido|base)/i.test(query)) {
      queryWords.push('acidos', 'bases', 'neutralizacion');
    }

    const planningsDir = path.join(OBSIDIAN_VAULT_PATH, 'planeaciones');
    if (!fs.existsSync(planningsDir)) {
      return NextResponse.json({ found: false, note: null }, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } });
    }

    const allIndexed = getOrBuildVaultIndex(planningsDir);

    // Filtrado inteligente estricto por parámetros de nivel, grado y materia
    let candidateNodes = allIndexed;
    if (levelParam) {
      const cleanLevel = cleanString(levelParam);
      let levelKeywords: string[] = [cleanLevel];
      if (cleanLevel.includes('baja') || cleanLevel.includes('fase 3') || cleanLevel.includes('fase_3')) {
        levelKeywords = ['primaria_fase_3', 'fase_3', '1er_grado', '2do_grado', 'primaria baja', 'fase3'];
      } else if (cleanLevel.includes('media') || cleanLevel.includes('fase 4') || cleanLevel.includes('fase_4')) {
        levelKeywords = ['primaria_fase_4', 'fase_4', '3er_grado', '4to_grado', 'fase4'];
      } else if (cleanLevel.includes('alta') || cleanLevel.includes('fase 5') || cleanLevel.includes('fase_5')) {
        levelKeywords = ['primaria_fase_5', 'fase_5', '5to_grado', '6to_grado', 'primaria alta', 'fase5'];
      } else if (cleanLevel.includes('secundaria') || cleanLevel.includes('fase 6') || cleanLevel.includes('fase_6')) {
        levelKeywords = ['secundaria', 'fase_6', 'fase6'];
      } else if (cleanLevel.includes('preescolar') || cleanLevel.includes('fase 2') || cleanLevel.includes('fase_2')) {
        levelKeywords = ['preescolar', 'fase_2', 'fase2'];
      } else if (cleanLevel.includes('prepa') || cleanLevel.includes('bachill')) {
        levelKeywords = ['preparatoria', 'bachillerato', 'mccems'];
      }

      // Filtrado estricto por nivel educativo: si no existen archivos para ese nivel, no devolver notas de otros niveles
      candidateNodes = candidateNodes.filter(n => levelKeywords.some(kw => n.cleanPath.includes(kw)));
    }

    if (gradeParam) {
      const cleanGrade = cleanString(gradeParam);
      const filtered = candidateNodes.filter(n => n.cleanPath.includes(cleanGrade));
      if (filtered.length > 0) candidateNodes = filtered;
    }

    if (subjectParam) {
      const cleanSub = cleanString(subjectParam);
      let subKeywords = [cleanSub];
      if (cleanSub.includes('mat')) subKeywords.push('matematicas', 'mat');
      if (cleanSub.includes('cien') || cleanSub.includes('medio')) subKeywords.push('conocimiento_del_medio', 'ciencias', 'cie', 'bio', 'fis', 'qui');
      if (cleanSub.includes('esp') || cleanSub.includes('leng')) subKeywords.push('espanol', 'lenguajes', 'esp');
      if (cleanSub.includes('art')) subKeywords.push('artes', 'art');
      if (cleanSub.includes('civ') || cleanSub.includes('form') || cleanSub.includes('etic')) subKeywords.push('formacion_civica_y_etica', 'civ', 'etica');
      if (cleanSub.includes('fisic') || cleanSub.includes('deport')) subKeywords.push('educacion_fisica', 'fis');
      if (cleanSub.includes('socio') || cleanSub.includes('tutor')) subKeywords.push('educacion_socioemocional', 'tutoria', 'tut');
      if (cleanSub.includes('ent') || cleanSub.includes('his') || cleanSub.includes('geo') || cleanSub.includes('soc')) subKeywords.push('la_entidad_donde_vivo', 'entidad', 'historia', 'geografia', 'sociedades', 'ent', 'his', 'geo');

      const filtered = candidateNodes.filter(n => subKeywords.some(kw => n.cleanPath.includes(kw)));
      if (filtered.length > 0) candidateNodes = filtered;
    }

    let bestMatchNode: CachedNodeMeta | null = null;
    let bestScore = 0;

    for (const node of candidateNodes) {
      // Exclusión absoluta entre Revolución e Independencia para evitar mezclas aberrantes
      if (isSearchingIndependence) {
        if (/revoluci|madero|zapata|villa|carranza/i.test(node.cleanFilename) || /revoluci|madero|zapata|villa|carranza/i.test(node.cleanTopic)) {
          continue; // Descartar notas de Revolución si el docente busca Independencia
        }
        if (!/independ|hidalgo|morelos|allende|aldama|josefa|iturbide|dolores|insurg/i.test(node.cleanFilename) && !/independ|hidalgo|morelos|allende|aldama|josefa|iturbide|dolores|insurg/i.test(node.cleanTopic)) {
          continue; // La nota debe abordar directamente la Independencia
        }
      } else if (isSearchingRevolution) {
        if (/independ|hidalgo|morelos|allende|aldama|josefa|iturbide/i.test(node.cleanFilename) || /independ|hidalgo|morelos|allende|aldama|josefa|iturbide/i.test(node.cleanTopic)) {
          continue; // Descartar notas de Independencia si el docente busca Revolución
        }
        if (!/revoluc|madero|zapata|villa|carranza|porfir/i.test(node.cleanFilename) && !/revoluc|madero|zapata|villa|carranza|porfir/i.test(node.cleanTopic)) {
          continue; // La nota debe abordar directamente la Revolución
        }
      }

      let score = 0;
      let topicMatches = 0;
      queryWords.forEach(word => {
        const isGenericContextWord = word === 'mexico' || word === 'historia' || word === 'sociedad';
        if (node.cleanFilename.includes(word)) {
          score += isGenericContextWord ? 1 : 5;
          if (!isGenericContextWord) topicMatches++;
        } else if (node.cleanTopic.includes(word)) {
          score += isGenericContextWord ? 1 : 4;
          if (!isGenericContextWord) topicMatches++;
        } else if (node.cleanPath.includes(word)) {
          score += isGenericContextWord ? 0.5 : 2;
        }
      });

      if (levelParam && node.cleanPath.includes(cleanString(levelParam))) score += 2;
      if (gradeParam && node.cleanPath.includes(cleanString(gradeParam))) score += 2;
      if (subjectParam && node.cleanPath.includes(cleanString(subjectParam))) score += 2;

      // Requiere coincidencia directa con el tema central y puntaje mínimo sólido (>= 6)
      if (topicMatches > 0 && score >= 6 && score > bestScore) {
        bestScore = score;
        bestMatchNode = node;
      }
    }

    // Si encontramos una nota coincidente que pertenezca al nivel solicitado, leemos y parseamos
    if (bestMatchNode && bestScore >= 3) {
      const rawContent = fs.readFileSync(bestMatchNode.filePath, 'utf8');
      
      // Extracción de título
      const titleYaml = rawContent.match(/^tema:\s*"?(.*?)"?$/m) || rawContent.match(/^title:\s*"?(.*?)"?$/m);
      const titleMd = rawContent.match(/^#\s*(?:📚\s*)?(?:Proyecto Didáctico Integral:\s*)?(?:Planeación Didáctica:\s*)?(.*)$/m);
      const title = titleYaml ? titleYaml[1].trim() : (titleMd ? titleMd[1].trim() : bestMatchNode.filename.replace('.md', '').replace(/^Planeacion_/, ''));

      // Extracción de Campo Formativo
      const campoYaml = rawContent.match(/^campo_formativo:\s*"?(.*?)"?$/m);
      const campoMd = rawContent.match(/\*\*Campo Formativo:\*\*\s*(?:\[\[)?(.*?)(?:\]\])?$/m);
      const isEspPath = bestMatchNode.cleanPath.includes('espanol') || bestMatchNode.cleanPath.includes('lenguajes');
      const campoFormativo = campoYaml ? campoYaml[1].trim() : (campoMd ? campoMd[1].trim() : (isEspPath ? 'Lenguajes' : 'Saberes y Pensamiento Científico'));

      // Extracción de Grado y Nivel
      const levelYaml = rawContent.match(/^grado:\s*"?(.*?)"?$/m) || rawContent.match(/^nivel:\s*"?(.*?)"?$/m) || rawContent.match(/^fase:\s*"?(.*?)"?$/m);
      const levelMd = rawContent.match(/\*\*Nivel \/ Fase:\*\*\s*(?:\[\[)?(.*?)(?:\]\])?$/m) || rawContent.match(/\*\*Grado:\*\*\s*(?:\[\[)?(.*?)(?:\]\])?$/m);
      const levelName = levelYaml ? levelYaml[1].trim() : (levelMd ? levelMd[1].trim() : 'Fase 3');

      // Extracción de Asignatura
      const subjectYaml = rawContent.match(/^materia:\s*"?(.*?)"?$/m) || rawContent.match(/^disciplina:\s*"?(.*?)"?$/m) || rawContent.match(/^asignatura:\s*"?(.*?)"?$/m);
      const subjectMd = rawContent.match(/\*\*Asignatura \/ Disciplina:\*\*\s*(?:\[\[)?(.*?)(?:\]\])?$/m) || rawContent.match(/\*\*Disciplina \/ Materia:\*\*\s*(?:\[\[)?(.*?)(?:\]\])?$/m);
      const subjectName = subjectYaml ? subjectYaml[1].trim() : (subjectMd ? subjectMd[1].trim() : (campoFormativo.includes('Lenguajes') ? 'Español' : 'Matemáticas'));

      // Extracción de PDA
      const pdaYaml = rawContent.match(/PDA:\s*"([\s\S]*?)"/);
      const pdaQuote = rawContent.match(/## 🎯 (?:I\.\s*)?Proceso de Desarrollo de Aprendizaje[\s\S]*?>\s*\*\*"?([\s\S]*?)"?\*\*/);
      const pdaBlock = rawContent.match(/## 🎯 Proceso de Desarrollo de Aprendizaje[\s\S]*?```(?:yaml|text)?\n(?:PDA:\s*"?)?([\s\S]*?)"?\s*```/);
      const pdaMd = rawContent.match(/\*\*PDA:\*\*\s*(.*)/);
      const pda = pdaYaml ? pdaYaml[1].trim() : (pdaQuote ? pdaQuote[1].trim() : (pdaBlock ? pdaBlock[1].trim() : (pdaMd ? pdaMd[1].trim() : query)));

      // Extracción de Duración
      const durationYaml = rawContent.match(/^duracion:\s*"?(.*?)"?$/m) || rawContent.match(/^temporalidad:\s*"?(.*?)"?$/m);
      const durationMd = rawContent.match(/\*\*Temporalidad:\*\*\s*(.*)/) || rawContent.match(/\*\*Duración:\*\*\s*(.*)/);
      const duration = durationYaml ? durationYaml[1].trim() : (durationMd ? durationMd[1].trim() : '10 sesiones de 50 min (500 min)');

      // Preguntas detonadoras
      const preguntasBlock = rawContent.match(/## ❓ (?:II\.\s*)?Preguntas Detonadoras[\s\S]*?\n([\s\S]*?)(?=\n---|\n##|$)/) || rawContent.match(/### Preguntas Detonadoras[\s\S]*?\n([\s\S]*?)(?=\n---|\n##|$)/);
      const preguntas: string[] = [];
      if (preguntasBlock) {
        const lines = preguntasBlock[1].split('\n');
        for (const l of lines) {
          const cleanL = l.replace(/^[-*•\d.]+\s*/, '').replace(/^\*\*/, '').replace(/\*\*$/, '').trim();
          if (cleanL.length > 5) preguntas.push(cleanL);
        }
      }

      // Secuencia didáctica estructurada
      const fase1Match = rawContent.match(/(?:### 📌 SESIÓN 1|### 📌 FASE 1|### 🚀 Sesiones 1 y 2|### Inicio)[\s\S]*?\n([\s\S]*?)(?=### 📌 SESIÓN 3|### 🔬 FASE 2|### 🔬|### Desarrollo|$)/);
      const fase2Match = rawContent.match(/(?:### 📌 SESIÓN 3|### 📌 SESIÓN 4|### 🔬 FASE 2|### 💡 FASE 3|### 🔬 Sesiones 3 a 7|### Desarrollo)[\s\S]*?\n([\s\S]*?)(?=### 📌 SESIÓN 8|### 📌 SESIÓN 9|### 🌟 FASE 4|### 🏁|### Cierre|## 📋|## 📊|$)/);
      const fase3Match = rawContent.match(/(?:### 📌 SESIÓN 9|### 📌 SESIÓN 10|### 🌟 FASE 4|### 🏁 Sesiones 8 a 10|### Cierre)[\s\S]*?\n([\s\S]*?)(?=## 📋|## 📊|## 📦|$)/);
      const evalMatch = rawContent.match(/(?:## 📊 IV\.\s*Rúbrica Analítica|## 📋 IV\.\s*Evaluación Formativa|## 📊 Rúbrica Analítica|### Evaluación Formativa)[\s\S]*?\n([\s\S]*?)(?=## 📦|## 🔗|$)/);
      const matMatch = rawContent.match(/(?:## 📦 V\.\s*Recursos|## 📦 V\.\s*Materiales|## 📦 Materiales, Recursos|### Materiales)[\s\S]*?\n([\s\S]*?)(?=## 🔗|$)/);

      // Fecha en formato texto español
      const createdMatch = rawContent.match(/fecha_creacion:\s*"?(.*?)"?$/m) || rawContent.match(/created_at:\s*"?(.*?)"?$/m);
      const createdAt = formatSpanishDateInLetters(createdMatch ? createdMatch[1] : new Date());

      const normLevel = levelParam || 'primaria-baja';
      const cleanSub = cleanString(subjectParam || subjectName || campoFormativo);
      let normSubject = 'lenguajes';
      if (cleanSub.includes('mat') || cleanSub.includes('algebra') || cleanSub.includes('calc') || cleanSub.includes('aritmet')) {
        normSubject = 'matematicas';
      } else if (cleanSub.includes('cien') || cleanSub.includes('medio') || cleanSub.includes('nat') || cleanSub.includes('bio') || cleanSub.includes('fis') || cleanSub.includes('quim')) {
        normSubject = 'ciencias';
      } else if (cleanSub.includes('his') || cleanSub.includes('ent') || cleanSub.includes('geo') || cleanSub.includes('soc') || cleanSub.includes('civ') || cleanSub.includes('etic')) {
        normSubject = 'historia';
      } else if (cleanSub.includes('art') || cleanSub.includes('mus')) {
        normSubject = 'artes';
      } else if (cleanSub.includes('hum') || cleanSub.includes('salud') || cleanSub.includes('deport') || cleanSub.includes('emoc')) {
        normSubject = 'humano';
      }
      const cleanTopic = cleanCoreTopicName(title);
      const sesionesList = generateChronometerSessions(normLevel, normSubject, cleanTopic, sessionCount);
      const pdasArticulados = getArticulatedPdas(normLevel, normSubject, cleanTopic);
      const proyectoIntegrador = generateFinalProjectProposal(normLevel, normSubject, cleanTopic);
      const detonatingQuestions = generateDetonatingQuestions(cleanTopic, normLevel, normSubject);
      const durationStr = `${sessionCount} ${sessionCount === 1 ? 'sesión' : 'sesiones'} de 50 minutos (Total: ${sessionCount * 50} min)`;

      const isGenericOrMismatchedPregunta = (q: string) => {
        const qLow = q.toLowerCase();
        if (qLow.includes('¿qué preguntas nos hacemos sobre') || qLow.includes('que preguntas nos hacemos sobre')) return true;
        if (qLow.includes('libros escolares de la sep') && qLow.includes('indagar')) return true;
        if (qLow.includes('haciendo registros organizados en nuestro cuaderno')) return true;
        if (qLow.includes('revolución mexicana') && !cleanTopic.toLowerCase().includes('revoluc')) return true;
        if (qLow.includes('madero') && !cleanTopic.toLowerCase().includes('madero') && !cleanTopic.toLowerCase().includes('revoluc')) return true;
        return false;
      };
      const filteredPreguntas = preguntas.filter(p => !isGenericOrMismatchedPregunta(p));
      const finalPreguntas = filteredPreguntas.length >= 3 ? filteredPreguntas.map(p => sanitizeSpanishPedagogicalGrammar(p)) : detonatingQuestions;

      return NextResponse.json({
        found: true,
        source: 'vault',
        filename: bestMatchNode.filename,
        planning: {
          id: 'plan-vault-' + Date.now(),
          title: sanitizeSpanishPedagogicalGrammar(title),
          levelName,
          subjectName,
          campoFormativo,
          ejesArticuladores: ['Pensamiento Crítico', 'Interculturalidad Crítica', 'Inclusión', 'Vida Saludable', 'Apropiación de las Culturas a través de la Lectura y la Escritura'],
          pda: sanitizeSpanishPedagogicalGrammar(pda),
          pdasArticulados,
          duration: durationStr,
          preguntasDetonadoras: finalPreguntas,
          sesiones: sesionesList,
          proyectoIntegrador,
          inicio: fase1Match ? sanitizeSpanishPedagogicalGrammar(fase1Match[1].trim()) : sesionesList[0]?.actividadInicio + '\n' + sesionesList[0]?.actividadDesarrollo + '\n' + sesionesList[0]?.actividadCierre,
          desarrollo: fase2Match ? sanitizeSpanishPedagogicalGrammar(fase2Match[1].trim()) : (sesionesList.length > 2 ? sesionesList.slice(1, -1).map(s => `📌 SESIÓN ${s.numero} (${s.duracionTotal}): ${s.titulo}\n${s.actividadInicio}\n${s.actividadDesarrollo}\n${s.actividadCierre}\n📖 Libro SEP: ${s.libroSep.titulo}, ${s.libroSep.paginas}\n📄 Entregable: ${s.entregableSesion}`).join('\n\n') : (sesionesList[1] ? `📌 SESIÓN ${sesionesList[1].numero}: ${sesionesList[1].titulo}\n${sesionesList[1].actividadDesarrollo}` : 'Desarrollo en sesión única.')),
          cierre: fase3Match ? sanitizeSpanishPedagogicalGrammar(fase3Match[1].trim()) : (sesionesList.length > 1 ? `📌 SESIÓN FINAL ${sesionesList[sesionesList.length - 1].numero} (${sesionesList[sesionesList.length - 1].duracionTotal}): ${sesionesList[sesionesList.length - 1].titulo}\n${sesionesList[sesionesList.length - 1].actividadInicio}\n${sesionesList[sesionesList.length - 1].actividadDesarrollo}\n${sesionesList[sesionesList.length - 1].actividadCierre}\n📖 Libro SEP: ${sesionesList[sesionesList.length - 1].libroSep.titulo}, ${sesionesList[sesionesList.length - 1].libroSep.paginas}\n📄 Entregable: ${sesionesList[sesionesList.length - 1].entregableSesion}` : sesionesList[0]?.actividadCierre || ''),
          evaluacion: evalMatch ? sanitizeSpanishPedagogicalGrammar(evalMatch[1].trim()) : `RÚBRICA FORMATIVA ANALÍTICA (NIVELES NEM 2024):\n• ${proyectoIntegrador.rubrica.criterio1.nombre}:\n  - Sobresaliente: ${proyectoIntegrador.rubrica.criterio1.sobresaliente}\n  - Satisfactorio: ${proyectoIntegrador.rubrica.criterio1.satisfactorio}\n  - En Proceso: ${proyectoIntegrador.rubrica.criterio1.enProceso}\n• ${proyectoIntegrador.rubrica.criterio2.nombre}:\n  - Sobresaliente: ${proyectoIntegrador.rubrica.criterio2.sobresaliente}\n  - Satisfactorio: ${proyectoIntegrador.rubrica.criterio2.satisfactorio}\n  - En Proceso: ${proyectoIntegrador.rubrica.criterio2.enProceso}\n• ${proyectoIntegrador.rubrica.criterio3.nombre}:\n  - Sobresaliente: ${proyectoIntegrador.rubrica.criterio3.sobresaliente}\n  - Satisfactorio: ${proyectoIntegrador.rubrica.criterio3.satisfactorio}\n  - En Proceso: ${proyectoIntegrador.rubrica.criterio3.enProceso}`,
          materiales: matMatch ? sanitizeSpanishPedagogicalGrammar(matMatch[1].trim()) : `MATERIALES POR SESIÓN Y RECURSOS DIDÁCTICOS:\n• Libros de Texto Gratuitos de la SEP asignados con páginas específicas.\n• Materiales manipulables (fichas, regletas, instrumentos de medición, papel bond, colores).\n• Entregables parciales acumulables en la bitácora escolar.\n\nEVIDENCIA ENTREGABLE DEL PROYECTO:\n• ${proyectoIntegrador.productoFinal}`,
          createdAt,
          isFromVault: true
        }
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
        }
      });
    }

    return NextResponse.json({ found: false, note: null }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
      }
    });
  } catch (error: any) {
    console.error("Error al buscar en Bóveda Curricular:", error);
    return NextResponse.json({ found: false, error: 'Error interno al procesar la búsqueda.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Validación de Sesión y Autenticación
    const auth = await validateApiAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: auth.error || 'No autorizado. Se requiere sesión activa.' },
        { status: 401 }
      );
    }

    // 2. Sanitización y validación con Zod
    const body = await request.json().catch(() => null);
    const parsedPlanning = ObsidianPlanningSchema.safeParse(body);

    if (!parsedPlanning.success) {
      return NextResponse.json(
        { success: false, error: parsedPlanning.error.issues[0]?.message || 'Datos de planeación inválidos' },
        { status: 400 }
      );
    }

    const planning = parsedPlanning.data;

    if (!fs.existsSync(OBSIDIAN_VAULT_PATH)) {
      return NextResponse.json({ success: false, error: 'Bóveda Curricular no encontrada' }, { status: 404 });
    }

    // Clasificación jerárquica: Nivel Escolar -> Grado/Fase -> Materia (con protección anti-traversal)
    const levelFolder = sanitizeFolderName(planning.levelName || planning.nivel || 'General');
    const gradeFolder = sanitizeFolderName(planning.gradeName || planning.grado || planning.fase || 'General');
    const subjectFolder = sanitizeFolderName(planning.subjectName || planning.asignatura || 'General');

    // Directorio de destino estructurado dentro de la bóveda
    const targetDir = path.join(OBSIDIAN_VAULT_PATH, 'planeaciones', levelFolder, gradeFolder, subjectFolder);
    
    // Verificación de seguridad de ruta (evita Path Traversal)
    const resolvedPath = path.resolve(targetDir);
    if (!resolvedPath.startsWith(path.resolve(OBSIDIAN_VAULT_PATH))) {
      return NextResponse.json({ success: false, error: 'Ruta no permitida' }, { status: 403 });
    }

    fs.mkdirSync(targetDir, { recursive: true });

    const safeTitle = planning.title.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s_-]/g, '').trim().replace(/\s+/g, '_');
    const filename = `Planeacion_${safeTitle}_${Date.now()}.md`;
    const filePath = path.join(targetDir, filename);

    const formattedSpanishDate = formatSpanishDateInLetters(new Date());

    const tagLevel = levelFolder.toLowerCase();
    const tagGrade = gradeFolder.toLowerCase();
    const tagSubject = subjectFolder.toLowerCase();

    const markdownContent = `---
tags: [iskool, planeacion_nem, segundo_cerebro, nivel_${tagLevel}, grado_${tagGrade}, materia_${tagSubject}]
nivel: "${planning.levelName || ''}"
grado: "${planning.gradeName || planning.grado || ''}"
asignatura: "${planning.subjectName || ''}"
campo_formativo: "${planning.campoFormativo || ''}"
fecha_creacion: "${formattedSpanishDate}"
created_at: "${formattedSpanishDate}"
updated_at: "${formattedSpanishDate}"
---

# ${planning.title}

**Docente:** ${planning.teacherName || 'Prof. Israel López Ángeles'}  
**Nivel / Fase:** ${planning.levelName || ''}  
**Grado:** ${planning.gradeName || planning.grado || 'No especificado'}  
**Asignatura:** ${planning.subjectName || ''}  
**Campo Formativo:** ${planning.campoFormativo || ''}  
**Duración:** ${planning.duration || '2 sesiones de 50 minutos (Total: 100 min)'}  
**PDA:** ${planning.pda || ''}  
**Fecha:** ${formattedSpanishDate}

---

${planning.preguntasDetonadoras && planning.preguntasDetonadoras.length > 0 ? `## Preguntas Detonadoras para el Salón\n${planning.preguntasDetonadoras.map((p, idx) => `${idx + 1}. ${p}`).join('\n')}\n\n---\n` : ''}
## Secuencia Didáctica (Dosificación por Bloques de 50 min)

### Inicio
${planning.inicio || ''}

### Desarrollo
${planning.desarrollo || ''}

### Cierre
${planning.cierre || ''}

---

### Evaluación Formativa y Rúbrica Analítica
${planning.evaluacion || ''}

### Materiales, Recursos y Evidencias Entregables
${planning.materiales || ''}
`;

    fs.writeFileSync(filePath, markdownContent, 'utf8');
    vaultIndexCache = null; // Invalidar caché en memoria para refrescar búsquedas inmediatamente
    console.log(`✅ Planeación guardada en Bóveda Curricular estructurada por Nivel/Grado/Materia: ${filePath}`);

    // Sincronización Automática con Repositorio Remoto
    let gitSyncStatus = 'skipped';
    let gitMessage = '';
    const isIsrael = (planning.teacherName || '').toLowerCase().includes('israel') || Boolean(planning.isSuperUser);

    if (planning.syncGit || isIsrael) {
      try {
        const safeCommitTitle = planning.title.replace(/["`$]/g, '').trim();
        const commitMsg = `feat(planeacion): ${safeCommitTitle} - ${planning.teacherName || 'Prof. Israel López Ángeles'} (IA NEM)`;
        
        await execPromise(`git -C "${OBSIDIAN_VAULT_PATH}" add -A`);
        await execPromise(`git -C "${OBSIDIAN_VAULT_PATH}" commit -m "${commitMsg}"`).catch((e) => {
          // Si no hay cambios nuevos para commitear, no es un error crítico
          console.log('Git commit notice:', e.message);
        });
        await execPromise(`git -C "${OBSIDIAN_VAULT_PATH}" push origin main`);
        gitSyncStatus = 'synced_and_pushed';
        gitMessage = 'Sincronizado y publicado en Repositorio Central (Bóveda Curricular)';
        console.log(`🚀 [Auto-Push]: Planeación "${planning.title}" sincronizada y enviada al repositorio central.`);
      } catch (gitErr: any) {
        gitSyncStatus = 'local_only';
        gitMessage = `Guardado localmente. Sincronización remota: ${gitErr?.message || 'Pendiente de sincronizar'}`;
        console.warn('Aviso de sincronización remota:', gitErr?.message || gitErr);
      }
    }

    return NextResponse.json({
      success: true,
      filename,
      vaultPath: filePath,
      levelFolder,
      gradeFolder,
      subjectFolder,
      gitSyncStatus,
      gitMessage
    });
  } catch (error: any) {
    console.error("Error al guardar en Bóveda Curricular:", error);
    return NextResponse.json({ success: false, error: 'Error interno al guardar en Bóveda Curricular' }, { status: 500 });
  }
}

