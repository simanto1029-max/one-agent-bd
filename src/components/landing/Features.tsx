import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageCircle,
  Phone,
  Video,
  ChevronLeft,
  Plus,
  Camera,
  Image as ImageIcon,
  Mic,
  Smile,
  ThumbsUp,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Send
} from 'lucide-react';

interface FeatureHighlight {
  id: string;
  title: string;
  description: string;
  stepIndex: number;
}

const FEATURE_HIGHLIGHTS: FeatureHighlight[] = [
  {
    id: 'sales',
    title: 'Increased Sales',
    description: "One Agent BD attends to your customer's queries 24/7 and closes more sales.",
    stepIndex: 1
  },
  {
    id: 'instant',
    title: 'Instant Replies',
    description: 'One Agent BD instantly answers across all platforms and organize the messages for you.',
    stepIndex: 2
  },
  {
    id: 'productivity',
    title: 'Increased Productivity',
    description: 'One Agent BD handles customers all day, so you can focus on your business growth.',
    stepIndex: 4
  }
];

export const Features: React.FC = () => {
  const [activeFeatureId, setActiveFeatureId] = useState<string>('sales');
  // Steps in chat:
  // 0 = Initial state (customer sent photo + "Price?")
  // 1 = Bot replies "The price of this product is 5000 tk..." (Increased Sales)
  // 2 = Customer asks "What else do you have?"
  // 3 = Bot replies with brown color & blue stripe photos (Instant Replies)
  // 4 = Customer asks "Is this available? I would like to order"
  // 5 = Bot confirms order details & courier booking (Increased Productivity)
  const [chatStep, setChatStep] = useState<number>(1);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Auto-progress the chat conversation smoothly to mimic the video
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setChatStep((prev) => {
        const next = (prev + 1) % 6;
        // Sync active feature highlight with chat progression
        if (next === 1) setActiveFeatureId('sales');
        else if (next === 3) setActiveFeatureId('instant');
        else if (next === 5) setActiveFeatureId('productivity');
        return next;
      });
    }, 4200);

    return () => clearInterval(timer);
  }, [isPaused]);

  // Handle clicking a feature on the left
  const handleSelectFeature = (f: FeatureHighlight) => {
    setActiveFeatureId(f.id);
    if (f.id === 'sales') {
      setChatStep(1);
    } else if (f.id === 'instant') {
      setChatStep(3);
    } else if (f.id === 'productivity') {
      setChatStep(5);
    }
  };

  const handleRestart = () => {
    setChatStep(0);
    setActiveFeatureId('sales');
    setTimeout(() => setChatStep(1), 600);
  };

  return (
    <section
      id="features"
      className="py-16 sm:py-24 bg-[#090C16] text-white relative overflow-hidden transition-colors selection:bg-[#7C3AED] selection:text-white"
    >
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* LEFT COLUMN: Feature highlights list (Exact LazyChat style) */}
          <div className="lg:col-span-5 space-y-8 sm:space-y-12">
            {FEATURE_HIGHLIGHTS.map((item) => {
              const isActive = activeFeatureId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectFeature(item)}
                  className={`group cursor-pointer transition-all duration-300 p-4 sm:p-5 rounded-2xl border ${
                    isActive
                      ? 'bg-white/[0.04] border-purple-500/40 shadow-[0_0_30px_rgba(124,58,237,0.12)]'
                      : 'border-transparent hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Active Indicator Bar */}
                    <div
                      className={`w-1 self-stretch rounded-full transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-b from-[#7C3AED] to-[#A855F7] shadow-[0_0_12px_#7C3AED]'
                          : 'bg-white/10 group-hover:bg-white/20'
                      }`}
                    />

                    <div className="space-y-2">
                      <h3
                        className={`text-xl sm:text-2xl font-bold tracking-tight transition-colors ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      >
                        {item.title}
                      </h3>
                      <p
                        className={`text-xs sm:text-sm leading-relaxed transition-colors ${
                          isActive ? 'text-slate-300' : 'text-slate-500 group-hover:text-slate-400'
                        }`}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Controls & Call to Action */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={handleRestart}
                className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-2 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
                <span>Replay Animation</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPaused((prev) => !prev)}
                className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                {isPaused ? '▶ Resume' : '⏸ Pause'}
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Realistic Smartphone Mockup with Animated Chat (Exact LazyChat Video) */}
          <div className="lg:col-span-7 flex justify-center lg:justify-end relative">
            
            {/* Phone Chassis */}
            <div className="relative w-full max-w-[360px] sm:max-w-[390px] rounded-[48px] p-3.5 bg-gradient-to-b from-neutral-800 via-neutral-900 to-black border-4 border-neutral-700/80 shadow-[0_30px_90px_rgba(0,0,0,0.85)] ring-1 ring-white/15">
              
              {/* Speaker notch / Dynamic Island */}
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-4 bg-neutral-950 rounded-full z-30 flex items-center justify-center">
                <div className="w-10 h-1 bg-neutral-800 rounded-full" />
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 ml-2" />
              </div>

              {/* Inside Screen */}
              <div className="relative rounded-[38px] bg-[#0E0F14] overflow-hidden flex flex-col h-[650px] border border-neutral-800 text-white select-none">
                
                {/* Phone Status & Messenger Header */}
                <div className="pt-6 pb-2.5 px-4 bg-[#14151C]/90 backdrop-blur-md border-b border-white/5 z-20">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold px-1 mb-2">
                    <span>10:44</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px]">5G</span>
                      <div className="w-4 h-2 border border-slate-400 rounded-xs flex items-center p-0.5">
                        <div className="h-full w-full bg-slate-200 rounded-xs" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <ChevronLeft className="w-5 h-5 text-[#0084FF] cursor-pointer" />
                      
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center font-bold text-xs text-white shadow-xs">
                          OA
                        </div>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#14151C]" />
                      </div>

                      <div>
                        <h4 className="text-xs font-bold leading-tight">One Agent Store</h4>
                        <span className="text-[10px] text-emerald-400 font-medium">Active now</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-[#0084FF]">
                      <Phone className="w-4 h-4 cursor-pointer hover:opacity-80" />
                      <Video className="w-4 h-4 cursor-pointer hover:opacity-80" />
                    </div>
                  </div>
                </div>

                {/* Chat Feed */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-none text-xs">
                  
                  {/* Replied to story tag */}
                  <div className="text-center">
                    <span className="text-[10px] text-slate-400 font-medium">
                      You replied to their story
                    </span>
                  </div>

                  {/* 1. Customer sends product image + "Price?" */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-end space-y-1.5"
                  >
                    <div className="w-32 sm:w-36 rounded-2xl overflow-hidden border border-white/10 shadow-md">
                      <img
                        src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=400&q=80"
                        alt="Classic Double Breasted Blazer"
                        className="w-full h-36 object-cover"
                      />
                    </div>
                    <div className="px-3.5 py-2 rounded-2xl rounded-tr-xs bg-[#0084FF] text-white font-medium shadow-sm">
                      Price?
                    </div>
                    <span className="text-[9px] text-slate-400 pr-1">10:44</span>
                  </motion.div>

                  {/* 2. Bot reply: "The price of this product is 5000 tk..." */}
                  {chatStep >= 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.35 }}
                      className="flex items-start gap-2 max-w-[85%]"
                    >
                      <div className="w-6 h-6 rounded-full bg-purple-600 text-[10px] font-black text-white flex items-center justify-center shrink-0 mt-0.5">
                        AI
                      </div>
                      <div className="space-y-1">
                        <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-xs bg-[#242526] text-slate-100 leading-relaxed font-normal shadow-sm">
                          The price of this product is 5000 tk. Would you like to order it?
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* 3. Customer: "What else do you have?" */}
                  {chatStep >= 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-end space-y-1"
                    >
                      <div className="px-3.5 py-2 rounded-2xl rounded-tr-xs bg-[#0084FF] text-white font-medium">
                        What else do you have?
                      </div>
                    </motion.div>
                  )}

                  {/* 4. Bot: "We have brown color and blue stripe as well." + 2 Photos */}
                  {chatStep >= 3 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.35 }}
                      className="flex items-start gap-2 max-w-[92%]"
                    >
                      <div className="w-6 h-6 rounded-full bg-purple-600 text-[10px] font-black text-white flex items-center justify-center shrink-0 mt-0.5">
                        AI
                      </div>
                      <div className="space-y-2">
                        <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-xs bg-[#242526] text-slate-100 leading-relaxed">
                          We have brown color and blue stripe as well.
                        </div>

                        {/* 2 Product Photos Side-by-Side (as in LazyChat Video) */}
                        <div className="grid grid-cols-2 gap-2 pt-0.5">
                          <div className="rounded-xl overflow-hidden border border-white/10 bg-[#1C1D24]">
                            <img
                              src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=300&q=80"
                              alt="Brown Tailored Suit"
                              className="w-full h-24 object-cover"
                            />
                            <div className="p-1.5 text-center text-[10px] font-semibold text-slate-300">
                              Brown Classic
                            </div>
                          </div>
                          <div className="rounded-xl overflow-hidden border border-white/10 bg-[#1C1D24]">
                            <img
                              src="https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=300&q=80"
                              alt="Navy Pinstripe Suit"
                              className="w-full h-24 object-cover"
                            />
                            <div className="p-1.5 text-center text-[10px] font-semibold text-slate-300">
                              Blue Stripe
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* 5. Customer: "Is this available? I would like to order" */}
                  {chatStep >= 4 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-end space-y-1"
                    >
                      <div className="px-3.5 py-2 rounded-2xl rounded-tr-xs bg-[#0084FF] text-white font-medium text-right leading-snug">
                        Is this available? I would like to order
                      </div>
                    </motion.div>
                  )}

                  {/* 6. Bot: Order confirmation & address prompt */}
                  {chatStep >= 5 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.35 }}
                      className="flex items-start gap-2 max-w-[88%]"
                    >
                      <div className="w-6 h-6 rounded-full bg-purple-600 text-[10px] font-black text-white flex items-center justify-center shrink-0 mt-0.5">
                        AI
                      </div>
                      <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-xs bg-[#242526] text-slate-100 leading-relaxed space-y-1">
                        <p>Yes, both are in stock!</p>
                        <p className="text-emerald-400 font-semibold text-[11px]">
                          ✓ Auto-booked Steadfast Courier Cash on Delivery
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Dynamic Typing indicator */}
                  {isTyping && (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-purple-600 text-[10px] font-black text-white flex items-center justify-center shrink-0">
                        AI
                      </div>
                      <div className="px-3 py-2 rounded-2xl rounded-tl-xs bg-[#242526] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Messenger Input Bar */}
                <div className="p-3 bg-[#14151C] border-t border-white/5 flex items-center gap-2 z-20">
                  <div className="flex items-center gap-2 text-[#0084FF]">
                    <Plus className="w-4 h-4 cursor-pointer" />
                    <Camera className="w-4 h-4 cursor-pointer" />
                    <ImageIcon className="w-4 h-4 cursor-pointer" />
                    <Mic className="w-4 h-4 cursor-pointer" />
                  </div>

                  <div className="flex-1 h-8 rounded-full bg-[#242526] px-3 flex items-center justify-between text-slate-400 text-xs">
                    <span>Aa</span>
                    <Smile className="w-4 h-4 text-[#0084FF] cursor-pointer" />
                  </div>

                  <ThumbsUp className="w-4 h-4 text-[#0084FF] cursor-pointer" />
                </div>
              </div>
            </div>

            {/* Floating "Chat with us" Messenger Button (Exact as LazyChat video) */}
            <div className="absolute -bottom-4 right-0 sm:right-6 z-30">
              <div className="px-4 py-2.5 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#0084FF] text-white text-xs font-bold shadow-xl flex items-center gap-2 cursor-pointer hover:scale-105 transition-all">
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Chat with us</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
