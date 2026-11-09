import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useBreadcrumbs } from '../hooks/useBreadcrumbs';
import { FromState } from '../hooks/useScreenNavigate';
import { ArrowLeft, ChevronRight, Home } from 'lucide-react';

/** Muestra la jerarquía de navegación y acceso rápido de retorno */
export const Breadcrumbs: React.FC = () => {
  const crumbs = useBreadcrumbs();
  const location = useLocation();
  if (crumbs.length <= 1) return null; // En Inicio no hace falta.

  const from = (location.state as FromState | null)?.from;
  const parent = crumbs[crumbs.length - 2];
  const back = from && from.path !== location.pathname ? { path: from.path, label: from.label } : { path: parent.path, label: parent.label };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pt-4 pb-2 flex flex-wrap items-center gap-x-3 gap-y-2">
      <Link
        to={back.path}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-bright border border-outline-variant/70 text-xs font-medium text-on-surface hover:bg-surface-dim transition-all shadow-2xs active:scale-[0.98]"
      >
        <ArrowLeft className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
        <span>Volver a {back.label}</span>
      </Link>

      <nav aria-label="Ruta de navegación">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs text-outline">
          <li className="flex items-center">
            <Link
              to="/"
              className="flex items-center text-outline hover:text-primary transition-colors p-1 rounded-md"
              title="Ir al Inicio"
            >
              <Home className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </li>
          {crumbs.map((c, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <li key={c.path + i} className="flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-outline/40" aria-hidden="true" />
                {isLast ? (
                  <span aria-current="page" className="font-semibold text-on-surface bg-surface-dim px-2 py-0.5 rounded text-xs border border-outline-variant/40">
                    {c.label}
                  </span>
                ) : (
                  <Link to={c.path} className="hover:text-primary transition-colors font-medium text-xs">
                    {c.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};
