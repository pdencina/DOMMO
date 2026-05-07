import { Suspense } from 'react'
import LoginClient from './LoginClient'

export const metadata = {
  title: 'Ingresar',
  description: 'Ingresa a tu cuenta DOMMO',
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginClient />
    </Suspense>
  )
}

function LoginLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050816] text-white">
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-sm text-gray-300">
        Cargando acceso DOMMO...
      </div>
    </main>
  )
}