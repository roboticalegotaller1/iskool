# Reglas de Generación de Actividades con Inteligencia Artificial Pedagógica

Este documento rige cómo el **Motor de Inteligencia Artificial Pedagógica** de iSchool debe consultar y transformar el conocimiento de la Bóveda Curricular en actividades dinámicas, ejercicios, desafíos gamificados y rúbricas.

---

## 1. Consulta Prioritaria en Bóveda Curricular (Vault-First)

1. Antes de componer cualquier experiencia educativa, el motor solicita al servicio de consulta (`KnowledgeVaultQueryService`) los nodos aprobados (`status: approved`) para el grado, nivel CEFR, habilidad y tema especificados.
2. Si existen nodos aprobados, la IA utiliza dichos metadatos y estructuras como **contexto restrictivo y delimitador (Grounding)**. La IA **no debe improvisar** vocabulario o tiempos verbales por encima o por debajo del nivel CEFR asignado.
3. Si un nodo contiene vocabulario delimitado (ej. 8 palabras para Pre-A1), la actividad generada debe centrarse exclusivamente en ese repertorio para no sobrecargar cognitivamente al estudiante.

---

## 2. Filtro Estricto de Estado (`status: approved`)

1. El entorno de producción únicamente alimenta al generador con nodos en estado `approved`.
2. Nodos en estado `draft` o `review` sólo pueden ser previsualizados en entornos de prueba docente o laboratorios pedagógicos internos.
3. Nodos en estado `deprecated` son omitidos en las consultas automáticas de generación.

---

## 3. Principio de Prohibición de Alucinación Curricular

Toda actividad generada debe poder emitir su ficha de procedencia pedagógica:
- ¿Qué nodo de la Bóveda Curricular le dio origen?
- ¿Qué identificador de fuente (`source_ids`) respalda la estructura?
- ¿Qué descriptor de competencia ("Can-Do") evalúa?

Cualquier generación que no pueda trazar su origen a la Bóveda Curricular es clasificada como inválida.
