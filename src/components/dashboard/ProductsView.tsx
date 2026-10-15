import React, { useState, useEffect, useRef } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Sparkles,
  ExternalLink,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Tag,
  Eye,
  Info,
  Layers,
  ShoppingBag,
  Send,
  X,
  Bot,
  Upload,
  UploadCloud,
  Link as LinkIcon,
  HelpCircle
} from 'lucide-react';
import { api } from '../../api';
import { Product } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';

interface ProductsViewProps {
  onNavigate?: (tab: string) => void;
}

const PRESET_CATEGORIES = [
  'Pants',
  'Shirts',
  'T-Shirts',
  'Watches',
  'Shoes',
  'Panjabi',
  'Accessories'
];

const PRESET_DEMO_IMAGES = [
  {
    name: 'Cargo Jogger Pant (Olive)',
    category: 'Pants',
    url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Slim Fit Denim Jeans (Blue)',
    category: 'Pants',
    url: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Formal Chino Pant (Grey)',
    category: 'Pants',
    url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Casual Cotton Oxford Shirt',
    category: 'Shirts',
    url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Smart Calling Watch',
    category: 'Watches',
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Luxury Steel Chronograph',
    category: 'Watches',
    url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80'
  }
];

export const ProductsView: React.FC<ProductsViewProps> = ({ onNavigate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    inStockCount: 0,
    lowStockCount: 0,
    outOfStockCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStockStatus, setSelectedStockStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showAiCatalogInfo, setShowAiCatalogInfo] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Pants');
  const [customCategory, setCustomCategory] = useState('');
  const [price, setPrice] = useState('');
  const [buyingPrice, setBuyingPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('25');
  const [currency, setCurrency] = useState('BDT');
  const [stockStatus, setStockStatus] = useState<'in_stock' | 'low_stock' | 'out_of_stock'>('in_stock');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageInputMethod, setImageInputMethod] = useState<'upload' | 'url' | 'presets'>('upload');
  const imageFileInputRef = useRef<HTMLInputElement | null>(null);
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      alert('Photo is too large. Please select an image under 10MB.');
      return;
    }

    setUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_DIMENSION = 900;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_DIMENSION) {
              height = Math.round((height * MAX_DIMENSION) / width);
              width = MAX_DIMENSION;
            }
          } else {
            if (height > MAX_DIMENSION) {
              width = Math.round((width * MAX_DIMENSION) / height);
              height = MAX_DIMENSION;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.82);
            setImageUrl(compressed);
          } else {
            setImageUrl(event.target?.result as string);
          }
          setUploadingImage(false);
        };
        img.onerror = () => {
          setImageUrl(event.target?.result as string);
          setUploadingImage(false);
        };
        img.src = event.target?.result as string;
      };
      reader.onerror = () => {
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Failed to read image file:', err);
      setUploadingImage(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.getProducts({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        stock_status: selectedStockStatus !== 'all' ? selectedStockStatus : undefined,
        search: searchQuery.trim() || undefined
      });
      setProducts(res.products || []);
      setStats(res.stats || { totalProducts: 0, inStockCount: 0, lowStockCount: 0, outOfStockCount: 0 });
      setCategories(res.categories || []);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to load products' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedStockStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName('');
    setCategory('Pants');
    setCustomCategory('');
    setPrice('');
    setBuyingPrice('');
    setStockQuantity('25');
    setCurrency('BDT');
    setStockStatus('in_stock');
    setImageUrl('');
    setDescription('');
    setKeywords('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    if (PRESET_CATEGORIES.includes(prod.category)) {
      setCategory(prod.category);
      setCustomCategory('');
    } else {
      setCategory('Custom');
      setCustomCategory(prod.category);
    }
    setPrice(String(prod.price));
    setBuyingPrice(typeof prod.buying_price === 'number' ? String(prod.buying_price) : '');
    setStockQuantity(typeof prod.stock_quantity === 'number' ? String(prod.stock_quantity) : '20');
    setCurrency(prod.currency || 'BDT');
    setStockStatus(prod.stock_status || 'in_stock');
    setImageUrl(prod.image_url || '');
    setDescription(prod.description || '');
    setKeywords((prod.keywords || []).join(', '));
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setStatusMessage({ type: 'error', text: 'Product name is required.' });
      return;
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid price.' });
      return;
    }

    const finalCategory = category === 'Custom' ? customCategory.trim() || 'General' : category;

    setIsSaving(true);
    try {
      const payload: Partial<Product> = {
        name: name.trim(),
        price: numPrice,
        buying_price: buyingPrice.trim() !== '' && !isNaN(Number(buyingPrice)) ? Number(buyingPrice) : undefined,
        stock_quantity: stockQuantity.trim() !== '' && !isNaN(Number(stockQuantity)) ? Math.max(0, Number(stockQuantity)) : undefined,
        currency: currency.toUpperCase().trim() || 'BDT',
        category: finalCategory,
        description: description.trim(),
        image_url: imageUrl.trim(),
        stock_status: stockStatus,
        keywords: keywords
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean)
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
        setStatusMessage({ type: 'success', text: `Product "${name}" updated successfully.` });
      } else {
        await api.createProduct(payload);
        setStatusMessage({ type: 'success', text: `Product "${name}" added to catalog.` });
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      console.error('Error saving product:', err);
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to save product.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    try {
      await api.deleteProduct(deleteCandidate.id);
      setStatusMessage({ type: 'success', text: `Product "${deleteCandidate.name}" removed.` });
      setDeleteCandidate(null);
      fetchProducts();
    } catch (err: any) {
      console.error('Error deleting product:', err);
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to delete product.' });
    }
  };

  const handleSeedSamples = async () => {
    setLoading(true);
    try {
      const res = await api.seedSampleProducts();
      setStatusMessage({ type: 'success', text: res.message || 'Sample products loaded!' });
      fetchProducts();
    } catch (err: any) {
      console.error('Error loading sample products:', err);
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to seed sample products.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#7F22FE]/10 text-[#7F22FE]">
              <Package className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
              Products & Catalog
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Add your store's clothing, pants, watches, and variants with photos and pricing. When customers ask for photos or prices, your AI will reply directly from this catalog.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAiCatalogInfo((prev) => !prev)}
            className="px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200/80 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            title="How AI uses your product catalog"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#7F22FE]" />
            <span>How AI Uses Catalog</span>
          </button>

          {products.length === 0 && (
            <button
              type="button"
              onClick={handleSeedSamples}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-amber-500/20"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Load Demo Products</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl bg-[#7F22FE] hover:bg-[#6c1bd9] text-white text-xs font-bold transition-all shadow-md shadow-[#7F22FE]/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Product</span>
          </button>
        </div>
      </div>

      {/* 2. Notification banner */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40'
          }`}
        >
          <span>{statusMessage.text}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-1">
            <span className="text-xs font-medium">Total Products</span>
            <Layers className="w-4 h-4 text-[#7F22FE]" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
            {stats.totalProducts}
          </p>
          <span className="text-[10px] text-neutral-400">In your AI Catalog</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-1">
            <span className="text-xs font-medium">In Stock</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {stats.inStockCount}
          </p>
          <span className="text-[10px] text-neutral-400">Ready to sell & ship</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-1">
            <span className="text-xs font-medium">Low Stock</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
            {stats.lowStockCount}
          </p>
          <span className="text-[10px] text-neutral-400">Limited inventory</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-1">
            <span className="text-xs font-medium">Out of Stock</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400">
            {stats.outOfStockCount}
          </p>
          <span className="text-[10px] text-neutral-400">AI informs customer</span>
        </div>
      </div>

      {/* 4. Collapsible AI Explanation Banner (Shown only when clicked) */}
      {showAiCatalogInfo && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#7F22FE]/10 via-purple-500/5 to-indigo-500/10 border border-[#7F22FE]/20 flex items-start justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[#7F22FE] text-white shrink-0 mt-0.5">
              <Bot className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <span>How Does the AI Use This Product Catalog?</span>
                <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-[#7F22FE]/20 text-[#7F22FE] font-mono">
                  Multimodal AI Engine
                </span>
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                • <strong>When a customer asks for photos &amp; prices:</strong> the AI searches your catalog and sends the exact photo and specs in chat.<br />
                • <strong>When a customer sends a product photo:</strong> the AI matches it with your catalog and confirms availability and pricing.<br />
                • <strong>Variant &amp; Size Matching:</strong> include sizes and colors in the description so the AI can recommend the right fit.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAiCatalogInfo(false)}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 5. Search, Filter & View Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product name, category, or keywords (e.g. pant, cargo, watch)..."
              className="w-full pl-9 pr-20 py-2 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7F22FE]"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-[#7F22FE] text-white text-[11px] font-bold cursor-pointer hover:bg-[#6c1bd9]"
            >
              Search
            </button>
          </form>

          {/* Stock Filter & View Toggle */}
          <div className="flex items-center gap-2">
            <select
              value={selectedStockStatus}
              onChange={(e) => setSelectedStockStatus(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 focus:outline-none cursor-pointer"
            >
              <option value="all">All Stock Status</option>
              <option value="in_stock">In Stock Only</option>
              <option value="low_stock">Low Stock Only</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>

            <button
              type="button"
              onClick={fetchProducts}
              className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 transition-colors cursor-pointer"
              title="Refresh Catalog"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[11px] text-neutral-400 font-medium mr-1 shrink-0">Category:</span>
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#7F22FE] text-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
            }`}
          >
            All Products
          </button>
          {Array.from(new Set([...PRESET_CATEGORIES, ...categories])).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-[#7F22FE] text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 6. Products Grid */}
      {loading ? (
        <div className="p-12 text-center text-neutral-400 space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#7F22FE]" />
          <p className="text-xs">Loading products catalog...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#7F22FE]/10 text-[#7F22FE] flex items-center justify-center mx-auto">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-800 dark:text-white">
              No products found in catalog
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mt-1">
              Add your pants, shirts, watches, or click below to instantly load demo items with photos and descriptions.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleSeedSamples}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load 6 Demo Products (Pants, Shirts, Watches)</span>
            </button>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl bg-[#7F22FE] hover:bg-[#6c1bd9] text-white text-xs font-bold transition-all shadow-md shadow-[#7F22FE]/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add First Product</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((prod) => (
            <div
              key={prod.id}
              className="group rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
            >
              {/* Product Image */}
              <div className="relative h-48 bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                {prod.image_url ? (
                  <img
                    src={prod.image_url}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400">
                    <ImageIcon className="w-8 h-8 mb-1" />
                    <span className="text-[11px]">No Image Provided</span>
                  </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-black/60 backdrop-blur-md text-white">
                    {prod.category}
                  </span>
                </div>

                {/* Stock Status Badge */}
                <div className="absolute top-2.5 right-2.5">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold backdrop-blur-md ${
                      prod.stock_status === 'in_stock'
                        ? 'bg-emerald-500/90 text-white'
                        : prod.stock_status === 'low_stock'
                        ? 'bg-amber-500/90 text-white'
                        : 'bg-rose-500/90 text-white'
                    }`}
                  >
                    {prod.stock_status === 'in_stock'
                      ? `In Stock (${prod.stock_quantity ?? 20})`
                      : prod.stock_status === 'low_stock'
                      ? `Low Stock (${prod.stock_quantity ?? 4})`
                      : 'Out of Stock (0)'}
                  </span>
                </div>
              </div>

              {/* Product Content */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white line-clamp-1">
                      {prod.name}
                    </h3>
                  </div>

                  <div className="mt-1 flex items-center justify-between gap-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-black text-[#7F22FE]">
                        ৳ {prod.price.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-semibold">
                        {prod.currency || 'BDT'}
                      </span>
                    </div>
                    {typeof prod.buying_price === 'number' && prod.buying_price > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200/70 dark:border-emerald-800/40">
                        Profit: ৳{(prod.price - prod.buying_price).toLocaleString()}/unit
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 line-clamp-2 leading-relaxed">
                    {prod.description || 'No description provided.'}
                  </p>

                  {/* Keywords */}
                  {prod.keywords && prod.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {prod.keywords.slice(0, 4).map((kw, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[10px] text-neutral-600 dark:text-neutral-400 font-medium"
                        >
                          #{kw}
                        </span>
                      ))}
                      {prod.keywords.length > 4 && (
                        <span className="text-[10px] text-neutral-400">
                          +{prod.keywords.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-neutral-400">
                    ৳{prod.price} BDT
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(prod)}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-800 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                      title="Edit Product"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteCandidate(prod)}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 7. Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#7F22FE]/10 text-[#7F22FE]">
                  <Package className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  {editingProduct ? 'Edit Product Details' : 'Add New Product to Catalog'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Product Name / Title *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Cargo Jogger Pant (Olive Green) or Rolex Submariner Watch"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7F22FE]"
                />
              </div>

              {/* Category, Stock Quantity & Stock Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7F22FE]"
                  >
                    {PRESET_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="Custom">+ Custom Category</option>
                  </select>
                  {category === 'Custom' && (
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Enter custom category..."
                      className="w-full mt-2 px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Stock Quantity (Units) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={stockQuantity}
                    onChange={(e) => {
                      const val = e.target.value;
                      setStockQuantity(val);
                      const num = Number(val);
                      if (!isNaN(num) && val !== '') {
                        if (num <= 0) setStockStatus('out_of_stock');
                        else if (num <= 5) setStockStatus('low_stock');
                        else setStockStatus('in_stock');
                      }
                    }}
                    placeholder="e.g. 50"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7F22FE]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Stock Availability *
                  </label>
                  <select
                    value={stockStatus}
                    onChange={(e) => {
                      const st = e.target.value as 'in_stock' | 'low_stock' | 'out_of_stock';
                      setStockStatus(st);
                      if (st === 'out_of_stock') setStockQuantity('0');
                      else if (st === 'low_stock' && Number(stockQuantity) > 5) setStockQuantity('4');
                      else if (st === 'in_stock' && Number(stockQuantity) <= 5) setStockQuantity('25');
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7F22FE]"
                  >
                    <option value="in_stock">🟢 In Stock (Available)</option>
                    <option value="low_stock">🟡 Low Stock (Few left)</option>
                    <option value="out_of_stock">🔴 Out of Stock</option>
                  </select>
                </div>
              </div>

              {/* Price, Buying Cost & Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Selling Price *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 1150"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7F22FE]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Buying Cost (For Net Profit Calculation)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={buyingPrice}
                    onChange={(e) => setBuyingPrice(e.target.value)}
                    placeholder="e.g. 650"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7F22FE]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Currency
                  </label>
                  <input
                    type="text"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    placeholder="BDT"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7F22FE]"
                  />
                </div>
              </div>

              {/* Image Input Options (Upload / Link / Preset) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Product Photo
                  </label>
                  <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-[11px] font-medium">
                    <button
                      type="button"
                      onClick={() => setImageInputMethod('upload')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                        imageInputMethod === 'upload'
                          ? 'bg-white dark:bg-neutral-700 text-[#7F22FE] shadow-xs font-bold'
                          : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                      }`}
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMethod('url')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                        imageInputMethod === 'url'
                          ? 'bg-white dark:bg-neutral-700 text-[#7F22FE] shadow-xs font-bold'
                          : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                      }`}
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>Paste URL</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMethod('presets')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                        imageInputMethod === 'presets'
                          ? 'bg-white dark:bg-neutral-700 text-[#7F22FE] shadow-xs font-bold'
                          : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Presets</span>
                    </button>
                  </div>
                </div>

                {/* Method 1: Local Device Upload */}
                {imageInputMethod === 'upload' && (
                  <div>
                    <input
                      ref={imageFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                    <div
                      onClick={() => imageFileInputRef.current?.click()}
                      className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-[#7F22FE] dark:hover:border-[#7F22FE] rounded-2xl p-5 text-center cursor-pointer transition-all bg-neutral-50 dark:bg-neutral-800/40 hover:bg-purple-50/20"
                    >
                      <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-[#7F22FE] flex items-center justify-center">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                        Click to select photo from Computer or Mobile
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-1">
                        JPG, PNG, WebP up to 10MB (Auto-compressed & saved)
                      </p>
                    </div>
                  </div>
                )}

                {/* Method 2: Paste URL */}
                {imageInputMethod === 'url' && (
                  <div className="space-y-2">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/product.jpg or ImgBB link..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7F22FE] text-xs font-mono"
                    />
                    <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-800 dark:text-blue-300 space-y-1">
                      <span className="font-bold flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5" />
                        Where to get a direct image link?
                      </span>
                      <p>
                        1. <b>Facebook Page or Website:</b> Right-click on any product image and select <i>"Copy Image Address"</i>, then paste it here.
                      </p>
                      <p>
                        2. <b>Free Image Host:</b> Upload your photo on <i>imgbb.com</i> or <i>postimages.org</i> and paste the direct image URL.
                      </p>
                    </div>
                  </div>
                )}

                {/* Method 3: Sample Presets */}
                {imageInputMethod === 'presets' && (
                  <div>
                    <span className="text-[11px] text-neutral-400 block mb-1.5">Click any sample product photo:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {PRESET_DEMO_IMAGES.map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setImageUrl(img.url);
                            if (!name) setName(img.name);
                            if (img.category) setCategory(img.category);
                          }}
                          className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                            imageUrl === img.url
                              ? 'border-[#7F22FE] bg-purple-50 dark:bg-purple-950/30'
                              : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 bg-white dark:bg-neutral-800'
                          }`}
                        >
                          <img
                            src={img.url}
                            alt={img.name}
                            className="w-full h-16 object-cover rounded-lg"
                          />
                          <span className="text-[10px] font-semibold text-neutral-700 dark:text-neutral-300 line-clamp-1">
                            {img.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preview Box */}
                {imageUrl && (
                  <div className="p-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-14 h-14 object-cover rounded-xl shrink-0 border border-neutral-200 dark:border-neutral-700"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="text-[11px] min-w-0">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Photo Attached & Ready
                        </span>
                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">
                          AI will send this exact image when customers inquire on Messenger, WhatsApp & IG.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="px-2 py-1 rounded-lg text-[11px] text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shrink-0 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Description & Sizes */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Product Details, Sizes & Fabric (AI Description) *
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Stretchable cotton twill fabric with 6 utility pockets. Available sizes: 30, 32, 34, 36. Colors: Olive Green, Black. 100% genuine quality."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7F22FE]"
                />
                <span className="text-[10px] text-neutral-400 block mt-0.5">
                  AI will use these details to answer questions regarding sizes, materials, colors, and features.
                </span>
              </div>

              {/* AI Keywords / Tags */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  AI Search Keywords / Tags (Comma-separated)
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="cargo, jogger, pant, olive, cotton, men"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7F22FE]"
                />
                <span className="text-[10px] text-neutral-400 block mt-0.5">
                  Bangla and English keywords help AI instantly match customer inquiries.
                </span>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-[#7F22FE] hover:bg-[#6c1bd9] text-white text-xs font-bold transition-all shadow-md shadow-[#7F22FE]/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{editingProduct ? 'Save Changes' : 'Add to Catalog'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. Delete Confirmation Modal */}
      {deleteCandidate && (
        <ConfirmModal
          isOpen={true}
          title="Delete Product from Catalog?"
          message={`Are you sure you want to remove "${deleteCandidate.name}"? AI will no longer recommend or quote this item.`}
          confirmText="Yes, Delete"
          cancelText="Cancel"
          confirmVariant="danger"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteCandidate(null)}
        />
      )}
    </div>
  );
};
