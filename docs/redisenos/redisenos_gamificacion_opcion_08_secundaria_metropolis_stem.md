# Propuesta 08: Metrópolis de Inventores (Secundaria · 12 a 14 Años)

> **ESTADO DE LA PROPUESTA:** DOCUMENTO CONCEPTUAL Y ESPECIFICACIÓN ARQUITECTÓNICA.  
> **RESTRICCIÓN:** NO IMPLEMENTADO EN CÓDIGO FUENTE DE PRODUCCIÓN.

---

## 1. Identidad Visual y Concepto de Juego
* **Nivel Educativo:** Secundaria (1º a 3º Secundaria · 12 a 14 años).
* **Metáfora Lúdica:** Una metrópolis de ingeniería victoriana-retro-futurista (*Steampunk*) impulsada por energía que los estudiantes generan al resolver problemas de física, química, matemáticas y tecnología.
* **Mecánica Central de Nivel:** Simulación urbana y patentes de invención. Cada reto académico superado suministra kilovatios o vapor a los distritos de la ciudad (Distrito Eléctrico, Distrito Médico, Distrito de Transporte, Observatorio).

---

## 2. Vistas y Pantallas Detalladas

### Pantalla 1: Hub de la Metrópolis en Expansión
![Hub Secundaria Metrópolis](file:///C:/Users/kami-/.gemini/antigravity-ide/brain/7c1b550f-a889-4311-abec-4547336878b7/gamification_secundaria_metropolis_stem_1792732869540.jpg)

* **Estructura Visual:** Vista aérea isométrica de una ciudad con trenes magnéticos a vapor, torres de Tesla con relámpagos controlados y chimeneas de engranes de latón.
* **Componentes Clave:**
  - **Cuadrícula de Energía de la Ciudad:** Muestra el porcentaje de iluminación de cada distrito.
  - **Oficina de Patentes del Inventor:** Lugar donde se guardan los proyectos terminados del Lienzo Digital.
  - **Medidor de Eficiencia Energética:** Sube al entregar a tiempo y sin errores.

---

### Pantalla 2: Videojuego de Preguntas & Laboratorio de Circuitos (El Generador Tesla)
![Quiz Duelo Cyber](file:///C:/Users/kami-/.gemini/antigravity-ide/brain/7c1b550f-a889-4311-abec-4547336878b7/gamification_quiz_secundaria_cyber_duel_1792734640480.jpg)

* **Mecánica de Pregunta:**
  - Para encender el reactor de la ciudad, se debe equilibrar una ecuación de física o balancear una reacción química.
  - El alumno conecta terminales de prueba; si la respuesta es correcta, los voltímetros suben, los engranes giran a toda marcha y el distrito recibe energía limpia.

---

### Pantalla 3: Personalizador de Avatar de Inventor / Ingeniera
![Avatar Customizer](file:///C:/Users/kami-/.gemini/antigravity-ide/brain/7c1b550f-a889-4311-abec-4547336878b7/gamification_avatar_secundaria_customizer_1792734666483.jpg)

* **Atuendos y Aditamentos de Latón y Cristal:**
  - Monóculos térmicos, chalecos de cuero con correas de herramientas, guantes dieléctricos y brazos biónicos retro-futuristas.

---

### Pantalla 4: Módulo Universal del Profesor (Universal Challenge Studio)
![Módulo Universal Docente](file:///C:/Users/kami-/.gemini/antigravity-ide/brain/7c1b550f-a889-4311-abec-4547336878b7/gamification_teacher_universal_studio_1792734542445.jpg)

* **Asignación de "Megaproyectos de Ingeniería":**
  - Los profesores de ciencias pueden agrupar a los alumnos para que cada cuadrilla sea responsable de mantener iluminado un distrito completo de la ciudad durante el bimestre.

---

## 3. Integración con el Ecosistema ISkool
* **Lienzo Digital:** Los bocetos de circuitos y experimentos creados por los alumnos se integran directamente como planos de ingeniería de la ciudad.
* **Bóveda Curricular:** Enlaces a notas sobre la Revolución Industrial, Nikola Tesla y Marie Curie narrados con citas y contexto fidedigno.

---

## 4. Desafíos Técnicos de Implementación y Soluciones
* **Simulación de Estados Urbanos Persistentes:** Almacenamiento eficiente de la matriz de edificios y niveles de energía en JSON relacional optimizado dentro de PostgreSQL / Supabase.

---

## 5. Estimación de Tiempos y Capacitación Docente
* **Tiempo de Capacitación:** **6 a 8 horas**.
* **Foco:** Vinculación de problemas de la vida real (energías renovables, consumo sustentable) con los indicadores de la metrópolis.

---

## 6. Viabilidad e Integración Cloud (Google Workspace / Drive)
* **Google Slides & Sheets:** Los alumnos pueden armar presentaciones de sus patentes de invención en Google Slides y vincularlas directamente a la torre de patentes de su metrópolis con sincronización en Google Drive.

---

## 7. Benchmarks Mundiales y Mejoras Internacionales Disruptivas
* **SimCityEDU & Kerbal Space Program:** Aprendizaje de principios de física y gestión de recursos complejos mediante simulación interactiva.
* **Brilliant.org:** Resolución de problemas lógicos paso a paso con retroalimentación visual inmediata.
