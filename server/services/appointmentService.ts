import { db, Appointment, AppointmentBookingSettings } from '../db/database.js';
import { GoogleGenAI } from '@google/genai';

function getGeminiClient(userId?: string): GoogleGenAI {
  const userProfile = userId ? db.getProfileById(userId) : undefined;
  const sysSettings = db.getSettings() as any;
  const adminKey = db
    .getProfiles()
    .find((p) => p.role === 'admin' && p.llm_api_key?.trim())
    ?.llm_api_key?.trim();
  const apiKey =
    (userProfile?.llm_api_key && userProfile.llm_api_key.trim()) ||
    (sysSettings?.default_llm_api_key && sysSettings.default_llm_api_key.trim()) ||
    adminKey ||
    process.env.GEMINI_API_KEY ||
    '';
  return new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });
}

export function getTodayDateStr(offsetDays = 0): string {
  const d = new Date(Date.now() + offsetDays * 86400000);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDayName(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  if (isNaN(d.getTime())) return 'Monday';
  return d.toLocaleDateString('en-US', { weekday: 'long' });
}

export function normalizeSlotLabel(rawTime: string): string {
  if (!rawTime) return '11:00 AM';
  const clean = rawTime
    .replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d)))
    .trim();

  // Direct match if already formatted like "04:00 PM" or "10:30 AM"
  const ampmMatch = clean.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
  if (ampmMatch) {
    let hr = parseInt(ampmMatch[1], 10);
    const min = ampmMatch[2] || '00';
    const mer = ampmMatch[3].toUpperCase();
    if (hr === 0) hr = 12;
    if (hr > 12) hr = hr - 12;
    return `${String(hr).padStart(2, '0')}:${min} ${mer}`;
  }

  // Bangla / Banglish time indicators
  const lower = clean.toLowerCase();
  const numMatch = clean.match(/(\d{1,2})(?::(\d{2}))?/);
  if (numMatch) {
    let hr = parseInt(numMatch[1], 10);
    const min = numMatch[2] || '00';
    let mer = 'AM';
    if (
      lower.includes('বিকাল') ||
      lower.includes('বিকেল') ||
      lower.includes('সন্ধ্যা') ||
      lower.includes('রাত') ||
      lower.includes('দুপুর') ||
      lower.includes('bikal') ||
      lower.includes('bikel') ||
      lower.includes('sondha') ||
      lower.includes('raat') ||
      lower.includes('dupur') ||
      (hr >= 1 && hr <= 8 && !lower.includes('সকাল') && !lower.includes('sokal'))
    ) {
      mer = 'PM';
    }
    if (hr >= 13 && hr <= 23) {
      hr = hr - 12;
      mer = 'PM';
    }
    if (hr === 12) mer = 'PM';
    return `${String(hr).padStart(2, '0')}:${min} ${mer}`;
  }

  return '11:00 AM';
}

export interface SlotAvailabilityResult {
  date: string;
  dayOfWeek: string;
  isDayOpen: boolean;
  allSlots: string[];
  bookedSlots: string[];
  availableSlots: string[];
  appointmentsOnDate: Appointment[];
}

export function getSlotAvailability(userId: string, dateStr?: string): SlotAvailabilityResult {
  const targetDate = dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? dateStr : getTodayDateStr(0);
  const settings: AppointmentBookingSettings = db.getAppointmentSettings(userId);
  const dayOfWeek = getDayName(targetDate);
  const isDayOpen = settings.available_days.some((d) => d.toLowerCase() === dayOfWeek.toLowerCase());

  const allAppointments = db.getAppointments(userId);
  const appointmentsOnDate = allAppointments.filter(
    (a) => a.appointment_date === targetDate && a.status !== 'cancelled'
  );

  const bookedSlots = appointmentsOnDate.map((a) => normalizeSlotLabel(a.appointment_time));
  const normalizedConfiguredSlots = (settings.available_slots || []).map((s) => normalizeSlotLabel(s));
  const availableSlots = isDayOpen
    ? normalizedConfiguredSlots.filter((slot) => !bookedSlots.includes(slot))
    : [];

  return {
    date: targetDate,
    dayOfWeek,
    isDayOpen,
    allSlots: normalizedConfiguredSlots,
    bookedSlots,
    availableSlots,
    appointmentsOnDate
  };
}

