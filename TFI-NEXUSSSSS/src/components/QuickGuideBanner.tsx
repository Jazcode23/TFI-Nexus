import React, { useState } from 'react';
import { HelpCircle, X, ExternalLink, Check } from 'lucide-react';
import { Button } from './ui/button';

interface QuickGuideBannerProps {
  title: string;
  description: string;
  tips: string[];
  dismissible?: boolean;
  onDismiss?: () => void;
}

export const QuickGuideBanner: React.FC<QuickGuideBannerProps> = ({
  title,
  description,
  tips,
  dismissible = true,
  onDismiss,
}) => {
  const storageKey = `nexus_guide_dismissed_${title.replace(/\s+/g, '_').toLowerCase()}`;
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(storageKey) === 'true';
    } catch {
      return false;
    }
  });

  if (isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem(storageKey, 'true');
    } catch {}
    onDismiss?.();
  };

  return (
    <>
      {/* Slim inline helper bar */}
      <div className="bg-surface-dim/70 border border-outline-variant/60 rounded-lg px-3 py-1.5 transition-all flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <HelpCircle className="w-3.5 h-3.5 text-outline shrink-0" />
          <span className="font-semibold text-on-surface truncate">{title}</span>
          <span className="hidden md:inline-block text-[11px] text-outline truncate">• {description}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="text-[11px] font-medium text-primary hover:underline px-1.5 py-0.5 rounded transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Ver guía</span>
            <ExternalLink className="w-3 h-3" />
          </button>
          {dismissible && (
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1 rounded text-outline hover:text-on-surface hover:bg-surface-dim transition-colors cursor-pointer"
              title="Ocultar guía"
              aria-label="Ocultar guía"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Modal Dialog for Guide Tips */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-on-surface/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-surface-bright max-w-md w-full rounded-xl p-5 shadow-lg border border-outline-variant/70 flex flex-col gap-3.5 animate-in zoom-in-95 duration-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-on-surface">{title}</h3>
                  <p className="text-[11px] text-outline mt-0.5">{description}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-outline hover:text-on-surface hover:bg-surface-dim transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5 pt-1">
              {tips.map((tip, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-xs text-on-surface bg-surface-dim/70 p-2.5 rounded-lg border border-outline-variant/40"
                >
                  <span className="w-4 h-4 rounded-full bg-primary-fixed text-primary text-[10px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed text-[11px] text-on-surface">{tip}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-outline-variant/40">
              <Button size="sm" onClick={() => setIsOpen(false)}>
                <Check className="w-3.5 h-3.5 mr-1" />
                Entendido
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
