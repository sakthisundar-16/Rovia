import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  Building2,
  ChevronDown,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  X,
  Eye,
  Check
} from 'lucide-react';
import { useAuth, Role } from '../../context/AuthContext';
import { BarcodeScannerModal } from '../common/BarcodeScannerModal';
import { api } from '../../services/api';
import { Order, INITIAL_INSPECTIONS } from '../../services/mockData';

interface AdminTopbarProps {
  title?: string;
  mode: Role;
  onNavigate: (tab: string) => void;
}

interface NotificationItem {
  id: string;
  type: 'order' | 'inspection' | 'system';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  actionText: string;
  actionTab?: string;
  orderId?: string;
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({ title = 'Operations Dashboard', mode, onNavigate }) => {
  const { user } = useAuth();
  const [branch, setBranch] = useState('Mumbai HQ Main Atelier');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [filterTab, setFilterTab] = useState<'all' | 'orders' | 'inspection'>('all');

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      type: 'order',
      title: 'New Rental Request Received',
      description: 'Elena Vance submitted request for Sony FX9 Cinema Camera (₹13,500).',
      timestamp: '2 mins ago',
      read: false,
      actionText: 'Scan QR & Approve',
      actionTab: 'orders',
    },
    {
      id: 'notif-2',
      type: 'inspection',
      title: 'OpenCV Return Scan Flagged Defects',
      description: 'Hasselblad X2D return scan identified 2 surface scratches on casing.',
      timestamp: '14 mins ago',
      read: false,
      actionText: 'Review OpenCV Findings',
      actionTab: 'pickup-return',
    },
    {
      id: 'notif-3',
      type: 'inspection',
      title: 'Asset Returned — Inspection Pending',
      description: 'RED V-Raptor 8K returned by Arjun Mehta. Ready for OpenCV inspection.',
      timestamp: '1 hr ago',
      read: false,
      actionText: 'Start Inspection',
      actionTab: 'pickup-return',
    },
    {
      id: 'notif-4',
      type: 'system',
      title: 'Escrow Deposit Refund Released',
      description: '₹25,000 security deposit refunded to Vikram Roy after pristine inspection.',
      timestamp: '2 hrs ago',
      read: true,
      actionText: 'View Settlement',
      actionTab: 'deposits',
    }
  ]);

  useEffect(() => {
    // Fetch any real pending orders from API to sync with notifications
    api.getOrders().then(allOrders => {
      const pending = allOrders.filter(
        o => o.status === 'Pending Approval' && (mode === 'admin' || o.renterId === user?.id)
      );
      if (pending.length > 0) {
        const orderNotifs: NotificationItem[] = pending.map(o => ({
          id: `order-notif-${o.id}`,
          type: 'order',
          title: `Pending Request: ${o.orderNumber}`,
          description: `${o.customerName} requested ${o.productName}. Tap to verify QR and dispatch.`,
          timestamp: 'Live',
          read: false,
          actionText: 'Verify QR',
          actionTab: 'orders',
          orderId: o.id,
        }));

        setNotifications(prev => {
          const existingIds = new Set(prev.map(n => n.id));
          const newOnes = orderNotifs.filter(n => !existingIds.has(n.id));
          return [...newOnes, ...prev];
        });
      }
    });
  }, [user, mode]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markSingleRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleNotificationAction = (item: NotificationItem) => {
    markSingleRead(item.id);
    setNotificationsOpen(false);
    if (item.actionText.includes('QR')) {
      setShowQrModal(true);
    } else if (item.actionTab) {
      onNavigate(item.actionTab);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filterTab === 'orders') return n.type === 'order';
    if (filterTab === 'inspection') return n.type === 'inspection';
    return true;
  });

  const roleLabel = mode === 'admin' ? 'Platform Admin' : 'Renter Ops Manager';

  return (
    <header className="h-20 sticky top-0 z-30 glass-nav border-b border-[#5C4E4E]/20 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Title & Global Search */}
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-lg sm:text-xl font-heading font-bold text-[#000000] dark:text-white tracking-tight">
            {title}
          </h1>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#988686]">
            {mode === 'admin' ? 'Platform Admin Console' : 'Renter Operations Console'}
          </span>
        </div>

        <div className="relative hidden xl:flex items-center w-64">
          <Search className="absolute left-3 w-4 h-4 text-[#988686]" />
          <input
            type="text"
            placeholder="Search orders, SKUs..."
            className="w-full glass-input rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#000000] dark:text-white placeholder-[#988686]"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick QR Scanner Button */}
        <button
          onClick={() => setShowQrModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#000000] dark:bg-[#988686] text-white text-xs font-bold shadow-warm-sm hover:opacity-90 transition-all"
          title="Scan Customer QR Code to Approve Rental"
        >
          <QrCode className="w-4 h-4" />
          <span className="hidden sm:inline">Scan Customer QR</span>
        </button>

        {/* Branch Switcher */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-panel text-xs text-[#000000] dark:text-white border border-[#988686]/30">
          <Building2 className="w-3.5 h-3.5 text-[#988686]" />
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="bg-transparent focus:outline-none cursor-pointer font-medium text-xs dark:bg-[#161313]"
          >
            <option value="Mumbai HQ Main Atelier">Mumbai HQ Main Atelier</option>
            <option value="Delhi Atelier Branch">Delhi Atelier Branch</option>
            <option value="Bengaluru Logistics Hub">Bengaluru Logistics Hub</option>
          </select>
        </div>

        {/* High-Visibility Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className={`relative p-2.5 rounded-xl border transition-all flex items-center justify-center ${
              unreadCount > 0
                ? 'bg-[#A0524E]/10 border-[#A0524E]/40 text-[#A0524E] shadow-sm'
                : 'glass-panel border-[#988686]/30 text-[#988686] hover:bg-[#988686]/10'
            }`}
            aria-label="Notifications"
          >
            <Bell className={`w-4 h-4 ${unreadCount > 0 ? 'animate-bounce' : ''}`} />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 rounded-full bg-[#A0524E] text-white text-[10px] font-black font-mono flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-[#161313]">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Modal */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel rounded-2xl border border-[#988686]/40 shadow-2xl p-4 z-50 text-xs animate-fadeIn bg-white/95 dark:bg-[#161313]/95 backdrop-blur-xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#5C4E4E]/20 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-bold text-sm text-[#000000] dark:text-white uppercase tracking-wider">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[#A0524E] text-white text-[10px] font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] text-[#988686] hover:text-[#000000] dark:hover:text-white font-medium flex items-center gap-1 transition-colors"
                  >
                    <Check className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-1 mb-3 p-1 rounded-lg bg-[#988686]/10 text-[11px]">
                <button
                  onClick={() => setFilterTab('all')}
                  className={`flex-1 py-1 rounded font-bold transition-all ${
                    filterTab === 'all'
                      ? 'bg-black dark:bg-[#988686] text-white shadow-sm'
                      : 'text-[#5C4E4E] dark:text-[#B5A9A9]'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setFilterTab('orders')}
                  className={`flex-1 py-1 rounded font-bold transition-all ${
                    filterTab === 'orders'
                      ? 'bg-black dark:bg-[#988686] text-white shadow-sm'
                      : 'text-[#5C4E4E] dark:text-[#B5A9A9]'
                  }`}
                >
                  Orders
                </button>
                <button
                  onClick={() => setFilterTab('inspection')}
                  className={`flex-1 py-1 rounded font-bold transition-all ${
                    filterTab === 'inspection'
                      ? 'bg-black dark:bg-[#988686] text-white shadow-sm'
                      : 'text-[#5C4E4E] dark:text-[#B5A9A9]'
                  }`}
                >
                  OpenCV ({notifications.filter(n => n.type === 'inspection').length})
                </button>
              </div>

              {/* List */}
              <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1">
                {filteredNotifications.length === 0 ? (
                  <p className="text-center text-[#988686] py-6 text-xs">No notifications in this category.</p>
                ) : (
                  filteredNotifications.map(item => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border transition-all relative ${
                        item.read
                          ? 'bg-[#988686]/5 border-[#988686]/20 opacity-70'
                          : item.type === 'inspection'
                          ? 'bg-[#A0524E]/10 border-[#A0524E]/30 shadow-warm-sm'
                          : 'bg-[#5E7A63]/10 border-[#5E7A63]/30 shadow-warm-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {item.type === 'inspection' ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-[#A0524E] shrink-0" />
                          ) : item.type === 'order' ? (
                            <QrCode className="w-3.5 h-3.5 text-[#5E7A63] shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#5E7286] shrink-0" />
                          )}
                          <span className="font-bold text-[#000000] dark:text-white text-xs">
                            {item.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#988686] shrink-0 font-mono">
                          {item.timestamp}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#5C4E4E] dark:text-[#B5A9A9] mt-1 leading-snug">
                        {item.description}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-black/5 dark:border-white/5">
                        <button
                          onClick={() => handleNotificationAction(item)}
                          className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all ${
                            item.type === 'inspection'
                              ? 'bg-[#A0524E] text-white hover:bg-[#85423f]'
                              : 'bg-[#000000] dark:bg-[#988686] text-white hover:opacity-90'
                          }`}
                        >
                          {item.actionText} →
                        </button>
                        {!item.read && (
                          <button
                            onClick={() => markSingleRead(item.id)}
                            className="text-[10px] text-[#988686] hover:underline"
                          >
                            Dismiss
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <button
          onClick={() => onNavigate('profile')}
          className="flex items-center gap-2 pl-2 border-l border-[#5C4E4E]/20 text-left hover:bg-[#988686]/10 rounded-lg py-1 px-1 transition-colors"
          title="View My Profile"
        >
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400'}
            alt="Profile Avatar"
            className="w-8 h-8 rounded-full object-cover border border-[#988686]/50"
          />
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-bold text-[#000000] dark:text-white leading-tight">{user?.name}</span>
            <span className="text-[10px] text-[#988686] font-medium flex items-center gap-1">
              {roleLabel}
              <ChevronDown className="w-3 h-3" />
            </span>
          </div>
        </button>
      </div>

      <BarcodeScannerModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        onScanSuccess={() => onNavigate('orders')}
      />
    </header>
  );
};
