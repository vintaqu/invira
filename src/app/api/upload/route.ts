export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file    = formData.get('file') as File | null
    const eventId = formData.get('eventId') as string | null
    const type    = (formData.get('type') as string) ?? 'image'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate MIME type — only allow images and audio
    const ALLOWED_TYPES: Record<string, string[]> = {
      image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      audio: ['audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/wav'],
    }
    const allowed = ALLOWED_TYPES[type] ?? ALLOWED_TYPES.image
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: `Tipo de archivo no permitido: ${file.type}` }, { status: 400 })
    }

    // Validate file size (10MB max for images, 50MB for audio)
    const maxSize = type === 'audio' ? 50 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: `Archivo demasiado grande (máx ${type === 'audio' ? '50' : '10'}MB)` }, { status: 400 })
    }

    // Rate limit uploads per user: 20 per hour
    const { checkRateLimit, rateLimitResponse } = await import('@/lib/rateLimit')
    if (!checkRateLimit(`upload:${session.user.id}`, 20, 60 * 60_000)) {
      return rateLimitResponse(3600)
    }

    const bytes  = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const cloudinaryOk = !!(
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_KEY !== 'placeholder' &&
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_CLOUD_NAME !== 'placeholder'
    )

    let url: string
    let publicId: string

    if (cloudinaryOk) {
      // ── PRODUCTION: Cloudinary ────────────────────────────
      const { v2: cloudinary } = await import('cloudinary')
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
        api_key:    process.env.CLOUDINARY_API_KEY!,
        api_secret: process.env.CLOUDINARY_API_SECRET!,
      })
      const base64 = `data:${file.type};base64,${buffer.toString('base64')}`
      const folder  = eventId ? `invitely/events/${eventId}` : 'invitely/general'
      const result  = await cloudinary.uploader.upload(base64, {
        folder,
        resource_type: 'auto',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      })
      url      = result.secure_url
      publicId = result.public_id

    } else {
      // ── DEV MODE: try filesystem, fallback to base64 data URL ──
      console.log('[Upload] DEV MODE — Cloudinary not configured')

      let savedToFs = false

      try {
        const path = await import('path')
        const fs   = await import('fs/promises')
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
        await fs.mkdir(uploadsDir, { recursive: true })
        const ext      = (file.name.split('.').pop() ?? 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        await fs.writeFile(path.join(uploadsDir, filename), buffer)
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
        url      = `${appUrl}/uploads/${filename}`
        publicId = `local/${filename}`
        savedToFs = true
        console.log('[Upload] Saved to filesystem:', url)
      } catch (fsErr: any) {
        // Filesystem failed (permissions, read-only) → use base64 data URL
        console.warn('[Upload] Filesystem save failed, using base64 data URL:', fsErr.message)
        // For audio files, don't use data URLs (too large and won't persist)
        if (type === 'audio') {
          return NextResponse.json({
            error: 'Para subir audio configura Cloudinary en .env.local'
          }, { status: 503 })
        }
        // Convert to base64 data URL — works in dev, not for production
        url      = `data:${file.type};base64,${buffer.toString('base64')}`
        publicId = `dataurl/${Date.now()}`
        console.log('[Upload] Using base64 data URL (dev only, not persistent)')
      }
    }

    // Try to save to DB (non-blocking)
    if (eventId) {
      try {
        const { prisma } = await import('@/lib/prisma')
        await prisma.media.create({
          data: { eventId, url, publicId, type, size: file.size },
        })
      } catch (dbErr: any) {
        console.warn('[Upload] DB save skipped (non-critical):', dbErr?.message?.slice(0, 100))
      }
    }

    return NextResponse.json({ media: { url, publicId, type } })

  } catch (error: any) {
    const msg = error?.message ?? String(error)
    console.error('[Upload] FATAL:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
