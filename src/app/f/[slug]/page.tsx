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

interface Project {
  id: string
  name: string
  flow_data: { nodes: FlowNode[]; connections: Connection[] }
  tema_data: any
  published: boolean
}

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

      // Começa pelo nó conectado ao Início
      const startConn = project.flow_data?.connections?.find((c: Connection) => c.from === 'start')
      if (startConn) setCurrentNodeId(startConn.to)

      setLoading(false)
    }
    loadFunil()
  }, [slug])

  // Registra visita quando muda de página
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

  const currentPage = pages.find(p => p.node_id === currentNodeId)
  const tema = project?.tema_data || {}
  const bgColor = tema.bgColor || '#ffffff'
  const primaryColor = tema.primaryColor || '#7c5cfc'
  const fontFamily = tema.fontFamily || 'Inter, sans-serif'

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bgColor }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid ${primaryColor}30`, borderTop: `3px solid ${primaryColor}`, animation: 'spin 0.8s linear infinite' }}/>
        <span style={{ fontSize: 13, color: '#999' }}>Carregando...</span>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
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

  if (!currentPage) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bgColor }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#333', marginBottom: 8 }}>Página sem conteúdo</div>
        <div style={{ fontSize: 13, color: '#999' }}>Esta página ainda não tem conteúdo configurado.</div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: bgColor, fontFamily, display: 'flex', justifyContent: 'center', padding: '0 16px' }}>
      <div style={{ width: '100%', maxWidth: 480, paddingBottom: 40 }}>
        {currentPage.blocks.map((block, idx) => (
          <RenderBlock
            key={block.id || idx}
            block={block}
            primaryColor={primaryColor}
            onNext={goToNext}
            answers={answers}
            setAnswers={setAnswers}
          />
        ))}
      </div>
    </div>
  )
}



function CronometroBlock({ block, primaryColor }: { block: any; primaryColor: string }) {
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
  const cor = block.cronoCor || primaryColor
  const bgCor = block.cronoBgCor || '#1a1a2e'
  const estilo = block.cronoEstilo || 'digital'

  if (estilo === 'minimalista') return (
    <div style={{ padding: '12px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f8f8fc', borderRadius: 12, border: '1px solid #eee', padding: '12px 16px' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', letterSpacing: 2, fontFamily: 'Syne, sans-serif', flexShrink: 0 }}>
          {h}:{m}:{s}
        </div>
        <div style={{ width: 1, height: 28, background: '#eee', flexShrink: 0 }}/>
        <div style={{ fontSize: 13, color: '#666', lineHeight: 1.4 }}>{block.cronoTexto || 'Oferta por tempo limitado!'}</div>
      </div>
    </div>
  )

  return (
    <div style={{ padding: '12px 16px', textAlign: 'center' }}>
      <div style={{ fontSize: 10, color: '#999', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>{block.cronoTexto || 'OFERTA EXPIRA EM'}</div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
        {[{v:h,l:'HRS'},{v:m,l:'MIN'},{v:s,l:'SEG'}].map((n, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ background: bgCor, borderRadius: estilo === 'arredondado' ? 16 : 10, padding: '10px 16px', textAlign: 'center', boxShadow: `0 4px 20px ${cor}30` }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: cor, lineHeight: 1, letterSpacing: 1 }}>{n.v}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 4, letterSpacing: 1 }}>{n.l}</div>
            </div>
            {i < 2 && <div style={{ fontSize: 24, color: cor, fontWeight: 800, marginBottom: 14 }}>:</div>}
          </div>
        ))}
      </div>
    </div>
  )
}



function CarregamentoBar({ cor, texto }: { cor: string; texto: string }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setProgress(0)
    const duration = 3000
    const interval = 30
    const steps = duration / interval
    let current = 0
    const timer = setInterval(() => {
      current++
      const eased = Math.min(100, Math.round((1 - Math.pow(1 - current / steps, 3)) * 100))
      setProgress(eased)
      if (current >= steps) clearInterval(timer)
    }, interval)
    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{ padding: '20px 16px' }}>
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: cor }}>{progress}%</span>
        </div>
        <div style={{ height: 12, background: `${cor}20`, borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${cor}, ${cor}cc)`, borderRadius: 99, transition: 'width 0.03s linear', position: 'relative', boxShadow: `0 0 12px ${cor}80` }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: 'rgba(255,255,255,0.25)', borderRadius: '99px 99px 0 0' }}/>
          </div>
        </div>
      </div>
      <div style={{ fontSize: 13, color: '#888', textAlign: 'center', marginTop: 10 }}>{texto}</div>
    </div>
  )
}

