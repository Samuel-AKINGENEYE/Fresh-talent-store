import { NextRequest, NextResponse } from 'next/server';

const SUPPORTED = ['en', 'rw'];

export async function POST(request: NextRequest) {
  const { locale } = await request.json();

  if (!SUPPORTED.includes(locale)) {
    return NextResponse.json({ error: 'Unsupported locale' }, { status: 400 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set('locale', locale, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
  return res;
}
