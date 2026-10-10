'use client'

import { useActionState } from 'react'
import { Loader2, Send } from 'lucide-react'
import { sendContactMessage, type ContactState } from '@/app/actions/contact'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function ContactForm() {
  const [state, formAction, pending] = useActionState<ContactState, FormData>(sendContactMessage, {})

  if (state.ok) {
    return (
      <div role="status" className="tech-card flex h-full flex-col justify-center p-7">
        <p className="section-eyebrow">Message sent</p>
        <p className="mt-2 text-lg text-foreground">Thanks for reaching out — I&apos;ll get back to you soon.</p>
      </div>
    )
  }

  return (
    <form action={formAction} className="tech-card flex flex-col gap-4 p-7">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-name">Name</Label>
          <Input id="contact-name" name="name" required maxLength={100} autoComplete="name" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-email">Email</Label>
          <Input id="contact-email" name="email" type="email" required maxLength={254} autoComplete="email" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea id="contact-message" name="message" required minLength={10} maxLength={3000} rows={6} />
      </div>
      {/* Honeypot: hidden from people, often filled by bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-crimson">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-slant mt-2 self-start">
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Send className="size-4" aria-hidden="true" />}
        {pending ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
