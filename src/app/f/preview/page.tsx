'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function PreviewContent() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get('projectId')

  if (!projectId) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1018' }}>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Projeto não encontrado</div>
    </div>
  )

  // Redireciona para o funil usando projectId como parâmetro
  return (
    <FunilLoader projectId={projectId} />
  )
}

import { useEffect, useState } from 'react'

function FunilLoader({ projectId }: { projectId: string }) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    async function getSlug() {
      const res = await fetch(`/api/funil?projectId=${projectId}`)
      if (res.ok) {
        const { project } = await res.json()
        if (project?.slug) {
          setUrl(`/f/${project.slug}`)
        } else {
          // Sem slug ainda — passa projectId direto
          setUrl(`/f/draft?projectId=${projectId}`)
        }
      }
    }
    getSlug()
  }, [projectId])

  if (!url) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1018' }}>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Carregando preview...</div>
    </div>
  )

  window.location.href = url
  return null
}

export default function PreviewPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1018' }}>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Carregando...</div>
      </div>
    }>
      <PreviewContent />
    </Suspense>
  )
}