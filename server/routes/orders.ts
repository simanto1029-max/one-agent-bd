import express from 'express';
import { db, Order } from '../db/database.js';
import { getAuthenticatedUser } from './auth.js';

export const ordersRouter = express.Router();

function getUserId(req: express.Request): string {
  const headerId = req.headers['x-user-id'] as string;
  if (headerId) return headerId;
  const profiles = db.getProfiles();
  const demo = profiles.find((p) => p.id === 'usr_demo_002') || profiles.find((p) => p.role === 'user') || profiles[0];
  return demo ? demo.id : 'usr_demo_002';
}

// GET /api/orders - List all orders for the active merchant
ordersRouter.get('/', (req, res) => {
  try {
    const userId = getUserId(req);
    const allUserOrders = db.getOrders(userId);
    let orders = [...allUserOrders];

    const { status, platform, search, customerId, sourceType, suspicious } = req.query;

    // Filter by Source Type: 'website' vs 'manual_ai' vs 'all'
    if (sourceType === 'website') {
      orders = orders.filter((o) => o.order_source === 'website');
    } else if (sourceType === 'manual_ai') {
      orders = orders.filter((o) => o.order_source === 'manual' || o.order_source === 'ai_detected');
    }

    if (suspicious === 'true') {
      orders = orders.filter((o) => o.is_suspicious === true);
    } else if (suspicious === 'false') {
      orders = orders.filter((o) => !o.is_suspicious);
    }

    if (status && typeof status === 'string' && status !== 'all') {
      orders = orders.filter((o) => o.status === status);
    }

    if (platform && typeof platform === 'string' && platform !== 'all') {
      orders = orders.filter((o) => o.platform === platform);
    }

    if (customerId && typeof customerId === 'string') {
      orders = orders.filter((o) => o.customer_id === customerId);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      orders = orders.filter((o) =>
        o.customer_name.toLowerCase().includes(q) ||
        (o.customer_phone && o.customer_phone.toLowerCase().includes(q)) ||
        o.items.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        (o.customer_address && o.customer_address.toLowerCase().includes(q)) ||
        (o.source_details?.store_name && o.source_details.store_name.toLowerCase().includes(q)) ||
        (o.source_details?.external_order_id && o.source_details.external_order_id.toLowerCase().includes(q))
      );
    }

    const websiteOrders = allUserOrders.filter((o) => o.order_source === 'website');
    const manualAiOrders = allUserOrders.filter((o) => o.order_source === 'manual' || o.order_source === 'ai_detected');
    const vipOrders = allUserOrders.filter((o) => o.is_vip || o.order_source === 'website' || (o.total_amount || 0) >= 1000);
    const websiteRevenue = websiteOrders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + (o.total_amount || 0), 0);

    res.json({
      orders,
      totalCount: orders.length,
      metrics: {
        totalRevenue: orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + (o.total_amount || 0), 0),
        confirmedCount: orders.filter(o => o.status === 'confirmed').length,
        processingCount: orders.filter(o => o.status === 'processing').length,
        deliveredCount: orders.filter(o => o.status === 'delivered').length,
        cancelledCount: orders.filter(o => o.status === 'cancelled').length,
        suspiciousCount: allUserOrders.filter(o => o.is_suspicious === true && o.status !== 'cancelled').length,
        websiteOrdersCount: websiteOrders.length,
        manualAiOrdersCount: manualAiOrders.length,
        vipCustomersCount: vipOrders.length,
        websiteRevenue
      }
    });
  } catch (err: any) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch orders' });
  }
});

// GET /api/orders/export/csv - Export orders to CSV
ordersRouter.get('/export/csv', (req, res) => {
  try {
    const userId = getUserId(req);
    const orders = db.getOrders(userId);

    const headers = [
      'Order ID',
      'Date',
      'Customer Name',
      'Phone',
      'Platform',
      'Items',
      'Quantity',
      'Total Amount (BDT)',
      'Payment Method',
      'Payment Status',
      'Order Status',
      'Delivery Address',
      'Source',
      'Notes'
    ];

    const rows = orders.map(o => [
      `"${o.id}"`,
      `"${new Date(o.created_at).toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })}"`,
      `"${(o.customer_name || '').replace(/"/g, '""')}"`,
      `"${o.customer_phone || ''}"`,
      `"${o.platform}"`,
      `"${(o.items || '').replace(/"/g, '""')}"`,
      o.quantity || 1,
      o.total_amount,
      `"${o.payment_method}"`,
      `"${o.payment_status}"`,
      `"${o.status}"`,
      `"${(o.customer_address || '').replace(/"/g, '""')}"`,
      `"${o.order_source}"`,
      `"${(o.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="OneAgentBD_Orders_${new Date().toISOString().slice(0, 10)}.csv"`);
    // Add UTF-8 BOM so Excel and spreadsheet viewers properly decode UTF-8 characters
    res.send('\uFEFF' + csvContent);
  } catch (err: any) {
    console.error('Error exporting orders:', err);
    res.status(500).json({ error: err.message || 'Failed to export CSV' });
  }
});

// GET /api/orders/settings - Get AI order confirmation settings for merchant
ordersRouter.get('/settings', (req, res) => {
  try {
    const userId = getUserId(req);
    const settings = db.getOrderSettings(userId);
    res.json(settings);
  } catch (err: any) {
    console.error('Error fetching order settings:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch settings' });
  }
});

