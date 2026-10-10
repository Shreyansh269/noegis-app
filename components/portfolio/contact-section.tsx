import { Globe, Mail, MapPin, Phone } from 'lucide-react'
import type { Profile } from '@/lib/portfolio/schema'
import { ContactForm } from './contact-form'
import { Reveal } from './reveal'
import { Section } from './section'

export function ContactSection({
  index,
  profile,
  formEnabled,
}: {
  index: string
  profile: Profile
  formEnabled: boolean
}) {
  const details = [
    profile.email && { icon: Mail, label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
    profile.phone && {
      icon: Phone,
      label: 'Phone',
      value: profile.phone,
      href: `tel:${profile.phone.replace(/[^\d+]/g, '')}`,
    },
    profile.location && { icon: MapPin, label: 'Location', value: profile.location },
  ].filter(Boolean) as { icon: typeof Mail; label: string; value: string; href?: string }[]

  return (
    <Section id="contact" index={index} eyebrow="Let's talk" title="Contact">
      <div className={formEnabled ? 'grid gap-8 md:grid-cols-[1fr_1.3fr]' : 'grid gap-8'}>
        <Reveal>
          <div className="tech-card flex flex-col gap-6 p-7">
            <ul className="flex flex-col gap-5">
              {details.map(({ icon: Icon, label, value, href }) => (
                <li key={label} className="flex items-start gap-4">
                  <span className="clip-hex flex size-10 shrink-0 items-center justify-center bg-wine">
                    <Icon className="size-4 text-white" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-crimson">{label}</p>
                    {href ? (
                      <a href={href} className="break-all text-foreground hover:text-crimson">
                        {value}
                      </a>
                    ) : (
                      <p className="text-foreground">{value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            {profile.socials.length > 0 && (
              <div className="border-t border-border pt-5">
                <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-crimson">Elsewhere</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {profile.socials.map((s) => (
                    <li key={s.id}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer me"
                        className="clip-slant-sm inline-flex items-center gap-2 bg-surface-2 px-4 py-2 font-display text-xs font-semibold uppercase tracking-widest text-foreground transition-colors hover:bg-wine"
                      >
                        <Globe className="size-3.5" aria-hidden="true" />
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Reveal>
        {formEnabled && (
          <Reveal delay={120}>
            <ContactForm />
          </Reveal>
        )}
      </div>
    </Section>
  )
}
