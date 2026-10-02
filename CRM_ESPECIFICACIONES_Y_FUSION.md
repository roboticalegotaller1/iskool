# Especificaciones Técnicas, Comparativa y Arquitectura del CRM Unificado ISkool

> **Documento Oficial de Arquitectura de Software & Gestión Escolar**  
> **Sistema:** ISkool — Plataforma Integral de Gestión y Acompañamiento Educativo  
> **Versión:** 2.0 (Fusión Estratégica CRM + Admisiones Institucionales)  
> **Autor:** Equipo de Arquitectura de Software ISkool  
> **Normativa de Datos:** Estándar Oficial Mexicano (Separación Estricta de Apellido Paterno y Materno)  
> **Políticas de Privacidad:** Cumplimiento de Marca Blanca Institucional  

---

## 1. Resumen Ejecutivo y Visión del Producto

El proceso de captación, admisión y matrícula es la arteria financiera y de crecimiento de cualquier institución educativa privada en México. Una fricción en la velocidad de respuesta, una pérdida de seguimiento a los padres de familia o un aislamiento entre el área de ventas y el control escolar provocan una fuga crítica de aspirantes.

Actualmente, ISkool cuenta con dos componentes de alto calibre desarrollados para resolver esta necesidad:
1. **El CRM Moderno de Admisiones (`/admin/crm`):** Un estudio interactivo tipo Kanban enfocado en la agilidad de los asesores de admisiones, gestión familiar multinivel (1 familia $\rightarrow$ $N$ hijos), control riguroso de expediente digital, scoring de reactividad y bitácora de seguimiento multicanal.
2. **El Módulo de Admisiones y Pipeline Directivo del Main (`CEOExecutiveDashboard.tsx`):** Un panel estratégico de gobernanza institucional multi-plantel que monitorea el valor monetario del ciclo ($4,180,000 MXN), la velocidad de conversión por tramo (9.5 días promedio vs 22 días del mercado), la corresponsabilidad de 5 departamentos escolares y la conexión directa hacia Control Escolar y Facturación Fiscal CFDI 4.0 IEDU SAT.

El propósito de este documento es detallar minuciosamente las especificaciones del CRM actual, compararlo con las capacidades directivas del Main, y formular la arquitectura del **CRM Escolar Unificado 360°**, integrando la agilidad operativa de campo con la profundidad financiera e institucional del colegio.

---

## 2. Especificaciones y Funcionalidades del CRM Actual (`/admin/crm`)

El CRM actual fue concebido como un estudio operativo ágil para el equipo de admisiones, promotores educativos y directores de plantel.

### 2.1. Arquitectura y Stack Tecnológico
- **Frontend:** Next.js 15 (React 19 Server/Client Components) con Tailwind CSS y animaciones fluidas (`framer-motion`).
- **Gestión de Estado:** Tienda reactiva centralizada con Zustand (`src/store/useCrmStore.ts`).
- **Tipado Estricto:** Definido en `src/types/crm.ts` con mapeo 1:1 hacia base de datos relacional Supabase.
- **Control de Acceso (RBAC):** Restringido a los roles institucionales:
  - `owner` (Dueño / Presidente del Consejo)
  - `director` (Director General / Director de Plantel)
  - `admin` / `superadmin` (Administrador del Sistema)
  - `admissions_sales` / `ventas` (Coordinador y Asesores de Admisiones)

### 2.2. Modelo de Datos Familiar Multinivel (1:N)
A diferencia de los CRM comerciales tradicionales que tratan cada contacto como una persona individual, el CRM de ISkool comprende la dinámica real de los colegios privados: **los padres inscriben a familias, no a prospectos aislados**.
- **Registro Padre (`CrmLead`):** Representa a la familia o tutor legal.
- **Registros Hijos (`CrmLeadCandidate`):** Múltiples aspirantes vinculados al mismo tutor, cada uno con su propio grado meta, historial de colegio de procedencia, necesidades de beca y estatus de evaluación.
- **Estándar de Nombres SEP:** Tanto en tutores como en alumnos, los apellidos se capturan y almacenan de forma estrictamente individualizada:
  - `tutor_first_name`, `tutor_last_name_1` (Paterno), `tutor_last_name_2` (Materno).
  - `first_name`, `last_name_1` (Paterno), `last_name_2` (Materno) en cada candidato.

