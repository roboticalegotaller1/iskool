/**
 * Configuración centralizada del Sandbox Interactivo "Cuentas demo" (CCT: 0001)
 * Estándares internacionales de demostración multi-rol sin fricción:
 * - Aislamiento estricto: lectura real de Bóveda Curricular con cero escritura en disco.
 * - 7 Cuentas Interconectadas (Dirección, Docente Aula, Idiomas 3D, Familia, Alumna, Control Escolar, Visión CEO).
 * - Recorrido guiado no intrusivo, minimizable o descartable en 1 clic.
 */

export type DemoRoleKey = 'director' | 'teacher' | 'idiomas' | 'parent' | 'student' | 'staff' | 'ceo';

export interface DemoAccountPersona {
  id: string;
  userId: string;
  role: DemoRoleKey;
  authRole: 'director' | 'teacher' | 'parent' | 'student' | 'billing' | 'ceo';
  roleLabel: string;
  shortLabel: string;
  name: string;
  email: string;
  password: string;
  avatar: string;
  campusId: string;
  campus: string;
  badge: string;
  description: string;
  defaultRoute: string;
  secondaryRoute?: string;
  linkedStudentId?: string;
}

export interface DemoStorylineStep {
  id: string;
  stationNumber: number;
  personaId: string;
  role: DemoRoleKey;
  title: string;
  description: string;
  interactionHint: string;
  actionLabel: string;
  targetRoute: string;
  nextPersonaId: string;
  nextRoleLabel: string;
}

export const DEMO_SCHOOL_ID = 'sch-demo-0001';
export const DEMO_SCHOOL_CCT = '0001';
export const DEMO_SCHOOL_NAME = 'Cuentas demo';
export const DEMO_DEFAULT_PASSWORD = 'DemoISkool2026!';

export const DEMO_PERSONAS: DemoAccountPersona[] = [
  {
    id: 'demo-director',
    userId: 'usr-demo-director',
    role: 'director',
    authRole: 'director',
    roleLabel: 'Dirección General',
    shortLabel: 'Dirección',
    name: 'Dra. Beatriz Elena Santillán',
    email: 'demo.director@iskool.mx',
    password: DEMO_DEFAULT_PASSWORD,
    avatar: '/images/students/archive/corporativo_woman_01.webp',
    campusId: 'cmp-demo-pri',
    campus: '3 Planteles · Dirección General',
    badge: 'Visión Directivo',
    description: 'Supervisa los 3 planteles, 650 alumnos, 45 docentes y 50 cuentas de organización en vivo.',
    defaultRoute: '/director',
    secondaryRoute: '/admin',
  },
  {
    id: 'demo-teacher',
    userId: 'usr-demo-teacher-1',
    role: 'teacher',
    authRole: 'teacher',
    roleLabel: 'Docente Titular NEM & Aula',
    shortLabel: 'Docente Aula',
    name: 'Prof. Alejandro Ruiz',
    email: 'demo.docente@iskool.mx',
    password: DEMO_DEFAULT_PASSWORD,
    avatar: '/images/students/archive/corporativo_man_01.webp',
    campusId: 'cmp-demo-pri',
    campus: 'Campus Central Primaria · Tutor 5°A',
    badge: 'Piloto 3 Pasos + XP',
    description: 'Pasa lista visual en 1 clic, abona +50 XP a Valentina y envía Resumen 5s a familias en vivo.',
    defaultRoute: '/teacher',
  },
  {
    id: 'demo-idiomas',
    userId: 'usr-demo-teacher-2',
    role: 'idiomas',
    authRole: 'teacher',
    roleLabel: 'Centro de Idiomas 3D & Historia',
    shortLabel: 'Idiomas 3D',
    name: 'Profa. Claire Dubois',
    email: 'demo.idiomas@iskool.mx',
    password: DEMO_DEFAULT_PASSWORD,
    avatar: '/images/students/archive/corporativo_woman_03.webp',
    campusId: 'cmp-demo-sec',
    campus: 'Centro de Idiomas 3D · Inglés & Francés',
    badge: 'Avatares 60 FPS + Voz',
    description: 'Explora mentores 3D en Inglés/Francés y personajes históricos en 1ª persona con voz neuronal.',
    defaultRoute: '/teacher/idiomas',
  },
  {
    id: 'demo-parent',
    userId: 'usr-demo-parent-01',
    role: 'parent',
    authRole: 'parent',
    roleLabel: 'Madre / Familia',
    shortLabel: 'Familia',
    name: 'Laura Gómez de Mendoza',
    email: 'demo.familia@iskool.mx',
    password: DEMO_DEFAULT_PASSWORD,
    avatar: '/images/students/archive/corporativo_woman_02.webp',
    campusId: 'cmp-demo-pri',
    campus: 'Portal Familiar · Mamá de Valentina (5°A Primaria)',
    badge: 'Resumen 5s + Voz',
    description: 'Recibe al instante la asistencia de Valentina, escucha su audio neuronal y firma en 1 toque.',
    defaultRoute: '/parent',
    linkedStudentId: 'std-demo-01',
  },
  {
    id: 'demo-student',
    userId: 'std-demo-01',
    role: 'student',
    authRole: 'student',
    roleLabel: 'Alumna Protagonista',
    shortLabel: 'Alumna',
    name: 'Valentina Mendoza Gómez',
    email: 'demo.alumno@iskool.mx',
    password: DEMO_DEFAULT_PASSWORD,
    avatar: '/images/students/archive/primaria_girl_01.webp',
    campusId: 'cmp-demo-pri',
    campus: 'Campus Central Primaria · 5°A Bilingüe',
    badge: 'XP + Misiones + 3D',
    description: 'Recibe en vivo los +50 XP del docente, cuida su mascota elemental y practica idiomas 3D.',
    defaultRoute: '/student',
    secondaryRoute: '/student/idiomas',
    linkedStudentId: 'std-demo-01',
  },
  {
    id: 'demo-staff',
    userId: 'usr-demo-staff-1',
    role: 'staff',
    authRole: 'billing',
    roleLabel: 'Control Escolar & Finanzas',
    shortLabel: 'Control Escolar',
    name: 'Lic. Sofía Reyes Aguilar',
    email: 'demo.control@iskool.mx',
    password: DEMO_DEFAULT_PASSWORD,
    avatar: '/images/students/archive/corporativo_woman_02.webp',
    campusId: 'cmp-demo-pri',
    campus: 'Control Escolar & Finanzas CFDI 4.0',
    badge: 'Becas y CFDI 4.0',
    description: 'Supervisa colegiaturas, becas, 9 folios vencidos, dispersión de nómina SPEI y timbrado CFDI sin alterar datos reales.',
    defaultRoute: '/coordinator/billing',
    secondaryRoute: '/coordinator',
  },
  {
    id: 'demo-ceo',
    userId: 'usr-demo-ceo',
    role: 'ceo',
    authRole: 'ceo',
    roleLabel: 'Visión CEO · Holding',
    shortLabel: 'Visión CEO',
    name: 'Mtro. Alejandro Villarreal',
    email: 'demo.ceo@iskool.mx',
    password: DEMO_DEFAULT_PASSWORD,
    avatar: '/images/students/archive/corporativo_man_01.webp',
    campusId: 'cmp-demo-pri',
    campus: '3 Planteles · Corporativo Multi-Plantel',
    badge: 'Rol 7 · Visión CEO',
    description: 'Conecta los 3 planteles, 650 alumnos, 45 docentes, CRM 360°, simulador financiero, iMail y focos críticos en vivo.',
    defaultRoute: '/admin/ceo?schoolId=sch-demo-0001',
    secondaryRoute: '/admin',
  },
];

