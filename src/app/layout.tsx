import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DSP',
  description: 'Digital Streaming Platform',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="black" width="100" height="100"/></svg>'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}