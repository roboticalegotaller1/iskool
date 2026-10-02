/**
 * @module WritingEngineTypes
 * @description Tipos canónicos del Motor Autónomo de Evaluación y Tutoría de Escritura
 * de iSkool para centros de idiomas (Cambridge Pre-A1 a C2 y DELF-DALF Pre-A1 a C2).
 */

export type WritingLanguage = 'en' | 'fr';

export type ExamFramework = 'cambridge' | 'delf_dalf';

export type LanguageLevel = 'Pre-A1' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type ErrorDiagnosisType = 'gramatica' | 'lexico' | 'coherencia' | 'registro' | 'transferencia_L1';

export type LengthStatus = 'deficiente' | 'optimo' | 'excedido';

export type AcademicDensity = 'baja' | 'media' | 'alta';

export type TrafficLightStatus = 'verde' | 'ambar' | 'rojo';

// ============================================================================
// ESPECIFICACIONES DE EXAMEN POR NIVEL
// ============================================================================

export interface LevelExamSpec {
  framework: ExamFramework;
  language: WritingLanguage;
  level: LanguageLevel;
  examName: string;
  minWords: number;
  maxWords: number;
  taskTypes: string[];
  description: string;
  keyFoci: string[];
}

export const LEVEL_EXAM_SPECS: Record<`${WritingLanguage}-${LanguageLevel}`, LevelExamSpec> = {
  // --- INGLÉS (CAMBRIDGE ASSESSMENT) ---
  'en-Pre-A1': {
    framework: 'cambridge',
    language: 'en',
    level: 'Pre-A1',
    examName: 'Young Learners: Pre A1 Starters',
    minWords: 1,
    maxWords: 25,
    taskTypes: ['Identificación de Objetos', 'Completar Palabras', 'Oración Guiada'],
    description: 'Sustantivos concretos, colores, presente simple "be" y "have got", deletreo asistido.',
    keyFoci: ['Spelling básico', 'Uso de a/an', 'Colores y animales']
  },
  'en-A1': {
    framework: 'cambridge',
    language: 'en',
    level: 'A1',
    examName: 'Young Learners: A1 Movers',
    minWords: 25,
    maxWords: 40,
    taskTypes: ['Descripción guiada de imagen', 'Narración de 3 viñetas'],
    description: 'Oraciones simples enlazadas por conectores elementales (and, but, because).',
    keyFoci: ['Conectores and/but/because', 'Verbos en presente continuo y pasado simple regular']
  },
  'en-A2': {
    framework: 'cambridge',
    language: 'en',
    level: 'A2',
    examName: 'A2 Key (KET) / A2 Flyers',
    minWords: 35,
    maxWords: 50,
    taskTypes: ['Nota corta', 'Email informativo breve', 'Narración secuencial de 3 imágenes'],
    description: 'Notas cotidianas e intercambios de información práctica en pasado y presente.',
    keyFoci: ['Pasado simple irregular', 'Preposiciones de tiempo y lugar', 'Fórmulas de cortesía de email']
  },
  'en-B1': {
    framework: 'cambridge',
    language: 'en',
    level: 'B1',
    examName: 'B1 Preliminary (PET)',
    minWords: 100,
    maxWords: 120,
    taskTypes: ['Email informal a amigo', 'Artículo para revista juvenil', 'Historia con frase detonante'],
    description: 'Respuesta completa cubriendo los 4 puntos detonantes con variedad léxica y coherencia.',
    keyFoci: ['Conectores de causa y contraste (however, although, so)', 'Primer y segundo condicional', 'Registro informal consistente']
  },
  'en-B2': {
    framework: 'cambridge',
    language: 'en',
    level: 'B2',
    examName: 'B2 First (FCE)',
    minWords: 140,
    maxWords: 190,
    taskTypes: ['Parte 1: Ensayo discursivo obligatorio (3 puntos)', 'Parte 2: Artículo', 'Parte 2: Reporte', 'Parte 2: Reseña', 'Parte 2: Carta/Email formal'],
    description: 'Ensayo formal con 2 puntos obligatorios + 1 idea propia, estructuración en párrafos y registro formal.',
    keyFoci: ['Conectores discursivos (furthermore, on the other hand, in conclusion)', 'Voz pasiva', 'Léxico B2 variado', 'Estructura tripartita']
  },
  'en-C1': {
    framework: 'cambridge',
    language: 'en',
    level: 'C1',
    examName: 'C1 Advanced (CAE)',
    minWords: 220,
    maxWords: 260,
    taskTypes: ['Parte 1: Ensayo discursivo crítico (2 opiniones contrapuestas)', 'Parte 2: Propuesta formal (Proposal)', 'Parte 2: Reporte analítico', 'Parte 2: Reseña académica'],
    description: 'Evaluación sopesada de dos perspectivas antagónicas con balance analítico y registro avanzado.',
    keyFoci: ['Inversión sintáctica', 'Subjuntivo o modales de deducción pasada', 'Léxico collocations sofisticado', 'Concesión y contraargumentación']
  },
  'en-C2': {
    framework: 'cambridge',
    language: 'en',
    level: 'C2',
    examName: 'C2 Proficiency (CPE)',
    minWords: 240,
    maxWords: 300,
    taskTypes: ['Parte 1: Síntesis crítica de 2 textos discrepantes', 'Parte 2: Artículo de fondo', 'Parte 2: Ensayo discursivo erudito', 'Parte 2: Reporte ejecutivo'],
    description: 'Síntesis, reformulación y evaluación crítica de dos textos complementarios con precisión académica.',
    keyFoci: ['Reformulación sin plagio', 'Precisión estilística y tono persuasivo/académico', 'Matices y hedging discursivo']
  },

  // --- FRANCÉS (DELF-DALF / FEI) ---
  'fr-Pre-A1': {
    framework: 'delf_dalf',
    language: 'fr',
    level: 'Pre-A1',
    examName: 'DELF Prim A1.1',
    minWords: 15,
    maxWords: 30,
    taskTypes: ['Fiche d\'identité', 'Message de salutation', 'Carte de remerciement'],
    description: 'Ficha de datos personales y mensajes básicos de cortesía cotidiana.',
    keyFoci: ['Articles définis/indéfinis', 'Présent des verbes être/avoir', 'Orthographe des nombres et jours']
  },
  'fr-A1': {
    framework: 'delf_dalf',
    language: 'fr',
    level: 'A1',
    examName: 'DELF Prim / Junior A1',
    minWords: 40,
    maxWords: 50,
    taskTypes: ['Formulaire officiel', 'Carte postale de vacances', 'Invitation simple'],
    description: 'Redacción de postales y mensajes sociales de invitación o felicitación.',
    keyFoci: ['Passé composé élémentaire', 'Adjectifs qualificatifs et accord de base', 'Connecteurs et/mais/parce que']
  },
  'fr-A2': {
    framework: 'delf_dalf',
    language: 'fr',
    level: 'A2',
    examName: 'DELF Junior / Tout Public A2',
    minWords: 60,
    maxWords: 80,
    taskTypes: ['Tâche 1: Narration d\'un événement personnel', 'Tâche 2: Réponse à une invitation et demande d\'informations'],
    description: 'Relato de recuerdos personales y respuestas sociales solicitando detalles.',
    keyFoci: ['Alternance imparfait / passé composé', 'Formules de politesse amicales', 'Pronoms COD basiques (le, la, les)']
  },
  'fr-B1': {
    framework: 'delf_dalf',
    language: 'fr',
    level: 'B1',
    examName: 'DELF B1',
    minWords: 160,
    maxWords: 180,
    taskTypes: ['Lettre formelle de réclamation', 'Essai / Contribution à un forum d\'opinion'],
    description: 'Manifestación de opinión personal argumentada con ejemplos cotidianos concretos.',
    keyFoci: ['Connecteurs de cause/conséquence (puisque, donc, c\'est pourquoi)', 'Subjonctif présent dans l\'expression du doute/souhait', 'Accord du participe passé']
  },
  'fr-B2': {
    framework: 'delf_dalf',
    language: 'fr',
    level: 'B2',
    examName: 'DELF B2',
    minWords: 250,
    maxWords: 320,
    taskTypes: ['Lettre argumentative au maire / directeur', 'Article de débat citoyen'],
    description: 'Carta argumentativa formal con concessions (certes, bien que), refutations y propuestas viables.',
    keyFoci: ['Concession et opposition (bien que + subj, malgré, toutefois)', 'Formules protocolaires de lettre formelle', 'Vocabulaire civique et sociétal']
  },
  'fr-C1': {
    framework: 'delf_dalf',
    language: 'fr',
    level: 'C1',
    examName: 'DALF C1',
    minWords: 450,
    maxWords: 520,
    taskTypes: ['Synthèse de deux documents (220 mots neutres)', 'Essai argumenté (250 mots prise de position)'],
    description: 'Síntesis neutral y condensada de dos textos sin opinión personal, seguida de un ensayo argumentado.',
    keyFoci: ['Neutralité absolue dans la synthèse', 'Plan dialectique ou thématique rigoureux', 'Nominalisation et syntaxe complexe']
  },
  'fr-C2': {
    framework: 'delf_dalf',
    language: 'fr',
    level: 'C2',
    examName: 'DALF C2',
    minWords: 700,
    maxWords: 900,
    taskTypes: ['Dossier thématique: Rapport structuré', 'Éditorial polémique', 'Article de fond'],
    description: 'Producción de un informe estructurado o editorial con retórica persuasiva y dominio estilístico.',
    keyFoci: ['Rhétorique avancée et figures de style', 'Clarté argumentative sans redondance', 'Lexique de spécialité soutenu']
  }
};

