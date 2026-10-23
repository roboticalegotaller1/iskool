# Propuesta 02: La Isla de los Juguetes Mágicos (Preescolar · Voxel 3D & Bloques)

> **ESTADO DE LA PROPUESTA:** DOCUMENTO CONCEPTUAL Y ESPECIFICACIÓN ARQUITECTÓNICA.  
> **RESTRICCIÓN:** NO IMPLEMENTADO EN CÓDIGO FUENTE DE PRODUCCIÓN.

---

## 1. Identidad Visual y Concepto de Juego
* **Nivel Educativo:** Preescolar (Fase 2 SEP · 3 a 5 años).
* **Metáfora Lúdica:** Una isla flotante tridimensional en miniatura construida con bloques de madera encajables y juguetes inteligentes que cobran vida.
* **Mecánica Central de Nivel:** Construcción espacial y motricidad cognitiva. Cada pregunta resuelta otorga un nuevo bloque mágico (ruedas, engranes luminosos, techos de castillo, banderas de colores) para expandir la isla de la clase.

---

## 2. Vistas y Pantallas Detalladas

### Pantalla 1: Hub de la Isla Flotante
![Hub Preescolar Isla Mágica](file:///C:/Users/kami-/.gemini/antigravity-ide/brain/7c1b550f-a889-4311-abec-4547336878b7/gamification_preescolar_isla_magica_1792732740102.jpg)

* **Estructura Visual:** Maqueta en perspectiva isométrica con física suave de gravedad. La isla flota suavemente sobre nubes de algodón.
* **Componentes Clave:**
  - **Taller de Construcción:** Donde se ensamblan los juguetes ganados.
  - **Faro del Saber:** Emite un haz de luz de color según el estado de las actividades del día.
  - **Ruta de Globos Aerostáticos:** Cada globo lleva a una aventura temática (Sonidos de Animales, Círculos y Cuadrados, Números del 1 al 10).

---

### Pantalla 2: Videojuego de Preguntas & Desafío Lúdico (El Puente de Bloques Encajables)
![Quiz Minijuego Preescolar](file:///C:/Users/kami-/.gemini/antigravity-ide/brain/7c1b550f-a889-4311-abec-4547336878b7/gamification_quiz_preescolar_gameplay_1792734559505.jpg)

* **Mecánica de Pregunta para Subir de Nivel:**
  - El trenecito de la isla necesita cruzar un barranco. Para completar el puente, falta la pieza correcta.
  - **Pregunta Oral:** *"¿Qué número falta para que el trenecito continúe? 1... 2... ¡y luego viene el...!"*
  - **Opciones de Respuesta:** Tres bloques gigantes con relieves táctiles (bloque con '3' puntos, bloque con '5' puntos, bloque con triángulo).
  - **Efecto de Subida de Nivel:** Al colocar el bloque acertado, el tren hace sonar su silbato musical, cruza el puente y suelta una nube de estrellas que llena la barra de nivel del salón.

---

### Pantalla 3: Vestidor y Compañero Robótico/Juguete
![Personalizador Avatar Preescolar](file:///C:/Users/kami-/.gemini/antigravity-ide/brain/7c1b550f-a889-4311-abec-4547336878b7/gamification_avatar_preescolar_customizer_1792734577407.jpg)

* **Personalización del Juguete:**
  - El alumno puede personalizar a su "Juguete Guardián" con piezas coleccionables (ruedas de tren, hélices voladoras, ojos luminosos, capas de superhéroe).
  - Permite a niños con diversas habilidades motoras elegir accesorios con solo tocar dos veces la pantalla.

---

### Pantalla 4: Módulo Universal del Profesor (Universal Challenge Studio)
![Estudio Universal Docente](file:///C:/Users/kami-/.gemini/antigravity-ide/brain/7c1b550f-a889-4311-abec-4547336878b7/gamification_teacher_universal_studio_1792734542445.jpg)

* **Integración Docente Transparente:**
  - La educadora utiliza exactamente el mismo panel maestro que los profesores de secundaria y preparatoria.
  - Al ingresar preguntas de discriminación visual o seriación matemática, el sistema autoselecciona la plantilla de "Puente de Bloques" de la Isla Mágica.

---

## 3. Integración con el Ecosistema ISkool
* **Conexión con Almacén Central (`useStudentStore`):** Mapeo de progresos a `currentMission` y `streakDays`.
* **Lienzo Digital:** Las actividades de pintura con dedos creadas en el Lienzo Digital se convierten en cuadros colgados en la galería del castillo de la isla.

---

## 4. Desafíos Técnicos de Implementación y Soluciones

| Desafío Técnico | Severidad | Solución Arquitectónica |
| :--- | :--- | :--- |
| **Motor de Renderizado Isométrico Ligero** | Media | Utilizar CSS 3D transforms o Three.js con mallas de bajo poligonaje (*low-poly*) para asegurar 60 FPS en tablets escolares de gama media/baja. |
| **Persistencia de la Construcción de la Isla** | Baja | Serialización de coordenadas de bloques en JSON comprimido en Supabase / Base de datos ISkool (menos de 2KB por alumno). |

---

## 5. Estimación de Tiempos y Capacitación Docente
* **Tiempo de Capacitación:** **4 horas prácticas** (1 taller de configuración de proyectos y 1 taller de seguimiento de métricas).
* **Curva de Aprendizaje:** Muy intuitivo; los maestros observan el progreso como una isla que crece, lo cual facilita reportes a padres en juntas bimestrales.

---

## 6. Viabilidad e Integración con Suites Cloud Institucionales (Google Workspace / Drive)
* **Google Workspace for Education:** Conexión con carpetas de Classroom y Drive. Cada construcción de la isla genera un "Diploma de Explorador" en PDF comprimido que se deposita automáticamente en el Drive de los padres y del colegio.

---

## 7. Benchmarks Mundiales y Mejoras Internacionales Disruptivas
* **LEGO DUPLO World:** Interacción física táctil donde las piezas hacen clic sonoro gratificante.
* **Roblox Education (Pre-K concepts):** Creación de entornos comunitarios seguros y sin chat de texto para menores.
* **Mejora Exclusiva ISkool:** Cada bloque de la isla corresponde 100% a un PDA curricular oficial evaluable.