### 2.3. Embudo Tridimensional de Pipelines
El sistema no se limita a admisiones de nuevo ingreso; soporta tres flujos operativos especializados:
1. **Nuevo Ingreso (`new_enrollment`):**
   - *1. Registrado:* Captación del lead y validación de datos.
   - *2. Contacto Efectivo:* Primer diálogo establecido con el tutor.
   - *3. Recorrido / Tour:* Cita presencial en el campus escolar.
   - *4. Evaluación Diagnóstica:* Examen cognitivo y socioemocional.
   - *5. Propuesta Económica:* Presentación de colegiaturas, becas y descuentos.
   - *6. Reserva de Plaza:* Pago de apartado de lugar.
   - *7. Inscrito ✓:* Matrícula formalizada.
   - *8. Declinado ✗:* Descarte con registro de motivo de pérdida.
2. **Reinscripciones (`reenrollment`):**
   - *1. Censo de Intención:* Confirmación de continuidad para el siguiente ciclo.
   - *2. Revisión de Estatus:* Consulta de no adeudos académicos y financieros.
   - *3. Pago de Reinscripción:* Liquidación de cuota anual.
   - *4. En Riesgo de Deserción:* Familias con dudas o riesgo de abandono escolar.
   - *5. Reinscrito ✓:* Confirmación en el padrón del siguiente ciclo.
   - *6. Baja Definitiva ✗:* Salida de la institución con entrevista de egreso.
3. **Transferencia Interna (`internal_transfer`):**
   - Paso natural entre niveles escolares (p. ej. de Preescolar 3° a Primaria 1°, o de Secundaria 3° a Preparatoria).
   - Etapas: *Detección Automática $\rightarrow$ Encuesta de Intención $\rightarrow$ Pre-Inscripción $\rightarrow$ Confirmación de Pago $\rightarrow$ Transferido ✓ $\rightarrow$ Salida ✗*.

### 2.4. Matriz de Prioridad en 1 Clic
Permite a los asesores y directores priorizar la atención diaria directamente desde la tarjeta del Kanban o desde la ficha del prospecto:
- `🔴 Caliente (Hot):` Máxima urgencia. Familias con alta intención de compra, visita programada o plaza por vencer.
- `🟡 Tibio (Warm):` Interés demostrado, en proceso de toma de decisiones o cotización.
- `🔵 Normal (Normal):` Flujo regular de seguimiento estándar.
- `⚪ Frío (Cold):` Sin respuesta inmediata, contacto informativo preliminar.

### 2.5. Algoritmo de Lead Scoring Dinámico (0 a 100 Puntos)
Calculado en tiempo real evaluando el comportamiento y atributos del aspirante:
- **Avance en el embudo:** De 5 pts (Registrado) hasta 100 pts (Inscrito).
- **Canal de captación calificado:** Recomendación familiar (+15 pts), Convenio empresarial (+10 pts).
- **Descuento por hermanos:** Familias con más de un hijo en el proceso (+20 pts).
- **Evaluación aprobada:** Dictamen psicopedagógico favorable (+20 pts).
- **Penalizaciones por estancamiento:** Pérdida de 10 pts si excede 7 días sin avance, y 20 pts si supera 14 días.
- **Penalización por prioridad fría:** -15 pts.

