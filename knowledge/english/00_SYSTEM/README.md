# iSchool English Knowledge Vault (Bóveda Curricular de Inglés)

Bienvenido a la **Bóveda Curricular de Inglés de iSchool**, el cerebro académico estructurado y propietario diseñado para sustentar todas las experiencias de aprendizaje de la lengua inglesa en la plataforma institucional.

## 1. Propósito Institucional

A diferencia de modelos improvisados donde se alimentan archivos PDF o textos arbitrarios al motor de inferencia, la Bóveda Curricular de Inglés de iSchool constituye una base de conocimiento pedagógica rigurosa, estructurada y gobernada bajo estándares internacionales y oficiales:

- **Marco Común Europeo de Referencia para las Lenguas (MCER / CEFR)** (Foundation, Pre-A1 a C2).
- **Alineaciones Curriculares Cambridge English** (Starters a Proficiency) como referencia comparativa y no reproductiva.
- **Objetivos curriculares y formativos por edad y grado escolar** (desde Preescolar hasta Preparatoria).
- **Habilidades lingüísticas y subhabilidades específicas**.
- **Progresiones gramaticales y léxicas graduadas**.
- **Funciones comunicativas del lenguaje en contexto real**.
- **Patrones pedagógicos y tipologías de actividades interactivas**.
- **Criterios de evaluación formativa y rúbricas analíticas**.

## 2. Principio Arquitectónico

```text
Fuentes Académicas Oficiales 
       ↓ 
Conocimiento Estructurado Markdown (.md + Frontmatter YAML) 
       ↓ 
Motor de Bóveda Curricular (Loader, Parser, Validator, SyncService, QueryService) 
       ↓ 
Motor de Inteligencia Artificial Pedagógica 
       ↓ 
Experiencias y Contenidos de Aprendizaje iSchool
```

Cada actividad o lección generada por el sistema es capaz de justificar pedagógicamente:
- ¿Para qué grado y etapa escolar fue diseñada?
- ¿A qué nivel CEFR corresponde?
- ¿Qué habilidad y subhabilidad desarrolla?
- ¿Qué vocabulario y estructura gramatical practica?
- ¿Qué función comunicativa ejercita?
- ¿Cuál es su nivel de dificultad y duración sugerida?
- ¿Qué fuentes o estándares oficiales respaldan dicha decisión formativa?

## 3. Estructura de Directorios

- `00_SYSTEM/`: Taxonomía, esquemas, reglas de generación y políticas de fuentes.
- `01_FRAMEWORKS/`: Estándares internacionales (CEFR, Cambridge) y matrices de correspondencia.
- `02_GRADE_MAP/`: Descriptores curriculares detallados de Preescolar a Preparatoria.
- `03_SKILLS/`: Nodos de habilidades (Listening, Speaking, Reading, Writing, Grammar, Vocabulary, Pronunciation).
- `04_TOPICS/`: Ejes temáticos contextualizados por edad e interés.
- `05_PEDAGOGY/`: Modelos de enseñanza (PBL, TBL, Gamificación pedagógica, Enfoque comunicativo).
- `06_ACTIVITY_PATTERNS/`: Patrones de diseño para lecciones, retos y proyectos interactivos.
- `07_ASSESSMENT/`: Rúbricas formativas, descriptores de logro y reactivos de evaluación.
- `99_SOURCES/`: Registro de procedencia bibliográfica y autorizaciones institucionales.

## 4. Gobernanza del Contenido

Todo nodo curricular debe cumplir con el esquema YAML obligatorio definido en `Frontmatter_Schema.md` y pertenecer a la taxonomía centralizada en `Taxonomy.md`. Por seguridad académica, **únicamente los documentos con estado `status: approved` son consumidos automáticamente en entornos de producción**.
