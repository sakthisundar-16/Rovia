import React from 'react';
import { ShieldCheck, RotateCcw, Clock, Award } from 'lucide-react';

export const CustomerFooter: React.FC = () => {
  return (
    <footer className="glass-panel border-t border-[#D1D0D0]/50 dark:border-[#5C4E4E]/40 mt-20 pt-12 pb-8 text-[#5C4E4E] dark:text-[#B5A9A9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Props Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-[#D1D0D0]/40 dark:border-[#5C4E4E]/30">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-[#988686] shrink-0" />
            <div>
              <h4 className="text-xs uppercase font-bold text-[#000000] dark:text-white">100% Refundable Deposit</h4>
              <p className="text-xs mt-0.5">Automated settlement on verified returns</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <RotateCcw className="w-6 h-6 text-[#988686] shrink-0" />
            <div>
              <h4 className="text-xs uppercase font-bold text-[#000000] dark:text-white">Seamless Return Flow</h4>
              <p className="text-xs mt-0.5">In-store drop-off or doorstep courier pickup</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-6 h-6 text-[#988686] shrink-0" />
            <div>
              <h4 className="text-xs uppercase font-bold text-[#000000] dark:text-white">Flexible Time Windows</h4>
              <p className="text-xs mt-0.5">Daily, weekly, or custom time-bound pricing</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Award className="w-6 h-6 text-[#988686] shrink-0" />
            <div>
              <h4 className="text-xs uppercase font-bold text-[#000000] dark:text-white">Pristine Quality Checked</h4>
              <p className="text-xs mt-0.5">Strict 12-point inspection before dispatch</p>
            </div>
          </div>
        </div>

        {/* Footer Brand & Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-10">
          <div className="md:col-span-2 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <img src="/rovia_logo.jpg" alt="ROVIA Logo" className="w-8 h-8 object-contain rounded" />
              <span className="font-heading text-xl font-bold text-[#000000] dark:text-white">ROVIA</span>
            </div>
            <p className="text-xs max-w-sm leading-relaxed">
              ROVIA is an editorial equipment and luxury goods rental management platform. Delivering high-precision cinema gear, lighting, audio, and editorial props.
            </p>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#988686]">
              RENT • USE • RETURN • REUSE
            </span>
          </div>

          <div className="flex flex-col gap-2 text-xs">
            <span className="font-bold text-[#000000] dark:text-white uppercase tracking-wider">Catalog & Gear</span>
            <span className="hover:text-[#988686] cursor-pointer">Medium Format Cameras</span>
            <span className="hover:text-[#988686] cursor-pointer">8K Cinema Packages</span>
            <span className="hover:text-[#988686] cursor-pointer">ARRI Master Lenses</span>
            <span className="hover:text-[#988686] cursor-pointer">Editorial Props & Sets</span>
          </div>

          <div className="flex flex-col gap-2 text-xs">
            <span className="font-bold text-[#000000] dark:text-white uppercase tracking-wider">Legal & Trust</span>
            <span className="hover:text-[#988686] cursor-pointer">Rental Terms & Agreement</span>
            <span className="hover:text-[#988686] cursor-pointer">Security Deposit Policy</span>
            <span className="hover:text-[#988686] cursor-pointer">Late Fee Rules Engine</span>
            <span className="hover:text-[#988686] cursor-pointer">Damage & Care Guide</span>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-[#D1D0D0]/30 dark:border-[#5C4E4E]/20 text-center text-[11px] text-[#988686]">
          © 2026 ROVIA Management Systems Inc. All Rights Reserved. Gothic Noir Atelier Design.
        </div>
      </div>
    </footer>
  );
};