export function hasAppointmentIntent(text: string): boolean {
  if (!text) return false;
  const q = text.toLowerCase();
  const keywords = [
    'appointment',
    'book',
    'booking',
    'schedule',
    'slot',
    'time slot',
    'meeting',
    'consult',
    'consultation',
    'visit',
    'chamber',
    'serial',
    'doctor',
    'parlor',
    'salon',
    'reservation',
    'reserve',
    'calendar',
    'অ্যাপয়েন্টমেন্ট',
    'অ্যাপয়েন্টমেন্ট',
    'বুকিং',
    'বুক করতে',
    'সিরিয়াল',
    'সিরিয়াল',
    'চেম্বার',
    'মিটিং',
    'শিডিউল',
    'স্লট',
    'ডাক্তার',
    'সাক্ষাৎ',
    'দেখাতে চাই',
    'সময় খালি',
    'কখন আসব',
    'কখন আসতে পারি'
  ];
  return keywords.some((kw) => q.includes(kw));
}

export function buildAppointmentAIContext(userId: string, incomingMessage: string): string {
  const settings = db.getAppointmentSettings(userId);
  if (!settings.enabled) return '';

  const todaySlotInfo = getSlotAvailability(userId, getTodayDateStr(0));
  const tomorrowSlotInfo = getSlotAvailability(userId, getTodayDateStr(1));
  const isAskingBooking = hasAppointmentIntent(incomingMessage);

  return `
[AI APPOINTMENT & CALENDAR BOOKING AUTOMATION — LIVE SCHEDULE]:
- Booking Status: Active (${settings.business_type})
- Services Available for Booking: ${(settings.services_offered || []).join(', ')}
- Location / Meeting Mode: ${settings.location_address}
- Slot Duration: ${settings.slot_duration_minutes} minutes (${settings.start_time} - ${settings.end_time})
- Open Days: ${(settings.available_days || []).join(', ')}
- Today (${todaySlotInfo.date}, ${todaySlotInfo.dayOfWeek}) Open Slots: ${
    todaySlotInfo.availableSlots.length > 0
      ? todaySlotInfo.availableSlots.join(', ')
      : 'No open slots left today'
  }${todaySlotInfo.bookedSlots.length > 0 ? ` [Already Booked Today: ${todaySlotInfo.bookedSlots.join(', ')}]` : ''}
- Tomorrow (${tomorrowSlotInfo.date}, ${tomorrowSlotInfo.dayOfWeek}) Open Slots: ${
    tomorrowSlotInfo.availableSlots.length > 0
      ? tomorrowSlotInfo.availableSlots.join(', ')
      : 'Closed / Full tomorrow'
  }${tomorrowSlotInfo.bookedSlots.length > 0 ? ` [Already Booked Tomorrow: ${tomorrowSlotInfo.bookedSlots.join(', ')}]` : ''}
${
  isAskingBooking
    ? `CRITICAL BOOKING DIRECTIVE: The customer is asking about booking an appointment, schedule, or slot!
1. Check the Live Schedule above. NEVER confirm a slot that is listed in [Already Booked]. If they ask for a booked slot, politely inform them it is already booked and suggest 2-3 open slots from the list above.
2. To confirm a booking, make sure you have their: (a) Name, (b) 11-digit Mobile Number, (c) Service/Topic, and (d) Preferred Date & Time Slot.
3. Once they provide their phone number and preferred open time slot, confirm the appointment warmly and mention that it has been added to our schedule & Google Calendar!`
    : `If the customer asks to book an appointment, consultation, meeting, or service slot, offer the open slots above and collect their Name, 11-digit Phone Number, and preferred Date & Time.`
}`;
}

export function extractDateFromMessage(text: string): string {
  const clean = (text || '')
    .replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d)))
    .toLowerCase();

  // Explicit YYYY-MM-DD
  const isoMatch = clean.match(/(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) return isoMatch[1];

  // Day after tomorrow (পরশু / porshu)
  if (clean.includes('পরশু') || clean.includes('porshu') || clean.includes('day after tomorrow')) {
    return getTodayDateStr(2);
  }

  // Tomorrow (আগামীকাল / কাল / ফাল / tomorrow / kal / agamikal)
  if (
    clean.includes('আগামীকাল') ||
    clean.includes('কালকে') ||
    clean.includes('কাল ') ||
    clean.includes('tomorrow') ||
    clean.includes('agamikal') ||
    clean.includes('kalke')
  ) {
    return getTodayDateStr(1);
  }

  // Today (আজকে / আজ / today / ajke)
  if (clean.includes('আজকে') || clean.includes('আজ ') || clean.includes('today') || clean.includes('ajke')) {
    return getTodayDateStr(0);
  }

  return getTodayDateStr(1); // Default to tomorrow if scheduling without explicit date
}

