import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Reveal } from './reveal'

export function Section({
  id,
  index,
  eyebrow,
  title,
  children,
  className,
}: {
  id: string
  index: string
  eyebrow: string
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn('border-t border-border/60 py-20 md:py-28', className)}>
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="mb-12 flex items-end gap-5">
          <span className="font-display text-6xl font-bold leading-none text-wine md:text-7xl" aria-hidden="true">
            {index}
          </span>
          <div className="pb-1">
            <p className="section-eyebrow">{eyebrow}</p>
            <h2 id={`${id}-title`} className="section-title mt-1">
              {title}
            </h2>
          </div>
        </Reveal>
        {children}
      </div>
    </section>
  )
}
