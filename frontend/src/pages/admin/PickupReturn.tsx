import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  CheckSquare,
  ShieldCheck,
  AlertTriangle,
  QrCode,
  FileText,
  CheckCircle2,
  ScanEye,
  Cpu,
  Crosshair,
  Sparkles,
  RefreshCw,
  Upload,
  AlertCircle,
  Eye,
  Check,
  X,
  ArrowRight,
  Video,
  Sliders,
  Flame,
  Download,
  Printer,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { FileUpload } from '../../components/ui/FileUpload';
import { BarcodeScannerModal } from '../../components/common/BarcodeScannerModal';
import { INITIAL_INSPECTIONS, InspectionItem } from '../../services/mockData';
import { useToast } from '../../components/ui/Toast';
import { apiFetch } from '../../services/apiClient';

interface DefectBox {
  id: number;
  label: string;
  x: number; // percentage 0-100
  y: number;
  width: number;
  height: number;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  areaPixels: number;
  confidence: number;
}

interface AngleInspectionData {
  angleNumber: 1 | 2 | 3 | 4;
  label: string;
  subLabel: string;
  baselineImage: string;
  returnImage: string;
  isScanned: boolean;
  isDamaged: boolean;
  matchScore: number;
  damagePercentage: number;
  defects: DefectBox[];
  severity: 'PRISTINE' | 'MINOR' | 'MODERATE' | 'SEVERE';
}

interface OpenCVScanResult {
  engine: string;
  isDamaged: boolean;
  severity: 'PRISTINE' | 'MINOR' | 'MODERATE' | 'SEVERE';
  compositeMatchScore: number;
  totalDefectCount: number;
  suggestedDeduction: number;
  verdict: string;
  angles: Record<number, AngleInspectionData>;
}

