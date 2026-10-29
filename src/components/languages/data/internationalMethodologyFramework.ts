// ============================================================================
// ISKOOL GLOBAL LANGUAGE METHODOLOGY ENGINE (NANO BANANA 2.1 EDITION)
// Neuro-Communicative & Action-Oriented CEFR Continuous Model (Modelo Continuo 5E)
// Synthesizing Global Benchmarks: Cambridge One, The Anglo, Berlitz,
// Quick Learning, Alliance Française (DELF/DALF), and British Council / CEFR 2020.
// ============================================================================

export type TargetLanguageCode = 'en-US' | 'fr-FR';

export interface InternationalInstitutionAudit {
    id: string;
    institution: string;
    countryOrigin: string;
    globalRating: string;
    coreMethodologyName: string;
    targetLanguages: ('en-US' | 'fr-FR')[];
    surgicalStrengths: string[];
    structuralLimitations: string[];
    iskoolSynthesisAndUpgrade: string;
    mappedISkoolToolId: string;
    mappedISkoolToolName: string;
    accentColor: string;
}

export interface ContinuousMethodologyStage {
    stageNumber: 1 | 2 | 3 | 4 | 5;
    id: 'phonetic_awakening' | 'direct_immersion' | 'neuromuscular_oral' | 'socratic_mediation' | 'forensic_telemetry';
    code: string;
    titleEs: string;
    titleTarget: Record<TargetLanguageCode, string>;
    subtitleEs: string;
    pedagogicalPillar: string;
    benchmarkOrigins: string[];
    neuroCognitiveMechanism: string;
    primaryToolTab: 'hardware' | 'editor' | 'karaoke' | 'writing' | 'analytics' | 'curriculum' | 'reports';
    primaryToolLabel: string;
    durationMinutesPerSession: number;
    weightInContinuousScore: number; // sums to 100
    observableStudentActions: Record<TargetLanguageCode, string[]>;
    measurableKpis: string[];
    colorHex: string;
}

export interface MicroSkillDescriptor {
    code: string;
    nameEs: string;
    nameTarget: Record<TargetLanguageCode, string>;
    cefrAlignment: string;
    cenniRange: string;
    diagnosticMetric: string;
    verificationTool: string;
}

export interface MacroCompetencySkill {
    id: 'phonetics' | 'listening' | 'speaking' | 'reading' | 'writing' | 'mediation';
    shortCode: 'FON' | 'CO' | 'PO' | 'CE' | 'PE' | 'MED';
    nameEs: string;
    nameTarget: Record<TargetLanguageCode, string>;
    cefrCompanionMode: 'Reception' | 'Production' | 'Interaction' | 'Mediation' | 'Phonological Control';
    benchmarkOrigin: string;
    descriptionEs: string;
    colorHex: string;
    defaultMasteryByCefr: Record<string, number>;
    microSkills: MicroSkillDescriptor[];
}

export interface ContinuousUnitBlueprint {
    blockNumber: number; // 1 to 8 (5 weeks each = 40 weeks)
    weeksRange: string;
    lessonsRange: string;
    blockTitle: Record<TargetLanguageCode, string>;
    cefrSubBandProgression: string;
    dominantMethodologyFocus: string;
    communicativeCanDoStatement: Record<TargetLanguageCode, string>;
    phoneticTargetFocus: Record<TargetLanguageCode, string>;
    morphosyntacticTargetFocus: Record<TargetLanguageCode, string>;
    historicalMentorAssigned: Record<TargetLanguageCode, string>;
    tangibleDeliverable: Record<TargetLanguageCode, string>;
}

