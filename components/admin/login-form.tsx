'use client'

import { useActionState } from 'react'
import { Loader2 } from 'lucide-react'
import { loginAction, type LoginState } from '@/app/admin/login/actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, {})

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="username" required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-crimson">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-slant mt-2 justify-center">
        {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
