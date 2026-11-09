import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { APP_NAME, MODULES, NAV_GROUPS } from '../routes';
import {
  LayoutDashboard,
  GitFork,
  Workflow,
  Briefcase,
  Users,
  UserCheck,
  Award,
  GraduationCap,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Layers,
  Command,
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const moduleIconMap: Record<string, React.ElementType> = {
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

/** Menú lateral Minimalista y Profesional para NEXUS HR */
export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen = false,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  return (
    <>
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-on-surface/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Menú principal"
        className={`fixed top-0 bottom-0 left-0 bg-surface-bright z-50 flex flex-col border-r border-outline-variant/60 transition-all duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-[72px]' : 'lg:w-64'}`}
      >
        {/* Sidebar Header */}
        <div
          className={`h-16 border-b border-outline-variant/50 shrink-0 flex items-center relative ${
            isCollapsed ? 'justify-center px-2' : 'justify-between px-5'
          }`}
        >
          {isCollapsed ? (
            <div className="flex items-center justify-center w-full relative">
              <Link
                to="/"
                onClick={onCloseMobile}
                className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-on-primary hover:bg-primary-container transition-all active:scale-95 shadow-2xs"
                title={`${APP_NAME} - Inicio`}
                aria-label={`${APP_NAME} - Inicio`}
              >
                <Layers className="w-5 h-5" />
              </Link>
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden lg:flex absolute -right-3 top-2 w-5 h-5 rounded-full bg-surface-bright border border-outline-variant items-center justify-center text-outline hover:text-primary hover:border-primary shadow-2xs transition-all cursor-pointer z-50"
                title="Expandir menú"
                aria-label="Expandir menú"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/"
                onClick={onCloseMobile}
                className="flex items-center gap-2.5 group min-w-0"
                aria-label={`${APP_NAME} - Inicio`}
              >
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary shrink-0 shadow-2xs group-hover:bg-primary-container transition-all">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold tracking-tight text-on-surface group-hover:text-primary transition-colors">
                      {APP_NAME}
                    </span>
                    <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-surface-dim text-on-surface-variant border border-outline-variant/60">
                      HR
                    </span>
                  </div>
                  <span className="text-[11px] text-outline font-normal truncate">
                    Ecosistema de Talento
                  </span>
                </div>
              </Link>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className="hidden lg:flex p-1.5 rounded-md text-outline hover:text-on-surface hover:bg-surface-dim transition-colors cursor-pointer"
                  title="Colapsar menú"
                  aria-label="Colapsar menú"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="lg:hidden p-1.5 rounded-md text-outline hover:text-on-surface hover:bg-surface-dim transition-colors cursor-pointer"
                  title="Cerrar menú"
                  aria-label="Cerrar menú"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Navigation Groups */}
        <div
          className={`flex-1 overflow-y-auto py-3 space-y-4 ${
            isCollapsed ? 'px-2' : 'px-3'
          }`}
        >
          {NAV_GROUPS.map((group) => (
            <nav key={group.key} aria-label={group.label} className="space-y-0.5">
              {isCollapsed ? (
                <div className="w-5 h-px bg-outline-variant/40 my-2 mx-auto" />
              ) : (
                <div className="px-3 pb-1 pt-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-outline/80">
                    {group.label}
                  </span>
                </div>
              )}

              {MODULES.filter((m) => m.group === group.key).map((item) => {
                const IconComponent = moduleIconMap[item.id] || LayoutDashboard;
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    end={item.path === '/'}
                    onClick={onCloseMobile}
                    title={isCollapsed ? `${item.title}: ${item.subtitle}` : undefined}
                    className={({ isActive }) =>
                      `group flex items-center transition-all ${
                        isCollapsed
                          ? `justify-center h-10 w-10 mx-auto rounded-lg ${
                              isActive
                                ? 'bg-primary/10 text-primary font-semibold'
                                : 'text-on-surface-variant hover:bg-surface-dim hover:text-on-surface'
                            }`
                          : `justify-between px-3 py-2 w-full text-left rounded-lg text-xs ${
                              isActive
                                ? 'bg-primary/10 text-primary font-semibold'
                                : 'text-on-surface-variant hover:bg-surface-dim hover:text-on-surface'
                            }`
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div
                          className={`flex items-center ${
                            isCollapsed ? 'justify-center relative' : 'gap-2.5 min-w-0'
                          }`}
                        >
                          <IconComponent
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive ? 'text-primary' : 'text-outline group-hover:text-primary'
                            }`}
                          />
                          {!isCollapsed && (
                            <div className="flex flex-col min-w-0">
                              <span
                                className={`truncate leading-tight ${
                                  isActive ? 'font-semibold text-primary' : 'font-medium text-on-surface'
                                }`}
                              >
                                {item.title}
                              </span>
                            </div>
                          )}
                          {isCollapsed && item.id === 'reclutamiento' && (
                            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-primary" />
                          )}
                        </div>
                        {!isCollapsed && item.id === 'reclutamiento' && (
                          <span
                            className={`text-[10px] font-medium px-1.5 py-0.2 rounded shrink-0 ml-1.5 ${
                              isActive
                                ? 'bg-primary-fixed text-primary'
                                : 'bg-surface-dim text-outline'
                            }`}
                          >
                            12
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          ))}
        </div>

        {/* Footer Minimalist */}
        <div className="p-3 border-t border-outline-variant/40 shrink-0 bg-surface-bright">
          {isCollapsed ? (
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={onToggleCollapse}
                className="w-8 h-8 rounded-lg text-outline hover:text-primary hover:bg-surface-dim transition-colors flex items-center justify-center cursor-pointer"
                title="Expandir menú"
                aria-label="Expandir menú"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between px-2 py-1 text-[11px] text-outline">
              <span className="flex items-center gap-1.5 font-medium">
                <Command className="w-3 h-3 text-outline" />
                Buscar
              </span>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-dim border border-outline-variant/50 font-mono text-[9px] text-on-surface-variant">
                Ctrl+K
              </kbd>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
