import React, { Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Breadcrumbs } from './Breadcrumbs';
import { useBreadcrumbs } from '../hooks/useBreadcrumbs';
import { APP_NAME } from '../routes';

/** Estructura compartida por todas las páginas: menú, cabecera, ruta de navegación y contenido. */
export const Layout: React.FC = () => {
  const [selectedCampus, setSelectedCampus] = useState<string>('Campus Central');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('nexus_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('nexus_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const { pathname } = useLocation();
  const crumbs = useBreadcrumbs();
  const moduleKey = pathname.split('/')[1] ?? '';

  // Al cambiar de módulo: volver arriba y cerrar el menú del celular.
  useEffect(() => {
    window.scrollTo({ top: 0 });
    setIsMobileSidebarOpen(false);
  }, [moduleKey]);

  useEffect(() => setIsMobileSidebarOpen(false), [pathname]);

  // El título de la pestaña indica dónde está el usuario.
  const current = crumbs[crumbs.length - 1]?.label ?? 'Inicio';
  useEffect(() => {
    document.title = `${current} · ${APP_NAME}`;
  }, [current]);

  useEffect(() => {
    if (!isMobileSidebarOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsMobileSidebarOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMobileSidebarOpen]);

  return (
    <div className="min-h-screen bg-surface flex text-on-surface antialiased selection:bg-primary/20 selection:text-primary font-body">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[70] focus:bg-primary focus:text-on-primary focus:px-4 focus:py-2 focus:rounded-xl">
        Saltar al contenido
      </a>

      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebarCollapse}
      />

      <div
        className={`flex-1 ml-0 ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        } flex flex-col min-h-screen min-w-0 transition-all duration-300 ease-in-out`}
      >
        <Header
          selectedCampus={selectedCampus}
          onSelectCampus={setSelectedCampus}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        <main id="contenido" className="flex-1 mt-20 pb-16 overflow-x-hidden">
          <Breadcrumbs />
          <Suspense
            fallback={
              <div className="w-full px-8 py-16 flex items-center justify-center gap-2 text-sm text-on-surface-variant" role="status">
                <span className="material-symbols-outlined animate-spin text-primary" aria-hidden="true">progress_activity</span>
                Cargando sección...
              </div>
            }
          >
            <Outlet context={{ selectedCampus }} />
          </Suspense>
        </main>
      </div>
    </div>
  );
};
