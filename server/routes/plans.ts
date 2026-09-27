import { Router, Request, Response } from 'express';
import { db, Plan } from '../db/database.js';
import { getAuthenticatedUser } from './auth.js';

export const plansRouter = Router();

// GET /api/plans - Public (powers landing page and billing page dynamically)
plansRouter.get('/', (req: Request, res: Response) => {
  const includeInactive = req.query.all === 'true';
  const plans = includeInactive ? db.getPlans() : db.getActivePlans();
  return res.json(plans);
});

// GET /api/plans/:id
plansRouter.get('/:id', (req: Request, res: Response) => {
  const plan = db.getPlanById(req.params.id);
  if (!plan) {
    return res.status(404).json({ error: 'Plan not found' });
  }
  return res.json(plan);
});

// POST /api/plans - Admin only
plansRouter.post('/', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  const { name, price, currency, duration_days, trial_days, is_active, features, feature_config } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ error: 'Name and price are required' });
  }

  const id = `plan_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString(36)}`;
  const newPlan: Plan = {
    id,
    name: name.trim(),
    price: Number(price),
    currency: currency || 'BDT',
    duration_days: Number(duration_days) || 30,
    trial_days: Number(trial_days) || 2,
    is_active: is_active !== undefined ? Boolean(is_active) : true,
    features: Array.isArray(features) ? features : [],
    feature_config: feature_config || {
      website_stores: false,
      call_requests: true,
      vip_broadcast: true,
      courier_dispatch: true,
      csv_export: true,
      max_channels: 2
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const created = db.createPlan(newPlan);
  return res.status(201).json(created);
});

// PUT /api/plans/:id - Admin only
plansRouter.put('/:id', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  const { name, price, currency, duration_days, trial_days, is_active, features, feature_config } = req.body;
  const updates: Partial<Plan> = {};

  if (name !== undefined) updates.name = name.trim();
  if (price !== undefined) updates.price = Number(price);
  if (currency !== undefined) updates.currency = currency;
  if (duration_days !== undefined) updates.duration_days = Number(duration_days);
  if (trial_days !== undefined) updates.trial_days = Number(trial_days);
  if (is_active !== undefined) updates.is_active = Boolean(is_active);
  if (features !== undefined) updates.features = Array.isArray(features) ? features : [];
  if (feature_config !== undefined) updates.feature_config = feature_config;

  const updated = db.updatePlan(req.params.id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'Plan not found' });
  }

  return res.json(updated);
});

// DELETE /api/plans/:id - Admin only
plansRouter.delete('/:id', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  const success = db.deletePlan(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Plan not found' });
  }

  return res.json({ success: true, message: 'Plan deleted successfully' });
});
