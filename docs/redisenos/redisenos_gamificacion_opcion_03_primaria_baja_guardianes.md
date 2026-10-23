# Propuesta 03: Academia de Guardianes Elementales (Primaria Baja · 6 a 8 Años)

> **ESTADO DE LA PROPUESTA:** DOCUMENTO CONCEPTUAL Y ESPECIFICACIÓN ARQUITECTÓNICA.  
> **RESTRICCIÓN:** NO IMPLEMENTADO EN CÓDIGO FUENTE DE PRODUCCIÓN.

---

## 1. Identidad Visual y Concepto de Juego
* **Nivel Educativo:** Primaria Baja (1º, 2º y 3º Primaria · Fases 3 y 4 SEP · 6 a 8 años).
* **Metáfora Lúdica:** Una saga de rol y aventuras estilo *Super Mario Wonder* y *Pokémon didáctico*, donde los alumnos son "Aprendices de Guardián Elemental" que liberan biomas corrompidos por la "Niebla del Olvido".
* **Mecánica Central de Nivel:** Para avanzar por el mapa de sendero sinuoso (*Overworld*), los alumnos resuelven desafíos de cálculo mental, comprensión lectora y ortografía que activan hechizos elementales.

---

## 2. Vistas y Pantallas Detalladas

### Pantalla 1: Hub de Sendero de Aventuras (El Mapa Elemental)
![Hub Primaria Baja Guardianes](file:///C:/Users/kami-/.gemini/antigravity-ide/brain/7c1b550f-a889-4311-abec-4547336878b7/gamification_primaria_baja_guardianes_1792732757751.jpg)

* **Estructura Visual:** Sendero de estrellas doradas y caminos empedrados que cruzan 4 biomas:
  1. *Bosque de las Palabras* (Lenguajes y Español).
  2. *Valle de los Números* (Pensamiento Matemático).
  3. *Cañón de los Descubrimientos* (Ciencias Naturales y Entorno).
  4. *Fortaleza de la Convivencia* (Formación Cívica y Ética).
* **Componentes Clave:**
  - **Avatar del Héroe:** Camina paso a paso de un nodo al siguiente al completar tareas.
  - **Cofres del Tesoro Sorpresa:** Se desbloquean al alcanzar rachas de 3 y 5 días seguidos.
  - **Barra de Nivel & Medalla de Guardián:** Muestra "Nivel 8: Guardián del Fuego".

---

### Pantalla 2: Videojuego de Preguntas & Batalla RPG (El Hechizo Matemático)
![Quiz Batalla RPG Primaria Baja](file:///C:/Users/kami-/.gemini/antigravity-ide/brain/7c1b550f-a889-4311-abec-4547336878b7/gamification_quiz_primaria_baja_battle_1792734597009.jpg)

* **Mecánica de Combate por Turnos Didáctico:**
  - En la derecha, un simpático jefe de área (*Forest Golem* de 80 HP) bloquea el paso hacia el siguiente pueblo.
  - En la izquierda, el avatar del alumno empuña su báculo de sabiduría.
  - **Cuadro de Pregunta:** *"¡RESUELVE EL HECHIZO! 24 ÷ 4 = ?"*
  - **Botones Runa:** Cuatro runas flotantes con gemas brillantes (`4`, `6`, `8`, `12`).
  - **Multiplicador de Racha:** Al responder correctamente dentro del tiempo, se activa `¡x3 Racha Sabia!`, el avatar lanza un rayo mágico, le resta 25 HP al monstruo y gana 50 monedas de oro.
  - **Retroalimentación en Fallos:** El monstruo hace cosquillas al avatar (quitando 5 HP pero sin eliminar al jugador) y muestra la pista: *"Recuerda: 4 x ? = 24"*.

---

### Pantalla 3: Vestidor y Personalizador de Héroe (Álbum de Logros & Tienda Mágica)
![Avatar y Álbum Primaria Baja](file:///C:/Users/kami-/.gemini/antigravity-ide/brain/7c1b550f-a889-4311-abec-4547336878b7/gamification_avatar_primaria_baja_album_1792734760601.jpg)

* **Personalización del Héroe Chibi:**
  - **Equipamiento Desbloqueable:**
    - *Capa de Fuego* (Recompensa por racha de 7 días).
    - *Báculo de Sabiduría* (Alcanzado al dominar las tablas de multiplicar).
    - *Mascota Fénix Acompañante* (Sube de tamaño al completar tareas de ciencias).
    - *Corona de 100 Puntos* (Por excelencia en proyectos).
  - **Álbum de Logros:** Un libro con sellos hexagonales que premia insignias como *¡Maestro de Ciencias!* y *¡Genio de Matemáticas!*.

---

### Pantalla 4: Módulo Universal del Profesor (Universal Challenge Studio)
![Módulo Universal Docente](file:///C:/Users/kami-/.gemini/antigravity-ide/brain/7c1b550f-a889-4311-abec-4547336878b7/gamification_teacher_universal_studio_1792734542445.jpg)

* **Sincronización Docente Instantánea:**
  - El profesor escribe una pregunta de división o selecciona un reactivo de la **Bóveda Curricular**.
  - El sistema la transfigura automáticamente en un "Monstruo de Desafío" para primaria baja, sin que el maestro tenga que dibujar ni programar nada.

---

## 3. Integración con el Ecosistema ISkool
* **Conexión con [`RpgCombatViewport.tsx`](file:///c:/Users/kami-/.gemini/antigravity-ide/scratch/ISkool/src/components/RpgCombatViewport.tsx):** Esta propuesta toma el componente de combate ya existente en ISkool y lo moderniza con visuales estilo Nintendo, eliminando el tono gótico oscuro para reemplazarlo por colores vibrantes y amigables.
* **Avatares Históricos de la Bóveda Curricular:** Próceres como Francisco Villa o Josefa Ortiz de Domínguez aparecen en las posadas del mapa como "Mentores Legendarios" que dan pistas históricas en rigurosa primera persona: *"En mis tiempos cabalgué con mis Dorados por el norte... resuelve este acertijo sobre los ferrocarriles para ganar mi insignia"*.

---

## 4. Desafíos Técnicos de Implementación y Soluciones

| Desafío Técnico | Severidad | Solución Arquitectónica |
| :--- | :--- | :--- |
| **Sincronización de Animaciones Sprite a 60 FPS** | Media | Uso de spritesheets CSS compactados o animaciones Lottie vectoriales ligeras (<150KB por personaje) para garantizar fluidez en computadoras de aula. |
| **Manejo de la Frustración Infantil ante el Error** | Alta | Sistema "Vidas Infinitas en Práctica": los alumnos nunca pierden el acceso a seguir intentando; el error se recompensa con una pista guiada y reintento asistido. |

---

## 5. Estimación de Tiempos y Capacitación Docente
* **Tiempo de Capacitación:** **6 horas totales** (3 sesiones de 2 horas).
* **Contenido:** Cómo vincular exámenes trimestrales con "Jefes de Bioma" y cómo revisar el reporte de reactivos débiles en el panel de control docente.

---

## 6. Viabilidad e Integración con Suites Cloud Institucionales (Google Workspace / Drive)
* **Google Classroom & Workspace:** Sincronización bidireccional de tareas: cuando el profesor publica una tarea en Google Classroom, ISkool la convierte automáticamente en una misión del mapa de aventuras.
* **Google Drive:** Los reportes de avance y boletas gamificadas con las medallas del alumno se guardan como PDFs optimizados en la carpeta compartida de Drive del grupo.

---

## 7. Benchmarks Mundiales y Mejoras Internacionales Disruptivas
* **Prodigy Math Game (Canadá):** Líder mundial en conectar cálculo curricular con duelos de magos.
* **Blooket & Gimkit (EE.UU.):** Dinámicas de ritmo rápido que mantienen a los estudiantes al 100% de atención durante la clase.
* **Mejora Exclusiva ISkool:** Integración nativa de la Nueva Escuela Mexicana (NEM) y el programa bilingüe de inglés Cambridge sin requerir plataformas separadas.
