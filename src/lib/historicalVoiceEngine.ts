/**
 * Motor de Configuración y Selección de Voz para Personajes Históricos (ISkool)
 * Asegura la selección estricta de voz acorde a sexo, personaje y edad.
 */

export function getPersonaGender(characterName?: string): 'female' | 'male' {
  if (!characterName) return 'female';
  const norm = characterName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const femaleKeywords = [
    'josefa',
    'corregidora',
    'leona',
    'vicario',
    'juana',
    'sor juana',
    'gertrudis',
    'bocanegra',
    'mariana',
    'rodriguez',
    'carmen',
    'serdan',
    'frida',
    'kahlo',
    'malinche',
    'malintzin',
    'rosario',
    'castellanos',
    'mujer',
    'senora',
    'dona'
  ];

  if (femaleKeywords.some(k => norm.includes(k))) {
    return 'female';
  }
  return 'male';
}

export function selectHistoricalSpeechVoice(gender: 'female' | 'male'): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const esVoices = voices.filter(v => v.lang && (v.lang.startsWith('es') || v.lang.startsWith('es-')));
  const pool = esVoices.length > 0 ? esVoices : voices;

  const femaleNames = [
    'sabina', 'dalia', 'helena', 'laura', 'paulina', 'monica', 'rosa', 
    'sofia', 'elena', 'camila', 'francisca', 'female', 'mujer', 'chica', 
    'zira', 'karen', 'lucia', 'maria', 'victoria', 'alva', 'marisol',
    'angelica', 'luciana', 'paloma', 'sfb#female', 'female', 'es-mx-x',
    'es-es-x'
  ];
  const maleNames = [
    'raul', 'pablo', 'jorge', 'carlos', 'miguel', 'alvaro', 'diego', 
    'enrique', 'male', 'hombre', 'david', 'alberto', 'pedro', 'manuel',
    'sfb#male', 'male'
  ];

  if (gender === 'female') {
    // 1. Coincidencia por nombre femenino en voces en español
    const femaleEs = esVoices.find(v => femaleNames.some(fn => v.name.toLowerCase().includes(fn)));
    if (femaleEs) return femaleEs;

    // 2. Voz en español que NO contenga nombres masculinos
    const nonMaleEs = esVoices.find(v => !maleNames.some(mn => v.name.toLowerCase().includes(mn)));
    if (nonMaleEs) return nonMaleEs;

    // 3. Cualquier voz femenina disponible en el sistema
    const anyFemale = voices.find(v => femaleNames.some(fn => v.name.toLowerCase().includes(fn)));
    if (anyFemale) return anyFemale;

    return esVoices[0] || voices[0];
  } else {
    // 1. Coincidencia por nombre masculino en español
    const maleEs = esVoices.find(v => maleNames.some(mn => v.name.toLowerCase().includes(mn)));
    if (maleEs) return maleEs;

    return esVoices[0] || voices[0];
  }
}

export function configureHistoricalUtterance(
  utterance: SpeechSynthesisUtterance, 
  characterName: string
): void {
  const gender = getPersonaGender(characterName);
  utterance.lang = 'es-MX';

  if (gender === 'female') {
    // Tono femenino adulto maduro, elocuente y dignificado
    utterance.pitch = 1.04;
    utterance.rate = 0.94;
  } else {
    // Tono masculino grave, solemne e histórico
    utterance.pitch = 0.90;
    utterance.rate = 0.92;
  }

  const voice = selectHistoricalSpeechVoice(gender);
  if (voice) {
    utterance.voice = voice;
  }
}
