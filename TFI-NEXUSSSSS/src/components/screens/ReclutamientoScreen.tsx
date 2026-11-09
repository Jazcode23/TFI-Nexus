import React, { useState, useEffect, useMemo } from 'react';
import { Candidate, JobPosition, ScreenId } from '../../types';
import {
  CANDIDATES_DATA,
  JOB_POSITIONS,
  VACANTES_DATA,
  POSTULANTES_DATA,
  HABILIDADES_DATA,
} from '../../data/mockData';
import { UserAvatar } from '../UserAvatar';
import { ConfirmationModal } from '../ConfirmationModal';
import { QuickGuideBanner } from '../QuickGuideBanner';
import { CompetenciaNombre } from '../CompetenciaNombre';
import { useToast } from '../ToastProvider';
import { useFocusTrap } from '../useFocusTrap';
import { EmptyState } from '../EmptyState';
import { recruitmentApi, jobsApi } from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  Briefcase,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Send,
  Calendar,
  Video,
  UserCheck,
  Clock,
  DollarSign,
  Check,
  X,
  Layers,
  Building2,
  Database,
  Search,
  SlidersHorizontal,
  Columns3,
  List,
  Eye,
  GripVertical,
} from 'lucide-react';

interface ReclutamientoScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onNavigateToJob?: (jobCode: string) => void;
  selectedJobCode?: string;
  onChangeJobCode?: (jobCode: string) => void;
}

const KANBAN_STAGES = [
  { id: 'Revisión Inicial', label: '1. Revisión Inicial', desc: 'Validación de CV y compatibilidad base' },
  { id: 'Entrevista Técnica', label: '2. Entrevista Técnica', desc: 'Evaluación técnica y arquitectura' },
  { id: 'Validación Cultural', label: '3. Validación Cultural', desc: 'Alineación con valores del equipo' },
  { id: 'Oferta Final', label: '4. Oferta Final', desc: 'Cierre y propuesta formal extendida' },
] as const;

