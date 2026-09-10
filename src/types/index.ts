/**
 * @typedef {('superadmin' | 'admin' | 'director' | 'coordinator' | 'teacher' | 'student' | 'parent')} UserRole
 * @description Define los roles de usuario autorizados en el sistema escolar.
 * @stateImpact Determina los permisos en el frontend, accesibilidad de rutas y control RLS.
 */
export type UserRole = 'owner' | 'superadmin' | 'admin' | 'director' | 'coordinator' | 'billing' | 'teacher' | 'student' | 'parent' | 'tutor';

export const ROLE_HIERARCHY_LEVEL: Record<UserRole, number> = {
  superadmin: 1, // Directivos de ISkool (Super Usuario Global de Plataforma)
  admin: 1,      // Directivos de ISkool (Super Usuario Global de Plataforma)
  owner: 2,      // Dueño de Escuela / Presidencia (Restringido exclusivamente a su school_id)
  director: 3,   // Director General de Plantel
  coordinator: 4,
  billing: 4,
  teacher: 5,
  student: 6,
  parent: 6,
  tutor: 6
};

/**
 * Predicado de Super Usuario de Plataforma:
 * Solo aplica a las 3 cuentas de directivos de ISkool (superadmin / admin global).
 * Los dueños de escuela hacia abajo quedan estrictamente circunscritos a su propio sistema escolar.
 */
export const isPlatformSuperUser = (userProfile?: { role?: string; email?: string } | null): boolean => {
  if (!userProfile) return false;
  return userProfile.role === 'superadmin' || userProfile.role === 'admin';
};

/**
 * Resolver de Escuela Eficaz (Single Source of Truth para Aislamiento Multi-Colegio):
 * Garantiza cero desincronización:
 * 1. Para no superusuarios con school_id asignado, devuelve de forma inmutable su propio colegio.
 * 2. Para superusuarios, respeta la escuela activa seleccionada en el conmutador de plataforma.
 */
export const resolveEffectiveSchoolId = (
  userProfile?: { role?: string; email?: string; school_id?: string } | null,
  activeSchoolId?: string | null,
  fallback: string = 'sch-jjrosseau'
): string => {
  if (userProfile && !isPlatformSuperUser(userProfile) && userProfile.school_id) {
    return userProfile.school_id === 'sch-jjr' ? 'sch-jjrosseau' : userProfile.school_id;
  }
  if (activeSchoolId) {
    return activeSchoolId === 'sch-jjr' ? 'sch-jjrosseau' : activeSchoolId;
  }
  return fallback;
};

/**
 * Regla de Mando Inmediato Superior:
 * Un operador solo puede gestionar, supervisar o restringir cuentas con nivel jerárquico estrictamente inferior.
 */
export const canManageTargetRole = (operatorRole: UserRole, targetRole: UserRole): boolean => {
  const operatorLevel = ROLE_HIERARCHY_LEVEL[operatorRole] ?? 99;
  const targetLevel = ROLE_HIERARCHY_LEVEL[targetRole] ?? 99;
  return operatorLevel < targetLevel;
};

export interface RestrictedTopicItem {
  id: string;
  topicTitle: string;
  subjectName?: string;
  grade?: string;
  reason?: string;
  restrictedAt: string;
  status: 'bloqueado' | 'requiere_revision';
}

/**
 * Límites que el Dueño de Empresa impone a los Directores de Plantel
 */
export interface DirectorLimitsSettings {
  canManageCampuses: boolean;             // Si el director puede crear/eliminar campus
  canModifyTuitionFees: boolean;          // Si el director puede cambiar costos de colegiatura
  canRegisterCoordinators: boolean;       // Si el director puede registrar nuevos coordinadores
  canPurgeCurricularVault: boolean;       // Si el director puede purgar contenidos de la Bóveda Curricular
  maxScholarshipDiscountPercent: number;  // Porcentaje tope de beca directa autorizable por dirección (default 50%)
}

export interface SchoolGovernanceSettings {
  allowCoordinatorBilling: boolean;       // Acceso de coordinadores a cobranza
  allowCoordinatorDelete?: boolean;      // Permiso para que coordinadores den de baja alumnos/grupos
  allowTeacherGradeEditing: boolean;     // Modificación de boletas por docentes
  allowStudentGamification: boolean;     // Tienda mágica y recompensas
  allowAiAssistantTeachers: boolean;     // Motor de IA Pedagógica para docentes
  allowAiAssistantStudents: boolean;     // Motor de IA Pedagógica para alumnos
  restrictParentContactForTeachers: boolean; // Ocultar datos de contacto familiares a docentes
  requirePlanningApproval: boolean;      // Aprobación previa de planeaciones en la Bóveda Curricular
  restrictedTopics: RestrictedTopicItem[]; // Temáticas curriculares restringidas
}

/**
 * @interface UserProfile
 * @description Datos básicos del perfil general de cualquier usuario.
 * @database Mapea a la tabla `public.profiles`.
 * @relation Relación 1:1 con `auth.users` de Supabase. Referenciado en `Student` y `TeacherAssignment`.
 * @stateImpact Almacenado en `AuthContext` tras el inicio de sesión del usuario.
 */
export interface Campus {
  id: string;
  school_id: string;
  name: string; // e.g. "Primaria Jardines", "Primaria Torres", "Secundaria Torres"
  level: 'primaria' | 'secundaria' | 'preparatoria';
  grades: string[]; // e.g. ["1º", "2º", "3º", "4º", "5º", "6º"]
  address?: string;
  phone?: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  school_id?: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  email: string;
  phone?: string;
  birth_date?: string; // Fecha de nacimiento (ISO YYYY-MM-DD)
  age?: number; // Edad en años cumplidos
  campus_id?: string;
  campus_name?: string;
  ai_tokens_consumed?: number; // Contador de tokens consumidos del Asistente Pedagógico IA
  is_blocked?: boolean; // Estado de bloqueo/cancelación de cuenta
  temporary_password?: string; // Contraseña de acceso (6 caracteres alfanuméricos)
  assigned_subjects?: string[];
  assigned_groups?: string[];
  created_at: string;
  updated_at: string;
}

/**
 * @interface School
 * @description Representa un plantel o escuela en el sistema.
 * @database Mapea a la tabla `public.schools`.
 * @relation Raíz jerárquica. Padre de `AcademicYear`, `Group`, `Subject`.
 * @stateImpact Leído en configuraciones iniciales por `useSchoolAdminStore`.
 */
export interface School {
  id: string;
  name: string;
  cct?: string; // Clave de Centro de Trabajo (SEP)
  address?: string;
  phone?: string;
  logoUrl?: string;
  campuses?: Campus[];
  created_at: string;
}

export interface Institution {
  id: string;
  name: string;
  tagline?: string;
  cct: string;
  logoUrl?: string;
  isTestCase?: boolean;
  status: 'active' | 'inactive' | 'trial';
  createdAt: string;
  address?: string;
  phone?: string;
  website?: string;
  coordinatorName?: string;
  campusesCount: number;
  studentsCount: number;
  teachersCount: number;
  aiTokensConsumed: number;
  currency?: string;
  settings?: SchoolSettings;
  governance?: SchoolGovernanceSettings;
  directorLimits?: DirectorLimitsSettings;
}

