import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserAvatar } from './UserAvatar';
import { UserProfileMenu } from './UserProfileMenu';

interface HeaderProps {
  selectedCampus: string;
  onSelectCampus: (campus: string) => void;
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedCampus,
  onSelectCampus,
  onToggleMobileSidebar,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Fecha actual formateada en español
  const today = new Date();
  const rawDate = new Intl.DateTimeFormat('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(today);
  const formattedCurrentDate =
    rawDate.charAt(0).toUpperCase() + rawDate.slice(1);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Nueva sugerencia de curso',
      desc: 'Ing. Lucas Valenzuela puede beneficiarse del curso de Gestión de Costos en la Nube.',
      time: 'Hace 10 min',
      path: '/capacitacion',
      unread: true,
    },
    {
      id: 2,
      title: 'Nuevo candidato recomendado',
      desc: 'Mateo Silveira tiene un 96% de afinidad para el puesto de Arquitecto.',
      time: 'Hace 45 min',
      path: '/reclutamiento',
      unread: true,
    },
    {
      id: 3,
      title: 'Evaluación lista para revisión',
      desc: 'El comité revisó las notas del ciclo actual.',
      time: 'Hace 2 horas',
      path: '/desempeno',
      unread: false,
    },
  ]);

  const quickLinks = [
    { label: 'Sofía Méndez (Líder de Ingeniería en IA)', path: '/personas/sofia' },
    { label: 'Ing. Lucas Valenzuela (Arquitecto Principal de Nube)', path: '/personas/lucas' },
    { label: 'PUE-2026-ARCH-03 (Arquitecto de Nube e IA)', path: '/puestos/PUE-2026-ARCH-03' },
    { label: 'Áreas y Actividades: Operaciones Centrales', path: '/cadena-valor' },
    { label: 'Selección de Personal (12 candidatos en proceso)', path: '/reclutamiento' },
    { label: 'Ver matriz de desempeño (9 cajas)', path: '/desempeno' },
    { label: 'Capacitación: catálogo de cursos', path: '/capacitacion' },
  ];

  const filteredLinks = quickLinks.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-20 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 sm:gap-6 border-b border-outline-variant/30">
      {/* Mobile Menu Button + Search Bar */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-2xl">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors cursor-pointer shrink-0"
          title="Abrir menú de navegación"
          aria-label="Abrir menú"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>

        <div className="relative flex items-center w-full">
          <span className="material-symbols-outlined absolute left-3.5 text-outline pointer-events-none text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
            placeholder="Buscar empleados, puestos, habilidades o cursos..."
            className="w-full pl-10 pr-4 py-2 bg-surface-container-low text-on-surface placeholder:text-outline rounded-xl text-xs sm:text-sm outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all border border-transparent focus:border-outline-variant/40"
          />
        </div>

        {/* Live Search Quick Results Dropdown */}
        {showSearchResults && searchQuery.trim().length > 0 && (
          <div className="absolute top-full left-4 sm:left-6 right-4 sm:right-6 max-w-2xl mt-2 bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/40 p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="text-[11px] font-bold uppercase tracking-wider text-outline px-3 py-1.5">
              Accesos Rápidos Encontrados
            </div>
            {filteredLinks.length > 0 ? (
              filteredLinks.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    navigate(item.path);
                    setSearchQuery('');
                    setShowSearchResults(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-on-surface hover:bg-surface-container-low hover:text-primary transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>{item.label}</span>
                  <span className="text-xs text-primary font-bold">Ir a la sección →</span>
                </button>
              ))
            ) : (
              <div className="px-3 py-3 text-xs sm:text-sm text-on-surface-variant">
                No se encontraron resultados para &quot;{searchQuery}&quot;. Probá con otro nombre o palabra clave.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Current Date Badge */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-xl text-on-surface border border-outline-variant/25">
          <span className="material-symbols-outlined text-primary text-[18px]">
            calendar_today
          </span>
          <div className="flex flex-col text-left">
            <span className="text-[9px] text-outline font-black uppercase tracking-wider leading-none">
              Hoy
            </span>
            <span className="text-xs font-bold text-on-surface leading-tight mt-0.5">
              {formattedCurrentDate}
            </span>
          </div>
        </div>

        {/* Campus Selector */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-low rounded-xl text-on-surface border border-outline-variant/20 hover:border-outline-variant/40 transition-colors">
          <span className="material-symbols-outlined text-outline text-[18px]">
            domain
          </span>
          <select
            value={selectedCampus}
            onChange={(e) => onSelectCampus(e.target.value)}
            className="bg-transparent text-xs font-bold text-on-surface outline-none cursor-pointer"
            aria-label="Seleccionar sede u oficina"
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
            className="relative h-10 w-10 flex items-center justify-center rounded-xl bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all cursor-pointer"
            title="Ver avisos y notificaciones"
            aria-label="Notificaciones"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary ring-2 ring-surface-container-lowest" />
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <>
            <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} aria-hidden="true" />
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/40 p-4 z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-on-surface">
                    Avisos del Sistema
                  </h4>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {unreadCount} nuevos
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                  >
                    Marcar leídos
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, unread: false } : x)));
                      navigate(n.path);
                      setShowNotifications(false);
                    }}
                    className={`p-3 rounded-xl cursor-pointer transition-colors text-left ${
                      n.unread
                        ? 'bg-primary/5 hover:bg-primary/10 border-l-3 border-primary'
                        : 'bg-surface-container-low/50 hover:bg-surface-container'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-on-surface">{n.title}</span>
                      <span className="text-[10px] text-outline">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant leading-snug">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            </>
          )}
        </div>

        {/* User Profile & Permissions Menu */}
        <div className="pl-1 sm:pl-2 border-l border-outline-variant/30 flex items-center">
          <UserProfileMenu />
        </div>
      </div>
    </header>
  );
};