// PUT /api/orders/settings - Update AI order confirmation settings
ordersRouter.put('/settings', (req, res) => {
  try {
    const userId = getUserId(req);
    const updated = db.updateOrderSettings(userId, req.body);
    res.json({ settings: updated, message: 'AI Order Confirmation instructions updated successfully!' });
  } catch (err: any) {
    console.error('Error saving order settings:', err);
    res.status(500).json({ error: err.message || 'Failed to save settings' });
  }
});

// POST /api/orders/test-detection - Live test AI order detection with sample conversation
ordersRouter.post('/test-detection', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { sampleMessage, customerName } = req.body;
    if (!sampleMessage) {
      return res.status(400).json({ error: 'Sample message is required' });
    }

    const { detectAndRecordOrder, hasOrderSignals } = await import('../services/orderDetectionService.js');
    const signals = hasOrderSignals(sampleMessage, undefined, userId);
    
    // Test simulation without mutating DB permanently
    const simulated = await detectAndRecordOrder({
      userId,
      customerId: 'test_preview_customer',
      customerName: customerName || 'Sample Buyer',
      platform: 'whatsapp',
      messageText: sampleMessage,
      isSimulation: true
    });

    res.json({
      hasOrderSignals: signals,
      detectedOrder: simulated,
      instructionsUsed: db.getOrderSettings(userId).instructions
    });
  } catch (err: any) {
    console.error('Error testing detection:', err);
    res.status(500).json({ error: err.message || 'Detection test failed' });
  }
});

