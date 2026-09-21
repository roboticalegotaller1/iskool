import { 
  normalizePhoneticText, 
  isPhoneticallyEquivalent, 
  alignSpokenTokensToTarget,
  expandContractions
} from './src/lib/audioEngine';

console.log('🧪 Iniciando Pruebas de Calibración Fonética y Alineación Universal ISkool...\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, label: string) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ [PASS] ${label}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${label}`);
  }
}

const targetPhrase = 'I would like a warm cappuccino and a fresh blueberry muffin please';
const targetWords = targetPhrase.split(/\s+/);

// 1. Coincidencia Perfecta
const t1 = alignSpokenTokensToTarget(targetWords, targetWords, 'en');
assert(t1.matchedIndices.length === 12, '1. Coincidencia idéntica: 12/12 palabras emparejadas');
assert(t1.accuracy === 100, '1. Coincidencia idéntica: 100% de precisión');

// 2. Contracción "I'd" en lugar de "I would"
const spokenContracted = "I'd like a warm cappuccino and a fresh blueberry muffin please".split(/\s+/);
const t2 = alignSpokenTokensToTarget(spokenContracted, targetWords, 'en');
assert(t2.matchedIndices.includes(0) && t2.matchedIndices.includes(1), '2. Contracción "I\'d": detecta tanto "I" como "would"');
assert(t2.accuracy === 100, '2. Contracción "I\'d": 100% de precisión');

// 3. Palabra compuesta dividida: "blue berry" por "blueberry"
const spokenSplitCompound = "I would like a warm cappuccino and a fresh blue berry muffin please".split(/\s+/);
const t3 = alignSpokenTokensToTarget(spokenSplitCompound, targetWords, 'en');
assert(t3.matchedIndices.includes(9), '3. Palabra compuesta "blue berry": detecta "blueberry"');
assert(t3.accuracy === 100, '3. Palabra compuesta dividida: 100% de precisión');

// 4. Palabras duplicadas en la frase ("a" en índice 3 y "a" en índice 7)
const spokenExactWithDuplicates = targetWords;
const t4 = alignSpokenTokensToTarget(spokenExactWithDuplicates, targetWords, 'en');
assert(t4.matchedIndices.includes(3) && t4.matchedIndices.includes(7), '4. Palabras duplicadas: ambos índices 3 ("a") y 7 ("a") están emparejados');

// 5. Salto de palabra (el alumno omitió "warm" y "blueberry")
const spokenSkipped = "I would like a cappuccino and a fresh muffin please".split(/\s+/);
const t5 = alignSpokenTokensToTarget(spokenSkipped, targetWords, 'en');
assert(t5.matchedIndices.length === 10, '5. Salto de palabra: 10/12 palabras emparejadas sin bloquear el resto');
assert(!t5.matchedIndices.includes(4) && !t5.matchedIndices.includes(9), '5. Salto de palabra: "warm" (4) y "blueberry" (9) marcadas correctamente en rojo');
assert(t5.accuracy === 83, '5. Salto de palabra: 83% de precisión');

// 6. Acento hispano y aproximación fonética
const spokenAccented = "I wood laik a worm capuchino and a fres bluberi mafin plis".split(/\s+/);
const t6 = alignSpokenTokensToTarget(spokenAccented, targetWords, 'en');
assert(t6.accuracy === 100, '6. Tolerancia a acento hispano: 100% de precisión fonética');

// 7. Entrega por lotes en tiempo real (primeros 3 tokens, luego 6, luego 12)
const batch1 = "I would like".split(/\s+/);
const t7a = alignSpokenTokensToTarget(batch1, targetWords, 'en');
assert(t7a.matchedIndices.length === 3, '7a. Lote en vivo: primeros 3 tokens emparejados');

const batch2 = "I would like a warm cappuccino".split(/\s+/);
const t7b = alignSpokenTokensToTarget(batch2, targetWords, 'en');
assert(t7b.matchedIndices.length === 6, '7b. Lote en vivo: 6 tokens emparejados');

// 8. Frase en Francés con apóstrofes: "C'est un véritable plaisir" y "s'il vous plaît"
const frTarget = "Je voudrais un croissant croustillant et un café au lait s'il vous plaît".split(/\s+/);
const frSpoken = "Je voudrais un croisant crustillant et un cafe au lait sil vous plait".split(/\s+/);
const t8 = alignSpokenTokensToTarget(frSpoken, frTarget, 'fr');
assert(t8.accuracy >= 90, `8. Francés con apóstrofe y fonética nasal: ${t8.accuracy}% de precisión`);

// 9. SILENCIO TOTAL: Tokens hablados vacíos -> 0 matches, 0% precisión
const t9 = alignSpokenTokensToTarget([], targetWords, 'en');
assert(t9.matchedIndices.length === 0, '9. Silencio total: 0 palabras emparejadas');
assert(t9.accuracy === 0, '9. Silencio total: 0% de precisión');

// 10. RUIDO O PALABRAS TOTALMENTE NO RELACIONADAS
const t10 = alignSpokenTokensToTarget(['hola', 'amigos', 'buenos', 'dias'], targetWords, 'en');
assert(t10.matchedIndices.length === 0, '10. Ruido o conversación ajena en español: 0 palabras emparejadas');
assert(t10.accuracy === 0, '10. Ruido no relacionado: 0% de precisión');

// 11. DISCRIMINACIÓN ESTRICTA DE PALABRAS CORTAS ("is" vs "in", "it", "if")
const t11a = isPhoneticallyEquivalent('in', 'is', 'en');
const t11b = isPhoneticallyEquivalent('it', 'is', 'en');
const t11c = isPhoneticallyEquivalent('is', 'is', 'en');
assert(!t11a && !t11b, '11a. "is" NO hace match con "in" o "it"');
assert(t11c, '11b. "is" coincide consigo misma');

// 12. NO MATCH ESPURIO: "like" no debe emparejar "would"
const t12 = isPhoneticallyEquivalent('like', 'would', 'en');
assert(!t12, '12. "like" NO coincide con "would"');

console.log(`\n📊 Resumen: ${passedTests}/${totalTests} pruebas aprobadas.`);
if (passedTests === totalTests) {
  console.log('🌟 ¡CALIBRACIÓN FONÉTICA 100% EXITOSA!\n');
} else {
  process.exit(1);
}
