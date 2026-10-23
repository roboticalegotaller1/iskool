# Propuesta 05: Crónicas de Exploradores (Primaria Alta · 9 a 11 Años)

> **ESTADO DE LA PROPUESTA:** DOCUMENTO CONCEPTUAL Y ESPECIFICACIÓN ARQUITECTÓNICA.  
> **RESTRICCIÓN:** NO IMPLEMENTADO EN CÓDIGO FUENTE DE PRODUCCIÓN.

---

## 1. Identidad Visual y Concepto de Juego
* **Nivel Educativo:** Primaria Alta (4º, 5º y 6º Primaria · Fase 5 SEP · 9 a 11 años).
* **Metáfora Lúdica:** Un archipiélago inexplorado en un mapa hexagonal estilo *Civilization* / *Catan*, cubierto por "Niebla de Guerra".
* **Mecánica Central de Nivel:** Exploración estratégica y trabajo en equipo. Cada desafío de ciencias, matemáticas, historia o geografía despeja hexágonos del mapa, recolecta recursos (éter, cristales, madera de conocimiento) y permite construir observatorios, bibliotecas y laboratorios comunitarios.

---

## 2. Vistas y Pantallas Detalladas

### Pantalla 1: Hub del Mapa Hexagonal de Territorios
![Hub Primaria Alta Crónicas](file:///C:/Users/kami-/.gemini/antigravity-ide/brain/7c1b550f-a889-4311-abec-4547336878b7/gamification_primaria_alta_cronicas_1792732799979.jpg)

* **Estructura Visual:** Vista táctica de hexágonos 3D con biomas detallados: Volcanes de Geología, Selvas de Biodiversidad, Pirámides Arqueológicas y Ciudades de Fracciones.
* **Componentes Clave:**
  - **Campamento Base del Estudiante:** Personalizable con tiendas de campaña científicas y antenas de radio.
  - **Hexágonos Bloqueados por Retos:** Muestran el icono del PDA curricular que se debe dominar para desbloquearlo.
  - **Recursos Acumulados:** Barra superior con Cristales de Lógica, Pergaminos de Lenguaje y Monedas de Explorador.

---

### Pantalla 2: Videojuego de Preguntas & Expedición Didáctica
![Quiz Cartas TCG Primaria Alta](file:///C:/Users/kami-/.gemini/antigravity-ide/brain/7c1b550f-a889-4311-abec-4547336878b7/gamification_quiz_primaria_alta_tcg_1792734618682.jpg)

* **Mecánica de Pregunta para Subir de Nivel:**
  - Al ingresar a un hexágono inexplorado, el alumno activa una "Expedición Arqueológica o Científica".
  - Se le presenta un reto contextualizado: *"¿Cuál es la ley que explica por qué los planetas orbitan alrededor del Sol?"*.
  - El alumno utiliza sus cartas de conocimiento o selecciona la respuesta en una interfaz de exploración inmersiva.
  - **Recompensa por Dominio:** Al acertar con rapidez, el hexágono se ilumina, se levanta la niebla y el salón obtiene puntos para el proyecto comunitario de la clase.

---

### Pantalla 3: Personalizador de Avatar de Explorador STEM
![Avatar Explorador](file:///C:/Users/kami-/.gemini/antigravity-ide/brain/7c1b550f-a889-4311-abec-4547336878b7/gamification_avatar_primaria_baja_album_1792734760601.jpg)

* **Atuendos y Herramientas de Expedición:**
  - Los alumnos desbloquean batas de laboratorio con pines de física, trajes de expedición de jungla, brújulas de bronce y telescopios dorados.
  - Pueden lucir sus títulos honoríficos: *"Naturalista Mayor"*, *"Cartógrafo Estelar"*, *"Estratega de Ecuaciones"*.

---

### Pantalla 4: Módulo Universal del Profesor (Universal Challenge Studio)
![Módulo Universal Docente](file:///C:/Users/kami-/.gemini/antigravity-ide/brain/7c1b550f-a889-4311-abec-4547336878b7/gamification_teacher_universal_studio_1792734542445.jpg)

* **Creación de Expediciones Grupales:**
  - El profesor puede crear un "Territorio de Evaluación Trimestral" donde toda la clase coopera para despejar una isla completa antes del viernes.
  - La visualización de calor muestra qué hexágonos representaron mayor dificultad para el grupo.

---

## 3. Integración con el Ecosistema ISkool
* **Proyectos Comunitarios NEM:** Se vincula 1 a 1 con la metodología de proyectos de la Nueva Escuela Mexicana: los recursos ganados en los hexágonos sirven para "financiar" el proyecto escolar real (e.g. huerto escolar o campaña de reciclaje).
* **Bóveda Curricular:** Los documentos de consulta e investigación de la Bóveda se abren en un visor lateral sin salir del juego.

---

## 4. Desafíos Técnicos de Implementación y Soluciones
* **Renderizado de Cuadrícula Hexagonal Infinita:** Algoritmo de renderizado por celdas activas (*viewport culling*) para que solo se rendericen los hexágonos visibles en pantalla, manteniendo el uso de memoria bajo 80MB.

---

## 5. Estimación de Tiempos y Capacitación Docente
* **Tiempo de Capacitación:** **6 a 8 horas**.
* **Foco:** Cómo estructurar misiones colaborativas por equipos de salón de clases para fomentar la cooperación y no el aislamiento competitivo.

---

## 6. Viabilidad e Integración Cloud (Google Workspace / Drive)
* **Google Docs & Drive:** Cuando una expedición requiere entregar un reporte escrito, el alumno abre un Google Doc institucional integrado dentro de ISkool; al guardarlo, el hexágono se valida y se sube automáticamente a Google Drive.

---

## 7. Benchmarks Mundiales y Mejoras Internacionales Disruptivas
* **Minecraft: Education Edition:** Construcción y exploración libre como motor de aprendizaje.
* **Classcraft (Canadá/EE.UU.):** Dinámicas de rol en equipo para mejorar la convivencia y el rendimiento escolar.
* **Mejora Exclusiva ISkool:** No requiere instalar programas pesados ni consolas externas; corre 100% en la web moderna.