// ----------------------------------------------------------------------------
// 1. SURGICAL AUDIT OF INTERNATIONAL BENCHMARK INSTITUTIONS
// ----------------------------------------------------------------------------
export const INTERNATIONAL_BENCHMARK_AUDITS: InternationalInstitutionAudit[] = [
    {
        id: 'cambridge_one',
        institution: 'Cambridge One (Cambridge University Press & Assessment)',
        countryOrigin: 'Reino Unido (UK)',
        globalRating: '9.8 / 10 — Estándar Global de Certificación Académica',
        coreMethodologyName: 'Cambridge English Framework & Spiral Corpus Scaffolding',
        targetLanguages: ['en-US', 'fr-FR'],
        surgicalStrengths: [
            'Alineación milimétrica con el Marco Común Europeo (Pre-A1 Starters/Movers/Flyers, A2 Key, B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency).',
            'Secuenciación en espiral respaldada por el Cambridge Learner Corpus (detección empírica de errores frecuentes por lengua materna hispanohablante).',
            'Evaluación integrada de las 4 macro-habilidades con descriptores "Can-Do" verificables por unidad.',
        ],
        structuralLimitations: [
            'Sus ejercicios digitales suelen ser asincrónicos de opción múltiple (fill-in-the-blanks) sin interlocutor conversacional vivo a 60 FPS.',
            'Carece de análisis espectral de formantes acústicos en tiempo real para corregir vicios articulatorios al instante.',
        ],
        iskoolSynthesisAndUpgrade:
            'ISkool adopta la arquitectura curricular en espiral de 40 semanas (160 sesiones) y la taxonomía de errores del Corpus de Aprendices, pero sustituye los ejercicios pasivos por avatares históricos a 60 FPS y el Writing Engine Autónomo Socrático (0% Ghostwriting).',
        mappedISkoolToolId: 'curriculum',
        mappedISkoolToolName: 'Ecosistema Curricular 40 Semanas & Writing Engine',
        accentColor: '#2563eb',
    },
    {
        id: 'the_anglo',
        institution: 'The Anglo (The Anglo Mexican Foundation / CELTA-DELTA)',
        countryOrigin: 'Reino Unido / México',
        globalRating: '9.6 / 10 — Referente Pedagógico Comunicativo en Hispanoamérica',
        coreMethodologyName: 'Communicative Language Teaching (CLT) & Inductive Functional Grammar',
        targetLanguages: ['en-US'],
        surgicalStrengths: [
            'Estándar docente CELTA/DELTA donde la gramática se descubre inductivamente a partir de situaciones comunicativas auténticas.',
            'Priorización del "Student Talking Time" (STT > 70%) frente al "Teacher Talking Time" (TTT < 30%).',
            'Énfasis riguroso en adecuación pragmática (registro formal vs. coloquial, entonación británica/internacional y fluidez discursiva).',
        ],
        structuralLimitations: [
            'En grupos presenciales de 12 a 18 alumnos, el tiempo real de habla individual por estudiante cae a menos de 4 minutos efectivos por hora.',
            'La retroalimentación fonética depende de la atención subjetiva del docente en turno.',
        ],
        iskoolSynthesisAndUpgrade:
            'ISkool multiplica el Student Talking Time al 100% mediante emparejamiento 1-a-1 con Mentores 3D y Próceres Históricos en primera persona, garantizando inducción gramatical contextualizada y retroalimentación pragmática inmediata.',
        mappedISkoolToolId: 'editor',
        mappedISkoolToolName: 'Taller de Diálogo Situacional & Mentores 3D a 60 FPS',
        accentColor: '#0891b2',
    },
    {
        id: 'berlitz_method',
        institution: 'Berlitz Corporation (Berlitz Mexico & Global)',
        countryOrigin: 'Estados Unidos / Internacional',
        globalRating: '9.5 / 10 — Pionero Mundial en Inmersión Directa Oral',
        coreMethodologyName: 'Direct Method (100% Target-Language Immersion & Socratic Cycle)',
        targetLanguages: ['en-US', 'fr-FR'],
        surgicalStrengths: [
            'Regla de oro de inmersión total: prohibición de traducción pasiva a la lengua materna durante el bloque de producción.',
            'Ciclo Presentación -> Práctica Guiada -> Producción Libre centrada en objetivos funcionales inmediatos.',
            'Corrección socrática instantánea mediante reformulación natural (recasting) y elicitación oral.',
        ],
        structuralLimitations: [
            'Menor profundidad en redacción académica estructurada y análisis morfosintáctico escrito para certificaciones C1/C2.',
            'Alto costo operativo para mantener tutores nativos individuales para cada alumno.',
        ],
        iskoolSynthesisAndUpgrade:
            'ISkool integra el Método Directo Berlitz en la Etapa 2 del Ciclo Continuo: los avatares históricos (Shakespeare, Lincoln, Ada Lovelace, Victor Hugo, Juana de Arco, Marie Curie) sostienen diálogos 100% en el idioma meta con elicitación socrática en primera persona.',
        mappedISkoolToolId: 'editor',
        mappedISkoolToolName: 'Conversational Avatar Studio (Inmersión 1ª Persona)',
        accentColor: '#dc2626',
    },
    {
        id: 'quick_learning',
        institution: 'Quick Learning (Phonetic Color & Acoustic System)',
        countryOrigin: 'México / Latinoamérica',
        globalRating: '9.4 / 10 — Líder en Automatización Fonético-Acústica',
        coreMethodologyName: 'Audiolingual Neuromuscular & Color-Coded Phonemic Conditioning',
        targetLanguages: ['en-US'],
        surgicalStrengths: [
            'Principio "Primero hablar y escuchar antes de leer y escribir" para evitar la interferencia ortográfica del español.',
            'Mapeo visual-acústico de fonemas vocálicos y consonánticos (schwa /ə/, interdentales /θ/ /ð/, vibrantes y aspiradas).',
            'Entrenamiento de memoria muscular articulatoria (mandíbula, ápice lingual, velo del paladar) mediante repetición rítmica.',
        ],
        structuralLimitations: [
            'Sus tablas fonéticas tradicionales son estáticas en pizarrón y no miden espectralmente la onda acústica real del alumno.',
            'Riesgo de mecanicismo si no se conecta con mediación escrita y pensamiento crítico histórico/científico.',
        ],
        iskoolSynthesisAndUpgrade:
            'ISkool eleva la fonética acústica al estándar Nano Banana 2.1: cada avatar ejecuta articulación mandibular y labial anatómica a 60 FPS sincronizada con el Karaoke Fonético DSP, midiendo al milisegundo precisión de fonemas, ritmo y prosodia.',
        mappedISkoolToolId: 'reports',
        mappedISkoolToolName: 'Karaoke Fonético DSP & Bitácora Acústica de Pronunciación',
        accentColor: '#7c3aed',
    },
    {
        id: 'alliance_francaise_fei',
        institution: 'Alliance Française & France Éducation International (DELF / DALF)',
        countryOrigin: 'Francia (Ministère de l’Éducation Nationale)',
        globalRating: '9.9 / 10 — Autoridad Mundial en Francés Lengua Extranjera (FLE)',
        coreMethodologyName: 'Perspective Actionnelle (Enfoque Accional) & Médiation Francophone',
        targetLanguages: ['fr-FR'],
        surgicalStrengths: [
            'Concibe al estudiante como un "Actor Social" que resuelve misiones auténticas en contextos francófonos reales.',
            'Dominio riguroso de la fonología francesa: vocales nasales (/ɑ̃/, /ɛ̃/, /ɔ̃/), vibrante uvular (/ʁ/), vocal anterior redondeada (/y/), liaison y elisión.',
            'Metodología formal de estructuración del pensamiento: Compte Rendu, Synthèse de Documents y Essai Argumenté (conectores lógicos y registro soutenu).',
        ],
        structuralLimitations: [
            'Curva de entrada intimidante para hispanohablantes sin acompañamiento fonético micro-graduado en las primeras semanas.',
        ],
        iskoolSynthesisAndUpgrade:
            'ISkool incorpora la Perspective Actionnelle DELF Prim/Junior/Tout Public y DALF C1-C2 con mentores históricos francófonos (Victor Hugo, Juana de Arco, Napoléon, Marie Curie) a 60 FPS y rúbricas oficiales de France Éducation International.',
        mappedISkoolToolId: 'writing',
        mappedISkoolToolName: 'Misiones Accionales FLE & Writing Engine DELF/DALF',
        accentColor: '#0284c7',
    },
    {
        id: 'british_council_cefr',
        institution: 'Council of Europe & British Council (CEFR Companion Volume)',
        countryOrigin: 'Unión Europea / Reino Unido',
        globalRating: '10 / 10 — Marco Normativo Internacional + Equivalencia SEP CENNI',
        coreMethodologyName: 'CEFR 4-Mode Communicative Matrix + Plurilingual Mediation & CENNI 1–20',
        targetLanguages: ['en-US', 'fr-FR'],
        surgicalStrengths: [
            'Sustituye la división aislada de habilidades por los 4 Modos de Comunicación reales: Recepción, Producción, Interacción y Mediación.',
            'Introduce la escala renovada de Control Fonológico (Articulación de Sonidos, Prosodia, Inteligibilidad Internacional).',
            'Homologación directa en México con la Certificación Nacional de Nivel de Idioma (SEP CENNI Niveles 1 al 20).',
        ],
        structuralLimitations: [
            'Es un marco descriptivo/normativo que requiere una plataforma tecnológica integral para instrumentar su seguimiento continuo día a día.',
        ],
        iskoolSynthesisAndUpgrade:
            'ISkool materializa el CEFR Companion Volume y la escala CENNI 1–20 en una Matriz de Telemetría Continua (BKT/IRT) que rastrea 6 Macro-Competencias y 36 Micro-Habilidades en tiempo real.',
        mappedISkoolToolId: 'analytics',
        mappedISkoolToolName: 'Analítica Gráfica CEFR & Telemetría Continua CENNI',
        accentColor: '#059669',
    },
];

