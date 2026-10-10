import { type NextRequest, NextResponse } from 'next/server'
import { get } from '@vercel/blob'

/** Streams portfolio images from the private Blob store. Images are public site content. */
export async function GET(request: NextRequest) {
  const pathname = request.nextUrl.searchParams.get('pathname')
  if (!pathname || !/^portfolio\/[\w-]+\.(jpe?g|png|webp|gif|avif)$/i.test(pathname)) {
    return NextResponse.json({ error: 'Invalid pathname' }, { status: 400 })
  }

  try {
    const result = await get(pathname, {
      access: 'private',
      ifNoneMatch: request.headers.get('if-none-match') ?? undefined,
    })
    if (!result) return new NextResponse('Not found', { status: 404 })

    const cacheHeaders = {
      ETag: result.blob.etag,
      // Uploaded file names are unique and never overwritten, so they can be cached long-term.
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    }
    if (result.statusCode === 304) return new NextResponse(null, { status: 304, headers: cacheHeaders })

    return new NextResponse(result.stream, {
      headers: { ...cacheHeaders, 'Content-Type': result.blob.contentType },
    })
  } catch (error) {
    console.error('Error serving media:', error)
    return NextResponse.json({ error: 'Failed to load file' }, { status: 500 })
  }
}
