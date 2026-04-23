'use client'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const user = session?.user

  const [profile, setProfile] = useState({ name: user?.name ?? '', email: user?.email ?? '' })
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')
  const [profileErr, setProfileErr] = useState('')
  const [passwordErr, setPasswordErr] = useState('')

  async function saveProfile() {
    if (!profile.name.trim()) { setProfileErr('El nombre es obligatorio'); return }
    setSavingProfile(true); setProfileMsg(''); setProfileErr('')
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profile.name }),
      })
      if (res.ok) {
        await update({ name: profile.name })
        setProfileMsg('Perfil actualizado correctamente')
      } else {
        const d = await res.json()
        setProfileErr(d.error ?? 'Error al guardar')
      }
    } finally {
      setSavingProfile(false)
    }
  }

  async function savePassword() {
    if (!passwords.current) { setPasswordErr('Introduce tu contraseña actual'); return }
    if (passwords.next.length < 8) { setPasswordErr('La nueva contraseña debe tener al menos 8 caracteres'); return }
    if (passwords.next !== passwords.confirm) { setPasswordErr('Las contraseñas no coinciden'); return }
    setSavingPassword(true); setPasswordMsg(''); setPasswordErr('')
    try {
      const res = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.next }),
      })
      if (res.ok) {
        setPasswordMsg('Contraseña actualizada correctamente')
        setPasswords({ current: '', next: '', confirm: '' })
      } else {
        const d = await res.json()
        setPasswordErr(d.error ?? 'Error al cambiar contraseña')
      }
    } finally {
      setSavingPassword(false)
    }
  }

  const inp = { width:'100%', border:'1px solid #e8e0d2', borderRadius:12, padding:'13px 16px', fontSize:14, color:'#1a1a1a', background:'#faf8f4', outline:'none', fontFamily:'Inter,sans-serif' } as React.CSSProperties
  const card = { background:'#fff', border:'1px solid #e8e0d2', borderRadius:20, padding:28, maxWidth:520, marginBottom:20 } as React.CSSProperties
  const label = { fontSize:11, letterSpacing:1.5, textTransform:'uppercase' as const, color:'#aaa', display:'block', marginBottom:8, fontFamily:'Inter,sans-serif' }
  const section = { marginBottom:18 } as React.CSSProperties

  return (
    <div style={{ padding:40, fontFamily:'Inter,sans-serif', fontWeight:300 }}>
      <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:36, fontWeight:400, color:'#1a1a1a', marginBottom:6 }}>Configuración</h1>
      <p style={{ fontSize:14, color:'#888', marginBottom:32 }}>Gestiona tu cuenta y preferencias</p>

      {/* Profile */}
      <div style={card}>
        <p style={{ fontSize:13, fontWeight:500, color:'#1a1a1a', marginBottom:20, textTransform:'uppercase', letterSpacing:1.5 }}>Perfil</p>
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24 }}>
          <div style={{ width:56, height:56, borderRadius:'50%', background:'rgba(132,197,188,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:500, color:'#84C5BC', flexShrink:0 }}>
            {profile.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div>
            <p style={{ fontSize:15, fontWeight:500, color:'#1a1a1a', margin:0 }}>{profile.name || 'Sin nombre'}</p>
            <p style={{ fontSize:13, color:'#888', margin:0 }}>{profile.email}</p>
          </div>
        </div>
        <div style={section}>
          <label style={label}>Nombre completo</label>
          <input style={inp} value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} placeholder="Tu nombre" />
        </div>
        <div style={section}>
          <label style={label}>Email</label>
          <input style={{...inp, background:'#f5f5f5', color:'#888', cursor:'not-allowed'}} value={profile.email} disabled />
          <p style={{ fontSize:11, color:'#bbb', marginTop:6 }}>El email no se puede cambiar por motivos de seguridad</p>
        </div>
        {profileErr && <p style={{ fontSize:13, color:'#e24b4a', marginBottom:12 }}>{profileErr}</p>}
        {profileMsg && <p style={{ fontSize:13, color:'#1a6b3c', marginBottom:12 }}>{profileMsg}</p>}
        <button onClick={saveProfile} disabled={savingProfile}
          style={{ background:'#1a1a1a', color:'#fff', border:'none', padding:'12px 28px', borderRadius:10, fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'Inter,sans-serif', opacity: savingProfile ? 0.6 : 1 }}>
          {savingProfile ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>

      {/* Password */}
      <div style={card}>
        <p style={{ fontSize:13, fontWeight:500, color:'#1a1a1a', marginBottom:20, textTransform:'uppercase', letterSpacing:1.5 }}>Cambiar contraseña</p>
        {['current','next','confirm'].map((k, i) => (
          <div key={k} style={section}>
            <label style={label}>{['Contraseña actual','Nueva contraseña','Confirmar nueva contraseña'][i]}</label>
            <input type="password" style={inp}
              value={(passwords as any)[k]}
              onChange={e => setPasswords({...passwords, [k]: e.target.value})}
              placeholder={['Tu contraseña actual','Mínimo 8 caracteres','Repite la nueva contraseña'][i]} />
          </div>
        ))}
        {passwordErr && <p style={{ fontSize:13, color:'#e24b4a', marginBottom:12 }}>{passwordErr}</p>}
        {passwordMsg && <p style={{ fontSize:13, color:'#1a6b3c', marginBottom:12 }}>{passwordMsg}</p>}
        <button onClick={savePassword} disabled={savingPassword}
          style={{ background:'#1a1a1a', color:'#fff', border:'none', padding:'12px 28px', borderRadius:10, fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'Inter,sans-serif', opacity: savingPassword ? 0.6 : 1 }}>
          {savingPassword ? 'Cambiando…' : 'Cambiar contraseña'}
        </button>
      </div>

      {/* Danger zone */}
      <div style={{...card, borderColor:'#f0c0c0', maxWidth:520 }}>
        <p style={{ fontSize:13, fontWeight:500, color:'#a32d2d', marginBottom:12, textTransform:'uppercase', letterSpacing:1.5 }}>Zona de peligro</p>
        <p style={{ fontSize:13, color:'#888', marginBottom:16, lineHeight:1.6 }}>Al cerrar sesión perderás el acceso hasta que vuelvas a entrar.</p>
        <button onClick={() => signOut({ callbackUrl: '/' })}
          style={{ background:'none', color:'#a32d2d', border:'1px solid #f0c0c0', padding:'10px 24px', borderRadius:10, fontSize:13, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
