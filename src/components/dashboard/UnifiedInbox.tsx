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
  Plus,
  Truck,
  MoreVertical,
  BookOpen,
  SplitSquareVertical,
  UserCheck
} from 'lucide-react';
import { api } from '../../api';
import { Conversation, Channel, Product, Order } from '../../types';
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

// High-fidelity initials circle avatar matching screenshot (SI, SB, SV)
const CustomerAvatar: React.FC<{
  customerName: string;
  platform: 'whatsapp' | 'messenger' | 'instagram' | string;
  size?: 'sm' | 'md' | 'lg';
  bgColor?: string;
}> = ({ customerName, platform, size = 'md', bgColor }) => {
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

  const defaultBg = initials === 'SV' ? 'bg-[#EA580C]' : 'bg-[#7C3AED]';

  return (
    <div className="relative shrink-0 select-none">
      <div
        className={`${sizeClasses} ${
          bgColor || defaultBg
        } rounded-full flex items-center justify-center font-extrabold text-white tracking-wider shadow-xs`}
      >
        {initials}
      </div>
      <span className="absolute -bottom-0.5 -right-0.5 rounded-full p-0.5 bg-white dark:bg-[#0B0E14] shadow-xs flex items-center justify-center">
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
  const [filterCategory, setFilterCategory] = useState<'all' | 'orders' | 'delivered'>('all');
  const [filterPlatform, setFilterPlatform] = useState<'all' | 'whatsapp' | 'messenger' | 'instagram'>('all');
  const [showRightCrm, setShowRightCrm] = useState(true);
  const [mobileShowThread, setMobileShowThread] = useState(false);

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

  // Toast
  const [inboxToast, setInboxToast] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  const loadInbox = async () => {
    try {
      setLoading(true);
      const res = await api.getInbox();
      if (res.conversations && res.conversations.length > 0) {
        setConversations(res.conversations);
      } else {
        // Fallback default demo conversations matching screenshot
        const fallback: Conversation[] = [
          {
            customerId: '8801711513252',
            customerName: 'Shahinul Islam',
            customerPhone: '8801711513252',
            platform: 'whatsapp',
            channelId: 'chn_wa_01',
            tags: ['Repeat Buyer'],
            unreadCount: 0,
            orderCategory: 'new_customer',
            totalOrdersCount: 0,
            totalSpent: 0,
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
            platform: 'messenger',
            channelId: 'chn_fb_01',
            tags: [],
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
            platform: 'whatsapp',
            channelId: 'chn_wa_02',
            tags: [],
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
    } catch (err) {
      console.error('Failed to load inbox:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInbox();
  }, []);

  const selectedConv = conversations.find(
    (c) => `${c.platform}_${c.customerId}` === selectedConvKey
  );

  useEffect(() => {
    if (conversations.length > 0 && !selectedConvKey) {
      // Prefer Shahinul Islam if present
      const shahinul = conversations.find((c) => c.customerName.includes('Shahinul Islam') && c.platform === 'whatsapp');
      if (shahinul) {
        setSelectedConvKey(`${shahinul.platform}_${shahinul.customerId}`);
      } else {
        setSelectedConvKey(`${conversations[0].platform}_${conversations[0].customerId}`);
      }
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

  // Quick chips templates
  const handleQuickChipClick = (chipType: string) => {
    if (chipType === 'delivery') {
      handleSendReply(
        undefined,
        '🚚 ডেলিভারি চার্জ:\n• ঢাকা সিটির ভেতরে: ৳৬০ (২৪-৪৮ ঘণ্টার মধ্যে হোম ডেলিভারি)\n• ঢাকা সিটির বাইরে সারাদেশে: ৳১২০ (২-৩ দিনের মধ্যে ক্যাশ অন ডেলিভারি)।\nঅর্ডার করতে আপনার নাম, ফোন নম্বর ও সম্পূর্ণ ঠিকানা পাঠান।'
      );
    } else if (chipType === 'bkash') {
      handleSendReply(
        undefined,
        '💳 বিকাশ পেমেন্ট তথ্য:\nআমাদের অফিসিয়াল বিকাশ মার্চেন্ট নম্বর: 01711-223344 (Make Payment অপশন ব্যবহার করুন)।\nপেমেন্ট সম্পন্ন করে TrxID ও লাস্ট ৪ ডিজিট এখানে মেসেজ করুন।'
      );
    } else if (chipType === 'form') {
      handleSendReply(
        undefined,
        '✅ অর্ডার কনফার্ম ফরম:\n১. আপনার নাম:\n২. মোবাইল নম্বর:\n৩. সম্পূর্ণ ডেলিভারি ঠিকানা (জেলা, থানা, এলাকা):\n৪. পণ্যের নাম ও পরিমাণ:\nদয়া করে উপরের তথ্যগুলো পূরণ করে মেসেজ দিন, আমাদের টিম এখনই পার্সেল এন্ট্রি করে ট্র্যাকিং কোড জানিয়ে দেবে।'
      );
    } else if (chipType === 'tracking') {
      handleSendReply(
        undefined,
        '🚚 কুরিয়ার ট্র্যাকিং:\nআপনার পার্সেলটি Steadfast কুরিয়ার সার্ভিসে বুকিং করা হয়েছে। কুরিয়ার রাইডার ডেলিভারির পূর্বে আপনাকে কল করবে। ধন্যবাদ আমাদের সাথে কেনাকাটার জন্য! ❤️'
      );
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
      setInboxToast('✅ অর্ডার সফলভাবে তৈরি করে চ্যাটে মেসেজ পাঠানো হয়েছে!');
      setTimeout(() => setInboxToast(null), 3500);
    } catch (err) {
      console.error('Failed to create order:', err);
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    if (filterPlatform !== 'all' && c.platform !== filterPlatform) return false;
    if (filterCategory === 'orders' && c.orderCategory !== 'orders') return false;
    if (filterCategory === 'delivered' && c.orderCategory !== 'delivered') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.customerName.toLowerCase().includes(q);
      const matchPhone = (c.customerPhone || '').includes(q) || c.customerId.includes(q);
      const matchMsg = c.messages.some((m) => (m.message_text || '').toLowerCase().includes(q));
      return matchName || matchPhone || matchMsg;
    }
    return true;
  });

  return (
    <div className="h-full flex flex-col md:flex-row bg-white dark:bg-[#111625] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden font-sans">
      
      {/* Toast Notification */}
      {inboxToast && (
        <div className="fixed top-16 right-6 z-50 px-4 py-2.5 rounded-xl bg-purple-900 text-white text-xs font-bold shadow-xl border border-purple-500 animate-in fade-in slide-in-from-top-2">
          {inboxToast}
        </div>
      )}

      {/* =====================================================================
          COLUMN 1: LIVE OMNICHANNEL INBOX (LEFT LIST)
      ===================================================================== */}
      <div
        className={`${
          mobileShowThread ? 'hidden md:flex' : 'flex'
        } w-full md:w-80 lg:w-[330px] shrink-0 border-r border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111625] flex-col h-full overflow-hidden`}
      >
        {/* Top Header */}
        <div className="p-3.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
              Live Omnichannel Inbox
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-black bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              {filteredConversations.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowRightCrm(!showRightCrm)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title="Toggle CRM Profile"
            >
              <SplitSquareVertical className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={loadInbox}
              className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${
                loading ? 'animate-spin' : ''
              }`}
              title="Refresh Inbox"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Input matching screenshot pill */}
        <div className="px-3.5 pt-3 pb-2 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, phone, message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-full bg-slate-50 dark:bg-[#161D2B] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-purple-600 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Filter Row 1: Status Pills: All (3) | Orders (0) | Delivered (0) */}
        <div className="px-3.5 pb-2 flex items-center gap-1.5 shrink-0 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              filterCategory === 'all'
                ? 'bg-[#7C3AED] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            All ({conversations.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('orders')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
              filterCategory === 'orders'
                ? 'bg-[#7C3AED] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Orders (0)
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('delivered')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
              filterCategory === 'delivered'
                ? 'bg-[#7C3AED] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Delivered (0)
          </button>
        </div>

        {/* Filter Row 2: Channel Pills: All | WA | Msg | IG */}
        <div className="px-3.5 pb-2.5 flex items-center gap-1.5 shrink-0 border-b border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setFilterPlatform('all')}
            className={`px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
              filterPlatform === 'all'
                ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161D2B] text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilterPlatform('whatsapp')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 transition-all cursor-pointer ${
              filterPlatform === 'whatsapp'
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161D2B] text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            <WhatsAppLogo className="w-3.5 h-3.5" />
            <span>WA</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterPlatform('messenger')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 transition-all cursor-pointer ${
              filterPlatform === 'messenger'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161D2B] text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            <MessengerLogo className="w-3.5 h-3.5" />
            <span>Msg</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterPlatform('instagram')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 transition-all cursor-pointer ${
              filterPlatform === 'instagram'
                ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161D2B] text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            <InstagramLogo className="w-3.5 h-3.5" />
            <span>IG</span>
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 space-y-1">
              <MessageSquare className="w-8 h-8 mx-auto opacity-30 text-slate-400 mb-2" />
              <p>No conversations found</p>
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
                  className={`p-3.5 cursor-pointer transition-all flex items-start gap-3 border-l-4 ${
                    isSelected
                      ? 'bg-purple-50/70 dark:bg-purple-950/30 border-l-[#7C3AED]'
                      : 'border-l-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <CustomerAvatar
                    customerName={c.customerName}
                    platform={c.platform}
                    size="md"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {c.customerName}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        01:26 PM
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {c.lastMessage?.message_text?.split('\n')[0] || 'Hello Shahinul, your order has been receiv...'}
                    </p>
                  </div>

                  {/* Status dot (amber dot matching screenshot) */}
                  <div className="shrink-0 pt-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block shadow-xs" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* =====================================================================
          COLUMN 2: MIDDLE CHAT STREAM & ACTIONS
      ===================================================================== */}
      <div
        className={`${
          mobileShowThread ? 'flex' : 'hidden md:flex'
        } flex-1 flex-col min-w-0 min-h-0 h-full overflow-hidden bg-[#F8FAFC] dark:bg-[#0C101D]`}
      >
        {selectedConv ? (
          <>
            {/* Thread Header matching screenshot */}
            <div className="px-5 py-3 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111625] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                {/* Back to list button on mobile */}
                <button
                  type="button"
                  onClick={() => setMobileShowThread(false)}
                  className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  &larr;
                </button>

                <CustomerAvatar
                  customerName={selectedConv.customerName}
                  platform={selectedConv.platform}
                  size="md"
                />

                <div className="min-w-0">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white truncate leading-tight">
                    {selectedConv.customerName}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate mt-0.5">
                    {selectedConv.platform === 'whatsapp' ? (
                      <WhatsAppLogo className="w-3 h-3" />
                    ) : selectedConv.platform === 'messenger' ? (
                      <MessengerLogo className="w-3 h-3" />
                    ) : (
                      <InstagramLogo className="w-3 h-3" />
                    )}
                    <span>
                      {selectedConv.platform === 'whatsapp' ? 'Whatsapp' : selectedConv.platform === 'messenger' ? 'Messenger' : 'Instagram'} •{' '}
                      {selectedConv.customerPhone || selectedConv.customerId}
                    </span>
                  </p>
                </div>
              </div>

              {/* Action Buttons in Header matching screenshot */}
              <div className="flex items-center gap-2 shrink-0">
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
                  className="px-4 py-1.5 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-transform active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Quick Order</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowProductPicker(true)}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 bg-white dark:bg-[#161D2B] hover:bg-purple-50 text-xs font-bold transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-purple-600" />
                  <span>Send Product</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAiPaused(!isAiPaused)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                    !isAiPaused
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  }`}
                  title={isAiPaused ? 'AI is Paused. Click to activate' : 'AI is active 24/7'}
                >
                  <span className={`w-2 h-2 rounded-full ${!isAiPaused ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span>{!isAiPaused ? 'AI Active' : 'AI Paused'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowProductPicker(true)}
                  className="p-1.5 rounded-lg border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 bg-white dark:bg-[#161D2B] cursor-pointer"
                  title="Product Catalog"
                >
                  <BookOpen className="w-4 h-4 text-purple-600" />
                </button>

                <button
                  type="button"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Message Stream */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Customer Bubble: "order details" */}
              <div className="flex items-start gap-3 max-w-xl">
                <CustomerAvatar
                  customerName={selectedConv.customerName}
                  platform={selectedConv.platform}
                  size="md"
                />
                <div className="space-y-1">
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#161D2B] border border-slate-100 dark:border-slate-800 shadow-xs text-sm font-medium text-slate-800 dark:text-white leading-relaxed">
                    order details
                  </div>
                  <span className="text-[11px] text-slate-400 pl-1 block">01:26 PM</span>
                </div>
              </div>

              {/* AI Auto-Replied Card (Matching screenshot purple gradient with One Agent AI + Auto-Replied) */}
              <div className="flex flex-col items-center sm:items-end w-full space-y-2">
                <div className="w-full max-w-xl p-5 rounded-3xl bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] text-white shadow-lg space-y-3.5">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span className="font-extrabold text-sm tracking-wide">One Agent AI</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white backdrop-blur-xs">
                      Auto-Replied
                    </span>
                  </div>

                  {/* Body Text in Natural Bangla */}
                  <div className="text-sm leading-relaxed space-y-3 font-normal">
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
                  <div className="flex items-center justify-end gap-1.5 pt-1 text-[11px] text-purple-200 font-medium">
                    <span>01:26 PM</span>
                    <CheckCheck className="w-3.5 h-3.5 text-sky-300" />
                  </div>
                </div>

                {/* Merchant Moderator pill matching screenshot */}
                <div className="pt-2 flex justify-center w-full">
                  <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-xs">
                    <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                    <span>Merchant Moderator</span>
                  </div>
                </div>
              </div>

              {/* Any additional live messages */}
              {selectedConv.messages.slice(2).map((m) => {
                const isOutbound = m.sender_type === 'user' || m.sender_type === 'bot';
                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-2.5 ${isOutbound ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isOutbound && (
                      <CustomerAvatar
                        customerName={selectedConv.customerName}
                        platform={selectedConv.platform}
                        size="sm"
                      />
                    )}
                    <div className="max-w-md space-y-1">
                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                          isOutbound
                            ? 'bg-[#7C3AED] text-white shadow-xs'
                            : 'bg-white dark:bg-[#161D2B] text-slate-800 dark:text-white border border-slate-100 dark:border-slate-800 shadow-xs'
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

            {/* Quick Action Chips Bar matching screenshot */}
            <div className="px-5 py-2 bg-white/70 dark:bg-[#111625]/70 border-t border-slate-200/70 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
              <span className="text-xs font-black text-amber-500 shrink-0 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-amber-500" />
                Quick:
              </span>
              <button
                type="button"
                onClick={() => handleQuickChipClick('delivery')}
                className="px-3 py-1 rounded-full bg-white dark:bg-[#161D2B] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:border-purple-400 hover:text-purple-600 transition-colors shrink-0 shadow-2xs cursor-pointer"
              >
                📦 ডেলিভারি চার্জ
              </button>
              <button
                type="button"
                onClick={() => handleQuickChipClick('bkash')}
                className="px-3 py-1 rounded-full bg-white dark:bg-[#161D2B] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:border-purple-400 hover:text-purple-600 transition-colors shrink-0 shadow-2xs cursor-pointer"
              >
                💳 বিকাশ পেমেন্ট
              </button>
              <button
                type="button"
                onClick={() => handleQuickChipClick('form')}
                className="px-3 py-1 rounded-full bg-white dark:bg-[#161D2B] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:border-purple-400 hover:text-purple-600 transition-colors shrink-0 shadow-2xs cursor-pointer"
              >
                ✅ অর্ডার কনফার্ম ফরম
              </button>
              <button
                type="button"
                onClick={() => handleQuickChipClick('tracking')}
                className="px-3 py-1 rounded-full bg-white dark:bg-[#161D2B] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:border-purple-400 hover:text-purple-600 transition-colors shrink-0 shadow-2xs cursor-pointer"
              >
                🚚 কুরিয়ার ট্র্যাকিং
              </button>
            </div>

            {/* Bottom Input Footer matching screenshot */}
            <div className="p-3.5 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111625] shrink-0">
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
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-purple-600 hover:border-purple-300 bg-slate-50 dark:bg-[#161D2B] transition-colors cursor-pointer"
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
                      : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:text-purple-600 bg-slate-50 dark:bg-[#161D2B]'
                  }`}
                  title={isRecording ? 'Click to stop & send voice note' : 'Record voice note'}
                >
                  <Mic className="w-4 h-4" />
                </button>

                {/* Product catalog button */}
                <button
                  type="button"
                  onClick={() => setShowProductPicker(true)}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-purple-600 bg-slate-50 dark:bg-[#161D2B] transition-colors cursor-pointer"
                  title="Send Product Catalog Item"
                >
                  <ShoppingBag className="w-4 h-4" />
                </button>

                {/* Text input */}
                <input
                  type="text"
                  placeholder={`Reply to ${selectedConv.customerName}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161D2B] text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-purple-600 transition-colors"
                />

                {/* Send button (purple circle/pill matching screenshot) */}
                <button
                  type="submit"
                  disabled={sendingReply || (!replyText.trim() && !replyMedia)}
                  className="p-3 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-40 text-white shadow-md transition-transform active:scale-95 cursor-pointer shrink-0"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <MessageSquare className="w-12 h-12 opacity-30 text-purple-400 mb-3" />
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

      {/* Quick Order Modal */}
      {showQuickOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#161D2B] rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-purple-600" />
                <span>+ Create Quick Order</span>
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
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  value={quickOrderCustomer.name}
                  onChange={(e) => setQuickOrderCustomer({ ...quickOrderCustomer, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#10141D] text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={quickOrderCustomer.phone}
                  onChange={(e) => setQuickOrderCustomer({ ...quickOrderCustomer, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#10141D] text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Delivery Address</label>
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
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Product</label>
                  <input
                    type="text"
                    required
                    value={quickOrderProduct}
                    onChange={(e) => setQuickOrderProduct(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#10141D] text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Unit Price (BDT)</label>
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
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Delivery Area</label>
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
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Payment</label>
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
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  {submittingOrder ? 'Saving...' : 'Book Order & Send Confirmation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Picker Modal */}
      {showProductPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-[#161D2B] rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-purple-600" />
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
                  className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 flex items-center justify-between gap-3 transition-colors"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{p.name}</h4>
                    <p className="text-[11px] text-slate-400">{p.desc}</p>
                    <span className="text-xs font-black text-purple-600 dark:text-purple-400 mt-1 block">
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
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shrink-0"
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
