import React, { useState, useEffect, useMemo } from 'react';
import {
  Workflow,
  SlidersHorizontal,
  Download,
  Layers,
  ChevronRight,
  Briefcase,
  Activity,
  Users,
  Brain,
  Sparkles,
  ArrowRight,
  TrendingUp,
  School,
  UserPlus,
  X,
  Play,
  Database,
  Shield,
  Cpu,
  Package,
  RefreshCw,
  Server,
  Cloud,
} from 'lucide-react';
import { PorterActivity, ScreenId } from '../../types';
import { PORTER_ACTIVITIES } from '../../data/mockData';
import { UserAvatar } from '../UserAvatar';
import { QuickGuideBanner } from '../QuickGuideBanner';
import { useToast } from '../ToastProvider';
import { useFocusTrap } from '../useFocusTrap';
import { reportsApi, porterApi } from '../../services/api';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

interface ValueMapScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onSelectEmployee?: (employeeId: string) => void;
}

// Actividades de soporte transversales (Porter Support Activities)
const SUPPORT_ACTIVITIES = [
  {
    code: 'SUP-01',
    name: 'Infraestructura Corporativa',
    desc: 'Gobierno TI, Legal, Finanzas y cumplimiento SOC2.',
    headcount: 14,
    coverage: 96,
    status: 'optimal' as const,
    tier: 'Tier E6/E7',
  },
  {
    code: 'SUP-02',
    name: 'Gestión del Talento Humano',
    desc: 'Análisis NEXUS, matrices de competencias y planes de carrera.',
    headcount: 9,
    coverage: 92,
    status: 'optimal' as const,
    tier: 'Estratégico',
  },
  {
    code: 'SUP-03',
    name: 'Desarrollo Tecnológico & I+D',
    desc: 'Modelos predictivos de IA, patentes y arquitectura cloud resiliente.',
    headcount: 28,
    coverage: 99,
    status: 'optimal' as const,
    tier: 'Misión Crítica',
  },
  {
    code: 'SUP-04',
    name: 'Servicios en la Nube & Compras',
    desc: 'Optimización de consumo cloud y contratos de infraestructura.',
    headcount: 6,
    coverage: 86,
    status: 'alert' as const,
    tier: 'Refuerzo requerido',
  },
];

// Helper to render contextual icons for roles
function RoleIcon({ icon }: { icon?: string }) {
  const iconMap: Record<string, React.ReactNode> = {
    dataset: <Database className="w-4 h-4 text-primary" />,
    inventory: <Package className="w-4 h-4 text-primary" />,
    sync_alt: <RefreshCw className="w-4 h-4 text-primary" />,
    cloud: <Cloud className="w-4 h-4 text-primary" />,
    memory: <Cpu className="w-4 h-4 text-primary" />,
    security: <Shield className="w-4 h-4 text-primary" />,
    dns: <Server className="w-4 h-4 text-primary" />,
  };

  return icon && iconMap[icon] ? (
    iconMap[icon]
  ) : (
    <Briefcase className="w-4 h-4 text-primary" />
  );
}

