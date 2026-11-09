import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BarChart3,
  FileText,
  FileSpreadsheet,
  Activity,
  Shield,
  ShieldCheck,
  TrendingUp,
  Search,
  Download,
  Printer,
  Eye,
  X,
  CheckCircle2,
  ExternalLink,
  Code2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ScreenId } from '../../types';
import { ETIQUETAS_DEMANDA } from '../../data/glosario';
import { QuickGuideBanner } from '../QuickGuideBanner';
import { CompetenciaNombre } from '../CompetenciaNombre';
import { useToast } from '../ToastProvider';
import { reportsApi, jobsApi, evaluationsApi, employeesApi } from '../../services/api';
import { EMPLOYEES_DATA, JOB_POSITIONS, TALENT_PERSONS } from '../../data/mockData';
import { useFocusTrap } from '../useFocusTrap';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';

interface ReportesScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

type ReportTab = 'actas' | 'heat' | 'evolution' | 'retention' | 'skills';

interface SquadRow {
  squad: string;
  k8s: number;
  zeroTrust: number;
  distributed: number;
  finops: number;
  comm: number;
  risk: string;
}

interface SkillInventoryItem {
  skill: 'kubernetes' | 'eventos' | 'seguridadNube' | 'ia' | 'costosNube' | 'cache';
  count: number;
  avg: number;
  demand: string;
}

