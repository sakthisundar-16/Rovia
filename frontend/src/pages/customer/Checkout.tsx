import React, { useState } from 'react';
import { 
  Truck, 
  Store, 
  CreditCard, 
  ShieldCheck, 
  Download, 
  CalendarPlus, 
  CheckCircle2, 
  MapPin,
  Zap,
  Lock,
  FileText,
  Printer
} from 'lucide-react';
import { Stepper } from '../../components/ui/Stepper';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { InvoicePreviewModal } from '../../components/common/InvoicePreviewModal';
import { generateRoviaPrintableInvoice } from '../../components/common/InteractiveInvoice';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../context/AuthContext';
import { Order } from '../../services/mockData';
import { api } from '../../services/api';
import { openRazorpayCheckout, RAZORPAY_TEST_KEY_ID } from '../../services/razorpayService';

export const Checkout: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [deliveryType, setDeliveryType] = useState<'Ship' | 'Store'>('Ship');
  const [paymentMethod, setPaymentMethod] = useState<'Razorpay' | 'UPI' | 'Card'>('Razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const { items, rentalSubtotal, depositTotal, taxes, grandTotal, clearCart } = useCart();
  const { showToast } = useToast();

  const steps = [
    { id: 1, label: 'Delivery Option', description: 'Address or Store Pickup' },
    { id: 2, label: 'Payment & Deposit', description: 'Authorize rental + deposit' },
    { id: 3, label: 'Confirmation', description: 'Order contract & receipt' },
  ];

  const createAndConfirmOrder = async (razorpayPaymentId?: string) => {
    setIsProcessing(true);
    const newOrderData: Omit<Order, 'id'> = {
      renterId: 'rnt-101',
      renterName: 'ROVIA Atelier & Cinema Rigs',
      orderNumber: 'ROV-2026-' + Math.floor(100 + Math.random() * 900),
      customerName: user?.name || 'Elena Vance',
      customerEmail: user?.email || 'customer@rovia-demo.com',
      customerPhone: '+91 98765 43210',
      customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      productName: items[0]?.name || 'Hasselblad X2D 100C Package',
      productImage: items[0]?.image || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600',
      variant: items[0]?.variant || 'Matte Obsidian',
      rentalWindow: {
        start: items[0]?.startDate || '2026-08-10',
        end: items[0]?.endDate || '2026-08-13',
        days: items[0]?.days || 3,
      },
      rentalFee: rentalSubtotal,
      depositAmount: depositTotal,
      taxAmount: taxes,
      totalAmount: grandTotal,
      status: 'Pending Approval',
      depositStatus: 'Held',
      pickupMethod: deliveryType === 'Ship' ? 'Delivery' : 'Store Pickup',
      razorpayPaymentId: razorpayPaymentId,
      timeline: [
        { 
          stage: 'Order Placed', 
          timestamp: 'Just now', 
          completed: true, 
          notes: razorpayPaymentId 
            ? `Paid via Razorpay (Txn ID: ${razorpayPaymentId})` 
            : 'Payment & Deposit authorized' 
        },
        { stage: 'Renter QR Verification', timestamp: 'Pending', completed: false, notes: 'Awaiting Renter QR approval' },
        { stage: 'Dispatched / Picked Up', timestamp: 'Pending', completed: false },
        { stage: 'In Rental Window', timestamp: 'Pending', completed: false },
        { stage: 'Return & Inspection', timestamp: 'Pending', completed: false },
        { stage: 'Deposit Refunded', timestamp: 'Pending', completed: false }
      ]
    };

    const createdOrder = await api.createOrder(newOrderData);
    setIsProcessing(false);
    setCompletedOrder(createdOrder);
    setCurrentStep(3);
    clearCart();
    showToast(
      'Order Confirmed!', 
      razorpayPaymentId 
        ? `Payment verified (${razorpayPaymentId}). Order ${createdOrder.orderNumber} sent for approval.` 
        : `Order ${createdOrder.orderNumber} sent to Renter for QR scan approval.`, 
      'success'
    );
  };

  const handlePay = () => {
    if (paymentMethod === 'Razorpay') {
      setIsProcessing(true);
      openRazorpayCheckout({
        amountInRupees: grandTotal,
        orderName: `ROVIA Rental - ${items[0]?.name || 'Gear Package'}`,
        description: `Rental fee (₹${rentalSubtotal}) + Refundable Deposit (₹${depositTotal})`,
        prefill: {
          name: user?.name || 'Elena Vance',
          email: user?.email || 'customer@rovia-demo.com',
          contact: '+91 98765 43210',
        },
        notes: {
          rentalSubtotal: `₹${rentalSubtotal}`,
          depositTotal: `₹${depositTotal}`,
          delivery: deliveryType,
        },
        onSuccess: (resp) => {
          createAndConfirmOrder(resp.razorpay_payment_id);
        },
        onDismiss: () => {
          setIsProcessing(false);
          showToast('Payment Pending', 'Razorpay checkout popup was dismissed.', 'info');
        },
        onError: (err) => {
          setIsProcessing(false);
          showToast('Payment Failed', err?.description || 'Razorpay transaction could not be completed.', 'error');
        }
      });
    } else {
      createAndConfirmOrder('manual_' + Math.random().toString(36).substring(7));
    }
  };

  return (
    <div className="w-full space-y-8 page-transition pb-16">
      {/* Stepper Header */}
      <div className="border-b border-[#D1D0D0]/40 dark:border-[#5C4E4E]/40 pb-4">
        <span className="text-xs font-mono uppercase text-[#988686] tracking-widest">SECURE CHECKOUT</span>
        <h1 className="font-heading text-4xl font-bold text-[#000000] dark:text-white mt-1">
          Rental Agreement & Settlement
        </h1>
        <Stepper steps={steps} currentStep={currentStep} />
      </div>

      {/* Step 1: Delivery Option */}
      {currentStep === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
          <div className="lg:col-span-8 space-y-6">
            <h2 className="text-xl font-heading font-bold text-[#000000] dark:text-white">
              Choose Fulfillment Method
            </h2>

            {/* Toggle Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card
                className={`cursor-pointer transition-all ${
                  deliveryType === 'Ship'
                    ? 'border-[#988686] ring-2 ring-[#988686]/30 bg-[#988686]/10'
                    : 'opacity-80 hover:opacity-100'
                }`}
                onClick={() => setDeliveryType('Ship')}
              >
                <div className="flex items-center gap-3">
                  <Truck className="w-6 h-6 text-[#988686]" />
                  <div>
                    <h3 className="font-bold text-sm text-[#000000] dark:text-white">Doorstep Courier Delivery</h3>
                    <p className="text-xs text-[#988686]">Insured dispatch inside pelican flight cases</p>
                  </div>
                </div>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${
                  deliveryType === 'Store'
                    ? 'border-[#988686] ring-2 ring-[#988686]/30 bg-[#988686]/10'
                    : 'opacity-80 hover:opacity-100'
                }`}
                onClick={() => setDeliveryType('Store')}
              >
                <div className="flex items-center gap-3">
                  <Store className="w-6 h-6 text-[#988686]" />
                  <div>
                    <h3 className="font-bold text-sm text-[#000000] dark:text-white">Collect from Store</h3>
                    <p className="text-xs text-[#988686]">Renter Atelier Location (10:00 - 19:00)</p>
                  </div>
                </div>
              </Card>
            </div>

            {deliveryType === 'Ship' ? (
              <div className="glass-panel p-6 rounded-2xl border border-[#988686]/30 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#5C4E4E] dark:text-[#B5A9A9]">
                  Shipping Address
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Street Address" defaultValue="Suite 402, Studio Noir Atelier, Lower Parel" />
                  <Input label="City / State" defaultValue="Mumbai, Maharashtra" />
                  <Input label="PIN Code" defaultValue="400013" />
                  <Input label="Contact Phone" defaultValue="+91 98765 43210" />
                </div>
              </div>
            ) : (
              <div className="glass-panel p-6 rounded-2xl border border-[#988686]/30 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-[#000000] dark:text-white">
                  <MapPin className="w-5 h-5 text-[#988686]" />
                  <span>Renter Store Pickup Location</span>
                </div>
                <p className="text-xs text-[#5C4E4E] dark:text-[#B5A9A9]">
                  Building 7B, Laxmi Industrial Estate, New Link Road, Andheri West, Mumbai.
                </p>
                <span className="text-[11px] text-[#5E7A63] font-bold block">
                  ✓ Ready for pickup on your selected start date from 10:00 AM.
                </span>
              </div>
            )}

            <Button size="lg" className="w-full sm:w-auto" onClick={() => setCurrentStep(2)}>
              Proceed to Payment & Deposit
            </Button>
          </div>

          <div className="lg:col-span-4">
            <Card className="space-y-4">
              <h3 className="font-heading text-lg font-bold text-[#000000] dark:text-white border-b border-[#988686]/30 pb-2">
                Order Items ({items.length})
              </h3>
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#000000] dark:text-white line-clamp-1">{item.name}</span>
                  <span className="font-mono font-bold">₹{(item.dailyRate * item.days).toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t border-[#988686]/30 pt-3 text-xs flex justify-between font-bold">
                <span>Grand Total:</span>
                <span className="font-mono text-sm text-[#988686]">₹{grandTotal.toLocaleString()}</span>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Step 2: Payment & Deposit */}
      {currentStep === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
          <div className="lg:col-span-8 space-y-6">
            <h2 className="text-xl font-heading font-bold text-[#000000] dark:text-white">
              Payment & Security Deposit Authorization
            </h2>

            <div className="p-4 rounded-2xl bg-[#5E7286]/15 border border-[#5E7286]/30 flex items-start gap-4">
              <ShieldCheck className="w-8 h-8 text-[#5E7286] shrink-0 mt-1" />
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-sm text-[#5E7286]">Refundable Security Deposit Protection</h4>
                <p className="text-[#5C4E4E] dark:text-[#B5A9A9] leading-relaxed">
                  Of your total ₹{grandTotal.toLocaleString()} payment, exactly{' '}
                  <strong className="text-[#000000] dark:text-white font-mono">₹{depositTotal.toLocaleString()}</strong> is a refundable security deposit. It is safely held in escrow and returned automatically upon on-time return inspection.
                </p>
              </div>
            </div>

            <div className="space-y-4 glass-panel p-6 rounded-2xl border border-[#988686]/30">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Razorpay')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 relative ${
                    paymentMethod === 'Razorpay'
                      ? 'bg-zinc-950 text-white border-zinc-900 dark:bg-white dark:text-zinc-950 shadow-md ring-2 ring-blue-500/40'
                      : 'glass-panel text-[#5C4E4E] dark:text-[#B5A9A9] hover:border-zinc-400'
                  }`}
                >
                  <span className="absolute -top-2.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-600 text-white shadow-xs">
                    Recommended
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
                    <span>Razorpay Gateway</span>
                  </div>
                  <span className="text-[10px] opacity-75 font-normal">UPI • Cards • NetBanking • QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 ${
                    paymentMethod === 'UPI'
                      ? 'bg-[#988686] text-white border-[#988686]'
                      : 'glass-panel text-[#5C4E4E] dark:text-[#B5A9A9]'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Manual UPI ID</span>
                  </div>
                  <span className="text-[10px] opacity-75 font-normal">Direct VPA Handle</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Card')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 ${
                    paymentMethod === 'Card'
                      ? 'bg-[#988686] text-white border-[#988686]'
                      : 'glass-panel text-[#5C4E4E] dark:text-[#B5A9A9]'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Direct Card</span>
                  </div>
                  <span className="text-[10px] opacity-75 font-normal">Credit / Debit Manual</span>
                </button>
              </div>

              {paymentMethod === 'Razorpay' && (
                <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      Razorpay Checkout Integration (Active)
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-100 dark:bg-blue-900/80 text-blue-800 dark:text-blue-200 font-semibold">
                      Test Mode
                    </span>
                  </div>
                  <p className="text-blue-800/90 dark:text-blue-300 leading-relaxed text-[11px]">
                    Clicking Authorize &amp; Pay will launch the official Razorpay test checkout window supporting instant UPI, credit/debit cards, and netbanking.
                  </p>
                  <div className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 pt-1 border-t border-blue-200/50 dark:border-blue-900/40">
                    API Key: <span className="font-bold text-zinc-800 dark:text-zinc-200">{RAZORPAY_TEST_KEY_ID}</span>
                  </div>
                </div>
              )}

              {paymentMethod === 'UPI' && (
                <div className="space-y-3 pt-2">
                  <Input label="Virtual Payment Address (VPA / UPI ID)" placeholder="elena@okaxis" />
                  <p className="text-[11px] text-[#988686]">A payment collect request will be sent to your UPI app.</p>
                </div>
              )}

              {paymentMethod === 'Card' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <Input label="Cardholder Name" defaultValue="ELENA VANCE" />
                  <Input label="Card Number" defaultValue="4532 •••• •••• 8849" />
                  <Input label="Expiry Date" defaultValue="08/29" />
                  <Input label="CVV" type="password" defaultValue="•••" />
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Back
              </Button>
              <Button size="lg" isLoading={isProcessing} onClick={handlePay}>
                {paymentMethod === 'Razorpay' 
                  ? `Pay ₹${grandTotal.toLocaleString()} with Razorpay` 
                  : `Authorize & Pay ₹${grandTotal.toLocaleString()}`}
              </Button>
            </div>
          </div>

          <div className="lg:col-span-4">
            <Card className="space-y-3 text-xs">
              <h3 className="font-heading text-base font-bold text-[#000000] dark:text-white border-b border-[#988686]/30 pb-2">
                Payment Breakdown
              </h3>
              <div className="flex justify-between">
                <span>Rental Charge:</span>
                <span className="font-mono font-bold">₹{rentalSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (18%):</span>
                <span className="font-mono font-bold">₹{taxes.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#5E7286] font-bold border-t border-[#988686]/30 pt-2">
                <span>Refundable Deposit:</span>
                <span className="font-mono">₹{depositTotal.toLocaleString()}</span>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation Screen */}
      {currentStep === 3 && completedOrder && (
        <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
          {/* Success Banner */}
          <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-[#988686]/40 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#5E7A63]/20 text-[#5E7A63] flex items-center justify-center mx-auto shadow-warm-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-widest text-[#988686] font-bold">
                RENTAL BAILMENT CONFIRMED
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#000000] dark:text-white">
                Payment Authorized &amp; Order Placed!
              </h2>
              <p className="text-sm font-mono text-[#5C4E4E] dark:text-[#D1D0D0]">
                Contract #{completedOrder.orderNumber} • Billed to {completedOrder.customerName}
              </p>
            </div>

            {/* Razorpay Transaction ID Pill */}
            {completedOrder.razorpayPaymentId && (
              <div className="p-3.5 max-w-xl mx-auto rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-emerald-900 dark:text-emerald-200">Razorpay Payment Verified</span>
                </div>
                <span className="font-mono font-bold text-emerald-800 dark:text-emerald-100">
                  {completedOrder.razorpayPaymentId}
                </span>
              </div>
            )}
          </div>

          {/* Official ROVIA Invoice Preview Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#988686]/40 shadow-xl space-y-6">
            {/* Official ROVIA Invoice Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D1D0D0]/40 dark:border-[#5C4E4E]/40 pb-5">
              <div className="flex items-center gap-3">
                <img
                  src="/rovia_logo.jpg"
                  alt="ROVIA"
                  className="w-12 h-12 rounded-xl object-contain shadow-warm-sm border border-[#988686]/30 bg-white p-0.5"
                />
                <div>
                  <h3 className="font-heading text-xl font-bold text-[#000000] dark:text-white">
                    ROVIA ATELIER
                  </h3>
                  <p className="text-[10px] uppercase tracking-widest text-[#988686] font-bold">
                    RENT • USE • RETURN • REUSE
                  </p>
                  <p className="text-[11px] text-[#5C4E4E] dark:text-[#B5A9A9]">
                    GSTIN: 33AAAAA0000A1Z5 • Official Electronic Tax Invoice
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs font-mono font-bold bg-[#988686]/15 text-[#000000] dark:text-white px-3 py-1 rounded-lg">
                  INV-{completedOrder.orderNumber}
                </span>
                <p className="text-xs text-[#5C4E4E] dark:text-[#B5A9A9] mt-1">
                  Status: <strong className="text-emerald-600 dark:text-emerald-400">Payment Settled</strong>
                </p>
              </div>
            </div>

            {/* Two-Column Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#988686]/10 border border-[#988686]/20 space-y-2">
                <span className="font-bold uppercase tracking-wider text-[#988686] text-[10px] block">
                  Rental Package Details
                </span>
                <p className="font-bold text-sm text-[#000000] dark:text-white">{completedOrder.productName}</p>
                <p className="text-[#5C4E4E] dark:text-[#D1D0D0]">Tier / Variant: {completedOrder.variant}</p>
                <p className="text-[#5C4E4E] dark:text-[#D1D0D0]">Fulfillment: {completedOrder.pickupMethod}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#988686]/10 border border-[#988686]/20 space-y-2">
                <span className="font-bold uppercase tracking-wider text-[#988686] text-[10px] block">
                  Rental Window &amp; Escrow
                </span>
                <p className="font-bold text-sm text-[#000000] dark:text-white">
                  {completedOrder.rentalWindow.start} → {completedOrder.rentalWindow.end}
                </p>
                <p className="text-[#5C4E4E] dark:text-[#D1D0D0]">
                  Return Deadline: <strong className="text-[#A0524E]">Before 18:00 (4h Grace Period Included)</strong>
                </p>
                <p className="text-emerald-600 dark:text-emerald-400 font-bold">
                  Deposit Held: ₹{completedOrder.depositAmount.toLocaleString()} (100% Refundable)
                </p>
              </div>
            </div>

            {/* Financial Summary Strip */}
            <div className="p-4 rounded-2xl bg-white/60 dark:bg-black/40 border border-[#988686]/20 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div>
                <span className="text-[#988686]">Rental Fee: </span>
                <strong className="text-[#000000] dark:text-white">₹{completedOrder.rentalFee.toLocaleString()}</strong>
                <span className="text-[#988686] ml-3">Taxes (18% GST): </span>
                <strong className="text-[#000000] dark:text-white">₹{completedOrder.taxAmount.toLocaleString()}</strong>
              </div>
              <div className="text-base font-bold text-[#000000] dark:text-white">
                <span>Grand Total Settled: </span>
                <span className="font-mono text-[#988686]">₹{completedOrder.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Action Buttons: "Generate Invoice", "Print Invoice", "View Timeline" */}
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 pt-2">
              <Button
                variant="primary"
                leftIcon={<FileText className="w-4 h-4" />}
                onClick={() => setShowInvoiceModal(true)}
                className="px-6 py-3 text-sm font-bold shadow-lg fk-btn-press"
              >
                Generate Invoice
              </Button>

              <Button
                variant="outline"
                leftIcon={<Printer className="w-4 h-4" />}
                onClick={() => generateRoviaPrintableInvoice(completedOrder)}
                className="px-5 py-3 text-sm font-bold fk-btn-press"
              >
                Print / Download PDF
              </Button>

              <Button
                variant="outline"
                leftIcon={<CalendarPlus className="w-4 h-4" />}
                onClick={() => onNavigate('my-rentals')}
                className="px-5 py-3 text-sm font-bold fk-btn-press"
              >
                View My Rentals
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      <InvoicePreviewModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        order={completedOrder}
      />
    </div>
  );
};
