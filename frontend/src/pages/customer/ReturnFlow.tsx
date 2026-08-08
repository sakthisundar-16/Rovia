import React from 'react';
import { RotateCcw, ShieldCheck, Truck, Store, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const ReturnFlow: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="w-full space-y-12 page-transition pb-16">
      {/* Title */}
      <div className="border-b border-[#D1D0D0]/40 dark:border-[#5C4E4E]/40 pb-4">
        <span className="text-xs font-mono uppercase text-[#988686] tracking-widest">RETURN GUIDE & SETTLEMENT</span>
        <h1 className="font-heading text-4xl font-bold text-[#000000] dark:text-white mt-1">
          Equipment Return & Deposit Unlock Guide
        </h1>
      </div>

      {/* Steps Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="space-y-3">
          <div className="w-10 h-10 rounded-full bg-[#988686]/20 text-[#988686] font-bold flex items-center justify-center text-sm">
            1
          </div>
          <h3 className="font-heading text-base font-bold text-[#000000] dark:text-white">Pack Case & Cables</h3>
          <p className="text-xs text-[#5C4E4E] dark:text-[#B5A9A9]">
            Place lens caps, batteries, chargers, and camera bodies securely inside pre-cut pelican foam slots.
          </p>
        </Card>

        <Card className="space-y-3">
          <div className="w-10 h-10 rounded-full bg-[#988686]/20 text-[#988686] font-bold flex items-center justify-center text-sm">
            2
          </div>
          <h3 className="font-heading text-base font-bold text-[#000000] dark:text-white">Select Return Option</h3>
          <p className="text-xs text-[#5C4E4E] dark:text-[#B5A9A9]">
            Drop off at Mumbai HQ Atelier or request doorstep courier pickup via your rental dashboard.
          </p>
        </Card>

        <Card className="space-y-3">
          <div className="w-10 h-10 rounded-full bg-[#988686]/20 text-[#988686] font-bold flex items-center justify-center text-sm">
            3
          </div>
          <h3 className="font-heading text-base font-bold text-[#000000] dark:text-white">Live Inspection</h3>
          <p className="text-xs text-[#5C4E4E] dark:text-[#B5A9A9]">
            Our ops technician verifies sensor glass, lens elements, and accessories against the checklist.
          </p>
        </Card>

        <Card className="space-y-3">
          <div className="w-10 h-10 rounded-full bg-[#5E7A63]/20 text-[#5E7A63] font-bold flex items-center justify-center text-sm">
            4
          </div>
          <h3 className="font-heading text-base font-bold text-[#5E7A63]">100% Deposit Refunded</h3>
          <p className="text-xs text-[#5C4E4E] dark:text-[#B5A9A9]">
            Security deposit is automatically credited back to your original payment method within 24 hours.
          </p>
        </Card>
      </div>

      {/* Return Method Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-6 rounded-3xl border border-[#988686]/30 space-y-4">
          <div className="flex items-center gap-3">
            <Store className="w-6 h-6 text-[#988686]" />
            <h3 className="font-heading text-xl font-bold text-[#000000] dark:text-white">In-Store Drop-off Instructions</h3>
          </div>
          <p className="text-xs text-[#5C4E4E] dark:text-[#B5A9A9] leading-relaxed">
            Return gear directly to ROVIA Atelier (Building 7B, Laxmi Industrial Estate, Andheri West, Mumbai). Operations intake desk is open daily 09:00 - 19:30.
          </p>
          <div className="p-3 rounded-xl bg-[#5E7A63]/15 border border-[#5E7A63]/30 text-xs text-[#5E7A63] font-semibold">
            ✓ On-the-spot deposit settlement check (5-minute instant clearance).
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-[#988686]/30 space-y-4">
          <div className="flex items-center gap-3">
            <Truck className="w-6 h-6 text-[#988686]" />
            <h3 className="font-heading text-xl font-bold text-[#000000] dark:text-white">Courier Pickup Request</h3>
          </div>
          <p className="text-xs text-[#5C4E4E] dark:text-[#B5A9A9] leading-relaxed">
            Schedule insured doorstep return pickup. Our courier partner collects the sealed pelican case from your studio address.
          </p>
          <Button variant="outline" size="sm" onClick={() => onNavigate('my-rentals')}>
            Manage Active Rental Returns
          </Button>
        </div>
      </div>
    </div>
  );
};
