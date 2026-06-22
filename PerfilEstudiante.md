---
title: "Perfil y Progresión del Estudiante"
description: "Documentación de tipos, tablas e interfaces relacionados con el perfil, estadísticas y avatar del estudiante."
type: "concept-doc"
tags:
  - perfil
  - estudiante
  - avatar
  - stats
database_tables:
  - public.profiles
  - public.students
  - public.parent_student
  - public.student_stats
  - public.student_avatars
typescript_models:
  - UserRole
  - UserProfile
  - Student
  - StudentStats
  - StudentAvatar
  - DetailedStudent
  - StudentMessage
zustand_stores:
  - useStudentStore
last_sync: 2026-06-21T05:34:02.137Z
---

# Perfil y Progresión del Estudiante

> [!NOTE]
> Documentación de tipos, tablas e interfaces relacionados con el perfil, estadísticas y avatar del estudiante.

## 🗄️ Esquema de Base de Datos (Supabase / PostgreSQL)

### Tabla `public.profiles`

* **Descripción:** Almacena la información de perfil para todos los roles de usuario en el sistema.
* **Relaciones:** Extiende `auth.users` (1:1). Relación 1:1 con `students`. Referenciado en `teacher_assignments`, `parent_student`, `attendance`.

```sql
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  first_name text not null,
  last_name text not null,
  role text not null check (role in ('superadmin', 'admin', 'director', 'coordinator', 'teacher', 'student', 'parent')),
  email text unique not null,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### Tabla `public.students`

* **Descripción:** Fichas académicas específicas para estudiantes.
* **Relaciones:** Vinculado a `profiles` (1:1) y `schools` (N:1). Padre de `enrollments`, `attendance`, `grades`, `student_stats`, `student_avatars`.

```sql
create table public.students (
  id uuid references public.profiles(id) on delete cascade primary key,
  school_id uuid references public.schools(id) on delete cascade not null,
  curp text unique,
  birth_date date,
  enrollment_id text unique, -- Matrícula interna
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### Tabla `public.parent_student`

* **Descripción:** Relación entre padres o tutores y sus respectivos hijos estudiantes.
* **Relaciones:** Vincula `profiles` (N:1) (del padre/tutor) con `students` (N:1).

```sql
create table public.parent_student (
  parent_id uuid references public.profiles(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  relationship text not null, -- e.g., "Padre", "Madre", "Tutor"
  primary key (parent_id, student_id)
);
```

### Tabla `public.student_stats`

* **Descripción:** Almacena las estadísticas de gamificación y progresión de nivel de un estudiante. Contiene datos de RPG (Secundaria) y financiamiento (Preparatoria).
* **Relaciones:** Vinculado a `public.students` (1:1) mediante `student_id` con cascada de eliminación.
* **Impacto en Estado:** Cargado y administrado por `useStudentStore` (`stats`, `activeStudentId`). Actualizado al ganar XP/Coins o gastar skill_points.

```sql
create table public.student_stats (
  student_id uuid references public.students(id) on delete cascade primary key,
  xp integer default 0 not null check (xp >= 0),
  level integer default 1 not null check (level >= 1),
  coins integer default 0 not null check (coins >= 0),
  current_streak integer default 0 not null check (current_streak >= 0),
  max_streak integer default 0 not null check (max_streak >= 0),
  last_active_date date,
  
  -- Atributos RPG (Secundaria)
  rpg_class text check (rpg_class in ('guerrero', 'mago', 'curandero', 'explorador')),
  attribute_strength integer default 10 check (attribute_strength >= 0),
  attribute_intelligence integer default 10 check (attribute_intelligence >= 0),
  attribute_defense integer default 10 check (attribute_defense >= 0),
  skill_points integer default 0 check (skill_points >= 0),
  
  -- Financiamiento (Preparatoria)
  funding_credits integer default 1000 check (funding_credits >= 0),
  
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### Tabla `public.student_avatars`

* **Descripción:** Configuración estética del avatar del alumno (personalización) y estado de su mascota virtual (exclusivo para Primaria Baja).
* **Relaciones:** Vinculado a `public.students` (1:1) mediante `student_id` con cascada de eliminación.
* **Impacto en Estado:** Leído y modificado en `useStudentStore` mediante `changeAvatar` y actualización de mascota.

```sql
create table public.student_avatars (
  student_id uuid references public.students(id) on delete cascade primary key,
  avatar_name text not null default 'Explorador',
  hair_style text not null default 'classic',
  hair_color text not null default '#4B5563',
  eyes_style text not null default 'happy',
  outfit_style text not null default 'space_suit',
  outfit_color text not null default '#3B82F6',
  background_style text not null default 'nebula',
  unlocked_items text[] default array['classic', 'happy', 'space_suit', 'nebula']::text[] not null,
  
  -- Mascota Virtual (Primaria Baja)
  pet_type text default 'dragon' check (pet_type in ('dragon', 'gatito', 'osito')),
  pet_name text default 'Chispas' not null,
  pet_hunger integer default 50 check (pet_hunger >= 0 and pet_hunger <= 100),
  pet_happiness integer default 50 check (pet_happiness >= 0 and pet_happiness <= 100),
  pet_outfit text default 'none',
  
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

---

## 💻 Modelos de TypeScript (`src/types/index.ts`)

### Type `UserRole`

* **Descripción:** Define los roles de usuario autorizados en el sistema escolar.
* **Impacto en Estado:** Determina los permisos en el frontend, accesibilidad de rutas y control RLS.

```typescript
export type UserRole = 'superadmin' | 'admin' | 'director' | 'coordinator' | 'teacher' | 'student' | 'parent';
```

### Interface `UserProfile`

* **Descripción:** Datos básicos del perfil general de cualquier usuario.
* **Base de Datos:** Mapea a la tabla `public.profiles`.
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

### Interface `Student`

* **Descripción:** Perfil específico del rol estudiante.
* **Base de Datos:** Mapea a la tabla `public.students`.
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

### Interface `StudentStats`

* **Descripción:** Estadísticas de gamificación y progresión de nivel de un estudiante.
* **Base de Datos:** Mapea a la tabla `public.student_stats`.
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

### Interface `StudentAvatar`

* **Descripción:** Configuración estética del avatar del alumno y el estado de su mascota.
* **Base de Datos:** Mapea a la tabla `public.student_avatars`.
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

### Interface `DetailedStudent`

* **Descripción:** Expediente escolar extendido para el control del coordinador escolar.
* **Base de Datos:** Mapea a la tabla `public.students` y join con perfiles médicos e historiales de conducta.
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

### Interface `StudentMessage`

* **Descripción:** Notificaciones internas de gamificación enviadas al buzón del alumno.
* **Base de Datos:** Mapea a la tabla `public.student_messages`.
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

---

## 🧠 Manejadores de Estado (Zustand Stores)

### Store `useStudentStore`

Gestiona el estado en cliente y sincronización asíncrona mediante políticas de seguridad (RLS).

#### Interfaz del Almacén (`StudentStoreState`):

```typescript
interface StudentStoreState {
  activeStudentId: string;
  allStats: Record<string, StudentStats>;
  allAvatars: Record<string, StudentAvatar>;
  studentInventoryMap: Record<string, string[]>;
  studentMessages: StudentMessage[];
  isLoadingStats: boolean;
  
  // Actions
  switchStudent: (studentId: string) => Promise<void>;
  changeAvatar: (config: Partial<StudentAvatar>) => void;
  feedPet: () => void;
  playWithPet: () => void;
  levelUpAttribute: (statName: 'strength' | 'intelligence' | 'defense') => Promise<void>;
  purchaseArtifact: (studentId: string, artifactId: string) => Promise<void>;
  grantArtifact: (studentId: string, artifactId: string) => Promise<void>;
  revokeArtifact: (studentId: string, artifactId: string, reason: string) => Promise<void>;
  markStudentMessageAsRead: (messageId: string) => void;
  fetchStats: (groupId?: string) => Promise<void>;
  
  // Cross-store helpers
  addXpAndCoins: (studentId: string, xpEarned: number, coinsEarned: number, levelUpCallback?: (leveledUp: boolean) => void) => void;
  updateStatsAfterExam: (
    studentId: string, 
    xpEarned: number, 
    coinsEarned: number, 
    statBoost?: { strength?: number; intelligence?: number; defense?: number },
    customLoot?: string
  ) => void;
  initializeNewStudent: (studentId: string, firstName: string) => void;
  resetStudentStore: () => void;
}
```

