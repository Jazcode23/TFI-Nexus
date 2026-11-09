import * as React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-xs font-semibold ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98]';

    const variants = {
      default: 'bg-primary text-on-primary hover:bg-primary-container shadow-xs',
      destructive: 'bg-error text-on-error hover:bg-red-700 shadow-xs',
      outline:
        'border border-outline-variant bg-surface-bright text-on-surface hover:bg-surface-dim hover:text-on-surface shadow-2xs',
      secondary:
        'bg-surface-container text-on-surface hover:bg-surface-container-high',
      ghost: 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
      link: 'text-primary underline-offset-4 hover:underline p-0 h-auto',
    };

    const sizes = {
      default: 'h-9 px-3.5 py-2',
      sm: 'h-8 rounded-md px-2.5 text-[11px]',
      lg: 'h-10 rounded-lg px-5 text-sm',
      icon: 'h-8 w-8 rounded-lg p-0',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
