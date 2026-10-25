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
  Mail,
  BarChart3,
  ChevronDown,
  Crown,
  Lock,
  Zap,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { api } from './api';
import { UserProfile, SubscriptionStatusInfo, Channel, Plan } from './types';
import { OFFICIAL_TWO_PLANS } from './utils/pricingPlans';

// Common & Auth
import { AuthModal } from './components/auth/AuthModal';
import { AuthPage } from './components/auth/AuthPage';
import { SaasWebsiteChatbot } from './components/common/SaasWebsiteChatbot';
import { CountdownTimer } from './components/common/CountdownTimer';

// Landing Page
import { Navbar } from './components/landing/Navbar';
import { Hero } from './components/landing/Hero';
import { HowItWorksVideo } from './components/landing/HowItWorksVideo';
import { LiveDemoPage } from './components/landing/LiveDemoPage';
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
import { BusinessErpView } from './components/dashboard/BusinessErpView';
import { UnifiedInbox } from './components/dashboard/UnifiedInbox';
import { ChannelsView } from './components/dashboard/ChannelsView';
import { SettingsView } from './components/dashboard/SettingsView';
import { ContactsView } from './components/dashboard/ContactsView';
import { AgentsView } from './components/dashboard/AgentsView';
import { BillingView } from './components/dashboard/BillingView';
import { TrialCountdownBanner } from './components/dashboard/TrialCountdownBanner';
import { PlanLockOverlay } from './components/dashboard/PlanLockOverlay';
import { GettingStartedTour } from './components/dashboard/GettingStartedTour';
import { MerchantBroadcastBanner } from './components/dashboard/MerchantBroadcastBanner';
import { ProFeatureBlurWrapper } from './components/dashboard/ProFeatureBlurWrapper';

// Admin
import { AdminLayout } from './components/admin/AdminLayout';

export type TabId =
  | 'overview'
  | 'inbox'
  | 'products'
  | 'orders'
  | 'delivery-courier'
  | 'appointments'
  | 'email-campaigns'
  | 'business-erp'
  | 'stores'
  | 'website-widget'
  | 'call-requests'
  | 'agents'
  | 'channels'
  | 'settings'
  | 'contacts'
  | 'billing';

const VALID_TABS: Record<string, TabId> = {
  overview: 'overview',
  dashboard: 'overview',
  inbox: 'inbox',
  products: 'products',
  orders: 'orders',
  'delivery-courier': 'delivery-courier',
  courier: 'delivery-courier',
  appointments: 'appointments',
  'email-campaigns': 'email-campaigns',
  'business-erp': 'business-erp',
  erp: 'business-erp',
  stores: 'stores',
  'website-widget': 'website-widget',
  widget: 'website-widget',
  'call-requests': 'call-requests',
  agents: 'agents',
  'ai-agents': 'agents',
  channels: 'channels',
  settings: 'settings',
  contacts: 'contacts',
  billing: 'billing'
};

const TAB_TO_GROUP: Record<TabId, string> = {
  overview: 'dashboard',
  inbox: 'inbox-hub',
  contacts: 'inbox-hub',
  'call-requests': 'inbox-hub',
  'email-campaigns': 'inbox-hub',
  orders: 'orders-hub',
  'delivery-courier': 'orders-hub',
  appointments: 'orders-hub',
  products: 'catalog-hub',
  'business-erp': 'catalog-hub',
  stores: 'catalog-hub',
  agents: 'ai-channels-hub',
  channels: 'ai-channels-hub',
  settings: 'ai-channels-hub',
  'website-widget': 'ai-channels-hub',
  billing: 'billing-hub'
};

