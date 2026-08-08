import React, { useState } from 'react';
import { Clock, Calculator, ShieldAlert, AlertTriangle, Save, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DataTable, Column } from '../../components/ui/DataTable';
import { INITIAL_ORDERS, Order } from '../../services/mockData';
import { useToast } from '../../components/ui/Toast';

export const LateFees: React.FC = () => {
  const { showToast } = useToast();

  // Rules State
  const [gracePeriodHours, setGracePeriodHours] = useState(4);
  const [feeRateMultiplier, setFeeRateMultiplier] = useState(1.5); // 1.5x daily rate per day late
  const [maxFeeCapPct, setMaxFeeCapPct] = useState(100); // Max 100% of deposit

  // Live Calculator Sandbox State
  const [sampleDailyRate, setSampleDailyRate] = useState(5000);
  const [sampleDaysLate, setSampleDaysLate] = useState(3);

  const calculatedFee = Math.round(sampleDailyRate * feeRateMultiplier * sampleDaysLate);

  const handleSaveRules = () => {
    showToast('Rules Engine Saved', 'Late fee penalty calculation rules updated system-wide.', 'success');
  };

  const overdueOrders = INITIAL_ORDERS.filter((o) => o.status === 'Overdue');

  const overdueColumns: Column<Order>[] = [
    { key: 'orderNumber', header: 'Contract #', render: (r) => <span className="font-mono font-bold text-[#A0524E]">{r.orderNumber}</span> },
    { key: 'customerName', header: 'Customer', render: (r) => <span className="font-semibold">{r.customerName}</span> },
    { key: 'productName', header: 'Gear', render: (r) => <span className="truncate max-w-[180px] block">{r.productName}</span> },
    { key: 'daysOverdue', header: 'Days Overdue', render: (r) => <span className="font-mono font-bold text-[#A0524E]">{r.daysOverdue} Days</span> },
    { key: 'estimatedPenalty', header: 'Accrued Penalty', render: (r) => <span className="font-mono font-bold">₹{r.estimatedPenalty?.toLocaleString()}</span> },
    {
      key: 'actions',
      header: 'Action',
      render: (r) => (
        <Button size="sm" variant="destructive" onClick={() => showToast('Invoice Sent', `Penalty auto-invoice sent to ${r.customerName}`, 'success')}>
          Issue Penalty Invoice
        </Button>
      ),
    },
  ];

  return (
    <div className="w-full space-y-8 page-transition pb-16">
      <div className="flex items-center justify-between border-b border-[#5C4E4E]/30 pb-4">
        <div>
          <span className="text-xs font-mono uppercase text-[#988686] tracking-widest">RULES ENGINE</span>
          <h1 className="font-heading text-3xl font-bold text-[#000000] dark:text-white mt-1">
            Late Fee Rules & Outstanding Penalties
          </h1>
        </div>

        <Button variant="primary" leftIcon={<Save className="w-4 h-4" />} onClick={handleSaveRules}>
          Save Rules Configuration
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Rules Config Form (6 cols) */}
        <div className="lg:col-span-6 space-y-6 glass-panel p-6 rounded-3xl border border-[#988686]/30">
          <div className="flex items-center gap-2 border-b border-[#988686]/30 pb-3">
            <Clock className="w-5 h-5 text-[#988686]" />
            <h3 className="font-heading text-xl font-bold text-[#000000] dark:text-white">
              Rules Engine Configuration
            </h3>
          </div>

          <div className="space-y-4">
            <Input
              label="Grace Period (Hours)"
              type="number"
              value={gracePeriodHours}
              onChange={(e) => setGracePeriodHours(Number(e.target.value))}
              helperText="No penalty applied if returned within grace window."
            />
            <Input
              label="Late Daily Rate Multiplier (x)"
              type="number"
              step="0.1"
              value={feeRateMultiplier}
              onChange={(e) => setFeeRateMultiplier(Number(e.target.value))}
              helperText="e.g. 1.5x daily rate per day overdue."
            />
            <Input
              label="Maximum Fee Cap (% of Security Deposit)"
              type="number"
              value={maxFeeCapPct}
              onChange={(e) => setMaxFeeCapPct(Number(e.target.value))}
              helperText="Late penalty cannot exceed this percentage of held deposit."
            />
          </div>
        </div>

        {/* Right Column: Live Example Preview Sandbox (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="space-y-4 border-2 border-[#988686]/40 p-6 bg-[#988686]/10">
            <div className="flex items-center gap-2 border-b border-[#988686]/30 pb-2">
              <Calculator className="w-5 h-5 text-[#988686]" />
              <h3 className="font-heading text-lg font-bold text-[#000000] dark:text-white">
                Live Penalty Calculator Sandbox
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <Input
                label="Sample Item Daily Rate (₹)"
                type="number"
                value={sampleDailyRate}
                onChange={(e) => setSampleDailyRate(Number(e.target.value))}
              />
              <Input
                label="Days Overdue"
                type="number"
                value={sampleDaysLate}
                onChange={(e) => setSampleDaysLate(Number(e.target.value))}
              />
            </div>

            <div className="p-4 rounded-xl bg-[#0D0B0B]/80 text-white border border-[#988686]/40 space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Calculation Formula:</span>
                <span className="font-mono text-[#988686]">Rate × {feeRateMultiplier}x × {sampleDaysLate} Days</span>
              </div>
              <div className="flex justify-between border-t border-[#5C4E4E]/40 pt-2 text-base font-bold">
                <span className="text-[#A0524E]">Calculated Late Fee Penalty:</span>
                <span className="font-mono text-[#A0524E]">₹{calculatedFee.toLocaleString()}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Outstanding Penalties Table */}
      <div className="space-y-4">
        <h3 className="font-heading text-xl font-bold text-[#000000] dark:text-white">
          Currently Outstanding Unsettled Penalties
        </h3>
        <DataTable columns={overdueColumns} data={overdueOrders} emptyText="No outstanding penalties!" />
      </div>
    </div>
  );
};
