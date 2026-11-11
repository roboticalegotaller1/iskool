"use client";

import React, { useState, useMemo } from 'react';
import {
  X,
  Copy,
  Check,
  RefreshCw,
  CalendarClock,
  ShieldCheck,
  Mail,
  Plus,
  Building2,
  Sparkles,
  History,
} from 'lucide-react';
import {
  OrgPermissions,
  OrgSeatNode,
  SavedSubjectCatalogItem,
  SUBJECT_CONTOUR_PALETTE,
  TeacherSubjectAssignment,
  resolveSubjectContourColor,
} from '@/lib/services/organizationService';

interface CampusOption {
  id: string;
  name: string;
}

interface NodeConfigureModalProps {
  node: OrgSeatNode;
  campuses: CampusOption[];
  savedSubjects: SavedSubjectCatalogItem[];
  teacherWeeklyHours: number;
  onRecoverPassword: (nodeId: string) => { newPassword: string; updatedNode: OrgSeatNode | null };
  onCloseAndAutoProvision: (
    nodeId: string,
    patch: {
      firstName: string;
      paternalLastName: string;
      maternalLastName: string;
      username: string;
      campusId: string;
      campusName: string;
      permissions: OrgPermissions;
      subjects: TeacherSubjectAssignment[];
      hourlyRateMxn: number;
      monthlyBaseSalaryMxn: number;
      slaHours: number;
    },
    openTimetableAfterClose?: boolean
  ) => void;
}

const PERMISSION_LABELS: Array<{ key: keyof OrgPermissions; label: string }> = [
  { key: 'holding_sedes', label: 'Holding & Sedes' },
  { key: 'admisiones_360', label: 'Admisiones 360°' },
  { key: 'calidad_nem_aldea', label: 'Calidad NEM & Aldea' },
  { key: 'finanzas_ebitda_sat', label: 'Finanzas, EBITDA & SAT' },
  { key: 'organizacion', label: 'Organización' },
  { key: 'portal_academico', label: 'Portal Académico' },
  { key: 'imail_triage', label: 'iMail & Triage' },
];

