'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

// ─── Types ─────────────────────────────────────────────────────
const EVENT_TYPES = [
  { slug:'WEDDING',     label:'Boda',        emoji:'💍' },
  { slug:'BIRTHDAY',    label:'Cumpleaños',  emoji:'🎂' },
  { slug:'BAPTISM',     label:'Bautizo',     emoji:'👶' },
  { slug:'GRADUATION',  label:'Graduación',  emoji:'🎓' },
  { slug:'ANNIVERSARY', label:'Aniversario', emoji:'🥂' },
  { slug:'QUINCEANERA', label:'Quinceañera', emoji:'🌸' },
  { slug:'CORPORATE',   label:'Empresa',     emoji:'🏢' },
  { slug:'OTHER',       label:'Otro',        emoji:'✨' },
]

const TYPE_CONFIG: Record<string, {
  twoNames: boolean; name1Label: string; name2Label?: string
  subtitlePlaceholder: string; subtitleLabel: string
  suggestDressCode: boolean; suggestMenu: boolean; suggestGifts: boolean
  suggestSongs: boolean; suggestTimeline: boolean; suggestTransport: boolean; suggestHotels: boolean
  defaultColors: string[]; fontSuggestion: string; paletteLabel: string
  unsplashQuery: string
  aiTones: string[]
  coverSuggestion: string
}> = {
  WEDDING: {
    twoNames:true, name1Label:'Nombre novia/o', name2Label:'Nombre novio/a',
    subtitlePlaceholder:'Ej: «Os esperamos con todo nuestro amor»', subtitleLabel:'Frase de bienvenida',
    suggestDressCode:true, suggestMenu:true, suggestGifts:true, suggestSongs:true, suggestTimeline:true, suggestTransport:true, suggestHotels:true,
    defaultColors:['#2d3a2e','#4a3728','#1e3a5f','#5c2d5c','#c8a882'],
    fontSuggestion:'playfair', paletteLabel:'Paleta romántica',
    unsplashQuery:'wedding flowers romantic',
    aiTones:['Romántico','Formal','Emocionante','Poético'],
    coverSuggestion:'Una foto de los dos o de flores de boda',
  },
  BIRTHDAY: {
    twoNames:false, name1Label:'¿Quién cumple años?',
    subtitlePlaceholder:'Ej: «¡Acompáñame a celebrarlo!»', subtitleLabel:'Mensaje de celebración',
    suggestDressCode:false, suggestMenu:true, suggestGifts:true, suggestSongs:true, suggestTimeline:false, suggestTransport:false, suggestHotels:false,
    defaultColors:['#e06c7a','#f0a500','#6c5ce7','#00b894','#1a1a1a'],
    fontSuggestion:'inter', paletteLabel:'Paleta festiva',
    unsplashQuery:'birthday celebration party colorful',
    aiTones:['Divertido','Cálido','Informal','Sorpresa'],
    coverSuggestion:'Una foto tuya o algo que te represente',
  },
  BAPTISM: {
    twoNames:true, name1Label:'Nombre del bebé', name2Label:'Nombre de los padres (opcional)',
    subtitlePlaceholder:'Ej: «Con mucha ilusión os compartimos este día»', subtitleLabel:'Mensaje de la familia',
    suggestDressCode:false, suggestMenu:true, suggestGifts:true, suggestSongs:false, suggestTimeline:true, suggestTransport:true, suggestHotels:false,
    defaultColors:['#a8d8ea','#e8f5e9','#f8bbd0','#fff9c4','#84C5BC'],
    fontSuggestion:'great-vibes', paletteLabel:'Paleta delicada',
    unsplashQuery:'baptism baby soft light flowers',
    aiTones:['Emotivo','Familiar','Religioso','Dulce'],
    coverSuggestion:'Una foto del bebé o flores delicadas',
  },
  GRADUATION: {
    twoNames:false, name1Label:'¿Quién se gradúa?',
    subtitlePlaceholder:'Ej: «Grado en Medicina · Universidad de Barcelona»', subtitleLabel:'Titulación o logro',
    suggestDressCode:false, suggestMenu:true, suggestGifts:true, suggestSongs:true, suggestTimeline:false, suggestTransport:false, suggestHotels:false,
    defaultColors:['#1a1a1a','#1e3a5f','#2d3a2e','#4a3728','#b8860b'],
    fontSuggestion:'inter', paletteLabel:'Paleta formal',
    unsplashQuery:'graduation celebration academic',
    aiTones:['Orgulloso','Formal','Emotivo','Inspirador'],
    coverSuggestion:'Una foto del graduado o del campus',
  },
  ANNIVERSARY: {
    twoNames:true, name1Label:'Tu nombre', name2Label:'Nombre de tu pareja',
    subtitlePlaceholder:'Ej: «25 años juntos»', subtitleLabel:'Años que celebráis',
    suggestDressCode:false, suggestMenu:true, suggestGifts:true, suggestSongs:true, suggestTimeline:true, suggestTransport:false, suggestHotels:false,
    defaultColors:['#b8860b','#4a3728','#5c2d5c','#2d3a2e','#c8a882'],
    fontSuggestion:'great-vibes', paletteLabel:'Paleta cálida',
    unsplashQuery:'anniversary romantic couple celebration',
    aiTones:['Romántico','Emotivo','Nostálgico','Íntimo'],
    coverSuggestion:'Una foto vuestra juntos',
  },
  QUINCEANERA: {
    twoNames:false, name1Label:'Nombre de la quinceañera',
    subtitlePlaceholder:'Ej: «Celebrando mis 15 años con vosotros»', subtitleLabel:'Mensaje especial',
    suggestDressCode:true, suggestMenu:true, suggestGifts:true, suggestSongs:true, suggestTimeline:true, suggestTransport:false, suggestHotels:false,
    defaultColors:['#e06c7a','#9b59b6','#f8bbd0','#5c2d5c','#c8a882'],
    fontSuggestion:'great-vibes', paletteLabel:'Paleta especial',
    unsplashQuery:'quinceanera elegant pink flowers',
    aiTones:['Emocionante','Romántico','Alegre','Especial'],
    coverSuggestion:'Una foto tuya o flores con tu color favorito',
  },
  CORPORATE: {
    twoNames:false, name1Label:'Nombre del evento / empresa',
    subtitlePlaceholder:'Ej: «Conferencia Anual · Madrid 2025»', subtitleLabel:'Subtítulo o eslogan',
    suggestDressCode:true, suggestMenu:true, suggestGifts:false, suggestSongs:false, suggestTimeline:true, suggestTransport:true, suggestHotels:true,
    defaultColors:['#1a1a1a','#1e3a5f','#2d3a2e','#333333','#84C5BC'],
    fontSuggestion:'inter', paletteLabel:'Paleta profesional',
    unsplashQuery:'corporate event professional conference',
    aiTones:['Profesional','Formal','Inspirador','Ejecutivo'],
    coverSuggestion:'Logo de empresa o foto del recinto',
  },
  OTHER: {
    twoNames:false, name1Label:'Nombre del evento o protagonista',
    subtitlePlaceholder:'Ej: «Una noche especial»', subtitleLabel:'Descripción breve',
    suggestDressCode:false, suggestMenu:false, suggestGifts:false, suggestSongs:false, suggestTimeline:false, suggestTransport:false, suggestHotels:false,
    defaultColors:['#84C5BC','#2d3a2e','#1a1a1a','#4a3728','#e06c7a'],
    fontSuggestion:'inter', paletteLabel:'Elige tu color',
    unsplashQuery:'celebration party event',
    aiTones:['Casual','Alegre','Formal','Divertido'],
    coverSuggestion:'Cualquier foto que represente tu evento',
  },
}

