import { Router, Request, Response } from 'express';
import { db, Agent } from '../db/database.js';
import { getAuthenticatedUser } from './auth.js';
import { getUserSubscriptionStatus } from '../services/subscriptionService.js';
import { GoogleGenAI } from '@google/genai';

export const agentsRouter = Router();

// Helper to determine maximum allowed agents based on subscription
function getMaxAgentsForUser(userId: string): { max: number; planName: string; isPro: boolean } {
  const user = db.getProfileById(userId);
  if (user?.role === 'admin') {
    return { max: 20, planName: 'Admin Unlimited', isPro: true };
  }

  const subStatus = getUserSubscriptionStatus(userId);
  const isTrialActive = !subStatus.isExpired && subStatus.subscription?.status === 'trialing';
  const isPro = subStatus.isProPlan || (isTrialActive && subStatus.planId === 'plan_pro');

  if (isPro) {
    return { max: 10, planName: 'Pro Business Plan', isPro: true };
  }

  if (subStatus.planId === 'plan_starter' || (!subStatus.isExpired && !isPro)) {
    return { max: 3, planName: 'Starter AI Plan', isPro: false };
  }

  // Free trial / Basic
  return { max: 1, planName: 'Trial Plan', isPro: false };
}

// GET /api/agents - List all AI agents for authenticated merchant
agentsRouter.get('/', (req: Request, res: Response) => {
  let user = getAuthenticatedUser(req);
  if (!user) {
    user = db.getProfileById('usr_demo_002') || db.getProfiles()[0];
  }
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const agents = db.getAgents(user.id);
  const { max, planName, isPro } = getMaxAgentsForUser(user.id);

  return res.json({
    agents,
    meta: {
      total: agents.length,
      maxAllowed: max,
      planName,
      isPro,
      canCreateMore: agents.length < max
    }
  });
});

// GET /api/agents/:id - Get a specific agent
agentsRouter.get('/:id', (req: Request, res: Response) => {
  const agent = db.getAgentById(req.params.id);
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  return res.json(agent);
});

