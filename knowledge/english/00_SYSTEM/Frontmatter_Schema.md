# Esquema Frontmatter YAML - Bóveda Curricular de Inglés

Todos los archivos `.md` de la **Bóveda Curricular de Inglés de iSchool** deben incluir un bloque de metadatos YAML delimitado por `---` al inicio del documento.

---

## 1. Especificación de Campos

| Campo | Tipo | Obligatorio | Descripción / Valores Admitidos |
|---|---|:---:|---|
| `id` | `string` | **Sí** | Identificador kebab_case o snake_case único institucional (ej: `speaking_expressing_opinions_b1`). |
| `title` | `string` | **Sí** | Título pedagógico descriptivo en inglés o español. |
| `type` | `string` | **Sí** | Tipo de nodo: `skill_node`, `grammar_rule`, `vocabulary_set`, `language_function`, `activity_pattern`, `framework_spec`, `grade_profile`. |
| `school_stage` | `array[string]` | **Sí** | Uno o más de: `preschool`, `primary`, `secondary`, `high_school`, `advanced`. |
| `grades` | `array[string]` | **Sí** | Grados escolares aplicables (ej: `[secondary_3, high_school_1]`). |
| `age_band` | `array[string]` | No | Franja de edad sugerida (ej: `[14-15, 15-16]`). |
| `cefr` | `array[string]` | **Sí** | Uno o más niveles CEFR válidos: `Foundation`, `Pre-A1`, `A1`, `A2`, `B1`, `B2`, `C1`, `C2`. |
| `cambridge_alignment` | `array[string]` | No | Alineación de referencia: `Pre-A1 Starters`, `A1 Movers`, `A2 Flyers`, `A2 Key`, `B1 Preliminary`, `B2 First`, `C1 Advanced`, `C2 Proficiency`. |
| `skills` | `array[string]` | **Sí** | Habilidades principales: `listening`, `speaking`, `reading`, `writing`, `grammar`, `vocabulary`, `pronunciation`. |
| `subskills` | `array[string]` | No | Subhabilidades específicas (ej: `[expressing_opinion, agreeing, disagreeing]`). |
| `language_functions` | `array[string]` | No | Funciones comunicativas (ej: `[stating_viewpoint, polite_disagreement]`). |
| `grammar` | `array[string]` | No | Estructuras gramaticales objetivo (ej: `[opinion_phrases, modal_verbs]`). |
| `vocabulary` | `array[string]` | No | Campos léxicos o términos clave. |
| `topics` | `array[string]` | No | Ejes temáticos (ej: `[technology, education]`). |
| `pedagogy` | `array[string]` | No | Enfoques didácticos (ej: `[task_based_learning, communicative_language_teaching]`). |
| `activity_patterns` | `array[string]` | No | Patrones de actividad (ej: `[guided_debate, roleplay_dialogue]`). |
| `difficulty` | `string` | No | `beginner`, `elementary`, `pre_intermediate`, `intermediate`, `upper_intermediate`, `advanced`, `mastery`. |
| `duration_minutes` | `integer` | No | Duración recomendada de la sesión en minutos (ej: `45`). |
| `assessment` | `array[string]` | No | Métodos e instrumentos de evaluación (ej: `[oral_production_rubric]`). |
| `source_ids` | `array[string]` | **Sí** | Fuentes de referencia en `99_SOURCES/` (ej: `[cefr_companion_volume_2020]`). |
| `status` | `string` | **Sí** | Estado del ciclo de vida: `draft`, `review`, `approved`, `deprecated`. |
| `version` | `integer` | **Sí** | Versión numérica entera del documento (ej: `1`). |

---

## 2. Ejemplo Canónico

```yaml
---
id: speaking_expressing_opinions_b1
title: Expressing Opinions and Polite Disagreement
type: language_function
school_stage:
  - secondary
  - high_school
grades:
  - secondary_3
  - high_school_1
age_band:
  - 14-16
cefr:
  - B1
  - B2
cambridge_alignment:
  - B1 Preliminary
skills:
  - speaking
subskills:
  - expressing_opinion
  - agreeing
  - disagreeing
language_functions:
  - stating_viewpoint
  - polite_disagreement
grammar:
  - opinion_phrases
  - modal_verbs
vocabulary:
  - technology_descriptors
  - conversational_connectors
topics:
  - technology
  - education
pedagogy:
  - task_based_learning
activity_patterns:
  - guided_debate
difficulty: intermediate
duration_minutes: 45
assessment:
  - oral_production_rubric
source_ids:
  - cefr_companion_volume_2020
status: approved
version: 1
---

# Expressing Opinions and Polite Disagreement

## Pedagogical Overview
Students develop communicative confidence in articulating their perspectives on contemporary issues...
```
