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

function getPlanLabel(plan: string): string {
  if (plan === 'black') return 'Black'
  if (plan === 'pro') return 'Pro'
  return 'Basic'
}

function getPlanColor(plan: string): string {
  if (plan === 'black') return '#f59e0b'
  if (plan === 'pro') return '#7c5cfc'
  return '#22d387'
}

function getPlanBenefits(plan: string): string[] {
  if (plan === 'black') return [
    'Funis ilimitados',
    'Domínio personalizado',
    'Integrações avançadas (Pixel, GTM, UTMify)',
    'Estatísticas detalhadas por página',
    'Suporte prioritário',
    'Acesso por 3 meses',
  ]
  if (plan === 'pro') return [
    'Até 10 funis ativos',
    'Domínio personalizado',
    'Integrações (Pixel, GTM)',
    'Estatísticas completas',
    'Suporte em até 24h',
    'Acesso por 1 mês',
  ]
  return [
    'Até 3 funis ativos',
    'Subdomínio Synkro',
    'Estatísticas básicas',
    'Suporte por email',
    'Acesso por 1 mês',
  ]
}

function buildEmail(email: string, password: string, plan: string, appUrl: string): string {
  const planLabel = getPlanLabel(plan)
  const planColor = getPlanColor(plan)
  const benefits = getPlanBenefits(plan)
  const loginUrl = `${appUrl}/auth`

  const benefitItems = benefits.map(b => `
    <tr>
      <td style="padding: 7px 0;">
        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="width: 22px; vertical-align: top; padding-top: 1px;">
              <div style="width: 18px; height: 18px; border-radius: 50%; background: ${planColor}20; border: 1.5px solid ${planColor}60; display: flex; align-items: center; justify-content: center; text-align: center; line-height: 18px; font-size: 10px; color: ${planColor};">✓</div>
            </td>
            <td style="padding-left: 10px; font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.5;">${b}</td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('')

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Bem-vindo ao Synkro</title>
</head>
<body style="margin: 0; padding: 0; background-color: #080910; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #080910; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width: 560px; width: 100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">Syn<span style="color: #a78bfa;">kro</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero Card -->
          <tr>
            <td style="background: linear-gradient(135deg, #13141f 0%, #1a1040 100%); border-radius: 20px 20px 0 0; border: 1px solid rgba(124,92,252,0.2); border-bottom: none; padding: 40px 40px 32px; text-align: center;">

              <!-- Ícone -->
              <div style="width: 72px; height: 72px; border-radius: 20px; background: linear-gradient(135deg, ${planColor}25, ${planColor}10); border: 1.5px solid ${planColor}40; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; text-align: center; line-height: 72px; font-size: 32px;">
                🎉
              </div>

              <!-- Badge do plano -->
              <div style="display: inline-block; background: ${planColor}18; border: 1px solid ${planColor}40; border-radius: 99px; padding: 4px 16px; margin-bottom: 16px;">
                <span style="font-size: 11px; font-weight: 700; color: ${planColor}; text-transform: uppercase; letter-spacing: 1.5px;">Plano ${planLabel}</span>
              </div>

              <h1 style="margin: 0 0 12px; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; line-height: 1.2;">
                Seu acesso está pronto!
              </h1>
              <p style="margin: 0; font-size: 15px; color: rgba(255,255,255,0.5); line-height: 1.6;">
                Bem-vindo ao Synkro. Sua conta foi criada com sucesso<br/>e você já pode começar a criar seus funis de quiz.
              </p>
            </td>
          </tr>

          <!-- Credenciais -->
          <tr>
            <td style="background: #0d0e1a; border: 1px solid rgba(124,92,252,0.2); border-top: none; border-bottom: none; padding: 0 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 24px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <p style="margin: 0 0 16px; font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 1.5px;">Suas credenciais de acesso</p>

                    <!-- Email -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px;">
                      <tr>
                        <td style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px 16px;">
                          <p style="margin: 0 0 3px; font-size: 10px; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 1px;">E-mail</p>
                          <p style="margin: 0; font-size: 15px; font-weight: 600; color: #ffffff;">${email}</p>
                        </td>
                      </tr>
                    </table>

                    <!-- Senha -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background: ${planColor}10; border: 1.5px solid ${planColor}35; border-radius: 10px; padding: 12px 16px;">
                          <p style="margin: 0 0 3px; font-size: 10px; color: ${planColor}; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Senha temporária</p>
                          <p style="margin: 0; font-size: 20px; font-weight: 800; color: ${planColor}; letter-spacing: 3px; font-family: monospace;">${password}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Botão CTA -->
          <tr>
            <td style="background: #0d0e1a; border: 1px solid rgba(124,92,252,0.2); border-top: none; border-bottom: none; padding: 24px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c5cfc, #a78bfa); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 12px; font-weight: 700; font-size: 15px; letter-spacing: -0.2px; box-shadow: 0 8px 24px rgba(124,92,252,0.4);">
                      Acessar o Synkro →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Benefícios -->
          <tr>
            <td style="background: #0d0e1a; border: 1px solid rgba(124,92,252,0.2); border-top: none; border-bottom: none; padding: 0 40px 28px;">
              <p style="margin: 0 0 14px; font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 1.5px;">O que está incluído no seu plano</p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                ${benefitItems}
              </table>
            </td>
          </tr>

          <!-- Aviso segurança -->
          <tr>
            <td style="background: rgba(245,158,11,0.06); border: 1px solid rgba(124,92,252,0.2); border-top: 1px solid rgba(245,158,11,0.15); border-bottom: none; border-radius: 0; padding: 16px 40px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="width: 20px; vertical-align: top; padding-top: 1px; font-size: 14px;">⚠️</td>
                  <td style="padding-left: 10px; font-size: 12px; color: rgba(255,255,255,0.4); line-height: 1.6;">
                    Por segurança, recomendamos alterar sua senha após o primeiro acesso em <strong style="color: rgba(255,255,255,0.6);">Configurações → Alterar Senha</strong>.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #080910; border: 1px solid rgba(124,92,252,0.2); border-top: 1px solid rgba(255,255,255,0.04); border-radius: 0 0 20px 20px; padding: 24px 40px; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 12px; color: rgba(255,255,255,0.2); line-height: 1.6;">
                Você recebeu este email porque realizou uma compra em nosso site.<br/>
                Dúvidas? Responda este email que te ajudamos.
              </p>
              <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.15);">
                © 2025 Synkro · <a href="${appUrl}" style="color: rgba(124,92,252,0.6); text-decoration: none;">appsynkro.com</a>
              </p>
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
        subject: `🎉 Bem-vindo ao Synkro — Plano ${getPlanLabel(plan)}`,
        html,
      })
    }

    return NextResponse.json({ ok: true, plan, userId })

  } catch (error) {
    console.error('Erro no webhook:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}