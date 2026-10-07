"use client";

import React from 'react';
import { IbimeOfficialLogo } from './IbimeOfficialLogo';
import { CorporateOfficialLogo } from './CorporateOfficialLogo';

export interface SchoolOfficialLogoProps {
  schoolId?: string;
  name?: string;
  logoUrl?: string;
  themeColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  variant?: 'shield_only' | 'emblem_only' | 'horizontal' | 'full';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
}

/**
 * Logotipos Oficiales Vectoriales para Colegios e Instituciones ISkool.
 * Proporciona identidad visual heráldica y oficial de alta fidelidad para:
 * 1. Instituto Bilingüe IBIME (sch-ibime)
 * 2. Laboratorio Pedagógico & Test Cases (sch-test-case)
 * 3. UP Juan Jacobo Rosseau (sch-jjrosseau)
 * 4. Colegio Montessori del Valle (sch-montessori)
 * 5. Profesores Independientes (sch-profesores-independientes)
 * 6. Empresas Corporativas (BMW, Retail, Tech)
 * 7. Colegios Nuevos / Dinámicos (Generador Heráldico Soberano con Monograma)
 */
export const SchoolOfficialLogo: React.FC<SchoolOfficialLogoProps> = ({
  schoolId = '',
  name = '',
  logoUrl = '',
  themeColors,
  variant = 'shield_only',
  size = 'md',
  className = ''
}) => {
  const sId = (schoolId || '').toLowerCase();
  const sName = (name || '').toLowerCase();

  const isNumberSize = typeof size === 'number';
  const pixelDim = isNumberSize
    ? size
    : {
        xs: 24,
        sm: 32,
        md: 44,
        lg: 56,
        xl: 72
      }[size] || 44;

  // 1. Delegar a empresas corporativas si corresponde
  const isCorporate = sId.startsWith('emp-') || sId === 'sec-empresas-ceo' || /bmw|nexus|retail|vanguardia|innovasoft/i.test(sName);
  if (isCorporate) {
    return (
      <CorporateOfficialLogo
        enterpriseId={sId}
        name={name}
        size={pixelDim}
        variant={variant === 'horizontal' ? 'horizontal' : 'emblem_only'}
        className={className}
      />
    );
  }

  // 2. IBIME (Única y exclusivamente si el ID o nombre es de IBIME)
  const isIbime = sId === 'sch-ibime' || sName.includes('ibime');
  if (isIbime) {
    return (
      <IbimeOfficialLogo
        variant={variant === 'horizontal' ? 'horizontal' : 'shield_only'}
        size={pixelDim}
        showText={variant === 'horizontal'}
        className={className}
      />
    );
  }

  // 3. Si hay un logoUrl personalizado configurado y no es el de IBIME
  if (logoUrl && !logoUrl.includes('ibime') && !isIbime) {
    return (
      <img
        src={logoUrl}
        alt={name || 'Logotipo Institucional'}
        width={pixelDim}
        height={pixelDim}
        className={`object-contain select-none ${className}`}
        style={{ width: `${pixelDim}px`, height: `${pixelDim}px` }}
      />
    );
  }

  // 4. Laboratorio Pedagógico & Test Cases (sch-test-case)
  const isTestCase = sId === 'sch-test-case' || sName.includes('laboratorio') || sName.includes('test case') || sName.includes('sandbox');
  if (isTestCase) {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <svg
          width={pixelDim}
          height={pixelDim}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="select-none drop-shadow-md"
        >
          <defs>
            <linearGradient id="labGrad1" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#4F46E5" />
            </linearGradient>
            <linearGradient id="labLiquid" x1="30" y1="50" x2="70" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
            <filter id="labGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#6366F1" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Blasón del Laboratorio Pedagógico */}
          <path
            d="M50 8 L18 20 C18 42 18 64 30 78 C40 89 48 92 50 93 C52 92 60 89 70 78 C82 64 82 42 82 20 L50 8 Z"
            fill="url(#labGrad1)"
            stroke="#A5B4FC"
            strokeWidth="1.5"
          />

          {/* Faceta sombra lateral derecha */}
          <path
            d="M50 8 L82 20 C82 42 82 64 70 78 C60 89 52 92 50 93 L50 8 Z"
            fill="#312E81"
            fillOpacity="0.35"
          />

          {/* Matraz de Laboratorio Pedagógico y Experimentación */}
          {/* Cuello del matraz */}
          <rect x="46" y="30" width="8" height="12" rx="1" fill="#FFFFFF" fillOpacity="0.9" />
          <rect x="44" y="28" width="12" height="3" rx="1.5" fill="#FFFFFF" />

          {/* Cuerpo cónico del matraz */}
          <path
            d="M46 41 L34 65 C32 69 35 73 40 73 L60 73 C65 73 68 69 66 65 L54 41 Z"
            fill="#FFFFFF"
            fillOpacity="0.95"
          />

          {/* Líquido de síntesis cognitiva y tokens */}
          <path
            d="M38 61 C42 59 47 63 52 61 C57 59 61 62 62 61 L64 65 C65.5 68 63 71 59 71 L41 71 C37 71 34.5 68 36 65 Z"
            fill="url(#labLiquid)"
          />

          {/* Burbujas cuánticas / tokens de aprendizaje */}
          <circle cx="44" cy="54" r="2" fill="#06B6D4" />
          <circle cx="53" cy="51" r="2.5" fill="#38BDF8" />
          <circle cx="48" cy="44" r="1.5" fill="#E0F2FE" />

          {/* Chispas de inteligencia pedagógica (estrellas) */}
          <path d="M50 18 L51.5 22 L55.5 23.5 L51.5 25 L50 29 L48.5 25 L44.5 23.5 L48.5 22 Z" fill="#FDE047" />
          <circle cx="68" cy="36" r="1.8" fill="#FDE047" />
          <circle cx="32" cy="38" r="1.5" fill="#FDE047" />
        </svg>
      </div>
    );
  }

  // 5. UP Juan Jacobo Rosseau (sch-jjrosseau)
  const isRosseau = sId === 'sch-jjrosseau' || sName.includes('rosseau') || sName.includes('rousseau') || sName.includes('jacobo');
  if (isRosseau) {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <svg
          width={pixelDim}
          height={pixelDim}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="select-none drop-shadow-md"
        >
          <defs>
            <linearGradient id="jjrGrad" x1="15" y1="10" x2="85" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1E3A8A" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
            <linearGradient id="jjrGold" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FCD34D" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>

          {/* Blasón Académico Azul Marino & Oro */}
          <path
            d="M50 10 L16 22 C16 46 16 66 30 80 C40 90 48 92 50 93 C52 90 60 90 70 80 C84 66 84 46 84 22 L50 10 Z"
            fill="url(#jjrGrad)"
            stroke="url(#jjrGold)"
            strokeWidth="2"
          />

          {/* Corona de Laureles Clásica de Rosseau */}
          {/* Laurel Izquierdo */}
          <path d="M30 45 C28 55 35 68 46 75" stroke="url(#jjrGold)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M26 40 Q32 40 30 46 Q28 42 26 40 Z" fill="url(#jjrGold)" />
          <path d="M26 50 Q33 49 32 55 Q29 52 26 50 Z" fill="url(#jjrGold)" />
          <path d="M30 60 Q37 59 36 65 Q33 63 30 60 Z" fill="url(#jjrGold)" />
          <path d="M38 68 Q44 66 43 72 Q40 70 38 68 Z" fill="url(#jjrGold)" />

          {/* Laurel Derecho */}
          <path d="M70 45 C72 55 65 68 54 75" stroke="url(#jjrGold)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M74 40 Q68 40 70 46 Q72 42 74 40 Z" fill="url(#jjrGold)" />
          <path d="M74 50 Q67 49 68 55 Q71 52 74 50 Z" fill="url(#jjrGold)" />
          <path d="M70 60 Q63 59 64 65 Q67 63 70 60 Z" fill="url(#jjrGold)" />
          <path d="M62 68 Q56 66 57 72 Q60 70 62 68 Z" fill="url(#jjrGold)" />

          {/* Antorcha de la Ilustración (Lumières) y Saber */}
          <path d="M48 42 L52 42 L51 60 L49 60 Z" fill="url(#jjrGold)" />
          <path d="M46 41 L54 41 L53 38 L47 38 Z" fill="#FCD34D" />
          {/* Llama encendida */}
          <path d="M50 25 C47 30 46 34 50 37 C54 34 53 30 50 25 Z" fill="#EF4444" />
          <path d="M50 28 C48 31 48 34 50 36 C52 34 52 31 50 28 Z" fill="#FBBF24" />

          {/* Monograma JJR en el centro */}
          <text
            x="50"
            y="54"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="10"
            fontWeight="900"
            fontFamily="serif"
            letterSpacing="1"
          >
            JJR
          </text>
        </svg>
      </div>
    );
  }

  // 6. Colegio Montessori del Valle (sch-montessori)
  const isMontessori = sId === 'sch-montessori' || sName.includes('montessori');
  if (isMontessori) {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <svg
          width={pixelDim}
          height={pixelDim}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="select-none drop-shadow-md"
        >
          <defs>
            <linearGradient id="monGrad" x1="15" y1="10" x2="85" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#047857" />
              <stop offset="100%" stopColor="#064E3B" />
            </linearGradient>
            <linearGradient id="monSun" x1="30" y1="15" x2="70" y2="55" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>

          {/* Blasón Verde Bosque Orgánico */}
          <path
            d="M50 10 L18 20 C18 44 18 64 30 78 C40 88 48 91 50 92 C52 91 60 88 70 78 C82 64 82 44 82 20 L50 10 Z"
            fill="url(#monGrad)"
            stroke="#6EE7B7"
            strokeWidth="1.5"
          />

          {/* Sol Naciente del Potencial Humano */}
          <circle cx="50" cy="38" r="14" fill="url(#monSun)" />

          {/* Rayos del Sol */}
          <path d="M50 18 L50 22 M50 54 L50 58 M30 38 L34 38 M66 38 L70 38" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" />
          <path d="M36 24 L39 27 M61 49 L64 52 M36 52 L39 49 M61 27 L64 24" stroke="#FDE68A" strokeWidth="1.5" strokeLinecap="round" />

          {/* Árbol del Crecimiento / Hojas Vivas */}
          <path
            d="M50 48 Q44 56 36 64 C42 66 48 64 50 58 C52 64 58 66 64 64 Q56 56 50 48 Z"
            fill="#FFFFFF"
          />
          <path
            d="M50 36 Q46 43 40 48 C45 49 49 48 50 44 C51 48 55 49 60 48 Q54 43 50 36 Z"
            fill="#A7F3D0"
          />

          {/* Manos Protectoras en la Base */}
          <path
            d="M32 72 Q42 78 50 78 Q58 78 68 72 C63 76 56 80 50 80 C44 80 37 76 32 72 Z"
            fill="#FDE68A"
          />
        </svg>
      </div>
    );
  }

  // 7. Red de Profesores Independientes (sch-profesores-independientes)
  const isIndependent = sId === 'sch-profesores-independientes' || sName.includes('independiente') || sName.includes('docentes');
  if (isIndependent) {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <svg
          width={pixelDim}
          height={pixelDim}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="select-none drop-shadow-md"
        >
          <defs>
            <linearGradient id="indGrad" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0D9488" />
              <stop offset="100%" stopColor="#115E59" />
            </linearGradient>
          </defs>
          <path
            d="M50 10 L18 22 C18 45 18 65 30 79 C40 89 48 91 50 92 C52 91 60 89 70 79 C82 65 82 45 82 22 L50 10 Z"
            fill="url(#indGrad)"
            stroke="#5EEAD4"
            strokeWidth="1.5"
          />
          {/* Pluma de Escritor y Compás Académico */}
          <path d="M42 66 L58 34 L62 38 L46 70 L40 72 Z" fill="#F1F5F9" />
          <path d="M58 34 L62 38 L65 35 C66 34 66 32 65 31 L61 27 C60 26 58 26 57 27 Z" fill="#F59E0B" />
          <path d="M40 72 L43 68 L41 66 Z" fill="#0F172A" />
          <circle cx="50" cy="50" r="3" fill="#F59E0B" />
        </svg>
      </div>
    );
  }

  // 8. Para cualquier otro colegio creado o dinámico (Generador de Blasón Heráldico Personalizado)
  const initialLetters = (name || 'Colegio')
    .split(' ')
    .filter(w => !['de', 'del', 'la', 'los', 'las', 'el', 'y', 'en', 'para', 'colegio', 'instituto', 'escuela'].includes(w.toLowerCase()))
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase())
    .join('') || 'SC';

  const primaryCol = themeColors?.primary ? `hsl(${themeColors.primary})` : '#3B82F6';
  const secondaryCol = themeColors?.secondary ? `hsl(${themeColors.secondary})` : '#1D4ED8';

  return (
    <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
      <svg
        width={pixelDim}
        height={pixelDim}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="select-none drop-shadow-md"
      >
        <defs>
          <linearGradient id={`dynGrad-${initialLetters}`} x1="15" y1="10" x2="85" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={primaryCol} />
            <stop offset="100%" stopColor={secondaryCol} />
          </linearGradient>
        </defs>

        {/* Blasón Heráldico Proporcional */}
        <path
          d="M50 10 L18 20 C18 44 18 64 30 78 C40 88 48 91 50 92 C52 91 60 88 70 78 C82 64 82 44 82 20 L50 10 Z"
          fill={`url(#dynGrad-${initialLetters})`}
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeOpacity="0.8"
        />

        {/* Faceta sombreada 3D */}
        <path
          d="M50 10 L82 20 C82 44 82 64 70 78 C60 88 52 91 50 92 L50 10 Z"
          fill="#000000"
          fillOpacity="0.25"
        />

        {/* Corona de Estrellas de Excelencia */}
        <circle cx="50" cy="24" r="2.5" fill="#FDE047" />
        <circle cx="41" cy="27" r="2" fill="#FDE047" />
        <circle cx="59" cy="27" r="2" fill="#FDE047" />

        {/* Monograma Oficial del Colegio */}
        <text
          x="50"
          y="58"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="20"
          fontWeight="900"
          fontFamily="sans-serif"
          letterSpacing="1"
          className="select-none"
        >
          {initialLetters}
        </text>

        {/* Línea de Base Decorativa */}
        <path d="M34 68 Q50 74 66 68" stroke="#FDE047" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
};
