// @ts-nocheck
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { formatCLP } from '@/lib/utils'
import {
  Building2, Plus, Users, TrendingUp,
  CheckCircle2, Clock, XCircle, LogOut, Shield
} from 'lucide-react'
import LogoutButton from '@/components/dashboard/LogoutButton'

export const metadata = { title: 'Super Admin | DOMMO' }

export default async function SuperAdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const adminSupabase = await createAdminClient()
  const { data: profile } = await adminSupabase
    .from('profiles').select('role, full_name').eq('email', user.email).maybeSingle()

  if (!profile || profile.role !== 'superadmin') redirect('/dashboard')

  const { data: buildings } = await adminSupabase
    .from('buildings')
    .select('*, profiles(id)')
    .order('created_at', { ascending: false })

  const total   = buildings?.length ?? 0
  const active  = buildings?.filter(b => b.status === 'active').length ?? 0
  const trial   = buildings?.filter(b => b.status === 'trial').length ?? 0
  const totalUnits = buildings?.reduce((s, b) => s + (b.total_units ?? 0), 0) ?? 0

  // MRR estimado
  const planPrices = { basico: 35000, pro: 59000, premium: 99000 }
  const mrr = buildings?.filter(b => b.status === 'active')
    .reduce((s, b) => s + (planPrices[b.plan] ?? 59000), 0) ?? 0

  const planConfig = {
    basico:  { label: 'Básico',  color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
    pro:     { label: 'Pro',     color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    premium: { label: 'Premium', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  }

  const statusConfig = {
    active:    { label: 'Activo',     icon: CheckCircle2, color: 'text-emerald-400' },
    trial:     { label: 'Trial',      icon: Clock,        color: 'text-amber-400' },
    suspended: { label: 'Suspendido', icon: XCircle,      color: 'text-red-400' },
    cancelled: { label: 'Cancelado',  icon: XCircle,      color: 'text-gray-500' },
  }

  return (
    <div className="min-h-screen bg-[#050C1A] text-white">

      {/* Header */}
      <div className="border-b border-white/5 bg-black/20 backdrop-blur-md px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Shield size={15} className="text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500">DOMMO Platform</p>
            <p className="text-sm font-bold">Super Admin</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            {profile.full_name}
          </span>
          <LogoutButton variant="light" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        {/* Hero + CTA */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Panel de plataforma</h1>
            <p className="text-sm text-gray-500 mt-1">Gestiona todos los edificios registrados en DOMMO.</p>
          </div>
          <Link href="/dashboard/superadmin/onboarding"
            className="flex items-center gap-2 bg-[#0F6E56] hover:bg-[#0a5540] text-white font-semibold px-5 py-3 rounded-xl transition-all hover:scale-105 active:scale-95 text-sm">
            <Plus size={16} /> Nuevo edificio
          </Link>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Edificios totales',  value: total,               sub: `${trial} en trial`,  color: 'text-white' },
            { label: 'Edificios activos',  value: active,              sub: 'pagando suscripción', color: 'text-emerald-400' },
            { label: 'Unidades totales',   value: totalUnits,          sub: 'en toda la plataforma', color: 'text-blue-400' },
            { label: 'MRR estimado',       value: formatCLP(mrr),      sub: 'ingresos mensuales',  color: 'text-purple-400' },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
              <p className="text-xs text-gray-500 mb-2">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-600 mt-1">{sub}</p>
            </div>
          ))}
        </div>

        {/* Lista edificios */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <h2 className="text-base font-bold">Edificios registrados</h2>
            <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">{total} total</span>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-6 py-2.5 border-b border-white/5 text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
            <div>Edificio</div>
            <div>Plan</div>
            <div>Unidades</div>
            <div>Estado</div>
            <div>Acción</div>
          </div>

          {!buildings || buildings.length === 0 ? (
            <div className="py-16 text-center">
              <Building2 size={32} className="text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No hay edificios registrados aún</p>
              <Link href="/dashboard/superadmin/onboarding"
                className="text-sm text-[#5DCAA5] hover:underline">
                + Registrar el primero
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {buildings.map(b => {
                const plan   = planConfig[b.plan]   ?? planConfig.pro
                const status = statusConfig[b.status] ?? statusConfig.active
                const StatusIcon = status.icon
                const admins = b.profiles?.length ?? 0

                return (
                  <div key={b.id}
                    className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-6 py-4 hover:bg-white/[0.02] transition-colors group">

                    {/* Info edificio */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[#0F6E56]/20 flex items-center justify-center flex-shrink-0">
                        <Building2 size={16} className="text-[#5DCAA5]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{b.name}</p>
                        <p className="text-[11px] text-gray-600 font-mono">{b.slug}.dommo.app · {b.city}</p>
                      </div>
                    </div>

                    {/* Plan */}
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${plan.color}`}>
                      {plan.label}
                    </span>

                    {/* Unidades */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Users size={12} />
                      {b.total_units ?? 0}
                    </div>

                    {/* Status */}
                    <div className={`flex items-center gap-1.5 text-xs font-medium ${status.color}`}>
                      <StatusIcon size={12} />
                      {status.label}
                    </div>

                    {/* Acción */}
                    <Link href={`/dashboard/superadmin/onboarding?edit=${b.id}`}
                      className="text-[11px] text-gray-600 hover:text-[#5DCAA5] transition-colors opacity-0 group-hover:opacity-100">
                      Ver →
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-gray-700 pb-4">
          <span>DOMMO Platform · v1.0</span>
          <span>Estado: <span className="text-emerald-600">Operativo ✓</span></span>
        </div>
      </div>
    </div>
  )
}
