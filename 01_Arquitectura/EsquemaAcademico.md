---
title: "Esquema Base del Módulo Académico"
description: "Tablas y tipos que sustentan la estructura escolar básica: escuelas, ciclos escolares, periodos, grupos, materias, asistencias e inscripciones."
type: "concept-doc"
tags:
  - academico
  - base
  - escuela
  - calificaciones
  - asistencia
database_tables:
  - public.schools
  - public.academic_years
  - public.academic_periods
  - public.levels_grades
  - public.groups
  - public.subjects
  - public.enrollments
  - public.teacher_assignments
  - public.attendance
  - public.grades
typescript_models:
  - School
  - AcademicYear
  - AcademicPeriod
  - LevelGrade
  - Group
  - Subject
  - Enrollment
  - TeacherAssignment
  - AttendanceStatus
  - Attendance
  - Grade
  - SchoolSettings
  - ClassSchedule
  - ParentMessage
zustand_stores:
  - useSchoolAdminStore
last_sync: 2026-06-21T05:34:02.145Z
---

# Esquema Base del Módulo Académico

> [!NOTE]
> Tablas y tipos que sustentan la estructura escolar básica: escuelas, ciclos escolares, periodos, grupos, materias, asistencias e inscripciones.

## 🗄️ Esquema de Base de Datos (Supabase / PostgreSQL)

### Tabla `public.schools`

* **Descripción:** Representa planteles o escuelas administradas bajo el sistema ISkool.
* **Relaciones:** Raíz de datos escolares. Padre de `academic_years`, `groups`, `subjects`, `students`.

