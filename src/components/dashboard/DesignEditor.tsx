'use client'
import { useState, useRef, useEffect } from 'react'

// ─── Types ────────────────────────────────────────────────────
interface DesignConfig {
  templateSlug: string
  colorPrimary: string
  colorAccent: string
  colorBackground: string
  colorText: string
  fontDisplay: string
  fontBody: string
  heroImage: string
  heroOverlay: number        // 0-90 opacity %
  musicUrl: string
  musicName: string
  decorationStyle: string   // 'none' | 'floral' | 'geometric' | 'minimal' | 'romantic' | 'stars'
  layoutStyle: string       // 'split' | 'centered' | 'fullbleed' | 'asymmetric'
  animationIntensity: string // 'none' | 'minimal' | 'moderate'
}

interface Props {
  event: {
    id: string
    slug: string
    status?: string
    title: string
    coupleNames?: string
    heroImage?: string
    customData?: any
  }
}

// ─── Templates ────────────────────────────────────────────────
const TEMPLATES = [
  {
    slug: 'noche-de-gala',
    name: 'Noche de Gala',
    category: 'Bodas',
    premium: false,
    preview: {
      bg: '#1a1714', accent: '#84C5BC', text: '#ffffff',
      font: 'Playfair Display', layout: 'split',
      img: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=60&auto=format&fit=crop',
    },
    config: { colorPrimary:'#1a1714', colorAccent:'#84C5BC', colorBackground:'#faf8f4', colorText:'#ffffff', fontDisplay:'Playfair Display', fontBody:'Inter', decorationStyle:'none', layoutStyle:'split' },
  },
  {
    slug: 'garden-romance',
    name: 'Garden Romance',
    category: 'Bodas',
    premium: false,
    preview: {
      bg: '#f5f0ea', accent: '#c9916e', text: '#3a2a1a',
      font: 'Cormorant Garamond', layout: 'centered',
      img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&q=60&auto=format&fit=crop',
    },
    config: { colorPrimary:'#3a2a1a', colorAccent:'#c9916e', colorBackground:'#fdf9f4', colorText:'#3a2a1a', fontDisplay:'Cormorant Garamond', fontBody:'Lato', decorationStyle:'floral', layoutStyle:'centered' },
  },
  {
    slug: 'luxury-black',
    name: 'Luxury Black',
    category: 'Bodas',
    premium: false,
    preview: {
      bg: '#0a0a0a', accent: '#c9a96e', text: '#ffffff',
      font: 'Cormorant Garamond', layout: 'fullbleed',
      img: 'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=400&q=60&auto=format&fit=crop',
    },
    config: { colorPrimary:'#0a0a0a', colorAccent:'#c9a96e', colorBackground:'#111', colorText:'#ffffff', fontDisplay:'Cormorant Garamond', fontBody:'DM Sans', decorationStyle:'minimal', layoutStyle:'fullbleed' },
  },
  {
    slug: 'rose-gold',
    name: 'Rose Gold',
    category: 'Bodas',
    premium: false,
    preview: {
      bg: '#fff5f5', accent: '#e8a0a0', text: '#4a1a1a',
      font: 'Playfair Display', layout: 'centered',
      img: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=400&q=60&auto=format&fit=crop',
    },
    config: { colorPrimary:'#4a1a1a', colorAccent:'#e8a0a0', colorBackground:'#fff5f5', colorText:'#4a1a1a', fontDisplay:'Playfair Display', fontBody:'Nunito', decorationStyle:'romantic', layoutStyle:'centered' },
  },
  {
    slug: 'sage-green',
    name: 'Sage & Green',
    category: 'Bodas',
    premium: false,
    preview: {
      bg: '#f4f7f0', accent: '#7a9a70', text: '#2a3a20',
      font: 'Cormorant Garamond', layout: 'split',
      img: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=60&auto=format&fit=crop',
    },
    config: { colorPrimary:'#2a3a20', colorAccent:'#7a9a70', colorBackground:'#f4f7f0', colorText:'#2a3a20', fontDisplay:'Cormorant Garamond', fontBody:'Source Serif 4', decorationStyle:'floral', layoutStyle:'split' },
  },
  {
    slug: 'navy-blue',
    name: 'Navy & Gold',
    category: 'Bodas',
    premium: false,
    preview: {
      bg: '#1a2540', accent: '#c9a96e', text: '#ffffff',
      font: 'Playfair Display', layout: 'centered',
      img: 'https://images.unsplash.com/photo-1487530811015-780780f38a0c?w=400&q=60&auto=format&fit=crop',
    },
    config: { colorPrimary:'#1a2540', colorAccent:'#c9a96e', colorBackground:'#f0f3fa', colorText:'#ffffff', fontDisplay:'Playfair Display', fontBody:'Montserrat', decorationStyle:'geometric', layoutStyle:'centered' },
  },
  {
    slug: 'boho-chic',
    name: 'Boho Chic',
    category: 'Bodas',
    premium: false,
    preview: {
      bg: '#f7f0e6', accent: '#c4875a', text: '#3a2010',
      font: 'Satisfy', layout: 'asymmetric',
      img: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&q=60&auto=format&fit=crop',
    },
    config: { colorPrimary:'#3a2010', colorAccent:'#c4875a', colorBackground:'#f7f0e6', colorText:'#3a2010', fontDisplay:'Satisfy', fontBody:'Jost', decorationStyle:'floral', layoutStyle:'asymmetric' },
  },
  {
    slug: 'cumple-vibrante',
    name: 'Fiesta Vibrante',
    category: 'Cumpleaños',
    premium: false,
    preview: {
      bg: '#1a0a2e', accent: '#ff6bb5', text: '#ffffff',
      font: 'Poppins', layout: 'centered',
      img: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&q=60&auto=format&fit=crop',
    },
    config: { colorPrimary:'#1a0a2e', colorAccent:'#ff6bb5', colorBackground:'#f0e8ff', colorText:'#ffffff', fontDisplay:'Poppins', fontBody:'Poppins', decorationStyle:'stars', layoutStyle:'centered' },
  },
  {
    slug: 'cumple-pastel',
    name: 'Pastel Dream',
    category: 'Cumpleaños',
    premium: false,
    preview: {
      bg: '#fef0f8', accent: '#f0a0d0', text: '#4a1a3a',
      font: 'Nunito', layout: 'centered',
      img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=60&auto=format&fit=crop',
    },
    config: { colorPrimary:'#4a1a3a', colorAccent:'#f0a0d0', colorBackground:'#fef0f8', colorText:'#4a1a3a', fontDisplay:'Nunito', fontBody:'Nunito', decorationStyle:'romantic', layoutStyle:'centered' },
  },
  {
    slug: 'corporate-dark',
    name: 'Corporate Dark',
    category: 'Corporativo',
    premium: false,
    preview: {
      bg: '#1e2d3a', accent: '#4a9eff', text: '#ffffff',
      font: 'Inter', layout: 'fullbleed',
      img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=60&auto=format&fit=crop',
    },
    config: { colorPrimary:'#1e2d3a', colorAccent:'#4a9eff', colorBackground:'#f5f7fa', colorText:'#ffffff', fontDisplay:'Inter', fontBody:'Inter', decorationStyle:'geometric', layoutStyle:'fullbleed' },
  },
  {
    slug: 'corporate-light',
    name: 'Corporate Light',
    category: 'Corporativo',
    premium: false,
    preview: {
      bg: '#ffffff', accent: '#2563eb', text: '#1a1a2e',
      font: 'Montserrat', layout: 'split',
      img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=60&auto=format&fit=crop',
    },
    config: { colorPrimary:'#1a1a2e', colorAccent:'#2563eb', colorBackground:'#f8faff', colorText:'#1a1a2e', fontDisplay:'Montserrat', fontBody:'Open Sans', decorationStyle:'minimal', layoutStyle:'split' },
  },
  {
    slug: 'comunion-blanco',
    name: 'Primera Comunión',
    category: 'Comunión',
    premium: false,
    preview: {
      bg: '#f8f6ff', accent: '#a090d0', text: '#2a1a4a',
      font: 'Cormorant Garamond', layout: 'centered',
      img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=60&auto=format&fit=crop',
    },
    config: { colorPrimary:'#2a1a4a', colorAccent:'#a090d0', colorBackground:'#f8f6ff', colorText:'#2a1a4a', fontDisplay:'Cormorant Garamond', fontBody:'Lora', decorationStyle:'floral', layoutStyle:'centered' },
  },
]

