import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

async function unsubscribeFromMailchimp(email: string): Promise<void> {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;
  const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX;

  if (!apiKey || apiKey.startsWith('MC_XXXX') || !audienceId || !serverPrefix) return;

  const subscriberHash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
  const url = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}/members/${subscriberHash}`;

  await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Basic ${Buffer.from(`anystring:${apiKey}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: 'unsubscribed' }),
  }).catch(err => console.error('Mailchimp unsubscribe error:', err));
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    await Promise.all([
      supabaseAdmin
        .from('newsletter_subscribers')
        .update({ is_active: false, unsubscribed_at: new Date().toISOString() })
        .eq('email', email),
      unsubscribeFromMailchimp(email),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json({ error: 'Unsubscribe failed' }, { status: 500 });
  }
}

// GET variant for one-click unsubscribe links in emails
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');

  if (!email) {
    return NextResponse.redirect(new URL('/?unsubscribed=error', request.url));
  }

  await Promise.all([
    supabaseAdmin
      .from('newsletter_subscribers')
      .update({ is_active: false, unsubscribed_at: new Date().toISOString() })
      .eq('email', email),
    unsubscribeFromMailchimp(email),
  ]).catch(console.error);

  return NextResponse.redirect(new URL('/?unsubscribed=true', request.url));
}
