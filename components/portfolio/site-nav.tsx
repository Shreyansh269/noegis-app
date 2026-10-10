'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export type NavLink = { href: string; label: string }

export function SiteNav({ name, links }: { name: string; links: NavLink[] }) {
  const [open, setOpen] = useState(false)
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-ink/85 backdrop-blur-md">
      <nav aria-label="Primary" className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <a href="#top" className="flex items-center gap-3" aria-label={`${name} — back to top`}>
          <span className="clip-hex flex size-9 items-center justify-center bg-crimson font-display text-sm font-bold text-white">
            {initials}
          </span>
          <span className="hidden font-display text-sm font-semibold uppercase tracking-[0.25em] text-foreground sm:inline">
            {name}
          </span>
        </a>

        <ul className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-crimson"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="flex size-10 items-center justify-center text-foreground md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
        </button>
      </nav>

      {open && (
        <ul id="mobile-menu" className="flex flex-col border-t border-border bg-ink px-5 py-3 md:hidden">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="block py-3 font-display text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground hover:text-crimson"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  )
}