/**
 * @interface AcademicYear
 * @description Representa un ciclo escolar (e.g., 2025-2026).
 * @database Mapea a la tabla `public.academic_years`.
 * @relation Pertenece a `School` (N:1). Padre de `AcademicPeriod` y `Group`.
 * @stateImpact Define el ciclo activo en `useSchoolAdminStore`.
 */
export interface AcademicYear {
  id: string;
  school_id: string;
  name: string; // e.g., "2025-2026"
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

/**
 * @interface AcademicPeriod
 * @description Representa bloques de evaluación dentro de un ciclo escolar (e.g., Bimestre 1).
 * @database Mapea a la tabla `public.academic_periods`.
 * @relation Pertenece a `AcademicYear` (N:1). Usado para filtrar `Grade`.
 * @stateImpact Utilizado para segmentar boletas formativas en el panel docente.
 */
export interface AcademicPeriod {
  id: string;
  academic_year_id: string;
  name: string; // e.g., "Bimestre 1", "Bimestre 2"
  start_date: string;
  end_date: string;
  created_at: string;
}

/**
 * @interface LevelGrade
 * @description Cataloga niveles educativos (primaria, secundaria, preparatoria) y sus grados respectivos.
 * @database Mapea a la tabla `public.levels_grades`.
 * @relation Referenciado en `Group` y `Subject`.
 * @stateImpact Determina la UI adaptada (Mascota, RPG, Créditos de Financiamiento) que verá el estudiante.
 */
export interface LevelGrade {
  id: string;
  level_name: 'primaria' | 'secundaria' | 'preparatoria';
  grade_name: string; // e.g., "1º", "2º", "3º", "1º Semestre"
  created_at: string;
}

/**
 * @interface Group
 * @description Define un grupo escolar (e.g., 4º "A").
 * @database Mapea a la tabla `public.groups`.
 * @relation Vinculado a `School` (N:1), `LevelGrade` (N:1), y `AcademicYear` (N:1). Contiene múltiples `Enrollment`.
 * @stateImpact Utilizado en RLS de profesores para filtrar alumnos evaluados.
 */
export interface Group {
  id: string;
  school_id: string;
  campus_id?: string;
  campus_name?: string; // "Primaria Jardines", "Primaria Torres", "Secundaria Torres"
  level_grade_id: string;
  academic_year_id: string;
  name: string; // e.g., "A", "B"
  created_at: string;
  
  level?: string;
  grade?: string;
  student_ids?: string[];

  // Relaciones opcionales cargadas en consultas
  level_grade?: LevelGrade;
  academic_year?: AcademicYear;
}

export interface GroupAnnualPlan {
  group_id: string;
  group_name: string;
  campus_name: string;
  grade: string;
  plan_title: string;
  term_1: string;
  term_2: string;
  term_3: string;
  pda_focus?: string;
  project_title?: string;
  file_url?: string;
  file_name?: string;
  updated_at: string;
}

export interface SyllabusTopic {
  block: string;
  title: string;
  weeks: string;
  description: string;
  deliverable?: string;
}

/**
 * @interface Subject
 * @description Materia académica dictada en el colegio (e.g., Matemáticas, Robótica).
 * @database Mapea a la tabla `public.subjects`.
 * @relation Vinculado a `School` (N:1) y `LevelGrade` (N:1). Referenciada en `Mission` y `Grade`.
 * @stateImpact Filtra el mapa de misiones y la segmentación de evidencias en el portafolio del estudiante.
 */
export interface Subject {
  id: string;
  school_id: string;
  campus_id?: string;
  campus_name?: string;
  level_grade_id: string;
  name: string; // e.g., "Matemáticas", "Robótica", "Basquetbol"
  sep_code?: string;
  is_elective?: boolean; // true para materias optativas (Actividad Física, Basquetbol, Música, Robótica, Danza)
  category?: 'curricular' | 'optativa';
  workshop_category?: 'deportivo' | 'tecnologico' | 'artistico' | 'academico' | 'cientifico';
  description?: string;
  instructor_name?: string;
  schedule?: string;
  image_url?: string; // Portada o logotipo personalizado del taller
  syllabus_url?: string; // Archivo del temario / plan de estudio subido
  syllabus_filename?: string; // Nombre del archivo del temario
  syllabus_topics?: SyllabusTopic[];
  group_annual_plans?: Record<string, GroupAnnualPlan>;
  assigned_group_ids?: string[];
  created_at: string;
}

/**
 * @interface Student
 * @description Perfil específico del rol estudiante.
 * @database Mapea a la tabla `public.students`.
 * @relation Vinculado a `UserProfile` (1:1), `School` (N:1). Tiene 1:N `Enrollment` e `Inventory`.
 * @stateImpact Identificador clave de acceso para RLS en consultas de stats y portafolio.
 */
export interface Student {
  id: string; // references UserProfile
  school_id: string;
  curp?: string;
  birth_date?: string;
  enrollment_id?: string; // Matrícula
  created_at: string;

  // Relaciones opcionales
  profile?: UserProfile;
}

/**
 * @interface ParentStudent
 * @description Relación de vinculación entre un tutor y un estudiante.
 * @database Mapea a la tabla `public.parent_students`.
 * @relation Vincula `UserProfile` del padre (N:1) con `Student` (N:1).
 * @stateImpact Permite al portal de tutores visualizar únicamente los logros del estudiante vinculado.
 */
export interface ParentStudent {
  parent_id: string;
  student_id: string;
  relationship: string; // "Padre", "Madre", "Tutor"
}

/**
 * @interface Enrollment
 * @description Inscripción de un estudiante en un grupo específico para un ciclo escolar.
 * @database Mapea a la tabla `public.enrollments`.
 * @relation Vincula `Student` (N:1) con `Group` (N:1).
 * @stateImpact Utilizado por `useSchoolAdminStore` para la distribución grupal.
 */
export interface Enrollment {
  id: string;
  student_id: string;
  group_id: string;
  created_at: string;

  // Relaciones opcionales
  student?: Student;
  group?: Group;
}

/**
 * @interface TeacherAssignment
 * @description Asignación que define qué docente imparte qué materia en qué grupo.
 * @database Mapea a la tabla `public.teacher_assignments`.
 * @relation Vincula `UserProfile` del profesor (N:1), `Group` (N:1), y `Subject` (N:1).
 * @stateImpact Validado en RLS para certificar qué grupos puede consultar un docente.
 */
export interface TeacherAssignment {
  id: string;
  teacher_id: string; // references UserProfile
  group_id: string;
  subject_id: string;
  created_at: string;

