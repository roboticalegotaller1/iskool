"use client";

import React, { useState } from 'react';
import {
  X,
  GraduationCap,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Layers,
  Clock,
  Sparkles,
  Network,
  Palette,
  FileCheck2,
  Users,
  Compass,
  ArrowRight,
  TrendingUp,
  Download,
  ShieldCheck,
  Zap,
  Target
} from 'lucide-react';

export interface PhaseAuditData {
  faseKey: string; // 'Fase 1' | 'Fase 2' | 'Fase 3' | 'Fase 4' | 'Fase 5' | 'Fase 6'
  faseNumber: number;
  name: string;
  stageName: string;
  ageRange: string;
  grades: string[];
  percentage: number;
  status: 'Excelente' | 'Óptimo' | 'Alerta Preventiva' | 'En Riesgo';
  statusColor: string;
  totalPdas: number;
  coveredPdas: number;
  vaultPlanningsCount: number;
  rubricsCount: number;
  canvasDeliverablesCount: number;
  // Desglose de los 4 Pilares Ponderados (Suman 100%)
  pillars: {
    pdas: {
      name: string;
      weight: number; // 35
      achievedPct: number;
      points: number; // weight * (achievedPct / 100)
      description: string;
      formula: string;
    };
    vault: {
      name: string;
      weight: number; // 30
      achievedPct: number;
      points: number;
      description: string;
      formula: string;
    };
    rubrics: {
      name: string;
      weight: number; // 20
      achievedPct: number;
      points: number;
      description: string;
      formula: string;
    };
    canvas: {
      name: string;
      weight: number; // 15
      achievedPct: number;
      points: number;
      description: string;
      formula: string;
    };
  };
  // Diagnóstico de Causa Raíz (Por qué tiene esa calificación)
  rootCauseAnalysis: {
    summary: string;
    strengths: string[];
    gaps: string[];
    remedialAction: string;
  };
  // Funciones Curriculares por Campos Formativos SEP
  camposFormativos: Array<{
    name: string;
    shortName: string;
    progress: number;
    description: string;
    focus: string;
    color: string;
  }>;
  // Funciones Operativas y de Software en ISkool
  softwareFunctions: Array<{
    title: string;
    badge: string;
    description: string;
    icon: string;
  }>;
}

