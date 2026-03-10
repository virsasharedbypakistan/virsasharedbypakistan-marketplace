import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@virsasharedbypakistan.com';
const ALERT_EMAIL = process.env.ALERT_EMAIL || 'admin@virsasharedbypakistan.com';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email via Resend
 */
export async function sendEmail(options: EmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      console.error('[Email] Send error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('[Email] Exception:', error);
    return { success: false, error };
  }
}

/**
 * Send system alert email to admin
 */
export async function sendAlertEmail(subject: string, message: string) {
  return sendEmail({
    to: ALERT_EMAIL,
    subject: `🚨 VIRSA ALERT: ${subject}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2 style="color: #dc2626;">System Alert</h2>
        <p><strong>Subject:</strong> ${subject}</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin-top: 15px;">
          ${message}
        </div>
        <p style="margin-top: 20px; color: #6b7280; font-size: 12px;">
          Timestamp: ${new Date().toISOString()}<br>
          Environment: ${process.env.NODE_ENV}
        </p>
      </div>
    `,
    text: `VIRSA ALERT: ${subject}\n\n${message}\n\nTimestamp: ${new Date().toISOString()}`,
  });
}

// ── Email Templates ──────────────────────────────────────────

export function orderPlacedEmail(data: {
  customerName: string;
  orderNumber: string;
  totalAmount: number;
  orderUrl: string;
}) {
  return {
    subject: `Order Confirmation - ${data.orderNumber}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Thank you for your order!</h2>
        <p>Hi ${data.customerName},</p>
        <p>Your order <strong>${data.orderNumber}</strong> has been placed successfully.</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Order Total:</strong> PKR ${data.totalAmount.toFixed(2)}</p>
        </div>
        <p>You can track your order status here:</p>
        <a href="${data.orderUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0;">View Order</a>
        <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
          Thank you for shopping with Virsa!
        </p>
      </div>
    `,
  };
}

export function orderStatusEmail(data: {
  customerName: string;
  orderNumber: string;
  status: string;
  orderUrl: string;
}) {
  return {
    subject: `Order ${data.status} - ${data.orderNumber}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Order Status Update</h2>
        <p>Hi ${data.customerName},</p>
        <p>Your order <strong>${data.orderNumber}</strong> status has been updated to: <strong>${data.status}</strong></p>
        <a href="${data.orderUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0;">View Order</a>
      </div>
    `,
  };
}

export function vendorApprovedEmail(data: {
  vendorName: string;
  storeName: string;
  dashboardUrl: string;
}) {
  return {
    subject: 'Your Vendor Application Has Been Approved!',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Congratulations! 🎉</h2>
        <p>Hi ${data.vendorName},</p>
        <p>Your vendor application for <strong>${data.storeName}</strong> has been approved!</p>
        <p>You can now start adding products and managing your store.</p>
        <a href="${data.dashboardUrl}" style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0;">Go to Dashboard</a>
      </div>
    `,
  };
}

export function vendorRejectedEmail(data: {
  vendorName: string;
  storeName: string;
  reason: string;
}) {
  return {
    subject: 'Vendor Application Update',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Application Status Update</h2>
        <p>Hi ${data.vendorName},</p>
        <p>Unfortunately, your vendor application for <strong>${data.storeName}</strong> has not been approved at this time.</p>
        <div style="background: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <p style="margin: 0;"><strong>Reason:</strong> ${data.reason}</p>
        </div>
        <p>If you have any questions, please contact our support team.</p>
      </div>
    `,
  };
}

export function withdrawalApprovedEmail(data: {
  vendorName: string;
  amount: number;
  referenceNumber: string;
  transactionReference?: string;
}) {
  return {
    subject: `Withdrawal Approved - ${data.referenceNumber}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Withdrawal Approved ✓</h2>
        <p>Hi ${data.vendorName},</p>
        <p>Your withdrawal request <strong>${data.referenceNumber}</strong> has been approved.</p>
        <div style="background: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #16a34a;">
          <p style="margin: 0;"><strong>Amount:</strong> PKR ${data.amount.toFixed(2)}</p>
          ${data.transactionReference ? `<p style="margin: 5px 0 0 0;"><strong>Transaction Reference:</strong> ${data.transactionReference}</p>` : ''}
        </div>
        <p>The funds will be transferred to your registered account shortly.</p>
      </div>
    `,
  };
}

export function withdrawalRejectedEmail(data: {
  vendorName: string;
  amount: number;
  referenceNumber: string;
  reason: string;
}) {
  return {
    subject: `Withdrawal Request Update - ${data.referenceNumber}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Withdrawal Request Update</h2>
        <p>Hi ${data.vendorName},</p>
        <p>Your withdrawal request <strong>${data.referenceNumber}</strong> for PKR ${data.amount.toFixed(2)} could not be processed.</p>
        <div style="background: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <p style="margin: 0;"><strong>Reason:</strong> ${data.reason}</p>
        </div>
        <p>If you have any questions, please contact our support team.</p>
      </div>
    `,
  };
}
