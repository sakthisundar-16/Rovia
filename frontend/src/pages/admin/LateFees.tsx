import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calculator, 
  ShieldAlert, 
  AlertTriangle, 
  Save, 
  RefreshCw, 
  FileText, 
  ShieldCheck, 
  ChevronRight,
  Layers
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Order } from '../../services/mockData';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import { 
  getLateFeeRules, 
  saveLateFeeRules, 
  calculateLateFee, 
  LateFeeRules, 
  evaluateOrderOverdue 
} from '../../services/lateFeeEngine';
import { InvoicePreviewModal } from '../../components/common/InvoicePreviewModal';

export const LateFees: React.FC = () => {
  const { showToast } = useToast();

  // Rules State from lateFeeEngine
  const [rules, setRules] = useState<LateFeeRules>(getLateFeeRules());

  // Live Calculator Sandbox State
  const [sampleDailyRate, setSampleDailyRate] = useState(5000);
  const [sampleDeposit, setSampleDeposit] = useState(25000);
  const [sampleHoursLate, setSampleHoursLate] = useState(36); // e.g. 1.5 days

  // Manual Penalty Invoice State
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [manualPenaltyAmount, setManualPenaltyAmount] = useState<number>(0);
  const [manualPenaltyReason, setManualPenaltyReason] = useState('');

  // Invoice Preview State
  const [previewOrder, setPreviewOrder] = useState<Order | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = async () => {
    const loaded = await api.getOrders();
    setOrders(loaded);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Sandbox calculation
  const mockExpected = new Date('2026-08-01T18:00:00');
  const mockActual = new Date(mockExpected.getTime() + sampleHoursLate * 3600 * 1000);
  const sandboxResult = calculateLateFee(mockExpected, mockActual, sampleDailyRate, sampleDeposit, rules);

  const handleSaveRules = () => {
    saveLateFeeRules(rules);
    showToast('Rules Engine Saved', 'Late fee penalty calculation rules updated and applied system-wide.', 'success');
    // Re-evaluate orders with new rules
    setOrders(prev => prev.map(o => evaluateOrderOverdue(o, rules)));
  };

  const handleIssueManualInvoice = async () => {
    if (!selectedOrderId || manualPenaltyAmount <= 0) {
      showToast('Error', 'Please select an order and enter a valid penalty amount.', 'error');
      return;
    }
    const order = orders.find(o => o.id === selectedOrderId);
    if (!order) return;

    const res = await api.updateOrder(order.id, {
      penaltyIssued: true,
      penaltyAmount: manualPenaltyAmount,
      deductionReason: manualPenaltyReason || 'Manual Late Penalty Assessment',
      timeline: [
        ...order.timeline,
        {
          stage: 'Penalty Invoice Issued (Manual)',
          timestamp: new Date().toISOString(),
          completed: true,
          notes: manualPenaltyReason || `Penalty of ₹${manualPenaltyAmount} issued.`,
        }
      ]
    });

    if (res) {
      showToast('Invoice Issued', `Penalty of ₹${manualPenaltyAmount.toLocaleString()} sent to ${order.customerName}`, 'success');
      setOrders(prev => prev.map(o => o.id === res.id ? res : o));
      setSelectedOrderId('');
      setManualPenaltyAmount(0);
      setManualPenaltyReason('');
    }
  };

  const overdueOrders = orders.filter((o) => o.status === 'Overdue');

  const overdueColumns: Column<Order>[] = [
    { 
      key: 'orderNumber', 
      header: 'Contract #', 
      render: (r) => <span className="font-mono font-bold text-[#A0524E]">{r.orderNumber}</span> 
    },
    { 
      key: 'customerName', 
      header: 'Customer', 
      render: (r) => <span className="font-semibold">{r.customerName}</span> 
    },
    { 
      key: 'productName', 
      header: 'Equipment', 
      render: (r) => <span className="truncate max-w-[180px] block font-medium">{r.productName}</span> 
    },
    { 
      key: 'daysOverdue', 
      header: 'Overdue Duration', 
      render: (r) => (
        <span className="font-mono font-bold text-[#A0524E] bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900 text-xs">
          {r.daysOverdue || 1} Days
        </span>
      )
    },
    { 
      key: 'estimatedPenalty', 
      header: 'Accrued Penalty', 
      render: (r) => (
        <span className="font-mono font-bold text-[#A0524E]">
          ₹{r.estimatedPenalty?.toLocaleString() || '0'}
        </span>
      ) 
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<FileText className="w-3.5 h-3.5" />}
            onClick={() => setPreviewOrder(r)}
            className="text-xs"
          >
            Generate Invoice
          </Button>

          <Button 
            size="sm" 
            variant={r.penaltyIssued ? "outline" : "destructive"} 
            disabled={r.penaltyIssued}
            onClick={async () => {
              if (r.penaltyIssued) return;
              const res = await api.updateOrder(r.id, { 
                penaltyIssued: true, 
                penaltyAmount: r.estimatedPenalty || 0,
                timeline: [
                  ...r.timeline,
                  { stage: 'Penalty Invoice Issued', timestamp: new Date().toISOString(), completed: true }
                ] 
              });
              if (res) {
                showToast('Invoice Issued', `Penalty invoice sent to ${r.customerName}`, 'success');
                setOrders(prev => prev.map(o => o.id === res.id ? res : o));
              }
            }}
            className="text-xs font-bold"
          >
            {r.penaltyIssued ? 'Invoice Issued' : 'Issue Penalty Invoice'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full space-y-8 page-transition pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#5C4E4E]/30 pb-4">
        <div>
          <span className="text-xs font-mono uppercase text-[#988686] tracking-widest font-bold">
            CENTRALIZED CALCULATION RULES ENGINE
          </span>
          <h1 className="font-heading text-3xl font-bold text-[#000000] dark:text-white mt-1">
            Late Fee Rules &amp; Outstanding Penalties
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" leftIcon={<RefreshCw className="w-4 h-4" />} onClick={fetchOrders}>
            Refresh Orders
          </Button>
          <Button variant="primary" leftIcon={<Save className="w-4 h-4" />} onClick={handleSaveRules}>
            Save Rules Configuration
          </Button>
        </div>
      </div>

      {/* Rules Engine Config & Live Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Rules Configuration Form (6 cols) */}
        <div className="lg:col-span-6 space-y-6 glass-panel p-6 rounded-3xl border border-[#988686]/30 shadow-lg">
          <div className="flex items-center gap-2 border-b border-[#988686]/30 pb-3">
            <Clock className="w-5 h-5 text-[#988686]" />
            <h3 className="font-heading text-xl font-bold text-[#000000] dark:text-white">
              Rules Engine Parameters
            </h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Grace Period (Hours)"
                type="number"
                value={rules.gracePeriodHours}
                onChange={(e) => setRules({ ...rules, gracePeriodHours: Number(e.target.value) })}
                helperText="No penalty applied if returned within grace window."
              />

              <Input
                label="Hourly Overdue Multiplier (x)"
                type="number"
                step="0.05"
                value={rules.hourlyRateMultiplier}
                onChange={(e) => setRules({ ...rules, hourlyRateMultiplier: Number(e.target.value) })}
                helperText="Applied for delays under 24h past grace period."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Tier 1 Daily Multiplier (Days 1–3)"
                type="number"
                step="0.1"
                value={rules.dailyMultiplierTier1}
                onChange={(e) => setRules({ ...rules, dailyMultiplierTier1: Number(e.target.value) })}
                helperText="e.g. 1.5x daily rate per day."
              />

              <Input
                label="Tier 2 Escalated Multiplier (Day 4+)"
                type="number"
                step="0.1"
                value={rules.dailyMultiplierTier2}
                onChange={(e) => setRules({ ...rules, dailyMultiplierTier2: Number(e.target.value) })}
                helperText="e.g. 2.0x daily rate for extended overdue."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Admin Handling Fee (₹)"
                type="number"
                value={rules.adminHandlingFee}
                onChange={(e) => setRules({ ...rules, adminHandlingFee: Number(e.target.value) })}
                helperText="Fixed operational charge for late rescheduling."
              />

              <Input
                label="Max Fee Cap (% of Security Deposit)"
                type="number"
                value={rules.maxDepositCapPct}
                onChange={(e) => setRules({ ...rules, maxDepositCapPct: Number(e.target.value) })}
                helperText="Late penalty cannot exceed this % of held deposit."
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Penalty Calculator Sandbox (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="space-y-4 border-2 border-[#988686]/40 p-6 bg-gradient-to-br from-white via-white/95 to-[#988686]/10 dark:from-[#161313] dark:to-[#5C4E4E]/20 shadow-lg">
            <div className="flex items-center justify-between border-b border-[#988686]/30 pb-2">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[#988686]" />
                <h3 className="font-heading text-lg font-bold text-[#000000] dark:text-white">
                  Live Calculator Sandbox
                </h3>
              </div>
              <Badge variant="neutral" className="text-[10px]">
                REAL-TIME SIMULATION
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <Input
                label="Daily Rate (₹)"
                type="number"
                value={sampleDailyRate}
                onChange={(e) => setSampleDailyRate(Number(e.target.value))}
              />
              <Input
                label="Held Deposit (₹)"
                type="number"
                value={sampleDeposit}
                onChange={(e) => setSampleDeposit(Number(e.target.value))}
              />
              <Input
                label="Hours Overdue"
                type="number"
                value={sampleHoursLate}
                onChange={(e) => setSampleHoursLate(Number(e.target.value))}
              />
            </div>

            {/* Sandbox Breakdown Output */}
            <div className="p-4 rounded-xl bg-[#0D0B0B]/90 text-white border border-[#988686]/40 space-y-2 text-xs">
              <div className="flex justify-between items-center pb-1 border-b border-[#5C4E4E]/40">
                <span className="text-[#988686]">Grace Window Status:</span>
                {sandboxResult.inGracePeriod ? (
                  <span className="text-emerald-400 font-bold">Within {rules.gracePeriodHours}h Grace (No charge)</span>
                ) : (
                  <span className="text-amber-400 font-bold">Elapsed ({sandboxResult.chargeableHours}h billable)</span>
                )}
              </div>

              {sandboxResult.tiers.map((tier, idx) => (
                <div key={idx} className="flex justify-between text-[11px]">
                  <span className="text-[#D1D0D0]">{tier.name}:</span>
                  <span className="font-mono text-white">₹{tier.subtotal.toLocaleString()}</span>
                </div>
              ))}

              <div className="flex justify-between text-[11px] text-[#988686]">
                <span>Deposit Protection Cap ({rules.maxDepositCapPct}%):</span>
                <span className="font-mono">Max ₹{sandboxResult.maxDepositCap.toLocaleString()}</span>
              </div>

              <div className="flex justify-between border-t border-[#5C4E4E]/40 pt-2 text-base font-bold">
                <span className="text-[#A0524E]">Calculated Late Fee Penalty:</span>
                <span className="font-mono text-[#A0524E]">₹{sandboxResult.finalPenalty.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-emerald-400 font-semibold text-xs pt-1">
                <span>Remaining Refundable Deposit:</span>
                <span className="font-mono">₹{sandboxResult.remainingDeposit.toLocaleString()}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Manual Penalty Assignment */}
      <Card className="p-6 border border-[#5C4E4E]/30 bg-white/40 dark:bg-[#000000]/20 space-y-4 shadow-md">
        <div className="flex items-center gap-2 border-b border-[#5C4E4E]/30 pb-3">
          <ShieldAlert className="w-5 h-5 text-[#A0524E]" />
          <h3 className="font-heading text-lg font-bold text-[#000000] dark:text-white">
            Manual Penalty Assignment &amp; Custom Adjustment
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2 col-span-1 flex flex-col">
            <label className="text-xs font-bold text-[#988686]">Select Customer/Order</label>
            <select 
              className="w-full h-[42px] bg-white dark:bg-[#0D0B0B] border border-[#5C4E4E]/50 rounded-xl px-4 py-2 text-sm text-[#000000] dark:text-white outline-none focus:border-[#D1D0D0]"
              value={selectedOrderId}
              onChange={(e) => {
                setSelectedOrderId(e.target.value);
                const order = orders.find(o => o.id === e.target.value);
                if (order && order.estimatedPenalty) setManualPenaltyAmount(order.estimatedPenalty);
              }}
            >
              <option value="">-- Choose Order --</option>
              {orders.filter(o => !o.penaltyIssued && ['Active', 'Past', 'Overdue'].includes(o.status)).map(o => (
                <option key={o.id} value={o.id}>{o.orderNumber} - {o.customerName} ({o.productName})</option>
              ))}
            </select>
          </div>

          <Input 
            label="Penalty Amount (₹)" 
            type="number" 
            value={manualPenaltyAmount || ''} 
            onChange={(e) => setManualPenaltyAmount(Number(e.target.value))} 
          />

          <Input 
            label="Reason" 
            value={manualPenaltyReason} 
            onChange={(e) => setManualPenaltyReason(e.target.value)} 
            placeholder="e.g. Returned 2 days late without notice"
          />

          <div className="flex items-end pb-1">
            <Button variant="destructive" className="w-full font-bold" onClick={handleIssueManualInvoice}>
              Assign &amp; Issue Invoice
            </Button>
          </div>
        </div>
      </Card>

      {/* Outstanding Penalties Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-xl font-bold text-[#000000] dark:text-white">
            Currently Outstanding Overdue Contracts ({overdueOrders.length})
          </h3>
        </div>
        <DataTable columns={overdueColumns} data={overdueOrders} emptyText="No outstanding penalties! All rentals are currently on schedule." />
      </div>

      {/* Invoice Modal */}
      <InvoicePreviewModal
        isOpen={Boolean(previewOrder)}
        onClose={() => setPreviewOrder(null)}
        order={previewOrder}
      />
    </div>
  );
};
