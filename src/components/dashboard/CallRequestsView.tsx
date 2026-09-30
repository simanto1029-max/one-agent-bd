import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  Phone,
  PhoneForwarded,
  MessageSquare,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  Trash2,
  Sparkles,
  AlertCircle,
  User,
  Calendar,
  Filter,
  Check,
  X,
  Copy,
  Send
} from 'lucide-react';
import { CallRequest, Order } from '../../types';
import { api } from '../../api';
import { ConfirmModal } from '../common/ConfirmModal';

interface CallRequestsViewProps {
  onNavigateToOrders?: () => void;
  onOpenCustomerChat?: (platform: string, customerId: string) => void;
}

function hasValidPhone(phone?: string): boolean {
  if (!phone || phone === 'Pending in chat') return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10;
}

export const CallRequestsView: React.FC<CallRequestsViewProps> = ({
  onNavigateToOrders,
  onOpenCustomerChat
}) => {
  const [requests, setRequests] = useState<CallRequest[]>([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    calledRequests: 0,
    convertedRequests: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'called' | 'converted_to_order' | 'cancelled'>('all');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [convertingRequest, setConvertingRequest] = useState<CallRequest | null>(null);
  const [callingRequest, setCallingRequest] = useState<CallRequest | null>(null);
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);
  const [callModalCopied, setCallModalCopied] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<CallRequest | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [askingPhoneId, setAskingPhoneId] = useState<string | null>(null);
  const [editingPhoneId, setEditingPhoneId] = useState<string | null>(null);
  const [editingPhoneValue, setEditingPhoneValue] = useState<string>('');

  const handleCopyPhone = async (phone: string, id: string) => {
    try {
      await navigator.clipboard.writeText(phone);
      setCopiedPhoneId(id);
      setTimeout(() => setCopiedPhoneId(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenCallModal = (req: CallRequest) => {
    setCallingRequest(req);
    setCallModalCopied(false);
    setEditingPhoneValue(hasValidPhone(req.customer_phone) ? req.customer_phone : '');
    if (req.status === 'pending' && hasValidPhone(req.customer_phone)) {
      handleStatusChange(req.id, 'called');
    }
  };

  const handleAskPhoneInChat = async (req: CallRequest) => {
    if (!req.customer_id || askingPhoneId === req.id) return;
    try {
      setAskingPhoneId(req.id);
      setToastError(null);
      await api.sendReply({
        customerId: req.customer_id,
        customerName: req.customer_name,
        platform: (req.platform as any) || 'messenger',
        messageText:
          'Hello! You requested to speak with our team on the phone. 📞 Please share your active mobile or WhatsApp number here, and our representative will call you shortly.'
      });
      await api.updateCallRequest(req.id, {
        status: 'pending',
        notes: 'Requested phone number in customer chat (will auto-attach as soon as the customer replies with their number)'
      });
      setToastMessage(
        `✅ Sent a phone number request to ${req.customer_name}'s chat! Their phone number will be attached automatically as soon as they reply.`
      );
      setTimeout(() => setToastMessage(null), 5000);
      await loadRequests();
    } catch (err: any) {
      setToastError(err?.message || 'Could not send message to customer chat');
    } finally {
      setAskingPhoneId(null);
    }
  };

  const handleSaveManualPhone = async (req: CallRequest, phoneInput: string) => {
    const trimmed = phoneInput.trim();
    if (!trimmed) {
      setToastError('Please enter a valid mobile number');
      return;
    }
    try {
      setSubmitting(true);
      await api.updateCallRequest(req.id, {
        customer_phone: trimmed,
        status: 'pending',
        notes: `Phone number (${trimmed}) saved — Ready to call`
      });
      setEditingPhoneId(null);
      setEditingPhoneValue('');
      if (callingRequest && callingRequest.id === req.id) {
        setCallingRequest({ ...callingRequest, customer_phone: trimmed });
      }
      setToastMessage(`✅ Phone number (${trimmed}) saved! You can now call the customer directly.`);
      setTimeout(() => setToastMessage(null), 4000);
      await loadRequests();
    } catch (err: any) {
      setToastError(err?.message || 'Failed to save phone number');
    } finally {
      setSubmitting(false);
    }
  };

  // Manual Add Form
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newPlatform, setNewPlatform] = useState<'whatsapp' | 'messenger'>('whatsapp');
  const [newMessageExcerpt, setNewMessageExcerpt] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Conversion Form
  const [convertItems, setConvertItems] = useState('Product Order Confirmed');
  const [convertQuantity, setConvertQuantity] = useState(1);
  const [convertTotalAmount, setConvertTotalAmount] = useState(1450);
  const [convertAddress, setConvertAddress] = useState('Dhaka, Bangladesh');
  const [convertPaymentMethod, setConvertPaymentMethod] = useState<'cod' | 'bkash' | 'nagad'>('cod');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await api.getCallRequests();
      setRequests(res.requests || []);
      setStats(res.stats || {
        totalRequests: res.requests?.length || 0,
        pendingRequests: res.requests?.filter((r) => r.status === 'pending').length || 0,
        calledRequests: res.requests?.filter((r) => r.status === 'called').length || 0,
        convertedRequests: res.requests?.filter((r) => r.status === 'converted_to_order').length || 0
      });
    } catch (err: any) {
      console.error('Failed to load call requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: CallRequest['status']) => {
    try {
      await api.updateCallRequest(id, { status: newStatus });
      setToastMessage(`Status updated to ${newStatus}`);
      setTimeout(() => setToastMessage(null), 3000);
      await loadRequests();
    } catch (err: any) {
      setToastError(err.message || 'Failed to update status');
    }
  };

  const confirmDelete = async () => {
    if (!requestToDelete) return;
    try {
      setDeleting(true);
      await api.deleteCallRequest(requestToDelete.id);
      setToastMessage('Call request removed');
      setTimeout(() => setToastMessage(null), 3000);
      setRequestToDelete(null);
      await loadRequests();
    } catch (err: any) {
      setToastError(err.message || 'Failed to delete request');
    } finally {
      setDeleting(false);
    }
  };

  const handleSimulate = async () => {
    try {
      setSubmitting(true);
      const res = await api.simulateCallRequest();
      setToastMessage(`✨ Added test call request from ${res.request.customer_name}!`);
      setTimeout(() => setToastMessage(null), 4000);
      await loadRequests();
    } catch (err: any) {
      setToastError(err.message || 'Simulation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerPhone.trim()) {
      setToastError('Customer phone number is required');
      return;
    }
    try {
      setSubmitting(true);
      await api.createCallRequest({
        customer_name: newCustomerName.trim() || 'Valued Customer',
        customer_phone: newCustomerPhone.trim(),
        platform: newPlatform,
        message_excerpt: newMessageExcerpt.trim() || 'Manual call back request',
        notes: newNotes.trim()
      });
      setShowAddModal(false);
      setNewCustomerName('');
      setNewCustomerPhone('');
      setNewMessageExcerpt('');
      setNewNotes('');
      setToastMessage('Call request added to queue!');
      setTimeout(() => setToastMessage(null), 3000);
      await loadRequests();
    } catch (err: any) {
      setToastError(err.message || 'Failed to add request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenConvertModal = (req: CallRequest) => {
    setConvertingRequest(req);
    setConvertAddress('Dhaka, Bangladesh');
    setConvertItems(req.notes || 'Order confirmed over call');
    setConvertQuantity(1);
    setConvertTotalAmount(1450);
  };

  const handleConvertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingRequest) return;
    try {
      setSubmitting(true);
      const res = await api.convertCallRequestToOrder(convertingRequest.id, {
        items: convertItems.trim() || 'Confirmed over call',
        quantity: Number(convertQuantity) || 1,
        total_amount: Number(convertTotalAmount) || 0,
        customer_address: convertAddress.trim() || 'Dhaka, Bangladesh',
        payment_method: convertPaymentMethod,
        notes: `Customer contact: ${convertingRequest.customer_phone}. Original inquiry: ${convertingRequest.message_excerpt}`
      });

      setConvertingRequest(null);
      setToastMessage(`🎉 ${res.message}`);
      setTimeout(() => setToastMessage(null), 5000);
      await loadRequests();
    } catch (err: any) {
      setToastError(err.message || 'Failed to convert call to order');
    } finally {
      setSubmitting(false);
    }
  };

  const openWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const internationalPhone = cleanPhone.startsWith('01') ? `88${cleanPhone}` : cleanPhone;
    const text = encodeURIComponent(
      `Assalamu Alaikum ${name},\nOne Agent BD er call request queue theke apnake contact kora hocche. Apnar purno order confirm korte amader team apnake call korbe ba apnar order er shob details dite paren.`
    );
    window.open(`https://wa.me/${internationalPhone}?text=${text}`, '_blank');
  };

  const filteredRequests = requests.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.customer_name?.toLowerCase().includes(q);
      const matchPhone = r.customer_phone?.toLowerCase().includes(q);
      const matchMsg = r.message_excerpt?.toLowerCase().includes(q);
      const matchNotes = r.notes?.toLowerCase().includes(q);
      return matchName || matchPhone || matchMsg || matchNotes;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
                Human Contact & Call List
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                {stats.pendingRequests} PENDING CALLS
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Customers who asked to speak with a human agent or requested phone contact in WhatsApp & Messenger chat.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onNavigateToOrders && (
            <button
              onClick={onNavigateToOrders}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              Orders Hub
            </button>
          )}

          <button
            onClick={handleSimulate}
            disabled={submitting}
            title="Simulate a customer in chat asking for human call"
            className="px-3.5 py-2 rounded-xl bg-violet-50 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800 hover:bg-violet-100 dark:hover:bg-violet-900/60 text-violet-700 dark:text-violet-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span>Simulate Customer Call Request</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-neutral-950 text-xs font-black transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Log Call Manually
          </button>

          <button
            onClick={() => loadRequests()}
            title="Refresh List"
            className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {toastError && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
          <span>{toastError}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Callbacks</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {stats.pendingRequests}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Waiting for merchant phone call
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Spoken Over Phone</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <PhoneForwarded className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {stats.calledRequests}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Calls completed with customer
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Converted to Orders</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {stats.convertedRequests}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Directly confirmed into Orders Hub
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Inquiries</span>
            <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-neutral-900 dark:text-white">
            {stats.totalRequests}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            All customer phone callback logs
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-neutral-900 p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'pending', 'called', 'converted_to_order', 'cancelled'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              {st === 'all' && 'All Requests'}
              {st === 'pending' && `Pending (${stats.pendingRequests})`}
              {st === 'called' && 'Called'}
              {st === 'converted_to_order' && 'Converted to Order'}
              {st === 'cancelled' && 'Cancelled'}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, phone, message..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none text-neutral-900 dark:text-white placeholder-neutral-400 focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      {/* Call Requests List */}
      {loading ? (
        <div className="py-16 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <RefreshCw className="w-7 h-7 text-amber-500 animate-spin mx-auto mb-2" />
          <p className="text-xs text-neutral-500">Loading call requests queue...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
            <PhoneCall className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-neutral-900 dark:text-white">
            No call requests found
          </h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto mt-1">
            When a customer writes in WhatsApp or Messenger that they want to speak with a human agent, their phone number and message appear here instantly.
          </p>
          <button
            onClick={handleSimulate}
            className="mt-4 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-black inline-flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Simulate a Customer Call Request
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((req) => {
            const isPending = req.status === 'pending';
            const isCalled = req.status === 'called';
            const isConverted = req.status === 'converted_to_order';

            return (
              <div
                key={req.id}
                className={`p-4.5 rounded-2xl bg-white dark:bg-neutral-900 border transition-all shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  isPending
                    ? 'border-amber-400/60 dark:border-amber-500/40 hover:border-amber-500'
                    : isConverted
                    ? 'border-emerald-200 dark:border-emerald-800/80'
                    : 'border-neutral-200 dark:border-neutral-800'
                }`}
              >
                {/* Left: Customer Info & Query Excerpt */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-bold ${
                      isPending
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        : isConverted
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    <PhoneCall className="w-5 h-5" />
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-black text-neutral-900 dark:text-white">
                        {req.customer_name}
                      </h4>
                      {hasValidPhone(req.customer_phone) ? (
                        <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">
                          <span>{req.customer_phone}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyPhone(req.customer_phone, req.id)}
                            title="Copy phone number to dial"
                            className="hover:text-emerald-600 transition-colors p-0.5 cursor-pointer flex items-center"
                          >
                            {copiedPhoneId === req.id ? (
                              <span className="text-[10px] text-emerald-600 font-sans font-bold flex items-center gap-0.5">
                                <Check className="w-3 h-3" /> Copied
                              </span>
                            ) : (
                              <Copy className="w-3 h-3 text-neutral-400 hover:text-emerald-600" />
                            )}
                          </button>
                        </div>
                      ) : editingPhoneId === req.id ? (
                        <div className="inline-flex items-center gap-1">
                          <input
                            type="text"
                            value={editingPhoneValue}
                            onChange={(e) => setEditingPhoneValue(e.target.value)}
                            placeholder="017XXXXXXXX"
                            className="px-2 py-0.5 text-xs font-mono rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-amber-400 text-neutral-900 dark:text-white w-32 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveManualPhone(req, editingPhoneValue)}
                            className="px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPhoneId(null);
                              setEditingPhoneValue('');
                            }}
                            className="px-1.5 py-0.5 text-xs text-neutral-400 hover:text-neutral-700 cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-300/70 dark:border-amber-800">
                            <Clock className="w-3 h-3" />
                            <span>No Phone Yet (Pending in chat)</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPhoneId(req.id);
                              setEditingPhoneValue('');
                            }}
                            className="text-[11px] font-bold text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
                          >
                            + Add Number
                          </button>
                        </div>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          req.platform === 'whatsapp'
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                            : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                        }`}
                      >
                        {req.platform}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          isPending
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse'
                            : isCalled
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                            : isConverted
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-neutral-200 text-neutral-600'
                        }`}
                      >
                        {req.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-700 dark:text-neutral-300 italic bg-neutral-50 dark:bg-neutral-800/60 p-2 rounded-xl border border-neutral-100 dark:border-neutral-800">
                      "{req.message_excerpt}"
                    </p>

                    {req.notes && (
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        <span className="font-bold text-neutral-600 dark:text-neutral-300">Note:</span> {req.notes}
                      </p>
                    )}

                    <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 pt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(req.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Instant Call, Ask Number in Messenger, Open Chat & Order Convert Actions */}
                <div className="flex items-center gap-2 flex-wrap shrink-0 self-end md:self-center">
                  {hasValidPhone(req.customer_phone) ? (
                    <>
                      {/* Phone Call Trigger */}
                      <button
                        type="button"
                        onClick={() => handleOpenCallModal(req)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Now</span>
                      </button>

                      {/* WhatsApp Message */}
                      <button
                        type="button"
                        onClick={() => openWhatsApp(req.customer_phone, req.customer_name)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>
                    </>
                  ) : (
                    <>
                      {/* 1-Click Ask Phone Number in Messenger/Instagram Chat */}
                      <button
                        type="button"
                        onClick={() => handleAskPhoneInChat(req)}
                        disabled={askingPhoneId === req.id}
                        title="Send a message in Messenger asking the customer for their phone number"
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-black transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{askingPhoneId === req.id ? 'Sending...' : 'Ask Phone in Chat'}</span>
                      </button>

                      {/* Open Customer Chat in Unified Inbox */}
                      {onOpenCustomerChat && req.customer_id && (
                        <button
                          type="button"
                          onClick={() => onOpenCustomerChat(req.platform, req.customer_id!)}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Open Chat</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenCallModal(req)}
                        className="px-2.5 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Options</span>
                      </button>
                    </>
                  )}

                  {/* Open Chat button when valid phone exists too */}
                  {hasValidPhone(req.customer_phone) && onOpenCustomerChat && req.customer_id && (
                    <button
                      type="button"
                      onClick={() => onOpenCustomerChat(req.platform, req.customer_id!)}
                      className="px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </button>
                  )}

                  {/* 1-Click Convert to Order */}
                  {!isConverted ? (
                    <button
                      onClick={() => handleOpenConvertModal(req)}
                      className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Convert to Order</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 px-2 py-1 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg">
                      <Check className="w-3.5 h-3.5" />
                      Order Created
                    </span>
                  )}

                  {/* Status Dropdown */}
                  <select
                    value={req.status}
                    onChange={(e) => handleStatusChange(req.id, e.target.value as any)}
                    className="px-2.5 py-1.5 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none text-neutral-700 dark:text-neutral-200 font-bold focus:ring-2 focus:ring-violet-500 cursor-pointer"
                  >
                    <option value="pending">Pending</option>
                    <option value="called">Called</option>
                    <option value="converted_to_order">Converted</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <button
                    onClick={() => setRequestToDelete(req)}
                    title="Delete Request"
                    className="p-1.5 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Convert Call to Order Modal */}
      {convertingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-violet-600/10 text-violet-600 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-neutral-900 dark:text-white">
                    Confirm Order from Call
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Customer: {convertingRequest.customer_name} ({convertingRequest.customer_phone})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setConvertingRequest(null)}
                className="p-1 text-neutral-400 hover:text-neutral-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConvertSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Product / Items Confirmed *
                </label>
                <input
                  type="text"
                  required
                  value={convertItems}
                  onChange={(e) => setConvertItems(e.target.value)}
                  placeholder="e.g., Wireless Headset / Custom Package"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none text-neutral-900 dark:text-white focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={convertQuantity}
                    onChange={(e) => setConvertQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none text-neutral-900 dark:text-white focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Total Amount (BDT) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={convertTotalAmount}
                    onChange={(e) => setConvertTotalAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none text-neutral-900 dark:text-white focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Delivery Address *
                </label>
                <textarea
                  rows={2}
                  required
                  value={convertAddress}
                  onChange={(e) => setConvertAddress(e.target.value)}
                  placeholder="House/Road, Area, District"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none text-neutral-900 dark:text-white focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Payment Method
                </label>
                <select
                  value={convertPaymentMethod}
                  onChange={(e) => setConvertPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none text-neutral-900 dark:text-white focus:ring-2 focus:ring-violet-500 cursor-pointer"
                >
                  <option value="cod">Cash on Delivery (COD)</option>
                  <option value="bkash">bKash</option>
                  <option value="nagad">Nagad</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConvertingRequest(null)}
                  className="px-4 py-2 text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Creating Order...' : 'Confirm Order to Hub'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-neutral-900 dark:text-white">
                  Log Customer Call Request
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Customer Phone Number *
                </label>
                <input
                  type="text"
                  required
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  placeholder="017xxxxxxxx or +8801xxxxxxxxx"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="e.g., Tanvir Hossain"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Platform
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewPlatform('whatsapp')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      newPlatform === 'whatsapp'
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                        : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPlatform('messenger')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      newPlatform === 'messenger'
                        ? 'bg-blue-500/15 border-blue-500 text-blue-700 dark:text-blue-300'
                        : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    Messenger
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Message / Inquired Requirement
                </label>
                <textarea
                  rows={2}
                  value={newMessageExcerpt}
                  onChange={(e) => setNewMessageExcerpt(e.target.value)}
                  placeholder="e.g., Customer asked for human agent to confirm size and COD delivery..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
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
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-black transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Add to Queue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Call Now Interactive Connect Modal */}
      {callingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-neutral-900 dark:text-white">
                    Direct Customer Call
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Connect with {callingRequest.customer_name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCallingRequest(null)}
                className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Summary & Big Phone Number Display */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500 font-bold uppercase tracking-wider">
                  Customer Phone Number
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    callingRequest.platform === 'whatsapp'
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                  }`}
                >
                  {callingRequest.platform}
                </span>
              </div>

              <div className="text-center py-2">
                <div className="text-2xl font-black font-mono text-neutral-900 dark:text-white tracking-wider">
                  {callingRequest.customer_phone}
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  Customer Name: <strong className="text-neutral-800 dark:text-neutral-200">{callingRequest.customer_name}</strong>
                </p>
              </div>

              {callingRequest.message_excerpt && (
                <div className="text-xs text-neutral-600 dark:text-neutral-300 italic bg-white dark:bg-neutral-900/80 p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800">
                  "{callingRequest.message_excerpt}"
                </div>
              )}
            </div>

            {/* Quick Action Buttons */}
            {hasValidPhone(callingRequest.customer_phone) ? (
              <div className="space-y-2 pt-1">
                {/* 1. Copy Phone Number */}
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(callingRequest.customer_phone);
                    setCallModalCopied(true);
                    setTimeout(() => setCallModalCopied(false), 2500);
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    callModalCopied
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200'
                  }`}
                >
                  {callModalCopied ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>Phone Copied to Clipboard! Ready to dial on mobile</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Number ({callingRequest.customer_phone})</span>
                    </>
                  )}
                </button>

                {/* 2. Direct WhatsApp Call/Chat */}
                <button
                  type="button"
                  onClick={() => {
                    openWhatsApp(callingRequest.customer_phone, callingRequest.customer_name);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Call or Message via WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </button>

                {/* 3. Native Phone Link (tel:) */}
                <a
                  href={`tel:${callingRequest.customer_phone}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-750 text-neutral-700 dark:text-neutral-300 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
                >
                  <Phone className="w-4 h-4 text-neutral-500" />
                  <span>Launch System Phone App (tel:)</span>
                </a>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                  <strong>Why is the phone number missing?</strong> Facebook Messenger does not share a user's SIM number automatically. Once the customer replies with their phone number in chat, it will attach here automatically!
                </div>

                {/* 1. Ask Phone Number in Messenger with 1-Click */}
                <button
                  type="button"
                  onClick={() => handleAskPhoneInChat(callingRequest)}
                  disabled={askingPhoneId === callingRequest.id}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {askingPhoneId === callingRequest.id
                      ? 'Sending to Messenger...'
                      : '1-Click Request Phone Number in Messenger'}
                  </span>
                </button>

                {/* 2. Open Messenger Live Chat to message/voice directly */}
                {onOpenCustomerChat && callingRequest.customer_id && (
                  <button
                    type="button"
                    onClick={() => {
                      const req = callingRequest;
                      setCallingRequest(null);
                      onOpenCustomerChat(req.platform, req.customer_id!);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Open Live Messenger Chat / Send Voice Note</span>
                  </button>
                )}

                {/* 3. Manually enter phone number */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={editingPhoneValue}
                    onChange={(e) => setEditingPhoneValue(e.target.value)}
                    placeholder="Enter customer phone (017XXXXXXXX)"
                    className="flex-1 px-3 py-2 text-xs font-mono rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveManualPhone(callingRequest, editingPhoneValue)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Actions: Convert or Close */}
            <div className="border-t border-neutral-100 dark:border-neutral-800 pt-3 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  const req = callingRequest;
                  setCallingRequest(null);
                  handleOpenConvertModal(req);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Convert to Confirmed Order</span>
              </button>

              <button
                type="button"
                onClick={() => setCallingRequest(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!requestToDelete}
        onClose={() => setRequestToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={deleting}
        title="Delete Call Request"
        message={`Are you sure you want to delete the call request from ${requestToDelete?.customer_name} (${requestToDelete?.customer_phone})?`}
        confirmText="Yes, Delete"
      />
    </div>
  );
};
