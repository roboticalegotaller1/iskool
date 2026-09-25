/**
 * Definiciones y Contratos de Tipos para la Arquitectura Multilingüe de Síntesis de Voz
 * ISkool - Motor Neural de Audio y Fonética Forense
 */

export type SupportedLocale = 'es-MX' | 'en-US' | 'en-GB' | 'fr-FR' | 'fr-CA';

export type LanguageCode = 'es' | 'en' | 'fr';

export type OratoricalIntention = 'arenga' | 'philosophical' | 'rhetorical' | 'solemn_narrative';

export interface SSMLParams {
  voice: string;
  text: string;
  rate?: string;
  pitch?: string;
  style?: string;
  styleDegree?: number;
  locale?: SupportedLocale;
  language?: LanguageCode;
  intention?: OratoricalIntention;
}

export interface VoicePair {
  female: string;
  male: string;
}

export interface ExpressiveStyleConfig {
  style?: string;
  styleDegree: number;
  rate?: string;
  pitch?: string;
}

/**
 * Contrato del Patrón Strategy para Canalizaciones Lingüísticas de ISkool
 */
export interface ILanguagePipeline {
  readonly locale: SupportedLocale;
  readonly language: LanguageCode;
  
  /** Normaliza números, años, fechas compuestas, siglos, dinastías reales y abreviaturas */
  normalizeText(text: string): string;
  
  /** Aplica el diccionario fonético y sustituciones ortofónicas para nombres históricos */
  applyPhonetics(text: string, format?: 'ssml' | 'plain'): string;
  
  /** Analiza sintagmas e inyecta micro-pausas prosódicas naturales preservando enlaces acústicos */
  analyzeSyntagmas(text: string): string;
  
  /** Construye el SSML completo con namespaces, prosodia y estilos expresivos */
  buildSSML(params: SSMLParams): string;
  
  /** Retorna las voces por defecto para el locale */
  getDefaultVoices(): VoicePair;
  
  /** Obtiene la configuración de estilo expresivo según la intención oratoria */
  getExpressiveStyle(intention: OratoricalIntention, gender?: 'female' | 'male'): ExpressiveStyleConfig;
}
