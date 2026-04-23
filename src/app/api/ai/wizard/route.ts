export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const TONE_MAP: Record<string, string> = {
  'Romántico':   'romántico y emotivo',
  'Formal':      'formal y elegante',
  'Divertido':   'alegre y divertido',
  'Emotivo':     'emotivo y sentido',
  'Familiar':    'cercano y familiar',
  'Religioso':   'espiritual y religioso',
  'Profesional': 'profesional y corporativo',
  'Inspirador':  'motivador e inspirador',
  'Informal':    'informal entre amigos',
  'Orgulloso':   'orgulloso y emocionado',
  'Nostálgico':  'nostálgico',
  'Cálido':      'cálido y acogedor',
  'Emocionante': 'emocionante',
  'Poético':     'poético y literario',
  'Especial':    'especial y único',
  'Alegre':      'alegre y festivo',
  'Íntimo':      'íntimo y personal',
  'Dulce':       'dulce y tierno',
  'Ejecutivo':   'ejecutivo y directo',
  'Sorpresa':    'misterioso y sorprendente',
}

const TYPE_LABEL: Record<string, string> = {
  WEDDING:     'boda',
  BIRTHDAY:    'cumpleaños',
  BAPTISM:     'bautizo',
  GRADUATION:  'graduación',
  ANNIVERSARY: 'aniversario',
  QUINCEANERA: 'quinceañera',
  CORPORATE:   'evento corporativo',
  OTHER:       'celebración',
}

const FALLBACKS: Record<string, string> = {
  WEDDING:     'Con toda nuestra ilusión y amor, os invitamos a compartir el día más especial de nuestras vidas.',
  BIRTHDAY:    'Este año quiero celebrarlo rodeado de las personas más importantes para mí.',
  BAPTISM:     'Con mucha ilusión y gratitud os compartimos este momento tan especial para nuestra familia.',
  GRADUATION:  'Después de mucho esfuerzo y dedicación, ha llegado el momento de celebrarlo con quienes más quiero.',
  ANNIVERSARY: 'Cada año junto a ti es un regalo. Gracias por este camino recorrido juntos.',
  QUINCEANERA: 'Con toda la ilusión del mundo, os invito a celebrar este momento tan especial conmigo.',
  CORPORATE:   'Tenemos el placer de invitaros a un evento que marcará un hito en nuestra trayectoria.',
  OTHER:       'Con mucha alegría os invitamos a compartir este momento especial.',
}

function buildPrompt(eventType: string, names: string, dateStr: string, placeStr: string, tone: string) {
  const toneDesc = TONE_MAP[tone] || 'cálido y cercano'
  return `Escribe el texto de bienvenida para una invitación de ${TYPE_LABEL[eventType] ?? 'celebración'} de ${names}${dateStr ? `, ${dateStr}` : ''}${placeStr ? `, ${placeStr}` : ''}.
Tono: ${toneDesc}.
Máximo 2-3 frases cortas. Sin saludo inicial ni firma. Solo el cuerpo del mensaje. Sin comillas ni explicaciones.`
}

async function generateWithGroq(prompt: string): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150,
      temperature: 0.8,
    }),
  })
  if (!res.ok) throw new Error(`Groq error: ${res.status}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content?.trim() ?? ''
}

async function generateWithGemini(prompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 150, temperature: 0.8 },
      }),
    }
  )
  if (!res.ok) throw new Error(`Gemini error: ${res.status}`)
  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { eventType, name1, name2, date, place, tone } = await req.json()

    const names    = name2 ? `${name1} y ${name2}` : name1
    const dateStr  = date  ? `el ${new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''
    const placeStr = place ? `en ${place}` : ''
    const prompt   = buildPrompt(eventType, names, dateStr, placeStr, tone)

    // Priority: Groq (free) → Gemini (free) → fallback text
    let text = ''

    if (process.env.GROQ_API_KEY) {
      try {
        text = await generateWithGroq(prompt)
        console.log('[AI wizard] Used Groq')
      } catch (e) {
        console.warn('[AI wizard] Groq failed, trying Gemini:', e)
      }
    }

    if (!text && process.env.GEMINI_API_KEY) {
      try {
        text = await generateWithGemini(prompt)
        console.log('[AI wizard] Used Gemini')
      } catch (e) {
        console.warn('[AI wizard] Gemini failed:', e)
      }
    }

    if (!text) {
      console.log('[AI wizard] No API key configured, using fallback text')
      text = FALLBACKS[eventType] ?? FALLBACKS.OTHER
    }

    return NextResponse.json({ text })
  } catch (e: any) {
    console.error('[AI wizard]', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
