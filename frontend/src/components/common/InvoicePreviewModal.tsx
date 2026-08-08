import React from 'react';
import { Download, Printer, ShieldCheck } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Order } from '../../services/mockData';

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Invoice #${order.orderNumber}`} maxWidth="xl">
      <div className="flex flex-col gap-6 text-[#000000] dark:text-[#F5F3F3]">
        {/* Invoice Header */}
        <div className="flex items-center justify-between border-b border-[#D1D0D0]/40 dark:border-[#5C4E4E]/40 pb-4">
          <div className="flex items-center gap-3">
            <img src="/rovia_logo.jpg" alt="ROVIA Logo" className="w-10 h-10 object-contain rounded" />
            <div>
              <h2 className="text-xl font-heading font-bold tracking-tight">ROVIA ATELIER</h2>
              <p className="text-[10px] text-[#988686] uppercase tracking-widest">Rent • Use • Return • Reuse</p>
            </div>
          </div>
          <div className="text-right text-xs text-[#5C4E4E] dark:text-[#B5A9A9]">
            <p className="font-semibold text-sm text-[#000000] dark:text-white">Tax Invoice / Contract</p>
            <p>Date: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            <p className="font-mono">GSTIN: 27AAAAA0000A1Z5</p>
          </div>
        </div>

        {/* Customer & Order Metadata */}
        <div className="grid grid-cols-2 gap-4 text-xs p-4 rounded-xl bg-[#988686]/10 border border-[#988686]/20">
          <div>
            <span className="font-semibold uppercase tracking-wider text-[#988686]">Customer Information</span>
            <p className="font-bold text-sm text-[#000000] dark:text-white mt-1">{order.customerName}</p>
            <p>{order.customerEmail}</p>
            <p>{order.customerPhone}</p>
          </div>
          <div>
            <span className="font-semibold uppercase tracking-wider text-[#988686]">Rental Execution Window</span>
            <p className="font-bold text-sm text-[#000000] dark:text-white mt-1">
              {order.rentalWindow.start} → {order.rentalWindow.end}
            </p>
            <p>Duration: {order.rentalWindow.days} Days</p>
            <p>Fulfillment: {order.pickupMethod}</p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#988686]/20 font-semibold uppercase text-[#5C4E4E] dark:text-[#B5A9A9] text-[10px]">
              <tr>
                <th className="p-2.5">Item Description</th>
                <th className="p-2.5 text-center">Duration</th>
                <th className="p-2.5 text-right">Daily Rate</th>
                <th className="p-2.5 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D1D0D0]/30 dark:divide-[#5C4E4E]/30">
              <tr>
                <td className="p-2.5 font-medium">
                  <p className="font-semibold text-sm">{order.productName}</p>
                  <p className="text-[10px] text-[#988686]">{order.variant}</p>
                </td>
                <td className="p-2.5 text-center">{order.rentalWindow.days} Days</td>
                <td className="p-2.5 text-right font-mono">₹{order.rentalFee / order.rentalWindow.days}</td>
                <td className="p-2.5 text-right font-mono font-semibold">₹{order.rentalFee}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Deposit Refundable Notice Box */}
        <div className="p-3.5 rounded-xl bg-[#5E7286]/15 border border-[#5E7286]/30 flex items-center gap-3 text-xs">
          <ShieldCheck className="w-6 h-6 text-[#5E7286] shrink-0" />
          <div>
            <p className="font-bold text-[#5E7286]">Refundable Security Deposit Guarantee</p>
            <p className="text-[11px] text-[#5C4E4E] dark:text-[#B5A9A9]">
              ₹{order.depositAmount.toLocaleString()} security deposit is held securely and fully refunded to original payment source upon on-time return inspection.
            </p>
          </div>
        </div>

        {/* Breakdown Totals */}
        <div className="flex flex-col gap-1 text-xs text-right border-t border-[#D1D0D0]/40 dark:border-[#5C4E4E]/40 pt-3">
          <div className="flex justify-between">
            <span className="text-[#988686]">Rental Subtotal:</span>
            <span className="font-mono">₹{order.rentalFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#988686]">Taxes (18% GST):</span>
            <span className="font-mono">₹{order.taxAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span className="text-[#988686]">Refundable Deposit Held:</span>
            <span className="font-mono text-[#5E7286]">₹{order.depositAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold text-base border-t border-[#D1D0D0]/40 dark:border-[#5C4E4E]/40 pt-2 mt-1">
            <span>Grand Total Paid:</span>
            <span className="font-mono text-[#988686]">₹{order.totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-[#D1D0D0]/40 dark:border-[#5C4E4E]/40 pt-4">
          <Button variant="outline" leftIcon={<Printer className="w-4 h-4" />} onClick={handlePrint}>
            Print Contract
          </Button>
          <Button variant="primary" leftIcon={<Download className="w-4 h-4" />} onClick={onClose}>
            Download PDF Invoice
          </Button>
        </div>
      </div>
    </Modal>
  );
};