export function extractTimeSlotFromMessage(text: string, availableSlots: string[]): string | null {
  const normalizedInput = (text || '').replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d)));

  // Look for explicit time mention like "4pm", "4:00 pm", "11am", "বিকেল ৪টা", "সকাল ১১টা", "সন্ধ্যা ৬টা"
  const timeRegex =
    /(?:সকাল|দুপুর|বিকাল|বিকেল|সন্ধ্যা|রাত|sokal|dupur|bikal|bikel|sondha|raat)?\s*(\d{1,2})(?::(\d{2}))?\s*(?:টা|টায়|টায়|am|pm|টা বাজে)?/i;

  const ampmExplicit = normalizedInput.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
  if (ampmExplicit) {
    return normalizeSlotLabel(ampmExplicit[0]);
  }

  const banglaTimeMatch = normalizedInput.match(
    /(?:সকাল|দুপুর|বিকাল|বিকেল|সন্ধ্যা|রাত|sokal|dupur|bikal|bikel|sondha|raat)\s*(\d{1,2})(?::(\d{2}))?/i
  );
  if (banglaTimeMatch) {
    return normalizeSlotLabel(banglaTimeMatch[0]);
  }

  const taMatch = normalizedInput.match(/(\d{1,2})\s*(?:টা|টায়|টায়|ta|tay)/i);
  if (taMatch) {
    return normalizeSlotLabel(taMatch[0]);
  }

  void timeRegex;
  return availableSlots.length > 0 ? availableSlots[0] : '11:00 AM';
}

export interface DetectAppointmentParams {
  userId: string;
  customerId: string;
  customerName?: string;
  platform: 'whatsapp' | 'messenger' | 'instagram' | 'tiktok' | 'website';
  channelId?: string;
  messageText: string;
  recentHistory?: string;
  aiReplyText?: string;
}

