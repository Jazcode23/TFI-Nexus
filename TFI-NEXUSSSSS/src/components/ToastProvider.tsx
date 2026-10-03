import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

type ToastType = 'success' | 'info' | 'error';

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

const ICONS: Record<ToastType, { name: string; color: string }> = {
  success: { name: 'check_circle', color: 'text-emerald-400' },
  info: { name: 'info', color: 'text-sky-300' },
  error: { name: 'error', color: 'text-rose-300' },
};

/** Aviso global que sobrevive al cambio de página (útil cuando una acción lleva a otra sección). */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => setToast(null), []);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ message, type });
    timer.current = setTimeout(() => setToast(null), type === 'error' ? 6000 : 4000);
  }, []);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div aria-live="polite" role="status" className="fixed bottom-6 right-4 sm:right-6 left-4 sm:left-auto z-[60] flex justify-end pointer-events-none">
        {toast && (
          <div className="pointer-events-auto max-w-md bg-inverse-surface text-inverse-on-surface px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-outline-variant/30 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <span className={`material-symbols-outlined ${ICONS[toast.type].color}`}>{ICONS[toast.type].name}</span>
            <span className="text-xs sm:text-sm font-semibold">{toast.message}</span>
            <button onClick={dismiss} className="text-inverse-on-surface/70 hover:text-inverse-on-surface ml-2 cursor-pointer" aria-label="Cerrar aviso">
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
};
