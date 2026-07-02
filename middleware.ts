import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const protectedRoute = createRouteMatcher([
  '/',
  '/upcoming',
  '/meeting(.*)',
  '/previous',
  '/recordings',
  '/minutes',
  '/personal-room',
  '/contact',
]);

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export default clerkMiddleware(async (auth, req) => {
  // Protect routes that require authentication
  if (protectedRoute(req)) await auth.protect();

  // Add security headers without blocking first-party video meetings.
  const response = NextResponse.next();
  const headers = response.headers;
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-XSS-Protection', '1; mode=block');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=()');

  // Rate limiting for API routes
  if (req.nextUrl.pathname.startsWith('/api/')) {
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const now = Date.now();
    const rateLimit = rateLimitStore.get(ip) || { count: 0, resetTime: now + 60000 };

    if (now > rateLimit.resetTime) {
      rateLimit.count = 1;
      rateLimit.resetTime = now + 60000;
    } else {
      rateLimit.count++;
    }

    rateLimitStore.set(ip, rateLimit);

    // Allow 60 requests per minute per IP
    if (rateLimit.count > 60) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }
  }

  return response;
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
