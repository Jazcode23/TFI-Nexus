import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface HelpTooltipProps {
  text: string;
  label?: string;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ text, label }) => {
  const [show, setShow] = useState(false);

  return (
    <span className="relative inline-flex items-center gap-1 align-middle">
      {label && <span className="text-inherit">{label}</span>}
      <button
        type="button"
        onClick={() => setShow(!show)}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="inline-flex items-center justify-center text-outline hover:text-primary transition-colors cursor-help focus:outline-none p-0.5 rounded"
        title="Clic para ver explicación sencilla"
        aria-label="Ayuda"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-56 p-2 bg-inverse-surface text-inverse-on-surface text-[11px] font-normal leading-relaxed rounded-xl shadow-xl z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-100">
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-inverse-surface" />
        </span>
      )}
    </span>
  );
};
