import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Heklemønster Designverktøy',
  description: 'Lag egne mønster for heklevesker med filet-hekleteknikk',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="no">
      <body>{children}</body>
    </html>
  )
}
