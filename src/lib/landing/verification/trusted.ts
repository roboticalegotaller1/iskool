// El pizarrón solo cuenta lo que hizo una persona: los eventos fabricados por un
// script llegan con isTrusted en falso. Vive aparte para que las pruebas lo sustituyan.
export function esEventoConfiable(evento: Event): boolean {
  return evento.isTrusted === true
}
