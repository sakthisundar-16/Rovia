import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Eye, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { DataTable, Column } from '../../components/ui/DataTable';
import { INITIAL_DEPOSITS, DepositLedger } from '../../services/mockData';
import { useToast } from '../../components/ui/Toast';

export const Deposits: React.FC = () => {
  const [deposits, setDeposits] = useState<DepositLedger[]>(INITIAL_DEPOSITS);
  const [selectedDeposit, setSelectedDeposit] = useState<DepositLedger | null>(null);
  const { showToast } = useToast();

  const handleRefund = (id: string) => {
    setDeposits((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, status: 'Refunded', refundedAmount: d.collectedAmount, updatedAt: 'Just now' } : d
      )
    );
    showToast('Deposit Refunded', '100% security deposit unlocked via UPI/Bank.', 'success');
  };

  const columns: Column<DepositLedger>[] = [
    { key: 'orderNumber', header: 'Order #', render: (r) => <span className="font-mono font-bold">{r.orderNumber}</span> },
    {
      key: 'customerName',
      header: 'Customer',
      render: (r) => (
        <div className="flex items-center gap-2">
          <img src={r.customerAvatar} alt={r.customerName} className="w-6 h-6 rounded-full object-cover" />
          <span className="font-medium text-xs text-[#000000] dark:text-white">{r.customerName}</span>
        </div>
      ),
    },
    { key: 'collectedAmount', header: 'Deposit Collected', render: (r) => <span className="font-mono font-bold">₹{r.collectedAmount.toLocaleString()}</span> },
    { key: 'status', header: 'Status', render: (r) => <Badge variant={r.status === 'Refunded' ? 'success' : 'info'}>{r.status}</Badge> },
    { key: 'approvedBy', header: 'Approval Trail', render: (r) => <span className="text-xs text-[#988686]">{r.approvedBy}</span> },
    { key: 'updatedAt', header: 'Last Updated', render: (r) => <span className="text-xs font-mono">{r.updatedAt}</span> },
    {
      key: 'actions',
      header: 'Action',
      render: (r) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" leftIcon={<Eye className="w-3.5 h-3.5" />} onClick={() => setSelectedDeposit(r)}>
            Audit Log
          </Button>
          {r.status === 'Held' && (
            <Button size="sm" variant="primary" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={() => handleRefund(r.id)}>
              Refund Now
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="w-full space-y-8 page-transition pb-16">
      <div className="flex items-center justify-between border-b border-[#5C4E4E]/30 pb-4">
        <div>
          <span className="text-xs font-mono uppercase text-[#988686] tracking-widest">ESCROW LEDGER</span>
          <h1 className="font-heading text-3xl font-bold text-[#000000] dark:text-white mt-1">
            Security Deposits Management
          </h1>
        </div>
      </div>

      <DataTable columns={columns} data={deposits} />

      {/* Audit Detail Modal Drawer */}
      <Modal isOpen={!!selectedDeposit} onClose={() => setSelectedDeposit(null)} title={`Deposit Ledger: ${selectedDeposit?.orderNumber}`} maxWidth="md">
        {selectedDeposit && (
          <div className="space-y-4 text-xs text-[#000000] dark:text-white">
            <div className="p-4 rounded-xl bg-[#988686]/10 border border-[#988686]/20 space-y-2">
              <div className="flex justify-between">
                <span>Customer:</span>
                <span className="font-bold">{selectedDeposit.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Collected Amount:</span>
                <span className="font-mono font-bold">₹{selectedDeposit.collectedAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Current Escrow Status:</span>
                <Badge variant={selectedDeposit.status === 'Refunded' ? 'success' : 'info'}>{selectedDeposit.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Approved By:</span>
                <span className="font-mono">{selectedDeposit.approvedBy}</span>
              </div>
            </div>

            <Button className="w-full" onClick={() => setSelectedDeposit(null)}>Close Audit Drawer</Button>
          </div>
        )}
      </Modal>
    </div>
  );
};
