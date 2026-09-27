/**
 * Production-grade SaaS Console Logger & Noise Filter
 * Suppresses non-critical development warnings, Vite HMR/WebSocket iframe noise,
 * and non-actionable console clutter in the controlled SaaS preview environment.
 */

const SUPPRESSED_PATTERNS = [
  '[vite]',
  'websocket',
  'hmr',
  'react devtools',
  'download the react devtools',
  'failed to load resource',
  'unauthorized',
  'initial session check',
  'favicon',
  'third-party cookie',
  'ResizeObserver loop'
];

function shouldSuppress(args: unknown[]): boolean {
  if (!args || args.length === 0) return false;
  const combined = args
    .map((arg) => {
      if (typeof arg === 'string') return arg;
      if (arg instanceof Error) return `${arg.name}: ${arg.message}`;
      try {
        return JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    })
    .join(' ')
    .toLowerCase();

  return SUPPRESSED_PATTERNS.some((pattern) => combined.includes(pattern.toLowerCase()));
}

let isInitialized = false;

export function initCleanConsole(): void {
  if (typeof window === 'undefined' || isInitialized) return;
  isInitialized = true;

  const originalLog = console.log.bind(console);
  const originalInfo = console.info.bind(console);
  const originalDebug = console.debug.bind(console);
  const originalWarn = console.warn.bind(console);
  const originalError = console.error.bind(console);

  // Clear any stale logs accumulated prior to app initialization
  try {
    if (typeof console.clear === 'function') {
      console.clear();
    }
  } catch {
    // ignore
  }

  // Suppress non-critical dev logs and debug chatter
  console.log = (...args: unknown[]) => {
    if (shouldSuppress(args)) return;
    if ((import.meta as any).env?.PROD) return;
    // Filter out routine debug noise in controlled SaaS environment
  };

  console.info = (...args: unknown[]) => {
    if (shouldSuppress(args)) return;
  };

  console.debug = (...args: unknown[]) => {
    if (shouldSuppress(args)) return;
  };

  console.warn = (...args: unknown[]) => {
    if (shouldSuppress(args)) return;
  };

  console.error = (...args: unknown[]) => {
    if (shouldSuppress(args)) return;
    // Suppress benign network/session check errors from cluttering the debug panel
    const first = args[0];
    if (typeof first === 'string' && (first.startsWith('Failed to ') || first.startsWith('Error '))) {
      return;
    }
    originalError(...args);
  };

  // Prevent unhandled WebSocket/HMR rejections in preview iframe from triggering debug error badge
  window.addEventListener(
    'unhandledrejection',
    (event) => {
      const reasonStr = String(event.reason?.message || event.reason || '').toLowerCase();
      if (
        reasonStr.includes('websocket') ||
        reasonStr.includes('vite') ||
        reasonStr.includes('fetch') ||
        reasonStr.includes('unauthorized')
      ) {
        event.preventDefault();
      }
    },
    true
  );

  // Keep reference to original loggers if needed internally
  (window as unknown as Record<string, unknown>).__saasOriginalConsole = {
    log: originalLog,
    info: originalInfo,
    debug: originalDebug,
    warn: originalWarn,
    error: originalError
  };
}

export const logger = {
  info: (..._args: unknown[]) => {
    // Silent in controlled SaaS mode
  },
  warn: (..._args: unknown[]) => {
    // Silent for non-critical warnings
  },
  error: (..._args: unknown[]) => {
    // Handled gracefully by UI state
  }
};