  // Relaciones opcionales
  teacher?: UserProfile;
  group?: Group;
  subject?: Subject;
}

/**
 * @typedef {('presente' | 'falta' | 'retardo' | 'justificado')} AttendanceStatus
 * @description Opciones de registro de asistencia diaria.
 */
export type AttendanceStatus = 'presente' | 'falta' | 'retardo' | 'justificado';

/**
 * @interface Attendance
 * @description Registro de asistencia de un estudiante en una fecha determinada.
 * @database Mapea a la tabla `public.attendance`.
 * @relation Vincula `Student` (N:1) y `Group` (N:1). Registrado por un `UserProfile` docente.
 * @stateImpact Controlado y actualizado por el panel del docente en `useSchoolAdminStore`.
 */
export interface Attendance {
  id: string;
  school_id?: string;
  student_id: string;
  group_id: string;
  subject_id?: string; // null para asistencia general del día, o específico por materia
  date: string;
  status: AttendanceStatus;
  comments?: string;
  registered_by: string; // references UserProfile
  created_at: string;
}

/**
 * @interface Grade
 * @description Calificación cuantitativa ordinaria asignada a un estudiante en una materia y periodo.
 * @database Mapea a la tabla `public.grades`.
 * @relation Vincula `Student` (N:1), `Subject` (N:1), y `AcademicPeriod` (N:1).
 * @stateImpact Traducido y consolidado para la boleta SEP oficial en `useSchoolAdminStore`.
 */
export interface Grade {
  id: string;
  school_id?: string;
  student_id: string;
  subject_id: string;
  period_id: string; // references AcademicPeriod
  score: number; // Decimal (5.0 a 10.0)
  comments?: string;
  created_at: string;
  updated_at: string;
}

/**
 * @interface StudentStats
 * @description Estadísticas de gamificación y progresión de nivel de un estudiante.
 * @database Mapea a la tabla `public.student_stats`.
 * @relation Vinculado a `Student` (1:1).
 * @stateImpact Actualizado por acciones del almacén (`useStudentStore`, `addXpAndCoins`). Validado bajo políticas RLS por estudiante y docente.
 */
export interface StudentStats {
  student_id: string;
  school_id?: string;
  xp: number;
  level: number;
  coins: number;
  current_streak: number;
  max_streak: number;
  last_active_date?: string;
  updated_at: string;

  // RPG (Solo nivel Secundaria)
  rpg_class?: 'guerrero' | 'mago' | 'curandero' | 'explorador';
  attribute_strength?: number;
  attribute_intelligence?: number;
  attribute_defense?: number;
  skill_points?: number;

  // Preparatoria (Proyectos Productivos)
  funding_credits?: number;

  // Tamagotchi RPG Mascotas
  pet_stage?: 'egg' | 'baby' | 'adult' | 'mystic';
  pet_energy?: number;
  pet_happiness?: number;

  // Afinidades Elementales / Stats NEM (Nueva Escuela Mexicana)
  stat_lenguajes?: number;
  stat_saberes?: number;
  stat_etica?: number;
  stat_de_lo_humano?: number;
}

/**
 * @interface StudentAvatar
 * @description Configuración estética del avatar del alumno y el estado de su mascota.
 * @database Mapea a la tabla `public.student_avatars`.
 * @relation Vinculado a `Student` (1:1).
 * @stateImpact Almacenado y editado mediante `changeAvatar` en `useStudentStore`.
 */
export interface StudentAvatar {
  student_id: string;
  avatar_name: string;
  hair_style: string;
  hair_color: string;
  eyes_style: string;
  outfit_style: string;
  outfit_color: string;
  background_style: string;
  unlocked_items: string[];
  updated_at: string;

  // Mascota Virtual (Solo nivel Primaria Baja)
  pet_type?: 'dragon' | 'lobo' | 'venado' | 'gusano' | 'gatito';
  pet_name?: string;
  pet_hunger?: number;
  pet_happiness?: number;
  pet_outfit?: string;

  // RPG Customizer fields
  gender?: 'male' | 'female';
  rpg_class?: string;
  head_type?: string;
  skin_tone?: string;
}

/**
 * @typedef {('academic' | 'social' | 'persistence' | 'creative')} BadgeCategory
 * @description Categorías de medallas e insignias escolares.
 */
export type BadgeCategory = 'academic' | 'social' | 'persistence' | 'creative';

/**
 * @interface Badge
 * @description Catálogo de insignias que un estudiante puede ganar.
 * @database Mapea a la tabla `public.badges`.
 * @relation Referenciada en `StudentBadge` (1:N).
 * @stateImpact Listado global en la tienda de medallas de `useGamificationStore`.
 */
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_name: string;
  category: BadgeCategory;
  xp_required: number;
  created_at: string;
}

/**
 * @interface StudentBadge
 * @description Registro de insignias obtenidas por un estudiante.
 * @database Mapea a la tabla `public.student_badges`.
 * @relation Vincula `Student` (N:1) y `Badge` (N:1).
 * @stateImpact Administrado por `unlockBadge` en `useGamificationStore`.
 */
export interface StudentBadge {
  student_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge; // Relación anidada para renderizado directo
}

/**
 * @interface Mission
 * @description Misión del mapa de aprendizaje que engloba una narrativa y varios retos.
 * @database Mapea a la tabla `public.missions`.
 * @relation Vinculado a `School` (N:1), `Subject` (N:1), y `LevelGrade` (N:1). Padre de `Quest`.
 * @stateImpact Cargado dinámicamente mediante `fetchMissions` en `useGamificationStore`.
 */
export interface Mission {
  id: string;
  school_id: string;
  subject_id: string;
  level_grade_id: string;
  title: string;
  description: string;
  story_intro: string;
  map_position_x: number;
  map_position_y: number;
  is_active: boolean;
  created_at: string;
  campo_formativo_id?: string;
  pda_ids?: string[];
  
  // Relaciones opcionales cargadas
  subject?: Subject;
  quests?: Quest[];
}

/**
 * @typedef {('quiz' | 'portfolio_submission' | 'exam' | 'reading' | 'timed_reading')} QuestType
 * @description Tipos de retos escolares soportados.
 */
export type QuestType = 'quiz' | 'portfolio_submission' | 'exam' | 'reading' | 'timed_reading';

/**
 * @interface QuizQuestion
 * @description Pregunta de opción múltiple con explicaciones retroalimentarias.
 */
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

/**
 * @interface ReadingQuestContent
 * @description Reto de comprensión lectora gamificado (Grimorio Mágico y Duelo Pixi).
 */
export interface ReadingQuestContent {
  readingText: string;
  timeLimitSeconds: number;
  wordCount: number;
  targetWpm?: number;
  bossName?: string;
  bossHp?: number;
  storyIntro?: string;
  questions: QuizQuestion[];
}

/**
 * @interface QuizContent
 * @description Estructura de cuestionario común para Quests de tipo 'quiz'.
 */
export interface QuizContent {
  questions: QuizQuestion[];
}

/**
 * @interface ExamContent
 * @description Reto especial tipo jefe de gremio (Boss Battle RPG) para exámenes.
 */
export interface ExamContent {
  questions: QuizQuestion[];
  bossName: string;
  bossHp: number;
  bossMaxDmg: number;
  storyIntro: string;
  statBoost?: {
    strength?: number;
    intelligence?: number;
    defense?: number;
  };
  customLoot?: string;
}

/**
 * @interface SubmissionContent
 * @description Parámetros y formatos aceptados para retos de entrega de evidencias.
 */
export interface SubmissionContent {
  instructions: string;
  acceptedFormats: string[]; // e.g., ["image", "audio", "video"]
}

/**
 * @interface Quest
 * @description Reto o actividad dentro de una misión académica.
 * @database Mapea a la tabla `public.quests`.
 * @relation Pertenece a `Mission` (N:1). Referenciado en `QuestAttempt` y `PortfolioItem`.
 * @stateImpact Define el contenido de las preguntas y formatos de evidencias que lee la UI del estudiante.
 */