export const DEMO_STORYLINE_STEPS: DemoStorylineStep[] = [
  {
    id: 'story-1-director',
    stationNumber: 1,
    personaId: 'demo-director',
    role: 'director',
    title: '1. Dirección General · Visión Multi-Plantel',
    description: 'Audita los 3 planteles (Primaria, Secundaria y Preparatoria), 650 alumnos, alertas académicas y pulso operativo sin tocar datos reales.',
    interactionHint: 'Revisa los semáforos y salta al aula del Prof. Alejandro Ruiz.',
    actionLabel: 'Ver Panel Directivo',
    targetRoute: '/director',
    nextPersonaId: 'demo-teacher',
    nextRoleLabel: 'Ir como Docente Aula',
  },
  {
    id: 'story-2-teacher',
    stationNumber: 2,
    personaId: 'demo-teacher',
    role: 'teacher',
    title: '2. Docente Titular · Pase de Lista +50 XP',
    description: 'Pulsa "Marcar Todo Presente + Sello" y "Enviar Resumen 5s a Padres". Abonarás +50 XP a Valentina en vivo.',
    interactionHint: 'Las planeaciones leen la Bóveda Curricular real con 0 escritura en disco.',
    actionLabel: 'Abrir Piloto de Aula',
    targetRoute: '/teacher',
    nextPersonaId: 'demo-parent',
    nextRoleLabel: 'Ver efecto en Familia',
  },
  {
    id: 'story-3-parent',
    stationNumber: 3,
    personaId: 'demo-parent',
    role: 'parent',
    title: '3. Portal Familiar · Resumen 5s y Voz Neuronal',
    description: 'Como mamá de Valentina, escucha su audio neuronal en Francés/Inglés y pulsa "Firmar de Enterado en 1 Toque".',
    interactionHint: 'Tu firma regresa al instante al tablero del docente.',
    actionLabel: 'Ir al Portal Familiar',
    targetRoute: '/parent',
    nextPersonaId: 'demo-idiomas',
    nextRoleLabel: 'Probar Idiomas 3D',
  },
  {
    id: 'story-4-idiomas',
    stationNumber: 4,
    personaId: 'demo-idiomas',
    role: 'idiomas',
    title: '4. Idiomas 3D (60 FPS) & Personajes en 1ª Persona',
    description: 'Prueba a Prof. Claire/Arthur a 60 FPS y conversa con personajes históricos en 1ª persona con voz de estudio.',
    interactionHint: 'Las consultas históricas respetan la Bóveda con 0 escrituras en disco.',
    actionLabel: 'Abrir Estudio 3D',
    targetRoute: '/teacher/idiomas',
    nextPersonaId: 'demo-student',
    nextRoleLabel: 'Entrar como Alumna',
  },
  {
    id: 'story-5-student',
    stationNumber: 5,
    personaId: 'demo-student',
    role: 'student',
    title: '5. Portal del Alumno · XP, Monedas y Mascota',
    description: 'Comprueba los +50 XP y monedas ganados en clase, explora misiones gamificadas e ingresa al laboratorio 3D.',
    interactionHint: 'Valentina comparte el mismo ID vinculado (std-demo-01) con su mamá.',
    actionLabel: 'Ver Portal Alumna',
    targetRoute: '/student',
    nextPersonaId: 'demo-staff',
    nextRoleLabel: 'Ir a Control Escolar',
  },
  {
    id: 'story-6-staff',
    stationNumber: 6,
    personaId: 'demo-staff',
    role: 'staff',
    title: '6. Control Escolar & Finanzas CFDI 4.0',
    description: 'Inspecciona estados de cuenta, 9 folios vencidos, dispersión de nómina SPEI y recibos CFDI 4.0 con aislamiento total.',
    interactionHint: 'Resuelve un cobro o lote SPEI y sube a la consola ejecutiva Visión CEO.',
    actionLabel: 'Ver Finanzas CFDI',
    targetRoute: '/coordinator/billing',
    nextPersonaId: 'demo-ceo',
    nextRoleLabel: 'Ir a Visión CEO',
  },
  {
    id: 'story-7-ceo',
    stationNumber: 7,
    personaId: 'demo-ceo',
    role: 'ceo',
    title: '7. Visión CEO · Gobierno Multi-Plantel (650 Alumnos)',
    description: 'Conecta los 3 planteles, 45 docentes, CRM 360°, iMail Ejecutivo y despacho resolutivo sobre los 650 alumnos en vivo.',
    interactionHint: 'Prueba un flujo operativo, atiende un foco crítico o vuelve al inicio del recorrido.',
    actionLabel: 'Abrir Visión CEO',
    targetRoute: '/admin/ceo?schoolId=sch-demo-0001',
    nextPersonaId: 'demo-director',
    nextRoleLabel: 'Volver a Dirección',
  },
];

