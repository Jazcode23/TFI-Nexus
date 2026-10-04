import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { AuthUser, UserRole, Permission, ROLE_PERMISSIONS } from '../types';
import { authApi, tokenStorage } from '../services/api';

export const DEMO_CREDENTIALS: Record<UserRole, { email: string; pass: string; user: AuthUser }> = {
  ADMIN_HR: {
    email: 'admin@nexus.com',
    pass: 'Admin1234!',
    user: {
      id: 'usr-admin',
      email: 'admin@nexus.com',
      name: 'Directora de Personas y Talento',
      role: 'ADMIN_HR',
      title: 'Administrador General de Recursos Humanos',
      area: 'Dirección de Personas',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    },
  },
  MANAGER: {
    email: 'manager@nexus.com',
    pass: 'Manager1234!',
    user: {
      id: 'usr-manager',
      email: 'manager@nexus.com',
      name: 'Martín Krause',
      role: 'MANAGER',
      title: 'VP de Ingeniería & Plataforma',
      area: 'Ingeniería & Producto',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    },
  },
  RECRUITER: {
    email: 'recruiter@nexus.com',
    pass: 'Admin1234!',
    user: {
      id: 'usr-recruiter',
      email: 'recruiter@nexus.com',
      name: 'Camila Navarro',
      role: 'RECRUITER',
      title: 'Líder de Selección y Adquisición de Talento',
      area: 'Atracción de Talento',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    },
  },
  EMPLOYEE: {
    email: 'lucas@nexus.com',
    pass: 'Lucas1234!',
    user: {
      id: 'usr-lucas',
      email: 'lucas@nexus.com',
      name: 'Ing. Lucas Valenzuela',
      role: 'EMPLOYEE',
      employeeId: 'lucas',
      title: 'Arquitecto Principal de Nube e IA',
      area: 'Infraestructura y Plataforma',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    },
  },
};

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  role: UserRole;
  permissions: Permission[];
  isAuthenticated: boolean;
  isLoading: boolean;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  login: (email: string, password: string) => Promise<void>;
  loginAs: (role: UserRole) => Promise<void>;
  logout: () => void;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const defaultAdmin = DEMO_CREDENTIALS.ADMIN_HR.user;
  const [user, setUser] = useState<AuthUser | null>(defaultAdmin);
  const [token, setToken] = useState<string | null>(tokenStorage.get());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  const role: UserRole = user?.role || 'ADMIN_HR';

  const permissions = useMemo(() => {
    return ROLE_PERMISSIONS[role] || [];
  }, [role]);

  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      if (role === 'ADMIN_HR') return true;
      return permissions.includes(permission);
    },
    [role, permissions],
  );

  const hasAnyPermission = useCallback(
    (perms: Permission[]): boolean => {
      if (role === 'ADMIN_HR') return true;
      return perms.some((p) => permissions.includes(p));
    },
    [role, permissions],
  );

  // Inicialización y Auto-Login al arrancar la aplicación
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const storedToken = tokenStorage.get();
      const storedUser = tokenStorage.getUser();

      // Si ya hay sesión guardada en localStorage
      if (storedToken && storedUser) {
        if (isMounted) {
          setUser(storedUser);
          setToken(storedToken);
          setIsLoading(false);
        }
        return;
      }

      // Auto-Login por defecto con Administrador (con todos los permisos)
      try {
        const { email, pass, user: adminData } = DEMO_CREDENTIALS.ADMIN_HR;
        const res = await authApi.login(email, pass);
        if (isMounted) {
          const fullUser: AuthUser = {
            ...adminData,
            ...res.user,
            role: 'ADMIN_HR',
          };
          setUser(fullUser);
          setToken(res.access_token);
          tokenStorage.setUser(fullUser);
        }
      } catch (err) {
        console.warn('Auto-login en backend falló o sin conexión, usando sesión de Administrador offline:', err);
        // Fallback resiliente: inicializar como Administrador para no bloquear al usuario
        if (isMounted) {
          const fallbackAdmin = DEMO_CREDENTIALS.ADMIN_HR.user;
          const fallbackToken = 'nexus-admin-session-token';
          tokenStorage.set(fallbackToken);
          tokenStorage.setUser(fallbackAdmin);
          setUser(fallbackAdmin);
          setToken(fallbackToken);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(email, pass);
      // Enriquecer con datos del demo si coinciden por rol o email
      const matchedDemo = Object.values(DEMO_CREDENTIALS).find(
        (d) => d.email.toLowerCase() === email.toLowerCase(),
      );

      const loggedUser: AuthUser = {
        id: res.user.id,
        email: res.user.email,
        name: res.user.name,
        role: (res.user.role as UserRole) || 'ADMIN_HR',
        employeeId: res.user.employeeId,
        avatar: matchedDemo?.user.avatar || DEMO_CREDENTIALS.ADMIN_HR.user.avatar,
        title: matchedDemo?.user.title || 'Usuario NEXUS',
        area: matchedDemo?.user.area || 'Operaciones',
      };

      setUser(loggedUser);
      setToken(res.access_token);
      tokenStorage.setUser(loggedUser);
      setIsLoginModalOpen(false);
    } catch (err: any) {
      // Si la API falla pero son credenciales demo válidas, permitir acceso local
      const matchedDemo = Object.values(DEMO_CREDENTIALS).find(
        (d) => d.email.toLowerCase() === email.toLowerCase() && d.pass === pass,
      );

      if (matchedDemo) {
        const fallbackToken = `nexus-${matchedDemo.user.role.toLowerCase()}-token`;
        tokenStorage.set(fallbackToken);
        tokenStorage.setUser(matchedDemo.user);
        setUser(matchedDemo.user);
        setToken(fallbackToken);
        setIsLoginModalOpen(false);
        return;
      }

      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginAs = useCallback(async (targetRole: UserRole) => {
    const creds = DEMO_CREDENTIALS[targetRole];
    if (!creds) return;
    await login(creds.email, creds.pass);
  }, [login]);

  const logout = useCallback(() => {
    tokenStorage.remove();
    setUser(null);
    setToken(null);
  }, []);

  const openLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      role,
      permissions,
      isAuthenticated: !!user && !!token,
      isLoading,
      hasPermission,
      hasAnyPermission,
      login,
      loginAs,
      logout,
      isLoginModalOpen,
      openLoginModal,
      closeLoginModal,
    }),
    [
      user,
      token,
      role,
      permissions,
      isLoading,
      hasPermission,
      hasAnyPermission,
      login,
      loginAs,
      logout,
      isLoginModalOpen,
      openLoginModal,
      closeLoginModal,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
