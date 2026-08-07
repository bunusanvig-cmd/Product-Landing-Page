import nodemailer from 'nodemailer';
import type { StoredOrder } from './types';
import { formatMoney, siteConfig } from './site';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function createTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error('Missing SMTP environment variables');
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

function shellCard(title: string, content: string) {
  return `
    <tr>
      <td style="padding:0 0 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:0;">
          <tr>
            <td style="padding:18px 20px;background:#f8f3eb;border:1px solid #eadfcf;border-radius:18px;">
              <div style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#8d6e2f;font-weight:700;margin-bottom:10px;">${title}</div>
              <div style="font-size:15px;line-height:1.7;color:#16233b;">${content}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

function emailLayout(body: string, footer: string) {
  return `
    <html>
      <body style="margin:0;padding:0;background:#f5efe3;font-family:Arial,Helvetica,sans-serif;color:#0d1729;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:linear-gradient(180deg,#09111f 0%,#0d1729 38%,#f5efe3 38%,#f5efe3 100%);padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;border-collapse:separate;border-spacing:0;">
                <tr>
                  <td style="padding:28px 28px 20px;">
                    <div style="font-size:12px;letter-spacing:.28em;text-transform:uppercase;color:#f7d48c;font-weight:700;">${siteConfig.brandName}</div>
                    <div style="font-size:30px;line-height:1.1;color:#ffffff;font-weight:800;margin-top:10px;">${footer}</div>
                  </td>
                </tr>
                <tr>
                  <td style="background:#ffffff;border-radius:28px;padding:0;box-shadow:0 20px 60px rgba(9,17,31,.12);overflow:hidden;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                      <tr>
                        <td style="padding:32px;">
                          ${body}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 14px 0;color:#5d6573;font-size:12px;line-height:1.8;text-align:center;">
                    <div>${siteConfig.customerEmailSignature}</div>
                    <div>Reply to: ${siteConfig.supportEmail}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

export async function sendBusinessNotification(order: StoredOrder) {
  const transporter = createTransport();
  const subject = `New Product Order Received - ${order.orderId}`;
  const customerName = escapeHtml(order.customerName);
  const phoneNumber = escapeHtml(order.phoneNumber);
  const emailAddress = escapeHtml(order.emailAddress);
  const exactLocation = escapeHtml(order.exactLocation);
  const productName = escapeHtml(order.productName);
  const body = `
    <div style="font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:#8d6e2f;font-weight:700;">Order Alert</div>
    <div style="font-size:28px;line-height:1.2;color:#09111f;font-weight:800;margin-top:8px;">New order received</div>
    <div style="margin-top:10px;font-size:15px;line-height:1.7;color:#4c5565;">Please call the customer soon to confirm this order.</div>
    ${shellCard('Order Details', `<strong>Order ID:</strong> ${order.orderId}<br /><strong>Date &amp; Time:</strong> ${order.dateTime}`)}
    ${shellCard('Customer Details', `<strong>Name:</strong> ${customerName}<br /><strong>Phone:</strong> ${phoneNumber}<br /><strong>Email:</strong> ${emailAddress}<br /><strong>Location:</strong> ${exactLocation}`)}
    ${shellCard('Product Details', `<strong>Product:</strong> ${productName}<br /><strong>Quantity:</strong> ${order.quantity}<br /><strong>Price Per Piece:</strong> ${formatMoney(order.pricePerPiece)}<br /><strong>Total Price:</strong> ${formatMoney(order.totalPrice)}`)}
    ${shellCard('Payment Details', `<strong>Payment Method:</strong> ${order.paymentMethod}<br /><strong>Order Status:</strong> ${order.orderStatus}`)}
    <div style="margin-top:18px;padding:16px 18px;border-radius:18px;background:#09111f;color:#fff;font-size:14px;line-height:1.7;">Please call the customer soon to confirm this order.</div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.BUSINESS_EMAIL || siteConfig.supportEmail,
    to: process.env.BUSINESS_EMAIL,
    subject,
    html: emailLayout(body, 'Order Received'),
    replyTo: process.env.EMAIL_FROM || process.env.BUSINESS_EMAIL || siteConfig.supportEmail,
  });
}

export async function sendCustomerReceipt(order: StoredOrder) {
  const transporter = createTransport();
  const subject = `Your Order Has Been Received - ${siteConfig.brandName}`;
  const customerName = escapeHtml(order.customerName);
  const productName = escapeHtml(order.productName);
  const body = `
    <div style="font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:#8d6e2f;font-weight:700;">Thank You</div>
    <div style="font-size:28px;line-height:1.2;color:#09111f;font-weight:800;margin-top:8px;">Your order has been received</div>
    <div style="margin-top:10px;font-size:15px;line-height:1.7;color:#4c5565;">Hi ${customerName}, thank you for your order. We have received it successfully.</div>
    ${shellCard('Order Summary', `<strong>Order ID:</strong> ${order.orderId}<br /><strong>Product:</strong> ${productName}<br /><strong>Quantity:</strong> ${order.quantity}<br /><strong>Total Price:</strong> ${formatMoney(order.totalPrice)}<br /><strong>Payment Method:</strong> ${order.paymentMethod}`)}
    <div style="margin-top:18px;padding:16px 18px;border-radius:18px;background:#f8f3eb;color:#16233b;font-size:14px;line-height:1.7;border:1px solid #eadfcf;">Our sales representative will call you soon to confirm your order.</div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.BUSINESS_EMAIL || siteConfig.supportEmail,
    to: order.emailAddress,
    subject,
    html: emailLayout(body, `Order Received by ${siteConfig.brandName}`),
    replyTo: process.env.EMAIL_FROM || process.env.BUSINESS_EMAIL || siteConfig.supportEmail,
  });
}
