---
tags: [iskool, arquitectura, automatizado]
archivo_origen: "src/types/index.ts"
ultima_sincronizacion: "2026-06-21T05:43:37.621Z"
---

# Definiciones de Tipos y Modelos (TypeScript)

## 💻 Resumen de Modelos y Tipos

Este archivo define la estructura de datos compartida entre el backend (PostgreSQL/Supabase) y el frontend en Next.js.

### Type: `UserRole`

* **Descripción:** Define los roles de usuario autorizados en el sistema escolar.
* **Impacto en Estado:** Determina los permisos en el frontend, accesibilidad de rutas y control RLS.

```typescript
export type UserRole = 'superadmin' | 'admin' | 'director' | 'coordinator' | 'teacher' | 'student' | 'parent';
```

### Interface: `UserProfile`

* **Descripción:** Datos básicos del perfil general de cualquier usuario.
* **Mapeo de Base de Datos:** Mapea a la tabla `public.profiles`.
* **Relaciones:** Relación 1:1 con `auth.users` de Supabase. Referenciado en `Student` y `TeacherAssignment`.
* **Impacto en Estado:** Almacenado en `AuthContext` tras el inicio de sesión del usuario.

```typescript
export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  email: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}
```

### Interface: `School`

* **Descripción:** Representa un plantel o escuela en el sistema.
* **Mapeo de Base de Datos:** Mapea a la tabla `public.schools`.
* **Relaciones:** Raíz jerárquica. Padre de `AcademicYear`, `Group`, `Subject`.
* **Impacto en Estado:** Leído en configuraciones iniciales por `useSchoolAdminStore`.

```typescript
export interface School {
  id: string;
  name: string;
  cct?: string; // Clave de Centro de Trabajo (SEP)
  address?: string;
  phone?: string;
  created_at: string;
}
```

### Interface: `AcademicYear`

* **Descripción:** Representa un ciclo escolar (e.g., 2025-2026).
* **Mapeo de Base de Datos:** Mapea a la tabla `public.academic_years`.
* **Relaciones:** Pertenece a `School` (N:1). Padre de `AcademicPeriod` y `Group`.
* **Impacto en Estado:** Define el ciclo activo en `useSchoolAdminStore`.

```typescript
export interface AcademicYear {
  id: string;
  school_id: string;
  name: string; // e.g., "2025-2026"
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}
```

### Interface: `AcademicPeriod`

* **Descripción:** Representa bloques de evaluación dentro de un ciclo escolar (e.g., Bimestre 1).
* **Mapeo de Base de Datos:** Mapea a la tabla `public.academic_periods`.
* **Relaciones:** Pertenece a `AcademicYear` (N:1). Usado para filtrar `Grade`.
* **Impacto en Estado:** Utilizado para segmentar boletas formativas en el panel docente.

```typescript
export interface AcademicPeriod {
  id: string;
  academic_year_id: string;
  name: string; // e.g., "Bimestre 1", "Bimestre 2"
  start_date: string;
  end_date: string;
  created_at: string;
}
```

### Interface: `LevelGrade`

* **Descripción:** Cataloga niveles educativos (primaria, secundaria, preparatoria) y sus grados respectivos.
* **Mapeo de Base de Datos:** Mapea a la tabla `public.levels_grades`.
* **Relaciones:** Referenciado en `Group` y `Subject`.
* **Impacto en Estado:** Determina la UI adaptada (Mascota, RPG, Créditos de Financiamiento) que verá el estudiante.

```typescript
export interface LevelGrade {
  id: string;
  level_name: 'primaria' | 'secundaria' | 'preparatoria';
  grade_name: string; // e.g., "1º", "2º", "3º", "1º Semestre"
  created_at: string;
}
```

### Interface: `Group`

* **Descripción:** Define un grupo escolar (e.g., 4º "A").
* **Mapeo de Base de Datos:** Mapea a la tabla `public.groups`.
* **Relaciones:** Vinculado a `School` (N:1), `LevelGrade` (N:1), y `AcademicYear` (N:1). Contiene múltiples `Enrollment`.
* **Impacto en Estado:** Utilizado en RLS de profesores para filtrar alumnos evaluados.

