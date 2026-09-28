/**
 * WhatsApp reminders are sent manually from the invoice screen using wa.me.
 * WhatsApp does not provide a free, unofficial server-side API for sending
 * messages, so this app deliberately does not send them from the worker.
 */
export function isWhatsAppConfigured() {
  return false;
}

export async function sendWhatsApp() {
  return { sent: false, reason: 'manual_only' };
}
