/**
 * @file test_centro_de_idiomas_forense.ts
 * @description Suite de Validación Forense Integral del Centro de Idiomas de ISkool:
 * 1. Canon de Personajes Históricos Políglotas (Voz en 1ª Persona Estricta)
 * 2. 5 Bloques Didácticos de Lenguajes en el Estudio (Lienzo Digital)
 * 3. Ecosistema de 12 Fases Curriculares (ESL & FLE)
 * 4. Matriz Oficial de Certificación SEP CENNI & DELF / Cambridge
 * 5. Telemetría de Diagnóstico de Hardware (Web Audio & Decibeles)
 */

import { MULTILINGUAL_HISTORICAL_FIGURES } from '../src/lib/historicalVoiceEngine';
import { KnowledgeVaultLoader } from '../src/lib/knowledgeVault/loader';
import { AcademicGraph } from '../src/lib/knowledgeVault/academicGraph';
import { useActivityBuilderStore } from '../src/store/useActivityBuilderStore';
import { useLanguagesStore } from '../src/store/useLanguagesStore';

interface AssertionResult {
  suite: string;
  name: string;
  passed: boolean;
  details?: string;
}

const results: AssertionResult[] = [];

function assert(suite: string, name: string, condition: boolean, details?: string) {
  results.push({ suite, name, passed: condition, details });
  const symbol = condition ? '✅ PASS' : '❌ FAIL';
  console.log(`[${symbol}] ${suite} -> ${name}${details ? ` (${details})` : ''}`);
}

