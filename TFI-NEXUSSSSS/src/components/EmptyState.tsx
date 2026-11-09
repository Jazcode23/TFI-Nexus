import React from 'react';
import { SearchX, Inbox, AlertCircle, FileQuestion } from 'lucide-react';
import { Button } from './ui/button';

interface EmptyStateProps {
  icon?: string | React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  const renderIcon = () => {
    if (React.isValidElement(icon)) return icon;
    if (icon === 'inbox') return <Inbox className="w-8 h-8 text-outline" />;
    if (icon === 'alert' || icon === 'warning') return <AlertCircle className="w-8 h-8 text-outline" />;
    if (icon === 'file') return <FileQuestion className="w-8 h-8 text-outline" />;
    return <SearchX className="w-8 h-8 text-outline" />;
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center p-8 sm:p-10 text-center rounded-xl bg-surface-bright border border-dashed border-outline-variant/80 ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-surface-dim flex items-center justify-center mb-3">
        {renderIcon()}
      </div>
      <h3 className="text-sm font-semibold text-on-surface mb-1">{title}</h3>
      <p className="text-xs text-on-surface-variant max-w-sm leading-relaxed mb-4">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="default" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
