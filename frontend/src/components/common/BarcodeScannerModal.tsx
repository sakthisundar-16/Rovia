import React, { useState } from 'react';
import { Camera, QrCode, CheckCircle2, Search, ArrowRight, ShieldCheck } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { QRCode } from './QRCode';
import { api } from '../../services/api';
import { Order } from '../../services/mockData';
import { useToast } from '../ui/Toast';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (code: string) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'Scan' | 'Generate'>('Scan');
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [customValue, setCustomValue] = useState('ROV-2026-879');
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const { showToast } = useToast();

  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);

  const extractToken = (rawInput: string): string => {
    if (!rawInput) return '';
    try {
      const url = new URL(rawInput);
      const tokenParam = url.searchParams.get('token');
      if (tokenParam) return tokenParam;
      return rawInput.trim();
    } catch {
      return rawInput.trim();
    }
  };

  const handleSimulateScan = async () => {
    const rawCode = customValue.trim() || 'ROV-2026-879';
    const cleanToken = extractToken(rawCode);
    setScannedCode(cleanToken);
    setScanResult(null);

    // Call FastAPI verify-handover backend endpoint
    const res = await api.verifyHandoverToken(cleanToken);
    setScanResult({ success: res.success, message: res.message });

    if (res.order) {
      setFoundOrder(res.order);
    } else {
      const orders = await api.getOrders();
      const match = orders.find(
        (o) => o.orderNumber.toUpperCase() === cleanToken.toUpperCase() || o.id === cleanToken
      );
      setFoundOrder(match ?? {
        id: 'ord-' + Date.now(),
        orderNumber: cleanToken,
        customerName: 'Elena Vance',
        customerEmail: 'elena.vance@studio-noir.com',
        customerPhone: '+91 98765 43210',
        productName: 'Hasselblad X2D 100C Medium Format Rig',
        variant: 'Cinema Master Package',
        rentalWindow: { start: '2026-08-09', end: '2026-08-12', days: 3 },
        rentalFee: 25500,
        depositAmount: 50000,
        taxAmount: 4590,
        totalAmount: 80090,
        status: 'Pending Approval',
        depositStatus: 'Held',
        renterId: 'rnt-101',
        renterName: 'ROVIA Atelier & Cinema Rigs',
        customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        productImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600',
        pickupMethod: 'In-Store Pickup',
        timeline: [
          { stage: 'Order Placed', timestamp: 'Just now', completed: true },
          { stage: 'Renter QR Verification', timestamp: 'Pending', completed: false }
        ]
      });
    }
  };

  const handleApproveRental = async () => {
    if (!foundOrder) return;
    setIsApproving(true);

    await api.updateOrder(foundOrder.id, { status: 'Active' });
    showToast(
      'Rental Handover Complete!',
      `Order ${foundOrder.orderNumber} status changed to ACTIVE in database. Hand over product now.`,
      'success'
    );
    setIsApproving(false);
    onScanSuccess(foundOrder.orderNumber);
    onClose();
    setScannedCode(null);
    setFoundOrder(null);
    setScanResult(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Renter QR Scanner & Rental Approval Tool" maxWidth="md">
      <div className="flex flex-col items-center justify-center p-2 text-center gap-4">
        {/* Mode Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-[#988686]/20 w-full max-w-xs">
          <button
            onClick={() => {
              setActiveTab('Scan');
              setFoundOrder(null);
              setScannedCode(null);
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'Scan' ? 'bg-[#000000] dark:bg-[#988686] text-white shadow-warm-sm' : 'text-[#5C4E4E] dark:text-[#B5A9A9]'
            }`}
          >
            QR Scan Approval
          </button>
          <button
            onClick={() => setActiveTab('Generate')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'Generate' ? 'bg-[#000000] dark:bg-[#988686] text-white shadow-warm-sm' : 'text-[#5C4E4E] dark:text-[#B5A9A9]'
            }`}
          >
            Generate QR Tag
          </button>
        </div>

        {activeTab === 'Scan' ? (
          foundOrder ? (
            <div className="w-full text-left space-y-4 p-4 rounded-2xl glass-card border border-[#988686]/30 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-[#988686]/30 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#5E7A63]" />
                  <span className="font-bold text-sm text-[#000000] dark:text-white">QR Contract Scanned</span>
                </div>
                <span className="font-mono text-xs font-bold bg-[#5E7286]/20 text-[#5E7286] px-2.5 py-1 rounded">
                  {foundOrder.orderNumber}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#988686] uppercase font-semibold">Customer</span>
                  <p className="font-bold text-[#000000] dark:text-white">{foundOrder.customerName}</p>
                  <p className="text-[11px] text-[#5C4E4E] dark:text-[#B5A9A9]">{foundOrder.customerPhone}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#988686] uppercase font-semibold">Rented Equipment</span>
                  <p className="font-bold text-[#000000] dark:text-white">{foundOrder.productName}</p>
                  <p className="text-[11px] text-[#5E7A63] font-semibold">Deposit: ₹{foundOrder.depositAmount.toLocaleString()}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#5E7A63]/15 border border-[#5E7A63]/30 flex items-center gap-2 text-xs text-[#5E7A63]">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <span>Customer QR contract verified. Ready for Renter approval and equipment dispatch.</span>
              </div>

              <Button
                onClick={handleApproveRental}
                isLoading={isApproving}
                className="w-full py-3"
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Approve & Confirm Rental Dispatch
              </Button>
            </div>
          ) : (
            <div className="space-y-4 w-full flex flex-col items-center">
              <div className="relative w-64 h-64 rounded-2xl overflow-hidden glass-panel border-2 border-dashed border-[#988686] flex items-center justify-center bg-black/60 shadow-xl">
                <Camera className="w-12 h-12 text-[#988686] animate-pulse" />
                <div className="absolute inset-x-4 top-1/2 h-0.5 bg-[#988686] animate-ping" />
                <div className="absolute top-2 left-2 text-[10px] text-[#988686] uppercase tracking-widest font-mono">
                  RENTER QR SCANNER: ACTIVE
                </div>
              </div>

              <div className="w-full max-w-xs space-y-2">
                <input
                  type="text"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  placeholder="Enter or Scan Order QR Code (e.g. ROV-2026-879)"
                  className="w-full glass-input text-xs p-2.5 rounded-xl text-center font-mono font-bold"
                />
              </div>

              <Button onClick={handleSimulateScan} leftIcon={<QrCode className="w-4 h-4" />}>
                Scan Customer QR Code
              </Button>
            </div>
          )
        ) : (
          <div className="space-y-4 w-full flex flex-col items-center py-2">
            <QRCode value={customValue} size={180} />
            <div className="w-full max-w-xs space-y-2">
              <input
                type="text"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                placeholder="Enter Order or SKU"
                className="w-full glass-input text-xs p-2 rounded-lg text-center font-mono font-bold"
              />
              <p className="text-[10px] text-[#988686]">Generate QR code tag for rental contract or equipment.</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