export function NodeConfigureModal({
  node,
  campuses,
  savedSubjects = [],
  teacherWeeklyHours,
  onRecoverPassword,
  onCloseAndAutoProvision,
}: NodeConfigureModalProps) {
  const [firstName, setFirstName] = useState(node.firstName);
  const [paternalLastName, setPaternalLastName] = useState(node.paternalLastName);
  const [maternalLastName, setMaternalLastName] = useState(node.maternalLastName);
  const [username, setUsername] = useState(node.username);
  const [campusId, setCampusId] = useState(node.campusId || campuses[0]?.id || 'cmp-test-pri');
  const [permissions, setPermissions] = useState<OrgPermissions>({ ...node.permissions });
  const [hourlyRateMxn, setHourlyRateMxn] = useState<number>(node.hourlyRateMxn || 260);
  const [monthlyBaseSalaryMxn, setMonthlyBaseSalaryMxn] = useState<number>(
    node.monthlyBaseSalaryMxn || 18000
  );
  const [slaHours, setSlaHours] = useState<number>(node.slaHours || 12);

  const [displayedPassword, setDisplayedPassword] = useState<string | null>(
    node.tempPasswordPreview
  );
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [activeAutocompleteIdx, setActiveAutocompleteIdx] = useState<number | null>(null);
  const [showPreservedEmails, setShowPreservedEmails] = useState(false);

  const [subjects, setSubjects] = useState<TeacherSubjectAssignment[]>(() => {
    if (node.category !== 'profesor') return [];
    if (node.subjects && node.subjects.length > 0) {
      return node.subjects.map((s, idx) => ({
        ...s,
        teachAnother: idx < node.subjects.length - 1 ? true : Boolean(s.teachAnother),
      }));
    }
    return [
      {
        id: `subj-row-${Date.now()}-0`,
        subjectName: '',
        contourColor: SUBJECT_CONTOUR_PALETTE[0],
        teachAnother: false,
      },
    ];
  });

  const selectedCampusName = useMemo(() => {
    return campuses.find((c) => c.id === campusId)?.name || node.campusName || 'Plantel Central';
  }, [campuses, campusId, node.campusName]);

  const handleCopyPassword = async () => {
    if (!displayedPassword) return;
    try {
      await navigator.clipboard.writeText(displayedPassword);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    } catch {
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  const handleRecoverPassword = () => {
    const res = onRecoverPassword(node.nodeId);
    if (res.newPassword) {
      setDisplayedPassword(res.newPassword);
      setCopiedPassword(false);
    }
  };

  const handleTogglePermission = (key: keyof OrgPermissions) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubjectNameChange = (index: number, value: string) => {
    setSubjects((prev) =>
      prev.map((row, idx) => {
        if (idx !== index) return row;
        const resolvedColor = resolveSubjectContourColor(value, savedSubjects, idx);
        return {
          ...row,
          subjectName: value,
          contourColor: resolvedColor,
        };
      })
    );
  };

  const handleToggleTeachAnother = (index: number, checked: boolean) => {
    if (checked) {
      setSubjects((prev) => {
        const next = prev.map((r, i) => (i === index ? { ...r, teachAnother: true } : r));
        // Si es la última fila, anexar una nueva fila en blanco debajo con su color de contorno distinto
        if (index === prev.length - 1) {
          const usedColors = new Set(next.map((s) => s.contourColor));
          const nextColor =
            SUBJECT_CONTOUR_PALETTE.find((c) => !usedColors.has(c)) ||
            SUBJECT_CONTOUR_PALETTE[next.length % SUBJECT_CONTOUR_PALETTE.length];
          next.push({
            id: `subj-row-${Date.now()}-${next.length}`,
            subjectName: '',
            contourColor: nextColor,
            teachAnother: false,
          });
        }
        return next;
      });
    } else {
      // Si se desmarca y la siguiente fila estaba en blanco, retirarla limpiamente
      setSubjects((prev) => {
        const next = prev.map((r, i) => (i === index ? { ...r, teachAnother: false } : r));
        if (index === prev.length - 2 && !prev[prev.length - 1].subjectName.trim()) {
          return next.slice(0, -1);
        }
        return next;
      });
    }
  };

  const handleCancelExtraSubjectRow = (index: number) => {
    setSubjects((prev) => {
      if (prev.length <= 1) return prev;
      const filtered = prev.filter((_, idx) => idx !== index);
      return filtered.map((row, idx) => ({
        ...row,
        teachAnother: idx < filtered.length - 1,
      }));
    });
  };

  const commitClose = (openTimetableAfterClose = false) => {
    const cleanedSubjects =
      node.category === 'profesor'
        ? subjects.filter((s, idx) => idx === 0 || s.subjectName.trim().length > 0)
        : [];

    onCloseAndAutoProvision(
      node.nodeId,
      {
        firstName,
        paternalLastName,
        maternalLastName,
        username,
        campusId,
        campusName: selectedCampusName,
        permissions,
        subjects:
          node.category === 'profesor'
            ? cleanedSubjects.length > 0
              ? cleanedSubjects
              : subjects.slice(0, 1)
            : [],
        hourlyRateMxn,
        monthlyBaseSalaryMxn,
        slaHours,
      },
      openTimetableAfterClose
    );
  };

  return (
    <div
      data-testid="org-node-configure-modal"
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          commitClose(false);
        }
      }}
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800">
        {/* Cabecera Limpia con Continuidad de Asiento (nodeId inmutable) */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/70 shrink-0">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Configurar {node.roleTitle}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {node.accountTier === 'tipo_2' ? 'Cuenta Tipo 2 · Servicios' : 'Cuenta Institucional'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-500 bg-white border border-slate-200">
                Nodo Persistente #{node.nodeId.slice(-6)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Al cerrar esta ventana la cuenta se crea o actualiza automáticamente y se reporta al Superusuario.
            </p>
          </div>
          <button
            type="button"
            data-testid="close-and-provision-node-btn"
            onClick={() => commitClose(false)}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
            title="Cerrar y guardar cuenta automáticamente"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Cuerpo del Formulario (Campos Exactos 1 a 8) */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* 1, 2 y 3: Nombre, Apellido paterno, Apellido materno */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                1) Nombre
              </label>
              <input
                type="text"
                data-testid="org-input-first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ej. Alejandro"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                2) Apellido paterno
              </label>
              <input
                type="text"
                data-testid="org-input-paternal"
                value={paternalLastName}
                onChange={(e) => setPaternalLastName(e.target.value)}
                placeholder="Ej. Mendoza"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                3) Apellido materno
              </label>
              <input
                type="text"
                data-testid="org-input-maternal"
                value={maternalLastName}
                onChange={(e) => setMaternalLastName(e.target.value)}
                placeholder="Ej. Peña"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600"
              />
            </div>
          </div>

          {/* 4: Usuario + Sede / Plantel */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-7">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                4) Usuario institucional
              </label>
              <input
                type="text"
                data-testid="org-input-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="usuario@laboratoriopedagogico.edu.mx"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600"
              />
            </div>
            <div className="sm:col-span-5">
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-blue-600" />
                <span>Plantel / Sede adscrita</span>
              </label>
              <select
                data-testid="org-select-campus"
                value={campusId}
                onChange={(e) => setCampusId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600"
              >
                {campuses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 5: Contraseña Automática Intercalada (3 números 0-9 + 3 letras Mayús/Minús) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <span className="text-[11px] font-bold text-slate-700 block">
                  5) Contraseña automática del sistema (3 dígitos y 3 letras intercaladas)
                </span>
                <span className="text-[11px] text-slate-500">
                  El CEO no la redacta. En el primer ingreso el colaborador deberá definir una nueva y esta dejará de funcionar.
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {displayedPassword ? (
                  <div
                    data-testid="org-generated-password-badge"
                    className="px-3.5 py-1.5 rounded-xl bg-white border border-blue-200 font-mono text-sm font-black tracking-widest text-slate-900 shadow-2xs select-all"
                  >
                    {displayedPassword}
                  </div>
                ) : (
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800">
                    ✓ Clave personal activa (inicial anulada)
                  </div>
                )}

                {displayedPassword && (
                  <button
                    type="button"
                    data-testid="org-copy-password-btn"
                    onClick={handleCopyPassword}
                    className="p-2 rounded-xl bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                    title="Copiar contraseña inmediatamente"
                  >
                    {copiedPassword ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-600" />
                        <span className="text-emerald-700 text-[11px]">Copiada</span>
                      </>
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                )}

                <button
                  type="button"
                  data-testid="org-recover-password-btn"
                  onClick={handleRecoverPassword}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-blue-600" />
                  <span>Recuperar contraseña</span>
                </button>
              </div>
            </div>

            {node.previousCollaborators.length > 0 && (
              <div className="pt-2 border-t border-slate-200/70 flex items-center gap-2 text-[11px] text-indigo-700">
                <History className="h-3.5 w-3.5 shrink-0" />
                <span>
                  Continuidad del puesto activa: este nodo conserva el 100% del historial de{' '}
                  <strong>{node.previousCollaborators.length}</strong> colaborador(es) previo(s).
                </span>
              </div>
            )}
          </div>

          {/* 6: Permisos Modulares (7 Checkboxes con iMail & Triage activo por default) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                <span>6) Permisos de acceso modular</span>
              </label>
              <span className="text-[10px] font-semibold text-slate-400">
                iMail &amp; Triage habilitado por defecto
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PERMISSION_LABELS.map((perm) => {
                const checked = Boolean(permissions[perm.key]);
                return (
                  <label
                    key={perm.key}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      checked
                        ? 'bg-blue-50/60 border-blue-200 text-slate-900'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      data-testid={`org-perm-${perm.key}`}
                      checked={checked}
                      onChange={() => handleTogglePermission(perm.key)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span>{perm.label}</span>
                  </label>
                );
              })}
            </div>

            {/* Aviso No Destructivo cuando se desmarca iMail & Triage */}
            {!permissions.imail_triage && (
              <div
                data-testid="org-imail-revoked-preservation-banner"
                className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900"
              >
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">
                      Sincronización pausada para el usuario · Cero borrado de correos
                    </span>
                    <span className="text-[11px] text-amber-800">
                      La cuenta pierde sincronización activa, pero los{' '}
                      {node.imailMailbox.preservedHistoricalEmails.length} correos históricos siguen visibles para el CEO.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPreservedEmails((v) => !v)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-[11px] font-bold text-amber-900 hover:bg-amber-100 shrink-0 cursor-pointer"
                >
                  {showPreservedEmails ? 'Ocultar correos' : 'Ver archivo CEO'}
                </button>
              </div>
            )}

            {showPreservedEmails && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                {node.imailMailbox.preservedHistoricalEmails.map((mail) => (
                  <div key={mail.id} className="p-2 rounded-lg bg-white border border-slate-200/80">
                    <div className="font-bold text-slate-800">{mail.subject}</div>
                    <div className="text-[11px] text-slate-500">{mail.snippet}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 7: Materias Ilimitadas (SOLO para cuentas de Profesor) */}
          {node.category === 'profesor' && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                  <span>7) Materia(s) asignadas (con catálogo autodesplegable y contorno único)</span>
                </label>
                <span className="text-[10px] font-semibold text-slate-500">
                  Sin límite de materias · 1 solo profesor en Finanzas
                </span>
              </div>

              <div className="space-y-2.5">
                {subjects.map((subj, idx) => {
                  const query = subj.subjectName.trim().toLowerCase();
                  const matchingSaved = savedSubjects.filter((item) =>
                    !query ? true : item.name.toLowerCase().includes(query)
                  );

                  return (
                    <div
                      key={subj.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-2.5 relative"
                    >
                      <div className="relative flex-1">
                        <input
                          type="text"
                          data-testid={`org-subject-input-${idx}`}
                          value={subj.subjectName}
                          onFocus={() => setActiveAutocompleteIdx(idx)}
                          onBlur={() => setTimeout(() => setActiveAutocompleteIdx(null), 160)}
                          onChange={(e) => handleSubjectNameChange(idx, e.target.value)}
                          placeholder={
                            idx === 0
                              ? 'Escribe o elige una materia (ej. Matemáticas)...'
                              : `Materia adicional #${idx + 1}...`
                          }
                          style={{
                            borderColor: subj.contourColor,
                            boxShadow: `inset 4px 0 0 0 ${subj.contourColor}`,
                          }}
                          className="w-full pl-3.5 pr-3 py-2 rounded-xl border-2 bg-white text-sm font-semibold text-slate-900 focus:outline-none"
                        />

                        {/* Menú Auto Desplegable de Materias Guardadas */}
                        {activeAutocompleteIdx === idx && matchingSaved.length > 0 && (
                          <div
                            data-testid={`org-subject-autocomplete-${idx}`}
                            className="absolute left-0 right-0 top-full mt-1 z-30 bg-white rounded-xl border border-slate-200 shadow-lg py-1 max-h-40 overflow-y-auto"
                          >
                            {matchingSaved.map((catItem) => (
                              <button
                                key={catItem.id}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  setSubjects((prev) =>
                                    prev.map((r, rIdx) =>
                                      rIdx === idx
                                        ? {
                                            ...r,
                                            subjectName: catItem.name,
                                            contourColor: catItem.contourColor,
                                          }
                                        : r
                                    )
                                  );
                                  setActiveAutocompleteIdx(null);
                                }}
                                className="w-full px-3 py-1.5 text-left text-xs font-semibold text-slate-800 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                              >
                                <span className="flex items-center gap-2">
                                  <span
                                    className="h-2.5 w-2.5 rounded-full shrink-0"
                                    style={{ backgroundColor: catItem.contourColor }}
                                  />
                                  <span>{catItem.name}</span>
                                </span>
                                <span className="text-[10px] text-slate-400">Guardada</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Check a lado de materia indicando si da otra materia */}
                      <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shrink-0 cursor-pointer">
                        <input
                          type="checkbox"
                          data-testid={`org-teach-another-check-${idx}`}
                          checked={Boolean(subj.teachAnother)}
                          onChange={(e) => handleToggleTeachAnother(idx, e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 cursor-pointer"
                        />
                        <span>¿Da otra materia?</span>
                      </label>

                      {/* Tache rojo al final de blank/línea agregada para indicar que se equivocó y borrar el agregar más materias */}
                      {idx > 0 && (
                        <button
                          type="button"
                          data-testid={`org-remove-subject-red-x-${idx}`}
                          onClick={() => handleCancelExtraSubjectRow(idx)}
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors shrink-0 cursor-pointer"
                          title="Cancelar / eliminar esta línea de materia"
                        >
                          <X className="h-4 w-4 stroke-[2.6]" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Parámetros Financieros Recurrentes y SLA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            {node.category === 'profesor' ? (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Tarifa por hora clase (MXN · Enlace Recurrente Finanzas)
                </label>
                <input
                  type="number"
                  min={50}
                  step={10}
                  value={hourlyRateMxn}
                  onChange={(e) => setHourlyRateMxn(Number(e.target.value) || 260)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-mono text-slate-900"
                />
              </div>
            ) : (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Sueldo mensual recurrente (MXN · Enlace Finanzas)
                </label>
                <input
                  type="number"
                  min={1000}
                  step={500}
                  value={monthlyBaseSalaryMxn}
                  onChange={(e) => setMonthlyBaseSalaryMxn(Number(e.target.value) || 16000)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-mono text-slate-900"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Tiempo de respuesta compromiso (Horas)
              </label>
              <input
                type="number"
                min={1}
                max={72}
                value={slaHours}
                onChange={(e) => setSlaHours(Number(e.target.value) || 12)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-mono text-slate-900"
              />
            </div>
          </div>

          {/* 8: Botón Horario (SOLO para cuentas de Profesor) */}
          {node.category === 'profesor' && (
            <div className="pt-1">
              <button
                type="button"
                data-testid="org-open-teacher-schedule-btn"
                onClick={() => commitClose(true)}
                className="w-full py-3 px-4 rounded-xl bg-[#1D68FF] hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CalendarClock className="h-4 w-4" />
                <span>
                  8) Configurar Horario Escolar ({teacherWeeklyHours} hrs/sem consolidadas en Finanzas)
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Pie Limpio */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-slate-500">
            {node.category === 'profesor'
              ? '✓ Portal Académico docente + Tiempo de respuesta + Nómina Recurrente sincronizados'
              : '✓ Cuenta vinculada a Tiempo de respuesta + Nómina Recurrente + Superusuario'}
          </span>
          <button
            type="button"
            data-testid="org-save-and-close-btn"
            onClick={() => commitClose(false)}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Guardar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

