import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Heklemønster Designverktøy',
  description: 'Lag egne mønster for heklevesker med filet-hekleteknikk',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="no">
      <head>
        <script async src="https://plausible.io/js/pa-MxTDdKzD7Qkgs86vlm7TL.js"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
            plausible.init()
          `
        }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
