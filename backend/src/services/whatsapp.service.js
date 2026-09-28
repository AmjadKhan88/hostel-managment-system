import twilio from 'twilio';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

let client = null;

export function isWhatsAppConfigured() {
  return Boolean(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_WHATSAPP_FROM);
}

function getClient() {
  if (client) return client;
  if (!isWhatsAppConfigured()) return null;

  client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
  return client;
}

function toWhatsAppAddress(phone) {
  if (!phone) return null;
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return cleaned.startsWith('whatsapp:') ? cleaned : `whatsapp:${cleaned}`;
}

/**
 * Sends a WhatsApp message via Twilio if configured; otherwise returns
 * { sent: false } without throwing — same non-breaking contract as sendEmail.
 */
export async function sendWhatsApp({ to, body }) {
  const c = getClient();
  if (!c) {
    logger.warn('WhatsApp not configured (Twilio credentials or sender missing) — skipping send');
    return { sent: false, reason: 'not_configured' };
  }

  const toAddress = toWhatsAppAddress(to);
  if (!toAddress) {
    return { sent: false, reason: 'no_recipient' };
  }

  try {
    await c.messages.create({ from: env.TWILIO_WHATSAPP_FROM, to: toAddress, body });
    return { sent: true };
  } catch (err) {
    logger.error({ err }, 'Failed to send WhatsApp message');
    return { sent: false, reason: 'send_failed', error: err.message };
  }
}
