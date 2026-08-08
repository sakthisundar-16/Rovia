import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, ShieldCheck, Scale } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DataTable, Column } from '../../components/ui/DataTable';
import { MarketplaceDispute } from '../../services/mockData';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

export const Disputes: React.FC = () => {
  const [disputes, setDisputes] = useState<MarketplaceDispute[]>([]);
  const { showToast } = useToast();

  const loadDisputes = () => {
    api.getDisputes().then((data) => setDisputes(data));
  };

  useEffect(() => {
    loadDisputes();
  }, []);

  const handleResolve = async (id: string, orderNumber: string) => {
    await api.resolveDispute(id);
    showToast('Dispute Arbitrated & Resolved!', `Admin arbitration completed for order #${orderNumber}.`, 'success');
    loadDisputes();
  };

  const columns: Column<MarketplaceDispute>[] = [
    { key: 'orderNumber', header: 'Order Number', render: (r) => <span className="font-mono font-bold text-[#000000] dark:text-white">#{r.orderNumber}</span> },
    { key: 'customerName', header: 'Customer (Buyer)' },
    { key: 'renterName', header: 'Renter (Seller)' },
    { key: 'issueType', header: 'Dispute Reason', render: (r) => <span className="font-semibold text-[#A0524E]">{r.issueType}</span> },
    { key: 'claimedAmount', header: 'Disputed Deposit', render: (r) => <span className="font-mono font-bold">₹{r.claimedAmount.toLocaleString()}</span> },
    {
      key: 'status',
      header: 'Dispute Status',
      render: (r) => (
        <Badge variant={r.status === 'Resolved' ? 'success' : 'warning'}>
          {r.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Arbitration Action',
      render: (r) => (
        r.status !== 'Resolved' ? (
          <Button size="sm" variant="primary" leftIcon={<Scale className="w-3.5 h-3.5" />} onClick={() => handleResolve(r.id, r.orderNumber)}>
            Resolve Dispute
          </Button>
        ) : (
          <span className="text-xs text-[#5E7A63] font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
          </span>
        )
      ),
    },
  ];

  return (
    <div className="w-full space-y-8 page-transition pb-16">
      <div className="flex items-center justify-between border-b border-[#5C4E4E]/30 pb-4">
        <div>
          <span className="text-xs font-mono uppercase text-[#988686] tracking-widest">MARKETPLACE ADMIN GOVERNANCE</span>
          <h1 className="font-heading text-3xl font-bold text-[#000000] dark:text-white mt-1">
            Dispute Arbitration & Damage Claims
          </h1>
        </div>
      </div>

      <Card className="p-6 space-y-4">
        <h3 className="font-heading text-xl font-bold text-[#000000] dark:text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[#A0524E]" />
          Platform Dispute Governance Protocol
        </h3>
        <p className="text-xs text-[#5C4E4E] dark:text-[#B5A9A9] leading-relaxed">
          As the platform owner, ROVIA Admin arbitrates all security deposit deductions, late penalty appeals, and damage claims submitted by Renters or Customers to ensure fair marketplace resolution.
        </p>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#988686]/30 pb-2">
          <h3 className="font-heading text-xl font-bold text-[#000000] dark:text-white">Active & Past Dispute Claims</h3>
        </div>
        <DataTable columns={columns} data={disputes} />
      </div>
    </div>
  );
};