export interface Quest {
  id: string;
  mission_id: string;
  title: string;
  description: string;
  type: QuestType;
  sequence_order: number;
  xp_reward: number;
  coins_reward: number;
  content: QuizContent | SubmissionContent | ExamContent | ReadingQuestContent;
  created_at: string;
  campo_formativo_id?: string;
  pda_ids?: string[];
  campos_formativos?: string[];
  ejes_articuladores?: string[];
  pdas?: string[];
  required_level?: number;
}

/**
 * @interface QuestAttempt
 * @description Registro detallado del intento de resolución de un reto por un estudiante.
 * @database Mapea a la tabla `public.quest_attempts`.
 * @relation Vincula `Student` (N:1) y `Quest` (N:1).
 * @stateImpact Actualizado por `submitQuiz` y `submitExam` en `useGamificationStore`.
 */
export interface QuestAttempt {
  id: string;
  student_id: string;
  quest_id: string;
  score: number; // Porcentaje de 0.00 a 100.00
  is_completed: boolean;
  answers?: Record<string, string | number>;
  feedback?: string;
  created_at: string;
}

/**
 * @typedef {('draft' | 'submitted' | 'approved' | 'needs_revision')} PortfolioItemStatus
 * @description Estado de revisión formativa de una evidencia.
 */
export type PortfolioItemStatus = 'draft' | 'submitted' | 'approved' | 'needs_revision';

/**
 * @typedef {('image' | 'audio' | 'video' | 'pdf' | 'link')} PortfolioFileType
 * @description Formato multimedia de la evidencia cargada.
 */
export type PortfolioFileType = 'image' | 'audio' | 'video' | 'pdf' | 'link';

/**
 * @interface PortfolioItem
 * @description Evidencia de aprendizaje cargada por el estudiante para evaluación del docente.
 * @database Mapea a la tabla `public.portfolio_items`.
 * @relation Vincula `Student` (N:1), `Subject` (N:1), y opcionalmente `Quest` (N:1). Contiene 1:N `PortfolioFeedback`.
 * @stateImpact Almacenado en `usePortfolioStore`. Sujeto a políticas RLS por estudiante (ver propios) y docente (filtrado por group_id).
 */
export interface PortfolioItem {
  id: string;
  student_id: string;
  subject_id: string;
  quest_id?: string;
  title: string;
  description?: string;
  file_url: string;
  file_type: PortfolioFileType;
  status: PortfolioItemStatus;
  self_reflection?: string;
  
  // Coevaluación (Preparatoria)
  peer_review_score?: number;
  peer_review_comments?: string;
  
  // Metadatos formativos (NEM)
  campos_formativos?: string[];
  pdas?: string[];
  ejes_articuladores?: string[];
  
  // Desglose de XP otorgado
  xp_breakdown?: {
    scientific?: number;
    critical?: number;
    collaborative?: number;
    communication?: number;
  };
  
  created_at: string;
  updated_at: string;
  isNewRealtime?: boolean;

  // Relaciones anidadas opcionales
  student_profile?: UserProfile;
  subject?: Subject;
  quest?: Quest;
  feedbacks?: PortfolioFeedback[];
}

/**
 * @typedef {('teacher' | 'parent' | 'student' | 'peer')} FeedbackAuthorRole
 * @description Rol del autor que emite una retroalimentación formativa.
 */
export type FeedbackAuthorRole = 'teacher' | 'parent' | 'student' | 'peer' | 'tutor';

/**
 * @interface PortfolioFeedback
 * @description Retroalimentación o comentarios añadidos a una evidencia del portafolio.
 * @database Mapea a la tabla `public.portfolio_feedbacks`.
 * @relation Pertenece a `PortfolioItem` (N:1). Escrito por un `UserProfile` (N:1).
 * @stateImpact Actualizado por `addPortfolioFeedback` en `usePortfolioStore`.
 */
export interface PortfolioFeedback {
  id: string;
  portfolio_item_id: string;
  author_id: string;
  author_role: FeedbackAuthorRole;
  feedback_text: string;
  reactions: Record<string, string[]>; // e.g. {"parents": ["❤️"], "peers": ["👏"]}
  created_at: string;
  author_profile?: UserProfile; // Relación anidada
}

/**
 * @interface GuildBoss
 * @description Parámetros de vida y recompensa del jefe grupal activo en una batalla de examen.
 * @database Mapea a la tabla `public.guild_bosses`.
 * @stateImpact Controla el renderizado de la barra de vida colectiva en `useGamificationStore`.
 */
export interface GuildBoss {
  id: string;
  name: string;
  hp_max: number;
  hp_actual: number;
  xp_reward: number;
}

/**
 * @interface GuildMemberSubmission
 * @description Estado de cumplimiento de tareas de un alumno dentro de un gremio cooperativo.
 */
export interface GuildMemberSubmission {
  student_id: string;
  student_name: string;
  avatar_outfit: string;
  class_name: string;
  status: 'pending' | 'submitted_on_time' | 'submitted_late';
  submitted_at?: string;
}

/**
 * @interface SchoolSettings
 * @description Configuraciones generales de personalización visual e identidad escolar.
 * @database Mapea a la tabla `public.school_settings` (o config escolar en Supabase).
 * @stateImpact Determina la paleta de colores dinámicos inyectada al DOM en `useSchoolAdminStore`.
 */
export interface SchoolSettings {
  isConfigured: boolean;
  name: string;
  website?: string;
  logoUrl?: string;
  cct?: string;
  address?: string;
  phone?: string;
  coordinators: string[];
  teachers: string[];
  themeColors: {
    primary: string;    // Color principal (Formato HSL o HEX)
    secondary: string;  // Color secundario (Formato HSL o HEX)
    accent: string;     // Color de acento (Formato HSL o HEX)
  };
  governance?: SchoolGovernanceSettings;
}

/**
 * @interface DetailedStudent
 * @description Expediente escolar extendido para el control del coordinador escolar.
 * @database Mapea a la tabla `public.students` y join con perfiles médicos e historiales de conducta.
 * @stateImpact Utilizado para listados de control y emisión de reportes en `useSchoolAdminStore`.
 */
export interface DetailedStudent {
  id: string;
  first_name: string;
  second_name?: string;
  last_name_1: string;
  last_name_2?: string;
  birth_date: string;
  curp?: string;
  enrollment_id?: string;
  gender?: string;
  shift?: 'matutino' | 'vespertino' | 'completo';
  status: 'activo' | 'inactivo' | 'baja' | 'suspendido';
  previous_school?: string;
  photo_url?: string;
  
  // Contacto
  address?: string;
  phone?: string;
  email?: string;
  
  // Familiares
  father_name?: string;
  mother_name?: string;
  tutor_name?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  
  // Médicos
  blood_type?: string;
  medical_notes?: string;
  
  // Académicos
  school_id?: string;
  academic_notes?: string;
  level: 'primaria' | 'secundaria' | 'preparatoria';
  grade: string;
  group_id?: string;
  campus_id?: string;
  campus_name?: string; // "Primaria Jardines", "Primaria Torres", "Secundaria Torres"
  temporary_password?: string; // Contraseña generada de 6 dígitos alfanuméricos
  is_blocked?: boolean;

