# Propuesta 09: Apex Academy Venture Studio (Preparatoria · 15 a 18 Años)

> **ESTADO DE LA PROPUESTA:** DOCUMENTO CONCEPTUAL Y ESPECIFICACIÓN ARQUITECTÓNICA.  
> **RESTRICCIÓN:** NO IMPLEMENTADO EN CÓDIGO FUENTE DE PRODUCCIÓN.

---

## 1. Identidad Visual y Concepto de Juego
* **Nivel Educativo:** Preparatoria / Bachillerato (1º, 2º y 3º Preparatoria · 15 a 18 años).
* **Metáfora Lúdica:** Una aceleradora de talento, capital de innovación y *Venture Studio* de alta tecnología al estilo de Silicon Valley o incubadoras de universidades de clase mundial (Stanford, MIT, Tec de Monterrey).
* **Mecánica Central de Nivel:** **Gamificación Ejecutiva y de Prestigio Profesional**. Cero elementos infantiles. La motivación proviene de acumular "Capital de Proyecto" (*Venture Credits*), ganar "Rondas de Inversión Académica", liderar *Sprints* de investigación y construir un **Portafolio Verificado con Código QR y Firma Criptográfica** para admisiones universitarias y becas internacionales.

---

## 2. Vistas y Pantallas Detalladas

