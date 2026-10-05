import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { APP_NAME, MODULES, NAV_GROUPS } from '../routes';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

/** Menú lateral. Soporta modo expandido y colapsado (solo iconos). */
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
          className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Menú principal"
        className={`fixed top-0 bottom-0 left-0 bg-surface-container-lowest z-50 flex flex-col shadow-[0_1px_8px_rgba(0,0,0,0.06)] border-r border-outline-variant/30 transition-all duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}`}
      >
        {/* Sidebar Header */}
        <div
          className={`h-20 border-b border-outline-variant/20 shrink-0 flex items-center relative ${
            isCollapsed ? 'justify-center px-2' : 'justify-between px-5'
          }`}
        >
          {isCollapsed ? (
            <div className="flex items-center justify-center w-full relative">
              <Link
                to="/"
                onClick={onCloseMobile}
                className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm hover:opacity-90 transition-opacity"
                title={`${APP_NAME} - Ir al inicio`}
                aria-label={`${APP_NAME} - Ir al inicio`}
              >
                <span className="material-symbols-outlined text-[24px]">hub</span>
              </Link>
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden lg:flex absolute -right-4 top-1.5 w-6 h-6 rounded-full bg-surface-container-lowest border border-outline-variant/40 shadow-sm items-center justify-center text-outline hover:text-primary hover:border-primary transition-all cursor-pointer z-50"
                title="Expandir menú lateral"
                aria-label="Expandir menú lateral"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/"
                onClick={onCloseMobile}
                className="flex items-center gap-3 group min-w-0"
                aria-label={`${APP_NAME} - Ir al inicio`}
              >
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm shrink-0">
                  <span className="material-symbols-outlined text-[24px]">hub</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-lg tracking-tight text-on-surface font-extrabold group-hover:text-primary transition-colors truncate">
                    {APP_NAME}
                  </span>
                  <span className="text-[11px] text-on-surface-variant font-medium truncate">
                    Gestión Integral de Talento
                  </span>
                </div>
              </Link>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className="hidden lg:flex p-1.5 rounded-xl text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                  title="Colapsar menú lateral"
                  aria-label="Colapsar menú lateral"
                >
                  <span className="material-symbols-outlined text-xl">menu_open</span>
                </button>
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="lg:hidden p-2 rounded-xl text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                  title="Cerrar menú"
                  aria-label="Cerrar menú"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Navigation Items */}
        <div
          className={`flex-1 overflow-y-auto py-4 space-y-4 ${
            isCollapsed ? 'px-2' : 'px-3.5'
          }`}
        >
          {NAV_GROUPS.map((group) => (
            <nav key={group.key} aria-label={group.label} className="space-y-1">
              {isCollapsed ? (
                <div className="w-6 h-px bg-outline-variant/30 my-2 mx-auto" />
              ) : (
                <div className="px-3 pb-1 pt-1">
                  <div className="text-[10px] font-black uppercase tracking-wider text-outline/80">
                    {group.label}
                  </div>
                </div>
              )}

              {MODULES.filter((m) => m.group === group.key).map((item) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={onCloseMobile}
                  title={isCollapsed ? item.title : undefined}
                  className={({ isActive }) =>
                    `rounded-xl transition-all group flex items-center ${
                      isCollapsed
                        ? `justify-center h-10 w-10 mx-auto ${
                            isActive
                              ? 'bg-primary text-on-primary font-bold shadow-xs'
                              : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                          }`
                        : `justify-between px-3 py-2 w-full text-left ${
                            isActive
                              ? 'bg-primary text-on-primary font-bold shadow-xs'
                              : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
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
                        <span
                          className={`material-symbols-outlined text-[20px] shrink-0 ${
                            isActive ? 'text-on-primary' : 'text-outline group-hover:text-primary'
                          }`}
                          aria-hidden="true"
                        >
                          {item.icon}
                        </span>
                        {!isCollapsed && (
                          <span
                            className={`text-xs truncate ${
                              isActive ? 'font-black text-on-primary' : 'font-semibold text-on-surface'
                            }`}
                          >
                            {item.title}
                          </span>
                        )}
                        {isCollapsed && item.id === 'reclutamiento' && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary ring-2 ring-surface-container-lowest" />
                        )}
                      </div>
                      {!isCollapsed && item.id === 'reclutamiento' && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-1.5 ${
                            isActive ? 'bg-white/20 text-white' : 'bg-primary-fixed text-primary'
                          }`}
                        >
                          12
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          ))}
        </div>

        {/* Footer / Toggle & Help Center */}
        <div className="p-2 border-t border-outline-variant/20 shrink-0">
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={onToggleCollapse}
                className="w-10 h-10 rounded-xl bg-surface-container-low hover:bg-surface-container text-outline hover:text-primary transition-colors flex items-center justify-center cursor-pointer"
                title="Expandir menú lateral"
                aria-label="Expandir menú lateral"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
              <div
                className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary"
                title="Centro de Ayuda (Q4)"
              >
                <span className="material-symbols-outlined text-[18px]">support_agent</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-1.5 px-1">
              <div className="p-2 rounded-xl border border-outline-variant/20 bg-surface-container-low flex items-center gap-2 text-xs flex-1 min-w-0">
                <span className="material-symbols-outlined text-primary text-[18px] shrink-0">
                  support_agent
                </span>
                <span className="text-[11px] font-semibold text-on-surface truncate">
                  Centro de Ayuda
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-surface-container text-outline ml-auto shrink-0">
                  Q4
                </span>
              </div>
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden lg:flex p-2 rounded-xl text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer shrink-0"
                title="Colapsar menú lateral"
                aria-label="Colapsar menú lateral"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
