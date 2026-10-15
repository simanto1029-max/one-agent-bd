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
  Sparkles
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
    stepIndex: 3
  },
  {
    id: 'productivity',
    title: 'Increased Productivity',
    description: 'One Agent BD handles customers all day, so you can focus on your business growth.',
    stepIndex: 5
  }
];

export const Features: React.FC = () => {
  const [activeFeatureId, setActiveFeatureId] = useState<string>('sales');
  // Conversation steps:
  // 0: Customer product image + "Price?"
  // 1: AI reply: "The price of this product is 5000 tk..." (Sales)
  // 2: Customer: "What else do you have?"
  // 3: AI reply: 2 suit photos + "We have brown color and blue stripe..." (Instant)
  // 4: Customer: "Is this available? I would like to order"
  // 5: AI reply: "Yes, both are in stock! Auto-booked Steadfast Courier..." (Productivity)
  const [chatStep, setChatStep] = useState<number>(1);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Self-running autonomous animation loop without any buttons
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const runStep = () => {
      setChatStep((prev) => {
        // Step progression: 1 -> 2 -> 3 -> 4 -> 5 -> loop back to 0 then 1
        if (prev >= 5) {
          // Loop back smoothly
          timeoutId = setTimeout(() => {
            setChatStep(0);
            setActiveFeatureId('sales');
            timeoutId = setTimeout(() => {
              setIsTyping(true);
              timeoutId = setTimeout(() => {
                setIsTyping(false);
                setChatStep(1);
              }, 800);
            }, 600);
          }, 3200);
          return prev;
        }

        const next = prev + 1;
        // Sync active highlight card on the left
        if (next === 1) setActiveFeatureId('sales');
        else if (next === 2 || next === 3) setActiveFeatureId('instant');
        else if (next === 4 || next === 5) setActiveFeatureId('productivity');

        // Show typing indicator briefly before AI messages (steps 1, 3, 5)
        if (next === 1 || next === 3 || next === 5) {
          setIsTyping(true);
          timeoutId = setTimeout(() => {
            setIsTyping(false);
          }, 700);
        }

        return next;
      });
    };

    const intervalId = setInterval(runStep, 3600);

    return () => {
      clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Allow clicking on any highlight to jump directly to that point in the simulation
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

  return (
    <section
      id="features"
      className="py-16 sm:py-24 bg-slate-50 dark:bg-gradient-to-b dark:from-[#0B0720] dark:via-[#130B32] dark:to-[#090518] text-slate-900 dark:text-white relative overflow-hidden transition-colors border-y border-slate-200/80 dark:border-purple-500/20"
    >
      {/* Website Matching Ambient Radial Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/4 right-1/4 w-[480px] h-[480px] bg-[#7C3AED]/10 dark:bg-[#7F22FE]/20 rounded-full blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-1/4 left-1/4 w-[420px] h-[420px] bg-purple-500/10 dark:bg-[#9333EA]/20 rounded-full blur-[110px]"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* LEFT COLUMN: Feature highlights list (LazyChat style with website colors) */}
          <div className="lg:col-span-5 space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#7C3AED]/10 dark:bg-purple-950/60 border border-[#7C3AED]/25 dark:border-purple-500/30 text-xs font-semibold text-[#7C3AED] dark:text-purple-300">
              <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span>Autonomous AI Sales Agent</span>
            </div>

            <div className="space-y-4 sm:space-y-5">
              {FEATURE_HIGHLIGHTS.map((item) => {
                const isActive = activeFeatureId === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectFeature(item)}
                    className={`group cursor-pointer transition-all duration-300 p-5 sm:p-6 rounded-2xl border ${
                      isActive
                        ? 'bg-white dark:bg-[#1A1238]/90 border-purple-500/50 shadow-[0_8px_30px_rgba(124,58,237,0.14)] dark:shadow-[0_0_35px_rgba(124,58,237,0.22)] ring-1 ring-purple-500/30 scale-[1.01]'
                        : 'bg-white/60 dark:bg-white/[0.02] border-slate-200/80 dark:border-white/10 hover:bg-white dark:hover:bg-white/[0.05] hover:border-purple-300 dark:hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Active Indicator Bar */}
                      <div
                        className={`w-1 self-stretch rounded-full transition-all duration-300 ${
                          isActive
                            ? 'bg-gradient-to-b from-[#7C3AED] to-[#A855F7] shadow-[0_0_12px_#7C3AED]'
                            : 'bg-slate-200 dark:bg-white/10 group-hover:bg-slate-300 dark:group-hover:bg-white/20'
                        }`}
                      />

                      <div className="space-y-1.5">
                        <h3
                          className={`text-xl sm:text-2xl font-bold tracking-tight transition-colors ${
                            isActive
                              ? 'text-slate-900 dark:text-white'
                              : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'
                          }`}
                        >
                          {item.title}
                        </h3>
                        <p
                          className={`text-xs sm:text-sm leading-relaxed transition-colors ${
                            isActive
                              ? 'text-slate-600 dark:text-slate-300'
                              : 'text-slate-500 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400'
                          }`}
                        >
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: Realistic iPhone 14 UI Mockup (Shifted left to balance properly with the left column) */}
          <div className="lg:col-span-7 flex justify-center lg:justify-start lg:pl-4 xl:pl-8 relative">
            
            {/* iPhone 14 Frame Container with Outer Buttons */}
            <div className="relative">
              
              {/* iPhone 14 Left Side Buttons (Volume Up / Down / Mute) */}
              <div className="hidden sm:block absolute -left-[7px] top-24 w-[5px] h-9 bg-neutral-600 dark:bg-neutral-700 rounded-l-xs" />
              <div className="hidden sm:block absolute -left-[7px] top-36 w-[5px] h-12 bg-neutral-600 dark:bg-neutral-700 rounded-l-xs" />
              <div className="hidden sm:block absolute -left-[7px] top-52 w-[5px] h-12 bg-neutral-600 dark:bg-neutral-700 rounded-l-xs" />
              
              {/* iPhone 14 Right Side Power Button */}
              <div className="hidden sm:block absolute -right-[7px] top-32 w-[5px] h-16 bg-neutral-600 dark:bg-neutral-700 rounded-r-xs" />

              {/* iPhone 14 Chassis */}
              <div className="w-[340px] sm:w-[380px] rounded-[52px] p-3 sm:p-3.5 bg-gradient-to-b from-[#2C2D35] via-[#1E1F27] to-[#121319] border-2 border-neutral-600/70 dark:border-neutral-700/60 shadow-[0_25px_70px_rgba(15,23,42,0.25)] dark:shadow-[0_30px_90px_rgba(0,0,0,0.85)] ring-1 ring-white/20">
                
                {/* Inside Screen */}
                <div className="relative rounded-[42px] bg-[#0E0F15] overflow-hidden flex flex-col h-[640px] border border-neutral-800 text-white select-none shadow-inner">
                  
                  {/* iPhone 14 iOS Top Bar with Dynamic Island */}
                  <div className="pt-3 pb-2 px-6 bg-[#13141B] z-30 select-none">
                    
                    {/* Status Bar Row (Time, Dynamic Island, Battery) */}
                    <div className="flex items-center justify-between text-xs font-semibold text-white">
                      {/* Left: Apple 9:41 Time */}
                      <span className="w-12 text-left font-bold tracking-tight text-[13px] pl-1">
                        9:41
                      </span>

                      {/* Center: iPhone 14 Dynamic Island */}
                      <div className="w-24 h-[22px] bg-black rounded-full flex items-center justify-between px-2 shadow-xs border border-neutral-800/80">
                        {/* Camera lens */}
                        <div className="w-2 h-2 rounded-full bg-[#111219] ring-1 ring-neutral-700/60" />
                        {/* Audio sensor dot */}
                        <div className="w-1.5 h-1.5 rounded-full bg-[#1b1c26]" />
                      </div>

                      {/* Right: Signal, 5G, Battery */}
                      <div className="w-12 flex items-center justify-end gap-1.5 pr-1">
                        {/* 4-bar signal */}
                        <div className="flex items-end gap-[1.5px] h-2.5">
                          <span className="w-[2px] h-1 bg-white rounded-2xs" />
                          <span className="w-[2px] h-1.5 bg-white rounded-2xs" />
                          <span className="w-[2px] h-2 bg-white rounded-2xs" />
                          <span className="w-[2px] h-2.5 bg-white rounded-2xs" />
                        </div>
                        <span className="text-[10px] font-bold">5G</span>
                        {/* Battery */}
                        <div className="w-5 h-2.5 border border-white/80 rounded-[3px] p-[1.5px] flex items-center relative">
                          <div className="h-full w-3/4 bg-white rounded-[1.5px]" />
                          <div className="w-[2px] h-1 bg-white/80 absolute -right-[3px] rounded-r-2xs" />
                        </div>
                      </div>
                    </div>

                    {/* Messenger Chat App Header */}
                    <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-white/5 pt-2">
                      <div className="flex items-center gap-2">
                        <ChevronLeft className="w-5 h-5 text-[#0084FF] cursor-pointer" />
                        
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-xs">
                            OA
                          </div>
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#13141B]" />
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
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none text-xs bg-[#0E0F15]">
                    
                    {/* Story reply indicator */}
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
                          className="w-full h-32 object-cover"
                        />
                      </div>
                      <div className="px-3.5 py-2 rounded-2xl rounded-tr-xs bg-[#0084FF] text-white font-medium shadow-sm">
                        Price?
                      </div>
                      <span className="text-[9px] text-slate-400 pr-1">9:41</span>
                    </motion.div>

                    {/* 2. Bot reply: "The price of this product is 5000 tk..." */}
                    {chatStep >= 1 && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-start gap-2 max-w-[86%]"
                      >
                        <div className="w-6 h-6 rounded-full bg-purple-600 text-[10px] font-black text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
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
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
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
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-start gap-2 max-w-[92%]"
                      >
                        <div className="w-6 h-6 rounded-full bg-purple-600 text-[10px] font-black text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                          AI
                        </div>
                        <div className="space-y-2">
                          <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-xs bg-[#242526] text-slate-100 leading-relaxed">
                            We have brown color and blue stripe as well.
                          </div>

                          {/* 2 Product Photos Side-by-Side */}
                          <div className="grid grid-cols-2 gap-2 pt-0.5">
                            <div className="rounded-xl overflow-hidden border border-white/10 bg-[#1C1D24]">
                              <img
                                src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=300&q=80"
                                alt="Brown Tailored Suit"
                                className="w-full h-20 object-cover"
                              />
                              <div className="p-1 text-center text-[10px] font-semibold text-slate-300">
                                Brown Classic
                              </div>
                            </div>
                            <div className="rounded-xl overflow-hidden border border-white/10 bg-[#1C1D24]">
                              <img
                                src="https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=300&q=80"
                                alt="Navy Pinstripe Suit"
                                className="w-full h-20 object-cover"
                              />
                              <div className="p-1 text-center text-[10px] font-semibold text-slate-300">
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
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
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
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-start gap-2 max-w-[88%]"
                      >
                        <div className="w-6 h-6 rounded-full bg-purple-600 text-[10px] font-black text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
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

                    {/* Typing indicator */}
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
                  <div className="p-3 bg-[#13141B] border-t border-white/5 flex items-center gap-2 z-20">
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

                  {/* iOS Home Indicator Bar */}
                  <div className="py-1 bg-[#13141B] flex justify-center">
                    <div className="w-32 h-1 bg-white/40 rounded-full" />
                  </div>

                </div>
              </div>

              {/* Floating "Chat with us" Messenger Button */}
              <div className="absolute -bottom-4 -right-2 sm:right-2 z-30">
                <div className="px-4 py-2.5 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#0084FF] text-white text-xs font-bold shadow-xl flex items-center gap-2 cursor-pointer hover:scale-105 transition-all">
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Chat with us</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
