'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'

interface Block {
  id: string
  compId: string
  label: string
  [key: string]: any
}

interface Page {
  id: string
  node_id: string
  name: string
  blocks: Block[]
}

interface FlowNode {
  id: string
  type: string
  subtype?: string
  label: string
  linkUrl?: string
}

interface Connection {
  from: string
  to: string
}

interface TemaData {
  corPrincipal: string
  corTexto: string
  corFundo: string
  modoEscuro: boolean
  espacamento: number
  arredondamento: number
  mostrarMarca: boolean
  logo: string | null
  favicon: string | null
}

interface Project {
  id: string
  name: string
  flow_data: { nodes: FlowNode[]; connections: Connection[] }
  tema_data: TemaData
  published: boolean
}

const ESP_PX = [8, 12, 16, 20, 28]
const RAD_PX = [0, 6, 12, 20, 999]

export default function FunilPage() {
  const { slug } = useParams<{ slug: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [pages, setPages] = useState<Page[]>([])
  const [currentNodeId, setCurrentNodeId] = useState<string>('start')
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [answers, setAnswers] = useState<Record<string, any>>({})

  useEffect(() => {
    async function loadFunil() {
      const res = await fetch(`/api/funil?slug=${slug}`)
      if (!res.ok) { setNotFound(true); setLoading(false); return }
      const { project, pages } = await res.json()
      setProject(project)
      setPages(pages || [])
      const startConn = project.flow_data?.connections?.find((c: Connection) => c.from === 'start')
      if (startConn) setCurrentNodeId(startConn.to)
      setLoading(false)
    }
    loadFunil()
  }, [slug])

  useEffect(() => {
    if (!project || currentNodeId === 'start') return
    fetch('/api/funil', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: project.id, nodeId: currentNodeId }),
    })
  }, [currentNodeId, project])

  const goToNext = useCallback(() => {
    if (!project) return
    const { connections, nodes } = project.flow_data
    const nextConn = connections.find((c: Connection) => c.from === currentNodeId)
    if (!nextConn) return
    const nextNode = nodes.find((n: FlowNode) => n.id === nextConn.to)
    if (!nextNode) return
    if (nextNode.subtype === 'link' && nextNode.linkUrl) {
      window.location.href = nextNode.linkUrl
      return
    }
    setCurrentNodeId(nextNode.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [project, currentNodeId])

  // ── Tema ─────────────────────────────────────────────────────────────────
  const tema = project?.tema_data || {} as TemaData
  const corPrincipal = tema.corPrincipal || '#7c5cfc'
  const corTexto     = tema.corTexto     || '#1a1a2e'
  const corFundo     = tema.corFundo     || '#ffffff'
  const modoEscuro   = tema.modoEscuro   ?? false
  const espacamento  = ESP_PX[tema.espacamento ?? 2]
  const raio         = RAD_PX[tema.arredondamento ?? 2]
  const mostrarMarca = tema.mostrarMarca ?? true
  const logo         = tema.logo         || null

  const temaCtx: TemaCtx = { corPrincipal, corTexto, corFundo, modoEscuro, espacamento, raio, logo }

  // Favicon dinâmico
  useEffect(() => {
    if (tema.favicon) {
      const link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]') || document.createElement('link')
      link.rel = 'icon'
      link.href = tema.favicon
      document.head.appendChild(link)
    }
  }, [tema.favicon])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: corFundo }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid ${corPrincipal}30`, borderTopColor: corPrincipal, animation: 'spin 0.8s linear infinite' }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1018' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Funil não encontrado</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Este link não existe ou foi desativado.</div>
      </div>
    </div>
  )

  const currentPage = pages.find(p => p.node_id === currentNodeId)

  if (!currentPage) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: corFundo }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: corTexto, marginBottom: 8 }}>Página sem conteúdo</div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: corFundo, color: corTexto, fontFamily: '"Inter", system-ui, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <style>{`
        * { box-sizing: border-box; }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
      `}</style>

      <div style={{ width: '100%', maxWidth: 480, paddingBottom: 40, animation: 'fadeUp 0.4s ease' }}>
        {currentPage.blocks.map((block, idx) => (
          <RenderBlock
            key={block.id || idx}
            block={block}
            tema={temaCtx}
            onNext={goToNext}
            answers={answers}
            setAnswers={setAnswers}
          />
        ))}

        {/* Marca Synkro */}
        {mostrarMarca && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '24px 0 8px', opacity: 0.4 }}>
            <span style={{ fontSize: 11, color: corTexto }}>Feito com</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: corPrincipal }}>Synkro</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Contexto de tema ─────────────────────────────────────────────────────────

interface TemaCtx {
  corPrincipal: string
  corTexto: string
  corFundo: string
  modoEscuro: boolean
  espacamento: number
  raio: number
  logo: string | null
}

// ── Blocos auxiliares ────────────────────────────────────────────────────────

function CronometroBlock({ block, tema }: { block: any; tema: TemaCtx }) {
  const totalSeconds = (block.cronoHoras || 0) * 3600 + (block.cronoMinutos || 8) * 60 + (block.cronoSegundos || 47)
  const [remaining, setRemaining] = useState(totalSeconds)

  useEffect(() => {
    if (remaining <= 0) return
    const timer = setInterval(() => setRemaining((r: number) => Math.max(0, r - 1)), 1000)
    return () => clearInterval(timer)
  }, [remaining])

  const h = String(Math.floor(remaining / 3600)).padStart(2, '0')
  const m = String(Math.floor((remaining % 3600) / 60)).padStart(2, '0')
  const s = String(remaining % 60).padStart(2, '0')
  const cor = block.cronoCor || tema.corPrincipal
  const bgCor = block.cronoBgCor || (tema.modoEscuro ? '#1a1a2e' : '#f0f0f5')

  if (block.cronoEstilo === 'minimalista') return (
    <div style={{ padding: `8px ${tema.espacamento}px` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: tema.modoEscuro ? 'rgba(255,255,255,0.05)' : '#f8f8fc', borderRadius: tema.raio, border: `1px solid ${cor}20`, padding: '12px 16px' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: cor, letterSpacing: 2 }}>{h}:{m}:{s}</div>
        <div style={{ width: 1, height: 28, background: tema.modoEscuro ? 'rgba(255,255,255,0.1)' : '#eee' }}/>
        <div style={{ fontSize: 13, color: tema.corTexto, opacity: 0.7, lineHeight: 1.4 }}>{block.cronoTexto || 'Oferta por tempo limitado!'}</div>
      </div>
    </div>
  )

  return (
    <div style={{ padding: `12px ${tema.espacamento}px`, textAlign: 'center' }}>
      <div style={{ fontSize: 10, color: tema.corTexto, opacity: 0.5, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>{block.cronoTexto || 'OFERTA EXPIRA EM'}</div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
        {[{v:h,l:'HRS'},{v:m,l:'MIN'},{v:s,l:'SEG'}].map((n, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ background: bgCor, borderRadius: tema.raio, padding: '10px 16px', textAlign: 'center', boxShadow: `0 4px 20px ${cor}30` }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: cor, lineHeight: 1 }}>{n.v}</div>
              <div style={{ fontSize: 9, color: tema.modoEscuro ? 'rgba(255,255,255,0.4)' : '#999', marginTop: 4, letterSpacing: 1 }}>{n.l}</div>
            </div>
            {i < 2 && <div style={{ fontSize: 24, color: cor, fontWeight: 800, marginBottom: 14 }}>:</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

function CarregamentoBar({ block, tema }: { block: any; tema: TemaCtx }) {
  const cor = block.loadCor || tema.corPrincipal
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setProgress(0)
    const steps = 100, dur = 3000
    let cur = 0
    const timer = setInterval(() => {
      cur++
      setProgress(Math.min(100, Math.round((1 - Math.pow(1 - cur / steps, 3)) * 100)))
      if (cur >= steps) clearInterval(timer)
    }, dur / steps)
    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{ padding: `20px ${tema.espacamento}px` }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: cor }}>{progress}%</span>
      </div>
      <div style={{ height: 12, background: `${cor}20`, borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${cor}, ${cor}cc)`, borderRadius: 99, transition: 'width 0.03s linear', boxShadow: `0 0 12px ${cor}80` }}/>
      </div>
      <div style={{ fontSize: 13, color: tema.corTexto, opacity: 0.5, textAlign: 'center', marginTop: 10 }}>{block.loadTexto || 'Analisando respostas...'}</div>
    </div>
  )
}

