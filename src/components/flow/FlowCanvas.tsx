'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface Node {
  id: string
  type: 'start' | 'page' | 'function'
  subtype?: string
  label: string
  x: number
  y: number
  linkUrl?: string
}

interface Connection {
  from: string
  to: string
}

interface FlowCanvasProps {
  onOpenEditor?: (nodeId: string) => void
  projectId?: string
  nodeContents?: Record<string, any[]>
}

// Painel lateral de edição do nó Link
function LinkPanel({ node, onSave, onClose }: {
  node: Node
  onSave: (url: string) => void
  onClose: () => void
}) {
  const [url, setUrl] = useState(node.linkUrl ?? '')

  return (
    <div style={{
      width: 420, background: '#13141f', borderLeft: '1px solid rgba(255,255,255,0.07)',
      display: 'flex', flexDirection: 'column', flexShrink: 0, zIndex: 30,
    }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(45,212,191,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="#2dd4bf" strokeWidth="1.5" strokeLinecap="round">
            <path d="M6 9a3 3 0 004 0l2-2a3 3 0 00-4-4L7 4"/>
            <path d="M9 7a3 3 0 00-4 0L3 9a3 3 0 004 4l1-1"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', fontFamily: 'Syne, sans-serif' }}>Link</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Redirecionar para URL</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.55)' }}>URL de Destino</label>
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://seusite.com"
            style={{ padding: '11px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(45,212,191,0.35)', color: '#fff', fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' as const }}
            onFocus={e => e.target.style.borderColor = '#2dd4bf'}
            onBlur={e => e.target.style.borderColor = 'rgba(45,212,191,0.35)'}
          />
          {url && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 8, background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.15)' }}>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="#2dd4bf" strokeWidth="1.5" strokeLinecap="round">
                <path d="M1 5.5l3 3 6-6"/>
              </svg>
              <span style={{ fontSize: 11, color: '#2dd4bf' }}>URL configurada</span>
            </div>
          )}
        </div>

        <div style={{ borderRadius: 12, overflow: 'hidden', background: 'rgba(124,92,252,0.06)', border: '1px solid rgba(124,92,252,0.15)' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(124,92,252,0.1)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(124,92,252,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 10, color: '#a78bfa', fontWeight: 700 }}>?</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#a78bfa' }}>Como funcionam as variáveis na URL</span>
          </div>
          <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Exemplo de uso:</div>
            <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
              https://site.com?email={'{{'+'email'+'}}'}&nome={'{{'+'nome'+'}}'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 10 }}>
        <button
          onClick={() => onSave(url)}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 0', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: '#2dd4bf', color: '#0f1018', border: 'none' }}
        >
          Salvar
        </button>
        <button
          onClick={onClose}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', background: 'transparent', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          Fechar
        </button>
      </div>
    </div>
  )
}


// Mini preview dos blocos dentro do nó
function NodePreview({ blocks }: { blocks: any[] }) {
  if (!blocks || blocks.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5">
          <rect x="1" y="1" width="10" height="10" rx="2"/>
          <path d="M4 6h4M4 8h2" strokeLinecap="round"/>
        </svg>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>Nenhum conteúdo</span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {blocks.slice(0, 4).map((block, i) => {
        if (block.compId === 'titulo') return (
          <div key={i} style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            T {block.headline || 'Título'}
          </div>
        )
        if (block.compId === 'texto') return (
          <div key={i} style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            ¶ {block.texto || 'Texto'}
          </div>
        )
        if (block.compId === 'imagem') return (
          <div key={i} style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="0.5" y="0.5" width="7" height="7" rx="1"/><circle cx="2.5" cy="2.5" r="0.8"/><path d="M0.5 5.5l2-2 1.5 1.5 1-1 2.5 2.5"/></svg>
            Imagem
          </div>
        )
        if (block.compId === 'botao') return (
          <div key={i} style={{ fontSize: 8, fontWeight: 600, color: '#7c5cfc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            ▶ {block.botaoTexto || 'Botão'}
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
        if (block.compId === 'progresso') return (
          <div key={i} style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${block.progress || 0}%`, background: block.progressColor || '#7c5cfc', borderRadius: 99 }}/>
          </div>
        )
        if (block.compId === 'cabecalho') return (
          <div key={i} style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="0.5" y="0.5" width="7" height="3" rx="0.5"/><path d="M0.5 6h4"/></svg>
            Cabeçalho
          </div>
        )
        return (
          <div key={i} style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            · {block.label || block.compId}
          </div>
        )
      })}
      {blocks.length > 4 && (
        <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.2)' }}>+{blocks.length - 4} mais</div>
      )}
    </div>
  )
}

export default function FlowCanvas({ onOpenEditor, projectId, nodeContents = {} }: FlowCanvasProps) {
  const [nodes, setNodes] = useState<Node[]>([
    { id: 'start', type: 'start', label: 'Início', x: 200, y: 300 }
  ])
  const [connections, setConnections] = useState<Connection[]>([])
  const [tx, setTx] = useState(0)
  const [ty, setTy] = useState(0)
  const [scale, setScale] = useState(1)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0, tx: 0, ty: 0 })
  const [draggingNode, setDraggingNode] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [openMenu, setOpenMenu] = useState<'page' | 'function' | null>(null)
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [hoveredConn, setHoveredConn] = useState<number | null>(null)
  const [editingLinkNode, setEditingLinkNode] = useState<Node | null>(null)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(0)
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Carrega dados do projeto ao montar
  useEffect(() => {
    if (!projectId) return
    async function loadFlow() {
      const { data } = await supabase
        .from('projects')
        .select('flow_data')
        .eq('id', projectId)
        .single()

      if (data?.flow_data) {
        const { nodes: savedNodes, connections: savedConns } = data.flow_data
        if (savedNodes?.length) setNodes(savedNodes)
        if (savedConns?.length) setConnections(savedConns)
      }
    }
    loadFlow()
  }, [projectId])

  // Salva automaticamente com debounce de 1.5s
  const saveFlow = useCallback(async (nodesToSave: Node[], connsToSave: Connection[]) => {
    if (!projectId) return
    setSaving(true)
    await supabase
      .from('projects')
      .update({ flow_data: { nodes: nodesToSave, connections: connsToSave } })
      .eq('id', projectId)
    setSaving(false)
    setLastSaved(new Date())
  }, [projectId])

  useEffect(() => {
    if (!projectId) return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      saveFlow(nodes, connections)
    }, 1500)
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current) }
  }, [nodes, connections, saveFlow, projectId])

  function addNode(type: 'page' | 'function', subtype: string, label: string) {
    const id = `node_${++idRef.current}`
    const centerX = (-tx + (stageRef.current?.clientWidth ?? 800) / 2) / scale - 100
    const centerY = (-ty + (stageRef.current?.clientHeight ?? 600) / 2) / scale - 50
    setNodes(prev => [...prev, { id, type, subtype, label, x: centerX, y: centerY }])
    setOpenMenu(null)
  }

  function deleteNode(id: string) {
    if (id === 'start') return
    setNodes(prev => prev.filter(n => n.id !== id))
    setConnections(prev => prev.filter(c => c.from !== id && c.to !== id))
    setSelectedNode(null)
    if (editingLinkNode?.id === id) setEditingLinkNode(null)
  }

  function duplicateNode(id: string) {
    const node = nodes.find(n => n.id === id)
    if (!node) return
    const newId = `node_${++idRef.current}`
    setNodes(prev => [...prev, { ...node, id: newId, x: node.x + 40, y: node.y + 40 }])
    setSelectedNode(null)
  }

  function saveLinkUrl(nodeId: string, url: string) {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, linkUrl: url } : n))
    setEditingLinkNode(null)
    setSelectedNode(null)
  }

  function handleEditNode(node: Node) {
    if (node.subtype === 'link') {
      setEditingLinkNode(node)
      setSelectedNode(null)
    } else {
      onOpenEditor?.(node.id)
      setSelectedNode(null)
    }
  }

  function removeConnection(idx: number) {
    setConnections(prev => prev.filter((_, i) => i !== idx))
  }

  function handleStageMouseDown(e: React.MouseEvent) {
    const target = e.target as HTMLElement
    if (target !== stageRef.current && !target.classList.contains('grid-bg')) return
    if (connectingFrom) { setConnectingFrom(null); return }
    setIsPanning(true)
    setPanStart({ x: e.clientX, y: e.clientY, tx, ty })
    setOpenMenu(null)
    setSelectedNode(null)
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (isPanning) {
      setTx(panStart.tx + (e.clientX - panStart.x))
      setTy(panStart.ty + (e.clientY - panStart.y))
    }
    if (draggingNode) {
      const rect = stageRef.current!.getBoundingClientRect()
      const wx = (e.clientX - rect.left - tx) / scale
      const wy = (e.clientY - rect.top - ty) / scale
      setNodes(prev => prev.map(n =>
        n.id === draggingNode ? { ...n, x: wx - dragOffset.x, y: wy - dragOffset.y } : n
      ))
    }
    if (connectingFrom) {
      const rect = stageRef.current!.getBoundingClientRect()
      setMousePos({
        x: (e.clientX - rect.left - tx) / scale,
        y: (e.clientY - rect.top - ty) / scale,
      })
    }
  }

  function handleMouseUp() {
    setIsPanning(false)
    setDraggingNode(null)
  }

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault()
    const rect = stageRef.current!.getBoundingClientRect()
    const px = e.clientX - rect.left
    const py = e.clientY - rect.top
    const delta = e.deltaY > 0 ? -0.08 : 0.08
    const ns = Math.max(0.2, Math.min(2, scale + delta))
    setTx(px - (px - tx) * (ns / scale))
    setTy(py - (py - ty) * (ns / scale))
    setScale(ns)
  }

  function handleNodeMouseDown(e: React.MouseEvent, nodeId: string) {
    e.stopPropagation()
    if (connectingFrom) {
      if (connectingFrom !== nodeId) {
        const exists = connections.find(c => c.from === connectingFrom && c.to === nodeId)
        if (!exists) setConnections(prev => [...prev, { from: connectingFrom, to: nodeId }])
      }
      setConnectingFrom(null)
      return
    }
    setSelectedNode(nodeId)
    const rect = stageRef.current!.getBoundingClientRect()
    const node = nodes.find(n => n.id === nodeId)!
    const wx = (e.clientX - rect.left - tx) / scale
    const wy = (e.clientY - rect.top - ty) / scale
    setDraggingNode(nodeId)
    setDragOffset({ x: wx - node.x, y: wy - node.y })
  }

  function startConnecting(e: React.MouseEvent, nodeId: string) {
    e.stopPropagation()
    const node = nodes.find(n => n.id === nodeId)!
    const w = getNodeWidth(node)
    setMousePos({ x: node.x + w + 10, y: node.y + 22 })
    setConnectingFrom(nodeId)
  }

  function getNodeWidth(node: Node) {
    return node.type === 'start' ? 160 : 200
  }

  function getMidpoint(from: Node, to: Node) {
    const sx = from.x + getNodeWidth(from), sy = from.y + 22
    const ex = to.x, ey = to.y + 22
    return { x: (sx + ex) / 2, y: (sy + ey) / 2 }
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 48px)' }}>

      {/* Sidebar */}
      <div style={{ width: 176, background: '#13141f', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', padding: 12, gap: 8, flexShrink: 0, zIndex: 10 }}>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setOpenMenu(openMenu === 'page' ? null : 'page')}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s', background: openMenu === 'page' ? '#7c5cfc' : '#1a1b2a', border: openMenu === 'page' ? '1px solid #7c5cfc' : '1px solid rgba(255,255,255,0.08)', color: openMenu === 'page' ? '#fff' : 'rgba(255,255,255,0.7)' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M8 1H3a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V6L8 1z"/><path d="M8 1v5h5"/>
            </svg>
            Criar Página
          </button>
          {openMenu === 'page' && (
            <div style={{ position: 'absolute', left: '100%', top: 0, marginLeft: 8, width: 192, background: '#13141f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, overflow: 'hidden', zIndex: 50, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Nova Página</div>
              <button onClick={() => addNode('page', 'nova', 'Nova Página')}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' as const }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#1a1b2a', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M8 1H3a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V6L8 1z"/><path d="M8 1v5h5M5 8h4M7 6v4"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>Nova Página</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>Página em branco</div>
                </div>
              </button>
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <button onClick={() => setOpenMenu(openMenu === 'function' ? null : 'function')}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s', background: openMenu === 'function' ? '#2dd4bf' : '#1a1b2a', border: openMenu === 'function' ? '1px solid #2dd4bf' : '1px solid rgba(255,255,255,0.08)', color: openMenu === 'function' ? '#0f1018' : 'rgba(255,255,255,0.7)' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M2 4l3 6 2-4 2 4 3-6"/>
            </svg>
            Criar Função
          </button>
          {openMenu === 'function' && (
            <div style={{ position: 'absolute', left: '100%', top: 0, marginLeft: 8, width: 192, background: '#13141f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, overflow: 'hidden', zIndex: 50, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Nova Função</div>
              <button onClick={() => addNode('function', 'link', 'Link')}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' as const }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#1a1b2a', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#2dd4bf" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M6 8a3 3 0 004 0l2-2a3 3 0 00-4-4L7 3"/><path d="M8 6a3 3 0 00-4 0L2 8a3 3 0 004 4l1-1"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>Link</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>Redirecionar URL</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Status de salvamento */}
        <div style={{ marginTop: 'auto', padding: '8px 4px' }}>
          {saving ? (
            <div style={{ fontSize: 10, color: '#a78bfa', display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#a78bfa', animation: 'pulse 1s infinite' }}/>
              Salvando...
            </div>
          ) : lastSaved ? (
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#22d387" strokeWidth="1.5" strokeLinecap="round">
                <path d="M1 5l3 3 5-5"/>
              </svg>
              Salvo
            </div>
          ) : null}
        </div>
      </div>

      {/* Canvas */}
      <div ref={stageRef}
        style={{ flex: 1, overflow: 'hidden', position: 'relative', cursor: connectingFrom ? 'crosshair' : isPanning ? 'grabbing' : 'grab', background: '#0f1018' }}
        onMouseDown={handleStageMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onWheel={handleWheel}>

        <svg className="grid-bg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <defs>
            <pattern id="grid-sm" width={24*scale} height={24*scale} patternUnits="userSpaceOnUse" x={tx%(24*scale)} y={ty%(24*scale)}>
              <path d={`M ${24*scale} 0 L 0 0 0 ${24*scale}`} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
            </pattern>
            <pattern id="grid-lg" width={120*scale} height={120*scale} patternUnits="userSpaceOnUse" x={tx%(120*scale)} y={ty%(120*scale)}>
              <path d={`M ${120*scale} 0 L 0 0 0 ${120*scale}`} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-sm)"/>
          <rect width="100%" height="100%" fill="url(#grid-lg)"/>
        </svg>

        <div style={{ position: 'absolute', top: 0, left: 0, transform: `translate(${tx}px,${ty}px) scale(${scale})`, transformOrigin: '0 0' }}>
          <svg style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
            <defs>
              <marker id="arr" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#2dd4bf" opacity="0.8"/>
              </marker>
            </defs>
            {connections.map((conn, i) => {
              const from = nodes.find(n => n.id === conn.from)
              const to = nodes.find(n => n.id === conn.to)
              if (!from || !to) return null
              const sx = from.x + getNodeWidth(from), sy = from.y + 22
              const ex = to.x, ey = to.y + 22
              const dx = Math.max(60, Math.abs(ex-sx)*0.5)
              const d = `M${sx},${sy} C${sx+dx},${sy} ${ex-dx},${ey} ${ex},${ey}`
              const mid = getMidpoint(from, to)
              const isHov = hoveredConn === i
              return (
                <g key={i}>
                  <path d={d} stroke="#2dd4bf" strokeWidth="1.5" fill="none" markerEnd="url(#arr)" opacity="0.7"/>
                  <path d={d} stroke="transparent" strokeWidth="20" fill="none" style={{ cursor: 'pointer' }} onMouseEnter={() => setHoveredConn(i)} onMouseLeave={() => setHoveredConn(null)}/>
                  {isHov && (
                    <g style={{ cursor: 'pointer' }} onMouseEnter={() => setHoveredConn(i)} onMouseLeave={() => setHoveredConn(null)} onClick={() => removeConnection(i)}>
                      <circle cx={mid.x} cy={mid.y} r="10" fill="#13141f" stroke="#f43f5e" strokeWidth="1.5"/>
                      <line x1={mid.x-4} y1={mid.y-4} x2={mid.x+4} y2={mid.y+4} stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round"/>
                      <line x1={mid.x+4} y1={mid.y-4} x2={mid.x-4} y2={mid.y+4} stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round"/>
                    </g>
                  )}
                </g>
              )
            })}
            {connectingFrom && (() => {
              const from = nodes.find(n => n.id === connectingFrom)
              if (!from) return null
              const sx = from.x + getNodeWidth(from), sy = from.y + 22
              const dx = Math.max(60, Math.abs(mousePos.x-sx)*0.5)
              const d = `M${sx},${sy} C${sx+dx},${sy} ${mousePos.x-dx},${mousePos.y} ${mousePos.x},${mousePos.y}`
              return <path d={d} stroke="#2dd4bf" strokeWidth="1.5" fill="none" strokeDasharray="6 3" opacity="0.6"/>
            })()}
          </svg>

          {(() => {
            const s = nodes.find(n => n.id === 'start')!
            return (
              <div style={{ position: 'absolute', left: s.x, top: s.y }} onMouseDown={e => handleNodeMouseDown(e, 'start')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, cursor: 'move', position: 'relative', minWidth: 160, background: '#0e2a3a', border: `1.5px solid ${selectedNode === 'start' ? '#2dd4bf' : 'rgba(45,212,191,0.27)'}` }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#2dd4bf" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M2 12V4l5-3 5 3v8"/><path d="M5 12V8h4v4"/>
                  </svg>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>Início</span>
                  <div style={{ position: 'absolute', right: -10, top: '50%', transform: 'translateY(-50%)', width: 20, height: 20, borderRadius: '50%', background: '#0f1018', border: '2px solid #2dd4bf', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'crosshair', zIndex: 10 }}
                    onMouseDown={e => { e.stopPropagation(); startConnecting(e, 'start') }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2dd4bf' }}/>
                  </div>
                </div>
              </div>
            )
          })()}

          {nodes.filter(n => n.id !== 'start').map(node => {
            const isSelected = selectedNode === node.id
            const isLink = node.subtype === 'link'
            const color = node.type === 'function' ? '#2dd4bf' : '#7c5cfc'
            const hasUrl = isLink && node.linkUrl

            return (
              <div key={node.id} style={{ position: 'absolute', left: node.x, top: node.y, width: 200 }} onMouseDown={e => handleNodeMouseDown(e, node.id)}>
                {isSelected && (
                  <div style={{ position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 2, background: '#13141f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '6px', zIndex: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}
                    onMouseDown={e => e.stopPropagation()}>
                    {[
                      { title: 'Editar', color: '#a78bfa', onClick: () => handleEditNode(node), icon: <path d="M1 12l2-2 7.5-7.5a1 1 0 00-1.5-1.5L1.5 9.5 1 12z"/> },
                      { title: 'Duplicar', color: 'rgba(255,255,255,0.5)', onClick: () => duplicateNode(node.id), icon: <><rect x="4" y="4" width="8" height="8" rx="1.5"/><path d="M1 9V1h8v3"/></> },
                      { title: 'Deletar', color: '#f43f5e', onClick: () => deleteNode(node.id), icon: <path d="M2 3.5h9M5 3.5V2h3v1.5M4 5v6M9 5v6"/> },
                    ].map((btn, i) => (
                      <button key={i} title={btn.title} onClick={btn.onClick}
                        style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer' }}>
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke={btn.color} strokeWidth="1.5" strokeLinecap="round">{btn.icon}</svg>
                      </button>
                    ))}
                  </div>
                )}

                <div style={{ borderRadius: 12, background: '#13141f', border: `1.5px solid ${isSelected ? color : 'rgba(255,255,255,0.1)'}`, boxShadow: isSelected ? `0 0 0 3px ${color}22` : 'none', position: 'relative' }}>
                  <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'move' }}>
                    {isLink ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#2dd4bf" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M5 7a2.5 2.5 0 003 0l1.5-1.5a2.5 2.5 0 00-3-3L5.5 3"/>
                        <path d="M7 5a2.5 2.5 0 00-3 0L2.5 6.5a2.5 2.5 0 003 3L7 9"/>
                      </svg>
                    ) : (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }}/>
                    )}
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#fff', flex: 1 }}>{node.label}</span>
                  </div>
                  <div style={{ padding: '0 16px 12px' }}>
                    {isLink ? (
                      <div style={{ fontSize: 10, color: hasUrl ? '#2dd4bf' : 'rgba(255,255,255,0.25)', fontFamily: hasUrl ? 'monospace' : 'inherit', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                        {hasUrl ? node.linkUrl : 'Nenhuma URL configurada'}
                      </div>
                    ) : (
                      <NodePreview blocks={nodeContents[node.id] || []} />
                    )}
                  </div>
                  <div style={{ position: 'absolute', right: -10, top: '50%', transform: 'translateY(-50%)', width: 20, height: 20, borderRadius: '50%', background: '#0f1018', border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'crosshair', zIndex: 10 }}
                    onMouseDown={e => { e.stopPropagation(); startConnecting(e, node.id) }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }}/>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ position: 'absolute', bottom: 16, left: 16, display: 'flex', flexDirection: 'column', gap: 4, zIndex: 10 }}>
          <button onClick={() => setScale(s => Math.min(2, s+0.15))} style={{ width: 28, height: 28, background: '#13141f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(255,255,255,0.6)', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
          <div style={{ width: 28, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{Math.round(scale*100)}%</div>
          <button onClick={() => setScale(s => Math.max(0.2, s-0.15))} style={{ width: 28, height: 28, background: '#13141f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(255,255,255,0.6)', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
        </div>

        {connectingFrom && (
          <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', background: '#13141f', border: '1px solid rgba(45,212,191,0.3)', borderRadius: 12, padding: '8px 16px', fontSize: 12, color: '#2dd4bf', zIndex: 20 }}>
            Clique em outro nó para conectar · ESC para cancelar
          </div>
        )}
      </div>

      {editingLinkNode && (
        <LinkPanel
          node={editingLinkNode}
          onSave={(url) => saveLinkUrl(editingLinkNode.id, url)}
          onClose={() => setEditingLinkNode(null)}
        />
      )}
    </div>
  )
}