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
      <body className="antialiased">{children}</body>
    </html>
  )
}
