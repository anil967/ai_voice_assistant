import twilio from 'twilio';
import logger from './logger.js';

/**
 * Send SMS via Twilio. Requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER in .env
 * @param {string} to - Phone number (E.164 format, e.g. +919777938474)
 * @param {string} body - SMS text (max 1600 chars for multi-part)
 * @returns {Promise<boolean>}
 */
export const sendSMS = async (to, body) => {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_PHONE_NUMBER;

    if (!sid || !token || !from) {
        logger.warn('📱 Twilio not configured. SMS sending is disabled.');
        return false;
    }

    if (!to || !body) {
        logger.warn('📱 SMS skipped: missing recipient or body');
        return false;
    }

    // Normalize to E.164: add + if Indian number (10 digits)
    let normalized = String(to).replace(/\D/g, '');
    if (normalized.length === 10 && normalized.startsWith('9')) {
        normalized = '+91' + normalized;
    } else if (normalized.length === 10 && !normalized.startsWith('+')) {
        normalized = '+91' + normalized;
    } else if (!normalized.startsWith('+') && normalized.length >= 10) {
        normalized = '+' + normalized;
    }

    try {
        const client = twilio(sid, token);
        await client.messages.create({
            body: body.slice(0, 1600),
            from,
            to: normalized,
        });
        logger.info(`📱 SMS sent to ${normalized}`);
        return true;
    } catch (err) {
        logger.error(`📱 SMS failed: ${err.message}`);
        return false;
    }
};