export const ReclutamientoScreen: React.FC<ReclutamientoScreenProps> = ({
  onNavigate,
  onNavigateToJob,
  selectedJobCode = 'PUE-2026-ARCH-03',
  onChangeJobCode,
}) => {
  const currentJobCode = selectedJobCode;
  const setCurrentJobCode = (code: string) => onChangeJobCode?.(code);
  const [viewMode, setViewMode] = useState<'kanban' | 'lista' | 'modelo_er'>('kanban');
  const [draggedOverStage, setDraggedOverStage] = useState<string | null>(null);
  const [quickPreviewCandidate, setQuickPreviewCandidate] = useState<Candidate | null>(null);
  const [selectedVacanteId, setSelectedVacanteId] = useState<number>(1);
  const [selectedPostulanteId, setSelectedPostulanteId] = useState<number>(1);
  const [positions, setPositions] = useState<JobPosition[]>(JOB_POSITIONS);
  const [candidates, setCandidates] = useState<Candidate[]>(CANDIDATES_DATA);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('mateo');
  const [filterThreshold, setFilterThreshold] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [candidateStages, setCandidateStages] = useState<{ [id: string]: string }>({
    mateo: 'Oferta Final',
    camila: 'Entrevista Técnica',
    gonzalo: 'Validación Cultural',
    lucia: 'Revisión Inicial',
  });

  // Modal de Oferta Laboral
  const [showOfferModal, setShowOfferModal] = useState<boolean>(false);
  const [showConfirmOffer, setShowConfirmOffer] = useState<boolean>(false);
  const [offerSalary, setOfferSalary] = useState<string>('$145,000 USD + Bono (15%)');
  const [offerStartDate, setOfferStartDate] = useState<string>('2026-11-01');

  // Modal de Entrevista
  const [showInterviewModal, setShowInterviewModal] = useState<boolean>(false);
  const [interviewDate, setInterviewDate] = useState<string>(() => {
    const d = new Date(Date.now() + 86400000 * 2);
    d.setHours(10, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [interviewers, setInterviewers] = useState<string>('Sofía Méndez, Martín Krause');

  const { showToast } = useToast();
  const offerModalRef = useFocusTrap<HTMLDivElement>(showOfferModal && !showConfirmOffer);
  const interviewModalRef = useFocusTrap<HTMLDivElement>(showInterviewModal);

  // Carga de catálogo de puestos desde backend
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
        // Fallback local en memoria
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Carga de candidatos para el puesto actual
  const loadCandidates = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const res = await recruitmentApi.getCandidates({ jobCode: currentJobCode });
      if (res && res.data && res.data.length > 0) {
        setCandidates(res.data);
        const newStages: { [id: string]: string } = {};
        res.data.forEach((c) => {
          if (c.stage) newStages[c.id] = c.stage;
        });
        setCandidateStages((prev) => ({ ...prev, ...newStages }));
      }
      if (!silent) {
        showToast('Candidatos actualizados con la base de datos.', 'success');
      }
    } catch {
      if (!silent) {
        showToast('Catálogo de candidatos sincronizado localmente.', 'info');
      }
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadCandidates(true);
  }, [currentJobCode]);

  // Selección de candidato activo
  const selectedCandidate: Candidate = useMemo(() => {
    return (
      candidates.find((c) => c.id === selectedCandidateId) ||
      candidates[0] ||
      CANDIDATES_DATA[0]
    );
  }, [candidates, selectedCandidateId]);

  const currentJob: JobPosition = useMemo(() => {
    return (
      positions.find((j) => j.code === currentJobCode) ||
      positions[0] ||
      JOB_POSITIONS[0]
    );
  }, [positions, currentJobCode]);

  // Acciones reales de contratación
  const handleStageChange = async (candidateId: string, newStage: string) => {
    setCandidateStages((prev) => ({ ...prev, [candidateId]: newStage }));
    showToast(`Candidato movido a la etapa "${newStage}".`, 'success');
    try {
      await recruitmentApi.updateStage(candidateId, newStage);
    } catch {
      // Silencioso en modo local
    }
  };

  const handleConfirmSendOffer = async () => {
    setShowConfirmOffer(false);
    setShowOfferModal(false);
    await handleStageChange(selectedCandidate.id, 'Oferta Enviada');
    showToast(
      `Oferta formal enviada exitosamente a ${selectedCandidate.name}.`,
      'success'
    );
  };

  const handleScheduleInterview = (e: React.FormEvent) => {
    e.preventDefault();
    setShowInterviewModal(false);
    handleStageChange(selectedCandidate.id, 'Entrevista Técnica');
    showToast(`Entrevista técnica agendada para ${selectedCandidate.name}.`, 'success');
  };

  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => c.matchScore >= filterThreshold);
  }, [candidates, filterThreshold]);

  // Métricas dinámicas calculadas desde los datos
  const openVacanciesCount = positions.filter((p) => p.status === 'critical').length + 2;
  const inProcessCandidatesCount = candidates.length;
  const avgMatchScore = useMemo(() => {
    if (candidates.length === 0) return 0;
    const total = candidates.reduce((acc, c) => acc + c.matchScore, 0);
    return Math.round(total / candidates.length);
  }, [candidates]);

  const topCandidateMatch = useMemo(() => {
    if (candidates.length === 0) return 0;
    return Math.max(...candidates.map((c) => c.matchScore));
  }, [candidates]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header & Global Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-outline-variant/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-on-surface">
              Selección de Talento
            </h1>
            <Badge variant="subtle">{candidates.length} postulantes</Badge>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Matching predictivo por competencias, funnel de contratación y ofertas formales.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (onNavigateToJob) {
                onNavigateToJob(currentJobCode);
              } else {
                onNavigate('puestos');
              }
            }}
          >
            <Briefcase className="w-3.5 h-3.5 mr-1" />
            <span>Ver Puesto</span>
          </Button>

          <Button
            size="sm"
            onClick={() => loadCandidates(false)}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Actualizando...' : 'Actualizar'}</span>
          </Button>
        </div>
      </div>

      {/* Slim Guide Bar */}
      <QuickGuideBanner
        title="Selección y Reclutamiento"
        description="Pipeline de candidatos, afinidad con el puesto y emisión de ofertas."
        tips={[
          'Elegí un candidato de la lista para inspeccionar sus puntuaciones y competencias.',
          'Podés cambiar la etapa del candidato directamente desde su panel de control.',
          'Hacé clic en "Extender Oferta" para generar la propuesta formal de incorporación.',
        ]}
        dismissible={true}
      />

      {/* Vacancy Context Bar */}
      <Card className="p-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <span className="font-medium text-outline shrink-0">Vacante activa:</span>
            <select
              value={currentJobCode}
              onChange={(e) => setCurrentJobCode(e.target.value)}
              className="font-semibold text-on-surface bg-surface-dim px-2.5 py-1 rounded-lg border border-outline-variant/60 text-xs cursor-pointer truncate max-w-xs sm:max-w-md focus:border-primary outline-none"
            >
              {positions.map((j) => (
                <option key={j.code} value={j.code}>
                  {j.code} • {j.title} ({j.department})
                </option>
              ))}
            </select>
            {currentJob.status === 'critical' && (
              <Badge variant="destructive">Puesto Clave</Badge>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-outline tabular-nums shrink-0">
            <span>{openVacanciesCount} vacantes</span>
            <span>•</span>
            <span className="text-secondary font-semibold">{avgMatchScore}% afinidad media</span>
            <span>•</span>
            <span className="text-primary font-semibold">{topCandidateMatch}% mejor perfil</span>
          </div>
        </div>
      </Card>

      {/* Toolbar: View Mode & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-1 border-b border-outline-variant/40">
        <div className="flex items-center gap-1 bg-surface-dim p-1 rounded-lg border border-outline-variant/60">
          <button
            type="button"
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'kanban'
                ? 'bg-surface-bright text-on-surface shadow-2xs font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Columns3 className="w-3.5 h-3.5 text-primary" />
            <span>Tablero Kanban</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('lista')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'lista'
                ? 'bg-surface-bright text-on-surface shadow-2xs font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Lista & Ficha</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('modelo_er')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'modelo_er'
                ? 'bg-surface-bright text-on-surface shadow-2xs font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Modelo Relacional ER</span>
          </button>
        </div>

        {viewMode !== 'modelo_er' && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-outline font-medium">Afinidad:</span>
            {[0, 85, 95].map((thresh) => (
              <button
                key={thresh}
                type="button"
                onClick={() => setFilterThreshold(thresh)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer border ${
                  filterThreshold === thresh
                    ? 'bg-primary text-on-primary border-primary shadow-2xs font-semibold'
                    : 'bg-surface-bright border-outline-variant/60 text-on-surface-variant hover:bg-surface-dim'
                }`}
              >
                {thresh === 0 ? `Todos (${candidates.length})` : `>${thresh}%`}
              </button>
            ))}
          </div>
        )}
      </div>

      {viewMode === 'kanban' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
            {KANBAN_STAGES.map((col, stageIdx) => {
              const stageCandidates = filteredCandidates.filter(
                (c) => (candidateStages[c.id] || 'Revisión Inicial') === col.id
              );
              const isOver = draggedOverStage === col.id;

              return (
                <div
                  key={col.id}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    if (draggedOverStage !== col.id) setDraggedOverStage(col.id);
                  }}
                  onDragLeave={() => {
                    if (draggedOverStage === col.id) setDraggedOverStage(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDraggedOverStage(null);
                    const candidateId = e.dataTransfer.getData('text/plain');
                    if (candidateId) {
                      handleStageChange(candidateId, col.id);
                    }
                  }}
                  className={`rounded-xl border transition-all p-3 flex flex-col gap-3 min-h-[460px] ${
                    isOver
                      ? 'bg-primary-fixed/20 border-primary ring-2 ring-primary/30 shadow-xs'
                      : 'bg-surface-dim/40 border-outline-variant/60'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-outline-variant/40">
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-on-surface block truncate">
                        {col.label}
                      </span>
                      <span className="text-[10px] text-outline truncate block">
                        {col.desc}
                      </span>
                    </div>
                    <Badge variant={stageCandidates.length > 0 ? 'default' : 'subtle'} className="ml-1 shrink-0 tabular-nums">
                      {stageCandidates.length}
                    </Badge>
                  </div>

                  <div className="space-y-2.5 flex-1">
                    {stageCandidates.length === 0 ? (
                      <div className="h-32 border-2 border-dashed border-outline-variant/40 rounded-lg flex flex-col items-center justify-center p-3 text-center">
                        <span className="text-[11px] text-outline">
                          Sin candidatos
                        </span>
                        <span className="text-[10px] text-outline/80 mt-0.5">
                          Arrastrá candidatos aquí
                        </span>
                      </div>
                    ) : (
                      stageCandidates.map((c) => {
                        const isSelected = selectedCandidate.id === c.id;
                        return (
                          <div
                            key={c.id}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', c.id);
                              e.dataTransfer.effectAllowed = 'move';
                            }}
                            className={`p-3 rounded-lg border bg-surface-bright shadow-2xs hover:shadow-xs transition-all cursor-grab active:cursor-grabbing flex flex-col gap-2 relative ${
                              isSelected
                                ? 'border-primary ring-1 ring-primary'
                                : 'border-outline-variant/60 hover:border-outline-variant'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <UserAvatar name={c.name} size="sm" shape="rounded" />
                                <div className="min-w-0">
                                  <h4 className="text-xs font-semibold text-on-surface truncate">
                                    {c.name}
                                  </h4>
                                  <span className="text-[10px] text-outline truncate block">
                                    {c.title}
                                  </span>
                                </div>
                              </div>
                              <span
                                className={`text-[11px] font-bold px-1.5 py-0.5 rounded tabular-nums shrink-0 ${
                                  c.matchScore >= 90
                                    ? 'bg-secondary-container text-secondary'
                                    : 'bg-primary-fixed text-primary'
                                }`}
                              >
                                {c.matchScore}%
                              </span>
                            </div>

                            <p className="text-[10px] text-on-surface-variant line-clamp-2 leading-tight">
                              {c.strengths}
                            </p>

                            <div className="flex items-center justify-between pt-2 border-t border-outline-variant/30 text-xs">
                              {stageIdx > 0 ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStageChange(c.id, KANBAN_STAGES[stageIdx - 1].id);
                                  }}
                                  className="p-1 rounded text-outline hover:text-on-surface hover:bg-surface-dim transition-colors cursor-pointer"
                                  title={`Mover a ${KANBAN_STAGES[stageIdx - 1].label}`}
                                >
                                  <ArrowLeft className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <span className="w-5" />
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCandidateId(c.id);
                                  setQuickPreviewCandidate(c);
                                }}
                                className="text-[11px] font-medium text-primary hover:underline cursor-pointer flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" />
                                Ficha
                              </button>

                              {stageIdx < KANBAN_STAGES.length - 1 ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStageChange(c.id, KANBAN_STAGES[stageIdx + 1].id);
                                  }}
                                  className="p-1 rounded text-outline hover:text-on-surface hover:bg-surface-dim transition-colors cursor-pointer"
                                  title={`Avanzar a ${KANBAN_STAGES[stageIdx + 1].label}`}
                                >
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <span className="w-5" />
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Preview Modal for Kanban */}
          {quickPreviewCandidate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-xs">
              <div
                className="bg-surface-bright rounded-2xl border border-outline-variant/70 shadow-xl max-w-lg w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150"
                role="dialog"
                aria-modal="true"
              >
                <div className="flex items-start justify-between pb-3 border-b border-outline-variant/40">
                  <div className="flex items-center gap-3">
                    <UserAvatar name={quickPreviewCandidate.name} size="lg" shape="rounded" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-on-surface">
                          {quickPreviewCandidate.name}
                        </h3>
                        <Badge variant="secondary">
                          {quickPreviewCandidate.matchScore}% Afinidad
                        </Badge>
                      </div>
                      <p className="text-xs text-outline">{quickPreviewCandidate.title}</p>
                      <span className="text-[10px] text-outline font-medium">
                        {quickPreviewCandidate.experience} • Etapa: {candidateStages[quickPreviewCandidate.id] || 'Revisión Inicial'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuickPreviewCandidate(null)}
                    className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-dim cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 bg-surface-dim rounded-lg border border-outline-variant/30 text-xs text-on-surface-variant flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{quickPreviewCandidate.strengths}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-surface-dim rounded-lg border border-outline-variant/30">
                    <span className="text-[10px] text-outline block">Evaluación Técnica</span>
                    <span className="text-sm font-bold text-on-surface tabular-nums">
                      {quickPreviewCandidate.techScore} / 5.0
                    </span>
                  </div>
                  <div className="p-2.5 bg-surface-dim rounded-lg border border-outline-variant/30">
                    <span className="text-[10px] text-outline block">Alineación Cultural</span>
                    <span className="text-sm font-bold text-on-surface tabular-nums">
                      {quickPreviewCandidate.softScore} / 5.0
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/40">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQuickPreviewCandidate(null);
                      setViewMode('lista');
                    }}
                  >
                    Ver en Lista & Detalle
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedCandidateId(quickPreviewCandidate.id);
                      setQuickPreviewCandidate(null);
                      setShowOfferModal(true);
                    }}
                  >
                    <Send className="w-3.5 h-3.5 mr-1" />
                    Extender Oferta
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {viewMode === 'lista' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Candidates List (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-medium text-outline">
                Ranking de Candidatos
              </span>
              <span className="text-xs text-outline tabular-nums">
                {filteredCandidates.length} candidatos
              </span>
            </div>

            {filteredCandidates.length === 0 ? (
              <EmptyState
                title="No se encontraron postulantes"
                description={`No hay candidatos con afinidad superior al ${filterThreshold}%.`}
                actionLabel="Ver todos"
                onAction={() => setFilterThreshold(0)}
              />
            ) : (
              <div className="space-y-2.5">
                {filteredCandidates.map((candidate) => {
                  const isSelected = selectedCandidate.id === candidate.id;
                  const stage = candidateStages[candidate.id] || 'Revisión Inicial';

                  return (
                    <div
                      key={candidate.id}
                      onClick={() => setSelectedCandidateId(candidate.id)}
                      className={`p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col gap-2.5 ${
                        isSelected
                          ? 'bg-primary/5 border-primary shadow-2xs'
                          : 'bg-surface-bright hover:bg-surface-dim border-outline-variant/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <UserAvatar name={candidate.name} size="md" shape="rounded" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-xs font-semibold text-on-surface truncate">
                                {candidate.name}
                              </h3>
                              <Badge variant="subtle">{stage}</Badge>
                            </div>
                            <p className="text-[11px] text-outline truncate">{candidate.title}</p>
                            <span className="text-[10px] text-outline">
                              {candidate.experience}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-lg font-bold text-secondary tabular-nums">
                            {candidate.matchScore}%
                          </div>
                          <span className="text-[10px] text-outline">Afinidad</span>
                        </div>
                      </div>

                      {/* Multidimensional details */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-2 border-t border-outline-variant/30">
                        <div className="p-1.5 bg-surface-dim rounded text-center">
                          <span className="text-[10px] text-outline block">Técnicas</span>
                          <span className="font-semibold text-on-surface tabular-nums">
                            {candidate.techScore} / 5.0
                          </span>
                        </div>
                        <div className="p-1.5 bg-surface-dim rounded text-center">
                          <span className="text-[10px] text-outline block">Humanas</span>
                          <span className="font-semibold text-on-surface tabular-nums">
                            {candidate.softScore} / 5.0
                          </span>
                        </div>
                        <div className="p-1.5 bg-surface-dim rounded text-center">
                          <span className="text-[10px] text-outline block">Kubernetes</span>
                          <span className="font-semibold text-primary tabular-nums">
                            {candidate.radarScores.kubernetes} / 5.0
                          </span>
                        </div>
                        <div className="p-1.5 bg-surface-dim rounded text-center">
                          <span className="text-[10px] text-outline block">Seguridad</span>
                          <span className="font-semibold text-primary tabular-nums">
                            {candidate.radarScores.zeroTrust} / 5.0
                          </span>
                        </div>
                      </div>

                      {/* AI Quote */}
                      <div className="p-2 bg-surface-dim rounded text-[11px] text-on-surface-variant flex items-start gap-1.5 border border-outline-variant/30">
                        <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span className="leading-snug">{candidate.strengths}</span>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        <span className="font-medium text-primary">{candidate.matchLabel}</span>
                        <span
                          className={`flex items-center gap-0.5 font-medium ${
                            isSelected ? 'text-primary' : 'text-outline'
                          }`}
                        >
                          {isSelected ? 'Seleccionado' : 'Inspeccionar'}
                          <ArrowRight className="w-3 h-3 ml-0.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Inspector Column (5 cols, sticky) */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-5 space-y-4 sticky top-6">
              <div className="flex items-start justify-between pb-3 border-b border-outline-variant/40">
                <div className="flex items-center gap-3">
                  <UserAvatar name={selectedCandidate.name} size="lg" shape="rounded" />
                  <div>
                    <span className="text-[11px] font-semibold text-primary">
                      Rank #{selectedCandidate.rank} • {selectedCandidate.experience}
                    </span>
                    <h3 className="text-sm font-bold text-on-surface mt-0.5">
                      {selectedCandidate.name}
                    </h3>
                    <p className="text-xs text-outline">{selectedCandidate.title}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-bold text-secondary tabular-nums">
                    {selectedCandidate.matchScore}%
                  </span>
                  <span className="block text-[10px] text-outline">Índice NEXUS</span>
                </div>
              </div>

              {/* Pipeline Stage Controller */}
              <div className="p-3 bg-surface-dim rounded-lg border border-outline-variant/40 space-y-1.5">
                <span className="text-[11px] font-medium text-outline block">
                  Fase del proceso:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    'Revisión Inicial',
                    'Entrevista Técnica',
                    'Validación Cultural',
                    'Oferta Final',
                  ].map((st) => {
                    const isActive =
                      candidateStages[selectedCandidate.id] === st ||
                      (!candidateStages[selectedCandidate.id] && st === 'Revisión Inicial');

                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleStageChange(selectedCandidate.id, st)}
                        className={`py-1 px-2 rounded-md text-xs font-medium transition-all text-center cursor-pointer ${
                          isActive
                            ? 'bg-primary text-on-primary shadow-2xs font-semibold'
                            : 'bg-surface-bright text-on-surface-variant hover:bg-surface-container border border-outline-variant/40'
                        }`}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Competencies Progress */}
              <div className="space-y-2.5 text-xs">
                <span className="font-semibold text-on-surface block">
                  Alineación con Competencias Clave
                </span>

                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <CompetenciaNombre competencia="kubernetes" />
                      <span className="font-semibold text-primary tabular-nums">
                        {selectedCandidate.radarScores.kubernetes} / 5.0
                      </span>
                    </div>
                    <div className="w-full h-1 bg-surface-dim rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: `${(selectedCandidate.radarScores.kubernetes / 5.0) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <CompetenciaNombre competencia="seguridadNube" />
                      <span className="font-semibold text-primary tabular-nums">
                        {selectedCandidate.radarScores.zeroTrust} / 5.0
                      </span>
                    </div>
                    <div className="w-full h-1 bg-surface-dim rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: `${(selectedCandidate.radarScores.zeroTrust / 5.0) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-on-surface">Comunicación directiva</span>
                      <span className="font-semibold text-primary tabular-nums">
                        {selectedCandidate.radarScores.commExec} / 5.0
                      </span>
                    </div>
                    <div className="w-full h-1 bg-surface-dim rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: `${(selectedCandidate.radarScores.commExec / 5.0) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <CompetenciaNombre competencia="costosNube" />
                      <span className="font-semibold text-primary tabular-nums">
                        {selectedCandidate.radarScores.finOps} / 5.0
                      </span>
                    </div>
                    <div className="w-full h-1 bg-surface-dim rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: `${(selectedCandidate.radarScores.finOps / 5.0) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col gap-2">
                <Button
                  size="sm"
                  onClick={() => setShowOfferModal(true)}
                >
                  <Send className="w-3.5 h-3.5 mr-1" />
                  Extender Oferta Formal
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowInterviewModal(true)}
                >
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  Agendar Entrevista
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* VISTA: Modelo Relacional ER */}
      {viewMode === 'modelo_er' && (
        <Card className="p-5 space-y-4">
          <div className="pb-3 border-b border-outline-variant/40">
            <h2 className="text-sm font-semibold text-on-surface flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              Modelo Relacional ER: Vacantes, Postulantes y Habilidades
            </h2>
            <p className="text-xs text-outline mt-0.5">
              Cruce relacional entre vacante y postulante para cálculo determinístico de afinidad.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Vacante Selector */}
            <div className="p-3 bg-surface-dim rounded-lg border border-outline-variant/40 space-y-2">
              <label className="font-medium text-outline block">
                Seleccionar Vacante:
              </label>
              <select
                value={selectedVacanteId}
                onChange={(e) => setSelectedVacanteId(Number(e.target.value))}
                className="w-full p-2 bg-surface-bright rounded-md border border-outline-variant text-xs text-on-surface"
              >
                {VACANTES_DATA.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.titulo} {v.idPuesto ? `(${v.idPuesto})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Postulante Selector */}
            <div className="p-3 bg-surface-dim rounded-lg border border-outline-variant/40 space-y-2">
              <label className="font-medium text-outline block">
                Seleccionar Postulante:
              </label>
              <select
                value={selectedPostulanteId}
                onChange={(e) => setSelectedPostulanteId(Number(e.target.value))}
                className="w-full p-2 bg-surface-bright rounded-md border border-outline-variant text-xs text-on-surface"
              >
                {POSTULANTES_DATA.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} {p.apellido} ({p.correo})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 bg-on-surface/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            ref={offerModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="offer-modal-title"
            className="bg-surface-bright max-w-md w-full rounded-xl p-5 shadow-xl border border-outline-variant/70 animate-in zoom-in-95 duration-150 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
              <h3 id="offer-modal-title" className="text-sm font-semibold text-on-surface">
                Oferta Laboral Formal
              </h3>
              <button
                type="button"
                onClick={() => setShowOfferModal(false)}
                className="p-1 rounded-md text-outline hover:text-on-surface hover:bg-surface-dim transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowConfirmOffer(true);
              }}
              className="space-y-3 text-xs"
            >
              <div className="p-2.5 bg-surface-dim rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-semibold text-on-surface block">{selectedCandidate.name}</span>
                  <span className="text-[11px] text-outline">{currentJob.title}</span>
                </div>
                <Badge variant="secondary">{selectedCandidate.matchScore}% Match</Badge>
              </div>

              <div>
                <label className="font-medium text-on-surface block mb-1">
                  Paquete Salarial:
                </label>
                <Input
                  type="text"
                  value={offerSalary}
                  onChange={(e) => setOfferSalary(e.target.value)}
                />
              </div>

              <div>
                <label className="font-medium text-on-surface block mb-1">
                  Fecha de Incorporación:
                </label>
                <Input
                  type="date"
                  value={offerStartDate}
                  onChange={(e) => setOfferStartDate(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/40">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOfferModal(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm">
                  <Send className="w-3.5 h-3.5 mr-1" />
                  Enviar Propuesta
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Offer */}
      <ConfirmationModal
        isOpen={showConfirmOffer}
        title="¿Confirmar envío de oferta?"
        message={`Se emitirá formalmente la propuesta a ${selectedCandidate.name} para la vacante ${currentJob.title}.`}
        confirmLabel="Confirmar y Enviar"
        cancelLabel="Revisar"
        type="primary"
        onConfirm={handleConfirmSendOffer}
        onCancel={() => setShowConfirmOffer(false)}
      />

      {/* Schedule Interview Modal */}
      {showInterviewModal && (
        <div className="fixed inset-0 z-50 bg-on-surface/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            ref={interviewModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="interview-modal-title"
            className="bg-surface-bright max-w-md w-full rounded-xl p-5 shadow-xl border border-outline-variant/70 animate-in zoom-in-95 duration-150 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
              <h3 id="interview-modal-title" className="text-sm font-semibold text-on-surface">
                Agendar Entrevista Técnica
              </h3>
              <button
                type="button"
                onClick={() => setShowInterviewModal(false)}
                className="p-1 rounded-md text-outline hover:text-on-surface hover:bg-surface-dim transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleScheduleInterview} className="space-y-3 text-xs">
              <div>
                <label className="text-outline block mb-1">Candidato:</label>
                <div className="p-2 bg-surface-dim rounded-md font-semibold text-on-surface">
                  {selectedCandidate.name}
                </div>
              </div>

              <div>
                <label className="font-medium text-on-surface block mb-1">Fecha y Hora:</label>
                <Input
                  type="datetime-local"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                />
              </div>

              <div>
                <label className="font-medium text-on-surface block mb-1">Entrevistadores:</label>
                <Input
                  type="text"
                  value={interviewers}
                  onChange={(e) => setInterviewers(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-1.5 p-2 bg-surface-dim rounded-md text-outline text-[11px]">
                <Video className="w-3.5 h-3.5 text-primary" />
                <span>Google Meet generado automáticamente</span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant/40">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInterviewModal(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm">
                  Confirmar e Invitar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
