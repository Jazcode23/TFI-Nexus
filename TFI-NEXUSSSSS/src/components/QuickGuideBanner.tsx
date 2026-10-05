import React, { useState } from 'react';

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
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <>
      {/* Slim 34px inline helper bar */}
      <div className="bg-primary/5 hover:bg-primary/[0.08] border border-primary/20 rounded-xl px-3.5 py-1.5 transition-all flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="material-symbols-outlined text-primary text-base shrink-0">lightbulb</span>
          <span className="font-bold text-on-surface truncate">{title}</span>
          <span className="hidden md:inline-block text-[11px] text-outline truncate">&bull; {description}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="text-xs font-bold text-primary hover:bg-primary/10 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Ver guía</span>
            <span className="material-symbols-outlined text-sm">open_in_new</span>
          </button>
          {dismissible && (
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
              title="Ocultar guía"
              aria-label="Ocultar guía"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Modal Dialog for Guide Tips (No screen shift) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-surface-container-lowest max-w-lg w-full rounded-2xl p-6 shadow-2xl border border-outline-variant/40 flex flex-col gap-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl">lightbulb</span>
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-on-surface">{title}</h3>
                  <p className="text-xs text-outline mt-0.5">{description}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div className="space-y-2 pt-1">
              {tips.map((tip, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-on-surface bg-surface-container-low p-3 rounded-xl border border-outline-variant/20"
                >
                  <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{tip}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-container transition-colors cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
