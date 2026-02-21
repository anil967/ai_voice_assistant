import nodemailer from 'nodemailer';
import logger from './logger.js';

const createTransporter = () => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        logger.warn('📧 SMTP credentials not configured. Email sending is disabled.');
        return null;
    }
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

const buildFollowUpHTML = (collegeName, summary) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Inter', Arial, sans-serif; background: #f5f7ff; margin: 0; padding: 40px 0; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 40px rgba(99,102,241,0.08); }
    .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 48px 40px; text-align: center; }
    .header h1 { color: #fff; font-size: 28px; margin: 0 0 8px; font-weight: 800; }
    .header p { color: rgba(255,255,255,0.8); font-size: 14px; margin: 0; }
    .body { padding: 48px 40px; }
    .body h2 { color: #1e1b4b; font-size: 22px; margin-top: 0; }
    .summary-box { background: #f5f3ff; border-left: 4px solid #4f46e5; border-radius: 12px; padding: 20px 24px; margin: 24px 0; color: #4c1d95; font-size: 15px; line-height: 1.6; }
    .cta { text-align: center; margin: 32px 0; }
    .cta a { background: #4f46e5; color: #fff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 700; font-size: 16px; display: inline-block; }
    .footer { background: #f5f7ff; padding: 24px 40px; text-align: center; color: #9ca3af; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 ${collegeName}</h1>
      <p>Thank you for your enquiry!</p>
    </div>
    <div class="body">
      <h2>Hi there! 👋</h2>
      <p>Thank you for calling our AI admissions assistant. Here's a brief summary of your conversation:</p>
      <div class="summary-box">
        ${summary || 'You asked about our programs and admissions process.'}
      </div>
      <p>Our admissions team will follow up with you shortly. In the meantime, feel free to explore our website for more information.</p>
      <div class="cta">
        <a href="#">View All Courses & Fees</a>
      </div>
    </div>
    <div class="footer">
      <p>© 2026 ${collegeName}. All rights reserved.</p>
      <p>This email was sent because you called our AI admissions assistant.</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Send a post-call follow-up email to the caller.
 * @param {string} to - Caller's email
 * @param {string} collegeName - Name of the college
 * @param {string} summary - AI-generated call summary
 */
export const sendFollowUpEmail = async (to, collegeName, summary) => {
    const transporter = createTransporter();
    if (!transporter) return false;

    try {
        const info = await transporter.sendMail({
            from: `"${collegeName} Admissions" <${process.env.SMTP_USER}>`,
            to,
            subject: `Thanks for your enquiry — ${collegeName}`,
            html: buildFollowUpHTML(collegeName, summary),
        });
        logger.info(`📧 Follow-up email sent: ${info.messageId}`);
        return true;
    } catch (err) {
        logger.error(`📧 Email send failed: ${err.message}`);
        return false;
    }
};
