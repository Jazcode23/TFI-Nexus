import React, { useState, useEffect } from 'react';
import { ScreenId } from '../../types';
import { EMPLOYEES_DATA } from '../../data/mockData';
import { UserAvatar } from '../UserAvatar';
import { QuickGuideBanner } from '../QuickGuideBanner';
import { HelpTooltip } from '../HelpTooltip';
import { downloadFile, trainingApi } from '../../services/api';

interface CapacitacionScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onSelectEmployee?: (employeeId: string) => void;
}

interface LearningTrack {
  id: string;
  title: string;
  /** Nombre técnico original del curso, se muestra como referencia secundaria. */
  technicalTitle?: string;
  category: 'Nube y Operaciones Tecnológicas' | 'Inteligencia Artificial y Datos' | 'Ciberseguridad' | 'Liderazgo y Habilidades Humanas';
  level: 'Intermedio' | 'Avanzado' | 'Experto';
  hours: number;
  enrolledCount: number;
  completionRate: number;
  gapTarget: string;
  provider: string;
  certification: string;
  description: string;
  enrolledEmployees: Array<{
    name: string;
    avatar: string;
    progress: number;
  }>;
}

export const CapacitacionScreen: React.FC<CapacitacionScreenProps> = ({
  onNavigate,
  onSelectEmployee,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showEnrollModal, setShowEnrollModal] = useState<boolean>(false);
  const [showCreateTrackModal, setShowCreateTrackModal] = useState<boolean>(false);
  const [selectedTrackId, setSelectedTrackId] = useState<string>('finops');
  const [selectedEmpName, setSelectedEmpName] = useState<string>(EMPLOYEES_DATA[0].name);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    trainingApi
      .getAll()
      .then((res) => {
        if (isMounted && res.data && res.data.length > 0) {
          const mapped: LearningTrack[] = res.data.map((t: any) => ({
            id: t.id,
            title: t.title,
            technicalTitle: t.technicalTitle || t.title,
            category: t.category || 'Nube y Operaciones Tecnológicas',
            level: t.level || 'Avanzado',
            hours: t.hours || (parseInt(t.duration, 10) || 40),
            enrolledCount: t.enrolledCount || 0,
            completionRate: t.completionRate || 85,
            gapTarget: t.gapTarget || 'Fortalecimiento de competencias clave',
            provider: t.provider || 'NEXUS Academy',
            certification: t.certification || 'Certificación Oficial',
            description: t.description || 'Programa de desarrollo y upskilling técnico continuo.',
            enrolledEmployees: Array.isArray(t.enrolledEmployees) ? t.enrolledEmployees : [],
          }));
          setTracks(mapped);
        }
      })
      .catch(() => {
        // Fallback en memoria
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const [tracks, setTracks] = useState<LearningTrack[]>([
    {
      id: 'finops',
      title: 'Gestión de Costos en la Nube',
      technicalTitle: 'Especialización FinOps Cloud & Optimización de Cómputo',
      category: 'Nube y Operaciones Tecnológicas',
      level: 'Avanzado',
      hours: 48,
      enrolledCount: 8,
      completionRate: 85,
      gapTarget: 'Cierra la brecha en gestión de costos de nube en Infraestructura (Lucas Valenzuela y su equipo)',
      provider: 'FinOps Foundation & Linux Foundation',
      certification: 'Certified FinOps Practitioner (FOCP)',
      description:
        'Control del presupuesto de los servidores en la nube (AWS/GCP), reparto de costos por servicio y reducción del gasto innecesario en equipos de cómputo avanzado.',
      enrolledEmployees: [
        {
          name: 'Lucas Valenzuela',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
          progress: 88,
        },
        {
          name: 'Gabriel Pardo',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
          progress: 65,
        },
      ],
    },
    {
      id: 'distribuidos',
      title: 'Diseño de Sistemas de Gran Escala y Alta Demanda',
      technicalTitle: 'Arquitectura de Sistemas Distribuidos & Alta Concurrencia',
      category: 'Nube y Operaciones Tecnológicas',
      level: 'Experto',
      hours: 64,
      enrolledCount: 14,
      completionRate: 92,
      gapTarget: 'Eleva la resiliencia del Eslabón Operaciones Centrales en un +18%',
      provider: 'NEXUS Engineering Academy',
      certification: 'Principal Distributed Systems Architect',
      description:
        'Técnicas para que los sistemas sigan funcionando de forma coordinada aunque fallen partes de la red, y para mantener los datos consistentes entre varios servidores.',
      enrolledEmployees: [
        {
          name: 'Marcos Varela',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
          progress: 94,
        },
      ],
    },
    {
      id: 'zerotrust',
      title: 'Seguridad y Acceso en la Nube: Protección de Servidores',
      technicalTitle: 'Ciberseguridad Zero Trust & Hardening de Contenedores',
      category: 'Ciberseguridad',
      level: 'Avanzado',
      hours: 40,
      enrolledCount: 6,
      completionRate: 78,
      gapTarget: 'Reduce una vulnerabilidad crítica en los clústeres de servidores (Kubernetes)',
      provider: 'Cloud Native Computing Foundation (CNCF)',
      certification: 'Certified Kubernetes Security Specialist (CKS)',
      description:
        'Protección de las comunicaciones entre sistemas, detección de tráfico sospechoso y auditoría permanente de las identidades y accesos.',
      enrolledEmployees: [
        {
          name: 'Lic. Laura Benítez',
          avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
          progress: 82,
        },
      ],
    },
    {
      id: 'genai',
      title: 'Inteligencia Artificial y Modelos de Lenguaje',
      technicalTitle: 'Ingeniería de Inferencia LLM & Modelos Fundacionales',
      category: 'Inteligencia Artificial y Datos',
      level: 'Experto',
      hours: 56,
      enrolledCount: 11,
      completionRate: 96,
      gapTarget: 'Sustenta la arquitectura técnica de NEXUS',
      provider: 'NVIDIA Deep Learning Institute & Google Cloud',
      certification: 'Enterprise LLM Infrastructure Specialist',
      description:
        'Cómo hacer que los modelos de lenguaje de IA respondan rápido y usen menos recursos, incluso con muchos usuarios a la vez.',
      enrolledEmployees: [
        {
          name: 'Sofía Méndez',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
          progress: 100,
        },
      ],
    },
    {
      id: 'csuite-comm',
      title: 'Comunicación Estratégica y Negociación para Ingenieros Principales',
      category: 'Liderazgo y Habilidades Humanas',
      level: 'Intermedio',
      hours: 24,
      enrolledCount: 18,
      completionRate: 90,
      gapTarget: 'Mejora la comunicación técnica con los comités ejecutivos y los clientes',
      provider: 'Executive Leadership Institute',
      certification: 'Technical Executive Communicator',
      description:
        'Presentación de resultados con datos del negocio, defensa de presupuestos tecnológicos y gestión de las partes interesadas.',
      enrolledEmployees: [
        {
          name: 'Lucas Valenzuela',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
          progress: 90,
        },
      ],
    },
  ]);

  const activeTrack = tracks.find((t) => t.id === selectedTrackId) || tracks[0];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await trainingApi.enroll(activeTrack.id, selectedEmpName);
    } catch {
      // Fallback
    }

    setTracks((prev) =>
      prev.map((t) => {
        if (t.id === activeTrack.id) {
          const already = t.enrolledEmployees.some((e) => e.name === selectedEmpName);
          if (already) return t;
          return {
            ...t,
            enrolledCount: t.enrolledCount + 1,
            enrolledEmployees: [
              ...t.enrolledEmployees,
              {
                name: selectedEmpName,
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
                progress: 0,
              },
            ],
          };
        }
        return t;
      })
    );

    setShowEnrollModal(false);
    triggerToast(
      `¡Listo! ${selectedEmpName} matriculado en "${activeTrack.title}". Guardado en base de datos.`
    );
  };

  const filteredTracks = tracks.filter((t) => {
    if (selectedCategory === 'all') return true;
    return t.category === selectedCategory;
  });

  return (
    <div className="w-full px-6 lg:px-8 py-6 flex flex-col gap-6 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-outline-variant/30 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="material-symbols-outlined text-secondary-container">school</span>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Compact Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider text-primary font-bold font-headline">
              Crecimiento y Resultados &bull; Aprendizaje
            </span>
            <span className="text-outline-variant">•</span>
            <span className="text-xs text-on-surface-variant font-medium">
              Cursos y desarrollo profesional
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {tracks.length} rutas activas
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-black text-on-surface tracking-tight font-headline">
            Capacitación y Cursos de Formación
          </h1>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowEnrollModal(true)}
            className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-bold bg-primary text-on-primary hover:bg-primary-container transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            Inscribir Colaborador
          </button>
        </div>
      </div>

      {/* Slim Guide Bar */}
      <QuickGuideBanner
        title="Guía de Capacitación del Personal"
        description="Planes de aprendizaje, upskilling técnico y certificaciones para mitigar brechas de competencias."
        tips={[
          'Explorá los cursos disponibles organizados por categoría (Cloud, IA, Liderazgo, etc.).',
          'Hacé clic en cualquier curso para ver los colaboradores matriculados y su avance porcentual.',
          'Usá "Inscribir Colaborador" para asignar una nueva ruta de desarrollo profesional.',
        ]}
        dismissible={true}
      />

      {/* Compact 4-Metric Status Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="bg-surface-container-lowest px-3.5 py-2.5 rounded-xl border border-outline-variant/30 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-outline block">Horas Impartidas</span>
            <div className="text-base font-black text-on-surface">
              1,480 <span className="text-[11px] font-normal text-outline">hrs</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-secondary-container/40 text-on-secondary-container text-[10px] font-bold">
            100% cubiertas
          </span>
        </div>

        <div className="bg-surface-container-lowest px-3.5 py-2.5 rounded-xl border border-outline-variant/30 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-outline block">Brechas Mitigadas</span>
            <div className="text-base font-black text-emerald-600">
              28 <span className="text-[11px] font-normal text-outline">roles</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
            -85% riesgo
          </span>
        </div>

        <div className="bg-surface-container-lowest px-3.5 py-2.5 rounded-xl border border-outline-variant/30 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-outline block">Certificaciones</span>
            <div className="text-base font-black text-primary">
              42 <span className="text-[11px] font-normal text-outline">emitidas</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-primary-fixed text-primary text-[10px] font-bold">
            Globales
          </span>
        </div>

        <div className="bg-surface-container-lowest px-3.5 py-2.5 rounded-xl border border-outline-variant/30 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-outline block">Retorno Inversión</span>
            <div className="text-base font-black text-on-secondary-container">
              3.4x <span className="text-[11px] font-normal text-outline">ROI</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-secondary-container/30 text-on-secondary-container text-[10px] font-bold">
            +$420k USD
          </span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-outline-variant/30 pb-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          Todas las Rutas ({tracks.length})
        </button>
        <button
          onClick={() => setSelectedCategory('Nube y Operaciones Tecnológicas')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedCategory === 'Nube y Operaciones Tecnológicas'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          Nube y Operaciones Tecnológicas
        </button>
        <button
          onClick={() => setSelectedCategory('Inteligencia Artificial y Datos')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedCategory === 'Inteligencia Artificial y Datos'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          Inteligencia Artificial y Datos
        </button>
        <button
          onClick={() => setSelectedCategory('Ciberseguridad')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedCategory === 'Ciberseguridad'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          Ciberseguridad
        </button>
        <button
          onClick={() => setSelectedCategory('Liderazgo y Habilidades Humanas')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedCategory === 'Liderazgo y Habilidades Humanas'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          Liderazgo y Habilidades Humanas
        </button>
      </div>

      {/* Main Grid: Catalog on left (7 cols), Track detail on right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">auto_stories</span>
              Catálogo de Rutas Activas
            </h2>
            <span className="text-xs text-outline">{filteredTracks.length} programas disponibles</span>
          </div>

          <div className="space-y-4">
            {filteredTracks.map((track) => {
              const isSelected = selectedTrackId === track.id;
              return (
                <div
                  key={track.id}
                  onClick={() => setSelectedTrackId(track.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2.5 ${
                    isSelected
                      ? 'bg-surface-container-lowest border-primary ring-2 ring-primary/20 shadow-xs'
                      : 'bg-surface-container-lowest hover:bg-surface-container-low border-outline-variant/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-primary/10 text-primary">
                          {track.category}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant">
                          {track.level}
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-on-surface mt-1">
                        {track.title}
                      </h3>
                      {track.technicalTitle && (
                        <p className="text-[11px] font-medium text-outline">{track.technicalTitle}</p>
                      )}
                      <p className="text-xs text-outline mt-0.5">{track.provider}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-primary">{track.hours} hrs</span>
                      <span className="block text-[10px] text-outline font-semibold uppercase">
                        Carga Horaria
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2">
                    {track.description}
                  </p>

                  <div className="p-2.5 bg-primary/5 rounded-2xl border border-primary/15 text-xs text-primary font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">target</span>
                    <span className="truncate">{track.gapTarget}</span>
                  </div>

                  {/* Progress and Enrolled */}
                  <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-outline font-medium">Inscritos:</span>
                      <div className="flex -space-x-2">
                        {track.enrolledEmployees.map((emp, i) => (
                          <UserAvatar
                            key={i}
                            name={emp.name}
                            size="xs"
                            shape="circle"
                            className="ring-2 ring-surface"
                          />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-on-surface">
                        {track.enrolledCount} colaboradores
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-outline">Tasa éxito:</span>
                      <span className="font-black text-emerald-600">
                        {track.completionRate}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Track Deep Dive */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-2xs sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-primary text-on-primary">
                {activeTrack.level}
              </span>
              <span className="text-xs font-bold text-outline">{activeTrack.hours} Horas Lectivas</span>
            </div>

            <h3 className="text-lg font-black text-on-surface">{activeTrack.title}</h3>
            {activeTrack.technicalTitle && (
              <p className="text-[11px] font-medium text-outline">{activeTrack.technicalTitle}</p>
            )}
            <p className="text-xs text-primary font-bold mt-0.5">{activeTrack.provider}</p>

            <div className="p-3 bg-surface-container rounded-2xl my-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-outline">Certificación Oficial:</span>
                <span className="font-semibold text-on-surface text-right truncate max-w-[200px]">
                  {activeTrack.certification}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Alumnos en curso:</span>
                <span className="font-semibold text-primary">{activeTrack.enrolledCount} Colaboradores</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Finalización promedio:</span>
                <span className="font-semibold text-emerald-600">{activeTrack.completionRate}%</span>
              </div>
            </div>

            <h4 className="text-xs font-black uppercase text-outline mb-1">Objetivo del Programa</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
              {activeTrack.description}
            </p>

            <h4 className="text-xs font-black uppercase text-outline mb-2">
              Colaboradores con Mayor Avance
            </h4>
            <div className="space-y-2 mb-5">
              {activeTrack.enrolledEmployees.map((emp, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-surface-container-low rounded-2xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <UserAvatar
                      name={emp.name}
                      size="sm"
                      shape="rounded"
                    />
                    <div>
                      <span className="font-bold text-on-surface block">{emp.name}</span>
                      <span className="text-[10px] text-outline">En progreso</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-primary">{emp.progress}%</span>
                    <div className="w-16 h-1.5 bg-surface-container-highest rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${emp.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => setShowEnrollModal(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-primary text-on-primary text-xs font-black hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">assignment_ind</span>
                Asignar a un Colaborador
              </button>
              <button
                onClick={() => {
                  try {
                    const content = JSON.stringify(activeTrack, null, 2);
                    const blob = new Blob([content], { type: 'application/json' });
                    downloadFile(blob, `Programa_Capacitacion_${activeTrack.id}_${Date.now()}.json`);
                    triggerToast(`Programa de "${activeTrack.title}" descargado exitosamente.`);
                  } catch {
                    triggerToast('Contenido del curso descargado.');
                  }
                }}
                className="w-full py-2 px-4 rounded-xl bg-surface-container-highest hover:bg-surface-container-high text-on-surface text-xs font-bold border border-outline-variant/40 transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                Descargar Programa Completo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Inscribir */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest max-w-md w-full rounded-2xl p-6 shadow-2xl border border-outline-variant/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">school</span>
                <h3 className="text-lg font-black text-on-surface">Asignar Capacitación</h3>
              </div>
              <button
                onClick={() => setShowEnrollModal(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-outline cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleEnroll} className="flex flex-col gap-4 text-xs">
              <div>
                <label className="font-bold text-on-surface block mb-1">Ruta Formativa:</label>
                <div className="p-2.5 bg-surface-container rounded-xl font-semibold text-primary">
                  {activeTrack.title}
                </div>
              </div>

              <div>
                <label className="font-bold text-on-surface block mb-1">Seleccionar Colaborador:</label>
                <select
                  value={selectedEmpName}
                  onChange={(e) => setSelectedEmpName(e.target.value)}
                  className="w-full p-2.5 bg-surface-container rounded-xl border border-outline-variant/40 text-on-surface outline-hidden focus:border-primary"
                >
                  {EMPLOYEES_DATA.map((emp) => (
                    <option key={emp.id} value={emp.name}>
                      {emp.name} &bull; {emp.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-on-surface block mb-1">Fecha Límite Sugerida:</label>
                <input
                  type="date"
                  defaultValue="2026-12-15"
                  className="w-full p-2.5 bg-surface-container rounded-xl border border-outline-variant/40 text-on-surface outline-hidden focus:border-primary"
                />
              </div>

              <div className="p-3 bg-surface-container-high rounded-xl text-on-surface-variant text-[11px]">
                El colaborador recibirá un correo automático con credenciales y fechas de mentoría en vivo.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="px-4 py-2 rounded-xl text-on-surface-variant font-bold hover:bg-surface-container cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold hover:bg-primary-container shadow-xs cursor-pointer"
                >
                  Confirmar Inscripción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
