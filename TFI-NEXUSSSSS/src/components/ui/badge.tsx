import * as React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'tertiary' | 'subtle' | 'success';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors focus:outline-none';

  const variants = {
    default: 'bg-primary-fixed text-primary border border-primary/20',
    secondary: 'bg-secondary-container text-secondary border border-secondary/20',
    tertiary: 'bg-tertiary-container text-tertiary border border-tertiary/20',
    outline: 'text-on-surface-variant border border-outline-variant bg-transparent',
    destructive: 'bg-error-container text-error border border-error/20',
    subtle: 'bg-surface-dim text-on-surface-variant border border-outline-variant/60',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  };

  return <div className={cn(baseStyles, variants[variant], className)} {...props} />;
};
