import React, { useState, useMemo, useEffect } from 'react';
import {
  Truck,
  Search,
  CheckCircle2,
  Clock,
  Send,
  Trash2,
  Copy,
  Check,
  Phone,
  RefreshCw,
  Package,
  CheckCheck,
  AlertTriangle,
  X,
  ShieldCheck,
  Play,
  Settings,
  MessageSquare,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { Order, AutoCourierDispatchSettings } from '../../types';
import { api } from '../../api';
import {
  COURIER_PROVIDERS,
  getCourierById,
  formatOrderForCourier
} from '../../utils/courierUtils';
import { ConfirmModal } from '../common/ConfirmModal';
import { CustomerFraudBadge, AutoFraudInlineAlert } from './CustomerFraudBadge';
import { CourierModal } from './CourierModal';
import { AutoCourierSettingsModal } from './AutoCourierSettingsModal';

interface DeliveryCourierListViewProps {
  orders?: Order[];
  onRefreshOrders?: () => void;
  onOpenIndividualCourierModal?: (order: Order) => void;
}

export const DeliveryCourierListView: React.FC<DeliveryCourierListViewProps> = ({
  orders,
  onRefreshOrders,
  onOpenIndividualCourierModal
}) => {
  const [localOrders, setLocalOrders] = useState<Order[]>(orders || []);
  const [internalCourierOrder, setInternalCourierOrder] = useState<Order | null>(null);

  // Auto Courier Dispatch & Fraud Screening state
  const [autoCourierSettings, setAutoCourierSettings] = useState<AutoCourierDispatchSettings | null>(null);
  const [showAutoSettingsModal, setShowAutoSettingsModal] = useState(false);
  const [autoDispatchRunning, setAutoDispatchRunning] = useState(false);
  const [autoDispatchResult, setAutoDispatchResult] = useState<{
    totalScanned: number;
    dispatchedCount: number;
    suspiciousCount: number;
    courier: string;
    message: string;
  } | null>(null);

  const loadData = () => {
    if (onRefreshOrders) {
      onRefreshOrders();
    }
    if (!orders) {
      api.getOrders().then(res => {
        if (res.orders) setLocalOrders(res.orders);
      }).catch(err => console.error('Failed to load orders for delivery view:', err));
    }
    api.getAutoCourierSettings()
      .then(s => setAutoCourierSettings(s))
      .catch(e => console.warn('Failed to fetch auto courier settings:', e));
  };

  useEffect(() => {
    if (orders) {
      setLocalOrders(orders);
    } else {
      loadData();
    }
    api.getAutoCourierSettings()
      .then(s => setAutoCourierSettings(s))
      .catch(e => console.warn('Failed to fetch auto courier settings:', e));
  }, [orders]);

  const activeOrdersList = orders || localOrders;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourierFilter, setSelectedCourierFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; type: 'success' | 'error' } | null>(null);

  // Bulk Delete Modal state
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showBulkSendModal, setShowBulkSendModal] = useState(false);
  const [selectedBulkCourier, setSelectedBulkCourier] = useState<string>('steadfast');

  // Status breakdown metrics
  const pendingDispatchCount = useMemo(() => {
    return activeOrdersList.filter(o => o.status === 'confirmed' && !o.is_suspicious).length;
  }, [activeOrdersList]);

  const suspiciousCount = useMemo(() => {
    return activeOrdersList.filter(o => o.is_suspicious === true && o.status !== 'cancelled').length;
  }, [activeOrdersList]);

  const dispatchedCount = useMemo(() => {
    return activeOrdersList.filter(o => o.status === 'processing').length;
  }, [activeOrdersList]);

  const deliveredCount = useMemo(() => {
    return activeOrdersList.filter(o => o.status === 'delivered').length;
  }, [activeOrdersList]);

  // Filter orders suitable for delivery
  const filteredOrders = useMemo(() => {
    return activeOrdersList.filter((order) => {
      const search = searchTerm.toLowerCase();
      const matchSearch =
        order.customer_name?.toLowerCase().includes(search) ||
        order.customer_phone?.toLowerCase().includes(search) ||
        order.customer_address?.toLowerCase().includes(search) ||
        order.items?.toLowerCase().includes(search) ||
        order.id.toLowerCase().includes(search) ||
        (order.tracking_number && order.tracking_number.toLowerCase().includes(search)) ||
        (order.suspicious_reason && order.suspicious_reason.toLowerCase().includes(search));

      const matchStatus =
        selectedStatusFilter === 'all'
          ? true
          : selectedStatusFilter === 'suspicious'
          ? order.is_suspicious === true
          : selectedStatusFilter === 'confirmed'
          ? order.status === 'confirmed' && !order.is_suspicious
          : order.status === selectedStatusFilter;

      const matchCourier =
        selectedCourierFilter === 'all'
          ? true
          : (order.courier_provider || 'steadfast') === selectedCourierFilter;

      return matchSearch && matchStatus && matchCourier;
    });
  }, [activeOrdersList, searchTerm, selectedStatusFilter, selectedCourierFilter]);

  // Toggle Auto Courier Master ON/OFF
  const handleToggleAutoCourier = async () => {
    if (!autoCourierSettings) return;
    const newEnabled = !autoCourierSettings.enabled;
    try {
      const res = await api.saveAutoCourierSettings({ enabled: newEnabled });
      setAutoCourierSettings(res.settings);
      setToastMessage({
        title: newEnabled
          ? 'অটোমেটিক কুরিয়ার ডেসপ্যাচ চালু করা হয়েছে! নির্ধারিত সময়ে স্বয়ংক্রিয়ভাবে পার্সেল পাঠানো হবে।'
          : 'অটোমেটিক কুরিয়ার ডেসপ্যাচ বন্ধ করা হয়েছে। এখন আপনি প্রয়োজনমতো ম্যানুয়ালি পাঠাতে পারবেন।',
        type: 'success'
      });
    } catch (e) {
      console.error('Failed to toggle auto courier:', e);
      setToastMessage({ title: 'অটো কুরিয়ার সেটিংস পরিবর্তন করতে ব্যর্থ হয়েছে।', type: 'error' });
    }
  };

  // Run Auto Dispatch Now (On-Demand Execution)
  const handleRunAutoDispatchNow = async () => {
    setAutoDispatchRunning(true);
    try {
      const res = await api.runAutoCourierDispatch();
      setAutoDispatchResult({
        totalScanned: res.totalScanned,
        dispatchedCount: res.dispatchedCount,
        suspiciousCount: res.suspiciousCount,
        courier: res.courier,
        message: res.message
      });
      loadData();
    } catch (err: any) {
      setToastMessage({
        title: err.message || 'অটো-ডেসপ্যাচ চালাতে সমস্যা হয়েছে।',
        type: 'error'
      });
    } finally {
      setAutoDispatchRunning(false);
    }
  };

  // Approve a suspicious order and dispatch to courier
  const handleApproveSuspicious = async (order: Order) => {
    try {
      const targetCourier = order.courier_provider || autoCourierSettings?.default_courier || 'steadfast';
      const res = await api.approveSuspiciousOrder(order.id, targetCourier);
      setToastMessage({
        title: res.message || 'পার্সেলটি যাচাই করে সফলভাবে কুরিয়ারে বুক করা হয়েছে!',
        type: 'success'
      });
      loadData();
    } catch (err: any) {
      setToastMessage({
        title: err.message || 'পার্সেল অনুমোদন করতে ব্যর্থ হয়েছে।',
        type: 'error'
      });
    }
  };

  // Dismiss suspicious tag without dispatching immediately
  const handleDismissSuspicious = async (orderId: string) => {
    try {
      const res = await api.dismissSuspiciousOrder(orderId);
      setToastMessage({
        title: res.message || 'সন্দেহজনক ফ্ল্যাগ সরানো হয়েছে। পার্সেলটি নিরাপদ চিহ্নিত হয়েছে।',
        type: 'success'
      });
      loadData();
    } catch (err: any) {
      setToastMessage({
        title: err.message || 'ফ্ল্যাগ সরাতে ব্যর্থ হয়েছে।',
        type: 'error'
      });
    }
  };

  // Helper to format Bengali times
  const formatScheduledTimesBengali = (times?: string[]) => {
    if (!times || times.length === 0) return 'কোনো নির্দিষ্ট সময় সেট নেই';
    return times.map(t => {
      const [hStr, mStr] = t.split(':');
      const h = parseInt(hStr, 10);
      const m = mStr || '00';
      if (isNaN(h)) return t;
      const isPm = h >= 12;
      const h12 = h % 12 === 0 ? 12 : h % 12;
      const period = h < 6 ? 'রাত' : h < 12 ? 'সকাল' : h < 16 ? 'দুপুর' : h < 19 ? 'বিকেল' : 'রাত';
      return `${period} ${h12}:${m} ${isPm ? 'PM' : 'AM'}`;
    }).join(' ও ');
  };

  // Toggle selection
  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedOrderIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedOrderIds(next);
  };

  const handleSelectAll = () => {
    if (selectedOrderIds.size === filteredOrders.length) {
      setSelectedOrderIds(new Set());
    } else {
      setSelectedOrderIds(new Set(filteredOrders.map(o => o.id)));
    }
  };

  // Bulk Status Update (Dispatched / Delivered)
  const handleBulkMarkStatus = async (newStatus: Order['status']) => {
    if (selectedOrderIds.size === 0) return;
    setBulkProcessing(true);
    try {
      const promises = Array.from(selectedOrderIds).map((id: string) =>
        api.updateOrder(id, { status: newStatus })
      );
      await Promise.all(promises);
      setToastMessage({
        title: `Successfully updated ${selectedOrderIds.size} orders to '${newStatus === 'processing' ? 'Dispatched' : 'Delivered'}'!`,
        type: 'success'
      });
      setSelectedOrderIds(new Set());
      loadData();
    } catch (err) {
      setToastMessage({
        title: 'Failed to update order status. Please try again.',
        type: 'error'
      });
    } finally {
      setBulkProcessing(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedOrderIds.size === 0) return;
    setBulkProcessing(true);
    try {
      const promises = Array.from(selectedOrderIds).map((id: string) => api.deleteOrder(id));
      await Promise.all(promises);
      setToastMessage({
        title: `Successfully deleted ${selectedOrderIds.size} orders!`,
        type: 'success'
      });
      setSelectedOrderIds(new Set());
      setShowBulkDeleteModal(false);
      loadData();
    } catch (err) {
      setToastMessage({
        title: 'Failed to delete selected orders.',
        type: 'error'
      });
    } finally {
      setBulkProcessing(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  // Copy parcel details for courier
  const handleCopyOrderForCourier = (order: Order) => {
    const text = formatOrderForCourier(order);
    navigator.clipboard.writeText(text);
    setCopiedId(order.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Bulk 1-Click Dispatch to Courier (Backend API + Clipboard)
  const handleBulkExportCourierSlip = async () => {
    const selectedOrders = (orders || localOrders).filter(o => selectedOrderIds.has(o.id));
    if (selectedOrders.length === 0) return;

    setBulkProcessing(true);
    try {
      const { getCourierCredentials } = await import('../../utils/courierUtils');
      const creds = getCourierCredentials(selectedBulkCourier);
      const res = await api.bulkDispatchOrdersToCourier(
        Array.from(selectedOrderIds),
        selectedBulkCourier,
        {
          merchantId: creds.merchantId,
          apiKey: creds.apiKey,
          apiSecret: creds.apiSecret,
          pickupAddress: creds.pickupAddress,
          pickupPhone: creds.notes
        }
      );

      const fullText = (res.orders || selectedOrders).map((o, idx) => {
        return `--- [PARCEL #${idx + 1} | Tracking: ${o.tracking_number || 'Pending'}] ---\n${formatOrderForCourier(o)}\n`;
      }).join('\n');

      try {
        await navigator.clipboard.writeText(fullText);
      } catch (clipErr) {
        console.warn('Clipboard copy warning:', clipErr);
      }

      const courier = getCourierById(selectedBulkCourier) || COURIER_PROVIDERS[0];
      setShowBulkSendModal(false);
      setSelectedOrderIds(new Set());
      loadData();
      setToastMessage({
        title: `1-Click Dispatched ${selectedOrders.length} parcel(s) to ${courier.name}! Tracking IDs generated & slips copied.`,
        type: 'success'
      });
    } catch (err) {
      setToastMessage({
        title: 'Failed to dispatch selected orders to courier.',
        type: 'error'
      });
    } finally {
      setBulkProcessing(false);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner with Brand Gradient */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#7F22FE] via-[#6c1ce0] to-[#5113b5] text-white shadow-xl shadow-[#7F22FE]/15 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-0.5 rounded-full bg-white/15 text-white text-xs font-bold border border-white/20 backdrop-blur-xs flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-white" />
                Delivery & Courier Hub
              </span>
              <span className="text-xs text-white/80 font-medium">Steadfast, Pathao, RedX, Paperfly, eCourier</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Courier Dispatch & Bulk Actions
            </h2>
            <p className="text-xs md:text-sm text-white/90 mt-1 max-w-xl leading-relaxed">
              Select orders to copy ready-to-paste courier booking slips, mark dispatch in transit, update delivery status, or perform bulk removals.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => {
                const confirmed = activeOrdersList.filter(o => o.status === 'confirmed');
                const target = confirmed.length > 0 ? confirmed : activeOrdersList.filter(o => o.status !== 'cancelled' && o.status !== 'delivered');
                if (target.length === 0) {
                  setToastMessage({ title: 'কুরিয়ারে পাঠানোর মতো কোনো পেন্ডিং অর্ডার পাওয়া যায়নি।', type: 'error' });
                  return;
                }
                setSelectedOrderIds(new Set(target.map(o => o.id)));
                setShowBulkSendModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-white text-purple-900 hover:bg-purple-50 text-xs font-black transition-all shadow-md flex items-center gap-2 cursor-pointer"
              title="সব পেন্ডিং কাস্টমার অর্ডার একসাথে কুরিয়ারে বুক করুন"
            >
              <Truck className="w-4 h-4 text-[#7F22FE]" />
              <span>১-ক্লিকে সব পেন্ডিং কুরিয়ারে পাঠান{pendingDispatchCount > 0 ? ` (${pendingDispatchCount})` : ''}</span>
            </button>

            <button
              onClick={() => loadData()}
              className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all border border-white/20 flex items-center gap-2 cursor-pointer shadow-sm"
              title="Refresh order data"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-5 sm:mt-6 pt-4 sm:pt-6 border-t border-white/15">
          <div
            onClick={() => setSelectedStatusFilter('confirmed')}
            className={`p-2.5 sm:p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 flex items-center justify-between cursor-pointer transition-all hover:bg-white/20 ${
              selectedStatusFilter === 'confirmed' ? 'ring-2 ring-white/60' : ''
            }`}
          >
            <div>
              <div className="text-white/80 text-[10px] sm:text-xs font-medium">Pending Ready</div>
              <div className="text-lg sm:text-2xl font-black text-white mt-0.5">{pendingDispatchCount}</div>
            </div>
            <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-white/70 hidden sm:block" />
          </div>

          <div
            onClick={() => setSelectedStatusFilter('suspicious')}
            className={`p-2.5 sm:p-3.5 rounded-2xl bg-amber-500/20 backdrop-blur-xs border border-amber-300/30 flex items-center justify-between cursor-pointer transition-all hover:bg-amber-500/30 ${
              selectedStatusFilter === 'suspicious' ? 'ring-2 ring-amber-300' : ''
            }`}
          >
            <div>
              <div className="text-amber-200 text-[10px] sm:text-xs font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-300" />
                <span>⚠️ Suspicious</span>
              </div>
              <div className="text-lg sm:text-2xl font-black text-amber-100 mt-0.5">{suspiciousCount}</div>
            </div>
            <ShieldCheck className="w-4 h-4 sm:w-6 sm:h-6 text-amber-300/80 hidden sm:block" />
          </div>

          <div
            onClick={() => setSelectedStatusFilter('processing')}
            className={`p-2.5 sm:p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 flex items-center justify-between cursor-pointer transition-all hover:bg-white/20 ${
              selectedStatusFilter === 'processing' ? 'ring-2 ring-white/60' : ''
            }`}
          >
            <div>
              <div className="text-white/80 text-[10px] sm:text-xs font-medium">In Transit</div>
              <div className="text-lg sm:text-2xl font-black text-white mt-0.5">{dispatchedCount}</div>
            </div>
            <Truck className="w-4 h-4 sm:w-6 sm:h-6 text-white/70 hidden sm:block" />
          </div>

          <div
            onClick={() => setSelectedStatusFilter('delivered')}
            className={`p-2.5 sm:p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 flex items-center justify-between cursor-pointer transition-all hover:bg-white/20 ${
              selectedStatusFilter === 'delivered' ? 'ring-2 ring-white/60' : ''
            }`}
          >
            <div>
              <div className="text-white/80 text-[10px] sm:text-xs font-medium">Delivered</div>
              <div className="text-lg sm:text-2xl font-black text-white mt-0.5">{deliveredCount}</div>
            </div>
            <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6 text-white/70 hidden sm:block" />
          </div>
        </div>
      </div>

      {/* Auto Courier Dispatch & AI Fraud Guard Control Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${
            autoCourierSettings?.enabled
              ? 'bg-[#7F22FE]/10 border-[#7F22FE]/30 text-[#7F22FE]'
              : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-400'
          }`}>
            <Truck className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-black text-neutral-900 dark:text-white">
                অটোমেটিক কুরিয়ার ডেসপ্যাচ (Auto Courier Dispatch)
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 ${
                autoCourierSettings?.enabled
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border border-neutral-200 dark:border-neutral-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${autoCourierSettings?.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'}`} />
                {autoCourierSettings?.enabled ? 'চালু (Active)' : 'বন্ধ (OFF - ম্যানুয়াল মোড)'}
              </span>
            </div>

            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 flex items-center gap-2 flex-wrap">
              <span>সময়সূচি: <strong className="text-neutral-800 dark:text-neutral-200 font-semibold">{formatScheduledTimesBengali(autoCourierSettings?.scheduled_times)}</strong></span>
              <span>•</span>
              <span>কুরিয়ার: <strong className="text-neutral-800 dark:text-neutral-200 uppercase font-semibold">{autoCourierSettings?.default_courier || 'steadfast'}</strong></span>
              {autoCourierSettings?.fraud_check_enabled && (
                <>
                  <span>•</span>
                  <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> এআই ফ্রড গার্ড সক্রিয়
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Quick Toggle ON/OFF */}
          <button
            type="button"
            onClick={handleToggleAutoCourier}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
              autoCourierSettings?.enabled
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200'
            }`}
            title={autoCourierSettings?.enabled ? 'অটো-ডেসপ্যাচ বন্ধ করুন' : 'অটো-ডেসপ্যাচ চালু করুন'}
          >
            <span>{autoCourierSettings?.enabled ? 'অটো বুকিং: ON' : 'অটো বুকিং: OFF'}</span>
          </button>

          {/* Settings Button */}
          <button
            type="button"
            onClick={() => setShowAutoSettingsModal(true)}
            className="px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-[#7F22FE] text-neutral-700 dark:text-neutral-300 hover:text-[#7F22FE] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-white dark:bg-neutral-900 shadow-2xs"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>সময় ও সেটিংস</span>
          </button>

          {/* Run Auto Dispatch Now Button */}
          <button
            type="button"
            onClick={handleRunAutoDispatchNow}
            disabled={autoDispatchRunning}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7F22FE] to-[#6c1ce0] hover:opacity-95 text-white text-xs font-black transition-all shadow-md shadow-[#7F22FE]/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
          >
            {autoDispatchRunning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>স্ক্যান হচ্ছে...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>এখনই অটো-ডেসপ্যাচ চালান</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between animate-in fade-in ${
            toastMessage.type === 'success'
              ? 'bg-[#7F22FE]/10 border border-[#7F22FE]/25 text-[#7F22FE]'
              : 'bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#7F22FE]" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            )}
            <span>{toastMessage.title}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-xs cursor-pointer">✕</button>
        </div>
      )}

      {/* Sticky Bulk Actions Bar (Active when orders are selected) */}
      <div
        className={`p-4 rounded-2xl border transition-all flex flex-wrap items-center justify-between gap-4 ${
          selectedOrderIds.size > 0
            ? 'bg-[#7F22FE]/5 dark:bg-[#7F22FE]/15 border-[#7F22FE]/30 shadow-md ring-2 ring-[#7F22FE]/20'
            : 'bg-white dark:bg-neutral-900 border-neutral-200/80 dark:border-neutral-800'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-2 text-xs font-bold text-neutral-700 dark:text-neutral-300 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedOrderIds.size > 0 && selectedOrderIds.size === filteredOrders.length}
              onChange={handleSelectAll}
              className="rounded text-[#7F22FE] focus:ring-[#7F22FE] cursor-pointer"
            />
            <span>
              {selectedOrderIds.size > 0
                ? `${selectedOrderIds.size} orders selected`
                : 'Select All Orders'}
            </span>
          </button>

          {selectedOrderIds.size > 0 && (
            <button
              onClick={() => setSelectedOrderIds(new Set())}
              className="text-xs text-neutral-400 hover:text-neutral-600 underline cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Bulk Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleBulkMarkStatus('processing')}
            disabled={selectedOrderIds.size === 0 || bulkProcessing}
            className="px-3.5 py-1.5 rounded-xl bg-[#7F22FE] hover:bg-[#6c1ce0] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Mark selected orders as dispatched to courier"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Mark Dispatched</span>
          </button>

          <button
            onClick={() => handleBulkMarkStatus('delivered')}
            disabled={selectedOrderIds.size === 0 || bulkProcessing}
            className="px-3.5 py-1.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Mark selected orders as delivered"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark Delivered</span>
          </button>

          <button
            onClick={() => setShowBulkSendModal(true)}
            disabled={selectedOrderIds.size === 0 || bulkProcessing}
            className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5 text-[#7F22FE]" />
            <span>1-Click Courier Dispatch</span>
          </button>

          <button
            onClick={() => setShowBulkDeleteModal(true)}
            disabled={selectedOrderIds.size === 0 || bulkProcessing}
            className="px-3.5 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/60 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Selected ({selectedOrderIds.size})</span>
          </button>
        </div>
      </div>

      {/* Quick Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedStatusFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            selectedStatusFilter === 'all'
              ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-2xs'
              : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
          }`}
        >
          সব পার্সেল ({activeOrdersList.length})
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatusFilter('confirmed')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            selectedStatusFilter === 'confirmed'
              ? 'bg-[#7F22FE] text-white shadow-2xs'
              : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:border-[#7F22FE]'
          }`}
        >
          পেন্ডিং ডেসপ্যাচ ({pendingDispatchCount})
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatusFilter('suspicious')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            selectedStatusFilter === 'suspicious'
              ? 'bg-amber-500 text-white shadow-xs ring-2 ring-amber-500/30'
              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800 hover:bg-amber-100'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>⚠️ সন্দেহজনক পার্সেল ({suspiciousCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatusFilter('processing')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            selectedStatusFilter === 'processing'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800'
          }`}
        >
          চলমান কুরিয়ার ({dispatchedCount})
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatusFilter('delivered')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            selectedStatusFilter === 'delivered'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800'
          }`}
        >
          ডেলিভার্ড ({deliveredCount})
        </button>
      </div>

      {/* Warning banner when viewing Suspicious Queue */}
      {selectedStatusFilter === 'suspicious' && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
              <span>এআই স্ক্রিনিংয়ে শনাক্তকৃত সন্দেহজনক পার্সেল ({suspiciousCount}টি)</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-black">
                ম্যানুয়াল ভেরিফিকেশন প্রয়োজন
              </span>
            </div>
            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed text-[11px]">
              এই পার্সেলগুলোর ঠিকানা অসম্পূর্ণ, ফোন নম্বর ভুল, একই নম্বরে ডুপ্লিকেট অর্ডার অথবা অতিরিক্ত বড় COD অ্যামাউন্ট শনাক্ত হয়েছে। ডেলিভারি রিটার্ন ক্ষতি এড়াতে গ্রাহকের সাথে ফোনে বা WhatsApp-এ কথা বলে নিশ্চিত হয়ে <strong>'যাচাই করে পাঠান'</strong> বাটনে ক্লিক করে কুরিয়ারে পাঠান।
            </p>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, phone, address, tracking number, or risk reason..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7F22FE]"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium cursor-pointer"
          >
            <option value="all">All Delivery Statuses</option>
            <option value="confirmed">Pending Dispatch (Ready)</option>
            <option value="suspicious">⚠️ Suspicious Orders ({suspiciousCount})</option>
            <option value="processing">In Transit (Dispatched)</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Courier Filter */}
          <select
            value={selectedCourierFilter}
            onChange={(e) => setSelectedCourierFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium cursor-pointer"
          >
            <option value="all">All Courier Partners</option>
            {COURIER_PROVIDERS.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Delivery Table */}
      <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400">No parcel or orders found</p>
            <p className="text-[11px] text-neutral-400 mt-1">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <>
            {/* MOBILE PARCEL CARDS (Phone View) */}
            <div className="md:hidden divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredOrders.map((order) => {
                const isSelected = selectedOrderIds.has(order.id);
                const courier = getCourierById(order.courier_provider || 'steadfast') || COURIER_PROVIDERS[0];

                return (
                  <div
                    key={order.id}
                    className={`p-3.5 space-y-2.5 transition-colors ${
                      order.is_suspicious
                        ? 'bg-amber-50/70 dark:bg-amber-950/25 border-l-4 border-amber-500'
                        : isSelected
                        ? 'bg-[#7F22FE]/5 dark:bg-[#7F22FE]/15'
                        : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(order.id)}
                          className="mt-1 rounded text-[#7F22FE] focus:ring-[#7F22FE] cursor-pointer shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-[#7F22FE]">
                              #{order.id.slice(-6).toUpperCase()}
                            </span>
                            <span className="font-bold text-sm text-neutral-900 dark:text-white truncate">
                              {order.customer_name}
                            </span>
                          </div>
                          {order.customer_phone && (
                            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 flex-wrap mt-0.5">
                              <a
                                href={`tel:${order.customer_phone}`}
                                className="inline-flex items-center gap-1 font-medium"
                              >
                                <Phone className="w-3 h-3 text-neutral-400" />
                                {order.customer_phone}
                              </a>
                              <CustomerFraudBadge
                                phone={order.customer_phone}
                                customerName={order.customer_name}
                                allOrders={activeOrdersList}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-black text-neutral-900 dark:text-white">
                          COD ৳{Number(order.total_amount || 0).toLocaleString()}
                        </div>
                        <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider border ${courier.badgeBg}`}>
                          {courier.name.split(' ')[0]}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/50 text-[11px] space-y-1">
                      <div className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                        {order.items}
                      </div>
                      <div className="text-neutral-500 dark:text-neutral-400 truncate">
                        📍 {order.customer_address || 'No address provided'}
                      </div>
                    </div>

                    {/* Suspicious warning box on mobile card */}
                    {order.is_suspicious && (
                      <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/25 text-[11px] font-bold text-amber-900 dark:text-amber-200 flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span>⚠️ AI ফ্রড গার্ড: </span>
                          <span className="font-normal text-amber-800 dark:text-amber-300">{order.suspicious_reason || 'সন্দেহজনক পার্সেল'}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <div>
                        {order.is_suspicious ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-400/40 inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            সন্দেহজনক
                          </span>
                        ) : order.status === 'confirmed' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#7F22FE]/10 text-[#7F22FE] border border-[#7F22FE]/20">
                            Pending Dispatch
                          </span>
                        ) : order.status === 'processing' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#7F22FE]/15 text-[#7F22FE] border border-[#7F22FE]/30 inline-flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            In Transit
                          </span>
                        ) : order.status === 'delivered' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-[#7F22FE]" />
                            Delivered
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                            Cancelled
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {order.is_suspicious ? (
                          <>
                            <button
                              onClick={() => handleApproveSuspicious(order)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                              title="যাচাই সম্পন্ন: কুরিয়ারে পাঠান"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>যাচাই করে পাঠান</span>
                            </button>

                            {order.customer_phone && (
                              <a
                                href={`https://wa.me/88${order.customer_phone.replace(/\D/g, '').slice(-11)}?text=${encodeURIComponent(`Hello ${order.customer_name}! আপনার #${order.id.slice(-6).toUpperCase()} অর্ডারের ডেলিভারি তথ্য কনফার্ম করার জন্য যোগাযোগ করছি।`)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                title="WhatsApp এ মেসেজ দিন"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </a>
                            )}

                            <button
                              onClick={() => handleDismissSuspicious(order.id)}
                              className="p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-500 hover:text-neutral-700"
                              title="সন্দেহজনক ফ্ল্যাগ সরান"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleCopyOrderForCourier(order)}
                              title="Copy Courier Slip"
                              className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 cursor-pointer"
                            >
                              {copiedId === order.id ? (
                                <Check className="w-3.5 h-3.5 text-[#7F22FE]" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => {
                                if (onOpenIndividualCourierModal) {
                                  onOpenIndividualCourierModal(order);
                                } else {
                                  setInternalCourierOrder(order);
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#7F22FE] hover:bg-[#6c1ce0] text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                            >
                              <Truck className="w-3 h-3" />
                              <span>Book Courier</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800 text-[11px] font-bold text-neutral-400 uppercase tracking-wider bg-neutral-50/50 dark:bg-neutral-800/30">
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedOrderIds.size > 0 && selectedOrderIds.size === filteredOrders.length}
                      onChange={handleSelectAll}
                      className="rounded text-[#7F22FE] focus:ring-[#7F22FE] cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4">Order ID & Date</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Delivery Address</th>
                  <th className="py-3 px-4">Items & COD Amount</th>
                  <th className="py-3 px-4">Courier Partner</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredOrders.map((order) => {
                  const isSelected = selectedOrderIds.has(order.id);
                  const courier = getCourierById(order.courier_provider || 'steadfast') || COURIER_PROVIDERS[0];

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors ${
                        order.is_suspicious
                          ? 'bg-amber-50/60 dark:bg-amber-950/20 border-l-4 border-amber-500'
                          : isSelected
                          ? 'bg-[#7F22FE]/5 dark:bg-[#7F22FE]/15'
                          : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(order.id)}
                          className="rounded text-[#7F22FE] focus:ring-[#7F22FE] cursor-pointer"
                        />
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-[#7F22FE]">
                          #{order.id.slice(-6).toUpperCase()}
                        </span>
                        <div className="text-[10px] text-neutral-400 mt-0.5">
                          {new Date(order.created_at).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-neutral-900 dark:text-white">
                          {order.customer_name}
                        </div>
                        {order.customer_phone && (
                          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 flex-wrap mt-0.5">
                            <span className="inline-flex items-center gap-1">
                              <Phone className="w-3 h-3 text-neutral-400" />
                              <a
                                href={`tel:${order.customer_phone}`}
                                className="hover:underline hover:text-[#7F22FE] font-medium"
                              >
                                {order.customer_phone}
                              </a>
                            </span>
                            <CustomerFraudBadge
                              phone={order.customer_phone}
                              customerName={order.customer_name}
                              allOrders={activeOrdersList}
                            />
                          </div>
                        )}
                        {order.customer_phone && (
                          <AutoFraudInlineAlert phone={order.customer_phone} allOrders={activeOrdersList} />
                        )}
                      </td>

                      <td className="py-3.5 px-4 max-w-[220px]">
                        <div
                          className="text-[11px] text-neutral-600 dark:text-neutral-300 truncate"
                          title={order.customer_address}
                        >
                          {order.customer_address || 'No address provided'}
                        </div>
                        {/* Inline Suspicious Reason Badge */}
                        {order.is_suspicious && (
                          <div className="mt-1 p-1 rounded-md bg-amber-500/15 border border-amber-500/25 text-[10px] font-semibold text-amber-900 dark:text-amber-200 flex items-start gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{order.suspicious_reason || 'সন্দেহজনক পার্সেল'}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-[160px]">
                          {order.items}
                        </div>
                        <div className="text-[11px] font-black text-neutral-900 dark:text-white mt-0.5">
                          COD: BDT {Number(order.total_amount || 0).toLocaleString()}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider border ${courier.badgeBg}`}>
                          {courier.name.split(' ')[0]}
                        </span>
                        {order.tracking_number ? (
                          <div className="text-[10px] font-mono text-neutral-500 mt-0.5">
                            {order.tracking_number}
                          </div>
                        ) : (
                          <div className="text-[10px] text-neutral-400 italic mt-0.5">No tracking</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {order.is_suspicious ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-400/40 inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            সন্দেহজনক
                          </span>
                        ) : order.status === 'confirmed' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#7F22FE]/10 text-[#7F22FE] border border-[#7F22FE]/20">
                            Pending Dispatch
                          </span>
                        ) : order.status === 'processing' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#7F22FE]/15 text-[#7F22FE] border border-[#7F22FE]/30 flex items-center gap-1 w-max">
                            <Truck className="w-3 h-3" />
                            In Transit
                          </span>
                        ) : order.status === 'delivered' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-3 h-3 text-[#7F22FE]" />
                            Delivered
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                            Cancelled
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {order.is_suspicious ? (
                            <>
                              <button
                                onClick={() => handleApproveSuspicious(order)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                                title="সব ঠিক আছে: যাচাই করে কুরিয়ারে পাঠান"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>যাচাই করে পাঠান</span>
                              </button>

                              {order.customer_phone && (
                                <a
                                  href={`https://wa.me/88${order.customer_phone.replace(/\D/g, '').slice(-11)}?text=${encodeURIComponent(`Hello ${order.customer_name}! আপনার #${order.id.slice(-6).toUpperCase()} অর্ডারের ডেলিভারি তথ্য কনফার্ম করার জন্য যোগাযোগ করছি।`)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                  title="WhatsApp এ মেসেজ দিন"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </a>
                              )}

                              <button
                                onClick={() => handleDismissSuspicious(order.id)}
                                title="সন্দেহজনক ফ্ল্যাগ সরান"
                                className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              {/* Copy Courier Details */}
                              <button
                                onClick={() => handleCopyOrderForCourier(order)}
                                title="Copy Courier Slip (Ctrl+V into courier portal)"
                                className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
                              >
                                {copiedId === order.id ? (
                                  <Check className="w-3.5 h-3.5 text-[#7F22FE]" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {/* Individual Courier Modal Open */}
                              <button
                                onClick={() => {
                                  if (onOpenIndividualCourierModal) {
                                    onOpenIndividualCourierModal(order);
                                  } else {
                                    setInternalCourierOrder(order);
                                  }
                                }}
                                title="Book on Courier"
                                className="px-2.5 py-1 rounded-lg bg-[#7F22FE] hover:bg-[#6c1ce0] text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                              >
                                <Truck className="w-3 h-3" />
                                <span>Book</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

      {/* Built-in Individual Courier Modal when opened directly from sidebar */}
      <CourierModal
        isOpen={Boolean(internalCourierOrder)}
        onClose={() => setInternalCourierOrder(null)}
        order={internalCourierOrder}
        orders={activeOrdersList}
        onOrderShipped={() => {
          loadData();
        }}
      />

      {/* Bulk Delete Confirm Modal */}
      <ConfirmModal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleBulkDelete}
        title="Permanently Delete Selected Orders?"
        message={`You are about to delete ${selectedOrderIds.size} orders permanently. This action cannot be reversed.`}
        confirmLabel={`Yes, Delete ${selectedOrderIds.size} Orders`}
        confirmVariant="danger"
        isLoading={bulkProcessing}
      />

      {/* Bulk Send to Courier Modal */}
      {showBulkSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#7F22FE]" />
                <h3 className="text-base font-black text-neutral-900 dark:text-white">
                  Bulk 1-Click Courier Dispatch
                </h3>
              </div>
              <button
                onClick={() => setShowBulkSendModal(false)}
                className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Parcel information for the selected <strong>{selectedOrderIds.size} orders</strong> will be copied to your clipboard, and your courier portal will open automatically.
            </p>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                Select Courier Partner:
              </label>
              <div className="space-y-2">
                {COURIER_PROVIDERS.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedBulkCourier(c.id)}
                    className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                      selectedBulkCourier === c.id
                        ? 'border-[#7F22FE] bg-[#7F22FE]/5 ring-2 ring-[#7F22FE]/20'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-neutral-900 dark:text-white">{c.name}</div>
                      <div className="text-[11px] text-neutral-400">{c.tagline}</div>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded ${c.badgeBg}`}>
                      {c.logoCode}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowBulkSendModal(false)}
                className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkExportCourierSlip}
                className="px-4 py-2 rounded-xl bg-[#7F22FE] hover:bg-[#6c1ce0] text-white text-xs font-bold transition-all shadow-md shadow-[#7F22FE]/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Copy & Open Courier Portal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto Courier Settings Modal */}
      <AutoCourierSettingsModal
        isOpen={showAutoSettingsModal}
        onClose={() => setShowAutoSettingsModal(false)}
        onSettingsSaved={(newSettings) => setAutoCourierSettings(newSettings)}
        onTriggerRunNow={handleRunAutoDispatchNow}
      />

      {/* Auto Dispatch Execution Result Modal */}
      {autoDispatchResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#7F22FE]/10 text-[#7F22FE] flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-neutral-900 dark:text-white">
                    অটো-ডেসপ্যাচ সম্পন্ন হয়েছে!
                  </h3>
                  <p className="text-[11px] text-neutral-400">AI কুরিয়ার স্ক্রিনিং ও বুকিং রিপোর্ট</p>
                </div>
              </div>
              <button
                onClick={() => setAutoDispatchResult(null)}
                className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {autoDispatchResult.message}
            </p>

            {/* 3 Metric Cards */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-center">
                <div className="text-[10px] text-neutral-400 font-semibold">মোট স্ক্যান</div>
                <div className="text-xl font-black text-neutral-900 dark:text-white mt-0.5">
                  {autoDispatchResult.totalScanned}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">কুরিয়ারে বুকিং</div>
                <div className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-0.5">
                  {autoDispatchResult.dispatchedCount}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center">
                <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">সন্দেহজনক</div>
                <div className="text-xl font-black text-amber-700 dark:text-amber-300 mt-0.5">
                  {autoDispatchResult.suspiciousCount}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              {autoDispatchResult.suspiciousCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStatusFilter('suspicious');
                    setAutoDispatchResult(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>সন্দেহজনক পার্সেলগুলো দেখুন ({autoDispatchResult.suspiciousCount})</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setAutoDispatchResult(null)}
                className="px-4 py-2.5 rounded-xl bg-[#7F22FE] hover:bg-[#6c1ce0] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                ঠিক আছে
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
