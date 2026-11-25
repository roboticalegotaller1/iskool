# Verificación "Borra el pizarrón" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que el formulario de demostración de iskool.mx solo entregue solicitudes que cargaron la página, resolvieron una prueba de trabajo y borraron un pizarrón con movimiento humano, etiquetando lo dudoso en lugar de perderlo.

**Architecture:** Lógica pura y probada en `src/lib/landing/verification/` (pase firmado, análisis del trazo, análisis del contenido); una ruta nueva `GET /api/demo/challenge`; `POST /api/demo` decide entregar / etiquetar / descartar; un componente cliente `Pizarron` dentro de `DemoForm` resuelve la prueba de trabajo en segundo plano mientras la persona borra.

**Tech Stack:** Next 16 (route handlers, runtime Node), React cliente, `node:crypto` en servidor, Web Crypto (`crypto.subtle`) en navegador, `<canvas>` + Pointer Events, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-24-verificacion-pizarron-formulario-design.md` (léela completa, incluida la sección "Decisiones tras la revisión del constructor", que manda sobre lo anterior).

## Global Constraints

- Leer `node_modules/next/dist/docs/` (route handlers) antes de escribir rutas; esta versión de Next difiere de lo conocido.
- Regla 1: ningún nombre de marca comercial en código, comentarios, textos, nombres de archivo ni pruebas. Nada de scripts o servicios de terceros.
- Textos visibles en español de México, tuteo.
- Pruebas: solo `npx vitest run tests/landing` (la suite completa reescribe archivos versionados). Revisar `git status` antes de cada commit y no incluir archivos ajenos.
- Solo commits locales en la rama actual; nunca push.
- Commits terminan con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Clave de firma: `DEMO_FORM_SECRET` o, si falta, `HMAC-SHA256(SMTP_PASS, 'iskool-demo-form-v1')`; sin ninguna → sin pase (503).
- Pase: vigencia 30 min, mínimo 3 s entre emisión y envío, un solo uso.
- Cobertura para dar por borrado: 65 %. Muestras diezmadas por distancia (≥ ~1 % del ancho), tope ~1500.
- `sintetico` solo con: < 15 puntos, duración < 600 ms, o intervalos y velocidad casi constantes con trayectoria recta. Cobertura recalculada baja → `dudoso`.
- Teclado: ≥ 2 pulsaciones y ≥ 1.5 s; límite 3 envíos de teclado por IP por hora, después `200 { ok: true }` sin enviar.
- Asunto etiquetado: `[POSIBLE SPAM] ` + asunto actual, con una línea final en el cuerpo `Motivos de revisión: …`.

## Review Focus

1. Docente lenta que borra durante 20 s o más: el trazo cabe completo (diezmado por distancia) y su solicitud se entrega → prueba en Task 2.
2. Pestaña abierta más de 30 min antes de enviar: el formulario pide un pase nuevo y deja volver a borrar, sin perder lo escrito → prueba en Task 5.
3. Envío en celular con el dedo: el pizarrón no hace scroll de la página mientras se borra (`touch-action: none`) y los eventos táctiles cuentan → prueba en Task 5.
4. El endpoint de pase falla (503 o red): el formulario muestra el aviso con el correo de contacto en vez de quedarse girando → prueba en Task 5.
5. Doble clic en "Enviar solicitud": el pase de un solo uso no hace que el segundo envío muestre error al usuario después de un éxito → prueba en Task 5.

---

### Task 1: Pase firmado con prueba de trabajo + ruta `GET /api/demo/challenge`

**Files:**
- Create: `src/lib/landing/verification/challenge.ts`
- Create: `src/app/api/demo/challenge/route.ts`
- Modify: `src/middleware.ts` (lista pública, junto a `pathname === '/api/demo'`)
- Modify: `amplify.yml` (línea opcional `DEMO_FORM_SECRET`, igual a las `SMTP_*`)
- Test: `tests/landing/challenge.test.ts`; agregar un caso al bloque de middleware de `tests/landing/demoRoute.test.ts`

**Interfaces:**
- Produces:
  - `export interface DemoChallenge { salt: string; challenge: string; max: number; signature: string }`
  - `export const CHALLENGE_TTL_MS = 30 * 60_000`, `export const MIN_FILL_MS = 3_000`
  - `export function getSigningKey(): string | null`
  - `export function createChallenge(now?: number): DemoChallenge | null` — `null` si no hay clave
  - `export type ChallengeFailure = 'ausente' | 'firma' | 'numero' | 'vencido' | 'muy-rapido' | 'usado'`
  - `export function verifyChallenge(input: unknown, now?: number): { ok: true } | { ok: false; motivo: ChallengeFailure }` — consume el pase solo si todo lo demás pasó
  - `export function sha256Hex(text: string): string` (servidor)
  - Formato de `salt`: `${hexAleatorio16bytes}.${issuedAtMs}.${expiresAtMs}`; `challenge = sha256Hex(salt + String(n))`; `signature = HMAC-SHA256(clave, challenge)` en hex. `max` constante (sugerido 75 000; calibrar).
  - Registro de usados: `Map<string, number>` a nivel de módulo, limpieza de vencidos en cada verificación; `export function __resetUsedChallenges(): void` solo para pruebas.

- [ ] **Step 1: Write the failing tests** — en `challenge.test.ts` con `vi.stubEnv('SMTP_PASS', 'x')`: `crea y verifica un pase resuelto` (resolver por fuerza bruta en la prueba hasta `max`, verificar con `now = issued + 3_000` → `{ ok: true }`); `rechaza firma alterada` → `'firma'`; `rechaza número incorrecto` → `'numero'`; `rechaza vencido` (`now = issued + 30*60_000 + 1`) → `'vencido'`; `rechaza antes de 3 s` → `'muy-rapido'`; `rechaza reuso` (segunda verificación) → `'usado'`; `rechaza entrada sin forma` (`{}`, `null`) → `'ausente'`; `sin SMTP_PASS ni DEMO_FORM_SECRET createChallenge devuelve null`; `DEMO_FORM_SECRET tiene prioridad` (pase firmado con una clave no verifica con la otra). Ruta: `GET` devuelve 200 con las cuatro llaves y `Cache-Control: no-store`; 503 sin clave. Middleware: `GET /api/demo/challenge` sin sesión → `x-middleware-next: 1`.
- [ ] **Step 2: Run** `npx vitest run tests/landing/challenge.test.ts tests/landing/demoRoute.test.ts` — Expected: FAIL (módulo inexistente / middleware redirige).
- [ ] **Step 3: Implement** `challenge.ts`, la ruta (`export const dynamic = 'force-dynamic'` si los docs de Next 16 lo requieren para GET) y la línea de middleware. Comparar firmas con `timingSafeEqual`.
- [ ] **Step 4: Run** el mismo comando — Expected: PASS.
- [ ] **Step 5: Commit** `feat(formulario): pase firmado con prueba de trabajo para la solicitud de demostracion`.

### Task 2: Análisis del trazo del pizarrón

**Files:**
- Create: `src/lib/landing/verification/trace.ts`
- Test: `tests/landing/trace.test.ts` (fixtures generadas en la prueba con un generador determinista de semilla fija)

**Interfaces:**
- Produces:
  - `export interface TracePoint { x: number; y: number; t: number }` (x, y normalizados 0–1; t en ms desde el primer evento)
  - `export interface TraceInput { mode: 'pointer' | 'keyboard'; radio: number; trazo: TracePoint[]; teclas: { t: number }[] }`
  - `export const COVERAGE_TARGET = 0.65`, `export const COVERAGE_GRID = 24`, `export const MAX_TRACE_POINTS = 1500`
  - `export function computeCoverage(trazo: TracePoint[], radio: number, grid?: number): number` — fracción 0–1 de celdas de la cuadrícula `grid×grid` cuyo centro quedó a ≤ `radio` de algún segmento del trazo. La usa también el cliente (Task 5), por eso vive aquí sin dependencias de servidor.
  - `export function analyzeTrace(input: unknown): { veredicto: 'ok' | 'dudoso' | 'sintetico'; motivos: string[] }` — valida forma (entrada mal formada → `sintetico`, motivo `'forma'`; más de `MAX_TRACE_POINTS` → `sintetico`).

- [ ] **Step 1: Write the failing tests:**
  - `trazo humano en zigzag con ruido y velocidad variable cubre el pizarrón → ok`
  - `trazo humano lento de 25 s con ~1200 puntos → ok` (Review Focus 1)
  - `línea recta a velocidad e intervalos constantes → sintetico`
  - `menos de 15 puntos → sintetico`; `duración 400 ms → sintetico`
  - `trazo humano que cubre solo 40 % → dudoso` (motivo `'cobertura'`), nunca `sintetico`
  - `teclado con 2 teclas y 1.6 s → dudoso` (motivo `'teclado'`); `teclado con 1 tecla o 0.5 s → sintetico`
  - `computeCoverage` de un barrido completo en filas con radio 0.06 ≥ 0.65; de un solo punto < 0.05
- [ ] **Step 2: Run** `npx vitest run tests/landing/trace.test.ts` — Expected: FAIL.
- [ ] **Step 3: Implement.** Señal de "constante": coeficiente de variación de intervalos y de velocidades < 0.05 y rectitud (distancia directa / longitud recorrida por tramo entre cambios de dirección) > 0.98. Umbrales exactos a criterio del implementador, siempre que pasen las pruebas.
- [ ] **Step 4: Run** — Expected: PASS.
- [ ] **Step 5: Commit** `feat(formulario): analisis del trazo del pizarron`.

### Task 3: Análisis del contenido

**Files:**
- Create: `src/lib/landing/verification/content.ts`
- Test: `tests/landing/content-spam.test.ts`

**Interfaces:**
- Consumes: `DemoRequest` de `src/lib/landing/contactLinks.ts`
- Produces: `export function analyzeContent(demo: DemoRequest): string[]` — motivos legibles en español (`'texto sin sentido'`, `'liga en los datos'`, `'teléfono fuera de México/Norteamérica'`, `'escuela y cargo sin relación escolar'`); arreglo vacío = limpio.

- [ ] **Step 1: Write the failing tests:** `el envío del bot del 2026-11-24 es sospechoso` con `{ nombre: 'Kennethagide', escuela: 'Empresa', cargo: 'Telefonia', telefono: '88998196677', correo: 'ingeiiv7braun@mail.com', mensaje: 'Jfeuwgduwefhw fuhe-' }` → incluye `'texto sin sentido'` y `'teléfono fuera de México/Norteamérica'`; `una directora real está limpia` (`'Colegio Montessori del Valle'`, `'Directora académica'`, `'55 1234 5678'`, mensaje en español normal) → `[]`; `+52 55 1234 5678` y `+1 416 555 0199` limpios; `liga en el mensaje` → `'liga en los datos'`; nombres reales con pocas vocales (`'Xóchitl Hernández'`) limpios.
- [ ] **Step 2: Run** `npx vitest run tests/landing/content-spam.test.ts` — Expected: FAIL.
- [ ] **Step 3: Implement.** Sin lista de marcas (Regla 1). Teléfono: dígitos 10, o 12 empezando con 52, o 11 empezando con 1.
- [ ] **Step 4: Run** — Expected: PASS.
- [ ] **Step 5: Commit** `feat(formulario): deteccion de contenido sospechoso`.

### Task 4: `POST /api/demo` decide entregar, etiquetar o descartar

**Files:**
- Modify: `src/app/api/demo/route.ts`
- Modify: `src/lib/landing/demoForm.ts` (exportar `VERIFICATION_FIELD = 'verificacion'`)
- Test: `tests/landing/demoRoute.test.ts`

**Interfaces:**
- Consumes: `verifyChallenge`, `createChallenge` (Task 1), `analyzeTrace` (Task 2), `analyzeContent` (Task 3).
- Produces (para Task 5): cuerpo JSON `{ ...DemoRequest, sitio, verificacion: DemoChallenge & { number: number } & TraceInput }`; respuestas: 200 `{ ok: true }`; 400 `{ ok: false, error: 'verificacion' }` cuando falla el pase; 400 `{ ok: false }` datos inválidos; 403 origen; 429; 503; 502. `export const __resetKeyboardLimit` solo para pruebas.

Orden en la ruta: cuerpo urlencoded/multipart → **303** a `/?demo=sin-verificacion#contacto` (nada se envía) · campo trampa → 200 silencioso · origen (host de `Origin` vs `x-forwarded-host || host`; `Sec-Fetch-Site` presente y ≠ `same-origin` → 403) · límite por IP existente · datos (`parseDemoRequest`/`validateDemoRequest`) · pase (`verifyChallenge`) · trazo · límite de teclado (3/IP/hora, Map en memoria) · contenido · envío con o sin etiqueta.

