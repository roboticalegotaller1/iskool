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
  const [mapType, setMapType] = useState<'m' | 'k'>('m'); // 'm' = Roadmap, 'k' = Satelital
  const [zoomLevel, setZoomLevel] = useState<number>(14);

  // Generar URL funcional de Google Maps sin cuotas de clave externa
  const embedUrl = `https://maps.google.com/maps?q=${activeLoc.coordinates.lat},${activeLoc.coordinates.lng}&hl=es&z=${zoomLevel}&t=${mapType}&output=embed`;

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

        {/* Controles de Capa Satelital / Terreno */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMapType(mapType === 'm' ? 'k' : 'm')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
              mapType === 'k' 
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20' 
                : 'bg-white/10 hover:bg-white/20 text-amber-300 border-amber-500/30'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{mapType === 'k' ? 'Vista Satelital' : 'Vista Cartográfica'}</span>
          </button>

          <a 
            href={`https://www.google.com/maps/search/?api=1&query=${activeLoc.coordinates.lat},${activeLoc.coordinates.lng}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 border border-amber-500/30 transition-all"
            title="Abrir en ventana completa de Google Maps"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Contenedor Principal: Mapa y Ficha del Hito Activo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Iframe Funcional de Google Maps (Col 8) */}
        <div className="lg:col-span-8 relative h-[320px] sm:h-[400px] rounded-2xl overflow-hidden border border-amber-500/30 shadow-inner bg-slate-950">
          <iframe
            title={`Mapa de ${activeLoc.name}`}
            src={embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full filter contrast-105"
          />

          {/* Badge Flotante de Coordenadas */}
          <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-black/80 backdrop-blur-md border border-amber-500/40 text-[10px] text-amber-300 font-mono shadow-lg flex items-center gap-1.5 pointer-events-none">
            <Navigation className="w-3 h-3 text-amber-400" />
            <span>Lat: {activeLoc.coordinates.lat.toFixed(4)}, Lng: {activeLoc.coordinates.lng.toFixed(4)}</span>
          </div>
        </div>

        {/* Ficha Detallada del Hito Seleccionado (Col 4) */}
        <div className="lg:col-span-4 flex flex-col justify-between p-4 rounded-2xl bg-black/50 border border-amber-500/20 overflow-hidden">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Hito Activo
              </span>
              <span className="text-[11px] text-amber-400/80 font-mono">
                {activeLoc.stateOrCountry}
              </span>
            </div>

            <h4 className="text-base font-black text-amber-100 leading-snug">
              {activeLoc.name}
            </h4>

            {activeLoc.imageUrl && (
              <div className="w-full h-28 rounded-xl overflow-hidden border border-amber-500/20 bg-slate-950">
                <img 
                  src={activeLoc.imageUrl} 
                  alt={activeLoc.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <p className="text-xs text-amber-200/80 leading-relaxed font-serif">
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

      {/* Tira Horizontal de Hitos Históricos (Selector Rápido) */}
      <div className="space-y-2 pt-2">
        <h5 className="text-xs font-black uppercase text-amber-300 tracking-wide">
          Hitos Geográficos del Personaje ({locations.length} Ubicaciones):
        </h5>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {locations.map((loc) => {
            const isSelected = loc.id === activeLoc.id;
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => {
                  setActiveLoc(loc);
                  setZoomLevel(15);
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                  isSelected 
                    ? 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/10' 
                    : 'bg-black/30 hover:bg-black/50 border-amber-500/20 hover:border-amber-500/40'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  isSelected ? 'bg-amber-400 text-slate-950' : 'bg-white/10 text-amber-400'
                }`}>
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-bold truncate ${isSelected ? 'text-amber-200' : 'text-slate-200'}`}>
                    {loc.name}
                  </p>
                  <p className="text-[10px] text-amber-400/60 truncate">
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
