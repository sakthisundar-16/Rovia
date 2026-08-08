import React, { useState } from 'react';
import { BarChart3, Download, Filter, TrendingUp, ShieldCheck, Clock, Layers } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';

export const Reports: React.FC = () => {
  const { showToast } = useToast();

  const reportCards = [
    { title: 'Asset Utilization Rate', value: '78.4%', sub: 'High demand on 100MP & 8K cinema gear' },
    { title: 'Top Rented Gear', value: 'Hasselblad X2D', sub: '34 bookings this month' },
    { title: 'Average Late Fee / Penalty', value: '₹4,200', sub: 'Calculated over 9 overdue instances' },
    { title: 'Customer Retention Rate', value: '84.2%', sub: 'Repeat studio production bookings' },
  ];

  return (
    <div className="w-full space-y-8 page-transition pb-16">
      <div className="flex items-center justify-between border-b border-[#5C4E4E]/30 pb-4">
        <div>
          <span className="text-xs font-mono uppercase text-[#988686] tracking-widest">BUSINESS INTELLIGENCE</span>
          <h1 className="font-heading text-3xl font-bold text-[#000000] dark:text-white mt-1">
            Reports & Analytics Studio
          </h1>
        </div>

        <Button variant="primary" leftIcon={<Download className="w-4 h-4" />} onClick={() => showToast('Exporting Report', 'CSV and PDF report generated.', 'success')}>
          Export Analytics Data
        </Button>
      </div>

      {/* Pre-built Dashboard-of-Dashboards Report Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportCards.map((card, idx) => (
          <Card key={idx} className="space-y-2 p-5">
            <span className="text-xs font-bold uppercase text-[#5C4E4E] dark:text-[#B5A9A9]">{card.title}</span>
            <div className="font-heading text-3xl font-bold font-mono text-[#000000] dark:text-white">{card.value}</div>
            <p className="text-[11px] text-[#988686]">{card.sub}</p>
          </Card>
        ))}
      </div>

      {/* Analytics Chart Container */}
      <Card className="p-6 space-y-6">
        <h3 className="font-heading text-xl font-bold text-[#000000] dark:text-white border-b border-[#5C4E4E]/30 pb-3">
          Monthly Asset Revenue vs Deposit Unlocks
        </h3>
        <div className="h-56 flex items-end justify-between gap-6 pt-6 px-4">
          {[
            { month: 'Apr', rev: 320, dep: 290 },
            { month: 'May', rev: 390, dep: 350 },
            { month: 'Jun', rev: 410, dep: 380 },
            { month: 'Jul', rev: 440, dep: 410 },
            { month: 'Aug', rev: 485, dep: 450 },
          ].map((bar, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end justify-center gap-2 h-44">
                <div style={{ height: `${(bar.rev / 500) * 100}%` }} className="w-1/2 bg-[#988686] rounded-t" />
                <div style={{ height: `${(bar.dep / 500) * 100}%` }} className="w-1/2 bg-[#5E7A63] rounded-t" />
              </div>
              <span className="text-xs font-mono text-[#988686]">{bar.month}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
