import 'server-only'
import { cache } from 'react'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { siteKv } from '@/lib/db/schema'
import { portfolioSchema, type Portfolio } from './schema'
import { SEED_PORTFOLIO } from './seed'

const PORTFOLIO_KEY = 'portfolio'

/**
 * Reads the portfolio document. Seeds placeholder content on first run.
 * Falls back to the seed (instead of crashing) if stored data is invalid
 * or the database is unreachable.
 */
export const getPortfolio = cache(async (): Promise<Portfolio> => {
  try {
    const rows = await db
      .select({ value: siteKv.value })
      .from(siteKv)
      .where(eq(siteKv.key, PORTFOLIO_KEY))
      .limit(1)

    if (rows.length === 0) {
      await db
        .insert(siteKv)
        .values({ key: PORTFOLIO_KEY, value: SEED_PORTFOLIO })
        .onConflictDoNothing()
      return SEED_PORTFOLIO
    }

    const parsed = portfolioSchema.safeParse(rows[0].value)
    if (!parsed.success) {
      console.error('Stored portfolio failed validation; using seed content.', parsed.error.issues[0])
      return SEED_PORTFOLIO
    }
    return parsed.data
  } catch (error) {
    console.error('Failed to load portfolio:', error)
    return SEED_PORTFOLIO
  }
})

/** Persists an already-validated portfolio document. */
export async function savePortfolio(portfolio: Portfolio) {
  await db
    .insert(siteKv)
    .values({ key: PORTFOLIO_KEY, value: portfolio, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: siteKv.key,
      set: { value: portfolio, updatedAt: new Date() },
    })
}