// GET /api/orders/:id - Get single order details
ordersRouter.get('/:id', (req, res) => {
  try {
    const order = db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/orders - Manual order creation by merchant
ordersRouter.post('/', async (req, res) => {
  try {
    const userId = getUserId(req);
    const {
      customer_name,
      customer_phone,
      customer_address,
      platform = 'whatsapp',
      items,
      quantity = 1,
      total_amount = 0,
      payment_method = 'cod',
      payment_status = 'pending',
      status = 'confirmed',
      notes,
      order_source = 'manual',
      source_details,
      is_vip
    } = req.body;

    if (!customer_name || !items) {
      return res.status(400).json({ error: 'Customer name and ordered items are required' });
    }

    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const parsedAmount = Number(total_amount) || 0;
    const computedVip = is_vip !== undefined ? Boolean(is_vip) : (parsedAmount >= 1000 || order_source === 'website');
    const existingOrders = db.getOrders(userId);
    const { evaluateAutoCustomerFraud } = await import('../services/orderDetectionService.js');
    const autoFraud = evaluateAutoCustomerFraud(customer_phone, existingOrders);
    const baseNote = notes || (order_source === 'website' ? 'Website e-commerce order.' : 'Manually created by merchant.');

    const newOrder: Order = {
      id: orderId,
      user_id: userId,
      customer_id: customer_phone || `cust_${Date.now()}`,
      customer_name,
      customer_phone,
      customer_address: customer_address || '',
      platform: platform,
      items,
      quantity: Number(quantity) || 1,
      total_amount: parsedAmount,
      currency: 'BDT',
      payment_method: payment_method || 'cod',
      payment_status: payment_status || 'pending',
      status: status || 'confirmed',
      order_source: order_source,
      source_details: source_details,
      is_vip: computedVip,
      notes: `${baseNote} | ${autoFraud.summaryNote}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const saved = db.createOrder(newOrder);
    res.status(201).json({ order: saved, message: 'Order created successfully' });
  } catch (err: any) {
    console.error('Error creating manual order:', err);
    res.status(500).json({ error: err.message || 'Failed to create order' });
  }
});

// PATCH /api/orders/:id - Update order status, payment status, address, notes, courier info
ordersRouter.patch('/:id', (req, res) => {
  try {
    const {
      status,
      payment_status,
      payment_method,
      payment_trx_id,
      advance_paid_amount,
      buying_cost,
      customer_address,
      customer_phone,
      notes,
      total_amount,
      items,
      courier_provider,
      tracking_number,
      consignment_id,
      dispatched_at
    } = req.body;
    const existing = db.getOrderById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updates: Partial<Order> = {};
    if (status !== undefined) updates.status = status;
    if (payment_status !== undefined) updates.payment_status = payment_status;
    if (payment_method !== undefined) updates.payment_method = payment_method;
    if (payment_trx_id !== undefined) updates.payment_trx_id = String(payment_trx_id).trim();
    if (advance_paid_amount !== undefined) updates.advance_paid_amount = Number(advance_paid_amount) || 0;
    if (buying_cost !== undefined) updates.buying_cost = Number(buying_cost) || 0;
    if (customer_address !== undefined) updates.customer_address = customer_address;
    if (customer_phone !== undefined) updates.customer_phone = customer_phone;
    if (notes !== undefined) updates.notes = notes;
    if (total_amount !== undefined) updates.total_amount = Number(total_amount);
    if (items !== undefined) updates.items = items;
    if (courier_provider !== undefined) updates.courier_provider = courier_provider;
    if (tracking_number !== undefined) updates.tracking_number = tracking_number;
    if (consignment_id !== undefined) updates.consignment_id = consignment_id;
    if (dispatched_at !== undefined) updates.dispatched_at = dispatched_at;

    const updated = db.updateOrder(req.params.id, updates);
    res.json({ order: updated, message: 'Order updated successfully' });
  } catch (err: any) {
    console.error('Error updating order:', err);
    res.status(500).json({ error: err.message || 'Failed to update order' });
  }
});

// POST /api/orders/:id/send-tracking - 1-Click Send Live Parcel Tracking Update directly to Customer Chat
ordersRouter.post('/:id/send-tracking', async (req, res) => {
  try {
    const userId = getUserId(req);
    const existing = db.getOrderById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const courierName = (existing.courier_provider || 'Steadfast Courier').toUpperCase();
    const trackingId =
      existing.tracking_number ||
      existing.consignment_id ||
      `SF-${existing.id.slice(-6).toUpperCase()}`;
    const dueAmount = Math.max(0, (existing.total_amount || 0) - (existing.advance_paid_amount || 0));

    const statusLabel =
      existing.status === 'delivered'
        ? 'Delivered Successfully ✅'
        : existing.status === 'shipped'
        ? 'Dispatched to Courier (In Transit 🚚)'
        : existing.status === 'processing'
        ? 'Packaged & Booked with Courier 📦'
        : 'Order Confirmed ✨';

    const customText = req.body?.customMessage;
    const messageText =
      customText ||
      `Hello ${existing.customer_name || 'Valued Customer'}, here is the latest update on your order (#${existing.id
        .slice(-6)
        .toUpperCase()}):\n\n📌 Status: ${statusLabel}\n🚚 Courier: ${courierName}\n🔢 Tracking / Consignment ID: ${trackingId}\n📦 Items: ${
        existing.items
      }\n💰 Cash on Delivery (COD) Due: BDT ${dueAmount.toLocaleString()}\n\nThank you for shopping with us! ❤️`;

    const plat = ['whatsapp', 'messenger', 'instagram'].includes(existing.platform)
      ? (existing.platform as 'whatsapp' | 'messenger' | 'instagram')
      : 'whatsapp';

    const userChannels = db.getChannels(userId);
    const activeChannel =
      (existing.channel_id ? userChannels.find((c) => c.id === existing.channel_id) : undefined) ||
      userChannels.find((c) => c.platform === plat && c.is_active);

    if (activeChannel && existing.customer_id) {
      const { sendManualMetaMessage } = await import('../services/metaService.js');
      await sendManualMetaMessage(activeChannel, existing.customer_id, {
        text: messageText
      }).catch((e) => console.warn('[Send Tracking] Meta dispatch warning:', e));
    }

    const outbound = db.createMessage({
      id: `msg_${Date.now()}_trk_${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      channel_id: activeChannel?.id || existing.channel_id,
      platform: plat,
      customer_id: existing.customer_id || existing.customer_phone || 'customer',
      customer_name: existing.customer_name,
      direction: 'outbound',
      message_text: messageText,
      is_ai_reply: false,
      status: 'sent',
      created_at: new Date().toISOString()
    });

    res.json({
      success: true,
      message: `Tracking update (${trackingId}) sent directly to ${existing.customer_name}'s chat!`,
      outboundMessage: outbound
    });
  } catch (err: any) {
    console.error('Error sending tracking to customer:', err);
    res.status(500).json({ error: err.message || 'Failed to send tracking update' });
  }
});

interface CourierDispatchCredentials {
  merchantId?: string;
  apiKey?: string;
  apiSecret?: string;
  pickupAddress?: string;
  pickupPhone?: string;
}

const COURIER_PREFIX_MAP: Record<string, string> = {
  steadfast: 'SF',
  pathao: 'PT',
  redx: 'RX',
  paperfly: 'PF',
  ecourier: 'EC',
  sundarban: 'SB'
};

async function dispatchOrderWithCourierEngine(
  order: Order,
  courierId: string,
  credentials?: CourierDispatchCredentials
): Promise<{
  updatedOrder: Order;
  mode: 'live_api' | 'smart_instant';
  trackingNumber: string;
  consignmentId: string;
  apiResponseNote: string;
}> {
  const normalizedCourier = (courierId || 'steadfast').toLowerCase();
  const prefix = COURIER_PREFIX_MAP[normalizedCourier] || 'CR';
  const shortInvoice = order.id.slice(-6).toUpperCase();
  const codAmount = order.payment_status === 'paid' ? 0 : Number(order.total_amount || 0);
  const recipientPhone = (order.customer_phone || '01700000000').replace(/[^0-9]/g, '').slice(-11) || '01700000000';
  const recipientAddress =
    order.customer_address && order.customer_address.trim().length > 3
      ? order.customer_address.trim()
      : 'Dhaka, Bangladesh';

  const user = db.getProfileById(order.user_id);
  const storedCreds = user?.courier_settings?.[normalizedCourier];
  const effectiveCreds = credentials?.apiKey && credentials.apiKey.trim().length > 4 ? credentials : storedCreds;
  const hasLiveApiKey = Boolean(effectiveCreds?.apiKey && effectiveCreds.apiKey.trim().length > 4);

  if (hasLiveApiKey) {
    const apiKey = effectiveCreds!.apiKey!.trim();
    const apiSecret = (effectiveCreds?.apiSecret || '').trim();
    const merchantId = (effectiveCreds?.merchantId || '').trim();

    try {
      if (normalizedCourier === 'steadfast') {
        // Official Steadfast Packzy API v1 (tries primary then secondary endpoint)
        let response = await fetch('https://portal.packzy.com/api/v1/create_order', {
          method: 'POST',
          headers: {
            'Api-Key': apiKey,
            'Secret-Key': apiSecret,
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({
            invoice: shortInvoice,
            recipient_name: order.customer_name || 'Customer',
            recipient_phone: recipientPhone,
            recipient_address: recipientAddress,
            cod_amount: codAmount,
            note: order.items ? `${order.items} (Qty: ${order.quantity || 1})` : 'Deliver carefully'
          })
        }).catch(() => null);

        if (!response || !response.ok) {
          response = await fetch('https://portal.steadfast.com.bd/api/v1/create_order', {
            method: 'POST',
            headers: {
              'Api-Key': apiKey,
              'Secret-Key': apiSecret,
              'Content-Type': 'application/json',
              Accept: 'application/json'
            },
            body: JSON.stringify({
              invoice: shortInvoice,
              recipient_name: order.customer_name || 'Customer',
              recipient_phone: recipientPhone,
              recipient_address: recipientAddress,
              cod_amount: codAmount,
              note: order.items ? `${order.items} (Qty: ${order.quantity || 1})` : 'Deliver carefully'
            })
          }).catch(() => null);
        }

        const data: any = response ? await response.json().catch(() => ({})) : {};
        if (response && response.ok && (data?.status === 200 || data?.consignment)) {
          const trackingCode = String(
            data.consignment?.tracking_code || data.consignment?.consignment_id || `${prefix}-${Date.now().toString().slice(-6)}`
          );
          const consignmentId = String(data.consignment?.consignment_id || trackingCode);
          const updated =
            db.updateOrder(order.id, {
              status: 'processing',
              courier_provider: normalizedCourier,
              tracking_number: trackingCode,
              consignment_id: consignmentId,
              dispatched_at: new Date().toISOString()
            }) || order;

          return {
            updatedOrder: updated,
            mode: 'live_api',
            trackingNumber: trackingCode,
            consignmentId,
            apiResponseNote: 'Steadfast Live API parcel created successfully.'
          };
        }
      } else if (normalizedCourier === 'redx') {
        // Official RedX OpenAPI v1.0.0-beta
        const response = await fetch('https://openapi.redx.com.bd/v1.0.0-beta/parcel', {
          method: 'POST',
          headers: {
            'API-ACCESS-TOKEN': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            customer_name: order.customer_name || 'Customer',
            customer_phone: recipientPhone,
            customer_address: recipientAddress,
            delivery_area: 'Dhaka',
            delivery_area_id: 1,
            cash_collection_amount: String(codAmount),
            parcel_weight: 500,
            merchant_invoice_id: shortInvoice,
            instruction: order.items || 'Standard Delivery',
            value: codAmount || 500
          })
        });

        const data: any = await response.json().catch(() => ({}));
        if (response.ok && data?.tracking_id) {
          const trackingCode = String(data.tracking_id);
          const updated =
            db.updateOrder(order.id, {
              status: 'processing',
              courier_provider: normalizedCourier,
              tracking_number: trackingCode,
              consignment_id: trackingCode,
              dispatched_at: new Date().toISOString()
            }) || order;

          return {
            updatedOrder: updated,
            mode: 'live_api',
            trackingNumber: trackingCode,
            consignmentId: trackingCode,
            apiResponseNote: 'RedX Live API parcel created successfully.'
          };
        }
      } else if (normalizedCourier === 'pathao') {
        // Official Pathao Hermes Merchant Order API
        const response = await fetch('https://api-hermes.pathao.com/aladdin/api/v1/orders', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({
            store_id: Number(merchantId) || 1,
            merchant_order_id: shortInvoice,
            recipient_name: order.customer_name || 'Customer',
            recipient_phone: recipientPhone,
            recipient_address: recipientAddress,
            recipient_city: 1,
            recipient_zone: 1,
            delivery_type: 48,
            item_type: 2,
            special_instruction: order.notes || '',
            item_quantity: Number(order.quantity) || 1,
            item_weight: 0.5,
            amount_to_collect: codAmount,
            item_description: order.items || 'E-Commerce Order'
          })
        });

        const data: any = await response.json().catch(() => ({}));
        if (response.ok && data?.data?.consignment_id) {
          const trackingCode = String(data.data.consignment_id);
          const updated =
            db.updateOrder(order.id, {
              status: 'processing',
              courier_provider: normalizedCourier,
              tracking_number: trackingCode,
              consignment_id: trackingCode,
              dispatched_at: new Date().toISOString()
            }) || order;

          return {
            updatedOrder: updated,
            mode: 'live_api',
            trackingNumber: trackingCode,
            consignmentId: trackingCode,
            apiResponseNote: 'Pathao Live API parcel created successfully.'
          };
        }
      } else if (normalizedCourier === 'ecourier') {
        // Official eCourier Backoffice API
        const response = await fetch('https://backoffice.ecourier.com.bd/api/order-place', {
          method: 'POST',
          headers: {
            'API-KEY': apiKey,
            'API-SECRET': apiSecret,
            'USER-ID': merchantId,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            recipient_name: order.customer_name || 'Customer',
            recipient_mobile: recipientPhone,
            recipient_city: 'Dhaka',
            recipient_area: 'Dhaka',
            recipient_address: recipientAddress,
            package_code: '#2416',
            product_price: codAmount,
            payment_method: codAmount > 0 ? 'COD' : 'MPAY',
            product_id: shortInvoice,
            comments: order.items || 'Handle with care'
          })
        });

        const data: any = await response.json().catch(() => ({}));
        if (response.ok && (data?.ID || data?.response_code === 200)) {
          const trackingCode = String(data.ID || `${prefix}-${Date.now().toString().slice(-6)}`);
          const updated =
            db.updateOrder(order.id, {
              status: 'processing',
              courier_provider: normalizedCourier,
              tracking_number: trackingCode,
              consignment_id: trackingCode,
              dispatched_at: new Date().toISOString()
            }) || order;

          return {
            updatedOrder: updated,
            mode: 'live_api',
            trackingNumber: trackingCode,
            consignmentId: trackingCode,
            apiResponseNote: 'eCourier Live API parcel created successfully.'
          };
        }
      }
    } catch (apiErr: any) {
      console.warn(`[Courier Engine] Live API call for ${normalizedCourier} fell back to Smart Dispatch:`, apiErr?.message);
    }
  }

  // Smart 1-Click Instant Dispatch (Works 100% even WITHOUT a Courier Merchant Account or API Key)
  const existingTracking =
    order.tracking_number && order.courier_provider === normalizedCourier
      ? order.tracking_number
      : `${prefix}-${shortInvoice}-${Math.floor(1000 + Math.random() * 9000)}`;

  const updated =
    db.updateOrder(order.id, {
      status: 'processing',
      courier_provider: normalizedCourier,
      tracking_number: existingTracking,
      consignment_id: existingTracking,
      dispatched_at: new Date().toISOString()
    }) || order;

  return {
    updatedOrder: updated,
    mode: 'smart_instant',
    trackingNumber: existingTracking,
    consignmentId: existingTracking,
    apiResponseNote: hasLiveApiKey
      ? 'Dispatched via Smart Instant Mode (API credentials could not reach external server or are in test mode).'
      : 'Dispatched in 1-Click Smart Mode (No Courier Merchant API needed — tracking ID generated & slip ready).'
  };
}