function RenderBlock({ block, primaryColor, onNext, answers, setAnswers }: {
  block: Block
  primaryColor: string
  onNext: () => void
  answers: Record<string, any>
  setAnswers: (a: Record<string, any>) => void
}) {
  const [quizSel, setQuizSel] = useState<number[]>([])

  switch (block.compId) {

    case 'cabecalho':
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: block.logoPosition === 'left' ? 'flex-start' : block.logoPosition === 'right' ? 'flex-end' : 'center', padding: '12px 16px', background: block.bgColor || '#fff', borderBottom: '1px solid #f0f0f5', position: 'relative' }}>
          {block.showBack !== false && (
            <button onClick={() => window.history.back()} style={{ position: 'absolute', left: 12, width: 32, height: 32, borderRadius: 8, background: '#f5f5fa', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round"><path d="M9 2L4 7l5 5"/></svg>
            </button>
          )}
          {block.logoFile || block.logoUrl
            ? <img src={block.logoFile || block.logoUrl} alt="Logo" style={{ height: 32, objectFit: 'contain' }}/>
            : <div style={{ fontSize: 18, fontWeight: 800, color: primaryColor }}>Logo</div>
          }
        </div>
      )

    case 'progresso':
      return (
        <div style={{ padding: '10px 16px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: '#999' }}>PROGRESSO</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: block.progressColor || primaryColor }}>{block.progress || 0}%</span>
          </div>
          <div style={{ height: block.progressHeight || 8, background: block.progressBgColor || '#f0f0f5', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${block.progress || 0}%`, background: `linear-gradient(90deg, ${block.progressColor || primaryColor}, ${block.progressColor || primaryColor}cc)`, borderRadius: 99, boxShadow: `0 0 12px ${block.progressColor || primaryColor}80` }}/>
          </div>
        </div>
      )

    case 'titulo':
      return (
        <div style={{ padding: '16px 16px 8px' }}>
          <div style={{ fontSize: block.headlineSize || 22, fontWeight: block.headlineFontWeight || '700', color: block.headlineColor || '#1a1a2e', lineHeight: block.headlineLineHeight || 1.3, marginBottom: 8, textAlign: (block.headlineAlign || 'left') as any }}>
            {block.headline || 'Título'}
          </div>
          {block.subheadline && (
            <div style={{ fontSize: 14, color: block.subheadlineColor || '#888', lineHeight: 1.5, textAlign: (block.headlineAlign || 'left') as any }}>
              {block.subheadline}
            </div>
          )}
        </div>
      )

    case 'texto':
      return (
        <div style={{ padding: '8px 16px' }}>
          <div style={{ fontSize: block.textoSize || 14, color: block.textoColor || '#555', lineHeight: block.textoLineHeight || 1.7, textAlign: (block.textoAlign || 'left') as any }}>
            {block.texto || ''}
          </div>
        </div>
      )

    case 'imagem':
      return (
        <div style={{ padding: '8px 16px' }}>
          {(block.imagemFile || block.imagemUrl) && (
            <div style={{ borderRadius: block.imagemBorderRadius || 12, overflow: 'hidden', height: block.imagemHeight || 200, position: 'relative' }}>
              <img src={block.imagemFile || block.imagemUrl} alt="" style={{ width: '100%', height: '100%', objectFit: (block.imagemFit || 'cover') as any }}/>
              {block.imagemOverlayTexto && (
                <div style={{ position: 'absolute', inset: 0, background: block.imagemOverlayCor || 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#fff', fontSize: 16, fontWeight: 700, textAlign: 'center', padding: '0 16px' }}>{block.imagemOverlayTexto}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )

    case 'botao':
      return (
        <div style={{ padding: '12px 16px' }}>
          <button
            onClick={onNext}
            style={{ width: '100%', padding: block.botaoTamanho === 'lg' ? '16px' : '13px', borderRadius: block.botaoBorderRadius || 12, background: block.botaoCor || primaryColor, border: 'none', color: block.botaoTextoCor || '#fff', fontSize: block.botaoTamanho === 'lg' ? 16 : 14, fontWeight: 700, cursor: 'pointer', boxShadow: block.botaoSombra ? `0 4px 20px ${block.botaoCor || primaryColor}55` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {block.botaoIcone && <span>{block.botaoIcone}</span>}
            {block.botaoTexto || 'Continuar →'}
          </button>
        </div>
      )

    case 'quiz':
      const opcoes = block.quizOpcoesDados || (block.quizOpcoes || []).map((t: string) => ({ titulo: t }))
      const cor = block.quizCorSelecionada || primaryColor
      return (
        <div style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {block.quizPergunta && (
            <div style={{ fontSize: block.quizPerguntaSize || 16, fontWeight: 600, color: '#1a1a2e', marginBottom: 4 }}>
              {block.quizPergunta}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: block.quizColunas === '2' ? '1fr 1fr' : '1fr', gap: 10 }}>
            {opcoes.map((op: any, i: number) => {
              const sel = quizSel.includes(i)
              return (
                <div key={i} onClick={() => {
                  const next = block.quizMultipla
                    ? quizSel.includes(i) ? quizSel.filter(x => x !== i) : [...quizSel, i]
                    : [i]
                  setQuizSel(next)
                  if (block.quizVariavel) setAnswers({ ...answers, [block.quizVariavel]: op.titulo })
                  if (!block.quizMultipla) setTimeout(onNext, 400)
                }}
                  style={{ padding: '12px 14px', borderRadius: block.quizBorderRadius || 10, background: sel ? `${cor}12` : '#f8f8fc', border: `1.5px solid ${sel ? cor : '#e8e8f2'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.15s' }}
                >
                  {op.emoji && <span style={{ fontSize: 20 }}>{op.emoji}</span>}
                  {op.imagem && <img src={op.imagem} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }}/>}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: sel ? 600 : 400, color: sel ? '#1a1a2e' : '#555' }}>{op.titulo}</div>
                    {op.subtitulo && <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{op.subtitulo}</div>}
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
            <button onClick={onNext} style={{ marginTop: 8, padding: '12px', borderRadius: 10, background: cor, border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              Continuar →
            </button>
          )}
        </div>
      )

    case 'cronometro':
      return <CronometroBlock block={block} primaryColor={primaryColor} />

    case 'garantia':
      const garCor = block.garCor || '#22d387'
      return (
        <div style={{ padding: '8px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: `${garCor}10`, border: `1px solid ${garCor}30`, borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${garCor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={garCor} strokeWidth="1.5" strokeLinecap="round"><path d="M10 1l7 2.5v7c0 4-3.5 7-7 8.5C6.5 17.5 3 14.5 3 10.5v-7L10 1z"/><path d="M7 10l2.5 2.5 4.5-4.5"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>Garantia de {block.garDias || 7} dias</div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{block.garTexto || 'Reembolso 100% garantido'}</div>
            </div>
          </div>
        </div>
      )

    case 'preco':
      return (
        <div style={{ padding: '12px 16px', textAlign: 'center' }}>
          {block.precoDe && <div style={{ fontSize: 14, color: '#bbb', textDecoration: 'line-through' }}>De {block.precoDe}</div>}
          <div style={{ fontSize: 13, color: '#999', marginBottom: 4 }}>Por apenas</div>
          <div style={{ fontSize: 40, fontWeight: 800, color: block.precoCor || primaryColor, lineHeight: 1 }}>{block.precoPor || 'R$97'}</div>
          {block.precoParcelas && <div style={{ fontSize: 12, color: '#aaa', marginTop: 6 }}>{block.precoParcelas}</div>}
        </div>
      )

    case 'depoimento':
      return (
        <div style={{ padding: '8px 16px' }}>
          <div style={{ background: block.depCardCor || '#f9f9fc', border: '1px solid #eee', borderRadius: 14, padding: 16 }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
              {block.depAvatar
                ? <img src={block.depAvatar} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}/>
                : <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg, ${primaryColor}, #a78bfa)` }}/>
              }
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{block.depNome || 'Cliente'}</div>
                <div style={{ color: '#f97316', fontSize: 12 }}>{'★'.repeat(block.depEstrelas || 5)}</div>
              </div>
            </div>
            <div style={{ fontSize: 13, color: '#555', lineHeight: 1.6, fontStyle: 'italic' }}>"{block.depTexto || 'Excelente produto!'}"</div>
          </div>
        </div>
      )

    case 'checkout':
      return (
        <div style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button style={{ width: '100%', padding: 14, borderRadius: 12, background: block.checkoutCor || '#f97316', border: 'none', color: block.checkoutTextoCor || '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
            {block.checkoutTexto || 'Quero acesso agora →'}
          </button>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            {block.checkoutPix !== false && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '4px 10px', fontSize: 11, color: '#16a34a', fontWeight: 600 }}>Pix</div>}
            {block.checkoutCartao !== false && <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, padding: '4px 10px', fontSize: 11, color: '#1d4ed8', fontWeight: 600 }}>Cartão</div>}
          </div>
          {block.checkoutSeguranca && <div style={{ fontSize: 11, color: '#aaa', textAlign: 'center' }}>{block.checkoutSeguranca}</div>}
        </div>
      )

    case 'carregamento':
      return <CarregamentoBar cor={block.loadCor || primaryColor} texto={block.loadTexto || 'Analisando respostas...'} />

    case 'redirecionar':
      return <RedirecionarBlock seconds={block.redirSegundos || 10} onNext={onNext} />

    case 'niveis': {
      const faixas = block.resultFaixas || [
        { min: 0, max: 33, label: 'Nível 1', cor: '#4f8ef7' },
        { min: 34, max: 66, label: 'Nível 2', cor: '#4f8ef7' },
        { min: 67, max: 100, label: 'Nível 3', cor: '#4f8ef7' },
      ]
      const score = block.resultScore ?? 72
      return (
        <div style={{ padding: '10px 16px' }}>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            {faixas.map((f: any, i: number) => {
              const isAtivo = score >= f.min && score <= f.max
              const fillPct = isAtivo ? ((score - f.min) / Math.max(f.max - f.min, 1)) * 100 : i < faixas.findIndex((fx: any) => score >= fx.min && score <= fx.max) ? 100 : 0
              const cor = f.cor || '#4f8ef7'
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: isAtivo ? cor : '#bbb', background: isAtivo ? `${cor}15` : '#f5f5fa', border: `1px solid ${isAtivo ? cor + '40' : '#eee'}`, borderRadius: 99, padding: '2px 8px' }}>
                    {f.min}–{f.max}
                  </div>
                  <div style={{ width: 48, height: 80, background: '#f0f0f8', borderRadius: 12, overflow: 'hidden', position: 'relative', boxShadow: isAtivo ? `0 0 0 2px ${cor}40` : 'none' }}>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${Math.max(fillPct, isAtivo ? 30 : 0)}%`, background: `linear-gradient(180deg, ${cor}cc, ${cor})`, borderRadius: 12, boxShadow: isAtivo ? `0 -4px 16px ${cor}60` : 'none' }}/>
                    {isAtivo && (
                      <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
                        <div style={{ background: '#fff', borderRadius: 6, padding: '2px 6px', fontSize: 10, fontWeight: 800, color: cor }}>{score}</div>
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: isAtivo ? '#1a1a2e' : '#aaa', textAlign: 'center' }}>{f.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    default:
      return null
  }
}

function RedirecionarBlock({ seconds, onNext }: { seconds: number; onNext: () => void }) {
  const calledRef = useRef(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!calledRef.current) {
        calledRef.current = true
        onNext()
      }
    }, seconds * 1000)
    return () => clearTimeout(timer)
  }, [seconds, onNext])

  // Invisível para o lead — apenas redireciona silenciosamente
  return <div style={{ display: 'none' }} />
}