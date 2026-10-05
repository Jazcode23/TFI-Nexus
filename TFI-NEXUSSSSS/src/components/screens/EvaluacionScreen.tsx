import React, { useState, useEffect } from 'react';
import { ScreenId } from '../../types';
import { EMPLOYEES_DATA } from '../../data/mockData';
import { UserAvatar } from '../UserAvatar';
import { ConfirmationModal } from '../ConfirmationModal';
import { QuickGuideBanner } from '../QuickGuideBanner';
import { HelpTooltip } from '../HelpTooltip';
import { evaluationsApi } from '../../services/api';

interface EvaluacionScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onSelectEmployee?: (employeeId: string) => void;
}

interface EvaluationRecord {
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

export const EvaluacionScreen: React.FC<EvaluacionScreenProps> = ({
  onNavigate,
  onSelectEmployee,
}) => {
  const [selectedCycle, setSelectedCycle] = useState('Ciclo Anual 2026 (Calibración Q4)');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'calibrated' | 'pending'>('all');
  const [activeTab, setActiveTab] = useState<'list' | '9box' | 'committee'>('list');
  const [selectedRecordId, setSelectedRecordId] = useState<string>('lucas');
  const [showCalibrateModal, setShowCalibrateModal] = useState<boolean>(false);
  const [showConfirmApproval, setShowConfirmApproval] = useState<boolean>(false);
  const [calibrationScore, setCalibrationScore] = useState<number>(4.75);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [records, setRecords] = useState<EvaluationRecord[]>([
    {
      id: 'lucas',
      employeeName: 'Ing. Lucas Valenzuela',
      role: 'Arquitecto Principal de Plataforma y Nube',
      area: 'Infraestructura y Plataforma',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      evaluator: 'Martín Krause (VP de Ingeniería)',
      selfScore: 4.8,
      managerScore: 4.7,
      peersScore: 4.75,
      calibratedScore: 4.74,
      box9: 'Talento Destacado (Estrella)',
      status: 'Calibrado',
      gapAnalysis: 'Superávit en Alta Disponibilidad y Resiliencia; oportunidad leve en gestión de costos en la nube.',
      potentialScore: 4.9,
      performanceScore: 4.8,
    },
    {
      id: 'sofia',
      employeeName: 'Sofía Méndez',
      role: 'Líder de Ingeniería en Inteligencia Artificial',
      area: 'Algoritmos de Inteligencia Artificial',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      evaluator: 'Elena Rostova (Directora de Inteligencia Artificial)',
      selfScore: 4.9,
      managerScore: 4.85,
      peersScore: 4.95,
      calibratedScore: 4.9,
      box9: 'Talento Destacado (Estrella)',
      status: 'Calibrado',
      gapAnalysis: 'Liderazgo técnico referente; elegible a Ingeniero Principal.',
      potentialScore: 5.0,
      performanceScore: 4.9,
    },
    {
      id: 'marcos',
      employeeName: 'Marcos Varela',
      role: 'Ingeniero Principal de Datos',
      area: 'Plataformas de Datos y Procesamiento en Tiempo Real',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      evaluator: 'Lucas Valenzuela (Arquitecto Principal de Plataforma)',
      selfScore: 4.5,
      managerScore: 4.6,
      peersScore: 4.4,
      calibratedScore: 4.55,
      box9: 'Especialista Clave',
      status: 'Calibrado',
      gapAnalysis: 'Desempeño técnico sobresaliente en procesamiento de eventos y datos; reforzar la mentoría entre equipos.',
      potentialScore: 4.2,
      performanceScore: 4.7,
    },
    {
      id: 'gabriel',
      employeeName: 'Gabriel Pardo',
      role: 'Especialista en Operaciones de Desarrollo e IA',
      area: 'Operaciones de IA e Infraestructura de Cómputo',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      evaluator: 'Sofía Méndez (Líder de IA)',
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
      area: 'Ciberseguridad y Cumplimiento Normativo',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
      evaluator: 'Martín Krause (VP de Ingeniería)',
      selfScore: 4.6,
      managerScore: 4.4,
      peersScore: 4.5,
      calibratedScore: 4.48,
      box9: 'Desempeño Sólido',
      status: 'Pendiente Comité',
      gapAnalysis: 'Cero incidentes críticos de seguridad; revisión de banda salarial pendiente.',
      potentialScore: 4.3,
      performanceScore: 4.5,
    },
  ]);

  const activeRecord = records.find((r) => r.id === selectedRecordId) || records[0];

  useEffect(() => {
    let isMounted = true;
    evaluationsApi
      .getAll()
      .then((res) => {
        if (isMounted && res.data && res.data.length > 0) {
          const mapped: EvaluationRecord[] = res.data.map((d: any) => ({
            id: d.id,
            employeeName: d.employeeName,
            role: d.role,
            area: d.area,
            avatar:
              d.avatar ||
              (d.id.includes('lucas')
                ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
                : d.id.includes('sofia')
                ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80'
                : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'),
            evaluator: 'Comité de Calibración Q4',
            selfScore: d.selfScore ?? 4.5,
            managerScore: d.managerScore ?? 4.6,
            peersScore: d.peersScore ?? 4.4,
            calibratedScore: d.calibratedScore ?? 4.7,
            box9: (d.box9 as any) || 'Desempeño Sólido',
            status: (d.status as any) || 'Calibrado',
            gapAnalysis: d.gapAnalysis || 'Evaluación de competencias anual',
            potentialScore: d.potentialScore ?? 4.5,
            performanceScore: d.performanceScore ?? 4.5,
          }));
          setRecords(mapped);
        }
      })
      .catch(() => {
        // Fallback en memoria
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveCalibration = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await evaluationsApi.calibrate(activeRecord.id, {
        calibratedScore: calibrationScore,
        box9: activeRecord.box9,
        notes: `Calibrado por Comité a ${calibrationScore}`,
      });
    } catch {
      // Fallback silencioso
    }

    setRecords((prev) =>
      prev.map((r) =>
        r.id === activeRecord.id
          ? { ...r, calibratedScore: calibrationScore, status: 'Calibrado' }
          : r
      )
    );
    setShowCalibrateModal(false);
    triggerToast(
      `Calibración de ${activeRecord.employeeName} guardada con puntaje consensuado de ${calibrationScore}.`
    );
  };

  const filteredRecords = records.filter((r) => {
    if (selectedFilter === 'calibrated') return r.status === 'Calibrado';
    if (selectedFilter === 'pending') return r.status !== 'Calibrado';
    return true;
  });

  return (
    <div className="w-full px-6 lg:px-8 py-6 flex flex-col gap-6 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-outline-variant/30 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="material-symbols-outlined text-secondary-container">verified</span>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Compact Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider text-primary font-bold font-headline">
              Crecimiento y Resultados &bull; Desempeño
            </span>
            <span className="text-outline-variant">•</span>
            <span className="text-xs text-on-surface-variant font-medium">
              Calificaciones y matriz de talento
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              142 evaluados
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-black text-on-surface tracking-tight font-headline">
            Evaluación de Desempeño y Matriz de Talento
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCycle}
            onChange={(e) => setSelectedCycle(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-surface-container text-on-surface border border-outline-variant/40 outline-none cursor-pointer"
          >
            <option value="Ciclo Anual 2026 (Calibración Q4)">Ciclo Anual 2026 (Activo)</option>
            <option value="Mid-Year Review 2026">Revisión Mid-Year 2026</option>
            <option value="Ciclo Anual 2025">Ciclo Anterior 2025</option>
          </select>
          <button
            onClick={() => setShowConfirmApproval(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-primary text-on-primary hover:bg-primary-container transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">assignment_turned_in</span>
            Aprobar Evaluaciones
          </button>
        </div>
      </div>

      {/* Slim Guide Bar */}
      <QuickGuideBanner
        title="Guía de Evaluaciones y Matriz 9-Box"
        description="Rendimiento del colaborador y su potencial de crecimiento futuro mediante consenso 360°."
        tips={[
          'En "Fichas 360°" podés revisar la nota técnica, autoevaluación y feedback de pares.',
          'En "Matriz de 9 Cajas" verás el cuadrante visual que cruza desempeño actual vs potencial.',
          'Al finalizar las calibraciones, usá "Aprobar Evaluaciones" para cerrar el ciclo oficialmente.',
        ]}
        dismissible={true}
      />

      {/* Compact 4-Metric Status Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="bg-surface-container-lowest px-3.5 py-2.5 rounded-xl border border-outline-variant/30 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-outline block">Colaboradores Evaluados</span>
            <div className="text-base font-black text-on-surface">
              142 <span className="text-[11px] font-normal text-outline">/ 156</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-secondary-container/40 text-on-secondary-container text-[10px] font-bold">
            91% avance
          </span>
        </div>

        <div className="bg-surface-container-lowest px-3.5 py-2.5 rounded-xl border border-outline-variant/30 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-outline block">Promedio Desempeño</span>
            <div className="text-base font-black text-primary">
              4.62 <span className="text-[11px] font-normal text-outline">/ 5.0</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-primary-fixed text-primary text-[10px] font-bold">
            Equilibrado
          </span>
        </div>

        <div className="bg-surface-container-lowest px-3.5 py-2.5 rounded-xl border border-outline-variant/30 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-outline block">Talento Destacado</span>
            <div className="text-base font-black text-on-secondary-container">
              18 <span className="text-[11px] font-bold text-on-secondary-container">estrellas</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-secondary-container/30 text-on-secondary-container text-[10px] font-bold">
            12% elegibles
          </span>
        </div>

        <div className="bg-surface-container-lowest px-3.5 py-2.5 rounded-xl border border-outline-variant/30 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-outline block">Pendientes de Calibrar</span>
            <div className="text-base font-black text-tertiary">
              14 <span className="text-[11px] font-bold text-tertiary">casos</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-error-container/40 text-tertiary text-[10px] font-bold">
            Comité Sesión 2
          </span>
        </div>
      </div>

      {/* Tabs Selector: Vista Lista 360°, Matriz 9-Box, Sesión de Comité */}
      <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'list'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined text-sm">fact_check</span>
          Fichas 360° ({filteredRecords.length})
        </button>

        <button
          onClick={() => setActiveTab('9box')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === '9box'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined text-sm">grid_view</span>
          Matriz de 9 Cajas (Desempeño vs Potencial)
        </button>

        <button
          onClick={() => setActiveTab('committee')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'committee'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined text-sm">groups</span>
          Comité de Calibración y Distribución Obligatoria
        </button>
      </div>

      {/* TAB 1: Lista de Evaluaciones 360° */}
      {activeTab === 'list' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Columna Izquierda: Listado */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedFilter === 'all'
                      ? 'bg-surface-container-highest text-primary font-black'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  Todos ({records.length})
                </button>
                <button
                  onClick={() => setSelectedFilter('calibrated')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedFilter === 'calibrated'
                      ? 'bg-surface-container-highest text-primary font-black'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  Calibrados
                </button>
                <button
                  onClick={() => setSelectedFilter('pending')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedFilter === 'pending'
                      ? 'bg-surface-container-highest text-primary font-black'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  Pendientes
                </button>
              </div>
              <span className="text-xs text-outline">Ponderación: Líder 50% &bull; Pares 30% &bull; Auto 20%</span>
            </div>

            <div className="space-y-3">
              {filteredRecords.map((r) => {
                const isSelected = selectedRecordId === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRecordId(r.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2.5 ${
                      isSelected
                        ? 'bg-surface-container-lowest border-primary ring-2 ring-primary/20 shadow-xs'
                        : 'bg-surface-container-lowest hover:bg-surface-container-low border-outline-variant/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          name={r.employeeName}
                          size="md"
                          shape="rounded"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-extrabold text-on-surface">
                              {r.employeeName}
                            </h3>
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                r.status === 'Calibrado'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {r.status}
                            </span>
                          </div>
                          <p className="text-xs text-outline">{r.role}</p>
                          <span className="text-[11px] text-primary font-semibold">{r.area}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xl font-black text-primary">
                          {r.calibratedScore}
                        </span>
                        <span className="block text-[10px] text-outline uppercase font-semibold">
                          Puntaje 360°
                        </span>
                      </div>
                    </div>

                    {/* Breakdown 360 */}
                    <div className="grid grid-cols-4 gap-2 text-center text-xs pt-2 border-t border-outline-variant/20">
                      <div className="p-1.5 bg-surface-container rounded-xl">
                        <span className="text-[10px] text-outline block">Autoevaluación</span>
                        <strong className="text-on-surface">{r.selfScore}</strong>
                      </div>
                      <div className="p-1.5 bg-surface-container rounded-xl">
                        <span className="text-[10px] text-outline block">Evaluación Líder</span>
                        <strong className="text-on-surface">{r.managerScore}</strong>
                      </div>
                      <div className="p-1.5 bg-surface-container rounded-xl">
                        <span className="text-[10px] text-outline block">Pares (Feedback)</span>
                        <strong className="text-on-surface">{r.peersScore}</strong>
                      </div>
                      <div className="p-1.5 bg-primary/10 text-primary rounded-xl">
                        <span className="text-[10px] font-bold block">9 Cajas</span>
                        <strong className="text-[11px] truncate block">{r.box9}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Columna Derecha: Inspector Detallado de Evaluación */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-2xs sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    name={activeRecord.employeeName}
                    size="xl"
                    shape="rounded"
                  />
                  <div>
                    <h3 className="text-base font-extrabold text-on-surface">
                      {activeRecord.employeeName}
                    </h3>
                    <p className="text-xs text-outline">{activeRecord.role}</p>
                    <span className="text-xs font-bold text-primary">{activeRecord.box9}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-primary">
                    {activeRecord.calibratedScore}
                  </div>
                  <span className="text-[10px] text-outline uppercase font-bold">Consenso Final</span>
                </div>
              </div>

              {/* Evaluators Info */}
              <div className="p-3 bg-surface-container rounded-2xl text-xs space-y-1 mb-4">
                <div className="flex justify-between">
                  <span className="text-outline">Líder Evaluador:</span>
                  <span className="font-semibold text-on-surface">{activeRecord.evaluator}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Potencial Proyectado:</span>
                  <span className="font-semibold text-primary">{activeRecord.potentialScore} / 5.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Desempeño Observado:</span>
                  <span className="font-semibold text-emerald-600">{activeRecord.performanceScore} / 5.0</span>
                </div>
              </div>

              {/* Síntesis de Competencias y Feedback */}
              <div className="mb-4">
                <h4 className="text-xs font-black uppercase text-outline tracking-wider mb-2">
                  Diagnóstico Cualitativo del Desempeño
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed p-3 bg-surface-container-low rounded-2xl border border-outline-variant/20">
                  {activeRecord.gapAnalysis}
                </p>
              </div>

              {/* Botones de Acción */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setCalibrationScore(activeRecord.calibratedScore);
                    setShowCalibrateModal(true);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">tune</span>
                  Ajustar Calificación Final
                </button>

                <button
                  onClick={() => {
                    if (onSelectEmployee) {
                      onSelectEmployee(activeRecord.id);
                      return;
                    }
                    onNavigate('empleados');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-surface-container-highest hover:bg-surface-container-high text-on-surface text-xs font-bold border border-outline-variant/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm text-primary">group</span>
                  Ver Ficha Completa del Empleado
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Matriz 9-Box Interactiva */}
      {activeTab === '9box' && (
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-2xs flex flex-col gap-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-extrabold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">grid_view</span>
                Matriz de 9 Cajas: Desempeño vs Potencial de Liderazgo
              </h2>
              <p className="text-xs text-outline">
                Segmentación estratégica para planes de sucesión, bonos por desempeño y retención de talento clave.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                Estrellas: 18 (12%)
              </span>
              <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-bold">
                Base sólida: 95 (67%)
              </span>
              <button
                onClick={async () => {
                  try {
                    await evaluationsApi.download9Box('xlsx');
                    triggerToast('Acta 9-Box descargada con éxito en Excel.');
                  } catch {
                    triggerToast('Acta 9-Box exportada (modo local).');
                  }
                }}
                className="px-3 py-1 rounded-xl bg-primary text-on-primary font-bold flex items-center gap-1.5 shadow-xs hover:bg-primary-container transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-xs">download</span>
                <span>Descargar Acta 9-Box</span>
              </button>
            </div>
          </div>

          {/* 3x3 Grid */}
          <div className="grid grid-cols-3 gap-3 min-h-[420px]">
            {/* Row 1: Alto Potencial */}
            <div className="p-4 bg-purple-500/5 rounded-2xl border border-purple-300/40 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-purple-700 block">Potencial Alto / Desempeño Medio</span>
                <h4 className="text-xs font-extrabold text-on-surface mt-0.5">Futuro Líder / Potencial por Desarrollar</h4>
                <p className="text-[11px] text-outline mt-1">Gabriel Pardo (Operaciones de IA)</p>
              </div>
              <span className="text-[10px] text-primary font-bold">Plan de Coaching</span>
            </div>

            <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-400/40 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-700 block">Potencial Alto / Desempeño Alto</span>
                <h4 className="text-xs font-extrabold text-on-surface mt-0.5">Alto Impacto (Estrella en Crecimiento)</h4>
                <p className="text-[11px] text-outline mt-1">Marcos Varela (Datos)</p>
              </div>
              <span className="text-[10px] text-emerald-700 font-bold">Proyección Inmediata</span>
            </div>

            <div className="p-4 bg-emerald-500/20 rounded-2xl border-2 border-emerald-500 flex flex-col justify-between shadow-xs">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-800 block">Potencial Alto / Desempeño Superior</span>
                <h4 className="text-sm font-black text-on-surface mt-0.5">Talento Destacado (Estrella) ⭐</h4>
                <div className="flex items-center gap-1.5 mt-2">
                  <UserAvatar name="Sofía Méndez" size="xs" shape="circle" />
                  <UserAvatar name="Lucas Valenzuela" size="xs" shape="circle" />
                </div>
              </div>
              <span className="text-[10px] text-emerald-800 font-black">Sucesores Directos de la Alta Dirección</span>
            </div>

            {/* Row 2: Potencial Medio */}
            <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-outline block">Potencial Medio / Desempeño Bajo</span>
                <h4 className="text-xs font-extrabold text-on-surface mt-0.5">Dilema / Ajuste de Rol</h4>
              </div>
              <span className="text-[10px] text-outline">Revisión a 90 días</span>
            </div>

            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-primary block">Potencial Medio / Desempeño Medio</span>
                <h4 className="text-xs font-extrabold text-on-surface mt-0.5">Columna Vertebral del Equipo</h4>
                <p className="text-[11px] text-outline mt-1">Lic. Laura Benítez (Seguridad)</p>
              </div>
              <span className="text-[10px] text-primary font-bold">Estabilidad y Retención</span>
            </div>

            <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-300/40 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-700 block">Potencial Medio / Desempeño Superior</span>
                <h4 className="text-xs font-extrabold text-on-surface mt-0.5">Especialista Clave</h4>
              </div>
              <span className="text-[10px] text-emerald-700 font-bold">Reconocimiento Técnico</span>
            </div>

            {/* Row 3: Potencial Bajo */}
            <div className="p-4 bg-rose-500/5 rounded-2xl border border-rose-300/40 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-rose-700 block">Potencial Bajo / Desempeño Bajo</span>
                <h4 className="text-xs font-extrabold text-on-surface mt-0.5">Bajo Desempeño (Riesgo)</h4>
              </div>
              <span className="text-[10px] text-rose-700 font-bold">Plan de Mejora del Desempeño</span>
            </div>

            <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-outline block">Potencial Bajo / Desempeño Medio</span>
                <h4 className="text-xs font-extrabold text-on-surface mt-0.5">Operativo Eficiente</h4>
              </div>
              <span className="text-[10px] text-outline">Especialización de Tareas</span>
            </div>

            <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-outline block">Potencial Bajo / Desempeño Superior</span>
                <h4 className="text-xs font-extrabold text-on-surface mt-0.5">Experto Artesano</h4>
              </div>
              <span className="text-[10px] text-outline">Mentor de Oficio</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Curva Forzada y Sesión de Comité */}
      {activeTab === 'committee' && (
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-2xs flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">balance</span>
                Ajuste de la Distribución de Resultados en Comité
              </h2>
              <p className="text-xs text-outline">
                Control de sesgos de indulgencia o severidad de evaluadores mediante calibración colegiada.
              </p>
            </div>
            <button
              onClick={() => triggerToast('Distribución calibrada guardada sin objeciones del comité.')}
              className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container shadow-xs cursor-pointer"
            >
              Aprobar Distribución Oficial
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/20">
              <div className="text-xs text-outline font-bold uppercase">Nivel Sobresaliente (Top 15%)</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">12.6% Real</div>
              <p className="text-xs text-emerald-700 mt-1">Dentro del rango de meta corporativa (10-15%).</p>
            </div>

            <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/20">
              <div className="text-xs text-outline font-bold uppercase">Nivel Sólido Esperado (70%)</div>
              <div className="text-2xl font-black text-primary mt-1">73.2% Real</div>
              <p className="text-xs text-primary mt-1">Distribución óptima de colaboradores competentes.</p>
            </div>

            <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/20">
              <div className="text-xs text-outline font-bold uppercase">Nivel Requiere Acompañamiento (15%)</div>
              <div className="text-2xl font-black text-amber-600 mt-1">14.2% Real</div>
              <p className="text-xs text-amber-700 mt-1">Con planes de capacitación y seguimiento asignados.</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Calibración */}
      {showCalibrateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest max-w-md w-full rounded-3xl p-6 shadow-2xl border border-outline-variant/40">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">tune</span>
                <h3 className="text-lg font-black text-on-surface">Calibración en Comité</h3>
              </div>
              <button
                onClick={() => setShowCalibrateModal(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-outline cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveCalibration} className="flex flex-col gap-4 text-xs">
              <div className="p-3 bg-surface-container rounded-2xl flex items-center gap-3">
                <UserAvatar
                  name={activeRecord.employeeName}
                  size="md"
                  shape="rounded"
                />
                <div>
                  <h4 className="font-bold text-on-surface">{activeRecord.employeeName}</h4>
                  <p className="text-outline text-[11px]">{activeRecord.role}</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-on-surface mb-1">
                  <span>Puntaje consensuado por el Comité:</span>
                  <span className="text-primary text-sm">{calibrationScore.toFixed(2)} / 5.0</span>
                </div>
                <input
                  type="range"
                  min="3.0"
                  max="5.0"
                  step="0.05"
                  value={calibrationScore}
                  onChange={(e) => setCalibrationScore(parseFloat(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              <div>
                <label className="font-bold text-on-surface block mb-1">Acuerdo del Comité / Justificación:</label>
                <textarea
                  rows={3}
                  defaultValue="Se valida consistencia en entregables de alta disponibilidad y aporte a la estabilidad de la plataforma durante Q4."
                  className="w-full p-2.5 bg-surface-container rounded-xl border border-outline-variant/40 text-on-surface outline-hidden focus:border-primary resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCalibrateModal(false)}
                  className="px-4 py-2 rounded-xl text-on-surface-variant font-bold hover:bg-surface-container cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold hover:bg-primary-container shadow-xs cursor-pointer"
                >
                  Registrar Calibración
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
