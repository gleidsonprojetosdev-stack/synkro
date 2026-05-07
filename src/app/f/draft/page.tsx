'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface Block {
  id: string
  compId: string
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

function DraftContent() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get('projectId')
  const [project, setProject] = useState<any>(null)
  const [pages, setPages] = useState<Page[]>([])
  const [currentNodeId, setCurrentNodeId] = useState('start')
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState<Record<string, any>>({})

  useEffect(() => {
    if (!projectId) return
    async function load() {
      const { data: proj } = await supabase
        .from('projects')
        .select('id, name, flow_data, tema_data')
        .eq('id', projectId)
        .single()

      const { data: pgs } = await supabase
        .from('pages')
        .select('*')
        .eq('project_id', projectId)

      if (proj) {
        setProject(proj)
        setPages(pgs || [])
        const startConn = proj.flow_data?.connections?.find((c: Connection) => c.from === 'start')
        if (startConn) setCurrentNodeId(startConn.to)
      }
      setLoading(false)
    }
    load()
  }, [projectId])

  const goToNext = useCallback(() => {
    if (!project) return
    const { connections, nodes } = project.flow_data
    const nextConn = connections?.find((c: Connection) => c.from === currentNodeId)
    if (!nextConn) return
    const nextNode = nodes?.find((n: FlowNode) => n.id === nextConn.to)
    if (!nextNode) return
    if (nextNode.subtype === 'link' && nextNode.linkUrl) {
      window.location.href = nextNode.linkUrl
      return
    }
    setCurrentNodeId(nextNode.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [project, currentNodeId])

  const currentPage = pages.find(p => p.node_id === currentNodeId)
  const primaryColor = project?.tema_data?.primaryColor || '#7c5cfc'
  const bgColor = project?.tema_data?.bgColor || '#ffffff'

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bgColor }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid ${primaryColor}30`, borderTop: `3px solid ${primaryColor}` }}/>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (!project) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1018' }}>
      <div style={{ color: 'rgba(255,255,255,0.4)' }}>Projeto não encontrado</div>
    </div>
  )

  // Banner de preview
  const PreviewBanner = () => (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999, background: 'rgba(124,92,252,0.95)', backdropFilter: 'blur(8px)', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', opacity: 0.6 }}/>
        <span style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>Modo Preview — {project.name}</span>
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Página: {currentPage?.name || 'Sem conteúdo'}</div>
    </div>
  )

  if (!currentPage) return (
    <div style={{ minHeight: '100vh', background: bgColor }}>
      <PreviewBanner />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 40 }}>📄</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#333' }}>Página sem conteúdo</div>
        <div style={{ fontSize: 13, color: '#999' }}>Adicione componentes no editor para visualizar.</div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: bgColor, paddingTop: 40 }}>
      <PreviewBanner />
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 16px 40px' }}>
        {currentPage.blocks.map((block, idx) => (
          <RenderBlockSimple
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

function RenderBlockSimple({ block, primaryColor, onNext, answers, setAnswers }: any) {
  const [quizSel, setQuizSel] = useState<number[]>([])

  switch (block.compId) {
    case 'cabecalho':
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 16px', background: block.bgColor || '#fff', borderBottom: '1px solid #f0f0f5', marginBottom: 8 }}>
          {block.logoFile || block.logoUrl
            ? <img src={block.logoFile || block.logoUrl} alt="Logo" style={{ height: 32, objectFit: 'contain' }}/>
            : <div style={{ fontSize: 18, fontWeight: 800, color: primaryColor }}>Logo</div>
          }
        </div>
      )
    case 'progresso':
      return (
        <div style={{ padding: '10px 0 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 10, color: '#999' }}>PROGRESSO</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: block.progressColor || primaryColor }}>{block.progress || 0}%</span>
          </div>
          <div style={{ height: 8, background: '#f0f0f5', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${block.progress || 0}%`, background: block.progressColor || primaryColor, borderRadius: 99 }}/>
          </div>
        </div>
      )
    case 'titulo':
      return (
        <div style={{ padding: '16px 0 8px' }}>
          <div style={{ fontSize: block.headlineSize || 22, fontWeight: 700, color: block.headlineColor || '#1a1a2e', lineHeight: 1.3, marginBottom: 8, textAlign: (block.headlineAlign || 'left') as any }}>
            {block.headline || 'Título'}
          </div>
          {block.subheadline && <div style={{ fontSize: 14, color: '#888', lineHeight: 1.5 }}>{block.subheadline}</div>}
        </div>
      )
    case 'texto':
      return <div style={{ padding: '8px 0', fontSize: 14, color: block.textoColor || '#555', lineHeight: 1.7 }}>{block.texto}</div>
    case 'imagem':
      return (block.imagemFile || block.imagemUrl) ? (
        <div style={{ borderRadius: 12, overflow: 'hidden', height: block.imagemHeight || 200, marginBottom: 8 }}>
          <img src={block.imagemFile || block.imagemUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
        </div>
      ) : null
    case 'botao':
      return (
        <div style={{ padding: '12px 0' }}>
          <button onClick={onNext} style={{ width: '100%', padding: '14px', borderRadius: block.botaoBorderRadius || 12, background: block.botaoCor || primaryColor, border: 'none', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
            {block.botaoTexto || 'Continuar →'}
          </button>
        </div>
      )
    case 'quiz':
      const opcoes = block.quizOpcoesDados || (block.quizOpcoes || []).map((t: string) => ({ titulo: t }))
      const cor = block.quizCorSelecionada || primaryColor
      return (
        <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {block.quizPergunta && <div style={{ fontSize: 16, fontWeight: 600, color: '#1a1a2e', marginBottom: 4 }}>{block.quizPergunta}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: block.quizColunas === '2' ? '1fr 1fr' : '1fr', gap: 10 }}>
            {opcoes.map((op: any, i: number) => {
              const sel = quizSel.includes(i)
              return (
                <div key={i} onClick={() => {
                  const next = block.quizMultipla ? (sel ? quizSel.filter((x: number) => x !== i) : [...quizSel, i]) : [i]
                  setQuizSel(next)
                  if (block.quizVariavel) setAnswers({ ...answers, [block.quizVariavel]: op.titulo })
                  if (!block.quizMultipla) setTimeout(onNext, 400)
                }} style={{ padding: '12px 14px', borderRadius: 10, background: sel ? `${cor}12` : '#f8f8fc', border: `1.5px solid ${sel ? cor : '#e8e8f2'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                  {op.emoji && <span style={{ fontSize: 20 }}>{op.emoji}</span>}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: sel ? 600 : 400, color: sel ? '#1a1a2e' : '#555' }}>{op.titulo}</div>
                    {op.subtitulo && <div style={{ fontSize: 11, color: '#999' }}>{op.subtitulo}</div>}
                  </div>
                </div>
              )
            })}
          </div>
          {block.quizMultipla && quizSel.length > 0 && (
            <button onClick={onNext} style={{ marginTop: 8, padding: '12px', borderRadius: 10, background: cor, border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Continuar →</button>
          )}
        </div>
      )
    case 'garantia':
      const garCor = block.garCor || '#22d387'
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: `${garCor}10`, border: `1px solid ${garCor}30`, borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
          <div style={{ fontSize: 24 }}>🛡️</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>Garantia de {block.garDias || 7} dias</div>
            <div style={{ fontSize: 12, color: '#666' }}>{block.garTexto || 'Reembolso 100% garantido'}</div>
          </div>
        </div>
      )
    case 'preco':
      return (
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          {block.precoDe && <div style={{ fontSize: 14, color: '#bbb', textDecoration: 'line-through' }}>De {block.precoDe}</div>}
          <div style={{ fontSize: 40, fontWeight: 800, color: block.precoCor || primaryColor }}>{block.precoPor || 'R$97'}</div>
          {block.precoParcelas && <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>{block.precoParcelas}</div>}
        </div>
      )
    case 'checkout':
      return (
        <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button style={{ width: '100%', padding: 14, borderRadius: 12, background: block.checkoutCor || '#f97316', border: 'none', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
            {block.checkoutTexto || 'Quero acesso agora →'}
          </button>
        </div>
      )
    case 'carregamento':
      return (
        <div style={{ padding: '24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', border: `3px solid ${primaryColor}30`, borderTop: `3px solid ${primaryColor}` }}/>
          <div style={{ fontSize: 14, color: '#888' }}>{block.loadTexto || 'Analisando respostas...'}</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )
    default:
      return null
  }
}

export default function DraftPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1018' }}>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Carregando...</div>
      </div>
    }>
      <DraftContent />
    </Suspense>
  )
}