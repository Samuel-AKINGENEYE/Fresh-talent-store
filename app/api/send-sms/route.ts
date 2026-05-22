import { NextRequest, NextResponse } from 'next/server';
import { sendSMS, getOrderStatusMessage, getCODVerificationMessage } from '@/lib/services/sms-service';
import { rateLimit, getClientIp } from '@/lib/utils/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limit: max 10 SMS per IP per minute to prevent abuse
    const ip = getClientIp(request);
    if (!rateLimit(`sms:${ip}`, 10, 60_000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { phone, type, data } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
    }

    // Reject invalid phone lengths to prevent gateway injection
    const stripped = phone.replace(/\D/g, '');
    if (stripped.length < 9 || stripped.length > 15) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    let message = '';

    switch (type) {
      case 'order_status':
        message = getOrderStatusMessage(data.orderNumber, data.status, data.total);
        break;
      case 'cod_verification':
        message = getCODVerificationMessage(data.code);
        break;
      case 'custom':
        // Strip control characters and cap length to prevent SMS injection
        message = String(data.message ?? '').replace(/[\x00-\x08\x0B-\x1F\x7F]/g, '').slice(0, 160);
        break;
      default:
        message = 'Update from Fresh Talent Store';
    }

    const result = await sendSMS({ to: phone, message, type });

    return NextResponse.json({ success: true, dev: result.dev ?? false });
  } catch (error) {
    console.error('SMS API error:', error);
    return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 });
  }
}
