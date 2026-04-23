'use client'
import { useState, useEffect, useRef } from 'react'

interface TimelineItem {
  id?: string
  title: string
  description: string
  date: string
  imageUrl: string
  icon: string
  position: number
}

const ICONS = ['♡', '✦', '🌸', '💍', '✈️', '🏠', '🎓', '🥂', '🎵', '📸', '🌊', '⭐']
const DEFAULT_ITEMS: TimelineItem[] = [
  { title: 'Nos conocimos', description: 'El día que nuestras vidas cambiaron para siempre', date: '', imageUrl: '', icon: '✦', position: 0 },
  { title: 'Primera cita', description: 'Nervios, risas y el comienzo de algo especial', date: '', imageUrl: '', icon: '♡', position: 1 },
  { title: 'La pedida', description: 'El momento más emocionante de nuestras vidas', date: '', imageUrl: '', icon: '💍', position: 2 },
  { title: '¡Nos casamos!', description: 'Y ahora queremos compartirlo contigo', date: '', imageUrl: '', icon: '🥂', position: 3 },
]

export function TimelineEditor({ eventId }: { eventId: string }) {
  const [items, setItems] = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const saveTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetch(`/api/events/${eventId}/timeline`)
      .then(r => r.json())
      .then(d => {
        setItems(d.items?.length ? d.items : DEFAULT_ITEMS)
        setLoading(false)
      })
  }, [eventId])

  function scheduleAutosave(newItems: TimelineItem[]) {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => doSave(newItems), 1500)
  }

  async function doSave(newItems: TimelineItem[]) {
    setSaving(true)
    try {
      await fetch(`/api/events/${eventId}/timeline`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: newItems }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  function update(index: number, field: keyof TimelineItem, value: string) {
    const next = items.map((item, i) => i === index ? { ...item, [field]: value } : item)
    setItems(next)
    scheduleAutosave(next)
  }

  function addItem() {
    const next = [...items, { title: '', description: '', date: '', imageUrl: '', icon: '✦', position: items.length }]
    setItems(next)
    scheduleAutosave(next)
  }

  function removeItem(index: number) {
    const next = items.filter((_, i) => i !== index).map((item, i) => ({ ...item, position: i }))
    setItems(next)
    scheduleAutosave(next)
  }

  function moveItem(index: number, dir: -1 | 1) {
    const next = [...items]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    const reordered = next.map((item, i) => ({ ...item, position: i }))
    setItems(reordered)
    scheduleAutosave(reordered)
  }

  if (loading) return (
    <div className="flex justify-center py-10">
      <div className="w-6 h-6 border-2 border-[#84C5BC] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const inp = "w-full border border-[#e8e0d2] rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-[#84C5BC] bg-white transition-colors"

  return (
    <div>
      {/* Save indicator */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] uppercase tracking-widest text-[#888]">
          Arrastra para reordenar · Los cambios se guardan automáticamente
        </p>
        <span className={`text-[12px] transition-all ${saved ? 'text-[#1a6b3c]' : saving ? 'text-[#888]' : 'text-transparent'}`}>
          {saved ? '✓ Guardado' : 'Guardando…'}
        </span>
      </div>

      {/* Preview toggle */}
      <div className="bg-[#fff7f0] border border-[#f0d8c0] rounded-xl px-4 py-3 mb-5 flex items-center gap-3">
        <span className="text-[13px] text-[#8a4520]">
          💡 La timeline aparece en la invitación pública como una sección de scroll storytelling antes del RSVP.
        </span>
      </div>

      {/* Items */}
      <div className="flex flex-col gap-3">
        {items.map((item, index) => (
          <div key={index}
            className="bg-white border border-[#e8e0d2] rounded-2xl p-5 relative group hover:border-[#84C5BC] transition-colors">
            {/* Position controls */}
            <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => moveItem(index, -1)} disabled={index === 0}
                className="w-6 h-6 flex items-center justify-center text-[#888] hover:text-[#1a1a1a] bg-[#f5f5f5] rounded disabled:opacity-30 cursor-pointer border-none text-[12px]">
                ↑
              </button>
              <button onClick={() => moveItem(index, 1)} disabled={index === items.length - 1}
                className="w-6 h-6 flex items-center justify-center text-[#888] hover:text-[#1a1a1a] bg-[#f5f5f5] rounded disabled:opacity-30 cursor-pointer border-none text-[12px]">
                ↓
              </button>
              <button onClick={() => removeItem(index)}
                className="w-6 h-6 flex items-center justify-center text-[#ccc] hover:text-[#e24b4a] bg-[#f5f5f5] rounded cursor-pointer border-none text-[14px]">
                ×
              </button>
            </div>

            <div className="flex items-start gap-4">
              {/* Step number + icon selector */}
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-[#fff7f0] border border-[#f0d8c0] flex items-center justify-center text-[18px]">
                  {item.icon}
                </div>
                <span className="text-[10px] text-[#aaa]">#{index + 1}</span>
              </div>

              {/* Fields */}
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div className="col-span-2 grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#aaa] block mb-1.5">Título</label>
                    <input value={item.title} onChange={e => update(index, 'title', e.target.value)}
                      placeholder="Nos conocimos" className={inp} />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-[#aaa] block mb-1.5">Fecha</label>
                    <input type="date" value={item.date} onChange={e => update(index, 'date', e.target.value)}
                      className={inp} />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#aaa] block mb-1.5">Descripción</label>
                  <input value={item.description} onChange={e => update(index, 'description', e.target.value)}
                    placeholder="El día que nuestras vidas cambiaron para siempre" className={inp} />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#aaa] block mb-1.5">URL de foto (opcional)</label>
                  <input value={item.imageUrl} onChange={e => update(index, 'imageUrl', e.target.value)}
                    placeholder="https://…" className={inp} />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#aaa] block mb-1.5">Icono</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {ICONS.map(icon => (
                      <button key={icon} onClick={() => update(index, 'icon', icon)}
                        className={`w-8 h-8 rounded-lg text-[16px] cursor-pointer border transition-all ${
                          item.icon === icon ? 'border-[#84C5BC] bg-[#fff7f0]' : 'border-[#e8e0d2] bg-white hover:border-[#84C5BC]'
                        }`}>
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add button */}
      <button onClick={addItem}
        className="w-full mt-3 text-[13px] text-[#84C5BC] border border-dashed border-[#84C5BC] rounded-2xl py-3 hover:bg-[#fff7f0] transition-colors bg-transparent cursor-pointer">
        + Añadir momento
      </button>
    </div>
  )
}
