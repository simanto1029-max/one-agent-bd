import React, { useState, useRef } from 'react';
import {
  X,
  Activity,
  Smartphone,
  Facebook,
  Instagram,
  Play,
  CheckCircle2,
  AlertCircle,
  Mic,
  MicOff,
  UploadCloud,
  MessageSquare,
  ImageIcon,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { api } from '../../api';
import { BrowserAudioRecorder, blobToBase64 } from '../../utils/audioRecorder';

interface WebhookTesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshInbox?: () => void;
}

export const WebhookTesterModal: React.FC<WebhookTesterModalProps> = ({
  isOpen,
  onClose,
  onRefreshInbox
}) => {
  const [mode, setMode] = useState<'text' | 'voice' | 'image'>('text');
  const [platform, setPlatform] = useState<'whatsapp' | 'messenger' | 'instagram'>('whatsapp');
  const [customerName, setCustomerName] = useState('Nabila Rahman');
  const [customerNumber, setCustomerNumber] = useState('+8801812345678');
  const [messageBody, setMessageBody] = useState('Can you please send me pictures and details of your featured products?');

  // Voice note state
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioMime, setAudioMime] = useState<string>('audio/webm');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const audioRecorderRef = useRef<BrowserAudioRecorder | null>(null);
  const recordTimerRef = useRef<any>(null);

  // Customer Image upload state
  const [customerImageBase64, setCustomerImageBase64] = useState<string | null>(null);
  const [customerImageMime, setCustomerImageMime] = useState<string>('image/jpeg');
  const [customerImageUrl, setCustomerImageUrl] = useState<string>('https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&auto=format&fit=crop&q=60');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

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
      setError(err.message || 'Could not access microphone.');
    }
  };

  const handleStopRecording = async () => {
    if (!audioRecorderRef.current) return;
    try {
      clearInterval(recordTimerRef.current);
      setIsRecording(false);
      const res = await audioRecorderRef.current.stop();
      setAudioBase64(res.base64);
      setAudioMime(res.mimeType);
    } catch (err: any) {
      console.error('Failed to stop recording:', err);
      setIsRecording(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await blobToBase64(file);
      setAudioBase64(base64);
      setAudioMime(file.type || 'audio/ogg');
    } catch (err) {
      console.error('Failed to read file:', err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await blobToBase64(file);
      setCustomerImageBase64(base64);
      setCustomerImageMime(file.type || 'image/jpeg');
      setCustomerImageUrl('');
    } catch (err) {
      console.error('Failed to read image file:', err);
    }
  };

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'text' && !messageBody.trim()) return;
    if (mode === 'voice' && !audioBase64) {
      setError('Please record or upload a voice note before dispatching.');
      return;
    }
    if (mode === 'image' && !customerImageBase64 && !customerImageUrl) {
      setError('Please select or upload a customer image before dispatching.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const res = await api.simulateInboundMessage({
        platform,
        customerName: customerName.trim(),
        customerId: customerNumber.trim(),
        messageText: (mode === 'text' || mode === 'image') ? messageBody.trim() : undefined,
        audioBase64: mode === 'voice' ? audioBase64 || undefined : undefined,
        audioMimeType: mode === 'voice' ? audioMime : undefined,
        imageBase64: mode === 'image' ? customerImageBase64 || undefined : undefined,
        imageMimeType: mode === 'image' ? customerImageMime : undefined,
        imageUrl: mode === 'image' && !customerImageBase64 ? customerImageUrl : undefined
      });

      setResult(res);
      if (onRefreshInbox) onRefreshInbox();
    } catch (err: any) {
      setError(err.message || 'Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  const textPresets = [
    { label: '🛍️ Featured Catalog Details', text: 'Can you please send me pictures and details of your featured products?' },
    { label: '⌚ Smartwatch Specs & Photo', text: 'Ultra Smartwatch er photo and ki ki features ache bistarito janan.' },
    { label: '💼 Leather Wallet Photo & Price', text: 'Leather wallet er chobi dekhte chai and dam koto?' },
    { label: '🎧 Earbuds Details & Warranty', text: 'What is the price, battery life, and warranty for the Wireless Earbuds?' },
    { label: '📦 Confirm Order', text: 'Amar name Arif, phone 01711223344, House 12 Road 5 Dhanmondi Dhaka. Order ta confirm kore pathan.' }
  ];

  const sampleCatalogPhotos = [
    { name: 'Minimalist Backpack', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60' },
    { name: 'Smartwatch Series 9', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60' },
    { name: 'Leather Wallet', url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=60' },
    { name: 'Wireless Earbuds', url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=60' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl p-6 sm:p-8 bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2 border border-emerald-200 dark:border-emerald-800">
            <Activity className="w-3.5 h-3.5" />
            Meta Webhook Payload Simulator
          </div>
          <h2 className="text-xl font-bold">Inbound Webhook, Product Image & Voice AI Verification</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Simulate incoming customer questions, photo requests, customer image uploads, or voice notes to test autonomous AI replies.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Mode Selector Tab (Text vs Voice vs Customer Photo) */}
        <div className="grid grid-cols-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 p-1 mb-4 gap-1">
          <button
            type="button"
            onClick={() => setMode('text')}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'text'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Text & Photo Request</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('voice')}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'voice'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice Note</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('image')}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'image'
                ? 'bg-[#7F22FE] text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Customer Photo Inquiry</span>
          </button>
        </div>

        <form onSubmit={handleRunSimulation} className="space-y-4">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                setPlatform('whatsapp');
                setCustomerNumber('+8801812345678');
              }}
              className={`p-2.5 sm:p-3 rounded-xl border text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
                platform === 'whatsapp'
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                  : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPlatform('messenger');
                setCustomerNumber('psid_9823481239');
              }}
              className={`p-2.5 sm:p-3 rounded-xl border text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
                platform === 'messenger'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                  : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <Facebook className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Messenger</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPlatform('instagram');
                setCustomerNumber('igsid_178414987654321');
              }}
              className={`p-2.5 sm:p-3 rounded-xl border text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
                platform === 'instagram'
                  ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 ring-2 ring-pink-500/20'
                  : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <Instagram className="w-4 h-4 text-pink-600 shrink-0" />
              <span>Instagram</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Sender ID / Phone / PSID
              </label>
              <input
                type="text"
                required
                value={customerNumber}
                onChange={(e) => setCustomerNumber(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono"
              />
            </div>
          </div>

          {mode === 'text' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Customer Message Body
                </label>
                <span className="text-[10px] text-neutral-400">Click a chip below to autofill</span>
              </div>

              {/* Quick Scenario Chips */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {textPresets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setMessageBody(p.text)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-[#7F22FE]/10 hover:text-[#7F22FE] border border-neutral-200 dark:border-neutral-700 transition-colors cursor-pointer text-neutral-700 dark:text-neutral-300"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                required
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white leading-relaxed"
              />
            </div>
          )}

          {mode === 'image' && (
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-3">
              <div>
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block mb-1">
                  Customer Attached Photo
                </span>
                <p className="text-[11px] text-neutral-500 mb-2">
                  Select a sample catalog product photo or upload an image from your device:
                </p>

                {/* Sample Catalog Images */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  {sampleCatalogPhotos.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCustomerImageUrl(item.url);
                        setCustomerImageBase64(null);
                      }}
                      className={`p-1.5 rounded-xl border text-left transition-all cursor-pointer ${
                        customerImageUrl === item.url && !customerImageBase64
                          ? 'border-[#7F22FE] ring-2 ring-[#7F22FE]/20 bg-[#7F22FE]/5'
                          : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-400'
                      }`}
                    >
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-16 object-cover rounded-lg mb-1"
                      />
                      <span className="text-[10px] font-semibold text-neutral-700 dark:text-neutral-300 block truncate">
                        {item.name}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <label className="px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Custom Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {customerImageBase64 && (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Custom image loaded
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Customer Question accompanying the photo
                </label>
                <input
                  type="text"
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  placeholder="e.g. Is this available? What are the details and price?"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {mode === 'voice' && (
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  Voice Note Audio
                </span>
                {audioBase64 && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    ✓ Voice Note Loaded
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    Record Voice Note
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStopRecording}
                    className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer animate-pulse"
                  >
                    <MicOff className="w-3.5 h-3.5 text-rose-400" />
                    Stop ({recordingSeconds}s)
                  </button>
                )}

                <label className="px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload Audio</span>
                  <input
                    type="file"
                    accept="audio/*,.ogg,.mp3,.wav,.m4a,.webm"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {audioBase64 && (
                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700">
                  <span className="text-[10px] text-neutral-500 block mb-1">
                    Audio Preview:
                  </span>
                  <audio
                    controls
                    className="h-8 w-full"
                    src={`data:${audioMime};base64,${audioBase64}`}
                  />
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={
              loading ||
              (mode === 'text' && !messageBody.trim()) ||
              (mode === 'voice' && !audioBase64) ||
              (mode === 'image' && !customerImageBase64 && !customerImageUrl)
            }
            className="w-full py-2.5 px-4 rounded-xl bg-[#7F22FE] hover:bg-[#6c1ce0] disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-[#7F22FE]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>
              {loading
                ? 'Processing & Generating AI Reply...'
                : mode === 'voice'
                ? 'Dispatch Voice Webhook Event'
                : mode === 'image'
                ? 'Dispatch Customer Photo Inquiry'
                : 'Dispatch Webhook Event'}
            </span>
          </button>
        </form>

        {/* Results Box */}
        {result && (
          <div className="mt-6 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>Webhook Processed Successfully & Reply Sent!</span>
            </div>

            {/* Inbound Transcription if Voice */}
            {result.inboundMessage?.transcription && (
              <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 text-xs">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-1 text-[11px] uppercase tracking-wider">
                  🎙️ AI Audio Transcription:
                </span>
                <p className="text-neutral-900 dark:text-white leading-relaxed">
                  "{result.inboundMessage.transcription}"
                </p>
              </div>
            )}

            {/* AI Text Reply */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs space-y-2">
              <span className="font-bold text-[#7F22FE] block text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                AI Auto-Reply Output:
              </span>
              <p className="text-neutral-900 dark:text-white leading-relaxed whitespace-pre-line">
                {result.aiReplyMessage?.message_text || result.replyText}
              </p>

              {/* Attached Official Product Image */}
              {(result.aiReplyMessage?.has_image || result.aiReplyMessage?.image_url || result.attachedImageUrl) && (
                <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#7F22FE]/10 text-[#7F22FE] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      Official Product Photo Sent to Customer
                    </span>
                    {(result.aiReplyMessage?.product_name || result.attachedProductName) && (
                      <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1">
                        <ShoppingBag className="w-3 h-3 text-neutral-400" />
                        {result.aiReplyMessage?.product_name || result.attachedProductName}
                      </span>
                    )}
                  </div>
                  <div className="relative rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 max-w-xs shadow-xs">
                    <img
                      src={result.aiReplyMessage?.image_url || result.attachedImageUrl}
                      alt="Product Sent by AI"
                      className="w-full h-44 object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="text-[11px] text-neutral-500 font-mono flex items-center justify-between">
              <span>Channel: {result.channelName || result.platform}</span>
              <span>Saved to Unified Inbox & Database</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
