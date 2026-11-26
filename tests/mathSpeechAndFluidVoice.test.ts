import { describe, it, expect } from 'vitest';
import { normalizeMexicanSpanishText } from '@/lib/audio/lexicalNormalizer';
import { normalizeSpanishMathAndNegatives } from '@/lib/audio/mathSpeechNormalizer';

describe('Normalización Matemática, Números Negativos y Entonación Fluida en Español (TTS)', () => {
  it('identifica y lee correctamente números negativos en todos los contextos sin pronunciar "guion"', () => {
    const cases: Array<[string, string]> = [
      ['b=-5', 'be igual a menos cinco'],
      ['sumados den \'b\' (-5).', 'menos cinco'],
      ['Estos números son -2 y -3.', 'menos dos y menos tres'],
      ['La temperatura bajó a -15°C esta madrugada.', 'menos quince grados Celsius'],
      ['El resultado es -12.5 y el coeficiente es -0.75.', 'menos doce punto cinco'],
      ['Valor exacto: −42 y también –8.', 'menos cuarenta y dos'],
      ['Si \'b\' es negativo, \'-b\' se vuelve positivo.', 'menos be se vuelve positivo'],
      ['En la fórmula general: -b ± √(b² - 4ac)', 'menos be más menos raíz cuadrada de be al cuadrado menos cuatro a ce'],
    ];

    for (const [input, expectedFragment] of cases) {
      const normalized = normalizeMexicanSpanishText(input);
      expect(normalized.toLowerCase()).toContain(expectedFragment.toLowerCase());
      expect(normalized).not.toMatch(/[-−–]\s*\d/);
      expect(normalized.toLowerCase()).not.toContain('guion');
    }
  });

  it('normaliza la Clase Maestra completa de ecuaciones de segundo grado con dicción matemática natural', () => {
    const lesson = [
      "Bienvenido, Aspirante a Geómetra. Una ecuación de segundo grado (o cuadrática) es una igualdad algebraica donde el exponente más alto de la incógnita es 2. Su forma canónica es ax² + bx + c = 0, donde 'a', 'b' y 'c' son números reales y 'a' nunca debe ser cero.",
      '',
      'Resolvamos un enigma paso a paso: x² - 5x + 6 = 0.',
      '1. Identificamos coeficientes: a=1, b=-5, c=6.',
      "2. Buscamos dos números que multiplicados den 'c' (6) y sumados den 'b' (-5). Estos números son -2 y -3.",
      '3. Factorizamos: (x - 2)(x - 3) = 0.',
      '4. Aplicamos la propiedad del producto cero: x - 2 = 0 o x - 3 = 0.',
      '5. Raíces finales: x₁ = 2, x₂ = 3. ¡Misión cumplida!',
      '',
      "1. El Error del Signo Olvidado: Al usar la fórmula general, muchos olvidan que si 'b' es negativo, '-b' se vuelve positivo.",
      '2. El Error del Vacío: Si tienes x² = 9, debes transformarla en x² - 9 = 0.',
    ].join('\n');

    const spoken = normalizeMexicanSpanishText(lesson);

    expect(spoken).toContain('a por equis al cuadrado más be por equis más ce igual a cero');
    expect(spoken).toContain('equis al cuadrado menos cinco equis más seis igual a cero');
    expect(spoken).toContain('Uno: Identificamos coeficientes: a igual a uno, be igual a menos cinco, ce igual a seis');
    expect(spoken).toContain('menos cinco');
    expect(spoken).toContain('menos dos y menos tres');
    expect(spoken).toContain('equis menos dos, por equis menos tres, igual a cero');
    expect(spoken).toContain('equis sub uno igual a dos, equis sub dos igual a tres');
    expect(spoken).toContain('menos be se vuelve positivo');
    expect(spoken).toContain('equis al cuadrado menos nueve igual a cero');
    expect(spoken).not.toMatch(/[-−–]\s*\d/);
    expect(spoken).not.toContain('un y');
  });

  it('protege palabras compuestas con guion, códigos técnicos, rangos históricos y rangos de minutos', () => {
    const historical = normalizeMexicanSpanishText('La Independencia ocurrió entre 1810-1821 en un proceso socio-emocional.');
    expect(historical).toContain('mil ochocientos diez a mil ochocientos veintiuno');
    expect(historical).not.toContain('menos');

    const timing = normalizeMexicanSpanishText('Fase de inicio: 00–15 min y desarrollo 15–40 min. Norma UTF-8 y COVID-19.');
    expect(timing).toContain('cero a quince min');
    expect(timing).toContain('quince a cuarenta min');
    expect(timing).toContain('UTF ocho');
    expect(timing).toContain('COVID diecinueve');
    expect(timing).not.toContain('menos');
    expect(timing).not.toMatch(/UTF-|COVID-/);

    const bullets = normalizeSpanishMathAndNegatives('Puntos clave:\n- Identificar coeficientes\n- Comprobar las raíces');
    expect(bullets).not.toContain('menos Identificar');
    expect(bullets).not.toContain('menos Comprobar');
  });
});
