import { Router, Request, Response } from 'express';
import { db, Appointment, AppointmentBookingSettings } from '../db/database.js';
import { getAuthenticatedUser } from './auth.js';
import {
  getSlotAvailability,
  getTodayDateStr,
  normalizeSlotLabel,
  buildGoogleCalendarUrl,
  generateICalFeed,
  detectAndRecordAppointment
} from '../services/appointmentService.js';
import { generateAIReply } from '../services/aiService.js';

export const appointmentsRouter = Router();

// GET /api/appointments - List all appointments, summary stats & booking settings for current user
appointmentsRouter.get('/', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const appointments = db.getAppointments(user.id);
  const settings = db.getAppointmentSettings(user.id);
  const todayStr = getTodayDateStr(0);

  const enrichedAppointments = appointments.map((apt) => ({
    ...apt,
    google_calendar_url: buildGoogleCalendarUrl(apt, user.full_name || 'One Agent BD')
  }));

  const stats = {
    totalBookings: appointments.length,
    todayBookings: appointments.filter((a) => a.appointment_date === todayStr && a.status !== 'cancelled').length,
    upcomingBookings: appointments.filter((a) => a.appointment_date >= todayStr && a.status === 'confirmed').length,
    aiBookedCount: appointments.filter((a) => a.booking_source === 'ai_chat' || a.booking_source === 'website').length,
    completedCount: appointments.filter((a) => a.status === 'completed').length,
    cancelledCount: appointments.filter((a) => a.status === 'cancelled').length
  };

  return res.json({
    appointments: enrichedAppointments,
    settings,
    stats,
    icalFeedPath: `/api/appointments/ical/${user.id}/calendar.ics`
  });
});

// GET /api/appointments/settings - Get merchant appointment booking settings
appointmentsRouter.get('/settings', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const settings = db.getAppointmentSettings(user.id);
  return res.json({ settings });
});

// PUT /api/appointments/settings - Update merchant appointment booking settings
appointmentsRouter.put('/settings', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const updates: Partial<AppointmentBookingSettings> = req.body || {};
  if (Array.isArray(updates.available_slots)) {
    updates.available_slots = updates.available_slots
      .map((s) => normalizeSlotLabel(String(s)))
      .filter(Boolean);
  }
  if (Array.isArray(updates.services_offered)) {
    updates.services_offered = updates.services_offered
      .map((s) => String(s).trim())
      .filter(Boolean);
  }

  const updated = db.updateAppointmentSettings(user.id, updates);
  return res.json({
    success: true,
    settings: updated,
    message: 'AI Appointment & Calendar settings saved successfully'
  });
});

// GET /api/appointments/slots?date=YYYY-MM-DD - Check open vs booked slots for a given date
appointmentsRouter.get('/slots', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const dateStr = typeof req.query.date === 'string' ? req.query.date : getTodayDateStr(0);
  const availability = getSlotAvailability(user.id, dateStr);
  return res.json(availability);
});

