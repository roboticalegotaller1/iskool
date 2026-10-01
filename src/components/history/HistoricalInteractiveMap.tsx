"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Compass, 
  Info, 
  Navigation, 
  ExternalLink,
  Plus,
  Minus,
  Layers,
  RotateCcw,
  Eye,
  Camera,
  Maximize2,
  ArrowLeft,
  ArrowRight,
  Film,
  AlertCircle,
  Sparkles,
  Play
} from 'lucide-react';
import { HistoricalKeyLocation } from '@/types/studioBlocks';

export interface HistoricalInteractiveMapProps {
  locations: HistoricalKeyLocation[];
  title?: string;
  characterName?: string;
  className?: string;
}

/**
 * Convierte coordenadas geográficas a coordenadas de tesela (Slippy Map Tiles)
 */
function getTileCoordinates(lat: number, lng: number, zoom: number) {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);
  return { x, y };
}

export const HistoricalInteractiveMap: React.FC<HistoricalInteractiveMapProps> = ({
  locations,
  title = 'Cartografía de Hitos Históricos',
  characterName,
  className = ''
}) => {
  const defaultLoc: HistoricalKeyLocation = locations[0] || {
    id: 'def-1',
    name: 'Casa de la Corregidora (Palacio de Gobierno de Querétaro)',
    stateOrCountry: 'Querétaro, México',
    coordinates: { lat: 20.5931, lng: -100.3928 },
    significance: 'Sede de las tertulias secretas de la conspiración de 1810 y sitio del encierro donde Josefa dio aviso a la patria.',
    imageUrl: '/images/history/casa_corregidora_queretaro.jpg'
  };

  const [activeLoc, setActiveLoc] = useState<HistoricalKeyLocation>(defaultLoc);
  const [zoomLevel, setZoomLevel] = useState<number>(15);
  const [mapStyle, setMapStyle] = useState<'osm' | 'satellite' | 'street'>('osm');
  const [viewMode, setViewMode] = useState<'map' | 'photos'>('map');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Resetear paneo y foto al cambiar de ubicación
  useEffect(() => {
    setPanOffset({ x: 0, y: 0 });
    setSelectedPhotoIndex(0);
  }, [activeLoc.id]);

  // Estructura y resolvedor multimedia enriquecido por hito histórico
  interface LocationMedia {
    primaryImage: string;
    gallery: Array<{ url: string; caption: string }>;
  }

  const resolveLocationMedia = (loc: HistoricalKeyLocation): LocationMedia => {
    const n = (loc.name || '').toLowerCase();
    const c = (characterName || '').toLowerCase();

    // Canutillo / Durango (Villa)
    if (n.includes('canutillo') || n.includes('durango')) {
      return {
        primaryImage: '/images/history/hacienda_canutillo_villa.jpg',
        gallery: [
          { url: '/images/history/hacienda_canutillo_villa.jpg', caption: 'Casco histórico de la Hacienda de Canutillo, Durango' },
          { url: '/images/history/francisco_villa_avatar.png', caption: 'General Francisco Villa en Canutillo' }
        ]
      };
    }

    // Cerro de la Bufa / Zacatecas (Villa)
    if (n.includes('bufa') || n.includes('zacatecas')) {
      return {
        primaryImage: '/images/history/cerro_bufa_zacatecas.jpg',
        gallery: [
          { url: '/images/history/cerro_bufa_zacatecas.jpg', caption: 'Cima del Cerro de la Bufa y Plaza de la Revolución, Zacatecas' },
          { url: '/images/history/villa_batalla_zacatecas_comic_2.png', caption: 'Toma de Zacatecas (23 de junio de 1914)' }
        ]
      };
    }

    // Columbus / Nuevo México (Villa)
    if (n.includes('columbus') || n.includes('nuevo mexico') || n.includes('punitiva')) {
      return {
        primaryImage: '/images/history/columbus_nuevo_mexico.jpg',
        gallery: [
          { url: '/images/history/columbus_nuevo_mexico.jpg', caption: 'Parque Histórico Pancho Villa en Columbus, Nuevo México' },
          { url: '/images/history/villa_columbus_comic_4.png', caption: 'Incursión en Columbus (9 de marzo de 1916)' }
        ]
      };
    }

    // Palacio Nacional / CDMX
    if (n.includes('palacio nacional') || (n.includes('palacio') && (n.includes('zapata') || n.includes('presidencial')))) {
      return {
        primaryImage: '/images/history/palacio_nacional_villa_zapata.jpg',
        gallery: [
          { url: '/images/history/palacio_nacional_villa_zapata.jpg', caption: 'Villa y Zapata en la Silla Presidencial (diciembre de 1914)' }
        ]
      };
    }

    // Casa de la Corregidora / Querétaro (Josefa)
    if (n.includes('corregidora') || (n.includes('palacio') && n.includes('queretaro')) || n.includes('gobierno de queretaro')) {
      return {
        primaryImage: '/images/history/casa_corregidora_queretaro.jpg',
        gallery: [
          { url: '/images/history/casa_corregidora_queretaro.jpg', caption: 'Palacio de Gobierno de Querétaro (Casa de la Corregidora)' },
          { url: '/images/history/josefa_taconeo_comic_2.png', caption: 'Alcoba histórica del taconeo libertario (15 de septiembre de 1810)' },
          { url: '/images/history/acueducto_queretaro.jpg', caption: 'Monumental Acueducto de Querétaro' }
        ]
      };
    }

    // Parroquia de Dolores / Guanajuato (Hidalgo)
    if (n.includes('dolores') || n.includes('parroquia')) {
      return {
        primaryImage: '/images/history/parroquia_dolores.jpg',
        gallery: [
          { url: '/images/history/parroquia_dolores.jpg', caption: 'Parroquia de Nuestra Señora de los Dolores (Cuna de la Independencia)' },
          { url: '/images/history/hidalgo_grito_comic_4.png', caption: 'Campanario del Grito de Dolores (1810)' }
        ]
      };
    }

    // Alhóndiga de Granaditas (Hidalgo)
    if (n.includes('alhondiga') || n.includes('granaditas')) {
      return {
        primaryImage: '/images/history/alhondiga_granaditas.jpg',
        gallery: [
          { url: '/images/history/alhondiga_granaditas.jpg', caption: 'Alhóndiga de Granaditas en Guanajuato' }
        ]
      };
    }

    // Palacio de Gobierno de Guadalajara (Hidalgo)
    if (n.includes('guadalajara')) {
      return {
        primaryImage: '/images/history/palacio_guadalajara.jpg',
        gallery: [
          { url: '/images/history/palacio_guadalajara.jpg', caption: 'Palacio de Gobierno de Guadalajara (Sede de la Abolición de la Esclavitud)' },
          { url: '/images/history/hidalgo_decreto_abolicion.jpg', caption: 'Histórico Decreto de Abolición de la Esclavitud de 1810' }
        ]
      };
    }

    // Calabozo de Hidalgo en Chihuahua
    if (n.includes('calabozo') || n.includes('chihuahua')) {
      return {
        primaryImage: '/images/history/calabozo_hidalgo.jpg',
        gallery: [
          { url: '/images/history/calabozo_hidalgo.jpg', caption: 'Calabozo de Don Miguel Hidalgo en Chihuahua (Prisión Militar de 1811)' }
        ]
      };
    }

    // San Miguel de Allende
    if (n.includes('san miguel') || n.includes('allende')) {
      return {
        primaryImage: '/images/history/san_miguel_allende.jpg',
        gallery: [
          { url: '/images/history/san_miguel_allende.jpg', caption: 'Plaza principal y Parroquia de San Miguel Arcángel' }
        ]
      };
    }

    // Panteón de los Queretanos Ilustres
    if (n.includes('panteon') || n.includes('ilustres') || n.includes('mausoleo')) {
      return {
        primaryImage: '/images/history/panteon_queretanos_ilustres.jpg',
        gallery: [
          { url: '/images/history/panteon_queretanos_ilustres.jpg', caption: 'Panteón y Mausoleo de la Corregidora Josefa Ortiz' }
        ]
      };
    }

    // Acueducto de Querétaro (Los Arcos)
    if (n.includes('acueducto') || n.includes('arcos')) {
      return {
        primaryImage: '/images/history/acueducto_queretaro.jpg',
        gallery: [
          { url: '/images/history/acueducto_queretaro.jpg', caption: 'Monumental Acueducto de Querétaro (74 Arcos de Cantera)' }
        ]
      };
    }

    // Teatro de la República / Querétaro
    if (n.includes('teatro') || n.includes('republica') || n.includes('constitucion')) {
      return {
        primaryImage: '/images/history/teatro_republica.jpg',
        gallery: [
          { url: '/images/history/teatro_republica.jpg', caption: 'Teatro de la República en Querétaro' },
          { url: '/images/history/teatro_republica_1917.jpg', caption: 'Congreso Constituyente de 1917' }
        ]
      };
    }

    // Cerro de las Campanas
    if (n.includes('campanas') || n.includes('sitio de queretaro')) {
      return {
        primaryImage: '/images/history/cerro_campanas.jpg',
        gallery: [
          { url: '/images/history/cerro_campanas.jpg', caption: 'Cerro de las Campanas en Querétaro' },
          { url: '/images/history/sitio_queretaro_1867.jpg', caption: 'Fin del Segundo Imperio en México (1867)' }
        ]
      };
    }

    // San Agustín Querétaro
    if (n.includes('agustin')) {
      return {
        primaryImage: '/images/history/san_agustin_queretaro.jpg',
        gallery: [
          { url: '/images/history/san_agustin_queretaro.jpg', caption: 'Templo y Exconvento de San Agustín (Joya del Barroco Novohispano)' }
        ]
      };
    }

    // Fundación Querétaro / Sangremal
    if (n.includes('fundacion') || n.includes('sangremal')) {
      return {
        primaryImage: '/images/history/fundacion_queretaro.jpg',
        gallery: [
          { url: '/images/history/fundacion_queretaro.jpg', caption: 'Loma del Sangremal y Fundación de Querétaro (1531)' }
        ]
      };
    }

    // Fallback contextual por personaje
    if (c.includes('villa') || c.includes('doroteo') || c.includes('centauro')) {
      return {
        primaryImage: '/images/history/hacienda_canutillo_villa.jpg',
        gallery: [
          { url: '/images/history/hacienda_canutillo_villa.jpg', caption: 'Hacienda de Canutillo' },
          { url: '/images/history/cerro_bufa_zacatecas.jpg', caption: 'Cerro de la Bufa' }
        ]
      };
    }

    const fallbackImg = loc.imageUrl || loc.currentDayPhoto || '/images/history/casa_corregidora_queretaro.jpg';
    return {
      primaryImage: fallbackImg,
      gallery: [{ url: fallbackImg, caption: loc.name }]
    };
  };

  const activeMedia = resolveLocationMedia(activeLoc);
  const activeImageUrl = activeMedia.primaryImage;

  // Generar teselas nativas sin marcas de agua (OpenStreetMap + Esri Satelital) en cuadrícula 3x3
  const centerTile = useMemo(() => {
    return getTileCoordinates(activeLoc.coordinates.lat, activeLoc.coordinates.lng, zoomLevel);
  }, [activeLoc.coordinates, zoomLevel]);

  const tileGrid = useMemo(() => {
    const offsets = [
      { dx: -1, dy: -1 }, { dx: 0, dy: -1 }, { dx: 1, dy: -1 },
      { dx: -1, dy: 0 },  { dx: 0, dy: 0 },  { dx: 1, dy: 0 },
      { dx: -1, dy: 1 },  { dx: 0, dy: 1 },  { dx: 1, dy: 1 },
    ];

    return offsets.map(off => {
      const tileX = centerTile.x + off.dx;
      const tileY = centerTile.y + off.dy;
      
      // Fuente primaria limpia y secundaria de respaldo (Sin marcas de agua ni API key requerida)
      let src = `https://tile.openstreetmap.org/${zoomLevel}/${tileX}/${tileY}.png`;
      let fallbackSrc = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${zoomLevel}/${tileY}/${tileX}`;

      if (mapStyle === 'satellite') {
        src = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoomLevel}/${tileY}/${tileX}`;
        fallbackSrc = `https://tile.openstreetmap.org/${zoomLevel}/${tileX}/${tileY}.png`;
      } else if (mapStyle === 'street') {
        src = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${zoomLevel}/${tileY}/${tileX}`;
        fallbackSrc = `https://tile.openstreetmap.org/${zoomLevel}/${tileX}/${tileY}.png`;
      }

      return {
        key: `${mapStyle}-${zoomLevel}-${tileX}-${tileY}`,
        src,
        fallbackSrc,
        col: off.dx + 1,
        row: off.dy + 1
      };
    });
  }, [centerTile, zoomLevel, mapStyle]);

  // Manejadores de arrastre / paneo nativo
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const googleMapsExternalUrl = `https://www.google.com/maps/search/?api=1&query=${activeLoc.coordinates.lat},${activeLoc.coordinates.lng}`;

  return (
    <div className={`flex flex-col gap-4 p-4 sm:p-6 rounded-3xl bg-slate-900 border border-amber-500/30 text-white shadow-2xl backdrop-blur-xl ${className}`}>
      {/* Cabecera de la Cartografía */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-amber-500/20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30">
            <Compass className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-black text-amber-100 uppercase tracking-wide">
              {title}
            </h3>
            <p className="text-[11px] text-amber-400/70">
              {characterName ? `Geografía y sitios históricos de ${characterName}` : 'Geografía de la Gesta Histórica'}
            </p>
          </div>
        </div>

        {/* Controles de Vista: Mapa Cartográfico vs Fotos Reales Verificadas */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Selector de Modo */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-black/60 border border-amber-500/30">
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                  : 'text-amber-200/80 hover:text-amber-100 hover:bg-white/5'
              }`}
              title="Ver cartografía satelital y urbana interactiva"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Mapa Cartográfico</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('photos')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'photos'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                  : 'text-amber-200/80 hover:text-amber-100 hover:bg-white/5'
              }`}
              title="Ver fotografías históricas y arquitectónicas reales comprobadas"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fotos Reales ({activeMedia.gallery.length})</span>
            </button>
          </div>

          {viewMode === 'map' && (
            <button
              type="button"
              onClick={() => setMapStyle(prev => prev === 'osm' ? 'satellite' : prev === 'satellite' ? 'street' : 'osm')}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 font-bold text-xs border border-amber-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Cambiar capa visual del mapa"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{mapStyle === 'osm' ? 'Capa Urbana' : mapStyle === 'satellite' ? 'Capa Satelital' : 'Capa Callejero'}</span>
            </button>
          )}

          <a 
            href={googleMapsExternalUrl}
            target="_blank" 
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 text-slate-950 font-black text-xs border border-amber-300 shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all"
            title="Abrir ubicación en Google Maps en nueva pestaña"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-950" />
            <span>Ver en Google Maps Externo</span>
          </a>
        </div>
      </div>

      {/* Contenedor Principal: Vista Multimedia Seleccionada y Ficha del Hito */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ================= VISTA PRINCIPAL (Col 7) ================= */}
        {viewMode === 'photos' ? (
          /* ================= FOTOS REALES Y GALERÍA HISTÓRICA ================= */
          <div className="lg:col-span-7 relative h-[340px] sm:h-[420px] rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-inner bg-slate-950 flex flex-col justify-between">
            {/* Foto Principal en Alta Definición */}
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black">
              {/* Fondo difuminado ambiental */}
              <img 
                src={activeMedia.gallery[selectedPhotoIndex]?.url || activeMedia.primaryImage}
                alt={activeLoc.name}
                className="absolute inset-0 w-full h-full object-cover blur-xl opacity-30 scale-110"
              />
              <img 
                src={activeMedia.gallery[selectedPhotoIndex]?.url || activeMedia.primaryImage}
                alt={activeLoc.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/history/casa_corregidora_queretaro.jpg';
                }}
                className="relative z-10 max-w-full max-h-full object-contain"
              />
            </div>

            {/* Badge Superior */}
            <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-black/85 backdrop-blur-md border border-amber-500/40 text-[10px] text-amber-300 font-mono shadow-lg flex items-center gap-1.5 z-20">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Fotografía Histórica Verificada · {activeLoc.name}</span>
            </div>

            {/* Tira Inferior de Galería y Pie de Foto */}
            <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black via-black/85 to-transparent flex flex-col gap-2 z-20">
              <p className="text-xs font-serif text-amber-100 drop-shadow">
                {activeMedia.gallery[selectedPhotoIndex]?.caption || activeLoc.name}
              </p>

              {activeMedia.gallery.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {activeMedia.gallery.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedPhotoIndex(idx)}
                      className={`relative w-14 h-10 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                        selectedPhotoIndex === idx ? 'border-amber-400 scale-105' : 'border-white/20 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={item.url} alt={item.caption} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ================= MAPA NATIVO INTERACTIVO SIN IFRAMES ================= */
          <div 
            className="lg:col-span-7 relative h-[340px] sm:h-[420px] rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-inner bg-slate-950 cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Fondo Vectorial Topográfico de Época */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:20px_20px]" />

            {/* Cuadrícula de Teselas Cartográficas Nativas */}
            <div 
              className="absolute left-1/2 top-1/2 transition-transform duration-75"
              style={{
                width: '768px',
                height: '768px',
                transform: `translate(calc(-50% + ${panOffset.x}px), calc(-50% + ${panOffset.y}px))`
              }}
            >
              <div className={`grid grid-cols-3 grid-rows-3 w-full h-full ${
                mapStyle === 'satellite' 
                  ? 'contrast-115 brightness-100' 
                  : mapStyle === 'street'
                    ? 'contrast-105 brightness-100'
                    : 'contrast-105 brightness-95'
              }`}>
                {tileGrid.map((tile) => (
                  <div key={tile.key} className="w-[256px] h-[256px] relative bg-slate-900 border border-slate-800/40 overflow-hidden flex items-center justify-center">
                    {/* Trama topográfica base si la tesela demora o falla */}
                    <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px]" />
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-slate-950/60 pointer-events-none" />
                    <img 
                      src={tile.src} 
                      alt="Cartografía" 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== tile.fallbackSrc && tile.fallbackSrc) {
                          target.src = tile.fallbackSrc;
                        } else {
                          target.style.opacity = '0';
                        }
                      }}
                      className="w-full h-full object-cover select-none pointer-events-none transition-opacity duration-300"
                      loading="eager"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Viñeta de Profundidad en los Bordes */}
            <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/60 pointer-events-none" />

            {/* Marcador Geográfico Central Pulsante */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 flex flex-col items-center">
              {/* Ondas de radar activas */}
              <div className="absolute -inset-4 rounded-full bg-amber-500/25 animate-ping pointer-events-none" />
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center shadow-2xl border-2 border-white transform hover:scale-110 transition-transform">
                <MapPin className="w-5 h-5 fill-slate-950 text-slate-950" />
              </div>
              
              {/* Cartela flotante del Hito */}
              <div className="mt-2 px-3 py-1 rounded-xl bg-black/90 backdrop-blur-md border border-amber-400 text-[11px] font-black text-amber-200 shadow-2xl flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{activeLoc.name}</span>
              </div>
            </div>

            {/* Badge Superior de Coordenadas Satelitales */}
            <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-black/85 backdrop-blur-md border border-amber-500/40 text-[10px] text-amber-300 font-mono shadow-lg flex items-center gap-1.5 pointer-events-none z-20">
              <Navigation className="w-3.5 h-3.5 text-amber-400" />
              <span>Lat: {activeLoc.coordinates.lat.toFixed(4)}, Lng: {activeLoc.coordinates.lng.toFixed(4)}</span>
            </div>

            {/* Controles de Zoom (+ / -) y Reset */}
            <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 z-20">
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.min(18, prev + 1))}
                className="w-8 h-8 rounded-xl bg-black/80 hover:bg-black text-amber-300 border border-amber-500/40 flex items-center justify-center shadow-lg transition-all cursor-pointer"
                title="Acercar mapa (+)"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.max(12, prev - 1))}
                className="w-8 h-8 rounded-xl bg-black/80 hover:bg-black text-amber-300 border border-amber-500/40 flex items-center justify-center shadow-lg transition-all cursor-pointer"
                title="Alejar mapa (-)"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setPanOffset({ x: 0, y: 0 })}
                className="w-8 h-8 rounded-xl bg-black/80 hover:bg-black text-amber-300 border border-amber-500/40 flex items-center justify-center shadow-lg transition-all cursor-pointer"
                title="Centrar en el hito"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-sm border border-amber-500/30 text-[9px] text-amber-400/80 font-mono pointer-events-none z-20">
              Cartografía Táctil Nativa Activa (Zoom: {zoomLevel}x)
            </div>
          </div>
        )}

        {/* Ficha Detallada del Hito Seleccionado con Fotografía Responsiva (Col 5) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-4 rounded-2xl bg-black/60 border border-amber-500/25 overflow-hidden">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Hito Activo
              </span>
              <span className="text-[11px] text-amber-400/80 font-mono truncate">
                {activeLoc.stateOrCountry}
              </span>
            </div>

            <h4 className="text-base font-black text-amber-100 leading-snug">
              {activeLoc.name}
            </h4>

            {/* Fotografía Histórica / Arquitectónica Responsiva */}
            <div 
              onClick={() => setViewMode('photos')}
              className="relative w-full h-36 sm:h-44 rounded-xl overflow-hidden border border-amber-500/30 bg-slate-950 shadow-lg group cursor-pointer"
              title="Clic para explorar galería fotográfica en alta definición"
            >
              <img 
                src={activeImageUrl} 
                alt={activeLoc.name} 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/history/casa_corregidora_queretaro.jpg';
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-amber-200">
                <span className="font-semibold truncate">{activeLoc.name}</span>
                <span className="bg-black/70 px-2 py-0.5 rounded border border-amber-400/40 text-[9px] shrink-0 font-mono text-amber-300 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>{activeMedia.gallery.length} {activeMedia.gallery.length === 1 ? 'Foto' : 'Fotos'}</span>
                </span>
              </div>
            </div>

            {/* Botones de Exploración Rápida */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setViewMode('photos')}
                className={`py-2 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  viewMode === 'photos'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                    : 'bg-white/5 hover:bg-white/10 text-amber-200 border-amber-500/30'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Fotos Reales</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`py-2 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  viewMode === 'map'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                    : 'bg-white/5 hover:bg-white/10 text-amber-200 border-amber-500/30'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Ver en Mapa</span>
              </button>
            </div>

            {/* Botón de Acción Principal */}
            <button
              type="button"
              onClick={() => setViewMode(prev => prev === 'photos' ? 'map' : 'photos')}
              className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer shadow-md ${
                viewMode === 'photos'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black border-amber-300 shadow-amber-500/20'
              }`}
            >
              {viewMode === 'photos' ? (
                <>
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span>Regresar a Vista de Mapa Satelital</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Explorar Galería de Fotos Reales ({activeMedia.gallery.length})</span>
                </>
              )}
            </button>

            <p className="text-xs text-amber-200/90 leading-relaxed font-serif line-clamp-3">
              {activeLoc.significance}
            </p>
          </div>

          <div className="pt-3 border-t border-amber-500/15 flex items-center justify-between text-[11px] text-amber-400/70">
            <div className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              <span>Haz clic en los hitos para ver sus fotos y ubicación geográfica</span>
            </div>
            <a 
              href={googleMapsExternalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-amber-300 hover:underline flex items-center gap-1 font-mono"
            >
              <span>Abrir en Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Tira Horizontal de Hitos Históricos con Miniaturas Responsivas */}
      <div className="space-y-2 pt-2">
        <h5 className="text-xs font-black uppercase text-amber-300 tracking-wide">
          Hitos Geográficos del Personaje ({locations.length} Ubicaciones):
        </h5>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {locations.map((loc, idx) => {
            const isSelected = loc.id === activeLoc.id || loc.name === activeLoc.name;
            const locMedia = resolveLocationMedia(loc);
            const thumbImg = locMedia.primaryImage;

            return (
              <button
                key={loc.id || idx}
                type="button"
                onClick={() => {
                  setActiveLoc(loc);
                  setSelectedPhotoIndex(0);
                  setZoomLevel(15);
                }}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                  isSelected 
                    ? 'bg-amber-500/25 border-amber-400 shadow-lg shadow-amber-500/20 scale-[1.01]' 
                    : 'bg-black/40 hover:bg-black/60 border-amber-500/20 hover:border-amber-500/40'
                }`}
              >
                {/* Miniatura Responsiva */}
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-amber-500/30 bg-slate-950">
                  <img 
                    src={thumbImg} 
                    alt={loc.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/history/casa_corregidora_queretaro.jpg';
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-bold truncate ${isSelected ? 'text-amber-200' : 'text-slate-200'}`}>
                    {loc.name}
                  </p>
                  <p className="text-[10px] text-amber-400/70 truncate font-mono">
                    {loc.stateOrCountry}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
