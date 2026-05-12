import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

// ✅ Detecta plano pelo nome do produto no PerfectPay
function getPlan(productName: string): string {
  const name = productName.toLowerCase()
  if (name.includes('scale')) return 'scale'
  if (name.includes('growth')) return 'growth'
  return 'start'
}

// ✅ Duração: Scale = 3 meses, Start e Growth = 1 mês
function getExpiresAt(plan: string): Date {
  const now = new Date()
  if (plan === 'scale') {
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

function getPlanLabel(plan: string): string {
  if (plan === 'scale') return 'Scale'
  if (plan === 'growth') return 'Growth'
  return 'Start'
}

function getPlanColor(plan: string): string {
  if (plan === 'scale') return '#f59e0b'   // Dourado — plano topo
  if (plan === 'growth') return '#7c5cfc'  // Roxo — plano médio
  return '#22d387'                          // Verde — plano entrada
}

function buildEmail(email: string, password: string, plan: string, appUrl: string): string {
  const planLabel = getPlanLabel(plan)
  const planColor = getPlanColor(plan)
  const loginUrl = `${appUrl}/auth`

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Bem-vindo ao Synkro</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f0f0f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f0f0f0; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" border="0" style="max-width: 480px; width: 100%; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e0e0e0;">

          <!-- Barra colorida topo (cor do plano) -->
          <tr>
            <td style="height: 4px; background: ${planColor}; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Conteúdo principal -->
          <tr>
            <td style="padding: 48px 48px 40px;">

              <!-- Logo -->
              <p style="margin: 0 0 40px; font-size: 22px; font-weight: 800; color: #0f0f0f; letter-spacing: -0.5px;">Syn<span style="color: #7c5cfc;">kro</span></p>

              <!-- Título -->
              <p style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #0f0f0f; line-height: 1.3;">Acesso liberado.</p>
              <p style="margin: 0 0 36px; font-size: 15px; color: #888888; line-height: 1.6;">Sua conta <strong style="color: #555;">${planLabel}</strong> foi criada. Use as credenciais abaixo para entrar.</p>

              <!-- Email -->
              <p style="margin: 0 0 4px; font-size: 11px; font-weight: 600; color: #aaaaaa; text-transform: uppercase; letter-spacing: 1.2px;">E-mail</p>
              <p style="margin: 0 0 28px; font-size: 16px; font-weight: 600; color: #0f0f0f;">${email}</p>

              <!-- Senha em destaque -->
              <p style="margin: 0 0 4px; font-size: 11px; font-weight: 600; color: ${planColor}; text-transform: uppercase; letter-spacing: 1.2px;">Senha temporária</p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 36px;">
                <tr>
                  <td style="border: 2px solid ${planColor}; border-radius: 8px; padding: 16px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="font-size: 26px; font-weight: 800; color: #0f0f0f; letter-spacing: 5px; font-family: 'Courier New', Courier, monospace;">${password}</td>
                        <td align="right" style="font-size: 11px; color: #aaaaaa; font-weight: 500; vertical-align: middle;">copie</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Botão -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 36px;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" style="display: block; background: #7c5cfc; color: #ffffff; text-decoration: none; padding: 15px; border-radius: 8px; font-weight: 700; font-size: 15px; text-align: center;">Entrar agora</a>
                  </td>
                </tr>
              </table>

              <!-- Aviso -->
              <p style="margin: 0; font-size: 13px; color: #bbbbbb; line-height: 1.7; border-top: 1px solid #f0f0f0; padding-top: 24px;">Altere sua senha após o primeiro acesso. Dúvidas? Responda este email.</p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 16px 48px; background: #fafafa; border-top: 1px solid #f0f0f0;">
              <p style="margin: 0; font-size: 12px; color: #cccccc;">© 2025 Synkro · <a href="${appUrl}" style="color: #7c5cfc; text-decoration: none;">appsynkro.com</a></p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('Webhook PerfectPay recebido:', JSON.stringify(body))

    // ✅ VALIDAÇÃO DO TOKEN PERFECTPAY
    const publicToken = process.env.PERFECTPAY_PUBLIC_TOKEN
    if (publicToken) {
      const headerToken =
        req.headers.get('x-perfectpay-token') ||
        req.headers.get('x-public-token') ||
        req.headers.get('authorization')

      const bodyToken =
        body?.token ||
        body?.public_token ||
        body?.webhook_token

      const receivedToken = headerToken || bodyToken

      if (!receivedToken || receivedToken !== publicToken) {
        console.warn('Webhook rejeitado: token inválido ou ausente', { receivedToken })
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

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
    const existingUser = existingUsers?.users?.find((u: any) => u.email === email)

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
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://appsynkro.com'
      const html = buildEmail(email, password, plan, appUrl)

      await resend.emails.send({
        from: 'Synkro <noreply@appsynkro.com>',
        to: email,
        subject: `Seu acesso ao Synkro está pronto — Plano ${getPlanLabel(plan)}`,
        html,
      })
    }

    return NextResponse.json({ ok: true, plan, userId })

  } catch (error) {
    console.error('Erro no webhook:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}