```typescript
export interface Group {
  id: string;
  school_id: string;
  level_grade_id: string;
  academic_year_id: string;
  name: string; // e.g., "A", "B"
  created_at: string;
  
  // Relaciones opcionales cargadas en consultas
  level_grade?: LevelGrade;
  academic_year?: AcademicYear;
}
```

### Interface: `Subject`

* **Descripción:** Materia académica dictada en el colegio (e.g., Matemáticas).
* **Mapeo de Base de Datos:** Mapea a la tabla `public.subjects`.
* **Relaciones:** Vinculado a `School` (N:1) y `LevelGrade` (N:1). Referenciada en `Mission` y `Grade`.
* **Impacto en Estado:** Filtra el mapa de misiones y la segmentación de evidencias en el portafolio del estudiante.

```typescript
export interface Subject {
  id: string;
  school_id: string;
  level_grade_id: string;
  name: string; // e.g., "Matemáticas"
  sep_code?: string;
  created_at: string;
}
```

### Interface: `Student`

* **Descripción:** Perfil específico del rol estudiante.
* **Mapeo de Base de Datos:** Mapea a la tabla `public.students`.
* **Relaciones:** Vinculado a `UserProfile` (1:1), `School` (N:1). Tiene 1:N `Enrollment` e `Inventory`.
* **Impacto en Estado:** Identificador clave de acceso para RLS en consultas de stats y portafolio.

```typescript
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
```

### Interface: `ParentStudent`

* **Descripción:** Relación de vinculación entre un tutor y un estudiante.
* **Mapeo de Base de Datos:** Mapea a la tabla `public.parent_students`.
* **Relaciones:** Vincula `UserProfile` del padre (N:1) con `Student` (N:1).
* **Impacto en Estado:** Permite al portal de tutores visualizar únicamente los logros del estudiante vinculado.

```typescript
export interface ParentStudent {
  parent_id: string;
  student_id: string;
  relationship: string; // "Padre", "Madre", "Tutor"
}
```

### Interface: `Enrollment`

* **Descripción:** Inscripción de un estudiante en un grupo específico para un ciclo escolar.
* **Mapeo de Base de Datos:** Mapea a la tabla `public.enrollments`.
* **Relaciones:** Vincula `Student` (N:1) con `Group` (N:1).
* **Impacto en Estado:** Utilizado por `useSchoolAdminStore` para la distribución grupal.

```typescript
export interface Enrollment {
  id: string;
  student_id: string;
  group_id: string;
  created_at: string;

  // Relaciones opcionales
  student?: Student;
  group?: Group;
}
```

### Interface: `TeacherAssignment`

* **Descripción:** Asignación que define qué docente imparte qué materia en qué grupo.
* **Mapeo de Base de Datos:** Mapea a la tabla `public.teacher_assignments`.
* **Relaciones:** Vincula `UserProfile` del profesor (N:1), `Group` (N:1), y `Subject` (N:1).
* **Impacto en Estado:** Validado en RLS para certificar qué grupos puede consultar un docente.

```typescript
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
```

### Type: `AttendanceStatus`

* **Descripción:** Opciones de registro de asistencia diaria.

```typescript
export type AttendanceStatus = 'presente' | 'falta' | 'retardo' | 'justificado';
```

### Interface: `Attendance`

* **Descripción:** Registro de asistencia de un estudiante en una fecha determinada.
* **Mapeo de Base de Datos:** Mapea a la tabla `public.attendance`.
* **Relaciones:** Vincula `Student` (N:1) y `Group` (N:1). Registrado por un `UserProfile` docente.
* **Impacto en Estado:** Controlado y actualizado por el panel del docente en `useSchoolAdminStore`.

```typescript
export interface Attendance {
  id: string;
  student_id: string;
  group_id: string;
  subject_id?: string; // null para asistencia general del día, o específico por materia
  date: string;
  status: AttendanceStatus;
  comments?: string;
  registered_by: string; // references UserProfile
  created_at: string;
}
```

