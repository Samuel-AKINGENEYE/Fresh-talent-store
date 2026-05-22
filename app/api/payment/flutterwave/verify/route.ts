import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { transaction_id, order_id } = await request.json();

    if (!transaction_id || !order_id) {
      return NextResponse.json({ error: 'Missing transaction_id or order_id' }, { status: 400 });
    }

    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!secretKey || secretKey.startsWith('FLWSECK_TEST-XXXX')) {
      // Dev mode: treat as successful to allow testing without real keys
      await supabaseAdmin
        .from('orders')
        .update({ payment_status: 'paid', payment_reference: `DEV_${transaction_id}` })
        .eq('id', order_id);
      return NextResponse.json({ success: true, dev: true });
    }

    // Verify with Flutterwave API
    const response = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Flutterwave verification failed' }, { status: 502 });
    }

    const data = await response.json();

    if (data.status !== 'success' || data.data?.status !== 'successful') {
      return NextResponse.json({ error: 'Payment not successful', data }, { status: 400 });
    }

    // Update order to paid
    const { error } = await supabaseAdmin
      .from('orders')
      .update({
        payment_status: 'paid',
        payment_reference: String(transaction_id),
        status: 'processing',
      })
      .eq('id', order_id);

    if (error) {
      console.error('Order update error:', error);
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    return NextResponse.json({ success: true, amount: data.data.amount });
  } catch (err) {
    console.error('Verify payment error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
