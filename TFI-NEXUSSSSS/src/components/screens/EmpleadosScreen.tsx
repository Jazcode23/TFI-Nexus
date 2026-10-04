import React, { useState } from 'react';
import { EmployeeProfile, ScreenId } from '../../types';
import { EMPLOYEES_DATA } from '../../data/mockData';
import { UserAvatar } from '../UserAvatar';
import { QuickGuideBanner } from '../QuickGuideBanner';
import { HelpTooltip } from '../HelpTooltip';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedGapFilter, setSelectedGapFilter] = useState('all');
  const [selectedTenure, setSelectedTenure] = useState('all');
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeEmployee =
    EMPLOYEES_DATA.find((e) => e.id === activeEmpId) || EMPLOYEES_DATA[0];

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
    setSelectedGapFilter('all');
    setSelectedTenure('all');
  };

  const filteredEmployees = EMPLOYEES_DATA.filter((emp) => {
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
    <div className="w-full px-6 lg:px-8 py-6 flex flex-col gap-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-outline-variant/30 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="material-symbols-outlined text-secondary-container">check_circle</span>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* TOP MANAGEMENT & ANALYTICS STRIP */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider text-primary font-bold">
                Gestión de Personas &bull; Colaboradores
              </span>
              <span className="text-outline-variant">•</span>
              <span className="text-xs text-on-surface-variant font-medium">
                Directorio y fichas individuales
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl text-on-surface font-extrabold tracking-tight">
              Directorio y Fichas de Empleados
            </h1>
            <p className="text-xs sm:text-sm text-outline mt-0.5">
              Consultá la información, cargo actual, supervisor, habilidades y evaluaciones de cada miembro del equipo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <button
              onClick={handleDownloadPdf}
              className="px-4 py-2.5 bg-surface-container-low text-on-surface text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-surface-container transition-all border border-outline-variant/30 cursor-pointer"
            >
              <span className="material-symbols-outlined text-outline text-[18px]">file_download</span>
              Descargar Ficha PDF
            </button>
            <button
              onClick={() => onNavigate('reclutamiento')}
              className="px-4 py-2.5 bg-primary text-on-primary text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs hover:bg-primary-container transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              Reclutar Talento
            </button>
          </div>
        </div>

        {/* Quick Guide Banner */}
        <QuickGuideBanner
          title="¿Cómo navegar las fichas de empleados?"
          description="Elegí a cualquier colaborador en la lista para ver su información de contacto, supervisor y habilidades."
          tips={[
            'Seleccioná a un empleado de la lista izquierda para cargar su ficha completa.',
            'En "Habilidades y Competencias" verás su nivel técnico y áreas donde sobresale.',
            'Hacé clic en "Evaluar Desempeño" para registrar la calificación del ciclo.',
          ]}
        />

        {/* 4 Live Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/30 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] text-outline font-bold uppercase tracking-wider">
                Fuerza Laboral Activa
              </span>
              <span className="text-3xl text-on-surface font-black mt-1">428</span>
              <div className="flex items-center gap-1 mt-1 text-on-secondary-container text-xs font-bold">
                <span className="material-symbols-outlined text-[15px]">arrow_upward</span>
                <span>+12% vs Q3</span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">groups</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/30 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] text-outline font-bold uppercase tracking-wider">
                Alineación de Rol Media
              </span>
              <span className="text-3xl text-on-surface font-black mt-1">91.4%</span>
              <div className="flex items-center gap-1 mt-1 text-on-secondary-container text-xs font-bold">
                <span className="material-symbols-outlined text-[15px]">verified</span>
                <span>Alta efectividad</span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-xl bg-secondary-container/30 flex items-center justify-center text-on-secondary-container">
              <span className="material-symbols-outlined text-[24px]">network_check</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/30 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] text-outline font-bold uppercase tracking-wider">
                Brechas Críticas de Competencias
              </span>
              <span className="text-3xl text-on-surface font-black mt-1">14</span>
              <div className="flex items-center gap-1 mt-1 text-tertiary text-xs font-bold">
                <span className="material-symbols-outlined text-[15px]">warning</span>
                <span>3.2% de la plantilla</span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-xl bg-error-container/40 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[24px]">crisis_alert</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/30 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] text-outline font-bold uppercase tracking-wider">
                Puntaje 360° Promedio
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl text-on-surface font-black">4.62</span>
                <span className="text-base text-outline font-semibold">/5</span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-primary text-xs font-bold">
                <span className="material-symbols-outlined text-[15px]">insights</span>
                <span>Entre el 5% mejor del sector</span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-xl bg-primary-fixed/40 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">stars</span>
            </div>
          </div>
        </div>

        {/* Quick Search & Intelligent Filtering Bar */}
        <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="relative w-full lg:w-96 flex items-center">
            <span className="material-symbols-outlined absolute left-3.5 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar colaborador por nombre, cargo o ID..."
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low text-on-surface placeholder:text-outline rounded-xl text-xs outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all border border-transparent focus:border-outline-variant/40"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Area Filter */}
            <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-xl border border-outline-variant/20">
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

            <button
              onClick={resetFilters}
              className="px-3 py-1.5 rounded-xl bg-surface-container-low text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="Restablecer filtros"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              <span>Limpiar Filtros</span>
            </button>
          </div>
        </div>

        {/* Interactive Employee Selector Strip */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-outline flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-base">group</span>
              Directorio del Equipo ({filteredEmployees.length} colaboradores disponibles)
            </span>
            <span className="text-[11px] text-outline">
              Hacé clic en cualquier persona para abrir su ficha completa
            </span>
          </div>

          {filteredEmployees.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {filteredEmployees.map((emp) => {
                const isSelected = emp.id === activeEmpId;
                return (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => setActiveEmpId(emp.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 relative ${
                      isSelected
                        ? 'bg-primary/10 border-primary ring-2 ring-primary/20 shadow-xs'
                        : 'bg-surface-container-lowest border-outline-variant/30 hover:border-primary/40 hover:bg-surface-container-low'
                    }`}
                  >
                    <UserAvatar name={emp.name} size="md" shape="rounded" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-on-surface truncate block">
                          {emp.name}
                        </span>
                        {isSelected && (
                          <span className="material-symbols-outlined text-primary text-sm shrink-0">
                            check_circle
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-primary font-medium truncate block">
                        {emp.role}
                      </span>
                      <span className="text-[10px] text-outline truncate block mt-0.5">
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
              <p className="text-xs font-bold text-on-surface">No se encontraron empleados con los filtros aplicados</p>
              <button
                onClick={resetFilters}
                className="mt-1 px-3.5 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold cursor-pointer"
              >
                Ver todos los colaboradores
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 360° ACTIVE PROFILE CARD STRUCTURE */}
      <section className="bg-surface-container-lowest rounded-3xl p-6 lg:p-8 shadow-sm border border-outline-variant/30 relative overflow-hidden">
        {/* Subtle Ambient Glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-24 w-80 h-80 bg-secondary-container/15 rounded-full blur-3xl pointer-events-none" />

        {/* Profile Header Top */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10 pb-6 border-b border-outline-variant/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <UserAvatar
              name={activeEmployee.name}
              size="2xl"
              shape="rounded"
              showStatus={true}
              statusColor="emerald"
            />

            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-2xl sm:text-3xl text-on-surface font-extrabold tracking-tight">
                  {activeEmployee.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-container/30 text-on-secondary-container text-xs font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  {activeEmployee.status}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-primary text-xs font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">military_tech</span>
                  {activeEmployee.badge}
                </span>
              </div>

              <p className="text-lg text-primary font-bold">{activeEmployee.role}</p>

              <div className="flex flex-wrap items-center gap-3 mt-2 text-on-surface-variant text-xs">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-outline text-[16px]">account_tree</span>
                  <span>{activeEmployee.area}</span>
                </div>
                <span className="text-outline-variant">•</span>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-outline text-[16px]">schedule</span>
                  <span>Antigüedad: {activeEmployee.tenure}</span>
                </div>
                <span className="text-outline-variant">•</span>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-outline text-[16px]">badge</span>
                  <span>ID: {activeEmployee.empId}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto self-stretch lg:self-center justify-end">
            <button
              onClick={() => setShowHistoryModal(true)}
              className="px-4 py-2.5 bg-surface-container text-on-surface text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-surface-container-high transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-outline text-[18px]">history_edu</span>
              Ver Evaluaciones Anteriores
            </button>
            <button
              onClick={() => {
                if (onOpenEvaluationModal) {
                  onOpenEvaluationModal(activeEmployee);
                } else {
                  triggerToast('Abriendo formulario de evaluación');
                }
              }}
              className="px-4 py-2.5 bg-primary text-on-primary text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs hover:bg-primary-container transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">edit_square</span>
              Registrar Nueva Evaluación
            </button>
          </div>
        </div>

        {/* 4 Segmented Personal & Labor Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pt-6 relative z-10">
          {/* Card 1 */}
          <div className="bg-surface-container-low p-4 rounded-2xl flex flex-col justify-between border border-outline-variant/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider text-outline font-bold">
                Contacto Corporativo
              </span>
              <span className="material-symbols-outlined text-primary text-[20px]">
                alternate_email
              </span>
            </div>
            <div>
              <span className="text-xs text-on-surface font-bold block truncate">
                {activeEmployee.email}
              </span>
              <span className="text-[11px] text-on-surface-variant flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-[14px] text-secondary">
                  phone_iphone
                </span>
                {activeEmployee.phone}
              </span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-surface-container-low p-4 rounded-2xl flex flex-col justify-between border border-outline-variant/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider text-outline font-bold">
                Estructura Contractual
              </span>
              <span className="material-symbols-outlined text-primary text-[20px]">contract</span>
            </div>
            <div>
              <span className="text-xs text-on-surface font-bold">{activeEmployee.contract}</span>
              <span className="text-[11px] text-on-surface-variant flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-[14px] text-outline">location_on</span>
                {activeEmployee.location}
              </span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-surface-container-low p-4 rounded-2xl flex flex-col justify-between border border-outline-variant/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider text-outline font-bold">
                Compensación &amp; Nivel
              </span>
              <span className="material-symbols-outlined text-primary text-[20px]">payments</span>
            </div>
            <div>
              <span className="text-xs text-on-surface font-bold">{activeEmployee.salaryBand}</span>
              <span className="text-[11px] text-on-surface-variant flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-[14px] text-on-secondary-container">
                  trending_up
                </span>
                {activeEmployee.percentile}
              </span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-surface-container-low p-4 rounded-2xl flex flex-col justify-between border border-outline-variant/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider text-outline font-bold">
                Supervisión y Jerarquía
              </span>
              <span className="material-symbols-outlined text-primary text-[20px]">
                supervised_user_circle
              </span>
            </div>
            <div className="flex items-center gap-3">
              <UserAvatar
                name={activeEmployee.supervisor.name}
                size="sm"
                shape="circle"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-on-surface font-bold truncate">
                  {activeEmployee.supervisor.name}
                </span>
                <span className="text-[11px] text-on-surface-variant truncate">
                  {activeEmployee.supervisor.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SKILLS & COMPETENCIES SECTION */}
      <section className="bg-surface-container-lowest rounded-3xl p-6 lg:p-8 shadow-sm border border-outline-variant/30 relative overflow-hidden">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 mb-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs uppercase tracking-wider text-primary font-bold">
                Evaluación Continua
              </span>
            </div>
            <h3 className="text-xl lg:text-2xl text-on-surface font-extrabold tracking-tight">
              Mapa de Habilidades y Competencias
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1 leading-relaxed">
              Comparación clara entre las habilidades requeridas por el cargo y el nivel actual demostrado por el colaborador, identificando fortalezas y oportunidades de formación.
            </p>
          </div>

          {/* Quantum Role Match Circular Pill */}
          <div className="bg-gradient-to-r from-primary-fixed to-secondary-fixed/50 p-0.5 rounded-2xl shadow-sm">
            <div className="bg-surface-container-lowest px-5 py-3 rounded-2xl flex items-center gap-4">
              <div className="relative w-14 h-14 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-surface-container"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                  />
                  <path
                    className="text-primary-container"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray={`${activeEmployee.roleMatch}, 100`}
                    strokeLinecap="round"
                    strokeWidth="3.5"
                  />
                </svg>
                <span className="absolute text-sm font-extrabold text-on-surface">
                  {activeEmployee.roleMatch}%
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-outline font-bold uppercase">
                  Coincidencia de Rol
                </span>
                <span className="text-sm font-bold text-on-secondary-container">
                  Nivel Excepcional
                </span>
                <span className="text-[11px] text-on-surface-variant">
                  Comparado con el nivel 4 de Arquitectura
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Visual DNA Waveform Spectrum */}
        <div className="bg-surface-container-low/70 rounded-2xl p-6 border border-outline-variant/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span className="text-xs text-on-surface font-semibold">Técnicas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary-fixed-dim" />
                <span className="text-xs text-on-surface font-semibold">Humanas y de Liderazgo</span>
              </div>
            </div>
            <span className="text-[11px] text-outline font-semibold">
              Escala de nivel: de 1.0 a 5.0 (Capacidad de adaptación)
            </span>
          </div>

          {/* Frequency Spectrum Bars */}
          <div className="relative w-full h-40 flex items-end justify-between gap-1.5 sm:gap-3 px-2 pt-6">
            {activeEmployee.spectrumSkills.map((sk, idx) => (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer"
                title={`${sk.label}: ${sk.value}%`}
              >
                <div
                  className={`w-full rounded-t-lg transition-all duration-300 group-hover:scale-105 shadow-sm ${
                    sk.category === 'gap'
                      ? 'bg-gradient-to-t from-tertiary-container/80 to-tertiary-fixed-dim'
                      : sk.category === 'soft'
                      ? 'bg-gradient-to-t from-primary to-secondary-fixed-dim'
                      : 'bg-gradient-to-t from-primary to-primary-container'
                  }`}
                  style={{ height: `${sk.value}%` }}
                />
                <span className="text-[11px] text-outline group-hover:text-primary transition-colors text-center hidden md:block truncate w-full font-medium">
                  {sk.label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-outline-variant/20 flex flex-col md:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-surface-container text-xs text-on-surface font-bold">
                Índice de aptitud general (G-Factor): {activeEmployee.gFactor}
              </span>
              <span className="text-xs text-on-surface-variant">
                Capacidad para resolver problemas en sistemas complejos y de gran tamaño.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-outline font-medium">Equilibrio entre habilidades:</span>
              <span className="text-xs text-on-secondary-container font-bold">
                Óptimo (diferencia mínima &lt; 0.4)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SKILL GAP ANALYSIS MATRIX (CORE REQUIREMENT) */}
      <section className="bg-surface-container-lowest rounded-3xl p-6 lg:p-8 shadow-sm border border-outline-variant/30 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-primary font-bold">
              Nivel técnico frente al requerido
            </span>
            <h3 className="text-xl lg:text-2xl text-on-surface font-extrabold tracking-tight mt-0.5">
              Comparación de Brechas por Competencia
            </h3>
            <p className="text-xs text-on-surface-variant">
              Escala de 1 a 5. Se compara con lo que exige el cargo de &apos;Arquitecto Principal de Nube e IA&apos;.
            </p>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 bg-surface-container-low px-4 py-1.5 rounded-xl border border-outline-variant/20">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary-container" />
              <span className="text-xs text-on-surface font-medium">Óptimo (0)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="text-xs text-on-surface font-medium">Supera lo requerido (+1)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-tertiary-fixed-dim" />
              <span className="text-xs text-on-surface font-medium">Brecha Leve (-1)</span>
            </div>
          </div>
        </div>

        {/* Comparative Dual-Layered Tables */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Technical Skills Section */}
          <div className="bg-surface-container-low/50 p-5 rounded-2xl flex flex-col gap-4 border border-outline-variant/20">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">terminal</span>
                <h4 className="text-sm font-bold text-on-surface">
                  Habilidades Técnicas
                </h4>
              </div>
              <span className="text-xs text-outline font-semibold">Nivel Requerido: 4.5 Promedio</span>
            </div>

            <div className="flex flex-col gap-3">
              {activeEmployee.hardSkills.map((skill, idx) => (
                <div
                  key={idx}
                  className={`bg-surface-container-lowest p-3.5 rounded-xl shadow-sm flex flex-col gap-2 border ${
                    skill.gap < 0
                      ? 'border-tertiary-fixed/60 ring-1 ring-tertiary-fixed/30'
                      : 'border-outline-variant/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex flex-col leading-tight">
                      <span className="text-xs font-bold text-on-surface">{skill.name}</span>
                      {skill.technicalName && (
                        <span className="text-[11px] font-medium text-outline">{skill.technicalName}</span>
                      )}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                        skill.gap === 0
                          ? 'bg-secondary-container/40 text-on-secondary-container'
                          : skill.gap > 0
                          ? 'bg-primary-fixed text-primary'
                          : 'bg-tertiary-fixed text-on-tertiary-fixed'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[13px]">
                        {skill.gap >= 0 ? 'check' : 'warning'}
                      </span>
                      {skill.statusText}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                      <span>
                        Nivel Actual: <strong className="text-on-surface">{skill.actual} / 5</strong>
                      </span>
                      <span>
                        Requerido: <strong>{skill.required} / 5</strong>
                      </span>
                    </div>
                    <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden flex relative">
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

          {/* Human / Social Skills Section */}
          <div className="bg-surface-container-low/50 p-5 rounded-2xl flex flex-col gap-4 border border-outline-variant/20">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">
                  psychology
                </span>
                <h4 className="text-sm font-bold text-on-surface">
                  Habilidades Sociales y Humanas
                </h4>
              </div>
              <span className="text-xs text-outline font-semibold">Nivel Requerido: 4.2 Promedio</span>
            </div>

            <div className="flex flex-col gap-3">
              {activeEmployee.softSkills.map((skill, idx) => (
                <div
                  key={idx}
                  className="bg-surface-container-lowest p-3.5 rounded-xl shadow-sm flex flex-col gap-2 border border-outline-variant/20"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-on-surface">{skill.name}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                        skill.gap === 0
                          ? 'bg-secondary-container/40 text-on-secondary-container'
                          : skill.gap > 0
                          ? 'bg-primary-fixed text-primary'
                          : 'bg-surface-container-highest text-on-surface-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[13px]">
                        {skill.gap > 0 ? 'workspace_premium' : 'check'}
                      </span>
                      {skill.statusText}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                      <span>
                        Nivel Actual: <strong className="text-on-surface">{skill.actual} / 5</strong>
                      </span>
                      <span>
                        Requerido: <strong>{skill.required} / 5</strong>
                      </span>
                    </div>
                    <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden flex relative">
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

      {/* INTELLIGENT TRAINING RECOMMENDATION & RECENT FEED (SPLIT VIEW) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Training Upskilling Action Card */}
        <div className="lg:col-span-6 bg-gradient-to-br from-surface-container-lowest to-surface-container-low p-6 lg:p-8 rounded-3xl shadow-sm border border-outline-variant/30 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-primary text-xs font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">school</span> Recomendación de NEXUS Talent
              </span>
              <span className="text-xs text-outline font-semibold">Cierre Inmediato de Brecha</span>
            </div>

            <h4 className="text-lg lg:text-xl text-on-surface font-bold tracking-tight">
              Capacitación recomendada para cerrar la brecha en gestión de costos en la nube (-1)
            </h4>

            <div className="mt-4 p-4 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-primary">
                  {activeEmployee.recommendedTraining.title}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-surface-container text-on-surface font-semibold">
                  {activeEmployee.recommendedTraining.hours}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {activeEmployee.recommendedTraining.description}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-on-surface-variant text-[11px]">
                {activeEmployee.recommendedTraining.perks.map((perk, i) => (
                  <span key={i} className="flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[14px] text-secondary">
                      verified
                    </span>
                    {perk}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 relative z-10">
            <button
              onClick={handleEnroll}
              disabled={enrolling || enrolled}
              className={`w-full sm:w-auto px-5 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all ${
                enrolled
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'bg-primary-container text-on-primary hover:bg-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {enrolling ? 'sync' : enrolled ? 'check_circle' : 'add_task'}
              </span>
              {enrolling
                ? 'Inscribiendo en Plan...'
                : enrolled
                ? 'Inscripción Confirmada'
                : 'Inscribir en Plan de Desarrollo'}
            </button>
            <button
              onClick={() => onNavigate('capacitacion-upskilling')}
              className="w-full sm:w-auto px-4 py-2.5 bg-surface-container-low text-on-surface-variant text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 hover:bg-surface-container transition-all"
            >
              Ver Temario en Capacitación →
            </button>
          </div>
        </div>

        {/* 360° Evaluation Feed & High-Impact Projects */}
        <div className="lg:col-span-6 bg-surface-container-lowest p-6 lg:p-8 rounded-3xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">reviews</span>
                <h4 className="text-sm font-bold text-on-surface">Evaluaciones 360° Recientes</h4>
              </div>
              <div className="flex items-center gap-1 bg-secondary-container/30 px-3 py-0.5 rounded-full">
                <span className="text-xs text-on-secondary-container font-bold">
                  Último puntaje global: 4.85 / 5.0
                </span>
              </div>
            </div>

            {/* Feed List */}
            <div className="flex flex-col gap-4">
              {activeEmployee.reviews.map((rev, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 pb-3 border-b border-surface-container-low last:border-b-0"
                >
                  <UserAvatar
                    name={rev.author}
                    size="sm"
                    shape="circle"
                  />
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-on-surface">{rev.author}</span>
                      <span className="text-[11px] text-outline">{rev.timeAgo}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1 leading-snug">{rev.comment}</p>
                    {rev.scores && (
                      <div className="flex items-center gap-2 mt-2">
                        {Object.entries(rev.scores).map(([k, v]) => (
                          <span
                            key={k}
                            className="px-2 py-0.5 rounded bg-surface-container text-[10px] text-on-surface font-semibold"
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

          {/* Active Strategic Projects Bar */}
          <div className="mt-6 pt-4 border-t border-surface-container-low">
            <span className="text-[11px] text-outline uppercase font-bold block mb-2">
              Proyectos Estratégicos Asignados
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {activeEmployee.projects.map((proj, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-surface-container-low text-on-surface text-xs font-semibold flex items-center gap-1.5 border border-outline-variant/20"
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
          <div className="bg-surface-container-lowest rounded-3xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4 border border-outline-variant/30 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">history_edu</span>
                <h3 className="text-base font-bold text-on-surface">Historial de Desempeño (evaluación 360°)</h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <div className="space-y-3 max-h-72 overflow-y-auto">
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
              onClick={() => onNavigate('evaluacion-desempeno')}
              className="w-full py-2.5 rounded-xl bg-primary-container text-on-primary text-xs font-bold hover:bg-primary transition-all text-center"
            >
              Ver Detalle en Evaluación de Desempeño →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
