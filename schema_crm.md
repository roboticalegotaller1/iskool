---
title: Esquema CRM Escolar ISkool
aliases: [CRM Schema, Schema Admisiones]
tags: [iskool, crm, base-de-datos, admisiones, schema]
created: 2026-09-23
updated: 2026-09-23
---

# Esquema de Base de Datos — CRM Escolar ISkool

> **Módulo:** Admisiones, Retención y Gestión de Matrícula  
> **Base de datos:** PostgreSQL (Supabase)  
> **Aislamiento:** Multi-inquilino por `school_id`  

## Diagrama de Relaciones

```mermaid
erDiagram
    schools ||--o{ crm_leads : "tiene"
    crm_leads ||--o{ crm_lead_candidates : "tiene hijos"
    crm_leads ||--o{ crm_activities : "tiene seguimiento"
    crm_leads ||--o{ crm_documents : "tiene expediente"
    crm_leads }o--o| crm_leads : "referido por"
    profiles }o--o{ crm_leads : "asesor asignado"
    schools ||--o{ crm_events : "organiza"
    crm_events ||--o{ crm_event_attendees : "tiene invitados"
    crm_leads ||--o{ crm_event_attendees : "asiste a"
    crm_lead_candidates }o--o| students : "se convierte en"
    schools ||--o{ crm_nps_surveys : "mide satisfacción"
    schools ||--o{ crm_exit_interviews : "registra salidas"
```

## Tablas

### Fase 1: Core

| Tabla | Descripción | FK Principal |
|---|---|---|
| `crm_leads` | Prospecto familiar (tutor con N hijos) | `schools.id` |
| `crm_lead_candidates` | Hijo/alumno candidato | `crm_leads.id` |
| `crm_activities` | Bitácora de seguimiento (llamadas, visitas, notas) | `crm_leads.id` |
| `crm_documents` | Expediente digital de admisión | `crm_leads.id` |

### Fase 2: Captación

| Tabla | Descripción | FK Principal |
|---|---|---|
| `crm_events` | Eventos de captación (Open House, ferias) | `schools.id` |
| `crm_event_attendees` | Asistentes a eventos | `crm_events.id` |

### Fase 3: Retención

| Tabla | Descripción | FK Principal |
|---|---|---|
| `crm_nps_surveys` | Encuestas NPS de satisfacción | `schools.id` |
| `crm_exit_interviews` | Entrevistas de salida por baja | `schools.id` |

## Referencia SQL

Ver archivo: [[schema_crm.sql]]
