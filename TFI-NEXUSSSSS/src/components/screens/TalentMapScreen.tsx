import React, { useState } from 'react';
import { TalentPerson, ScreenId } from '../../types';
import { TALENT_PERSONS } from '../../data/mockData';
import { UserAvatar } from '../UserAvatar';
import { QuickGuideBanner } from '../QuickGuideBanner';
import { HelpTooltip } from '../HelpTooltip';
import { employeesApi } from '../../services/api';

interface TalentMapScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onSelectEmployee?: (employeeId: string) => void;
}

export const TalentMapScreen: React.FC<TalentMapScreenProps> = ({
  onNavigate,
  onSelectEmployee,
}) => {
  const [selectedDimension, setSelectedDimension] = useState<'all' | 'skills' | 'value'>('all');
  const [selectedDomain, setSelectedDomain] = useState('Ingeniería & Producto');
  const [selectedViewMode, setSelectedViewMode] = useState<'graph' | 'flow'>('graph');
  const [activePersonId, setActivePersonId] = useState<string>('sofia');
  const [searchFilter, setSearchFilter] = useState('');
  const [skillLevelFilter, setSkillLevelFilter] = useState<string>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [hideGaps, setHideGaps] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  const activePerson: TalentPerson =
    TALENT_PERSONS.find((p) => p.id === activePersonId) || TALENT_PERSONS[0];

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(Math.max(Number((prev + delta).toFixed(2)), 0.75), 1.35));
  };

  const resetZoom = () => setZoomLevel(1.0);

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleGoToEmployee = () => {
    if (onSelectEmployee) {
      onSelectEmployee(activePerson.id);
      return;
    }
    onNavigate('empleados');
  };

  return (
    <div className="w-full px-6 lg:px-8 py-6 flex flex-col gap-6">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-outline-variant/30 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="material-symbols-outlined text-secondary-container">check_circle</span>
          <span className="text-sm font-semibold">{showToast}</span>
        </div>
      )}

      {/* Compact Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <h1 className="text-xl lg:text-2xl font-black text-on-surface tracking-tight font-headline">
            Mapa de Talento y Habilidades
          </h1>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            248 colaboradores mapeados
          </span>
        </div>

        {/* Domain Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex items-center bg-surface-container-lowest px-3 py-1.5 rounded-xl shadow-2xs border border-outline-variant/30 text-xs font-bold">
            <span className="material-symbols-outlined text-outline text-[16px] mr-1.5">domain</span>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="bg-transparent text-xs font-bold text-on-surface outline-hidden cursor-pointer pr-2"
              aria-label="Seleccionar dominio o área"
            >
              <option value="Ingeniería & Producto">Ingeniería &amp; Producto</option>
              <option value="Operaciones & Logística">Operaciones &amp; Logística</option>
              <option value="Estrategia & Finanzas">Estrategia &amp; Finanzas</option>
              <option value="Desarrollo Global & HR">Recursos Humanos &amp; Personas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Slim Guide Bar */}
      <QuickGuideBanner
        title="Guía del Mapa de Talento"
        description="Explorá relaciones de colaboradores con habilidades, squads y valor."
        tips={[
          'Hacé clic en cualquier empleado en la lista izquierda para ver sus detalles en el panel lateral.',
          'La columna central te mostrará sus habilidades y nivel de dominio alcanzado.',
          'La columna derecha te indica a qué puestos y funciones clave aporta esa persona.',
        ]}
        dismissible={true}
      />

      {/* Compact 4-Metric Status Strip (Saves over 110px of vertical space) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="bg-surface-container-lowest px-3.5 py-2.5 rounded-xl border border-outline-variant/30 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-outline block">Personas Mapeadas</span>
            <div className="text-base font-black text-on-surface">
              248 <span className="text-[11px] font-normal text-outline">activos</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold">
            98.2% Enlazado
          </span>
        </div>

        <div className="bg-surface-container-lowest px-3.5 py-2.5 rounded-xl border border-outline-variant/30 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-outline block">Cobertura Habilidades</span>
            <div className="text-base font-black text-on-surface">
              94.2% <span className="text-[11px] font-bold text-emerald-600">Óptimo</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
            Nivel Alto
          </span>
        </div>

        <div className="bg-surface-container-lowest px-3.5 py-2.5 rounded-xl border border-outline-variant/30 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-outline block">Puestos Críticos</span>
            <div className="text-base font-black text-on-surface">
              18 <span className="text-[11px] font-normal text-outline">roles clave</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-tertiary-fixed text-on-tertiary-fixed-variant text-[10px] font-bold">
            100% Cubiertos
          </span>
        </div>

        <div className="bg-surface-container-lowest px-3.5 py-2.5 rounded-xl border border-outline-variant/30 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-outline block">Equipos Conectados</span>
            <div className="text-base font-black text-on-surface">
              32 <span className="text-[11px] font-normal text-outline">squads</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-surface-container-high text-primary text-[10px] font-bold">
            +24.6% Sinergia
          </span>
        </div>
      </div>

      {/* Unified Filter Toolbar (Dimension Tabs + Skill Level Filter + Gap Toggle + Search in 1 Line) */}
      <div className="bg-surface-container-lowest px-4 py-2 rounded-2xl border border-outline-variant/30 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Dimension Tabs */}
        <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-outline-variant/20">
          <button
            type="button"
            onClick={() => setSelectedDimension('all')}
            className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
              selectedDimension === 'all'
                ? 'bg-surface-container-lowest text-primary shadow-xs font-black'
                : 'text-outline hover:text-on-surface'
            }`}
          >
            Ver Todo
          </button>
          <button
            type="button"
            onClick={() => setSelectedDimension('skills')}
            className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
              selectedDimension === 'skills'
                ? 'bg-surface-container-lowest text-primary shadow-xs font-black'
                : 'text-outline hover:text-on-surface'
            }`}
          >
            Habilidades
          </button>
          <button
            type="button"
            onClick={() => setSelectedDimension('value')}
            className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
              selectedDimension === 'value'
                ? 'bg-surface-container-lowest text-primary shadow-xs font-black'
                : 'text-outline hover:text-on-surface'
            }`}
          >
            Puestos de Valor
          </button>
        </div>

        {/* Skill Levels & Gap Risk Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-outline">Nivel:</span>
          <div className="flex items-center gap-1">
            {(['all', '5', '4', '3'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setSkillLevelFilter(lvl)}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  skillLevelFilter === lvl
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {lvl === 'all' ? 'Todos' : `Nv. ${lvl}`}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-outline-variant/30 mx-1 hidden sm:block" />

          <button
            type="button"
            onClick={() => setHideGaps(!hideGaps)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              hideGaps
                ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                : 'bg-surface-container text-outline hover:text-on-surface'
            }`}
            title="Alternar visualización de brechas de sucesión"
          >
            <span className="material-symbols-outlined text-[15px] text-tertiary">warning</span>
            <span>{hideGaps ? 'Brechas activas' : 'Ocultar brechas'}</span>
          </button>
        </div>

        {/* Search in Canvas */}
        <div className="relative flex items-center min-w-[200px]">
          <span className="material-symbols-outlined absolute left-2.5 text-outline text-[16px]">
            search
          </span>
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filtrar por nombre..."
            className="w-full pl-8 pr-3 py-1 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline text-xs outline-hidden focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary border border-outline-variant/30"
          />
        </div>
      </div>

      {/* MAIN TALENT MAP WORKSPACE: Graph Canvas + Floating Inspector */}
      <div className="relative w-full flex flex-col lg:flex-row gap-5 items-start">
        {/* GRAPH CANVAS CONTAINER */}
        <div className="relative flex-1 w-full bg-surface-container-lowest rounded-3xl shadow-xs border border-outline-variant/30 p-4 lg:p-5 min-h-[780px] flex flex-col justify-between overflow-hidden">
          {/* Top Canvas Bar: Layer Headers & Floating Zoom Tooling */}
          <div className="z-20 flex items-center justify-between gap-3 pb-3 border-b border-outline-variant/20">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">hub</span>
              <span className="text-xs font-bold text-on-surface">Mapa Sináptico de Conexiones</span>
              <span className="text-[11px] text-outline hidden sm:inline">&bull; Desplazá horizontalmente o ajustá el zoom</span>
            </div>

            {/* Float Zoom Tooling */}
            <div className="flex items-center bg-surface-container-low/90 backdrop-blur-md p-1 rounded-2xl shadow-2xs border border-outline-variant/30">
              <button
                onClick={() => handleZoom(-0.1)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all cursor-pointer"
                title="Alejar"
              >
                <span className="material-symbols-outlined text-[16px]">remove</span>
              </button>
              <span className="px-2 text-xs text-on-surface font-bold min-w-[42px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => handleZoom(0.1)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all cursor-pointer"
                title="Acercar"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
              </button>
              <div className="h-4 w-px bg-outline-variant/40 mx-1" />
              <button
                onClick={resetZoom}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all cursor-pointer"
                title="Restablecer zoom"
              >
                <span className="material-symbols-outlined text-[16px]">crop_free</span>
              </button>
            </div>
          </div>

          {/* HORIZONTALLY SCROLLABLE WORKSPACE (Guarantees columns 4 & 5 are never clipped on any screen) */}
          <div className="w-full overflow-x-auto pb-3 pt-2">
            <div
              className="relative w-[1160px] h-[700px] select-none transition-transform duration-200 origin-top-left"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              {/* 5-Stage Header Column Labels (Accurately aligned over each column) */}
              <div className="relative h-12 w-full mb-2">
                <div className="absolute left-4 w-[190px] px-2 py-1.5 rounded-xl bg-surface-container-low/80 backdrop-blur-md border border-outline-variant/20 text-center">
                  <span className="text-xs font-bold text-on-surface uppercase tracking-wider block">
                    1. Personas
                  </span>
                  <span className="text-[11px] text-outline">Talento Clave</span>
                </div>
                <div className="absolute left-[270px] w-[190px] px-2 py-1.5 rounded-xl bg-primary-fixed/30 backdrop-blur-md border border-primary/20 text-center">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                    2. Habilidades
                  </span>
                  <span className="text-[11px] text-outline">Lo que dominan</span>
                </div>
                <div className="absolute left-[500px] w-[190px] px-2 py-1.5 rounded-xl bg-surface-container-low/80 backdrop-blur-md border border-outline-variant/20 text-center">
                  <span className="text-xs font-bold text-on-surface uppercase tracking-wider block">
                    3. Equipos
                  </span>
                  <span className="text-[11px] text-outline">Equipos centrales</span>
                </div>
                <div className="absolute left-[730px] w-[190px] px-2 py-1.5 rounded-xl bg-surface-container-low/80 backdrop-blur-md border border-outline-variant/20 text-center">
                  <span className="text-xs font-bold text-on-surface uppercase tracking-wider block">
                    4. Actividades
                  </span>
                  <span className="text-[11px] text-outline">Procesos del negocio</span>
                </div>
                <div className="absolute left-[950px] w-[190px] px-2 py-1.5 rounded-xl bg-secondary-fixed/30 backdrop-blur-md border border-secondary/20 text-center">
                  <span className="text-xs font-bold text-secondary uppercase tracking-wider block">
                    5. Impacto
                  </span>
                  <span className="text-[11px] text-outline">Generación Valor</span>
                </div>
              </div>

              {/* Synaptic SVG Curvature Backbone */}
              <svg
                className="absolute inset-0 top-12 w-full h-[640px] pointer-events-none z-0"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="grad-active-violet" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#006C49" stopOpacity="0.75" />
                  </linearGradient>
                  <linearGradient id="grad-default" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" stopColor="#CCC3D8" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#CCC3D8" stopOpacity="0.25" />
                  </linearGradient>
                  <linearGradient id="grad-coral" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" stopColor="#C81A42" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.6" />
                  </linearGradient>
                </defs>

                {/* Dynamic Path Curves based on activePersonId */}
                {/* Sofía Synapses (from Persona right edge ~206px to Skills left edge 270px) */}
                <path
                  d="M 206 140 C 238 140, 245 100, 270 100"
                  fill="none"
                  stroke={activePersonId === 'sofia' ? 'url(#grad-active-violet)' : 'url(#grad-default)'}
                  strokeWidth={activePersonId === 'sofia' ? '3' : '1.5'}
                />
                <path
                  d="M 206 140 C 238 140, 245 220, 270 220"
                  fill="none"
                  stroke={activePersonId === 'sofia' ? 'url(#grad-active-violet)' : 'url(#grad-default)'}
                  strokeWidth={activePersonId === 'sofia' ? '3' : '1.5'}
                />

                {/* Carlos Synapses */}
                <path
                  d="M 206 350 C 238 350, 245 220, 270 220"
                  fill="none"
                  stroke={activePersonId === 'carlos' ? 'url(#grad-active-violet)' : 'url(#grad-default)'}
                  strokeWidth={activePersonId === 'carlos' ? '3' : '1.5'}
                  strokeDasharray={activePersonId === 'carlos' ? undefined : '3,3'}
                />
                <path
                  d="M 206 350 C 238 350, 245 370, 270 370"
                  fill="none"
                  stroke={activePersonId === 'carlos' ? 'url(#grad-active-violet)' : 'url(#grad-default)'}
                  strokeWidth={activePersonId === 'carlos' ? '3' : '1.5'}
                />

                {/* Valeria Synapses */}
                <path
                  d="M 206 540 C 238 540, 245 480, 270 480"
                  fill="none"
                  stroke={activePersonId === 'valeria' ? 'url(#grad-active-violet)' : 'url(#grad-default)'}
                  strokeWidth={activePersonId === 'valeria' ? '3' : '1.5'}
                />
                <path
                  d="M 206 540 C 238 540, 245 570, 270 570"
                  fill="none"
                  stroke={activePersonId === 'valeria' ? 'url(#grad-active-violet)' : 'url(#grad-default)'}
                  strokeWidth={activePersonId === 'valeria' ? '3' : '1.5'}
                />

                {/* Skills (right edge 460px) -> Squads (left edge 500px) */}
                <path
                  d="M 460 100 C 480 100, 485 170, 500 170"
                  fill="none"
                  stroke={activePersonId === 'sofia' ? 'url(#grad-active-violet)' : 'url(#grad-default)'}
                  strokeWidth={activePersonId === 'sofia' ? '3' : '1.5'}
                />
                <path
                  d="M 460 220 C 480 220, 485 170, 500 170"
                  fill="none"
                  stroke={activePersonId === 'sofia' ? 'url(#grad-active-violet)' : 'url(#grad-default)'}
                  strokeWidth={activePersonId === 'sofia' ? '3' : '1.5'}
                />
                <path
                  d="M 460 370 C 480 370, 485 350, 500 350"
                  fill="none"
                  stroke={activePersonId === 'carlos' ? 'url(#grad-active-violet)' : 'url(#grad-default)'}
                  strokeWidth={activePersonId === 'carlos' ? '3' : '1.5'}
                />
                <path
                  d="M 460 480 C 480 480, 485 520, 500 520"
                  fill="none"
                  stroke={activePersonId === 'valeria' ? 'url(#grad-active-violet)' : 'url(#grad-default)'}
                  strokeWidth={activePersonId === 'valeria' ? '3' : '1.5'}
                />

                {/* Squads (right edge 690px) -> Business Activities (left edge 730px) */}
                <path
                  d="M 690 170 C 710 170, 715 120, 730 120"
                  fill="none"
                  stroke={activePersonId === 'sofia' ? 'url(#grad-active-violet)' : 'url(#grad-default)'}
                  strokeWidth={activePersonId === 'sofia' ? '3' : '1.5'}
                />
                <path
                  d="M 690 170 C 710 170, 715 240, 730 240"
                  fill="none"
                  stroke="url(#grad-default)"
                  strokeWidth="1.5"
                />
                <path
                  d="M 690 350 C 710 350, 715 370, 730 370"
                  fill="none"
                  stroke={activePersonId === 'carlos' ? 'url(#grad-active-violet)' : 'url(#grad-default)'}
                  strokeWidth={activePersonId === 'carlos' ? '3' : '1.5'}
                />
                <path
                  d="M 690 520 C 710 520, 715 520, 730 520"
                  fill="none"
                  stroke={activePersonId === 'valeria' ? 'url(#grad-active-violet)' : 'url(#grad-default)'}
                  strokeWidth={activePersonId === 'valeria' ? '3' : '1.5'}
                />

                {/* Activities (right edge 920px) -> Value Outcomes (left edge 950px) */}
                <path
                  d="M 920 120 C 935 120, 940 160, 950 160"
                  fill="none"
                  stroke={activePersonId === 'sofia' ? 'url(#grad-active-violet)' : 'url(#grad-default)'}
                  strokeWidth={activePersonId === 'sofia' ? '3' : '1.5'}
                />
                <path
                  d="M 920 240 C 935 240, 940 300, 950 300"
                  fill="none"
                  stroke="url(#grad-default)"
                  strokeWidth="1.5"
                />
                <path
                  d="M 920 520 C 935 520, 940 460, 950 460"
                  fill="none"
                  stroke={activePersonId === 'valeria' ? 'url(#grad-active-violet)' : 'url(#grad-default)'}
                  strokeWidth={activePersonId === 'valeria' ? '3' : '1.5'}
                />
              </svg>

              {/* COLUMN 1: PERSONAS */}
              <div className="absolute left-4 top-14 bottom-2 w-[190px] flex flex-col justify-around z-10">
                {TALENT_PERSONS.map((person) => {
                  const isSelected = activePersonId === person.id;
                  const matchesSearch =
                    !searchFilter ||
                    person.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                    person.role.toLowerCase().includes(searchFilter.toLowerCase());

                  return (
                    <div
                      key={person.id}
                      onClick={() => setActivePersonId(person.id)}
                      className={`cursor-pointer flex items-center gap-3 p-2.5 rounded-2xl bg-surface-container-lowest transition-all hover:scale-102 border ${
                        isSelected
                          ? 'shadow-md ring-2 ring-primary-container border-primary bg-primary/5'
                          : 'shadow-2xs hover:shadow-xs border-outline-variant/30'
                      } ${matchesSearch ? 'opacity-100' : 'opacity-30'}`}
                    >
                      <UserAvatar
                        name={person.name}
                        size="md"
                        shape="circle"
                        showStatus={true}
                        statusColor={person.riskStatus === 'optimal' ? 'emerald' : 'amber'}
                      />
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-on-surface leading-tight">
                            {person.name}
                          </span>
                          {person.riskStatus === 'optimal' && (
                            <span className="material-symbols-outlined text-primary text-[14px]">
                              verified
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-primary font-semibold line-clamp-1">
                          {person.role}
                        </span>
                        <span className="text-[10px] text-outline">
                          Importancia: {person.criticality}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* COLUMN 2: SKILL DNA */}
              <div className="absolute left-[270px] top-14 bottom-2 w-[190px] flex flex-col justify-around z-10">
                {/* Skill 1 */}
                <div className="bg-surface-container-lowest p-2.5 rounded-xl shadow-2xs hover:shadow-xs transition-all flex flex-col gap-1 border border-primary/30">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-on-surface leading-tight">Inteligencia Artificial</span>
                    <span className="px-1.5 py-0.5 rounded-md bg-primary-container text-on-primary text-[10px] font-bold shrink-0">
                      Nv.5
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary-container h-full w-[96%] rounded-full" />
                  </div>
                  <span className="text-[10px] text-outline font-mono truncate">PyTorch, NLP, RL</span>
                </div>

                {/* Skill 2 */}
                <div className="bg-surface-container-lowest p-2.5 rounded-xl shadow-2xs hover:shadow-xs transition-all flex flex-col gap-1 border border-outline-variant/30">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-on-surface leading-tight">Diseño de sistemas</span>
                    <span className="px-1.5 py-0.5 rounded-md bg-primary-fixed text-primary text-[10px] font-bold shrink-0">
                      Nv.5
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full w-[92%] rounded-full" />
                  </div>
                  <span className="text-[10px] text-outline font-mono truncate">Microservices, Kafka</span>
                </div>

                {/* Skill 3 */}
                <div className="bg-surface-container-lowest p-2.5 rounded-xl shadow-2xs hover:shadow-xs transition-all flex flex-col gap-1 border border-outline-variant/30">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-on-surface leading-tight">Seguridad en la nube</span>
                    <span className="px-1.5 py-0.5 rounded-md bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold shrink-0">
                      Nv.4
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                    <div className="bg-secondary h-full w-[84%] rounded-full" />
                  </div>
                  <span className="text-[10px] text-outline font-mono truncate">Zero Trust, AWS IAM</span>
                </div>

                {/* Skill 4 */}
                <div className="bg-surface-container-lowest p-2.5 rounded-xl shadow-2xs hover:shadow-xs transition-all flex flex-col gap-1 border border-outline-variant/30">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-on-surface leading-tight">Negociación estratégica</span>
                    <span className="px-1.5 py-0.5 rounded-md bg-primary-fixed text-primary text-[10px] font-bold shrink-0">
                      Nv.4
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full w-[80%] rounded-full" />
                  </div>
                  <span className="text-[10px] text-outline font-mono truncate">B2B Enterprise, M&amp;A</span>
                </div>

                {/* Skill 5 */}
                <div className="bg-surface-container-lowest p-2.5 rounded-xl shadow-2xs hover:shadow-xs transition-all flex flex-col gap-1 border border-outline-variant/30">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-on-surface leading-tight">Necesidades del cliente</span>
                    <span className="px-1.5 py-0.5 rounded-md bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold shrink-0">
                      Nv.5
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                    <div className="bg-secondary h-full w-[94%] rounded-full" />
                  </div>
                  <span className="text-[10px] text-outline font-mono truncate">Dual-Track Agile</span>
                </div>
              </div>

              {/* COLUMN 3: SQUADS */}
              <div className="absolute left-[500px] top-14 bottom-2 w-[190px] flex flex-col justify-around z-10">
                {/* Squad 1 */}
                <div className="bg-surface-container-lowest p-3 rounded-2xl shadow-2xs hover:shadow-xs transition-all flex flex-col gap-1.5 border border-primary-container/40">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[18px]">groups_3</span>
                    <span className="text-xs font-bold text-on-surface">Nexus Core</span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant leading-tight">
                    Equipo de algoritmos e Inteligencia Artificial
                  </span>
                  <div className="flex items-center justify-between text-outline text-[11px] pt-1 border-t border-outline-variant/20">
                    <span>9 Miembros</span>
                    <span className="text-secondary font-bold">100% Sinergia</span>
                  </div>
                </div>

                {/* Squad 2 */}
                <div className="bg-surface-container-lowest p-3 rounded-2xl shadow-2xs hover:shadow-xs transition-all flex flex-col gap-1.5 border border-outline-variant/30">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-secondary text-[18px]">dns</span>
                    <span className="text-xs font-bold text-on-surface">Resiliencia Cloud</span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant leading-tight">
                    Infraestructura crítica de plataforma
                  </span>
                  <div className="flex items-center justify-between text-outline text-[11px] pt-1 border-t border-outline-variant/20">
                    <span>14 Miembros</span>
                    <span className="text-secondary font-bold">96% Cobertura</span>
                  </div>
                </div>

                {/* Squad 3 */}
                <div className="bg-surface-container-lowest p-3 rounded-2xl shadow-2xs hover:shadow-xs transition-all flex flex-col gap-1.5 border border-outline-variant/30">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-tertiary-container text-[18px]">
                      rocket_launch
                    </span>
                    <span className="text-xs font-bold text-on-surface">Growth Engine</span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant leading-tight">
                    Expansión de mercados y cuentas clave
                  </span>
                  <div className="flex items-center justify-between text-outline text-[11px] pt-1 border-t border-outline-variant/20">
                    <span>11 Miembros</span>
                    <span className="text-secondary font-bold">92% Cobertura</span>
                  </div>
                </div>
              </div>

              {/* COLUMN 4: ACTIVIDADES DE NEGOCIO */}
              <div className="absolute left-[730px] top-14 bottom-2 w-[190px] flex flex-col justify-around z-10">
                <div className="bg-surface-container-lowest p-3 rounded-2xl shadow-2xs hover:shadow-xs transition-all flex flex-col gap-1 border border-primary-container/30">
                  <span className="px-2 py-0.5 rounded-full bg-primary-fixed/40 text-primary text-[10px] font-bold w-max">
                    Primaria
                  </span>
                  <span className="text-xs font-bold text-on-surface leading-tight">
                    Optimización Algorítmica
                  </span>
                  <span className="text-[10px] text-on-surface-variant">
                    Rutas Logísticas en Tiempo Real
                  </span>
                </div>

                <div className="bg-surface-container-lowest p-3 rounded-2xl shadow-2xs hover:shadow-xs transition-all flex flex-col gap-1 border border-outline-variant/30">
                  <span className="px-2 py-0.5 rounded-full bg-secondary-fixed/40 text-on-secondary-fixed-variant text-[10px] font-bold w-max">
                    Soporte
                  </span>
                  <span className="text-xs font-bold text-on-surface leading-tight">
                    Automatización Despachos
                  </span>
                  <span className="text-[10px] text-on-surface-variant">Centro de despachos robotizado</span>
                </div>

                <div className="bg-surface-container-lowest p-3 rounded-2xl shadow-2xs hover:shadow-xs transition-all flex flex-col gap-1 border border-outline-variant/30">
                  <span className="px-2 py-0.5 rounded-full bg-secondary-fixed/40 text-on-secondary-fixed-variant text-[10px] font-bold w-max">
                    Soporte
                  </span>
                  <span className="text-xs font-bold text-on-surface leading-tight">
                    Blindaje Cloud 99.99%
                  </span>
                  <span className="text-[10px] text-on-surface-variant">Respaldo automático ante fallas</span>
                </div>

                <div className="bg-surface-container-lowest p-3 rounded-2xl shadow-2xs hover:shadow-xs transition-all flex flex-col gap-1 border border-outline-variant/30">
                  <span className="px-2 py-0.5 rounded-full bg-primary-fixed/40 text-primary text-[10px] font-bold w-max">
                    Primaria
                  </span>
                  <span className="text-xs font-bold text-on-surface leading-tight">
                    Expansión B2B Enterprise
                  </span>
                  <span className="text-[10px] text-on-surface-variant">Cuentas clave de primer nivel</span>
                </div>
              </div>

              {/* COLUMN 5: IMPACTO DE VALOR */}
              <div className="absolute left-[950px] top-14 bottom-2 w-[190px] flex flex-col justify-around z-10">
                <div className="bg-surface-container-lowest p-3 rounded-2xl shadow-2xs border-2 border-secondary-container transition-all flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-secondary">
                    <span className="material-symbols-outlined text-[18px]">trending_up</span>
                    <span className="text-[10px] font-bold uppercase">Rentabilidad</span>
                  </div>
                  <span className="text-xl font-extrabold text-on-surface">+18.4%</span>
                  <span className="text-[11px] text-on-surface-variant">Margen Operativo Neto</span>
                </div>

                <div className="bg-surface-container-lowest p-3 rounded-2xl shadow-2xs border border-outline-variant/30 transition-all flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-primary">
                    <span className="material-symbols-outlined text-[18px]">speed</span>
                    <span className="text-[10px] font-bold uppercase">Velocidad</span>
                  </div>
                  <span className="text-xl font-extrabold text-on-surface">-40%</span>
                  <span className="text-[11px] text-on-surface-variant">Tiempo al mercado</span>
                </div>

                <div className="bg-surface-container-lowest p-3 rounded-2xl shadow-2xs border border-outline-variant/30 transition-all flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-secondary">
                    <span className="material-symbols-outlined text-[18px]">loyalty</span>
                    <span className="text-[10px] font-bold uppercase">Retención</span>
                  </div>
                  <span className="text-xl font-extrabold text-on-surface">98.4%</span>
                  <span className="text-[11px] text-on-surface-variant">Grandes clientes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Canvas Status Legend */}
          <div className="z-20 pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-outline-variant/20 bg-surface-container-lowest text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-1 bg-primary rounded-full" />
                <span className="text-[11px] text-on-surface font-semibold">Seleccionado</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-1 bg-outline-variant rounded-full" />
                <span className="text-[11px] text-on-surface-variant font-medium">Otras conexiones</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[11px] text-on-surface-variant font-medium">Sin riesgo</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-[11px] text-on-surface-variant font-medium">Punto único de falla</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-on-surface-variant text-[11px]">
              <span className="material-symbols-outlined text-[14px] text-primary">touch_app</span>
              <span>Hacé clic en cualquier persona para explorar su red</span>
            </div>
          </div>
        </div>

        {/* RIGHT FLOATING PANEL: INSPECTOR DE NODO ACTIVO */}
        <div className="w-full lg:w-[320px] xl:w-[350px] bg-surface-container-lowest rounded-3xl shadow-xs border border-outline-variant/30 p-5 flex flex-col gap-3.5 shrink-0 transition-all">
          {/* Header */}
          <div className="flex items-center justify-between pb-1 border-b border-outline-variant/20">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">manage_search</span>
              <span className="text-[11px] uppercase font-bold text-outline tracking-wider">
                Detalle de la persona seleccionada
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed/50 text-on-secondary-fixed-variant text-[11px] font-bold">
              Equipo estratégico
            </span>
          </div>

          {/* Node Persona Bio Tile */}
          <div className="flex items-center gap-4 p-3.5 bg-surface-container-low rounded-2xl border border-outline-variant/20">
            <UserAvatar
              name={activePerson.name}
              size="xl"
              shape="rounded"
              showStatus={true}
              statusColor={activePerson.riskStatus === 'optimal' ? 'emerald' : 'amber'}
            />
            <div className="flex flex-col min-w-0">
              <h2 className="text-lg font-bold text-on-surface truncate">{activePerson.name}</h2>
              <span className="text-xs text-primary font-semibold truncate">{activePerson.role}</span>
              <span className="text-[11px] text-outline truncate">{activePerson.squad}</span>
            </div>
          </div>

          {/* Criticality Index Bar */}
          <div className="p-4 bg-surface-container-low/70 rounded-2xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface">Índice de importancia para el negocio</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-extrabold text-primary">{activePerson.criticality}</span>
                <span className="text-xs text-outline font-medium">/ 10.0</span>
              </div>
            </div>
            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
              <div
                className="bg-primary-container h-full rounded-full transition-all duration-500"
                style={{ width: `${activePerson.criticality * 10}%` }}
              />
            </div>
            <span className="text-[11px] text-on-surface-variant leading-tight">
              Su ausencia paralizaría el 64% de la capacidad de optimización con algoritmos y el flujo
              del equipo Nexus Core.
            </span>
          </div>

          {/* Verified Skills */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface">Habilidades Verificadas</span>
              <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                5 Validadas
              </span>
            </div>
            <div className="space-y-2">
              {activePerson.skills.map((skill, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-surface-container-low rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span className="flex flex-col leading-tight">
                      <span className="text-xs font-semibold text-on-surface">{skill.name}</span>
                      {skill.technicalName && (
                        <span className="text-[10px] font-medium text-outline">{skill.technicalName}</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-primary-fixed text-primary text-[10px] font-bold">
                      Nivel {skill.level} / 5
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-emerald-600">
                      verified
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Direct Business Activities */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-on-surface">Puestos y Tareas donde Aporta</span>
            <div className="p-3 bg-surface-container-low rounded-2xl flex flex-col gap-2.5">
              {activePerson.activities.map((act, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">
                    task_alt
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-on-surface">{act.title}</span>
                    <span className="text-[11px] text-outline leading-tight">{act.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={handleGoToEmployee}
              className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
              Ver Ficha Completa del Empleado
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => triggerToast(`Generando plan de relevo para ${activePerson.name}`)}
                className="py-2 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-tertiary">alt_route</span>
                Plan de Relevo
              </button>
              <button
                onClick={async () => {
                  try {
                    triggerToast(`Generando Ficha 360° en PDF de ${activePerson.name}...`);
                    await employeesApi.downloadPdf(activePerson.id, activePerson.name);
                    triggerToast(`Ficha de ${activePerson.name} descargada exitosamente.`);
                  } catch {
                    window.print();
                  }
                }}
                className="py-2 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-primary">
                  file_download
                </span>
                Descargar Ficha
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
