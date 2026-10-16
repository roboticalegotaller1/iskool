"use client";

import React, { useState, useEffect } from 'react';
import {
  WorkOsSeedAccount,
  WorkOsTestScenario,
  SEED_TEST_SCENARIOS
} from '@/lib/services/workOs/workOsTypes';
import { WorkOsService } from '@/lib/services/workOs/workOsService';
import {
  Building2,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Save,
  Server,
  Zap,
  Globe2,
  Play,
  RotateCcw,
  Sliders,
  ChevronDown,
  Info,
  Lock,
  Unlock,
  Radio,
  FileText
} from 'lucide-react';

interface SeedAccountsConfigPanelProps {
  tenantId: string;
  isCeo: boolean;
  currentUserEmail?: string;
  onScenarioInjected?: (task: any) => void;
  onTriggerToast: (msg: string) => void;
}

export const SeedAccountsConfigPanel: React.FC<SeedAccountsConfigPanelProps> = ({
  tenantId,
  isCeo,
  currentUserEmail,
  onScenarioInjected,
  onTriggerToast
}) => {
  const [seeds, setSeeds] = useState<WorkOsSeedAccount[]>([]);
  const [activeScenarioMenu, setActiveScenarioMenu] = useState<string | null>(null);
  const [selectedScenarioDetails, setSelectedScenarioDetails] = useState<WorkOsTestScenario | null>(null);
  const [isInjecting, setIsInjecting] = useState<string | null>(null);

  // Cargar seeds
  useEffect(() => {
    const loaded = WorkOsService.getSeedAccounts(tenantId);
    setSeeds(loaded);
  }, [tenantId]);

  // Guardar cambios en una seed específica
  const handleSaveSeed = (seedKey: string) => {
    const nameInput = document.getElementById(`seed-name-${seedKey}`) as HTMLInputElement;
    const personalEmailInput = document.getElementById(`seed-personal-${seedKey}`) as HTMLInputElement;
    const deptEmailInput = document.getElementById(`seed-dept-${seedKey}`) as HTMLInputElement;
    const slaInput = document.getElementById(`seed-sla-${seedKey}`) as HTMLSelectElement;

    const res = WorkOsService.updateSeedAccount(
      tenantId,
      seedKey,
      {
        delegateName: nameInput?.value,
        personalEmail: personalEmailInput?.value,
        departmentAccount: deptEmailInput?.value,
        slaHours: slaInput ? Number(slaInput.value) : undefined
      },
      isCeo
    );

    if (res.success && res.updatedSeed) {
      setSeeds(prev => prev.map(s => s.sectionKey === seedKey ? res.updatedSeed! : s));
      onTriggerToast(`✅ Configuración de ${res.updatedSeed.sectionName} guardada exitosamente.`);
    } else {
      alert(res.error || 'Error al guardar configuración.');
    }
  };

  // Conmutar entre sistema simulado y cuenta real
  const handleToggleRealMode = (seedKey: string, toReal: boolean) => {
    const updated = WorkOsService.toggleSeedAccountMode(tenantId, seedKey, toReal);
    if (updated) {
      setSeeds(prev => prev.map(s => s.sectionKey === seedKey ? updated : s));
      onTriggerToast(
        toReal
          ? `🌐 ${updated.sectionName} conmutada a Cuenta Real (POP/IMAP/SMTP).`
          : `🧪 ${updated.sectionName} conmutada a Sistema Interno Simulado.`
      );
    }
  };

  // Probar enrutamiento (simulación de email entrante)
  const handleTestRouting = (seed: WorkOsSeedAccount) => {
    const sampleScenario = SEED_TEST_SCENARIOS.find(s => s.seedKey === seed.sectionKey);
    if (sampleScenario) {
      handleInjectScenario(sampleScenario);
    } else {
      onTriggerToast(`🧪 Enrutamiento verificado: Petición enviada a ${seed.departmentAccount} (SLA: ${seed.slaHours}h).`);
    }
  };

  // Inyectar uno de los 5 escenarios de prueba de la seed
  const handleInjectScenario = (scenario: WorkOsTestScenario) => {
    setIsInjecting(scenario.id);
    setTimeout(() => {
      const task = WorkOsService.injectScenario(tenantId, scenario.id);
      setIsInjecting(null);
      setActiveScenarioMenu(null);
      setSelectedScenarioDetails(null);

      if (task) {
        onScenarioInjected?.(task);
        onTriggerToast(`🚀 Escenario ejecutado: "${scenario.title}" inyectado en el Work OS.`);
      }
    }, 400);
  };

  return (
    <div className="space-y-6">
      
      {/* Banner Superior Explicativo de Matriz de Permisos */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-900 border border-indigo-200 dark:border-indigo-800/60 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-black tracking-tight text-slate-900 dark:text-slate-100">
              Plantilla de Cuentas Seed y Enrutamiento por Departamento
            </h3>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
              isCeo ? 'bg-indigo-600 text-white' : 'bg-amber-100 text-amber-800'
            }`}>
              {isCeo ? '👑 Modo CEO (Control Total)' : '👤 Modo Delegado (Edición Personal)'}
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
            {isCeo
              ? 'Como Director General (CEO), usted cuenta con permisos plenos para modificar nombres de departamento, plazos SLA y correos departamentales. Cada cuenta puede conmutarse a un servidor real en cualquier momento.'
              : 'Usted puede actualizar su nombre y correo personal de contacto. La cuenta departamental general y los plazos SLA son administrados por Dirección General para garantizar la estandarización institucional.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-mono font-bold bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            5 Cuentas · 25 Escenarios
          </span>
        </div>
      </div>

      {/* Grid de Tarjetas de Cuentas Seed (Alineadas visualmente a Imagen 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {seeds.map((seed) => {
          const scenarios = SEED_TEST_SCENARIOS.filter(s => s.seedKey === seed.sectionKey);
          const isUserAuthorizedToEdit = isCeo || (currentUserEmail && currentUserEmail.toLowerCase() === seed.departmentAccount.toLowerCase());

          return (
            <div
              key={seed.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative"
            >
              {/* Encabezado de la Tarjeta */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                  <div>
                    <h4 className="font-black text-sm text-slate-900 dark:text-slate-100">
                      {seed.sectionName}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ID: {seed.sectionKey}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                    SLA: {seed.slaHours}h
                  </span>

                  {/* Conmutador Simulado / Real */}
                  <button
                    type="button"
                    onClick={() => handleToggleRealMode(seed.sectionKey, !seed.isRealAccountSwapped)}
                    disabled={!isCeo}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-60 ${
                      seed.isRealAccountSwapped
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300'
                    }`}
                    title={seed.isRealAccountSwapped ? 'Conectado a servidor de correo real' : 'Operando con sistema interno simulado'}
                  >
                    {seed.isRealAccountSwapped ? <Server className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
                    <span>{seed.isRealAccountSwapped ? 'Real' : 'Simulado'}</span>
                  </button>
                </div>
              </div>

              {/* Formulario de Parámetros */}
              <div className="space-y-3 text-xs">
                
                {/* Nombre del Responsable */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Nombre del Responsable / Delegado(a):
                  </label>
                  <input
                    type="text"
                    id={`seed-name-${seed.sectionKey}`}
                    defaultValue={seed.delegateName}
                    disabled={!isUserAuthorizedToEdit}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                  />
                </div>

                {/* Correo Departamental General (Inmutable para asignados, editable por CEO) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      Correo de Enrutamiento / Delegación:
                    </label>
                    {!isCeo && (
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Fijo por Dirección
                      </span>
                    )}
                  </div>
                  <input
                    type="email"
                    id={`seed-dept-${seed.sectionKey}`}
                    defaultValue={seed.departmentAccount}
                    disabled={!isCeo}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                  />
                </div>

                {/* Correo Personal del Delegado (Editable por el asignado) */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Correo Personal de Notificación Directa:
                  </label>
                  <input
                    type="email"
                    id={`seed-personal-${seed.sectionKey}`}
                    defaultValue={seed.personalEmail}
                    disabled={!isUserAuthorizedToEdit}
                    placeholder="usuario@ibime.edu.mx"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                  />
                </div>

                {/* Plazo SLA y Palabras Clave */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Plazo de Resolución (SLA):
                    </label>
                    <select
                      id={`seed-sla-${seed.sectionKey}`}
                      defaultValue={seed.slaHours}
                      disabled={!isCeo}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                    >
                      <option value={12}>12 Horas (Urgente)</option>
                      <option value={24}>24 Horas (Estándar)</option>
                      <option value={48}>48 Horas (Trámites)</option>
                      <option value={72}>72 Horas (Extendido)</option>
                    </select>
                  </div>

                  <div className="flex flex-col justify-end">
                    <span className="text-[10px] text-slate-400 block mb-1">Palabras clave:</span>
                    <div className="truncate text-[10px] text-slate-500 dark:text-slate-400 font-mono bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                      {seed.keywords.slice(0, 3).join(', ')}...
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de Acción de la Tarjeta */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTestRouting(seed)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Ejecutar prueba de enrutamiento con caso real"
                  >
                    <span>🧪</span>
                    <span>Probar Enrutamiento</span>
                  </button>

                  {/* Menú de los 5 Escenarios de Prueba */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setActiveScenarioMenu(activeScenarioMenu === seed.sectionKey ? null : seed.sectionKey)}
                      className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                      title="Ver 5 escenarios de prueba realistas para esta cuenta"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>5 Escenarios</span>
                      <ChevronDown className="h-3 w-3" />
                    </button>

                    {/* Desplegable de los 5 Escenarios */}
                    {activeScenarioMenu === seed.sectionKey && (
                      <div className="absolute left-0 bottom-full mb-2 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 space-y-1 animate-in fade-in zoom-in-95">
                        <div className="px-2 py-1 border-b border-slate-100 dark:border-slate-800 text-[11px] font-black text-slate-700 dark:text-slate-300 flex items-center justify-between">
                          <span>5 Casos de Prueba en Vivo</span>
                          <span className="text-[10px] text-indigo-600 font-mono">1 Clic</span>
                        </div>
                        {scenarios.map((scen, idx) => (
                          <button
                            key={scen.id}
                            type="button"
                            onClick={() => handleInjectScenario(scen)}
                            disabled={isInjecting === scen.id}
                            className="w-full text-left p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-xs transition-colors cursor-pointer group flex items-start gap-2"
                          >
                            <span className="font-black text-indigo-600 dark:text-indigo-400 shrink-0">#{idx + 1}</span>
                            <div className="min-w-0">
                              <span className="font-bold line-clamp-1 text-slate-800 dark:text-slate-100 group-hover:text-indigo-600">
                                {scen.title}
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate">
                                {scen.senderName} · {scen.urgency}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSaveSeed(seed.sectionKey)}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
