---
title: "Misiones, Retos y Recompensas (Gamificación)"
description: "Modelos de base de datos e interfaces TypeScript para el sistema de medallas, misiones, cuestionarios y el portafolio formativo."
type: "concept-doc"
tags:
  - gamificacion
  - misiones
  - retos
  - tienda
  - portafolio
database_tables:
  - public.badges
  - public.student_badges
  - public.missions
  - public.quests
  - public.quest_attempts
  - public.portfolio_items
  - public.portfolio_feedback
typescript_models:
  - BadgeCategory
  - Badge
  - StudentBadge
  - Mission
  - QuestType
  - QuizQuestion
  - QuizContent
  - ExamContent
  - SubmissionContent
  - Quest
  - QuestAttempt
  - PortfolioItemStatus
  - PortfolioFileType
  - PortfolioItem
  - FeedbackAuthorRole
  - PortfolioFeedback
  - GuildBoss
  - GuildMemberSubmission
  - ShopArtifact
zustand_stores:
  - useGamificationStore
  - usePortfolioStore
last_sync: 2026-06-21T05:34:02.141Z
---

# Misiones, Retos y Recompensas (Gamificación)

> [!NOTE]
> Modelos de base de datos e interfaces TypeScript para el sistema de medallas, misiones, cuestionarios y el portafolio formativo.

## 🗄️ Esquema de Base de Datos (Supabase / PostgreSQL)

### Tabla `public.badges`

* **Descripción:** Catálogo global de insignias y medallas académicas, sociales, de persistencia y creativas.
* **Relaciones:** Referenciado por `public.student_badges` (1:N) para mapear medallas ganadas.
* **Impacto en Estado:** Listado global en la tienda de medallas de `useGamificationStore` (`badges`).

