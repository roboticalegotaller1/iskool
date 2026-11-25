import type { DemoRequest } from '../contactLinks'

// Análisis del contenido de una solicitud de demostración.
// Solo ETIQUETA: devuelve motivos legibles; nunca decide descartar un envío.
// Se prefiere dejar pasar algo dudoso antes que marcar a personal escolar real.

export const MOTIVO_SIN_SENTIDO = 'texto sin sentido'
export const MOTIVO_LIGA = 'liga en los datos'
export const MOTIVO_TELEFONO = 'teléfono fuera de México/Norteamérica'
export const MOTIVO_SIN_RELACION = 'escuela y cargo sin relación escolar'

// Minúsculas y sin acentos (ñ pasa a n): las comparaciones no dependen de la ortografía.
function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

const VOCALES = new Set(['a', 'e', 'i', 'o', 'u'])

// Una palabra parece tecleo al azar si cumple alguna señal. Los umbrales dejan
// pasar nombres reales con pocas vocales u origen náhuatl (Xóchitl, Cuauhtémoc,
// Nezahualcóyotl) y apellidos extranjeros comunes (Christopher, Schmidt).
function palabraSinSentido(palabra: string): boolean {
  const p = normalizar(palabra).replace(/[^a-z]/g, '')
  if (p.length < 5) return false

  // Siglas cortas en mayúsculas (CBTIS, CECYT) son legítimas.
  const letras = palabra.replace(/[^\p{L}]/gu, '')
  if (letras.length <= 6 && letras === letras.toUpperCase()) return false

  // Misma letra repetida 5 o más veces seguidas.
  if (/(.)\1{4,}/.test(p)) return true

  // La 'y' y la 'w' se tratan como consonantes.
  const rachas = p.match(/[^aeiou]+/g) ?? []
  // Racha larga de consonantes (el español real casi no pasa de 4).
  if (rachas.some((r) => r.length >= 5)) return true
  // Dos o más rachas de 3+ consonantes en una misma palabra.
  if (rachas.filter((r) => r.length >= 3).length >= 2) return true

  // Palabras largas con muy pocas vocales.
  const vocales = [...p].filter((c) => VOCALES.has(c)).length
  return p.length >= 9 && vocales / p.length < 0.25
}

function textoSinSentido(texto: string): boolean {
  const palabras = texto.split(/\s+/).filter((w) => /\p{L}/u.test(w))
  if (palabras.length === 0) return false
  const raras = palabras.filter(palabraSinSentido).length
  if (raras === 0) return false
  // Una sola palabra rara en un texto largo (un apellido inusual) no basta.
  return raras >= 2 || raras / palabras.length >= 0.4
}

const PATRON_LIGA =
  /https?:|www\.|\b[a-z0-9-]+\.(?:com|net|org|info|biz|xyz|top|link|click|ru|cn|io|ly)\b/i

// Teléfono: 10 dígitos (México/Norteamérica), 12 con 52, 13 con 521 (formato
// móvil antiguo de México) u 11 con 1. Un campo vacío no se marca.
function telefonoFueraDeRegion(telefono: string): boolean {
  const d = telefono.replace(/\D/g, '')
  if (d.length === 0) return false
  if (d.length === 10) return false
  if (d.length === 12 && d.startsWith('52')) return false
  if (d.length === 13 && d.startsWith('521')) return false
  if (d.length === 11 && d.startsWith('1')) return false
  return true
}

// Raíces escolares y de puesto (sin acentos). Sin marcas comerciales.
const RAICES_ESCOLARES = [
  'escuela', 'escolar', 'colegio', 'instituto', 'instituci', 'primaria', 'secundaria',
  'preparatoria', 'prepa', 'bachiller', 'kinder', 'jardin', 'preescolar', 'maternal',
  'universidad', 'academia', 'educativ', 'educacion', 'plantel', 'liceo', 'montessori',
  'telesecundaria', 'conalep', 'cbtis', 'cecyt', 'tecnologico', 'politecnico', 'normal',
  'guarderia', 'estancia', 'centro',
  'director', 'directiv', 'coordinador', 'maestr', 'profesor', 'docente', 'rector',
  'supervisor', 'prefect', 'orientador', 'administra', 'secretari', 'propietari',
  'dueno', 'fundador', 'gerente', 'representante', 'titular', 'encargad', 'jefe',
  'subdirec', 'tesorer', 'pedagog', 'psicolog', 'asesor', 'cargo',
]

function esRelacionEscolar(texto: string): boolean {
  const t = normalizar(texto)
  return RAICES_ESCOLARES.some((r) => t.includes(r))
}

function palabrasDe(texto: string): string[] {
  return texto.split(/\s+/).filter((w) => /\p{L}/u.test(w))
}

export function analyzeContent(demo: DemoRequest): string[] {
  const motivos: string[] = []

  const campos = [demo.nombre, demo.escuela, demo.cargo, demo.mensaje]
  if (campos.some((c) => textoSinSentido(c))) motivos.push(MOTIVO_SIN_SENTIDO)

  if ([...campos, demo.telefono].some((c) => PATRON_LIGA.test(c))) motivos.push(MOTIVO_LIGA)

  if (telefonoFueraDeRegion(demo.telefono)) motivos.push(MOTIVO_TELEFONO)

  const escuela = palabrasDe(demo.escuela)
  const cargo = palabrasDe(demo.cargo)
  if (
    escuela.length === 1 &&
    cargo.length === 1 &&
    !esRelacionEscolar(demo.escuela) &&
    !esRelacionEscolar(demo.cargo)
  ) {
    motivos.push(MOTIVO_SIN_RELACION)
  }

  return motivos
}
