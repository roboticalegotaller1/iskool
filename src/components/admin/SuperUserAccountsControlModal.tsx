'use client';

import React, { useMemo, useState } from 'react';
import {
  ShieldCheck,
  Users,
  Plus,
  Search,
  Key,
  Lock,
  Unlock,
  Trash2,
  Edit2,
  Copy,
  CheckCircle2,
  Building2,
  RefreshCw,
  X,
  Briefcase,
  GraduationCap,
  Wrench,
  Layers,
  Sliders,
} from 'lucide-react';
import { useOrganizationStore } from '@/store/useOrganizationStore';
import { useSchoolAdminStore } from '@/store/useSchoolAdminStore';
import {
  ORG_SUBROLE_CATALOG,
  OrgNodeSubRole,
  OrgPermissions,
  UnifiedSuperUserAccountItem,
  getDefaultPermissionsForSubRole,
  getSubRoleMeta,
  getUnifiedInstitutionAccounts,
  normalizeOrgSchoolId,
  resolveOrgEmailDomain,
} from '@/lib/services/organizationService';

export interface SuperUserInstitutionOption {
  id: string;
  name: string;
  campuses?: { id: string; name: string }[];
}

interface SuperUserAccountsControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSchoolId?: string | 'ALL';
  institutions: SuperUserInstitutionOption[];
}

const PERMISSION_LABELS: { key: keyof OrgPermissions; label: string; short: string }[] = [
  { key: 'holding_sedes', label: '1. Holding & Sedes', short: '1. Holding' },
  { key: 'admisiones_360', label: '2. Admisiones 360°', short: '2. Admisiones' },
  { key: 'calidad_nem_aldea', label: '3. Calidad NEM & Aldea', short: '3. Calidad NEM' },
  { key: 'finanzas_ebitda_sat', label: '4. Finanzas, EBITDA & SAT', short: '4. Finanzas' },
  { key: 'organizacion', label: '5. Organización', short: '5. Organización' },
  { key: 'portal_academico', label: '6. Portal Académico', short: '6. Académico' },
  { key: 'imail_triage', label: '7. iMail & Triage', short: '7. iMail' },
];

