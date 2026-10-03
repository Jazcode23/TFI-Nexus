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
  { id: 'talent-map', path: '/talento', title: 'Talento y Habilidades', subtitle: 'Personas, habilidades y puestos', icon: 'hub', group: 'panorama' },
  { id: 'value-map', path: '/cadena-valor', title: 'Áreas y Actividades', subtitle: 'Áreas clave del negocio', icon: 'schema', group: 'panorama' },
  { id: 'puestos', path: '/puestos', title: 'Puestos y Perfiles', subtitle: 'Catálogo de cargos y requisitos', icon: 'work', group: 'personas' },
  { id: 'empleados', path: '/personas', title: 'Personas', subtitle: 'Directorio y ficha del personal', icon: 'group', group: 'personas' },
  { id: 'reclutamiento', path: '/reclutamiento', title: 'Selección de Personal', subtitle: 'Candidatos en selección', icon: 'person_search', group: 'personas' },
  { id: 'evaluacion-desempeno', path: '/desempeno', title: 'Desempeño', subtitle: 'Calificaciones y matriz de 9 cajas', icon: 'fact_check', group: 'crecimiento' },
  { id: 'capacitacion-upskilling', path: '/capacitacion', title: 'Capacitación', subtitle: 'Planes de aprendizaje y avance', icon: 'trending_up', group: 'crecimiento' },
  { id: 'reportes-metricas', path: '/reportes', title: 'Informes', subtitle: 'Informes descargables en PDF/Excel', icon: 'query_stats', group: 'crecimiento' },
];

export const NAV_GROUPS: NavGroup[] = [
  { key: 'panorama', label: 'Visión general', description: 'Panorama de la organización' },
  { key: 'personas', label: 'Puestos y personas', description: 'Cargos, colaboradores y selección' },
  { key: 'crecimiento', label: 'Crecimiento y resultados', description: 'Desempeño, cursos e informes' },
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
