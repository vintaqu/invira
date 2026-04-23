'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface GuestInfo {
  name: string
  table?: string | number
  isVIP: boolean
  menuChoice?: string
  rsvpStatus?: string
  checkInStatus: string
  checkedInAt?: string
  event: { title: string; eventDate: string }
}

export default function CheckInPage() {
  const { token } = useParams<{ token: string }>()
  const [guest, setGuest] = useState<GuestInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/checkin/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error)
        else setGuest(data)
        setLoading(false)
      })
      .catch(() => { setError('Error de conexión'); setLoading(false) })
  }, [token])

  async function handleCheckIn() {
    setChecking(true)
    const res = await fetch(`/api/checkin/${token}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ device: 'web' }) })
    const data = await res.json()
    if (data.guest) { setGuest(prev => prev ? { ...prev, checkInStatus: 'CHECKED_IN' } : prev); setDone(true) }
    setChecking(false)
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0f0c0a' }}>
      <div style={{ width:32, height:32, border:'2px solid #84C5BC', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (error) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#0f0c0a', fontFamily:'Inter,sans-serif' }}>
      <p style={{ color:'#e24b4a', fontSize:14 }}>{error}</p>
    </div>
  )

  if (!guest) return null

  const alreadyIn = guest.checkInStatus === 'CHECKED_IN'

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#0f0c0a', fontFamily:'Inter,sans-serif', padding:24 }}>
      <div style={{ width:'100%', maxWidth:380, background:'#1a1614', borderRadius:24, overflow:'hidden', border:'1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ background: alreadyIn || done ? 'linear-gradient(135deg,#1a3a1a,#0f2a0f)' : 'linear-gradient(135deg,#2d1a10,#1a0e08)', padding:'32px 28px', textAlign:'center' }}>
          <div style={{ fontSize:48, marginBottom:12 }}>{alreadyIn || done ? '✅' : '🎟'}</div>
          <p style={{ fontFamily:'Playfair Display,serif', fontStyle:'italic', fontSize:22, color:'#fff', margin:'0 0 4px' }}>{guest.event.title}</p>
          <p style={{ fontSize:12, color:'rgba(255,255,255,0.35)', margin:0 }}>
            {new Date(guest.event.eventDate).toLocaleDateString('es-ES', { weekday:'long', day:'numeric', month:'long' })}
          </p>
        </div>
        <div style={{ padding:'28px' }}>
          <div style={{ textAlign:'center', marginBottom:24 }}>
            <p style={{ fontSize:11, letterSpacing:2, textTransform:'uppercase', color:'#888', marginBottom:8 }}>Invitado</p>
            <p style={{ fontFamily:'Playfair Display,serif', fontSize:28, fontWeight:400, color:'#fff', margin:0 }}>{guest.name}</p>
            {guest.isVIP && <span style={{ display:'inline-block', background:'#84C5BC', color:'#fff', fontSize:10, letterSpacing:2, textTransform:'uppercase', padding:'3px 12px', borderRadius:20, marginTop:8 }}>VIP</span>}
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
            {guest.table && (
              <div style={{ background:'rgba(255,255,255,0.05)', borderRadius:12, padding:'12px 16px', display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontSize:13, color:'rgba(255,255,255,0.4)' }}>Mesa</span>
                <span style={{ fontSize:13, color:'#fff' }}>{guest.table}</span>
              </div>
            )}
            {guest.menuChoice && (
              <div style={{ background:'rgba(255,255,255,0.05)', borderRadius:12, padding:'12px 16px', display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontSize:13, color:'rgba(255,255,255,0.4)' }}>Menú</span>
                <span style={{ fontSize:13, color:'#fff' }}>{guest.menuChoice}</span>
              </div>
            )}
            <div style={{ background:'rgba(255,255,255,0.05)', borderRadius:12, padding:'12px 16px', display:'flex', justifyContent:'space-between' }}>
              <span style={{ fontSize:13, color:'rgba(255,255,255,0.4)' }}>RSVP</span>
              <span style={{ fontSize:13, color: guest.rsvpStatus === 'CONFIRMED' ? '#22c55e' : '#888' }}>
                {guest.rsvpStatus === 'CONFIRMED' ? 'Confirmado' : 'Sin confirmar'}
              </span>
            </div>
          </div>

          {alreadyIn || done ? (
            <div style={{ textAlign:'center', padding:'16px', background:'rgba(34,197,94,0.1)', borderRadius:16, border:'1px solid rgba(34,197,94,0.2)' }}>
              <p style={{ color:'#22c55e', fontSize:14, fontWeight:500, margin:'0 0 4px' }}>✓ Entrada registrada</p>
              {guest.checkedInAt && <p style={{ color:'rgba(34,197,94,0.6)', fontSize:12, margin:0 }}>
                {new Date(guest.checkedInAt).toLocaleTimeString('es-ES', { hour:'2-digit', minute:'2-digit' })}
              </p>}
            </div>
          ) : (
            <button onClick={handleCheckIn} disabled={checking}
              style={{ width:'100%', padding:16, background:'#84C5BC', border:'none', borderRadius:16, color:'#fff', fontSize:15, fontWeight:500, cursor:'pointer', fontFamily:'Inter,sans-serif', opacity: checking ? 0.7 : 1 }}>
              {checking ? 'Registrando…' : 'Registrar entrada'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
