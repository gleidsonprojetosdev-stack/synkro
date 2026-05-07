'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useProjects } from '@/hooks/useProjects'

export default function HomePage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { projects, loading, createProject, deleteProject } = useProjects()
  const router = useRouter()
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth')
  }, [user, authLoading])

  async function handleCreate() {
    setCreating(true)
    const project = await createProject('Novo Projeto')
    if (project?.id) router.push(`/projeto/${project.id}/flow`)
    setCreating(false)
  }

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    if (!confirm('Tem certeza que deseja deletar este projeto?')) return
    setDeletingId(id)
    await deleteProject(id)
    setDeletingId(null)
  }

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const publishedCount = projects.filter(p => p.published).length
  const draftCount = projects.filter(p => !p.published).length

  if (authLoading || !user) return (
    <div style={{ minHeight: '100vh', background: '#080910', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ position: 'relative', width: 44, height: 44 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(124,92,252,0.15)' }}/>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#7c5cfc', animation: 'spin 0.8s linear infinite' }}/>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080910',
      fontFamily: '"Inter", system-ui, sans-serif',
      color: '#fff',
      opacity: mounted ? 1 : 0,
      transition: 'opacity 0.4s ease',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(124,92,252,0.3); border-radius: 99px; }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes shimmer { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(124,92,252,0.4)} 50%{box-shadow:0 0 0 8px rgba(124,92,252,0)} }
        .card-hover { transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease; }
        .card-hover:hover { transform: translateY(-3px); border-color: rgba(124,92,252,0.35) !important; box-shadow: 0 12px 40px rgba(124,92,252,0.12); }
        .btn-primary { transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease; }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(124,92,252,0.5) !important; }
        .btn-primary:active { transform: translateY(0); }
        .stat-card { animation: fadeUp 0.5s ease both; }
      `}</style>

      {/* ── TOPBAR ─────────────────────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        height: 60,
        background: 'rgba(8,9,16,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center',
        padding: '0 32px',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 20, fontWeight: 800, fontFamily: '"Inter", sans-serif', letterSpacing: '-0.5px' }}>
            Syn<span style={{ color: '#a78bfa' }}>kro</span>
          </span>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#7c5cfc,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
              {user.email?.[0]?.toUpperCase()}
            </div>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</span>
          </div>
          <button
            onClick={signOut}
            style={{ padding: '7px 14px', borderRadius: 9, background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
          >
            Sair
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1160, margin: '0 auto', padding: '48px 32px' }}>

        {/* ── HERO ROW ─────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 40, gap: 20, flexWrap: 'wrap' }}>
          <div style={{ animation: 'fadeUp 0.4s ease both' }}>
            <h1 style={{ fontSize: 36, fontWeight: 800, fontFamily: '"Inter", sans-serif', letterSpacing: '-0.5px', lineHeight: 1.1, marginBottom: 8 }}>
              Meus Funis
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
              {projects.length === 0
                ? 'Crie seu primeiro funil e comece a converter'
                : `${projects.length} funil${projects.length !== 1 ? 's' : ''} • ${publishedCount} ativo${publishedCount !== 1 ? 's' : ''}`
              }
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', animation: 'fadeUp 0.4s ease 0.1s both' }}>
            {/* Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', height: 40, borderRadius: 11, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', transition: 'border-color 0.2s' }}
              onFocus={() => {}} >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="5.5" cy="5.5" r="4"/><path d="M10 10l2 2"/>
              </svg>
              <input
                type="text"
                placeholder="Buscar projetos..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 13, width: 160, fontFamily: 'inherit' }}
              />
            </div>

            {/* New project button */}
            <button
              onClick={handleCreate}
              disabled={creating}
              className="btn-primary"
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '0 20px', height: 40, borderRadius: 11,
                background: creating ? 'rgba(124,92,252,0.5)' : 'linear-gradient(135deg,#7c5cfc,#a78bfa)',
                border: 'none', color: '#fff', fontSize: 13, fontWeight: 600,
                cursor: creating ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 16px rgba(124,92,252,0.35)',
                fontFamily: 'inherit',
              }}
            >
              {creating ? (
                <svg style={{ animation: 'spin 0.7s linear infinite' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M7 1v12M1 7h12"/>
                </svg>
              )}
              {creating ? 'Criando...' : 'Novo Projeto'}
            </button>
          </div>
        </div>

        {/* ── STATS BAR ────────────────────────────────────────────────── */}
        {projects.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 40 }}>
            {[
              {
                label: 'Total de funis',
                value: projects.length,
                color: '#7c5cfc',
                bg: 'rgba(124,92,252,0.08)',
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M3 3h18v4H3zM3 11h18v4H3zM3 19h18v4H3z"/>
                  </svg>
                ),
                delay: '0s',
              },
              {
                label: 'Publicados',
                value: publishedCount,
                color: '#22d387',
                bg: 'rgba(34,211,135,0.08)',
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22d387" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="9"/>
                    <path d="M2 12h20M12 2a14 14 0 010 20M12 2a14 14 0 000 20"/>
                  </svg>
                ),
                delay: '0.08s',
              },
              {
                label: 'Rascunhos',
                value: draftCount,
                color: '#f59e0b',
                bg: 'rgba(245,158,11,0.08)',
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <path d="M14 2v6h6M8 13h8M8 17h5"/>
                  </svg>
                ),
                delay: '0.16s',
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="stat-card"
                style={{
                  background: '#0d0e18',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 16,
                  padding: '18px 22px',
                  display: 'flex', alignItems: 'center', gap: 14,
                  animationDelay: stat.delay,
                }}
              >
                <div style={{ width: 42, height: 42, borderRadius: 12, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {stat.icon}
                </div>
                <div>
                  <div style={{ fontSize: 26, fontWeight: 800, fontFamily: '"Inter", sans-serif', color: '#fff', lineHeight: 1 }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── CONTENT ──────────────────────────────────────────────────── */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ height: 240, borderRadius: 18, background: '#0d0e18', border: '1px solid rgba(255,255,255,0.05)', animation: 'shimmer 1.5s ease infinite', animationDelay: `${i*0.15}s` }}/>
            ))}
          </div>
        ) : filtered.length === 0 && search ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: '"Inter", sans-serif', marginBottom: 8 }}>Nenhum resultado</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Tente outro nome de projeto</div>
          </div>
        ) : projects.length === 0 ? (
          /* ── EMPTY STATE ── */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', animation: 'fadeUp 0.5s ease both' }}>
            {/* Ilustração */}
            <div style={{ position: 'relative', marginBottom: 32 }}>
              <div style={{ width: 100, height: 100, borderRadius: 28, background: 'linear-gradient(135deg,rgba(124,92,252,0.15),rgba(167,139,250,0.08))', border: '1px solid rgba(124,92,252,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                  <path d="M8 12h28M8 22h20M8 32h24" stroke="rgba(167,139,250,0.5)" strokeWidth="2.5" strokeLinecap="round"/>
                  <rect x="28" y="26" width="12" height="12" rx="6" fill="#7c5cfc"/>
                  <path d="M34 29v6M31 32h6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              {/* Decoração */}
              <div style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: 'rgba(124,92,252,0.3)', animation: 'pulse 2s ease infinite' }}/>
            </div>

            <h2 style={{ fontSize: 24, fontWeight: 800, fontFamily: '"Inter", sans-serif', marginBottom: 10, letterSpacing: '-0.3px' }}>
              Nenhum funil ainda
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', marginBottom: 32, textAlign: 'center', maxWidth: 360, lineHeight: 1.6 }}>
              Crie seu primeiro funil de quiz e comece a converter visitantes em clientes
            </p>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="btn-primary"
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '14px 32px', borderRadius: 14,
                background: 'linear-gradient(135deg,#7c5cfc,#a78bfa)',
                border: 'none', color: '#fff', fontSize: 15, fontWeight: 700,
                cursor: creating ? 'not-allowed' : 'pointer',
                boxShadow: '0 6px 24px rgba(124,92,252,0.4)',
                fontFamily: 'inherit',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M8 2v12M2 8h12"/>
              </svg>
              {creating ? 'Criando...' : '+ Criar primeiro funil'}
            </button>
          </div>
        ) : (
          /* ── GRID DE PROJETOS ── */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>

            {filtered.map((project, idx) => (
              <div
                key={project.id}
                className="card-hover"
                onClick={() => router.push(`/projeto/${project.id}/flow`)}
                style={{
                  background: '#0d0e18',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 18,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  opacity: deletingId === project.id ? 0.4 : 1,
                  transition: 'opacity 0.2s ease',
                  animation: `fadeUp 0.4s ease ${idx * 0.06}s both`,
                }}
              >
                {/* Thumbnail */}
                <div style={{ height: 148, background: 'linear-gradient(135deg,#11122a 0%,#1a1040 50%,#0e1a2e 100%)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {/* Glow effects */}
                  <div style={{ position: 'absolute', top: '20%', left: '20%', width: 80, height: 80, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,92,252,0.25),transparent 70%)', filter: 'blur(12px)' }}/>
                  <div style={{ position: 'absolute', bottom: '10%', right: '15%', width: 60, height: 60, borderRadius: '50%', background: 'radial-gradient(circle,rgba(45,212,191,0.15),transparent 70%)', filter: 'blur(10px)' }}/>
                  {/* Grid pattern */}
                  <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px,transparent 1px)', backgroundSize: '20px 20px' }}/>
                  {/* Icon */}
                  <div style={{ position: 'relative', width: 48, height: 48, borderRadius: 14, background: 'rgba(124,92,252,0.2)', border: '1px solid rgba(124,92,252,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                      <path d="M14 2v6h6M8 13h8M8 17h5"/>
                    </svg>
                  </div>
                  {/* Status badge */}
                  <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 99, background: project.published ? 'rgba(34,211,135,0.12)' : 'rgba(255,255,255,0.06)', border: `1px solid ${project.published ? 'rgba(34,211,135,0.25)' : 'rgba(255,255,255,0.1)'}` }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: project.published ? '#22d387' : 'rgba(255,255,255,0.3)' }}/>
                    <span style={{ fontSize: 10, fontWeight: 600, color: project.published ? '#22d387' : 'rgba(255,255,255,0.4)' }}>
                      {project.published ? 'Publicado' : 'Rascunho'}
                    </span>
                  </div>
                  {/* Delete btn — sempre visível */}
                  <button
                    onClick={e => handleDelete(e, project.id)}
                    style={{ position: 'absolute', top: 12, left: 12, width: 28, height: 28, borderRadius: 8, background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(244,63,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s', color: '#f87171' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.25)'; e.currentTarget.style.borderColor = 'rgba(244,63,94,0.5)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.45)'; e.currentTarget.style.borderColor = 'rgba(244,63,94,0.25)' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M1.5 3h9M5 3V1.5h2V3M2.5 3l.5 7.5h6l.5-7.5"/>
                    </svg>
                  </button>
                </div>

                {/* Card body */}
                <div style={{ padding: '16px 18px 18px' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, fontFamily: '"Inter", sans-serif', color: '#fff', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {project.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', marginBottom: 16 }}>
                    Atualizado {new Date(project.updated_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={e => { e.stopPropagation(); router.push(`/projeto/${project.id}/flow`) }}
                      style={{ flex: 1, padding: '8px 0', borderRadius: 9, background: 'rgba(124,92,252,0.1)', border: '1px solid rgba(124,92,252,0.2)', color: '#a78bfa', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,92,252,0.18)'; e.currentTarget.style.borderColor = 'rgba(124,92,252,0.4)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(124,92,252,0.1)'; e.currentTarget.style.borderColor = 'rgba(124,92,252,0.2)' }}
                    >
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <path d="M1 10.5l1.2-1.2L8.5 3 8 2.5 1.7 8.8 1 10.5zM8 2.5l1-1 1 1-1 1L8 2.5z"/>
                      </svg>
                      Editar
                    </button>

                    {project.published && project.slug && (
                      <button
                        onClick={e => { e.stopPropagation(); window.open(`/f/${project.slug}`, '_blank') }}
                        style={{ flex: 1, padding: '8px 0', borderRadius: 9, background: 'rgba(34,211,135,0.07)', border: '1px solid rgba(34,211,135,0.18)', color: '#22d387', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,211,135,0.14)'; e.currentTarget.style.borderColor = 'rgba(34,211,135,0.3)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(34,211,135,0.07)'; e.currentTarget.style.borderColor = 'rgba(34,211,135,0.18)' }}
                      >
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                          <circle cx="5.5" cy="5.5" r="4.5"/><path d="M1 5.5h9M5.5 1a7 7 0 010 9M5.5 1a7 7 0 000 9"/>
                        </svg>
                        Ver
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Card criar novo */}
            <div
              onClick={handleCreate}
              style={{
                background: 'rgba(124,92,252,0.04)',
                border: '1.5px dashed rgba(124,92,252,0.2)',
                borderRadius: 18,
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 10, minHeight: 240,
                transition: 'all 0.2s ease',
                animation: `fadeUp 0.4s ease ${filtered.length * 0.06}s both`,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,92,252,0.45)'; e.currentTarget.style.background = 'rgba(124,92,252,0.08)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(124,92,252,0.2)'; e.currentTarget.style.background = 'rgba(124,92,252,0.04)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ width: 46, height: 46, borderRadius: 13, background: 'rgba(124,92,252,0.12)', border: '1px solid rgba(124,92,252,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round">
                  <path d="M9 3v12M3 9h12"/>
                </svg>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#a78bfa' }}>Novo Projeto</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', marginTop: 3 }}>Criar funil de quiz</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}