### Interface: `Grade`

* **Descripción:** Calificación cuantitativa ordinaria asignada a un estudiante en una materia y periodo.
* **Mapeo de Base de Datos:** Mapea a la tabla `public.grades`.
* **Relaciones:** Vincula `Student` (N:1), `Subject` (N:1), y `AcademicPeriod` (N:1).
* **Impacto en Estado:** Traducido y consolidado para la boleta SEP oficial en `useSchoolAdminStore`.

```typescript
export interface Grade {
  id: string;
  student_id: string;
  subject_id: string;
  period_id: string; // references AcademicPeriod
  score: number; // Decimal (5.0 a 10.0)
  comments?: string;
  created_at: string;
  updated_at: string;
}
```

### Interface: `StudentStats`

* **Descripción:** Estadísticas de gamificación y progresión de nivel de un estudiante.
* **Mapeo de Base de Datos:** Mapea a la tabla `public.student_stats`.
* **Relaciones:** Vinculado a `Student` (1:1).
* **Impacto en Estado:** Actualizado por acciones del almacén (`useStudentStore`, `addXpAndCoins`). Validado bajo políticas RLS por estudiante y docente.

```typescript
export interface StudentStats {
  student_id: string;
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
}
```

### Interface: `StudentAvatar`

* **Descripción:** Configuración estética del avatar del alumno y el estado de su mascota.
* **Mapeo de Base de Datos:** Mapea a la tabla `public.student_avatars`.
* **Relaciones:** Vinculado a `Student` (1:1).
* **Impacto en Estado:** Almacenado y editado mediante `changeAvatar` en `useStudentStore`.

```typescript
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
```

### Type: `BadgeCategory`

* **Descripción:** Categorías de medallas e insignias escolares.

```typescript
export type BadgeCategory = 'academic' | 'social' | 'persistence' | 'creative';
```

### Interface: `Badge`

* **Descripción:** Catálogo de insignias que un estudiante puede ganar.
* **Mapeo de Base de Datos:** Mapea a la tabla `public.badges`.
* **Relaciones:** Referenciada en `StudentBadge` (1:N).
* **Impacto en Estado:** Listado global en la tienda de medallas de `useGamificationStore`.

```typescript
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_name: string;
  category: BadgeCategory;
  xp_required: number;
  created_at: string;
}
```

### Interface: `StudentBadge`

* **Descripción:** Registro de insignias obtenidas por un estudiante.
* **Mapeo de Base de Datos:** Mapea a la tabla `public.student_badges`.
* **Relaciones:** Vincula `Student` (N:1) y `Badge` (N:1).
* **Impacto en Estado:** Administrado por `unlockBadge` en `useGamificationStore`.

```typescript
export interface StudentBadge {
  student_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge; // Relación anidada para renderizado directo
}
```

### Interface: `Mission`

* **Descripción:** Misión del mapa de aprendizaje que engloba una narrativa y varios retos.
* **Mapeo de Base de Datos:** Mapea a la tabla `public.missions`.
* **Relaciones:** Vinculado a `School` (N:1), `Subject` (N:1), y `LevelGrade` (N:1). Padre de `Quest`.
* **Impacto en Estado:** Cargado dinámicamente mediante `fetchMissions` en `useGamificationStore`.

```typescript
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
  
  // Relaciones opcionales cargadas
  subject?: Subject;
  quests?: Quest[];
}
```

### Type: `QuestType`

* **Descripción:** Tipos de retos escolares soportados.

```typescript
export type QuestType = 'quiz' | 'portfolio_submission' | 'exam';
```

### Interface: `QuizQuestion`

* **Descripción:** Pregunta de opción múltiple con explicaciones retroalimentarias.

```typescript
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}
```

### Interface: `QuizContent`

* **Descripción:** Estructura de cuestionario común para Quests de tipo 'quiz'.

```typescript
export interface QuizContent {
  questions: QuizQuestion[];
}
```

