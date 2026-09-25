/**
 * Registro y Fábrica de Estrategias Lingüísticas (Strategy Pattern)
 * ISkool - Motor Neural de Audio y Fonética Forense
 */

import { ILanguagePipeline, SupportedLocale, LanguageCode } from './types';
import { SpanishPipeline } from './pipelines/spanishPipeline';
import { EnglishPipeline } from './pipelines/englishPipeline';
import { FrenchPipeline } from './pipelines/frenchPipeline';

// Instancias cacheadas de cada pipeline (Stateless Strategy)
const pipelines: Record<SupportedLocale, ILanguagePipeline> = {
  'es-MX': new SpanishPipeline(),
  'en-US': new EnglishPipeline('en-US'),
  'en-GB': new EnglishPipeline('en-GB'),
  'fr-FR': new FrenchPipeline('fr-FR'),
  'fr-CA': new FrenchPipeline('fr-CA')
};

/**
 * Resuelve la canalización lingüística adecuada a partir de:
 * 1. Locale explícito ('es-MX', 'en-US', 'en-GB', 'fr-FR', 'fr-CA')
 * 2. Código de idioma ('es', 'en', 'fr')
 * 3. Prefijo del identificador de voz (ej: 'en-GB-RyanNeural' -> 'en-GB')
 */
export function getLanguagePipeline(indicator?: string): ILanguagePipeline {
  if (!indicator) {
    return pipelines['es-MX'];
  }

  const clean = indicator.trim();

  // 1. Coincidencia exacta de Locale
  if (clean in pipelines) {
    return pipelines[clean as SupportedLocale];
  }

  // 2. Coincidencia de prefijo de voz (ej: en-US-JennyNeural, en-GB-SoniaNeural, fr-FR-DeniseNeural, fr-CA-AntoineNeural)
  if (clean.startsWith('en-GB')) return pipelines['en-GB'];
  if (clean.startsWith('en-US')) return pipelines['en-US'];
  if (clean.startsWith('fr-CA')) return pipelines['fr-CA'];
  if (clean.startsWith('fr-FR') || clean.startsWith('fr-')) return pipelines['fr-FR'];
  if (clean.startsWith('es-')) return pipelines['es-MX'];

  // 3. Coincidencia por código de idioma base ('es', 'en', 'fr')
  const lower = clean.toLowerCase();
  if (lower === 'en' || lower.startsWith('en_')) return pipelines['en-US'];
  if (lower === 'fr' || lower.startsWith('fr_')) return pipelines['fr-FR'];
  if (lower === 'es' || lower.startsWith('es_')) return pipelines['es-MX'];

  // Fallback por defecto a la boveda lingüística en español mexicano
  return pipelines['es-MX'];
}

/**
 * Infiere el Locale soportado a partir de cualquier indicador
 */
export function resolveTargetLocale(indicator?: string): SupportedLocale {
  return getLanguagePipeline(indicator).locale;
}

/**
 * Obtiene las voces por defecto certificadas para un locale dado
 */
export function getDefaultVoicesForLocale(locale: SupportedLocale): { female: string; male: string } {
  return getLanguagePipeline(locale).getDefaultVoices();
}