// POST /api/appointments - Manually create an appointment
appointmentsRouter.post('/', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const {
    customer_name,
    customer_phone,
    customer_email,
    platform = 'manual',
    service_name,
    appointment_date,
    appointment_time,
    duration_minutes,
    location,
    notes
  } = req.body || {};

  if (!customer_name || !customer_phone) {
    return res.status(400).json({ error: 'Customer name and phone number are required' });
  }

  const settings = db.getAppointmentSettings(user.id);
  const cleanDate =
    appointment_date && /^\d{4}-\d{2}-\d{2}$/.test(appointment_date)
      ? appointment_date
      : getTodayDateStr(0);
  const cleanTime = normalizeSlotLabel(appointment_time || '11:00 AM');

  const newAppointment: Appointment = {
    id: `apt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    user_id: user.id,
    customer_id: customer_phone.trim(),
    customer_name: customer_name.trim(),
    customer_phone: customer_phone.trim(),
    customer_email: customer_email?.trim(),
    platform,
    service_name: service_name?.trim() || settings.services_offered?.[0] || 'General Consultation',
    appointment_date: cleanDate,
    appointment_time: cleanTime,
    duration_minutes: Number(duration_minutes) || settings.slot_duration_minutes || 30,
    status: 'confirmed',
    booking_source: 'manual',
    location: location?.trim() || settings.location_address || 'Main Office / Online Session',
    google_calendar_synced: true,
    notes: notes?.trim() || 'Scheduled from Merchant Dashboard',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const created = db.createAppointment(newAppointment);
  return res.status(201).json({
    appointment: {
      ...created,
      google_calendar_url: buildGoogleCalendarUrl(created, user.full_name || 'One Agent BD')
    },
    message: 'Appointment scheduled and ready for Google Calendar sync'
  });
});

// PUT /api/appointments/:id - Update appointment status, date/time, or notes
appointmentsRouter.put('/:id', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;
  const existing = db.getAppointmentById(id);
  if (!existing || existing.user_id !== user.id) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  const updates: Partial<Appointment> = {};
  if (req.body.status) updates.status = req.body.status;
  if (req.body.appointment_date) updates.appointment_date = req.body.appointment_date;
  if (req.body.appointment_time) updates.appointment_time = normalizeSlotLabel(req.body.appointment_time);
  if (req.body.service_name) updates.service_name = req.body.service_name;
  if (req.body.customer_name) updates.customer_name = req.body.customer_name;
  if (req.body.customer_phone) updates.customer_phone = req.body.customer_phone;
  if (req.body.location !== undefined) updates.location = req.body.location;
  if (req.body.notes !== undefined) updates.notes = req.body.notes;
  if (req.body.google_calendar_synced !== undefined) {
    updates.google_calendar_synced = Boolean(req.body.google_calendar_synced);
  }

  const updated = db.updateAppointment(id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'Failed to update appointment' });
  }

  return res.json({
    appointment: {
      ...updated,
      google_calendar_url: buildGoogleCalendarUrl(updated, user.full_name || 'One Agent BD')
    },
    message: 'Appointment updated successfully'
  });
});

// DELETE /api/appointments/:id - Delete an appointment
appointmentsRouter.delete('/:id', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;
  const existing = db.getAppointmentById(id);
  if (!existing || existing.user_id !== user.id) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  db.deleteAppointment(id);
  return res.json({ success: true, message: 'Appointment removed from calendar' });
});

// POST /api/appointments/simulate-ai - Interactive AI Booking Simulator for testing conversational slot booking
appointmentsRouter.post('/simulate-ai', async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const {
    customerName = 'Tanvir Hasan',
    customerPhone = '01712345678',
    platform = 'messenger',
    messageText = 'আগামীকাল বিকেল ৪টায় কনসালটেশন অ্যাপয়েন্টমেন্ট বুক করতে চাই। আমার নাম তানভীর, নাম্বার 01712345678'
  } = req.body || {};

  try {
    const aiResult = await generateAIReply({
      userId: user.id,
      incomingMessage: messageText,
      customerId: customerPhone || `sim_${Date.now()}`,
      customerName,
      platform: platform === 'whatsapp' || platform === 'instagram' ? platform : 'messenger',
      channelName: user.full_name || 'One Agent BD'
    });

    const bookedAppointment = await detectAndRecordAppointment({
      userId: user.id,
      customerId: customerPhone || `sim_${Date.now()}`,
      customerName,
      platform: platform || 'messenger',
      messageText,
      aiReplyText: aiResult.replyText
    });

    return res.json({
      success: true,
      aiReply: aiResult.replyText,
      bookedAppointment: bookedAppointment
        ? {
            ...bookedAppointment,
            google_calendar_url: buildGoogleCalendarUrl(bookedAppointment, user.full_name || 'One Agent BD')
          }
        : null
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Simulation error' });
  }
});

// GET /api/appointments/ical/:userId/calendar.ics - Public iCal Subscription Feed for Google Calendar / Apple / Outlook
appointmentsRouter.get('/ical/:userId/calendar.ics', (req: Request, res: Response) => {
  const { userId } = req.params;
  const profile = db.getProfileById(userId);
  const appointments = db.getAppointments(userId);
  const icsContent = generateICalFeed(appointments, profile?.full_name || 'One Agent BD');

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="oneagentbd-appointments.ics"');
  return res.send(icsContent);
});