export default function SuperUserAccountsControlModal({
  isOpen,
  onClose,
  initialSchoolId = 'ALL',
  institutions,
}: SuperUserAccountsControlModalProps) {
  const graphsBySchool = useOrganizationStore((s) => s.graphsBySchool);
  const addSeatNode = useOrganizationStore((s) => s.addSeatNode);
  const saveAndProvisionNode = useOrganizationStore((s) => s.saveAndProvisionNode);
  const deleteSeatNode = useOrganizationStore((s) => s.deleteSeatNode);
  const recoverNodePassword = useOrganizationStore((s) => s.recoverNodePassword);
  const toggleNodeBlock = useOrganizationStore((s) => s.toggleNodeBlock);

  const staffUsers = useSchoolAdminStore((s) => s.staffUsers);
  const campusesList = useSchoolAdminStore((s) => s.campusesList);
  const updateStaffAccount = useSchoolAdminStore((s) => s.updateStaffAccount);
  const deleteStaffAccount = useSchoolAdminStore((s) => s.deleteStaffAccount);
  const toggleStaffBlock = useSchoolAdminStore((s) => s.toggleStaffBlock);
  const changeStaffPassword = useSchoolAdminStore((s) => s.changeStaffPassword);

  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState<string>(
    initialSchoolId === 'ALL' ? 'ALL' : normalizeOrgSchoolId(initialSchoolId)
  );
  const [categoryFilter, setCategoryFilter] = useState<
    'ALL' | 'administracion' | 'profesor' | 'intendencia_servicios' | 'otros' | 'directorio_staff'
  >('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  // Estado para Crear Nueva Cuenta directamente desde Super Usuario
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newSchoolId, setNewSchoolId] = useState<string>(
    initialSchoolId && initialSchoolId !== 'ALL'
      ? normalizeOrgSchoolId(initialSchoolId)
      : 'sch-test-case'
  );
  const [newSubRole, setNewSubRole] = useState<OrgNodeSubRole>('director_general');
  const [newFirstName, setNewFirstName] = useState('');
  const [newPaternalLastName, setNewPaternalLastName] = useState('');
  const [newMaternalLastName, setNewMaternalLastName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newCampusName, setNewCampusName] = useState('Plantel Central');
  const [newMonthlySalary, setNewMonthlySalary] = useState<number>(35000);

  // Estado para Editar Cuenta existente
  const [editingAccount, setEditingAccount] = useState<UnifiedSuperUserAccountItem | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editPaternalLastName, setEditPaternalLastName] = useState('');
  const [editMaternalLastName, setEditMaternalLastName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editCampusName, setEditCampusName] = useState('');
  const [editSubRole, setEditSubRole] = useState<OrgNodeSubRole>('director_general');
  const [editSalary, setEditSalary] = useState<number>(0);
  const [editPermissions, setEditPermissions] = useState<OrgPermissions>(
    getDefaultPermissionsForSubRole('director_general')
  );
  const [customPasswordInput, setCustomPasswordInput] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (isOpen) {
      const normalizedInit =
        !initialSchoolId || initialSchoolId === 'ALL'
          ? 'ALL'
          : normalizeOrgSchoolId(initialSchoolId);
      setSelectedSchoolFilter(normalizedInit);
      if (normalizedInit !== 'ALL') {
        setNewSchoolId(normalizedInit);
      }
    }
  }, [isOpen, initialSchoolId]);

  const catalogInstitutions = useMemo(() => {
    const map = new Map<string, SuperUserInstitutionOption>();
    const defaults: SuperUserInstitutionOption[] = [
      { id: 'sch-ibime', name: 'Instituto Bilingüe Internacional (IBIME)' },
      { id: 'sch-jjrosseau', name: 'Colegio J.J. Rousseau' },
      { id: 'sch-montessori', name: 'Colegio Montessori' },
      { id: 'sch-test-case', name: 'Laboratorio Pedagógico & Test Cases' },
      { id: 'emp-bmw', name: 'Corporativo Nexus Motors (B2B)' },
      { id: 'emp-ventas', name: 'Vanguardia Retail Group (B2B)' },
      { id: 'emp-tech', name: 'InnovaSoft Enterprise (B2B)' },
    ];
    for (const d of defaults) map.set(d.id, d);
    for (const inst of institutions || []) {
      const normId = normalizeOrgSchoolId(inst.id);
      map.set(normId, { ...inst, id: normId });
    }
    return Array.from(map.values());
  }, [institutions]);

  const getInstitutionName = (schoolId: string) => {
    const norm = normalizeOrgSchoolId(schoolId);
    return catalogInstitutions.find((i) => i.id === norm)?.name || norm;
  };

  const aggregated = useMemo(() => {
    const targetSchoolIds =
      selectedSchoolFilter === 'ALL'
        ? Array.from(
            new Set([
              ...catalogInstitutions.map((i) => i.id),
              ...Object.keys(graphsBySchool || {}).map((k) => normalizeOrgSchoolId(k)),
            ])
          )
        : [normalizeOrgSchoolId(selectedSchoolFilter)];

    let orgTotalCount = 0;
    let orgAdminCount = 0;
    let orgTeacherCount = 0;
    let orgServicesCount = 0;
    let nonOrgStaffCount = 0;
    let totalAccountsCount = 0;
    const allAccounts: UnifiedSuperUserAccountItem[] = [];

    for (const sId of targetSchoolIds) {
      const graph = graphsBySchool[sId];
      const summary = getUnifiedInstitutionAccounts(sId, graph, staffUsers);
      orgTotalCount += summary.orgTotalCount;
      orgAdminCount += summary.orgAdminCount;
      orgTeacherCount += summary.orgTeacherCount;
      orgServicesCount += summary.orgServicesCount;
      nonOrgStaffCount += summary.nonOrgStaffCount;
      totalAccountsCount += summary.totalAccountsCount;
      allAccounts.push(...summary.accounts);
    }

    return {
      orgTotalCount,
      orgAdminCount,
      orgTeacherCount,
      orgServicesCount,
      nonOrgStaffCount,
      totalAccountsCount,
      accounts: allAccounts,
    };
  }, [selectedSchoolFilter, catalogInstitutions, graphsBySchool, staffUsers]);

  const filteredAccounts = useMemo(() => {
    return aggregated.accounts.filter((acc) => {
      if (categoryFilter === 'directorio_staff' && acc.source !== 'directorio_staff') return false;
      if (
        categoryFilter !== 'ALL' &&
        categoryFilter !== 'directorio_staff' &&
        acc.category !== categoryFilter
      ) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchName = acc.fullName.toLowerCase().includes(q);
        const matchEmail = acc.username.toLowerCase().includes(q);
        const matchRole = acc.roleLabel.toLowerCase().includes(q);
        const matchCampus = acc.campusName.toLowerCase().includes(q);
        const matchSchool = getInstitutionName(acc.schoolId).toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchRole && !matchCampus && !matchSchool) return false;
      }
      return true;
    });
  }, [aggregated.accounts, categoryFilter, searchQuery]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setStatusBanner(msg);
    setTimeout(() => {
      setStatusBanner((prev) => (prev === msg ? null : prev));
    }, 3800);
  };

  const handleCopy = (id: string, text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleCreateAccountFromSuperUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirstName.trim()) return;
    const normSchool = normalizeOrgSchoolId(newSchoolId);
    const domain = resolveOrgEmailDomain(normSchool);
    const schoolCampuses = (campusesList || []).filter(
      (c) => normalizeOrgSchoolId(c.school_id) === normSchool
    );
    const campusObj = schoolCampuses.find((c) => c.name === newCampusName) || schoolCampuses[0];
    const resolvedCampusId = campusObj?.id || `cmp-${normSchool}-central`;
    const resolvedCampusName = newCampusName.trim() || campusObj?.name || 'Plantel Central';

    const rawUser = newUsername.trim().toLowerCase();
    const finalUsername = rawUser
      ? rawUser.includes('@')
        ? rawUser
        : `${rawUser}@${domain}`
      : `${newFirstName.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}.${(
          newPaternalLastName.trim() || newSubRole
        )
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')}@${domain}`;

    const createdNode = addSeatNode({
      schoolId: normSchool,
      campusId: resolvedCampusId,
      campusName: resolvedCampusName,
      subRole: newSubRole,
    });

    const meta = getSubRoleMeta(newSubRole);
    saveAndProvisionNode(normSchool, createdNode.nodeId, {
      firstName: newFirstName.trim(),
      paternalLastName: newPaternalLastName.trim(),
      maternalLastName: newMaternalLastName.trim(),
      username: finalUsername,
      campusId: resolvedCampusId,
      campusName: resolvedCampusName,
      monthlyBaseSalaryMxn:
        meta.category === 'profesor' ? 0 : Number(newMonthlySalary) || meta.defaultMonthlyBaseMxn,
      hourlyRateMxn:
        meta.category === 'profesor' ? Number(newMonthlySalary) || meta.defaultHourlyRateMxn : 0,
    });

    setNewFirstName('');
    setNewPaternalLastName('');
    setNewMaternalLastName('');
    setNewUsername('');
    setIsCreatingNew(false);
    showToast(
      `Cuenta "${meta.label}" (${finalUsername}) creada y sincronizada en ${getInstitutionName(normSchool)}.`
    );
  };

  const openEditAccount = (acc: UnifiedSuperUserAccountItem) => {
    setEditingAccount(acc);
    setEditFirstName(acc.firstName);
    setEditPaternalLastName(acc.paternalLastName);
    setEditMaternalLastName(acc.maternalLastName);
    setEditUsername(acc.username);
    setEditCampusName(acc.campusName);
    setEditSubRole(acc.subRole);
    setEditSalary(
      acc.category === 'profesor' ? acc.hourlyRateMxn || 280 : acc.monthlyBaseSalaryMxn || 18500
    );
    setEditPermissions({ ...acc.permissions });
  };

  const handleSaveEditAccount = () => {
    if (!editingAccount) return;
    if (editingAccount.source === 'organizacion_ceo' && editingAccount.nodeId) {
      const meta = getSubRoleMeta(editSubRole);
      saveAndProvisionNode(editingAccount.schoolId, editingAccount.nodeId, {
        firstName: editFirstName.trim(),
        paternalLastName: editPaternalLastName.trim(),
        maternalLastName: editMaternalLastName.trim(),
        username: editUsername.trim().toLowerCase(),
        campusName: editCampusName.trim() || 'Plantel Central',
        subRole: editSubRole,
        permissions: editPermissions,
        monthlyBaseSalaryMxn: meta.category === 'profesor' ? 0 : Number(editSalary) || 0,
        hourlyRateMxn: meta.category === 'profesor' ? Number(editSalary) || 0 : 0,
      });
    } else {
      updateStaffAccount(editingAccount.id, {
        first_name: editFirstName.trim(),
        last_name: [editPaternalLastName.trim(), editMaternalLastName.trim()]
          .filter(Boolean)
          .join(' '),
        email: editUsername.trim().toLowerCase(),
        campus_name: editCampusName.trim() || 'Plantel Central',
      });
    }
    showToast(`Cuenta ${editUsername} actualizada por el Super Usuario.`);
    setEditingAccount(null);
  };

  const handleRegenerateOrChangePassword = (
    acc: UnifiedSuperUserAccountItem,
    customPlain?: string
  ) => {
    if (editingAccount?.id === acc.id) setEditingAccount(null);
    const cleanCustom = (customPlain || '').trim();
    if (acc.source === 'organizacion_ceo' && acc.nodeId) {
      const res = recoverNodePassword(
        acc.schoolId,
        acc.nodeId,
        cleanCustom.length >= 6 ? cleanCustom : undefined
      );
      showToast(
        `Nueva contraseña asignada a ${acc.username}: ${res.newPassword}`
      );
    } else {
      const nextPass = changeStaffPassword(
        acc.id,
        cleanCustom.length >= 6 ? cleanCustom : undefined
      );
      showToast(`Nueva contraseña asignada a ${acc.username}: ${nextPass}`);
    }
    if (cleanCustom) {
      setCustomPasswordInput((prev) => ({ ...prev, [acc.id]: '' }));
    }
  };

  const handleToggleBlockAccount = (acc: UnifiedSuperUserAccountItem) => {
    const nextBlocked = !acc.isBlocked;
    if (acc.source === 'organizacion_ceo' && acc.nodeId) {
      toggleNodeBlock(acc.schoolId, acc.nodeId, nextBlocked);
    } else {
      toggleStaffBlock(acc.id, nextBlocked);
    }
    showToast(
      nextBlocked
        ? `Acceso bloqueado de inmediato para ${acc.username}.`
        : `Cuenta ${acc.username} reactivada exitosamente.`
    );
  };

  const handleDeleteAccount = (acc: UnifiedSuperUserAccountItem) => {
    if (acc.source === 'organizacion_ceo' && acc.nodeId) {
      deleteSeatNode(acc.schoolId, acc.nodeId);
    } else {
      deleteStaffAccount(acc.id);
    }
    showToast(`Cuenta ${acc.username} eliminada permanentemente por el Super Usuario.`);
  };

  return (
    <div
      data-testid="superuser-accounts-control-modal"
      className="fixed inset-0 z-[120] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white border border-slate-200 rounded-[28px] shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header de Control Total del Super Usuario */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-7 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Sincronización en Tiempo Real · 0ms
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
                  Control Total Super Usuario
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight mt-1">
                Centro de Control Total de Cuentas Creadas (CEO & Administración)
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                Toda cuenta creada por cualquier CEO en Administración u Organigrama se refleja al instante aquí con control absoluto.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              data-testid="superuser-modal-new-account-btn"
              onClick={() => setIsCreatingNew((v) => !v)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {isCreatingNew ? 'Cerrar Formulario' : '+ Crear Cuenta desde Super Usuario'}
            </button>
            <button
              type="button"
              data-testid="superuser-modal-close-btn"
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Cerrar Consola"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Banner de Confirmación de Acción */}
        {statusBanner && (
          <div
            data-testid="superuser-accounts-status-banner"
            className="bg-emerald-600 text-white px-6 py-2.5 text-xs font-black flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{statusBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusBanner(null)}
              className="text-white/80 hover:text-white text-xs font-bold"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Barra de Contadores en Vivo y Selector de Institución */}
        <div className="bg-slate-50 px-7 py-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Total Cuentas Creadas
              </div>
              <div
                data-testid="superuser-modal-total-accounts-count"
                className="text-2xl font-black text-slate-900"
              >
                {aggregated.totalAccountsCount}
              </div>
              <div className="text-[10px] font-bold text-indigo-600">
                {aggregated.orgTotalCount} en 5. Organización CEO · {aggregated.nonOrgStaffCount} Staff
              </div>
            </div>

            <div className="bg-white border border-indigo-100 rounded-2xl px-4 py-2.5 shadow-sm">
              <div className="text-[10px] font-black uppercase tracking-wider text-indigo-500 flex items-center gap-1">
                <Briefcase className="w-3 h-3" /> 1) Administración CEO
              </div>
              <div
                data-testid="superuser-modal-admin-accounts-count"
                className="text-2xl font-black text-indigo-700"
              >
                {aggregated.orgAdminCount}
              </div>
              <div className="text-[10px] font-bold text-slate-500">
                Dirección, Finanzas, Coord., Control, Médico, Jurídico
              </div>
            </div>

            <div className="bg-white border border-emerald-100 rounded-2xl px-4 py-2.5 shadow-sm">
              <div className="text-[10px] font-black uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                <GraduationCap className="w-3 h-3" /> 2) Profesores CEO
              </div>
              <div
                data-testid="superuser-modal-teacher-accounts-count"
                className="text-2xl font-black text-emerald-700"
              >
                {aggregated.orgTeacherCount}
              </div>
              <div className="text-[10px] font-bold text-slate-500">
                Portal Académico & Horario
              </div>
            </div>

            <div className="bg-white border border-amber-100 rounded-2xl px-4 py-2.5 shadow-sm">
              <div className="text-[10px] font-black uppercase tracking-wider text-amber-600 flex items-center gap-1">
                <Wrench className="w-3 h-3" /> 3) Servicios & Staff
              </div>
              <div className="text-2xl font-black text-amber-700">
                {aggregated.orgServicesCount + aggregated.nonOrgStaffCount}
              </div>
              <div className="text-[10px] font-bold text-slate-500">
                Intendencia, Transporte, Mant. y General
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="flex flex-col">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                Filtrar por Colegio / Empresa
              </label>
              <select
                data-testid="superuser-modal-school-select"
                value={selectedSchoolFilter}
                onChange={(e) => setSelectedSchoolFilter(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">🌐 Todas las Instituciones ISkool</option>
                {catalogInstitutions.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    🏛️ {inst.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Formulario Desplegable para Crear Cuenta como Super Usuario */}
        {isCreatingNew && (
          <form
            onSubmit={handleCreateAccountFromSuperUser}
            data-testid="superuser-create-account-form"
            className="bg-indigo-50/70 border-b border-indigo-100 px-7 py-4 grid grid-cols-1 md:grid-cols-6 gap-3 items-end"
          >
            <div>
              <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">
                Institución Destino
              </label>
              <select
                data-testid="superuser-new-school-select"
                value={newSchoolId}
                onChange={(e) => setNewSchoolId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-white text-xs font-bold text-slate-800"
              >
                {catalogInstitutions.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">
                Cargo / Categoría CEO
              </label>
              <select
                data-testid="superuser-new-subrole-select"
                value={newSubRole}
                onChange={(e) => setNewSubRole(e.target.value as OrgNodeSubRole)}
                className="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-white text-xs font-bold text-slate-800"
              >
                {ORG_SUBROLE_CATALOG.map((item) => (
                  <option key={item.subRole} value={item.subRole}>
                    {item.category === 'administracion'
                      ? `1) Admin · ${item.label}`
                      : item.category === 'profesor'
                      ? `2) ${item.label}`
                      : item.category === 'intendencia_servicios'
                      ? `3) Servicios · ${item.label}`
                      : `4) ${item.label}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">
                Nombre(s)
              </label>
              <input
                type="text"
                required
                data-testid="superuser-new-firstname-input"
                placeholder="Ej. Fernando"
                value={newFirstName}
                onChange={(e) => setNewFirstName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-white text-xs font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">
                Apellido Paterno
              </label>
              <input
                type="text"
                data-testid="superuser-new-lastname-input"
                placeholder="Ej. Villaseñor"
                value={newPaternalLastName}
                onChange={(e) => setNewPaternalLastName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-white text-xs font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">
                Usuario / Correo (Opcional)
              </label>
              <input
                type="text"
                data-testid="superuser-new-username-input"
                placeholder={`usuario@${resolveOrgEmailDomain(newSchoolId)}`}
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-white text-xs font-bold text-slate-800"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                data-testid="superuser-submit-new-account-btn"
                className="w-full px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
              >
                Crear y Sincronizar
              </button>
            </div>
          </form>
        )}

        {/* Barra de Búsqueda y Filtro por Categoría */}
        <div className="px-7 py-3 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: `Todas (${aggregated.totalAccountsCount})` },
              { id: 'administracion', label: `1) Administración (${aggregated.orgAdminCount})` },
              { id: 'profesor', label: `2) Profesor (${aggregated.orgTeacherCount})` },
              {
                id: 'intendencia_servicios',
                label: `3) Intendencia y Servicios (${aggregated.orgServicesCount})`,
              },
              {
                id: 'directorio_staff',
                label: `Staff General (${aggregated.nonOrgStaffCount})`,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategoryFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  categoryFilter === tab.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              data-testid="superuser-accounts-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, cargo, correo, plantel..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Lista de Cuentas Creadas con Control Total del Super Usuario */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50/60">
          {filteredAccounts.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-black text-slate-700">
                No hay cuentas registradas con los filtros seleccionados.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Cuando el CEO cree una cuenta en 5. Organización (1. Administración, 2. Profesor, 3. Intendencia o 4. Otros), aparecerá reflejada aquí de forma inmediata.
              </p>
            </div>
          ) : (
            filteredAccounts.map((acc) => {
              const isEditingThis = editingAccount?.id === acc.id;
              return (
                <div
                  key={`${acc.schoolId}-${acc.id}`}
                  data-testid={`superuser-account-row-${acc.id}`}
                  className={`bg-white border rounded-2xl p-4 shadow-sm transition-all ${
                    acc.isBlocked
                      ? 'border-rose-300 bg-rose-50/30'
                      : acc.source === 'organizacion_ceo'
                      ? 'border-indigo-200/80 hover:border-indigo-300'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                    {/* Columna 1: Identidad, Cargo, Institución y Estado */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-indigo-300" />
                          {getInstitutionName(acc.schoolId)}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                            acc.category === 'administracion'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : acc.category === 'profesor'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {acc.roleLabel}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-600">
                          📍 {acc.campusName}
                        </span>
                        {acc.source === 'organizacion_ceo' && (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
                            Creada en 5. Organización CEO
                          </span>
                        )}
                        {acc.isBlocked ? (
                          <span
                            data-testid={`superuser-account-status-${acc.id}`}
                            className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase bg-rose-100 text-rose-700 border border-rose-300"
                          >
                            ⛔ Bloqueada por Super Usuario
                          </span>
                        ) : (
                          <span
                            data-testid={`superuser-account-status-${acc.id}`}
                            className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase bg-emerald-100 text-emerald-700 border border-emerald-200"
                          >
                            ● Activa
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                        <div className="text-sm font-black text-slate-900">{acc.fullName}</div>
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-indigo-700 bg-indigo-50/70 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                          <span>{acc.username}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(`usr-${acc.id}`, acc.username)}
                            className="text-indigo-500 hover:text-indigo-800 cursor-pointer"
                            title="Copiar usuario"
                          >
                            {copiedId === `usr-${acc.id}` ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-mono font-black text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                          <Key className="w-3.5 h-3.5 text-amber-600" />
                          <span data-testid={`superuser-account-password-${acc.id}`}>
                            {acc.passwordPreview}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(`pwd-${acc.id}`, acc.passwordPreview)}
                            className="text-amber-600 hover:text-amber-900 cursor-pointer"
                            title="Copiar contraseña"
                          >
                            {copiedId === `pwd-${acc.id}` ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Permisos de Módulos Activos */}
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        {PERMISSION_LABELS.map((perm) => {
                          const enabled = Boolean(acc.permissions?.[perm.key]);
                          return (
                            <span
                              key={perm.key}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                enabled
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
                              }`}
                            >
                              {perm.short}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Columna 2: Botonera Quirúrgica de Control Total del Super Usuario */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
                        <input
                          type="text"
                          data-testid={`superuser-custom-pass-input-${acc.id}`}
                          placeholder="Nueva clave..."
                          value={customPasswordInput[acc.id] || ''}
                          onChange={(e) =>
                            setCustomPasswordInput((prev) => ({
                              ...prev,
                              [acc.id]: e.target.value,
                            }))
                          }
                          className="w-24 px-2 py-1 text-xs font-mono bg-white rounded-lg border border-slate-200 outline-none"
                        />
                        <button
                          type="button"
                          data-testid={`superuser-regen-pass-btn-${acc.id}`}
                          onClick={() =>
                            handleRegenerateOrChangePassword(acc, customPasswordInput[acc.id])
                          }
                          className="px-2.5 py-1 text-[11px] font-black text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
                          title="Asignar clave escrita o regenerar clave intercalada de 6 caracteres"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          {customPasswordInput[acc.id]?.trim() ? 'Fijar Clave' : 'Regenerar 6 Car.'}
                        </button>
                      </div>

                      <button
                        type="button"
                        data-testid={`superuser-edit-account-btn-${acc.id}`}
                        onClick={() =>
                          isEditingThis ? setEditingAccount(null) : openEditAccount(acc)
                        }
                        className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-black flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        {isEditingThis ? 'Cerrar Edición' : 'Editar & Permisos'}
                      </button>

                      <button
                        type="button"
                        data-testid={`superuser-toggle-block-btn-${acc.id}`}
                        onClick={() => handleToggleBlockAccount(acc)}
                        className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 border cursor-pointer ${
                          acc.isBlocked
                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                        }`}
                      >
                        {acc.isBlocked ? (
                          <>
                            <Unlock className="w-3.5 h-3.5" /> Reactivar
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" /> Bloquear
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        data-testid={`superuser-delete-account-btn-${acc.id}`}
                        onClick={() => handleDeleteAccount(acc)}
                        className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-black flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Eliminar
                      </button>
                    </div>
                  </div>

                  {/* Panel Inline de Edición Quirúrgica (Nombre, Cargo, Sede, Usuario, Sueldo y 7 Permisos) */}
                  {isEditingThis && (
                    <div
                      data-testid={`superuser-edit-panel-${acc.id}`}
                      className="mt-4 pt-4 border-t border-slate-200 bg-slate-50 rounded-xl p-4 space-y-4"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">
                            Nombre(s)
                          </label>
                          <input
                            type="text"
                            data-testid={`superuser-edit-firstname-${acc.id}`}
                            value={editFirstName}
                            onChange={(e) => setEditFirstName(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">
                            Apellido Paterno
                          </label>
                          <input
                            type="text"
                            data-testid={`superuser-edit-paternal-${acc.id}`}
                            value={editPaternalLastName}
                            onChange={(e) => setEditPaternalLastName(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">
                            Apellido Materno
                          </label>
                          <input
                            type="text"
                            value={editMaternalLastName}
                            onChange={(e) => setEditMaternalLastName(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">
                            Usuario / Correo
                          </label>
                          <input
                            type="text"
                            data-testid={`superuser-edit-username-${acc.id}`}
                            value={editUsername}
                            onChange={(e) => setEditUsername(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">
                            Cargo / Sub-rol
                          </label>
                          <select
                            value={editSubRole}
                            onChange={(e) => setEditSubRole(e.target.value as OrgNodeSubRole)}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold"
                          >
                            {ORG_SUBROLE_CATALOG.map((item) => (
                              <option key={item.subRole} value={item.subRole}>
                                {item.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">
                            Plantel / Sede
                          </label>
                          <input
                            type="text"
                            value={editCampusName}
                            onChange={(e) => setEditCampusName(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold"
                          />
                        </div>
                      </div>

                      {acc.source === 'organizacion_ceo' && (
                        <div>
                          <div className="text-[10px] font-black text-slate-500 uppercase mb-2 flex items-center gap-1">
                            <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                            Control de Permisos de Módulos (Super Usuario)
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                            {PERMISSION_LABELS.map((perm) => {
                              const active = Boolean(editPermissions[perm.key]);
                              return (
                                <button
                                  key={perm.key}
                                  type="button"
                                  onClick={() =>
                                    setEditPermissions((prev) => ({
                                      ...prev,
                                      [perm.key]: !prev[perm.key],
                                    }))
                                  }
                                  className={`px-2.5 py-2 rounded-xl text-[11px] font-black border text-left transition-all cursor-pointer ${
                                    active
                                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {perm.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingAccount(null)}
                          className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-600"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          data-testid={`superuser-save-edit-btn-${acc.id}`}
                          onClick={handleSaveEditAccount}
                          className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider shadow-md cursor-pointer"
                        >
                          Guardar Cambios de Super Usuario
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

