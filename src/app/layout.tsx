import type { Metadata } from 'next'
import './globals.css'

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
            <a href="/" className="text-lg font-semibold text-gray-900">CarouselGen</a>
            <nav className="flex items-center gap-4 text-sm">
              <a href="/" className="text-gray-700 hover:text-gray-900">Home</a>
              <a href="/settings" className="text-gray-700 hover:text-gray-900">Settings</a>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  )
}
