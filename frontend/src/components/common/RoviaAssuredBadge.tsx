import React from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';

interface RoviaAssuredBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Signature Flipkart-Assured-Style Trust Badge (Using ROVIA's current theme colors)
 */
export const RoviaAssuredBadge: React.FC<RoviaAssuredBadgeProps> = ({
  size = 'md',
  className = ''
}) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  return (
    <div
      className={`inline-flex items-center gap-1 font-bold rounded-md uppercase tracking-wider select-none ${
        isSm
          ? 'px-1.5 py-0.5 text-[9px] bg-black text-white dark:bg-white dark:text-black'
          : isLg
          ? 'px-2.5 py-1 text-xs bg-black text-white dark:bg-white dark:text-black shadow-xs'
          : 'px-2 py-0.5 text-[10px] bg-black text-white dark:bg-white dark:text-black shadow-xs'
      } ${className}`}
      title="ROVIA Assured: Quality Tested • 100% Escrow Deposit Refund Guarantee • OpenCV Verified Return"
    >
      <span>ROVIA</span>
      <span className="text-[#988686] dark:text-[#D1D0D0] italic font-semibold">Assured</span>
      <span className="text-emerald-400 dark:text-emerald-600">✓</span>
    </div>
  );
};
