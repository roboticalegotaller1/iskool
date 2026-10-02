"use client";

import React, { useState, useMemo } from 'react';
import {
  Building2,
  Users,
  Briefcase,
  ShieldCheck,
  Search,
  Plus,
  X,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileText,
  DollarSign,
  Cpu,
  Trash2,
  Sparkles,
  MapPin,
  Mail,
  Award,
  Zap,
  BarChart3,
  Factory,
  Layers,
  ArrowRight,
  RefreshCw,
  Sliders,
  Check
} from 'lucide-react';
import { Institution, UserProfile, Campus } from '@/types';
import { useSchoolAdminStore } from '@/store/useSchoolAdminStore';
import { SchoolStatusSlider } from '@/components/admin/SchoolStatusSlider';
import { CorporateOfficialLogo } from '@/components/brand/CorporateOfficialLogo';

interface CorporateEnterprisesSuperUserStudioProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEnterprise: (enterpriseId: string) => void;
  onTriggerToast?: (message: string) => void;
}

export const CorporateEnterprisesSuperUserStudio: React.FC<CorporateEnterprisesSuperUserStudioProps> = ({
  isOpen,
  onClose,
  onSelectEnterprise,
  onTriggerToast
}) => {
  const [activeTab, setActiveTab] = useState<'enterprises' | 'metrics' | 'payroll_overview'>('enterprises');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('all');

  // Stores
  const institutionsList = useSchoolAdminStore(state => state.institutionsList);
  const campusesList = useSchoolAdminStore(state => state.campusesList);
  const detailedStudents = useSchoolAdminStore(state => state.detailedStudents);
  const teachersList = useSchoolAdminStore(state => state.teachersList);
  const staffPayroll = useSchoolAdminStore(state => state.staffPayroll);
  const subjectsList = useSchoolAdminStore(state => state.subjectsList);
  const toggleSchoolSuspension = useSchoolAdminStore(state => state.toggleSchoolSuspension);
  const deleteInstitution = useSchoolAdminStore(state => state.deleteInstitution);
  const createInstitution = useSchoolAdminStore(state => state.createInstitution);
  const registerStaffAccount = useSchoolAdminStore(state => state.registerStaffAccount);
  const createCampus = useSchoolAdminStore(state => state.createCampus);

  // Filtrar exclusivamente empresas corporativas
  const corporateEnterprises = useMemo(() => {
    return (institutionsList || []).filter(inst =>
      inst.is_corporate_enterprise === true ||
      inst.institution_type === 'corporate' ||
      inst.id.startsWith('emp-')
    );
  }, [institutionsList]);

  // Empresas filtradas por búsqueda e industria
  const filteredEnterprises = useMemo(() => {
    return corporateEnterprises.filter(emp => {
      const matchesSearch = 
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp.cct && emp.cct.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (emp.tax_id && emp.tax_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (emp.ceo_name && emp.ceo_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (emp.corporate_industry && emp.corporate_industry.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesIndustry = 
        filterIndustry === 'all' || 
        (emp.corporate_industry && emp.corporate_industry.toLowerCase().includes(filterIndustry.toLowerCase()));

      return matchesSearch && matchesIndustry;
    });
  }, [corporateEnterprises, searchQuery, filterIndustry]);

  // Métricas consolidadas B2B
  const metrics = useMemo(() => {
    const totalEnterprises = corporateEnterprises.length;
    const activeEnterprises = corporateEnterprises.filter(e => e.status !== 'inactive').length;
    const pausedEnterprises = totalEnterprises - activeEnterprises;

    const totalEmployees = detailedStudents.filter(s =>
      corporateEnterprises.some(e => e.id === s.school_id)
    ).length;

    const totalTrainers = teachersList.filter(t =>
      corporateEnterprises.some(e => e.id === t.school_id)
    ).length;

    const totalCourses = subjectsList.filter(sb =>
      corporateEnterprises.some(e => e.id === sb.school_id)
    ).length;

    const totalPayroll = staffPayroll
      .filter(p => corporateEnterprises.some(e => e.id === p.school_id))
      .reduce((acc, curr) => acc + (curr.net_salary || 0), 0);

    return {
      totalEnterprises,
      activeEnterprises,
      pausedEnterprises,
      totalEmployees,
      totalTrainers,
      totalCourses,
      totalPayroll
    };
  }, [corporateEnterprises, detailedStudents, teachersList, subjectsList, staffPayroll]);

  // Modal Alta Nueva Empresa
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCompanyForm, setNewCompanyForm] = useState({
    name: '',
    corporate_industry: 'Tecnología & Software',
    tax_id: '',
    tagline: '',
    ceo_name: '',
    ceo_email: '',
    headquarters: '',
    phone: '55-4000-8000',
    primary_color: '#0284c7'
  });

  // Modal Confirmación Eliminación
  const [companyToDelete, setCompanyToDelete] = useState<Institution | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyForm.name.trim() || !newCompanyForm.ceo_email.trim()) return;

    const slug = newCompanyForm.name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 18);
    const newSchoolId = `emp-${slug}-${Date.now().toString().slice(-4)}`;
    const campusId = `cmp-${slug}-central`;

    // 1. Crear Institución Corporativa
    const created = createInstitution({
      name: newCompanyForm.name,
      tagline: newCompanyForm.tagline || `Innovación, formación técnica y excelencia operativa en ${newCompanyForm.corporate_industry}.`,
      cct: newCompanyForm.tax_id || `RFC-${slug.toUpperCase()}`,
      address: newCompanyForm.headquarters || 'Ciudad de México, México',
      phone: newCompanyForm.phone,
      website: `https://${slug}.com.mx`,
      coordinatorName: newCompanyForm.ceo_name,
      campusesCount: 1
    });

    const industryKeyMap: Record<string, 'automotive' | 'retail' | 'technology' | 'healthcare' | 'finance' | 'manufacturing' | 'other'> = {
      'Automotriz & Movilidad': 'automotive',
      'Ventas, Retail & Distribución': 'retail',
      'Tecnología, Cloud & Software': 'technology',
      'Manufactura & Energía': 'manufacturing',
      'Farmacéutica & Salud': 'healthcare',
      'Finanzas & Seguros': 'finance'
    };

    useSchoolAdminStore.getState().updateInstitution(created.id, {
      is_corporate_enterprise: true,
      institution_type: 'corporate',
      corporate_industry: industryKeyMap[newCompanyForm.corporate_industry] || 'other',
      tax_id: newCompanyForm.tax_id,
      ceo_name: newCompanyForm.ceo_name,
      employee_count: 0,
      courses_count: 0,
      departments_count: 1,
      branding: {
        primaryColor: newCompanyForm.primary_color,
        accentColor: '#38bdf8'
      }
    });

    // 2. Crear Sede / Planta Principal
    createCampus({
      school_id: created.id,
      name: `Planta Matriz & Hub Corporativo ${newCompanyForm.headquarters ? `(${newCompanyForm.headquarters})` : ''}`.trim(),
      level: 'preparatoria',
      grades: ['Especialización Técnica', 'Liderazgo Operativo'],
      address: newCompanyForm.headquarters || 'Ciudad de México, México',
      phone: newCompanyForm.phone
    });

    // 3. Crear Usuario CEO con role: 'ceo'
    registerStaffAccount({
      first_name: newCompanyForm.ceo_name.split(' ')[0] || 'Director',
      last_name: newCompanyForm.ceo_name.split(' ').slice(1).join(' ') || 'General',
      email: newCompanyForm.ceo_email,
      role: 'ceo' as any,
      school_id: created.id,
      phone: newCompanyForm.phone
    });

    setIsCreateModalOpen(false);
    setNewCompanyForm({
      name: '',
      corporate_industry: 'Tecnología & Software',
      tax_id: '',
      tagline: '',
      ceo_name: '',
      ceo_email: '',
      headquarters: '',
      phone: '55-4000-8000',
      primary_color: '#0284c7'
    });

    if (onTriggerToast) {
      onTriggerToast(`✓ Empresa corporativa "${newCompanyForm.name}" dada de alta exitosamente. Cuenta CEO: ${newCompanyForm.ceo_email}`);
    }
  };

  const handleConfirmDelete = () => {
    if (!companyToDelete) return;
    deleteInstitution(companyToDelete.id);
    if (onTriggerToast) {
      onTriggerToast(`🗑️ Empresa "${companyToDelete.name}" eliminada del sistema corporativo.`);
    }
    setCompanyToDelete(null);
    setDeleteConfirmationText('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-slate-100">
        
        {/* ========================================================= */}
        {/* 1. HEADER EJECUTIVO SUPER USUARIO                         */}
        {/* ========================================================= */}
        <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white border-b border-slate-800 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-700 border border-indigo-400/40 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-900/40">
                <Briefcase size={26} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 bg-indigo-950/80 px-2.5 py-0.5 rounded-md border border-indigo-800/60">
                    Módulo Exclusivo Super Usuario
                  </span>
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/60 flex items-center gap-1">
                    <ShieldCheck size={12} /> B2B Zero-Gamification
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
                  Consola de Empresas Corporativas & Visión CEO
                  <span className="text-xs font-mono font-normal text-slate-400">
                    (ISKOOL-ENTERPRISE-B2B)
                  </span>
                </h2>
                <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                  Aislamiento estricto para clientes corporativos. Gestión de holding, suspensión temporal sin pérdida de datos, y acceso directo a tableros ejecutivos.
                </p>
              </div>
            </div>

            {/* Acciones del encabezado */}
            <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
              >
                <Plus size={16} />
                <span>+ Dar de Alta Empresa</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                title="Cerrar consola"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* KPI Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800/80">
            <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/50">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Empresas Registradas</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl font-black text-white">{metrics.totalEnterprises}</span>
                <span className="text-[10px] text-emerald-400 font-bold">{metrics.activeEnterprises} Activas</span>
                {metrics.pausedEnterprises > 0 && (
                  <span className="text-[10px] text-rose-400 font-bold">({metrics.pausedEnterprises} Pausadas)</span>
                )}
              </div>
            </div>

            <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/50">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Colaboradores en Formación</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl font-black text-indigo-400">{metrics.totalEmployees}</span>
                <span className="text-[10px] text-slate-400">Empleados</span>
              </div>
            </div>

            <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/50">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Instructores Especialistas</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl font-black text-amber-400">{metrics.totalTrainers}</span>
                <span className="text-[10px] text-slate-400">Master Trainers</span>
              </div>
            </div>

            <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/50">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Presupuesto Nómina Mensual</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl font-black text-emerald-400 font-mono">
                  ${(metrics.totalPayroll * 2).toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                </span>
                <span className="text-[10px] text-slate-400">MXN</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. BARRA DE HERRAMIENTAS Y BÚSQUEDA                       */}
        {/* ========================================================= */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 flex-1 min-w-[280px]">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por empresa, RFC, CEO o industria..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <select
              value={filterIndustry}
              onChange={(e) => setFilterIndustry(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl text-xs font-bold outline-none focus:border-indigo-500 shadow-xs"
            >
              <option value="all">Todas las Industrias</option>
              <option value="automotriz">Automotriz & Movilidad</option>
              <option value="ventas">Ventas & Retail</option>
              <option value="tecnolog">Tecnología & Cloud</option>
            </select>
          </div>

          <div className="text-xs text-slate-500 font-semibold">
            Mostrando <strong>{filteredEnterprises.length}</strong> de {corporateEnterprises.length} empresas registradas
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. LISTADO DE EMPRESAS CORPORATIVAS                       */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {filteredEnterprises.length === 0 ? (
            <div className="text-center py-16 px-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
              <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-3 opacity-60" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No se encontraron empresas corporativas</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Ajusta los términos de búsqueda o da de alta una nueva empresa B2B con el botón superior.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {filteredEnterprises.map(emp => {
                const isSuspended = emp.status === 'inactive';
                const empCampuses = campusesList.filter(c => c.school_id === emp.id);
                const empEmployees = detailedStudents.filter(s => s.school_id === emp.id);
                const empTrainers = teachersList.filter(t => t.school_id === emp.id);
                const empCourses = subjectsList.filter(sb => sb.school_id === emp.id);
                const empPayrollRecords = staffPayroll.filter(p => p.school_id === emp.id);
                const empPayrollTotal = empPayrollRecords.reduce((sum, p) => sum + (p.net_salary || 0), 0);
                const isBmw = emp.id === 'emp-bmw' || emp.name.toLowerCase().includes('bmw') || emp.name.toLowerCase().includes('nexus');
                const isRetail = emp.id === 'emp-ventas' || emp.name.toLowerCase().includes('retail') || emp.name.toLowerCase().includes('vanguardia');
                const isTech = emp.id === 'emp-tech' || emp.name.toLowerCase().includes('innovasoft') || emp.name.toLowerCase().includes('technology');

                const cardBorderClass = isSuspended
                  ? 'bg-rose-50/20 dark:bg-rose-950/10 border-rose-300 dark:border-rose-900/50'
                  : isBmw
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-[#0066B1] dark:hover:border-[#0066B1] hover:shadow-lg hover:shadow-[#0066B1]/10'
                  : isRetail
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10';

                const badgeClass = isBmw
                  ? 'bg-sky-50 dark:bg-sky-950/80 text-[#0066B1] dark:text-sky-300 border-sky-200 dark:border-sky-800'
                  : isRetail
                  ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';

                const buttonClass = isBmw
                  ? 'bg-gradient-to-r from-[#00142E] via-[#061E38] to-[#0066B1] hover:from-[#00142E] hover:to-[#004f8a]'
                  : isRetail
                  ? 'bg-gradient-to-r from-[#022C22] via-[#064E3B] to-[#047857] hover:from-[#022C22] hover:to-[#065f46]'
                  : 'bg-gradient-to-r from-[#0B0F19] via-[#1E1B4B] to-[#4F46E5] hover:from-[#0B0F19] hover:to-[#4338ca]';

                return (
                  <div
                    key={emp.id}
                    className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md ${cardBorderClass}`}
                  >
                    {/* Header de la tarjeta de la Empresa */}
                    <div className="p-5 space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {/* Logotipo Vectorial Oficial Blindado (100% Inline SVG Garantizado) */}
                          <div className="h-16 w-20 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-center p-2 shrink-0">
                            <CorporateOfficialLogo 
                              enterpriseId={emp.id} 
                              name={emp.name} 
                              size={44} 
                              variant="emblem_only" 
                            />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${badgeClass}`}>
                                {emp.corporate_industry === 'automotive' || isBmw ? 'Automotriz & Manufactura Avanzada' :
                                 emp.corporate_industry === 'retail' || isRetail ? 'Retail & Cadena de Suministro' :
                                 emp.corporate_industry === 'technology' || isTech ? 'Cloud & Inteligencia Artificial Enterprise' :
                                 (emp.corporate_industry || 'Corporativo B2B')}
                              </span>
                              <span className="font-mono text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                {emp.tax_id || emp.cct || (isBmw ? 'RFC: BGM940315BMW' : isRetail ? 'RFC: GCV110520RET' : 'RFC: IDT210410ID7')}
                              </span>
                            </div>
                            <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                              {emp.name}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {emp.tagline || (isBmw ? 'Planta de Manufactura Avanzada San Luis Potosí & Centro de Ensamble de Baterías' : (isRetail ? 'Líder en Distribución Comercial, Retail Omnicanal y Cadena de Suministro' : 'Infraestructura Cloud, Microservicios & Modelos de IA'))}
                            </p>
                          </div>
                        </div>

                        {/* Slider de Suspensión */}
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <SchoolStatusSlider
                            schoolId={emp.id}
                            schoolName={emp.name}
                            status={emp.status || 'active'}
                            onToggle={() => toggleSchoolSuspension(emp.id)}
                          />
                          <span className="text-[10px] text-slate-400 font-semibold">
                            {isSuspended ? '🔒 Bloqueado' : '✓ En línea'}
                          </span>
                        </div>
                      </div>

                      {/* Métricas clave de la empresa */}
                      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-center">
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                          <span className="text-xs font-black text-slate-900 dark:text-white block">{empCampuses.length || 1}</span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Plantas / Sedes</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                          <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 block">{empEmployees.length}</span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Colaboradores</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                          <span className="text-xs font-black text-amber-600 dark:text-amber-400 block">{empTrainers.length}</span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Instructores</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block">{empCourses.length}</span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Programas</span>
                        </div>
                      </div>

                      {/* Datos de contacto y CEO */}
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">CEO / Titular:</span>
                          <span className="font-bold text-slate-900 dark:text-white">{emp.ceo_name || emp.coordinatorName || (isBmw ? 'Ing. Dirk Dreher' : isRetail ? 'Lic. Mariana Garza Sada' : 'Ing. Carlos Slim Helú')}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Sede Principal:</span>
                          <span className="text-right truncate max-w-[280px]">{emp.address || 'México'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Nómina Quincenal:</span>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            ${(empPayrollTotal > 0 ? empPayrollTotal : (emp.id === 'emp-bmw' ? 221500 : (emp.id === 'emp-ventas' ? 195000 : 185000))).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Botones de Acción */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                      <button
                        onClick={() => {
                          onSelectEnterprise(emp.id);
                          onClose();
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black shadow-sm text-white transition-all cursor-pointer hover:scale-101 ${buttonClass}`}
                      >
                        <Briefcase size={14} />
                        <span>Abrir Portal CEO</span>
                        <ChevronRight size={14} />
                      </button>

                      <button
                        onClick={() => {
                          setCompanyToDelete(emp);
                          setDeleteConfirmationText('');
                        }}
                        className="p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/40 hover:border-rose-400 bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 hover:text-rose-700 text-xs font-black transition-all flex items-center justify-center cursor-pointer shadow-xs shrink-0"
                        title={`Eliminar empresa ${emp.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* 4. MODAL ALTA DE NUEVA EMPRESA                            */}
        {/* ========================================================= */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    <Factory size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black">Dar de Alta Nueva Empresa</h3>
                    <p className="text-xs text-slate-500">Crea una cuenta corporativa B2B con acceso exclusivo de CEO.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateCompany} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre de la Empresa *</label>
                  <input
                    type="text"
                    required
                    value={newCompanyForm.name}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, name: e.target.value })}
                    placeholder="Ej. Grupo Industrial Monterrey, BioTech Labs"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Giro / Industria *</label>
                    <select
                      value={newCompanyForm.corporate_industry}
                      onChange={(e) => setNewCompanyForm({ ...newCompanyForm, corporate_industry: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-bold"
                    >
                      <option value="Automotriz & Movilidad">Automotriz & Movilidad</option>
                      <option value="Ventas, Retail & Distribución">Ventas, Retail & Distribución</option>
                      <option value="Tecnología, Cloud & Software">Tecnología, Cloud & Software</option>
                      <option value="Manufactura & Energía">Manufactura & Energía</option>
                      <option value="Farmacéutica & Salud">Farmacéutica & Salud</option>
                      <option value="Finanzas & Seguros">Finanzas & Seguros</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">RFC / Identificador Fiscal</label>
                    <input
                      type="text"
                      value={newCompanyForm.tax_id}
                      onChange={(e) => setNewCompanyForm({ ...newCompanyForm, tax_id: e.target.value.toUpperCase() })}
                      placeholder="Ej. GIM980315-MX1"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre del CEO / Director *</label>
                    <input
                      type="text"
                      required
                      value={newCompanyForm.ceo_name}
                      onChange={(e) => setNewCompanyForm({ ...newCompanyForm, ceo_name: e.target.value })}
                      placeholder="Ej. Ing. Carlos Garza"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Correo Electrónico del CEO *</label>
                    <input
                      type="email"
                      required
                      value={newCompanyForm.ceo_email}
                      onChange={(e) => setNewCompanyForm({ ...newCompanyForm, ceo_email: e.target.value })}
                      placeholder="ceo@empresa.com"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Planta Principal / Sede</label>
                  <input
                    type="text"
                    value={newCompanyForm.headquarters}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, headquarters: e.target.value })}
                    placeholder="Ej. Parque Industrial Monterrey N.L."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
                  >
                    + Registrar Empresa
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 5. MODAL CONFIRMACIÓN DE ELIMINACIÓN                      */}
        {/* ========================================================= */}
        {companyToDelete && (
          <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-200 dark:border-rose-900/50 text-slate-900 dark:text-slate-100 space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">¿Eliminar Empresa Corporativa?</h3>
                  <p className="text-xs text-slate-500">Esta acción no se puede deshacer.</p>
                </div>
              </div>

              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl text-xs space-y-1">
                <p className="font-bold text-rose-800 dark:text-rose-300">
                  Se eliminará la empresa "{companyToDelete.name}" del catálogo institucional.
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  Para pausar el acceso de colaboradores sin borrar datos, utiliza el botón deslizante de pausa en su lugar.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Escribe el nombre de la empresa para confirmar:
                </label>
                <input
                  type="text"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder={companyToDelete.name}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setCompanyToDelete(null);
                    setDeleteConfirmationText('');
                  }}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={deleteConfirmationText.trim().toLowerCase() !== companyToDelete.name.trim().toLowerCase()}
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-black text-xs rounded-xl transition-all shadow-md shadow-rose-600/20 cursor-pointer"
                >
                  Confirmar Eliminación
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
