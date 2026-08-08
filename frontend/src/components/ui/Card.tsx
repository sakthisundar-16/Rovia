import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glass?: boolean;
  hoverEffect?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  glass = true,
  hoverEffect = true,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`${
        glass ? 'glass-card' : 'bg-white dark:bg-[#161313] border border-[#D1D0D0]/50 dark:border-[#5C4E4E]/30'
      } rounded-xl p-5 ${
        hoverEffect ? 'hover:border-[#988686]/40 transition-all duration-300' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
