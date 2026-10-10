'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { ExternalLink, Loader2, LogOut, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { firstIssue, portfolioSchema, type Portfolio } from '@/lib/portfolio/schema'
import { logoutAction, savePortfolioAction } from '@/app/admin/actions'
import {
  PricingEditor,
  ProfileEditor,
  ProjectsEditor,
  QualificationsEditor,
  SettingsEditor,
  SkillsEditor,
  VideosEditor,
} from './editors'

const TABS = [
  { value: 'profile', label: 'Profile' },
  { value: 'qualifications', label: 'Qualifications' },
  { value: 'skills', label: 'Skills' },
  { value: 'projects', label: 'Projects' },
  { value: 'videos', label: 'Videos' },
  { value: 'pricing', label: 'Pricing' },
  { value: 'settings', label: 'Settings' },
] as const

export function AdminDashboard({ initial, ownerEmail }: { initial: Portfolio; ownerEmail: string }) {
  const [data, setData] = useState<Portfolio>(initial)
  const [saved, setSaved] = useState(() => JSON.stringify(initial))
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null)
  const [saving, startSaving] = useTransition()
  const dirty = useMemo(() => JSON.stringify(data) !== saved, [data, saved])

  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const set = <K extends keyof Portfolio>(key: K, value: Portfolio[K]) => {
    setStatus(null)
    setData((d) => ({ ...d, [key]: value }))
  }

  function save() {
    const parsed = portfolioSchema.safeParse(data)
    if (!parsed.success) return setStatus({ ok: false, text: firstIssue(parsed.error) })
    startSaving(async () => {
      const res = await savePortfolioAction(data).catch(() => ({ ok: false as const, error: 'Request failed' }))
      if (res.ok) {
        setSaved(JSON.stringify(data))
        setStatus({ ok: true, text: 'Saved — your site is updated.' })
      } else setStatus({ ok: false, text: res.error })
    })
  }

  return (
    <div className="min-h-svh bg-ink">
      <header className="sticky top-0 z-40 border-b border-border bg-ink/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-3">
          <div>
            <h1 className="font-display text-xl font-bold uppercase tracking-[0.2em]">
              <span className="text-crimson">Admin</span> // Portfolio
            </h1>
            <p className="text-xs text-muted-foreground">{ownerEmail}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span aria-live="polite" className="text-xs text-muted-foreground">
              {dirty ? 'Unsaved changes' : 'All changes saved'}
            </span>
            <Button variant="ghost" size="sm" render={<a href="/" target="_blank" rel="noopener noreferrer" />}>
              <ExternalLink aria-hidden="true" />
              View site
            </Button>
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="sm">
                <LogOut aria-hidden="true" />
                Log out
              </Button>
            </form>
            <Button size="sm" onClick={save} disabled={saving || !dirty} className="bg-crimson text-white hover:bg-crimson/90">
              {saving ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Save aria-hidden="true" />}
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </div>
        {status && (
          <p
            role={status.ok ? 'status' : 'alert'}
            className={
              status.ok
                ? 'border-t border-border bg-surface px-5 py-2 text-center text-sm text-foreground'
                : 'border-t border-crimson/40 bg-wine-dark px-5 py-2 text-center text-sm text-white'
            }
          >
            {status.text}
          </p>
        )}
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8">
        <Tabs defaultValue="profile" className="flex flex-col gap-6">
          <TabsList className="h-auto w-full flex-wrap justify-start">
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value} className="font-display uppercase tracking-widest">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="profile">
            <ProfileEditor value={data.profile} onChange={(v) => set('profile', v)} />
          </TabsContent>
          <TabsContent value="qualifications">
            <QualificationsEditor value={data.qualifications} onChange={(v) => set('qualifications', v)} />
          </TabsContent>
          <TabsContent value="skills">
            <SkillsEditor value={data.skills} onChange={(v) => set('skills', v)} />
          </TabsContent>
          <TabsContent value="projects">
            <ProjectsEditor value={data.projects} onChange={(v) => set('projects', v)} />
          </TabsContent>
          <TabsContent value="videos">
            <VideosEditor value={data.videos} onChange={(v) => set('videos', v)} />
          </TabsContent>
          <TabsContent value="pricing">
            <PricingEditor value={data.pricing} onChange={(v) => set('pricing', v)} />
          </TabsContent>
          <TabsContent value="settings">
            <SettingsEditor value={data.settings} onChange={(v) => set('settings', v)} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
