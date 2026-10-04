import React, { useState, useEffect } from 'react';
import {
  Globe,
  ShoppingBag,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  Power,
  Sparkles,
  Lock,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Zap,
  HelpCircle,
  Shield
} from 'lucide-react';
import { StoreIntegration, SubscriptionStatusInfo, Order } from '../../types';
import { api } from '../../api';
import { ConfirmModal } from '../common/ConfirmModal';

interface StoresViewProps {
  subStatus: SubscriptionStatusInfo | null;
  onUpgradeToPro?: () => void;
  onNavigateToOrders?: () => void;
}

export const StoresView: React.FC<StoresViewProps> = ({
  subStatus,
  onUpgradeToPro,
  onNavigateToOrders
}) => {
  const [stores, setStores] = useState<StoreIntegration[]>([]);
  const [stats, setStats] = useState({
    totalStores: 0,
    activeStores: 0,
    totalSyncedOrders: 0,
    totalRevenueSynced: 0
  });
  const [loading, setLoading] = useState(true);
  const [isProPlan, setIsProPlan] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [copiedStoreId, setCopiedStoreId] = useState<string | null>(null);
  const [syncingStoreId, setSyncingStoreId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [storeToDelete, setStoreToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeletingStore, setIsDeletingStore] = useState(false);

  // Form State for Connecting Store
  const [platform, setPlatform] = useState<'shopify' | 'woocommerce' | 'custom_website'>('shopify');
  const [storeName, setStoreName] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      setLoading(true);
      const res = await api.getStores();
      setStores(res.stores || []);
      setIsProPlan(res.isProPlan || Boolean(subStatus?.isProPlan));
      setStats(res.stats || {
        totalStores: res.stores?.length || 0,
        activeStores: res.stores?.filter(s => s.is_active).length || 0,
        totalSyncedOrders: res.stores?.reduce((acc, s) => acc + (s.synced_orders_count || 0), 0) || 0,
        totalRevenueSynced: res.stores?.reduce((acc, s) => acc + (s.total_revenue_synced || 0), 0) || 0
      });
    } catch (err: any) {
      console.error('Error fetching stores:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) {
      setActionError('Please enter a store name');
      return;
    }

    try {
      setSubmitting(true);
      setActionError(null);
      const res = await api.connectStore({
        platform,
        store_name: storeName.trim(),
        store_url: storeUrl.trim(),
        api_key: apiKey.trim()
      });

      setShowAddModal(false);
      setStoreName('');
      setStoreUrl('');
      setApiKey('');
      setActionSuccess(res.message || 'Store connected successfully!');
      setTimeout(() => setActionSuccess(null), 4000);
      await loadStores();
    } catch (err: any) {
      if (err.message?.includes('Pro Plan') || err.message?.includes('PRO_PLAN_REQUIRED')) {
        setShowAddModal(false);
        setShowUpgradeModal(true);
      } else {
        setActionError(err.message || 'Failed to connect store');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStore = async (store: StoreIntegration) => {
    try {
      await api.updateStore(store.id, { is_active: !store.is_active });
      await loadStores();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update store status');
    }
  };

  const handlePromptDeleteStore = (id: string, name: string) => {
    setStoreToDelete({ id, name });
  };

  const handleConfirmDeleteStore = async () => {
    if (!storeToDelete) return;
    try {
      setIsDeletingStore(true);
      await api.deleteStore(storeToDelete.id);
      await loadStores();
      setActionSuccess(`Store "${storeToDelete.name}" disconnected successfully`);
      setTimeout(() => setActionSuccess(null), 3000);
      setStoreToDelete(null);
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete store');
    } finally {
      setIsDeletingStore(false);
    }
  };

  const handleTestSync = async (store: StoreIntegration) => {
    try {
      setSyncingStoreId(store.id);
      setActionError(null);
      const res = await api.testStoreSync(store.id);
      setActionSuccess(`Order #${res.order.id.slice(-6).toUpperCase()} synced live from ${store.store_name} into Orders Hub!`);
      setTimeout(() => setActionSuccess(null), 5000);
      await loadStores();
    } catch (err: any) {
      setActionError(err.message || 'Failed to sync store order');
    } finally {
      setSyncingStoreId(null);
    }
  };

  const handleCopyWebhook = (storeId: string) => {
    const webhookUrl = `${window.location.origin}/api/stores/webhooks/${storeId}`;
    navigator.clipboard.writeText(webhookUrl);
    setCopiedStoreId(storeId);
    setTimeout(() => setCopiedStoreId(null), 2500);
  };

  const handleQuickUpgrade = () => {
    setShowUpgradeModal(false);
    if (onUpgradeToPro) {
      onUpgradeToPro();
    }
  };

  const isUserPro = true;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                Website & Store Integrations
              </h1>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Connect Shopify, WordPress WooCommerce, or any custom website to sync orders directly into your centralized Orders Hub.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onNavigateToOrders && (
            <button
              onClick={onNavigateToOrders}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 text-neutral-700 dark:text-neutral-200 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              View Orders Hub
            </button>
          )}

          <button
            onClick={() => {
              if (isUserPro) {
                setShowAddModal(true);
              } else {
                setShowUpgradeModal(true);
              }
            }}
            className="px-4 py-2 rounded-xl bg-[#7F22FE] hover:bg-[#6c1ce0] text-white text-xs font-bold transition-all shadow-md shadow-[#7F22FE]/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Connect Store
          </button>

          <button
            onClick={() => loadStores()}
            title="Reload Stores"
            className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Pro Plan Gate Warning Banner for Non-Pro Users */}
      {!isUserPro && (
        <div className="p-4 rounded-2xl bg-[#7F22FE]/5 border border-[#7F22FE]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#7F22FE]/15 text-[#7F22FE] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-neutral-900 dark:text-white flex items-center gap-1.5">
                Pro Business Exclusive Feature
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#7F22FE]/15 text-[#7F22FE]">
                  Preview Mode
                </span>
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5">
                You can explore store integrations and view sample synced data. Upgrade to the Pro Business Plan (1,599 BDT) to connect your live store and auto-sync orders.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="px-4 py-2 rounded-xl bg-[#7F22FE] hover:bg-[#6c1ce0] text-white text-xs font-black transition-all shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-current" />
            Upgrade to Pro
          </button>
        </div>
      )}

      {/* Toast notifications */}
      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-[#7F22FE]/10 border border-[#7F22FE]/20 text-[#7F22FE] text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#7F22FE] shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Connected Stores</span>
            <div className="w-8 h-8 rounded-lg bg-[#7F22FE]/10 text-[#7F22FE] flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-neutral-900 dark:text-white">
            {stats.totalStores}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {stats.activeStores} active & listening for webhooks
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Orders Synced</span>
            <div className="w-8 h-8 rounded-lg bg-[#7F22FE]/10 text-[#7F22FE] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-neutral-900 dark:text-white">
            {stats.totalSyncedOrders}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Sent to Confirmed Orders Hub
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Revenue Synced</span>
            <div className="w-8 h-8 rounded-lg bg-[#7F22FE]/10 text-[#7F22FE] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-neutral-900 dark:text-white">
            BDT {stats.totalRevenueSynced.toLocaleString()}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Gross sales from online stores
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Supported Platforms</span>
            <div className="w-8 h-8 rounded-lg bg-[#7F22FE]/10 text-[#7F22FE] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-black text-neutral-900 dark:text-white pt-1">
            Shopify • WooCommerce • Webhooks
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Real-time webhook synchronization
          </div>
        </div>
      </div>

      {/* Stores List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-wider">
            Your Connected E-Commerce Stores ({stores.length})
          </h3>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Orders from these stores appear automatically in your Orders Hub with the "Website" badge.
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <RefreshCw className="w-7 h-7 text-violet-500 animate-spin mx-auto mb-2" />
            <p className="text-xs text-neutral-500">Loading connected stores...</p>
          </div>
        ) : stores.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto mb-3">
              <Globe className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-neutral-900 dark:text-white">
              No store connected yet
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mt-1">
              Add your Shopify store or WordPress / WooCommerce website to have all orders automatically flow into One Agent BD.
            </p>
            <button
              onClick={() => (isUserPro ? setShowAddModal(true) : setShowUpgradeModal(true))}
              className="mt-4 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-md shadow-violet-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Connect Your First Store
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {stores.map((store) => {
              const webhookUrl = `${window.location.origin}/api/stores/webhooks/${store.id}`;
              const isSyncing = syncingStoreId === store.id;

              return (
                <div
                  key={store.id}
                  className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm ${
                            store.platform === 'shopify'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : store.platform === 'woocommerce'
                              ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                              : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                          }`}
                        >
                          {store.platform === 'shopify'
                            ? 'SHOPIFY'
                            : store.platform === 'woocommerce'
                            ? 'WOO'
                            : 'WEB'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-sm text-neutral-900 dark:text-white">
                              {store.store_name}
                            </h4>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                store.is_active
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'
                              }`}
                            >
                              {store.is_active ? 'ACTIVE' : 'PAUSED'}
                            </span>
                          </div>
                          {store.store_url && (
                            <a
                              href={store.store_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-neutral-500 hover:text-violet-600 flex items-center gap-1 mt-0.5 hover:underline"
                            >
                              <span className="truncate max-w-[200px]">{store.store_url}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleStore(store)}
                          title={store.is_active ? 'Pause store listening' : 'Resume store listening'}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            store.is_active
                              ? 'border-neutral-200 dark:border-neutral-700 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                              : 'border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handlePromptDeleteStore(store.id, store.store_name)}
                          title="Disconnect Store"
                          className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Metrics row */}
                    <div className="grid grid-cols-2 gap-2 mt-4 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800/80 text-xs">
                      <div>
                        <span className="text-neutral-400 text-[11px] block">Synced Orders</span>
                        <span className="font-bold text-neutral-900 dark:text-white text-sm">
                          {store.synced_orders_count || 0} orders
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-400 text-[11px] block">Revenue Logged</span>
                        <span className="font-bold text-neutral-900 dark:text-white text-sm">
                          BDT {(store.total_revenue_synced || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Webhook Endpoint Box */}
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-neutral-500">
                        <span className="font-semibold">Live Webhook Endpoint URL:</span>
                        <button
                          onClick={() => handleCopyWebhook(store.id)}
                          className="text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                        >
                          {copiedStoreId === store.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span className="text-emerald-500">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy URL</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-[11px] font-mono text-neutral-700 dark:text-neutral-300 truncate select-all">
                        {webhookUrl}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleTestSync(store)}
                      disabled={isSyncing}
                      className="px-3 py-1.5 rounded-lg bg-violet-50 dark:bg-violet-950/60 hover:bg-violet-100 dark:hover:bg-violet-900/60 text-violet-700 dark:text-violet-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? 'Simulating Webhook...' : 'Test Live Order Sync'}</span>
                    </button>

                    {store.last_synced_at && (
                      <span className="text-[11px] text-neutral-400">
                        Last sync: {new Date(store.last_synced_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Connection Instructions Card */}
      <div className="p-5 rounded-2xl bg-neutral-900 text-white border border-neutral-800 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-violet-400 text-xs font-bold">
          <HelpCircle className="w-4 h-4" />
          <span>How to set up automatic webhook order sync</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-neutral-300 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-neutral-800/80 border border-neutral-700/60 space-y-1.5">
            <h5 className="font-bold text-white flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px] font-black">1</span>
              Shopify Setup
            </h5>
            <p className="text-[11px] text-neutral-400">
              In your Shopify Admin, go to <strong>Settings &gt; Notifications &gt; Webhooks</strong>. Click <strong>Create Webhook</strong>, set Event to <em>"Order creation"</em>, format to <em>JSON</em>, and paste the One Agent BD webhook URL above.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-neutral-800/80 border border-neutral-700/60 space-y-1.5">
            <h5 className="font-bold text-white flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[11px] font-black">2</span>
              WordPress / WooCommerce Setup
            </h5>
            <p className="text-[11px] text-neutral-400">
              In your WordPress admin, navigate to <strong>WooCommerce &gt; Settings &gt; Advanced &gt; Webhooks</strong>. Click <strong>Add Webhook</strong>, choose Topic <em>"Order created"</em>, and paste your Delivery URL. All orders will sync instantly!
            </p>
          </div>
        </div>
      </div>

      {/* Add Store Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-600/10 text-violet-600 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-neutral-900 dark:text-white">
                    Connect E-Commerce Store
                  </h3>
                  <p className="text-[11px] text-neutral-500">Pro Business Plan Feature</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStoreSubmit} className="space-y-4">
              {/* Platform Selector */}
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                  Platform
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPlatform('shopify')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      platform === 'shopify'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    Shopify
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlatform('woocommerce')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      platform === 'woocommerce'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300'
                        : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    WooCommerce
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlatform('custom_website')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      platform === 'custom_website'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                        : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    Custom Site
                  </button>
                </div>
              </div>

              {/* Store Name */}
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Store Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g., Dhaka Fashion Hub"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none text-neutral-900 dark:text-white placeholder-neutral-400 focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Store URL */}
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Store Website URL
                </label>
                <input
                  type="url"
                  value={storeUrl}
                  onChange={(e) => setStoreUrl(e.target.value)}
                  placeholder="https://yourstore.myshopify.com or https://yourbrand.com"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none text-neutral-900 dark:text-white placeholder-neutral-400 focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Optional API Key */}
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  API Key / Access Token (Optional)
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Leave blank to use webhook sync only"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none text-neutral-900 dark:text-white placeholder-neutral-400 focus:ring-2 focus:ring-violet-500"
                />
                <p className="text-[11px] text-neutral-400 mt-1">
                  Webhooks do not require an API key; orders are posted straight to your secure endpoint.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Connecting...' : 'Connect Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upgrade to Pro Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-amber-500 to-violet-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-violet-500/25">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight">
                Unlock Pro Business Store Integrations
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                Connecting Shopify, WordPress / WooCommerce, and custom websites is exclusively available on the <strong>Pro Business Plan</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 space-y-3">
              <div className="text-xs font-black text-neutral-900 dark:text-white uppercase tracking-wider">
                What you get with Pro Business (1,599 BDT/month):
              </div>
              <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Unlimited Shopify, WooCommerce & WordPress stores</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Unified Orders Hub with Website vs Manual/AI filter</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>1-Click WhatsApp VIP Customer Messaging</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Up to 3 WhatsApp Business phone numbers</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Priority 24/7 dedicated account manager</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="w-full sm:w-auto flex-1 py-2.5 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer text-center"
              >
                Close & Keep Standard
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleQuickUpgrade}
                className="w-full sm:w-auto flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-black transition-all shadow-md shadow-violet-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-4 h-4 fill-current text-amber-300" />
                <span>{submitting ? 'Upgrading...' : '1-Click Upgrade (1,599 BDT)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disconnect Store Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(storeToDelete)}
        onClose={() => setStoreToDelete(null)}
        onConfirm={handleConfirmDeleteStore}
        title="Disconnect Store?"
        message={`Are you sure you want to disconnect "${storeToDelete?.name}"? Incoming orders from this store will no longer sync to Orders Hub.`}
        confirmText="Yes, Disconnect"
        cancelText="Keep Store"
        isDestructive={true}
        isLoading={isDeletingStore}
      />
    </div>
  );
};
