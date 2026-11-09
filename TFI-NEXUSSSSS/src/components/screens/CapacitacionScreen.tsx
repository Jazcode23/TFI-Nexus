import React, { useState, useEffect, useMemo } from 'react';
import {
  GraduationCap,
  Clock,
  Users,
  Award,
  Search,
  UserPlus,
  Target,
  BookOpen,
  Download,
  X,
  TrendingUp,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { EmployeeProfile, ScreenId } from '../../types';
import { EMPLOYEES_DATA } from '../../data/mockData';
import { UserAvatar } from '../UserAvatar';
import { QuickGuideBanner } from '../QuickGuideBanner';
import { useToast } from '../ToastProvider';
import { useFocusTrap } from '../useFocusTrap';
import { EmptyState } from '../EmptyState';
import { downloadFile, trainingApi, employeesApi } from '../../services/api';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';

interface CapacitacionScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onSelectEmployee?: (employeeId: string) => void;
}

export interface LearningTrack {
  id: string;
  title: string;
  technicalTitle?: string;
  category: string;
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

const INITIAL_TRACKS: LearningTrack[] = [
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
];

export const CapacitacionScreen: React.FC<CapacitacionScreenProps> = ({
  onSelectEmployee,
}) => {
  const { showToast } = useToast();
  const [tracks, setTracks] = useState<LearningTrack[]>(INITIAL_TRACKS);
  const [employees, setEmployees] = useState<EmployeeProfile[]>(EMPLOYEES_DATA);
  const [selectedTrackId, setSelectedTrackId] = useState<string>('finops');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showEnrollModal, setShowEnrollModal] = useState<boolean>(false);
  const [selectedEmpName, setSelectedEmpName] = useState<string>(EMPLOYEES_DATA[0].name);
  const [isEnrolling, setIsEnrolling] = useState<boolean>(false);

  // Modal focus trap for accessibility
  const enrollModalRef = useFocusTrap<HTMLDivElement>(showEnrollModal);