const CATEGORIES = ['Todas', ...Array.from(new Set(TEMPLATES.map(t => t.category)))]

const FONTS_DISPLAY = [
  { name: 'Playfair Display', label: 'Playfair Display', style: 'serif' },
  { name: 'Cormorant Garamond', label: 'Cormorant Garamond', style: 'serif' },
  { name: 'Satisfy', label: 'Satisfy', style: 'script' },
  { name: 'Great Vibes', label: 'Great Vibes', style: 'script' },
  { name: 'Cinzel', label: 'Cinzel', style: 'serif' },
  { name: 'Libre Baskerville', label: 'Libre Baskerville', style: 'serif' },
  { name: 'Montserrat', label: 'Montserrat', style: 'sans' },
  { name: 'Poppins', label: 'Poppins', style: 'sans' },
  { name: 'Inter', label: 'Inter', style: 'sans' },
  { name: 'Nunito', label: 'Nunito', style: 'sans' },
  { name: 'Josefin Sans', label: 'Josefin Sans', style: 'sans' },
  { name: 'Raleway', label: 'Raleway', style: 'sans' },
]

const FONTS_BODY = [
  { name: 'Inter', label: 'Inter' },
  { name: 'DM Sans', label: 'DM Sans' },
  { name: 'Lato', label: 'Lato' },
  { name: 'Nunito', label: 'Nunito' },
  { name: 'Open Sans', label: 'Open Sans' },
  { name: 'Source Serif 4', label: 'Source Serif 4' },
  { name: 'Lora', label: 'Lora' },
  { name: 'Jost', label: 'Jost' },
  { name: 'Montserrat', label: 'Montserrat' },
  { name: 'Poppins', label: 'Poppins' },
]

const COLOR_PALETTES = [
  { name: 'Noche Dorada',   colors: ['#1a1714','#84C5BC','#faf8f4','#ffffff'] },
  { name: 'Jardín Rosa',    colors: ['#3a2a1a','#c9916e','#fdf9f4','#3a2a1a'] },
  { name: 'Lujo Negro',     colors: ['#0a0a0a','#c9a96e','#111111','#ffffff'] },
  { name: 'Rose Gold',      colors: ['#4a1a1a','#e8a0a0','#fff5f5','#4a1a1a'] },
  { name: 'Sage Verde',     colors: ['#2a3a20','#7a9a70','#f4f7f0','#2a3a20'] },
  { name: 'Navy & Oro',     colors: ['#1a2540','#c9a96e','#f0f3fa','#ffffff'] },
  { name: 'Fiesta Neón',    colors: ['#1a0a2e','#ff6bb5','#f0e8ff','#ffffff'] },
  { name: 'Pastel Suave',   colors: ['#4a1a3a','#f0a0d0','#fef0f8','#4a1a3a'] },
  { name: 'Azul Corporativo',colors: ['#1a1a2e','#2563eb','#f8faff','#1a1a2e'] },
  { name: 'Terracota',      colors: ['#3a1a0a','#c4875a','#f7f0e6','#3a1a0a'] },
  { name: 'Menta Fresca',   colors: ['#0a2a20','#50c0a0','#f0faf6','#0a2a20'] },
  { name: 'Cielo Claro',    colors: ['#1a2a3a','#70a0c0','#f0f5fa','#1a2a3a'] },
]

const DECORATIONS = [
  { id: 'none',      label: 'Sin decoración',  emoji: '○' },
  { id: 'floral',    label: 'Floral',           emoji: '🌸' },
  { id: 'geometric', label: 'Geométrico',       emoji: '◇' },
  { id: 'minimal',   label: 'Minimalista',      emoji: '—' },
  { id: 'romantic',  label: 'Romántico',        emoji: '♡' },
  { id: 'stars',     label: 'Estrellas',        emoji: '✦' },
  { id: 'leaves',    label: 'Hojas',            emoji: '🍃' },
  { id: 'waves',     label: 'Ondas',            emoji: '〰' },
]

const ANIMATIONS = [
  { id: 'none',     label: 'Sin animaciones' },
  { id: 'minimal',  label: 'Sutiles' },
  { id: 'moderate', label: 'Moderadas' },
]

const LAYOUTS = [
  { id: 'split',      label: 'Dividido',    desc: 'Texto izq · Foto der' },
  { id: 'centered',   label: 'Centrado',    desc: 'Todo centrado' },
  { id: 'fullbleed',  label: 'Full Bleed',  desc: 'Foto de fondo' },
  { id: 'asymmetric', label: 'Asimétrico',  desc: 'Estilo editorial' },
]

const MUSIC_SUGGESTIONS = [
  { title: 'La Vie en Rose',              artist: 'Édith Piaf',       ytId: 'rzeLynr_jIo' },
  { title: "Can't Help Falling In Love",  artist: 'Elvis Presley',    ytId: 'vGJTaP6anOU' },
  { title: 'Perfect',                     artist: 'Ed Sheeran',       ytId: '2Vv-BfVoq4g' },
  { title: 'A Thousand Years',            artist: 'Christina Perri',  ytId: 'rtOvBOTyX00' },
  { title: 'All of Me',                   artist: 'John Legend',      ytId: '450p7goxZqg' },
  { title: 'Thinking Out Loud',           artist: 'Ed Sheeran',       ytId: 'lp-EO5I60KA' },
  { title: 'Marry You',                   artist: 'Bruno Mars',       ytId: 'dElRVQFqj-k' },
  { title: 'At Last',                     artist: 'Etta James',       ytId: 'MnqQdHFxDFw' },
  { title: 'Lover',                       artist: 'Taylor Swift',     ytId: 'AQNvKGnJzOw' },
  { title: 'Make You Feel My Love',       artist: 'Adele',            ytId: '0put0_a--Ng' },
  { title: 'Speak Softly Love',           artist: 'Andy Williams',    ytId: 'oHlt7CKogbU' },
  { title: 'Corcovado',                   artist: 'Stan Getz',        ytId: 'L4gkEfwgkHY' },
]

const BORDERS = [
  { id: 'none',    label: 'Sin borde',   preview: '' },
  { id: 'thin',    label: 'Fino',        preview: '1px solid' },
  { id: 'double',  label: 'Doble',       preview: '3px double' },
  { id: 'ornate',  label: 'Ornamental',  preview: '2px dashed' },
]

const SEPARATORS = [
  { id: 'line',    label: 'Línea',    symbol: '────────' },
  { id: 'dots',    label: 'Puntos',   symbol: '· · · · · ·' },
  { id: 'diamond', label: 'Diamante', symbol: '◇ ─ ◇ ─ ◇' },
  { id: 'floral',  label: 'Floral',   symbol: '❧ ─ ✦ ─ ❧' },
  { id: 'stars',   label: 'Estrellas',symbol: '✦ · · · ✦' },
  { id: 'waves',   label: 'Ondas',    symbol: '〰〰〰〰〰' },
]

const TITLE_SIZES = [
  { id: 'small',  label: 'Pequeño', px: 22 },
  { id: 'medium', label: 'Mediano', px: 28 },
  { id: 'large',  label: 'Grande',  px: 36 },
  { id: 'xlarge', label: 'Gigante', px: 48 },
]

