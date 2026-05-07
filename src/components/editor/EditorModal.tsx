'use client'

import React, { useState, useRef, useEffect } from 'react'

interface CompItem {
  id: string
  label: string
  icon: React.ReactElement
}

const COMPONENTS: Record<string, CompItem[]> = {
  Cabeçalho: [
    { id: 'cabecalho', label: 'Cabeçalho', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="1" width="14" height="4" rx="1"/><path d="M1 8h14M1 12h8"/></svg> },
    { id: 'progresso', label: 'Progresso', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="6" width="14" height="4" rx="2"/><rect x="1" y="6" width="8" height="4" rx="2" fill="currentColor" stroke="none" opacity="0.4"/></svg> },
    { id: 'titulo', label: 'Título', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 3h12M8 3v10M5 13h6"/></svg> },
  ],
  Relatórios: [
    { id: 'resultado', label: 'Resultado', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 12l3-4 3 2 3-5 3 3"/><path d="M2 14h12"/></svg> },
    { id: 'niveis', label: 'Níveis', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="10" width="3" height="5" rx="0.5"/><rect x="6" y="6" width="3" height="9" rx="0.5"/><rect x="11" y="2" width="3" height="13" rx="0.5"/></svg> },
    { id: 'destaques', label: 'Destaques', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 1l1.8 3.6L14 5.6l-3 2.9.7 4.1L8 10.5l-3.7 2.1.7-4.1-3-2.9 4.2-.4z"/></svg> },
    { id: 'grafico', label: 'Gráfico', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 12l3-3 3 2 4-6"/><circle cx="14" cy="5" r="1.5"/><path d="M2 14h12"/></svg> },
  ],
  Checkout: [
    { id: 'cronometro', label: 'Cronômetro', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="9" r="5.5"/><path d="M8 6.5v3l1.5 1.5"/><path d="M6 1h4M8 1v2"/></svg> },
    { id: 'depoimento', label: 'Depoimento', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M14 10c0 .6-.4 1-1 1H5l-3 3V3c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v7z"/></svg> },
    { id: 'garantia', label: 'Garantia', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 1l5.5 2v5c0 3-2.5 5.5-5.5 6.5C5 13.5 2.5 11 2.5 8V3L8 1z"/></svg> },
    { id: 'transformacao', label: 'Transformação', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 8h12M9 4l5 4-5 4"/><path d="M7 4L2 8l5 4"/></svg> },
    { id: 'beneficios', label: 'Benefícios', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 8l4 4 8-8"/></svg> },
    { id: 'preco', label: 'Preço', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6.5"/><path d="M8 4.5v7M5.5 6.5c0-1.1 1.1-2 2.5-2s2.5.9 2.5 2-1.1 2-2.5 2-2.5.9-2.5 2 1.1 2 2.5 2 2.5-.9 2.5-2"/></svg> },
    { id: 'checkout', label: 'Checkout', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="4" width="14" height="10" rx="1.5"/><path d="M1 7h14M4 10.5h2M9 10.5h3"/></svg> },
  ],
  Texto: [
    { id: 'texto', label: 'Texto', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 4h12M2 8h8M2 12h10"/></svg> },
    { id: 'numero', label: 'Número', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 2v12M12 2v12M2 6h12M2 10h12"/></svg> },
    { id: 'lista', label: 'Lista', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="3" cy="4" r="1" fill="currentColor" stroke="none"/><circle cx="3" cy="8" r="1" fill="currentColor" stroke="none"/><circle cx="3" cy="12" r="1" fill="currentColor" stroke="none"/><path d="M6 4h8M6 8h8M6 12h8"/></svg> },
    { id: 'nota', label: 'Nota', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M9 1H3a1 1 0 00-1 1v12a1 1 0 001 1h10a1 1 0 001-1V6L9 1z"/><path d="M9 1v5h5M5 9h6M5 12h4"/></svg> },
  ],
  Ação: [
    { id: 'carregamento', label: 'Carregamento', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 2a6 6 0 100 12A6 6 0 008 2z" strokeDasharray="3 3"/><path d="M8 2a6 6 0 016 6"/></svg> },
    { id: 'botao', label: 'Botão', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="5" width="14" height="6" rx="3"/><path d="M6 8h4M8 6.5l2 1.5-2 1.5"/></svg> },
    { id: 'redirecionar', label: 'Redirecionar', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 8h12M9 4l5 4-5 4"/></svg> },
    { id: 'quiz', label: 'Quiz', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6.5"/><path d="M6.5 6.5c0-1 .7-1.5 1.5-1.5s1.5.7 1.5 1.5c0 1-1.5 2-1.5 2M8 11v.5"/></svg> },
  ],
  Mídia: [
    { id: 'carrossel', label: 'Carrossel', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="10" height="10" rx="1"/><path d="M1 6v4M15 6v4"/></svg> },
    { id: 'imagem', label: 'Imagem', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="2" width="14" height="12" rx="1.5"/><circle cx="5.5" cy="6" r="1.5"/><path d="M1 11l4-4 3 3 2-2 5 5"/></svg> },
    { id: 'audio', label: 'Áudio', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 1v14M5 3.5v9M2 6v4M11 3.5v9M14 6v4"/></svg> },
    { id: 'video', label: 'Vídeo', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="3" width="10" height="10" rx="1.5"/><path d="M11 6l4-2v8l-4-2V6z"/></svg> },
  ],
  Tracking: [
    { id: 'metapixel', label: 'Meta Pixel', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 8c0-3.3 2.7-6 6-6s6 2.7 6 6-2.7 6-6 6"/><path d="M8 4c1.5 1.5 2 3.5 2 4s-.5 2.5-2 4M8 4C6.5 5.5 6 7.5 6 8s.5 2.5 2 4M2 8h12"/></svg> },
  ],
}

const EMOJI_OPTIONS = ['😊','😔','😤','🤔','😍','🚀','💪','🎯','💰','❤️','👍','🔥']
const STOCK_IMAGES = [
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&q=80',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&q=80',
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=200&q=80',
  'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=200&q=80',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&q=80',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
  'https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?w=200&q=80',
]

interface BlockItem {
  id: string; compId: string; label: string
  logoUrl?: string; logoFile?: string; showBack?: boolean; bgColor?: string
  logoSize?: number; logoPosition?: string; headerHeight?: number
  progress?: number; progressColor?: string; progressBgColor?: string
  progressHeight?: number; showPercent?: boolean; progressStyle?: string; progressAnimated?: boolean
  headline?: string; headlineSize?: number; headlineColor?: string; headlineAlign?: string
  subheadline?: string; subheadlineColor?: string; headlineShadow?: boolean; headlineShadowColor?: string
  headlineLineHeight?: number; headlineFontWeight?: string
  texto?: string; textoSize?: number; textoColor?: string; textoAlign?: string
  textoLineHeight?: number; textoFontWeight?: string
  itens?: string[]; listaColor?: string; checkColor?: string
  listaIcone?: string; listaSpacing?: number
  notaTexto?: string; notaTipo?: 'info' | 'aviso' | 'sucesso'
  quizPergunta?: string; quizPerguntaSize?: number; quizOpcoes?: string[]
  quizCorSelecionada?: string; quizBorderRadius?: number; quizColunas?: '1'|'2'
  quizModelo?: string; quizPosicionamento?: string; quizAlinhamento?: string
  quizAnimacao?: string; quizCheckbox?: string; quizMultipla?: boolean
  quizObrigatorio?: boolean; quizOpcaoEmojis?: string[]; quizOpcaoImagens?: string[]
  quizOpcoesDados?: { titulo: string; subtitulo?: string; imagem?: string; emoji?: string; corFundo?: string; corBorda?: string; corTexto?: string }[]
  quizVariavel?: string
  graficoTipo?: 'linha'|'barra'|'pizza'|'area'
  graficoTitulo?: string; graficoLabels?: string[]; graficoValores?: number[]
  graficoCor?: string; graficoCorFundo?: string; graficoEixoX?: string; graficoEixoY?: string
  graficoMostrarPontos?: boolean; graficoMostrarGrid?: boolean; graficoSuavizar?: boolean
  graficoAlturaCustom?: number
  resultPerfil?: string; resultDescricao?: string; resultScore?: number; resultCor?: string
  resultEstilo?: 'barra'|'circular'|'velocimetro'
  resultFaixas?: { min: number; max: number; label: string; cor: string; desc?: string }[]
  resultMostrarScore?: boolean
  botaoTexto?: string; botaoCor?: string; botaoTextoCor?: string
  botaoBorderRadius?: number; botaoTamanho?: string; botaoDestino?: string
  botaoIcone?: string; botaoSombra?: boolean
  imagemUrl?: string; imagemFile?: string; imagemBorderRadius?: number
  imagemHeight?: number; imagemFit?: string; imagemOverlayTexto?: string; imagemOverlayCor?: string
  videoUrl?: string; videoFile?: string; videoThumb?: string; videoAutoplay?: boolean
  audioUrl?: string; audioFile?: string; audioTitulo?: string
  cronoHoras?: number; cronoMinutos?: number; cronoSegundos?: number
  cronoCor?: string; cronoTexto?: string; cronoEstilo?: string; cronoBgCor?: string
  depNome?: string; depTexto?: string; depEstrelas?: number; depAvatar?: string
  depLayout?: string; depCardCor?: string
  garDias?: number; garTexto?: string; garCor?: string
  precoDe?: string; precoPor?: string; precoParcelas?: string; precoCor?: string
  precoBadge?: string; precoSelo?: boolean
  checkoutTexto?: string; checkoutCor?: string; checkoutTextoCor?: string
  checkoutPix?: boolean; checkoutCartao?: boolean; checkoutSeguranca?: string
  benefItems?: string[]; benefCor?: string; benefLayout?: string; benefIcone?: string
  loadTexto?: string; loadCor?: string; loadEstilo?: string; loadMensagens?: string[]
  redirTexto?: string; redirUrl?: string; redirSegundos?: number
  pixelId?: string; pixelEvento?: string
}

function UploadButton({ label, accept, value, onChange }: { label: string; accept: string; value?: string; onChange: (url: string) => void }) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div className="flex flex-col gap-1.5">
      <div onClick={() => ref.current?.click()} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer" style={{ background: '#1a1b2a', border: '1.5px dashed rgba(124,92,252,0.4)' }} onMouseEnter={e => (e.currentTarget.style.borderColor='rgba(124,92,252,0.8)')} onMouseLeave={e => (e.currentTarget.style.borderColor='rgba(124,92,252,0.4)')}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"><path d="M7 1v8M4 4l3-3 3 3M2 10v2a1 1 0 001 1h8a1 1 0 001-1v-2"/></svg>
        <span className="text-xs" style={{ color: '#a78bfa' }}>{value ? '✓ Carregado' : label}</span>
      </div>
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={e => { const f = e.target.files?.[0]; if(f) onChange(URL.createObjectURL(f)) }}/>
      {value && <div className="h-0.5 rounded-full" style={{ background: '#7c5cfc' }}/>}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</label>}
      {children}
    </div>
  )
}

function Slider({ label, value, min, max, unit='', onChange }: { label: string; value: number; min: number; max: number; unit?: string; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between">
        <label className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</label>
        <span className="text-[10px]" style={{ color: '#a78bfa' }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))} className="w-full accent-[#7c5cfc]"/>
    </div>
  )
}

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const presets = ['#7c5cfc','#a78bfa','#f97316','#22d387','#f43f5e','#2dd4bf','#fbbf24','#1a1a2e','#ffffff','#6b7280']
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</label>}
      <div className="flex gap-1.5 flex-wrap items-center">
        {presets.map(c => <div key={c} onClick={() => onChange(c)} className="w-6 h-6 rounded-md cursor-pointer hover:scale-110 transition-transform flex-shrink-0" style={{ background: c, outline: value===c?'2px solid white':'none', outlineOffset: 1, border: c==='#ffffff'?'1px solid rgba(255,255,255,0.2)':'none' }}/>)}
        <div className="relative w-6 h-6 rounded-md overflow-hidden flex-shrink-0" style={{ border: '1px solid rgba(255,255,255,0.2)' }}>
          <div style={{ width:'100%', height:'100%', background: value }}/>
          <input type="color" value={value} onChange={e => onChange(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"/>
        </div>
      </div>
    </div>
  )
}

function AlignPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1">
      {[{v:'left',i:'⬅'},{v:'center',i:'⬛'},{v:'right',i:'➡'}].map(a => (
        <button key={a.v} onClick={() => onChange(a.v)} className="flex-1 py-1.5 rounded-lg text-[10px] transition-all" style={{ background: value===a.v?'#7c5cfc':'#1a1b2a', color: value===a.v?'#fff':'rgba(255,255,255,0.4)', border:'1px solid rgba(255,255,255,0.06)' }}>{a.i}</button>
      ))}
    </div>
  )
}

function SegmentedControl({ value, options, onChange }: { value: string; options: {v:string;l:string}[]; onChange: (v:string)=>void }) {
  return (
    <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#1a1b2a' }}>
      {options.map(o => (
        <button key={o.v} onClick={() => onChange(o.v)} className="flex-1 py-1.5 rounded-lg text-[10px] transition-all font-medium" style={{ background: value===o.v?'#7c5cfc':'transparent', color: value===o.v?'#fff':'rgba(255,255,255,0.4)' }}>{o.l}</button>
      ))}
    </div>
  )
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v:boolean)=>void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
      <div onClick={() => onChange(!value)} className="w-9 h-5 rounded-full cursor-pointer relative transition-colors" style={{ background: value?'#7c5cfc':'rgba(255,255,255,0.1)' }}>
        <div className="absolute w-4 h-4 bg-white rounded-full top-0.5 transition-all" style={{ left: value?'18px':'2px' }}/>
      </div>
    </div>
  )
}

function GaugeChart({ score, cor, size=100 }: { score: number; cor: string; size?: number }) {
  const cx = size/2, cy = size*0.62, r = size*0.38
  const startAngle = Math.PI
  const endAngle = 2*Math.PI
  const angle = startAngle + (score/100) * Math.PI
  const x1 = cx + r*Math.cos(startAngle), y1 = cy + r*Math.sin(startAngle)
  const x2 = cx + r*Math.cos(endAngle), y2 = cy + r*Math.sin(endAngle)
  const xN = cx + r*Math.cos(angle), yN = cy + r*Math.sin(angle)
  const large = score > 50 ? 1 : 0
  return (
    <svg width={size} height={size*0.65} viewBox={`0 0 ${size} ${size*0.65}`}>
      <path d={`M${x1},${y1} A${r},${r} 0 1 1 ${x2},${y2}`} stroke="#f0f0f5" strokeWidth="8" fill="none" strokeLinecap="round"/>
      <path d={`M${x1},${y1} A${r},${r} 0 ${large} 1 ${xN},${yN}`} stroke={cor} strokeWidth="8" fill="none" strokeLinecap="round"/>
      <circle cx={xN} cy={yN} r="5" fill="#fff" stroke={cor} strokeWidth="2"/>
      <text x={cx} y={cy+2} textAnchor="middle" fontSize={size*0.14} fontWeight="700" fill={cor}>{score}</text>
      <text x={cx} y={cy+size*0.12} textAnchor="middle" fontSize={size*0.075} fill="#999">/ 100</text>
    </svg>
  )
}

function RenderCabecalho({ b }: { b: BlockItem }) {
  const h = b.headerHeight || 52
  const logoSz = b.logoSize || 60
  const pos = b.logoPosition || 'center'
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent: pos==='left'?'flex-start': pos==='right'?'flex-end':'center', padding:`0 16px`, height: h, background: b.bgColor||'#fff', borderBottom:'1px solid #f0f0f5', gap: 8, position:'relative' }}>
      {b.showBack!==false && pos!=='left' && <button style={{ position:'absolute', left:12, width:28, height:28, borderRadius:8, background:'#f5f5fa', border:'none', display:'flex', alignItems:'center', justifyContent:'center' }}><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round"><path d="M9 2L4 7l5 5"/></svg></button>}
      {b.logoFile||b.logoUrl ? <img src={b.logoFile||b.logoUrl} alt="Logo" style={{ height:`${logoSz}%`, maxHeight:h-12, maxWidth:'60%', objectFit:'contain' }}/> : <div style={{ height:28, width:80, background:'#f0f0f5', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center' }}><span style={{ fontSize:9, color:'#bbb' }}>Sua Logo</span></div>}
    </div>
  )
}

function RenderProgresso({ b }: { b: BlockItem }) {
  const pct = b.progress ?? 10
  const h = b.progressHeight ?? 8
  const cor = b.progressColor || '#7c5cfc'
  const bg = b.progressBgColor || '#f0f0f5'
  const style = b.progressStyle || 'gradiente'
  const mostrarPct = b.showPercent !== false
  const gradient = style === 'gradiente' ? `linear-gradient(90deg, ${cor}, #a78bfa)`
    : style === 'listrado' ? `repeating-linear-gradient(45deg,${cor},${cor} 6px,rgba(255,255,255,0.25) 6px,rgba(255,255,255,0.25) 12px)`
    : cor
  if (style === 'segmentado') {
    const segs = 5
    return (
      <div style={{ padding: '10px 16px 12px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <span style={{ fontSize:10, fontWeight:600, color:'#888', letterSpacing:0.5 }}>PROGRESSO</span>
          {mostrarPct && <span style={{ fontSize:11, fontWeight:700, color:cor }}>{pct}%</span>}
        </div>
        <div style={{ display:'flex', gap:4 }}>
          {Array.from({length:segs}).map((_,i) => (
            <div key={i} style={{ flex:1, height:h, borderRadius:99, background: i<Math.round(pct/100*segs)?cor:bg, boxShadow: i<Math.round(pct/100*segs)?`0 0 8px ${cor}60`:'none' }}/>
          ))}
        </div>
      </div>
    )
  }
  return (
    <div style={{ padding:'10px 16px 12px' }}>
      <div style={{ display:'flex', justifyContent: mostrarPct ? 'space-between' : 'flex-start', alignItems:'center', marginBottom:6 }}>
        <span style={{ fontSize:10, fontWeight:600, color:'#999', letterSpacing:0.5 }}>PROGRESSO</span>
        {mostrarPct && <span style={{ fontSize:11, fontWeight:700, color:cor }}>{pct}%</span>}
      </div>
      <div style={{ height:h, background:bg, borderRadius:99, overflow:'hidden', position:'relative' }}>
        <div style={{ height:'100%', width:`${pct}%`, background:gradient, borderRadius:99, transition:'width 0.5s cubic-bezier(0.4,0,0.2,1)', position:'relative', boxShadow:`0 0 12px ${cor}80` }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:'50%', background:'rgba(255,255,255,0.25)', borderRadius:'99px 99px 0 0' }}/>
        </div>
      </div>
    </div>
  )
}

function RenderTitulo({ b }: { b: BlockItem }) {
  const shadow = b.headlineShadow ? `2px 2px 8px ${b.headlineShadowColor||'rgba(124,92,252,0.3)'}` : 'none'
  return (
    <div style={{ padding:'12px 16px' }}>
      <div style={{ fontSize:b.headlineSize||16, fontWeight:b.headlineFontWeight||'700', color:b.headlineColor||'#1a1a2e', lineHeight:b.headlineLineHeight||1.3, marginBottom:6, fontFamily:'Syne, sans-serif', textAlign:(b.headlineAlign||'left') as any, textShadow:shadow }}>{b.headline||'Seu título principal aqui'}</div>
      {b.subheadline && <div style={{ fontSize:11, color:b.subheadlineColor||'#888', lineHeight:1.5, textAlign:(b.headlineAlign||'left') as any }}>{b.subheadline}</div>}
    </div>
  )
}

function RenderTexto({ b }: { b: BlockItem }) {
  return <div style={{ padding:'8px 16px' }}><div style={{ fontSize:b.textoSize||12, fontWeight:b.textoFontWeight||'400', color:b.textoColor||'#555', lineHeight:b.textoLineHeight||1.7, textAlign:(b.textoAlign||'left') as any }}>{b.texto||'Digite o texto aqui.'}</div></div>
}

function RenderLista({ b }: { b: BlockItem }) {
  const itens = b.itens||['Item 1','Item 2','Item 3']
  const cor = b.checkColor||'#7c5cfc'
  const icone = b.listaIcone||'check'
  const gap = b.listaSpacing||8
  function renderIcone() {
    if (icone==='circulo') return <div style={{ width:8, height:8, borderRadius:'50%', background:cor, flexShrink:0 }}/>
    if (icone==='seta') return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={cor} strokeWidth="2" strokeLinecap="round"><path d="M2 6h8M7 3l3 3-3 3"/></svg>
    if (icone==='estrela') return <span style={{ fontSize:12, color:cor }}>★</span>
    return <div style={{ width:18, height:18, borderRadius:5, background:`${cor}18`, border:`1.5px solid ${cor}44`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke={cor} strokeWidth="2" strokeLinecap="round"><path d="M2 5l2.5 2.5L8 2.5"/></svg></div>
  }
  return (
    <div style={{ padding:'8px 16px', display:'flex', flexDirection:'column', gap }}>
      {itens.map((item,i) => <div key={i} style={{ display:'flex', alignItems:'center', gap:8 }}>{renderIcone()}<span style={{ fontSize:11, color:b.listaColor||'#444' }}>{item}</span></div>)}
    </div>
  )
}

function RenderNota({ b }: { b: BlockItem }) {
  const tipo = b.notaTipo || 'info'
  const configs: Record<string, { bg: string; border: string; cor: string; iconPath: string }> = {
    info: { bg: 'rgba(79,142,247,0.06)', border: 'rgba(79,142,247,0.2)', cor: '#4f8ef7', iconPath: 'M12 12h-1V9h-1m1-3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    aviso: { bg: 'rgba(249,115,22,0.06)', border: 'rgba(249,115,22,0.2)', cor: '#f97316', iconPath: 'M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z' },
    sucesso: { bg: 'rgba(34,211,135,0.06)', border: 'rgba(34,211,135,0.2)', cor: '#22d387', iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    atencao: { bg: 'rgba(124,92,252,0.06)', border: 'rgba(124,92,252,0.2)', cor: '#7c5cfc', iconPath: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  }
  const c = configs[tipo] || configs.info
  const titulo = (b as any).notaTitulo || { info: 'Informação', aviso: 'Aviso', sucesso: 'Atenção!', atencao: 'Atenção!' }[tipo]
  return (
    <div style={{ padding: '6px 14px' }}>
      <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 12, padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${c.cor}15`, border: `1.5px solid ${c.cor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c.cor} strokeWidth="2" strokeLinecap="round"><path d={c.iconPath}/></svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#1a1a2e', marginBottom: 3 }}>{titulo}</div>
          <div style={{ fontSize: 10, color: '#666', lineHeight: 1.6 }}>{b.notaTexto || 'Utilize este componente para complementar informações importantes.'}</div>
        </div>
      </div>
    </div>
  )
}

function RenderQuiz({ b }: { b: BlockItem }) {
  const [sel, setSel] = useState<number[]>([])
  const opcoesDados = b.quizOpcoesDados || (b.quizOpcoes || ['Opção A','Opção B','Opção C','Opção D']).map(t => ({ titulo: t }))
  const cor = b.quizCorSelecionada || '#7c5cfc'
  const r = b.quizBorderRadius ?? 10
  const colunas = b.quizColunas || '1'
  const modelo = b.quizModelo || 'texto'
  const align = b.quizAlinhamento || 'left'
  const checkPos = b.quizCheckbox || 'nenhuma'
  function toggle(i: number) {
    if (b.quizMultipla) setSel(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])
    else setSel([i])
  }
  const isSelected = (i: number) => sel.includes(i)
  const jc = align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'
  const checkEl = (i: number) => checkPos !== 'nenhuma' ? (
    <div style={{ width:18, height:18, borderRadius: b.quizMultipla ? 4 : '50%', border:`2px solid ${isSelected(i) ? cor : '#ddd'}`, background: isSelected(i) ? cor : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      {isSelected(i) && <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M2 5l2.5 2.5L8 2.5"/></svg>}
    </div>
  ) : null
  function renderOpcao(op: any, i: number) {
    const s = isSelected(i)
    const bg = s ? (op.corFundo || `${cor}10`) : (op.corFundo || '#f8f8fc')
    const border = s ? (op.corBorda || cor) : (op.corBorda || '#e8e8f2')
    const textColor = op.corTexto || (s ? '#1a1a2e' : '#555')
    if (modelo === 'texto-emoji') return (
      <div key={i} onClick={() => toggle(i)} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:r, background:bg, border:`1.5px solid ${border}`, cursor:'pointer', justifyContent:jc }}>
        {checkPos === 'esquerda' && checkEl(i)}
        <span style={{ fontSize:16 }}>{op.emoji || '😊'}</span>
        <div style={{ flex:1 }}><div style={{ fontSize:10, color:textColor, fontWeight: s ? 600 : 400 }}>{op.titulo}</div>{op.subtitulo && <div style={{ fontSize:8, color:'#aaa' }}>{op.subtitulo}</div>}</div>
        {checkPos === 'direita' && checkEl(i)}
      </div>
    )
    return (
      <div key={i} onClick={() => toggle(i)} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:r, background:bg, border:`1.5px solid ${border}`, cursor:'pointer', justifyContent:jc }}>
        {checkPos === 'esquerda' && checkEl(i)}
        <div style={{ flex: align === 'left' ? 1 : 0 }}><div style={{ fontSize:10, color:textColor, fontWeight: s ? 600 : 400 }}>{op.titulo}</div>{op.subtitulo && <div style={{ fontSize:8, color:'#aaa', marginTop:1 }}>{op.subtitulo}</div>}</div>
        {checkPos === 'direita' && checkEl(i)}
      </div>
    )
  }
  return (
    <div style={{ padding:'8px 16px', display:'flex', flexDirection:'column', gap:6 }}>
      {b.quizPergunta && <div style={{ fontSize: b.quizPerguntaSize || 12, fontWeight:600, color:'#1a1a2e', marginBottom:4, textAlign: align as any }}>{b.quizPergunta}</div>}
      <div style={{ display:'grid', gridTemplateColumns: colunas === '2' ? '1fr 1fr' : '1fr', gap:6 }}>
        {opcoesDados.map((op: any, i: number) => renderOpcao(op, i))}
      </div>
    </div>
  )
}

function RenderGrafico({ b }: { b: BlockItem }) {
  const tipo = b.graficoTipo || 'linha'
  const cor = b.graficoCor || '#7c5cfc'
  const valores = b.graficoValores || [30,55,40,70,60,85,75]
  const labels = b.graficoLabels || ['Jan','Fev','Mar','Abr','Mai','Jun','Jul']
  const H = b.graficoAlturaCustom || 110
  const W = 252
  const pad = { t:14, r:10, b:22, l:24 }
  const innerW = W - pad.l - pad.r
  const innerH = H - pad.t - pad.b
  const mostrarGrid = b.graficoMostrarGrid !== false
  const mostrarPontos = b.graficoMostrarPontos !== false
  const mostrarLabels = (b as any).graficoMostrarLabels !== false

  const [progresso, setProgresso] = useState(0)
  const [hover, setHover] = useState<number|null>(null)

  useEffect(() => {
    setProgresso(0)
    const steps = 40, dur = 900
    let cur = 0
    const t = setInterval(() => {
      cur++
      setProgresso(Math.min(1, 1 - Math.pow(1 - cur/steps, 2.5)))
      if (cur >= steps) clearInterval(t)
    }, dur/steps)
    return () => clearInterval(t)
  }, [JSON.stringify(valores), tipo, cor])

  const max = Math.max(...valores), minV = Math.min(...valores), range = max - minV || 1
  const gradId = `gfx${cor.replace('#','')}`

  // Linha/Área
  if (tipo === 'linha' || tipo === 'area') {
    const pts = valores.map((v,i) => ({
      x: pad.l + (i/(Math.max(valores.length-1,1)))*innerW,
      y: pad.t + (1-(v-minV)/range)*innerH
    }))
    // Interpolar pts com progresso
    const ptsAnim = pts.map((p,i) => ({
      x: p.x,
      y: pad.t + innerH - (pad.t + innerH - p.y) * progresso
    }))
    const pathD = ptsAnim.map((p,i) => {
      if(i===0) return `M${p.x},${p.y}`
      const prev = ptsAnim[i-1]
      const cx = (prev.x + p.x) / 2
      return `C${cx},${prev.y} ${cx},${p.y} ${p.x},${p.y}`
    }).join(' ')
    const areaD = pathD + ` L${ptsAnim[ptsAnim.length-1].x},${pad.t+innerH} L${ptsAnim[0].x},${pad.t+innerH} Z`

    return (
      <div style={{ padding:'8px 12px 4px' }}>
        <style>{`@keyframes gfxFadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
        {b.graficoTitulo && (
          <div style={{ fontSize:11, fontWeight:700, color:'#1a1a2e', marginBottom:4 }}>{b.graficoTitulo}</div>
        )}
        {(b as any).graficoSubtitulo && (
          <div style={{ fontSize:9, color:'#999', marginBottom:8 }}>{(b as any).graficoSubtitulo}</div>
        )}
        <div style={{ background:'#fafafa', borderRadius:14, padding:'10px 6px 2px', border:'1px solid rgba(0,0,0,0.06)', overflow:'hidden', position:'relative', animation:'gfxFadeIn 0.4s ease' }}>
          <svg width={W} height={H+6} viewBox={`0 0 ${W} ${H+6}`} style={{ overflow:'visible' }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={cor} stopOpacity="0.28"/>
                <stop offset="100%" stopColor={cor} stopOpacity="0.02"/>
              </linearGradient>
            </defs>
            {/* Grid */}
            {mostrarGrid && [0.25,0.5,0.75,1].map((t,i) => (
              <line key={i} x1={pad.l} x2={W-pad.r}
                y1={pad.t+t*innerH} y2={pad.t+t*innerH}
                stroke="rgba(0,0,0,0.05)" strokeWidth="1" strokeDasharray="4 4"/>
            ))}
            {/* Eixo Y */}
            {mostrarGrid && [0,0.5,1].map((t,i) => (
              <text key={i} x={pad.l-4} y={pad.t+t*innerH+3}
                textAnchor="end" fontSize="7" fill="rgba(0,0,0,0.28)">
                {Math.round(max - t*(max-minV))}
              </text>
            ))}
            {/* Área */}
            {tipo==='area' && <path d={areaD} fill={`url(#${gradId})`}/>}
            {tipo==='linha' && <path d={areaD} fill={`url(#${gradId})`} opacity="0.5"/>}
            {/* Linha */}
            <path d={pathD} stroke={cor} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            {/* Pontos */}
            {mostrarPontos && ptsAnim.map((p,i) => (
              <g key={i} style={{ cursor:'pointer' }} onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(null)}>
                <circle cx={p.x} cy={p.y} r="6" fill="transparent"/>
                <circle cx={p.x} cy={p.y} r={hover===i?5:3.5} fill="white" stroke={cor} strokeWidth="2" style={{ transition:'r 0.15s' }}/>
                <circle cx={p.x} cy={p.y} r={hover===i?3:2} fill={cor} style={{ transition:'r 0.15s' }}/>
                {/* Tooltip no hover */}
                {hover===i && (
                  <g>
                    <rect x={p.x-14} y={p.y-22} width="28" height="16" rx="5" fill={cor}/>
                    <text x={p.x} y={p.y-11} textAnchor="middle" fontSize="8" fontWeight="700" fill="white">{valores[i]}</text>
                  </g>
                )}
              </g>
            ))}
            {/* Labels eixo X */}
            {mostrarLabels && labels.map((l,i) => (
              <text key={i} x={pad.l+(i/(Math.max(labels.length-1,1)))*innerW}
                y={H+5} textAnchor="middle" fontSize="7" fill="rgba(0,0,0,0.3)">{l}</text>
            ))}
          </svg>
        </div>
      </div>
    )
  }

  // Barras
  if (tipo === 'barra') {
    const bw = Math.max((innerW/valores.length) - 5, 8)
    return (
      <div style={{ padding:'8px 12px 4px' }}>
        {b.graficoTitulo && <div style={{ fontSize:11, fontWeight:700, color:'#1a1a2e', marginBottom:4 }}>{b.graficoTitulo}</div>}
        {(b as any).graficoSubtitulo && <div style={{ fontSize:9, color:'#999', marginBottom:8 }}>{(b as any).graficoSubtitulo}</div>}
        <div style={{ background:'#fafafa', borderRadius:14, padding:'10px 6px 2px', border:'1px solid rgba(0,0,0,0.06)', overflow:'hidden' }}>
          <svg width={W} height={H+6} viewBox={`0 0 ${W} ${H+6}`}>
            <defs>
              <linearGradient id={`${gradId}b`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={cor} stopOpacity="1"/>
                <stop offset="100%" stopColor={cor} stopOpacity="0.6"/>
              </linearGradient>
            </defs>
            {mostrarGrid && [0.25,0.5,0.75,1].map((t,i) => (
              <line key={i} x1={pad.l} x2={W-pad.r} y1={pad.t+t*innerH} y2={pad.t+t*innerH} stroke="rgba(0,0,0,0.05)" strokeWidth="1" strokeDasharray="4 3"/>
            ))}
            {valores.map((v,i) => {
              const bh = ((v-minV)/range)*innerH * progresso
              const x = pad.l + i*(innerW/valores.length) + 2
              const y = pad.t + innerH - bh
              const isHov = hover === i
              return (
                <g key={i} onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(null)} style={{ cursor:'pointer' }}>
                  <rect x={x} y={y} width={bw} height={bh} rx="5" fill={isHov?cor:`url(#${gradId}b)`} opacity={isHov?1:0.85} style={{ transition:'opacity 0.15s' }}/>
                  <rect x={x} y={y} width={bw} height={Math.min(bh,7)} rx="5" fill="rgba(255,255,255,0.25)"/>
                  {isHov && (
                    <g>
                      <rect x={x+bw/2-14} y={y-20} width="28" height="16" rx="5" fill={cor}/>
                      <text x={x+bw/2} y={y-9} textAnchor="middle" fontSize="8" fontWeight="700" fill="white">{v}</text>
                    </g>
                  )}
                  {mostrarLabels && <text x={x+bw/2} y={H+5} textAnchor="middle" fontSize="7" fill="rgba(0,0,0,0.3)">{labels[i]||''}</text>}
                </g>
              )
            })}
          </svg>
        </div>
      </div>
    )
  }

  // Pizza
  if (tipo === 'pizza') {
    const size=90, cx=size/2, cy=size/2, r=size/2-6
    const total = valores.reduce((a,b)=>a+b,0)||1
    const cores = [cor,'#f97316','#22d387','#f43f5e','#2dd4bf','#fbbf24']
    let angle = -Math.PI/2
    const slices = valores.slice(0,6).map((v,i) => {
      const sa=angle, sweep=(v/total)*Math.PI*2*progresso
      angle += (v/total)*Math.PI*2
      const ea = sa + sweep
      const x1=cx+r*Math.cos(sa), y1=cy+r*Math.sin(sa)
      const x2=cx+r*Math.cos(ea), y2=cy+r*Math.sin(ea)
      return { d:`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${sweep>Math.PI?1:0} 1 ${x2},${y2} Z`, cor:cores[i%cores.length], pct:Math.round(v/total*100), label:labels[i]||`Item ${i+1}` }
    })
    return (
      <div style={{ padding:'8px 12px 4px' }}>
        {b.graficoTitulo && <div style={{ fontSize:11, fontWeight:700, color:'#1a1a2e', marginBottom:4 }}>{b.graficoTitulo}</div>}
        <div style={{ background:'#fafafa', borderRadius:14, padding:'10px', border:'1px solid rgba(0,0,0,0.06)', display:'flex', alignItems:'center', gap:12 }}>
          <svg width={size+16} height={size+16} viewBox={`-8 -8 ${size+16} ${size+16}`}>
            {slices.map((s,i)=>(
              <path key={i} d={s.d} fill={s.cor} stroke="white" strokeWidth="2.5"
                onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(null)}
                style={{ transform: hover===i?`scale(1.05)`:'scale(1)', transformOrigin:`${cx}px ${cy}px`, transition:'transform 0.15s', cursor:'pointer' }}/>
            ))}
            <circle cx={cx} cy={cy} r={r*0.42} fill="white"/>
            <text x={cx} y={cy+4} textAnchor="middle" fontSize="10" fontWeight="700" fill="#1a1a2e">{Math.round(total*progresso)}</text>
          </svg>
          <div style={{ display:'flex', flexDirection:'column', gap:4, flex:1 }}>
            {slices.map((s,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:5, opacity: hover!==null&&hover!==i?0.4:1, transition:'opacity 0.15s' }}>
                <div style={{ width:7, height:7, borderRadius:2, background:s.cor, flexShrink:0 }}/>
                <span style={{ fontSize:9, color:'#555', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.label}</span>
                <span style={{ fontSize:9, fontWeight:700, color:s.cor }}>{s.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return null
}

function RenderResultado({ b }: { b: BlockItem }) {
  const cor = b.resultCor || '#7c5cfc'
  const score = b.resultScore ?? 72
  const estilo = b.resultEstilo || 'barra'
  const faixas = b.resultFaixas || [{min:0,max:33,label:'Nível 1',cor:'#4f8ef7'},{min:34,max:66,label:'Nível 2',cor:'#4f8ef7'},{min:67,max:100,label:'Nível 3',cor:'#4f8ef7'}]
  const faixa = faixas.find(f => score >= f.min && score <= f.max)
  const corFaixa = faixa?.cor || cor

  const [fase, setFase] = useState<'loading'|'reveal'|'done'>('loading')
  const [contadorAtual, setContadorAtual] = useState(0)
  const [barraWidth, setBarraWidth] = useState(0)
  const [dashOffset, setDashOffset] = useState(188.5)

  useEffect(() => {
    setFase('loading')
    setContadorAtual(0)
    setBarraWidth(0)
    setDashOffset(188.5)
    const t1 = setTimeout(() => setFase('reveal'), 1400)
    return () => clearTimeout(t1)
  }, [score, b.resultCor, b.resultEstilo])

  useEffect(() => {
    if (fase !== 'reveal') return
    const duration = 1200
    const steps = 60
    const interval = duration / steps
    let current = 0
    const timer = setInterval(() => {
      current++
      const eased = Math.round(score * (1 - Math.pow(1 - current / steps, 3)))
      setContadorAtual(eased)
      setBarraWidth(score * (1 - Math.pow(1 - current / steps, 3)))
      setDashOffset(188.5 - (score / 100) * 188.5 * (1 - Math.pow(1 - current / steps, 3)))
      if (current >= steps) { clearInterval(timer); setFase('done') }
    }, interval)
    return () => clearInterval(timer)
  }, [fase, score])

  const isLoading = fase === 'loading'

  return (
    <div style={{ padding: '10px 14px' }}>
      <style>{`
        @keyframes resSpinIn { from { opacity:0; transform:scale(0.7) rotate(-10deg) } to { opacity:1; transform:scale(1) rotate(0deg) } }
        @keyframes resFadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes resShimmer { 0%{background-position:-200px 0} 100%{background-position:200px 0} }
        @keyframes resPulse { 0%,100%{box-shadow:0 0 0 0 ${corFaixa}50} 50%{box-shadow:0 0 0 8px ${corFaixa}00} }
        @keyframes resSpinner { to { transform: rotate(360deg) } }
        @keyframes resBadgePop { 0%{transform:scale(0)} 60%{transform:scale(1.15)} 100%{transform:scale(1)} }
      `}</style>

      {/* Loading phase */}
      {isLoading && (
        <div style={{ padding: '24px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          {/* Spinner animado */}
          <div style={{ position: 'relative', width: 56, height: 56 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `3px solid ${corFaixa}18` }}/>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `3px solid transparent`, borderTopColor: corFaixa, animation: 'resSpinner 0.8s linear infinite' }}/>
            <div style={{ position: 'absolute', inset: 8, borderRadius: '50%', border: `2px solid transparent`, borderTopColor: `${corFaixa}60`, animation: 'resSpinner 1.2s linear infinite reverse' }}/>
          </div>

          {/* Skeleton das barras */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ height: 10, borderRadius: 99, width: '70%', background: `linear-gradient(90deg, ${corFaixa}12 25%, ${corFaixa}25 50%, ${corFaixa}12 75%)`, backgroundSize: '400px 100%', animation: 'resShimmer 1.2s infinite' }}/>
            <div style={{ height: 10, borderRadius: 99, width: '85%', background: `linear-gradient(90deg, ${corFaixa}10 25%, ${corFaixa}20 50%, ${corFaixa}10 75%)`, backgroundSize: '400px 100%', animation: 'resShimmer 1.2s infinite 0.15s' }}/>
            <div style={{ height: 10, borderRadius: 99, width: '55%', background: `linear-gradient(90deg, ${corFaixa}08 25%, ${corFaixa}15 50%, ${corFaixa}08 75%)`, backgroundSize: '400px 100%', animation: 'resShimmer 1.2s infinite 0.3s' }}/>
          </div>

          <div style={{ fontSize: 10, color: '#aaa', fontWeight: 500, letterSpacing: 0.5 }}>Analisando resultado...</div>
        </div>
      )}

      {/* Reveal phase — card animado */}
      {!isLoading && (
        <div style={{ background: `linear-gradient(135deg,${corFaixa}12,${corFaixa}05)`, border: `1.5px solid ${corFaixa}35`, borderRadius: 18, overflow: 'hidden', animation: 'resFadeUp 0.5s ease' }}>

          {/* Topo com badge de perfil */}
          <div style={{ padding: '14px 14px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ animation: 'resFadeUp 0.4s ease 0.1s both' }}>
              <div style={{ fontSize: 8, fontWeight: 700, color: corFaixa, textTransform: 'uppercase' as const, letterSpacing: 1.5, marginBottom: 4 }}>
                Seu Perfil
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#1a1a2e', lineHeight: 1.2 }}>
                {b.resultPerfil || faixa?.label || 'Resultado'}
              </div>
            </div>

            {/* Círculo do score com animação de entrada */}
            <div style={{
              width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
              background: `linear-gradient(135deg, ${corFaixa}, ${corFaixa}cc)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 20px ${corFaixa}60`,
              animation: 'resSpinIn 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.3s both, resPulse 2s ease 1s infinite',
            }}>
              <span style={{ fontSize: 20, fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>
                {contadorAtual}
              </span>
            </div>
          </div>

          {/* Barra de progresso animada */}
          {estilo === 'barra' && (
            <div style={{ padding: '0 14px 12px', animation: 'resFadeUp 0.4s ease 0.2s both' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 9, color: '#999' }}>Score</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: corFaixa }}>{contadorAtual}/100</span>
              </div>
              <div style={{ height: 10, background: 'rgba(0,0,0,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${barraWidth}%`,
                  background: `linear-gradient(90deg, ${corFaixa}cc, ${corFaixa})`,
                  borderRadius: 99, position: 'relative',
                  boxShadow: `0 0 14px ${corFaixa}80`,
                  transition: 'none',
                }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: 'rgba(255,255,255,0.3)', borderRadius: '99px 99px 0 0' }}/>
                  {/* Brilho animado percorrendo a barra */}
                  <div style={{
                    position: 'absolute', top: 0, bottom: 0, width: 20,
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                    right: 0, borderRadius: 99,
                  }}/>
                </div>
              </div>
            </div>
          )}

          {/* Circular animado */}
          {estilo === 'circular' && (
            <div style={{ display: 'flex', justifyContent: 'center', margin: '6px 0 12px', animation: 'resFadeUp 0.4s ease 0.2s both' }}>
              <div style={{ position: 'relative', width: 80, height: 80 }}>
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="8"/>
                  <circle cx="40" cy="40" r="34" fill="none" stroke={corFaixa} strokeWidth="8"
                    strokeDasharray="213.6"
                    strokeDashoffset={213.6 - (score / 100) * 213.6 * ((score - contadorAtual <= 1) ? 1 : contadorAtual / score)}
                    strokeLinecap="round" transform="rotate(-90 40 40)"
                    style={{ transition: 'none' }}
                  />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 18, fontWeight: 900, color: corFaixa, fontFamily: 'monospace', lineHeight: 1 }}>{contadorAtual}</span>
                  <span style={{ fontSize: 8, color: '#aaa' }}>/100</span>
                </div>
              </div>
            </div>
          )}

          {/* Velocímetro */}
          {estilo === 'velocimetro' && (
            <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 10px', animation: 'resFadeUp 0.4s ease 0.2s both' }}>
              <GaugeChart score={contadorAtual} cor={corFaixa} size={110}/>
            </div>
          )}

          {/* Descrição */}
          {b.resultDescricao && (
            <div style={{ padding: '0 14px 10px', fontSize: 10, color: '#666', lineHeight: 1.6, animation: 'resFadeUp 0.4s ease 0.35s both' }}>
              {b.resultDescricao}
            </div>
          )}

          {/* Badges de faixas */}
          <div style={{ padding: '0 14px 14px', display: 'flex', gap: 5, flexWrap: 'wrap' as const, animation: 'resFadeUp 0.4s ease 0.45s both' }}>
            {faixas.map((f, i) => {
              const ativo = score >= f.min && score <= f.max
              return (
                <div key={i} style={{
                  padding: '4px 10px', borderRadius: 99,
                  background: ativo ? f.cor : `${f.cor}12`,
                  border: `1px solid ${f.cor}${ativo ? 'ff' : '35'}`,
                  animation: ativo ? `resBadgePop 0.5s cubic-bezier(0.34,1.56,0.64,1) ${0.5 + i * 0.1}s both` : 'none',
                }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: ativo ? '#fff' : f.cor }}>{f.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function RenderNiveis({ b }: { b: BlockItem }) {
  const score = b.resultScore ?? 72
  const faixas = b.resultFaixas || [{min:0,max:33,label:'Nível 1',cor:'#4f8ef7'},{min:34,max:66,label:'Nível 2',cor:'#4f8ef7'},{min:67,max:100,label:'Nível 3',cor:'#4f8ef7'}]
  const ativoIdx = faixas.findIndex(f => score >= f.min && score <= f.max)

  const [fase, setFase] = useState<'loading'|'reveal'>('loading')
  const [alturas, setAlturas] = useState<number[]>(faixas.map(() => 0))
  const [scores, setScores] = useState<number[]>(faixas.map(() => 0))

  useEffect(() => {
    setFase('loading')
    setAlturas(faixas.map(() => 0))
    setScores(faixas.map(() => 0))
    const t = setTimeout(() => setFase('reveal'), 1200)
    return () => clearTimeout(t)
  }, [score, JSON.stringify(b.resultFaixas)])

  useEffect(() => {
    if (fase !== 'reveal') return
    const duration = 1000
    const steps = 50
    const interval = duration / steps
    let current = 0
    const timer = setInterval(() => {
      current++
      const progress = 1 - Math.pow(1 - current / steps, 3)
      setAlturas(faixas.map((f, i) => {
        const isAtivo = i === ativoIdx
        const isPast = i < ativoIdx
        const targetPct = isPast ? 100 : isAtivo ? ((score - f.min) / Math.max(f.max - f.min, 1)) * 100 : 0
        return Math.max(targetPct * progress, isAtivo ? 20 * progress : 0)
      }))
      setScores(faixas.map((_, i) => i === ativoIdx ? Math.round(score * progress) : 0))
      if (current >= steps) clearInterval(timer)
    }, interval)
    return () => clearInterval(timer)
  }, [fase])

  const isLoading = fase === 'loading'

  return (
    <div style={{ padding: '10px 14px' }}>
      <style>{`
        @keyframes nvSpinner { to { transform: rotate(360deg) } }
        @keyframes nvFadeUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        @keyframes nvShimmer { 0%{background-position:-200px 0} 100%{background-position:200px 0} }
        @keyframes nvBadgePop { 0%{transform:scale(0) translateY(8px);opacity:0} 70%{transform:scale(1.2) translateY(-2px)} 100%{transform:scale(1) translateY(0);opacity:1} }
        @keyframes nvGlow { 0%,100%{box-shadow:0 0 0 0 rgba(79,142,247,0)} 50%{box-shadow:0 0 16px 4px rgba(79,142,247,0.35)} }
      `}</style>

      {/* LOADING */}
      {isLoading && (
        <div style={{ padding: '20px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          {/* Spinner */}
          <div style={{ position: 'relative', width: 48, height: 48 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid #f0f0f8' }}/>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid transparent', borderTopColor: faixas[ativoIdx >= 0 ? ativoIdx : 0]?.cor || '#4f8ef7', animation: 'nvSpinner 0.8s linear infinite' }}/>
            <div style={{ position: 'absolute', inset: 8, borderRadius: '50%', border: '2px solid transparent', borderTopColor: `${faixas[ativoIdx >= 0 ? ativoIdx : 0]?.cor || '#4f8ef7'}50`, animation: 'nvSpinner 1.3s linear infinite reverse' }}/>
          </div>

          {/* Skeleton das barras */}
          <div style={{ display: 'flex', gap: 10, width: '100%', justifyContent: 'center' }}>
            {faixas.map((f, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ width: '100%', height: 80, borderRadius: 12, background: `linear-gradient(90deg, #f0f0f8 25%, #e8e8f0 50%, #f0f0f8 75%)`, backgroundSize: '400px 100%', animation: `nvShimmer 1.2s infinite ${i * 0.15}s` }}/>
                <div style={{ height: 8, width: '70%', borderRadius: 99, background: `linear-gradient(90deg, #f0f0f8 25%, #e8e8f0 50%, #f0f0f8 75%)`, backgroundSize: '400px 100%', animation: `nvShimmer 1.2s infinite ${i * 0.15 + 0.1}s` }}/>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 10, color: '#bbb', fontWeight: 500 }}>Calculando seu nível...</div>
        </div>
      )}

      {/* REVEAL */}
      {!isLoading && (
        <div style={{ animation: 'nvFadeUp 0.4s ease' }}>
          {/* Título do ativo */}
          <div style={{ textAlign: 'center', marginBottom: 14, animation: 'nvFadeUp 0.4s ease 0.1s both' }}>
            {ativoIdx >= 0 && (
              <>
                <div style={{ fontSize: 8, fontWeight: 700, color: faixas[ativoIdx].cor, textTransform: 'uppercase' as const, letterSpacing: 1.5, marginBottom: 3 }}>Seu Nível</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#1a1a2e' }}>{faixas[ativoIdx].label}</div>
              </>
            )}
          </div>

          {/* Barras */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'flex-end', marginBottom: 12 }}>
            {faixas.map((f, i) => {
              const isAtivo = i === ativoIdx
              const isPast = i < ativoIdx
              const cor = f.cor || '#4f8ef7'
              const barHeight = 90
              const fillH = (alturas[i] / 100) * barHeight

              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, animation: `nvFadeUp 0.5s ease ${0.15 + i * 0.1}s both` }}>
                  {/* Label topo */}
                  <div style={{
                    fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 99,
                    color: isAtivo ? '#fff' : isPast ? cor : '#bbb',
                    background: isAtivo ? cor : isPast ? `${cor}20` : '#f0f0f8',
                    border: `1px solid ${isAtivo || isPast ? `${cor}40` : '#eee'}`,
                    transition: 'all 0.3s',
                    animation: isAtivo ? `nvBadgePop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.6s both` : 'none',
                  }}>
                    {f.label}
                  </div>

                  {/* Barra vertical */}
                  <div style={{
                    width: '100%', height: barHeight, borderRadius: 12,
                    background: '#f0f0f8', overflow: 'hidden', position: 'relative',
                    boxShadow: isAtivo ? `0 0 0 2px ${cor}50` : 'none',
                    transition: 'box-shadow 0.3s',
                  }}>
                    {/* Fill animado */}
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      height: `${fillH}px`,
                      background: isAtivo
                        ? `linear-gradient(180deg, ${cor}bb, ${cor})`
                        : isPast
                        ? `linear-gradient(180deg, ${cor}55, ${cor}80)`
                        : 'transparent',
                      borderRadius: 12,
                      boxShadow: isAtivo ? `0 -6px 20px ${cor}60` : 'none',
                      transition: 'none',
                    }}>
                      {/* Brilho interno */}
                      {(isAtivo || isPast) && (
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '35%', background: 'rgba(255,255,255,0.25)', borderRadius: '12px 12px 0 0' }}/>
                      )}
                    </div>

                    {/* Score badge dentro da barra ativa */}
                    {isAtivo && scores[i] > 0 && (
                      <div style={{
                        position: 'absolute', bottom: 8, left: 0, right: 0,
                        display: 'flex', justifyContent: 'center',
                        animation: 'nvBadgePop 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.8s both',
                      }}>
                        <div style={{
                          background: '#fff', borderRadius: 7, padding: '2px 7px',
                          fontSize: 11, fontWeight: 900, color: cor,
                          boxShadow: `0 2px 10px ${cor}50`,
                        }}>
                          {scores[i]}
                        </div>
                      </div>
                    )}

                    {/* Check para barras passadas */}
                    {isPast && (
                      <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, display: 'flex', justifyContent: 'center', animation: 'nvFadeUp 0.3s ease 0.5s both' }}>
                        <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 2px 8px ${cor}40` }}>
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke={cor} strokeWidth="2" strokeLinecap="round">
                            <path d="M2 5l2 2 4-4"/>
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Range embaixo */}
                  <div style={{ fontSize: 8, color: isAtivo ? cor : '#bbb', fontWeight: isAtivo ? 700 : 400 }}>
                    {f.min}–{f.max}
                  </div>

                  {/* Descrição do nível */}
                  {(f as any).desc && (
                    <div style={{
                      fontSize: 9, color: isAtivo ? '#444' : '#bbb',
                      textAlign: 'center', lineHeight: 1.4,
                      fontWeight: isAtivo ? 600 : 400,
                      animation: isAtivo ? `nvFadeUp 0.4s ease ${0.5 + i * 0.1}s both` : 'none',
                      maxWidth: '100%', overflow: 'hidden',
                    }}>
                      {(f as any).desc}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Descrição geral */}
          {b.resultDescricao && (
            <div style={{ fontSize: 10, color: '#666', lineHeight: 1.6, textAlign: 'center', padding: '0 4px', animation: 'nvFadeUp 0.4s ease 0.6s both' }}>
              {b.resultDescricao}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function RenderBotao({ b }: { b: BlockItem }) {
  const r = b.botaoBorderRadius ?? 12
  const py = b.botaoTamanho === 'sm' ? 8 : b.botaoTamanho === 'lg' ? 16 : 12
  const fs = b.botaoTamanho === 'sm' ? '10px' : b.botaoTamanho === 'lg' ? '14px' : '12px'
  const shadow = b.botaoSombra ? `0 4px 20px ${b.botaoCor || '#7c5cfc'}55` : 'none'
  const animacao = (b as any).botaoAnimacao || 'nenhuma'
  const animStyle = animacao === 'pulsar' ? { animation: 'btnPulse 1.5s ease-in-out infinite' } : animacao === 'aparecer' ? { animation: 'btnAppear 0.5s ease forwards' } : animacao === 'balanco' ? { animation: 'btnShake 0.6s ease-in-out infinite' } : {}
  return (
    <div style={{ padding: '8px 16px' }}>
      <style>{`@keyframes btnPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}@keyframes btnAppear{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes btnShake{0%,100%{transform:rotate(0)}20%{transform:rotate(-2deg)}40%{transform:rotate(2deg)}60%{transform:rotate(-1deg)}80%{transform:rotate(1deg)}}`}</style>
      <button style={{ width:'100%', padding:`${py}px`, borderRadius:r, background:b.botaoCor||'linear-gradient(135deg,#7c5cfc,#a78bfa)', border:'none', color:b.botaoTextoCor||'#fff', fontSize:fs, fontWeight:700, cursor:'pointer', boxShadow:shadow, display:'flex', alignItems:'center', justifyContent:'center', gap:6, ...animStyle }}>
        {b.botaoIcone && <span>{b.botaoIcone}</span>}
        {b.botaoTexto || 'Continuar →'}
      </button>
    </div>
  )
}

function RenderImagem({ b }: { b: BlockItem }) {
  const url=b.imagemFile||b.imagemUrl; const h=b.imagemHeight||120; const r=b.imagemBorderRadius??12
  return (
    <div style={{ padding:'6px 16px' }}>
      {url?<div style={{ position:'relative', borderRadius:r, overflow:'hidden', height:h }}><img src={url} alt="img" style={{ width:'100%', height:'100%', objectFit:(b.imagemFit||'cover') as any }}/>{b.imagemOverlayTexto&&<div style={{ position:'absolute', inset:0, background:b.imagemOverlayCor||'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center' }}><span style={{ color:'#fff', fontSize:12, fontWeight:700, textAlign:'center', padding:'0 12px' }}>{b.imagemOverlayTexto}</span></div>}</div>:<div style={{ height:h, borderRadius:r, background:'linear-gradient(135deg,#f5f5fa,#ede9fe)', border:'2px dashed rgba(124,92,252,0.2)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6 }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><span style={{ fontSize:10, color:'#c4b5fd' }}>Adicionar imagem</span></div>}
    </div>
  )
}

function RenderVideo({ b }: { b: BlockItem }) {
  const url=b.videoFile||b.videoUrl
  return (
    <div style={{ padding:'6px 16px' }}>
      {url&&!url.includes('youtube')&&!url.includes('youtu.be')?<video src={url} controls style={{ width:'100%', borderRadius:12, maxHeight:150 }}/>:<div style={{ height:120, borderRadius:12, overflow:'hidden', position:'relative' }}>{b.videoThumb?<img src={b.videoThumb} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>:<div style={{ width:'100%', height:'100%', background:'linear-gradient(135deg,#1a1a2e,#2a2b3e)' }}/>}<div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}><div style={{ width:44, height:44, borderRadius:'50%', background:'rgba(255,255,255,0.15)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center' }}><svg width="18" height="18" viewBox="0 0 18 18" fill="white"><polygon points="6 3 15 9 6 15"/></svg></div></div></div>}
    </div>
  )
}

function RenderAudio({ b }: { b: BlockItem }) {
  const url=b.audioFile||b.audioUrl
  return (
    <div style={{ padding:'6px 16px' }}>
      {url?<audio src={url} controls style={{ width:'100%' }}/>:<div style={{ background:'#f5f5fa', border:'1px solid #e8e8f2', borderRadius:12, padding:'12px 16px', display:'flex', alignItems:'center', gap:10 }}><div style={{ width:36, height:36, borderRadius:'50%', background:'rgba(124,92,252,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#7c5cfc" strokeWidth="1.5"><path d="M8 1v14M5 3.5v9M2 6v4M11 3.5v9M14 6v4"/></svg></div><div><div style={{ fontSize:11, fontWeight:600, color:'#1a1a2e' }}>{b.audioTitulo||'Áudio'}</div><div style={{ fontSize:9, color:'#bbb' }}>Adicionar arquivo de áudio</div></div></div>}
    </div>
  )
}

function RenderCronometro({ b }: { b: BlockItem }) {
  const totalSeconds = (b.cronoHoras ?? 0) * 3600 + (b.cronoMinutos ?? 8) * 60 + (b.cronoSegundos ?? 47)
  const [remaining, setRemaining] = useState(totalSeconds)
  useEffect(() => { setRemaining((b.cronoHoras ?? 0) * 3600 + (b.cronoMinutos ?? 8) * 60 + (b.cronoSegundos ?? 47)) }, [b.cronoHoras, b.cronoMinutos, b.cronoSegundos])
  useEffect(() => { if (remaining <= 0) return; const timer = setInterval(() => setRemaining(r => Math.max(0, r - 1)), 1000); return () => clearInterval(timer) }, [remaining])
  const h = String(Math.floor(remaining / 3600)).padStart(2, '0')
  const m = String(Math.floor((remaining % 3600) / 60)).padStart(2, '0')
  const s = String(remaining % 60).padStart(2, '0')
  const cor = b.cronoCor || '#7c5cfc'
  const bgCor = b.cronoBgCor || '#1a1a2e'
  const estilo = b.cronoEstilo || 'digital'
  if (estilo === 'minimalista') return (
    <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, background: '#f8f8fc', borderRadius: 12, border: '1px solid #eee' }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', letterSpacing: 2 }}>{h}:{m}:{s}</div>
      <div style={{ width: 1, height: 28, background: '#eee' }}/>
      <div style={{ fontSize: 11, color: '#666', lineHeight: 1.4 }}>{b.cronoTexto || 'Oferta por tempo limitado!'}</div>
    </div>
  )
  return (
    <div style={{ padding: '10px 16px', textAlign: 'center' }}>
      <div style={{ fontSize: 9, color: '#999', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>{b.cronoTexto || 'OFERTA EXPIRA EM'}</div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
        {[{v:h,l:'HRS'},{v:m,l:'MIN'},{v:s,l:'SEG'}].map((n, i) => (
          <React.Fragment key={i}>
            <div style={{ background: bgCor, borderRadius: estilo === 'arredondado' ? 14 : 10, padding: '8px 12px', minWidth: 44, boxShadow: `0 4px 16px ${cor}20` }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: cor, lineHeight: 1 }}>{n.v}</div>
              <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)', marginTop: 3, letterSpacing: 1 }}>{n.l}</div>
            </div>
            {i < 2 && <div style={{ fontSize: 20, color: cor, fontWeight: 800, marginBottom: 12 }}>:</div>}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

function RenderDepoimento({ b }: { b: BlockItem }) {
  const layout=b.depLayout||'card'
  return (
    <div style={{ padding:'8px 16px' }}>
      <div style={{ background:b.depCardCor||'#f9f9fc', border:'1px solid #eee', borderRadius:layout==='moderno'?16:12, padding:layout==='compacto'?8:12 }}>
        <div style={{ display:'flex', gap:8, marginBottom:layout==='compacto'?6:8, alignItems:layout==='moderno'?'center':'flex-start' }}>
          {b.depAvatar?<img src={b.depAvatar} style={{ width:layout==='moderno'?40:32, height:layout==='moderno'?40:32, borderRadius:'50%', objectFit:'cover', flexShrink:0 }}/>:<div style={{ width:layout==='moderno'?40:32, height:layout==='moderno'?40:32, borderRadius:'50%', background:'linear-gradient(135deg,#7c5cfc,#a78bfa)', flexShrink:0 }}/>}
          <div><div style={{ fontSize:11, fontWeight:600, color:'#1a1a2e' }}>{b.depNome||'Nome do cliente'}</div><div style={{ color:'#f97316', fontSize:10 }}>{'★'.repeat(b.depEstrelas??5)}{'☆'.repeat(5-(b.depEstrelas??5))}</div></div>
        </div>
        <div style={{ fontSize:10, color:'#555', lineHeight:1.6, fontStyle:'italic' }}>"{b.depTexto||'Depoimento incrível aqui.'}"</div>
      </div>
    </div>
  )
}

function RenderGarantia({ b }: { b: BlockItem }) {
  const cor=b.garCor||'#22d387'
  return <div style={{ padding:'6px 16px' }}><div style={{ display:'flex', alignItems:'center', gap:10, background:`${cor}10`, border:`1px solid ${cor}30`, borderRadius:12, padding:'10px 12px' }}><div style={{ width:36, height:36, borderRadius:10, background:`${cor}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={cor} strokeWidth="1.5" strokeLinecap="round"><path d="M9 1l6 2v6c0 3.5-3 6-6 7C6 15 3 12.5 3 9V3L9 1z"/><path d="M6 9l2.5 2.5 4-4"/></svg></div><div><div style={{ fontSize:11, fontWeight:600, color:'#1a1a2e' }}>Garantia de {b.garDias||7} dias</div><div style={{ fontSize:9, color:'#666' }}>{b.garTexto||'Reembolso 100% garantido'}</div></div></div></div>
}

function RenderPreco({ b }: { b: BlockItem }) {
  const cor = b.precoCor || '#7c5cfc'
  return (
    <div style={{ padding: '8px 14px' }}>
      <div style={{ border: `1.5px solid ${cor}30`, borderRadius: 14, overflow: 'hidden', background: '#fff' }}>
        <div style={{ padding: '12px 14px', textAlign: 'center' }}>
          {b.precoBadge && <div style={{ display: 'inline-block', background: '#f43f5e', color: '#fff', fontSize: 8, fontWeight: 700, padding: '2px 10px', borderRadius: 99, marginBottom: 6 }}>{b.precoBadge}</div>}
          {b.precoDe && <div style={{ fontSize: 10, color: '#bbb', textDecoration: 'line-through' }}>De {b.precoDe}</div>}
          <div style={{ fontSize: 9, color: '#999', marginBottom: 2 }}>Por apenas</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: cor, lineHeight: 1 }}>{b.precoPor || 'R$27'}</div>
          {b.precoParcelas && <div style={{ fontSize: 9, color: '#aaa', marginTop: 4 }}>{b.precoParcelas}</div>}
        </div>
      </div>
    </div>
  )
}

function RenderCheckout({ b }: { b: BlockItem }) {
  return (
    <div style={{ padding:'8px 16px', display:'flex', flexDirection:'column', gap:8 }}>
      <button style={{ width:'100%', padding:13, borderRadius:12, background:b.checkoutCor||'linear-gradient(135deg,#f97316,#fb923c)', border:'none', color:b.checkoutTextoCor||'#fff', fontSize:12, fontWeight:700, cursor:'pointer' }}>{b.checkoutTexto||'Quero acesso agora →'}</button>
      <div style={{ display:'flex', justifyContent:'center', gap:8 }}>
        {b.checkoutPix!==false&&<div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:6, padding:'3px 8px', fontSize:9, color:'#16a34a', fontWeight:600 }}>Pix</div>}
        {b.checkoutCartao!==false&&<div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:6, padding:'3px 8px', fontSize:9, color:'#1d4ed8', fontWeight:600 }}>Cartão</div>}
        <div style={{ background:'#fafafa', border:'1px solid #eee', borderRadius:6, padding:'3px 8px', fontSize:9, color:'#666' }}>Boleto</div>
      </div>
      {b.checkoutSeguranca&&<div style={{ fontSize:9, color:'#aaa', textAlign:'center' }}>{b.checkoutSeguranca}</div>}
    </div>
  )
}

function RenderBeneficios({ b }: { b: BlockItem }) {
  const items=b.benefItems||['Acesso imediato','Suporte 24h','Atualizações grátis']; const cor=b.benefCor||'#22d387'; const icone=b.benefIcone||'check'
  function renderIc() {
    if(icone==='estrela') return <span style={{ color:cor, fontSize:12 }}>★</span>
    if(icone==='seta') return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={cor} strokeWidth="2" strokeLinecap="round"><path d="M2 6h8M7 3l3 3-3 3"/></svg>
    return <div style={{ width:16, height:16, borderRadius:'50%', background:`${cor}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke={cor} strokeWidth="2" strokeLinecap="round"><path d="M1 4l2 2 4-4"/></svg></div>
  }
  return <div style={{ padding:'8px 16px', display:'flex', flexDirection:'column', gap:8 }}>{items.map((item,i)=><div key={i} style={{ display:'flex', alignItems:'center', gap:8 }}>{renderIc()}<span style={{ fontSize:10, color:'#444' }}>{item}</span></div>)}</div>
}

function RenderCarregamento({ b }: { b: BlockItem }) {
  const cor = b.loadCor || '#7c5cfc'
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    setProgress(0)
    const duration = 3000, interval = 30, steps = duration / interval
    let current = 0
    const timer = setInterval(() => { current++; const eased = Math.min(100, Math.round((1-Math.pow(1-current/steps,3))*100)); setProgress(eased); if(current>=steps) clearInterval(timer) }, interval)
    return () => clearInterval(timer)
  }, [])
  return (
    <div style={{ padding: '16px' }}>
      <div style={{ height: 10, background: `${cor}20`, borderRadius: 99, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg,${cor},${cor}cc)`, borderRadius: 99, transition: 'width 0.03s linear', boxShadow: `0 0 10px ${cor}80` }}/>
      </div>
      <div style={{ fontSize: 11, color: '#888', textAlign: 'center' }}>{b.loadTexto || 'Analisando respostas...'}</div>
    </div>
  )
}

function RenderRedirecionar({ b }: { b: BlockItem }) {
  return <div style={{ padding:'6px 16px' }}><div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'#f8f8fc', border:'1px solid #e8e8f2', borderRadius:10, padding:'10px 12px' }}><div style={{ fontSize:10, color:'#555', fontWeight:500 }}>{b.redirTexto||'Ir para próxima página'}</div><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#7c5cfc" strokeWidth="1.5" strokeLinecap="round"><path d="M2 7h10M7 3l5 4-5 4"/></svg></div></div>
}

function RenderMetaPixel({ b }: { b: BlockItem }) {
  return <div style={{ padding:'6px 16px' }}><div style={{ background:'rgba(25,119,243,0.06)', border:'1px solid rgba(25,119,243,0.2)', borderRadius:10, padding:'10px 12px', display:'flex', gap:8, alignItems:'center' }}><div style={{ width:28, height:28, borderRadius:6, background:'#1877f2', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><span style={{ color:'#fff', fontSize:14, fontWeight:700 }}>f</span></div><div><div style={{ fontSize:10, fontWeight:600, color:'#1a1a2e' }}>Meta Pixel</div><div style={{ fontSize:9, color:'#888' }}>{b.pixelId?`ID: ${b.pixelId} • ${b.pixelEvento||'PageView'}`:'Configure o Pixel'}</div></div></div></div>
}

function RenderTransformacao({ b }: { b: BlockItem }) {
  const corAntes = (b as any).transCorAntes || '#6b7280'
  const corDepois = (b as any).transCorDepois || '#4f8ef7'
  return (
    <div style={{ padding: '8px 14px' }}>
      <div style={{ display: 'flex', gap: 8, borderRadius: 14, overflow: 'hidden', border: '1px solid #eee', background: '#fafafa' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '6px 10px', textAlign: 'center', background: '#f0f0f5', borderBottom: '1px solid #eee' }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: '#888', textTransform: 'uppercase' as const, letterSpacing: 1 }}>ANTES</span>
          </div>
          <div style={{ height: 80, background: '#f5f5fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {(b as any).transImagemAntes ? <img src={(b as any).transImagemAntes} style={{ width:'100%', height:'100%', objectFit:'cover' as const, filter:'grayscale(80%)' }}/> : <span style={{ fontSize:8, color:'#ccc' }}>Imagem Antes</span>}
          </div>
          <div style={{ padding: '6px 8px', fontSize:8, color:'#888', textAlign:'center' }}>{(b as any).transTextoAntes || 'Antes da solução'}</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', width:24, background:'#eee' }}>
          <div style={{ width:20, height:20, borderRadius:'50%', background:'#fff', border:'1px solid #ddd', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round"><path d="M2 5h6M5 2l3 3-3 3"/></svg>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '6px 10px', textAlign: 'center', background: `${corDepois}15`, borderBottom: `1px solid ${corDepois}20` }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: corDepois, textTransform: 'uppercase' as const, letterSpacing: 1 }}>DEPOIS</span>
          </div>
          <div style={{ height: 80, background: '#f5f5fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {(b as any).transImagemDepois ? <img src={(b as any).transImagemDepois} style={{ width:'100%', height:'100%', objectFit:'cover' as const }}/> : <span style={{ fontSize:8, color:'#ccc' }}>Imagem Depois</span>}
          </div>
          <div style={{ padding: '6px 8px', fontSize:8, color:'#888', textAlign:'center' }}>{(b as any).transTextoDepois || 'Depois da solução'}</div>
        </div>
      </div>
    </div>
  )
}

function RenderCarrossel({ b }: { b: BlockItem }) {
  const [current, setCurrent] = useState(0)
  const imagens: string[] = (b as any).carrosselImagens || []
  const h = (b as any).carrosselAltura || 160
  const r = (b as any).carrosselBorderRadius ?? 12
  const autoplay = (b as any).carrosselAutoplay ?? false
  const total = imagens.length || 1
  useEffect(() => { if(!autoplay||imagens.length<2) return; const t=setInterval(()=>setCurrent(c=>(c+1)%imagens.length),3000); return ()=>clearInterval(t) }, [autoplay,imagens.length])
  return (
    <div style={{ padding:'6px 14px' }}>
      <div style={{ position:'relative', borderRadius:r, overflow:'hidden', height:h, background:'#f5f5fa', border:'1px solid #eee' }}>
        {imagens.length>0?<img src={imagens[current]} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' as const }}/>:<div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}><span style={{ fontSize:9, color:'#ccc' }}>Adicione imagens</span></div>}
        {imagens.length>1&&<>
          <button onClick={()=>setCurrent(c=>(c-1+total)%total)} style={{ position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', width:28, height:28, borderRadius:'50%', background:'rgba(255,255,255,0.9)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round"><path d="M7 2L4 5l3 3"/></svg></button>
          <button onClick={()=>setCurrent(c=>(c+1)%total)} style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', width:28, height:28, borderRadius:'50%', background:'rgba(255,255,255,0.9)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round"><path d="M3 2l3 3-3 3"/></svg></button>
        </>}
      </div>
      {imagens.length>1&&<div style={{ display:'flex', justifyContent:'center', gap:5, marginTop:8 }}>{imagens.map((_,i)=><div key={i} onClick={()=>setCurrent(i)} style={{ width:i===current?16:6, height:6, borderRadius:99, background:i===current?'#7c5cfc':'#ddd', cursor:'pointer', transition:'all 0.2s' }}/>)}</div>}
    </div>
  )
}

function BlockRenderer({ block }: { block: BlockItem }) {
  switch(block.compId) {
    case 'cabecalho': return <RenderCabecalho b={block}/>
    case 'progresso': return <RenderProgresso b={block}/>
    case 'titulo': return <RenderTitulo b={block}/>
    case 'texto': return <RenderTexto b={block}/>
    case 'lista': return <RenderLista b={block}/>
    case 'nota': return <RenderNota b={block}/>
    case 'quiz': return <RenderQuiz b={block}/>
    case 'grafico': return <RenderGrafico b={block}/>
    case 'resultado': return <RenderResultado b={block}/>
    case 'niveis': return <RenderNiveis b={block}/>
    case 'botao': return <RenderBotao b={block}/>
    case 'carrossel': return <RenderCarrossel b={block}/>
    case 'imagem': return <RenderImagem b={block}/>
    case 'video': return <RenderVideo b={block}/>
    case 'audio': return <RenderAudio b={block}/>
    case 'cronometro': return <RenderCronometro b={block}/>
    case 'depoimento': return <RenderDepoimento b={block}/>
    case 'garantia': return <RenderGarantia b={block}/>
    case 'preco': return <RenderPreco b={block}/>
    case 'checkout': return <RenderCheckout b={block}/>
    case 'beneficios': return <RenderBeneficios b={block}/>
    case 'carregamento': return <RenderCarregamento b={block}/>
    case 'transformacao': return <RenderTransformacao b={block}/>
    case 'redirecionar': return <RenderRedirecionar b={block}/>
    case 'metapixel': return <RenderMetaPixel b={block}/>
    default: return <div style={{ padding:'10px 16px', fontSize:10, color:'#aaa' }}>{block.label}</div>
  }
}

function PropsPanel({ block, onChange }: { block: BlockItem; onChange: (d: Partial<BlockItem>) => void }) {
  const s = { background:'#1a1b2a', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.7)' }
  const ta = (k:string, ph?:string, rows=3) => <textarea rows={rows} value={(block as any)[k]||''} onChange={e=>onChange({[k]:e.target.value})} placeholder={ph} className="w-full rounded-lg px-3 py-2 text-xs text-white resize-none outline-none" style={{...s,lineHeight:1.5}}/>
  const inp = (k:string, ph?:string, type='text') => <input type={type} value={(block as any)[k]||''} onChange={e=>onChange({[k]:e.target.value})} placeholder={ph} className="w-full rounded-lg px-3 py-2 text-xs text-white outline-none" style={s}/>
  const num = (k:string, min:number, max:number, def:number) => <input type="number" min={min} max={max} value={(block as any)[k]??def} onChange={e=>onChange({[k]:Number(e.target.value)})} className="w-full rounded-lg px-3 py-2 text-xs text-white outline-none" style={s}/>
  const tog = (label:string, k:string, def=true) => <Toggle label={label} value={(block as any)[k]??def} onChange={v=>onChange({[k]:v})}/>
  const sel = (k:string, opts:{v:string;l:string}[], def:string) => <select value={(block as any)[k]||def} onChange={e=>onChange({[k]:e.target.value})} className="w-full rounded-lg px-3 py-2 text-xs outline-none" style={s}>{opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}</select>
  const seg = (k:string, opts:{v:string;l:string}[], def:string) => <SegmentedControl value={(block as any)[k]||def} options={opts} onChange={v=>onChange({[k]:v})}/>
  return (
    <div className="flex flex-col gap-4 p-4">
      {block.compId==='cabecalho'&&<><Field label="Logo"><UploadButton label="Carregar logo" accept="image/*" value={block.logoFile} onChange={v=>onChange({logoFile:v})}/></Field><Field label="URL da logo">{inp('logoUrl','https://...')}</Field><Slider label="Tamanho da logo" value={block.logoSize??60} min={20} max={100} unit="%" onChange={v=>onChange({logoSize:v})}/><Field label="Posição">{seg('logoPosition',[{v:'left',l:'Esq'},{v:'center',l:'Centro'},{v:'right',l:'Dir'}],'center')}</Field><Slider label="Altura" value={block.headerHeight??52} min={36} max={80} unit="px" onChange={v=>onChange({headerHeight:v})}/><ColorPicker label="Cor de fundo" value={block.bgColor||'#ffffff'} onChange={v=>onChange({bgColor:v})}/><Field label="">{tog('Mostrar botão voltar','showBack')}</Field></>}
      {block.compId==='progresso'&&<><Slider label="Porcentagem" value={block.progress??10} min={0} max={100} unit="%" onChange={v=>onChange({progress:v})}/><ColorPicker label="Cor da barra" value={block.progressColor||'#7c5cfc'} onChange={v=>onChange({progressColor:v})}/><ColorPicker label="Cor do fundo" value={block.progressBgColor||'#f0f0f5'} onChange={v=>onChange({progressBgColor:v})}/><Slider label="Altura" value={block.progressHeight??8} min={2} max={20} unit="px" onChange={v=>onChange({progressHeight:v})}/><Field label="Estilo">{sel('progressStyle',[{v:'gradiente',l:'✨ Gradiente'},{v:'normal',l:'Normal'},{v:'listrado',l:'Listrado'},{v:'segmentado',l:'Segmentado'}],'gradiente')}</Field><Field label="">{tog('Mostrar %','showPercent')}</Field></>}
      {block.compId==='titulo'&&<><Field label="Headline">{ta('headline','Título...',2)}</Field><Field label="Subheadline">{ta('subheadline','Subtítulo...',2)}</Field><Slider label="Tamanho" value={block.headlineSize??16} min={12} max={32} unit="px" onChange={v=>onChange({headlineSize:v})}/><Field label="Peso">{seg('headlineFontWeight',[{v:'400',l:'Normal'},{v:'600',l:'Semi'},{v:'700',l:'Bold'},{v:'800',l:'Extra'}],'700')}</Field><ColorPicker label="Cor título" value={block.headlineColor||'#1a1a2e'} onChange={v=>onChange({headlineColor:v})}/><Field label="Alinhamento"><AlignPicker value={block.headlineAlign||'left'} onChange={v=>onChange({headlineAlign:v})}/></Field><Field label="">{tog('Sombra no texto','headlineShadow',false)}</Field></>}
      {block.compId==='texto'&&<><Field label="Conteúdo">{ta('texto','Digite...',4)}</Field><Slider label="Tamanho" value={block.textoSize??12} min={10} max={20} unit="px" onChange={v=>onChange({textoSize:v})}/><ColorPicker label="Cor" value={block.textoColor||'#555555'} onChange={v=>onChange({textoColor:v})}/><Field label="Alinhamento"><AlignPicker value={block.textoAlign||'left'} onChange={v=>onChange({textoAlign:v})}/></Field></>}
      {block.compId==='lista'&&<><Field label="Itens (um por linha)"><textarea rows={5} value={(block.itens||['Item 1','Item 2','Item 3']).join('\n')} onChange={e=>onChange({itens:e.target.value.split('\n')})} className="w-full rounded-lg px-3 py-2 text-xs text-white resize-none outline-none" style={{...s,lineHeight:1.6}}/></Field><Field label="Ícone">{sel('listaIcone',[{v:'check',l:'✓ Check'},{v:'circulo',l:'● Círculo'},{v:'seta',l:'→ Seta'},{v:'estrela',l:'★ Estrela'}],'check')}</Field><ColorPicker label="Cor do ícone" value={block.checkColor||'#7c5cfc'} onChange={v=>onChange({checkColor:v})}/></>}
      {block.compId==='nota'&&<><Field label="Texto">{ta('notaTexto','Mensagem...',3)}</Field><Field label="Tipo">{sel('notaTipo',[{v:'info',l:'Info'},{v:'aviso',l:'Aviso'},{v:'sucesso',l:'Sucesso'},{v:'atencao',l:'Atenção'}],'info')}</Field></>}
      {block.compId==='quiz'&&<>
        <Field label="Pergunta">{ta('quizPergunta','Qual é sua pergunta?',2)}</Field>
        <Slider label="Tamanho" value={block.quizPerguntaSize??12} min={10} max={20} unit="px" onChange={v=>onChange({quizPerguntaSize:v})}/>
        <Field label="Colunas"><div className="flex gap-2">{[{v:'1',l:'1 Col'},{v:'2',l:'2 Col'}].map(o=><button key={o.v} onClick={()=>onChange({quizColunas:o.v as any})} className="flex-1 py-2 rounded-lg text-xs transition-all" style={{ background:(block.quizColunas||'1')===o.v?'#7c5cfc':'#1a1b2a', color:(block.quizColunas||'1')===o.v?'#fff':'rgba(255,255,255,0.4)', border:'1px solid rgba(255,255,255,0.06)' }}>{o.l}</button>)}</div></Field>
        <Field label="Modelo">{seg('quizModelo',[{v:'texto',l:'Texto'},{v:'texto-emoji',l:'Emoji'}],'texto')}</Field>
        <ColorPicker label="Cor selecionada" value={block.quizCorSelecionada||'#7c5cfc'} onChange={v=>onChange({quizCorSelecionada:v})}/>
        <Toggle label="Múltipla Escolha" value={block.quizMultipla??false} onChange={v=>onChange({quizMultipla:v})}/>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-medium uppercase tracking-wider" style={{ color:'rgba(255,255,255,0.35)' }}>Opções</label>
            <button onClick={()=>{const d=(block.quizOpcoesDados||[{titulo:'Opção A'},{titulo:'Opção B'},{titulo:'Opção C'},{titulo:'Opção D'}]);onChange({quizOpcoesDados:[...d,{titulo:`Opção ${d.length+1}`}]})}} style={{ fontSize:10, color:'#a78bfa', background:'rgba(124,92,252,0.1)', border:'1px solid rgba(124,92,252,0.25)', borderRadius:6, padding:'2px 8px', cursor:'pointer' }}>+ Add</button>
          </div>
          {(block.quizOpcoesDados||(block.quizOpcoes||['Opção A','Opção B','Opção C','Opção D']).map((t:string)=>({titulo:t}))).map((op:any,i:number)=>{
            const updateOp=(data:any)=>{const d=[...(block.quizOpcoesDados||(block.quizOpcoes||['Opção A','Opção B','Opção C','Opção D']).map((t:string)=>({titulo:t})))];d[i]={...d[i],...data};onChange({quizOpcoesDados:d as any})}
            const removeOp=()=>{const d=[...(block.quizOpcoesDados||(block.quizOpcoes||[]).map((t:string)=>({titulo:t})))];d.splice(i,1);onChange({quizOpcoesDados:d as any})}
            return (
              <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl" style={{ background:'#1a1b2a', border:'1px solid rgba(255,255,255,0.07)' }}>
                <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0" style={{ background:'rgba(124,92,252,0.2)', fontSize:8, color:'#a78bfa', fontWeight:700 }}>{i+1}</div>
                <input value={op.titulo} onChange={e=>updateOp({titulo:e.target.value})} placeholder="Título" className="flex-1 bg-transparent text-xs text-white outline-none" style={{ minWidth:0 }}/>
                {block.quizModelo==='texto-emoji'&&<input value={op.emoji||''} onChange={e=>updateOp({emoji:e.target.value})} placeholder="😊" className="w-8 bg-transparent text-xs outline-none text-center"/>}
                <button onClick={removeOp} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(244,63,94,0.6)', fontSize:14 }}>×</button>
              </div>
            )
          })}
        </div>
        <Field label="Variável">{inp('quizVariavel','nome-da-variavel')}</Field>
      </>}
      {(block.compId==='resultado'||block.compId==='niveis')&&<>
        <Field label="Perfil">{inp('resultPerfil','Empreendedor Iniciante')}</Field>
        <Field label="Descrição">{ta('resultDescricao','Descrição...',2)}</Field>
        <Slider label="Score" value={block.resultScore??72} min={0} max={100} unit="/100" onChange={v=>onChange({resultScore:v})}/>
        {block.compId==='resultado'&&<Field label="Estilo">{seg('resultEstilo',[{v:'barra',l:'Barra'},{v:'circular',l:'Circular'},{v:'velocimetro',l:'Velocím.'}],'barra')}</Field>}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase tracking-wider" style={{ color:'rgba(255,255,255,0.35)' }}>
            {block.compId==='niveis' ? 'Níveis (nome + descrição)' : 'Faixas'}
          </label>
          {(block.resultFaixas||[{min:0,max:33,label:'Nível 1',cor:'#4f8ef7'},{min:34,max:66,label:'Nível 2',cor:'#4f8ef7'},{min:67,max:100,label:'Nível 3',cor:'#4f8ef7'}]).map((f,i)=>{
            const FAIXAS_DEF = [{min:0,max:33,label:'Nível 1',cor:'#4f8ef7'},{min:34,max:66,label:'Nível 2',cor:'#4f8ef7'},{min:67,max:100,label:'Nível 3',cor:'#4f8ef7'}]
            const updateFaixa = (data: any) => { const fs=[...(block.resultFaixas||FAIXAS_DEF)]; fs[i]={...fs[i],...data}; onChange({resultFaixas:fs as any}) }
            return (
              <div key={i} className="flex flex-col gap-2 p-2.5 rounded-xl" style={{ background:'#1a1b2a', border:'1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2">
                  {/* Cor */}
                  <div className="relative w-5 h-5 rounded-md overflow-hidden flex-shrink-0" style={{ border:'1px solid rgba(255,255,255,0.2)' }}>
                    <div style={{ width:'100%', height:'100%', background:f.cor }}/>
                    <input type="color" value={f.cor||'#4f8ef7'} onChange={e=>updateFaixa({cor:e.target.value})} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"/>
                  </div>
                  {/* Nome */}
                  <input value={f.label} onChange={e=>updateFaixa({label:e.target.value})} className="flex-1 bg-transparent text-xs text-white outline-none font-medium" style={{ minWidth:0 }} placeholder="Nome do nível"/>
                  {/* Range */}
                  <span className="text-[10px] flex-shrink-0" style={{ color:'rgba(255,255,255,0.3)' }}>{f.min}–{f.max}</span>
                </div>
                {/* Descrição — só aparece para Níveis */}
                {block.compId==='niveis' && (
                  <input
                    value={(f as any).desc||''} 
                    onChange={e=>updateFaixa({desc:e.target.value})}
                    placeholder="Descrição abaixo da vela (ex: Iniciante, 7 dias...)"
                    className="w-full bg-transparent text-[10px] outline-none"
                    style={{ color:'rgba(255,255,255,0.4)', borderTop:'1px solid rgba(255,255,255,0.05)', paddingTop:5 }}
                  />
                )}
              </div>
            )
          })}
        </div>
      </>}
      {block.compId==='grafico'&&<>
        <Field label="Tipo">{seg('graficoTipo',[{v:'linha',l:'Linha'},{v:'area',l:'Área'},{v:'barra',l:'Barra'},{v:'pizza',l:'Pizza'}],'linha')}</Field>
        <Field label="Título">{inp('graficoTitulo','Ex: Crescimento mensal')}</Field>
        <Field label="Subtítulo">{inp('graficoSubtitulo','Ex: Últimos 7 meses')}</Field>
        <ColorPicker label="Cor principal" value={block.graficoCor||'#7c5cfc'} onChange={v=>onChange({graficoCor:v})}/>
        <Slider label="Altura" value={block.graficoAlturaCustom??110} min={60} max={220} unit="px" onChange={v=>onChange({graficoAlturaCustom:v})}/>
        <Field label="Valores (vírgula)">
          <input value={(block.graficoValores||[30,55,40,70,60,85,75]).join(',')} onChange={e=>onChange({graficoValores:e.target.value.split(',').map((n:string)=>Number(n.trim())||0)})} placeholder="30,55,40,70,60,85,75" className="w-full rounded-lg px-3 py-2 text-xs text-white outline-none" style={s}/>
        </Field>
        <Field label="Labels (vírgula)">
          <input value={(block.graficoLabels||['Jan','Fev','Mar','Abr','Mai','Jun','Jul']).join(',')} onChange={e=>onChange({graficoLabels:e.target.value.split(',').map((l:string)=>l.trim())})} placeholder="Jan,Fev,Mar..." className="w-full rounded-lg px-3 py-2 text-xs text-white outline-none" style={s}/>
        </Field>
        <div className="flex flex-col gap-2">
          <Toggle label="Mostrar grid" value={block.graficoMostrarGrid!==false} onChange={v=>onChange({graficoMostrarGrid:v})}/>
          <Toggle label="Mostrar pontos" value={block.graficoMostrarPontos!==false} onChange={v=>onChange({graficoMostrarPontos:v})}/>
          <Toggle label="Mostrar labels" value={(block as any).graficoMostrarLabels!==false} onChange={v=>onChange({graficoMostrarLabels:v} as any)}/>
        </div>
      </>}
      {block.compId==='botao'&&<>
        <Field label="Texto">{inp('botaoTexto','Continuar →')}</Field>
        <Field label="Ícone (emoji)">{inp('botaoIcone','🚀')}</Field>
        <ColorPicker label="Cor de fundo" value={block.botaoCor||'#7c5cfc'} onChange={v=>onChange({botaoCor:v})}/>
        <ColorPicker label="Cor do texto" value={block.botaoTextoCor||'#ffffff'} onChange={v=>onChange({botaoTextoCor:v})}/>
        <Slider label="Arredondamento" value={block.botaoBorderRadius??12} min={0} max={30} unit="px" onChange={v=>onChange({botaoBorderRadius:v})}/>
        <Field label="Tamanho">{seg('botaoTamanho',[{v:'sm',l:'P'},{v:'md',l:'M'},{v:'lg',l:'G'}],'md')}</Field>
        <Field label="Animação">{sel('botaoAnimacao',[{v:'nenhuma',l:'Nenhuma'},{v:'pulsar',l:'Pulsar'},{v:'aparecer',l:'Aparecer'},{v:'balanco',l:'Balanço'}],'nenhuma')}</Field>
        <Field label="">{tog('Sombra','botaoSombra',false)}</Field>
      </>}
      {block.compId==='carrossel'&&<>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-medium uppercase tracking-wider" style={{ color:'rgba(255,255,255,0.35)' }}>Imagens</label>
            <label className="text-[10px] cursor-pointer" style={{ color:'#a78bfa', background:'rgba(124,92,252,0.1)', border:'1px solid rgba(124,92,252,0.25)', borderRadius:6, padding:'2px 8px' }}>
              + Adicionar
              <input type="file" accept="image/*" multiple className="hidden" onChange={e=>{
                const files=Array.from(e.target.files||[])
                const current=(block as any).carrosselImagens||[]
                files.forEach(f=>{const reader=new FileReader();reader.onload=ev=>{onChange({carrosselImagens:[...current,ev.target?.result as string]} as any)};reader.readAsDataURL(f)})
              }}/>
            </label>
          </div>
          {((block as any).carrosselImagens||[]).map((img:string,i:number)=>(
            <div key={i} style={{ position:'relative', borderRadius:8, overflow:'hidden', height:48 }}>
              <img src={img} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
              <button onClick={()=>{const imgs=[...(block as any).carrosselImagens];imgs.splice(i,1);onChange({carrosselImagens:imgs} as any)}} style={{ position:'absolute', top:3, right:3, background:'rgba(244,63,94,0.8)', border:'none', borderRadius:4, color:'#fff', fontSize:11, cursor:'pointer', width:18, height:18, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
            </div>
          ))}
        </div>
        <Slider label="Altura" value={(block as any).carrosselAltura??160} min={80} max={320} unit="px" onChange={v=>onChange({carrosselAltura:v} as any)}/>
        <Toggle label="Autoplay" value={(block as any).carrosselAutoplay??false} onChange={v=>onChange({carrosselAutoplay:v} as any)}/>
      </>}
      {block.compId==='imagem'&&<><Field label="Upload"><UploadButton label="Carregar imagem" accept="image/*" value={block.imagemFile} onChange={v=>onChange({imagemFile:v})}/></Field><Field label="URL">{inp('imagemUrl','https://...')}</Field><Slider label="Altura" value={block.imagemHeight??120} min={60} max={300} unit="px" onChange={v=>onChange({imagemHeight:v})}/><Slider label="Arredondamento" value={block.imagemBorderRadius??12} min={0} max={24} unit="px" onChange={v=>onChange({imagemBorderRadius:v})}/><Field label="Texto sobreposto">{inp('imagemOverlayTexto','...')}</Field></>}
      {block.compId==='video'&&<><Field label="Upload"><UploadButton label="Carregar vídeo" accept="video/*" value={block.videoFile} onChange={v=>onChange({videoFile:v})}/></Field><Field label="URL YouTube">{inp('videoUrl','https://youtube.com/...')}</Field><Field label="Thumbnail"><UploadButton label="Thumbnail" accept="image/*" value={block.videoThumb} onChange={v=>onChange({videoThumb:v})}/></Field></>}
      {block.compId==='audio'&&<><Field label="Upload"><UploadButton label="Carregar áudio" accept="audio/*" value={block.audioFile} onChange={v=>onChange({audioFile:v})}/></Field><Field label="Título">{inp('audioTitulo','Nome do áudio')}</Field></>}
      {block.compId==='cronometro'&&<>
        <Field label="Texto">{inp('cronoTexto','Oferta expira em')}</Field>
        <Field label="Estilo">{seg('cronoEstilo',[{v:'blocos',l:'Blocos'},{v:'minimalista',l:'Minimal'}],'blocos')}</Field>
        <div className="grid grid-cols-3 gap-2">
          <Field label="Horas">{num('cronoHoras',0,23,0)}</Field>
          <Field label="Min">{num('cronoMinutos',0,59,8)}</Field>
          <Field label="Seg">{num('cronoSegundos',0,59,47)}</Field>
        </div>
        <ColorPicker label="Cor" value={block.cronoCor||'#7c5cfc'} onChange={v=>onChange({cronoCor:v})}/>
      </>}
      {block.compId==='depoimento'&&<><Field label="Nome">{inp('depNome','Nome')}</Field><Field label="Depoimento">{ta('depTexto','...',3)}</Field><Field label="Estrelas"><div className="flex gap-2">{[1,2,3,4,5].map(n=><button key={n} onClick={()=>onChange({depEstrelas:n})} style={{ fontSize:20, color:n<=(block.depEstrelas??5)?'#f97316':'#ddd', background:'none', border:'none', cursor:'pointer' }}>★</button>)}</div></Field><Field label="Foto"><UploadButton label="Foto" accept="image/*" value={block.depAvatar} onChange={v=>onChange({depAvatar:v})}/></Field><ColorPicker label="Cor do card" value={block.depCardCor||'#f9f9fc'} onChange={v=>onChange({depCardCor:v})}/></>}
      {block.compId==='garantia'&&<><Field label="Dias">{num('garDias',1,365,7)}</Field><Field label="Texto">{inp('garTexto','Reembolso 100%')}</Field><ColorPicker label="Cor" value={block.garCor||'#22d387'} onChange={v=>onChange({garCor:v})}/></>}
      {block.compId==='preco'&&<><Field label="Preço POR">{inp('precoPor','R$27')}</Field><Field label="Preço DE">{inp('precoDe','R$197')}</Field><Field label="Parcelamento">{inp('precoParcelas','12x de R$2,70')}</Field><Field label="Badge">{inp('precoBadge','-80%')}</Field><ColorPicker label="Cor" value={block.precoCor||'#7c5cfc'} onChange={v=>onChange({precoCor:v})}/></>}
      {block.compId==='checkout'&&<><Field label="Texto do botão">{inp('checkoutTexto','Quero acesso agora →')}</Field><ColorPicker label="Cor" value={block.checkoutCor||'#f97316'} onChange={v=>onChange({checkoutCor:v})}/><Field label=""><div className="flex flex-col gap-2">{tog('Pix','checkoutPix')}{tog('Cartão','checkoutCartao')}</div></Field><Field label="Segurança">{inp('checkoutSeguranca','🔒 Compra segura')}</Field></>}
      {block.compId==='beneficios'&&<><Field label="Itens"><textarea rows={5} value={(block.benefItems||['Benefício 1']).join('\n')} onChange={e=>onChange({benefItems:e.target.value.split('\n').filter(Boolean)})} className="w-full rounded-lg px-3 py-2 text-xs text-white resize-none outline-none" style={{...s,lineHeight:1.6}}/></Field><ColorPicker label="Cor" value={block.benefCor||'#22d387'} onChange={v=>onChange({benefCor:v})}/></>}
      {block.compId==='carregamento'&&<><Field label="Texto">{inp('loadTexto','Analisando...')}</Field><ColorPicker label="Cor" value={block.loadCor||'#7c5cfc'} onChange={v=>onChange({loadCor:v})}/></>}
      {block.compId==='transformacao'&&<>
        <Field label="Imagem Antes"><UploadButton label="Antes" accept="image/*" value={(block as any).transImagemAntes} onChange={v=>onChange({transImagemAntes:v} as any)}/></Field>
        <Field label="Texto Antes">{ta('transTextoAntes','Antes...',2)}</Field>
        <ColorPicker label="Cor Antes" value={(block as any).transCorAntes||'#6b7280'} onChange={v=>onChange({transCorAntes:v} as any)}/>
        <Field label="Imagem Depois"><UploadButton label="Depois" accept="image/*" value={(block as any).transImagemDepois} onChange={v=>onChange({transImagemDepois:v} as any)}/></Field>
        <Field label="Texto Depois">{ta('transTextoDepois','Depois...',2)}</Field>
        <ColorPicker label="Cor Depois" value={(block as any).transCorDepois||'#4f8ef7'} onChange={v=>onChange({transCorDepois:v} as any)}/>
      </>}
      {block.compId==='redirecionar'&&<><Field label="Segundos">{num('redirSegundos',1,300,10)}</Field><Field label="URL">{inp('redirUrl','https://...')}</Field></>}
      {block.compId==='metapixel'&&<><Field label="Pixel ID">{inp('pixelId','1234567890')}</Field><Field label="Evento">{sel('pixelEvento',[{v:'PageView',l:'PageView'},{v:'Lead',l:'Lead'},{v:'Purchase',l:'Purchase'}],'PageView')}</Field></>}
    </div>
  )
}

interface Props {
  onClose: () => void
  onSave?: (nodeId: string, blocks: any[]) => void
  projectId?: string
  nodeId?: string
}

export default function EditorModal({ onClose, onSave, projectId, nodeId }: Props) {
  const [blocks, setBlocks] = useState<BlockItem[]>([])
  const [selId, setSelId] = useState<string|null>(null)
  const [dragComp, setDragComp] = useState<{compId:string;label:string}|null>(null)
  const [dragBlock, setDragBlock] = useState<string|null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number|null>(null)

  // ── Estados dos botões animados ────────────────────────────────────────
  const [saving, setSaving] = useState(false)
  const [saveDone, setSaveDone] = useState(false)
  const [closing, setClosing] = useState(false)

  let idN = blocks.length
  const stageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!projectId || !nodeId) return
    async function loadBlocks() {
      const { supabase } = await import('@/lib/supabase')
      const { data } = await supabase
        .from('pages')
        .select('blocks, name')
        .eq('project_id', projectId)
        .eq('node_id', nodeId)
        .single()
      if (data?.blocks?.length) setBlocks(data.blocks)
    }
    loadBlocks()
  }, [projectId, nodeId])

  function addBlock(compId:string, label:string, atIdx?:number) {
    const id=`b${++idN}_${Date.now()}`; const nb:BlockItem={id,compId,label}
    if(atIdx!==undefined){setBlocks(prev=>{const a=[...prev];a.splice(atIdx,0,nb);return a})}
    else{setBlocks(prev=>[...prev,nb])}
    setSelId(id)
  }
  function updateBlock(id:string, data:Partial<BlockItem>){setBlocks(prev=>prev.map(b=>b.id===id?{...b,...data}:b))}
  function delBlock(id:string, e:React.MouseEvent){e.stopPropagation();setBlocks(prev=>prev.filter(b=>b.id!==id));if(selId===id)setSelId(null)}
  function moveUp(id:string, e:React.MouseEvent){e.stopPropagation();setBlocks(prev=>{const i=prev.findIndex(b=>b.id===id);if(i<=0)return prev;const a=[...prev];[a[i-1],a[i]]=[a[i],a[i-1]];return a})}
  function moveDown(id:string, e:React.MouseEvent){e.stopPropagation();setBlocks(prev=>{const i=prev.findIndex(b=>b.id===id);if(i>=prev.length-1)return prev;const a=[...prev];[a[i],a[i+1]]=[a[i+1],a[i]];return a})}
  function handleDropOnPhone(e:React.DragEvent){e.preventDefault();if(!dragComp)return;addBlock(dragComp.compId,dragComp.label,dragOverIdx??undefined);setDragComp(null);setDragOverIdx(null)}
  function handleBlockDrop(e:React.DragEvent,idx:number){e.preventDefault();e.stopPropagation();if(dragComp){addBlock(dragComp.compId,dragComp.label,idx);setDragComp(null)}else if(dragBlock){const fi=blocks.findIndex(b=>b.id===dragBlock);if(fi>=0&&fi!==idx){setBlocks(prev=>{const a=[...prev];const[m]=a.splice(fi,1);a.splice(idx,0,m);return a})};setDragBlock(null)};setDragOverIdx(null)}

  const selBlock = blocks.find(b=>b.id===selId)

  // ── Função de salvar ───────────────────────────────────────────────────
  async function handleSave() {
    if (saving) return
    setSaving(true)
    try {
      if (projectId && nodeId) {
        const { supabase } = await import('@/lib/supabase')
        await supabase.from('pages').upsert(
          { project_id: projectId, node_id: nodeId, name: 'Nova Página', blocks },
          { onConflict: 'project_id,node_id' }
        )
        onSave?.(nodeId, blocks)
      }
      setSaveDone(true)
      setTimeout(() => {
        setSaveDone(false)
        setSaving(false)
        onClose()
      }, 1000)
    } catch {
      setSaving(false)
    }
  }

  // ── Função de fechar com animação ──────────────────────────────────────
  function handleClose() {
    setClosing(true)
    setTimeout(() => { setClosing(false); onClose() }, 350)
  }

  return (
    <div className="flex w-full h-full" style={{ background:'#0f1018' }}>

      {/* ── SIDEBAR DE COMPONENTES ──────────────────────────────────────── */}
      <div className="w-52 flex-shrink-0 flex flex-col overflow-hidden" style={{ background:'#13141f', borderRight:'1px solid rgba(255,255,255,0.07)' }}>
        <div className="px-4 py-3 border-b" style={{ borderColor:'rgba(255,255,255,0.07)' }}>
          <span className="text-sm font-medium text-white">Componentes</span>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {Object.entries(COMPONENTS).map(([cat,comps])=>(
            <div key={cat} className="mb-4">
              <div className="text-[9px] uppercase tracking-widest mb-2 px-1" style={{ color:'rgba(255,255,255,0.28)' }}>{cat}</div>
              <div className="flex flex-col gap-1">
                {comps.map(comp=>(
                  <div key={comp.id} draggable onDragStart={()=>setDragComp({compId:comp.id,label:comp.label})} onDragEnd={()=>setDragComp(null)} onClick={()=>addBlock(comp.id,comp.label)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-grab transition-all" style={{ background:'#1a1b2a', border:'1px solid rgba(255,255,255,0.06)' }} onMouseEnter={e=>(e.currentTarget.style.borderColor='rgba(124,92,252,0.4)')} onMouseLeave={e=>(e.currentTarget.style.borderColor='rgba(255,255,255,0.06)')}>
                    <div style={{ color:'rgba(255,255,255,0.45)', width:16, height:16, flexShrink:0 }}>{comp.icon}</div>
                    <span className="text-xs" style={{ color:'rgba(255,255,255,0.55)' }}>{comp.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── BOTÕES SALVAR E FECHAR COM ANIMAÇÃO ─────────────────────── */}
        <div className="p-3 flex gap-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <style>{`
            @keyframes editorSpin     { to { transform: rotate(360deg) } }
            @keyframes editorPop      { 0%{transform:scale(1)} 35%{transform:scale(1.08)} 65%{transform:scale(0.96)} 100%{transform:scale(1)} }
            @keyframes editorShake    { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-3px)} 60%{transform:translateX(3px)} 80%{transform:translateX(-2px)} }
            @keyframes editorCheck    { from{opacity:0;transform:scale(0.4) rotate(-10deg)} to{opacity:1;transform:scale(1) rotate(0deg)} }
          `}</style>

          {/* Botão Salvar */}
          <button
            disabled={saving}
            onClick={handleSave}
            className="flex-1 py-2 rounded-xl text-xs font-semibold"
            style={{
              background: saveDone ? '#22d387' : saving ? 'rgba(124,92,252,0.45)' : '#7c5cfc',
              color: '#fff',
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              transition: 'background 0.25s, box-shadow 0.2s',
              boxShadow: saveDone
                ? '0 0 0 3px rgba(34,211,135,0.3), 0 4px 12px rgba(34,211,135,0.2)'
                : saving ? 'none'
                : '0 4px 14px rgba(124,92,252,0.45)',
              animation: saveDone ? 'editorPop 0.4s ease' : 'none',
            }}
          >
            {saving && !saveDone && (
              <svg style={{ animation: 'editorSpin 0.7s linear infinite', flexShrink: 0 }} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            )}
            {saveDone && (
              <svg style={{ animation: 'editorCheck 0.3s ease', flexShrink: 0 }} width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M1.5 6l3 3 6-6"/>
              </svg>
            )}
            {!saving && !saveDone && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                <path d="M17 21v-8H7v8M7 3v5h8"/>
              </svg>
            )}
            {saveDone ? 'Salvo! ✓' : saving ? 'Salvando...' : 'Salvar'}
          </button>

          {/* Botão Fechar */}
          <button
            onClick={handleClose}
            className="flex-1 py-2 rounded-xl text-xs"
            style={{
              border: `1px solid ${closing ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.1)'}`,
              color: closing ? '#f87171' : 'rgba(255,255,255,0.5)',
              background: closing ? 'rgba(248,113,113,0.08)' : 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              transition: 'all 0.2s',
              animation: closing ? 'editorShake 0.35s ease' : 'none',
            }}
          >
            <svg
              width="10" height="10" viewBox="0 0 12 12"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              style={{ transition: 'transform 0.25s', transform: closing ? 'rotate(90deg)' : 'rotate(0deg)', flexShrink: 0 }}
            >
              <path d="M2 2l8 8M10 2l-8 8"/>
            </svg>
            Fechar
          </button>
        </div>
      </div>

      {/* ── CANVAS DO CELULAR ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-start pt-6 overflow-y-auto" style={{ background:'#0f1018' }}>
        <div className="text-xs mb-5" style={{ color:'rgba(255,255,255,0.25)' }}>Arraste ou clique para adicionar</div>
        <div className="flex-shrink-0 relative" style={{ width:300, height:620, background:'linear-gradient(145deg,#2a2b3e,#1a1b2a)', borderRadius:44, padding:3, boxShadow:'0 0 0 1px rgba(255,255,255,0.08),0 24px 60px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.1)' }}>
          <div style={{ position:'absolute', left:-3, top:100, width:3, height:32, background:'#2a2b3e', borderRadius:'2px 0 0 2px' }}/>
          <div style={{ position:'absolute', left:-3, top:144, width:3, height:32, background:'#2a2b3e', borderRadius:'2px 0 0 2px' }}/>
          <div style={{ position:'absolute', right:-3, top:120, width:3, height:52, background:'#2a2b3e', borderRadius:'0 2px 2px 0' }}/>
          <div style={{ width:'100%', height:'100%', background:'#fff', borderRadius:42, overflow:'hidden', display:'flex', flexDirection:'column' }} onDragOver={e=>e.preventDefault()} onDrop={handleDropOnPhone}>
            <div style={{ height:44, background:'#fff', flexShrink:0, display:'flex', alignItems:'flex-end', paddingBottom:6, paddingLeft:20, paddingRight:16, justifyContent:'space-between' }}>
              <span style={{ fontSize:11, fontWeight:700, color:'#111', letterSpacing:'-0.3px' }}>9:41</span>
              <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                <svg width="16" height="10" viewBox="0 0 16 10" fill="#111"><rect x="0" y="6" width="3" height="4" rx="0.5"/><rect x="4.5" y="4" width="3" height="6" rx="0.5"/><rect x="9" y="2" width="3" height="8" rx="0.5"/><rect x="13.5" y="0" width="3" height="10" rx="0.5"/></svg>
                <div style={{ display:'flex', alignItems:'center', gap:1 }}><div style={{ width:22, height:11, border:'1.5px solid #111', borderRadius:3, padding:1.5, display:'flex', alignItems:'center' }}><div style={{ width:'80%', height:'100%', background:'#111', borderRadius:1.5 }}/></div><div style={{ width:2, height:5, background:'#111', borderRadius:1 }}/></div>
              </div>
            </div>
            <div style={{ display:'flex', justifyContent:'center', marginTop:-4, marginBottom:6, flexShrink:0 }}>
              <div style={{ width:90, height:26, background:'#111', borderRadius:20 }}/>
            </div>
            <div ref={stageRef} style={{ flex:1, overflowY:'auto' }}>
              {blocks.length===0?(
                <div style={{ height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8, margin:12, border:'2px dashed rgba(124,92,252,0.2)', borderRadius:16 }}>
                  <div style={{ width:36, height:36, background:'#f5f3ff', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}><span style={{ color:'#7c5cfc', fontSize:20 }}>+</span></div>
                  <span style={{ fontSize:11, color:'#bbb', textAlign:'center', padding:'0 20px' }}>Arraste ou clique em um componente</span>
                </div>
              ):(
                <div>
                  {blocks.map((block,idx)=>(
                    <div key={block.id}>
                      <div onDragOver={e=>{e.preventDefault();setDragOverIdx(idx)}} onDrop={e=>handleBlockDrop(e,idx)} style={{ height:dragOverIdx===idx?4:2, background:dragOverIdx===idx?'#7c5cfc':'transparent', margin:'0 4px', borderRadius:2, transition:'all .15s' }}/>
                      <div draggable onDragStart={e=>{e.stopPropagation();setDragBlock(block.id)}} onDragEnd={()=>{setDragBlock(null);setDragOverIdx(null)}} onDragOver={e=>{e.preventDefault();setDragOverIdx(idx)}} onDrop={e=>handleBlockDrop(e,idx)} onClick={()=>setSelId(block.id)} style={{ borderBottom:'1px solid rgba(0,0,0,0.04)', cursor:'pointer', position:'relative', outline:selId===block.id?'2px solid #7c5cfc':'none', outlineOffset:-1, background:selId===block.id?'rgba(124,92,252,0.03)':'transparent', transition:'all .1s' }}>
                        <BlockRenderer block={block}/>
                        {selId===block.id&&(
                          <div style={{ position:'absolute', top:3, right:4, display:'flex', gap:2, zIndex:10 }}>
                            <button onClick={e=>moveUp(block.id,e)} style={{ width:18, height:18, background:'rgba(0,0,0,0.08)', border:'none', borderRadius:4, fontSize:9, cursor:'pointer', color:'#555' }}>↑</button>
                            <button onClick={e=>moveDown(block.id,e)} style={{ width:18, height:18, background:'rgba(0,0,0,0.08)', border:'none', borderRadius:4, fontSize:9, cursor:'pointer', color:'#555' }}>↓</button>
                            <button onClick={e=>delBlock(block.id,e)} style={{ width:18, height:18, background:'rgba(244,63,94,0.1)', border:'none', borderRadius:4, fontSize:9, cursor:'pointer', color:'#f43f5e' }}>×</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div onDragOver={e=>{e.preventDefault();setDragOverIdx(blocks.length)}} onDrop={e=>handleBlockDrop(e,blocks.length)} style={{ height:dragOverIdx===blocks.length?4:2, background:dragOverIdx===blocks.length?'#7c5cfc':'transparent', margin:'0 4px', borderRadius:2, transition:'all .15s' }}/>
                  <div style={{ height:32 }}/>
                </div>
              )}
            </div>
            <div style={{ height:32, background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <div style={{ width:120, height:4, borderRadius:3, background:'rgba(0,0,0,0.15)' }}/>
            </div>
          </div>
        </div>
        <div className="text-[10px] mt-4 mb-6" style={{ color:'rgba(255,255,255,0.2)' }}>
          {blocks.length} componente{blocks.length!==1?'s':''} • 375×812px
        </div>
      </div>

      {/* ── PAINEL DE PROPRIEDADES ──────────────────────────────────────── */}
      <div className="w-64 flex-shrink-0 flex flex-col overflow-hidden" style={{ background:'#13141f', borderLeft:'1px solid rgba(255,255,255,0.07)' }}>
        <div className="px-4 py-3 border-b" style={{ borderColor:'rgba(255,255,255,0.07)' }}>
          <div className="text-sm font-medium text-white mb-0.5">{selBlock?selBlock.label:'Propriedades'}</div>
          <div className="text-[10px]" style={{ color:'rgba(255,255,255,0.28)' }}>{selBlock?'Edite o componente':'Selecione um componente'}</div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {selBlock?(
            <PropsPanel block={selBlock} onChange={d=>updateBlock(selBlock.id,d)}/>
          ):(
            <div className="flex flex-col items-center justify-center h-full gap-2 opacity-30 p-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 12h8M8 8h5M8 16h7"/></svg>
              <span className="text-xs text-center" style={{ color:'rgba(255,255,255,0.4)' }}>Clique em um componente para editar</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}