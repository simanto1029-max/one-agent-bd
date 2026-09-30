import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Smartphone,
  Bot,
  Users,
  CreditCard,
  Sparkles,
  ArrowRight,
  Shield,
  Activity,
  ShoppingBag,
  Globe,
  PhoneCall,
  CheckCircle2,
  Truck,
  Package,
  Calendar,
  Mail
} from 'lucide-react';
import { api } from './api';
import { UserProfile, SubscriptionStatusInfo, Channel, Plan } from './types';

// Common & Auth
import { AuthModal } from './components/auth/AuthModal';
import { SaasWebsiteChatbot } from './components/common/SaasWebsiteChatbot';
import { CountdownTimer } from './components/common/CountdownTimer';

// Landing Page
import { Navbar } from './components/landing/Navbar';
import { Hero } from './components/landing/Hero';
import { HowItWorksVideo } from './components/landing/HowItWorksVideo';
import { Features } from './components/landing/Features';
import { PricingTable } from './components/landing/PricingTable';
import { Testimonials } from './components/landing/Testimonials';
import { FAQ } from './components/landing/FAQ';
import { Footer } from './components/landing/Footer';

// Dashboard
import { DashboardHeader } from './components/dashboard/DashboardHeader';
import { OverviewView } from './components/dashboard/OverviewView';
import { ProductsView } from './components/dashboard/ProductsView';
import { OrdersView } from './components/dashboard/OrdersView';
import { DeliveryCourierListView } from './components/dashboard/DeliveryCourierListView';
import { StoresView } from './components/dashboard/StoresView';
import { WebsiteWidgetView } from './components/dashboard/WebsiteWidgetView';
import { CallRequestsView } from './components/dashboard/CallRequestsView';
import { AppointmentsView } from './components/dashboard/AppointmentsView';
import { EmailCampaignsView } from './components/dashboard/EmailCampaignsView';
import { UnifiedInbox } from './components/dashboard/UnifiedInbox';
import { ChannelsView } from './components/dashboard/ChannelsView';
import { SettingsView } from './components/dashboard/SettingsView';
import { ContactsView } from './components/dashboard/ContactsView';
import { BillingView } from './components/dashboard/BillingView';
import { TrialCountdownBanner } from './components/dashboard/TrialCountdownBanner';
import { PlanLockOverlay } from './components/dashboard/PlanLockOverlay';
import { WebhookTesterModal } from './components/dashboard/WebhookTesterModal';
import { GettingStartedTour } from './components/dashboard/GettingStartedTour';
import { MerchantBroadcastBanner } from './components/dashboard/MerchantBroadcastBanner';

// Admin
import { AdminLayout } from './components/admin/AdminLayout';

