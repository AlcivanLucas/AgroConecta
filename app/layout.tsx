import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import './globals.css'

const geist = Geist({ 
  subsets: ["latin"],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'AgroConecta - Marketplace Agropecuário',
  description: 'Conectamos produtores rurais e fazendeiros a prestadores de serviços especializados no setor agropecuário.',
  keywords: ['agropecuário', 'fazenda', 'produtor rural', 'serviços agrícolas', 'marketplace'],
  authors: [{ name: 'AgroConecta' }],
  openGraph: {
    title: 'AgroConecta - Marketplace Agropecuário',
    description: 'Conectamos produtores rurais e fazendeiros a prestadores de serviços especializados no setor agropecuário.',
    type: 'website',
    locale: 'pt_BR',
  },
}

export const viewport: Viewport = {
  themeColor: '#2D5A27',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${geist.variable} ${geistMono.variable} bg-background`}>
      <body className="font-sans antialiased min-h-screen">
        {children}
        <Toaster position="top-right" richColors />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
