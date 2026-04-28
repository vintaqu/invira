'use client'
import { useState, useEffect } from 'react'

interface PromoCode {
  id: string; code: string; description?: string
  discountType: string; discountValue: number
  appliesTo: string; minAmount?: number
  maxUses?: number; usedCount: number; maxUsesPerUser: number
  validFrom: string; validUntil?: string; isActive: boolean
  _count?: { uses: number }
}

const ff = 'Inter,sans-serif'
const teal = '#84C5BC'

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e0d8d0',
  fontSize: 13, fontFamily: ff, outline: 'none', boxSizing: 'border-box', background: '#fff'
}
const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: '#888', letterSpacing: 1.5,
  textTransform: 'uppercase', display: 'block', marginBottom: 5
}

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({length: 8}, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export default function AdminPromoPage() {
  const [promos, setPromos] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    code: '', description: '', discountType: 'percent', discountValue: '',
    appliesTo: 'all', minAmount: '', maxUses: '', maxUsesPerUser: '1',
    validFrom: '', validUntil: '', isActive: true,
  })

  useEffect(() => { loadPromos() }, [])

  async function loadPromos() {
    setLoading(true)
    const res = await fetch('/api/admin/promo')
    const data = await res.json()
    setPromos(data.promos ?? [])
    setLoading(false)
  }

  function resetForm() {
    setForm({ code: generateCode(), description: '', discountType: 'percent', discountValue: '',
      appliesTo: 'all', minAmount: '', maxUses: '', maxUsesPerUser: '1',
      validFrom: new Date().toISOString().split('T')[0], validUntil: '', isActive: true })
    setEditId(null)
  }

  function openNew() { resetForm(); setShowForm(true) }

  function openEdit(p: PromoCode) {
    setForm({
      code: p.code, description: p.description ?? '', discountType: p.discountType,
      discountValue: String(p.discountValue), appliesTo: p.appliesTo,
      minAmount: p.minAmount ? String(p.minAmount) : '', maxUses: p.maxUses ? String(p.maxUses) : '',
      maxUsesPerUser: String(p.maxUsesPerUser),
      validFrom: p.validFrom.split('T')[0],
      validUntil: p.validUntil ? p.validUntil.split('T')[0] : '',
      isActive: p.isActive,
    })
    setEditId(p.id)
    setShowForm(true)
  }

  async function save() {
    setSaving(true)
    const payload = {
      ...form,
      discountValue: Number(form.discountValue),
      minAmount: form.minAmount ? Number(form.minAmount) : null,
      maxUses: form.maxUses ? Number(form.maxUses) : null,
      maxUsesPerUser: Number(form.maxUsesPerUser),
      validFrom: form.validFrom || new Date().toISOString(),
      validUntil: form.validUntil || null,
    }
    const url = editId ? `/api/admin/promo/${editId}` : '/api/admin/promo'
    const method = editId ? 'PATCH' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (res.ok) { setShowForm(false); loadPromos() }
    setSaving(false)
  }

  async function toggleActive(p: PromoCode) {
    await fetch(`/api/admin/promo/${p.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !p.isActive })
    })
    loadPromos()
  }

  async function deletePromo(id: string) {
    if (!confirm('¿Eliminar este código promocional?')) return
    await fetch(`/api/admin/promo/${id}`, { method: 'DELETE' })
    loadPromos()
  }

  const isExpired = (p: PromoCode) => p.validUntil && new Date(p.validUntil) < new Date()
  const isMaxed = (p: PromoCode) => p.maxUses && p.usedCount >= p.maxUses

  return (
    <div style={{ padding: 'clamp(24px,4vw,40px)', fontFamily: ff }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: 'clamp(24px,3vw,32px)', fontWeight: 400, color: '#1a1a1a', margin: 0 }}>Códigos Promocionales</h1>
          <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>{promos.length} código{promos.length !== 1 ? 's' : ''} creado{promos.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openNew}
          style={{ background: teal, color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: ff }}>
          + Nuevo código
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Total', value: promos.length, color: '#1a1a1a' },
          { label: 'Activos', value: promos.filter(p => p.isActive && !isExpired(p) && !isMaxed(p)).length, color: '#16a34a' },
          { label: 'Usos totales', value: promos.reduce((a, p) => a + p.usedCount, 0), color: teal },
          { label: 'Expirados', value: promos.filter(p => isExpired(p) || isMaxed(p)).length, color: '#dc2626' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #f0ece6', borderRadius: 12, padding: '16px 18px' }}>
            <p style={{ fontSize: 26, fontWeight: 700, color: s.color, margin: 0, lineHeight: 1 }}>{s.value}</p>
            <p style={{ fontSize: 11, color: '#888', margin: '4px 0 0', letterSpacing: 0.5, textTransform: 'uppercase' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <p style={{ color: '#aaa', textAlign: 'center', padding: 40 }}>Cargando…</p>
      ) : promos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', background: '#faf9f6', borderRadius: 16, border: '1px dashed #e0d8d0' }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>🎟️</p>
          <p style={{ fontSize: 16, color: '#888' }}>No hay códigos promocionales todavía</p>
          <button onClick={openNew} style={{ marginTop: 12, background: teal, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, cursor: 'pointer', fontFamily: ff }}>
            Crear el primero
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {promos.map(p => {
            const expired = isExpired(p)
            const maxed = isMaxed(p)
            const effective = p.isActive && !expired && !maxed

            return (
              <div key={p.id} style={{ background: '#fff', border: `1px solid ${effective ? '#e8e2db' : '#f5e0e0'}`, borderRadius: 14, padding: '16px 18px', opacity: effective ? 1 : 0.75 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                      <code style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', letterSpacing: 1, background: '#f5f0ea', padding: '3px 10px', borderRadius: 6 }}>{p.code}</code>
                      {/* Status badge */}
                      {!p.isActive && <span style={{ fontSize: 11, background: '#fee2e2', color: '#dc2626', padding: '2px 8px', borderRadius: 10, fontWeight: 500 }}>Inactivo</span>}
                      {p.isActive && expired && <span style={{ fontSize: 11, background: '#fee2e2', color: '#dc2626', padding: '2px 8px', borderRadius: 10, fontWeight: 500 }}>Expirado</span>}
                      {p.isActive && maxed && <span style={{ fontSize: 11, background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 10, fontWeight: 500 }}>Agotado</span>}
                      {effective && <span style={{ fontSize: 11, background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: 10, fontWeight: 500 }}>Activo</span>}
                      {/* Discount badge */}
                      <span style={{ fontSize: 13, fontWeight: 700, color: teal }}>
                        {p.discountType === 'percent' ? `−${p.discountValue}%` : `−€${p.discountValue}`}
                      </span>
                    </div>
                    {p.description && <p style={{ fontSize: 13, color: '#666', margin: '0 0 6px' }}>{p.description}</p>}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 12, color: '#888' }}>
                      <span>Usos: <strong style={{ color: '#1a1a1a' }}>{p.usedCount}{p.maxUses ? `/${p.maxUses}` : ''}</strong></span>
                      <span>Por usuario: <strong style={{ color: '#1a1a1a' }}>{p.maxUsesPerUser}</strong></span>
                      {p.appliesTo !== 'all' && <span>Plan: <strong style={{ color: '#1a1a1a' }}>{p.appliesTo}</strong></span>}
                      {p.minAmount && <span>Mínimo: <strong style={{ color: '#1a1a1a' }}>€{p.minAmount}</strong></span>}
                      {p.validUntil && <span>Hasta: <strong style={{ color: expired ? '#dc2626' : '#1a1a1a' }}>{new Date(p.validUntil).toLocaleDateString('es-ES')}</strong></span>}
                    </div>
                  </div>
                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button onClick={() => toggleActive(p)}
                      style={{ fontSize: 12, padding: '6px 12px', borderRadius: 8, border: '1px solid #e0d8d0', background: '#fff', cursor: 'pointer', fontFamily: ff, color: '#666' }}>
                      {p.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                    <button onClick={() => openEdit(p)}
                      style={{ fontSize: 12, padding: '6px 12px', borderRadius: 8, border: '1px solid #e0d8d0', background: '#fff', cursor: 'pointer', fontFamily: ff, color: '#666' }}>
                      Editar
                    </button>
                    <button onClick={() => deletePromo(p.id)}
                      style={{ fontSize: 12, padding: '6px 12px', borderRadius: 8, border: '1px solid #fecaca', background: '#fff', cursor: 'pointer', fontFamily: ff, color: '#dc2626' }}>
                      ×
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontFamily: 'Playfair Display,serif', fontSize: 20, color: '#1a1a1a', margin: 0 }}>
                {editId ? 'Editar código' : 'Nuevo código promocional'}
              </p>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#ccc' }}>×</button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Code */}
              <div>
                <label style={labelStyle}>Código *</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    placeholder="BODA2025" style={{ ...inputStyle, flex: 1 }} maxLength={20} />
                  <button onClick={() => setForm(f => ({ ...f, code: generateCode() }))}
                    style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid #e0d8d0', background: '#f8f6f4', cursor: 'pointer', fontSize: 12, fontFamily: ff, whiteSpace: 'nowrap' }}>
                    Generar
                  </button>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Descripción interna</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Campaña bodas 2025" style={inputStyle} />
              </div>

              {/* Discount */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={labelStyle}>Tipo de descuento *</label>
                  <select value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))}
                    style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="percent">Porcentaje (%)</option>
                    <option value="fixed">Importe fijo (€)</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Valor *</label>
                  <div style={{ position: 'relative' }}>
                    <input type="number" min="0" max={form.discountType === 'percent' ? 100 : undefined}
                      value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))}
                      placeholder={form.discountType === 'percent' ? '20' : '10'} style={inputStyle} />
                    <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#888' }}>
                      {form.discountType === 'percent' ? '%' : '€'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Applies to + min amount */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={labelStyle}>Aplicable a</label>
                  <select value={form.appliesTo} onChange={e => setForm(f => ({ ...f, appliesTo: e.target.value }))}
                    style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="all">Todos los planes</option>
                    <option value="esencial">Solo Esencial</option>
                    <option value="premium">Solo Premium</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Importe mínimo (€)</label>
                  <input type="number" min="0" value={form.minAmount}
                    onChange={e => setForm(f => ({ ...f, minAmount: e.target.value }))}
                    placeholder="0 = sin mínimo" style={inputStyle} />
                </div>
              </div>

              {/* Usage limits */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={labelStyle}>Máximo usos totales</label>
                  <input type="number" min="1" value={form.maxUses}
                    onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))}
                    placeholder="Vacío = ilimitado" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Usos por usuario</label>
                  <input type="number" min="1" value={form.maxUsesPerUser}
                    onChange={e => setForm(f => ({ ...f, maxUsesPerUser: e.target.value }))}
                    style={inputStyle} />
                </div>
              </div>

              {/* Validity dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={labelStyle}>Válido desde</label>
                  <input type="date" value={form.validFrom}
                    onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Válido hasta</label>
                  <input type="date" value={form.validUntil}
                    onChange={e => setForm(f => ({ ...f, validUntil: e.target.value }))}
                    placeholder="Sin caducidad" style={inputStyle} />
                </div>
              </div>

              {/* Active toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                  style={{ width: 44, height: 24, borderRadius: 12, background: form.isActive ? teal : '#ddd', cursor: 'pointer', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: 2, left: form.isActive ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
                </div>
                <span style={{ fontSize: 13, color: '#444' }}>Código activo</span>
              </div>

              {/* Preview */}
              {form.discountValue && (
                <div style={{ background: '#f0f9f8', border: '1px solid #c0e0dc', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#0f766e' }}>
                  ✓ Se aplicará un descuento de <strong>
                    {form.discountType === 'percent' ? `${form.discountValue}%` : `€${form.discountValue}`}
                  </strong>
                  {form.appliesTo !== 'all' && ` al plan ${form.appliesTo}`}
                  {form.maxUses && ` · máximo ${form.maxUses} usos`}
                  {form.validUntil && ` · hasta ${new Date(form.validUntil).toLocaleDateString('es-ES')}`}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
                <button onClick={() => setShowForm(false)}
                  style={{ padding: '12px', borderRadius: 10, border: '1px solid #e0d8d0', background: '#fff', cursor: 'pointer', fontSize: 13, fontFamily: ff, color: '#666' }}>
                  Cancelar
                </button>
                <button onClick={save} disabled={saving || !form.code || !form.discountValue}
                  style={{ padding: '12px', borderRadius: 10, border: 'none', background: teal, color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, fontFamily: ff, opacity: (!form.code || !form.discountValue) ? 0.5 : 1 }}>
                  {saving ? 'Guardando…' : editId ? 'Guardar cambios' : 'Crear código'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
