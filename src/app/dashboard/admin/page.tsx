// @ts-nocheck
export const dynamic = 'force-dynamic'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCLP } from '@/lib/utils'
import Link from 'next/link'
import {
  AlertTriangle, TrendingUp, Users, Wrench,
  Megaphone, CreditCard, ChevronRight, CheckCircle2
} from 'lucide-react'

export const metadata = { title: 'Panel Admin | DOMMO' }

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const adminSupabase = await createAdminClient()

  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('id, full_name, role, building_id, email')
    .eq('email', user.email.trim().toLowerCase())
    .maybeSingle()

  if (!profile || !['admin', 'committee'].includes(profile.role)) {
    redirect('/dashboard')
  }

  const buildingId = profile.building_id
  if (!buildingId) redirect('/dashboard')

  const { data: building } = await adminSupabase
    .from('buildings')
    .select('*')
    .eq('id', buildingId)
    .single()

  // Período actual
  const thisMonth = new Date()
  thisMonth.setDate(1)
  const monthStr = thisMonth.toISOString().split('T')[0]

  const [
    { data: currentPeriod },
    { data: payments },
    { data: alerts },
    { data: maintenances },
    { data: notices },
    { data: units },
  ] = await Promise.all([
    adminSupabase.from('fee_periods').select('*').eq('building_id', buildingId).eq('period_month', monthStr).single(),
    adminSupabase.from('payments').select('*, units(number)').eq('building_id', buildingId),
    adminSupabase.from('alerts').select('*').eq('building_id', buildingId).eq('is_read', false).order('created_at', { ascending: false }).limit(8),
    adminSupabase.from('maintenances').select('*').eq('building_id', buildingId).in('status', ['pending', 'in_progress']).order('priority', { ascending: false }).limit(4),
    adminSupabase.from('notices').select('*').eq('building_id', buildingId).order('published_at', { ascending: false }).limit(3),
    adminSupabase.from('units').select('id').eq('building_id', buildingId),
  ])

  const totalUnits = units?.length ?? 0
  const paidCount = payments?.filter(p => p.status === 'paid').length ?? 0
  const overdueCount = payments?.filter(p => p.status === 'overdue').length ?? 0
  const pendingCount = payments?.filter(p => p.status === 'pending').length ?? 0
  const paidAmount = payments?.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0) ?? 0
  const totalExpected = payments?.reduce((s, p) => s + p.amount, 0) ?? 0
  const collectionPct = totalExpected > 0 ? Math.round((paidAmount / totalExpected) * 100) : 0

  const urgentAlerts = (alerts ?? []).filter(a => a.type === 'overdue' || a.type === 'maintenance')

  const now = new Date()
  const monthName = now.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-gray-900">{building?.name ?? 'Mi Edificio'}</h1>
          <p className="text-xs text-gray-400 capitalize">{monthName}</p>
        </div>
        <div className="flex gap-2">
          {urgentAlerts.length > 0 && (
            <span className="flex items-center gap-1.5 text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full">
              <AlertTriangle size={12} />
              {urgentAlerts.length} alerta{urgentAlerts.length !== 1 ? 's' : ''} urgente{urgentAlerts.length !== 1 ? 's' : ''}
            </span>
          )}
          <Link href="/dashboard/avisos/nuevo"
            className="text-xs text-white bg-[#0F6E56] px-3 py-1.5 rounded-lg hover:bg-[#085041] transition">
            + Nuevo aviso
          </Link>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto space-y-5">

        {/* Alerta morosidad */}
        {overdueCount > 0 && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertTriangle size={16} className="text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-800 flex-1">
              <span className="font-medium">{overdueCount} unidades</span> con gasto común vencido.
              {currentPeriod && ` Venció el ${new Date(currentPeriod.due_date).toLocaleDateString('es-CL')}.`}
            </p>
            <Link href="/dashboard/pagos?filter=overdue" className="text-xs font-medium text-red-700 hover:underline flex-shrink-0">
              Ver ahora →
            </Link>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-3">
          {[
            {
              label: 'Recaudado este mes',
              value: formatCLP(paidAmount),
              sub: `${collectionPct}% del total`,
              subColor: collectionPct >= 80 ? 'text-emerald-600' : 'text-amber-600',
              icon: TrendingUp, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600'
            },
            {
              label: 'Por cobrar',
              value: formatCLP(totalExpected - paidAmount),
              sub: `${overdueCount + pendingCount} unidades`,
              subColor: 'text-red-500',
              icon: CreditCard, iconBg: 'bg-red-50', iconColor: 'text-red-600'
            },
            {
              label: 'Unidades al día',
              value: `${paidCount}/${totalUnits}`,
              sub: 'pagaron este mes',
              subColor: 'text-gray-400',
              icon: Users, iconBg: 'bg-blue-50', iconColor: 'text-blue-600'
            },
            {
              label: 'Mantenciones activas',
              value: maintenances?.length ?? 0,
              sub: maintenances?.filter(m => m.priority === 'urgent').length > 0 ? `${maintenances.filter(m => m.priority === 'urgent').length} urgente(s)` : 'Sin urgentes',
              subColor: maintenances?.filter(m => m.priority === 'urgent').length > 0 ? 'text-red-500' : 'text-gray-400',
              icon: Wrench, iconBg: 'bg-amber-50', iconColor: 'text-amber-600'
            },
          ].map(({ label, value, sub, subColor, icon: Icon, iconBg, iconColor }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-3">
              <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={16} className={iconColor} />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                <p className="text-xl font-semibold text-gray-900">{value}</p>
                <p className={`text-xs mt-0.5 ${subColor}`}>{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Grid principal */}
        <div className="grid grid-cols-3 gap-4">

          {/* Pagos col-span-2 */}
          <div className="col-span-2 space-y-4">

            {/* Estado pagos */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900">Pagos del mes</h2>
                <Link href="/dashboard/pagos" className="text-xs text-[#185FA5] hover:underline">Ver todos →</Link>
              </div>

              {/* Barra visual */}
              <div className="p-4">
                <div className="flex rounded-lg overflow-hidden h-3 mb-3">
                  <div style={{ width: `${collectionPct}%` }} className="bg-emerald-500 transition-all" />
                  <div style={{ width: `${totalUnits > 0 ? (pendingCount / totalUnits) * 100 : 0}%` }} className="bg-amber-400 transition-all" />
                  <div className="flex-1 bg-gray-100" />
                </div>
                <div className="flex gap-6 text-xs">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Pagados: {paidCount}</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Pendientes: {pendingCount}</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Vencidos: {overdueCount}</span>
                </div>
              </div>

              {/* Accesos rápidos */}
              <div className="grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100">
                {[
                  { href: '/dashboard/pagos?filter=overdue', label: 'Ver vencidos', count: overdueCount, color: 'text-red-600' },
                  { href: '/dashboard/pagos?filter=pending', label: 'Ver pendientes', count: pendingCount, color: 'text-amber-600' },
                  { href: '/dashboard/pagos', label: 'Todos los pagos', count: totalUnits, color: 'text-gray-600' },
                ].map(({ href, label, count, color }) => (
                  <Link key={href} href={href}
                    className="flex flex-col items-center py-3 hover:bg-gray-50 transition">
                    <p className={`text-lg font-semibold ${color}`}>{count}</p>
                    <p className="text-[10px] text-gray-400">{label}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Mantenciones activas */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900">Mantenciones activas</h2>
                <Link href="/dashboard/mantenciones" className="text-xs text-[#185FA5] hover:underline">Ver todas →</Link>
              </div>
              {!maintenances || maintenances.length === 0 ? (
                <div className="py-8 text-center">
                  <CheckCircle2 size={20} className="text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Todo en orden</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {maintenances.map(m => (
                    <div key={m.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        m.priority === 'urgent' ? 'bg-red-500' :
                        m.priority === 'high' ? 'bg-amber-500' : 'bg-blue-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{m.title}</p>
                        <p className="text-xs text-gray-400">{m.category} · {m.status === 'in_progress' ? 'En progreso' : 'Pendiente'}</p>
                      </div>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        m.priority === 'urgent' ? 'bg-red-50 text-red-700' :
                        m.priority === 'high' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {m.priority === 'urgent' ? 'Urgente' : m.priority === 'high' ? 'Alta' : 'Normal'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="border-t border-gray-100 px-4 py-2.5">
                <Link href="/dashboard/mantenciones/nueva"
                  className="text-xs text-[#0F6E56] hover:underline">
                  + Nueva mantención
                </Link>
              </div>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="space-y-4">

            {/* Módulos rápidos */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="text-xs font-semibold text-gray-900 mb-3">Accesos rápidos</h3>
              <div className="space-y-1">
                {[
                  { href: '/dashboard/propietarios', icon: Users, label: 'Propietarios', desc: `${totalUnits} unidades` },
                  { href: '/dashboard/mantenciones', icon: Wrench, label: 'Mantenciones', desc: `${maintenances?.length ?? 0} activas` },
                  { href: '/dashboard/avisos', icon: Megaphone, label: 'Avisos', desc: `${notices?.length ?? 0} publicados` },
                  { href: '/dashboard/reportes', icon: TrendingUp, label: 'Reportes', desc: 'Financiero' },
                ].map(({ href, icon: Icon, label, desc }) => (
                  <Link key={href} href={href}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition group">
                    <Icon size={14} className="text-gray-400 group-hover:text-[#0F6E56] transition" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-700">{label}</p>
                      <p className="text-[10px] text-gray-400">{desc}</p>
                    </div>
                    <ChevronRight size={12} className="text-gray-300 group-hover:text-gray-400 transition" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Avisos recientes */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="text-xs font-semibold text-gray-900">Últimos avisos</h3>
                <Link href="/dashboard/avisos" className="text-xs text-[#185FA5] hover:underline">Ver todos</Link>
              </div>
              {!notices || notices.length === 0 ? (
                <p className="px-4 py-4 text-xs text-gray-400">Sin avisos publicados</p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {notices.map(n => (
                    <div key={n.id} className="px-4 py-3">
                      <p className="text-xs font-medium text-gray-800 truncate">{n.title}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {new Date(n.published_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                        {n.pinned && ' · Fijado'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <div className="border-t border-gray-100 px-4 py-2.5">
                <Link href="/dashboard/avisos/nuevo" className="text-xs text-[#0F6E56] hover:underline">
                  + Publicar aviso
                </Link>
              </div>
            </div>

            {/* Info edificio */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="text-xs font-semibold text-gray-900 mb-3">Tu edificio</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Plan</span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                    building?.plan === 'premium' ? 'bg-purple-50 text-purple-700' :
                    building?.plan === 'pro' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'
                  }`}>{building?.plan ?? '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Estado</span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    building?.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>{building?.status === 'active' ? 'Activo' : building?.status ?? '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Ciudad</span>
                  <span className="text-xs text-gray-700">{building?.city ?? '—'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
