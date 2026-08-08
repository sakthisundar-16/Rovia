import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit, Tag, Layers, Search, CheckCircle2, Upload, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
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
  
  // Image Upload / Link Mode
  const [imageInputType, setImageInputType] = useState<'URL' | 'UPLOAD'>('URL');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');

  const loadProducts = () => {
    api.getProducts().then((data) => setProducts(data));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        setImageUrl(reader.result as string);
        showToast('Image Loaded Successfully', 'File converted to base64 preview format.', 'success');
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

    const finalImage = imageUrl.trim() || FALLBACK_IMAGE;

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
      image: finalImage,
      gallery: [finalImage],
      description: description || `Universal rental item under ${category}`,
      specs: { Category: category, SKU: sku },
      variants: ['Standard Rental Package'],
    });

    // Update state immediately so user sees the newly created product
    setProducts((prev) => [created, ...prev]);

    showToast('Universal Rental SKU Created!', `${name} added to live catalog & inventory.`, 'success');
    setShowAddModal(false);
    
    // Reset Form
    setName('');
    setSku('');
    setBrand('');
    setDescription('');
    setImageUrl('');
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
        <Button size="sm" variant="outline" leftIcon={<Edit className="w-3.5 h-3.5" />} onClick={() => showToast('Edit Product', `Editing ${r.name}`, 'info')}>
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

          {/* Product Image Selection Mode: Direct Upload vs Link URL */}
          <div className="space-y-2 border-t border-[#988686]/20 pt-3">
            <label className="font-semibold text-[#5C4E4E] dark:text-[#B5A9A9] uppercase block">
              Product Image Attachment (Link URL or File Upload)
            </label>
            <div className="flex items-center gap-2 p-1 rounded-xl bg-[#988686]/15 max-w-xs">
              <button
                type="button"
                onClick={() => setImageInputType('URL')}
                className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  imageInputType === 'URL' ? 'bg-[#000000] dark:bg-[#988686] text-white' : 'text-[#5C4E4E] dark:text-[#B5A9A9]'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" /> Image Link URL
              </button>
              <button
                type="button"
                onClick={() => setImageInputType('UPLOAD')}
                className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  imageInputType === 'UPLOAD' ? 'bg-[#000000] dark:bg-[#988686] text-white' : 'text-[#5C4E4E] dark:text-[#B5A9A9]'
                }`}
              >
                <Upload className="w-3.5 h-3.5" /> Direct File Upload
              </button>
            </div>

            {imageInputType === 'URL' ? (
              <Input
                label="Paste Any Image Web Address (URL)"
                placeholder="https://images.unsplash.com/... or https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            ) : (
              <FileUpload label="Select Image File from Computer" onFileSelect={handleFileUpload} />
            )}

            {/* Live Image Preview Box */}
            <div className="mt-2 p-3 rounded-xl glass-panel border border-[#988686]/30 flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-black/50 shrink-0 border border-[#988686]/40">
                <img
                  src={imageUrl || FALLBACK_IMAGE}
                  alt="Product Preview"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-xs">
                <span className="font-bold text-[#000000] dark:text-white block">Image Live Preview</span>
                <p className="text-[10px] text-[#988686] line-clamp-1 truncate max-w-xs">{imageUrl || 'Default Fallback Image'}</p>
                <span className="text-[10px] text-[#5E7A63] font-semibold mt-0.5 block">✓ Image ready for catalog</span>
              </div>
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
    </div>
  );
};
