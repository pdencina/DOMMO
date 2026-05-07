'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginClient() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setIsLoading(true)
    setErrorMessage('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMessage(
        'No pudimos iniciar sesión. Revisa el correo y la contraseña.'
      )
      setIsLoading(false)
      return
    }

    window.location.href = redirectTo
  }

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />

      <section className="relative mx-auto grid min-h-screen max-w-7xl px-6 lg:grid-cols-2 lg:px-8">
        <div className="hidden flex-col justify-center lg:flex">
          <a href="/" className="mb-16 text-3xl font-bold tracking-tight">
            DOMMO
          </a>

          <div className="max-w-xl">
            <div className="mb-6 inline-flex w-fit rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
              Plataforma SaaS para comunidades
            </div>

            <h1 className="text-6xl font-bold leading-tight tracking-tight">
              Administra tu comunidad desde un solo lugar.
            </h1>

            <p className="mt-8 text-lg leading-8 text-gray-400">
              Pagos, residentes, accesos, comunicados y mantenciones en una
              experiencia moderna, simple y segura.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center py-16">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur">
            <div className="mb-10">
              <a href="/" className="mb-8 block text-3xl font-bold lg:hidden">
                DOMMO
              </a>

              <h2 className="text-3xl font-bold">Bienvenido de vuelta</h2>

              <p className="mt-3 text-gray-400">
                Ingresa tus datos para acceder a tu comunidad.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Correo electrónico
                </label>

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="pablo@dommo.cl"
                  className="w-full rounded-2xl border border-white/10 bg-white px-4 py-4 text-black outline-none transition placeholder:text-gray-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Contraseña
                </label>

                <input
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-white/10 bg-white px-4 py-4 text-black outline-none transition placeholder:text-gray-500 focus:border-blue-500"
                />
              </div>

              {errorMessage && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                  {errorMessage}
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-400">
                  <input type="checkbox" className="h-4 w-4 accent-blue-500" />
                  Recordarme
                </label>

                <a href="#" className="text-blue-400 hover:text-blue-300">
                  Recuperar contraseña
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-2xl bg-blue-500 px-6 py-4 font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Ingresando...' : 'Ingresar a DOMMO'}
              </button>
            </form>

            <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-gray-400">
              Para ingresar, el usuario debe existir en Supabase Authentication,
              no solo en una tabla de la base de datos.
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}