  // Initial load of learning tracks and employees from backend
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
        // Local state fallback
      });

    employeesApi
      .getAll()
      .then((res) => {
        if (isMounted && res.data && res.data.length > 0) {
          setEmployees(res.data);
          setSelectedEmpName(res.data[0].name);
        }
      })
      .catch(() => {
        // Local state fallback
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const activeTrack: LearningTrack = useMemo(() => {
    return tracks.find((t) => t.id === selectedTrackId) || tracks[0] || INITIAL_TRACKS[0];
  }, [tracks, selectedTrackId]);

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEnrolling(true);
    const matchedEmp = employees.find((emp) => emp.name === selectedEmpName);
    const empAvatar =
      matchedEmp?.avatar ||
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80';

    try {
      await trainingApi.enroll(activeTrack.id, selectedEmpName);
    } catch {
      // Local mode fallback
    } finally {
      setTracks((prev) =>
        prev.map((t) =>
          t.id === activeTrack.id
            ? {
                ...t,
                enrolledCount: t.enrolledCount + 1,
                enrolledEmployees: [
                  ...t.enrolledEmployees,
                  {
                    name: selectedEmpName,
                    avatar: empAvatar,
                    progress: 0,
                  },
                ],
              }
            : t
        )
      );
      setIsEnrolling(false);
      setShowEnrollModal(false);
      showToast(`¡Listo! ${selectedEmpName} matriculado en "${activeTrack.title}".`, 'success');
    }
  };

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    tracks.forEach((t) => {
      if (t.category) set.add(t.category.trim());
    });
    return Array.from(set).sort();
  }, [tracks]);

  const filteredTracks = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return tracks.filter((t) => {
      const matchCat = selectedCategory === 'all' || t.category === selectedCategory;
      const matchSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        (t.technicalTitle && t.technicalTitle.toLowerCase().includes(q)) ||
        t.provider.toLowerCase().includes(q) ||
        t.gapTarget.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [tracks, selectedCategory, searchQuery]);

  // Dynamic calculated metrics
  const totalHours = useMemo(() => {
    return tracks.reduce((acc, t) => acc + (t.hours || 0), 0);
  }, [tracks]);

  const totalEnrolled = useMemo(() => {
    return tracks.reduce((acc, t) => acc + (t.enrolledCount || 0), 0);
  }, [tracks]);

  const avgCompletionRate = useMemo(() => {
    if (tracks.length === 0) return 0;
    const sum = tracks.reduce((acc, t) => acc + (t.completionRate || 0), 0);
    return Math.round(sum / tracks.length);
  }, [tracks]);

  const totalCertifications = useMemo(() => {
    return tracks.filter((t) => t.certification && t.certification.length > 0).length;
  }, [tracks]);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-5 flex flex-col gap-6 max-w-7xl mx-auto pb-20">
      {/* Header & Global Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight">
            Capacitación y Formación
          </h1>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">
            {tracks.length} rutas formativas y programas de desarrollo profesional
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={() => setShowEnrollModal(true)}
            size="sm"
            className="w-full sm:w-auto"
          >
            <UserPlus className="w-3.5 h-3.5 mr-1.5" />
            <span>Inscribir Colaborador</span>
          </Button>
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

      {/* Minimalist 4-Metric Status Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-3.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-on-surface-variant font-medium">Horas de formación</span>
            <Clock className="w-3.5 h-3.5 text-outline" />
          </div>
          <div className="text-xl font-bold text-on-surface">
            {totalHours}{' '}
            <span className="text-xs font-normal text-outline">hrs lectivas</span>
          </div>
        </Card>

        <Card className="p-3.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-on-surface-variant font-medium">Alumnos asignados</span>
            <Users className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="text-xl font-bold text-primary">
            {totalEnrolled}{' '}
            <span className="text-xs font-normal text-outline">colaboradores</span>
          </div>
        </Card>

        <Card className="p-3.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-on-surface-variant font-medium">Tasa de finalización</span>
            <TrendingUp className="w-3.5 h-3.5 text-secondary" />
          </div>
          <div className="text-xl font-bold text-secondary">
            {avgCompletionRate}%{' '}
            <span className="text-xs font-normal text-outline">promedio</span>
          </div>
        </Card>

        <Card className="p-3.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-on-surface-variant font-medium">Certificaciones oficiales</span>
            <Award className="w-3.5 h-3.5 text-outline" />
          </div>
          <div className="text-xl font-bold text-on-surface">
            {totalCertifications}{' '}
            <span className="text-xs font-normal text-outline">acreditadas</span>
          </div>
        </Card>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-bright p-3 rounded-xl border border-outline-variant/60 shadow-2xs">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar programa o competencia..."
            className="pl-8 text-xs h-8"
          />
        </div>

        {/* Dynamic Category Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-primary text-on-primary shadow-2xs font-semibold'
                : 'bg-surface-dim text-on-surface-variant hover:bg-surface-dim'
            }`}
          >
            Todas ({tracks.length})
          </button>
          {availableCategories.map((cat) => {
            const count = tracks.filter((t) => t.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-primary text-on-primary shadow-2xs font-semibold'
                    : 'bg-surface-dim text-on-surface-variant hover:bg-surface-dim'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Catalog on left (7 cols), Track detail on right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-outline" />
              Catálogo de rutas formativas activas
            </h2>
            <span className="text-xs text-outline font-normal">
              {filteredTracks.length} programas disponibles
            </span>
          </div>

          {filteredTracks.length === 0 ? (
            <EmptyState
              icon="school"
              title="No se encontraron programas de formación"
              description="No hay rutas formativas que coincidan con los criterios de búsqueda o categoría."
              actionLabel="Ver todos los programas"
              onAction={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            />
          ) : (
            <div className="space-y-3">
              {filteredTracks.map((track) => {
                const isSelected = activeTrack.id === track.id;
                return (
                  <div
                    key={track.id}
                    onClick={() => setSelectedTrackId(track.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-2.5 ${
                      isSelected
                        ? 'bg-surface-bright border-primary ring-1 ring-primary/30 shadow-xs'
                        : 'bg-surface-bright hover:bg-surface-dim border-outline-variant/60 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-xs">
                          <Badge variant="subtle" className="text-[10px] font-semibold">
                            {track.category}
                          </Badge>
                          <span className="text-outline/40">&bull;</span>
                          <span className="text-outline text-[11px] font-normal">{track.level}</span>
                        </div>
                        <h3 className="text-sm font-semibold text-on-surface mt-1 truncate">
                          {track.title}
                        </h3>
                        {track.technicalTitle && (
                          <p className="text-xs text-outline truncate mt-0.5">{track.technicalTitle}</p>
                        )}
                        <p className="text-xs text-on-surface-variant mt-0.5 truncate">{track.provider}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-base font-bold text-primary">{track.hours} hrs</span>
                        <span className="block text-[10px] text-outline font-normal">Carga horaria</span>
                      </div>
                    </div>

                    <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2">
                      {track.description}
                    </p>

                    <div className="p-2.5 bg-surface-dim rounded-lg border border-outline-variant/40 text-xs text-on-surface-variant font-medium flex items-center gap-2">
                      <Target className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">{track.gapTarget}</span>
                    </div>

                    {/* Progress and Enrolled */}
                    <div className="flex items-center justify-between pt-2 border-t border-outline-variant/40 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-outline font-normal">Inscritos:</span>
                        <div className="flex -space-x-1.5">
                          {track.enrolledEmployees.map((emp, i) => (
                            <UserAvatar
                              key={i}
                              name={emp.name}
                              size="xs"
                              shape="circle"
                              className="ring-2 ring-surface-bright"
                            />
                          ))}
                        </div>
                        <span className="text-xs font-semibold text-on-surface">
                          {track.enrolledCount} colaboradores
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-outline">Finalización:</span>
                        <span className="font-semibold text-secondary">
                          {track.completionRate}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Track Deep Dive Inspector (Sticky) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <Card className="p-5 sticky top-6 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <Badge variant="secondary" className="text-[10px]">
                {activeTrack.level}
              </Badge>
              <span className="text-xs text-outline font-medium">
                {activeTrack.hours} Horas Lectivas
              </span>
            </div>

            <h3 className="text-base font-bold text-on-surface leading-snug">{activeTrack.title}</h3>
            {activeTrack.technicalTitle && (
              <p className="text-xs text-on-surface-variant mt-0.5">{activeTrack.technicalTitle}</p>
            )}
            <p className="text-xs text-primary font-medium mt-1">{activeTrack.provider}</p>

            <div className="p-3 bg-surface-dim rounded-xl my-4 text-xs space-y-2 border border-outline-variant/40">
              <div className="flex justify-between items-center">
                <span className="text-outline">Certificación:</span>
                <span className="font-semibold text-on-surface text-right truncate max-w-[200px]">
                  {activeTrack.certification}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-outline">Alumnos en curso:</span>
                <span className="font-semibold text-primary">{activeTrack.enrolledCount} colaboradores</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-outline">Finalización promedio:</span>
                <span className="font-semibold text-secondary">{activeTrack.completionRate}%</span>
              </div>
            </div>

            <h4 className="text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5">
              Objetivo del programa
            </h4>
            <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
              {activeTrack.description}
            </p>

            <h4 className="text-xs font-semibold text-on-surface uppercase tracking-wider mb-2">
              Colaboradores destacados matriculados
            </h4>
            <div className="space-y-2 mb-5 max-h-56 overflow-y-auto pr-1">
              {activeTrack.enrolledEmployees.length === 0 ? (
                <div className="p-3 text-center bg-surface-dim rounded-xl text-xs text-outline">
                  Aún no hay colaboradores matriculados en esta ruta.
                </div>
              ) : (
                activeTrack.enrolledEmployees.map((emp, idx) => {
                  const empRecord = employees.find((e) => e.name === emp.name);
                  return (
                    <div
                      key={idx}
                      className="p-2.5 bg-surface-dim rounded-xl flex items-center justify-between text-xs border border-outline-variant/40"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <UserAvatar name={emp.name} size="sm" shape="rounded" />
                        <div className="min-w-0">
                          {empRecord && onSelectEmployee ? (
                            <button
                              type="button"
                              onClick={() => onSelectEmployee(empRecord.id)}
                              className="font-semibold text-on-surface hover:text-primary transition-colors text-left block truncate cursor-pointer"
                              title="Ver ficha 360° del colaborador"
                            >
                              {emp.name}
                            </button>
                          ) : (
                            <span className="font-semibold text-on-surface block truncate">{emp.name}</span>
                          )}
                          <span className="text-[10px] text-outline">En progreso</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-semibold text-primary">{emp.progress}%</span>
                        <div className="w-16 h-1.5 bg-outline-variant rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${emp.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={() => setShowEnrollModal(true)}
                className="w-full"
                size="sm"
              >
                <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                <span>Asignar a un Colaborador</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  try {
                    const content = JSON.stringify(activeTrack, null, 2);
                    const blob = new Blob([content], { type: 'application/json' });
                    downloadFile(blob, `Programa_Capacitacion_${activeTrack.id}_${Date.now()}.json`);
                    showToast(`Programa de "${activeTrack.title}" descargado exitosamente.`, 'success');
                  } catch {
                    showToast('Contenido del curso descargado.', 'info');
                  }
                }}
                className="w-full"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                <span>Descargar Programa Completo</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal Inscribir Colaborador */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 bg-on-surface/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            ref={enrollModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="enroll-training-title"
            className="bg-surface-bright max-w-md w-full rounded-2xl p-6 shadow-2xl border border-outline-variant/60 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-outline-variant/40">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-fixed text-primary flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h3 id="enroll-training-title" className="text-sm font-bold text-on-surface">
                    Asignar Capacitación
                  </h3>
                  <span className="text-[11px] text-outline">Inscripción directa a programa oficial</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEnrollModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-surface-dim flex items-center justify-center text-outline hover:text-on-surface-variant cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEnroll} className="flex flex-col gap-4 text-xs">
              <div>
                <label className="font-semibold text-on-surface-variant block mb-1">Ruta Formativa:</label>
                <div className="p-2.5 bg-surface-dim rounded-xl font-semibold text-primary border border-outline-variant/40">
                  {activeTrack.title}
                </div>
              </div>

              <div>
                <label className="font-semibold text-on-surface-variant block mb-1">
                  Seleccionar Colaborador:
                </label>
                <select
                  value={selectedEmpName}
                  onChange={(e) => setSelectedEmpName(e.target.value)}
                  className="w-full p-2.5 bg-surface-dim rounded-xl border border-outline-variant/60 text-on-surface outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.name}>
                      {emp.name} &bull; {emp.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-on-surface-variant block mb-1">
                  Fecha Límite Sugerida:
                </label>
                <input
                  type="date"
                  defaultValue="2026-12-15"
                  className="w-full p-2.5 bg-surface-dim rounded-xl border border-outline-variant/60 text-on-surface outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="p-3 bg-surface-dim rounded-xl text-on-surface-variant text-xs border border-outline-variant/40 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>El colaborador recibirá un correo automático con credenciales y fechas de inicio.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/40">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEnrollModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isEnrolling}
                >
                  {isEnrolling ? 'Inscribiendo...' : 'Confirmar Inscripción'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
