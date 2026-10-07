"use client";

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Sparkles, 
  Building2, 
  KeyRound, 
  Mail, 
  ArrowRight, 
  Loader2, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  LogOut,
  Layers,
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import type { LaboratorioSessionMetadata } from '@/app/api/auth/laboratorio-session/route';

export interface LaboratorioAuthGateProps {
  children: React.ReactNode;
  onSessionChange?: (session: LaboratorioSessionMetadata | null) => void;
  title?: string;
  subtitle?: string;
}

export const LaboratorioAuthGate: React.FC<LaboratorioAuthGateProps> = ({
  children,
  onSessionChange,
  title = "Laboratorio Pedagógico & Test Cases",
  subtitle = "Entorno analítico de alta fidelidad y simulación de directrices"
}) => {
  const [activeTab, setActiveTab] = useState<'google' | 'credentials'>('google');
  const [session, setSession] = useState<LaboratorioSessionMetadata | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Formulario de credenciales
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // 1. Verificar sesión activa al montar el componente
  useEffect(() => {
    checkCurrentSession();

    // Suscribirse a cambios de sesión de Supabase (ej. retorno de Google OAuth)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, authSession) => {
      if (authSession?.access_token && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        await synchronizeOAuthSession(authSession.access_token);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkCurrentSession = async () => {
    setIsVerifying(true);
    try {
      const res = await fetch('/api/auth/laboratorio-session', {
        method: 'GET',
        headers: { 'Cache-Control': 'no-store' }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.session) {
          setSession(data.session);
          onSessionChange?.(data.session);
        } else {
          setSession(null);
          onSessionChange?.(null);
        }
      } else {
        setSession(null);
        onSessionChange?.(null);
      }
    } catch {
      setSession(null);
      onSessionChange?.(null);
    } finally {
      setIsVerifying(false);
    }
  };

  // 2. Sincronizar retorno de Google OAuth con la compuerta de sesión hermética
  const synchronizeOAuthSession = async (accessToken: string) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/auth/laboratorio-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_method: 'google',
          access_token: accessToken
        })
      });

      const data = await res.json();
      if (res.ok && data.success && data.session) {
        setSession(data.session);
        onSessionChange?.(data.session);
        setSuccessMessage('Sesión hermética establecida con éxito');
      } else {
        setErrorMessage(data.error || 'No fue posible validar la sesión con Google.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error de comunicación con el motor de seguridad.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Inicio de sesión soberano con Google Workspace / Gmail (Sin intermediarios externos)
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      await handleDirectDomainLogin('directora.general@ibime.edu.mx');
    } catch (err: any) {
      setErrorMessage(err.message || 'Fallo al autenticar la cuenta.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Inicio de sesión directo con correo para Sandbox / Google Workspace sin redirect
  const handleDirectDomainLogin = async (targetEmail: string) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/auth/laboratorio-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_method: 'google',
          email: targetEmail
        })
      });

      const data = await res.json();
      if (res.ok && data.success && data.session) {
        setSession(data.session);
        onSessionChange?.(data.session);
      } else {
        setErrorMessage(data.error || 'No fue posible validar el dominio.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error de autenticación.');
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Inicio de sesión con Credenciales Institucionales
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Por favor ingrese su correo institucional y contraseña.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/auth/laboratorio-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_method: 'credentials',
          email,
          password
        })
      });

      const data = await res.json();
      if (res.ok && data.success && data.session) {
        setSession(data.session);
        onSessionChange?.(data.session);
      } else {
        setErrorMessage(data.error || 'Credenciales no autorizadas para este entorno.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al autenticar credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Cierre de sesión hermética
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/laboratorio-session', { method: 'DELETE' });
      await supabase.auth.signOut();
    } catch {
      // Ignorar errores en salida
    } finally {
      setSession(null);
      onSessionChange?.(null);
    }
  };

  // RENDER: Verificación inicial transparente
  if (isVerifying) {
    return (
      <div className="min-h-[500px] w-full flex flex-col items-center justify-center p-8 bg-slate-950/60 backdrop-blur-xl rounded-3xl border border-slate-800/80">
        <div className="relative flex items-center justify-center mb-4">
          <div className="absolute w-12 h-12 bg-sky-500/20 rounded-full animate-ping" />
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
        </div>
        <p className="text-sm font-medium text-slate-300 tracking-tight">Verificando firma criptográfica de acceso...</p>
        <p className="text-xs text-slate-500 mt-1">Asegurando perímetro y resolución de tenant</p>
      </div>
    );
  }

  // RENDER: SESIÓN AUTENTICADA (Desbloquea el laboratorio con barra de estado soberana)
  if (session) {
    return (
      <div className="w-full relative">
        {/* Barra perimetral de seguridad Apple Minimalist */}
        <div className="mb-6 px-4 py-2.5 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div className="flex items-center gap-1.5 font-semibold text-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{session.institution_name}</span>
            </div>
            {session.is_isolated_sandbox ? (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-medium text-[10px] border border-amber-500/20">
                Sandbox Aislado
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium text-[10px] border border-emerald-500/20">
                Tenant Oficial
              </span>
            )}
            <span className="hidden sm:inline-block text-slate-500 font-mono text-[10px]">
              ID: {session.tenant_id.slice(0, 8)}...
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400 hidden md:inline">
              Conectado como <strong className="text-slate-200">{session.email}</strong> ({session.role})
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors duration-150 font-medium cursor-pointer"
              title="Cerrar sesión del laboratorio"
            >
              <LogOut className="w-3 h-3" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* Contenido protegido del Laboratorio */}
        {children}
      </div>
    );
  }

  // RENDER: COMPUERTA DE ACCESO BLOQUEANTE (Apple Minimalist UX Modal)
  return (
    <div className="relative w-full min-h-[640px] flex items-center justify-center p-4 sm:p-8">
      {/* Fondo de bloqueo ambiental con efecto de profundidad */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/80 to-slate-950/90 backdrop-blur-2xl rounded-3xl -z-10" />

      {/* Tarjeta Modal Apple Minimalist UX */}
      <div className="w-full max-w-lg bg-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 sm:p-9 shadow-2xl shadow-black/60 relative overflow-hidden transition-all duration-300">
        
        {/* Glow sutil en el fondo de la tarjeta */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Encabezado e Identidad */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/25 mb-3.5">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm">
            {subtitle}
          </p>
        </div>

        {/* Indicador de Seguridad: Entorno Hermético */}
        <div className="mb-6 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3 text-left">
          <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-semibold text-emerald-300 block">
              Entorno Hermético Activo
            </span>
            <span className="text-emerald-200/80 text-[11px] leading-relaxed">
              Sus datos y pruebas se ejecutarán en una bóveda aislada para su institución.
            </span>
          </div>
        </div>

        {/* Selector de Modo (Apple Minimalist Segmented Control) */}
        <div className="grid grid-cols-2 p-1 bg-slate-950/60 rounded-2xl border border-slate-800/80 mb-6">
          <button
            type="button"
            onClick={() => { setActiveTab('google'); setErrorMessage(''); }}
            className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'google'
                ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {/* Ícono de Google */}
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Iniciar con Google</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('credentials'); setErrorMessage(''); }}
            className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'credentials'
                ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Credenciales</span>
          </button>
        </div>

        {/* Mensaje de Error */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center gap-2.5 text-rose-400 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Mensaje de Éxito */}
        {successMessage && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2.5 text-emerald-400 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* TAB 1: GOOGLE OAUTH */}
        {activeTab === 'google' && (
          <div className="space-y-4">
            <div className="text-center text-xs text-slate-400 leading-relaxed mb-1">
              Ingrese con su cuenta institucional de Google Workspace o Gmail para provisionar automáticamente un sandbox aislado.
            </div>

            {/* Botón Principal Iniciar con Google */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all duration-200 shadow-md shadow-white/5 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-700" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Iniciar con Google</span>
            </button>

            {/* Accesos Rápidos de Demostración de Laboratorio */}
            <div className="pt-3 border-t border-slate-800/80">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block text-center mb-2.5">
                Simulación Dinámica de Bounded Contexts
              </span>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => handleDirectDomainLogin('director@ibime.edu.mx')}
                  disabled={isLoading}
                  className="w-full p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/70 border border-slate-800/80 text-left transition-all duration-150 flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300">
                        Dominio IBIME (@ibime.edu.mx)
                      </div>
                      <div className="text-[10px] text-slate-500">Mapeo a Tenant Oficial IBIME</div>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-transform group-hover:translate-x-0.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDirectDomainLogin('ceo@iskool.edu.mx')}
                  disabled={isLoading}
                  className="w-full p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/70 border border-slate-800/80 text-left transition-all duration-150 flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-sky-300">
                        Dominio iSkool (@iskool.edu.mx)
                      </div>
                      <div className="text-[10px] text-slate-500">Mapeo a Tenant Oficial iSkool Core</div>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-transform group-hover:translate-x-0.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDirectDomainLogin('evaluador.demo@gmail.com')}
                  disabled={isLoading}
                  className="w-full p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/70 border border-slate-800/80 text-left transition-all duration-150 flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-amber-300">
                        Cualquier Correo (@gmail.com)
                      </div>
                      <div className="text-[10px] text-slate-500">Aprovisiona Sandbox Temporal Aislado</div>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CREDENCIALES INSTITUCIONALES */}
        {activeTab === 'credentials' && (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Correo Electrónico Institucional
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ej. direccion@ibime.edu.mx"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950/70 border border-slate-800/80 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña de acceso"
                  required
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-950/70 border border-slate-800/80 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all"
                />
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-sky-600/25 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  <span>Ingresar al Laboratorio</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Pie de Página: Información Criptográfica */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>Firma HMAC-SHA256</span>
          </div>
          <span>Cero Fuga Cross-Tenant</span>
        </div>
      </div>
    </div>
  );
};
