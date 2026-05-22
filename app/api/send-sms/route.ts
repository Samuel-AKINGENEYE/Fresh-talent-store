import { NextResponse } from 'next/server';
import { sendSMS, getOrderStatusMessage, getCODVerificationMessage } from '@/lib/services/sms-service';

export async function POST(request: Request) {
  try {
    const { phone, type, data } = await request.json();
    
    if (!phone) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
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
        message = data.message;
        break;
      default:
        message = data.message || 'Update from Fresh Talent Store';
    }
    
    const result = await sendSMS({
      to: phone,
      message,
      type,
    });
    
    return NextResponse.json({ success: true, dev: result.dev ?? false });
  } catch (error) {
    console.error('SMS API error:', error);
    return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 });
  }
}
