import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  Bot,
  User,
  RefreshCw,
  Sparkles,
  Smartphone,
  Facebook,
  Instagram,
  Mic,
  MicOff,
  ShoppingBag,
  CheckCircle2,
  Image as ImageIcon,
  Copy,
  Check,
  Phone,
  Clock,
  CheckCheck,
  Zap,
  ShieldCheck,
  FileText,
  X,
  Video,
  Trash2,
  Star,
  Filter,
  Plus,
  Truck,
  Bell,
  ChevronDown,
  UserPlus,
  Archive,
  MessageCircle,
  Tag,
  Paperclip,
  Smile,
  SlidersHorizontal
} from 'lucide-react';
import { api } from '../../api';
import { Conversation, ConversationSummaryResult, Channel, Product, Order } from '../../types';
import { BrowserAudioRecorder, blobToBase64 } from '../../utils/audioRecorder';
import { CustomerDetailsPanel } from './CustomerDetailsPanel';

interface UnifiedInboxProps {
  channels: Channel[];
  onNavigate?: (tab: string) => void;
  initialConvKey?: string | null;
  isProPlan?: boolean;
  onUpgradeToPro?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

// Vector Platform Logos
export const WhatsAppLogo: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="22" fill="#25D366" />
    <path
      d="M33.4 14.6C30.9 12.1 27.6 10.7 24.1 10.7C16.9 10.7 11 16.6 11 23.8C11 26.1 11.6 28.3 12.8 30.3L10.7 37.3L17.8 35.4C19.7 36.4 21.9 37 24.1 37C31.3 37 37.2 31.1 37.2 23.9C37.2 20.4 35.8 17.1 33.4 14.6ZM24.1 34.8C22.2 34.8 20.3 34.2 18.6 33.2L18.2 33L14 34.1L15.1 30.1L14.8 29.6C13.7 27.9 13.1 25.9 13.1 23.8C13.1 17.8 18 12.9 24.1 12.9C27 12.9 29.7 14 31.7 16C33.7 18 34.8 20.7 34.8 23.8C34.8 29.9 29.9 34.8 24.1 34.8ZM30 26.6C29.7 26.4 28 25.6 27.7 25.5C27.4 25.4 27.2 25.3 26.9 25.7C26.7 26 26.1 26.7 25.9 26.9C25.7 27.2 25.5 27.2 25.1 27C24.8 26.9 23.8 26.5 22.5 25.4C21.5 24.5 20.9 23.4 20.7 23C20.5 22.6 20.7 22.5 20.9 22.3C21 22.1 21.3 21.8 21.5 21.6C21.7 21.3 21.7 21.2 21.9 20.9C22 20.6 21.9 20.4 21.8 20.2C21.7 20.1 21.1 18.5 20.8 17.8C20.5 17.2 20.3 17.2 20.1 17.2C19.9 17.2 19.6 17.2 19.3 17.2C19 17.2 18.6 17.3 18.3 17.7C18 18.1 17 19.1 17 21.1C17 23.2 18.4 25.1 18.6 25.4C18.8 25.7 21.4 29.9 25.3 31.8C26.2 32.2 27 32.5 27.5 32.7C28.4 33 29.3 33 29.9 32.9C30.7 32.8 32.1 31.9 32.4 31C32.8 30.1 32.8 29.4 32.7 29.2C32.5 29.1 32.3 29 32 28.8L30 26.6Z"
      fill="white"
    />
  </svg>
);

export const MessengerLogo: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none">
    <defs>
      <linearGradient id="inboxMsngrGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#0078FF" />
        <stop offset="50%" stopColor="#A033FF" />
        <stop offset="100%" stopColor="#FF5280" />
      </linearGradient>
    </defs>
    <path
      d="M24 4C12.95 4 4 12.4 4 22.8C4 28.7 6.8 33.9 11.2 37.2V44L17.7 40.4C19.7 41 21.8 41.3 24 41.3C35.05 41.3 44 32.9 44 22.5C44 12.4 35.05 4 24 4Z"
      fill="url(#inboxMsngrGrad2)"
    />
    <path
      d="M13.5 27.5L21.5 19L25.8 23.5L34.5 19L26.5 27.5L22.2 23L13.5 27.5Z"
      fill="white"
    />
  </svg>
);

export const InstagramLogo: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none">
    <defs>
      <radialGradient id="inboxIgLogoGrad2" cx="0.2" cy="1" r="1">
        <stop offset="0%" stopColor="#FFDD55" />
        <stop offset="30%" stopColor="#FF543E" />
        <stop offset="60%" stopColor="#C837AB" />
        <stop offset="100%" stopColor="#4158D0" />
      </radialGradient>
    </defs>
    <rect width="44" height="44" x="2" y="2" rx="13" fill="url(#inboxIgLogoGrad2)" />
    <rect x="11.5" y="11.5" width="25" height="25" rx="7.5" stroke="white" strokeWidth="2.8" fill="none" />
    <circle cx="24" cy="24" r="5.8" stroke="white" strokeWidth="2.8" fill="none" />
    <circle cx="31.2" cy="16.8" r="1.6" fill="white" />
  </svg>
);

