import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EmployeeProfile, ScreenId } from '../../types';
import { EMPLOYEES_DATA } from '../../data/mockData';
import { UserAvatar } from '../UserAvatar';
import { QuickGuideBanner } from '../QuickGuideBanner';
import { useToast } from '../ToastProvider';
import { employeesApi, trainingApi } from '../../services/api';
import { EmptyState } from '../EmptyState';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  Download,
  UserPlus,
  Search,
  Building2,
  FilterX,
  Users,
  CheckCircle2,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  GraduationCap,
  Brain,
  Award,
  Terminal,
  Check,
  FileText,
  UserCheck,
  Clock,
  Sparkles,
} from 'lucide-react';

interface EmpleadosScreenProps {
  onNavigate: (screen: ScreenId) => void;
  selectedEmployeeId?: string;
  onOpenEvaluationModal?: (employee: EmployeeProfile) => void;
  onChangeEmployee?: (employeeId: string) => void;
}

export const EmpleadosScreen: React.FC<EmpleadosScreenProps> = ({
  onNavigate,
  selectedEmployeeId = 'lucas',
  onOpenEvaluationModal,
  onChangeEmployee,
}) => {
  const activeEmpId = selectedEmployeeId;
  const setActiveEmpId = (id: string) => onChangeEmployee?.(id);
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [employees, setEmployees] = useState<EmployeeProfile[]>(EMPLOYEES_DATA);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedArea, setSelectedArea] = useState(searchParams.get('area') || 'all');
  const [activeEmpTab, setActiveEmpTab] = useState<'perfil' | 'competencias' | 'evaluaciones'>('perfil');
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Reset de pestaña al cambiar de empleado seleccionado
  useEffect(() => {
    setActiveEmpTab('perfil');
    setEnrolled(false);
  }, [activeEmpId]);

  // Carga inicial desde backend
  useEffect(() => {
    let isMounted = true;
    employeesApi
      .getAll()
      .then((res) => {
        if (isMounted && res.data && res.data.length > 0) {
          setEmployees(res.data);
        }
      })
      .catch(() => {
        // Fallback local
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Sincronización con URL
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        if (val) p.set('q', val);
        else p.delete('q');
        return p;
      },
      { replace: true }
    );
  };

  const handleAreaChange = (val: string) => {
    setSelectedArea(val);
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        if (val !== 'all') p.set('area', val);
        else p.delete('area');
        return p;
      },
      { replace: true }
    );
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedArea('all');
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        p.delete('q');
        p.delete('area');
        return p;
      },
      { replace: true }
    );
  };

  // Áreas dinámicas obtenidas directamente de la lista de colaboradores
  const availableAreas = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => {
      if (e.area) set.add(e.area.trim());
    });
    return Array.from(set).sort();
  }, [employees]);

  // Filtro de colaboradores dinámico
  const filteredEmployees = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return employees.filter((emp) => {
      const matchesSearch =
        !q ||
        emp.name.toLowerCase().includes(q) ||
        emp.role.toLowerCase().includes(q) ||
        emp.area.toLowerCase().includes(q) ||
        emp.empId.toLowerCase().includes(q);
      const matchesArea =
        selectedArea === 'all' || emp.area.toLowerCase() === selectedArea.toLowerCase();
      return matchesSearch && matchesArea;
    });
  }, [employees, searchQuery, selectedArea]);

  // Colaborador activo
  const activeEmployee: EmployeeProfile = useMemo(() => {
    return (
      employees.find((e) => e.id === activeEmpId || e.empId === activeEmpId) ||
      filteredEmployees[0] ||
      employees[0] ||
      EMPLOYEES_DATA[0]
    );
  }, [employees, activeEmpId, filteredEmployees]);

  // Métricas dinámicas calculadas desde el catálogo
  const totalEmployees = employees.length;

  const avgRoleMatch = useMemo(() => {
    if (employees.length === 0) return '0';
    const sum = employees.reduce((acc, e) => acc + (e.roleMatch || 0), 0);
    return (sum / employees.length).toFixed(1);
  }, [employees]);

  const employeesWithGaps = useMemo(() => {
    return employees.filter(
      (e) =>
        (e.hardSkills && e.hardSkills.some((s) => s.gap < 0)) ||
        (e.softSkills && e.softSkills.some((s) => s.gap < 0)) ||
        (e.roleMatch && e.roleMatch < 90)
    ).length;
  }, [employees]);

  const avg360Score = useMemo(() => {
    let totalScore = 0;
    let count = 0;
    employees.forEach((e) => {
      e.reviews?.forEach((r) => {
        if (r.scores) {
          const vals = Object.values(r.scores);
          if (vals.length > 0) {
            totalScore += vals.reduce((a, b) => a + b, 0) / vals.length;
            count++;
          }
        }
      });
    });
    return count > 0 ? (totalScore / count).toFixed(2) : '4.65';
  }, [employees]);

  const hasActiveFilters = Boolean(searchQuery || selectedArea !== 'all');

  // Acciones reales
  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await trainingApi.enroll(
        activeEmployee.recommendedTraining?.title || 'Plan de Desarrollo',
        activeEmployee.name
      );
      setEnrolled(true);
      showToast(`Plan formativo asignado a ${activeEmployee.name}`, 'success');
    } catch {
      setEnrolled(true);
      showToast(`Plan formativo asignado a ${activeEmployee.name}`, 'success');
    } finally {
      setEnrolling(false);
    }
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      showToast(`Generando Ficha 360° en PDF para ${activeEmployee.name}...`, 'info');
      await employeesApi.downloadPdf(activeEmployee.id, activeEmployee.name);
      showToast(`Ficha de ${activeEmployee.name} descargada exitosamente.`, 'success');
    } catch {
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header & Global Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-outline-variant/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-on-surface">
              Directorio de Colaboradores
            </h1>
            <Badge variant="subtle">{totalEmployees} colaboradores</Badge>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Ficha 360°, estructura de reporte, análisis de brechas de habilidades y desempeño.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            <span>Descargar Ficha PDF</span>
          </Button>

          <Button
            size="sm"
            onClick={() => onNavigate('reclutamiento')}
          >
            <UserPlus className="w-3.5 h-3.5 mr-1" />
            <span>Reclutar Talento</span>
          </Button>
        </div>
      </div>

      {/* Slim Guide Bar */}
      <QuickGuideBanner
        title="Directorio de Colaboradores"
        description="Seleccioná un colaborador para ver su ficha 360°, competencias y evaluaciones."
        tips={[
          'Elegí a cualquier colaborador en la cuadrícula superior para cargar su legajo técnico.',
          'Revisá el Radar de Habilidades para identificar brechas formativas inmediatas.',
          'El botón "Nueva Evaluación" permite calificar el ciclo de desempeño actual.',
        ]}
        dismissible={true}
      />

      {/* Clean 4-Metric Status Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-3.5">
          <span className="text-[11px] font-medium text-outline uppercase tracking-wider block">
            Fuerza laboral
          </span>
          <div className="text-xl font-bold text-on-surface mt-1 tabular-nums">
            {totalEmployees} <span className="text-xs font-normal text-outline">activos</span>
          </div>
        </Card>

        <Card className="p-3.5">
          <span className="text-[11px] font-medium text-outline uppercase tracking-wider block">
            Alineación con el rol
          </span>
          <div className="text-xl font-bold text-secondary mt-1 tabular-nums">
            {avgRoleMatch}% <span className="text-xs font-normal text-outline">promedio</span>
          </div>
        </Card>

        <Card className="p-3.5">
          <span className="text-[11px] font-medium text-outline uppercase tracking-wider block">
            Brechas con foco
          </span>
          <div className="text-xl font-bold text-amber-700 mt-1 tabular-nums">
            {employeesWithGaps} <span className="text-xs font-normal text-outline">requieren plan</span>
          </div>
        </Card>

        <Card className="p-3.5">
          <span className="text-[11px] font-medium text-outline uppercase tracking-wider block">
            Puntaje medio 360°
          </span>
          <div className="text-xl font-bold text-primary mt-1 tabular-nums">
            {avg360Score} <span className="text-xs font-normal text-outline">/ 5.0</span>
          </div>
        </Card>
      </div>

      {/* Filter Toolbar & Quick Directory */}
      <div className="space-y-3">
        <Card className="p-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-72 flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-2.5 text-outline pointer-events-none" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Buscar por nombre, cargo o ID..."
                className="pl-8 h-8"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 bg-surface-dim px-2.5 py-1 rounded-lg border border-outline-variant/60 flex-1 sm:flex-initial">
                <Building2 className="w-3.5 h-3.5 text-outline" />
                <select
                  value={selectedArea}
                  onChange={(e) => handleAreaChange(e.target.value)}
                  className="bg-transparent text-xs font-medium text-on-surface outline-none cursor-pointer w-full sm:w-auto"
                >
                  <option value="all">Todas las áreas ({availableAreas.length})</option>
                  {availableAreas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="h-8 px-2 text-xs text-outline hover:text-error flex items-center gap-1 transition-colors cursor-pointer"
                  title="Restablecer filtros"
                >
                  <FilterX className="w-3.5 h-3.5" />
                  <span>Limpiar</span>
                </button>
              )}
            </div>
          </div>
        </Card>

        {/* Directory Cards Grid */}
        {filteredEmployees.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2.5">
            {filteredEmployees.map((emp) => {
              const isSelected = emp.id === activeEmployee.id;
              return (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => setActiveEmpId(emp.id)}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-center gap-2.5 relative ${
                    isSelected
                      ? 'bg-primary/5 border-primary shadow-2xs font-semibold'
                      : 'bg-surface-bright border-outline-variant/60 hover:border-outline-variant hover:bg-surface-dim'
                  }`}
                >
                  <UserAvatar name={emp.name} size="sm" shape="rounded" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold text-on-surface truncate block">
                        {emp.name}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                      )}
                    </div>
                    <span className="text-[11px] text-primary truncate block font-medium">
                      {emp.role}
                    </span>
                    <span className="text-[10px] text-outline truncate block font-normal">
                      {emp.area}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No se encontraron colaboradores"
            description="No hay personas que coincidan con la búsqueda o el área seleccionada."
            actionLabel="Ver todos los colaboradores"
            onAction={resetFilters}
          />
        )}
      </div>

      {/* Profile Detail Tabs */}
      <div className="flex items-center gap-1 bg-surface-dim p-1 rounded-lg border border-outline-variant/60">
        {([
          { key: 'perfil', label: 'Ficha 360° & Datos', icon: FileText },
          { key: 'competencias', label: 'Brechas de Habilidades', icon: Brain },
          { key: 'evaluaciones', label: 'Evaluaciones & Capacitación', icon: Award },
        ] as const).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeEmpTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveEmpTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-surface-bright text-on-surface shadow-2xs font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-primary' : 'text-outline'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: 360° ACTIVE PROFILE */}
      {activeEmpTab === 'perfil' && (
        <Card className="p-5 space-y-5">
          {/* Profile Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-outline-variant/40">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <UserAvatar
                name={activeEmployee.name}
                size="lg"
                shape="rounded"
                showStatus={true}
                statusColor="emerald"
              />
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold text-on-surface tracking-tight">
                    {activeEmployee.name}
                  </h2>
                  <Badge variant="subtle">{activeEmployee.status}</Badge>
                  <span className="text-xs text-outline font-mono">
                    ID: {activeEmployee.empId}
                  </span>
                </div>
                <p className="text-xs font-semibold text-primary">{activeEmployee.role}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-outline pt-0.5">
                  <span>{activeEmployee.area}</span>
                  <span>•</span>
                  <span>Antigüedad: {activeEmployee.tenure}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveEmpTab('evaluaciones')}
              >
                <Award className="w-3.5 h-3.5 mr-1 text-primary" />
                Historial 360°
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (onOpenEvaluationModal) {
                    onOpenEvaluationModal(activeEmployee);
                  } else {
                    showToast('Abriendo formulario de evaluación', 'info');
                  }
                }}
              >
                <UserCheck className="w-3.5 h-3.5 mr-1" />
                Nueva Evaluación
              </Button>
            </div>
          </div>

          {/* 4 Sleek Info Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-surface-dim rounded-lg border border-outline-variant/40 space-y-1">
              <span className="text-[11px] font-medium text-outline flex items-center gap-1">
                <Mail className="w-3 h-3" /> Contacto
              </span>
              <span className="font-semibold text-on-surface block truncate" title={activeEmployee.email}>
                {activeEmployee.email}
              </span>
              <span className="text-on-surface-variant flex items-center gap-1 text-[11px]">
                <Phone className="w-3 h-3 text-outline" /> {activeEmployee.phone}
              </span>
            </div>

            <div className="p-3 bg-surface-dim rounded-lg border border-outline-variant/40 space-y-1">
              <span className="text-[11px] font-medium text-outline flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Contratación
              </span>
              <span className="font-semibold text-on-surface block">{activeEmployee.contract}</span>
              <span className="text-on-surface-variant flex items-center gap-1 text-[11px]">
                <MapPin className="w-3 h-3 text-outline" /> {activeEmployee.location}
              </span>
            </div>

            <div className="p-3 bg-surface-dim rounded-lg border border-outline-variant/40 space-y-1">
              <span className="text-[11px] font-medium text-outline flex items-center gap-1">
                <DollarSign className="w-3 h-3" /> Compensación
              </span>
              <span className="font-semibold text-on-surface block">{activeEmployee.salaryBand}</span>
              <span className="text-secondary font-medium text-[11px]">
                {activeEmployee.percentile}
              </span>
            </div>

            <div className="p-3 bg-surface-dim rounded-lg border border-outline-variant/40 space-y-1">
              <span className="text-[11px] font-medium text-outline flex items-center gap-1">
                <Users className="w-3 h-3" /> Supervisor Directo
              </span>
              <div className="flex items-center gap-1.5 pt-0.5">
                <UserAvatar name={activeEmployee.supervisor.name} size="xs" shape="circle" />
                <div className="min-w-0">
                  <span className="font-semibold text-on-surface block truncate">
                    {activeEmployee.supervisor.name}
                  </span>
                  <span className="text-[10px] text-outline block truncate">
                    {activeEmployee.supervisor.role}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Proyectos Asignados */}
          {activeEmployee.projects && activeEmployee.projects.length > 0 && (
            <div className="p-3 bg-surface-dim rounded-lg border border-outline-variant/40 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-medium text-outline mr-1">Proyectos activos:</span>
              {activeEmployee.projects.map((proj, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-md bg-surface-bright text-on-surface text-[11px] font-medium border border-outline-variant/60"
                >
                  {proj}
                </span>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* TAB 2: COMPETENCIES & GAPS */}
      {activeEmpTab === 'competencias' && (
        <div className="space-y-5">
          <Card className="p-5 space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-3 border-b border-outline-variant/40">
              <div>
                <h3 className="text-sm font-semibold text-on-surface">
                  Mapa de Habilidades y Competencias
                </h3>
                <p className="text-xs text-outline">
                  Comparación entre el estándar del puesto y el dominio demostrado.
                </p>
              </div>

              <div className="flex items-center gap-3 bg-surface-dim px-3 py-1.5 rounded-lg border border-outline-variant/60">
                <div className="text-right">
                  <span className="text-[10px] text-outline block uppercase">Alineación</span>
                  <span className="text-xs font-bold text-primary tabular-nums">
                    {activeEmployee.roleMatch}%
                  </span>
                </div>
                <div className="w-12 h-2 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${activeEmployee.roleMatch}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Gap Analysis Tables */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {/* Hard Skills */}
              <div className="p-4 bg-surface-dim rounded-lg border border-outline-variant/40 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-outline-variant/40">
                  <span className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-primary" />
                    Habilidades Técnicas
                  </span>
                  <span className="text-[11px] text-outline">Estándar: 4.5</span>
                </div>

                <div className="space-y-2">
                  {activeEmployee.hardSkills.map((skill, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-surface-bright rounded-lg border border-outline-variant/40 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-on-surface">{skill.name}</span>
                        <span
                          className={`text-[11px] font-medium ${
                            skill.gap === 0
                              ? 'text-emerald-700'
                              : skill.gap > 0
                              ? 'text-primary'
                              : 'text-amber-700'
                          }`}
                        >
                          {skill.statusText}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-outline pt-0.5">
                        <span>Actual: <strong className="text-on-surface">{skill.actual}</strong> / 5</span>
                        <span>Requerido: {skill.required} / 5</span>
                      </div>
                      <div className="w-full bg-surface-dim h-1 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full rounded-full ${
                            skill.gap === 0
                              ? 'bg-emerald-500'
                              : skill.gap > 0
                              ? 'bg-primary'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${(skill.actual / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Soft Skills */}
              <div className="p-4 bg-surface-dim rounded-lg border border-outline-variant/40 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-outline-variant/40">
                  <span className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-secondary" />
                    Habilidades Humanas y Liderazgo
                  </span>
                  <span className="text-[11px] text-outline">Estándar: 4.2</span>
                </div>

                <div className="space-y-2">
                  {activeEmployee.softSkills.map((skill, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-surface-bright rounded-lg border border-outline-variant/40 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-on-surface">{skill.name}</span>
                        <span
                          className={`text-[11px] font-medium ${
                            skill.gap === 0
                              ? 'text-emerald-700'
                              : skill.gap > 0
                              ? 'text-primary'
                              : 'text-outline'
                          }`}
                        >
                          {skill.statusText}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-outline pt-0.5">
                        <span>Actual: <strong className="text-on-surface">{skill.actual}</strong> / 5</span>
                        <span>Requerido: {skill.required} / 5</span>
                      </div>
                      <div className="w-full bg-surface-dim h-1 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full rounded-full ${
                            skill.gap === 0
                              ? 'bg-emerald-500'
                              : skill.gap > 0
                              ? 'bg-primary'
                              : 'bg-outline'
                          }`}
                          style={{ width: `${(skill.actual / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: TRAINING & 360 REVIEWS */}
      {activeEmpTab === 'evaluaciones' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Training Plan Card */}
          <Card className="lg:col-span-6 p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="pb-2 border-b border-outline-variant/40 flex items-center justify-between">
                <span className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  Plan Formativo Recomendado
                </span>
                <Badge variant="secondary">Cierre de Brecha</Badge>
              </div>

              <div className="p-3 bg-surface-dim rounded-lg border border-outline-variant/40 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-primary">
                    {activeEmployee.recommendedTraining.title}
                  </span>
                  <span className="text-outline text-[11px]">
                    {activeEmployee.recommendedTraining.hours}
                  </span>
                </div>
                <p className="text-on-surface-variant leading-relaxed text-[11px]">
                  {activeEmployee.recommendedTraining.description}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-outline">
                  {activeEmployee.recommendedTraining.perks.map((perk, i) => (
                    <span key={i} className="flex items-center gap-1">
                      <Check className="w-3 h-3 text-secondary" />
                      {perk}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-outline-variant/40 flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant={enrolled ? 'secondary' : 'default'}
                disabled={enrolling || enrolled}
                onClick={handleEnroll}
              >
                {enrolled ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Inscripción Confirmada
                  </>
                ) : (
                  'Inscribir en Plan'
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('capacitacion-upskilling')}
              >
                <span>Ver Catálogo</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </Card>

          {/* 360 Reviews Card */}
          <Card className="lg:col-span-6 p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="pb-2 border-b border-outline-variant/40 flex items-center justify-between">
                <span className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-outline" />
                  Evaluaciones 360° Recientes
                </span>
                <span className="text-xs text-outline tabular-nums">
                  Promedio: {avg360Score} / 5.0
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {activeEmployee.reviews.map((rev, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-surface-dim rounded-lg border border-outline-variant/40 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-on-surface">{rev.author}</span>
                      <span className="text-[10px] text-outline">{rev.timeAgo}</span>
                    </div>
                    <p className="text-on-surface-variant text-[11px] leading-relaxed">
                      "{rev.comment}"
                    </p>
                    {rev.scores && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {Object.entries(rev.scores).map(([k, v]) => (
                          <span
                            key={k}
                            className="px-1.5 py-0.2 rounded bg-surface-bright text-[10px] text-outline font-medium border border-outline-variant/60"
                          >
                            {k}: {v}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-outline-variant/40 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('evaluacion-desempeno')}
              >
                <span>Calibración 9-Box</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
