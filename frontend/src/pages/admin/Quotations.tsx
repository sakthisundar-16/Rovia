import React, { useState } from 'react';
import { Plus, Send, CheckCircle2, FileText, Download, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DataTable, Column } from '../../components/ui/DataTable';
import { INITIAL_QUOTATIONS, Quotation } from '../../services/mockData';
import { useToast } from '../../components/ui/Toast';

export const Quotations: React.FC = () => {
  const [quotations, setQuotations] = useState<Quotation[]>(INITIAL_QUOTATIONS);
  const [isEditing, setIsEditing] = useState(false);
  const { showToast } = useToast();

  const [customerName, setCustomerName] = useState('Studio Noir Atelier');
  const [customerEmail, setCustomerEmail] = useState('elena.vance@studio-noir.com');
  const [template, setTemplate] = useState<'Standard Letterhead' | 'Gothic Luxury Event' | 'Corporate Film Production'>('Gothic Luxury Event');

  const [lineItems, setLineItems] = useState([
    { description: 'Hasselblad X2D 100C Package (4 Days)', rate: 4500, days: 4, deposit: 25000, total: 18000 },
    { description: 'ARRI Signature Prime 35mm Lens (4 Days)', rate: 6500, days: 4, deposit: 40000, total: 26000 }
  ]);

  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const depositTotal = lineItems.reduce((sum, item) => sum + item.deposit, 0);
  const grandTotal = subtotal + depositTotal;

  const handleConvertToOrder = (q: Quotation) => {
    showToast('Quotation Converted!', `Quote ${q.quoteNumber} converted into Active Rental Order.`, 'success');
  };

  const columns: Column<Quotation>[] = [
    { key: 'quoteNumber', header: 'Quote #', render: (r) => <span className="font-mono font-bold">{r.quoteNumber}</span> },
    { key: 'customerName', header: 'Customer', render: (r) => <span className="font-semibold">{r.customerName}</span> },
    { key: 'template', header: 'Template', render: (r) => <span className="text-xs text-[#988686]">{r.template}</span> },
    { key: 'dateCreated', header: 'Created' },
    { key: 'validUntil', header: 'Valid Until' },
    { key: 'total', header: 'Total Value', render: (r) => <span className="font-mono font-bold">₹{r.total.toLocaleString()}</span> },
    { key: 'status', header: 'Status', render: (r) => <Badge variant={r.status === 'Confirmed' ? 'success' : 'info'}>{r.status}</Badge> },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <Button size="sm" variant="primary" leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />} onClick={() => handleConvertToOrder(r)}>
          Convert to Order
        </Button>
      )
    }
  ];

  return (
    <div className="w-full space-y-8 page-transition pb-16">
      <div className="flex items-center justify-between border-b border-[#5C4E4E]/30 pb-4">
        <div>
          <span className="text-xs font-mono uppercase text-[#988686] tracking-widest">PROPOSAL ENGINE</span>
          <h1 className="font-heading text-3xl font-bold text-[#000000] dark:text-white mt-1">
            Quotations & Estimate Builder
          </h1>
        </div>

        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? 'Back to Quotations List' : 'Create New Quotation'}
        </Button>
      </div>

      {isEditing ? (
        /* Create / Edit Quotation Screen with Live Letterhead Preview Pane */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form (7 cols) */}
          <div className="lg:col-span-7 space-y-6 glass-panel p-6 rounded-2xl border border-[#988686]/30">
            <h2 className="font-heading text-xl font-bold text-[#000000] dark:text-white border-b border-[#988686]/30 pb-2">
              Estimate Parameters
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
              <Input label="Customer Email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-[#5C4E4E] dark:text-[#B5A9A9]">Letterhead Template</label>
              <select
                value={template}
                onChange={(e: any) => setTemplate(e.target.value)}
                className="w-full glass-input rounded p-2 text-xs font-semibold text-[#000000] dark:text-white"
              >
                <option value="Standard Letterhead">Standard Letterhead</option>
                <option value="Gothic Luxury Event">Gothic Luxury Event</option>
                <option value="Corporate Film Production">Corporate Film Production</option>
              </select>
            </div>

            {/* Line Items Builder */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase text-[#988686]">Line Items</h3>
              {lineItems.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#988686]/10 border border-[#988686]/20 flex items-center justify-between text-xs gap-3">
                  <span className="font-semibold flex-1 text-[#000000] dark:text-white">{item.description}</span>
                  <span className="font-mono">₹{item.total.toLocaleString()}</span>
                  <button onClick={() => setLineItems(lineItems.filter((_, i) => i !== idx))} className="text-[#A0524E]">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <Button leftIcon={<Send className="w-4 h-4" />} onClick={() => { showToast('Quote Sent', 'Quotation emailed to customer.', 'success'); setIsEditing(false); }}>
                Send Quotation
              </Button>
            </div>
          </div>

          {/* Right Live Letterhead Preview Pane (5 cols) */}
          <div className="lg:col-span-5">
            <Card className="space-y-6 sticky top-24 border-2 border-[#988686]/40 p-8 bg-white text-black">
              <div className="flex items-center justify-between border-b border-black/20 pb-4">
                <div className="flex items-center gap-3">
                  <img src="/rovia_logo.jpg" alt="Logo" className="w-10 h-10 object-contain rounded" />
                  <div>
                    <h3 className="font-heading text-lg font-bold">ROVIA ATELIER</h3>
                    <p className="text-[9px] uppercase font-mono tracking-widest text-[#988686]">RENT • USE • RETURN • REUSE</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold">ESTIMATE Q-2026-045</span>
              </div>

              <div className="text-xs space-y-1">
                <p><strong>Prepared for:</strong> {customerName}</p>
                <p><strong>Email:</strong> {customerEmail}</p>
                <p><strong>Template Style:</strong> {template}</p>
              </div>

              <div className="border-t border-b border-black/20 py-4 space-y-2 text-xs">
                {lineItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{item.description}</span>
                    <span className="font-mono font-bold">₹{item.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="text-right text-xs space-y-1 font-mono">
                <p>Rental Subtotal: ₹{subtotal.toLocaleString()}</p>
                <p className="text-[#5E7286]">Refundable Deposit: ₹{depositTotal.toLocaleString()}</p>
                <p className="text-base font-bold">Total Estimate: ₹{grandTotal.toLocaleString()}</p>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <DataTable columns={columns} data={quotations} />
      )}
    </div>
  );
};
