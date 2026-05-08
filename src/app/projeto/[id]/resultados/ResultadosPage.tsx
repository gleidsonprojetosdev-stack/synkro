'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// ─── Tipos ──────────────────────────────────────────────────────────────────

interface PageStat {
  id: string
  project_id: string
  node_id: string
  created_at: string
}

interface FlowNode {
  id: string
  label: string
  type: string
}

interface LeadRow {
  session: string
  entrou_em: string
  paginas_vistas: number
  ultima_pagina: string
  concluiu: boolean
}

interface FunilStep {
  nodeId: string
  label: string
  visitas: number
  pctTotal: number
  pctAnterior: number | null
  maiorAbandono: boolean
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmt(date: string) {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'agora'
  if (min < 60) return `${min}min atrás`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h atrás`
  return `${Math.floor(h / 24)}d atrás`
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color, icon }: {
  label: string
  value: string | number
  sub?: string
  color: string
  icon: React.ReactNode
}) {
  return (
    <div style={{
      background: '#0d0e18',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 16,
      padding: '18px 20px',
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', lineHeight: 1, fontFamily: '"Inter", sans-serif' }}>{value}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color, marginTop: 2, fontWeight: 600 }}>{sub}</div>}
      </div>
    </div>
  )
}

// ─── Mini Bar Chart ──────────────────────────────────────────────────────────

function MiniBarChart({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>{d.value}</div>
          <div style={{
            width: '100%', borderRadius: 4,
            height: `${Math.max((d.value / max) * 64, d.value > 0 ? 4 : 0)}px`,
            background: `linear-gradient(180deg, ${color}, ${color}88)`,
            transition: 'height 0.5s ease',
          }}/>
          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>{d.label}</div>
        </div>
      ))}
    </div>
  )
}

// ─── Funil de Conversão ──────────────────────────────────────────────────────

function FunilConversao({ steps }: { steps: FunilStep[] }) {
  if (steps.length === 0) {
    return (
      <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>
        Crie páginas no Flow primeiro
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {steps.map((step, i) => {
        const corBarra = step.maiorAbandono ? '#f43f5e' : step === steps[steps.length - 1] ? '#22d387' : '#7c5cfc'
        const corPct = step.maiorAbandono ? '#f43f5e' : step === steps[steps.length - 1] ? '#22d387' : 'rgba(255,255,255,0.4)'

        return (
          <div key={step.nodeId}>
            {/* Linha da passagem entre páginas */}
            {i > 0 && step.pctAnterior !== null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 148, marginBottom: 4 }}>
                <div style={{ fontSize: 10, color: step.maiorAbandono ? '#f43f5e' : step.pctAnterior >= 70 ? '#22d387' : '#f59e0b', fontWeight: 500 }}>
                  ↓ {step.pctAnterior}% continuaram
                  {step.maiorAbandono && <span style={{ marginLeft: 6, background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.25)', borderRadius: 99, padding: '1px 8px', fontSize: 9, fontWeight: 700 }}>⚠ maior abandono</span>}
                </div>
              </div>
            )}

            {/* Barra da página */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 136, fontSize: 11, color: 'rgba(255,255,255,0.55)', textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexShrink: 0 }}>
                {step.label}
              </div>
              <div style={{ flex: 1, position: 'relative', height: 32 }}>
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.04)', borderRadius: 6, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.max(step.pctTotal, step.visitas > 0 ? 2 : 0)}%`, background: `linear-gradient(90deg, ${corBarra}, ${corBarra}cc)`, borderRadius: 6, transition: 'width 0.6s ease' }}/>
                </div>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 10px', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>
                    {step.visitas} {i === steps.length - 1 ? 'conversões' : 'visitas'}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: corPct }}>{step.pctTotal}%</span>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Componente principal ────────────────────────────────────────────────────

