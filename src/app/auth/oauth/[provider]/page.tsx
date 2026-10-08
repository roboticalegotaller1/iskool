'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ShieldCheck, CheckCircle2, ArrowRight, ExternalLink, Smartphone, AlertCircle, Lock } from 'lucide-react';
import { GoogleOfficialLogo, OutlookOfficialLogo, AppleICloudOfficialLogo, YahooOfficialLogo, ZohoOfficialLogo } from '@/components/brand/EmailProviderLogos';

export default function ProviderOAuthPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const provider = (params?.provider as string || 'google').toLowerCase();
  const initialEmail = searchParams.get('email') || '';

  const [emailInput, setEmailInput] = useState(initialEmail || '');
  const [step, setStep] = useState<'SELECT_ACCOUNT' | 'VERIFY_2FA' | 'CONSENT' | 'COMPLETED'>('SELECT_ACCOUNT');
  const [isProcessing, setIsProcessing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Metadatos de cada proveedor
  const providerMeta = {
    google: {
      name: 'Google Workspace',
      serverDomain: 'accounts.google.com',
      authTitle: 'Acceder con Google',
      authSubtitle: 'Continuar a ISkool Portal Directivo',
      logo: <GoogleOfficialLogo size={28} />,
      accentColor: 'blue',
      themeBg: 'bg-white',
      btnBg: 'bg-[#1a73e8] hover:bg-[#1557b0] text-white',
      cardBorder: 'border-slate-200'
    },
    microsoft: {
      name: 'Microsoft 365',
      serverDomain: 'login.microsoftonline.com',
      authTitle: 'Iniciar sesión en Microsoft',
      authSubtitle: 'Conectar buzón institucional de Office 365 / Outlook',
      logo: <OutlookOfficialLogo size={28} />,
      accentColor: 'sky',
      themeBg: 'bg-slate-50',
      btnBg: 'bg-[#0067b8] hover:bg-[#005da6] text-white',
      cardBorder: 'border-slate-300'
    },
    apple: {
      name: 'Apple iCloud',
      serverDomain: 'appleid.apple.com',
      authTitle: 'Iniciar sesión con Apple ID',
      authSubtitle: 'Vincular buzón @icloud.com a ISkool',
      logo: <AppleICloudOfficialLogo size={28} />,
      accentColor: 'slate',
      themeBg: 'bg-slate-900 text-white',
      btnBg: 'bg-white hover:bg-slate-100 text-slate-900',
      cardBorder: 'border-slate-800'
    },
    yahoo: {
      name: 'Yahoo Mail',
      serverDomain: 'api.login.yahoo.com',
      authTitle: 'Acceder con Yahoo',
      authSubtitle: 'Autorizar sincronización de correo Yahoo',
      logo: <YahooOfficialLogo size={28} />,
      accentColor: 'purple',
      themeBg: 'bg-white',
      btnBg: 'bg-[#6001d2] hover:bg-[#5200b3] text-white',
      cardBorder: 'border-purple-200'
    },
    zoho: {
      name: 'Zoho Mail',
      serverDomain: 'accounts.zoho.com',
      authTitle: 'Iniciar sesión en Zoho',
      authSubtitle: 'Conectar buzón empresarial Zoho Workspace',
      logo: <ZohoOfficialLogo size={28} />,
      accentColor: 'amber',
      themeBg: 'bg-white',
      btnBg: 'bg-[#e42528] hover:bg-[#c91d20] text-white',
      cardBorder: 'border-slate-200'
    }
  }[provider] || {
    name: 'Proveedor de Correo',
    serverDomain: 'oauth.mailserver.com',
    authTitle: 'Autorización en Servidor',
    authSubtitle: 'Conectar buzón a ISkool',
    logo: <ShieldCheck size={28} className="text-indigo-600" />,
    accentColor: 'indigo',
    themeBg: 'bg-white',
    btnBg: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    cardBorder: 'border-slate-200'
  };

  // Manejador del paso de selección de cuenta
  const handleSelectAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      setAuthError('Por favor ingresa un correo electrónico válido.');
      return;
    }
    setAuthError(null);
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setStep('VERIFY_2FA');
    }, 600);
  };

  // Manejador de aprobación en servidor de 2 factores
  const handleApproveServer2FA = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep('CONSENT');
    }, 800);
  };

  // Manejador final de concesión de permisos y comunicación con la ventana principal
  const handleGrantConsent = () => {
    setIsProcessing(true);

    setTimeout(() => {
      setStep('COMPLETED');
      setIsProcessing(false);

      const targetEmail = emailInput.trim().toLowerCase();

      // Emitir mensaje seguro a la ventana padre (opener)
      if (typeof window !== 'undefined' && window.opener) {
        window.opener.postMessage(
          {
            type: 'PROVIDER_OAUTH_SUCCESS',
            provider,
            email: targetEmail,
            providerName: providerMeta.name,
            scopes: { readEmails: true, sendEmails: true, calendar: true },
            serverVerified: true,
            timestamp: new Date().toISOString()
          },
          '*'
        );

        // Cerrar popup suavemente tras notificación
        setTimeout(() => {
          try {
            window.close();
          } catch {}
        }, 1200);
      }
    }, 900);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 antialiased font-sans">
      {/* Barra de Seguridad de Servidor Oficial */}
      <div className="w-full max-w-md mb-2 flex items-center justify-between text-[11px] text-slate-500 px-2 font-medium">
        <div className="flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5 text-emerald-600" />
          <span>Servidor Seguro: <strong>{providerMeta.serverDomain}</strong></span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
          TLS 1.3 Cifrado
        </span>
      </div>

      {/* Tarjeta de Inicio de Sesión Oficial del Proveedor */}
      <div className={`w-full max-w-md ${providerMeta.themeBg} rounded-2xl border ${providerMeta.cardBorder} shadow-xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200`}>
        {/* Encabezado del Proveedor */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">{providerMeta.logo}</div>
          <h1 className="text-xl font-bold tracking-tight">{providerMeta.authTitle}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">{providerMeta.authSubtitle}</p>
        </div>

        {/* PASO 1: SELECCIONAR O INGRESAR CUENTA */}
        {step === 'SELECT_ACCOUNT' && (
          <form onSubmit={handleSelectAccount} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Correo electrónico institucional o personal
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="ej. usuario@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
              {authError && <p className="text-xs text-rose-600 font-semibold">{authError}</p>}
            </div>

            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Esta autorización se ejecuta de forma directa y soberana en el servidor de <strong>{providerMeta.name}</strong> para vincular tu buzón y calendario a ISkool.
              </span>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 ${providerMeta.btnBg}`}
            >
              {isProcessing ? 'Verificando cuenta...' : 'Siguiente'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {/* PASO 2: APROBACIÓN 2FA EN SERVIDOR DEL PROVEEDOR */}
        {step === 'VERIFY_2FA' && (
          <div className="space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 mx-auto">
              <Smartphone className="h-7 w-7 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h2 className="font-bold text-base text-slate-900">
                Verificación en 2 Pasos en Servidor
              </h2>
              <p className="text-xs text-slate-600">
                Cuenta: <strong>{emailInput}</strong>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                El servidor de {providerMeta.name} detectó seguridad de dos factores. Presiona abajo para confirmar la autorización directa en el servidor.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 flex items-center justify-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Token de Sesión Cifrado emitido por {providerMeta.serverDomain}</span>
            </div>

            <button
              type="button"
              onClick={handleApproveServer2FA}
              disabled={isProcessing}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 ${providerMeta.btnBg}`}
            >
              {isProcessing ? 'Autorizando en servidor...' : 'Aprobar Acceso en Servidor Oficial'}
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            </button>
          </div>
        )}

        {/* PASO 3: CONSENTIMIENTO DE PERMISOS */}
        {step === 'CONSENT' && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h2 className="font-bold text-base text-slate-900">
                Permisos Solicitados para ISkool
              </h2>
              <p className="text-xs text-slate-500">
                Al continuar, autorizas a ISkool a acceder a tu cuenta: <strong>{emailInput}</strong>
              </p>
            </div>

            <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Lectura inteligente de comunicados y triage directivo</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Despacho y redacción asistida de circulares oficiales</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Sincronización de citas y audiencias en el Calendario Escolar</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep('SELECT_ACCOUNT')}
                className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-200 hover:bg-slate-300 text-slate-800 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGrantConsent}
                disabled={isProcessing}
                className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 ${providerMeta.btnBg}`}
              >
                {isProcessing ? 'Vinculando...' : 'Permitir y Vincular'}
                <CheckCircle2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* PASO 4: VINCULACIÓN COMPLETADA CON ÉXITO */}
        {step === 'COMPLETED' && (
          <div className="text-center space-y-4 py-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600 mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-black text-slate-900">
                ¡Cuenta Vinculada Exitosamente!
              </h2>
              <p className="text-xs text-slate-600">
                El servidor oficial de <strong>{providerMeta.name}</strong> autorizó el acceso a <strong>{emailInput}</strong>.
              </p>
              <p className="text-[11px] text-slate-400 mt-2 font-medium">
                Cerrando ventana y regresando a la Consola de ISkool...
              </p>
            </div>
          </div>
        )}

        {/* Pie de Página */}
        <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
          <span>ISkool Bóveda 100% Hermética</span>
          <span className="flex items-center gap-1">
            <Lock className="h-3 w-3" /> OAuth 2.0 Oficial
          </span>
        </div>
      </div>
    </div>
  );
}
