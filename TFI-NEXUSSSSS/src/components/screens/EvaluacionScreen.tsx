import React, { useState, useEffect, useMemo } from 'react';
import { ScreenId } from '../../types';
import { UserAvatar } from '../UserAvatar';
import { QuickGuideBanner } from '../QuickGuideBanner';
import { useToast } from '../ToastProvider';
import { useFocusTrap } from '../useFocusTrap';
import { evaluationsApi } from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  Download,
  SlidersHorizontal,
  CheckCircle2,
  Award,
  TrendingUp,
  AlertTriangle,
  Grid3X3,
  ListFilter,
  CheckCheck,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  X,
  FileText,
  Check,
  UserCheck,
  Star,
  User,
  Clock,
  Sparkles,
} from 'lucide-react';

interface EvaluacionScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onSelectEmployee?: (employeeId: string) => void;
}

export interface EvaluationRecord {
  id: string;
  employeeName: string;
  role: string;
  area: string;
  avatar: string;
  evaluator: string;
  selfScore: number;
  managerScore: number;
  peersScore: number;
  calibratedScore: number;
  box9: 'Talento Destacado (Estrella)' | 'Alto Potencial' | 'Desempeño Sólido' | 'Especialista Clave' | 'En Desarrollo';
  status: 'Calibrado' | 'En Revisión' | 'Pendiente Comité';
  gapAnalysis: string;
  potentialScore: number; // 1-5
  performanceScore: number; // 1-5
}

const INITIAL_RECORDS: EvaluationRecord[] = [
  {
    id: 'lucas',
    employeeName: 'Ing. Lucas Valenzuela',
    role: 'Arquitecto Principal de Nube',
    area: 'Infraestructura y Plataforma',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    evaluator: 'Martín Krause (VP Ingeniería)',
    selfScore: 4.8,
    managerScore: 4.7,
    peersScore: 4.75,
    calibratedScore: 4.74,
    box9: 'Talento Destacado (Estrella)',
    status: 'Calibrado',
    gapAnalysis: 'Superávit en Alta Disponibilidad; oportunidad leve en optimización de costos en la nube.',
    potentialScore: 4.9,
    performanceScore: 4.8,
  },
  {
    id: 'sofia',
    employeeName: 'Sofía Méndez',
    role: 'Líder de Ingeniería en IA',
    area: 'Algoritmos y Modelos',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    evaluator: 'Elena Rostova (Dir. IA)',
    selfScore: 4.9,
    managerScore: 4.85,
    peersScore: 4.95,
    calibratedScore: 4.9,
    box9: 'Talento Destacado (Estrella)',
    status: 'Calibrado',
    gapAnalysis: 'Referente técnico en la organización; elegible para Principal Engineer.',
    potentialScore: 5.0,
    performanceScore: 4.9,
  },
  {
    id: 'marcos',
    employeeName: 'Marcos Varela',
    role: 'Ingeniero Principal de Datos',
    area: 'Plataformas de Procesamiento',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    evaluator: 'Lucas Valenzuela (Arquitecto)',
    selfScore: 4.5,
    managerScore: 4.6,
    peersScore: 4.4,
    calibratedScore: 4.55,
    box9: 'Especialista Clave',
    status: 'Calibrado',
    gapAnalysis: 'Desempeño técnico sobresaliente en streaming de eventos; fortalecer mentoría.',
    potentialScore: 4.2,
    performanceScore: 4.7,
  },
  {
    id: 'gabriel',
    employeeName: 'Gabriel Pardo',
    role: 'Especialista MLOps',
    area: 'Infraestructura de Cómputo',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    evaluator: 'Sofía Méndez (Líder IA)',
    selfScore: 4.2,
    managerScore: 4.1,
    peersScore: 4.3,
    calibratedScore: 4.18,
    box9: 'Alto Potencial',
    status: 'En Revisión',
    gapAnalysis: 'Progreso acelerado en orquestación Ray; brecha moderada en seguridad clúster.',
    potentialScore: 4.6,
    performanceScore: 4.1,
  },
  {
    id: 'laura',
    employeeName: 'Lic. Laura Benítez',
    role: 'Arquitecto de Seguridad y Accesos',
    area: 'Ciberseguridad y Normativas',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    evaluator: 'Martín Krause (VP Ingeniería)',
    selfScore: 4.6,
    managerScore: 4.4,
    peersScore: 4.5,
    calibratedScore: 4.48,
    box9: 'Desempeño Sólido',
    status: 'Pendiente Comité',
    gapAnalysis: 'Cero incidentes críticos de seguridad; revisión salarial en proceso.',
    potentialScore: 4.3,
    performanceScore: 4.5,
  },
];

