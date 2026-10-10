'use client'

import type { ReactNode } from 'react'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function ListEditor<T extends { id: string }>({
  items,
  onChange,
  createItem,
  itemLabel,
  getTitle,
  renderItem,
  max = 50,
}: {
  items: T[]
  onChange: (items: T[]) => void
  createItem: () => T
  itemLabel: string
  getTitle: (item: T) => string
  renderItem: (item: T, update: (patch: Partial<T>) => void) => ReactNode
  max?: number
}) {
  const update = (id: string, patch: Partial<T>) =>
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  const move = (index: number, dir: -1 | 1) => {
    const next = [...items]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }
  const remove = (id: string) => onChange(items.filter((item) => item.id !== id))

  return (
    <div className="flex flex-col gap-4">
      {items.length === 0 && (
        <p className="border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No {itemLabel.toLowerCase()}s yet. This section is hidden on the site while it&apos;s empty.
        </p>
      )}
      {items.map((item, index) => {
        const title = getTitle(item) || `Untitled ${itemLabel.toLowerCase()}`
        return (
          <fieldset key={item.id} className="tech-card flex flex-col gap-4 p-5">
            <div className="flex items-center justify-between gap-3">
              <legend className="font-display text-lg font-bold uppercase tracking-wide text-foreground">
                <span className="mr-2 text-crimson">{String(index + 1).padStart(2, '0')}</span>
                {title}
              </legend>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  aria-label={`Move ${title} up`}
                >
                  <ArrowUp aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={index === items.length - 1}
                  onClick={() => move(index, 1)}
                  aria-label={`Move ${title} down`}
                >
                  <ArrowDown aria-hidden="true" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button type="button" variant="ghost" size="icon-sm" aria-label={`Delete ${title}`}>
                        <Trash2 className="text-crimson" aria-hidden="true" />
                      </Button>
                    }
                  />
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this {itemLabel.toLowerCase()}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        &ldquo;{title}&rdquo; will be removed. The change goes live when you save.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction variant="destructive" onClick={() => remove(item.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            {renderItem(item, (patch) => update(item.id, patch))}
          </fieldset>
        )
      })}
      <Button
        type="button"
        variant="outline"
        className="self-start"
        disabled={items.length >= max}
        onClick={() => onChange([...items, createItem()])}
      >
        <Plus aria-hidden="true" />
        Add {itemLabel.toLowerCase()}
      </Button>
    </div>
  )
}