// Unsplash curated images per event type (pre-selected for quality)
const COVER_IMAGES: Record<string, {url:string; thumb:string; credit:string}[]> = {
  WEDDING: [
    {url:'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',thumb:'https://images.unsplash.com/photo-1519741497674-611481863552?w=200',credit:'Álvaro CvG'},
    {url:'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800',thumb:'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=200',credit:'Jonathan Borba'},
    {url:'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800',thumb:'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=200',credit:'Álvaro CvG'},
    {url:'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800',thumb:'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=200',credit:'Photos by Lanty'},
  ],
  BIRTHDAY: [
    {url:'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800',thumb:'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=200',credit:'Jakob Owens'},
    {url:'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800',thumb:'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=200',credit:'Annie Spratt'},
    {url:'https://images.unsplash.com/photo-1558636508-e0969431ca47?w=800',thumb:'https://images.unsplash.com/photo-1558636508-e0969431ca47?w=200',credit:'Roman Kraft'},
  ],
  BAPTISM: [
    {url:'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800',thumb:'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=200',credit:'Nynne Schrøder'},
    {url:'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',thumb:'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200',credit:'Anna Pelzer'},
  ],
  GRADUATION: [
    {url:'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',thumb:'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=200',credit:'Charles DeLoye'},
    {url:'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800',thumb:'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200',credit:'Baim Hanif'},
  ],
  ANNIVERSARY: [
    {url:'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800',thumb:'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=200',credit:'Álvaro CvG'},
    {url:'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',thumb:'https://images.unsplash.com/photo-1519741497674-611481863552?w=200',credit:'Jonathan Borba'},
  ],
  QUINCEANERA: [
    {url:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',thumb:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200',credit:'Aiony Haust'},
    {url:'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',thumb:'https://images.unsplash.com/photo-1519741497674-611481863552?w=200',credit:'Jonathan Borba'},
  ],
  CORPORATE: [
    {url:'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',thumb:'https://images.unsplash.com/photo-1511578314322-379afb476865?w=200',credit:'Headway'},
    {url:'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',thumb:'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200',credit:'Teemu Paananen'},
  ],
  OTHER: [
    {url:'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800',thumb:'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=200',credit:'Jakob Owens'},
  ],
}

const ALL_PALETTES = [
  {color:'#2d3a2e',name:'Bosque'},{color:'#4a3728',name:'Tierra'},{color:'#1e3a5f',name:'Marino'},
  {color:'#5c2d5c',name:'Violeta'},{color:'#84C5BC',name:'Agua'},{color:'#c8a882',name:'Arena'},
  {color:'#e06c7a',name:'Rosa'},{color:'#1a1a1a',name:'Negro'},{color:'#b8860b',name:'Dorado'},
  {color:'#6c5ce7',name:'Lila'},{color:'#a8d8ea',name:'Celeste'},{color:'#00b894',name:'Menta'},
]

const FONTS = [
  {key:'playfair',    label:'Clásica',    sample:'Elegante y atemporal', family:"'Playfair Display',serif"},
  {key:'great-vibes', label:'Romántica',  sample:'Caligrafía con alma',  family:"'Great Vibes',cursive"},
  {key:'inter',       label:'Moderna',    sample:'Limpia y legible',     family:"'Inter',sans-serif"},
  {key:'cormorant',   label:'Editorial',  sample:'Sofisticada y fina',   family:"'Cormorant Garamond',serif"},
]

const DECOR_LEVELS = [
  {key:'minimal',    label:'Minimalista',  desc:'Limpio, mucho espacio, sin adornos'},
  {key:'balanced',   label:'Equilibrado',  desc:'Algunos ornamentos florales sutiles'},
  {key:'ornamental', label:'Ornamental',   desc:'Rico en detalles, flores y separadores'},
]

type Step = 'type'|'mode'|'names'|'datetime'|'features'|'cover'|'color'|'typography'|'ai_text'|'preview'
const WIZARD_STEPS: Step[] = ['type','mode','names','datetime','features','cover','color','typography','ai_text','preview']

