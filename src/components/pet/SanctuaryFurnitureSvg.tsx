"use client";

import React from 'react';

interface SanctuaryFurnitureSvgProps {
  itemId: string;
  className?: string;
  isInteracting?: boolean;
}

export const SanctuaryFurnitureSvg: React.FC<SanctuaryFurnitureSvgProps> = ({
  itemId,
  className = 'w-full h-full',
  isInteracting = false
}) => {
  switch (itemId) {
    // ==========================================
    // LAS 10 CAMAS PROGRESIVAS
    // ==========================================

    // 1. Colchón de Paja Básica
    case 'bed_straw':
      return (
        <svg viewBox="0 0 100 70" className={className}>
          <ellipse cx="50" cy="55" rx="42" ry="12" fill="#291a10" opacity="0.4" />
          <path d="M12,45 C15,35 85,35 88,45 C90,55 10,55 12,45 Z" fill="#D97706" />
          {/* Paja entrecruzada */}
          <path d="M16,42 Q30,36 45,43 Q60,35 84,43" stroke="#FBBF24" strokeWidth="2.5" fill="none" strokeDasharray="4 2" />
          <path d="M18,48 Q40,40 60,49 Q75,41 82,47" stroke="#FDE68A" strokeWidth="2" fill="none" />
          {/* Manta humilde de retazos */}
          <rect x="35" y="38" width="30" height="16" rx="4" fill="#3B82F6" transform="rotate(-4 50 46)" />
          <path d="M38,40 L62,40" stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="3 2" />
        </svg>
      );

    // 2. Cojín de Lana Acogedora
    case 'bed_wool':
      return (
        <svg viewBox="0 0 100 70" className={className}>
          <ellipse cx="50" cy="56" rx="44" ry="11" fill="#1e293b" opacity="0.35" />
          {/* Base acolchada con pompones */}
          <ellipse cx="50" cy="46" rx="40" ry="16" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2" />
          <ellipse cx="50" cy="44" rx="34" ry="12" fill="#E2E8F0" />
          <ellipse cx="50" cy="42" rx="26" ry="9" fill="#CBD5E1" opacity="0.6" />
          {/* Ribete azul cielo acolchado */}
          <path d="M16,46 Q50,56 84,46" stroke="#38BDF8" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="20" cy="45" r="3.5" fill="#38BDF8" />
          <circle cx="80" cy="45" r="3.5" fill="#38BDF8" />
        </svg>
      );

    // 3. Nido Rústico de Roble
    case 'bed_rustic_oak':
      return (
        <svg viewBox="0 0 100 70" className={className}>
          <ellipse cx="50" cy="56" rx="45" ry="12" fill="#1c1917" opacity="0.4" />
          {/* Canasta de madera entrelazada */}
          <path d="M10,40 C10,58 90,58 90,40 C90,32 10,32 10,40 Z" fill="#78350F" stroke="#451A03" strokeWidth="2.5" />
          {/* Texturas de corteza de pino */}
          <path d="M16,38 C28,48 72,48 84,38" stroke="#92400E" strokeWidth="2" fill="none" />
          <path d="M22,46 C35,52 65,52 78,46" stroke="#B45309" strokeWidth="1.5" fill="none" />
          {/* Colchoncito interior de musgo y plumón */}
          <ellipse cx="50" cy="40" rx="34" ry="10" fill="#059669" />
          <ellipse cx="50" cy="38" rx="28" ry="7" fill="#10B981" />
        </svg>
      );

    // 4. Cama Nube Esponjosa
    case 'bed_cloud':
      return (
        <svg viewBox="0 0 100 70" className={className}>
          <ellipse cx="50" cy="58" rx="44" ry="10" fill="#0284c7" opacity="0.25" />
          {/* Nubes compuestas esponjadas */}
          <g filter="drop-shadow(0 4px 6px rgba(14, 165, 233, 0.2))">
            <circle cx="28" cy="44" r="16" fill="#BAE6FD" />
            <circle cx="72" cy="44" r="16" fill="#BAE6FD" />
            <circle cx="42" cy="36" r="18" fill="#F0F9FF" />
            <circle cx="58" cy="36" r="18" fill="#F0F9FF" />
            <ellipse cx="50" cy="46" rx="36" ry="14" fill="#FFFFFF" />
          </g>
          {/* Estrellitas mágicas decorativas */}
          <path d="M30,34 L32,38 L36,39 L33,42 L34,46 L30,43 L26,46 L27,42 L24,39 L28,38 Z" fill="#FDE047" transform="scale(0.5) translate(20, 20)" />
          <path d="M70,32 L72,36 L76,37 L73,40 L74,44 L70,41 L66,44 L67,40 L64,37 L68,36 Z" fill="#FDE047" transform="scale(0.5) translate(70, 16)" />
        </svg>
      );

    // 5. Cuna de Levitación Magnética
    case 'bed_mag_lev':
      return (
        <svg viewBox="0 0 100 70" className={className}>
          {/* Base emisora electromagnética en el suelo */}
          <ellipse cx="50" cy="60" rx="36" ry="8" fill="#0F172A" stroke="#06B6D4" strokeWidth="2" />
          <ellipse cx="50" cy="60" rx="24" ry="5" fill="#06B6D4" opacity="0.4" />
          {/* Anillos de luz ascendente / Rayo de levitación */}
          <ellipse cx="50" cy="52" rx="30" ry="6" stroke="#22D3EE" strokeWidth="1" fill="none" opacity="0.6" strokeDasharray="3 3" />
          <ellipse cx="50" cy="46" rx="34" ry="7" stroke="#38BDF8" strokeWidth="1.5" fill="none" opacity="0.8" />
          {/* Cápsula flotante */}
          <g className={isInteracting ? 'animate-bounce' : ''}>
            <ellipse cx="50" cy="36" rx="38" ry="13" fill="#1E293B" stroke="#38BDF8" strokeWidth="2" />
            <ellipse cx="50" cy="34" rx="32" ry="9" fill="#0EA5E9" opacity="0.85" />
            <ellipse cx="50" cy="32" rx="24" ry="6" fill="#E0F2FE" />
          </g>
        </svg>
      );

    // 6. Cama Dosel de Seda Real
    case 'bed_canopy_silk':
      return (
        <svg viewBox="0 0 100 80" className={className}>
          <ellipse cx="50" cy="72" rx="44" ry="8" fill="#1e1b4b" opacity="0.4" />
          {/* Cuatro postes de oro/madera noble */}
          <rect x="14" y="15" width="4" height="55" rx="1.5" fill="#B45309" stroke="#78350F" strokeWidth="1" />
          <rect x="82" y="15" width="4" height="55" rx="1.5" fill="#B45309" stroke="#78350F" strokeWidth="1" />
          {/* Techo dosel con volados */}
          <path d="M12,16 Q50,8 88,16 L84,24 Q50,18 16,24 Z" fill="#991B1B" stroke="#F59E0B" strokeWidth="1.5" />
          {/* Cortinajes recogidos en seda */}
          <path d="M14,20 C18,35 12,55 18,65 L22,65 C18,50 24,35 18,20 Z" fill="#DC2626" opacity="0.9" />
          <path d="M86,20 C82,35 88,55 82,65 L78,65 C82,50 76,35 82,20 Z" fill="#DC2626" opacity="0.9" />
          {/* Colchón real con sábanas brocadas */}
          <ellipse cx="50" cy="62" rx="36" ry="12" fill="#7F1D1D" stroke="#F59E0B" strokeWidth="1.5" />
          <ellipse cx="50" cy="58" rx="28" ry="8" fill="#FEE2E2" />
        </svg>
      );

    // 7. Trono-Cama de Amatista
    case 'bed_amethyst':
      return (
        <svg viewBox="0 0 100 75" className={className}>
          <ellipse cx="50" cy="65" rx="42" ry="9" fill="#2e1065" opacity="0.5" />
          {/* Cristales de amatista emergentes */}
          <polygon points="12,58 18,30 26,55" fill="#7E22CE" stroke="#C084FC" strokeWidth="1.5" />
          <polygon points="22,60 32,22 40,58" fill="#9333EA" stroke="#E9D5FF" strokeWidth="1.5" />
          <polygon points="76,58 84,26 90,56" fill="#7E22CE" stroke="#C084FC" strokeWidth="1.5" />
          <polygon points="62,60 70,18 78,58" fill="#9333EA" stroke="#E9D5FF" strokeWidth="1.5" />
          {/* Lecho cóncavo de geoda cristalina */}
          <path d="M22,54 Q50,68 78,54 Q50,44 22,54 Z" fill="#581C87" stroke="#A855F7" strokeWidth="2" />
          <ellipse cx="50" cy="52" rx="26" ry="7" fill="#C084FC" opacity="0.75" />
          {/* Destellos mágicos */}
          <circle cx="50" cy="38" r="2" fill="#FFFFFF" className="animate-ping" />
        </svg>
      );

    // 8. Hamaca Boreal Resplandeciente
    case 'bed_boreal_hammock':
      return (
        <svg viewBox="0 0 100 70" className={className}>
          <ellipse cx="50" cy="62" rx="42" ry="8" fill="#0f172a" opacity="0.3" />
          {/* Postes arqueados de cristal celeste */}
          <path d="M10,60 C12,30 18,20 22,18" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M90,60 C88,30 82,20 78,18" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" fill="none" />
          {/* Hilos de aurora en catenaria colgante */}
          <path d="M22,22 Q50,62 78,22" fill="none" stroke="#22D3EE" strokeWidth="3" />
          <path d="M22,28 Q50,68 78,28" fill="none" stroke="#818CF8" strokeWidth="4" />
          {/* Tejido de luz boreal flotante */}
          <path d="M24,26 Q50,64 76,26 C68,44 32,44 24,26 Z" fill="url(#borealGrad)" opacity="0.85" />
          <defs>
            <linearGradient id="borealGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="50%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#818CF8" />
            </linearGradient>
          </defs>
        </svg>
      );

    // 9. Cápsula Criogénica Estelar
    case 'bed_cryo_capsule':
      return (
        <svg viewBox="0 0 100 75" className={className}>
          <ellipse cx="50" cy="68" rx="42" ry="7" fill="#082f49" opacity="0.5" />
          {/* Soporte metálico aerodinámico */}
          <path d="M20,60 L28,45 L72,45 L80,60 Z" fill="#334155" stroke="#64748B" strokeWidth="1.5" />
          {/* Cápsula de cristal biomédica */}
          <ellipse cx="50" cy="42" rx="38" ry="16" fill="#0F172A" stroke="#0284C7" strokeWidth="2.5" />
          <ellipse cx="50" cy="40" rx="34" ry="12" fill="#0369A1" opacity="0.6" />
          {/* Cúpula holográfica transparente */}
          <path d="M18,40 C18,22 82,22 82,40 Z" fill="#38BDF8" opacity="0.3" stroke="#BAE6FD" strokeWidth="1" />
          {/* Interfaz de signos vitales */}
          <path d="M35,38 L42,38 L45,32 L49,42 L53,36 L56,38 L65,38" fill="none" stroke="#22D3EE" strokeWidth="1.5" />
        </svg>
      );

    // 10. Cama Celestial de Dragón Dorado
    case 'bed_celestial_dragon':
      return (
        <svg viewBox="0 0 100 85" className={className}>
          <ellipse cx="50" cy="74" rx="45" ry="9" fill="#451a03" opacity="0.4" />
          {/* Dragón dorado esculpido envolvente con alas protectoras */}
          <path d="M12,45 C10,25 24,15 32,22 C40,15 60,15 68,22 C76,15 90,25 88,45 Z" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
          {/* Alas doradas talladas */}
          <path d="M14,40 C6,25 18,12 28,26" fill="#FBBF24" stroke="#B45309" strokeWidth="1.5" />
          <path d="M86,40 C94,25 82,12 72,26" fill="#FBBF24" stroke="#B45309" strokeWidth="1.5" />
          {/* Corona y gema rubí viva */}
          <polygon points="50,14 46,24 54,24" fill="#EF4444" stroke="#B91C1C" strokeWidth="1" />
          {/* Almohadón de terciopelo imperial con brocados de seda */}
          <ellipse cx="50" cy="58" rx="38" ry="14" fill="#7C2D12" stroke="#F59E0B" strokeWidth="2.5" />
          <ellipse cx="50" cy="55" rx="30" ry="9" fill="#DC2626" />
          <ellipse cx="50" cy="53" rx="22" ry="6" fill="#FEF08A" opacity="0.75" />
          {/* Partículas de oro flotantes */}
          <circle cx="34" cy="30" r="1.5" fill="#FDE047" className="animate-ping" />
          <circle cx="66" cy="30" r="1.5" fill="#FDE047" className="animate-ping" />
        </svg>
      );

    // ==========================================
    // COMIDA Y BEBIDA
    // ==========================================
    case 'food_clay_bowl':
      return (
        <svg viewBox="0 0 60 40" className={className}>
          <ellipse cx="30" cy="32" rx="24" ry="6" fill="#1c1917" opacity="0.3" />
          <ellipse cx="30" cy="22" rx="22" ry="9" fill="#9A3412" stroke="#7C2D12" strokeWidth="2" />
          <ellipse cx="30" cy="19" rx="17" ry="6" fill="#EA580C" />
          {/* Croquetas nutritivas */}
          <circle cx="25" cy="19" r="3" fill="#78350F" />
          <circle cx="32" cy="18" r="3" fill="#92400E" />
          <circle cx="37" cy="20" r="2.5" fill="#78350F" />
        </svg>
      );

    case 'food_silver_bowl':
      return (
        <svg viewBox="0 0 60 40" className={className}>
          <ellipse cx="30" cy="32" rx="24" ry="6" fill="#1e293b" opacity="0.3" />
          <ellipse cx="30" cy="22" rx="22" ry="9" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
          <ellipse cx="30" cy="19" rx="17" ry="6" fill="#38BDF8" opacity="0.85" />
          {/* Reflejo brillante de agua pura */}
          <path d="M22,19 Q30,17 38,19" stroke="#FFFFFF" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      );

    case 'food_vital_fountain':
      return (
        <svg viewBox="0 0 70 60" className={className}>
          <ellipse cx="35" cy="52" rx="28" ry="7" fill="#0f172a" opacity="0.4" />
          <ellipse cx="35" cy="42" rx="26" ry="9" fill="#64748B" stroke="#334155" strokeWidth="2" />
          <ellipse cx="35" cy="39" rx="21" ry="6" fill="#0EA5E9" />
          {/* Pilar y chorro de agua */}
          <rect x="32" y="24" width="6" height="16" fill="#94A3B8" rx="2" />
          <ellipse cx="35" cy="24" rx="12" ry="4" fill="#64748B" />
          <path d="M35,16 Q31,22 35,28 Q39,22 35,16 Z" fill="#38BDF8" className="animate-pulse" />
        </svg>
      );

    case 'food_mana_feast':
      return (
        <svg viewBox="0 0 80 60" className={className}>
          <ellipse cx="40" cy="52" rx="34" ry="8" fill="#1c1917" opacity="0.4" />
          {/* Fuente dorada */}
          <ellipse cx="40" cy="40" rx="32" ry="11" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
          {/* Montaña de frutas mágicas */}
          <circle cx="32" cy="32" r="8" fill="#EF4444" stroke="#991B1B" strokeWidth="1.5" />
          <circle cx="48" cy="32" r="8" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
          <circle cx="40" cy="24" r="7" fill="#8B5CF6" stroke="#6D28D9" strokeWidth="1.5" />
          {/* Hojitas verdes */}
          <path d="M38,18 Q44,14 46,18" stroke="#10B981" strokeWidth="2" fill="none" />
        </svg>
      );

    // ==========================================
    // JUGUETES E INTERACCIÓN
    // ==========================================
    case 'toy_bouncy_ball':
      return (
        <svg viewBox="0 0 50 50" className={className}>
          <ellipse cx="25" cy="42" rx="16" ry="5" fill="#1e293b" opacity="0.3" />
          <circle cx="25" cy="24" r="18" fill="#EC4899" stroke="#BE185D" strokeWidth="2" />
          <path d="M12,24 C14,14 36,14 38,24" stroke="#F472B6" strokeWidth="3" fill="none" />
          <path d="M14,28 C18,36 32,36 36,28" stroke="#FBCFE8" strokeWidth="2.5" fill="none" />
          <circle cx="20" cy="18" r="3" fill="#FFFFFF" opacity="0.6" />
        </svg>
      );

    case 'toy_scratch_post':
      return (
        <svg viewBox="0 0 60 80" className={className}>
          <ellipse cx="30" cy="72" rx="26" ry="7" fill="#1c1917" opacity="0.4" />
          <rect x="24" y="20" width="12" height="50" rx="3" fill="#D97706" stroke="#92400E" strokeWidth="2" />
          {/* Cuerda enrollada */}
          <line x1="24" y1="28" x2="36" y2="28" stroke="#FDE68A" strokeWidth="2" />
          <line x1="24" y1="36" x2="36" y2="36" stroke="#FDE68A" strokeWidth="2" />
          <line x1="24" y1="44" x2="36" y2="44" stroke="#FDE68A" strokeWidth="2" />
          <line x1="24" y1="52" x2="36" y2="52" stroke="#FDE68A" strokeWidth="2" />
          <line x1="24" y1="60" x2="36" y2="60" stroke="#FDE68A" strokeWidth="2" />
          {/* Plataforma superior */}
          <ellipse cx="30" cy="20" rx="18" ry="6" fill="#78350F" stroke="#451A03" strokeWidth="1.5" />
          {/* Ratoncito colgante */}
          <line x1="30" y1="20" x2="30" y2="32" stroke="#475569" strokeWidth="1.5" />
          <circle cx="30" cy="34" r="4" fill="#94A3B8" />
        </svg>
      );

    case 'toy_laser_orb':
      return (
        <svg viewBox="0 0 50 50" className={className}>
          <ellipse cx="25" cy="42" rx="14" ry="4" fill="#1e293b" opacity="0.3" />
          {/* Trípode metálico */}
          <line x1="25" y1="25" x2="16" y2="40" stroke="#64748B" strokeWidth="2" />
          <line x1="25" y1="25" x2="34" y2="40" stroke="#64748B" strokeWidth="2" />
          <line x1="25" y1="25" x2="25" y2="42" stroke="#475569" strokeWidth="2" />
          {/* Orbe emisor */}
          <circle cx="25" cy="22" r="10" fill="#EF4444" stroke="#991B1B" strokeWidth="2" className={isInteracting ? 'animate-pulse' : ''} />
          <circle cx="25" cy="22" r="4" fill="#FEE2E2" />
        </svg>
      );

    case 'toy_acrobatic_ring':
      return (
        <svg viewBox="0 0 60 80" className={className}>
          <ellipse cx="30" cy="74" rx="22" ry="5" fill="#1e293b" opacity="0.3" />
          <rect x="28" y="45" width="4" height="28" fill="#64748B" rx="1" />
          {/* Aro grande forrado */}
          <circle cx="30" cy="30" r="22" fill="none" stroke="#F59E0B" strokeWidth="5" />
          <circle cx="30" cy="30" r="22" fill="none" stroke="#EF4444" strokeWidth="5" strokeDasharray="14 14" />
          {/* Cinta de adorno */}
          <path d="M30,8 L28,2 M30,8 L32,2" stroke="#10B981" strokeWidth="2" />
        </svg>
      );

    case 'toy_cloud_trampoline':
      return (
        <svg viewBox="0 0 80 60" className={className}>
          <ellipse cx="40" cy="52" rx="34" ry="7" fill="#0f172a" opacity="0.3" />
          {/* Patas metálicas elásticas */}
          <line x1="18" y1="36" x2="14" y2="50" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
          <line x1="62" y1="36" x2="66" y2="50" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
          {/* Lona elástica */}
          <ellipse cx="40" cy="36" rx="32" ry="10" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />
          <ellipse cx="40" cy="34" rx="24" ry="7" fill="#E0F2FE" />
          <path d="M28,34 Q40,40 52,34" stroke="#0284C7" strokeWidth="1.5" fill="none" strokeDasharray="3 3" />
        </svg>
      );

    // ==========================================
    // ILUMINACIÓN
    // ==========================================
    case 'light_firefly_lantern':
      return (
        <svg viewBox="0 0 50 65" className={className}>
          <ellipse cx="25" cy="58" rx="16" ry="4" fill="#1c1917" opacity="0.3" />
          {/* Frasco con tapa metálica */}
          <rect x="20" y="16" width="10" height="5" fill="#78350F" rx="1.5" />
          <rect x="15" y="21" width="20" height="34" rx="5" fill="#FEF3C7" opacity="0.6" stroke="#D97706" strokeWidth="2" />
          {/* Luciérnagas vivas */}
          <circle cx="22" cy="32" r="2.5" fill="#F59E0B" className="animate-ping" />
          <circle cx="28" cy="40" r="3" fill="#FBBF24" className="animate-pulse" />
          <circle cx="21" cy="46" r="2" fill="#F59E0B" />
        </svg>
      );

    case 'light_pink_salt':
      return (
        <svg viewBox="0 0 50 55" className={className}>
          <ellipse cx="25" cy="48" rx="18" ry="5" fill="#1c1917" opacity="0.3" />
          <rect x="16" y="42" width="18" height="6" rx="2" fill="#78350F" />
          {/* Bloque de sal rosa con brillo cálido */}
          <path d="M16,42 L18,22 L24,14 L32,16 L35,26 L34,42 Z" fill="#F472B6" stroke="#DB2777" strokeWidth="1.5" />
          <polygon points="20,24 24,18 30,22 26,30" fill="#FBCFE8" opacity="0.8" />
        </svg>
      );

    case 'light_holy_flame':
      return (
        <svg viewBox="0 0 60 75" className={className}>
          <ellipse cx="30" cy="68" rx="22" ry="5" fill="#0f172a" opacity="0.35" />
          <rect x="28" y="32" width="4" height="36" fill="#B45309" rx="1" />
          {/* Candelabro y flama azul etérea */}
          <path d="M18,36 Q30,42 42,36" stroke="#F59E0B" strokeWidth="3" fill="none" />
          <circle cx="18" cy="34" r="3" fill="#D97706" />
          <circle cx="42" cy="34" r="3" fill="#D97706" />
          {/* Llamas sagradas */}
          <path d="M18,30 C16,22 20,18 18,12 C22,18 20,24 18,30 Z" fill="#38BDF8" className="animate-pulse" />
          <path d="M42,30 C40,22 44,18 42,12 C46,18 44,24 42,30 Z" fill="#38BDF8" className="animate-pulse" />
          <path d="M30,28 C27,18 33,14 30,6 C35,14 33,20 30,28 Z" fill="#60A5FA" className="animate-pulse" />
        </svg>
      );

    case 'light_plasma_galaxy':
      return (
        <svg viewBox="0 0 60 70" className={className}>
          <ellipse cx="30" cy="64" rx="20" ry="5" fill="#1e1b4b" opacity="0.4" />
          <rect x="22" y="48" width="16" height="16" rx="3" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
          {/* Esfera de vidrio y rayos de plasma */}
          <circle cx="30" cy="28" r="20" fill="#0F172A" stroke="#818CF8" strokeWidth="2" opacity="0.8" />
          <circle cx="30" cy="28" r="5" fill="#C084FC" />
          <path d="M30,28 Q22,18 16,22 M30,28 Q38,20 44,26 M30,28 Q24,36 18,34" stroke="#A855F7" strokeWidth="1.5" fill="none" className="animate-pulse" />
        </svg>
      );

    // ==========================================
    // DECORACIÓN Y PLANTAS VIVAS
    // ==========================================
    case 'decor_breathing_bonsai':
      return (
        <svg viewBox="0 0 70 70" className={className}>
          <ellipse cx="35" cy="64" rx="26" ry="6" fill="#1c1917" opacity="0.4" />
          {/* Maceta de cerámica japonesa */}
          <polygon points="20,54 50,54 46,64 24,64" fill="#451A03" stroke="#78350F" strokeWidth="1.5" />
          {/* Tronco sinuoso retorcido */}
          <path d="M35,54 Q38,44 32,38 Q36,30 34,22" stroke="#78350F" strokeWidth="5" fill="none" strokeLinecap="round" />
          {/* Follaje vivo en nubes verdes */}
          <circle cx="28" cy="26" r="10" fill="#10B981" />
          <circle cx="42" cy="22" r="12" fill="#059669" />
          <circle cx="35" cy="14" r="9" fill="#34D399" />
          <circle cx="48" cy="30" r="8" fill="#10B981" />
        </svg>
      );

    case 'decor_singing_crystal':
      return (
        <svg viewBox="0 0 60 70" className={className}>
          <ellipse cx="30" cy="64" rx="22" ry="5" fill="#1e1b4b" opacity="0.3" />
          <polygon points="18,62 42,62 38,65 22,65" fill="#334155" />
          {/* Cristal de cuarzo cantarino */}
          <polygon points="30,12 20,38 24,58 36,58 40,38" fill="#EC4899" stroke="#F472B6" strokeWidth="2" />
          <polygon points="30,12 30,58 36,58 40,38" fill="#F472B6" opacity="0.5" />
          {/* Notas musicales flotantes */}
          <text x="36" y="20" fontSize="10" fill="#F472B6" className="animate-bounce">♪</text>
          <text x="14" y="28" fontSize="8" fill="#C084FC" className="animate-pulse">♫</text>
        </svg>
      );

    case 'decor_music_box':
      return (
        <svg viewBox="0 0 60 60" className={className}>
          <ellipse cx="30" cy="54" rx="22" ry="5" fill="#1c1917" opacity="0.3" />
          {/* Caja de madera noble */}
          <rect x="14" y="28" width="32" height="24" rx="3" fill="#78350F" stroke="#451A03" strokeWidth="2" />
          {/* Tapa abierta en ángulo */}
          <polygon points="12,28 48,28 44,14 16,14" fill="#92400E" stroke="#78350F" strokeWidth="1.5" />
          {/* Bailarina / engranaje interior */}
          <rect x="28" y="20" width="4" height="10" fill="#F59E0B" />
          <circle cx="30" cy="18" r="3" fill="#FDE047" />
          {/* Manivela dorada */}
          <path d="M46,38 L52,38 L52,32" stroke="#F59E0B" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      );

    // ==========================================
    // PARED Y TROFEOS
    // ==========================================
    case 'wall_honor_diploma':
      return (
        <svg viewBox="0 0 70 55" className={className}>
          {/* Marco de oro con molduras */}
          <rect x="8" y="6" width="54" height="42" rx="3" fill="#FEF3C7" stroke="#D97706" strokeWidth="3" />
          <rect x="12" y="10" width="46" height="34" rx="1" fill="#FFFFFF" stroke="#FDE68A" strokeWidth="1" />
          {/* Encabezado y líneas de caligrafía */}
          <rect x="24" y="14" width="22" height="3" rx="1" fill="#D97706" />
          <line x1="18" y1="22" x2="52" y2="22" stroke="#94A3B8" strokeWidth="1.5" />
          <line x1="18" y1="28" x2="52" y2="28" stroke="#94A3B8" strokeWidth="1.5" />
          <line x1="18" y1="34" x2="42" y2="34" stroke="#94A3B8" strokeWidth="1.5" />
          {/* Sello de cera rojo */}
          <circle cx="48" cy="36" r="4.5" fill="#EF4444" />
        </svg>
      );

    case 'wall_school_banner':
      return (
        <svg viewBox="0 0 60 80" className={className}>
          {/* Varilla superior */}
          <rect x="6" y="8" width="48" height="4" rx="2" fill="#B45309" />
          <circle cx="6" cy="10" r="2.5" fill="#F59E0B" />
          <circle cx="54" cy="10" r="2.5" fill="#F59E0B" />
          {/* Cordón de suspensión */}
          <path d="M12,8 L30,2 L48,8" stroke="#F59E0B" strokeWidth="1.5" fill="none" />
          {/* Estandarte de corte en V */}
          <polygon points="10,12 50,12 50,62 30,76 10,62" fill="#047857" stroke="#F59E0B" strokeWidth="2" />
          {/* Emblema central de la escuela */}
          <circle cx="30" cy="38" r="10" fill="#F59E0B" />
          <polygon points="30,30 33,37 40,37 34,42 36,49 30,44 24,49 26,42 20,37 27,37" fill="#FFFFFF" />
        </svg>
      );

    case 'wall_pendulum_clock':
      return (
        <svg viewBox="0 0 50 85" className={className}>
          {/* Estructura de madera */}
          <rect x="12" y="8" width="26" height="68" rx="4" fill="#78350F" stroke="#451A03" strokeWidth="2" />
          {/* Esfera del reloj */}
          <circle cx="25" cy="24" r="10" fill="#FEF3C7" stroke="#B45309" strokeWidth="1.5" />
          <line x1="25" y1="24" x2="25" y2="18" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="25" y1="24" x2="29" y2="24" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
          {/* Ventana del péndulo */}
          <rect x="16" y="38" width="18" height="32" rx="2" fill="#1C1917" />
          {/* Péndulo oscilante */}
          <line x1="25" y1="40" x2="25" y2="60" stroke="#F59E0B" strokeWidth="1.5" />
          <circle cx="25" cy="60" r="4.5" fill="#F59E0B" stroke="#D97706" strokeWidth="1" className="animate-spin" style={{ animationDuration: '3s' }} />
        </svg>
      );

    case 'wall_trophy_case':
      return (
        <svg viewBox="0 0 80 65" className={className}>
          {/* Repisa flotante de caoba */}
          <rect x="6" y="44" width="68" height="10" rx="2" fill="#78350F" stroke="#451A03" strokeWidth="2" />
          <polygon points="12,54 20,54 16,62" fill="#451A03" />
          <polygon points="60,54 68,54 64,62" fill="#451A03" />
          {/* Trofeos sobre la repisa */}
          {/* Copa dorada 1 */}
          <path d="M22,22 L32,22 L30,34 L24,34 Z" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
          <path d="M20,24 C16,26 18,30 22,30 M34,24 C38,26 36,30 32,30" stroke="#F59E0B" strokeWidth="1.5" fill="none" />
          <rect x="25" y="34" width="4" height="6" fill="#B45309" />
          <rect x="22" y="40" width="10" height="4" fill="#78350F" />
          {/* Trofeo de plata 2 */}
          <path d="M46,26 L56,26 L54,36 L48,36 Z" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
          <rect x="49" y="36" width="4" height="5" fill="#64748B" />
          <rect x="47" y="41" width="8" height="3" fill="#334155" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 60 60" className={className}>
          <circle cx="30" cy="30" r="24" fill="#3F3F46" stroke="#71717A" strokeWidth="2" />
          <text x="30" y="36" fontSize="18" textAnchor="middle" fill="#A1A1AA">📦</text>
        </svg>
      );
  }
};
