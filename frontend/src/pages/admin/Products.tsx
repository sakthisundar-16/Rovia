import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Edit,
  Tag,
  Layers,
  Search,
  CheckCircle2,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  Save,
  X,
  Camera,
  Sparkles,
  Zap,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  ShieldCheck,
  Eye,
  Star,
  Sliders,
  Check
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { FileUpload } from '../../components/ui/FileUpload';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Product } from '../../services/mockData';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&q=80&w=800';

const IMAGE_SLOTS = [
  { label: 'Slot 1: Cover / Front', sub: 'Primary display photo (Mandatory)' },
  { label: 'Slot 2: Side / Profile Angle', sub: 'Shows side profile & dimensions' },
  { label: 'Slot 3: Back / Ports & Controls', sub: 'Shows rear connectors & branding' },
  { label: 'Slot 4: Detail / Accessories Kit', sub: 'Close-up, packaging or kit items' },
];

const CATEGORY_PRESETS: Record<string, Record<string, string>> = {
  'Cameras & Lenses': { 'Sensor': 'Full-Frame CMOS', 'Mount': 'Sony E / Canon RF', 'Max Video': '4K / 60fps 10-bit' },
  'Electronics & Tech': { 'Processor': 'High-Speed Chip', 'Memory': '32GB RAM / 1TB SSD', 'Display': 'Retina HDR' },
  'Drones & Aerial': { 'Camera': '4K Gimbal Camera', 'Flight Time': '35 Minutes', 'Transmission': '10km HD O3' },
  'Audio & Sound': { 'Output Power': '1000W RMS', 'Channels': 'Multi-Channel Stereo', 'Connectivity': 'XLR / Dante / Bluetooth' },
  'Lighting': { 'Color Temp': '2700K - 6500K Bi-Color', 'CRI Rating': '96+ High Accuracy', 'Mount': 'Bowens S-Mount' },
  'Heavy Machinery': { 'Operating Weight': '3,500 kg', 'Engine Power': '55 kW Diesel', 'Max Dig Depth': '3.2 meters' },
  'Vehicles & Mobility': { 'Powertrain': 'All-Wheel Drive / Electric', 'Range': '420 km Battery', 'Seating': '5 Passengers' },
  'Tools & Equipment': { 'Power Source': '20V MAX Lithium-Ion', 'Torque': '95 Nm Brushless', 'Case': 'Heavy Duty ToughBox' },
  'Medical Equipment': { 'Certification': 'ISO 13485 Medical Grade', 'Power': 'Dual AC + Battery Backup', 'Flow Rate': '5 LPM Continuous' },
  'Designer Fashion': { 'Material': 'Italian Silk / Leather', 'Origin': 'Handcrafted Milan', 'Dry Clean': 'Included in Rental' }
};

