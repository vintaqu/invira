'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const NAV = [
  { href: '/admin',           label: 'Dashboard',    icon: '◻' },
  { href: '/admin/users',     label: 'Usuarios',     icon: '◈' },
  { href: '/admin/events',    label: 'Eventos',      icon: '◷' },
  { href: '/admin/revenue',   label: 'Ingresos',     icon: '◎' },
  { href: '/admin/support',   label: 'Soporte',      icon: '◉' },
  { href: '/admin/settings',  label: 'Sistema',      icon: '◍' },
]

export default function AdminSidebar({ user }: { user: { name?: string | null; email?: string | null; role?: string | null } | undefined }) {
  const pathname = usePathname()

  const ff = "'Inter','Helvetica Neue',sans-serif"

  return (
    <aside style={{ width:220, background:'#fff', position:'fixed', top:0, left:0, height:'100vh', display:'flex', flexDirection:'column', borderRight:'1px solid #e8e2db', zIndex:50, fontFamily:ff }}>

      {/* Logo */}
      <div style={{ padding:'20px 18px 16px', borderBottom:'1px solid #f0ebe4' }}>
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:9, textDecoration:'none', marginBottom:10 }}>
          <svg width="26" height="26" viewBox="0 0 110 110" fill="none">
            <path d="M55 100C55 100 8 62 8 35C8 16 23 3 40 3C47 3 53 7 55 9C57 7 63 3 70 3C87 3 102 16 102 35C102 62 55 100 55 100Z" fill="#84C5BC"/>
            <circle cx="72" cy="22" r="10" fill="white" opacity="0.95"/>
            <circle cx="78" cy="15" r="5.5" fill="white"/>
          </svg>
          <span style={{ fontSize:18, color:'#1a1a1a', fontWeight:500, letterSpacing:-0.4 }}>evochi</span>
        </Link>
        <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:'#fff0ee', borderRadius:6, padding:'3px 8px' }}>
          <span style={{ fontSize:9, color:'#dc2626', fontWeight:700, letterSpacing:1.5, textTransform:'uppercase' }}>Admin</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'12px 10px', display:'flex', flexDirection:'column', gap:2, overflowY:'auto' }}>
        {NAV.map(item => {
          const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:10, textDecoration:'none', transition:'all .15s', background:active?'#f0f9f8':'transparent', color:active?'#0f766e':'#666', fontWeight:active?500:400, fontSize:13 }}
              onMouseEnter={e=>{ if(!active)(e.currentTarget as HTMLAnchorElement).style.background='#f8f8f6' }}
              onMouseLeave={e=>{ if(!active)(e.currentTarget as HTMLAnchorElement).style.background='transparent' }}>
              <span style={{ fontSize:14, width:18, textAlign:'center', color:active?'#84C5BC':'#ccc' }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding:'12px 10px', borderTop:'1px solid #f0ebe4' }}>
        <Link href="/dashboard"
          style={{ display:'flex', alignItems:'center', gap:7, fontSize:12, color:'#84C5BC', textDecoration:'none', padding:'7px 10px', borderRadius:8, marginBottom:8, background:'#f0f9f8' }}
          onMouseEnter={e=>(e.currentTarget as HTMLAnchorElement).style.background='#e0f5f2'}
          onMouseLeave={e=>(e.currentTarget as HTMLAnchorElement).style.background='#f0f9f8'}>
          ← Panel usuario
        </Link>
        <div style={{ display:'flex', alignItems:'center', gap:9, padding:'8px 10px', marginBottom:6 }}>
          <div style={{ width:30, height:30, borderRadius:'50%', background:'#e0f5f2', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:600, color:'#0f766e', flexShrink:0 }}>
            {user?.name?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:12, color:'#1a1a1a', fontWeight:500, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</p>
            <p style={{ fontSize:10, color:'#bbb', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email}</p>
          </div>
        </div>
        <button onClick={()=>signOut({callbackUrl:'/'})}
          style={{ width:'100%', background:'#fef2f2', color:'#dc2626', border:'none', borderRadius:9, padding:'8px 12px', fontSize:12, cursor:'pointer', fontFamily:ff, textAlign:'left', transition:'background .15s' }}
          onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background='#fee2e2'}
          onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background='#fef2f2'}>
          ⏻ Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
