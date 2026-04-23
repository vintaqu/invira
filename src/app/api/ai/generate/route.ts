export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AIService } from '@/modules/ai/ai.service'
import { z } from 'zod'

const schema = z.object({
  action: z.enum(['text', 'design', 'translate', 'songs']),
  type: z.string().optional(),
  tone: z.string().optional(),
  coupleNames: z.string().nullish().transform(v => v ?? undefined),
  eventDate: z.union([z.string(), z.date()]).nullish().transform(v => v ? String(v) : undefined),
  venueName: z.string().nullish().transform(v => v ?? undefined),
  locale: z.string().nullish().transform(v => v ?? 'es'),
  additionalContext: z.string().nullish().transform(v => v ?? undefined),
  content: z.record(z.string()).nullish().transform(v => v ?? undefined),
  count: z.number().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const data = schema.parse(body)

    let result

    switch (data.action) {
      case 'text':
        result = await AIService.generateEventText({
          type: data.type as any,
          tone: data.tone as any,
          coupleNames: data.coupleNames,
          eventDate: data.eventDate ? new Date(data.eventDate) : new Date(),
          venueName: data.venueName,
          locale: (data.locale as any) ?? 'es',
          additionalContext: data.additionalContext,
        })
        break
      case 'design':
        result = await AIService.generateDesignSuggestion({ type: data.type as any, tone: data.tone as any })
        break
      case 'translate':
        result = await AIService.translate(data.content ?? {}, data.locale ?? 'en')
        break
      case 'songs':
        result = await AIService.suggestSongs(data.type as any, data.tone as any, data.count)
        break
    }

    return NextResponse.json({ result })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('[AI] Zod validation error:', JSON.stringify(error.errors))
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('[AI]', error)
    return NextResponse.json({ error: (error as any)?.message ?? 'Internal server error' }, { status: 500 })
  }
}
