import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // For now, just allow all requests
  // We'll add proper auth later
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
