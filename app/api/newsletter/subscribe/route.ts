import { NextResponse } from 'next/server';
import crypto from 'crypto';

async function syncToMailchimp(email: string, name?: string): Promise<{ success: boolean; dev?: boolean; error?: string }> {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;
  const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX;

  if (!apiKey || apiKey.startsWith('MC_XXXX') || !audienceId || audienceId.startsWith('XXXX') || !serverPrefix) {
    console.log('📧 [DEV] Mailchimp subscribe (dev mode):', email, name ?? '');
    return { success: true, dev: true };
  }

  const subscriberHash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
  const url = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}/members/${subscriberHash}`;

  const nameParts = (name ?? '').trim().split(' ');
  const firstName = nameParts[0] ?? '';
  const lastName = nameParts.slice(1).join(' ') ?? '';

  const body = JSON.stringify({
    email_address: email,
    status_if_new: 'subscribed',
    status: 'subscribed',
    merge_fields: {
      ...(firstName && { FNAME: firstName }),
      ...(lastName && { LNAME: lastName }),
    },
  });

  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Basic ${Buffer.from(`anystring:${apiKey}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body,
    });

    if (res.ok) return { success: true };

    const errBody = await res.json().catch(() => ({}));
    const detail = (errBody as { detail?: string }).detail ?? res.statusText;

    // Already subscribed is not an error
    if (res.status === 400 && detail.toLowerCase().includes('already a list member')) {
      return { success: true };
    }

    console.error('Mailchimp API error:', res.status, detail);
    return { success: false, error: detail };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Mailchimp fetch exception:', message);
    return { success: false, error: message };
  }
}

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const result = await syncToMailchimp(email, name);

    if (!result.success) {
      return NextResponse.json({ error: result.error ?? 'Subscription failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true, dev: result.dev ?? false });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    return NextResponse.json({ error: 'Subscription failed' }, { status: 500 });
  }
}
