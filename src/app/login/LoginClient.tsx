// @ts-nocheck
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginClient() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Email o contraseña incorrectos'); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#0F6E56] text-white text-xl font-semibold mb-3">H</div>
          <h1 className="text-xl font-semibold text-gray-900">Hogar App</h1>
          <p className="text-sm text-gray-500 mt-1">Ingresa a tu panel de administración</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Correo electrónico</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@edificio.cl" required
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#0F6E56] focus:ring-1 focus:ring-[#0F6E56] outline-none transition"/>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Contraseña</label>
              <div className="relative">
                <input type={showPass?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required
                  className="w-full px-3 py-2.5 pr-10 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#0F6E56] focus:ring-1 focus:ring-[#0F6E56] outline-none transition"/>
                <button type="button" onClick={()=>setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass?<EyeOff size={15}/>:<Eye size={15}/>}
                </button>
              </div>
            </div>
            {error&&<div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-[#0F6E56] hover:bg-[#085041] disabled:opacity-60 text-white text-sm font-medium rounded-lg transition flex items-center justify-center gap-2">
              {loading&&<Loader2 size={14} className="animate-spin"/>}
              {loading?'Ingresando...':'Ingresar'}
            </button>
          </form>
          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <a href="#" className="text-xs text-[#185FA5] hover:underline">¿Olvidaste tu contraseña?</a>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">
          ¿Tu edificio aún no tiene cuenta?{' '}
          <a href="mailto:hola@hogarapp.cl" className="text-[#0F6E56] hover:underline">Contáctanos</a>
        </p>
      </div>
    </div>
  )
}
