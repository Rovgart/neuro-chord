import { jwtVerify } from 'jose';
import { type NextRequest, NextResponse } from 'next/server';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export default async function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');
  const isOnboardingPage = pathname.startsWith('/onboarding');
  const isDashboardPage = pathname.startsWith('/dashboard');
  const isPricingPage = pathname.startsWith('/pricing');

  if (!token) {
    if (isDashboardPage || isOnboardingPage) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    return NextResponse.next();
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);

    const isOnboardingComplete = !!payload.profile_id;

    const subscriptionPlan = payload.subscription_plan;
    const isSubscribed = !!subscriptionPlan && subscriptionPlan !== 'None';

    if (isAuthPage) {
      if (!isOnboardingComplete) {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
      if (!isSubscribed) {
        return NextResponse.redirect(new URL('/pricing', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (!isOnboardingComplete && !isOnboardingPage) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }

    if (isOnboardingComplete && isOnboardingPage) {
      const dest = isSubscribed ? '/dashboard' : '/pricing';
      return NextResponse.redirect(new URL(dest, request.url));
    }

    if (isOnboardingComplete && !isSubscribed && isDashboardPage) {
      return NextResponse.redirect(new URL('/pricing', request.url));
    }

    if (isSubscribed && isPricingPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  } catch (error: unknown) {
    console.error(error);
    const response = NextResponse.redirect(new URL('/sign-in', request.url));
    response.cookies.delete('accessToken');
    return response;
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};
