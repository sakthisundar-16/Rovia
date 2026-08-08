import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg glass-panel hover:bg-[#988686]/20 transition-all duration-200 text-[#988686] hover:text-white flex items-center justify-center ${className}`}
      title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? <Sun className="w-4 h-4 text-[#B08A4E]" /> : <Moon className="w-4 h-4 text-[#5C4E4E]" />}
    </button>
  );
};
