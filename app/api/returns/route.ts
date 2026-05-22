import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function POST(request: NextRequest) {
  try {
    const { orderId, reason } = await request.json();

    if (!orderId || !reason?.trim()) {
      return NextResponse.json({ error: 'Order ID and reason are required' }, { status: 400 });
    }

    // Verify the auth token from the request header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure order belongs to user and is delivered
    const { data: order } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status !== 'delivered') {
      return NextResponse.json({ error: 'Returns are only accepted for delivered orders' }, { status: 400 });
    }

    // Check no existing pending/approved return for this order
    const { data: existing } = await supabase
      .from('return_requests')
      .select('id, status')
      .eq('order_id', orderId)
      .eq('user_id', user.id)
      .in('status', ['pending', 'approved'])
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: 'A return request already exists for this order' }, { status: 409 });
    }

    const { data: returnRequest, error: insertError } = await supabase
      .from('return_requests')
      .insert({ user_id: user.id, order_id: orderId, reason: reason.trim(), status: 'pending' })
      .select()
      .single();

    if (insertError) {
      console.error('Return insert error:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: returnRequest.id });
  } catch (error) {
    console.error('Returns API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, status } = await request.json();

    if (!id || !['approved', 'rejected', 'refunded'].includes(status)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { error } = await supabase
      .from('return_requests')
      .update({ status })
      .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Returns PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