### 2.6. Bitácora de Seguimiento Multicanal (21 Tipos de Actividad)
Cada interacción queda asentada cronológicamente con su autor, fecha y notas:
- Canales de contacto: Llamada telefónica, WhatsApp directo (con botón de apertura con un clic), Correo electrónico, SMS.
- Eventos presenciales: Recorrido / Tour, Visita espontánea, Open House, Entrevista directiva, Reunión de comités.
- Hitos de expediente: Evaluación diagnóstica, Documento subido, Documento verificado, Solicitud de beca, Dictamen de beca, Pago recibido, Inscripción completada.
- Tareas y notas internas: Nota interna privada, Tarea programada (con alarma de vencimiento), Recordatorio de llamada, Tarea de seguimiento.

### 2.7. Expediente Documental Digital
Verificación y custodia de los 15 documentos requeridos por la normativa oficial y privada:
- Acta de Nacimiento, CURP del alumno, Cartilla de Vacunación, Boleta oficial de grado anterior, Carta de No Adeudo, Carta de Buena Conducta, Fotografías tamaño infantil, Certificado Médico escolar, Dictamen Psicopedagógico, Identificación oficial (INE) de tutores, Comprobante de Domicilio, Cartas de recomendación y Contrato de adhesión firmado.
- Estatus por documento: `⏳ Pendiente`, `📤 Subido`, `✅ Verificado`, `❌ Rechazado`, `⚠️ Vencido`.
- Barra de progreso porcentual del expediente en tiempo real.

### 2.8. Módulo de Analíticas y Business Intelligence
- Funnel gráfico interactivo con tasas de conversión entre etapas consecutivas.
- Rendimiento por canal de adquisición con cálculo de Costo de Adquisición (CAC).
- Matriz de motivos de declinación desglosada en 12 causales estandarizadas (colegiatura elevada, distancia/ubicación, cupo lleno, no aprobó diagnóstico, eligió otro colegio, cambio de ciudad, incompatibilidad de horarios, programa académico, etc.).

---

## 3. Análisis Profundo de la Sección Admisiones del Main (`CEOExecutiveDashboard.tsx`)

En el módulo del Main (`CEOExecutiveDashboard.tsx`), el enfoque de Admisiones está diseñado con una mentalidad de **Dirección General, Consejo de Administración y Auditoría Institucional Multi-Plantel**.

### 3.1. La Matriz de Corresponsabilidad Departamental (5 Fases)
El valor diferencial más potente del Main radica en responder con claridad ejecutiva a dos preguntas críticas: **¿Quién es responsable de reportar cada avance?** y **¿En qué pantalla o sistema se captura la información?**
El ciclo de captación no se concibe como una tarea aislada del vendedor, sino como un engranaje entre 5 departamentos del colegio:

| Fase Institucional | Nombre del Hito | Departamento Responsable | Ubicación / Sistema donde se Llena | Descripción del Entregable |
| :--- | :--- | :--- | :--- | :--- |
| **Fase 1 · Lead** | Captación & CRM | **Admisiones & Marketing** | Formulario Landing Web, Ferias Escolares o botón rápido "+ Registrar Aspirante" | Captura inicial de datos familiares, canal de origen y asignación de asesor. |
| **Fase 2 · Visita** | Tours de Campus | **Dirección de Campus & Relaciones Públicas** | Agenda de Visitas Guiadas / Directorio del Pipeline | Recorrido presencial de instalaciones STEAM, laboratorios y canchas con feedback directo. |
| **Fase 3 · Evaluación** | Diagnóstico | **Gabinete Psicopedagógico** | Expediente Diagnóstico Psicopedagógico | Evaluación cognitiva, socioemocional, madurativa y entrevista bilingüe de admisión. |
| **Fase 4 · Reserva** | Carta de Asignación | **Dirección Académica** | Comité Directivo de Asignación Escolar | Emisión formal de la Carta de Asignación con reserva de plaza en grupo específico y vigencia estipulada. |
| **Fase 5 · Matrícula** | Inscripción Pagada | **Caja, Tesorería & Control Escolar** | Módulo de Cobranza SPEI + Padrón de Alumnos SEP | Conciliación de pago bancario, timbrado fiscal CFDI 4.0 con complemento IEDU SAT y alta definitiva en matrícula. |