### Pantalla 1: Hub de la Incubadora & Tablero de Sprints Ejecutivos
![Hub Preparatoria Venture Studio](file:///C:/Users/kami-/.gemini/antigravity-ide/brain/7c1b550f-a889-4311-abec-4547336878b7/gamification_preparatoria_venture_studio_1792732893154.jpg)

* **Estructura Visual:** Interfaz ejecutiva moderna estilo *Linear*, *Vercel* y terminales financieras, con paleta oscura mate, bordes sutiles y acentos violeta e índigo.
* **Componentes Clave:**
  - **Pipeline de Proyectos:** Tablero Kanban con etapas (*Ideación*, *Validación de Mercado*, *Prototipado*, *Lanzamiento*).
  - **Métricas de Rendimiento:** GPA Ponderado, Horas de Investigación en Laboratorio, Índice de Dominio de Idioma (Cambridge C1).
  - **Feed de Mentores:** Asesoría personalizada del Asistente Pedagógico IA con perfil de consultor de carrera.

---

### Pantalla 2: Videojuego de Preguntas & Desafío de Admisión Universitaria (UniMastery Pro)
![Quiz Desafío Cálculo Preparatoria](file:///C:/Users/kami-/.gemini/antigravity-ide/brain/7c1b550f-a889-4311-abec-4547336878b7/gamification_quiz_preparatoria_mastery_1792734699863.jpg)

* **Mecánica de Evaluación y Dominio Universitario:**
  - **Desafío Matemático y Lógico de Nivel Superior:** *"Calcular el límite: lim(x->0) [sin(3x) / x]"*.
  - **Scratchpad & Razonamiento Paso a Paso en LaTeX:** En el panel izquierdo, el alumno puede desplegar y justificar formalmente cada paso (identificación de indeterminación 0/0, aplicación de límite estándar o regla de L'Hôpital).
  - **Predictor de Admisión Universitaria en Tiempo Real:** Panel derecho con medidor dinámico: *"UNAM/Tec Admission Predictor: 94% Probability of Acceptance"*.
  - **Peer Benchmark y Tiempo:** Muestra percentiles del alumno frente al estándar nacional e internacional (*Top 5% de la generación*).
  - **Editor de Código / Terminal Toggle:** Permite alternar a un entorno de código interactivo para resolver problemas mediante scripts de simulación.

---

### Pantalla 3: Portafolio de Competencias, Gráfica de Radar & Heatmap de Commits
![Portafolio Radar Preparatoria](file:///C:/Users/kami-/.gemini/antigravity-ide/brain/7c1b550f-a889-4311-abec-4547336878b7/gamification_preparatoria_portfolio_radar_1792734730504.jpg)

* **Perfil Académico de Alta Gama para el Alumno:**
  - **Gráfica de Radar Pentagonal de Competencias:**
    - *Pensamiento Matemático* (95/100)
    - *Habilidades STEM* (89/100)
    - *Redacción & Oratoria* (85/100)
    - *Liderazgo & Emprendimiento* (92/100)
    - *Inglés C1 Cambridge* (91/100)
  - **Mapa de Calor de Consistencia (Academic Heatmap):** 365 días de constancia en entregas y lecturas, similar al mapa de calor de contribuciones de desarrollo de software profesional.
  - **Credenciales Verificadas con Código QR:**
    - *Ceneval Gold Medalist*
    - *Cambridge C1 Certified*
    - *SEP - PDA 100% Logro Máximo*

---

### Pantalla 4: Módulo Universal del Profesor (Universal Challenge Studio)
![Módulo Universal Docente](file:///C:/Users/kami-/.gemini/antigravity-ide/brain/7c1b550f-a889-4311-abec-4547336878b7/gamification_teacher_universal_studio_1792734542445.jpg)

* **Rúbricas Complejas con 1 Clic:**
  - El profesor de preparatoria ingresa los criterios de una tesis o reporte de laboratorio; el sistema evalúa automáticamente redacción, citas de fuentes académicas y rigurosidad metodológica, traduciendo los resultados al radar de competencias del estudiante.

---

## 3. Integración con el Ecosistema ISkool
* **Conexión con Almacén Central (`usePortfolioStore`):** Los proyectos completados se sincronizan con el módulo de portafolio ya existente en ISkool, generando un link público verificable para oficinas de admisión de universidades.
* **Bóveda Curricular:** Consulta avanzada de ensayos históricos y tratados filosóficos estructurados con citas canónicas sin marcas externas.

---

## 4. Desafíos Técnicos de Implementación y Soluciones

| Desafío Técnico | Severidad | Solución Arquitectónica |
| :--- | :--- | :--- |
| **Generación y Verificación de Credenciales Criptográficas (QR)** | Media | Generación de firmas digitales HMAC-SHA256 con clave institucional de ISkool; cualquier universidad puede escanear el QR y validar la autenticidad del certificado sin necesidad de bases externas. |
| **Renderizado Rápido de Fórmulas Matemáticas Complejas** | Baja | Integración de KaTeX ligero (menos de 50KB) que renderiza LaTeX en <5 milisegundos en el navegador. |

---

## 5. Estimación de Tiempos y Capacitación Docente
* **Tiempo de Capacitación:** **6 a 8 horas**.
* **Foco:** Uso de rúbricas analíticas estandarizadas tipo Ceneval / IB (Bachillerato Internacional) y gestión del portafolio digital de egreso.

---

## 6. Viabilidad e Integración Cloud (Google Workspace / Drive)
* **Google Workspace Institucional Integral:**
  - **SSO con Cuentas Corporativas (@colegio.edu.mx):** Acceso instantáneo con inicio de sesión único institucional.
  - **Google Drive:** Los ensayos, códigos y tesis se guardan automáticamente en una carpeta compartida de Drive (`ISkool_Portfolio_SeniorYear/`) asegurando respaldo institucional y cumplimiento estricto de la política de compresión visual previa a la subida.
  - **Google Meet & Calendar:** Vinculación directa con las fechas de entrega de proyectos y tutorías docentes individuales.

---

## 7. Benchmarks Mundiales y Mejoras Internacionales Disruptivas
* **Linear & Portafolios Educativos de Élite:** Interfaces de productividad de élite donde los profesionales se sienten empoderados sin infantilizaciones.
* **Brilliant.org & Khan Academy Mastery:** Enfoque en maestría conceptual profunda y razonamiento inductivo.
* **Credly / Open Badges:** Ecosistema de insignias reconocidas formalmente por empleadores e instituciones de educación superior.
