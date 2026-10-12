import React from 'react';
import { cn } from '../utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: {
    value: string;
    positive: boolean;
  };
  badge?: string;
  className?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  badge,
  className,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-[#131B2B] border border-[#243046] hover:border-slate-700/80 rounded-2xl p-5 transition-all shadow-sm",
        onClick && "cursor-pointer hover:border-emerald-500/40 hover:bg-[#151f33]",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        <div className="w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-emerald-400 flex-shrink-0">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-extrabold text-white tracking-tight">{value}</span>
        {trend && (
          <span
            className={cn(
              "text-xs font-semibold flex items-center gap-0.5",
              trend.positive ? "text-emerald-400" : "text-rose-400"
            )}
          >
            {trend.positive ? "+" : ""}{trend.value}
          </span>
        )}
      </div>

      {(subtitle || badge) && (
        <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
          {subtitle && <span className="truncate">{subtitle}</span>}
          {badge && (
            <span className="text-[10px] text-slate-500 font-medium ml-auto">
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