### 3.2. Métricas de Impacto Financiero y Negocio en Tiempo Real
El Main vincula cada aspirante con el impacto económico directo sobre el presupuesto anual del colegio:
- **Valor del Pipeline Activo:** Cálculo consolidado del ingreso proyectado por concepto de inscripciones y 10-11 meses de colegiatura (ejemplo en datos reales del sistema: **$4,180,000 MXN**).
- **Ponderación Real por Canales de Captación:**
  - *Recomendación Familiar (Boca a boca):* 52% de la captación histórica.
  - *Canales Digitales & Web (Campañas de atracción):* 34% de la captación.
  - *Convenios Corporativos (Alianzas empresariales):* 14% de la captación.

### 3.3. Velocidad del Pipeline (SLA y Tiempos de Ciclo)
El Main introduce un análisis de velocidad comercial por tramos clave del embudo, midiendo la agilidad de respuesta del colegio:
- **Velocidad Total Promedio:** **9.5 días** desde el registro inicial hasta el pago de la inscripción.
- **Comparativa de Mercado:** En colegios privados de México el promedio de cierre oscila en **22 días**. ISkool acelera el proceso en más del **56%**.
- **Desglose de Tiempos por Tramo:**
  1. *Contacto Inicial:* Menos de 24 horas (98% de efectividad de contacto).
  2. *Tour a Diagnóstico Psicopedagógico:* 2.1 días hábiles promedio.
  3. *Dictamen Psicopedagógico a Carta de Asignación:* 1.4 días hábiles (Comité directivo).
  4. *Carta de Asignación a Cierre y Pago:* 2.8 días hábiles (Conciliación SPEI instantánea).

### 3.4. Conexión Orgánica con Control Escolar y Facturación SAT
- **Salto a Control Escolar Operativo:** Una vez pagada la inscripción, el aspirante deja de ser un prospecto comercial y se convierte en un alumno activo, asignándose a su grupo formal (ej. *Primaria 2° A Bilingüe*), aula física y profesor titular.
- **Cumplimiento Fiscal CFDI 4.0 IEDU:** Generación y validación del Comprobante Fiscal Digital por Internet con el Complemento de Instituciones Educativas Privadas (IEDU), incluyendo el RFC del pagador, CURP del educando y Nivel Educativo para efectos de deducción personal en el SAT.
- **Gestión Multi-Campus:** Posibilidad de conmutar métricas y prospectos entre planteles (Montes, Lagos, San Cristóbal, Coacalco).

---

## 4. Matriz Comparativa: CRM Actual vs. Admisiones Main

La siguiente tabla sintetiza las fortalezas de cada enfoque para identificar los elementos exactos a combinar:

