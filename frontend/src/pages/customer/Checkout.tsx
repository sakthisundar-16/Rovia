import React, { useState } from 'react';
import { Truck, Store, CreditCard, ShieldCheck, Download, CalendarPlus, CheckCircle2, MapPin } from 'lucide-react';
import { Stepper } from '../../components/ui/Stepper';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { InvoicePreviewModal } from '../../components/common/InvoicePreviewModal';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../components/ui/Toast';
import { Order } from '../../services/mockData';

export const Checkout: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [deliveryType, setDeliveryType] = useState<'Ship' | 'Store'>('Ship');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card'>('UPI');
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

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const newOrder: Order = {
        id: 'ord-' + Date.now(),
        orderNumber: 'ROV-2026-' + Math.floor(100 + Math.random() * 900),
        customerName: 'Elena Vance',
        customerEmail: 'elena.vance@studio-noir.com',
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
        status: 'Active',
        depositStatus: 'Held',
        pickupMethod: deliveryType === 'Ship' ? 'Delivery' : 'Store Pickup',
        timeline: [
          { stage: 'Order Placed', timestamp: 'Just now', completed: true, notes: 'Payment & Deposit authorized' },
          { stage: 'Quality Inspection', timestamp: 'Pending', completed: false },
          { stage: 'Dispatched / Picked Up', timestamp: 'Pending', completed: false },
          { stage: 'In Rental Window', timestamp: 'Pending', completed: false },
          { stage: 'Return & Inspection', timestamp: 'Pending', completed: false },
          { stage: 'Deposit Refunded', timestamp: 'Pending', completed: false }
        ]
      };

      setCompletedOrder(newOrder);
      setCurrentStep(3);
      clearCart();
      showToast('Order Confirmed!', `Order ${newOrder.orderNumber} successfully booked.`, 'success');
    }, 1500);
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
                    <p className="text-xs text-[#988686]">Mumbai HQ Atelier (10:00 - 19:00)</p>
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
                  <span>ROVIA Mumbai HQ Main Atelier</span>
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

            {/* Deposit Info Callout Banner */}
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

            {/* Payment Method Selector */}
            <div className="space-y-4 glass-panel p-6 rounded-2xl border border-[#988686]/30">
              <div className="flex gap-4">
                <button
                  onClick={() => setPaymentMethod('UPI')}
                  className={`flex-1 p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    paymentMethod === 'UPI'
                      ? 'bg-[#988686] text-white border-[#988686]'
                      : 'glass-panel text-[#5C4E4E] dark:text-[#B5A9A9]'
                  }`}
                >
                  <CreditCard className="w-4 h-4" /> UPI Instant Transfer (GPay / PhonePe)
                </button>
                <button
                  onClick={() => setPaymentMethod('Card')}
                  className={`flex-1 p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    paymentMethod === 'Card'
                      ? 'bg-[#988686] text-white border-[#988686]'
                      : 'glass-panel text-[#5C4E4E] dark:text-[#B5A9A9]'
                  }`}
                >
                  <CreditCard className="w-4 h-4" /> Credit / Debit Card
                </button>
              </div>

              {paymentMethod === 'UPI' ? (
                <div className="space-y-3 pt-2">
                  <Input label="Virtual Payment Address (VPA / UPI ID)" placeholder="elena@okaxis" />
                  <p className="text-[11px] text-[#988686]">A payment collect request will be sent to your UPI app.</p>
                </div>
              ) : (
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
                Authorize & Pay ₹{grandTotal.toLocaleString()}
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
        <div className="max-w-2xl mx-auto glass-panel p-8 sm:p-12 rounded-3xl border border-[#988686]/40 shadow-2xl text-center space-y-6 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-[#5E7A63]/20 text-[#5E7A63] flex items-center justify-center mx-auto shadow-warm-md">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#988686]">RESERVATION AUTHORIZED</span>
            <h2 className="font-heading text-3xl font-bold text-[#000000] dark:text-white">
              Rental Contract Confirmed!
            </h2>
            <p className="text-sm font-mono text-[#988686]">Order #{completedOrder.orderNumber}</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#988686]/10 border border-[#988686]/20 text-xs space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-[#988686]">Product:</span>
              <span className="font-bold text-[#000000] dark:text-white">{completedOrder.productName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#988686]">Return-By Date:</span>
              <span className="font-bold text-[#A0524E] font-mono">{completedOrder.rentalWindow.end} (Before 18:00)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#988686]">Deposit Held:</span>
              <span className="font-bold text-[#5E7286] font-mono">₹{completedOrder.depositAmount.toLocaleString()} (Refundable)</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Button
              variant="outline"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={() => setShowInvoiceModal(true)}
            >
              Download PDF Invoice
            </Button>

            <Button
              variant="primary"
              leftIcon={<CalendarPlus className="w-4 h-4" />}
              onClick={() => onNavigate('my-rentals')}
            >
              View My Rentals Timeline
            </Button>
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
