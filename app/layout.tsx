import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  style: ['normal', 'italic'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MindNest — Every age. Every stage.',
  description:
    'AI-powered wellness coaching for parents. Meet Nest, your personal guide through early parenthood.',
  keywords: ['wellness', 'parenthood', 'AI coach', 'baby', 'postpartum'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-sage-50`}>
        {children}
      </body>
    </html>
  )
}
