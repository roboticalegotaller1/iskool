"use client";

import React, { useState } from 'react';
import { KeyRound, ShieldCheck, AlertCircle, Lock, Eye, EyeOff } from 'lucide-react';

interface FirstLoginPasswordRotationModalProps {
  username: string;
  currentTempPassword: string;
  onCompleteRotation: (newPersonalPassword: string) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
}

export function FirstLoginPasswordRotationModal({
  username,
  currentTempPassword,
  onCompleteRotation,
  onCancel,
}: FirstLoginPasswordRotationModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanNew = newPassword.trim();
    const cleanConfirm = confirmPassword.trim();

    if (cleanNew.length < 6) {
      setErrorMsg('La nueva contraseña personal debe tener al menos 6 caracteres.');
      return;
    }
    if (cleanNew !== cleanConfirm) {
      setErrorMsg('Las contraseñas no coinciden. Verifíquelas por favor.');
      return;
    }
    if (cleanNew === currentTempPassword.trim()) {
      setErrorMsg('Debe ingresar una contraseña nueva distinta a la clave temporal entregada por el CEO.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await onCompleteRotation(cleanNew);
      if (!res.success) {
        setErrorMsg(res.error || 'No se pudo establecer la nueva contraseña.');
        setIsSaving(false);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error al guardar su nueva contraseña.');
      setIsSaving(false);
    }
  };

  return (
    <div
      data-testid="first-login-password-rotation-modal"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 text-slate-800"
      >
        <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">
              Primer Ingreso · Nueva Contraseña Personal
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Por seguridad institucional, defina su clave personal para continuar.
            </p>
          </div>
        </div>

        <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <span className="text-slate-500 font-semibold">Usuario: </span>
          <span className="font-mono font-bold text-slate-900">{username}</span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nueva contraseña personal
            </label>
            <div className="relative">
              <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPass ? 'text' : 'password'}
                data-testid="rotation-new-password-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Confirmar nueva contraseña
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              data-testid="rotation-confirm-password-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita su nueva contraseña"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600"
            />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-900">
          <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            Al activar su nueva clave, <strong>la contraseña inicial entregada por el CEO dejará de funcionar permanentemente</strong>.
          </span>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs font-semibold text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            data-testid="rotation-submit-btn"
            disabled={isSaving}
            className="px-4 py-2.5 rounded-xl bg-[#1D68FF] hover:bg-blue-700 text-white font-bold text-xs shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isSaving ? 'Actualizando clave...' : 'Establecer Contraseña e Ingresar'}
          </button>
        </div>
      </form>
    </div>
  );
}

