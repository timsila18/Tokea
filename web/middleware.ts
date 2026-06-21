import { NextResponse, type NextRequest } from 'next/server';

const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), payment=(self)',
};

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  Object.entries(securityHeaders).forEach(([key, value]) => response.headers.set(key, value));

  if (request.nextUrl.pathname.startsWith('/api/') && request.method !== 'GET') {
    const contentType = request.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ error: 'JSON content type required' }, { status: 415, headers: securityHeaders });
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
