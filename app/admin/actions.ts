'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { requireOwner, setPassword, verifyCurrentPassword } from '@/lib/auth/server'
import { SESSION_COOKIE } from '@/lib/auth/session-token'
import { savePortfolio } from '@/lib/portfolio/data'
import { firstIssue, portfolioSchema } from '@/lib/portfolio/schema'

export type ActionResult = { ok: true } | { ok: false; error: string }

export async function savePortfolioAction(input: unknown): Promise<ActionResult> {
  await requireOwner()
  const parsed = portfolioSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) }
  try {
    await savePortfolio(parsed.data)
  } catch (error) {
    console.error('Save failed:', error)
    return { ok: false, error: 'Could not save. Please try again.' }
  }
  revalidatePath('/')
  return { ok: true }
}

export async function changePasswordAction(current: string, next: string): Promise<ActionResult> {
  await requireOwner()
  if (typeof current !== 'string' || typeof next !== 'string') return { ok: false, error: 'Invalid input' }
  if (next.length < 10 || next.length > 128) {
    return { ok: false, error: 'New password must be 10–128 characters' }
  }
  if (!(await verifyCurrentPassword(current))) return { ok: false, error: 'Current password is incorrect' }
  await setPassword(next)
  return { ok: true }
}

export async function logoutAction() {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
  redirect('/admin/login')
}
