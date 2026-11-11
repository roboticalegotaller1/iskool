<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

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

# Navegador Oficial de Antigravity y Pruebas (Google Chrome)
- **Navegador Oficial Único:** **Google Chrome** (`C:\Program Files\Google\Chrome\Application\chrome.exe`) es el navegador oficial y predeterminado de Antigravity para este proyecto, tanto para visualización local como para pruebas automatizadas.
- **Regla Mandatoria para `"run iskool and open in local browser"` (o frases equivalentes como `"abre iskool en navegador"` / `"open iskool in local browser"`):**
  1. Iniciar el servidor de desarrollo local (`npm run dev`) con `IsDaemon: true` si no está activo.
  2. Abrir **Google Chrome** directamente en el escritorio principal de Windows (`WinSta0\Default`) fuera del sandbox de terminal ejecutando exactamente:
     `Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = '"C:\Program Files\Google\Chrome\Application\chrome.exe" --new-window http://localhost:3000' }`
  3. **PROHIBIDO ejecutar `Stop-Process -Name chrome`** para que la ventana de Chrome del usuario nunca se cierre mientras trabaja.
- **Motor Oficial de Pruebas (Playwright / E2E / Auditorías Visuales):** Todas las pruebas de navegador y scripts de verificación de Playwright deben ejecutarse sobre Google Chrome (`channel: 'chrome'` o `executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'`).

# Recordatorios Especiales y Pendientes Activos
- **Respuesta a comando de recordatorios o pendientes:** Cuando el usuario escriba en el chat `"antigravity dime mis recordatorios"`, `"muéstrame los pendientes"`, `"cuáles son mis pendientes"` (o cualquier frase equivalente pidiendo ver sus pendientes/recordatorios), el agente debe mostrarle de forma clara y estructurada los siguientes pendientes activos:
  1. **Portal / Función de Super Usuario:** Continuar trabajando y evolucionando las funciones del portal de Super Usuario.
  2. **Conexión de Créditos Mensuales del Plan Ultra ($100 USD/mes) al Motor Visual IA (`MOTOR_IA_API_KEY`):**
     - **Contexto financiero:** Con un volumen promedio de 300 correos/día (Triage y Voz Sofía a 0 tokens), el Estudio Gráfico Institucional IA consume ~11,500 tokens/día (~$7.22 USD/mes ≈ $145 MXN/mes), quedando cubierto al 100% sin costo adicional con los $100 USD mensuales de crédito Cloud incluidos en la suscripción Ultra (~2,900 láminas `1K`/mes).
     - **Pasos pendientes para activarlo:**
       1. Ingresar con la cuenta que tiene la suscripción Ultra a `https://developers.google.com/program` y reclamar el beneficio mensual de **$100 USD en créditos de Google Cloud**.
       2. En `https://console.cloud.google.com/billing`, vincular esos créditos promocionales a la cuenta de facturación (*Billing Account*).
       3. En `https://aistudio.google.com/apikey`, subir el proyecto de la API Key a *Tier 1 (Set up Billing)* asociándolo a esa misma cuenta de facturación.
       4. Colocar la clave resultante en `.env.local` como `MOTOR_IA_API_KEY=...` (sin compartirla en el chat) para que `InstitutionalVisualStudioService` conmute automáticamente del respaldo vectorial local al motor generativo cloud.

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

# REGLA NO NEGOCIABLE 3 (Compresión Obligatoria de Imágenes para Carga Eficiente en Servidores Cloud)
- **1. Compresión Mandatoria Previa a Todo Envío o Almacenamiento:**
  - Toda imagen creada, generada, procesada o subida en la plataforma (avatares de alumnos, fotografías de perfil, capturas de pantalla, evidencias, credenciales o activos visuales) **DEBE COMPRIMIRSE OBLIGATORIAMENTE ANTES DE SER ENVIADA** a los servidores cloud / almacenamiento remoto (servidor AWS / S3 / API de carga).
  - Queda estrictamente prohibido transmitir o almacenar imágenes sin procesar o en formatos pesados no optimizados (archivos PNG crudos de varios megabytes o cargas que superen los límites de carga del servidor).