function parseInitialRoute(): {
  view: 'landing' | 'dashboard' | 'admin' | 'auth' | 'demo';
  tab: TabId;
  openGroup: string;
  authMode?: 'login' | 'signup';
} {
  if (typeof window === 'undefined') {
    return { view: 'landing', tab: 'overview', openGroup: 'dashboard' };
  }

  const rawPath = window.location.pathname.toLowerCase().replace(/^\/+|\/+$/g, '');
  const params = new URLSearchParams(window.location.search);
  const queryTab = params.get('tab')?.toLowerCase() || params.get('section')?.toLowerCase();
  const queryView = params.get('view')?.toLowerCase();

  if (rawPath === 'admin' || queryView === 'admin') {
    return { view: 'admin', tab: 'overview', openGroup: 'dashboard' };
  }

  // Dedicated Live Demo Video Route (/demo, /live-demo, /video)
  if (
    rawPath === 'demo' ||
    rawPath === 'live-demo' ||
    rawPath === 'watch-demo' ||
    queryView === 'demo' ||
    queryView === 'live-demo'
  ) {
    return { view: 'demo', tab: 'overview', openGroup: 'dashboard' };
  }

  // Dedicated Auth routes (/register, /signup, /login, /signin)
  if (rawPath === 'register' || rawPath === 'signup' || queryView === 'register' || queryView === 'signup') {
    return { view: 'auth', tab: 'overview', openGroup: 'dashboard', authMode: 'signup' };
  }
  if (rawPath === 'login' || rawPath === 'signin' || queryView === 'login' || queryView === 'signin' || queryView === 'auth') {
    return { view: 'auth', tab: 'overview', openGroup: 'dashboard', authMode: 'login' };
  }

  // Check path first
  if (rawPath && VALID_TABS[rawPath]) {
    const tab = VALID_TABS[rawPath];
    return { view: 'dashboard', tab, openGroup: TAB_TO_GROUP[tab] || 'dashboard' };
  }

  // Check query param
  if (queryTab && VALID_TABS[queryTab]) {
    const tab = VALID_TABS[queryTab];
    return { view: 'dashboard', tab, openGroup: TAB_TO_GROUP[tab] || 'dashboard' };
  }

  if (rawPath === 'dashboard') {
    return { view: 'dashboard', tab: 'overview', openGroup: 'dashboard' };
  }

  // Check if token exists and last visited view was dashboard
  const savedLastTab = localStorage.getItem('oneagentbd_active_tab') as TabId | null;
  const lastView = localStorage.getItem('oneagentbd_last_view');
  const hasToken = Boolean(localStorage.getItem('oneagentbd_token'));

  if (rawPath === '' && !queryTab && hasToken && lastView === 'dashboard' && savedLastTab && VALID_TABS[savedLastTab]) {
    const tab = VALID_TABS[savedLastTab];
    return { view: 'dashboard', tab, openGroup: TAB_TO_GROUP[tab] || 'dashboard' };
  }

  return { view: 'landing', tab: 'overview', openGroup: 'dashboard' };
}

