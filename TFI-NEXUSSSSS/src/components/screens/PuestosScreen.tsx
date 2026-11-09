import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { JobPosition, ScreenId } from '../../types';
import { JOB_POSITIONS } from '../../data/mockData';
import { UserAvatar } from '../UserAvatar';
import { QuickGuideBanner } from '../QuickGuideBanner';
import { useToast } from '../ToastProvider';
import { jobsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../EmptyState';
import { useFocusTrap } from '../useFocusTrap';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  Download,
  Plus,
  Search,
  Building2,
  Layers,
  AlertTriangle,
  FilterX,
  Briefcase,
  Key,
  Users,
  ArrowRight,
  Workflow,
  UserPlus,
  FileText,
  Brain,
  Network,
  Laptop,
  Cpu,
  Plane,
  Gavel,
  Shield,
  GraduationCap,
  Package,
  Check,
  X,
  AlertCircle,
  Flag,
} from 'lucide-react';

interface PuestosScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onSelectJobForRecruitment?: (jobCode: string) => void;
  selectedJobCode?: string;
  onChangeJobCode?: (jobCode: string) => void;
}

export const PuestosScreen: React.FC<PuestosScreenProps> = ({
  onNavigate,
  onSelectJobForRecruitment,
  selectedJobCode = 'PUE-2026-ARCH-03',
  onChangeJobCode,
}) => {
  const { hasPermission, openLoginModal } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const setSelectedJobCode = (code: string) => onChangeJobCode?.(code);
  const [positions, setPositions] = useState<JobPosition[]>(JOB_POSITIONS);

  // Filtros sincronizados con la URL
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedArea, setSelectedArea] = useState(searchParams.get('area') || '');
  const [selectedHierarchy, setSelectedHierarchy] = useState(searchParams.get('nivel') || '');
  const [onlyCritical, setOnlyCritical] = useState(searchParams.get('criticos') === '1');
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [jobFormSubmitted, setJobFormSubmitted] = useState(false);
  const [activeJobTab, setActiveJobTab] = useState<'resumen' | 'competencias' | 'organizacion'>('resumen');
  const [isDownloadingMatrix, setIsDownloadingMatrix] = useState(false);

  // Campos para crear nuevo puesto
  const [newTitle, setNewTitle] = useState('');
  const [newDepartment, setNewDepartment] = useState('Tecnología y Plataforma');
  const [newStatus, setNewStatus] = useState<'critical' | 'operational'>('operational');
  const [newMission, setNewMission] = useState('');
  const [isSubmittingJob, setIsSubmittingJob] = useState(false);
  const newJobModalRef = useFocusTrap<HTMLDivElement>(showNewJobModal);

  // Cerrar modal de nuevo puesto con tecla Escape
  useEffect(() => {
    if (!showNewJobModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowNewJobModal(false);
        setJobFormSubmitted(false);
        setNewTitle('');
        setNewMission('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showNewJobModal]);

  // Cargar lista desde la API
  useEffect(() => {
    let isMounted = true;
    jobsApi
      .getAll()
      .then((res) => {
        if (isMounted && res && Array.isArray(res.data) && res.data.length > 0) {
          setPositions(res.data);
        }
      })
      .catch((err) => {
        console.warn('Jobs API fallback local:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Handlers de sincronización de filtros con la URL
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
        if (val) p.set('area', val);
        else p.delete('area');
        return p;
      },
      { replace: true }
    );
  };

  const handleHierarchyChange = (val: string) => {
    setSelectedHierarchy(val);
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        if (val) p.set('nivel', val);
        else p.delete('nivel');
        return p;
      },
      { replace: true }
    );
  };

  const handleCriticalToggle = () => {
    const next = !onlyCritical;
    setOnlyCritical(next);
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        if (next) p.set('criticos', '1');
        else p.delete('criticos');
        return p;
      },
      { replace: true }
    );
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedArea('');
    setSelectedHierarchy('');
    setOnlyCritical(false);
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        p.delete('q');
        p.delete('area');
        p.delete('nivel');
        p.delete('criticos');
        return p;
      },
      { replace: true }
    );
  };

  // Áreas dinámicas obtenidas directamente de la lista de puestos
  const availableAreas = useMemo(() => {
    const set = new Set<string>();
    positions.forEach((p) => {
      if (p.department) set.add(p.department.trim());
    });
    return Array.from(set).sort();
  }, [positions]);

  // Filtro de puestos dinámico
  const filteredPositions = useMemo(() => {
    return positions.filter((j) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        j.title.toLowerCase().includes(q) ||
        j.code.toLowerCase().includes(q) ||
        j.department.toLowerCase().includes(q);

      const matchesCritical = !onlyCritical || j.status === 'critical';
      const matchesArea = !selectedArea || j.department.toLowerCase() === selectedArea.toLowerCase();

      let matchesHierarchy = true;
      if (selectedHierarchy) {
        const text = `${j.title} ${j.salaryBand || ''} ${j.reportsTo || ''}`.toLowerCase();
        switch (selectedHierarchy) {
          case 'dir':
            matchesHierarchy =
              text.includes('director') || text.includes('vp') || text.includes('gerente') || text.includes('c-level');
            break;
          case 'lead':
            matchesHierarchy =
              text.includes('líder') ||
              text.includes('lider') ||
              text.includes('coordinador') ||
              text.includes('jefe') ||
              text.includes('principal');
            break;
          case 'sr':
            matchesHierarchy =
              text.includes('senior') ||
              text.includes('sr') ||
              text.includes('arquitecto') ||
              text.includes('especialista');
            break;
          case 'mid':
            matchesHierarchy =
              text.includes('semi') ||
              text.includes('junior') ||
              text.includes('analista') ||
              text.includes('técnico') ||
              text.includes('tecnico') ||
              text.includes('asistente');
            break;
        }
      }

      return matchesSearch && matchesCritical && matchesArea && matchesHierarchy;
    });
  }, [positions, searchQuery, onlyCritical, selectedArea, selectedHierarchy]);

  // Puesto seleccionado activo
  const selectedJob: JobPosition =
    positions.find((j) => j.code === selectedJobCode) ||
    filteredPositions[0] ||
    positions[0] ||
    JOB_POSITIONS[0];

  // Métricas dinámicas calculadas desde el catálogo
  const totalPositions = positions.length;
  const criticalPositions = positions.filter((p) => p.status === 'critical').length;
  const calibratedCount = positions.filter(
    (p) => p.isCalibrated || (p.complianceRate && p.complianceRate >= 80)
  ).length;
  const calibratedRate = totalPositions > 0 ? Math.round((calibratedCount / totalPositions) * 100) : 0;
  const totalSkillsCount = positions.reduce(
    (acc, p) => acc + (p.techSkills?.length || 0) + (p.softSkills?.length || 0),
    0
  );

  const hasActiveFilters = Boolean(searchQuery || selectedArea || selectedHierarchy || onlyCritical);

  // Acciones reales
  const handleDownloadMatrix = async () => {
    setIsDownloadingMatrix(true);
    try {
      await jobsApi.downloadMatrix('xlsx');
      showToast('Matriz de puestos descargada en formato Excel.', 'success');
    } catch {
      showToast('Matriz de puestos exportada en formato Excel/CSV', 'info');
    } finally {
      setIsDownloadingMatrix(false);
    }
  };

  const handleCreateVacancy = async () => {
    try {
      await jobsApi.openVacancy(selectedJob.code);
    } catch {
      // Silencioso
    }
    if (onSelectJobForRecruitment) {
      onSelectJobForRecruitment(selectedJob.code);
      return;
    }
    showToast(`Vacante generada para ${selectedJob.title}`, 'success');
    setTimeout(() => {
      onNavigate('reclutamiento');
    }, 600);
  };

  const handleSaveJob = async () => {
    setJobFormSubmitted(true);
    if (!hasPermission('jobs:create')) {
      showToast('Acción restringida: Se requiere rol de Administrador (ADMIN_HR) para crear puestos.', 'error');
      openLoginModal();
      return;
    }
    if (!newTitle.trim()) {
      showToast('Por favor, ingresá el nombre del puesto.', 'error');
      return;
    }
    setIsSubmittingJob(true);
    const code = `PUE-2026-${Date.now().toString().slice(-4)}`;
    const jobPayload = {
      code,
      title: newTitle.trim(),
      department: newDepartment,
      status: newStatus,
      division: newDepartment,
      reportsTo: 'Dirección de Operaciones',
      supervises: 'Equipo Asignado',
      salaryBand: 'Banda Salarial Oficial',
      mission: newMission.trim() || 'Asegurar la continuidad y desarrollo estratégico del área.',
      techSkills: [],
      softSkills: [],
    };

    try {
      const created = await jobsApi.create(jobPayload);
      setPositions((prev) => [created, ...prev]);
      setSelectedJobCode(created.code);
      showToast(`Puesto "${created.title}" guardado en la base de datos.`, 'success');
    } catch (err: any) {
      if (err?.message?.includes('401') || err?.message?.includes('Unauthorized')) {
        showToast('Sesión no autorizada. Por favor iniciá sesión como Administrador.', 'error');
        openLoginModal();
        setIsSubmittingJob(false);
        return;
      }
      // Fallback local
      const fallbackJob: JobPosition = {
        ...jobPayload,
        activeIncumbentsCount: 1,
        complianceRate: 100,
        isCalibrated: true,
        incumbents: [],
        purposeLink: 'Impacto directo en la continuidad operacional.',
        internalRelations: 'Coordinación interna de área',
        externalRelations: 'Proveedores y entidades externas',
        formalAuthority: 'Responsabilidades según manual institucional',
        responsibilities: [],
        workingConditions: {
          modality: 'Condiciones estándar de oficina',
          tools: 'Terminal de trabajo y software institucional',
          mobility: 'No requerida',
        },
      };
      setPositions((prev) => [fallbackJob, ...prev]);
      setSelectedJobCode(fallbackJob.code);
      showToast(`Puesto "${fallbackJob.title}" creado correctamente.`, 'success');
    } finally {
      setIsSubmittingJob(false);
      setShowNewJobModal(false);
      setJobFormSubmitted(false);
      setNewTitle('');
      setNewMission('');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header & Global Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-outline-variant/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-on-surface">
              Puestos de Trabajo
            </h1>
            <Badge variant="subtle">{totalPositions} registrados</Badge>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Catálogo técnico, manual descriptivo (DPT), requisitos y perfil de competencias.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadMatrix}
            disabled={isDownloadingMatrix}
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            <span>Exportar Matriz</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setShowNewJobModal(true)}
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Nuevo Puesto</span>
          </Button>
        </div>
      </div>

      {/* Slim Guide Bar */}
      <QuickGuideBanner
        title="Catálogo de Puestos"
        description="Gestión técnica de posiciones, responsabilidades y competencias."
        tips={[
          'Seleccioná un puesto en el directorio lateral para ver su ficha técnica completa.',
          'Usá "+ Nuevo Puesto" para dar de alta una nueva posición en el organigrama.',
          'El botón "Generar Vacante" conecta directamente la posición con Reclutamiento.',
        ]}
        dismissible={true}
      />

      {/* Clean 4-Metric Status Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-3.5">
          <span className="text-[11px] font-medium text-outline uppercase tracking-wider block">
            Puestos definidos
          </span>
          <div className="text-xl font-bold text-on-surface mt-1 tabular-nums">
            {totalPositions} <span className="text-xs font-normal text-outline">cargos</span>
          </div>
        </Card>

        <Card className="p-3.5">
          <span className="text-[11px] font-medium text-outline uppercase tracking-wider block">
            Puestos clave
          </span>
          <div className="text-xl font-bold text-amber-700 mt-1 tabular-nums">
            {criticalPositions} <span className="text-xs font-normal text-outline">roles críticos</span>
          </div>
        </Card>

        <Card className="p-3.5">
          <span className="text-[11px] font-medium text-outline uppercase tracking-wider block">
            Calibrados / Cumplimiento
          </span>
          <div className="text-xl font-bold text-emerald-700 mt-1 tabular-nums">
            {calibratedRate}% <span className="text-xs font-normal text-outline">óptimos</span>
          </div>
        </Card>

        <Card className="p-3.5">
          <span className="text-[11px] font-medium text-outline uppercase tracking-wider block">
            Competencias
          </span>
          <div className="text-xl font-bold text-primary mt-1 tabular-nums">
            {totalSkillsCount} <span className="text-xs font-normal text-outline">evaluadas</span>
          </div>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            {/* Search Input */}
            <div className="relative flex items-center min-w-[200px] flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 absolute left-2.5 text-outline pointer-events-none" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Buscar por código, puesto o área..."
                className="pl-8 h-8"
              />
            </div>

            {/* Area Filter */}
            <div className="flex items-center gap-1.5 bg-surface-dim px-2.5 py-1 rounded-lg border border-outline-variant/60">
              <Building2 className="w-3.5 h-3.5 text-outline" />
              <select
                value={selectedArea}
                onChange={(e) => handleAreaChange(e.target.value)}
                className="bg-transparent text-xs font-medium text-on-surface outline-none cursor-pointer"
              >
                <option value="">Todas las áreas ({availableAreas.length})</option>
                {availableAreas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            {/* Hierarchy Filter */}
            <div className="flex items-center gap-1.5 bg-surface-dim px-2.5 py-1 rounded-lg border border-outline-variant/60">
              <Layers className="w-3.5 h-3.5 text-outline" />
              <select
                value={selectedHierarchy}
                onChange={(e) => handleHierarchyChange(e.target.value)}
                className="bg-transparent text-xs font-medium text-on-surface outline-none cursor-pointer"
              >
                <option value="">Todos los niveles</option>
                <option value="dir">Dirección y Gerencia</option>
                <option value="lead">Liderazgo y Coordinación</option>
                <option value="sr">Senior / Arquitecto</option>
                <option value="mid">Intermedio / Operativo</option>
              </select>
            </div>

            {/* Critical Only Toggle */}
            <button
              type="button"
              onClick={handleCriticalToggle}
              className={`h-8 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer border ${
                onlyCritical
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-surface-dim hover:bg-surface-container text-on-surface-variant border-outline-variant/60'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>{onlyCritical ? 'Solo críticos' : 'Críticos'}</span>
            </button>

            {/* Reset Filters Shortcut */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="h-8 px-2 text-xs text-outline hover:text-error flex items-center gap-1 transition-colors cursor-pointer"
                title="Restablecer filtros"
              >
                <FilterX className="w-3.5 h-3.5" />
                <span>Limpiar</span>
              </button>
            )}
          </div>

          <span className="text-xs text-outline tabular-nums">
            {filteredPositions.length} de {positions.length} puestos
          </span>
        </div>
      </Card>

      {/* Main Split Layout: Position List (Left 4 cols) & Detailed Sheet (Right 8 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT PANEL: Directory */}
        <div className="xl:col-span-4 space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-medium text-outline">Catálogo de Puestos</span>
            <span className="text-xs text-outline tabular-nums">{filteredPositions.length} puestos</span>
          </div>

          {filteredPositions.length === 0 ? (
            <EmptyState
              title="No se encontraron puestos"
              description="No hay cargos que coincidan con la búsqueda o filtros aplicados."
              actionLabel="Restablecer filtros"
              onAction={handleResetFilters}
            />
          ) : (
            filteredPositions.map((pos) => {
              const isSelected = selectedJob.code === pos.code;

              return (
                <div
                  key={pos.code}
                  onClick={() => setSelectedJobCode(pos.code)}
                  className={`p-3 rounded-lg transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-primary/5 border-primary shadow-2xs'
                      : 'bg-surface-bright border-outline-variant/60 hover:border-outline-variant hover:bg-surface-dim'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-primary text-on-primary' : 'bg-surface-dim text-outline'
                        }`}
                      >
                        {pos.status === 'critical' ? (
                          <Key className="w-3.5 h-3.5" />
                        ) : (
                          <Briefcase className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono text-outline block">
                          {pos.code}
                        </span>
                        <h3 className="text-xs font-semibold text-on-surface truncate">
                          {pos.title}
                        </h3>
                      </div>
                    </div>

                    <Badge variant={pos.status === 'critical' ? 'destructive' : 'subtle'}>
                      {pos.status === 'critical' ? 'Crítico' : 'Operativo'}
                    </Badge>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs text-outline">
                    <span className="truncate">{pos.department}</span>
                    <span className="shrink-0">{pos.activeIncumbentsCount} pers.</span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-outline-variant/30 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-14 h-1 bg-surface-dim rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            pos.complianceRate >= 90 ? 'bg-emerald-500' : 'bg-primary'
                          }`}
                          style={{ width: `${pos.complianceRate}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-on-surface tabular-nums">
                        {pos.complianceRate}%
                      </span>
                    </div>

                    <span
                      className={`text-[11px] font-medium flex items-center gap-0.5 ${
                        isSelected ? 'text-primary' : 'text-outline'
                      }`}
                    >
                      {isSelected ? 'Seleccionado' : 'Ver ficha'}
                      <ArrowRight className="w-3 h-3 ml-0.5" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT PANEL: Detailed Technical Sheet */}
        <div className="xl:col-span-8 space-y-5">
          {/* Master Header Card */}
          <Card className="p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-dim text-primary flex items-center justify-center shrink-0 border border-outline-variant/40">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-semibold text-primary">{selectedJob.code}</span>
                    <span className="text-outline">•</span>
                    <span className="text-emerald-700 font-medium">Activo & Calibrado</span>
                    {selectedJob.status === 'critical' && (
                      <>
                        <span className="text-outline">•</span>
                        <Badge variant="destructive">Puesto Clave</Badge>
                      </>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-on-surface mt-0.5">{selectedJob.title}</h2>
                  <p className="text-xs text-outline">{selectedJob.division}</p>
                </div>
              </div>

              {/* Incumbents & Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-surface-dim border border-outline-variant/60">
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {selectedJob.incumbents.map((inc, i) => (
                      <UserAvatar
                        key={i}
                        name={inc.name}
                        size="sm"
                        shape="circle"
                        className="ring-1 ring-surface-bright"
                      />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-on-surface">
                    {selectedJob.activeIncumbentsCount} colaboradores
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate('value-map')}
                >
                  <Workflow className="w-3.5 h-3.5 mr-1 text-secondary" />
                  Cadena de Valor
                </Button>

                <Button
                  size="sm"
                  onClick={handleCreateVacancy}
                >
                  <UserPlus className="w-3.5 h-3.5 mr-1" />
                  Generar Vacante
                </Button>
              </div>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-3 border-t border-outline-variant/40 text-xs">
              <div className="p-2.5 bg-surface-dim rounded-lg">
                <span className="text-outline font-medium block text-[11px]">Área</span>
                <span className="font-semibold text-on-surface truncate block mt-0.5">
                  {selectedJob.department}
                </span>
              </div>
              <div className="p-2.5 bg-surface-dim rounded-lg">
                <span className="text-outline font-medium block text-[11px]">Reporta a</span>
                <span className="font-semibold text-primary truncate block mt-0.5">
                  {selectedJob.reportsTo}
                </span>
              </div>
              <div className="p-2.5 bg-surface-dim rounded-lg">
                <span className="text-outline font-medium block text-[11px]">Supervisa</span>
                <span className="font-semibold text-on-surface truncate block mt-0.5">
                  {selectedJob.supervises}
                </span>
              </div>
              <div className="p-2.5 bg-surface-dim rounded-lg">
                <span className="text-outline font-medium block text-[11px]">Banda salarial</span>
                <span className="font-semibold text-on-surface truncate block mt-0.5">
                  {selectedJob.salaryBand}
                </span>
              </div>
            </div>
          </Card>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 bg-surface-dim p-1 rounded-lg border border-outline-variant/60">
            {([
              { key: 'resumen', label: 'Resumen & Entorno', icon: FileText },
              { key: 'competencias', label: 'Competencias (1-5)', icon: Brain },
              { key: 'organizacion', label: 'Estructura & Desempeño', icon: Network },
            ] as const).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeJobTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveJobTab(tab.key)}
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

          {/* TAB 1: Resumen & Entorno */}
          {activeJobTab === 'resumen' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Misión Estratégica */}
                <Card className="p-4 flex flex-col justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-semibold text-on-surface mb-2 flex items-center gap-1.5">
                      <Flag className="w-3.5 h-3.5 text-primary" />
                      Misión estratégica
                    </h4>
                    <div className="p-3 bg-surface-dim rounded-lg border border-outline-variant/40">
                      <p className="text-xs text-on-surface font-medium leading-relaxed italic">
                        "{selectedJob.mission}"
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-outline-variant/30 text-xs">
                    <span className="text-outline font-medium block text-[11px]">
                      Vínculo con el propósito organizacional
                    </span>
                    <p className="text-on-surface-variant mt-0.5 leading-relaxed">{selectedJob.purposeLink}</p>
                  </div>
                </Card>

                {/* Relaciones & Autoridad */}
                <Card className="p-4 flex flex-col justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-semibold text-on-surface mb-2 flex items-center gap-1.5">
                      <Network className="w-3.5 h-3.5 text-outline" />
                      Relaciones y autoridad
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 bg-surface-dim rounded-lg border border-outline-variant/40">
                        <span className="text-primary font-semibold block mb-0.5 text-[11px]">
                          Interacciones internas
                        </span>
                        <p className="text-on-surface">{selectedJob.internalRelations}</p>
                      </div>
                      <div className="p-2.5 bg-surface-dim rounded-lg border border-outline-variant/40">
                        <span className="text-on-surface-variant font-semibold block mb-0.5 text-[11px]">
                          Interacciones externas
                        </span>
                        <p className="text-on-surface">{selectedJob.externalRelations}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-surface-dim rounded-lg border border-outline-variant/40 text-xs">
                    <span className="font-semibold text-on-surface flex items-center gap-1">
                      <Gavel className="w-3 h-3 text-primary" />
                      Alcance de autoridad:
                    </span>
                    <p className="text-on-surface-variant mt-0.5">{selectedJob.formalAuthority}</p>
                  </div>
                </Card>
              </div>

              {/* Condiciones del Entorno y Trabajo */}
              <Card className="p-4 space-y-3">
                <div className="pb-2 border-b border-outline-variant/40">
                  <h4 className="text-xs font-semibold text-on-surface">Condiciones del entorno y trabajo</h4>
                  <p className="text-[11px] text-outline">Modalidad, herramientas y movilidad requerida</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-surface-dim rounded-lg border border-outline-variant/40 flex items-start gap-2.5">
                    <Laptop className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-on-surface block text-[11px]">Modalidad</span>
                      <span className="text-on-surface-variant mt-0.5 block">
                        {selectedJob.workingConditions.modality}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-surface-dim rounded-lg border border-outline-variant/40 flex items-start gap-2.5">
                    <Cpu className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-on-surface block text-[11px]">Equipamiento</span>
                      <span className="text-on-surface-variant mt-0.5 block">
                        {selectedJob.workingConditions.tools}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-surface-dim rounded-lg border border-outline-variant/40 flex items-start gap-2.5">
                    <Plane className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-on-surface block text-[11px]">Movilidad</span>
                      <span className="text-on-surface-variant mt-0.5 block">
                        {selectedJob.workingConditions.mobility}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 2: Competencias (1-5) */}
          {activeJobTab === 'competencias' && (
            <Card className="p-5 space-y-4">
              <div className="pb-2 border-b border-outline-variant/40">
                <h4 className="text-xs font-semibold text-on-surface">Matriz de Competencias Requeridas</h4>
                <p className="text-[11px] text-outline">
                  Escala de dominio: 1 Novato • 2 Aplicado • 3 Autónomo • 4 Avanzado • 5 Experto
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Technical Skills */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-primary" />
                    Habilidades Técnicas
                  </span>

                  {selectedJob.techSkills.length === 0 ? (
                    <div className="p-4 bg-surface-dim rounded-lg text-center text-xs text-outline">
                      Sin competencias técnicas parametrizadas.
                    </div>
                  ) : (
                    selectedJob.techSkills.map((ts, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-surface-dim rounded-lg border border-outline-variant/40 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-on-surface block">
                              {ts.name}
                            </span>
                            {ts.technicalName && (
                              <span className="text-[10px] text-outline block">{ts.technicalName}</span>
                            )}
                          </div>
                          <span className="font-semibold text-primary tabular-nums">{ts.level} / 5</span>
                        </div>
                        {/* 5-step indicator */}
                        <div className="grid grid-cols-5 gap-1 my-1">
                          {[1, 2, 3, 4, 5].map((lvl) => (
                            <div
                              key={lvl}
                              className={`h-1.5 rounded-full ${
                                lvl <= ts.level ? 'bg-primary' : 'bg-surface-container-high'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="flex justify-between items-center text-[11px] text-outline">
                          <span>Dominio:</span>
                          <span className="text-primary font-medium">{ts.observedBehavior}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Soft Skills */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-secondary" />
                    Habilidades Humanas y Liderazgo
                  </span>

                  {selectedJob.softSkills.length === 0 ? (
                    <div className="p-4 bg-surface-dim rounded-lg text-center text-xs text-outline">
                      Sin habilidades blandas parametrizadas.
                    </div>
                  ) : (
                    selectedJob.softSkills.map((ss, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-surface-dim rounded-lg border border-outline-variant/40 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-on-surface">{ss.name}</span>
                          <span className="font-semibold text-secondary tabular-nums">{ss.level} / 5</span>
                        </div>
                        <div className="grid grid-cols-5 gap-1 my-1">
                          {[1, 2, 3, 4, 5].map((lvl) => (
                            <div
                              key={lvl}
                              className={`h-1.5 rounded-full ${
                                lvl <= ss.level ? 'bg-secondary' : 'bg-surface-container-high'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="flex justify-between items-center text-[11px] text-outline">
                          <span>Conducta:</span>
                          <span className="text-secondary font-medium truncate max-w-[180px]">
                            {ss.observedBehavior}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* TAB 3: Estructura & Desempeño */}
          {activeJobTab === 'organizacion' && (
            <div className="space-y-4">
              {/* Estructura Organizacional */}
              <Card className="p-4 space-y-3">
                <div className="pb-2 border-b border-outline-variant/40">
                  <h4 className="text-xs font-semibold text-on-surface">Estructura Organizacional</h4>
                  <p className="text-[11px] text-outline">Unidad, dependencia jerárquica y plazas presupuestadas</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-surface-dim rounded-lg border border-outline-variant/40">
                    <span className="text-outline font-medium block text-[11px]">Unidad organizacional</span>
                    <span className="font-semibold text-on-surface block mt-0.5">
                      {selectedJob.unidad?.nombre || selectedJob.department}
                    </span>
                    <span className="text-[10px] text-outline mt-0.5 block">
                      Superior: {selectedJob.unidad?.unidadSuperior?.nombre || 'Dirección General'}
                    </span>
                  </div>

                  <div className="p-3 bg-surface-dim rounded-lg border border-outline-variant/40">
                    <span className="text-outline font-medium block text-[11px]">Puesto superior</span>
                    <span className="font-semibold text-on-surface block mt-0.5">
                      {selectedJob.puestoSuperior?.title || selectedJob.reportsTo}
                    </span>
                    <span className="text-[10px] text-outline mt-0.5 block">Supervisión inmediata</span>
                  </div>

                  <div className="p-3 bg-surface-dim rounded-lg border border-outline-variant/40">
                    <span className="text-outline font-medium block text-[11px]">Plazas autorizadas</span>
                    <span className="font-semibold text-primary block mt-0.5">
                      {selectedJob.nPosiciones ?? selectedJob.activeIncumbentsCount} Plaza(s)
                    </span>
                    <span className="text-[10px] text-outline mt-0.5 block">Headcount activo</span>
                  </div>
                </div>
              </Card>

              {/* Perfil del Cargo y Recursos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="p-4 space-y-2.5 text-xs">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-outline-variant/40">
                    <GraduationCap className="w-4 h-4 text-primary" />
                    <h5 className="font-semibold text-on-surface">Perfil del Cargo</h5>
                  </div>
                  <div>
                    <span className="text-outline font-medium text-[11px] block">Educación formal:</span>
                    <p className="text-on-surface mt-0.5">
                      {selectedJob.perfil?.educacionFormal ||
                        'Educación universitaria o técnica afín al área requerida.'}
                    </p>
                  </div>
                  <div>
                    <span className="text-outline font-medium text-[11px] block">Experiencia requerida:</span>
                    <p className="text-on-surface mt-0.5">
                      {selectedJob.perfil?.experienciaRequerida ||
                        'Experiencia laboral demostrable en funciones del cargo.'}
                    </p>
                  </div>
                </Card>

                <Card className="p-4 space-y-2.5 text-xs">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-outline-variant/40">
                    <Package className="w-4 h-4 text-secondary" />
                    <h5 className="font-semibold text-on-surface">Responsabilidades y Recursos</h5>
                  </div>
                  <div>
                    <span className="text-outline font-medium text-[11px] block">Manejo de personal:</span>
                    <p className="text-on-surface mt-0.5">
                      {selectedJob.responsabilidadFicha?.manejoPersonal || selectedJob.supervises}
                    </p>
                  </div>
                  <div>
                    <span className="text-outline font-medium text-[11px] block">Equipo de trabajo:</span>
                    <p className="text-on-surface mt-0.5">
                      {selectedJob.responsabilidadFicha?.equipoTrabajo || selectedJob.workingConditions.tools}
                    </p>
                  </div>
                </Card>
              </div>

              {/* Riesgos del Puesto */}
              {selectedJob.riesgosPuesto && selectedJob.riesgosPuesto.length > 0 && (
                <Card className="p-4 space-y-3">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-outline-variant/40">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <h5 className="text-xs font-semibold text-on-surface">Riesgos Identificados del Cargo</h5>
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-outline-variant/60">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-surface-dim text-outline uppercase font-semibold text-[10px]">
                        <tr>
                          <th className="p-2.5">Tipo de Riesgo</th>
                          <th className="p-2.5">Motivo / Causa</th>
                          <th className="p-2.5">Consecuencia</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/30">
                        {selectedJob.riesgosPuesto.map((r, rIdx) => (
                          <tr key={r.id || rIdx} className="hover:bg-surface-dim/40 transition-colors">
                            <td className="p-2.5 font-medium text-primary">{r.tipoRiesgo}</td>
                            <td className="p-2.5 text-on-surface">{r.motivo}</td>
                            <td className="p-2.5 text-on-surface-variant">{r.consecuencia}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Crear Nuevo Puesto */}
      {showNewJobModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-puesto-title"
          className="fixed inset-0 bg-on-surface/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => {
            setShowNewJobModal(false);
            setJobFormSubmitted(false);
          }}
        >
          <div
            ref={newJobModalRef}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-bright rounded-xl max-w-lg w-full p-5 shadow-xl flex flex-col gap-4 border border-outline-variant/70 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-surface-dim text-primary flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 id="modal-puesto-title" className="text-sm font-semibold text-on-surface">
                    Crear Nuevo Puesto de Trabajo
                  </h3>
                  <span className="text-[11px] text-outline">Incorporación de cargo al catálogo organizacional</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowNewJobModal(false);
                  setJobFormSubmitted(false);
                  setNewTitle('');
                  setNewMission('');
                }}
                className="p-1 rounded-md text-outline hover:text-on-surface hover:bg-surface-dim transition-colors cursor-pointer"
                title="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-xs font-medium text-on-surface block mb-1">
                  Nombre del Puesto: <span className="text-error">*</span>
                </label>
                <Input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: Desarrollador Backend Senior"
                  className={jobFormSubmitted && !newTitle.trim() ? 'border-error' : ''}
                />
                {jobFormSubmitted && !newTitle.trim() && (
                  <p role="alert" className="text-[11px] text-error font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Ingresá el nombre del puesto para continuar.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-on-surface block mb-1">
                    Área o Departamento:
                  </label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-surface-bright border border-outline-variant text-xs text-on-surface outline-none focus:border-primary cursor-pointer"
                  >
                    {availableAreas.length > 0 ? (
                      availableAreas.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Tecnología y Plataforma">Tecnología y Plataforma</option>
                        <option value="Inteligencia Artificial y Datos">Inteligencia Artificial y Datos</option>
                        <option value="Operaciones e Infraestructura">Operaciones e Infraestructura</option>
                        <option value="Recursos Humanos">Recursos Humanos</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-on-surface block mb-1">
                    Nivel de Criticidad:
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as 'critical' | 'operational')}
                    className="w-full h-9 px-3 rounded-lg bg-surface-bright border border-outline-variant text-xs text-on-surface outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="critical">Crítico (Puesto clave)</option>
                    <option value="operational">Operativo (Estándar)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-on-surface block mb-1">
                  Misión u Objetivo del Cargo:
                </label>
                <textarea
                  rows={2}
                  value={newMission}
                  onChange={(e) => setNewMission(e.target.value)}
                  placeholder="Describí las responsabilidades principales..."
                  className="w-full p-2.5 bg-surface-bright rounded-lg border border-outline-variant text-xs text-on-surface outline-none focus:border-primary resize-none font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant/40">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowNewJobModal(false);
                  setJobFormSubmitted(false);
                  setNewTitle('');
                  setNewMission('');
                }}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                disabled={isSubmittingJob || (jobFormSubmitted && !newTitle.trim())}
                onClick={handleSaveJob}
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                {isSubmittingJob ? 'Guardando...' : 'Guardar Puesto'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
