import React, { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: string | Date;
  serverTime?: string | Date;
  onExpire?: () => void;
  variant?: 'badge' | 'card' | 'inline';
  showDays?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  serverTime,
  onExpire,
  variant = 'badge',
  showDays = true
}) => {
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;
  const hasExpiredFiredRef = useRef(false);

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalMs: number;
    isExpired: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalMs: 0,
    isExpired: false
  });

  useEffect(() => {
    hasExpiredFiredRef.current = false;
    const targetMs = new Date(targetDate).getTime();
    // Calculate server-to-client clock offset so device clock inaccuracies never distort the timer
    const parsedServerMs = serverTime ? new Date(serverTime).getTime() : NaN;
    const clockOffsetMs = !isNaN(parsedServerMs) ? parsedServerMs - Date.now() : 0;

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const calculate = () => {
      const syncedNow = Date.now() + clockOffsetMs;
      const diff = targetMs - syncedNow;

      if (isNaN(targetMs) || diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalMs: 0,
          isExpired: true
        });
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        if (!hasExpiredFiredRef.current && diff <= 0 && onExpireRef.current) {
          hasExpiredFiredRef.current = true;
          onExpireRef.current();
        }
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        totalMs: diff,
        isExpired: false
      });
    };

    calculate();
    intervalId = setInterval(calculate, 1000);
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [targetDate, serverTime]);

  if (timeLeft.isExpired) {
    if (variant === 'badge') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          <Clock className="w-3 h-3" />
          <span>Expired</span>
        </span>
      );
    }
    return (
      <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
        00d 00h 00m 00s (Expired)
      </span>
    );
  }

  const pad = (n: number) => String(n).padStart(2, '0');

  if (variant === 'card') {
    return (
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <span className="block text-xl font-extrabold text-violet-600 dark:text-violet-400 font-mono">
            {pad(timeLeft.days)}
          </span>
          <span className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
            Days
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <span className="block text-xl font-extrabold text-violet-600 dark:text-violet-400 font-mono">
            {pad(timeLeft.hours)}
          </span>
          <span className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
            Hours
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <span className="block text-xl font-extrabold text-violet-600 dark:text-violet-400 font-mono">
            {pad(timeLeft.minutes)}
          </span>
          <span className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
            Mins
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <span className="block text-xl font-extrabold text-violet-600 dark:text-violet-400 font-mono">
            {pad(timeLeft.seconds)}
          </span>
          <span className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
            Secs
          </span>
        </div>
      </div>
    );
  }

  // Variant 'badge' or 'inline'
  const timeString = showDays && timeLeft.days > 0
    ? `${timeLeft.days}d ${pad(timeLeft.hours)}h ${pad(timeLeft.minutes)}m ${pad(timeLeft.seconds)}s`
    : `${pad(timeLeft.hours + timeLeft.days * 24)}h ${pad(timeLeft.minutes)}m ${pad(timeLeft.seconds)}s`;

  return (
    <span className="font-mono font-bold tracking-tight">
      {timeString}
    </span>
  );
};
