import React, { useState } from 'react';
import { Settings as SettingsIcon, Building, Users, Shield, FileText, Save } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Org' | 'Roles' | 'Letterhead'>('Letterhead');
  const { showToast } = useToast();

  const [headerTagline, setHeaderTagline] = useState('RENT • USE • RETURN • REUSE');
  const [footerTerms, setFooterTerms] = useState('All equipment rentals subject to 12-point inspection & security deposit terms.');

  const handleSaveSettings = () => {
    showToast('Settings Saved', 'Organization letterhead & system settings updated.', 'success');
  };

  return (
    <div className="w-full space-y-8 page-transition pb-16">
      <div className="flex items-center justify-between border-b border-[#5C4E4E]/30 pb-4">
        <div>
          <span className="text-xs font-mono uppercase text-[#988686] tracking-widest">SYSTEM CONFIGURATION</span>
          <h1 className="font-heading text-3xl font-bold text-[#000000] dark:text-white mt-1">
            Organization & Letterhead Settings
          </h1>
        </div>

        <Button leftIcon={<Save className="w-4 h-4" />} onClick={handleSaveSettings}>
          Save All Settings
        </Button>
      </div>

      <div className="flex items-center p-1 rounded-xl bg-[#988686]/15 max-w-sm">
        <button
          onClick={() => setActiveTab('Letterhead')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'Letterhead' ? 'bg-[#000000] dark:bg-[#988686] text-white shadow-warm-sm' : 'text-[#5C4E4E] dark:text-[#B5A9A9]'
          }`}
        >
          Letterhead Builder
        </button>
        <button
          onClick={() => setActiveTab('Org')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'Org' ? 'bg-[#000000] dark:bg-[#988686] text-white shadow-warm-sm' : 'text-[#5C4E4E] dark:text-[#B5A9A9]'
          }`}
        >
          Org Profile
        </button>
        <button
          onClick={() => setActiveTab('Roles')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'Roles' ? 'bg-[#000000] dark:bg-[#988686] text-white shadow-warm-sm' : 'text-[#5C4E4E] dark:text-[#B5A9A9]'
          }`}
        >
          Roles & Permissions
        </button>
      </div>

      {activeTab === 'Letterhead' ? (
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
          <h3 className="font-heading text-lg font-bold text-[#000000] dark:text-white">Organization Settings Panel</h3>
          <p className="text-xs text-[#988686] mt-1">Configured for ROVIA Management Systems Inc. (Mumbai HQ)</p>
        </Card>
      )}
    </div>
  );
};
