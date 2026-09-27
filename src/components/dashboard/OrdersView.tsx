import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Plus,
  Download,
  Filter,
  RefreshCw,
  MessageSquare,
  Smartphone,
  Facebook,
  Instagram,
  CheckCircle2,
  Clock,
  Truck,
  CheckCheck,
  XCircle,
  Sparkles,
  Edit3,
  Trash2,
  ExternalLink,
  Phone,
  MapPin,
  Calendar,
  X,
  CreditCard,
  Bot,
  Sliders,
  Copy,
  Check,
  Globe,
  FileText,
  Eye,
  ShieldCheck
} from 'lucide-react';
import { api } from '../../api';
import { Order, OrderMetrics } from '../../types';
import { AIOrderSettingsModal } from './AIOrderSettingsModal';
import { CourierModal } from './CourierModal';
import { DeliveryCourierListView } from './DeliveryCourierListView';
import { CustomerFraudBadge, QuickFraudCheckerModal } from './CustomerFraudBadge';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  COURIER_PROVIDERS,
  getDefaultCourierId,
  getCourierById,
  sendOrderToCourier,
  formatOrderForCourier
} from '../../utils/courierUtils';

interface OrdersViewProps {
  onGoToInbox?: (customerId?: string, platform?: 'whatsapp' | 'messenger' | 'instagram') => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ onGoToInbox }) => {
  const [orderHubTab, setOrderHubTab] = useState<'all' | 'delivery-courier'>('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [metrics, setMetrics] = useState<OrderMetrics>({
    totalRevenue: 0,
    confirmedCount: 0,
    processingCount: 0,
    deliveredCount: 0,
    cancelledCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'whatsapp' | 'messenger' | 'instagram'>('all');
  const [selectedSourceType, setSelectedSourceType] = useState<'all' | 'website' | 'manual_ai'>('all');

  // Modal states
  const [activeOrderDetails, setActiveOrderDetails] = useState<Order | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAISettingsModal, setShowAISettingsModal] = useState(false);
  const [showCourierModal, setShowCourierModal] = useState(false);
  const [showFraudCheckerModal, setShowFraudCheckerModal] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [copiedTextReport, setCopiedTextReport] = useState(false);
  const [selectedCourierOrder, setSelectedCourierOrder] = useState<Order | null>(null);
  const [courierModalTab, setCourierModalTab] = useState<'quick' | 'settings'>('quick');
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [deletingOrder, setDeletingOrder] = useState(false);
  const [courierToast, setCourierToast] = useState<{ title: string; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Manual Order Form
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerAddress, setNewCustomerAddress] = useState('');
  const [newPlatform, setNewPlatform] = useState<'whatsapp' | 'messenger' | 'instagram'>('whatsapp');
  const [newItems, setNewItems] = useState('');
  const [newQuantity, setNewQuantity] = useState(1);
  const [newTotalAmount, setNewTotalAmount] = useState(1450);
  const [newPaymentMethod, setNewPaymentMethod] = useState<'cod' | 'bkash' | 'nagad' | 'bank'>('cod');
  const [newPaymentStatus, setNewPaymentStatus] = useState<'pending' | 'paid'>('pending');
  const [newStatus, setNewStatus] = useState<Order['status']>('confirmed');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    loadOrders();
  }, [selectedStatus, selectedPlatform, selectedSourceType]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.getOrders({
        status: selectedStatus,
        platform: selectedPlatform,
        sourceType: selectedSourceType,
        search: searchQuery
      });
      setOrders(res.orders || []);
      if (res.metrics) {
        setMetrics(res.metrics);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrders();
  };

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      const res = await api.updateOrder(orderId, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? res.order : o));
      if (activeOrderDetails && activeOrderDetails.id === orderId) {
        setActiveOrderDetails(res.order);
      }
      loadOrders();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDeleteOrder = (order: Order) => {
    setOrderToDelete(order);
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    try {
      setDeletingOrder(true);
      await api.deleteOrder(orderToDelete.id);
      setOrders(prev => prev.filter(o => o.id !== orderToDelete.id));
      if (activeOrderDetails?.id === orderToDelete.id) {
        setActiveOrderDetails(null);
      }
      setCourierToast({
        title: 'Order Deleted',
        message: `Order #${orderToDelete.id.slice(-6).toUpperCase()} was deleted successfully.`
      });
      setTimeout(() => setCourierToast(null), 3000);
      setOrderToDelete(null);
      loadOrders();
    } catch (err) {
      console.error('Failed to delete order:', err);
    } finally {
      setDeletingOrder(false);
    }
  };

  const defaultCourier = getCourierById(getDefaultCourierId());

  const handleWhatsAppMessage = (order: Order) => {
    const phone = (order.customer_phone || '').replace(/[^0-9]/g, '');
    if (!phone) {
      setCourierToast({
        title: 'Missing Phone Number',
        message: 'Customer phone number is not available for WhatsApp messaging.'
      });
      setTimeout(() => setCourierToast(null), 4000);
      return;
    }
    const intlPhone = phone.startsWith('01') ? `88${phone}` : phone;
    const storeLabel = order.source_details?.store_name || 'Our Store';
    const text = encodeURIComponent(
      `Hello ${order.customer_name}! 🌟\nThis is regarding your order #${order.id.slice(-6).toUpperCase()} (${order.items}) from ${storeLabel}. Please reply to this message if you need delivery updates or assistance. Thank you!`
    );
    window.open(`https://wa.me/${intlPhone}?text=${text}`, '_blank');
  };

  const handleQuickCourier = async (order: Order, courierId?: string) => {
    try {
      const res = await sendOrderToCourier(order, courierId);
      setCourierToast({
        title: `🚚 1-Click Dispatched to ${res.courierName}!`,
        message: `Tracking ID: ${res.trackingNumber || 'Assigned'} (${res.mode === 'live_api' ? 'Live API Booked' : 'Instant Smart Dispatch'}). Parcel details for "${order.customer_name}" copied to clipboard!`
      });
      loadOrders();
      setTimeout(() => {
        setCourierToast(null);
      }, 5000);
    } catch (err) {
      console.error('Courier send error:', err);
    }
  };

  const generateOrdersTextReport = () => {
    const dateStr = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });
    let text = `=======================================================\n`;
    text += `ONE AGENT BD - ORDERS EXPORT REPORT\n`;
    text += `Export Date: ${dateStr} (Dhaka Time)\n`;
    text += `Total Orders: ${orders.length} | Confirmed/Processing/Shipped\n`;
    text += `=======================================================\n\n`;

    orders.forEach((o, index) => {
      text += `[ ORDER #${index + 1} | ID: #${o.id.slice(-6).toUpperCase()} ]\n`;
      text += `Date: ${new Date(o.created_at).toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })}\n`;
      text += `Customer Name: ${o.customer_name}\n`;
      text += `Phone Number: ${o.customer_phone || 'N/A'}\n`;
      text += `Delivery Address: ${o.customer_address || 'Provided in customer chat'}\n`;
      text += `Ordered Items: ${o.items} (Quantity: ${o.quantity || 1})\n`;
      text += `Total Amount: BDT ${o.total_amount || 0}\n`;
      text += `Payment Method: ${(o.payment_method || 'COD').toUpperCase()} (${(o.payment_status || 'pending').toUpperCase()})\n`;
      text += `Order Status: ${o.status.toUpperCase()}\n`;
      text += `Order Source: ${o.order_source === 'website' ? `Website (${o.source_details?.store_name || o.platform})` : o.platform.toUpperCase()}\n`;
      if (o.notes) text += `Notes: ${o.notes}\n`;
      text += `-------------------------------------------------------\n\n`;
    });
    return text;
  };

  const handleExportText = () => {
    if (orders.length === 0) {
      setCourierToast({ title: 'Export Empty', message: 'No orders available to export.' });
      setTimeout(() => setCourierToast(null), 3000);
      return;
    }
    const text = generateOrdersTextReport();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.setAttribute('download', `OneAgentBD_Orders_${dateStr}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (orders.length === 0) {
      setCourierToast({ title: 'Export Empty', message: 'No orders available to export.' });
      setTimeout(() => setCourierToast(null), 3000);
      return;
    }

    const headers = [
      'Order ID',
      'Date (Asia/Dhaka)',
      'Customer Name',
      'Phone Number',
      'Platform',
      'Items Ordered',
      'Quantity',
      'Total Amount (BDT)',
      'Payment Method',
      'Payment Status',
      'Order Status',
      'Delivery Address',
      'Order Source',
      'Notes'
    ];

    const rows = orders.map(o => [
      `"${o.id}"`,
      `"${new Date(o.created_at).toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })}"`,
      `"${(o.customer_name || '').replace(/"/g, '""')}"`,
      `"${o.customer_phone || ''}"`,
      `"${o.platform}"`,
      `"${(o.items || '').replace(/"/g, '""')}"`,
      o.quantity || 1,
      o.total_amount,
      `"${o.payment_method}"`,
      `"${o.payment_status}"`,
      `"${o.status}"`,
      `"${(o.customer_address || '').replace(/"/g, '""')}"`,
      `"${o.order_source}"`,
      `"${(o.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.setAttribute('download', `OneAgentBD_Orders_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim() || !newItems.trim()) return;

    try {
      setSubmitting(true);
      const res = await api.createOrder({
        customer_name: newCustomerName,
        customer_phone: newCustomerPhone,
        customer_address: newCustomerAddress,
        platform: newPlatform,
        items: newItems,
        quantity: Number(newQuantity) || 1,
        total_amount: Number(newTotalAmount) || 0,
        payment_method: newPaymentMethod,
        payment_status: newPaymentStatus,
        status: newStatus,
        notes: newNotes
      });

      setShowAddModal(false);
      // Reset form
      setNewCustomerName('');
      setNewCustomerPhone('');
      setNewCustomerAddress('');
      setNewItems('');
      setNewQuantity(1);
      setNewTotalAmount(899);
      setNewNotes('');

      loadOrders();
    } catch (err: any) {
      setCourierToast({ title: 'Error Creating Order', message: err.message || 'Failed to create manual order' });
      setTimeout(() => setCourierToast(null), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            Confirmed
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Clock className="w-3 h-3" />
            Processing
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <Truck className="w-3 h-3" />
            Shipped
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
            <CheckCheck className="w-3 h-3" />
            Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            {status}
          </span>
        );
    }
  };

  const getPaymentBadge = (method: Order['payment_method'], status: Order['payment_status']) => {
    const isPaid = status === 'paid';
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs uppercase font-bold tracking-wider text-neutral-600 dark:text-neutral-300">
          {method === 'cod' ? 'COD' : method.toUpperCase()}
        </span>
        <span
          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
            isPaid
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
          }`}
        >
          {isPaid ? 'PAID' : 'PENDING'}
        </span>
      </div>
    );
  };

  const getSourceBadge = (order: Order) => {
    if (order.order_source === 'website') {
      const storePlatform = order.source_details?.platform || (order.platform === 'shopify' || order.platform === 'woocommerce' ? order.platform : 'website');
      const storeName = order.source_details?.store_name || (storePlatform === 'shopify' ? 'Shopify' : storePlatform === 'woocommerce' ? 'WooCommerce' : 'Website');
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20" title={`Imported from ${storeName}`}>
          <Globe className="w-3 h-3 text-purple-500" />
          <span className="truncate max-w-[100px]">{storeName}</span>
        </span>
      );
    }
    if (order.order_source === 'ai_detected') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
          <Sparkles className="w-3 h-3" />
          AI Auto
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
        <Edit3 className="w-3 h-3" />
        Manual
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-violet-600/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
                Confirmed Orders Hub
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Automated order log detected and confirmed by AI (WhatsApp & Messenger)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowFraudCheckerModal(true)}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Check customer courier delivery ratio & fake order risk"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Fraud Check</span>
          </button>
          <button
            onClick={() => {
              setSelectedCourierOrder(null);
              setCourierModalTab('quick');
              setShowCourierModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
            title="Configure delivery apps credentials (Steadfast, Pathao, RedX) and 1-click dispatch"
          >
            <Truck className="w-4 h-4 text-emerald-200" />
            <span>Delivery Apps & Courier</span>
          </button>
          <button
            onClick={() => setShowAISettingsModal(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-violet-600/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Bot className="w-4 h-4 text-violet-200" />
            <span>AI Order Rules</span>
          </button>
          <button
            onClick={handleExportText}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 text-neutral-800 dark:text-neutral-200 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Download clean plain text file (.txt) that opens in any notepad without errors"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Export Text (.txt)</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 text-neutral-700 dark:text-neutral-200 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Export standard CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-neutral-500" />
            <span>CSV</span>
          </button>
          <button
            onClick={() => setShowTextModal(true)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 text-neutral-700 dark:text-neutral-200 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Read orders text on screen or copy directly"
          >
            <Eye className="w-3.5 h-3.5 text-neutral-500" />
            <span>View Text</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Order</span>
          </button>
          <button
            onClick={() => loadOrders()}
            title="Reload Orders"
            className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Order Hub Views Selector (Tabs) */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 w-fit">
        <button
          onClick={() => setOrderHubTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            orderHubTab === 'all'
              ? 'bg-white dark:bg-neutral-900 text-[#7F22FE] shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>All Orders</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold">
            {orders.length}
          </span>
        </button>

        <button
          onClick={() => setOrderHubTab('delivery-courier')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            orderHubTab === 'delivery-courier'
              ? 'bg-[#7F22FE] text-white shadow-md shadow-[#7F22FE]/20'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Delivery & Courier List</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            orderHubTab === 'delivery-courier'
              ? 'bg-white/25 text-white'
              : 'bg-[#7F22FE]/10 text-[#7F22FE]'
          }`}>
            {orders.filter(o => o.status === 'confirmed' || o.status === 'processing').length}
          </span>
        </button>
      </div>

      {/* Tab 2: Delivery & Courier List View (Bulk Actions & Dispatch) */}
      {orderHubTab === 'delivery-courier' && (
        <DeliveryCourierListView
          orders={orders}
          onRefreshOrders={loadOrders}
          onOpenIndividualCourierModal={(order) => {
            setSelectedCourierOrder(order);
            setCourierModalTab('quick');
            setShowCourierModal(true);
          }}
        />
      )}

      {/* Tab 1: All Orders View */}
      {orderHubTab === 'all' && (
        <>
          {/* 1-Click Delivery Apps Quick Integration Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#7F22FE]/10 via-[#7F22FE]/5 to-transparent border border-[#7F22FE]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#7F22FE] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#7F22FE]/25">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-neutral-900 dark:text-white">1-Click Delivery Apps Integration:</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#7F22FE]/10 text-[#7F22FE] border border-[#7F22FE]/20">
                    Active: {defaultCourier.name}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5">
                  Connect your delivery app (Steadfast, Pathao, RedX, Paperfly, eCourier). Click &quot;Send to Courier&quot; on any order to automatically copy customer data & open portal!
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedCourierOrder(null);
                setCourierModalTab('settings');
                setShowCourierModal(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#7F22FE] hover:bg-[#6c1ce0] text-white font-bold text-xs shadow-xs cursor-pointer shrink-0 flex items-center gap-1.5 transition-all self-start sm:self-auto"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Delivery App Settings</span>
            </button>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs hover:border-[#7F22FE]/30 transition-all">
              <div className="flex items-center justify-between text-neutral-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Confirmed</span>
                <div className="w-8 h-8 rounded-lg bg-[#7F22FE]/10 text-[#7F22FE] flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-neutral-900 dark:text-white">
                {metrics.confirmedCount + metrics.processingCount + metrics.deliveredCount}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                {metrics.confirmedCount} newly confirmed
              </div>
            </div>

            <div className="p-4.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs hover:border-[#7F22FE]/30 transition-all">
              <div className="flex items-center justify-between text-neutral-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
                <div className="w-8 h-8 rounded-lg bg-[#7F22FE]/10 text-[#7F22FE] flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-neutral-900 dark:text-white">
                BDT {metrics.totalRevenue.toLocaleString()}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Excluding cancelled orders
              </div>
            </div>

            <div className="p-4.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs hover:border-[#7F22FE]/30 transition-all">
              <div className="flex items-center justify-between text-neutral-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Processing / Shipped</span>
                <div className="w-8 h-8 rounded-lg bg-[#7F22FE]/10 text-[#7F22FE] flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-neutral-900 dark:text-white">
                {metrics.processingCount}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Awaiting fulfillment / dispatch
              </div>
            </div>

            <div className="p-4.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs hover:border-[#7F22FE]/30 transition-all">
              <div className="flex items-center justify-between text-neutral-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Delivered</span>
                <div className="w-8 h-8 rounded-lg bg-[#7F22FE]/10 text-[#7F22FE] flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-neutral-900 dark:text-white">
                {metrics.deliveredCount}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Successfully completed
          </div>
        </div>
      </div>

      {/* Order Source Tabs & Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3">
        {/* Source Selector (Website vs Manual/AI) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 w-fit flex-wrap">
            <button
              onClick={() => setSelectedSourceType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedSourceType === 'all'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              All Orders
            </button>
            <button
              onClick={() => setSelectedSourceType('website')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedSourceType === 'website'
                  ? 'bg-white dark:bg-neutral-700 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-purple-500" />
              <span>Website Orders</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold">PRO</span>
            </button>
            <button
              onClick={() => setSelectedSourceType('manual_ai')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedSourceType === 'manual_ai'
                  ? 'bg-white dark:bg-neutral-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-emerald-500" />
              <span>Manual & AI Orders</span>
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer, phone, order..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </form>
        </div>

        {/* Status Tabs and Platform filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Status' },
              { id: 'confirmed', label: 'Confirmed' },
              { id: 'processing', label: 'Processing' },
              { id: 'shipped', label: 'Shipped' },
              { id: 'delivered', label: 'Delivered' },
              { id: 'cancelled', label: 'Cancelled' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedStatus === tab.id
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1 shrink-0">
            <button
              onClick={() => setSelectedPlatform('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedPlatform === 'all'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              All Channels
            </button>
            <button
              onClick={() => setSelectedPlatform('whatsapp')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                selectedPlatform === 'whatsapp'
                  ? 'bg-white dark:bg-neutral-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              WhatsApp
            </button>
            <button
              onClick={() => setSelectedPlatform('messenger')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                selectedPlatform === 'messenger'
                  ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              <Facebook className="w-3.5 h-3.5" />
              Messenger
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 text-violet-500 animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
              Loading confirmed orders...
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              No orders found
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto mt-1">
              Whenever a customer places an order on WhatsApp or Messenger with their name, address, or phone number, One Agent BD will automatically log it here.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-md shadow-violet-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add First Order Manually
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-semibold border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="py-3 px-4">Order ID & Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Items / Details</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-neutral-700 dark:text-neutral-200">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-violet-600 dark:text-violet-400">
                        #{order.id.slice(-6).toUpperCase()}
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-neutral-900 dark:text-white">
                          {order.customer_name}
                        </span>
                      </div>
                      {order.customer_phone && (
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 flex-wrap mt-0.5">
                          <span className="inline-flex items-center gap-1">
                            <Phone className="w-3 h-3 text-neutral-400" />
                            <a
                              href={`tel:${order.customer_phone}`}
                              className="hover:underline hover:text-violet-500"
                            >
                              {order.customer_phone}
                            </a>
                          </span>
                          <CustomerFraudBadge
                            phone={order.customer_phone}
                            customerName={order.customer_name}
                            allOrders={orders}
                          />
                        </div>
                      )}
                      {order.customer_address && order.customer_address !== 'Address provided in chat' && (
                        <div className="text-[11px] text-neutral-400 truncate max-w-[180px] flex items-center gap-1 mt-0.5" title={order.customer_address}>
                          <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                          <span className="truncate">{order.customer_address}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {order.platform === 'whatsapp' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <Smartphone className="w-3 h-3" />
                          WhatsApp
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          <Facebook className="w-3 h-3" />
                          Messenger
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 max-w-[220px]">
                      <div className="font-medium text-neutral-900 dark:text-white truncate" title={order.items}>
                        {order.items}
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        Qty: {order.quantity || 1}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-sm font-black text-neutral-900 dark:text-white">
                        BDT {order.total_amount?.toLocaleString() || 0}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {getPaymentBadge(order.payment_method, order.payment_status)}
                    </td>

                    <td className="py-3.5 px-4">
                      {getSourceBadge(order)}
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                        className="text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-800 border-none py-1 px-2 text-neutral-800 dark:text-neutral-200 focus:ring-1 focus:ring-violet-500 cursor-pointer"
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* 1-Click WhatsApp Direct Message */}
                        <button
                          onClick={() => handleWhatsAppMessage(order)}
                          title="1-Click WhatsApp Message to Customer"
                          className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1 font-semibold"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span className="text-[10px] hidden md:inline">WhatsApp</span>
                        </button>

                        {/* 1-Click Send to Courier */}
                        <button
                          onClick={() => {
                            setSelectedCourierOrder(order);
                            setCourierModalTab('quick');
                            setShowCourierModal(true);
                          }}
                          title="1-Click Dispatch to Courier (Steadfast/Pathao/RedX)"
                          className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 transition-colors cursor-pointer flex items-center gap-1 font-semibold"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span className="text-[10px] hidden md:inline">Courier</span>
                        </button>

                        <button
                          onClick={() => setActiveOrderDetails(order)}
                          title="View Details / Receipt"
                          className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        {onGoToInbox && (
                          <button
                            onClick={() => onGoToInbox(order.customer_id, order.platform)}
                            title="Chat with Customer in Unified Inbox"
                            className="p-1.5 rounded-lg bg-violet-50 dark:bg-violet-950/60 hover:bg-violet-100 text-violet-600 dark:text-violet-400 transition-colors cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteOrder(order)}
                          title="Delete Order"
                          className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
        </>
      )}

      {/* Order Details Modal */}
      {activeOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                  Order #{activeOrderDetails.id.slice(-6).toUpperCase()}
                </span>
                <h3 className="text-lg font-black text-neutral-900 dark:text-white mt-0.5">
                  Order Details & Slip
                </h3>
              </div>
              <button
                onClick={() => setActiveOrderDetails(null)}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
              {/* Status and Source Banner */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60">
                <div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Order Status
                  </div>
                  <div className="mt-1">
                    {getStatusBadge(activeOrderDetails.status)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Capture Source
                  </div>
                  <div className="mt-1">
                    {activeOrderDetails.order_source === 'ai_detected' ? (
                      <span className="inline-flex items-center gap-1 font-bold text-violet-600 dark:text-violet-400">
                        <Sparkles className="w-3.5 h-3.5" />
                        AI Detected from Chat
                      </span>
                    ) : (
                      <span className="font-bold text-neutral-600 dark:text-neutral-300">
                        Manual Entry
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  Customer & Delivery Details
                </h4>
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Customer Name:</span>
                    <span className="font-bold text-neutral-900 dark:text-white">
                      {activeOrderDetails.customer_name}
                    </span>
                  </div>
                  {activeOrderDetails.customer_phone && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Contact Number:</span>
                      <a
                        href={`tel:${activeOrderDetails.customer_phone}`}
                        className="font-bold text-violet-600 dark:text-violet-400 hover:underline"
                      >
                        {activeOrderDetails.customer_phone}
                      </a>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Platform:</span>
                    <span className="font-bold capitalize text-neutral-900 dark:text-white flex items-center gap-1">
                      {activeOrderDetails.platform === 'whatsapp' ? (
                        <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Facebook className="w-3.5 h-3.5 text-blue-500" />
                      )}
                      {activeOrderDetails.platform}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Delivery Address:</span>
                    <span className="font-semibold text-right text-neutral-900 dark:text-white max-w-[240px]">
                      {activeOrderDetails.customer_address || 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ordered Items Breakdown */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  Items Breakdown
                </h4>
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-neutral-900 dark:text-white">
                        {activeOrderDetails.items}
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        Quantity: {activeOrderDetails.quantity || 1}
                      </div>
                    </div>
                    <div className="text-sm font-black text-neutral-900 dark:text-white">
                      BDT {activeOrderDetails.total_amount?.toLocaleString()}
                    </div>
                  </div>

                  <div className="border-t border-neutral-200 dark:border-neutral-700 pt-2 flex justify-between items-center text-neutral-500">
                    <span>Payment Method:</span>
                    <span className="font-bold uppercase text-neutral-900 dark:text-white">
                      {activeOrderDetails.payment_method === 'cod' ? 'Cash on Delivery (COD)' : activeOrderDetails.payment_method}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-neutral-500">
                    <span>Payment Status:</span>
                    <span className={`font-bold uppercase ${activeOrderDetails.payment_status === 'paid' ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {activeOrderDetails.payment_status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {activeOrderDetails.notes && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Internal Notes / Log
                  </h4>
                  <p className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 text-neutral-600 dark:text-neutral-300 text-xs italic">
                    "{activeOrderDetails.notes}"
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                {onGoToInbox && (
                  <button
                    onClick={() => {
                      const custId = activeOrderDetails.customer_id;
                      const plat = activeOrderDetails.platform;
                      setActiveOrderDetails(null);
                      onGoToInbox(custId, plat);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold flex items-center justify-center gap-1.5 shadow-md shadow-violet-600/20 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Open Customer Chat
                  </button>
                )}
                <button
                  onClick={() => window.print()}
                  className="py-2.5 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-800 dark:text-neutral-200 font-bold cursor-pointer"
                >
                  Print Slip
                </button>
                <button
                  onClick={() => setOrderToDelete(activeOrderDetails)}
                  className="py-2.5 px-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-400 font-bold cursor-pointer flex items-center gap-1.5"
                  title="Permanently delete this order"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Manual Order Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-neutral-900 dark:text-white">
                  Add New Order Manually
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Log an order received via telephone call, external channel, or offline
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualOrder} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    placeholder="e.g. Shakib Al Hasan"
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none text-neutral-900 dark:text-white focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    placeholder="017xxxxxxxx"
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none text-neutral-900 dark:text-white focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Delivery Address / Location
                </label>
                <input
                  type="text"
                  value={newCustomerAddress}
                  onChange={(e) => setNewCustomerAddress(e.target.value)}
                  placeholder="e.g. House 14, Road 2, Dhanmondi, Dhaka"
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none text-neutral-900 dark:text-white focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Channel Platform
                  </label>
                  <select
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none text-neutral-900 dark:text-white focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="messenger">Messenger</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none text-neutral-900 dark:text-white focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Ordered Items / Description *
                  </label>
                  <input
                    type="text"
                    required
                    value={newItems}
                    onChange={(e) => setNewItems(e.target.value)}
                    placeholder="e.g. Pro Plan / Premium Package (Standard)"
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none text-neutral-900 dark:text-white focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(Number(e.target.value) || 1)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none text-neutral-900 dark:text-white focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Total Amount (BDT) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newTotalAmount}
                    onChange={(e) => setNewTotalAmount(Number(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none text-neutral-900 dark:text-white focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={newPaymentMethod}
                    onChange={(e) => setNewPaymentMethod(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none text-neutral-900 dark:text-white focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="cod">Cash on Delivery (COD)</option>
                    <option value="bkash">bKash</option>
                    <option value="nagad">Nagad</option>
                    <option value="bank">Bank</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={newPaymentStatus}
                    onChange={(e) => setNewPaymentStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none text-neutral-900 dark:text-white focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Notes / Instructions
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Additional order instructions or notes..."
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none text-neutral-900 dark:text-white focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold transition-all shadow-md shadow-violet-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* On-Screen Text File Viewer & Instant Copy Modal */}
      {showTextModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-neutral-900 dark:text-white">
                    Orders Text Report (.txt)
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Clean formatted text report of all orders. Read on-screen, copy, or download.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTextModal(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
                  Total Orders in Report: {orders.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      const text = generateOrdersTextReport();
                      await navigator.clipboard.writeText(text);
                      setCopiedTextReport(true);
                      setTimeout(() => setCopiedTextReport(false), 2000);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    {copiedTextReport ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedTextReport ? 'Copied to Clipboard!' : 'Copy All Text'}</span>
                  </button>
                  <button
                    onClick={handleExportText}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .txt File</span>
                  </button>
                </div>
              </div>

              <textarea
                readOnly
                value={generateOrdersTextReport()}
                rows={14}
                className="w-full p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 font-mono text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* AI Order Confirmation Settings Modal */}
      <AIOrderSettingsModal
        isOpen={showAISettingsModal}
        onClose={() => setShowAISettingsModal(false)}
        onSaved={() => loadOrders()}
      />

      {/* Delivery Apps & Courier Integration Modal */}
      <CourierModal
        isOpen={showCourierModal}
        onClose={() => setShowCourierModal(false)}
        order={selectedCourierOrder}
        orders={orders}
        initialTab={courierModalTab}
        onOrderShipped={(orderId) => {
          handleStatusChange(orderId, 'shipped');
        }}
      />

      {/* Customer Fraud & Courier Success Checker Modal */}
      <QuickFraudCheckerModal
        isOpen={showFraudCheckerModal}
        onClose={() => setShowFraudCheckerModal(false)}
        allOrders={orders}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!orderToDelete}
        onClose={() => setOrderToDelete(null)}
        onConfirm={confirmDeleteOrder}
        isLoading={deletingOrder}
        title={`Delete Order #${orderToDelete?.id.slice(-6).toUpperCase()}`}
        message={`Are you sure you want to permanently delete order #${orderToDelete?.id.slice(-6).toUpperCase()} for ${orderToDelete?.customer_name}? All customer data and records for this order will be removed.`}
        confirmText="Yes, Delete Order"
      />
    </div>
  );
};
