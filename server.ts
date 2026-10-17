import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { authRouter } from './server/routes/auth.js';
import { plansRouter } from './server/routes/plans.js';
import { subscriptionsRouter } from './server/routes/subscriptions.js';
import { paymentsRouter } from './server/routes/payments.js';
import { channelsRouter } from './server/routes/channels.js';
import { settingsRouter } from './server/routes/settings.js';
import { inboxRouter } from './server/routes/inbox.js';
import { contactsRouter } from './server/routes/contacts.js';
import { webhooksRouter } from './server/routes/webhooks.js';
import { adminRouter } from './server/routes/admin.js';
import { aiChatRouter } from './server/routes/aiChat.js';
import { ordersRouter, checkAndRunScheduledCourierDispatches } from './server/routes/orders.js';
import { storesRouter } from './server/routes/stores.js';
import { callRequestsRouter } from './server/routes/callRequests.js';
import { widgetRouter } from './server/routes/widget.js';
import { productsRouter } from './server/routes/products.js';
import { appointmentsRouter } from './server/routes/appointments.js';
import { emailCampaignsRouter } from './server/routes/emailCampaigns.js';
import { erpRouter } from './server/routes/erp.js';
import { agentsRouter } from './server/routes/agents.js';
import { runSubscriptionExpiryCheck } from './server/services/subscriptionService.js';
import { runAutoFollowUpEngine } from './server/services/metaService.js';
import { startTunnelIfNeeded } from './server/services/tunnelService.js';
import { db } from './server/db/database.js';

dotenv.config();
process.env.DISABLE_HMR = 'true';

const PORT = 3000;
export const app = express();

// Trust forward proxy headers (for accurate https protocol behind Cloudflare, Nginx, or reverse proxies)
app.set('trust proxy', true);

// Parse JSON and urlencoded request bodies with rawBody capture for Meta webhook signature verification
app.use(
  express.json({
    limit: '50mb',
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    }
  })
);
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS / security headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-user-id');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Mount Webhooks Router first (Ultra-fast <10ms response for Meta webhook verification & event intake)
app.use('/api/webhooks', webhooksRouter);

let lastExpiryCheckAt = 0;

// Serverless & Cloud Database Synchronization Middleware
app.use('/api', async (req, res, next) => {
  // Never block webhooks on database sync
  if (req.path.startsWith('/webhooks')) {
    return next();
  }
  try {
    await db.syncFromSupabase();
    if (Date.now() - lastExpiryCheckAt >= 60 * 1000) {
      lastExpiryCheckAt = Date.now();
      runSubscriptionExpiryCheck();
    }
  } catch (err) {
    console.warn('[API Sync Middleware] Warning:', err);
  }

  const originalSend = res.send.bind(res);
  let sendIntercepted = false;
  (res as any).send = function (body?: any) {
    if (sendIntercepted) {
      return originalSend(body);
    }
    sendIntercepted = true;
    res.send = originalSend;
    db.flushToSupabase()
      .catch(() => {})
      .finally(() => {
        originalSend(body);
      });
    return res;
  };

  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    app: 'One Agent BD',
    supabase_connected: Boolean(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL),
    timestamp: new Date().toISOString()
  });
});

// SQL Schema download / inspect endpoint for easy Supabase setup
app.get('/api/schema-sql', (req, res) => {
  try {
    const schemaPath = path.join(process.cwd(), 'server', 'db', 'schema.sql');
    res.sendFile(schemaPath);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Mount API routers
app.use('/api/auth', authRouter);
app.use('/api/plans', plansRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/channels', channelsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/inbox', inboxRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/ai-chat', aiChatRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/stores', storesRouter);
app.use('/api/call-requests', callRequestsRouter);
app.use('/api/widget', widgetRouter);
app.use('/api/products', productsRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/email-campaigns', emailCampaignsRouter);
app.use('/api/erp', erpRouter);
app.use('/api/agents', agentsRouter);

async function startServer() {
  startTunnelIfNeeded();

  // Run initial expiry check on startup, then every 60 seconds (1 minute) for real-time precision
  try {
    await db.syncFromSupabase(true);
    runSubscriptionExpiryCheck();
  } catch (err) {
    console.error('[Startup Expiry Check] Error:', err);
  }

  setInterval(() => {
    try {
      const result = runSubscriptionExpiryCheck();
      if (result.expiredCount > 0) {
        console.log(`[Cron Expiry Worker] Updated ${result.expiredCount} expired subscriptions.`);
      }
    } catch (err) {
      console.error('[Cron Expiry Worker] Error:', err);
    }

    try {
      checkAndRunScheduledCourierDispatches();
    } catch (courierErr) {
      console.error('[Auto Courier Scheduler] Error:', courierErr);
    }
  }, 60 * 1000);

  // Background Smart Auto Follow-up Worker (runs every 15 mins within Meta 24h window)
  setInterval(() => {
    runAutoFollowUpEngine()
      .then((res) => {
        if (res.followUpsSent > 0) {
          console.log(`[Auto Follow-up Engine] Sent ${res.followUpsSent} follow-up messages.`);
        }
      })
      .catch((err) => {
        console.error('[Auto Follow-up Engine] Error:', err);
      });
  }, 15 * 60 * 1000);

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vitePkg = 'vite';
    const { createServer: createViteServer } = await import(vitePkg);
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 One Agent BD Server running at http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('Fatal server startup error:', err);
    process.exit(1);
  });
}

export default app;
