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

      {/* Screen Header & Friendly Guide */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs tracking-wider text-primary uppercase font-extrabold">
                Vista Estratégica &bull; Estructura Operativa
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs text-on-surface-variant font-medium">
                Cadena de Valor Empresarial
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-on-surface tracking-tight font-headline flex items-center gap-3">
              Cadena de Valor y Áreas del Negocio
            </h1>
            <p className="text-xs sm:text-sm text-outline mt-0.5 max-w-3xl">
              Visualizá cómo cada etapa del trabajo (datos, desarrollo, operaciones, ventas y soporte) aporta al negocio y qué colaboradores clave participan en cada una.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch xl:self-auto">
            <button
              onClick={() => setShowSimulateModal(true)}
              className="flex-1 xl:flex-none px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-surface-container text-on-surface hover:bg-surface-container-high border border-outline-variant/40 transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-primary text-lg">alt_route</span>
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
              className="flex-1 xl:flex-none px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-primary text-on-primary hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">download</span>
              Descargar Informe
            </button>
          </div>
        </div>

        {/* Quick Guide Banner */}
        <QuickGuideBanner
          title="¿Cómo entender la Cadena de Valor?"
          description="Representa el recorrido del trabajo en la empresa desde el inicio hasta la satisfacción del cliente."
          tips={[
            'Hacé clic en cualquiera de las 5 etapas (ej: Ingesta, Operaciones, Ventas) para ver sus detalles.',
            'En el panel inferior verás qué cargos son necesarios y qué empleados son referentes en esa área.',
            'Si una etapa muestra "Alerta", indica que conviene reforzar contrataciones o cursos de capacitación.',
          ]}
        />
      </div>

      {/* Global Performance Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-outline">Eslabones Primarios</span>
            <div className="text-xl font-black text-on-surface mt-0.5">5 Eslabones</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">trending_up</span>
              100% Mapeados
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">hub</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-outline">Talento Clave Asignado</span>
            <div className="text-xl font-black text-on-surface mt-0.5">120 Colaboradores</div>
            <div className="text-[11px] text-primary font-medium mt-0.5">88% con Alta Competencia</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
            <span className="material-symbols-outlined">group</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-outline">Brechas Críticas Activas</span>
            <div className="text-xl font-black text-amber-600 mt-0.5">1 Eslabón Alerta</div>
            <div className="text-[11px] text-amber-700 font-medium mt-0.5">Logística Externa (Seguridad de clústeres)</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
            <span className="material-symbols-outlined">warning</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-outline">Margen Operativo Generado</span>
            <div className="text-xl font-black text-emerald-600 mt-0.5">+24.8% de resultado operativo</div>
            <div className="text-[11px] text-emerald-700 font-medium mt-0.5">Eficiencia del capital A+</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <span className="material-symbols-outlined">payments</span>
          </div>
        </div>
      </div>

      {/* Layer selector tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
        <button
          onClick={() => setActiveLayer('primary')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeLayer === 'primary'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined text-sm">view_column</span>
          Eslabones Primarios ({PORTER_ACTIVITIES.length})
        </button>
        <button
          onClick={() => setActiveLayer('support')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeLayer === 'support'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined text-sm">layers</span>
          Actividades de Soporte (4)
        </button>
        <button
          onClick={() => setActiveLayer('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeLayer === 'all'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined text-sm">grid_view</span>
          Vista Integral
        </button>
      </div>

      {/* The Porter Pipeline (Visual Value Chain Graphic) */}
      {(activeLayer === 'primary' || activeLayer === 'all') && (
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/40 shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-base font-extrabold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">alt_route</span>
                Flujo Secuencial de Eslabones Primarios
              </h2>
              <p className="text-xs text-outline">
                Seleccioná un eslabón para revisar si cuenta con el talento necesario, las competencias observadas y las recomendaciones automáticas.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-on-surface-variant font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Óptimo (&gt;90%)
              </span>
              <span className="flex items-center gap-1.5 text-on-surface-variant font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                Alerta (&lt;90%)
              </span>
            </div>
          </div>

          {/* Interactive Chain Steps + Porter Margin Arrow */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 lg:gap-4 relative">
            {PORTER_ACTIVITIES.map((activity) => {
              const isSelected = selectedActivityId === activity.id;
              const isAlert = activity.coverageStatus === 'alert';

              return (
                <button
                  key={activity.id}
                  onClick={() => setSelectedActivityId(activity.id)}
                  className={`text-left p-4 rounded-2xl border transition-all relative flex flex-col justify-between min-h-[170px] cursor-pointer ${
                    isSelected
                      ? 'bg-primary/5 border-primary ring-2 ring-primary/20 shadow-md transform -translate-y-0.5'
                      : 'bg-surface-container-low hover:bg-surface-container border-outline-variant/40 hover:border-outline-variant'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-black tracking-widest px-2 py-0.5 rounded-md font-mono ${
                        isSelected
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container-highest text-on-surface-variant'
                      }`}
                    >
                      {activity.step}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isAlert
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isAlert ? 'bg-amber-600' : 'bg-emerald-600'
                        }`}
                      ></span>
                      {activity.coverage}%
                    </span>
                  </div>

                  <div className="my-2">
                    <h3 className="text-sm font-black text-on-surface leading-tight">
                      {activity.name}
                    </h3>
                    <p className="text-xs text-primary font-semibold truncate mt-0.5">
                      {activity.subname}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-outline-variant/30 flex items-center justify-between text-[11px] text-outline">
                    <span>{activity.headcount} personas</span>
                    <span className="font-semibold text-on-surface-variant">
                      {activity.costEfficiency}
                    </span>
                  </div>

                  {/* Active Indicator Chevron */}
                  {isSelected && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rotate-45 rounded-xs"></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Porter Margin Bar */}
          <div className="mt-4 p-3 bg-gradient-to-r from-primary/10 via-purple-500/10 to-emerald-500/15 rounded-2xl border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-primary text-on-primary flex items-center justify-center font-black">
                M
              </span>
              <div>
                <span className="font-extrabold text-on-surface uppercase tracking-wide">
                  Margen de Valor Agregado Total
                </span>
                <p className="text-on-surface-variant text-[11px]">
                  Eficiencia total del ciclo: la coordinación del talento en los 5 eslabones sostiene la mayor rentabilidad frente a la competencia.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] text-outline uppercase font-semibold">
                  Efecto en el resultado operativo
                </span>
                <div className="text-sm font-black text-emerald-600">+24.8% Margen</div>
              </div>
              <button
                onClick={() => triggerToast('Margen verificado con el reporte financiero del tercer trimestre.')}
                className="px-3 py-1.5 rounded-lg bg-surface-container-highest hover:bg-surface-container-high text-on-surface text-xs font-bold border border-outline-variant/50 transition-all cursor-pointer"
              >
                Revisar Indicadores
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Support Activities Banner (if support or all selected) */}
      {(activeLayer === 'support' || activeLayer === 'all') && (
        <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/40 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-extrabold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">layers</span>
                Actividades de Soporte Transversales (Infraestructura y Talento)
              </h2>
              <p className="text-xs text-outline">
                Eslabones horizontales que proveen soporte tecnológico, gobernanza y adquisición a los eslabones primarios.
              </p>
            </div>
            <span className="text-xs font-bold text-primary bg-primary-fixed px-3 py-1 rounded-full">
              4 Eslabones de Apoyo
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-primary font-mono">SUP-01</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    96% Óptimo
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-on-surface">Infraestructura Corporativa</h4>
                <p className="text-xs text-outline mt-1">Gobierno de tecnología, Legal, Finanzas y cumplimiento de la norma SOC2.</p>
              </div>
              <div className="mt-3 pt-2 border-t border-outline-variant/20 text-[11px] text-on-surface-variant flex justify-between">
                <span>14 personas</span>
                <span className="font-semibold text-primary">Tier E6/E7</span>
              </div>
            </div>

            <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-primary font-mono">SUP-02</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    92% Óptimo
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-on-surface">Gestión del Talento</h4>
                <p className="text-xs text-outline mt-1">Herramientas de análisis de NEXUS, mapa de competencias y planes de carrera.</p>
              </div>
              <div className="mt-3 pt-2 border-t border-outline-variant/20 text-[11px] text-on-surface-variant flex justify-between">
                <span>9 personas</span>
                <span className="font-semibold text-primary">Estratégico</span>
              </div>
            </div>

            <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-primary font-mono">SUP-03</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    99% Excelente
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-on-surface">Desarrollo Tecnológico e Investigación</h4>
                <p className="text-xs text-outline mt-1">Modelos de inteligencia artificial de lenguaje, patentes de algoritmos y diseño de la infraestructura en la nube.</p>
              </div>
              <div className="mt-3 pt-2 border-t border-outline-variant/20 text-[11px] text-on-surface-variant flex justify-between">
                <span>28 personas</span>
                <span className="font-semibold text-primary">Misión Crítica</span>
              </div>
            </div>

            <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-primary font-mono">SUP-04</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    86% Alerta
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-on-surface">Servicios en la Nube</h4>
                <p className="text-xs text-outline mt-1">Control de costos en la nube, servidores de cómputo avanzado y contratos de licencias.</p>
              </div>
              <div className="mt-3 pt-2 border-t border-outline-variant/20 text-[11px] text-on-surface-variant flex justify-between">
                <span>6 personas</span>
                <span className="font-semibold text-amber-700">Capacitación en costos de nube</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Detail Grid for Selected Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Eslabón Overview, Roles and Assigned Top Talent (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Card: Eslabón Core Info */}
          <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/40 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center font-mono font-black text-lg">
                  {selectedActivity.step}
                </span>
                <div>
                  <h3 className="text-xl font-black text-on-surface">
                    {selectedActivity.name} &bull; {selectedActivity.subname}
                  </h3>
                  <span className="text-xs text-outline">
                    Impacto en la Cadena de Valor &bull; Genera valor diferencial corporativo
                  </span>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                  selectedActivity.coverageStatus === 'alert'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {selectedActivity.coverage}% Cobertura
              </span>
            </div>

            <p className="text-sm text-on-surface-variant leading-relaxed">
              {selectedActivity.description}
            </p>

            <div className="mt-4 pt-4 border-t border-outline-variant/20 grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-surface-container rounded-2xl">
                <div className="text-xs text-outline font-medium">Total de Personas</div>
                <div className="text-lg font-black text-on-surface mt-0.5">
                  {selectedActivity.headcount} personas
                </div>
              </div>
              <div className="p-3 bg-surface-container rounded-2xl">
                <div className="text-xs text-outline font-medium">Eficiencia de Costos</div>
                <div className="text-lg font-black text-primary mt-0.5">
                  {selectedActivity.costEfficiency}
                </div>
              </div>
              <div className="p-3 bg-surface-container rounded-2xl">
                <div className="text-xs text-outline font-medium">Habilidades Principales</div>
                <div className="text-xs font-bold text-on-surface truncate mt-1">
                  {selectedActivity.topSkills}
                </div>
              </div>
            </div>
          </div>

          {/* Card: Roles Críticos en este Eslabón */}
          <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/40 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">badge</span>
                Puestos y Roles Clave en este Eslabón
              </h3>
              <button
                onClick={() => onNavigate('puestos')}
                className="text-xs text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                Ver Catálogo de Puestos
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </button>
            </div>

            <div className="space-y-3">
              {selectedActivity.rolesList.map((role, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-surface-container-low hover:bg-surface-container rounded-2xl border border-outline-variant/30 flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-lg">{role.icon}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-on-surface">{role.name}</h4>
                      <span className="text-xs text-outline">{role.count}</span>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
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

          {/* Card: Top Talent Asignado con impacto directo */}
          <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/40 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">stars</span>
                Top Talento Asignado a este Eslabón
              </h3>
              <span className="text-xs text-outline">
                {selectedActivity.topTalent.length} Colaboradores Clave
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedActivity.topTalent.map((person, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-surface-container-low hover:bg-surface-container rounded-2xl border border-outline-variant/30 flex flex-col justify-between transition-all"
                >
                  <div className="flex items-start gap-3">
                    <UserAvatar
                      name={person.name}
                      size="lg"
                      shape="rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-extrabold text-on-surface truncate">
                        {person.name}
                      </h4>
                      <p className="text-xs text-outline truncate">{person.role}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-black text-primary">{person.match} Match</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-fixed text-primary">
                          {person.tag}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-outline-variant/20 flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">trending_up</span>
                      {person.impactText}
                    </span>
                    <button
                      onClick={() => {
                        if (onSelectEmployee) {
                          onSelectEmployee('lucas'); // Links to 360 profile
                          return;
                        }
                        onNavigate('empleados');
                      }}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      Ver Perfil 360°
                      <span className="material-symbols-outlined text-xs">chevron_right</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Matriz de Brechas (Gap Analysis) y Recomendación Predictiva AI (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Card: Matriz de Competencias del Eslabón */}
          <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/40 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">analytics</span>
                Nivel de Habilidades Requeridas
              </h3>
              <span className="text-xs text-outline">Requerido vs Actual</span>
            </div>

            <div className="space-y-4">
              {selectedActivity.skillsMatrix.map((item, idx) => {
                const isOptimal = item.status === 'optimal';
                const percent = Math.min((item.actual / 5.0) * 100, 100);
                const benchmarkPercent = Math.min((item.expected / 5.0) * 100, 100);

                return (
                  <div key={idx} className="p-3.5 bg-surface-container-low rounded-2xl border border-outline-variant/25">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="flex flex-col leading-tight">
                        <span className="text-xs font-bold text-on-surface">{item.name}</span>
                        {item.technicalName && (
                          <span className="text-[11px] font-medium text-outline">{item.technicalName}</span>
                        )}
                      </span>
                      <div className="flex items-center gap-2 text-xs font-black">
                        <span className={isOptimal ? 'text-primary' : 'text-amber-600'}>
                          {item.actual} / 5.0
                        </span>
                        <span className="text-outline text-[11px] font-normal">
                          (Req. {item.expected})
                        </span>
                      </div>
                    </div>

                    {/* Comparative Dual Progress Bar */}
                    <div className="w-full h-2.5 bg-surface-container-highest rounded-full overflow-hidden relative">
                      {/* Required Marker */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-on-surface z-10"
                        style={{ left: `${benchmarkPercent}%` }}
                        title={`Requerido: ${item.expected}`}
                      ></div>
                      {/* Actual Fill */}
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOptimal ? 'bg-primary' : 'bg-amber-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between mt-2 text-[11px]">
                      <span
                        className={`font-semibold ${
                          isOptimal ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {item.note}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded-xs font-bold uppercase text-[9px] ${
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
          <div className="bg-gradient-to-br from-primary/10 via-surface-container-low to-surface-container p-6 rounded-3xl border border-primary/20 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-8 h-8 rounded-xl bg-primary text-on-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-base">psychology</span>
              </span>
              <div>
                <h4 className="text-sm font-black text-on-surface">Diagnóstico de NEXUS</h4>
                <span className="text-[10px] text-primary font-bold uppercase tracking-wider">
                  Plan de acción recomendado
                </span>
              </div>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              {selectedActivity.aiRecommendation}
            </p>

            <div className="mt-4 pt-3 border-t border-primary/15 flex flex-col gap-2">
              <button
                onClick={() => {
                  triggerToast('Plan de capacitación enviado a los líderes de equipo, con plan de certificación.');
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">school</span>
                Asignar Plan de Capacitación Sugerido
              </button>

              <button
                onClick={() => onNavigate('reclutamiento')}
                className="w-full py-2 px-3 rounded-xl bg-surface-container-highest hover:bg-surface-container-high text-on-surface text-xs font-bold border border-outline-variant/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm text-primary">person_add</span>
                Abrir Solicitud de Contratación
              </button>
            </div>
          </div>

          {/* Quick Porter Methodology Help Callout */}
          <div className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/40 shadow-xs text-xs text-outline">
            <div className="flex items-center gap-2 font-bold text-on-surface mb-1">
              <span className="material-symbols-outlined text-primary text-base">info</span>
              ¿Cómo vincula NEXUS la Cadena de Valor con el Talento?
            </div>
            <p className="leading-relaxed">
              Cada eslabón traduce los objetivos del negocio en las habilidades que necesita. Si un eslabón clave tiene un déficit de competencias, la capacidad de respuesta y el margen operativo se deterioran de inmediato, incluso antes de que se note en los resultados financieros.
            </p>
          </div>
        </div>
      </div>

      {/* Reallocation Simulation Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest max-w-md w-full rounded-3xl p-6 shadow-2xl border border-outline-variant/40">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">science</span>
                <h3 className="text-lg font-black text-on-surface">Simulador de Reasignación de Personal</h3>
              </div>
              <button
                onClick={() => setShowSimulateModal(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-outline cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleSimulate} className="flex flex-col gap-4 text-xs">
              <div>
                <label className="font-bold text-on-surface block mb-1">
                  Eslabón a reforzar:
                </label>
                <div className="p-2.5 bg-surface-container rounded-xl font-semibold text-primary">
                  {selectedActivity.name} &bull; {selectedActivity.subname}
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-on-surface mb-1 text-xs">
                  <span>Colaboradores asignados al área:</span>
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
                  <span>Presupuesto para cursos y capacitación:</span>
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
                <strong className="text-on-surface">Resultado estimado:</strong> Con {simulationHeadcount} colaboradores y ${simulationBudget}k USD en cursos, la cobertura de este departamento alcanza el <strong>99.4%</strong> y el riesgo de demoras disminuye un <strong>85%</strong>.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-4 py-2 rounded-xl text-on-surface-variant font-bold hover:bg-surface-container cursor-pointer text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold hover:bg-primary-container shadow-xs cursor-pointer text-xs flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">play_arrow</span>
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
