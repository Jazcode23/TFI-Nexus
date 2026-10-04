import { ScreenId } from './types';

/**
 * Fuente única de verdad de la navegación: rutas, nombres visibles, íconos y grupos del menú.
 * Si se agrega un módulo nuevo, se declara acá y aparece en el menú, los breadcrumbs y el título de la pestaña.
 */
export interface ModuleRoute {
  id: ScreenId;
  path: string;
  title: string;
  subtitle: string;
  icon: string;
  group: string;
}

export interface NavGroup {
  key: string;
  label: string;
  description: string;
}

export const MODULES: ModuleRoute[] = [
  { id: 'dashboard-ejecutivo', path: '/', title: 'Inicio', subtitle: 'Resumen e indicadores clave', icon: 'home', group: 'panorama' },
  { id: 'talent-map', path: '/talento', title: 'Talento y Competencias', subtitle: 'Personas, habilidades y criticidad', icon: 'hub', group: 'panorama' },
  { id: 'puestos', path: '/puestos', title: 'Puestos y Perfiles', subtitle: 'Catálogo oficial (12 tablas del Word)', icon: 'work', group: 'organizacion' },
  { id: 'empleados', path: '/personas', title: 'Colaboradores', subtitle: 'Directorio y legajos por puesto', icon: 'group', group: 'organizacion' },
  { id: 'reclutamiento', path: '/reclutamiento', title: 'Selección de Personal', subtitle: 'Candidatos asociados a puestos', icon: 'person_search', group: 'ciclo' },
  { id: 'evaluacion-desempeno', path: '/desempeno', title: 'Evaluación de Desempeño', subtitle: 'Matriz 9-Box y estándares del puesto', icon: 'fact_check', group: 'ciclo' },
  { id: 'reportes-metricas', path: '/reportes', title: 'Informes y Fichas', subtitle: 'Fichas de puestos y actas oficiales', icon: 'query_stats', group: 'ciclo' },
];

export const NAV_GROUPS: NavGroup[] = [
  { key: 'panorama', label: 'Visión general', description: 'Panorama estratégico de la organización' },
  { key: 'organizacion', label: 'Estructura y puestos', description: 'Modelo oficial del manual de puestos (Word)' },
  { key: 'ciclo', label: 'Ciclo de talento', description: 'Selección, desempeño e informes oficiales' },
];

export const SCREEN_PATHS = Object.fromEntries(
  MODULES.map((m) => [m.id, m.path])
) as Record<ScreenId, string>;

/** Devuelve el módulo al que pertenece una URL (p. ej. /personas/lucas → Personas). */
export function getModuleByPath(pathname: string): ModuleRoute | undefined {
  const first = pathname.split('/').filter(Boolean)[0];
  return MODULES.find((m) => m.path === (first ? `/${first}` : '/'));
}

export const APP_NAME = 'NEXUS';
