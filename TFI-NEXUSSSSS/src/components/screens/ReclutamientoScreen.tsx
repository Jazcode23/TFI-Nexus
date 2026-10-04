import React, { useState, useEffect } from 'react';
import { Candidate, ScreenId } from '../../types';
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
import { HelpTooltip } from '../HelpTooltip';
import { recruitmentApi } from '../../services/api';

interface ReclutamientoScreenProps {
  onNavigate: (screen: ScreenId) => void;
  selectedJobCode?: string;
  /** Se llama cuando el usuario elige otro puesto en el selector (la URL es la fuente de verdad). */
  onChangeJobCode?: (jobCode: string) => void;
}

export const ReclutamientoScreen: React.FC<ReclutamientoScreenProps> = ({
  onNavigate,
  selectedJobCode = 'PUE-2026-ARCH-03',
  onChangeJobCode,
}) => {
  const currentJobCode = selectedJobCode;
  const setCurrentJobCode = (code: string) => onChangeJobCode?.(code);
  const [viewMode, setViewMode] = useState<'operativo' | 'modelo_er'>('operativo');
  const [selectedVacanteId, setSelectedVacanteId] = useState<number>(1);
  const [selectedPostulanteId, setSelectedPostulanteId] = useState<number>(1);
  const [candidates, setCandidates] = useState<Candidate[]>(CANDIDATES_DATA);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('mateo');
  const [filterThreshold, setFilterThreshold] = useState<number>(0);
  const [candidateStages, setCandidateStages] = useState<{ [id: string]: string }>({
    mateo: 'Oferta Final',
    camila: 'Entrevista Técnica',
    gonzalo: 'Validación Cultural',
    lucia: 'Revisión Inicial',
  });
  const [showOfferModal, setShowOfferModal] = useState<boolean>(false);
  const [showConfirmOffer, setShowConfirmOffer] = useState<boolean>(false);
  const [showInterviewModal, setShowInterviewModal] = useState<boolean>(false);
  const [interviewDate, setInterviewDate] = useState<string>('2026-10-04T10:00');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    recruitmentApi
      .getCandidates({ jobCode: currentJobCode })
      .then((res) => {
        if (isMounted && res && res.data && res.data.length > 0) {
          setCandidates(res.data);
          const newStages: { [id: string]: string } = {};
          res.data.forEach((c) => {
            if (c.stage) newStages[c.id] = c.stage;
          });
          setCandidateStages((prev) => ({ ...prev, ...newStages }));
        }
      })
      .catch((err) => {
        console.warn('Candidatos fallback local:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [currentJobCode]);

  const selectedCandidate: Candidate =
    candidates.find((c) => c.id === selectedCandidateId) || candidates[0];

  const currentJob =
    JOB_POSITIONS.find((j) => j.code === currentJobCode) || JOB_POSITIONS[0];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleStageChange = async (candidateId: string, newStage: string) => {
    setCandidateStages((prev) => ({ ...prev, [candidateId]: newStage }));
    triggerToast(`Candidato movido a la etapa "${newStage}".`);
    try {
      await recruitmentApi.updateStage(candidateId, newStage);
    } catch {
      // silencioso en modo offline/local
    }
  };

  const handleConfirmSendOffer = async () => {
    setShowConfirmOffer(false);
    setShowOfferModal(false);
    await handleStageChange(selectedCandidate.id, 'Oferta Enviada');
    triggerToast(
      `¡Listo! Oferta formal de empleo enviada exitosamente a ${selectedCandidate.name}.`
    );
    try {
      await recruitmentApi.sendOffer(selectedCandidate.id);
    } catch {
      // silencioso en modo offline/local
    }
  };

  const handleScheduleInterview = (e: React.FormEvent) => {
    e.preventDefault();
    setShowInterviewModal(false);
    handleStageChange(selectedCandidate.id, 'Entrevista Agendada');
    triggerToast(
      `Entrevista agendada con ${selectedCandidate.name} para el ${interviewDate.replace('T', ' a las ')}.`
    );
  };

  const filteredCandidates = candidates.filter(
    (c) => c.matchScore >= filterThreshold
  );

  return (
    <div className="w-full px-6 lg:px-8 py-6 flex flex-col gap-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-outline-variant/30 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="material-symbols-outlined text-secondary-container">check_circle</span>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header & Friendly Guide */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs tracking-wider text-primary uppercase font-extrabold">
                Gestión de Personas &bull; Selección de Talento
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs text-on-surface-variant font-medium">
                Evaluación y seguimiento de postulantes
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-on-surface tracking-tight font-headline flex items-center gap-3">
              Candidatos y Selección de Personal
            </h1>
            <p className="text-xs sm:text-sm text-outline mt-0.5 max-w-3xl">
              Evaluá postulantes comparando sus habilidades con las exigencias del puesto para tomar decisiones de contratación con claridad.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch xl:self-auto">
            <button
              onClick={() => onNavigate('puestos')}
              className="flex-1 xl:flex-none px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-surface-container text-on-surface hover:bg-surface-container-high border border-outline-variant/40 transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-primary text-lg">work</span>
              Ver Puesto de Trabajo
            </button>
            <button
              onClick={() => triggerToast('Candidatos actualizados con las fuentes de postulación.')}
              className="flex-1 xl:flex-none px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-primary text-on-primary hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">refresh</span>
              Actualizar Candidatos
            </button>
          </div>
        </div>

        {/* Quick Guide Banner */}
        <QuickGuideBanner
          title="¿Cómo gestionar los candidatos?"
          description="Seguí el progreso de cada postulante a través de las etapas del proceso de contratación."
          tips={[
            'Hacé clic en cualquier candidato de la lista para revisar su experiencia y compatibilidad.',
            'Cambiá la etapa del proceso (ej: Entrevista Técnica, Oferta Final) con los botones de la ficha.',
            'Hacé clic en "Extender Oferta Formal" para preparar y enviar la propuesta laboral.',
          ]}
        />
      </div>

      {/* Vacancy Selector & Status Banner */}
      <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/40 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-2xl">architecture</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-outline uppercase">Vacante Seleccionada:</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 uppercase">
                Misión Crítica
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <select
                value={currentJobCode}
                onChange={(e) => setCurrentJobCode(e.target.value)}
                className="text-lg lg:text-xl font-black text-on-surface bg-transparent border-b-2 border-primary/40 focus:border-primary outline-hidden cursor-pointer pb-0.5"
              >
                {JOB_POSITIONS.map((j) => (
                  <option key={j.code} value={j.code}>
                    {j.code} &bull; {j.title} ({j.department})
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-outline mt-1">
              {currentJob.division} &bull; Reporta a {currentJob.reportsTo} &bull; {currentJob.salaryBand}
            </p>
          </div>
        </div>

        {/* Quick Vacancy Metrics */}
        <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-1">
          <div className="p-3 bg-surface-container rounded-2xl text-center min-w-[100px]">
            <span className="text-[10px] text-outline uppercase font-semibold">Vacantes</span>
            <div className="text-lg font-black text-on-surface">2 Abiertas</div>
          </div>
          <div className="p-3 bg-surface-container rounded-2xl text-center min-w-[100px]">
            <span className="text-[10px] text-outline uppercase font-semibold">En proceso</span>
            <div className="text-lg font-black text-primary">14 Candidatos</div>
          </div>
          <div className="p-3 bg-surface-container rounded-2xl text-center min-w-[100px]">
            <span className="text-[10px] text-outline uppercase font-semibold">Compatibilidad Promedio</span>
            <div className="text-lg font-black text-emerald-600">84.6%</div>
          </div>
          <div className="p-3 bg-surface-container rounded-2xl text-center min-w-[100px]">
            <span className="text-[10px] text-outline uppercase font-semibold">Plazo de Cierre</span>
            <div className="text-lg font-black text-amber-600">12 Días</div>
          </div>
        </div>
      </div>

      {/* Selector de Modo: Tablero Operativo vs Modelo ER Relacional */}
      <div className="flex border-b border-outline-variant/30 gap-2">
        <button
          onClick={() => setViewMode('operativo')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            viewMode === 'operativo'
              ? 'border-primary text-primary'
              : 'border-transparent text-outline hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-lg">view_kanban</span>
          Tablero de Selección & Candidatos
        </button>
        <button
          onClick={() => setViewMode('modelo_er')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            viewMode === 'modelo_er'
              ? 'border-primary text-primary'
              : 'border-transparent text-outline hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-lg">schema</span>
          Modelo Relacional ER: Vacantes, Habilidades & Matching
        </button>
      </div>

      {viewMode === 'operativo' ? (
        <>
          {/* Filter and View Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-outline uppercase">Filtrar por compatibilidad:</span>
          <button
            onClick={() => setFilterThreshold(0)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterThreshold === 0
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            Todos ({candidates.length})
          </button>
          <button
            onClick={() => setFilterThreshold(85)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterThreshold === 85
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            Compatibilidad alta (&gt;85%)
          </button>
          <button
            onClick={() => setFilterThreshold(95)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterThreshold === 95
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            Máxima compatibilidad (&gt;95%)
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-outline">
          <span className="material-symbols-outlined text-sm text-primary">auto_awesome</span>
          <span>Análisis realizado con Inteligencia Artificial (modelo GPT/Gen-4)</span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Predictive Suitability Ranking (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">military_tech</span>
              Ranking de Compatibilidad con el Puesto (IA)
            </h2>
            <span className="text-xs text-outline">
              Ordenado por índice de compatibilidad total
            </span>
          </div>

          <div className="space-y-4">
            {filteredCandidates.map((candidate) => {
              const isSelected = selectedCandidateId === candidate.id;
              const stage = candidateStages[candidate.id] || 'Revisión Inicial';

              let scoreColor = 'text-primary';
              let badgeBg = 'bg-primary/10 text-primary border-primary/20';

              if (candidate.matchScore >= 90) {
                scoreColor = 'text-emerald-600';
                badgeBg = 'bg-emerald-50 text-emerald-800 border-emerald-300';
              } else if (candidate.matchScore < 70) {
                scoreColor = 'text-rose-600';
                badgeBg = 'bg-rose-50 text-rose-800 border-rose-300';
              } else if (candidate.matchScore < 80) {
                scoreColor = 'text-amber-600';
                badgeBg = 'bg-amber-50 text-amber-800 border-amber-300';
              }

              return (
                <div
                  key={candidate.id}
                  onClick={() => setSelectedCandidateId(candidate.id)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col gap-3 relative ${
                    isSelected
                      ? 'bg-surface-container-lowest border-primary ring-2 ring-primary/25 shadow-lg transform -translate-y-0.5'
                      : 'bg-surface-container-lowest hover:bg-surface-container-low border-outline-variant/30 hover:border-outline-variant'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="relative">
                        <UserAvatar
                          name={candidate.name}
                          size="lg"
                          shape="rounded"
                        />
                        <span className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                          #{candidate.rank}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-extrabold text-on-surface">
                            {candidate.name}
                          </h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeBg}`}>
                            {stage}
                          </span>
                        </div>
                        <p className="text-xs text-outline">{candidate.title}</p>
                        <span className="text-[11px] text-on-surface-variant font-medium">
                          {candidate.experience}
                        </span>
                      </div>
                    </div>

                    {/* Match Score Display */}
                    <div className="text-right flex flex-col items-end">
                      <div className={`text-2xl font-black ${scoreColor}`}>
                        {candidate.matchScore}%
                      </div>
                      <span className="text-[10px] font-bold text-outline uppercase tracking-wider">
                        Compatibilidad IA
                      </span>
                    </div>
                  </div>

                  {/* Multidimensional Score Pills */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs pt-2 border-t border-outline-variant/20">
                    <div className="p-2 bg-surface-container rounded-xl flex items-center justify-between">
                      <span className="text-outline text-[11px]">Técnicas</span>
                      <strong className="text-on-surface">{candidate.techScore} / 5.0</strong>
                    </div>
                    <div className="p-2 bg-surface-container rounded-xl flex items-center justify-between">
                      <span className="text-outline text-[11px]">Humanas</span>
                      <strong className="text-on-surface">{candidate.softScore} / 5.0</strong>
                    </div>
                    <div className="p-2 bg-surface-container rounded-xl flex items-center justify-between">
                      <span className="text-outline text-[11px]" title="Gestión de servidores y clústeres (Kubernetes)">Servidores</span>
                      <strong className="text-primary">{candidate.radarScores.kubernetes}</strong>
                    </div>
                    <div className="p-2 bg-surface-container rounded-xl flex items-center justify-between">
                      <span className="text-outline text-[11px]" title="Seguridad y acceso en la nube (Zero Trust)">Seguridad nube</span>
                      <strong className="text-primary">{candidate.radarScores.zeroTrust}</strong>
                    </div>
                  </div>

                  {/* AI Synthetic Analysis Quote */}
                  <div className="p-3 bg-surface-container-low rounded-2xl text-xs text-on-surface-variant flex items-start gap-2 border border-outline-variant/20">
                    <span className="material-symbols-outlined text-primary text-base shrink-0 mt-0.5">
                      psychology
                    </span>
                    <span className="leading-relaxed">{candidate.strengths}</span>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-bold text-primary flex items-center gap-1">
                      {candidate.matchLabel}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCandidateId(candidate.id);
                          setShowInterviewModal(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-surface-container-highest hover:bg-surface-container-high text-on-surface text-xs font-bold border border-outline-variant/40 transition-all cursor-pointer"
                      >
                        Agendar
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCandidateId(candidate.id);
                          setShowOfferModal(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container transition-all shadow-xs cursor-pointer"
                      >
                        Ofertar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Candidate Inspector & Skill DNA Radar (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/40 shadow-xs sticky top-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <UserAvatar
                  name={selectedCandidate.name}
                  size="xl"
                  shape="rounded"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-primary text-on-primary">
                      Rank #{selectedCandidate.rank}
                    </span>
                    <span className="text-xs font-bold text-outline">
                      {selectedCandidate.experience}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-on-surface mt-0.5">
                    {selectedCandidate.name}
                  </h3>
                  <p className="text-xs text-outline">{selectedCandidate.title}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black text-primary">
                  {selectedCandidate.matchScore}%
                </span>
                <span className="block text-[10px] text-outline uppercase font-bold">
                  Índice NEXUS
                </span>
              </div>
            </div>

            {/* Pipeline Stage Controller */}
            <div className="p-3 bg-surface-container-low rounded-2xl border border-outline-variant/30 mb-5">
              <label className="text-[10px] font-extrabold uppercase text-outline block mb-1.5">
                Estado actual del proceso
              </label>
              <div className="grid grid-cols-2 gap-2">
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
                      onClick={() => handleStageChange(selectedCandidate.id, st)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                        isActive
                          ? 'bg-primary text-on-primary shadow-xs'
                          : 'bg-surface-container hover:bg-surface-container-highest text-on-surface-variant'
                      }`}
                    >
                      {st}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Competency Gap Analysis (Bars & Radar Scores) */}
            <div className="mb-5">
              <h4 className="text-xs font-black uppercase tracking-wider text-outline mb-3 flex items-center justify-between">
                <span>Evaluación de Competencias Críticas</span>
                <span className="text-primary font-bold">Referencia: {currentJobCode}</span>
              </h4>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1 font-semibold">
                    <CompetenciaNombre competencia="kubernetes" labelClassName="text-on-surface" technicalClassName="text-[10px] font-medium text-outline" />
                    <span className="text-primary font-bold">
                      {selectedCandidate.radarScores.kubernetes} / 5.0
                    </span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{
                        width: `${(selectedCandidate.radarScores.kubernetes / 5.0) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 font-semibold">
                    <CompetenciaNombre competencia="seguridadNube" labelClassName="text-on-surface" technicalClassName="text-[10px] font-medium text-outline" />
                    <span className="text-primary font-bold">
                      {selectedCandidate.radarScores.zeroTrust} / 5.0
                    </span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 rounded-full transition-all"
                      style={{
                        width: `${(selectedCandidate.radarScores.zeroTrust / 5.0) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 font-semibold">
                    <span className="text-on-surface">Comunicación con la alta dirección</span>
                    <span className="text-primary font-bold">
                      {selectedCandidate.radarScores.commExec} / 5.0
                    </span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all"
                      style={{
                        width: `${(selectedCandidate.radarScores.commExec / 5.0) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 font-semibold">
                    <CompetenciaNombre competencia="costosNube" labelClassName="text-on-surface" technicalClassName="text-[10px] font-medium text-outline" />
                    <span
                      className={`font-bold ${
                        selectedCandidate.radarScores.finOps < 4.0
                          ? 'text-amber-600'
                          : 'text-primary'
                      }`}
                    >
                      {selectedCandidate.radarScores.finOps} / 5.0
                    </span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        selectedCandidate.radarScores.finOps < 4.0 ? 'bg-amber-500' : 'bg-primary'
                      }`}
                      style={{
                        width: `${(selectedCandidate.radarScores.finOps / 5.0) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Recommendation Box */}
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 mb-5">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="material-symbols-outlined text-primary text-base">verified</span>
                <span className="text-xs font-black text-on-surface">
                  Resultado de Compatibilidad NEXUS
                </span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {selectedCandidate.matchScore >= 90
                  ? 'Recomendación A+: Candidato con experiencia comprobada en el diseño de sistemas. Reducirá en un 40% el tiempo para cubrir las brechas del equipo durante los primeros 90 días.'
                  : selectedCandidate.matchScore >= 75
                  ? 'Recomendación B: Candidato viable con sólida base técnica. Requiere plan de inducción específico en gestión de costos en la nube (FinOps).'
                  : 'Recomendación C: Candidato por debajo del nivel mínimo exigido para el rol E7. Se recomienda mantenerlo en la base de talentos para puestos de nivel intermedio.'}
              </p>
            </div>

            {/* Main Action Buttons */}
            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setShowOfferModal(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">send</span>
                Extender Oferta Laboral
              </button>

              <button
                onClick={() => setShowInterviewModal(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold border border-outline-variant/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base text-primary">event</span>
                Agendar Entrevista
              </button>

              <button
                onClick={() => {
                  triggerToast(`Candidato ${selectedCandidate.name} guardado en la base de talentos para futuras búsquedas.`);
                }}
                className="w-full py-2 px-4 rounded-xl text-outline hover:text-on-surface hover:bg-surface-container text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">bookmark</span>
                Guardar para Futuras Búsquedas
              </button>
            </div>
          </div>
        </div>
      </div>
      </>
    ) : (
      <div className="flex flex-col gap-6">
        {/* Banner de arquitectura ER */}
        <div className="p-6 bg-surface-container-lowest rounded-3xl border border-primary/30 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-primary-fixed text-primary">
                Base de Datos Supabase
              </span>
              <span className="text-xs text-outline font-semibold">
                6 Tablas Relacionales Integradas
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-on-surface">
              Arquitectura ER: Vacantes, Postulantes, Habilidades y Postulaciones
            </h2>
            <p className="text-xs text-outline mt-1 max-w-3xl">
              Implementación exacta del diagrama relacional: cruce de habilidades requeridas en la vacante contra las habilidades declaradas por el postulante para calcular el ranking de adecuación y su justificación técnica.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface">vacante</span>
            <span className="px-2.5 py-1 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface">perfil</span>
            <span className="px-2.5 py-1 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface">habilidad</span>
            <span className="px-2.5 py-1 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface">postulacion</span>
            <span className="px-2.5 py-1 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface">vacante_habilidad</span>
            <span className="px-2.5 py-1 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface">perfil_habilidad</span>
          </div>
        </div>

        {/* Grid de 2 columnas: Selector de Vacante y Selector de Postulante */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Columna Izquierda: Vacante seleccionada */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/40 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">work</span>
                  1. Entidad: Vacante (<code className="text-xs font-mono">vacante</code>)
                </h3>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Tabla BD activa
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-outline block mb-1">Seleccionar Vacante Activa:</label>
                <select
                  value={selectedVacanteId}
                  onChange={(e) => setSelectedVacanteId(Number(e.target.value))}
                  className="w-full p-2.5 bg-surface-container rounded-xl border border-outline-variant/40 text-on-surface font-bold text-sm outline-hidden focus:border-primary"
                >
                  {VACANTES_DATA.map((v) => (
                    <option key={v.id} value={v.id}>
                      Vacante #{v.id} &bull; {v.titulo} ({v.tipo})
                    </option>
                  ))}
                </select>
              </div>

              {(() => {
                const currentVacante = VACANTES_DATA.find((v) => v.id === selectedVacanteId) || VACANTES_DATA[0];
                return (
                  <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 flex flex-col gap-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-on-surface">{currentVacante.titulo}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-primary-fixed text-primary">
                        {currentVacante.tipo}
                      </span>
                    </div>
                    <div className="text-outline">
                      <strong>Puesto Asociado (Word):</strong> {currentVacante.idPuesto || 'General'} &bull; <strong>Área:</strong> {currentVacante.area}
                    </div>
                    <div className="text-on-surface-variant">
                      <strong>Requisitos:</strong> {currentVacante.requisitos}
                    </div>
                    <div className="text-on-surface-variant">
                      <strong>Beneficios:</strong> {currentVacante.beneficios}
                    </div>

                    <div className="pt-2 border-t border-outline-variant/30">
                      <span className="font-bold text-outline uppercase text-[10px] block mb-2">
                        Habilidades requeridas (<code className="font-mono">vacante_habilidad</code>):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {currentVacante.vacanteHabilidades?.map((vh) => (
                          <span
                            key={vh.habilidadId}
                            className="px-2.5 py-1 rounded-xl bg-surface-container-high border border-outline-variant/40 font-semibold text-on-surface flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-xs text-primary">check_circle</span>
                            {vh.habilidad?.nombre}
                            <span className="text-[10px] text-outline font-normal">({vh.habilidad?.tipo})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Columna Derecha: Postulante / Perfil */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/40 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">person</span>
                  2. Entidad: Postulante (<code className="text-xs font-mono">perfil</code>)
                </h3>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  Tabla BD activa
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-outline block mb-1">Seleccionar Postulante:</label>
                <select
                  value={selectedPostulanteId}
                  onChange={(e) => setSelectedPostulanteId(Number(e.target.value))}
                  className="w-full p-2.5 bg-surface-container rounded-xl border border-outline-variant/40 text-on-surface font-bold text-sm outline-hidden focus:border-primary"
                >
                  {POSTULANTES_DATA.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} {p.apellido} &bull; {p.carrera} ({p.legajo})
                    </option>
                  ))}
                </select>
              </div>

              {(() => {
                const currentPostulante = POSTULANTES_DATA.find((p) => p.id === selectedPostulanteId) || POSTULANTES_DATA[0];
                return (
                  <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 flex flex-col gap-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-on-surface">
                        {currentPostulante.nombre} {currentPostulante.apellido}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800">
                        {currentPostulante.legajo}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-outline">
                      <div><strong>DNI:</strong> {currentPostulante.dni}</div>
                      <div><strong>Correo:</strong> {currentPostulante.correo}</div>
                      <div><strong>Teléfono:</strong> {currentPostulante.telefono}</div>
                      <div><strong>Estado académico:</strong> {currentPostulante.anioCursado}</div>
                    </div>
                    <div className="text-on-surface-variant">
                      <strong>Carrera:</strong> {currentPostulante.carrera}
                    </div>
                    <p className="text-outline text-[11px] leading-relaxed italic bg-surface-container p-2.5 rounded-xl">
                      "{currentPostulante.descripcion}"
                    </p>

                    <div className="pt-2 border-t border-outline-variant/30">
                      <span className="font-bold text-outline uppercase text-[10px] block mb-2">
                        Habilidades que posee (<code className="font-mono">perfil_habilidad</code>):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {currentPostulante.habilidades?.map((ph) => (
                          <span
                            key={ph.habilidadId}
                            className="px-2.5 py-1 rounded-xl bg-primary/10 border border-primary/20 font-semibold text-primary flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-xs">verified</span>
                            {ph.habilidad?.nombre}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Sección Inferior: Entidad POSTULACION y Matching */}
        {(() => {
          const currentVacante = VACANTES_DATA.find((v) => v.id === selectedVacanteId) || VACANTES_DATA[0];
          const currentPostulante = POSTULANTES_DATA.find((p) => p.id === selectedPostulanteId) || POSTULANTES_DATA[0];

          const reqSkills = currentVacante.vacanteHabilidades?.map((vh) => vh.habilidadId) || [];
          const candSkills = currentPostulante.habilidades?.map((ph) => ph.habilidadId) || [];

          const matchedSkills = reqSkills.filter((id) => candSkills.includes(id));
          const missingSkills = reqSkills.filter((id) => !candSkills.includes(id));

          const matchPercent = reqSkills.length > 0 ? Math.round((matchedSkills.length / reqSkills.length) * 100) : 0;

          const existingPostulacion = currentPostulante.postulaciones?.find((post) => post.vacanteId === currentVacante.id);
          const ranking = existingPostulacion?.ranking ?? matchPercent;
          const etapa = existingPostulacion?.etapa ?? (matchPercent >= 80 ? 'Preseleccionado' : 'Revisión Inicial');
          const justificacion =
            existingPostulacion?.justificacion ??
            (matchPercent >= 85
              ? `El postulante posee el ${matchPercent}% de las habilidades requeridas. Muy alta adecuación para la posición.`
              : `Adecuación parcial (${matchPercent}%). Registra ${missingSkills.length} brechas de competencia frente al perfil.`);

          return (
            <div className="bg-surface-container-lowest p-6 rounded-3xl border border-primary/20 shadow-xs flex flex-col gap-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-outline-variant/30 pb-4">
                <div>
                  <h3 className="text-lg font-black text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">join_inner</span>
                    3. Entidad: Postulación (<code className="text-xs font-mono">postulacion</code>) & Matching Relacional
                  </h3>
                  <p className="text-xs text-outline mt-0.5">
                    Cruce entre Vacante #{currentVacante.id} ({currentVacante.titulo}) y Postulante #{currentPostulante.id} ({currentPostulante.nombre} {currentPostulante.apellido})
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-outline uppercase block">Ranking / Match</span>
                    <span className="text-2xl font-black text-primary">{ranking}%</span>
                  </div>
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-primary text-on-primary">
                    {etapa}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Habilidades coincidentes */}
                <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-2 font-bold text-emerald-800 text-xs">
                    <span className="material-symbols-outlined text-sm">task_alt</span>
                    Habilidades coincidentes ({matchedSkills.length} de {reqSkills.length}):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {matchedSkills.map((hId) => {
                      const h = HABILIDADES_DATA.find((x) => x.id === hId);
                      return (
                        <span key={hId} className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">check</span>
                          {h?.nombre}
                        </span>
                      );
                    })}
                    {matchedSkills.length === 0 && (
                      <span className="text-xs text-outline italic">No registra habilidades coincidentes directas.</span>
                    )}
                  </div>
                </div>

                {/* Brechas */}
                <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                  <div className="flex items-center gap-2 mb-2 font-bold text-amber-800 text-xs">
                    <span className="material-symbols-outlined text-sm">warning</span>
                    Brechas de habilidades ({missingSkills.length}):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {missingSkills.map((hId) => {
                      const h = HABILIDADES_DATA.find((x) => x.id === hId);
                      return (
                        <span key={hId} className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800 font-bold text-xs flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">close</span>
                          {h?.nombre}
                        </span>
                      );
                    })}
                    {missingSkills.length === 0 && (
                      <span className="text-xs text-emerald-700 font-bold">¡Cubre el 100% de las habilidades requeridas!</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Justificación técnica guardada en BD */}
              <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 flex flex-col gap-1 text-xs">
                <span className="font-bold text-outline uppercase text-[10px]">
                  Justificación almacenada (<code className="font-mono">justificacion</code>):
                </span>
                <p className="text-on-surface font-medium leading-relaxed">
                  {justificacion}
                </p>
              </div>
            </div>
          );
        })()}
      </div>
    )}

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest max-w-lg w-full rounded-3xl p-6 shadow-2xl border border-outline-variant/40">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">payments</span>
                <h3 className="text-lg font-black text-on-surface">Extensión de Oferta Formal</h3>
              </div>
              <button
                onClick={() => setShowOfferModal(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-outline cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowConfirmOffer(true);
              }}
              className="flex flex-col gap-4 text-xs"
            >
              <div className="p-3 bg-surface-container rounded-2xl flex items-center gap-3">
                <UserAvatar
                  name={selectedCandidate.name}
                  size="md"
                  shape="rounded"
                />
                <div>
                  <h4 className="font-bold text-on-surface">{selectedCandidate.name}</h4>
                  <p className="text-outline text-[11px]">{currentJob.title} &bull; Tier E7</p>
                </div>
              </div>

              <div>
                <label className="font-bold text-on-surface block mb-1">Paquete Salarial Base Anual:</label>
                <input
                  type="text"
                  defaultValue="$145,000 USD + Bono por Desempeño (15%)"
                  className="w-full p-2.5 bg-surface-container rounded-xl border border-outline-variant/40 text-on-surface outline-hidden focus:border-primary"
                />
              </div>

              <div>
                <label className="font-bold text-on-surface block mb-1">Fecha de Incorporación Prevista:</label>
                <input
                  type="date"
                  defaultValue="2026-11-01"
                  className="w-full p-2.5 bg-surface-container rounded-xl border border-outline-variant/40 text-on-surface outline-hidden focus:border-primary"
                />
              </div>

              <div>
                <label className="font-bold text-on-surface block mb-1">Beneficios y Equipamiento:</label>
                <div className="p-2.5 bg-surface-container rounded-xl text-on-surface-variant text-[11px] space-y-1">
                  <div>&bull; Presupuesto anual de formación y certificaciones</div>
                  <div>&bull; Equipo de trabajo de última generación</div>
                  <div>&bull; Cobertura médica integral 100%</div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOfferModal(false)}
                  className="px-4 py-2 rounded-xl text-on-surface-variant font-bold hover:bg-surface-container cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold hover:bg-primary-container shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">mark_email_read</span>
                  Continuar y Enviar Oferta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Offer */}
      <ConfirmationModal
        isOpen={showConfirmOffer}
        title="¿Confirmás el envío de la oferta laboral?"
        message={`Se enviará formalmente la propuesta económica a ${selectedCandidate.name} para el puesto de ${currentJob.title}. El candidato pasará a la etapa "Oferta Enviada".`}
        confirmLabel="Sí, enviar propuesta"
        cancelLabel="Revisar datos"
        type="primary"
        onConfirm={handleConfirmSendOffer}
        onCancel={() => setShowConfirmOffer(false)}
      />

      {/* Schedule Interview Modal */}
      {showInterviewModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest max-w-md w-full rounded-3xl p-6 shadow-2xl border border-outline-variant/40">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">event</span>
                <h3 className="text-lg font-black text-on-surface">Agendar Entrevista Técnica</h3>
              </div>
              <button
                onClick={() => setShowInterviewModal(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-outline cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleScheduleInterview} className="flex flex-col gap-4 text-xs">
              <div>
                <label className="font-bold text-on-surface block mb-1">Candidato:</label>
                <div className="p-2.5 bg-surface-container rounded-xl font-bold text-on-surface">
                  {selectedCandidate.name} ({selectedCandidate.title})
                </div>
              </div>

              <div>
                <label className="font-bold text-on-surface block mb-1">Fecha y Hora:</label>
                <input
                  type="datetime-local"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full p-2.5 bg-surface-container rounded-xl border border-outline-variant/40 text-on-surface outline-hidden focus:border-primary"
                />
              </div>

              <div>
                <label className="font-bold text-on-surface block mb-1">Entrevistadores Principales:</label>
                <input
                  type="text"
                  defaultValue="Sofía Méndez (Líder de IA y Arquitectura), Martín Krause (Director de Tecnología)"
                  className="w-full p-2.5 bg-surface-container rounded-xl border border-outline-variant/40 text-on-surface outline-hidden focus:border-primary"
                />
              </div>

              <div>
                <label className="font-bold text-on-surface block mb-1">Plataforma:</label>
                <div className="p-2.5 bg-surface-container rounded-xl text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">video_call</span>
                  Google Meet (Enlace generado automáticamente)
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInterviewModal(false)}
                  className="px-4 py-2 rounded-xl text-on-surface-variant font-bold hover:bg-surface-container cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold hover:bg-primary-container shadow-xs cursor-pointer"
                >
                  Confirmar y Enviar Invitación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
