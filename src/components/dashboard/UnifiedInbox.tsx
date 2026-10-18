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
  UploadCloud,
  ShoppingBag,
  CheckCircle2,
  Image as ImageIcon,
  Package,
  Copy,
  Check,
  PanelRightClose,
  PanelRightOpen,
  PanelLeftClose,
  PanelLeftOpen,
  Phone,
  Clock,
  CheckCheck,
  Zap,
  ShieldCheck,
  ArrowUpRight,
  FileText,
  X,
  Video,
  Trash2,
  PauseCircle,
  PlayCircle,
  Ban,
  MoreHorizontal,
  AlertCircle,
  PanelRight,
  Star,
  Filter,
  Plus,
  Truck,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MapPin,
  Tag
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

type CategoryTab = 'all' | 'orders' | 'delivered' | 'new_customer';

// Official Authentic Brand Vector Logos
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
      <linearGradient id="inboxMsngrGrad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#0078FF" />
        <stop offset="50%" stopColor="#A033FF" />
        <stop offset="100%" stopColor="#FF5280" />
      </linearGradient>
    </defs>
    <path
      d="M24 4C12.95 4 4 12.4 4 22.8C4 28.7 6.8 33.9 11.2 37.2V44L17.7 40.4C19.7 41 21.8 41.3 24 41.3C35.05 41.3 44 32.9 44 22.5C44 12.4 35.05 4 24 4Z"
      fill="url(#inboxMsngrGrad)"
    />
    <path
      d="M13.5 27.5L21.5 19L25.8 23.5L34.5 19L26.5 27.5L22.2 23L13.5 27.5Z"
      fill="white"
    />
  </svg>
);

export const FacebookLogo: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="22" fill="#1877F2" />
    <path
      d="M27.5 24.5L28.2 19.8H23.8V16.8C23.8 15.5 24.4 14.3 26.4 14.3H28.4V10.4C27.3 10.2 26.2 10.1 25.1 10.1C21.8 10.1 19.6 12.1 19.6 15.8V19.8H15.6V24.5H19.6V35.7H23.8V24.5H27.5Z"
      fill="white"
    />
  </svg>
);

export const InstagramLogo: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none">
    <defs>
      <radialGradient id="inboxIgLogoGrad" cx="0.2" cy="1" r="1">
        <stop offset="0%" stopColor="#FFDD55" />
        <stop offset="30%" stopColor="#FF543E" />
        <stop offset="60%" stopColor="#C837AB" />
        <stop offset="100%" stopColor="#4158D0" />
      </radialGradient>
    </defs>
    <rect width="44" height="44" x="2" y="2" rx="13" fill="url(#inboxIgLogoGrad)" />
    <rect x="11.5" y="11.5" width="25" height="25" rx="7.5" stroke="white" strokeWidth="2.8" fill="none" />
    <circle cx="24" cy="24" r="5.8" stroke="white" strokeWidth="2.8" fill="none" />
    <circle cx="31.2" cy="16.8" r="1.6" fill="white" />
  </svg>
);

// High-fidelity customer avatar with profile image fallback & authentic platform badge
interface CustomerAvatarProps {
  customerName: string;
  customerAvatar?: string;
  platform: 'whatsapp' | 'messenger' | 'instagram' | string;
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  isSelected?: boolean;
}

const CustomerAvatar: React.FC<CustomerAvatarProps> = ({
  customerName,
  customerAvatar,
  platform,
  size = 'md',
  showBadge = true,
  isSelected = false
}) => {
  const [imgError, setImgError] = useState(false);

  const getGradientByName = (name: string) => {
    const charCode = (name || 'A').charCodeAt(0) || 65;
    const gradients = [
      'from-purple-600 to-indigo-600 text-white',
      'from-blue-600 to-cyan-600 text-white',
      'from-emerald-600 to-teal-600 text-white',
      'from-rose-600 to-pink-600 text-white',
      'from-amber-600 to-orange-600 text-white',
      'from-violet-600 to-fuchsia-600 text-white'
    ];
    return gradients[charCode % gradients.length];
  };

  const sizeClasses = {
    sm: 'w-7 h-7 text-[10px] rounded-lg',
    md: 'w-10 h-10 text-xs rounded-xl',
    lg: 'w-9 sm:w-10 h-9 sm:h-10 text-xs sm:text-sm rounded-xl'
  }[size];

  const badgeSize = {
    sm: 'w-3.5 h-3.5 -bottom-1 -right-1',
    md: 'w-4 h-4 -bottom-1 -right-1',
    lg: 'w-4.5 h-4.5 -bottom-0.5 -right-0.5'
  }[size];

  const badgeIconSize = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  }[size];

  const renderBadgeLogo = () => {
    if (platform === 'whatsapp') return <WhatsAppLogo className={badgeIconSize} />;
    if (platform === 'messenger') return <MessengerLogo className={badgeIconSize} />;
    if (platform === 'instagram') return <InstagramLogo className={badgeIconSize} />;
    return <FacebookLogo className={badgeIconSize} />;
  };

  const displayAvatar =
    customerAvatar ||
    (customerName && !customerName.startsWith('Messenger User') && !customerName.startsWith('Instagram User')
      ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(customerName)}&backgroundColor=7c3aed,2563eb,059669,d97706,e11d48`
      : undefined);

  return (
    <div className="relative shrink-0 select-none">
      <div
        className={`${sizeClasses} overflow-hidden flex items-center justify-center font-extrabold shadow-2xs border border-black/5 dark:border-white/10 ${
          isSelected ? 'ring-2 ring-[#7F22FE] shadow-sm' : ''
        }`}
      >
        {displayAvatar && !imgError ? (
          <img
            src={displayAvatar}
            alt={customerName}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${getGradientByName(
              customerName || 'Customer'
            )}`}
          >
            {(customerName || 'C').charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {showBadge && (
        <span
          className={`absolute ${badgeSize} rounded-full bg-white dark:bg-neutral-900 shadow-sm ring-1.5 ring-white dark:ring-neutral-900 flex items-center justify-center overflow-hidden`}
        >
          {renderBadgeLogo()}
        </span>
      )}
    </div>
  );
};

