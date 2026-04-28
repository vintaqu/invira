'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Event { id: string; title: string; type: string; status: string; eventDate: string }
interface Plan  { slug: string; name: string; price: number; maxEvents: number; discount: { pct: number; label: string; until: string | null } | null }

interface Props {
  currentEventId: string
  onClose: () => void
}

const TYPE_EMOJI: Record<string,string> = {
  WEDDING:'💍', BIRTHDAY:'🎂', CORPORATE:'🏢', BAPTISM:'👶',
  ANNIVERSARY:'🥂', GRADUATION:'🎓', QUINCEANERA:'🌸', OTHER:'✨'
}

export function PublishModal({ currentEventId, onClose }: Props) {
  const router = useRouter()
  const [step, setStep]           = useState<'plan' | 'drafts' | 'pay'>('plan')
  const [plans, setPlans]         = useState<Plan[]>([])
  const [drafts, setDrafts]       = useState<Event[]>([])
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [selectedIds, setSelectedIds]   = useState<string[]>([currentEventId])
  const [paying, setPaying]       = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [promoResult, setPromoResult] = useState<any>(null)
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoError, setPromoError] = useState('')

  useEffect(() => {
    // Load plans
    fetch('/api/pricing').then(r => r.json()).then(d => setPlans(d.plans?.filter((p: Plan) => p.slug !== 'free') ?? []))
    // Load user's draft events
    fetch('/api/events').then(r => r.json()).then(d => {
      const all: Event[] = d.events ?? []
      setDrafts(all.filter(e => e.status === 'DRAFT'))
    })
  }, [])

  function toggleDraft(id: string) {
    if (!selectedPlan) return
    const max = selectedPlan.maxEvents
    if (selectedIds.includes(id)) {
      if (id === currentEventId) return // can't deselect current
      setSelectedIds(prev => prev.filter(x => x !== id))
    } else {
      if (selectedIds.length >= max) return // at max
      setSelectedIds(prev => [...prev, id])
    }
  }

  async function handlePay(method: 'stripe' | 'paypal') {
    if (!selectedPlan) return
    setPaying(true)
    try {
      // Send which events to unlock along with the payment
      const endpoint = method === 'stripe' ? '/api/payments/stripe' : '/api/payments/paypal'
      const res = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventIds: selectedIds,
          planSlug: selectedPlan.slug,
          promoId: promoResult?.promoId,
          // finalPrice intentionally not sent - calculated server-side for security
        }),
      })
      const d = await res.json()
      if (d.url) window.location.href = d.url
      else if (d.approvalUrl) window.location.href = d.approvalUrl
    } catch { setPaying(false) }
  }

  async function applyPromo() {
    if (!promoCode.trim() || !selectedPlan) return
    setPromoLoading(true); setPromoError(''); setPromoResult(null)
    const basePrice = discountedPrice(selectedPlan)
    const res = await fetch('/api/promo/validate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: promoCode.trim(), planSlug: selectedPlan.slug, basePrice })
    })
    const data = await res.json()
    if (res.ok && data.valid) setPromoResult(data)
    else setPromoError(data.error ?? 'Código no válido')
    setPromoLoading(false)
  }

  function removePromo() { setPromoResult(null); setPromoCode(''); setPromoError('') }

  function getFinalPrice(plan: Plan) {
    const base = discountedPrice(plan)
    if (!promoResult) return base
    return promoResult.finalPrice
  }

  const discountedPrice = (plan: Plan) => {
    if (!plan.discount?.pct) return plan.price
    return +(plan.price * (1 - plan.discount.pct / 100)).toFixed(2)
  }

  const inp: React.CSSProperties = { fontFamily:'Inter,sans-serif' }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:560, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 24px 80px rgba(0,0,0,0.25)' }}>

        {/* Header */}
        <div style={{ padding:'20px 24px 16px', borderBottom:'1px solid #f0f0f0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <p style={{ fontFamily:'Playfair Display,serif', fontSize:20, color:'#1a1a1a', margin:0 }}>Publicar invitación</p>
            <p style={{ fontSize:12, color:'#aaa', margin:'3px 0 0' }}>
              {step === 'plan' ? 'Elige tu plan' : step === 'drafts' ? 'Selecciona qué borradores publicar' : 'Confirma el pago'}
            </p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:'#ccc', lineHeight:1 }}>×</button>
        </div>

        {/* STEP 1: Elegir plan */}
        {step === 'plan' && (
          <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:12 }}>
            {plans.map(plan => {
              const dp = discountedPrice(plan)
              const hasOffer = plan.discount?.pct && plan.discount.pct > 0
              const isSelected = selectedPlan?.slug === plan.slug

              return (
                <div key={plan.slug} onClick={() => setSelectedPlan(plan)}
                  style={{ border: isSelected ? '2px solid #84C5BC' : '1px solid #e8e2db', borderRadius:14, padding:'16px 18px', cursor:'pointer', transition:'all .15s', background: isSelected ? '#f0f9f8' : '#fff' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:18, height:18, borderRadius:'50%', border: isSelected ? '5px solid #84C5BC' : '2px solid #ddd', flexShrink:0 }} />
                      <p style={{ fontFamily:'Playfair Display,serif', fontSize:18, color:'#1a1a1a', margin:0 }}>{plan.name}</p>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      {hasOffer && <p style={{ fontSize:12, color:'#aaa', textDecoration:'line-through', margin:'0 0 2px' }}>€{plan.price}</p>}
                      <p style={{ fontSize:22, fontWeight:600, color:'#1a1a1a', margin:0 }}>€{dp}</p>
                    </div>
                  </div>
                  {hasOffer && (
                    <div style={{ display:'inline-block', background:'#fef3c7', color:'#92400e', fontSize:11, padding:'3px 10px', borderRadius:20, marginBottom:8, fontWeight:500 }}>
                      ⚡ {plan.discount!.label || `${plan.discount!.pct}% dto`}{plan.discount!.until ? ` · hasta ${plan.discount!.until}` : ''}
                    </div>
                  )}
                  <p style={{ fontSize:12, color:'#888', margin:0 }}>
                    {plan.maxEvents === 1 ? '1 evento publicado' : `Hasta ${plan.maxEvents} eventos`} · pago único
                  </p>
                </div>
              )
            })}

            <button onClick={() => { if (selectedPlan) { if (selectedPlan.maxEvents === 1) setStep('pay'); else setStep('drafts') }}}
              disabled={!selectedPlan}
              style={{ background:'#84C5BC', color:'#fff', border:'none', borderRadius:12, padding:'14px', fontSize:14, fontWeight:600, cursor: selectedPlan ? 'pointer' : 'not-allowed', fontFamily:'Inter,sans-serif', opacity: selectedPlan ? 1 : 0.4, marginTop:4 }}>
              Continuar →
            </button>
          </div>
        )}

        {/* STEP 2: Elegir borradores (solo para Premium) */}
        {step === 'drafts' && selectedPlan && (
          <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:12 }}>
            <p style={{ fontSize:13, color:'#888', margin:'0 0 4px' }}>
              Tu plan incluye <strong>{selectedPlan.maxEvents} eventos</strong>. Selecciona cuáles publicar:
            </p>

            {drafts.length === 0 ? (
              <p style={{ fontSize:13, color:'#aaa', textAlign:'center', padding:'20px 0' }}>No tienes borradores disponibles.</p>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {drafts.map(ev => {
                  const isSelected = selectedIds.includes(ev.id)
                  const isCurrent  = ev.id === currentEventId
                  const canSelect  = selectedIds.length < selectedPlan.maxEvents || isSelected

                  return (
                    <div key={ev.id} onClick={() => toggleDraft(ev.id)}
                      style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', border: isSelected ? '1.5px solid #84C5BC' : '1px solid #e8e2db', borderRadius:12, cursor: (!canSelect && !isSelected) ? 'not-allowed' : 'pointer', background: isSelected ? '#f0f9f8' : '#fff', opacity: (!canSelect && !isSelected) ? 0.5 : 1, transition:'all .15s' }}>
                      <div style={{ width:18, height:18, borderRadius:4, border: isSelected ? 'none' : '2px solid #ddd', background: isSelected ? '#84C5BC' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        {isSelected && <span style={{ color:'#fff', fontSize:11 }}>✓</span>}
                      </div>
                      <span style={{ fontSize:16 }}>{TYPE_EMOJI[ev.type] ?? '✨'}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:14, fontWeight:500, color:'#1a1a1a', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {ev.title} {isCurrent && <span style={{ fontSize:10, background:'#e0f5f3', color:'#0f766e', padding:'2px 7px', borderRadius:10, marginLeft:6 }}>Actual</span>}
                        </p>
                        <p style={{ fontSize:11, color:'#aaa', margin:0 }}>
                          {new Date(ev.eventDate).toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <p style={{ fontSize:12, color:'#84C5BC', textAlign:'center' }}>
              {selectedIds.length} / {selectedPlan.maxEvents} seleccionados
            </p>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <button onClick={() => setStep('plan')}
                style={{ background:'transparent', color:'#888', border:'1px solid #e0e0e0', borderRadius:10, padding:'12px', fontSize:13, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
                ← Atrás
              </button>
              <button onClick={() => setStep('pay')} disabled={selectedIds.length === 0}
                style={{ background:'#84C5BC', color:'#fff', border:'none', borderRadius:10, padding:'12px', fontSize:13, fontWeight:600, cursor: selectedIds.length > 0 ? 'pointer' : 'not-allowed', fontFamily:'Inter,sans-serif', opacity: selectedIds.length > 0 ? 1 : 0.4 }}>
                Pagar €{discountedPrice(selectedPlan)}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Pago */}
        {step === 'pay' && selectedPlan && (
          <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:14 }}>
            {/* Resumen */}
            <div style={{ background:'#f8f8f8', borderRadius:12, padding:'14px 16px' }}>
              <p style={{ fontSize:12, color:'#aaa', margin:'0 0 8px', letterSpacing:1, textTransform:'uppercase' }}>Resumen</p>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                <p style={{ fontSize:14, color:'#1a1a1a', margin:0 }}>{selectedPlan.name} · {selectedIds.length} evento{selectedIds.length > 1 ? 's' : ''}</p>
                <div style={{ textAlign:'right' }}>
                  {promoResult && <p style={{ fontSize:12, color:'#aaa', textDecoration:'line-through', margin:'0 0 2px' }}>€{discountedPrice(selectedPlan)}</p>}
                  <p style={{ fontSize:20, fontWeight:600, color:'#1a1a1a', margin:0 }}>€{getFinalPrice(selectedPlan)}</p>
                </div>
              </div>
              {promoResult && (
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:8, padding:'6px 10px', background:'#dcfce7', borderRadius:8 }}>
                  <p style={{ fontSize:12, color:'#16a34a', margin:0 }}>🎟️ {promoResult.code} · {promoResult.label}</p>
                  <button onClick={removePromo} style={{ fontSize:11, color:'#16a34a', background:'none', border:'none', cursor:'pointer', padding:0 }}>Quitar</button>
                </div>
              )}
              {selectedIds.length > 1 && (
                <p style={{ fontSize:11, color:'#84C5BC', margin:'4px 0 0' }}>
                  Publicarás: {drafts.filter(d => selectedIds.includes(d.id)).map(d => d.title).join(', ')}
                </p>
              )}
            </div>

            {/* Promo code */}
            {!promoResult && (
              <div>
                <p style={{ fontSize:11, color:'#aaa', letterSpacing:1, textTransform:'uppercase', margin:'0 0 6px' }}>Código promocional</p>
                <div style={{ display:'flex', gap:8 }}>
                  <input value={promoCode} onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoError('') }}
                    placeholder="Ej: BODA2025" onKeyDown={e => e.key === 'Enter' && applyPromo()}
                    style={{ flex:1, padding:'9px 12px', borderRadius:8, border:`1px solid ${promoError ? '#fca5a5' : '#e0d8d0'}`, fontSize:13, fontFamily:'Inter,sans-serif', outline:'none' }} />
                  <button onClick={applyPromo} disabled={promoLoading || !promoCode.trim()}
                    style={{ padding:'9px 16px', borderRadius:8, border:'1px solid #e0d8d0', background:'#f8f6f4', cursor:'pointer', fontSize:13, fontFamily:'Inter,sans-serif', whiteSpace:'nowrap', opacity: !promoCode.trim() ? 0.5 : 1 }}>
                    {promoLoading ? '…' : 'Aplicar'}
                  </button>
                </div>
                {promoError && <p style={{ fontSize:12, color:'#dc2626', margin:'4px 0 0' }}>⚠️ {promoError}</p>}
              </div>
            )}

            <button onClick={() => handlePay('stripe')} disabled={paying}
              style={{ background:'#1a1a1a', color:'#fff', border:'none', borderRadius:12, padding:'15px', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'Inter,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="1" y="4" width="22" height="16" rx="3" fill="#fff" fillOpacity=".15"/><rect x="1" y="9" width="22" height="3" fill="#fff" fillOpacity=".3"/></svg>
              Pagar con tarjeta
            </button>

            <button onClick={() => handlePay('paypal')} disabled={paying}
              style={{ background:'#0070ba', color:'#fff', border:'none', borderRadius:12, padding:'15px', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'Inter,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c1.379 4.278-.485 7.21-4.772 8.166-1.492.335-2.793.496-3.876.496h-.001c-.523 0-.968.382-1.05.9l-1.12 7.106H7.076l-.38 2.408H9.05c.524 0 .97-.383 1.05-.9l.924-5.86h1.44c4.716 0 8.108-1.763 9.105-6.87.476-2.448.06-4.282-1.347-5.505z"/></svg>
              Pagar con PayPal
            </button>

            <button onClick={() => setStep(selectedPlan.maxEvents > 1 ? 'drafts' : 'plan')}
              style={{ background:'transparent', color:'#aaa', border:'none', fontSize:13, cursor:'pointer', fontFamily:'Inter,sans-serif', padding:'4px 0' }}>
              ← Volver
            </button>

            <p style={{ fontSize:11, color:'#ccc', textAlign:'center', margin:0 }}>
              Pago único · Sin suscripción · Factura disponible tras el pago
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