export default function App() {
  const initialRoute = parseInitialRoute();

  // Theme state: White (Light) is strictly the default theme; user can switch between White and Black anytime
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('oneagentbd_theme_v2');
    return saved === 'dark';
  });

  // App Navigation with URL Synchronization
  const [currentView, setCurrentViewRaw] = useState<'landing' | 'dashboard' | 'admin' | 'auth' | 'demo'>(initialRoute.view);
  const [activeTab, setActiveTabRaw] = useState<TabId>(initialRoute.tab);
  const [openGroupId, setOpenGroupId] = useState<string | null>(initialRoute.openGroup);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync URL in browser address bar (HTML5 History API)
  const updateUrl = (
    view: 'landing' | 'dashboard' | 'admin' | 'auth' | 'demo',
    tab: TabId,
    replace = false,
    modeOverride?: 'login' | 'signup'
  ) => {
    if (typeof window === 'undefined') return;
    let targetPath = '/';
    if (view === 'admin') {
      targetPath = '/admin';
    } else if (view === 'demo') {
      targetPath = '/demo';
    } else if (view === 'auth') {
      const effMode = modeOverride || authMode;
      targetPath = effMode === 'login' ? '/login' : '/register';
    } else if (view === 'dashboard') {
      targetPath = tab === 'overview' ? '/dashboard' : `/${tab}`;
    }
    localStorage.setItem('oneagentbd_last_view', view);
    if (view === 'dashboard') {
      localStorage.setItem('oneagentbd_active_tab', tab);
    }
    const currentPath = window.location.pathname;
    if (currentPath !== targetPath) {
      if (replace) {
        window.history.replaceState({ view, tab, authMode: modeOverride || authMode }, '', targetPath);
      } else {
        window.history.pushState({ view, tab, authMode: modeOverride || authMode }, '', targetPath);
      }
    }
  };

  // Sidebar collapse state (auto-collapses on inbox for maximum width, toggleable anytime)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('oneagentbd_sidebar_collapsed');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('oneagentbd_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const setActiveTab = (tab: TabId, replace = false) => {
    setActiveTabRaw(tab);
    if (TAB_TO_GROUP[tab]) {
      setOpenGroupId(TAB_TO_GROUP[tab]);
    }
    // When clicking into inbox, automatically collapse sidebar so inbox expands to full screen width
    if (tab === 'inbox') {
      setIsSidebarCollapsed(true);
    }
    const effectiveView = (currentView === 'landing' || currentView === 'demo') ? 'dashboard' : currentView;
    if (currentView === 'landing' || currentView === 'demo') {
      setCurrentViewRaw('dashboard');
    }
    updateUrl(effectiveView, tab, replace);
  };

  const setCurrentView = (
    view: 'landing' | 'dashboard' | 'admin' | 'auth' | 'demo',
    targetTab?: TabId,
    replace = false
  ) => {
    setCurrentViewRaw(view);
    const tabToUse = targetTab || activeTab || 'overview';
    if (view === 'dashboard' && targetTab) {
      setActiveTabRaw(targetTab);
      if (TAB_TO_GROUP[targetTab]) {
        setOpenGroupId(TAB_TO_GROUP[targetTab]);
      }
      if (targetTab === 'inbox') {
        setIsSidebarCollapsed(true);
      }
    }
    updateUrl(view, tabToUse, replace);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  // User & Subscription state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [subStatus, setSubStatus] = useState<SubscriptionStatusInfo | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [totalMessagesCount, setTotalMessagesCount] = useState<number>(0);
  const [aiRepliesCount, setAiRepliesCount] = useState<number>(0);

  // Modals & Selection
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(initialRoute.authMode || 'signup');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
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
    // If started on a dashboard, admin, or auth route, ensure URL bar matches
    if (initialRoute.view !== 'landing') {
      updateUrl(initialRoute.view, initialRoute.tab, true);
    }

    bootstrapSession();

    // Browser back/forward button support
    const handlePopState = () => {
      const route = parseInitialRoute();
      setCurrentViewRaw(route.view);
      setActiveTabRaw(route.tab);
      setOpenGroupId(route.openGroup);
      if (route.authMode) {
        setAuthMode(route.authMode);
      }
    };
    window.addEventListener('popstate', handlePopState);

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

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', cleanUrlHash);
    };
  }, []);

  const bootstrapSession = async () => {
    try {
      const user = await api.getCurrentUser();
      setCurrentUser(user);
      if (user) {
        await refreshUserData();
        const route = parseInitialRoute();
        if (route.view === 'dashboard') {
          setCurrentViewRaw('dashboard');
          setActiveTabRaw(route.tab);
          setOpenGroupId(route.openGroup);
          updateUrl('dashboard', route.tab, true);

          // Automatic first-time user dashboard walkthrough tour
          const isTourCompleted = localStorage.getItem(`oneagentbd_tour_completed_${user.id}`);
          if (!isTourCompleted && user.role !== 'admin') {
            setTimeout(() => {
              setTourInitialStep(1);
              setIsTourOpen(true);
            }, 600);
          }
        } else if (route.view === 'admin' && user.role === 'admin') {
          setCurrentViewRaw('admin');
          updateUrl('admin', 'overview', true);
        }
      } else {
        const route = parseInitialRoute();
        if (route.view === 'dashboard' || route.view === 'admin') {
          setCurrentViewRaw('landing');
          updateUrl('landing', 'overview', true);
          handleOpenAuth('login');
        } else if (route.view === 'auth') {
          setCurrentViewRaw('auth');
          if (route.authMode) setAuthMode(route.authMode);
          updateUrl('auth', 'overview', true, route.authMode);
        }
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
    setCurrentViewRaw('auth');
    updateUrl('auth', activeTab, false, mode);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
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

      // First-time user tour trigger
      const isTourCompleted = localStorage.getItem(`oneagentbd_tour_completed_${user.id}`);
      if (!isTourCompleted) {
        setTimeout(() => {
          setTourInitialStep(1);
          setIsTourOpen(true);
        }, 600);
      }
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
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
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
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
    localStorage.removeItem('oneagentbd_last_view');
    localStorage.removeItem('oneagentbd_active_tab');
    setCurrentUser(null);
    setSubStatus(null);
    setChannels([]);
    setCurrentView('landing');
    setActiveTab('overview');
  };

  // 6 Primary Navigation Sections (ChatMakky Style) + Sub-Tabs mapping
  const primarySections: {
    groupId: string;
    label: string;
    defaultTab: TabId;
    icon: any;
    tabs: { id: TabId; label: string; icon: any; desc: string; isProOnly?: boolean }[];
  }[] = [
    {
      groupId: 'dashboard',
      label: 'Dashboard',
      defaultTab: 'overview',
      icon: LayoutDashboard,
      tabs: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard, desc: 'Real-time metrics & insights' }
      ]
    },
    {
      groupId: 'inbox-hub',
      label: 'Inbox & Live Chat',
      defaultTab: 'inbox',
      icon: MessageSquare,
      tabs: [
        { id: 'inbox', label: 'Live Chat', icon: MessageSquare, desc: 'WhatsApp, Messenger & Instagram chats' },
        { id: 'contacts', label: 'Contacts CRM', icon: Users, desc: 'Customer directory & chat history' },
        { id: 'call-requests', label: 'Call Requests', icon: PhoneCall, desc: 'Customer callback & live handover queue', isProOnly: true },
        { id: 'email-campaigns', label: 'AI Broadcast', icon: Mail, desc: 'AI email campaigns & broadcast', isProOnly: true }
      ]
    },
    {
      groupId: 'orders-hub',
      label: 'Orders & Bookings',
      defaultTab: 'orders',
      icon: ShoppingBag,
      tabs: [
        { id: 'orders', label: 'All Orders', icon: ShoppingBag, desc: 'AI-captured & manual customer orders' },
        { id: 'delivery-courier', label: 'Courier & Steadfast', icon: Truck, desc: '1-click courier booking & tracking' },
        { id: 'appointments', label: 'Appointments', icon: Calendar, desc: 'Automated slot booking & calendar', isProOnly: true }
      ]
    },
    {
      groupId: 'catalog-hub',
      label: 'Products & Catalog',
      defaultTab: 'products',
      icon: Package,
      tabs: [
        { id: 'products', label: 'Product Catalog', icon: Package, desc: 'Inventory, pricing & visual AI catalog' },
        { id: 'business-erp', label: 'Accounts & Stock ERP', icon: BarChart3, desc: 'Sales, Purchase, Stock, Due & Cashbook', isProOnly: true }
      ]
    },
    {
      groupId: 'ai-channels-hub',
      label: 'AI Agents & Channels',
      defaultTab: 'agents',
      icon: Bot,
      tabs: [
        { id: 'agents', label: 'AI Business Agents', icon: Bot, desc: 'Multi-business autonomous AI agents' },
        { id: 'channels', label: 'Connect Channels', icon: Smartphone, desc: 'Facebook Page, Instagram & WhatsApp' },
        { id: 'settings', label: 'AI Persona & Training', icon: Sparkles, desc: 'Business rules, delivery rates & prompts' },
        { id: 'website-widget', label: 'Website Widget', icon: Bot, desc: 'Embeddable live chat widget for websites', isProOnly: true }
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

  const isTrialActive = Boolean(
    !subStatus?.isExpired && subStatus?.subscription?.status === 'trialing'
  );

  const isProPlan = Boolean(
    currentUser?.role === 'admin' ||
      isTrialActive ||
      subStatus?.isProPlan ||
      (subStatus?.subscription?.status === 'active' &&
        (subStatus?.planId?.includes('pro') ||
          (subStatus?.planName || '').toLowerCase().includes('pro') ||
          (subStatus?.price && subStatus.price >= 1950)))
  );

  const handleNavigateToProUpgrade = () => {
    setSelectedPlan(OFFICIAL_TWO_PLANS[1]);
    setActiveTab('billing');
    setIsLockBypassedForBilling(true);
  };

  const currentPrimarySection =
    primarySections.find((sec) => sec.tabs.some((t) => t.id === activeTab)) || primarySections[0];
  const currentSubTab =
    currentPrimarySection.tabs.find((t) => t.id === activeTab) || currentPrimarySection.tabs[0];

  const isPlanLocked = Boolean(subStatus?.isExpired) && activeTab !== 'billing';

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0720] text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* 0. DEDICATED FULL-PAGE AUTH (Register / Login / Recovery - ChatMakky Clean Style) */}
      {currentView === 'auth' && (
        <AuthPage
          initialMode={authMode}
          selectedPlan={selectedPlan}
          onSuccess={handleAuthSuccess}
          onBackToHome={() => {
            setCurrentView('landing');
          }}
          onChangeMode={(newMode) => {
            setAuthMode(newMode);
            updateUrl('auth', activeTab, false, newMode);
          }}
        />
      )}

      {/* 1. PUBLIC MARKETING LANDING PAGE */}
      {currentView === 'landing' && (
        <div className="flex flex-col min-h-screen bg-white dark:bg-[#090518] text-slate-900 dark:text-white transition-colors">
          <Navbar
            isDark={isDark}
            onToggleTheme={handleToggleTheme}
            currentUser={currentUser}
            subStatus={subStatus}
            onOpenAuth={(mode) => handleOpenAuth(mode || 'signup')}
            onGoToLanding={() => setCurrentView('landing')}
            onGoToDemo={() => setCurrentView('demo')}
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
            {/* Features (Phone UI with live auto-scrolling chat) */}
            <Features />

            <PricingTable onSelectPlan={handleSelectPlanFromLanding} />
            <FAQ />
            <Testimonials />
          </main>
          <Footer onOpenAuth={() => handleOpenAuth('signup')} />
        </div>
      )}

      {/* 2. DEDICATED 60-SECOND LIVE DEMO VIDEO PAGE */}
      {currentView === 'demo' && (
        <LiveDemoPage
          isDark={isDark}
          onToggleTheme={handleToggleTheme}
          currentUser={currentUser}
          subStatus={subStatus}
          onOpenAuth={(mode) => handleOpenAuth(mode || 'signup')}
          onGoToLanding={() => setCurrentView('landing')}
          onGoToDashboard={() => setCurrentView('dashboard')}
          onGoToAdmin={() => setCurrentView('admin')}
        />
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
            activeTab === 'inbox' ? 'h-dvh overflow-hidden' : 'min-h-dvh'
          } flex flex-col bg-[#F8F7FC] dark:bg-[#0B0720] relative`}
        >
          <DashboardHeader
            user={currentUser}
            subStatus={subStatus}
            isDark={isDark}
            onToggleTheme={handleToggleTheme}
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
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={handleToggleSidebar}
            activeTabLabel={
              currentPrimarySection.tabs.length > 1
                ? `${currentPrimarySection.label} / ${currentSubTab.label}`
                : currentPrimarySection.label
            }
          />

          {/* MOBILE DRAWER MENU (6 Clean Primary Sections + Sub-Tabs + Plan Switcher) */}
          {isMobileMenuOpen && (
            <div className="md:hidden fixed inset-x-0 top-14 sm:top-16 bottom-0 z-40 flex flex-col">
              <div
                className="fixed inset-0 top-14 sm:top-16 bg-black/50 backdrop-blur-2xs"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <div className="relative z-10 max-h-[calc(100dvh-3.5rem)] overflow-y-auto bg-white dark:bg-[#110B29] border-b border-slate-200 dark:border-purple-500/20 shadow-2xl p-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
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
                    const hasSubTabs = section.tabs.length > 1;
                    const isSubOpen = openGroupId === section.groupId;
                    return (
                      <div key={section.groupId} className="space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (hasSubTabs) {
                              if (isSubOpen) {
                                setOpenGroupId(null);
                              } else {
                                setOpenGroupId(section.groupId);
                                if (!isSectionActive) {
                                  setActiveTab(section.defaultTab);
                                }
                              }
                            } else {
                              setOpenGroupId(null);
                              setActiveTab(section.defaultTab);
                              if (section.defaultTab === 'billing') {
                                setIsLockBypassedForBilling(true);
                              }
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
                          {hasSubTabs && (
                            <ChevronDown
                              className={`w-4 h-4 shrink-0 transition-transform duration-300 ease-in-out ${
                                isSubOpen ? 'rotate-180' : 'rotate-0'
                              } ${isSectionActive ? 'text-white' : 'text-slate-400'}`}
                            />
                          )}
                        </button>

                        {hasSubTabs && (
                          <div
                            className={`grid transition-all duration-300 ease-in-out ${
                              isSubOpen
                                ? 'grid-rows-[1fr] opacity-100 mt-1'
                                : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'
                            }`}
                          >
                            <div className="overflow-hidden">
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
                                      className={`w-full px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                                        isSubActive
                                          ? 'bg-purple-50 dark:bg-purple-500/20 text-[#7C3AED] dark:text-purple-300 font-bold'
                                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <SubIcon className="w-3.5 h-3.5 shrink-0" />
                                        <span className="truncate">{sub.label}</span>
                                      </div>
                                      {sub.isProOnly && !isProPlan && (
                                        <span className="px-1.5 py-0.2 rounded-full bg-gradient-to-r from-[#7F22FE] to-[#DB2777] text-white text-[9px] font-black uppercase shrink-0 flex items-center gap-0.5">
                                          <Lock className="w-2.5 h-2.5" />
                                          <span>PRO</span>
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Mobile Drawer Clean Footer */}
                <div className="pt-2 border-t border-slate-100 dark:border-purple-500/15">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setCurrentView('landing');
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-[#1A123B] text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Main Website</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MOBILE SUB-TAB PILL BAR (Shown on mobile when current section has multiple sub-tabs) */}
          {currentPrimarySection.tabs.length > 1 && (
            <div className="md:hidden bg-white dark:bg-[#0F0A24] border-b border-slate-200/80 dark:border-purple-500/15 px-3 py-2 shrink-0 overflow-x-auto scrollbar-none">
              <div className="flex items-center gap-1.5 min-w-max">
                {currentPrimarySection.tabs.map((sub) => {
                  const SubIcon = sub.icon;
                  const isSubActive = activeTab === sub.id;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setActiveTab(sub.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                        isSubActive
                          ? 'bg-[#7C3AED] text-white shadow-2xs'
                          : 'bg-slate-100 dark:bg-[#191138] text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <SubIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>{sub.label}</span>
                      {sub.isProOnly && !isProPlan && (
                        <span
                          className={`px-1 py-0.2 rounded text-[8px] font-black uppercase ${
                            isSubActive
                              ? 'bg-white/20 text-white'
                              : 'bg-gradient-to-r from-[#7F22FE] to-[#DB2777] text-white'
                          }`}
                        >
                          PRO
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* DESKTOP + MAIN WORKSPACE BODY */}
          <div className="flex-1 flex min-h-0">
            {/* Clean Left Sidebar: Supports Full (w-64) or Collapsed Slim Icon Rail (w-16) */}
            <aside
              className={`hidden md:flex flex-col justify-between shrink-0 bg-white dark:bg-[#0F0A24] border-r border-slate-200/80 dark:border-purple-500/15 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto transition-all duration-200 ${
                isSidebarCollapsed ? 'w-16 p-2 items-center' : 'w-64 p-4'
              }`}
            >
              {isSidebarCollapsed ? (
                /* Collapsed Slim Icon Rail (LazyChat / Slack style) */
                <>
                  <div className="w-full flex flex-col items-center space-y-4">
                    <button
                      type="button"
                      onClick={handleToggleSidebar}
                      className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#191138] transition-colors cursor-pointer"
                      title="Expand Menu"
                    >
                      <PanelLeftOpen className="w-4 h-4" />
                    </button>

                    <div className="w-full flex flex-col items-center space-y-1.5">
                      {primarySections.map((section) => {
                        const Icon = section.icon;
                        const isSectionActive = currentPrimarySection.groupId === section.groupId;
                        return (
                          <div key={section.groupId} className="relative group">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab(section.defaultTab);
                                setOpenGroupId(section.groupId);
                              }}
                              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                                isSectionActive
                                  ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white shadow-md shadow-purple-500/20'
                                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#191138] hover:text-slate-900 dark:hover:text-white'
                              }`}
                            >
                              <Icon className="w-4 h-4 shrink-0" />
                            </button>
                            {/* Hover Tooltip */}
                            <div className="pointer-events-none absolute left-full ml-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-neutral-900 text-white text-[11px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-md">
                              {section.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200/70 dark:border-purple-500/15 w-full flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => setActiveTab('billing')}
                      className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-[#7F22FE] hover:scale-105 transition-transform cursor-pointer"
                      title={isProPlan ? 'Pro Plan Active' : 'Upgrade Plan'}
                    >
                      <Crown className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                /* Full Expanded Sidebar */
                <>
                  <div className="space-y-6">
                  <div className="space-y-1.5">
                    <div className="px-3 pb-1.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      <span>Main Menu</span>
                      <button
                        type="button"
                        onClick={handleToggleSidebar}
                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#191138] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                        title="Collapse Menu (Full Screen)"
                      >
                        <PanelLeftClose className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  {primarySections.map((section) => {
                    const Icon = section.icon;
                    const isSectionActive = currentPrimarySection.groupId === section.groupId;
                    const hasSubTabs = section.tabs.length > 1;
                    const isSubOpen = openGroupId === section.groupId;
                    return (
                      <div
                        key={section.groupId}
                        className={`rounded-2xl transition-all duration-200 border p-1 space-y-1 ${
                          isSectionActive
                            ? 'bg-purple-500/[0.04] dark:bg-purple-500/[0.08] border-purple-500/25 dark:border-purple-500/30 shadow-2xs'
                            : 'bg-white/60 dark:bg-white/[0.02] border-slate-200/60 dark:border-white/[0.04] hover:border-slate-300 dark:hover:border-purple-500/20'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            if (hasSubTabs) {
                              if (isSubOpen) {
                                setOpenGroupId(null);
                              } else {
                                setOpenGroupId(section.groupId);
                                if (!isSectionActive) {
                                  setActiveTab(section.defaultTab);
                                }
                              }
                            } else {
                              setOpenGroupId(null);
                              setActiveTab(section.defaultTab);
                              if (section.defaultTab === 'billing') {
                                setIsLockBypassedForBilling(true);
                              }
                            }
                          }}
                          className={`w-full px-3 py-2 rounded-xl text-[13px] font-bold flex items-center justify-between transition-all cursor-pointer ${
                            isSectionActive
                              ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white shadow-md shadow-purple-500/20'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-[#191138] hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon className="w-4 h-4 shrink-0" />
                            <span className="truncate">{section.label}</span>
                          </div>
                          {hasSubTabs ? (
                            <ChevronDown
                              className={`w-3.5 h-3.5 shrink-0 transition-transform duration-300 ease-in-out ${
                                isSubOpen ? 'rotate-180' : 'rotate-0'
                              } ${
                                isSectionActive
                                  ? 'text-white'
                                  : 'text-slate-400 dark:text-slate-500'
                              }`}
                            />
                          ) : (
                            isSectionActive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                            )
                          )}
                        </button>

                        {/* Smooth Height-Transition Collapsible Sub-Sections Inside Container Box */}
                        {hasSubTabs && (
                          <div
                            className={`grid transition-all duration-300 ease-in-out ${
                              isSubOpen
                                ? 'grid-rows-[1fr] opacity-100 mt-1'
                                : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'
                            }`}
                          >
                            <div className="overflow-hidden">
                              <div className="ml-3 pl-2.5 border-l-2 border-purple-500/25 dark:border-purple-500/35 space-y-0.5 py-1">
                                {section.tabs.map((sub) => {
                                  const SubIcon = sub.icon;
                                  const isSubActive = activeTab === sub.id;
                                  return (
                                    <button
                                      key={sub.id}
                                      type="button"
                                      onClick={() => setActiveTab(sub.id)}
                                      className={`w-full px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between gap-2 transition-all cursor-pointer ${
                                        isSubActive
                                          ? 'bg-purple-100/80 dark:bg-purple-500/25 text-[#7C3AED] dark:text-purple-300 font-bold shadow-2xs'
                                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-[#191138] hover:text-slate-900 dark:hover:text-white font-medium'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-[#7C3AED] dark:text-purple-300' : 'text-slate-400'}`} />
                                        <span className="truncate">{sub.label}</span>
                                      </div>
                                      {sub.isProOnly && !isProPlan ? (
                                        <span className="px-1.5 py-0.2 rounded-full bg-gradient-to-r from-[#7F22FE] to-[#DB2777] text-white text-[9px] font-black uppercase shrink-0 flex items-center gap-0.5">
                                          <Lock className="w-2.5 h-2.5" />
                                          <span>PRO</span>
                                        </span>
                                      ) : (
                                        isSubActive && (
                                          <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] dark:bg-purple-400 shrink-0" />
                                        )
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              </>
              )}
            </aside>

            {/* Main Content Area */}
            <main
              className={`flex-1 min-w-0 w-full ${
                activeTab === 'inbox'
                  ? 'max-w-none p-1 sm:p-2 lg:p-2.5 pb-16 md:pb-2 flex flex-col min-h-0 h-[calc(100dvh-6.25rem)] md:h-[calc(100vh-4rem)] overflow-hidden'
                  : 'max-w-[1280px] mx-auto p-3.5 sm:p-6 lg:p-7 pb-20 md:pb-7'
              }`}
            >
              {/* Show Trial / Expiry Alert Banner ONLY when trial is expiring or expired (no duplicate banner on active plans) */}
              {activeTab !== 'billing' &&
                activeTab !== 'inbox' &&
                subStatus &&
                (subStatus.isExpired || subStatus.subscription?.status === 'pending_approval') && (
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
                  onOpenTour={(step) => {
                    setTourInitialStep(step || 1);
                    setIsTourOpen(true);
                  }}
                />
              )}

              {activeTab === 'orders' && (
                <OrdersView
                  isProPlan={isProPlan}
                  onUpgradeToPro={handleNavigateToProUpgrade}
                  onGoToInbox={() => {
                    setActiveTab('inbox');
                  }}
                />
              )}

              {activeTab === 'delivery-courier' && (
                <DeliveryCourierListView />
              )}

              {activeTab === 'appointments' && (
                <ProFeatureBlurWrapper
                  isProPlan={isProPlan}
                  featureTitle="AI Appointments & Auto-Slot Booking"
                  featureSubtitleBn="চ্যাট থেকে অটোমেটিক অ্যাপয়েন্টমেন্ট বুকিং এবং ক্যালেন্ডার শিডিউলিং শুধুমাত্র Pro Business Plan মেম্বারদের জন্য আনলক করা থাকে।"
                  highlights={[
                    'Autonomous Chat Appointment & Slot Booking',
                    'Service Duration, Time Slot & Reminder Management',
                    'Direct Customer Chat Handover from Calendar'
                  ]}
                  onUpgradeToPro={handleNavigateToProUpgrade}
                >
                  <AppointmentsView
                    onOpenCustomerChat={(platform, customerId) => {
                      setInboxTargetConvKey(`${platform}_${customerId}`);
                      setActiveTab('inbox');
                    }}
                  />
                </ProFeatureBlurWrapper>
              )}

              {activeTab === 'stores' && (
                <div className="p-8 rounded-3xl bg-white dark:bg-[#120B2E] border border-slate-200 dark:border-purple-500/20 text-center max-w-lg mx-auto space-y-4 my-8 animate-in fade-in">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/70 text-[#7C3AED] flex items-center justify-center mx-auto">
                    <Globe className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Website &amp; Store Sync is Now in Channels
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    You can connect your WooCommerce, Shopify, or Custom Website directly under Connect Channels alongside WhatsApp, Messenger, and Instagram.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('channels')}
                    className="px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>Open Connect Channels</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {activeTab === 'website-widget' && (
                <ProFeatureBlurWrapper
                  isProPlan={isProPlan}
                  featureTitle="Embeddable Website Live AI Chat Widget"
                  featureSubtitleBn="যেকোনো ওয়েবসাইটে ১-ক্লিকে AI Live Chat Widget যুক্ত করার ফিচারটি শুধুমাত্র Pro Business Plan মেম্বারদের জন্য।"
                  highlights={[
                    '1-Line Script Embed for WordPress, Shopify & Custom Sites',
                    '24/7 Voice, Image & Product Search on Your Website',
                    'All Website Visitors Synced to Unified Inbox'
                  ]}
                  onUpgradeToPro={handleNavigateToProUpgrade}
                >
                  <WebsiteWidgetView
                    currentUser={currentUser}
                    onNavigateToInbox={() => {
                      setActiveTab('inbox');
                    }}
                  />
                </ProFeatureBlurWrapper>
              )}

              {activeTab === 'call-requests' && (
                <ProFeatureBlurWrapper
                  isProPlan={isProPlan}
                  featureTitle="Customer Call Requests & Human Handover Queue"
                  featureSubtitleBn="কাস্টমার কল রিকোয়েস্ট কিউ এবং হিউম্যান হ্যান্ডওভার ট্র্যাকিং শুধুমাত্র Pro Business Plan মেম্বারদের জন্য।"
                  highlights={[
                    'Automatic Detection When Customers Ask for a Phone Call',
                    'Priority Callback Queue with Customer Phone & Notes',
                    '1-Click Call Status Tracking & Chat Jump'
                  ]}
                  onUpgradeToPro={handleNavigateToProUpgrade}
                >
                  <CallRequestsView
                    onNavigateToOrders={() => {
                      setActiveTab('orders');
                    }}
                    onOpenCustomerChat={(platform, customerId) => {
                      setInboxTargetConvKey(`${platform}_${customerId}`);
                      setActiveTab('inbox');
                    }}
                  />
                </ProFeatureBlurWrapper>
              )}

              {activeTab === 'inbox' && (
                <UnifiedInbox
                  channels={channels}
                  initialConvKey={inboxTargetConvKey}
                  isProPlan={isProPlan}
                  onUpgradeToPro={handleNavigateToProUpgrade}
                  isSidebarCollapsed={isSidebarCollapsed}
                  onToggleSidebar={handleToggleSidebar}
                  onNavigate={(tab) => {
                    setActiveTab(tab as any);
                    if (tab === 'billing') setIsLockBypassedForBilling(true);
                  }}
                />
              )}

              {activeTab === 'products' && (
                <ProductsView onNavigate={(tab) => setActiveTab(tab as any)} />
              )}

              {activeTab === 'agents' && (
                <AgentsView
                  currentUser={currentUser}
                  subStatus={subStatus}
                  channels={channels}
                  onNavigate={(tab) => {
                    setActiveTab(tab as any);
                    if (tab === 'billing') setIsLockBypassedForBilling(true);
                  }}
                  onRefreshChannels={refreshUserData}
                />
              )}

              {activeTab === 'channels' && (
                <ChannelsView
                  channels={channels}
                  currentUser={currentUser}
                  subStatus={subStatus}
                  onRefresh={refreshUserData}
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
                <ContactsView
                  isProPlan={isProPlan}
                  onUpgradeToPro={handleNavigateToProUpgrade}
                />
              )}

              {activeTab === 'email-campaigns' && (
                <ProFeatureBlurWrapper
                  isProPlan={isProPlan}
                  featureTitle="AI Broadcast & Email Marketing Campaigns"
                  featureSubtitleBn="সব কাস্টমারের কাছে এক ক্লিকে প্রমোশনাল অফার ও ইমেইল ক্যাম্পেইন পাঠানোর সুবিধাটি শুধুমাত্র Pro Business Plan-এ রয়েছে।"
                  highlights={[
                    'AI-Generated Promotional Broadcasts & Offer Templates',
                    'Targeted Customer Segment Retargeting',
                    'Campaign Delivery Analytics & Conversion Tracking'
                  ]}
                  onUpgradeToPro={handleNavigateToProUpgrade}
                >
                  <EmailCampaignsView />
                </ProFeatureBlurWrapper>
              )}

              {activeTab === 'business-erp' && (
                <ProFeatureBlurWrapper
                  isProPlan={isProPlan}
                  featureTitle="Accounts, Stock, Due & Profit ERP"
                  featureSubtitleBn="প্রতিদিনের বিক্রি (Sales), ক্রয় (Purchase), স্টক হিসাব, বাকি (Due) এবং লাভ-ক্ষতির সম্পূর্ণ ERP সিস্টেমটি শুধুমাত্র Pro Business Plan মেম্বারদের জন্য।"
                  highlights={[
                    'Automated Sales, Purchase & Inventory Stock Ledger',
                    'Customer Due / Baki Tracking & Cashbook Balance',
                    'Real-Time Net Profit, Expense & Financial Reports'
                  ]}
                  onUpgradeToPro={handleNavigateToProUpgrade}
                >
                  <BusinessErpView />
                </ProFeatureBlurWrapper>
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

          {/* MOBILE BOTTOM NAVIGATION BAR (Fast 1-Tap Switching on Phone View) */}
          <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 h-14 bg-white/95 dark:bg-[#0F0A24]/95 backdrop-blur-xl border-t border-slate-200/85 dark:border-purple-500/20 px-1.5 flex items-center justify-around shadow-[0_-4px_20px_rgba(15,23,42,0.06)]">
            {[
              { id: 'overview', groupId: 'dashboard', label: 'Home', icon: LayoutDashboard },
              { id: 'inbox', groupId: 'inbox-hub', label: 'Inbox', icon: MessageSquare },
              { id: 'orders', groupId: 'orders-hub', label: 'Orders', icon: ShoppingBag },
              { id: 'products', groupId: 'catalog-hub', label: 'Products', icon: Package },
              { id: 'channels', groupId: 'ai-channels-hub', label: 'AI & Meta', icon: Bot }
            ].map((item) => {
              const Icon = item.icon;
              const isItemActive = currentPrimarySection.groupId === item.groupId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setActiveTab(item.id as TabId);
                  }}
                  className={`flex-1 py-1.5 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                    isItemActive
                      ? 'text-[#7C3AED] dark:text-purple-400 font-extrabold'
                      : 'text-slate-500 dark:text-slate-400 font-semibold'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isItemActive ? 'stroke-[2.5]' : ''}`} />
                  <span className="text-[10px] leading-tight">{item.label}</span>
                </button>
              );
            })}
          </nav>

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
          initialStep={tourInitialStep}
        />
      )}

      {/* Official One Agent BD Website AI Chatbot (Shown on Public Landing & Demo Pages) */}
      {(currentView === 'landing' || currentView === 'demo') && <SaasWebsiteChatbot />}
    </div>
  );
}
