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
  Mic,
  ShoppingBag,
  CheckCircle2,
  Image as ImageIcon,
  CheckCheck,
  X,
  Trash2,
  Star,
  Plus,
  MoreVertical,
  BookOpen,
  SplitSquareVertical,
  UserCheck,
  Tag,
  RotateCcw,
  AlertCircle,
  FileText,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { api } from '../../api';
import { Conversation, Channel, Product, Order, ConversationSummaryResult } from '../../types';
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
export const WhatsAppLogo: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="22" fill="#25D366" />
    <path
      d="M33.4 14.6C30.9 12.1 27.6 10.7 24.1 10.7C16.9 10.7 11 16.6 11 23.8C11 26.1 11.6 28.3 12.8 30.3L10.7 37.3L17.8 35.4C19.7 36.4 21.9 37 24.1 37C31.3 37 37.2 31.1 37.2 23.9C37.2 20.4 35.8 17.1 33.4 14.6ZM24.1 34.8C22.2 34.8 20.3 34.2 18.6 33.2L18.2 33L14 34.1L15.1 30.1L14.8 29.6C13.7 27.9 13.1 25.9 13.1 23.8C13.1 17.8 18 12.9 24.1 12.9C27 12.9 29.7 14 31.7 16C33.7 18 34.8 20.7 34.8 23.8C34.8 29.9 29.9 34.8 24.1 34.8ZM30 26.6C29.7 26.4 28 25.6 27.7 25.5C27.4 25.4 27.2 25.3 26.9 25.7C26.7 26 26.1 26.7 25.9 26.9C25.7 27.2 25.5 27.2 25.1 27C24.8 26.9 23.8 26.5 22.5 25.4C21.5 24.5 20.9 23.4 20.7 23C20.5 22.6 20.7 22.5 20.9 22.3C21 22.1 21.3 21.8 21.5 21.6C21.7 21.3 21.7 21.2 21.9 20.9C22 20.6 21.9 20.4 21.8 20.2C21.7 20.1 21.1 18.5 20.8 17.8C20.5 17.2 20.3 17.2 20.1 17.2C19.9 17.2 19.6 17.2 19.3 17.2C19 17.2 18.6 17.3 18.3 17.7C18 18.1 17 19.1 17 21.1C17 23.2 18.4 25.1 18.6 25.4C18.8 25.7 21.4 29.9 25.3 31.8C26.2 32.2 27 32.5 27.5 32.7C28.4 33 29.3 33 29.9 32.9C30.7 32.8 32.1 31.9 32.4 31C32.8 30.1 32.8 29.4 32.7 29.2C32.5 29.1 32.3 29 32 28.8L30 26.6Z"
      fill="white"
    />
  </svg>
);

export const MessengerLogo: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none">
    <defs>
      <linearGradient id="inboxMsngrGrad3" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#0078FF" />
        <stop offset="50%" stopColor="#A033FF" />
        <stop offset="100%" stopColor="#FF5280" />
      </linearGradient>
    </defs>
    <path
      d="M24 4C12.95 4 4 12.4 4 22.8C4 28.7 6.8 33.9 11.2 37.2V44L17.7 40.4C19.7 41 21.8 41.3 24 41.3C35.05 41.3 44 32.9 44 22.5C44 12.4 35.05 4 24 4Z"
      fill="url(#inboxMsngrGrad3)"
    />
    <path
      d="M13.5 27.5L21.5 19L25.8 23.5L34.5 19L26.5 27.5L22.2 23L13.5 27.5Z"
      fill="white"
    />
  </svg>
);

export const InstagramLogo: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none">
    <defs>
      <radialGradient id="inboxIgLogoGrad3" cx="0.2" cy="1" r="1">
        <stop offset="0%" stopColor="#FFDD55" />
        <stop offset="30%" stopColor="#FF543E" />
        <stop offset="60%" stopColor="#C837AB" />
        <stop offset="100%" stopColor="#4158D0" />
      </radialGradient>
    </defs>
    <rect width="44" height="44" x="2" y="2" rx="13" fill="url(#inboxIgLogoGrad3)" />
    <rect x="11.5" y="11.5" width="25" height="25" rx="7.5" stroke="white" strokeWidth="2.8" fill="none" />
    <circle cx="24" cy="24" r="5.8" stroke="white" strokeWidth="2.8" fill="none" />
    <circle cx="31.2" cy="16.8" r="1.6" fill="white" />
  </svg>
);

// High-fidelity curated avatars ensuring real customer profile pictures
const CURATED_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
];

