import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? 'orders@freshtalentstore.rw';

interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
}

interface Address {
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  sector?: string;
  phone: string;
}

interface Order {
  order_number: string;
  total: number;
  subtotal: number;
  delivery_fee: number;
  payment_method: string;
  status: string;
  created_at: string;
}

function buildOrderEmailHtml(order: Order, items: OrderItem[], address: Address, customerName: string): string {
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee;">${item.product_name}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">RWF ${(item.price * item.quantity).toLocaleString()}</td>
    </tr>
  `).join('');

  const deliveryText = order.delivery_fee === 0 ? 'Free' : `RWF ${order.delivery_fee.toLocaleString()}`;
  const paymentLabel = order.payment_method.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Inter,Arial,sans-serif;background:#f8fafc;margin:0;padding:0;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1e40af,#1d4ed8);padding:32px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">Fresh Talent Store</h1>
      <p style="color:#93c5fd;margin:6px 0 0;">Tech. Fresh. For You.</p>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:24px;display:flex;align-items:center;gap:12px;">
        <span style="font-size:24px;">✅</span>
        <div>
          <p style="margin:0;font-weight:600;color:#15803d;">Order Confirmed!</p>
          <p style="margin:4px 0 0;color:#166534;font-size:14px;">Order #${order.order_number}</p>
        </div>
      </div>

      <p style="color:#374151;margin:0 0 24px;">Hi ${customerName}, thank you for your order! We're preparing it for delivery.</p>

      <!-- Order Items -->
      <h2 style="font-size:16px;font-weight:600;color:#111827;margin:0 0 12px;">Order Summary</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
        <thead>
          <tr style="background:#f9fafb;">
            <th style="padding:8px;text-align:left;font-size:13px;color:#6b7280;">Product</th>
            <th style="padding:8px;text-align:center;font-size:13px;color:#6b7280;">Qty</th>
            <th style="padding:8px;text-align:right;font-size:13px;color:#6b7280;">Price</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>

      <div style="border-top:2px solid #e5e7eb;padding-top:12px;margin-bottom:24px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
          <span style="color:#6b7280;font-size:14px;">Subtotal</span>
          <span style="font-size:14px;">RWF ${order.subtotal.toLocaleString()}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
          <span style="color:#6b7280;font-size:14px;">Delivery</span>
          <span style="font-size:14px;">${deliveryText}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-weight:700;font-size:16px;color:#1e40af;margin-top:8px;">
          <span>Total</span>
          <span>RWF ${order.total.toLocaleString()}</span>
        </div>
      </div>

      <!-- Delivery Info -->
      <div style="background:#eff6ff;border-radius:8px;padding:16px;margin-bottom:24px;">
        <h3 style="font-size:14px;font-weight:600;color:#1e40af;margin:0 0 8px;">📦 Delivery Address</h3>
        <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">
          ${address.full_name}<br>
          ${address.address_line1}${address.address_line2 ? ', ' + address.address_line2 : ''}<br>
          ${address.sector ? address.sector + ', ' : ''}${address.city}<br>
          📞 ${address.phone}
        </p>
      </div>

      <p style="color:#6b7280;font-size:13px;margin:0 0 8px;"><strong>Payment:</strong> ${paymentLabel}</p>
      <p style="color:#6b7280;font-size:13px;margin:0;">Questions? WhatsApp us or reply to this email.</p>
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #e5e7eb;">
      <p style="margin:0;color:#9ca3af;font-size:12px;">Fresh Talent Store · Kigali, Rwanda · freshtalentstore.rw</p>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const { order, items, user, address } = await request.json();

    if (!order || !user?.email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;

    // Dev mode: log and return success if key is placeholder
    if (!apiKey || apiKey.startsWith('re_XXXX')) {
      console.log('📧 [DEV] Order confirmation email would be sent to:', user.email);
      console.log('   Order:', order.order_number, '| Total: RWF', order.total?.toLocaleString());
      return NextResponse.json({ success: true, dev: true, message: 'Dev mode — add RESEND_API_KEY to send real emails' });
    }

    const customerName = user.full_name || address?.full_name || 'Valued Customer';
    const html = buildOrderEmailHtml(order, items || [], address, customerName);

    const { data, error } = await resend.emails.send({
      from: `Fresh Talent Store <${FROM}>`,
      to: [user.email],
      subject: `Order Confirmed #${order.order_number} — Fresh Talent Store`,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Failed to send email', details: error }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    console.error('Send-email error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
