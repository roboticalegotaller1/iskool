/**
 * Normalizador Matemático y de Números Negativos para Síntesis de Voz en Español (ISkool)
 * --------------------------------------------------------------------------------------
 * Módulo puro (compatible con servidor Node.js y navegador) que identifica con precisión
 * números negativos, signos de resta, variables algebraicas, potencias, subíndices y
 * operadores matemáticos para que el motor de voz los pronuncie en español fluido
 * (ej. "-5" -> "menos cinco", "b=-5" -> "be igual a menos cinco", "x² - 5x + 6 = 0" ->
 * "equis al cuadrado menos cinco equis más seis igual a cero") sin jamás leer "guion cinco",
 * respetando palabras compuestas con guion ("paso-a-paso", "COVID-19") y rangos históricos.
 */

const SUBSCRIPT_DIGITS: Record<string, string> = {
  '₀': '0',
  '₁': '1',
  '₂': '2',
  '₃': '3',
  '₄': '4',
  '₅': '5',
  '₆': '6',
  '₇': '7',
  '₈': '8',
  '₉': '9',
};

const SPOKEN_ALGEBRA_VARS: Record<string, string> = {
  a: 'a',
  b: 'be',
  c: 'ce',
  d: 'de',
  k: 'ka',
  m: 'eme',
  n: 'ene',
  p: 'pe',
  q: 'cu',
  r: 'erre',
  t: 'te',
  u: 'u',
  v: 'uve',
  x: 'equis',
  y: 'ye',
  z: 'zeta',
};

const STEP_ORDINAL_WORDS: Record<string, string> = {
  '1': 'Uno',
  '2': 'Dos',
  '3': 'Tres',
  '4': 'Cuatro',
  '5': 'Cinco',
  '6': 'Seis',
  '7': 'Siete',
  '8': 'Ocho',
  '9': 'Nueve',
  '10': 'Diez',
};

function spokenVar(letter: string): string {
  const lower = letter.toLowerCase();
  return SPOKEN_ALGEBRA_VARS[lower] || letter;
}

function spokenExponent(exp: string): string {
  if (!exp) return '';
  const clean = exp.replace(/^\^/, '');
  if (clean === '²' || clean === '2') return ' al cuadrado';
  if (clean === '³' || clean === '3') return ' al cubo';
  if (clean === '⁴' || clean === '4') return ' a la cuarta';
  if (clean === '⁵' || clean === '5') return ' a la quinta';
  if (clean === 'ⁿ' || clean.toLowerCase() === 'n') return ' a la ene';
  return ` elevado a la ${clean}`;
}

/**
 * Normaliza expresiones matemáticas, números negativos, signos y estructura de pasos
 * para lectura natural y fluida en español latinoamericano.
 */