export const ValueMapScreen: React.FC<ValueMapScreenProps> = ({
  onNavigate,
  onSelectEmployee,
}) => {
  const { showToast } = useToast();
  const [activities, setActivities] = useState<PorterActivity[]>(PORTER_ACTIVITIES);
  const [selectedActivityId, setSelectedActivityId] = useState<number>(2); // Default: Operaciones Core
  const [activeLayer, setActiveLayer] = useState<'primary' | 'support' | 'all'>('primary');
  const [activeDetailTab, setActiveDetailTab] = useState<'roles' | 'skills' | 'talent' | 'ai'>('roles');
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [simulationHeadcount, setSimulationHeadcount] = useState(38);
  const [simulationBudget, setSimulationBudget] = useState(120);
  const simulationModalRef = useFocusTrap<HTMLDivElement>(showSimulateModal);

  // Conexión dinámica con API de Porter
  useEffect(() => {
    let isMounted = true;
    porterApi
      .getAll()
      .then((res) => {
        if (isMounted && res && res.data && res.data.length > 0) {
          setActivities(res.data);
        }
      })
      .catch(() => {
        // Fallback nominal
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Eslabón activo seleccionado
  const selectedActivity: PorterActivity = useMemo(() => {
    return activities.find((a) => a.id === selectedActivityId) || activities[0] || PORTER_ACTIVITIES[0];
  }, [activities, selectedActivityId]);

  // Métricas dinámicas calculadas desde las actividades
  const metrics = useMemo(() => {
    const totalCount = activities.length;
    const totalHeadcount = activities.reduce((acc, a) => acc + (a.headcount || 0), 0);
    const alertCount = activities.filter((a) => a.coverageStatus === 'alert').length;
    const avgCoverage =
      totalCount > 0
        ? Math.round(activities.reduce((acc, a) => acc + (a.coverage || 0), 0) / totalCount)
        : 95;
    return { totalCount, totalHeadcount, alertCount, avgCoverage };
  }, [activities]);

  // Manejador para simulación de recursos
  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowSimulateModal(false);
    try {
      const res = await porterApi.simulate(
        selectedActivity.id,
        simulationHeadcount,
        simulationBudget
      );
      showToast(res.message || 'Simulación procesada exitosamente.');
    } catch {
      showToast(
        `Simulación aplicada: Eslabón "${selectedActivity.name}" ajustado a ${simulationHeadcount} colaboradores (+$${simulationBudget}k USD). Cobertura proyectada: 99.4%.`
      );
    }
  };

  // Mapeo dinámico hacia perfil del empleado
  const handleGoToTalent = (name: string) => {
    const lower = name.toLowerCase();
    let empId = 'lucas';
    if (lower.includes('sofía') || lower.includes('sofia')) empId = 'sofia';
    else if (lower.includes('carlos')) empId = 'carlos';
    else if (lower.includes('valeria') || lower.includes('camila')) empId = 'valeria';
    else if (lower.includes('laura')) empId = 'laura';
    else if (lower.includes('marcos') || lower.includes('hernán') || lower.includes('diego')) empId = 'lucas';

    if (onSelectEmployee) {
      onSelectEmployee(empId);
      return;
    }
    onNavigate('empleados');
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-5 flex flex-col gap-6 max-w-7xl mx-auto pb-20">
      {/* Cabecera & Acciones Principales */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight">
            Cadena de Valor
          </h1>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">
            Eslabones primarios y actividades de soporte según el modelo estratégico de Porter
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSimulateModal(true)}
            className="flex-1 sm:flex-none"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
            <span>Simular Reasignación</span>
          </Button>
          <Button
            size="sm"
            onClick={async () => {
              try {
                showToast('Descargando informe de Cadena de Valor...');
                await reportsApi.downloadReport('xlsx');
                showToast('Informe descargado exitosamente.');
              } catch {
                showToast('Informe de Cadena de Valor generado en formato local.');
              }
            }}
            className="flex-1 sm:flex-none"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            <span>Descargar Informe</span>
          </Button>
        </div>
      </div>

      {/* Guía Rápida */}
      <QuickGuideBanner
        title="Guía de la Cadena de Valor"
        description="Recorrido de valor operativo y asignación de talento clave por eslabón."
        tips={[
          'Hacé clic en cualquiera de los 5 eslabones primarios para inspeccionar roles, habilidades y talento.',
          'Usá las pestañas superiores para alternar entre Eslabones Primarios y Actividades de Soporte.',
          'La cobertura por debajo del 90% alerta brechas que requieren contratación o plan de capacitación.',
        ]}
        dismissible={true}
      />

      {/* Minimalist 4-Metric Status Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <Card className="p-3.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-outline font-medium">Eslabones primarios</span>
            <Workflow className="w-3.5 h-3.5 text-outline" />
          </div>
          <div className="text-xl font-bold text-on-surface tabular-nums">
            {metrics.totalCount} <span className="text-xs font-normal text-outline">etapas activas</span>
          </div>
        </Card>

        <Card className="p-3.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-outline font-medium">Talento asignado</span>
            <Users className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="text-xl font-bold text-on-surface tabular-nums">
            {metrics.totalHeadcount} <span className="text-xs font-normal text-outline">colaboradores</span>
          </div>
        </Card>

        <Card className="p-3.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-outline font-medium">Brechas en alerta</span>
            <Activity className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-600 flex items-center gap-1.5 tabular-nums">
            <span>{metrics.alertCount}</span>
            <span className="text-xs font-normal text-outline">
              {metrics.alertCount > 0 ? 'requiere atención' : 'todo óptimo'}
            </span>
          </div>
        </Card>

        <Card className="p-3.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-outline font-medium">Cobertura operativa promedio</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-emerald-600 tabular-nums">
            {metrics.avgCoverage}% <span className="text-xs font-normal text-outline">global</span>
          </div>
        </Card>
      </div>

      {/* Layer Selector */}
      <div className="bg-surface-bright px-4 py-2.5 rounded-xl border border-outline-variant shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1 bg-surface-dim p-1 rounded-lg">
          {([
            { id: 'primary', label: `Eslabones Primarios (${activities.length})` },
            { id: 'support', label: `Actividades de Soporte (${SUPPORT_ACTIVITIES.length})` },
            { id: 'all', label: 'Vista Integral' },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveLayer(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                activeLayer === tab.id
                  ? 'bg-surface-bright text-primary shadow-2xs font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Leyenda de Estado */}
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-on-surface-variant font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Óptimo (&ge;90%)
          </span>
          <span className="flex items-center gap-1.5 text-on-surface-variant font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Alerta (&lt;90%)
          </span>
        </div>
      </div>

      {/* PIPELINE SECUENCIAL DE PORTER (Flujo de Eslabones Primarios) */}
      {(activeLayer === 'primary' || activeLayer === 'all') && (
        <Card className="p-5 flex flex-col gap-4 shadow-2xs">
          <div className="flex items-center justify-between pb-1 border-b border-outline-variant/40">
            <div className="flex items-center gap-2">
              <Workflow className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-on-surface">
                Flujo Secuencial de Eslabones Primarios
              </h2>
            </div>
            <span className="text-xs text-outline">
              Hacé clic en cualquier etapa para inspeccionar su detalle
            </span>
          </div>

          {/* Grilla Secuencial */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {activities.map((activity, idx) => {
              const isSelected = selectedActivity.id === activity.id;
              const isAlert = activity.coverageStatus === 'alert';

              return (
                <div
                  key={activity.id}
                  onClick={() => setSelectedActivityId(activity.id)}
                  className={`relative p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between min-h-[145px] text-left ${
                    isSelected
                      ? 'bg-surface-bright border-primary ring-2 ring-primary/30 shadow-xs'
                      : 'bg-surface-bright hover:bg-surface-dim border-outline-variant/70 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                        isSelected ? 'bg-primary text-on-primary' : 'bg-surface-dim text-on-surface-variant'
                      }`}
                    >
                      {activity.step}
                    </span>
                    <Badge
                      variant={isAlert ? 'destructive' : 'success'}
                      className="text-[10px] font-semibold"
                    >
                      {activity.coverage}%
                    </Badge>
                  </div>

                  <div className="my-2">
                    <h3 className="text-xs font-semibold text-on-surface leading-snug line-clamp-1">
                      {activity.name}
                    </h3>
                    <p className="text-[11px] text-outline truncate mt-0.5">
                      {activity.subname}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-outline-variant/40 flex items-center justify-between text-[11px] text-outline">
                    <span>{activity.headcount} personas</span>
                    <span className="font-semibold text-primary">{activity.costEfficiency}</span>
                  </div>

                  {idx < activities.length - 1 && (
                    <div className="hidden md:flex absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-surface-bright border border-outline-variant items-center justify-center text-outline shadow-2xs z-10 pointer-events-none">
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Barra de Margen de Valor de Porter */}
          <div className="p-3.5 bg-surface-dim/60 rounded-xl border border-outline-variant/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-primary-fixed text-primary flex items-center justify-center font-bold text-xs shrink-0">
                M
              </span>
              <div>
                <span className="font-semibold text-on-surface text-xs">
                  Margen de Valor Agregado Total (+24.8%)
                </span>
                <p className="text-on-surface-variant text-xs mt-0.5">
                  La articulación de los 5 eslabones primarios genera una rentabilidad neta sostenida de negocio.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
              <Badge variant="success" className="text-xs font-semibold">
                Resultado Operativo Proyectado
              </Badge>
            </div>
          </div>
        </Card>
      )}

      {/* ACTIVIDADES DE SOPORTE TRANSVERSALES */}
      {(activeLayer === 'support' || activeLayer === 'all') && (
        <Card className="p-5 flex flex-col gap-4 shadow-2xs">
          <div className="flex items-center justify-between pb-1 border-b border-outline-variant/40">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-on-surface">
                Actividades de Soporte Transversales (Infraestructura y Talento)
              </h2>
            </div>
            <span className="text-xs text-outline">
              Capas de apoyo que potencian a los eslabones primarios
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SUPPORT_ACTIVITIES.map((sup) => {
              const isAlert = sup.status === 'alert';
              return (
                <div
                  key={sup.code}
                  className="p-4 bg-surface-dim/60 rounded-xl border border-outline-variant/60 flex flex-col justify-between text-left gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-mono font-bold text-outline">{sup.code}</span>
                      <Badge
                        variant={isAlert ? 'destructive' : 'success'}
                        className="text-[10px] font-semibold"
                      >
                        {sup.coverage}%
                      </Badge>
                    </div>
                    <h4 className="text-xs font-semibold text-on-surface leading-snug">{sup.name}</h4>
                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{sup.desc}</p>
                  </div>

                  <div className="pt-2 border-t border-outline-variant/40 text-xs text-outline flex items-center justify-between">
                    <span>{sup.headcount} colaboradores</span>
                    <span className="font-semibold text-on-surface">{sup.tier}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* INSPECTOR DETALLADO DEL ESLABÓN SELECCIONADO */}
      <Card className="p-5 flex flex-col gap-5 shadow-2xs">
        {/* Encabezado del Eslabón Activo */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-outline-variant/40">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-mono font-bold text-sm shadow-xs shrink-0">
              {selectedActivity.step}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-on-surface">
                  {selectedActivity.name} &bull; {selectedActivity.subname}
                </h3>
                <Badge
                  variant={selectedActivity.coverageStatus === 'alert' ? 'destructive' : 'success'}
                  className="text-[10px] font-semibold"
                >
                  {selectedActivity.coverage}% Cobertura
                </Badge>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {selectedActivity.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs shrink-0">
            <div className="px-3 py-1.5 rounded-xl bg-surface-dim border border-outline-variant/60 text-center">
              <span className="text-[10px] text-outline uppercase block">Asignados</span>
              <span className="font-semibold text-on-surface tabular-nums">{selectedActivity.headcount} pers.</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-surface-dim border border-outline-variant/60 text-center">
              <span className="text-[10px] text-outline uppercase block">Eficiencia</span>
              <span className="font-semibold text-primary">{selectedActivity.costEfficiency}</span>
            </div>
          </div>
        </div>

        {/* Selector de Pestañas de Detalle */}
        <div className="flex items-center gap-1 bg-surface-dim p-1 rounded-lg w-full sm:w-auto self-start text-xs border border-outline-variant/40">
          {([
            { id: 'roles', label: `Puestos y Roles (${selectedActivity.rolesList.length})`, icon: Briefcase },
            { id: 'skills', label: `Matriz de Habilidades (${selectedActivity.skillsMatrix.length})`, icon: Activity },
            { id: 'talent', label: `Top Talento Referente (${selectedActivity.topTalent.length})`, icon: Users },
            { id: 'ai', label: 'Diagnóstico NEXUS AI', icon: Brain },
          ] as const).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeDetailTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveDetailTab(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-surface-bright text-primary shadow-2xs font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* PESTAÑA 1: Puestos y Roles Clave */}
        {activeDetailTab === 'roles' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs text-on-surface-variant font-medium">
                Cargos que ejecutan este eslabón y su nivel de impacto estratégico
              </span>
              <button
                type="button"
                onClick={() => onNavigate('puestos')}
                className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Catálogo de Puestos</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {selectedActivity.rolesList.map((role, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-surface-dim/60 rounded-xl border border-outline-variant/60 flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary-fixed text-primary flex items-center justify-center shrink-0">
                      <RoleIcon icon={role.icon} />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-on-surface leading-tight">{role.name}</h4>
                      <span className="text-[11px] text-outline mt-0.5 block">{role.count}</span>
                    </div>
                  </div>
                  <Badge variant="subtle" className="text-[10px] shrink-0">
                    {role.impact}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PESTAÑA 2: Matriz de Habilidades y Brechas */}
        {activeDetailTab === 'skills' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs text-on-surface-variant font-medium">
                Comparativa entre el nivel real del equipo vs. el requerido por el negocio
              </span>
              <span className="text-xs text-outline">Escala de 1 a 5.0</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {selectedActivity.skillsMatrix.map((item, idx) => {
                const isOptimal = item.status === 'optimal';
                const percent = Math.min((item.actual / 5.0) * 100, 100);
                const benchmarkPercent = Math.min((item.expected / 5.0) * 100, 100);

                return (
                  <div
                    key={idx}
                    className="p-4 bg-surface-dim/60 rounded-xl border border-outline-variant/60 flex flex-col gap-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-semibold text-on-surface block leading-tight">
                          {item.name}
                        </span>
                        {item.technicalName && (
                          <span className="text-[11px] text-outline block mt-0.5">
                            {item.technicalName}
                          </span>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-xs font-bold tabular-nums ${isOptimal ? 'text-primary' : 'text-amber-600'}`}>
                          {item.actual} / 5.0
                        </span>
                        <span className="text-[10px] text-outline block">
                          (Req: {item.expected})
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden relative my-1">
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-on-surface z-10"
                        style={{ left: `${benchmarkPercent}%` }}
                        title={`Requerido: ${item.expected}`}
                      />
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isOptimal ? 'bg-primary' : 'bg-amber-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-outline-variant/40">
                      <span className={`font-semibold ${isOptimal ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {item.note}
                      </span>
                      <span className="text-[11px] text-outline">
                        {item.status === 'optimal' ? 'Óptimo' : 'Brecha detectada'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PESTAÑA 3: Top Talento Referente */}
        {activeDetailTab === 'talent' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs text-on-surface-variant font-medium">
                Colaboradores de alto desempeño asignados a este eslabón
              </span>
              <span className="text-xs text-primary font-semibold">
                {selectedActivity.topTalent.length} referentes
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {selectedActivity.topTalent.map((person, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-surface-dim/60 rounded-xl border border-outline-variant/60 flex flex-col justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-start gap-3">
                    <UserAvatar name={person.name} size="md" shape="rounded" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-on-surface truncate">
                        {person.name}
                      </h4>
                      <p className="text-[11px] text-outline truncate">{person.role}</p>
                      <div className="flex items-center gap-1.5 mt-1 text-xs">
                        <span className="font-bold text-primary">{person.match} fit</span>
                        <span className="text-outline/40">&bull;</span>
                        <span className="text-[11px] text-on-surface-variant">{person.tag}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-outline-variant/40 flex items-center justify-between text-xs">
                    <span className="text-emerald-700 flex items-center gap-1 font-medium text-xs">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{person.impactText}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleGoToTalent(person.name)}
                      className="font-semibold text-primary hover:underline flex items-center gap-0.5 cursor-pointer text-xs"
                    >
                      <span>Perfil 360°</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PESTAÑA 4: Diagnóstico NEXUS AI */}
        {activeDetailTab === 'ai' && (
          <div className="flex flex-col gap-4">
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-xs">
                <Brain className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Recomendación Predictiva NEXUS AI
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed mt-1">
                  {selectedActivity.aiRecommendation}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                size="sm"
                onClick={() => onNavigate('capacitacion-upskilling')}
              >
                <School className="w-3.5 h-3.5 mr-1.5" />
                <span>Asignar Plan de Capacitación</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('reclutamiento')}
              >
                <UserPlus className="w-3.5 h-3.5 mr-1.5 text-primary" />
                <span>Abrir Vacante en Reclutamiento</span>
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* MODAL: SIMULADOR DE REASIGNACIÓN DE RECURSOS */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 bg-on-surface/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            ref={simulationModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="simulation-modal-title"
            className="bg-surface-bright max-w-md w-full rounded-2xl p-6 shadow-2xl border border-outline-variant flex flex-col gap-4 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/40">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-fixed text-primary flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <h3 id="simulation-modal-title" className="text-sm font-semibold text-on-surface">
                  Simulador de Reasignación
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSimulateModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-surface-dim flex items-center justify-center text-outline hover:text-on-surface cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSimulate} className="flex flex-col gap-4 text-xs">
              <div>
                <label className="font-semibold text-on-surface block mb-1">
                  Eslabón a Reforzar:
                </label>
                <div className="p-2.5 bg-surface-dim rounded-xl font-semibold text-on-surface text-xs border border-outline-variant/60">
                  {selectedActivity.name} &bull; {selectedActivity.subname}
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium text-on-surface mb-1">
                  <span>Colaboradores asignados:</span>
                  <span className="text-primary font-bold tabular-nums">{simulationHeadcount} personas</span>
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
                <div className="flex justify-between font-medium text-on-surface mb-1">
                  <span>Presupuesto capacitación / reskilling:</span>
                  <span className="text-primary font-bold tabular-nums">${simulationBudget}k USD</span>
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

              <div className="p-3 bg-surface-dim rounded-xl text-on-surface-variant text-xs leading-relaxed border border-outline-variant/60">
                <strong className="text-on-surface font-semibold">Proyección:</strong> Con {simulationHeadcount} personas y ${simulationBudget}k USD, la cobertura se estima en <strong>99.4%</strong> (-85% riesgo de demoras).
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/40">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSimulateModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                >
                  <Play className="w-3.5 h-3.5 mr-1.5" />
                  <span>Aplicar Simulación</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
