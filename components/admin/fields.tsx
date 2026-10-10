'use client'

import { useId, useRef, useState, type ReactNode } from 'react'
import { ImageUp, Loader2, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Field({ label, hint, children, id }: { label: string; hint?: string; children: ReactNode; id: string }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function TextField({
  label,
  value,
  onChange,
  hint,
  type = 'text',
  maxLength,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  hint?: string
  type?: string
  maxLength?: number
  placeholder?: string
}) {
  const id = useId()
  return (
    <Field label={label} hint={hint} id={id}>
      <Input
        id={id}
        type={type}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  )
}

export function TextAreaField({
  label,
  value,
  onChange,
  hint,
  rows = 4,
  maxLength,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  hint?: string
  rows?: number
  maxLength?: number
}) {
  const id = useId()
  return (
    <Field label={label} hint={hint} id={id}>
      <Textarea id={id} rows={rows} value={value} maxLength={maxLength} onChange={(e) => onChange(e.target.value)} />
    </Field>
  )
}

/** Comma-separated list editor (e.g. tags). */
export function ListTextField({
  label,
  value,
  onChange,
  hint,
  separator = ',',
}: {
  label: string
  value: string[]
  onChange: (v: string[]) => void
  hint?: string
  separator?: ',' | '\n'
}) {
  const id = useId()
  const [draft, setDraft] = useState(value.join(separator === ',' ? ', ' : '\n'))
  const commit = (raw: string) => {
    setDraft(raw)
    onChange(
      raw
        .split(separator)
        .map((s) => s.trim())
        .filter(Boolean),
    )
  }
  return (
    <Field label={label} hint={hint} id={id}>
      {separator === ',' ? (
        <Input id={id} value={draft} onChange={(e) => commit(e.target.value)} />
      ) : (
        <Textarea id={id} rows={5} value={draft} onChange={(e) => commit(e.target.value)} />
      )}
    </Field>
  )
}

export function ImageField({
  label,
  value,
  onChange,
  aspect = 'square',
}: {
  label: string
  value: string
  onChange: (url: string) => void
  aspect?: 'square' | 'video'
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const id = useId()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function upload(file: File) {
    setError(null)
    if (file.size > 5 * 1024 * 1024) return setError('Image must be 5 MB or smaller')
    setUploading(true)
    try {
      const body = new FormData()
      body.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body })
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string }
      if (!res.ok || !data.url) throw new Error(data.error || 'Upload failed')
      onChange(data.url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <Field label={label} id={id} hint="JPG, PNG, WebP, GIF or AVIF — up to 5 MB.">
      <div className="flex flex-wrap items-center gap-4">
        <div
          className={cn(
            'relative overflow-hidden border border-border bg-surface-2',
            aspect === 'square' ? 'size-24' : 'aspect-video w-40',
          )}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt={`${label} preview`} className="size-full object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center text-xs text-muted-foreground">No image</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void upload(file)
            }}
          />
          <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
            {uploading ? <Loader2 className="animate-spin" aria-hidden="true" /> : <ImageUp aria-hidden="true" />}
            {uploading ? 'Uploading…' : value ? 'Replace' : 'Upload'}
          </Button>
          {value && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange('')}>
              <Trash2 aria-hidden="true" />
              Remove
            </Button>
          )}
        </div>
      </div>
      {error && (
        <p role="alert" className="text-sm text-crimson">
          {error}
        </p>
      )}
    </Field>
  )
}
