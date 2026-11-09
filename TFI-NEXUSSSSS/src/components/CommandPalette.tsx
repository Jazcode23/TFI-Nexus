import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { JOB_POSITIONS, EMPLOYEES_DATA } from '../data/mockData';
import { MODULES } from '../routes';
import { EmptyState } from './EmptyState';
import {
  Search,
  X,
  Briefcase,
  User,
  LayoutDashboard,
  GitFork,
  Workflow,
  Users,
  UserCheck,
  Award,
  GraduationCap,
  BarChart3,
  CornerDownLeft,
  Key,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

type ResultItem = {
  id: string;
  label: string;
  sublabel?: string;
  icon: React.ElementType;
  path: string;
  category: 'Navegación' | 'Puestos' | 'Colaboradores';
};

const navIconMap: Record<string, React.ElementType> = {
  'dashboard-ejecutivo': LayoutDashboard,
  'talent-map': GitFork,
  'value-map': Workflow,
  'puestos': Briefcase,
  'empleados': Users,
  'reclutamiento': UserCheck,
  'evaluacion-desempeno': Award,
  'capacitacion-upskilling': GraduationCap,
  'reportes-metricas': BarChart3,
};

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);

  // Focus y reset al abrir
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIdx(0);
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const results = useMemo<ResultItem[]>(() => {
    const q = query.toLowerCase().trim();

    // Sin query: mostrar módulos principales de navegación
    if (!q) {
      return MODULES.map((m) => ({
        id: m.path,
        label: m.title,
        sublabel: m.subtitle,
        icon: navIconMap[m.id] || LayoutDashboard,
        path: m.path,
        category: 'Navegación' as const,
      }));
    }

    const navResults: ResultItem[] = MODULES.filter(
      (m) => m.title.toLowerCase().includes(q) || m.subtitle.toLowerCase().includes(q)
    ).map((m) => ({
      id: m.path,
      label: m.title,
      sublabel: m.subtitle,
      icon: navIconMap[m.id] || LayoutDashboard,
      path: m.path,
      category: 'Navegación' as const,
    }));

    const jobResults: ResultItem[] = JOB_POSITIONS.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.code.toLowerCase().includes(q) ||
        j.department.toLowerCase().includes(q)
    )
      .slice(0, 5)
      .map((j) => ({
        id: j.code,
        label: j.title,
        sublabel: `${j.code} • ${j.department}`,
        icon: j.status === 'critical' ? Key : Briefcase,
        path: `/puestos/${j.code}`,
        category: 'Puestos' as const,
      }));

    const empResults: ResultItem[] = EMPLOYEES_DATA.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q) ||
        e.area.toLowerCase().includes(q) ||
        e.empId.toLowerCase().includes(q)
    )
      .slice(0, 5)
      .map((e) => ({
        id: e.id,
        label: e.name,
        sublabel: `${e.role} • ${e.area}`,
        icon: User,
        path: `/personas/${e.id}`,
        category: 'Colaboradores' as const,
      }));

    return [...navResults, ...jobResults, ...empResults].slice(0, 12);
  }, [query]);

  const clampedIdx = Math.min(selectedIdx, Math.max(0, results.length - 1));

  const handleSelect = useCallback(
    (item: ResultItem) => {
      navigate(item.path);
      onClose();
    },
    [navigate, onClose]
  );

  // Navegación por teclado
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx((prev) => (prev + 1 >= results.length ? 0 : prev + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx((prev) => (prev - 1 < 0 ? Math.max(0, results.length - 1) : prev - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[clampedIdx]) {
          handleSelect(results[clampedIdx]);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, results, clampedIdx, handleSelect]);

  if (!isOpen) return null;

  // Agrupar por categoría manteniendo el orden
  const grouped = results.reduce<Record<string, { item: ResultItem; globalIdx: number }[]>>(
    (acc, item, idx) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push({ item, globalIdx: idx });
      return acc;
    },
    {}
  );

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center pt-16 sm:pt-24 px-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      {/* Fondo sutil */}
      <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-xs" aria-hidden="true" />

      {/* Panel flotante de comandos */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Paleta de comandos"
        className="relative w-full max-w-lg bg-surface-bright rounded-xl shadow-xl border border-outline-variant/70 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra de entrada */}
        <div className="flex items-center gap-2.5 px-3.5 py-3 border-b border-outline-variant/50 bg-surface-bright">
          <Search className="w-4 h-4 text-primary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIdx(0);
            }}
            placeholder="Buscar puestos, colaboradores, módulos..."
            className="flex-1 bg-transparent text-xs text-on-surface placeholder:text-outline outline-none font-medium"
            aria-label="Buscar en NEXUS"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-md text-outline hover:text-on-surface hover:bg-surface-dim cursor-pointer"
              title="Borrar texto"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-dim text-[9px] font-mono font-medium text-outline border border-outline-variant/50">
            ESC
          </kbd>
        </div>

        {/* Lista de resultados */}
        <div className="overflow-y-auto max-h-80 p-2" role="listbox">
          {results.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon="search_off"
                title={`Sin resultados para «${query}»`}
                description="Probá buscando por nombre de colaborador, código de puesto (ej: PUE-2026), área o módulo del sistema."
                actionLabel="Borrar búsqueda"
                onAction={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
              />
            </div>
          ) : (
            Object.entries(grouped).map(([category, entries]) => (
              <div key={category} className="mb-2">
                <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-outline flex items-center justify-between">
                  <span>{category}</span>
                  <span className="text-[10px] font-medium text-outline/60">{entries.length}</span>
                </div>
                {entries.map(({ item, globalIdx }) => {
                  const isActive = globalIdx === clampedIdx;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIdx(globalIdx)}
                      className={`w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all cursor-pointer ${
                        isActive
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'hover:bg-surface-dim text-on-surface'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-primary' : 'text-outline'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-medium block truncate">{item.label}</span>
                        {item.sublabel && (
                          <span className="text-[11px] text-on-surface-variant truncate block font-normal">
                            {item.sublabel}
                          </span>
                        )}
                      </div>
                      {isActive && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-primary font-medium bg-primary-fixed/60 px-1.5 py-0.2 rounded">
                          <CornerDownLeft className="w-2.5 h-2.5" />
                          Abrir
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Pie informativo */}
        <div className="px-3 py-2 border-t border-outline-variant/40 bg-surface-dim/40 flex items-center justify-between text-[11px] text-outline">
          <div className="flex items-center gap-3">
            <span>↑↓ Navegar</span>
            <span>↵ Seleccionar</span>
            <span>Esc Cerrar</span>
          </div>
          <span className="font-medium text-primary">NEXUS Omnibox</span>
        </div>
      </div>
    </div>
  );
};
