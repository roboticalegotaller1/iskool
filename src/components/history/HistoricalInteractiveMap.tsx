"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Layers, 
  ExternalLink, 
  Compass, 
  Info, 
  Navigation, 
  Maximize2 
} from 'lucide-react';
import { HistoricalKeyLocation } from '@/types/studioBlocks';

export interface HistoricalInteractiveMapProps {
  locations: HistoricalKeyLocation[];
  title?: string;
  characterName?: string;
  className?: string;
}

export const HistoricalInteractiveMap: React.FC<HistoricalInteractiveMapProps> = ({
  locations,
  title = 'Cartografía de Hitos Históricos',
  characterName,
  className = ''
}) => {
  const defaultLoc = locations[0] || {
    id: 'def-1',
    name: 'Santiago de Querétaro',
    stateOrCountry: 'Querétaro, México',
    coordinates: { lat: 20.5930, lng: -100.3920 },
    significance: 'Epicentro histórico de la conspiración de 1810.'
  };

  const [activeLoc, setActiveLoc] = useState<HistoricalKeyLocation>(defaultLoc);
  const [zoomLevel, setZoomLevel] = useState<number>(15);

  // Helper para resolver imagen del lugar con respaldo inteligente
  const resolveLocationImage = (loc: HistoricalKeyLocation): string => {
    if (loc.imageUrl && loc.imageUrl.trim()) return loc.imageUrl;
    if (loc.currentDayPhoto && loc.currentDayPhoto.trim()) return loc.currentDayPhoto;
    
    const n = (loc.name || '').toLowerCase();
    if (n.includes('corregidora') || n.includes('palacio') || n.includes('gobierno') || n.includes('queretaro')) {
      return '/images/history/casa_corregidora_queretaro.jpg';
    }
    if (n.includes('san miguel') || n.includes('allende')) {
      return '/images/history/san_miguel_allende.jpg';
    }
    if (n.includes('dolores') || n.includes('parroquia') || n.includes('hidalgo')) {
      return '/images/history/parroquia_dolores.jpg';
    }
    if (n.includes('panteon') || n.includes('ilustres') || n.includes('mausoleo')) {
      return '/images/history/panteon_queretanos_ilustres.jpg';
    }
    return '/images/history/casa_corregidora_queretaro.jpg';
  };

  const activeImageUrl = resolveLocationImage(activeLoc);

  // OpenStreetMap embed libre de bloqueos X-Frame-Options / CSP
  const delta = 0.015;
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${activeLoc.coordinates.lng - delta}%2C${activeLoc.coordinates.lat - delta * 0.8}%2C${activeLoc.coordinates.lng + delta}%2C${activeLoc.coordinates.lat + delta * 0.8}&layer=mapnik&marker=${activeLoc.coordinates.lat}%2C${activeLoc.coordinates.lng}`;
  const googleMapsExternalUrl = `https://www.google.com/maps/search/?api=1&query=${activeLoc.coordinates.lat},${activeLoc.coordinates.lng}`;

  return (
    <div className={`flex flex-col gap-4 p-4 sm:p-6 rounded-3xl bg-slate-900 border border-amber-500/30 text-white shadow-2xl backdrop-blur-xl ${className}`}>
      {/* Cabecera del Mapa */}
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
              {characterName ? `Lugares emblemáticos en la vida de ${characterName}` : 'Geografía de la Gesta Histórica'}
            </p>
          </div>
        </div>

        {/* Controles de Navegación Externa */}
        <div className="flex items-center gap-2">
          <a 
            href={googleMapsExternalUrl}
            target="_blank" 
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 text-slate-950 font-black text-xs border border-amber-300 shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all"
            title="Abrir satélite y 3D en Google Maps"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-950" />
            <span>Abrir en Google Maps Oficial</span>
          </a>
        </div>
      </div>

      {/* Contenedor Principal: Mapa y Ficha del Hito Activo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Iframe Funcional de OpenStreetMap (Col 7) */}
        <div className="lg:col-span-7 relative h-[320px] sm:h-[400px] rounded-2xl overflow-hidden border border-amber-500/30 shadow-inner bg-slate-950">
          <iframe
            title={`Mapa interactivo de ${activeLoc.name}`}
            src={osmEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            className="w-full h-full filter contrast-105 brightness-95"
          />

          {/* Badge Flotante de Coordenadas */}
          <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-black/85 backdrop-blur-md border border-amber-500/40 text-[10px] text-amber-300 font-mono shadow-lg flex items-center gap-1.5 pointer-events-none">
            <Navigation className="w-3 h-3 text-amber-400" />
            <span>Lat: {activeLoc.coordinates.lat.toFixed(4)}, Lng: {activeLoc.coordinates.lng.toFixed(4)}</span>
          </div>

          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-sm border border-amber-500/30 text-[9px] text-amber-400/80 font-mono">
            Cartografía Georreferenciada Activa
          </div>
        </div>

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
            <div className="relative w-full h-36 sm:h-40 rounded-xl overflow-hidden border border-amber-500/30 bg-slate-950 shadow-lg group">
              <img 
                src={activeImageUrl} 
                alt={activeLoc.name} 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/history/casa_corregidora_queretaro.jpg';
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-amber-200">
                <span className="font-semibold truncate">{activeLoc.name}</span>
                <span className="bg-black/60 px-1.5 py-0.5 rounded border border-amber-400/40 text-[9px] shrink-0 font-mono">Foto Histórica</span>
              </div>
            </div>

            <p className="text-xs text-amber-200/90 leading-relaxed font-serif line-clamp-3">
              {activeLoc.significance}
            </p>
          </div>

          <div className="pt-3 border-t border-amber-500/15 flex items-center justify-between text-[11px] text-amber-400/70">
            <div className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              <span>Haz clic en los otros hitos para navegar</span>
            </div>
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
            const thumbImg = resolveLocationImage(loc);

            return (
              <button
                key={loc.id || idx}
                type="button"
                onClick={() => {
                  setActiveLoc(loc);
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
