// Anclas de la página: el encabezado las enlaza y cada sección las usa como id y título.
export const ANCHORS = {
  features: { id: 'que-hace', label: 'Qué hace' },
  how: { id: 'como-funciona', label: 'Cómo funciona' },
  roles: { id: 'para-quien', label: 'Para quién' },
  benefits: { id: 'beneficios', label: 'Beneficios' },
  contact: { id: 'contacto' },
} as const

export const NAV_ANCHORS = [ANCHORS.features, ANCHORS.how, ANCHORS.roles, ANCHORS.benefits] as const
