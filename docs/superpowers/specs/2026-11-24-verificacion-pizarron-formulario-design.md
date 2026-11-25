# Verificación "Borra el pizarrón" para el formulario de demostración

Fecha: 2026-11-24 · Rama: `claude/iskool-bot-form-protection-9878a2`

## Por qué

El 2026-11-24 llegó al buzón de contacto una "Solicitud de demostración" enviada por un bot:
Nombre "Kennethagide", Escuela y Cargo con nombres de dos empresas tecnológicas conocidas, teléfono de 11 dígitos, correo de un
proveedor gratuito y mensaje sin sentido ("Jfeuwgduwefhw fuhe-"). Carlos no quiere que siga
pasando y pidió un captcha que **también frene bots con IA** y que, de ser posible, **sea divertido**.

El formulario (`src/components/landing/DemoForm.tsx` → `POST /api/demo`, `src/app/api/demo/route.ts`)
hoy solo tiene un campo trampa (`sitio`) y un límite en memoria de 10 envíos / 10 min por IP.
Un bot que envía directo al endpoint los cinco campos visibles pasa sin cargar la página.

## Metas

1. Ningún envío llega al buzón sin probar que se cargó la página y se resolvió la verificación.
2. Frenar bots de spam masivo y encarecer mucho a los bots con IA (navegador automatizado + visión).
3. Un minijuego escolar amable: **"¡Borra el pizarrón!"** (elegido por Carlos).
4. Nunca perder a un cliente real por un falso positivo del filtro.

## No metas

- Garantizar 100 % contra IA (imposible con cualquier captcha; se dice así a Carlos).
- Cambiar el formulario de `/promo` (ver "Hallazgo aparte").
- Persistencia distribuida (Redis, base de datos) para el registro de pases usados.

## Anti-metas (fracaso aunque "funcione")

- Mostrar cualquier marca comercial de terceros o enviar datos de visitantes a un tercero
  (Regla No Negociable 1). Nada de servicios de captcha externos ni scripts de terceros.
- Que una docente de +40 años poco técnica (arquetipo "Miss Juanita") se trabe o no entienda qué hacer.
- Que una solicitud real quede descartada en silencio por una heurística dudosa.
- Requerir que Carlos configure algo nuevo en el hosting para que funcione.

## Restricciones

- Next 16 de este repo (leer `node_modules/next/dist/docs/` antes de escribir route handlers).
- La ruta nueva debe agregarse a la lista pública de `src/middleware.ts` (como `/api/demo`).
- Pruebas: solo `npx vitest run tests/landing` (la suite completa reescribe archivos versionados).
- Solo commits locales; nada de push.
- Textos en español de México, tuteo (como el resto del formulario).

## Enfoques considerados

| Enfoque | Pros | Contras | Decisión |
|---|---|---|---|
| A. Verificación propia: prueba de trabajo + minijuego + medición del movimiento | Sin marcas ni terceros; divertido; el análisis de movimiento y el costo por intento encarecen a la IA | Un bot con IA muy sofisticado puede pasarla imitando movimiento | **Elegido** |
| B. Captcha de un tercero | El más fuerte | Muestra marca ajena y envía datos de visitantes: rompe la Regla 1 | Descartado |
| C. Pregunta sencilla ("¿4 + 3?") | Trivial | Estorba y la IA la resuelve | Descartado |

Minijuegos considerados: borrar el pizarrón (**elegido**: el que más movimiento genera para analizar,
funciona con dedo y mouse), llevar la manzana al escritorio (poco movimiento), ordenar la mochila
(la IA reconoce objetos fácilmente).

## Diseño

### 1. Pase firmado con prueba de trabajo — `GET /api/demo/challenge`

- El servidor genera `salt` (aleatorio + `expiresAt` + `issuedAt` codificados), elige un número secreto
  `n` en `[0, max]`, calcula `challenge = sha256(salt + n)` y `signature = HMAC-SHA256(clave, challenge)`.
  Responde `{ salt, challenge, max, signature }` con `Cache-Control: no-store`.
- `max` calibrado para ~0.5–1.5 s en un celular de gama media (orden de 50 000–100 000).
- Clave: `DEMO_FORM_SECRET` si existe; si no, derivada `HMAC(SMTP_PASS, 'iskool-demo-form-v1')`.
  Así funciona sin configurar nada nuevo en el hosting. Si no hay ninguna, el endpoint responde 503
  (el formulario ya responde 503 sin `SMTP_PASS`). Agregar a `amplify.yml` la línea opcional de
  `DEMO_FORM_SECRET` igual que las `SMTP_*`.
- El navegador busca `n` con Web Crypto (`crypto.subtle.digest`) en lotes que ceden el hilo,
  **en segundo plano mientras la persona borra**, para que no haya espera visible.
- Vigencia del pase: 30 min. Tiempo mínimo entre emisión y envío: 3 s.
- Un pase sirve **una sola vez**: registro en memoria `Map<challenge, expiresAt>` con limpieza
  periódica (limitación aceptada: es por instancia del servidor).

### 2. Minijuego "¡Borra el pizarrón!" — componente cliente nuevo

