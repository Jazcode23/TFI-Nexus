import React, { useState } from 'react';

interface QuickGuideBannerProps {
  title: string;
  description: string;
  tips: string[];
}

export const QuickGuideBanner: React.FC<QuickGuideBannerProps> = ({
  title,
  description,
  tips,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-primary/5 hover:bg-primary/[0.07] border border-primary/20 rounded-2xl p-4 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="w-8 h-8 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-lg">lightbulb</span>
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black text-on-surface uppercase tracking-wide">
                {title}
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                Fácil de usar
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5 leading-snug">
              {description}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-bold text-primary hover:text-primary-container flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-primary/10 transition-colors shrink-0 cursor-pointer"
        >
          <span>{isOpen ? 'Ocultar ayuda' : 'Ver cómo usar'}</span>
          <span className="material-symbols-outlined text-base">
            {isOpen ? 'expand_less' : 'expand_more'}
          </span>
        </button>
      </div>

      {isOpen && (
        <div className="mt-3 pt-3 border-t border-primary/15 grid grid-cols-1 md:grid-cols-3 gap-2.5 animate-in fade-in duration-150">
          {tips.map((tip, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 text-xs text-on-surface bg-surface-container-lowest/80 p-2.5 rounded-xl border border-primary/10"
            >
              <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span className="leading-snug">{tip}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