// ----------------------------------------------------------------------------
// 2. THE 5-STAGE CONTINUOUS METHODOLOGY CYCLE (MODELO CONTINUO ISKOOL 5E)
// ----------------------------------------------------------------------------
export const CONTINUOUS_METHODOLOGY_STAGES: ContinuousMethodologyStage[] = [
    {
        stageNumber: 1,
        id: 'phonetic_awakening',
        code: 'ETAPA 1 · PHON-DSP',
        titleEs: 'Despertar Fonético-Acústico & Calibración Articulatoria',
        titleTarget: {
            'en-US': 'Stage 1: Phonetic-Acoustic Awakening & Articulatory Calibration',
            'fr-FR': 'Étape 1 : Éveil Phonético-Acoustique & Calibration Articulatoire',
        },
        subtitleEs: 'Preparación neuro-auditiva y modelado mandibular a 60 FPS antes de la interferencia ortográfica',
        pedagogicalPillar: 'Inspirado en Quick Learning + Escala de Control Fonológico CEFR 2020',
        benchmarkOrigins: ['Quick Learning', 'CEFR Phonological Control'],
        neuroCognitiveMechanism:
            'Activa el bucle fonológico (corteza auditiva superior y área de Broca) emparejando la onda acústica nativa con la cinemática mandibular/labial a 60 FPS (Nano Banana 2.1) antes de exponer al alumno a la grafía.',
        primaryToolTab: 'hardware',
        primaryToolLabel: 'Diagnóstico Acústico & Modelado Articulatorio 60 FPS',
        durationMinutesPerSession: 8,
        weightInContinuousScore: 15,
        observableStudentActions: {
            'en-US': [
                'Calibrates microphone SNR (>25 dB) and observes 60 FPS mandibular/lip kinematics on target English phonemes (/θ/, /ð/, /ə/, /æ/, /ɪ/ vs /iː/).',
                'Identifies stress-timed rhythm and vowel reduction patterns before reading orthographic text.',
            ],
            'fr-FR': [
                'Calibre le microphone SNR (>25 dB) et observe la cinématique mandibulaire à 60 FPS sur les phonèmes cibles (/y/, /ø/, /ɑ̃/, /ɛ̃/, /ɔ̃/, /ʁ/).',
                'Identifie le groupe rythmique oxytonique, la liaison obligatoire et l’élision vocalique.',
            ],
        },
        measurableKpis: [
            'Relación Señal/Ruido (SNR dB) y Fidelidad de Captura Espectral',
            'Discriminación de Pares Mínimos (Minimal Pairs Accuracy %)',
            'Sincronización Visema-Fonema a 60 FPS',
        ],
        colorHex: '#7c3aed',
    },
    {
        stageNumber: 2,
        id: 'direct_immersion',
        code: 'ETAPA 2 · IMM-60FPS',
        titleEs: 'Inmersión Contextual Directa en 1ª Persona',
        titleTarget: {
            'en-US': 'Stage 2: First-Person Direct Contextual Immersion',
            'fr-FR': 'Étape 2 : Immersion Contextuelle Directe à la 1re Personne',
        },
        subtitleEs: 'Interacción situacional 100% en lengua meta con Mentores 3D y Próceres Históricos vivos',
        pedagogicalPillar: 'Inspirado en Berlitz Direct Method + The Anglo Inductive CLT',
        benchmarkOrigins: ['Berlitz Method', 'The Anglo (CLT)'],
        neuroCognitiveMechanism:
            'Elimina la traducción mental intermedia (L1 -> L2) situando al alumno frente a un interlocutor tridimensional vivo a 60 FPS que habla estrictamente en primera persona con anclaje histórico y pragmático.',
        primaryToolTab: 'editor',
        primaryToolLabel: 'Taller de Diálogo & Avatar Studio 60 FPS',
        durationMinutesPerSession: 12,
        weightInContinuousScore: 25,
        observableStudentActions: {
            'en-US': [
                'Engages in direct dialogue with Prof. Claire, Prof. Arthur, William Shakespeare, Ada Lovelace, or Abraham Lincoln strictly in the first person.',
                'Deduces grammatical structures inductively from real-world communicative context.',
            ],
            'fr-FR': [
                'Engage un dialogue direct avec Prof. Claire, Victor Hugo, Jeanne d’Arc, Marie Curie ou Napoléon strictement à la première personne.',
                'Déduit les structures morphosyntaxiques par induction à partir de situations authentiques.',
            ],
        },
        measurableKpis: [
            'Comprensión Auditiva Contextual (Listening & Pragmatic Grasp %)',
            'Tiempo de Respuesta Comunicativa (Turn-Taking Latency ms)',
            'Cero Dependencia de Traducción Pasiva (100% L2 Immersion Ratio)',
        ],
        colorHex: '#0284c7',
    },
    {
        stageNumber: 3,
        id: 'neuromuscular_oral',
        code: 'ETAPA 3 · KARAOKE-PROS',
        titleEs: 'Producción Oral Neuromuscular & Karaoke Fonético',
        titleTarget: {
            'en-US': 'Stage 3: Neuromuscular Oral Production & Phonetic Karaoke',
            'fr-FR': 'Étape 3 : Production Orale Neuromusculaire & Karaoké Phonétique',
        },
        subtitleEs: 'Evaluación acústica palabra por palabra con retroalimentación biomecánica instantánea',
        pedagogicalPillar: 'Inspirado en Quick Learning + The Anglo STT Maximization + Cambridge Speaking',
        benchmarkOrigins: ['Quick Learning', 'The Anglo', 'Cambridge Speaking'],
        neuroCognitiveMechanism:
            'Consolida la huella motora articulatoria comparando en tiempo real la emisión del alumno contra el patrón prosódico del mentor, coloreando cada palabra según su fidelidad fonética y desbloqueando el avance por umbral.',
        primaryToolTab: 'editor',
        primaryToolLabel: 'Karaoke Fonético & Evaluador Acústico en Vivo',
        durationMinutesPerSession: 15,
        weightInContinuousScore: 25,
        observableStudentActions: {
            'en-US': [
                'Performs real-time word-by-word phonetic production with instant green/amber/red acoustic telemetry.',
                'Re-articulates flagged phonemes until crossing the CEFR mastery threshold (80%+ accuracy).',
            ],
            'fr-FR': [
                'Exécute une production phonétique mot à mot en temps réel avec télémétrie acoustique instantanée.',
                'Corrige les voyelles nasales, les liaisons et l’intonation jusqu’à franchir le seuil de maîtrise CECR (80%+).',
            ],
        },
        measurableKpis: [
            'Exactitud Fonética Global (Phoneme Accuracy Score 0-100%)',
            'Fluidez y Cadencia Prosódica (Words Per Minute & Suprasegmental Rhythm)',
            'Tasa de Autocorrección Neuromuscular en Primer Intento',
        ],
        colorHex: '#059669',
    },
    {
        stageNumber: 4,
        id: 'socratic_mediation',
        code: 'ETAPA 4 · SOCRATIC-WRT',
        titleEs: 'Mediación Escrita & Estructuración Socrática (0% Ghostwriting)',
        titleTarget: {
            'en-US': 'Stage 4: Socratic Written Mediation & Structural Production',
            'fr-FR': 'Étape 4 : Médiation Écrite Socratique & Production Structurée',
        },
        subtitleEs: 'Producción textual autónoma guiada por andamiaje socrático y rúbricas Cambridge / DELF-DALF',
        pedagogicalPillar: 'Inspirado en Cambridge Writing + Alliance Française (Perspective Actionnelle DELF/DALF)',
        benchmarkOrigins: ['Cambridge One', 'Alliance Française (DELF/DALF)'],
        neuroCognitiveMechanism:
            'Transfiere la competencia oral hacia la memoria declarativa escrita. El Motor de IA Pedagógica jamás redacta por el alumno (0% Ghostwriting); formula preguntas socráticas para que el estudiante descubra y corrija su propia sintaxis.',
        primaryToolTab: 'writing',
        primaryToolLabel: 'Writing Engine Autónomo (Tutoría Socrática)',
        durationMinutesPerSession: 15,
        weightInContinuousScore: 20,
        observableStudentActions: {
            'en-US': [
                'Produces structured paragraphs, essays, or technical reports aligned with Cambridge Assessment criteria (Content, Communicative Achievement, Organisation, Language).',
                'Resolves morphosyntactic errors through Socratic questioning without passive auto-completion.',
            ],
            'fr-FR': [
                'Rédige des textes structurés (message, compte rendu, synthèse, essai argumenté) selon la grille officielle DELF/DALF.',
                'Corrige les accords grammaticaux, les modes verbaux (subjonctif/conditionnel) et les connecteurs logiques par guidage socratique.',
            ],
        },
        measurableKpis: [
            'Riqueza Léxica y Cohesión Discursiva (Type-Token Ratio & Discourse Markers)',
            'Precisión Morfosintáctica Autónoma (Grammar Self-Repair Index)',
            'Cumplimiento de Rúbrica Oficial Cambridge / DELF-DALF',
        ],
        colorHex: '#d97706',
    },
    {
        stageNumber: 5,
        id: 'forensic_telemetry',
        code: 'ETAPA 5 · CEFR-BKT',
        titleEs: 'Telemetría Forense CEFR/CENNI & Certificación Continua',
        titleTarget: {
            'en-US': 'Stage 5: Forensic CEFR/CENNI Telemetry & Continuous Progression',
            'fr-FR': 'Étape 5 : Télémétrie Forensique CECR/CENNI & Progression Continue',
        },
        subtitleEs: 'Trazabilidad longitudinal de las 6 macro-habilidades y 36 micro-competencias en las 40 semanas',
        pedagogicalPillar: 'Inspirado en Council of Europe CEFR + British Council + SEP CENNI (1–20)',
        benchmarkOrigins: ['Council of Europe (CEFR)', 'SEP CENNI (Niveles 1-20)', 'Cambridge One'],
        neuroCognitiveMechanism:
            'Cierra el ciclo de retroalimentación mediante inferencia bayesiana (BKT) y curvas de retención espaciada, actualizando el radar de competencias del estudiante y prescribiendo los fonemas o estructuras a reforzar en la siguiente sesión.',
        primaryToolTab: 'analytics',
        primaryToolLabel: 'Analítica Gráfica CEFR & Bitácora Forense',
        durationMinutesPerSession: 5,
        weightInContinuousScore: 15,
        observableStudentActions: {
            'en-US': [
                'Reviews personalized 6-skill CEFR radar and phonetic error ledger.',
                'Unlocks the next weekly module in the 40-Week Curriculum Ecosystem with verified CENNI/Cambridge readiness.',
            ],
            'fr-FR': [
                'Consulte le radar personnel des 6 compétences CECR et le journal forensique des phonèmes.',
                'Débloque le module hebdomadaire suivant dans l’Écosystème de 40 Semaines avec validation CENNI/DELF-DALF.',
            ],
        },
        measurableKpis: [
            'Índice Compuesto de Dominio CEFR (Pre-A1 a C2) y Nivel SEP CENNI (1 a 20)',
            'Velocidad de Adquisición por Semana (40-Week Longitudinal Velocity)',
            'Probabilidad de Aprobación en Certificación Internacional (Cambridge / DELF-DALF)',
        ],
        colorHex: '#e11d48',
    },
];

