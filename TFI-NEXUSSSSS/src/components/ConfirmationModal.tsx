import React, { useEffect } from 'react';
import { useFocusTrap } from './useFocusTrap';
import { AlertTriangle, HelpCircle, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'primary' | 'warning' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Sí, confirmar',
  cancelLabel = 'Cancelar',
  type = 'primary',
  onConfirm,
  onCancel,
}) => {
  const dialogRef = useFocusTrap<HTMLDivElement>(isOpen);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const renderIcon = () => {
    if (type === 'danger') {
      return (
        <div className="w-10 h-10 rounded-xl bg-error-container text-error flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
      );
    }
    if (type === 'warning') {
      return (
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
          <HelpCircle className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-xl bg-primary-fixed text-primary flex items-center justify-center shrink-0">
        <CheckCircle2 className="w-5 h-5" />
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[90] bg-on-surface/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onCancel}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-title"
        className="bg-surface-bright max-w-md w-full rounded-xl p-5 shadow-xl border border-outline-variant/70 flex flex-col gap-4 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3.5">
          {renderIcon()}
          <div className="flex-1">
            <h3 id="confirmation-title" className="text-sm font-semibold text-on-surface leading-snug mb-1">
              {title}
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/40">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={type === 'danger' ? 'destructive' : 'default'}
            size="sm"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
