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
  Share2,
  Users,
  Building,
  Mail,
  ChevronRight
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
}

export const CustomerDetailsPanel: React.FC<CustomerDetailsPanelProps> = ({
  conversation,
  onNavigate,
  onClose,
  onOpenCreateOrder,
  onOpenProductPicker,
  onToggleAi,
  isAiPaused = false,
  onCustomerUpdated,
  allAgents = [{ id: '1', name: 'Dhruba' }, { id: '2', name: 'Anan' }, { id: '3', name: 'Alif' }, { id: '4', name: 'Rumman' }],
  onAssignAgent
}) => {
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  // Accordion open/close states (all open or selective as in Picture 2)
  const [contactDetailsOpen, setContactDetailsOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);
  const [notesOpen, setNotesOpen] = useState(true);
  const [summaryOpen, setSummaryOpen] = useState(true);

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
  const [tags, setTags] = useState<string[]>(['Priority', 'Top Client', 'High Prospect']);
  const [newTagInput, setNewTagInput] = useState('');
  const [showAddTag, setShowAddTag] = useState(false);

  const [notes, setNotes] = useState<string>('Sajal, 01894927244, house 11/b road 30 gulshan-2, Dhaka. Interested in premium white half zip.');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [tempNotes, setTempNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSavedSuccess, setNotesSavedSuccess] = useState(false);

  // Orders
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [showManageOrdersModal, setShowManageOrdersModal] = useState(false);

  // Assigned Agent state
  const [assignedAgents, setAssignedAgents] = useState<string[]>(['@Dhruba', '@Anan']);
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);

  // Preset tag colors (matching Picture 2 colorful tags)
  const getTagBadgeStyle = (tag: string) => {
    const t = tag.toLowerCase();
    if (t.includes('priority')) {
      return 'bg-[#2E1A47] text-[#BF7AF0] border-[#5E2B97]';
    }
    if (t.includes('top client') || t.includes('client') || t.includes('prospect') && !t.includes('low')) {
      return 'bg-[#142B3B] text-[#38BDF8] border-[#0284C7]/50';
    }
    if (t.includes('high prospect') || t.includes('attention')) {
      return 'bg-[#3A220F] text-[#FB923C] border-[#C2410C]/50';
    }
    if (t.includes('risky') || t.includes('fraud') || t.includes('low')) {
      return 'bg-[#3E161D] text-[#FB7185] border-[#BE123C]/50';
    }
    if (t.includes('successful') || t.includes('paid') || t.includes('order')) {
      return 'bg-[#113222] text-[#34D399] border-[#059669]/50';
    }
    return 'bg-[#1E293B] text-[#94A3B8] border-[#334155]';
  };

  useEffect(() => {
    if (!conversation) return;

    const msgCombined = conversation.messages.map((m) => m.message_text || '').join(' ');
    const detectedPhone =
      conversation.customerPhone ||
      msgCombined.match(/(?:\+?88)?(01[3-9]\d{8})/)?.[1] ||
      (/^01[3-9]\d{8}$/.test(conversation.customerId) ? conversation.customerId : '');

    const detectedAddress = conversation.customerAddress || '';

    setCustomerName(conversation.customerName || conversation.customerId);
    setCustomerPhone(detectedPhone);
    setCustomerAddress(detectedAddress);
    if (conversation.tags && conversation.tags.length > 0) {
      setTags(conversation.tags);
    } else {
      setTags(['Priority', 'Top Client', 'High Prospect']);
    }
    if (conversation.notes) setNotes(conversation.notes);

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
        if (Array.isArray(res.metadata.tags) && res.metadata.tags.length > 0) setTags(res.metadata.tags);
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
      <aside className="w-80 shrink-0 border-l border-[#1E2433] bg-[#0E121B] p-6 flex flex-col items-center justify-center text-center text-neutral-400">
        <User className="w-8 h-8 mb-2 opacity-40 text-neutral-500" />
        <p className="text-xs font-semibold text-neutral-400">Select a conversation to view customer details</p>
      </aside>
    );
  }

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

  const handleCopyAddress = () => {
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

  // Shared media from conversation
  const sharedImages = conversation.messages
    .filter((m) => m.image_url || m.image_base64)
    .map((m) => m.image_url || `data:${m.image_mime_type || 'image/jpeg'};base64,${m.image_base64}`);

  return (
    <aside className="w-full md:w-80 lg:w-[340px] shrink-0 h-full min-h-0 flex flex-col border-l border-[#1A202C] bg-[#0B0E14] text-neutral-200 overflow-y-auto select-none font-sans">
      {/* 1. Header: Order Actions Title + Manage Orders & Create Orders buttons (Picture 2 Exact Match) */}
      <div className="p-4 border-b border-[#1A202C] space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-white tracking-wide">
            Order Actions
          </h3>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 2 Wide Buttons: Manage Orders & Create Orders (Picture 2 exact) */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => {
              if (onNavigate) onNavigate('orders');
              else setShowManageOrdersModal(true);
            }}
            className="py-2 px-3 rounded-lg bg-[#141923] hover:bg-[#1C2230] border border-[#232B3E] text-white text-xs font-bold transition-all text-center cursor-pointer shadow-xs"
          >
            Manage Orders
          </button>
          <button
            type="button"
            onClick={() =>
              onOpenCreateOrder?.({
                name: customerName,
                phone: customerPhone || conversation.customerId,
                address: customerAddress
              })
            }
            className="py-2 px-3 rounded-lg bg-[#141923] hover:bg-[#1C2230] border border-[#232B3E] text-white text-xs font-bold transition-all text-center cursor-pointer shadow-xs hover:border-[#7F22FE]"
          >
            Create Orders
          </button>
        </div>
      </div>

      {/* Accordion Sections Stack */}
      <div className="divide-y divide-[#1A202C] flex-1 overflow-y-auto">
        {/* =====================================================================
            ACCORDION 1: Contact Details ⌄
        ===================================================================== */}
        <div className="p-4 space-y-3">
          <button
            type="button"
            onClick={() => setContactDetailsOpen(!contactDetailsOpen)}
            className="w-full flex items-center justify-between text-xs font-bold text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-neutral-400" />
              <span>Contact Details</span>
            </div>
            {contactDetailsOpen ? (
              <ChevronUp className="w-4 h-4 text-neutral-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            )}
          </button>

          {contactDetailsOpen && (
            <div className="space-y-2.5 pt-1 text-xs">
              {/* Full Name */}
              <div className="p-2.5 rounded-xl bg-[#121620] border border-[#1E2536] space-y-1">
                <div className="flex items-center justify-between text-[11px] text-neutral-400">
                  <span>Customer Name:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setTempName(customerName);
                      setIsEditingName(!isEditingName);
                    }}
                    className="text-[#A855F7] hover:underline cursor-pointer flex items-center gap-0.5"
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                    <span>{isEditingName ? 'Cancel' : 'Edit'}</span>
                  </button>
                </div>
                {isEditingName ? (
                  <div className="flex items-center gap-1.5 pt-1">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="flex-1 text-xs px-2 py-1 rounded bg-[#0B0E14] border border-[#A855F7] text-white"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveProfile('name', tempName)}
                      className="px-2 py-1 rounded bg-[#A855F7] text-white text-xs font-bold cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <p className="font-bold text-white text-xs">{customerName}</p>
                )}
              </div>

              {/* Phone / WhatsApp */}
              <div className="p-2.5 rounded-xl bg-[#121620] border border-[#1E2536] space-y-1">
                <div className="flex items-center justify-between text-[11px] text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-400" />
                    Phone / WhatsApp:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyPhone}
                      className="text-neutral-400 hover:text-white cursor-pointer"
                      title="Copy phone"
                    >
                      {copiedPhone ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTempPhone(customerPhone || conversation.customerId);
                        setIsEditingPhone(!isEditingPhone);
                      }}
                      className="text-[#A855F7] hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                      <span>{isEditingPhone ? 'Cancel' : 'Edit'}</span>
                    </button>
                  </div>
                </div>

                {isEditingPhone ? (
                  <div className="flex items-center gap-1.5 pt-1">
                    <input
                      type="text"
                      value={tempPhone}
                      onChange={(e) => setTempPhone(e.target.value)}
                      className="flex-1 text-xs px-2 py-1 rounded bg-[#0B0E14] border border-[#A855F7] text-white font-mono"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveProfile('phone', tempPhone)}
                      className="px-2 py-1 rounded bg-[#A855F7] text-white text-xs font-bold cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-0.5">
                    <span className="font-mono font-bold text-white">
                      {customerPhone || conversation.customerId}
                    </span>
                    <a
                      href={`tel:${customerPhone || conversation.customerId}`}
                      className="text-[10px] font-bold text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      Call Now
                    </a>
                  </div>
                )}
              </div>

              {/* Delivery Address */}
              <div className="p-2.5 rounded-xl bg-[#121620] border border-[#1E2536] space-y-1">
                <div className="flex items-center justify-between text-[11px] text-neutral-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#A855F7]" />
                    Address:
                  </span>
                  <div className="flex items-center gap-2">
                    {customerAddress && (
                      <button
                        type="button"
                        onClick={handleCopyAddress}
                        className="text-neutral-400 hover:text-white cursor-pointer"
                        title="Copy Address"
                      >
                        {copiedAddress ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setTempAddress(customerAddress);
                        setIsEditingAddress(!isEditingAddress);
                      }}
                      className="text-[#A855F7] hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                      <span>{isEditingAddress ? 'Cancel' : 'Edit'}</span>
                    </button>
                  </div>
                </div>

                {isEditingAddress ? (
                  <div className="space-y-1.5 pt-1">
                    <textarea
                      rows={2}
                      value={tempAddress}
                      onChange={(e) => setTempAddress(e.target.value)}
                      placeholder="Enter full shipping address..."
                      className="w-full text-xs p-2 rounded bg-[#0B0E14] border border-[#A855F7] text-white"
                      autoFocus
                    />
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setIsEditingAddress(false)}
                        className="px-2 py-0.5 rounded text-[11px] text-neutral-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveProfile('address', tempAddress)}
                        className="px-2.5 py-0.5 rounded bg-[#A855F7] text-white text-[11px] font-bold cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-neutral-300 text-xs leading-relaxed">
                    {customerAddress || <span className="text-neutral-500 italic">No address saved</span>}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* =====================================================================
            ACCORDION 2: Tags with "+ Add New" button (Picture 2 Exact Match)
        ===================================================================== */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-300">
            <button
              type="button"
              onClick={() => setTagsOpen(!tagsOpen)}
              className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer"
            >
              <Tag className="w-4 h-4 text-neutral-400" />
              <span>Tags</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAddTag(!showAddTag)}
              className="text-xs font-bold text-[#A855F7] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New</span>
            </button>
          </div>

          {tagsOpen && (
            <div className="space-y-2 pt-1">
              {/* Colorful Tag Badges (Picture 2 style) */}
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border ${getTagBadgeStyle(
                      t
                    )}`}
                  >
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-white cursor-pointer opacity-70 hover:opacity-100"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Tag Input */}
              {showAddTag && (
                <div className="flex items-center gap-1.5 pt-2">
                  <input
                    type="text"
                    placeholder="Tag name (e.g. Priority, VIP)..."
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag(newTagInput)}
                    className="flex-1 text-xs px-2.5 py-1 rounded-lg bg-[#141923] border border-[#2B354D] text-white placeholder:text-neutral-500 focus:outline-hidden focus:border-[#A855F7]"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTag(newTagInput)}
                    className="px-3 py-1 rounded-lg bg-[#A855F7] hover:bg-[#9333EA] text-white text-xs font-bold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* =====================================================================
            ACCORDION 3: Notes for the customer [69] ⌄ (Picture 2 Exact Match)
        ===================================================================== */}
        <div className="p-4 space-y-3">
          <button
            type="button"
            onClick={() => setNotesOpen(!notesOpen)}
            className="w-full flex items-center justify-between text-xs font-bold text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-neutral-400" />
              <span>Notes for the customer</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-[#2E1A47] text-[#BF7AF0] text-[10px] font-black border border-[#5E2B97]">
                69
              </span>
              {notesOpen ? (
                <ChevronUp className="w-4 h-4 text-neutral-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-neutral-400" />
              )}
            </div>
          </button>

          {notesOpen && (
            <div className="space-y-2 pt-1 text-xs">
              <textarea
                rows={4}
                value={isEditingNotes ? tempNotes : notes}
                onFocus={() => {
                  setTempNotes(notes);
                  setIsEditingNotes(true);
                }}
                onChange={(e) => setTempNotes(e.target.value)}
                placeholder="Write customer notes..."
                className="w-full text-xs p-3 rounded-xl bg-[#121620] border border-[#1E2536] text-white focus:outline-hidden focus:border-[#A855F7] leading-relaxed"
              />

              {isEditingNotes && (
                <div className="flex justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsEditingNotes(false)}
                    className="px-3 py-1 rounded-lg text-neutral-400 hover:text-white text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="px-3 py-1 rounded-lg bg-[#A855F7] hover:bg-[#9333EA] text-white font-bold text-xs cursor-pointer shadow-xs flex items-center gap-1"
                  >
                    {savingNotes && <RefreshCw className="w-3 h-3 animate-spin" />}
                    <span>Save Note</span>
                  </button>
                </div>
              )}

              {notesSavedSuccess && (
                <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                  <Check className="w-3 h-3" />
                  Note saved to database!
                </p>
              )}
            </div>
          )}
        </div>

        {/* =====================================================================
            ACCORDION 4: Conversation Summary ⌄ (Picture 2 Exact Match)
        ===================================================================== */}
        <div className="p-4 space-y-3">
          <button
            type="button"
            onClick={() => setSummaryOpen(!summaryOpen)}
            className="w-full flex items-center justify-between text-xs font-bold text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#A855F7]" />
              <span>Conversation Summary</span>
            </div>
            {summaryOpen ? (
              <ChevronUp className="w-4 h-4 text-neutral-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            )}
          </button>

          {summaryOpen && (
            <div className="p-3 rounded-xl bg-[#121620] border border-[#1E2536] text-xs text-neutral-300 space-y-1.5 leading-relaxed">
              <p className="font-semibold text-white">
                Customer inquired about White Half Zip &amp; Coffee Pant. Shared product picture and confirmed interest.
              </p>
              <div className="text-[11px] text-neutral-400 space-y-0.5 pt-1 border-t border-white/5">
                <p><span className="text-neutral-500">Intent:</span> Order Placement</p>
                <p><span className="text-neutral-500">Stage:</span> Awaiting delivery info confirmation</p>
              </div>
            </div>
          )}
        </div>

        {/* =====================================================================
            ACCORDION 5: Activity List with "See all" (Picture 2 Exact Match)
        ===================================================================== */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-white flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-neutral-400" />
              Activity List
            </span>
            <button
              type="button"
              className="text-[11px] text-[#A855F7] hover:underline cursor-pointer"
            >
              See all
            </button>
          </div>

          {/* Vertical Checklist Timeline (Picture 2 Exact Match) */}
          <div className="relative pl-6 space-y-3 text-xs pt-1">
            {/* Timeline line */}
            <div className="absolute left-2.5 top-2.5 bottom-2 w-0.5 bg-[#2E1A47]" />

            {/* Step 1 */}
            <div className="relative flex items-start gap-2.5">
              <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-[#7F22FE] text-white flex items-center justify-center ring-2 ring-[#0B0E14]">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <div>
                <p className="font-bold text-white text-xs">Your details</p>
                <p className="text-[11px] text-neutral-400">Please provide your name and email</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex items-start gap-2.5">
              <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-[#7F22FE] text-white flex items-center justify-center ring-2 ring-[#0B0E14]">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <div>
                <p className="font-bold text-white text-xs">Company details</p>
                <p className="text-[11px] text-neutral-400">A few details about your company</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex items-start gap-2.5">
              <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-[#7F22FE] text-white flex items-center justify-center ring-2 ring-[#0B0E14]">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <div>
                <p className="font-bold text-white text-xs">Invite your team</p>
                <p className="text-[11px] text-neutral-400">Start collaborating with your team</p>
              </div>
            </div>

            {/* Step 4 (Active/Incomplete) */}
            <div className="relative flex items-start gap-2.5">
              <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-[#1A202C] border-2 border-[#7F22FE] flex items-center justify-center ring-2 ring-[#0B0E14]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7F22FE]" />
              </div>
              <div>
                <p className="font-bold text-white text-xs">Add your socials</p>
                <p className="text-[11px] text-neutral-400">Share posts to your social accounts</p>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================================
            ACCORDION 6: Shared Files with "See all" (Picture 2 Exact Match)
        ===================================================================== */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-neutral-400" />
              Shared Files
            </span>
            <button
              type="button"
              className="text-[11px] text-[#A855F7] hover:underline cursor-pointer"
            >
              See all
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <img
              src="https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=400&auto=format&fit=crop&q=80"
              alt="Shared product"
              className="w-full h-24 object-cover rounded-xl border border-[#1E2536] hover:opacity-90 transition-opacity cursor-pointer"
            />
            <img
              src="https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&auto=format&fit=crop&q=80"
              alt="Shared product 2"
              className="w-full h-24 object-cover rounded-xl border border-[#1E2536] hover:opacity-90 transition-opacity cursor-pointer"
            />
          </div>
        </div>
      </div>
    </aside>
  );
};
