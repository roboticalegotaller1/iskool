"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  useWhiteLabelStore, 
  DEFAULT_WHITE_LABEL_CONFIG,
  hexToHsl, 
  hexToRgb,
  applyWhiteLabelCssVariables 
} from '@/store/useWhiteLabelStore';
import { supabase } from '@/lib/supabaseClient';
import { 
  Paintbrush, 
  Image as ImageIcon, 
  Upload, 
  Sparkles, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  ArrowLeft, 
  Eye, 
  GraduationCap, 
  Sliders, 
  ShieldCheck, 
  ExternalLink,
  Info
} from 'lucide-react';

// Paleta de Presets Institucionales Recomendados
const COLOR_PRESETS = [
  { name: 'Azul Zafiro (Oficial)', hex: '#2563EB', description: 'Rigor académico, claridad y estructura' },
  { name: 'Verde Esmeralda', hex: '#059669', description: 'Innovación pedagógica, ciencia y naturaleza' },
  { name: 'Púrpura Sabiduría', hex: '#7C3AED', description: 'Artes, pensamiento abstracto y creatividad' },
  { name: 'Rojo Carmesí', hex: '#DC2626', description: 'Identidad cívica, energía y compromiso' },
  { name: 'Ámbar Dorado', hex: '#D97706', description: 'Excelencia, liderazgo estudiantil y calidez' },
  { name: 'Azul Marino Oxford', hex: '#1E3A8A', description: 'Tradición institucional y alta exigencia' },
  { name: 'Grafito Minimalista', hex: '#334155', description: 'Diseño arquitectónico contemporáneo' },
  { name: 'Turquesa Caribe', hex: '#0D9488', description: 'Comunidad, frescura y colaboración' }
];

// Logotipos de Demostración SVG listos para pruebas instantáneas
const LOGO_PRESETS = [
  {
    name: 'Escudo Heráldico Colegio México',
    url: 'https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?w=128&auto=format&fit=crop&q=80'
  },
  {
    name: 'Instituto Pedagógico Siglo XXI',
    url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=128&auto=format&fit=crop&q=80'
  },
  {
    name: 'Academia de Ciencias y Humanidades',
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=128&auto=format&fit=crop&q=80'
  }
];