- [ ] **Step 1: Write the failing tests** (mockear `nodemailer.createTransport` con `vi.mock` para capturar `sendMail`; `SMTP_*` con valores; helper que pide un pase a `createChallenge`, lo resuelve y arma un trazo humano reutilizando el generador de Task 2 extraído a `tests/landing/helpers/humanTrace.ts`):
  - `envío humano limpio se entrega con el asunto normal`
  - `sin verificación → 400 { error: 'verificacion' }` y `sendMail` no llamado
  - `trazo sintético → 200 y sendMail no llamado`
  - `trazo dudoso → asunto empieza con '[POSIBLE SPAM] ' y el cuerpo termina con 'Motivos de revisión:'`
  - `contenido del bot del 2026-11-24 con trazo humano → etiquetado`
  - `cuarto envío de teclado de la misma IP en una hora → 200 sin enviar`
  - `Origin de otro dominio → 403`; `Sec-Fetch-Site: same-site → 403`; `Origin igual a x-forwarded-host → pasa`
  - `formulario urlencoded → 303 con Location que termina en '/?demo=sin-verificacion#contacto'`
  - Ajustar los tres casos existentes a la nueva regla (el de 503 ahora necesita verificación válida; el de 400 se mantiene).
- [ ] **Step 2: Run** `npx vitest run tests/landing/demoRoute.test.ts` — Expected: FAIL.
- [ ] **Step 3: Implement** en `route.ts`; el etiquetado se arma en la ruta (no tocar `buildDemoSubject`).
- [ ] **Step 4: Run** `npx vitest run tests/landing` — Expected: PASS todo lo de landing.
- [ ] **Step 5: Commit** `feat(formulario): la solicitud exige el pizarron y etiqueta lo dudoso`.

