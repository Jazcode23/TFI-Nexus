import React, { useState, useEffect } from 'react';
import { ScreenId } from '../../types';
import { QuickGuideBanner } from '../QuickGuideBanner';
import { useToast } from '../ToastProvider';
import { reportsApi, recruitmentApi, evaluationsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  TrendingUp,
  ShieldCheck,
  Users,
  AlertTriangle,
  ArrowRight,
  Download,
  HelpCircle,
  Briefcase,
  UserPlus,
  Award,
  Workflow,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';

interface DashboardScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [selectedQuarter, setSelectedQuarter] = useState('Q4 2026');
  const [showGuide, setShowGuide] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { showToast } = useToast();

  // KPIs principales conectados con la API de Reportes
  const [kpis, setKpis] = useState<{
    overallEffectiveness: string;
    averagePerformanceScore: string;
    criticalRolesCovered: string;
    criticalRolesDetail: string;
    trainingRoi: string;
    activeHeadcount: number;
    spofAlertsCount: number;
  }>({
    overallEffectiveness: '94.8%',
    averagePerformanceScore: '4.62 / 5.0',
    criticalRolesCovered: '92.4%',
    criticalRolesDetail: '13 de 14 roles con responsable',
    trainingRoi: '3.8x',
    activeHeadcount: 142,
    spofAlertsCount: 1,
  });

  // Datos dinámicos del pipeline de selección
  const [pipelineData, setPipelineData] = useState<{
    total: number;
    enEvaluacion: number;
    finalistas: number;
    oferta: number;
  }>({
    total: 12,
    enEvaluacion: 5,
    finalistas: 3,
    oferta: 1,
  });

  // Datos dinámicos de la matriz 9-Box
  const [distribution9Box, setDistribution9Box] = useState<{
    total: number;
    destacado: number;
    solido: number;
    desarrollo: number;
  }>({
    total: 48,
    destacado: 14,
    solido: 26,
    desarrollo: 8,
  });

  useEffect(() => {
    let isMounted = true;

    reportsApi
      .getDashboardKpis(selectedQuarter)
      .then((data) => {
        if (isMounted && data) {
          setKpis({
            overallEffectiveness: data.overallEffectiveness || '94.8%',
            averagePerformanceScore: data.averagePerformanceScore || '4.62 / 5.0',
            criticalRolesCovered: data.criticalRolesCovered || '92.4%',
            criticalRolesDetail: data.criticalRolesDetail || '13 de 14 roles con responsable',
            trainingRoi: data.trainingRoi || '3.8x',
            activeHeadcount: data.activeHeadcount ?? 142,
            spofAlertsCount: data.spofAlertsCount ?? 1,
          });
        }
      })
      .catch((err) => {
        console.warn('Dashboard KPIs fallback local:', err);
      });

    recruitmentApi
      .getCandidates()
      .then((res) => {
        if (isMounted && res && Array.isArray(res.data) && res.data.length > 0) {
          const list = res.data;
          const total = list.length;
          const enEvaluacion = list.filter((c) => {
            const s = (c.stage || '').toLowerCase();
            return s.includes('técnica') || s.includes('evaluación');
          }).length;
          const finalistas = list.filter((c) => {
            const s = (c.stage || '').toLowerCase();
            return s.includes('cultural') || s.includes('finalista');
          }).length;
          const oferta = list.filter((c) => {
            const s = (c.stage || '').toLowerCase();
            return s.includes('oferta');
          }).length;
          setPipelineData({ total, enEvaluacion, finalistas, oferta });
        }
      })
      .catch((err) => {
        console.warn('Dashboard recruitment fallback local:', err);
      });

    evaluationsApi
      .get9Box()
      .then((res) => {
        if (isMounted && res) {
          const dist = res.distribution || {};
          const destacado = dist['Talento Destacado (Estrella)']?.length || 0;
          const solido =
            (dist['Desempeño Sólido']?.length || 0) +
            (dist['Alto Potencial']?.length || 0) +
            (dist['Especialista Clave']?.length || 0);
          const desarrollo = dist['En Desarrollo']?.length || 0;
          const total = res.totalEvaluated || (destacado + solido + desarrollo);
          if (total > 0) {
            setDistribution9Box({ total, destacado, solido, desarrollo });
          }
        }
      })
      .catch((err) => {
        console.warn('Dashboard 9-Box fallback local:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedQuarter]);

  const handleExport = async (format: 'pdf' | 'xlsx') => {
    setIsExporting(true);
    try {
      await reportsApi.downloadReport(format);
      showToast(
        format === 'pdf'
          ? 'Informe ejecutivo descargado en formato PDF.'
          : 'Resumen analítico descargado en formato Excel.',
        'success'
      );
    } catch {
      showToast('Descarga iniciada.', 'info');
    } finally {
      setIsExporting(false);
    }
  };

  const pipeTotal = pipelineData.total || 1;
  const evalPercent = Math.round((pipelineData.enEvaluacion / pipeTotal) * 100);
  const finPercent = Math.round((pipelineData.finalistas / pipeTotal) * 100);
  const ofertaPercent = Math.round((pipelineData.oferta / pipeTotal) * 100);

  const distTotal = distribution9Box.total || 1;
  const destPercent = Math.round((distribution9Box.destacado / distTotal) * 100);
  const solPercent = Math.round((distribution9Box.solido / distTotal) * 100);
  const desPercent = Math.round((distribution9Box.desarrollo / distTotal) * 100);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Minimalist */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-outline-variant/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-on-surface">
              Panel Ejecutivo
            </h1>
            <Badge variant="subtle">Activo</Badge>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Métricas organizacionales consolidadas, ciclo de talento y cobertura estratégica.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-surface-bright px-2.5 py-1.5 rounded-lg border border-outline-variant text-xs shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-outline" />
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              className="bg-transparent font-medium text-on-surface outline-none cursor-pointer"
              aria-label="Seleccionar período"
            >
              <option value="Q3 2026">Q3 2026</option>
              <option value="Q4 2026">Q4 2026 (Activo)</option>
              <option value="Q1 2027">Q1 2027 (Planificado)</option>
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGuide((prev) => !prev)}
          >
            <HelpCircle className="w-3.5 h-3.5 mr-1 text-outline" />
            {showGuide ? 'Ocultar guía' : 'Guía rápida'}
          </Button>

          <Button
            variant="default"
            size="sm"
            disabled={isExporting}
            onClick={() => handleExport('xlsx')}
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            {isExporting ? 'Exportando...' : 'Exportar informe'}
          </Button>
        </div>
      </div>

      {/* Dismissible Quick Guide */}
      {showGuide && (
        <QuickGuideBanner
          title="Manual Rápido del Dashboard"
          description="Ecosistema de gestión por competencias y monitoreo del talento estratégico."
          tips={[
            'Revisá el Embudo de Selección para dar seguimiento inmediato a los candidatos en etapa final.',
            'Consultá la Matriz 9-Box para calibrar el balance entre potencial futuro y desempeño actual.',
            'En "Alertas de Continuidad" atendé de forma prioritaria los puestos con riesgo SPOF (sin sucesor).',
          ]}
          dismissible={true}
          onDismiss={() => setShowGuide(false)}
        />
      )}

      {/* Quick Action Navigation Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          type="button"
          onClick={() => onNavigate('puestos')}
          className="p-3 rounded-lg bg-surface-bright hover:bg-surface-dim border border-outline-variant/70 text-left transition-all flex items-center gap-3 group cursor-pointer shadow-2xs"
        >
          <div className="w-8 h-8 rounded-md bg-primary-fixed text-primary flex items-center justify-center shrink-0">
            <Briefcase className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-on-surface block truncate group-hover:text-primary transition-colors">
              Puestos y Perfiles
            </span>
            <span className="text-[11px] text-outline truncate block">
              Catálogo de cargos
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('reclutamiento')}
          className="p-3 rounded-lg bg-surface-bright hover:bg-surface-dim border border-outline-variant/70 text-left transition-all flex items-center gap-3 group cursor-pointer shadow-2xs"
        >
          <div className="w-8 h-8 rounded-md bg-secondary-container text-secondary flex items-center justify-center shrink-0">
            <UserPlus className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-on-surface block truncate group-hover:text-secondary transition-colors">
              Selección
            </span>
            <span className="text-[11px] text-outline truncate block">
              Pipeline de candidatos
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('evaluacion-desempeno')}
          className="p-3 rounded-lg bg-surface-bright hover:bg-surface-dim border border-outline-variant/70 text-left transition-all flex items-center gap-3 group cursor-pointer shadow-2xs"
        >
          <div className="w-8 h-8 rounded-md bg-tertiary-container text-tertiary flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-on-surface block truncate group-hover:text-tertiary transition-colors">
              Calibración 9-Box
            </span>
            <span className="text-[11px] text-outline truncate block">
              Ciclo de desempeño
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('value-map')}
          className="p-3 rounded-lg bg-surface-bright hover:bg-surface-dim border border-outline-variant/70 text-left transition-all flex items-center gap-3 group cursor-pointer shadow-2xs"
        >
          <div className="w-8 h-8 rounded-md bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
            <Workflow className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-on-surface block truncate group-hover:text-amber-700 transition-colors">
              Cadena de Porter
            </span>
            <span className="text-[11px] text-outline truncate block">
              Eslabones clave
            </span>
          </div>
        </button>
      </div>

      {/* KPI Cards: Clean Executive Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <Card className="hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-outline uppercase tracking-wider">
              Efectividad General
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold tracking-tight text-on-surface tabular-nums">
              {kpis.averagePerformanceScore}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>+0.3 vs ciclo anterior</span>
            </div>
            <div className="h-1 w-full bg-surface-dim rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full w-[92%]" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 2 */}
        <Card className="hover:border-secondary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-outline uppercase tracking-wider">
              Puestos Clave Cubiertos
            </CardTitle>
            <ShieldCheck className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold tracking-tight text-on-surface tabular-nums">
              {kpis.criticalRolesCovered}
            </div>
            <p className="text-[11px] text-on-surface-variant truncate">
              {kpis.criticalRolesDetail}
            </p>
            <div className="h-1 w-full bg-surface-dim rounded-full overflow-hidden">
              <div className="h-full bg-secondary rounded-full w-[92%]" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 3 */}
        <Card className="hover:border-tertiary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-outline uppercase tracking-wider">
              Pipeline Selección
            </CardTitle>
            <Users className="w-4 h-4 text-tertiary" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold tracking-tight text-on-surface tabular-nums">
              {pipelineData.total > 0 ? `${pipelineData.total} Postulantes` : 'Sin vacantes'}
            </div>
            <p className="text-[11px] text-on-surface-variant truncate">
              {pipelineData.oferta} oferta final • {pipelineData.enEvaluacion} técnica
            </p>
            <div className="h-1 w-full bg-surface-dim rounded-full overflow-hidden">
              <div className="h-full bg-tertiary rounded-full w-[75%]" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 4 */}
        <Card className="hover:border-amber-400 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-outline uppercase tracking-wider">
              Resiliencia SPOF
            </CardTitle>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold tracking-tight text-on-surface tabular-nums">
              {kpis.spofAlertsCount === 0 ? '100% Óptima' : '97.9%'}
            </div>
            <div className="text-[11px]">
              {kpis.spofAlertsCount > 0 ? (
                <span className="text-amber-800 font-medium">
                  {kpis.spofAlertsCount} puesto sin sucesor
                </span>
              ) : (
                <span className="text-emerald-700 font-medium">
                  Sin puntos únicos de falla
                </span>
              )}
            </div>
            <div className="h-1 w-full bg-surface-dim rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full w-[97%]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytical Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Funnel & 9-Box (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Recruitment Funnel */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-outline-variant/40">
              <div>
                <CardTitle className="text-sm font-semibold">
                  Embudo de Atracción y Selección
                </CardTitle>
                <CardDescription>
                  Progresión de candidatos a través de las etapas del proceso
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('reclutamiento')}
              >
                <span>Ver Kanban</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </CardHeader>

            <CardContent className="pt-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-surface-dim/60 border border-outline-variant/40 space-y-1">
                  <span className="text-[10px] font-semibold text-outline uppercase tracking-wider">
                    1. Recibidas
                  </span>
                  <div className="text-xl font-bold text-on-surface tabular-nums">
                    {pipelineData.total}
                  </div>
                  <span className="text-[10px] text-outline">100% total</span>
                </div>

                <div className="p-3 rounded-lg bg-surface-dim/60 border border-outline-variant/40 space-y-1">
                  <span className="text-[10px] font-semibold text-outline uppercase tracking-wider">
                    2. Evaluación
                  </span>
                  <div className="text-xl font-bold text-primary tabular-nums">
                    {pipelineData.enEvaluacion}
                  </div>
                  <span className="text-[10px] text-primary font-medium">{evalPercent}% pool</span>
                </div>

                <div className="p-3 rounded-lg bg-surface-dim/60 border border-outline-variant/40 space-y-1">
                  <span className="text-[10px] font-semibold text-outline uppercase tracking-wider">
                    3. Terna Final
                  </span>
                  <div className="text-xl font-bold text-secondary tabular-nums">
                    {pipelineData.finalistas}
                  </div>
                  <span className="text-[10px] text-secondary font-medium">{finPercent}% terna</span>
                </div>

                <div className="p-3 rounded-lg bg-surface-dim/60 border border-outline-variant/40 space-y-1">
                  <span className="text-[10px] font-semibold text-outline uppercase tracking-wider">
                    4. En Oferta
                  </span>
                  <div className="text-xl font-bold text-emerald-700 tabular-nums">
                    {pipelineData.oferta}
                  </div>
                  <span className="text-[10px] text-emerald-700 font-medium">{ofertaPercent}% oferta</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 9-Box Distribution */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-outline-variant/40">
              <div>
                <CardTitle className="text-sm font-semibold">
                  Distribución de Talento (Matriz 9-Box)
                </CardTitle>
                <CardDescription>
                  Consolidado de {distribution9Box.total} evaluaciones de potencial y desempeño
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('evaluacion-desempeno')}
              >
                <span>Ver Matriz</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </CardHeader>

            <CardContent className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-surface-bright rounded-lg border border-outline-variant/60 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-on-surface">Talento Destacado</span>
                    <span className="text-primary tabular-nums font-bold">{destPercent}%</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant">
                    {distribution9Box.destacado} con alto potencial
                  </p>
                  <div className="h-1.5 w-full bg-surface-dim rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${Math.min(destPercent, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-surface-bright rounded-lg border border-outline-variant/60 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-on-surface">Desempeño Sólido</span>
                    <span className="text-secondary tabular-nums font-bold">{solPercent}%</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant">
                    {distribution9Box.solido} de entrega continua
                  </p>
                  <div className="h-1.5 w-full bg-surface-dim rounded-full overflow-hidden">
                    <div
                      className="h-full bg-secondary rounded-full transition-all"
                      style={{ width: `${Math.min(solPercent, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-surface-bright rounded-lg border border-outline-variant/60 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-on-surface">En Desarrollo</span>
                    <span className="text-amber-800 tabular-nums font-bold">{desPercent}%</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant">
                    {distribution9Box.desarrollo} en plan formativo
                  </p>
                  <div className="h-1.5 w-full bg-surface-dim rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${Math.min(desPercent, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Risk & Operational Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Continuity Alertas */}
          <Card>
            <CardHeader className="pb-3 border-b border-outline-variant/40">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-outline flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Alertas de Continuidad
                </CardTitle>
                <Badge variant={kpis.spofAlertsCount > 0 ? 'destructive' : 'success'}>
                  {kpis.spofAlertsCount} crítica
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-3.5">
              {kpis.spofAlertsCount > 0 ? (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-amber-900">
                      Riesgo SPOF Identificado
                    </span>
                    <span className="text-[10px] font-mono text-amber-700">
                      Infraestructura
                    </span>
                  </div>
                  <p className="text-xs text-amber-950 leading-relaxed">
                    El puesto <strong>Arquitecto de Nube</strong> no cuenta con sucesor de respaldo activo.
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigate('puestos')}
                    className="text-xs font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer pt-1"
                  >
                    <span>Ver perfil del puesto</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <p className="text-xs text-outline py-2">
                  Todos los cargos clave cuentan con sucesores asignados.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Operational Metrics Summary */}
          <Card>
            <CardHeader className="pb-3 border-b border-outline-variant/40">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-outline">
                Resumen de Gestión
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 divide-y divide-outline-variant/30 text-xs">
              <div className="flex items-center justify-between py-2">
                <span className="text-on-surface-variant">Colaboradores activos</span>
                <span className="font-semibold text-on-surface tabular-nums">
                  {kpis.activeHeadcount} personas
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-on-surface-variant">Cobertura puestos clave</span>
                <span className="font-semibold text-secondary tabular-nums">
                  {kpis.criticalRolesCovered}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-on-surface-variant">Retorno capacitación (ROI)</span>
                <span className="font-semibold text-primary tabular-nums">
                  {kpis.trainingRoi}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-on-surface-variant">Efectividad evaluación</span>
                <span className="font-semibold text-on-surface tabular-nums">
                  {kpis.overallEffectiveness}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
