import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { APP_NAME, MODULES, NAV_GROUPS } from '../routes';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

/** Menú lateral. La página actual se resalta sola (NavLink) y se anuncia con aria-current="page". */
export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen = false, onCloseMobile }) => {
  return (
    <>
      {isMobileOpen && (
        <div onClick={onCloseMobile} className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-40 lg:hidden transition-opacity" aria-hidden="true" />
      )}

      <aside
        aria-label="Menú principal"
        className={`fixed top-0 bottom-0 left-0 w-72 bg-surface-container-lowest z-50 flex flex-col shadow-[0_1px_8px_rgba(0,0,0,0.06)] border-r border-outline-variant/30 transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-20 px-6 flex items-center justify-between border-b border-outline-variant/20 shrink-0">
          <Link to="/" onClick={onCloseMobile} className="flex items-center gap-3 group" aria-label={`${APP_NAME} - Ir al inicio`}>
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm">
              <span className="material-symbols-outlined text-[24px]">hub</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg tracking-tight text-on-surface font-extrabold group-hover:text-primary transition-colors">{APP_NAME}</span>
              <span className="text-[11px] text-on-surface-variant font-medium">Gestión Integral de Talento</span>
            </div>
          </Link>

          <button type="button" onClick={onCloseMobile} className="lg:hidden p-2 rounded-xl text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer" title="Cerrar menú" aria-label="Cerrar menú">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          {NAV_GROUPS.map((group) => (
            <nav key={group.key} aria-label={group.label} className="space-y-1">
              <div className="px-3 pb-1">
                <div className="text-[11px] font-black uppercase tracking-wider text-outline">{group.label}</div>
                <div className="text-[10px] text-outline/80 font-normal">{group.description}</div>
              </div>

              {MODULES.filter((m) => m.group === group.key).map((item) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `w-full text-left flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group ${
                      isActive ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`material-symbols-outlined text-[20px] shrink-0 ${isActive ? 'text-on-primary' : 'text-outline group-hover:text-primary'}`} aria-hidden="true">
                          {item.icon}
                        </span>
                        <div className="truncate">
                          <div className={`text-xs ${isActive ? 'font-black text-on-primary' : 'font-bold text-on-surface'}`}>{item.title}</div>
                          <div className={`text-[10px] truncate ${isActive ? 'text-on-primary/80 font-medium' : 'text-outline font-normal'}`}>{item.subtitle}</div>
                        </div>
                      </div>
                      {item.id === 'reclutamiento' && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-1.5 ${isActive ? 'bg-white/20 text-white' : 'bg-primary-fixed text-primary'}`}>
                          12 candidatos
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          ))}
        </div>

        <div className="p-3.5 bg-surface-container-low mx-3 mb-4 rounded-2xl border border-outline-variant/30 shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-[18px]">support_agent</span>
            <span className="text-xs font-bold text-on-surface">¿Necesitás ayuda?</span>
          </div>
          <p className="text-[11px] text-on-surface-variant leading-snug">
            Todas las pantallas cuentan con una <strong>Guía Rápida</strong> para orientarte en un solo clic.
          </p>
        </div>
      </aside>
    </>
  );
};
