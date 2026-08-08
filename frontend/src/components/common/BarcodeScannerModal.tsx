import React, { useState } from 'react';
import { Camera, QrCode, CheckCircle2, Download, RefreshCw } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { QRCode } from './QRCode';

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
  const [customValue, setCustomValue] = useState('ROV-SKU-HAS-88492');

  const handleSimulateScan = () => {
    const mockCode = customValue || 'ROV-SKU-HAS-88492';
    setScannedCode(mockCode);
    setTimeout(() => {
      onScanSuccess(mockCode);
      onClose();
      setScannedCode(null);
    }, 1200);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Asset QR Code Scanner & Generator" maxWidth="md">
      <div className="flex flex-col items-center justify-center p-4 text-center gap-4">
        {/* Mode Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-[#988686]/20 w-full max-w-xs">
          <button
            onClick={() => setActiveTab('Scan')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'Scan' ? 'bg-[#000000] dark:bg-[#988686] text-white shadow-warm-sm' : 'text-[#5C4E4E] dark:text-[#B5A9A9]'
            }`}
          >
            Camera Scanner
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
          scannedCode ? (
            <div className="flex flex-col items-center gap-3 animate-fadeIn py-6">
              <CheckCircle2 className="w-16 h-16 text-[#5E7A63]" />
              <h4 className="text-lg font-bold text-[#5E7A63]">Asset Verified!</h4>
              <p className="text-xs font-mono bg-[#988686]/20 px-3 py-1.5 rounded">{scannedCode}</p>
            </div>
          ) : (
            <div className="space-y-4 w-full flex flex-col items-center">
              <div className="relative w-64 h-64 rounded-2xl overflow-hidden glass-panel border-2 border-dashed border-[#988686] flex items-center justify-center bg-black/60 shadow-xl">
                <Camera className="w-12 h-12 text-[#988686] animate-pulse" />
                <div className="absolute inset-x-4 top-1/2 h-0.5 bg-[#988686] animate-ping" />
                <div className="absolute top-2 left-2 text-[10px] text-[#988686] uppercase tracking-widest font-mono">
                  SCANNER FEED: ACTIVE
                </div>
              </div>

              <p className="text-xs text-[#5C4E4E] dark:text-[#B5A9A9] max-w-xs">
                Align the asset barcode or QR tag within the optical frame to scan.
              </p>

              <Button onClick={handleSimulateScan} leftIcon={<QrCode className="w-4 h-4" />}>
                Execute Scan Verification
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
                placeholder="Enter Asset ID or SKU"
                className="w-full glass-input text-xs p-2 rounded-lg text-center font-mono font-bold"
              />
              <p className="text-[10px] text-[#988686]">Attach this generated QR code tag to physical rental equipment.</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
