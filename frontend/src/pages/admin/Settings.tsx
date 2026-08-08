import React, { useState } from 'react';
import { Settings as SettingsIcon, Building, Users, Shield, FileText, Save, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Letterhead' | 'RentalPeriods' | 'Org'>('RentalPeriods');
  const { showToast } = useToast();

  // Letterhead builder state
  const [headerTagline, setHeaderTagline] = useState('RENT • USE • RETURN • REUSE');
  const [footerTerms, setFooterTerms] = useState('All equipment rentals subject to 12-point inspection & security deposit terms.');

  // Rental Period & Penalty Config State (From PDF Odoo Specs)
  const [minRentalHours, setMinRentalHours] = useState(24);
  const [maxRentalDays, setMaxRentalDays] = useState(90);
  const [gracePeriodHours, setGracePeriodHours] = useState(2);
  const [hourlyLateRateMultiplier, setHourlyLateRateMultiplier] = useState(1.5);
  const [dailyLateRateMultiplier, setDailyLateRateMultiplier] = useState(2.0);
  const [maxPenaltyPercentOfDeposit, setMaxPenaltyPercentOfDeposit] = useState(100);

  const handleSaveSettings = () => {
    showToast('Rental Configuration Saved!', 'Organization rental periods, late fee rules, and letterhead updated.', 'success');
  };

  return (
    <div className="w-full space-y-8 page-transition pb-16">
      <div className="flex items-center justify-between border-b border-[#5C4E4E]/30 pb-4">
        <div>
          <span className="text-xs font-mono uppercase text-[#988686] tracking-widest">RENTER ORGANIZATION CONFIG</span>
          <h1 className="font-heading text-3xl font-bold text-[#000000] dark:text-white mt-1">
            Rental Periods, Late Fees & Organization Settings
          </h1>
        </div>

        <Button leftIcon={<Save className="w-4 h-4" />} onClick={handleSaveSettings}>
          Save Organization Settings
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center p-1 rounded-xl bg-[#988686]/15 max-w-md">
        <button
          onClick={() => setActiveTab('RentalPeriods')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'RentalPeriods' ? 'bg-[#000000] dark:bg-[#988686] text-white shadow-warm-sm' : 'text-[#5C4E4E] dark:text-[#B5A9A9]'
          }`}
        >
          Rental Periods & Rules
        </button>
        <button
          onClick={() => setActiveTab('Letterhead')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'Letterhead' ? 'bg-[#000000] dark:bg-[#988686] text-white shadow-warm-sm' : 'text-[#5C4E4E] dark:text-[#B5A9A9]'
          }`}
        >
          Quotation Letterhead
        </button>
        <button
          onClick={() => setActiveTab('Org')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'Org' ? 'bg-[#000000] dark:bg-[#988686] text-white shadow-warm-sm' : 'text-[#5C4E4E] dark:text-[#B5A9A9]'
          }`}
        >
          Org Profile
        </button>
      </div>

      {activeTab === 'RentalPeriods' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs">
          {/* Rental Duration Policy */}
          <div className="lg:col-span-6 space-y-4 glass-panel p-6 rounded-2xl border border-[#988686]/30">
            <h3 className="font-heading text-lg font-bold text-[#000000] dark:text-white border-b border-[#988686]/30 pb-2 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#988686]" />
              Rental Window Duration Limits
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Minimum Rental Duration (Hours)"
                type="number"
                value={minRentalHours}
                onChange={(e) => setMinRentalHours(Number(e.target.value))}
              />
              <Input
                label="Maximum Rental Duration (Days)"
                type="number"
                value={maxRentalDays}
                onChange={(e) => setMaxRentalDays(Number(e.target.value))}
              />
            </div>
            <Input
              label="Grace Period Before Late Charge (Hours)"
              type="number"
              value={gracePeriodHours}
              onChange={(e) => setGracePeriodHours(Number(e.target.value))}
              helperText="No penalty is charged if returned within this grace window."
            />
          </div>

          {/* Late Return Penalty Rules */}
          <div className="lg:col-span-6 space-y-4 glass-panel p-6 rounded-2xl border border-[#988686]/30">
            <h3 className="font-heading text-lg font-bold text-[#000000] dark:text-white border-b border-[#988686]/30 pb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#B08A4E]" />
              Late Return Fee Auto-Deduction Rules
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Hourly Overdue Multiplier"
                type="number"
                step="0.1"
                value={hourlyLateRateMultiplier}
                onChange={(e) => setHourlyLateRateMultiplier(Number(e.target.value))}
                helperText="e.g. 1.5x hourly base rate"
              />
              <Input
                label="Daily Overdue Multiplier"
                type="number"
                step="0.1"
                value={dailyLateRateMultiplier}
                onChange={(e) => setDailyLateRateMultiplier(Number(e.target.value))}
                helperText="e.g. 2.0x daily rate per overdue day"
              />
            </div>
            <Input
              label="Maximum Deposit Penalty Cap (%)"
              type="number"
              value={maxPenaltyPercentOfDeposit}
              onChange={(e) => setMaxPenaltyPercentOfDeposit(Number(e.target.value))}
              helperText="Maximum percentage of held deposit that can be deducted."
            />
          </div>
        </div>
      ) : activeTab === 'Letterhead' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 space-y-4 glass-panel p-6 rounded-2xl border border-[#988686]/30">
            <h3 className="font-heading text-lg font-bold text-[#000000] dark:text-white border-b border-[#988686]/30 pb-2">
              Quotation Header & Footer Config
            </h3>
            <Input label="Header Tagline" value={headerTagline} onChange={(e) => setHeaderTagline(e.target.value)} />
            <Input label="Footer Contract Notice" value={footerTerms} onChange={(e) => setFooterTerms(e.target.value)} />
          </div>

          <div className="lg:col-span-6">
            <Card className="p-8 space-y-6 border-2 border-[#988686]/40 bg-white text-black">
              <div className="flex items-center justify-between border-b border-black/20 pb-4">
                <div className="flex items-center gap-3">
                  <img src="/rovia_logo.jpg" alt="ROVIA Logo" className="w-10 h-10 object-contain rounded" />
                  <div>
                    <h3 className="font-heading text-lg font-bold">ROVIA ATELIER</h3>
                    <p className="text-[9px] uppercase font-mono tracking-widest text-[#988686]">{headerTagline}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded text-xs italic text-gray-600">
                [ Sample PDF Invoice / Quotation Content Body ]
              </div>

              <div className="border-t border-black/20 pt-4 text-[10px] text-gray-500 font-mono">
                {footerTerms}
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="p-6">
          <h3 className="font-heading text-lg font-bold text-[#000000] dark:text-white">ROVIA Organization Profile</h3>
          <p className="text-xs text-[#988686] mt-1">Registered Renter Account: ROVIA Central Operations (Mumbai HQ)</p>
        </Card>
      )}
    </div>
  );
};