// ─── Component ─────────────────────────────────────────────────
export default function NewEventPage() {
  const router = useRouter()
  const {data:session} = useSession()
  const fileRef = useRef<HTMLInputElement>(null)

  const [step,setStep]           = useState<Step>('type')
  const [eventType,setEventType] = useState('')
  const [name1,setName1]         = useState('')
  const [name2,setName2]         = useState('')
  const [subtitle,setSubtitle]   = useState('')
  const [date,setDate]           = useState('')
  const [time,setTime]           = useState('')
  const [place,setPlace]         = useState('')
  const [features,setFeatures]   = useState<Record<string,boolean>>({})
  const [featureData,setFeatureData] = useState<Record<string,any>>({})
  const [featureSubStep,setFeatureSubStep] = useState<'select'|string>('select')
  const [coverUrl,setCoverUrl]   = useState<string|null>(null)
  const [coverType,setCoverType] = useState<'none'|'gallery'|'upload'>('none')
  const [coverUploading,setCoverUploading] = useState(false)
  const [coverError,setCoverError] = useState<string|null>(null)
  const [color,setColor]         = useState('')
  const [darkMode,setDarkMode]   = useState(false)
  const [font,setFont]           = useState('inter')
  const [decor,setDecor]         = useState('balanced')
  const [aiTone,setAiTone]       = useState('')
  const [aiText,setAiText]       = useState('')
  const [aiLoading,setAiLoading] = useState(false)
  const [saving,setSaving]       = useState(false)
  const [error,setError]         = useState('')

  const cfg   = TYPE_CONFIG[eventType] ?? TYPE_CONFIG.OTHER
  const stepIdx = WIZARD_STEPS.indexOf(step)
  const pct   = Math.round(((stepIdx+1)/WIZARD_STEPS.length)*100)
  const gallery = COVER_IMAGES[eventType] ?? COVER_IMAGES.OTHER

  const displayColor = color || cfg.defaultColors?.[0] || '#1a1a1a'
  const displayFont  = FONTS.find(f=>f.key===font)?.family ?? 'inherit'
  const displayName  = name1&&name2 ? `${name1} & ${name2}` : name1 || '—'

  function goNext() { const i=WIZARD_STEPS.indexOf(step); if(i<WIZARD_STEPS.length-1) setStep(WIZARD_STEPS[i+1]) }

  // Feature sub-navigation
  // Use a stable ref for FEATURE_OPTIONS keys so closures don't go stale
  function getActiveKeys(currentFeatures: Record<string,boolean>) {
    return ['dressCode','menu','gifts','songs','timeline','transport','hotels']
      .filter(k => currentFeatures[k] === true)
  }
  function getActivatedFeatures() {
    return FEATURE_OPTIONS.filter(f => features[f.key])
  }
  function nextFeatureStep() {
    // Read features fresh — use functional form to avoid stale closure
    if (featureSubStep === 'select') {
      const activeKeys = getActiveKeys(features)
      if (activeKeys.length > 0) setFeatureSubStep(activeKeys[0])
      else goNext()
    } else {
      const activeKeys = getActiveKeys(features)
      const idx = activeKeys.indexOf(featureSubStep)
      if (idx < activeKeys.length - 1) setFeatureSubStep(activeKeys[idx + 1])
      else goNext()
    }
  }
  function prevFeatureStep() {
    if (featureSubStep === 'select') goBack()
    else {
      const activeKeys = getActiveKeys(features)
      const idx = activeKeys.indexOf(featureSubStep)
      if (idx === 0) setFeatureSubStep('select')
      else setFeatureSubStep(activeKeys[idx - 1])
    }
  }
  function setFD(key: string, field: string, val: any) {
    setFeatureData(prev => ({ ...prev, [key]: { ...(prev[key]??{}), [field]: val } }))
  }
  function goBack() {
    if (step === 'features' && featureSubStep !== 'select') { prevFeatureStep(); return }
    const i=WIZARD_STEPS.indexOf(step); if(i>0) setStep(WIZARD_STEPS[i-1])
  }

  function selectType(slug:string) {
    setEventType(slug)
    const c = TYPE_CONFIG[slug]
    setColor(c.defaultColors[0])
    setFont(c.fontSuggestion)
    setFeatures({})
    setFeatureData({})
    setFeatureSubStep('select')
    setAiTone(c.aiTones[0])
  }

  async function generateAiText() {
    if(!name1 || !eventType) return
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/wizard', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          eventType, name1, name2, date, place, subtitle,
          tone: aiTone, task:'welcome_text'
        }),
      })
      const d = await res.json()
      if(d.text) setAiText(d.text)
      else setAiText('Con mucha ilusión os invitamos a compartir este día tan especial con nosotros.')
    } catch {
      setAiText('Con mucha ilusión os invitamos a compartir este día tan especial con nosotros.')
    } finally { setAiLoading(false) }
  }

  async function handleCreate(m:'wizard'|'manual') {
    if(!eventType || !session?.user) return
    setSaving(true); setError('')
    try {
      const typeObj = EVENT_TYPES.find(t=>t.slug===eventType)
      const title = name1&&name2 ? `${name1} & ${name2}` : name1 || typeObj?.label || 'Mi Evento'
      const res = await fetch('/api/events', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          title, type:eventType,
          eventDate: date || new Date(Date.now()+90*86400000).toISOString(),
          location:place||'', subtitle: aiText||subtitle||'',
          designConfig:{
            primaryColor:displayColor, fontFamily:font,
            accentColor:displayColor, darkMode,
            coverImage:coverUrl||null, decorLevel:decor,
          },
          wizardMode: m==='wizard',
          initialFeatures:features,
          featureData:featureData,
        }),
      })
      const d = await res.json()
      if(!res.ok) throw new Error(d.error)
      const id:string = d.event?.id ?? d.id
      router.push(m==='manual' ? `/dashboard/events/${id}` : `/dashboard/events/${id}?wizard=1`)
    } catch(e:any) { setError(e.message); setSaving(false) }
  }

  // Feature list
  const FEATURE_OPTIONS = [
    {key:'dressCode', label:'Dress code',          desc:'Código de vestimenta',              show:cfg.suggestDressCode},
    {key:'menu',      label:'Menú del evento',      desc:'Platos o menú especial',            show:cfg.suggestMenu},
    {key:'gifts',     label:'Lista de regalos',     desc:'Deseos o lista de regalos',         show:cfg.suggestGifts},
    {key:'songs',     label:'Lista de canciones',   desc:'Invitados sugieren canciones',      show:cfg.suggestSongs},
    {key:'timeline',  label:'Programa del evento',  desc:'Hora por hora',                     show:cfg.suggestTimeline},
    {key:'transport', label:'Transporte',            desc:'Autobuses o traslados',             show:cfg.suggestTransport},
    {key:'hotels',    label:'Hoteles cercanos',      desc:'Recomendaciones de alojamiento',    show:cfg.suggestHotels},
  ].filter(f=>f.show)

  // ─── Styles ────────────────────────────────────────────────
  const ff = "'Inter','Helvetica Neue',sans-serif"
  // inject spin animation
  if (typeof document !== 'undefined' && !document.getElementById('wiz-spin')) {
    const s = document.createElement('style'); s.id='wiz-spin'; s.textContent='@keyframes spin{to{transform:rotate(360deg)}}'; document.head.appendChild(s)
  }
  const inp:React.CSSProperties = {
    width:'100%', border:'1px solid #e0e0e0', borderRadius:10,
    padding:'11px 14px', fontSize:14, outline:'none', fontFamily:ff,
    color:'#1a1a1a', background:'#fff', marginBottom:10, boxSizing:'border-box',
  }
  const btnPrimary=(disabled=false):React.CSSProperties=>({
    width:'100%', background:disabled?'#e0e0e0':'#1a1a1a',
    color:disabled?'#aaa':'#fff', border:'none', borderRadius:12,
    padding:14, fontSize:14, fontWeight:500, cursor:disabled?'not-allowed':'pointer',
    fontFamily:ff, marginTop:16, transition:'all .2s',
  })

  const previewBg = darkMode ? '#111' : displayColor
  const previewText = '#fff'

  return (
    <div style={{minHeight:'100vh',background:'#f5f4f1',display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'24px 16px 48px',fontFamily:ff}}>
      <div style={{width:'100%',maxWidth:440}}>

        {/* Topbar */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
          <button onClick={()=>step==='type'?router.push('/dashboard'):goBack()}
            style={{background:'none',border:'none',color:'#84C5BC',fontSize:13,cursor:'pointer',fontFamily:ff,padding:0}}>
            ← {step==='type'?'Panel':'Atrás'}
          </button>
          <span style={{fontSize:11,color:'#aaa',letterSpacing:0.5,textTransform:'uppercase'}}>
            {stepIdx+1} de {WIZARD_STEPS.length}
          </span>
        </div>

        {/* Progress */}
        <div style={{height:3,background:'#e8e2db',borderRadius:2,marginBottom:20,overflow:'hidden'}}>
          <div style={{height:3,background:'#84C5BC',borderRadius:2,width:`${pct}%`,transition:'width .4s ease'}}/>
        </div>
        <div style={{display:'flex',gap:4,justifyContent:'center',marginBottom:22}}>
          {WIZARD_STEPS.map((_,i)=>(
            <div key={i} style={{height:5,borderRadius:3,transition:'all .3s',background:i===stepIdx?'#84C5BC':i<stepIdx?'#b8deda':'#e8e2db',width:i===stepIdx?20:i<stepIdx?12:7}}/>
          ))}
        </div>

        {/* Card */}
        <div style={{background:'#fff',borderRadius:20,padding:'26px 22px',boxShadow:'0 2px 16px rgba(0,0,0,0.04)'}}>

          {/* 1. TIPO */}
          {step==='type' && (<>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontWeight:400,fontSize:26,color:'#1a1a1a',marginBottom:6}}>¿Qué celebras?</h2>
            <p style={{fontSize:13,color:'#888',marginBottom:18,lineHeight:1.6}}>El wizard se adapta a tu tipo de evento.</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:18}}>
              {EVENT_TYPES.map(t=>(
                <div key={t.slug} onClick={()=>selectType(t.slug)}
                  style={{background:eventType===t.slug?'#f0f9f8':'#fafafa',border:`1.5px solid ${eventType===t.slug?'#84C5BC':'#e8e2db'}`,borderRadius:14,padding:'16px 10px',textAlign:'center',cursor:'pointer',transition:'all .15s'}}>
                  <div style={{fontSize:24,marginBottom:6}}>{t.emoji}</div>
                  <div style={{fontSize:12,fontWeight:500,color:'#444'}}>{t.label}</div>
                </div>
              ))}
            </div>
            <button onClick={goNext} disabled={!eventType} style={btnPrimary(!eventType)}>Continuar →</button>
          </>)}

          {/* 2. MODO */}
          {step==='mode' && (<>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontWeight:400,fontSize:26,color:'#1a1a1a',marginBottom:6}}>¿Cómo quieres crearla?</h2>
            <p style={{fontSize:13,color:'#888',marginBottom:18,lineHeight:1.6}}>Siempre podrás cambiar de modo después.</p>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <div onClick={goNext} style={{background:'#f0f9f8',border:'1.5px solid #84C5BC',borderRadius:16,padding:'18px 16px',cursor:'pointer',display:'flex',alignItems:'flex-start',gap:14}}>
                <div style={{width:42,height:42,background:'#d9f0ed',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>✨</div>
                <div>
                  <p style={{fontSize:14,fontWeight:600,color:'#1a1a1a',marginBottom:4}}>Paso a paso guiado</p>
                  <p style={{fontSize:12,color:'#888',lineHeight:1.5}}>10 preguntas y tu invitación queda lista por completo.</p>
                  <div style={{display:'inline-block',marginTop:8,background:'#84C5BC',color:'#fff',fontSize:10,padding:'3px 10px',borderRadius:20,letterSpacing:0.5}}>RECOMENDADO</div>
                </div>
              </div>
              <div onClick={()=>handleCreate('manual')} style={{background:'#fafafa',border:'1.5px solid #e8e2db',borderRadius:16,padding:'18px 16px',cursor:'pointer',display:'flex',alignItems:'flex-start',gap:14}}>
                <div style={{width:42,height:42,background:'#f0f0f0',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>⚙️</div>
                <div>
                  <p style={{fontSize:14,fontWeight:600,color:'#1a1a1a',marginBottom:4}}>Editor libre</p>
                  <p style={{fontSize:12,color:'#888',lineHeight:1.5}}>Accede directamente al editor con todas las opciones.</p>
                </div>
              </div>
            </div>
            {saving && <p style={{fontSize:12,color:'#84C5BC',textAlign:'center',marginTop:12}}>Creando…</p>}
            {error  && <p style={{fontSize:12,color:'#ef4444',textAlign:'center',marginTop:8}}>{error}</p>}
          </>)}

          {/* 3. NOMBRES */}
          {step==='names' && (<>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontWeight:400,fontSize:26,color:'#1a1a1a',marginBottom:6}}>
              {eventType==='CORPORATE'?'El evento':eventType==='BAPTISM'?'El protagonista':'Los protagonistas'}
            </h2>
            <p style={{fontSize:13,color:'#888',marginBottom:18,lineHeight:1.6}}>
              {eventType==='WEDDING'&&'Los nombres que aparecerán en la invitación.'}
              {eventType==='BIRTHDAY'&&'¿Quién es la persona del momento?'}
              {eventType==='BAPTISM'&&'El nombre del bebé y opcionalmente los padres.'}
              {eventType==='GRADUATION'&&'¿Quién recibe el título?'}
              {eventType==='ANNIVERSARY'&&'Los nombres de la pareja que celebra.'}
              {eventType==='QUINCEANERA'&&'La protagonista de esta noche especial.'}
              {eventType==='CORPORATE'&&'El nombre del evento o de la empresa.'}
              {eventType==='OTHER'&&'¿Quién o qué celebráis?'}
            </p>
            <input style={inp} placeholder={cfg.name1Label} value={name1} onChange={e=>setName1(e.target.value)}/>
            {cfg.twoNames && <input style={inp} placeholder={cfg.name2Label??'Segundo nombre'} value={name2} onChange={e=>setName2(e.target.value)}/>}
            <input style={{...inp,marginBottom:0}} placeholder={cfg.subtitlePlaceholder} value={subtitle} onChange={e=>setSubtitle(e.target.value)}/>
            <p style={{fontSize:11,color:'#bbb',marginTop:4}}>{cfg.subtitleLabel} — opcional</p>
            <button onClick={goNext} disabled={!name1} style={btnPrimary(!name1)}>Continuar →</button>
          </>)}

          {/* 4. FECHA Y LUGAR */}
          {step==='datetime' && (<>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontWeight:400,fontSize:26,color:'#1a1a1a',marginBottom:6}}>
              {eventType==='CORPORATE'?'Cuándo y dónde':'Fecha y lugar'}
            </h2>
            <p style={{fontSize:13,color:'#888',marginBottom:18,lineHeight:1.6}}>La información esencial para tus invitados.</p>
            <input style={inp} type="date" value={date} onChange={e=>setDate(e.target.value)}/>
            <input style={inp} placeholder={eventType==='CORPORATE'?'Hora de inicio':'Hora (ej: 18:00 h)'} value={time} onChange={e=>setTime(e.target.value)}/>
            <input style={{...inp,marginBottom:0}} placeholder={
              eventType==='CORPORATE'?'Sala o recinto (ej: Palau de Congressos, Barcelona)':
              eventType==='WEDDING'?'Nombre del lugar (ej: Finca Can Bonastre, Barcelona)':
              'Lugar (ej: Restaurante La Mar, Tarragona)'
            } value={place} onChange={e=>setPlace(e.target.value)}/>
            <button onClick={goNext} style={btnPrimary()}>Continuar →</button>
            <button onClick={goNext} style={{width:'100%',background:'none',border:'none',color:'#aaa',fontSize:13,cursor:'pointer',fontFamily:ff,marginTop:6,padding:6}}>
              Rellenar más tarde
            </button>
          </>)}

          {/* 5. FUNCIONES */}
          {step==='features' && (<>
            {/* ── SUB-STEP: SELECT ── */}
            {featureSubStep==='select' && (<>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontWeight:400,fontSize:26,color:'#1a1a1a',marginBottom:6}}>
                {eventType==='CORPORATE'?'Secciones del evento':'¿Qué quieres incluir?'}
              </h2>
              <p style={{fontSize:13,color:'#888',marginBottom:18,lineHeight:1.6}}>
                {FEATURE_OPTIONS.length===0?'Todo listo — pasamos al diseño.':'Activa las secciones relevantes. Te pediremos los detalles a continuación.'}
              </p>
              {FEATURE_OPTIONS.length===0 ? (
                <p style={{fontSize:13,color:'#84C5BC',textAlign:'center',padding:'16px 0'}}>✓ Nada más necesario para este tipo de evento</p>
              ) : (
                <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:8}}>
                  {FEATURE_OPTIONS.map(f=>(
                    <div key={f.key} onClick={()=>setFeatures(p=>({...p,[f.key]:!p[f.key]}))}
                      style={{display:'flex',alignItems:'center',gap:12,padding:'13px 15px',border:`1.5px solid ${features[f.key]?'#84C5BC':'#e8e2db'}`,background:features[f.key]?'#f0f9f8':'#fff',borderRadius:12,cursor:'pointer',transition:'all .15s'}}>
                      <div style={{width:20,height:20,borderRadius:4,border:features[f.key]?'none':'2px solid #ddd',background:features[f.key]?'#84C5BC':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        {features[f.key]&&<span style={{color:'#fff',fontSize:11,fontWeight:700}}>✓</span>}
                      </div>
                      <div style={{flex:1}}>
                        <p style={{fontSize:13,fontWeight:500,color:'#1a1a1a',margin:0}}>{f.label}</p>
                        <p style={{fontSize:11,color:'#aaa',margin:0}}>{f.desc}</p>
                      </div>
                      {features[f.key] && <span style={{fontSize:11,color:'#84C5BC',fontWeight:500}}>Configurar →</span>}
                    </div>
                  ))}
                </div>
              )}
              <button onClick={nextFeatureStep} style={btnPrimary()}>
                {getActiveKeys(features).length > 0
                  ? `Configurar ${getActiveKeys(features).length} sección${getActiveKeys(features).length>1?'es':''} →`
                  : 'Continuar sin extras →'}
              </button>
            </>)}

            {/* ── SUB-STEP: DRESS CODE ── */}
            {featureSubStep==='dressCode' && (<>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
                <div style={{background:'#f0f9f8',borderRadius:8,padding:'4px 10px',fontSize:11,color:'#0f766e',fontWeight:500,letterSpacing:0.5}}>
                  {getActiveKeys(features).indexOf('dressCode')+1} / {getActiveKeys(features).length}
                </div>
                <p style={{fontSize:12,color:'#aaa'}}>Dress code</p>
              </div>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontWeight:400,fontSize:24,color:'#1a1a1a',marginBottom:6}}>¿Cuál es el dress code?</h2>
              <p style={{fontSize:13,color:'#888',marginBottom:18,lineHeight:1.6}}>Ayuda a tus invitados a vestirse adecuadamente para la ocasión.</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
                {(eventType==='CORPORATE'
                  ? [['👔','Formal'],['👗','Semi-formal'],['👕','Smart casual'],['🎯','Business casual']]
                  : [['👗','Elegante'],['🌸','Semi-formal'],['🎩','Etiqueta'],['🌿','Cocktail'],['💃','Fiesta'],['🏖️','Smart casual']]
                ).map(([ic,lb])=>(
                  <div key={lb} onClick={()=>setFD('dressCode','style',lb)}
                    style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',border:`1.5px solid ${featureData.dressCode?.style===lb?'#84C5BC':'#e8e2db'}`,background:featureData.dressCode?.style===lb?'#f0f9f8':'#fff',borderRadius:12,cursor:'pointer',transition:'all .15s'}}>
                    <span style={{fontSize:20}}>{ic}</span>
                    <span style={{fontSize:13,fontWeight:featureData.dressCode?.style===lb?500:400,color:'#1a1a1a'}}>{lb}</span>
                  </div>
                ))}
              </div>
              <input style={inp} placeholder="Añadir nota extra (ej: «Sin tacones, el terreno es de hierba»)" value={featureData.dressCode?.note??''} onChange={e=>setFD('dressCode','note',e.target.value)}/>
              <button onClick={nextFeatureStep} style={btnPrimary()}>Siguiente →</button>
            </>)}

            {/* ── SUB-STEP: MENU ── */}
            {featureSubStep==='menu' && (<>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
                <div style={{background:'#f0f9f8',borderRadius:8,padding:'4px 10px',fontSize:11,color:'#0f766e',fontWeight:500,letterSpacing:0.5}}>
                  {getActiveKeys(features).indexOf('menu')+1} / {getActiveKeys(features).length}
                </div>
                <p style={{fontSize:12,color:'#aaa'}}>Menú del evento</p>
              </div>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontWeight:400,fontSize:24,color:'#1a1a1a',marginBottom:6}}>El menú</h2>
              <p style={{fontSize:13,color:'#888',marginBottom:18,lineHeight:1.6}}>Comparte los platos o el tipo de catering con tus invitados.</p>
              <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:14}}>
                {[
                  {k:'menuType', opts: eventType==='CORPORATE'
                    ? [['🍽️','Cena de gala'],['🥗','Cóctel'],['☕','Coffee break'],['🥪','Almuerzo']]
                    : [['🎂','Banquete'],['🍾','Cóctel + cena'],['🥗','Solo cóctel'],['🍕','Buffet libre'],['🎄','Menú degustación']]
                  }
                ].map(({k, opts})=>(
                  <div key={k} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                    {opts.map(([ic,lb])=>(
                      <div key={lb} onClick={()=>setFD('menu','type',lb)}
                        style={{display:'flex',alignItems:'center',gap:8,padding:'11px 13px',border:`1.5px solid ${featureData.menu?.type===lb?'#84C5BC':'#e8e2db'}`,background:featureData.menu?.type===lb?'#f0f9f8':'#fff',borderRadius:12,cursor:'pointer',transition:'all .15s'}}>
                        <span style={{fontSize:18}}>{ic}</span>
                        <span style={{fontSize:12,fontWeight:featureData.menu?.type===lb?500:400,color:'#1a1a1a'}}>{lb}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <p style={{fontSize:11,letterSpacing:1,textTransform:'uppercase',color:'#aaa',marginBottom:8}}>Opciones de menú (para alergias)</p>
              <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:14}}>
                {['Vegetariano','Vegano','Sin gluten','Sin lactosa','Kosher','Halal'].map(op=>(
                  <div key={op} onClick={()=>{
                    const cur:string[] = featureData.menu?.options??[]
                    setFD('menu','options', cur.includes(op)?cur.filter(x=>x!==op):[...cur,op])
                  }} style={{padding:'7px 14px',borderRadius:20,border:`1.5px solid ${(featureData.menu?.options??[]).includes(op)?'#84C5BC':'#e8e2db'}`,background:(featureData.menu?.options??[]).includes(op)?'#f0f9f8':'#fff',cursor:'pointer',fontSize:12,color:'#444',transition:'all .15s'}}>
                    {op}
                  </div>
                ))}
              </div>
              <textarea style={{...inp,minHeight:80,resize:'vertical'}} placeholder="Describe el menú brevemente (opcional)" value={featureData.menu?.description??''} onChange={e=>setFD('menu','description',e.target.value)}/>
              <button onClick={nextFeatureStep} style={btnPrimary()}>Siguiente →</button>
            </>)}

            {/* ── SUB-STEP: GIFTS ── */}
            {featureSubStep==='gifts' && (<>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
                <div style={{background:'#f0f9f8',borderRadius:8,padding:'4px 10px',fontSize:11,color:'#0f766e',fontWeight:500,letterSpacing:0.5}}>
                  {getActiveKeys(features).indexOf('gifts')+1} / {getActiveKeys(features).length}
                </div>
                <p style={{fontSize:12,color:'#aaa'}}>Lista de regalos</p>
              </div>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontWeight:400,fontSize:24,color:'#1a1a1a',marginBottom:6}}>Los regalos</h2>
              <p style={{fontSize:13,color:'#888',marginBottom:18,lineHeight:1.6}}>¿Cómo prefieres que te regalen tus invitados?</p>
              <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:14}}>
                {[
                  ['💳','Transferencia bancaria / Bizum'],
                  ['📋','Lista en tienda (El Corte Inglés, Amazon…)'],
                  ['✈️','Aportación a viaje de novios'],
                  ['🏡','Aportación a casa / reforma'],
                  ['🎁','Regalos físicos bienvenidos'],
                  ['🙏','Vuestra presencia es el mejor regalo'],
                ].map(([ic,lb])=>(
                  <div key={lb} onClick={()=>{
                    const cur:string[] = featureData.gifts?.types??[]
                    setFD('gifts','types', cur.includes(lb)?cur.filter(x=>x!==lb):[...cur,lb])
                  }} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',border:`1.5px solid ${(featureData.gifts?.types??[]).includes(lb)?'#84C5BC':'#e8e2db'}`,background:(featureData.gifts?.types??[]).includes(lb)?'#f0f9f8':'#fff',borderRadius:12,cursor:'pointer',transition:'all .15s'}}>
                    <span style={{fontSize:20}}>{ic}</span>
                    <span style={{fontSize:13,color:'#1a1a1a'}}>{lb}</span>
                  </div>
                ))}
              </div>
              <input style={inp} placeholder="Número de cuenta / link de lista (opcional)" value={featureData.gifts?.link??''} onChange={e=>setFD('gifts','link',e.target.value)}/>
              <button onClick={nextFeatureStep} style={btnPrimary()}>Siguiente →</button>
            </>)}

            {/* ── SUB-STEP: SONGS ── */}
            {featureSubStep==='songs' && (<>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
                <div style={{background:'#f0f9f8',borderRadius:8,padding:'4px 10px',fontSize:11,color:'#0f766e',fontWeight:500,letterSpacing:0.5}}>
                  {getActiveKeys(features).indexOf('songs')+1} / {getActiveKeys(features).length}
                </div>
                <p style={{fontSize:12,color:'#aaa'}}>Lista de canciones</p>
              </div>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontWeight:400,fontSize:24,color:'#1a1a1a',marginBottom:6}}>La música</h2>
              <p style={{fontSize:13,color:'#888',marginBottom:18,lineHeight:1.6}}>Tus invitados podrán sugerir canciones para la celebración.</p>
              <p style={{fontSize:11,letterSpacing:1,textTransform:'uppercase',color:'#aaa',marginBottom:10}}>Géneros preferidos</p>
              <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:16}}>
                {['Pop','Rock','Reggaeton','Flamenco','Clásica','Jazz','Electrónica','Latina','80s/90s','Indie'].map(g=>(
                  <div key={g} onClick={()=>{
                    const cur:string[] = featureData.songs?.genres??[]
                    setFD('songs','genres', cur.includes(g)?cur.filter(x=>x!==g):[...cur,g])
                  }} style={{padding:'7px 14px',borderRadius:20,border:`1.5px solid ${(featureData.songs?.genres??[]).includes(g)?'#84C5BC':'#e8e2db'}`,background:(featureData.songs?.genres??[]).includes(g)?'#f0f9f8':'#fff',cursor:'pointer',fontSize:12,color:'#444',transition:'all .15s'}}>
                    {g}
                  </div>
                ))}
              </div>
              <p style={{fontSize:11,letterSpacing:1,textTransform:'uppercase',color:'#aaa',marginBottom:10}}>¿Qué canción no puede faltar?</p>
              <input style={inp} placeholder="Ej: «Bohemian Rhapsody» o «La Bicicleta»" value={featureData.songs?.mustHave??''} onChange={e=>setFD('songs','mustHave',e.target.value)}/>
              <p style={{fontSize:11,letterSpacing:1,textTransform:'uppercase',color:'#aaa',marginBottom:10}}>¿Alguna canción prohibida?</p>
              <input style={inp} placeholder="Ej: «Despacito»" value={featureData.songs?.banned??''} onChange={e=>setFD('songs','banned',e.target.value)}/>
              <button onClick={nextFeatureStep} style={btnPrimary()}>Siguiente →</button>
            </>)}

            {/* ── SUB-STEP: TIMELINE ── */}
            {featureSubStep==='timeline' && (<>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
                <div style={{background:'#f0f9f8',borderRadius:8,padding:'4px 10px',fontSize:11,color:'#0f766e',fontWeight:500,letterSpacing:0.5}}>
                  {getActiveKeys(features).indexOf('timeline')+1} / {getActiveKeys(features).length}
                </div>
                <p style={{fontSize:12,color:'#aaa'}}>Programa del evento</p>
              </div>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontWeight:400,fontSize:24,color:'#1a1a1a',marginBottom:6}}>El programa</h2>
              <p style={{fontSize:13,color:'#888',marginBottom:16,lineHeight:1.6}}>¿Qué momentos clave tendrá tu {EVENT_TYPES.find(t=>t.slug===eventType)?.label.toLowerCase()||'evento'}?</p>
              {(featureData.timeline?.items??['','']).map((item:string,idx:number)=>(
                <div key={idx} style={{display:'flex',gap:8,marginBottom:10,alignItems:'center'}}>
                  <input type="time" style={{...inp,width:90,marginBottom:0,flexShrink:0}} value={(featureData.timeline?.times??[])[idx]??''} onChange={e=>{
                    const times=[...(featureData.timeline?.times??[])]; times[idx]=e.target.value; setFD('timeline','times',times)
                  }}/>
                  <input style={{...inp,marginBottom:0,flex:1}} placeholder={
                    idx===0?'Ej: Llegada de invitados':idx===1?'Ej: Ceremonia':idx===2?'Ej: Cóctel':'Otro momento'
                  } value={item} onChange={e=>{
                    const items=[...(featureData.timeline?.items??['',''])]; items[idx]=e.target.value; setFD('timeline','items',items)
                  }}/>
                  {idx>1&&<button onClick={()=>{
                    const items=(featureData.timeline?.items??[]).filter((_:any,i:number)=>i!==idx)
                    const times=(featureData.timeline?.times??[]).filter((_:any,i:number)=>i!==idx)
                    setFD('timeline','items',items); setFD('timeline','times',times)
                  }} style={{background:'none',border:'none',color:'#ccc',cursor:'pointer',fontSize:18,flexShrink:0}}>×</button>}
                </div>
              ))}
              <button onClick={()=>setFD('timeline','items',[...(featureData.timeline?.items??['','']),'' ])}
                style={{background:'none',border:'1px dashed #84C5BC',color:'#84C5BC',borderRadius:10,padding:'9px 16px',fontSize:13,cursor:'pointer',fontFamily:ff,width:'100%',marginBottom:14}}>
                + Añadir momento
              </button>
              <button onClick={nextFeatureStep} style={btnPrimary()}>Siguiente →</button>
            </>)}

            {/* ── SUB-STEP: TRANSPORT ── */}
            {featureSubStep==='transport' && (<>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
                <div style={{background:'#f0f9f8',borderRadius:8,padding:'4px 10px',fontSize:11,color:'#0f766e',fontWeight:500,letterSpacing:0.5}}>
                  {getActiveKeys(features).indexOf('transport')+1} / {getActiveKeys(features).length}
                </div>
                <p style={{fontSize:12,color:'#aaa'}}>Transporte</p>
              </div>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontWeight:400,fontSize:24,color:'#1a1a1a',marginBottom:6}}>El transporte</h2>
              <p style={{fontSize:13,color:'#888',marginBottom:18,lineHeight:1.6}}>Facilita la llegada y salida de tus invitados.</p>
              <p style={{fontSize:11,letterSpacing:1,textTransform:'uppercase',color:'#aaa',marginBottom:10}}>Tipo de transporte</p>
              <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:14}}>
                {[['🚌','Autobús organizado'],['🚕','Punto de recogida de taxis'],['🚗','Indicaciones para conducir'],['🚂','Instrucciones de tren/metro']].map(([ic,lb])=>(
                  <div key={lb} onClick={()=>{
                    const cur:string[]=featureData.transport?.types??[]
                    setFD('transport','types',cur.includes(lb)?cur.filter((x:string)=>x!==lb):[...cur,lb])
                  }} style={{display:'flex',alignItems:'center',gap:10,padding:'11px 14px',border:`1.5px solid ${(featureData.transport?.types??[]).includes(lb)?'#84C5BC':'#e8e2db'}`,background:(featureData.transport?.types??[]).includes(lb)?'#f0f9f8':'#fff',borderRadius:12,cursor:'pointer',transition:'all .15s'}}>
                    <span style={{fontSize:20}}>{ic}</span>
                    <span style={{fontSize:13,color:'#1a1a1a'}}>{lb}</span>
                  </div>
                ))}
              </div>
              <input style={inp} placeholder="Punto de salida (ej: Plaza de Cataluña, 18:30 h)" value={featureData.transport?.departure??''} onChange={e=>setFD('transport','departure',e.target.value)}/>
              <input style={inp} placeholder="Hora de vuelta (ej: 3:00 h y 5:00 h)" value={featureData.transport?.returnTime??''} onChange={e=>setFD('transport','returnTime',e.target.value)}/>
              <button onClick={nextFeatureStep} style={btnPrimary()}>Siguiente →</button>
            </>)}

            {/* ── SUB-STEP: HOTELS ── */}
            {featureSubStep==='hotels' && (<>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
                <div style={{background:'#f0f9f8',borderRadius:8,padding:'4px 10px',fontSize:11,color:'#0f766e',fontWeight:500,letterSpacing:0.5}}>
                  {getActiveKeys(features).indexOf('hotels')+1} / {getActiveKeys(features).length}
                </div>
                <p style={{fontSize:12,color:'#aaa'}}>Hoteles cercanos</p>
              </div>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontWeight:400,fontSize:24,color:'#1a1a1a',marginBottom:6}}>Alojamiento</h2>
              <p style={{fontSize:13,color:'#888',marginBottom:18,lineHeight:1.6}}>Recomienda hoteles o alojamientos para los invitados que vienen de lejos.</p>
              {[0,1,2].map(idx=>(
                <div key={idx} style={{background:'#fafafa',border:'1px solid #f0f0f0',borderRadius:12,padding:'12px 14px',marginBottom:10}}>
                  <p style={{fontSize:11,color:'#aaa',marginBottom:8,fontWeight:500}}>Hotel {idx+1} {idx>0&&'(opcional)'}</p>
                  <input style={{...inp,marginBottom:8}} placeholder="Nombre del hotel" value={(featureData.hotels?.names??[])[idx]??''} onChange={e=>{
                    const arr=[...(featureData.hotels?.names??['','',''])]; arr[idx]=e.target.value; setFD('hotels','names',arr)
                  }}/>
                  <input style={{...inp,marginBottom:0}} placeholder="Enlace o teléfono (opcional)" value={(featureData.hotels?.links??[])[idx]??''} onChange={e=>{
                    const arr=[...(featureData.hotels?.links??['','',''])]; arr[idx]=e.target.value; setFD('hotels','links',arr)
                  }}/>
                </div>
              ))}
              <button onClick={nextFeatureStep} style={btnPrimary()}>
                {getActiveKeys(features).indexOf('hotels')===getActiveKeys(features).length-1 ? 'Continuar al diseño →' : 'Siguiente →'}
              </button>
            </>)}
          </>)}

          {/* 6. FOTO DE PORTADA */}
          {step==='cover' && (<>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontWeight:400,fontSize:26,color:'#1a1a1a',marginBottom:6}}>Foto de portada</h2>
            <p style={{fontSize:13,color:'#888',marginBottom:18,lineHeight:1.6}}>
              {cfg.coverSuggestion} — o elige de nuestra galería.
            </p>

            {/* Upload */}
            <div onClick={()=>fileRef.current?.click()}
              style={{border:'1.5px dashed #84C5BC',borderRadius:14,padding:'16px',textAlign:'center',cursor:'pointer',marginBottom:14,background:coverType==='upload'?'#f0f9f8':'#fafafa'}}>
              <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}}
                onChange={async e=>{
                  const f=e.target.files?.[0]; if(!f) return
                  // Show preview immediately via blob URL
                  const blobUrl=URL.createObjectURL(f)
                  setCoverUrl(blobUrl); setCoverType('upload'); setCoverError(null); setCoverUploading(true)
                  try {
                    const fd=new FormData(); fd.append('file',f); fd.append('type','image')
                    const res=await fetch('/api/upload',{method:'POST',body:fd})
                    const d=await res.json()
                    if(res.ok && d.media?.url) {
                      // Replace blob URL with persistent URL
                      URL.revokeObjectURL(blobUrl)
                      setCoverUrl(d.media.url)
                    } else {
                      setCoverError(d.error ?? 'Error al subir la imagen')
                    }
                  } catch { setCoverError('Error de conexión al subir la imagen') }
                  finally { setCoverUploading(false) }
                }}/>
              {coverType==='upload' && coverUrl ? (
                <div style={{position:'relative'}}>
                  <img src={coverUrl} style={{width:'100%',height:120,objectFit:'cover',borderRadius:10}} alt="portada"/>
                  {coverUploading && (
                    <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.45)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                      <div style={{width:16,height:16,border:'2px solid #fff',borderTopColor:'transparent',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>
                      <span style={{color:'#fff',fontSize:12}}>Subiendo…</span>
                    </div>
                  )}
                  {!coverUploading && <div style={{position:'absolute',top:6,right:6,background:'#84C5BC',color:'#fff',width:22,height:22,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12}}>✓</div>}
                </div>
              ) : (
                <>
                  <p style={{fontSize:24,marginBottom:6}}>📷</p>
                  <p style={{fontSize:13,color:'#84C5BC',fontWeight:500}}>Subir mi propia foto</p>
                  <p style={{fontSize:11,color:'#aaa'}}>JPG, PNG · máx. 10 MB</p>
                </>
              )}
              {coverError && <p style={{fontSize:11,color:'#ef4444',marginTop:6}}>{coverError}</p>}
            </div>

            {/* Gallery */}
            <p style={{fontSize:11,letterSpacing:1.5,textTransform:'uppercase',color:'#aaa',marginBottom:10}}>O elige de la galería</p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8,marginBottom:14}}>
              {gallery.map((img,i)=>(
                <div key={i} onClick={()=>{setCoverUrl(img.url);setCoverType('gallery')}}
                  style={{borderRadius:12,overflow:'hidden',cursor:'pointer',border:`2.5px solid ${coverUrl===img.url?'#84C5BC':'transparent'}`,transition:'all .15s',aspectRatio:'16/9',position:'relative'}}>
                  <img src={img.thumb} style={{width:'100%',height:'100%',objectFit:'cover'}} alt={img.credit}/>
                  {coverUrl===img.url && <div style={{position:'absolute',top:6,right:6,background:'#84C5BC',color:'#fff',width:20,height:20,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11}}>✓</div>}
                </div>
              ))}
            </div>

            <div onClick={()=>{setCoverUrl(null);setCoverType('none')}}
              style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',border:`1.5px solid ${coverType==='none'?'#84C5BC':'#e8e2db'}`,background:coverType==='none'?'#f0f9f8':'#fff',borderRadius:12,cursor:'pointer',marginBottom:4}}>
              <div style={{width:20,height:20,borderRadius:'50%',border:coverType==='none'?'5px solid #84C5BC':'2px solid #ddd',flexShrink:0}}/>
              <p style={{fontSize:13,color:'#666',margin:0}}>Sin foto — usar solo color de fondo</p>
            </div>

            <button onClick={goNext} disabled={coverUploading} style={btnPrimary(coverUploading)}>
              {coverUploading ? 'Subiendo imagen…' : 'Continuar →'}
            </button>
          </>)}

          {/* 7. COLOR */}
          {step==='color' && (<>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontWeight:400,fontSize:26,color:'#1a1a1a',marginBottom:6}}>Color y fondo</h2>
            <p style={{fontSize:13,color:'#888',marginBottom:18,lineHeight:1.6}}>
              El color principal da la personalidad a tu invitación.
            </p>

            {/* Dark mode toggle */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 14px',background:'#f8f8f8',borderRadius:12,marginBottom:18}}>
              <div>
                <p style={{fontSize:13,fontWeight:500,color:'#1a1a1a',margin:0}}>Modo oscuro</p>
                <p style={{fontSize:11,color:'#aaa',margin:0}}>Fondo negro con texto claro</p>
              </div>
              <div onClick={()=>setDarkMode(!darkMode)}
                style={{width:44,height:24,borderRadius:12,background:darkMode?'#84C5BC':'#e0e0e0',cursor:'pointer',position:'relative',transition:'background .2s',flexShrink:0}}>
                <div style={{position:'absolute',top:3,left:darkMode?20:3,width:18,height:18,borderRadius:'50%',background:'#fff',transition:'left .2s'}}/>
              </div>
            </div>

            <p style={{fontSize:11,letterSpacing:1.5,textTransform:'uppercase',color:'#84C5BC',marginBottom:8,fontWeight:500}}>{cfg.paletteLabel}</p>
            <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap'}}>
              {cfg.defaultColors.map(c=>(
                <div key={c} onClick={()=>setColor(c)} style={{textAlign:'center'}}>
                  <div style={{width:42,height:42,borderRadius:'50%',background:c,cursor:'pointer',border:displayColor===c?'3px solid #1a1a1a':'3px solid transparent',transform:displayColor===c?'scale(1.14)':'scale(1)',transition:'all .15s'}}/>
                </div>
              ))}
            </div>

            <p style={{fontSize:11,letterSpacing:1.5,textTransform:'uppercase',color:'#aaa',marginBottom:8}}>Más colores</p>
            <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:18}}>
              {ALL_PALETTES.filter(p=>!cfg.defaultColors.includes(p.color)).map(p=>(
                <div key={p.color} onClick={()=>setColor(p.color)} style={{textAlign:'center'}}>
                  <div style={{width:32,height:32,borderRadius:'50%',background:p.color,cursor:'pointer',border:displayColor===p.color?'3px solid #1a1a1a':'3px solid transparent',transform:displayColor===p.color?'scale(1.14)':'scale(1)',transition:'all .15s'}}/>
                  <div style={{fontSize:8,color:'#bbb',marginTop:2}}>{p.name}</div>
                </div>
              ))}
            </div>

            {/* Mini preview */}
            <div style={{background:previewBg,borderRadius:14,padding:'18px 16px',textAlign:'center',marginBottom:18,position:'relative',overflow:'hidden'}}>
              {coverUrl && <img src={coverUrl} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:0.35}} alt=""/>}
              <p style={{fontSize:10,letterSpacing:3,textTransform:'uppercase',color:'rgba(255,255,255,0.55)',marginBottom:8,position:'relative'}}>
                {EVENT_TYPES.find(t=>t.slug===eventType)?.label}
              </p>
              <p style={{fontFamily:displayFont,fontSize:20,color:previewText,fontWeight:400,position:'relative'}}>{displayName}</p>
            </div>

            <button onClick={goNext} style={btnPrimary()}>Continuar →</button>
          </>)}

          {/* 8. TIPOGRAFÍA */}
          {step==='typography' && (<>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontWeight:400,fontSize:26,color:'#1a1a1a',marginBottom:6}}>Tipografía y estilo</h2>
            <p style={{fontSize:13,color:'#888',marginBottom:18,lineHeight:1.6}}>
              La fuente da el carácter definitivo a tu invitación.
            </p>

            <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:20}}>
              {FONTS.map(f=>(
                <div key={f.key} onClick={()=>setFont(f.key)}
                  style={{border:`1.5px solid ${font===f.key?'#84C5BC':'#e8e2db'}`,background:font===f.key?'#f0f9f8':'#fff',borderRadius:14,padding:'14px 16px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between',transition:'all .15s'}}>
                  <div>
                    <p style={{fontFamily:f.family,fontSize:20,color:'#1a1a1a',margin:'0 0 2px'}}>{f.label}</p>
                    <p style={{fontSize:11,color:'#aaa',margin:0}}>{f.sample}</p>
                  </div>
                  {font===f.key && <span style={{color:'#84C5BC',fontSize:16}}>✓</span>}
                </div>
              ))}
            </div>

            <p style={{fontSize:11,letterSpacing:1.5,textTransform:'uppercase',color:'#aaa',marginBottom:10}}>Nivel de decoración</p>
            <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:20}}>
              {DECOR_LEVELS.map(d=>(
                <div key={d.key} onClick={()=>setDecor(d.key)}
                  style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',border:`1.5px solid ${decor===d.key?'#84C5BC':'#e8e2db'}`,background:decor===d.key?'#f0f9f8':'#fff',borderRadius:12,cursor:'pointer',transition:'all .15s'}}>
                  <div style={{width:18,height:18,borderRadius:'50%',border:decor===d.key?'5px solid #84C5BC':'2px solid #ddd',flexShrink:0,transition:'all .2s'}}/>
                  <div>
                    <p style={{fontSize:13,fontWeight:500,color:'#1a1a1a',margin:0}}>{d.label}</p>
                    <p style={{fontSize:11,color:'#aaa',margin:0}}>{d.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={goNext} style={btnPrimary()}>Continuar →</button>
          </>)}

          {/* 9. TEXTO IA */}
          {step==='ai_text' && (<>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontWeight:400,fontSize:26,color:'#1a1a1a',marginBottom:6}}>Texto de bienvenida</h2>
            <p style={{fontSize:13,color:'#888',marginBottom:18,lineHeight:1.6}}>
              La IA crea el texto de tu invitación. Elige el tono y edítalo si quieres.
            </p>

            <p style={{fontSize:11,letterSpacing:1.5,textTransform:'uppercase',color:'#aaa',marginBottom:10}}>Tono del mensaje</p>
            <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:16}}>
              {cfg.aiTones.map(t=>(
                <div key={t} onClick={()=>setAiTone(t)}
                  style={{border:`1.5px solid ${aiTone===t?'#84C5BC':'#e8e2db'}`,background:aiTone===t?'#f0f9f8':'#fff',borderRadius:20,padding:'8px 16px',cursor:'pointer',fontSize:13,color:aiTone===t?'#0f766e':'#444',fontWeight:aiTone===t?500:400,transition:'all .15s'}}>
                  {t}
                </div>
              ))}
            </div>

            <button onClick={generateAiText} disabled={aiLoading}
              style={{width:'100%',background:'#f0f9f8',color:'#0f766e',border:'1.5px solid #84C5BC',borderRadius:12,padding:13,fontSize:13,fontWeight:500,cursor:'pointer',fontFamily:ff,marginBottom:14,opacity:aiLoading?0.6:1}}>
              {aiLoading ? '✨ Generando texto…' : '✨ Generar con IA'}
            </button>

            <textarea value={aiText} onChange={e=>setAiText(e.target.value)}
              placeholder="Aquí aparecerá el texto generado. También puedes escribir el tuyo directamente."
              style={{...inp,minHeight:110,resize:'vertical',lineHeight:1.6,marginBottom:4}}/>
            <p style={{fontSize:11,color:'#bbb',marginBottom:0}}>Edita el texto generado o escribe el tuyo propio.</p>

            <button onClick={goNext} style={btnPrimary()}>Continuar →</button>
            <button onClick={goNext} style={{width:'100%',background:'none',border:'none',color:'#aaa',fontSize:13,cursor:'pointer',fontFamily:ff,marginTop:6,padding:6}}>
              Saltar este paso
            </button>
          </>)}

          {/* 10. PREVIEW FINAL */}
          {step==='preview' && (<>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontWeight:400,fontSize:26,color:'#1a1a1a',marginBottom:6}}>Tu invitación</h2>
            <p style={{fontSize:13,color:'#888',marginBottom:18,lineHeight:1.6}}>
              Todo listo. Así queda antes de abrirla en el editor.
            </p>

            {/* Full preview card */}
            <div style={{background:previewBg,borderRadius:16,padding:'28px 20px',textAlign:'center',marginBottom:14,position:'relative',overflow:'hidden'}}>
              {coverUrl && <img src={coverUrl} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:0.3}} alt=""/>}
              <div style={{position:'relative'}}>
                <p style={{fontSize:10,letterSpacing:3,textTransform:'uppercase',color:'rgba(255,255,255,0.5)',marginBottom:10}}>
                  {EVENT_TYPES.find(t=>t.slug===eventType)?.label}
                </p>
                <p style={{fontFamily:FONTS.find(f=>f.key===font)?.family,fontSize:26,color:'#fff',fontWeight:400,lineHeight:1.15,marginBottom:10}}>
                  {displayName}
                </p>
                <div style={{width:40,height:1,background:'rgba(255,255,255,0.2)',margin:'0 auto 10px'}}/>
                {date && <p style={{fontSize:11,color:'rgba(255,255,255,0.65)',letterSpacing:2,textTransform:'uppercase',marginBottom:4}}>
                  {new Date(date).toLocaleDateString('es-ES',{day:'numeric',month:'long',year:'numeric'})}
                </p>}
                {place && <p style={{fontSize:11,color:'rgba(255,255,255,0.4)',letterSpacing:0.5}}>{place}</p>}
                {(aiText||subtitle) && <p style={{fontSize:12,color:'rgba(255,255,255,0.55)',fontStyle:'italic',marginTop:12,lineHeight:1.5}}>{aiText||subtitle}</p>}
              </div>
            </div>

            {/* Summary chips */}
            <div style={{background:'#f8f8f8',borderRadius:12,padding:'12px 14px',marginBottom:14}}>
              <p style={{fontSize:11,letterSpacing:1,textTransform:'uppercase',color:'#aaa',marginBottom:8}}>Resumen</p>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {[
                  {label:`Fuente: ${FONTS.find(f=>f.key===font)?.label}`},
                  {label:`Estilo: ${DECOR_LEVELS.find(d=>d.key===decor)?.label}`},
                  {label:darkMode?'Modo oscuro':'Modo claro'},
                  {label:coverUrl?'Con foto':'Sin foto'},
                  ...FEATURE_OPTIONS.filter(f=>features[f.key]).map(f=>({label:f.label})),
                ].map((c,i)=>(
                  <span key={i} style={{background:'#e8e8e8',color:'#555',fontSize:11,padding:'4px 10px',borderRadius:20}}>{c.label}</span>
                ))}
              </div>
            </div>

            {error && <p style={{fontSize:12,color:'#ef4444',marginBottom:10,textAlign:'center'}}>{error}</p>}

            <button onClick={()=>handleCreate('wizard')} disabled={saving}
              style={{width:'100%',background:'#84C5BC',color:'#fff',border:'none',borderRadius:12,padding:14,fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:ff,marginBottom:8,opacity:saving?0.7:1}}>
              {saving?'Creando invitación…':'✓ Crear y abrir editor →'}
            </button>
            <button onClick={goBack} style={{width:'100%',background:'none',border:'none',color:'#aaa',fontSize:13,cursor:'pointer',fontFamily:ff,padding:6}}>
              ← Ajustar diseño
            </button>
          </>)}

        </div>
      </div>
    </div>
  )
}