export const EvaluacionScreen: React.FC<EvaluacionScreenProps> = ({
  onNavigate,
  onSelectEmployee,
}) => {
  const { showToast } = useToast();
  const [records, setRecords] = useState<EvaluationRecord[]>(INITIAL_RECORDS);
  const [selectedRecordId, setSelectedRecordId] = useState<string>('lucas');
  const [selectedCycle, setSelectedCycle] = useState<string>('Ciclo Anual 2026 (Calibración Q4)');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'calibrated' | 'pending'>('all');
  const [showCalibrateModal, setShowCalibrateModal] = useState<boolean>(false);
  const [calibrationScore, setCalibrationScore] = useState<number>(4.75);
  const [calibrationNotes, setCalibrationNotes] = useState<string>(
    'Se valida consistencia en entregables de alta disponibilidad durante Q4.'
  );
  const [showConfirmApproval, setShowConfirmApproval] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'list' | '9box' | 'committee'>('list');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const [sortConfig, setSortConfig] = useState<{
    key: 'employeeName' | 'calibratedScore' | 'status';
    direction: 'asc' | 'desc';
  }>({
    key: 'calibratedScore',
    direction: 'desc',
  });

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const calibrateModalRef = useFocusTrap<HTMLDivElement>(showCalibrateModal);
  const approvalModalRef = useFocusTrap<HTMLDivElement>(showConfirmApproval);

  useEffect(() => {
    let isMounted = true;
    evaluationsApi
      .getAll()
      .then((res: { total: number; data: any[] }) => {
        if (isMounted && res && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: EvaluationRecord[] = res.data.map((item: any, idx: number) => {
            const rawScore = Number(item.calibratedScore || item.score || 4.5);
            let box: EvaluationRecord['box9'] = 'Desempeño Sólido';
            if (rawScore >= 4.8) box = 'Talento Destacado (Estrella)';
            else if (rawScore >= 4.5) box = 'Alto Potencial';
            else if (rawScore >= 4.2) box = 'Especialista Clave';
            else if (rawScore < 3.8) box = 'En Desarrollo';

            return {
              id: item.id || `emp-${idx}`,
              employeeName: item.employeeName || item.name || 'Colaborador',
              role: item.role || 'Puesto Técnico',
              area: item.area || 'Ingeniería',
              avatar: item.avatar || '',
              evaluator: item.evaluator || 'Comité de Calibración',
              selfScore: Number(item.selfScore || (rawScore - 0.1).toFixed(2)),
              managerScore: Number(item.managerScore || rawScore.toFixed(2)),
              peersScore: Number(item.peersScore || (rawScore + 0.05).toFixed(2)),
              calibratedScore: rawScore,
              box9: box,
              status: item.status === 'calibrated' ? 'Calibrado' : 'Pendiente Comité',
              gapAnalysis: item.gapAnalysis || 'Cumplimiento óptimo de estándares.',
              potentialScore: Number(item.potentialScore || 4.5),
              performanceScore: Number(item.performanceScore || rawScore),
            };
          });
          setRecords(mapped);
          if (mapped[0]) setSelectedRecordId(mapped[0].id);
        }
      })
      .catch((err: unknown) => {
        console.warn('Evaluations API fallback local:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const activeRecord: EvaluationRecord =
    records.find((r) => r.id === selectedRecordId) || records[0] || INITIAL_RECORDS[0];

  const handleSaveCalibration = async () => {
    let updatedBox9: EvaluationRecord['box9'] = 'En Desarrollo';
    if (calibrationScore >= 4.7) {
      updatedBox9 = 'Talento Destacado (Estrella)';
    } else if (calibrationScore >= 4.4) {
      updatedBox9 = 'Alto Potencial';
    } else if (calibrationScore >= 4.2) {
      updatedBox9 = 'Especialista Clave';
    } else if (calibrationScore >= 4.0) {
      updatedBox9 = 'Desempeño Sólido';
    }

    try {
      const res = await evaluationsApi.calibrate(activeRecord.id, {
        calibratedScore: calibrationScore,
        box9: updatedBox9,
        notes: calibrationNotes,
      });
      setRecords((prev) =>
        prev.map((r) =>
          r.id === activeRecord.id
            ? {
                ...r,
                calibratedScore: calibrationScore,
                box9: updatedBox9,
                status: 'Calibrado',
              }
            : r
        )
      );
      showToast(
        res?.message ||
          `Calibración de ${activeRecord.employeeName} actualizada a ${calibrationScore.toFixed(2)}.`,
        'success'
      );
    } catch {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === activeRecord.id
            ? {
                ...r,
                calibratedScore: calibrationScore,
                box9: updatedBox9,
                status: 'Calibrado',
              }
            : r
        )
      );
      showToast(
        `Calibración de ${activeRecord.employeeName} actualizada a ${calibrationScore.toFixed(2)}.`,
        'success'
      );
    }
    setShowCalibrateModal(false);
  };

  const handleApproveAll = async () => {
    setRecords((prev) => prev.map((r) => ({ ...r, status: 'Calibrado' as const })));
    showToast('Ciclo de calibración aprobado exitosamente.', 'success');
    setShowConfirmApproval(false);
  };

  const handleExport9Box = async () => {
    setIsExporting(true);
    try {
      await evaluationsApi.download9Box('xlsx');
      showToast('Matriz 9-Box descargada exitosamente en formato Excel.', 'success');
    } catch {
      showToast('Matriz 9-Box exportada (modo local).', 'info');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSort = (key: 'employeeName' | 'calibratedScore' | 'status') => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    setCurrentPage(1);
  };

  const filteredRecords = records.filter((r) => {
    if (selectedFilter === 'calibrated') return r.status === 'Calibrado';
    if (selectedFilter === 'pending')
      return r.status === 'Pendiente Comité' || r.status === 'En Revisión';
    return true;
  });

  const orderedRecords = [...filteredRecords].sort((a, b) => {
    const { key, direction } = {
      key: sortConfig.key,
      direction: sortConfig.direction === 'asc' ? 1 : -1,
    };

    if (key === 'employeeName') {
      return a.employeeName.localeCompare(b.employeeName) * direction;
    }

    if (key === 'status') {
      return a.status.localeCompare(b.status) * direction;
    }

    return (a.calibratedScore - b.calibratedScore) * direction;
  });

  const totalPages = Math.ceil(orderedRecords.length / pageSize) || 1;
  const paginatedRecords = orderedRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Métricas dinámicas calculadas 100% desde los datos
  const totalRecords = records.length;
  const totalEvaluated = records.filter((r) => r.status === 'Calibrado').length;

  const avgPerformance = useMemo(() => {
    if (records.length === 0) return '0.00';
    const sum = records.reduce((acc, r) => acc + (r.calibratedScore || 0), 0);
    return (sum / records.length).toFixed(2);
  }, [records]);

  const starTalentCount = useMemo(() => {
    return records.filter(
      (r) => r.box9 === 'Talento Destacado (Estrella)' || r.calibratedScore >= 4.7
    ).length;
  }, [records]);

  const pendingCalibrationCount = useMemo(() => {
    return records.filter((r) => r.status !== 'Calibrado').length;
  }, [records]);

  // Consulta dinámica para la Matriz 9-Box
  const getEmployeesForBox = (
    perfTier: 'low' | 'med' | 'high',
    potTier: 'low' | 'med' | 'high'
  ) => {
    return records.filter((r) => {
      const perf = r.performanceScore ?? r.calibratedScore;
      const pot = r.potentialScore ?? r.calibratedScore;
      const matchPerf =
        perfTier === 'high' ? perf >= 4.6 : perfTier === 'med' ? perf >= 4.1 && perf < 4.6 : perf < 4.1;
      const matchPot =
        potTier === 'high' ? pot >= 4.6 : potTier === 'med' ? pot >= 4.1 && pot < 4.6 : pot < 4.1;
      return matchPerf && matchPot;
    });
  };

  // Curva de comité
  const countEstrella = starTalentCount;
  const countSolido = records.filter(
    (r) => r.calibratedScore >= 4.2 && r.calibratedScore < 4.7
  ).length;
  const countAcomp = records.filter((r) => r.calibratedScore < 4.2).length;

  const pctEstrella = totalRecords > 0 ? ((countEstrella / totalRecords) * 100).toFixed(1) : '0.0';
  const pctSolido = totalRecords > 0 ? ((countSolido / totalRecords) * 100).toFixed(1) : '0.0';
  const pctAcomp = totalRecords > 0 ? ((countAcomp / totalRecords) * 100).toFixed(1) : '0.0';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header & Global Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-outline-variant/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-on-surface">
              Evaluación y Calibración 9-Box
            </h1>
            <Badge variant="subtle">{selectedCycle}</Badge>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Calibración matricial de desempeño vs potencial, feedback 360° y actas de comité.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport9Box}
            disabled={isExporting}
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            <span>Exportar Matriz</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setShowConfirmApproval(true)}
          >
            <CheckCheck className="w-3.5 h-3.5 mr-1" />
            <span>Aprobar Ciclo</span>
          </Button>
        </div>
      </div>

      {/* Slim Guide Bar */}
      <QuickGuideBanner
        title="Evaluación y Calibración"
        description="Revisión de puntajes de autoevaluación, líderes y pares con balance de comité."
        tips={[
          'En "Tabla de Evaluaciones" hacé clic sobre cualquier colaborador para abrir su comparativo 360°.',
          'La pestaña "Matriz 9-Box" mapea el potencial futuro frente al rendimiento operativo actual.',
          'El botón "Calibrar en Sesión" permite fijar el puntaje final avalado por el comité de RRHH.',
        ]}
        dismissible={true}
      />

      {/* Clean 4-Metric Status Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-3.5">
          <span className="text-[11px] font-medium text-outline uppercase tracking-wider block">
            Evaluados en ciclo
          </span>
          <div className="text-xl font-bold text-on-surface mt-1 tabular-nums">
            {totalEvaluated} / {totalRecords} <span className="text-xs font-normal text-outline">personas</span>
          </div>
        </Card>

        <Card className="p-3.5">
          <span className="text-[11px] font-medium text-outline uppercase tracking-wider block">
            Puntaje calibrado
          </span>
          <div className="text-xl font-bold text-primary mt-1 tabular-nums">
            {avgPerformance} <span className="text-xs font-normal text-outline">promedio</span>
          </div>
        </Card>

        <Card className="p-3.5">
          <span className="text-[11px] font-medium text-outline uppercase tracking-wider block">
            Talento destacado
          </span>
          <div className="text-xl font-bold text-secondary mt-1 tabular-nums">
            {starTalentCount} <span className="text-xs font-normal text-outline">estrellas</span>
          </div>
        </Card>

        <Card className="p-3.5">
          <span className="text-[11px] font-medium text-outline uppercase tracking-wider block">
            Pendientes comité
          </span>
          <div className="text-xl font-bold text-amber-700 mt-1 tabular-nums">
            {pendingCalibrationCount} <span className="text-xs font-normal text-outline">por validar</span>
          </div>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 bg-surface-dim p-1 rounded-lg border border-outline-variant/60">
        <button
          type="button"
          onClick={() => setActiveTab('list')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'list'
              ? 'bg-surface-bright text-on-surface shadow-2xs font-semibold'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <ListFilter className="w-3.5 h-3.5" />
          <span>Tabla Comparativa ({filteredRecords.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('9box')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
            activeTab === '9box'
              ? 'bg-surface-bright text-on-surface shadow-2xs font-semibold'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Grid3X3 className="w-3.5 h-3.5" />
          <span>Matriz 9-Box Interactiva</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('committee')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'committee'
              ? 'bg-surface-bright text-on-surface shadow-2xs font-semibold'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Dictamen del Comité</span>
        </button>
      </div>

      {/* TAB 1: LIST & DETAIL */}
      {activeTab === 'list' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Table List (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedFilter('all');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer border ${
                  selectedFilter === 'all'
                    ? 'bg-primary text-on-primary border-primary shadow-2xs'
                    : 'bg-surface-bright border-outline-variant/60 text-on-surface-variant hover:bg-surface-dim'
                }`}
              >
                Todos ({records.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedFilter('calibrated');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer border ${
                  selectedFilter === 'calibrated'
                    ? 'bg-primary text-on-primary border-primary shadow-2xs'
                    : 'bg-surface-bright border-outline-variant/60 text-on-surface-variant hover:bg-surface-dim'
                }`}
              >
                Calibrados ({totalEvaluated})
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedFilter('pending');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer border ${
                  selectedFilter === 'pending'
                    ? 'bg-primary text-on-primary border-primary shadow-2xs'
                    : 'bg-surface-bright border-outline-variant/60 text-on-surface-variant hover:bg-surface-dim'
                }`}
              >
                Pendientes ({pendingCalibrationCount})
              </button>
            </div>

            {/* Table */}
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-dim text-outline uppercase font-semibold text-[10px] border-b border-outline-variant/60">
                    <tr>
                      <th
                        className="p-3 cursor-pointer select-none hover:text-on-surface transition-colors"
                        onClick={() => handleSort('employeeName')}
                      >
                        <div className="flex items-center gap-1">
                          <span>Colaborador</span>
                          {sortConfig.key === 'employeeName' ? (
                            sortConfig.direction === 'asc' ? (
                              <ArrowUp className="w-3 h-3 text-primary" />
                            ) : (
                              <ArrowDown className="w-3 h-3 text-primary" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-outline/50" />
                          )}
                        </div>
                      </th>
                      <th
                        className="p-3 cursor-pointer select-none hover:text-on-surface transition-colors"
                        onClick={() => handleSort('calibratedScore')}
                      >
                        <div className="flex items-center gap-1">
                          <span>Puntaje</span>
                          {sortConfig.key === 'calibratedScore' ? (
                            sortConfig.direction === 'asc' ? (
                              <ArrowUp className="w-3 h-3 text-primary" />
                            ) : (
                              <ArrowDown className="w-3 h-3 text-primary" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-outline/50" />
                          )}
                        </div>
                      </th>
                      <th className="p-3 hidden sm:table-cell">9-Box</th>
                      <th
                        className="p-3 cursor-pointer select-none hover:text-on-surface transition-colors"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center gap-1">
                          <span>Estado</span>
                          {sortConfig.key === 'status' ? (
                            sortConfig.direction === 'asc' ? (
                              <ArrowUp className="w-3 h-3 text-primary" />
                            ) : (
                              <ArrowDown className="w-3 h-3 text-primary" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-outline/50" />
                          )}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {paginatedRecords.map((r) => {
                      const isSelected = r.id === activeRecord.id;
                      return (
                        <tr
                          key={r.id}
                          onClick={() => setSelectedRecordId(r.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-primary/5 font-medium'
                              : 'hover:bg-surface-dim/50'
                          }`}
                        >
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <UserAvatar name={r.employeeName} size="xs" shape="circle" />
                              <div className="min-w-0">
                                <span className="font-semibold text-on-surface block truncate">
                                  {r.employeeName}
                                </span>
                                <span className="text-[10px] text-outline block truncate">
                                  {r.role}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="font-semibold text-primary tabular-nums">
                              {r.calibratedScore.toFixed(2)}
                            </span>
                          </td>
                          <td className="p-3 hidden sm:table-cell">
                            <span className="text-[11px] text-on-surface truncate block">
                              {r.box9}
                            </span>
                          </td>
                          <td className="p-3">
                            <Badge variant={r.status === 'Calibrado' ? 'success' : 'subtle'}>
                              {r.status}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination Controls */}
              <div className="p-3 border-t border-outline-variant/40 bg-surface-dim flex flex-wrap items-center justify-between gap-2 text-xs text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-outline">Por página:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-surface-bright border border-outline-variant/60 rounded px-2 py-0.5 text-xs text-on-surface outline-none cursor-pointer"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                  </select>
                  <span className="text-[11px] text-outline ml-1 tabular-nums">
                    {orderedRecords.length === 0
                      ? '0 registros'
                      : `${(currentPage - 1) * pageSize + 1} - ${Math.min(
                          currentPage * pageSize,
                          orderedRecords.length
                        )} de ${orderedRecords.length}`}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="h-7 px-2 text-[11px]"
                  >
                    Anterior
                  </Button>
                  <span className="text-[11px] text-outline px-1.5 tabular-nums">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="h-7 px-2 text-[11px]"
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Detailed Ficha Card (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-outline-variant/40">
                <div className="flex items-center gap-3 min-w-0">
                  <UserAvatar name={activeRecord.employeeName} size="md" shape="rounded" />
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-on-surface truncate">
                      {activeRecord.employeeName}
                    </h3>
                    <p className="text-[11px] text-outline truncate">{activeRecord.role}</p>
                    <p className="text-[11px] text-primary font-medium truncate">
                      {activeRecord.area}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-2xl font-bold text-primary tabular-nums">
                    {activeRecord.calibratedScore.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-outline">Escala 1 a 5</span>
                </div>
              </div>

              {/* 360 Breakdown */}
              <div className="grid grid-cols-3 gap-2 p-2.5 bg-surface-dim rounded-lg text-center text-xs border border-outline-variant/40">
                <div>
                  <span className="text-[10px] text-outline block">Auto</span>
                  <span className="font-semibold text-on-surface block mt-0.5 tabular-nums">
                    {activeRecord.selfScore.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-outline block">Líder</span>
                  <span className="font-semibold text-on-surface block mt-0.5 tabular-nums">
                    {activeRecord.managerScore.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-outline block">Pares</span>
                  <span className="font-semibold text-on-surface block mt-0.5 tabular-nums">
                    {activeRecord.peersScore.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs divide-y divide-outline-variant/30">
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-outline">Clasificación 9-Box:</span>
                  <span className="font-semibold text-primary">{activeRecord.box9}</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-outline">Potencial Futuro:</span>
                  <span className="font-semibold text-on-surface tabular-nums">
                    {activeRecord.potentialScore.toFixed(1)} / 5.0
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-outline">Desempeño Operativo:</span>
                  <span className="font-semibold text-on-surface tabular-nums">
                    {activeRecord.performanceScore.toFixed(1)} / 5.0
                  </span>
                </div>
              </div>

              <div className="p-3 bg-surface-dim rounded-lg border border-outline-variant/40 space-y-1 text-xs">
                <span className="font-medium text-outline block text-[11px]">
                  Conclusión del Comité & Brechas:
                </span>
                <p className="text-on-surface leading-relaxed text-[11px]">
                  {activeRecord.gapAnalysis}
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setCalibrationScore(activeRecord.calibratedScore);
                    setShowCalibrateModal(true);
                  }}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 mr-1" />
                  Calibrar en Comité
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (onSelectEmployee) {
                      onSelectEmployee(activeRecord.id);
                      return;
                    }
                    onNavigate('empleados');
                  }}
                >
                  <User className="w-3.5 h-3.5 mr-1" />
                  Ver en Colaboradores
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE 9-BOX MATRIX */}
      {activeTab === '9box' && (
        <Card className="p-5 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/40">
            <div>
              <h2 className="text-sm font-semibold text-on-surface">
                Matriz de Desempeño y Potencial (9 Cajas)
              </h2>
              <p className="text-xs text-outline">
                Eje vertical: Potencial Futuro • Eje horizontal: Desempeño Actual
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport9Box}
              disabled={isExporting}
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              <span>Exportar Excel</span>
            </Button>
          </div>

          {/* 3x3 Grid with Minimalist Professional Styling */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Row 1: Alto Potencial */}
            {/* Box 1.1: Bajo Perf / Alto Pot */}
            <div className="p-3 rounded-lg border border-outline-variant/60 bg-surface-dim/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-on-surface">Enigma / Diamante Bruto</span>
                <span className="text-[10px] text-outline font-mono">Bajo Perf • Alto Pot</span>
              </div>
              <div className="space-y-1.5 min-h-[50px]">
                {getEmployeesForBox('low', 'high').map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => { setSelectedRecordId(emp.id); setActiveTab('list'); }}
                    className="w-full text-left p-1.5 rounded bg-surface-bright border border-outline-variant/60 hover:border-primary/40 text-xs flex items-center justify-between"
                  >
                    <span className="truncate font-medium">{emp.employeeName}</span>
                    <span className="text-primary font-semibold tabular-nums">{emp.calibratedScore.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Box 1.2: Med Perf / Alto Pot */}
            <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-primary">Alto Potencial / Futuro Líder</span>
                <span className="text-[10px] text-outline font-mono">Med Perf • Alto Pot</span>
              </div>
              <div className="space-y-1.5 min-h-[50px]">
                {getEmployeesForBox('med', 'high').map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => { setSelectedRecordId(emp.id); setActiveTab('list'); }}
                    className="w-full text-left p-1.5 rounded bg-surface-bright border border-outline-variant/60 hover:border-primary/40 text-xs flex items-center justify-between"
                  >
                    <span className="truncate font-medium">{emp.employeeName}</span>
                    <span className="text-primary font-semibold tabular-nums">{emp.calibratedScore.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Box 1.3: Alto Perf / Alto Pot */}
            <div className="p-3 rounded-lg border border-emerald-300 bg-emerald-50/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-900 flex items-center gap-1">
                  <Star className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                  Talento Destacado (Estrella)
                </span>
                <span className="text-[10px] text-emerald-700 font-mono">Alto Perf • Alto Pot</span>
              </div>
              <div className="space-y-1.5 min-h-[50px]">
                {getEmployeesForBox('high', 'high').map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => { setSelectedRecordId(emp.id); setActiveTab('list'); }}
                    className="w-full text-left p-1.5 rounded bg-surface-bright border border-emerald-200 hover:border-emerald-400 text-xs flex items-center justify-between"
                  >
                    <span className="truncate font-medium text-emerald-950">{emp.employeeName}</span>
                    <span className="text-emerald-700 font-semibold tabular-nums">{emp.calibratedScore.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Row 2: Medio Potencial */}
            {/* Box 2.1: Bajo Perf / Med Pot */}
            <div className="p-3 rounded-lg border border-outline-variant/60 bg-surface-dim/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-on-surface">Dilema / Requiere Coaching</span>
                <span className="text-[10px] text-outline font-mono">Bajo Perf • Med Pot</span>
              </div>
              <div className="space-y-1.5 min-h-[50px]">
                {getEmployeesForBox('low', 'med').map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => { setSelectedRecordId(emp.id); setActiveTab('list'); }}
                    className="w-full text-left p-1.5 rounded bg-surface-bright border border-outline-variant/60 hover:border-primary/40 text-xs flex items-center justify-between"
                  >
                    <span className="truncate font-medium">{emp.employeeName}</span>
                    <span className="text-primary font-semibold tabular-nums">{emp.calibratedScore.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Box 2.2: Med Perf / Med Pot */}
            <div className="p-3 rounded-lg border border-outline-variant/60 bg-surface-dim/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-on-surface">Desempeño Sólido</span>
                <span className="text-[10px] text-outline font-mono">Med Perf • Med Pot</span>
              </div>
              <div className="space-y-1.5 min-h-[50px]">
                {getEmployeesForBox('med', 'med').map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => { setSelectedRecordId(emp.id); setActiveTab('list'); }}
                    className="w-full text-left p-1.5 rounded bg-surface-bright border border-outline-variant/60 hover:border-primary/40 text-xs flex items-center justify-between"
                  >
                    <span className="truncate font-medium">{emp.employeeName}</span>
                    <span className="text-primary font-semibold tabular-nums">{emp.calibratedScore.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Box 2.3: Alto Perf / Med Pot */}
            <div className="p-3 rounded-lg border border-secondary/20 bg-secondary/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-secondary">Especialista Clave</span>
                <span className="text-[10px] text-outline font-mono">Alto Perf • Med Pot</span>
              </div>
              <div className="space-y-1.5 min-h-[50px]">
                {getEmployeesForBox('high', 'med').map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => { setSelectedRecordId(emp.id); setActiveTab('list'); }}
                    className="w-full text-left p-1.5 rounded bg-surface-bright border border-outline-variant/60 hover:border-secondary/40 text-xs flex items-center justify-between"
                  >
                    <span className="truncate font-medium">{emp.employeeName}</span>
                    <span className="text-secondary font-semibold tabular-nums">{emp.calibratedScore.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Row 3: Bajo Potencial */}
            {/* Box 3.1: Bajo Perf / Bajo Pot */}
            <div className="p-3 rounded-lg border border-error/20 bg-error/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-error">Bajo Rendimiento / Plan de Acción</span>
                <span className="text-[10px] text-outline font-mono">Bajo Perf • Bajo Pot</span>
              </div>
              <div className="space-y-1.5 min-h-[50px]">
                {getEmployeesForBox('low', 'low').map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => { setSelectedRecordId(emp.id); setActiveTab('list'); }}
                    className="w-full text-left p-1.5 rounded bg-surface-bright border border-outline-variant/60 hover:border-error/40 text-xs flex items-center justify-between"
                  >
                    <span className="truncate font-medium">{emp.employeeName}</span>
                    <span className="text-error font-semibold tabular-nums">{emp.calibratedScore.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Box 3.2: Med Perf / Bajo Pot */}
            <div className="p-3 rounded-lg border border-outline-variant/60 bg-surface-dim/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-on-surface">Operativo Efectivo</span>
                <span className="text-[10px] text-outline font-mono">Med Perf • Bajo Pot</span>
              </div>
              <div className="space-y-1.5 min-h-[50px]">
                {getEmployeesForBox('med', 'low').map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => { setSelectedRecordId(emp.id); setActiveTab('list'); }}
                    className="w-full text-left p-1.5 rounded bg-surface-bright border border-outline-variant/60 hover:border-primary/40 text-xs flex items-center justify-between"
                  >
                    <span className="truncate font-medium">{emp.employeeName}</span>
                    <span className="text-primary font-semibold tabular-nums">{emp.calibratedScore.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Box 3.3: Alto Perf / Bajo Pot */}
            <div className="p-3 rounded-lg border border-outline-variant/60 bg-surface-dim/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-on-surface">Profesional Confiable</span>
                <span className="text-[10px] text-outline font-mono">Alto Perf • Bajo Pot</span>
              </div>
              <div className="space-y-1.5 min-h-[50px]">
                {getEmployeesForBox('high', 'low').map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => { setSelectedRecordId(emp.id); setActiveTab('list'); }}
                    className="w-full text-left p-1.5 rounded bg-surface-bright border border-outline-variant/60 hover:border-primary/40 text-xs flex items-center justify-between"
                  >
                    <span className="truncate font-medium">{emp.employeeName}</span>
                    <span className="text-primary font-semibold tabular-nums">{emp.calibratedScore.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 3: COMMITTEE RECORD */}
      {activeTab === 'committee' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <Card className="lg:col-span-7 p-5 space-y-4">
            <div className="pb-3 border-b border-outline-variant/40">
              <h3 className="text-sm font-semibold text-on-surface">
                Curva de Calibración del Comité
              </h3>
              <p className="text-xs text-outline">
                Distribución porcentual observada frente a la meta de calibración corporativa.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-on-surface">Talento Estrella (Alto Desempeño & Potencial)</span>
                  <span className="font-semibold text-primary tabular-nums">{pctEstrella}% ({countEstrella})</span>
                </div>
                <div className="w-full bg-surface-dim h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${pctEstrella}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-on-surface">Desempeño Sólido & Especialistas</span>
                  <span className="font-semibold text-secondary tabular-nums">{pctSolido}% ({countSolido})</span>
                </div>
                <div className="w-full bg-surface-dim h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: `${pctSolido}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-on-surface">En Desarrollo & Acompañamiento</span>
                  <span className="font-semibold text-amber-700 tabular-nums">{pctAcomp}% ({countAcomp})</span>
                </div>
                <div className="w-full bg-surface-dim h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pctAcomp}%` }} />
                </div>
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-5 p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-on-surface">Acta de Aprobación</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Al confirmar la aprobación, todos los colaboradores calibrados recibirán su notificación formal y se actualizará su estatus en el legajo de RRHH.
              </p>
            </div>

            <div className="pt-3 border-t border-outline-variant/40">
              <Button
                className="w-full"
                onClick={() => setShowConfirmApproval(true)}
              >
                <CheckCheck className="w-3.5 h-3.5 mr-1" />
                Aprobar y Emitir Dictamen
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal Calibración en Comité */}
      {showCalibrateModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-calib-title"
          className="fixed inset-0 bg-on-surface/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setShowCalibrateModal(false)}
        >
          <div
            ref={calibrateModalRef}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-bright rounded-xl max-w-md w-full p-5 shadow-xl flex flex-col gap-4 border border-outline-variant/70 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
              <div>
                <h3 id="modal-calib-title" className="text-sm font-semibold text-on-surface">
                  Calibración de Desempeño
                </h3>
                <p className="text-[11px] text-outline">{activeRecord.employeeName}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCalibrateModal(false)}
                className="p-1 rounded-md text-outline hover:text-on-surface hover:bg-surface-dim transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-xs font-medium text-on-surface block mb-1">
                  Puntaje Calibrado (1.00 a 5.00):
                </label>
                <Input
                  type="number"
                  step="0.05"
                  min="1"
                  max="5"
                  value={calibrationScore}
                  onChange={(e) => setCalibrationScore(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-on-surface block mb-1">
                  Notas y Dictamen del Comité:
                </label>
                <textarea
                  rows={3}
                  value={calibrationNotes}
                  onChange={(e) => setCalibrationNotes(e.target.value)}
                  className="w-full p-2.5 bg-surface-bright rounded-lg border border-outline-variant text-xs text-on-surface outline-none focus:border-primary resize-none font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant/40">
              <Button variant="ghost" size="sm" onClick={() => setShowCalibrateModal(false)}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSaveCalibration}>
                <Check className="w-3.5 h-3.5 mr-1" />
                Guardar Calibración
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal Approval */}
      {showConfirmApproval && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-on-surface/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setShowConfirmApproval(false)}
        >
          <div
            ref={approvalModalRef}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-bright rounded-xl max-w-sm w-full p-5 shadow-xl flex flex-col gap-3.5 border border-outline-variant/70 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-fixed text-primary flex items-center justify-center shrink-0">
                <CheckCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-on-surface">
                ¿Aprobar ciclo de calibración?
              </h3>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Esta acción confirmará formalmente las calificaciones de todos los colaboradores del ciclo activo.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/40">
              <Button variant="ghost" size="sm" onClick={() => setShowConfirmApproval(false)}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleApproveAll}>
                Confirmar Aprobación
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
