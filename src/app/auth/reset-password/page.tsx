'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/nova-senha`,
    })

    if (error) {
      setError('Erro ao enviar e-mail. Verifique o endereço e tente novamente.')
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f1018', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', fontFamily: 'Syne, sans-serif', letterSpacing: -1 }}>
            Syn<span style={{ color: '#7c5cfc' }}>kro</span>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 8 }}>
            Recuperação de senha
          </div>
        </div>

        <div style={{ background: '#13141f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 32 }}>
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>📧</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 8 }}>E-mail enviado!</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: 24 }}>
                Verifique sua caixa de entrada e clique no link para criar uma nova senha.
              </div>
              <a href="/auth" style={{ fontSize: 13, color: '#a78bfa', textDecoration: 'none' }}>← Voltar para o login</a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: 4 }}>
                Digite o e-mail que você usou na compra. Enviaremos um link para você criar uma nova senha.
              </div>

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

              {error && (
                <div style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#f43f5e' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '13px', borderRadius: 12, background: loading ? 'rgba(124,92,252,0.4)' : 'linear-gradient(135deg,#7c5cfc,#a78bfa)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 20px rgba(124,92,252,0.35)' }}
              >
                {loading ? 'Enviando...' : 'Enviar link de recuperação'}
              </button>

              <div style={{ textAlign: 'center' }}>
                <a href="/auth" style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#a78bfa')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
                >
                  ← Voltar para o login
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}