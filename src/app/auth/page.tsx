'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signInWithEmail } = useAuth()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signInWithEmail(email, password)
    if (error) {
      setError('E-mail ou senha incorretos. Verifique os dados enviados para seu e-mail.')
    } else {
      router.push('/home')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f1018', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', fontFamily: 'Syne, sans-serif', letterSpacing: -1 }}>
            Syn<span style={{ color: '#7c5cfc' }}>kro</span>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 8 }}>
            Acesse sua conta com os dados enviados por e-mail
          </div>
        </div>

        {/* Card */}
        <div style={{ background: '#13141f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div>
              <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                style={{ width: '100%', background: '#1a1b2a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 14px', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(124,92,252,0.6)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
              />
            </div>

            <div>
              <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Senha</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ width: '100%', background: '#1a1b2a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 14px', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(124,92,252,0.6)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
              />
            </div>

            {error && (
              <div style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#f43f5e', lineHeight: 1.5 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '13px', borderRadius: 12, background: loading ? 'rgba(124,92,252,0.4)' : 'linear-gradient(135deg,#7c5cfc,#a78bfa)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4, boxShadow: loading ? 'none' : '0 4px 20px rgba(124,92,252,0.35)' }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Esqueci a senha */}
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <a
              href="/auth/reset-password"
              style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#a78bfa')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
            >
              Esqueci minha senha
            </a>
          </div>
        </div>

        {/* Rodapé */}
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: 'rgba(255,255,255,0.15)' }}>
          Problemas para acessar? Entre em contato com o suporte.
        </div>

      </div>
    </div>
  )
}