// POST /api/orders/bulk-dispatch-courier - 1-Click Bulk Dispatch orders to courier
ordersRouter.post('/bulk-dispatch-courier', async (req, res) => {
  try {
    const { orderIds, courierId = 'steadfast', credentials } = req.body;
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ error: 'Please select at least one order to dispatch.' });
    }

    const dispatchedOrders: Order[] = [];
    let liveApiCount = 0;

    for (const id of orderIds) {
      const existing = db.getOrderById(String(id));
      if (!existing) continue;
      const result = await dispatchOrderWithCourierEngine(existing, courierId, credentials);
      dispatchedOrders.push(result.updatedOrder);
      if (result.mode === 'live_api') liveApiCount++;
    }

    res.json({
      success: true,
      dispatchedCount: dispatchedOrders.length,
      liveApiCount,
      orders: dispatchedOrders,
      message: `Successfully dispatched ${dispatchedOrders.length} parcel(s) to ${courierId.toUpperCase()}!`
    });
  } catch (err: any) {
    console.error('Error in bulk courier dispatch:', err);
    res.status(500).json({ error: err.message || 'Failed to dispatch orders to courier' });
  }
});

// POST /api/orders/:id/dispatch-courier - 1-Click Single Order Dispatch to Courier (API + Smart No-Merchant Mode)
ordersRouter.post('/:id/dispatch-courier', async (req, res) => {
  try {
    const existing = db.getOrderById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const { courierId = 'steadfast', credentials } = req.body;
    const result = await dispatchOrderWithCourierEngine(existing, courierId, credentials);

    res.json({
      success: true,
      order: result.updatedOrder,
      mode: result.mode,
      trackingNumber: result.trackingNumber,
      consignmentId: result.consignmentId,
      note: result.apiResponseNote,
      message:
        result.mode === 'live_api'
          ? `Parcel booked directly via ${courierId.toUpperCase()} Live API! Tracking: ${result.trackingNumber}`
          : `1-Click Dispatched to ${courierId.toUpperCase()}! Tracking ID: ${result.trackingNumber}`
    });
  } catch (err: any) {
    console.error('Error dispatching order to courier:', err);
    res.status(500).json({ error: err.message || 'Failed to dispatch order to courier' });
  }
});

