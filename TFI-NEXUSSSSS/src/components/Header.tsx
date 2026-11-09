import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfileMenu } from './UserProfileMenu';
import { Search, Calendar, Building2, Bell, Menu, Check } from 'lucide-react';

interface HeaderProps {
  selectedCampus: string;
  onSelectCampus: (campus: string) => void;
  onToggleMobileSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  onOpenCommandPalette?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedCampus,
  onSelectCampus,
  onToggleMobileSidebar,
  isSidebarCollapsed = false,
  onOpenCommandPalette,
}) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  // Fecha actual formateada en español
  const today = new Date();
  const rawDate = new Intl.DateTimeFormat('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(today);
  const formattedCurrentDate =
    rawDate.charAt(0).toUpperCase() + rawDate.slice(1);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Nueva sugerencia de capacitación',
      desc: 'Ing. Lucas Valenzuela puede beneficiarse del curso de Gestión de Costos en la Nube.',
      time: 'Hace 10 min',
      path: '/capacitacion',
      unread: true,
      category: 'Capacitación',
    },
    {
      id: 2,
      title: 'Candidato con alto matching (96%)',
      desc: 'Mateo Silveira tiene un 96% de afinidad para el puesto de Arquitecto.',
      time: 'Hace 45 min',
      path: '/reclutamiento',
      unread: true,
      category: 'Selección',
    },
    {
      id: 3,
      title: 'Evaluación calibrada disponible',
      desc: 'El comité revisó las calificaciones del ciclo Q4 2026.',
      time: 'Hace 2 horas',
      path: '/desempeno',
      unread: false,
      category: 'Desempeño',
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <header
      className={`fixed top-0 left-0 ${
        isSidebarCollapsed ? 'lg:left-[72px]' : 'lg:left-64'
      } right-0 h-14 bg-surface-bright/95 backdrop-blur-xs z-30 px-4 sm:px-6 flex items-center justify-between gap-3 border-b border-outline-variant/60 transition-all duration-300 ease-in-out`}
    >
      {/* Mobile Menu Button + Omnibox Trigger */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-md">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-dim transition-colors cursor-pointer shrink-0"
          title="Abrir menú"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => onOpenCommandPalette?.()}
          className="w-full flex items-center justify-between pl-3 pr-2 py-1.5 bg-surface-dim hover:bg-surface-container text-outline hover:text-on-surface text-xs rounded-lg border border-outline-variant/50 hover:border-outline-variant transition-all cursor-pointer group text-left"
          title="Buscar puestos, colaboradores, módulos (Ctrl+K)"
          aria-label="Buscar puestos, colaboradores, módulos"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Search className="w-3.5 h-3.5 text-outline group-hover:text-primary transition-colors shrink-0" />
            <span className="truncate text-outline group-hover:text-on-surface-variant font-medium">
              Buscar puestos, colaboradores...
            </span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded bg-surface-bright border border-outline-variant/60 font-mono text-[9px] text-outline group-hover:text-primary transition-colors shrink-0">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Current Date Minimalist */}
        <div className="hidden xl:flex items-center gap-1.5 text-xs text-outline font-medium px-2 py-1">
          <Calendar className="w-3.5 h-3.5 text-outline" />
          <span className="tabular-nums">{formattedCurrentDate}</span>
        </div>

        {/* Campus Selector Minimalist */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-surface-dim rounded-lg text-on-surface border border-outline-variant/50 text-xs">
          <Building2 className="w-3.5 h-3.5 text-outline" />
          <select
            value={selectedCampus}
            onChange={(e) => onSelectCampus(e.target.value)}
            className="bg-transparent text-xs font-medium text-on-surface outline-none cursor-pointer"
            aria-label="Seleccionar sede"
          >
            <option value="Campus Central">Campus Central</option>
            <option value="Sede Concepción">Sede Concepción</option>
            <option value="Sede Monteros">Sede Monteros</option>
            <option value="Sede Alberdi">Sede Alberdi</option>
          </select>
        </div>

        {/* Notifications Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative h-8 w-8 flex items-center justify-center rounded-lg text-outline hover:text-on-surface hover:bg-surface-dim transition-all cursor-pointer border border-transparent hover:border-outline-variant/50"
            title="Ver notificaciones"
            aria-label="Notificaciones"
            aria-expanded={showNotifications}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary ring-2 ring-surface-bright" />
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
                aria-hidden="true"
              />
              <div
                role="dialog"
                aria-label="Panel de notificaciones"
                className="absolute right-0 mt-2 w-80 sm:w-88 bg-surface-bright rounded-xl shadow-lg border border-outline-variant/70 p-3 z-50 animate-in fade-in duration-150"
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-outline-variant/40 mb-2 px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-on-surface">
                      Notificaciones
                    </span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-full bg-primary-fixed text-primary">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="text-[11px] font-medium text-primary hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      Marcar leídas
                    </button>
                  )}
                </div>

                <div className="space-y-1 max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        setNotifications((prev) =>
                          prev.map((x) => (x.id === n.id ? { ...x, unread: false } : x))
                        );
                        navigate(n.path);
                        setShowNotifications(false);
                      }}
                      className={`p-2.5 rounded-lg cursor-pointer transition-all text-left flex flex-col gap-0.5 border ${
                        n.unread
                          ? 'bg-primary/5 hover:bg-primary/10 border-primary/20'
                          : 'bg-transparent hover:bg-surface-dim border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-on-surface">{n.title}</span>
                        <span className="text-[10px] text-outline tabular-nums">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant leading-relaxed">{n.desc}</p>
                      <span className="text-[10px] text-primary font-medium mt-0.5">
                        {n.category} →
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile & Permissions Menu */}
        <div className="pl-1 sm:pl-2 border-l border-outline-variant/40 flex items-center">
          <UserProfileMenu />
        </div>
      </div>
    </header>
  );
};