export default function ResultadosPage() {
  const { id: projectId } = useParams<{ id: string }>()

  const [stats, setStats] = useState<PageStat[]>([])
  const [nodes, setNodes] = useState<FlowNode[]>([])
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState<'7d' | '30d' | 'all'>('7d')
  const [search, setSearch] = useState('')
  const [abaAtiva, setAbaAtiva] = useState<'visitas' | 'funil'>('visitas')

  useEffect(() => {
    if (!projectId) return
    load()
  }, [projectId, periodo])

  async function load() {
    setLoading(true)

    const { data: proj } = await supabase
      .from('projects')
      .select('flow_data')
      .eq('id', projectId)
      .single()

    if (proj?.flow_data?.nodes) {
      setNodes(proj.flow_data.nodes.filter((n: FlowNode) => n.type === 'start' || n.type === 'page'))
    }

    let query = supabase
      .from('page_stats')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (periodo === '7d') {
      const d = new Date(); d.setDate(d.getDate() - 7)
      query = query.gte('created_at', d.toISOString())
    } else if (periodo === '30d') {
      const d = new Date(); d.setDate(d.getDate() - 30)
      query = query.gte('created_at', d.toISOString())
    }

    const { data } = await query
    setStats(data || [])
    setLoading(false)
  }

  // ── Métricas ─────────────────────────────────────────────────────────────

  const totalVisitas = stats.length
  const uniqueSessions = new Set(stats.map(s => `${s.node_id}_${s.created_at.slice(0, 10)}`)).size
  const lastNodeId = nodes[nodes.length - 1]?.id
  const conversoes = stats.filter(s => s.node_id === lastNodeId).length
  const taxaConversao = totalVisitas > 0 ? Math.round((conversoes / totalVisitas) * 100) : 0

  const visitasPorDia = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const key = d.toISOString().slice(0, 10)
    const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    const value = stats.filter(s => s.created_at.startsWith(key)).length
    return { label, value }
  })

  const visitasPorPagina = nodes.map(n => ({
    label: n.label || 'Página',
    value: stats.filter(s => s.node_id === n.id).length,
    nodeId: n.id,
  }))

  const primeiroTotal = visitasPorPagina[0]?.value || 1

  // ── Funil de Conversão ────────────────────────────────────────────────────

  const funilSteps: FunilStep[] = visitasPorPagina.map((p, i) => {
    const anterior = i > 0 ? visitasPorPagina[i - 1].value : null
    const pctAnterior = anterior && anterior > 0 ? Math.round((p.value / anterior) * 100) : null
    const pctTotal = primeiroTotal > 0 ? Math.round((p.value / primeiroTotal) * 100) : 0
    return { nodeId: p.nodeId, label: p.label, visitas: p.value, pctTotal, pctAnterior, maiorAbandono: false }
  })

  // Detecta maior abandono (menor % de passagem entre páginas consecutivas)
  if (funilSteps.length > 1) {
    let menorPct = Infinity
    let menorIdx = -1
    funilSteps.forEach((s, i) => {
      if (i > 0 && s.pctAnterior !== null && s.pctAnterior < menorPct) {
        menorPct = s.pctAnterior
        menorIdx = i
      }
    })
    if (menorIdx >= 0) funilSteps[menorIdx].maiorAbandono = true
  }

  // ── Leads ────────────────────────────────────────────────────────────────

  const leadsMap = new Map<string, LeadRow>()
  stats.forEach(s => {
    const sessionKey = s.created_at.slice(0, 13)
    const existing = leadsMap.get(sessionKey)
    const nodeName = nodes.find(n => n.id === s.node_id)?.label || 'Página'
    if (!existing) {
      leadsMap.set(sessionKey, {
        session: sessionKey,
        entrou_em: s.created_at,
        paginas_vistas: 1,
        ultima_pagina: nodeName,
        concluiu: s.node_id === lastNodeId,
      })
    } else {
      existing.paginas_vistas++
      existing.ultima_pagina = nodeName
      if (s.node_id === lastNodeId) existing.concluiu = true
    }
  })
  const leads = Array.from(leadsMap.values()).filter(l =>
    search ? l.ultima_pagina.toLowerCase().includes(search.toLowerCase()) : true
  )

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#080910', padding: '32px', fontFamily: '"Inter", system-ui, sans-serif' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.3px' }}>Resultados</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
            Acompanhe o desempenho do seu funil em tempo real
          </p>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {(['7d', '30d', 'all'] as const).map(p => (
            <button key={p} onClick={() => setPeriodo(p)} style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer',
              background: periodo === p ? '#7c5cfc' : 'rgba(255,255,255,0.05)',
              color: periodo === p ? '#fff' : 'rgba(255,255,255,0.4)',
              border: `1px solid ${periodo === p ? '#7c5cfc' : 'rgba(255,255,255,0.08)'}`,
              transition: 'all 0.15s',
              fontFamily: 'inherit',
            }}>
              {p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : 'Tudo'}
            </button>
          ))}
          <button onClick={load} style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'inherit' }}>
            ↻
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid rgba(124,92,252,0.2)', borderTopColor: '#7c5cfc', animation: 'spin 0.8s linear infinite' }}/>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : (
        <>
          {/* Stats cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
            <StatCard
              label="Total de visitas"
              value={totalVisitas}
              color="#7c5cfc"
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>}
            />
            <StatCard
              label="Sessões únicas"
              value={uniqueSessions}
              color="#2dd4bf"
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20"/></svg>}
            />
            <StatCard
              label="Conversões"
              value={conversoes}
              sub={lastNodeId ? 'última página' : ''}
              color="#22d387"
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22d387" strokeWidth="1.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>}
            />
            <StatCard
              label="Taxa de conversão"
              value={`${taxaConversao}%`}
              sub={taxaConversao > 30 ? '🔥 Excelente' : taxaConversao > 10 ? '👍 Boa' : totalVisitas === 0 ? 'Sem dados' : '📈 Melhorar'}
              color="#f59e0b"
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>}
            />
          </div>

          {/* Gráficos com abas */}
          <div style={{ background: '#0d0e18', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, marginBottom: 24, overflow: 'hidden' }}>

            {/* Abas */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {([
                { key: 'visitas', label: 'Visitas por dia' },
                { key: 'funil', label: 'Funil de conversão' },
              ] as const).map(aba => (
                <button key={aba.key} onClick={() => setAbaAtiva(aba.key)} style={{
                  padding: '14px 20px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                  background: 'transparent', border: 'none',
                  color: abaAtiva === aba.key ? '#fff' : 'rgba(255,255,255,0.35)',
                  borderBottom: `2px solid ${abaAtiva === aba.key ? '#7c5cfc' : 'transparent'}`,
                  transition: 'all 0.15s',
                }}>
                  {aba.label}
                </button>
              ))}
            </div>

            <div style={{ padding: '20px' }}>
              {abaAtiva === 'visitas' && (
                <>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>Últimos 7 dias</div>
                  {visitasPorDia.every(d => d.value === 0) ? (
                    <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>
                      Nenhuma visita ainda
                    </div>
                  ) : (
                    <MiniBarChart data={visitasPorDia} color="#7c5cfc"/>
                  )}
                </>
              )}

              {abaAtiva === 'funil' && (
                <>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>
                    Taxa de passagem entre páginas — identifique onde os leads abandonam
                  </div>
                  <FunilConversao steps={funilSteps}/>
                </>
              )}
            </div>
          </div>

          {/* Tabela de leads */}
          <div style={{ background: '#0d0e18', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Leads</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{leads.length} registros encontrados</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="5.5" cy="5.5" r="4"/><path d="M10 10l2 2"/>
                </svg>
                <input
                  type="text"
                  placeholder="Buscar por página..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 12, width: 150, fontFamily: 'inherit' }}
                />
              </div>
            </div>

            {leads.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
                  {totalVisitas === 0 ? 'Nenhum lead ainda' : 'Nenhum resultado para essa busca'}
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>
                  {totalVisitas === 0
                    ? 'Publique seu funil e compartilhe o link para começar a receber leads'
                    : 'Tente outro termo de busca'
                  }
                </div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      {['Entrada', 'Tempo', 'Páginas vistas', 'Última página', 'Status'].map((h, i) => (
                        <th key={i} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={{ padding: '12px 20px', fontSize: 12, color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap' }}>
                          {fmt(lead.entrou_em)}
                        </td>
                        <td style={{ padding: '12px 20px', fontSize: 12, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>
                          {timeAgo(lead.entrou_em)}
                        </td>
                        <td style={{ padding: '12px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{lead.paginas_vistas}</div>
                            <div style={{ flex: 1, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.06)', maxWidth: 60, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${Math.min((lead.paginas_vistas / Math.max(nodes.length, 1)) * 100, 100)}%`, borderRadius: 99, background: '#7c5cfc' }}/>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 20px', fontSize: 12, color: 'rgba(255,255,255,0.6)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {lead.ultima_pagina}
                        </td>
                        <td style={{ padding: '12px 20px' }}>
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '3px 10px', borderRadius: 99,
                            background: lead.concluiu ? 'rgba(34,211,135,0.1)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${lead.concluiu ? 'rgba(34,211,135,0.25)' : 'rgba(255,255,255,0.08)'}`,
                          }}>
                            <div style={{ width: 5, height: 5, borderRadius: '50%', background: lead.concluiu ? '#22d387' : 'rgba(255,255,255,0.3)' }}/>
                            <span style={{ fontSize: 10, fontWeight: 600, color: lead.concluiu ? '#22d387' : 'rgba(255,255,255,0.4)' }}>
                              {lead.concluiu ? 'Converteu' : 'Em progresso'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}