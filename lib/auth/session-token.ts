import { jwtVerify, SignJWT } from 'jose'

/**
 * Edge-safe JWT helpers (no Node-only imports) so they can be used from
 * proxy.ts as well as server components and route handlers.
 */

export const SESSION_COOKIE = 'ss_admin_session'
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function getSecret() {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET must be set and at least 32 characters long')
  }
  return new TextEncoder().encode(secret)
}

export async function signSessionToken(email: string) {
  return new SignJWT({ email, role: 'owner' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject('owner')
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret())
}

/** Returns the session payload when the token is valid, otherwise null. */
export async function verifySessionToken(token: string | undefined | null) {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ['HS256'] })
    if (payload.sub !== 'owner' || payload.role !== 'owner') return null
    // Invalidate sessions if the configured owner email changes.
    const ownerEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
    if (!ownerEmail || payload.email !== ownerEmail) return null
    return { email: payload.email as string }
  } catch {
    return null
  }
}

/**
 * Cookie attributes. The v0 preview renders the app inside a cross-site
 * iframe, where SameSite=Lax cookies are dropped, so development uses
 * SameSite=None. Production uses SameSite=Lax as specified.
 */
export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: true,
    sameSite: (process.env.NODE_ENV === 'development' ? 'none' : 'lax') as 'none' | 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  }
}
