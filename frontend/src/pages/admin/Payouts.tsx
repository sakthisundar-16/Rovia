import React, { useState, useEffect } from 'react';
import { DollarSign, Percent, CheckCircle2, Clock, ArrowUpRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DataTable, Column } from '../../components/ui/DataTable';
import { RenterPayout } from '../../services/mockData';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';

export const Payouts: React.FC = () => {
  const [payouts, setPayouts] = useState<RenterPayout[]>([]);
  const { mode, user } = useAuth();
  const { showToast } = useToast();

  const loadPayouts = () => {
    api.getPayouts().then((data) => {
      if (mode === 'renter' && user?.id) {
        setPayouts(data.filter((p) => p.renterId === user.id || p.renterName.includes(user.name) || p.renterName.includes(user.company || '')));
      } else {
        setPayouts(data);
      }
    });
  };

  useEffect(() => {
    loadPayouts();
  }, [mode, user]);

  const handleDisburse = async (id: string, renterName: string, amount: number) => {
    await api.processPayout(id);
    showToast('Payout Settled & Disbursed!', `₹${amount.toLocaleString()} transferred to ${renterName}.`, 'success');
    loadPayouts();
  };

  const columns: Column<RenterPayout>[] = [
    { key: 'period', header: 'Settlement Period' },
    { key: 'renterName', header: 'Renter Vendor' },
    { key: 'grossRentalRevenue', header: 'Gross Revenue', render: (r) => <span className="font-mono font-bold">₹{r.grossRentalRevenue.toLocaleString()}</span> },
    { key: 'platformCommission', header: 'Platform Fee (10%)', render: (r) => <span className="font-mono text-[#5E7286]">₹{r.platformCommission.toLocaleString()}</span> },
    { key: 'netPayout', header: 'Net Payout', render: (r) => <span className="font-mono font-bold text-[#5E7A63]">₹{r.netPayout.toLocaleString()}</span> },
    {
      key: 'status',
      header: 'Payout Status',
      render: (r) => (
        <Badge variant={r.status === 'Paid' ? 'success' : r.status === 'Processing' ? 'warning' : 'neutral'}>
          {r.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        mode === 'admin' && r.status !== 'Paid' ? (
          <Button size="sm" variant="primary" leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />} onClick={() => handleDisburse(r.id, r.renterName, r.netPayout)}>
            Disburse Payout
          </Button>
        ) : (
          <span className="text-[10px] text-[#988686] font-mono">{r.payoutDate}</span>
        )
      ),
    },
  ];

  const totalGross = payouts.reduce((acc, p) => acc + p.grossRentalRevenue, 0);
  const totalCommission = payouts.reduce((acc, p) => acc + p.platformCommission, 0);
  const totalNet = payouts.reduce((acc, p) => acc + p.netPayout, 0);

  return (
    <div className="w-full space-y-8 page-transition pb-16">
      <div className="flex items-center justify-between border-b border-[#5C4E4E]/30 pb-4">
        <div>
          <span className="text-xs font-mono uppercase text-[#988686] tracking-widest">
            {mode === 'admin' ? 'PLATFORM FINANCIAL SETTLEMENTS' : 'RENTER EARNINGS & PAYOUTS'}
          </span>
          <h1 className="font-heading text-3xl font-bold text-[#000000] dark:text-white mt-1">
            {mode === 'admin' ? 'Renter Payouts & Platform Commissions' : 'My Renter Settlements'}
          </h1>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#5E7A63]/20 text-[#5E7A63]">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-[#988686]">Total Gross Revenue</span>
            <h3 className="font-heading text-2xl font-bold text-[#000000] dark:text-white">
              ₹{totalGross.toLocaleString()}
            </h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#5E7286]/20 text-[#5E7286]">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-[#988686]">Platform Commission (10%)</span>
            <h3 className="font-heading text-2xl font-bold text-[#000000] dark:text-white">
              ₹{totalCommission.toLocaleString()}
            </h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#B08A4E]/20 text-[#B08A4E]">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-[#988686]">Net Disbursed Payouts</span>
            <h3 className="font-heading text-2xl font-bold text-[#000000] dark:text-white">
              ₹{totalNet.toLocaleString()}
            </h3>
          </div>
        </Card>
      </div>

      {/* Payouts Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#988686]/30 pb-2">
          <h3 className="font-heading text-xl font-bold text-[#000000] dark:text-white">Settlement Ledger & History</h3>
        </div>
        <DataTable columns={columns} data={payouts} />
      </div>
    </div>
  );
};
