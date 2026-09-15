---
tags: [iskool, arquitectura, estudio-iskool, generador-ia, modo-edicion, plantillas-educativas, studio-route, trilingue, purga-marcas]
fecha_creacion: "2026-08-12"
fecha_actualizacion: "2026-09-15"
modulo: "Estudio ISkool, Generador IA Trilingüe y Protección Curricular (/teacher/studio)"
---

# Arquitectura Oficial del Estudio ISkool e Interfaces `StudioActivityJSON` (`ISkool_Studio_Architecture.md`)

## 1. Purga Total de Marcas e Interfaces Estandarizadas
De acuerdo con las **Reglas Corporativas de ISkool**, se completó la estandarización de la base de código y los tipos principales en `src/types/index.ts` y `src/types/studioBlocks.ts`:

- **Interfaces Oficiales:** `StudioActivityJSON`, `StudioActivityQuestion` y `ActivityBuilderMetadata`.
- **Ruta Frontend Oficial:** `http://localhost:3000/teacher/studio` (`src/app/teacher/studio/page.tsx`).
- **Endpoint API Oficial:** `/api/studio/generate` (`src/app/api/studio/generate/route.ts`).
- **Componentes Refactorizados:** `StudioTriviaPlayer.tsx`, `AdminCarouselStudio.tsx`, `DataDrivenCombatView.tsx`, `PixiCombatView.tsx`.

```typescript
export interface StudioActivityQuestion {
  question: string;
  options: string[];
  correctIndex: number; // 0-3
  explanation?: string;
  imageUrl?: string; // Referencia visual pedagógica
  timeLimitSeconds?: number;
}

export interface StudioActivityJSON {
  title: string;
  description: string;
  questions: StudioActivityQuestion[];
  language?: string;
}
```

---

## 2. Protección contra Alucinaciones de Imágenes (Fallbacks)

Para prevenir errores visuales (404) o URLs alucinadas por modelos de lenguaje, todos los reproductores de minijuegos (`StudioTriviaPlayer`, `MemoramaPlayer`, `FlashcardsPlayer`) implementan una función defensiva `onError`:

```tsx
<img
  src={question.imageUrl}
  alt="Referencia pedagógica"
  onError={(e) => { e.currentTarget.src = '/images/students/default.png'; }}
  className="..."
/>
```

Si la URL especificada en el JSON falla o no responde, la interfaz conmuta instantáneamente al activo seguro local `'/images/students/default.png'` sin romper la experiencia del alumno o docente.

---

## 3. Soporte Trilingüe para Colegios Internacionales (Generador IA)

Para atender las necesidades de instituciones educativas bilingües y trilingües con programas internacionales, el **Estudio ISkool** incorpora selección dinámica de idioma para la generación curricular y de reactivos gamificados.

### 3.1 Interfaz de Usuario con "Diseño Minimalista" (`src/app/teacher/studio/page.tsx`)
En el formulario principal de generación, justo antes del botón de acción, se integra un menú desplegable (Dropdown) con **Diseño Minimalista**:
* **Opciones disponibles:**
  * `🇪🇸 Español` (por defecto)
  * `🇬🇧 Inglés B2`
  * `🇫🇷 Francés A2`
* **Vinculación de estado:** Conectado directamente al estado reactivo local `generationLanguage`, transmitido en el cuerpo de la petición HTTP tanto a la API como a los motores de contingencia pedagógica.

### 3.2 Inyección en el Endpoint de la IA (`src/app/api/studio/generate/route.ts`)
El endpoint valida mediante Zod el parámetro `language` recibido:

```typescript
const StudioGenerateSchema = z.object({
  topic: z.string().trim().min(2).max(200),
  faseNem: z.string().trim().max(100).optional(),
  campoFormativo: z.string().trim().max(100).optional(),
  gamificationStyle: z.enum(['rpg_adventure', 'escape_room', 'scientific_expedition', 'olympic_tournament']).optional().default('rpg_adventure'),
  questionCount: z.coerce.number().int().min(1).max(20).optional().default(5),
  language: z.string().trim().optional().default('Español')
});
```

El **SYSTEM PROMPT** oficial inyecta de forma obligatoria y estricta la directiva lingüística:

```typescript
export function getStudioSystemPrompt(language: string): string {
  return `Actúa como Diseñador Instruccional Senior y Desarrollador de Gamificación Educativa para el Estudio ISkool (basado en la NEM 2024 de México).
Debes generar todo el contenido, preguntas y distractores estrictamente en ${language}. Mantén la estructura JSON intacta.
Queda terminantemente prohibido generar preguntas vacías, opciones genéricas o respuestas absurdas. Todo el contenido debe ser auténtico, riguroso, pedagógicamente adaptado y desafiante en el idioma ${language}.`;
}
```

### 3.3 Garantía de Integridad Estructural y Respuestas Pedagógicas
* **Estructura JSON Intacta:** Aunque el contenido de las narrativas, reactivos, pistas de acertijo y diálogos de combate cambie de idioma según el nivel pedagógico (Español nativo, Inglés B2 intermedio alto, Francés A2 elemental formativo), los identificadores, tipos de nodo (`text_narrative`, `ordering_sequence`, `drag_drop_match`, `quiz_question`, `secret_code_puzzle`, `boss_enemy`, `reward_chest`) y conexiones conservan su integridad.
* **Fallbacks Multilingües:** En caso de interrupciones de conectividad externa con el motor de IA, el generador pedagógico heurístico autónomo y los reactivos de respaldo generan automáticamente la secuencia completa en el idioma solicitado (`Español`, `Inglés B2`, `Francés A2`).

---

## 4. Flujo Ecosistémico en el Estudio ISkool

```mermaid
graph TD
    A[🎯 1. Selección de Tema, Estilo y Idioma (Español / Inglés B2 / Francés A2)] --> B[⚡ 2. Endpoint '/api/studio/generate' con Inyección de System Prompt]
    B --> C[🧠 3. Generador IA / Motor Pedagógico Trilingüe]
    C --> D[✍️ 4. Carga Directa en el Lienzo Digital de Bloques]
    D --> E[👁️ 5. Previsualización y Prueba con Avatar]
    E --> F[🛡️ 6. Protección contra Alucinaciones y Fallbacks]
    F --> G[🚀 Publicación y Asignación Directa al Alumno]
```
