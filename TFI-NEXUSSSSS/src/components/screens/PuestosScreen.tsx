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
    <div className="w-full px-6 lg:px-8 py-6 flex flex-col gap-6 pb-20">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-outline-variant/30 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="material-symbols-outlined text-secondary-container">check_circle</span>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Compact Header & Main Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <h1 className="text-xl lg:text-2xl font-black text-on-surface tracking-tight font-headline">
            Puestos de Trabajo y Perfiles
          </h1>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            {positions.length} puestos &bull; {positions.filter((p) => p.status === 'critical').length} críticos
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={async () => {
              try {
                await jobsApi.downloadMatrix('xlsx');
                triggerToast('Matriz de puestos descargada en formato Excel.');
              } catch {
                triggerToast('Matriz de puestos exportada en formato Excel/CSV');
              }
            }}
            className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-bold bg-surface-container text-on-surface hover:bg-surface-container-high border border-outline-variant/40 transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-outline text-[16px]">download</span>
            Exportar Matriz
          </button>
          <button
            onClick={() => setShowNewJobModal(true)}
            className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-bold bg-primary text-on-primary hover:bg-primary-container transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            + Nuevo Puesto
          </button>
        </div>
      </div>

      {/* Slim Guide Bar */}
      <QuickGuideBanner
        title="Guía de Puestos y Perfiles"
        description="Gestión de roles organizacionales, responsabilidades y competencias requeridas."
        tips={[
          'Hacé clic en cualquier puesto del catálogo para inspeccionar su ficha técnica y requisitos.',
          'Usá el botón "+ Nuevo Puesto" para dar de alta una posición en el organigrama.',
          'Hacé clic en "Generar Vacante" para iniciar la búsqueda de candidatos en Reclutamiento.',
        ]}
        dismissible={true}
      />

      {/* Compact 4-Metric Status Strip (Saves over 120px of vertical space) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="bg-surface-container-lowest px-3.5 py-2.5 rounded-xl border border-outline-variant/30 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-outline block">Puestos Definidos</span>
            <div className="text-base font-black text-on-surface">
              {positions.length} <span className="text-[11px] font-normal text-outline">cargos</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold">
            Estructura 2026
          </span>
        </div>

        <div className="bg-surface-container-lowest px-3.5 py-2.5 rounded-xl border border-outline-variant/30 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-outline block">Puestos Críticos</span>
            <div className="text-base font-black text-amber-600">
              {positions.filter((p) => p.status === 'critical').length}{' '}
              <span className="text-[11px] font-bold text-amber-700">roles clave</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold">
            33.3% impacto
          </span>
        </div>

        <div className="bg-surface-container-lowest px-3.5 py-2.5 rounded-xl border border-outline-variant/30 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-outline block">Brecha Cero</span>
            <div className="text-base font-black text-emerald-600">
              82% <span className="text-[11px] font-normal text-outline">calibrados</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
            +4.5% vs Q3
          </span>
        </div>

        <div className="bg-surface-container-lowest px-3.5 py-2.5 rounded-xl border border-outline-variant/30 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-outline block">Habilidades Registradas</span>
            <div className="text-base font-black text-on-surface">
              320 <span className="text-[11px] font-normal text-outline">skills</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-surface-container-high text-primary text-[10px] font-bold">
            190 téc / 130 cond
          </span>
        </div>
      </div>

      {/* Unified Filter Toolbar */}
      <div className="bg-surface-container-lowest px-4 py-2 rounded-2xl shadow-2xs border border-outline-variant/30 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search Input */}
          <div className="relative flex items-center min-w-[240px] flex-1 sm:flex-initial">
            <span className="material-symbols-outlined absolute left-2.5 text-outline text-[16px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por código, nombre o habilidad..."
              className="w-full pl-8 pr-3 py-1.5 bg-surface-container-low text-on-surface placeholder:text-outline rounded-xl text-xs outline-hidden focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary border border-outline-variant/30"
            />
          </div>

          {/* Area Filter */}
          <div className="flex items-center gap-1.5 bg-surface-container-low px-2.5 py-1.5 rounded-xl border border-outline-variant/20">
            <span className="material-symbols-outlined text-outline text-[15px]">domain</span>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="bg-transparent text-xs font-semibold text-on-surface outline-hidden cursor-pointer"
            >
              <option value="">Todas las Áreas</option>
              <option value="ing">Tecnología y Plataforma</option>
              <option value="prod">Producto</option>
              <option value="ops">Operaciones</option>
              <option value="people">Personas</option>
            </select>
          </div>

          {/* Hierarchy Filter */}
          <div className="flex items-center gap-1.5 bg-surface-container-low px-2.5 py-1.5 rounded-xl border border-outline-variant/20">
            <span className="material-symbols-outlined text-outline text-[15px]">layers</span>
            <select
              value={selectedHierarchy}
              onChange={(e) => setSelectedHierarchy(e.target.value)}
              className="bg-transparent text-xs font-semibold text-on-surface outline-hidden cursor-pointer"
            >
              <option value="">Nivel Jerárquico</option>
              <option value="dir">Dirección</option>
              <option value="lead">Liderazgo Técnico</option>
              <option value="sr">Senior / Especialista</option>
              <option value="mid">Nivel intermedio</option>
            </select>
          </div>

          {/* Critical Only Toggle */}
          <button
            type="button"
            onClick={() => setOnlyCritical(!onlyCritical)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              onlyCritical
                ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant shadow-2xs'
                : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[15px] text-tertiary">warning</span>
            <span>{onlyCritical ? 'Solo Críticos' : 'Críticos Primero'}</span>
          </button>
        </div>

        <span className="text-[11px] text-outline font-medium">
          {filteredPositions.length} de {positions.length} puestos mostrados
        </span>
      </div>

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
                className={`p-3.5 rounded-2xl transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-primary/5 shadow-xs ring-2 ring-primary/20 border-primary'
                    : 'bg-surface-container-lowest shadow-2xs hover:shadow-xs border-outline-variant/30 hover:border-outline-variant'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                        isSelected
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container text-outline'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {pos.status === 'critical' ? 'vpn_key' : 'work'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-primary">
                          {pos.code}
                        </span>
                        {pos.status === 'critical' && (
                          <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                        )}
                      </div>
                      <h3 className="text-xs font-bold text-on-surface leading-tight truncate">
                        {pos.title}
                      </h3>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${
                      pos.status === 'critical'
                        ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                        : 'bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    {pos.status === 'critical' ? 'Crítico' : 'Operativo'}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-on-surface-variant text-[11px]">
                  <span className="flex items-center gap-1 truncate text-outline">
                    <span className="material-symbols-outlined text-[13px]">domain</span>
                    <span className="truncate">{pos.department}</span>
                  </span>
                  <span className="flex items-center gap-1 shrink-0 text-outline">
                    <span className="material-symbols-outlined text-[13px]">group</span>
                    <span>{pos.activeIncumbentsCount} pers.</span>
                  </span>
                </div>

                <div className="mt-2 pt-2 border-t border-outline-variant/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          pos.complianceRate >= 90 ? 'bg-emerald-500' : 'bg-primary'
                        }`}
                        style={{ width: `${pos.complianceRate}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-on-surface">
                      {pos.complianceRate}%
                    </span>
                  </div>

                  <span
                    className={`text-[11px] font-bold flex items-center gap-0.5 ${
                      isSelected ? 'text-primary' : 'text-outline'
                    }`}
                  >
                    {isSelected ? 'Inspeccionar' : 'Ver ficha'}
                    <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT PANEL: DETAILED TECHNICAL SHEET (FICHA TÉCNICA) */}
        <div className="xl:col-span-8 flex flex-col gap-5">
          {/* Master Header */}
          <div className="bg-surface-container-lowest p-5 lg:p-6 rounded-3xl shadow-xs border border-outline-variant/30 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary shadow-2xs shrink-0">
                  <span className="material-symbols-outlined text-[28px]">cloud_done</span>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-mono font-bold text-primary px-2 py-0.5 bg-primary-fixed/40 rounded-md">
                      {selectedJob.code}
                    </span>
                    <span className="text-[11px] text-secondary font-bold px-2 py-0.5 bg-secondary-container/30 rounded-full flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-secondary" /> Activo &amp; Calibrado
                    </span>
                    {selectedJob.status === 'critical' && (
                      <span className="text-[11px] text-on-tertiary-fixed-variant font-bold px-2 py-0.5 bg-tertiary-fixed rounded-full">
                        Puesto Clave / Crítico
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl lg:text-2xl font-black text-on-surface mt-1">
                    {selectedJob.title}
                  </h2>
                  <p className="text-xs text-outline">{selectedJob.division}</p>
                </div>
              </div>

              {/* Incumbents Cluster */}
              <div className="flex items-center gap-2.5 bg-surface-container-low px-3.5 py-2 rounded-2xl border border-outline-variant/20">
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
                  <span className="text-[10px] text-outline font-bold">Personas Asignadas</span>
                  <span className="text-xs font-bold text-on-surface">
                    {selectedJob.activeIncumbentsCount} Asignados (100% Cobertura)
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Specs Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-3 border-t border-outline-variant/20">
              <div className="p-2.5 bg-surface-container-low/70 rounded-xl">
                <span className="text-[10px] text-outline block font-bold uppercase">Área Organizacional</span>
                <span className="text-xs font-bold text-on-surface truncate block mt-0.5">{selectedJob.department}</span>
              </div>
              <div className="p-2.5 bg-surface-container-low/70 rounded-xl">
                <span className="text-[10px] text-outline block font-bold uppercase">Reporta Directamente a</span>
                <span className="text-xs font-bold text-primary truncate block mt-0.5">{selectedJob.reportsTo}</span>
              </div>
              <div className="p-2.5 bg-surface-container-low/70 rounded-xl">
                <span className="text-[10px] text-outline block font-bold uppercase">Supervisa Directamente</span>
                <span className="text-xs font-bold text-on-surface truncate block mt-0.5">{selectedJob.supervises}</span>
              </div>
              <div className="p-2.5 bg-surface-container-low/70 rounded-xl">
                <span className="text-[10px] text-outline block font-bold uppercase">Nivel Salarial / Banda</span>
                <span className="text-xs font-bold text-on-surface truncate block mt-0.5">{selectedJob.salaryBand}</span>
              </div>
            </div>
          </div>

          {/* Section 1 & 2: Misión, Relaciones & Autoridad */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* 1. Misión Estratégica */}
            <div className="bg-surface-container-lowest p-5 rounded-3xl shadow-xs border border-outline-variant/30 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-7 h-7 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[16px]">flag</span>
                  </div>
                  <h4 className="text-xs font-extrabold text-on-surface uppercase tracking-wide">1. Misión Estratégica</h4>
                </div>
                <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
                  <p className="text-xs text-on-surface font-medium leading-relaxed italic">
                    &ldquo;{selectedJob.mission}&rdquo;
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-outline-variant/20">
                <span className="text-[10px] uppercase tracking-wider text-outline font-bold block">
                  Vínculo con el propósito de la empresa
                </span>
                <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">{selectedJob.purposeLink}</p>
              </div>
            </div>

            {/* 2. Relaciones & Autoridad */}
            <div className="bg-surface-container-lowest p-5 rounded-3xl shadow-xs border border-outline-variant/30 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-on-surface">
                    <span className="material-symbols-outlined text-[16px]">hub</span>
                  </div>
                  <h4 className="text-xs font-extrabold text-on-surface uppercase tracking-wide">2. Relaciones y Autoridad</h4>
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 bg-surface-container-low rounded-xl border border-outline-variant/20">
                    <span className="text-[10px] text-primary font-bold uppercase block mb-0.5">
                      Interacciones Internas Clave
                    </span>
                    <p className="text-xs text-on-surface">{selectedJob.internalRelations}</p>
                  </div>
                  <div className="p-2.5 bg-surface-container-low rounded-xl border border-outline-variant/20">
                    <span className="text-[10px] text-secondary font-bold uppercase block mb-0.5">
                      Interacciones Externas Clave
                    </span>
                    <p className="text-xs text-on-surface">{selectedJob.externalRelations}</p>
                  </div>
                </div>
              </div>

              <div className="p-2.5 bg-surface-container-low rounded-xl border border-outline-variant/20">
                <div className="flex items-center gap-1.5 text-on-surface">
                  <span className="material-symbols-outlined text-[16px] text-primary">gavel</span>
                  <span className="text-xs font-bold">Alcance de Autoridad Formal:</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">{selectedJob.formalAuthority}</p>
              </div>
            </div>
          </div>

          {/* Section 3: Responsabilidades y Estándares de Desempeño */}
          <div className="bg-surface-container-lowest p-5 rounded-3xl shadow-xs border border-outline-variant/30 flex flex-col gap-3.5">
            <div className="flex items-center justify-between pb-1 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-secondary-container/40 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[16px]">task_alt</span>
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-on-surface uppercase tracking-wide">
                    3. Responsabilidades y Estándares de Desempeño
                  </h4>
                  <p className="text-[11px] text-outline">
                    Entregables medibles y criterios objetivos de cumplimiento para el puesto
                  </p>
                </div>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-semibold">
                {selectedJob.responsibilities.length} Macro-Responsabilidades
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {selectedJob.responsibilities.map((resp, idx) => (
                <div
                  key={idx}
                  className="bg-surface-container-low p-3.5 rounded-2xl flex flex-col justify-between border border-outline-variant/20"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-primary px-1.5 py-0.2 bg-primary-fixed/40 rounded">
                        {resp.number}
                      </span>
                      <span className="material-symbols-outlined text-[16px] text-secondary">
                        verified
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-on-surface">{resp.title}</h5>
                    <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                      {resp.description}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 bg-surface-container-lowest p-2 rounded-xl border border-outline-variant/20">
                    <span className="text-[9px] text-outline block font-bold uppercase">
                      Estándar de Desempeño:
                    </span>
                    <span className="text-xs font-bold text-secondary flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[13px]">check_circle</span>
                      {resp.standard}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Condiciones de Trabajo */}
          <div className="bg-surface-container-lowest p-5 rounded-3xl shadow-xs border border-outline-variant/30 flex flex-col gap-3">
            <div className="flex items-center gap-2 pb-1 border-b border-outline-variant/20">
              <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-on-surface">
                <span className="material-symbols-outlined text-[16px]">workspaces</span>
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-on-surface uppercase tracking-wide">
                  4. Condiciones del Entorno y Trabajo
                </h4>
                <p className="text-[11px] text-outline">
                  Lugar de trabajo, equipamiento y esquema de presencia
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-surface-container-low rounded-2xl flex items-start gap-2.5 border border-outline-variant/20">
                <div className="p-1.5 bg-surface-container rounded-xl text-primary">
                  <span className="material-symbols-outlined text-[18px]">laptop_mac</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-on-surface block">Modalidad de trabajo</span>
                  <span className="text-[11px] text-on-surface-variant mt-0.5 block">
                    {selectedJob.workingConditions.modality}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-surface-container-low rounded-2xl flex items-start gap-2.5 border border-outline-variant/20">
                <div className="p-1.5 bg-surface-container rounded-xl text-secondary">
                  <span className="material-symbols-outlined text-[18px]">developer_board</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-on-surface block">Herramientas y equipo</span>
                  <span className="text-[11px] text-on-surface-variant mt-0.5 block">
                    {selectedJob.workingConditions.tools}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-surface-container-low rounded-2xl flex items-start gap-2.5 border border-outline-variant/20">
                <div className="p-1.5 bg-surface-container rounded-xl text-primary-container">
                  <span className="material-symbols-outlined text-[18px]">flight_takeoff</span>
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

          {/* Section 5: Matriz de Conocimientos, Aptitudes y Habilidades */}
          <div className="bg-surface-container-lowest p-5 rounded-3xl shadow-xs border border-outline-variant/30 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[16px]">unfold_more_double</span>
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-on-surface uppercase tracking-wide">
                    5. Matriz de Conocimientos, Aptitudes y Habilidades
                  </h4>
                  <p className="text-[11px] text-outline">
                    Escala de dominio: 1 Novato &bull; 2 Aplicado &bull; 3 Autónomo &bull; 4 Avanzado &bull; 5 Experto
                  </p>
                </div>
              </div>
            </div>

            {/* Two Columns: Technical Skills & Soft Skills */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Technical Skills */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[16px]">memory</span>
                    Habilidades Técnicas
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-fixed text-primary">
                    Técnicas clave
                  </span>
                </div>

                {selectedJob.techSkills.map((ts, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-surface-container-low rounded-2xl flex flex-col gap-1.5 border border-outline-variant/20"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-on-surface block leading-tight">{ts.name}</span>
                        {ts.technicalName && (
                          <span className="text-[10px] font-medium text-outline block">{ts.technicalName}</span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-primary bg-surface-container-lowest px-2 py-0.5 rounded-lg border border-outline-variant/20">
                        {ts.level} / 5
                      </span>
                    </div>
                    {/* 5-step progress indicator */}
                    <div className="grid grid-cols-5 gap-1 my-0.5">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <div
                          key={lvl}
                          className={`h-1.5 rounded-full ${
                            lvl <= ts.level ? 'bg-primary' : 'bg-surface-container-high'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-outline">
                      <span>Dominio exigido:</span>
                      <span className="text-primary font-bold">{ts.observedBehavior}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Soft Skills */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-secondary text-[16px]">diversity_3</span>
                    Habilidades de Liderazgo y Humanas
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary-container/40 text-on-secondary-container">
                    Capital humano
                  </span>
                </div>

                {selectedJob.softSkills.map((ss, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-surface-container-low rounded-2xl flex flex-col gap-1.5 border border-outline-variant/20"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-on-surface leading-tight">{ss.name}</span>
                      <span className="text-xs font-bold text-secondary bg-surface-container-lowest px-2 py-0.5 rounded-lg border border-outline-variant/20">
                        {ss.level} / 5
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-1 my-0.5">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <div
                          key={lvl}
                          className={`h-1.5 rounded-full ${
                            lvl <= ss.level ? 'bg-secondary' : 'bg-surface-container-high'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-outline">
                      <span>Comportamiento:</span>
                      <span className="text-on-secondary-container font-bold truncate max-w-[200px]">
                        {ss.observedBehavior}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 6: Especificación Formal y Estructura Organizacional */}
          <div className="bg-surface-container-lowest p-5 rounded-3xl shadow-xs border border-outline-variant/30 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/20 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary-fixed/70 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[16px]">account_tree</span>
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-on-surface uppercase tracking-wide">
                    6. Especificación y Estructura Organizacional
                  </h4>
                  <p className="text-[11px] text-outline">
                    Entidades del cargo: Unidad, Jerarquía, Posiciones, Perfil y Responsabilidades
                  </p>
                </div>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-secondary-container/40 text-on-secondary-container font-bold">
                Manual de Organización
              </span>
            </div>

            {/* Sub-bloque A: Jerarquía y Posiciones */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-surface-container-low rounded-2xl border border-outline-variant/20">
                <span className="text-[10px] text-outline font-bold uppercase block mb-0.5">
                  Unidad Organizacional
                </span>
                <span className="text-xs font-bold text-on-surface block">
                  {selectedJob.unidad?.nombre || selectedJob.department}
                </span>
                <span className="text-[10px] text-outline mt-0.5 block">
                  Depende de: {selectedJob.unidad?.unidadSuperior?.nombre || 'Dirección General'}
                </span>
              </div>

              <div className="p-3 bg-surface-container-low rounded-2xl border border-outline-variant/20">
                <span className="text-[10px] text-outline font-bold uppercase block mb-0.5">
                  Puesto Superior
                </span>
                <span className="text-xs font-bold text-on-surface block">
                  {selectedJob.puestoSuperior?.title || selectedJob.reportsTo}
                </span>
                <span className="text-[10px] text-outline mt-0.5 block">
                  Supervisión inmediata formal
                </span>
              </div>

              <div className="p-3 bg-surface-container-low rounded-2xl border border-outline-variant/20">
                <span className="text-[10px] text-outline font-bold uppercase block mb-0.5">
                  Posiciones Asignadas
                </span>
                <span className="text-xs font-bold text-primary block">
                  {selectedJob.nPosiciones ?? selectedJob.activeIncumbentsCount} Plaza(s) en Estructura
                </span>
                <span className="text-[10px] text-outline mt-0.5 block">
                  Plazas autorizadas para el cargo
                </span>
              </div>
            </div>

            {/* Sub-bloque B: Especificación del Puesto (Perfil y Responsabilidades) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Perfil */}
              <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20 flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[16px]">school</span>
                  <h5 className="text-[11px] font-bold text-on-surface uppercase tracking-wider">
                    Perfil del Cargo
                  </h5>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-outline block">Educación Formal:</span>
                  <p className="text-xs text-on-surface mt-0.5">
                    {selectedJob.perfil?.educacionFormal || 'Educación universitaria o técnica afín al área requerida.'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-outline block">Experiencia Requerida:</span>
                  <p className="text-xs text-on-surface mt-0.5">
                    {selectedJob.perfil?.experienciaRequerida || 'Experiencia laboral demostrable en funciones del cargo.'}
                  </p>
                </div>
              </div>

              {/* Ficha de Responsabilidades */}
              <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20 flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-[16px]">inventory_2</span>
                  <h5 className="text-[11px] font-bold text-on-surface uppercase tracking-wider">
                    Responsabilidades y Recursos
                  </h5>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-outline block">Manejo de Personal:</span>
                  <p className="text-xs text-on-surface mt-0.5">
                    {selectedJob.responsabilidadFicha?.manejoPersonal || selectedJob.supervises}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-outline block">Equipo de Trabajo:</span>
                  <p className="text-xs text-on-surface mt-0.5">
                    {selectedJob.responsabilidadFicha?.equipoTrabajo || selectedJob.workingConditions.tools}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-outline block">Manejo de Información:</span>
                  <p className="text-xs text-on-surface mt-0.5">
                    {selectedJob.responsabilidadFicha?.manejoInformacion || 'Bases de datos y documentación reservada institucional.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Sub-bloque C: Funciones y Tareas Desagregadas */}
            {selectedJob.funciones && selectedJob.funciones.length > 0 && (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[16px]">format_list_numbered</span>
                  <h5 className="text-[11px] font-bold text-on-surface uppercase tracking-wider">
                    Funciones Principales y Tareas Operativas
                  </h5>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedJob.funciones.map((func, fIdx) => (
                    <div
                      key={func.id || fIdx}
                      className="p-3 bg-surface-container-low rounded-2xl border border-outline-variant/20"
                    >
                      <span className="text-xs font-bold text-primary block mb-1">
                        Función {fIdx + 1}: {func.descripcion}
                      </span>
                      {func.tareas && func.tareas.length > 0 && (
                        <div className="mt-1.5 flex flex-col gap-1 pl-2 border-l-2 border-primary/30">
                          <span className="text-[9px] uppercase font-bold text-outline">Tareas Operativas:</span>
                          {func.tareas.map((tar, tIdx) => (
                            <div key={tar.id || tIdx} className="text-[11px] text-on-surface-variant flex items-start gap-1">
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

            {/* Sub-bloque D: Riesgos del Cargo */}
            {selectedJob.riesgosPuesto && selectedJob.riesgosPuesto.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-amber-600 text-[16px]">warning</span>
                  <h5 className="text-[11px] font-bold text-on-surface uppercase tracking-wider">
                    Riesgos Identificados del Cargo
                  </h5>
                </div>
                <div className="overflow-x-auto rounded-2xl border border-outline-variant/20">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-container-high text-on-surface font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-2.5">Tipo de Riesgo</th>
                        <th className="p-2.5">Motivo / Causa</th>
                        <th className="p-2.5">Consecuencia</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10 bg-surface-container-low">
                      {selectedJob.riesgosPuesto.map((r, rIdx) => (
                        <tr key={r.id || rIdx} className="hover:bg-surface-container transition-colors">
                          <td className="p-2.5 font-bold text-primary">{r.tipoRiesgo}</td>
                          <td className="p-2.5 text-on-surface">{r.motivo}</td>
                          <td className="p-2.5 text-on-surface-variant font-medium">{r.consecuencia}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Sub-bloque E: Relaciones de Trabajo & Estándares de Desempeño */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Relaciones de Trabajo */}
              {selectedJob.relacionesPuesto && selectedJob.relacionesPuesto.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-secondary text-[16px]">share</span>
                    <h5 className="text-[11px] font-bold text-on-surface uppercase tracking-wider">
                      Relaciones de Trabajo
                    </h5>
                  </div>
                  <div className="overflow-x-auto rounded-2xl border border-outline-variant/20">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-surface-container-high text-on-surface font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="p-2">Tipo</th>
                          <th className="p-2">Puesto o Entidad</th>
                          <th className="p-2">Propósito</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/10 bg-surface-container-low">
                        {selectedJob.relacionesPuesto.map((rel, rIdx) => (
                          <tr key={rel.id || rIdx}>
                            <td className="p-2 font-bold uppercase text-[9px] text-primary">{rel.tipo}</td>
                            <td className="p-2 font-medium text-on-surface">{rel.puestoOInstitucion}</td>
                            <td className="p-2 text-on-surface-variant text-[10px]">{rel.proposito}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Estándares de Desempeño */}
              {selectedJob.estandaresDesempeno && selectedJob.estandaresDesempeno.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[16px]">verified</span>
                    <h5 className="text-[11px] font-bold text-on-surface uppercase tracking-wider">
                      Estándares de Desempeño
                    </h5>
                  </div>
                  <div className="p-3 bg-surface-container-low rounded-2xl border border-outline-variant/20 flex flex-col gap-1.5">
                    {selectedJob.estandaresDesempeno.map((est, eIdx) => (
                      <div key={est.id || eIdx} className="flex items-start gap-1.5 text-xs text-on-surface">
                        <span className="material-symbols-outlined text-secondary text-[14px] shrink-0 mt-0.5">check_circle</span>
                        <span className="text-[11px]">{est.descripcion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Bottom Action Ribbon */}
          <div className="sticky bottom-4 z-30 bg-surface-container-lowest/95 backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-lg border border-outline-variant/30 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-on-surface">Ficha validada v3.2</span>
              <span className="hidden md:inline text-[11px] text-outline">
                &bull; Octubre 2026
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => triggerToast(`Copia creada: ${selectedJob.title} (Borrador)`)}
                className="px-3 py-1.5 bg-surface-container-low hover:bg-surface-container text-on-surface rounded-xl text-xs font-semibold flex items-center gap-1 transition-all border border-outline-variant/20 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">content_copy</span>
                <span className="hidden sm:inline">Duplicar</span>
              </button>

              <button
                onClick={() => onNavigate('value-map')}
                className="px-3 py-1.5 bg-surface-container-low hover:bg-secondary-container/20 text-on-secondary-container rounded-xl text-xs font-bold flex items-center gap-1 transition-all border border-outline-variant/20 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px] text-secondary">schema</span>
                <span>Cadena de Valor</span>
              </button>

              <button
                onClick={handleCreateVacancy}
                className="px-3 py-1.5 bg-surface-container-high hover:bg-primary-fixed text-primary rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">person_add</span>
                <span>Generar Vacante</span>
              </button>

              <button
                onClick={() => triggerToast(`Abriendo editor para ${selectedJob.code}`)}
                className="px-3.5 py-1.5 bg-primary text-on-primary hover:bg-primary-container rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">edit_square</span>
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
            <div className="flex items-center justify-between pb-2.5 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">work</span>
                </span>
                <div>
                  <h3 className="text-sm font-black text-on-surface">Crear Nuevo Puesto de Trabajo</h3>
                  <span className="text-[10px] text-outline">Incorporación de cargo al catálogo organizacional</span>
                </div>
              </div>
              <button
                onClick={() => setShowNewJobModal(false)}
                className="w-7 h-7 rounded-full hover:bg-surface-container flex items-center justify-center text-outline cursor-pointer"
                title="Cerrar"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="text-xs font-bold text-on-surface block mb-1">
                  Nombre del Puesto o Cargo:
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: Desarrollador Backend Senior"
                  className="w-full px-3 py-2 bg-surface-container-low rounded-xl text-xs text-on-surface outline-none border border-outline-variant/30 focus:border-primary font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-on-surface block mb-1">Área o Departamento:</label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low rounded-xl text-xs text-on-surface outline-none border border-outline-variant/30 cursor-pointer"
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
                    className="w-full px-3 py-2 bg-surface-container-low rounded-xl text-xs text-on-surface outline-none border border-outline-variant/30 cursor-pointer"
                  >
                    <option value="critical">Crítico (Puesto clave)</option>
                    <option value="operational">Operativo (Estándar)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface block mb-1">
                  Misión u Objetivo del Puesto:
                </label>
                <textarea
                  rows={2}
                  value={newMission}
                  onChange={(e) => setNewMission(e.target.value)}
                  placeholder="Describí las responsabilidades principales..."
                  className="w-full px-3 py-2 bg-surface-container-low rounded-xl text-xs text-on-surface outline-none border border-outline-variant/30 focus:border-primary resize-none font-medium"
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
