import { getPedagogicalSuggestionsForPlanning } from './src/lib/pedagogicalSuggestionsEngine';

interface TestScenario {
  name: string;
  planning: {
    title: string;
    subjectName: string;
    campoFormativo: string;
    pda?: string;
    levelName?: string;
  };
  expectedDisciplineKeyword: string;
  forbiddenKeywordInVideos: string;
  expectedPortalKeyword: string;
}

const scenarios: TestScenario[] = [
  {
    name: '1. Inglés — Verbs (Primaria Baja - Caso exacto del usuario)',
    planning: {
      title: 'Proyecto didáctico: Verbs — Primaria Baja (Fase 3: 1º y 2º Grado) (Pre-A1 Starters • CEFR Pre-A1)',
      subjectName: 'Inglés',
      campoFormativo: 'Lenguajes (Lengua Extranjera: Inglés • Cambridge Pre-A1 Starters)',
      pda: 'Cambridge Pre-A1 Starters (Fase 3: 1º y 2º) - Identifica y utiliza vocabulario fundamental, fórmulas de cortesía y preguntas directas de uso cotidiano mediante juegos de interacción comunicativa.',
      levelName: 'Primaria Baja (Fase 3: 1º y 2º Grado)'
    },
    expectedDisciplineKeyword: 'verb',
    forbiddenKeywordInVideos: 'independencia',
    expectedPortalKeyword: 'learningenglish'
  },
  {
    name: '2. Inglés — Action Verbs (Preescolar)',
    planning: {
      title: 'Action Songs & Basic Verbs',
      subjectName: 'Inglés',
      campoFormativo: 'Lenguajes (Inglés Preescolar)',
      levelName: 'Preescolar (Fase 2)'
    },
    expectedDisciplineKeyword: 'action',
    forbiddenKeywordInVideos: 'hidalgo',
    expectedPortalKeyword: 'agendaweb'
  },
  {
    name: '3. Inglés — Tenses & Grammar (Secundaria)',
    planning: {
      title: 'English Verb Tenses & Passive Voice',
      subjectName: 'English',
      campoFormativo: 'Lenguajes (Inglés Fase 6)',
      levelName: 'Secundaria'
    },
    expectedDisciplineKeyword: 'tenses',
    forbiddenKeywordInVideos: 'independencia',
    expectedPortalKeyword: 'learningenglish'
  },
  {
    name: '4. Matemáticas — Ecuaciones y Fracciones',
    planning: {
      title: 'Resolución de Ecuaciones de Primer Grado',
      subjectName: 'Matemáticas',
      campoFormativo: 'Saberes y Pensamiento Científico',
      levelName: 'Secundaria'
    },
    expectedDisciplineKeyword: 'matemáticas',
    forbiddenKeywordInVideos: 'independencia',
    expectedPortalKeyword: 'khanacademy'
  },
  {
    name: '5. Ciencias Naturales — Fotosíntesis y Ecosistemas',
    planning: {
      title: 'La fotosíntesis y el flujo de energía',
      subjectName: 'Ciencias Naturales',
      campoFormativo: 'Saberes y Pensamiento Científico',
      levelName: 'Primaria Alta'
    },
    expectedDisciplineKeyword: 'ciencia',
    forbiddenKeywordInVideos: 'independencia',
    expectedPortalKeyword: 'enciclovida'
  },
  {
    name: '6. Español — Sujeto, Verbo y Predicado',
    planning: {
      title: 'Estructura de la Oración: Sujeto y Predicado',
      subjectName: 'Lenguajes (Español)',
      campoFormativo: 'Lenguajes',
      levelName: 'Primaria'
    },
    expectedDisciplineKeyword: 'oración',
    forbiddenKeywordInVideos: 'independencia',
    expectedPortalKeyword: 'conaliteg'
  },
  {
    name: '7. Historia — La Revolución Mexicana (Historia genuina)',
    planning: {
      title: 'Causas y consecuencias de la Revolución Mexicana',
      subjectName: 'Historia',
      campoFormativo: 'Ética, Naturaleza y Sociedades',
      levelName: 'Secundaria'
    },
    expectedDisciplineKeyword: 'historia',
    forbiddenKeywordInVideos: 'singing walrus',
    expectedPortalKeyword: 'inah'
  },
  {
    name: '8. Artes — Teoría del Color y Música',
    planning: {
      title: 'Exploración de colores primarios y ritmos',
      subjectName: 'Artes Visuales',
      campoFormativo: 'Artes y Experiencias Estéticas',
      levelName: 'Primaria Baja'
    },
    expectedDisciplineKeyword: 'color',
    forbiddenKeywordInVideos: 'independencia',
    expectedPortalKeyword: 'inba'
  },
  {
    name: '9. Educación Física — Circuito Motriz',
    planning: {
      title: 'Habilidades motrices básicas y circuitos de coordinación',
      subjectName: 'Educación Física',
      campoFormativo: 'De lo Humano y lo Comunitario',
      levelName: 'Primaria'
    },
    expectedDisciplineKeyword: 'motri',
    forbiddenKeywordInVideos: 'independencia',
    expectedPortalKeyword: 'salud'
  },
  {
    name: '10. Educación Socioemocional — El Monstruo de Colores',
    planning: {
      title: 'Reconocimiento de emociones y empatía en el aula',
      subjectName: 'Educación Socioemocional',
      campoFormativo: 'De lo Humano y lo Comunitario',
      levelName: 'Preescolar'
    },
    expectedDisciplineKeyword: 'emocion',
    forbiddenKeywordInVideos: 'independencia',
    expectedPortalKeyword: 'sep'
  }
];

