import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PREMIUM_ROUTES = [
  '/app/analysis',
  '/app/ai-chat',
  '/app/voice-journal'
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Check auth status
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If accessing premium routes, check subscription
  if (PREMIUM_ROUTES.some(route => req.nextUrl.pathname.startsWith(route))) {
    if (!session) {
      // Not logged in, redirect to login
      const redirectUrl = new URL('/login', req.url);
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Check subscription status
    const { data: hasActiveSubscription } = await supabase
      .rpc('has_active_subscription', {
        user_id: session.user.id
      });

    if (!hasActiveSubscription) {
      // No active subscription, redirect to pricing
      return NextResponse.redirect(new URL('/pricing', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/app/:path*',
    '/checkout/:path*'
  ]
}; 