// ─── MAIN COMPONENT ──────────────────────────────────────────
export function DesignEditor({ event }: Props) {
  const savedConfig = (event.customData?.design ?? {}) as Partial<DesignConfig>

  const [config, setConfig] = useState<DesignConfig>({
    templateSlug:       savedConfig.templateSlug       ?? 'noche-de-gala',
    colorPrimary:       savedConfig.colorPrimary       ?? '#1a1714',
    colorAccent:        savedConfig.colorAccent        ?? '#84C5BC',
    colorBackground:    savedConfig.colorBackground    ?? '#faf8f4',
    colorText:          savedConfig.colorText          ?? '#ffffff',
    fontDisplay:        savedConfig.fontDisplay        ?? 'Playfair Display',
    fontBody:           savedConfig.fontBody           ?? 'Inter',
    heroImage:          savedConfig.heroImage          ?? event.heroImage ?? '',
    heroOverlay:        savedConfig.heroOverlay        ?? 50,
    musicUrl:           savedConfig.musicUrl           ?? '',
    musicName:          savedConfig.musicName          ?? '',
    decorationStyle:    savedConfig.decorationStyle    ?? 'none',
    layoutStyle:        savedConfig.layoutStyle        ?? 'split',
    animationIntensity: savedConfig.animationIntensity ?? 'minimal',
    borderStyle:        savedConfig.borderStyle        ?? 'none',
    separatorStyle:     savedConfig.separatorStyle     ?? 'line',
    heroHeight:         savedConfig.heroHeight         ?? 55,
    textAlign:          savedConfig.textAlign          ?? 'center',
    titleSize:          savedConfig.titleSize          ?? 'large',
    accentOpacity:      savedConfig.accentOpacity      ?? 70,
  })

  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [catFilter, setCatFilter] = useState('Todas')
  const fileRef = useRef<HTMLInputElement>(null)
  const musicRef = useRef<HTMLInputElement>(null)
  const saveTimer = useRef<NodeJS.Timeout | null>(null)

  function update(patch: Partial<DesignConfig>) {
    const next = { ...config, ...patch }
    setConfig(next)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => saveConfig(next), 1500)
  }

  async function saveConfig(cfg: DesignConfig) {
    setSaving(true)
    try {
      await fetch(`/api/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heroImage: cfg.heroImage,
          customData: { design: cfg },
        }),
      })
      setSaved(true); setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  async function handleHeroUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    if (file.size > 10 * 1024 * 1024) { alert('Imagen demasiado grande (máx 10MB)'); return }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file); fd.append('eventId', event.id); fd.append('type', 'image')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.media?.url) {
        update({ heroImage: data.media.url })
      } else {
        alert('Error al subir: ' + (data.error ?? 'Error desconocido'))
      }
    } catch { alert('Error de conexión') } finally { setUploading(false) }
  }

  async function handleMusicUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('eventId', event.id)
      fd.append('type', 'audio')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.media?.url) {
        update({ musicName: file.name.replace(/\.[^/.]+$/, ''), musicUrl: data.media.url })
      } else {
        // Fallback: save as blob URL for preview only (won't persist after page refresh)
        update({ musicName: file.name.replace(/\.[^/.]+$/, ''), musicUrl: URL.createObjectURL(file) })
      }
    } catch {
      update({ musicName: file.name.replace(/\.[^/.]+$/, ''), musicUrl: URL.createObjectURL(file) })
    } finally { setUploading(false) }
  }

  function applyTemplate(t: typeof TEMPLATES[0]) {
    update({ templateSlug: t.slug, ...t.config as any })
  }

  function applyPalette(p: typeof COLOR_PALETTES[0]) {
    update({ colorPrimary: p.colors[0], colorAccent: p.colors[1], colorBackground: p.colors[2], colorText: p.colors[3] })
  }

  const sections = [
    { id: 'plantillas', label: 'Plantillas', icon: '⊞' },
    { id: 'fotos',      label: 'Fotos',      icon: '🖼' },
    { id: 'colores',    label: 'Colores',    icon: '◉' },
    { id: 'tipografia', label: 'Fuentes',    icon: 'T' },
    { id: 'layout',     label: 'Layout',     icon: '⊡' },
    { id: 'estilo',     label: 'Estilo',     icon: '✦' },
    { id: 'detalles',   label: 'Detalles',   icon: '◈' },
    { id: 'musica',     label: 'Música',     icon: '♪' },
    { id: 'animacion',  label: 'Animación',  icon: '▶' },
  ]

  const currentTemplate = TEMPLATES.find(t => t.slug === config.templateSlug) ?? TEMPLATES[0]
  const filteredTemplates = catFilter === 'Todas' ? TEMPLATES : TEMPLATES.filter(t => t.category === catFilter)

  const panelStyle: React.CSSProperties = {
    background: '#fff',
    borderRight: '1px solid #e8e0d2',
    width: 320,
    height: '100%',
    overflowY: 'auto',
    flexShrink: 0,
  }

  const sectionTitle: React.CSSProperties = {
    fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
    color: '#888', marginBottom: 16, fontFamily: 'Inter,sans-serif',
  }

  return (
    <div className="de-root" style={{ display:'flex', height:'calc(100vh - 128px)', fontFamily:'Inter,sans-serif', fontWeight:300 }}>
      <style>{`
        @media (max-width: 768px) {
          .de-root { flex-direction: column !important; height: auto !important; min-height: calc(100vh - 128px) !important; }
          .de-leftnav {
            width: 100% !important;
            flex-direction: row !important;
            height: auto !important;
            padding: 6px 8px !important;
            gap: 2px !important;
            overflow-x: auto !important;
            justify-content: flex-start !important;
          }
          .de-leftnav button { width: 56px !important; height: 48px !important; border-radius: 10px !important; flex-shrink: 0 !important; }
          .de-leftnav .de-save { display: none !important; }
          .de-panel { width: 100% !important; height: auto !important; border-right: none !important; border-bottom: 1px solid #e8e0d2 !important; max-height: 60vh !important; }
          .de-preview { display: none !important; }
        }
      `}</style>

      {/* ── LEFT NAV ── */}
      <div className="de-leftnav" style={{ width:72, background:'#0f0c0a', display:'flex', flexDirection:'column', alignItems:'center', paddingTop:16, gap:4, flexShrink:0 }}>
        {sections.map(s => (
          <button key={s.id} onClick={() => setActiveSection(activeSection === s.id ? null : s.id)}
            title={s.label}
            style={{ width:52, height:52, borderRadius:12, border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:3, transition:'all .15s', fontFamily:'Inter,sans-serif',
              background: activeSection === s.id ? 'rgba(132,197,188,0.2)' : 'transparent',
              color: activeSection === s.id ? '#84C5BC' : 'rgba(255,255,255,0.4)',
            }}
            onMouseEnter={e => { if (activeSection !== s.id) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)' }}
            onMouseLeave={e => { if (activeSection !== s.id) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}>
            <span style={{ fontSize:18, lineHeight:1 }}>{s.icon}</span>
            <span style={{ fontSize:9, letterSpacing:0.5 }}>{s.label}</span>
          </button>
        ))}
        <div style={{ flex:1 }} />
        {/* Save indicator */}
        <div className="de-save" style={{ marginBottom:16, fontSize:10, color: saved ? '#22c55e' : saving ? '#84C5BC' : 'rgba(255,255,255,0.2)', textAlign:'center', padding:'0 4px' }}>
          {saved ? '✓ OK' : saving ? '...' : ''}
        </div>
      </div>

      {/* ── PANEL ── */}
      {activeSection && (
        <div className="de-panel" style={panelStyle}>
          <div style={{ padding:20, borderBottom:'1px solid #f0ece6', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <p style={{ ...sectionTitle, margin:0 }}>{sections.find(s => s.id === activeSection)?.label}</p>
            <button onClick={() => setActiveSection(null)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:18, color:'#888', lineHeight:1 }}>×</button>
          </div>
          <div style={{ padding:20, overflowY:'auto' }}>

            {/* PLANTILLAS */}
            {activeSection === 'plantillas' && (
              <div>
                <div style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap' }}>
                  {CATEGORIES.map(c => (
                    <button key={c} onClick={() => setCatFilter(c)}
                      style={{ fontSize:11, padding:'5px 12px', borderRadius:20, border:'none', cursor:'pointer', fontFamily:'Inter,sans-serif', transition:'all .15s',
                        background: catFilter===c ? '#1a1a1a' : '#f0ece6',
                        color: catFilter===c ? '#fff' : '#666',
                      }}>
                      {c}
                    </button>
                  ))}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  {filteredTemplates.map(t => (
                    <div key={t.slug} onClick={() => applyTemplate(t)}
                      style={{ borderRadius:12, overflow:'hidden', border:'2px solid', borderColor: config.templateSlug===t.slug ? '#84C5BC' : '#f0ece6', cursor:'pointer', transition:'all .2s', position:'relative' }}>
                      {/* Preview card */}
                      <div style={{ height:110, background: t.preview.bg, position:'relative', overflow:'hidden' }}>
                        <img src={t.preview.img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', opacity:0.4 }} />
                        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:8 }}>
                          <p style={{ fontFamily: t.preview.font+',serif', fontSize:13, color: t.preview.text, textAlign:'center', lineHeight:1.3, margin:0, textShadow:'0 1px 3px rgba(0,0,0,0.4)' }}>
                            {event.coupleNames ?? event.title}
                          </p>
                          <div style={{ width:24, height:1, background: t.preview.accent, margin:'5px auto' }} />
                          <p style={{ fontSize:8, color: t.preview.accent, letterSpacing:1.5, textTransform:'uppercase', margin:0 }}>2025</p>
                        </div>
                        {config.templateSlug===t.slug && (
                          <div style={{ position:'absolute', top:6, right:6, width:18, height:18, background:'#84C5BC', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#fff' }}>✓</div>
                        )}
                      </div>
                      <div style={{ padding:'8px 10px', background:'#fff' }}>
                        <p style={{ fontSize:12, fontWeight:500, color:'#1a1a1a', margin:'0 0 2px' }}>{t.name}</p>
                        <p style={{ fontSize:10, color:'#888', margin:0 }}>{t.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FOTOS */}
            {activeSection === 'fotos' && (
              <div>
                <p style={sectionTitle}>Imagen principal (Hero)</p>
                <div onClick={() => fileRef.current?.click()}
                  style={{ width:'100%', height:140, borderRadius:12, border:'2px dashed #e8e0d2', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', marginBottom:12, overflow:'hidden', position:'relative', background:'#faf8f4' }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor='#84C5BC'}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor='#e8e0d2'}>
                  {config.heroImage ? (
                    <img src={config.heroImage} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  ) : (
                    <>
                      <span style={{ fontSize:28, marginBottom:6 }}>🖼</span>
                      <p style={{ fontSize:13, color:'#888', margin:0 }}>Click para subir foto</p>
                      <p style={{ fontSize:11, color:'#bbb', margin:'4px 0 0' }}>JPG, PNG, WebP</p>
                    </>
                  )}
                  {uploading && <div style={{ position:'absolute', inset:0, background:'rgba(255,255,255,0.8)', display:'flex', alignItems:'center', justifyContent:'center' }}><div style={{ width:24, height:24, border:'2px solid #84C5BC', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .7s linear infinite' }} /></div>}
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleHeroUpload} />

                {config.heroImage && (
                  <>
                    <div style={{ marginBottom:16 }}>
                      <p style={{ ...sectionTitle, marginBottom:8 }}>Opacidad del overlay</p>
                      <input type="range" min={0} max={90} step={5} value={config.heroOverlay}
                        onChange={e => update({ heroOverlay: Number(e.target.value) })}
                        style={{ width:'100%' }} />
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#888' }}>
                        <span>Transparente</span>
                        <span style={{ color:'#84C5BC', fontWeight:500 }}>{config.heroOverlay}%</span>
                        <span>Oscuro</span>
                      </div>
                    </div>
                    <button onClick={() => update({ heroImage: '' })}
                      style={{ fontSize:12, color:'#a32d2d', background:'none', border:'none', cursor:'pointer', padding:0 }}>
                      × Eliminar imagen
                    </button>
                  </>
                )}

                <div style={{ marginTop:20 }}>
                  <p style={{ ...sectionTitle }}>Fotos de Unsplash</p>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
                    {[
                      'photo-1519741497674-611481863552',
                      'photo-1511285560929-80b456fea0bc',
                      'photo-1465495976277-4387d4b0e4a6',
                      'photo-1530103862676-de8c9debad1d',
                      'photo-1544716278-ca5e3f4abd8c',
                      'photo-1540575467063-178a50c2df87',
                    ].map(id => {
                      const url = `https://images.unsplash.com/${id}?w=400&q=60&auto=format&fit=crop`
                      return (
                        <div key={id} onClick={() => update({ heroImage: url })}
                          style={{ aspectRatio:'1', borderRadius:8, overflow:'hidden', cursor:'pointer', border:'2px solid', borderColor: config.heroImage===url ? '#84C5BC' : 'transparent' }}>
                          <img src={url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* COLORES */}
            {activeSection === 'colores' && (
              <div>
                <p style={sectionTitle}>Paletas predefinidas</p>
                <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:24 }}>
                  {COLOR_PALETTES.map(p => (
                    <div key={p.name} onClick={() => applyPalette(p)}
                      style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, border:'1px solid', borderColor: config.colorPrimary===p.colors[0] && config.colorAccent===p.colors[1] ? '#84C5BC' : '#f0ece6', cursor:'pointer', background: config.colorPrimary===p.colors[0] ? '#f0f9f8' : '#fff' }}>
                      <div style={{ display:'flex', gap:3 }}>
                        {p.colors.map((c,i) => (
                          <div key={i} style={{ width:18, height:18, borderRadius:4, background:c, border:'1px solid rgba(0,0,0,0.1)' }} />
                        ))}
                      </div>
                      <span style={{ fontSize:12, color:'#444' }}>{p.name}</span>
                      {config.colorPrimary===p.colors[0] && config.colorAccent===p.colors[1] && <span style={{ marginLeft:'auto', fontSize:12, color:'#84C5BC' }}>✓</span>}
                    </div>
                  ))}
                </div>

                <p style={sectionTitle}>Colores personalizados</p>
                {[
                  { key:'colorPrimary', label:'Color principal' },
                  { key:'colorAccent', label:'Color de acento' },
                  { key:'colorBackground', label:'Fondo' },
                  { key:'colorText', label:'Texto sobre hero' },
                ].map(({ key, label }) => (
                  <div key={key} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                    <label style={{ fontSize:13, color:'#444', flex:1 }}>{label}</label>
                    <input type="color" value={(config as any)[key]}
                      onChange={e => update({ [key]: e.target.value } as any)}
                      style={{ width:36, height:36, borderRadius:8, border:'1px solid #e8e0d2', cursor:'pointer', padding:2 }} />
                    <span style={{ fontSize:11, color:'#aaa', fontFamily:'monospace' }}>{(config as any)[key]}</span>
                  </div>
                ))}
              </div>
            )}

            {/* TIPOGRAFÍA */}
            {activeSection === 'tipografia' && (
              <div>
                <p style={sectionTitle}>Fuente de títulos</p>
                <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:24 }}>
                  {FONTS_DISPLAY.map(f => (
                    <div key={f.name} onClick={() => update({ fontDisplay: f.name })}
                      style={{ padding:'12px 14px', borderRadius:10, border:'1px solid', borderColor: config.fontDisplay===f.name ? '#84C5BC' : '#f0ece6', cursor:'pointer', background: config.fontDisplay===f.name ? '#f0f9f8' : '#fff', display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{ fontFamily:f.name+',serif', fontSize:20, flex:1, color:'#1a1a1a', lineHeight:1.2 }}>
                        {event.coupleNames?.split('&')[0]?.trim() ?? 'Título'}
                      </span>
                      <div style={{ textAlign:'right' }}>
                        <p style={{ fontSize:11, color:'#888', margin:0 }}>{f.name}</p>
                        <p style={{ fontSize:10, color:'#bbb', margin:0 }}>{f.style}</p>
                      </div>
                      {config.fontDisplay===f.name && <span style={{ color:'#84C5BC', fontSize:14 }}>✓</span>}
                    </div>
                  ))}
                </div>

                <p style={sectionTitle}>Fuente de texto</p>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {FONTS_BODY.map(f => (
                    <div key={f.name} onClick={() => update({ fontBody: f.name })}
                      style={{ padding:'10px 14px', borderRadius:10, border:'1px solid', borderColor: config.fontBody===f.name ? '#84C5BC' : '#f0ece6', cursor:'pointer', background: config.fontBody===f.name ? '#f0f9f8' : '#fff', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <span style={{ fontFamily:f.name+',sans-serif', fontSize:14, color:'#444' }}>
                        El texto de tu invitación
                      </span>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:11, color:'#888' }}>{f.label}</span>
                        {config.fontBody===f.name && <span style={{ color:'#84C5BC', fontSize:12 }}>✓</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LAYOUT */}
            {activeSection === 'layout' && (
              <div>
                <p style={sectionTitle}>Distribución de la invitación</p>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:28 }}>
                  {LAYOUTS.map(l => (
                    <div key={l.id} onClick={() => update({ layoutStyle: l.id })}
                      style={{ padding:'14px 12px', borderRadius:12, border:'2px solid', borderColor: config.layoutStyle===l.id ? '#84C5BC' : '#f0ece6', cursor:'pointer', textAlign:'center', background: config.layoutStyle===l.id ? '#f0f9f8' : '#fff' }}>
                      {/* Layout preview */}
                      <div style={{ height:52, background:'#f0ece6', borderRadius:8, marginBottom:8, display:'flex', overflow:'hidden', gap:2, padding:4 }}>
                        {l.id === 'split' && (<><div style={{ flex:1, background:'#d4c8b8', borderRadius:4 }} /><div style={{ flex:1, background:'#c0a898', borderRadius:4 }} /></>)}
                        {l.id === 'centered' && <div style={{ flex:1, background:'#d4c8b8', borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center' }}><div style={{ width:20, height:2, background:'#a09080', borderRadius:1 }} /></div>}
                        {l.id === 'fullbleed' && <div style={{ flex:1, background:'linear-gradient(135deg,#c0a898,#d4c8b8)', borderRadius:4 }} />}
                        {l.id === 'asymmetric' && (<><div style={{ flex:2, background:'#d4c8b8', borderRadius:4 }} /><div style={{ flex:1, background:'#c0a898', borderRadius:4 }} /></>)}
                      </div>
                      <p style={{ fontSize:12, fontWeight:500, color:'#1a1a1a', margin:'0 0 2px' }}>{l.label}</p>
                      <p style={{ fontSize:10, color:'#888', margin:0 }}>{l.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ESTILO */}
            {activeSection === 'estilo' && (
              <div>
                <p style={sectionTitle}>Decoración de fondo</p>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:24 }}>
                  {DECORATIONS.map(d => (
                    <div key={d.id} onClick={() => update({ decorationStyle: d.id })}
                      style={{ padding:'12px', borderRadius:12, border:'2px solid', borderColor: config.decorationStyle===d.id ? '#84C5BC' : '#f0ece6', cursor:'pointer', textAlign:'center', background: config.decorationStyle===d.id ? '#f0f9f8' : '#fff', transition:'all .15s' }}>
                      <div style={{ fontSize:24, marginBottom:4, lineHeight:1 }}>{d.emoji}</div>
                      <p style={{ fontSize:11, color:'#444', margin:0 }}>{d.label}</p>
                    </div>
                  ))}
                </div>

                <p style={sectionTitle}>Separador decorativo</p>
                <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:24 }}>
                  {SEPARATORS.map(s => (
                    <div key={s.id} onClick={() => update({ separatorStyle: s.id })}
                      style={{ padding:'11px 14px', borderRadius:10, border:'1.5px solid', borderColor: config.separatorStyle===s.id ? '#84C5BC' : '#f0ece6', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', background: config.separatorStyle===s.id ? '#f0f9f8' : '#fff', transition:'all .15s' }}>
                      <span style={{ fontSize:13, color:'#1a1a1a', fontFamily:'serif', letterSpacing:2 }}>{s.symbol}</span>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:11, color:'#888' }}>{s.label}</span>
                        {config.separatorStyle===s.id && <span style={{ color:'#84C5BC', fontSize:12 }}>✓</span>}
                      </div>
                    </div>
                  ))}
                </div>

                <p style={sectionTitle}>Borde de la tarjeta</p>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  {BORDERS.map(b => (
                    <div key={b.id} onClick={() => update({ borderStyle: b.id })}
                      style={{ padding:'12px', borderRadius:10, border:'1.5px solid', borderColor: config.borderStyle===b.id ? '#84C5BC' : '#f0ece6', cursor:'pointer', textAlign:'center', background: config.borderStyle===b.id ? '#f0f9f8' : '#fff', transition:'all .15s' }}>
                      <div style={{ width:'100%', height:32, borderRadius:6, background:'#f5f0ea', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:6, border: b.id === 'none' ? '1px dashed #e0d8d0' : b.id === 'thin' ? '1px solid #c0a898' : b.id === 'double' ? '3px double #c0a898' : '2px dashed #c0a898' }}>
                        <span style={{ fontSize:8, color:'#a89880', letterSpacing:1 }}>CARD</span>
                      </div>
                      <p style={{ fontSize:11, color:'#444', margin:0 }}>{b.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DETALLES */}
            {activeSection === 'detalles' && (
              <div>
                <p style={sectionTitle}>Tamaño del título</p>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:24 }}>
                  {TITLE_SIZES.map(s => (
                    <div key={s.id} onClick={() => update({ titleSize: s.id })}
                      style={{ padding:'14px 10px', borderRadius:12, border:'1.5px solid', borderColor: config.titleSize===s.id ? '#84C5BC' : '#f0ece6', cursor:'pointer', textAlign:'center', background: config.titleSize===s.id ? '#f0f9f8' : '#fff', transition:'all .15s' }}>
                      <p style={{ fontFamily:'Playfair Display,serif', fontSize: s.px * 0.5, fontWeight:400, color:'#1a1a1a', lineHeight:1, margin:'0 0 4px' }}>Aa</p>
                      <p style={{ fontSize:10, color:'#888', margin:0 }}>{s.label}</p>
                      <p style={{ fontSize:9, color:'#bbb', margin:0 }}>{s.px}px</p>
                    </div>
                  ))}
                </div>

                <p style={sectionTitle}>Alineación del texto</p>
                <div style={{ display:'flex', gap:8, marginBottom:24 }}>
                  {[
                    { id:'left',   label:'Izquierda', icon:'⬛⬜⬜' },
                    { id:'center', label:'Centro',    icon:'⬜⬛⬜' },
                    { id:'right',  label:'Derecha',   icon:'⬜⬜⬛' },
                  ].map(a => (
                    <div key={a.id} onClick={() => update({ textAlign: a.id })}
                      style={{ flex:1, padding:'12px 8px', borderRadius:10, border:'1.5px solid', borderColor: config.textAlign===a.id ? '#84C5BC' : '#f0ece6', cursor:'pointer', textAlign:'center', background: config.textAlign===a.id ? '#f0f9f8' : '#fff', transition:'all .15s' }}>
                      <p style={{ fontSize:14, margin:'0 0 4px', letterSpacing:2 }}>{a.icon}</p>
                      <p style={{ fontSize:10, color:'#444', margin:0 }}>{a.label}</p>
                    </div>
                  ))}
                </div>

                <p style={sectionTitle}>Altura del hero</p>
                <input type="range" min={35} max={75} step={5} value={config.heroHeight}
                  onChange={e => update({ heroHeight: Number(e.target.value) })}
                  style={{ width:'100%', marginBottom:6 }} />
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#888', marginBottom:24 }}>
                  <span>Compacto</span>
                  <span style={{ color:'#84C5BC', fontWeight:500 }}>{config.heroHeight}%</span>
                  <span>Panorámico</span>
                </div>

                <p style={sectionTitle}>Intensidad del acento</p>
                <input type="range" min={20} max={100} step={5} value={config.accentOpacity}
                  onChange={e => update({ accentOpacity: Number(e.target.value) })}
                  style={{ width:'100%', marginBottom:6 }} />
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#888', marginBottom:24 }}>
                  <span>Sutil</span>
                  <span style={{ color:'#84C5BC', fontWeight:500 }}>{config.accentOpacity}%</span>
                  <span>Vivo</span>
                </div>

                <p style={sectionTitle}>Espaciado entre secciones</p>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {[
                    { id:'compact',  label:'Compacto',  desc:'Información densa' },
                    { id:'balanced', label:'Equilibrado', desc:'Recomendado' },
                    { id:'airy',     label:'Amplio',    desc:'Mucho espacio' },
                  ].map(s => (
                    <div key={s.id}
                      onClick={() => update({ animationIntensity: s.id })}
                      style={{ padding:'11px 14px', borderRadius:10, border:'1px solid', borderColor: config.animationIntensity===s.id ? '#84C5BC' : '#f0ece6', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', background: config.animationIntensity===s.id ? '#f0f9f8' : '#fff' }}>
                      <div>
                        <p style={{ fontSize:13, fontWeight:500, color:'#1a1a1a', margin:'0 0 1px' }}>{s.label}</p>
                        <p style={{ fontSize:11, color:'#888', margin:0 }}>{s.desc}</p>
                      </div>
                      {config.animationIntensity===s.id && <span style={{ color:'#84C5BC', fontSize:12 }}>✓</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MÚSICA */}
            {activeSection === 'musica' && (
              <MusicSection
                config={config}
                musicRef={musicRef}
                uploading={uploading}
                onUpdate={update}
                onUpload={handleMusicUpload}
              />
            )}

            {/* ANIMACIÓN */}
            {activeSection === 'animacion' && (
              <div>
                <p style={sectionTitle}>Estilo de entrada</p>
                {ANIMATIONS.map(a => (
                  <div key={a.id} onClick={() => update({ animationIntensity: a.id })}
                    style={{ padding:'14px', borderRadius:10, border:'1px solid', borderColor: config.animationIntensity===a.id ? '#84C5BC' : '#f0ece6', cursor:'pointer', marginBottom:8, display:'flex', alignItems:'center', justifyContent:'space-between', background: config.animationIntensity===a.id ? '#f0f9f8' : '#fff' }}>
                    <div>
                      <p style={{ fontSize:13, fontWeight:500, color:'#1a1a1a', margin:'0 0 2px' }}>{a.label}</p>
                      <p style={{ fontSize:11, color:'#888', margin:0 }}>
                        {a.id==='none' ? 'La invitación aparece de golpe, sin efectos' :
                         a.id==='minimal' ? 'Aparición suave con fade y ligero movimiento' :
                         'Animaciones de entrada llamativas y dinámicas'}
                      </p>
                    </div>
                    {config.animationIntensity===a.id && <span style={{ color:'#84C5BC', fontSize:16 }}>✓</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PREVIEW ── */}
      <div style={{ flex:1, background:'#f0ece6', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* Preview toolbar */}
        <div style={{ background:'#fff', borderBottom:'1px solid #e8e0d2', padding:'10px 20px', display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:11, letterSpacing:1.5, textTransform:'uppercase', color:'#888' }}>Vista previa</span>
          <div style={{ flex:1 }} />
          <div style={{ display:'flex', gap:6 }}>
            {/* Active template badge */}
            <div style={{ background:'#f0f9f8', border:'1px solid #f0d8c0', borderRadius:20, padding:'4px 12px', fontSize:11, color:'#84C5BC' }}>
              {currentTemplate.name}
            </div>
            {config.musicName && (
              <div style={{ background:'#f0f5ff', border:'1px solid #d0e0f8', borderRadius:20, padding:'4px 12px', fontSize:11, color:'#4060a0', display:'flex', alignItems:'center', gap:4 }}>
                ♪ {config.musicName.split('—')[0].trim()}
              </div>
            )}
          </div>
          <button
            onClick={() => saveConfig(config)}
            disabled={saving}
            style={{ background:'#1a1a1a', color:'#fff', border:'none', padding:'8px 20px', borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:'Inter,sans-serif', fontWeight:500, opacity: saving ? 0.6 : 1 }}>
            {saved ? '✓ Guardado' : saving ? 'Guardando…' : 'Guardar diseño'}
          </button>
          <a href={`/event/${event.slug}${event.status !== 'PAID' ? '?preview=1' : ''}`} target="_blank"
            style={{ background:'none', color:'#84C5BC', border:'1px solid #f0d8c0', padding:'8px 16px', borderRadius:8, fontSize:12, textDecoration:'none', fontFamily:'Inter,sans-serif' }}>
            {event.status !== 'PAID' ? 'Vista previa →' : 'Ver live →'}
          </a>
        </div>

        {/* Preview area */}
        <div style={{ flex:1, overflow:'auto', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
          <InvitationPreview event={event} config={config} />
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ─── INVITATION PREVIEW ───────────────────────────────────────
function InvitationPreview({ event, config }: { event: Props['event']; config: DesignConfig }) {
  const name = event.coupleNames ?? event.title

  const decorSVG: Record<string, string> = {
    floral: `<svg width="100%" height="100%" viewBox="0 0 400 400" fill="none" opacity="0.06" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="30" stroke="${config.colorAccent}" stroke-width="1"/><circle cx="350" cy="350" r="30" stroke="${config.colorAccent}" stroke-width="1"/><circle cx="350" cy="50" r="20" stroke="${config.colorAccent}" stroke-width="1"/><circle cx="50" cy="350" r="20" stroke="${config.colorAccent}" stroke-width="1"/><path d="M200 20 Q220 100 200 200 Q180 100 200 20Z" stroke="${config.colorAccent}" stroke-width="1"/><path d="M20 200 Q100 220 200 200 Q100 180 20 200Z" stroke="${config.colorAccent}" stroke-width="1"/></svg>`,
    geometric: `<svg width="100%" height="100%" viewBox="0 0 400 400" fill="none" opacity="0.06" xmlns="http://www.w3.org/2000/svg"><polygon points="200,20 380,380 20,380" stroke="${config.colorAccent}" stroke-width="1"/><polygon points="200,60 340,360 60,360" stroke="${config.colorAccent}" stroke-width="0.5"/><rect x="100" y="100" width="200" height="200" stroke="${config.colorAccent}" stroke-width="0.5" transform="rotate(45 200 200)"/></svg>`,
    romantic: `<svg width="100%" height="100%" viewBox="0 0 400 400" fill="none" opacity="0.08" xmlns="http://www.w3.org/2000/svg"><path d="M200 300 C100 250 50 150 100 100 C150 50 200 100 200 150 C200 100 250 50 300 100 C350 150 300 250 200 300Z" stroke="${config.colorAccent}" stroke-width="1"/><circle cx="200" cy="80" r="50" stroke="${config.colorAccent}" stroke-width="0.5"/><circle cx="80" cy="200" r="40" stroke="${config.colorAccent}" stroke-width="0.5"/><circle cx="320" cy="200" r="40" stroke="${config.colorAccent}" stroke-width="0.5"/></svg>`,
    stars: `<svg width="100%" height="100%" viewBox="0 0 400 400" fill="none" opacity="0.1" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="2" fill="${config.colorAccent}"/><circle cx="150" cy="80" r="1.5" fill="${config.colorAccent}"/><circle cx="280" cy="40" r="2" fill="${config.colorAccent}"/><circle cx="350" cy="120" r="1.5" fill="${config.colorAccent}"/><circle cx="100" cy="180" r="1" fill="${config.colorAccent}"/><circle cx="320" cy="280" r="2" fill="${config.colorAccent}"/><circle cx="60" cy="320" r="1.5" fill="${config.colorAccent}"/><circle cx="200" cy="360" r="1" fill="${config.colorAccent}"/><path d="M190 30 L193 40 L200 40 L195 46 L197 56 L190 50 L183 56 L185 46 L180 40 L187 40Z" fill="${config.colorAccent}"/><path d="M340 60 L342 67 L348 67 L343 71 L345 78 L340 74 L335 78 L337 71 L332 67 L338 67Z" fill="${config.colorAccent}"/></svg>`,
    leaves: `<svg width="100%" height="100%" viewBox="0 0 400 400" fill="none" opacity="0.07" xmlns="http://www.w3.org/2000/svg"><path d="M30 370 C30 370 60 300 100 280 C140 260 160 300 130 320 C100 340 60 340 30 370Z" stroke="${config.colorAccent}" stroke-width="1"/><path d="M370 30 C370 30 340 100 300 120 C260 140 240 100 270 80 C300 60 340 60 370 30Z" stroke="${config.colorAccent}" stroke-width="1"/><path d="M380 370 C380 370 320 350 300 310 C280 270 310 250 330 270 C350 290 360 330 380 370Z" stroke="${config.colorAccent}" stroke-width="1"/></svg>`,
    waves: `<svg width="100%" height="100%" viewBox="0 0 400 400" fill="none" opacity="0.06" xmlns="http://www.w3.org/2000/svg"><path d="M0 100 Q50 80 100 100 Q150 120 200 100 Q250 80 300 100 Q350 120 400 100" stroke="${config.colorAccent}" stroke-width="1"/><path d="M0 150 Q50 130 100 150 Q150 170 200 150 Q250 130 300 150 Q350 170 400 150" stroke="${config.colorAccent}" stroke-width="1"/><path d="M0 250 Q50 230 100 250 Q150 270 200 250 Q250 230 300 250 Q350 270 400 250" stroke="${config.colorAccent}" stroke-width="1"/><path d="M0 300 Q50 280 100 300 Q150 320 200 300 Q250 280 300 300 Q350 320 400 300" stroke="${config.colorAccent}" stroke-width="1"/></svg>`,
  }

  const decor = decorSVG[config.decorationStyle] ?? ''
  const overlayOpacity = (config.heroOverlay ?? 50) / 100
  const heroHeightPx = Math.round(520 * ((config.heroHeight ?? 55) / 100))
  const accentHex = config.colorAccent + Math.round((config.accentOpacity ?? 70) * 2.55).toString(16).padStart(2,'0')
  const titleSizePx = { small:22, medium:28, large:36, xlarge:48 }[config.titleSize ?? 'large'] ?? 28
  const tAlign = (config.textAlign ?? 'center') as React.CSSProperties['textAlign']

  const separatorSymbol = { line:'────────', dots:'· · · · · ·', diamond:'◇ ─ ◇ ─ ◇', floral:'❧ ─ ✦ ─ ❧', stars:'✦ · · · ✦', waves:'〰〰〰〰〰' }[config.separatorStyle ?? 'line'] ?? '────────'

  const cardBorder = { none: 'none', thin: `1px solid ${config.colorAccent}40`, double: `3px double ${config.colorAccent}40`, ornate: `2px dashed ${config.colorAccent}50` }[config.borderStyle ?? 'none'] ?? 'none'

  return (
    <div style={{
      width: 380, minHeight: 520, borderRadius: 20, overflow: 'hidden',
      boxShadow: '0 24px 80px rgba(0,0,0,0.25)', position: 'relative',
      background: config.colorBackground, fontFamily: config.fontBody + ',sans-serif',
      border: cardBorder,
    }}>
      {/* Hero section */}
      <div style={{ position:'relative', height: heroHeightPx, background: config.colorPrimary, overflow:'hidden' }}>
        {config.heroImage && (
          <img src={config.heroImage} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
        )}
        {/* Overlay */}
        <div style={{ position:'absolute', inset:0, background: config.colorPrimary, opacity: overlayOpacity }} />
        {/* Decoration */}
        {decor && <div style={{ position:'absolute', inset:0 }} dangerouslySetInnerHTML={{ __html: decor }} />}
        {/* Content */}
        <div style={{ position:'relative', zIndex:2, height:'100%', display:'flex', flexDirection:'column', alignItems:tAlign==='left'?'flex-start':tAlign==='right'?'flex-end':'center', justifyContent:'center', padding:24, textAlign: tAlign }}>
          <p style={{ fontSize:9, letterSpacing:4, textTransform:'uppercase', color: accentHex, margin:'0 0 12px', fontFamily: config.fontBody+',sans-serif' }}>
            Te invitamos
          </p>
          <h1 style={{ fontFamily: config.fontDisplay+',serif', fontSize: titleSizePx * 0.72, fontWeight:400, color: config.colorText, lineHeight:1.1, margin:'0 0 12px', letterSpacing:-0.5 }}>
            {name}
          </h1>
          <p style={{ fontSize:10, letterSpacing:3, fontFamily:'serif', color: accentHex, margin:0, opacity:0.9 }}>
            {separatorSymbol}
          </p>
          <p style={{ fontSize:9, letterSpacing:3, textTransform:'uppercase', color: accentHex, margin:'10px 0 0' }}>
            2025 · Sevilla
          </p>
          {config.musicName && (
            <div style={{ marginTop:14, fontSize:10, color:'rgba(255,255,255,0.4)', display:'flex', alignItems:'center', gap:4 }}>
              <span>♪</span> {config.musicName.split('—')[0].trim()}
            </div>
          )}
        </div>
      </div>

      {/* Content preview */}
      <div style={{ padding:24, background: config.colorBackground }}>
        {/* Countdown placeholder */}
        <div style={{ display:'flex', justifyContent:'center', gap:16, marginBottom:20 }}>
          {[['87','Días'],['14','Horas'],['32','Min']].map(([n,l]) => (
            <div key={l} style={{ textAlign:'center' }}>
              <p style={{ fontFamily: config.fontDisplay+',serif', fontSize:22, fontWeight:400, color: config.colorPrimary, lineHeight:1, margin:0 }}>{n}</p>
              <p style={{ fontSize:9, letterSpacing:2, textTransform:'uppercase', color:'#888', margin:'3px 0 0' }}>{l}</p>
            </div>
          ))}
        </div>

        {/* Details */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:16 }}>
          {[['Fecha','20 Sep 2025'],['Lugar','Finca La Alameda']].map(([l,v]) => (
            <div key={l} style={{ background: hexToRgba(config.colorPrimary, 0.04), borderRadius:8, padding:'10px 12px' }}>
              <p style={{ fontSize:9, letterSpacing:2, textTransform:'uppercase', color:'#999', margin:'0 0 3px' }}>{l}</p>
              <p style={{ fontFamily: config.fontDisplay+',serif', fontSize:12, color: config.colorPrimary, margin:0 }}>{v}</p>
            </div>
          ))}
        </div>

        {/* RSVP button */}
        <div style={{ background: config.colorAccent, borderRadius:10, padding:'11px', textAlign:'center' }}>
          <p style={{ fontSize:11, fontWeight:500, color:'#fff', margin:0, letterSpacing:1, fontFamily: config.fontBody+',sans-serif' }}>
            Confirmar asistencia
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── MUSIC SECTION COMPONENT ──────────────────────────────────
function MusicSection({ config, musicRef, uploading, onUpdate, onUpload }: {
  config: DesignConfig
  musicRef: React.RefObject<HTMLInputElement>
  uploading: boolean
  onUpdate: (patch: Partial<DesignConfig>) => void
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const [preview, setPreview] = useState<string | null>(null) // ytId being previewed in panel

  const isYT = config.musicUrl.startsWith('youtube:')
  const activeYtId = isYT ? config.musicUrl.replace('youtube:', '') : null

  function selectSuggestion(s: typeof MUSIC_SUGGESTIONS[0]) {
    onUpdate({ musicUrl: `youtube:${s.ytId}`, musicName: `${s.title} — ${s.artist}` })
    setPreview(null)
  }

  function clearMusic() {
    onUpdate({ musicUrl: '', musicName: '' })
    setPreview(null)
  }

  const inp = { width:'100%', border:'1px solid #e8e0d2', borderRadius:10, padding:'10px 14px', fontSize:13, outline:'none', fontFamily:'Inter,sans-serif', background:'#faf8f4', boxSizing:'border-box' as const }

  return (
    <div>
      <p style={{ fontSize:11, letterSpacing:2, textTransform:'uppercase' as const, color:'#888', marginBottom:4, fontFamily:'Inter,sans-serif' }}>Música de fondo</p>
      <p style={{ fontSize:12, color:'#aaa', marginBottom:16, lineHeight:1.6 }}>
        Se reproduce en bucle cuando el invitado abre la invitación.
      </p>

      {/* Active song */}
      {config.musicName && (
        <div style={{ background:'#f0f9f8', border:'1px solid #f0d8c0', borderRadius:12, padding:'12px 14px', marginBottom:16, display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:8, background:'#84C5BC', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <span style={{ fontSize:16 }}>♪</span>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:13, color:'#1a1a1a', margin:0, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{config.musicName}</p>
            <p style={{ fontSize:11, color:'#6aada4', margin:0 }}>{isYT ? 'YouTube · en bucle' : 'Archivo MP3'}</p>
          </div>
          <button onClick={clearMusic}
            style={{ background:'none', border:'none', cursor:'pointer', color:'#c4b9af', fontSize:18, flexShrink:0, lineHeight:1, padding:'0 4px' }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color='#e24b4a'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color='#c4b9af'}>×</button>
        </div>
      )}

      {/* YouTube preview inline */}
      {(preview || activeYtId) && (
        <div style={{ marginBottom:16, borderRadius:12, overflow:'hidden', position:'relative', background:'#000' }}>
          <iframe
            key={preview ?? activeYtId!}
            src={`https://www.youtube.com/embed/${preview ?? activeYtId}?autoplay=1&loop=1&playlist=${preview ?? activeYtId}&controls=1&modestbranding=1&rel=0`}
            allow="autoplay; encrypted-media"
            allowFullScreen
            style={{ width:'100%', height:160, border:'none', display:'block' }}
          />
          {preview && preview !== activeYtId && (
            <div style={{ display:'flex', gap:8, padding:'10px 12px', background:'#faf8f4', borderTop:'1px solid #f0ece6' }}>
              <button
                onClick={() => {
                  const s = MUSIC_SUGGESTIONS.find(s => s.ytId === preview)!
                  selectSuggestion(s)
                }}
                style={{ flex:1, padding:'8px', background:'#1a1a1a', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
                ✓ Usar esta canción
              </button>
              <button onClick={() => setPreview(null)}
                style={{ padding:'8px 14px', background:'none', border:'1px solid #e4ddd3', borderRadius:8, fontSize:13, color:'#6b5e54', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
                Cancelar
              </button>
            </div>
          )}
        </div>
      )}

      {/* Suggestions */}
      <p style={{ fontSize:11, letterSpacing:2, textTransform:'uppercase' as const, color:'#888', marginBottom:10, fontFamily:'Inter,sans-serif' }}>Sugerencias</p>
      <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:20 }}>
        {MUSIC_SUGGESTIONS.map((s) => {
          const isActive = config.musicUrl === `youtube:${s.ytId}`
          const isPreviewing = preview === s.ytId
          return (
            <div key={s.ytId}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:10, border:'1.5px solid', borderColor: isActive ? '#6aada4' : isPreviewing ? '#e4ddd3' : '#f0ece6', background: isActive ? '#f0f9f8' : isPreviewing ? '#faf5f0' : '#fff', transition:'all .15s' }}>
              {/* Play/preview button */}
              <button
                onClick={() => setPreview(isPreviewing ? null : s.ytId)}
                title="Escuchar preview"
                style={{ width:32, height:32, borderRadius:'50%', background: isPreviewing ? '#6aada4' : '#f0ece6', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'background .15s' }}>
                <span style={{ fontSize:12, color: isPreviewing ? '#fff' : '#888' }}>
                  {isPreviewing ? '■' : '▶'}
                </span>
              </button>
              {/* Song info */}
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:13, color:'#1a1a1a', margin:0, fontWeight: isActive ? 500 : 400, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.title}</p>
                <p style={{ fontSize:11, color:'#a89880', margin:0 }}>{s.artist}</p>
              </div>
              {/* Select button */}
              {isActive ? (
                <span style={{ fontSize:11, color:'#6aada4', fontWeight:600 }}>✓</span>
              ) : (
                <button
                  onClick={() => selectSuggestion(s)}
                  style={{ fontSize:11, padding:'4px 10px', borderRadius:7, background:'none', border:'1px solid #e4ddd3', color:'#6b5e54', cursor:'pointer', fontFamily:'Inter,sans-serif', whiteSpace:'nowrap', transition:'all .15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background='#f0f9f8'; (e.currentTarget as HTMLButtonElement).style.borderColor='#6aada4'; (e.currentTarget as HTMLButtonElement).style.color='#6aada4' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background='none'; (e.currentTarget as HTMLButtonElement).style.borderColor='#e4ddd3'; (e.currentTarget as HTMLButtonElement).style.color='#6b5e54' }}>
                  Usar
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Divider */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
        <div style={{ flex:1, height:1, background:'#f0ece6' }} />
        <span style={{ fontSize:11, color:'#c4b9af' }}>o sube tu propia canción</span>
        <div style={{ flex:1, height:1, background:'#f0ece6' }} />
      </div>

      {/* Upload MP3 */}
      <button onClick={() => musicRef.current?.click()} disabled={uploading}
        style={{ width:'100%', padding:'11px', border:'1.5px dashed #e4ddd3', borderRadius:10, cursor:'pointer', fontSize:13, color:'#6b5e54', background:'#faf5f0', marginBottom:14, fontFamily:'Inter,sans-serif', transition:'all .15s', opacity: uploading ? 0.6 : 1 }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor='#6aada4'; (e.currentTarget as HTMLButtonElement).style.color='#6aada4' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor='#e4ddd3'; (e.currentTarget as HTMLButtonElement).style.color='#6b5e54' }}>
        {uploading ? 'Subiendo…' : '↑  Subir archivo MP3'}
      </button>
      <input ref={musicRef} type="file" accept="audio/mp3,audio/mpeg,audio/ogg,audio/wav" style={{ display:'none' }} onChange={onUpload} />

      {/* Manual URL */}
      <p style={{ fontSize:11, letterSpacing:2, textTransform:'uppercase' as const, color:'#aaa', marginBottom:8, fontFamily:'Inter,sans-serif' }}>URL directa de audio</p>
      <input
        placeholder="https://ejemplo.com/cancion.mp3"
        value={isYT ? '' : config.musicUrl}
        onChange={e => onUpdate({ musicUrl: e.target.value, musicName: e.target.value ? 'Canción personalizada' : '' })}
        style={inp}
      />
    </div>
  )
}

function hexToRgba(hex: string, alpha: number): string {
  try {
    const r = parseInt(hex.slice(1,3), 16)
    const g = parseInt(hex.slice(3,5), 16)
    const b = parseInt(hex.slice(5,7), 16)
    return `rgba(${r},${g},${b},${alpha})`
  } catch {
    return `rgba(0,0,0,${alpha})`
  }
}
