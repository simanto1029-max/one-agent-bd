import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  CheckCircle2,
  XCircle,
  Sparkles,
  Search,
  Phone,
  MapPin,
  Copy,
  Check,
  ExternalLink,
  Settings,
  Trash2,
  RefreshCw,
  Bot,
  MessageSquare,
  Download,
  UserCheck,
  CalendarCheck
} from 'lucide-react';
import { api } from '../../api';
import {
  Appointment,
  AppointmentBookingSettings,
  AppointmentStats,
  SlotAvailabilityInfo
} from '../../types';

interface AppointmentsViewProps {
  onOpenCustomerChat?: (platform: 'whatsapp' | 'messenger' | 'instagram', customerId: string) => void;
}

const DAYS_OF_WEEK = [
  'Saturday',
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday'
];

const BUSINESS_CATEGORIES = [
  'General Consultation & Service Booking',
  'Clinic / Doctor Chamber & Healthcare',
  'Beauty Parlor, Salon & Spa',
  'Agency, IT & Business Consultancy',
  'Restaurant & Table Reservation',
  'Showroom Visit & Product Demo'
];

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({ onOpenCustomerChat }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [settings, setSettings] = useState<AppointmentBookingSettings | null>(null);
  const [stats, setStats] = useState<AppointmentStats>({
    totalBookings: 0,
    todayBookings: 0,
    upcomingBookings: 0,
    aiBookedCount: 0,
    completedCount: 0,
    cancelledCount: 0
  });
  const [icalFeedPath, setIcalFeedPath] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Date & Slot Availability Explorer
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [slotInfo, setSlotInfo] = useState<SlotAvailabilityInfo | null>(null);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'today' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isSimulatorModalOpen, setIsSimulatorModalOpen] = useState<boolean>(false);
  const [isCalendarSyncModalOpen, setIsCalendarSyncModalOpen] = useState<boolean>(false);

  // Feedback Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedFeed, setCopiedFeed] = useState<boolean>(false);

  // Manual Booking Form State
  const [newCustomerName, setNewCustomerName] = useState<string>('');
  const [newCustomerPhone, setNewCustomerPhone] = useState<string>('');
  const [newServiceName, setNewServiceName] = useState<string>('');
  const [newDate, setNewDate] = useState<string>(selectedDate);
  const [newTime, setNewTime] = useState<string>('11:00 AM');
  const [newPlatform, setNewPlatform] = useState<'whatsapp' | 'messenger' | 'instagram' | 'website' | 'manual'>('whatsapp');
  const [newNotes, setNewNotes] = useState<string>('');
  const [submittingBooking, setSubmittingBooking] = useState<boolean>(false);

  // Settings Form State
  const [editSettings, setEditSettings] = useState<AppointmentBookingSettings | null>(null);
  const [newSlotInput, setNewSlotInput] = useState<string>('');
  const [newServiceInput, setNewServiceInput] = useState<string>('');
  const [savingSettings, setSavingSettings] = useState<boolean>(false);

  // AI Simulator State
  const [simName, setSimName] = useState<string>('Tanvir Hasan');
  const [simPhone, setSimPhone] = useState<string>('01712345678');
  const [simPlatform, setSimPlatform] = useState<'whatsapp' | 'messenger' | 'instagram' | 'website'>('messenger');
  const [simMessage, setSimMessage] = useState<string>(
    'Agamikal bikel 4:00 PM a consultation appointment book korte chai. Amar nam Tanvir Hasan, mobile 01712345678'
  );
  const [simLoading, setSimLoading] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<{
    aiReply: string;
    bookedAppointment: Appointment | null;
  } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const data = await api.getAppointments();
      setAppointments(data.appointments || []);
      setSettings(data.settings || null);
      setEditSettings(data.settings || null);
      if (data.stats) setStats(data.stats);
      if (data.icalFeedPath) setIcalFeedPath(data.icalFeedPath);
      if (data.settings?.services_offered?.[0] && !newServiceName) {
        setNewServiceName(data.settings.services_offered[0]);
      }
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSlotsForDate = async (dateStr: string) => {
    try {
      setLoadingSlots(true);
      const info = await api.getAppointmentSlots(dateStr);
      setSlotInfo(info);
    } catch (err) {
      console.error('Failed to fetch slots:', err);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    fetchSlotsForDate(selectedDate);
  }, [selectedDate, appointments.length]);

  const handleCreateManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim() || !newCustomerPhone.trim()) return;
    try {
      setSubmittingBooking(true);
      const res = await api.createAppointment({
        customer_name: newCustomerName.trim(),
        customer_phone: newCustomerPhone.trim(),
        service_name: newServiceName || settings?.services_offered?.[0] || 'General Consultation',
        appointment_date: newDate,
        appointment_time: newTime,
        platform: newPlatform,
        notes: newNotes.trim()
      });
      setIsNewModalOpen(false);
      setNewCustomerName('');
      setNewCustomerPhone('');
      setNewNotes('');
      await fetchAllData();
      await fetchSlotsForDate(selectedDate);
      showToast(res.message || 'Appointment scheduled successfully!');
    } catch (err: any) {
      showToast(err.message || 'Failed to schedule appointment');
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleUpdateStatus = async (
    id: string,
    status: 'confirmed' | 'pending' | 'completed' | 'cancelled'
  ) => {
    try {
      await api.updateAppointment(id, { status });
      await fetchAllData();
      await fetchSlotsForDate(selectedDate);
      showToast(`Appointment marked as ${status}.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update status');
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    try {
      await api.deleteAppointment(id);
      await fetchAllData();
      await fetchSlotsForDate(selectedDate);
      showToast('Appointment removed from schedule.');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete appointment');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSettings) return;
    try {
      setSavingSettings(true);
      const res = await api.updateAppointmentSettings(editSettings);
      setSettings(res.settings);
      setEditSettings(res.settings);
      setIsSettingsModalOpen(false);
      await fetchSlotsForDate(selectedDate);
      showToast('AI Appointment & Calendar settings saved!');
    } catch (err: any) {
      showToast(err.message || 'Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleRunSimulator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simMessage.trim()) return;
    try {
      setSimLoading(true);
      setSimResult(null);
      const res = await api.simulateAppointmentBooking({
        customerName: simName.trim() || 'Tanvir Hasan',
        customerPhone: simPhone.trim() || '01712345678',
        platform: simPlatform,
        messageText: simMessage.trim()
      });
      setSimResult({
        aiReply: res.aiReply,
        bookedAppointment: res.bookedAppointment
      });
      await fetchAllData();
      await fetchSlotsForDate(selectedDate);
      if (res.bookedAppointment) {
        showToast(
          `AI auto-booked slot: ${res.bookedAppointment.appointment_date} at ${res.bookedAppointment.appointment_time}!`
        );
      }
    } catch (err: any) {
      showToast(err.message || 'Simulation failed');
    } finally {
      setSimLoading(false);
    }
  };

  const fullIcalUrl =
    typeof window !== 'undefined' && icalFeedPath
      ? `${window.location.origin}${icalFeedPath}`
      : icalFeedPath;

  const handleCopyIcalUrl = () => {
    if (!fullIcalUrl) return;
    navigator.clipboard.writeText(fullIcalUrl);
    setCopiedFeed(true);
    setTimeout(() => setCopiedFeed(false), 2500);
    showToast('Google Calendar Sync URL copied to clipboard!');
  };

  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  const filteredAppointments = appointments.filter((apt) => {
    if (statusFilter === 'today' && apt.appointment_date !== todayStr) return false;
    if (statusFilter === 'confirmed' && apt.status !== 'confirmed') return false;
    if (statusFilter === 'completed' && apt.status !== 'completed') return false;
    if (statusFilter === 'cancelled' && apt.status !== 'cancelled') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        apt.customer_name.toLowerCase().includes(q) ||
        apt.customer_phone.toLowerCase().includes(q) ||
        apt.service_name.toLowerCase().includes(q) ||
        apt.appointment_date.includes(q) ||
        apt.appointment_time.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-xs font-bold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header & Primary Action Controls */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#110C26] border border-slate-200/80 dark:border-purple-500/20 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#7C3AED] dark:text-purple-400">
            <Calendar className="w-4 h-4" />
            <span>AI Appointment & Booking Automation</span>
            <span aria-hidden="true">·</span>
            <span>{settings?.enabled ? '24/7 Active in Chat' : 'Paused'}</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Appointments & Google Calendar Sync
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
            Your AI agent automatically checks available time slots during WhatsApp, Messenger, Instagram, and Website chats, books customer appointments without double-booking, and syncs directly with Google Calendar.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsSimulatorModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-[#7C3AED] dark:text-purple-300 border border-purple-200/70 dark:border-purple-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            <span>Test AI Booking</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCalendarSyncModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#191235] hover:bg-slate-200/80 dark:hover:bg-[#23194A] text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <CalendarCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Google Calendar Sync</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditSettings(settings);
              setIsSettingsModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#191235] hover:bg-slate-200/80 dark:hover:bg-[#23194A] text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span>Working Hours & Slots</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setNewDate(selectedDate);
              setIsNewModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7E22CE] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-purple-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Appointment</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#110C26] border border-slate-200/80 dark:border-purple-500/20">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Total Appointments
          </div>
          <div className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
            {stats.totalBookings}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            {stats.upcomingBookings} upcoming confirmed
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#110C26] border border-slate-200/80 dark:border-purple-500/20">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Today&apos;s Schedule
          </div>
          <div className="mt-1 text-2xl font-extrabold text-[#7C3AED] dark:text-purple-400">
            {stats.todayBookings}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Date: {todayStr}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#110C26] border border-slate-200/80 dark:border-purple-500/20">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            AI Auto-Booked in Chat
          </div>
          <div className="mt-1 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {stats.aiBookedCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Zero manual intervention
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#110C26] border border-slate-200/80 dark:border-purple-500/20">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Completed Visits
          </div>
          <div className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
            {stats.completedCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            {stats.cancelledCount} cancelled
          </div>
        </div>
      </div>

      {/* Live Daily Time Slot Availability Matrix */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#110C26] border border-slate-200/80 dark:border-purple-500/20 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#7C3AED] dark:text-purple-400" />
              <span>Live Time Slot Availability Matrix</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select any date to inspect open vs booked slots. Click any open slot to schedule an appointment immediately.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedDate(todayStr)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedDate === todayStr
                  ? 'bg-[#7C3AED] text-white'
                  : 'bg-slate-100 dark:bg-[#191235] text-slate-700 dark:text-slate-300'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => {
                const tmr = new Date(Date.now() + 86400000);
                setSelectedDate(
                  `${tmr.getFullYear()}-${String(tmr.getMonth() + 1).padStart(2, '0')}-${String(tmr.getDate()).padStart(2, '0')}`
                );
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-[#191235] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#23194A] transition-colors cursor-pointer"
            >
              Tomorrow
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 dark:bg-[#191235] border border-slate-200 dark:border-purple-500/30 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {loadingSlots ? (
          <div className="py-6 text-center text-xs text-slate-400">Checking live schedule...</div>
        ) : slotInfo ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <span className="font-bold text-slate-900 dark:text-white">
                {slotInfo.dayOfWeek}, {slotInfo.date}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {slotInfo.isDayOpen
                  ? `${slotInfo.availableSlots.length} of ${slotInfo.allSlots.length} slots open`
                  : 'Marked as weekly off-day in settings'}
              </span>
              <span aria-hidden="true">·</span>
              <span>Duration: {settings?.slot_duration_minutes || 30} mins/slot</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
              {slotInfo.allSlots.map((slot) => {
                const bookedApt = slotInfo.appointmentsOnDate.find(
                  (a) => a.appointment_time.toLowerCase() === slot.toLowerCase() && a.status !== 'cancelled'
                );
                const isBooked = Boolean(bookedApt);

                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => {
                      if (!isBooked) {
                        setNewDate(selectedDate);
                        setNewTime(slot);
                        setIsNewModalOpen(true);
                      }
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isBooked
                        ? 'bg-purple-50/70 dark:bg-purple-950/40 border-purple-300 dark:border-purple-500/40 cursor-default'
                        : 'bg-slate-50/70 dark:bg-[#161030] border-slate-200/80 dark:border-purple-500/15 hover:border-emerald-400 dark:hover:border-emerald-500/50 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                        {slot}
                      </span>
                      <span
                        className={`text-[10px] font-bold ${
                          isBooked
                            ? 'text-[#7C3AED] dark:text-purple-300'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {isBooked ? 'Booked' : 'Open'}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {bookedApt ? `${bookedApt.customer_name}` : 'Click to schedule'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      {/* Filter Bar & Appointments List */}
      <div className="rounded-2xl bg-white dark:bg-[#110C26] border border-slate-200/80 dark:border-purple-500/20 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Interactive Filter Controls */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-[#191235] rounded-xl">
            {(
              [
                { id: 'all', label: `All (${appointments.length})` },
                { id: 'today', label: `Today (${stats.todayBookings})` },
                { id: 'confirmed', label: 'Confirmed' },
                { id: 'completed', label: 'Completed' },
                { id: 'cancelled', label: 'Cancelled' }
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-white dark:bg-[#7C3AED] text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search client, phone, service..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#191235] border border-slate-200 dark:border-purple-500/20 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#7C3AED]"
              />
            </div>
            <button
              type="button"
              onClick={fetchAllData}
              title="Refresh schedule"
              className="p-2 rounded-xl bg-slate-100 dark:bg-[#191235] hover:bg-slate-200 dark:hover:bg-[#23194A] text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Loading appointments schedule...
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Calendar className="w-8 h-8 text-[#7C3AED] dark:text-purple-400 mx-auto opacity-80" />
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No appointments found for this filter
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              When customers ask to book an appointment or consultation on WhatsApp, Messenger, Instagram, or your Website, the AI will automatically check open slots and log bookings here.
            </p>
            <div className="pt-1 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setIsSimulatorModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-300 text-xs font-bold cursor-pointer"
              >
                Simulate Customer Booking
              </button>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-[#7C3AED] text-white text-xs font-bold cursor-pointer"
              >
                Add Manual Booking
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-200/70 dark:divide-purple-500/15">
            {filteredAppointments.map((apt) => (
              <div
                key={apt.id}
                className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-[#161030]/60 transition-colors"
              >
                <div className="space-y-1.5">
                  {/* Unboxed clean metadata line */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-[#7C3AED] dark:text-purple-300">
                      {apt.appointment_date} at {apt.appointment_time}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{apt.duration_minutes || 30} mins</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">Via {apt.platform}</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {apt.booking_source === 'ai_chat' || apt.booking_source === 'website'
                        ? 'AI Auto-Booked'
                        : 'Manual Schedule'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={`font-bold capitalize ${
                        apt.status === 'confirmed'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : apt.status === 'completed'
                          ? 'text-blue-600 dark:text-blue-400'
                          : apt.status === 'cancelled'
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>

                  <div className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{apt.customer_name}</span>
                    <span className="text-slate-400 font-normal">—</span>
                    <span className="text-slate-700 dark:text-slate-300 font-semibold">
                      {apt.service_name}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{apt.customer_phone}</span>
                    </span>
                    {apt.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{apt.location}</span>
                      </span>
                    )}
                    {apt.notes && (
                      <span className="text-slate-400 dark:text-slate-500 truncate max-w-md">
                        Note: {apt.notes}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {apt.google_calendar_url && (
                    <a
                      href={apt.google_calendar_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-700/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Add to Google Calendar</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  {onOpenCustomerChat &&
                    (apt.platform === 'whatsapp' ||
                      apt.platform === 'messenger' ||
                      apt.platform === 'instagram') && (
                      <button
                        type="button"
                        onClick={() => onOpenCustomerChat(apt.platform as any, apt.customer_id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#191235] hover:bg-slate-200 dark:hover:bg-[#23194A] text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Open Chat</span>
                      </button>
                    )}

                  {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(apt.id, 'completed')}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Complete</span>
                    </button>
                  )}

                  {apt.status !== 'cancelled' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(apt.id, 'cancelled')}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeleteAppointment(apt.id)}
                    title="Delete appointment"
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 1. GOOGLE CALENDAR SYNC HUB MODAL */}
      {isCalendarSyncModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#120C2B] border border-slate-200 dark:border-purple-500/30 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Google Calendar Auto-Sync Hub
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Connect your schedule with Google Calendar, Apple Calendar, or Outlook
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCalendarSyncModalOpen(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                Close ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#191235] border border-slate-200/80 dark:border-purple-500/20 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white">
                  Option 1: Live Auto-Sync Feed URL (Recommended for Google Calendar)
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Copy this live iCal (.ics) feed URL and add it in Google Calendar under{' '}
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    Other calendars (+) &rarr; From URL
                  </span>
                  . Every new AI-booked appointment will automatically appear in your Google Calendar.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    readOnly
                    value={fullIcalUrl}
                    className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-[#0F0A24] border border-slate-200 dark:border-purple-500/20 text-[11px] font-mono text-slate-700 dark:text-slate-300"
                  />
                  <button
                    type="button"
                    onClick={handleCopyIcalUrl}
                    className="px-3 py-2 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    {copiedFeed ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedFeed ? 'Copied' : 'Copy URL'}</span>
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#191235] border border-slate-200/80 dark:border-purple-500/20 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white">
                  Option 2: 1-Click Direct Event Push & .ICS Export
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Click &ldquo;Add to Google Calendar&rdquo; on any booking row to open Google Calendar with all client details pre-filled, or download the full schedule file below.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {fullIcalUrl && (
                    <a
                      href={fullIcalUrl}
                      download="oneagentbd-appointments.ics"
                      className="px-3.5 py-2 rounded-lg bg-slate-200/80 dark:bg-[#23194A] text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .ICS File</span>
                    </a>
                  )}
                  <a
                    href="https://calendar.google.com/calendar/u/0/r/settings/addbyurl"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Google Calendar Settings</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. MANUAL APPOINTMENT CREATION MODAL */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs">
          <form
            onSubmit={handleCreateManualBooking}
            className="w-full max-w-md rounded-2xl bg-white dark:bg-[#120C2B] border border-slate-200 dark:border-purple-500/30 shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Schedule New Appointment
              </h3>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                Close ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Client Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="e.g. Mahmudul Hasan"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#191235] border border-slate-200 dark:border-purple-500/30 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Client Phone Number *
                </label>
                <input
                  type="text"
                  required
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  placeholder="e.g. 01712345678"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#191235] border border-slate-200 dark:border-purple-500/30 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Service / Consultation Type
                </label>
                <input
                  type="text"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="e.g. General Consultation"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#191235] border border-slate-200 dark:border-purple-500/30 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#191235] border border-slate-200 dark:border-purple-500/30 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Time Slot
                  </label>
                  <select
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#191235] border border-slate-200 dark:border-purple-500/30 text-xs text-slate-900 dark:text-white"
                  >
                    {(settings?.available_slots || ['10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM', '06:00 PM']).map(
                      (slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Channel Source
                </label>
                <select
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#191235] border border-slate-200 dark:border-purple-500/30 text-xs text-slate-900 dark:text-white"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="messenger">Facebook Messenger</option>
                  <option value="instagram">Instagram</option>
                  <option value="website">Website Chat</option>
                  <option value="manual">Phone / Walk-in</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Any special client notes..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#191235] border border-slate-200 dark:border-purple-500/30 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#191235] text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingBooking}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {submittingBooking ? 'Scheduling...' : 'Confirm & Sync Slot'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. WORKING HOURS & SLOTS CONFIGURATION MODAL */}
      {isSettingsModalOpen && editSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs">
          <form
            onSubmit={handleSaveSettings}
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#120C2B] border border-slate-200 dark:border-purple-500/30 shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  AI Booking & Working Hours Settings
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Configure when your AI agent can schedule customer appointments
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                Close ✕
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#191235] border border-slate-200/80 dark:border-purple-500/20">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Enable AI Chat Appointment Booking
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Allow AI to check available slots and confirm appointments in chat
                </div>
              </div>
              <input
                type="checkbox"
                checked={editSettings.enabled}
                onChange={(e) =>
                  setEditSettings({ ...editSettings, enabled: e.target.checked })
                }
                className="w-4 h-4 accent-[#7C3AED] cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Business Category
                </label>
                <select
                  value={editSettings.business_type}
                  onChange={(e) =>
                    setEditSettings({ ...editSettings, business_type: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#191235] border border-slate-200 dark:border-purple-500/30 text-xs text-slate-900 dark:text-white"
                >
                  {BUSINESS_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Slot Duration (Minutes)
                </label>
                <select
                  value={editSettings.slot_duration_minutes}
                  onChange={(e) =>
                    setEditSettings({
                      ...editSettings,
                      slot_duration_minutes: Number(e.target.value)
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#191235] border border-slate-200 dark:border-purple-500/30 text-xs text-slate-900 dark:text-white"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes (1 Hour)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Open Working Days
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DAYS_OF_WEEK.map((day) => {
                  const isSelected = editSettings.available_days.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        const updatedDays = isSelected
                          ? editSettings.available_days.filter((d) => d !== day)
                          : [...editSettings.available_days, day];
                        setEditSettings({ ...editSettings, available_days: updatedDays });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#7C3AED] text-white'
                          : 'bg-slate-100 dark:bg-[#191235] text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Daily Time Slots (AI offers these open slots to customers)
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {editSettings.available_slots.map((slot) => (
                  <div
                    key={slot}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#191235] text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"
                  >
                    <span>{slot}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setEditSettings({
                          ...editSettings,
                          available_slots: editSettings.available_slots.filter((s) => s !== slot)
                        })
                      }
                      className="text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSlotInput}
                  onChange={(e) => setNewSlotInput(e.target.value)}
                  placeholder="Add time slot, e.g. 04:30 PM"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#191235] border border-slate-200 dark:border-purple-500/30 text-xs text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newSlotInput.trim()) {
                      setEditSettings({
                        ...editSettings,
                        available_slots: [...editSettings.available_slots, newSlotInput.trim()]
                      });
                      setNewSlotInput('');
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-[#23194A] text-xs font-bold text-slate-800 dark:text-white cursor-pointer"
                >
                  + Add Slot
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Services / Appointment Types Offered
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {editSettings.services_offered.map((srv) => (
                  <div
                    key={srv}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#191235] text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"
                  >
                    <span>{srv}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setEditSettings({
                          ...editSettings,
                          services_offered: editSettings.services_offered.filter((s) => s !== srv)
                        })
                      }
                      className="text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newServiceInput}
                  onChange={(e) => setNewServiceInput(e.target.value)}
                  placeholder="Add service, e.g. Skin Consultation"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#191235] border border-slate-200 dark:border-purple-500/30 text-xs text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newServiceInput.trim()) {
                      setEditSettings({
                        ...editSettings,
                        services_offered: [...editSettings.services_offered, newServiceInput.trim()]
                      });
                      setNewServiceInput('');
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-[#23194A] text-xs font-bold text-slate-800 dark:text-white cursor-pointer"
                >
                  + Add Service
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Location Address or Meeting Link
              </label>
              <input
                type="text"
                value={editSettings.location_address}
                onChange={(e) =>
                  setEditSettings({ ...editSettings, location_address: e.target.value })
                }
                placeholder="e.g. Banani Road 11, Dhaka / Google Meet"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#191235] border border-slate-200 dark:border-purple-500/30 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#191235] text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingSettings}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {savingSettings ? 'Saving...' : 'Save Booking Settings'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. INTERACTIVE AI BOOKING SIMULATOR MODAL */}
      {isSimulatorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#120C2B] border border-slate-200 dark:border-purple-500/30 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#7C3AED] dark:text-purple-400" />
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Live AI Appointment Booking Simulator
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Test how the AI checks open slots and logs customer bookings from chat
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSimulatorModalOpen(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                Close ✕
              </button>
            </div>

            <form onSubmit={handleRunSimulator} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={simName}
                    onChange={(e) => setSimName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#191235] border border-slate-200 dark:border-purple-500/30 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Customer Phone
                  </label>
                  <input
                    type="text"
                    value={simPhone}
                    onChange={(e) => setSimPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#191235] border border-slate-200 dark:border-purple-500/30 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Simulated Customer Message (Supports Bangla, Banglish, or English)
                </label>
                <textarea
                  rows={3}
                  value={simMessage}
                  onChange={(e) => setSimMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#191235] border border-slate-200 dark:border-purple-500/30 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="submit"
                  disabled={simLoading}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Bot className="w-4 h-4" />
                  <span>{simLoading ? 'AI Checking Calendar...' : 'Send & Auto-Book Slot'}</span>
                </button>
              </div>
            </form>

            {simResult && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#191235] border border-slate-200 dark:border-purple-500/20 space-y-3">
                <div>
                  <div className="text-[11px] font-bold text-[#7C3AED] dark:text-purple-400">
                    AI Assistant Reply:
                  </div>
                  <p className="mt-1 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-line">
                    {simResult.aiReply}
                  </p>
                </div>

                {simResult.bookedAppointment && (
                  <div className="pt-2 border-t border-slate-200/80 dark:border-purple-500/20 flex items-center justify-between gap-2">
                    <div className="text-xs text-emerald-700 dark:text-emerald-300 font-bold">
                      Booked: {simResult.bookedAppointment.appointment_date} at{' '}
                      {simResult.bookedAppointment.appointment_time}
                    </div>
                    {simResult.bookedAppointment.google_calendar_url && (
                      <a
                        href={simResult.bookedAppointment.google_calendar_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center gap-1"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Add to Google Calendar</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
