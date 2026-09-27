import { Router, Request, Response } from 'express';
import { db, CallRequest, Order } from '../db/database.js';
import { getAuthenticatedUser } from './auth.js';

export const callRequestsRouter = Router();

// GET /api/call-requests - List call requests for current user
callRequestsRouter.get('/', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const requests = db.getCallRequests(user.id);

  const stats = {
    totalRequests: requests.length,
    pendingRequests: requests.filter((r) => r.status === 'pending').length,
    calledRequests: requests.filter((r) => r.status === 'called').length,
    convertedRequests: requests.filter((r) => r.status === 'converted_to_order').length
  };

  return res.json({
    requests,
    stats
  });
});

// POST /api/call-requests - Manually or programmatically log a call request
callRequestsRouter.post('/', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { customer_name, customer_phone, customer_id, platform = 'whatsapp', message_excerpt, notes } = req.body;

  if (!customer_phone || !customer_phone.trim()) {
    return res.status(400).json({ error: 'Customer phone number is required' });
  }

  const newRequest: CallRequest = {
    id: `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    user_id: user.id,
    customer_name: customer_name?.trim() || 'Valued Customer',
    customer_phone: customer_phone.trim(),
    customer_id: customer_id?.trim() || customer_phone.trim(),
    platform: platform || 'whatsapp',
    message_excerpt: message_excerpt?.trim() || 'Requested phone call with representative',
    status: 'pending',
    notes: notes?.trim() || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.createCallRequest(newRequest);

  return res.status(201).json({
    request: newRequest,
    message: 'Customer call request queued successfully'
  });
});

// PUT /api/call-requests/:id - Update status or notes
callRequestsRouter.put('/:id', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const existing = db.getCallRequestById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Call request not found' });
  }

  if (existing.user_id !== user.id && user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { status, notes } = req.body;
  const updates: Partial<CallRequest> = {};

  if (status) {
    updates.status = status;
  }
  if (typeof notes === 'string') {
    updates.notes = notes;
  }

  const updated = db.updateCallRequest(req.params.id, updates);

  return res.json({
    request: updated,
    message: 'Call request updated successfully'
  });
});

// DELETE /api/call-requests/:id - Delete call request
callRequestsRouter.delete('/:id', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const existing = db.getCallRequestById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Call request not found' });
  }

  if (existing.user_id !== user.id && user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  db.deleteCallRequest(req.params.id);

  return res.json({
    success: true,
    message: 'Call request deleted'
  });
});

// POST /api/call-requests/:id/convert-to-order - Convert call request directly to confirmed order
callRequestsRouter.post('/:id/convert-to-order', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const callReq = db.getCallRequestById(req.params.id);
  if (!callReq) {
    return res.status(404).json({ error: 'Call request not found' });
  }

  if (callReq.user_id !== user.id && user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const {
    items = 'Confirmed over phone call',
    quantity = 1,
    total_amount = 1200,
    customer_address = 'Dhaka, Bangladesh',
    payment_method = 'cod',
    payment_status = 'pending',
    notes = ''
  } = req.body;

  // Create confirmed order
  const newOrder: Order = {
    id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    user_id: user.id,
    customer_id: callReq.customer_id || callReq.customer_phone,
    customer_name: callReq.customer_name,
    customer_phone: callReq.customer_phone,
    customer_address,
    platform: callReq.platform === 'messenger' ? 'messenger' : 'whatsapp',
    items,
    quantity: Number(quantity) || 1,
    total_amount: Number(total_amount) || 0,
    currency: 'BDT',
    payment_method,
    payment_status,
    status: 'confirmed',
    order_source: 'manual',
    is_vip: Number(total_amount) >= 1500,
    notes: `Order confirmed via phone call with customer. Previous note: ${callReq.message_excerpt}. ${notes}`.trim(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.createOrder(newOrder);

  // Update call request to converted
  db.updateCallRequest(req.params.id, {
    status: 'converted_to_order',
    notes: `Converted to Order #${newOrder.id.slice(-6).toUpperCase()} on ${new Date().toLocaleDateString()}`
  });

  return res.status(201).json({
    order: newOrder,
    message: `Order #${newOrder.id.slice(-6).toUpperCase()} created and call marked as converted!`
  });
});

// POST /api/call-requests/simulate - Simulation helper for merchants to test the workflow
callRequestsRouter.post('/simulate', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const sampleNames = [
    { name: 'Tanvir Ahmed', phone: '01712-334455', msg: 'Ami apnader sathe phone a kotha bolte chai, call koren please.', platform: 'whatsapp' as const },
    { name: 'Nusrat Jahan', phone: '01844-998877', msg: 'Delivery ar address confirm korte call dorkar. Ekta human agent kotha boluk.', platform: 'messenger' as const },
    { name: 'Mahbubur Rahman', phone: '01911-223344', msg: 'Bhaiya ami bulk order nibo, apnader helpline theke call diben?', platform: 'whatsapp' as const }
  ];

  const randomSample = sampleNames[Math.floor(Math.random() * sampleNames.length)];

  const simulated: CallRequest = {
    id: `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    user_id: user.id,
    customer_name: randomSample.name,
    customer_phone: randomSample.phone,
    customer_id: randomSample.phone,
    platform: randomSample.platform,
    message_excerpt: randomSample.msg,
    status: 'pending',
    notes: 'Auto-detected by AI when customer requested human assistance in chat',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.createCallRequest(simulated);

  return res.status(201).json({
    request: simulated,
    message: `Simulated call request from ${simulated.customer_name} added to your queue!`
  });
});
