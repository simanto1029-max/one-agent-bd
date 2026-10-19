import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  Image as ImageIcon,
  Mic,
  Smile,
  ThumbsUp,
  LayoutGrid
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
  const [activeFeatureId, setActiveFeatureId] = useState<string>('productivity');
  // Conversation steps matching LazyChat video and screenshot:
  // 0: Customer sends suit photo + "Price?"
  // 1: AI reply: "The price of this product is 5000 tk..." (Increased Sales)
  // 2: Customer: "What else do you have?"
  // 3: AI reply: "We have brown color and blue stripe as well." + 2 suit photos (Instant Replies)
  // 4: Customer: "Is this available? I would like to order"
  // 5: AI reply: "Yes. The price is 5000tk. Please give me your: - name - address - phone number" (Increased Productivity)
  // 6: Customer: "John\nHouse 11, road 30, gulshan , dhaka\n018 9492 7244"
  const [chatStep, setChatStep] = useState<number>(6);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const sectionRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isVisibleRef = useRef<boolean>(true);

  // Auto-scroll inside the phone UI whenever chatStep or isTyping changes
  useEffect(() => {
    if (scrollContainerRef.current && isVisibleRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chatStep, isTyping]);

  // Observer to pause animation loop when scrolled out of view (saves massive CPU/battery)
  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        isVisibleRef.current = entries[0].isIntersecting;
      },
      { threshold: 0.1 }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Autonomous animation loop: only advances when section is visible
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const runStep = () => {
      if (!isVisibleRef.current) return;
      setChatStep((prev) => {
        if (prev >= 6) {
          // Pause at the final completed state, then loop back to start smoothly
          timeoutId = setTimeout(() => {
            if (!isVisibleRef.current) return;
            setChatStep(0);
            setActiveFeatureId('sales');
            timeoutId = setTimeout(() => {
              if (!isVisibleRef.current) return;
              setIsTyping(true);
              timeoutId = setTimeout(() => {
                setIsTyping(false);
                setChatStep(1);
              }, 600);
            }, 800);
          }, 4000);
          return prev;
        }

        const next = prev + 1;

        // Sync active feature highlight on the left
        if (next <= 1) {
          setActiveFeatureId('sales');
        } else if (next >= 2 && next <= 3) {
          setActiveFeatureId('instant');
        } else if (next >= 4) {
          setActiveFeatureId('productivity');
        }

        // Trigger typing indicator before AI messages
        if (next === 1 || next === 3 || next === 5) {
          setIsTyping(true);
          timeoutId = setTimeout(() => {
            setIsTyping(false);
          }, 600);
        }

        return next;
      });
    };

    const intervalId = setInterval(runStep, 4000);

    return () => {
      clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const handleSelectFeature = (f: FeatureHighlight) => {
    setActiveFeatureId(f.id);
    if (f.id === 'sales') {
      setChatStep(1);
    } else if (f.id === 'instant') {
      setChatStep(3);
    } else if (f.id === 'productivity') {
      setChatStep(6);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="features"
      className="py-10 sm:py-14 bg-white dark:bg-[#0B0720] text-slate-900 dark:text-white relative overflow-hidden select-none border-y border-slate-100 dark:border-purple-500/15 transition-colors"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '650px' }}
    >
      {/* Subtle ambient lighting with zero blur cost */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.05) 0%, transparent 70%)'
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)'
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* LEFT COLUMN: Clean Minimal List matching LazyChat Screenshot on White Background */}
          <div className="lg:col-span-5 space-y-10 sm:space-y-12">
            {FEATURE_HIGHLIGHTS.map((item) => {
              const isActive = activeFeatureId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectFeature(item)}
                  className="flex items-start gap-4 cursor-pointer group transition-all"
                >
                  {/* Left Vertical Indicator Bar (Vibrant green/emerald when active) */}
                  <div
                    className={`w-[3px] self-stretch rounded-full transition-all duration-300 ${
                      isActive
                        ? 'bg-[#00DF8F] shadow-[0_0_12px_#00DF8F]'
                        : 'bg-slate-200 dark:bg-white/10 group-hover:bg-slate-300 dark:group-hover:bg-white/20'
                    }`}
                  />

                  {/* Title & Description */}
                  <div className="space-y-1.5">
                    <h3
                      className={`text-lg sm:text-xl font-bold tracking-tight transition-colors ${
                        isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                      }`}
                    >
                      {item.title}
                    </h3>
                    <p
                      className={`text-sm leading-relaxed max-w-sm transition-colors ${
                        isActive ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 dark:text-slate-400'
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT COLUMN: iPhone 14 UI Mockup with Auto-scrolling Messenger Chat */}
          <div className="lg:col-span-7 flex justify-center lg:justify-center relative">
            
            {/* iPhone 14 Outer Chassis */}
            <div className="relative w-[320px] sm:w-[350px] rounded-[48px] p-2.5 sm:p-3 bg-gradient-to-b from-[#383a45] via-[#1c1d24] to-[#121319] border border-white/20 shadow-[0_25px_80px_rgba(0,0,0,0.9)]">
              
              {/* iPhone 14 Side Volume / Power Indicators */}
              <div className="hidden sm:block absolute -left-[5px] top-24 w-[4px] h-8 bg-neutral-600 rounded-l-xs" />
              <div className="hidden sm:block absolute -left-[5px] top-36 w-[4px] h-10 bg-neutral-600 rounded-l-xs" />
              <div className="hidden sm:block absolute -right-[5px] top-32 w-[4px] h-12 bg-neutral-600 rounded-r-xs" />

              {/* iPhone 14 Screen Interior */}
              <div className="relative rounded-[40px] bg-[#000000] overflow-hidden flex flex-col h-[610px] border border-neutral-800/80 text-white">
                
                {/* Dynamic Island & iOS Status Bar */}
                <div className="pt-2.5 pb-2 px-5 bg-black z-30 select-none">
                  <div className="flex items-center justify-between text-xs font-semibold text-white">
                    <span className="w-10 text-left font-bold text-[12px] pl-1">
                      9:41
                    </span>

                    {/* Dynamic Island */}
                    <div className="w-24 h-[20px] bg-black rounded-full flex items-center justify-between px-2 border border-neutral-800">
                      <div className="w-2 h-2 rounded-full bg-[#111219] ring-1 ring-neutral-700/60" />
                      <div className="w-1.5 h-1.5 rounded-full bg-[#1b1c26]" />
                    </div>

                    <div className="w-10 flex items-center justify-end gap-1.5 pr-1">
                      <div className="flex items-end gap-[1.5px] h-2.5">
                        <span className="w-[2px] h-1 bg-white rounded-2xs" />
                        <span className="w-[2px] h-1.5 bg-white rounded-2xs" />
                        <span className="w-[2px] h-2 bg-white rounded-2xs" />
                        <span className="w-[2px] h-2.5 bg-white rounded-2xs" />
                      </div>
                      <div className="w-4 h-2.5 border border-white/80 rounded-[3px] p-[1.5px] flex items-center relative">
                        <div className="h-full w-3/4 bg-white rounded-[1px]" />
                        <div className="w-[2px] h-1 bg-white/80 absolute -right-[3px] rounded-r-2xs" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messenger Chat Feed with Smooth Auto-Scroll */}
                <div
                  ref={scrollContainerRef}
                  className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3 scroll-smooth scrollbar-none text-[13px] bg-black"
                >
                  {/* 1. Customer: Product photo (Three-piece suit) + "Price?" */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-end space-y-1.5"
                  >
                    <div className="w-36 rounded-2xl overflow-hidden border border-white/10 shadow-md">
                      <img
                        src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=400&q=80"
                        alt="Three-Piece Suit"
                        className="w-full h-36 object-cover"
                      />
                    </div>
                    <div className="px-3.5 py-1.5 rounded-2xl rounded-tr-xs bg-[#0084FF] text-white font-medium shadow-sm">
                      Price?
                    </div>
                  </motion.div>

                  {/* 2. Bot: "The price of this product is 5000 tk..." */}
                  {chatStep >= 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-start gap-2 max-w-[85%]"
                    >
                      <div className="w-6 h-6 rounded-full bg-neutral-800 text-[10px] font-bold text-white flex items-center justify-center shrink-0 mt-0.5 border border-white/10">
                        OA
                      </div>
                      <div className="px-3.5 py-2 rounded-2xl rounded-tl-xs bg-[#262626] text-white leading-snug">
                        The price of this product is 5000 tk. Would you like to order it?
                      </div>
                    </motion.div>
                  )}

                  {/* 3. Customer: "What else do you have?" */}
                  {chatStep >= 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-col items-end"
                    >
                      <div className="px-3.5 py-1.5 rounded-2xl rounded-tr-xs bg-[#0084FF] text-white font-medium">
                        What else do you have?
                      </div>
                    </motion.div>
                  )}

                  {/* 4. Bot: "We have brown color and blue stripe as well." + 2 suit photos */}
                  {chatStep >= 3 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-start gap-2 max-w-[90%]"
                    >
                      <div className="w-6 h-6 rounded-full bg-neutral-800 text-[10px] font-bold text-white flex items-center justify-center shrink-0 mt-0.5 border border-white/10">
                        OA
                      </div>
                      <div className="space-y-1.5">
                        <div className="px-3.5 py-2 rounded-2xl rounded-tl-xs bg-[#262626] text-white leading-snug">
                          We have brown color and blue stripe as well.
                        </div>

                        {/* 2 Product Photos */}
                        <div className="grid grid-cols-2 gap-1.5">
                          <div className="rounded-xl overflow-hidden border border-white/10 bg-[#1A1A1A]">
                            <img
                              src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=300&q=80"
                              alt="Brown Tailored Suit"
                              className="w-full h-20 object-cover"
                            />
                          </div>
                          <div className="rounded-xl overflow-hidden border border-white/10 bg-[#1A1A1A]">
                            <img
                              src="https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=300&q=80"
                              alt="Blue Stripe Suit"
                              className="w-full h-20 object-cover"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* 5. Customer: "Is this available? I would like to order" (Exact LazyChat screenshot) */}
                  {chatStep >= 4 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-col items-end"
                    >
                      <div className="px-3.5 py-2 rounded-2xl rounded-tr-xs bg-[#0084FF] text-white font-medium text-right leading-snug">
                        Is this available? I would like to order
                      </div>
                    </motion.div>
                  )}

                  {/* 6. Bot: Order details request (Exact LazyChat screenshot) */}
                  {chatStep >= 5 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-start gap-2 max-w-[85%]"
                    >
                      <div className="w-6 h-6 rounded-full bg-neutral-800 text-[10px] font-bold text-white flex items-center justify-center shrink-0 mt-0.5 border border-white/10">
                        OA
                      </div>
                      <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-xs bg-[#262626] text-white leading-relaxed text-[13px]">
                        <div>Yes. The price is 5000tk.</div>
                        <div className="mt-1">Please give me your:</div>
                        <div className="text-slate-200">- name</div>
                        <div className="text-slate-200">- address</div>
                        <div className="text-slate-200">- phone number</div>
                      </div>
                    </motion.div>
                  )}

                  {/* 7. Customer: Customer address and phone response (Exact LazyChat screenshot) */}
                  {chatStep >= 6 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-col items-end"
                    >
                      <div className="px-3.5 py-2 rounded-2xl rounded-tr-xs bg-[#0084FF] text-white font-medium text-left leading-relaxed text-[13px]">
                        <div>John</div>
                        <div>House 11, road 30, gulshan , dhaka</div>
                        <div>018 9492 7244</div>
                      </div>
                    </motion.div>
                  )}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-neutral-800 text-[10px] font-bold text-white flex items-center justify-center shrink-0 border border-white/10">
                        OA
                      </div>
                      <div className="px-3 py-2 rounded-2xl rounded-tl-xs bg-[#262626] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Messenger Bar matching LazyChat Screenshot Exactly */}
                <div className="p-2.5 bg-black border-t border-neutral-900 flex items-center gap-2.5 z-20">
                  <div className="flex items-center gap-2 text-[#0084FF]">
                    <LayoutGrid className="w-4 h-4 cursor-pointer" />
                    <Camera className="w-4 h-4 cursor-pointer" />
                    <ImageIcon className="w-4 h-4 cursor-pointer" />
                    <Mic className="w-4 h-4 cursor-pointer" />
                  </div>

                  <div className="flex-1 h-8 rounded-full bg-[#262626] px-3 flex items-center justify-between text-slate-400 text-xs">
                    <span>Aa</span>
                    <Smile className="w-4 h-4 text-[#0084FF] cursor-pointer" />
                  </div>

                  <ThumbsUp className="w-4 h-4 text-[#0084FF] cursor-pointer" />
                </div>

                {/* iPhone Home Indicator Bar */}
                <div className="py-1 bg-black flex justify-center">
                  <div className="w-28 h-1 bg-white/40 rounded-full" />
                </div>

              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