  // Campos adicionales del expediente y finanzas
  pending_payments?: string[];
  scholarship_percentage?: number; // 0, 10, 25, 50, 75, 100
  scholarship_type?: 'ninguna' | 'academica' | 'deportiva' | 'hermanos' | 'sep' | 'socioeconomica';
  scholarship_notes?: string;
  monthly_tuition_override?: number;
  behavior_reports?: { id?: string; date: string; description: string; reporter: string; parent_reply?: string; replied_at?: string }[];
  teacher_notes?: { id?: string; date: string; note: string; teacher_name: string; parent_reply?: string; replied_at?: string }[];
  average_grade?: number; // Promedio general de calificaciones (escala 0-10)
  academic_standing?: 'excelente' | 'notable' | 'suficiente' | 'regular' | 'en_riesgo';
  subject_grades?: { subject_name: string; grade: number }[];
  deleted_at?: string;
  deleted_by?: string;
  deleted_reason?: string;
}

/**
 * @interface StudentDeletionAuditLog
 * @description Registro de auditoría inmutable de alumnos dados de baja o eliminados del sistema.
 * @stateImpact Consultado por el portal de Super Usuario para trazabilidad de fecha y hora exacta.
 */
export interface StudentDeletionAuditLog {
  id: string;
  student_id: string;
  student_name: string;
  enrollment_id?: string;
  curp?: string;
  school_id: string;
  school_name?: string;
  campus_name?: string;
  level: string;
  grade: string;
  deleted_at: string; // ISO timestamp
  deleted_at_formatted: string; // Fecha y hora completa legible
  deleted_by_id: string;
  deleted_by_name: string;
  deleted_by_role: UserRole;
  deleted_by_email: string;
  reason: string;
  previous_status?: string;
}

export interface TuitionPricing {
  id: string;
  school_id?: string;
  level: 'primaria_baja' | 'primaria_alta' | 'secundaria' | 'preparatoria';
  name: string;
  description: string;
  monthly_fee: number;
  annual_inscription: number;
  materials_fee: number;
  due_day: number;
}

export interface FamilyBillingRecord {
  id: string;
  school_id?: string;
  invoiceNumber: string;
  studentId?: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  studentName: string;
  level: string; // 'Primaria' | 'Secundaria' | 'Preparatoria'
  grade: string; // '1º', '2º', '3º', '4º'
  group: string; // 'A' | 'B'
  concept: string;
  baseAmount?: number;
  discountAmount?: number;
  scholarshipPercentage?: number;
  scholarshipType?: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  autoInvoice: boolean;
  paidAt?: string;
}

/**
 * @interface ClassSchedule
 * @description Programación o bloque de horario de una materia y docente para un grupo.
 * @database Mapea a la tabla `public.class_schedules`.
 * @relation Vincula `Group` (N:1), `Subject` (N:1), y `UserProfile` del docente (N:1).
 * @stateImpact Determina el horario escolar renderizado en el portal del administrador y docente.
 */
export interface ClassSchedule {
  id: string;
  school_id?: string;
  groupId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes';
  timeSlot: string;
}

/**
 * @interface ParentMessage
 * @description Mensaje o alerta formal enviada al tutor sobre el desempeño del estudiante.
 * @database Mapea a la tabla `public.parent_messages`.
 * @relation Vincula `UserProfile` del padre (N:1), `Student` (N:1), `UserProfile` del docente (N:1) y `Subject` (N:1).
 * @stateImpact Controlado por `sendParentMessage` en `useSchoolAdminStore`.
 */
export interface ParentMessage {
  id: string;
  school_id?: string;
  parent_id: string;
  student_id: string;
  student_name: string;
  teacher_id: string;
  teacher_name: string;
  subject_id: string;
  subject_name: string;
  quest_id?: string;
  quest_title?: string;
  message: string;
  sent_at: string;
  is_read: boolean;
  parent_reply?: string;
  replied_at?: string;
}

/**
 * @interface ShopArtifact
 * @description Objeto mágico disponible para compra en la Tienda del estudiante.
 * @database Mapea a la tabla `public.shop_artifacts`.
 * @stateImpact Listado en la tienda de `useGamificationStore`. Adquirible mediante las monedas ganadas por el alumno.
 */
export interface ShopArtifact {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string; // "Footprints" | "Shield" | "PenTool" | "Wine" | "Scroll" | "Dumbbell" | "GlassWater" | "Sparkles" | "Shirt" | "Wand2" | "Gem" | "Clock" | "Crown" | "BookOpen" | "Heart"
  effect: string;
  created_by?: string;
}

/**
 * @interface StudentMessage
 * @description Notificaciones internas de gamificación enviadas al buzón del alumno.
 * @database Mapea a la tabla `public.student_messages`.
 * @relation Vinculado a `Student` (N:1).
 * @stateImpact Renderizado en el buzón del estudiante de `useStudentStore`.
 */
export interface StudentMessage {
  id: string;
  student_id: string;
  title: string;
  message: string;
  sent_at: string;
  is_read: boolean;
  type?: 'general' | 'revocation';
  revoked_artifact?: string;
  reason?: string;
}

/**
 * @interface StudioActivityQuestion
 * @description Estructura de reactivos/preguntas para actividades del Estudio ISkool.
 */
export interface StudioActivityQuestion {
  question: string;
  options: string[];
  correctIndex: number; // Índice de la respuesta correcta (0-3)
  imageUrl?: string; // Referencia visual opcional para soporte en múltiples plantillas
  explanation?: string; // Retroalimentación formativa y justificación pedagógica
}
export type CanvasActivityQuestion = StudioActivityQuestion;

/**
 * @interface StudioActivityJSON
 * @description Estructura JSON compacta generada para actividades de Estudio ISkool.
 */
export interface StudioActivityJSON {
  title: string;
  description: string;
  questions: StudioActivityQuestion[];
  task_type?: string;
  blocks?: any[];
  connections?: any[];
  startNodeId?: string | null;
  metadata?: any;
  logicChallengeData?: any;
}
export type CanvasActivityJSON = StudioActivityJSON;

/**
 * @interface ISkoolTemplateDefinition
 * @description Estructura para el catálogo escalable de plantillas del Estudio ISkool.
 */
export interface ISkoolTemplateDefinition {
  id: string;
  name: string;
  description: string;
  iconName: string;
  category: 'quiz' | 'visual' | 'puzzle' | 'challenge';
  supportsImages: boolean;
  isAvailable: boolean;
}

/**
 * Catálogo escalable de las 20 plantillas educativas interactivas para Estudio ISkool.
 */
