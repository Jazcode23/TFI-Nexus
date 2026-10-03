import React, { useState } from 'react';
import { TalentPerson, ScreenId } from '../../types';
import { TALENT_PERSONS } from '../../data/mockData';
import { UserAvatar } from '../UserAvatar';
import { QuickGuideBanner } from '../QuickGuideBanner';
import { HelpTooltip } from '../HelpTooltip';

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

      {/* Top Header & Friendly Guide */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs tracking-wider text-primary uppercase font-extrabold">
                Vista Estratégica &bull; Organización
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary" />
              <span className="text-xs text-on-surface-variant font-medium">
                Conexión entre personas, habilidades y cargos
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl text-on-surface font-extrabold tracking-tight">
              Mapa de Talento y Habilidades
            </h1>
            <p className="text-xs sm:text-sm text-outline mt-0.5">
              Hacé clic en cualquier colaborador para ver qué habilidades domina y a qué puestos de la empresa aporta valor.
            </p>
          </div>

          {/* Master Action Controls */}
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            {/* Filter Tabs */}
            <div className="flex items-center p-1 bg-surface-container-low rounded-2xl shadow-xs border border-outline-variant/30">
              <button
                onClick={() => setSelectedDimension('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDimension === 'all'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Ver Todo
              </button>
              <button
                onClick={() => setSelectedDimension('skills')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDimension === 'skills'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Habilidades
              </button>
              <button
                onClick={() => setSelectedDimension('value')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDimension === 'value'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Puestos de Valor
              </button>
            </div>

            {/* Area Selector */}
            <div className="relative flex items-center bg-surface-container-lowest px-3 py-1.5 rounded-2xl shadow-xs border border-outline-variant/30">
              <span className="material-symbols-outlined text-outline text-[18px] mr-2">domain</span>
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="bg-transparent text-xs font-bold text-on-surface outline-none cursor-pointer pr-3"
              >
                <option value="Ingeniería & Producto">Ingeniería &amp; Producto</option>
                <option value="Operaciones & Logística">Operaciones &amp; Logística</option>
                <option value="Estrategia & Finanzas">Estrategia &amp; Finanzas</option>
                <option value="Desarrollo Global & HR">Recursos Humanos &amp; Personas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Guide Banner for non-technical users */}
        <QuickGuideBanner
          title="¿Cómo funciona esta pantalla?"
          description="Diseñada para que cualquier persona del equipo pueda entender la estructura de talento en segundos."
          tips={[
            'Hacé clic en cualquier empleado en la lista izquierda para ver sus detalles.',
            'La columna central te mostrará sus habilidades y nivel de dominio alcanzado.',
            'La columna derecha te indica a qué puestos y funciones clave aporta esa persona.',
          ]}
        />
      </div>

      {/* 4 Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-surface-container-lowest p-5 rounded-3xl shadow-sm border border-outline-variant/30 flex flex-col justify-between group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-primary-fixed/40 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">grain</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
              98.2% Enlazado
            </span>
          </div>
          <div>
            <span className="text-[11px] text-outline uppercase tracking-wider block font-bold mb-1">
              Personas Mapeadas
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl text-on-surface font-black tracking-tight">248</span>
              <span className="text-xs text-on-surface-variant font-medium">colaboradores activos</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-on-surface-variant text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>1,420 habilidades registradas</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-surface-container-lowest p-5 rounded-3xl shadow-sm border border-outline-variant/30 flex flex-col justify-between group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-secondary-fixed/40 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[20px]">verified_user</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
              Nivel Alto
            </span>
          </div>
          <div>
            <span className="text-[11px] text-outline uppercase tracking-wider block font-bold mb-1">
              Cobertura de Habilidades
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl text-on-surface font-black tracking-tight">94.2%</span>
              <span className="text-xs text-emerald-600 font-bold">Óptimo</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-on-surface-variant text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Bajo riesgo de desactualización</span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-surface-container-lowest p-5 rounded-3xl shadow-sm border border-outline-variant/30 flex flex-col justify-between group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-tertiary-fixed/50 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[20px]">shield</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-xs font-bold">
              100% Cubiertos
            </span>
          </div>
          <div>
            <span className="text-[11px] text-outline uppercase tracking-wider block font-bold mb-1">
              Puestos Clave con Respaldo
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl text-on-surface font-black tracking-tight">18</span>
              <span className="text-xs text-on-surface-variant font-medium">puestos críticos</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-on-surface-variant text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
              <span>Planes de sucesión activos</span>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-surface-container-lowest p-5 rounded-3xl shadow-sm border border-outline-variant/30 flex flex-col justify-between group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary-container">
              <span className="material-symbols-outlined text-[20px]">groups</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary text-xs font-bold">
              Colaboración
            </span>
          </div>
          <div>
            <span className="text-[11px] text-outline uppercase tracking-wider block font-bold mb-1">
              Equipos Conectados
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl text-on-surface font-black tracking-tight">32</span>
              <span className="text-xs text-on-surface-variant font-medium">equipos coordinados</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-on-surface-variant text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>+24.6% eficiencia multifuncional</span>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Dynamic Filter Ribbon */}
      <div className="bg-surface-container-lowest px-5 py-3 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Skill Level Chips */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-outline uppercase font-bold mr-1">Nivel de habilidad:</span>
            <button
              onClick={() => setSkillLevelFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                skillLevelFilter === 'all'
                  ? 'bg-primary-container text-on-primary'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setSkillLevelFilter('5')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                skillLevelFilter === '5'
                  ? 'bg-primary-container text-on-primary'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              Nv. 5 (Dominio experto)
            </button>
            <button
              onClick={() => setSkillLevelFilter('4')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                skillLevelFilter === '4'
                  ? 'bg-primary-container text-on-primary'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              Nv. 4
            </button>
            <button
              onClick={() => setSkillLevelFilter('3')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                skillLevelFilter === '3'
                  ? 'bg-primary-container text-on-primary'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              Nv. 3
            </button>
          </div>

          <div className="h-5 w-px bg-surface-container-high hidden sm:block" />

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-outline uppercase font-bold mr-1">Tipología:</span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed/40 text-on-secondary-fixed-variant text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              Técnicas
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed/40 text-on-primary-fixed-variant text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Estratégicas y de Liderazgo
            </span>
          </div>

          <div className="h-5 w-px bg-surface-container-high hidden md:block" />

          {/* Gap / Risk Status Toggle */}
          <button
            onClick={() => setHideGaps(!hideGaps)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
              hideGaps
                ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[15px] text-tertiary">warning</span>
            {hideGaps ? 'Mostrando brechas' : 'Ocultar brechas de sucesión'}
          </button>
        </div>

        {/* Search in Canvas */}
        <div className="relative flex items-center min-w-[240px]">
          <span className="material-symbols-outlined absolute left-3 text-outline text-[18px]">
            filter_list
          </span>
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Buscar persona por nombre..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline text-xs outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container/20 transition-all border border-transparent focus:border-outline-variant/40"
          />
        </div>
      </div>

      {/* MAIN TALENT MAP WORKSPACE: Graph Canvas + Floating Inspector */}
      <div className="relative w-full flex flex-col lg:flex-row gap-6 items-start">
        {/* GRAPH CANVAS CONTAINER */}
        <div className="relative flex-1 w-full bg-surface-container-lowest rounded-3xl shadow-sm border border-outline-variant/30 overflow-hidden p-5 min-h-[780px] flex flex-col justify-between">
          {/* Top Canvas Overlays: Layer Headers & Zoom Tooling */}
          <div className="z-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pointer-events-none pb-4 border-b border-outline-variant/20">
            {/* 5-Stage Semantic Alignment Columns Bar */}
            <div className="grid grid-cols-5 w-full max-w-4xl text-center pointer-events-auto gap-2">
              <div className="px-2 py-1.5 rounded-xl bg-surface-container-low/80 backdrop-blur-md border border-outline-variant/20">
                <span className="text-xs font-bold text-on-surface uppercase tracking-wider block">
                  1. Personas
                </span>
                <span className="text-[11px] text-outline">Talento Clave</span>
              </div>
              <div className="px-2 py-1.5 rounded-xl bg-primary-fixed/30 backdrop-blur-md border border-primary/20">
                <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                  2. Habilidades
                </span>
                <span className="text-[11px] text-outline">Lo que dominan</span>
              </div>
              <div className="px-2 py-1.5 rounded-xl bg-surface-container-low/80 backdrop-blur-md border border-outline-variant/20">
                <span className="text-xs font-bold text-on-surface uppercase tracking-wider block">
                  3. Equipos
                </span>
                <span className="text-[11px] text-outline">Equipos centrales</span>
              </div>
              <div className="px-2 py-1.5 rounded-xl bg-surface-container-low/80 backdrop-blur-md border border-outline-variant/20">
                <span className="text-xs font-bold text-on-surface uppercase tracking-wider block">
                  4. Actividades
                </span>
                <span className="text-[11px] text-outline">Procesos del negocio</span>
              </div>
              <div className="px-2 py-1.5 rounded-xl bg-secondary-fixed/30 backdrop-blur-md border border-secondary/20">
                <span className="text-xs font-bold text-secondary uppercase tracking-wider block">
                  5. Impacto
                </span>
                <span className="text-[11px] text-outline">Generación Valor</span>
              </div>
            </div>

            {/* Float Zoom Tooling */}
            <div className="pointer-events-auto flex items-center bg-surface-container-low/90 backdrop-blur-md p-1 rounded-2xl shadow-sm border border-outline-variant/30">
              <button
                onClick={() => handleZoom(-0.1)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all"
                title="Alejar"
              >
                <span className="material-symbols-outlined text-[18px]">remove</span>
              </button>
              <span className="px-2 text-xs text-on-surface font-bold">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => handleZoom(0.1)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all"
                title="Acercar"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
              <div className="h-4 w-px bg-outline-variant/40 mx-1" />
              <button
                onClick={resetZoom}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all"
                title="Restablecer zoom"
              >
                <span className="material-symbols-outlined text-[18px]">crop_free</span>
              </button>
            </div>
          </div>

          {/* INTERACTIVE GRAPH CANVAS LAYER */}
          <div
            className="relative w-full h-[650px] overflow-hidden select-none transition-transform duration-300 origin-top-left"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* Synaptic SVG Curvature Backbone */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-0"
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
              {/* Sofía Synapses */}
              <path
                d="M 175 140 C 220 140, 240 100, 280 100"
                fill="none"
                stroke={activePersonId === 'sofia' ? 'url(#grad-active-violet)' : 'url(#grad-default)'}
                strokeWidth={activePersonId === 'sofia' ? '3' : '1.5'}
              />
              <path
                d="M 175 140 C 220 140, 240 220, 280 220"
                fill="none"
                stroke={activePersonId === 'sofia' ? 'url(#grad-active-violet)' : 'url(#grad-default)'}
                strokeWidth={activePersonId === 'sofia' ? '3' : '1.5'}
              />

              {/* Carlos Synapses */}
              <path
                d="M 175 350 C 220 350, 240 220, 280 220"
                fill="none"
                stroke={activePersonId === 'carlos' ? 'url(#grad-active-violet)' : 'url(#grad-default)'}
                strokeWidth={activePersonId === 'carlos' ? '3' : '1.5'}
                strokeDasharray={activePersonId === 'carlos' ? undefined : '3,3'}
              />
              <path
                d="M 175 350 C 220 350, 240 370, 280 370"
                fill="none"
                stroke={activePersonId === 'carlos' ? 'url(#grad-active-violet)' : 'url(#grad-default)'}
                strokeWidth={activePersonId === 'carlos' ? '3' : '1.5'}
              />

              {/* Valeria Synapses */}
              <path
                d="M 175 540 C 220 540, 240 480, 280 480"
                fill="none"
                stroke={activePersonId === 'valeria' ? 'url(#grad-active-violet)' : 'url(#grad-default)'}
                strokeWidth={activePersonId === 'valeria' ? '3' : '1.5'}
              />
              <path
                d="M 175 540 C 220 540, 240 570, 280 570"
                fill="none"
                stroke={activePersonId === 'valeria' ? 'url(#grad-active-violet)' : 'url(#grad-default)'}
                strokeWidth={activePersonId === 'valeria' ? '3' : '1.5'}
              />

              {/* Skills -> Squads */}
              <path
                d="M 430 100 C 470 100, 480 170, 510 170"
                fill="none"
                stroke={activePersonId === 'sofia' ? 'url(#grad-active-violet)' : 'url(#grad-default)'}
                strokeWidth={activePersonId === 'sofia' ? '3' : '1.5'}
              />
              <path
                d="M 430 220 C 470 220, 480 170, 510 170"
                fill="none"
                stroke={activePersonId === 'sofia' ? 'url(#grad-active-violet)' : 'url(#grad-default)'}
                strokeWidth={activePersonId === 'sofia' ? '3' : '1.5'}
              />
              <path
                d="M 430 370 C 470 370, 480 350, 510 350"
                fill="none"
                stroke={activePersonId === 'carlos' ? 'url(#grad-active-violet)' : 'url(#grad-default)'}
                strokeWidth={activePersonId === 'carlos' ? '3' : '1.5'}
              />
              <path
                d="M 430 480 C 470 480, 480 520, 510 520"
                fill="none"
                stroke={activePersonId === 'valeria' ? 'url(#grad-active-violet)' : 'url(#grad-default)'}
                strokeWidth={activePersonId === 'valeria' ? '3' : '1.5'}
              />

              {/* Squads -> Business Activities */}
              <path
                d="M 660 170 C 700 170, 710 120, 740 120"
                fill="none"
                stroke={activePersonId === 'sofia' ? 'url(#grad-active-violet)' : 'url(#grad-default)'}
                strokeWidth={activePersonId === 'sofia' ? '3' : '1.5'}
              />
              <path
                d="M 660 170 C 700 170, 710 240, 740 240"
                fill="none"
                stroke="url(#grad-default)"
                strokeWidth="1.5"
              />
              <path
                d="M 660 350 C 700 350, 710 370, 740 370"
                fill="none"
                stroke={activePersonId === 'carlos' ? 'url(#grad-active-violet)' : 'url(#grad-default)'}
                strokeWidth={activePersonId === 'carlos' ? '3' : '1.5'}
              />
              <path
                d="M 660 520 C 700 520, 710 520, 740 520"
                fill="none"
                stroke={activePersonId === 'valeria' ? 'url(#grad-active-violet)' : 'url(#grad-default)'}
                strokeWidth={activePersonId === 'valeria' ? '3' : '1.5'}
              />

              {/* Activities -> Value Outcomes */}
              <path
                d="M 890 120 C 930 120, 940 160, 960 160"
                fill="none"
                stroke={activePersonId === 'sofia' ? 'url(#grad-active-violet)' : 'url(#grad-default)'}
                strokeWidth={activePersonId === 'sofia' ? '3' : '1.5'}
              />
              <path
                d="M 890 240 C 930 240, 940 300, 960 300"
                fill="none"
                stroke="url(#grad-default)"
                strokeWidth="1.5"
              />
              <path
                d="M 890 520 C 930 520, 940 460, 960 460"
                fill="none"
                stroke={activePersonId === 'valeria' ? 'url(#grad-active-violet)' : 'url(#grad-default)'}
                strokeWidth={activePersonId === 'valeria' ? '3' : '1.5'}
              />
            </svg>

            {/* COLUMN 1: PERSONAS */}
            <div className="absolute left-4 top-0 bottom-0 w-44 flex flex-col justify-around z-10">
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
                    className={`cursor-pointer flex items-center gap-3 p-2.5 rounded-2xl bg-surface-container-lowest transition-all hover:scale-105 border ${
                      isSelected
                        ? 'shadow-lg ring-2 ring-primary-container border-primary'
                        : 'shadow-sm hover:shadow-md border-outline-variant/30'
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
                        <span className="text-xs font-bold text-on-surface truncate">
                          {person.name}
                        </span>
                        {person.riskStatus === 'optimal' && (
                          <span className="material-symbols-outlined text-primary text-[14px]">
                            verified
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-primary font-semibold truncate">
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
            <div className="absolute left-[270px] top-0 bottom-0 w-44 flex flex-col justify-around z-10">
              {/* Skill 1 */}
              <div className="bg-surface-container-lowest p-2.5 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col gap-1 border border-primary/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-on-surface truncate">Inteligencia Artificial</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-primary-container text-on-primary text-[10px] font-bold">
                    Nv.5
                  </span>
                </div>
                <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary-container h-full w-[96%] rounded-full" />
                </div>
                <span className="text-[10px] text-outline font-mono">Tecnologías: PyTorch, NLP, RL</span>
              </div>

              {/* Skill 2 */}
              <div className="bg-surface-container-lowest p-2.5 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col gap-1 border border-outline-variant/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-on-surface truncate">Diseño de sistemas</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-primary-fixed text-primary text-[10px] font-bold">
                    Nv.5
                  </span>
                </div>
                <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary h-full w-[92%] rounded-full" />
                </div>
                <span className="text-[10px] text-outline font-mono">Tecnologías: Microservices, Kafka</span>
              </div>

              {/* Skill 3 */}
              <div className="bg-surface-container-lowest p-2.5 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col gap-1 border border-outline-variant/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-on-surface truncate">Seguridad en la nube</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold">
                    Nv.4
                  </span>
                </div>
                <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full w-[84%] rounded-full" />
                </div>
                <span className="text-[10px] text-outline font-mono">Tecnologías: Zero Trust, AWS IAM</span>
              </div>

              {/* Skill 4 */}
              <div className="bg-surface-container-lowest p-2.5 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col gap-1 border border-outline-variant/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-on-surface truncate">Negociación estratégica</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-primary-fixed text-primary text-[10px] font-bold">
                    Nv.4
                  </span>
                </div>
                <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary h-full w-[80%] rounded-full" />
                </div>
                <span className="text-[10px] text-outline font-mono">Tecnologías: B2B Enterprise, M&amp;A</span>
              </div>

              {/* Skill 5 */}
              <div className="bg-surface-container-lowest p-2.5 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col gap-1 border border-outline-variant/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-on-surface truncate">Necesidades del cliente</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold">
                    Nv.5
                  </span>
                </div>
                <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full w-[94%] rounded-full" />
                </div>
                <span className="text-[10px] text-outline font-mono">Tecnologías: Dual-Track Agile</span>
              </div>
            </div>

            {/* COLUMN 3: SQUADS */}
            <div className="absolute left-[500px] top-0 bottom-0 w-44 flex flex-col justify-around z-10">
              {/* Squad 1 */}
              <div className="bg-surface-container-lowest p-3 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col gap-2 border border-primary-container/40">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">groups_3</span>
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
              <div className="bg-surface-container-lowest p-3 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col gap-2 border border-outline-variant/30">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[20px]">dns</span>
                  <span className="text-xs font-bold text-on-surface">Resiliencia de Plataforma</span>
                </div>
                <span className="text-[11px] text-on-surface-variant leading-tight">
                  Infraestructura crítica de la plataforma
                </span>
                <div className="flex items-center justify-between text-outline text-[11px] pt-1 border-t border-outline-variant/20">
                  <span>14 Miembros</span>
                  <span className="text-secondary font-bold">96% Cobertura</span>
                </div>
              </div>

              {/* Squad 3 */}
              <div className="bg-surface-container-lowest p-3 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col gap-2 border border-outline-variant/30">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary-container text-[20px]">
                    rocket_launch
                  </span>
                  <span className="text-xs font-bold text-on-surface">Growth Engine</span>
                </div>
                <span className="text-[11px] text-on-surface-variant leading-tight">
                  Expansión de mercados y grandes clientes
                </span>
                <div className="flex items-center justify-between text-outline text-[11px] pt-1 border-t border-outline-variant/20">
                  <span>11 Miembros</span>
                  <span className="text-secondary font-bold">92% Cobertura</span>
                </div>
              </div>
            </div>

            {/* COLUMN 4: ACTIVIDADES DE NEGOCIO */}
            <div className="absolute left-[730px] top-0 bottom-0 w-44 flex flex-col justify-around z-10">
              <div className="bg-surface-container-lowest p-3 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col gap-1 border border-primary-container/30">
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

              <div className="bg-surface-container-lowest p-3 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col gap-1 border border-outline-variant/30">
                <span className="px-2 py-0.5 rounded-full bg-secondary-fixed/40 text-on-secondary-fixed-variant text-[10px] font-bold w-max">
                  Soporte
                </span>
                <span className="text-xs font-bold text-on-surface leading-tight">
                  Automatización Despachos
                </span>
                <span className="text-[10px] text-on-surface-variant">Centro de despachos robotizado</span>
              </div>

              <div className="bg-surface-container-lowest p-3 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col gap-1 border border-outline-variant/30">
                <span className="px-2 py-0.5 rounded-full bg-secondary-fixed/40 text-on-secondary-fixed-variant text-[10px] font-bold w-max">
                  Soporte
                </span>
                <span className="text-xs font-bold text-on-surface leading-tight">
                  Blindaje Cloud 99.99%
                </span>
                <span className="text-[10px] text-on-surface-variant">Respaldo automático ante fallas</span>
              </div>

              <div className="bg-surface-container-lowest p-3 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col gap-1 border border-outline-variant/30">
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
            <div className="absolute left-[950px] top-0 bottom-0 w-44 flex flex-col justify-around z-10">
              <div className="bg-surface-container-lowest p-3 rounded-2xl shadow-md border-2 border-secondary-container transition-all flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-secondary">
                  <span className="material-symbols-outlined text-[18px]">trending_up</span>
                  <span className="text-[10px] font-bold uppercase">Rentabilidad</span>
                </div>
                <span className="text-xl font-extrabold text-on-surface">+18.4%</span>
                <span className="text-[11px] text-on-surface-variant">Margen Operativo Neto</span>
              </div>

              <div className="bg-surface-container-lowest p-3 rounded-2xl shadow-sm border border-outline-variant/30 transition-all flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-primary">
                  <span className="material-symbols-outlined text-[18px]">speed</span>
                  <span className="text-[10px] font-bold uppercase">Velocidad</span>
                </div>
                <span className="text-xl font-extrabold text-on-surface">-40%</span>
                <span className="text-[11px] text-on-surface-variant">Tiempo de salida al mercado de lanzamientos</span>
              </div>

              <div className="bg-surface-container-lowest p-3 rounded-2xl shadow-sm border border-outline-variant/30 transition-all flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-secondary">
                  <span className="material-symbols-outlined text-[18px]">loyalty</span>
                  <span className="text-[10px] font-bold uppercase">Retención</span>
                </div>
                <span className="text-xl font-extrabold text-on-surface">98.4%</span>
                <span className="text-[11px] text-on-surface-variant">Retención de grandes clientes</span>
              </div>
            </div>
          </div>

          {/* Bottom Canvas Status Legend */}
          <div className="z-20 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-outline-variant/20 bg-surface-container-lowest">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 bg-primary rounded-full" />
                <span className="text-xs text-on-surface font-semibold">Conexiones de la persona seleccionada</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 bg-outline-variant rounded-full" />
                <span className="text-xs text-on-surface-variant font-medium">Otras conexiones</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary-container" />
                <span className="text-xs text-on-surface-variant font-medium">Sin riesgo</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-tertiary-container" />
                <span className="text-xs text-on-surface-variant font-medium">Persona clave sin reemplazo (punto único de falla)</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-on-surface-variant text-xs">
              <span className="material-symbols-outlined text-[16px] text-primary">touch_app</span>
              <span>Hacé clic en cualquier persona para ver sus conexiones</span>
            </div>
          </div>
        </div>

        {/* RIGHT FLOATING PANEL: INSPECTOR DE NODO ACTIVO */}
        <div className="w-full lg:w-[380px] bg-surface-container-lowest rounded-3xl shadow-md border border-outline-variant/30 p-6 flex flex-col gap-4 shrink-0 transition-all">
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
                onClick={() => triggerToast(`Descargando datos de habilidades en formato visual`)}
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
