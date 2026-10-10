import { type NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { getSession } from '@/lib/auth/server'

const MAX_BYTES = 5 * 1024 * 1024
const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await request.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const ext = EXTENSIONS[file.type]
    if (!ext) return NextResponse.json({ error: 'Use a JPG, PNG, WebP, GIF or AVIF image' }, { status: 400 })
    if (file.size > MAX_BYTES) return NextResponse.json({ error: 'Image must be 5 MB or smaller' }, { status: 400 })

    const blob = await put(`portfolio/${crypto.randomUUID()}.${ext}`, file, {
      access: 'private',
      contentType: file.type,
    })

    return NextResponse.json({ url: `/api/media?pathname=${encodeURIComponent(blob.pathname)}` })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
