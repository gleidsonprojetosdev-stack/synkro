'use client'

import { useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import FlowCanvas from '@/components/flow/FlowCanvas'
import EditorModal from '@/components/editor/EditorModal'

export default function FlowPage() {
  const { id } = useParams<{ id: string }>()
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null)
  const [nodeContents, setNodeContents] = useState<Record<string, any[]>>({})

  const handleOpenEditor = useCallback((nodeId: string) => {
    setEditingNodeId(nodeId)
  }, [])

  const handleSave = useCallback((nodeId: string, blocks: any[]) => {
    setNodeContents(prev => ({ ...prev, [nodeId]: blocks }))
    setEditingNodeId(null)
  }, [])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Flow sempre visível */}
      <FlowCanvas
        projectId={id}
        onOpenEditor={handleOpenEditor}
        nodeContents={nodeContents}
      />

      {/* Editor como modal flutuante sobre o Flow */}
      {editingNodeId && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(2px)',
        }}>
          <div style={{
            width: '90vw',
            height: '90vh',
            maxWidth: 1200,
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <EditorModal
              projectId={id}
              nodeId={editingNodeId}
              onClose={() => setEditingNodeId(null)}
              onSave={handleSave}
            />
          </div>
        </div>
      )}
    </div>
  )
}