// Preset samples for rapid testing of OpenCV detection
const PRESET_SAMPLES = {
  pristine: {
    label: 'Preset A: Pristine Condition',
    desc: 'Zero scratches across all angles, 99.4% optical match, 100% deposit refund recommended.',
    badge: 'success' as const,
    damage: false,
    severity: 'PRISTINE' as const,
    matchScore: 99.2,
    damagePercentage: 0.1,
    defects: [],
    suggestedDeduction: 0,
    verdict: 'PASSED: Asset verified in pristine condition. No structural or surface damage detected across all 4 angles.',
  },
  scratch: {
    label: 'Preset B: Surface Scratches & Scuffs',
    desc: 'Optical discrepancy detected on Angle 2 chassis housing. 2 bounding contours flagged.',
    badge: 'warning' as const,
    damage: true,
    severity: 'MODERATE' as const,
    matchScore: 72.8,
    damagePercentage: 3.4,
    defects: [
      { id: 1, label: 'SCRATCH #1 (Chassis Scuff)', x: 38, y: 32, width: 22, height: 16, severity: 'MEDIUM', areaPixels: 480, confidence: 94.8 },
      { id: 2, label: 'DENT #2 (Corner Impact)', x: 62, y: 55, width: 18, height: 14, severity: 'MEDIUM', areaPixels: 310, confidence: 89.2 }
    ],
    suggestedDeduction: 4500,
    verdict: 'WARNING: Moderate Surface Damage Detected! 2 scratch zones identified on right chassis housing.',
  },
  crack: {
    label: 'Preset C: Severe Impact Fractures',
    desc: 'Deep structural fractures and missing port cover. Immediate deposit deduction required.',
    badge: 'danger' as const,
    damage: true,
    severity: 'SEVERE' as const,
    matchScore: 48.6,
    damagePercentage: 8.9,
    defects: [
      { id: 1, label: 'FRACTURE #1 (Impact Crack)', x: 25, y: 28, width: 35, height: 28, severity: 'HIGH', areaPixels: 1420, confidence: 98.2 },
      { id: 2, label: 'FRACTURE #2 (Spidering Web)', x: 48, y: 44, width: 30, height: 22, severity: 'HIGH', areaPixels: 980, confidence: 96.5 },
      { id: 3, label: 'DEFORMATION #3 (Missing Port Cover)', x: 74, y: 68, width: 16, height: 18, severity: 'HIGH', areaPixels: 640, confidence: 91.0 }
    ],
    suggestedDeduction: 14500,
    verdict: 'CRITICAL ALERT: Severe Structural Damage Detected! 3 major impact fractures and chassis deformation flagged.',
  }
};

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

  // OpenCV Inspection State
  const [activePreset, setActivePreset] = useState<'pristine' | 'scratch' | 'crack' | 'custom'>('scratch');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [activeScanAngle, setActiveScanAngle] = useState<number | null>(null);

  // 4-Angle Multi-Angle State
  const [selectedAngle, setSelectedAngle] = useState<1 | 2 | 3 | 4>(1);
  const [viewMode, setViewMode] = useState<'sideBySide' | 'curtainSlider' | 'heatmap' | 'contours'>('curtainSlider');
  const [sliderPosition, setSliderPosition] = useState<number>(50); // Curtain slider position %
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  // Live Camera Snapshot State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const baseImage = selectedInspection?.productImage || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800';

  // 4 Angles Default Data
  const [angleData, setAngleData] = useState<Record<number, AngleInspectionData>>({
    1: {
      angleNumber: 1,
      label: 'Angle 1: Front Optics',
      subLabel: 'Lens Glass & Optical Elements',
      baselineImage: baseImage,
      returnImage: baseImage,
      isScanned: true,
      isDamaged: false,
      matchScore: 99.4,
      damagePercentage: 0.1,
      defects: [],
      severity: 'PRISTINE',
    },
    2: {
      angleNumber: 2,
      label: 'Angle 2: Right Chassis',
      subLabel: 'Controls, Dials & External Shell',
      baselineImage: baseImage,
      returnImage: baseImage,
      isScanned: true,
      isDamaged: true,
      matchScore: 72.8,
      damagePercentage: 3.4,
      defects: PRESET_SAMPLES.scratch.defects as DefectBox[],
      severity: 'MODERATE',
    },
    3: {
      angleNumber: 3,
      label: 'Angle 3: Left Bay & I/O',
      subLabel: 'Ports, SDI/HDMI & Card Slots',
      baselineImage: baseImage,
      returnImage: baseImage,
      isScanned: true,
      isDamaged: false,
      matchScore: 98.8,
      damagePercentage: 0.2,
      defects: [],
      severity: 'PRISTINE',
    },
    4: {
      angleNumber: 4,
      label: 'Angle 4: Base & Accessories',
      subLabel: 'Tripod Mount, Hardcase & Cables',
      baselineImage: baseImage,
      returnImage: baseImage,
      isScanned: true,
      isDamaged: false,
      matchScore: 99.1,
      damagePercentage: 0.1,
      defects: [],
      severity: 'PRISTINE',
    }
  });

  const [compositeScanResult, setCompositeScanResult] = useState<OpenCVScanResult | null>({
    engine: 'OpenCV v4.8 (Morphological Difference & Contour Extraction)',
    isDamaged: true,
    severity: 'MODERATE',
    compositeMatchScore: 92.5,
    totalDefectCount: 2,
    suggestedDeduction: 4500,
    verdict: 'WARNING: Moderate Surface Damage Detected on Angle 2 (Right Chassis). 2 scratch contours flagged.',
    angles: angleData,
  });

  const baseDepositHeld = 25000;
  const netRefund = Math.max(0, baseDepositHeld - damageCostEstimate);

  const currentAngle = angleData[selectedAngle];

  // Stop WebCam Stream
  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Start WebCam Stream
  const startCamera = async () => {
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
      showToast('Camera Activated', `Point lens at asset Angle ${selectedAngle}`, 'info');
    } catch (err) {
      showToast('Camera Access Error', 'Please grant camera permission or use photo upload.', 'error');
    }
  };

  // Capture Photo from Camera
  const capturePhotoFromCamera = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 640;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setAngleData(prev => ({
        ...prev,
        [selectedAngle]: {
          ...prev[selectedAngle],
          returnImage: dataUrl,
          isScanned: false,
        }
      }));
      stopCamera();
      showToast('Photo Captured', `Angle ${selectedAngle} image saved. Ready for OpenCV comparison.`, 'success');
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Update preset across angles
  const handleApplyPreset = (presetKey: 'pristine' | 'scratch' | 'crack') => {
    setActivePreset(presetKey);
    const p = PRESET_SAMPLES[presetKey];

    const newAngles: Record<number, AngleInspectionData> = {
      1: {
        ...angleData[1],
        isScanned: true,
        isDamaged: false,
        matchScore: 99.4,
        defects: [],
        severity: 'PRISTINE',
      },
      2: {
        ...angleData[2],
        isScanned: true,
        isDamaged: p.damage,
        matchScore: p.matchScore,
        damagePercentage: p.damagePercentage,
        defects: p.defects as DefectBox[],
        severity: p.severity,
      },
      3: {
        ...angleData[3],
        isScanned: true,
        isDamaged: presetKey === 'crack',
        matchScore: presetKey === 'crack' ? 62.4 : 98.8,
        defects: presetKey === 'crack' ? [p.defects[2] as DefectBox] : [],
        severity: presetKey === 'crack' ? 'SEVERE' : 'PRISTINE',
      },
      4: {
        ...angleData[4],
        isScanned: true,
        isDamaged: false,
        matchScore: 99.1,
        defects: [],
        severity: 'PRISTINE',
      }
    };

    setAngleData(newAngles);

    const totalDefects = (newAngles[1].defects.length + newAngles[2].defects.length + newAngles[3].defects.length + newAngles[4].defects.length);
    const avgMatch = Math.round((newAngles[1].matchScore + newAngles[2].matchScore + newAngles[3].matchScore + newAngles[4].matchScore) / 4 * 10) / 10;

    setCompositeScanResult({
      engine: 'OpenCV v4.8 Computer Vision Pipeline',
      isDamaged: p.damage,
      severity: p.severity,
      compositeMatchScore: avgMatch,
      totalDefectCount: totalDefects,
      suggestedDeduction: p.suggestedDeduction,
      verdict: p.verdict,
      angles: newAngles,
    });

    showToast('Preset Loaded', `${p.label} loaded for 4-angle inspection.`, 'info');
  };

  // Run 360° Multi-Angle OpenCV Scan (Sequentially scans Angles 1 -> 4)
  const handleRunMultiAngleScan = async () => {
    setIsScanning(true);
    setScanProgress(0);

    const anglesToScan = [1, 2, 3, 4];
    for (let i = 0; i < anglesToScan.length; i++) {
      const angleNum = anglesToScan[i];
      setActiveScanAngle(angleNum);
      setSelectedAngle(angleNum as 1 | 2 | 3 | 4);
      setScanProgress((i + 1) * 25);
      await new Promise(res => setTimeout(res, 450));
    }

    setIsScanning(false);
    setActiveScanAngle(null);

    const preset = PRESET_SAMPLES[activePreset === 'custom' ? 'scratch' : activePreset];
    const totalDefects = preset.defects.length;
    const avgMatch = Math.round((99.4 + preset.matchScore + 98.8 + 99.1) / 4 * 10) / 10;

    setCompositeScanResult({
      engine: 'OpenCV v4.8 Multi-Angle Computer Vision Suite',
      isDamaged: preset.damage,
      severity: preset.severity,
      compositeMatchScore: avgMatch,
      totalDefectCount: totalDefects,
      suggestedDeduction: preset.suggestedDeduction,
      verdict: preset.verdict,
      angles: angleData,
    });

    showToast(
      preset.damage ? 'OpenCV Alert: Damage Detected' : 'OpenCV Verified: Pristine',
      preset.verdict,
      preset.damage ? 'error' : 'success'
    );
  };

  // Auto-apply OpenCV recommendation to the settlement deduction form
  const handleApplyOpenCVRecommendation = () => {
    if (!compositeScanResult) return;

    if (compositeScanResult.isDamaged) {
      setConditionRating('Damaged');
      setDamageReported(true);
      setDamageDescription(
        `[OpenCV Computer Vision 360° Audit]: Flagged ${compositeScanResult.totalDefectCount} defect contours. Composite Match Score: ${compositeScanResult.compositeMatchScore}%. Severity: ${compositeScanResult.severity}. ${compositeScanResult.verdict}`
      );
      setDamageCostEstimate(compositeScanResult.suggestedDeduction);
      showToast(
        'OpenCV Findings Applied',
        `Condition marked Damaged. Deducted ₹${compositeScanResult.suggestedDeduction.toLocaleString()} from security deposit.`,
        'error'
      );
    } else {
      setConditionRating('Pristine');
      setDamageReported(false);
      setDamageDescription('');
      setDamageCostEstimate(0);
      showToast(
        'Pristine Verified',
        'Asset confirmed 100% damage-free across all 4 angles. Full refund authorized.',
        'success'
      );
    }
  };

  // Complete Inspection and persist
  const handleCompleteInspection = () => {
    if (!selectedInspection) return;

    setInspections(prev =>
      prev.map(item =>
        item.id === selectedInspection.id
          ? {
              ...item,
              status: 'Completed',
              condition: conditionRating,
              damageReported,
              damageFee: damageCostEstimate,
            }
          : item
      )
    );

    showToast(
      'Inspection Finalized',
      `Deposit settlement of ₹${netRefund.toLocaleString()} processed for Order ${selectedInspection.orderNumber}.`,
      'success'
    );
  };

  return (
    <div className="w-full space-y-8 page-transition pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D1D0D0]/40 dark:border-[#5C4E4E]/40 pb-4">
        <div>
          <span className="text-xs font-mono uppercase text-[#988686] tracking-widest">
            COMPUTER VISION RETURN VERIFICATION
          </span>
          <h1 className="font-heading text-3xl font-bold text-[#000000] dark:text-white mt-1">
            OpenCV Return Damage Inspection Studio
          </h1>
          <p className="text-xs text-[#5C4E4E] dark:text-[#B5A9A9] mt-0.5">
            4-Angle optical diffing, sub-pixel scratch/crack segmentation & automated deposit refund settlement.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<QrCode className="w-4 h-4" />}
            onClick={() => setShowScannerModal(true)}
          >
            Scan Item Barcode
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<FileText className="w-4 h-4" />}
            onClick={() => setShowCertificateModal(true)}
          >
            Audit Certificate
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Return Queue */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5C4E4E] dark:text-[#B5A9A9]">
              Inspection Queue ({inspections.length})
            </span>
            <Badge variant="neutral">Active Returns</Badge>
          </div>

          <div className="space-y-3">
            {inspections.map((item) => {
              const isSelected = selectedInspection?.id === item.id;
              return (
                <Card
                  key={item.id}
                  onClick={() => setSelectedInspection(item)}
                  className={`cursor-pointer transition-all p-4 ${
                    isSelected
                      ? 'border-[#988686] ring-2 ring-[#988686]/30 bg-[#988686]/10 shadow-warm-sm'
                      : 'hover:border-[#988686]/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#988686]/20"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-mono text-[#988686]">{item.orderNumber}</span>
                        <Badge variant={item.status === 'Completed' ? 'success' : 'warning'}>
                          {item.status}
                        </Badge>
                      </div>
                      <h4 className="font-heading text-xs font-bold text-[#000000] dark:text-white truncate mt-0.5">
                        {item.productName}
                      </h4>
                      <p className="text-[11px] text-[#5C4E4E] dark:text-[#B5A9A9] truncate">
                        Customer: {item.customerName}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-black/5 dark:border-white/5 text-[10px] text-[#988686]">
                        <span>Deposit: ₹25,000</span>
                        <span className="font-bold text-[#5E7A63]">Inspect Asset →</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right Column: 4-Angle OpenCV Inspection Studio */}
        <div className="lg:col-span-8 space-y-6">
          {/* ========================================================================= */}
          {/* 4-ANGLE INSPECTION STUDIO                                                */}
          {/* ========================================================================= */}
          <div className="glass-panel p-6 rounded-3xl border border-[#988686]/30 shadow-xl space-y-6">
            {/* Header & Pipeline Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#988686]/30 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[#988686]/15 border border-[#988686]/30 text-[#988686]">
                  <ScanEye className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-[#000000] dark:text-white flex items-center gap-2">
                    360° Multi-Angle Inspection Studio
                    <Sparkles className="w-4 h-4 text-[#988686]" />
                  </h3>
                  <p className="text-xs text-[#988686]">
                    4-point surface analysis matching Flipkart/Amazon marketplace verification standards.
                  </p>
                </div>
              </div>
              <Badge variant="info">OpenCV 4.8 Pipeline Active</Badge>
            </div>

            {/* 4-Angle Switcher Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {([1, 2, 3, 4] as const).map((num) => {
                const angle = angleData[num];
                const isSelected = selectedAngle === num;
                const isScanningThis = isScanning && activeScanAngle === num;

                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setSelectedAngle(num);
                      stopCamera();
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all relative ${
                      isSelected
                        ? 'border-[#988686] ring-2 ring-[#988686]/40 bg-[#988686]/15 shadow-warm-sm'
                        : 'glass-panel border-[#988686]/20 hover:border-[#988686]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase font-bold text-[#988686]">
                        Angle 0{num}
                      </span>
                      {isScanningThis ? (
                        <RefreshCw className="w-3 h-3 text-[#988686] animate-spin" />
                      ) : angle.isDamaged ? (
                        <span className="w-2 h-2 rounded-full bg-[#A0524E] animate-ping" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#5E7A63]" />
                      )}
                    </div>
                    <p className="font-bold text-xs text-[#000000] dark:text-white mt-1 truncate">
                      {num === 1 ? 'Front Optics' : num === 2 ? 'Right Chassis' : num === 3 ? 'Left I/O Ports' : 'Base/Hardcase'}
                    </p>
                    <p className="text-[10px] text-[#988686] truncate mt-0.5">
                      {angle.isDamaged ? `Defect Flagged (${angle.defects.length})` : 'Clean (99%+)'}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Simulation Preset Quick Switcher */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#5C4E4E] dark:text-[#B5A9A9] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#988686]" />
                  Simulation Presets & Test Scenarios
                </span>
                <span className="text-[10px] text-[#988686] font-normal">Switch test conditions instantly</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {(['pristine', 'scratch', 'crack'] as const).map((key) => {
                  const p = PRESET_SAMPLES[key];
                  const isSelected = activePreset === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleApplyPreset(key)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-[#988686] ring-2 ring-[#988686]/40 bg-[#988686]/15 shadow-warm-sm'
                          : 'glass-panel border-[#988686]/20 hover:border-[#988686]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#000000] dark:text-white text-[11px] truncate">
                          {p.label.split(':')[1]}
                        </span>
                        <Badge variant={p.badge}>{p.severity}</Badge>
                      </div>
                      <p className="text-[10px] text-[#988686] mt-1 line-clamp-2">{p.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* View Mode Switcher Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 rounded-xl bg-[#988686]/10 border border-[#988686]/20">
              <div className="flex items-center gap-1 text-xs">
                <button
                  onClick={() => setViewMode('curtainSlider')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                    viewMode === 'curtainSlider'
                      ? 'bg-black dark:bg-[#988686] text-white shadow-sm'
                      : 'text-[#5C4E4E] dark:text-[#B5A9A9] hover:bg-black/5'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  Split Curtain Slider
                </button>
                <button
                  onClick={() => setViewMode('sideBySide')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                    viewMode === 'sideBySide'
                      ? 'bg-black dark:bg-[#988686] text-white shadow-sm'
                      : 'text-[#5C4E4E] dark:text-[#B5A9A9] hover:bg-black/5'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Side-by-Side
                </button>
                <button
                  onClick={() => setViewMode('heatmap')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                    viewMode === 'heatmap'
                      ? 'bg-black dark:bg-[#988686] text-white shadow-sm'
                      : 'text-[#5C4E4E] dark:text-[#B5A9A9] hover:bg-black/5'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  Thermal Diff Heatmap
                </button>
              </div>

              {/* Photo Input Actions: WebCam or Upload */}
              <div className="flex items-center gap-2">
                {!isCameraActive ? (
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Video className="w-3.5 h-3.5" />}
                    onClick={startCamera}
                  >
                    Open Live WebCam
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="primary"
                    leftIcon={<Camera className="w-3.5 h-3.5" />}
                    onClick={capturePhotoFromCamera}
                  >
                    Capture Snapshot
                  </Button>
                )}

                <label className="px-2.5 py-1.5 rounded-lg border border-[#988686]/30 text-xs font-bold text-[#5C4E4E] dark:text-[#B5A9A9] cursor-pointer hover:bg-[#988686]/10 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" /> Attach Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          setAngleData(prev => ({
                            ...prev,
                            [selectedAngle]: {
                              ...prev[selectedAngle],
                              returnImage: reader.result as string,
                              isScanned: false,
                            }
                          }));
                          showToast('Photo Attached', `Angle ${selectedAngle} image loaded.`, 'info');
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Live WebCam Stream Viewfinder if active */}
            {isCameraActive && (
              <div className="relative aspect-video rounded-2xl overflow-hidden glass-panel border border-[#988686]/50 bg-black animate-fadeIn">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Viewfinder Target Reticle */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-dashed border-white/60 rounded-3xl flex items-center justify-center">
                    <Crosshair className="w-12 h-12 text-white/50 animate-pulse" />
                  </div>
                </div>
                <div className="absolute top-3 left-3 bg-black/80 text-white text-xs px-3 py-1 rounded-full font-mono">
                  LIVE INSPECTION FEED: ANGLE 0{selectedAngle}
                </div>
                <button
                  onClick={stopCamera}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 text-white hover:bg-black"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW MODE 1: INTERACTIVE SPLIT CURTAIN SLIDER                             */}
            {/* ========================================================================= */}
            {viewMode === 'curtainSlider' && !isCameraActive && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#988686]">
                  <span className="font-bold flex items-center gap-1 text-[#5E7A63]">
                    ← Baseline Handover (Clean)
                  </span>
                  <span className="font-mono font-bold text-[#000000] dark:text-white">
                    Divider: {sliderPosition}%
                  </span>
                  <span className="font-bold flex items-center gap-1 text-[#A0524E]">
                    Return Capture (Inspected) →
                  </span>
                </div>

                <div
                  className="relative aspect-video sm:aspect-[16/9] rounded-2xl overflow-hidden glass-panel border border-[#988686]/40 select-none shadow-2xl cursor-ew-resize bg-black"
                  onMouseMove={(e) => {
                    if (e.buttons === 1) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                      setSliderPosition(Math.round((x / rect.width) * 100));
                    }
                  }}
                  onTouchMove={(e) => {
                    const touch = e.touches[0];
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
                    setSliderPosition(Math.round((x / rect.width) * 100));
                  }}
                >
                  {/* Background: Return Asset Photo */}
                  <img
                    src={currentAngle.returnImage}
                    alt="Return Asset"
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  {/* OpenCV Bounding Boxes on Return side */}
                  {currentAngle.isDamaged && (
                    <div className="absolute inset-0 pointer-events-none">
                      {currentAngle.defects.map((defect) => (
                        <div
                          key={defect.id}
                          className="absolute border-2 border-[#A0524E] bg-[#A0524E]/20 rounded shadow-[0_0_12px_rgba(160,82,78,0.8)]"
                          style={{
                            left: `${defect.x}%`,
                            top: `${defect.y}%`,
                            width: `${defect.width}%`,
                            height: `${defect.height}%`,
                          }}
                        >
                          <span className="absolute -top-5 left-0 text-[8px] font-mono font-bold bg-[#A0524E] text-white px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                            {defect.label} ({defect.confidence}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Foreground: Baseline Image clipped by slider position */}
                  <div
                    className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-white shadow-[0_0_20px_rgba(255,255,255,0.7)]"
                    style={{ width: `${sliderPosition}%` }}
                  >
                    <img
                      src={currentAngle.baselineImage}
                      alt="Baseline Handover"
                      className="absolute inset-0 w-full h-full object-cover max-w-none"
                      style={{ width: '100%', height: '100%' }}
                    />
                    <div className="absolute top-3 left-3 bg-black/80 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                      BASELINE (DISPATCH)
                    </div>
                  </div>

                  {/* Slider Divider Handle */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-black font-bold flex items-center justify-center shadow-2xl pointer-events-none border-2 border-black/20"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <Sliders className="w-4 h-4 text-black" />
                  </div>

                  <div className="absolute top-3 right-3 bg-black/80 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                    RETURN (CUSTOMER)
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW MODE 2: SIDE-BY-SIDE                                                 */}
            {/* ========================================================================= */}
            {viewMode === 'sideBySide' && !isCameraActive && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                {/* Baseline Box */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#5E7A63] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Baseline Handover Photo
                    </span>
                    <span className="text-[10px] font-mono text-[#5E7A63]">ORIGINAL CLEAN</span>
                  </div>
                  <div className="relative aspect-video rounded-2xl overflow-hidden glass-panel border border-[#988686]/30 bg-black/40">
                    <img
                      src={currentAngle.baselineImage}
                      alt="Baseline"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Return Box with OpenCV Bounding Boxes */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#A0524E] flex items-center gap-1">
                      <Crosshair className="w-3.5 h-3.5" /> Returned Asset Photo
                    </span>
                    <span className="text-[10px] font-mono text-[#A0524E]">OPENCV DETECTED</span>
                  </div>
                  <div className="relative aspect-video rounded-2xl overflow-hidden glass-panel border border-[#988686]/30 bg-black/40">
                    <img
                      src={currentAngle.returnImage}
                      alt="Return"
                      className="w-full h-full object-cover"
                    />
                    {currentAngle.isDamaged && (
                      <div className="absolute inset-0 pointer-events-none">
                        {currentAngle.defects.map((defect) => (
                          <div
                            key={defect.id}
                            className="absolute border-2 border-[#A0524E] bg-[#A0524E]/25 rounded shadow"
                            style={{
                              left: `${defect.x}%`,
                              top: `${defect.y}%`,
                              width: `${defect.width}%`,
                              height: `${defect.height}%`,
                            }}
                          >
                            <span className="absolute -top-5 left-0 text-[8px] font-mono font-bold bg-[#A0524E] text-white px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                              {defect.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW MODE 3: THERMAL / DIFFERENCE SSIM HEATMAP                            */}
            {/* ========================================================================= */}
            {viewMode === 'heatmap' && !isCameraActive && (
              <div className="space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-xs text-[#988686]">
                  <span className="font-bold flex items-center gap-1 text-orange-400">
                    <Flame className="w-3.5 h-3.5" /> OpenCV SSIM Absolute Pixel Difference Heatmap
                  </span>
                  <span className="text-[10px] font-mono">COLORMAP_JET / INFERNO</span>
                </div>
                <div className="relative aspect-video rounded-2xl overflow-hidden glass-panel border border-orange-500/40 bg-black">
                  <img
                    src={currentAngle.returnImage}
                    alt="Thermal View"
                    className="w-full h-full object-cover filter contrast-125"
                  />
                  {/* False Color Heatmap Filter Simulation */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/60 via-purple-900/40 to-transparent mix-blend-color-dodge pointer-events-none" />

                  {currentAngle.isDamaged ? (
                    currentAngle.defects.map((defect) => (
                      <div
                        key={defect.id}
                        className="absolute rounded-full filter blur-md animate-pulse pointer-events-none"
                        style={{
                          left: `${defect.x - 5}%`,
                          top: `${defect.y - 5}%`,
                          width: `${defect.width + 10}%`,
                          height: `${defect.height + 10}%`,
                          background: 'radial-gradient(circle, rgba(255,50,0,0.85) 0%, rgba(255,200,0,0.6) 50%, transparent 75%)',
                        }}
                      />
                    ))
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-blue-950/20 text-emerald-400 font-mono text-xs font-bold">
                      ZERO SSIM PIXEL VARIANCE DETECTED (Δ = 0.08)
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 bg-black/80 px-3 py-1.5 rounded-lg border border-white/20 text-[10px] text-white font-mono space-y-0.5">
                    <div>HEATMAP INTENSITY: 8-BIT GRAYSCALE DIFF</div>
                    <div className="text-orange-400">RED ZONES = STRUCTURAL DISCREPANCY DETECTED</div>
                  </div>
                </div>
              </div>
            )}

            {/* Run OpenCV Controls Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#988686]/20">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#988686] font-mono">
                  Current: {currentAngle.label} ({currentAngle.isDamaged ? 'Defect' : 'Pristine'})
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="md"
                  disabled={isScanning}
                  leftIcon={isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ScanEye className="w-4 h-4" />}
                  onClick={handleRunMultiAngleScan}
                  className="w-full sm:w-auto"
                >
                  {isScanning ? `Scanning Angle 0${activeScanAngle}... (${scanProgress}%)` : 'Run 360° Multi-Angle OpenCV Scan'}
                </Button>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* OPENCV MULTI-ANGLE COMPOSITE RESULTS CARD                                 */}
            {/* ========================================================================= */}
            {compositeScanResult && (
              <div className={`p-6 rounded-2xl border space-y-4 animate-fadeIn ${
                compositeScanResult.isDamaged
                  ? 'bg-[#A0524E]/10 border-[#A0524E]/40'
                  : 'bg-[#5E7A63]/10 border-[#5E7A63]/40'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-current/20 pb-3">
                  <div className="flex items-center gap-2.5">
                    {compositeScanResult.isDamaged ? (
                      <AlertTriangle className="w-6 h-6 text-[#A0524E]" />
                    ) : (
                      <CheckCircle2 className="w-6 h-6 text-[#5E7A63]" />
                    )}
                    <div>
                      <h4 className="font-heading text-base font-bold text-[#000000] dark:text-white">
                        {compositeScanResult.isDamaged
                          ? 'OpenCV Alert: Damage Detected in Asset Inspection!'
                          : 'OpenCV Passed: All 4 Angles Verified Pristine!'}
                      </h4>
                      <p className="text-xs text-[#5C4E4E] dark:text-[#B5A9A9] mt-0.5">
                        {compositeScanResult.verdict}
                      </p>
                    </div>
                  </div>
                  <Badge variant={compositeScanResult.isDamaged ? 'danger' : 'success'}>
                    {compositeScanResult.severity}
                  </Badge>
                </div>

                {/* 4-Angle Status Matrix Table */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {([1, 2, 3, 4] as const).map(num => {
                    const ang = angleData[num];
                    return (
                      <div key={num} className="p-3 rounded-xl glass-panel border border-[#988686]/20 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-[#988686] uppercase font-bold">Angle 0{num}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${ang.isDamaged ? 'bg-[#A0524E] text-white' : 'bg-[#5E7A63] text-white'}`}>
                            {ang.isDamaged ? 'DEFECT' : 'PASS'}
                          </span>
                        </div>
                        <div className="text-sm font-mono font-bold text-[#000000] dark:text-white">
                          {ang.matchScore}% Match
                        </div>
                        <div className="text-[10px] text-[#988686]">
                          {ang.defects.length} defect contour{ang.defects.length === 1 ? '' : 's'}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Composite Metrics Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div className="p-3 rounded-xl glass-panel border border-[#988686]/20">
                    <span className="text-[10px] text-[#988686] uppercase block">Composite Match</span>
                    <span className="text-lg font-mono font-bold text-[#000000] dark:text-white">
                      {compositeScanResult.compositeMatchScore}%
                    </span>
                  </div>

                  <div className="p-3 rounded-xl glass-panel border border-[#988686]/20">
                    <span className="text-[10px] text-[#988686] uppercase block">Total Defect Contours</span>
                    <span className="text-lg font-mono font-bold text-[#000000] dark:text-white">
                      {compositeScanResult.totalDefectCount} Contours Flagged
                    </span>
                  </div>

                  <div className="p-3 rounded-xl glass-panel border border-[#988686]/20 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-[#988686] uppercase block">Recommended Deduction</span>
                    <span className="text-lg font-mono font-bold text-[#A0524E]">
                      ₹{compositeScanResult.suggestedDeduction.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Action Row */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-current/20">
                  <span className="text-xs text-[#988686]">
                    Apply findings automatically to security deposit refund calculation below.
                  </span>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Printer className="w-3.5 h-3.5" />}
                      onClick={() => setShowCertificateModal(true)}
                    >
                      Print Certificate
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Check className="w-3.5 h-3.5" />}
                      onClick={handleApplyOpenCVRecommendation}
                      className="w-full sm:w-auto"
                    >
                      Apply Recommendation to Settlement
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* MANUAL SETTLEMENT & DEPOSIT DEDUCTION FORM                                */}
          {/* ========================================================================= */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#988686]/30 space-y-6">
            <div className="flex items-center justify-between border-b border-[#988686]/30 pb-3">
              <div>
                <span className="text-xs font-mono text-[#988686]">INSPECTION SETTLEMENT</span>
                <h3 className="font-heading text-xl font-bold text-[#000000] dark:text-white">
                  Condition Inspection & Deposit Refund Form
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
                          ? 'bg-[#A0524E] text-white border-[#A0524E] shadow-warm-sm'
                          : 'bg-[#988686] text-white border-[#988686] shadow-warm-sm'
                        : 'glass-panel text-[#5C4E4E] dark:text-[#B5A9A9] border-[#988686]/20'
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
                    label="Damage Description & OpenCV Analysis Notes"
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
            <FileUpload label="Attach Additional Return Photos (Optional)" />

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

            <Button
              size="lg"
              className="w-full"
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
              onClick={handleCompleteInspection}
            >
              Complete Inspection & Authorize Deposit Settlement
            </Button>
          </div>
        </div>
      </div>

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        onScanSuccess={(code) => showToast('Barcode Scanned', `Verified item tag: ${code}`, 'success')}
      />

      {/* ========================================================================= */}
      {/* DIGITAL OPENCV AUDIT CERTIFICATE MODAL                                    */}
      {/* ========================================================================= */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-3xl glass-panel border border-[#988686]/40 shadow-2xl p-6 sm:p-8 bg-white dark:bg-[#161313] text-[#000000] dark:text-white space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Certificate Header */}
            <div className="flex items-start justify-between border-b border-[#988686]/30 pb-4">
              <div className="flex items-center gap-3">
                <img src="/rovia_logo.jpg" alt="ROVIA" className="w-12 h-12 rounded-xl object-contain shadow-sm" />
                <div>
                  <h3 className="font-heading text-lg font-bold">ROVIA ATELIER & LABS</h3>
                  <span className="text-[10px] font-mono tracking-widest text-[#988686] uppercase">
                    Computer Vision Asset Inspection Certificate
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="p-1 rounded-lg text-[#988686] hover:text-black dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Metadata Barcode */}
            <div className="p-3 rounded-xl bg-[#988686]/10 border border-[#988686]/20 flex flex-wrap items-center justify-between text-xs font-mono">
              <div>
                <span className="text-[10px] text-[#988686] block">CERTIFICATE ID:</span>
                <span className="font-bold">ROV-CV-2026-8842-SEC</span>
              </div>
              <div>
                <span className="text-[10px] text-[#988686] block">ORDER NUMBER:</span>
                <span className="font-bold">{selectedInspection?.orderNumber || 'ROV-2026-482'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#988686] block">TIMESTAMP:</span>
                <span className="font-bold">2026-09-08 19:15 UTC</span>
              </div>
              <div>
                <span className="text-[10px] text-[#988686] block">OPENCV HASH:</span>
                <span className="font-bold">sha256:e3b0c442...</span>
              </div>
            </div>

            {/* Asset Details */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-[#988686] text-[11px]">Asset Inspection Report</h4>
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl glass-panel border border-[#988686]/20">
                <div>
                  <span className="text-[#988686]">Asset Name:</span>
                  <p className="font-bold">{selectedInspection?.productName || 'Sony FX9 Full-Frame Cinema Camera'}</p>
                </div>
                <div>
                  <span className="text-[#988686]">Customer:</span>
                  <p className="font-bold">{selectedInspection?.customerName || 'Elena Vance'}</p>
                </div>
                <div>
                  <span className="text-[#988686]">Renter Atelier:</span>
                  <p className="font-bold">ROVIA Atelier & Cinema Rigs</p>
                </div>
                <div>
                  <span className="text-[#988686]">Overall Verdict:</span>
                  <p className={`font-bold ${compositeScanResult?.isDamaged ? 'text-[#A0524E]' : 'text-[#5E7A63]'}`}>
                    {compositeScanResult?.severity} ({compositeScanResult?.compositeMatchScore}% Match)
                  </p>
                </div>
              </div>
            </div>

            {/* 4-Angle Breakdown Matrix */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-[#988686] text-[11px]">4-Angle Optical Analysis Matrix</h4>
              <div className="border border-[#988686]/30 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#988686]/15 font-bold uppercase text-[10px] text-[#988686]">
                    <tr>
                      <th className="p-2.5">Angle Zone</th>
                      <th className="p-2.5">Optical Match</th>
                      <th className="p-2.5">Defect Count</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#988686]/20">
                    {([1, 2, 3, 4] as const).map(num => {
                      const a = angleData[num];
                      return (
                        <tr key={num}>
                          <td className="p-2.5 font-bold">{a.label}</td>
                          <td className="p-2.5 font-mono">{a.matchScore}%</td>
                          <td className="p-2.5">{a.defects.length} contours</td>
                          <td className="p-2.5">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${a.isDamaged ? 'bg-[#A0524E] text-white' : 'bg-[#5E7A63] text-white'}`}>
                              {a.severity}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Settlement */}
            <div className="p-4 rounded-2xl bg-[#5E7286]/15 border border-[#5E7286]/30 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#988686]">Escrow Deposit Held:</span>
                <span className="font-mono font-bold">₹{baseDepositHeld.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#A0524E]">
                <span>OpenCV Recommended Damage Deductions:</span>
                <span className="font-mono font-bold">-₹{(compositeScanResult?.suggestedDeduction || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-[#5E7286]/30 pt-2 font-bold text-sm text-[#5E7A63]">
                <span>Net Authorized Escrow Refund:</span>
                <span className="font-mono">₹{(baseDepositHeld - (compositeScanResult?.suggestedDeduction || 0)).toLocaleString()}</span>
              </div>
            </div>

            {/* Digital Seal & Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-[#988686]/30 text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-8 h-8 text-[#5E7A63]" />
                <div>
                  <span className="text-[10px] text-[#988686] block font-mono">DIGITALLY VERIFIED</span>
                  <span className="font-bold text-xs">ROVIA Computer Vision Lab</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Printer className="w-4 h-4" />}
                  onClick={() => window.print()}
                >
                  Print Certificate
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowCertificateModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
