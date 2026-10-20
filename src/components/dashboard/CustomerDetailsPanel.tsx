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
  PackageCheck,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { Conversation, Order } from '../../types';
import { api } from '../../api';

interface CustomerDetailsPanelProps {
  conversation: Conversation | null;
  onNavigate?: (tab: string) => void;
  onClose?: () => void;
  onOpenCreateOrder?: (customerInfo?: { name: string; phone: string; address: string }) => void;
  onOpenProductPicker?: () => void;
  onToggleAi?: (action: 'pause_ai' | 'resume_ai') => void;
  isAiPaused?: boolean;
  onCustomerUpdated?: () => void;
  allAgents?: Array<{ id: string; name: string }>;
  onAssignAgent?: (agentName: string) => void;
  onSelectTag?: (tag: string) => void;
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
  const [activeTab, setActiveTab] = useState<'details' | 'orders' | 'notes'>('details');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [customerAddress, setCustomerAddress] = useState('');
  const [tempAddress, setTempAddress] = useState('');

  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [tags, setTags] = useState<string[]>(['Repeat Buyer']);
  const [showAddTagInput, setShowAddTagInput] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  const [notes, setNotes] = useState<string>('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [tempNotes, setTempNotes] = useState('');

  useEffect(() => {
    if (!conversation) return;
    setCustomerAddress(conversation.customerAddress || '');
    setTempAddress(conversation.customerAddress || '');
    if (conversation.tags && conversation.tags.length > 0) {
      setTags(conversation.tags);
    } else {
      setTags(['Repeat Buyer']);
    }
    setNotes(conversation.notes || '');
    setTempNotes(conversation.notes || '');

    loadCustomerData(conversation.customerId);
  }, [conversation?.customerId, conversation?.platform]);

  const loadCustomerData = async (customerId: string) => {
    try {
      setLoadingOrders(true);
      const res = await api.getCustomerDetails(customerId);
      if (res.metadata) {
        if (res.metadata.customer_address) {
          setCustomerAddress(res.metadata.customer_address);
          setTempAddress(res.metadata.customer_address);
        }
        if (Array.isArray(res.metadata.tags) && res.metadata.tags.length > 0) {
          setTags(res.metadata.tags);
        }
        if (typeof res.metadata.notes === 'string') {
          setNotes(res.metadata.notes);
          setTempNotes(res.metadata.notes);
        }
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

  const handleSaveAddress = async () => {
    if (!conversation) return;
    try {
      setCustomerAddress(tempAddress.trim());
      setIsEditingAddress(false);
      await api.updateCustomerDetails(conversation.customerId, {
        customerAddress: tempAddress.trim()
      });
      onCustomerUpdated?.();
    } catch (err) {
      console.error('Failed to update address:', err);
    }
  };

  const handleAddTag = async (tagName: string) => {
    if (!conversation) return;
    const clean = tagName.trim();
    if (!clean || tags.includes(clean)) return;
    const updated = [...tags, clean];
    setTags(updated);
    setNewTagInput('');
    setShowAddTagInput(false);
    try {
      await api.updateCustomerDetails(conversation.customerId, { tags: updated });
      onCustomerUpdated?.();
    } catch (err) {
      console.error('Failed to add tag:', err);
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    if (!conversation) return;
    const updated = tags.filter((t) => t !== tagToRemove);
    setTags(updated);
    try {
      await api.updateCustomerDetails(conversation.customerId, { tags: updated });
      onCustomerUpdated?.();
    } catch (err) {
      console.error('Failed to remove tag:', err);
    }
  };

  const handleSaveNotes = async () => {
    if (!conversation) return;
    try {
      setNotes(tempNotes);
      setIsEditingNotes(false);
      await api.updateCustomerDetails(conversation.customerId, { notes: tempNotes });
      onCustomerUpdated?.();
    } catch (err) {
      console.error('Failed to save notes:', err);
    }
  };

  if (!conversation) {
    return (
      <aside className="w-full md:w-80 lg:w-[340px] shrink-0 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111625] p-6 flex flex-col items-center justify-center text-center text-slate-400">
        <User className="w-8 h-8 mb-2 opacity-40 text-slate-400" />
        <p className="text-xs font-semibold">Select a conversation to view customer details</p>
      </aside>
    );
  }

  const detectedPhone = conversation.customerPhone || conversation.customerId;

  return (
    <aside className="w-full md:w-80 lg:w-[340px] shrink-0 h-full min-h-0 flex flex-col border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111625] text-slate-800 dark:text-slate-100 overflow-y-auto select-none font-sans">
      {/* 1. Header: CUSTOMER CRM PROFILE ● with close X */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-black tracking-wide text-slate-900 dark:text-white uppercase">
            Customer CRM Profile
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close CRM Profile"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 2. Tabs Row: Details | Orders | Notes */}
      <div className="flex items-center border-b border-slate-100 dark:border-slate-800 px-5 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('details')}
          className={`py-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'details'
              ? 'border-purple-600 text-purple-700 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          Details
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`py-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'orders'
              ? 'border-purple-600 text-purple-700 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          Orders ({customerOrders.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('notes')}
          className={`py-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'notes'
              ? 'border-purple-600 text-purple-700 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          Notes
        </button>
      </div>

      {/* 3. Tab Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {activeTab === 'details' && (
          <>
            {/* Delivery Address Block */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-purple-600" />
                  Delivery Address:
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(!isEditingAddress)}
                  className="text-purple-600 hover:text-purple-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit
                </button>
              </div>

              {isEditingAddress ? (
                <div className="space-y-2 pt-1">
                  <textarea
                    value={tempAddress}
                    onChange={(e) => setTempAddress(e.target.value)}
                    placeholder="Enter customer delivery address..."
                    rows={2}
                    className="w-full text-xs p-2.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/30 dark:bg-purple-950/20 text-slate-800 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-purple-500"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingAddress(false)}
                      className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAddress}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic pl-5">
                  {customerAddress || 'No delivery address saved yet'}
                </p>
              )}
            </div>

            {/* Action Buttons: + Create Order & Send Product (stacked / grid matching screenshot) */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={() =>
                  onOpenCreateOrder?.({
                    name: conversation.customerName,
                    phone: detectedPhone,
                    address: customerAddress
                  })
                }
                className="w-full py-2.5 px-4 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-[0.98] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create Order</span>
              </button>

              <button
                type="button"
                onClick={onOpenProductPicker}
                className="w-full py-2.5 px-4 rounded-xl border border-purple-300 dark:border-purple-800/80 hover:bg-purple-50 dark:hover:bg-purple-950/30 bg-white dark:bg-[#161D2B] text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-purple-600" />
                <span>Send Product</span>
              </button>
            </div>

            {/* Card: AI Auto-Sales Agent with orange Take Over button */}
            <div className="p-3.5 rounded-2xl bg-[#F0FDF4] dark:bg-emerald-950/30 border border-[#DCFCE7] dark:border-emerald-900/50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                    AI Auto-Sales Agent
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {isAiPaused ? 'Paused by moderator' : 'AI auto-replies 24/7 to chats'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onToggleAi?.(isAiPaused ? 'resume_ai' : 'pause_ai')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-transform active:scale-95 cursor-pointer shadow-xs ${
                  isAiPaused
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-[#F59E0B] hover:bg-[#D97706] text-white'
                }`}
              >
                {isAiPaused ? 'Activate AI' : 'Take Over'}
              </button>
            </div>

            {/* Card: Courier & Fraud Intelligence with Safe Buyer badge */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#161D2B] border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Courier &amp; Fraud Intelligence</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Safe Buyer
                </span>
              </div>

              {/* 3 Metric boxes */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="block text-[10px] font-semibold text-slate-400">Orders</span>
                  <span className="block text-sm font-black text-slate-900 dark:text-white mt-0.5">
                    {customerOrders.length || conversation.totalOrdersCount || 0}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="block text-[10px] font-semibold text-slate-400">Total Spent</span>
                  <span className="block text-sm font-black text-purple-600 dark:text-purple-400 mt-0.5">
                    &#2547;{(conversation.totalSpent || 0).toLocaleString()}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="block text-[10px] font-semibold text-slate-400">Success</span>
                  <span className="block text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                    100%
                  </span>
                </div>
              </div>
            </div>

            {/* Card: Tags (1) + Add Tag */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
                  <Tag className="w-3.5 h-3.5 text-purple-600" />
                  Tags ({tags.length})
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddTagInput(!showAddTagInput)}
                  className="text-purple-600 hover:text-purple-700 font-bold text-xs flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  Add Tag
                </button>
              </div>

              {showAddTagInput && (
                <div className="flex items-center gap-1.5 pt-1">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddTag(newTagInput);
                    }}
                    placeholder="New tag..."
                    className="flex-1 text-xs px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800 bg-white dark:bg-[#141A26] text-slate-800 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTag(newTagInput)}
                    className="px-2.5 py-1 rounded-lg bg-purple-600 text-white text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
              )}

              {/* Suggestions chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {['VIP Client', 'Dhaka COD', 'Urgent'].map((suggested) => (
                  <button
                    key={suggested}
                    type="button"
                    onClick={() => handleAddTag(suggested)}
                    className="px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:border-purple-400 hover:text-purple-600 cursor-pointer transition-colors"
                  >
                    + {suggested}
                  </button>
                ))}
              </div>

              {/* Selected tags */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-purple-500 hover:text-purple-700 dark:hover:text-purple-200 cursor-pointer"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Order History</span>
              <button
                type="button"
                onClick={() =>
                  onOpenCreateOrder?.({
                    name: conversation.customerName,
                    phone: detectedPhone,
                    address: customerAddress
                  })
                }
                className="text-purple-600 hover:text-purple-700 text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                New Order
              </button>
            </div>

            {loadingOrders ? (
              <div className="text-center py-8 text-xs text-slate-400">Loading orders...</div>
            ) : customerOrders.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 space-y-2">
                <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500">No orders recorded yet</p>
                <button
                  type="button"
                  onClick={() =>
                    onOpenCreateOrder?.({
                      name: conversation.customerName,
                      phone: detectedPhone,
                      address: customerAddress
                    })
                  }
                  className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-bold"
                >
                  Create First Order
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {customerOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161D2B] space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        #{ord.id.substring(0, 10)}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                        {ord.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 truncate">{ord.items}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Total: &#2547;{Number(ord.total_amount).toLocaleString()}</span>
                      <span>{new Date(ord.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Internal Merchant Notes</span>
              {!isEditingNotes && (
                <button
                  type="button"
                  onClick={() => setIsEditingNotes(true)}
                  className="text-purple-600 hover:text-purple-700 text-xs font-bold flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit
                </button>
              )}
            </div>

            {isEditingNotes ? (
              <div className="space-y-2">
                <textarea
                  value={tempNotes}
                  onChange={(e) => setTempNotes(e.target.value)}
                  placeholder="Write internal notes about this customer..."
                  rows={4}
                  className="w-full text-xs p-3 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/20 dark:bg-purple-950/20 text-slate-800 dark:text-white focus:outline-hidden"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTempNotes(notes);
                      setIsEditingNotes(false);
                    }}
                    className="px-2.5 py-1 text-xs text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-bold"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                {notes || 'No notes added yet for this customer.'}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
