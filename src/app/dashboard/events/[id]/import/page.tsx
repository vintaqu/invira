'use client'
import { useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface PreviewRow { name: string; email: string; phone: string; group: string }

export default function ImportGuestsPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [preview, setPreview] = useState<PreviewRow[]>([])
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ created: number } | null>(null)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function parseCSV(text: string): PreviewRow[] {
    const lines = text.trim().split('\n').filter(Boolean)
    if (lines.length < 2) return []
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''))
    const idx = (names: string[]) => names.map(n => headers.indexOf(n)).find(i => i >= 0) ?? -1
    const nameIdx  = idx(['nombre','name','invitado','guest'])
    const emailIdx = idx(['email','correo','mail'])
    const phoneIdx = idx(['telefono','teléfono','phone','tel'])
    const groupIdx = idx(['grupo','group','mesa','table'])
    return lines.slice(1).map(line => {
      const cols = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''))
      return { name: cols[nameIdx] ?? '', email: cols[emailIdx] ?? '', phone: cols[phoneIdx] ?? '', group: cols[groupIdx] ?? '' }
    }).filter(r => r.name)
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(''); setResult(null)
    const reader = new FileReader()
    reader.onload = ev => {
      const rows = parseCSV(ev.target?.result as string)
      if (!rows.length) { setError('No se encontraron filas válidas. El CSV necesita una columna "nombre" o "name".'); return }
      setPreview(rows)
    }
    reader.readAsText(file, 'UTF-8')
  }

  async function doImport() {
    setImporting(true); setError('')
    try {
      const res = await fetch(`/api/events/${id}/guests/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guests: preview }),
      })
      const data = await res.json()
      if (res.ok) { setResult({ created: data.created }); setPreview([]) }
      else setError(data.error ?? 'Error al importar')
    } finally {
      setImporting(false)
    }
  }

  function downloadExample() {
    const csv = 'nombre,email,telefono,grupo\nAna García,ana@example.com,612345678,Familia\nCarlos López,carlos@example.com,623456789,Amigos\nLucía Fernández,,634567890,Trabajo'
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    a.download = 'ejemplo_invitados.csv'
    a.click()
  }

  const ff = 'Inter,sans-serif'

  return (
    <div style={{ padding:'clamp(20px,5vw,40px)', maxWidth:800, fontFamily:ff }}>
      <div style={{ marginBottom:24 }}>
        <Link href={`/dashboard/events/${id}`} style={{ fontSize:13, color:'#888', textDecoration:'none' }}>← Volver al editor</Link>
      </div>

      <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:'clamp(28px,6vw,36px)', fontWeight:400, color:'#1a1a1a', marginBottom:6 }}>Importar invitados</h1>
      <p style={{ fontSize:14, color:'#888', marginBottom:28 }}>Sube un archivo CSV con la lista de invitados</p>

      {/* Format info - stacked on mobile */}
      <div style={{ background:'#fff7f0', border:'1px solid #f0d8c0', borderRadius:12, padding:16, marginBottom:20 }}>
        <p style={{ fontSize:13, fontWeight:600, color:'#8a4520', marginBottom:10 }}>Formato esperado</p>
        <p style={{ fontSize:12, color:'#a06040', marginBottom:10 }}>Primera fila: cabecera. Columnas reconocidas:</p>
        {/* Stacked pills for mobile */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {['nombre','email','telefono','grupo'].map(col => (
            <code key={col} style={{ background:'rgba(0,0,0,0.08)', padding:'4px 10px', borderRadius:6, fontSize:12, color:'#8a4520', display:'inline-block' }}>
              {col}
            </code>
          ))}
        </div>
        <p style={{ fontSize:11, color:'#b07050', marginTop:10, marginBottom:0 }}>
          También acepta: name, correo, phone, tel, group, mesa
        </p>
      </div>

      <button onClick={downloadExample}
        style={{ fontSize:13, color:'#84C5BC', background:'none', border:'1px solid #d0e8e5', padding:'10px 18px', borderRadius:8, cursor:'pointer', fontFamily:ff, marginBottom:24, display:'block', width:'100%', textAlign:'left' as const }}>
        📥 Descargar CSV de ejemplo
      </button>

      {/* Drop zone */}
      <div onClick={() => fileRef.current?.click()}
        style={{ border:'2px dashed #84C5BC', borderRadius:16, padding:'clamp(32px,8vw,48px) 24px', textAlign:'center', cursor:'pointer', marginBottom:24, background:'#f0fafa', transition:'all .15s' }}
        onMouseEnter={e => (e.currentTarget as any).style.background='#e0f5f2'}
        onMouseLeave={e => (e.currentTarget as any).style.background='#f0fafa'}>
        <div style={{ fontSize:40, marginBottom:12 }}>📄</div>
        <p style={{ fontSize:16, color:'#1a1a1a', marginBottom:4, fontWeight:500 }}>Toca para seleccionar CSV</p>
        <p style={{ fontSize:13, color:'#aaa' }}>Archivos .csv o .txt</p>
        <input ref={fileRef} type="file" accept=".csv,.txt" style={{ display:'none' }} onChange={handleFile} />
      </div>

      {error && (
        <div style={{ background:'#fef0f0', border:'1px solid #f0c0c0', borderRadius:12, padding:14, marginBottom:20, fontSize:13, color:'#a32d2d' }}>
          ⚠️ {error}
        </div>
      )}

      {result && (
        <div style={{ background:'#e6f5ec', border:'1px solid #c0e0d0', borderRadius:12, padding:20, marginBottom:20 }}>
          <p style={{ fontSize:14, color:'#1a6b3c', fontWeight:600, marginBottom:4 }}>✓ Importación completada</p>
          <p style={{ fontSize:13, color:'#2d7a50', marginBottom:12 }}>{result.created} invitados creados correctamente</p>
          <button onClick={() => router.push(`/dashboard/events/${id}`)}
            style={{ background:'#1a6b3c', color:'#fff', border:'none', padding:'10px 20px', borderRadius:8, fontSize:13, cursor:'pointer', fontFamily:ff }}>
            Ver invitados →
          </button>
        </div>
      )}

      {/* Preview - card layout on mobile instead of grid */}
      {preview.length > 0 && (
        <div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14, flexWrap:'wrap', gap:8 }}>
            <p style={{ fontSize:14, color:'#1a1a1a', fontWeight:500, margin:0 }}>{preview.length} invitados encontrados</p>
            <button onClick={() => setPreview([])} style={{ fontSize:12, color:'#888', background:'none', border:'none', cursor:'pointer', padding:4 }}>✕ Limpiar</button>
          </div>

          {/* Desktop: table | Mobile: cards */}
          <div className="import-preview-desktop" style={{ background:'#fff', border:'1px solid #e8e0d2', borderRadius:16, overflow:'hidden', marginBottom:20 }}>
            <div style={{ display:'grid', gridTemplateColumns:'2fr 2fr 1.5fr 1fr', padding:'10px 16px', background:'#faf8f4', borderBottom:'1px solid #f0ece6', fontSize:11, letterSpacing:2, textTransform:'uppercase' as const, color:'#888' }}>
              <span>Nombre</span><span>Email</span><span>Teléfono</span><span>Grupo</span>
            </div>
            {preview.slice(0,10).map((row, i) => (
              <div key={i} style={{ display:'grid', gridTemplateColumns:'2fr 2fr 1.5fr 1fr', padding:'10px 16px', borderBottom: i < Math.min(preview.length,10)-1 ? '1px solid #f5f0ea' : 'none', fontSize:13, color:'#444' }}>
                <span style={{ color:'#1a1a1a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{row.name}</span>
                <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{row.email || '—'}</span>
                <span>{row.phone || '—'}</span>
                <span>{row.group || '—'}</span>
              </div>
            ))}
            {preview.length > 10 && <div style={{ padding:'10px 16px', fontSize:12, color:'#888', borderTop:'1px solid #f0ece6' }}>… y {preview.length-10} más</div>}
          </div>

          {/* Mobile cards */}
          <div className="import-preview-mobile" style={{ marginBottom:20, display:'flex', flexDirection:'column', gap:8 }}>
            {preview.slice(0,10).map((row, i) => (
              <div key={i} style={{ background:'#fff', border:'1px solid #e8e0d2', borderRadius:12, padding:'12px 14px' }}>
                <p style={{ fontSize:14, fontWeight:500, color:'#1a1a1a', margin:'0 0 4px' }}>{row.name}</p>
                {row.email && <p style={{ fontSize:12, color:'#888', margin:'0 0 2px' }}>✉ {row.email}</p>}
                {row.phone && <p style={{ fontSize:12, color:'#888', margin:'0 0 2px' }}>📱 {row.phone}</p>}
                {row.group && <p style={{ fontSize:12, color:'#84C5BC', margin:0 }}>👥 {row.group}</p>}
              </div>
            ))}
            {preview.length > 10 && <p style={{ fontSize:12, color:'#888', textAlign:'center', padding:8 }}>… y {preview.length-10} más</p>}
          </div>

          <button onClick={doImport} disabled={importing}
            style={{ background:'#1a1a1a', color:'#fff', border:'none', padding:'15px 36px', borderRadius:12, fontSize:14, fontWeight:500, cursor:'pointer', fontFamily:ff, opacity: importing ? 0.6 : 1, width:'100%' }}>
            {importing ? 'Importando…' : `Importar ${preview.length} invitados`}
          </button>
        </div>
      )}

      <style>{`
        .import-preview-desktop { display: block; }
        .import-preview-mobile  { display: none;  }
        @media (max-width: 600px) {
          .import-preview-desktop { display: none;  }
          .import-preview-mobile  { display: flex;  }
        }
      `}</style>
    </div>
  )
}
