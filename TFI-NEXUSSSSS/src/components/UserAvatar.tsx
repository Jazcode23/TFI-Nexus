import React from 'react';

interface UserAvatarProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'rounded' | 'circle';
  className?: string;
  showStatus?: boolean;
  statusColor?: 'emerald' | 'amber' | 'rose' | 'primary';
}

const COLOR_PALETTES = [
  { bg: 'bg-indigo-700', text: 'text-white', border: 'border-indigo-500/30' },
  { bg: 'bg-violet-800', text: 'text-white', border: 'border-violet-600/30' },
  { bg: 'bg-teal-700', text: 'text-white', border: 'border-teal-500/30' },
  { bg: 'bg-slate-800', text: 'text-slate-100', border: 'border-slate-600/30' },
  { bg: 'bg-emerald-700', text: 'text-white', border: 'border-emerald-500/30' },
  { bg: 'bg-blue-800', text: 'text-blue-50', border: 'border-blue-600/30' },
  { bg: 'bg-amber-700', text: 'text-white', border: 'border-amber-600/30' },
  { bg: 'bg-rose-800', text: 'text-white', border: 'border-rose-600/30' },
];

function getInitials(name: string): string {
  if (!name) return '??';
  // Strip out titles like "Ing.", "Lic.", "Dra.", "Dr."
  const clean = name.replace(/^(Ing\.|Lic\.|Dra\.|Dr\.|Prof\.)\s+/i, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getPalette(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLOR_PALETTES.length;
  return COLOR_PALETTES[index];
}

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-14 h-14 text-lg',
  '2xl': 'w-16 h-16 text-xl',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  size = 'md',
  shape = 'rounded',
  className = '',
  showStatus = false,
  statusColor = 'emerald',
}) => {
  const initials = getInitials(name);
  const palette = getPalette(name);
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const radiusClass = shape === 'circle' ? 'rounded-full' : 'rounded-2xl';

  const statusBg = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    primary: 'bg-primary',
  }[statusColor];

  return (
    <div className={`relative inline-flex shrink-0 select-none ${className}`}>
      <div
        className={`${sizeClass} ${radiusClass} ${palette.bg} ${palette.text} border ${palette.border} flex items-center justify-center font-black font-mono tracking-wider shadow-xs relative overflow-hidden`}
        title={name}
      >
        {/* Subtle geometric gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/15 pointer-events-none" />
        <span className="relative z-10">{initials}</span>
      </div>
      {showStatus && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${statusBg} ring-2 ring-surface`}
        />
      )}
    </div>
  );
};
