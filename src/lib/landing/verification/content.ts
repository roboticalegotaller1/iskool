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

  // La 'y' cuenta como vocal salvo al inicio de palabra (Brynn); la 'w' es consonante.
  const q = p.replace(/(?<!^)y/g, 'a')
  const rachas = q.match(/[^aeiou]+/g) ?? []
  // Racha muy larga de consonantes (el español real casi no pasa de 4 y los
  // apellidos alemanes comunes llegan a 6, como en Kirchstrasse).
  if (rachas.some((r) => r.length >= 7)) return true
  // Dos o más rachas de 3+ consonantes en una misma palabra.
  if (rachas.filter((r) => r.length >= 3).length >= 2) return true

  // Palabras largas con muy pocas vocales.
  const vocales = [...q].filter((c) => VOCALES.has(c)).length
  return p.length >= 9 && vocales / p.length < 0.25
}

function textoSinSentido(texto: string): boolean {
  const palabras = palabrasDe(texto)
  if (palabras.length === 0) return false
  const raras = palabras.filter(palabraSinSentido).length
  if (raras === 0) return false
  // Una sola palabra rara en un texto largo (un apellido inusual) no basta.
  return raras >= 2 || raras / palabras.length >= 0.4
}

// La etiqueta del dominio está acotada (máx. 63) para evitar retroceso cuadrático.
const PATRON_LIGA =
  /https?:|www\.|\b[a-z0-9-]{1,63}\.(?:com|net|org|info|biz|xyz|top|link|click|ru|cn|io|ly)\b/i

// Teléfono: se juzga solo el primer número (antes de "/", ",", ";", "o" o
// "ext"). Válido con 10 dígitos (México/Norteamérica), con prefijos antiguos
// 044/045/01 delante de 10, 12 con 52, 13 con 521 u 11 con 1. Vacío no se marca.
function telefonoFueraDeRegion(telefono: string): boolean {
  const primero = telefono.split(/[/,;]|\bext|\bx\b|\bo\b/i)[0]
  const d = primero.replace(/\D/g, '')
  if (d.length === 0) return false
  if (d.length === 10) return false
  if (d.length === 13 && (d.startsWith('044') || d.startsWith('045'))) return false
  if (d.length === 12 && d.startsWith('01')) return false
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
  'subdirec', 'tesorer', 'pedagog', 'psicolog', 'asesor', 'cargo', 'contad', 'conserje', 'intendent', 'auxiliar',
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

  // Se acota cada campo antes de analizarlo (entradas enormes no cuestan más).
  demo = {
    ...demo,
    nombre: demo.nombre.slice(0, 500),
    escuela: demo.escuela.slice(0, 500),
    cargo: demo.cargo.slice(0, 500),
    telefono: demo.telefono.slice(0, 500),
    mensaje: demo.mensaje.slice(0, 4000),
  }
  const campos = [demo.nombre, demo.escuela, demo.cargo, demo.mensaje]
  if (campos.some((c) => textoSinSentido(c))) motivos.push(MOTIVO_SIN_SENTIDO)

  // Los correos escritos en el texto no son ligas.
  if ([...campos, demo.telefono].some((c) => PATRON_LIGA.test(c.replace(/\S+@\S+/g, ' ')))) motivos.push(MOTIVO_LIGA)

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
