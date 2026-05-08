import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')
  const projectId = searchParams.get('projectId')

  // ✅ Incluir todos os campos de configuração na query
  const query = supabase
    .from('projects')
    .select(`
      id, name, flow_data, tema_data, published,
      site_title, site_description, head_script, allow_indexing,
      pixel_id, gtm_id, utmify_id
    `)

  const { data: project, error } = slug
    ? await query.eq('slug', slug).eq('published', true).single()
    : await query.eq('id', projectId).single()

  if (error || !project) {
    return NextResponse.json({ error: 'Funil não encontrado' }, { status: 404 })
  }

  const { data: pages } = await supabase
    .from('pages')
    .select('*')
    .eq('project_id', project.id)

  return NextResponse.json({ project, pages })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { projectId, nodeId } = body

  if (!projectId || !nodeId) {
    return NextResponse.json({ error: 'projectId e nodeId são obrigatórios' }, { status: 400 })
  }

  const { error } = await supabase.from('page_stats').insert({
    project_id: projectId,
    node_id: nodeId,
    created_at: new Date().toISOString(),
  })

  if (error) {
    console.error('Erro ao registrar page_stat:', error)
    return NextResponse.json({ error: 'Erro ao registrar visita' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}