function RedirecionarBlock({ seconds, onNext }: { seconds: number; onNext: () => void }) {
  const calledRef = useRef(false)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!calledRef.current) { calledRef.current = true; onNext() }
    }, seconds * 1000)
    return () => clearTimeout(timer)
  }, [seconds, onNext])
  return <div style={{ display: 'none' }}/>
}

// ── RenderBlock principal ────────────────────────────────────────────────────

function RenderBlock({ block, tema, onNext, answers, setAnswers }: {
  block: Block
  tema: TemaCtx
  onNext: () => void
  answers: Record<string, any>
  setAnswers: (a: Record<string, any>) => void
}) {
  const [quizSel, setQuizSel] = useState<number[]>([])
  const pad = `8px ${tema.espacamento}px`
  const txt = tema.corTexto
  const pri = tema.corPrincipal
  const bg  = tema.corFundo
  const rad = tema.raio
  const dark = tema.modoEscuro

  // Cor adaptativa para elementos internos (cards, inputs)
  const surfaceColor = dark ? 'rgba(255,255,255,0.05)' : '#f8f8fc'
  const borderColor  = dark ? 'rgba(255,255,255,0.08)' : '#e8e8f2'
  const subTextColor = dark ? 'rgba(255,255,255,0.45)' : '#888'

  // Disparo do Meta Pixel
  useEffect(() => {
    if (block.compId !== 'metapixel') return
    if (block.pixelAtivo === false) return
    if (!block.pixelId) return

    const pixelId = block.pixelId
    const evento = block.pixelEvento || 'PageView'
    const eventoNome = evento === 'Custom' ? (block.pixelEventoCustom || 'Custom') : evento

    // Injeta o script do pixel se ainda não existir
    if (!(window as any).fbq) {
      const script = document.createElement('script')
      script.innerHTML = `
        !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${pixelId}');
      `
      document.head.appendChild(script)
    }

    // Dispara o evento
    const fbq = (window as any).fbq
    if (fbq) {
      if (evento === 'PageView') {
        fbq('track', 'PageView')
      } else {
        fbq('track', eventoNome)
      }
    }
  }, [block.pixelId, block.pixelEvento, block.pixelAtivo])

  switch (block.compId) {

    case 'cabecalho':
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: block.logoPosition === 'left' ? 'flex-start' : block.logoPosition === 'right' ? 'flex-end' : 'center', padding: `12px ${tema.espacamento}px`, background: block.bgColor || bg, borderBottom: `1px solid ${borderColor}`, position: 'relative', minHeight: block.headerHeight || 52 }}>
          {block.showBack !== false && (
            <button onClick={() => window.history.back()} style={{ position: 'absolute', left: 12, width: 32, height: 32, borderRadius: 8, background: surfaceColor, border: `1px solid ${borderColor}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={txt} strokeWidth="1.5" strokeLinecap="round"><path d="M9 2L4 7l5 5"/></svg>
            </button>
          )}
          {block.logoFile || block.logoUrl || tema.logo
            ? <img src={block.logoFile || block.logoUrl || tema.logo!} alt="Logo" style={{ height: 32, objectFit: 'contain' }}/>
            : <div style={{ fontSize: 18, fontWeight: 800, color: pri }}>Logo</div>
          }
        </div>
      )

    case 'progresso':
      return (
        <div style={{ padding: `10px ${tema.espacamento}px 12px` }}>
          {block.showPercent !== false && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: subTextColor, letterSpacing: 0.5 }}>PROGRESSO</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: block.progressColor || pri }}>{block.progress || 0}%</span>
            </div>
          )}
          <div style={{ height: block.progressHeight || 8, background: block.progressBgColor || (dark ? 'rgba(255,255,255,0.1)' : '#f0f0f5'), borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${block.progress || 0}%`, background: `linear-gradient(90deg, ${block.progressColor || pri}, ${block.progressColor || pri}cc)`, borderRadius: 99, boxShadow: `0 0 12px ${block.progressColor || pri}80` }}/>
          </div>
        </div>
      )

    case 'titulo':
      return (
        <div style={{ padding: `16px ${tema.espacamento}px 8px` }}>
          <div style={{ fontSize: block.headlineSize || 22, fontWeight: block.headlineFontWeight || '700', color: block.headlineColor || txt, lineHeight: block.headlineLineHeight || 1.3, marginBottom: 8, textAlign: (block.headlineAlign || 'left') as any }}>
            {block.headline || 'Título'}
          </div>
          {block.subheadline && (
            <div style={{ fontSize: 15, color: block.subheadlineColor || subTextColor, lineHeight: 1.5, textAlign: (block.headlineAlign || 'left') as any }}>
              {block.subheadline}
            </div>
          )}
        </div>
      )

    case 'texto':
      return (
        <div style={{ padding: pad }}>
          <div style={{ fontSize: block.textoSize || 14, color: block.textoColor || txt, opacity: block.textoColor ? 1 : 0.75, lineHeight: block.textoLineHeight || 1.7, textAlign: (block.textoAlign || 'left') as any }}>
            {block.texto || ''}
          </div>
        </div>
      )

    case 'lista': {
      const itens = block.itens || []
      const cor = block.checkColor || pri
      return (
        <div style={{ padding: pad, display: 'flex', flexDirection: 'column', gap: block.listaSpacing || 10 }}>
          {itens.map((item: string, i: number) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: `${cor}18`, border: `1.5px solid ${cor}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke={cor} strokeWidth="2" strokeLinecap="round"><path d="M2 5l2.5 2.5L8 2.5"/></svg>
              </div>
              <span style={{ fontSize: 14, color: block.listaColor || txt }}>{item}</span>
            </div>
          ))}
        </div>
      )
    }

    case 'imagem':
      return (
        <div style={{ padding: pad }}>
          {(block.imagemFile || block.imagemUrl) ? (
            <div style={{ borderRadius: rad, overflow: 'hidden', height: block.imagemHeight || 200, position: 'relative' }}>
              <img src={block.imagemFile || block.imagemUrl} alt="" style={{ width: '100%', height: '100%', objectFit: (block.imagemFit || 'cover') as any }}/>
              {block.imagemOverlayTexto && (
                <div style={{ position: 'absolute', inset: 0, background: block.imagemOverlayCor || 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#fff', fontSize: 16, fontWeight: 700, textAlign: 'center', padding: '0 16px' }}>{block.imagemOverlayTexto}</span>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )

    case 'botao':
      return (
        <div style={{ padding: pad }}>
          <button
            onClick={onNext}
            style={{ width: '100%', padding: block.botaoTamanho === 'lg' ? '16px' : '13px', borderRadius: Math.min(rad, block.botaoBorderRadius || rad), background: block.botaoCor || pri, border: 'none', color: block.botaoTextoCor || '#fff', fontSize: block.botaoTamanho === 'lg' ? 16 : 14, fontWeight: 700, cursor: 'pointer', boxShadow: block.botaoSombra ? `0 6px 24px ${block.botaoCor || pri}55` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'transform 0.15s, box-shadow 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 8px 28px ${block.botaoCor || pri}60` }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = block.botaoSombra ? `0 6px 24px ${block.botaoCor || pri}55` : 'none' }}
          >
            {block.botaoIcone && <span>{block.botaoIcone}</span>}
            {block.botaoTexto || 'Continuar →'}
          </button>
        </div>
      )

    case 'quiz': {
      const opcoes = block.quizOpcoesDados || (block.quizOpcoes || []).map((t: string) => ({ titulo: t }))
      const cor = block.quizCorSelecionada || pri
      return (
        <div style={{ padding: pad, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {block.quizPergunta && (
            <div style={{ fontSize: block.quizPerguntaSize || 16, fontWeight: 600, color: txt, marginBottom: 4 }}>
              {block.quizPergunta}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: block.quizColunas === '2' ? '1fr 1fr' : '1fr', gap: 10 }}>
            {opcoes.map((op: any, i: number) => {
              const sel = quizSel.includes(i)
              return (
                <div key={i}
                  onClick={() => {
                    const next = block.quizMultipla
                      ? quizSel.includes(i) ? quizSel.filter(x => x !== i) : [...quizSel, i]
                      : [i]
                    setQuizSel(next)
                    if (block.quizVariavel) setAnswers({ ...answers, [block.quizVariavel]: op.titulo })
                    if (!block.quizMultipla) setTimeout(onNext, 400)
                  }}
                  style={{ padding: '12px 14px', borderRadius: Math.min(rad, block.quizBorderRadius || 10), background: sel ? `${cor}15` : surfaceColor, border: `1.5px solid ${sel ? cor : borderColor}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.15s' }}
                >
                  {op.emoji && <span style={{ fontSize: 20 }}>{op.emoji}</span>}
                  {op.imagem && <img src={op.imagem} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }}/>}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: sel ? 600 : 400, color: sel ? txt : subTextColor }}>{op.titulo}</div>
                    {op.subtitulo && <div style={{ fontSize: 11, color: subTextColor, marginTop: 2 }}>{op.subtitulo}</div>}
                  </div>
                  {sel && (
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: cor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M2 5l2.5 2.5L8 2.5"/></svg>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          {block.quizMultipla && quizSel.length > 0 && (
            <button onClick={onNext} style={{ marginTop: 8, padding: '12px', borderRadius: rad, background: cor, border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              Continuar →
            </button>
          )}
        </div>
      )
    }

    case 'cronometro':
      return <CronometroBlock block={block} tema={tema}/>

    case 'garantia': {
      const garCor = block.garCor || '#22d387'
      return (
        <div style={{ padding: pad }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: `${garCor}10`, border: `1px solid ${garCor}30`, borderRadius: rad, padding: '12px 14px' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${garCor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={garCor} strokeWidth="1.5" strokeLinecap="round"><path d="M10 1l7 2.5v7c0 4-3.5 7-7 8.5C6.5 17.5 3 14.5 3 10.5v-7L10 1z"/><path d="M7 10l2.5 2.5 4.5-4.5"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: txt }}>Garantia de {block.garDias || 7} dias</div>
              <div style={{ fontSize: 12, color: subTextColor, marginTop: 2 }}>{block.garTexto || 'Reembolso 100% garantido'}</div>
            </div>
          </div>
        </div>
      )
    }

    case 'preco':
      return (
        <div style={{ padding: pad, textAlign: 'center' }}>
          {block.precoBadge && <div style={{ display: 'inline-block', background: '#f43f5e', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 99, marginBottom: 8 }}>{block.precoBadge}</div>}
          {block.precoDe && <div style={{ fontSize: 14, color: subTextColor, textDecoration: 'line-through' }}>De {block.precoDe}</div>}
          <div style={{ fontSize: 12, color: subTextColor, marginBottom: 4 }}>Por apenas</div>
          <div style={{ fontSize: 42, fontWeight: 800, color: block.precoCor || pri, lineHeight: 1 }}>{block.precoPor || 'R$97'}</div>
          {block.precoParcelas && <div style={{ fontSize: 13, color: subTextColor, marginTop: 6 }}>{block.precoParcelas}</div>}
        </div>
      )

    case 'depoimento':
      return (
        <div style={{ padding: pad }}>
          <div style={{ background: block.depCardCor || surfaceColor, border: `1px solid ${borderColor}`, borderRadius: rad, padding: 16 }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
              {block.depAvatar
                ? <img src={block.depAvatar} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}/>
                : <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg, ${pri}, #a78bfa)` }}/>
              }
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: txt }}>{block.depNome || 'Cliente'}</div>
                <div style={{ color: '#f97316', fontSize: 13 }}>{'★'.repeat(block.depEstrelas || 5)}</div>
              </div>
            </div>
            <div style={{ fontSize: 13, color: subTextColor, lineHeight: 1.6, fontStyle: 'italic' }}>"{block.depTexto || 'Excelente produto!'}"</div>
          </div>
        </div>
      )

    case 'checkout':
      return (
        <div style={{ padding: pad, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            style={{ width: '100%', padding: 15, borderRadius: rad, background: block.checkoutCor || '#f97316', border: 'none', color: block.checkoutTextoCor || '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: `0 6px 24px ${block.checkoutCor || '#f97316'}50` }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {block.checkoutTexto || 'Quero acesso agora →'}
          </button>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            {block.checkoutPix !== false && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '4px 10px', fontSize: 11, color: '#16a34a', fontWeight: 600 }}>Pix</div>}
            {block.checkoutCartao !== false && <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, padding: '4px 10px', fontSize: 11, color: '#1d4ed8', fontWeight: 600 }}>Cartão</div>}
          </div>
          {block.checkoutSeguranca && <div style={{ fontSize: 11, color: subTextColor, textAlign: 'center' }}>{block.checkoutSeguranca}</div>}
        </div>
      )

    case 'carregamento':
      return <CarregamentoBar block={block} tema={tema}/>

    case 'redirecionar':
      return <RedirecionarBlock seconds={block.redirSegundos || 10} onNext={onNext}/>

    case 'beneficios': {
      const itens = block.benefItems || []
      const cor = block.benefCor || '#22d387'
      return (
        <div style={{ padding: pad, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {itens.map((item: string, i: number) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: `${cor}18`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke={cor} strokeWidth="2" strokeLinecap="round"><path d="M2 5l2.5 2.5L8 2.5"/></svg>
              </div>
              <span style={{ fontSize: 14, color: txt }}>{item}</span>
            </div>
          ))}
        </div>
      )
    }

    case 'niveis': {
      const faixas = block.resultFaixas || [{min:0,max:33,label:'Nível 1',cor:'#4f8ef7'},{min:34,max:66,label:'Nível 2',cor:'#4f8ef7'},{min:67,max:100,label:'Nível 3',cor:'#4f8ef7'}]
      const score = block.resultScore ?? 72
      return (
        <div style={{ padding: pad }}>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            {faixas.map((f: any, i: number) => {
              const isAtivo = score >= f.min && score <= f.max
              const fillPct = isAtivo ? ((score-f.min)/Math.max(f.max-f.min,1))*100 : i < faixas.findIndex((fx: any) => score>=fx.min&&score<=fx.max) ? 100 : 0
              const cor = f.cor || pri
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: isAtivo ? cor : subTextColor, background: isAtivo ? `${cor}15` : surfaceColor, border: `1px solid ${isAtivo ? cor+'40' : borderColor}`, borderRadius: 99, padding: '2px 8px' }}>{f.label}</div>
                  <div style={{ width: 48, height: 80, background: dark ? 'rgba(255,255,255,0.08)' : '#f0f0f8', borderRadius: 12, overflow: 'hidden', position: 'relative', boxShadow: isAtivo ? `0 0 0 2px ${cor}40` : 'none' }}>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${Math.max(fillPct, isAtivo ? 30 : 0)}%`, background: `linear-gradient(180deg, ${cor}cc, ${cor})`, borderRadius: 12 }}/>
                    {isAtivo && <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}><div style={{ background: '#fff', borderRadius: 6, padding: '2px 6px', fontSize: 10, fontWeight: 800, color: cor }}>{score}</div></div>}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: isAtivo ? txt : subTextColor, textAlign: 'center' }}>{f.label}</div>
                  {f.desc && <div style={{ fontSize: 11, color: subTextColor, textAlign: 'center', lineHeight: 1.4 }}>{f.desc}</div>}
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    case 'metapixel':
      // Invisível para o lead — dispara via useEffect acima
      return null

    default:
      return null
  }
}