export default function WhiteLabelAdminPage() {
  const currentLogoUrl = useWhiteLabelStore(state => state.logoUrl);
  const currentPrimaryColor = useWhiteLabelStore(state => state.primaryColor);
  const currentSchoolName = useWhiteLabelStore(state => state.schoolName);
  const setWhiteLabelConfig = useWhiteLabelStore(state => state.setWhiteLabelConfig);
  const resetWhiteLabel = useWhiteLabelStore(state => state.resetWhiteLabel);

  // Estados locales para edición en vivo
  const [logoUrl, setLogoUrl] = useState(currentLogoUrl);
  const [primaryColor, setPrimaryColor] = useState(currentPrimaryColor);
  const [schoolName, setSchoolName] = useState(currentSchoolName);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincronizar estado local si el store se actualiza
  useEffect(() => {
    setLogoUrl(currentLogoUrl);
    setPrimaryColor(currentPrimaryColor);
    setSchoolName(currentSchoolName);
  }, [currentLogoUrl, currentPrimaryColor, currentSchoolName]);

  // Aplicar temporalmente el color en tiempo real para previsualización inmediata en toda la app
  const handleLiveColorChange = (newHex: string) => {
    setPrimaryColor(newHex);
    applyWhiteLabelCssVariables(newHex);
  };

  // Carga directa de archivo de imagen local (Data URL Base64)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (PNG, JPG, SVG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setLogoUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Guardar configuración en Zustand y persistir opcionalmente en Supabase
  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // 1. Actualizar estado global reactivo en Zustand
      setWhiteLabelConfig({
        logoUrl: logoUrl.trim(),
        primaryColor: primaryColor.trim(),
        schoolName: schoolName.trim()
      });

      // 2. Aplicar inmediatamente al DOM
      applyWhiteLabelCssVariables(primaryColor.trim());

      // 3. Persistir en Supabase (tabla `school_settings`)
      try {
        await supabase
          .from('school_settings')
          .upsert({
            id: '00000000-0000-0000-0000-000000000000',
            name: schoolName.trim() || undefined,
            logo_url: logoUrl.trim() || undefined,
            primary_color: primaryColor.trim(),
            updated_at: new Date().toISOString()
          });
      } catch (dbErr) {
        console.warn('Persistencia local activa (Supabase offline o sin tabla):', dbErr);
      }

      setSaveSuccess(true);
      setStatusMessage('¡Configuración de Marca Blanca guardada y aplicada en tiempo real!');
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error('Error al guardar Marca Blanca:', err);
      alert('Ocurrió un error al guardar la configuración.');
    } finally {
      setIsSaving(false);
    }
  };

  // Restaurar configuración inicial
  const handleReset = () => {
    if (confirm('¿Deseas restaurar la identidad visual predeterminada de ISkool?')) {
      resetWhiteLabel();
      setLogoUrl('');
      setPrimaryColor(DEFAULT_WHITE_LABEL_CONFIG.primaryColor);
      setSchoolName('');
      setStatusMessage('Valores de marca restablecidos a la configuración base.');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const hsl = hexToHsl(primaryColor);
  const rgb = hexToRgb(primaryColor);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 p-4 sm:p-6 lg:p-10">
      
      {/* Contenedor Centrado de Diseño Minimalista */}
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        
        {/* Cabecera de Navegación y Título */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-zinc-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Portal Directivo</span>
              </Link>
              <span className="text-slate-300 dark:text-zinc-700">•</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <Paintbrush className="w-3 h-3" />
                <span>Marca Blanca • Diseño Minimalista</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Personalización Institucional
            </h1>
            <p className="text-sm text-slate-600 dark:text-zinc-400">
              Adapta el logotipo y la paleta cromática de ISkool a la identidad oficial de tu colegio en tiempo real.
            </p>
          </div>

          {/* Botones de Acción Superiores */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs sm:text-sm font-bold transition-all flex items-center gap-2"
              title="Restaurar a los valores por defecto"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restaurar</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl text-white text-xs sm:text-sm font-black shadow-md hover:opacity-95 transition-all flex items-center gap-2 disabled:opacity-60"
              style={{ backgroundColor: primaryColor }}
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Guardando...' : 'Guardar y Aplicar'}</span>
            </button>
          </div>
        </div>

        {/* Notificación de Éxito */}
        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-center gap-3 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-bold">{statusMessage}</span>
          </div>
        )}

        {/* Grid Principal: Configuración a la Izquierda, Previsualización a la Derecha */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* PANEL IZQUIERDO: Formulario de Configuración (Col 7) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* SECCIÓN 1: Logotipo Institucional */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Logotipo del Colegio</h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Reemplaza el isotipo de ISkool en la barra de navegación y certificados.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                    URL de la Imagen (PNG, SVG o JPG)
                  </label>
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://tu-colegio.edu.mx/logo.png"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Subir archivo local */}
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all flex items-center gap-2"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Subir desde mi equipo</span>
                  </button>

                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-all"
                    >
                      Quitar Logotipo
                    </button>
                  )}
                </div>

                {/* Presets de Logotipo */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block mb-2">
                    O prueba un logo de ejemplo:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {LOGO_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setLogoUrl(preset.url)}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 text-left text-xs text-slate-700 dark:text-zinc-300 transition-all flex items-center gap-2 bg-slate-50/40 dark:bg-zinc-800/30"
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
                        <span className="truncate">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: Nombre de la Institución */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Nombre de la Institución</h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Texto que acompaña al logotipo en la cabecera.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                  Nombre Oficial del Colegio o Campus
                </label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="Ej. Colegio Jean Piaget • Campus Norte"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* SECCIÓN 3: Color Principal Institucional */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                  <Paintbrush className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Color Principal (Primary Color)</h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Afecta botones primarios, enlaces activos, bordes de acento e insignias.</p>
                </div>
              </div>

              {/* Selector de Color y Código Hex */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => handleLiveColorChange(e.target.value)}
                    className="w-14 h-14 rounded-2xl cursor-pointer border-2 border-white dark:border-zinc-800 shadow-md p-0.5 bg-transparent"
                    title="Selecciona el color institucional"
                  />
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                      Código Hex
                    </label>
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => handleLiveColorChange(e.target.value)}
                      maxLength={7}
                      className="w-28 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/50 font-mono text-sm uppercase font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400 flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>
                    El valor se inyecta dinámicamente en <code className="font-mono font-bold text-slate-800 dark:text-zinc-200">--brand-primary</code> y en el motor cromático sin recargar la página.
                  </span>
                </div>
              </div>

              {/* Presets Recomendados */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block mb-3">
                  Paleta de Presets Recomendados:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {COLOR_PRESETS.map((preset) => {
                    const isSelected = primaryColor.toUpperCase() === preset.hex.toUpperCase();
                    return (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() => handleLiveColorChange(preset.hex)}
                        className={`p-3 rounded-2xl border text-left transition-all relative ${
                          isSelected
                            ? 'border-slate-900 dark:border-white ring-2 ring-slate-900/10 dark:ring-white/10 shadow-sm'
                            : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <span
                            className="w-4 h-4 rounded-full shadow-xs shrink-0"
                            style={{ backgroundColor: preset.hex }}
                          />
                          <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate">
                            {preset.name.split(' ')[0]}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono block">
                          {preset.hex}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>

          {/* PANEL DERECHO: Previsualización en Tiempo Real / Live Sandbox (Col 5) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="sticky top-6 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-lg space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                  <Eye className="w-4 h-4 text-blue-500" />
                  <span>Previsualización en Tiempo Real</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  En Vivo
                </span>
              </div>

              {/* 1. Cabecera Simulada */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                  1. Barra de Navegación (Header)
                </span>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="Logo Preview"
                        className="w-8 h-8 rounded-lg object-contain bg-white dark:bg-zinc-900 p-0.5 border border-slate-200 dark:border-zinc-700 shadow-xs"
                      />
                    ) : (
                      <GraduationCap className="w-8 h-8" style={{ color: primaryColor }} />
                    )}
                    <div className="min-w-0">
                      <span className="text-sm font-black text-slate-900 dark:text-white block truncate">
                        {schoolName || 'ISkool'}
                      </span>
                      <span className="text-[10px] font-bold block" style={{ color: primaryColor }}>
                        Académico
                      </span>
                    </div>
                  </div>

                  {/* Pestañas simuladas */}
                  <div className="flex items-center gap-1 text-xs">
                    <span 
                      className="px-2.5 py-1 rounded-lg font-bold border shadow-xs"
                      style={{ 
                        backgroundColor: `hsl(${hsl.h} ${hsl.s}% 95%)`, 
                        color: primaryColor,
                        borderColor: primaryColor
                      }}
                    >
                      Misiones
                    </span>
                    <span className="px-2 py-1 text-slate-500 dark:text-zinc-400">
                      Estudio
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Botones Primarios y Secundarios */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                  2. Botones de Acción y Controles
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Botón Primario</span>
                  </button>

                  <button
                    type="button"
                    className="px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    style={{ 
                      borderColor: primaryColor,
                      color: primaryColor,
                      backgroundColor: `hsl(${hsl.h} ${hsl.s}% 97%)`
                    }}
                  >
                    <span>Secundario</span>
                  </button>
                </div>
              </div>

              {/* 3. Tarjeta de Actividad con la Nueva Marca */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                  3. Tarjeta de Desafío o Aula
                </span>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span 
                      className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                      style={{ 
                        backgroundColor: `hsl(${hsl.h} ${hsl.s}% 92%)`,
                        color: primaryColor
                      }}
                    >
                      Fase 5 • NEM 2024
                    </span>
                    <span className="text-xs font-bold text-slate-600 dark:text-zinc-300">
                      +150 XP
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Desafío de Comprensión Lectora e Hidrostática
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Resuelve los enigmas de la sala interactiva para abrir los candados del saber.
                  </p>
                  <div className="pt-1">
                    <div className="w-full bg-slate-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ width: '65%', backgroundColor: primaryColor }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Resumen Técnico del Color */}
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/80 space-y-1 text-[11px] font-mono text-slate-600 dark:text-zinc-400">
                <div className="flex justify-between">
                  <span>HEX:</span>
                  <span className="font-bold text-slate-900 dark:text-zinc-200">{primaryColor}</span>
                </div>
                <div className="flex justify-between">
                  <span>RGB:</span>
                  <span className="font-bold text-slate-900 dark:text-zinc-200">{rgb.rgbString}</span>
                </div>
                <div className="flex justify-between">
                  <span>HSL:</span>
                  <span className="font-bold text-slate-900 dark:text-zinc-200">{hsl.hslString}</span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
