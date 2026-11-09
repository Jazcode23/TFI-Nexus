import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';
import { UserRole } from '../types';
import { UserAvatar } from './UserAvatar';
import { ChevronDown, ChevronUp, Check, LogIn, LogOut, UserCog, ShieldCheck } from 'lucide-react';

export const UserProfileMenu: React.FC = () => {
  const navigate = useNavigate();
  const { user, role, permissions, loginAs, logout, openLoginModal } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  if (!user) {
    return (
      <button
        onClick={() => navigate('/login')}
        className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-medium text-xs hover:bg-primary-container transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-[0.98]"
      >
        <LogIn className="w-3.5 h-3.5" />
        Iniciar Sesión
      </button>
    );
  }

  const roleLabels: Record<UserRole, { label: string; badgeColor: string }> = {
    ADMIN_HR: { label: 'Administrador RRHH', badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    MANAGER: { label: 'Líder / Manager', badgeColor: 'bg-blue-50 text-blue-800 border-blue-200' },
    RECRUITER: { label: 'Atracción de Talento', badgeColor: 'bg-amber-50 text-amber-900 border-amber-200' },
    EMPLOYEE: { label: 'Colaborador', badgeColor: 'bg-primary/10 text-primary border-primary/20' },
  };

  const currentRoleMeta = roleLabels[role] || { label: role, badgeColor: 'bg-surface-dim text-on-surface' };

  return (
    <div className="relative" ref={menuRef}>
      {/* Profile Button in Header */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-lg hover:bg-surface-dim transition-all border border-transparent hover:border-outline-variant/50 cursor-pointer text-left"
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
          <span className="text-xs font-semibold text-on-surface leading-tight truncate max-w-[130px]">
            {user.name}
          </span>
          <span className="text-[10px] text-outline leading-tight font-medium">
            {role === 'ADMIN_HR' ? 'Administrador' : user.area || role}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-3.5 h-3.5 text-outline" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-outline" />
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Opciones de perfil de usuario"
          className="absolute right-0 top-full mt-2 w-76 bg-surface-bright rounded-xl shadow-lg border border-outline-variant/70 p-3.5 z-50 animate-in fade-in duration-150 flex flex-col gap-3"
        >
          {/* User Card */}
          <div className="flex items-center gap-3 pb-3 border-b border-outline-variant/40">
            <UserAvatar name={user.name} size="md" shape="rounded" />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-on-surface block truncate">
                {user.name}
              </span>
              <span className="text-[11px] text-outline block truncate">
                {user.email}
              </span>
              <span className={`inline-block mt-1 px-2 py-0.2 rounded text-[10px] font-medium border ${currentRoleMeta.badgeColor}`}>
                {currentRoleMeta.label}
              </span>
            </div>
          </div>

          {/* Permissions Overview */}
          <div className="p-2.5 bg-surface-dim rounded-lg flex flex-col gap-1 text-xs border border-outline-variant/40">
            <div className="flex items-center justify-between text-[11px] font-medium text-outline">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-primary" />
                Nivel de Acceso:
              </span>
              <span className="text-primary font-semibold">
                {role === 'ADMIN_HR' ? 'Total (16/16)' : `${permissions.length} permisos`}
              </span>
            </div>
            {role === 'ADMIN_HR' && (
              <span className="text-[10px] text-emerald-800 font-medium">
                Control Total de Estructura y Talento
              </span>
            )}
          </div>

          {/* Quick Switch Profiles */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-outline">
              Cambiar rol demo:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(DEMO_CREDENTIALS) as UserRole[]).map((r) => {
                const isSelected = role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      loginAs(r);
                      setIsOpen(false);
                    }}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all text-left flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-on-primary shadow-2xs font-semibold'
                        : 'bg-surface-dim hover:bg-surface-container text-on-surface border border-outline-variant/40'
                    }`}
                  >
                    <span className="truncate">{r === 'ADMIN_HR' ? 'Admin' : r}</span>
                    {isSelected && <Check className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-outline-variant/40 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                openLoginModal();
              }}
              className="text-xs text-primary font-medium hover:underline flex items-center gap-1 cursor-pointer py-1"
            >
              <UserCog className="w-3.5 h-3.5" />
              Otra cuenta
            </button>
            <button
              type="button"
              onClick={() => {
                logout();
                setIsOpen(false);
                navigate('/login');
              }}
              className="text-xs text-error font-medium hover:underline flex items-center gap-1 cursor-pointer py-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
