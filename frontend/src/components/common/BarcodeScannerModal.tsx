import React, { useState } from 'react';
import { Camera, QrCode, CheckCircle2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

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
  const [scanning, setScanning] = useState(true);
  const [scannedCode, setScannedCode] = useState<string | null>(null);

  const handleSimulateScan = () => {
    const mockCode = 'ROV-SKU-HAS-88492';
    setScanning(false);
    setScannedCode(mockCode);
    setTimeout(() => {
      onScanSuccess(mockCode);
      onClose();
      setScanning(true);
      setScannedCode(null);
    }, 1200);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="QR / Barcode Inventory Scanner" maxWidth="md">
      <div className="flex flex-col items-center justify-center p-6 text-center gap-4">
        {scannedCode ? (
          <div className="flex flex-col items-center gap-3 animate-fadeIn">
            <CheckCircle2 className="w-16 h-16 text-[#5E7A63]" />
            <h4 className="text-lg font-bold text-[#5E7A63]">Item Verified!</h4>
            <p className="text-xs font-mono bg-[#988686]/20 px-3 py-1.5 rounded">{scannedCode}</p>
          </div>
        ) : (
          <>
            <div className="relative w-64 h-64 rounded-2xl overflow-hidden glass-panel border-2 border-dashed border-[#988686] flex items-center justify-center bg-black/60">
              <Camera className="w-12 h-12 text-[#988686] animate-pulse" />
              <div className="absolute inset-x-4 top-1/2 h-0.5 bg-[#988686] animate-ping" />
              <div className="absolute top-2 left-2 text-[10px] text-[#988686] uppercase tracking-widest font-mono">
                CAMERA FEED: 1080P 60FPS
              </div>
            </div>

            <p className="text-xs text-[#5C4E4E] dark:text-[#B5A9A9] max-w-xs">
              Align the barcode or QR code on the rental asset pelican case within the frame.
            </p>

            <Button onClick={handleSimulateScan} leftIcon={<QrCode className="w-4 h-4" />}>
              Simulate Barcode Scan
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
};
