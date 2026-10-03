import { useLocation } from 'react-router-dom';
import { EMPLOYEES_DATA, JOB_POSITIONS } from '../data/mockData';
import { getModuleByPath } from '../routes';

export interface Crumb {
  label: string;
  path: string;
}

/** Arma el recorrido "Inicio > Personas > Juan Pérez > Evaluación de desempeño" a partir de la URL. */
export function useBreadcrumbs(): Crumb[] {
  const { pathname } = useLocation();
  const mod = getModuleByPath(pathname);
  const segments = pathname.split('/').filter(Boolean);
  if (!mod) return [{ label: 'Inicio', path: '/' }, { label: 'Página no encontrada', path: pathname }];

  const crumbs: Crumb[] = [{ label: 'Inicio', path: '/' }];
  if (mod.path === '/') return crumbs;
  crumbs.push({ label: mod.title, path: mod.path });

  const detail = segments[1] ? decodeURIComponent(segments[1]) : undefined;
  if (detail) {
    if (mod.path === '/personas') {
      const emp = EMPLOYEES_DATA.find((e) => e.id === detail);
      if (emp) crumbs.push({ label: emp.name, path: `/personas/${emp.id}` });
    } else {
      const job = JOB_POSITIONS.find((j) => j.code === detail);
      if (job) crumbs.push({ label: job.title, path: `${mod.path}/${job.code}` });
    }
  }
  if (mod.path === '/personas' && segments[2] === 'evaluar' && crumbs.length === 3) {
    crumbs.push({ label: 'Evaluación de desempeño', path: pathname });
  }
  return crumbs;
}