export const Products: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'Catalog' | 'Pricelists'>('Catalog');
  const [showAddModal, setShowAddModal] = useState(false);
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = React.useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase().trim();
    return products.filter(p =>
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  }, [products, searchQuery]);

  // Modern 4-Step Wizard State
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);

  // Add Product Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Cameras & Lenses');
  const [brand, setBrand] = useState('');
  const [sku, setSku] = useState('');
  const [dailyRate, setDailyRate] = useState(4500);
  const [securityDeposit, setSecurityDeposit] = useState(25000);
  const [stock, setStock] = useState(3);
  const [description, setDescription] = useState('');
  const [specs, setSpecs] = useState<Record<string, string>>(CATEGORY_PRESETS['Cameras & Lenses']);
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecVal, setNewSpecVal] = useState('');

  // 4-Image Slots for Add Product (Flipkart / Amazon Style)
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800',
    '',
    '',
    ''
  ]);
  const [activeSlot, setActiveSlot] = useState<number>(0);
  const [slotMode, setSlotMode] = useState<'URL' | 'UPLOAD'>('URL');

  // Edit Product Modal Form State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editSku, setEditSku] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editBrand, setEditBrand] = useState('');
  const [editDailyRate, setEditDailyRate] = useState(0);
  const [editSecurityDeposit, setEditSecurityDeposit] = useState(0);
  const [editStock, setEditStock] = useState(1);
  const [editDescription, setEditDescription] = useState('');
  const [editSpecs, setEditSpecs] = useState<Record<string, string>>({});

  // 4-Image Slots for Edit Product
  const [editImages, setEditImages] = useState<string[]>(['', '', '', '']);
  const [activeEditSlot, setActiveEditSlot] = useState<number>(0);
  const [editSlotMode, setEditSlotMode] = useState<'URL' | 'UPLOAD'>('URL');

  const loadProducts = () => {
    api.getProducts().then((data) => setProducts(data));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // When category changes, suggest standard industry specs
  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    if (CATEGORY_PRESETS[newCat]) {
      setSpecs(CATEGORY_PRESETS[newCat]);
    }
  };

  // Smart SKU Generator (Modern UX Trend)
  const handleAutoGenerateSKU = () => {
    const brandPrefix = (brand || 'ROV').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
    const catPrefix = category.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3);
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const generated = `${brandPrefix}-${catPrefix}-${randNum}`;
    setSku(generated);
    showToast('SKU Generated', `Created unique identifier: ${generated}`, 'info');
  };

  // Smart Deposit Calculator (Auto 6x ratio recommendation)
  const handleSmartDepositCalculate = (multiplier: number = 6) => {
    const recommended = dailyRate * multiplier;
    setSecurityDeposit(recommended);
    showToast('Deposit Calculated', `Set 100% refundable escrow deposit to ₹${recommended.toLocaleString()} (${multiplier}x rate)`, 'success');
  };

  const handleSlotImageChange = (index: number, url: string, isEdit = false) => {
    if (isEdit) {
      setEditImages((prev) => {
        const next = [...prev];
        next[index] = url;
        return next;
      });
    } else {
      setImages((prev) => {
        const next = [...prev];
        next[index] = url;
        return next;
      });
    }
  };

  const handleFileUploadSlot = (file: File, slotIndex: number, isEditMode = false) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        handleSlotImageChange(slotIndex, reader.result as string, isEditMode);
        showToast(`Slot ${slotIndex + 1} Image Loaded`, 'File converted to base64 preview.', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddSpec = () => {
    if (!newSpecKey.trim() || !newSpecVal.trim()) return;
    setSpecs((prev) => ({ ...prev, [newSpecKey.trim()]: newSpecVal.trim() }));
    setNewSpecKey('');
    setNewSpecVal('');
  };

  const handleRemoveSpec = (key: string) => {
    setSpecs((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku) {
      showToast('Validation Error', 'Product Name and SKU are required', 'error');
      setWizardStep(1);
      return;
    }

    const validImages = images.filter((img) => img && img.trim().length > 0);
    const finalPrimary = validImages[0] || FALLBACK_IMAGE;
    const finalGallery = validImages.length > 0 ? validImages : [finalPrimary];

    const created = await api.createProduct({
      renterId: user?.id || 'rnt-101',
      renterName: user?.company || user?.name || 'ROVIA Atelier & Cinema Rigs',
      sku,
      name,
      category,
      brand: brand || 'Generic Brand',
      color: 'Matte Obsidian',
      dailyRate: Number(dailyRate),
      securityDeposit: Number(securityDeposit),
      stock: Number(stock),
      available: Number(stock),
      rating: 5.0,
      image: finalPrimary,
      gallery: finalGallery,
      description: description || `Professional ${category} rental package by ${brand || 'ROVIA'}. Certified with anti-damage tracking.`,
      specs: specs,
      variants: ['Standard Package', 'Pro Accessory Bundle'],
    });

    setProducts((prev) => [created, ...prev]);
    showToast('Product SKU Published!', `${name} is now live in the catalog with ${finalGallery.length} photos!`, 'success');
    setShowAddModal(false);
    
    // Reset Form
    setName('');
    setSku('');
    setBrand('');
    setDescription('');
    setImages(['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800', '', '', '']);
    setActiveSlot(0);
    setWizardStep(1);
  };

  const handleOpenEditModal = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    setEditingProduct(product);
    setEditName(product.name);
    setEditSku(product.sku);
    setEditCategory(product.category);
    setEditBrand(product.brand);
    setEditDailyRate(product.dailyRate);
    setEditSecurityDeposit(product.securityDeposit);
    setEditStock(product.stock);
    setEditDescription(product.description);
    setEditSpecs(product.specs || {});
    
    // Populate up to 4 images from product gallery or primary image
    const initialGallery = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];
    setEditImages([
      initialGallery[0] || '',
      initialGallery[1] || '',
      initialGallery[2] || '',
      initialGallery[3] || ''
    ]);
    setActiveEditSlot(0);
  };

  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const validEditImages = editImages.filter((img) => img && img.trim().length > 0);
    const finalPrimary = validEditImages[0] || editingProduct.image || FALLBACK_IMAGE;
    const finalGallery = validEditImages.length > 0 ? validEditImages : [finalPrimary];

    const updated: Product = {
      ...editingProduct,
      name: editName,
      sku: editSku,
      category: editCategory,
      brand: editBrand,
      dailyRate: Number(editDailyRate),
      securityDeposit: Number(editSecurityDeposit),
      stock: Number(editStock),
      available: Number(editStock),
      image: finalPrimary,
      gallery: finalGallery,
      description: editDescription,
      specs: editSpecs,
    };

    await api.updateProduct(editingProduct.id, updated);
    setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? updated : p)));
    showToast('Product SKU Updated!', `${editName} updated with ${finalGallery.length} product images.`, 'success');
    setEditingProduct(null);
  };

  const columns: Column<Product>[] = [
    {
      key: 'image',
      header: 'Item Asset',
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden glass-panel border border-[#988686]/30 bg-black/40 shrink-0">
            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
            {p.gallery && p.gallery.length > 1 && (
              <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] font-mono text-center text-white">
                {p.gallery.length} img
              </span>
            )}
          </div>
          <div>
            <span className="font-heading font-bold text-xs text-[#000000] dark:text-white block line-clamp-1">{p.name}</span>
            <span className="font-mono text-[10px] text-[#988686]">{p.sku}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category & Brand',
      render: (p) => (
        <div>
          <span className="text-xs font-bold text-[#000000] dark:text-white block">{p.category}</span>
          <span className="text-[10px] text-[#988686]">{p.brand}</span>
        </div>
      ),
    },
    {
      key: 'dailyRate',
      header: 'Daily Rate',
      render: (p) => (
        <div>
          <span className="font-mono font-bold text-xs text-[#000000] dark:text-white">₹{p.dailyRate.toLocaleString()}</span>
          <span className="text-[10px] text-[#988686] block font-mono">+ ₹{p.securityDeposit.toLocaleString()} dep</span>
        </div>
      ),
    },
    {
      key: 'stock',
      header: 'Stock / Available',
      render: (p) => (
        <div className="flex items-center gap-2">
          {p.available === 0 ? (
            <Badge variant="danger">Out of Stock</Badge>
          ) : (
            <Badge variant="neutral">{p.available} / {p.stock} units</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Manage SKU',
      render: (p) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" leftIcon={<Edit className="w-3.5 h-3.5" />} onClick={(e) => handleOpenEditModal(e, p)}>
            Edit SKU
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full space-y-8 page-transition pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#988686]/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase text-[#988686] tracking-widest">INVENTORY MANAGEMENT</span>
            <Badge variant="info">{products.length} Products Active</Badge>
          </div>
          <h1 className="font-heading text-3xl font-bold text-[#000000] dark:text-white mt-1">
            Product Catalog & SKU Registry
          </h1>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setWizardStep(1);
            setShowAddModal(true);
          }}
        >
          Add Rental Product (Wizard)
        </Button>
      </div>

      {/* Tabs */}
      {/* Inventory Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center p-1 rounded-xl bg-[#988686]/15 max-w-xs">
          <button
            onClick={() => setActiveTab('Catalog')}
            className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'Catalog' ? 'bg-[#000000] dark:bg-[#988686] text-white shadow-warm-sm' : 'text-[#5C4E4E] dark:text-[#B5A9A9]'
            }`}
          >
            SKU Inventory ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('Pricelists')}
            className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'Pricelists' ? 'bg-[#000000] dark:bg-[#988686] text-white shadow-warm-sm' : 'text-[#5C4E4E] dark:text-[#B5A9A9]'
            }`}
          >
            Pricelists & Rules
          </button>
        </div>

        {activeTab === 'Catalog' && (
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#988686]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search SKU, name, brand..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white/70 dark:bg-black/30 border border-[#988686]/20 focus:outline-none focus:ring-2 focus:ring-[#988686] text-[#000000] dark:text-white placeholder-[#988686]"
            />
          </div>
        )}
      </div>

      {/* Products Table */}
      {activeTab === 'Catalog' && (
        <Card className="p-0 overflow-hidden shadow-xl border-[#988686]/30">
          <DataTable data={filteredProducts} columns={columns} />
        </Card>
      )}

      {/* Pricelists Tab */}
      {activeTab === 'Pricelists' && (
        <div className="p-8 rounded-3xl glass-panel border border-[#988686]/30 text-center space-y-3">
          <Tag className="w-10 h-10 text-[#988686] mx-auto opacity-60" />
          <h3 className="font-heading text-xl font-bold text-[#000000] dark:text-white">Active Rental Pricing Tiers</h3>
          <p className="text-xs text-[#988686] max-w-md mx-auto">
            Dynamic discounts applied: 3+ days (10% off), 7+ days (15% off), 30+ days (25% off monthly contract).
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODERN UX TRENDS PRODUCT CREATION WIZARD MODAL (Split-Screen + Preview)   */}
      {/* ========================================================================= */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Rental Product SKU"
        maxWidth="2xl"
      >
        <div className="space-y-6">
          {/* Stepper Progress Bar (Modern UX Trend) */}
          <div className="border-b border-[#988686]/20 pb-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-[#000000] dark:text-white">
                Step {wizardStep} of 4:{' '}
                {wizardStep === 1 && 'Basic Essentials'}
                {wizardStep === 2 && 'Pricing & Escrow Deposit'}
                {wizardStep === 3 && '4-Angle Media Hub'}
                {wizardStep === 4 && 'Specifications & Highlights'}
              </span>
              <span className="font-mono text-[#988686] text-[11px]">{wizardStep * 25}% Completed</span>
            </div>
            <div className="h-1.5 w-full bg-[#988686]/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#5E7A63] to-[#988686] transition-all duration-300 rounded-full"
                style={{ width: `${wizardStep * 25}%` }}
              />
            </div>

            {/* Stepper Navigation Pills */}
            <div className="flex items-center gap-2 mt-3 overflow-x-auto">
              {[
                { step: 1, label: '1. Essentials' },
                { step: 2, label: '2. Commercials' },
                { step: 3, label: '3. Media Studio' },
                { step: 4, label: '4. Specs' },
              ].map((s) => (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => setWizardStep(s.step as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    wizardStep === s.step
                      ? 'bg-[#000000] dark:bg-[#988686] text-white shadow-sm'
                      : wizardStep > s.step
                      ? 'bg-[#5E7A63]/20 text-[#5E7A63]'
                      : 'text-[#988686] hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form + Live Preview Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7 cols: Step Forms */}
            <div className="lg:col-span-7 space-y-4">
              {/* STEP 1: Basic Essentials */}
              {wizardStep === 1 && (
                <div className="space-y-3 animate-fadeIn text-xs">
                  <Input
                    label="Product / Rig Title *"
                    placeholder="e.g. Sony FX9 Full-Frame Cinema Camera Kit"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="font-semibold text-[#5C4E4E] dark:text-[#B5A9A9] uppercase">Category *</label>
                      <select
                        value={category}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="glass-input rounded-xl p-2.5 text-xs font-semibold text-[#000000] dark:text-white border border-[#988686]/30"
                      >
                        <option value="Cameras & Lenses">Cameras & Lenses</option>
                        <option value="Electronics & Tech">Electronics & Tech</option>
                        <option value="Drones & Aerial">Drones & Aerial</option>
                        <option value="Audio & Sound">Audio & Sound</option>
                        <option value="Lighting">Lighting</option>
                        <option value="Vehicles & Mobility">Vehicles & Mobility</option>
                        <option value="Heavy Machinery">Heavy Machinery</option>
                        <option value="Tools & Equipment">Tools & Equipment</option>
                        <option value="Outdoor & Camping">Outdoor & Camping</option>
                        <option value="Medical Equipment">Medical Equipment</option>
                        <option value="Designer Fashion">Designer Fashion</option>
                        <option value="Event Supplies">Event Supplies</option>
                      </select>
                    </div>

                    <Input
                      label="Brand / Manufacturer *"
                      placeholder="e.g. Sony, ARRI, Apple"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                    />
                  </div>

                  {/* SKU with Auto-Generator */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-[#5C4E4E] dark:text-[#B5A9A9] uppercase">
                        SKU Identifier *
                      </label>
                      <button
                        type="button"
                        onClick={handleAutoGenerateSKU}
                        className="text-[11px] text-[#5E7A63] hover:underline font-bold flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" /> Auto-Generate SKU
                      </button>
                    </div>
                    <Input
                      placeholder="e.g. SONY-CAM-4821"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-[#5C4E4E] dark:text-[#B5A9A9] uppercase">Overview Description</label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Key rental features, condition rating, and bundled case inclusions..."
                      className="glass-input rounded-xl p-2.5 text-xs text-[#000000] dark:text-white border border-[#988686]/30 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Pricing & Commercials */}
              {wizardStep === 2 && (
                <div className="space-y-4 animate-fadeIn text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Daily Rental Rate (₹) *"
                      type="number"
                      value={dailyRate}
                      onChange={(e) => setDailyRate(Number(e.target.value))}
                    />
                    <Input
                      label="Initial Stock Units *"
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(Number(e.target.value))}
                    />
                  </div>

                  {/* Escrow Security Deposit with 1-Click Smart Ratio Calculator */}
                  <div className="p-4 rounded-2xl bg-[#988686]/10 border border-[#988686]/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-bold text-[#000000] dark:text-white uppercase text-xs block">
                          Security Deposit (₹)
                        </label>
                        <span className="text-[10px] text-[#988686]">100% Refundable to customer via Escrow</span>
                      </div>
                      <span className="font-mono font-bold text-sm text-[#5E7A63]">₹{securityDeposit.toLocaleString()}</span>
                    </div>

                    <Input
                      type="number"
                      value={securityDeposit}
                      onChange={(e) => setSecurityDeposit(Number(e.target.value))}
                    />

                    {/* Quick Ratio Calculators */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] text-[#988686]">Quick Presets:</span>
                      {[5, 6, 8, 10].map((mul) => (
                        <button
                          key={mul}
                          type="button"
                          onClick={() => handleSmartDepositCalculate(mul)}
                          className="px-2.5 py-1 rounded-lg glass-panel border border-[#988686]/30 text-[10px] font-mono hover:border-white text-[#988686]"
                        >
                          {mul}x Rate
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl glass-panel border border-[#988686]/20 text-[11px] text-[#988686] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#5E7A63] shrink-0" />
                    <span>Protected by OpenCV Automated Optical Return Verification upon check-in.</span>
                  </div>
                </div>
              )}

              {/* STEP 3: 4-Angle Media Studio */}
              {wizardStep === 3 && (
                <div className="space-y-4 animate-fadeIn text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#000000] dark:text-white uppercase text-xs block">
                        4-Angle Product Photography Studio
                      </span>
                      <span className="text-[10px] text-[#988686]">Flipkart & Amazon compliant multi-angle display</span>
                    </div>
                    <Badge variant="info">
                      {images.filter((img) => img && img.trim().length > 0).length} / 4 Slots
                    </Badge>
                  </div>

                  {/* 4 Thumbnails */}
                  <div className="grid grid-cols-4 gap-2">
                    {IMAGE_SLOTS.map((slot, idx) => {
                      const img = images[idx];
                      const isSelected = activeSlot === idx;
                      return (
                        <div
                          key={idx}
                          onClick={() => setActiveSlot(idx)}
                          className={`cursor-pointer rounded-2xl p-1.5 border transition-all flex flex-col items-center relative ${
                            isSelected
                              ? 'border-[#988686] ring-2 ring-[#988686]/50 bg-[#988686]/15'
                              : 'border-[#988686]/20 glass-panel'
                          }`}
                        >
                          <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-black/40 border border-[#988686]/20 flex items-center justify-center">
                            {img ? (
                              <>
                                <img src={img} alt={slot.label} className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSlotImageChange(idx, '');
                                  }}
                                  className="absolute top-1 right-1 p-0.5 rounded-full bg-black/70 text-white hover:bg-[#A0524E]"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </>
                            ) : (
                              <Camera className="w-4 h-4 text-[#988686] opacity-50" />
                            )}
                            <span className="absolute bottom-1 left-1 text-[7px] font-mono bg-black/70 text-white px-1 rounded">
                              {idx === 0 ? 'MAIN' : `A${idx + 1}`}
                            </span>
                          </div>
                          <span className="text-[9px] font-bold text-[#000000] dark:text-white mt-1 truncate w-full text-center">
                            {slot.label.split(':')[1]}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Active Slot Editor */}
                  <div className="p-3.5 rounded-2xl glass-panel border border-[#988686]/30 space-y-2.5 bg-[#988686]/5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#000000] dark:text-white">
                        Configuring {IMAGE_SLOTS[activeSlot]?.label}
                      </span>
                      <div className="flex items-center gap-1 bg-[#988686]/15 p-0.5 rounded-lg text-[10px]">
                        <button
                          type="button"
                          onClick={() => setSlotMode('URL')}
                          className={`px-2 py-0.5 rounded font-bold ${
                            slotMode === 'URL' ? 'bg-[#000000] dark:bg-[#988686] text-white' : 'text-[#988686]'
                          }`}
                        >
                          URL
                        </button>
                        <button
                          type="button"
                          onClick={() => setSlotMode('UPLOAD')}
                          className={`px-2 py-0.5 rounded font-bold ${
                            slotMode === 'UPLOAD' ? 'bg-[#000000] dark:bg-[#988686] text-white' : 'text-[#988686]'
                          }`}
                        >
                          Upload
                        </button>
                      </div>
                    </div>

                    {slotMode === 'URL' ? (
                      <Input
                        placeholder="Paste image web address (Unsplash / CDN)..."
                        value={images[activeSlot] || ''}
                        onChange={(e) => handleSlotImageChange(activeSlot, e.target.value)}
                      />
                    ) : (
                      <FileUpload
                        label={`Upload File for ${IMAGE_SLOTS[activeSlot]?.label}`}
                        onFileSelect={(file) => handleFileUploadSlot(file, activeSlot, false)}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* STEP 4: Specifications & Highlights */}
              {wizardStep === 4 && (
                <div className="space-y-4 animate-fadeIn text-xs">
                  <div>
                    <span className="font-bold text-[#000000] dark:text-white uppercase text-xs block">
                      Technical Specifications Matrix
                    </span>
                    <span className="text-[10px] text-[#988686]">Add key value attributes shown to customers</span>
                  </div>

                  {/* Dynamic Spec List */}
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {Object.entries(specs).map(([k, v]) => (
                      <div key={k} className="p-2 rounded-xl glass-panel border border-[#988686]/20 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-[#000000] dark:text-white mr-2">{k}:</span>
                          <span className="text-[#988686]">{v}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSpec(k)}
                          className="text-[#988686] hover:text-[#A0524E]"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Spec Row */}
                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder="Spec name (e.g. Weight)"
                      value={newSpecKey}
                      onChange={(e) => setNewSpecKey(e.target.value)}
                    />
                    <Input
                      placeholder="Value (e.g. 2.4 kg)"
                      value={newSpecVal}
                      onChange={(e) => setNewSpecVal(e.target.value)}
                    />
                    <Button type="button" size="sm" variant="outline" onClick={handleAddSpec} className="shrink-0">
                      Add
                    </Button>
                  </div>
                </div>
              )}

              {/* Wizard Bottom Navigation Controls */}
              <div className="pt-4 border-t border-[#988686]/20 flex items-center justify-between">
                {wizardStep > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                    onClick={() => setWizardStep((s) => (s - 1) as any)}
                  >
                    Back
                  </Button>
                ) : <div />}

                {wizardStep < 4 ? (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    onClick={() => setWizardStep((s) => (s + 1) as any)}
                  >
                    Next Step
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    onClick={handleCreateProduct}
                  >
                    Publish to Catalog
                  </Button>
                )}
              </div>
            </div>

            {/* Right 5 cols: REAL-TIME LIVE CATALOG CARD PREVIEW (Modern UX Trend) */}
            <div className="lg:col-span-5 space-y-2">
              <span className="text-[10px] font-mono uppercase text-[#988686] tracking-wider flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-[#5E7A63]" /> Real-Time Live Catalog Card Mockup
              </span>

              <div className="p-4 rounded-3xl glass-panel border border-[#988686]/30 shadow-2xl bg-black/40 space-y-3">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black/60 border border-[#988686]/20">
                  <img
                    src={images[0] || FALLBACK_IMAGE}
                    alt="Preview"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/80 px-2 py-0.5 rounded-full text-[9px] font-bold text-white border border-[#5E7A63]/50">
                    <ShieldCheck className="w-3 h-3 text-[#5E7A63]" />
                    <span>ASSURED</span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge variant="neutral">{stock} in stock</Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#988686]">
                    <span>{brand || 'Brand'}</span>
                    <span className="text-[#B08A4E]">5.0 ★</span>
                  </div>
                  <h4 className="font-heading font-bold text-sm text-white line-clamp-1">
                    {name || 'Product Title Appears Here'}
                  </h4>
                  <span className="text-[10px] text-[#988686] block">{category}</span>
                </div>

                <div className="pt-2 border-t border-[#988686]/20 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-heading font-extrabold text-base text-white">
                      ₹{dailyRate.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[#988686] block font-mono">
                      + ₹{securityDeposit.toLocaleString()} dep
                    </span>
                  </div>
                  <Badge variant="success">Ready to Rent</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editingProduct} onClose={() => setEditingProduct(null)} title={`Edit Product SKU: ${editingProduct?.sku}`} maxWidth="lg">
        {editingProduct && (
          <form onSubmit={handleSaveEditProduct} className="space-y-4 text-xs pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Product Name *" value={editName} onChange={(e) => setEditName(e.target.value)} required />
              <Input label="SKU Code *" value={editSku} onChange={(e) => setEditSku(e.target.value)} required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-[#5C4E4E] dark:text-[#B5A9A9] uppercase">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="glass-input rounded-xl p-2 text-xs font-semibold text-[#000000] dark:text-white"
                >
                  <option value="Heavy Machinery">Heavy Machinery</option>
                  <option value="Designer Fashion">Designer Fashion</option>
                  <option value="Vehicles & Mobility">Vehicles & Mobility</option>
                  <option value="Electronics & Tech">Electronics & Tech</option>
                  <option value="Medical Equipment">Medical Equipment</option>
                  <option value="Outdoor & Camping">Outdoor & Camping</option>
                  <option value="Cameras & Lenses">Cameras & Lenses</option>
                  <option value="Event Supplies">Event Supplies</option>
                </select>
              </div>
              <Input label="Manufacturer / Brand" value={editBrand} onChange={(e) => setEditBrand(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input label="Daily Rate (₹)" type="number" value={editDailyRate} onChange={(e) => setEditDailyRate(Number(e.target.value))} />
              <Input label="Security Deposit (₹)" type="number" value={editSecurityDeposit} onChange={(e) => setEditSecurityDeposit(Number(e.target.value))} />
              <Input label="Stock Units" type="number" value={editStock} onChange={(e) => setEditStock(Number(e.target.value))} />
            </div>

            {/* 4-Image Slots for Edit Product */}
            <div className="space-y-3 border-t border-[#988686]/20 pt-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-bold text-[#000000] dark:text-white uppercase text-xs flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#988686]" />
                    Product Visual Assets (4 Angle Slots)
                  </label>
                  <p className="text-[10px] text-[#988686]">
                    Click any angle slot to update photo URL or upload new image file.
                  </p>
                </div>
                <Badge variant="info">
                  {editImages.filter((img) => img && img.trim().length > 0).length} / 4 Slots Filled
                </Badge>
              </div>

              {/* 4 Slot Thumbnails Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {IMAGE_SLOTS.map((slot, idx) => {
                  const img = editImages[idx];
                  const isSelected = activeEditSlot === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setActiveEditSlot(idx)}
                      className={`cursor-pointer rounded-2xl p-2 border transition-all flex flex-col items-center text-center relative ${
                        isSelected
                          ? 'border-[#988686] ring-2 ring-[#988686]/50 bg-[#988686]/10 shadow-warm-sm'
                          : 'border-[#988686]/20 glass-panel hover:border-[#988686]/40'
                      }`}
                    >
                      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-black/40 border border-[#988686]/20 flex items-center justify-center">
                        {img ? (
                          <>
                            <img src={img} alt={slot.label} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSlotImageChange(idx, '', true);
                              }}
                              className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-[#A0524E] transition-colors"
                              title="Clear Slot"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-2 text-[#988686]">
                            <Camera className="w-5 h-5 mb-1 opacity-50" />
                            <span className="text-[9px] font-mono uppercase tracking-wider">Empty</span>
                          </div>
                        )}
                        <div className="absolute bottom-1 left-1">
                          <span className={`text-[8px] font-bold font-mono px-1.5 py-0.5 rounded ${idx === 0 ? 'bg-[#988686] text-white' : 'bg-black/60 text-white'}`}>
                            {idx === 0 ? 'MAIN' : `ANGLE ${idx + 1}`}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-[#000000] dark:text-white mt-1.5 truncate w-full">
                        {slot.label.split(':')[1] || slot.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Active Slot Configuration Card */}
              <div className="p-3 rounded-2xl glass-panel border border-[#988686]/30 space-y-2 bg-[#988686]/5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#000000] dark:text-white">
                    Editing {IMAGE_SLOTS[activeEditSlot]?.label}
                  </span>
                  <div className="flex items-center gap-1.5 p-0.5 rounded-lg bg-[#988686]/15 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setEditSlotMode('URL')}
                      className={`px-2 py-0.5 font-bold rounded-md transition-all ${
                        editSlotMode === 'URL' ? 'bg-[#000000] dark:bg-[#988686] text-white' : 'text-[#5C4E4E] dark:text-[#B5A9A9]'
                      }`}
                    >
                      Image URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditSlotMode('UPLOAD')}
                      className={`px-2 py-0.5 font-bold rounded-md transition-all ${
                        editSlotMode === 'UPLOAD' ? 'bg-[#000000] dark:bg-[#988686] text-white' : 'text-[#5C4E4E] dark:text-[#B5A9A9]'
                      }`}
                    >
                      Upload File
                    </button>
                  </div>
                </div>

                {editSlotMode === 'URL' ? (
                  <Input
                    placeholder="Paste Unsplash / product image URL address..."
                    value={editImages[activeEditSlot] || ''}
                    onChange={(e) => handleSlotImageChange(activeEditSlot, e.target.value, true)}
                  />
                ) : (
                  <FileUpload
                    label={`Upload Photo for ${IMAGE_SLOTS[activeEditSlot]?.label}`}
                    onFileSelect={(file) => handleFileUploadSlot(file, activeEditSlot, true)}
                  />
                )}
              </div>
            </div>

            <Input label="Short Description" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />

            <div className="pt-4 border-t border-[#988686]/30">
              <Button type="submit" className="w-full py-3" leftIcon={<Save className="w-4 h-4" />}>
                Save Product Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
