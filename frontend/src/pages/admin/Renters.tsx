import React, { useState, useEffect } from 'react';
import { Building, CheckCircle2, XCircle, ShieldAlert, Award, DollarSign, Percent } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DataTable, Column } from '../../components/ui/DataTable';
import { RenterVendor } from '../../services/mockData';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

export const Renters: React.FC = () => {
  const [renters, setRenters] = useState<RenterVendor[]>([]);
  const [platformCommission, setPlatformCommission] = useState(10);
  const { showToast } = useToast();

  const loadRenters = () => {
    api.getRenters().then((data) => setRenters(data));
  };

  useEffect(() => {
    loadRenters();
  }, []);

  const handleApprove = async (id: string, name: string) => {
    await api.approveRenter(id);
    showToast('Renter Verified & Approved!', `${name} is now authorized to list products on the marketplace.`, 'success');
    loadRenters();
  };

  const handleSuspend = async (id: string, name: string) => {
    await api.suspendRenter(id);
    showToast('Renter Suspended', `${name} listings hidden from customer search.`, 'info');
    loadRenters();
  };

  const columns: Column<RenterVendor>[] = [
    {
      key: 'name',
      header: 'Renter Business / Vendor',
      render: (r) => (
        <div className="flex items-center gap-3">
          <img src={r.logo} alt={r.name} className="w-10 h-10 object-cover rounded-xl border border-[#988686]/30" />
          <div>
            <span className="font-bold text-xs text-[#000000] dark:text-white block">{r.name}</span>
            <span className="text-[10px] text-[#988686] font-mono">{r.email} • {r.phone}</span>
          </div>
        </div>
      ),
    },
    { key: 'storeLocation', header: 'Store Location' },
    { key: 'totalProducts', header: 'Listings', render: (r) => <span className="font-mono font-bold">{r.totalProducts} Products</span> },
    { key: 'commissionRate', header: 'Platform Fee', render: (r) => <span className="font-mono text-[#5E7286] font-bold">{r.commissionRate}% Fee</span> },
    {
      key: 'kycStatus',
      header: 'KYC Status',
      render: (r) => (
        <Badge variant={r.kycStatus === 'Approved' ? 'success' : r.kycStatus === 'Pending Approval' ? 'warning' : 'danger'}>
          {r.kycStatus}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Governance Actions',
      render: (r) => (
        <div className="flex items-center gap-2">
          {r.kycStatus === 'Pending Approval' && (
            <Button size="sm" variant="primary" leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />} onClick={() => handleApprove(r.id, r.name)}>
              Approve KYC
            </Button>
          )}
          {r.kycStatus === 'Approved' && (
            <Button size="sm" variant="outline" leftIcon={<XCircle className="w-3.5 h-3.5" />} onClick={() => handleSuspend(r.id, r.name)}>
              Suspend
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
          <span className="text-xs font-mono uppercase text-[#988686] tracking-widest">MARKETPLACE ADMIN GOVERNANCE</span>
          <h1 className="font-heading text-3xl font-bold text-[#000000] dark:text-white mt-1">
            Renter (Seller) Onboarding & Commission Fees
          </h1>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#5E7A63]/20 text-[#5E7A63]">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-[#988686]">Approved Sellers</span>
            <h3 className="font-heading text-2xl font-bold text-[#000000] dark:text-white">
              {renters.filter((r) => r.kycStatus === 'Approved').length}
            </h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#B08A4E]/20 text-[#B08A4E]">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-[#988686]">Pending KYC Approval</span>
            <h3 className="font-heading text-2xl font-bold text-[#000000] dark:text-white">
              {renters.filter((r) => r.kycStatus === 'Pending Approval').length}
            </h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#5E7286]/20 text-[#5E7286]">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-[#988686]">Default Platform Fee</span>
            <h3 className="font-heading text-2xl font-bold text-[#000000] dark:text-white">
              {platformCommission}% Commission
            </h3>
          </div>
        </Card>
      </div>

      {/* Renter Vendors Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#988686]/30 pb-2">
          <h3 className="font-heading text-xl font-bold text-[#000000] dark:text-white">Registered Marketplace Renters</h3>
        </div>
        <DataTable columns={columns} data={renters} />
      </div>
    </div>
  );
};
