import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  //  const token = request.cookies.get("refresh_token")?.value;
  //     const { pathname } = request.nextUrl;
  //     // 1. Definiujemy typy stron
  //     const isAuthPage = pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");
  //     // assets i api zazwyczaj ignorujemy w matcherze, ale tutaj dla pewności:
  //     const isPublicAsset = pathname.startsWith('/_next') || pathname.includes('/api/') || pathname.includes('/favicon.ico');
  //     // 2. Jeśli to asset publiczny - nie rób nic
  //     if (isPublicAsset) {
  //         return NextResponse.next();
  //     }
  //     // 3. JEŚLI NIE MA TOKENA I UŻYTKOWNIK CHCE WEJŚĆ NA STRONĘ CHRONIONĄ
  //     // (Czyli nie jest na stronie logowania)
  //     if (!token && !isAuthPage) {
  //         return NextResponse.redirect(new URL("/sign-in", request.url));
  //     }
  //     // 4. JEŚLI MA TOKEN I CHCE WEJŚĆ NA STRONĘ LOGOWANIA
  //     if (token && isAuthPage) {
  //         return NextResponse.redirect(new URL('/dashboard', request.url));
  //     }
  //     return NextResponse.next();
}
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profie/:path*',

    /*
     * Dopasuj wszystkie ścieżki z wyjątkiem:
     * - api (trasy API)
     * - _next/static (pliki statyczne)
     * - _next/image (optymalizacja obrazów)
     * - favicon.ico (ikona)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
