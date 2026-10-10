'use server'

import { z } from 'zod'
import { getPortfolio } from '@/lib/portfolio/data'

export type ContactState = { ok?: boolean; error?: string }

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name').max(100),
  email: z.email('Please enter a valid email').max(254),
  message: z.string().trim().min(10, 'Message should be at least 10 characters').max(3000),
  website: z.string().max(0).optional(),
})

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

export async function sendContactMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return { error: 'The contact form is not available right now.' }

  const parsed = contactSchema.safeParse({
    name: formData.get('name') ?? '',
    email: String(formData.get('email') ?? '').trim(),
    message: formData.get('message') ?? '',
    website: formData.get('website') ?? '',
  })
  if (!parsed.success) {
    // Silently "succeed" for honeypot hits so bots get no signal.
    if (parsed.error.issues.some((i) => i.path[0] === 'website')) return { ok: true }
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const { profile } = await getPortfolio()
  const to = process.env.CONTACT_TO_EMAIL || profile.email || process.env.ADMIN_EMAIL
  if (!to) return { error: 'The contact form is not available right now.' }

  const { name, email, message } = parsed.data
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL || 'Portfolio <onboarding@resend.dev>',
      to: [to],
      reply_to: email,
      subject: `Portfolio enquiry from ${name}`.slice(0, 150),
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: `<p><strong>Name:</strong> ${escapeHtml(name)}<br/><strong>Email:</strong> ${escapeHtml(email)}</p><p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
    }),
  })

  if (!res.ok) {
    console.error('Resend error', res.status, await res.text().catch(() => ''))
    return { error: 'Could not send your message. Please try emailing directly.' }
  }
  return { ok: true }
}
