import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'MindNest — Every age. Every stage.',
  description: 'AI-powered wellness coaching for first-time mothers. Meet Nest, your personal guide through early motherhood.',
  keywords: ['wellness', 'motherhood', 'AI coach', 'baby', 'postpartum', 'new mom'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
