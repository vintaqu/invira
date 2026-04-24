'use client'
import { useState } from 'react'

// Support page - email-based for now, can integrate Intercom/Crisp later
const TEMPLATES = [
  { label: 'Bienvenida', subject: '¡Bienvenido/a a Evochi!', body: 'Hola,\n\nGracias por registrarte en Evochi. Estamos aquí para ayudarte a crear la invitación perfecta para tu evento.\n\nSi tienes alguna pregunta, no dudes en escribirnos.\n\nUn saludo,\nEl equipo de Evochi' },
  { label: 'Reembolso aprobado', subject: 'Reembolso procesado — Evochi', body: 'Hola,\n\nHemos procesado tu reembolso. El importe aparecerá en tu cuenta en 5-10 días hábiles.\n\nLamentamos que tu experiencia no haya sido la esperada. Si hay algo más en lo que podamos ayudarte, escríbenos.\n\nUn saludo,\nEl equipo de Evochi' },
  { label: 'Problema técnico', subject: 'Actualización sobre tu consulta — Evochi', body: 'Hola,\n\nHemos investigado el problema que nos reportaste y lo hemos solucionado. Ya puedes continuar usando la plataforma con normalidad.\n\nDisculpa las molestias causadas.\n\nUn saludo,\nEl equipo de Evochi' },
  { label: 'Evento pro-bono', subject: 'Activación especial de tu evento — Evochi', body: 'Hola,\n\nHemos activado tu evento de forma gratuita como parte de nuestro programa de apoyo. Tu invitación ya está publicada y lista para compartir.\n\n¡Mucha suerte con tu celebración!\n\nUn saludo,\nEl equipo de Evochi' },
]

export default function AdminSupportPage() {
  const [to, setTo]           = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody]       = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent]       = useState(false)

  async function send() {
    if (!to.trim() || !subject.trim() || !body.trim()) return
    setSending(true)
    // In production: POST to /api/admin/support/email to send via Resend
    await new Promise(r => setTimeout(r, 1000)) // simulate
    setSending(false)
    setSent(true)
    setTimeout(() => { setSent(false); setTo(''); setSubject(''); setBody('') }, 2000)
  }

  function applyTemplate(t: typeof TEMPLATES[0]) {
    setSubject(t.subject)
    setBody(t.body)
  }

  const inp: React.CSSProperties = { width: '100%', border: '1px solid #e8e8ec', borderRadius: 10, padding: '10px 14px', fontSize: 13, outline: 'none', background: '#fff', fontFamily: 'Inter,sans-serif', boxSizing: 'border-box' }

  return (
    <div style={{ padding: 32, fontFamily: 'Inter,sans-serif' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: 30, fontWeight: 400, color: '#0d0d0f', margin: '0 0 4px' }}>Soporte</h1>
        <p style={{ fontSize: 13, color: '#888', margin: 0 }}>Comunicaciones directas con usuarios</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
        {/* Templates */}
        <div>
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e8ec', overflow: 'hidden', marginBottom: 16 }}>
            <p style={{ fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', color: '#888', padding: '14px 18px', borderBottom: '1px solid #f0f0f4', margin: 0 }}>Plantillas rápidas</p>
            {TEMPLATES.map((t, i) => (
              <div key={t.label} onClick={() => applyTemplate(t)}
                style={{ padding: '12px 18px', cursor: 'pointer', borderBottom: i < TEMPLATES.length - 1 ? '1px solid #f8f8fa' : 'none', transition: 'background .1s' }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#fafafa'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = '#fff'}>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#0d0d0f', margin: '0 0 2px' }}>{t.label}</p>
                <p style={{ fontSize: 11, color: '#aaa', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subject}</p>
              </div>
            ))}
          </div>

          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e8ec', padding: 18 }}>
            <p style={{ fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', color: '#888', margin: '0 0 12px' }}>Acciones admin rápidas</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a href="/admin/users" style={{ fontSize: 13, color: '#6366f1', textDecoration: 'none', padding: '8px 12px', background: '#f0f0ff', borderRadius: 8, display: 'block' }}>
                → Buscar usuario por email
              </a>
              <a href="/admin/events" style={{ fontSize: 13, color: '#f59e0b', textDecoration: 'none', padding: '8px 12px', background: '#fffbf0', borderRadius: 8, display: 'block' }}>
                → Activar evento manualmente
              </a>
              <a href="/admin/revenue" style={{ fontSize: 13, color: '#10b981', textDecoration: 'none', padding: '8px 12px', background: '#f0fdf4', borderRadius: 8, display: 'block' }}>
                → Ver historial de pagos
              </a>
            </div>
          </div>
        </div>

        {/* Email composer */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e8ec', padding: 24 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: '#0d0d0f', margin: '0 0 20px' }}>Enviar email a usuario</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: 6 }}>Para</label>
              <input value={to} onChange={e => setTo(e.target.value)} type="email" placeholder="usuario@email.com" style={inp} />
            </div>
            <div>
              <label style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: 6 }}>Asunto</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Asunto del email" style={inp} />
            </div>
            <div>
              <label style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: 6 }}>Mensaje</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={10} placeholder="Escribe tu mensaje aquí…"
                style={{ ...inp, resize: 'vertical', lineHeight: 1.7 }} />
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button onClick={send} disabled={sending || sent || !to || !subject || !body}
                style={{ background: sent ? '#10b981' : '#0d0d0f', color: '#fff', border: 'none', padding: '11px 28px', borderRadius: 10, fontSize: 13, cursor: 'pointer', fontFamily: 'Inter,sans-serif', fontWeight: 500, opacity: (!to || !subject || !body) ? 0.4 : 1 }}>
                {sent ? '✓ Enviado' : sending ? 'Enviando…' : 'Enviar email'}
              </button>
              <p style={{ fontSize: 12, color: '#aaa', margin: 0 }}>Se enviará desde soporte@evochi.app</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
