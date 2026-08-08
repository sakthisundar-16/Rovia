import React, { useState } from 'react';
import { ArrowLeft, Check, Download, ShieldCheck, Clock, FileText, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { InvoicePreviewModal } from '../../components/common/InvoicePreviewModal';
import { INITIAL_ORDERS, Order } from '../../services/mockData';

interface OrderDetailProps {
  orderId?: string;
  onNavigate: (tab: string) => void;
}

export const OrderDetail: React.FC<OrderDetailProps> = ({ orderId, onNavigate }) => {
  const order = INITIAL_ORDERS.find((o) => o.id === orderId || o.orderNumber === orderId) || INITIAL_ORDERS[0];
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  return (
    <div className="w-full space-y-8 page-transition pb-16">
      {/* Back Button */}
      <button
        onClick={() => onNavigate('my-rentals')}
        className="flex items-center gap-2 text-xs font-semibold text-[#988686] hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to My Rentals
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D1D0D0]/40 dark:border-[#5C4E4E]/40 pb-4">
        <div>
          <span className="text-xs font-mono uppercase text-[#988686] tracking-widest">CONTRACT AUDIT TRAIL</span>
          <h1 className="font-heading text-3xl font-bold text-[#000000] dark:text-white mt-1">
            Order #{order.orderNumber}
          </h1>
        </div>

        <Button variant="outline" leftIcon={<Download className="w-4 h-4" />} onClick={() => setShowInvoiceModal(true)}>
          Download Tax Invoice PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Vertical Stepper Timeline */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="space-y-6">
            <h3 className="font-heading text-lg font-bold text-[#000000] dark:text-white border-b border-[#988686]/30 pb-3">
              Rental Execution Timeline
            </h3>

            <div className="relative pl-6 border-l-2 border-[#988686]/30 space-y-8">
              {order.timeline.map((step, idx) => (
                <div key={idx} className="relative group">
                  <div
                    className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      step.completed
                        ? 'bg-[#5E7A63] text-white'
                        : 'bg-[#988686]/20 text-[#5C4E4E] dark:text-[#B5A9A9]'
                    }`}
                  >
                    {step.completed ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-[#000000] dark:text-white">{step.stage}</h4>
                      <span className="text-[10px] font-mono text-[#988686]">{step.timestamp}</span>
                    </div>
                    {step.notes && <p className="text-xs text-[#5C4E4E] dark:text-[#B5A9A9]">{step.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Deposit Breakdown Card */}
        <div className="lg:col-span-5 space-y-6">
          {/* Deposit Settlement Card */}
          <Card className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#988686]/30 pb-3">
              <ShieldCheck className="w-5 h-5 text-[#5E7286]" />
              <h3 className="font-heading text-lg font-bold text-[#000000] dark:text-white">
                Deposit Audit Breakdown
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#988686]">Security Deposit Paid:</span>
                <span className="font-mono font-bold text-[#000000] dark:text-white">
                  ₹{order.depositAmount.toLocaleString()}
                </span>
              </div>

              {order.deductionAmount ? (
                <div className="flex justify-between text-[#A0524E]">
                  <span>Late Fee Deduction ({order.deductionReason}):</span>
                  <span className="font-mono font-bold">-₹{order.deductionAmount.toLocaleString()}</span>
                </div>
              ) : (
                <div className="flex justify-between text-[#5E7A63]">
                  <span>Damage & Late Deductions:</span>
                  <span className="font-mono font-bold">₹0 (Zero Deduction)</span>
                </div>
              )}

              <div className="flex justify-between border-t border-[#988686]/30 pt-2 font-bold text-sm">
                <span className="text-[#5E7A63]">Refund Amount Settled:</span>
                <span className="font-mono text-[#5E7A63]">
                  ₹{(order.depositAmount - (order.deductionAmount || 0)).toLocaleString()}
                </span>
              </div>
            </div>
          </Card>

          {/* Product Overview Card */}
          <Card className="space-y-3">
            <h3 className="font-heading text-base font-bold text-[#000000] dark:text-white border-b border-[#988686]/30 pb-2">
              Rented Equipment
            </h3>
            <div className="flex items-center gap-4">
              <img src={order.productImage} alt={order.productName} className="w-16 h-16 object-cover rounded-xl" />
              <div>
                <h4 className="font-bold text-sm text-[#000000] dark:text-white">{order.productName}</h4>
                <p className="text-xs text-[#988686]">{order.variant}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <InvoicePreviewModal isOpen={showInvoiceModal} onClose={() => setShowInvoiceModal(false)} order={order} />
    </div>
  );
};
