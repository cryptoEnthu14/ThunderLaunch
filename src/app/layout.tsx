import type { Metadata, Viewport } from 'next'
import './globals.css'
import { WalletProvider } from '@/components/providers/WalletProvider'
import { Header, Footer } from '@/components/layout'

export const metadata: Metadata = {
  title: {
    default: 'ThunderLaunch',
    template: '%s | ThunderLaunch',
  },
  description: 'Lightning-fast token launches on Solana. Create, trade, and manage tokens with enterprise-grade security.',
  keywords: ['Solana', 'Token Launch', 'DeFi', 'Cryptocurrency', 'Web3', 'Blockchain'],
  authors: [{ name: 'ThunderLaunch' }],
  creator: 'ThunderLaunch',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://thunderlaunch.app',
    title: 'ThunderLaunch - Lightning-Fast Token Launches on Solana',
    description: 'Create, trade, and manage tokens with enterprise-grade security on Solana.',
    siteName: 'ThunderLaunch',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ThunderLaunch',
    description: 'Lightning-fast token launches on Solana',
    creator: '@thunderlaunch',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-gray-950 text-white min-h-screen flex flex-col">
        <WalletProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </WalletProvider>
      </body>
    </html>
  )
}
