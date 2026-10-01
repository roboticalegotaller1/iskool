import { searchQaInVaultNode, normalizeQuestionText } from '../src/lib/historicalVaultEngine';

const testCases = [
  // 1. Francisco Villa
  {
    slug: 'francisco_villa',
    character: 'Francisco Villa',
    queries: [
      '¿Cómo influyó el rompimiento con Venustiano Carranza durante la Toma de Zacatecas en el desenlace de la Revolución?',
      'como influyo el rompimiento con venustiano carranza durante la toma de zacatecas en el desenlace de la revolucion',
      '¿Qué falló tácticamente en las batallas de Celaya y Trinidad frente al general Álvaro Obregón?',
      'que fallo tacticamente en las batallas de celaya y trinidad frente al general alvaro obregon',
      'te gustaba el chocolate',
      '¿Te gustaba el chocolate?',
      'cuentanos de tu niñez',
      'cuentanos de tu ninez',
      'quienes eran tus padres',
      '¿Quiénes eran tus padres?',
      'que te gustaba comer',
      'cual era tu dulce favorito',
      '¿Cuál fue la decisión más difícil que te tocó tomar y qué costos personales o colectivos implicó?'
    ]
  },
  // 2. Josefa Ortiz de Domínguez
  {
    slug: 'josefa_ortiz_de_dominguez',
    character: 'Josefa Ortiz de Domínguez',
    queries: [
      '¿Cómo mantuviste la correspondencia secreta con Miguel Hidalgo y los capitanes insurgentes desde Querétaro?',
      'como mantuviste la correspondencia secreta con miguel hidalgo y los capitanes insurgentes desde queretaro',
      '¿Qué cruzó por tu mente al momento de golpear el piso de tu recámara con el tacón para prevenir a Ignacio Pérez?',
      'te gustaba el chocolate',
      'cuentanos de tu niñez',
      'quienes eran tus padres',
      'que te gustaba comer',
      'cual era tu dulce favorito',
      '¿Quiénes integraron tu núcleo familiar íntimo (cónyuges, hijos, parejas sentimentales)?'
    ]
  },
  // 3. Miguel Hidalgo y Costilla
  {
    slug: 'miguel_hidalgo_y_costilla',
    character: 'Miguel Hidalgo y Costilla',
    queries: [
      '¿Cómo transcurrió tu etapa como alumno y catedrático en el Colegio de San Nicolás Obispo en Valladolid?',
      '¿Por qué motivo tus compañeros y pupilos universitarios comenzaron a llamarte "El Zorro"?',
      'te gustaba el chocolate',
      'cuentanos de tu niñez',
      'quienes eran tus padres',
      'que te gustaba comer',
      'cual era tu dulce favorito',
      '¿Cuáles fueron las palabras y proclamas exactas que dirigiste a la multitud en el atrio de Dolores al amanecer del 16 de septiembre?'
    ]
  },
  // 4. Santiago de Querétaro
  {
    slug: 'santiago_de_queretaro',
    character: 'Santiago de Querétaro',
    queries: [
      '¿Cómo se desarrolló la legendaria fundación de la ciudad en la Loma del Sangremal tras la batalla de 1531?',
      '¿Quién fue el noble otomí Fernando de Tapia (Conín) y qué relevancia tuvo en la pacificación y trazo virreinal de la urbe?',
      'te gustaba el chocolate',
      'cuentanos de tu niñez',
      'quienes eran tus padres',
      'que te gustaba comer',
      'cual era tu dulce favorito'
    ]
  }
];

console.log('=== VERIFICANDO CONSULTA DE PREGUNTAS EN CACHÉ (0 TOKENS) ===\n');

let totalTests = 0;
let passedTests = 0;

for (const tc of testCases) {
  console.log(`\n📌 Personaje: ${tc.character} (${tc.slug})`);
  for (const q of tc.queries) {
    totalTests++;
    const res = searchQaInVaultNode(tc.slug, q);
    if (res.found && res.answer) {
      passedTests++;
      console.log(`  ✅ [ENCONTRADA] "${q}"`);
      console.log(`     -> Respuesta: "${res.answer.slice(0, 100)}..."\n`);
    } else {
      console.error(`  ❌ [FALLÓ] "${q}" NO se encontró en el caché de ${tc.slug}`);
    }
  }
}

console.log(`\n========================================`);
console.log(`Resultado: ${passedTests}/${totalTests} pruebas pasaron exitosamente.`);
if (passedTests !== totalTests) {
  process.exit(1);
} else {
  console.log('¡Todas las preguntas sin acento, con acento y variaciones responden con 0 tokens de la Bóveda Curricular!');
}
