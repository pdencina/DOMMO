import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'DOMMO | Plataforma moderna para comunidades',
    template: '%s | DOMMO',
  },
  description:
    'DOMMO es una plataforma SaaS moderna para administrar comunidades, pagos, residentes, accesos, comunicados y mantenciones.',
  keywords: [
    'DOMMO',
    'administración de comunidades',
    'condominios',
    'gastos comunes',
    'residentes',
    'SaaS comunidades',
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}