| Dimensión | CRM Actual (`/admin/crm`) | Admisiones Main (`CEOExecutiveDashboard.tsx`) | Diagnóstico y Oportunidad |
| :--- | :--- | :--- | :--- |
| **Enfoque Principal** | Operativo, ágil, para asesores de admisiones. | Estratégico, directivo, gobernanza y finanzas. | **Excelente complementariedad:** El Main aporta la visión de negocio y el CRM la agilidad de ejecución. |
| **Visualización** | Tablero Kanban arrastrable (Drag & Drop) con 3 embudos. | Embudo vertical institucional de 5 niveles con barras de progreso. | Unir la interacción visual del Kanban con el desglose jerárquico de las 5 fases maestras. |
| **Estructura Familiar** | **Modelo 1:N** (1 Tutor $\rightarrow$ Múltiples Hermanos candidatos). | Registro plano (1 fila = 1 alumno con tutor asociado). | **Ganador CRM Actual:** El modelo familiar es mucho más fiel a la realidad escolar. |
| **Separación de Apellidos** | **Estricta SEP:** Paterno y Materno independientes en tutor y alumnos. | Campo combinado (`studentName`, `tutorName`). | **Ganador CRM Actual:** Cumple al 100% con la normativa oficial mexicana. |
| **Gobernanza Departamental** | Asignación simple a un asesor de ventas (`assigned_to`). | **Matriz de 5 departamentos** (Marketing, RRPP, Psicopedagogía, Dirección Académica, Caja). | **Ganador Main:** Dota de corresponsabilidad a todo el colegio y elimina cuellos de botella. |
| **Métricas Financieras** | Costo de adquisición estimado por canal. | **Valor del Pipeline en tiempo real ($ MXN)** proyectado por ciclo escolar. | **Ganador Main:** Esencial para juntas de consejo y directores dueños. |
| **Velocidad de Conversión** | Contador de días en etapa actual con alerta de estancamiento. | **Velocidad global (9.5 días)** desglosada en 4 tramos con comparativa de mercado. | **Ganador Main:** Medición exacta de tiempos de servicio (SLA). |
| **Expediente Documental** | **15 documentos con estatus** (Pendiente, Subido, Verificado, Rechazado). | Mención general de expediente 360 provisional. | **Ganador CRM Actual:** Mayor rigor en el control de documentos oficiales. |
| **Bitácora y Tareas** | **Llamadas, WhatsApp, citas y tareas programadas con alertas**. | Notas de texto libre asociadas al prospecto. | **Ganador CRM Actual:** Herramienta indispensable para el trabajo diario de los asesores. |
| **Integración con Control Escolar** | Enlace conceptual hacia alumnos matriculados. | **Botón directo de salto operativo** a Padrón de Alumnos y grupos escolares. | **Ganador Main:** Conexión inmediata sin duplicidad de captura. |
| **Cumplimiento SAT (IEDU)** | Mención general de cobro. | **Emisión de CFDI 4.0 con complemento educativo del SAT**. | **Ganador Main:** Crítico para la retención y satisfacción de los padres de familia. |

---

## 5. Arquitectura del "CRM Escolar Unificado 360°" (Fusión Estratégica)

La solución óptima no consiste en reemplazar un módulo por el otro, sino en **fusionarlos en una experiencia unificada** que sirva tanto al asesor de ventas como al Director General y al Comité Directivo.

```
┌────────────────────────────────────────────────────────────��───────────────────────────┐
│                        ISKOOL CRM ESCOLAR UNIFICADO 360°                              │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  BARRA EJECUTIVA FINANCIERA & VELOCIDAD (Del Main)                                      │
│  [ Valor Pipeline: $4,180,000 MXN ] [ Velocidad Ciclo: 9.5 días ] [ Meta: 85% Matrícula ] │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  MATRIZ DEPARTAMENTAL EN CABECERA (Del Main)                                           │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────────────┐  │
│  │ Fase 1: Lead │Fase 2: Visita│Fase 3: Diagn.│Fase 4: Asign.│Fase 5: Matrícula & SAT│  │
│  │  Marketing   │  Dirección   │Psicopedagogía│Dir. Académica│ Tesorería / Control  │  │
│  └──────────────┴──────────────┴──────────────┴──────────────┴──────────────────────┘  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  CONTROL DE VISTAS & FILTROS INTELIGENTES                                              │
│  [ 📋 Vista Kanban ]  [ 📊 Vista Directiva ]  [ 📝 Directorio ]  [ 🔔 Tareas (3) ]       │
│  Campus: [ Montes ▼ ]   Nivel: [ Primaria ▼ ]   Prioridad: [ 🔴 Caliente ▼ ]            │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  ESPACIO DE TRABAJO DINÁMICO (Del CRM Actual)                                         │
│  - Tablero Kanban interactivo con drag-and-drop o botones de salto rápido              │
│  - Tarjetas con: Apellidos SEP, Lead Score, Prioridad en 1 clic, Días estancado        │
│  - Ficha lateral deslizable: Expediente Familiar 1:N, WhatsApp directo, 15 Documentos  │
│  - Botón Directivo: "Aprobar Asignación de Plaza" (Dirección Académica)                │
│  - Botón de Cierre: "Timbrar CFDI 4.0 IEDU & Pasar a Control Escolar" (Tesorería)     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 5.1. Mapeo Armónico de Etapas: Fases Institucionales vs. Sub-etapas Operativas
Para mantener la simplicidad del Main sin perder el detalle del CRM actual, el sistema implementa un modelo de **Fases Maestras con Sub-etapas Detalladas**:

```
FASE 1: CAPTACIÓN & LEAD (Admisiones & Marketing)
 ├── 1.1 Registrado (Web, Feria, Walk-in)
 └── 1.2 Contacto Efectivo (Llamada / WhatsApp)

