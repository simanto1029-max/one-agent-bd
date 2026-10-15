import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Bot,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Play,
  Save,
  RotateCcw,
  Sliders,
  Check,
  Plus,
  MessageSquare,
  ShieldCheck,
  FileCheck2
} from 'lucide-react';
import { api } from '../../api';
import { Order, OrderConfirmationSettings } from '../../types';

interface AIOrderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (settings: OrderConfirmationSettings) => void;
}

const PRESET_ECOMMERCE = {
  instructions: `When a customer wants to purchase a product and explicitly confirms an order (e.g. "confirm order", "send it", "cash on delivery"), and provides their name, 11-digit active phone number, and complete delivery address—then confirm the order. If the phone number or delivery address is missing, do not confirm the order; instead politely ask for the required missing information.`,
  required_fields: {
    customer_name: true,
    customer_phone: true,
    customer_address: true,
    items_detail: true,
    trx_id: false
  },
  trigger_keywords: [
    'confirm order', 'send order', 'cash on delivery', 'cod',
    'delivery address', 'address', 'ship it', 'want to buy'
  ]
};

const PRESET_DIGITAL_SERVICE = {
  instructions: `When a customer wants to purchase a subscription plan or digital service and confirms the package name and their contact number, or shares a bKash/Nagad payment transaction ID (TrxID), immediately classify and confirm the order.`,
  required_fields: {
    customer_name: true,
    customer_phone: true,
    customer_address: false,
    items_detail: true,
    trx_id: true
  },
  trigger_keywords: [
    'package', 'order plan', 'paid via bkash', 'trx', 'trxid',
    'payment done', 'sent payment', 'subscribe', 'confirm'
  ]
};

const PRESET_FOOD_DELIVERY = {
  instructions: `When a customer selects food items or menu choices, provides their delivery location / home address, and contact phone number, immediately confirm it as a food delivery order and record it under Cash on Delivery.`,
  required_fields: {
    customer_name: true,
    customer_phone: true,
    customer_address: true,
    items_detail: true,
    trx_id: false
  },
  trigger_keywords: [
    'send delivery', 'take order', 'food order', 'parcel',
    'home address', 'cash on delivery', 'send fast'
  ]
};