```sql
create table public.schools (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  cct text unique, -- Clave de Centro de Trabajo (SEP)
  address text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### Tabla `public.academic_years`

* **Descripción:** Define los ciclos escolares anuales (e.g., 2025-2026).
* **Relaciones:** Pertenece a `schools` (N:1). Padre de `academic_periods` y `groups`.

```sql
create table public.academic_years (
  id uuid default uuid_generate_v4() primary key,
  school_id uuid references public.schools(id) on delete cascade not null,
  name text not null, -- e.g., "2025-2026"
  start_date date not null,
  end_date date not null,
  is_active boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### Tabla `public.academic_periods`

* **Descripción:** Bloques de evaluación formativa bimestral o semestral.
* **Relaciones:** Pertenece a `academic_years` (N:1). Referenciado en `grades` (1:N).

```sql
create table public.academic_periods (
  id uuid default uuid_generate_v4() primary key,
  academic_year_id uuid references public.academic_years(id) on delete cascade not null,
  name text not null, -- e.g., "Bimestre 1", "Bimestre 2"
  start_date date not null,
  end_date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### Tabla `public.levels_grades`

* **Descripción:** Catálogo estático de niveles educativos y sus correspondientes grados académicos (SEP).
* **Relaciones:** Padre de `groups` (1:N) y `subjects` (1:N).

```sql
create table public.levels_grades (
  id uuid default uuid_generate_v4() primary key,
  level_name text not null check (level_name in ('primaria', 'secundaria', 'preparatoria')),
  grade_name text not null, -- e.g., "1º", "2º", "3º"
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### Tabla `public.groups`

* **Descripción:** Grupos y secciones asignadas a un grado escolar y plantel (e.g., 4º "A").
* **Relaciones:** Vinculado a `schools` (N:1), `levels_grades` (N:1), y `academic_years` (N:1). Padre de `enrollments` y `teacher_assignments`.

```sql
create table public.groups (
  id uuid default uuid_generate_v4() primary key,
  school_id uuid references public.schools(id) on delete cascade not null,
  level_grade_id uuid references public.levels_grades(id) on delete cascade not null,
  academic_year_id uuid references public.academic_years(id) on delete cascade not null,
  name text not null, -- e.g., "A", "B"
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### Tabla `public.subjects`

* **Descripción:** Asignaturas curriculares oficiales o institucionales.
* **Relaciones:** Vinculado a `schools` (N:1), `levels_grades` (N:1). Padre de `teacher_assignments`, `attendance`, `grades`, y `missions`.

```sql
create table public.subjects (
  id uuid default uuid_generate_v4() primary key,
  school_id uuid references public.schools(id) on delete cascade not null,
  level_grade_id uuid references public.levels_grades(id) on delete cascade not null,
  name text not null, -- e.g., "Matemáticas I"
  sep_code text, -- Official SEP code if applicable
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### Tabla `public.enrollments`

* **Descripción:** Historial de inscripciones de estudiantes en grupos para ciclos específicos.
* **Relaciones:** Vincula `students` (N:1) con `groups` (N:1).

```sql
create table public.enrollments (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.students(id) on delete cascade not null,
  group_id uuid references public.groups(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### Tabla `public.teacher_assignments`

* **Descripción:** Mapeo de docentes a materias y grupos específicos (carga horaria).
* **Relaciones:** Vincula `profiles` (N:1) (del docente), `groups` (N:1), y `subjects` (N:1).

```sql
create table public.teacher_assignments (
  id uuid default uuid_generate_v4() primary key,
  teacher_id uuid references public.profiles(id) on delete cascade not null,
  group_id uuid references public.groups(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### Tabla `public.attendance`

* **Descripción:** Asistencia diaria por grupo y materia.
* **Relaciones:** Vincula `students` (N:1), `groups` (N:1), `subjects` (N:1) (opcional), y `profiles` (N:1) (del docente evaluador).

```sql
create table public.attendance (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.students(id) on delete cascade not null,
  group_id uuid references public.groups(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete cascade, -- null if general school attendance
  date date not null default current_date,
  status text not null check (status in ('presente', 'falta', 'retardo', 'justificado')),
  comments text,
  registered_by uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### Tabla `public.grades`

* **Descripción:** Calificaciones cuantitativas de exámenes u ordinarias (SEP).
* **Relaciones:** Vincula `students` (N:1), `subjects` (N:1), y `academic_periods` (N:1).

```sql
create table public.grades (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.students(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete cascade not null,
  period_id uuid references public.academic_periods(id) on delete cascade not null,
  score numeric(3,1) not null check (score >= 5.0 and score <= 10.0),
  comments text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

---

## 💻 Modelos de TypeScript (`src/types/index.ts`)

### Interface `School`

* **Descripción:** Representa un plantel o escuela en el sistema.
* **Base de Datos:** Mapea a la tabla `public.schools`.
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

### Interface `AcademicYear`

* **Descripción:** Representa un ciclo escolar (e.g., 2025-2026).
* **Base de Datos:** Mapea a la tabla `public.academic_years`.
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

### Interface `AcademicPeriod`

* **Descripción:** Representa bloques de evaluación dentro de un ciclo escolar (e.g., Bimestre 1).
* **Base de Datos:** Mapea a la tabla `public.academic_periods`.
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

### Interface `LevelGrade`

* **Descripción:** Cataloga niveles educativos (primaria, secundaria, preparatoria) y sus grados respectivos.
* **Base de Datos:** Mapea a la tabla `public.levels_grades`.
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

### Interface `Group`

* **Descripción:** Define un grupo escolar (e.g., 4º "A").
* **Base de Datos:** Mapea a la tabla `public.groups`.
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

### Interface `Subject`

* **Descripción:** Materia académica dictada en el colegio (e.g., Matemáticas).
* **Base de Datos:** Mapea a la tabla `public.subjects`.
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

### Interface `Enrollment`

* **Descripción:** Inscripción de un estudiante en un grupo específico para un ciclo escolar.
* **Base de Datos:** Mapea a la tabla `public.enrollments`.
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

### Interface `TeacherAssignment`

* **Descripción:** Asignación que define qué docente imparte qué materia en qué grupo.
* **Base de Datos:** Mapea a la tabla `public.teacher_assignments`.
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

### Type `AttendanceStatus`

* **Descripción:** Opciones de registro de asistencia diaria.

```typescript
export type AttendanceStatus = 'presente' | 'falta' | 'retardo' | 'justificado';
```

### Interface `Attendance`

* **Descripción:** Registro de asistencia de un estudiante en una fecha determinada.
* **Base de Datos:** Mapea a la tabla `public.attendance`.
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

### Interface `Grade`

* **Descripción:** Calificación cuantitativa ordinaria asignada a un estudiante en una materia y periodo.
* **Base de Datos:** Mapea a la tabla `public.grades`.
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

### Interface `SchoolSettings`

* **Descripción:** Configuraciones generales de personalización visual e identidad escolar.
* **Base de Datos:** Mapea a la tabla `public.school_settings` (o config escolar en Supabase).
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

### Interface `ClassSchedule`

* **Descripción:** Programación o bloque de horario de una materia y docente para un grupo.
* **Base de Datos:** Mapea a la tabla `public.class_schedules`.
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

### Interface `ParentMessage`

* **Descripción:** Mensaje o alerta formal enviada al tutor sobre el desempeño del estudiante.
* **Base de Datos:** Mapea a la tabla `public.parent_messages`.
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

---

## 🧠 Manejadores de Estado (Zustand Stores)

### Store `useSchoolAdminStore`

Gestiona el estado en cliente y sincronización asíncrona mediante políticas de seguridad (RLS).

#### Interfaz del Almacén (`SchoolAdminStoreState`):

```typescript
interface SchoolAdminStoreState {
  schoolSettings: SchoolSettings;
  detailedStudents: DetailedStudent[];
  groupsList: Group[];
  schedulesList: ClassSchedule[];
  attendanceList: Attendance[];
  parentMessages: ParentMessage[];
  syncError: string | null;

  // Actions
  saveSchoolSettings: (settings: SchoolSettings) => void;
  registerStudent: (studentData: Omit<DetailedStudent, 'id'>) => void;
  generateGroupsForGrade: (level: 'primaria' | 'secundaria' | 'preparatoria', grade: string, groupNames: string[]) => void;
  assignStudentToGroup: (studentId: string, groupId: string) => void;
  createSchedule: (scheduleData: Omit<ClassSchedule, 'id'>) => void;
  deleteSchedule: (scheduleId: string) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  saveAttendanceList: (records: Omit<Attendance, 'id' | 'created_at' | 'registered_by'>[]) => void;
  sendParentMessage: (msg: Omit<ParentMessage, 'id' | 'sent_at' | 'is_read'>) => void;
  replyToParentMessage: (messageId: string, replyText: string) => void;
  markMessageAsRead: (messageId: string) => void;
  resetSchoolAdminStore: () => void;
}
```