FASE 2: VISITAS & EXPERIENCIA (Dirección de Campus & RRPP)
 ├── 2.1 Tour / Recorrido de Campus Agendado
 └── 2.2 Visita Realizada & Feedback de Familia

FASE 3: EVALUACIÓN PSICOPEDAGÓGICA (Gabinete Psicopedagógico)
 ├── 3.1 Cita de Diagnóstico Programada
 └── 3.2 Dictamen Psicopedagógico Aprobado / Condicionado

FASE 4: ASIGNACIÓN & PROPUESTA (Dirección Académica & Comité)
 ├── 4.1 Propuesta Económica & Asignación de Beca
 └── 4.2 Emisión de Carta de Asignación Formal con Cupo Reservado

FASE 5: MATRÍCULA, PAGO & CONTROL ESCOLAR (Caja, Tesorería & Control Escolar)
 ├── 5.1 Conciliación de Pago (SPEI / Tarjeta / Ventanilla)
 ├── 5.2 Emisión Automática de Factura CFDI 4.0 con Complemento IEDU
 └── 5.3 Alta Inmediata en Padrón de Alumnos SEP & Asignación a Grupo Oficial
```

### 5.2. Los 4 Pilares de la Fusión Unificada

#### Pilar 1: Capa de Inteligencia Financiera y Velocidad (Del Main al CRM)
El encabezado del CRM incorporará permanentemente:
- **Ticker Financiero del Pipeline:** Valor en $ MXN del ciclo escolar activo, recalculado en tiempo real multiplicando los alumnos en cada etapa por el costo anual de colegiatura y cuota de inscripción.
- **Monitor de Velocidad (SLA):** Desglose de los 4 tramos temporales (Contacto < 24h, Tour a Diagnóstico 2.1d, Diagnóstico a Asignación 1.4d, Asignación a Pago 2.8d) con semáforo de cumplimiento vs promedio de mercado.
- **Selector Multi-Plantel Consolidado:** Posibilidad de ver las métricas de un campus individual o la visión global del corporativo/holding.

#### Pilar 2: Capa de Corresponsabilidad Departamental
En la cabecera y en cada ficha de prospecto se indicará con claridad el departamento que tiene el balón en la cancha:
- Si el aspirante está en *Fase 2*, la notificación y tarea se dirigen a **Dirección de Campus & RRPP**.
- Si está en *Fase 3*, el caso se presenta en la bandeja del **Gabinete Psicopedagógico**.
- Si está en *Fase 4*, la validación corresponde al **Comité de Asignación / Dirección Académica**.
- Si está en *Fase 5*, se transfiere a **Tesorería y Control Escolar**.

#### Pilar 3: Operativa Familiar 1:N y Rigor SEP (Del CRM al Main)
- Toda la base de datos opera bajo el estándar inamovible de separación de apellidos:
  - `Primer Apellido (Paterno)` y `Segundo Apellido (Materno)` tanto para padres/tutores como para todos los hijos/candidatos.
- Selector de prioridad instantáneo (🔴 Caliente, 🟡 Tibio, 🔵 Normal, ⚪ Frío) con 1 clic en tarjetas y listas.
- Expediente documental de 15 requisitos con previsualización, carga de archivos y marcado de validación oficial.

#### Pilar 4: Puente Automatizado con Control Escolar y Facturación SAT
El mayor beneficio para el colegio es la eliminación de la doble captura:
- Cuando la familia realiza el pago y se marca como `Inscripción Pagada`:
  1. El sistema genera la factura **CFDI 4.0 con Complemento IEDU** registrando el RFC del tutor, CURP del menor y nivel educativo oficial.
  2. Se crea automáticamente el registro del alumno en la tabla oficial de alumnos de **Control Escolar Operativo**.
  3. Se le asigna matrícula oficial provisional y cupo en el grupo solicitado (ej. *2° B Primaria*).
  4. Los documentos digitales validados en el CRM pasan directamente al **Expediente Digital del Alumno** permanente.

---

## 6. Especificación de la Base de Datos Unificada

Para respaldar esta fusión, el esquema relacional integra los campos institucionales y financieros requeridos:

```sql
-- TABLA MAESTRA: PROSPECTOS FAMILIARES (LEADS)
CREATE TABLE public.crm_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    campus_id UUID REFERENCES public.campuses(id) ON DELETE SET NULL,
    
    -- Tipo de Pipeline
    pipeline_type VARCHAR(30) NOT NULL DEFAULT 'new_enrollment', 
    -- 'new_enrollment', 'reenrollment', 'internal_transfer'

    -- Fase Institucional Maestra (1 a 5) y Sub-etapa Operativa
    institutional_phase INT NOT NULL DEFAULT 1, -- 1:Lead, 2:Visita, 3:Diagnóstico, 4:Asignación, 5:Matrícula
    stage VARCHAR(50) NOT NULL DEFAULT 'registered',
    
    -- Datos del Tutor (Estándar SEP: Apellidos Estrictamente Separados)
    tutor_first_name VARCHAR(100) NOT NULL,
    tutor_last_name_1 VARCHAR(100) NOT NULL, -- Apellido Paterno
    tutor_last_name_2 VARCHAR(100),          -- Apellido Materno
    tutor_phone VARCHAR(30),
    tutor_email VARCHAR(150),
    tutor_relationship VARCHAR(50) DEFAULT 'Padre',
    
    -- Datos Fiscales para Facturación CFDI 4.0 IEDU
    billing_rfc VARCHAR(13),
    billing_legal_name VARCHAR(200),
    billing_postal_code VARCHAR(10),
    billing_tax_regime VARCHAR(10),
    
    -- Canal de Captación
    source_channel VARCHAR(50) NOT NULL DEFAULT 'website_form',
    source_detail VARCHAR(255),
    
    -- Calificación y Prioridad
    priority VARCHAR(20) NOT NULL DEFAULT 'normal', -- 'hot', 'warm', 'normal', 'cold'
    lead_score INT NOT NULL DEFAULT 5,              -- 0 a 100 puntos
    assigned_to UUID REFERENCES auth.users(id),     -- Asesor de Admisiones asignado
    responsible_department VARCHAR(50) DEFAULT 'marketing', -- 'marketing', 'campus_dir', 'psychology', 'academic_dir', 'treasury'
    
    -- Métricas Financieras Proyectadas
    projected_cycle_value_mxn NUMERIC(12,2) DEFAULT 0,
    
    -- Referencias
    referred_by_family_id UUID REFERENCES public.crm_leads(id),
    referral_incentive_applied BOOLEAN DEFAULT FALSE,
    
    -- Resultado y Descarte
    outcome VARCHAR(20), -- 'enrolled', 'declined', 'waitlisted', 'deferred'
    lost_reason VARCHAR(100),
    lost_to_school VARCHAR(150),
    
    -- Fechas y Auditoría
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    last_contact_at TIMESTAMPTZ,
    tour_date TIMESTAMPTZ,
    evaluation_date TIMESTAMPTZ,
    assignment_letter_issued_at TIMESTAMPTZ,
    enrolled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLA HIJOS / ASPIRANTES VINCULADOS (1:N)