### Interface: `ExamContent`

* **Descripción:** Reto especial tipo jefe de gremio (Boss Battle RPG) para exámenes.

```typescript
export interface ExamContent {
  questions: QuizQuestion[];
  bossName: string;
  bossHp: number;
  bossMaxDmg: number;
  storyIntro: string;
}
```

### Interface: `SubmissionContent`

* **Descripción:** Parámetros y formatos aceptados para retos de entrega de evidencias.

```typescript
export interface SubmissionContent {
  instructions: string;
  acceptedFormats: string[]; // e.g., ["image", "audio", "video"]
}
```

### Interface: `Quest`

* **Descripción:** Reto o actividad dentro de una misión académica.
* **Mapeo de Base de Datos:** Mapea a la tabla `public.quests`.
* **Relaciones:** Pertenece a `Mission` (N:1). Referenciado en `QuestAttempt` y `PortfolioItem`.
* **Impacto en Estado:** Define el contenido de las preguntas y formatos de evidencias que lee la UI del estudiante.

```typescript
export interface Quest {
  id: string;
  mission_id: string;
  title: string;
  description: string;
  type: QuestType;
  sequence_order: number;
  xp_reward: number;
  coins_reward: number;
  content: QuizContent | SubmissionContent | ExamContent;
  created_at: string;
  campos_formativos?: string[];
  ejes_articuladores?: string[];
  pdas?: string[];
}
```

### Interface: `QuestAttempt`

* **Descripción:** Registro detallado del intento de resolución de un reto por un estudiante.
* **Mapeo de Base de Datos:** Mapea a la tabla `public.quest_attempts`.
* **Relaciones:** Vincula `Student` (N:1) y `Quest` (N:1).
* **Impacto en Estado:** Actualizado por `submitQuiz` y `submitExam` en `useGamificationStore`.

```typescript
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
```

### Type: `PortfolioItemStatus`

* **Descripción:** Estado de revisión formativa de una evidencia.

```typescript
export type PortfolioItemStatus = 'draft' | 'submitted' | 'approved' | 'needs_revision';
```

### Type: `PortfolioFileType`

* **Descripción:** Formato multimedia de la evidencia cargada.

```typescript
export type PortfolioFileType = 'image' | 'audio' | 'video' | 'pdf' | 'link';
```

### Interface: `PortfolioItem`

* **Descripción:** Evidencia de aprendizaje cargada por el estudiante para evaluación del docente.
* **Mapeo de Base de Datos:** Mapea a la tabla `public.portfolio_items`.
* **Relaciones:** Vincula `Student` (N:1), `Subject` (N:1), y opcionalmente `Quest` (N:1). Contiene 1:N `PortfolioFeedback`.
* **Impacto en Estado:** Almacenado en `usePortfolioStore`. Sujeto a políticas RLS por estudiante (ver propios) y docente (filtrado por group_id).

```typescript
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

  // Relaciones anidadas opcionales
  student_profile?: UserProfile;
  subject?: Subject;
  quest?: Quest;
  feedbacks?: PortfolioFeedback[];
}
```

### Type: `FeedbackAuthorRole`

* **Descripción:** Rol del autor que emite una retroalimentación formativa.

```typescript
export type FeedbackAuthorRole = 'teacher' | 'parent' | 'student' | 'peer';
```

### Interface: `PortfolioFeedback`

* **Descripción:** Retroalimentación o comentarios añadidos a una evidencia del portafolio.
* **Mapeo de Base de Datos:** Mapea a la tabla `public.portfolio_feedbacks`.
* **Relaciones:** Pertenece a `PortfolioItem` (N:1). Escrito por un `UserProfile` (N:1).
* **Impacto en Estado:** Actualizado por `addPortfolioFeedback` en `usePortfolioStore`.

```typescript
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
```

### Interface: `GuildBoss`

* **Descripción:** Parámetros de vida y recompensa del jefe grupal activo en una batalla de examen.
* **Mapeo de Base de Datos:** Mapea a la tabla `public.guild_bosses`.
* **Impacto en Estado:** Controla el renderizado de la barra de vida colectiva en `useGamificationStore`.

