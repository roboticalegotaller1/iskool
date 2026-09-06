/**
 * Módulo de Validación de Datos Fiscales Oficiales del SAT (México)
 * Reglas de Validación CFDI 4.0 y Complemento IEDU V1.0
 */

import { TaxRegimeCode, CfdiUseCode } from '@/types';

export interface FiscalValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Expresión Regular Oficial del SAT para RFC (Personas Físicas y Morales)
 */
export const RFC_REGEX = /^([A-ZÑ&]{3,4}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2})([A\d])$/;

/**
 * Expresión Regular Oficial del RENAPO para CURP (18 caracteres)
 */
export const CURP_REGEX = /^[A-Z]{1}[AEIOU]{1}[A-Z]{2}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])[HM]{1}(AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]{1}[0-9]{1}$/;

/**
 * Expresión Regular para Código Postal Mexicano (5 dígitos numéricos)
 */
export const POSTAL_CODE_REGEX = /^[0-9]{5}$/;

/**
 * Valida un RFC contra las especificaciones del SAT
 */
export function validateRfc(rfc: string): { isValid: boolean; type?: 'moral' | 'fisica'; error?: string } {
  if (!rfc || typeof rfc !== 'string') {
    return { isValid: false, error: 'El RFC es requerido.' };
  }

  const cleanRfc = rfc.trim().toUpperCase();

  // RFC Genérico Nacional e Internacional
  if (cleanRfc === 'XAXX010101000' || cleanRfc === 'XEXX010101000') {
    return { isValid: true, type: 'fisica' };
  }

  if (cleanRfc.length !== 12 && cleanRfc.length !== 13) {
    return { isValid: false, error: 'El RFC debe contener 12 caracteres (Persona Moral) o 13 caracteres (Persona Física).' };
  }

  if (!RFC_REGEX.test(cleanRfc)) {
    return { isValid: false, error: 'El formato de RFC no es válido según los lineamientos del SAT.' };
  }

  return {
    isValid: true,
    type: cleanRfc.length === 12 ? 'moral' : 'fisica'
  };
}

/**
 * Valida una CURP contra la estructura oficial de RENAPO
 */
export function validateCurp(curp: string): { isValid: boolean; error?: string } {
  if (!curp || typeof curp !== 'string') {
    return { isValid: false, error: 'La CURP del alumno es requerida para el Complemento IEDU.' };
  }

  const cleanCurp = curp.trim().toUpperCase();

  if (cleanCurp.length !== 18) {
    return { isValid: false, error: 'La CURP debe contener exactamente 18 caracteres alfanuméricos.' };
  }

  if (!CURP_REGEX.test(cleanCurp)) {
    return { isValid: false, error: 'La estructura de la CURP no coincide con el formato oficial de RENAPO.' };
  }

  return { isValid: true };
}

/**
 * Matriz de compatibilidad entre Régimen Fiscal y Uso de CFDI (Catálogo SAT CFDI 4.0)
 */
export const COMPATIBLE_REGIMES_FOR_D10: TaxRegimeCode[] = [
  '605', // Sueldos y Salarios
  '606', // Arrendamiento
  '608', // Demás ingresos
  '612', // Personas Físicas con Actividades Empresariales y Profesionales
  '625', // Plataformas Tecnológicas
  '626'  // RESICO (Persona Física)
];

/**
 * Valida si un Régimen Fiscal es compatible con el Uso de CFDI solicitado (ej. D10 Colegiaturas)
 */
export function isRegimeCompatibleWithUse(regime: string, cfdiUse: string): boolean {
  if (cfdiUse === 'D10') {
    return COMPATIBLE_REGIMES_FOR_D10.includes(regime as TaxRegimeCode);
  }
  if (cfdiUse === 'S01' || cfdiUse === 'CP01') {
    return true; // Compatible con todos los regímenes
  }
  return true;
}

/**
 * Validador integral de Perfil Fiscal para Facturación SAT
 */
export function validateFiscalProfileData(data: {
  rfc: string;
  taxName: string;
  taxRegime: string;
  postalCode: string;
  cfdiUse: string;
}): FiscalValidationResult {
  const errors: string[] = [];

  const rfcVal = validateRfc(data.rfc);
  if (!rfcVal.isValid) {
    errors.push(rfcVal.error || 'RFC inválido.');
  }

  if (!data.taxName || data.taxName.trim().length < 3) {
    errors.push('La Razón Social o Nombre Fiscal debe tener al menos 3 caracteres y coincidir con la Constancia de Situación Fiscal (en mayúsculas, sin régimen societario).');
  }

  if (!data.postalCode || !POSTAL_CODE_REGEX.test(data.postalCode.trim())) {
    errors.push('El Código Postal fiscal debe ser un número válido de 5 dígitos.');
  }

  if (!data.taxRegime) {
    errors.push('Debe seleccionar un Régimen Fiscal del SAT.');
  }

  if (!data.cfdiUse) {
    errors.push('Debe seleccionar el Uso de CFDI.');
  } else if (!isRegimeCompatibleWithUse(data.taxRegime, data.cfdiUse)) {
    errors.push(`El Uso de CFDI '${data.cfdiUse}' (Colegiaturas) no es compatible con el Régimen Fiscal '${data.taxRegime}'. Para deducciones personales de colegiatura se requiere régimen de Persona Física (ej. 605 Sueldos, 612 Empresarial, 626 RESICO).`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