// ============================================================================
// CONTRATOS DE COMANDOS DEL MOTOR
// ============================================================================

export interface TaskPrompt {
  id: string; // ISK-[LANG]-[LVL]-[UUID]
  idioma: WritingLanguage;
  nivel: LanguageLevel;
  framework: ExamFramework;
  examName: string;
  titulo: string;
  contexto: string;
  consignaOficial: string;
  limitePalabras: {
    min: number;
    max: number;
  };
  puntosClaveObligatorios: string[];
  checklistPrevio: string[];
  criteriosEvaluacion: string[];
  createdAt: string;
}

export interface DiagnosticItem {
  segmento: string;
  tipo: ErrorDiagnosisType;
  pista_nivel_1: string; // Pregunta socrática sutil
  pista_nivel_2: string; // Explicación de la regla o falso amigo con L1 español
  pista_nivel_3_modelo: string; // Ejemplo análogo similar sin resolver su texto
  lineaAproximada?: number;
}

export interface RealTimeMetrics {
  diversidad_lexica_ttr: number; // 0.0 - 1.0 (Type-Token Ratio)
  conectores_nivel_esperado: string[];
  densidad_academica: AcademicDensity;
  promedio_palabras_por_oracion: number;
}

export interface DraftAnalysisOutput {
  conteo_palabras: number;
  rango_esperado: string;
  estado_longitud: LengthStatus;
  diagnosticos_detectados: DiagnosticItem[];
  metricas_tiempo_real: RealTimeMetrics;
  progreso_porcentaje: number;
}

