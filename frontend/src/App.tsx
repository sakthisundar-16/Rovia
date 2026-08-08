import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';

import { CustomerHeader } from './components/layout/CustomerHeader';
import { CustomerFooter } from './components/layout/CustomerFooter';
import { AdminSidebar } from './components/layout/AdminSidebar';
import { AdminTopbar } from './components/layout/AdminTopbar';

// Customer Pages
import { Splash } from './pages/customer/Splash';
import { Landing } from './pages/customer/Landing';
import { Auth } from './pages/customer/Auth';
import { Catalog } from './pages/customer/Catalog';
import { ProductDetail } from './pages/customer/ProductDetail';
import { Cart } from './pages/customer/Cart';
import { Checkout } from './pages/customer/Checkout';
import { MyRentals } from './pages/customer/MyRentals';
import { OrderDetail } from './pages/customer/OrderDetail';
import { Profile } from './pages/customer/Profile';
import { ReturnFlow } from './pages/customer/ReturnFlow';

// Admin Pages
import { Dashboard } from './pages/admin/Dashboard';
import { Quotations } from './pages/admin/Quotations';
import { Orders } from './pages/admin/Orders';
import { PickupReturn } from './pages/admin/PickupReturn';
import { Deposits } from './pages/admin/Deposits';
import { LateFees } from './pages/admin/LateFees';
import { Products } from './pages/admin/Products';
import { Customers } from './pages/admin/Customers';
import { Reports } from './pages/admin/Reports';
import { Settings } from './pages/admin/Settings';

const MainAppContent: React.FC = () => {
  const { mode } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [customerTab, setCustomerTab] = useState('landing');
  const [adminTab, setAdminTab] = useState('dashboard');

  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(undefined);
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>(undefined);

  const handleCustomerNavigate = (tab: string, id?: string) => {
    setCustomerTab(tab);
    if (id) {
      if (tab === 'product-detail') setSelectedProductId(id);
      if (tab === 'order-detail') setSelectedOrderId(id);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminNavigate = (tab: string, id?: string) => {
    setAdminTab(tab);
    if (id) setSelectedOrderId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (showSplash) {
    return <Splash onFinish={() => setShowSplash(false)} />;
  }

  if (mode === 'admin') {
    return (
      <div className="min-h-screen flex bg-[#0D0B0B] text-[#F5F3F3] antialiased">
        <AdminSidebar currentTab={adminTab} onNavigate={handleAdminNavigate} />
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <AdminTopbar title={adminTab.toUpperCase().replace('-', ' ')} />
          <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
            {adminTab === 'dashboard' && <Dashboard onNavigate={handleAdminNavigate} />}
            {adminTab === 'quotations' && <Quotations />}
            {adminTab === 'orders' && <Orders selectedOrderId={selectedOrderId} />}
            {adminTab === 'pickup-return' && <PickupReturn />}
            {adminTab === 'deposits' && <Deposits />}
            {adminTab === 'late-fees' && <LateFees />}
            {adminTab === 'products' && <Products />}
            {adminTab === 'customers' && <Customers />}
            {adminTab === 'reports' && <Reports />}
            {adminTab === 'settings' && <Settings />}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between transition-colors duration-300">
      <CustomerHeader currentTab={customerTab} onNavigate={handleCustomerNavigate} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {customerTab === 'landing' && <Landing onNavigate={handleCustomerNavigate} />}
        {customerTab === 'auth' && <Auth onSuccess={() => handleCustomerNavigate('catalog')} />}
        {customerTab === 'catalog' && <Catalog onNavigate={handleCustomerNavigate} />}
        {customerTab === 'product-detail' && (
          <ProductDetail productId={selectedProductId} onNavigate={handleCustomerNavigate} />
        )}
        {customerTab === 'cart' && <Cart onNavigate={handleCustomerNavigate} />}
        {customerTab === 'checkout' && <Checkout onNavigate={handleCustomerNavigate} />}
        {customerTab === 'my-rentals' && <MyRentals onNavigate={handleCustomerNavigate} />}
        {customerTab === 'order-detail' && (
          <OrderDetail orderId={selectedOrderId} onNavigate={handleCustomerNavigate} />
        )}
        {customerTab === 'profile' && <Profile />}
        {customerTab === 'return-flow' && <ReturnFlow onNavigate={handleCustomerNavigate} />}
      </main>
      <CustomerFooter />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <MainAppContent />
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
