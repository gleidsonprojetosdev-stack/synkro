import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

function getPlan(productName: string): string {
  const name = productName.toLowerCase()
  if (name.includes('black')) return 'black'
  if (name.includes('pro')) return 'pro'
  return 'basic'
}

function getExpiresAt(plan: string): Date {
  const now = new Date()
  if (plan === 'black') {
    now.setMonth(now.getMonth() + 3)
  } else {
    now.setMonth(now.getMonth() + 1)
  }
  return now
}

function generatePassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!'
  let password = ''
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('Webhook PerfectPay recebido:', JSON.stringify(body))

    const { sale_status, customer, product } = body

    if (sale_status !== 'approved') {
      return NextResponse.json({ ok: true, message: 'Status ignorado' })
    }

    const email = customer?.email
    const productName = product?.name || ''
    const perfectpayId = body?.sale_id || body?.id || ''

    if (!email) {
      return NextResponse.json({ error: 'Email não encontrado' }, { status: 400 })
    }

    const plan = getPlan(productName)
    const expiresAt = getExpiresAt(plan)

    // Verifica se usuário já existe
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(u => u.email === email)

    let userId: string
    let password: string | null = null

    if (existingUser) {
      userId = existingUser.id
    } else {
      password = generatePassword()
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })

      if (createError || !newUser.user) {
        console.error('Erro ao criar usuário:', createError)
        return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 500 })
      }

      userId = newUser.user.id
    }

    // Upsert na tabela de assinaturas
    await supabase.from('subscriptions').upsert({
      user_id: userId,
      plan,
      status: 'active',
      expires_at: expiresAt.toISOString(),
      perfectpay_id: perfectpayId,
    }, { onConflict: 'user_id' })

    // Envia email com senha só para novos usuários
    if (password) {
      await resend.emails.send({
        from: 'Synkro <noreply@synkro.io>',
        to: email,
        subject: '🎯 Seu acesso ao Synkro está pronto!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #0f1018; color: #fff; padding: 40px; border-radius: 16px;">
            <h1 style="font-size: 28px; margin-bottom: 8px;">Syn<span style="color: #7c5cfc;">kro</span></h1>
            <p style="color: rgba(255,255,255,0.6); margin-bottom: 32px;">Sua plataforma de funis de quiz</p>
            <h2 style="font-size: 18px; margin-bottom: 16px;">🎉 Seu acesso está pronto!</h2>
            <p style="color: rgba(255,255,255,0.7); line-height: 1.6;">Olá! Sua assinatura do plano <strong style="color: #7c5cfc;">${plan.toUpperCase()}</strong> foi confirmada.</p>
            <div style="background: #1a1b2a; border: 1px solid rgba(124,92,252,0.3); border-radius: 12px; padding: 20px; margin: 24px 0;">
              <p style="margin: 0 0 8px; color: rgba(255,255,255,0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">E-mail</p>
              <p style="margin: 0 0 16px; font-size: 16px; font-weight: bold;">${email}</p>
              <p style="margin: 0 0 8px; color: rgba(255,255,255,0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Senha</p>
              <p style="margin: 0; font-size: 20px; font-weight: bold; color: #7c5cfc; letter-spacing: 2px;">${password}</p>
            </div>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth" style="display: block; background: linear-gradient(135deg, #7c5cfc, #a78bfa); color: #fff; text-decoration: none; padding: 14px 24px; border-radius: 12px; text-align: center; font-weight: bold; font-size: 16px; margin-bottom: 24px;">
              Acessar o Synkro →
            </a>
            <p style="color: rgba(255,255,255,0.3); font-size: 12px; line-height: 1.6;">Recomendamos alterar sua senha após o primeiro acesso em Configurações → Alterar Senha.</p>
          </div>
        `,
      })
    }

    return NextResponse.json({ ok: true, plan, userId })

  } catch (error) {
    console.error('Erro no webhook:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}