import React, { useState, useRef, useEffect } from 'react';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';
import { UserRole } from '../types';
import { UserAvatar } from './UserAvatar';

export const UserProfileMenu: React.FC = () => {
  const { user, role, permissions, loginAs, logout, openLoginModal } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <button
        onClick={openLoginModal}
        className="px-3.5 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-container transition-all flex items-center gap-2 cursor-pointer shadow-xs"
      >
        <span className="material-symbols-outlined text-sm">login</span>
        Iniciar Sesión
      </button>
    );
  }

  const roleLabels: Record<UserRole, { label: string; badgeColor: string }> = {
    ADMIN_HR: { label: 'Administrador (Acceso Total)', badgeColor: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' },
    MANAGER: { label: 'Líder / Manager', badgeColor: 'bg-blue-500/10 text-blue-700 border-blue-500/20' },
    RECRUITER: { label: 'Atracción de Talento', badgeColor: 'bg-amber-500/10 text-amber-800 border-amber-500/20' },
    EMPLOYEE: { label: 'Colaborador', badgeColor: 'bg-purple-500/10 text-purple-700 border-purple-500/20' },
  };

  const currentRoleMeta = roleLabels[role] || { label: role, badgeColor: 'bg-surface-container text-on-surface' };

  return (
    <div className="relative" ref={menuRef}>
      {/* Profile Button in Header */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 pl-2 sm:pl-3 pr-2 py-1.5 rounded-2xl hover:bg-surface-container-high transition-colors border border-transparent hover:border-outline-variant/30 cursor-pointer text-left"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Menú de usuario y permisos"
      >
        <UserAvatar
          name={user.name}
          size="sm"
          shape="rounded"
          showStatus={true}
          statusColor={role === 'ADMIN_HR' ? 'emerald' : 'primary'}
        />
        <div className="hidden sm:flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-on-surface leading-tight truncate max-w-[150px]">
              {user.name}
            </span>
            {role === 'ADMIN_HR' && (
              <span className="material-symbols-outlined text-amber-500 text-[14px]">
                verified
              </span>
            )}
          </div>
          <span className="text-[10px] text-outline leading-tight font-medium">
            {role === 'ADMIN_HR' ? 'Administrador General' : user.area || role}
          </span>
        </div>
        <span className="material-symbols-outlined text-outline text-base">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant/40 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col gap-3.5">
          {/* User Card */}
          <div className="flex items-start gap-3 pb-3 border-b border-outline-variant/30">
            <UserAvatar name={user.name} size="md" shape="rounded" />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-extrabold text-on-surface block truncate">
                {user.name}
              </span>
              <span className="text-[11px] text-outline block truncate">
                {user.email}
              </span>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${currentRoleMeta.badgeColor}`}>
                {currentRoleMeta.label}
              </span>
            </div>
          </div>

          {/* Permissions Overview */}
          <div className="p-3 bg-surface-container-low rounded-2xl flex flex-col gap-1.5 text-xs">
            <div className="flex items-center justify-between text-[11px] font-bold text-outline">
              <span>Permisos activos:</span>
              <span className="text-primary font-black">
                {role === 'ADMIN_HR' ? '16 / 16 (Totales)' : `${permissions.length} activos`}
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {role === 'ADMIN_HR' ? (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-800 text-[10px] font-bold">
                  ✓ Crear y modificar puestos de trabajo
                </span>
              ) : null}
              {role === 'ADMIN_HR' ? (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-800 text-[10px] font-bold">
                  ✓ Abrir vacantes y enviar ofertas
                </span>
              ) : null}
              {role === 'ADMIN_HR' ? (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-800 text-[10px] font-bold">
                  ✓ Calibrar 9-Box y Simulación Porter
                </span>
              ) : null}
              {role !== 'ADMIN_HR' && permissions.slice(0, 3).map((p) => (
                <span key={p} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-medium">
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Switch Profiles */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-outline">
              Cambiar rol rápidamente:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(DEMO_CREDENTIALS) as UserRole[]).map((r) => {
                const isSelected = role === r;
                return (
                  <button
                    key={r}
                    onClick={() => {
                      loginAs(r);
                      setIsOpen(false);
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all text-left flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                    }`}
                  >
                    <span>{r === 'ADMIN_HR' ? 'Administrador' : r}</span>
                    {isSelected && <span className="material-symbols-outlined text-xs">check</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-outline-variant/30 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                setIsOpen(false);
                openLoginModal();
              }}
              className="text-xs text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">switch_account</span>
              Iniciar sesión con otra cuenta
            </button>
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              Salir
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