CREATE TABLE public.crm_lead_candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
    
    -- Datos del Alumno (Estándar SEP: Apellidos Estrictamente Separados)
    first_name VARCHAR(100) NOT NULL,
    last_name_1 VARCHAR(100) NOT NULL, -- Apellido Paterno
    last_name_2 VARCHAR(100),          -- Apellido Materno
    birth_date DATE,
    gender VARCHAR(10),
    curp VARCHAR(18),
    
    -- Nivel y Grado Solicitado
    target_level VARCHAR(30) NOT NULL, -- 'maternal', 'preescolar', 'primaria', 'secundaria', 'preparatoria'
    target_grade VARCHAR(20) NOT NULL,
    target_group VARCHAR(10),          -- Asignación de grupo escolar (ej. 'A', 'B')
    
    -- Escuela de Origen
    current_school_name VARCHAR(150),
    current_school_grade VARCHAR(50),
    
    -- Diagnóstico Psicopedagógico
    evaluation_status VARCHAR(30) DEFAULT 'pending', -- 'pending', 'scheduled', 'approved', 'not_approved', 'waived'
    evaluation_score NUMERIC(5,2),
    evaluation_notes TEXT,
    
    -- Beca Solicitada
    scholarship_type VARCHAR(50),
    scholarship_percent INT DEFAULT 0,
    
    -- Conversión Directa a Control Escolar
    enrolled_student_id UUID REFERENCES public.students(id),
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'enrolled', 'declined'
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 7. Plan de Implementación y Convivencia sin Fricción

