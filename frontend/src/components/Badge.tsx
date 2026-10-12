import React from 'react';
import { cn } from '../utils/cn';

export type BadgeVariant = 'emerald' | 'amber' | 'slate' | 'blue' | 'indigo' | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  icon?: React.ElementType;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'emerald',
  className,
  icon: Icon
}) => {
  const styles: Record<BadgeVariant, string> = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    slate: 'bg-slate-800 text-slate-300 border-slate-700',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    outline: 'bg-transparent text-slate-400 border-slate-700'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border tracking-wide',
        styles[variant],
        className
      )}
    >
      {Icon && <Icon className="w-3 h-3 flex-shrink-0" />}
      <span>{children}</span>
    </span>
  );
};
