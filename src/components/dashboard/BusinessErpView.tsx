import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  ShoppingCart,
  Package,
  Wallet,
  FileText,
  PieChart,
  TrendingUp,
  Plus,
  Minus,
  Edit2,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Search,
  Printer,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Users,
  ShoppingBag,
  Clock,
  X
} from 'lucide-react';
import { api } from '../../api';
import {
  Product,
  Order,
  PurchaseRecord,
  DueRecord,
  AccountTransaction
} from '../../types';

type ErpSubTab = 'dashboard' | 'sales' | 'purchase' | 'stock' | 'due' | 'accounts';

export const BusinessErpView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ErpSubTab>('dashboard');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // ERP Summary State
  const [kpis, setKpis] = useState({
    totalSales: 0,
    totalPurchase: 0,
    totalDue: 0,
    customerDueTotal: 0,
    supplierDueTotal: 0,
    totalProducts: 0,
    totalStockUnits: 0,
    inStockCount: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    inStockPct: 70,
    lowStockPct: 20,
    outOfStockPct: 10
  });
  const [salesOverview, setSalesOverview] = useState<
    Array<{ label: string; sales: number; purchase: number }>
  >([]);
  const [topProducts, setTopProducts] = useState<
    Array<{
      id: string;
      name: string;
      category: string;
      price: number;
      stock_quantity: number;
      stock_status: string;
      soldQty: number;
      revenue: number;
    }>
  >([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [dues, setDues] = useState<DueRecord[]>([]);
  const [transactions, setTransactions] = useState<AccountTransaction[]>([]);
  const [cashbookSummary, setCashbookSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netCashBalance: 0
  });

  // Purchase Form State
  const [supplierName, setSupplierName] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [selectedProdId, setSelectedProdId] = useState('');
  const [customProdName, setCustomProdName] = useState('');
  const [purchaseQty, setPurchaseQty] = useState(10);
  const [unitCost, setUnitCost] = useState(550);
  const [paidAmount, setPaidAmount] = useState(5500);
  const [purchaseMethod, setPurchaseMethod] = useState<'cash' | 'bkash' | 'nagad' | 'bank'>('cash');
  const [submittingPurchase, setSubmittingPurchase] = useState(false);

  // Due Form State
  const [dueFilter, setDueFilter] = useState<'all' | 'customer' | 'supplier'>('all');
  const [partyType, setPartyType] = useState<'customer' | 'supplier'>('customer');
  const [partyName, setPartyName] = useState('');
  const [partyPhone, setPartyPhone] = useState('');
  const [dueDesc, setDueDesc] = useState('');
  const [dueTotalAmt, setDueTotalAmt] = useState(1500);
  const [duePaidAmt, setDuePaidAmt] = useState(0);
  const [submittingDue, setSubmittingDue] = useState(false);

  // Accounts Transaction Form State
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [txCategory, setTxCategory] = useState('Facebook Ads / Boost');
  const [txTitle, setTxTitle] = useState('');
  const [txAmount, setTxAmount] = useState(1000);
  const [txMethod, setTxMethod] = useState<'cash' | 'bkash' | 'nagad' | 'bank'>('bkash');
  const [submittingTx, setSubmittingTx] = useState(false);

  // Stock Filter & Add/Edit Product Modal State
  const [stockSearch, setStockSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [editingStockProduct, setEditingStockProduct] = useState<Product | null>(null);
  const [stockFormName, setStockFormName] = useState('');
  const [stockFormCategory, setStockFormCategory] = useState('General');
  const [stockFormBuyCost, setStockFormBuyCost] = useState('500');
  const [stockFormSellPrice, setStockFormSellPrice] = useState('950');
  const [stockFormQty, setStockFormQty] = useState('25');
  const [savingStockProduct, setSavingStockProduct] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const applySummary = (data: any) => {
    if (!data) return;
    if (data.kpis) setKpis(data.kpis);
    if (data.salesOverview) setSalesOverview(data.salesOverview);
    if (data.topProducts) setTopProducts(data.topProducts);
    if (data.recentOrders) setRecentOrders(data.recentOrders);
    if (data.products) setProducts(data.products);
    if (data.purchases) setPurchases(data.purchases);
    if (data.dues) setDues(data.dues);
    if (data.transactions) setTransactions(data.transactions);
    if (data.cashbookSummary) setCashbookSummary(data.cashbookSummary);
  };

  const loadErp = async () => {
    try {
      setLoading(true);
      const data = await api.getErpSummary();
      applySummary(data);
    } catch (err: any) {
      showToast(err?.message || 'Failed to load ERP data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadErp();
  }, []);

  const handleAddPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProdId && !customProdName.trim()) {
      showToast('Please select a product or enter a new product name.', 'error');
      return;
    }
    try {
      setSubmittingPurchase(true);
      const res = await api.createErpPurchase({
        supplier_name: supplierName.trim() || 'Wholesale Supplier',
        supplier_phone: supplierPhone.trim() || undefined,
        product_id: selectedProdId || undefined,
        product_name: customProdName.trim() || undefined,
        quantity: Number(purchaseQty) || 1,
        unit_cost: Number(unitCost) || 0,
        paid_amount: Number(paidAmount) || 0,
        payment_method: purchaseMethod
      });
      applySummary(res.summary);
      showToast(res.message || 'Stock purchase recorded!');
      setSupplierName('');
      setSupplierPhone('');
      setCustomProdName('');
    } catch (err: any) {
      showToast(err?.message || 'Failed to record purchase', 'error');
    } finally {
      setSubmittingPurchase(false);
    }
  };

  const handleQuickStockAdjust = async (prod: Product, delta: number) => {
    const current = prod.stock_quantity ?? 20;
    const next = Math.max(0, current + delta);
    try {
      const res = await api.updateErpStock(prod.id, { stock_quantity: next });
      applySummary(res.summary);
      showToast(res.message || 'Stock updated!');
    } catch (err: any) {
      showToast(err?.message || 'Failed to update stock', 'error');
    }
  };

  const handleOpenAddStockProduct = () => {
    setEditingStockProduct(null);
    setStockFormName('');
    setStockFormCategory('General');
    setStockFormBuyCost('550');
    setStockFormSellPrice('950');
    setStockFormQty('25');
    setIsStockModalOpen(true);
  };

  const handleOpenEditStockProduct = (prod: Product) => {
    setEditingStockProduct(prod);
    setStockFormName(prod.name);
    setStockFormCategory(prod.category || 'General');
    setStockFormBuyCost(String(prod.buying_price ?? Math.round((prod.price || 0) * 0.6)));
    setStockFormSellPrice(String(prod.price || 0));
    setStockFormQty(String(prod.stock_quantity ?? 20));
    setIsStockModalOpen(true);
  };

  const handleSaveStockProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockFormName.trim()) {
      showToast('Product name is required.', 'error');
      return;
    }
    setSavingStockProduct(true);
    try {
      const qtyNum = Math.max(0, Number(stockFormQty) || 0);
      const buyNum = Math.max(0, Number(stockFormBuyCost) || 0);
      const sellNum = Math.max(0, Number(stockFormSellPrice) || 0);

      if (editingStockProduct) {
        const res = await api.updateErpStock(editingStockProduct.id, {
          name: stockFormName.trim(),
          category: stockFormCategory.trim() || 'General',
          buying_price: buyNum,
          price: sellNum,
          stock_quantity: qtyNum
        });
        applySummary(res.summary);
        showToast(res.message || 'Product & Stock updated!');
      } else {
        await api.createProduct({
          name: stockFormName.trim(),
          category: stockFormCategory.trim() || 'General',
          buying_price: buyNum,
          price: sellNum,
          stock_quantity: qtyNum,
          stock_status: qtyNum <= 0 ? 'out_of_stock' : qtyNum <= 5 ? 'low_stock' : 'in_stock',
          currency: 'BDT',
          description: `${stockFormName.trim()} (${stockFormCategory.trim() || 'General'})`
        });
        await loadErp();
        showToast(`Added "${stockFormName.trim()}" (${qtyNum} pcs) to Stock & Product Catalog!`);
      }
      setIsStockModalOpen(false);
    } catch (err: any) {
      showToast(err?.message || 'Failed to save product', 'error');
    } finally {
      setSavingStockProduct(false);
    }
  };

  const handleDeleteStockProduct = async (prod: Product) => {
    try {
      const res = await api.deleteErpStock(prod.id);
      applySummary(res.summary);
      showToast(res.message || `Deleted "${prod.name}".`);
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete product', 'error');
    }
  };

  const handleAddDue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyName.trim() || !dueTotalAmt) return;
    try {
      setSubmittingDue(true);
      const res = await api.createErpDue({
        party_type: partyType,
        party_name: partyName.trim(),
        party_phone: partyPhone.trim() || undefined,
        description: dueDesc.trim() || 'Due Invoice',
        total_amount: Number(dueTotalAmt) || 0,
        paid_amount: Number(duePaidAmt) || 0
      });
      applySummary(res.summary);
      showToast(res.message || 'Due entry added!');
      setPartyName('');
      setPartyPhone('');
      setDueDesc('');
      setDuePaidAmt(0);
    } catch (err: any) {
      showToast(err?.message || 'Failed to add due record', 'error');
    } finally {
      setSubmittingDue(false);
    }
  };

  const handleSettleDue = async (due: DueRecord) => {
    try {
      const res = await api.settleErpDue(due.id, {
        amount: due.due_amount,
        payment_method: 'cash'
      });
      applySummary(res.summary);
      showToast(res.message || 'Due settled!');
    } catch (err: any) {
      showToast(err?.message || 'Failed to settle due', 'error');
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txTitle.trim() || !txAmount) return;
    try {
      setSubmittingTx(true);
      const res = await api.createErpTransaction({
        type: txType,
        category: txCategory,
        title: txTitle.trim(),
        amount: Number(txAmount) || 0,
        payment_method: txMethod
      });
      applySummary(res.summary);
      showToast(res.message || 'Transaction added!');
      setTxTitle('');
    } catch (err: any) {
      showToast(err?.message || 'Failed to add transaction', 'error');
    } finally {
      setSubmittingTx(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (stockFilter !== 'all' && p.stock_status !== stockFilter) return false;
    if (stockSearch.trim()) {
      const q = stockSearch.toLowerCase();
      return p.name.toLowerCase().includes(q) || (p.category && p.category.toLowerCase().includes(q));
    }
    return true;
  });

  const filteredDues = dues.filter((d) => {
    if (dueFilter === 'customer') return d.party_type === 'customer';
    if (dueFilter === 'supplier') return d.party_type === 'supplier';
    return true;
  });

  const maxChartVal = Math.max(
    10000,
    ...salesOverview.map((s) => Math.max(s.sales || 0, s.purchase || 0))
  );

  // SVG Donut Chart Circumference calculation
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const inStockLen = (kpis.inStockPct / 100) * circumference;
  const lowStockLen = (kpis.lowStockPct / 100) * circumference;
  const outStockLen = (kpis.outOfStockPct / 100) * circumference;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs sm:text-sm font-bold transition-all ${
            toast.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toast.text}</span>
        </div>
      )}

      {/* Top Header & Navigation Bar */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/90 dark:border-neutral-800 p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Smart Business Accounting, Stock &amp; Due ERP
              </h1>
              <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Auto-Synced with AI Orders
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-0.5">
              Complete Sales, Purchase, Live Stock Deduction, Customer &amp; Supplier Due Ledger, and Daily Cashbook in one system.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 text-slate-700 dark:text-neutral-200 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Financial Report
          </button>
          <button
            type="button"
            onClick={loadErp}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh System
          </button>
        </div>
      </div>

      {/* 6 Primary ERP Module Sub-Tabs (Matching the Reference Screenshot: Dashboard, Sales, Purchase, Stock, Due, Accounts & Reports) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-neutral-800 pb-3">
        {[
          { id: 'dashboard', label: 'ERP Dashboard', icon: BarChart3 },
          { id: 'sales', label: 'Sales Register', icon: TrendingUp },
          { id: 'purchase', label: 'Purchase & Suppliers', icon: ShoppingCart },
          { id: 'stock', label: `Stock / Inventory (${kpis.totalStockUnits})`, icon: Package },
          { id: 'due', label: `Due Ledger (৳${kpis.totalDue.toLocaleString()})`, icon: FileText },
          { id: 'accounts', label: 'Accounts & Reports', icon: Wallet }
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as ErpSubTab)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                active
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                  : 'bg-white dark:bg-neutral-900 text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 border border-slate-200/80 dark:border-neutral-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4 Top KPI Summary Cards (Always Visible Across ERP Modules — Matching the Screenshot!) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Sales */}
        <div
          onClick={() => setActiveTab('sales')}
          className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/90 dark:border-neutral-800 p-5 shadow-xs hover:border-emerald-400 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Sales
              </span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums mt-0.5">
                ৳ {kpis.totalSales.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold inline-flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +12% this month
            </span>
            <span className="text-slate-400">{recentOrders.length} active orders</span>
          </div>
        </div>

        {/* Card 2: Total Purchase */}
        <div
          onClick={() => setActiveTab('purchase')}
          className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/90 dark:border-neutral-800 p-5 shadow-xs hover:border-blue-400 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Purchase
              </span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums mt-0.5">
                ৳ {kpis.totalPurchase.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-blue-600 dark:text-blue-400 font-bold inline-flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> Stock &amp; Wholesale
            </span>
            <span className="text-slate-400">{purchases.length} purchase entries</span>
          </div>
        </div>

        {/* Card 3: Total Due */}
        <div
          onClick={() => setActiveTab('due')}
          className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/90 dark:border-neutral-800 p-5 shadow-xs hover:border-amber-400 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Due
              </span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums mt-0.5">
                ৳ {kpis.totalDue.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-amber-600 dark:text-amber-400 font-bold">
              Customer: ৳{kpis.customerDueTotal.toLocaleString()}
            </span>
            <span className="text-slate-400">
              Supplier: ৳{kpis.supplierDueTotal.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Card 4: Total Products & Stock */}
        <div
          onClick={() => setActiveTab('stock')}
          className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/90 dark:border-neutral-800 p-5 shadow-xs hover:border-purple-400 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Stock Units
              </span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums mt-0.5">
                {kpis.totalStockUnits.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-purple-600 dark:text-purple-400 font-bold">
              {kpis.totalProducts} catalog items
            </span>
            <span className="text-rose-500 font-semibold">
              {kpis.lowStockCount + kpis.outOfStockCount} low/out
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================================
          SUB-TAB 1: ERP DASHBOARD (Matches the Laptop Mockup in User's Image)
      ===================================================================== */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Row 1: Sales Overview Chart + Top Selling Products */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sales Overview Graph */}
            <div className="lg:col-span-7 bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/90 dark:border-neutral-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Sales vs Purchase Overview
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-neutral-400">
                    Monthly revenue &amp; inventory purchase comparison
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <span className="inline-flex items-center gap-1.5 text-blue-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Sales
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-emerald-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Purchase
                  </span>
                </div>
              </div>

              {/* Interactive Bar + Trend Visualization */}
              <div className="h-56 flex items-end justify-between gap-3 sm:gap-5 pt-6 px-2 border-b border-slate-100 dark:border-neutral-800">
                {salesOverview.map((point, i) => {
                  const salesH = Math.max(12, Math.round((point.sales / maxChartVal) * 165));
                  const purH = Math.max(8, Math.round((point.purchase / maxChartVal) * 165));
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="w-full flex items-end justify-center gap-1.5 h-44">
                        <div
                          style={{ height: `${salesH}px` }}
                          title={`Sales: BDT ${point.sales.toLocaleString()}`}
                          className="w-3.5 sm:w-5 rounded-t-lg bg-gradient-to-t from-blue-600 to-blue-400 transition-all group-hover:opacity-90"
                        />
                        <div
                          style={{ height: `${purH}px` }}
                          title={`Purchase: BDT ${point.purchase.toLocaleString()}`}
                          className="w-3.5 sm:w-5 rounded-t-lg bg-gradient-to-t from-emerald-500 to-teal-400 transition-all group-hover:opacity-90"
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-500 dark:text-neutral-400 pb-2">
                        {point.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Net Cash in Hand:{' '}
                  <strong className="text-emerald-600">
                    ৳ {cashbookSummary.netCashBalance.toLocaleString()}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('accounts')}
                  className="text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Open Full Cashbook &rarr;
                </button>
              </div>
            </div>

            {/* Top Selling Products */}
            <div className="lg:col-span-5 bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/90 dark:border-neutral-800 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Top Products
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-neutral-400">
                    Best selling items by quantity sold
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase">Qty Sold</span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-neutral-800">
                {topProducts.map((tp, idx) => {
                  const dotColors = [
                    'bg-emerald-500',
                    'bg-amber-500',
                    'bg-blue-500',
                    'bg-purple-500',
                    'bg-rose-500',
                    'bg-indigo-500'
                  ];
                  return (
                    <div
                      key={tp.id}
                      className="py-3 flex items-center justify-between gap-3 text-xs sm:text-sm"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            dotColors[idx % dotColors.length]
                          }`}
                        />
                        <div className="truncate">
                          <div className="font-bold text-slate-800 dark:text-white truncate">
                            {tp.name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Stock: {tp.stock_quantity} pcs • ৳{tp.price}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-neutral-800 font-extrabold text-slate-800 dark:text-white">
                          {tp.soldQty} pcs
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Row 2: Recent Orders + Stock Status Donut Chart (Matching the Reference Screenshot!) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Recent Orders */}
            <div className="lg:col-span-7 bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/90 dark:border-neutral-800 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Recent Orders &amp; Sales
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-neutral-400">
                    Auto-synced from WhatsApp, Messenger &amp; Website
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('sales')}
                  className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  View All Sales &rarr;
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 uppercase border-b border-slate-100 dark:border-neutral-800">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Items</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                    {recentOrders.slice(0, 6).map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/60 dark:hover:bg-neutral-800/40">
                        <td className="py-3 px-3 font-mono font-bold text-slate-600 dark:text-neutral-300">
                          #{ord.id.slice(-4).toUpperCase()}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                          {ord.customer_name}
                        </td>
                        <td className="py-3 px-3 text-slate-500 truncate max-w-[150px]">
                          {ord.items}
                        </td>
                        <td className="py-3 px-3 font-extrabold text-slate-900 dark:text-white">
                          ৳ {(ord.total_amount || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold capitalize ${
                              ord.status === 'delivered' || ord.status === 'confirmed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : ord.status === 'processing' || ord.status === 'shipped'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {ord.status === 'confirmed' ? 'Completed' : ord.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Stock Status Donut Chart */}
            <div className="lg:col-span-5 bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/90 dark:border-neutral-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Stock Status
                </h3>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  Real-time inventory health &amp; AI stock availability
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
                {/* SVG Donut */}
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-36 h-36 -rotate-90" viewBox="0 0 128 128">
                    <circle
                      cx="64"
                      cy="64"
                      r={radius}
                      fill="transparent"
                      stroke="#E2E8F0"
                      strokeWidth="14"
                    />
                    {/* In Stock (Green) */}
                    <circle
                      cx="64"
                      cy="64"
                      r={radius}
                      fill="transparent"
                      stroke="#10B981"
                      strokeWidth="14"
                      strokeDasharray={`${inStockLen} ${circumference}`}
                      strokeDashoffset={0}
                    />
                    {/* Low Stock (Amber) */}
                    <circle
                      cx="64"
                      cy="64"
                      r={radius}
                      fill="transparent"
                      stroke="#F59E0B"
                      strokeWidth="14"
                      strokeDasharray={`${lowStockLen} ${circumference}`}
                      strokeDashoffset={-inStockLen}
                    />
                    {/* Out of Stock (Red) */}
                    <circle
                      cx="64"
                      cy="64"
                      r={radius}
                      fill="transparent"
                      stroke="#EF4444"
                      strokeWidth="14"
                      strokeDasharray={`${outStockLen} ${circumference}`}
                      strokeDashoffset={-(inStockLen + lowStockLen)}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                      {kpis.totalStockUnits}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      Total Units
                    </span>
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-3 text-xs w-full sm:w-auto">
                  <div className="flex items-center justify-between gap-6">
                    <span className="flex items-center gap-2 font-bold text-slate-700 dark:text-neutral-200">
                      <span className="w-3 h-3 rounded-full bg-emerald-500" /> In Stock
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {kpis.inStockPct}% ({kpis.inStockCount})
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-6">
                    <span className="flex items-center gap-2 font-bold text-slate-700 dark:text-neutral-200">
                      <span className="w-3 h-3 rounded-full bg-amber-500" /> Low Stock
                    </span>
                    <span className="font-extrabold text-amber-600">
                      {kpis.lowStockPct}% ({kpis.lowStockCount})
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-6">
                    <span className="flex items-center gap-2 font-bold text-slate-700 dark:text-neutral-200">
                      <span className="w-3 h-3 rounded-full bg-rose-500" /> Out of Stock
                    </span>
                    <span className="font-extrabold text-rose-600">
                      {kpis.outOfStockPct}% ({kpis.outOfStockCount})
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('stock')}
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-neutral-200 transition-colors cursor-pointer"
              >
                Manage Stock Quantities &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-TAB 2: SALES REGISTER
      ===================================================================== */}
      {activeTab === 'sales' && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/90 dark:border-neutral-800 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Complete Sales Register (AI Chat + Website + Manual Orders)
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                Every confirmed order automatically adds to Total Sales and deducts from Stock Inventory.
              </p>
            </div>
            <div className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
              Total Sales Volume: ৳ {kpis.totalSales.toLocaleString()}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-neutral-800/60 text-slate-400 uppercase border-b border-slate-100 dark:border-neutral-800">
                <tr>
                  <th className="py-3 px-4">Invoice ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Sold Items &amp; Qty</th>
                  <th className="py-3 px-4">Total Bill</th>
                  <th className="py-3 px-4">Payment Status</th>
                  <th className="py-3 px-4">Order Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/70 dark:hover:bg-neutral-800/40">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      #{ord.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(ord.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {ord.customer_name}
                      </div>
                      <div className="text-[11px] text-slate-400">{ord.customer_phone || ord.platform}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-neutral-200">
                      {ord.items} <span className="text-slate-400">(Qty: {ord.quantity || 1})</span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">
                      ৳ {(ord.total_amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase ${
                          ord.payment_status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {ord.payment_status === 'paid' ? 'PAID' : 'DUE / COD'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 capitalize font-bold text-slate-700 dark:text-neutral-300">
                      {ord.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-TAB 3: PURCHASE & SUPPLIERS
      ===================================================================== */}
      {activeTab === 'purchase' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Add Purchase Form */}
          <form
            onSubmit={handleAddPurchase}
            className="lg:col-span-5 bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/90 dark:border-neutral-800 p-5 sm:p-6 shadow-xs space-y-4 h-fit"
          >
            <div className="border-b border-slate-100 dark:border-neutral-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Record Stock Purchase (Auto Stock +)
              </h3>
              <p className="text-xs text-slate-500">
                Adding a purchase automatically increases product stock and records supplier due if partially paid.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-neutral-300 mb-1">
                  Supplier Name *
                </label>
                <input
                  type="text"
                  required
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  placeholder="e.g., Dhaka Garments Wholesale"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-neutral-300 mb-1">
                  Supplier Phone
                </label>
                <input
                  type="text"
                  value={supplierPhone}
                  onChange={(e) => setSupplierPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block font-bold text-slate-700 dark:text-neutral-300 mb-1">
                Select Existing Product (to Auto-Increase Stock)
              </label>
              <select
                value={selectedProdId}
                onChange={(e) => {
                  setSelectedProdId(e.target.value);
                  const found = products.find((p) => p.id === e.target.value);
                  if (found) {
                    setUnitCost(found.buying_price || Math.round(found.price * 0.6));
                    setPaidAmount((found.buying_price || Math.round(found.price * 0.6)) * purchaseQty);
                  }
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
              >
                <option value="">-- Or Type New Product Below --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Current Stock: {p.stock_quantity ?? 20} pcs)
                  </option>
                ))}
              </select>
            </div>

            {!selectedProdId && (
              <div className="text-xs">
                <label className="block font-bold text-slate-700 dark:text-neutral-300 mb-1">
                  New Product Name *
                </label>
                <input
                  type="text"
                  value={customProdName}
                  onChange={(e) => setCustomProdName(e.target.value)}
                  placeholder="e.g., Premium Cotton Polo T-Shirt"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                />
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-neutral-300 mb-1">
                  Quantity (Pcs)
                </label>
                <input
                  type="number"
                  min={1}
                  value={purchaseQty}
                  onChange={(e) => {
                    const q = Number(e.target.value) || 1;
                    setPurchaseQty(q);
                    setPaidAmount(q * unitCost);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-neutral-300 mb-1">
                  Unit Cost (৳)
                </label>
                <input
                  type="number"
                  min={0}
                  value={unitCost}
                  onChange={(e) => {
                    const u = Number(e.target.value) || 0;
                    setUnitCost(u);
                    setPaidAmount(purchaseQty * u);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-neutral-300 mb-1">
                  Paid Now (৳)
                </label>
                <input
                  type="number"
                  min={0}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-bold"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-800 flex items-center justify-between text-xs">
              <span>
                Total Bill: <strong>৳ {(purchaseQty * unitCost).toLocaleString()}</strong>
              </span>
              <span className="text-amber-600 font-bold">
                Supplier Due: ৳ {Math.max(0, purchaseQty * unitCost - paidAmount).toLocaleString()}
              </span>
            </div>

            <button
              type="submit"
              disabled={submittingPurchase}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer disabled:opacity-50"
            >
              {submittingPurchase ? 'Recording Purchase...' : '+ Save Purchase & Add to Stock'}
            </button>
          </form>

          {/* Purchase History Table */}
          <div className="lg:col-span-7 bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/90 dark:border-neutral-800 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-neutral-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Purchase &amp; Supplier History ({purchases.length})
              </h3>
            </div>

            {purchases.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                No supplier purchases recorded yet. Use the form on the left to add stock purchases.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-neutral-800/60 text-slate-400 uppercase border-b border-slate-100 dark:border-neutral-800">
                    <tr>
                      <th className="py-3 px-4">Supplier</th>
                      <th className="py-3 px-4">Product &amp; Qty</th>
                      <th className="py-3 px-4">Total Cost</th>
                      <th className="py-3 px-4">Paid / Due</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                    {purchases.map((pur) => (
                      <tr key={pur.id}>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {pur.supplier_name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {new Date(pur.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800 dark:text-neutral-200">
                            {pur.product_name}
                          </div>
                          <div className="text-[11px] text-emerald-600 font-semibold">
                            +{pur.quantity} pcs added (৳{pur.unit_cost}/pc)
                          </div>
                        </td>
                        <td className="py-3 px-4 font-extrabold text-slate-900 dark:text-white">
                          ৳ {pur.total_cost.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-emerald-600 font-bold">
                            Paid: ৳{pur.paid_amount.toLocaleString()}
                          </div>
                          {pur.due_amount > 0 && (
                            <div className="text-rose-600 font-bold">
                              Due: ৳{pur.due_amount.toLocaleString()}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={async () => {
                              const res = await api.deleteErpPurchase(pur.id);
                              applySummary(res.summary);
                              showToast('Purchase entry deleted.');
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-TAB 4: STOCK / INVENTORY MANAGER
      ===================================================================== */}
      {activeTab === 'stock' && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/90 dark:border-neutral-800 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Live Stock &amp; Inventory Control (Synced with Products &amp; Store)
              </h3>
              <p className="text-xs text-slate-500">
                100% synced with your Products &amp; Store catalog. Add, edit, or delete products and stock quantities directly here.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(['all', 'in_stock', 'low_stock', 'out_of_stock'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStockFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize cursor-pointer ${
                    stockFilter === st
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300'
                  }`}
                >
                  {st.replace(/_/g, ' ')}
                </button>
              ))}

              <button
                type="button"
                onClick={handleOpenAddStockProduct}
                className="px-3.5 py-1.5 rounded-xl bg-[#7F22FE] hover:bg-[#6c1bd9] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Product / Stock</span>
              </button>
            </div>
          </div>

          <div className="p-4 border-b border-slate-100 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={stockSearch}
                onChange={(e) => setStockSearch(e.target.value)}
                placeholder="Search product name or category..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-neutral-700 text-xs"
              />
            </div>
            <div className="text-xs text-slate-500 font-semibold">
              Showing <strong className="text-slate-900 dark:text-white">{filteredProducts.length}</strong> product(s) in your catalog
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-neutral-800 text-slate-400 flex items-center justify-center mx-auto">
                <Package className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-white">
                No products in your stock catalog yet
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Any product you add here or in <strong>Products &amp; Store</strong> will appear here with real-time stock tracking.
              </p>
              <button
                type="button"
                onClick={handleOpenAddStockProduct}
                className="px-4 py-2 rounded-xl bg-[#7F22FE] hover:bg-[#6c1bd9] text-white text-xs font-bold shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add First Product &amp; Stock</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-neutral-800/60 text-slate-400 uppercase border-b border-slate-100 dark:border-neutral-800">
                  <tr>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Buying Cost</th>
                    <th className="py-3 px-4">Selling Price</th>
                    <th className="py-3 px-4">Stock Value</th>
                    <th className="py-3 px-4">Stock Status</th>
                    <th className="py-3 px-4 text-right">Quick Stock Adjust &amp; Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                  {filteredProducts.map((prod) => {
                    const qty = prod.stock_quantity ?? 20;
                    const buyCost = prod.buying_price ?? Math.round((prod.price || 0) * 0.6);
                    return (
                      <tr key={prod.id} className="hover:bg-slate-50/60 dark:hover:bg-neutral-800/40">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">{prod.name}</div>
                          <div className="text-[11px] text-slate-400">{prod.category}</div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-600 dark:text-neutral-300 whitespace-nowrap">
                          ৳ {buyCost.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          ৳ {(prod.price || 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-blue-600 whitespace-nowrap">
                          ৳ {(qty * (prod.price || 0)).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap ${
                              prod.stock_status === 'in_stock'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : prod.stock_status === 'low_stock'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {qty} pcs ({prod.stock_status.replace(/_/g, ' ').toUpperCase()})
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleQuickStockAdjust(prod, -1)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-neutral-800 hover:bg-rose-100 text-slate-700 dark:text-neutral-200 cursor-pointer"
                              title="Deduct 1 unit"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-10 text-center font-extrabold text-slate-900 dark:text-white">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuickStockAdjust(prod, 1)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-neutral-800 hover:bg-emerald-100 text-slate-700 dark:text-neutral-200 cursor-pointer"
                              title="Add 1 unit"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickStockAdjust(prod, 10)}
                              className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-[11px] hover:bg-blue-100 cursor-pointer"
                              title="Add 10 units"
                            >
                              +10
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditStockProduct(prod)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-neutral-800 hover:bg-purple-100 text-slate-600 hover:text-[#7F22FE] cursor-pointer ml-1"
                              title="Edit Product Name, Price & Stock"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteStockProduct(prod)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-neutral-800 hover:bg-rose-100 text-rose-500 hover:text-rose-700 cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          SUB-TAB 5: DUE LEDGER (CUSTOMER RECEIVABLE & SUPPLIER PAYABLE)
      ===================================================================== */}
      {activeTab === 'due' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Add Due Form */}
          <form
            onSubmit={handleAddDue}
            className="lg:col-span-4 bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/90 dark:border-neutral-800 p-5 sm:p-6 shadow-xs space-y-4 h-fit"
          >
            <div className="border-b border-slate-100 dark:border-neutral-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Add New Due Entry (Digital Due Book)
              </h3>
              <p className="text-xs text-slate-500">
                Track money owed by customers or payable to suppliers.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPartyType('customer')}
                className={`py-2 rounded-xl font-bold border cursor-pointer ${
                  partyType === 'customer'
                    ? 'bg-amber-50 border-amber-400 text-amber-800'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                Customer Due (Receivable)
              </button>
              <button
                type="button"
                onClick={() => setPartyType('supplier')}
                className={`py-2 rounded-xl font-bold border cursor-pointer ${
                  partyType === 'supplier'
                    ? 'bg-purple-50 border-purple-400 text-purple-800'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                Supplier Due (Payable)
              </button>
            </div>

            <div className="text-xs">
              <label className="block font-bold text-slate-700 dark:text-neutral-300 mb-1">
                {partyType === 'customer' ? 'Customer Name *' : 'Supplier Name *'}
              </label>
              <input
                type="text"
                required
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                placeholder="Enter name..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-neutral-700"
              />
            </div>

            <div className="text-xs">
              <label className="block font-bold text-slate-700 dark:text-neutral-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={partyPhone}
                onChange={(e) => setPartyPhone(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-neutral-700"
              />
            </div>

            <div className="text-xs">
              <label className="block font-bold text-slate-700 dark:text-neutral-300 mb-1">
                Items / Reason
              </label>
              <input
                type="text"
                value={dueDesc}
                onChange={(e) => setDueDesc(e.target.value)}
                placeholder="e.g., 3x Panjabi Order Due"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-neutral-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-neutral-300 mb-1">
                  Total Bill (৳) *
                </label>
                <input
                  type="number"
                  required
                  value={dueTotalAmt}
                  onChange={(e) => setDueTotalAmt(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-neutral-700 font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-neutral-300 mb-1">
                  Advance Paid (৳)
                </label>
                <input
                  type="number"
                  value={duePaidAmt}
                  onChange={(e) => setDuePaidAmt(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-neutral-700 font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingDue}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
            >
              {submittingDue ? 'Saving...' : '+ Add to Due Ledger'}
            </button>
          </form>

          {/* Due Ledger Table */}
          <div className="lg:col-span-8 bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/90 dark:border-neutral-800 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Active Due Ledger (Auto COD Orders + Manual Dues)
                </h3>
                <p className="text-xs text-slate-500">
                  Click &ldquo;Collect / Settle&rdquo; when payment is received to mark as Paid and add to Cashbook.
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                {(['all', 'customer', 'supplier'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setDueFilter(f)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize cursor-pointer ${
                      dueFilter === f
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-100 dark:bg-neutral-800 text-slate-600'
                    }`}
                  >
                    {f === 'all' ? 'All Dues' : f === 'customer' ? 'Customer Receivable' : 'Supplier Payable'}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-neutral-800/60 text-slate-400 uppercase border-b border-slate-100 dark:border-neutral-800">
                  <tr>
                    <th className="py-3 px-4">Customer / Supplier</th>
                    <th className="py-3 px-4">Details</th>
                    <th className="py-3 px-4">Due Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                  {filteredDues.map((due) => (
                    <tr key={due.id}>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{due.party_name}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              due.party_type === 'customer'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-purple-50 text-purple-700'
                            }`}
                          >
                            {due.party_type}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">{due.party_phone || 'No phone'}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-neutral-300">
                        {due.description}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-rose-600">
                          ৳ {(due.due_amount || 0).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Total: ৳{due.total_amount.toLocaleString()}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase ${
                            due.status === 'settled'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {due.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {due.status !== 'settled' && (
                          <button
                            type="button"
                            onClick={() => handleSettleDue(due)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer"
                          >
                            ✓ Collect / Settle
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-TAB 6: ACCOUNTS CASHBOOK & FINANCIAL REPORTS
      ===================================================================== */}
      {activeTab === 'accounts' && (
        <div className="space-y-6">
          {/* 3 Cashbook Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 rounded-2xl p-5">
              <span className="text-xs font-bold uppercase text-emerald-700">
                Total Cash In (Paid Sales + Income)
              </span>
              <div className="text-2xl font-extrabold text-emerald-800 dark:text-emerald-300 mt-1">
                ৳ {cashbookSummary.totalIncome.toLocaleString()}
              </div>
            </div>
            <div className="bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 rounded-2xl p-5">
              <span className="text-xs font-bold uppercase text-rose-700">
                Total Cash Out (Purchases + Expenses)
              </span>
              <div className="text-2xl font-extrabold text-rose-800 dark:text-rose-300 mt-1">
                ৳ {cashbookSummary.totalExpense.toLocaleString()}
              </div>
            </div>
            <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 rounded-2xl p-5">
              <span className="text-xs font-bold uppercase text-blue-700">
                Net Cash Balance / Profit
              </span>
              <div className="text-2xl font-extrabold text-blue-900 dark:text-blue-200 mt-1">
                ৳ {cashbookSummary.netCashBalance.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Add Expense / Income Form */}
            <form
              onSubmit={handleAddTransaction}
              className="lg:col-span-4 bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/90 dark:border-neutral-800 p-5 sm:p-6 shadow-xs space-y-4 h-fit"
            >
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-slate-100 pb-3">
                Log Daily Income or Expense
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setTxType('expense');
                    setTxCategory('Facebook Ads / Boost');
                  }}
                  className={`py-2 rounded-xl font-bold border cursor-pointer ${
                    txType === 'expense'
                      ? 'bg-rose-50 border-rose-400 text-rose-700'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  - Expense (Cash Out)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTxType('income');
                    setTxCategory('Product Sales');
                  }}
                  className={`py-2 rounded-xl font-bold border cursor-pointer ${
                    txType === 'income'
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  + Income (Cash In)
                </button>
              </div>

              <div className="text-xs">
                <label className="block font-bold text-slate-700 mb-1">Account Category</label>
                <select
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  {txType === 'expense' ? (
                    <>
                      <option value="Facebook Ads / Boost">Facebook Ads / Boost</option>
                      <option value="Shop / Office Rent">Shop / Office Rent</option>
                      <option value="Staff Salary">Staff Salary</option>
                      <option value="Courier & Packaging">Courier &amp; Packaging</option>
                      <option value="Utility & Internet">Utility &amp; Internet Bill</option>
                      <option value="Other Expense">Other Expense</option>
                    </>
                  ) : (
                    <>
                      <option value="Product Sales">Direct / Offline Product Sale</option>
                      <option value="Due Collection">Customer Due Collection</option>
                      <option value="Other Income">Other Business Income</option>
                    </>
                  )}
                </select>
              </div>

              <div className="text-xs">
                <label className="block font-bold text-slate-700 mb-1">Description / Title *</label>
                <input
                  type="text"
                  required
                  value={txTitle}
                  onChange={(e) => setTxTitle(e.target.value)}
                  placeholder="e.g., Weekly Facebook Page Boost"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount (৳) *</label>
                  <input
                    type="number"
                    required
                    value={txAmount}
                    onChange={(e) => setTxAmount(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={txMethod}
                    onChange={(e) => setTxMethod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="cash">Cash</option>
                    <option value="bkash">bKash</option>
                    <option value="nagad">Nagad</option>
                    <option value="bank">Bank</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingTx}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold cursor-pointer"
              >
                {submittingTx ? 'Saving...' : 'Save to Accounts Cashbook'}
              </button>
            </form>

            {/* Transactions Ledger */}
            <div className="lg:col-span-8 bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/90 dark:border-neutral-800 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-neutral-800">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Accounts Cashbook Transactions ({transactions.length})
                </h3>
              </div>

              {transactions.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400">
                  No manual cashbook entries yet. Add your daily expenses (Ad Boost, Rent, Packaging) or offline sales on the left.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-400 uppercase border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Title &amp; Category</th>
                        <th className="py-3 px-4">Method</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transactions.map((tx) => (
                        <tr key={tx.id}>
                          <td className="py-3 px-4 text-slate-500">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{tx.title}</div>
                            <div className="text-[11px] text-slate-400">{tx.category}</div>
                          </td>
                          <td className="py-3 px-4 uppercase font-semibold text-slate-600">
                            {tx.payment_method}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`font-extrabold ${
                                tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              {tx.type === 'income' ? '+' : '-'} ৳ {tx.amount.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={async () => {
                                const res = await api.deleteErpTransaction(tx.id);
                                applySummary(res.summary);
                                showToast('Transaction deleted.');
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product & Stock Modal */}
      {isStockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-neutral-800 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {editingStockProduct ? 'Edit Product & Stock' : 'Add New Product & Stock'}
              </h3>
              <button
                type="button"
                onClick={() => setIsStockModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveStockProduct} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-neutral-300 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={stockFormName}
                  onChange={(e) => setStockFormName(e.target.value)}
                  placeholder="e.g., Cargo Jogger Pant"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-neutral-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={stockFormCategory}
                    onChange={(e) => setStockFormCategory(e.target.value)}
                    placeholder="e.g., Pants, Watches"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-neutral-300 mb-1">
                    Stock Quantity (Pcs) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stockFormQty}
                    onChange={(e) => setStockFormQty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-neutral-300 mb-1">
                    Buying Cost / Unit (৳) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stockFormBuyCost}
                    onChange={(e) => setStockFormBuyCost(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-neutral-300 mb-1">
                    Selling Price / Unit (৳) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stockFormSellPrice}
                    onChange={(e) => setStockFormSellPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsStockModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingStockProduct}
                  className="px-4 py-2 rounded-xl bg-[#7F22FE] hover:bg-[#6c1bd9] text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {savingStockProduct ? 'Saving...' : editingStockProduct ? 'Save Changes' : '+ Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
