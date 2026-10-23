# Propuesta 07: Gremio Cyber-Saga (Secundaria · 12 a 14 Años)

> **ESTADO DE LA PROPUESTA:** DOCUMENTO CONCEPTUAL Y ESPECIFICACIÓN ARQUITECTÓNICA.  
> **RESTRICCIÓN:** NO IMPLEMENTADO EN CÓDIGO FUENTE DE PRODUCCIÓN.

---

## 1. Identidad Visual y Concepto de Juego
* **Nivel Educativo:** Secundaria (1º, 2º y 3º Secundaria · Fase 6 SEP · 12 a 14 años).
* **Metáfora Lúdica:** Una arena de Esports y ciber-academia futurista inspirada en la cultura *Synthwave*, *Anime Cyberpunk* y plataformas de torneos juveniles.
* **Mecánica Central de Nivel:** **Pase de Batalla Académico de Temporada** ("Temporada 1: Horizonte Cuántico") y **Sistemas de Clanes por Salón** (Clan Fénix vs Clan Serpiente). El rendimiento individual eleva al grupo entero, generando pertenencia social positiva, mientras que los duelos en vivo miden precisión, velocidad de respuesta y consistencia.

---

## 2. Vistas y Pantallas Detalladas

### Pantalla 1: Hub del Gremio & Pase de Batalla
![Hub Secundaria Esports](file:///C:/Users/kami-/.gemini/antigravity-ide/brain/7c1b550f-a889-4311-abec-4547336878b7/gamification_secundaria_gremio_esports_1792732846760.jpg)

* **Estructura Visual:** Interfaz oscura con neones cian y magenta, badges de rango competitivo (Bronce, Plata, Oro, Diamante, Maestro) y Pase de Batalla de 50 niveles con recompensas cosméticas exclusivas.
* **Componentes Clave:**
  - **Tabla de Clanes:** Posición de la cuadrilla del salón basada en entregas puntuales y proyectos de ciencias.
  - **Indicador de Racha ("Daily Streak"):** Multiplicador de XP que premia el estudio diario continuo.
  - **Misiones de Escuadrón:** Tareas en parejas o tríos para fomentar el aprendizaje colaborativo.

---

### Pantalla 2: Videojuego de Preguntas & Duelo de Trivia en Vivo (Arena Cyber-Saga)
![Quiz Duelo Cyber Secundaria](file:///C:/Users/kami-/.gemini/antigravity-ide/brain/7c1b550f-a889-4311-abec-4547336878b7/gamification_quiz_secundaria_cyber_duel_1792734640480.jpg)

* **Mecánica de Combate Intelectual de Esports:**
  - Dos alumnos (o dos clanes) se enfrentan en pedestales holográficos en tiempo real sobre el escenario digital.
  - **Pantalla Central de Pregunta:** *"¿En qué año comenzó la Revolución Mexicana?"*
  - **Opciones Holográficas:** `A. 1810`, `B. 1910`, `C. 1857`, `D. 1920`.
  - **Speed Bonus Bar:** Entre más rápido responde el alumno correctamente, mayor es el multiplicador de puntos para su clan (*Combo Racha x5 - Clan Phoenix*).
  - **Chat de Espectadores en Vivo con Emoticones de Apoyo:** Los compañeros de clase pueden animar desde sus asientos con reacciones moderadas y respetuosas.

---

### Pantalla 3: Avatar Locker & Personalización Streetwear Techwear
![Avatar Locker Secundaria](file:///C:/Users/kami-/.gemini/antigravity-ide/brain/7c1b550f-a889-4311-abec-4547336878b7/gamification_avatar_secundaria_customizer_1792734666483.jpg)

* **Identidad Juvenil y Moda Digital:**
  - El alumno personaliza un avatar anime 3D cel-shaded con ropa urbana futurista (*techwear*).
  - **Categorías:** *Chamarra*, *Gafas Cyber*, *Mochila Tech*, *Títulos de Clan*.
  - **Rarezas y Prestigio Real:**
    - *Chamarra Neo-Estilo (Legendario):* Se desbloquea únicamente con una racha ininterrumpida de 30 días de estudio.
    - *Gafas Hologen (Épico):* Otorgadas al completar 100 PDA oficiales de la SEP.
    - *Nivel y Rango:* Muestra "Nivel 28 - Rango Diamante" y balance de "Monedas ISkool: 1,450".

---

### Pantalla 4: Módulo Universal del Profesor (Universal Challenge Studio)
![Módulo Universal Docente](file:///C:/Users/kami-/.gemini/antigravity-ide/brain/7c1b550f-a889-4311-abec-4547336878b7/gamification_teacher_universal_studio_1792734542445.jpg)

* **Modo "Torneo de Salón":**
  - El profesor activa el "Modo Arena" con 1 clic en su panel universal, proyectando la arena en la pantalla interactiva del salón. Los estudiantes se conectan con sus celulares o laptops para participar en torneos relámpago de 10 minutos al inicio o cierre de clase.

---

## 3. Integración con el Ecosistema ISkool
* **Conexión con [`AnimeAvatarSprite.tsx`](file:///c:/Users/kami-/.gemini/antigravity-ide/scratch/ISkool/src/components/AnimeAvatarSprite.tsx):** Aprovecha directamente el renderizador de sprites anime que ya reside en el código de ISkool, expandiendo su catálogo con el guardarropa streetwear y los banners de clan.
* **Avatares Vivos de la Bóveda Curricular:** Los personajes históricos aparecen como "Comentaristas Invitados de Honor" en la arena: Venustiano Carranza o Benito Juárez dan contexto en primera persona rigurosa tras una pregunta clave: *"Yo proclamé la Constitución de 1917 en Querétaro para consolidar las demandas de nuestro pueblo..."*.

---

## 4. Desafíos Técnicos de Implementación y Soluciones

| Desafío Técnico | Severidad | Solución Arquitectónica |
| :--- | :--- | :--- |
| **Baja Latencia en Duelos Multijugador Síncronos** | Alta | Uso de WebSockets con Supabase Realtime Channels / Node WebSockets, garantizando tiempos de respuesta <80ms en respuestas concurrentes de salón. |
| **Prevención de Acoso o Toxicidad en Chats de Clan** | Crítica | Filtro semántico por IA en el cliente y servidor que bloquea palabras altisonantes, admitiendo únicamente stickers de apoyo predefinidos durante el juego. |

---

## 5. Estimación de Tiempos y Capacitación Docente
* **Tiempo de Capacitación:** **6 a 8 horas**.
* **Foco:** Gestión de la energía del aula durante torneos en vivo, aprovechamiento de la competencia amistosa y lectura de analíticas de retención.

---

## 6. Viabilidad e Integración Cloud (Google Workspace / Drive)
* **Google Classroom:** Las tareas y cuestionarios de Classroom se sincronizan automáticamente con el Pase de Batalla de ISkool; cada entrega acreditada otorga 100 puntos de pase de temporada.
* **Google Drive:** Los reportes de estadísticas del clan y rúbricas de evaluación se exportan automáticamente a Google Sheets en Drive para la dirección escolar.

---

## 7. Benchmarks Mundiales y Mejoras Internacionales Disruptivas
* **Guilded / Discord Academics:** Canales temáticos y pertenencia a gremios juveniles.
* **Kahoot! Live & Gimkit:** Adrenalina de juego colectivo en el salón.
* **Mejora Exclusiva ISkool:** El progreso cosmético no se compra con dinero real (cero microtransacciones); la única moneda es el mérito académico y la constancia diaria.
