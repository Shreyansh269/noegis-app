import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession, isAuthConfigured } from '@/lib/auth/server'
import { LoginForm } from '@/components/admin/login-form'

export const metadata: Metadata = {
  title: 'Admin login',
  robots: { index: false, follow: false },
}

export default async function AdminLoginPage() {
  if (isAuthConfigured() && (await getSession())) redirect('/admin')

  return (
    <main className="flex min-h-svh items-center justify-center bg-ink px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="clip-chamfer border-t-2 border-crimson bg-surface p-8">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-crimson">
            Owner access
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-wider text-foreground">
            Admin login
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to edit your portfolio content.
          </p>
          {!isAuthConfigured() && (
            <p role="alert" className="mt-4 border-l-2 border-crimson bg-wine-dark/40 p-3 text-xs text-pink-100">
              Login is disabled until ADMIN_EMAIL, ADMIN_PASSWORD_HASH and SESSION_SECRET are set.
            </p>
          )}
          <LoginForm />
        </div>
      </div>
    </main>
  )
}