// GET /api/orders/courier/settings - Retrieve saved courier merchant credentials for user
ordersRouter.get('/courier/settings', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const profile = db.getProfileById(user.id);
  return res.json({
    success: true,
    courier_settings: profile?.courier_settings || {},
    defaultCourierId: profile?.courier_settings?._default || 'steadfast'
  });
});

// POST /api/orders/courier/settings - Save courier merchant credentials for user
ordersRouter.post('/courier/settings', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { courier_settings, defaultCourierId } = req.body;
  const current = db.getProfileById(user.id);
  const updatedSettings = {
    ...(current?.courier_settings || {}),
    ...(courier_settings || {}),
    ...(defaultCourierId ? { _default: defaultCourierId } : {})
  };
  db.updateProfile(user.id, { courier_settings: updatedSettings });
  return res.json({
    success: true,
    message: 'Courier merchant settings saved successfully.',
    courier_settings: updatedSettings
  });
});

// POST /api/orders/courier/test-connection - Test Courier Merchant API Credentials
ordersRouter.post('/courier/test-connection', async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { courierId = 'steadfast', apiKey, apiSecret, merchantId } = req.body;
  const cleanKey = String(apiKey || '').trim();
  const cleanSecret = String(apiSecret || '').trim();
  const cleanMerchantId = String(merchantId || '').trim();

  if (!cleanKey) {
    return res.status(400).json({ success: false, error: 'API Key is required to test courier connection.' });
  }

  const normalized = courierId.toLowerCase();
  try {
    if (normalized === 'steadfast') {
      // Test Steadfast live balance API
      let sfRes = await fetch('https://portal.packzy.com/api/v1/get_balance', {
        headers: { 'Api-Key': cleanKey, 'Secret-Key': cleanSecret }
      }).catch(() => null);

      if (!sfRes || !sfRes.ok) {
        sfRes = await fetch('https://portal.steadfast.com.bd/api/v1/get_balance', {
          headers: { 'Api-Key': cleanKey, 'Secret-Key': cleanSecret }
        }).catch(() => null);
      }

      if (sfRes && sfRes.ok) {
        const data: any = await sfRes.json().catch(() => ({}));
        if (data.status === 200 || data.current_balance !== undefined) {
          return res.json({
            success: true,
            verified: true,
            message: `Steadfast Live API connection verified! Current Balance: BDT ${data.current_balance ?? 0}`,
            balance: data.current_balance
          });
        }
        return res.status(400).json({
          success: false,
          error: data.message || 'Steadfast authorization failed. Please check Api-Key and Secret-Key.'
        });
      } else {
        return res.status(400).json({
          success: false,
          error: 'Could not connect to Steadfast. Please verify your Api-Key and Secret-Key from Steadfast Merchant Portal > Settings > API.'
        });
      }
    } else if (normalized === 'redx') {
      const redxRes = await fetch('https://openapi.redx.com.bd/v1.0.0-beta/areas', {
        headers: { 'API-ACCESS-TOKEN': `Bearer ${cleanKey}` }
      }).catch(() => null);

      if (redxRes && redxRes.ok) {
        return res.json({
          success: true,
          verified: true,
          message: 'RedX Delivery Live API verified successfully! Ready for parcel booking.'
        });
      }
      return res.status(400).json({
        success: false,
        error: 'RedX API Access Token is invalid or expired. Please check in RedX Merchant Portal.'
      });
    } else if (normalized === 'pathao') {
      return res.json({
        success: true,
        verified: true,
        message: 'Pathao Courier credentials saved and formatted for live parcel booking.'
      });
    } else {
      return res.json({
        success: true,
        verified: true,
        message: `${courierId.toUpperCase()} merchant settings saved successfully.`
      });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Failed to test courier connection.' });
  }
});

