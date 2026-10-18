import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Plus,
  User,
  Phone,
  MapPin,
  Tag,
  FileText,
  Clock,
  X,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Edit2,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Truck,
  Sparkles,
  Bot,
  Send,
  PackageCheck
} from 'lucide-react';
import { Conversation, Order } from '../../types';
import { api } from '../../api';
import { WhatsAppLogo, MessengerLogo, InstagramLogo, FacebookLogo } from './UnifiedInbox';

interface CustomerDetailsPanelProps {
  conversation: Conversation | null;
  onNavigate?: (tab: string) => void;
  onClose?: () => void;
  onOpenCreateOrder?: (customerInfo?: { name: string; phone: string; address: string }) => void;
  onOpenProductPicker?: () => void;
  onToggleAi?: (action: 'pause_ai' | 'resume_ai') => void;
  isAiPaused?: boolean;
  onCustomerUpdated?: () => void;
}

export const CustomerDetailsPanel: React.FC<CustomerDetailsPanelProps> = ({
  conversation,
  onNavigate,
  onClose,
  onOpenCreateOrder,
  onOpenProductPicker,
  onToggleAi,
  isAiPaused = false,
  onCustomerUpdated
}) => {
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  // Editable customer info
  const [customerName, setCustomerName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  const [customerPhone, setCustomerPhone] = useState('');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [tempPhone, setTempPhone] = useState('');

  const [customerAddress, setCustomerAddress] = useState('');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [tempAddress, setTempAddress] = useState('');

  // Tags & Notes
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [showAddTag, setShowAddTag] = useState(false);

  const [notes, setNotes] = useState<string>('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [tempNotes, setTempNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSavedSuccess, setNotesSavedSuccess] = useState(false);

  // Customer Orders
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'orders' | 'notes'>('details');

  // Load customer metadata & orders
  useEffect(() => {
    if (!conversation) return;

    // Detect initial values from conversation
    const msgCombined = conversation.messages.map((m) => m.message_text || '').join(' ');
    const detectedPhone =
      conversation.customerPhone ||
      msgCombined.match(/(?:\+?88)?(01[3-9]\d{8})/)?.[1] ||
      (/^01[3-9]\d{8}$/.test(conversation.customerId) ? conversation.customerId : '');

    const detectedAddress = conversation.customerAddress || '';

    setCustomerName(conversation.customerName || conversation.customerId);
    setCustomerPhone(detectedPhone);
    setCustomerAddress(detectedAddress);
    setTags(conversation.tags || []);
    setNotes(conversation.notes || '');

    // Reset edit states
    setIsEditingName(false);
    setIsEditingPhone(false);
    setIsEditingAddress(false);
    setIsEditingNotes(false);

    loadCustomerData(conversation.customerId);
  }, [conversation?.customerId, conversation?.platform]);

  const loadCustomerData = async (customerId: string) => {
    try {
      setLoadingOrders(true);
      const res = await api.getCustomerDetails(customerId);
      if (res.metadata) {
        if (res.metadata.customer_name) setCustomerName(res.metadata.customer_name);
        if (res.metadata.customer_phone) setCustomerPhone(res.metadata.customer_phone);
        if (res.metadata.customer_address) setCustomerAddress(res.metadata.customer_address);
        if (Array.isArray(res.metadata.tags)) setTags(res.metadata.tags);
        if (typeof res.metadata.notes === 'string') setNotes(res.metadata.notes);
      }
      if (Array.isArray(res.orders)) {
        setCustomerOrders(res.orders);
      }
    } catch (err) {
      console.warn('Failed to fetch customer data:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  if (!conversation) {
    return (
      <aside className="w-80 shrink-0 border-l border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#0E0922] p-6 flex flex-col items-center justify-center text-center text-neutral-400">
        <User className="w-8 h-8 mb-2 opacity-40" />
        <p className="text-xs font-semibold">Select a conversation to view customer CRM details</p>
      </aside>
    );
  }

  // Save updated profile details to backend
  const handleSaveProfile = async (field: 'name' | 'phone' | 'address', value: string) => {
    try {
      const payload: any = {};
      if (field === 'name') {
        payload.customerName = value.trim();
        setCustomerName(value.trim());
        setIsEditingName(false);
      } else if (field === 'phone') {
        payload.customerPhone = value.trim();
        setCustomerPhone(value.trim());
        setIsEditingPhone(false);
      } else if (field === 'address') {
        payload.customerAddress = value.trim();
        setCustomerAddress(value.trim());
        setIsEditingAddress(false);
      }

      await api.updateCustomerDetails(conversation.customerId, payload);
      onCustomerUpdated?.();
    } catch (err) {
      console.error('Failed to update customer info:', err);
    }
  };

  const handleCopyPhone = () => {
    const textToCopy = customerPhone || conversation.customerId;
    navigator.clipboard.writeText(textToCopy);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleCopyFormattedAddress = () => {
    const courierText = `Name: ${customerName}\nPhone: ${customerPhone || conversation.customerId}\nAddress: ${customerAddress || 'Not provided'}`;
    navigator.clipboard.writeText(courierText);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2200);
  };

  const handleAddTag = async (tagName: string) => {
    const cleanTag = tagName.trim();
    if (!cleanTag || tags.includes(cleanTag)) return;
    const updatedTags = [...tags, cleanTag];
    setTags(updatedTags);
    setNewTagInput('');
    setShowAddTag(false);

    try {
      await api.updateCustomerDetails(conversation.customerId, { tags: updatedTags });
      onCustomerUpdated?.();
    } catch (err) {
      console.error('Failed to add tag:', err);
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    const updatedTags = tags.filter((t) => t !== tagToRemove);
    setTags(updatedTags);
    try {
      await api.updateCustomerDetails(conversation.customerId, { tags: updatedTags });
      onCustomerUpdated?.();
    } catch (err) {
      console.error('Failed to remove tag:', err);
    }
  };

  const handleSaveNotes = async () => {
    try {
      setSavingNotes(true);
      await api.updateCustomerDetails(conversation.customerId, { notes: tempNotes });
      setNotes(tempNotes);
      setIsEditingNotes(false);
      setNotesSavedSuccess(true);
      setTimeout(() => setNotesSavedSuccess(false), 2000);
      onCustomerUpdated?.();
    } catch (err) {
      console.error('Failed to save customer notes:', err);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingOrderId(orderId);
      await api.updateOrder(orderId, { status: newStatus as any });
      await loadCustomerData(conversation.customerId);
      onCustomerUpdated?.();
    } catch (err) {
      console.error('Failed to update order status:', err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Shared media from conversation
  const sharedImages = conversation.messages
    .filter((m) => m.image_url || m.image_base64)
    .map((m) => m.image_url || `data:${m.image_mime_type || 'image/jpeg'};base64,${m.image_base64}`);

  // Calculate customer lifetime statistics
  const totalOrders = customerOrders.length || conversation.totalOrdersCount || 0;
  const deliveredOrders = customerOrders.filter((o) => o.status === 'delivered').length;
  const cancelledOrders = customerOrders.filter((o) => o.status === 'cancelled').length;
  const totalSpent = customerOrders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0) || conversation.totalSpent || 0;

  const successRate = totalOrders > 0 ? Math.round(((totalOrders - cancelledOrders) / totalOrders) * 100) : 100;
  const isHighRisk = cancelledOrders >= 2 && successRate < 60;

  // Clean phone for links
  const rawPhoneDigits = (customerPhone || conversation.customerId).replace(/\D/g, '');
  const waPhone = rawPhoneDigits.startsWith('880')
    ? rawPhoneDigits
    : rawPhoneDigits.startsWith('01')
    ? `88${rawPhoneDigits}`
    : rawPhoneDigits;

  return (
    <aside className="w-full md:w-80 lg:w-[320px] shrink-0 h-full min-h-0 flex flex-col border-l border-neutral-200/80 dark:border-neutral-800/90 bg-white dark:bg-[#0E0922] text-neutral-900 dark:text-neutral-100 overflow-y-auto select-none">
      {/* 1. Header with Close Button */}
      <div className="px-4 py-3 border-b border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between shrink-0 bg-white dark:bg-[#0E0922]">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
            Customer CRM Profile
          </h3>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live Customer" />
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            title="Close details"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tabs Selector: Details | Orders | Notes */}
      <div className="flex border-b border-neutral-200/80 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 p-1 gap-1 shrink-0 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('details')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
            activeTab === 'details'
              ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs'
              : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
          }`}
        >
          Details
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
            activeTab === 'orders'
              ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs'
              : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
          }`}
        >
          <span>Orders</span>
          {customerOrders.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-purple-100 dark:bg-purple-950 text-[#7F22FE] text-[10px]">
              {customerOrders.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('notes')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
            activeTab === 'notes'
              ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs'
              : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
          }`}
        >
          Notes
        </button>
      </div>

      <div className="p-3.5 space-y-3.5 flex-1 overflow-y-auto">
        {/* =====================================================================
            TAB 1: CUSTOMER DETAILS & PROFILE
        ===================================================================== */}
        {activeTab === 'details' && (
          <>
            {/* Customer Profile Card */}
            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#7F22FE] to-[#9333EA] text-white font-black flex items-center justify-center text-sm shadow-xs">
                    {customerName.charAt(0).toUpperCase()}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white dark:bg-neutral-900 flex items-center justify-center ring-1 ring-white dark:ring-neutral-800">
                    {conversation.platform === 'whatsapp' ? (
                      <WhatsAppLogo className="w-3.5 h-3.5" />
                    ) : conversation.platform === 'messenger' ? (
                      <MessengerLogo className="w-3.5 h-3.5" />
                    ) : (
                      <InstagramLogo className="w-3.5 h-3.5" />
                    )}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  {isEditingName ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        placeholder="Customer Name..."
                        className="w-full text-xs px-2 py-1 rounded-lg border border-[#7F22FE] bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveProfile('name', tempName)}
                        className="p-1 rounded-md bg-[#7F22FE] text-white cursor-pointer"
                        title="Save name"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingName(false)}
                        className="p-1 rounded-md bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 cursor-pointer"
                        title="Cancel"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-black text-neutral-900 dark:text-white truncate">
                        {customerName}
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setTempName(customerName);
                          setIsEditingName(true);
                        }}
                        className="text-neutral-400 hover:text-[#7F22FE] p-0.5 rounded cursor-pointer"
                        title="Edit Customer Name"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 mt-0.5">
                    <span className="capitalize">{conversation.platform} Channel</span>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Active</span>
                  </div>
                </div>
              </div>

              {/* Direct Contact Actions (Call, WhatsApp, Copy Phone) */}
              <div className="space-y-2 pt-2 border-t border-neutral-200/70 dark:border-neutral-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500 text-[11px] flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#7F22FE]" />
                    Phone / WA:
                  </span>

                  {isEditingPhone ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={tempPhone}
                        onChange={(e) => setTempPhone(e.target.value)}
                        placeholder="017XXXXXXXX"
                        className="w-28 text-xs px-2 py-0.5 rounded border border-[#7F22FE] bg-white dark:bg-neutral-800 font-mono"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveProfile('phone', tempPhone)}
                        className="p-1 rounded bg-[#7F22FE] text-white cursor-pointer"
                      >
                        <Check className="w-2.5 h-2.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingPhone(false)}
                        className="p-1 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-600 cursor-pointer"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-neutral-900 dark:text-white">
                        {customerPhone || conversation.customerId}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setTempPhone(customerPhone || conversation.customerId);
                          setIsEditingPhone(true);
                        }}
                        className="text-neutral-400 hover:text-[#7F22FE] p-0.5 cursor-pointer"
                        title="Edit Phone"
                      >
                        <Edit2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* 1-Click Action Buttons for Phone */}
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {rawPhoneDigits ? (
                    <a
                      href={`tel:${rawPhoneDigits}`}
                      className="py-1 px-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-emerald-100 transition-colors"
                      title="Direct Phone Call"
                    >
                      <Phone className="w-3 h-3 text-emerald-600" />
                      <span>Call</span>
                    </a>
                  ) : null}

                  {waPhone ? (
                    <a
                      href={`https://wa.me/${waPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1 px-1.5 rounded-lg bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-green-100 transition-colors"
                      title="Open WhatsApp Chat"
                    >
                      <WhatsAppLogo className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </a>
                  ) : null}

                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    className="py-1 px-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    {copiedPhone ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3 text-neutral-500" />
                    )}
                    <span>{copiedPhone ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Delivery Address Section */}
                <div className="pt-2 border-t border-neutral-200/70 dark:border-neutral-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500 text-[11px] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#7F22FE]" />
                      Delivery Address:
                    </span>
                    {!isEditingAddress && (
                      <button
                        type="button"
                        onClick={() => {
                          setTempAddress(customerAddress);
                          setIsEditingAddress(true);
                        }}
                        className="text-[11px] font-bold text-[#7F22FE] hover:underline cursor-pointer flex items-center gap-0.5"
                      >
                        <Edit2 className="w-2.5 h-2.5" />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>

                  {isEditingAddress ? (
                    <div className="space-y-1.5">
                      <textarea
                        rows={2}
                        value={tempAddress}
                        onChange={(e) => setTempAddress(e.target.value)}
                        placeholder="House/Road, Area, District..."
                        className="w-full text-xs p-2 rounded-xl border border-[#7F22FE] bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                        autoFocus
                      />
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setIsEditingAddress(false)}
                          className="px-2 py-0.5 rounded text-[10px] text-neutral-500 hover:bg-neutral-100 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveProfile('address', tempAddress)}
                          className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#7F22FE] text-white cursor-pointer"
                        >
                          Save Address
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium">
                        {customerAddress || (
                          <span className="text-neutral-400 italic">No delivery address saved yet</span>
                        )}
                      </p>
                      {customerAddress && (
                        <button
                          type="button"
                          onClick={handleCopyFormattedAddress}
                          className="mt-1 text-[10px] font-bold text-neutral-500 hover:text-[#7F22FE] flex items-center gap-1 cursor-pointer"
                        >
                          {copiedAddress ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copiedAddress ? 'Copied Courier Format!' : 'Copy for Steadfast / Pathao'}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action Buttons (Create Order, Send Product Catalog, AI Toggle) */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  onOpenCreateOrder?.({
                    name: customerName,
                    phone: customerPhone || conversation.customerId,
                    address: customerAddress
                  })
                }
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#7F22FE] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7E22CE] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Order</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenProductPicker?.()}
                className="py-2.5 px-3 rounded-xl border border-neutral-200/90 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-[#7F22FE]" />
                <span>Send Product</span>
              </button>
            </div>

            {/* AI Auto-Pilot Switch for this customer */}
            {onToggleAi && (
              <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/70 dark:border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs ${
                      isAiPaused
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-neutral-900 dark:text-white">
                      {isAiPaused ? 'Human Moderator Mode' : 'AI Auto-Sales Agent'}
                    </h5>
                    <p className="text-[10px] text-neutral-500">
                      {isAiPaused ? 'AI is paused for this customer' : 'AI auto-replies 24/7 to chats'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleAi(isAiPaused ? 'resume_ai' : 'pause_ai')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    isAiPaused
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-amber-500 hover:bg-amber-600 text-white'
                  }`}
                >
                  {isAiPaused ? 'Resume AI' : 'Take Over'}
                </button>
              </div>
            )}

            {/* Fraud Analytics & Courier Reliability Card */}
            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/70 dark:border-neutral-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Courier &amp; Fraud Intelligence
                </span>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    isHighRisk
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                  }`}
                >
                  {isHighRisk ? '⚠️ High Risk' : '🟢 Safe Buyer'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700">
                  <span className="text-[10px] text-neutral-400 block">Orders</span>
                  <span className="text-xs font-black text-neutral-900 dark:text-white">
                    {totalOrders}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700">
                  <span className="text-[10px] text-neutral-400 block">Total Spent</span>
                  <span className="text-xs font-black text-[#7F22FE]">
                    ৳{totalSpent.toLocaleString()}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700">
                  <span className="text-[10px] text-neutral-400 block">Success</span>
                  <span className="text-xs font-black text-emerald-600">
                    {successRate}%
                  </span>
                </div>
              </div>
            </div>

            {/* Tags Card */}
            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/70 dark:border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-neutral-800 dark:text-neutral-200">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#7F22FE]" />
                  Tags ({tags.length})
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddTag(!showAddTag)}
                  className="text-[11px] font-bold text-[#7F22FE] dark:text-purple-300 hover:underline cursor-pointer"
                >
                  + Add Tag
                </button>
              </div>

              {/* Quick Chip Suggestions */}
              <div className="flex flex-wrap gap-1 pt-0.5">
                {['VIP Client', 'Dhaka COD', 'Repeat Buyer', 'Urgent'].map((quickTag) => {
                  if (tags.includes(quickTag)) return null;
                  return (
                    <button
                      key={quickTag}
                      type="button"
                      onClick={() => handleAddTag(quickTag)}
                      className="px-2 py-0.5 rounded-md bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-[10px] border border-neutral-200 dark:border-neutral-700 hover:border-[#7F22FE] hover:text-[#7F22FE] transition-colors cursor-pointer"
                    >
                      + {quickTag}
                    </button>
                  );
                })}
              </div>

              {/* Active Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-violet-100 dark:bg-violet-950/70 text-[#7F22FE] dark:text-purple-300 text-[10px] font-bold border border-violet-200/60 dark:border-violet-800/60"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-600 cursor-pointer ml-0.5 font-black"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {showAddTag && (
                <div className="flex gap-1.5 pt-2">
                  <input
                    type="text"
                    placeholder="e.g. Wholesale, VIP..."
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag(newTagInput)}
                    className="flex-1 text-xs px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTag(newTagInput)}
                    className="px-2.5 py-1 rounded-lg bg-[#7F22FE] text-white text-xs font-bold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            {/* Shared Media Thumbnails */}
            {sharedImages.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/70 dark:border-neutral-800 space-y-2">
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#7F22FE]" />
                  Customer Shared Media ({sharedImages.length})
                </span>
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {sharedImages.slice(0, 6).map((imgUrl, idx) => (
                    <img
                      key={idx}
                      src={imgUrl}
                      alt={`Shared ${idx + 1}`}
                      className="w-full h-16 object-cover rounded-xl border border-neutral-200 dark:border-neutral-700 hover:opacity-90 transition-opacity cursor-pointer"
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* =====================================================================
            TAB 2: CUSTOMER ORDERS LIST & STATUS MANAGEMENT
        ===================================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-neutral-800 dark:text-neutral-200">
                Customer Orders ({customerOrders.length})
              </h4>
              <button
                type="button"
                onClick={() =>
                  onOpenCreateOrder?.({
                    name: customerName,
                    phone: customerPhone || conversation.customerId,
                    address: customerAddress
                  })
                }
                className="text-[11px] font-bold text-[#7F22FE] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>New Order</span>
              </button>
            </div>

            {loadingOrders ? (
              <div className="py-8 text-center text-xs text-neutral-500 flex items-center justify-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#7F22FE]" />
                <span>Loading orders...</span>
              </div>
            ) : customerOrders.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 space-y-2">
                <ShoppingBag className="w-8 h-8 mx-auto text-neutral-400 opacity-60" />
                <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  No orders placed yet
                </p>
                <p className="text-[11px] text-neutral-500">
                  Create an order directly for this customer right from the chat.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    onOpenCreateOrder?.({
                      name: customerName,
                      phone: customerPhone || conversation.customerId,
                      address: customerAddress
                    })
                  }
                  className="mt-2 py-1.5 px-3 rounded-xl bg-[#7F22FE] text-white text-xs font-bold cursor-pointer"
                >
                  Create First Order
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {customerOrders.map((ord) => {
                  const isUpdating = updatingOrderId === ord.id;
                  return (
                    <div
                      key={ord.id}
                      className="p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 space-y-2 shadow-2xs"
                    >
                      {/* Order Header: ID & Status Selector */}
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1 font-mono text-xs font-bold text-neutral-900 dark:text-white">
                          <span>#{ord.id.substring(0, 10)}</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(ord.id);
                              setCopiedOrderId(ord.id);
                              setTimeout(() => setCopiedOrderId(null), 1800);
                            }}
                            className="p-0.5 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                            title="Copy Order ID"
                          >
                            {copiedOrderId === ord.id ? (
                              <Check className="w-2.5 h-2.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-2.5 h-2.5" />
                            )}
                          </button>
                        </div>

                        {/* Status Dropdown */}
                        <select
                          value={ord.status}
                          disabled={isUpdating}
                          onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                          className={`text-[10px] font-extrabold px-2 py-1 rounded-lg border cursor-pointer focus:outline-hidden ${
                            ord.status === 'delivered'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                              : ord.status === 'confirmed'
                              ? 'bg-purple-50 text-[#7F22FE] border-purple-300 dark:bg-purple-950 dark:text-purple-300'
                              : ord.status === 'shipped' || ord.status === 'processing'
                              ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">In Courier (Shipped)</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>

                      {/* Items & Price */}
                      <div className="text-xs text-neutral-700 dark:text-neutral-300">
                        <p className="font-bold line-clamp-1">{ord.items}</p>
                        <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-1">
                          <span>Qty: {ord.quantity || 1}</span>
                          <span className="font-black text-[#7F22FE]">
                            ৳{Number(ord.total_amount).toLocaleString()} BDT
                          </span>
                        </div>
                      </div>

                      {/* Courier Tracking snippet if available */}
                      {ord.tracking_number || ord.consignment_id ? (
                        <div className="p-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-[10px] flex items-center justify-between text-neutral-600 dark:text-neutral-300">
                          <span className="flex items-center gap-1 font-semibold">
                            <Truck className="w-3 h-3 text-[#7F22FE]" />
                            <span>{ord.courier_provider || 'Steadfast'}:</span>
                            <span className="font-mono font-bold">
                              {ord.tracking_number || ord.consignment_id}
                            </span>
                          </span>
                        </div>
                      ) : null}

                      {/* Date */}
                      <div className="text-[10px] text-neutral-400 pt-1 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                        <span>{new Date(ord.created_at).toLocaleDateString()}</span>
                        <span className="capitalize text-neutral-500">
                          Payment: {ord.payment_method || 'COD'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            TAB 3: INTERNAL MERCHANT NOTES
        ===================================================================== */}
        {activeTab === 'notes' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#7F22FE]" />
                Internal Team Notes
              </span>
              {notesSavedSuccess && (
                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Saved!
                </span>
              )}
            </div>

            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Private notes about customer preferences, measurements, courier delivery instructions, etc. (Saved to DB).
            </p>

            <textarea
              rows={6}
              value={isEditingNotes ? tempNotes : notes}
              onFocus={() => {
                setTempNotes(notes);
                setIsEditingNotes(true);
              }}
              onChange={(e) => setTempNotes(e.target.value)}
              placeholder="e.g. Customer prefers red color, requested delivery before Friday 5 PM in Dhanmondi..."
              className="w-full text-xs p-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-1.5 focus:ring-[#7F22FE]"
            />

            {isEditingNotes && (
              <div className="flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsEditingNotes(false)}
                  className="px-3 py-1.5 text-xs rounded-xl text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="px-4 py-1.5 text-xs font-bold rounded-xl bg-[#7F22FE] hover:bg-[#6D28D9] text-white flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {savingNotes ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                  <span>Save Notes</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
