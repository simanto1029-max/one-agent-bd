import { Router, Request, Response } from 'express';
import { db, StoreIntegration, Order } from '../db/database.js';
import { getAuthenticatedUser } from './auth.js';
import { getUserSubscriptionStatus } from '../services/subscriptionService.js';

export const storesRouter = Router();

// GET /api/stores - List stores for current user
storesRouter.get('/', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const subStatus = getUserSubscriptionStatus(user.id);
  const stores = db.getStores(user.id);

  // Compute aggregated stats
  const totalStores = stores.length;
  const activeStores = stores.filter((s) => s.is_active).length;
  const totalSyncedOrders = stores.reduce((sum, s) => sum + (s.synced_orders_count || 0), 0);
  const totalRevenueSynced = stores.reduce((sum, s) => sum + (s.total_revenue_synced || 0), 0);

  return res.json({
    stores,
    isProPlan: subStatus.canAccessStores || subStatus.isProPlan || user.role === 'admin',
    stats: {
      totalStores,
      activeStores,
      totalSyncedOrders,
      totalRevenueSynced
    }
  });
});

// POST /api/stores - Connect a new store (Included in both 1,250 TK Starter & 1,950 TK Pro Plans)
storesRouter.post('/', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const subStatus = getUserSubscriptionStatus(user.id);
  const canAddWebsite = subStatus.canAccessStores || subStatus.isProPlan || user.role === 'admin';

  if (!canAddWebsite) {
    return res.status(403).json({
      error: 'Active plan required to connect a website.',
      code: 'PLAN_REQUIRED'
    });
  }

  const { platform, store_name, store_url, api_key, webhook_secret } = req.body;

  if (!store_name || !store_name.trim()) {
    return res.status(400).json({ error: 'Store name is required' });
  }

  const validPlatforms = ['shopify', 'woocommerce', 'custom_website'];
  const chosenPlatform = validPlatforms.includes(platform) ? platform : 'shopify';

  const newStore: StoreIntegration = {
    id: `store_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    user_id: user.id,
    platform: chosenPlatform,
    store_name: store_name.trim(),
    store_url: store_url ? store_url.trim() : '',
    api_key: api_key ? api_key.trim() : undefined,
    webhook_secret: webhook_secret ? webhook_secret.trim() : `sec_${Math.random().toString(36).substring(2, 12)}`,
    is_active: true,
    synced_orders_count: 0,
    total_revenue_synced: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.createStore(newStore);

  return res.status(201).json({
    store: newStore,
    message: `${newStore.store_name} connected successfully! Use the webhook URL to sync live orders.`
  });
});

// GET /api/stores/:id - Get store details
storesRouter.get('/:id', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const store = db.getStoreById(req.params.id);
  if (!store) {
    return res.status(404).json({ error: 'Store not found' });
  }

  if (store.user_id !== user.id && user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  return res.json(store);
});

// PUT /api/stores/:id - Update store
storesRouter.put('/:id', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const store = db.getStoreById(req.params.id);
  if (!store) {
    return res.status(404).json({ error: 'Store not found' });
  }

  if (store.user_id !== user.id && user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { store_name, store_url, is_active, api_key } = req.body;
  const updates: Partial<StoreIntegration> = {};

  if (store_name !== undefined) updates.store_name = store_name.trim();
  if (store_url !== undefined) updates.store_url = store_url.trim();
  if (is_active !== undefined) updates.is_active = Boolean(is_active);
  if (api_key !== undefined) updates.api_key = api_key.trim();

  const updated = db.updateStore(store.id, updates);
  return res.json({ store: updated, message: 'Store configuration updated successfully' });
});

// DELETE /api/stores/:id - Disconnect store
storesRouter.delete('/:id', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const store = db.getStoreById(req.params.id);
  if (!store) {
    return res.status(404).json({ error: 'Store not found' });
  }

  if (store.user_id !== user.id && user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  db.deleteStore(store.id);
  return res.json({ success: true, message: 'Store disconnected successfully' });
});

// POST /api/stores/:id/sync-test - Simulate an incoming order from Shopify / WooCommerce / Webhook
storesRouter.post('/:id/sync-test', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const subStatus = getUserSubscriptionStatus(user.id);
  const canSyncWebsite = subStatus.canAccessStores || subStatus.isProPlan || user.role === 'admin';

  if (!canSyncWebsite) {
    return res.status(403).json({
      error: 'Active plan required for website order synchronization.',
      code: 'PLAN_REQUIRED'
    });
  }

  const store = db.getStoreById(req.params.id);
  if (!store) {
    return res.status(404).json({ error: 'Store not found' });
  }

  const customData = req.body || {};

  // Sample realistic items based on platform
  const sampleItemsList = [
    { title: 'Premium Cotton Oxford Shirt (Sky Blue - L)', price: 1250, qty: 1 },
    { title: 'Executive Leather Wallet & Belt Gift Set', price: 1850, qty: 1 },
    { title: 'Casual Polo Tee (Dark Navy) & Chino Pant combo', price: 2100, qty: 1 },
    { title: 'Traditional Silk Panjabi (Semi-fitted Cream)', price: 2750, qty: 1 },
    { title: 'Embroidered Lawn Three Piece Suit', price: 3200, qty: 1 }
  ];
  const chosenItem = sampleItemsList[Math.floor(Math.random() * sampleItemsList.length)];

  const sampleCustomers = [
    { name: 'Kazi Mahfuzur Rahman', phone: '01712-987654', address: 'House 14, Road 5, Dhanmondi, Dhaka' },
    { name: 'Dr. Sharmin Akter', phone: '01819-234567', address: 'Apartment 7A, Green View Tower, Gulshan 2, Dhaka' },
    { name: 'Tanvir Hossain', phone: '01911-345678', address: 'Plot 45, Sector 4, Uttara, Dhaka' },
    { name: 'Nafisa Tabassum', phone: '01622-456789', address: 'Road 11, Block D, Banani, Dhaka' },
    { name: 'Rezaul Karim', phone: '01515-678901', address: 'Holding 82, CDA Avenue, Nasirabad, Chittagong' }
  ];
  const chosenCustomer = sampleCustomers[Math.floor(Math.random() * sampleCustomers.length)];

  const externalOrderNum = customData.external_order_id || `#${Math.floor(1000 + Math.random() * 9000)}`;
  const totalAmount = customData.total_amount || chosenItem.price;

  const newOrder: Order = {
    id: `ord_web_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    user_id: user.id,
    customer_id: `cust_web_${Date.now()}`,
    customer_name: customData.customer_name || chosenCustomer.name,
    customer_phone: customData.customer_phone || chosenCustomer.phone,
    customer_address: customData.customer_address || chosenCustomer.address,
    platform: store.platform,
    items: customData.items || chosenItem.title,
    quantity: customData.quantity || chosenItem.qty,
    total_amount: totalAmount,
    currency: 'BDT',
    payment_method: customData.payment_method || (Math.random() > 0.5 ? 'cod' : 'bkash'),
    payment_status: customData.payment_status || (Math.random() > 0.5 ? 'paid' : 'pending'),
    status: 'confirmed',
    order_source: 'website',
    source_details: {
      platform: store.platform,
      store_id: store.id,
      store_name: store.store_name,
      external_order_id: externalOrderNum,
      store_url: store.store_url
    },
    is_vip: true, // Website orders are marked as VIP customers for 1-click WhatsApp re-engagement
    notes: `Synchronized in real-time from ${store.store_name} (${store.platform.toUpperCase()}) Order ${externalOrderNum}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.createOrder(newOrder);

  // Update store stats
  const newOrderCount = (store.synced_orders_count || 0) + 1;
  const newRevenue = (store.total_revenue_synced || 0) + totalAmount;
  db.updateStore(store.id, {
    synced_orders_count: newOrderCount,
    total_revenue_synced: newRevenue,
    last_synced_at: new Date().toISOString()
  });

  return res.status(201).json({
    success: true,
    order: newOrder,
    message: `🎉 Simulated order ${externalOrderNum} from ${store.store_name} routed to Orders Hub!`
  });
});
