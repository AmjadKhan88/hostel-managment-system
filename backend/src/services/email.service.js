import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

let transporter = null;

export function isEmailConfigured() {
  return Boolean(env.SMTP_HOST);
}

function getTransporter() {
  if (transporter) return transporter;
  if (!isEmailConfigured()) return null;

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined,
  });
  return transporter;
}

/**
 * Sends an email if SMTP is configured; otherwise returns { sent: false }
 * without throwing — a missing provider must never break the calling job.
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
    logger.error({ err }, 'Failed to send email');
    return { sent: false, reason: 'send_failed', error: err.message };
  }
}
