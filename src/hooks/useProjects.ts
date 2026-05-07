'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

export interface Project {
  id: string
  user_id: string
  name: string
  description?: string
  slug?: string
  published: boolean
  thumbnail?: string
  flow_data: any
  tema_data: any
  config_data: any
  stats_data: any
  created_at: string
  updated_at: string
}

export function useProjects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchProjects()
  }, [user])

  async function fetchProjects() {
    setLoading(true)
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false })

    if (!error && data) setProjects(data)
    setLoading(false)
  }

  async function createProject(name = 'Novo Projeto') {
    if (!user) return null
    const { data, error } = await supabase
      .from('projects')
      .insert({ user_id: user.id, name })
      .select()
      .single()

    if (!error && data) {
      setProjects(prev => [data, ...prev])
      return data
    }
    return null
  }

  async function updateProject(id: string, updates: Partial<Project>) {
    const { error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)

    if (!error) {
      setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
    }
    return { error }
  }

  async function deleteProject(id: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (!error) {
      setProjects(prev => prev.filter(p => p.id !== id))
    }
    return { error }
  }

  async function saveFlowData(id: string, flowData: any) {
    return updateProject(id, { flow_data: flowData })
  }

  async function saveTemaData(id: string, temaData: any) {
    return updateProject(id, { tema_data: temaData })
  }

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    saveFlowData,
    saveTemaData,
    refetch: fetchProjects,
  }
}