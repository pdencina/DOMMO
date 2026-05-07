// @ts-nocheck
export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCLP, formatMonth, daysUntil, paymentStatusLabel } from '@/lib/utils'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Perfil + edificio
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('*, buildings(*)')
    .eq('id', user.id)
    .single()

  const buildingId = profile?.building_id
  if (!buildingId) redirect('/login')

  // Período actual (mes vigente)
  const thisMonth = new Date()
  thisMonth.setDate(1)
  const monthStr = thisMonth.toISOString().split('T')[0]

  const [
    { data: period },
    { data: payments },
    { data: alerts },
    { data: units },
    { data: recentActivity },
  ] = await Promise.all([
    supabase.from('fee_periods')
      .select('*')
      .eq('building_id', buildingId)
      .eq('period_month', monthStr)
      .single(),
    supabase.from('payments')
      .select('*, units(number, floor, profiles!units_owner_id_fkey(full_name, email, phone))')
      .eq('building_id', buildingId)
      .order('status', { ascending: false }),
    supabase.from('alerts')
      .select('*')
      .eq('building_id', buildingId)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('units').select('id').eq('building_id', buildingId),
    supabase.from('payments')
      .select('*, units(number)')
      .eq('building_id', buildingId)
      .eq('status', 'paid')
      .order('paid_at', { ascending: false })
      .limit(4),
  ])

  // KPIs
  const totalUnits = units?.length ?? 0
  const paid   = payments?.filter(p => p.status === 'paid').length ?? 0
  const overdue = payments?.filter(p => p.status === 'overdue').length ?? 0
  const pending = payments?.filter(p => p.status === 'pending').length ?? 0
  const paidAmount = payments?.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0) ?? 0
  const totalExpected = payments?.reduce((s, p) => s + p.amount, 0) ?? 0
  const collectionPct = totalExpected > 0 ? Math.round((paidAmount / totalExpected) * 100) : 0

  // Pagos con alerta (overdue + pending próximos a vencer)
  const urgentPayments = payments?.filter(p =>
    p.status === 'overdue' ||
    (p.status === 'pending' && period && daysUntil(period.due_date) <= 6)
  ).slice(0, 6) ?? []

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400">
            {period ? formatMonth(period.period_month) : 'Sin período activo'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/pagos"
            className="px-3 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            Exportar
          </Link>
          <Link
            href="/dashboard/avisos/nuevo"
            className="px-3 py-2 text-xs font-medium text-white bg-[#0F6E56] rounded-lg hover:bg-[#085041] transition"
          >
            + Aviso nuevo
          </Link>
        </div>
      </div>

      {/* Banner alerta morosidad */}
      {overdue > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
          <AlertTriangle size={16} className="text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800 flex-1">
            <span className="font-medium">{overdue} unidades</span> tienen el gasto común vencido.
            {period && ` Venció el ${new Date(period.due_date).toLocaleDateString('es-CL')}.`}
          </p>
          <Link href="/dashboard/pagos?filter=overdue" className="text-xs font-medium text-red-700 hover:underline">
            Ver todos →
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-400 mb-1">Recaudación {period ? formatMonth(period.period_month) : ''}</p>
          <p className="text-2xl font-semibold text-gray-900">{formatCLP(paidAmount)}</p>
          <p className="text-xs text-emerald-600 mt-1">▲ {collectionPct}% recaudado</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-400 mb-1">Por cobrar</p>
          <p className="text-2xl font-semibold text-gray-900">{formatCLP(totalExpected - paidAmount)}</p>
          <p className="text-xs text-red-500 mt-1">{overdue + pending} unidades</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-400 mb-1">Unidades totales</p>
          <p className="text-2xl font-semibold text-gray-900">{totalUnits}</p>
          <p className="text-xs text-emerald-600 mt-1">{paid} al día ✓</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-400 mb-1">Alertas sin leer</p>
          <p className="text-2xl font-semibold text-gray-900">{alerts?.length ?? 0}</p>
          <p className="text-xs text-gray-400 mt-1">notificaciones</p>
        </div>
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-3 gap-4">

        {/* Tabla pagos con alerta — 2 columnas */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-medium text-gray-900">Pagos con alerta</h2>
            <Link href="/dashboard/pagos" className="text-xs text-[#185FA5] hover:underline">Ver todos</Link>
          </div>

          {urgentPayments.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">
              Todo al día ✓
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex border-b border-gray-100">
                <button className="px-4 py-2.5 text-xs font-medium text-[#185FA5] border-b-2 border-[#185FA5]">
                  Con alerta ({urgentPayments.length})
                </button>
                <Link href="/dashboard/pagos" className="px-4 py-2.5 text-xs text-gray-400 hover:text-gray-600">
                  Todos
                </Link>
              </div>

              <div className="divide-y divide-gray-50">
                {urgentPayments.map(payment => {
                  const unit = payment.units as any
                  const owner = unit?.profiles
                  const status = paymentStatusLabel(payment.status)
                  const daysLeft = period ? daysUntil(period.due_date) : 0
                  const isOverdue = payment.status === 'overdue'

                  return (
                    <div key={payment.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition">
                      {/* Badge unidad */}
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                        isOverdue ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {unit?.number ?? '?'}
                      </div>

                      {/* Info propietario */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {owner?.full_name ?? 'Sin propietario'}
                        </p>
                        <p className="text-xs text-gray-400">
                          Depto {unit?.number}
                          {isOverdue ? ' · Vencido' : ` · Vence en ${daysLeft} días`}
                        </p>
                      </div>

                      {/* Monto */}
                      <p className="text-sm font-medium text-gray-900 tabular-nums">
                        {formatCLP(payment.amount)}
                      </p>

                      {/* Status pill */}
                      <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${
                        isOverdue
                          ? 'bg-red-50 text-red-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {isOverdue ? 'Vencido' : 'Por vencer'}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Quick actions */}
              <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
                <button className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
                  📨 Recordatorio masivo
                </button>
                <button className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
                  📋 Generar informe
                </button>
              </div>
            </>
          )}
        </div>

        {/* Columna derecha */}
        <div className="space-y-4">

          {/* Barra de recaudación */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h3 className="text-xs font-medium text-gray-900 mb-3">Recaudación del mes</h3>
            <div className="space-y-3">
              {[
                { label: 'Pagados', count: paid, color: '#1D9E75' },
                { label: 'Pendientes', count: pending, color: '#EF9F27' },
                { label: 'Vencidos', count: overdue, color: '#E24B4A' },
              ].map(({ label, count, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-gray-700">{count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${totalUnits > 0 ? (count / totalUnits) * 100 : 0}%`,
                        background: color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actividad reciente */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-xs font-medium text-gray-900">Actividad reciente</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {(recentActivity ?? []).length === 0 ? (
                <p className="px-4 py-4 text-xs text-gray-400">Sin actividad reciente</p>
              ) : (recentActivity ?? []).map(p => {
                const unit = p.units as any
                return (
                  <div key={p.id} className="flex items-start gap-2.5 px-4 py-3">
                    <div className="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-emerald-600 text-xs">✓</span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-800">
                        Depto {unit?.number} pagó gasto común
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {p.paid_at ? new Date(p.paid_at).toLocaleDateString('es-CL') : ''}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
