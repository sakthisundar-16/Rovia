import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="w-full flex flex-col items-center justify-center p-12 text-center glass-panel rounded-2xl border border-[#988686]/30 my-4 animate-fadeIn">
      <div className="w-16 h-16 rounded-full bg-[#988686]/15 flex items-center justify-center text-[#988686] mb-4">
        {icon || <PackageOpen className="w-8 h-8" />}
      </div>
      <h3 className="text-xl font-heading font-semibold text-[#000000] dark:text-[#F5F3F3] mb-2">
        {title}
      </h3>
      <p className="text-sm text-[#5C4E4E] dark:text-[#B5A9A9] max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionText}
        </Button>
      )}
    </div>
  );
};
