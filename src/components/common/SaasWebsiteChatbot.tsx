import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  AudioLines,
  ArrowUp,
  Square,
  Volume2,
  Trash2
} from 'lucide-react';
import { api } from '../../api';
import { BrandLogo } from './BrandLogo';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
  imageUrl?: string;
  audioUrl?: string;
  isVoice?: boolean;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome_1',
    sender: 'bot',
    text: 'Hey, how could I help you?',
    time: 'Just now'
  }
];

export const SaasWebsiteChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [visitorId] = useState(() => {
    const saved = localStorage.getItem('oneagent_saas_visitor_id');
    if (saved) return saved;
    const next = `saas_vis_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem('oneagent_saas_visitor_id', next);
    return next;
  });

  // Image attachment state
  const [pendingImageBase64, setPendingImageBase64] = useState<string | null>(null);
  const [pendingImageMime, setPendingImageMime] = useState<string | null>(null);
  const [pendingImageName, setPendingImageName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking, isOpen]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  const formatTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (result) {
        setPendingImageBase64(result);
        setPendingImageMime(file.type || 'image/jpeg');
        setPendingImageName(file.name);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const clearPendingImage = () => {
    setPendingImageBase64(null);
    setPendingImageMime(null);
    setPendingImageName('');
  };

  const startVoiceRecording = async () => {
    if (isRecording) {
      stopVoiceRecordingAndSend();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      setLiveTranscript('');
      setRecordingSeconds(0);

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.lang = 'bn-BD';
          recognition.interimResults = true;
          recognition.continuous = true;
          recognition.onresult = (event: any) => {
            let text = '';
            for (let i = 0; i < event.results.length; i++) {
              text += event.results[i][0].transcript + ' ';
            }
            setLiveTranscript(text.trim());
          };
          recognition.start();
          recognitionRef.current = recognition;
        } catch {}
      }

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch {}
          recognitionRef.current = null;
        }

        const mimeType = recorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          if (base64Audio) {
            handleSendMessage({
              customText: inputText.trim(),
              audioBase64: base64Audio,
              audioMimeType: mimeType,
              audioTranscript: liveTranscript
            });
          }
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);

      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'bot',
          text: 'Please allow microphone access in your browser to send voice messages.',
          time: formatTime()
        }
      ]);
    }
  };

  const stopVoiceRecordingAndSend = () => {
    if (mediaRecorderRef.current && isRecording) {
      setIsRecording(false);
      mediaRecorderRef.current.stop();
    }
  };

  const cancelVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = () => {
        mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setRecordingSeconds(0);
    setLiveTranscript('');
  };

  const handleSendMessage = async (opts?: {
    customText?: string;
    audioBase64?: string;
    audioMimeType?: string;
    audioTranscript?: string;
  }) => {
    const textToSend =
      opts?.customText !== undefined ? opts.customText.trim() : inputText.trim();
    const imgB64 = pendingImageBase64;
    const imgMime = pendingImageMime;
    const audB64 = opts?.audioBase64;
    const audMime = opts?.audioMimeType;
    const audTrans = opts?.audioTranscript || liveTranscript;

    if (!textToSend && !imgB64 && !audB64) return;

    setInputText('');
    clearPendingImage();
    setLiveTranscript('');

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend || (audB64 ? (audTrans ? `🎤 "${audTrans}"` : '🎤 Voice Message') : ''),
      time: formatTime(),
      imageUrl: imgB64 || undefined,
      audioUrl: audB64 || undefined,
      isVoice: Boolean(audB64)
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setIsThinking(true);

    try {
      const res = await api.sendWidgetChat({
        agentId: 'saas_official',
        visitorId,
        message: textToSend,
        imageBase64: imgB64 || undefined,
        imageMimeType: imgMime || undefined,
        audioBase64: audB64 || undefined,
        audioMimeType: audMime || undefined,
        audioTranscript: audTrans || undefined,
        history: updatedHistory.slice(-6).map((m) => ({
          sender: m.sender,
          text: m.text
        }))
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text:
            res.reply ||
            'Feel free to ask any other questions about our SaaS platform!',
          time: formatTime()
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_err_${Date.now()}`,
          sender: 'bot',
          text: 'Hello! We offer 2 official plans: Starter AI Plan (1,250 BDT/month) and Pro Business Plan (1,950 BDT/month), plus a 2-Day Free Trial. Please send your question again!',
          time: formatTime()
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end font-sans">
      {/* Hidden File Input for Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />

      {/* OPEN STATE: Sleek Dark Chat Box matching Screenshot 2 */}
      {isOpen && (
        <div className="w-[335px] sm:w-[350px] h-[480px] max-h-[calc(100vh-110px)] mb-3 rounded-[18px] bg-[#050507] border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.55)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Minimal Top Header */}
          <div className="px-4 py-3 bg-[#0B0B0F] border-b border-white/10 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-neutral-200 tracking-wide">
              One Agent BD
            </span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 px-4 py-4 overflow-y-auto space-y-3.5 text-[13.5px]">
            {messages.map((msg) =>
              msg.sender === 'bot' ? (
                <div key={msg.id} className="flex items-start gap-2.5">
                  {/* Circular White Logo Avatar */}
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1.5 shrink-0 shadow-sm mt-0.5">
                    <BrandLogo size="xs" className="w-full h-full" />
                  </div>
                  {/* Dark Pill Message Bubble */}
                  <div className="bg-[#1C1D22] text-white px-4 py-2.5 rounded-2xl max-w-[80%] leading-relaxed whitespace-pre-line border border-white/5">
                    {msg.text}
                  </div>
                </div>
              ) : (
                <div key={msg.id} className="flex flex-col items-end">
                  <div className="bg-[#2B3FD6] text-white px-4 py-2.5 rounded-2xl max-w-[82%] leading-relaxed whitespace-pre-line">
                    {msg.imageUrl && (
                      <img
                        src={msg.imageUrl}
                        alt="Uploaded attachment"
                        className="max-w-full max-h-40 rounded-xl object-cover mb-2 border border-white/15"
                      />
                    )}
                    {msg.audioUrl && (
                      <div className="mb-1.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold mb-1 opacity-95">
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Voice Message</span>
                        </div>
                        <audio
                          controls
                          src={msg.audioUrl}
                          className="h-8 w-44 max-w-full rounded-lg"
                        />
                      </div>
                    )}
                    {msg.text && <div>{msg.text}</div>}
                  </div>
                  <span className="text-[10px] text-neutral-400 mt-1 mr-1 flex items-center gap-1">
                    ✓✓ Seen
                  </span>
                </div>
              )
            )}

            {isThinking && (
              <div className="flex items-center gap-2.5 animate-in fade-in duration-150">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1.5 shrink-0">
                  <BrandLogo size="xs" className="w-full h-full" />
                </div>
                <div className="bg-[#1C1D22] text-neutral-200 px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 border border-white/5">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                  </span>
                  <span className="font-medium text-neutral-300">Typing...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Pending Image Preview Bar */}
          {pendingImageBase64 && (
            <div className="mx-3 mb-1.5 px-3 py-2 rounded-xl bg-[#1C1D22] border border-white/10 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={pendingImageBase64}
                  alt="Preview"
                  className="w-8 h-8 rounded-lg object-cover shrink-0"
                />
                <span className="text-[11px] text-neutral-200 truncate">
                  {pendingImageName || 'Image ready'}
                </span>
              </div>
              <button
                type="button"
                onClick={clearPendingImage}
                className="p-1 text-rose-400 hover:text-rose-300 cursor-pointer"
                title="Remove image"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Active Voice Recording Bar */}
          {isRecording && (
            <div className="mx-3 mb-1.5 px-3 py-2 rounded-xl bg-rose-950/80 border border-rose-500/30 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
                <span className="text-xs font-semibold text-rose-200 truncate">
                  Recording 00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
                  {liveTranscript ? ` • "${liveTranscript}"` : ''}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={cancelVoiceRecording}
                  className="px-2 py-0.5 rounded-md bg-white/10 text-neutral-200 text-[11px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={stopVoiceRecordingAndSend}
                  className="px-2.5 py-0.5 rounded-md bg-rose-600 text-white text-[11px] font-semibold cursor-pointer"
                >
                  Send
                </button>
              </div>
            </div>
          )}

          {/* Bottom Input Area + Powered by Footer */}
          <div className="px-3 pt-1 pb-2.5 bg-[#050507] shrink-0">
            <div className="bg-[#1C1D22] border border-white/10 rounded-full pl-3.5 pr-1.5 py-1.5 flex items-center gap-2.5">
              {/* Upload Image Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isThinking || isRecording}
                title="Upload Picture / Screenshot"
                className="text-neutral-300 hover:text-white transition-colors cursor-pointer shrink-0 disabled:opacity-40"
              >
                <Upload className="w-4 h-4" />
              </button>

              {/* Voice Waveform Button */}
              <button
                type="button"
                onClick={startVoiceRecording}
                disabled={isThinking}
                title={isRecording ? 'Stop & Send Voice' : 'Send Voice Message'}
                className={`transition-colors cursor-pointer shrink-0 ${
                  isRecording
                    ? 'text-rose-500 animate-pulse'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                {isRecording ? <Square className="w-4 h-4" /> : <AudioLines className="w-4 h-4" />}
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isRecording}
                placeholder="Type a message..."
                className="flex-1 min-w-0 bg-transparent text-[13px] text-white placeholder-neutral-400 outline-none"
              />

              {/* Circular Up-Arrow Send Button */}
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={(!inputText.trim() && !pendingImageBase64) || isThinking || isRecording}
                className="w-8 h-8 rounded-full bg-[#2538B8] hover:bg-[#3247D6] text-white flex items-center justify-center transition-all cursor-pointer shrink-0 disabled:opacity-50"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center mt-2 text-[11px] text-neutral-400 font-medium tracking-tight">
              Powered by One Agent BD
            </div>
          </div>
        </div>
      )}

      {/* CLOSED STATE TOOLTIP: "Hey, Need help?" dark bubble above launcher (Screenshot 1) */}
      {!isOpen && showTooltip && (
        <div
          onClick={() => setIsOpen(true)}
          className="relative mb-3 bg-[#1C1D21] text-white pl-4 pr-7 py-2.5 rounded-[14px] shadow-[0_10px_25px_rgba(0,0,0,0.3)] flex items-center cursor-pointer select-none animate-in fade-in slide-in-from-bottom-1 duration-200"
        >
          <span className="text-[13px] font-medium whitespace-nowrap">
            Hey, Need help?
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            aria-label="Dismiss help prompt"
            className="absolute top-1.5 right-2 text-neutral-400 hover:text-white text-xs leading-none p-0.5 cursor-pointer"
          >
            &times;
          </button>
          {/* Downward pointer arrow */}
          <div className="absolute -bottom-1.5 right-5 w-3 h-3 bg-[#1C1D21] rotate-45" />
        </div>
      )}

      {/* COMPACT CIRCULAR LAUNCHER BUTTON (White circle with Logo when closed, Blue circle with X when open) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Close AI Chat' : 'Open AI Chat'}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-[0_8px_28px_rgba(0,0,0,0.22)] hover:scale-105 ${
          isOpen
            ? 'bg-[#2B3FD6] text-white'
            : 'bg-white text-neutral-900 border border-neutral-100'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white stroke-[2.2]" />
        ) : (
          <BrandLogo size="md" className="w-8 h-8" />
        )}
      </button>
    </div>
  );
};
