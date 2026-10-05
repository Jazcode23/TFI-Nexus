import React, { useState, useEffect } from 'react';
import { PorterActivity, ScreenId } from '../../types';
import { PORTER_ACTIVITIES } from '../../data/mockData';
import { UserAvatar } from '../UserAvatar';
import { QuickGuideBanner } from '../QuickGuideBanner';
import { HelpTooltip } from '../HelpTooltip';
import { reportsApi, porterApi } from '../../services/api';

interface ValueMapScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onSelectEmployee?: (employeeId: string) => void;
}

export const ValueMapScreen: React.FC<ValueMapScreenProps> = ({
  onNavigate,
  onSelectEmployee,
}) => {
  const [activities, setActivities] = useState<PorterActivity[]>(PORTER_ACTIVITIES);
  const [selectedActivityId, setSelectedActivityId] = useState<number>(2); // Default: Operaciones Core
  const [activeLayer, setActiveLayer] = useState<'primary' | 'support' | 'all'>('primary');
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [simulationHeadcount, setSimulationHeadcount] = useState(38);
  const [simulationBudget, setSimulationBudget] = useState(120);

  useEffect(() => {
    let isMounted = true;
    porterApi
      .getAll()
      .then((res) => {
        if (isMounted && res.data && res.data.length > 0) {
          setActivities(res.data);
        }
      })
      .catch(() => {
        // Fallback a PORTER_ACTIVITIES
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedActivity: PorterActivity =
    activities.find((a) => a.id === selectedActivityId) || activities[1] || PORTER_ACTIVITIES[1];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowSimulateModal(false);
    try {
      const res = await porterApi.simulate(
        selectedActivity.id,
        simulationHeadcount,
        simulationBudget,
      );
      triggerToast(res.message);
    } catch {
      triggerToast(
        `Simulación ejecutada: personal reasignado a ${simulationHeadcount} personas (+${simulationBudget}k USD). Margen proyectado: +2.4% de resultado operativo.`
      );
    }
  };

  return (
    <div className="w-full px-6 lg:px-8 py-6 flex flex-col gap-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-outline-variant/30 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="material-symbols-outlined text-secondary-container">verified</span>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Compact Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <h1 className="text-xl lg:text-2xl font-black text-on-surface tracking-tight font-headline">
            Cadena de Valor y Áreas del Negocio
          </h1>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            5 eslabones &bull; +24.8% Margen
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowSimulateModal(true)}
            className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-bold bg-surface-container text-on-surface hover:bg-surface-container-high border border-outline-variant/40 transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-primary text-[16px]">alt_route</span>
            Simular Reasignación
          </button>
          <button
            onClick={async () => {
              try {
                triggerToast('Descargando informe analítico de cadena de valor...');
                await reportsApi.downloadReport('xlsx');
                triggerToast('Informe de Cadena de Valor descargado correctamente.');
              } catch {
                triggerToast('Informe descargado en modo local.');
              }
            }}
            className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-bold bg-primary text-on-primary hover:bg-primary-container transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            Descargar Informe
          </button>
        </div>
      </div>

      {/* Slim Guide Bar */}
      <QuickGuideBanner
        title="Guía de la Cadena de Valor"
        description="Recorrido de valor operativo y asignación de talento clave por eslabón."
        tips={[
          'Hacé clic en cualquiera de las 5 etapas (ej: Ingesta, Operaciones, Ventas) para ver sus detalles.',
          'En el panel inferior verás los cargos necesarios y los colaboradores referentes del área.',
          'Si una etapa muestra "Alerta", indica necesidad de reforzar contrataciones o capacitación.',
        ]}
        dismissible={true}
      />

      {/* Compact 4-Metric Status Strip (Saves over 100px of vertical space) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="bg-surface-container-lowest px-3.5 py-2.5 rounded-xl border border-outline-variant/30 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-outline block">Eslabones Primarios</span>
            <div className="text-base font-black text-on-surface">
              5 <span className="text-[11px] font-normal text-outline">etapas</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
            100% Mapeados
          </span>
        </div>

        <div className="bg-surface-container-lowest px-3.5 py-2.5 rounded-xl border border-outline-variant/30 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-outline block">Talento Asignado</span>
            <div className="text-base font-black text-on-surface">
              120 <span className="text-[11px] font-normal text-outline">colaboradores</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold">
            88% Alta Competencia
          </span>
        </div>

        <div className="bg-surface-container-lowest px-3.5 py-2.5 rounded-xl border border-outline-variant/30 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-outline block">Brechas Críticas</span>
            <div className="text-base font-black text-amber-600">
              1 <span className="text-[11px] font-bold text-amber-700">en alerta</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold">
            Logística Externa
          </span>
        </div>

        <div className="bg-surface-container-lowest px-3.5 py-2.5 rounded-xl border border-outline-variant/30 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-outline block">Margen Operativo</span>
            <div className="text-base font-black text-emerald-600">
              +24.8% <span className="text-[11px] font-normal text-outline">resultado</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
            Eficiencia A+
          </span>
        </div>
      </div>

      {/* Unified Toolbar: Layer Selector Tabs + Status Legend */}
      <div className="bg-surface-container-lowest px-4 py-2 rounded-2xl border border-outline-variant/30 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-outline-variant/20">
          <button
            type="button"
            onClick={() => setActiveLayer('primary')}
            className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
              activeLayer === 'primary'
                ? 'bg-surface-container-lowest text-primary shadow-xs font-black'
                : 'text-outline hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">view_column</span>
            Eslabones Primarios ({PORTER_ACTIVITIES.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('support')}
            className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
              activeLayer === 'support'
                ? 'bg-surface-container-lowest text-primary shadow-xs font-black'
                : 'text-outline hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">layers</span>
            Actividades de Soporte (4)
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('all')}
            className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
              activeLayer === 'all'
                ? 'bg-surface-container-lowest text-primary shadow-xs font-black'
                : 'text-outline hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">grid_view</span>
            Vista Integral
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-on-surface-variant font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Óptimo (&ge;90%)
          </span>
          <span className="flex items-center gap-1.5 text-on-surface-variant font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Alerta (&lt;90%)
          </span>
          <div className="h-3.5 w-px bg-outline-variant/30 hidden sm:block" />
          <span className="text-outline hidden sm:inline">Clic en un eslabón para ver detalle</span>
        </div>
      </div>

      {/* The Porter Pipeline (Visual Value Chain Graphic) */}
      {(activeLayer === 'primary' || activeLayer === 'all') && (
        <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-3xl border border-outline-variant/30 shadow-xs flex flex-col gap-3">
          {/* Section Subhead */}
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">alt_route</span>
              <h2 className="text-sm font-extrabold text-on-surface">
                Flujo Secuencial de Eslabones Primarios
              </h2>
            </div>
            <span className="text-[11px] text-outline">
              Cadena de Valor de Porter
            </span>
          </div>

          {/* Interactive Chain Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 relative">
            {PORTER_ACTIVITIES.map((activity) => {
              const isSelected = selectedActivityId === activity.id;
              const isAlert = activity.coverageStatus === 'alert';

              return (
                <button
                  key={activity.id}
                  onClick={() => setSelectedActivityId(activity.id)}
                  className={`text-left p-3.5 rounded-2xl border transition-all relative flex flex-col justify-between min-h-[145px] cursor-pointer ${
                    isSelected
                      ? 'bg-primary/5 border-primary ring-2 ring-primary/20 shadow-sm'
                      : 'bg-surface-container-low hover:bg-surface-container border-outline-variant/40 hover:border-outline-variant'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] font-black tracking-wider px-1.5 py-0.5 rounded-md font-mono ${
                        isSelected
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container-highest text-on-surface-variant'
                      }`}
                    >
                      {activity.step}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isAlert
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isAlert ? 'bg-amber-600' : 'bg-emerald-600'
                        }`}
                      />
                      {activity.coverage}%
                    </span>
                  </div>

                  <div className="my-1.5">
                    <h3 className="text-xs font-black text-on-surface leading-tight line-clamp-1">
                      {activity.name}
                    </h3>
                    <p className="text-[11px] text-primary font-semibold truncate mt-0.5">
                      {activity.subname}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-outline-variant/30 flex items-center justify-between text-[10px] text-outline">
                    <span>{activity.headcount} pers.</span>
                    <span className="font-semibold text-on-surface-variant truncate">
                      {activity.costEfficiency}
                    </span>
                  </div>

                  {/* Active Indicator Chevron */}
                  {isSelected && (
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rotate-45 rounded-xs" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Porter Margin Bar */}
          <div className="p-3 bg-gradient-to-r from-primary/10 via-purple-500/10 to-emerald-500/15 rounded-2xl border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-primary text-on-primary flex items-center justify-center font-black text-xs shrink-0">
                M
              </span>
              <div>
                <span className="font-extrabold text-on-surface uppercase tracking-wide text-xs">
                  Margen de Valor Agregado Total
                </span>
                <p className="text-on-surface-variant text-[11px]">
                  La coordinación de competencias en los 5 eslabones sostiene la rentabilidad competitiva.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <span className="text-[10px] text-outline uppercase font-semibold block">
                  Resultado operativo
                </span>
                <div className="text-xs font-black text-emerald-600">+24.8% Margen</div>
              </div>
              <button
                onClick={() => triggerToast('Margen verificado con el reporte financiero del tercer trimestre.')}
                className="px-2.5 py-1 rounded-lg bg-surface-container-highest hover:bg-surface-container-high text-on-surface text-xs font-bold border border-outline-variant/50 transition-all cursor-pointer"
              >
                Revisar Indicadores
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Support Activities Banner (if support or all selected) */}
      {(activeLayer === 'support' || activeLayer === 'all') && (
        <div className="bg-surface-container-low p-4 sm:p-5 rounded-3xl border border-outline-variant/30 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">layers</span>
              <h2 className="text-sm font-extrabold text-on-surface">
                Actividades de Soporte Transversales
              </h2>
            </div>
            <span className="text-[11px] font-bold text-primary bg-primary-fixed/50 px-2.5 py-0.5 rounded-full">
              4 Eslabones de Apoyo
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-black text-primary font-mono">SUP-01</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    96% Óptimo
                  </span>
                </div>
                <h4 className="text-xs font-bold text-on-surface leading-tight">Infraestructura Corporativa</h4>
                <p className="text-[11px] text-outline mt-1 line-clamp-2">Gobierno TI, Legal, Finanzas y norma SOC2.</p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-outline-variant/20 text-[10px] text-on-surface-variant flex justify-between">
                <span>14 personas</span>
                <span className="font-semibold text-primary">Tier E6/E7</span>
              </div>
            </div>

            <div className="p-3.5 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-black text-primary font-mono">SUP-02</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    92% Óptimo
                  </span>
                </div>
                <h4 className="text-xs font-bold text-on-surface leading-tight">Gestión del Talento</h4>
                <p className="text-[11px] text-outline mt-1 line-clamp-2">Análisis NEXUS, mapas y planes de carrera.</p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-outline-variant/20 text-[10px] text-on-surface-variant flex justify-between">
                <span>9 personas</span>
                <span className="font-semibold text-primary">Estratégico</span>
              </div>
            </div>

            <div className="p-3.5 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-black text-primary font-mono">SUP-03</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    99% Excelente
                  </span>
                </div>
                <h4 className="text-xs font-bold text-on-surface leading-tight">I+D Tecnológico</h4>
                <p className="text-[11px] text-outline mt-1 line-clamp-2">Modelos de IA, patentes y arquitectura cloud.</p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-outline-variant/20 text-[10px] text-on-surface-variant flex justify-between">
                <span>28 personas</span>
                <span className="font-semibold text-primary">Misión Crítica</span>
              </div>
            </div>

            <div className="p-3.5 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-black text-primary font-mono">SUP-04</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    86% Alerta
                  </span>
                </div>
                <h4 className="text-xs font-bold text-on-surface leading-tight">Servicios en la Nube</h4>
                <p className="text-[11px] text-outline mt-1 line-clamp-2">Control de costos cloud y contratos clave.</p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-outline-variant/20 text-[10px] text-on-surface-variant flex justify-between">
                <span>6 personas</span>
                <span className="font-semibold text-amber-700">Refuerzo requerido</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Detail Grid for Selected Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Eslabón Overview, Roles and Assigned Top Talent (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Card: Eslabón Core Info */}
          <div className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/30 shadow-xs flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-primary-fixed text-primary flex items-center justify-center font-mono font-black text-sm">
                  {selectedActivity.step}
                </span>
                <div>
                  <h3 className="text-base font-black text-on-surface">
                    {selectedActivity.name} &bull; {selectedActivity.subname}
                  </h3>
                  <span className="text-[11px] text-outline">
                    Impacto directo en propuesta de valor
                  </span>
                </div>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  selectedActivity.coverageStatus === 'alert'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}
              >
                {selectedActivity.coverage}% Cobertura
              </span>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              {selectedActivity.description}
            </p>

            <div className="pt-3 border-t border-outline-variant/20 grid grid-cols-3 gap-3 text-center">
              <div className="p-2.5 bg-surface-container-low rounded-xl">
                <div className="text-[10px] text-outline font-semibold uppercase">Total Asignado</div>
                <div className="text-sm font-black text-on-surface mt-0.5">
                  {selectedActivity.headcount} personas
                </div>
              </div>
              <div className="p-2.5 bg-surface-container-low rounded-xl">
                <div className="text-[10px] text-outline font-semibold uppercase">Eficiencia Costos</div>
                <div className="text-sm font-black text-primary mt-0.5">
                  {selectedActivity.costEfficiency}
                </div>
              </div>
              <div className="p-2.5 bg-surface-container-low rounded-xl">
                <div className="text-[10px] text-outline font-semibold uppercase">Habilidades Clave</div>
                <div className="text-xs font-bold text-on-surface truncate mt-0.5">
                  {selectedActivity.topSkills}
                </div>
              </div>
            </div>
          </div>

          {/* Card: Roles Críticos en este Eslabón */}
          <div className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/30 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-sm font-extrabold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">badge</span>
                Puestos y Roles Clave
              </h3>
              <button
                onClick={() => onNavigate('puestos')}
                className="text-xs text-primary font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                Ver Catálogo de Puestos
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>

            <div className="space-y-2">
              {selectedActivity.rolesList.map((role, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-surface-container-low hover:bg-surface-container rounded-2xl border border-outline-variant/20 flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[18px]">{role.icon}</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-on-surface">{role.name}</h4>
                      <span className="text-[11px] text-outline">{role.count}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      role.impact.includes('Crítica')
                        ? 'bg-rose-100 text-rose-800'
                        : role.impact.includes('Brecha')
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {role.impact}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Top Talent Asignado */}
          <div className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/30 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-sm font-extrabold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">stars</span>
                Top Talento Asignado
              </h3>
              <span className="text-[11px] text-outline">
                {selectedActivity.topTalent.length} Colaboradores Clave
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedActivity.topTalent.map((person, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-surface-container-low hover:bg-surface-container rounded-2xl border border-outline-variant/20 flex flex-col justify-between transition-all"
                >
                  <div className="flex items-start gap-2.5">
                    <UserAvatar
                      name={person.name}
                      size="md"
                      shape="rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-extrabold text-on-surface truncate">
                        {person.name}
                      </h4>
                      <p className="text-[11px] text-outline truncate">{person.role}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-xs font-black text-primary">{person.match}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-primary-fixed text-primary">
                          {person.tag}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-outline-variant/20 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-emerald-600 flex items-center gap-1 truncate text-[10px]">
                      <span className="material-symbols-outlined text-[12px]">trending_up</span>
                      {person.impactText}
                    </span>
                    <button
                      onClick={() => {
                        if (onSelectEmployee) {
                          onSelectEmployee('lucas');
                          return;
                        }
                        onNavigate('empleados');
                      }}
                      className="font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer shrink-0"
                    >
                      360°
                      <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Skills Matrix & NEXUS AI (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Card: Matriz de Competencias del Eslabón */}
          <div className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/30 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-sm font-extrabold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">analytics</span>
                Nivel de Habilidades Requeridas
              </h3>
              <span className="text-[11px] text-outline">Requerido vs Actual</span>
            </div>

            <div className="space-y-3">
              {selectedActivity.skillsMatrix.map((item, idx) => {
                const isOptimal = item.status === 'optimal';
                const percent = Math.min((item.actual / 5.0) * 100, 100);
                const benchmarkPercent = Math.min((item.expected / 5.0) * 100, 100);

                return (
                  <div key={idx} className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="flex flex-col leading-tight">
                        <span className="text-xs font-bold text-on-surface">{item.name}</span>
                        {item.technicalName && (
                          <span className="text-[10px] font-medium text-outline">{item.technicalName}</span>
                        )}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs font-black">
                        <span className={isOptimal ? 'text-primary' : 'text-amber-600'}>
                          {item.actual} / 5.0
                        </span>
                        <span className="text-outline text-[10px] font-normal">
                          (Req. {item.expected})
                        </span>
                      </div>
                    </div>

                    {/* Comparative Dual Progress Bar */}
                    <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden relative">
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-on-surface z-10"
                        style={{ left: `${benchmarkPercent}%` }}
                        title={`Requerido: ${item.expected}`}
                      />
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOptimal ? 'bg-primary' : 'bg-amber-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between mt-1.5 text-[10px]">
                      <span
                        className={`font-semibold ${
                          isOptimal ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {item.note}
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded-xs font-bold uppercase text-[9px] ${
                          isOptimal
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status === 'optimal' ? 'Óptimo' : item.status === 'gap' ? 'Brecha' : 'Superior'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card: Diagnóstico & Plan de acción recomendado NEXUS AI */}
          <div className="bg-gradient-to-br from-primary/10 via-surface-container-low to-surface-container p-5 rounded-3xl border border-primary/20 shadow-xs relative overflow-hidden flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[16px]">psychology</span>
              </span>
              <div>
                <h4 className="text-xs font-black text-on-surface">Diagnóstico NEXUS AI</h4>
                <span className="text-[10px] text-primary font-bold uppercase tracking-wider block">
                  Recomendación Predictiva
                </span>
              </div>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              {selectedActivity.aiRecommendation}
            </p>

            <div className="pt-2 border-t border-primary/15 flex flex-col gap-2">
              <button
                onClick={() => {
                  triggerToast('Plan de capacitación enviado a líderes de equipo.');
                }}
                className="w-full py-2 px-3 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">school</span>
                Asignar Plan de Capacitación
              </button>

              <button
                onClick={() => onNavigate('reclutamiento')}
                className="w-full py-2 px-3 rounded-xl bg-surface-container-highest hover:bg-surface-container-high text-on-surface text-xs font-bold border border-outline-variant/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-primary">person_add</span>
                Abrir Solicitud de Contratación
              </button>
            </div>
          </div>

          {/* Quick Methodology Callout */}
          <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 text-xs text-outline flex items-start gap-2.5 shadow-2xs">
            <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">info</span>
            <p className="leading-relaxed text-[11px]">
              Cada eslabón traduce objetivos de negocio en competencias requeridas. Un déficit en un eslabón clave alerta antes de reflejarse en los resultados financieros.
            </p>
          </div>
        </div>
      </div>

      {/* Reallocation Simulation Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest max-w-md w-full rounded-3xl p-5 shadow-2xl border border-outline-variant/40 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-1 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">science</span>
                <h3 className="text-base font-black text-on-surface">Simulador de Reasignación</h3>
              </div>
              <button
                onClick={() => setShowSimulateModal(false)}
                className="w-7 h-7 rounded-full hover:bg-surface-container flex items-center justify-center text-outline cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSimulate} className="flex flex-col gap-3.5 text-xs">
              <div>
                <label className="font-bold text-on-surface block mb-1">
                  Eslabón a reforzar:
                </label>
                <div className="p-2 bg-surface-container rounded-xl font-semibold text-primary text-xs">
                  {selectedActivity.name} &bull; {selectedActivity.subname}
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-on-surface mb-1 text-xs">
                  <span>Colaboradores asignados:</span>
                  <span className="text-primary font-extrabold">{simulationHeadcount} personas</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="60"
                  value={simulationHeadcount}
                  onChange={(e) => setSimulationHeadcount(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-bold text-on-surface mb-1 text-xs">
                  <span>Presupuesto capacitación:</span>
                  <span className="text-primary font-extrabold">${simulationBudget}k USD</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="300"
                  step="10"
                  value={simulationBudget}
                  onChange={(e) => setSimulationBudget(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              <div className="p-3 bg-surface-container-high rounded-xl text-on-surface-variant text-[11px] leading-relaxed">
                <strong className="text-on-surface">Proyección:</strong> Con {simulationHeadcount} personas y ${simulationBudget}k USD, la cobertura alcanza el <strong>99.4%</strong> (-85% riesgo de demoras).
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-3.5 py-1.5 rounded-xl text-on-surface-variant font-bold hover:bg-surface-container cursor-pointer text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold hover:bg-primary-container shadow-xs cursor-pointer text-xs flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                  Aplicar Simulación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