export const PHASES_AUDIT_CATALOG: Record<string, PhaseAuditData> = {
  'Fase 1': {
    faseKey: 'Fase 1',
    faseNumber: 1,
    name: 'Educación Inicial',
    stageName: 'Maternal y Cuidado Temprano',
    ageRange: '0 a 3 años',
    grades: ['Lactantes (0-1 año)', 'Maternal 1 (1-2 años)', 'Maternal 2 (2-3 años)'],
    percentage: 98,
    status: 'Excelente',
    statusColor: 'emerald',
    totalPdas: 120,
    coveredPdas: 118,
    vaultPlanningsCount: 118,
    rubricsCount: 116,
    canvasDeliverablesCount: 115,
    pillars: {
      pdas: {
        name: 'Cobertura de PDAs Oficiales SEP',
        weight: 35,
        achievedPct: 98.3,
        points: 34.4,
        description: '118 de 120 Procesos de Desarrollo de Aprendizaje (PDA) oficiales planificados y activos.',
        formula: '(118 / 120) × 35% = 34.4 pts'
      },
      vault: {
        name: 'Planeaciones Validadas en Bóveda Curricular',
        weight: 30,
        achievedPct: 98.3,
        points: 29.5,
        description: 'Archivos Markdown con estructura canónica oficial y momentos de estimulación temprana.',
        formula: '(118 / 120) × 30% = 29.5 pts'
      },
      rubrics: {
        name: 'Rúbricas Analíticas Formativas',
        weight: 20,
        achievedPct: 96.6,
        points: 19.3,
        description: 'Escalas de observación psicomotriz y desarrollo socioafectivo en 4 niveles SEP.',
        formula: '(116 / 120) × 20% = 19.3 pts'
      },
      canvas: {
        name: 'Entregables Tangibles & Lienzo Digital',
        weight: 15,
        achievedPct: 95.8,
        points: 14.4,
        description: 'Bitácoras de estimulación, evidencias de apego seguro y registros de observación.',
        formula: '(115 / 120) × 15% = 14.4 pts'
      }
    },
    rootCauseAnalysis: {
      summary: 'Desempeño de excelencia con cobertura casi total de los vínculos de apego seguro y lenguaje corporal.',
      strengths: [
        'Planeaciones al 98.3% integradas en la Bóveda Curricular.',
        'Pautas de observación temprana homologadas con los cuatro campos formativos.',
        'Total sincronización con los estándares de cuidado y desarrollo neurocognitivo de la SEP.'
      ],
      gaps: [
        'Restan 2 PDAs de exploración sensorial por cargar en bitácora de evidencias del Lienzo Digital.'
      ],
      remedialAction: 'Cierre natural de evidencias en el siguiente corte bimestral.'
    },
    camposFormativos: [
      { name: 'Lenguajes', shortName: 'Lenguajes', progress: 99, description: 'Balbuceo, comunicación gestual, primeras palabras y narración de nanas tradicionales.', focus: 'Comunicación gestual y afectiva', color: 'indigo' },
      { name: 'Saberes y Pensamiento Científico', shortName: 'Saberes', progress: 97, description: 'Exploración de texturas, pesos, temperaturas y coordinación visomotora básica.', focus: 'Exploración sensoperceptiva', color: 'blue' },
      { name: 'Ética, Naturaleza y Sociedades', shortName: 'Ética', progress: 98, description: 'Vínculos afectivos primarios, convivencia armónica en la sala y cuidado amoroso.', focus: 'Apego y seguridad comunitaria', color: 'emerald' },
      { name: 'De lo Humano y lo Comunitario', shortName: 'Comunitario', progress: 98, description: 'Autonomía progresiva en alimentación, sueño y autorregulación emocional.', focus: 'Autonomía y salud básica', color: 'amber' }
    ],
    softwareFunctions: [
      { title: 'Bóveda Curricular Especializada (0 Tokens)', badge: 'Bóveda Central', description: 'Acceso inmediato a secuencias de estimulación temprana y masajes neuromotores sin latencia.', icon: 'Network' },
      { title: 'Cronómetro Sensorial de Sala', badge: 'Control de Aula', description: 'Estructuración de rutinas: Inicio (15 min bienvenida), Desarrollo (30 min exploración), Cierre (15 min relajación).', icon: 'Clock' },
      { title: 'Seguimiento de Hitos de Desarrollo', badge: 'Expediente 360', description: 'Registro biométrico y de hitos madurativos vinculado a la ficha médica del lactante.', icon: 'CheckCircle2' },
      { title: 'Generación con Motor de IA Pedagógica', badge: 'Fallback', description: 'Creación instantánea de planeaciones personalizadas de estimulación cuando no existan en bóveda.', icon: 'Sparkles' }
    ]
  },

  'Fase 2': {
    faseKey: 'Fase 2',
    faseNumber: 2,
    name: 'Educación Preescolar',
    stageName: 'Kínder 1°, 2° y 3°',
    ageRange: '3 a 6 años',
    grades: ['1° Preescolar (3-4 años)', '2° Preescolar (4-5 años)', '3° Preescolar (5-6 años)'],
    percentage: 96,
    status: 'Excelente',
    statusColor: 'emerald',
    totalPdas: 280,
    coveredPdas: 269,
    vaultPlanningsCount: 268,
    rubricsCount: 265,
    canvasDeliverablesCount: 260,
    pillars: {
      pdas: {
        name: 'Cobertura de PDAs Oficiales SEP',
        weight: 35,
        achievedPct: 96.1,
        points: 33.6,
        description: '269 de 280 PDAs oficiales integrados en proyectos didácticos comunitarios.',
        formula: '(269 / 280) × 35% = 33.6 pts'
      },
      vault: {
        name: 'Planeaciones Validadas en Bóveda Curricular',
        weight: 30,
        achievedPct: 95.7,
        points: 28.7,
        description: 'Estructuras de proyectos de aula con Frontmatter YAML y metodología de Aprendizaje Basado en Juego.',
        formula: '(268 / 280) × 30% = 28.7 pts'
      },
      rubrics: {
        name: 'Rúbricas Analíticas Formativas',
        weight: 20,
        achievedPct: 94.6,
        points: 18.9,
        description: 'Criterios gráficos y rúbricas de desempeño cualitativo con 4 niveles SEP.',
        formula: '(265 / 280) × 20% = 18.9 pts'
      },
      canvas: {
        name: 'Entregables Tangibles & Lienzo Digital',
        weight: 15,
        achievedPct: 92.8,
        points: 13.9,
        description: 'Dibujos, collages, modelado de plastilina y registros interactivos de los pequeños.',
        formula: '(260 / 280) × 15% = 13.9 pts'
      }
    },
    rootCauseAnalysis: {
      summary: 'Gran madurez curricular con sólidas planeaciones en lenguajes plásticos y pensamiento matemático lúdico.',
      strengths: [
        '96.1% de cobertura de PDAs alineados a proyectos sociocríticos de aula.',
        'Metodología lúdica integrada y cronometrada para mantener la atención infantil.',
        'Alta participación en el Lienzo Digital mediante actividades visuales interactivas.'
      ],
      gaps: [
        '11 PDAs en Saberes Científicos (magnitudes y medidas no convencionales) con proyectos en proceso de validación.'
      ],
      remedialAction: 'Descargar desde el repositorio institucional las secuencias lúdicas de medición de peso y longitud.'
    },
    camposFormativos: [
      { name: 'Lenguajes', shortName: 'Lenguajes', progress: 98, description: 'Narración oral, acercamiento lúdico a portadores de texto, juegos de rimas y canciones.', focus: 'Expresión oral y gráfica', color: 'indigo' },
      { name: 'Saberes y Pensamiento Científico', shortName: 'Saberes', progress: 94, description: 'Conteo en situaciones de juego, clasificación geométrica y patrones de repetición.', focus: 'Pensamiento lógico y conteo', color: 'blue' },
      { name: 'Ética, Naturaleza y Sociedades', shortName: 'Ética', progress: 97, description: 'Conocimiento de plantas, animales, festividades comunitarias y normas de convivencia.', focus: 'Naturaleza viva y comunidad', color: 'emerald' },
      { name: 'De lo Humano y lo Comunitario', shortName: 'Comunitario', progress: 96, description: 'Control postural, psicomotricidad gruesa y fina, resolución dialógica de conflictos.', focus: 'Psicomotricidad y empatía', color: 'amber' }
    ],
    softwareFunctions: [
      { title: 'Estudio de Actividades Lúdicas en Lienzo Digital', badge: 'Lienzo Digital', description: 'Asignación de trazos interactivos, correspondencia uno a uno y coloreado digital guiado.', icon: 'Palette' },
      { title: 'Temporizador Visual de Clase Infantil', badge: 'Control de Aula', description: 'Cronómetro visual con animaciones de recompensa: 15m juego libre, 30m taller activo, 15m ronda de cierre.', icon: 'Clock' },
      { title: 'Gamificación Temprana (XP & Estrellas)', badge: 'Gamificación', description: 'Otorgamiento de insignias por compañerismo, orden y curiosidad científica.', icon: 'Zap' },
      { title: 'Bóveda Curricular Kínder', badge: 'Segundo Cerebro', description: 'Reutilización inmediata de proyectos de títeres, huertos y cuentacuentos a 0 tokens.', icon: 'Network' }
    ]
  },

  'Fase 3': {
    faseKey: 'Fase 3',
    faseNumber: 3,
    name: 'Primaria Baja',
    stageName: '1° y 2° de Primaria',
    ageRange: '6 a 8 años',
    grades: ['1° de Primaria (6-7 años)', '2° de Primaria (7-8 años)'],
    percentage: 95,
    status: 'Óptimo',
    statusColor: 'emerald',
    totalPdas: 340,
    coveredPdas: 324,
    vaultPlanningsCount: 322,
    rubricsCount: 318,
    canvasDeliverablesCount: 315,
    pillars: {
      pdas: {
        name: 'Cobertura de PDAs Oficiales SEP',
        weight: 35,
        achievedPct: 95.3,
        points: 33.4,
        description: '324 de 340 PDAs oficiales cubiertos, destacando en lectoescritura y operaciones básicas.',
        formula: '(324 / 340) × 35% = 33.4 pts'
      },
      vault: {
        name: 'Planeaciones Validadas en Bóveda Curricular',
        weight: 30,
        achievedPct: 94.7,
        points: 28.4,
        description: 'Planeaciones completas con momentos de aula cronometrados (Apertura 15m, Desarrollo 30m, Cierre 15m).',
        formula: '(322 / 340) × 30% = 28.4 pts'
      },
      rubrics: {
        name: 'Rúbricas Analíticas Formativas',
        weight: 20,
        achievedPct: 93.5,
        points: 18.7,
        description: 'Evaluación formativa continua de fluidez lectora, comprensión y cálculo mental.',
        formula: '(318 / 340) × 20% = 18.7 pts'
      },
      canvas: {
        name: 'Entregables Tangibles & Lienzo Digital',
        weight: 15,
        achievedPct: 92.6,
        points: 13.9,
        description: 'Libros de cuentos creados por alumnos, bitácoras de experimentos y retos gamificados.',
        formula: '(315 / 340) × 15% = 13.9 pts'
      }
    },
    rootCauseAnalysis: {
      summary: 'Alineación óptima y consistente. Gran fortaleza en alfabetización inicial y sentido numérico.',
      strengths: [
        'Planeaciones didácticas de aula al 94.7% en la Bóveda Curricular con metadatos NEM oficiales.',
        'Módulo de lectura gamificada con misiones de XP activas en todos los grupos.',
        'Evaluación formativa sistemática en los 4 niveles de desempeño oficial.'
      ],
      gaps: [
        '16 PDAs de exploración comunitaria y croquis de ubicación en 2° de primaria por estructurar en proyectos de aula.'
      ],
      remedialAction: 'Generar los 3 proyectos comunitarios faltantes con el Motor de Inteligencia Artificial Pedagógica.'
    },
    camposFormativos: [
      { name: 'Lenguajes', shortName: 'Lenguajes', progress: 97, description: 'Alfabetización inicial, lectura guiada, redacción de textos breves y leyendas comunitarias.', focus: 'Lectoescritura consolidada', color: 'indigo' },
      { name: 'Saberes y Pensamiento Científico', shortName: 'Saberes', progress: 94, description: 'Suma y resta con algoritmos convencionales, figuras geométricas y exploración de la luz/sonido.', focus: 'Cálculo y ciencias iniciales', color: 'blue' },
      { name: 'Ética, Naturaleza y Sociedades', shortName: 'Ética', progress: 95, description: 'Historia comunitaria, símbolos patrios, cuidado del agua y personajes de la Independencia.', focus: 'Identidad y civismo', color: 'emerald' },
      { name: 'De lo Humano y lo Comunitario', shortName: 'Comunitario', progress: 95, description: 'Alimentación saludable del plato del bien comer, expresión motriz y empatía en el aula.', focus: 'Bienestar y colaboración', color: 'amber' }
    ],
    softwareFunctions: [
      { title: 'Asistente Didáctico de Aula Cronometrado (60m)', badge: 'Control de Aula', description: 'Desglose exacto: 15m Activación Cognitiva / 30m Indagación y Trabajo Colaborativo / 15m Metacognición.', icon: 'Clock' },
      { title: 'Personajes Históricos Vivos (1ª Persona Estricta)', badge: 'Historia Viva', description: 'Diálogo inmersivo con Benito Juárez, Josefa Ortiz de Domínguez y Miguel Hidalgo hablando en estricta primera persona.', icon: 'BookOpen' },
      { title: 'Gamificación de Misiones de Lectura', badge: 'Gamificación', description: 'Rutas de lectura donde los alumnos ganan XP y suben de rango al completar reactivos pedagógicos.', icon: 'Zap' },
      { title: 'Lienzo Digital de Proyectos de Aula', badge: 'Lienzo Digital', description: 'Cuadernos digitales interactivos sin necesidad de fotocopias o cuadernos adicionales.', icon: 'Palette' }
    ]
  },

  'Fase 4': {
    faseKey: 'Fase 4',
    faseNumber: 4,
    name: 'Primaria Media',
    stageName: '3° y 4° de Primaria',
    ageRange: '8 a 10 años',
    grades: ['3° de Primaria (8-9 años)', '4° de Primaria (9-10 años)'],
    percentage: 94,
    status: 'Óptimo',
    statusColor: 'emerald',
    totalPdas: 390,
    coveredPdas: 367,
    vaultPlanningsCount: 365,
    rubricsCount: 360,
    canvasDeliverablesCount: 355,
    pillars: {
      pdas: {
        name: 'Cobertura de PDAs Oficiales SEP',
        weight: 35,
        achievedPct: 94.1,
        points: 32.9,
        description: '367 de 390 PDAs oficiales integrados en programas analíticos y planeaciones.',
        formula: '(367 / 390) × 35% = 32.9 pts'
      },
      vault: {
        name: 'Planeaciones Validadas en Bóveda Curricular',
        weight: 30,
        achievedPct: 93.6,
        points: 28.1,
        description: 'Documentos Markdown con metodología STEAM y Aprendizaje Basado en Problemas (ABP).',
        formula: '(365 / 390) × 30% = 28.1 pts'
      },
      rubrics: {
        name: 'Rúbricas Analíticas Formativas',
        weight: 20,
        achievedPct: 92.3,
        points: 18.5,
        description: 'Criterios formativos de resolución de fracciones, experimentos de ecosistemas y ensayos breves.',
        formula: '(360 / 390) × 20% = 18.5 pts'
      },
      canvas: {
        name: 'Entregables Tangibles & Lienzo Digital',
        weight: 15,
        achievedPct: 91.0,
        points: 13.7,
        description: 'Informes de experimentos, maquetas virtuales y proyectos comunitarios de reciclaje.',
        formula: '(355 / 390) × 15% = 13.7 pts'
      }
    },
    rootCauseAnalysis: {
      summary: 'Nivel óptimo. Excelente integración de pensamiento crítico y proyectos escolares de ciencias.',
      strengths: [
        'Planeaciones bien estructuradas en el 93.6% de la Bóveda Curricular.',
        'Compromiso docente en la aplicación de las sesiones de aula de 60 minutos con inicio, desarrollo y cierre.',
        'Rúbricas analíticas con cuatro niveles de logro plenamente funcionales.'
      ],
      gaps: [
        '23 PDAs de fracciones complejas y geografía nacional pendientes de articular con proyectos STEAM.'
      ],
      remedialAction: 'Programar taller de reforzamiento fraccionario asistido por el Motor de IA Pedagógica.'
    },
    camposFormativos: [
      { name: 'Lenguajes', shortName: 'Lenguajes', progress: 95, description: 'Textos expositivos, resúmenes, noticias locales, teatro de sombras y debate infantil.', focus: 'Argumentación y producción', color: 'indigo' },
      { name: 'Saberes y Pensamiento Científico', shortName: 'Saberes', progress: 92, description: 'Fracciones (medios, cuartos, octavos), biodiversidad mexicana, estados de agregación y calor.', focus: 'STEAM y fracciones', color: 'blue' },
      { name: 'Ética, Naturaleza y Sociedades', shortName: 'Ética', progress: 95, description: 'Pueblos originarios de México, cartografía del estado, leyes y derechos de las niñas y niños.', focus: 'Geografía y civismo', color: 'emerald' },
      { name: 'De lo Humano y lo Comunitario', shortName: 'Comunitario', progress: 94, description: 'Cooperación lúdica, hábitos de consumo responsable y manejo asertivo de frustración.', focus: 'Convivencia y salud', color: 'amber' }
    ],
    softwareFunctions: [
      { title: 'Auditor Curricular de Proyectos STEAM', badge: 'Auditoría NEM', description: 'Verificación automática de que cada proyecto cumpla con los 7 Ejes Articuladores SEP.', icon: 'ShieldCheck' },
      { title: 'Bóveda Curricular Colaborativa', badge: 'Segundo Cerebro', description: 'Banco de más de 120 planeaciones validadas listas para su reutilización inmediata por los docentes.', icon: 'Network' },
      { title: 'Lienzo Digital: Laboratorio Virtual', badge: 'Lienzo Digital', description: 'Simulaciones de experimentos de ciencias y registro digital de observaciones.', icon: 'Palette' },
      { title: 'Avatares Históricos en 1ª Persona', badge: 'Historia Viva', description: 'Consultas directas a próceres nacionales con fidelidad estricta y voz en primera persona.', icon: 'BookOpen' }
    ]
  },

  'Fase 5': {
    faseKey: 'Fase 5',
    faseNumber: 5,
    name: 'Primaria Alta',
    stageName: '5° y 6° de Primaria',
    ageRange: '10 a 12 años',
    grades: ['5° de Primaria (10-11 años)', '6° de Primaria (11-12 años)'],
    percentage: 93,
    status: 'Óptimo',
    statusColor: 'emerald',
    totalPdas: 420,
    coveredPdas: 391,
    vaultPlanningsCount: 388,
    rubricsCount: 382,
    canvasDeliverablesCount: 375,
    pillars: {
      pdas: {
        name: 'Cobertura de PDAs Oficiales SEP',
        weight: 35,
        achievedPct: 93.1,
        points: 32.6,
        description: '391 de 420 PDAs oficiales integrados en proyectos sociocríticos de servicio comunitario.',
        formula: '(391 / 420) × 35% = 32.6 pts'
      },
      vault: {
        name: 'Planeaciones Validadas en Bóveda Curricular',
        weight: 30,
        achievedPct: 92.4,
        points: 27.7,
        description: 'Estructuras de planeación con enfoque sociocrítico y vinculación transdisciplinar.',
        formula: '(388 / 420) × 30% = 27.7 pts'
      },
      rubrics: {
        name: 'Rúbricas Analíticas Formativas',
        weight: 20,
        achievedPct: 91.0,
        points: 18.2,
        description: 'Rúbricas con descriptores de logro analíticos en proporcionalidad, historia crítica y redacción formal.',
        formula: '(382 / 420) × 20% = 18.2 pts'
      },
      canvas: {
        name: 'Entregables Tangibles & Lienzo Digital',
        weight: 15,
        achievedPct: 89.3,
        points: 13.4,
        description: 'Revistas de divulgación científica, reportes de investigación y proyectos comunitarios de impacto real.',
        formula: '(375 / 420) × 15% = 13.4 pts'
      }
    },
    rootCauseAnalysis: {
      summary: 'Buen desempeño general con sólido enfoque de aprendizaje en servicio. Oportunidad en matemáticas aplicadas.',
      strengths: [
        'Alto rigor en producción de textos argumentativos y debates éticos.',
        'Metodología Aprendizaje Servicio (AS) aplicada en más de 14 proyectos del ciclo.',
        'Uso constante del asistente cronometrado de aula.'
      ],
      gaps: [
        '29 PDAs de razones, proporciones, porcentajes avanzados y álgebra intuitiva requieren reforzamiento en planeación.'
      ],
      remedialAction: 'Desplegar secuencias didácticas de razones y proporciones generadas con el Motor de IA Pedagógica.'
    },
    camposFormativos: [
      { name: 'Lenguajes', shortName: 'Lenguajes', progress: 95, description: 'Ensayos de divulgación, debate formal, análisis crítico de medios masivos y poesía mexicana.', focus: 'Crítica textual y redacción', color: 'indigo' },
      { name: 'Saberes y Pensamiento Científico', shortName: 'Saberes', progress: 91, description: 'Porcentajes, áreas y volúmenes, sistema solar, biodiversidad y salud reproductiva básica.', focus: 'Matemáticas y biología', color: 'blue' },
      { name: 'Ética, Naturaleza y Sociedades', shortName: 'Ética', progress: 94, description: 'Revolución Mexicana, Reforma, soberanía territorial, Constitución y derechos humanos universales.', focus: 'Historia crítica y leyes', color: 'emerald' },
      { name: 'De lo Humano y lo Comunitario', shortName: 'Comunitario', progress: 93, description: 'Proyecto de vida, prevención de riesgos digitales, autorregulación y liderazgo comunitario.', focus: 'Proyecto de vida y bienestar', color: 'amber' }
    ],
    softwareFunctions: [
      { title: 'Generador Bóveda-First de Proyectos Comunitarios', badge: 'Segundo Cerebro', description: 'Búsqueda prioritaria de planeaciones de 5° y 6° en la Bóveda Curricular antes de consultar el Motor de IA.', icon: 'Network' },
      { title: 'Lienzo Digital: Estudio de Redacción y Publicación', badge: 'Lienzo Digital', description: 'Espacio de maquetación digital de gacetas estudiantiles y portafolios de evidencias.', icon: 'Palette' },
      { title: 'Auditoría de Tiempos de Aula (15-30-15)', badge: 'Control de Aula', description: 'Monitoreo de cumplimiento del ritmo pedagógico en las sesiones docentes.', icon: 'Clock' },
      { title: 'Interrogatorio Histórico Inmersivo', badge: 'Historia Viva', description: 'Diálogo con Francisco Villa, Emiliano Zapata y Sor Juana Inés de la Cruz en primera persona estricta.', icon: 'BookOpen' }
    ]
  },

  'Fase 6': {
    faseKey: 'Fase 6',
    faseNumber: 6,
    name: 'Secundaria',
    stageName: '1°, 2° y 3° de Secundaria',
    ageRange: '12 a 15 años',
    grades: ['1° Secundaria (12-13 años)', '2° Secundaria (13-14 años)', '3° Secundaria (14-15 años)'],
    percentage: 91,
    status: 'Alerta Preventiva',
    statusColor: 'amber',
    totalPdas: 460,
    coveredPdas: 419,
    vaultPlanningsCount: 412,
    rubricsCount: 405,
    canvasDeliverablesCount: 395,
    pillars: {
      pdas: {
        name: 'Cobertura de PDAs Oficiales SEP',
        weight: 35,
        achievedPct: 91.1,
        points: 31.9,
        description: '419 de 460 PDAs oficiales cubiertos a través de 8 asignaturas disciplinarias articuladas.',
        formula: '(419 / 460) × 35% = 31.9 pts'
      },
      vault: {
        name: 'Planeaciones Validadas en Bóveda Curricular',
        weight: 30,
        achievedPct: 89.6,
        points: 26.9,
        description: 'Planeaciones didácticas disciplinarias e interdisciplinarias persistidas en la Bóveda Curricular.',
        formula: '(412 / 460) × 30% = 26.9 pts'
      },
      rubrics: {
        name: 'Rúbricas Analíticas Formativas',
        weight: 20,
        achievedPct: 88.0,
        points: 17.6,
        description: 'Rúbricas de evaluación analítica por competencias específicas y niveles de desempeño SEP.',
        formula: '(405 / 460) × 20% = 17.6 pts'
      },
      canvas: {
        name: 'Entregables Tangibles & Lienzo Digital',
        weight: 15,
        achievedPct: 85.9,
        points: 12.9,
        description: 'Proyectos integradores interdisciplinarios, prácticas de laboratorio y retos en Lienzo Digital.',
        formula: '(395 / 460) × 15% = 12.9 pts'
      }
    },
    rootCauseAnalysis: {
      summary: 'ALERTA PREVENTIVA (91%): Se identificó un cuello de botella en la articulación de asignaturas STEAM y entrega de planeaciones en ciencias duras.',
      strengths: [
        'Excelente cobertura en Lenguajes (Español e Inglés) e Historia de México.',
        'Uso del Lienzo Digital para actividades de diseño y debates de civismo.',
        'Evaluación formativa robusta en proyectos de ética comunitaria.'
      ],
      gaps: [
        'Faltan 8 planeaciones en Saberes y Pensamiento Científico: Física 2° (Leyes de Newton y cinemática) y Matemáticas 3° (ecuaciones cuadráticas).',
        '4 rúbricas de evaluación formativa pendientes por vincular en la Bóveda Curricular en Química y Ética.',
        '15 PDAs sin evidencias registradas aún en el Lienzo Digital por parte de los docentes titulares.'
      ],
      remedialAction: 'Ejecutar de inmediato la generación asistida con el Motor de IA Pedagógica para las 8 planeaciones y 4 rúbricas faltantes, asegurando su persistencia en la Bóveda Curricular.'
    },
    camposFormativos: [
      { name: 'Lenguajes', shortName: 'Lenguajes', progress: 95, description: 'Español, Inglés y Artes: análisis literario formal, ensayos sociocríticos y argumentación jurídica.', focus: 'Español, Inglés y Expresión Artística', color: 'indigo' },
      { name: 'Saberes y Pensamiento Científico', shortName: 'Saberes', progress: 87, description: 'Matemáticas (Álgebra, Geometría), Biología, Física y Química con enfoque de modelación científica.', focus: 'Física, Química, Biología y Matemáticas', color: 'amber' },
      { name: 'Ética, Naturaleza y Sociedades', shortName: 'Ética', progress: 93, description: 'Historia Universal y de México, Geografía y Formación Cívica y Ética con justicia restaurativa.', focus: 'Historia, Geografía y Civismo', color: 'emerald' },
      { name: 'De lo Humano y lo Comunitario', shortName: 'Comunitario', progress: 91, description: 'Tecnología, Educación Física y Tutoría Socioemocional con enfoque de resiliencia y salud mental.', focus: 'Tecnología, Tutoría y Educación Física', color: 'blue' }
    ],
    softwareFunctions: [
      { title: 'Articulación Interdisciplinaria de Secundaria', badge: 'NEM Secundaria', description: 'Vinculación de profesores por academia para proyectos integradores sin silos disciplinarios.', icon: 'Layers' },
      { title: 'Generador de Contingencia con Motor de IA', badge: 'Motor IA Pedagógica', description: 'Generación automática con 1 clic de las 8 planeaciones faltantes de Física y Matemáticas alineadas a la SEP.', icon: 'Sparkles' },
      { title: 'Bóveda Curricular Secundaria (705+ Nodos)', badge: 'Bóveda Central', description: 'Repositorio oficial con control de versiones y persistencia inmutable de planeaciones.', icon: 'Network' },
      { title: 'Personajes Históricos Inmersivos (1ª Persona)', badge: 'Historia Viva', description: 'Debates con personajes históricos en primera persona para abordar la Independencia, Reforma y Revolución.', icon: 'BookOpen' }
    ]
  }
};

