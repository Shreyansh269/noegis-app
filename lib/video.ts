/**
 * Converts a normal YouTube or Vimeo URL into an embeddable player URL.
 * Returns null for anything else so callers can fall back to a plain link.
 */
export function toEmbedUrl(rawUrl: string): string | null {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null

  const host = url.hostname.replace(/^www\.|^m\./, '')
  const ytId = /^[\w-]{11}$/

  if (host === 'youtu.be') {
    const id = url.pathname.slice(1).split('/')[0]
    return ytId.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null
  }

  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const parts = url.pathname.split('/').filter(Boolean)
    let id: string | null = null
    if (parts[0] === 'watch') id = url.searchParams.get('v')
    else if (['embed', 'shorts', 'live', 'v'].includes(parts[0] ?? '')) id = parts[1] ?? null
    return id && ytId.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null
  }

  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = url.pathname.split('/').filter(Boolean).find((p) => /^\d+$/.test(p))
    return id ? `https://player.vimeo.com/video/${id}` : null
  }

  return null
}
