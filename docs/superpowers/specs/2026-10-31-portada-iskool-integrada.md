# Portada de iskool.mx con el contenido de la página informativa — Diseño

**Fecha:** 2026-10-31
**Decisión de Carlos e Israel:** la portada actual de `iskool.mx` no aporta; debe mostrar el contenido de `conoce.iskool.mx`, con un solo botón de acceso, "Iniciar sesión". Google sigue revisando permisos (pidió videos) y aun así se hace ahora.

## Requisitos

1. `/` para visitantes sin sesión muestra la página informativa completa (versión México). Quien tiene sesión sigue redirigiéndose a su portal; el panel de super usuario no cambia.
2. El único acceso se llama **"Iniciar sesión"** y lleva a `/login`. Desaparecen "Entrar a la app" y "Conoce ISkool".
3. **Prohibido en la portada** (texto visible y metadatos): "app", "apps", "aplicación", "móvil". Se dice "plataforma". Motivo: no hay app móvil y afecta la revisión de Google.
4. **Requisitos de Google que se conservan:** enlaces a `https://iskool.mx/privacidad` y `https://iskool.mx/terminos`, contacto `contacto@iskool.mx`, y el párrafo que explica el inicio de sesión institucional y qué datos se usan (texto vigente en `PublicLanding`, cambiando solo esas palabras prohibidas si aparecen). La portada sigue siendo pública, sin redirección.
5. El formulario de demostración funciona dentro de la app (`/api/demo`), público, con las mismas variables `SMTP_*`. Sin ellas responde 503 y el formulario muestra el correo como alternativa.
6. Sin cambios de DNS ni de dominio. `app.iskool.mx` sigue abriendo el login.
7. Metadatos propios de la portada: título y descripción de la página informativa (versión México), canónica `https://iskool.mx/`, Open Graph, datos estructurados `Organization` y `sitemap.xml` con la portada, `/privacidad` y `/terminos`.

## Fuera de alcance

Variante Latinoamérica, botón de WhatsApp (número pendiente), redirección de `conoce.iskool.mx` (se hace al publicar), cambios a Privacidad y Términos.

## Restricciones

- El resto de la app no debe cambiar de aspecto: tokens de color, animaciones y fuentes de la portada van con prefijo o limitados a ella.
- Se conservan las reglas de contenido de la página informativa: sin nombres de prospectos, sin marcas de terceros, sin rojo ni verde, solo capacidades verificadas, español de México con "tú".
