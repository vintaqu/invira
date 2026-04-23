'use client'
import { useState, useEffect } from 'react'

interface Discount { pct: number; label: string; until: string | null }
interface Plan {
  slug: string; name: string; price: number; maxEvents: number; maxGuests: number
  features: string[]; notFeatures: string[]; discount: Discount | null; badge: string | null
}

const PLAN_META: Record<string, { color: string; bg: string; desc: string }> = {
  free:     { color:'#6b7c5c', bg:'#f5f7f4', desc:'Sin pago. Solo preview.' },
  esencial: { color:'#1a7a3c', bg:'#f0faf4', desc:'Un evento publicado.' },
  premium:  { color:'#2563eb', bg:'#eff6ff', desc:'Hasta N eventos.' },
}

export default function AdminSettingsPage() {
  const [plans, setPlans]     = useState<Plan[]>([])
  const [saving, setSaving]   = useState<string | null>(null)
  const [saved, setSaved]     = useState<string | null>(null)
  const [error, setError]     = useState<string | null>(null)
  const [editing, setEditing] = useState<Record<string, Plan>>({})
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/pricing')
      .then(r => r.json())
      .then(d => {
        setLoading(false)
        if (d.error) { setLoadError(d.error); return }
        if (d.plans) {
          setPlans(d.plans)
          const map: Record<string, Plan> = {}
          d.plans.forEach((p: Plan) => { map[p.slug] = { ...p } })
          setEditing(map)
        }
      })
      .catch(e => { setLoading(false); setLoadError(e.message) })
  }, [])

  function update(slug: string, key: keyof Plan, value: any) {
    setEditing(prev => ({ ...prev, [slug]: { ...prev[slug], [key]: value } }))
  }

  function updateFeature(slug: string, list: 'features' | 'notFeatures', i: number, val: string) {
    const arr = [...(editing[slug]?.[list] ?? [])]
    arr[i] = val
    update(slug, list, arr)
  }

  function addFeature(slug: string, list: 'features' | 'notFeatures') {
    const arr = [...(editing[slug]?.[list] ?? []), '']
    update(slug, list, arr)
  }

  function removeFeature(slug: string, list: 'features' | 'notFeatures', i: number) {
    const arr = (editing[slug]?.[list] ?? []).filter((_: any, idx: number) => idx !== i)
    update(slug, list, arr)
  }

  async function save(slug: string) {
    setSaving(slug); setError(null)
    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing[slug]),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error)
      setSaved(slug); setTimeout(() => setSaved(null), 2500)
    } catch (e: any) {
      setError(e.message)
    } finally { setSaving(null) }
  }

  const inp = { border:'1px solid #e0e0e0', borderRadius:8, padding:'8px 12px', fontSize:13, outline:'none', fontFamily:'Inter,sans-serif', background:'#fff', width:'100%', boxSizing:'border-box' as const }

  if (loadError) return (
    <div style={{ padding:40, maxWidth:600, fontFamily:'Inter,sans-serif' }}>
      <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:12, padding:'20px 24px' }}>
        <p style={{ fontWeight:600, color:'#dc2626', marginBottom:8 }}>Error al cargar los planes</p>
        <p style={{ fontSize:13, color:'#888', marginBottom:16 }}>{loadError}</p>
        <p style={{ fontSize:13, color:'#888' }}>
          Es probable que la tabla no exista aún. Ejecuta en tu terminal:
        </p>
        <code style={{ display:'block', background:'#1a1a1a', color:'#84C5BC', padding:'10px 14px', borderRadius:8, fontSize:13, marginTop:8 }}>
          npx prisma db push
        </code>
      </div>
    </div>
  )

  if (loading) return (
    <div style={{ padding:40, display:'flex', alignItems:'center', justifyContent:'center', gap:12, color:'#aaa', fontFamily:'Inter,sans-serif' }}>
      <div style={{ width:18, height:18, border:'2px solid #84C5BC', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .7s linear infinite' }} />
      Cargando planes...
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ padding:32, fontFamily:'Inter,sans-serif', maxWidth:1100 }}>
      <div style={{ marginBottom:32 }}>
        <h1 style={{ fontFamily:'Playfair Display,serif', fontWeight:400, fontSize:32, color:'#1a1a1a', marginBottom:6 }}>
          Planes y precios
        </h1>
        <p style={{ fontSize:14, color:'#888', margin:0 }}>
          Configura precios, features y ofertas. Los cambios se reflejan en tiempo real en la web.
        </p>
      </div>

      {error && (
        <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:10, padding:'12px 16px', marginBottom:20, fontSize:13, color:'#dc2626' }}>
          {error}
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))', gap:20 }}>
        {plans.map(plan => {
          const meta = PLAN_META[plan.slug] ?? PLAN_META.free
          const e = editing[plan.slug] ?? plan

          return (
            <div key={plan.slug} style={{ background:'#fff', border:'1px solid #e8e2db', borderRadius:16, overflow:'hidden' }}>
              {/* Header */}
              <div style={{ background: meta.bg, borderBottom:'1px solid #e8e2db', padding:'18px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <p style={{ fontSize:11, letterSpacing:2, textTransform:'uppercase', color: meta.color, margin:'0 0 4px', fontWeight:600 }}>{plan.slug}</p>
                  <input value={e.name} onChange={ev => update(plan.slug,'name',ev.target.value)}
                    style={{ ...inp, width:'auto', fontSize:18, fontFamily:'Playfair Display,serif', fontWeight:400, color:'#1a1a1a', padding:'4px 8px', background:'transparent', border:'1px solid transparent' }}
                    onFocus={ev => ev.target.style.borderColor='#e0e0e0'}
                    onBlur={ev => ev.target.style.borderColor='transparent'} />
                </div>
                {plan.slug !== 'free' && (
                  <div style={{ textAlign:'right' }}>
                    <div style={{ display:'flex', alignItems:'baseline', gap:4 }}>
                      <span style={{ fontSize:12, color:'#aaa' }}>€</span>
                      <input type="number" value={e.price} onChange={ev => update(plan.slug,'price',ev.target.value)}
                        style={{ ...inp, width:80, fontSize:28, fontWeight:600, color:'#1a1a1a', textAlign:'right', padding:'4px 8px', background:'transparent', border:'1px solid transparent' }}
                        onFocus={ev => ev.target.style.borderColor='#e0e0e0'}
                        onBlur={ev => ev.target.style.borderColor='transparent'} />
                    </div>
                    <p style={{ fontSize:11, color:'#aaa', margin:0 }}>pago único</p>
                  </div>
                )}
                {plan.slug === 'free' && (
                  <div style={{ fontSize:24, fontWeight:600, color: meta.color }}>Gratis</div>
                )}
              </div>

              <div style={{ padding:'18px 20px', display:'flex', flexDirection:'column', gap:16 }}>

                {/* Capacidad */}
                {plan.slug !== 'free' && (
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    <div>
                      <label style={{ fontSize:11, letterSpacing:1.5, textTransform:'uppercase', color:'#aaa', display:'block', marginBottom:5 }}>
                        Eventos incluidos
                      </label>
                      <input type="number" value={e.maxEvents} onChange={ev => update(plan.slug,'maxEvents',ev.target.value)} style={inp} />
                      <p style={{ fontSize:11, color:'#bbb', marginTop:3 }}>-1 = ilimitado</p>
                    </div>
                    <div>
                      <label style={{ fontSize:11, letterSpacing:1.5, textTransform:'uppercase', color:'#aaa', display:'block', marginBottom:5 }}>
                        Invitados máx.
                      </label>
                      <input type="number" value={e.maxGuests} onChange={ev => update(plan.slug,'maxGuests',ev.target.value)} style={inp} />
                      <p style={{ fontSize:11, color:'#bbb', marginTop:3 }}>-1 = ilimitado</p>
                    </div>
                  </div>
                )}

                {/* Badge */}
                <div>
                  <label style={{ fontSize:11, letterSpacing:1.5, textTransform:'uppercase', color:'#aaa', display:'block', marginBottom:5 }}>
                    Badge (ej. "Más popular")
                  </label>
                  <input value={e.badge ?? ''} onChange={ev => update(plan.slug,'badge',ev.target.value || null)}
                    placeholder="Vacío = sin badge" style={inp} />
                </div>

                {/* Oferta */}
                <div style={{ background:'#fffbf0', border:'1px solid #fde68a', borderRadius:10, padding:'12px 14px' }}>
                  <p style={{ fontSize:12, fontWeight:600, color:'#92400e', margin:'0 0 10px', letterSpacing:0.5 }}>⚡ Oferta activa</p>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8 }}>
                    <div>
                      <label style={{ fontSize:11, color:'#a16207', display:'block', marginBottom:4 }}>% descuento</label>
                      <input type="number" min="0" max="100"
                        value={e.discount?.pct ?? ''}
                        onChange={ev => update(plan.slug,'discount', ev.target.value ? { ...(e.discount ?? { label:'', until:null }), pct: Number(ev.target.value) } : null)}
                        placeholder="0 = sin oferta" style={{ ...inp, fontSize:13 }} />
                    </div>
                    <div>
                      <label style={{ fontSize:11, color:'#a16207', display:'block', marginBottom:4 }}>Válido hasta</label>
                      <input type="date"
                        value={e.discount?.until ?? ''}
                        onChange={ev => update(plan.slug,'discount', ev.target.value ? { ...(e.discount ?? { pct:0, label:'' }), until: ev.target.value } : { ...(e.discount ?? { pct:0, label:'' }), until: null })}
                        style={{ ...inp, fontSize:13 }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize:11, color:'#a16207', display:'block', marginBottom:4 }}>Etiqueta de oferta</label>
                    <input value={e.discount?.label ?? ''}
                      onChange={ev => update(plan.slug,'discount', e.discount ? { ...e.discount, label: ev.target.value } : null)}
                      placeholder="Ej: Oferta de lanzamiento" style={{ ...inp, fontSize:13 }} />
                  </div>
                  {e.discount?.pct ? (
                    <p style={{ fontSize:12, color:'#1a7a3c', marginTop:8, fontWeight:500 }}>
                      Precio con oferta: €{(e.price * (1 - e.discount.pct / 100)).toFixed(2)}
                    </p>
                  ) : null}
                </div>

                {/* Features incluidas */}
                <div>
                  <label style={{ fontSize:11, letterSpacing:1.5, textTransform:'uppercase', color:'#aaa', display:'block', marginBottom:8 }}>
                    ✓ Incluye
                  </label>
                  <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                    {(e.features ?? []).map((f: string, i: number) => (
                      <div key={i} style={{ display:'flex', gap:6, alignItems:'center' }}>
                        <input value={f} onChange={ev => updateFeature(plan.slug,'features',i,ev.target.value)}
                          style={{ ...inp, flex:1, fontSize:12 }} />
                        <button onClick={() => removeFeature(plan.slug,'features',i)}
                          style={{ background:'none', border:'none', cursor:'pointer', color:'#ddd', fontSize:16, padding:'0 4px', lineHeight:1 }}
                          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color='#ef4444'}
                          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color='#ddd'}>×</button>
                      </div>
                    ))}
                    <button onClick={() => addFeature(plan.slug,'features')}
                      style={{ fontSize:12, color:'#84C5BC', background:'none', border:'1px dashed #84C5BC', borderRadius:7, padding:'6px 12px', cursor:'pointer', textAlign:'left', fontFamily:'Inter,sans-serif' }}>
                      + Añadir feature
                    </button>
                  </div>
                </div>

                {/* Features NO incluidas */}
                <div>
                  <label style={{ fontSize:11, letterSpacing:1.5, textTransform:'uppercase', color:'#aaa', display:'block', marginBottom:8 }}>
                    ✗ No incluye
                  </label>
                  <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                    {(e.notFeatures ?? []).map((f: string, i: number) => (
                      <div key={i} style={{ display:'flex', gap:6, alignItems:'center' }}>
                        <input value={f} onChange={ev => updateFeature(plan.slug,'notFeatures',i,ev.target.value)}
                          style={{ ...inp, flex:1, fontSize:12, color:'#aaa' }} />
                        <button onClick={() => removeFeature(plan.slug,'notFeatures',i)}
                          style={{ background:'none', border:'none', cursor:'pointer', color:'#ddd', fontSize:16, padding:'0 4px', lineHeight:1 }}
                          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color='#ef4444'}
                          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color='#ddd'}>×</button>
                      </div>
                    ))}
                    <button onClick={() => addFeature(plan.slug,'notFeatures')}
                      style={{ fontSize:12, color:'#aaa', background:'none', border:'1px dashed #ddd', borderRadius:7, padding:'6px 12px', cursor:'pointer', textAlign:'left', fontFamily:'Inter,sans-serif' }}>
                      + Añadir exclusión
                    </button>
                  </div>
                </div>

                {/* Save button */}
                <button onClick={() => save(plan.slug)} disabled={saving === plan.slug}
                  style={{ background: saved === plan.slug ? '#1a7a3c' : '#1a1a1a', color:'#fff', border:'none', borderRadius:10, padding:'11px 20px', fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'Inter,sans-serif', transition:'all .2s', opacity: saving === plan.slug ? 0.7 : 1 }}>
                  {saving === plan.slug ? 'Guardando…' : saved === plan.slug ? '✓ Guardado' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