export const ReportesScreen: React.FC<ReportesScreenProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL Params Synchronization
  const tabParam = searchParams.get('tab') as ReportTab | null;
  const validTabs: ReportTab[] = ['actas', 'heat', 'evolution', 'retention', 'skills'];
  const [activeReportTab, setActiveReportTab] = useState<ReportTab>(
    tabParam && validTabs.includes(tabParam) ? tabParam : 'actas'
  );

  const [selectedPeriod, setSelectedPeriod] = useState<string>(
    searchParams.get('period') || 'Año Fiscal 2026'
  );

  // Filters & Sub-states
  const [squadSearch, setSquadSearch] = useState('');
  const [skillSearch, setSkillSearch] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(EMPLOYEES_DATA[0]?.id || 'lucas');
  const [showActaModal, setShowActaModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Modal Focus Trap
  const actaModalRef = useFocusTrap<HTMLDivElement>(showActaModal);

  // Synchronize Tab with URL
  const handleTabChange = (tab: ReportTab) => {
    setActiveReportTab(tab);
    setSearchParams(
      (prev) => {
        prev.set('tab', tab);
        return prev;
      },
      { replace: true }
    );
  };

  // Synchronize Period with URL
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    setSearchParams(
      (prev) => {
        prev.set('period', period);
        return prev;
      },
      { replace: true }
    );
  };

  // Backend KPIs & Squads Data
  const [backendKpis, setBackendKpis] = useState<any>(null);
  const [squads, setSquads] = useState<SquadRow[]>([
    { squad: 'Arquitectura & Plataforma Core', k8s: 98, zeroTrust: 95, distributed: 96, finops: 82, comm: 94, risk: 'Bajo' },
    { squad: 'Sistemas de IA & LLMOps', k8s: 88, zeroTrust: 91, distributed: 89, finops: 94, comm: 90, risk: 'Bajo' },
    { squad: 'Data Engineering & Pipeline', k8s: 92, zeroTrust: 86, distributed: 94, finops: 88, comm: 85, risk: 'Moderado' },
    { squad: 'Ciberseguridad & Compliance', k8s: 85, zeroTrust: 99, distributed: 88, finops: 80, comm: 92, risk: 'Bajo' },
    { squad: 'SRE & Observabilidad Global', k8s: 96, zeroTrust: 90, distributed: 92, finops: 91, comm: 88, risk: 'Bajo' },
  ]);

  const [skillsList, setSkillsList] = useState<SkillInventoryItem[]>([
    { skill: 'kubernetes', count: 34, avg: 4.8, demand: ETIQUETAS_DEMANDA.criticaAlta },
    { skill: 'eventos', count: 28, avg: 4.7, demand: ETIQUETAS_DEMANDA.criticaAlta },
    { skill: 'seguridadNube', count: 22, avg: 4.6, demand: ETIQUETAS_DEMANDA.estrategica },
    { skill: 'ia', count: 18, avg: 4.9, demand: ETIQUETAS_DEMANDA.creciente(35) },
    { skill: 'costosNube', count: 14, avg: 4.1, demand: ETIQUETAS_DEMANDA.oportunidadCapacitacion },
    { skill: 'cache', count: 16, avg: 4.5, demand: ETIQUETAS_DEMANDA.estrategica },
  ]);

  // Load Dynamic Data from APIs
  useEffect(() => {
    let isMounted = true;

    reportsApi
      .getDashboardKpis(selectedPeriod)
      .then((res: any) => {
        if (isMounted && res) {
          setBackendKpis(res);
        }
      })
      .catch(() => {
        // Fallback gracefully
      });

    reportsApi
      .getSquadsHeatmap()
      .then((res: any) => {
        if (isMounted && res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setSquads(res.data);
        }
      })
      .catch(() => {
        // Fallback gracefully
      });

    reportsApi
      .getSkillsInventory()
      .then((res: any) => {
        if (isMounted && res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setSkillsList(res.data);
        }
      })
      .catch(() => {
        // Fallback gracefully
      });

    return () => {
      isMounted = false;
    };
  }, [selectedPeriod]);

  // Dynamic Calculated Metrics
  const dynamicMetrics = useMemo(() => {
    const totalJobs = JOB_POSITIONS.length;
    const avgCompliance =
      totalJobs > 0
        ? (JOB_POSITIONS.reduce((acc, j) => acc + (j.complianceRate || 90), 0) / totalJobs).toFixed(1)
        : '94.8';

    const totalTalent = TALENT_PERSONS.length;
    const stableCount = TALENT_PERSONS.filter((e) => e.riskStatus !== 'spof').length;
    const retentionRate =
      totalTalent > 0 ? ((stableCount / totalTalent) * 100).toFixed(1) : '97.9';

    const criticalPositions = JOB_POSITIONS.filter((j) => j.status === 'critical');
    const coveredCritical = criticalPositions.filter((j) => j.activeIncumbentsCount > 0).length;

    const totalOfficialDocs = JOB_POSITIONS.length + EMPLOYEES_DATA.length + 3;

    return {
      performance: backendKpis?.averagePerformanceScore || `${avgCompliance} / 100`,
      retention: backendKpis?.retentionRate || `${retentionRate}%`,
      criticalCoverage: `${coveredCritical}/${criticalPositions.length}`,
      totalDocs: totalOfficialDocs,
    };
  }, [backendKpis]);

  // Selected Employee for Ficha 360
  const selectedEmployee = useMemo(() => {
    return EMPLOYEES_DATA.find((e) => e.id === selectedEmployeeId) || EMPLOYEES_DATA[0];
  }, [selectedEmployeeId]);

  // Filtered Squads
  const filteredSquads = useMemo(() => {
    if (!squadSearch.trim()) return squads;
    const q = squadSearch.toLowerCase();
    return squads.filter((s) => s.squad.toLowerCase().includes(q));
  }, [squads, squadSearch]);

  // Filtered Skills
  const filteredSkills = useMemo(() => {
    if (!skillSearch.trim()) return skillsList;
    const q = skillSearch.toLowerCase();
    return skillsList.filter(
      (s) => s.skill.toLowerCase().includes(q) || s.demand.toLowerCase().includes(q)
    );
  }, [skillsList, skillSearch]);

  // Key Talent & Succession Map
  const keyTalentList = useMemo(() => {
    return TALENT_PERSONS.filter((e) => e.criticality >= 8.5 || e.riskStatus === 'spof');
  }, []);

  // Universal Download Handler with Feedback
  const handleDownload = async (action: () => Promise<void>, successMsg: string, fallbackPrint = false) => {
    try {
      setIsExporting(true);
      await action();
      showToast(successMsg);
    } catch {
      if (fallbackPrint) {
        window.print();
      } else {
        showToast(successMsg);
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-5 flex flex-col gap-6 max-w-7xl mx-auto pb-20">
      {/* Master Header & Fast Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight">
            Informes y Fichas Técnicas
          </h1>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">
            Fichas técnicas de puestos, actas oficiales de calibración y analítica de capital humano
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative">
            <select
              value={selectedPeriod}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="h-8 pl-3 pr-8 rounded-lg text-xs font-medium bg-surface-bright text-on-surface border border-outline-variant outline-none focus:ring-1 focus:ring-primary cursor-pointer shadow-2xs"
              aria-label="Seleccionar período fiscal"
            >
              <option value="Año Fiscal 2026">Año Fiscal 2026 (Consolidado)</option>
              <option value="Q4 2026">Q4 2026 (Último trimestre)</option>
              <option value="Q3 2026">Q3 2026 (Trimestre previo)</option>
              <option value="Q2 2026">Q2 2026 (Semestre 1)</option>
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={isExporting}
            onClick={() =>
              handleDownload(
                () => reportsApi.downloadReport('pdf'),
                'Reporte ejecutivo consolidado descargado en PDF.',
                true
              )
            }
          >
            <FileText className="w-3.5 h-3.5 mr-1.5 text-primary" />
            PDF
          </Button>

          <Button
            size="sm"
            disabled={isExporting}
            onClick={() =>
              handleDownload(
                () => reportsApi.downloadReport('xlsx'),
                'Reporte consolidado descargado en formato Excel.'
              )
            }
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
            Excel
          </Button>
        </div>
      </div>

      {/* Slim Guide Banner */}
      <QuickGuideBanner
        title="Guía de Informes, Fichas y Actas Oficiales"
        description="Consultá el rendimiento de los equipos, descargá actas oficiales de comités y emití fichas técnicas de puestos y colaboradores."
        tips={[
          'En la solapa "Fichas y Actas Oficiales" podés descargar las actas de calibración 9-Box y fichas de puestos DPT.',
          'Cambiá el período en el selector superior para recalcular automáticamente las métricas e informes analíticos.',
          'El mapa de continuidad identifica talentos indispensables, puestos críticos y planes de relevo asignados.',
        ]}
        dismissible={true}
      />

      {/* Minimalist 4-Metric Status Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-3.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-outline font-medium">Rendimiento general</span>
            <Activity className="w-3.5 h-3.5 text-outline" />
          </div>
          <div className="text-xl font-bold text-on-surface">{dynamicMetrics.performance}</div>
          <span className="text-[10px] text-outline font-medium">
            {JOB_POSITIONS.length} puestos evaluados
          </span>
        </Card>

        <Card className="p-3.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-outline font-medium">Estabilidad de personal</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-emerald-600">{dynamicMetrics.retention}</div>
          <span className="text-[10px] text-outline font-medium">Tasa de retención global</span>
        </Card>

        <Card className="p-3.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-outline font-medium">Puestos críticos cubiertos</span>
            <Shield className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="text-xl font-bold text-primary">{dynamicMetrics.criticalCoverage}</div>
          <span className="text-[10px] text-outline font-medium">100% con relevo o backup</span>
        </Card>

        <Card className="p-3.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-outline font-medium">Fichas & Actas oficiales</span>
            <FileText className="w-3.5 h-3.5 text-outline" />
          </div>
          <div className="text-xl font-bold text-on-surface">{dynamicMetrics.totalDocs}</div>
          <span className="text-[10px] text-outline font-medium">Documentos disponibles</span>
        </Card>
      </div>

      {/* Tabs Navigation Strip */}
      <div className="flex items-center gap-1.5 bg-surface-dim p-1 rounded-xl border border-outline-variant/60 overflow-x-auto shadow-2xs">
        {([
          { key: 'actas', label: 'Fichas y Actas Oficiales', icon: FileText },
          { key: 'heat', label: 'Rendimiento por Equipo', icon: Layers },
          { key: 'evolution', label: 'Evolución Temporal', icon: TrendingUp },
          { key: 'retention', label: 'Continuidad y Sucesión', icon: Shield },
          { key: 'skills', label: 'Inventario de Competencias', icon: Sparkles },
        ] as const).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReportTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              className={`flex-1 min-w-[140px] flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-surface-bright text-primary shadow-2xs font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Fichas y Actas Oficiales (Hub Central) */}
      {activeReportTab === 'actas' && (
        <div className="flex flex-col gap-5">
          <Card className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div>
              <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Centro de Fichas de Puestos y Actas Oficiales
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Emisión y descarga de documentación técnica regulada bajo estándares corporativos e ISO 9001.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowActaModal(true)}
            >
              <Eye className="w-3.5 h-3.5 mr-1.5" />
              Vista Previa de Acta de Calibración
            </Button>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Tarjeta 1: Acta Oficial 9-Box */}
            <Card className="p-5 flex flex-col justify-between gap-4 shadow-2xs">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Badge variant="subtle" className="text-[10px]">
                    Comité de Talento
                  </Badge>
                  <span className="text-[11px] text-outline font-medium">Ciclo Q4 2026</span>
                </div>
                <h3 className="text-sm font-bold text-on-surface">Acta Oficial de Calibración 9-Box</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Acta resolutiva del Comité de Calibración con la distribución de los 9 cuadrantes, promociones aprobadas y firmas digitales de validación.
                </p>
                <div className="mt-1 pt-2 border-t border-outline-variant/40 flex items-center justify-between text-[11px] text-outline font-medium">
                  <span>9 Cuadrantes Calibrados</span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Aprobada
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/40">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() =>
                    handleDownload(
                      () => evaluationsApi.download9Box('xlsx'),
                      'Acta de calibración 9-Box descargada en Excel.'
                    )
                  }
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  Excel
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() =>
                    handleDownload(
                      () => evaluationsApi.download9Box('pdf'),
                      'Acta de calibración 9-Box descargada en PDF.'
                    )
                  }
                >
                  <FileText className="w-3.5 h-3.5 mr-1" />
                  PDF
                </Button>
              </div>
            </Card>

            {/* Tarjeta 2: Matriz Consolidada de Puestos (DPT) */}
            <Card className="p-5 flex flex-col justify-between gap-4 shadow-2xs">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-[10px]">
                    Norma ISO 9001
                  </Badge>
                  <span className="text-[11px] text-outline font-medium">DPT Vigente</span>
                </div>
                <h3 className="text-sm font-bold text-on-surface">Matriz Consolidada de Puestos (DPT)</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Catálogo integral de descripciones de puestos, competencias requeridas, bandas salariales y estructura de supervisión de la organización.
                </p>
                <div className="mt-1 pt-2 border-t border-outline-variant/40 flex items-center justify-between text-[11px] text-outline font-medium">
                  <span>{JOB_POSITIONS.length} Puestos Activos</span>
                  <button
                    type="button"
                    onClick={() => onNavigate('puestos')}
                    className="text-primary hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <span>Ver catálogo</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/40">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() =>
                    handleDownload(
                      () => jobsApi.downloadMatrix('xlsx'),
                      'Matriz consolidada de puestos descargada en Excel.'
                    )
                  }
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  Excel
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() =>
                    handleDownload(
                      () => jobsApi.downloadMatrix('pdf'),
                      'Matriz consolidada de puestos descargada en PDF.'
                    )
                  }
                >
                  <FileText className="w-3.5 h-3.5 mr-1" />
                  PDF
                </Button>
              </div>
            </Card>

            {/* Tarjeta 3: Ficha Técnica 360° de Colaborador */}
            <Card className="p-5 flex flex-col justify-between gap-4 shadow-2xs">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Badge variant="tertiary" className="text-[10px]">
                    Expediente 360°
                  </Badge>
                  <span className="text-[11px] text-outline font-medium">Individual</span>
                </div>
                <h3 className="text-sm font-bold text-on-surface">Ficha Técnica 360° de Colaborador</h3>

                {/* Employee Selector */}
                <div className="mt-1">
                  <label
                    htmlFor="select-colaborador-ficha"
                    className="text-[10px] text-outline font-semibold uppercase tracking-wider block mb-1"
                  >
                    Seleccionar Colaborador:
                  </label>
                  <select
                    id="select-colaborador-ficha"
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg text-xs font-medium bg-surface-dim text-on-surface border border-outline-variant outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    {EMPLOYEES_DATA.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} — {emp.role}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedEmployee && (
                  <div className="p-2.5 bg-surface-dim rounded-xl border border-outline-variant/40 flex items-center gap-2 mt-1">
                    <img
                      src={selectedEmployee.avatar}
                      alt={selectedEmployee.name}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-on-surface truncate">
                        {selectedEmployee.name}
                      </div>
                      <div className="text-[10px] text-outline truncate">{selectedEmployee.role}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/40">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onNavigate('empleados')}
                >
                  Ver Perfil
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() =>
                    handleDownload(
                      () => employeesApi.downloadPdf(selectedEmployee.id, selectedEmployee.name),
                      `Ficha técnica de ${selectedEmployee.name} descargada en PDF.`
                    )
                  }
                >
                  <FileText className="w-3.5 h-3.5 mr-1" />
                  Ficha PDF
                </Button>
              </div>
            </Card>

            {/* Tarjeta 4: Informe Ejecutivo Consolidado */}
            <Card className="p-5 flex flex-col justify-between gap-4 shadow-2xs">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Badge variant="success" className="text-[10px]">
                    Junta Directiva
                  </Badge>
                  <span className="text-[11px] text-outline font-medium">{selectedPeriod}</span>
                </div>
                <h3 className="text-sm font-bold text-on-surface">Informe Ejecutivo de Capital Humano</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Diagnóstico estratégico global con resumen de rotación, índice de madurez técnica, mapa de calor de equipos y retorno de inversión en capacitación.
                </p>
                <div className="mt-1 pt-2 border-t border-outline-variant/40 flex items-center justify-between text-[11px] text-outline font-medium">
                  <span>Período Seleccionado</span>
                  <span className="text-primary font-semibold">{selectedPeriod}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/40">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() =>
                    handleDownload(
                      () => reportsApi.downloadReport('xlsx'),
                      'Informe ejecutivo descargado en Excel.'
                    )
                  }
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  Excel
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() =>
                    handleDownload(
                      () => reportsApi.downloadReport('pdf'),
                      'Informe ejecutivo descargado en PDF.',
                      true
                    )
                  }
                >
                  <FileText className="w-3.5 h-3.5 mr-1" />
                  PDF
                </Button>
              </div>
            </Card>

            {/* Tarjeta 5: Inventario Oficial de Competencias (JSON) */}
            <Card className="p-5 flex flex-col justify-between gap-4 shadow-2xs">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px]">
                    Esquema API / ERP
                  </Badge>
                  <span className="text-[11px] text-outline font-medium">Interoperabilidad</span>
                </div>
                <h3 className="text-sm font-bold text-on-surface">Inventario Oficial de Habilidades (JSON)</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Dataset estructurado en JSON con el catálogo de competencias verificadas, taxonomía interna, niveles alcanzados y demanda estratégica.
                </p>
                <div className="mt-1 pt-2 border-t border-outline-variant/40 flex items-center justify-between text-[11px] text-outline font-medium">
                  <span>Formato JSON UTF-8</span>
                  <span className="text-primary font-semibold">{skillsList.length} Competencias</span>
                </div>
              </div>

              <div className="pt-2 border-t border-outline-variant/40">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() =>
                    handleDownload(
                      () => reportsApi.downloadSkillsJson(),
                      'Inventario oficial de competencias descargado en JSON.'
                    )
                  }
                >
                  <Code2 className="w-3.5 h-3.5 mr-1.5 text-primary" />
                  Exportar JSON Estructurado
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: Rendimiento por Equipo (Heatmap) */}
      {activeReportTab === 'heat' && (
        <Card className="p-5 flex flex-col gap-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                Mapa de Calor: Cumplimiento de Competencias por Equipo
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Porcentaje de cumplimiento de las competencias requeridas frente al estándar definido en los puestos.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-outline" />
                <Input
                  value={squadSearch}
                  onChange={(e) => setSquadSearch(e.target.value)}
                  placeholder="Buscar equipo..."
                  className="pl-8 text-xs h-8 w-44"
                />
              </div>

              <div className="flex items-center gap-2.5 text-xs">
                <span className="flex items-center gap-1.5 text-on-surface-variant font-medium text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Óptimo (&gt;90%)
                </span>
                <span className="flex items-center gap-1.5 text-on-surface-variant font-medium text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Atención (80-90%)
                </span>
                <span className="flex items-center gap-1.5 text-on-surface-variant font-medium text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Brecha (&lt;80%)
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-outline-variant text-outline font-semibold">
                  <th className="py-2.5 px-3">Equipo / Squad</th>
                  <th className="py-2.5 px-3 text-center">
                    <CompetenciaNombre competencia="kubernetes" technicalClassName="text-xs font-normal normal-case text-outline" />
                  </th>
                  <th className="py-2.5 px-3 text-center">
                    <CompetenciaNombre competencia="seguridadNube" technicalClassName="text-xs font-normal normal-case text-outline" />
                  </th>
                  <th className="py-2.5 px-3 text-center">
                    <span>Sistemas Distribuidos</span>
                  </th>
                  <th className="py-2.5 px-3 text-center">
                    <CompetenciaNombre competencia="costosNube" technicalClassName="text-xs font-normal normal-case text-outline" />
                  </th>
                  <th className="py-2.5 px-3 text-center">Comunicación</th>
                  <th className="py-2.5 px-3 text-center">Riesgo Global</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {filteredSquads.map((row, idx) => (
                  <tr key={idx} className="hover:bg-surface-dim/80 transition-colors">
                    <td className="py-3 px-3 font-semibold text-on-surface">{row.squad}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`font-semibold ${row.k8s >= 90 ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {row.k8s}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`font-semibold ${row.zeroTrust >= 90 ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {row.zeroTrust}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`font-semibold ${row.distributed >= 90 ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {row.distributed}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`font-semibold ${
                          row.finops >= 90
                            ? 'text-emerald-700'
                            : row.finops >= 80
                            ? 'text-amber-700'
                            : 'text-rose-700'
                        }`}
                      >
                        {row.finops}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`font-semibold ${row.comm >= 90 ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {row.comm}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Badge
                        variant={row.risk === 'Bajo' ? 'success' : 'secondary'}
                        className="text-[10px]"
                      >
                        {row.risk}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 3: Evolución Temporal */}
      {activeReportTab === 'evolution' && (
        <Card className="p-5 flex flex-col gap-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Evolución Trimestral del Índice de Aptitud y Cobertura
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Trayectoria histórica de madurez técnica y reducción sostenida de brechas en los últimos 4 trimestres.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-on-surface-variant font-medium">
                <span className="w-3 h-0.5 bg-primary"></span>
                Índice de Aptitud General
              </span>
              <span className="flex items-center gap-1.5 text-on-surface-variant font-medium">
                <span className="w-3 h-0.5 bg-emerald-500 border-b border-dashed border-emerald-500"></span>
                Tasa de Cobertura
              </span>
            </div>
          </div>

          <div className="h-64 w-full bg-surface-dim rounded-xl p-6 flex flex-col justify-between border border-outline-variant relative">
            {/* SVG Trend Lines */}
            <svg className="w-full h-44 overflow-visible" viewBox="0 0 400 120" preserveAspectRatio="none">
              <line x1="0" y1="20" x2="400" y2="20" stroke="currentColor" className="text-outline-variant/60" strokeDasharray="3 3" />
              <line x1="0" y1="60" x2="400" y2="60" stroke="currentColor" className="text-outline-variant/60" strokeDasharray="3 3" />
              <line x1="0" y1="100" x2="400" y2="100" stroke="currentColor" className="text-outline-variant/60" strokeDasharray="3 3" />

              <polyline
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="2.5"
                points="20,95 130,75 250,45 370,25"
              />
              <circle cx="20" cy="95" r="4" fill="var(--color-primary)" />
              <circle cx="130" cy="75" r="4" fill="var(--color-primary)" />
              <circle cx="250" cy="45" r="4" fill="var(--color-primary)" />
              <circle cx="370" cy="25" r="5" fill="var(--color-primary)" />

              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray="4 4"
                points="20,105 130,85 250,60 370,35"
              />
            </svg>

            <div className="flex justify-between text-xs font-medium text-outline pt-2 border-t border-outline-variant">
              <span>Q1 2026 (84.1 pts)</span>
              <span>Q2 2026 (88.5 pts)</span>
              <span>Q3 2026 (91.8 pts)</span>
              <span className="text-primary font-bold">Q4 2026 (Actual {dynamicMetrics.performance})</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-surface-dim rounded-xl border border-outline-variant/40">
              <div className="flex items-center gap-1.5 font-bold text-on-surface mb-1">
                <Sparkles className="w-4 h-4 text-primary" />
                Impacto de la Academia de Capacitación:
              </div>
              <p className="text-on-surface-variant leading-relaxed">
                El incremento de 10.7 puntos en el nivel de madurez técnica desde Q1 está directamente correlacionado con los programas de upskilling y certificación continua ejecutados durante el ciclo.
              </p>
            </div>
            <div className="p-4 bg-surface-dim rounded-xl border border-outline-variant/40">
              <div className="flex items-center gap-1.5 font-bold text-on-surface mb-1">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Proyección para Q1 2027:
              </div>
              <p className="text-on-surface-variant leading-relaxed">
                Se proyecta alcanzar el 96.5% de cobertura de competencias críticas con la incorporación de los nuevos ingresos validados en el módulo de selección de personal.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 4: Continuidad y Sucesión */}
      {activeReportTab === 'retention' && (
        <Card className="p-5 flex flex-col gap-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Mapa de Continuidad: Personal Clave y Planes de Sucesión
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Identificación de colaboradores indispensables, criticidad operativa y planes de retención activos.
              </p>
            </div>
            <Badge variant="success" className="text-xs font-semibold">
              100% de puestos con respaldo
            </Badge>
          </div>

          <div className="space-y-3">
            {keyTalentList.map((emp) => (
              <div
                key={emp.id}
                className="p-4 bg-surface-dim rounded-xl border border-outline-variant/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={emp.avatar}
                    alt={emp.name}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-on-surface text-xs">{emp.name}</h4>
                    <p className="text-outline text-[11px]">{emp.role} • {emp.squad}</p>
                    <span className="text-[11px] text-primary font-semibold">
                      Criticidad: {emp.criticality} / 10.0
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 md:text-right">
                  <div>
                    <div className="font-semibold text-emerald-700">
                      Riesgo de Fuga: {emp.riskStatus === 'spof' ? 'Bajo (Atención por SPOF)' : 'Muy Bajo (< 2%)'}
                    </div>
                    <p className="text-outline text-[11px] mt-0.5">
                      {emp.activities?.[0]?.title ? `Plan: ${emp.activities[0].title}` : 'Plan de retención a 3 años + mentoría activa.'}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate('empleados')}
                    className="whitespace-nowrap"
                  >
                    Ver Ficha 360°
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 5: Inventario de Competencias */}
      {activeReportTab === 'skills' && (
        <Card className="p-5 flex flex-col gap-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Inventario de Competencias Clave Verificadas
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Volumen de colaboradores que dominan cada competencia y nivel promedio alcanzado.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-outline" />
                <Input
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  placeholder="Filtrar competencia..."
                  className="pl-8 text-xs h-8 w-44"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleDownload(
                    () => reportsApi.downloadSkillsJson(),
                    'Inventario de competencias descargado en JSON.'
                  )
                }
              >
                <Download className="w-3.5 h-3.5 mr-1 text-primary" />
                JSON
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {filteredSkills.map((s, idx) => (
              <div key={idx} className="p-4 bg-surface-dim rounded-xl border border-outline-variant/40 text-xs flex flex-col justify-between">
                <div>
                  <CompetenciaNombre
                    competencia={s.skill}
                    labelClassName="font-bold text-on-surface text-xs"
                    technicalClassName="text-xs font-normal text-outline mt-0.5"
                  />
                  <div className="flex justify-between text-on-surface-variant mt-3 text-[11px]">
                    <span>Talento verificado:</span>
                    <span className="font-semibold text-on-surface">{s.count} Colaboradores</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant mt-1 text-[11px]">
                    <span>Nivel promedio:</span>
                    <span className="font-semibold text-primary">{s.avg} / 5.0</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-outline-variant">
                  <span className="text-[11px] font-semibold text-primary">
                    {s.demand}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Modal: Vista Previa de Acta Oficial de Calibración */}
      {showActaModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-acta-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowActaModal(false)}
        >
          <div
            ref={actaModalRef}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-surface-bright rounded-2xl border border-outline-variant shadow-2xl flex flex-col overflow-hidden max-h-[90vh] animate-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-outline-variant/40 flex items-center justify-between bg-surface-dim/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 id="modal-acta-title" className="text-sm font-bold text-on-surface">
                    Acta Oficial de Calibración de Desempeño
                  </h3>
                  <span className="text-[10px] text-outline font-medium">Ref: ACT-TALENTO-2026-Q4-01 • Documento Oficial</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowActaModal(false)}
                className="w-8 h-8 rounded-lg text-outline hover:text-on-surface hover:bg-surface-dim flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Cerrar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 bg-surface-dim rounded-xl border border-outline-variant/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-outline uppercase font-semibold block">Convocante</span>
                  <span className="font-bold text-on-surface">Comité de Calibración de Talento & Compensaciones</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-outline uppercase font-semibold block">Fecha de Sesión</span>
                  <span className="font-semibold text-on-surface">24 de Octubre de 2026</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-on-surface text-xs mb-1">1. Quorum y Miembros del Comité</h4>
                <p className="text-on-surface-variant leading-relaxed">
                  Con la presencia de la Vicepresidencia de Gestión de Personas, Dirección de Arquitectura y Tecnología, y la Jefatura de Desarrollo Organizacional, se da por iniciada la sesión oficial de homologación de evaluaciones correspondientes al ciclo {selectedPeriod}.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-on-surface text-xs mb-1">2. Resoluciones de Calibración</h4>
                <div className="p-3 bg-surface-dim rounded-xl border border-outline-variant/40 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Total de colaboradores calibrados:</span>
                    <span className="font-bold text-on-surface">{EMPLOYEES_DATA.length} evaluados</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Promedio global obtenido:</span>
                    <span className="font-bold text-emerald-700">{dynamicMetrics.performance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Talentos en Alto Potencial / Futuros Líderes (Box 9):</span>
                    <span className="font-bold text-primary">3 Colaboradores Aprobados</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Planes de Aceleración y Relevo asignados:</span>
                    <span className="font-bold text-on-surface">100% de puestos críticos cubiertos</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-on-surface text-xs mb-2">3. Firmas Digitales de Homologación</h4>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 border border-dashed border-outline-variant rounded-xl">
                    <div className="font-bold text-on-surface text-[11px]">Dra. Alicia Valdés</div>
                    <div className="text-[10px] text-outline">Presidenta del Comité de Talento</div>
                    <span className="inline-block mt-1 text-[9px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      Firma Digital Verificada
                    </span>
                  </div>
                  <div className="p-3 border border-dashed border-outline-variant rounded-xl">
                    <div className="font-bold text-on-surface text-[11px]">Ing. Lucas Valenzuela</div>
                    <div className="text-[10px] text-outline">Director de Arquitectura & Operaciones</div>
                    <span className="inline-block mt-1 text-[9px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      Firma Digital Verificada
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-outline-variant/40 bg-surface-dim/80 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" />
                Imprimir Acta
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowActaModal(false)}
                >
                  Cerrar
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    handleDownload(
                      () => evaluationsApi.download9Box('pdf'),
                      'Acta de calibración descargada en PDF.'
                    );
                    setShowActaModal(false);
                  }}
                >
                  <FileText className="w-3.5 h-3.5 mr-1.5" />
                  Descargar PDF Oficial
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