export function normalizeSpanishMathAndNegatives(input: string): string {
  if (!input || typeof input !== 'string') return '';
  let result = input;

  // 1. Preservar listas numeradas, viñetas y saltos de párrafo ANTES de aplanar saltos de línea
  result = result
    .replace(/\r\n/g, '\n')
    // Viñetas al inicio de línea ("- Texto" o "• Texto") -> pausa suave sin leer "menos" ni "guion"
    .replace(/(?:^|\n)\s*[-–—•▪▸]\s+(?=[A-ZÁÉÍÓÚÑa-záéíóúñ¡¿])/g, '. ')
    // Pasos numerados al inicio de línea ("1. Identificamos..." -> "Uno: Identificamos...")
    .replace(/(?:^|\n)\s*([1-9]|10)\.\s+(?=[A-ZÁÉÍÓÚÑ¡¿])/g, (_m, num: string) => {
      const word = STEP_ORDINAL_WORDS[num] || num;
      return `. ${word}: `;
    })
    // Párrafos dobles: cerrar con punto si no termina en signo de puntuación
    .replace(/([^\s.!?:;,\n])\s*\n{2,}/g, '$1. ')
    .replace(/([.!?:;])\s*\n{2,}/g, '$1 ')
    // Saltos simples restantes -> pausa suave si falta puntuación
    .replace(/([^\s.!?:;,\n])\s*\n\s*/g, '$1. ')
    .replace(/\n+/g, ' ');

  // 1.b Códigos alfanuméricos con guion (ej. "COVID-19", "UTF-8", "ISO-9001") -> espacio limpio para evitar "guion" o "menos"
  result = result.replace(/\b([A-Z]{2,})[-–](\d+)\b/g, '$1 $2');

  // 2. Proteger rangos temporales/numéricos explícitos con unidad (ej. "00–15 min", "15-40 minutos", "10-12 años")
  // para que el guion se lea como "a" y nunca como "menos".
  result = result.replace(
    /\b(\d{1,4})\s*[-–—]\s*(\d{1,4})\s*(min|mins|minutos?|seg|segundos?|hrs?|horas?|d[ií]as?|semanas?|meses?|a[ñn]os?|sesiones?|p[aá]gs?\.?|p[aá]ginas?)\b/gi,
    '$1 a $2 $3'
  );

  // 3. Temperaturas y grados negativos o positivos (ej. "-15°C", "-4 °C", "-10°F")
  result = result.replace(
    /(?<![a-zA-Z0-9áéíóúñÁÉÍÓÚÑ])[-−–]\s*(\d+(?:[.,]\d+)?)\s*°\s*([CF])\b/g,
    (_m, num: string, unit: string) =>
      `menos ${num} grados ${unit.toUpperCase() === 'C' ? 'Celsius' : 'Fahrenheit'}`
  );
  result = result.replace(
    /\b(\d+(?:[.,]\d+)?)\s*°\s*([CF])\b/g,
    (_m, num: string, unit: string) =>
      `${num} grados ${unit.toUpperCase() === 'C' ? 'Celsius' : 'Fahrenheit'}`
  );

  // 4. Variables con subíndice Unicode (ej. "x₁", "x₂", "y₁", "a₁")
  result = result.replace(/([a-zA-Z])([₀-₉]+)/g, (_m, v: string, subs: string) => {
    const digits = subs
      .split('')
      .map((ch) => SUBSCRIPT_DIGITS[ch] ?? ch)
      .join(' ');
    return `${spokenVar(v)} sub ${digits}`;
  });

  // 5. Variables algebraicas negativas o aisladas entre comillas simples/dobles (ej. "'-b'", "'a'", "'b'", "'c'")
  result = result.replace(
    /['"«]\s*[-−–]\s*([a-zA-Z])\s*['"»]/g,
    (_m, v: string) => `menos ${spokenVar(v)}`
  );
  result = result.replace(
    /['"«]\s*([abcxyzABCXYZ])\s*['"»]/g,
    (_m, v: string) => spokenVar(v)
  );

  // 6. Multiplicación implícita de binomios entre paréntesis: "(x - 2)(x - 3)" -> "equis menos 2, por equis menos 3"
  result = result.replace(/\)\s*\(/g, ', por ');

  // 7. Raíz cuadrada y símbolos matemáticos Unicode
  result = result
    .replace(/√\s*\(([^)]+)\)/g, ' raíz cuadrada de $1, ')
    .replace(/√\s*([0-9]+(?:[.,][0-9]+)?|[a-zA-Z])/g, ' raíz cuadrada de $1 ')
    .replace(/±/g, ' más menos ')
    .replace(/Δ/g, ' discriminante delta ')
    .replace(/≠/g, ' diferente de ')
    .replace(/≤/g, ' menor o igual que ')
    .replace(/≥/g, ' mayor o igual que ')
    .replace(/×/g, ' por ')
    .replace(/÷/g, ' entre ')
    .replace(/∞/g, ' infinito ');

  // 8. Números negativos unarios (CUALQUIER contexto: b=-5, (-5), -2 y -3, -12.5, -0.5, -5x, -3/4, inicio de frase)
  // Excluye guiones pegados a una letra/dígito previo (protege "COVID-19", "UTF-8", "fase-6", "paso-a-paso").
  result = result.replace(
    /(?<![a-zA-Z0-9áéíóúñÁÉÍÓÚÑ])[-−–]\s*(\d+(?:[.,]\d+)?)/g,
    (_m, num: string) => `menos ${num}`
  );

  // 9. Variables algebraicas negativas unarias sin comillas (ej. "-b ±", "(-b)", "= -x²", "-x + 4")
  result = result.replace(
    /(?<![a-zA-Z0-9áéíóúñÁÉÍÓÚÑ])[-−–]\s*([abcxyzABCXYZ])(?=[²³⁴⁵\^]|\s*(?:[=+×÷*/),;.:<>]|más|menos|igual|por|entre|es|se|vale)\b|$)/g,
    (_m, v: string) => `menos ${spokenVar(v)}`
  );

  // 10. Operador de resta binario entre términos matemáticos (ej. "x² - 5x", "x - 2", "b² - 4ac", "10 - 3")
  result = result.replace(
    /(?<=(?:\d|[²³⁴⁵)]|(?<![a-zA-ZáéíóúñÁÉÍÓÚÑ])[abcxyzABCXYZ]))\s*[-−–]\s*(?=\d|\(|(?:menos\s+)?[abcxyzABCXYZ](?![a-zA-ZáéíóúñÁÉÍÓÚÑ]))/g,
    ' menos '
  );

  // 11. Términos algebraicos compuestos comunes (ej. "ax²", "bx", "4ac", "2a", "5x", "3x²")
  result = result
    .replace(/(?<![a-zA-ZáéíóúñÁÉÍÓÚÑ])ax([²³⁴]|\^[2-5])?(?![a-zA-ZáéíóúñÁÉÍÓÚÑ])/g, (_m, exp = '') =>
      `a por equis${spokenExponent(exp)}`
    )
    .replace(/(?<![a-zA-ZáéíóúñÁÉÍÓÚÑ])bx([²³⁴]|\^[2-5])?(?![a-zA-ZáéíóúñÁÉÍÓÚÑ])/g, (_m, exp = '') =>
      `be por equis${spokenExponent(exp)}`
    )
    .replace(/\b(\d+)\s*ac\b/g, '$1 a ce')
    .replace(/\b(\d+)([xyzXYZ])([²³⁴⁵]|\^[2-5])?\b/g, (_m, coef: string, v: string, exp = '') =>
      `${coef} ${spokenVar(v)}${spokenExponent(exp)}`
    )
    .replace(/\b(\d+)([ab])(?=\s*(?:[=+),;.]|menos|más|igual|entre|por|$))/g, (_m, coef: string, v: string) =>
      `${coef} ${spokenVar(v)}`
    );

  // 12. Potencias sobre variables o números (ej. "x²", "b²", "x^2", "5²", "2³")
  result = result
    .replace(/(?<![a-zA-ZáéíóúñÁÉÍÓÚÑ])([abcxyzABCXYZ])([²³⁴⁵]|\^[2-5])(?![a-zA-ZáéíóúñÁÉÍÓÚÑ])/g, (_m, v: string, exp: string) =>
      `${spokenVar(v)}${spokenExponent(exp)}`
    )
    .replace(/\b(\d+)([²³⁴⁵]|\^[2-5])\b/g, (_m, num: string, exp: string) =>
      `${num}${spokenExponent(exp)}`
    )
    .replace(/²/g, ' al cuadrado')
    .replace(/³/g, ' al cubo');

  // 13. Fracciones numéricas explícitas (ej. "3/4" -> "3 entre 4", "menos 1/2" -> "menos 1 entre 2")
  result = result.replace(/\b(\d+)\s*\/\s*(\d+)\b/g, '$1 entre $2');

  // 14. Variables algebraicas aisladas en contexto de ecuación ("a=1", "b=menos 5", "c=6", "x menos 2 = 0")
  // Nota: nunca convertir la conjunción española "y" salvo cuando acompaña explícitamente a "=" (ej. "y = 2x + 1")
  result = result.replace(
    /(?<![a-zA-ZáéíóúñÁÉÍÓÚÑ])([bcxzBCXZ])(?=\s*(?:=|\+|menos\b|más\b|igual\b|por\b|entre\b))/g,
    (_m, v: string) => spokenVar(v)
  );
  result = result.replace(
    /(?<![a-zA-ZáéíóúñÁÉÍÓÚÑ])([yY])(?=\s*=)/g,
    () => 'ye'
  );
  result = result.replace(
    /(?<=(?:=|\+|menos|más|igual|por|entre)\s+)([bcxzBCXZ])(?![a-zA-ZáéíóúñÁÉÍÓÚÑ])/g,
    (_m, v: string) => spokenVar(v)
  );
  result = result.replace(
    /(?<==\s*)([yY])(?![a-zA-ZáéíóúñÁÉÍÓÚÑ])/g,
    () => 'ye'
  );

  // 15. Operadores "=" y "+"
  result = result
    .replace(/\s*=\s*/g, ' igual a ')
    .replace(/(?<=(?:\d|equis|cuadrado|cubo|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|cero|[abcxyz\)]))\s*\+\s*/gi, ' más ')
    .replace(/\s+\+\s+/g, ' más ');

  // 16. Limpiar paréntesis cortos alrededor de números o expresiones matemáticas para prosodia natural
  // Ej: "den ce (6) y sumados den be (menos 5)" -> "den ce, 6, y sumados den be, menos 5."
  result = result
    .replace(/\(\s*((?:menos\s+)?\d+(?:[.,]\d+)?)\s*\)/g, ', $1,')
    .replace(/\(\s*([^()]{1,42})\s*\)/g, (_m, inner: string) => {
      if (/\b(?:menos|más|igual|equis|cuadrado|cubo)\b/i.test(inner)) {
        return ` ${inner.trim()}, `;
      }
      return `, ${inner.trim()}, `;
    });

  // 17. Expansión del cero aislado sin romper decimales (ej. "0.75", "menos 0.5", "4.0")
  result = result.replace(/(?<![.\d])\b0\b(?![.,]\d)/g, 'cero');

  // 18. Limpieza final de puntuación redundante para máxima fluidez prosódica
  result = result
    .replace(/^\s*[.,;:]+\s*/g, '')
    .replace(/,\s*([.!?:;])/g, '$1')
    .replace(/([.!?:;])\s*,/g, '$1')
    .replace(/,\s*,+/g, ', ')
    .replace(/\.\s*\.+/g, '. ')
    .replace(/\s+([.,!?:;])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return result;
}
