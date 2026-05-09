// @ts-nocheck
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, CreditCard, Users, Wrench,
  Megaphone, FileBarChart2, LogOut, Building2,
  Shield, ChevronRight, AlertCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { useState } from 'react'

function initials(name) {
  return name?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() ?? '?'
}

const adminNav = [
  { href: '/dashboard/admin',        label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/dashboard/pagos',        label: 'Gastos comunes', icon: CreditCard },
  { href: '/dashboard/propietarios', label: 'Propietarios',   icon: Users },
  { href: '/dashboard/mantenciones', label: 'Mantenciones',   icon: Wrench },
  { href: '/dashboard/avisos',       label: 'Avisos',         icon: Megaphone },
  { href: '/dashboard/reportes',     label: 'Reportes',       icon: FileBarChart2 },
]

const committeeNav = [
  { href: '/dashboard/committee', label: 'Mi Panel',  icon: LayoutDashboard },
  { href: '/dashboard/reportes',  label: 'Reportes',  icon: FileBarChart2 },
  { href: '/dashboard/avisos',    label: 'Avisos',    icon: Megaphone },
]

const superadminNav = [
  { href: '/dashboard/superadmin',   label: 'Panel Global',   icon: Shield },
  { href: '/dashboard/admin',        label: 'Admin Edificio', icon: Building2 },
  { href: '/dashboard/pagos',        label: 'Gastos comunes', icon: CreditCard },
  { href: '/dashboard/mantenciones', label: 'Mantenciones',   icon: Wrench },
  { href: '/dashboard/avisos',       label: 'Avisos',         icon: Megaphone },
  { href: '/dashboard/reportes',     label: 'Reportes',       icon: FileBarChart2 },
]

const roleMeta = {
  superadmin: { label: 'Super Admin',   color: 'bg-purple-100 text-purple-700' },
  admin:      { label: 'Administrador', color: 'bg-emerald-100 text-emerald-700' },
  committee:  { label: 'Comité',        color: 'bg-blue-100 text-blue-700' },
}

export default function Sidebar({ profile }) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const role         = profile?.role ?? 'admin'
  const buildingName = profile?.buildings?.name ?? 'Mi Edificio'
  const userName     = profile?.full_name ?? 'Administrador'
  const meta         = roleMeta[role] ?? roleMeta.admin

  const navItems = role === 'superadmin' ? superadminNav
    : role === 'committee' ? committeeNav
    : adminNav

  return (
    <aside className="w-56 min-w-56 bg-white border-r border-gray-100 flex flex-col h-full select-none">

      {/* Logo */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0F6E56] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            D
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate leading-tight">DOMMO</p>
            <p className="text-[10px] text-gray-400 truncate leading-tight">{buildingName}</p>
          </div>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-4 pt-3 pb-1">
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full ${meta.color}`}>
          <span className="dot-live" style={{ width: 5, height: 5 }} />
          {meta.label}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'nav-item flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm border-l-2 group',
                active
                  ? 'bg-[#E1F5EE] text-[#0F6E56] font-semibold border-[#0F6E56]'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 border-transparent'
              )}
            >
              <Icon size={15} className="flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={11} className="opacity-40" />}
            </Link>
          )
        })}
      </nav>

      {/* User + logout */}
      <div className="p-3 border-t border-gray-100 space-y-1">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="w-7 h-7 rounded-full bg-[#E1F5EE] flex items-center justify-center text-[#0F6E56] text-[10px] font-bold flex-shrink-0">
            {initials(userName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-800 truncate leading-tight">{userName}</p>
            <p className="text-[10px] text-gray-400 leading-tight">{meta.label}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-2 w-full px-2 py-2 rounded-lg text-xs text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all group"
        >
          <LogOut size={13} className="transition-transform group-hover:translate-x-0.5 flex-shrink-0" />
          <span>{loggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}</span>
        </button>
      </div>
    </aside>
  )
}