export function getDemoPersonaByEmail(email?: string | null): DemoAccountPersona | undefined {
  const clean = (email || '').toLowerCase().trim();
  if (!clean) return undefined;
  if (clean === 'demo.staff@iskool.mx') {
    return DEMO_PERSONAS.find((p) => p.id === 'demo-staff');
  }
  return DEMO_PERSONAS.find((p) => p.email.toLowerCase() === clean);
}

/**
 * Determina si una sesión, correo, usuario o colegio pertenece al entorno Demo Sandbox.
 * Garantiza que nunca se escriba ni elimine nada en la Bóveda Curricular desde cuentas demo.
 */
export function isDemoSandboxContext(params: {
  email?: string | null;
  schoolId?: string | null;
  cct?: string | null;
  tenantId?: string | null;
  userId?: string | null;
}): boolean {
  const email = (params.email || '').toLowerCase().trim();
  const schoolId = (params.schoolId || '').toLowerCase().trim();
  const cct = (params.cct || '').trim();
  const tenantId = (params.tenantId || '').toLowerCase().trim();
  const userId = (params.userId || '').toLowerCase().trim();

  if (email.startsWith('demo.') && email.endsWith('@iskool.mx')) return true;
  if (email.endsWith('@demo.iskool.mx')) return true;
  if (email === 'lucia.demo@iskool.mx' || email === 'roberto.demo@iskool.mx') return true;
  if (schoolId === DEMO_SCHOOL_ID || schoolId === 'cuentas-demo' || schoolId.includes('sch-demo-')) return true;
  if (cct === DEMO_SCHOOL_CCT) return true;
  if (tenantId === 'demo' || tenantId === 'sandbox') return true;
  if (userId.startsWith('usr-demo-') || userId.startsWith('std-demo-') || userId.includes('sch-demo-0001')) return true;
  return false;
}
