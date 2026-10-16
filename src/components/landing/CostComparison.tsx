import React from 'react';
import { motion } from 'motion/react';

interface CostComparisonProps {
  onStartTrial?: () => void;
}

export const CostComparison: React.FC<CostComparisonProps> = () => {
  return (
    <section
      id="roi-comparison"
      className="py-10 sm:py-14 bg-white dark:bg-[#0A071E] border-b border-slate-100 dark:border-purple-500/15 transition-colors relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* =================================================================
              LEFT: PURE, CLEAN HEADLINE & SUBTITLE (ZERO EXTRA TEXT)
             ================================================================= */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-5 text-left">
            <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-black tracking-tight text-slate-900 dark:text-white leading-[1.14]">
              Why Pay{' '}
              <span className="line-through text-rose-500 decoration-rose-500 decoration-[3px] sm:decoration-[4px]">
                20,000 TK
              </span>{' '}
              for a Moderator?
            </h2>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-xl">
              Replace slow human shifts with 24/7 autonomous AI. Cut 90% of your operating expense while replying 10x faster.
            </p>
          </div>

          {/* =================================================================
              RIGHT: THE HUMAN MODERATOR IMAGE (CLEAN, ULTRA-PREMIUM)
             ================================================================= */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="relative w-full max-w-lg rounded-2xl sm:rounded-3xl p-2 sm:p-2.5 bg-slate-100/90 dark:bg-[#160E36] border border-slate-200 dark:border-purple-500/25 shadow-[0_12px_40px_-15px_rgba(0,0,0,0.08)]"
            >
              {/* Image Frame (Pure clean image, zero text overlays) */}
              <div className="relative rounded-xl sm:rounded-2xl overflow-hidden aspect-[16/11] bg-slate-100 dark:bg-slate-900">
                <img
                  src="/images/human-moderator.jpg"
                  alt="Human customer support moderator"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://as1.ftcdn.net/v2/jpg/06/27/40/15/360_F_627401533_DlCrKgnWzhy3vlnwQKZjeDEkTnofF8bk.jpg';
                  }}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};