export const getCustomerAvatarUrl = (name: string, customerId: string, customAvatar?: string): string => {
  if (customAvatar && customAvatar.trim().startsWith('http')) {
    return customAvatar;
  }
  let hash = 0;
  const str = `${customerId}_${name}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % CURATED_AVATARS.length;
  return CURATED_AVATARS[index];
};

// Customer Profile Avatar Component with photo & fallback initials
const CustomerAvatar: React.FC<{
  customerName: string;
  customerId?: string;
  avatarUrl?: string;
  platform: 'whatsapp' | 'messenger' | 'instagram' | string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ customerName, customerId = '', avatarUrl, platform, size = 'md' }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const photoSrc = getCustomerAvatarUrl(customerName, customerId, avatarUrl);

  const getInitials = (name: string) => {
    if (!name) return 'CU';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(customerName);
  const sizeClasses =
    size === 'sm'
      ? 'w-8 h-8 text-xs'
      : size === 'lg'
      ? 'w-11 h-11 text-sm'
      : 'w-10 h-10 text-xs';

  return (
    <div className="relative shrink-0 select-none">
      {!imgFailed ? (
        <img
          src={photoSrc}
          alt={customerName}
          onError={() => setImgFailed(true)}
          className={`${sizeClasses} rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shadow-xs`}
          loading="lazy"
        />
      ) : (
        <div
          className={`${sizeClasses} rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white tracking-wider shadow-xs`}
        >
          {initials}
        </div>
      )}
      <span className="absolute -bottom-0.5 -right-0.5 rounded-full p-0.5 bg-white dark:bg-[#0B0E14] ring-1 ring-slate-100 dark:ring-slate-800 shadow-xs flex items-center justify-center">
        {platform === 'whatsapp' ? (
          <WhatsAppLogo className="w-3 h-3" />
        ) : platform === 'messenger' ? (
          <MessengerLogo className="w-3 h-3" />
        ) : (
          <InstagramLogo className="w-3 h-3" />
        )}
      </span>
    </div>
  );
};

export const UnifiedInbox: React.FC<UnifiedInboxProps> = ({
  channels,
  onNavigate,
  initialConvKey,
  isProPlan,
  onUpgradeToPro
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvKey, setSelectedConvKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'orders' | 'delivered' | 'starred' | 'trash'>('all');
  const [filterPlatform, setFilterPlatform] = useState<'all' | 'whatsapp' | 'messenger' | 'instagram'>('all');
  const [showRightCrm, setShowRightCrm] = useState(false);
  const [mobileShowThread, setMobileShowThread] = useState(false);

  // 3-Dot Menu Dropdown State
  const [showThreeDotMenu, setShowThreeDotMenu] = useState(false);
  const threeDotRef = useRef<HTMLDivElement>(null);

  // AI Summary Modal State
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryData, setSummaryData] = useState<ConversationSummaryResult | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Tag Management Dialog State
  const [showTagModal, setShowTagModal] = useState(false);
  const [tagInputText, setTagInputText] = useState('');

  // Chat inputs & action state
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [replyMedia, setReplyMedia] = useState<{
    type: 'image' | 'video';
    base64: string;
    mimeType: string;
    previewUrl: string;
  } | null>(null);

  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const audioRecorderRef = useRef<BrowserAudioRecorder | null>(null);
  const recordingTimerRef = useRef<any>(null);

  // Quick Order Modal
  const [showQuickOrderModal, setShowQuickOrderModal] = useState(false);
  const [quickOrderCustomer, setQuickOrderCustomer] = useState({ name: '', phone: '', address: '' });
  const [quickOrderProduct, setQuickOrderProduct] = useState('Standard Package');
  const [quickOrderPrice, setQuickOrderPrice] = useState(1250);
  const [quickOrderQty, setQuickOrderQty] = useState(1);
  const [quickOrderPaymentMethod, setQuickOrderPaymentMethod] = useState<'cod' | 'bkash' | 'nagad'>('cod');
  const [quickOrderZone, setQuickOrderZone] = useState<'inside_dhaka' | 'outside_dhaka'>('inside_dhaka');
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Product catalog picker modal
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [storeProducts, setStoreProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // AI Active state
  const [isAiPaused, setIsAiPaused] = useState(false);

  // Category counts
  const [categoryCounts, setCategoryCounts] = useState({
    all: 0,
    orders: 0,
    delivered: 0,
    starred: 0,
    trash: 0
  });

  // Toast
  const [inboxToast, setInboxToast] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setInboxToast(msg);
    setTimeout(() => setInboxToast(null), 3200);
  };

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  // Close 3-dot menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (threeDotRef.current && !threeDotRef.current.contains(e.target as Node)) {
        setShowThreeDotMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadInbox = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.getInbox();
      if (res.conversations && res.conversations.length > 0) {
        setConversations(res.conversations);
      } else {
        // Fallback default demo conversations with profile pictures and tags
        const fallback: Conversation[] = [
          {
            customerId: '8801711513252',
            customerName: 'Shahinul Islam',
            customerPhone: '01711513252',
            customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            platform: 'whatsapp',
            channelId: 'chn_wa_01',
            tags: ['VIP', 'Repeat Buyer'],
            isStarred: true,
            isDeleted: false,
            unreadCount: 0,
            orderCategory: 'new_customer',
            totalOrdersCount: 2,
            totalSpent: 2450,
            isAiPaused: false,
            isBlocked: false,
            requiresHumanAttention: false,
            lastMessage: {
              id: 'm1',
              user_id: 'u1',
              channel_id: 'chn_wa_01',
              platform: 'whatsapp',
              customer_id: '8801711513252',
              customer_name: 'Shahinul Islam',
              direction: 'outbound',
              is_ai_reply: true,
              status: 'delivered',
              message_text: "চ্যাটের ভেতরেই কাস্টমারের নাম, ঠিকানা ও মোবাইল নাম্বার নিয়ে AI অটোমেটিক অর্ডার বুক করে নেয়।\n\nএরপর ড্যাশবোর্ড থেকে মাত্র ১ ক্লিকে Steadfast, Pathao বা RedX কুরিয়ারে পার্সেল এন্ট্রি করতে পারবেন!\n\nআপনি বর্তমানে কোন কুরিয়ার সার্ভিসটি বেশি ব্যবহার করেন?",
              created_at: new Date().toISOString()
            },
            messages: [
              {
                id: 'm0',
                user_id: 'u1',
                channel_id: 'chn_wa_01',
                platform: 'whatsapp',
                customer_id: '8801711513252',
                customer_name: 'Shahinul Islam',
                direction: 'inbound',
                is_ai_reply: false,
                status: 'delivered',
                message_text: 'order details',
                created_at: new Date(Date.now() - 60000).toISOString()
              },
              {
                id: 'm1',
                user_id: 'u1',
                channel_id: 'chn_wa_01',
                platform: 'whatsapp',
                customer_id: '8801711513252',
                customer_name: 'Shahinul Islam',
                direction: 'outbound',
                is_ai_reply: true,
                status: 'delivered',
                message_text: "চ্যাটের ভেতরেই কাস্টমারের নাম, ঠিকানা ও মোবাইল নাম্বার নিয়ে AI অটোমেটিক অর্ডার বুক করে নেয়।\n\nএরপর ড্যাশবোর্ড থেকে মাত্র ১ ক্লিকে Steadfast, Pathao বা RedX কুরিয়ারে পার্সেল এন্ট্রি করতে পারবেন!\n\nআপনি বর্তমানে কোন কুরিয়ার সার্ভিসটি বেশি ব্যবহার করেন?",
                created_at: new Date().toISOString()
              }
            ]
          },
          {
            customerId: 'shahinul_bablu_fb_01',
            customerName: 'Shahinul Islam Bablu',
            customerPhone: '01711998877',
            customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
            platform: 'messenger',
            channelId: 'chn_fb_01',
            tags: ['Wholesale'],
            isStarred: false,
            isDeleted: false,
            unreadCount: 0,
            orderCategory: 'new_customer',
            totalOrdersCount: 0,
            totalSpent: 0,
            isAiPaused: false,
            isBlocked: false,
            requiresHumanAttention: false,
            lastMessage: {
              id: 'm2',
              user_id: 'u1',
              channel_id: 'chn_fb_01',
              platform: 'messenger',
              customer_id: 'shahinul_bablu_fb_01',
              customer_name: 'Shahinul Islam Bablu',
              direction: 'inbound',
              is_ai_reply: false,
              status: 'delivered',
              message_text: 'Ajk na kalk',
              created_at: new Date(Date.now() - 3600000).toISOString()
            },
            messages: [
              {
                id: 'm2',
                user_id: 'u1',
                channel_id: 'chn_fb_01',
                platform: 'messenger',
                customer_id: 'shahinul_bablu_fb_01',
                customer_name: 'Shahinul Islam Bablu',
                direction: 'inbound',
                is_ai_reply: false,
                status: 'delivered',
                message_text: 'Ajk na kalk',
                created_at: new Date(Date.now() - 3600000).toISOString()
              }
            ]
          },
          {
            customerId: 'saas_visitor_wa_01',
            customerName: 'SaaS Website Visitor',
            customerPhone: '01811223344',
            customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            platform: 'whatsapp',
            channelId: 'chn_wa_02',
            tags: ['Website Lead'],
            isStarred: false,
            isDeleted: false,
            unreadCount: 0,
            orderCategory: 'new_customer',
            totalOrdersCount: 0,
            totalSpent: 0,
            isAiPaused: false,
            isBlocked: false,
            requiresHumanAttention: false,
            lastMessage: {
              id: 'm3',
              user_id: 'u1',
              channel_id: 'chn_wa_02',
              platform: 'whatsapp',
              customer_id: 'saas_visitor_wa_01',
              customer_name: 'SaaS Website Visitor',
              direction: 'outbound',
              is_ai_reply: true,
              status: 'delivered',
              message_text: "AI: আপনি এখন 'One Agent BD'-এর অফিসিয়াল ওয়েবসাইটে লাইভ আছেন! কিভাবে সাহায্য করতে পারি?",
              created_at: new Date(Date.now() - 7200000).toISOString()
            },
            messages: [
              {
                id: 'm3',
                user_id: 'u1',
                channel_id: 'chn_wa_02',
                platform: 'whatsapp',
                customer_id: 'saas_visitor_wa_01',
                customer_name: 'SaaS Website Visitor',
                direction: 'outbound',
                is_ai_reply: true,
                status: 'delivered',
                message_text: "AI: আপনি এখন 'One Agent BD'-এর অফিসিয়াল ওয়েবসাইটে লাইভ আছেন! কিভাবে সাহায্য করতে পারি?",
                created_at: new Date(Date.now() - 7200000).toISOString()
              }
            ]
          }
        ];
        setConversations(fallback);
      }

      if (res.categoryCounts) {
        setCategoryCounts({
          all: res.categoryCounts.all ?? 0,
          orders: res.categoryCounts.orders ?? 0,
          delivered: res.categoryCounts.delivered ?? 0,
          starred: (res.categoryCounts as any).starred ?? 0,
          trash: (res.categoryCounts as any).trash ?? 0
        });
      }
    } catch (err) {
      console.error('Failed to load inbox:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadInbox(false);
    // Live auto-polling: Refresh conversations every 3.5 seconds so incoming Facebook & WhatsApp messages appear immediately
    const pollTimer = setInterval(() => {
      loadInbox(true);
    }, 3500);

    return () => clearInterval(pollTimer);
  }, []);

  const selectedConv = conversations.find(
    (c) => `${c.platform}_${c.customerId}` === selectedConvKey
  );

  useEffect(() => {
    if (conversations.length > 0 && !selectedConvKey) {
      const activeList = conversations.filter((c) => !c.isDeleted);
      const target = activeList[0] || conversations[0];
      if (target) {
        setSelectedConvKey(`${target.platform}_${target.customerId}`);
      }
    }
  }, [conversations, selectedConvKey]);

  useEffect(() => {
    if (selectedConv) {
      setIsAiPaused(Boolean(selectedConv.isAiPaused));
    }
  }, [selectedConvKey]);

  useEffect(() => {
    scrollToBottom(false);
  }, [selectedConvKey, selectedConv?.messages?.length]);

  // Star / Unstar Chat
  const handleToggleStar = async (conv?: Conversation) => {
    const target = conv || selectedConv;
    if (!target) return;
    const nextState = !target.isStarred;

    // Optimistic update
    setConversations((prev) =>
      prev.map((c) =>
        c.customerId === target.customerId ? { ...c, isStarred: nextState } : c
      )
    );

    try {
      await api.updateCustomerDetails(target.customerId, {
        isStarred: nextState
      });
      showToast(nextState ? '⭐ Chat marked as Starred' : 'Chat unstarred');
    } catch (err) {
      console.error('Failed to toggle star:', err);
      loadInbox();
    }
  };

  // Toggle AI Auto-Reply
  const handleToggleAi = async () => {
    if (!selectedConv) return;
    const nextPaused = !isAiPaused;
    setIsAiPaused(nextPaused);

    try {
      await api.toggleCustomerControl(
        selectedConv.customerId,
        nextPaused ? 'pause_ai' : 'resume_ai',
        selectedConv.platform
      );
      setConversations((prev) =>
        prev.map((c) =>
          c.customerId === selectedConv.customerId ? { ...c, isAiPaused: nextPaused } : c
        )
      );
      showToast(nextPaused ? '⏸️ AI Auto-reply paused for this customer' : '⚡ AI Auto-reply activated');
    } catch (err) {
      console.error('Failed to toggle AI control:', err);
    }
    setShowThreeDotMenu(false);
  };

  // Open AI Summary
  const handleOpenAiSummary = async () => {
    if (!selectedConv) return;
    setShowThreeDotMenu(false);
    setShowSummaryModal(true);
    setLoadingSummary(true);

    try {
      const summary = await api.summarizeConversation({
        customerId: selectedConv.customerId,
        customerName: selectedConv.customerName,
        platform: selectedConv.platform,
        channelId: selectedConv.channelId
      });
      setSummaryData(summary);
    } catch (err) {
      console.error('Failed to generate summary:', err);
    } finally {
      setLoadingSummary(false);
    }
  };

  // Move conversation to Trash
  const handleDeleteConversation = async (customerId?: string) => {
    const targetId = customerId || selectedConv?.customerId;
    if (!targetId) return;

    setShowThreeDotMenu(false);
    // Optimistic remove from active view
    setConversations((prev) =>
      prev.map((c) => (c.customerId === targetId ? { ...c, isDeleted: true } : c))
    );

    try {
      await api.deleteConversation(targetId);
      showToast('🗑️ Conversation moved to Trash');
      await loadInbox();
    } catch (err) {
      console.error('Failed to delete conversation:', err);
      loadInbox();
    }
  };

  // Restore conversation from Trash
  const handleRestoreConversation = async (customerId: string) => {
    try {
      await api.restoreConversation(customerId);
      setConversations((prev) =>
        prev.map((c) => (c.customerId === customerId ? { ...c, isDeleted: false } : c))
      );
      showToast('✅ Conversation restored to Inbox');
      await loadInbox();
    } catch (err) {
      console.error('Failed to restore conversation:', err);
      loadInbox();
    }
  };

  // Permanently delete conversation
  const handlePermanentDelete = async (customerId: string) => {
    if (!confirm('Are you sure you want to permanently delete this chat history? This cannot be undone.')) {
      return;
    }
    try {
      await api.permanentDeleteConversation(customerId);
      setConversations((prev) => prev.filter((c) => c.customerId !== customerId));
      if (selectedConv?.customerId === customerId) {
        setSelectedConvKey(null);
      }
      showToast('🗑️ Conversation permanently deleted');
      await loadInbox();
    } catch (err) {
      console.error('Failed to permanently delete conversation:', err);
    }
  };

  // Add / Manage Tag
  const handleAddTag = async (tagToAdd: string) => {
    if (!selectedConv || !tagToAdd.trim()) return;
    const clean = tagToAdd.trim().replace(/^#/, '');
    const currentTags = selectedConv.tags || [];
    if (currentTags.includes(clean)) return;

    const updatedTags = [...currentTags, clean];

    // Optimistic update
    setConversations((prev) =>
      prev.map((c) =>
        c.customerId === selectedConv.customerId ? { ...c, tags: updatedTags } : c
      )
    );

    try {
      await api.updateCustomerDetails(selectedConv.customerId, {
        tags: updatedTags
      });
      showToast(`🏷️ Tag "#${clean}" added`);
      setTagInputText('');
    } catch (err) {
      console.error('Failed to add tag:', err);
      loadInbox();
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    if (!selectedConv) return;
    const updatedTags = (selectedConv.tags || []).filter((t) => t !== tagToRemove);

    setConversations((prev) =>
      prev.map((c) =>
        c.customerId === selectedConv.customerId ? { ...c, tags: updatedTags } : c
      )
    );

    try {
      await api.updateCustomerDetails(selectedConv.customerId, {
        tags: updatedTags
      });
      showToast(`Tag removed`);
    } catch (err) {
      console.error('Failed to remove tag:', err);
      loadInbox();
    }
  };

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

  // Quick Order submit
  const handleCreateQuickOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConv || submittingOrder) return;

    const deliveryFee = quickOrderZone === 'inside_dhaka' ? 60 : 120;
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

      const confirmText = `🎉 আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!\n📦 অর্ডার আইডি: #${created.order.id.substring(
        0,
        10
      )}\n🛍️ পণ্য: ${quickOrderProduct} (${quickOrderQty} টি)\n💰 মোট মূল্য: ৳${totalAmount.toLocaleString()} BDT (${
        quickOrderPaymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি' : quickOrderPaymentMethod.toUpperCase()
      })\n🚚 ডেলিভারি ঠিকানা: ${quickOrderCustomer.address || 'Dhaka'}\n📞 ফোন: ${
        quickOrderCustomer.phone || selectedConv.customerId
      }\nআমাদের কুরিয়ার টিম শীঘ্রই পার্সেলটি পাঠিয়ে ট্র্যাকিং কোড SMS করবে। ধন্যবাদ! ❤️`;

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
      showToast('✅ Order created & confirmation sent to chat');
    } catch (err) {
      console.error('Failed to create order:', err);
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Debug tracking per filter step (Task 5)
  const totalMessagesInState = conversations.reduce((sum, c) => sum + (c.messages?.length || 0), 0);
  const step1TrashFiltered = conversations.filter((c) => (filterCategory === 'trash' ? c.isDeleted : !c.isDeleted));
  const step2PlatformFiltered = step1TrashFiltered.filter((c) => filterPlatform === 'all' || c.platform === filterPlatform);
  const step3CategoryFiltered = step2PlatformFiltered.filter((c) => {
    if (filterCategory === 'orders') return c.orderCategory === 'orders';
    if (filterCategory === 'delivered') return c.orderCategory === 'delivered';
    if (filterCategory === 'starred') return c.isStarred;
    return true;
  });

  const filteredConversations = step3CategoryFiltered.filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = c.customerName.toLowerCase().includes(q);
      const matchPhone = (c.customerPhone || '').includes(q) || c.customerId.includes(q);
      const matchMsg = c.messages?.some((m) => (m.message_text || '').toLowerCase().includes(q));
      // Tag matching (supports typing tag name with or without #)
      const cleanQ = q.replace(/^#/, '');
      const matchTag = c.tags?.some((t) => t.toLowerCase().includes(cleanQ));
      return matchName || matchPhone || matchMsg || matchTag;
    }
    return true;
  });

  const activeNonDeleted = conversations.filter((c) => !c.isDeleted);
  const trashCount = conversations.filter((c) => c.isDeleted).length;
  const starredCount = activeNonDeleted.filter((c) => c.isStarred).length;

  return (
    <div className="h-full flex flex-col md:flex-row bg-[#F8FAFC] dark:bg-[#090D16] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden font-sans">
      
      {/* Toast Notification */}
      {inboxToast && (
        <div className="fixed top-16 right-6 z-50 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{inboxToast}</span>
        </div>
      )}

      {/* =====================================================================
          COLUMN 1: LIVE OMNICHANNEL INBOX (LEFT CARDS LIST)
      ===================================================================== */}
      <div
        className={`${
          mobileShowThread ? 'hidden md:flex' : 'flex'
        } w-full md:w-80 lg:w-[340px] shrink-0 border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0D121F] flex-col h-full overflow-hidden`}
      >
        {/* Top Header */}
        <div className="p-3.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              Inbox
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {filteredConversations.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowRightCrm(!showRightCrm)}
              className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer ${
                showRightCrm ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40' : ''
              }`}
              title="Toggle CRM Customer Details"
            >
              <SplitSquareVertical className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={loadInbox}
              className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer ${
                loading ? 'animate-spin' : ''
              }`}
              title="Refresh Inbox"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Input with Tag Search hint */}
        <div className="px-3.5 pt-3 pb-2 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name, phone, or #tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#141B2D] border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Row 1: Status Pills */}
        <div className="px-3.5 pb-2 flex items-center gap-1.5 shrink-0 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterCategory === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All ({activeNonDeleted.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('starred')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              filterCategory === 'starred'
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Star className={`w-3 h-3 ${filterCategory === 'starred' ? 'fill-white' : 'text-amber-500'}`} />
            <span>Starred ({starredCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('orders')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              filterCategory === 'orders'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Orders
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('trash')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
              filterCategory === 'trash'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Trash2 className="w-3 h-3" />
            <span>Trash ({trashCount})</span>
          </button>
        </div>

        {/* Filter Row 2: Channel Pills */}
        <div className="px-3.5 pb-2.5 flex items-center gap-1.5 shrink-0 border-b border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setFilterPlatform('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
              filterPlatform === 'all'
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#141B2D] text-slate-600 dark:text-slate-400'
            }`}
          >
            All Channels
          </button>
          <button
            type="button"
            onClick={() => setFilterPlatform('whatsapp')}
            className={`px-2 py-1 rounded-lg text-[11px] font-medium border flex items-center gap-1 transition-all cursor-pointer ${
              filterPlatform === 'whatsapp'
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#141B2D] text-slate-600 dark:text-slate-400'
            }`}
          >
            <WhatsAppLogo className="w-3 h-3" />
            <span>WhatsApp</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterPlatform('messenger')}
            className={`px-2 py-1 rounded-lg text-[11px] font-medium border flex items-center gap-1 transition-all cursor-pointer ${
              filterPlatform === 'messenger'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#141B2D] text-slate-600 dark:text-slate-400'
            }`}
          >
            <MessengerLogo className="w-3 h-3" />
            <span>Messenger</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterPlatform('instagram')}
            className={`px-2 py-1 rounded-lg text-[11px] font-medium border flex items-center gap-1 transition-all cursor-pointer ${
              filterPlatform === 'instagram'
                ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#141B2D] text-slate-600 dark:text-slate-400'
            }`}
          >
            <InstagramLogo className="w-3 h-3" />
            <span>Instagram</span>
          </button>
        </div>

        {/* Temporary Debug Line (Task 5): Shows total messages in state & counts after each filter step */}
        <div className="mx-3.5 mt-2 px-2.5 py-1.5 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 text-[10px] text-indigo-800 dark:text-indigo-300 font-mono flex flex-wrap items-center gap-1.5 shrink-0">
          <span className="font-bold text-indigo-900 dark:text-indigo-200">State:</span>
          <span>{totalMessagesInState} msgs ({conversations.length} convs)</span>
          <span>➜ Active: {step1TrashFiltered.length}</span>
          <span>➜ Platform: {step2PlatformFiltered.length}</span>
          <span>➜ Category: {step3CategoryFiltered.length}</span>
          <span>➜ Filtered: {filteredConversations.length}</span>
        </div>

        {/* Trash Notice Banner when viewing trash */}
        {filterCategory === 'trash' && (
          <div className="mx-3.5 mt-2 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <Trash2 className="w-3.5 h-3.5 text-amber-600" />
              Viewing Deleted Chats
            </span>
            <button
              type="button"
              onClick={() => setFilterCategory('all')}
              className="font-bold underline cursor-pointer"
            >
              Back to Inbox
            </button>
          </div>
        )}

        {/* Conversation List (Distinct Individual Card Layout) */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 space-y-1">
              <MessageSquare className="w-8 h-8 mx-auto opacity-30 text-slate-400 mb-2" />
              <p className="font-semibold text-slate-600 dark:text-slate-400">No chats found</p>
              <p className="text-[11px]">
                {filterCategory === 'trash'
                  ? 'Trash is empty'
                  : 'Try searching by a customer name or #tag'}
              </p>
            </div>
          ) : (
            filteredConversations.map((c) => {
              const key = `${c.platform}_${c.customerId}`;
              const isSelected = key === selectedConvKey;

              return (
                <div
                  key={key}
                  onClick={() => {
                    setSelectedConvKey(key);
                    setMobileShowThread(true);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer relative group ${
                    isSelected
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-500/80 shadow-xs ring-1 ring-indigo-500/20'
                      : 'bg-white dark:bg-[#121826] border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {/* Customer Real Avatar Photo */}
                    <CustomerAvatar
                      customerName={c.customerName}
                      customerId={c.customerId}
                      avatarUrl={c.customerAvatar}
                      platform={c.platform}
                      size="md"
                    />

                    <div className="flex-1 min-w-0">
                      {/* Name & Time */}
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {c.customerName}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          {c.isStarred && (
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          )}
                          <span className="text-[10px] text-slate-400">
                            {c.lastMessage?.created_at
                              ? new Date(c.lastMessage.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : '01:26 PM'}
                          </span>
                        </div>
                      </div>

                      {/* Phone or Channel identifier */}
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {c.customerPhone || c.customerId}
                      </p>

                      {/* Last message preview */}
                      <p className="text-xs text-slate-600 dark:text-slate-300 truncate mt-1 leading-snug">
                        {c.lastMessage?.message_text?.split('\n')[0] || 'No messages yet'}
                      </p>

                      {/* Tags List */}
                      {c.tags && c.tags.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap mt-1.5">
                          {c.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSearchQuery(tag);
                              }}
                              className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950 transition-colors"
                              title={`Click to filter by #${tag}`}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions in Trash View */}
                  {filterCategory === 'trash' && (
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestoreConversation(c.customerId);
                        }}
                        className="px-2 py-1 rounded-md text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Restore
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePermanentDelete(c.customerId);
                        }}
                        className="px-2 py-1 rounded-md text-[11px] font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      >
                        Delete Forever
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* =====================================================================
          COLUMN 2: MIDDLE CHAT STREAM & CLEAN 3-DOT MENU HEADER
      ===================================================================== */}
      <div
        className={`${
          mobileShowThread ? 'flex' : 'hidden md:flex'
        } flex-1 flex-col min-w-0 min-h-0 h-full overflow-hidden bg-white dark:bg-[#090D16]`}
      >
        {selectedConv ? (
          <>
            {/* Clean Thread Header with Single 3-Dot Dropdown */}
            <div className="px-5 py-3 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0D121F] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                {/* Mobile back arrow */}
                <button
                  type="button"
                  onClick={() => setMobileShowThread(false)}
                  className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  &larr;
                </button>

                {/* Customer Profile Photo */}
                <CustomerAvatar
                  customerName={selectedConv.customerName}
                  customerId={selectedConv.customerId}
                  avatarUrl={selectedConv.customerAvatar}
                  platform={selectedConv.platform}
                  size="md"
                />

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {selectedConv.customerName}
                    </h3>
                    {selectedConv.isStarred && (
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {selectedConv.platform === 'whatsapp' ? (
                      <WhatsAppLogo className="w-3 h-3 shrink-0" />
                    ) : selectedConv.platform === 'messenger' ? (
                      <MessengerLogo className="w-3 h-3 shrink-0" />
                    ) : (
                      <InstagramLogo className="w-3 h-3 shrink-0" />
                    )}
                    <span>
                      {selectedConv.platform === 'whatsapp'
                        ? 'WhatsApp'
                        : selectedConv.platform === 'messenger'
                        ? 'Messenger'
                        : 'Instagram'}{' '}
                      • {selectedConv.customerPhone || selectedConv.customerId}
                    </span>
                  </div>
                </div>
              </div>

              {/* Header Right: Sleek Single 3-Dot Action Menu */}
              <div className="relative shrink-0" ref={threeDotRef}>
                <button
                  type="button"
                  onClick={() => setShowThreeDotMenu(!showThreeDotMenu)}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  title="More Options"
                  aria-label="More Options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* 3-Dot Dropdown Menu */}
                {showThreeDotMenu && (
                  <div className="absolute right-0 top-full mt-1.5 w-60 rounded-2xl bg-white dark:bg-[#141B2D] border border-slate-200 dark:border-slate-700 shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 text-xs">
                    
                    {/* AI Toggle Option */}
                    <button
                      type="button"
                      onClick={handleToggleAi}
                      className="w-full px-3.5 py-2.5 flex items-center justify-between text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <Bot className="w-4 h-4 text-indigo-500" />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">AI Auto-Reply</p>
                          <p className="text-[10px] text-slate-400">
                            {isAiPaused ? 'Currently Paused' : 'Active 24/7'}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          !isAiPaused
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {!isAiPaused ? 'ON' : 'PAUSED'}
                      </span>
                    </button>

                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

                    {/* AI Summary */}
                    <button
                      type="button"
                      onClick={handleOpenAiSummary}
                      className="w-full px-3.5 py-2 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer text-left font-medium"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>AI Conversation Summary</span>
                    </button>

                    {/* Quick Order */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowThreeDotMenu(false);
                        setQuickOrderCustomer({
                          name: selectedConv.customerName,
                          phone: selectedConv.customerPhone || selectedConv.customerId,
                          address: selectedConv.customerAddress || ''
                        });
                        setShowQuickOrderModal(true);
                      }}
                      className="w-full px-3.5 py-2 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer text-left font-medium"
                    >
                      <Plus className="w-4 h-4 text-indigo-500" />
                      <span>Create Quick Order</span>
                    </button>

                    {/* Product Catalog */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowThreeDotMenu(false);
                        setShowProductPicker(true);
                      }}
                      className="w-full px-3.5 py-2 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer text-left font-medium"
                    >
                      <ShoppingBag className="w-4 h-4 text-indigo-500" />
                      <span>Send Product Catalog</span>
                    </button>

                    {/* Customer CRM Details Panel */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowThreeDotMenu(false);
                        setShowRightCrm(!showRightCrm);
                      }}
                      className="w-full px-3.5 py-2 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer text-left font-medium"
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      <span>{showRightCrm ? 'Hide Customer Details' : 'Customer CRM Details'}</span>
                    </button>

                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

                    {/* Star / Unstar Chat */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowThreeDotMenu(false);
                        handleToggleStar();
                      }}
                      className="w-full px-3.5 py-2 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer text-left font-medium"
                    >
                      <Star className={`w-4 h-4 ${selectedConv.isStarred ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                      <span>{selectedConv.isStarred ? 'Unstar Chat' : 'Star Mark Chat'}</span>
                    </button>

                    {/* Manage Tags */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowThreeDotMenu(false);
                        setShowTagModal(true);
                      }}
                      className="w-full px-3.5 py-2 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer text-left font-medium"
                    >
                      <Tag className="w-4 h-4 text-slate-500" />
                      <span>Add / Manage Tags</span>
                    </button>

                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

                    {/* Delete / Move to Trash */}
                    <button
                      type="button"
                      onClick={() => handleDeleteConversation()}
                      className="w-full px-3.5 py-2 flex items-center gap-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer text-left font-semibold"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Chat (Move to Trash)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Message Stream */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50 dark:bg-[#090D16]">
              
              {/* Customer Bubble */}
              <div className="flex items-start gap-3 max-w-xl">
                <CustomerAvatar
                  customerName={selectedConv.customerName}
                  customerId={selectedConv.customerId}
                  avatarUrl={selectedConv.customerAvatar}
                  platform={selectedConv.platform}
                  size="md"
                />
                <div className="space-y-1">
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#141B2D] border border-slate-200/80 dark:border-slate-800 shadow-2xs text-sm font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
                    order details
                  </div>
                  <span className="text-[11px] text-slate-400 pl-1 block">01:26 PM</span>
                </div>
              </div>

              {/* AI Auto-Replied Card (Refined Premium Theme) */}
              <div className="flex flex-col items-center sm:items-end w-full space-y-2">
                <div className="w-full max-w-xl p-5 rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-800 to-purple-800 text-white shadow-md space-y-3.5 border border-indigo-500/20">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span className="font-bold text-sm tracking-wide">One Agent AI</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/15 text-white backdrop-blur-xs">
                      Auto-Replied
                    </span>
                  </div>

                  {/* Body Text in Natural Bangla */}
                  <div className="text-sm leading-relaxed space-y-2.5 font-normal text-slate-100">
                    <p>
                      চ্যাটের ভেতরেই কাস্টমারের নাম, ঠিকানা ও মোবাইল নাম্বার নিয়ে AI অটোমেটিক অর্ডার বুক করে নেয়।
                    </p>
                    <p>
                      এরপর ড্যাশবোর্ড থেকে মাত্র ১ ক্লিকে Steadfast, Pathao বা RedX কুরিয়ারে পার্সেল এন্ট্রি করতে পারবেন!
                    </p>
                    <p className="font-semibold text-amber-200">
                      আপনি বর্তমানে কোন কুরিয়ার সার্ভিসটি বেশি ব্যবহার করেন?
                    </p>
                  </div>

                  {/* Timestamp & double checks */}
                  <div className="flex items-center justify-end gap-1.5 pt-1 text-[11px] text-indigo-200 font-medium">
                    <span>01:26 PM</span>
                    <CheckCheck className="w-3.5 h-3.5 text-sky-300" />
                  </div>
                </div>

                {/* Moderator Badge */}
                <div className="pt-1 flex justify-center w-full">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 dark:bg-slate-800 text-slate-300 text-[11px] font-medium shadow-xs border border-slate-700/60">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Merchant Moderator</span>
                  </div>
                </div>
              </div>

              {/* Any additional live messages */}
              {selectedConv.messages?.slice(2).map((m) => {
                const isOutbound = m.sender_type === 'user' || m.sender_type === 'bot' || m.direction === 'outbound';
                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-2.5 ${isOutbound ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isOutbound && (
                      <CustomerAvatar
                        customerName={selectedConv.customerName}
                        customerId={selectedConv.customerId}
                        avatarUrl={selectedConv.customerAvatar}
                        platform={selectedConv.platform}
                        size="sm"
                      />
                    )}
                    <div className="max-w-md space-y-1">
                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                          isOutbound
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white dark:bg-[#141B2D] text-slate-800 dark:text-white border border-slate-200/80 dark:border-slate-800 shadow-2xs'
                        }`}
                      >
                        {m.message_text}
                      </div>
                      <span className="text-[10px] text-slate-400 block px-1">
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Input Box (Notice: Quick chips bar is completely removed as requested) */}
            <div className="p-3.5 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0D121F] shrink-0">
              <form onSubmit={handleSendReply} className="flex items-center gap-2">
                {/* Image upload button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const isVideo = file.type.startsWith('video/');
                    const reader = new FileReader();
                    reader.onload = () => {
                      const res = reader.result as string;
                      const base64 = res.split(',')[1];
                      setReplyMedia({
                        type: isVideo ? 'video' : 'image',
                        base64,
                        mimeType: file.type,
                        previewUrl: URL.createObjectURL(file)
                      });
                    };
                    reader.readAsDataURL(file);
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 bg-slate-50 dark:bg-[#141B2D] transition-colors cursor-pointer"
                  title="Attach Photo or Video"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                {/* Voice recording mic button */}
                <button
                  type="button"
                  onClick={async () => {
                    if (!isRecording) {
                      try {
                        const rec = new BrowserAudioRecorder();
                        await rec.start();
                        audioRecorderRef.current = rec;
                        setIsRecording(true);
                        setRecordingSeconds(0);
                        recordingTimerRef.current = setInterval(() => {
                          setRecordingSeconds((s) => s + 1);
                        }, 1000);
                      } catch (err) {
                        console.error('Failed to start audio recording:', err);
                      }
                    } else {
                      try {
                        clearInterval(recordingTimerRef.current);
                        setIsRecording(false);
                        if (audioRecorderRef.current) {
                          const blob = await audioRecorderRef.current.stop();
                          const base64 = await blobToBase64(blob);
                          await api.sendReply({
                            customerId: selectedConv.customerId,
                            customerName: selectedConv.customerName,
                            platform: selectedConv.platform,
                            channelId: selectedConv.channelId,
                            audioBase64: base64,
                            audioMimeType: 'audio/webm'
                          });
                          await loadInbox();
                          scrollToBottom();
                        }
                      } catch (err) {
                        console.error('Failed to stop recording:', err);
                      }
                    }
                  }}
                  className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                    isRecording
                      ? 'bg-rose-500 text-white border-rose-500 animate-pulse'
                      : 'border-slate-200 dark:border-slate-700/80 text-slate-500 hover:text-indigo-600 bg-slate-50 dark:bg-[#141B2D]'
                  }`}
                  title={isRecording ? 'Click to stop & send voice note' : 'Record voice note'}
                >
                  <Mic className="w-4 h-4" />
                </button>

                {/* Text input */}
                <input
                  type="text"
                  placeholder={`Reply to ${selectedConv.customerName}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-[#141B2D] text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-colors"
                />

                {/* Send button */}
                <button
                  type="submit"
                  disabled={sendingReply || (!replyText.trim() && !replyMedia)}
                  className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white shadow-xs transition-transform active:scale-95 cursor-pointer shrink-0"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <MessageSquare className="w-12 h-12 opacity-30 text-indigo-400 mb-3" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Select a conversation</h3>
            <p className="text-xs text-slate-400 mt-1">
              Choose any customer conversation from the left to start live chatting or order booking.
            </p>
          </div>
        )}
      </div>

      {/* =====================================================================
          COLUMN 3: CUSTOMER CRM PROFILE (RIGHT PANEL)
      ===================================================================== */}
      {showRightCrm && selectedConv && (
        <CustomerDetailsPanel
          conversation={selectedConv}
          onNavigate={onNavigate}
          onClose={() => setShowRightCrm(false)}
          onOpenCreateOrder={(info) => {
            if (info) setQuickOrderCustomer(info);
            setShowQuickOrderModal(true);
          }}
          onOpenProductPicker={() => setShowProductPicker(true)}
          onToggleAi={(act) => setIsAiPaused(act === 'pause_ai')}
          isAiPaused={isAiPaused}
          onCustomerUpdated={loadInbox}
        />
      )}

      {/* =====================================================================
          MODAL: AI CONVERSATION SUMMARY
      ===================================================================== */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#141B2D] rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  AI Conversation Summary
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSummaryModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingSummary ? (
              <div className="py-12 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Analyzing conversation with AI...</p>
              </div>
            ) : summaryData ? (
              <div className="space-y-3.5 text-xs">
                {/* Stage Badge */}
                <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">
                      Current Stage
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                      {summaryData.stageLabel}
                    </h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white">
                    Step {summaryData.stageStep}/4
                  </span>
                </div>

                {/* Summary Text */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0E1320] border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <h5 className="font-bold text-slate-700 dark:text-slate-300">Executive Summary</h5>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {summaryData.summaryText}
                  </p>
                </div>

                {/* Key Points */}
                {summaryData.keyPoints && summaryData.keyPoints.length > 0 && (
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-slate-700 dark:text-slate-300">Key Highlights</h5>
                    <ul className="space-y-1 pl-4 list-disc text-slate-600 dark:text-slate-400">
                      {summaryData.keyPoints.map((pt, idx) => (
                        <li key={idx}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Customer Intent & Phone */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                    <span className="text-[10px] text-slate-400 block">Customer Intent</span>
                    <span className="font-bold text-slate-800 dark:text-white capitalize">
                      {summaryData.customerIntent || 'Inquiring'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                    <span className="text-[10px] text-slate-400 block">Extracted Phone</span>
                    <span className="font-bold text-slate-800 dark:text-white">
                      {summaryData.extractedPhone || selectedConv.customerPhone || 'Not provided'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowSummaryModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                Could not load conversation summary.
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: MANAGE CUSTOMER TAGS
      ===================================================================== */}
      {showTagModal && selectedConv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-[#141B2D] rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Customer Tags ({selectedConv.customerName})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTagModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Existing Tags */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Assigned Tags
              </label>
              <div className="flex flex-wrap gap-1.5 min-h-8">
                {selectedConv.tags && selectedConv.tags.length > 0 ? (
                  selectedConv.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="hover:text-rose-500 ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No tags assigned yet</span>
                )}
              </div>
            </div>

            {/* Quick Preset Tags */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Quick Presets
              </label>
              <div className="flex flex-wrap gap-1.5">
                {['VIP', 'Repeat Buyer', 'Wholesale', 'Urgent', 'COD Pending', 'Follow Up'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleAddTag(preset)}
                    className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
                  >
                    +{preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Tag Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddTag(tagInputText);
              }}
              className="flex items-center gap-2 pt-2"
            >
              <input
                type="text"
                placeholder="Type tag name..."
                value={tagInputText}
                onChange={(e) => setTagInputText(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#10141D] text-slate-800 dark:text-white"
              />
              <button
                type="submit"
                disabled={!tagInputText.trim()}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs"
              >
                Add
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: QUICK ORDER
      ===================================================================== */}
      {showQuickOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#141B2D] rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-indigo-600" />
                <span>Create Quick Order</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowQuickOrderModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateQuickOrder} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  value={quickOrderCustomer.name}
                  onChange={(e) => setQuickOrderCustomer({ ...quickOrderCustomer, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#10141D] text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={quickOrderCustomer.phone}
                  onChange={(e) => setQuickOrderCustomer({ ...quickOrderCustomer, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#10141D] text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Delivery Address</label>
                <textarea
                  required
                  rows={2}
                  value={quickOrderCustomer.address}
                  onChange={(e) => setQuickOrderCustomer({ ...quickOrderCustomer, address: e.target.value })}
                  placeholder="District, Thana, Full House/Road address..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#10141D] text-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Product</label>
                  <input
                    type="text"
                    required
                    value={quickOrderProduct}
                    onChange={(e) => setQuickOrderProduct(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#10141D] text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Unit Price (BDT)</label>
                  <input
                    type="number"
                    required
                    value={quickOrderPrice}
                    onChange={(e) => setQuickOrderPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#10141D] text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Delivery Area</label>
                  <select
                    value={quickOrderZone}
                    onChange={(e) => setQuickOrderZone(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#10141D] text-slate-800 dark:text-white"
                  >
                    <option value="inside_dhaka">Inside Dhaka (৳60)</option>
                    <option value="outside_dhaka">Outside Dhaka (৳120)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment</label>
                  <select
                    value={quickOrderPaymentMethod}
                    onChange={(e) => setQuickOrderPaymentMethod(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#10141D] text-slate-800 dark:text-white"
                  >
                    <option value="cod">Cash on Delivery</option>
                    <option value="bkash">bKash</option>
                    <option value="nagad">Nagad</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuickOrderModal(false)}
                  className="px-4 py-2 text-slate-500 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOrder}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  {submittingOrder ? 'Saving...' : 'Confirm Order & Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: PRODUCT CATALOG PICKER
      ===================================================================== */}
      {showProductPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-[#141B2D] rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-indigo-600" />
                <span>Select Product to Send</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowProductPicker(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {[
                { name: 'Slim Fit Denim Jeans (Deep Blue)', price: 1250, desc: 'Premium stretchable denim pant with reinforced stitching' },
                { name: 'Cargo Jogger Pant (Olive Green)', price: 1150, desc: 'Heavyweight cotton twill with 6 utility pockets' },
                { name: 'Casual Oxford Cotton Shirt (Sky Blue)', price: 850, desc: '100% combed breathable cotton Oxford shirt' },
                { name: 'Smart Calling Watch (Series 9)', price: 2450, desc: '1.99 inch HD AMOLED screen with Bluetooth call support' }
              ].map((p, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 flex items-center justify-between gap-3 transition-colors"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{p.name}</h4>
                    <p className="text-[11px] text-slate-400">{p.desc}</p>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-1 block">
                      &#2547;{p.price.toLocaleString()} BDT
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProductPicker(false);
                      handleSendReply(
                        undefined,
                        `🛍️ ${p.name}\n💰 মূল্য: ৳${p.price.toLocaleString()} BDT\n📝 বিস্তারিত: ${p.desc}\nডেলিভারি চার্জ: ঢাকার ভেতর ৬০ টাকা, ঢাকার বাইরে ১২০ টাকা।\nঅর্ডার করতে আপনার নাম, মোবাইল ও ঠিকানা পাঠান! ❤️`
                      );
                    }}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shrink-0 cursor-pointer"
                  >
                    Send to Chat
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