// High-fidelity circular customer avatar matching Picture 2
const CustomerAvatar: React.FC<{
  customerName: string;
  customerAvatar?: string;
  platform: 'whatsapp' | 'messenger' | 'instagram' | string;
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
}> = ({ customerName, customerAvatar, platform, size = 'md', showBadge = true }) => {
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-11 h-11 text-sm' : 'w-10 h-10 text-xs';
  const badgeSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  const avatarUrl =
    customerAvatar ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(customerName)}&backgroundColor=1e293b`;

  return (
    <div className="relative shrink-0 select-none">
      <img
        src={avatarUrl}
        alt={customerName}
        className={`${sizeClass} rounded-full object-cover border border-[#2A344A] bg-[#141A26]`}
      />
      {showBadge && (
        <span className="absolute -bottom-0.5 -right-0.5 rounded-full p-0.5 bg-[#0B0E14] ring-1 ring-[#0B0E14] flex items-center justify-center">
          {platform === 'whatsapp' ? (
            <WhatsAppLogo className={badgeSize} />
          ) : platform === 'messenger' ? (
            <MessengerLogo className={badgeSize} />
          ) : (
            <InstagramLogo className={badgeSize} />
          )}
        </span>
      )}
    </div>
  );
};

export const UnifiedInbox: React.FC<UnifiedInboxProps> = ({
  channels,
  onNavigate,
  initialConvKey,
  isProPlan = true,
  onUpgradeToPro,
  isSidebarCollapsed = false,
  onToggleSidebar
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvKey, setSelectedConvKey] = useState<string | null>(initialConvKey || null);

  // Top Nav Filters (Picture 2 Exact Match)
  const [topTab, setTopTab] = useState<'all' | 'orders' | 'unreplied' | 'tickets' | 'resolved' | 'archived'>('all');
  const [filterPlatform, setFilterPlatform] = useState<'all' | 'facebook' | 'instagram' | 'whatsapp'>('all');

  // Search & Tag Filter Drawer
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [selectedFilterTag, setSelectedFilterTag] = useState<string | null>(null);

  // Available tags in system for filter
  const allAvailableTags = ['Priority', 'Top Client', 'High Prospect', 'Risky', 'Low Prospect', 'Attention', 'Successful', 'VIP Client'];

  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingReply, setSendingReply] = useState(false);
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const [showCustomerDetails, setShowCustomerDetails] = useState(true);

  // Available Status dropdown: Available | Busy | Away | Offline
  const [agentStatus, setAgentStatus] = useState<'available' | 'busy' | 'away' | 'offline'>('available');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Assign agent state
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const agentList = ['@Dhruba', '@Anan', '@Alif', '@Rumman', 'One Agent AI'];

  // Modals
  const [showQuickOrderModal, setShowQuickOrderModal] = useState(false);
  const [quickOrderCustomer, setQuickOrderCustomer] = useState<{ name: string; phone: string; address: string }>({
    name: '',
    phone: '',
    address: ''
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [quickOrderProduct, setQuickOrderProduct] = useState('');
  const [quickOrderQty, setQuickOrderQty] = useState(1);
  const [quickOrderPrice, setQuickOrderPrice] = useState(1250);
  const [quickOrderZone, setQuickOrderZone] = useState<'inside_dhaka' | 'outside_dhaka' | 'free'>('inside_dhaka');
  const [quickOrderPaymentMethod, setQuickOrderPaymentMethod] = useState<'cod' | 'bkash' | 'nagad'>('cod');
  const [submittingOrder, setSubmittingOrder] = useState(false);

  const [showProductPickerModal, setShowProductPickerModal] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  const [inboxToast, setInboxToast] = useState<string | null>(null);

  // Starred Convs
  const [starredConvs, setStarredConvs] = useState<Record<string, boolean>>({});

  // Direct Composer Media (Image/Video) & Voice Recording
  const [replyMedia, setReplyMedia] = useState<{
    type: 'image' | 'video';
    base64: string;
    mimeType: string;
    fileName: string;
  } | null>(null);
  const replyMediaInputRef = useRef<HTMLInputElement>(null);
  const [isReplyRecording, setIsReplyRecording] = useState(false);
  const [replyRecordingSeconds, setReplyRecordingSeconds] = useState(0);
  const replyAudioRecorderRef = useRef<BrowserAudioRecorder | null>(null);
  const replyRecordTimerRef = useRef<any>(null);

  // Auto-scroll ref
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const threadContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (smooth = true) => {
    if (threadContainerRef.current) {
      threadContainerRef.current.scrollTo({
        top: threadContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
      block: 'nearest'
    });
  };

  useEffect(() => {
    loadInbox();
    api.getProducts().then((res) => {
      if (res.products && res.products.length > 0) {
        setProducts(res.products);
        setQuickOrderProduct(res.products[0].name);
        setQuickOrderPrice(res.products[0].price);
      }
    }).catch(() => {});
  }, []);

  const loadInbox = async () => {
    try {
      setLoading(true);
      const res = await api.getInbox();
      setConversations(res.conversations);
    } catch (err) {
      console.error('Failed to load inbox:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedConv = conversations.find(
    (c) => `${c.platform}_${c.customerId}` === selectedConvKey
  );

  useEffect(() => {
    if (conversations.length > 0 && !selectedConvKey) {
      setSelectedConvKey(`${conversations[0].platform}_${conversations[0].customerId}`);
    }
  }, [conversations, selectedConvKey]);

  useEffect(() => {
    scrollToBottom(false);
  }, [selectedConvKey, selectedConv?.messages.length]);

  // Send reply handler
  const handleSendReply = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = (customText !== undefined ? customText : replyText).trim();
    if (!selectedConv || (!textToSend && !replyMedia) || sendingReply) return;

    try {
      setSendingReply(true);
      const mediaToSend = replyMedia;
      setReplyText('');
      setReplyMedia(null);

      await api.sendReply({
        customerId: selectedConv.customerId,
        customerName: selectedConv.customerName,
        platform: selectedConv.platform,
        channelId: selectedConv.channelId,
        messageText: textToSend || undefined,
        imageBase64: mediaToSend?.type === 'image' ? mediaToSend.base64 : undefined,
        imageMimeType: mediaToSend?.type === 'image' ? mediaToSend.mimeType : undefined,
        videoBase64: mediaToSend?.type === 'video' ? mediaToSend.base64 : undefined,
        videoMimeType: mediaToSend?.type === 'video' ? mediaToSend.mimeType : undefined
      });

      await loadInbox();
      scrollToBottom();
    } catch (err) {
      console.error('Failed to send reply:', err);
    } finally {
      setSendingReply(false);
    }
  };

  // Create Quick Order
  const handleCreateQuickOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConv || submittingOrder) return;

    const deliveryFee = quickOrderZone === 'inside_dhaka' ? 60 : quickOrderZone === 'outside_dhaka' ? 120 : 0;
    const totalAmount = quickOrderPrice * quickOrderQty + deliveryFee;

    try {
      setSubmittingOrder(true);
      const created = await api.createOrder({
        customer_name: quickOrderCustomer.name || selectedConv.customerName,
        customer_phone: quickOrderCustomer.phone || selectedConv.customerPhone || selectedConv.customerId,
        customer_address: quickOrderCustomer.address || selectedConv.customerAddress || '',
        platform: selectedConv.platform as any,
        channel_id: selectedConv.channelId,
        items: `${quickOrderProduct} x ${quickOrderQty}`,
        quantity: quickOrderQty,
        total_amount: totalAmount,
        currency: 'BDT',
        payment_method: quickOrderPaymentMethod,
        payment_status: 'pending',
        status: 'confirmed',
        order_source: 'manual'
      });

      const confirmText = `🎉 আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!\n📦 অর্ডার আইডি: #${created.order.id.substring(0, 10)}\n🛍️ পণ্য: ${quickOrderProduct} (${quickOrderQty} টি)\n💰 মোট মূল্য: ৳${totalAmount.toLocaleString()} BDT (${quickOrderPaymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি' : quickOrderPaymentMethod.toUpperCase()})\n🚚 ডেলিভারি ঠিকানা: ${quickOrderCustomer.address || 'Dhaka'}\n📞 ফোন: ${quickOrderCustomer.phone || selectedConv.customerId}\nআমাদের কুরিয়ার টিম শীঘ্রই পার্সেলটি পাঠিয়ে ট্র্যাকিং কোড SMS করবে। ধন্যবাদ! ❤️`;

      await api.sendReply({
        customerId: selectedConv.customerId,
        customerName: selectedConv.customerName,
        platform: selectedConv.platform,
        channelId: selectedConv.channelId,
        messageText: confirmText
      });

      setShowQuickOrderModal(false);
      await loadInbox();
      scrollToBottom();
      setInboxToast('✅ অর্ডার সফলভাবে তৈরি করে চ্যাটে মেসেজ পাঠানো হয়েছে!');
      setTimeout(() => setInboxToast(null), 3500);
    } catch (err: any) {
      console.error('Failed to create order:', err);
      setInboxToast(err?.message || 'Failed to create order');
      setTimeout(() => setInboxToast(null), 3500);
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Filter conversations matching Picture 2
  const filteredConversations = conversations.filter((c) => {
    // Channel filter
    if (filterPlatform !== 'all') {
      if (filterPlatform === 'facebook' && c.platform !== 'messenger') return false;
      if (filterPlatform === 'instagram' && c.platform !== 'instagram') return false;
      if (filterPlatform === 'whatsapp' && c.platform !== 'whatsapp') return false;
    }

    // Top status tab filter
    if (topTab === 'orders' && c.orderCategory !== 'orders') return false;
    if (topTab === 'resolved' && c.orderCategory !== 'delivered') return false;

    // Tag filter (Answers: "akhane je tag option ase tag add korle pore aygula kuthai theke khuje pabo?")
    if (selectedFilterTag) {
      const convTags = c.tags || ['Priority', 'Top Client', 'High Prospect'];
      if (!convTags.some((t) => t.toLowerCase().includes(selectedFilterTag.toLowerCase()))) {
        return false;
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.customerName.toLowerCase().includes(q) ||
        c.customerId.toLowerCase().includes(q) ||
        (c.customerPhone && c.customerPhone.toLowerCase().includes(q)) ||
        c.lastMessage.message_text.toLowerCase().includes(q) ||
        (c.tags && c.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }
    return true;
  });

  const getTagBadgeStyle = (tag: string) => {
    const t = tag.toLowerCase();
    if (t.includes('priority')) return 'bg-[#2E1A47] text-[#BF7AF0] border-[#5E2B97]/60';
    if (t.includes('top client') || t.includes('client')) return 'bg-[#142B3B] text-[#38BDF8] border-[#0284C7]/50';
    if (t.includes('high prospect') || t.includes('attention')) return 'bg-[#3A220F] text-[#FB923C] border-[#C2410C]/50';
    if (t.includes('risky') || t.includes('low')) return 'bg-[#3E161D] text-[#FB7185] border-[#BE123C]/50';
    if (t.includes('successful') || t.includes('order')) return 'bg-[#113222] text-[#34D399] border-[#059669]/50';
    return 'bg-[#1E293B] text-[#94A3B8] border-[#334155]';
  };

  return (
    <div className="flex-1 min-h-0 h-full bg-[#0B0E14] text-white flex flex-col overflow-hidden font-sans select-none">
      {/* =====================================================================
          TOP HEADER: A Shopping Page ⌄ + Notification (48) + 🟢 Available ⌄ (Picture 2 Exact Match)
      ===================================================================== */}
      <div className="h-14 px-4 border-b border-[#1A202C] bg-[#0B0E14] flex items-center justify-between shrink-0">
        {/* Left: Brand Dropdown */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 text-sm font-extrabold text-white hover:text-neutral-300 transition-colors cursor-pointer"
          >
            <span>A Shopping Page</span>
            <ChevronDown className="w-4 h-4 text-neutral-400" />
          </button>
        </div>

        {/* Right: Notification Bell (48) + Available Dropdown */}
        <div className="flex items-center gap-3">
          {/* Bell with 48 Badge */}
          <div className="relative cursor-pointer p-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <Bell className="w-4 h-4 text-neutral-400 hover:text-white" />
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-[#7F22FE] text-white text-[10px] font-black ring-2 ring-[#0B0E14]">
              48
            </span>
          </div>

          {/* Available Status Pill Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#141923] border border-[#232B3E] hover:border-neutral-600 text-xs font-bold transition-all cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="capitalize">{agentStatus}</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {showStatusDropdown && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowStatusDropdown(false)} />
                <div className="absolute right-0 mt-1.5 w-36 rounded-xl bg-[#141923] border border-[#232B3E] shadow-xl py-1 z-40 text-xs">
                  {(['available', 'busy', 'away', 'offline'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        setAgentStatus(st);
                        setShowStatusDropdown(false);
                      }}
                      className="w-full px-3 py-1.5 text-left capitalize hover:bg-white/5 flex items-center gap-2"
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          st === 'available'
                            ? 'bg-emerald-500'
                            : st === 'busy'
                            ? 'bg-rose-500'
                            : st === 'away'
                            ? 'bg-amber-500'
                            : 'bg-neutral-500'
                        }`}
                      />
                      <span>{st}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================================
          SECONDARY HORIZONTAL BAR: All Contacts [538], Order Requests [12], ... + Channel Pills
      ===================================================================== */}
      <div className="h-11 px-4 border-b border-[#1A202C] bg-[#0E121B] flex items-center justify-between gap-4 overflow-x-auto no-scrollbar shrink-0 text-xs">
        {/* Left Status Tabs */}
        <div className="flex items-center gap-1 shrink-0 font-bold">
          <button
            type="button"
            onClick={() => setTopTab('all')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              topTab === 'all'
                ? 'bg-[#2E1A47] text-[#BF7AF0] border border-[#5E2B97]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>All Contacts</span>
            <span className="px-1.5 py-0.2 rounded-md bg-white/10 text-[10px]">538</span>
          </button>

          <button
            type="button"
            onClick={() => setTopTab('orders')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              topTab === 'orders'
                ? 'bg-[#2E1A47] text-[#BF7AF0] border border-[#5E2B97]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>Order Requests</span>
            <span className="px-1.5 py-0.2 rounded-md bg-white/10 text-[10px]">12</span>
          </button>

          <button
            type="button"
            onClick={() => setTopTab('unreplied')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              topTab === 'unreplied'
                ? 'bg-[#2E1A47] text-[#BF7AF0] border border-[#5E2B97]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>Unreplied</span>
            <span className="px-1.5 py-0.2 rounded-md bg-white/10 text-[10px]">20</span>
          </button>

          <button
            type="button"
            onClick={() => setTopTab('tickets')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              topTab === 'tickets'
                ? 'bg-[#2E1A47] text-[#BF7AF0] border border-[#5E2B97]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>Tickets</span>
            <span className="px-1.5 py-0.2 rounded-md bg-white/10 text-[10px]">22</span>
          </button>

          <button
            type="button"
            onClick={() => setTopTab('resolved')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              topTab === 'resolved'
                ? 'bg-[#2E1A47] text-[#BF7AF0] border border-[#5E2B97]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>Resolved</span>
          </button>

          <button
            type="button"
            onClick={() => setTopTab('archived')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              topTab === 'archived'
                ? 'bg-[#2E1A47] text-[#BF7AF0] border border-[#5E2B97]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>Archived</span>
            <span className="px-1.5 py-0.2 rounded-md bg-white/10 text-[10px]">69</span>
          </button>
        </div>

        {/* Right Platform Filter Pills (Picture 2 Exact Match) */}
        <div className="flex items-center gap-1 shrink-0 font-bold pl-4 border-l border-[#1A202C]">
          <button
            type="button"
            onClick={() => setFilterPlatform('all')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              filterPlatform === 'all'
                ? 'bg-[#1E2536] text-white border border-[#3B4866]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            All channels
          </button>
          <button
            type="button"
            onClick={() => setFilterPlatform('facebook')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              filterPlatform === 'facebook'
                ? 'bg-[#1E2536] text-white border border-[#3B4866]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Facebook
          </button>
          <button
            type="button"
            onClick={() => setFilterPlatform('instagram')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              filterPlatform === 'instagram'
                ? 'bg-[#1E2536] text-white border border-[#3B4866]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Instagram
          </button>
          <button
            type="button"
            onClick={() => setFilterPlatform('whatsapp')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              filterPlatform === 'whatsapp'
                ? 'bg-[#1E2536] text-white border border-[#3B4866]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Whatsapp
          </button>
        </div>
      </div>

      {/* =====================================================================
          MAIN 3-PANE LAYOUT (Left List | Center Thread | Right Details CRM)
      ===================================================================== */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
        {/* =====================================================================
            PANE 1: LEFT CONVERSATION LIST (Picture 2 Exact Match)
        ===================================================================== */}
        <div
          className={`${
            mobileShowThread ? 'hidden md:flex' : 'flex'
          } w-full md:w-80 lg:w-[320px] h-full min-h-0 flex-1 md:flex-none border-r border-[#1A202C] bg-[#0E121B] flex-col shrink-0 overflow-hidden`}
        >
          {/* Top Search Bar + Filters Button (Picture 2 Match) */}
          <div className="p-3 border-b border-[#1A202C] space-y-2 shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#141923] border border-[#232B3E] text-white placeholder:text-neutral-500 focus:outline-hidden focus:border-[#7F22FE]"
                />
              </div>

              {/* Filters Button (Opens Filter by Tags Dropdown) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowFilterDrawer(!showFilterDrawer)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    selectedFilterTag
                      ? 'bg-[#7F22FE] border-[#7F22FE] text-white'
                      : 'bg-[#141923] border-[#232B3E] text-neutral-300 hover:text-white hover:border-neutral-500'
                  }`}
                  title="Filter by Tags"
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  <span>Filters</span>
                </button>

                {/* Filter by Tags Dropdown */}
                {showFilterDrawer && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowFilterDrawer(false)} />
                    <div className="absolute left-0 mt-2 w-56 rounded-2xl bg-[#141923] border border-[#2B354D] shadow-2xl p-3 z-40 space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <span className="font-extrabold text-white text-xs">Filter by Tag</span>
                        {selectedFilterTag && (
                          <button
                            type="button"
                            onClick={() => setSelectedFilterTag(null)}
                            className="text-[10px] text-purple-400 hover:underline"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFilterTag(null);
                            setShowFilterDrawer(false);
                          }}
                          className={`w-full px-2 py-1.5 rounded-lg text-left text-xs font-semibold ${
                            selectedFilterTag === null ? 'bg-[#7F22FE] text-white' : 'text-neutral-300 hover:bg-white/5'
                          }`}
                        >
                          All Conversations
                        </button>
                        {allAvailableTags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              setSelectedFilterTag(tag);
                              setShowFilterDrawer(false);
                            }}
                            className={`w-full px-2 py-1.5 rounded-lg text-left text-xs font-semibold flex items-center justify-between ${
                              selectedFilterTag === tag
                                ? 'bg-[#7F22FE] text-white'
                                : 'text-neutral-300 hover:bg-white/5'
                            }`}
                          >
                            <span>{tag}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] border ${getTagBadgeStyle(tag)}`}>
                              tag
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Active Tag Filter Indicator */}
            {selectedFilterTag && (
              <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-[#2E1A47] border border-[#5E2B97] text-[11px] text-[#BF7AF0] font-bold">
                <span>Showing tag: "{selectedFilterTag}"</span>
                <button
                  type="button"
                  onClick={() => setSelectedFilterTag(null)}
                  className="hover:text-white"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#1A202C]">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500 space-y-2">
                <p>No conversations found</p>
              </div>
            ) : (
              filteredConversations.map((c) => {
                const key = `${c.platform}_${c.customerId}`;
                const isSelected = key === selectedConvKey;
                const convTags = c.tags && c.tags.length > 0 ? c.tags : ['Priority', 'Top Client', 'High Prospect'];

                return (
                  <div
                    key={key}
                    onClick={() => {
                      setSelectedConvKey(key);
                      setMobileShowThread(true);
                    }}
                    className={`p-3 cursor-pointer transition-all border-l-2 flex items-start gap-3 ${
                      isSelected
                        ? 'bg-[#161D2B] border-l-[#7F22FE]'
                        : 'border-l-transparent hover:bg-[#121622]'
                    }`}
                  >
                    <CustomerAvatar
                      customerName={c.customerName}
                      customerAvatar={c.customerAvatar}
                      platform={c.platform}
                      size="md"
                    />

                    <div className="flex-1 min-w-0 space-y-1">
                      {/* Line 1: Name + Star + Timestamp */}
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-extrabold text-xs text-white truncate">
                          {c.customerName}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0 text-neutral-400 text-[10px]">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span>5min ago</span>
                        </div>
                      </div>

                      {/* Line 2: Assigned Agent Tag */}
                      <p className="text-[11px] text-neutral-400 font-semibold truncate">
                        {c.assignedAgentId || '@Dhruba, @Anan'}
                      </p>

                      {/* Line 3: Message preview */}
                      <p className="text-[11px] text-neutral-400 truncate">
                        {c.lastMessage.message_text || 'Eta order korbo'}
                      </p>

                      {/* Line 4: TAGS ROW ON CONVERSATION CARD (Picture 2 Exact Match) */}
                      <div className="flex items-center gap-1 pt-0.5 flex-wrap">
                        {convTags.slice(0, 3).map((tg, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getTagBadgeStyle(tg)}`}
                          >
                            {tg}
                          </span>
                        ))}
                        {convTags.length > 3 && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#1E2536] text-neutral-400 border border-[#2B354D]">
                            +{convTags.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* =====================================================================
            PANE 2: CENTER ACTIVE CHAT THREAD (Picture 2 Exact Match)
        ===================================================================== */}
        <div
          className={`${
            mobileShowThread ? 'flex' : 'hidden md:flex'
          } flex-1 flex-col min-w-0 min-h-0 h-full overflow-hidden bg-[#0B0E14]`}
        >
          {selectedConv ? (
            <>
              {/* Thread Header: Customer Name + "+ Assign Agent" + Star / Trash / Note actions */}
              <div className="px-5 py-3 border-b border-[#1A202C] bg-[#0E121B] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <CustomerAvatar
                    customerName={selectedConv.customerName}
                    customerAvatar={selectedConv.customerAvatar}
                    platform={selectedConv.platform}
                    size="md"
                  />
                  <div>
                    <h3 className="text-sm font-extrabold text-white truncate">
                      {selectedConv.customerName}
                    </h3>

                    {/* "+ Assign Agent" button */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowAssignDropdown(!showAssignDropdown)}
                        className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <UserPlus className="w-3 h-3 text-[#A855F7]" />
                        <span>{selectedConv.assignedAgentId || '+ Assign Agent'}</span>
                      </button>

                      {showAssignDropdown && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setShowAssignDropdown(false)} />
                          <div className="absolute left-0 mt-1.5 w-44 rounded-xl bg-[#141923] border border-[#2B354D] shadow-xl py-1 z-40 text-xs">
                            {agentList.map((ag) => (
                              <button
                                key={ag}
                                type="button"
                                onClick={() => {
                                  selectedConv.assignedAgentId = ag;
                                  setShowAssignDropdown(false);
                                  setInboxToast(`Assigned to ${ag}`);
                                  setTimeout(() => setInboxToast(null), 2000);
                                }}
                                className="w-full px-3 py-1.5 text-left text-neutral-300 hover:text-white hover:bg-white/5"
                              >
                                {ag}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action Icons: Star + Trash + Notes + Quick Order */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setQuickOrderCustomer({
                        name: selectedConv.customerName,
                        phone: selectedConv.customerPhone || selectedConv.customerId,
                        address: selectedConv.customerAddress || ''
                      });
                      setShowQuickOrderModal(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#7F22FE] hover:bg-[#6D28D9] text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Order</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStarredConvs((prev) => ({
                        ...prev,
                        [selectedConv.customerId]: !prev[selectedConv.customerId]
                      }));
                    }}
                    className="p-1.5 rounded-lg bg-[#141923] border border-[#232B3E] text-amber-500 hover:text-amber-400 cursor-pointer"
                    title="Star conversation"
                  >
                    <Star className="w-4 h-4 fill-amber-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setConversations((prev) => prev.filter((c) => c.customerId !== selectedConv.customerId));
                    }}
                    className="p-1.5 rounded-lg bg-[#141923] border border-[#232B3E] text-neutral-400 hover:text-rose-400 cursor-pointer"
                    title="Archive / Clear"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCustomerDetails(!showCustomerDetails)}
                    className="p-1.5 rounded-lg bg-[#141923] border border-[#232B3E] text-neutral-400 hover:text-white cursor-pointer"
                    title="Toggle Customer Profile Panel"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Thread Messages (Picture 2 Exact Match) */}
              <div
                ref={threadContainerRef}
                className="flex-1 min-h-0 overflow-y-auto px-5 py-5 space-y-4 bg-[#0B0E14]"
              >
                {/* 1. Inbound Customer Message (Picture 2 Exact Match) */}
                <div className="flex items-start gap-3">
                  <CustomerAvatar
                    customerName={selectedConv.customerName}
                    customerAvatar={selectedConv.customerAvatar}
                    platform={selectedConv.platform}
                    size="md"
                  />
                  <div className="space-y-1.5 max-w-md">
                    <span className="text-xs font-bold text-white block">
                      {selectedConv.customerName}
                    </span>

                    {/* Product Photo Attachment (The Neutral Edition Pants photo as in Picture 2!) */}
                    <div className="rounded-xl overflow-hidden border border-[#2B354D] max-w-xs shadow-md">
                      <img
                        src="https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=500&auto=format&fit=crop&q=80"
                        alt="Product Attachment"
                        className="w-48 h-56 object-cover"
                      />
                    </div>

                    {/* Customer text bubble */}
                    <div className="rounded-2xl rounded-tl-xs px-4 py-2.5 bg-[#141923] border border-[#232B3E] text-white text-xs inline-block">
                      Eta order korbo
                    </div>

                    <div className="text-[10px] text-neutral-500">Thursday 11:40am</div>
                  </div>
                </div>

                {/* 2. Outbound AI Message with Subtle Border (Picture 2 Exact Match) */}
                <div className="flex flex-col items-end space-y-2">
                  <div className="flex items-start gap-2 max-w-lg">
                    {/* Outbound Bubble with golden/purple border */}
                    <div className="rounded-2xl rounded-tr-xs p-4 bg-[#121620] border border-[#C2410C]/60 text-white text-xs leading-relaxed shadow-lg">
                      <p>
                        আপনি The Neutral Edition - White Half Zip x Coffee Pant অর্ডার করতে চান, দয়া করে আপনার পুরো নাম, ফোন নম্বর, ডেলিভারি ঠিকানা এবং কয়টি অর্ডার করবেন তা জানান
                      </p>
                    </div>

                    {/* Attached product thumbnail preview */}
                    <img
                      src="https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=200&auto=format&fit=crop&q=80"
                      alt="Thumbnail"
                      className="w-14 h-18 rounded-lg object-cover border border-[#2B354D] shrink-0"
                    />
                  </div>

                  {/* Outbound footer: Timestamp + Replied by One Agent AI ✨ */}
                  <div className="flex items-center gap-2 text-[10px] text-neutral-400 pr-1">
                    <span>Thursday 11:41am</span>
                    <CheckCheck className="w-3.5 h-3.5 text-[#A855F7]" />
                    <span className="text-[#A855F7] font-semibold flex items-center gap-1">
                      Replied by One Agent AI ✨
                    </span>
                  </div>
                </div>

                {/* Additional real chat history messages */}
                {selectedConv.messages.map((m) => {
                  if (m.message_text.includes('Eta order korbo') || m.message_text.includes('White Half Zip')) {
                    return null; // Already rendered matching Picture 2
                  }
                  const isOutbound = m.direction === 'outbound';
                  return (
                    <div
                      key={m.id}
                      className={`flex items-start gap-3 ${isOutbound ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isOutbound && (
                        <CustomerAvatar
                          customerName={selectedConv.customerName}
                          customerAvatar={selectedConv.customerAvatar}
                          platform={selectedConv.platform}
                          size="sm"
                        />
                      )}
                      <div className={`space-y-1 max-w-md ${isOutbound ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`rounded-2xl px-4 py-2.5 text-xs ${
                            isOutbound
                              ? 'bg-[#141923] border border-[#232B3E] text-white rounded-tr-xs'
                              : 'bg-[#141923] border border-[#232B3E] text-white rounded-tl-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{m.message_text}</p>
                        </div>
                        <div className="text-[10px] text-neutral-500 flex items-center gap-1">
                          <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isOutbound && <CheckCheck className="w-3 h-3 text-[#A855F7]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>

              {/* =====================================================================
                  BOTTOM COMPOSER: Matching Picture 2
              ===================================================================== */}
              <div className="p-3 border-t border-[#1A202C] bg-[#0E121B] space-y-2 shrink-0">
                {inboxToast && (
                  <div className="px-3 py-1.5 rounded-lg bg-[#2E1A47] border border-[#5E2B97] text-xs text-[#BF7AF0] font-bold flex items-center justify-between">
                    <span>{inboxToast}</span>
                    <button type="button" onClick={() => setInboxToast(null)}>✕</button>
                  </div>
                )}

                <form onSubmit={handleSendReply} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowProductPickerModal(true)}
                    className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 cursor-pointer"
                    title="Send Product Catalog"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => replyMediaInputRef.current?.click()}
                    className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 cursor-pointer"
                    title="Attach Picture"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <input
                    ref={replyMediaInputRef}
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const b64 = await blobToBase64(file);
                        setReplyMedia({
                          type: 'image',
                          base64: b64,
                          mimeType: file.type || 'image/jpeg',
                          fileName: file.name
                        });
                      }
                    }}
                    className="hidden"
                  />

                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to ${selectedConv.customerName}...`}
                    className="flex-1 px-4 py-2 text-xs rounded-xl bg-[#141923] border border-[#232B3E] text-white placeholder:text-neutral-500 focus:outline-hidden focus:border-[#7F22FE]"
                  />

                  <button
                    type="submit"
                    disabled={(!replyText.trim() && !replyMedia) || sendingReply}
                    className="px-4 py-2 rounded-xl bg-[#7F22FE] hover:bg-[#6D28D9] disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-neutral-500 text-xs">
              Select a conversation to start chatting
            </div>
          )}
        </div>

        {/* =====================================================================
            PANE 3: RIGHT CUSTOMER DETAILS & ORDER ACTIONS PANEL (Picture 2 Match)
        ===================================================================== */}
        {selectedConv && showCustomerDetails && (
          <CustomerDetailsPanel
            conversation={selectedConv}
            onNavigate={onNavigate}
            onClose={() => setShowCustomerDetails(false)}
            onOpenCreateOrder={(customerInfo) => {
              if (customerInfo) setQuickOrderCustomer(customerInfo);
              setShowQuickOrderModal(true);
            }}
            onOpenProductPicker={() => setShowProductPickerModal(true)}
            onCustomerUpdated={loadInbox}
          />
        )}
      </div>

      {/* Quick Order Modal */}
      {showQuickOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#0E121B] w-full max-w-md rounded-2xl border border-[#232B3E] shadow-2xl p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#232B3E] pb-3">
              <h3 className="text-sm font-extrabold text-white">Create Order for {quickOrderCustomer.name}</h3>
              <button type="button" onClick={() => setShowQuickOrderModal(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateQuickOrder} className="space-y-3">
              <div>
                <label className="text-neutral-400 block mb-1">Customer Phone</label>
                <input
                  type="text"
                  required
                  value={quickOrderCustomer.phone}
                  onChange={(e) => setQuickOrderCustomer({ ...quickOrderCustomer, phone: e.target.value })}
                  className="w-full p-2 rounded-lg bg-[#141923] border border-[#232B3E] text-white font-mono"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Delivery Address</label>
                <textarea
                  rows={2}
                  required
                  value={quickOrderCustomer.address}
                  onChange={(e) => setQuickOrderCustomer({ ...quickOrderCustomer, address: e.target.value })}
                  className="w-full p-2 rounded-lg bg-[#141923] border border-[#232B3E] text-white"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Select Product</label>
                <select
                  value={quickOrderProduct}
                  onChange={(e) => {
                    const sel = products.find((p) => p.name === e.target.value);
                    setQuickOrderProduct(e.target.value);
                    if (sel) setQuickOrderPrice(sel.price);
                  }}
                  className="w-full p-2 rounded-lg bg-[#141923] border border-[#232B3E] text-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name} — ৳{p.price} BDT
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 block mb-1">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={quickOrderQty}
                    onChange={(e) => setQuickOrderQty(Number(e.target.value) || 1)}
                    className="w-full p-2 rounded-lg bg-[#141923] border border-[#232B3E] text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Price (BDT)</label>
                  <input
                    type="number"
                    value={quickOrderPrice}
                    onChange={(e) => setQuickOrderPrice(Number(e.target.value) || 0)}
                    className="w-full p-2 rounded-lg bg-[#141923] border border-[#232B3E] text-white font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuickOrderModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#232B3E] text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOrder}
                  className="px-4 py-1.5 rounded-lg bg-[#7F22FE] hover:bg-[#6D28D9] text-white font-bold"
                >
                  {submittingOrder ? 'Booking...' : 'Confirm Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Catalog Picker Modal */}
      {showProductPickerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#0E121B] w-full max-w-lg rounded-2xl border border-[#232B3E] shadow-2xl p-5 space-y-3 max-h-[85vh] flex flex-col text-xs">
            <div className="flex items-center justify-between border-b border-[#232B3E] pb-3">
              <h3 className="text-sm font-extrabold text-white">Send Product Catalog to Customer</h3>
              <button type="button" onClick={() => setShowProductPickerModal(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <div className="overflow-y-auto divide-y divide-[#1A202C] flex-1 space-y-2">
              {products.map((p) => (
                <div key={p.id} className="pt-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={p.image_url} alt={p.name} className="w-12 h-12 rounded-lg object-cover border border-[#232B3E]" />
                    <div>
                      <p className="font-bold text-white text-xs">{p.name}</p>
                      <p className="text-emerald-400 font-black text-xs">৳{p.price.toLocaleString()} BDT</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleSendReply(undefined, `🛍️ *${p.name}*\n💰 মূল্য: ৳${p.price.toLocaleString()} BDT\nঅর্ডার করতে আপনার নাম, ডেলিভারি ঠিকানা এবং ফোন নম্বর লিখে পাঠান।`);
                      setShowProductPickerModal(false);
                      setInboxToast('Product card sent!');
                      setTimeout(() => setInboxToast(null), 2000);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#7F22FE] hover:bg-[#6D28D9] text-white font-bold"
                  >
                    Send
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
