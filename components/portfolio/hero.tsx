import Image from 'next/image'
import { ArrowRight, MapPin } from 'lucide-react'
import type { Profile } from '@/lib/portfolio/schema'

export function Hero({ profile, showContact }: { profile: Profile; showContact: boolean }) {
  const initials = profile.fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')

  return (
    <section id="top" aria-label="Introduction" className="relative overflow-hidden pt-16">
      {/* Diagonal wine block */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-[70%] bg-gradient-to-br from-wine via-wine-dark to-ink opacity-90 md:w-[55%]"
        style={{ clipPath: 'polygon(35% 0, 100% 0, 100% 100%, 0 100%)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl flex-col-reverse items-center justify-center gap-12 px-5 py-16 md:flex-row md:justify-between md:gap-8">
        <div className="flex max-w-xl flex-col items-start">
          <p className="chip-slant">ID // {profile.portfolioId}</p>
          <h1 className="mt-6 font-display text-5xl font-bold uppercase leading-[0.95] tracking-wide text-foreground text-balance sm:text-6xl lg:text-7xl">
            {profile.fullName}
          </h1>
          {profile.title && (
            <p className="mt-4 font-display text-xl font-semibold uppercase tracking-[0.25em] text-crimson md:text-2xl">
              {profile.title}
            </p>
          )}
          {profile.tagline && (
            <p className="mt-6 max-w-lg text-pretty leading-relaxed text-muted-foreground">{profile.tagline}</p>
          )}
          {profile.location && (
            <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4 text-crimson" aria-hidden="true" />
              {profile.location}
            </p>
          )}
          <div className="mt-10 flex flex-wrap gap-3">
            {showContact && (
              <a href="#contact" className="btn-slant">
                Get in touch
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            )}
            <a href="#projects" className="btn-slant-ghost">
              View work
            </a>
          </div>
        </div>

        <div className="relative shrink-0">
          <div className="clip-hex absolute -inset-3 bg-crimson/80" aria-hidden="true" />
          <div className="clip-hex relative size-64 bg-surface-2 sm:size-72 lg:size-80">
            {profile.photoUrl ? (
              <Image
                src={profile.photoUrl}
                alt={`Portrait of ${profile.fullName}`}
                fill
                priority
                sizes="(min-width: 1024px) 320px, 288px"
                className="object-cover"
              />
            ) : (
              <span
                aria-hidden="true"
                className="flex size-full items-center justify-center font-display text-7xl font-bold text-wine"
              >
                {initials}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
