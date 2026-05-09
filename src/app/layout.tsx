import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CONDOVIA',
  description: 'Plataforma moderna para administración de comunidades.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}