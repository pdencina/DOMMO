// @ts-nocheck
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'

export default function LoginClient() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const redirectTo   = searchParams.get('redirect') || '/dashboard'
  const supabase     = createClient()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(), password,
    })

    if (error) {
      setError('Email o contraseña incorrectos. Verifica tus datos.')
      setLoading(false)
      return
    }

    if (!data.session) {
      setError('No se pudo iniciar sesión. Intenta de nuevo.')
      setLoading(false)
      return
    }

    router.refresh()
    router.push(redirectTo)
  }

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

      <section className="relative mx-auto grid min-h-screen max-w-7xl px-6 lg:grid-cols-2 lg:px-8">

        {/* Left: Marketing */}
        <div className="hidden flex-col justify-center lg:flex">
          <a href="/" className="mb-16 text-3xl font-bold tracking-tight cursor-pointer hover:opacity-80 transition-opacity">
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
              Pagos, residentes, accesos, comunicados y mantenciones en una experiencia moderna, simple y segura.
            </p>

            {/* Features */}
            <div className="mt-10 grid grid-cols-2 gap-3">
              {[
                { icon: '💳', label: 'Gastos comunes' },
                { icon: '👥', label: 'Gestión de residentes' },
                { icon: '🔧', label: 'Mantenciones' },
                { icon: '📢', label: 'Comunicados' },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-2.5 text-sm text-gray-400">
                  <span className="text-base">{icon}</span>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Login form */}
        <div className="flex items-center justify-center py-16">
          <div className="w-full max-w-md">
            <a href="/" className="mb-8 block text-2xl font-bold lg:hidden hover:opacity-80 transition-opacity">
              DOMMO
            </a>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-sm">
              <div className="mb-8">
                <h2 className="text-3xl font-bold">Bienvenido de vuelta</h2>
                <p className="mt-2 text-sm text-gray-400">
                  Ingresa tus datos para acceder a tu comunidad.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Correo electrónico
                  </label>
                  <input
                    type="email" required
                    value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="tu@correo.cl"
                    className="w-full rounded-xl border border-white/10 bg-white px-4 py-3.5 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'} required
                      value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-white/10 bg-white px-4 py-3.5 pr-11 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-sm text-red-300">
                    <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                <button
                  type="submit" disabled={loading}
                  className="w-full rounded-xl bg-blue-500 px-6 py-4 font-semibold text-white transition-all hover:bg-blue-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? 'Ingresando...' : 'Ingresar a DOMMO'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <a href="#" className="text-sm text-gray-400 hover:text-gray-200 transition-colors">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-gray-500">
              ¿Tu edificio aún no tiene cuenta?{' '}
              <a href="mailto:hola@dommo.cl" className="text-blue-400 hover:text-blue-300 transition-colors">
                Contáctanos
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