export async function detectAndRecordAppointment(
  params: DetectAppointmentParams
): Promise<Appointment | null> {
  const {
    userId,
    customerId,
    customerName,
    platform,
    channelId,
    messageText,
    recentHistory,
    aiReplyText
  } = params;

  const settings = db.getAppointmentSettings(userId);
  if (!settings.enabled) return null;

  const combinedText = `${messageText} ${recentHistory || ''} ${aiReplyText || ''}`;
  if (!hasAppointmentIntent(combinedText)) {
    return null;
  }

  const normalizedMsg = (messageText || '').replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d)));
  const normalizedHistory = (recentHistory || '').replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d)));

  const phoneMatch =
    normalizedMsg.match(/(?:\+?8801|01)[3-9]\d{8}/) ||
    normalizedHistory.match(/(?:\+?8801|01)[3-9]\d{8}/) ||
    (customerId.match(/(?:\+?8801|01)[3-9]\d{8}/) ? [customerId] : null);

  const extractedPhone = phoneMatch ? phoneMatch[0] : '';

  // Must have either a phone number or explicit slot confirmation signal in current message
  const hasTimeMention =
    /(\d{1,2})\s*(?::\d{2})?\s*(?:am|pm|টা|টায়|টায়|ta|tay)/i.test(normalizedMsg) ||
    /(?:সকাল|দুপুর|বিকাল|বিকেল|সন্ধ্যা|রাত)\s*\d{1,2}/i.test(normalizedMsg);

  if (!extractedPhone && !hasTimeMention) {
    return null;
  }

  let extractedData: {
    is_booking: boolean;
    customer_name?: string;
    customer_phone?: string;
    service_name?: string;
    appointment_date?: string;
    appointment_time?: string;
    notes?: string;
  } | null = null;

  try {
    const ai = getGeminiClient(userId);
    const todayStr = getTodayDateStr(0);
    const tomorrowStr = getTodayDateStr(1);

    const prompt = `You are an AI Appointment Booking Extractor for "${settings.business_type}".
Today's Date: ${todayStr} (${getDayName(todayStr)})
Tomorrow's Date: ${tomorrowStr} (${getDayName(tomorrowStr)})
Available Services: ${(settings.services_offered || []).join(', ')}
Configured Time Slots: ${(settings.available_slots || []).join(', ')}

Customer Message: "${messageText}"
Recent Conversation:
${recentHistory || '(none)'}
Assistant Reply: "${aiReplyText || ''}"

Determine if the customer is confirming or requesting a specific appointment booking (with a time/date or contact info).
If YES, respond ONLY with valid JSON:
{
  "is_booking": true,
  "customer_name": "<Customer name if mentioned, else '${customerName || 'Valued Client'}'>",
  "customer_phone": "<11-digit BD phone number if available, else '${extractedPhone || 'Pending in chat'}'>",
  "service_name": "<Matched service from Available Services or topic mentioned>",
  "appointment_date": "<YYYY-MM-DD, e.g. ${todayStr} or ${tomorrowStr}>",
  "appointment_time": "<Formatted slot like '04:00 PM' or '11:00 AM'>",
  "notes": "<Brief summary of customer request>"
}
If the customer is ONLY asking a general question without choosing a slot or providing booking details, return:
{"is_booking": false}`;

    for (const modelName of ['gemini-2.5-flash', 'gemini-3.8-flash', 'gemini-2.5-flash-lite']) {
      try {
        const res = await ai.models.generateContent({
          model: modelName,
          contents: prompt
        });
        if (res.text?.trim()) {
          const cleanJson = res.text.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanJson);
          if (parsed && typeof parsed.is_booking === 'boolean') {
            extractedData = parsed;
            break;
          }
        }
      } catch {
        // fallback to next model or heuristic
      }
    }
  } catch (err) {
    console.warn('[Appointment Detection] Gemini extraction fallback to heuristic:', err);
  }

  if (!extractedData || !extractedData.is_booking) {
    // Heuristic fallback when customer message clearly contains phone + time/booking intent
    if (extractedPhone && (hasTimeMention || hasAppointmentIntent(messageText))) {
      const targetDate = extractDateFromMessage(`${messageText} ${recentHistory || ''}`);
      const slotInfo = getSlotAvailability(userId, targetDate);
      const targetSlot =
        extractTimeSlotFromMessage(`${messageText} ${recentHistory || ''}`, slotInfo.availableSlots) ||
        '04:00 PM';

      const matchedService =
        (settings.services_offered || []).find((s) =>
          combinedText.toLowerCase().includes(s.toLowerCase())
        ) ||
        settings.services_offered?.[0] ||
        'General Consultation';

      extractedData = {
        is_booking: true,
        customer_name: customerName || 'Valued Client',
        customer_phone: extractedPhone,
        service_name: matchedService,
        appointment_date: targetDate,
        appointment_time: targetSlot,
        notes: `Booked via ${platform} AI conversation`
      };
    } else {
      return null;
    }
  }

  const finalDate =
    extractedData.appointment_date && /^\d{4}-\d{2}-\d{2}$/.test(extractedData.appointment_date)
      ? extractedData.appointment_date
      : extractDateFromMessage(`${messageText} ${recentHistory || ''}`);

  const finalTime = normalizeSlotLabel(extractedData.appointment_time || '04:00 PM');

  // Check if this customer already booked this exact date & time recently to avoid duplicates
  const existingUserAppointments = db.getAppointments(userId);
  const duplicate = existingUserAppointments.find(
    (a) =>
      a.customer_id === customerId &&
      a.appointment_date === finalDate &&
      normalizeSlotLabel(a.appointment_time) === finalTime &&
      a.status !== 'cancelled'
  );
  if (duplicate) {
    return duplicate;
  }

  // Check if another customer already booked this exact slot on finalDate
  const slotConflict = existingUserAppointments.find(
    (a) =>
      a.appointment_date === finalDate &&
      normalizeSlotLabel(a.appointment_time) === finalTime &&
      a.status !== 'cancelled'
  );

  let assignedTime = finalTime;
  let conflictNote = '';
  if (slotConflict) {
    const availability = getSlotAvailability(userId, finalDate);
    if (availability.availableSlots.length > 0) {
      assignedTime = availability.availableSlots[0];
      conflictNote = ` (Requested ${finalTime} was full; auto-assigned nearest open slot ${assignedTime})`;
    }
  }

  const newAppointment: Appointment = {
    id: `apt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    user_id: userId,
    customer_id: customerId,
    customer_name: extractedData.customer_name || customerName || 'Valued Client',
    customer_phone: extractedData.customer_phone || extractedPhone || 'Pending in chat',
    platform,
    channel_id: channelId,
    service_name:
      extractedData.service_name || settings.services_offered?.[0] || 'General Consultation',
    appointment_date: finalDate,
    appointment_time: assignedTime,
    duration_minutes: settings.slot_duration_minutes || 30,
    status: settings.auto_confirm_booking ? 'confirmed' : 'pending',
    booking_source: platform === 'website' ? 'website' : 'ai_chat',
    location: settings.location_address || 'Main Office / Online Session',
    google_calendar_synced: Boolean(settings.google_calendar_auto_sync),
    notes: `${extractedData.notes || `Auto-booked by AI via ${platform}`}${conflictNote}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  return db.createAppointment(newAppointment);
}

