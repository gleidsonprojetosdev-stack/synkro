'use client'

import { useParams } from 'next/navigation'
import TemaPanel from '@/components/tema/TemaPanel'

export default function TemaPage() {
  const { id } = useParams<{ id: string }>()
  return <TemaPanel projectId={id} />
}