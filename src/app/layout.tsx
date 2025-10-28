import type { Metadata } from 'next'
import './globals.css'
import { Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'CarouselGen - AI Instagram Carousel Generator',
  description: 'Create stunning Instagram carousels with AI-powered generation and easy editing tools.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <header className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 gradient-instagram rounded-md flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">CarouselGen</span>
            </a>
            <nav className="flex items-center gap-6 text-sm">
              <a href="/#features" className="text-gray-700 hover:text-gray-900">Features</a>
              <a href="/#pricing" className="text-gray-700 hover:text-gray-900">Pricing</a>
              <a href="/#about" className="text-gray-700 hover:text-gray-900">About</a>
              <a href="/dashboard" className="text-gray-700 hover:text-gray-900">Dashboard</a>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  )
}
