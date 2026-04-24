'use client'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

const NAV = [
  { href:'/dashboard',            label:'Inicio',        icon:'⌂' },
  { href:'/dashboard/events',     label:'Mis eventos',   icon:'◈' },
  { href:'/dashboard/events/new', label:'Nueva invitación', icon:'+' },
  { href:'/dashboard/settings',   label:'Configuración', icon:'⚙' },
]
const ADMIN_NAV = [
  { href:'/admin', label:'Panel Admin', icon:'⚡' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router   = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === 'unauthenticated') {
      // Preserve the intended destination so user lands there after login
      const dest = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/dashboard'
      router.replace(`/?callbackUrl=${encodeURIComponent(dest)}`)
    }
  }, [status])

  if (status === 'loading') return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f4f1' }}>
      <div style={{ width:28, height:28, border:'2px solid #84C5BC', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!session) return null

  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN'
  const initials = session.user?.name?.[0]?.toUpperCase() ?? 'U'
  const ff = "'Inter','Helvetica Neue',sans-serif"

  return (
    <div style={{ minHeight:'100vh', background:'#f5f4f1', display:'flex' }} className="db-layout">

      {/* ── SIDEBAR ── */}
      <aside className="db-sidebar" style={{
        width:220, background:'#fff', borderRight:'1px solid #e8e2db',
        display:'flex', flexDirection:'column', position:'fixed',
        top:0, left:0, height:'100vh', zIndex:40,
      }}>
        {/* Logo */}
        <div className="db-sidebar-logo" style={{ padding:'20px 20px 16px', borderBottom:'1px solid #f0ebe4' }}>
          <Link href="/" style={{ display:'flex', alignItems:'center', gap:9, textDecoration:'none' }}>
            <svg width="26" height="26" viewBox="0 0 110 110" fill="none">
              <path d="M55 100C55 100 8 62 8 35C8 16 23 3 40 3C47 3 53 7 55 9C57 7 63 3 70 3C87 3 102 16 102 35C102 62 55 100 55 100Z" fill="#84C5BC"/>
              <circle cx="72" cy="22" r="10" fill="white" opacity="0.95"/>
              <circle cx="78" cy="15" r="5.5" fill="white"/>
            </svg>
            <span style={{ fontFamily:ff, fontSize:18, color:'#1a1a1a', fontWeight:500, letterSpacing:-0.4 }}>evochi</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="db-sidebar-nav" style={{ flex:1, padding:'12px 10px', display:'flex', flexDirection:'column', gap:2, overflowY:'auto' }}>

          {isAdmin && (<>
            <p style={{ fontSize:9, letterSpacing:2, textTransform:'uppercase', color:'#bbb', padding:'8px 10px 4px', fontFamily:ff }}>Admin</p>
            {ADMIN_NAV.map(item => (
              <Link key={item.href} href={item.href}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:10, fontSize:13, textDecoration:'none', fontFamily:ff, color:'#84C5BC', background:'#f0f9f8', fontWeight:500, marginBottom:6, transition:'all .15s' }}
                onMouseEnter={e=>(e.currentTarget as HTMLAnchorElement).style.background='#e0f5f2'}
                onMouseLeave={e=>(e.currentTarget as HTMLAnchorElement).style.background='#f0f9f8'}>
                <span style={{ fontSize:15, flexShrink:0 }}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <div style={{ height:'1px', background:'#f0ebe4', margin:'4px 0 8px' }} />
          </>)}

          {NAV.map(item => {
            const active = item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href}
                style={{
                  display:'flex', alignItems:'center', gap:10,
                  padding:'9px 12px', borderRadius:10, fontSize:13,
                  textDecoration:'none', fontFamily:ff, transition:'all .15s',
                  background: active ? '#f0f9f8' : 'transparent',
                  color:      active ? '#0f766e' : '#666',
                  fontWeight: active ? 500 : 400,
                }}
                onMouseEnter={e => { if(!active) (e.currentTarget as HTMLAnchorElement).style.background='#f8f8f6' }}
                onMouseLeave={e => { if(!active) (e.currentTarget as HTMLAnchorElement).style.background='transparent' }}>
                <span style={{ fontSize:item.icon==='+' ? 18 : 14, color: active ? '#84C5BC' : '#bbb', flexShrink:0, lineHeight:1 }}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="db-sidebar-footer" style={{ padding:'12px 10px', borderTop:'1px solid #f0ebe4' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', marginBottom:8 }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:'#e0f5f2', display:'flex', alignItems:'center', justifyContent:'center', color:'#0f766e', fontSize:13, fontWeight:500, flexShrink:0 }}>
              {initials}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:12, color:'#1a1a1a', fontWeight:500, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontFamily:ff }}>{session.user?.name}</p>
              <p style={{ fontSize:11, color:'#bbb', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontFamily:ff }}>{session.user?.email}</p>
            </div>
          </div>
          <button onClick={() => signOut({ callbackUrl:'/' })}
            style={{ width:'100%', background:'#fef2f2', color:'#dc2626', border:'none', borderRadius:9, padding:'8px 12px', fontSize:12, cursor:'pointer', fontFamily:ff, textAlign:'left', transition:'background .15s' }}
            onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background='#fee2e2'}
            onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background='#fef2f2'}>
            ⏻ Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="db-main" style={{ flex:1, marginLeft:220, minHeight:'100vh' }}>
        {children}
      </main>
    </div>
  )
}
