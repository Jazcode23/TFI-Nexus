import React, { useState, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  Panel,
  Handle,
  Position,
  MarkerType,
  Node,
  Edge,
  NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  GitFork,
  Users,
  Search,
  Building2,
  AlertTriangle,
  Shield,
  ShieldCheck,
  CheckCircle2,
  Download,
  Eye,
  User,
  X,
  Sparkles,
  TrendingUp,
  Zap,
  Heart,
  Maximize2,
  Move,
  Briefcase,
  Layers,
  ArrowRight,
} from 'lucide-react';

import { ScreenId, TalentPerson } from '../../types';
import { TALENT_PERSONS } from '../../data/mockData';
import { UserAvatar } from '../UserAvatar';
import { QuickGuideBanner } from '../QuickGuideBanner';
import { useToast } from '../ToastProvider';
import { employeesApi } from '../../services/api';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';

interface TalentMapScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onSelectEmployee?: (employeeId: string) => void;
}

// ============================================================================
// COMPONENTES DE NODOS PERSONALIZADOS PARA REACT FLOW
// ============================================================================

interface PersonNodeData extends Record<string, unknown> {
  id: string;
  name: string;
  role: string;
  squad: string;
  isSpof: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const PersonNodeComponent: React.FC<NodeProps<Node<PersonNodeData>>> = ({ data }) => {
  return (
    <div
      onClick={() => data.onSelect(data.id)}
      className={`relative w-64 p-3 rounded-xl bg-surface-bright transition-all cursor-pointer shadow-2xs border text-left ${
        data.isSelected
          ? data.isSpof
            ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-50/50 shadow-xs'
            : 'ring-2 ring-primary border-primary bg-primary/5 shadow-xs'
          : 'border-outline-variant hover:border-outline hover:shadow-2xs'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <UserAvatar
          name={data.name}
          size="md"
          shape="circle"
          showStatus={true}
          statusColor={data.isSpof ? 'amber' : 'emerald'}
        />
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-semibold text-on-surface leading-tight">
              {data.name}
            </span>
            <Badge
              variant={data.isSpof ? 'destructive' : 'success'}
              className="text-[9px] px-1.5 py-0 shrink-0"
            >
              {data.isSpof ? 'SPOF' : 'Óptimo'}
            </Badge>
          </div>
          <span className="text-[11px] text-primary font-medium leading-tight mt-0.5">
            {data.role}
          </span>
          <span className="text-[10px] text-outline mt-0.5 truncate">
            {data.squad}
          </span>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!w-1 !h-1 !opacity-0 !border-0 !right-0"
      />
    </div>
  );
};

interface SkillNodeData extends Record<string, unknown> {
  id: string;
  title: string;
  level: string;
  tags: string;
  isActive: boolean;
  isSpof: boolean;
}

const SkillNodeComponent: React.FC<NodeProps<Node<SkillNodeData>>> = ({ data }) => {
  return (
    <div
      className={`relative w-60 p-3 rounded-xl bg-surface-bright transition-all shadow-2xs border flex flex-col gap-1.5 text-left ${
        data.isActive
          ? data.isSpof
            ? 'border-amber-500 ring-2 ring-amber-500/40 bg-amber-50/40 shadow-xs'
            : 'border-primary ring-2 ring-primary/40 bg-primary/5 shadow-xs'
          : 'border-outline-variant/80 opacity-70'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-1 !h-1 !opacity-0 !border-0 !left-0"
      />
      <div className="flex items-center justify-between gap-1">
        <span className="text-xs font-semibold text-on-surface leading-tight">
          {data.title}
        </span>
        <Badge
          variant={data.isActive ? (data.isSpof ? 'destructive' : 'default') : 'outline'}
          className="text-[10px] shrink-0"
        >
          {data.level}
        </Badge>
      </div>
      <div className="w-full bg-surface-dim h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-full w-[90%] rounded-full ${
            data.isActive
              ? data.isSpof
                ? 'bg-amber-500'
                : 'bg-primary'
              : 'bg-primary-fixed-dim'
          }`}
        />
      </div>
      <span className="text-[10px] text-outline font-mono truncate">{data.tags}</span>
      <Handle
        type="source"
        position={Position.Right}
        className="!w-1 !h-1 !opacity-0 !border-0 !right-0"
      />
    </div>
  );
};

interface SquadNodeData extends Record<string, unknown> {
  id: string;
  name: string;
  desc: string;
  members: string;
  metric: string;
  isActive: boolean;
  isSpof: boolean;
}

const SquadNodeComponent: React.FC<NodeProps<Node<SquadNodeData>>> = ({ data }) => {
  return (
    <div
      className={`relative w-64 p-3.5 rounded-xl bg-surface-bright transition-all shadow-2xs border flex flex-col gap-1 text-left ${
        data.isActive
          ? data.isSpof
            ? 'border-amber-500 ring-2 ring-amber-500/40 bg-amber-50/40 shadow-xs'
            : 'border-primary ring-2 ring-primary/40 bg-primary/5 shadow-xs'
          : 'border-outline-variant/80 opacity-70'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-1 !h-1 !opacity-0 !border-0 !left-0"
      />
      <div className="flex items-center gap-1.5">
        <Users
          className={`w-4 h-4 ${
            data.isActive && data.isSpof ? 'text-amber-600' : 'text-primary'
          }`}
        />
        <span className="text-xs font-semibold text-on-surface">{data.name}</span>
      </div>
      <span className="text-[11px] text-on-surface-variant leading-tight">
        {data.desc}
      </span>
      <div className="flex items-center justify-between text-outline text-[10px] pt-1.5 border-t border-outline-variant/40 mt-1">
        <span>{data.members}</span>
        <span
          className={`font-semibold ${
            data.isActive && data.isSpof ? 'text-amber-700' : 'text-secondary'
          }`}
        >
          {data.metric}
        </span>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!w-1 !h-1 !opacity-0 !border-0 !right-0"
      />
    </div>
  );
};

interface ActivityNodeData extends Record<string, unknown> {
  id: string;
  type: string;
  title: string;
  desc: string;
  isActive: boolean;
  isSpof: boolean;
}

const ActivityNodeComponent: React.FC<NodeProps<Node<ActivityNodeData>>> = ({ data }) => {
  return (
    <div
      className={`relative w-64 p-3.5 rounded-xl bg-surface-bright transition-all shadow-2xs border flex flex-col gap-1 text-left ${
        data.isActive
          ? data.isSpof
            ? 'border-amber-500 ring-2 ring-amber-500/40 bg-amber-50/40 shadow-xs'
            : 'border-primary ring-2 ring-primary/40 bg-primary/5 shadow-xs'
          : 'border-outline-variant/80 opacity-70'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-1 !h-1 !opacity-0 !border-0 !left-0"
      />
      <Badge
        variant={data.isActive && data.isSpof ? 'destructive' : 'subtle'}
        className="text-[10px] w-max font-semibold"
      >
        {data.type}
      </Badge>
      <span className="text-xs font-semibold text-on-surface leading-tight">
        {data.title}
      </span>
      <span className="text-[11px] text-on-surface-variant leading-tight">
        {data.desc}
      </span>
      <Handle
        type="source"
        position={Position.Right}
        className="!w-1 !h-1 !opacity-0 !border-0 !right-0"
      />
    </div>
  );
};

interface ImpactNodeData extends Record<string, unknown> {
  id: string;
  label: string;
  value: string;
  desc: string;
  icon: string;
  isActive: boolean;
}

const ImpactNodeComponent: React.FC<NodeProps<Node<ImpactNodeData>>> = ({ data }) => {
  const renderImpactIcon = () => {
    switch (data.icon) {
      case 'trending_up':
        return <TrendingUp className="w-4 h-4 text-secondary" />;
      case 'speed':
        return <Zap className="w-4 h-4 text-secondary" />;
      case 'loyalty':
        return <Heart className="w-4 h-4 text-secondary" />;
      default:
        return <Sparkles className="w-4 h-4 text-secondary" />;
    }
  };

  return (
    <div
      className={`relative w-56 p-3.5 rounded-xl bg-surface-bright transition-all shadow-2xs border flex flex-col gap-1 text-left ${
        data.isActive
          ? 'border-secondary ring-2 ring-secondary/50 shadow-xs bg-secondary-container/30'
          : 'border-outline-variant/80 opacity-70'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-1 !h-1 !opacity-0 !border-0 !left-0"
      />
      <div className="flex items-center gap-1.5 text-secondary">
        {renderImpactIcon()}
        <span className="text-[10px] font-semibold uppercase">{data.label}</span>
      </div>
      <span className="text-xl font-bold text-on-surface leading-none tabular-nums">
        {data.value}
      </span>
      <span className="text-[11px] text-on-surface-variant leading-tight">
        {data.desc}
      </span>
    </div>
  );
};

const nodeTypes = {
  person: PersonNodeComponent,
  skill: SkillNodeComponent,
  squad: SquadNodeComponent,
  activity: ActivityNodeComponent,
  impact: ImpactNodeComponent,
};

// ============================================================================
// DATOS MAESTROS Y CADENAS DE VALOR COMPLETAS
// ============================================================================

const MASTER_PEOPLE = [
  { id: 'sofia', name: 'Sofía Méndez', role: 'Líder en Inteligencia Artificial', squad: 'Nexus Core', isSpof: false },
  { id: 'carlos', name: 'Carlos Ruiz', role: 'Arquitecto Principal de Software', squad: 'Platform Resilience', isSpof: true },
  { id: 'lucas', name: 'Ing. Lucas Valenzuela', role: 'Arquitecto Principal Cloud & IA', squad: 'Infraestructura y Plataforma', isSpof: false },
  { id: 'valeria', name: 'Valeria Gómez', role: 'Líder de Estrategia de Producto', squad: 'Growth Engine', isSpof: false },
  { id: 'laura', name: 'Lic. Laura Benítez', role: 'Arquitecto de Seguridad y Accesos', squad: 'Seguridad y Cumplimiento', isSpof: false },
];

const MASTER_SKILLS = [
  { id: 'ai', title: 'Inteligencia Artificial', level: 'Nv. 5', tags: 'PyTorch, NLP, RL' },
  { id: 'systems', title: 'Diseño de Sistemas', level: 'Nv. 5', tags: 'Microservices, Kafka' },
  { id: 'cloud', title: 'Gestión Cloud & Clústeres', level: 'Nv. 5', tags: 'K8s, Docker, Terraform' },
  { id: 'product', title: 'Estrategia de Producto', level: 'Nv. 5', tags: 'Dual-Track Agile, OKRs' },
  { id: 'security', title: 'Seguridad en la Nube', level: 'Nv. 4', tags: 'Zero Trust, IAM, mTLS' },
];

const MASTER_SQUADS = [
  { id: 'nexus-core', name: 'Nexus Core', desc: 'Equipo de algoritmos e IA', members: '9 Miembros', metric: '100% Sinergia' },
  { id: 'platform', name: 'Plataforma & Cloud', desc: 'Infraestructura crítica resiliente', members: '14 Miembros', metric: '96% Cobertura' },
  { id: 'growth', name: 'Motor de Crecimiento', desc: 'Expansión estratégica y B2B', members: '11 Miembros', metric: '92% Sinergia' },
];

const MASTER_ACTIVITIES = [
  { id: 'algo-opt', type: 'Primaria', title: 'Optimización Algorítmica', desc: 'Ahorro de €2.4M en rutas de despacho' },
  { id: 'cloud-auto', type: 'Soporte', title: 'Automatización Multi-Cloud', desc: 'Disponibilidad 99.999% ante fallas' },
  { id: 'b2b-growth', type: 'Estratégica', title: 'Expansión B2B Enterprise', desc: 'Cuentas clave de primer nivel y valor' },
];

const MASTER_IMPACTS = [
  { id: 'profit', label: 'Rentabilidad', value: '+18.4%', desc: 'Margen Operativo Neto sostenido', icon: 'trending_up' },
  { id: 'speed', label: 'Velocidad', value: '-40%', desc: 'Tiempo de ciclo al mercado', icon: 'speed' },
  { id: 'retention', label: 'Retención', value: '98.4%', desc: 'Cuentas corporativas clave', icon: 'loyalty' },
];

const CHAINS_BY_PERSON: Record<
  string,
  {
    skills: string[];
    squads: string[];
    activities: string[];
    impacts: string[];
    isSpof: boolean;
    activeEdges: string[];
  }
> = {
  sofia: {
    skills: ['ai', 'systems'],
    squads: ['nexus-core'],
    activities: ['algo-opt'],
    impacts: ['profit', 'speed'],
    isSpof: false,
    activeEdges: [
      'e-sofia-ai',
      'e-sofia-sys',
      'e-ai-nexus',
      'e-sys-nexus',
      'e-nexus-algo',
      'e-algo-profit',
      'e-algo-speed',
    ],
  },
  carlos: {
    skills: ['systems', 'cloud'],
    squads: ['platform'],
    activities: ['cloud-auto'],
    impacts: ['speed'],
    isSpof: true,
    activeEdges: [
      'e-carlos-sys',
      'e-carlos-cloud',
      'e-sys-platform',
      'e-cloud-platform',
      'e-plat-cloudauto',
      'e-cloudauto-speed',
    ],
  },
  lucas: {
    skills: ['cloud', 'security'],
    squads: ['platform'],
    activities: ['cloud-auto'],
    impacts: ['speed', 'profit'],
    isSpof: false,
    activeEdges: [
      'e-lucas-cloud',
      'e-lucas-sec',
      'e-cloud-platform',
      'e-sec-platform',
      'e-plat-cloudauto',
      'e-cloudauto-speed',
      'e-cloudauto-profit',
    ],
  },
  valeria: {
    skills: ['product', 'ai'],
    squads: ['growth'],
    activities: ['b2b-growth'],
    impacts: ['retention', 'profit'],
    isSpof: false,
    activeEdges: [
      'e-valeria-prod',
      'e-valeria-ai',
      'e-prod-growth',
      'e-ai-growth',
      'e-growth-b2b',
      'e-b2b-retention',
      'e-b2b-profit',
    ],
  },
  laura: {
    skills: ['security', 'cloud'],
    squads: ['platform'],
    activities: ['cloud-auto'],
    impacts: ['speed'],
    isSpof: false,
    activeEdges: [
      'e-laura-sec',
      'e-laura-cloud',
      'e-sec-platform',
      'e-cloud-platform',
      'e-plat-cloudauto',
      'e-cloudauto-speed',
    ],
  },
};

export const TalentMapScreen: React.FC<TalentMapScreenProps> = ({
  onNavigate,
  onSelectEmployee,
}) => {
  const { showToast } = useToast();
  const [talentList, setTalentList] = useState<TalentPerson[]>(TALENT_PERSONS);
  const [selectedDomain, setSelectedDomain] = useState('Todos');
  const [activePersonId, setActivePersonId] = useState<string>('laura');
  const [searchFilter, setSearchFilter] = useState('');
  const [onlySpof, setOnlySpof] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'actions' | 'skills' | 'spof'>('actions');
  const [isSynapticModalOpen, setIsSynapticModalOpen] = useState<boolean>(false);

  // Conexión dinámica con API
  useEffect(() => {
    let isMounted = true;
    employeesApi
      .getTalentPersons({
        domain: selectedDomain === 'Todos' ? undefined : selectedDomain,
        search: searchFilter || undefined,
        risk: onlySpof ? 'spof' : undefined,
      })
      .then((res) => {
        if (isMounted && res && Array.isArray(res.data) && res.data.length > 0) {
          setTalentList(res.data);
        }
      })
      .catch(() => {
        // Fallback nominal
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDomain, searchFilter, onlySpof]);

  // Escape key listener for modal
  useEffect(() => {
    if (!isSynapticModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSynapticModalOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isSynapticModalOpen]);

  // Filtrado de colaboradores
  const filteredPersons = useMemo(() => {
    return talentList.filter((person) => {
      if (onlySpof && person.riskStatus !== 'spof') return false;
      if (searchFilter) {
        const q = searchFilter.toLowerCase();
        const matches =
          person.name.toLowerCase().includes(q) ||
          person.role.toLowerCase().includes(q) ||
          person.squad.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [talentList, onlySpof, searchFilter]);

  // Persona activa seleccionada
  const activePerson: TalentPerson = useMemo(() => {
    return (
      filteredPersons.find((p) => p.id === activePersonId) ||
      filteredPersons[0] ||
      talentList[0] ||
      TALENT_PERSONS[0]
    );
  }, [filteredPersons, activePersonId, talentList]);

  // Métricas analíticas superiores
  const metrics = useMemo(() => {
    const total = talentList.length;
    const spofCount = talentList.filter((p) => p.riskStatus === 'spof').length;
    const avgCrit =
      total > 0
        ? (talentList.reduce((acc, p) => acc + (p.criticality || 8.5), 0) / total).toFixed(1)
        : '9.2';
    const distinctSquads = new Set(talentList.map((p) => p.squad)).size;
    return { total, spofCount, avgCrit, distinctSquads };
  }, [talentList]);

  const handleGoToEmployee = () => {
    if (onSelectEmployee) {
      onSelectEmployee(activePerson.id);
      return;
    }
    onNavigate('empleados');
  };

  // Cadena activa actual
  const currentChain = useMemo(() => {
    return CHAINS_BY_PERSON[activePersonId] || CHAINS_BY_PERSON.carlos;
  }, [activePersonId]);

  // NODOS CON ALINEACIÓN DIRECTA HORIZONTAL
  const flowNodes: Node[] = useMemo(() => {
    const nodes: Node[] = [];

    // Columna 1: Personas
    MASTER_PEOPLE.forEach((p, i) => {
      nodes.push({
        id: `person-${p.id}`,
        type: 'person',
        position: { x: 20, y: i * 110 },
        data: {
          id: p.id,
          name: p.name,
          role: p.role,
          squad: p.squad,
          isSpof: p.isSpof,
          isSelected: activePersonId === p.id,
          onSelect: (id: string) => setActivePersonId(id),
        },
      });
    });

    // Columna 2: Habilidades DNA
    MASTER_SKILLS.forEach((s, i) => {
      nodes.push({
        id: `skill-${s.id}`,
        type: 'skill',
        position: { x: 340, y: i * 110 },
        data: {
          id: s.id,
          title: s.title,
          level: s.level,
          tags: s.tags,
          isActive: currentChain.skills.includes(s.id),
          isSpof: currentChain.isSpof,
        },
      });
    });

    // Columna 3: Squads
    const squadY = [35, 200, 365];
    MASTER_SQUADS.forEach((sq, i) => {
      nodes.push({
        id: `squad-${sq.id}`,
        type: 'squad',
        position: { x: 650, y: squadY[i] },
        data: {
          id: sq.id,
          name: sq.name,
          desc: sq.desc,
          members: sq.members,
          metric: sq.metric,
          isActive: currentChain.squads.includes(sq.id),
          isSpof: currentChain.isSpof,
        },
      });
    });

    // Columna 4: Actividades
    MASTER_ACTIVITIES.forEach((act, i) => {
      nodes.push({
        id: `activity-${act.id}`,
        type: 'activity',
        position: { x: 970, y: squadY[i] },
        data: {
          id: act.id,
          type: act.type,
          title: act.title,
          desc: act.desc,
          isActive: currentChain.activities.includes(act.id),
          isSpof: currentChain.isSpof,
        },
      });
    });

    // Columna 5: Impacto
    MASTER_IMPACTS.forEach((imp, i) => {
      nodes.push({
        id: `impact-${imp.id}`,
        type: 'impact',
        position: { x: 1290, y: squadY[i] },
        data: {
          id: imp.id,
          label: imp.label,
          value: imp.value,
          desc: imp.desc,
          icon: imp.icon,
          isActive: currentChain.impacts.includes(imp.id),
        },
      });
    });

    return nodes;
  }, [activePersonId, currentChain]);

  // ARISTAS (EDGES)
  const flowEdges: Edge[] = useMemo(() => {
    const rawEdges: Array<{
      id: string;
      source: string;
      target: string;
    }> = [
      // 1. Personas -> Habilidades
      { id: 'e-sofia-ai', source: 'person-sofia', target: 'skill-ai' },
      { id: 'e-sofia-sys', source: 'person-sofia', target: 'skill-systems' },
      { id: 'e-carlos-sys', source: 'person-carlos', target: 'skill-systems' },
      { id: 'e-carlos-cloud', source: 'person-carlos', target: 'skill-cloud' },
      { id: 'e-lucas-cloud', source: 'person-lucas', target: 'skill-cloud' },
      { id: 'e-lucas-sec', source: 'person-lucas', target: 'skill-security' },
      { id: 'e-valeria-prod', source: 'person-valeria', target: 'skill-product' },
      { id: 'e-valeria-ai', source: 'person-valeria', target: 'skill-ai' },
      { id: 'e-laura-sec', source: 'person-laura', target: 'skill-security' },
      { id: 'e-laura-cloud', source: 'person-laura', target: 'skill-cloud' },

      // 2. Habilidades -> Squads
      { id: 'e-ai-nexus', source: 'skill-ai', target: 'squad-nexus-core' },
      { id: 'e-sys-nexus', source: 'skill-systems', target: 'squad-nexus-core' },
      { id: 'e-sys-platform', source: 'skill-systems', target: 'squad-platform' },
      { id: 'e-cloud-platform', source: 'skill-cloud', target: 'squad-platform' },
      { id: 'e-prod-growth', source: 'skill-product', target: 'squad-growth' },
      { id: 'e-ai-growth', source: 'skill-ai', target: 'squad-growth' },
      { id: 'e-sec-platform', source: 'skill-security', target: 'squad-platform' },

      // 3. Squads -> Actividades
      { id: 'e-nexus-algo', source: 'squad-nexus-core', target: 'activity-algo-opt' },
      { id: 'e-plat-cloudauto', source: 'squad-platform', target: 'activity-cloud-auto' },
      { id: 'e-growth-b2b', source: 'squad-growth', target: 'activity-b2b-growth' },

      // 4. Actividades -> Impacto
      { id: 'e-algo-profit', source: 'activity-algo-opt', target: 'impact-profit' },
      { id: 'e-algo-speed', source: 'activity-algo-opt', target: 'impact-speed' },
      { id: 'e-cloudauto-speed', source: 'activity-cloud-auto', target: 'impact-speed' },
      { id: 'e-cloudauto-profit', source: 'activity-cloud-auto', target: 'impact-profit' },
      { id: 'e-b2b-retention', source: 'activity-b2b-growth', target: 'impact-retention' },
      { id: 'e-b2b-profit', source: 'activity-b2b-growth', target: 'impact-profit' },
    ];

    const activeColor = currentChain.isSpof ? '#D97706' : '#4F46E5';

    return rawEdges.map((e) => {
      const isActive = currentChain.activeEdges.includes(e.id);

      return {
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'bezier',
        animated: false,
        style: {
          stroke: isActive ? activeColor : '#E2E8F0',
          strokeWidth: isActive ? 2.5 : 1.2,
          opacity: isActive ? 1 : 0.35,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isActive ? activeColor : '#CBD5E1',
          width: isActive ? 18 : 10,
          height: isActive ? 18 : 10,
        },
      };
    });
  }, [currentChain]);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-5 flex flex-col gap-6 max-w-7xl mx-auto pb-20">
      {/* Cabecera & Controles Globales */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight">
            Mapa de Talento y Competencias
          </h1>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">
            Relación de colaboradores, competencias verificadas, unidades operativas y valor
          </p>
        </div>

        {/* Acciones principales de la cabecera */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative">
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="h-8 pl-3 pr-8 rounded-lg text-xs font-medium bg-surface-bright text-on-surface border border-outline-variant outline-none focus:ring-1 focus:ring-primary cursor-pointer shadow-2xs"
              aria-label="Seleccionar dominio"
            >
              <option value="Todos">Todos los Dominios</option>
              <option value="Ingeniería & Producto">Ingeniería &amp; Producto</option>
              <option value="Operaciones & Logística">Operaciones &amp; Logística</option>
              <option value="Estrategia & Finanzas">Estrategia &amp; Finanzas</option>
              <option value="Recursos Humanos & Personas">Recursos Humanos &amp; Personas</option>
            </select>
          </div>

          <Button
            size="sm"
            onClick={() => setIsSynapticModalOpen(true)}
          >
            <GitFork className="w-3.5 h-3.5 mr-1.5" />
            <span>Ver Mapa Sináptico</span>
          </Button>
        </div>
      </div>

      {/* Guía Rápida */}
      <QuickGuideBanner
        title="Guía del Mapa de Talento"
        description="Explorá relaciones de colaboradores con habilidades, squads y valor."
        tips={[
          'Hacé clic en cualquier colaborador del listado izquierdo para ver su perfil y actividades.',
          'Hacé clic en "Ver Mapa Sináptico" para abrir el diagrama de flujo interactivo con flechas y nodos.',
          'En el modal podés arrastrar el lienzo, hacer zoom libre y hacer clic en cualquier persona para trazar su red.',
        ]}
        dismissible={true}
      />

      {/* Minimalist 4-Metric Status Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <Card className="p-3.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-outline font-medium">Colaboradores mapeados</span>
            <Users className="w-3.5 h-3.5 text-outline" />
          </div>
          <div className="text-xl font-bold text-on-surface tabular-nums">
            {metrics.total} <span className="text-xs font-normal text-outline">activos</span>
          </div>
        </Card>

        <Card className="p-3.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-outline font-medium">Criticidad promedio</span>
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="text-xl font-bold text-primary tabular-nums">
            {metrics.avgCrit} <span className="text-xs font-normal text-outline">/ 10.0</span>
          </div>
        </Card>

        <Card className="p-3.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-outline font-medium">Equipos y squads</span>
            <Building2 className="w-3.5 h-3.5 text-outline" />
          </div>
          <div className="text-xl font-bold text-on-surface tabular-nums">
            {metrics.distinctSquads} <span className="text-xs font-normal text-outline">unidades</span>
          </div>
        </Card>

        <Card className="p-3.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-outline font-medium">Puntos únicos de falla (SPOF)</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-600 tabular-nums">
            {metrics.spofCount} <span className="text-xs font-normal text-outline">roles con riesgo</span>
          </div>
        </Card>
      </div>

      {/* WORKSPACE PRINCIPAL: Directorio Lateral + Panel Central */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* PANEL IZQUIERDO: Directorio de Talento (4 cols) */}
        <Card className="lg:col-span-4 p-4 flex flex-col gap-3 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/40">
            <h2 className="text-xs font-semibold text-on-surface uppercase tracking-wider">
              Colaboradores ({filteredPersons.length})
            </h2>
            <span className="text-[11px] text-outline">Seleccioná para inspeccionar</span>
          </div>

          {/* Búsqueda en el listado */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-outline" />
            <Input
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Buscar colaborador o puesto..."
              className="pl-8 text-xs h-8"
            />
          </div>

          {/* Lista de colaboradores */}
          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {filteredPersons.map((person) => {
              const isSelected = activePerson.id === person.id;
              const isSpof = person.riskStatus === 'spof';

              return (
                <div
                  key={person.id}
                  onClick={() => setActivePersonId(person.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                    isSelected
                      ? 'bg-surface-bright border-primary ring-1 ring-primary/30 shadow-xs'
                      : 'bg-surface-bright hover:bg-surface-dim border-outline-variant/70 shadow-2xs'
                  }`}
                >
                  <UserAvatar
                    name={person.name}
                    size="md"
                    shape="circle"
                    showStatus={true}
                    statusColor={isSpof ? 'amber' : 'emerald'}
                  />
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold text-on-surface truncate">
                        {person.name}
                      </span>
                      <Badge
                        variant={isSpof ? 'destructive' : 'success'}
                        className="text-[9px] px-1.5 py-0"
                      >
                        {isSpof ? 'SPOF' : 'Óptimo'}
                      </Badge>
                    </div>
                    <span className="text-xs text-primary font-medium leading-snug line-clamp-1 mt-0.5">
                      {person.role}
                    </span>
                    <div className="flex items-center justify-between text-[11px] text-outline mt-1">
                      <span className="truncate">{person.squad.split('•')[0]?.trim()}</span>
                      <span className="font-semibold text-on-surface shrink-0">
                        Crit. {person.criticality}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* PANEL DERECHO: Tarjeta Hero del Colaborador Activo + Detalle Reestructurado (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Tarjeta Hero del Colaborador Activo */}
          <Card className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3.5">
              <UserAvatar
                name={activePerson.name}
                size="lg"
                shape="rounded"
                showStatus={true}
                statusColor={activePerson.riskStatus === 'spof' ? 'amber' : 'emerald'}
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-on-surface">{activePerson.name}</h2>
                  <Badge
                    variant={activePerson.riskStatus === 'spof' ? 'destructive' : 'success'}
                    className="text-[10px] font-semibold"
                  >
                    {activePerson.riskStatus === 'spof' ? 'Punto Único de Falla (SPOF)' : 'Sin riesgo'}
                  </Badge>
                </div>
                <p className="text-xs text-primary font-medium mt-0.5">{activePerson.role}</p>
                <p className="text-xs text-outline">{activePerson.squad} &bull; Sede: {activePerson.location}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <Button
                size="sm"
                onClick={() => setIsSynapticModalOpen(true)}
              >
                <GitFork className="w-3.5 h-3.5 mr-1.5" />
                <span>Mapa Sináptico</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGoToEmployee}
              >
                <User className="w-3.5 h-3.5 mr-1.5" />
                <span>Perfil 360°</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    showToast(`Descargando Ficha de ${activePerson.name}...`);
                    await employeesApi.downloadPdf(activePerson.id, activePerson.name);
                    showToast(`Ficha de ${activePerson.name} descargada exitosamente.`);
                  } catch {
                    window.print();
                  }
                }}
                title="Exportar ficha técnica en PDF"
              >
                <Download className="w-3.5 h-3.5 mr-1 text-primary" />
                <span className="hidden sm:inline">PDF</span>
              </Button>
            </div>
          </Card>

          {/* Banner de Invitación al Mapa Sináptico */}
          <div className="bg-gradient-to-r from-primary/5 via-surface-bright to-surface-bright rounded-xl border border-primary/20 p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-xs">
                <GitFork className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-on-surface">
                  Red Sináptica de Valor y Competencias (Diagrama Interactivo)
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Visualizá el flujo completo con flechas direccionales: Personas &rarr; Habilidades DNA &rarr; Squads &rarr; Actividades &rarr; Impacto.
                </p>
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => setIsSynapticModalOpen(true)}
              className="w-full sm:w-auto shrink-0"
            >
              <Maximize2 className="w-3.5 h-3.5 mr-1.5" />
              <span>Abrir Diagrama Interactivo</span>
            </Button>
          </div>

          {/* Selector de Pestañas de Detalle */}
          <div className="bg-surface-bright px-4 py-2 rounded-xl border border-outline-variant shadow-2xs flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1 bg-surface-dim p-1 rounded-lg w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab('actions')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'actions'
                    ? 'bg-surface-bright text-primary shadow-2xs font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Iniciativas Clave ({activePerson.activities.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('skills')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'skills'
                    ? 'bg-surface-bright text-primary shadow-2xs font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Competencias DNA ({activePerson.skills.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('spof')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'spof'
                    ? 'bg-surface-bright text-primary shadow-2xs font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Análisis SPOF</span>
              </button>
            </div>
          </div>

          {/* PESTAÑA 1: Iniciativas y Tareas Clave */}
          {activeTab === 'actions' && (
            <Card className="p-5 flex flex-col gap-4 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/40">
                <div>
                  <h3 className="text-sm font-semibold text-on-surface">
                    Iniciativas y Tareas Asignadas a {activePerson.name}
                  </h3>
                  <p className="text-xs text-outline mt-0.5">
                    Procesos directos de negocio, custodia técnica y proyectos en curso.
                  </p>
                </div>
                <Badge variant="subtle" className="text-xs">
                  {activePerson.activities.length} Asignaciones
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activePerson.activities.map((act, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-surface-dim/60 rounded-xl border border-outline-variant/60 flex flex-col justify-between gap-3 shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-7 h-7 rounded-lg bg-primary-fixed text-primary flex items-center justify-center font-semibold text-xs shrink-0">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs font-semibold text-on-surface leading-snug">
                          {act.title}
                        </h4>
                      </div>
                      <p className="text-xs text-on-surface-variant leading-relaxed pl-9">
                        {act.description}
                      </p>
                    </div>

                    <div className="mt-2 pt-2 border-t border-outline-variant/40 flex items-center justify-between text-xs text-outline pl-9">
                      <span>Puesto: {activePerson.role}</span>
                      <span className="font-semibold text-primary">Activa</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* PESTAÑA 2: Competencias DNA */}
          {activeTab === 'skills' && (
            <Card className="p-5 flex flex-col gap-4 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/40">
                <div>
                  <h3 className="text-sm font-semibold text-on-surface">
                    Matriz de Competencias Verificadas de {activePerson.name}
                  </h3>
                  <p className="text-xs text-outline mt-0.5">
                    Nivel técnico comprobado y stack operativo validado.
                  </p>
                </div>
                <Badge variant="success" className="text-xs">
                  {activePerson.skills.length} Verificadas
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {activePerson.skills.map((skill, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-surface-dim/60 rounded-xl border border-outline-variant/60 flex flex-col justify-between gap-2.5 shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-on-surface">{skill.name}</span>
                        <span className="text-xs font-bold text-primary tabular-nums">Nv. {skill.level} / 5</span>
                      </div>
                      {skill.technicalName && (
                        <span className="text-[11px] text-outline block mt-0.5">
                          {skill.technicalName}
                        </span>
                      )}
                    </div>

                    <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-300"
                        style={{ width: `${(skill.level / 5) * 100}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-outline">
                      <span className="font-mono">{skill.dna || 'Validado por comité'}</span>
                      <span className="text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verificada
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* PESTAÑA 3: Análisis de Continuidad y Riesgo SPOF */}
          {activeTab === 'spof' && (
            <Card className="p-5 flex flex-col gap-4 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/40">
                <div>
                  <h3 className="text-sm font-semibold text-on-surface">
                    Evaluación de Continuidad Operativa &amp; SPOF
                  </h3>
                  <p className="text-xs text-outline mt-0.5">
                    Índice de criticidad y resiliencia ante ausencias o relevos.
                  </p>
                </div>
                <Badge
                  variant={activePerson.riskStatus === 'spof' ? 'destructive' : 'success'}
                  className="text-xs"
                >
                  {activePerson.riskStatus === 'spof' ? 'Riesgo Detectado' : 'Continuidad Segura'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-surface-dim/60 rounded-xl border border-outline-variant/60 flex flex-col gap-1">
                  <span className="text-[11px] text-outline">Índice de Criticidad</span>
                  <div className="text-xl font-bold text-primary tabular-nums">{activePerson.criticality} / 10</div>
                  <span className="text-[10px] text-on-surface-variant font-medium">Prioridad alta en la unidad</span>
                </div>

                <div className="p-3.5 bg-surface-dim/60 rounded-xl border border-outline-variant/60 flex flex-col gap-1">
                  <span className="text-[11px] text-outline">Unidad de Dependencia</span>
                  <div className="text-sm font-semibold text-on-surface leading-tight mt-1">
                    {activePerson.squad.split('•')[0]?.trim()}
                  </div>
                  <span className="text-[10px] text-outline">Sede: {activePerson.location}</span>
                </div>

                <div className="p-3.5 bg-surface-dim/60 rounded-xl border border-outline-variant/60 flex flex-col gap-1">
                  <span className="text-[11px] text-outline">Plan de Relevo</span>
                  <div className="text-sm font-semibold text-on-surface leading-tight mt-1">
                    {activePerson.riskStatus === 'spof' ? 'Requerido URGENTE' : 'Cobertura 100%'}
                  </div>
                  <span className="text-[10px] text-outline">
                    {activePerson.riskStatus === 'spof'
                      ? 'No posee suplente directo'
                      : 'Capacitación cruzada lista'}
                  </span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL SINÁPTICO: REACT FLOW CON FLECHAS FLUIDAS Y SIN CORTES              */}
      {/* ========================================================================= */}
      {isSynapticModalOpen && (
        <div className="fixed inset-0 z-50 bg-on-surface/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="synaptic-modal-title"
            className="bg-surface-bright w-full max-w-[96vw] xl:max-w-7xl h-[92vh] max-h-[860px] rounded-2xl shadow-2xl border border-outline-variant flex flex-col justify-between overflow-hidden animate-in zoom-in-95 duration-150"
          >
            {/* Header del Modal */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-3.5 border-b border-outline-variant/60 bg-surface-bright shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-fixed text-primary flex items-center justify-center shrink-0">
                  <GitFork className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="synaptic-modal-title" className="text-base font-semibold text-on-surface">
                    Mapa Sináptico de Acciones, Competencias y Valor
                  </h3>
                  <p className="text-xs text-outline">
                    Flujo interactivo con anclaje de flechas: Personas &rarr; Habilidades DNA &rarr; Squads &rarr; Actividades &rarr; Impacto
                  </p>
                </div>
              </div>

              {/* Controles de Cierre */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-dim text-xs text-on-surface-variant font-medium border border-outline-variant/60">
                  <Move className="w-3.5 h-3.5 text-primary" />
                  <span>Arrastrá el lienzo para moverte o usá la rueda para zoom</span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSynapticModalOpen(false)}
                  className="w-8 h-8 rounded-lg hover:bg-surface-dim flex items-center justify-center text-outline hover:text-on-surface cursor-pointer transition-colors"
                  title="Cerrar modal (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Lienzo Interactivo con React Flow */}
            <div className="flex-1 w-full h-[66vh] min-h-[500px] relative bg-surface-dim/40">
              <ReactFlow
                nodes={flowNodes}
                edges={flowEdges}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.12 }}
                minZoom={0.35}
                maxZoom={1.5}
                proOptions={{ hideAttribution: true }}
              >
                <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#CBD5E1" />
                <Controls
                  showInteractive={false}
                  className="!bg-surface-bright !border-outline-variant !shadow-md !rounded-xl overflow-hidden"
                />

                {/* Panel Superior con Leyendas de Columnas */}
                <Panel position="top-left" className="!m-4 flex items-center gap-6 pointer-events-none">
                  <div className="flex items-center gap-4 bg-surface-bright/95 backdrop-blur-md px-4 py-2 rounded-xl shadow-xs border border-outline-variant text-xs font-semibold text-on-surface">
                    <span className="flex items-center gap-1.5 text-primary">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      1. Personas
                    </span>
                    <span className="text-outline/50">&rarr;</span>
                    <span className="flex items-center gap-1.5 text-primary">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      2. Habilidades
                    </span>
                    <span className="text-outline/50">&rarr;</span>
                    <span className="flex items-center gap-1.5 text-primary">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      3. Squads
                    </span>
                    <span className="text-outline/50">&rarr;</span>
                    <span className="flex items-center gap-1.5 text-primary">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      4. Actividades
                    </span>
                    <span className="text-outline/50">&rarr;</span>
                    <span className="flex items-center gap-1.5 text-secondary">
                      <span className="w-2 h-2 rounded-full bg-secondary" />
                      5. Impacto
                    </span>
                  </div>
                </Panel>
              </ReactFlow>
            </div>

            {/* Footer del Modal: Leyenda y Controles de Acción */}
            <div className="px-6 py-3 border-t border-outline-variant/60 bg-surface-bright flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-3.5 h-1 rounded-full ${
                      currentChain.isSpof ? 'bg-amber-500' : 'bg-primary'
                    }`}
                  />
                  <span className="text-on-surface font-semibold">
                    Conexión activa de {activePerson.name} {currentChain.isSpof ? '(SPOF)' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-1 bg-outline-variant rounded-full" />
                  <span className="text-outline">Otras conexiones</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-on-surface-variant">Óptimo</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-on-surface-variant">SPOF (Riesgo)</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleGoToEmployee}
                >
                  Ver Ficha 360°
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSynapticModalOpen(false)}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
