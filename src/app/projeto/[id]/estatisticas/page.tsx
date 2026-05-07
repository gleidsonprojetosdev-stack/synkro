'use client'

import { useParams } from 'next/navigation'
import EstatisticasPanel from '@/components/estatisticas/EstatisticasPanel'

export default function EstatisticasPage() {
  const { id } = useParams<{ id: string }>()
  return <EstatisticasPanel projectId={id} />
}