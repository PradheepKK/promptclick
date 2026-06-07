import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin routes protect
  if (pathname.startsWith('/admin/dashboard')) {
    // Client side localStorage check பண்ண முடியாது middleware-ல்
    // So cookie-based check பண்ணலாம்
    const adminAuth = request.cookies.get('admin_auth')
    if (!adminAuth) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}