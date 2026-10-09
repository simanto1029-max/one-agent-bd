import React, { useState, useEffect } from 'react';
import {
  Truck,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  X,
  Plus,
  Save,
  Play,
  RotateCcw,
  Info
} from 'lucide-react';
import { AutoCourierDispatchSettings } from '../../types';
import { api } from '../../api';
import { COURIER_PROVIDERS } from '../../utils/courierUtils';

interface AutoCourierSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsSaved?: (settings: AutoCourierDispatchSettings) => void;
  onTriggerRunNow?: () => void;
}

export const AutoCourierSettingsModal: React.FC<AutoCourierSettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsSaved,
  onTriggerRunNow
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newTimeInput, setNewTimeInput] = useState('23:00');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [settings, setSettings] = useState<AutoCourierDispatchSettings>({
    enabled: true,
    scheduled_times: ['10:00', '23:00'],
    default_courier: 'steadfast',
    fraud_check_enabled: true,
    risk_rules: {
      min_address_length: 12,
      require_valid_phone: true,
      flag_duplicate_phones: true,
      max_cod_amount_auto: 5000,
      flag_unspecified_items: true
    }
  });

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setSaveSuccess(false);
    api.getAutoCourierSettings()
      .then((data) => {
        if (data) {
          setSettings({
            enabled: data.enabled ?? true,
            scheduled_times: Array.isArray(data.scheduled_times) && data.scheduled_times.length > 0
              ? data.scheduled_times
              : ['10:00', '23:00'],
            default_courier: data.default_courier || 'steadfast',
            fraud_check_enabled: data.fraud_check_enabled ?? true,
            risk_rules: {
              min_address_length: data.risk_rules?.min_address_length ?? 12,
              require_valid_phone: data.risk_rules?.require_valid_phone ?? true,
              flag_duplicate_phones: data.risk_rules?.flag_duplicate_phones ?? true,
              max_cod_amount_auto: data.risk_rules?.max_cod_amount_auto ?? 5000,
              flag_unspecified_items: data.risk_rules?.flag_unspecified_items ?? true
            },
            last_run_at: data.last_run_at,
            last_run_summary: data.last_run_summary
          });
        }
      })
      .catch((err) => console.error('Failed to load auto courier settings:', err))
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleEnabled = () => {
    setSettings((prev) => ({ ...prev, enabled: !prev.enabled }));
  };

  const handleAddTime = (timeStr: string) => {
    const formatted = timeStr.trim();
    if (!formatted || !/^\d{2}:\d{2}$/.test(formatted)) return;
    if (settings.scheduled_times.includes(formatted)) return;
    setSettings((prev) => ({
      ...prev,
      scheduled_times: [...prev.scheduled_times, formatted].sort()
    }));
  };

  const handleRemoveTime = (timeToRemove: string) => {
    setSettings((prev) => ({
      ...prev,
      scheduled_times: prev.scheduled_times.filter((t) => t !== timeToRemove)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.saveAutoCourierSettings(settings);
      setSaveSuccess(true);
      if (onSettingsSaved && res.settings) {
        onSettingsSaved(res.settings);
      }
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save auto courier settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const formatDhakaDisplayTime = (time24: string) => {
    const [hStr, mStr] = time24.split(':');
    const h = parseInt(hStr, 10);
    const m = mStr || '00';
    if (isNaN(h)) return time24;
    const isPm = h >= 12;
    const h12 = h % 12 === 0 ? 12 : h % 12;
    const periodBengali = h < 6 ? 'রাত' : h < 12 ? 'সকাল' : h < 16 ? 'দুপুর' : h < 19 ? 'বিকেল' : 'রাত';
    return `${periodBengali} ${h12}:${m} ${isPm ? 'PM' : 'AM'}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#7F22FE] via-[#6c1ce0] to-[#5113b5] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 border border-white/20">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  অটো কুরিয়ার ডেসপ্যাচ ও এআই স্ক্রিনিং
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
                  AI Guard
                </span>
              </div>
              <p className="text-xs text-white/80 mt-0.5">
                নির্ধারিত সময়ে AI স্বয়ংক্রিয়ভাবে পার্সেল কুরিয়ারে পাঠাবে ও সন্দেহজনক পার্সেল আটকে দেবে
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Master ON/OFF Switch Card */}
          <div className={`p-4.5 rounded-2xl border transition-all ${
            settings.enabled
              ? 'bg-[#7F22FE]/5 border-[#7F22FE]/30 ring-2 ring-[#7F22FE]/10'
              : 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700'
          }`}>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${settings.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'}`} />
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">
                    {settings.enabled ? 'অটোমেটিক কুরিয়ার ডেসপ্যাচ: সক্রিয় (ON)' : 'অটোমেটিক কুরিয়ার ডেসপ্যাচ: বন্ধ (OFF)'}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  {settings.enabled
                    ? 'নির্ধারিত সময়ে সব ভেরিফায়েড পেন্ডিং অর্ডার স্বয়ংক্রিয়ভাবে কুরিয়ারে বুক হয়ে যাবে। যেকোনো সময় আপনি এটি বন্ধ করতে পারবেন।'
                    : 'বর্তমানে অটো-ডেসপ্যাচ বন্ধ আছে। আপনি সম্পূর্ণ স্বাধীনভাবে ম্যানুয়ালি ১-ক্লিকে কুরিয়ারে পার্সেল পাঠাতে পারবেন।'}
                </p>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                onClick={handleToggleEnabled}
                className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  settings.enabled ? 'bg-[#7F22FE]' : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    settings.enabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Section 1: Scheduled Times */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#7F22FE]" />
                <span>অটো-ডেসপ্যাচের সময়সূচি (Scheduled Times - Asia/Dhaka)</span>
              </label>
              <span className="text-[11px] text-neutral-400">প্রতিদিন এই সময়ে চলবে</span>
            </div>

            {/* Quick preset buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold text-neutral-500">দ্রুত যোগ করুন:</span>
              <button
                type="button"
                onClick={() => handleAddTime('10:00')}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-[#7F22FE]/10 hover:text-[#7F22FE] transition-colors cursor-pointer"
              >
                + সকাল ১০:০০ টা (10:00 AM)
              </button>
              <button
                type="button"
                onClick={() => handleAddTime('15:00')}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-[#7F22FE]/10 hover:text-[#7F22FE] transition-colors cursor-pointer"
              >
                + দুপুর ০৩:০০ টা (03:00 PM)
              </button>
              <button
                type="button"
                onClick={() => handleAddTime('23:00')}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-[#7F22FE]/10 hover:text-[#7F22FE] transition-colors cursor-pointer"
              >
                + রাত ১১:০০ টা (11:00 PM)
              </button>
            </div>

            {/* Active Time Pills */}
            <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 min-h-[50px] flex items-center gap-2 flex-wrap">
              {settings.scheduled_times.length === 0 ? (
                <span className="text-xs text-neutral-400 italic">কোনো নির্দিষ্ট সময় যুক্ত করা নেই। নিচে সময় সিলেক্ট করে যোগ করুন।</span>
              ) : (
                settings.scheduled_times.map((t) => (
                  <div
                    key={t}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-2xs flex items-center gap-2 text-xs font-bold text-neutral-800 dark:text-neutral-200"
                  >
                    <Clock className="w-3 h-3 text-[#7F22FE]" />
                    <span>{formatDhakaDisplayTime(t)}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTime(t)}
                      className="text-neutral-400 hover:text-red-500 cursor-pointer ml-1"
                      title="মুছে ফেলুন"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Custom Time Input */}
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={newTimeInput}
                onChange={(e) => setNewTimeInput(e.target.value)}
                className="px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-medium text-neutral-800 dark:text-white"
              />
              <button
                type="button"
                onClick={() => handleAddTime(newTimeInput)}
                className="px-3.5 py-2 rounded-xl bg-neutral-900 dark:bg-neutral-100 hover:bg-[#7F22FE] text-white dark:text-neutral-900 dark:hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>সময় যোগ করুন</span>
              </button>
            </div>
          </div>

          {/* Section 2: Preferred Courier Partner */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#7F22FE]" />
              <span>ডিফল্ট কুরিয়ার পার্টনার (Preferred Courier)</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {COURIER_PROVIDERS.slice(0, 5).map((c) => {
                const isSelected = settings.default_courier === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSettings((prev) => ({ ...prev, default_courier: c.id }))}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#7F22FE] bg-[#7F22FE]/5 ring-2 ring-[#7F22FE]/20 shadow-xs'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${c.badgeBg}`}>
                        {c.logoCode}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#7F22FE]" />}
                    </div>
                    <div className="mt-2">
                      <div className="text-xs font-bold text-neutral-900 dark:text-white">{c.name}</div>
                      <div className="text-[10px] text-neutral-400 truncate">{c.tagline}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: AI Fraud Guard & Suspicious Parcel Screening Rules */}
          <div className="p-4.5 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
                    এআই পার্সেল ফ্রড স্ক্রিনিং (Fraud & Risk Guard)
                  </h3>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    সন্দেহজনক পার্সেল স্বয়ংক্রিয়ভাবে আটকে দিয়ে আলাদা তালিকায় রাখবে
                  </p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={settings.fraud_check_enabled}
                onChange={(e) => setSettings((prev) => ({ ...prev, fraud_check_enabled: e.target.checked }))}
                className="w-4 h-4 rounded text-[#7F22FE] focus:ring-[#7F22FE] cursor-pointer mt-1"
              />
            </div>

            {settings.fraud_check_enabled && (
              <div className="space-y-3 pt-2 border-t border-amber-500/15">
                {/* Rule 1: Min Address Length */}
                <div className="flex items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                      ন্যূনতম ঠিকানার দৈর্ঘ্য (অক্ষর)
                    </div>
                    <div className="text-[10px] text-neutral-500">
                      যেমন: শুধু "Dhaka" বা "Mirpur" থাকলে আটকে দেবে
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={6}
                      max={30}
                      value={settings.risk_rules.min_address_length}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          risk_rules: {
                            ...prev.risk_rules,
                            min_address_length: parseInt(e.target.value, 10) || 12
                          }
                        }))
                      }
                      className="w-16 px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-bold text-center"
                    />
                    <span className="text-[11px] text-neutral-500">অক্ষর</span>
                  </div>
                </div>

                {/* Rule 2: Max COD Limit */}
                <div className="flex items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                      সর্বোচ্চ COD লিমিট (অগ্রিম ছাড়া)
                    </div>
                    <div className="text-[10px] text-neutral-500">
                      উচ্চ মূল্যের অর্ডারে কোনো অগ্রিম পেমেন্ট না থাকলে রিভিউতে রাখবে
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-neutral-600">৳</span>
                    <input
                      type="number"
                      step={500}
                      min={1000}
                      max={50000}
                      value={settings.risk_rules.max_cod_amount_auto}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          risk_rules: {
                            ...prev.risk_rules,
                            max_cod_amount_auto: parseInt(e.target.value, 10) || 5000
                          }
                        }))
                      }
                      className="w-20 px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-bold text-center"
                    />
                  </div>
                </div>

                {/* Rule 3: Valid 11-digit BD Phone */}
                <div className="flex items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                      ১১ ডিজিট বাংলাদেশি মোবাইল নম্বর ভেরিফিকেশন (013-019)
                    </div>
                    <div className="text-[10px] text-neutral-500">
                      ভুল বা ডামি নম্বর হলে পার্সেল আটকে দেবে
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.risk_rules.require_valid_phone}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        risk_rules: {
                          ...prev.risk_rules,
                          require_valid_phone: e.target.checked
                        }
                      }))
                    }
                    className="w-4 h-4 rounded text-[#7F22FE] cursor-pointer"
                  />
                </div>

                {/* Rule 4: Duplicate Phone Detection */}
                <div className="flex items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                      ৪৮ ঘণ্টার মধ্যে একই নম্বরে একাধিক অর্ডার চেক (Duplicate Guard)
                    </div>
                    <div className="text-[10px] text-neutral-500">
                      একই নম্বরে বারবার অর্ডারের সন্দেহজনক প্রতারণা আটকাবে
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.risk_rules.flag_duplicate_phones}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        risk_rules: {
                          ...prev.risk_rules,
                          flag_duplicate_phones: e.target.checked
                        }
                      }))
                    }
                    className="w-4 h-4 rounded text-[#7F22FE] cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Last Run Summary (If available) */}
          {settings.last_run_summary && (
            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-[#7F22FE]" />
                <span className="text-neutral-600 dark:text-neutral-300">
                  সর্বশেষ রান: <strong>{new Date(settings.last_run_summary.timestamp).toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' })}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                  পাঠানো: {settings.last_run_summary.dispatched_count}টি
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                  সন্দেহজনক: {settings.last_run_summary.suspicious_count}টি
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              if (onTriggerRunNow) {
                onTriggerRunNow();
                onClose();
              }
            }}
            className="px-3.5 py-2.5 rounded-xl border border-[#7F22FE]/30 bg-[#7F22FE]/10 hover:bg-[#7F22FE]/20 text-[#7F22FE] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>এখনই টেস্ট রান করুন (Run Now)</span>
          </button>

          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>সেভ হয়েছে!</span>
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-[#7F22FE] hover:bg-[#6c1ce0] text-white text-xs font-black transition-all shadow-md shadow-[#7F22FE]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'সেটিংস সেভ করুন'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
