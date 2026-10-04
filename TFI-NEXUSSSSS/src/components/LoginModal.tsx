import React, { useState } from 'react';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';
import { UserRole } from '../types';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, closeLoginModal, login, loginAs, isLoading, user } = useAuth();
  const [email, setEmail] = useState('admin@nexus.com');
  const [password, setPassword] = useState('Admin1234!');
  const [error, setError] = useState<string | null>(null);

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err?.message || 'Error al iniciar sesión. Verifique sus credenciales.');
    }
  };

  const handleQuickSwitch = async (role: UserRole) => {
    setError(null);
    try {
      await loginAs(role);
    } catch (err: any) {
      setError(err?.message || 'Error al cambiar de cuenta.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest w-full max-w-lg rounded-3xl border border-outline-variant/40 shadow-2xl p-6 sm:p-8 flex flex-col gap-6 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={closeLoginModal}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-outline hover:text-on-surface transition-colors cursor-pointer"
          aria-label="Cerrar modal"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-8 h-8 rounded-xl bg-primary text-on-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-base">lock</span>
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-primary">
              Control de Accesos y Seguridad
            </span>
          </div>
          <h2 className="text-2xl font-black text-on-surface font-headline tracking-tight">
            Iniciar Sesión en NEXUS
          </h2>
          <p className="text-xs text-outline mt-1">
            Iniciá sesión para acceder a las funciones y permisos correspondientes a tu rol en la organización.
          </p>
        </div>

        {/* Current Active User Banner */}
        {user && (
          <div className="p-3.5 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <div>
                <span className="font-bold text-on-surface block">{user.name}</span>
                <span className="text-[11px] text-outline">{user.email} &bull; {user.role}</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-primary/10 text-primary uppercase">
              Sesión Activa
            </span>
          </div>
        )}

        {/* Quick 1-Click Access as Admin */}
        <div className="p-4 bg-gradient-to-r from-primary/10 via-surface-container to-surface-container-low rounded-2xl border border-primary/20 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-amber-500 text-sm">workspace_premium</span>
              Acceso Rápido Recomendado
            </span>
            <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              Todos los Permisos
            </span>
          </div>
          <p className="text-[11px] text-on-surface-variant leading-snug">
            Accedé como <strong>Administrador General de Recursos Humanos (ADMIN_HR)</strong> para crear puestos, gestionar vacantes, calibrar evaluaciones y simular la cadena de valor sin restricciones.
          </p>
          <button
            onClick={() => handleQuickSwitch('ADMIN_HR')}
            disabled={isLoading}
            className="w-full mt-1 py-2.5 px-4 bg-primary text-on-primary rounded-xl font-bold text-xs hover:bg-primary-container transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
            {isLoading ? 'Autenticando...' : 'Entrar con Rol Administrador (admin@nexus.com)'}
          </button>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <span className="text-[11px] font-extrabold text-outline uppercase tracking-wider">
            O ingresá con tus credenciales
          </span>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-on-surface block mb-1">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@nexus.com"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-on-surface block mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-1 py-2.5 px-4 bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant/40 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">login</span>
            {isLoading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Demo Roles Quick Switcher */}
        <div className="pt-3 border-t border-outline-variant/30 flex flex-col gap-2">
          <span className="text-[10px] font-extrabold text-outline uppercase tracking-wider">
            Probar otros perfiles del sistema:
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {(Object.entries(DEMO_CREDENTIALS) as [UserRole, (typeof DEMO_CREDENTIALS)[UserRole]][]).map(
              ([roleKey, item]) => {
                const isActive = user?.role === roleKey;
                return (
                  <button
                    key={roleKey}
                    type="button"
                    onClick={() => handleQuickSwitch(roleKey)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-0.5 ${
                      isActive
                        ? 'bg-primary/10 border-primary text-primary font-bold'
                        : 'bg-surface-container-low border-outline-variant/30 text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase">{roleKey}</span>
                      {isActive && <span className="material-symbols-outlined text-xs">check</span>}
                    </div>
                    <span className="text-xs font-bold truncate">{item.user.name}</span>
                    <span className="text-[10px] text-outline truncate">{item.user.title}</span>
                  </button>
                );
              },
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
