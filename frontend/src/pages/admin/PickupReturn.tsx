import React, { useState } from 'react';
import { Camera, CheckSquare, ShieldCheck, AlertTriangle, QrCode, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { FileUpload } from '../../components/ui/FileUpload';
import { BarcodeScannerModal } from '../../components/common/BarcodeScannerModal';
import { INITIAL_INSPECTIONS, InspectionItem } from '../../services/mockData';
import { useToast } from '../../components/ui/Toast';

export const PickupReturn: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Pickup' | 'Return'>('Return');
  const [inspections, setInspections] = useState<InspectionItem[]>(INITIAL_INSPECTIONS);
  const [selectedInspection, setSelectedInspection] = useState<InspectionItem | null>(INITIAL_INSPECTIONS[0]);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const { showToast } = useToast();

  // Return Flow Live Inspection Form State
  const [conditionRating, setConditionRating] = useState<'Pristine' | 'Good' | 'Minor Wear' | 'Damaged'>('Pristine');
  const [damageReported, setDamageReported] = useState(false);
  const [damageDescription, setDamageDescription] = useState('');
  const [damageCostEstimate, setDamageCostEstimate] = useState(0);

  const baseDepositHeld = 25000;
  const netRefund = Math.max(0, baseDepositHeld - damageCostEstimate);

  const handleCompleteInspection = () => {
    showToast('Inspection Completed', `Deposit settlement calculated: ₹${netRefund.toLocaleString()} refunded to customer.`, 'success');
  };

  return (
    <div className="w-full space-y-8 page-transition pb-16">
      <div className="flex items-center justify-between border-b border-[#5C4E4E]/30 pb-4">
        <div>
          <span className="text-xs font-mono uppercase text-[#988686] tracking-widest">LOGISTICS & DISPATCH</span>
          <h1 className="font-heading text-3xl font-bold text-[#000000] dark:text-white mt-1">
            Pickup & Return Management
          </h1>
        </div>

        <Button variant="primary" leftIcon={<QrCode className="w-4 h-4" />} onClick={() => setShowScannerModal(true)}>
          Scan QR / Barcode Tag
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center p-1 rounded-xl bg-[#988686]/15 max-w-xs">
        <button
          onClick={() => setActiveTab('Pickup')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'Pickup' ? 'bg-[#000000] dark:bg-[#988686] text-white shadow-warm-sm' : 'text-[#5C4E4E] dark:text-[#B5A9A9]'
          }`}
        >
          Pickup Schedule
        </button>
        <button
          onClick={() => setActiveTab('Return')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'Return' ? 'bg-[#000000] dark:bg-[#988686] text-white shadow-warm-sm' : 'text-[#5C4E4E] dark:text-[#B5A9A9]'
          }`}
        >
          Return Inspections
        </button>
      </div>

      {/* Main Grid: Inspection List Left, Live Form Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Inspection List Left (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#988686]">
            {activeTab} Queue ({inspections.filter((i) => i.type === activeTab).length})
          </h3>
          {inspections.map((insp) => (
            <Card
              key={insp.id}
              className={`cursor-pointer transition-all ${
                selectedInspection?.id === insp.id ? 'border-[#988686] ring-2 ring-[#988686]/40 bg-[#988686]/10' : ''
              }`}
              onClick={() => setSelectedInspection(insp)}
            >
              <div className="flex items-center gap-3">
                <img src={insp.productImage} alt={insp.productName} className="w-12 h-12 object-cover rounded-lg" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#000000] dark:text-white">{insp.orderNumber}</span>
                    <span className="text-[10px] text-[#988686] font-mono">{insp.scheduledTime}</span>
                  </div>
                  <h4 className="font-bold text-xs text-[#000000] dark:text-white mt-0.5">{insp.customerName}</h4>
                  <p className="text-[11px] text-[#988686]">{insp.productName}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Live Condition Inspection Form Right (7 cols) */}
        <div className="lg:col-span-7 space-y-6 glass-panel p-6 sm:p-8 rounded-3xl border border-[#988686]/30">
          <div className="flex items-center justify-between border-b border-[#988686]/30 pb-3">
            <div>
              <span className="text-xs font-mono text-[#988686]">INSPECTION WORKFLOW</span>
              <h3 className="font-heading text-xl font-bold text-[#000000] dark:text-white">
                Condition Inspection Form
              </h3>
            </div>
            <Badge variant="warning">Live Calculation Mode</Badge>
          </div>

          {/* Condition Rating Pills */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-[#5C4E4E] dark:text-[#B5A9A9]">
              Overall Asset Condition Rating
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Pristine', 'Good', 'Minor Wear', 'Damaged'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setConditionRating(r)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    conditionRating === r
                      ? r === 'Damaged'
                        ? 'bg-[#A0524E] text-white border-[#A0524E]'
                        : 'bg-[#988686] text-white border-[#988686]'
                      : 'glass-panel text-[#5C4E4E] dark:text-[#B5A9A9]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Damage Toggle & Form */}
          <div className="space-y-3 p-4 rounded-2xl bg-[#988686]/10 border border-[#988686]/20">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#000000] dark:text-white">
                <input
                  type="checkbox"
                  checked={damageReported}
                  onChange={(e) => setDamageReported(e.target.checked)}
                  className="rounded border-[#988686] text-[#988686]"
                />
                <span>Report Damage / Missing Accessories</span>
              </label>
              {damageReported && <Badge variant="danger">Deduction Active</Badge>}
            </div>

            {damageReported && (
              <div className="space-y-3 pt-2 animate-fadeIn">
                <Input
                  label="Damage Description & Notes"
                  placeholder="e.g. Scratch on front glass element / Missing 2x V-mount batteries"
                  value={damageDescription}
                  onChange={(e) => setDamageDescription(e.target.value)}
                />
                <Input
                  label="Cost Estimate for Repair / Replacement (₹)"
                  type="number"
                  value={damageCostEstimate}
                  onChange={(e) => setDamageCostEstimate(Number(e.target.value))}
                />
              </div>
            )}
          </div>

          {/* Photo Attachment Preview */}
          <FileUpload label="Attach Inspection Photos (Damage / Return Condition)" />

          {/* Live Deposit Settlement Calculation Box */}
          <div className="p-4 rounded-2xl bg-[#5E7286]/15 border border-[#5E7286]/30 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#5C4E4E] dark:text-[#B5A9A9]">Held Security Deposit:</span>
              <span className="font-mono font-bold">₹{baseDepositHeld.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[#A0524E]">
              <span>Damage / Missing Deduction:</span>
              <span className="font-mono font-bold">-₹{damageCostEstimate.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-[#5E7286]/30 pt-2 font-bold text-sm text-[#5E7A63]">
              <span>Net Refund Calculated:</span>
              <span className="font-mono">₹{netRefund.toLocaleString()}</span>
            </div>
          </div>

          <Button size="lg" className="w-full" leftIcon={<CheckCircle2 className="w-4 h-4" />} onClick={handleCompleteInspection}>
            Complete Inspection & Authorize Deposit Refund
          </Button>
        </div>
      </div>

      <BarcodeScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        onScanSuccess={(code) => showToast('Barcode Scanned', `Verified item tag: ${code}`, 'success')}
      />
    </div>
  );
};
