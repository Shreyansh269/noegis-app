import 'server-only'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { cookies, headers } from 'next/headers'
import { db } from '@/lib/db'
import { loginAttempts, siteKv } from '@/lib/db/schema'
import { SESSION_COOKIE, verifySessionToken } from './session-token'

const PASSWORD_KEY = 'admin_password'
const MAX_FAILURES = 5
const WINDOW_MS = 15 * 60 * 1000
const LOCK_MS = 15 * 60 * 1000

/** Returns the owner session, or null if not logged in. */
export async function getSession() {
  const store = await cookies()
  return verifySessionToken(store.get(SESSION_COOKIE)?.value)
}

/** Throws if the request is not from the logged-in owner. Use in every write. */
export async function requireOwner() {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  return session
}

export function isAuthConfigured() {
  return Boolean(
    process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH && process.env.SESSION_SECRET,
  )
}

/** The active password hash: a DB override (set via Change password) or the env var. */
async function getPasswordHash(): Promise<string | null> {
  const rows = await db
    .select({ value: siteKv.value })
    .from(siteKv)
    .where(eq(siteKv.key, PASSWORD_KEY))
    .limit(1)
  const stored = rows[0]?.value as { hash?: string } | undefined
  return stored?.hash ?? process.env.ADMIN_PASSWORD_HASH ?? null
}

export async function verifyOwnerCredentials(email: string, password: string) {
  const ownerEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const hash = await getPasswordHash()
  // Always run bcrypt so timing does not reveal whether the email matched.
  const passwordOk = hash
    ? await bcrypt.compare(password, hash)
    : await bcrypt.compare(password, '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv')
  return Boolean(ownerEmail) && email.trim().toLowerCase() === ownerEmail && passwordOk
}

export async function verifyCurrentPassword(password: string) {
  const hash = await getPasswordHash()
  return hash ? bcrypt.compare(password, hash) : false
}

export async function setPassword(newPassword: string) {
  const hash = await bcrypt.hash(newPassword, 12)
  await db
    .insert(siteKv)
    .values({ key: PASSWORD_KEY, value: { hash }, updatedAt: new Date() })
    .onConflictDoUpdate({ target: siteKv.key, set: { value: { hash }, updatedAt: new Date() } })
}

/* ----------------------------- Rate limiting ----------------------------- */

export async function getClientIp() {
  const h = await headers()
  return (
    h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip')?.trim() || 'unknown'
  )
}

/** Returns the number of seconds the IP is locked out for, or 0. */
export async function getLockoutSeconds(ip: string) {
  const rows = await db.select().from(loginAttempts).where(eq(loginAttempts.ip, ip)).limit(1)
  const lockedUntil = rows[0]?.lockedUntil
  if (!lockedUntil) return 0
  const remaining = lockedUntil.getTime() - Date.now()
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0
}

export async function recordFailedLogin(ip: string) {
  const now = new Date()
  const rows = await db.select().from(loginAttempts).where(eq(loginAttempts.ip, ip)).limit(1)
  const existing = rows[0]
  const windowExpired = !existing || now.getTime() - existing.windowStart.getTime() > WINDOW_MS
  const failures = windowExpired ? 1 : existing.failures + 1
  const lockedUntil = failures >= MAX_FAILURES ? new Date(now.getTime() + LOCK_MS) : null
  const values = {
    failures,
    windowStart: windowExpired ? now : existing.windowStart,
    lockedUntil,
  }
  await db
    .insert(loginAttempts)
    .values({ ip, ...values })
    .onConflictDoUpdate({ target: loginAttempts.ip, set: values })
}

export async function clearFailedLogins(ip: string) {
  await db.delete(loginAttempts).where(eq(loginAttempts.ip, ip))
}
