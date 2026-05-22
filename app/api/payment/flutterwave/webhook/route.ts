import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const webhookSecret = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
    const signature = request.headers.get('verif-hash');

    // Validate webhook signature using constant-time comparison to prevent timing attacks
    if (webhookSecret) {
      if (!signature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
      }
      const secretBuf = Buffer.from(webhookSecret, 'utf8');
      const sigBuf = Buffer.from(signature, 'utf8');
      const valid = secretBuf.length === sigBuf.length &&
        crypto.timingSafeEqual(secretBuf, sigBuf);
      if (!valid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const payload = await request.json();
    const { event, data } = payload;

    if (event === 'charge.completed' && data?.status === 'successful') {
      const txRef = data.tx_ref as string;

      // tx_ref format: "FTS-{orderId}-{timestamp}"
      const match = txRef.match(/^FTS-([^-]+)-/);
      if (match) {
        const orderId = match[1];
        await supabaseAdmin
          .from('orders')
          .update({
            payment_status: 'paid',
            payment_reference: String(data.id),
            status: 'processing',
          })
          .eq('id', orderId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
