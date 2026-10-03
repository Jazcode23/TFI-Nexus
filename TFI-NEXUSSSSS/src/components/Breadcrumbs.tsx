import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useBreadcrumbs } from '../hooks/useBreadcrumbs';
import { FromState } from '../hooks/useScreenNavigate';

/** Muestra dónde está el usuario y le da un botón claro para volver (a la sección de origen si la hay). */
export const Breadcrumbs: React.FC = () => {
  const crumbs = useBreadcrumbs();
  const location = useLocation();
  if (crumbs.length <= 1) return null; // En Inicio no hace falta.

  const from = (location.state as FromState | null)?.from;
  const parent = crumbs[crumbs.length - 2];
  const back = from && from.path !== location.pathname ? { path: from.path, label: from.label } : { path: parent.path, label: parent.label };

  return (
    <div className="w-full px-6 lg:px-8 pt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
      <Link
        to={back.path}
        className="inline-flex items-center gap-1 pl-2 pr-3 py-1.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-xs font-bold text-primary hover:bg-primary/5 transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_back</span>
        Volver a {back.label}
      </Link>

      <nav aria-label="Ruta de navegación">
        <ol className="flex flex-wrap items-center gap-1 text-xs text-on-surface-variant">
          {crumbs.map((c, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <li key={c.path + i} className="flex items-center gap-1">
                {i > 0 && <span className="material-symbols-outlined text-[16px] text-outline" aria-hidden="true">chevron_right</span>}
                {isLast ? (
                  <span aria-current="page" className="font-bold text-on-surface">{c.label}</span>
                ) : (
                  <Link to={c.path} className="hover:text-primary hover:underline">{c.label}</Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};
