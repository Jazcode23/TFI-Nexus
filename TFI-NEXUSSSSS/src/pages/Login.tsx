import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';
import { UserRole } from '../types';
import { APP_NAME } from '../routes';
import { useToast } from '../components/ToastProvider';
import { useFocusTrap } from '../components/useFocusTrap';
import {
  Layers,
  FileText,
  Brain,
  Workflow,
  Grid3X3,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Zap,
  Key,
  UserPlus,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

type LoginTab = 'credentials' | 'demo' | 'register';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { login, loginAs, register, isAuthenticated, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<LoginTab>('credentials');

  // Form States (Login)
  const [email, setEmail] = useState('admin@nexus.com');
  const [password, setPassword] = useState('Admin1234!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States (Register)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('MANAGER');

  // Forgot Password Modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const forgotModalRef = useFocusTrap<HTMLDivElement>(showForgotModal);

  // Redirect if authenticated
  const from = (location.state as any)?.from || '/';

  // Submit Login
  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMessage('Por favor completá todos los campos requeridos.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(cleanEmail, password);
      showToast('Sesión iniciada correctamente');
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'Credenciales incorrectas. Verificá tu correo y contraseña.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Quick Demo Login
  const handleQuickLogin = async (role: UserRole) => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const creds = DEMO_CREDENTIALS[role];
      setEmail(creds.email);
      setPassword(creds.pass);
      await loginAs(role);
      showToast(`Sesión iniciada como ${creds.user.name}`);
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error al iniciar sesión con el perfil demo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Register
  const handleSubmitRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setErrorMessage('Por favor completá todos los datos para registrar la cuenta.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        role: regRole,
      });
      showToast(`Cuenta registrada exitosamente para ${regName}`);
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error al registrar la nueva cuenta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col lg:flex-row text-on-surface antialiased">
      {/* LEFT COLUMN: HERO & BRANDING */}
      <div className="lg:w-5/12 bg-slate-900 text-white p-8 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
        {/* Top Header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-on-primary shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight block leading-tight text-white">
              {APP_NAME}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Ecosistema Integral de Talento
            </span>
          </div>
        </div>

        {/* Center Pillars */}
        <div className="my-10 lg:my-0 space-y-6 max-w-sm">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white leading-snug">
              Gestión estratégica de talento y estructura organizacional.
            </h1>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Catálogo oficial de puestos, matriz de competencias, cadena de valor de Porter y calibración 9-Box en una sola plataforma unificada.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs">
              <FileText className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white block">Manual de Puestos (DPT)</span>
                <span className="text-[11px] text-slate-300">Fichas técnicas con funciones, requisitos y riesgos.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs">
              <Brain className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white block">Matriz de Competencias</span>
                <span className="text-[11px] text-slate-300">Brechas de habilidades y planes de desarrollo.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs">
              <Workflow className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white block">Cadena de Valor Porter</span>
                <span className="text-[11px] text-slate-300">Vinculación de cargos a eslabones críticos.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs">
              <Grid3X3 className="w-4 h-4 text-primary-fixed shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white block">Calibración 9-Box</span>
                <span className="text-[11px] text-slate-300">Mapeo de potencial vs desempeño del equipo.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Autenticación corporativa segura</span>
          </div>
          <span className="font-mono text-[10px] text-slate-500">v3.2 Enterprise</span>
        </div>
      </div>

      {/* RIGHT COLUMN: LOGIN FORMS */}
      <div className="lg:w-7/12 flex items-center justify-center p-6 sm:p-10 lg:p-16">
        <div className="w-full max-w-md space-y-5">
          <div>
            <h2 className="text-xl font-bold text-on-surface tracking-tight">
              Bienvenido a NEXUS
            </h2>
            <p className="text-xs text-on-surface-variant mt-1">
              Ingresá con tus credenciales o utilizá un perfil demo de acceso rápido.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-surface-dim p-1 rounded-lg border border-outline-variant/60">
            <button
              type="button"
              onClick={() => { setActiveTab('credentials'); setErrorMessage(null); }}
              className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'credentials'
                  ? 'bg-surface-bright text-on-surface shadow-2xs font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              Credenciales
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('demo'); setErrorMessage(null); }}
              className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'demo'
                  ? 'bg-surface-bright text-on-surface shadow-2xs font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              1-Click Demo
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('register'); setErrorMessage(null); }}
              className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'register'
                  ? 'bg-surface-bright text-on-surface shadow-2xs font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Registrar
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div
              role="alert"
              className="p-3 bg-error/10 border border-error/20 rounded-lg text-error text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-medium text-[11px] leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: CREDENTIALS */}
          {activeTab === 'credentials' && (
            <form onSubmit={handleSubmitLogin} className="space-y-3.5">
              <div>
                <label htmlFor="login-email" className="text-xs font-medium text-on-surface block mb-1">
                  Correo Electrónico
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-outline absolute left-3 pointer-events-none" />
                  <Input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@nexus.com"
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="login-password" className="text-xs font-medium text-on-surface">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setShowForgotModal(true);
                    }}
                    className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-outline absolute left-3 pointer-events-none" />
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 pr-9"
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

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-on-surface-variant">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-outline-variant text-primary focus:ring-primary"
                  />
                  <span>Recordar sesión</span>
                </label>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full mt-2">
                {isSubmitting ? 'Iniciando...' : 'Iniciar Sesión'}
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </form>
          )}

          {/* TAB 2: 1-CLICK DEMO */}
          {activeTab === 'demo' && (
            <div className="space-y-2.5">
              <p className="text-[11px] text-outline">
                Seleccioná un rol preconfigurado para probar el sistema sin escribir credenciales:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(Object.entries(DEMO_CREDENTIALS) as [UserRole, (typeof DEMO_CREDENTIALS)[UserRole]][]).map(
                  ([roleKey, item]) => (
                    <button
                      key={roleKey}
                      type="button"
                      onClick={() => handleQuickLogin(roleKey)}
                      disabled={isSubmitting}
                      className="p-3 bg-surface-bright hover:bg-surface-dim border border-outline-variant/60 hover:border-primary/40 rounded-lg flex flex-col gap-1 transition-all text-left cursor-pointer group disabled:opacity-50"
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
                        <ArrowRight className="w-3.5 h-3.5 text-outline group-hover:text-primary transition-colors" />
                      </div>
                      <span className="text-xs font-semibold text-on-surface block truncate">
                        {item.user.name}
                      </span>
                      <span className="text-[11px] text-outline truncate block">
                        {item.user.title}
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* TAB 3: REGISTER */}
          {activeTab === 'register' && (
            <form onSubmit={handleSubmitRegister} className="space-y-3">
              <div>
                <label htmlFor="reg-name" className="text-xs font-medium text-on-surface block mb-1">
                  Nombre Completo
                </label>
                <Input
                  id="reg-name"
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Ej: Lic. Sofía Martínez"
                />
              </div>

              <div>
                <label htmlFor="reg-email" className="text-xs font-medium text-on-surface block mb-1">
                  Correo Electrónico
                </label>
                <Input
                  id="reg-email"
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="sofia@nexus.com"
                />
              </div>

              <div>
                <label htmlFor="reg-role" className="text-xs font-medium text-on-surface block mb-1">
                  Rol Organizacional
                </label>
                <select
                  id="reg-role"
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="w-full h-9 px-3 rounded-lg bg-surface-bright border border-outline-variant text-xs text-on-surface outline-none focus:border-primary cursor-pointer"
                >
                  <option value="ADMIN_HR">Administrador General de RRHH</option>
                  <option value="MANAGER">Gerente de Área / Evaluador</option>
                  <option value="RECRUITER">Especialista en Selección</option>
                  <option value="EMPLOYEE">Colaborador</option>
                </select>
              </div>

              <div>
                <label htmlFor="reg-password" className="text-xs font-medium text-on-surface block mb-1">
                  Contraseña (mínimo 6 caracteres)
                </label>
                <Input
                  id="reg-password"
                  type="password"
                  required
                  minLength={6}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full mt-2">
                <UserPlus className="w-3.5 h-3.5 mr-1" />
                {isSubmitting ? 'Registrando...' : 'Registrar y Continuar'}
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div
          className="fixed inset-0 z-50 bg-on-surface/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100"
          onClick={() => setShowForgotModal(false)}
        >
          <div
            ref={forgotModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="forgot-title"
            className="bg-surface-bright max-w-sm w-full rounded-xl p-5 shadow-lg border border-outline-variant/70 flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="forgot-title" className="text-sm font-semibold text-on-surface">
              Recuperar Contraseña
            </h3>
            <p className="text-xs text-on-surface-variant">
              Ingresá tu correo para recibir las instrucciones de restablecimiento.
            </p>
            <Input
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="tu@nexus.com"
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/40">
              <Button variant="ghost" size="sm" onClick={() => setShowForgotModal(false)}>
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  showToast('Enlace de restablecimiento enviado');
                  setShowForgotModal(false);
                }}
              >
                Enviar enlace
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
