import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Permission } from '../types';

interface ProtectedActionProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onUnauthorized?: () => void;
}

export const ProtectedAction: React.FC<ProtectedActionProps> = ({
  permission,
  children,
  fallback = null,
  onUnauthorized,
}) => {
  const { hasPermission, openLoginModal } = useAuth();

  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (onUnauthorized) {
          onUnauthorized();
        } else {
          openLoginModal();
        }
      }}
      title={`Acción restringida. Requiere permiso: ${permission}. Haz clic para iniciar sesión como Administrador.`}
      className="inline-block opacity-60 cursor-not-allowed"
    >
      {children}
    </div>
  );
};
