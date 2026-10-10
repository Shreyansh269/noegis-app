import type { Metadata } from 'next'
import { getPortfolio } from '@/lib/portfolio/data'
import { getSiteUrl } from '@/lib/site-url'
import { Hero } from '@/components/portfolio/hero'
import { SiteNav, type NavLink } from '@/components/portfolio/site-nav'
import { SiteFooter } from '@/components/portfolio/site-footer'
import { ContactSection } from '@/components/portfolio/contact-section'
import {
  AboutSection,
  PricingSection,
  ProjectsSection,
  QualificationsSection,
  SkillsSection,
  VideosSection,
} from '@/components/portfolio/sections'

// Static with periodic refresh; admin saves revalidate this page immediately.
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const { profile, settings } = await getPortfolio()
  const title = settings.seoTitle || `${profile.fullName} — Portfolio`
  const description = settings.metaDescription || profile.tagline
  const images = settings.ogImageUrl
    ? [settings.ogImageUrl]
    : profile.photoUrl
      ? [profile.photoUrl]
      : undefined
  return {
    title,
    description,
    alternates: { canonical: '/' },
    openGraph: { type: 'profile', title, description, url: '/', images },
    twitter: { card: images ? 'summary_large_image' : 'summary', title, description, images },
  }
}

export default async function HomePage() {
  const portfolio = await getPortfolio()
  const { profile, settings } = portfolio
  const s = settings.sections
  const contactFormEnabled = Boolean(process.env.RESEND_API_KEY)
  const hasContactInfo = Boolean(profile.email || profile.phone || profile.location || profile.socials.length)

  const sections = [
    { key: 'about', label: 'About', show: s.about && Boolean(profile.about) },
    { key: 'qualifications', label: 'Qualifications', show: s.qualifications && portfolio.qualifications.length > 0 },
    { key: 'skills', label: 'Skills', show: s.skills && portfolio.skills.length > 0 },
    { key: 'projects', label: 'Projects', show: s.projects && portfolio.projects.length > 0 },
    { key: 'videos', label: 'Videos', show: s.videos && portfolio.videos.length > 0 },
    { key: 'pricing', label: 'Pricing', show: s.pricing && portfolio.pricing.length > 0 },
    { key: 'contact', label: 'Contact', show: s.contact && (hasContactInfo || contactFormEnabled) },
  ].filter((x) => x.show)

  const indexOf = (key: string) => String(sections.findIndex((x) => x.key === key) + 1).padStart(2, '0')
  const visible = new Set(sections.map((x) => x.key))
  const links: NavLink[] = sections.map((x) => ({ href: `#${x.key}`, label: x.label }))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.fullName,
    jobTitle: profile.title || undefined,
    description: profile.tagline || undefined,
    email: profile.email ? `mailto:${profile.email}` : undefined,
    telephone: profile.phone || undefined,
    address: profile.location ? { '@type': 'PostalAddress', addressLocality: profile.location } : undefined,
    image: profile.photoUrl || undefined,
    url: getSiteUrl(),
    sameAs: profile.socials.map((x) => x.url),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <SiteNav name={profile.fullName} links={links} />
      <main>
        <Hero profile={profile} showContact={visible.has('contact')} />
        {visible.has('about') && <AboutSection index={indexOf('about')} profile={profile} />}
        {visible.has('qualifications') && (
          <QualificationsSection index={indexOf('qualifications')} items={portfolio.qualifications} />
        )}
        {visible.has('skills') && <SkillsSection index={indexOf('skills')} items={portfolio.skills} />}
        {visible.has('projects') && <ProjectsSection index={indexOf('projects')} items={portfolio.projects} />}
        {visible.has('videos') && <VideosSection index={indexOf('videos')} items={portfolio.videos} />}
        {visible.has('pricing') && (
          <PricingSection index={indexOf('pricing')} items={portfolio.pricing} showContact={visible.has('contact')} />
        )}
        {visible.has('contact') && (
          <ContactSection index={indexOf('contact')} profile={profile} formEnabled={contactFormEnabled} />
        )}
      </main>
      <SiteFooter profile={profile} />
    </>
  )
}
