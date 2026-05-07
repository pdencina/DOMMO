// @ts-nocheck
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, CreditCard, Users, Wrench,
  Megaphone, FileBarChart2, Settings, LogOut, CalendarDays
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { initials } from '@/lib/utils'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard',              label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/dashboard/pagos',        label: 'Gastos comunes', icon: CreditCard, badge: 'alerts' },
  { href: '/dashboard/propietarios', label: 'Propietarios', icon: Users },
  { href: '/dashboard/mantenciones', label: 'Mantenciones', icon: Wrench },
  { href: '/dashboard/avisos',       label: 'Avisos',       icon: Megaphone },
  { href: '/dashboard/reportes',     label: 'Reportes',     icon: FileBarChart2 },
]

interface SidebarProps {
  profile: {
    full_name: string | null
    role: string
    buildings?: { name: string; slug: string } | null
  } | null
}

export default function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const buildingName = profile?.buildings?.name ?? 'Mi Edificio'
  const userName = profile?.full_name ?? 'Administrador'

  return (
    <aside className="w-56 min-w-56 bg-white border-r border-gray-100 flex flex-col h-full">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0F6E56] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
            H
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">Hogar App</p>
            <p className="text-[10px] text-gray-400 truncate">{buildingName}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        <p className="px-3 py-2 text-[10px] font-medium text-gray-400 uppercase tracking-wider">
          Principal
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all',
                active
                  ? 'bg-[#E1F5EE] text-[#0F6E56] font-medium border-l-2 border-[#0F6E56]'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 border-l-2 border-transparent'
              )}
            >
              <Icon size={15} className="flex-shrink-0" />
              {label}
            </Link>
          )
        })}

        <div className="pt-2 mt-2 border-t border-gray-100">
          <p className="px-3 py-2 text-[10px] font-medium text-gray-400 uppercase tracking-wider">
            Configuración
          </p>
          <Link
            href="/dashboard/configuracion"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition border-l-2 border-transparent"
          >
            <Settings size={15} />
            Configuración
          </Link>
        </div>
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-full bg-[#E1F5EE] flex items-center justify-center text-[#0F6E56] text-xs font-semibold flex-shrink-0">
            {initials(userName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-800 truncate">{userName}</p>
            <p className="text-[10px] text-gray-400 capitalize">{profile?.role ?? 'admin'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-2 py-1.5 w-full text-xs text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          <LogOut size={13} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
