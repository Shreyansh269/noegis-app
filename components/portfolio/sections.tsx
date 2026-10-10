import Image from 'next/image'
import { Check, ExternalLink, PlayCircle } from 'lucide-react'
import type { PricingPlan, Profile, Project, Qualification, Skill, Video } from '@/lib/portfolio/schema'
import { toEmbedUrl } from '@/lib/video'
import { cn } from '@/lib/utils'
import { Reveal } from './reveal'
import { Section } from './section'

export function AboutSection({ index, profile }: { index: string; profile: Profile }) {
  const facts = [
    { label: 'Name', value: profile.fullName },
    { label: 'Role', value: profile.title },
    { label: 'Based in', value: profile.location },
    { label: 'Portfolio ID', value: profile.portfolioId },
  ].filter((f) => f.value)

  return (
    <Section id="about" index={index} eyebrow="Profile" title="About me">
      <div className="grid gap-10 md:grid-cols-[1.6fr_1fr]">
        <Reveal>
          <p className="whitespace-pre-line text-pretty text-lg leading-relaxed text-muted-foreground">
            {profile.about}
          </p>
        </Reveal>
        <Reveal delay={120}>
          <dl className="tech-card flex flex-col gap-4 p-6">
            {facts.map((fact) => (
              <div key={fact.label} className="flex flex-col gap-1 border-b border-border pb-3 last:border-0 last:pb-0">
                <dt className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-crimson">
                  {fact.label}
                </dt>
                <dd className="text-foreground">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </Section>
  )
}

export function QualificationsSection({ index, items }: { index: string; items: Qualification[] }) {
  return (
    <Section id="qualifications" index={index} eyebrow="Background" title="Qualifications">
      <ol className="relative flex flex-col gap-8 border-l-2 border-wine pl-8 md:ml-4">
        {items.map((item, i) => (
          <li key={item.id} className="relative">
            <span
              aria-hidden="true"
              className="clip-hex absolute -left-[42px] top-5 size-5 bg-crimson"
            />
            <Reveal delay={i * 80}>
              <article className="tech-card p-6">
                {item.years && (
                  <p className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-crimson">
                    {item.years}
                  </p>
                )}
                <h3 className="mt-1 font-display text-2xl font-bold uppercase tracking-wide text-foreground">
                  {item.title}
                </h3>
                {item.institution && <p className="mt-1 text-sm text-foreground/80">{item.institution}</p>}
                {item.details && (
                  <p className="mt-3 whitespace-pre-line leading-relaxed text-muted-foreground">{item.details}</p>
                )}
              </article>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  )
}

export function SkillsSection({ index, items }: { index: string; items: Skill[] }) {
  return (
    <Section id="skills" index={index} eyebrow="Capabilities" title="Skills & services">
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((skill, i) => (
          <li key={skill.id}>
            <Reveal delay={(i % 3) * 80} className="h-full">
              <article className="tech-card flex h-full flex-col p-6">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-xl font-bold uppercase tracking-wide text-foreground">
                    {skill.name}
                  </h3>
                  <span className="font-display text-lg font-semibold text-crimson">{skill.level}%</span>
                </div>
                {skill.description && (
                  <p className="mt-3 flex-1 leading-relaxed text-muted-foreground">{skill.description}</p>
                )}
                <div
                  className="clip-slant-sm mt-5 h-2 bg-surface-2"
                  role="meter"
                  aria-label={`${skill.name} proficiency`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={skill.level}
                >
                  <div className="h-full bg-gradient-to-r from-wine to-crimson" style={{ width: `${skill.level}%` }} />
                </div>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  )
}

export function ProjectsSection({ index, items }: { index: string; items: Project[] }) {
  return (
    <Section id="projects" index={index} eyebrow="Selected work" title="Projects">
      <ul className="grid gap-6 md:grid-cols-2">
        {items.map((project, i) => (
          <li key={project.id}>
            <Reveal delay={(i % 2) * 100} className="h-full">
              <article className="tech-card flex h-full flex-col overflow-hidden">
                <div className="relative aspect-video bg-surface-2">
                  {project.coverUrl ? (
                    <Image
                      src={project.coverUrl}
                      alt={`Cover image for ${project.title}`}
                      fill
                      sizes="(min-width: 768px) 560px, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      className="flex size-full items-center justify-center bg-gradient-to-br from-wine-dark to-ink font-display text-5xl font-bold uppercase text-wine"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-foreground">
                    {project.title}
                  </h3>
                  {project.tags.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-2" aria-label="Tags">
                      {project.tags.map((tag) => (
                        <li key={tag} className="chip-slant">
                          {tag}
                        </li>
                      ))}
                    </ul>
                  )}
                  {project.description && (
                    <p className="mt-4 flex-1 whitespace-pre-line leading-relaxed text-muted-foreground">
                      {project.description}
                    </p>
                  )}
                  {(project.projectUrl || project.videoUrl) && (
                    <div className="mt-6 flex flex-wrap gap-5">
                      {project.projectUrl && (
                        <a
                          href={project.projectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.2em] text-crimson hover:text-foreground"
                        >
                          Visit project <ExternalLink className="size-4" aria-hidden="true" />
                          <span className="sr-only">(opens in a new tab)</span>
                        </a>
                      )}
                      {project.videoUrl && (
                        <a
                          href={project.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.2em] text-crimson hover:text-foreground"
                        >
                          Watch video <PlayCircle className="size-4" aria-hidden="true" />
                          <span className="sr-only">(opens in a new tab)</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  )
}

export function VideosSection({ index, items }: { index: string; items: Video[] }) {
  return (
    <Section id="videos" index={index} eyebrow="Showreel" title="Videos">
      <ul className="grid gap-6 md:grid-cols-2">
        {items.map((video, i) => {
          const embed = toEmbedUrl(video.url)
          return (
            <li key={video.id}>
              <Reveal delay={(i % 2) * 100} className="h-full">
                <article className="tech-card flex h-full flex-col overflow-hidden">
                  <div className="relative aspect-video bg-surface-2">
                    {embed ? (
                      <iframe
                        src={embed}
                        title={video.title}
                        loading="lazy"
                        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                        className="absolute inset-0 size-full border-0"
                      />
                    ) : (
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex size-full items-center justify-center gap-2 font-display uppercase tracking-widest text-crimson"
                      >
                        <PlayCircle className="size-6" aria-hidden="true" /> Open video
                      </a>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-xl font-bold uppercase tracking-wide text-foreground">
                      {video.title}
                    </h3>
                    {video.description && (
                      <p className="mt-2 leading-relaxed text-muted-foreground">{video.description}</p>
                    )}
                  </div>
                </article>
              </Reveal>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}

export function PricingSection({
  index,
  items,
  showContact,
}: {
  index: string
  items: PricingPlan[]
  showContact: boolean
}) {
  return (
    <Section id="pricing" index={index} eyebrow="Engagement" title="Pricing">
      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((plan, i) => (
          <li key={plan.id}>
            <Reveal delay={(i % 3) * 80} className="h-full">
              <article
                className={cn(
                  'tech-card flex h-full flex-col p-7',
                  plan.featured && 'border-crimson bg-gradient-to-b from-wine-dark/70 to-surface',
                )}
              >
                {plan.featured && <p className="chip-slant mb-4 self-start bg-crimson text-white">Recommended</p>}
                <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-foreground">{plan.name}</h3>
                <p className="mt-4 flex items-baseline gap-2">
                  <span className="font-display text-5xl font-bold text-foreground">{plan.price}</span>
                  {plan.unit && <span className="text-sm text-muted-foreground">{plan.unit}</span>}
                </p>
                {plan.features.length > 0 && (
                  <ul className="mt-6 flex flex-1 flex-col gap-3">
                    {plan.features.map((feature, fi) => (
                      <li key={`${feature}-${fi}`} className="flex gap-3 text-muted-foreground">
                        <Check className="mt-0.5 size-4 shrink-0 text-crimson" aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
                {showContact && (
                  <a href="#contact" className={cn('mt-8 justify-center', plan.featured ? 'btn-slant' : 'btn-slant-ghost')}>
                    Enquire
                  </a>
                )}
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  )
}
