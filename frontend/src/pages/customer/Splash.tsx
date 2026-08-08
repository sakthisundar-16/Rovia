import React, { useEffect } from 'react';

export const Splash: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 1800);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 bg-[#0D0B0B] flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
      <div className="flex flex-col items-center gap-4 animate-fadeInSlide">
        <img
          src="/rovia_logo.jpg"
          alt="ROVIA Logo"
          className="w-24 h-24 object-contain rounded-2xl shadow-2xl animate-pulse"
        />
        <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight text-[#F5F3F3]">
          ROVIA ATELIER
        </h1>
        <p className="text-xs uppercase tracking-widest text-[#988686] font-semibold">
          RENT • USE • RETURN • REUSE
        </p>
      </div>

      <div className="mt-8 w-48 h-1 bg-[#211D1D] rounded-full overflow-hidden">
        <div className="w-full h-full bg-[#988686] animate-pulse rounded-full origin-left transform transition-transform duration-1000" />
      </div>
    </div>
  );
};
