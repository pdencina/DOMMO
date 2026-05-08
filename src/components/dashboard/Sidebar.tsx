// @ts-nocheck
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  CreditCard,
  Users,
  Wrench,
  Megaphone,
  FileBarChart2,
  Settings,
  LogOut,
  Building2,
  UserPlus,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { initials } from '@/lib/utils'
import { cn } from '@/lib/utils'

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

  const role = profile?.role ?? 'admin'
  const isSuperAdmin = role === 'superadmin'

  const navItems = isSuperAdmin
    ? [
        {
          href: '/dashboard/superadmin',
          label: 'Panel DOMMO',
          icon: LayoutDashboard,
        },
        {
          href: '/dashboard/superadmin/comunidades/nueva',
          label: 'Nueva comunidad',
          icon: Building2,
        },
        {
          href: '/dashboard/superadmin/onboarding',
          label: 'Onboarding cliente',
          icon: UserPlus,
        },
      ]
    : [
        {
          href: '/dashboard/admin',
          label: 'Dashboard',
          icon: LayoutDashboard,
        },
        {
          href: '/dashboard/pagos',
          label: 'Gastos comunes',
          icon: CreditCard,
        },
        {
          href: '/dashboard/propietarios',
          label: 'Propietarios',
          icon: Users,
        },
        {
          href: '/dashboard/mantenciones',
          label: 'Mantenciones',
          icon: Wrench,
        },
        {
          href: '/dashboard/avisos',
          label: 'Avisos',
          icon: Megaphone,
        },
        {
          href: '/dashboard/reportes',
          label: 'Reportes',
          icon: FileBarChart2,
        },
      ]

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const buildingName = isSuperAdmin
    ? 'Plataforma DOMMO'
    : profile?.buildings?.name ?? 'Mi Edificio'

  const userName = profile?.full_name ?? 'Administrador'

  return (
    <aside className="flex h-full w-64 min-w-64 flex-col border-r border-gray-100 bg-white">
      <div className="border-b border-gray-100 px-5 py-5">
        <Link
          href={isSuperAdmin ? '/dashboard/superadmin' : '/dashboard'}
          className="flex cursor-pointer items-center gap-3 rounded-xl transition hover:opacity-80"
        >
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#0F6E56] text-sm font-semibold text-white">
            D
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-gray-900">
              DOMMO
            </p>

            <p className="truncate text-xs text-gray-400">
              {buildingName}
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          {isSuperAdmin ? 'Super Admin' : 'Principal'}
        </p>

        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-xl border-l-2 px-3 py-3 text-sm transition-all',
                active
                  ? 'border-[#0F6E56] bg-[#E1F5EE] font-semibold text-[#0F6E56]'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon size={17} className="flex-shrink-0" />
              <span>{label}</span>
            </Link>
          )
        })}

        <div className="mt-4 border-t border-gray-100 pt-4">
          <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Configuración
          </p>

          <Link
            href="/dashboard/configuracion"
            className="flex cursor-pointer items-center gap-3 rounded-xl border-l-2 border-transparent px-3 py-3 text-sm text-gray-500 transition-all hover:bg-gray-50 hover:text-gray-900"
          >
            <Settings size={17} />
            <span>Configuración</span>
          </Link>
        </div>
      </nav>

      <div className="border-t border-gray-100 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-gray-50 p-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#E1F5EE] text-sm font-semibold text-[#0F6E56]">
            {initials(userName)}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-800">
              {userName}
            </p>

            <p className="truncate text-xs capitalize text-gray-400">
              {role}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-gray-500 transition-all hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={17} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}