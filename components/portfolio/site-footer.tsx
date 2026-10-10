import type { Profile } from '@/lib/portfolio/schema'

export function SiteFooter({ profile }: { profile: Profile }) {
  return (
    <footer className="border-t border-border/60 bg-ink">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-muted-foreground sm:flex-row">
        <p>
          &copy; {new Date().getFullYear()} {profile.fullName}
        </p>
        <p className="font-display text-xs uppercase tracking-[0.3em]">ID // {profile.portfolioId}</p>
      </div>
    </footer>
  )
}
