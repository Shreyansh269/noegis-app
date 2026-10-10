'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import {
  clearFailedLogins,
  getClientIp,
  getLockoutSeconds,
  isAuthConfigured,
  recordFailedLogin,
  verifyOwnerCredentials,
} from '@/lib/auth/server'
import { SESSION_COOKIE, sessionCookieOptions, signSessionToken } from '@/lib/auth/session-token'

export type LoginState = { error?: string }

const loginSchema = z.object({
  email: z.string().trim().max(254),
  password: z.string().min(1, 'Password is required').max(200),
})

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!isAuthConfigured()) {
    return { error: 'Admin login is not configured. Set ADMIN_EMAIL, ADMIN_PASSWORD_HASH and SESSION_SECRET.' }
  }

  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) return { error: 'Enter your email and password.' }

  const ip = await getClientIp()
  const lockout = await getLockoutSeconds(ip)
  if (lockout > 0) {
    return { error: `Too many failed attempts. Try again in ${Math.ceil(lockout / 60)} minute(s).` }
  }

  const ok = await verifyOwnerCredentials(parsed.data.email, parsed.data.password)
  if (!ok) {
    await recordFailedLogin(ip)
    await sleep(1000) // slow down brute-force attempts
    return { error: 'Invalid email or password.' }
  }

  await clearFailedLogins(ip)
  const token = await signSessionToken(parsed.data.email.toLowerCase())
  const store = await cookies()
  store.set(SESSION_COOKIE, token, sessionCookieOptions())
  redirect('/admin')
}