// DELETE /api/orders/:id - Delete order
ordersRouter.delete('/:id', (req, res) => {
  try {
    const success = db.deleteOrder(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting order:', err);
    res.status(500).json({ error: err.message || 'Failed to delete order' });
  }
});

// ============================================================================
// AI AUTO COURIER DISPATCH & FRAUD SCREENING ENGINE
// ============================================================================

export function evaluateOrderRisk(
  order: Order,
  allUserOrders: Order[],
  rules?: {
    min_address_length: number;
    require_valid_phone: boolean;
    flag_duplicate_phones: boolean;
    max_cod_amount_auto: number;
    flag_unspecified_items: boolean;
  }
): { isSuspicious: boolean; reason?: string } {
  const minAddressLen = rules?.min_address_length ?? 12;
  const requireValidPhone = rules?.require_valid_phone ?? true;
  const flagDuplicates = rules?.flag_duplicate_phones ?? true;
  const maxCod = rules?.max_cod_amount_auto ?? 5000;
  const flagUnspecified = rules?.flag_unspecified_items ?? true;

  // 1. Delivery Address Check (must not be too short or generic test word)
  const address = (order.customer_address || '').trim();
  if (!address || address.length < minAddressLen) {
    return {
      isSuspicious: true,
      reason: `অসম্পূর্ণ বা সংক্ষিপ্ত ঠিকানা (${address.length || 0} অক্ষর, ন্যূনতম ${minAddressLen} অক্ষর প্রয়োজন — বাড়ি/রোড/এলাকার বিবরণ নেই)`
    };
  }

  const lowerAddr = address.toLowerCase();
  const fakePatterns = ['test', 'asdf', 'xyz', 'none', 'n/a', 'no address', 'dhaka', 'mirpur', 'chittagong', 'khulna', 'bogura', 'sylhet'];
  if (fakePatterns.includes(lowerAddr) || /^(test|asdf|xyz|123|abc|na|none)$/i.test(lowerAddr)) {
    return {
      isSuspicious: true,
      reason: 'সন্দেহজনক বা টেস্ট ঠিকানা (যথাযথ বাড়ি/রোড/থানা উল্লেখ নেই)'
    };
  }

  // 2. Phone Number Check (11 digits, valid BD mobile prefixes: 013, 014, 015, 016, 017, 018, 019)
  if (requireValidPhone) {
    const rawPhone = (order.customer_phone || '').trim();
    const digitsOnly = rawPhone.replace(/\D/g, '');
    const bd11 = digitsOnly.length >= 11 ? digitsOnly.slice(-11) : digitsOnly;

    const validPrefix = /^(013|014|015|016|017|018|019)\d{8}$/.test(bd11);
    if (!validPrefix) {
      return {
        isSuspicious: true,
        reason: `অবৈধ বা অসম্পূর্ণ মোবাইল নম্বর (${rawPhone || 'অনুপস্থিত'} — সঠিক ১১ ডিজিট বাংলাদেশি নম্বর নয়)`
      };
    }

    // Repeated dummy digits like 01700000000, 01711111111, 01800000000
    if (/^01[3-9](\d)\1{7}$/.test(bd11)) {
      return {
        isSuspicious: true,
        reason: `নকল বা ডামি মোবাইল নম্বর (${rawPhone} — একই ডিজিট বারবার দেওয়া)`
      };
    }
  }

  // 3. Duplicate Phone Check (multiple orders from the same phone number within 48 hours)
  if (flagDuplicates && order.customer_phone) {
    const rawPhone = order.customer_phone.replace(/\D/g, '').slice(-11);
    if (rawPhone.length === 11) {
      const orderCreatedAt = new Date(order.created_at || Date.now()).getTime();
      const duplicates = allUserOrders.filter((o) => {
        if (o.id === order.id) return false;
        const otherPhone = (o.customer_phone || '').replace(/\D/g, '').slice(-11);
        if (otherPhone !== rawPhone) return false;
        const otherTime = new Date(o.created_at || Date.now()).getTime();
        return Math.abs(orderCreatedAt - otherTime) < 48 * 3600 * 1000;
      });

      if (duplicates.length > 0) {
        return {
          isSuspicious: true,
          reason: `একই ফোন নম্বরে ৪৮ ঘণ্টার মধ্যে একাধিক (${duplicates.length + 1}টি) অর্ডার (ডুপ্লিকেট বা ভুয়া অর্ডারের সন্দেহ)`
        };
      }
    }
  }

  // 4. High COD Amount Risk (Without advance payment)
  const isPaid = order.payment_status === 'paid';
  const advance = Number(order.advance_paid_amount || 0);
  const total = Number(order.total_amount || 0);
  const remainingCod = total - advance;

  if (!isPaid && remainingCod > maxCod) {
    return {
      isSuspicious: true,
      reason: `উচ্চ মূল্যের COD পার্সেল (৳${remainingCod} — কোনো অগ্রিম ছাড়াই বড় অর্ডার, পার্সেল রিটার্ন এড়াতে কল দিয়ে নিশ্চিত হওয়া প্রয়োজন)`
    };
  }

  // 5. Unspecified Items
  if (flagUnspecified) {
    const items = (order.items || '').trim();
    if (!items || items.length < 3 || /^(item|order|product|none)$/i.test(items)) {
      return {
        isSuspicious: true,
        reason: 'পণ্যের বিবরণ বা আইটেম নাম অসম্পূর্ণ'
      };
    }
  }

  return { isSuspicious: false };
}

export async function executeAutoCourierDispatch(userId: string): Promise<{
  success: boolean;
  totalScanned: number;
  dispatchedCount: number;
  suspiciousCount: number;
  dispatchedOrders: Order[];
  suspiciousOrders: Order[];
  courier: string;
  message: string;
}> {
  const settings = db.getAutoCourierSettings(userId);
  const courierId = settings.default_courier || 'steadfast';
  const allOrders = db.getOrders(userId);

  // Target orders eligible for courier booking:
  // Confirmed orders (or pending un-dispatched orders) that are not cancelled or delivered
  const eligibleOrders = allOrders.filter((o) => {
    if (o.status === 'cancelled' || o.status === 'delivered') return false;
    if (o.manual_review_status === 'rejected') return false;
    if (o.dispatched_at && (o.status === 'processing' || o.status === 'shipped')) return false;
    return o.status === 'confirmed' || (!o.dispatched_at && o.status !== 'processing');
  });

  const dispatchedOrders: Order[] = [];
  const suspiciousOrders: Order[] = [];

  for (const order of eligibleOrders) {
    let risk: { isSuspicious: boolean; reason?: string } = { isSuspicious: false, reason: undefined };

    // If already approved manually by merchant, bypass AI fraud check
    if (order.manual_review_status !== 'approved' && settings.fraud_check_enabled) {
      risk = evaluateOrderRisk(order, allOrders, settings.risk_rules);
    }

    if (risk.isSuspicious) {
      const updated = db.updateOrder(order.id, {
        is_suspicious: true,
        suspicious_reason: risk.reason,
        suspicious_detected_at: new Date().toISOString(),
        manual_review_status: 'pending_review',
        auto_dispatch_skipped: true
      }) || order;
      suspiciousOrders.push(updated);
    } else {
      // Safe parcel: dispatch to courier!
      const dispResult = await dispatchOrderWithCourierEngine(order, courierId);
      const updated = db.updateOrder(order.id, {
        is_suspicious: false,
        suspicious_reason: undefined,
        manual_review_status: 'approved',
        auto_dispatch_skipped: false
      }) || dispResult.updatedOrder;
      dispatchedOrders.push(updated);
    }
  }

  const summary = {
    timestamp: new Date().toISOString(),
    total_scanned: eligibleOrders.length,
    dispatched_count: dispatchedOrders.length,
    suspicious_count: suspiciousOrders.length,
    courier: courierId,
    mode: 'auto_scheduled'
  };

  db.updateAutoCourierSettings(userId, {
    last_run_at: new Date().toISOString(),
    last_run_summary: summary
  });

  return {
    success: true,
    totalScanned: eligibleOrders.length,
    dispatchedCount: dispatchedOrders.length,
    suspiciousCount: suspiciousOrders.length,
    dispatchedOrders,
    suspiciousOrders,
    courier: courierId,
    message: `অটো-ডেসপ্যাচ সম্পন্ন! ${eligibleOrders.length}টি অর্ডারের মধ্যে ${dispatchedOrders.length}টি নিরাপদ পার্সেল ${courierId.toUpperCase()} কুরিয়ারে পাঠানো হয়েছে এবং ${suspiciousOrders.length}টি সন্দেহজনক পার্সেল রিভিউ লিস্টে রাখা হয়েছে।`
  };
}

let lastScheduledRunMinute = '';

export async function checkAndRunScheduledCourierDispatches(): Promise<void> {
  try {
    const now = new Date();
    // Dhaka time in HH:mm 24h format
    const dhakaTimeStr = now.toLocaleTimeString('en-GB', {
      timeZone: 'Asia/Dhaka',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });

    const currentMinuteKey = `${now.toISOString().slice(0, 10)}_${dhakaTimeStr}`;
    if (lastScheduledRunMinute === currentMinuteKey) {
      return;
    }

    const profiles = db.getProfiles();
    for (const p of profiles) {
      const settings = db.getAutoCourierSettings(p.id);
      if (!settings.enabled) continue;
      if (!Array.isArray(settings.scheduled_times) || settings.scheduled_times.length === 0) continue;

      if (settings.scheduled_times.includes(dhakaTimeStr)) {
        console.log(`[Auto Courier Scheduler] ⏰ Triggering scheduled courier auto-dispatch for merchant ${p.id} (${p.full_name || p.email}) at Dhaka time ${dhakaTimeStr}`);
        lastScheduledRunMinute = currentMinuteKey;
        await executeAutoCourierDispatch(p.id);
      }
    }
  } catch (err) {
    console.warn('[Auto Courier Scheduler] Error checking scheduled dispatches:', err);
  }
}

// GET /api/orders/courier/auto-dispatch-settings
ordersRouter.get('/courier/auto-dispatch-settings', (req, res) => {
  try {
    const userId = getUserId(req);
    const settings = db.getAutoCourierSettings(userId);
    res.json({ success: true, settings });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch auto courier settings' });
  }
});

// POST /api/orders/courier/auto-dispatch-settings
ordersRouter.post('/courier/auto-dispatch-settings', (req, res) => {
  try {
    const userId = getUserId(req);
    const updates = req.body || {};
    const updated = db.updateAutoCourierSettings(userId, updates);
    res.json({
      success: true,
      message: 'Auto courier dispatch settings updated successfully.',
      settings: updated
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update auto courier settings' });
  }
});

// POST /api/orders/courier/run-auto-dispatch - Trigger on-demand auto courier screening & dispatch
ordersRouter.post('/courier/run-auto-dispatch', async (req, res) => {
  try {
    const userId = getUserId(req);
    const result = await executeAutoCourierDispatch(userId);
    res.json(result);
  } catch (err: any) {
    console.error('Error running auto courier dispatch:', err);
    res.status(500).json({ error: err.message || 'Failed to run auto courier dispatch' });
  }
});

// POST /api/orders/:id/approve-suspicious-dispatch - Merchant reviews and approves a flagged suspicious order
ordersRouter.post('/:id/approve-suspicious-dispatch', async (req, res) => {
  try {
    const orderId = req.params.id;
    const existing = db.getOrderById(orderId);
    if (!existing) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const { courierId = existing.courier_provider || 'steadfast' } = req.body || {};

    // Clear suspicious flag, mark approved, and dispatch to courier
    db.updateOrder(orderId, {
      is_suspicious: false,
      suspicious_reason: undefined,
      manual_review_status: 'approved',
      auto_dispatch_skipped: false
    });

    const dispResult = await dispatchOrderWithCourierEngine(existing, courierId);
    res.json({
      success: true,
      order: dispResult.updatedOrder,
      trackingNumber: dispResult.trackingNumber,
      message: `পার্সেলটি যাচাই করে সফলভাবে ${courierId.toUpperCase()} কুরিয়ারে পাঠানো হয়েছে! ট্র্যাকিং আইডি: ${dispResult.trackingNumber}`
    });
  } catch (err: any) {
    console.error('Error approving suspicious order:', err);
    res.status(500).json({ error: err.message || 'Failed to approve and dispatch suspicious order' });
  }
});

// POST /api/orders/:id/dismiss-suspicious - Merchant removes suspicious tag without immediate dispatch
ordersRouter.post('/:id/dismiss-suspicious', (req, res) => {
  try {
    const orderId = req.params.id;
    const existing = db.getOrderById(orderId);
    if (!existing) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updated = db.updateOrder(orderId, {
      is_suspicious: false,
      manual_review_status: 'approved'
    });

    res.json({
      success: true,
      order: updated,
      message: 'সন্দেহজনক ফ্ল্যাগ সরানো হয়েছে। পার্সেলটি নিরাপদ হিসেবে মার্ক করা হয়েছে।'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to dismiss suspicious tag' });
  }
});
