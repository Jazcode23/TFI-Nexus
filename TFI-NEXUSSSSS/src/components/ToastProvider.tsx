import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, Info, AlertCircle, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'info' | 'error' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
  dismissToast: () => {},
});

export const useToast = () => useContext(ToastContext);

const TOAST_CONFIG: Record<
  ToastType,
  {
    icon: React.ComponentType<{ className?: string }>;
    iconBg: string;
    textColor: string;
    borderColor: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    iconBg: 'bg-emerald-500/15 text-emerald-400',
    textColor: 'text-white',
    borderColor: 'border-emerald-500/30',
  },
  info: {
    icon: Info,
    iconBg: 'bg-sky-500/15 text-sky-400',
    textColor: 'text-white',
    borderColor: 'border-sky-500/30',
  },
  error: {
    icon: AlertCircle,
    iconBg: 'bg-rose-500/15 text-rose-400',
    textColor: 'text-white',
    borderColor: 'border-rose-500/30',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-amber-500/15 text-amber-400',
    textColor: 'text-white',
    borderColor: 'border-amber-500/30',
  },
};

/** Sistema global de notificaciones Toast minimalista y accesible */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'success', duration?: number) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const autoDuration = duration || (type === 'error' ? 6000 : 4000);

    setToasts((prev) => [...prev.slice(-3), { id, message, type, duration: autoDuration }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, autoDuration);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <div
        aria-live="polite"
        role="region"
        aria-label="Notificaciones del sistema"
        className="fixed bottom-6 right-4 sm:right-6 left-4 sm:left-auto z-[70] flex flex-col gap-2 max-w-md w-full pointer-events-none"
      >
        {toasts.map((toast) => {
          const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;
          const Icon = config.icon;
          return (
            <div
              key={toast.id}
              role={toast.type === 'error' ? 'alert' : 'status'}
              className={`pointer-events-auto bg-on-surface text-surface-bright px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border ${config.borderColor} transition-all duration-200 animate-in fade-in slide-in-from-bottom-2`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${config.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-xs sm:text-sm font-medium flex-1 text-surface-bright leading-snug">
                {toast.message}
              </p>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="p-1 rounded-lg text-outline hover:text-surface-bright hover:bg-surface-bright/10 transition-colors cursor-pointer shrink-0"
                aria-label="Cerrar notificación"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