- Un pizarrón verde (o la paleta de la portada: marino/cielo) con trazos de gis dibujados en
  `<canvas>` a partir de una semilla aleatoria por pase (los trazos cambian cada vez).
- La persona arrastra con dedo, mouse o lápiz (Pointer Events, `touch-action: none` dentro del
  pizarrón) y el gis se borra donde pasa el borrador. Al cubrir ~65 % aparece una palomita y el
  texto "¡Listo! Gracias." La animación respeta `prefers-reduced-motion`.
- Se registran muestras `{x, y, t}` del puntero (normalizadas a 0–1, cada ~16 ms, máximo ~400)
  y solo de eventos con `isTrusted`.
- Rótulo claro: "Para enviar, borra el pizarrón con el dedo o el mouse". El botón "Enviar solicitud"
  sigue visible; si se pulsa sin haber borrado, se muestra el error junto al pizarrón y se enfoca.
- Accesibilidad: el pizarrón es enfocable; con teclado (Enter / Espacio) se borra con una animación
  automática. Ese camino se marca como `mode: 'keyboard'` y se trata como "sospechoso" (se entrega
  con etiqueta), no se descarta. Debajo, la alternativa: "¿No puedes usar el pizarrón? Escríbenos a
  contacto@iskool.mx".
- El envío agrega al JSON: `verificacion: { salt, challenge, signature, number, mode, trazo: [...] }`.

### 3. Validación en el servidor (`POST /api/demo`)

Orden y resultado:

| Verificación | Si falla |
|---|---|
| Campo trampa lleno | `200 { ok: true }` sin enviar (igual que hoy) |
| Origen: si viene `Origin`, su host debe ser el mismo que `Host`; si viene `Sec-Fetch-Site`, debe ser `same-origin` | 403 |
| Límite por IP (el actual) | 429 |
| Pase ausente, firma inválida, `sha256(salt+number) ≠ challenge`, vencido, menos de 3 s, ya usado | 400 con mensaje "La verificación venció; borra el pizarrón otra vez." |
| Movimiento claramente sintético (ver abajo) | `200 { ok: true }` sin enviar |
| Movimiento dudoso, modo teclado o contenido sospechoso | Se envía con asunto `[POSIBLE SPAM] Solicitud de demostración — …` y una línea al final con los motivos |
| Todo bien | Se envía normal |

**Análisis del trazo** (función pura, probada): a partir de las muestras el servidor recalcula la
cobertura del borrado en una cuadrícula (el cliente no puede declarar "ya terminé"), y mide:
número de puntos, duración total, regularidad de intervalos de tiempo, variación de velocidad,
cambios de dirección y rectitud. Devuelve `ok | dudoso | sintetico` con los motivos.
- `sintetico` solo con señales inequívocas: cobertura recalculada < umbral, menos de ~15 puntos,
  duración < 600 ms, o intervalos y velocidad prácticamente constantes (varianza ~0) con trayectorias rectas.
- Todo lo intermedio es `dudoso` (se entrega etiquetado).

**Análisis del contenido** (función pura, probada) → solo etiqueta, nunca descarta:
- Texto sin sentido: rachas largas de consonantes / proporción anómala de vocales en nombre o mensaje.
- Escuela y cargo de una sola palabra cada uno y sin ninguna palabra escolar o de puesto
  reconocible (escuela, colegio, instituto, director, coordinador, maestro, etc.). **No** se usa
  una lista de marcas: la Regla No Negociable 1 prohíbe nombres comerciales en el código.
- Ligas (`http`, `www.`) en cualquier campo.
- Teléfono con un número de dígitos que no corresponde a México (10, o 12 con 52) ni a
  Norteamérica (10, u 11 con 1).

### 4. Pruebas (en `tests/landing/`)

- Pase: emisión y verificación; firma alterada, número incorrecto, vencido, < 3 s y reutilizado son rechazados.
- Trazo: trayectoria humana grabada (fixture) → `ok`; línea recta a velocidad constante → `sintetico`;
  muy pocos puntos → `sintetico`; teclado → `dudoso`.
- Contenido: el envío del bot del 2026-11-24 → sospechoso; un envío real de escuela mexicana → limpio.
- Ruta: actualizar `demoRoute.test.ts` (los envíos válidos ahora llevan verificación) y cubrir
  origen, 400 de pase y asunto etiquetado.
- Componente: el formulario no envía sin pizarrón borrado y muestra el error.

## Hallazgo aparte (fuera de este cambio)

El formulario de `/promo` (`src/app/promo/page.tsx:1052`) envía a `/api/demo` campos con otros
nombres (`schoolName`, `contactEmail`, …); el servidor lo rechaza con 400 y la página no lo nota,
así que esas solicitudes nunca llegan por correo. Con este cambio seguirán sin llegar. Se propone
como tarea aparte (mapear campos y agregar el pizarrón ahí).

## Lo que queda al criterio de quien construya

Valor exacto de `max`, umbrales numéricos del trazo, forma y cantidad de trazos de gis, tamaño
de la cuadrícula de cobertura, nombres de archivos, siempre dentro de lo descrito arriba.
