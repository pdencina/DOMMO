// @ts-nocheck
'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, Loader2 } from 'lucide-react'
import { useState } from 'react'

export default function LogoutButton({ variant = 'dark' }: { variant?: 'dark' | 'light' }) {
  const [loading, setLoading] = useState(false)
  const router  = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    setLoading(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 ${
        variant === 'light'
          ? 'text-white/70 hover:text-white hover:bg-white/15'
          : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
      }`}
    >
      {loading
        ? <Loader2 size={13} className="animate-spin" />
        : <LogOut size={13} />
      }
      {loading ? 'Saliendo...' : 'Salir'}
    </button>
  )
}
