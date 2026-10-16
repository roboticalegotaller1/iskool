---
title: "Manejador de Estado Académico y Administración"
description: "Acciones y estado del cliente para la gestión escolar, grupos, horarios, calificaciones y configuraciones generales del administrador y profesor."
type: "concept-doc"
tags:
  - store
  - zustand
  - administracion
  - acciones
zustand_stores:
  - useSchoolAdminStore
last_sync: 2026-06-21T05:34:02.147Z
---

# Manejador de Estado Académico y Administración

> [!NOTE]
> Acciones y estado del cliente para la gestión escolar, grupos, horarios, calificaciones y configuraciones generales del administrador y profesor.

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