### Task 5: Pizarrón en el formulario

**Files:**
- Create: `src/lib/landing/verification/solver.ts`
- Create: `src/components/landing/Pizarron.tsx`
- Modify: `src/components/landing/DemoForm.tsx`
- Modify: `src/components/landing/sections/Contact.tsx` (aviso para `?demo=sin-verificacion`, leído en cliente con `useSearchParams` o `window.location` sin volver dinámica la portada)
- Test: `tests/landing/landing.test.tsx`, `tests/landing/solver.test.ts`

**Interfaces:**
- Consumes: `DemoChallenge` (Task 1), `TracePoint`, `computeCoverage`, `COVERAGE_TARGET`, `MAX_TRACE_POINTS` (Task 2), cuerpo y respuestas de Task 4.
- Produces:
  - `export function solveChallenge(c: DemoChallenge, signal?: AbortSignal): Promise<number>` — Web Crypto, lotes de ~500 hashes cediendo con `setTimeout(0)`; rechaza si no encuentra hasta `max`.
  - `Pizarron` props: `{ onChange(state: { listo: boolean; mode: 'pointer' | 'keyboard'; radio: number; trazo: TracePoint[]; teclas: { t: number }[] }): void; resetKey: number; error?: string }`

Comportamiento: al montar `DemoForm`, `fetch('/api/demo/challenge')` y `solveChallenge` en segundo plano. `Pizarron` dibuja trazos de gis con semilla aleatoria en `<canvas>` con la paleta de la portada (`lp-navy` de fondo, gis blanco/`lp-sky`), borra con Pointer Events (`touch-action: none`, solo `isTrusted`), diezma por distancia, y al llegar a `COVERAGE_TARGET` muestra palomita + "¡Listo! Gracias." (animación desactivada con `prefers-reduced-motion`). Rótulo: "Para enviar, borra el pizarrón con el dedo o el mouse". Enfocable; Enter/Espacio borra con animación automática (`mode: 'keyboard'`, registra teclas). Debajo: "¿No puedes usar el pizarrón? Escríbenos a {email}". Enviar sin pizarrón listo → error "Borra el pizarrón para enviar." junto al pizarrón y foco en él. Si el envío responde `error: 'verificacion'` → pedir pase nuevo, reiniciar pizarrón (`resetKey`), mensaje "La verificación venció; borra el pizarrón otra vez.", sin borrar los datos escritos. Si el pase no se pudo obtener → estado `failed` existente (ofrece el correo). Tras éxito, ignorar envíos repetidos.

