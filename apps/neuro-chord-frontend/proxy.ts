import { jwtVerify } from 'jose';
import { type NextRequest, NextResponse } from 'next/server';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
export default async function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  // Definiujemy strefy
  const isAuthPage = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');
  const isOnboardingPage = pathname.startsWith('/onboarding');
  const isDashboardPage = pathname.startsWith('/dashboard');

  if (!token) {
    if (isDashboardPage || isOnboardingPage) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    return NextResponse.next();
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);
    const isOnboardingComplete = !!payload.onboardingComplete;

    if (isAuthPage) {
      const dest = isOnboardingComplete ? '/dashboard' : '/onboarding';
      return NextResponse.redirect(new URL(dest, request.url));
    }

    if (!isOnboardingComplete && !isOnboardingPage) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }

    if (isOnboardingComplete && isOnboardingPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  } catch (error: unknown) {
    console.error(error);
    const response = NextResponse.redirect(new URL('/sign-in', request.url));
    response.cookies.delete('access_token');
    return response;
  }
}
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};