export const ISKOOL_TEMPLATES: ISkoolTemplateDefinition[] = [
  { id: 'trivia', name: 'Trivia de Preguntas', description: 'Cuestionario interactivo con retroalimentación inmediata y ranking de estrellas', iconName: 'BrainCircuit', category: 'quiz', supportsImages: true, isAvailable: true },
  { id: 'memorama', name: 'Memorama Visual', description: 'Encuentra las parejas de preguntas, conceptos e imágenes clave', iconName: 'Grid', category: 'visual', supportsImages: true, isAvailable: true },
  { id: 'ahorcado', name: 'Ahorcado Educativo', description: 'Descubre la palabra o concepto oculto antes de agotar tus intentos', iconName: 'HelpCircle', category: 'puzzle', supportsImages: true, isAvailable: true },
  { id: 'flashcards', name: 'Flashcards Animadas', description: 'Tarjetas de estudio interactivas con efecto de giro 3D', iconName: 'Layers', category: 'visual', supportsImages: true, isAvailable: true },
  { id: 'match', name: 'Emparejamiento (Match)', description: 'Arrastra y conecta cada concepto con su definición adecuada', iconName: 'Link2', category: 'puzzle', supportsImages: true, isAvailable: true },
  { id: 'ruleta', name: 'Ruleta de Conceptos', description: 'Gira la ruleta mágica y responde la pregunta del sector seleccionado', iconName: 'Disc', category: 'quiz', supportsImages: true, isAvailable: true },
  { id: 'carrera_math', name: 'Carrera Matemática', description: 'Acelera respondiendo operaciones y conceptos a máxima velocidad', iconName: 'Trophy', category: 'challenge', supportsImages: false, isAvailable: true },
  { id: 'tf_explosivo', name: 'Verdadero / Falso Explosivo', description: 'Decide antes de que el temporizador se agote si la premisa es verdadera', iconName: 'Flame', category: 'challenge', supportsImages: true, isAvailable: true },
  { id: 'sentence_builder', name: 'Constructor de Oraciones', description: 'Ordena las palabras clave para formar la definición precisa', iconName: 'AlignLeft', category: 'puzzle', supportsImages: false, isAvailable: true },
  { id: 'escape_room', name: 'Escape Room Lógico', description: 'Resuelve acertijos pedagógicos para desbloquear cada puerta de salida', iconName: 'KeyRound', category: 'puzzle', supportsImages: true, isAvailable: true },
  { id: 'simon_says', name: 'Simón Dice Educativo', description: 'Memoriza la secuencia de respuestas y repítela correctamente', iconName: 'Gamepad2', category: 'challenge', supportsImages: false, isAvailable: true },
  { id: 'batalla_respuestas', name: 'Batalla de Respuestas', description: 'Desafío contrarreloj para poner a prueba la agilidad mental', iconName: 'Zap', category: 'challenge', supportsImages: true, isAvailable: true },
  { id: 'ordenamiento', name: 'Ordenamiento Cronológico', description: 'Ordena la secuencia correcta de eventos históricos o pasos técnicos', iconName: 'ListOrdered', category: 'quiz', supportsImages: true, isAvailable: true },
  { id: 'crucigrama', name: 'Crucigrama de Saberes', description: 'Completa las palabras cruzadas con pistas pedagógicas', iconName: 'FileText', category: 'puzzle', supportsImages: false, isAvailable: true },
  { id: 'rompecabezas', name: 'Rompecabezas Guiado', description: 'Reconstruye la imagen del proyecto respondiendo reactivos', iconName: 'Puzzle', category: 'visual', supportsImages: true, isAvailable: true },
  { id: 'word_detective', name: 'Detectives de Palabras', description: 'Identifica los errores o sesgos en el texto pedagógico', iconName: 'Search', category: 'puzzle', supportsImages: false, isAvailable: true },
  { id: 'sopa_letras', name: 'Sopa de Letras', description: 'Encuentra los términos principales en la cuadrícula de saberes', iconName: 'Grid3X3', category: 'puzzle', supportsImages: false, isAvailable: true },
  { id: 'mapa_interactivo', name: 'Mapa Interactivo', description: 'Ubica elementos y conceptos en un diagrama visual', iconName: 'MapPin', category: 'visual', supportsImages: true, isAvailable: true },
  { id: 'treasure_hunt', name: 'Caza-Tesoros', description: 'Encuentra las pistas escondidas en el aula virtual', iconName: 'Compass', category: 'challenge', supportsImages: true, isAvailable: true },
  { id: 'clasificacion', name: 'Desafío de Clasificación', description: 'Agrupa conceptos en sus categorías o campos formativos correspondientes', iconName: 'FolderKanban', category: 'puzzle', supportsImages: true, isAvailable: true }
];

/**
 * @interface CommunityActivity
 * @description Actividad o plantilla gamificada compartida en la comunidad docente.
 * @database Mapea a la tabla `public.community_activities`.
 */
export interface CommunityActivity {
  id: string;
  teacher_id: string;
  title: string;
  template_type: string; // 'trivia' | 'memorama' | etc.
  content_json: CanvasActivityJSON;
  upvotes: number;
  created_at: string;
  teacher_name?: string;
  user_has_voted?: boolean;
}

/**
 * @interface ActivityVote
 * @description Voto individual docente (Llave primaria compuesta anti-fraude).
 * @database Mapea a la tabla `public.activity_votes`.
 */
export interface ActivityVote {
  activity_id: string;
  voter_teacher_id: string;
  created_at: string;
}

// ============================================================================
// MÓDULO FINANCIERO: FACTURACIÓN, COBRANZA Y PAGOS INSTITUCIONALES (MARCA BLANCA)
// Cero Gamificación • Seguridad Bancaria • Integración Genérica PaymentGateway
// ============================================================================

/**
 * @typedef {('601' | '603' | '605' | '606' | '608' | '612' | '616' | '621' | '625' | '626')} TaxRegimeCode
 * @description Regímenes fiscales oficiales del SAT (México).
 */
export type TaxRegimeCode = 
  | '601' // General de Ley Personas Morales
  | '603' // Personas Morales con Fines no Lucrativos
  | '605' // Sueldos y Salarios e Ingresos Asimilados a Salarios
  | '606' // Arrendamiento
  | '608' // Demás ingresos
  | '612' // Personas Físicas con Actividades Empresariales y Profesionales
  | '616' // Sin obligaciones fiscales
  | '621' // Incorporación Fiscal
  | '625' // Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas
  | '626'; // Régimen Simplificado de Confianza (RESICO)

/**
 * @typedef {('D10' | 'G01' | 'G02' | 'G03' | 'S01' | 'CP01')} CfdiUseCode
 * @description Usos de CFDI oficiales aplicables a servicios educativos y cobranza.
 */
export type CfdiUseCode = 
  | 'D10' // Pagos por servicios educativos (colegiaturas) - Deducción personal
  | 'G01' // Adquisición de mercancías
  | 'G02' // Devoluciones, descuentos o bonificaciones
  | 'G03' // Gastos en general
  | 'S01' // Sin efectos fiscales
  | 'CP01'; // Pagos

/**
 * @interface BillingProfile
 * @description Perfil y datos fiscales del tutor o padre de familia para facturación y CFDI.
 * @database Mapea a la tabla `public.billing_profiles`.
 * @security RLS: Los padres solo gestionan su propio perfil (auth.uid() = parent_id).
 */
export interface BillingProfile {
  id: string;
  parent_id: string; // references UserProfile
  school_id: string; // references School
  rfc: string; // Registro Federal de Contribuyentes (12-13 caracteres)
  tax_name: string; // Razón Social o Nombre Fiscal
  tax_regime: TaxRegimeCode | string; // Clave de Régimen Fiscal SAT
  postal_code: string; // Código Postal Fiscal del emisor/receptor
  cfdi_use: CfdiUseCode | string; // Uso de CFDI (Default: 'D10' para colegiaturas)
  billing_email: string; // Correo de recepción de XML y PDF fiscal
  