- [ ] **Step 1: Write the failing tests:** `solver.test.ts`: `encuentra el número de un pase de createChallenge` (entorno node con `globalThis.crypto`). `landing.test.tsx` (mockear `HTMLCanvasElement.prototype.getContext`, `fetch` para pase y envío): `no envía sin borrar el pizarrón y enfoca el pizarrón con el mensaje`; `con el pizarrón borrado (simular pointerdown/move/up que cubran la superficie) envía con 'verificacion' en el cuerpo`; `si el pase vence, reinicia el pizarrón y conserva los datos` (Review Focus 2); `el pizarrón tiene touch-action none` (Review Focus 3); `si /api/demo/challenge falla, ofrece el correo` (Review Focus 4); `después de enviado, un segundo clic no vuelve a llamar fetch` (Review Focus 5); `el pizarrón se completa con teclado`; ajustar los casos existentes de envío para que borren el pizarrón primero; `con ?demo=sin-verificacion la sección de contacto muestra el aviso con el correo`.
- [ ] **Step 2: Run** `npx vitest run tests/landing` — Expected: FAIL en los nuevos.
- [ ] **Step 3: Implement** solver, `Pizarron`, cambios en `DemoForm` y `Contact`. Seguir las reglas de la skill `emil-design-eng` para la animación de la palomita.
- [ ] **Step 4: Run** `npx vitest run tests/landing` y `npx tsc --noEmit -p .` — Expected: PASS y sin errores de tipos nuevos en los archivos tocados.
- [ ] **Step 5: Commit** `feat(formulario): minijuego 'Borra el pizarron' en la solicitud de demostracion`.
