'use client';

import React, { useState, useEffect } from 'react';
import { useBrandTheme } from '@/context/brand-theme-context';

export const BrandCustomizerModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { theme, updateTheme } = useBrandTheme();
  const [colors, setColors] = useState(theme);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && theme) {
      setColors(theme);
    }
  }, [isOpen, theme]);

  if (!isOpen) return null;

  const handleChange = (key: string, val: string) => {
    setColors(prev => ({ ...prev, [key]: val }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await updateTheme(colors);
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Herramientas: Personalización de Marca</h2>
            <p className="text-xs text-slate-500">Configura la paleta institucional de iSkool para tu colegio</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase">Nombre de la Institución</label>
            <input
              type="text"
              value={colors.school_name}
              onChange={(e) => handleChange('school_name', e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600">Color Primario (Header & Navegación)</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="color"
                  value={colors.primary_color}
                  onChange={(e) => handleChange('primary_color', e.target.value)}
                  className="h-10 w-12 cursor-pointer rounded border border-slate-200"
                />
                <span className="text-xs font-mono text-slate-600">{colors.primary_color}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600">Color Secundario (Botones & Acciones)</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="color"
                  value={colors.secondary_color}
                  onChange={(e) => handleChange('secondary_color', e.target.value)}
                  className="h-10 w-12 cursor-pointer rounded border border-slate-200"
                />
                <span className="text-xs font-mono text-slate-600">{colors.secondary_color}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600">Color de Acento (Alertas & Tags)</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="color"
                  value={colors.accent_color}
                  onChange={(e) => handleChange('accent_color', e.target.value)}
                  className="h-10 w-12 cursor-pointer rounded border border-slate-200"
                />
                <span className="text-xs font-mono text-slate-600">{colors.accent_color}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600">Fondo General</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="color"
                  value={colors.background_color}
                  onChange={(e) => handleChange('background_color', e.target.value)}
                  className="h-10 w-12 cursor-pointer rounded border border-slate-200"
                />
                <span className="text-xs font-mono text-slate-600">{colors.background_color}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Cancelar</button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
          >
            {isSaving ? 'Guardando...' : 'Aplicar Estilo Institucional'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrandCustomizerModal;