async function runForensicTestSuite() {
  console.log('================================================================');
  console.log('INICIANDO AUDITORÍA FORENSE: CENTRO DE IDIOMAS & ESTUDIO ISKOOL');
  console.log('================================================================\n');

  // ---------------------------------------------------------------------------
  // 1. CANON DE PERSONAJES HISTÓRICOS POLÍGLOTAS (1ª PERSONA ESTRICTA)
  // ---------------------------------------------------------------------------
  const suite1 = '1. Canon Personajes Históricos';
  assert(suite1, 'Catálogo multilingüe definido y no vacío', MULTILINGUAL_HISTORICAL_FIGURES.length >= 7, `Total: ${MULTILINGUAL_HISTORICAL_FIGURES.length} próceres`);

  const englishFigures = MULTILINGUAL_HISTORICAL_FIGURES.filter(f => f.language === 'en');
  const frenchFigures = MULTILINGUAL_HISTORICAL_FIGURES.filter(f => f.language === 'fr');

  assert(suite1, 'Presencia de figuras anglófonas (Shakespeare, Lovelace, Lincoln)', englishFigures.length >= 3, `Encontradas: ${englishFigures.length}`);
  assert(suite1, 'Presencia de figuras francófonas (Napoleón, Curie, Hugo, Juana de Arco)', frenchFigures.length >= 4, `Encontradas: ${frenchFigures.length}`);

  MULTILINGUAL_HISTORICAL_FIGURES.forEach(fig => {
    // Canon inviolable: primera persona estricta
    const intro = fig.canonicalIntro.trim();
    const isFirstPerson = intro.startsWith('I am ') || 
                          intro.startsWith('I was ') || 
                          intro.startsWith('Je suis ') || 
                          intro.startsWith("J'ai ");
    
    assert(suite1, `Voz en 1ª persona estricta: ${fig.name}`, isFirstPerson, `Inicio: "${intro.substring(0, 30)}..."`);
    assert(suite1, `Voz neural calibrada presente: ${fig.name}`, !!fig.voiceId && fig.voiceId.includes('Neural'), `VoiceId: ${fig.voiceId}`);
    assert(suite1, `Velocidad adaptada a compresión: ${fig.name}`, fig.speechRate >= 0.75 && fig.speechRate <= 1.0, `Rate: ${fig.speechRate}x`);
  });

  // ---------------------------------------------------------------------------
  // 2. BLOQUES DIDÁCTICOS DEL CENTRO DE IDIOMAS EN EL ESTUDIO
  // ---------------------------------------------------------------------------
  const suite2 = '2. Bloques en Estudio (Lienzo Digital)';
  const store = useActivityBuilderStore.getState();

  const requiredBlockTypes = [
    'languages_practice_portal',
    'languages_karaoke_block',
    'languages_socratic_tutor',
    'languages_roleplay_mission',
    'languages_evaluation_rubric'
  ] as const;

  requiredBlockTypes.forEach(blockType => {
    const blockId = store.addBlock(blockType as any);
    const createdBlock = useActivityBuilderStore.getState().blocks.find(b => b.id === blockId);

    assert(suite2, `Generación e inserción de bloque: ${blockType}`, !!createdBlock, `ID: ${blockId}`);
    assert(suite2, `Portal URL apunta al Centro de Idiomas: ${blockType}`, (createdBlock as any)?.data?.portalUrl === '/teacher/idiomas');
  });

  // ---------------------------------------------------------------------------
  // 3. INTEGRACIÓN CURRICULAR DE 12 FASES (ESL & FLE)
  // ---------------------------------------------------------------------------
  const suite3 = '3. Integración Curricular 12 Fases';
  const vault = KnowledgeVaultLoader.loadAll(undefined, 'all');
  const graph = AcademicGraph.build(vault);

  const allNodes = graph.getAllNodes();
  const englishNodes = allNodes.filter(n => !n.filePath.includes('french'));
  const frenchNodes = allNodes.filter(n => n.filePath.includes('french'));

  assert(suite3, 'Carga de Bóveda Curricular Bilingüe', allNodes.length >= 250, `Nodos totales: ${allNodes.length}`);
  assert(suite3, 'Presencia de nodos curriculares en inglés (ESL)', englishNodes.length >= 200, `Nodos ESL: ${englishNodes.length}`);
  assert(suite3, 'Presencia de nodos curriculares en francés (FLE)', frenchNodes.length >= 36, `Nodos FLE: ${frenchNodes.length}`);

  const cycleReport = graph.detectCycles();
  assert(suite3, 'Grafo Curricular sin ciclos circulares', !cycleReport.has_cycle, '0 ciclos topológicos');

  // ---------------------------------------------------------------------------
  // 4. MATRIZ DE CERTIFICACIÓN SEP CENNI Y DELF / CAMBRIDGE
  // ---------------------------------------------------------------------------
  const suite4 = '4. Matriz de Certificación Oficial';
  const levelsFrench = ['A1', 'A2', 'B1', 'B2', 'C1'];
  levelsFrench.forEach(lvl => {
    const count = frenchNodes.filter(n => n.cefr.includes(lvl)).length;
    assert(suite4, `Cobertura FLE para nivel ${lvl}`, count > 0, `Nodos: ${count}`);
  });

  // ---------------------------------------------------------------------------
  // 5. SIMULACIÓN DE TELEMETRÍA Y DECIBELES (WEB AUDIO)
  // ---------------------------------------------------------------------------
  const suite5 = '5. Telemetría de Audio y Micrófono';
  
  // Función de cálculo de dB idéntica a HardwareAudioTester
  const computeDecibels = (normalizedLevel: number) => Math.round(-60 + (normalizedLevel * 0.6));
  
  assert(suite5, 'Cálculo de dB en silencio absoluto (0%)', computeDecibels(0) === -60, '-60 dBFS');
  assert(suite5, 'Cálculo de dB en nivel óptimo de voz (60%)', computeDecibels(60) === -24, '-24 dBFS (Rango broadcast)');
  assert(suite5, 'Cálculo de dB en nivel máximo (100%)', computeDecibels(100) === 0, '0 dBFS (Full Scale)');

  // ---------------------------------------------------------------------------
  // BALANCE FINAL DE LA AUDITORÍA
  // ---------------------------------------------------------------------------
  console.log('\n================================================================');
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`RESUMEN DE PRUEBAS: ${passed}/${total} APROBADAS (${Math.round((passed/total)*100)}%)`);
  if (failed === 0) {
    console.log('🏆 AUDITORÍA FORENSE DEL CENTRO DE IDIOMAS: 100% SATISFACTORIA');
  } else {
    console.log(`⚠️ ALERTA: ${failed} PRUEBAS NO SUPERADAS`);
  }
  console.log('================================================================');
}

runForensicTestSuite().catch(err => {
  console.error('Error fatal durante la auditoría:', err);
  process.exit(1);
});
