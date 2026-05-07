'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

// ─── Tipos (espelham o FlowCanvas) ────────────────────────────────────────

type Periodo = 'hoje' | '7dias' | '15dias' | 'mes' | 'mes_passado' | 'maximo' | 'customizado'

const PERIODO_LABELS: Record<Periodo, string> = {
  hoje:        'Hoje',
  '7dias':     'Últimos 7 Dias',
  '15dias':    'Últimos 15 Dias',
  mes:         'Este Mês',
  mes_passado: 'Mês Passado',
  maximo:      'Período Máximo',
  customizado: 'Customizado',
}

interface FlowNode {
  id: string
  type: 'start' | 'page' | 'function'
  subtype?: string
  label: string
  x: number
  y: number
  linkUrl?: string
}

interface FlowConn {
  from: string
  to: string
}

interface NodeStats {
  views: number
  retencao: number
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function fmtNum(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'k'
  return String(n)
}

function retColor(r: number) {
  if (r >= 75) return '#22d387'
  if (r >= 45) return '#fbbf24'
  return '#f87171'
}

function getPeriodRange(periodo: Periodo, di: string, df: string) {
  const now = new Date()
  const iso = (d: Date) => d.toISOString()
  if (periodo === 'hoje') {
    const s = new Date(now); s.setHours(0, 0, 0, 0)
    return { from: iso(s), to: iso(now) }
  }
  if (periodo === '7dias') {
    const s = new Date(now); s.setDate(now.getDate() - 7)
    return { from: iso(s), to: iso(now) }
  }
  if (periodo === '15dias') {
    const s = new Date(now); s.setDate(now.getDate() - 15)
    return { from: iso(s), to: iso(now) }
  }
  if (periodo === 'mes') {
    return { from: iso(new Date(now.getFullYear(), now.getMonth(), 1)), to: iso(now) }
  }
  if (periodo === 'mes_passado') {
    return {
      from: iso(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
      to:   iso(new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)),
    }
  }
  if (periodo === 'customizado' && di && df) {
    return { from: new Date(di).toISOString(), to: new Date(df + 'T23:59:59').toISOString() }
  }
  return { from: '2020-01-01T00:00:00.000Z', to: iso(now) }
}

function getNodeWidth(node: FlowNode) {
  return node.type === 'start' ? 160 : 200
}

// ─── Badge de stats em cima de cada nó ────────────────────────────────────

function StatsBadge({ stats, isStart }: { stats: NodeStats; isStart: boolean }) {
  const cor = retColor(stats.retencao)
  return (
    <div style={{
      width: getNodeWidth({ type: isStart ? 'start' : 'page' } as FlowNode),
      background: '#13141f',
      border: '1px solid rgba(45,212,191,0.35)',
      borderRadius: 10,
      overflow: 'hidden',
      marginBottom: 6,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#fff' }}>Retenção</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: isStart ? 'rgba(255,255,255,0.3)' : cor }}>
          {isStart ? '—' : `${stats.retencao}%`}
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#fff' }}>Visualizações</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>{fmtNum(stats.views)}</span>
      </div>
    </div>
  )
}

// ─── Mini card espelhando o visual do FlowCanvas ───────────────────────────

function NodeCard({ node, nodeContents }: { node: FlowNode; nodeContents: Record<string, any[]> }) {
  const isStart  = node.type === 'start'
  const isLink   = node.subtype === 'link'
  const color    = node.type === 'function' ? '#2dd4bf' : '#7c5cfc'
  const w        = getNodeWidth(node)
  const blocks   = nodeContents[node.id] || []

  return (
    <div style={{
      width: w,
      background: '#13141f',
      border: `1.5px solid ${isStart ? 'rgba(45,212,191,0.27)' : 'rgba(255,255,255,0.1)'}`,
      borderRadius: 12,
      overflow: 'hidden',
      pointerEvents: 'none',
    }}>
      {/* Header */}
      <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, background: isStart ? '#0e2a3a' : '#13141f' }}>
        {isStart ? (
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="#2dd4bf" strokeWidth="1.5" strokeLinecap="round">
            <path d="M2 12V4l5-3 5 3v8"/><path d="M5 12V8h4v4"/>
          </svg>
        ) : isLink ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#2dd4bf" strokeWidth="1.5" strokeLinecap="round">
            <path d="M5 7a2.5 2.5 0 003 0l1.5-1.5a2.5 2.5 0 00-3-3L5.5 3"/>
            <path d="M7 5a2.5 2.5 0 00-3 0L2.5 6.5a2.5 2.5 0 003 3L7 9"/>
          </svg>
        ) : (
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }}/>
        )}
        <span style={{ fontSize: 12, fontWeight: 500, color: '#fff', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {node.label}
        </span>
      </div>

      {/* Preview */}
      <div style={{ padding: '6px 14px 10px', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {isLink ? (
          <div style={{ fontSize: 9, color: node.linkUrl ? '#2dd4bf' : 'rgba(255,255,255,0.25)', fontFamily: node.linkUrl ? 'monospace' : 'inherit', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {node.linkUrl || 'Nenhuma URL configurada'}
          </div>
        ) : blocks.length > 0 ? (
          blocks.slice(0, 4).map((block, i) => {
            if (block.compId === 'titulo') return (
              <div key={i} style={{ fontSize: 8, fontWeight: 600, color: 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                T {block.headline || 'Título'}
              </div>
            )
            if (block.compId === 'quiz') return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {block.quizPergunta && <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>? {block.quizPergunta}</div>}
                {(block.quizOpcoesDados || block.quizOpcoes || []).slice(0, 3).map((op: any, j: number) => (
                  <div key={j} style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingLeft: 6 }}>
                    • {typeof op === 'string' ? op : op.titulo}
                  </div>
                ))}
              </div>
            )
            if (block.compId === 'botao') return (
              <div key={i} style={{ fontSize: 8, fontWeight: 600, color: '#7c5cfc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>▶ {block.botaoTexto || 'Botão'}</div>
            )
            if (block.compId === 'imagem') return (
              <div key={i} style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x=".5" y=".5" width="7" height="7" rx="1"/><circle cx="2.5" cy="2.5" r=".8"/><path d=".5 5.5l2-2 1.5 1.5 1-1 2.5 2.5"/></svg>
                Imagem
              </div>
            )
            return (
              <div key={i} style={{ fontSize: 7, color: 'rgba(255,255,255,0.25)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                · {block.label || block.compId}
              </div>
            )
          })
        ) : (
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>Nenhum conteúdo</div>
        )}
      </div>
    </div>
  )
}

// ─── Componente principal ──────────────────────────────────────────────────

export default function EstatisticasPanel({ projectId }: { projectId: string }) {
  const [periodo, setPeriodo]     = useState<Periodo>('7dias')
  const [dropdown, setDropdown]   = useState(false)
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim]     = useState('')
  const [loading, setLoading]     = useState(true)
  const [published, setPublished] = useState(false)

  // Dados vindos do Supabase
  const [flowNodes, setFlowNodes]   = useState<FlowNode[]>([])
  const [flowConns, setFlowConns]   = useState<FlowConn[]>([])
  const [statsMap, setStatsMap]     = useState<Record<string, NodeStats>>({})
  const [nodeContents, setNodeContents] = useState<Record<string, any[]>>({})

  // Canvas pan/zoom
  const stageRef = useRef<HTMLDivElement>(null)
  const [tx, setTx] = useState(60)
  const [ty, setTy] = useState(60)
  const [scale, setScale] = useState(1)
  const isPanning = useRef(false)
  const panStart  = useRef({ x: 0, y: 0, tx: 0, ty: 0 })

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button,input,a,select')) return
    isPanning.current = true
    panStart.current = { x: e.clientX, y: e.clientY, tx, ty }
  }, [tx, ty])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current) return
    setTx(panStart.current.tx + e.clientX - panStart.current.x)
    setTy(panStart.current.ty + e.clientY - panStart.current.y)
  }, [])

  const onMouseUp = useCallback(() => { isPanning.current = false }, [])

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const rect = stageRef.current!.getBoundingClientRect()
    const px = e.clientX - rect.left
    const py = e.clientY - rect.top
    const delta = e.deltaY > 0 ? -0.08 : 0.08
    const ns = Math.max(0.2, Math.min(2, scale + delta))
    setTx(px - (px - tx) * (ns / scale))
    setTy(py - (py - ty) * (ns / scale))
    setScale(ns)
  }, [scale, tx, ty])

  // ── Carregar dados ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!projectId) return
    loadData()
  }, [projectId, periodo, dataInicio, dataFim])

  async function loadData() {
    setLoading(true)
    try {
      // 1. Projeto: published + flow_data
      const { data: project } = await supabase
        .from('projects')
        .select('published, flow_data')
        .eq('id', projectId)
        .single()

      if (!project) { setLoading(false); return }
      setPublished(project.published ?? false)

      const fd = project.flow_data as { nodes: FlowNode[]; connections: FlowConn[] } | null
      if (!fd?.nodes?.length) { setFlowNodes([]); setFlowConns([]); setLoading(false); return }

      setFlowNodes(fd.nodes)
      setFlowConns(fd.connections || [])

      // 2. Conteúdos das páginas (para o mini preview)
      const pageNodes = fd.nodes.filter(n => n.type === 'page')
      if (pageNodes.length > 0) {
        const { data: pages } = await supabase
          .from('pages')
          .select('id, flow_node_id, blocks')
          .eq('project_id', projectId)

        const contentMap: Record<string, any[]> = {}
        pages?.forEach(p => {
          // tenta mapear pelo flow_node_id ou pelo id
          const key = p.flow_node_id || p.id
          if (key) contentMap[key] = p.blocks || []
        })
        setNodeContents(contentMap)
      }

      // 3. Stats do período
      const range = getPeriodRange(periodo, dataInicio, dataFim)
      const { data: statsRaw } = await supabase
        .from('page_stats')
        .select('node_id')
        .eq('project_id', projectId)
        .gte('created_at', range.from)
        .lte('created_at', range.to)

      // Contar views por node_id
      const viewsMap: Record<string, number> = {}
      statsRaw?.forEach(s => {
        viewsMap[s.node_id] = (viewsMap[s.node_id] || 0) + 1
      })

      // Start node = referência para cálculo de retenção
      const startNode = fd.nodes.find(n => n.type === 'start')
      const startViews = startNode ? (viewsMap[startNode.id] || 0) : 0

      // Montar statsMap
      const sm: Record<string, NodeStats> = {}
      fd.nodes.forEach(node => {
        const views = viewsMap[node.id] || 0
        const retencao = node.type === 'start'
          ? 100
          : startViews > 0 ? Math.round((views / startViews) * 100) : 0
        sm[node.id] = { views, retencao }
      })
      setStatsMap(sm)

    } catch (e) {
      console.error('Erro ao carregar estatísticas:', e)
    } finally {
      setLoading(false)
    }
  }

  // ── Totais para topbar ────────────────────────────────────────────────────
  const startNode  = flowNodes.find(n => n.type === 'start')
  const pageNodes  = flowNodes.filter(n => n.type === 'page')
  const lastPage   = pageNodes[pageNodes.length - 1]
  const totalViews = startNode ? (statsMap[startNode.id]?.views ?? 0) : 0
  const conversao  = lastPage ? (statsMap[lastPage.id]?.retencao ?? 0) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', background: '#0f1018' }}>

      {/* ── TOPBAR ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: 52, borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Estatísticas</span>
          {[
            { dot: '#7c5cfc', val: fmtNum(totalViews), label: 'visualizações' },
            { dot: retColor(conversao), val: `${conversao}%`, label: 'conversão' },
          ].map((k, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, background: '#13141f', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: k.dot }}/>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{k.val}</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{k.label}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Centralizar */}
          <button onClick={() => { setTx(60); setTy(60); setScale(1) }}
            style={{ width: 32, height: 32, borderRadius: 8, background: '#13141f', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Centralizar">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round">
              <path d="M1 6.5a5.5 5.5 0 1 0 1.2-3.4L1 1.5v3h3"/>
            </svg>
          </button>

          {/* Atualizar */}
          <button onClick={loadData}
            style={{ width: 32, height: 32, borderRadius: 8, background: '#13141f', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Atualizar">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round">
              <path d="M11 2.5A5.5 5.5 0 1 0 12 7M11 2.5V1M11 2.5H9.5"/>
            </svg>
          </button>

          {/* Dropdown período */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setDropdown(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 10, background: '#13141f', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round">
                <rect x="1" y="2" width="12" height="11" rx="2"/><path d="M1 6h12M5 1v2M9 1v2"/>
              </svg>
              {PERIODO_LABELS[periodo]}
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                style={{ transform: dropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                <path d="M1 3l4 4 4-4"/>
              </svg>
            </button>
            {dropdown && (
              <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', minWidth: 185, background: '#1a1b2a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, overflow: 'hidden', zIndex: 100, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                {(Object.keys(PERIODO_LABELS) as Periodo[]).map(key => (
                  <button key={key} onClick={() => { setPeriodo(key); setDropdown(false) }}
                    style={{ width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: 13, color: periodo === key ? '#a78bfa' : 'rgba(255,255,255,0.65)', background: periodo === key ? 'rgba(124,92,252,0.1)' : 'transparent', border: 'none', cursor: 'pointer' }}>
                    {PERIODO_LABELS[key]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Período customizado */}
      {periodo === 'customizado' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '10px 20px 0', padding: '10px 14px', borderRadius: 12, background: '#13141f', border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
          {(['De', 'Até'] as const).map((lbl, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{lbl}</span>
              <input type="date"
                value={i === 0 ? dataInicio : dataFim}
                onChange={e => i === 0 ? setDataInicio(e.target.value) : setDataFim(e.target.value)}
                style={{ padding: '5px 10px', borderRadius: 8, background: '#0f1018', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 12, outline: 'none' }}/>
            </div>
          ))}
          <button onClick={loadData} style={{ padding: '5px 14px', borderRadius: 8, background: 'rgba(124,92,252,0.2)', color: '#a78bfa', border: '1px solid rgba(124,92,252,0.3)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            Aplicar
          </button>
        </div>
      )}

      {/* ── CANVAS ──────────────────────────────────────────────────────── */}
      <div
        ref={stageRef}
        style={{ flex: 1, overflow: 'hidden', position: 'relative', cursor: 'grab', userSelect: 'none' }}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp} onWheel={onWheel}
      >
        {/* Grid idêntico ao FlowCanvas */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <defs>
            <pattern id="es-sm" width={24*scale} height={24*scale} patternUnits="userSpaceOnUse" x={tx%(24*scale)} y={ty%(24*scale)}>
              <path d={`M ${24*scale} 0 L 0 0 0 ${24*scale}`} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
            </pattern>
            <pattern id="es-lg" width={120*scale} height={120*scale} patternUnits="userSpaceOnUse" x={tx%(120*scale)} y={ty%(120*scale)}>
              <path d={`M ${120*scale} 0 L 0 0 0 ${120*scale}`} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#es-sm)"/>
          <rect width="100%" height="100%" fill="url(#es-lg)"/>
        </svg>

        {/* Loading */}
        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <svg style={{ animation: 'spin 0.8s linear infinite' }} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7c5cfc" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Carregando estatísticas...</span>
            </div>
          </div>
        )}

        {/* Funil não publicado */}
        {!loading && !published && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', padding: 40, borderRadius: 20, background: '#13141f', border: '1px solid rgba(255,255,255,0.07)' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(124,92,252,0.4)" strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom: 16 }}>
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>Funil não publicado</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>Publique o funil na Topbar para ver as estatísticas</p>
            </div>
          </div>
        )}

        {/* Flow vazio */}
        {!loading && published && flowNodes.length === 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', padding: 40, borderRadius: 20, background: '#13141f', border: '1px solid rgba(255,255,255,0.07)' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom: 16 }}>
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-4-6z"/><path d="M14 2v6h6"/>
              </svg>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Nenhum nó no Flow</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>Crie páginas no Flow e publique para ver as estatísticas</p>
            </div>
          </div>
        )}

        {/* ── WORLD: nós + conexões nas posições reais do Flow ── */}
        {!loading && flowNodes.length > 0 && (
          <div style={{ position: 'absolute', top: 0, left: 0, transform: `translate(${tx}px,${ty}px) scale(${scale})`, transformOrigin: '0 0' }}>

            {/* Conexões — iguais ao FlowCanvas */}
            <svg style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
              <defs>
                <marker id="arr-et" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill="#2dd4bf" opacity="0.7"/>
                </marker>
              </defs>
              {flowConns.map((conn, i) => {
                const from = flowNodes.find(n => n.id === conn.from)
                const to   = flowNodes.find(n => n.id === conn.to)
                if (!from || !to) return null
                const sx = from.x + getNodeWidth(from)
                const sy = from.y + 22
                const ex = to.x
                const ey = to.y + 22
                const dx = Math.max(60, Math.abs(ex - sx) * 0.5)
                return (
                  <path key={i}
                    d={`M${sx},${sy} C${sx+dx},${sy} ${ex-dx},${ey} ${ex},${ey}`}
                    stroke="#2dd4bf" strokeWidth="1.5" fill="none"
                    markerEnd="url(#arr-et)" opacity="0.65"
                  />
                )
              })}
            </svg>

            {/* Nós: badge de stats + card visual */}
            {flowNodes.map(node => {
              const stats = statsMap[node.id] ?? { views: 0, retencao: 0 }
              const isStart = node.type === 'start'
              return (
                <div key={node.id} style={{ position: 'absolute', left: node.x, top: node.y }}>
                  <StatsBadge stats={stats} isStart={isStart} />
                  <NodeCard node={node} nodeContents={nodeContents} />
                </div>
              )
            })}
          </div>
        )}

        {/* Zoom controls */}
        <div style={{ position: 'absolute', bottom: 16, left: 16, display: 'flex', flexDirection: 'column', gap: 4, zIndex: 10 }}>
          <button onClick={() => setScale(s => Math.min(2, s + 0.15))} style={{ width: 28, height: 28, background: '#13141f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(255,255,255,0.7)', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
          <div style={{ textAlign: 'center', fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{Math.round(scale * 100)}%</div>
          <button onClick={() => setScale(s => Math.max(0.2, s - 0.15))} style={{ width: 28, height: 28, background: '#13141f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(255,255,255,0.7)', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}