import type { UserProfile } from '@/types';
import { DEMO_SCHOOL_ID, DEMO_SUBJECTS, DEMO_TEACHERS } from './demoSchoolSeeds';

const DEMO_TEACHER_BY_ID = new Map<string, UserProfile>(
  DEMO_TEACHERS.map((t) => [t.id, t])
);

export interface DemoTeacherPlanningDetail {
  id: string;
  title: string;
  subjectName: string;
  gradeGroup: string;
  campusName: string;
  faseNem: string;
  campoFormativo: string;
  ejeArticulador: string;
  pdaOficial: string;
  duration: string;
  sessionsCount: number;
  updatedAt: string;
  vaultStatus: string;
  proposito: string;
  inicio: string;
  desarrollo: string;
  cierre: string;
  materiales: string[];
  evaluacionRubrica: {
    criterio: string;
    logrado: string;
    enProceso: string;
  }[];
  entregableTangible: string;
}

export function getTeacherPlanningCount(
  teacher: Pick<UserProfile, 'ai_tokens_consumed'> & { id?: string; school_id?: string }
): number {
  let tokens = teacher.ai_tokens_consumed || 0;
  if (teacher.school_id === DEMO_SCHOOL_ID && tokens < 25000 && teacher.id) {
    const canonical = DEMO_TEACHER_BY_ID.get(teacher.id);
    if (canonical?.ai_tokens_consumed) {
      tokens = canonical.ai_tokens_consumed;
    }
  }
  return Math.max(1, Math.round((tokens || 15000) / 15000));
}

const SUBJECT_NAME_BY_ID = new Map<string, string>(
  DEMO_SUBJECTS.map((s) => [s.id, s.name])
);

const TOPIC_BANK = [
  {
    topic: 'Comprensión Crítica y Producción de Textos Argumentativos',
    campo: 'Lenguajes',
    eje: 'Apropiación de las culturas a través de la lectura y la escritura',
    pda: 'Analiza textos argumentativos e identifica tesis, evidencias y postura crítica para redactar propuestas comunitarias.',
    entregable: 'Ensayo breve ilustrado y cartel de debate escolar con rúbrica sellada.',
  },
  {
    topic: 'Modelado Matemático y Resolución de Problemas en Contexto Real',
    campo: 'Saberes y Pensamiento Científico',
    eje: 'Pensamiento crítico',
    pda: 'Formula y resuelve situaciones problemáticas mediante proporcionalidad, representaciones algebraicas y análisis de datos.',
    entregable: 'Cuadernillo de modelado aplicado con gráficas comparativas y comprobación.',
  },
  {
    topic: 'Método Experimental, Indagación y Evidencia Científica',
    campo: 'Saberes y Pensamiento Científico',
    eje: 'Vida saludable',
    pda: 'Diseña experimentos controlados, registra variables observables y comunica conclusiones sustentadas en evidencia.',
    entregable: 'Bitácora científica de laboratorio con hipótesis, tablas y conclusiones.',
  },
  {
    topic: 'Ciudadanía Activa, Memoria Histórica y Derechos Humanos',
    campo: 'Ética, Naturaleza y Sociedades',
    eje: 'Interculturalidad crítica',
    pda: 'Contextualiza procesos históricos nacionales y reflexiona sobre la participación ciudadana y el bien común.',
    entregable: 'Línea de tiempo comentada y crónica histórica en primera persona.',
  },
  {
    topic: 'Comunicación Oral Funcional y Escucha Activa Bilingüe',
    campo: 'Lenguajes',
    eje: 'Inclusión',
    pda: 'Interactúa en intercambios comunicativos cotidianos y académicos empleando vocabulario funcional y pronunciación clara.',
    entregable: 'Guion dialogado en parejas y grabación de práctica fonética evaluada.',
  },
  {
    topic: 'Proyecto Integrador de Tecnología, Robótica y Sostenibilidad',
    campo: 'De lo Humano y lo Comunitario',
    eje: 'Artes y experiencias estéticas',
    pda: 'Diseña prototipos o soluciones digitales colaborativas orientadas a resolver una necesidad concreta del plantel.',
    entregable: 'Prototipo funcional documentado y ficha técnica de impacto escolar.',
  },
  {
    topic: 'Análisis de Fuentes Primarias y Pensamiento Socioemocional',
    campo: 'De lo Humano y lo Comunitario',
    eje: 'Igualdad de género',
    pda: 'Valora diversas perspectivas en el trabajo colaborativo, regula acuerdos grupales y argumenta con respeto.',
    entregable: 'Acta de acuerdos del proyecto comunitario y portafolio de evidencias.',
  },
  {
    topic: 'Estrategias de Evaluación Formativa y Metacognición',
    campo: 'Saberes y Pensamiento Científico',
    eje: 'Pensamiento crítico',
    pda: 'Identifica logros y áreas de mejora en su propio proceso de aprendizaje mediante listas de cotejo y coevaluación.',
    entregable: 'Mapa conceptual de síntesis y autoevaluación argumentada.',
  },
  {
    topic: 'Taller de Expresión Creativa, Síntesis y Exposición Oral',
    campo: 'Lenguajes',
    eje: 'Artes y experiencias estéticas',
    pda: 'Organiza ideas clave con apoyos visuales pertinentes y expone con claridad ante sus pares.',
    entregable: 'Presentación visual estructurada y ficha de retroalimentación grupal.',
  },
];

