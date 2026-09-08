import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit, Tag, Layers, Search, CheckCircle2, Upload, Link as LinkIcon, Image as ImageIcon, Save, X, Camera, Sparkles } from 'lucide-react';
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

export const Products: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'Catalog' | 'Pricelists'>('Catalog');
  const [showAddModal, setShowAddModal] = useState(false);
  const { showToast } = useToast();

  // Add Product Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Heavy Machinery');
  const [brand, setBrand] = useState('');
  const [sku, setSku] = useState('');
  const [dailyRate, setDailyRate] = useState(5000);
  const [securityDeposit, setSecurityDeposit] = useState(25000);
  const [stock, setStock] = useState(3);
  const [description, setDescription] = useState('');

  // 4-Image Slots for Add Product (Flipkart / Amazon Style)
  const [images, setImages] = useState<string[]>(['', '', '', '']);
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

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku) {
      showToast('Validation Error', 'Product Name and SKU are required', 'error');
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
      color: 'Default',
      dailyRate: Number(dailyRate),
      securityDeposit: Number(securityDeposit),
      stock: Number(stock),
      available: Number(stock),
      rating: 5.0,
      image: finalPrimary,
      gallery: finalGallery,
      description: description || `Universal rental item under ${category}`,
      specs: { Category: category, SKU: sku },
      variants: ['Standard Rental Package'],
    });

    setProducts((prev) => [created, ...prev]);
    showToast('Universal Rental SKU Created!', `${name} added with ${finalGallery.length} product photos (Flipkart/Amazon layout).`, 'success');
    setShowAddModal(false);
    
    // Reset Form
    setName('');
    setSku('');
    setBrand('');
    setDescription('');
    setImages(['', '', '', '']);
    setActiveSlot(0);
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
    };

    await api.updateProduct(editingProduct.id, updated);
    setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? updated : p)));
    showToast('Product SKU Updated!', `${editName} updated with ${finalGallery.length} product images.`, 'success');
    setEditingProduct(null);
  };

  const columns: Column<Product>[] = [
    {
      key: 'image',
      header: 'Product Item',
      render: (r) => (
        <div className="flex items-center gap-3">
          <img
            src={r.image || FALLBACK_IMAGE}
            alt={r.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
            }}
            className="w-10 h-10 object-cover rounded-lg border border-[#988686]/30 bg-black/40"
          />
          <div>
            <span className="font-bold text-xs text-[#000000] dark:text-white block">{r.name}</span>
            <span className="text-[10px] text-[#988686] font-mono">{r.sku} • {r.renterName}</span>
          </div>
        </div>
      ),
    },
    { key: 'category', header: 'Category' },
    { key: 'dailyRate', header: 'Daily Rate', render: (r) => <span className="font-mono font-bold">₹{r.dailyRate.toLocaleString()}</span> },
    { key: 'securityDeposit', header: 'Deposit', render: (r) => <span className="font-mono text-[#5E7286]">₹{r.securityDeposit.toLocaleString()}</span> },
    { key: 'stock', header: 'Stock Status', render: (r) => <Badge variant={r.available > 0 ? 'success' : 'danger'}>{r.available} / {r.stock} Available</Badge> },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <Button size="sm" variant="outline" leftIcon={<Edit className="w-3.5 h-3.5" />} onClick={(e) => handleOpenEditModal(e, r)}>
          Edit SKU
        </Button>
      ),
    },
  ];

  return (
    <div className="w-full space-y-8 page-transition pb-16">
      <div className="flex items-center justify-between border-b border-[#5C4E4E]/30 pb-4">
        <div>
          <span className="text-xs font-mono uppercase text-[#988686] tracking-widest">UNIVERSAL INVENTORY CONTROL</span>
          <h1 className="font-heading text-3xl font-bold text-[#000000] dark:text-white mt-1">
            Universal Product Catalog & Rates
          </h1>
        </div>

        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
          Add Universal Product SKU
        </Button>
      </div>

      <div className="flex items-center p-1 rounded-xl bg-[#988686]/15 max-w-xs">
        <button
          onClick={() => setActiveTab('Catalog')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'Catalog' ? 'bg-[#000000] dark:bg-[#988686] text-white shadow-warm-sm' : 'text-[#5C4E4E] dark:text-[#B5A9A9]'
          }`}
        >
          Product Catalog ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('Pricelists')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'Pricelists' ? 'bg-[#000000] dark:bg-[#988686] text-white shadow-warm-sm' : 'text-[#5C4E4E] dark:text-[#B5A9A9]'
          }`}
        >
          Time-Bound Pricelists
        </button>
      </div>

      {activeTab === 'Catalog' ? (
        <DataTable columns={columns} data={products} />
      ) : (
        <div className="space-y-4">
          <Card className="p-6 space-y-4">
            <h3 className="font-heading text-xl font-bold text-[#000000] dark:text-white border-b border-[#988686]/30 pb-2">
              Active Time-Bound Pricelists
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-[#988686]/30 glass-card space-y-2">
                <Badge variant="success">Active Default</Badge>
                <h4 className="font-bold text-sm text-[#000000] dark:text-white">Universal Rates Schedule 2026</h4>
                <p className="text-[#988686]">Permanent base rates for all product categories.</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Add Product Modal Form */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Universal Product SKU" maxWidth="lg">
        <form onSubmit={handleCreateProduct} className="space-y-4 text-xs pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Product Name *" placeholder="e.g. Caterpillar CAT 305 Excavator" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="SKU Code *" placeholder="e.g. CAT-305-EXCAV" value={sku} onChange={(e) => setSku(e.target.value)} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-[#5C4E4E] dark:text-[#B5A9A9] uppercase">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="glass-input rounded p-2 text-xs font-semibold text-[#000000] dark:text-white"
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
            <Input label="Manufacturer / Brand" placeholder="e.g. Caterpillar" value={brand} onChange={(e) => setBrand(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input label="Daily Rate (₹)" type="number" value={dailyRate} onChange={(e) => setDailyRate(Number(e.target.value))} />
            <Input label="Security Deposit (₹)" type="number" value={securityDeposit} onChange={(e) => setSecurityDeposit(Number(e.target.value))} />
            <Input label="Initial Stock Units" type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} />
          </div>

          {/* 4-Image Slots for Product Creation (Flipkart / Amazon Style) */}
          <div className="space-y-3 border-t border-[#988686]/20 pt-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-bold text-[#000000] dark:text-white uppercase text-xs flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#988686]" />
                  Product Visual Assets (4 Angle Slots • Flipkart / Amazon Style)
                </label>
                <p className="text-[10px] text-[#988686]">
                  Click any slot to paste an image URL or upload directly from your device.
                </p>
              </div>
              <Badge variant="info">
                {images.filter(img => img && img.trim().length > 0).length} / 4 Slots Filled
              </Badge>
            </div>

            {/* 4 Slot Thumbnails Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {IMAGE_SLOTS.map((slot, idx) => {
                const img = images[idx];
                const isSelected = activeSlot === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveSlot(idx)}
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
                              handleSlotImageChange(idx, '');
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
                  Editing {IMAGE_SLOTS[activeSlot]?.label}
                </span>
                <div className="flex items-center gap-1.5 p-0.5 rounded-lg bg-[#988686]/15 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setSlotMode('URL')}
                    className={`px-2 py-0.5 font-bold rounded-md transition-all ${
                      slotMode === 'URL' ? 'bg-[#000000] dark:bg-[#988686] text-white' : 'text-[#5C4E4E] dark:text-[#B5A9A9]'
                    }`}
                  >
                    Image URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setSlotMode('UPLOAD')}
                    className={`px-2 py-0.5 font-bold rounded-md transition-all ${
                      slotMode === 'UPLOAD' ? 'bg-[#000000] dark:bg-[#988686] text-white' : 'text-[#5C4E4E] dark:text-[#B5A9A9]'
                    }`}
                  >
                    Upload File
                  </button>
                </div>
              </div>

              {slotMode === 'URL' ? (
                <Input
                  placeholder="Paste Unsplash / product image URL address..."
                  value={images[activeSlot] || ''}
                  onChange={(e) => handleSlotImageChange(activeSlot, e.target.value)}
                />
              ) : (
                <FileUpload
                  label={`Upload Photo for ${IMAGE_SLOTS[activeSlot]?.label}`}
                  onFileSelect={(file) => handleFileUploadSlot(file, activeSlot, false)}
                />
              )}
            </div>
          </div>

          <Input label="Short Description" placeholder="Key specs and rental features..." value={description} onChange={(e) => setDescription(e.target.value)} />

          <div className="pt-4 border-t border-[#988686]/30">
            <Button type="submit" className="w-full py-3" leftIcon={<CheckCircle2 className="w-4 h-4" />}>
              Save & Publish to Live Catalog
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Product Modal Form */}
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
                  className="glass-input rounded p-2 text-xs font-semibold text-[#000000] dark:text-white"
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

            {/* 4-Image Slots for Edit Product (Flipkart / Amazon Style) */}
            <div className="space-y-3 border-t border-[#988686]/20 pt-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-bold text-[#000000] dark:text-white uppercase text-xs flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#988686]" />
                    Product Visual Assets (4 Angle Slots • Flipkart / Amazon Style)
                  </label>
                  <p className="text-[10px] text-[#988686]">
                    Click any angle slot to update photo URL or upload new image file.
                  </p>
                </div>
                <Badge variant="info">
                  {editImages.filter(img => img && img.trim().length > 0).length} / 4 Slots Filled
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
