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

  const s = { fontFamily:'Inter,sans-serif', fontWeight:300 } as React.CSSProperties

  return (
    <div style={{ padding:40, maxWidth:800, ...s }}>
      <div style={{ marginBottom:28 }}>
        <Link href={`/dashboard/events/${id}`} style={{ fontSize:13, color:'#888', textDecoration:'none' }}>← Volver al editor</Link>
      </div>
      <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:36, fontWeight:400, color:'#1a1a1a', marginBottom:6 }}>Importar invitados</h1>
      <p style={{ fontSize:14, color:'#888', marginBottom:32 }}>Sube un archivo CSV con la lista de invitados</p>

      <div style={{ background:'#fff7f0', border:'1px solid #f0d8c0', borderRadius:12, padding:16, marginBottom:20 }}>
        <p style={{ fontSize:13, fontWeight:500, color:'#8a4520', marginBottom:6 }}>Formato esperado</p>
        <p style={{ fontSize:12, color:'#a06040', lineHeight:1.7, margin:0 }}>
          Primera fila: cabecera. Columnas reconocidas:
          <code style={{ background:'rgba(0,0,0,0.06)', padding:'1px 5px', borderRadius:4, margin:'0 3px' }}>nombre</code>
          <code style={{ background:'rgba(0,0,0,0.06)', padding:'1px 5px', borderRadius:4, margin:'0 3px' }}>email</code>
          <code style={{ background:'rgba(0,0,0,0.06)', padding:'1px 5px', borderRadius:4, margin:'0 3px' }}>telefono</code>
          <code style={{ background:'rgba(0,0,0,0.06)', padding:'1px 5px', borderRadius:4, margin:'0 3px' }}>grupo</code>
        </p>
      </div>

      <button onClick={downloadExample} style={{ fontSize:13, color:'#84C5BC', background:'none', border:'1px solid #f0d8c0', padding:'8px 18px', borderRadius:8, cursor:'pointer', fontFamily:'Inter,sans-serif', marginBottom:24 }}>
        📥 Descargar CSV de ejemplo
      </button>

      <div onClick={() => fileRef.current?.click()}
        style={{ border:'2px dashed #e8e0d2', borderRadius:16, padding:48, textAlign:'center', cursor:'pointer', marginBottom:24, background:'#faf8f4', transition:'border-color .15s' }}
        onMouseEnter={e => (e.currentTarget as any).style.borderColor='#84C5BC'}
        onMouseLeave={e => (e.currentTarget as any).style.borderColor='#e8e0d2'}>
        <div style={{ fontSize:40, marginBottom:12 }}>📄</div>
        <p style={{ fontSize:15, color:'#1a1a1a', marginBottom:4 }}>Click para seleccionar CSV</p>
        <p style={{ fontSize:13, color:'#aaa' }}>Archivos .csv o .txt</p>
        <input ref={fileRef} type="file" accept=".csv,.txt" style={{ display:'none' }} onChange={handleFile} />
      </div>

      {error && <div style={{ background:'#fef0f0', border:'1px solid #f0c0c0', borderRadius:12, padding:14, marginBottom:20, fontSize:13, color:'#a32d2d' }}>{error}</div>}

      {result && (
        <div style={{ background:'#e6f5ec', border:'1px solid #c0e0d0', borderRadius:12, padding:20, marginBottom:20 }}>
          <p style={{ fontSize:14, color:'#1a6b3c', fontWeight:500, marginBottom:4 }}>✓ Importación completada</p>
          <p style={{ fontSize:13, color:'#2d7a50', marginBottom:12 }}>{result.created} invitados creados correctamente</p>
          <button onClick={() => router.push(`/dashboard/events/${id}`)}
            style={{ background:'#1a6b3c', color:'#fff', border:'none', padding:'10px 20px', borderRadius:8, fontSize:13, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
            Ir al listado →
          </button>
        </div>
      )}

      {preview.length > 0 && (
        <div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <p style={{ fontSize:14, color:'#1a1a1a', fontWeight:500 }}>{preview.length} invitados encontrados — previsualización</p>
            <button onClick={() => setPreview([])} style={{ fontSize:12, color:'#888', background:'none', border:'none', cursor:'pointer' }}>Limpiar</button>
          </div>
          <div style={{ background:'#fff', border:'1px solid #e8e0d2', borderRadius:16, overflow:'hidden', marginBottom:20 }}>
            <div style={{ display:'grid', gridTemplateColumns:'2fr 2fr 1.5fr 1fr', padding:'10px 16px', background:'#faf8f4', borderBottom:'1px solid #f0ece6', fontSize:11, letterSpacing:2, textTransform:'uppercase' as const, color:'#888' }}>
              <span>Nombre</span><span>Email</span><span>Teléfono</span><span>Grupo</span>
            </div>
            {preview.slice(0,10).map((row, i) => (
              <div key={i} style={{ display:'grid', gridTemplateColumns:'2fr 2fr 1.5fr 1fr', padding:'10px 16px', borderBottom: i < Math.min(preview.length,10)-1 ? '1px solid #f5f0ea' : 'none', fontSize:13, color:'#444' }}>
                <span style={{ color:'#1a1a1a' }}>{row.name}</span>
                <span>{row.email || '—'}</span>
                <span>{row.phone || '—'}</span>
                <span>{row.group || '—'}</span>
              </div>
            ))}
            {preview.length > 10 && <div style={{ padding:'10px 16px', fontSize:12, color:'#888', borderTop:'1px solid #f0ece6' }}>… y {preview.length-10} más</div>}
          </div>
          <button onClick={doImport} disabled={importing}
            style={{ background:'#1a1a1a', color:'#fff', border:'none', padding:'14px 36px', borderRadius:12, fontSize:14, fontWeight:500, cursor:'pointer', fontFamily:'Inter,sans-serif', opacity: importing ? 0.6 : 1 }}>
            {importing ? 'Importando…' : `Importar ${preview.length} invitados`}
          </button>
        </div>
      )}
    </div>
  )
}