// WhatsApp / Telegram Style Waveform Voice Player
const VoiceWaveformPlayer: React.FC<{
  audioSrc: string;
  isOutbound: boolean;
}> = ({ audioSrc, isOutbound }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState<1 | 1.5 | 2>(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const cycleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextSpeed = speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1;
    setSpeed(nextSpeed);
    if (audioRef.current) audioRef.current.playbackRate = nextSpeed;
  };

  const formatSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      className={`flex items-center gap-2.5 p-2 rounded-xl my-1.5 max-w-xs ${
        isOutbound
          ? 'bg-black/20 text-white border border-white/10'
          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700'
      }`}
    >
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(audioRef.current.duration || 0);
        }}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
      <button
        type="button"
        onClick={togglePlay}
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs cursor-pointer ${
          isOutbound ? 'bg-white text-[#7F22FE]' : 'bg-[#7F22FE] text-white'
        }`}
      >
        {isPlaying ? <PauseCircle className="w-4 h-4 fill-current" /> : <PlayCircle className="w-4 h-4 fill-current ml-0.5" />}
      </button>

      {/* Waveform visual bars */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-0.5 h-5">
          {[40, 75, 55, 90, 60, 30, 80, 100, 70, 45, 85, 60, 35, 95, 50, 75, 40].map((h, i) => {
            const progressRatio = duration > 0 ? currentTime / duration : 0;
            const barRatio = i / 17;
            const isFilled = barRatio <= progressRatio;
            return (
              <span
                key={i}
                style={{ height: `${h}%` }}
                className={`w-1 rounded-full transition-colors ${
                  isFilled
                    ? isOutbound
                      ? 'bg-white'
                      : 'bg-[#7F22FE]'
                    : isOutbound
                    ? 'bg-white/40'
                    : 'bg-neutral-300 dark:bg-neutral-600'
                }`}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] opacity-75 font-mono">
          <span>{formatSec(currentTime)}</span>
          <span>{formatSec(duration || 0)}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={cycleSpeed}
        className="px-1.5 py-0.5 rounded text-[10px] font-black bg-black/10 dark:bg-white/10 hover:bg-black/20 cursor-pointer"
        title="Playback Speed"
      >
        {speed}x
      </button>
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
  const [filterPlatform, setFilterPlatform] = useState<'all' | 'whatsapp' | 'messenger' | 'instagram'>('all');
  const [selectedCategory, setSelectedCategory] = useState<CategoryTab>('all');
  const [categoryCounts, setCategoryCounts] = useState<{ all: number; orders: number; delivered: number; new_customer: number }>({
    all: 0,
    orders: 0,
    delivered: 0,
    new_customer: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingReply, setSendingReply] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const [showCustomerDetails, setShowCustomerDetails] = useState(true);
  const [starredConvs, setStarredConvs] = useState<Record<string, boolean>>({});

  const [inboxToast, setInboxToast] = useState<string | null>(null);

  // Products from inventory
  const [products, setProducts] = useState<Product[]>([]);
  const [showProductPickerModal, setShowProductPickerModal] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  // Quick Order Creator Modal state
  const [showQuickOrderModal, setShowQuickOrderModal] = useState(false);
  const [quickOrderCustomer, setQuickOrderCustomer] = useState<{ name: string; phone: string; address: string }>({
    name: '',
    phone: '',
    address: ''
  });
  const [quickOrderProduct, setQuickOrderProduct] = useState('');
  const [quickOrderQty, setQuickOrderQty] = useState(1);
  const [quickOrderPrice, setQuickOrderPrice] = useState(1000);
  const [quickOrderZone, setQuickOrderZone] = useState<'inside_dhaka' | 'outside_dhaka' | 'free'>('inside_dhaka');
  const [quickOrderPaymentMethod, setQuickOrderPaymentMethod] = useState<'cod' | 'bkash' | 'nagad'>('cod');
  const [quickOrderAdvance, setQuickOrderAdvance] = useState(0);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Direct Composer Media (Image / Video from device storage) & WhatsApp-style Voice state
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
  const [openInteractiveMsgId, setOpenInteractiveMsgId] = useState<string | null>(null);
  const [selectedInteractiveItem, setSelectedInteractiveItem] = useState<string>('');

  // Image preview modal
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Conversation Summarize state
  const [conversationSummary, setConversationSummary] = useState<ConversationSummaryResult | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [showSummaryPanel, setShowSummaryPanel] = useState(false);

  // Per-Customer AI Pause (Human Handover) & Spam Blacklist state
  const [pausedCustomers, setPausedCustomers] = useState<string[]>([]);
  const [blockedCustomers, setBlockedCustomers] = useState<string[]>([]);
  const [showHeaderActionsMenu, setShowHeaderActionsMenu] = useState(false);

  // Canned Responses
  const cannedTemplates = [
    {
      label: '📦 ডেলিভারি চার্জ',
      text: 'আমাদের ডেলিভারি চার্জ: ঢাকা সিটির ভিতরে ৬০ টাকা (২৪ ঘণ্টার মধ্যে ডেলিভারি) এবং ঢাকা সিটির বাইরে ১২০ টাকা (৪৮-৭২ ঘণ্টার মধ্যে ডেলিভারি)। ক্যাশ অন ডেলিভারি সুবিধা রয়েছে!'
    },
    {
      label: '💳 বিকাশ পেমেন্ট',
      text: 'বিকাশে পেমেন্ট করতে আমাদের মার্চেন্ট নম্বরে Payment অপশন সিলেক্ট করুন: 01700000000। পেমেন্ট শেষে ট্রানজেকশন আইডি বা স্ক্রিনশট পাঠিয়ে নিশ্চিত করুন।'
    },
    {
      label: '✅ অর্ডার কনফার্ম ফরম',
      text: 'অর্ডারটি কনফার্ম করতে অনুগ্রহ করে আপনার ১) পূর্ণ নাম, ২) ডেলিভারি ঠিকানা (থানা ও জেলা সহ), এবং ৩) সচল ফোন নম্বরটি লিখে পাঠান।'
    },
    {
      label: '🚚 কুরিয়ার ট্র্যাকিং',
      text: 'আপনার অর্ডারটি স্টিডফাস্ট কুরিয়ারে বুকিং সম্পন্ন হয়েছে! কুরিয়ার থেকে ট্র্যাকিং লিংক সম্বলিত SMS পেয়ে যাবেন।'
    },
    {
      label: '🕒 শপ টাইম',
      text: 'আমাদের কাস্টমার সাপোর্ট প্রতিদিন সকাল ৯টা থেকে রাত ১১টা পর্যন্ত সচল থাকে। যেকোনো তথ্যের জন্য সরাসরি মেসেজ দিন।'
    }
  ];

  useEffect(() => {
    api
      .getAutomationSettings()
      .then((res) => {
        if (res.settings) {
          setPausedCustomers(res.settings.paused_customers || []);
          setBlockedCustomers(res.settings.blocked_customers || []);
        }
      })
      .catch(() => {});

    api
      .getProducts()
      .then((res) => {
        if (res.products && res.products.length > 0) {
          setProducts(res.products);
          setQuickOrderProduct(res.products[0].name);
          setQuickOrderPrice(res.products[0].price);
        }
      })
      .catch(() => {});
  }, []);

  const handleToggleCustomerControl = async (
    customerId: string,
    action: 'pause_ai' | 'resume_ai' | 'block' | 'unblock'
  ) => {
    try {
      const res = await api.toggleCustomerControl(customerId, action);
      if (res.paused_customers) setPausedCustomers(res.paused_customers);
      if (res.blocked_customers) setBlockedCustomers(res.blocked_customers);
      setInboxToast(
        action === 'pause_ai'
          ? '⏸️ AI Auto-Reply paused for this customer (Human Handover Mode Active)'
          : action === 'resume_ai'
          ? '▶️ AI Auto-Reply resumed for this customer'
          : action === 'block'
          ? '🚫 Customer added to Fraud/Spam Blacklist'
          : '✅ Customer removed from Blacklist'
      );
      setTimeout(() => setInboxToast(null), 3500);
    } catch (err) {
      console.error('Customer control toggle failed:', err);
    }
  };

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
    // 3-second live background polling
    const livePollTimer = setInterval(() => {
      api
        .getInbox({
          category: selectedCategory !== 'all' ? selectedCategory : undefined
        })
        .then((res) => {
          setConversations(res.conversations);
          if (res.categoryCounts) {
            setCategoryCounts(res.categoryCounts);
          }
        })
        .catch(() => {});
    }, 3000);

    return () => clearInterval(livePollTimer);
  }, [selectedCategory]);

  const selectedConv = conversations.find(
    (c) => `${c.platform}_${c.customerId}` === selectedConvKey
  );

  useEffect(() => {
    if (initialConvKey) {
      setSelectedConvKey(initialConvKey);
      setMobileShowThread(true);
    }
  }, [initialConvKey]);

  useEffect(() => {
    if (conversations.length > 0 && !selectedConvKey) {
      setSelectedConvKey(`${conversations[0].platform}_${conversations[0].customerId}`);
    } else if (conversations.length > 0 && selectedConvKey) {
      const exists = conversations.some((c) => `${c.platform}_${c.customerId}` === selectedConvKey);
      if (!exists) {
        setSelectedConvKey(`${conversations[0].platform}_${conversations[0].customerId}`);
      }
    }
  }, [conversations, selectedConvKey]);

  useEffect(() => {
    setConversationSummary(null);
    setShowSummaryPanel(false);
    setReplyMedia(null);
    if (isReplyRecording && replyAudioRecorderRef.current) {
      clearInterval(replyRecordTimerRef.current);
      replyAudioRecorderRef.current.stop().catch(() => {});
      setIsReplyRecording(false);
      setReplyRecordingSeconds(0);
    }
  }, [selectedConvKey]);

  useEffect(() => {
    scrollToBottom(false);
  }, [selectedConvKey, selectedConv?.messages.length]);

  const handleSummarizeConversation = async () => {
    if (!selectedConv || summarizing) return;
    try {
      setShowSummaryPanel(true);
      setSummarizing(true);
      const res = await api.summarizeConversation({
        customerId: selectedConv.customerId,
        customerName: selectedConv.customerName,
        platform: selectedConv.platform,
        channelId: selectedConv.channelId
      });
      setConversationSummary(res);
    } catch (err: any) {
      console.error('Failed to summarize conversation:', err);
      setInboxToast(err?.message || 'Could not generate conversation summary.');
      setTimeout(() => setInboxToast(null), 3500);
    } finally {
      setSummarizing(false);
    }
  };

  const loadInbox = async () => {
    try {
      setLoading(true);
      const res = await api.getInbox({
        category: selectedCategory !== 'all' ? selectedCategory : undefined
      });
      setConversations(res.conversations);
      if (res.categoryCounts) {
        setCategoryCounts(res.categoryCounts);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCustomerId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 1800);
  };

  const handleClearConversation = (customerId: string) => {
    setConversations((prev) => prev.filter((c) => c.customerId !== customerId));
    setSelectedConvKey(null);
    setMobileShowThread(false);
    setInboxToast('Conversation cleared from active inbox.');
    setTimeout(() => setInboxToast(null), 3000);
  };

  const handleSelectReplyMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const isVideo = file.type.startsWith('video/');
      const base64 = await blobToBase64(file);
      setReplyMedia({
        type: isVideo ? 'video' : 'image',
        base64,
        mimeType: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
        fileName: file.name
      });
    } catch (err) {
      console.error('Failed to read selected media:', err);
      setInboxToast('Could not read file from device storage.');
      setTimeout(() => setInboxToast(null), 3500);
    } finally {
      if (replyMediaInputRef.current) {
        replyMediaInputRef.current.value = '';
      }
    }
  };

  const handleStartReplyVoice = async () => {
    if (!selectedConv || sendingReply) return;
    try {
      const recorder = new BrowserAudioRecorder();
      replyAudioRecorderRef.current = recorder;
      await recorder.start();
      setIsReplyRecording(true);
      setReplyRecordingSeconds(0);
      replyRecordTimerRef.current = setInterval(() => {
        setReplyRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setInboxToast(err?.message || 'Microphone access denied. Please allow microphone permission.');
      setTimeout(() => setInboxToast(null), 3500);
    }
  };

  const handleCancelReplyVoice = async () => {
    clearInterval(replyRecordTimerRef.current);
    setIsReplyRecording(false);
    setReplyRecordingSeconds(0);
    if (replyAudioRecorderRef.current) {
      try {
        await replyAudioRecorderRef.current.stop();
      } catch {
        // ignore
      }
      replyAudioRecorderRef.current = null;
    }
  };

  const handleSendReplyVoice = async () => {
    if (!selectedConv || !replyAudioRecorderRef.current || sendingReply) return;
    try {
      clearInterval(replyRecordTimerRef.current);
      setIsReplyRecording(false);
      setSendingReply(true);
      const recorded = await replyAudioRecorderRef.current.stop();
      replyAudioRecorderRef.current = null;
      setReplyRecordingSeconds(0);

      await api.sendReply({
        customerId: selectedConv.customerId,
        customerName: selectedConv.customerName,
        platform: selectedConv.platform,
        channelId: selectedConv.channelId,
        audioBase64: recorded.base64,
        audioMimeType: recorded.mimeType
      });

      await loadInbox();
      scrollToBottom();
    } catch (err) {
      console.error('Failed to send voice reply:', err);
      setInboxToast('Failed to send voice message.');
      setTimeout(() => setInboxToast(null), 3500);
    } finally {
      setSendingReply(false);
    }
  };

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

  const handleQuickSendProduct = async (product: { name: string; price: number; image_url?: string; description?: string }) => {
    if (!selectedConv || sendingReply) return;
    const text = `🛍️ *${product.name}*\n💰 মূল্য: ৳${product.price.toLocaleString()} BDT\n📦 ইন-স্টক এভেইলেবল!\n${product.description ? `${product.description}\n` : ''}অর্ডার করতে আপনার নাম, ডেলিভারি ঠিকানা এবং ফোন নম্বর লিখে মেসেজ দিন।`;

    try {
      setSendingReply(true);
      await api.sendReply({
        customerId: selectedConv.customerId,
        customerName: selectedConv.customerName,
        platform: selectedConv.platform,
        channelId: selectedConv.channelId,
        messageText: text
      });
      setShowProductPickerModal(false);
      await loadInbox();
      scrollToBottom();
      setInboxToast(`✅ ${product.name} কার্ড পাঠানো হয়েছে!`);
      setTimeout(() => setInboxToast(null), 3000);
    } catch (err) {
      console.error('Failed to send product info:', err);
    } finally {
      setSendingReply(false);
    }
  };

  // Create Quick Order directly from Inbox
  const handleCreateQuickOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConv || submittingOrder) return;

    const deliveryFee = quickOrderZone === 'inside_dhaka' ? 60 : quickOrderZone === 'outside_dhaka' ? 120 : 0;
    const totalAmount = quickOrderPrice * quickOrderQty + deliveryFee - quickOrderAdvance;

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
        payment_status: quickOrderAdvance > 0 ? 'paid' : 'pending',
        status: 'confirmed',
        order_source: 'manual',
        advance_paid_amount: quickOrderAdvance
      });

      // Send confirmation message to customer chat
      const confirmText = `🎉 আপনার অর্ডারটি সফলভাবে কনফার্ম করা হয়েছে!\n📦 অর্ডার আইডি: #${created.order.id.substring(0, 10)}\n🛍️ পণ্য: ${quickOrderProduct} (${quickOrderQty} টি)\n💰 মোট প্রদেয়: ৳${totalAmount.toLocaleString()} BDT (${quickOrderPaymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি' : quickOrderPaymentMethod.toUpperCase()})\n🚚 ডেলিভারি ঠিকানা: ${quickOrderCustomer.address || 'Dhaka'}\n📞 ফোন: ${quickOrderCustomer.phone || selectedConv.customerId}\nআমাদের কুরিয়ার টিম শীঘ্রই পার্সেলটি পাঠিয়ে ট্র্যাকিং কোড SMS করবে। ধন্যবাদ! ❤️`;

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
      setInboxToast('✅ অর্ডার কনফার্ম করে চ্যাটে পাঠিয়ে দেওয়া হয়েছে!');
      setTimeout(() => setInboxToast(null), 3500);
    } catch (err: any) {
      console.error('Failed to create quick order:', err);
      setInboxToast(err?.message || 'Failed to create order');
      setTimeout(() => setInboxToast(null), 3500);
    } finally {
      setSubmittingOrder(false);
    }
  };

  // AI Smart Suggestion
  const handleGenerateAiSmartReply = () => {
    if (!selectedConv) return;
    const lastMsg = selectedConv.lastMessage.message_text.toLowerCase();
    let smartSuggestion = 'ধন্যবাদ আপনার মেসেজের জন্য! আমাদের প্রডাক্টটি স্টকে রয়েছে। অর্ডারটি কনফার্ম করতে অনুগ্রহ করে আপনার ১) পূর্ণ নাম, ২) ডেলিভারি ঠিকানা এবং ৩) ফোন নম্বর লিখে পাঠান।';

    if (lastMsg.includes('price') || lastMsg.includes('দাম') || lastMsg.includes('dam') || lastMsg.includes('koto')) {
      smartSuggestion = 'স্যার/ম্যাম, আমাদের পণ্যের বিশেষ মূল্য চলছে। সাথে ক্যাশ অন ডেলিভারি সুবিধা রয়েছে। আপনি কয়টি পিস নিতে চাচ্ছেন জানাবেন?';
    } else if (lastMsg.includes('delivery') || lastMsg.includes('ডেলিভারি') || lastMsg.includes('charge')) {
      smartSuggestion = 'আমাদের ডেলিভারি চার্জ: ঢাকা সিটির ভিতরে ৬০ টাকা (২৪ ঘণ্টার মধ্যে ডেলিভারি) এবং ঢাকা সিটির বাইরে ১২০ টাকা (৪৮-৭২ ঘণ্টার মধ্যে ডেলিভারি)।';
    } else if (lastMsg.includes('order') || lastMsg.includes('অর্ডার') || lastMsg.includes('নিব') || lastMsg.includes('চাই')) {
      smartSuggestion = 'অর্ডারটি গ্রহণ করার জন্য ধন্যবাদ! আপনার নাম, ডেলিভারি ঠিকানা এবং সচল মোবাইল নম্বরটি দিলে আমরা আজই পার্সেলটি পাঠিয়ে দেব।';
    }

    setReplyText(smartSuggestion);
    setInboxToast('✨ AI Smart Reply ড্রাফট করা হয়েছে!');
    setTimeout(() => setInboxToast(null), 2500);
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    if (filterPlatform !== 'all' && c.platform !== filterPlatform) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.customerName.toLowerCase().includes(q) ||
        c.customerId.toLowerCase().includes(q) ||
        (c.customerPhone && c.customerPhone.toLowerCase().includes(q)) ||
        c.lastMessage.message_text.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getPlatformIcon = (platform: 'whatsapp' | 'messenger' | 'instagram' | string, className = 'w-3.5 h-3.5') => {
    if (platform === 'whatsapp') return <WhatsAppLogo className={className} />;
    if (platform === 'messenger') return <MessengerLogo className={className} />;
    if (platform === 'instagram') return <InstagramLogo className={className} />;
    return <FacebookLogo className={className} />;
  };

  return (
    <div className="flex-1 min-h-0 h-full rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-sm flex flex-col md:flex-row overflow-hidden">
      {/* =====================================================================
          PANE 1: LEFT CONVERSATIONS SIDEBAR
      ===================================================================== */}
      <div
        className={`${
          mobileShowThread ? 'hidden md:flex' : 'flex'
        } w-full md:w-80 lg:w-[320px] h-full min-h-0 flex-1 md:flex-none border-b md:border-b-0 md:border-r border-neutral-200/80 dark:border-neutral-800 flex-col shrink-0 bg-neutral-50/50 dark:bg-neutral-900/60 overflow-hidden`}
      >
        {/* Sidebar Top Header */}
        <div className="p-3 border-b border-neutral-200/80 dark:border-neutral-800 space-y-2 bg-white dark:bg-neutral-900 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-neutral-900 dark:text-white tracking-tight">
                Live Omnichannel Inbox
              </h2>
              <span className="px-1.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/80 text-[#7F22FE] dark:text-purple-300 text-[10px] font-bold">
                {filteredConversations.length}
              </span>
            </div>

            <div className="flex items-center gap-0.5 text-neutral-400">
              {onToggleSidebar && (
                <button
                  type="button"
                  onClick={onToggleSidebar}
                  className="hidden md:flex p-1.5 rounded-lg hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  {isSidebarCollapsed ? <PanelLeftOpen className="w-3.5 h-3.5" /> : <PanelLeftClose className="w-3.5 h-3.5" />}
                </button>
              )}
              <button
                onClick={loadInbox}
                className="p-1.5 rounded-lg hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Refresh messages"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, phone, message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-neutral-200/80 dark:border-neutral-700/80 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-hidden focus:bg-white dark:focus:bg-neutral-800 focus:ring-1.5 focus:ring-[#7F22FE]/40 transition-all"
            />
          </div>

          {/* Categories Filter (All | Orders | Delivered | New) */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-2 py-0.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-[#7F22FE] text-white shadow-2xs'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              All ({categoryCounts.all})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('orders')}
              className={`px-2 py-0.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                selectedCategory === 'orders'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              Orders ({categoryCounts.orders})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('delivered')}
              className={`px-2 py-0.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                selectedCategory === 'delivered'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              Delivered ({categoryCounts.delivered})
            </button>
          </div>

          {/* Platform Tabs: All | WhatsApp | Messenger | Instagram */}
          <div className="grid grid-cols-4 gap-1 p-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-[11px] font-bold">
            <button
              onClick={() => setFilterPlatform('all')}
              className={`py-1 px-1 rounded-lg text-center transition-all cursor-pointer ${
                filterPlatform === 'all'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-2xs'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterPlatform('whatsapp')}
              className={`py-1 px-1 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                filterPlatform === 'whatsapp'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
              title="WhatsApp"
            >
              <WhatsAppLogo className="w-3 h-3 shrink-0" />
              <span>WA</span>
            </button>
            <button
              onClick={() => setFilterPlatform('messenger')}
              className={`py-1 px-1 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                filterPlatform === 'messenger'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
              title="Messenger"
            >
              <MessengerLogo className="w-3 h-3 shrink-0" />
              <span>Msg</span>
            </button>
            <button
              onClick={() => setFilterPlatform('instagram')}
              className={`py-1 px-1 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                filterPlatform === 'instagram'
                  ? 'bg-pink-600 text-white shadow-2xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
              title="Instagram"
            >
              <InstagramLogo className="w-3 h-3 shrink-0" />
              <span>IG</span>
            </button>
          </div>
        </div>

        {/* Conversation Items List */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/70">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500 dark:text-neutral-400 space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <p className="font-semibold text-neutral-700 dark:text-neutral-300">No conversations found</p>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                Incoming messages from your WhatsApp, Messenger &amp; Instagram channels will appear here automatically.
              </p>
            </div>
          ) : (
            filteredConversations.map((c) => {
              const key = `${c.platform}_${c.customerId}`;
              const isSelected = key === selectedConvKey;
              const dateStr = new Date(c.lastMessage.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={key}
                  onClick={() => {
                    setSelectedConvKey(key);
                    setMobileShowThread(true);
                  }}
                  className={`px-3 py-2.5 cursor-pointer transition-all border-l-2 flex items-center gap-2.5 ${
                    isSelected
                      ? 'bg-violet-50/70 dark:bg-neutral-800/90 border-l-[#7F22FE]'
                      : 'border-l-transparent hover:bg-neutral-100/60 dark:hover:bg-neutral-800/40'
                  }`}
                >
                  <CustomerAvatar
                    customerName={c.customerName}
                    customerAvatar={c.customerAvatar}
                    platform={c.platform}
                    size="md"
                    isSelected={isSelected}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`text-xs truncate ${
                          isSelected
                            ? 'font-extrabold text-neutral-900 dark:text-white'
                            : 'font-bold text-neutral-800 dark:text-neutral-200'
                        }`}
                      >
                        {c.customerName}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        {c.isStarred && (
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
                        )}
                        <span className="text-[10px] text-neutral-400 font-medium">
                          {dateStr}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                        {c.lastMessage.is_ai_reply && (
                          <span className="text-[#7F22FE] font-bold mr-1">AI:</span>
                        )}
                        {c.lastMessage.message_text || (c.lastMessage.has_voice ? '🎤 Voice note' : '📷 Photo')}
                      </p>
                      {c.requiresHumanAttention ? (
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Needs Attention" />
                      ) : c.orderCategory === 'orders' ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950 text-[#7F22FE] shrink-0">
                          Order
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* =====================================================================
          PANE 2: CENTER ACTIVE CONVERSATION THREAD
      ===================================================================== */}
      <div
        className={`${
          mobileShowThread ? 'flex' : 'hidden md:flex'
        } flex-1 flex-col min-w-0 min-h-0 h-full overflow-hidden bg-white dark:bg-neutral-900`}
      >
        {selectedConv ? (
          <>
            {/* Header: Customer Info + Real-Time Quick Action Tools */}
            <div className="px-4 py-2.5 border-b border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0 flex items-center justify-between gap-2 flex-wrap">
              {/* Left: Avatar + Customer Name + Channel */}
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={() => setMobileShowThread(false)}
                  className="md:hidden p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                  title="Back"
                >
                  ←
                </button>
                <CustomerAvatar
                  customerName={selectedConv.customerName}
                  customerAvatar={selectedConv.customerAvatar}
                  platform={selectedConv.platform}
                  size="md"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white truncate">
                      {selectedConv.customerName}
                    </h3>
                    {selectedConv.orderCategory === 'orders' && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950/70 text-[#7F22FE] dark:text-purple-300 shrink-0">
                        Order Confirmed
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                    {getPlatformIcon(selectedConv.platform, 'w-3 h-3 shrink-0')}
                    <span className="capitalize">{selectedConv.platform}</span>
                    <span>•</span>
                    <span className="font-mono text-[10px] truncate max-w-[140px]">
                      {selectedConv.customerPhone || selectedConv.customerId}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Quick Action Buttons & Mode Pill */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* 1. Quick Order Button */}
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
                  className="px-2.5 py-1 rounded-xl bg-[#7F22FE] hover:bg-[#6D28D9] text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                  title="Create Order directly from chat"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Quick Order</span>
                </button>

                {/* 2. Send Catalog Product */}
                <button
                  type="button"
                  onClick={() => setShowProductPickerModal(true)}
                  className="px-2.5 py-1 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  title="Pick and send a product card"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-[#7F22FE]" />
                  <span className="hidden sm:inline">Send Product</span>
                </button>

                {/* 3. AI Mode Toggle Pill */}
                <button
                  type="button"
                  onClick={() =>
                    handleToggleCustomerControl(
                      selectedConv.customerId,
                      pausedCustomers.includes(selectedConv.customerId) ? 'resume_ai' : 'pause_ai'
                    )
                  }
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer whitespace-nowrap ${
                    pausedCustomers.includes(selectedConv.customerId)
                      ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300'
                  }`}
                  title={
                    pausedCustomers.includes(selectedConv.customerId)
                      ? 'AI is paused (Human Mode). Click to resume AI Auto-Reply.'
                      : 'AI is active. Click to pause AI for manual chat.'
                  }
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      pausedCustomers.includes(selectedConv.customerId)
                        ? 'bg-amber-500'
                        : 'bg-emerald-500 animate-pulse'
                    }`}
                  />
                  <span>
                    {pausedCustomers.includes(selectedConv.customerId) ? 'Human' : 'AI Active'}
                  </span>
                </button>

                {/* 4. Toggle Customer CRM Sidebar */}
                <button
                  type="button"
                  onClick={() => setShowCustomerDetails((prev) => !prev)}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    showCustomerDetails
                      ? 'bg-violet-50 dark:bg-violet-950 border-[#7F22FE] text-[#7F22FE]'
                      : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100'
                  }`}
                  title="Toggle Customer CRM Panel"
                >
                  <PanelRight className="w-4 h-4" />
                </button>

                {/* 5. More Actions (···) */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowHeaderActionsMenu((prev) => !prev)}
                    className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                    title="More options"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {showHeaderActionsMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() => setShowHeaderActionsMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                        <button
                          type="button"
                          onClick={() => {
                            setShowHeaderActionsMenu(false);
                            handleSummarizeConversation();
                          }}
                          className="w-full px-3.5 py-2 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#7F22FE] shrink-0" />
                          <span>AI Conversation Summary</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setShowHeaderActionsMenu(false);
                            handleCopyCustomerId(selectedConv.customerId);
                          }}
                          className="w-full px-3.5 py-2 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                          <span>Copy Customer ID</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setShowHeaderActionsMenu(false);
                            handleClearConversation(selectedConv.customerId);
                          }}
                          className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 transition-colors cursor-pointer border-t border-neutral-100 dark:border-neutral-800"
                        >
                          <Trash2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Clear Conversation</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* AI Summary Banner if expanded */}
            {showSummaryPanel && (
              <div className="border-b border-violet-200 dark:border-violet-900 bg-violet-50/90 dark:bg-neutral-900 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-white">
                    <Sparkles className="w-4 h-4 text-[#7F22FE]" />
                    <span>AI Conversation Summary &amp; Intent</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSummaryPanel(false)}
                    className="p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {summarizing ? (
                  <p className="text-xs text-[#7F22FE] flex items-center gap-1.5">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Analyzing full customer conversation...</span>
                  </p>
                ) : conversationSummary ? (
                  <div className="text-xs space-y-1.5 text-neutral-700 dark:text-neutral-300">
                    <p className="font-semibold">{conversationSummary.summaryText}</p>
                    <p className="text-[11px] text-neutral-500">
                      <strong>Next Action:</strong> {conversationSummary.nextAction}
                    </p>
                  </div>
                ) : null}
              </div>
            )}

            {/* Messages Thread Stream */}
            <div
              ref={threadContainerRef}
              className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 space-y-3.5 bg-neutral-50/50 dark:bg-neutral-950/40"
            >
              <div className="flex justify-center my-2">
                <span className="text-[10px] font-semibold tracking-wider uppercase text-neutral-400 bg-white/80 dark:bg-neutral-900/80 px-2.5 py-1 rounded-full border border-neutral-200/60 dark:border-neutral-800 shadow-2xs">
                  Chat History
                </span>
              </div>

              {selectedConv.messages.map((m) => {
                const isOutbound = m.direction === 'outbound';
                const timeStr = new Date(m.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div
                    key={m.id}
                    className={`flex items-end gap-2.5 ${isOutbound ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isOutbound && (
                      <div className="mb-4 shrink-0">
                        <CustomerAvatar
                          customerName={selectedConv.customerName}
                          customerAvatar={selectedConv.customerAvatar}
                          platform={selectedConv.platform}
                          size="sm"
                          showBadge={false}
                        />
                      </div>
                    )}

                    <div className={`flex flex-col max-w-[82%] sm:max-w-[70%] ${isOutbound ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`rounded-2xl px-4 py-3 text-xs sm:text-[13px] leading-relaxed ${
                          isOutbound
                            ? m.is_ai_reply
                              ? 'bg-gradient-to-br from-[#7F22FE] to-[#6315d4] text-white rounded-br-xs shadow-sm shadow-[#7F22FE]/15'
                              : 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-br-xs shadow-xs'
                            : 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-bl-xs border border-neutral-200/80 dark:border-neutral-700/80 shadow-2xs'
                        }`}
                      >
                        {/* Header for Outbound Bubble */}
                        {isOutbound && (
                          <div className="flex items-center justify-between gap-3 text-[10px] font-bold opacity-90 mb-1 pb-1 border-b border-white/15 dark:border-neutral-700/30">
                            <span className="flex items-center gap-1">
                              {m.is_ai_reply ? (
                                <>
                                  <Bot className="w-3 h-3" />
                                  <span>One Agent AI</span>
                                </>
                              ) : (
                                <>
                                  <User className="w-3 h-3" />
                                  <span>Merchant Moderator</span>
                                </>
                              )}
                            </span>
                            {m.is_ai_reply && (
                              <span className="opacity-75">Auto-Replied</span>
                            )}
                          </div>
                        )}

                        {/* Image Attachment */}
                        {(m.has_image || m.image_url || m.image_base64) && (
                          <div className="mb-2">
                            <div
                              onClick={() =>
                                setPreviewImageUrl(
                                  m.image_url ||
                                    (m.image_base64
                                      ? `data:${m.image_mime_type || 'image/jpeg'};base64,${m.image_base64}`
                                      : null)
                                )
                              }
                              className="relative group rounded-xl overflow-hidden cursor-pointer border border-white/20 dark:border-neutral-700 max-w-xs"
                            >
                              <img
                                src={
                                  m.image_url ||
                                  (m.image_base64
                                    ? `data:${m.image_mime_type || 'image/jpeg'};base64,${m.image_base64}`
                                    : '')
                                }
                                alt="Attachment"
                                className="w-full h-44 object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                          </div>
                        )}

                        {/* Video Attachment */}
                        {m.has_video && m.video_base64 && (
                          <div className="mb-2">
                            <video
                              controls
                              className="w-full max-w-xs max-h-56 rounded-xl border border-white/20 bg-black"
                              src={`data:${m.video_mime_type || 'video/mp4'};base64,${m.video_base64}`}
                            />
                          </div>
                        )}

                        {/* Modern Voice Message Player */}
                        {m.has_voice && m.audio_base64 && (
                          <VoiceWaveformPlayer
                            audioSrc={`data:${m.audio_mime_type || 'audio/ogg'};base64,${m.audio_base64}`}
                            isOutbound={isOutbound}
                          />
                        )}

                        {/* Voice Transcription */}
                        {!isOutbound && m.transcription && (
                          <div className="text-[11px] bg-neutral-100 dark:bg-neutral-700/60 p-2 rounded-xl mb-1.5 border-l-2 border-[#7F22FE]">
                            <span className="font-bold block text-[10px] text-neutral-500">
                              Voice Transcript:
                            </span>
                            <span>"{m.transcription}"</span>
                          </div>
                        )}

                        {/* Message Text */}
                        <p className="whitespace-pre-wrap">{m.message_text}</p>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-neutral-400 mt-1 px-1">
                        <span>{timeStr}</span>
                        {isOutbound && <CheckCheck className="w-3 h-3 text-[#7F22FE]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* =====================================================================
                BOTTOM COMPOSER: CANNED PILLS + MEDIA/VOICE + SEND
            ===================================================================== */}
            <div className="border-t border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 sm:px-4 py-2 space-y-2 shrink-0">
              {/* Toast inside composer */}
              {inboxToast && (
                <div className="px-3 py-1.5 rounded-xl bg-violet-50 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800 text-[11px] font-semibold text-[#7F22FE] dark:text-purple-300 flex items-center justify-between">
                  <span>{inboxToast}</span>
                  <button
                    type="button"
                    onClick={() => setInboxToast(null)}
                    className="text-violet-400 hover:text-violet-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Canned Responses Pills Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
                <span className="text-[10px] font-bold text-neutral-400 flex items-center gap-0.5 shrink-0 mr-1">
                  <Zap className="w-3 h-3 text-amber-500" />
                  Quick:
                </span>
                {cannedTemplates.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setReplyText(item.text);
                      setInboxToast(`⚡ ${item.label} ইনপুট করা হয়েছে!`);
                      setTimeout(() => setInboxToast(null), 2000);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0"
                  >
                    {item.label}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handleGenerateAiSmartReply}
                  className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 text-white text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
                  title="Generate AI Polish reply"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>AI Smart Reply</span>
                </button>
              </div>

              {/* Selected Picture / Video Preview Strip */}
              {replyMedia && (
                <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-violet-50/80 dark:bg-violet-950/40 border border-violet-200/80 dark:border-violet-800/60">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {replyMedia.type === 'image' ? (
                      <img
                        src={`data:${replyMedia.mimeType};base64,${replyMedia.base64}`}
                        alt={replyMedia.fileName}
                        className="w-11 h-11 rounded-lg object-cover border border-violet-300/60 shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-lg bg-neutral-900 text-white flex items-center justify-center shrink-0">
                        <Video className="w-5 h-5 text-purple-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                        {replyMedia.fileName}
                      </p>
                      <p className="text-[10px] font-semibold text-[#7F22FE] dark:text-purple-300 capitalize">
                        Ready to send {replyMedia.type} on {selectedConv.platform}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReplyMedia(null)}
                    className="p-1.5 rounded-lg bg-white dark:bg-neutral-800 text-neutral-500 hover:text-rose-600 border border-neutral-200 dark:border-neutral-700 transition-colors cursor-pointer shrink-0"
                    title="Remove attachment"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Hidden file input for direct media upload */}
              <input
                ref={replyMediaInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleSelectReplyMedia}
                className="hidden"
              />

              {isReplyRecording ? (
                /* Live Voice Recording Bar */
                <div className="flex items-center justify-between gap-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-3 py-2 rounded-xl">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping shrink-0" />
                    <Mic className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span className="text-xs font-extrabold font-mono text-rose-700 dark:text-rose-300">
                      {Math.floor(replyRecordingSeconds / 60)}:
                      {String(replyRecordingSeconds % 60).padStart(2, '0')}
                    </span>
                    <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 truncate">
                      Recording voice note...
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleCancelReplyVoice}
                      className="p-2 rounded-xl bg-white dark:bg-neutral-800 text-neutral-500 hover:text-rose-600 border border-neutral-200 dark:border-neutral-700 cursor-pointer"
                      title="Cancel"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleSendReplyVoice}
                      disabled={sendingReply}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Voice</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Composer Form */
                <form onSubmit={handleSendReply} className="flex gap-1.5 sm:gap-2 items-center">
                  <button
                    type="button"
                    onClick={() => replyMediaInputRef.current?.click()}
                    disabled={sendingReply}
                    className="p-2 sm:p-2.5 rounded-xl border border-neutral-200/90 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:text-[#7F22FE] hover:border-[#7F22FE]/40 hover:bg-violet-50/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
                    title="Send Picture or Video"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleStartReplyVoice}
                    disabled={sendingReply}
                    className="p-2 sm:p-2.5 rounded-xl border border-neutral-200/90 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:text-emerald-600 hover:border-emerald-500/40 hover:bg-emerald-50/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
                    title="Record voice note"
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowProductPickerModal(true)}
                    className="p-2 sm:p-2.5 rounded-xl border border-neutral-200/90 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:text-[#7F22FE] hover:bg-violet-50/60 transition-colors cursor-pointer shrink-0"
                    title="Pick and send product"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={
                      replyMedia
                        ? `Add caption...`
                        : `Reply to ${selectedConv.customerName}...`
                    }
                    className="flex-1 min-w-0 bg-neutral-50 dark:bg-neutral-800/90 text-neutral-900 dark:text-white text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-neutral-200/90 dark:border-neutral-700 focus:outline-hidden focus:bg-white dark:focus:bg-neutral-800 focus:ring-2 focus:ring-[#7F22FE]/30 focus:border-[#7F22FE] transition-all"
                  />

                  <button
                    type="submit"
                    disabled={(!replyText.trim() && !replyMedia) || sendingReply}
                    className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#7F22FE] hover:bg-[#6c1ce0] disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-[#7F22FE]/25 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">{sendingReply ? '...' : 'Send'}</span>
                  </button>
                </form>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-400">
            <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-3 text-neutral-400">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-sm text-neutral-800 dark:text-neutral-200 mb-1">
              No Conversation Selected
            </h4>
            <p className="text-xs max-w-xs text-neutral-500">
              Select a customer conversation from the list to view real-time chat history and reply.
            </p>
          </div>
        )}
      </div>

      {/* =====================================================================
          PANE 3: RIGHT CUSTOMER DETAILS & ORDER ACTIONS CRM PANEL
      ===================================================================== */}
      {selectedConv && showCustomerDetails && (
        <div className="hidden lg:flex shrink-0 h-full min-h-0 border-l border-neutral-200/80 dark:border-neutral-800/80">
          <CustomerDetailsPanel
            conversation={selectedConv}
            onNavigate={onNavigate}
            onClose={() => setShowCustomerDetails(false)}
            onOpenCreateOrder={(customerInfo) => {
              if (customerInfo) {
                setQuickOrderCustomer(customerInfo);
              }
              setShowQuickOrderModal(true);
            }}
            onOpenProductPicker={() => setShowProductPickerModal(true)}
            onToggleAi={(action) => handleToggleCustomerControl(selectedConv.customerId, action)}
            isAiPaused={pausedCustomers.includes(selectedConv.customerId)}
            onCustomerUpdated={loadInbox}
          />
        </div>
      )}

      {/* =====================================================================
          MODAL 1: QUICK ORDER CREATOR MODAL
      ===================================================================== */}
      {showQuickOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0E0922] w-full max-w-md rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#7F22FE] text-white flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-neutral-900 dark:text-white">
                    Quick Create &amp; Confirm Order
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Saves to database and sends confirmation message to chat
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickOrderModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateQuickOrder} className="p-5 space-y-3.5 overflow-y-auto flex-1 text-xs">
              {/* Customer Details */}
              <div className="space-y-2 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
                <h4 className="font-bold text-neutral-700 dark:text-neutral-300 text-[11px] uppercase tracking-wider">
                  Customer Info
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-neutral-500 block mb-0.5">Name</label>
                    <input
                      type="text"
                      required
                      value={quickOrderCustomer.name}
                      onChange={(e) => setQuickOrderCustomer({ ...quickOrderCustomer, name: e.target.value })}
                      className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-500 block mb-0.5">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={quickOrderCustomer.phone}
                      onChange={(e) => setQuickOrderCustomer({ ...quickOrderCustomer, phone: e.target.value })}
                      className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-neutral-500 block mb-0.5">Delivery Address</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="House, Road, Area, District..."
                    value={quickOrderCustomer.address}
                    onChange={(e) => setQuickOrderCustomer({ ...quickOrderCustomer, address: e.target.value })}
                    className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Product Selection */}
              <div className="space-y-2">
                <label className="font-bold text-neutral-700 dark:text-neutral-300 block">
                  Select Product / Item
                </label>
                {products.length > 0 ? (
                  <select
                    value={quickOrderProduct}
                    onChange={(e) => {
                      const sel = products.find((p) => p.name === e.target.value);
                      setQuickOrderProduct(e.target.value);
                      if (sel) setQuickOrderPrice(sel.price);
                    }}
                    className="w-full p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold cursor-pointer"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name} — ৳{p.price} BDT
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="Enter item name..."
                    value={quickOrderProduct}
                    onChange={(e) => setQuickOrderProduct(e.target.value)}
                    className="w-full p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  />
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-neutral-500 block mb-0.5">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      value={quickOrderQty}
                      onChange={(e) => setQuickOrderQty(Number(e.target.value) || 1)}
                      className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-500 block mb-0.5">Unit Price (BDT)</label>
                    <input
                      type="number"
                      value={quickOrderPrice}
                      onChange={(e) => setQuickOrderPrice(Number(e.target.value) || 0)}
                      className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Zone & Courier Charge */}
              <div className="space-y-1.5">
                <label className="font-bold text-neutral-700 dark:text-neutral-300 block">
                  Delivery Zone &amp; Courier Charge
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setQuickOrderZone('inside_dhaka')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      quickOrderZone === 'inside_dhaka'
                        ? 'border-[#7F22FE] bg-violet-50 dark:bg-violet-950/60 text-[#7F22FE] font-black'
                        : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <span>Dhaka</span>
                    <span className="block text-[10px] font-bold">+৳60</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickOrderZone('outside_dhaka')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      quickOrderZone === 'outside_dhaka'
                        ? 'border-[#7F22FE] bg-violet-50 dark:bg-violet-950/60 text-[#7F22FE] font-black'
                        : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <span>Outside Dhaka</span>
                    <span className="block text-[10px] font-bold">+৳120</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickOrderZone('free')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      quickOrderZone === 'free'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-black'
                        : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <span>Free Delivery</span>
                    <span className="block text-[10px] font-bold">+৳0</span>
                  </button>
                </div>
              </div>

              {/* Payment Method & Total Calculation */}
              <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  <span>Subtotal:</span>
                  <span>৳{(quickOrderPrice * quickOrderQty).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  <span>Delivery Charge:</span>
                  <span>+৳{quickOrderZone === 'inside_dhaka' ? 60 : quickOrderZone === 'outside_dhaka' ? 120 : 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-black text-[#7F22FE] pt-1 border-t border-purple-200 dark:border-purple-800">
                  <span>Total Payable:</span>
                  <span>
                    ৳{((quickOrderPrice * quickOrderQty) + (quickOrderZone === 'inside_dhaka' ? 60 : quickOrderZone === 'outside_dhaka' ? 120 : 0)).toLocaleString()} BDT
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuickOrderModal(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 font-bold hover:bg-neutral-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOrder}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#7F22FE] to-[#9333EA] hover:from-[#6D28D9] text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {submittingOrder ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Confirm &amp; Send Order</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: PRODUCT PICKER MODAL
      ===================================================================== */}
      {showProductPickerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0E0922] w-full max-w-lg rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-5 py-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#7F22FE]" />
                <h3 className="text-sm font-black text-neutral-900 dark:text-white">
                  Send Product Card to Chat
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowProductPickerModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-neutral-200/80 dark:border-neutral-800">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products by name or category..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
              </div>
            </div>

            {/* Product List */}
            <div className="p-3 space-y-2 overflow-y-auto flex-1 divide-y divide-neutral-100 dark:divide-neutral-800">
              {products
                .filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                .map((prod) => (
                  <div
                    key={prod.id}
                    className="pt-2 first:pt-0 flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={prod.image_url}
                        alt={prod.name}
                        className="w-12 h-12 object-cover rounded-xl border border-neutral-200 dark:border-neutral-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                          {prod.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-black text-[#7F22FE]">
                            ৳{prod.price.toLocaleString()} BDT
                          </span>
                          <span className="text-[10px] text-emerald-600 font-bold px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950">
                            In Stock
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleQuickSendProduct(prod)}
                      className="px-3 py-1.5 rounded-xl bg-[#7F22FE] hover:bg-[#6D28D9] text-white text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 shadow-xs"
                    >
                      <Send className="w-3 h-3" />
                      <span>Send Card</span>
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
          onClick={() => setPreviewImageUrl(null)}
        >
          <div className="relative max-w-xl max-h-[85vh] rounded-2xl overflow-hidden bg-neutral-900 p-2 border border-white/20">
            <img
              src={previewImageUrl}
              alt="Enlarged preview"
              className="max-w-full max-h-[80vh] object-contain rounded-xl"
            />
            <button
              onClick={() => setPreviewImageUrl(null)}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white rounded-full p-2 text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