export default function App() {
  // Theme state: White (Light) is strictly the default theme; user can switch between White and Black anytime
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('oneagentbd_theme_v2');
    return saved === 'dark';
  });

  // App Navigation
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'admin'>('landing');
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'delivery-courier' | 'appointments' | 'email-campaigns' | 'stores' | 'website-widget' | 'call-requests' | 'inbox' | 'channels' | 'settings' | 'contacts' | 'billing'>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // User & Subscription state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [subStatus, setSubStatus] = useState<SubscriptionStatusInfo | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [totalMessagesCount, setTotalMessagesCount] = useState<number>(0);
  const [aiRepliesCount, setAiRepliesCount] = useState<number>(0);

  // Modals & Selection
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isWebhookTesterOpen, setIsWebhookTesterOpen] = useState(false);
  const [isLockBypassedForBilling, setIsLockBypassedForBilling] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [tourInitialStep, setTourInitialStep] = useState(1);
  const [inboxTargetConvKey, setInboxTargetConvKey] = useState<string | null>(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('oneagentbd_theme_v2', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('oneagentbd_theme_v2', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    bootstrapSession();
    // Clean any stray '#' or '/#' from browser URL bar
    const cleanUrlHash = () => {
      if (typeof window !== 'undefined' && window.location.href.includes('#')) {
        const h = window.location.hash.toLowerCase();
        if (!h.includes('privacy') && !h.includes('terms')) {
          try {
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
          } catch {}
        }
      }
    };
    cleanUrlHash();
    window.addEventListener('hashchange', cleanUrlHash);
    return () => window.removeEventListener('hashchange', cleanUrlHash);
  }, []);

  const bootstrapSession = async () => {
    try {
      const user = await api.getCurrentUser();
      setCurrentUser(user);
      if (user) {
        await refreshUserData();
      }
    } catch (err) {
      console.warn('Initial session check:', err);
    }
  };

  const refreshUserData = async () => {
    try {
      const [subData, channelsData, inboxData] = await Promise.all([
        api.getSubscriptionStatus().catch(() => null),
        api.getChannels().catch(() => []),
        api.getInbox().catch(() => ({ conversations: [], totalCount: 0 }))
      ]);

      if (subData) {
        setSubStatus(subData);
      }
      setChannels(channelsData);

      let allMsgs = 0;
      let aiMsgs = 0;
      inboxData.conversations.forEach((c) => {
        c.messages.forEach((m) => {
          allMsgs++;
          if (m.is_ai_reply) aiMsgs++;
        });
      });
      setTotalMessagesCount(allMsgs);
      setAiRepliesCount(aiMsgs);
    } catch (err) {
      console.error('Error refreshing user data:', err);
    }
  };

  const handleToggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const [pendingPlanAction, setPendingPlanAction] = useState<'buy' | 'trial' | null>(null);

  const handleOpenAuth = (mode: 'login' | 'signup' = 'signup', plan?: Plan) => {
    setAuthMode(mode);
    if (plan) setSelectedPlan(plan);
    setIsAuthOpen(true);
  };

  const handleAuthSuccess = async (user: UserProfile, status: SubscriptionStatusInfo) => {
    setCurrentUser(user);
    setSubStatus(status);
    await refreshUserData();
    if (user.role === 'admin') {
      setCurrentView('admin');
    } else {
      setCurrentView('dashboard');
      if (pendingPlanAction === 'buy') {
        setActiveTab('billing');
        setIsLockBypassedForBilling(true);
        setPendingPlanAction(null);
      }
    }
  };

  const handleSelectPlanFromLanding = async (plan: Plan, action: 'buy' | 'trial' = 'buy') => {
    setSelectedPlan(plan);
    setPendingPlanAction(action);
    if (!currentUser) {
      handleOpenAuth('signup', plan);
    } else {
      if (action === 'trial') {
        try {
          await api.startFreeTrial(plan.id);
          await refreshUserData();
        } catch (err) {
          console.error('Failed to start trial:', err);
        }
        setCurrentView('dashboard');
        setActiveTab('overview');
      } else {
        setCurrentView('dashboard');
        setActiveTab('billing');
        setIsLockBypassedForBilling(true);
      }
    }
  };

  const handleSwitchRole = async (role: 'admin' | 'user') => {
    try {
      const res = await api.switchDemo(role);
      setCurrentUser(res.user);
      setSubStatus(res.subscriptionStatus);
      await refreshUserData();
      if (role === 'admin') {
        setCurrentView('admin');
      } else {
        setCurrentView('dashboard');
      }
    } catch (err) {
      console.error('Failed to switch role:', err);
    }
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setSubStatus(null);
    setChannels([]);
    setCurrentView('landing');
    setActiveTab('overview');
  };

  // 6 Primary Navigation Sections (ChatMakky Style) + Sub-Tabs mapping
  type TabId = 'overview' | 'inbox' | 'products' | 'orders' | 'delivery-courier' | 'appointments' | 'email-campaigns' | 'stores' | 'website-widget' | 'call-requests' | 'channels' | 'settings' | 'contacts' | 'billing';

  const primarySections: {
    groupId: string;
    label: string;
    defaultTab: TabId;
    icon: any;
    tabs: { id: TabId; label: string; icon: any; desc: string }[];
  }[] = [
    {
      groupId: 'dashboard',
      label: 'Dashboard',
      defaultTab: 'overview',
      icon: LayoutDashboard,
      tabs: [{ id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard, desc: 'Real-time metrics & insights' }]
    },
    {
      groupId: 'inbox-hub',
      label: 'Inbox & Live Chat',
      defaultTab: 'inbox',
      icon: MessageSquare,
      tabs: [
        { id: 'inbox', label: 'Unified Inbox', icon: MessageSquare, desc: 'WhatsApp, Messenger & Instagram chats' },
        { id: 'call-requests', label: 'Human Call Requests', icon: PhoneCall, desc: 'Customer callback & live handover queue' },
        { id: 'contacts', label: 'Contacts CRM', icon: Users, desc: 'Customer directory & chat history' },
        { id: 'email-campaigns', label: 'Email Marketing & AI Broadcast', icon: Mail, desc: 'AI email campaigns with Open & Click tracking' }
      ]
    },
    {
      groupId: 'orders-hub',
      label: 'Orders & Bookings',
      defaultTab: 'orders',
      icon: ShoppingBag,
      tabs: [
        { id: 'orders', label: 'Orders Hub', icon: ShoppingBag, desc: 'AI-captured & manual customer orders' },
        { id: 'appointments', label: 'AI Appointments & Calendar', icon: Calendar, desc: 'Automated slot booking & Google Calendar sync' },
        { id: 'delivery-courier', label: 'Courier & Steadfast COD', icon: Truck, desc: '1-click courier booking & tracking' }
      ]
    },
    {
      groupId: 'catalog-hub',
      label: 'Products & Store',
      defaultTab: 'products',
      icon: Package,
      tabs: [
        { id: 'products', label: 'Products Catalog', icon: Package, desc: 'Inventory, pricing & visual AI catalog' },
        { id: 'stores', label: 'Website & Stores', icon: Globe, desc: 'WooCommerce & external store sync' }
      ]
    },
    {
      groupId: 'ai-channels-hub',
      label: 'AI Agent & Channels',
      defaultTab: 'channels',
      icon: Bot,
      tabs: [
        { id: 'channels', label: 'Connected Channels (Meta)', icon: Smartphone, desc: 'Facebook Page, Instagram & WhatsApp API' },
        { id: 'settings', label: 'AI Persona & Training', icon: Sparkles, desc: 'Business rules, delivery rates & prompts' },
        { id: 'website-widget', label: 'Website AI Widget', icon: Bot, desc: 'Embeddable live chat widget for websites' }
      ]
    },
    {
      groupId: 'billing-hub',
      label: 'Billing & Plan',
      defaultTab: 'billing',
      icon: CreditCard,
      tabs: [{ id: 'billing', label: 'Billing & Plans', icon: CreditCard, desc: 'Subscription status, trial & payments' }]
    }
  ];

  const currentPrimarySection =
    primarySections.find((sec) => sec.tabs.some((t) => t.id === activeTab)) || primarySections[0];
  const currentSubTab =
    currentPrimarySection.tabs.find((t) => t.id === activeTab) || currentPrimarySection.tabs[0];

  const isPlanLocked = Boolean(subStatus?.isExpired) && activeTab !== 'billing';

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0720] text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* 1. PUBLIC MARKETING LANDING PAGE */}
      {currentView === 'landing' && (
        <div className="flex flex-col min-h-screen">
          <Navbar
            isDark={isDark}
            onToggleTheme={handleToggleTheme}
            currentUser={currentUser}
            subStatus={subStatus}
            onOpenAuth={(mode) => handleOpenAuth(mode || 'signup')}
            onGoToDashboard={() => setCurrentView('dashboard')}
            onGoToAdmin={() => setCurrentView('admin')}
          />
          <main className="flex-1">
            <Hero
              onStartTrial={() => {
                if (currentUser) {
                  setCurrentView('dashboard');
                } else {
                  handleOpenAuth('signup');
                }
              }}
              onExploreDemo={async () => {
                await handleSwitchRole('user');
                setCurrentView('dashboard');
                setActiveTab('inbox');
              }}
              onOpenLogin={() => handleOpenAuth('login')}
              onOpenSignup={() => handleOpenAuth('signup')}
            />
            <HowItWorksVideo
              onStartTrial={() => {
                if (currentUser) {
                  setCurrentView('dashboard');
                } else {
                  handleOpenAuth('signup');
                }
              }}
            />
            <Features />
            <PricingTable onSelectPlan={handleSelectPlanFromLanding} />
            <Testimonials />
            <FAQ />
          </main>
          <Footer onOpenAuth={() => handleOpenAuth('signup')} />
        </div>
      )}

      {/* 2. ADMIN PORTAL */}
      {currentView === 'admin' && (
        currentUser?.role === 'admin' ? (
          <AdminLayout
            user={currentUser}
            isDark={isDark}
            onToggleTheme={handleToggleTheme}
            onGoToDashboard={() => setCurrentView('dashboard')}
          />
        ) : (
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="p-8 max-w-md bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xl text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold">Admin Portal Restricted</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                You are currently signed in as a standard merchant user. Staff privileges are required to access this portal.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Back to Merchant Dashboard
                </button>
              </div>
            </div>
          </div>
        )
      )}

      {/* 3. MERCHANT USER DASHBOARD (ChatMakky Clean 6-Item Sidebar + Sub-Tabs Architecture) */}
      {currentView === 'dashboard' && currentUser && (
        <div
          className={`${
            activeTab === 'inbox' ? 'h-screen overflow-hidden' : 'min-h-screen'
          } flex flex-col bg-[#F8F7FC] dark:bg-[#0B0720] relative`}
        >
          <DashboardHeader
            user={currentUser}
            subStatus={subStatus}
            isDark={isDark}
            onToggleTheme={handleToggleTheme}
            onOpenWebhookTester={() => {
              setIsMobileMenuOpen(false);
              setIsWebhookTesterOpen(true);
            }}
            onOpenTour={() => {
              setIsMobileMenuOpen(false);
              setTourInitialStep(1);
              setIsTourOpen(true);
            }}
            onGoToLanding={() => {
              setIsMobileMenuOpen(false);
              setCurrentView('landing');
            }}
            onGoToAdmin={() => {
              setIsMobileMenuOpen(false);
              setCurrentView('admin');
            }}
            onLogout={handleLogout}
            onTimerExpire={refreshUserData}
            isMobileMenuOpen={isMobileMenuOpen}
            onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
            activeTabLabel={currentPrimarySection.label}
          />

          {/* MOBILE DRAWER MENU (6 Clean Primary Sections + Sub-Tabs) */}
          {isMobileMenuOpen && (
            <div className="md:hidden fixed inset-x-0 top-16 bottom-0 z-30 flex flex-col">
              <div
                className="fixed inset-0 top-16 bg-black/50 backdrop-blur-2xs"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <div className="relative z-10 max-h-[calc(100vh-64px)] overflow-y-auto bg-white dark:bg-[#110B29] border-b border-slate-200 dark:border-purple-500/20 shadow-2xl p-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-slate-400">
                    Workspace Navigation
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-xs font-bold text-[#7C3AED] dark:text-purple-300 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 cursor-pointer"
                  >
                    Close ✕
                  </button>
                </div>

                <div className="space-y-1.5">
                  {primarySections.map((section) => {
                    const Icon = section.icon;
                    const isSectionActive = currentPrimarySection.groupId === section.groupId;
                    return (
                      <div key={section.groupId} className="space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab(section.defaultTab);
                            if (section.defaultTab === 'billing') {
                              setIsLockBypassedForBilling(true);
                            }
                            if (section.tabs.length === 1) {
                              setIsMobileMenuOpen(false);
                            }
                          }}
                          className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                            isSectionActive
                              ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white shadow-sm shadow-purple-500/25'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1A123B]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4" />
                            <span>{section.label}</span>
                          </div>
                          {section.tabs.length > 1 && (
                            <span className={`text-[10px] font-semibold ${isSectionActive ? 'text-white/80' : 'text-slate-400'}`}>
                              {section.tabs.length} tools
                            </span>
                          )}
                        </button>

                        {isSectionActive && section.tabs.length > 1 && (
                          <div className="pl-6 pr-1 py-1 space-y-1">
                            {section.tabs.map((sub) => {
                              const SubIcon = sub.icon;
                              const isSubActive = activeTab === sub.id;
                              return (
                                <button
                                  key={sub.id}
                                  type="button"
                                  onClick={() => {
                                    setActiveTab(sub.id);
                                    setIsMobileMenuOpen(false);
                                  }}
                                  className={`w-full px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                                    isSubActive
                                      ? 'bg-purple-50 dark:bg-purple-500/20 text-[#7C3AED] dark:text-purple-300 font-bold'
                                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                  }`}
                                >
                                  <SubIcon className="w-3.5 h-3.5" />
                                  <span>{sub.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-purple-500/15 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsWebhookTesterOpen(true);
                    }}
                    className="py-2 px-3 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-[#7C3AED] dark:text-purple-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Test AI</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setCurrentView('landing');
                    }}
                    className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-[#1A123B] text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Main Website</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* DESKTOP + MAIN WORKSPACE BODY */}
          <div className="flex-1 flex min-h-0">
            {/* Clean ChatMakky-Style Left Sidebar (6 Primary Buttons) */}
            <aside className="hidden md:flex flex-col justify-between w-64 shrink-0 bg-white dark:bg-[#0F0A24] border-r border-slate-200/80 dark:border-purple-500/15 p-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
              <div className="space-y-6">
                <div className="space-y-1">
                  <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 dark:text-slate-500">
                    Main Menu
                  </div>
                  {primarySections.map((section) => {
                    const Icon = section.icon;
                    const isSectionActive = currentPrimarySection.groupId === section.groupId;
                    return (
                      <button
                        key={section.groupId}
                        onClick={() => {
                          setActiveTab(section.defaultTab);
                          if (section.defaultTab === 'billing') {
                            setIsLockBypassedForBilling(true);
                          }
                        }}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-[13px] font-bold flex items-center justify-between transition-all cursor-pointer ${
                          isSectionActive
                            ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white shadow-md shadow-purple-500/20'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-[#191138] hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 shrink-0" />
                          <span>{section.label}</span>
                        </div>
                        {isSectionActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Sidebar Workspace Status & Quick Simulator Card */}
              <div className="space-y-3 pt-4 border-t border-slate-200/70 dark:border-purple-500/15">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#160F35] border border-slate-200/80 dark:border-purple-500/20 space-y-2.5">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {subStatus?.planName || 'Starter AI Plan'}
                    </span>
                    <span className="text-[10px] font-bold text-[#7C3AED] dark:text-purple-400 shrink-0">
                      {subStatus?.isExpired
                        ? 'Expired'
                        : subStatus?.subscription?.status === 'active'
                        ? 'Active'
                        : 'Free Trial'}
                    </span>
                  </div>
                  {subStatus?.subscription?.end_date && !subStatus.isExpired && (
                    <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#0F0A24] border border-slate-200/70 dark:border-purple-500/20 text-[11px]">
                      <span className="text-slate-400 font-semibold">Left:</span>
                      <span className="text-[#7C3AED] dark:text-purple-300 font-bold">
                        <CountdownTimer
                          targetDate={subStatus.subscription.end_date}
                          serverTime={subStatus.serverTime}
                          onExpire={refreshUserData}
                        />
                      </span>
                    </div>
                  )}
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    {channels.filter((c) => c.is_active).length} active channel(s) connected to AI engine.
                  </p>
                  <button
                    onClick={() => {
                      setActiveTab('billing');
                      setIsLockBypassedForBilling(true);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7E22CE] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs shadow-purple-500/20"
                  >
                    <span>Manage Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => setIsWebhookTesterOpen(true)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-[#191138] hover:bg-slate-200/70 dark:hover:bg-[#23184B] text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5 text-[#7C3AED] dark:text-purple-400" />
                  <span>Open AI Simulator</span>
                </button>
              </div>
            </aside>

            {/* Main Content Area */}
            <main
              className={`flex-1 min-w-0 max-w-[1280px] mx-auto w-full ${
                activeTab === 'inbox'
                  ? 'p-2 sm:p-3 lg:px-5 lg:py-2.5 flex flex-col min-h-0 h-[calc(100vh-4rem)] overflow-hidden'
                  : 'p-4 sm:p-6 lg:p-8'
              }`}
            >
              {/* Live Trial / Subscription Countdown Banner */}
              {activeTab !== 'billing' && activeTab !== 'inbox' && (
                <TrialCountdownBanner
                  subStatus={subStatus}
                  onUpgradeClick={() => {
                    setActiveTab('billing');
                    setIsLockBypassedForBilling(true);
                  }}
                  onExpired={refreshUserData}
                />
              )}

              {/* Admin Broadcast Notifications Banner (Dismissible by Merchant) */}
              {activeTab !== 'inbox' && (
                <MerchantBroadcastBanner
                  onNavigateTab={(tab) => {
                    setActiveTab(tab as any);
                    if (tab === 'billing') setIsLockBypassedForBilling(true);
                  }}
                />
              )}

              {/* Horizontal Sub-Navigation Tabs Bar (Shown when current section has multiple tools) */}
              {currentPrimarySection.tabs.length > 1 && (
                <div
                  className={
                    activeTab === 'inbox'
                      ? 'mb-2 pb-2 shrink-0 flex flex-row items-center justify-between gap-2 border-b border-slate-200/80 dark:border-purple-500/20'
                      : 'mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-purple-500/20'
                  }
                >
                  <div className={activeTab === 'inbox' ? 'hidden sm:block' : ''}>
                    <h1
                      className={
                        activeTab === 'inbox'
                          ? 'text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight'
                          : 'text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight'
                      }
                    >
                      {currentSubTab.label}
                    </h1>
                    {activeTab !== 'inbox' && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {currentSubTab.desc}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-white dark:bg-[#130D2E] border border-slate-200/80 dark:border-purple-500/20 shadow-2xs">
                    {currentPrimarySection.tabs.map((tab) => {
                      const SubIcon = tab.icon;
                      const isSubActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveTab(tab.id)}
                          className={`${
                            activeTab === 'inbox' ? 'px-2.5 py-1.5 text-[11px]' : 'px-3.5 py-2 text-xs'
                          } rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isSubActive
                              ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white shadow-xs shadow-purple-500/25'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-[#1C1442]'
                          }`}
                        >
                          <SubIcon className="w-3.5 h-3.5" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'overview' && (
                <OverviewView
                  user={currentUser}
                  subStatus={subStatus}
                  channels={channels}
                  totalMessagesCount={totalMessagesCount}
                  aiRepliesCount={aiRepliesCount}
                  onNavigate={(tab) => {
                    setActiveTab(tab as any);
                    if (tab === 'billing') setIsLockBypassedForBilling(true);
                  }}
                  onOpenWebhookTester={() => setIsWebhookTesterOpen(true)}
                  onOpenTour={(step) => {
                    setTourInitialStep(step || 1);
                    setIsTourOpen(true);
                  }}
                />
              )}

              {activeTab === 'orders' && (
                <OrdersView
                  onGoToInbox={() => {
                    setActiveTab('inbox');
                  }}
                />
              )}

              {activeTab === 'delivery-courier' && (
                <DeliveryCourierListView />
              )}

              {activeTab === 'appointments' && (
                <AppointmentsView
                  onOpenCustomerChat={(platform, customerId) => {
                    setInboxTargetConvKey(`${platform}_${customerId}`);
                    setActiveTab('inbox');
                  }}
                />
              )}

              {activeTab === 'stores' && (
                <StoresView
                  subStatus={subStatus}
                  onUpgradeToPro={() => {
                    setActiveTab('billing');
                    setIsLockBypassedForBilling(true);
                  }}
                  onNavigateToOrders={() => {
                    setActiveTab('orders');
                  }}
                />
              )}

              {activeTab === 'website-widget' && (
                <WebsiteWidgetView
                  currentUser={currentUser}
                  onNavigateToInbox={() => {
                    setActiveTab('inbox');
                  }}
                />
              )}

              {activeTab === 'call-requests' && (
                <CallRequestsView
                  onNavigateToOrders={() => {
                    setActiveTab('orders');
                  }}
                  onOpenCustomerChat={(platform, customerId) => {
                    setInboxTargetConvKey(`${platform}_${customerId}`);
                    setActiveTab('inbox');
                  }}
                />
              )}

              {activeTab === 'inbox' && (
                <UnifiedInbox
                  channels={channels}
                  initialConvKey={inboxTargetConvKey}
                  onNavigate={(tab) => {
                    setActiveTab(tab as any);
                    if (tab === 'billing') setIsLockBypassedForBilling(true);
                  }}
                />
              )}

              {activeTab === 'products' && (
                <ProductsView onNavigate={(tab) => setActiveTab(tab as any)} />
              )}

              {activeTab === 'channels' && (
                <ChannelsView
                  channels={channels}
                  currentUser={currentUser}
                  onRefresh={refreshUserData}
                  onOpenWebhookTester={() => setIsWebhookTesterOpen(true)}
                  onNavigate={(tab) => {
                    setActiveTab(tab as any);
                    if (tab === 'billing') setIsLockBypassedForBilling(true);
                  }}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView onRefreshUser={refreshUserData} />
              )}

              {activeTab === 'contacts' && (
                <ContactsView />
              )}

              {activeTab === 'email-campaigns' && (
                <EmailCampaignsView />
              )}

              {activeTab === 'billing' && (
                <BillingView
                  subStatus={subStatus}
                  initialSelectedPlan={selectedPlan}
                  onRefresh={refreshUserData}
                />
              )}
            </main>
          </div>

          {/* Automatic Plan Lock Overlay when 2-Day Trial or 30-Day Subscription Expires */}
          {isPlanLocked && (
            <PlanLockOverlay
              subStatus={subStatus}
              onPaymentSubmitted={refreshUserData}
              onGoToBilling={() => {
                setIsLockBypassedForBilling(true);
                setActiveTab('billing');
              }}
            />
          )}
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        defaultMode={authMode}
        selectedPlan={selectedPlan}
        onClose={() => {
          setIsAuthOpen(false);
          setSelectedPlan(null);
        }}
        onSuccess={handleAuthSuccess}
      />

      {/* Webhook Tester Modal */}
      <WebhookTesterModal
        isOpen={isWebhookTesterOpen}
        onClose={() => setIsWebhookTesterOpen(false)}
        onRefreshInbox={refreshUserData}
      />

      {/* Interactive Getting Started Tour Modal */}
      {currentUser && (
        <GettingStartedTour
          isOpen={isTourOpen}
          onClose={() => setIsTourOpen(false)}
          currentUser={currentUser}
          channels={channels}
          onNavigate={(tab) => {
            setActiveTab(tab as any);
            setIsTourOpen(false);
          }}
          onRefreshData={refreshUserData}
          onOpenWebhookTester={() => {
            setIsTourOpen(false);
            setIsWebhookTesterOpen(true);
          }}
          initialStep={tourInitialStep}
        />
      )}

      {/* Official One Agent BD Website AI Chatbot (Trained on SaaS, Voice + Picture + Bilingual) */}
      {!(currentView === 'dashboard' && activeTab === 'inbox') && <SaasWebsiteChatbot />}
    </div>
  );
}