export const AIOrderSettingsModal: React.FC<AIOrderSettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved
}) => {
  const [settings, setSettings] = useState<OrderConfirmationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New keyword input state
  const [newKeyword, setNewKeyword] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getOrderSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load order settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      const res = await api.updateOrderSettings(settings);
      setSettings(res.settings);
      setSaveSuccess(true);
      if (onSaved) {
        onSaved(res.settings);
      }
      setTimeout(() => setSaveSuccess(false), 3000);
      setErrorMessage(null);
    } catch (err: any) {
      console.error('Failed to save order settings:', err);
      setErrorMessage(err.message || 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const applyPreset = (preset: typeof PRESET_ECOMMERCE) => {
    if (!settings) return;
    setSettings({
      ...settings,
      instructions: preset.instructions,
      required_fields: { ...preset.required_fields },
      trigger_keywords: [...preset.trigger_keywords]
    });
  };

  const handleAddKeyword = () => {
    if (!settings || !newKeyword.trim()) return;
    const kw = newKeyword.trim().toLowerCase();
    if (!settings.trigger_keywords.includes(kw)) {
      setSettings({
        ...settings,
        trigger_keywords: [...settings.trigger_keywords, kw]
      });
    }
    setNewKeyword('');
  };

  const handleRemoveKeyword = (kwToRemove: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      trigger_keywords: settings.trigger_keywords.filter(k => k !== kwToRemove)
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-900/70">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-violet-500/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white tracking-tight">
                  AI Order Confirmation Instructions
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-400 text-[10px] font-bold">
                  AI Order Logic
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Define the criteria and instructions the AI uses to detect and confirm customer orders
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
              <span>{errorMessage}</span>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="font-bold hover:underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {loading || !settings ? (
            <div className="py-16 text-center text-neutral-400 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-violet-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Loading...</span>
            </div>
          ) : (
            <>
              {/* How AI Detects Confirmed Orders - Educational Banner */}
              <div className="p-4.5 rounded-2xl bg-gradient-to-r from-violet-500/5 via-indigo-500/5 to-cyan-500/5 dark:from-violet-950/30 dark:via-indigo-950/20 dark:to-cyan-950/20 border border-violet-200/60 dark:border-violet-800/40">
                <div className="flex items-center gap-2 text-violet-700 dark:text-violet-400 font-bold text-xs uppercase tracking-wider mb-2.5">
                  <Sparkles className="w-4 h-4" />
                  How AI Confirms Customer Orders:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/60">
                    <span className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 font-black text-[11px] flex items-center justify-center mb-1.5">
                      1
                    </span>
                    <p className="font-bold text-neutral-900 dark:text-white mb-0.5">Real-Time Chat Scanning</p>
                    <p className="text-neutral-500 dark:text-neutral-400 text-[11px] leading-relaxed">
                      Continuously inspects incoming WhatsApp and Messenger customer conversations.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/60">
                    <span className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 font-black text-[11px] flex items-center justify-center mb-1.5">
                      2
                    </span>
                    <p className="font-bold text-neutral-900 dark:text-white mb-0.5">Keywords & Intent Analysis</p>
                    <p className="text-neutral-500 dark:text-neutral-400 text-[11px] leading-relaxed">
                      Matches signals like "confirm order", "deliver to", and "cash on delivery".
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/60">
                    <span className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 font-black text-[11px] flex items-center justify-center mb-1.5">
                      3
                    </span>
                    <p className="font-bold text-neutral-900 dark:text-white mb-0.5">Required Fields Verification</p>
                    <p className="text-neutral-500 dark:text-neutral-400 text-[11px] leading-relaxed">
                      Extracts customer name, active phone number, and complete delivery address.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/60">
                    <span className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 font-black text-[11px] flex items-center justify-center mb-1.5">
                      4
                    </span>
                    <p className="font-bold text-neutral-900 dark:text-white mb-0.5">Auto-Save to Orders Hub</p>
                    <p className="text-neutral-500 dark:text-neutral-400 text-[11px] leading-relaxed">
                      Creates a verified order entry and triggers confirmation slips automatically.
                    </p>
                  </div>
                </div>
              </div>

              {/* Master Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${settings.enabled ? 'bg-[#7F22FE]/10 text-[#7F22FE]' : 'bg-neutral-200 text-neutral-500'}`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-neutral-900 dark:text-white">
                      Enable Automated AI Order Detection
                    </h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Automatically confirms customer orders from inbox chats and syncs them to Orders Hub
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enabled}
                    onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-[#7F22FE]"></div>
                </label>
              </div>

              {/* Quick Presets */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                  Select Quick Business Preset
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => applyPreset(PRESET_ECOMMERCE)}
                    className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-violet-500 dark:hover:border-violet-500 bg-white dark:bg-neutral-800/50 text-left transition-all group cursor-pointer"
                  >
                    <span className="text-base block mb-1">🛍️</span>
                    <span className="font-bold text-xs text-neutral-900 dark:text-white block group-hover:text-violet-600">
                      E-Commerce Shop (COD)
                    </span>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                      Requires name, 11-digit phone, and complete delivery address
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset(PRESET_DIGITAL_SERVICE)}
                    className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-violet-500 dark:hover:border-violet-500 bg-white dark:bg-neutral-800/50 text-left transition-all group cursor-pointer"
                  >
                    <span className="text-base block mb-1">💻</span>
                    <span className="font-bold text-xs text-neutral-900 dark:text-white block group-hover:text-violet-600">
                      Digital Service / SaaS
                    </span>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                      Verifies subscription package name and bKash/Nagad TrxID
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset(PRESET_FOOD_DELIVERY)}
                    className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-violet-500 dark:hover:border-violet-500 bg-white dark:bg-neutral-800/50 text-left transition-all group cursor-pointer"
                  >
                    <span className="text-base block mb-1">🍔</span>
                    <span className="font-bold text-xs text-neutral-900 dark:text-white block group-hover:text-violet-600">
                      Food & Restaurant
                    </span>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                      Requires selected meal items and delivery address
                    </span>
                  </button>
                </div>
              </div>

              {/* Custom Instructions Prompt */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Custom Prompt Instructions for AI
                  </label>
                  <span className="text-[11px] text-neutral-400">Provide clear instructions in English</span>
                </div>
                <textarea
                  rows={4}
                  value={settings.instructions}
                  onChange={(e) => setSettings({ ...settings, instructions: e.target.value })}
                  placeholder="e.g. When the customer confirms an order and provides their name, 11-digit phone number, and complete delivery address, mark the order as confirmed..."
                  className="w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700/80 text-xs sm:text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none transition-all leading-relaxed"
                />
              </div>

              {/* Required Information Checklist */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                  Required Fields Checklist for Order Confirmation
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800/50 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800">
                    <input
                      type="checkbox"
                      checked={settings.required_fields.customer_name}
                      onChange={(e) => setSettings({
                        ...settings,
                        required_fields: { ...settings.required_fields, customer_name: e.target.checked }
                      })}
                      className="w-4 h-4 text-violet-600 rounded-sm focus:ring-violet-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-neutral-900 dark:text-white block">Customer Full Name</span>
                      <span className="text-[10px] text-neutral-500">Contact / Recipient Name</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800/50 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800">
                    <input
                      type="checkbox"
                      checked={settings.required_fields.customer_phone}
                      onChange={(e) => setSettings({
                        ...settings,
                        required_fields: { ...settings.required_fields, customer_phone: e.target.checked }
                      })}
                      className="w-4 h-4 text-violet-600 rounded-sm focus:ring-violet-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-neutral-900 dark:text-white block">Active Mobile Number</span>
                      <span className="text-[10px] text-neutral-500">11-digit Phone (01XXXXXXXXX)</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800/50 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800">
                    <input
                      type="checkbox"
                      checked={settings.required_fields.customer_address}
                      onChange={(e) => setSettings({
                        ...settings,
                        required_fields: { ...settings.required_fields, customer_address: e.target.checked }
                      })}
                      className="w-4 h-4 text-violet-600 rounded-sm focus:ring-violet-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-neutral-900 dark:text-white block">Complete Delivery Address</span>
                      <span className="text-[10px] text-neutral-500">Delivery Address & Area</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800/50 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800">
                    <input
                      type="checkbox"
                      checked={settings.required_fields.items_detail}
                      onChange={(e) => setSettings({
                        ...settings,
                        required_fields: { ...settings.required_fields, items_detail: e.target.checked }
                      })}
                      className="w-4 h-4 text-violet-600 rounded-sm focus:ring-violet-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-neutral-900 dark:text-white block">Product Details & Quantity</span>
                      <span className="text-[10px] text-neutral-500">Item Name / Size / Quantity</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800/50 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800">
                    <input
                      type="checkbox"
                      checked={settings.required_fields.trx_id}
                      onChange={(e) => setSettings({
                        ...settings,
                        required_fields: { ...settings.required_fields, trx_id: e.target.checked }
                      })}
                      className="w-4 h-4 text-violet-600 rounded-sm focus:ring-violet-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-neutral-900 dark:text-white block">bKash/Nagad TrxID</span>
                      <span className="text-[10px] text-neutral-500">Payment Transaction Proof</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Trigger Keywords Pills */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                  Trigger Keywords for Order Confirmation
                </label>
                <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 min-h-[50px] items-center">
                  {settings.trigger_keywords.map((kw) => (
                    <span
                      key={kw}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-neutral-700 text-xs font-medium text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-600 shadow-2xs"
                    >
                      {kw}
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(kw)}
                        className="text-neutral-400 hover:text-red-500 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddKeyword();
                        }
                      }}
                      placeholder="Type keyword and press Enter..."
                      className="text-xs bg-transparent border-none text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-0 w-44"
                    />
                    <button
                      type="button"
                      onClick={handleAddKeyword}
                      className="p-1 rounded-md bg-violet-600 text-white hover:bg-violet-700 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Auto Confirmation Message Slip */}
              <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    <span className="text-xs font-bold text-neutral-900 dark:text-white">
                      Automated Order Confirmation Slip (Auto-Reply)
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.auto_reply_confirmation}
                      onChange={(e) => setSettings({ ...settings, auto_reply_confirmation: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-neutral-600 peer-checked:bg-violet-600"></div>
                  </label>
                </div>
                <textarea
                  rows={2}
                  disabled={!settings.auto_reply_confirmation}
                  value={settings.confirmation_message_template}
                  onChange={(e) => setSettings({ ...settings, confirmation_message_template: e.target.value })}
                  placeholder="Thank you {customer_name}! Your order for {items} has been confirmed (Order ID: {order_id})."
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none disabled:opacity-50"
                />
                <p className="text-[10px] text-neutral-400 mt-1">
                  Supported tags: {'{customer_name}'}, {'{items}'}, {'{order_id}'}, {'{total_amount}'}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-900/70">
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                Instructions saved successfully!
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-bold transition-all cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              disabled={saving || !settings}
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-[#7F22FE] hover:bg-[#6c1ce0] text-white text-xs font-bold transition-all shadow-md shadow-[#7F22FE]/25 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  Save Instructions
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
