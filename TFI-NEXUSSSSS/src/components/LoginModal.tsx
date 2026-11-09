import React, { useState } from 'react';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';
import { UserRole } from '../types';
import { useFocusTrap } from './useFocusTrap';
import { useToast } from './ToastProvider';
import { Lock, Key, UserPlus, X, Zap, AlertCircle, Eye, EyeOff, CheckCircle2, ArrowRight, LogIn } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, closeLoginModal, login, loginAs, register, isLoading, user } = useAuth();
  const { showToast } = useToast();

  const [modalTab, setModalTab] = useState<'demo' | 'credentials' | 'register'>('demo');

  // Credentials State
  const [email, setEmail] = useState('admin@nexus.com');
  const [password, setPassword] = useState('Admin1234!');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('MANAGER');

  const dialogRef = useFocusTrap<HTMLDivElement>(isLoginModalOpen);

  if (!isLoginModalOpen) return null;

  // Handle Credentials Submit
  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email.trim(), password);
      showToast('Sesión iniciada con éxito');
      closeLoginModal();
    } catch (err: any) {
      setError(err?.message || 'Error al iniciar sesión. Verifique sus credenciales.');
    }
  };

  // Handle Quick Switch
  const handleQuickSwitch = async (role: UserRole) => {
    setError(null);
    try {
      await loginAs(role);
      showToast(`Cambiado a perfil ${DEMO_CREDENTIALS[role].user.name}`);
      closeLoginModal();
    } catch (err: any) {
      setError(err?.message || 'Error al cambiar de cuenta.');
    }
  };

  // Handle Register Submit
  const handleSubmitRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setError('Por favor completá todos los campos requeridos.');
      return;
    }
    try {
      await register({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        role: regRole,
      });
      showToast(`Cuenta creada para ${regName}`);
      closeLoginModal();
    } catch (err: any) {
      setError(err?.message || 'Error al registrar la nueva cuenta.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-login-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={closeLoginModal}
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-bright w-full max-w-md rounded-xl border border-outline-variant/70 shadow-xl p-6 flex flex-col gap-4 relative max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={closeLoginModal}
          className="absolute top-4 right-4 p-1 rounded-md text-outline hover:text-on-surface hover:bg-surface-dim transition-colors cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-primary-fixed text-primary flex items-center justify-center">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
              Control de Accesos
            </span>
          </div>
          <h2 id="modal-login-title" className="text-base font-bold text-on-surface tracking-tight">
            Iniciar Sesión o Cambiar Cuenta
          </h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Seleccioná un perfil o ingresá tus credenciales.
          </p>
        </div>

        {/* Current Active User Banner */}
        {user && (
          <div className="p-2.5 bg-primary/5 border border-primary/20 rounded-lg flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <div className="min-w-0">
                <span className="font-semibold text-on-surface truncate block">{user.name}</span>
                <span className="text-[10px] text-outline truncate block">
                  {user.email} • {user.role}
                </span>
              </div>
            </div>
            <span className="px-2 py-0.2 rounded text-[10px] font-semibold bg-primary-fixed text-primary shrink-0">
              Activo
            </span>
          </div>
        )}

        {/* Navigation Tabs in Modal */}
        <div className="flex items-center gap-1 bg-surface-dim p-1 rounded-lg border border-outline-variant/40">
          <button
            type="button"
            onClick={() => { setModalTab('demo'); setError(null); }}
            className={`flex-1 py-1 px-2.5 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              modalTab === 'demo'
                ? 'bg-surface-bright text-on-surface shadow-2xs font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Zap className="w-3 h-3 text-amber-500" />
            1-Click Demo
          </button>

          <button
            type="button"
            onClick={() => { setModalTab('credentials'); setError(null); }}
            className={`flex-1 py-1 px-2.5 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              modalTab === 'credentials'
                ? 'bg-surface-bright text-on-surface shadow-2xs font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Key className="w-3 h-3" />
            Credenciales
          </button>

          <button
            type="button"
            onClick={() => { setModalTab('register'); setError(null); }}
            className={`flex-1 py-1 px-2.5 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              modalTab === 'register'
                ? 'bg-surface-bright text-on-surface shadow-2xs font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <UserPlus className="w-3 h-3" />
            Registrar
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="p-2.5 bg-error/10 border border-error/20 rounded-lg text-error text-xs flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium leading-relaxed text-[11px]">{error}</span>
          </div>
        )}

        {/* TAB 1: DEMO QUICK ACCESS (1-CLICK) */}
        {modalTab === 'demo' && (
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-semibold text-outline uppercase tracking-wider">
              Perfiles disponibles:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {(Object.entries(DEMO_CREDENTIALS) as [UserRole, (typeof DEMO_CREDENTIALS)[UserRole]][]).map(
                ([roleKey, item]) => {
                  const isActive = user?.role === roleKey;
                  return (
                    <button
                      key={roleKey}
                      type="button"
                      onClick={() => handleQuickSwitch(roleKey)}
                      disabled={isLoading}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col gap-1 disabled:opacity-50 ${
                        isActive
                          ? 'bg-primary/10 border-primary text-primary font-medium'
                          : 'bg-surface-bright border-outline-variant/60 text-on-surface hover:border-primary/40 hover:bg-surface-dim'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-medium ${
                          roleKey === 'ADMIN_HR'
                            ? 'bg-emerald-50 text-emerald-800'
                            : roleKey === 'MANAGER'
                            ? 'bg-blue-50 text-blue-800'
                            : roleKey === 'RECRUITER'
                            ? 'bg-amber-50 text-amber-900'
                            : 'bg-purple-50 text-purple-800'
                        }`}>
                          {roleKey}
                        </span>
                        {isActive ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                        ) : (
                          <ArrowRight className="w-3.5 h-3.5 text-outline" />
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-on-surface block truncate">
                          {item.user.name}
                        </span>
                        <span className="text-[10px] text-outline truncate block">
                          {item.user.title}
                        </span>
                      </div>
                    </button>
                  );
                },
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CREDENTIALS FORM */}
        {modalTab === 'credentials' && (
          <form onSubmit={handleSubmitLogin} className="flex flex-col gap-3">
            <div>
              <label htmlFor="modal-email" className="text-xs font-medium text-on-surface block mb-1">
                Correo Electrónico
              </label>
              <Input
                id="modal-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nexus.com"
                required
              />
            </div>

            <div>
              <label htmlFor="modal-password" className="text-xs font-medium text-on-surface block mb-1">
                Contraseña
              </label>
              <div className="relative flex items-center">
                <Input
                  id="modal-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 p-1 text-outline hover:text-on-surface cursor-pointer"
                  title={showPassword ? 'Ocultar' : 'Mostrar'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full mt-1">
              <LogIn className="w-3.5 h-3.5 mr-1" />
              {isLoading ? 'Verificando...' : 'Iniciar Sesión'}
            </Button>
          </form>
        )}

        {/* TAB 3: REGISTER NEW USER */}
        {modalTab === 'register' && (
          <form onSubmit={handleSubmitRegister} className="flex flex-col gap-2.5">
            <div>
              <label htmlFor="modal-reg-name" className="text-xs font-medium text-on-surface block mb-1">
                Nombre Completo
              </label>
              <Input
                id="modal-reg-name"
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Ej. Ing. Daniel Moreno"
              />
            </div>

            <div>
              <label htmlFor="modal-reg-email" className="text-xs font-medium text-on-surface block mb-1">
                Correo Corporativo
              </label>
              <Input
                id="modal-reg-email"
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="daniel@nexus.com"
              />
            </div>

            <div>
              <label htmlFor="modal-reg-role" className="text-xs font-medium text-on-surface block mb-1">
                Rol Asignado
              </label>
              <select
                id="modal-reg-role"
                value={regRole}
                onChange={(e) => setRegRole(e.target.value as UserRole)}
                className="w-full h-9 px-3 rounded-lg bg-surface-bright border border-outline-variant text-xs text-on-surface outline-none focus:border-primary cursor-pointer"
              >
                <option value="ADMIN_HR">Administrador General de RRHH (ADMIN_HR)</option>
                <option value="MANAGER">Gerente de Área / Evaluador (MANAGER)</option>
                <option value="RECRUITER">Especialista en Selección (RECRUITER)</option>
                <option value="EMPLOYEE">Colaborador / Funcional (EMPLOYEE)</option>
              </select>
            </div>

            <div>
              <label htmlFor="modal-reg-password" className="text-xs font-medium text-on-surface block mb-1">
                Contraseña
              </label>
              <Input
                id="modal-reg-password"
                type="password"
                required
                minLength={6}
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full mt-1">
              <UserPlus className="w-3.5 h-3.5 mr-1" />
              {isLoading ? 'Registrando...' : 'Registrar e Ingresar'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
