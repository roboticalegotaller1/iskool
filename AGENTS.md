<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# REGLA NO NEGOCIABLE 1 (Prohibición Total de Marcas Comerciales / Marca Blanca Institucional)
- **MANDATORIO Y PERMANENTE:** Queda estrictamente prohibido utilizar, mencionar o exponer en cualquier parte del frontend, backend, código fuente, variables, interfaces de usuario, distintivos (badges), mensajes informativos, endpoints o comentarios nombres de marcas comerciales externas (tales como Gemini, Obsidian, GitHub, Canvas LMS, etc., sin limitarse a ellas).
- **Terminología Oficial y Sustituciones Obligatorias:**
  - En lugar de "Gemini" / "Google AI" / "IA comercial": Utilizar **"Inteligencia Artificial Pedagógica"**, **"Motor de IA"** o **"Asistente Pedagógico IA"**.
  - En lugar de "Obsidian" / "Obsidean": Utilizar **"Bóveda Curricular"**, **"Bóveda Central de Conocimiento"** o **"Segundo Cerebro"**.
  - En lugar de "GitHub": Utilizar **"Repositorio Central"**, **"Servidor Remoto"** o **"Sincronización Institucional"**.
  - En lugar de "Canvas" (LMS comercial): Utilizar **"Lienzo Digital"**, **"Estudio de Actividades"** o **"Actividad Interactiva"**.

# Reglas de Inicio de Sesión
- **MANDATORIO al inicio de CADA sesión (primer turno del agente):** El agente debe ejecutar automáticamente `git pull origin main` en la raíz del proyecto para sincronizar los cambios de otros desarrolladores sin esperar confirmación.
- Si el archivo `package.json` fue modificado en el pull, el agente debe ejecutar `npm install` automáticamente.
- El agente debe informar y resumir al usuario de inmediato los cambios descargados en su primera respuesta.

# Recordatorios Especiales
- **Respuesta a comando de recordatorio:** Cuando el usuario escriba en el chat la frase "antigravity dime mis recordatorios", el agente debe recordarle y mencionarle que tienen pendiente trabajar en la función/portal de super usuario.

# Reglas para la Creación y Consulta de Planeaciones (Cuentas de Profesor)
- **1. Consulta Prioritaria en Bóveda Curricular (Vault-First / Cache-First):**
  - Cuando un profesor solicita o requiere una planeación dentro del sistema ISkool, el sistema **primero revisa en la Bóveda Curricular** (`planeaciones/`) si ya existe un nodo/archivo adecuado para el contenido, PDA o tema solicitado.
  - Si la planeación existe en la Bóveda Curricular, se recupera directamente y se entrega al profesor al instante, evitando duplicaciones y consumo innecesario de IA.
- **2. Generación con Inteligencia Artificial exclusivamente en ausencia (Fallback Pedagógico):**
  - **Solo en caso de no existir una planeación previa** en la Bóveda o base de datos de ISkool, el sistema procede a generarla con Inteligencia Artificial aplicando los más altos estándares pedagógicos oficiales (NEM 2024, PDA textual de la SEP, sesiones cronometradas con Inicio/Desarrollo/Cierre, rúbrica analítica y entregables tangibles).
- **3. Persistencia Automática en Bóveda Curricular y Sincronización Remota:**
  - Toda planeación creada con IA se guarda de forma inmediata como archivo Markdown (`.md`) con Frontmatter YAML y enlaces bidireccionales `[[...]]` dentro de la estructura de carpetas de la Bóveda Curricular correspondiente (Fase, Grado, Disciplina).
  - Se actualiza el MOC (Índice Maestro) y se asegura la sincronización con los repositorios locales y remotos.
- **4. Despliegue en la Interfaz del Profesor:**
  - Una vez asegurada su persistencia en la Bóveda Curricular, la planeación se presenta en el panel docente de ISkool para su consulta, edición y aplicación en clase.

# REGLA NO NEGOCIABLE 2 (Canon Inviolable de Personajes Históricos y Avatares Vivos)
- **1. Voz Inviolable en Primera Persona Estricta:**
  - Todo personaje histórico o avatar conversacional del módulo ISkool debe hablar **SIEMPRE, OBLIGATORIA E INEXCUSABLEMENTE EN PRIMERA PERSONA** ("Fui emboscado...", "Nací...", "Mi causa...", "Cabalgué con mis Dorados...").
  - Queda **estrictamente prohibido**:
    - Hablar de sí mismo en tercera persona ("Francisco Villa fue...", "Josefa Ortiz nació...", "Murió en 1923").
    - Usar muletillas o prefijos metadiscursivos ("Como General Francisco Villa, afirmo que...", "Como Doña Josefa Ortiz, he de decirte...", "En calidad de prócer...").
  - Si un estudiante realiza una pregunta formulada en tercera persona (por ejemplo: *"¿de qué murió?"*, *"¿dónde nació?"*, *"¿quién lo mató?"*, *"¿cómo murió?"*), el motor y el avatar deben procesar la intención semántica y **responder en primera persona** (*"Fui asesinado en una cobarde emboscada la mañana del 20 de julio de 1923 en Parral..."*).
- **2. Prohibición Absoluta de Respuestas Genéricas y Evasivas:**
  - Queda terminantemente prohibido emitir discursos políticos abstractos, evasivas o sermones vacíos que no contesten de manera fidedigna la interrogante concreta del estudiante.
  - Cada respuesta sobre muerte, nacimiento, armas, vestimenta, comidas, caballos, batallas o anécdotas debe aportar **datos históricos reales, específicos y contrastados** (fechas exactas, nombres de lugares, acompañantes, objetos y causas verídicas).
- **3. Grounding Curricular y Caché de Alta Fidelidad (Vault-First):**
  - Todo caso nuevo creado por un docente debe nutrirse de los hechos reales del nodo de la Bóveda Curricular (`birthDeathDates`, `detailedContext`, `moments`, `qaCache`).
  - Las preguntas y respuestas guardadas en la Bóveda Curricular deben ser depuradas y filtradas para que ninguna respuesta genérica o corrupta permanezca en caché.
  - Si se detecta una respuesta anterior no conforme con este canon, debe ser invalidada y regenerada de inmediato con rigor histórico pleno.
