'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface Page {
  id: string
  project_id: string
  node_id: string
  name: string
  blocks: any[]
  created_at: string
  updated_at: string
}

export function usePages(projectId: string) {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(false)

  async function fetchPages() {
    setLoading(true)
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('project_id', projectId)

    if (!error && data) setPages(data)
    setLoading(false)
  }

  async function savePage(nodeId: string, name: string, blocks: any[]) {
    const { data, error } = await supabase
      .from('pages')
      .upsert(
        { project_id: projectId, node_id: nodeId, name, blocks },
        { onConflict: 'project_id,node_id' }
      )
      .select()
      .single()

    if (!error && data) {
      setPages(prev => {
        const exists = prev.find(p => p.node_id === nodeId)
        if (exists) return prev.map(p => p.node_id === nodeId ? data : p)
        return [...prev, data]
      })
    }
    return { data, error }
  }

  async function getPage(nodeId: string) {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('project_id', projectId)
      .eq('node_id', nodeId)
      .single()

    return { data, error }
  }

  async function deletePage(nodeId: string) {
    const { error } = await supabase
      .from('pages')
      .delete()
      .eq('project_id', projectId)
      .eq('node_id', nodeId)

    if (!error) setPages(prev => prev.filter(p => p.node_id !== nodeId))
    return { error }
  }

  return { pages, loading, fetchPages, savePage, getPage, deletePage }
}