function parseDateTimeToUTC(dateStr: string, timeStr: string, durationMinutes: number): {
  startFormatted: string;
  endFormatted: string;
} {
  const norm = normalizeSlotLabel(timeStr);
  const match = norm.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  let hours = 11;
  let minutes = 0;
  if (match) {
    hours = parseInt(match[1], 10);
    minutes = parseInt(match[2], 10);
    const mer = match[3].toUpperCase();
    if (mer === 'PM' && hours < 12) hours += 12;
    if (mer === 'AM' && hours === 12) hours = 0;
  }

  const [yr, mo, da] = dateStr.split('-').map((n) => parseInt(n, 10));
  // Treat merchant local time as Asia/Dhaka (UTC+6)
  const startUtcMs = Date.UTC(yr || 2026, (mo || 1) - 1, da || 1, hours - 6, minutes, 0);
  const endUtcMs = startUtcMs + (durationMinutes || 30) * 60 * 1000;

  const formatGCalDate = (ms: number) => {
    const d = new Date(ms);
    return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  return {
    startFormatted: formatGCalDate(startUtcMs),
    endFormatted: formatGCalDate(endUtcMs)
  };
}

export function buildGoogleCalendarUrl(appointment: Appointment, businessName = 'One Agent BD'): string {
  const { startFormatted, endFormatted } = parseDateTimeToUTC(
    appointment.appointment_date,
    appointment.appointment_time,
    appointment.duration_minutes || 30
  );

  const title = `${appointment.service_name} — ${appointment.customer_name} (${appointment.customer_phone})`;
  const details = [
    `Client Name: ${appointment.customer_name}`,
    `Phone: ${appointment.customer_phone}`,
    `Service: ${appointment.service_name}`,
    `Channel: ${appointment.platform.toUpperCase()}`,
    `Status: ${appointment.status.toUpperCase()}`,
    appointment.notes ? `Notes: ${appointment.notes}` : '',
    `Managed by ${businessName} AI Booking Engine`
  ]
    .filter(Boolean)
    .join('\n');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startFormatted}/${endFormatted}`,
    details,
    location: appointment.location || 'Online / Office Branch'
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function generateICalFeed(
  appointments: Appointment[],
  businessName = 'One Agent BD'
): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${businessName}//AI Appointment & Booking Sync//EN`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${businessName} — AI Bookings`,
    'X-WR-TIMEZONE:Asia/Dhaka'
  ];

  for (const apt of appointments) {
    if (apt.status === 'cancelled') continue;
    const { startFormatted, endFormatted } = parseDateTimeToUTC(
      apt.appointment_date,
      apt.appointment_time,
      apt.duration_minutes || 30
    );
    const uid = `${apt.id}@oneagentbd.online`;
    const summary = `${apt.service_name} - ${apt.customer_name} (${apt.customer_phone})`.replace(/[,;\\]/g, ' ');
    const description = `Client: ${apt.customer_name}\\nPhone: ${apt.customer_phone}\\nChannel: ${apt.platform}\\nStatus: ${apt.status}\\nNotes: ${(apt.notes || '').replace(/\r?\n/g, ' ')}`;
    const location = (apt.location || 'Office / Online').replace(/[,;\\]/g, ' ');

    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${startFormatted}`,
      `DTSTART:${startFormatted}`,
      `DTEND:${endFormatted}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      `STATUS:${apt.status === 'confirmed' ? 'CONFIRMED' : 'TENTATIVE'}`,
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
