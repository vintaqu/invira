// AI Service — uses Groq (free) with Gemini fallback. No paid API required.

export type EventTone = 'romantic' | 'elegant' | 'fun' | 'corporate' | 'religious' | 'modern' | 'funny' | 'warm' | 'proud' | 'nostalgic' | 'inspiring'
export type EventTypeAI = 'WEDDING' | 'BIRTHDAY' | 'CORPORATE' | 'BAPTISM' | 'ANNIVERSARY' | 'OTHER'

interface GenerateEventTextInput {
  type: EventTypeAI
  tone: EventTone
  coupleNames?: string
  eventDate: Date
  venueName?: string
  locale: 'es' | 'en' | 'ca' | 'fr'
  additionalContext?: string
}

const FALLBACK_TEXT = {
  headline:     'Un día para recordar siempre',
  subheadline:  'Os esperamos para compartir este momento tan especial',
  description:  'Con mucha ilusión os invitamos a acompañarnos en este día tan especial. Vuestra presencia es el mejor regalo.',
  rsvpText:     'Confirma tu asistencia antes del plazo indicado',
  footerMessage:'¡Hasta pronto! Con todo nuestro cariño.',
  hashtag:      '#EventoEspecial',
}

async function callGroq(prompt: string): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 600,
      temperature: 0.8,
    }),
  })
  if (!res.ok) throw new Error(`Groq ${res.status}`)
  const d = await res.json()
  return d.choices?.[0]?.message?.content?.trim() ?? ''
}

async function callGemini(prompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 600, temperature: 0.8 },
      }),
    }
  )
  if (!res.ok) throw new Error(`Gemini ${res.status}`)
  const d = await res.json()
  return d.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''
}

async function generate(prompt: string): Promise<string> {
  if (process.env.GROQ_API_KEY) {
    try { return await callGroq(prompt) } catch (e) { console.warn('[AI] Groq failed:', e) }
  }
  if (process.env.GEMINI_API_KEY) {
    try { return await callGemini(prompt) } catch (e) { console.warn('[AI] Gemini failed:', e) }
  }
  return ''
}

export class AIService {
  static async generateEventText(input: GenerateEventTextInput) {
    const toneDesc: Record<string, string> = {
      romantic:   'poético, emotivo y lleno de amor',
      elegant:    'formal, refinado y sofisticado',
      fun:        'festivo, alegre y celebratorio',
      corporate:  'profesional, claro y conciso',
      religious:  'espiritual, respetuoso y tradicional',
      modern:     'minimalista, fresco y contemporáneo',
      funny:      'con mucho humor, gracioso y desenfadado',
      warm:       'cálido, cercano y familiar',
      proud:      'orgulloso del logro, emotivo y celebratorio',
      nostalgic:  'nostálgico, entrañable y emotivo',
      inspiring:  'inspirador, motivador y positivo',
    }
    const typeDesc: Record<EventTypeAI, string> = {
      WEDDING: 'boda', BIRTHDAY: 'cumpleaños', CORPORATE: 'evento corporativo',
      BAPTISM: 'bautizo', ANNIVERSARY: 'aniversario', OTHER: 'celebración especial',
    }

    const prompt = `Eres experto en redacción de invitaciones para eventos especiales.
Genera texto para una invitación digital de ${typeDesc[input.type]}.
Protagonistas: ${input.coupleNames ?? 'No especificado'}
Fecha: ${new Date(input.eventDate).toLocaleDateString('es-ES', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
Lugar: ${input.venueName ?? 'No especificado'}
Tono: ${(toneDesc as any)[input.tone] ?? "cálido y cercano"}
Idioma: ${input.locale}
${input.additionalContext ? `Contexto: ${input.additionalContext}` : ''}

Responde SOLO con este JSON sin markdown:
{"headline":"Frase principal (máx 8 palabras)","subheadline":"Subtítulo (máx 15 palabras)","description":"Párrafo bienvenida (2-3 frases)","rsvpText":"CTA para RSVP (1 frase)","footerMessage":"Cierre cálido (1-2 frases)","hashtag":"#HashtagPersonalizado"}`

    const raw = await generate(prompt)
    if (!raw) {
      console.log('[AI] No API available, using fallback')
      return FALLBACK_TEXT
    }
    try {
      const clean = raw.replace(/```json|```/g, '').trim()
      return JSON.parse(clean)
    } catch {
      return FALLBACK_TEXT
    }
  }

  static async generateDesignSuggestion(input: { type: EventTypeAI; tone: EventTone }) {
    const defaults: Record<EventTypeAI, object> = {
      WEDDING:     { primaryColor: '#2d3a2e', accentColor: '#c8a882', fontFamily: 'playfair' },
      BIRTHDAY:    { primaryColor: '#6c3fa0', accentColor: '#f0a500', fontFamily: 'inter' },
      CORPORATE:   { primaryColor: '#1a1a1a', accentColor: '#84C5BC', fontFamily: 'inter' },
      BAPTISM:     { primaryColor: '#1e3a5f', accentColor: '#84C5BC', fontFamily: 'great-vibes' },
      ANNIVERSARY: { primaryColor: '#4a3728', accentColor: '#c8a882', fontFamily: 'great-vibes' },
      OTHER:       { primaryColor: '#1a1a1a', accentColor: '#84C5BC', fontFamily: 'inter' },
    }
    return defaults[input.type] ?? defaults.OTHER
  }

  static async translate(content: Record<string, string>, targetLocale: string) {
    const prompt = `Traduce al ${targetLocale === 'en' ? 'inglés' : targetLocale} este JSON de invitación, manteniendo el formato exacto:
${JSON.stringify(content)}
Responde SOLO con el JSON traducido, sin markdown.`

    const raw = await generate(prompt)
    if (!raw) return content
    try {
      return JSON.parse(raw.replace(/```json|```/g, '').trim())
    } catch {
      return content
    }
  }

  static async suggestSongs(eventType: EventTypeAI, tone: EventTone, count = 10) {
    const prompt = `Sugiere ${count} canciones perfectas para una ${eventType === 'WEDDING' ? 'boda' : 'celebración'} con tono ${tone}.
Responde SOLO con JSON array: [{"title":"...","artist":"...","reason":"Por qué encaja (1 frase)"}]
Sin markdown.`

    const raw = await generate(prompt)
    if (!raw) return []
    try {
      const clean = raw.replace(/```json|```/g, '').trim()
      return JSON.parse(clean)
    } catch {
      return []
    }
  }
}