// ============================================================================
// EVALUACIÓN ANALÍTICA FINAL
// ============================================================================

export interface CambridgeRubricCriteria {
  content: number; // 0 - 5
  communicativeAchievement: number; // 0 - 5
  organisation: number; // 0 - 5
  language: number; // 0 - 5
  totalRaw: number; // 0 - 20
  percentageScore: number; // 0 - 100%
  cefrStatement: string;
}

export interface DelfRubricCriteria {
  priseDePositionOuRespect: number; // ej. 0 - 6
  coherenceEtCohesion: number; // ej. 0 - 6
  competenceLexicale: number; // ej. 0 - 6
  competenceMorphosyntaxique: number; // ej. 0 - 7
  totalSur25: number; // 0 - 25
  percentageScore: number; // 0 - 100%
  mention: 'Non admis' | 'Admis' | 'Assez Bien' | 'Bien' | 'Très Bien';
}

export interface QualitativeBreakdown {
  aciertosNotables: Array<{
    cita: string;
    explicacion: string;
  }>;
  erroresCriticos: Array<{
    segmento: string;
    correccionSugerida: string;
    justificacionLinguistica: string;
  }>;
  diagnosticoInterferenciaL1: {
    detectada: boolean;
    casos: Array<{
      expresionUsada: string;
      origenEspañol: string;
      equivalenteNatural: string;
    }>;
  };
}

export interface NextSessionActionPlan {
  objetivosMicroLinguisticos: [string, string];
  recursoRecomendado: string;
  ejercicioSugerido: string;
}

export interface FinalEvaluationOutput {
  id: string;
  taskId: string;
  idioma: WritingLanguage;
  nivel: LanguageLevel;
  studentId?: string;
  studentName?: string;
  rubricaCambridge?: CambridgeRubricCriteria;
  rubricaDelf?: DelfRubricCriteria;
  calificacionGlobal: number; // Normalizada 0 - 100%
  desgloseCualitativo: QualitativeBreakdown;
  planAccionSiguienteSesion: NextSessionActionPlan;
  xpGanados: number;
  evaluatedAt: string;
}

// ============================================================================
// DASHBOARD DOCENTE (APPLE CLEAN UX)
// ============================================================================

export interface TeacherStudentSummary {
  studentId: string;
  studentName: string;
  nivel: LanguageLevel;
  idioma: WritingLanguage;
  calificacion: number;
  semaforo: TrafficLightStatus;
  palabras: number;
  rangoCumplido: boolean;
  errorPrincipal: string;
  interferenciaL1: boolean;
  evaluatedAt: string;
}

export interface RecurringErrorPattern {
  patron: string;
  categoria: ErrorDiagnosisType;
  frecuencia: number;
  afectaPorcentaje: number;
  ejemploTipico: string;
  remedioDidactico: string;
}

export interface TeacherCohortDashboardOutput {
  grupo: string;
  totalEstudiantes: number;
  promedioGlobal: number;
  resumenEjecutivo3Lineas: [string, string, string];
  semaforoCohorte: {
    verdeAutonomosCount: number;
    verdeAutonomosPorcentaje: number;
    ambarRiesgoL1Count: number;
    ambarRiesgoL1Porcentaje: number;
    rojoBloqueoCount: number;
    rojoBloqueoPorcentaje: number;
  };
  top3PatronesError: [RecurringErrorPattern, RecurringErrorPattern, RecurringErrorPattern];
  recomendacionIntervencionPedagogicaClaseViva: {
    focoPrincipal: string;
    actividadActivacion10Min: string;
    materialGuia: string;
  };
  estudiantes: TeacherStudentSummary[];
  generatedAt: string;
}
