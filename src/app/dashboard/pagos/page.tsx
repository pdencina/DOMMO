// @ts-nocheck
export const dynamic = 'force-dynamic'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCLP, daysUntil, paymentStatusLabel } from '@/lib/utils'
import MarkAsPaidButton from './MarkAsPaidButton'
import Link from 'next/link'
import { ArrowLeft, Download, Send, CreditCard, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'

export const metadata = { title: 'Gastos Comunes | DOMMO' }

export default async function PagosPage({
  searchParams
}: {
  searchParams: Promise<{ filter?: string; period?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Usar adminClient + buscar por email (igual que todos los otros módulos)
  const adminSupabase = await createAdminClient()

  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('building_id, role, full_name')
    .eq('email', user.email.trim().toLowerCase())
    .maybeSingle()

  if (!profile?.building_id) redirect('/dashboard/admin')
  const buildingId = profile.building_id

  // Períodos disponibles
  const { data: periods } = await adminSupabase
    .from('fee_periods')
    .select('*')
    .eq('building_id', buildingId)
    .order('period_month', { ascending: false })

  const selectedPeriodId = params.period ?? periods?.[0]?.id
  const selectedPeriod   = periods?.find(p => p.id === selectedPeriodId) ?? periods?.[0]

  // Pagos con join a unidades
  let query = adminSupabase
    .from('payments')
    .select('*, units(number, floor, profiles!units_owner_id_fkey(full_name, email, phone))')
    .eq('building_id', buildingId)
    .order('status', { ascending: false })

  if (selectedPeriodId) query = query.eq('period_id', selectedPeriodId)
  if (params.filter && params.filter !== 'all') query = query.eq('status', params.filter)

  const { data: payments } = await query

  const stats = {
    total:      payments?.length ?? 0,
    paid:       payments?.filter(p => p.status === 'paid').length ?? 0,
    pending:    payments?.filter(p => p.status === 'pending').length ?? 0,
    overdue:    payments?.filter(p => p.status === 'overdue').length ?? 0,
    paidAmount: payments?.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0) ?? 0,
  }

  const filters = [
    { key: 'all',     label: 'Todos',      count: stats.total,   icon: null },
    { key: 'paid',    label: 'Pagados',    count: stats.paid,    icon: CheckCircle2 },
    { key: 'pending', label: 'Pendientes', count: stats.pending, icon: Clock },
    { key: 'overdue', label: 'Vencidos',   count: stats.overdue, icon: AlertTriangle },
  ]

  const activeFilter = params.filter ?? 'all'

  return (
    <div className="min-h-screen dashboard-bg">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/admin"
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
              <ArrowLeft size={15} className="text-gray-500" />
            </Link>
            <div>
              <h1 className="text-base font-bold text-gray-900">Gastos comunes</h1>
              <p className="text-xs text-gray-400">
                {selectedPeriod
                  ? `${new Date(selectedPeriod.period_month+'T12:00:00').toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })} · Vence ${new Date(selectedPeriod.due_date).toLocaleDateString('es-CL')}`
                  : 'Sin período activo'
                }
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {/* Selector de período */}
            {periods && periods.length > 1 && (
              <div className="flex gap-1">
                {periods.slice(0, 3).map(p => (
                  <Link key={p.id}
                    href={`/dashboard/pagos?period=${p.id}&filter=${activeFilter}`}
                    className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all capitalize ${
                      selectedPeriodId === p.id
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}>
                    {new Date(p.period_month+'T12:00:00').toLocaleDateString('es-CL', { month: 'short' })}
                  </Link>
                ))}
              </div>
            )}
            <button className="btn-ghost flex items-center gap-1.5 text-xs">
              <Send size={13} /> Recordatorio
            </button>
            <button className="btn-ghost flex items-center gap-1.5 text-xs">
              <Download size={13} /> Exportar
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto space-y-4">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-3">
          <div className="card p-4">
            <p className="text-xs text-gray-400 mb-1">Recaudado</p>
            <p className="text-xl font-bold text-gray-900">{formatCLP(stats.paidAmount)}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">de {formatCLP(payments?.reduce((s,p) => s+p.amount,0) ?? 0)}</p>
          </div>
          <Link href={`/dashboard/pagos?filter=paid${selectedPeriodId ? `&period=${selectedPeriodId}` : ''}`}
            className="card card-hover p-4 bg-emerald-50 border-emerald-100">
            <p className="text-xs text-emerald-600 mb-1">Pagados</p>
            <p className="text-xl font-bold text-emerald-700">{stats.paid}</p>
            <p className="text-[11px] text-emerald-500 mt-0.5">unidades</p>
          </Link>
          <Link href={`/dashboard/pagos?filter=pending${selectedPeriodId ? `&period=${selectedPeriodId}` : ''}`}
            className="card card-hover p-4 bg-amber-50 border-amber-100">
            <p className="text-xs text-amber-600 mb-1">Pendientes</p>
            <p className="text-xl font-bold text-amber-700">{stats.pending}</p>
            <p className="text-[11px] text-amber-500 mt-0.5">unidades</p>
          </Link>
          <Link href={`/dashboard/pagos?filter=overdue${selectedPeriodId ? `&period=${selectedPeriodId}` : ''}`}
            className="card card-hover p-4 bg-red-50 border-red-100">
            <p className="text-xs text-red-600 mb-1">Vencidos</p>
            <p className="text-xl font-bold text-red-700">{stats.overdue}</p>
            <p className="text-[11px] text-red-500 mt-0.5">unidades</p>
          </Link>
        </div>

        {/* Tabla */}
        <div className="card overflow-hidden">
          {/* Filtros */}
          <div className="flex border-b border-gray-100 px-4">
            {filters.map(({ key, label, count, icon: Icon }) => (
              <Link key={key}
                href={`/dashboard/pagos?filter=${key}${selectedPeriodId ? `&period=${selectedPeriodId}` : ''}`}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 transition-all ${
                  activeFilter === key
                    ? 'border-[#185FA5] text-[#185FA5]'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}>
                {Icon && <Icon size={12} />}
                {label}
                <span className={`ml-0.5 text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  activeFilter === key ? 'bg-[#E6F1FB] text-[#185FA5]' : 'bg-gray-100 text-gray-400'
                }`}>
                  {count}
                </span>
              </Link>
            ))}
          </div>

          {/* Header tabla */}
          <div className="grid grid-cols-[40px_1fr_120px_100px_120px] gap-3 px-5 py-2.5 bg-gray-50/80 text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
            <div />
            <div>Unidad / Propietario</div>
            <div className="text-right">Monto</div>
            <div className="text-center">Estado</div>
            <div className="text-center">Acción</div>
          </div>

          {/* Filas */}
          <div className="divide-y divide-gray-50">
            {!payments || payments.length === 0 ? (
              <div className="py-16 text-center">
                <CreditCard size={28} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-400">No hay pagos con este filtro</p>
              </div>
            ) : payments.map(payment => {
              const unit     = payment.units
              const owner    = Array.isArray(unit?.profiles) ? unit.profiles[0] : unit?.profiles
              const isOverdue = payment.status === 'overdue'
              const isPending = payment.status === 'pending'
              const isPaid    = payment.status === 'paid'

              return (
                <div key={payment.id}
                  className="table-row-hover grid grid-cols-[40px_1fr_120px_100px_120px] gap-3 items-center px-5 py-3.5">

                  {/* Badge número */}
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isOverdue ? 'bg-red-50 text-red-700'
                    : isPending ? 'bg-amber-50 text-amber-700'
                    : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {unit?.number ?? '?'}
                  </div>

                  {/* Info */}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {owner?.full_name ?? 'Sin propietario'}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Depto {unit?.number ?? '—'}
                      {isOverdue && ' · Vencido'}
                      {isPending && selectedPeriod && ` · Vence ${new Date(selectedPeriod.due_date).toLocaleDateString('es-CL')}`}
                      {isPaid && payment.paid_at && ` · Pagado ${new Date(payment.paid_at).toLocaleDateString('es-CL')}`}
                      {owner?.phone && ` · ${owner.phone}`}
                    </p>
                  </div>

                  {/* Monto */}
                  <p className="text-sm font-bold text-gray-900 tabular-nums text-right">
                    {formatCLP(payment.amount)}
                  </p>

                  {/* Status pill */}
                  <div className="flex justify-center">
                    <span className={`pill ${
                      isOverdue ? 'pill-red'
                      : isPending ? 'pill-amber'
                      : 'pill-green'
                    }`}>
                      {isOverdue ? 'Vencido' : isPending ? 'Pendiente' : 'Pagado'}
                    </span>
                  </div>

                  {/* Acción */}
                  <div className="flex justify-center">
                    {(isOverdue || isPending)
                      ? <MarkAsPaidButton paymentId={payment.id} />
                      : <span className="text-[11px] text-gray-300 flex items-center gap-1"><CheckCircle2 size={11} className="text-emerald-400" /> Al día</span>
                    }
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer con resumen */}
          {payments && payments.length > 0 && (
            <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                {stats.total} unidades · {stats.paid} pagadas · {stats.overdue + stats.pending} pendientes
              </p>
              <p className="text-xs font-semibold text-gray-700">
                Total recaudado: {formatCLP(stats.paidAmount)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