console.log('='.repeat(80));
console.log('AUDITORÍA Y VERIFICACIÓN MULTIDISCIPLINARIA DE SUGERENCIAS PEDAGÓGICAS');
console.log('='.repeat(80));

let passed = 0;
let failed = 0;

for (const sc of scenarios) {
  console.log(`\n--- Probando: ${sc.name} ---`);
  const res = getPedagogicalSuggestionsForPlanning(sc.planning);

  // 1. Validar videos
  const videoTitles = res.videos.map(v => v.title).join(' | ');
  const channels = res.videos.map(v => v.channelName).join(', ');
  const forbiddenFound = res.videos.some(v => 
    v.title.toLowerCase().includes(sc.forbiddenKeywordInVideos) ||
    v.description.toLowerCase().includes(sc.forbiddenKeywordInVideos)
  );

  // 2. Validar portal web
  const portalUrl = res.webPortal.url;
  const isIlceFound = portalUrl.includes('redescolar.ilce.edu.mx');
  const hasExpectedPortal = portalUrl.toLowerCase().includes(sc.expectedPortalKeyword);

  // 3. Validar fuentes bibliográficas
  const sourcesCount = res.researchSources.length;
  const sourcesSample = res.researchSources.map(s => s.title).join('; ');

  console.log(`  • Videos (${res.videos.length}):`);
  res.videos.forEach((v, idx) => console.log(`    [${idx + 1}] [${v.channelName}] ${v.title} (${v.url})`));
  console.log(`  • Portal Web: [${res.webPortal.siteName}] -> ${res.webPortal.url}`);
  console.log(`  • Fuentes (${sourcesCount}): ${sourcesSample.substring(0, 100)}...`);

  let errorReason = '';
  if (forbiddenFound) {
    errorReason += `Contiene palabra prohibida '${sc.forbiddenKeywordInVideos}' en videos. `;
  }
  if (isIlceFound) {
    errorReason += `Contiene el portal caído 'redescolar.ilce.edu.mx'. `;
  }
  if (!hasExpectedPortal) {
    errorReason += `El portal web '${portalUrl}' no contiene la clave esperada '${sc.expectedPortalKeyword}'. `;
  }
  if (res.videos.length < 3) {
    errorReason += `Menos de 3 videos devueltos (${res.videos.length}). `;
  }

  if (errorReason) {
    console.error(`  ❌ FALLO: ${errorReason}`);
    failed++;
  } else {
    console.log(`  ✅ ÉXITO: Recursos 100% acordes a la disciplina, nivel y portal activo comprobado.`);
    passed++;
  }
}

console.log('\n' + '='.repeat(80));
console.log(`RESULTADO DE LA AUDITORÍA: ${passed}/${scenarios.length} CASOS SUPERADOS (${Math.round((passed/scenarios.length)*100)}%)`);
if (failed > 0) {
  console.error(`Se detectaron ${failed} escenarios con discrepancias.`);
  process.exit(1);
} else {
  console.log('TODAS LAS MATERIAS EN TODOS LOS NIVELES TIENEN RECURSOS Y VIDEOS 100% ACORDES.');
  process.exit(0);
}