  // Domicilio fiscal complementario (opcional)
  street?: string;
  exterior_number?: string;
  interior_number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  
  is_default: boolean;
  auto_invoice_on_payment?: boolean; // Timbrado automático inmediato al acreditarse el pago
  created_at: string;
  updated_at: string;

  // Relaciones cargadas opcionalmente
  parent?: UserProfile;
  school?: School;
}

/**
 * @typedef {('tuition' | 'enrollment' | 'materials' | 'uniform' | 'cafeteria' | 'extracurricular' | 'exam_fee' | 'other')} InvoiceCategory
 * @description Categoría o concepto del cargo escolar.
 */
export type InvoiceCategory = 
  | 'tuition'        // Colegiatura mensual
  | 'enrollment'     // Inscripción o Reinscripción anual
  | 'materials'      // Paquete de libros / materiales didácticos
  | 'uniform'        // Uniformes escolares
  | 'cafeteria'      // Servicio de comedor / cafetería
  | 'extracurricular'// Talleres extraescolares, deportes o robótica
  | 'exam_fee'       // Cuotas de exámenes o certificaciones
  | 'other';         // Otros cargos administrativos

/**
 * @typedef {('pending' | 'paid' | 'overdue' | 'cancelled' | 'in_process')} InvoiceStatus
 * @description Estado de cobro de un cargo o factura escolar.
 */
export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'cancelled' | 'in_process';

/**
 * @interface Invoice
 * @description Representa un cargo a cobrar emitido por la institución a un estudiante y tutor.
 * @database Mapea a la tabla `public.invoices`.
 * @security RLS: Tutores solo ven sus cargos (`parent_id`), coordinadores ven los de su plantel (`school_id`).
 */
export interface Invoice {
  id: string;
  school_id: string; // references School
  parent_id: string; // references UserProfile (tutor responsable del pago)
  student_id: string; // references Student (alumno al que corresponde el concepto)
  academic_year_id?: string; // references AcademicYear
  
  invoice_number: string; // Folio de control escolar (e.g. "COL-2026-00452")
  concept: string; // Descripción formal (e.g. "Colegiatura Septiembre 2026 - 3º Secundaria")
  category: InvoiceCategory;
  
  // Desglose monetario en moneda local
  subtotal: number;
  discount_amount: number; // Descuento por beca o pronto pago
  surcharge_amount: number; // Recargo por mora o pago extemporáneo
  total_amount: number; // Monto final neto exigible
  currency: string; // "MXN"
  
  issue_date: string; // Fecha de emisión (YYYY-MM-DD)
  due_date: string; // Fecha límite de pago sin recargo (YYYY-MM-DD)
  status: InvoiceStatus;
  paid_at?: string; // Fecha y hora exacta de liquidación
  
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;

  // Relaciones cargadas en joins
  student?: Student;
  parent?: UserProfile;
  school?: School;
  billing_profile?: BillingProfile;
  payments?: PaymentHistoryItem[];
}

/**
 * @typedef {('credit_card' | 'debit_card' | 'spei' | 'bank_transfer' | 'cash_store' | 'direct_debit')} PaymentMethod
 * @description Métodos de pago electrónicos procesados por el proveedor financiero.
 */
export type PaymentMethod = 
  | 'credit_card'   // Tarjeta de crédito (Visa, Mastercard, AMEX)
  | 'debit_card'    // Tarjeta de débito bancaria
  | 'spei'          // Transferencia electrónica interbancaria SPEI inmediata
  | 'bank_transfer' // Depósito o ventanilla bancaria con referencia
  | 'cash_store'    // Pago en cadena de tiendas de conveniencia con código de barras
  | 'direct_debit';  // Domiciliación bancaria automática

/**
 * @typedef {('succeeded' | 'pending' | 'failed' | 'refunded')} PaymentStatus
 * @description Estado de la transacción en la pasarela de pagos.
 */
export type PaymentStatus = 'succeeded' | 'pending' | 'failed' | 'refunded';

/**
 * @interface PaymentHistoryItem
 * @description Registro inmutable de transacciones financieras procesadas con éxito o en conciliación.
 * @database Mapea a la tabla `public.payments_history`.
 * @security RLS: Tutores consultan recibos propios, administración accede a conciliación de colegio.
 */
export interface PaymentHistoryItem {
  id: string;
  school_id: string;
  invoice_id: string;
  parent_id: string;
  
  amount: number;
  currency: string; // "MXN"
  payment_method: PaymentMethod;
  status: PaymentStatus;
  
  // Abstracción genérica de pasarela financiera (Marca Blanca)
  gateway_provider: string; // "PaymentGateway"
  gateway_transaction_id: string; // Identificador único de transacción del procesador
  gateway_fee?: number; // Comisión de pasarela
  net_amount: number; // Monto neto recibido por el colegio
  
  receipt_number: string; // Folio de recibo de caja institucional
  receipt_url?: string; // URL del comprobante de pago digital
  
  // Datos de Facturación Electrónica SAT (si fue timbrada)
  cfdi_uuid?: string; // Folio Fiscal SAT (UUID 36 caracteres)
  cfdi_xml_url?: string;
  cfdi_pdf_url?: string;
  
  paid_at: string;
  metadata?: Record<string, any>;
  created_at: string;

  // Relaciones
  invoice?: Invoice;
  parent?: UserProfile;
}

/**
 * @interface MagicLink
 * @description Token criptográfico seguro para acceso directo a pasarela de pago sin requerir contraseña.
 * @database Mapea a la tabla `public.magic_links`.
 * @security Alta entropía (SHA-256), expiración automática y uso único.
 */
export interface MagicLink {
  id: string;
  token_hash: string; // Hash SHA-256 del token unívoco enviado al padre
  school_id: string;
  parent_id: string;
  invoice_id: string;
  
  expires_at: string; // Timestamp ISO de caducidad (ej. 72 horas)
  is_used: boolean; // Flag de un solo uso
  used_at?: string;
  
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  created_at: string;

  // Relaciones
  invoice?: Invoice;
  parent?: UserProfile;
}

/**
 * @interface PaymentGatewaySessionParams
 * @description Parámetros requeridos para inicializar una sesión segura de checkout en la pasarela.
 */
export interface PaymentGatewaySessionParams {
  invoiceId: string;
  invoiceNumber: string;
  concept: string;
  amount: number;
  currency: string;
  parentEmail: string;
  parentName: string;
  successUrl: string;
  cancelUrl: string;
  expiresAt?: string;
  metadata?: Record<string, string>;
}

/**
 * @interface PaymentGatewaySessionResult
 * @description Respuesta formal generada tras la inicialización del checkout.
 */
export interface PaymentGatewaySessionResult {
  sessionId: string;
  checkoutUrl: string;
  referenceCode: string;
  expiresAt: string;
  status: 'active' | 'expired';
}

/**
 * @interface PaymentWebhookPayload
 * @description Estructura de eventos webhook asíncronos emitidos por el proveedor financiero.
 */
