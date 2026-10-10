import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth/session-token'

/**
 * Guards the admin area and every admin write API.
 * Pages redirect to the login screen; API routes return 401.
 * Server actions additionally call requireOwner() (defense in depth).
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname === '/admin/login') return NextResponse.next()

  let session = null
  try {
    session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value)
  } catch {
    session = null
  }
  if (session) return NextResponse.next()

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const loginUrl = new URL('/admin/login', request.url)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