function resolveSubjectDisplay(raw: string): string {
  return SUBJECT_NAME_BY_ID.get(raw) || raw || 'Asignatura Titular';
}

function resolveGroupDisplay(raw: string | undefined, campusName: string): string {
  if (!raw) {
    if (campusName.includes('Secundaria')) return '2º A Secundaria';
    if (campusName.includes('Preparatoria')) return '4º Semestre Preparatoria';
    return '5º A Primaria';
  }
  const clean = raw
    .replace('grp-demo-pri-', '')
    .replace('grp-demo-sec-', '')
    .replace('grp-demo-prep-', '')
    .toUpperCase();
  if (campusName.includes('Secundaria')) return `${clean} Secundaria`;
  if (campusName.includes('Preparatoria')) return `${clean} Preparatoria`;
  return `${clean} Primaria`;
}

function resolveFaseNem(campusName: string): string {
  if (campusName.includes('Secundaria')) return 'Fase 6 · Educación Secundaria (NEM 2024)';
  if (campusName.includes('Preparatoria')) return 'Bachillerato · Marco Curricular Común';
  return 'Fase 5 · Educación Primaria (NEM 2024)';
}

export function buildDemoPlanningsForTeacher(teacher: UserProfile): DemoTeacherPlanningDetail[] {
  const count = getTeacherPlanningCount(teacher);
  const subjects =
    teacher.assigned_subjects && teacher.assigned_subjects.length > 0
      ? teacher.assigned_subjects.map(resolveSubjectDisplay)
      : [teacher.specialty || 'Asignatura Curricular'];
  const groups =
    teacher.assigned_groups && teacher.assigned_groups.length > 0
      ? teacher.assigned_groups
      : ['5ºA'];
  const campusName = teacher.campus_name || 'Campus Central Primaria';
  const faseNem = resolveFaseNem(campusName);

  const seedOffset = teacher.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const list: DemoTeacherPlanningDetail[] = [];

  for (let i = 0; i < count; i++) {
    const bankItem = TOPIC_BANK[(seedOffset + i) % TOPIC_BANK.length];
    const subjectName = subjects[i % subjects.length];
    const groupName = resolveGroupDisplay(groups[i % groups.length], campusName);
    const sessionsCount = 4 + ((seedOffset + i) % 5);
    const decDays = [2, 3, 4, 7, 8, 9, 10, 11, 14, 15, 16, 17, 18, 21, 22, 23];
    const dayNum = String(decDays[(seedOffset + i * 5) % decDays.length]).padStart(2, '0');

    list.push({
      id: `plan-demo-${teacher.id}-${i + 1}`,
      title: `${bankItem.topic} · ${subjectName}`,
      subjectName,
      gradeGroup: groupName,
      campusName,
      faseNem,
      campoFormativo: bankItem.campo,
      ejeArticulador: bankItem.eje,
      pdaOficial: bankItem.pda,
      duration: `${sessionsCount} sesiones de 50 min`,
      sessionsCount,
      updatedAt: `2026-12-${dayNum}`,
      vaultStatus: 'Sincronizada en Bóveda Curricular',
      proposito: `Que las y los estudiantes de ${groupName} consoliden los aprendizajes de ${subjectName} mediante la metodología de proyecto formativo: ${bankItem.topic.toLowerCase()}.`,
      inicio: `00–15 min · Activación de saberes previos mediante pregunta detonadora contextualizada al entorno de ${campusName}. Socialización en plenaria del propósito de la sesión y recuperación de conceptos clave de ${subjectName}.`,
      desarrollo: `15–40 min · Trabajo colaborativo en equipos de 3 a 4 integrantes. Análisis guiado del caso práctico, registro estructurado de evidencias y acompañamiento docente focalizado para atender dudas específicas del grupo ${groupName}.`,
      cierre: `40–50 min · Puesta en común de hallazgos, verificación rápida contra la rúbrica analítica, retroalimentación formativa del docente y registro de avance para la siguiente sesión.`,
      materiales: [
        'Cuaderno de trabajo y guía impresa de actividades NEM',
        'Pizarrón interactivo / Proyector de aula',
        'Rúbrica analítica de evaluación y lista de cotejo',
        `Recursos digitales de ${subjectName} en Bóveda Curricular`,
      ],
      evaluacionRubrica: [
        {
          criterio: 'Comprensión y aplicación conceptual',
          logrado: 'Explica y aplica con precisión los conceptos centrales en el producto final.',
          enProceso: 'Identifica los conceptos principales pero requiere apoyo para transferirlos.',
        },
        {
          criterio: 'Argumentación y evidencia',
          logrado: 'Sustenta sus conclusiones con datos, ejemplos verificables y vocabulario propio.',
          enProceso: 'Presenta conclusiones parciales con escaso respaldo de evidencia.',
        },
        {
          criterio: 'Colaboración y entrega puntual',
          logrado: 'Participa activamente, cumple acuerdos del equipo y entrega completo en tiempo.',
          enProceso: 'Requiere seguimiento docente para completar su parte del entregable.',
        },
      ],
      entregableTangible: bankItem.entregable,
    });
  }

  return list;
}
