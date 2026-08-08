import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-[#988686]/15 dark:bg-[#988686]/20 rounded ${className}`}
    />
  );
};
