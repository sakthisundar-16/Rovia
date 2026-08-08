import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 flex items-center justify-center min-h-screen">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0D0B0B]/70 backdrop-blur-md transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal Container with Max Height & Internal Scrollbar */}
      <div
        className={`relative w-full ${widthClasses[maxWidth]} glass-panel rounded-2xl border border-[#988686]/30 shadow-2xl p-6 z-10 animate-fadeInSlide text-[#000000] dark:text-[#F5F3F3] max-h-[85vh] sm:max-h-[90vh] flex flex-col my-auto`}
      >
        {/* Sticky Header */}
        <div className="flex items-center justify-between border-b border-[#D1D0D0]/40 dark:border-[#5C4E4E]/30 pb-3 mb-4 shrink-0">
          {title && <h3 className="text-xl font-heading font-semibold tracking-tight">{title}</h3>}
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#988686] hover:text-white hover:bg-[#988686]/20 transition-colors ml-auto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Children Body */}
        <div className="overflow-y-auto pr-1.5 flex-1 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};
