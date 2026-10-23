# Propuesta 01: El Reino de las Huellitas (Preescolar · 3 a 5 Años)

> **ESTADO DE LA PROPUESTA:** DOCUMENTO CONCEPTUAL Y ESPECIFICACIÓN ARQUITECTÓNICA.  
> **RESTRICCIÓN:** NO IMPLEMENTADO EN CÓDIGO FUENTE DE PRODUCCIÓN.

---

## 1. Identidad Visual y Concepto de Juego
* **Nivel Educativo:** Preescolar (Fase 2 SEP · Alumnos de 3 a 5 años).
* **Metáfora Lúdica:** Una granja mágica y santuario interactivo donde cada niño cuida a una pequeña criatura (zorrito, panda, conejito) modelada en estilo *claymation* (plastilina táctil) y texturas de fieltro cálido.
* **Mecánica Central de Nivel:** Cero necesidad de lectoescritura obligatoria. Toda la navegación, pistas y felicitaciones se ejecutan mediante el **Motor de IA Pedagógica por Voz** y sonidos binaurales reconfortantes. Cada actividad completada nutre y hace crecer al santuario del alumno.

---

## 2. Vistas y Pantallas Detalladas

### Pantalla 1: Hub de Aventura (La Pradera de Plastilina)
![Hub Preescolar Huellitas](file:///C:/Users/kami-/.gemini/antigravity-ide/brain/7c1b550f-a889-4311-abec-4547336878b7/gamification_preescolar_huellitas_1792732717441.jpg)

* **Estructura Visual:** Entorno soleado en 2.5D con árboles de plastilina y casitas de madera.
* **Componentes Clave:**
  - **Avatar Central:** El zorro o panda del alumno saluda cuando el niño toca la pantalla.
  - **Senderos de Huellas de Colores:** Cada sendero representa un Campo Formativo de la NEM (Huellas Verdes: *Ética, Naturaleza y Sociedades*; Huellas Amarillas: *Saberes y Pensamiento Científico*; Huellas Azules: *Lenguajes*).
  - **Indicador de Energía Lúdica:** En lugar de números abstractos de XP, un tarro de miel o estrella brillante se llena visualmente con líquido dorado.
  - **Botón de Micrófono Mágico:** Al presionarlo, el Asistente Pedagógico lee en voz alta el desafío del día.

---

### Pantalla 2: Videojuego de Preguntas & Desafío Lúdico (Alimentar al Amiguito)
![Quiz Minijuego Preescolar](file:///C:/Users/kami-/.gemini/antigravity-ide/brain/7c1b550f-a889-4311-abec-4547336878b7/gamification_quiz_preescolar_gameplay_1792734559505.jpg)

* **Mecánica de Pregunta para Subir de Nivel:**
  - El animalito tiene hambre o necesita resolver un acertijo para cruzar un puente.
  - El sistema formula la pregunta con audio natural: *"¿Cuál es la fruta roja?"* o *"¿Qué objeto tiene forma de círculo?"*.
  - **Opciones de Respuesta:** Tres botones gigantes acolchados con textura de plastilina y madera que rebotan con física háptica al ser tocados.
  - **Refuerzo Positivo Inmediato:** Al acertar, llueven estrellitas de confeti 3D, el animalito da una voltereta alegre y se añade una **Estrella de Sabiduría** a la alcancía del alumno.
  - **Tratamiento del Error (Pedagogía del Error Amable):** Si el alumno elige la opción incorrecta, el botón tiembla suavemente con una risita dulce y el asistente sugiere: *"¡Casi! Prueba tocar el que parece una manzana roja"*, sin restar vidas ni generar frustración.

---

### Pantalla 3: Vestidor y Personalizador de Avatar (Crea tu Compañero)
![Personalizador Avatar Preescolar](file:///C:/Users/kami-/.gemini/antigravity-ide/brain/7c1b550f-a889-4311-abec-4547336878b7/gamification_avatar_preescolar_customizer_1792734577407.jpg)

* **Personalización Accesible:**
  - El alumno puede seleccionar la especie de su compañero (Panda, Zorrito, Osezno, Dragón Bebé).
  - **Bandeja de Accesorios:** Sombreritos de fiesta con pompones, gorras de detective, bufandas de colores, alitas de mariposa y cascabeles musicales.
  - **Tienda Sin Moneda Real:** Se desbloquean con "Estrellitas de Sabiduría" ganadas respondiendo los retos de la educadora.
  - **Modo Guardar y Jugar:** Al pulsar el gran botón de madera "¡JUGAR!", el compañero luce inmediatamente su atuendo en el mapa principal y saluda al docente.

---

### Pantalla 4: Módulo Universal del Profesor (Creación Unificada de Retos)
![Estudio Universal de Desafíos Docentes](file:///C:/Users/kami-/.gemini/antigravity-ide/brain/7c1b550f-a889-4311-abec-4547336878b7/gamification_teacher_universal_studio_1792734542445.jpg)

* **La misma interfaz para todos los docentes:**
  - El maestro de preescolar no tiene que aprender un software infantilizado complejo. Utiliza el **Universal Challenge Studio** de ISkool.
  - **Flujo del Docente:**
    1. Redacta la pregunta o selecciona un PDA de preescolar de la **Bóveda Curricular** (e.g., *PDA Preescolar 2: Reconoce figuras geométricas en su entorno*).
    2. El **Motor de IA Pedagógica** autogenera las 3 opciones visuales táctiles y el audio hablado.
    3. En el panel derecho de vista previa polimórfica, el profesor visualiza cómo se renderiza exactamente en la pantalla del niño como un juego de alimentar al zorrito.
    4. Con 1 clic, se programa para la sesión de clase o tarea en casa.

---

## 3. Integración con el Ecosistema ISkool
* **Conexión con Almacén Central (`useStudentStore` / `useGamificationStore`):**
  - Cada respuesta acertada suma puntos a la clave `stars` y `experiencePoints` del almacén central, manteniendo intacto el esquema de datos.
* **Bóveda Curricular:** Los proyectos de exploración sensorial se indexan en Markdown con tags frontmatter `fase: 2`, `grado: preescolar`, permitiendo trazabilidad directa.
* **Avatares de Personajes Históricos:** Para preescolar, próceres como Miguel Hidalgo o Sor Juana aparecen como "Héroes Sabios de Cuento" que narran historias orales en primera persona rigurosa: *"Hola pequeño, soy Miguel... en mi pueblo cuidábamos animalitos y campanadas..."*.

---

## 4. Desafíos Técnicos de Implementación y Soluciones

| Desafío Técnico | Severidad | Solución Arquitectónica |
| :--- | :--- | :--- |
| **Sintetizador de Voz (TTS) de Baja Latencia** | Media | Caché de audios pre-renderizados en formato WebP/Opus comprimido para preguntas curriculares estándar; streaming de IA solo para nombres propios. |
| **Manejo Táctil y Falsos Toques en Tablets** | Alta | Debouncing táctil de 350ms y áreas de impacto (*hitboxes*) de al menos 88x88px por botón para evitar toques accidentales con la palma. |
| **Rendimiento de Texturas de Plastilina 3D** | Media | Pre-renderizado en spritesheets optimizados y SVGs reactivos utilizando el motor ligero [`PetSvgRenderer.tsx`](file:///c:/Users/kami-/.gemini/antigravity-ide/scratch/ISkool/src/components/pet/PetSvgRenderer.tsx). |

---

## 5. Estimación de Tiempos y Capacitación Docente
* **Tiempo de Capacitación para Educadoras:** **4 a 6 horas totales** (divididas en 2 sesiones prácticas).
* **Curva de Aprendizaje:** Menos de 15 minutos para crear su primer minijuego interactivo, gracias al autocompletado del Asistente Pedagógico IA con PDA SEP oficiales.
* **Aceptación por Padres de Familia:** Portal de reporte en tiempo real que traduce las estrellas en competencias de lenguaje y motricidad.

---

## 6. Viabilidad e Integración con Suites Cloud Institucionales (Google Workspace / Drive)
* **Autenticación (SSO):** Inicio de sesión biométrico o mediante "Código de Imagen / QR de Aula" vinculado al Google Workspace institucional del colegio sin que el niño tenga que teclear correos complejos.
* **Google Drive / Almacenamiento Cloud:** Las evidencias de audio grabadas por el niño o dibujos hechos en el lienzo táctil se comprimen automáticamente (según la Regla No Negociable 3 en WebP/JPEG bajo 300KB) y se envían a la carpeta compartida de Google Drive de la educadora en `Google Drive/ISkool_Evidencias/Preescolar/`.

---

## 7. Benchmarks Mundiales y Mejoras Internacionales Disruptivas
* **Khan Academy Kids (EE.UU.):** Adopción de personajes fijos empáticos que acompañan al alumno sin calificar con números rojos.
* **Toca Boca World (Suecia):** Sensación táctil donde los elementos del juego responden con física blanda que atrapa la atención sin sobreestimular.
* **Mejora Exclusiva ISkool:** Integración de la pedagogía de la NEM y la evaluación formativa continua sin que la educadora tenga que llenar papeleo burocrático manual.
