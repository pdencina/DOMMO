// @ts-nocheck
'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function LogoutButton({ variant = 'dark' }: { variant?: 'dark' | 'light' }) {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition ${
        variant === 'light'
          ? 'text-white/70 hover:text-white hover:bg-white/10'
          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
      }`}
    >
      <LogOut size={13} />
      Salir
    </button>
  )
}
