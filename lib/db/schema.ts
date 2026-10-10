import { integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

/**
 * Generic key/value store. The whole portfolio lives in one JSON document
 * under the key "portfolio"; an optional password override lives under
 * "admin_password" (set via Settings → Change password).
 */
export const siteKv = pgTable('site_kv', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

/** Failed-login tracking used for brute-force protection. */
export const loginAttempts = pgTable('login_attempts', {
  ip: text('ip').primaryKey(),
  failures: integer('failures').notNull().default(0),
  windowStart: timestamp('window_start', { withTimezone: true }).notNull().defaultNow(),
  lockedUntil: timestamp('locked_until', { withTimezone: true }),
})
