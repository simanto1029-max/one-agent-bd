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
  AlertCircle
} from 'lucide-react';
import { api } from '../../api';
import { Conversation, ConversationSummaryResult, Channel, Product } from '../../types';
import { BrowserAudioRecorder, blobToBase64 } from '../../utils/audioRecorder';
import { CustomerFraudBadge } from './CustomerFraudBadge';

interface UnifiedInboxProps {
  channels: Channel[];
  onNavigate?: (tab: string) => void;
  initialConvKey?: string | null;
  isProPlan?: boolean;
  onUpgradeToPro?: () => void;
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

  // If customerAvatar exists or dicebear fallback for named customer
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

export const UnifiedInbox: React.FC<UnifiedInboxProps> = ({
  channels,
  onNavigate,
  initialConvKey,
  isProPlan = true,
  onUpgradeToPro
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

  // Inbound simulation drawer/form
  const [showSimulateDrawer, setShowSimulateDrawer] = useState(false);
  const [simMode, setSimMode] = useState<'text' | 'voice' | 'image'>('text');
  const [simPlatform, setSimPlatform] = useState<'whatsapp' | 'messenger' | 'instagram'>('whatsapp');
  const [simCustomerName, setSimCustomerName] = useState('');
  const [simCustomerId, setSimCustomerId] = useState('');
  const [simMessage, setSimMessage] = useState('');
  const [simAudioBase64, setSimAudioBase64] = useState<string | null>(null);
  const [simAudioMime, setSimAudioMime] = useState<string>('audio/webm');
  const [simImageBase64, setSimImageBase64] = useState<string | null>(null);
  const [simImageUrl, setSimImageUrl] = useState<string>('');
  const [simulating, setSimulating] = useState(false);

  // Voice recording state (Simulator)
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [inboxToast, setInboxToast] = useState<string | null>(null);
  const audioRecorderRef = useRef<BrowserAudioRecorder | null>(null);
  const recordTimerRef = useRef<any>(null);

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

  const handleStartRecording = async () => {
    try {
      const recorder = new BrowserAudioRecorder();
      audioRecorderRef.current = recorder;
      await recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setInboxToast(err.message || 'Could not access microphone.');
      setTimeout(() => setInboxToast(null), 3500);
    }
  };

  const handleStopRecording = async () => {
    if (!audioRecorderRef.current) return;
    try {
      clearInterval(recordTimerRef.current);
      setIsRecording(false);
      const res = await audioRecorderRef.current.stop();
      setSimAudioBase64(res.base64);
      setSimAudioMime(res.mimeType);
    } catch (err: any) {
      console.error('Failed to stop recording:', err);
      setIsRecording(false);
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await blobToBase64(file);
      setSimAudioBase64(base64);
      setSimAudioMime(file.type || 'audio/ogg');
    } catch (err) {
      console.error('Failed to read file:', err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await blobToBase64(file);
      setSimImageBase64(base64);
      setSimImageUrl('');
    } catch (err) {
      console.error('Failed to read image:', err);
    }
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

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConv || (!replyText.trim() && !replyMedia) || sendingReply) return;

    try {
      setSendingReply(true);
      const text = replyText.trim();
      const mediaToSend = replyMedia;
      setReplyText('');
      setReplyMedia(null);

      await api.sendReply({
        customerId: selectedConv.customerId,
        customerName: selectedConv.customerName,
        platform: selectedConv.platform,
        channelId: selectedConv.channelId,
        messageText: text || undefined,
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

  const handleQuickSendProduct = async (product: { name: string; price: number }) => {
    if (!selectedConv || sendingReply) return;
    const text = `✨ ${product.name}\n💰 Price: ৳${product.price.toLocaleString()} BDT\n📦 In Stock — Reply with your Name, Phone & Address to confirm your order!`;
    try {
      setSendingReply(true);
      await api.sendReply({
        customerId: selectedConv.customerId,
        customerName: selectedConv.customerName,
        platform: selectedConv.platform,
        channelId: selectedConv.channelId,
        messageText: text
      });
      await loadInbox();
      scrollToBottom();
    } catch (err) {
      console.error('Failed to send product info:', err);
    } finally {
      setSendingReply(false);
    }
  };

  const handleSimulateInteractiveOptionClick = async (optionText: string) => {
    if (!selectedConv || !optionText.trim() || simulating) return;
    try {
      setSimulating(true);
      setOpenInteractiveMsgId(null);
      await api.simulateInboundMessage({
        platform: selectedConv.platform,
        customerId: selectedConv.customerId,
        customerName: selectedConv.customerName,
        messageText: optionText.trim()
      });
      await loadInbox();
      scrollToBottom();
    } catch (err) {
      console.error('Failed to simulate interactive button click:', err);
    } finally {
      setSimulating(false);
    }
  };

  const handleSimulateInbound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (simMode === 'text' && !simMessage.trim()) return;
    if (simMode === 'voice' && !simAudioBase64) {
      setInboxToast('Please record or upload a voice note first.');
      setTimeout(() => setInboxToast(null), 3500);
      return;
    }
    if (simMode === 'image' && !simImageBase64 && !simImageUrl) {
      setInboxToast('Please select or upload a product picture.');
      setTimeout(() => setInboxToast(null), 3500);
      return;
    }

    try {
      setSimulating(true);
      await api.simulateInboundMessage({
        platform: simPlatform,
        customerName: simCustomerName.trim() || undefined,
        customerId: simCustomerId.trim() || undefined,
        messageText: simMessage.trim() || (simMode === 'image' ? 'How much is this product and can you share details?' : undefined),
        audioBase64: simMode === 'voice' ? simAudioBase64 || undefined : undefined,
        audioMimeType: simMode === 'voice' ? simAudioMime : undefined,
        imageBase64: simMode === 'image' ? simImageBase64 || undefined : undefined,
        imageUrl: simMode === 'image' ? simImageUrl || undefined : undefined
      });

      setSimMessage('');
      setSimAudioBase64(null);
      setSimImageBase64(null);
      setSimImageUrl('');
      setShowSimulateDrawer(false);
      await loadInbox();
    } catch (err) {
      console.error('Failed to simulate incoming message:', err);
    } finally {
      setSimulating(false);
    }
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    if (filterPlatform !== 'all' && c.platform !== filterPlatform) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.customerName.toLowerCase().includes(q) ||
        c.customerId.toLowerCase().includes(q) ||
        c.lastMessage.message_text.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const sampleProducts = [
    {
      name: 'Wireless ANC Earbuds Pro',
      price: 1850,
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=80'
    },
    {
      name: 'Series 9 Smartwatch AMOLED',
      price: 2450,
      image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&auto=format&fit=crop&q=80'
    },
    {
      name: 'Urban Streetwear Sneakers',
      price: 2800,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80'
    },
    {
      name: 'Executive Minimalist Backpack',
      price: 2150,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=80'
    }
  ];

  const quickReplies = [
    { label: '📦 Delivery Info', text: 'Inside Dhaka delivery is 60 TK (24h) and Outside Dhaka is 120 TK (48-72h). Cash on Delivery is available!' },
    { label: '✅ Confirm Order', text: 'Thank you! Please share your Full Name, 11-digit Phone Number, and full Delivery Address so we can dispatch your parcel today.' },
    { label: '🚚 Courier Status', text: 'Your order has been booked with Steadfast Courier! You will receive an SMS tracking link shortly.' }
  ];

  const getPlatformIcon = (platform: 'whatsapp' | 'messenger' | 'instagram' | string, className = 'w-3.5 h-3.5') => {
    if (platform === 'whatsapp') return <WhatsAppLogo className={className} />;
    if (platform === 'messenger') return <MessengerLogo className={className} />;
    if (platform === 'instagram') return <InstagramLogo className={className} />;
    return <FacebookLogo className={className} />;
  };

  const getPlatformBadgeStyle = (platform: 'whatsapp' | 'messenger' | 'instagram' | string) => {
    if (platform === 'whatsapp') return 'bg-emerald-500 text-white';
    if (platform === 'messenger') return 'bg-blue-600 text-white';
    return 'bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 text-white';
  };

  const aiReplyCountInThread = selectedConv
    ? selectedConv.messages.filter((m) => m.is_ai_reply).length
    : 0;

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
        <div className="p-3.5 border-b border-neutral-200/80 dark:border-neutral-800 space-y-2.5 bg-white dark:bg-neutral-900 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7F22FE] to-violet-500 text-white flex items-center justify-center shadow-sm shadow-[#7F22FE]/25">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-extrabold text-neutral-900 dark:text-white tracking-tight">
                    Unified Inbox
                  </h2>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {categoryCounts.all} active threads • AI auto-replying
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={loadInbox}
                className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Refresh messages"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                id="simulate-inbox-customer-btn"
                onClick={() => setShowSimulateDrawer(true)}
                className="px-2.5 py-1.5 text-[11px] font-bold rounded-xl bg-[#7F22FE] hover:bg-[#6c1ce0] text-white flex items-center gap-1 shadow-xs shadow-[#7F22FE]/20 transition-all cursor-pointer"
                title="Simulate inbound customer message, voice note, or product photo"
              >
                <Sparkles className="w-3 h-3" />
                <span>Simulate</span>
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name, phone, or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-neutral-200/90 dark:border-neutral-700/80 bg-neutral-50/80 dark:bg-neutral-800/90 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-hidden focus:bg-white dark:focus:bg-neutral-800 focus:ring-2 focus:ring-[#7F22FE]/30 focus:border-[#7F22FE] transition-all"
            />
          </div>

          {/* Segmented Category Filter Control */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-[11px] font-bold">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`py-1.5 px-1 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-2xs'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <span>All</span>
              <span className="text-[10px] text-neutral-400 font-semibold">
                {categoryCounts.all}
              </span>
            </button>

            <button
              onClick={() => setSelectedCategory('orders')}
              className={`py-1.5 px-1 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                selectedCategory === 'orders'
                  ? 'bg-white dark:bg-neutral-700 text-[#7F22FE] dark:text-purple-300 shadow-2xs'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <span>Orders</span>
              <span className="text-[10px] text-[#7F22FE] dark:text-purple-400 font-semibold">
                {categoryCounts.orders}
              </span>
            </button>

            <button
              onClick={() => setSelectedCategory('delivered')}
              className={`py-1.5 px-1 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                selectedCategory === 'delivered'
                  ? 'bg-white dark:bg-neutral-700 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <span>Done</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                {categoryCounts.delivered}
              </span>
            </button>

            <button
              onClick={() => setSelectedCategory('new_customer')}
              className={`py-1.5 px-1 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                selectedCategory === 'new_customer'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-2xs'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <span>New</span>
              <span className="text-[10px] text-neutral-400 font-semibold">
                {categoryCounts.new_customer}
              </span>
            </button>
          </div>

          {/* Platform Filter Tabs */}
          <div className="flex items-center gap-1 text-[11px] overflow-x-auto">
            <button
              onClick={() => setFilterPlatform('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer shrink-0 ${
                filterPlatform === 'all'
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                  : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              All Channels
            </button>
            <button
              onClick={() => setFilterPlatform('whatsapp')}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                filterPlatform === 'whatsapp'
                  ? 'bg-emerald-600 text-white'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <WhatsAppLogo className="w-3.5 h-3.5 shrink-0" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={() => setFilterPlatform('messenger')}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                filterPlatform === 'messenger'
                  ? 'bg-blue-600 text-white'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <MessengerLogo className="w-3.5 h-3.5 shrink-0" />
              <span>Messenger</span>
            </button>
            <button
              onClick={() => setFilterPlatform('instagram')}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                filterPlatform === 'instagram'
                  ? 'bg-pink-600 text-white'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <InstagramLogo className="w-3.5 h-3.5 shrink-0" />
              <span>Instagram</span>
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
              <button
                onClick={() => setShowSimulateDrawer(true)}
                className="text-xs text-[#7F22FE] font-bold hover:underline cursor-pointer"
              >
                Simulate an incoming customer chat →
              </button>
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
                  className={`p-3.5 cursor-pointer transition-all relative flex items-start gap-3 ${
                    isSelected
                      ? 'bg-white dark:bg-neutral-800/95 border-l-3 border-l-[#7F22FE] shadow-2xs'
                      : 'hover:bg-white/70 dark:hover:bg-neutral-800/40'
                  }`}
                >
                  {/* Avatar with Profile Picture & Authentic Platform Corner Badge */}
                  <CustomerAvatar
                    customerName={c.customerName}
                    customerAvatar={c.customerAvatar}
                    platform={c.platform}
                    size="md"
                    isSelected={isSelected}
                  />

                  {/* Conversation Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-xs truncate ${
                          isSelected
                            ? 'font-extrabold text-neutral-900 dark:text-white'
                            : 'font-bold text-neutral-800 dark:text-neutral-200'
                        }`}
                      >
                        {c.customerName}
                      </span>
                      <span className="text-[10px] text-neutral-400 shrink-0 font-medium">
                        {dateStr}
                      </span>
                    </div>

                    {/* Last Message Preview */}
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5 flex items-center gap-1">
                      {c.lastMessage.is_ai_reply && (
                        <span className="text-[#7F22FE] dark:text-purple-400 font-bold shrink-0">
                          AI:
                        </span>
                      )}
                      {c.lastMessage.has_voice && (
                        <span className="inline-flex items-center gap-0.5 text-[#7F22FE] font-semibold shrink-0">
                          <Mic className="w-3 h-3" /> Voice
                        </span>
                      )}
                      {(c.lastMessage.has_image || c.lastMessage.image_url) && (
                        <span className="inline-flex items-center gap-0.5 text-[#7F22FE] font-semibold shrink-0">
                          <ImageIcon className="w-3 h-3" /> Photo
                        </span>
                      )}
                      <span className="truncate">{c.lastMessage.message_text}</span>
                    </p>

                    {/* Clean Status Line */}
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] font-semibold flex-wrap">
                      {c.requiresHumanAttention && (
                        <span className="text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 border border-amber-300/80 dark:border-amber-700/60 px-1.5 py-0.5 rounded flex items-center gap-1 font-bold shrink-0">
                          <AlertCircle className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                          Needs Review
                        </span>
                      )}
                      {c.orderCategory === 'delivered' ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Delivered
                        </span>
                      ) : c.orderCategory === 'orders' ? (
                        <span className="text-[#7F22FE] dark:text-purple-400 flex items-center gap-1">
                          <ShoppingBag className="w-3 h-3" />
                          Order Confirmed
                        </span>
                      ) : (
                        <span className="text-neutral-400 dark:text-neutral-500">
                          New Inquiry
                        </span>
                      )}
                      <span className="text-neutral-300 dark:text-neutral-700">·</span>
                      <span className="text-neutral-500 dark:text-neutral-400 capitalize inline-flex items-center gap-1 font-medium">
                        {getPlatformIcon(c.platform, 'w-3 h-3 shrink-0')}
                        <span>{c.platform === 'whatsapp' ? 'WhatsApp' : c.platform === 'messenger' ? 'Messenger' : 'Instagram'}</span>
                      </span>
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
            {/* Thread Header (Mobile-First 2-Row Clean Layout, Single-Row on Desktop) */}
            <div className="px-3 sm:px-5 py-2.5 sm:py-3 border-b border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0 space-y-2 sm:space-y-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => setMobileShowThread(false)}
                    className="md:hidden px-2.5 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-xs font-bold shrink-0 cursor-pointer"
                  >
                    ← Chats
                  </button>
                  <CustomerAvatar
                    customerName={selectedConv.customerName}
                    customerAvatar={selectedConv.customerAvatar}
                    platform={selectedConv.platform}
                    size="lg"
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h3 className="text-xs sm:text-sm font-extrabold text-neutral-900 dark:text-white truncate">
                        {selectedConv.customerName}
                      </h3>
                      <span className="text-neutral-300 dark:text-neutral-700 shrink-0">·</span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 capitalize shrink-0">
                        {getPlatformIcon(selectedConv.platform, 'w-3.5 h-3.5 shrink-0')}
                        <span>{selectedConv.platform === 'whatsapp' ? 'WhatsApp' : selectedConv.platform === 'messenger' ? 'Messenger' : 'Instagram'}</span>
                      </span>
                      {selectedConv.orderCategory === 'orders' && (
                        <span className="hidden sm:inline-flex text-[11px] font-bold text-[#7F22FE] dark:text-purple-400 items-center gap-1 shrink-0">
                          · <ShoppingBag className="w-3 h-3" /> Order Confirmed
                        </span>
                      )}
                      {selectedConv.orderCategory === 'delivered' && (
                        <span className="hidden sm:inline-flex text-[11px] font-bold text-emerald-600 dark:text-emerald-400 items-center gap-1 shrink-0">
                          · <CheckCircle2 className="w-3 h-3" /> Delivered
                        </span>
                      )}
                    </div>

                    {/* Desktop-Only Inline ID & Fraud Badge */}
                    <div className="hidden sm:flex items-center gap-2 flex-wrap text-[11px] text-neutral-400 mt-0.5">
                      <span className="font-mono truncate max-w-[180px]">{selectedConv.customerId}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyCustomerId(selectedConv.customerId)}
                        className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer shrink-0"
                        title="Copy Customer ID / Phone"
                      >
                        {copiedId ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                      {(() => {
                        const rawIdDigits = String(selectedConv.customerId || '').replace(/\D/g, '');
                        const idPhone = rawIdDigits.startsWith('8801') ? rawIdDigits.slice(2) : rawIdDigits;
                        const isIdBdPhone = /^01[3-9]\d{8}$/.test(idPhone);
                        const msgTextCombined = selectedConv.messages.map((m) => m.message_text || '').join(' ');
                        const extractedMatch = msgTextCombined.match(/(?:\+?88)?(01[3-9]\d{8})/);
                        const detectedPhone = isIdBdPhone
                          ? idPhone
                          : extractedMatch
                          ? extractedMatch[1]
                          : selectedConv.orderCategory === 'orders' || selectedConv.orderCategory === 'delivered'
                          ? selectedConv.customerId
                          : undefined;
                        return detectedPhone ? (
                          <CustomerFraudBadge
                            phone={detectedPhone}
                            customerName={selectedConv.customerName}
                            isProPlan={isProPlan}
                            onUpgradeToPro={onUpgradeToPro}
                          />
                        ) : null;
                      })()}
                    </div>
                  </div>
                </div>

                {/* Right Header Controls: Clean AI Status Pill + More Actions Dropdown (⋯) */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 relative">
                  <button
                    type="button"
                    onClick={() =>
                      handleToggleCustomerControl(
                        selectedConv.customerId,
                        pausedCustomers.includes(selectedConv.customerId) ? 'resume_ai' : 'pause_ai'
                      )
                    }
                    className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer whitespace-nowrap ${
                      pausedCustomers.includes(selectedConv.customerId)
                        ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300'
                    }`}
                    title={
                      pausedCustomers.includes(selectedConv.customerId)
                        ? 'AI is currently paused (Human Mode). Click to resume AI Auto-Reply.'
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
                      {pausedCustomers.includes(selectedConv.customerId) ? 'Human Mode' : 'AI Active'}
                    </span>
                  </button>

                {/* More Actions Icon Menu */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowHeaderActionsMenu((prev) => !prev)}
                    className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200/80 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border border-neutral-200/80 dark:border-neutral-700 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                    title="More conversation actions"
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
                        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 dark:border-neutral-800">
                          Chat Actions
                        </div>

                        <button
                          id="conversation-summarize-btn"
                          type="button"
                          onClick={() => {
                            setShowHeaderActionsMenu(false);
                            handleSummarizeConversation();
                          }}
                          disabled={summarizing}
                          className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-violet-50 dark:hover:bg-violet-950/40 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          {summarizing ? (
                            <RefreshCw className="w-3.5 h-3.5 text-[#7F22FE] animate-spin shrink-0" />
                          ) : (
                            <FileText className="w-3.5 h-3.5 text-[#7F22FE] shrink-0" />
                          )}
                          <span>{summarizing ? 'Summarizing...' : 'AI Conversation Summary'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setShowHeaderActionsMenu(false);
                            handleToggleCustomerControl(
                              selectedConv.customerId,
                              pausedCustomers.includes(selectedConv.customerId) ? 'resume_ai' : 'pause_ai'
                            );
                          }}
                          className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          {pausedCustomers.includes(selectedConv.customerId) ? (
                            <>
                              <PlayCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Resume AI Auto-Reply</span>
                            </>
                          ) : (
                            <>
                              <PauseCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <span>Pause AI (Human Handover)</span>
                            </>
                          )}
                        </button>

                        <div className="my-1 border-t border-neutral-100 dark:border-neutral-800" />

                        <button
                          type="button"
                          onClick={() => {
                            setShowHeaderActionsMenu(false);
                            handleToggleCustomerControl(
                              selectedConv.customerId,
                              blockedCustomers.includes(selectedConv.customerId) ? 'unblock' : 'block'
                            );
                          }}
                          className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <Ban className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            {blockedCustomers.includes(selectedConv.customerId)
                              ? 'Unblock Customer'
                              : 'Block Spam Customer'}
                          </span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
              </div>

              {/* Mobile-Only Clean Second Row for Customer ID + AI Fraud Check Badge */}
              <div className="flex sm:hidden items-center justify-between gap-2 pt-1.5 border-t border-neutral-100 dark:border-neutral-800/80 text-[11px] text-neutral-500">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-mono truncate max-w-[140px]">{selectedConv.customerId}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyCustomerId(selectedConv.customerId)}
                    className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer shrink-0"
                    title="Copy Customer ID / Phone"
                  >
                    {copiedId ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                {(() => {
                  const rawIdDigits = String(selectedConv.customerId || '').replace(/\D/g, '');
                  const idPhone = rawIdDigits.startsWith('8801') ? rawIdDigits.slice(2) : rawIdDigits;
                  const isIdBdPhone = /^01[3-9]\d{8}$/.test(idPhone);
                  const msgTextCombined = selectedConv.messages.map((m) => m.message_text || '').join(' ');
                  const extractedMatch = msgTextCombined.match(/(?:\+?88)?(01[3-9]\d{8})/);
                  const detectedPhone = isIdBdPhone
                    ? idPhone
                    : extractedMatch
                    ? extractedMatch[1]
                    : selectedConv.orderCategory === 'orders' || selectedConv.orderCategory === 'delivered'
                    ? selectedConv.customerId
                    : undefined;
                  return detectedPhone ? (
                    <CustomerFraudBadge
                      phone={detectedPhone}
                      customerName={selectedConv.customerName}
                      isProPlan={isProPlan}
                      onUpgradeToPro={onUpgradeToPro}
                    />
                  ) : null;
                })()}
              </div>
            </div>

            {/* Needs Review / Human Attention Alert Banner */}
            {selectedConv.requiresHumanAttention && (
              <div className="bg-amber-50/90 dark:bg-amber-950/40 border-b border-amber-200/80 dark:border-amber-800/60 px-4 sm:px-5 py-2.5 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200 animate-in fade-in duration-150 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[11px] sm:text-xs truncate">
                      {selectedConv.attentionReason || 'গ্রাহকের এমন একটি প্রশ্ন রয়েছে যা এআই নলেজবেসে সরাসরি নেই।'}
                    </p>
                    <p className="text-[10px] text-amber-700/80 dark:text-amber-400/80 hidden sm:block">
                      এআই কাস্টমারকে বিনীত হোল্ড বার্তা দিয়েছে। অনুগ্রহ করে নিচে মেসেজ লিখে লাইভ হ্যান্ডওভার সম্পন্ন করুন।
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleToggleCustomerControl(
                      selectedConv.customerId,
                      pausedCustomers.includes(selectedConv.customerId) ? 'resume_ai' : 'pause_ai'
                    )
                  }
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shrink-0 cursor-pointer shadow-xs transition-colors flex items-center gap-1"
                >
                  {pausedCustomers.includes(selectedConv.customerId) ? (
                    <>
                      <PlayCircle className="w-3 h-3" />
                      <span>AI চালু করুন</span>
                    </>
                  ) : (
                    <>
                      <PauseCircle className="w-3 h-3" />
                      <span>Take Over (Pause AI)</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Collapsible Conversation Summary & Stage Analysis Banner */}
            {showSummaryPanel && (
              <div className="border-b border-violet-200/80 dark:border-violet-900/60 bg-gradient-to-br from-violet-50/90 via-white to-purple-50/60 dark:from-violet-950/40 dark:via-neutral-900 dark:to-neutral-900 px-4 sm:px-5 py-3.5 space-y-3 max-h-[52vh] overflow-y-auto">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-[#7F22FE] text-white flex items-center justify-center shadow-xs shadow-[#7F22FE]/25 shrink-0">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
                        <span>AI Conversation Summary &amp; Stage</span>
                        {conversationSummary && (
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                              conversationSummary.stageKey === 'delivered'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300/60'
                                : conversationSummary.stageKey === 'order_confirmed'
                                ? 'bg-purple-100 text-[#7F22FE] dark:bg-purple-950/70 dark:text-purple-300 border border-purple-300/60'
                                : conversationSummary.stageKey === 'awaiting_order_details'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300/60'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-300/60'
                            }`}
                          >
                            {conversationSummary.stageLabel}
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        Detailed report of what was discussed with the customer and the current stage of the chat
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleSummarizeConversation}
                      disabled={summarizing}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[11px] font-bold text-neutral-700 dark:text-neutral-200 hover:border-[#7F22FE] hover:text-[#7F22FE] transition-colors flex items-center gap-1 cursor-pointer"
                      title="Re-generate Summary"
                    >
                      <RefreshCw className={`w-3 h-3 ${summarizing ? 'animate-spin' : ''}`} />
                      <span className="hidden sm:inline">Refresh</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSummaryPanel(false)}
                      className="p-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                      title="Close Summary"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {summarizing && !conversationSummary ? (
                  <div className="py-5 flex items-center justify-center gap-2.5 text-xs font-bold text-[#7F22FE] dark:text-purple-300">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing full customer conversation and generating stage summary...</span>
                  </div>
                ) : conversationSummary ? (
                  <div className="space-y-3">
                    {/* 4-Step Conversation Stage Progress Bar */}
                    <div className="p-3 rounded-xl bg-white dark:bg-neutral-800/90 border border-neutral-200/80 dark:border-neutral-700/80 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-neutral-500 dark:text-neutral-400">
                          Current Conversation Stage:
                        </span>
                        <span className="text-[#7F22FE] dark:text-purple-300">
                          Step {conversationSummary.stageStep}/4 — {conversationSummary.stageLabel}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px] font-bold">
                        {[
                          { step: 1, label: '1. New Inquiry' },
                          { step: 2, label: '2. Price & Details' },
                          { step: 3, label: '3. Awaiting Info' },
                          {
                            step: 4,
                            label:
                              conversationSummary.stageKey === 'delivered'
                                ? '4. Delivered'
                                : '4. Order Confirmed'
                          }
                        ].map((item) => {
                          const isDone = conversationSummary.stageStep >= item.step;
                          const isCurrent = conversationSummary.stageStep === item.step;
                          return (
                            <div
                              key={item.step}
                              className={`px-2 py-1.5 rounded-lg text-center border transition-all ${
                                isCurrent
                                  ? 'bg-[#7F22FE] text-white border-[#7F22FE] shadow-2xs'
                                  : isDone
                                  ? 'bg-violet-100/80 dark:bg-violet-950/60 text-[#7F22FE] dark:text-purple-300 border-violet-200 dark:border-violet-800'
                                  : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-400 border-neutral-200/60 dark:border-neutral-800'
                              }`}
                            >
                              {item.label}
                            </div>
                          );
                        })}
                      </div>

                      <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                        {conversationSummary.stageDescription}
                      </p>
                    </div>

                    {/* Main Conversation Summary & Key Points */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
                      <div className="lg:col-span-2 p-3 rounded-xl bg-white dark:bg-neutral-800/90 border border-neutral-200/80 dark:border-neutral-700/80 space-y-2">
                        <div className="text-[11px] font-extrabold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-[#7F22FE]" />
                          <span>Conversation Summary:</span>
                        </div>
                        <p className="text-xs text-neutral-700 dark:text-neutral-200 leading-relaxed">
                          {conversationSummary.summaryText}
                        </p>
                        {conversationSummary.keyPoints.length > 0 && (
                          <ul className="space-y-1 pt-1 border-t border-neutral-100 dark:border-neutral-700/60">
                            {conversationSummary.keyPoints.map((pt, idx) => (
                              <li
                                key={idx}
                                className="text-[11px] text-neutral-600 dark:text-neutral-300 flex items-start gap-1.5"
                              >
                                <span className="text-[#7F22FE] font-bold mt-0.5">•</span>
                                <span>{pt}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Extracted Details & Recommended Next Action */}
                      <div className="p-3 rounded-xl bg-white dark:bg-neutral-800/90 border border-neutral-200/80 dark:border-neutral-700/80 space-y-2 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <div className="text-[11px] font-extrabold text-neutral-800 dark:text-neutral-200">
                            Detected Customer Info:
                          </div>
                          <div className="text-[11px] text-neutral-600 dark:text-neutral-300 space-y-1">
                            <div>
                              <span className="font-bold text-neutral-500">Topic / Intent: </span>
                              <span className="font-semibold text-neutral-900 dark:text-white">
                                {conversationSummary.customerIntent}
                              </span>
                            </div>
                            <div>
                              <span className="font-bold text-neutral-500">Phone Number: </span>
                              <span className="font-mono font-semibold text-neutral-900 dark:text-white">
                                {conversationSummary.extractedPhone || 'Not provided yet'}
                              </span>
                            </div>
                            <div>
                              <span className="font-bold text-neutral-500">Address: </span>
                              <span className="text-neutral-800 dark:text-neutral-200">
                                {conversationSummary.extractedAddress || 'Not provided yet'}
                              </span>
                            </div>
                            <div>
                              <span className="font-bold text-neutral-500">Message Count: </span>
                              <span>
                                Total {conversationSummary.stats.totalMessages} (Customer:{' '}
                                {conversationSummary.stats.customerMessages}, AI:{' '}
                                {conversationSummary.stats.aiReplies})
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-700/60">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-0.5">
                            Recommended Next Action:
                          </span>
                          <p className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-200">
                            {conversationSummary.nextAction}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* Messages Thread Container */}
            <div
              ref={threadContainerRef}
              className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 space-y-3.5 bg-neutral-50/50 dark:bg-neutral-950/40"
            >
              {/* Date Divider + Compact Summarize Button */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-white/90 dark:bg-neutral-900/90 border border-neutral-200/70 dark:border-neutral-800 rounded-xl px-3 py-1.5 shadow-2xs">
                <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                  Conversation History · {selectedConv.messages.length} Messages Synced
                </span>
                <button
                  type="button"
                  onClick={handleSummarizeConversation}
                  disabled={summarizing}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-100 hover:bg-[#7F22FE] text-[#7F22FE] hover:text-white dark:bg-violet-950/80 dark:text-purple-300 dark:hover:bg-[#7F22FE] dark:hover:text-white text-[11px] font-bold transition-all cursor-pointer"
                >
                  <FileText className="w-3 h-3" />
                  <span>{summarizing ? 'Summarizing...' : 'Summarize'}</span>
                </button>
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
                    {/* Customer Avatar for Inbound */}
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
                        {/* Sender Header inside Outbound Bubble */}
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
                                  <span>Merchant Agent</span>
                                </>
                              )}
                            </span>
                            {m.is_ai_reply && (
                              <span className="flex items-center gap-1.5 opacity-90 font-normal">
                                {m.requires_human_attention && (
                                  <span className="text-amber-300 font-bold flex items-center gap-0.5">
                                    <AlertCircle className="w-2.5 h-2.5 text-amber-300" />
                                    Hold / Needs Review
                                  </span>
                                )}
                                <span className="opacity-75">Auto-Replied</span>
                              </span>
                            )}
                          </div>
                        )}

                        {/* Attached Product Photo or Sent Image */}
                        {(m.has_image || m.image_url || m.image_base64) && (
                          <div className="mb-2.5">
                            <div
                              onClick={() =>
                                setPreviewImageUrl(
                                  m.image_url ||
                                    (m.image_base64
                                      ? `data:${m.image_mime_type || 'image/jpeg'};base64,${m.image_base64}`
                                      : null)
                                )
                              }
                              className="relative group rounded-xl overflow-hidden cursor-pointer border border-white/20 dark:border-neutral-700 shadow-xs max-w-xs"
                            >
                              <img
                                src={
                                  m.image_url ||
                                  (m.image_base64
                                    ? `data:${m.image_mime_type || 'image/jpeg'};base64,${m.image_base64}`
                                    : '')
                                }
                                alt="Attachment"
                                className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                                <ImageIcon className="w-4 h-4" />
                                Click to Enlarge
                              </div>
                            </div>
                            <span className="text-[10px] opacity-80 block mt-1">
                              {isOutbound
                                ? m.is_ai_reply
                                  ? 'Official Product Photo Attached by AI'
                                  : 'Sent Photo'
                                : 'Customer Sent Product Picture'}
                            </span>
                          </div>
                        )}

                        {/* Attached Video */}
                        {m.has_video && m.video_base64 && (
                          <div className="mb-2.5">
                            <video
                              controls
                              className="w-full max-w-xs max-h-56 rounded-xl border border-white/20 dark:border-neutral-700 bg-black"
                              src={`data:${m.video_mime_type || 'video/mp4'};base64,${m.video_base64}`}
                            />
                            <span className="text-[10px] opacity-80 block mt-1">
                              {isOutbound ? 'Sent Video' : 'Customer Sent Video'}
                            </span>
                          </div>
                        )}

                        {/* Voice Message & Audio Player (Both Inbound and Outbound) */}
                        {m.has_voice && (
                          <div className="mb-2">
                            <div
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                                isOutbound
                                  ? 'bg-white/15 dark:bg-neutral-800/30 text-current'
                                  : 'bg-[#7F22FE]/10 text-[#7F22FE]'
                              }`}
                            >
                              <Mic className="w-3.5 h-3.5 animate-pulse" />
                              <span>Voice Message</span>
                            </div>

                            {m.audio_base64 && (
                              <div className="mt-2 mb-1">
                                <audio
                                  controls
                                  className="h-8 w-56 sm:w-64 max-w-full rounded-md"
                                  src={`data:${m.audio_mime_type || 'audio/ogg'};base64,${m.audio_base64}`}
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Audio Transcription Block */}
                        {!isOutbound && m.transcription && (
                          <div className="text-[11px] bg-neutral-100 dark:bg-neutral-700/60 p-2.5 rounded-xl text-neutral-700 dark:text-neutral-200 mb-2 border-l-2 border-[#7F22FE]">
                            <span className="font-bold text-neutral-500 dark:text-neutral-400 block text-[10px] mb-0.5">
                              AI Voice Transcript:
                            </span>
                            <span>"{m.transcription}"</span>
                          </div>
                        )}

                        {/* Message Text */}
                        <p className="whitespace-pre-wrap">{m.message_text}</p>

                        {/* Interactive List Button (☰ পছন্দ করুন) & Interactive Action Buttons (Order Now, আরও দেখুন, হোম পেজ) — Only for E-Commerce messages with interactive_options */}
                        {isOutbound && m.interactive_options && (
                          <div className="mt-3 pt-2.5 border-t border-white/20 space-y-2">
                            {(m.interactive_options.listItems || m.interactive_options.items) &&
                              (m.interactive_options.listItems || m.interactive_options.items)!.length > 0 && (
                                <div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const listArr =
                                        m.interactive_options?.listItems ||
                                        m.interactive_options?.items ||
                                        [];
                                      if (openInteractiveMsgId === m.id) {
                                        setOpenInteractiveMsgId(null);
                                      } else {
                                        setOpenInteractiveMsgId(m.id);
                                        setSelectedInteractiveItem(listArr[0]?.title || '');
                                      }
                                    }}
                                    className="w-full py-2 px-3 rounded-xl bg-black/25 hover:bg-black/35 text-emerald-300 font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/15"
                                  >
                                    <span className="text-sm leading-none">☰</span>
                                    <span>
                                      {m.interactive_options.listButtonTitle ||
                                        m.interactive_options.listButtonLabel ||
                                        'পছন্দ করুন'}
                                    </span>
                                  </button>

                                  {openInteractiveMsgId === m.id && (
                                    <div className="mt-2 rounded-xl bg-[#182229] text-white border border-emerald-500/40 overflow-hidden shadow-xl">
                                      <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between text-xs font-bold">
                                        <button
                                          type="button"
                                          onClick={() => setOpenInteractiveMsgId(null)}
                                          className="text-neutral-400 hover:text-white cursor-pointer"
                                        >
                                          ✕
                                        </button>
                                        <span>{m.interactive_options.listSectionTitle || 'পছন্দ করুন'}</span>
                                        <span className="w-3" />
                                      </div>
                                      <div className="divide-y divide-white/5 max-h-48 overflow-y-auto">
                                        {(
                                          m.interactive_options.listItems ||
                                          m.interactive_options.items ||
                                          []
                                        ).map((item, idx) => {
                                          const isSel = selectedInteractiveItem === item.title;
                                          return (
                                            <label
                                              key={item.id || idx}
                                              onClick={() => setSelectedInteractiveItem(item.title)}
                                              className="px-3 py-2.5 flex items-center justify-between gap-2 hover:bg-white/5 cursor-pointer"
                                            >
                                              <div>
                                                <div className="text-xs font-bold text-white">{item.title}</div>
                                                {item.description && (
                                                  <div className="text-[10px] text-neutral-400">{item.description}</div>
                                                )}
                                              </div>
                                              <span
                                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                                  isSel ? 'border-[#00A884]' : 'border-neutral-500'
                                                }`}
                                              >
                                                {isSel && <span className="w-2 h-2 rounded-full bg-[#00A884]" />}
                                              </span>
                                            </label>
                                          );
                                        })}
                                      </div>
                                      <div className="px-3 py-2 bg-[#202C33] border-t border-white/10 flex items-center justify-between">
                                        <span className="text-[11px] text-neutral-300 truncate">
                                          {selectedInteractiveItem}
                                        </span>
                                        <button
                                          type="button"
                                          disabled={!selectedInteractiveItem || simulating}
                                          onClick={() =>
                                            handleSimulateInteractiveOptionClick(selectedInteractiveItem)
                                          }
                                          className="w-8 h-8 rounded-full bg-[#00A884] hover:bg-[#029072] text-neutral-950 font-black flex items-center justify-center shadow-sm cursor-pointer"
                                          title="Simulate Customer Selecting This Option"
                                        >
                                          ➤
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                            {m.interactive_options.buttons && m.interactive_options.buttons.length > 0 && (
                              <div className="flex flex-col gap-1.5">
                                {m.interactive_options.buttons.map((btn, idx) => {
                                  const cleanLabel = String(btn.label || '').replace(/^[🛒↩️🏠☰📞\s]+/u, '');
                                  return (
                                    <button
                                      key={btn.id || idx}
                                      type="button"
                                      disabled={simulating}
                                      onClick={() =>
                                        handleSimulateInteractiveOptionClick(btn.payload || cleanLabel)
                                      }
                                      className="w-full py-1.5 px-3 rounded-xl bg-black/25 hover:bg-black/35 text-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-white/15"
                                      title="Click to simulate customer tapping this button"
                                    >
                                      {btn.icon === 'back' && <span>↩️</span>}
                                      {btn.icon === 'home' && <span>🏠</span>}
                                      {btn.icon === 'order' && <span>🛒</span>}
                                      {btn.icon === 'list' && <span>☰</span>}
                                      <span>{cleanLabel}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Timestamp & Delivery Status */}
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

            {/* Composer Footer (Pinned at bottom, direct Picture/Video upload + WhatsApp-style Voice send) */}
            <div className="border-t border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 sm:px-4 py-2.5 space-y-2 shrink-0">
              {/* Toast notification inside composer if needed */}
              {inboxToast && (
                <div className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-[11px] font-semibold text-rose-700 dark:text-rose-300 flex items-center justify-between">
                  <span>{inboxToast}</span>
                  <button
                    type="button"
                    onClick={() => setInboxToast(null)}
                    className="text-rose-500 hover:text-rose-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Selected Device Picture / Video Preview Strip */}
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

              {/* Hidden file input for direct Device Storage Picture or Video selection */}
              <input
                ref={replyMediaInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleSelectReplyMedia}
                className="hidden"
              />

              {isReplyRecording ? (
                /* WhatsApp-Style Live Voice Recording Bar */
                <div className="flex items-center justify-between gap-2 bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/70 px-3 py-2 rounded-xl">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping shrink-0" />
                    <Mic className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span className="text-xs font-extrabold font-mono text-rose-700 dark:text-rose-300">
                      {Math.floor(replyRecordingSeconds / 60)}:
                      {String(replyRecordingSeconds % 60).padStart(2, '0')}
                    </span>
                    <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 truncate">
                      Recording voice for {selectedConv.platform}...
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleCancelReplyVoice}
                      className="p-2 rounded-xl bg-white dark:bg-neutral-800 text-neutral-500 hover:text-rose-600 border border-neutral-200 dark:border-neutral-700 transition-colors cursor-pointer"
                      title="Cancel voice recording"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleSendReplyVoice}
                      disabled={sendingReply}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      title="Send Voice Message"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Voice</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Standard Reply Form with Direct Device Picture/Video Picker & Voice Button */
                <form onSubmit={handleSendReply} className="flex gap-1.5 sm:gap-2 items-center">
                  <button
                    id="direct-media-upload-btn"
                    type="button"
                    onClick={() => replyMediaInputRef.current?.click()}
                    disabled={sendingReply}
                    className="p-2 sm:p-2.5 rounded-xl border border-neutral-200/90 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:text-[#7F22FE] hover:border-[#7F22FE]/40 hover:bg-violet-50/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
                    title="Send Picture or Video from device storage"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>

                  <button
                    id="direct-voice-record-btn"
                    type="button"
                    onClick={handleStartReplyVoice}
                    disabled={sendingReply}
                    className="p-2 sm:p-2.5 rounded-xl border border-neutral-200/90 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:text-emerald-600 hover:border-emerald-500/40 hover:bg-emerald-50/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
                    title="Record & send voice message (WhatsApp / Messenger / Instagram)"
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  <input
                    id="manual-reply-input"
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
                    id="manual-reply-send-btn"
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
              Select a customer thread from the left list or simulate an incoming inquiry to test AI responses.
            </p>
          </div>
        )}
      </div>

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

      {/* Simulator Modal Drawer */}
      {showSimulateDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-lg p-6 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-neutral-900 dark:text-white flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#7F22FE]/10 text-[#7F22FE] flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span>Simulate Customer Inbound Inquiry</span>
              </h3>
              <button
                onClick={() => setShowSimulateDrawer(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Test customer queries via text, voice notes, or product photos. The AI Auto-Reply engine will automatically identify the product, send official images, and provide pricing!
            </p>

            {inboxToast && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                {inboxToast}
              </div>
            )}

            {/* Mode Switcher: Text vs Voice vs Product Image */}
            <div className="grid grid-cols-3 gap-1 rounded-2xl bg-neutral-100 dark:bg-neutral-800 p-1">
              <button
                type="button"
                onClick={() => setSimMode('text')}
                className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  simMode === 'text'
                    ? 'bg-white dark:bg-neutral-700 text-[#7F22FE] dark:text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Text Inquiry
              </button>
              <button
                type="button"
                onClick={() => setSimMode('voice')}
                className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  simMode === 'voice'
                    ? 'bg-[#7F22FE] text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                Voice Note
              </button>
              <button
                type="button"
                onClick={() => setSimMode('image')}
                className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  simMode === 'image'
                    ? 'bg-[#7F22FE] text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Product Picture
              </button>
            </div>

            <form onSubmit={handleSimulateInbound} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Channel Platform
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSimPlatform('whatsapp')}
                    className={`py-2 px-2 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      simPlatform === 'whatsapp'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold'
                        : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimPlatform('messenger')}
                    className={`py-2 px-2 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      simPlatform === 'messenger'
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300 font-bold'
                        : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <Facebook className="w-3.5 h-3.5" />
                    Messenger
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimPlatform('instagram')}
                    className={`py-2 px-2 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      simPlatform === 'instagram'
                        ? 'bg-pink-50 dark:bg-pink-950/60 border-pink-500 text-pink-700 dark:text-pink-300 font-bold'
                        : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    Instagram
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={simCustomerName}
                    onChange={(e) => setSimCustomerName(e.target.value)}
                    placeholder="e.g. Tanvir Ahmed"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-200/80 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Phone or PSID
                  </label>
                  <input
                    type="text"
                    value={simCustomerId}
                    onChange={(e) => setSimCustomerId(e.target.value)}
                    placeholder={simPlatform === 'whatsapp' ? '+8801711998877' : 'psid_49201948'}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-200/80 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Mode: TEXT */}
              {simMode === 'text' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Message Body
                    </label>
                    <span className="text-[11px] text-neutral-400">
                      Ask for picture or price to test AI!
                    </span>
                  </div>
                  <textarea
                    required
                    rows={3}
                    value={simMessage}
                    onChange={(e) => setSimMessage(e.target.value)}
                    placeholder="e.g. Please send me a picture of your wireless earbuds and tell me the price."
                    className="w-full text-xs p-3 rounded-xl border border-neutral-200/80 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  />
                  <div className="mt-1 flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => setSimMessage('Please send me a picture of your earbuds and tell me the price.')}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-[#7F22FE] cursor-pointer"
                    >
                      "Send earbuds picture"
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimMessage('Can you show me the smartwatch photo? How much is it?')}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-[#7F22FE] cursor-pointer"
                    >
                      "Smartwatch picture"
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimMessage('I want to place an order. How do I pay?')}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-[#7F22FE] cursor-pointer"
                    >
                      "Order inquiry"
                    </button>
                  </div>
                </div>
              )}

              {/* Mode: VOICE */}
              {simMode === 'voice' && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                      Record or Upload Audio Voice Note
                    </span>
                    {simAudioBase64 && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                        ✓ Audio Ready
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!isRecording ? (
                      <button
                        type="button"
                        onClick={handleStartRecording}
                        className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                      >
                        <Mic className="w-3.5 h-3.5" />
                        Record Voice Note
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStopRecording}
                        className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer animate-pulse"
                      >
                        <MicOff className="w-3.5 h-3.5 text-rose-400" />
                        Stop Recording ({recordingSeconds}s)
                      </button>
                    )}

                    <label className="px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Upload Audio File</span>
                      <input
                        type="file"
                        accept="audio/*,.ogg,.mp3,.wav,.m4a,.webm"
                        onChange={handleAudioUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {simAudioBase64 && (
                    <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700">
                      <audio
                        controls
                        className="h-8 w-full"
                        src={`data:${simAudioMime};base64,${simAudioBase64}`}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Mode: PRODUCT IMAGE / PHOTO */}
              {simMode === 'image' && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                      Select or Upload Product Picture
                    </span>
                    {(simImageBase64 || simImageUrl) && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                        ✓ Image Selected
                      </span>
                    )}
                  </div>

                  {/* Quick Product Pickers */}
                  <div className="grid grid-cols-2 gap-2">
                    {sampleProducts.map((p) => (
                      <div
                        key={p.name}
                        onClick={() => {
                          setSimImageUrl(p.image);
                          setSimImageBase64(null);
                          setSimMessage(`What is the price of this ${p.name}?`);
                        }}
                        className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                          simImageUrl === p.image
                            ? 'border-[#7F22FE] bg-[#7F22FE]/10 ring-2 ring-[#7F22FE]/30'
                            : 'border-neutral-200 dark:border-neutral-700 hover:border-[#7F22FE]/50'
                        }`}
                      >
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-10 h-10 object-cover rounded-lg shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-neutral-900 dark:text-white truncate">
                            {p.name}
                          </p>
                          <p className="text-[10px] text-[#7F22FE] font-semibold">
                            {p.price} BDT
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Custom Upload */}
                  <div className="pt-2 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-700">
                    <label className="px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Upload Custom Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>

                    {simImageUrl && (
                      <span className="text-[10px] text-neutral-500 truncate max-w-xs">
                        Preset selected
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Customer Inquiry Text
                    </label>
                    <input
                      type="text"
                      value={simMessage}
                      onChange={(e) => setSimMessage(e.target.value)}
                      placeholder="e.g. What is the price of this and do you have it in stock?"
                      className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-200/80 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSimulateDrawer(false)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="submit-simulated-message-btn"
                  type="submit"
                  disabled={
                    simulating ||
                    (simMode === 'text' && !simMessage.trim()) ||
                    (simMode === 'voice' && !simAudioBase64) ||
                    (simMode === 'image' && !simImageBase64 && !simImageUrl)
                  }
                  className="px-4 py-2 rounded-xl bg-[#7F22FE] hover:bg-[#6c1ce0] disabled:opacity-50 text-white text-xs font-bold shadow-sm shadow-[#7F22FE]/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {simulating ? 'AI Processing & Replying...' : 'Send Simulation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
