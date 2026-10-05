import React, { useState, useEffect } from 'react';
import { EmployeeProfile, ScreenId } from '../../types';
import { EMPLOYEES_DATA } from '../../data/mockData';
import { UserAvatar } from '../UserAvatar';
import { QuickGuideBanner } from '../QuickGuideBanner';
import { employeesApi } from '../../services/api';

interface EmpleadosScreenProps {
  onNavigate: (screen: ScreenId) => void;
  selectedEmployeeId?: string;
  onOpenEvaluationModal?: (employee: EmployeeProfile) => void;
  /** Se llama cuando el usuario elige otra persona de la lista (la URL es la fuente de verdad). */
  onChangeEmployee?: (employeeId: string) => void;
}

export const EmpleadosScreen: React.FC<EmpleadosScreenProps> = ({
  onNavigate,
  selectedEmployeeId = 'lucas',
  onOpenEvaluationModal,
  onChangeEmployee,
}) => {
  const activeEmpId = selectedEmployeeId;
  const setActiveEmpId = (id: string) => onChangeEmployee?.(id);
  const [employees, setEmployees] = useState<EmployeeProfile[]>(EMPLOYEES_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    employeesApi
      .getAll()
      .then((res) => {
        if (isMounted && res.data && res.data.length > 0) {
          setEmployees(res.data);
        }
      })
      .catch(() => {
        // Fallback a EMPLOYEES_DATA
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const activeEmployee =
    employees.find((e) => e.id === activeEmpId || e.empId === activeEmpId) || employees[0] || EMPLOYEES_DATA[0];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleEnroll = () => {
    setEnrolling(true);
    setTimeout(() => {
      setEnrolling(false);
      setEnrolled(true);
      triggerToast('Plan formativo asignado a ' + activeEmployee.name);
    }, 1000);
  };

  const handleDownloadPdf = async () => {
    try {
      triggerToast(`Generando Ficha 360° en PDF para ${activeEmployee.name}...`);
      await employeesApi.downloadPdf(activeEmployee.id, activeEmployee.name);
      triggerToast(`Ficha de ${activeEmployee.name} descargada exitosamente.`);
    } catch {
      window.print();
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedArea('all');
  };

  const filteredEmployees = employees.filter((emp) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      emp.name.toLowerCase().includes(q) ||
      emp.role.toLowerCase().includes(q) ||
      emp.area.toLowerCase().includes(q) ||
      emp.empId.toLowerCase().includes(q);
    const matchesArea = selectedArea === 'all' || emp.area === selectedArea;
    return matchesSearch && matchesArea;
  });

  return (
    <div className="w-full px-6 lg:px-8 py-6 flex flex-col gap-6 pb-20">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-outline-variant/30 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="material-symbols-outlined text-secondary-container">check_circle</span>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Compact Header & Main Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider text-primary font-bold font-headline">
              Gestión de Personas &bull; Colaboradores
            </span>
            <span className="text-outline-variant">•</span>
            <span className="text-xs text-on-surface-variant font-medium">
              Fichas 360° y competencias
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {employees.length} activos
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-black text-on-surface tracking-tight font-headline">
            Directorio y Fichas de Colaboradores
          </h1>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleDownloadPdf}
            className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-bold bg-surface-container text-on-surface hover:bg-surface-container-high border border-outline-variant/40 transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            title="Descargar Ficha 360° en PDF"
          >
            <span className="material-symbols-outlined text-outline text-[16px]">file_download</span>
            Descargar PDF
          </button>
          <button
            onClick={() => onNavigate('reclutamiento')}
            className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-bold bg-primary text-on-primary hover:bg-primary-container transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            Reclutar Talento
          </button>
        </div>
      </div>

      {/* Slim Guide Bar */}
      <QuickGuideBanner
        title="Guía de Navegación de Colaboradores"
        description="Elegí a cualquier colaborador en la lista para ver su información de contacto, supervisor, competencias y evaluaciones."
        tips={[
          'Seleccioná a un empleado del directorio para cargar su ficha 360° completa.',
          'En "Mapa de Habilidades" podés revisar las brechas contra el perfil requerido del puesto.',
          'Hacé clic en "Nueva Evaluación" para abrir el formulario de feedback del ciclo.',
        ]}
        dismissible={true}
      />

      {/* Compact 4-Metric Status Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="bg-surface-container-lowest px-3.5 py-2.5 rounded-xl border border-outline-variant/30 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-outline block">Fuerza Laboral</span>
            <div className="text-base font-black text-on-surface">
              428 <span className="text-[11px] font-normal text-outline">activos</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-secondary-container/40 text-on-secondary-container text-[10px] font-bold">
            +12% vs Q3
          </span>
        </div>

        <div className="bg-surface-container-lowest px-3.5 py-2.5 rounded-xl border border-outline-variant/30 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-outline block">Alineación de Rol</span>
            <div className="text-base font-black text-on-secondary-container">
              91.4% <span className="text-[11px] font-normal text-outline">media</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-secondary-container/30 text-on-secondary-container text-[10px] font-bold">
            Alta efectividad
          </span>
        </div>

        <div className="bg-surface-container-lowest px-3.5 py-2.5 rounded-xl border border-outline-variant/30 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-outline block">Brechas Críticas</span>
            <div className="text-base font-black text-tertiary">
              14 <span className="text-[11px] font-bold text-tertiary">roles</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-error-container/40 text-tertiary text-[10px] font-bold">
            3.2% plantilla
          </span>
        </div>

        <div className="bg-surface-container-lowest px-3.5 py-2.5 rounded-xl border border-outline-variant/30 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-outline block">Puntaje 360°</span>
            <div className="text-base font-black text-primary">
              4.62 <span className="text-[11px] font-normal text-outline">/ 5.0</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-primary-fixed text-primary text-[10px] font-bold">
            Top 5% sector
          </span>
        </div>
      </div>

      {/* Search & Area Filters + Directory Cards */}
      <div className="flex flex-col gap-3">
        <div className="bg-surface-container-lowest p-3 rounded-2xl shadow-2xs border border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80 flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar colaborador por nombre, cargo o ID..."
              className="w-full pl-9 pr-3 py-1.5 bg-surface-container-low text-on-surface placeholder:text-outline rounded-xl text-xs outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all border border-transparent focus:border-outline-variant/40"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-1.5 bg-surface-container-low px-2.5 py-1.5 rounded-xl border border-outline-variant/20">
              <span className="text-[11px] text-outline font-bold">Área:</span>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="bg-transparent text-xs font-semibold text-on-surface outline-none cursor-pointer"
              >
                <option value="all">Todas las áreas</option>
                <option value="Infraestructura & Plataforma">Infraestructura y Plataforma</option>
                <option value="Inteligencia Artificial & Datos">Inteligencia Artificial y Datos</option>
                <option value="Arquitectura Digital & Plataforma">Arquitectura Digital</option>
                <option value="Estrategia de Producto & Negocio">Estrategia de Producto</option>
                <option value="Ciberseguridad & Compliance">Ciberseguridad</option>
              </select>
            </div>

            {(searchQuery || selectedArea !== 'all') && (
              <button
                onClick={resetFilters}
                className="px-2.5 py-1.5 rounded-xl bg-surface-container-low text-on-surface-variant hover:text-primary transition-all flex items-center gap-1 text-xs font-bold cursor-pointer"
                title="Restablecer filtros"
              >
                <span className="material-symbols-outlined text-[15px]">restart_alt</span>
                <span className="hidden sm:inline">Limpiar</span>
              </button>
            )}
          </div>
        </div>

        {/* Directory Cards Grid */}
        {filteredEmployees.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2.5">
            {filteredEmployees.map((emp) => {
              const isSelected = emp.id === activeEmpId;
              return (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => setActiveEmpId(emp.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 relative ${
                    isSelected
                      ? 'bg-primary/10 border-primary ring-2 ring-primary/20 shadow-xs'
                      : 'bg-surface-container-lowest border-outline-variant/30 hover:border-primary/40 hover:bg-surface-container-low'
                  }`}
                >
                  <UserAvatar name={emp.name} size="sm" shape="rounded" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-on-surface truncate block">
                        {emp.name}
                      </span>
                      {isSelected && (
                        <span className="material-symbols-outlined text-primary text-[15px] shrink-0">
                          check_circle
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-primary font-medium truncate block">
                      {emp.role}
                    </span>
                    <span className="text-[10px] text-outline truncate block">
                      {emp.area}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 text-center flex flex-col items-center justify-center gap-2">
            <span className="material-symbols-outlined text-outline text-3xl">person_search</span>
            <p className="text-xs font-bold text-on-surface">No se encontraron colaboradores con los filtros aplicados</p>
            <button
              onClick={resetFilters}
              className="px-3 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold cursor-pointer"
            >
              Ver todos los colaboradores
            </button>
          </div>
        )}
      </div>

      {/* 360° ACTIVE PROFILE CARD */}
      <section className="bg-surface-container-lowest rounded-2xl p-5 lg:p-6 shadow-2xs border border-outline-variant/30 relative overflow-hidden flex flex-col gap-5">
        {/* Profile Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-5 border-b border-outline-variant/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <UserAvatar
              name={activeEmployee.name}
              size="xl"
              shape="rounded"
              showStatus={true}
              statusColor="emerald"
            />
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <h2 className="text-xl sm:text-2xl text-on-surface font-black tracking-tight">
                  {activeEmployee.name}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-secondary-container/30 text-on-secondary-container text-[11px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  {activeEmployee.status}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary text-[11px] font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">military_tech</span>
                  {activeEmployee.badge}
                </span>
              </div>

              <p className="text-sm font-bold text-primary">{activeEmployee.role}</p>

              <div className="flex flex-wrap items-center gap-2.5 mt-1.5 text-on-surface-variant text-xs">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-outline text-[15px]">account_tree</span>
                  <span>{activeEmployee.area}</span>
                </div>
                <span className="text-outline-variant">•</span>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-outline text-[15px]">schedule</span>
                  <span>Antigüedad: {activeEmployee.tenure}</span>
                </div>
                <span className="text-outline-variant">•</span>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-outline text-[15px]">badge</span>
                  <span>ID: {activeEmployee.empId}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto self-stretch lg:self-center justify-end">
            <button
              onClick={() => setShowHistoryModal(true)}
              className="px-3 py-2 bg-surface-container text-on-surface text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-surface-container-high transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-outline text-[16px]">history_edu</span>
              Evaluaciones Anteriores
            </button>
            <button
              onClick={() => {
                if (onOpenEvaluationModal) {
                  onOpenEvaluationModal(activeEmployee);
                } else {
                  triggerToast('Abriendo formulario de evaluación');
                }
              }}
              className="px-3.5 py-2 bg-primary text-on-primary text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs hover:bg-primary-container transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">edit_square</span>
              Nueva Evaluación
            </button>
          </div>
        </div>

        {/* 4 Sleek Info Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-surface-container-low/70 p-3 rounded-xl flex flex-col justify-between border border-outline-variant/20">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase tracking-wider text-outline font-bold">Contacto Corporativo</span>
              <span className="material-symbols-outlined text-primary text-[18px]">alternate_email</span>
            </div>
            <div>
              <span className="text-xs text-on-surface font-bold block truncate" title={activeEmployee.email}>
                {activeEmployee.email}
              </span>
              <span className="text-[11px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[13px] text-secondary">phone_iphone</span>
                {activeEmployee.phone}
              </span>
            </div>
          </div>

          <div className="bg-surface-container-low/70 p-3 rounded-xl flex flex-col justify-between border border-outline-variant/20">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase tracking-wider text-outline font-bold">Estructura Contractual</span>
              <span className="material-symbols-outlined text-primary text-[18px]">contract</span>
            </div>
            <div>
              <span className="text-xs text-on-surface font-bold">{activeEmployee.contract}</span>
              <span className="text-[11px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[13px] text-outline">location_on</span>
                {activeEmployee.location}
              </span>
            </div>
          </div>

          <div className="bg-surface-container-low/70 p-3 rounded-xl flex flex-col justify-between border border-outline-variant/20">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase tracking-wider text-outline font-bold">Compensación &amp; Nivel</span>
              <span className="material-symbols-outlined text-primary text-[18px]">payments</span>
            </div>
            <div>
              <span className="text-xs text-on-surface font-bold">{activeEmployee.salaryBand}</span>
              <span className="text-[11px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[13px] text-on-secondary-container">trending_up</span>
                {activeEmployee.percentile}
              </span>
            </div>
          </div>

          <div className="bg-surface-container-low/70 p-3 rounded-xl flex flex-col justify-between border border-outline-variant/20">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase tracking-wider text-outline font-bold">Supervisión Directa</span>
              <span className="material-symbols-outlined text-primary text-[18px]">supervised_user_circle</span>
            </div>
            <div className="flex items-center gap-2">
              <UserAvatar name={activeEmployee.supervisor.name} size="xs" shape="circle" />
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-on-surface font-bold truncate">
                  {activeEmployee.supervisor.name}
                </span>
                <span className="text-[10px] text-on-surface-variant truncate">
                  {activeEmployee.supervisor.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SKILLS & COMPETENCIES SECTION */}
      <section className="bg-surface-container-lowest rounded-2xl p-5 lg:p-6 shadow-2xs border border-outline-variant/30 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] uppercase tracking-wider text-primary font-bold">
                Evaluación Continua
              </span>
            </div>
            <h3 className="text-lg lg:text-xl text-on-surface font-black tracking-tight">
              Mapa de Habilidades y Competencias
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Comparación entre habilidades requeridas por el cargo y el nivel actual demostrado por el colaborador.
            </p>
          </div>

          {/* Circular Role Match Pill */}
          <div className="bg-surface-container-low px-4 py-2 rounded-xl border border-outline-variant/20 flex items-center gap-3 shrink-0">
            <div className="relative w-11 h-11 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-surface-container"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                />
                <path
                  className="text-primary"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray={`${activeEmployee.roleMatch}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3.5"
                />
              </svg>
              <span className="absolute text-xs font-black text-on-surface">
                {activeEmployee.roleMatch}%
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-outline font-bold uppercase">Coincidencia de Rol</span>
              <span className="text-xs font-bold text-on-secondary-container">Nivel Excepcional</span>
            </div>
          </div>
        </div>

        {/* Spectrum Waveform */}
        <div className="bg-surface-container-low/70 rounded-xl p-4 border border-outline-variant/20">
          <div className="flex items-center justify-between mb-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span className="text-[11px] text-on-surface font-semibold">Técnicas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary-fixed-dim" />
                <span className="text-[11px] text-on-surface font-semibold">Humanas y Liderazgo</span>
              </div>
            </div>
            <span className="text-[11px] text-outline font-medium hidden sm:inline">
              Escala de nivel: 1.0 a 5.0
            </span>
          </div>

          {/* Spectrum Bars */}
          <div className="relative w-full h-28 flex items-end justify-between gap-1.5 sm:gap-2 px-1 pt-2">
            {activeEmployee.spectrumSkills.map((sk, idx) => (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center gap-1 group cursor-pointer"
                title={`${sk.label}: ${sk.value}%`}
              >
                <div
                  className={`w-full rounded-t transition-all duration-300 group-hover:scale-105 shadow-2xs ${
                    sk.category === 'gap'
                      ? 'bg-gradient-to-t from-tertiary-container/80 to-tertiary-fixed-dim'
                      : sk.category === 'soft'
                      ? 'bg-gradient-to-t from-primary to-secondary-fixed-dim'
                      : 'bg-gradient-to-t from-primary to-primary-container'
                  }`}
                  style={{ height: `${sk.value}%` }}
                />
                <span className="text-[10px] text-outline group-hover:text-primary transition-colors text-center hidden md:block truncate w-full font-medium">
                  {sk.label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-outline-variant/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-surface-container text-[11px] text-on-surface font-bold">
                G-Factor: {activeEmployee.gFactor}
              </span>
              <span className="text-[11px] text-on-surface-variant">
                Aptitud para resolver problemas complejos en sistemas de gran escala.
              </span>
            </div>
            <span className="text-[11px] text-on-secondary-container font-bold">
              Equilibrio de habilidades: Óptimo (&lt; 0.4)
            </span>
          </div>
        </div>
      </section>

      {/* SKILL GAP ANALYSIS MATRIX */}
      <section className="bg-surface-container-lowest rounded-2xl p-5 lg:p-6 shadow-2xs border border-outline-variant/30 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-primary font-bold">
              Nivel técnico vs Requerido
            </span>
            <h3 className="text-lg lg:text-xl text-on-surface font-black tracking-tight mt-0.5">
              Comparación de Brechas por Competencia
            </h3>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-2.5 bg-surface-container-low px-3 py-1 rounded-xl border border-outline-variant/20 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary-container" />
              <span className="text-[11px] text-on-surface font-medium">Óptimo (0)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-[11px] text-on-surface font-medium">Supera (+1)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim" />
              <span className="text-[11px] text-on-surface font-medium">Brecha (-1)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Hard Skills */}
          <div className="bg-surface-container-low/50 p-4 rounded-xl flex flex-col gap-3 border border-outline-variant/20">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">terminal</span>
                <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">Habilidades Técnicas</h4>
              </div>
              <span className="text-[11px] text-outline font-semibold">Requerido: 4.5 Promedio</span>
            </div>

            <div className="flex flex-col gap-2.5">
              {activeEmployee.hardSkills.map((skill, idx) => (
                <div
                  key={idx}
                  className={`bg-surface-container-lowest p-3 rounded-xl shadow-2xs flex flex-col gap-1.5 border ${
                    skill.gap < 0
                      ? 'border-tertiary-fixed/60 ring-1 ring-tertiary-fixed/30'
                      : 'border-outline-variant/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-on-surface">{skill.name}</span>
                      {skill.technicalName && (
                        <span className="text-[10px] font-medium text-outline ml-1.5">({skill.technicalName})</span>
                      )}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                        skill.gap === 0
                          ? 'bg-secondary-container/40 text-on-secondary-container'
                          : skill.gap > 0
                          ? 'bg-primary-fixed text-primary'
                          : 'bg-tertiary-fixed text-on-tertiary-fixed'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[12px]">
                        {skill.gap >= 0 ? 'check' : 'warning'}
                      </span>
                      {skill.statusText}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[10px] text-on-surface-variant">
                      <span>Nivel Actual: <strong className="text-on-surface">{skill.actual} / 5</strong></span>
                      <span>Requerido: <strong>{skill.required} / 5</strong></span>
                    </div>
                    <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden flex relative">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          skill.gap === 0
                            ? 'bg-secondary-container'
                            : skill.gap > 0
                            ? 'bg-primary'
                            : 'bg-tertiary-container'
                        }`}
                        style={{ width: `${(skill.actual / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Soft Skills */}
          <div className="bg-surface-container-low/50 p-4 rounded-xl flex flex-col gap-3 border border-outline-variant/20">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-[18px]">psychology</span>
                <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">Habilidades Sociales y Humanas</h4>
              </div>
              <span className="text-[11px] text-outline font-semibold">Requerido: 4.2 Promedio</span>
            </div>

            <div className="flex flex-col gap-2.5">
              {activeEmployee.softSkills.map((skill, idx) => (
                <div
                  key={idx}
                  className="bg-surface-container-lowest p-3 rounded-xl shadow-2xs flex flex-col gap-1.5 border border-outline-variant/20"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-on-surface">{skill.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                        skill.gap === 0
                          ? 'bg-secondary-container/40 text-on-secondary-container'
                          : skill.gap > 0
                          ? 'bg-primary-fixed text-primary'
                          : 'bg-surface-container-highest text-on-surface-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[12px]">
                        {skill.gap > 0 ? 'workspace_premium' : 'check'}
                      </span>
                      {skill.statusText}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[10px] text-on-surface-variant">
                      <span>Nivel Actual: <strong className="text-on-surface">{skill.actual} / 5</strong></span>
                      <span>Requerido: <strong>{skill.required} / 5</strong></span>
                    </div>
                    <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden flex relative">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          skill.gap === 0
                            ? 'bg-secondary-container'
                            : skill.gap > 0
                            ? 'bg-primary'
                            : 'bg-outline'
                        }`}
                        style={{ width: `${(skill.actual / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TRAINING & 360 REVIEWS (SPLIT VIEW) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Training Card */}
        <div className="lg:col-span-6 bg-surface-container-lowest p-5 lg:p-6 rounded-2xl shadow-2xs border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary text-[11px] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">school</span> Recomendación NEXUS
              </span>
              <span className="text-[11px] text-outline font-semibold">Cierre de Brecha</span>
            </div>

            <h4 className="text-sm sm:text-base text-on-surface font-black tracking-tight">
              Capacitación recomendada para cerrar brecha en gestión de costos (-1)
            </h4>

            <div className="mt-3 p-3.5 bg-surface-container-low/70 rounded-xl border border-outline-variant/20 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary">
                  {activeEmployee.recommendedTraining.title}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-surface-container text-on-surface font-bold">
                  {activeEmployee.recommendedTraining.hours}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {activeEmployee.recommendedTraining.description}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-on-surface-variant text-[11px]">
                {activeEmployee.recommendedTraining.perks.map((perk, i) => (
                  <span key={i} className="flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[13px] text-secondary">verified</span>
                    {perk}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              onClick={handleEnroll}
              disabled={enrolling || enrolled}
              className={`w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer ${
                enrolled
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'bg-primary text-on-primary hover:bg-primary-container'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {enrolling ? 'sync' : enrolled ? 'check_circle' : 'add_task'}
              </span>
              {enrolling
                ? 'Inscribiendo...'
                : enrolled
                ? 'Inscripción Confirmada'
                : 'Inscribir en Plan de Desarrollo'}
            </button>
            <button
              onClick={() => onNavigate('capacitacion-upskilling')}
              className="w-full sm:w-auto px-3.5 py-2 bg-surface-container text-on-surface text-xs font-semibold rounded-xl flex items-center justify-center gap-1 hover:bg-surface-container-high transition-all cursor-pointer"
            >
              Ver Temario →
            </button>
          </div>
        </div>

        {/* 360 Reviews & Projects */}
        <div className="lg:col-span-6 bg-surface-container-lowest p-5 lg:p-6 rounded-2xl shadow-2xs border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">reviews</span>
                <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">Evaluaciones 360° Recientes</h4>
              </div>
              <span className="text-[11px] font-bold text-on-secondary-container bg-secondary-container/30 px-2.5 py-0.5 rounded-full">
                Último puntaje: 4.85 / 5.0
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {activeEmployee.reviews.map((rev, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 pb-2.5 border-b border-outline-variant/10 last:border-b-0"
                >
                  <UserAvatar name={rev.author} size="xs" shape="circle" />
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-on-surface">{rev.author}</span>
                      <span className="text-[10px] text-outline">{rev.timeAgo}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5 leading-snug">{rev.comment}</p>
                    {rev.scores && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        {Object.entries(rev.scores).map(([k, v]) => (
                          <span
                            key={k}
                            className="px-1.5 py-0.5 rounded bg-surface-container text-[10px] text-on-surface font-semibold"
                          >
                            {k}: {v}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strategic Projects */}
          <div className="mt-4 pt-3 border-t border-outline-variant/20">
            <span className="text-[10px] text-outline uppercase font-bold block mb-1.5">
              Proyectos Estratégicos Asignados
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {activeEmployee.projects.map((proj, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-surface-container-low text-on-surface text-xs font-semibold flex items-center gap-1 border border-outline-variant/20"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {proj}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Historial 360° Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-on-background/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4 border border-outline-variant/30 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">history_edu</span>
                <h3 className="text-base font-bold text-on-surface">Historial de Desempeño (360°)</h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <div className="space-y-2.5 max-h-72 overflow-y-auto">
              <div className="p-3 rounded-xl bg-surface-container-low flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-on-surface block">Ciclo Anual 2026</span>
                  <span className="text-[11px] text-outline">Puntaje ajustado: 4.74 / 5.0</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-secondary-container/30 text-on-secondary-container text-xs font-bold">
                  Sobresaliente
                </span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-on-surface block">Revisión semestral 2026 (1er semestre)</span>
                  <span className="text-[11px] text-outline">Puntaje ágil: 4.30 / 5.0</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary text-xs font-bold">
                  Cumplido
                </span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-on-surface block">Ciclo Anual 2025</span>
                  <span className="text-[11px] text-outline">Puntaje ajustado: 4.10 / 5.0</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary text-xs font-bold">
                  Muy Bueno
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setShowHistoryModal(false);
                onNavigate('evaluacion-desempeno');
              }}
              className="w-full py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container transition-all text-center cursor-pointer"
            >
              Ver Detalle en Evaluación de Desempeño →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
