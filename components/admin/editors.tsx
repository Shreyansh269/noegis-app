'use client'

import { useId, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  newId,
  SECTION_KEYS,
  type PricingPlan,
  type Profile,
  type Project,
  type Qualification,
  type Settings,
  type Skill,
  type SocialLink,
  type Video,
} from '@/lib/portfolio/schema'
import { changePasswordAction } from '@/app/admin/actions'
import { ImageField, ListTextField, TextAreaField, TextField } from './fields'
import { ListEditor } from './list-editor'

export function ProfileEditor({ value, onChange }: { value: Profile; onChange: (v: Profile) => void }) {
  const set = <K extends keyof Profile>(key: K, v: Profile[K]) => onChange({ ...value, [key]: v })
  return (
    <div className="flex flex-col gap-8">
      <div className="tech-card flex flex-col gap-5 p-5">
        <ImageField label="Profile photo" value={value.photoUrl} onChange={(v) => set('photoUrl', v)} />
        <div className="grid gap-5 md:grid-cols-2">
          <TextField label="Full name" value={value.fullName} onChange={(v) => set('fullName', v)} maxLength={80} />
          <TextField
            label="Portfolio ID"
            value={value.portfolioId}
            onChange={(v) => set('portfolioId', v)}
            maxLength={40}
            hint="Shown as a badge in the hero and footer."
          />
          <TextField label="Title / role" value={value.title} onChange={(v) => set('title', v)} maxLength={120} />
          <TextField label="Location" value={value.location} onChange={(v) => set('location', v)} maxLength={120} />
          <TextField label="Email" type="email" value={value.email} onChange={(v) => set('email', v)} maxLength={254} />
          <TextField label="Phone" type="tel" value={value.phone} onChange={(v) => set('phone', v)} maxLength={40} />
        </div>
        <TextField label="Tagline" value={value.tagline} onChange={(v) => set('tagline', v)} maxLength={240} />
        <TextAreaField label="About me" rows={7} value={value.about} onChange={(v) => set('about', v)} maxLength={4000} />
      </div>
      <div className="flex flex-col gap-4">
        <h3 className="font-display text-xl font-bold uppercase tracking-wide">Social links</h3>
        <ListEditor<SocialLink>
          items={value.socials}
          onChange={(v) => set('socials', v)}
          createItem={() => ({ id: newId(), label: '', url: '' })}
          itemLabel="Link"
          getTitle={(s) => s.label}
          max={20}
          renderItem={(s, update) => (
            <div className="grid gap-4 md:grid-cols-[1fr_2fr]">
              <TextField label="Label" value={s.label} onChange={(label) => update({ label })} maxLength={40} />
              <TextField label="URL" type="url" value={s.url} onChange={(url) => update({ url })} placeholder="https://" />
            </div>
          )}
        />
      </div>
    </div>
  )
}

export function QualificationsEditor({ value, onChange }: { value: Qualification[]; onChange: (v: Qualification[]) => void }) {
  return (
    <ListEditor
      items={value}
      onChange={onChange}
      itemLabel="Qualification"
      getTitle={(q) => q.title}
      createItem={() => ({ id: newId(), title: '', institution: '', years: '', details: '' })}
      renderItem={(q, update) => (
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Title" value={q.title} onChange={(title) => update({ title })} maxLength={160} />
          <TextField label="Institution" value={q.institution} onChange={(institution) => update({ institution })} maxLength={160} />
          <TextField label="Years" value={q.years} onChange={(years) => update({ years })} maxLength={40} placeholder="2018 – 2022" />
          <div className="md:col-span-2">
            <TextAreaField label="Details" value={q.details} onChange={(details) => update({ details })} maxLength={1000} />
          </div>
        </div>
      )}
    />
  )
}

export function SkillsEditor({ value, onChange }: { value: Skill[]; onChange: (v: Skill[]) => void }) {
  return (
    <ListEditor
      items={value}
      onChange={onChange}
      itemLabel="Skill"
      getTitle={(s) => s.name}
      createItem={() => ({ id: newId(), name: '', description: '', level: 80 })}
      renderItem={(s, update) => (
        <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
          <TextField label="Name" value={s.name} onChange={(name) => update({ name })} maxLength={80} />
          <TextField
            label="Level (0–100)"
            type="number"
            value={String(s.level)}
            onChange={(v) => update({ level: Math.max(0, Math.min(100, Math.round(Number(v) || 0))) })}
          />
          <div className="md:col-span-2">
            <TextAreaField label="Description" rows={3} value={s.description} onChange={(description) => update({ description })} maxLength={500} />
          </div>
        </div>
      )}
    />
  )
}

export function ProjectsEditor({ value, onChange }: { value: Project[]; onChange: (v: Project[]) => void }) {
  return (
    <ListEditor
      items={value}
      onChange={onChange}
      itemLabel="Project"
      getTitle={(p) => p.title}
      createItem={() => ({ id: newId(), title: '', description: '', tags: [], projectUrl: '', videoUrl: '', coverUrl: '' })}
      renderItem={(p, update) => (
        <div className="flex flex-col gap-4">
          <ImageField label="Cover image" aspect="video" value={p.coverUrl} onChange={(coverUrl) => update({ coverUrl })} />
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Title" value={p.title} onChange={(title) => update({ title })} maxLength={120} />
            <ListTextField label="Tags" hint="Comma separated" value={p.tags} onChange={(tags) => update({ tags })} />
            <TextField label="Project URL" type="url" value={p.projectUrl} onChange={(projectUrl) => update({ projectUrl })} placeholder="https://" />
            <TextField label="Video URL" type="url" value={p.videoUrl} onChange={(videoUrl) => update({ videoUrl })} placeholder="https://" />
          </div>
          <TextAreaField label="Description" value={p.description} onChange={(description) => update({ description })} maxLength={1500} />
        </div>
      )}
    />
  )
}