// POST /api/agents - Create a new AI agent (Multi-business support)
agentsRouter.post('/', (req: Request, res: Response) => {
  let user = getAuthenticatedUser(req);
  if (!user) {
    user = db.getProfileById('usr_demo_002') || db.getProfiles()[0];
  }
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const existingAgents = db.getAgents(user.id);
  const { max, planName, isPro } = getMaxAgentsForUser(user.id);

  if (existingAgents.length >= max) {
    return res.status(403).json({
      error: `Your current ${planName} allows up to ${max} AI Agents. Upgrade to the ${
        !isPro ? 'Pro Business Plan (1,950 BDT/month)' : 'Enterprise Plan'
      } to create up to 10 independent AI Business Agents.`
    });
  }

  const {
    name,
    business_name,
    avatar_url,
    tone,
    language,
    assigned_channels,
    system_prompt,
    knowledge_base,
    delivery_charge_inside_dhaka,
    delivery_charge_outside_dhaka
  } = req.body;

  if (!name || !business_name) {
    return res.status(400).json({ error: 'Agent Name and Business / Brand Name are required.' });
  }

  const agentId = `agent_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const assignedList = Array.isArray(assigned_channels) ? assigned_channels : [];

  const newAgent: Agent = {
    id: agentId,
    user_id: user.id,
    name: String(name).trim(),
    business_name: String(business_name).trim(),
    avatar_url:
      avatar_url ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
    tone: tone || 'sales_closer',
    language: language || 'bangla',
    assigned_channels: assignedList,
    system_prompt:
      String(system_prompt).trim() ||
      `You are the dedicated customer service and sales AI agent for "${business_name}". Reply in polite, natural Bangla, answer product inquiries promptly, and capture customer full name, delivery address, and phone number to finalize orders.`,
    knowledge_base:
      String(knowledge_base).trim() ||
      `Business: ${business_name}\nProducts: Quality items & fast shipping.\nDelivery: Inside Dhaka 60 BDT, Outside Dhaka 120 BDT. Cash on Delivery (COD) available.`,
    delivery_charge_inside_dhaka: Number(delivery_charge_inside_dhaka) || 60,
    delivery_charge_outside_dhaka: Number(delivery_charge_outside_dhaka) || 120,
    is_active: true,
    total_chats: 0,
    total_orders: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const created = db.createAgent(newAgent);

  // Update channels assigned to this agent
  if (assignedList.length > 0) {
    assignedList.forEach((chId) => {
      db.updateChannel(chId, {
        agent_id: created.id,
        agent_name: created.name,
        business_name: created.business_name
      });
    });
  }

  return res.status(201).json({
    success: true,
    agent: created,
    message: `AI Agent "${created.name}" created successfully for ${created.business_name}!`
  });
});

// PUT /api/agents/:id - Update an AI agent
agentsRouter.put('/:id', (req: Request, res: Response) => {
  let user = getAuthenticatedUser(req);
  if (!user) {
    user = db.getProfileById('usr_demo_002') || db.getProfiles()[0];
  }
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const existing = db.getAgentById(req.params.id);
  if (!existing || existing.user_id !== user.id) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  const {
    name,
    business_name,
    avatar_url,
    tone,
    language,
    assigned_channels,
    system_prompt,
    knowledge_base,
    delivery_charge_inside_dhaka,
    delivery_charge_outside_dhaka,
    is_active
  } = req.body;

  const updates: Partial<Agent> = {};
  if (name !== undefined) updates.name = String(name).trim();
  if (business_name !== undefined) updates.business_name = String(business_name).trim();
  if (avatar_url !== undefined) updates.avatar_url = String(avatar_url).trim();
  if (tone !== undefined) updates.tone = tone;
  if (language !== undefined) updates.language = language;
  if (system_prompt !== undefined) updates.system_prompt = String(system_prompt).trim();
  if (knowledge_base !== undefined) updates.knowledge_base = String(knowledge_base).trim();
  if (delivery_charge_inside_dhaka !== undefined) {
    updates.delivery_charge_inside_dhaka = Number(delivery_charge_inside_dhaka);
  }
  if (delivery_charge_outside_dhaka !== undefined) {
    updates.delivery_charge_outside_dhaka = Number(delivery_charge_outside_dhaka);
  }
  if (is_active !== undefined) updates.is_active = Boolean(is_active);

  if (Array.isArray(assigned_channels)) {
    updates.assigned_channels = assigned_channels;
    // Sync with channels
    const userChannels = db.getChannels(user.id);
    userChannels.forEach((ch) => {
      if (assigned_channels.includes(ch.id)) {
        db.updateChannel(ch.id, {
          agent_id: existing.id,
          agent_name: updates.name || existing.name,
          business_name: updates.business_name || existing.business_name
        });
      } else if (ch.agent_id === existing.id) {
        // Unassign from this channel
        db.updateChannel(ch.id, {
          agent_id: undefined,
          agent_name: undefined,
          business_name: undefined
        });
      }
    });
  }

  const updated = db.updateAgent(req.params.id, updates);
  return res.json({
    success: true,
    agent: updated,
    message: 'AI Agent updated successfully.'
  });
});

// DELETE /api/agents/:id - Delete an AI agent
agentsRouter.delete('/:id', (req: Request, res: Response) => {
  let user = getAuthenticatedUser(req);
  if (!user) {
    user = db.getProfileById('usr_demo_002') || db.getProfiles()[0];
  }
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const existingAgents = db.getAgents(user.id);
  if (existingAgents.length <= 1) {
    return res.status(400).json({ error: 'You must have at least one AI Agent active for your business.' });
  }

  const agent = db.getAgentById(req.params.id);
  if (!agent || agent.user_id !== user.id) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  // Unassign channels
  const userChannels = db.getChannels(user.id);
  userChannels.forEach((ch) => {
    if (ch.agent_id === agent.id) {
      db.updateChannel(ch.id, {
        agent_id: undefined,
        agent_name: undefined,
        business_name: undefined
      });
    }
  });

  db.deleteAgent(agent.id);
  return res.json({ success: true, message: `Agent "${agent.name}" removed.` });
});

// POST /api/agents/:id/test - Test playground simulator for an individual agent
agentsRouter.post('/:id/test', async (req: Request, res: Response) => {
  let user = getAuthenticatedUser(req);
  if (!user) {
    user = db.getProfileById('usr_demo_002') || db.getProfiles()[0];
  }
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const agent = db.getAgentById(req.params.id);
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  const { message, chatHistory } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required for agent simulation.' });
  }

  const toneInstruction =
    agent.tone === 'sales_closer'
      ? 'Focus on closing sales quickly, offering COD delivery, and politely asking for Name, Address, and Phone number.'
      : agent.tone === 'friendly'
      ? 'Be extremely warm, polite, welcoming, with friendly emojis.'
      : agent.tone === 'urgent'
      ? 'Mention limited stock, fast 24-48h dispatch, and prompt the buyer to order right now.'
      : 'Maintain a clean, professional corporate executive tone.';

  const languageRule =
    agent.language === 'bangla'
      ? 'Reply in natural, polite Bengali (বাংলা) script.'
      : agent.language === 'english'
      ? 'Reply in clear, professional English.'
      : 'Reply in natural Banglish/Bangla script matching the user style.';

  const systemInstruction = `You are "${agent.name}", the official autonomous Customer Support and Sales AI for "${agent.business_name}".
${toneInstruction}
${languageRule}

BUSINESS KNOWLEDGE BASE:
${agent.knowledge_base}

DELIVERY CHARGES:
Inside Dhaka: ${agent.delivery_charge_inside_dhaka || 60} BDT
Outside Dhaka nationwide: ${agent.delivery_charge_outside_dhaka || 120} BDT

SPECIFIC INSTRUCTIONS:
${agent.system_prompt}

Always keep replies helpful, polite, concise (2-4 sentences or clean bullet points), quote exact prices and delivery terms accurately from knowledge base, and collect order details (Name, Delivery Address, Phone Number) when the customer wants to buy.`;

  try {
    const apiKey = process.env.GEMINI_API_KEY || user.llm_api_key;
    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      const promptText = `Customer message: "${message}"\n\nProvide the agent reply as ${agent.name}:`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptText,
        config: {
          systemInstruction,
          temperature: 0.6
        }
      });

      const reply = response.text || `ধন্যবাদ ${agent.business_name}-এ মেসেজ করার জন্য! আমরা কীভাবে আপনাকে সাহায্য করতে পারি?`;
      return res.json({ reply, agentId: agent.id, agentName: agent.name });
    }
  } catch (err: any) {
    console.warn('[Agent Test Simulator] Gemini error, using fallback:', err?.message || err);
  }

  // Realistic e-commerce sales fallback
  const lowerMsg = message.toLowerCase();
  let fallbackReply = `ধন্যবাদ! আমি ${agent.business_name}-এর এআই সেলস অ্যাসিস্ট্যান্ট ${agent.name} বলছি।`;

  if (lowerMsg.includes('দাম') || lowerMsg.includes('price') || lowerMsg.includes('koto') || lowerMsg.includes('cost')) {
    fallbackReply += ` আমাদের প্রতিটি প্রোডাক্টের সেরা অফার মূল্য ও ডিসকাউন্ট রয়েছে। ডেলিভারি চার্জ ঢাকার ভেতরে ৳${agent.delivery_charge_inside_dhaka || 60} এবং ঢাকার বাইরে ৳${agent.delivery_charge_outside_dhaka || 120}। ক্যাশ অন ডেলিভারিতে অর্ডার করতে আপনার নাম, ঠিকানা ও মোবাইল নম্বর পাঠিয়ে দিন! ❤️`;
  } else if (lowerMsg.includes('order') || lowerMsg.includes('অর্ডার') || lowerMsg.includes('nibo') || lowerMsg.includes('কিনব')) {
    fallbackReply += ` আপনার অর্ডারটি কনফার্ম করতে অনুগ্রহ করে আপনার ১. সম্পূর্ণ নাম, ২. বিস্তারিত ডেলিভারি ঠিকানা এবং ৩. সচল ১১ ডিজিটের ফোন নম্বর দিন। আমাদের এআই সাথে সাথে পার্সেল বুক করে দিবে! 📦`;
  } else if (lowerMsg.includes('delivery') || lowerMsg.includes('চার্জ') || lowerMsg.includes('সময়')) {
    fallbackReply += ` ঢাকার ভেতরে হোম ডেলিভারি ২৪-৪৮ ঘণ্টার মধ্যে (চার্জ ৳${agent.delivery_charge_inside_dhaka || 60}) এবং ঢাকার বাইরে সারা বাংলাদেশে ২-৩ দিনে পৌঁছে যাবে (চার্জ ৳${agent.delivery_charge_outside_dhaka || 120})।`;
  } else {
    fallbackReply += ` আমরা আপনাকে কীভাবে সাহায্য করতে পারি? আমাদের প্রোডাক্ট ও সাইজ সম্পর্কে যেকোনো প্রশ্ন থাকলে নির্দ্বিধায় জানান।`;
  }

  return res.json({ reply: fallbackReply, agentId: agent.id, agentName: agent.name });
});