// ----------------------------------------------------------------------------
// 3. IDENTIFIABLE MACRO- & MICRO-SKILLS MATRIX (6 MACRO-SKILLS / 36 MICRO-SKILLS)
// ----------------------------------------------------------------------------
export const IDENTIFIABLE_LANGUAGE_SKILLS: MacroCompetencySkill[] = [
    {
        id: 'phonetics',
        shortCode: 'FON',
        nameEs: 'Control Fonológico & Articulación Neuromuscular',
        nameTarget: {
            'en-US': 'Phonological Control & Neuromuscular Articulation',
            'fr-FR': 'Contrôle Phonologique & Articulation Neuromusculaire',
        },
        cefrCompanionMode: 'Phonological Control',
        benchmarkOrigin: 'Quick Learning + CEFR 2020 Phonological Scale',
        descriptionEs:
            'Dominio biomecánico de fonemas vocálicos/consonánticos, ritmo silábico o acentual, entonación suprasegmental y enlace fonético (connected speech / liaison).',
        colorHex: '#7c3aed',
        defaultMasteryByCefr: { 'Pre-A1': 78, A1: 82, 'A2+': 85, B1: 87, 'B1+': 88, B2: 91, C1: 94, C2: 97 },
        microSkills: [
            {
                code: 'FON-01',
                nameEs: 'Articulación de Vocales Críticas y Reducción / Nasalización',
                nameTarget: {
                    'en-US': 'Vowel Formant Precision & Schwa (/ə/, /æ/, /ʌ/, /ɪ/ vs /iː/)',
                    'fr-FR': 'Précision des Voyelles Orales & Nasales (/y/, /ø/, /ɑ̃/, /ɛ̃/, /ɔ̃/)',
                },
                cefrAlignment: 'Pre-A1 – C2 (Sound Articulation)',
                cenniRange: 'CENNI 1 – 20',
                diagnosticMetric: 'Formant Accuracy % (DSP Spectral Match)',
                verificationTool: 'Karaoke Fonético & Avatar 60 FPS',
            },
            {
                code: 'FON-02',
                nameEs: 'Consonantes de Alta Fricción y Punto Articulatorio',
                nameTarget: {
                    'en-US': 'Interdental, Alveolar & Aspirated Plosives (/θ/, /ð/, /tʃ/, /dʒ/, /pʰ/)',
                    'fr-FR': 'Consonne Uvulaire (/ʁ/), Chuintantes (/ʃ/, /ʒ/) & Palatales',
                },
                cefrAlignment: 'A1 – C2 (Articulatory Precision)',
                cenniRange: 'CENNI 2 – 20',
                diagnosticMetric: 'Consonant Onset & Friction Precision %',
                verificationTool: 'Bitácora de Pronunciación',
            },
            {
                code: 'FON-03',
                nameEs: 'Enlace Fonético y Fluidez Suprasegmental',
                nameTarget: {
                    'en-US': 'Connected Speech, Catenation, Elision & Weak Forms',
                    'fr-FR': 'Liaison Obligatoire, Enchaînement Consonantique & Élision',
                },
                cefrAlignment: 'A2 – C2 (Prosodic Features)',
                cenniRange: 'CENNI 5 – 20',
                diagnosticMetric: 'Inter-Word Transition Smoothness Index',
                verificationTool: 'Karaoke Fonético en Tiempo Real',
            },
            {
                code: 'FON-04',
                nameEs: 'Entonación, Acento Tónico y Cadencia Discursiva',
                nameTarget: {
                    'en-US': 'Stress-Timed Rhythm & Pragmatic Pitch Contours',
                    'fr-FR': 'Rythme Oxytonique de Groupe & Courbe Mélodique',
                },
                cefrAlignment: 'A1 – C2 (Intonation & Stress)',
                cenniRange: 'CENNI 3 – 20',
                diagnosticMetric: 'Prosodic Cadence & WPM Stability',
                verificationTool: 'Analítica Gráfica CEFR',
            },
        ],
    },
    {
        id: 'listening',
        shortCode: 'CO',
        nameEs: 'Comprensión Auditiva & Decodificación Acústica',
        nameTarget: {
            'en-US': 'Auditory Comprehension & Acoustic Decoding (Listening)',
            'fr-FR': 'Compréhension de l’Oral & Décodage Acoustique (CO)',
        },
        cefrCompanionMode: 'Reception',
        benchmarkOrigin: 'Cambridge Listening + Berlitz Direct Immersion + DELF CO',
        descriptionEs:
            'Capacidad para procesar discurso hablado en velocidad natural, identificar ideas principales, detalles específicos, actitudes implícitas y variaciones de registro.',
        colorHex: '#2563eb',
        defaultMasteryByCefr: { 'Pre-A1': 81, A1: 84, 'A2+': 86, B1: 88, 'B1+': 89, B2: 92, C1: 95, C2: 98 },
        microSkills: [
            {
                code: 'CO-01',
                nameEs: 'Captación Global de Intención y Contexto Situacional',
                nameTarget: {
                    'en-US': 'Gist Comprehension & Communicative Intent Recognition',
                    'fr-FR': 'Compréhension Globale & Identification du Contexte Énonciatif',
                },
                cefrAlignment: 'Pre-A1 – B1 (Overall Oral Comprehension)',
                cenniRange: 'CENNI 1 – 10',
                diagnosticMetric: 'First-Listen Context Accuracy %',
                verificationTool: 'Taller de Diálogo & Avatares',
            },
            {
                code: 'CO-02',
                nameEs: 'Extracción Selectiva de Datos, Fechas y Argumentos',
                nameTarget: {
                    'en-US': 'Selective Extraction of Specific Facts & Key Arguments',
                    'fr-FR': 'Repérage d’Informations Précises & Données Factuelles',
                },
                cefrAlignment: 'A1 – B2 (Listening for Specific Information)',
                cenniRange: 'CENNI 3 – 14',
                diagnosticMetric: 'Detail Recall & Fact Verification Score',
                verificationTool: 'Ecosistema de 40 Semanas',
            },
            {
                code: 'CO-03',
                nameEs: 'Inferencia de Subtexto, Ironía y Registro Sociolingüístico',
                nameTarget: {
                    'en-US': 'Pragmatic Inference, Attitude &Implicit Meaning Decoding',
                    'fr-FR': 'Décodage de l’Implicite, du Registre (Familier/Soutenu) & du Ton',
                },
                cefrAlignment: 'B2 – C2 (Understanding Native Interlocutors)',
                cenniRange: 'CENNI 12 – 20',
                diagnosticMetric: 'Pragmatic Nuance Index',
                verificationTool: 'Diálogo con Próceres Históricos',
            },
        ],
    },
    {
        id: 'speaking',
        shortCode: 'PO',
        nameEs: 'Producción e Interacción Oral en Tiempo Real',
        nameTarget: {
            'en-US': 'Oral Production & Interactive Fluency (Speaking)',
            'fr-FR': 'Production & Interaction Orales en Temps Réel (PO)',
        },
        cefrCompanionMode: 'Interaction',
        benchmarkOrigin: 'The Anglo (CELTA STT) + Berlitz Method + DELF/DALF Entretien Dirigé',
        descriptionEs:
            'Fluidez espontánea, gestión de turnos de habla, negociación de significado, argumentación estructurada y defensa de posturas frente a un interlocutor vivo.',
        colorHex: '#059669',
        defaultMasteryByCefr: { 'Pre-A1': 76, A1: 80, 'A2+': 83, B1: 86, 'B1+': 87, B2: 90, C1: 93, C2: 96 },
        microSkills: [
            {
                code: 'PO-01',
                nameEs: 'Interacción Transaccional y Gestión de Turnos de Habla',
                nameTarget: {
                    'en-US': 'Transactional Turn-Taking & Conversational Repair',
                    'fr-FR': 'Interaction Transactionnelle & Prise de Parole Spontanée',
                },
                cefrAlignment: 'Pre-A1 – B1 (Conversation & Transactions)',
                cenniRange: 'CENNI 1 – 10',
                diagnosticMetric: 'Interactive Turn Completion Rate %',
                verificationTool: 'Conversational Avatar Studio',
            },
            {
                code: 'PO-02',
                nameEs: 'Monólogo Sostenido, Descripción y Narración Estructurada',
                nameTarget: {
                    'en-US': 'Sustained Monologue: Describing Experience & Narrative Flow',
                    'fr-FR': 'Monologue Suivi : Description, Récit & Exposé Structuré',
                },
                cefrAlignment: 'A2 – B2 (Sustained Monologue)',
                cenniRange: 'CENNI 5 – 14',
                diagnosticMetric: 'Uninterrupted Discourse Duration & Coherence',
                verificationTool: 'Karaoke Fonético & Evaluación Oral',
            },
            {
                code: 'PO-03',
                nameEs: 'Debate Académico, Hipótesis y Persuasión Retórica',
                nameTarget: {
                    'en-US': 'Formal Debate, Hypothetical Reasoning & Rhetorical Persuasion',
                    'fr-FR': 'Débat Argumenté, Défense d’un Point de Vue & Rhétorique (DALF)',
                },
                cefrAlignment: 'B2 – C2 (Formal Discussion & Argumentation)',
                cenniRange: 'CENNI 12 – 20',
                diagnosticMetric: 'Argumentative Complexity & Persuasion Score',
                verificationTool: 'Debate con Mentores Históricos 60 FPS',
            },
        ],
    },
    {
        id: 'reading',
        shortCode: 'CE',
        nameEs: 'Comprensión Lectora & Análisis Léxico-Sintáctico',
        nameTarget: {
            'en-US': 'Reading Comprehension & Lexico-Syntactic Analysis',
            'fr-FR': 'Compréhension des Écrits & Analyse Lexico-Syntaxique (CE)',
        },
        cefrCompanionMode: 'Reception',
        benchmarkOrigin: 'Cambridge Reading & Use of English + DELF/DALF Compréhension des Écrits',
        descriptionEs:
            'Decodificación analítica de textos auténticos, literatura histórica, artículos científicos y estructuras morfosintácticas en contexto.',
        colorHex: '#0891b2',
        defaultMasteryByCefr: { 'Pre-A1': 82, A1: 85, 'A2+': 87, B1: 89, 'B1+': 90, B2: 93, C1: 95, C2: 98 },
        microSkills: [
            {
                code: 'CE-01',
                nameEs: 'Reconocimiento de Patrones Morfosintácticos en Contexto',
                nameTarget: {
                    'en-US': 'Contextual Grammar Pattern Recognition (Use of English)',
                    'fr-FR': 'Reconnaissance des Structures Morphosyntaxiques en Contexte',
                },
                cefrAlignment: 'A1 – C2 (Grammatical Accuracy)',
                cenniRange: 'CENNI 2 – 20',
                diagnosticMetric: 'Inductive Syntax Mastery %',
                verificationTool: 'Ecosistema de 40 Semanas',
            },
            {
                code: 'CE-02',
                nameEs: 'Amplitud de Vocabulario Académico y Colocaciones Idiomáticas',
                nameTarget: {
                    'en-US': 'Academic Vocabulary Range, Phrasal Verbs & Collocations',
                    'fr-FR': 'Étendue Lexicale, Locutions Idiomatiques & Registre Académique',
                },
                cefrAlignment: 'Pre-A1 – C2 (Vocabulary Range & Control)',
                cenniRange: 'CENNI 1 – 20',
                diagnosticMetric: 'Active Lexical Inventory Count',
                verificationTool: 'Analítica Gráfica CEFR',
            },
        ],
    },
    {
        id: 'writing',
        shortCode: 'PE',
        nameEs: 'Producción Escrita Autónoma & Precisión Estructural',
        nameTarget: {
            'en-US': 'Autonomous Written Production & Structural Accuracy (Writing)',
            'fr-FR': 'Production Écrite Autonome & Rigueur Syntaxique (PE)',
        },
        cefrCompanionMode: 'Production',
        benchmarkOrigin: 'Cambridge Writing Assessment + DELF/DALF Production Écrite',
        descriptionEs:
            'Redacción coherente, cohesionada y ortográficamente precisa mediante andamiaje socrático (0% Ghostwriting), abarcando desde mensajes funcionales hasta ensayos críticos.',
        colorHex: '#d97706',
        defaultMasteryByCefr: { 'Pre-A1': 74, A1: 78, 'A2+': 81, B1: 84, 'B1+': 86, B2: 89, C1: 92, C2: 95 },
        microSkills: [
            {
                code: 'PE-01',
                nameEs: 'Control Ortográfico, Puntuación y Concordancia Gramatical',
                nameTarget: {
                    'en-US': 'Orthographic Control, Tense Consistency & Syntactic Agreement',
                    'fr-FR': 'Maîtrise Orthographique, Accords (Participe Passé) & Conjugaison',
                },
                cefrAlignment: 'A1 – C2 (Orthographic & Grammatical Control)',
                cenniRange: 'CENNI 2 – 20',
                diagnosticMetric: 'Error-Free Clause Ratio %',
                verificationTool: 'Writing Engine Autónomo',
            },
            {
                code: 'PE-02',
                nameEs: 'Arquitectura Textual, Cohesión y Conectores Discursivos',
                nameTarget: {
                    'en-US': 'Discourse Cohesion, Paragraphing & Logical Connectors',
                    'fr-FR': 'Cohérence Textuelle, Connecteurs Logiques & Articulation du Discours',
                },
                cefrAlignment: 'A2 – C2 (Coherence and Cohesion)',
                cenniRange: 'CENNI 5 – 20',
                diagnosticMetric: 'Cohesion & Discourse Marker Density',
                verificationTool: 'Writing Engine Autónomo',
            },
            {
                code: 'PE-03',
                nameEs: 'Ensayo Argumentativo, Reporte Científico y Registro Formal',
                nameTarget: {
                    'en-US': 'Academic Essay, Technical Report & Register Appropriacy',
                    'fr-FR': 'Essai Argumenté, Lettre Formelle & Registre Soutenu (DELF B2 / DALF)',
                },
                cefrAlignment: 'B1 – C2 (Reports and Essays)',
                cenniRange: 'CENNI 8 – 20',
                diagnosticMetric: 'Official Rubric Score (0–25 Scale)',
                verificationTool: 'Writing Engine Autónomo',
            },
        ],
    },
    {
        id: 'mediation',
        shortCode: 'MED',
        nameEs: 'Mediación Cognitiva, Intercultural & Pragmática',
        nameTarget: {
            'en-US': 'Cognitive, Intercultural & Pragmatic Mediation',
            'fr-FR': 'Médiation Cognitive, Interculturelle & Synthèse (MED)',
        },
        cefrCompanionMode: 'Mediation',
        benchmarkOrigin: 'CEFR Companion Volume 2020 + DALF Synthèse + NEM Interdisciplinaria',
        descriptionEs:
            'Capacidad superior para sintetizar fuentes complejas, explicar conceptos científicos o históricos en el idioma meta, facilitar acuerdos interculturales y adaptar el discurso al receptor.',
        colorHex: '#e11d48',
        defaultMasteryByCefr: { 'Pre-A1': 75, A1: 79, 'A2+': 82, B1: 85, 'B1+': 87, B2: 90, C1: 94, C2: 97 },
        microSkills: [
            {
                code: 'MED-01',
                nameEs: 'Síntesis y Reformulación de Textos o Diálogos Complejos',
                nameTarget: {
                    'en-US': 'Synthesizing, Paraphrasing & Mediating Complex Texts',
                    'fr-FR': 'Compte Rendu & Synthèse de Documents Multiples (DALF C1/C2)',
                },
                cefrAlignment: 'B1 – C2 (Mediating a Text)',
                cenniRange: 'CENNI 8 – 20',
                diagnosticMetric: 'Information Synthesis Fidelity %',
                verificationTool: 'Writing Engine & Taller de Diálogo',
            },
            {
                code: 'MED-02',
                nameEs: 'Mediación Conceptual e Histórica en Primera Persona',
                nameTarget: {
                    'en-US': 'Mediating Scientific, Literary & Historical Concepts (STEM/Humanities)',
                    'fr-FR': 'Médiation Conceptuelle, Littéraire, Historique & Scientifique',
                },
                cefrAlignment: 'A2 – C2 (Mediating Concepts)',
                cenniRange: 'CENNI 5 – 20',
                diagnosticMetric: 'Cross-Curricular Transfer Index',
                verificationTool: 'Avatares Históricos & Bóveda Curricular',
            },
        ],
    },
];

