import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, Clock } from 'lucide-react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  icon?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  icon = true,
  className = '',
}) => {
  const variantStyles = {
    success: 'bg-[#5E7A63]/15 text-[#5E7A63] border-[#5E7A63]/30',
    warning: 'bg-[#B08A4E]/15 text-[#B08A4E] border-[#B08A4E]/30',
    danger: 'bg-[#A0524E]/15 text-[#A0524E] border-[#A0524E]/30',
    info: 'bg-[#5E7286]/15 text-[#5E7286] border-[#5E7286]/30',
    neutral: 'bg-[#988686]/15 text-[#988686] border-[#988686]/30',
  };

  const getIcon = () => {
    switch (variant) {
      case 'success': return <CheckCircle2 className="w-3 h-3 shrink-0" />;
      case 'warning': return <AlertTriangle className="w-3 h-3 shrink-0" />;
      case 'danger': return <AlertCircle className="w-3 h-3 shrink-0" />;
      case 'info': return <Info className="w-3 h-3 shrink-0" />;
      default: return <Clock className="w-3 h-3 shrink-0" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border uppercase ${variantStyles[variant]} ${className}`}
    >
      {icon && getIcon()}
      <span>{children}</span>
    </span>
  );
};
