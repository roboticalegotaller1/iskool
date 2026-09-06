/**
 * Tipos y modelos de datos para las Sugerencias Pedagógicas y Recursos Curriculares
 */

export interface PedagogicalVideo {
  id: string;
  url: string;
  title: string;
  channelName: string;
  channelVerified: boolean;
  durationApprox: string;
  likeRatioPercent: number; // Porcentaje de aprobación (cuidando sin votos negativos, >97%)
  description: string;
  thumbnailBadge?: string;
  suggestedMoment: 'inicio' | 'desarrollo' | 'cierre' | 'profundizacion';
  targetLevel?: 'preescolar' | 'primaria-baja' | 'primaria-media' | 'primaria-alta' | 'secundaria' | 'preparatoria' | 'todos';
  targetAgeRange?: string; // ej. "3 a 5 años", "6 a 8 años", "10 a 12 años"
}

export interface PedagogicalWebPortal {
  id: string;
  url: string;
  siteName: string;
  organization: string; // ej. INAH, SEP, CNDH, Red Escolar ILCE
  summary: string;
  badgeLabel?: string;
  category: 'portal_oficial' | 'museo_virtual' | 'simulador' | 'hemeroteca';
}

export interface ResearchSource {
  id: string;
  title: string;
  authorsOrEntity: string; // ej. Instituto de Investigaciones Históricas UNAM / El Colegio de México / SEP
  yearOrEdition: string;
  sourceType: 'libro_sep' | 'articulo_academico' | 'archivo_historico' | 'ensayo_divulgacion';
  description: string;
  directUrl?: string;
  citationReference: string;
}

export interface PlanningPedagogicalSuggestions {
  topic: string;
  campoFormativo: string;
  videos: PedagogicalVideo[];        // Exactamente 5 videos curados con aprobación pedagógica
  webPortal: PedagogicalWebPortal;    // Al menos 1 portal especializado
  researchSources: ResearchSource[];  // Al menos 3 fuentes académicas de investigación
}

export interface BrokenLinkReport {
  url: string;
  resourceTitle: string;
  resourceType: 'video' | 'portal' | 'fuente';
  reportedAt: string;
  reportedByTeacherId?: string;
  reportedByTeacherName?: string;
  reason?: string;
}