// ----------------------------------------------------------------------------
// 4. CONTINUOUS 40-WEEK / 8-MACRO-BLOCK PROGRESSION MATRIX (160 LESSONS)
// ----------------------------------------------------------------------------
export const CONTINUOUS_40_WEEK_BLUEPRINT: ContinuousUnitBlueprint[] = [
    {
        blockNumber: 1,
        weeksRange: 'Semanas 1 – 5',
        lessonsRange: 'Lecciones 1 – 20',
        blockTitle: {
            'en-US': 'Block I: Acoustic Awakening, Identity & Immediate Social Interaction',
            'fr-FR': 'Bloc I : Éveil Acoustique, Identité & Interaction Sociale Immédiate',
        },
        cefrSubBandProgression: 'Entrada -> Sub-banda .1 (Foundational Calibration)',
        dominantMethodologyFocus: 'Quick Learning Phonetic Calibration + Berlitz Direct Greeting',
        communicativeCanDoStatement: {
            'en-US': 'Can introduce oneself, calibrate core vowel/consonant formants, and sustain immediate social exchanges without L1 translation.',
            'fr-FR': 'Peut se présenter, calibrer les voyelles orales/nasales de base et soutenir des échanges sociaux immédiats sans traduction.',
        },
        phoneticTargetFocus: {
            'en-US': 'Short vs. Long Vowels (/ɪ/ vs /iː/), Bilabial Plosives & Sentence Stress',
            'fr-FR': 'Voyelles Orales Antérieures (/i/, /y/, /u/), Rythme Syllabique & Élision',
        },
        morphosyntacticTargetFocus: {
            'en-US': 'Present Simple, Subject Pronouns, Copula To Be & Interrogative Inversion',
            'fr-FR': 'Présent de l’Indicatif (Être/Avoir/Verbes en -er), Articles Définis & Toniques',
        },
        historicalMentorAssigned: {
            'en-US': 'Prof. Claire & Prof. Arthur (3D Neural Mentors)',
            'fr-FR': 'Prof. Claire & Prof. Arthur (Mentors Neuronaux 3D)',
        },
        tangibleDeliverable: {
            'en-US': 'Verified Acoustic Identity Profile + Interactive Self-Presentation Recording (85%+ Phonetic Match)',
            'fr-FR': 'Profil Acoustique Vérifié + Enregistrement de Présentation Interactive (85%+ Précision Phonétique)',
        },
    },
    {
        blockNumber: 2,
        weeksRange: 'Semanas 6 – 10',
        lessonsRange: 'Lecciones 21 – 40',
        blockTitle: {
            'en-US': 'Block II: Situational Transactions, Spatial Navigation & Daily Routines',
            'fr-FR': 'Bloc II : Transactions Situationnelles, Orientation Spatiale & Quotidien',
        },
        cefrSubBandProgression: 'Sub-banda .1 -> Sub-banda .2 (Functional Autonomy)',
        dominantMethodologyFocus: 'The Anglo Situational CLT + Berlitz Roleplay',
        communicativeCanDoStatement: {
            'en-US': 'Can resolve real-world transactions (cafés, transit, schedules) and describe habitual routines with natural connected speech.',
            'fr-FR': 'Peut résoudre des transactions réelles (café, transports, horaires) et décrire ses habitudes avec des liaisons naturelles.',
        },
        phoneticTargetFocus: {
            'en-US': 'Schwa (/ə/) Reduction in Unstressed Syllables & Interdental Fricatives (/θ/, /ð/)',
            'fr-FR': 'Voyelles Nasales (/ɑ̃/, /ɛ̃/, /ɔ̃/) & Liaison Obligatoire après Déterminants',
        },
        morphosyntacticTargetFocus: {
            'en-US': 'Frequency Adverbs, Quantifiers, Modal Can/Could & Prepositions of Time/Place',
            'fr-FR': 'Verbes Pronominaux, Articles Partitifs (du, de la), Impératif & Prépositions Spatiales',
        },
        historicalMentorAssigned: {
            'en-US': 'Prof. Claire (Cambridge Situational Coach)',
            'fr-FR': 'Prof. Claire (Coach Actionnel DELF)',
        },
        tangibleDeliverable: {
            'en-US': 'Situational Dialogue Mastery Badge + Autonomous Transactional Message in Writing Engine',
            'fr-FR': 'Badge de Dialogue Situationnel + Message Transactionnel Autonome dans le Writing Engine',
        },
    },
    {
        blockNumber: 3,
        weeksRange: 'Semanas 11 – 15',
        lessonsRange: 'Lecciones 41 – 60',
        blockTitle: {
            'en-US': 'Block III: Historical Narrative, Past Chronicles & Biographical Mediation',
            'fr-FR': 'Bloc III : Récit Historique, Chroniques du Passé & Médiation Biographique',
        },
        cefrSubBandProgression: 'Sub-banda .2 -> Evaluación Intermedia (Mid-Level Consolidation)',
        dominantMethodologyFocus: '1st-Person Historical Avatar Immersion + Cambridge Narrative Scaffolding',
        communicativeCanDoStatement: {
            'en-US': 'Can interview historical figures in the first person, narrate past events chronologically, and contrast historical perspectives.',
            'fr-FR': 'Peut interviewer des figures historiques à la première personne, raconter des événements passés et contraster des époques.',
        },
        phoneticTargetFocus: {
            'en-US': 'Allomorphs of Past Morpheme -ed (/t/, /d/, /ɪd/) & Narrative Intonation Arcs',
            'fr-FR': 'Opposition Phonétique Passé Composé (/e/) vs Imparfait (/ɛ/) & Consonne Uvulaire (/ʁ/)',
        },
        morphosyntacticTargetFocus: {
            'en-US': 'Past Simple vs. Past Continuous, Present Perfect & Temporal Discourse Markers',
            'fr-FR': 'Alternance Passé Composé / Imparfait, Accord du Participe Passé & Marqueurs Temporels',
        },
        historicalMentorAssigned: {
            'en-US': 'Abraham Lincoln & William Shakespeare (60 FPS 1st-Person Rigs)',
            'fr-FR': 'Jeanne d’Arc & Napoléon Bonaparte (Rigs 60 FPS à la 1re Personne)',
        },
        tangibleDeliverable: {
            'en-US': '1st-Person Historical Chronicle & Oral Interview Transcript Verified by Forensic Telemetry',
            'fr-FR': 'Chronique Historique & Entretien Oral Vérifiés par la Télémétrie Forensique',
        },
    },
    {
        blockNumber: 4,
        weeksRange: 'Semanas 16 – 20',
        lessonsRange: 'Lecciones 61 – 80',
        blockTitle: {
            'en-US': 'Block IV: Scientific Inquiry, Logical Cause-Effect & Mid-Course Benchmark',
            'fr-FR': 'Bloc IV : Enquête Scientifique, Relations Cause-Effet & Bilan Mi-Parcours',
        },
        cefrSubBandProgression: 'Mitad de Ciclo (Semana 20 — Certificación Intermedia de Sub-Nivel)',
        dominantMethodologyFocus: 'STEM Content-Based Immersion + Socratic Writing Mediation',
        communicativeCanDoStatement: {
            'en-US': 'Can explain scientific phenomena, formulate conditional hypotheses, and synthesize multi-source evidence.',
            'fr-FR': 'Peut expliquer des phénomènes scientifiques, formuler des hypothèses et synthétiser des preuves expérimentales.',
        },
        phoneticTargetFocus: {
            'en-US': 'Consonant Clusters (/str/, /spl/, /kts/) & Technical Polysyllabic Word Stress',
            'fr-FR': 'Enchaînement Consonantique Complexe, Semi-Voyelles (/ɥ/, /j/, /w/) & Prosodie Explicative',
        },
        morphosyntacticTargetFocus: {
            'en-US': 'Zero, First & Second Conditionals, Passive Voice & Relative Clauses',
            'fr-FR': 'Hypothèse (Si + Imparfait -> Conditionnel), Voix Passive & Pronoms Relatifs Composés',
        },
        historicalMentorAssigned: {
            'en-US': 'Ada Lovelace (Analytical Engine & STEM Pioneer — 60 FPS)',
            'fr-FR': 'Marie Curie (Double Prix Nobel de Physique et Chimie — 60 FPS)',
        },
        tangibleDeliverable: {
            'en-US': 'Mid-Course Cambridge/CENNI Diagnostic Simulation + Scientific Explanation Brief',
            'fr-FR': 'Simulation Diagnostique DELF/CENNI Mi-Parcours + Note de Synthèse Scientifique',
        },
    },
    {
        blockNumber: 5,
        weeksRange: 'Semanas 21 – 25',
        lessonsRange: 'Lecciones 81 – 100',
        blockTitle: {
            'en-US': 'Block V: Sociocultural Debate, Opinion Defense & Pragmatic Nuance',
            'fr-FR': 'Bloc V : Débat Socioculturel, Défense d’Opinion & Nuance Pragmatique',
        },
        cefrSubBandProgression: 'Sub-banda .2 -> Sub-banda .3 (Argumentative Expansion)',
        dominantMethodologyFocus: 'Alliance Française Perspective Actionnelle + The Anglo Debate Studio',
        communicativeCanDoStatement: {
            'en-US': 'Can defend a position on ethical or social dilemmas, concede counter-arguments politely, and modulate register.',
            'fr-FR': 'Peut défendre une prise de position sur un sujet de société, nuancer ses propos et exprimer le doute ou la nécessité.',
        },
        phoneticTargetFocus: {
            'en-US': 'Contrastive Stress for Emphasis, Pitch Fall-Rise for Polite Disagreement',
            'fr-FR': 'Accent d’Insistance Oratoire, Liaison Facultative Soutenue & Pause Rhétorique',
        },
        morphosyntacticTargetFocus: {
            'en-US': 'Modals of Deduction/Speculation, Concessive Clauses (Although, Despite, Whereas)',
            'fr-FR': 'Subjonctif Présent et Passé, Connecteurs de Concession (Bien que, Quoique, Or)',
        },
        historicalMentorAssigned: {
            'en-US': 'Abraham Lincoln (Rhetoric & Civic Ethics — 60 FPS)',
            'fr-FR': 'Victor Hugo (Éloquence Romantique & Justice Sociale — 60 FPS)',
        },
        tangibleDeliverable: {
            'en-US': 'Recorded Oral Debate Defense + Socratic Opinion Essay (0% Ghostwriting)',
            'fr-FR': 'Plaidoyer Oral Enregistré + Essai Argumenté Socratique (Grille DELF/DALF)',
        },
    },
    {
        blockNumber: 6,
        weeksRange: 'Semanas 26 – 30',
        lessonsRange: 'Lecciones 101 – 120',
        blockTitle: {
            'en-US': 'Block VI: Literary & Rhetorical Mastery, Idiomatic Fluency & Critical Analysis',
            'fr-FR': 'Bloc VI : Maîtrise Littéraire & Rhétorique, Idiomatisme & Analyse Critique',
        },
        cefrSubBandProgression: 'Sub-banda .3 (High-Proficiency Consolidation)',
        dominantMethodologyFocus: 'Cambridge Use of English Mastery + Literary 1st-Person Immersion',
        communicativeCanDoStatement: {
            'en-US': 'Can interpret metaphorical and literary discourse, deploy idiomatic collocations naturally, and critique complex texts.',
            'fr-FR': 'Peut interpréter un discours littéraire ou philosophique, manier les expressions idiomatiques et produire un commentaire composé.',
        },
        phoneticTargetFocus: {
            'en-US': 'Rhetorical Pacing, Elision in Rapid Native Speech & Emotional Prosody',
            'fr-FR': 'Prosodie Poétique et Oratoire, E Caduc Stylistique & Diction Classique',
        },
        morphosyntacticTargetFocus: {
            'en-US': 'Stylistic Inversion (Never have I..., Not only...), Cleft Sentences & Participle Clauses',
            'fr-FR': 'Concordance des Temps Complexe, Gérondif/Participe Présent & Mise en Relief',
        },
        historicalMentorAssigned: {
            'en-US': 'William Shakespeare (Dramatic Prosody & Lexical Invention — 60 FPS)',
            'fr-FR': 'Victor Hugo (Maître des Misérables et de Notre-Dame de Paris — 60 FPS)',
        },
        tangibleDeliverable: {
            'en-US': 'Critical Literary & Rhetorical Commentary + High-Precision Prosodic Recital',
            'fr-FR': 'Compte Rendu Critique & Récital Prosodique à Haute Précision Acoustique',
        },
    },
    {
        blockNumber: 7,
        weeksRange: 'Semanas 31 – 35',
        lessonsRange: 'Lecciones 121 – 140',
        blockTitle: {
            'en-US': 'Block VII: Professional, Diplomatic & Executive Mediation Projects',
            'fr-FR': 'Bloc VII : Projets de Médiation Professionnelle, Diplomatique & Exécutive',
        },
        cefrSubBandProgression: 'Pre-Certificación Oficial (Official Exam Readiness)',
        dominantMethodologyFocus: 'CEFR Companion Volume Mediation + Action-Oriented Capstone',
        communicativeCanDoStatement: {
            'en-US': 'Can mediate between conflicting viewpoints, draft formal executive reports, and lead cross-cultural briefings.',
            'fr-FR': 'Peut assurer une médiation interculturelle, rédiger une synthèse de dossier complexe et diriger une réunion formelle.',
        },
        phoneticTargetFocus: {
            'en-US': 'International Intelligibility Calibration across Global Accents (UK/US/International)',
            'fr-FR': 'Intelligibilité Internationale Francophone & Maîtrise du Registre Diplomatique',
        },
        morphosyntacticTargetFocus: {
            'en-US': 'Nominalization, Hedging Devices, Reported Speech & Advanced Discourse Architecture',
            'fr-FR': 'Nominalisation Académique, Discours Indirect Libre & Articulation Logique DALF',
        },
        historicalMentorAssigned: {
            'en-US': 'Prof. Arthur, Ada Lovelace & Abraham Lincoln (Executive Panel)',
            'fr-FR': 'Prof. Arthur, Marie Curie & Victor Hugo (Jury Académique Francophone)',
        },
        tangibleDeliverable: {
            'en-US': 'Cross-Disciplinary Mediation Dossier + Executive Oral Briefing',
            'fr-FR': 'Dossier de Synthèse de Documents + Exposé Oral devant Jury Virtuel',
        },
    },
    {
        blockNumber: 8,
        weeksRange: 'Semanas 36 – 40',
        lessonsRange: 'Lecciones 141 – 160',
        blockTitle: {
            'en-US': 'Block VIII: Full International Certification Simulation (Cambridge / DELF-DALF / CENNI)',
            'fr-FR': 'Bloc VIII : Simulation Intégrale de Certification (DELF-DALF / Cambridge / CENNI)',
        },
        cefrSubBandProgression: 'Acreditación de Nivel CEFR & Promoción al Siguiente Grado',
        dominantMethodologyFocus: 'Full 4-Mode Exam Simulation + Forensic BKT Certification',
        communicativeCanDoStatement: {
            'en-US': 'Demonstrates verified mastery across all 6 Macro-Skills and 36 Micro-Competencies under official international exam conditions.',
            'fr-FR': 'Démontre une maîtrise vérifiée des 6 Macro-Compétences et 36 Micro-Compétences dans les conditions officielles d’examen.',
        },
        phoneticTargetFocus: {
            'en-US': 'Full Phonological Control Audit (>90% Target Formant & Prosody Precision)',
            'fr-FR': 'Audit Intégral du Contrôle Phonologique (>90% Précision Formantique & Prosodique)',
        },
        morphosyntacticTargetFocus: {
            'en-US': 'Comprehensive Morphosyntactic & Pragmatic Integration across All Level Structures',
            'fr-FR': 'Intégration Morphosyntaxique, Lexicale et Pragmatique Complète du Niveau',
        },
        historicalMentorAssigned: {
            'en-US': 'Full Council of Mentors (Prof. Claire, Prof. Arthur, Shakespeare, Lovelace, Lincoln)',
            'fr-FR': 'Haut Conseil des Mentors (Prof. Claire, Victor Hugo, Jeanne d’Arc, Marie Curie, Napoléon)',
        },
        tangibleDeliverable: {
            'en-US': 'Official ISkool CEFR/CENNI Digital Certificate + Longitudinal Portfolio in Curricular Vault',
            'fr-FR': 'Certificat Numérique Officiel ISkool CECR/CENNI + Portfolio Longitudinal dans la Voûte Curriculaire',
        },
    },
];