```typescript
export interface GuildBoss {
  id: string;
  name: string;
  hp_max: number;
  hp_actual: number;
  xp_reward: number;
}
```

### Interface: `GuildMemberSubmission`

* **Descripción:** Estado de cumplimiento de tareas de un alumno dentro de un gremio cooperativo.

```typescript
export interface GuildMemberSubmission {
  student_id: string;
  student_name: string;
  avatar_outfit: string;
  class_name: string;
  status: 'pending' | 'submitted_on_time' | 'submitted_late';
  submitted_at?: string;
}
```

### Interface: `SchoolSettings`

* **Descripción:** Configuraciones generales de personalización visual e identidad escolar.
* **Mapeo de Base de Datos:** Mapea a la tabla `public.school_settings` (o config escolar en Supabase).
* **Impacto en Estado:** Determina la paleta de colores dinámicos inyectada al DOM en `useSchoolAdminStore`.

```typescript
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
}
```

### Interface: `DetailedStudent`

* **Descripción:** Expediente escolar extendido para el control del coordinador escolar.
* **Mapeo de Base de Datos:** Mapea a la tabla `public.students` y join con perfiles médicos e historiales de conducta.
* **Impacto en Estado:** Utilizado para listados de control y emisión de reportes en `useSchoolAdminStore`.

```typescript
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
  academic_notes?: string;
  level: 'primaria' | 'secundaria' | 'preparatoria';
  grade: string;
  group_id?: string;

  // Campos adicionales del expediente
  pending_payments?: string[];
  behavior_reports?: { date: string; description: string; reporter: string }[];
  teacher_notes?: { date: string; note: string; teacher_name: string }[];
}
```

### Interface: `ClassSchedule`

* **Descripción:** Programación o bloque de horario de una materia y docente para un grupo.
* **Mapeo de Base de Datos:** Mapea a la tabla `public.class_schedules`.
* **Relaciones:** Vincula `Group` (N:1), `Subject` (N:1), y `UserProfile` del docente (N:1).
* **Impacto en Estado:** Determina el horario escolar renderizado en el portal del administrador y docente.

```typescript
export interface ClassSchedule {
  id: string;
  groupId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes';
  timeSlot: string;
}
```

### Interface: `ParentMessage`

* **Descripción:** Mensaje o alerta formal enviada al tutor sobre el desempeño del estudiante.
* **Mapeo de Base de Datos:** Mapea a la tabla `public.parent_messages`.
* **Relaciones:** Vincula `UserProfile` del padre (N:1), `Student` (N:1), `UserProfile` del docente (N:1) y `Subject` (N:1).
* **Impacto en Estado:** Controlado por `sendParentMessage` en `useSchoolAdminStore`.

```typescript
export interface ParentMessage {
  id: string;
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
```

### Interface: `ShopArtifact`

* **Descripción:** Objeto mágico disponible para compra en la Tienda del estudiante.
* **Mapeo de Base de Datos:** Mapea a la tabla `public.shop_artifacts`.
* **Impacto en Estado:** Listado en la tienda de `useGamificationStore`. Adquirible mediante las monedas ganadas por el alumno.

```typescript
export interface ShopArtifact {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string; // "Footprints" | "Shield" | "PenTool" | "Wine" | "Scroll" | "Dumbbell" | "GlassWater" | "Sparkles" | "Shirt" | "Wand2" | "Gem" | "Clock" | "Crown" | "BookOpen" | "Heart"
  effect: string;
  created_by?: string;
}
```

### Interface: `StudentMessage`

* **Descripción:** Notificaciones internas de gamificación enviadas al buzón del alumno.
* **Mapeo de Base de Datos:** Mapea a la tabla `public.student_messages`.
* **Relaciones:** Vinculado a `Student` (N:1).
* **Impacto en Estado:** Renderizado en el buzón del estudiante de `useStudentStore`.

```typescript
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
```

