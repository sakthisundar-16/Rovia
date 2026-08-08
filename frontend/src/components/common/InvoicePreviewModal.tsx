import React from 'react';
import { Download, Printer, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Order } from '../../services/mockData';
import { QRCode } from './QRCode';

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

  const generatePrintableDocument = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>ROVIA Tax Invoice - ${order.orderNumber}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #111; max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #111; padding-bottom: 20px; }
            .brand { font-size: 24px; font-weight: bold; letter-spacing: 2px; }
            .tagline { font-size: 10px; color: #666; letter-spacing: 3px; margin-top: 4px; }
            .meta { text-align: right; font-size: 12px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px; }
            th { background: #eee; text-align: left; padding: 10px; text-transform: uppercase; font-size: 10px; }
            td { padding: 12px 10px; border-bottom: 1px solid #eee; }
            .box { background: #eef4f0; border: 1px solid #5E7A63; padding: 15px; border-radius: 8px; font-size: 12px; margin: 20px 0; }
            .totals { font-size: 12px; text-align: right; margin-top: 20px; }
            .total-row { display: flex; justify-content: space-between; padding: 4px 0; }
            .grand-total { font-size: 18px; font-weight: bold; border-top: 2px solid #111; padding-top: 10px; margin-top: 10px; }
            .footer { border-top: 1px solid #ddd; padding-top: 20px; margin-top: 40px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #666; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">ROVIA ATELIER</div>
              <div class="tagline">RENT • USE • RETURN • REUSE</div>
            </div>
            <div class="meta">
              <strong>TAX INVOICE & CONTRACT</strong><br/>
              Invoice #: ${order.orderNumber}<br/>
              Date: ${new Date().toLocaleDateString()}<br/>
              GSTIN: 27AAAAA0000A1Z5
            </div>
          </div>

          <div class="grid">
            <div>
              <strong>CUSTOMER INFORMATION</strong><br/>
              Name: ${order.customerName}<br/>
              Email: ${order.customerEmail}<br/>
              Phone: ${order.customerPhone}
            </div>
            <div>
              <strong>RENTAL EXECUTION WINDOW</strong><br/>
              Period: ${order.rentalWindow.start} to ${order.rentalWindow.end}<br/>
              Duration: ${order.rentalWindow.days} Days<br/>
              Fulfillment: ${order.pickupMethod}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="text-align:center;">Duration</th>
                <th style="text-align:right;">Daily Rate</th>
                <th style="text-align:right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${order.productName}</strong><br/><small style="color:#666;">${order.variant}</small></td>
                <td style="text-align:center;">${order.rentalWindow.days} Days</td>
                <td style="text-align:right;">₹${(order.rentalFee / order.rentalWindow.days).toLocaleString()}</td>
                <td style="text-align:right;">₹${order.rentalFee.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div class="box">
            <strong>🛡️ 100% REFUNDABLE SECURITY DEPOSIT GUARANTEE</strong><br/>
            Security Deposit of ₹${order.depositAmount.toLocaleString()} is held securely and fully refunded to the original payment source upon on-time return inspection.
          </div>

          <div class="totals">
            <div class="total-row"><span>Rental Fee Subtotal:</span> <span>₹${order.rentalFee.toLocaleString()}</span></div>
            <div class="total-row"><span>Taxes (18% GST):</span> <span>₹${order.taxAmount.toLocaleString()}</span></div>
            <div class="total-row" style="color:#5E7286; font-weight:bold;"><span>Refundable Deposit Held:</span> <span>₹${order.depositAmount.toLocaleString()}</span></div>
            <div class="total-row grand-total"><span>Grand Total Paid:</span> <span>₹${order.totalAmount.toLocaleString()}</span></div>
          </div>

          <div class="footer">
            <div>ROVIA Rental Operations Platform • Authorized Electronic Invoice</div>
            <div>Verification Code: ${order.orderNumber}-VERIFIED</div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Tax Invoice #${order.orderNumber}`} maxWidth="xl">
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

          <div className="flex items-center gap-4">
            <QRCode value={`INVOICE:${order.orderNumber}`} size={64} className="hidden sm:block shadow-none p-1 border-0" />
            <div className="text-right text-xs text-[#5C4E4E] dark:text-[#B5A9A9]">
              <p className="font-semibold text-sm text-[#000000] dark:text-white">Tax Invoice / Contract</p>
              <p>Date: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              <p className="font-mono">GSTIN: 27AAAAA0000A1Z5</p>
            </div>
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
                <td className="p-2.5 text-right font-mono">₹{Math.round(order.rentalFee / order.rentalWindow.days).toLocaleString()}</td>
                <td className="p-2.5 text-right font-mono font-semibold">₹{order.rentalFee.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Deposit Refundable Notice Box */}
        <div className="p-3.5 rounded-xl bg-[#5E7286]/15 border border-[#5E7286]/30 flex items-center gap-3 text-xs">
          <ShieldCheck className="w-6 h-6 text-[#5E7286] shrink-0" />
          <div>
            <p className="font-bold text-[#5E7286]">100% Refundable Security Deposit Guarantee</p>
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
          <Button variant="outline" leftIcon={<Printer className="w-4 h-4" />} onClick={generatePrintableDocument}>
            Print Contract
          </Button>
          <Button variant="primary" leftIcon={<Download className="w-4 h-4" />} onClick={generatePrintableDocument}>
            Download PDF Invoice
          </Button>
        </div>
      </div>
    </Modal>
  );
};