Para respetar estrictamente las normas del proyecto y garantizar que el trabajo en curso de otros colaboradores (como Israel) no se vea alterado:

1. **Aislamiento Total de Archivos:**
   - Todo el desarrollo de esta fusión reside en archivos autónomos bajo `src/components/crm/`, `src/types/crm.ts`, `src/store/useCrmStore.ts` y la ruta dedicada `/admin/crm`.
   - No se altera ninguna línea rastreada de `src/components/admin/CEOExecutiveDashboard.tsx` hasta que la dirección decida la integración final por pull request o fusión aprobada.
2. **Selector de Vistas en el CRM:**
   - La interfaz de `/admin/crm` incluirá una barra de conmutación superior:
     - **Modo Operativo (Kanban Ágil):** La experiencia que los asesores ya disfrutan para mover tarjetas y registrar llamadas en 1 clic.
     - **Modo Directivo (Embudo Institucional):** La réplica interactiva del embudo de 5 departamentos del Main, con las métricas de $4,180,000 MXN y tiempos de ciclo.
3. **Botón de Enlace Bidireccional:**
   - Un botón en `/admin/crm` que permite saltar a la vista ejecutiva del Main (`/admin`), y un acceso desde `/admin` hacia el nuevo CRM.

---

## 8. Conclusión

La fusión de ambos mundos transforma a ISkool en el sistema de gestión escolar más avanzado del mercado mexicano:
- Proporciona a los **asesores de admisiones** una herramienta rápida, familiar, con WhatsApp instantáneo y expediente digital sin burocracia.
- Proporciona a los **directores y dueños** visibilidad milimétrica del dinero en juego, la efectividad de sus campañas publicitarias y la velocidad de respuesta de su equipo.
- Resuelve la **transición administrativa**, convirtiendo un prospecto pagado en un alumno con expediente oficial SEP y factura deducible ante el SAT con un solo clic.
