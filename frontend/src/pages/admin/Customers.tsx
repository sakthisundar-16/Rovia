import React, { useState } from 'react';
import { Users, Mail, Phone, ShoppingBag, ShieldCheck, Eye, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DataTable, Column } from '../../components/ui/DataTable';

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  tier: string;
  totalOrders: number;
  totalSpent: number;
  trustScore: number;
}

export const Customers: React.FC = () => {
  const customers: CustomerRecord[] = [
    {
      id: 'cust-1',
      name: 'Elena Vance',
      email: 'elena.vance@studio-noir.com',
      phone: '+91 98765 43210',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      tier: 'Gothic Noir VIP Member',
      totalOrders: 12,
      totalSpent: 485000,
      trustScore: 98,
    },
    {
      id: 'cust-2',
      name: 'Karan Mehta',
      email: 'karan@mumbai-cinematics.in',
      phone: '+91 98200 44556',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
      tier: 'Standard Member',
      totalOrders: 5,
      totalSpent: 195000,
      trustScore: 82,
    },
    {
      id: 'cust-3',
      name: 'Aarav Sharma',
      email: 'aarav@sharmastudios.com',
      phone: '+91 97111 22334',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
      tier: 'Verified Producer',
      totalOrders: 8,
      totalSpent: 310000,
      trustScore: 95,
    },
  ];

  const columns: Column<CustomerRecord>[] = [
    {
      key: 'name',
      header: 'Customer Profile',
      render: (r) => (
        <div className="flex items-center gap-3">
          <img src={r.avatar} alt={r.name} className="w-9 h-9 rounded-full object-cover" />
          <div>
            <span className="font-bold text-xs text-[#000000] dark:text-white block">{r.name}</span>
            <span className="text-[10px] text-[#988686]">{r.email}</span>
          </div>
        </div>
      ),
    },
    { key: 'tier', header: 'Tier / Status', render: (r) => <Badge variant="neutral">{r.tier}</Badge> },
    { key: 'totalOrders', header: 'Completed Rentals', render: (r) => <span className="font-mono">{r.totalOrders} Rents</span> },
    { key: 'totalSpent', header: 'Lifetime Spend', render: (r) => <span className="font-mono font-bold">₹{r.totalSpent.toLocaleString()}</span> },
    {
      key: 'trustScore',
      header: 'Trust Score',
      render: (r) => (
        <span className={`font-mono font-bold ${r.trustScore >= 90 ? 'text-[#5E7A63]' : 'text-[#B08A4E]'}`}>
          {r.trustScore}/100
        </span>
      ),
    },
  ];

  return (
    <div className="w-full space-y-8 page-transition pb-16">
      <div className="flex items-center justify-between border-b border-[#5C4E4E]/30 pb-4">
        <div>
          <span className="text-xs font-mono uppercase text-[#988686] tracking-widest">CRM & VERIFICATION</span>
          <h1 className="font-heading text-3xl font-bold text-[#000000] dark:text-white mt-1">
            Customer Directory & Trust Score
          </h1>
        </div>
      </div>

      <DataTable columns={columns} data={customers} />
    </div>
  );
};
