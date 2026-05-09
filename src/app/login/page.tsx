// @ts-nocheck
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()

    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setError('Correo o contraseña incorrectos')
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main className="flex min-h-screen bg-[#F8FAFC]">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-[#0F172A] p-14 text-white">
        <div>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#10B981] text-xl font-bold">
              C
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                CONDOVIA
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Smart community management
              </p>
            </div>
          </div>

          <div className="mt-20 max-w-lg">
            <h2 className="text-5xl font-bold leading-tight">
              Administración moderna para comunidades modernas.
            </h2>

            <p className="mt-8 text-lg leading-8 text-slate-300">
              Gestiona residentes, gastos comunes, pagos, mantenciones y
              comunicaciones desde una sola plataforma.
            </p>
          </div>
        </div>

        <div className="text-sm text-slate-500">
          © {new Date().getFullYear()} CONDOVIA
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <div className="mb-10">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#10B981] text-lg font-bold text-white">
                C
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  CONDOVIA
                </h1>

                <p className="text-sm text-slate-500">
                  Smart community management
                </p>
              </div>
            </div>

            <h2 className="mt-8 text-3xl font-bold text-slate-900">
              Bienvenido 👋
            </h2>

            <p className="mt-3 text-slate-500">
              Ingresa a tu comunidad.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Correo electrónico
              </label>

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@condovia.cl"
                className="w-full rounded-2xl border border-slate-200 px-4 py-4 outline-none transition focus:border-[#10B981]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Contraseña
              </label>

              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-200 px-4 py-4 outline-none transition focus:border-[#10B981]"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#10B981] px-4 py-4 font-semibold text-white transition hover:bg-[#059669] disabled:opacity-50"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}