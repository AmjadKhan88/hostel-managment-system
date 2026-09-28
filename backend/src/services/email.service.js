import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!env.SMTP_HOST) return null;

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined,
  });
  return transporter;
}

/**
 * Sends an email if SMTP is configured; otherwise logs and returns
 * { sent: false } without throwing — a missing email provider should
 * never break the automation job that's calling this.
 */
export async function sendEmail({ to, subject, text, html }) {
  const t = getTransporter();
  if (!t) {
    logger.warn('Email not configured (SMTP_HOST missing) — skipping send');
    return { sent: false, reason: 'not_configured' };
  }
  if (!to) {
    return { sent: false, reason: 'no_recipient' };
  }

  try {
    await t.sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      to,
      subject,
      text,
      html: html ?? text,
    });
    return { sent: true };
  } catch (err) {
    logger.error({ err, to }, 'Failed to send email');
    return { sent: false, reason: 'send_failed' };
  }
}