// ----------------------------------------------------------------------------
// 5. LANGUAGE-SPECIFIC THEORETICAL & ACCREDITATION FRAMEWORKS
// ----------------------------------------------------------------------------
export const LANGUAGE_PROGRAM_ARCHITECTURES = {
    'en-US': {
        programTitle: 'ISkool Global English Program (ESL / EFL — Neuro-Communicative CEFR Edition)',
        officialStandards: [
            'Common European Framework of Reference for Languages (CEFR Companion Volume — Pre-A1 to C2)',
            'Cambridge English Qualifications Alignment (Starters, Movers, Flyers, A2 Key, B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency)',
            'SEP CENNI México (Certificación Nacional de Nivel de Idioma — Niveles 1 al 20)',
            'Síntesis Metodológica: Cambridge One + The Anglo (CELTA/DELTA CLT) + Berlitz Direct Immersion + Quick Learning Phonetic DSP',
        ],
        theoreticalPillars: [
            {
                title: '1. Hipótesis de Codificación Fonético-Articulatoria a 60 FPS (Quick Learning + Nano Banana 2.1)',
                description:
                    'El cerebro hispanohablante tiende a filtrar los 12 fonemas vocálicos del inglés a través de las 5 vocales del español. Al sincronizar el motor mandibular/labial a 60 FPS con el evaluador de espectrograma DSP, el estudiante acopla percepción visual (efecto McGurk positivo) y producción neuromuscular antes de sufrir interferencia ortográfica.',
            },
            {
                title: '2. Inmersión Directa en Primera Persona sin Traducción Pasiva (Berlitz + The Anglo CLT)',
                description:
                    'Toda sesión oral ocurre al 100% en inglés frente a mentores tridimensionales (Prof. Claire, Prof. Arthur) y personajes históricos vivos (William Shakespeare, Ada Lovelace, Abraham Lincoln) que dialogan estrictamente en primera persona, maximizando el Student Talking Time (STT > 80%).',
            },
            {
                title: '3. Mediación Escrita Socrática 0% Ghostwriting (Cambridge Assessment Standards)',
                description:
                    'El Writing Engine Autónomo evalúa bajo los 4 criterios oficiales de Cambridge (Content, Communicative Achievement, Organisation, Language) mediante preguntas socráticas que obligan al estudiante a reparar sus propias cláusulas.',
            },
        ],
    },
    'fr-FR': {
        programTitle: 'Programme Global de Français ISkool (FLE — Approche Actionnelle & Neuro-Phonétique CECR)',
        officialStandards: [
            'Cadre Européen Commun de Référence pour les Langues (CECR Volume Complémentaire — Pré-A1 à C2)',
            'France Éducation International & Alliance Française (DELF Prim, DELF Junior/Scolaire A1–B2, DALF C1–C2)',
            'SEP CENNI Mexique (Certification Nationale de Niveau de Langue — Niveaux 1 à 20)',
            'Synthèse Méthodologique : Perspective Actionnelle (FEI) + Immersion Directe Berlitz + Calibration Phonétique Uvulaire/Nasale 60 FPS',
        ],
        theoreticalPillars: [
            {
                title: '1. Calibration Neuro-Acoustique des Voyelles Nasales, de la Liaison et du /ʁ/ Uvulaire à 60 FPS',
                description:
                    'Le français présente une distance phonético-orthographique élevée (lettres muettes, élisions, liaisons obligatoires et 4 voyelles nasales). Le moteur Nano Banana 2.1 modélise à 60 FPS l’arrondissement labial (/y/ vs /u/ vs /ø/) et l’ouverture mandibulaire nasale en temps réel.',
            },
            {
                title: '2. Perspective Actionnelle & Dialogue Historique à la 1re Personne (Alliance Française + Berlitz)',
                description:
                    'L’apprenant agit comme un acteur social accomplissant des missions authentiques avec Victor Hugo, Jeanne d’Arc, Marie Curie, Napoléon Bonaparte et Prof. Claire, qui s’expriment exclusivement à la première personne avec une rigueur historique absolue.',
            },
            {
                title: '3. Médiation Écrite Cartésienne : Compte Rendu, Synthèse et Essai Argumenté (0% Ghostwriting)',
                description:
                    'Le Writing Engine forme l’étudiant à la méthodologie intellectuelle française (thèse-antithèse-synthèse, connecteurs logiques, maîtrise du subjonctif et accord du participe passé) selon les grilles officielles du DELF et du DALF.',
            },
        ],
    },
};