export function VideosEditor({ value, onChange }: { value: Video[]; onChange: (v: Video[]) => void }) {
  return (
    <ListEditor
      items={value}
      onChange={onChange}
      itemLabel="Video"
      getTitle={(v) => v.title}
      createItem={() => ({ id: newId(), title: '', description: '', url: '' })}
      renderItem={(v, update) => (
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Title" value={v.title} onChange={(title) => update({ title })} maxLength={120} />
          <TextField
            label="Video URL"
            type="url"
            value={v.url}
            onChange={(url) => update({ url })}
            placeholder="https://youtube.com/watch?v=…"
            hint="YouTube and Vimeo links are embedded automatically."
          />
          <div className="md:col-span-2">
            <TextAreaField label="Description" rows={3} value={v.description} onChange={(description) => update({ description })} maxLength={1000} />
          </div>
        </div>
      )}
    />
  )
}

export function PricingEditor({ value, onChange }: { value: PricingPlan[]; onChange: (v: PricingPlan[]) => void }) {
  return (
    <ListEditor
      items={value}
      onChange={onChange}
      itemLabel="Plan"
      max={20}
      getTitle={(p) => p.name}
      createItem={() => ({ id: newId(), name: '', price: '', unit: '', features: [], featured: false })}
      renderItem={(p, update) => (
        <div className="grid gap-4 md:grid-cols-3">
          <TextField label="Plan name" value={p.name} onChange={(name) => update({ name })} maxLength={80} />
          <TextField label="Price" value={p.price} onChange={(price) => update({ price })} maxLength={40} placeholder="$1,200" />
          <TextField label="Unit" value={p.unit} onChange={(unit) => update({ unit })} maxLength={40} placeholder="per project" />
          <div className="md:col-span-3">
            <ListTextField label="Features" hint="One per line" separator={'\n'} value={p.features} onChange={(features) => update({ features })} />
          </div>
          <SwitchRow label="Highlight as recommended" checked={p.featured} onChange={(featured) => update({ featured })} />
        </div>
      )}
    />
  )
}

function SwitchRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  const id = useId()
  return (
    <div className="flex items-center gap-3">
      <Switch id={id} checked={checked} onCheckedChange={(v) => onChange(Boolean(v))} />
      <Label htmlFor={id}>{label}</Label>
    </div>
  )
}

const SECTION_LABELS: Record<(typeof SECTION_KEYS)[number], string> = {
  about: 'About me',
  qualifications: 'Qualifications',
  skills: 'Skills & services',
  projects: 'Projects',
  videos: 'Videos',
  pricing: 'Pricing',
  contact: 'Contact',
}

export function SettingsEditor({ value, onChange }: { value: Settings; onChange: (v: Settings) => void }) {
  return (
    <div className="flex flex-col gap-8">
      <section className="tech-card flex flex-col gap-5 p-5" aria-labelledby="vis-title">
        <h3 id="vis-title" className="font-display text-xl font-bold uppercase tracking-wide">Section visibility</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {SECTION_KEYS.map((key) => (
            <SwitchRow
              key={key}
              label={SECTION_LABELS[key]}
              checked={value.sections[key]}
              onChange={(v) => onChange({ ...value, sections: { ...value.sections, [key]: v } })}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Empty sections are hidden automatically.</p>
      </section>

      <section className="tech-card flex flex-col gap-5 p-5" aria-labelledby="seo-title">
        <h3 id="seo-title" className="font-display text-xl font-bold uppercase tracking-wide">SEO & sharing</h3>
        <TextField
          label="Page title"
          value={value.seoTitle}
          onChange={(seoTitle) => onChange({ ...value, seoTitle })}
          maxLength={120}
          hint="Defaults to “Your Name — Portfolio”."
        />
        <TextAreaField
          label="Meta description"
          rows={3}
          value={value.metaDescription}
          onChange={(metaDescription) => onChange({ ...value, metaDescription })}
          maxLength={300}
          hint="Defaults to your tagline."
        />
        <ImageField
          label="Social share image"
          aspect="video"
          value={value.ogImageUrl}
          onChange={(ogImageUrl) => onChange({ ...value, ogImageUrl })}
        />
      </section>

      <ChangePassword />
    </div>
  )
}

function ChangePassword() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    if (next !== confirm) return setMessage({ ok: false, text: 'New passwords do not match' })
    setPending(true)
    const res = await changePasswordAction(current, next).catch(() => ({ ok: false as const, error: 'Request failed' }))
    setPending(false)
    if (res.ok) {
      setCurrent('')
      setNext('')
      setConfirm('')
      setMessage({ ok: true, text: 'Password updated.' })
    } else setMessage({ ok: false, text: res.error })
  }

  return (
    <form onSubmit={submit} className="tech-card flex flex-col gap-5 p-5" aria-labelledby="pw-title">
      <h3 id="pw-title" className="font-display text-xl font-bold uppercase tracking-wide">Change password</h3>
      <div className="grid gap-4 md:grid-cols-3">
        <TextField label="Current password" type="password" value={current} onChange={setCurrent} />
        <TextField label="New password" type="password" value={next} onChange={setNext} hint="At least 10 characters." />
        <TextField label="Confirm new password" type="password" value={confirm} onChange={setConfirm} />
      </div>
      {message && (
        <p role="status" className={message.ok ? 'text-sm text-foreground' : 'text-sm text-crimson'}>
          {message.text}
        </p>
      )}
      <Button type="submit" variant="outline" className="self-start" disabled={pending || !current || !next}>
        {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
        Update password
      </Button>
    </form>
  )
}
