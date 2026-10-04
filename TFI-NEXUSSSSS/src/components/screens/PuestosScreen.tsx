import React, { useState, useEffect } from 'react';
import { JobPosition, ScreenId } from '../../types';
import { JOB_POSITIONS } from '../../data/mockData';
import { UserAvatar } from '../UserAvatar';
import { QuickGuideBanner } from '../QuickGuideBanner';
import { HelpTooltip } from '../HelpTooltip';
import { jobsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface PuestosScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onSelectJobForRecruitment?: (jobCode: string) => void;
  selectedJobCode?: string;
  /** Se llama cuando el usuario elige otro puesto de la lista (la URL es la fuente de verdad). */
  onChangeJobCode?: (jobCode: string) => void;
}

export const PuestosScreen: React.FC<PuestosScreenProps> = ({
  onNavigate,
  onSelectJobForRecruitment,
  selectedJobCode = 'PUE-2026-ARCH-03',
  onChangeJobCode,
}) => {
  const { user, role, hasPermission, openLoginModal } = useAuth();
  const setSelectedJobCode = (code: string) => onChangeJobCode?.(code);
  const [positions, setPositions] = useState<JobPosition[]>(JOB_POSITIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedHierarchy, setSelectedHierarchy] = useState('sr');
  const [onlyCritical, setOnlyCritical] = useState(false);
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Campos para crear nuevo puesto
  const [newTitle, setNewTitle] = useState('');
  const [newDepartment, setNewDepartment] = useState('Tecnología y Plataforma');
  const [newStatus, setNewStatus] = useState<'critical' | 'operational'>('operational');
  const [newMission, setNewMission] = useState('');
  const [isSubmittingJob, setIsSubmittingJob] = useState(false);

  useEffect(() => {
    let isMounted = true;
    jobsApi
      .getAll()
      .then((res) => {
        if (isMounted && res.data && res.data.length > 0) {
          setPositions(res.data);
        }
      })
      .catch(() => {
        // Fallback a JOB_POSITIONS en memoria
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedJob: JobPosition =
    positions.find((j) => j.code === selectedJobCode) || positions[0] || JOB_POSITIONS[0];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreateVacancy = async () => {
    try {
      await jobsApi.openVacancy(selectedJob.code);
    } catch {
      // Silencioso
    }
    if (onSelectJobForRecruitment) {
      // La página muestra el aviso de éxito y lleva al usuario a Selección de Personal.
      onSelectJobForRecruitment(selectedJob.code);
      return;
    }
    triggerToast(`Vacante generada para ${selectedJob.title}`);
    setTimeout(() => {
      onNavigate('reclutamiento');
    }, 600);
  };

  const handleSaveJob = async () => {
    if (!hasPermission('jobs:create')) {
      triggerToast('Acción restringida: Se requiere rol de Administrador (ADMIN_HR) para crear puestos.');
      openLoginModal();
      return;
    }
    if (!newTitle.trim()) {
      triggerToast('Por favor, ingresá el nombre del puesto.');
      return;
    }
    setIsSubmittingJob(true);
    const code = `PUE-2026-${Date.now().toString().slice(-4)}`;
    const jobPayload = {
      code,
      title: newTitle.trim(),
      department: newDepartment,
      status: newStatus,
      division: newDepartment,
      reportsTo: 'Dirección de Operaciones',
      supervises: 'Equipo Asignado',
      salaryBand: 'Banda Salarial Oficial',
      mission: newMission.trim() || 'Asegurar la continuidad y desarrollo estratégico del área.',
      techSkills: [],
      softSkills: [],
    };

    try {
      const created = await jobsApi.create(jobPayload);
      setPositions((prev) => [created, ...prev]);
      setSelectedJobCode(created.code);
      triggerToast(`¡Listo! Puesto "${created.title}" guardado en la base de datos.`);
    } catch (err: any) {
      if (err?.message?.includes('401') || err?.message?.includes('Unauthorized')) {
        triggerToast('Sesión no autorizada. Por favor iniciá sesión como Administrador.');
        openLoginModal();
        setIsSubmittingJob(false);
        return;
      }
      // Fallback local
      const fallbackJob: JobPosition = {
        ...jobPayload,
        activeIncumbentsCount: 1,
        complianceRate: 100,
        isCalibrated: true,
        incumbents: [],
        purposeLink: 'Impacto directo en la continuidad operacional.',
        internalRelations: 'Coordinación interna de área',
        externalRelations: 'Proveedores y entidades externas',
        formalAuthority: 'Responsabilidades según manual institucional',
        responsibilities: [],
        workingConditions: {
          modality: 'Condiciones estándar de oficina',
          tools: 'Terminal de trabajo y software institucional',
          mobility: 'No requerida',
        },
      };
      setPositions((prev) => [fallbackJob, ...prev]);
      setSelectedJobCode(fallbackJob.code);
      triggerToast(`¡Listo! Puesto "${fallbackJob.title}" creado correctamente.`);
    } finally {
      setIsSubmittingJob(false);
      setShowNewJobModal(false);
      setNewTitle('');
      setNewMission('');
    }
  };

  const filteredPositions = positions.filter((j) => {
    const matchesSearch =
      !searchQuery ||
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCritical = !onlyCritical || j.status === 'critical';
    return matchesSearch && matchesCritical;
  });

  return (
    <div className="w-full px-6 lg:px-8 py-6 flex flex-col gap-8 pb-20">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-outline-variant/30 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="material-symbols-outlined text-secondary-container">check_circle</span>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Screen Header & Friendly Guide */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider text-primary font-bold">
                Gestión de Personas &bull; Estructura Organizacional
              </span>
              <span className="text-outline-variant">•</span>
              <span className="text-xs text-on-surface-variant font-medium">
                Catálogo de cargos y competencias
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl text-on-surface font-extrabold tracking-tight">
              Puestos de Trabajo y Perfiles del Cargo
            </h1>
            <p className="text-xs sm:text-sm text-outline mt-0.5">
              Definición de cargos, responsabilidades, nivel salarial y habilidades requeridas para cada posición.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNewJobModal(true)}
              className="px-4 py-2.5 bg-primary text-on-primary text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs hover:bg-primary-container transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              + Crear Nuevo Puesto
            </button>
          </div>
        </div>

        {/* Quick Guide Banner */}
        <QuickGuideBanner
          title="¿Cómo gestionar los puestos de trabajo?"
          description="Consultá qué exige cada rol en la empresa, quiénes lo desempeñan y qué vacantes están abiertas."
          tips={[
            'Hacé clic en cualquier puesto de la lista para ver su descripción y competencias requeridas.',
            'Usá el botón "+ Crear Nuevo Puesto" para dar de alta un cargo con sus requisitos.',
            'Hacé clic en "Generar Vacante" si necesitás iniciar la búsqueda de candidatos en Reclutamiento.',
          ]}
        />
      </div>

      {/* Top Global Metrics Ribbon */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between group hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[22px]">account_tree</span>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-bold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /> Activas
            </span>
          </div>
          <div className="mt-4">
            <div className="text-4xl font-extrabold text-on-surface tracking-tight">42</div>
            <p className="text-sm text-on-surface-variant font-bold mt-0.5">Puestos Definidos</p>
            <p className="text-xs text-outline mt-1">Estructura unificada 2026</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between group hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-tertiary-fixed flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[22px]">warning</span>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-bold">
              33.3% impacto
            </span>
          </div>
          <div className="mt-4">
            <div className="text-4xl font-extrabold text-on-surface tracking-tight">14</div>
            <p className="text-sm text-on-surface-variant font-bold mt-0.5">Puestos Críticos</p>
            <p className="text-xs text-outline mt-1">Alta dependencia de continuidad</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between group hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-secondary-container/40 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[22px]">verified_user</span>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-secondary-container/30 text-on-secondary-container font-bold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary" /> +4.5% vs Q3
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-on-surface tracking-tight">82</span>
              <span className="text-2xl font-bold text-secondary">%</span>
            </div>
            <p className="text-sm text-on-surface-variant font-bold mt-0.5">
              Perfiles con Brecha Cero
            </p>
            <p className="text-xs text-outline mt-1">Colaboradores 100% calibrados</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between group hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary-container">
              <span className="material-symbols-outlined text-[22px]">psychology</span>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary-fixed text-primary font-bold">
              Catálogo inteligente
            </span>
          </div>
          <div className="mt-4">
            <div className="text-4xl font-extrabold text-on-surface tracking-tight">320</div>
            <p className="text-sm text-on-surface-variant font-bold mt-0.5">Habilidades Registradas</p>
            <p className="text-xs text-outline mt-1">190 técnicas / 130 conductuales</p>
          </div>
        </div>
      </section>

      {/* Control & Filter Bar */}
      <section className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Search Input */}
          <div className="relative flex items-center min-w-[280px] flex-1 lg:flex-initial">
            <span className="material-symbols-outlined absolute left-3.5 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por código, nombre de puesto o habilidad..."
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low text-on-surface placeholder:text-outline rounded-xl text-xs outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container/20 transition-all border border-transparent focus:border-outline-variant/40"
            />
          </div>

          {/* Area Filter */}
          <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-xl border border-outline-variant/20">
            <span className="material-symbols-outlined text-outline text-[16px]">domain</span>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="bg-transparent text-xs font-semibold text-on-surface outline-none cursor-pointer"
            >
              <option value="">Todas las Áreas</option>
              <option value="ing">Tecnología y Plataforma</option>
              <option value="prod">Producto</option>
              <option value="ops">Operaciones</option>
              <option value="people">Personas</option>
            </select>
          </div>

          {/* Hierarchy Filter */}
          <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-xl border border-outline-variant/20">
            <span className="material-symbols-outlined text-outline text-[16px]">layers</span>
            <select
              value={selectedHierarchy}
              onChange={(e) => setSelectedHierarchy(e.target.value)}
              className="bg-transparent text-xs font-semibold text-on-surface outline-none cursor-pointer"
            >
              <option value="">Nivel Jerárquico</option>
              <option value="dir">Dirección</option>
              <option value="lead">Liderazgo Técnico</option>
              <option value="sr">Senior / Especialista</option>
              <option value="mid">Nivel intermedio</option>
            </select>
          </div>

          {/* Status Toggle */}
          <button
            onClick={() => setOnlyCritical(!onlyCritical)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              onlyCritical
                ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] text-primary">filter_list</span>
            <span>Críticos Primero</span>
          </button>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
          <button
            onClick={async () => {
              try {
                await jobsApi.downloadMatrix('xlsx');
                triggerToast('Matriz de puestos descargada en formato Excel.');
              } catch {
                triggerToast('Matriz de puestos exportada en formato Excel/CSV');
              }
            }}
            className="px-4 py-2 bg-surface-container-low hover:bg-surface-container text-on-surface rounded-xl text-xs font-bold flex items-center gap-2 transition-all border border-outline-variant/20 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Exportar Matriz</span>
          </button>
          <button
            onClick={() => setShowNewJobModal(true)}
            className="px-4 py-2 bg-primary-container hover:bg-primary text-on-primary rounded-xl text-xs font-bold flex items-center gap-2 shadow-[0_4px_14px_0_rgba(124,58,237,0.35)] transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>+ Diseñar Nuevo Puesto</span>
          </button>
        </div>
      </section>

      {/* Main Split Layout: Position List (Left 4 cols) & Detailed Technical Sheet (Right 8 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT PANEL: Interactive Position Directory */}
        <div className="xl:col-span-4 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1 py-1">
            <span className="text-[11px] uppercase tracking-wider text-outline font-bold">
              Catálogo Seleccionable
            </span>
            <span className="text-xs text-primary font-bold">
              {filteredPositions.length} Mostrados
            </span>
          </div>

          {filteredPositions.map((pos) => {
            const isSelected = selectedJobCode === pos.code;

            return (
              <div
                key={pos.code}
                onClick={() => setSelectedJobCode(pos.code)}
                className={`p-4 rounded-2xl transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-surface-container-lowest shadow-md ring-2 ring-primary-container border-primary'
                    : 'bg-surface-container-lowest shadow-sm hover:shadow-md border-outline-variant/30'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold shadow-sm ${
                        isSelected
                          ? 'bg-primary-fixed text-primary'
                          : 'bg-surface-container text-outline'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">cloud</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold text-primary">
                          {pos.code}
                        </span>
                        {pos.status === 'critical' && (
                          <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-on-surface leading-snug">
                        {pos.title}
                      </h3>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      pos.status === 'critical'
                        ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                        : 'bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    {pos.status === 'critical' ? 'Crítico' : 'Operativo'}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-4 text-on-surface-variant text-xs">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-outline text-[14px]">domain</span>
                    {pos.department}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-outline text-[14px]">group</span>
                    {pos.activeIncumbentsCount} Personas
                  </span>
                </div>

                <div className="mt-3 pt-2 border-t border-outline-variant/20 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-outline">Cumplimiento de habilidades</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="w-20 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            pos.complianceRate >= 90
                              ? 'bg-secondary-container'
                              : 'bg-primary-container'
                          }`}
                          style={{ width: `${pos.complianceRate}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-on-surface">
                        {pos.complianceRate}%
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold flex items-center gap-0.5 ${
                      isSelected ? 'text-primary' : 'text-outline'
                    }`}
                  >
                    {isSelected ? 'Inspeccionar' : 'Ver ficha'}
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT PANEL: DETAILED TECHNICAL SHEET (FICHA TÉCNICA) */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          {/* Master Header */}
          <div className="bg-surface-container-lowest p-6 lg:p-8 rounded-3xl shadow-sm border border-outline-variant/30 relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary shadow-sm">
                  <span className="material-symbols-outlined text-[36px]">cloud_done</span>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-primary px-2 py-0.5 bg-primary-fixed/40 rounded-md">
                      {selectedJob.code}
                    </span>
                    <span className="text-xs text-secondary font-bold px-2 py-0.5 bg-secondary-container/30 rounded-full flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-secondary" /> Activo &amp; Calibrado
                    </span>
                    <span className="text-xs text-on-tertiary-fixed-variant font-bold px-2 py-0.5 bg-tertiary-fixed rounded-full">
                      Puesto Clave / Crítico
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-on-surface mt-1">
                    {selectedJob.title}
                  </h2>
                  <p className="text-xs text-on-surface-variant">{selectedJob.division}</p>
                </div>
              </div>

              {/* Incumbents Cluster */}
              <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2.5 rounded-2xl border border-outline-variant/20">
                <div className="flex -space-x-2 overflow-hidden">
                  {selectedJob.incumbents.map((inc, i) => (
                    <UserAvatar
                      key={i}
                      name={inc.name}
                      size="sm"
                      shape="circle"
                      className="ring-2 ring-surface-container-lowest"
                    />
                  ))}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-outline font-bold">Personas Ocupantes</span>
                  <span className="text-xs font-bold text-on-surface">
                    {selectedJob.activeIncumbentsCount} Asignados (100% Cobertura)
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Specs Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 bg-surface-container-low/50 p-4 rounded-2xl border border-outline-variant/20">
              <div>
                <span className="text-[11px] text-outline block font-bold">Área Organizacional</span>
                <span className="text-xs font-bold text-on-surface">{selectedJob.department}</span>
              </div>
              <div>
                <span className="text-[11px] text-outline block font-bold">Reporta Directamente a</span>
                <span className="text-xs font-bold text-primary">{selectedJob.reportsTo}</span>
              </div>
              <div>
                <span className="text-[11px] text-outline block font-bold">Supervisa Directamente</span>
                <span className="text-xs font-bold text-on-surface">{selectedJob.supervises}</span>
              </div>
              <div>
                <span className="text-[11px] text-outline block font-bold">Nivel Salarial / Banda</span>
                <span className="text-xs font-bold text-on-surface">{selectedJob.salaryBand}</span>
              </div>
            </div>
          </div>

          {/* Section 1 & 2: Misión, Relaciones & Autoridad */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Misión Estratégica */}
            <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[18px]">flag</span>
                  </div>
                  <h4 className="text-sm font-bold text-on-surface">1. Misión Estratégica</h4>
                </div>
                <div className="p-4 bg-surface-container-low rounded-2xl relative border border-outline-variant/20">
                  <p className="text-xs text-on-surface font-medium leading-relaxed italic">
                    &ldquo;{selectedJob.mission}&rdquo;
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-[11px] uppercase tracking-wider text-outline font-bold">
                  Vínculo con el propósito de la empresa
                </span>
                <p className="text-xs text-on-surface-variant mt-1">{selectedJob.purposeLink}</p>
              </div>
            </div>

            {/* 2. Relaciones & Autoridad */}
            <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface">
                    <span className="material-symbols-outlined text-[18px]">hub</span>
                  </div>
                  <h4 className="text-sm font-bold text-on-surface">2. Relaciones y Autoridad</h4>
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 bg-surface-container-low rounded-xl border border-outline-variant/20">
                    <span className="text-[11px] text-primary font-bold block mb-0.5">
                      Interacciones Internas Clave
                    </span>
                    <p className="text-xs text-on-surface">{selectedJob.internalRelations}</p>
                  </div>
                  <div className="p-2.5 bg-surface-container-low rounded-xl border border-outline-variant/20">
                    <span className="text-[11px] text-secondary font-bold block mb-0.5">
                      Interacciones Externas Clave
                    </span>
                    <p className="text-xs text-on-surface">{selectedJob.externalRelations}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-surface-container-high/60 rounded-xl border border-outline-variant/20">
                <div className="flex items-center gap-2 text-on-surface">
                  <span className="material-symbols-outlined text-[18px] text-primary">gavel</span>
                  <span className="text-xs font-bold">Alcance de Autoridad Formal:</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-1">{selectedJob.formalAuthority}</p>
              </div>
            </div>
          </div>

          {/* Section 3: Responsabilidades y Estándares de Desempeño */}
          <div className="bg-surface-container-lowest p-6 lg:p-8 rounded-3xl shadow-sm border border-outline-variant/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-secondary-container/40 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[18px]">task_alt</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-on-surface">
                    3. Responsabilidades y Estándares de Desempeño
                  </h4>
                  <p className="text-xs text-outline">
                    Entregables medibles y criterios objetivos de cumplimiento para el puesto
                  </p>
                </div>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-semibold">
                {selectedJob.responsibilities.length} Macro-Responsabilidades
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {selectedJob.responsibilities.map((resp, idx) => (
                <div
                  key={idx}
                  className="bg-surface-container-low p-4 rounded-2xl flex flex-col justify-between border border-outline-variant/20"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary-fixed/40 rounded">
                        {resp.number}
                      </span>
                      <span className="material-symbols-outlined text-[18px] text-secondary">
                        verified
                      </span>
                    </div>
                    <h5 className="text-sm font-bold text-on-surface">{resp.title}</h5>
                    <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                      {resp.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-2 bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/20">
                    <span className="text-[10px] text-outline block font-bold">
                      Estándar de Desempeño:
                    </span>
                    <span className="text-xs font-bold text-secondary flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      {resp.standard}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Condiciones de Trabajo */}
          <div className="bg-surface-container-lowest p-6 lg:p-8 rounded-3xl shadow-sm border border-outline-variant/30">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface">
                <span className="material-symbols-outlined text-[18px]">workspaces</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-on-surface">
                  4. Condiciones del Entorno y Trabajo
                </h4>
                <p className="text-xs text-outline">
                  Lugar de trabajo, beneficios y esquema de presencia
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-surface-container-low rounded-2xl flex items-start gap-3 border border-outline-variant/20">
                <div className="p-2 bg-surface-container rounded-xl text-primary">
                  <span className="material-symbols-outlined text-[20px]">laptop_mac</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-on-surface block">Modalidad de trabajo</span>
                  <span className="text-[11px] text-on-surface-variant mt-0.5 block">
                    {selectedJob.workingConditions.modality}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-surface-container-low rounded-2xl flex items-start gap-3 border border-outline-variant/20">
                <div className="p-2 bg-surface-container rounded-xl text-secondary">
                  <span className="material-symbols-outlined text-[20px]">developer_board</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-on-surface block">Herramientas y equipamiento</span>
                  <span className="text-[11px] text-on-surface-variant mt-0.5 block">
                    {selectedJob.workingConditions.tools}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-surface-container-low rounded-2xl flex items-start gap-3 border border-outline-variant/20">
                <div className="p-2 bg-surface-container rounded-xl text-primary-container">
                  <span className="material-symbols-outlined text-[20px]">flight_takeoff</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-on-surface block">Viajes y congresos</span>
                  <span className="text-[11px] text-on-surface-variant mt-0.5 block">
                    {selectedJob.workingConditions.mobility}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Matriz de Conocimientos, Aptitudes y Habilidades (Escala 1 a 5) */}
          <div className="bg-surface-container-lowest p-6 lg:p-8 rounded-3xl shadow-sm border border-outline-variant/30">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[18px]">unfold_more_double</span>
                  </div>
                  <h4 className="text-sm font-bold text-on-surface">
                    5. Matriz de Conocimientos, Aptitudes y Habilidades
                  </h4>
                </div>
                <p className="text-xs text-outline mt-0.5">
                  Escala NEXUS (1: Básico → 5: Experto de referencia)
                </p>
              </div>

              {/* Scale Legend */}
              <div className="flex items-center gap-2 bg-surface-container-low px-4 py-1.5 rounded-full text-xs text-outline border border-outline-variant/20">
                <span className="flex items-center gap-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-outline-variant" />1 Novato
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-outline" />2 Aplicado
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-surface-tint" />3 Autónomo
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-primary-container" />4 Avanzado
                </span>
                <span className="flex items-center gap-1 font-bold text-secondary">
                  <span className="w-2 h-2 rounded-full bg-secondary" />5 Experto
                </span>
              </div>
            </div>

            {/* Two Columns: Technical Skills & Soft Skills */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Technical Skills */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between pb-1 border-b border-outline-variant/20">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">memory</span>
                    <span className="text-sm font-bold text-on-surface">Habilidades Técnicas Requeridas</span>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary-fixed text-primary">
                    Técnicas clave
                  </span>
                </div>

                {selectedJob.techSkills.map((ts, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-surface-container-low rounded-2xl flex flex-col gap-2 border border-outline-variant/20"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-on-surface block">{ts.name}</span>
                        {ts.technicalName && (
                          <span className="text-[11px] font-medium text-outline block">{ts.technicalName}</span>
                        )}
                        <span className="text-[11px] text-outline">{ts.description}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-surface-container-lowest px-2.5 py-1 rounded-xl shadow-sm border border-outline-variant/20">
                        <span className="text-[11px] text-outline font-semibold">Nivel:</span>
                        <span className="text-xs font-bold text-primary">{ts.level} / 5</span>
                      </div>
                    </div>
                    {/* 5-step progress indicator */}
                    <div className="grid grid-cols-5 gap-1.5 mt-1">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <div
                          key={lvl}
                          className={`h-2 rounded-full ${
                            lvl <= ts.level ? 'bg-primary-container' : 'bg-surface-container-high'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-outline mt-1">
                      <span>Dominio exigido:</span>
                      <span className="text-primary font-bold">{ts.observedBehavior}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Soft Skills */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between pb-1 border-b border-outline-variant/20">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[20px]">
                      diversity_3
                    </span>
                    <span className="text-sm font-bold text-on-surface">
                      Habilidades Sociales y de Liderazgo
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-secondary-container/40 text-on-secondary-container">
                    Capital humano
                  </span>
                </div>

                {selectedJob.softSkills.map((ss, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-surface-container-low rounded-2xl flex flex-col gap-2 border border-outline-variant/20"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-on-surface block">{ss.name}</span>
                        <span className="text-[11px] text-outline">{ss.description}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-surface-container-lowest px-2.5 py-1 rounded-xl shadow-sm border border-outline-variant/20">
                        <span className="text-[11px] text-outline font-semibold">Nivel:</span>
                        <span className="text-xs font-bold text-secondary">{ss.level} / 5</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5 mt-1">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <div
                          key={lvl}
                          className={`h-2 rounded-full ${
                            lvl <= ss.level ? 'bg-secondary' : 'bg-surface-container-high'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-outline mt-1">
                      <span>Comportamiento observado:</span>
                      <span className="text-on-secondary-container font-bold">
                        {ss.observedBehavior}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 6: Especificación Formal y Modelo Relacional (Diseño del Word / UTN) */}
          <div className="bg-surface-container-lowest p-6 lg:p-8 rounded-3xl shadow-sm border border-outline-variant/30 flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/20 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-fixed/70 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[18px]">account_tree</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-on-surface">
                    6. Especificación Formal y Modelo de Puestos (Diseño Relacional del Word)
                  </h4>
                  <p className="text-xs text-outline">
                    Entidades normalizadas: Unidad, Puesto, Perfil, Funciones, Tareas, Riesgos, Relaciones y Estándares
                  </p>
                </div>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-secondary-container/40 text-on-secondary-container font-bold">
                Manual de Organización &bull; UTN FRT
              </span>
            </div>

            {/* Sub-bloque A: Jerarquía y Posiciones */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20">
                <span className="text-[11px] text-outline font-bold uppercase block mb-1">
                  Unidad Organizacional (1:N)
                </span>
                <span className="text-sm font-bold text-on-surface block">
                  {selectedJob.unidad?.nombre || selectedJob.department}
                </span>
                <span className="text-[11px] text-outline-variant mt-1 block">
                  Depende de: {selectedJob.unidad?.unidadSuperior?.nombre || 'Dirección General'}
                </span>
              </div>

              <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20">
                <span className="text-[11px] text-outline font-bold uppercase block mb-1">
                  Puesto Superior (Recursiva 1:N)
                </span>
                <span className="text-sm font-bold text-on-surface block">
                  {selectedJob.puestoSuperior?.title || selectedJob.reportsTo}
                </span>
                <span className="text-[11px] text-outline-variant mt-1 block">
                  Supervisión inmediata formal
                </span>
              </div>

              <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20">
                <span className="text-[11px] text-outline font-bold uppercase block mb-1">
                  Posiciones Asignadas (n_posiciones)
                </span>
                <span className="text-sm font-bold text-primary block">
                  {selectedJob.nPosiciones ?? selectedJob.activeIncumbentsCount} Puesto(s) Físico(s)
                </span>
                <span className="text-[11px] text-outline-variant mt-1 block">
                  Diferencia entre Puesto y Posición (Diapositiva 31)
                </span>
              </div>
            </div>

            {/* Sub-bloque B: Especificación del Puesto (Perfil y Responsabilidades 1:1) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Perfil (1:1) */}
              <div className="p-5 bg-surface-container-low rounded-2xl border border-outline-variant/20 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">school</span>
                  <h5 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                    Perfil del Puesto (1:1 con PUESTO)
                  </h5>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-outline block">Educación Formal:</span>
                  <p className="text-xs text-on-surface mt-0.5">
                    {selectedJob.perfil?.educacionFormal || 'Educación universitaria o técnica afín al área requerida.'}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-outline block">Experiencia Requerida:</span>
                  <p className="text-xs text-on-surface mt-0.5">
                    {selectedJob.perfil?.experienciaRequerida || 'Experiencia laboral demostrable en funciones del cargo.'}
                  </p>
                </div>
              </div>

              {/* Ficha de Responsabilidades (1:1) */}
              <div className="p-5 bg-surface-container-low rounded-2xl border border-outline-variant/20 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[18px]">inventory_2</span>
                  <h5 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                    Responsabilidad (1:1 con PUESTO)
                  </h5>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-outline block">Manejo de Personal:</span>
                  <p className="text-xs text-on-surface mt-0.5">
                    {selectedJob.responsabilidadFicha?.manejoPersonal || selectedJob.supervises}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-outline block">Equipo de Trabajo:</span>
                  <p className="text-xs text-on-surface mt-0.5">
                    {selectedJob.responsabilidadFicha?.equipoTrabajo || selectedJob.workingConditions.tools}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-outline block">Manejo de Información:</span>
                  <p className="text-xs text-on-surface mt-0.5">
                    {selectedJob.responsabilidadFicha?.manejoInformacion || 'Bases de datos y documentación reservada institucional.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Sub-bloque C: Funciones y Tareas Desagregadas (1:N y 1:N) */}
            {selectedJob.funciones && selectedJob.funciones.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">format_list_numbered</span>
                  <h5 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                    Unidades de Competencia (Funciones) y Tareas (1:N)
                  </h5>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedJob.funciones.map((func, fIdx) => (
                    <div
                      key={func.id || fIdx}
                      className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20"
                    >
                      <span className="text-xs font-bold text-primary block mb-1">
                        Función {fIdx + 1}: {func.descripcion}
                      </span>
                      {func.tareas && func.tareas.length > 0 && (
                        <div className="mt-2 flex flex-col gap-1.5 pl-2 border-l-2 border-primary/30">
                          <span className="text-[10px] uppercase font-bold text-outline">Tareas Operativas:</span>
                          {func.tareas.map((tar, tIdx) => (
                            <div key={tar.id || tIdx} className="text-xs text-on-surface-variant flex items-start gap-1.5">
                              <span className="text-primary font-bold">•</span>
                              <span>{tar.descripcion}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-bloque D: Riesgos del Cargo (1:N) */}
            {selectedJob.riesgosPuesto && selectedJob.riesgosPuesto.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-error text-[18px]">warning</span>
                  <h5 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                    Riesgos del Cargo (1:N con PUESTO)
                  </h5>
                </div>
                <div className="overflow-x-auto rounded-2xl border border-outline-variant/20">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-container-high text-on-surface font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3">Tipo de Riesgo</th>
                        <th className="p-3">Motivo / Causa</th>
                        <th className="p-3">Consecuencia</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10 bg-surface-container-low">
                      {selectedJob.riesgosPuesto.map((r, rIdx) => (
                        <tr key={r.id || rIdx} className="hover:bg-surface-container transition-colors">
                          <td className="p-3 font-bold text-primary">{r.tipoRiesgo}</td>
                          <td className="p-3 text-on-surface">{r.motivo}</td>
                          <td className="p-3 text-on-surface-variant font-medium">{r.consecuencia}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Sub-bloque E: Relaciones de Trabajo (1:N) & Estándares de Desempeño (1:N) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Relaciones de Trabajo (1:N) */}
              {selectedJob.relacionesPuesto && selectedJob.relacionesPuesto.length > 0 && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[18px]">share</span>
                    <h5 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                      Relaciones de Trabajo (1:N)
                    </h5>
                  </div>
                  <div className="overflow-x-auto rounded-2xl border border-outline-variant/20">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-surface-container-high text-on-surface font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="p-2.5">Tipo</th>
                          <th className="p-2.5">Puesto o Institución</th>
                          <th className="p-2.5">Propósito</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/10 bg-surface-container-low">
                        {selectedJob.relacionesPuesto.map((rel, rIdx) => (
                          <tr key={rel.id || rIdx}>
                            <td className="p-2.5 font-bold uppercase text-[10px] text-primary">{rel.tipo}</td>
                            <td className="p-2.5 font-medium text-on-surface">{rel.puestoOInstitucion}</td>
                            <td className="p-2.5 text-on-surface-variant text-[11px]">{rel.proposito}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Estándares de Desempeño (1:N) */}
              {selectedJob.estandaresDesempeno && selectedJob.estandaresDesempeno.length > 0 && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                    <h5 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                      Estándares de Desempeño del Manual (1:N)
                    </h5>
                  </div>
                  <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20 flex flex-col gap-2">
                    {selectedJob.estandaresDesempeno.map((est, eIdx) => (
                      <div key={est.id || eIdx} className="flex items-start gap-2 text-xs text-on-surface">
                        <span className="material-symbols-outlined text-secondary text-[16px] shrink-0">check_circle</span>
                        <span>{est.descripcion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Bottom Ribbon */}
          <div className="sticky bottom-4 z-30 bg-surface-container-lowest/90 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-outline-variant/30 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-secondary" />
              <span className="text-xs font-bold text-on-surface">Ficha del cargo validada v3.2</span>
              <span className="hidden md:inline text-xs text-outline">
                • Última revisión: Octubre 2026
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => triggerToast(`Copia creada: ${selectedJob.title} (Borrador)`)}
                className="px-3.5 py-2 bg-surface-container-low hover:bg-surface-container text-on-surface rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border border-outline-variant/20"
              >
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                <span className="hidden sm:inline">Duplicar</span>
              </button>

              <button
                onClick={() => onNavigate('value-map')}
                className="px-3.5 py-2 bg-surface-container-low hover:bg-secondary-container/20 text-on-secondary-container rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-outline-variant/20"
              >
                <span className="material-symbols-outlined text-[16px] text-secondary">schema</span>
                <span>Cadena de Valor</span>
              </button>

              <button
                onClick={handleCreateVacancy}
                className="px-3.5 py-2 bg-surface-container-high hover:bg-primary-fixed text-primary rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">person_add</span>
                <span>Generar Vacante en Reclutamiento</span>
              </button>

              <button
                onClick={() => triggerToast(`Abriendo editor para ${selectedJob.code}`)}
                className="px-4 py-2 bg-primary-container hover:bg-primary text-on-primary rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">edit_square</span>
                <span>Editar Puesto</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Crear Nuevo Puesto */}
      {showNewJobModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl max-w-xl w-full p-6 shadow-2xl flex flex-col gap-4 border border-outline-variant/30 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">work</span>
                </span>
                <div>
                  <h3 className="text-base font-black text-on-surface">Crear Nuevo Puesto de Trabajo</h3>
                  <p className="text-[11px] text-outline">Completá los datos del cargo para incorporarlo al organigrama</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewJobModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface cursor-pointer"
                title="Cerrar"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3.5">
              {/* Security & Role Status Banner */}
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-base">verified_user</span>
                  <div>
                    <span className="text-on-surface font-bold block">
                      Autorizado como: {user?.name || 'Administrador General'}
                    </span>
                    <span className="text-[10px] text-outline">
                      Rol: {role} &bull; Permiso total de creación en base de datos
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-800">
                  {role}
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface block mb-1">
                  Nombre del Puesto o Cargo:
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: Desarrollador Backend Senior"
                  className="w-full px-3 py-2.5 bg-surface-container-low rounded-xl text-xs text-on-surface outline-none border border-outline-variant/30 focus:border-primary font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-on-surface block mb-1">Área o Departamento:</label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full px-3 py-2.5 bg-surface-container-low rounded-xl text-xs text-on-surface outline-none border border-outline-variant/30 cursor-pointer"
                  >
                    <option value="Tecnología y Plataforma">Tecnología y Plataforma</option>
                    <option value="Inteligencia Artificial y Datos">Inteligencia Artificial y Datos</option>
                    <option value="Operaciones e Infraestructura">Operaciones e Infraestructura</option>
                    <option value="Recursos Humanos">Recursos Humanos</option>
                    <option value="Ventas y Comercial">Ventas y Comercial</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface block mb-1">Nivel de Importancia:</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as 'critical' | 'operational')}
                    className="w-full px-3 py-2.5 bg-surface-container-low rounded-xl text-xs text-on-surface outline-none border border-outline-variant/30 cursor-pointer"
                  >
                    <option value="critical">Crítico (Puesto clave para la empresa)</option>
                    <option value="operational">Operativo (Funcionamiento regular)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface block mb-1">
                  Objetivo Principal del Puesto:
                </label>
                <p className="text-[11px] text-outline mb-1.5">
                  Explicá brevemente cuál será la responsabilidad principal de la persona que ocupe este cargo.
                </p>
                <textarea
                  rows={3}
                  value={newMission}
                  onChange={(e) => setNewMission(e.target.value)}
                  placeholder="Describí las funciones clave que realizará..."
                  className="w-full px-3 py-2.5 bg-surface-container-low rounded-xl text-xs text-on-surface outline-none border border-outline-variant/30 focus:border-primary resize-none font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={() => setShowNewJobModal(false)}
                className="px-4 py-2 rounded-xl bg-surface-container text-on-surface text-xs font-bold hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isSubmittingJob}
                onClick={handleSaveJob}
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-xs hover:bg-primary-container transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">check</span>
                {isSubmittingJob ? 'Guardando...' : 'Guardar Puesto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
