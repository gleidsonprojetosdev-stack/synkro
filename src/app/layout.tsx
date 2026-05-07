import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Synkro',
  description: 'Plataforma de criação de quiz e funil de conversão',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, padding: 0, background: '#0f1018' }}>
        {children}
      </body>
    </html>
  )
}