export interface PaymentWebhookPayload {
  eventId: string;
  eventType: 'payment.succeeded' | 'payment.failed' | 'charge.refunded';
  transactionId: string;
  invoiceId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paidAt: string;
  signature: string;
  metadata?: Record<string, any>;
}/**
 * @typedef {('Preescolar' | 'Primaria' | 'Secundaria' | 'Profesional tecnico' | 'Bachillerato o su equivalente')} IeduEducationLevel
 * @description Niveles educativos oficiales para el Complemento IEDU del SAT.
 */
export type IeduEducationLevel = 
  | 'Preescolar'
  | 'Primaria'
  | 'Secundaria'
  | 'Profesional tecnico'
  | 'Bachillerato o su equivalente';

/**
 * @interface IeduComplementData
 * @description Datos del Complemento de Instituciones Educativas Privadas (IEDU V1.0) para deducción fiscal del SAT.
 */
export interface IeduComplementData {
  nombreAlumno: string;
  curp: string; // 18 caracteres alfanuméricos
  nivelEducativo: IeduEducationLevel | string;
  autRvoe: string; // Clave de RVOE SEP o Acuerdo de Incorporación
  rfcPago?: string; // RFC de quien realiza el pago si es diferente al receptor
}

/**
 * @interface SchoolFiscalConfig
 * @description Configuración fiscal del plantel escolar, CSD y credenciales del PAC.
 */
export interface SchoolFiscalConfig {
  id: string;
  school_id: string;
  rfc_emisor: string;
  razon_social: string;
  regimen_fiscal: TaxRegimeCode | string;
  codigo_postal: string;
  rvoe_preescolar?: string;
  rvoe_primaria?: string;
  rvoe_secundaria?: string;
  rvoe_bachillerato?: string;
  pac_provider: 'mock_sandbox' | 'generic_pac';
  pac_environment: 'sandbox' | 'production';
  pac_api_key?: string;
  pac_url?: string;
  csd_certificate_number?: string;
  csd_expires_at?: string;
  is_active: boolean;
}

/**
 * @interface CfdiItem
 * @description Concepto o partida a facturar conforme a los catálogos del SAT CFDI 4.0.
 */
export interface CfdiItem {
  claveProdServ: string; // Ej: '86121500' (Servicios educativos)
  noIdentificacion?: string;
  cantidad: number;
  claveUnidad: string; // Ej: 'E48' (Unidad de servicio)
  unidad?: string;
  descripcion: string;
  valorUnitario: number;
  importe: number;
  descuento?: number;
  objetoImp: string; // '01' No objeto de impuesto, '02' Sí objeto
  ieduComplement?: IeduComplementData;
}

/**
 * @interface CfdiStampRequest
 * @description Petición estructurada para el timbrado fiscal ante el PAC / SAT.
 */
export interface CfdiStampRequest {
  invoiceId: string;
  receiptNumber: string;
  emisor: {
    rfc: string;
    nombre: string;
    regimenFiscal: string;
    codigoPostal: string;
  };
  receptor: {
    rfc: string;
    nombre: string;
    regimenFiscalReceptor: string;
    domicilioFiscalReceptor: string;
    usoCFDI: CfdiUseCode | string;
    email?: string;
  };
  items: CfdiItem[];
  formaPago: string; // '01' Efectivo, '03' Transferencia, '04' Tarjeta, etc.
  metodoPago: 'PUE' | 'PPD';
  subtotal: number;
  descuento?: number;
  total: number;
  moneda: string;
  fecha?: string;
}

/**
 * @interface CfdiStampResponse
 * @description Respuesta formal devuelta por el PAC tras el timbrado digital del SAT.
 */
export interface CfdiStampResponse {
  success: boolean;
  uuid?: string; // Folio Fiscal SAT (36 caracteres)
  fechaTimbrado?: string;
  noCertificadoSat?: string;
  noCertificadoEmisor?: string;
  selloSat?: string;
  selloCfd?: string;
  cadenaOriginalSat?: string;
  xmlContent?: string;
  qrCodeData?: string;
  errorCode?: string;
  errorMessage?: string;
}

/**
 * @interface CfdiCancelRequest
 * @description Solicitud formal de cancelación fiscal con los motivos oficiales del SAT.
 */
export interface CfdiCancelRequest {
  uuid: string;
  motivo: '01' | '02' | '03' | '04';
  folioSustitucion?: string;
  rfcEmisor: string;
}

/**
 * @interface CfdiCancelResponse
 * @description Resultado devuelto por el PAC / SAT tras la solicitud de cancelación.
 */
export interface CfdiCancelResponse {
  success: boolean;
  uuid: string;
  estatus: 'Cancelado' | 'En proceso' | 'Rechazado';
  fechaCancelacion?: string;
  acuseXml?: string;
  errorMessage?: string;
}

/**
 * @interface ReadingMetric
 * @description Registro individual de desempeño y fluidez en retos de comprensión lectora y pensamiento lógico.
 * @database Mapea a la tabla `public.reading_metrics`.
 * @relation Vinculado a `Student` (N:1) y opcionalmente `Quest` (N:1).
 * @stateImpact Utilizado para evaluar el progreso en el campo formativo NEM de Lenguajes y alimentar el historial de fluidez del alumno.
 */
export interface ReadingMetric {
  id: string;
  student_id: string;
  quest_id?: string | null;
  words_per_minute: number; // PPM
  comprehension_score: number; // 0.00 a 100.00
  time_spent_seconds: number;
  created_at: string;
}

/**
 * @interface SubmitReadingQuestResult
 * @description Payload estructurado devuelto por la función RPC `submit_reading_quest`.
 */
export interface SubmitReadingQuestResult {
  success: boolean;
  reading_metric_id: string;
  attempt_id?: string | null;
  xp_earned: number;
  coins_earned: number;
  words_per_minute: number;
  comprehension_score: number;
  time_spent_seconds: number;
  leveled_up: boolean;
  feedback: string;
  new_stats: {
    xp: number;
    level: number;
    coins: number;
    current_streak: number;
    max_streak: number;
    skill_points: number;
    stat_lenguajes: number;
  };
  badge_earned?: {
    id: string;
    name: string;
    description: string;
    icon_name: string;
  } | null;
}

/**
 * @interface StaffPayrollRecord
 * @description Registro contable de nómina y compensaciones para directores, coordinadores, docentes y administrativos.
 * @stateImpact Supervisado exclusivamente por el Dueño de Empresa / Super Usuario en el portal financiero.
 */
export interface StaffPayrollRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  role: UserRole;
  department: string; // 'Dirección General' | 'Coordinación Académica' | 'Cuerpo Docente' | 'Cobranza y Finanzas'
  position_title: string;
  school_id: string;
  campus_name?: string;
  base_salary: number;
  bonuses: number; // Bonos pedagógicos, puntualidad, desempeño
  deductions: number; // Retenciones IMSS, ISR, aportaciones
  net_salary: number; // base_salary + bonuses - deductions
  payment_period: string; // Ej: "1ª Quincena Septiembre 2026"
  period_type: 'quincenal' | 'mensual';
  payment_date?: string;
  status: 'pagado' | 'en_dispersion' | 'pendiente';
  payment_method: string; // 'SPEI / Transferencia Bancaria', 'BBVA', etc.
  account_clabe?: string;
  bank_name?: string;
  rfc?: string;
  curp?: string;
  receipt_folio?: string;
  notes?: string;
}

export * from './teacherGamification';