```sql
create table public.badges (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text not null,
  icon_name text not null, -- Nombre del icono a renderizar (Lucide React)
  category text not null check (category in ('academic', 'social', 'persistence', 'creative')),
  xp_required integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### Tabla `public.student_badges`

* **Descripción:** Relación de unión que registra qué insignias ha obtenido cada estudiante y la fecha de obtención.
* **Relaciones:** Vincula `public.students` (N:1) y `public.badges` (N:1).
* **Impacto en Estado:** Administrado y actualizado por `unlockBadge` en `useGamificationStore`.

```sql
create table public.student_badges (
  student_id uuid references public.students(id) on delete cascade not null,
  badge_id uuid references public.badges(id) on delete cascade not null,
  earned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (student_id, badge_id)
);
```

### Tabla `public.missions`

* **Descripción:** Misión del mapa de aprendizaje narrativo de una materia para un grado específico.
* **Relaciones:** Pertenece a `public.schools` (N:1), `public.subjects` (N:1), y `public.levels_grades` (N:1). Padre de `public.quests` (1:N).
* **Impacto en Estado:** Cargado dinámicamente mediante `fetchMissions` en `useGamificationStore` (`missions`).

```sql
create table public.missions (
  id uuid default uuid_generate_v4() primary key,
  school_id uuid references public.schools(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete cascade not null,
  level_grade_id uuid references public.levels_grades(id) on delete cascade not null,
  title text not null,
  description text not null,
  story_intro text not null, -- Texto introductorio de la narrativa
  map_position_x integer not null, -- Coordenada X para el mapa de misiones
  map_position_y integer not null, -- Coordenada Y para el mapa de misiones
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### Tabla `public.quests`

* **Descripción:** Reto o actividad académica (cuestionario, examen o entrega de portafolio) dentro de una misión.
* **Relaciones:** Pertenece a `public.missions` (N:1). Referenciado por `public.quest_attempts` (1:N) y `public.portfolio_items` (1:N).
* **Impacto en Estado:** Determina las preguntas, recompensas de XP/monedas y formato de evidencias renderizados en la UI.

```sql
create table public.quests (
  id uuid default uuid_generate_v4() primary key,
  mission_id uuid references public.missions(id) on delete cascade not null,
  title text not null,
  description text not null,
  type text not null check (type in ('quiz', 'portfolio_submission')),
  sequence_order integer not null,
  xp_reward integer default 50 not null,
  coins_reward integer default 10 not null,
  content jsonb not null, -- Cuestionario o instrucciones de la entrega
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (mission_id, sequence_order)
);
```

### Tabla `public.quest_attempts`

* **Descripción:** Registro histórico de los intentos realizados por un estudiante para resolver un reto (quest). Permite registrar el progreso, respuestas y feedback.
* **Relaciones:** Vincula `public.students` (N:1) y `public.quests` (N:1).
* **Impacto en Estado:** Creado al completar un reto. Afecta los estados de `useGamificationStore` (`submitQuiz`, `submitExam`).

```sql
create table public.quest_attempts (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.students(id) on delete cascade not null,
  quest_id uuid references public.quests(id) on delete cascade not null,
  score numeric(5,2) not null, -- Puntuación obtenida (porcentaje 0.00 a 100.00)
  is_completed boolean default false not null,
  answers jsonb, -- Respuestas dadas por el alumno
  feedback text, -- Retroalimentación automática
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### Tabla `public.portfolio_items`

* **Descripción:** Portafolio digital de evidencias de aprendizaje (estilo Seesaw) donde los estudiantes suben tareas para evaluación docente.
* **Relaciones:** Vincula `public.students` (N:1), `public.subjects` (N:1), y opcionalmente `public.quests` (N:1). Padre de `public.portfolio_feedback` (1:N).
* **Impacto en Estado:** Administrado por `usePortfolioStore` (`portfolioItems`). Sujeto a políticas RLS por estudiante y por grupo para docentes.

```sql
create table public.portfolio_items (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.students(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete cascade not null,
  quest_id uuid references public.quests(id) on delete set null, -- Opcional
  title text not null,
  description text,
  file_url text not null,
  file_type text not null check (file_type in ('image', 'audio', 'video', 'pdf', 'link')),
  status text not null default 'submitted' check (status in ('draft', 'submitted', 'approved', 'needs_revision')),
  self_reflection text, -- Reflexión del propio alumno (Autoevaluación)

  -- Coevaluación y Proyectos de Preparatoria
  peer_review_score numeric(3,1) check (peer_review_score >= 0.0 and peer_review_score <= 10.0),
  peer_review_comments text,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### Tabla `public.portfolio_feedback`

* **Descripción:** Retroalimentación formativa y multidireccional (de profesores, padres o compañeros) a una evidencia del portafolio.
* **Relaciones:** Pertenece a `public.portfolio_items` (N:1). Escrito por un perfil de usuario en `public.profiles` (N:1).
* **Impacto en Estado:** Actualizado en tiempo real en la vista de evidencias en `usePortfolioStore` (`addPortfolioFeedback`).

```sql
create table public.portfolio_feedback (
  id uuid default uuid_generate_v4() primary key,
  portfolio_item_id uuid references public.portfolio_items(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  author_role text not null check (author_role in ('teacher', 'parent', 'student', 'peer')),
  feedback_text text not null,
  reactions jsonb default '{}'::jsonb not null, -- Emojis de apoyo
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

---

## 💻 Modelos de TypeScript (`src/types/index.ts`)

### Type `BadgeCategory`

* **Descripción:** Categorías de medallas e insignias escolares.

```typescript
export type BadgeCategory = 'academic' | 'social' | 'persistence' | 'creative';
```

### Interface `Badge`

* **Descripción:** Catálogo de insignias que un estudiante puede ganar.
* **Base de Datos:** Mapea a la tabla `public.badges`.
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

### Interface `StudentBadge`

* **Descripción:** Registro de insignias obtenidas por un estudiante.
* **Base de Datos:** Mapea a la tabla `public.student_badges`.
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

### Interface `Mission`

* **Descripción:** Misión del mapa de aprendizaje que engloba una narrativa y varios retos.
* **Base de Datos:** Mapea a la tabla `public.missions`.
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

### Type `QuestType`

* **Descripción:** Tipos de retos escolares soportados.

```typescript
export type QuestType = 'quiz' | 'portfolio_submission' | 'exam';
```

### Interface `QuizQuestion`

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

### Interface `QuizContent`

* **Descripción:** Estructura de cuestionario común para Quests de tipo 'quiz'.

```typescript
export interface QuizContent {
  questions: QuizQuestion[];
}
```

### Interface `ExamContent`

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

### Interface `SubmissionContent`

* **Descripción:** Parámetros y formatos aceptados para retos de entrega de evidencias.

```typescript
export interface SubmissionContent {
  instructions: string;
  acceptedFormats: string[]; // e.g., ["image", "audio", "video"]
}
```

### Interface `Quest`

* **Descripción:** Reto o actividad dentro de una misión académica.
* **Base de Datos:** Mapea a la tabla `public.quests`.
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

### Interface `QuestAttempt`

* **Descripción:** Registro detallado del intento de resolución de un reto por un estudiante.
* **Base de Datos:** Mapea a la tabla `public.quest_attempts`.
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

### Type `PortfolioItemStatus`

* **Descripción:** Estado de revisión formativa de una evidencia.

```typescript
export type PortfolioItemStatus = 'draft' | 'submitted' | 'approved' | 'needs_revision';
```

### Type `PortfolioFileType`

* **Descripción:** Formato multimedia de la evidencia cargada.

```typescript
export type PortfolioFileType = 'image' | 'audio' | 'video' | 'pdf' | 'link';
```

### Interface `PortfolioItem`

* **Descripción:** Evidencia de aprendizaje cargada por el estudiante para evaluación del docente.
* **Base de Datos:** Mapea a la tabla `public.portfolio_items`.
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

### Type `FeedbackAuthorRole`

* **Descripción:** Rol del autor que emite una retroalimentación formativa.

```typescript
export type FeedbackAuthorRole = 'teacher' | 'parent' | 'student' | 'peer';
```

### Interface `PortfolioFeedback`

* **Descripción:** Retroalimentación o comentarios añadidos a una evidencia del portafolio.
* **Base de Datos:** Mapea a la tabla `public.portfolio_feedbacks`.
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

### Interface `GuildBoss`

* **Descripción:** Parámetros de vida y recompensa del jefe grupal activo en una batalla de examen.
* **Base de Datos:** Mapea a la tabla `public.guild_bosses`.
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

### Interface `GuildMemberSubmission`

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

### Interface `ShopArtifact`

* **Descripción:** Objeto mágico disponible para compra en la Tienda del estudiante.
* **Base de Datos:** Mapea a la tabla `public.shop_artifacts`.
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

---

## 🧠 Manejadores de Estado (Zustand Stores)

### Store `useGamificationStore`

Gestiona el estado en cliente y sincronización asíncrona mediante políticas de seguridad (RLS).

#### Interfaz del Almacén (`GamificationStoreState`):

```typescript
interface GamificationStoreState {
  missionsList: Mission[];
  questAttempts: QuestAttempt[];
  studentBadges: StudentBadge[];
  guildBoss: GuildBoss;
  guildSubmissions: GuildMemberSubmission[];
  shopArtifacts: ShopArtifact[];
  isLoadingMissions: boolean;
  syncError: string | null;

  // Actions
  submitQuiz: (questId: string, score: number, answers: Record<string, string | number>) => Promise<{
    xpEarned: number;
    coinsEarned: number;
    leveledUp: boolean;
    badgeEarned: Badge | null;
  }>;

  submitExam: (
    questId: string,
    score: number,
    answers: Record<string, string | number>,
    statBoost?: { strength?: number; intelligence?: number; defense?: number },
    customLoot?: string
  ) => Promise<{
    xpEarned: number;
    coinsEarned: number;
    leveledUp: boolean;
    badgeEarned: Badge | null;
  }>;

  saveQuest: (subjectId: string, questData: Omit<Quest, 'created_at'> & { id?: string }) => Promise<void>;
  triggerGuildAttack: (damage: number) => Promise<void>;
  resetGuildBoss: () => void;
  submitGuildHomework: (studentId: string, onTime: boolean) => void;
  createArtifact: (artifactData: Omit<ShopArtifact, 'id'>) => Promise<void>;
  unlockBadge: (studentId: string, badgeId: string) => Promise<void>;
  fetchMissions: () => Promise<void>;
  fetchActiveGuildBoss: () => Promise<void>;
  subscribeToGuildChanges: () => () => void;
  resetGamificationStore: () => void;
}
```

### Store `usePortfolioStore`

Gestiona el estado en cliente y sincronización asíncrona mediante políticas de seguridad (RLS).

#### Interfaz del Almacén (`PortfolioStoreState`):

```typescript
interface PortfolioStoreState {
  portfolioItems: PortfolioItem[];
  isLoadingPortfolio: boolean;

  // Actions
  submitPortfolioItem: (
    title: string,
    description: string,
    fileUrl: string,
    fileType: any,
    selfReflection: string,
    questId?: string,
    subjectId?: string
  ) => void;

  submitPortfolioItemOnBehalf: (
    studentId: string,
    title: string,
    description: string,
    fileUrl: string,
    fileType: any,
    selfReflection: string,
    questId?: string,
    subjectId?: string
  ) => void;

  addPortfolioFeedback: (itemId: string, text: string, role: FeedbackAuthorRole, authorId: string) => void;
  addReaction: (itemId: string, roleCategory: string, emoji: string) => void;

  reviewPortfolioItem: (
    itemId: string,
    status: PortfolioItemStatus,
    comment: string,
    xpAward?: number,
    campos_formativos?: string[],
    pdas?: string[],
    ejes_articuladores?: string[],
    xp_breakdown?: {
      scientific?: number;
      critical?: number;
      collaborative?: number;
      communication?: number;
    }
  ) => void;

  linkPortfolioItemToQuest: (itemId: string, questId: string) => void;
  submitPeerReview: (itemId: string, score: number, comment: string) => void;
  fetchPortfolioItems: (groupId?: string) => Promise<void>;
  resetPortfolioStore: () => void;
}
```

