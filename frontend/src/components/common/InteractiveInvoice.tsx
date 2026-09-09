import React, { useState } from 'react';
import {
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  QrCode,
  FileText,
  Copy,
  Check,
  CreditCard,
  AlertCircle,
  HelpCircle,
  Percent,
  Sliders,
  Sparkles
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { QRCode } from './QRCode';
import { Order } from '../../services/mockData';
import { calculateLateFee, getLateFeeRules } from '../../services/lateFeeEngine';

interface InteractiveInvoiceProps {
  order: Order;
  onPrint?: () => void;
  showActions?: boolean;
}

/**
 * Generate publication-grade printable HTML invoice with official ROVIA header
 */
export function generateRoviaPrintableInvoice(order: Order) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const rules = getLateFeeRules();
  const dailyRate = Math.max(1, Math.round(order.rentalFee / (order.rentalWindow.days || 1)));
  const cgst = Math.round(order.taxAmount / 2);
  const sgst = order.taxAmount - cgst;
  const issueDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const issueTime = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>ROVIA Official Tax Invoice - ${order.orderNumber}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 14mm 16mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #111111;
            background: #ffffff;
            margin: 0;
            padding: 0;
            font-size: 12px;
            line-height: 1.45;
          }
          .invoice-card {
            max-width: 820px;
            margin: 0 auto;
            border: 1px solid #D1D0D0;
            border-radius: 12px;
            padding: 28px 32px;
            background: #ffffff;
            position: relative;
          }
          /* Official ROVIA Header */
          .rovia-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #161313;
            padding-bottom: 18px;
            margin-bottom: 20px;
          }
          .brand-left {
            display: flex;
            align-items: center;
            gap: 14px;
          }
          .brand-logo {
            width: 52px;
            height: 52px;
            border-radius: 8px;
            object-fit: cover;
            border: 1px solid #988686;
          }
          .brand-title {
            font-size: 24px;
            font-weight: 800;
            letter-spacing: 1.5px;
            color: #000000;
            margin: 0;
            line-height: 1.1;
          }
          .brand-sub {
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 2.5px;
            color: #5C4E4E;
            text-transform: uppercase;
            margin-top: 3px;
          }
          .brand-address {
            font-size: 10px;
            color: #666;
            margin-top: 4px;
            line-height: 1.3;
          }
          .invoice-meta-right {
            text-align: right;
          }
          .invoice-badge {
            display: inline-block;
            background: #161313;
            color: #ffffff;
            font-weight: 700;
            font-size: 11px;
            letter-spacing: 1px;
            padding: 4px 10px;
            border-radius: 4px;
            text-transform: uppercase;
            margin-bottom: 6px;
          }
          .meta-line {
            font-size: 11px;
            color: #333;
            margin: 2px 0;
          }
          .meta-line strong {
            color: #000;
          }
          /* Two Column Details */
          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            background: #F9F9F9;
            border: 1px solid #E5E5E5;
            border-radius: 8px;
            padding: 14px 18px;
            margin-bottom: 22px;
          }
          .details-col h4 {
            margin: 0 0 6px 0;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            color: #5C4E4E;
            font-weight: 700;
          }
          .details-col p {
            margin: 2px 0;
            font-size: 11px;
            color: #222;
          }
          /* Line Items Table */
          table.items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          table.items-table th {
            background: #F2F0F0;
            color: #222;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 700;
            padding: 10px 12px;
            border-top: 1px solid #D1D0D0;
            border-bottom: 1px solid #D1D0D0;
            text-align: left;
          }
          table.items-table td {
            padding: 12px;
            border-bottom: 1px solid #EEEEEE;
            font-size: 11px;
          }
          .item-name {
            font-weight: 700;
            font-size: 12px;
            color: #000;
          }
          .item-sub {
            font-size: 10px;
            color: #666;
            margin-top: 2px;
          }
          /* Deposit Guarantee Banner */
          .escrow-banner {
            background: #F0F4F1;
            border: 1px solid #5E7A63;
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .escrow-banner strong {
            color: #2C4D32;
            font-size: 11px;
          }
          .escrow-banner p {
            margin: 2px 0 0 0;
            font-size: 10px;
            color: #3B5A41;
          }
          /* Financial Summary */
          .summary-container {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 24px;
          }
          .verification-box {
            border: 1px dashed #988686;
            border-radius: 8px;
            padding: 12px;
            width: 45%;
            background: #FAFAFA;
            display: flex;
            gap: 12px;
            align-items: center;
          }
          .qr-placeholder {
            width: 70px;
            height: 70px;
            background: #ffffff;
            border: 1px solid #111;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: monospace;
            font-size: 9px;
            font-weight: bold;
            text-align: center;
          }
          .verification-text {
            font-size: 10px;
            color: #444;
          }
          .verification-text strong {
            color: #000;
            font-size: 10px;
          }
          .totals-table {
            width: 48%;
            font-size: 11px;
          }
          .total-line {
            display: flex;
            justify-content: space-between;
            padding: 4px 0;
            color: #444;
          }
          .total-line.grand {
            border-top: 2px solid #161313;
            margin-top: 8px;
            padding-top: 8px;
            font-weight: 800;
            font-size: 14px;
            color: #000;
          }
          .total-line.deposit {
            color: #2C4D32;
            font-weight: 700;
          }
          /* Legal Footer */
          .footer-section {
            border-top: 1px solid #E0E0E0;
            padding-top: 14px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 9px;
            color: #666;
          }
          .digital-stamp {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            border: 1px solid #5E7A63;
            background: #F4F7F4;
            color: #2C4D32;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: 700;
            font-size: 9px;
          }
          @media print {
            body { padding: 0; background: none; }
            .invoice-card { border: none; padding: 0; max-width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-card">
          <!-- ROVIA Header -->
          <div class="rovia-header">
            <div class="brand-left">
              <img src="/rovia_logo.jpg" alt="ROVIA" class="brand-logo" onerror="this.style.display='none'" />
              <div>
                <h1 class="brand-title">ROVIA ATELIER</h1>
                <div class="brand-sub">RENT • USE • RETURN • REUSE</div>
                <div class="brand-address">
                  ROVIA Platforms India Pvt. Ltd. • GSTIN: 33AAAAA0000A1Z5<br/>
                  Nadar Saraswathi Tech Quarter, Theni, Tamil Nadu 625531
                </div>
              </div>
            </div>
            <div class="invoice-meta-right">
              <div class="invoice-badge">Tax Invoice &amp; Contract</div>
              <div class="meta-line"><strong>Invoice #:</strong> INV-${order.orderNumber}</div>
              <div class="meta-line"><strong>Date:</strong> ${issueDate} ${issueTime}</div>
              <div class="meta-line"><strong>Order Status:</strong> ${order.status}</div>
              ${order.razorpayPaymentId ? `<div class="meta-line"><strong>Razorpay Txn:</strong> ${order.razorpayPaymentId}</div>` : ''}
            </div>
          </div>

          <!-- Customer & Rental Window Details -->
          <div class="details-grid">
            <div class="details-col">
              <h4>Billed To Customer</h4>
              <p><strong>${order.customerName}</strong></p>
              <p>${order.customerEmail}</p>
              <p>${order.customerPhone}</p>
              <p style="margin-top:4px; font-size:10px; color:#666;">Fulfillment: <strong>${order.pickupMethod}</strong></p>
            </div>
            <div class="details-col">
              <h4>Bailment &amp; Rental Window</h4>
              <p>Start Date: <strong>${order.rentalWindow.start}</strong></p>
              <p>Expected Return: <strong>${order.rentalWindow.end} (Before 18:00)</strong></p>
              <p>Agreed Duration: <strong>${order.rentalWindow.days} Days</strong></p>
              <p style="margin-top:4px; font-size:10px; color:#666;">Lessor: <strong>${order.renterName}</strong></p>
            </div>
          </div>

          <!-- Itemized Table -->
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 45%;">Rental Item Description</th>
                <th style="text-align: center; width: 15%;">Period</th>
                <th style="text-align: right; width: 20%;">Daily Rate</th>
                <th style="text-align: right; width: 20%;">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div class="item-name">${order.productName}</div>
                  <div class="item-sub">Selected Tier / Variant: ${order.variant}</div>
                  <div class="item-sub">Serial Reference: SN-${order.orderNumber}-L4</div>
                </td>
                <td style="text-align: center;">${order.rentalWindow.days} Days</td>
                <td style="text-align: right;">₹${dailyRate.toLocaleString()}</td>
                <td style="text-align: right; font-weight: 700;">₹${order.rentalFee.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <!-- 100% Refundable Deposit Banner -->
          <div class="escrow-banner">
            <div>
              <strong>🛡️ 100% REFUNDABLE SECURITY DEPOSIT ESCROW GUARANTEE</strong>
              <p>
                A refundable deposit of ₹${order.depositAmount.toLocaleString()} is held in trust escrow.
                It is automatically returned in full to your source account upon on-time return inspection by the Renter.
              </p>
            </div>
          </div>

          <!-- Summary & Verification Box -->
          <div class="summary-container">
            <div class="verification-box">
              <div class="qr-placeholder">
                QR CODE<br/>${order.orderNumber}
              </div>
              <div class="verification-text">
                <strong>DIGITAL CONTRACT VERIFICATION PASS</strong><br/>
                Present this QR code to the logistics partner or counter staff upon collection or return inspection.
                Verification Code: <strong>${order.orderNumber}-SECURE</strong>
              </div>
            </div>

            <div class="totals-table">
              <div class="total-line">
                <span>Rental Subtotal:</span>
                <span>₹${order.rentalFee.toLocaleString()}</span>
              </div>
              <div class="total-line">
                <span>Central GST (CGST 9%):</span>
                <span>₹${cgst.toLocaleString()}</span>
              </div>
              <div class="total-line">
                <span>State GST (SGST 9%):</span>
                <span>₹${sgst.toLocaleString()}</span>
              </div>
              <div class="total-line deposit">
                <span>Refundable Deposit Escrow:</span>
                <span>₹${order.depositAmount.toLocaleString()}</span>
              </div>
              <div class="total-line grand">
                <span>Grand Total Settled:</span>
                <span>₹${order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <!-- Legal & Authorized Signature Footer -->
          <div class="footer-section">
            <div>
              ROVIA Authorized Electronic Bailment Agreement • Governed by the laws of India.<br/>
              Support: support@rovia.app • Platform Helplines: 1800-419-ROVIA
            </div>
            <div class="digital-stamp">
              ✓ DIGITALLY AUTHENTICATED
            </div>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

export const InteractiveInvoice: React.FC<InteractiveInvoiceProps> = ({
  order,
  onPrint,
  showActions = true,
}) => {
  const [activeTab, setActiveTab] = useState<'invoice' | 'escrow' | 'simulator'>('invoice');
  const [copied, setCopied] = useState(false);

  // Simulator state for interactive late fee transparency
  const [simulateHoursLate, setSimulateHoursLate] = useState(6);
  const dailyRate = Math.max(1, Math.round(order.rentalFee / (order.rentalWindow.days || 1)));

  // Compute simulated late fee using the centralized lateFeeEngine
  const expectedDate = new Date(order.rentalWindow.end + 'T18:00:00');
  const simulatedReturnDate = new Date(expectedDate.getTime() + simulateHoursLate * 3600 * 1000);
  const simResult = calculateLateFee(expectedDate, simulatedReturnDate, dailyRate, order.depositAmount);

  const cgst = Math.round(order.taxAmount / 2);
  const sgst = order.taxAmount - cgst;

  const handleCopyInvoiceNumber = () => {
    navigator.clipboard.writeText(`INV-${order.orderNumber}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintClick = () => {
    if (onPrint) {
      onPrint();
    } else {
      generateRoviaPrintableInvoice(order);
    }
  };

  return (
    <div className="w-full space-y-6 text-[#000000] dark:text-[#F5F3F3]">
      {/* Official ROVIA Header Container */}
      <div className="rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-white/95 via-white/80 to-[#988686]/10 dark:from-[#161313]/90 dark:via-[#161313]/70 dark:to-[#5C4E4E]/20 border border-[#988686]/30 shadow-lg relative overflow-hidden">
        {/* Subtle decorative background watermark */}
        <div className="absolute -right-8 -bottom-8 opacity-5 dark:opacity-10 pointer-events-none select-none text-9xl font-black font-heading">
          ROVIA
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D1D0D0]/40 dark:border-[#5C4E4E]/40 pb-5">
          <div className="flex items-center gap-3.5">
            <img
              src="/rovia_logo.jpg"
              alt="ROVIA Logo"
              className="w-12 h-12 rounded-xl object-contain shadow-warm-sm border border-[#988686]/40 p-0.5 bg-white"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-[#000000] dark:text-white">
                  ROVIA ATELIER
                </h2>
                <Badge variant="success" className="text-[10px] py-0.5 px-2 font-bold">
                  ✓ VERIFIED TAX INVOICE
                </Badge>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-[#988686] font-bold mt-0.5">
                RENT • USE • RETURN • REUSE
              </p>
              <p className="text-[11px] text-[#5C4E4E] dark:text-[#B5A9A9] mt-0.5 hidden sm:block">
                GSTIN: <span className="font-mono font-semibold">33AAAAA0000A1Z5</span> • Nadar Saraswathi Tech Quarter
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <div className="flex sm:justify-end items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#000000] dark:text-white bg-[#988686]/15 dark:bg-[#988686]/25 px-2.5 py-1 rounded-lg">
                INV-{order.orderNumber}
              </span>
              <button
                onClick={handleCopyInvoiceNumber}
                title="Copy Invoice Number"
                className="p-1 hover:bg-[#988686]/20 rounded transition text-[#988686] hover:text-[#000000] dark:hover:text-white"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-xs text-[#5C4E4E] dark:text-[#B5A9A9]">
              Issued: <strong className="text-[#000000] dark:text-white">{new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
            </p>
            {order.razorpayPaymentId && (
              <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                Razorpay: {order.razorpayPaymentId}
              </p>
            )}
          </div>
        </div>

        {/* Customer & Bailment Window Two-Column Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4">
          <div className="p-3.5 rounded-xl bg-white/70 dark:bg-black/30 border border-[#988686]/20">
            <span className="font-bold uppercase tracking-wider text-[#988686] text-[10px] block mb-1">
              Billed To Customer
            </span>
            <p className="font-bold text-sm text-[#000000] dark:text-white">{order.customerName}</p>
            <p className="text-[#5C4E4E] dark:text-[#D1D0D0]">{order.customerEmail}</p>
            <p className="text-[#5C4E4E] dark:text-[#D1D0D0]">{order.customerPhone}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#5E7A63]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Fulfillment: {order.pickupMethod}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/70 dark:bg-black/30 border border-[#988686]/20">
            <span className="font-bold uppercase tracking-wider text-[#988686] text-[10px] block mb-1">
              Rental Execution Schedule
            </span>
            <div className="flex items-center gap-2 font-bold text-sm text-[#000000] dark:text-white">
              <Calendar className="w-4 h-4 text-[#988686]" />
              <span>{order.rentalWindow.start} → {order.rentalWindow.end}</span>
            </div>
            <p className="text-[#5C4E4E] dark:text-[#D1D0D0] mt-1">
              Duration: <strong>{order.rentalWindow.days} Days</strong> (Return by 18:00)
            </p>
            <p className="text-[#5C4E4E] dark:text-[#D1D0D0]">
              Authorized Renter: <strong>{order.renterName}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Navigation Mode Switcher */}
      <div className="flex border-b border-[#D1D0D0]/40 dark:border-[#5C4E4E]/40 text-xs font-semibold gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('invoice')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition-all border-b-2 font-bold ${
            activeTab === 'invoice'
              ? 'border-[#988686] text-[#000000] dark:text-white bg-[#988686]/10'
              : 'border-transparent text-[#5C4E4E] dark:text-[#B5A9A9] hover:text-[#000000] dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Tax Invoice &amp; Settlement</span>
        </button>

        <button
          onClick={() => setActiveTab('escrow')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition-all border-b-2 font-bold ${
            activeTab === 'escrow'
              ? 'border-[#5E7A63] text-[#5E7A63] bg-[#5E7A63]/10'
              : 'border-transparent text-[#5C4E4E] dark:text-[#B5A9A9] hover:text-[#5E7A63]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Deposit Escrow &amp; QR Pass</span>
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition-all border-b-2 font-bold ${
            activeTab === 'simulator'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10'
              : 'border-transparent text-[#5C4E4E] dark:text-[#B5A9A9] hover:text-indigo-500'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Late Return Policy Simulator</span>
        </button>
      </div>

      {/* Tab 1: Tax Invoice & Settlement Table */}
      {activeTab === 'invoice' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="overflow-x-auto rounded-xl border border-[#D1D0D0]/40 dark:border-[#5C4E4E]/40">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#988686]/15 uppercase font-bold text-[#5C4E4E] dark:text-[#B5A9A9] text-[10px]">
                <tr>
                  <th className="p-3">Rental Item Description</th>
                  <th className="p-3 text-center">Period</th>
                  <th className="p-3 text-right">Daily Rate</th>
                  <th className="p-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D1D0D0]/30 dark:divide-[#5C4E4E]/30 bg-white/40 dark:bg-black/20">
                <tr>
                  <td className="p-3 font-medium">
                    <p className="font-bold text-sm text-[#000000] dark:text-white">{order.productName}</p>
                    <p className="text-[11px] text-[#988686]">Variant: {order.variant}</p>
                    <p className="text-[10px] text-[#5C4E4E] dark:text-[#B5A9A9] font-mono mt-0.5">
                      Serial: SN-{order.orderNumber}-L4
                    </p>
                  </td>
                  <td className="p-3 text-center font-semibold">{order.rentalWindow.days} Days</td>
                  <td className="p-3 text-right font-mono">₹{dailyRate.toLocaleString()}</td>
                  <td className="p-3 text-right font-mono font-bold text-sm">₹{order.rentalFee.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Refundable Deposit Banner */}
          <div className="p-4 rounded-xl bg-[#5E7A63]/10 border border-[#5E7A63]/30 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#5E7A63]/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#5E7A63]" />
              </div>
              <div>
                <p className="font-bold text-sm text-[#5E7A63]">100% Refundable Security Deposit Escrow</p>
                <p className="text-[11px] text-[#5C4E4E] dark:text-[#D1D0D0]">
                  Held in trust and released automatically back to your payment method upon equipment inspection.
                </p>
              </div>
            </div>
            <span className="font-mono font-bold text-base text-[#5E7A63] shrink-0">
              ₹{order.depositAmount.toLocaleString()}
            </span>
          </div>

          {/* Itemized Financial Breakdown */}
          <div className="p-4 rounded-xl bg-[#988686]/10 border border-[#988686]/20 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#5C4E4E] dark:text-[#B5A9A9]">Rental Fee (Excl. Tax):</span>
              <span className="font-mono font-semibold">₹{order.rentalFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5C4E4E] dark:text-[#B5A9A9]">Central GST (CGST @ 9%):</span>
              <span className="font-mono">₹{cgst.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5C4E4E] dark:text-[#B5A9A9]">State GST (SGST @ 9%):</span>
              <span className="font-mono">₹{sgst.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[#5E7A63] font-bold pt-1 border-t border-[#D1D0D0]/30 dark:border-[#5C4E4E]/30">
              <span>Refundable Security Deposit Escrow:</span>
              <span className="font-mono">₹{order.depositAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-[#000000] dark:text-white pt-2 border-t-2 border-[#161313] dark:border-white/30">
              <span>Total Amount Settled:</span>
              <span className="font-mono">₹{order.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Escrow & QR Pass */}
      {activeTab === 'escrow' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-white to-[#988686]/10 dark:from-[#161313] dark:to-[#5C4E4E]/20 border border-[#988686]/30 flex flex-col sm:flex-row items-center gap-6">
            <div className="p-3 bg-white rounded-xl shadow-md border border-[#988686]/30 shrink-0">
              <QRCode value={`ROVIA-CONTRACT:${order.orderNumber}:VERIFIED`} size={130} />
              <p className="text-[10px] font-mono text-center mt-1 text-[#000000] font-bold">
                {order.orderNumber}
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <Badge variant="success" className="text-[10px] font-bold">
                DIGITAL HANDOVER PASS
              </Badge>
              <h4 className="font-heading text-lg font-bold text-[#000000] dark:text-white">
                Verification QR Code for Pickup &amp; Return
              </h4>
              <p className="text-[#5C4E4E] dark:text-[#D1D0D0] leading-relaxed">
                Present this digital QR code to the Renter or logistics agent upon product handover.
                The Renter will scan this QR pass using the ROVIA Staff Scanner to record serial numbers, conduct condition checks, and release your deposit.
              </p>
              <div className="pt-2 flex items-center gap-2 font-mono text-[11px] text-[#5E7A63] font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Verification Hash: {order.orderNumber}-SECURE-AUTH</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-[#988686]/20 bg-[#988686]/5">
              <span className="font-bold text-[#000000] dark:text-white block mb-1">1. Pickup / Handover</span>
              <p className="text-[11px] text-[#5C4E4E] dark:text-[#B5A9A9]">
                Renter scans QR to confirm equipment condition and activates the rental window.
              </p>
            </div>
            <div className="p-3.5 rounded-xl border border-[#988686]/20 bg-[#988686]/5">
              <span className="font-bold text-[#000000] dark:text-white block mb-1">2. Safe Rental Usage</span>
              <p className="text-[11px] text-[#5C4E4E] dark:text-[#B5A9A9]">
                4-hour grace return window included on return day (return before 18:00).
              </p>
            </div>
            <div className="p-3.5 rounded-xl border border-[#988686]/20 bg-[#988686]/5">
              <span className="font-bold text-[#000000] dark:text-white block mb-1">3. Instant Escrow Release</span>
              <p className="text-[11px] text-[#5C4E4E] dark:text-[#B5A9A9]">
                Deposit is instantly unlocked upon completion of return inspection.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Late Return Policy Simulator */}
      {activeTab === 'simulator' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 space-y-4 text-xs">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h4 className="font-heading text-base font-bold text-indigo-950 dark:text-indigo-200">
                  Interactive Late Fee &amp; Deposit Transparency Simulator
                </h4>
                <p className="text-[11px] text-indigo-800 dark:text-indigo-300">
                  Slide the handle below to see how our fair rules engine calculates late fees if unexpected delays happen.
                </p>
              </div>
            </div>

            {/* Slider Control */}
            <div className="space-y-2 bg-white/80 dark:bg-black/40 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900">
              <div className="flex justify-between items-center font-bold">
                <label className="text-xs text-indigo-950 dark:text-indigo-100">
                  Simulate Delay Past Return Window:
                </label>
                <span className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-mono">
                  +{simulateHoursLate} Hours {simulateHoursLate >= 24 ? `(${Math.ceil(simulateHoursLate / 24)} Days)` : ''}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="96"
                step="2"
                value={simulateHoursLate}
                onChange={(e) => setSimulateHoursLate(Number(e.target.value))}
                className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-indigo-800 dark:text-indigo-400 font-mono">
                <span>0h (On Time)</span>
                <span>4h (Grace Period End)</span>
                <span>24h (1 Day)</span>
                <span>48h (2 Days)</span>
                <span>96h (4 Days)</span>
              </div>
            </div>

            {/* Live Calculation Output Card */}
            <div className="p-4 rounded-xl bg-white dark:bg-black/60 border border-indigo-200 dark:border-indigo-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Grace Period Status:</span>
                {simResult.inGracePeriod ? (
                  <Badge variant="success" className="text-[10px] font-bold">
                    ✓ Protected by 4h Free Grace Window (₹0 Fee)
                  </Badge>
                ) : (
                  <Badge variant="warning" className="text-[10px] font-bold">
                    Grace Window Elapsed ({simResult.chargeableHours}h Billable)
                  </Badge>
                )}
              </div>

              {simResult.tiers.map((tier, idx) => (
                <div key={idx} className="flex justify-between text-[11px] text-gray-600 dark:text-gray-400">
                  <span>{tier.name}:</span>
                  <span className="font-mono font-semibold">₹{tier.subtotal.toLocaleString()}</span>
                </div>
              ))}

              <div className="flex justify-between text-[11px] text-gray-600 dark:text-gray-400">
                <span>Held Deposit Protection Cap (100%):</span>
                <span className="font-mono text-emerald-600 font-bold">Max ₹{simResult.maxDepositCap.toLocaleString()}</span>
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center text-sm font-bold">
                <span className="text-indigo-950 dark:text-indigo-200">Simulated Total Late Fee:</span>
                <span className="font-mono text-rose-600 font-bold text-base">
                  ₹{simResult.finalPenalty.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center text-[11px] pt-1 text-emerald-700 dark:text-emerald-400 font-bold">
                <span>Deposit Refunded Back to You:</span>
                <span className="font-mono">
                  ₹{simResult.remainingDeposit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Bar — Buttons strictly use "Generate Invoice", "Print Invoice", "Download PDF" */}
      {showActions && (
        <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-[#D1D0D0]/40 dark:border-[#5C4E4E]/40">
          <Button
            variant="outline"
            leftIcon={<Printer className="w-4 h-4" />}
            onClick={handlePrintClick}
            className="fk-btn-press text-xs font-bold"
          >
            Print Invoice
          </Button>

          <Button
            variant="primary"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handlePrintClick}
            className="fk-btn-press text-xs font-bold"
          >
            Download PDF Invoice
          </Button>
        </div>
      )}
    </div>
  );
};
