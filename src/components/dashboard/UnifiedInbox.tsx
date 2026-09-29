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
  X
} from 'lucide-react';
import { api } from '../../api';
import { Conversation, ConversationSummaryResult, Channel, Product } from '../../types';
import { BrowserAudioRecorder, blobToBase64 } from '../../utils/audioRecorder';

interface UnifiedInboxProps {
  channels: Channel[];
  onNavigate?: (tab: string) => void;
}

type CategoryTab = 'all' | 'orders' | 'delivered' | 'new_customer';

export const UnifiedInbox: React.FC<UnifiedInboxProps> = ({ channels, onNavigate }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvKey, setSelectedConvKey] = useState<string | null>(null);
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

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [inboxToast, setInboxToast] = useState<string | null>(null);
  const audioRecorderRef = useRef<BrowserAudioRecorder | null>(null);
  const recordTimerRef = useRef<any>(null);

  // Image preview modal
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Conversation Summarize state
  const [conversationSummary, setConversationSummary] = useState<ConversationSummaryResult | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [showSummaryPanel, setShowSummaryPanel] = useState(false);

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

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConv || !replyText.trim() || sendingReply) return;

    try {
      setSendingReply(true);
      const text = replyText.trim();
      setReplyText('');

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

  const getPlatformIcon = (platform: 'whatsapp' | 'messenger' | 'instagram', className = 'w-3 h-3') => {
    if (platform === 'whatsapp') return <Smartphone className={className} />;
    if (platform === 'messenger') return <Facebook className={className} />;
    return <Instagram className={className} />;
  };

  const getPlatformBadgeStyle = (platform: 'whatsapp' | 'messenger' | 'instagram') => {
    if (platform === 'whatsapp') return 'bg-emerald-500 text-white';
    if (platform === 'messenger') return 'bg-blue-600 text-white';
    return 'bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 text-white';
  };

  const aiReplyCountInThread = selectedConv
    ? selectedConv.messages.filter((m) => m.is_ai_reply).length
    : 0;

  return (
    <div className="h-[calc(100vh-110px)] sm:h-[calc(100vh-128px)] min-h-[540px] sm:min-h-[620px] rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-sm flex flex-col md:flex-row overflow-hidden">
      {/* =====================================================================
          PANE 1: LEFT CONVERSATIONS SIDEBAR
      ===================================================================== */}
      <div
        className={`${
          mobileShowThread ? 'hidden md:flex' : 'flex'
        } w-full md:w-80 lg:w-[330px] flex-1 md:flex-none border-b md:border-b-0 md:border-r border-neutral-200/80 dark:border-neutral-800 flex-col shrink-0 bg-neutral-50/50 dark:bg-neutral-900/60`}
      >
        {/* Sidebar Top Header */}
        <div className="p-4 border-b border-neutral-200/80 dark:border-neutral-800 space-y-3 bg-white dark:bg-neutral-900">
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
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0 ${
                filterPlatform === 'whatsapp'
                  ? 'bg-emerald-600 text-white'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              WhatsApp
            </button>
            <button
              onClick={() => setFilterPlatform('messenger')}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0 ${
                filterPlatform === 'messenger'
                  ? 'bg-blue-600 text-white'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Messenger
            </button>
            <button
              onClick={() => setFilterPlatform('instagram')}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0 ${
                filterPlatform === 'instagram'
                  ? 'bg-pink-600 text-white'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
              Instagram
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
                  {/* Avatar with Platform Corner Badge */}
                  <div className="relative shrink-0 mt-0.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-extrabold ${
                        isSelected
                          ? 'bg-[#7F22FE] text-white shadow-sm shadow-[#7F22FE]/25'
                          : 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200'
                      }`}
                    >
                      {c.customerName.charAt(0).toUpperCase()}
                    </div>
                    <span
                      className={` -bottom-1 -right-1 absolute w-4.5 h-4.5 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-neutral-900 ${getPlatformBadgeStyle(
                        c.platform
                      )}`}
                    >
                      {getPlatformIcon(c.platform, 'w-2.5 h-2.5')}
                    </span>
                  </div>

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
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] font-semibold">
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
                      <span className="text-neutral-400 capitalize">{c.platform}</span>
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
        } flex-1 flex-col min-w-0 bg-white dark:bg-neutral-900`}
      >
        {selectedConv ? (
          <>
            {/* Thread Header */}
            <div className="px-3.5 sm:px-5 py-3 sm:py-3.5 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between gap-2 bg-white dark:bg-neutral-900">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setMobileShowThread(false)}
                  className="md:hidden px-2.5 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-xs font-bold shrink-0 cursor-pointer"
                >
                  ← Chats
                </button>
                <div className="relative shrink-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-xs ${getPlatformBadgeStyle(
                      selectedConv.platform
                    )}`}
                  >
                    {selectedConv.customerName.charAt(0).toUpperCase()}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-neutral-900" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white truncate">
                      {selectedConv.customerName}
                    </h3>
                    <span className="text-neutral-300 dark:text-neutral-700">·</span>
                    <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 capitalize">
                      {selectedConv.platform}
                    </span>
                    {selectedConv.orderCategory === 'orders' && (
                      <span className="text-[11px] font-bold text-[#7F22FE] dark:text-purple-400 flex items-center gap-1">
                        · <ShoppingBag className="w-3 h-3" /> Order Confirmed
                      </span>
                    )}
                    {selectedConv.orderCategory === 'delivered' && (
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        · <CheckCircle2 className="w-3 h-3" /> Delivered
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                    <span className="font-mono">{selectedConv.customerId}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyCustomerId(selectedConv.customerId)}
                      className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                      title="Copy Customer ID / Phone"
                    >
                      {copiedId ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Header Controls */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  id="conversation-summarize-btn"
                  type="button"
                  onClick={handleSummarizeConversation}
                  disabled={summarizing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#7F22FE] to-violet-600 hover:from-[#6c1ce0] hover:to-violet-700 disabled:opacity-60 text-white text-[11px] sm:text-xs font-extrabold shadow-xs shadow-[#7F22FE]/25 transition-all cursor-pointer whitespace-nowrap"
                  title="এই কাস্টমারের সাথে কী কী কথা হয়েছে এবং কনভারসেশন কোন পর্যায়ে আছে তা এক ক্লিকে দেখুন"
                >
                  {summarizing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>{summarizing ? 'Summarizing...' : 'Conversation Summarize'}</span>
                </button>

                <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-50 dark:bg-violet-950/50 border border-violet-200/70 dark:border-violet-800/60 text-[#7F22FE] dark:text-purple-300 text-[11px] font-bold whitespace-nowrap">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>AI Auto-Reply Active</span>
                </div>
              </div>
            </div>

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
                        কাস্টমারের সাথে কী কথোপকথন হয়েছে এবং চ্যাটটি এখন কোন পর্যায়ে আছে তার বিস্তারিত রিপোর্ট
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
                    <span>কাস্টমারের সম্পূর্ণ চ্যাট বিশ্লেষণ করে সামারি ও বর্তমান পর্যায় তৈরি করা হচ্ছে...</span>
                  </div>
                ) : conversationSummary ? (
                  <div className="space-y-3">
                    {/* 4-Step Conversation Stage Progress Bar */}
                    <div className="p-3 rounded-xl bg-white dark:bg-neutral-800/90 border border-neutral-200/80 dark:border-neutral-700/80 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-neutral-500 dark:text-neutral-400">
                          কনভারসেশন পর্যায় (Current Stage):
                        </span>
                        <span className="text-[#7F22FE] dark:text-purple-300">
                          ধাপ {conversationSummary.stageStep}/৪ — {conversationSummary.stageLabel}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-1.5 text-[10px] font-bold">
                        {[
                          { step: 1, label: '১. নতুন জিজ্ঞাসা' },
                          { step: 2, label: '২. দাম ও আলোচনা' },
                          { step: 3, label: '৩. অর্ডারের তথ্য বাকি' },
                          {
                            step: 4,
                            label:
                              conversationSummary.stageKey === 'delivered'
                                ? '৪. ডেলিভারি সম্পন্ন'
                                : '৪. অর্ডার কনফার্মড'
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
                          <span>কী কী কথা হয়েছে (Conversation Summary):</span>
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
                            শনাক্তকৃত তথ্য ও চাহিদা:
                          </div>
                          <div className="text-[11px] text-neutral-600 dark:text-neutral-300 space-y-1">
                            <div>
                              <span className="font-bold text-neutral-500">আগ্রহের বিষয়: </span>
                              <span className="font-semibold text-neutral-900 dark:text-white">
                                {conversationSummary.customerIntent}
                              </span>
                            </div>
                            <div>
                              <span className="font-bold text-neutral-500">ফোন নাম্বার: </span>
                              <span className="font-mono font-semibold text-neutral-900 dark:text-white">
                                {conversationSummary.extractedPhone || 'এখনো দেয়নি'}
                              </span>
                            </div>
                            <div>
                              <span className="font-bold text-neutral-500">ঠিকানা: </span>
                              <span className="text-neutral-800 dark:text-neutral-200">
                                {conversationSummary.extractedAddress || 'এখনো দেয়নি'}
                              </span>
                            </div>
                            <div>
                              <span className="font-bold text-neutral-500">মেসেজ সংখ্যা: </span>
                              <span>
                                মোট {conversationSummary.stats.totalMessages}টি (কাস্টমার:{' '}
                                {conversationSummary.stats.customerMessages}, AI:{' '}
                                {conversationSummary.stats.aiReplies})
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-700/60">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-0.5">
                            পরবর্তী করণীয় (Next Action):
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
              className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4 bg-neutral-50/50 dark:bg-neutral-950/40"
            >
              {/* Date Divider */}
              <div className="flex items-center justify-center">
                <span className="text-[11px] font-medium text-neutral-400 px-3 py-1">
                  Conversation History · End-to-End Synced
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
                    {/* Customer Avatar for Inbound */}
                    {!isOutbound && (
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0 mb-4 ${getPlatformBadgeStyle(
                          selectedConv.platform
                        )}`}
                      >
                        {selectedConv.customerName.charAt(0).toUpperCase()}
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
                              <span className="opacity-75 font-normal">Auto-Replied</span>
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
                                alt="Product"
                                className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                                <ImageIcon className="w-4 h-4" />
                                Click to Enlarge
                              </div>
                            </div>
                            <span className="text-[10px] opacity-80 block mt-1">
                              {isOutbound
                                ? 'Official Product Photo Attached by AI'
                                : 'Customer Sent Product Picture'}
                            </span>
                          </div>
                        )}

                        {/* Inbound Voice Message & Audio Player */}
                        {!isOutbound && m.has_voice && (
                          <div className="mb-2">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#7F22FE]/10 text-[#7F22FE] text-xs font-semibold">
                              <Mic className="w-3.5 h-3.5 animate-pulse" />
                              <span>Voice Note</span>
                            </div>

                            {m.audio_base64 && (
                              <div className="mt-2 mb-1">
                                <audio
                                  controls
                                  className="h-8 w-full max-w-xs rounded-md"
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

            {/* Quick Reply Chips & Composer Footer */}
            <div className="border-t border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 sm:p-4 space-y-2.5">
              {/* Quick Replies Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider shrink-0 mr-1">
                  Quick Reply:
                </span>
                {quickReplies.map((qr, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setReplyText(qr.text)}
                    className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-violet-50 dark:hover:bg-violet-950/50 text-neutral-600 dark:text-neutral-300 hover:text-[#7F22FE] dark:hover:text-purple-300 text-[11px] font-semibold transition-colors cursor-pointer shrink-0 border border-transparent hover:border-[#7F22FE]/20"
                  >
                    {qr.label}
                  </button>
                ))}
              </div>

              {/* Manual Reply Form */}
              <form onSubmit={handleSendReply} className="flex gap-2 items-center">
                <button
                  type="button"
                  onClick={() => setShowSimulateDrawer(true)}
                  className="p-2.5 rounded-xl border border-neutral-200/90 dark:border-neutral-700 text-neutral-500 hover:text-[#7F22FE] hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
                  title="Simulate customer voice or photo message"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                <input
                  id="manual-reply-input"
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to ${selectedConv.customerName} on ${selectedConv.platform}...`}
                  className="flex-1 bg-neutral-50 dark:bg-neutral-800/90 text-neutral-900 dark:text-white text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-neutral-200/90 dark:border-neutral-700 focus:outline-hidden focus:bg-white dark:focus:bg-neutral-800 focus:ring-2 focus:ring-[#7F22FE]/30 focus:border-[#7F22FE] transition-all"
                />

                <button
                  id="manual-reply-send-btn"
                  type="submit"
                  disabled={!replyText.trim() || sendingReply}
                  className="px-4 py-2.5 rounded-xl bg-[#7F22FE] hover:bg-[#6c1ce0] disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-[#7F22FE]/25 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
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
