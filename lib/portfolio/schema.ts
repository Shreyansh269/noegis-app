import { z } from 'zod'

/**
 * Shared Zod schemas for portfolio content. Used by the admin dashboard
 * (client-side validation) and by server actions (authoritative validation).
 */

/** Removes HTML tags and control characters, then trims. */
const sanitize = (value: string) =>
  value
    .replace(/<[^>]*>/g, '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()

const text = (max: number) => z.string().max(max).transform(sanitize)
const requiredText = (max: number, label: string) =>
  z
    .string()
    .max(max)
    .transform(sanitize)
    .refine((v) => v.length > 0, `${label} is required`)

const isHttpUrl = (value: string) => {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/** Optional http(s) URL. Empty string means "not set". */
export const optionalUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((v) => v === '' || isHttpUrl(v), 'Only http:// or https:// URLs are allowed')

/** Uploaded image: an http(s) Blob URL or our private-blob media route. */
export const imageUrl = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (v) => v === '' || isHttpUrl(v) || v.startsWith('/api/media?pathname='),
    'Invalid image URL',
  )

const id = z.string().min(1).max(64)

export const socialLinkSchema = z.object({
  id,
  label: requiredText(40, 'Social label'),
  url: optionalUrl.refine((v) => v !== '', 'Social URL is required'),
})

export const profileSchema = z.object({
  fullName: requiredText(80, 'Full name'),
  portfolioId: requiredText(40, 'Portfolio ID'),
  title: text(120),
  tagline: text(240),
  about: text(4000),
  email: z
    .string()
    .trim()
    .max(254)
    .refine((v) => v === '' || z.email().safeParse(v).success, 'Invalid email address'),
  phone: text(40),
  location: text(120),
  photoUrl: imageUrl,
  socials: z.array(socialLinkSchema).max(20),
})

export const qualificationSchema = z.object({
  id,
  title: requiredText(160, 'Qualification title'),
  institution: text(160),
  years: text(40),
  details: text(1000),
})

export const skillSchema = z.object({
  id,
  name: requiredText(80, 'Skill name'),
  description: text(500),
  level: z.coerce.number().int().min(0).max(100),
})

export const projectSchema = z.object({
  id,
  title: requiredText(120, 'Project title'),
  description: text(1500),
  tags: z.array(text(30)).max(12),
  projectUrl: optionalUrl,
  videoUrl: optionalUrl,
  coverUrl: imageUrl,
})

export const videoSchema = z.object({
  id,
  title: requiredText(120, 'Video title'),
  description: text(1000),
  url: optionalUrl.refine((v) => v !== '', 'Video URL is required'),
})

export const pricingSchema = z.object({
  id,
  name: requiredText(80, 'Plan name'),
  price: requiredText(40, 'Price'),
  unit: text(40),
  features: z.array(text(160)).max(20),
  featured: z.boolean(),
})

export const SECTION_KEYS = [
  'about',
  'qualifications',
  'skills',
  'projects',
  'videos',
  'pricing',
  'contact',
] as const
export type SectionKey = (typeof SECTION_KEYS)[number]

export const settingsSchema = z.object({
  seoTitle: text(120),
  metaDescription: text(300),
  ogImageUrl: imageUrl,
  sections: z.object({
    about: z.boolean(),
    qualifications: z.boolean(),
    skills: z.boolean(),
    projects: z.boolean(),
    videos: z.boolean(),
    pricing: z.boolean(),
    contact: z.boolean(),
  }),
})

export const portfolioSchema = z.object({
  profile: profileSchema,
  qualifications: z.array(qualificationSchema).max(50),
  skills: z.array(skillSchema).max(50),
  projects: z.array(projectSchema).max(50),
  videos: z.array(videoSchema).max(50),
  pricing: z.array(pricingSchema).max(20),
  settings: settingsSchema,
})

export type Portfolio = z.infer<typeof portfolioSchema>
export type Profile = Portfolio['profile']
export type SocialLink = Profile['socials'][number]
export type Qualification = Portfolio['qualifications'][number]
export type Skill = Portfolio['skills'][number]
export type Project = Portfolio['projects'][number]
export type Video = Portfolio['videos'][number]
export type PricingPlan = Portfolio['pricing'][number]
export type Settings = Portfolio['settings']

/** Formats the first Zod issue into a human-readable message. */
export function firstIssue(error: z.ZodError): string {
  const issue = error.issues[0]
  if (!issue) return 'Invalid data'
  const path = issue.path.join(' › ')
  return path ? `${path}: ${issue.message}` : issue.message
}

export const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)