- **2. Preservación Estricta de Fidelidad e Integración Visual:**
  - La compresión debe ser perceptualmente transparente y de alta fidelidad: sin pixelación, sin artefactos en texto, sin distorsión de relaciones de aspecto ni descalibración de color.
  - Se debe priorizar el formato moderno **WebP** (calidad 80% - 85%) o **JPEG balanceado**, con escalado proporcional inteligente (anchura/altura máxima adaptada al caso de uso, e.g. 512–1280px) manteniendo el tamaño objetivo típicamente por debajo de 300KB - 400KB por imagen.
- **3. Ejecución Sistemática en el Pipeline de la Aplicación:**
  - Todo flujo de subida o creación de imagen en el frontend o backend debe invocar sistemáticamente la canalización de compresión (utilidad `src/utils/imageCompressor.ts` o equivalente) antes de formular la petición HTTP multipart, REST o Base64 hacia el servidor remoto.

# REGLA NO NEGOCIABLE 4 (Protocolo Quirúrgico de Rediseños: Propuesta Visual Exhaustiva Previa y Cero Implementación sin Aprobación)
- **1. Prohibición Total de Implementar Rediseños sin Confirmación Explícita:**
  - **MANDATORIO E INQUEBRANTABLE:** Cuando el usuario solicite un **rediseño** (de cualquier pantalla, portal, consola, flujo o módulo), queda **estrictamente prohibido** modificar el código de la aplicación o implementar cambios por iniciativa propia hasta que el usuario revise la propuesta visual y confirme explícitamente que desea implementarla.
  - Queda prohibido tomar decisiones autónomas de diseño o arquitectura visual sin aprobación previa del usuario.
- **2. Generación Exhaustiva de Todas las Pantallas con Nano Banana 2.1 o Superior (Sin Escatimar):**
  - Ante toda solicitud de rediseño, el agente debe utilizar obligatoriamente **Nano Banana 2.1 (`gemini-nano-banana-2.1`) o el modelo generativo visual superior disponible** (vía API de alta resolución / subagente `image-generator`, sin escatimar en recursos ni cantidad de vistas) para diseñar y mostrar de forma **quirúrgica todas las pantallas necesarias del sistema** (vista principal, sub-vistas, estados interactivos, paneles laterales, modales y flujos completos).
- **3. Flujo Estricto en Dos Etapas:**
  - **Etapa 1 — Auditoría y Maquetación Visual Completa (Solo Lectura en Código):** Mapear quirúrgicamente cada pantalla que necesita el módulo, generar todas las láminas de interfaz de alta fidelidad (respetando la Regla No Negociable 1 de Marca Blanca en los textos de las pantallas y la Regla No Negociable 3 de compresión WebP), presentarlas ordenadamente al usuario y **detenerse por completo esperando su autorización**.
  - **Etapa 2 — Implementación Autorizada:** Solo después de recibir la confirmación explícita del usuario indicando su aprobación (y cualquier ajuste solicitado), ejecutar la implementación en código fiel al 100% a las pantallas aprobadas.

# POLÍTICA DE SEGURIDAD GIT Y CONTROL DE VERSIONES
- **1. Prohibición Absoluta de Comandos Destructivos:**
  - Queda **estrictamente prohibido** que los agentes ejecuten `git push --force` o `git push -f` en cualquier circunstancia. Todo push debe ser atómico, estándar y hacia la rama de trabajo asignada.
  - Queda prohibido configurar o enviar código hacia repositorios personales no oficiales o utilizar credenciales privadas en scripts de despliegue.
- **2. Flujo Estándar de Integración Continua:**
  - Las actualizaciones se integran mediante ramas de trabajo o la rama principal oficial (`origin main`).
  - Se debe validar previamente que los análisis estáticos, verificación de tipos y tests pasen al 100% antes de cualquier confirmación.
- **3. Blindaje de Archivos Generados y Bóvedas Locales:**
  - Archivos temporales de renderizado, capturas de pantalla, manuales o presentaciones generadas (`*.pdf`) y dependencias locales de la Bóveda Curricular (`.obsidian/`) deben permanecer estrictamente fuera del control de versiones mediante `.gitignore` para preservar el repositorio ligero.
