# Política de Fuentes y Propiedad Intelectual

Este documento regula el uso, procedencia y salvaguarda de propiedad intelectual dentro de la **Bóveda Curricular de Inglés de iSchool**.

---

## 1. Naturaleza del Conocimiento Curricular

iSchool construye su propia base de conocimiento pedagógico independiente. No se trata de un repositorio de libros escaneados ni de copias literales de editoriales comerciales.

Las fuentes admitidas se restringen a:
1. **Marcos y Documentos Oficiales de Dominio Público:**
   - Council of Europe: *Common European Framework of Reference for Languages: Learning, teaching, assessment – Companion volume* (CEFR 2020).
   - Secretaría de Educación Pública (SEP): Programas de Estudio, Campos Formativos y Procesos de Desarrollo de Aprendizaje (PDA) de la Nueva Escuela Mexicana (NEM 2024).
2. **Especificaciones y Guías Públicas de Cambridge Assessment English:**
   - Handbook for Teachers y listas de vocabulario de uso libre docente publicadas para propósitos de alineación formativa (Starters, Movers, Flyers, A2 Key, B1 Preliminary, B2 First, C1 Advanced).
3. **Producción Pedagógica Original de iSchool:**
   - Secuencias didácticas, dinámicas gamificadas, proyectos socioproductivos y reactivos diseñados por el claustro docente de iSchool.

---

## 2. Registro Obligatorio de Procedencia (`source_ids`)

Cada nodo curricular debe especificar explícitamente en su frontmatter el arreglo `source_ids`, apuntando a registros documentados en el directorio `99_SOURCES/`.

Ejemplo:
```yaml
source_ids:
  - cefr_companion_volume_2020
  - sep_nem_lenguajes_2024
```

---

## 3. Auditoría de Derechos y Originalidad

Periódicamente se ejecuta una auditoría curricular automatizada para certificar que ningún nodo contenga fragmentos de texto con derechos comerciales de terceros.