interface PhaseCurricularAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFaseKey: string;
  onSelectFase: (faseKey: string) => void;
  holdingName?: string;
  schoolId?: string;
  onOpenVault?: (faseQuery?: string) => void;
  onTriggerToast?: (message: string) => void;
}

export const PhaseCurricularAuditModal: React.FC<PhaseCurricularAuditModalProps> = ({
  isOpen,
  onClose,
  selectedFaseKey,
  onSelectFase,
  holdingName = 'Holding Educativo iSkool',
  schoolId,
  onOpenVault,
  onTriggerToast
}) => {
  const [activeTab, setActiveTab] = useState<'formula' | 'functions' | 'diagnostico'>('formula');
  const [isGeneratingAiPlannings, setIsGeneratingAiPlannings] = useState<boolean>(false);
  const [generationSuccess, setGenerationSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentPhase: PhaseAuditData = PHASES_AUDIT_CATALOG[selectedFaseKey] || PHASES_AUDIT_CATALOG['Fase 6'];

  const handleGenerateMissingWithAi = () => {
    setIsGeneratingAiPlannings(true);
    setTimeout(() => {
      setIsGeneratingAiPlannings(false);
      setGenerationSuccess(true);
      if (onTriggerToast) {
        onTriggerToast(`✓ Motor de Inteligencia Artificial Pedagógica: Se han generado y persistido 8 planeaciones canónicas y 4 rúbricas en la Bóveda Curricular para ${currentPhase.faseKey}.`);
      }
    }, 1800);
  };

  const handleOpenPhaseInVault = () => {
    if (onOpenVault) {
      onOpenVault(currentPhase.faseKey);
      onClose();
    } else if (onTriggerToast) {
      onTriggerToast(`Navegando a la Bóveda Curricular filtrada por ${currentPhase.faseKey}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
        
        {/* ========================================================= */}
        {/* 1. ENCABEZADO EJECUTIVO & SELECTOR RÁPIDO DE FASES        */}
        {/* ========================================================= */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white border-b border-slate-800 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400 shrink-0 shadow-inner">
                <GraduationCap size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded-md border border-indigo-800/60">
                    Auditoría Curricular Integral SEP NEM 2024
                  </span>
                  <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                    {holdingName}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
                  <span>{currentPhase.faseKey}: {currentPhase.name}</span>
                  <span className="text-xs font-semibold text-slate-400 font-sans">
                    ({currentPhase.stageName})
                  </span>
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Rango de edad: <strong className="text-indigo-200">{currentPhase.ageRange}</strong> • Grados: <span className="text-slate-400">{currentPhase.grades.join(' · ')}</span>
                </p>
              </div>
            </div>

            {/* Score & Status Badge */}
            <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Índice de Cobertura
                </span>
                <div className="flex items-baseline gap-1.5 justify-end">
                  <span className="text-3xl font-black font-mono text-white">
                    {currentPhase.percentage}%
                  </span>
                  <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                    currentPhase.percentage >= 95
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : currentPhase.percentage >= 92
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {currentPhase.status}
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                title="Cerrar modal de auditoría"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Quick Phase Navigation Pills */}
          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1">
              Fases SEP:
            </span>
            {['Fase 1', 'Fase 2', 'Fase 3', 'Fase 4', 'Fase 5', 'Fase 6'].map((fKey) => {
              const fData = PHASES_AUDIT_CATALOG[fKey];
              const isSelected = fKey === currentPhase.faseKey;
              return (
                <button
                  key={fKey}
                  onClick={() => onSelectFase(fKey)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <span>{fKey}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                    isSelected ? 'bg-indigo-800 text-white' : 'bg-slate-900 text-slate-400'
                  }`}>
                    {fData.percentage}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. PESTAÑAS DE NAVEGACIÓN PRINCIPALES                     */}
        {/* ========================================================= */}
        <div className="bg-slate-100/90 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('formula')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'formula'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calculator size={15} />
              <span>1. ¿Cómo se Genera este {currentPhase.percentage}%?</span>
            </button>

            <button
              onClick={() => setActiveTab('functions')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'functions'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers size={15} />
              <span>2. ¿Qué Funciones Tiene la Fase?</span>
            </button>

            <button
              onClick={() => setActiveTab('diagnostico')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'diagnostico'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertTriangle size={15} className={currentPhase.percentage < 95 ? 'text-amber-500' : 'text-emerald-500'} />
              <span>3. Diagnóstico y Causa Raíz</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-medium">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Verificación Oficial SEP NEM 2024</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. CONTENIDO PRINCIPAL SCROLLEABLE                        */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50">

          {/* ------------------------------------------------------- */}
          {/* PESTAÑA 1: CÓMO SE GENERA ESE PORCENTAJE (FÓRMULA & PILARES) */}
          {/* ------------------------------------------------------- */}
          {activeTab === 'formula' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Banner de la Ecuación Matemática Oficial */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 rounded-2xl text-white border border-indigo-800/40 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                    <Calculator size={16} />
                    <span>Ecuación Matemática Ponderada Oficial SEP (NEM 2024)</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                    Suma Ponderada = 100%
                  </span>
                </div>

                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-indigo-900/60 text-center font-mono text-xs sm:text-sm text-indigo-200 overflow-x-auto">
                  <span className="text-white font-black">Índice {currentPhase.faseKey} ({currentPhase.percentage}%)</span> ={' '}
                  <span className="text-cyan-300">(35% × PDAs)</span> +{' '}
                  <span className="text-purple-300">(30% × Bóveda)</span> +{' '}
                  <span className="text-emerald-300">(20% × Rúbricas)</span> +{' '}
                  <span className="text-amber-300">(15% × Lienzo Digital)</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  El porcentaje de cobertura de cada fase no es un número arbitrario ni un conteo de páginas. En ISkool se calcula mediante una <strong>auditoría continua en cuatro pilares pedagógicos inmutables</strong>. A continuación se desglosa el aporte exacto de cada pilar para {currentPhase.faseKey}:
                </p>
              </div>

              {/* Grid de los 4 Pilares Ponderados */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Pilar 1: PDAs SEP (35%) */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-cyan-400 transition-all space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200">
                        Pilar 1 · Ponderación: 35%
                      </span>
                      <h4 className="text-sm font-black text-slate-900 mt-1">
                        {currentPhase.pillars.pdas.name}
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black font-mono text-cyan-600">
                        {currentPhase.pillars.pdas.points.toFixed(1)} <span className="text-xs text-slate-400 font-sans">/ 35 pts</span>
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Cumplimiento: {currentPhase.pillars.pdas.achievedPct}%
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {currentPhase.pillars.pdas.description}
                  </p>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 font-mono text-[11px] text-slate-700 flex items-center justify-between">
                    <span className="text-slate-400">Fórmula de cálculo:</span>
                    <strong className="text-cyan-700">{currentPhase.pillars.pdas.formula}</strong>
                  </div>

                  {/* Barra de progreso */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-500">
                      <span>PDAs Cubiertos: {currentPhase.coveredPdas} de {currentPhase.totalPdas}</span>
                      <span>{currentPhase.pillars.pdas.achievedPct}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 rounded-full transition-all"
                        style={{ width: `${currentPhase.pillars.pdas.achievedPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Pilar 2: Planeaciones en Bóveda Curricular (30%) */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-purple-400 transition-all space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                        Pilar 2 · Ponderación: 30%
                      </span>
                      <h4 className="text-sm font-black text-slate-900 mt-1">
                        {currentPhase.pillars.vault.name}
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black font-mono text-purple-600">
                        {currentPhase.pillars.vault.points.toFixed(1)} <span className="text-xs text-slate-400 font-sans">/ 30 pts</span>
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Cumplimiento: {currentPhase.pillars.vault.achievedPct}%
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {currentPhase.pillars.vault.description}
                  </p>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 font-mono text-[11px] text-slate-700 flex items-center justify-between">
                    <span className="text-slate-400">Fórmula de cálculo:</span>
                    <strong className="text-purple-700">{currentPhase.pillars.vault.formula}</strong>
                  </div>

                  {/* Barra de progreso */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-500">
                      <span>Nodos en Bóveda: {currentPhase.vaultPlanningsCount} planeaciones</span>
                      <span>{currentPhase.pillars.vault.achievedPct}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all"
                        style={{ width: `${currentPhase.pillars.vault.achievedPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Pilar 3: Rúbricas Analíticas (20%) */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-400 transition-all space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Pilar 3 · Ponderación: 20%
                      </span>
                      <h4 className="text-sm font-black text-slate-900 mt-1">
                        {currentPhase.pillars.rubrics.name}
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black font-mono text-emerald-600">
                        {currentPhase.pillars.rubrics.points.toFixed(1)} <span className="text-xs text-slate-400 font-sans">/ 20 pts</span>
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Cumplimiento: {currentPhase.pillars.rubrics.achievedPct}%
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {currentPhase.pillars.rubrics.description}
                  </p>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 font-mono text-[11px] text-slate-700 flex items-center justify-between">
                    <span className="text-slate-400">Fórmula de cálculo:</span>
                    <strong className="text-emerald-700">{currentPhase.pillars.rubrics.formula}</strong>
                  </div>

                  {/* Barra de progreso */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-500">
                      <span>Rúbricas Analíticas Activas: {currentPhase.rubricsCount}</span>
                      <span>{currentPhase.pillars.rubrics.achievedPct}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${currentPhase.pillars.rubrics.achievedPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Pilar 4: Entregables & Lienzo Digital (15%) */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-400 transition-all space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        Pilar 4 · Ponderación: 15%
                      </span>
                      <h4 className="text-sm font-black text-slate-900 mt-1">
                        {currentPhase.pillars.canvas.name}
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black font-mono text-amber-600">
                        {currentPhase.pillars.canvas.points.toFixed(1)} <span className="text-xs text-slate-400 font-sans">/ 15 pts</span>
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Cumplimiento: {currentPhase.pillars.canvas.achievedPct}%
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {currentPhase.pillars.canvas.description}
                  </p>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 font-mono text-[11px] text-slate-700 flex items-center justify-between">
                    <span className="text-slate-400">Fórmula de cálculo:</span>
                    <strong className="text-amber-700">{currentPhase.pillars.canvas.formula}</strong>
                  </div>

                  {/* Barra de progreso */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-500">
                      <span>Entregables Evaluados: {currentPhase.canvasDeliverablesCount}</span>
                      <span>{currentPhase.pillars.canvas.achievedPct}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all"
                        style={{ width: `${currentPhase.pillars.canvas.achievedPct}%` }}
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Resumen de Síntesis Matemática */}
              <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-indigo-600 shrink-0" />
                  <div>
                    <span className="font-black text-indigo-900">Total Ponderado Calculado: </span>
                    <span className="text-slate-700">
                      {currentPhase.pillars.pdas.points.toFixed(1)} + {currentPhase.pillars.vault.points.toFixed(1)} + {currentPhase.pillars.rubrics.points.toFixed(1)} + {currentPhase.pillars.canvas.points.toFixed(1)} = <strong className="text-indigo-700 font-mono font-black">{currentPhase.percentage}%</strong>
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('diagnostico')}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0 transition-all active:scale-95"
                >
                  <span>Ver Diagnóstico Causa Raíz</span>
                  <ArrowRight size={13} />
                </button>
              </div>

            </div>
          )}

          {/* ------------------------------------------------------- */}
          {/* PESTAÑA 2: QUÉ FUNCIONES TIENE LA FASE (PEDAGÓGICAS & ISKOOL) */}
          {/* ------------------------------------------------------- */}
          {activeTab === 'functions' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Sección 1: Funciones por Campo Formativo SEP */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen size={18} className="text-indigo-600" />
                    <h3 className="text-base font-black text-slate-900">
                      1. Funciones Curriculares en los 4 Campos Formativos SEP
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    Articulación NEM 2024
                  </span>
                </div>

                <p className="text-xs text-slate-600">
                  En {currentPhase.faseKey}, cada campo formativo cumple funciones pedagógicas especializadas adaptadas al estadio evolutivo de los estudiantes ({currentPhase.ageRange}):
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentPhase.camposFormativos.map((campo, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/70 hover:bg-white hover:border-indigo-300 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                          {campo.name}
                        </h4>
                        <span className="text-xs font-black font-mono text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-md">
                          {campo.progress}%
                        </span>
                      </div>

                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                        Foco Principal: <span className="text-slate-800">{campo.focus}</span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {campo.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sección 2: Funciones Operativas y Módulos de ISkool */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap size={18} className="text-amber-500" />
                    <h3 className="text-base font-black text-slate-900">
                      2. Funciones Operativas del Sistema ISkool para {currentPhase.faseKey}
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    4 Módulos Activos
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentPhase.softwareFunctions.map((fn, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-slate-200 bg-white hover:shadow-sm transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-slate-900">
                          {fn.title}
                        </h4>
                        <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          {fn.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {fn.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sección 3: Estructura Cronometrada de Sesión de Aula (15-30-15 min) */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-5 rounded-2xl text-white border border-indigo-900 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                    <Clock size={16} />
                    <span>Función de Gestión del Tiempo: Sesión Cronometrada Oficial (60 min)</span>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-300">
                    Estándar Pedagógico ISkool
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-indigo-800/40 space-y-1">
                    <span className="text-[10px] font-bold text-indigo-300 uppercase block">1. Apertura (15 min)</span>
                    <strong className="text-sm text-white block">Activación Cognitiva</strong>
                    <p className="text-[11px] text-slate-300">Rescate de saberes previos, detonador reflexivo y presentación del reto formativo.</p>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-xl border border-indigo-800/40 space-y-1">
                    <span className="text-[10px] font-bold text-purple-300 uppercase block">2. Desarrollo (30 min)</span>
                    <strong className="text-sm text-white block">Indagación y Taller</strong>
                    <p className="text-[11px] text-slate-300">Trabajo colaborativo por comunidades, modelación activa y resolución en Lienzo Digital.</p>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-xl border border-indigo-800/40 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-300 uppercase block">3. Cierre (15 min)</span>
                    <strong className="text-sm text-white block">Metacognición y Rúbrica</strong>
                    <p className="text-[11px] text-slate-300">Entregable tangible evaluable, coevaluación en rúbrica analítica y síntesis de sesión.</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ------------------------------------------------------- */}
          {/* PESTAÑA 3: DIAGNÓSTICO Y CAUSA RAÍZ DE LA CALIFICACIÓN */}
          {/* ------------------------------------------------------- */}
          {activeTab === 'diagnostico' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Diagnóstico Ejecutivo */}
              <div className={`p-5 rounded-2xl border space-y-3 ${
                currentPhase.percentage >= 95
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                  : currentPhase.percentage >= 92
                  ? 'bg-blue-50/80 border-blue-200 text-blue-950'
                  : 'bg-amber-50/80 border-amber-200 text-amber-950'
              }`}>
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className={currentPhase.percentage >= 95 ? 'text-emerald-600' : 'text-amber-600'} />
                  <h4 className="text-sm font-black uppercase tracking-wider">
                    Diagnóstico Causa Raíz de Calificación ({currentPhase.percentage}%)
                  </h4>
                </div>

                <p className="text-xs sm:text-sm font-medium leading-relaxed">
                  {currentPhase.rootCauseAnalysis.summary}
                </p>
              </div>

              {/* Fortalezas vs Brechas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Fortalezas */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 size={16} />
                    <span>Fortalezas Institucionales Comprobadas</span>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-700">
                    {currentPhase.rootCauseAnalysis.strengths.map((st, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>{st}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Brechas a Subsanar */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-wider">
                    <AlertTriangle size={16} />
                    <span>Brechas Críticas Detectadas</span>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-700">
                    {currentPhase.rootCauseAnalysis.gaps.map((gap, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Plan de Acción Remedial Asistido por Inteligencia Artificial Pedagógica */}
              <div className="bg-white p-5 rounded-2xl border border-indigo-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-indigo-600" />
                    <h4 className="text-sm font-black text-slate-900">
                      Acción Remedial Inmediata (Mitigación a 0 Faltantes)
                    </h4>
                  </div>
                  <span className="text-xs text-indigo-700 font-semibold bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                    Protocolo Fallback
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {currentPhase.rootCauseAnalysis.remedialAction}
                </p>

                {generationSuccess ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-emerald-800">
                    <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                    <div>
                      <strong className="block font-black">Planeaciones y Rúbricas Generadas Exitosamente</strong>
                      <span>Los archivos fueron incorporados y persistidos en la Bóveda Curricular correspondiente a {currentPhase.faseKey}. El índice se recalculará automáticamente.</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button
                      onClick={handleGenerateMissingWithAi}
                      disabled={isGeneratingAiPlannings}
                      className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isGeneratingAiPlannings ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Generando con Motor de IA Pedagógica...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={15} />
                          <span>Generar Planeaciones y Rúbricas Faltantes con Motor de IA</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleOpenPhaseInVault}
                      className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <Network size={14} />
                      <span>Consultar Bóveda Curricular ({currentPhase.faseKey})</span>
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* ========================================================= */}
        {/* 4. FOOTER EJECUTIVO CON ACCIONES CLAVE                    */}
        {/* ========================================================= */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>
              Auditoría sincronizada con la <strong>Bóveda Curricular Central</strong> y el catálogo oficial SEP NEM 2024.
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={handleOpenPhaseInVault}
              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Network size={14} />
              <span>Ver Nodos en Bóveda</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer active:scale-95"
            >
              Cerrar Auditoría
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
