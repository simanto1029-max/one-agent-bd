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
  X
} from 'lucide-react';
import { Order } from '../../types';
import { api } from '../../api';
import {
  COURIER_PROVIDERS,
  getCourierById,
  formatOrderForCourier
} from '../../utils/courierUtils';
import { ConfirmModal } from '../common/ConfirmModal';
import { CustomerFraudBadge, AutoFraudInlineAlert } from './CustomerFraudBadge';
import { CourierModal } from './CourierModal';

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

  const loadData = () => {
    if (onRefreshOrders) {
      onRefreshOrders();
    }
    if (!orders) {
      api.getOrders().then(res => {
        if (res.orders) setLocalOrders(res.orders);
      }).catch(err => console.error('Failed to load orders for delivery view:', err));
    }
  };

  useEffect(() => {
    if (orders) {
      setLocalOrders(orders);
    } else {
      loadData();
    }
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
        (order.tracking_number && order.tracking_number.toLowerCase().includes(search));

      const matchStatus =
        selectedStatusFilter === 'all'
          ? true
          : order.status === selectedStatusFilter;

      const matchCourier =
        selectedCourierFilter === 'all'
          ? true
          : (order.courier_provider || 'steadfast') === selectedCourierFilter;

      return matchSearch && matchStatus && matchCourier;
    });
  }, [activeOrdersList, searchTerm, selectedStatusFilter, selectedCourierFilter]);

  // Status breakdown metrics
  const pendingDispatchCount = useMemo(() => {
    return activeOrdersList.filter(o => o.status === 'confirmed').length;
  }, [activeOrdersList]);

  const dispatchedCount = useMemo(() => {
    return activeOrdersList.filter(o => o.status === 'processing').length;
  }, [activeOrdersList]);

  const deliveredCount = useMemo(() => {
    return activeOrdersList.filter(o => o.status === 'delivered').length;
  }, [activeOrdersList]);

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

          <div className="flex items-center gap-3">
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

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-5 sm:mt-6 pt-4 sm:pt-6 border-t border-white/15">
          <div className="p-2.5 sm:p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 flex items-center justify-between">
            <div>
              <div className="text-white/80 text-[10px] sm:text-xs font-medium">Pending</div>
              <div className="text-lg sm:text-2xl font-black text-white mt-0.5">{pendingDispatchCount}</div>
            </div>
            <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-white/70 hidden sm:block" />
          </div>

          <div className="p-2.5 sm:p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 flex items-center justify-between">
            <div>
              <div className="text-white/80 text-[10px] sm:text-xs font-medium">In Transit</div>
              <div className="text-lg sm:text-2xl font-black text-white mt-0.5">{dispatchedCount}</div>
            </div>
            <Truck className="w-4 h-4 sm:w-6 sm:h-6 text-white/70 hidden sm:block" />
          </div>

          <div className="p-2.5 sm:p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 flex items-center justify-between">
            <div>
              <div className="text-white/80 text-[10px] sm:text-xs font-medium">Delivered</div>
              <div className="text-lg sm:text-2xl font-black text-white mt-0.5">{deliveredCount}</div>
            </div>
            <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6 text-white/70 hidden sm:block" />
          </div>
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

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, phone, address, or tracking number..."
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
            <option value="confirmed">Pending Dispatch</option>
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
                      isSelected ? 'bg-[#7F22FE]/5 dark:bg-[#7F22FE]/15' : ''
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

                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <div>
                        {order.status === 'confirmed' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#7F22FE]/10 text-[#7F22FE] border border-[#7F22FE]/20">
                            Pending Dispatch
                          </span>
                        )}
                        {order.status === 'processing' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#7F22FE]/15 text-[#7F22FE] border border-[#7F22FE]/30 inline-flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            In Transit
                          </span>
                        )}
                        {order.status === 'delivered' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-[#7F22FE]" />
                            Delivered
                          </span>
                        )}
                        {order.status === 'cancelled' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                            Cancelled
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
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
                        isSelected ? 'bg-[#7F22FE]/5 dark:bg-[#7F22FE]/15' : ''
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

                      <td className="py-3.5 px-4 max-w-[200px]">
                        <div
                          className="text-[11px] text-neutral-600 dark:text-neutral-300 truncate"
                          title={order.customer_address}
                        >
                          {order.customer_address || 'No address provided'}
                        </div>
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
                        {order.status === 'confirmed' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#7F22FE]/10 text-[#7F22FE] border border-[#7F22FE]/20">
                            Pending Dispatch
                          </span>
                        )}
                        {order.status === 'processing' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#7F22FE]/15 text-[#7F22FE] border border-[#7F22FE]/30 flex items-center gap-1 w-max">
                            <Truck className="w-3 h-3" />
                            In Transit
                          </span>
                        )}
                        {order.status === 'delivered' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-3 h-3 text-[#7F22FE]" />
                            Delivered
                          </span>
                        )}
                        {order.status === 'cancelled' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                            Cancelled
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
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
    </div>
  );
};
