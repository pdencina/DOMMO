// @ts-nocheck
export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCLP, formatDate, daysUntil, paymentStatusLabel } from '@/lib/utils'
import MarkAsPaidButton from './MarkAsPaidButton'
import Link from 'next/link'
import { ArrowLeft, Download, Send } from 'lucide-react'

export const metadata = { title: 'Gastos Comunes' }

export default async function PagosPage({
  searchParams
}: {
  searchParams: Promise<{ filter?: string; period?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await (supabase as any)
    .from('profiles').select('building_id').eq('id', user.id).single()
  const buildingId = profile?.building_id
  if (!buildingId) redirect('/login')

  // Períodos disponibles
  const { data: periods } = await supabase
    .from('fee_periods')
    .select('*')
    .eq('building_id', buildingId)
    .order('period_month', { ascending: false })

  const selectedPeriodId = params.period ?? periods?.[0]?.id
  const selectedPeriod = periods?.find(p => p.id === selectedPeriodId) ?? periods?.[0]

  // Pagos del período seleccionado
  let query = supabase
    .from('payments')
    .select(`
      *,
      units(number, floor),
      unit_owner:units(owner_profile:profiles!units_owner_id_fkey(full_name, email, phone))
    `)
    .eq('building_id', buildingId)
    .order('status', { ascending: false })

  if (selectedPeriodId) {
    query = query.eq('period_id', selectedPeriodId)
  }

  if (params.filter && params.filter !== 'all') {
    query = query.eq('status', params.filter)
  }

  const { data: payments } = await query

  const stats = {
    total: payments?.length ?? 0,
    paid: payments?.filter(p => p.status === 'paid').length ?? 0,
    pending: payments?.filter(p => p.status === 'pending').length ?? 0,
    overdue: payments?.filter(p => p.status === 'overdue').length ?? 0,
    paidAmount: payments?.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0) ?? 0,
  }

  const filters = [
    { key: 'all',     label: 'Todos',      count: stats.total },
    { key: 'paid',    label: 'Pagados',    count: stats.paid },
    { key: 'pending', label: 'Pendientes', count: stats.pending },
    { key: 'overdue', label: 'Vencidos',   count: stats.overdue },
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Gastos comunes</h1>
            <p className="text-sm text-gray-400">
              {selectedPeriod
                ? `${new Date(selectedPeriod.period_month).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })} · Vence ${new Date(selectedPeriod.due_date).toLocaleDateString('es-CL')}`
                : 'Sin período activo'
              }
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
            <Send size={13} /> Recordatorio masivo
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
            <Download size={13} /> Exportar
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-400 mb-1">Recaudado</p>
          <p className="text-xl font-semibold text-gray-900">{formatCLP(stats.paidAmount)}</p>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4">
          <p className="text-xs text-emerald-600 mb-1">Pagados</p>
          <p className="text-xl font-semibold text-emerald-700">{stats.paid}</p>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-100 p-4">
          <p className="text-xs text-amber-600 mb-1">Pendientes</p>
          <p className="text-xl font-semibold text-amber-700">{stats.pending}</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-100 p-4">
          <p className="text-xs text-red-600 mb-1">Vencidos</p>
          <p className="text-xl font-semibold text-red-700">{stats.overdue}</p>
        </div>
      </div>

      {/* Filtros + tabla */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* Filter tabs */}
        <div className="flex border-b border-gray-100 px-4">
          {filters.map(f => (
            <Link
              key={f.key}
              href={`/dashboard/pagos?filter=${f.key}${selectedPeriodId ? `&period=${selectedPeriodId}` : ''}`}
              className={`px-4 py-3 text-xs font-medium border-b-2 transition ${
                (params.filter ?? 'all') === f.key
                  ? 'border-[#185FA5] text-[#185FA5]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {f.label}
              <span className="ml-1.5 bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded-full">
                {f.count}
              </span>
            </Link>
          ))}
        </div>

        {/* Table header */}
        <div className="grid grid-cols-[36px_1fr_auto_auto_auto] gap-3 px-4 py-2.5 bg-gray-50 text-[10px] font-medium text-gray-400 uppercase tracking-wider">
          <div></div>
          <div>Propietario / Unidad</div>
          <div className="text-right">Monto</div>
          <div className="text-center">Estado</div>
          <div className="text-center">Acción</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-50">
          {(payments ?? []).length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">
              No hay pagos con este filtro
            </div>
          ) : (payments ?? []).map(payment => {
            const unit = payment.units as any
            const ownerData = (payment.unit_owner as any)?.[0]?.owner_profile
            const status = paymentStatusLabel(payment.status)
            const isOverdue = payment.status === 'overdue'
            const isPending = payment.status === 'pending'

            return (
              <div
                key={payment.id}
                className="grid grid-cols-[36px_1fr_auto_auto_auto] gap-3 items-center px-4 py-3 hover:bg-gray-50 transition"
              >
                {/* Badge */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-semibold ${
                  isOverdue ? 'bg-red-50 text-red-700'
                  : isPending ? 'bg-amber-50 text-amber-700'
                  : 'bg-emerald-50 text-emerald-700'
                }`}>
                  {unit?.number}
                </div>

                {/* Info */}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {ownerData?.full_name ?? 'Sin propietario'}
                  </p>
                  <p className="text-xs text-gray-400">
                    Depto {unit?.number}
                    {isOverdue && ' · Vencido'}
                    {isPending && selectedPeriod && ` · Vence en ${daysUntil(selectedPeriod.due_date)} días`}
                    {payment.status === 'paid' && payment.paid_at && ` · Pagado ${new Date(payment.paid_at).toLocaleDateString('es-CL')}`}
                  </p>
                </div>

                {/* Monto */}
                <p className="text-sm font-semibold text-gray-900 tabular-nums">
                  {formatCLP(payment.amount)}
                </p>

                {/* Status */}
                <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${
                  isOverdue ? 'bg-red-50 text-red-700'
                  : isPending ? 'bg-amber-50 text-amber-700'
                  : 'bg-emerald-50 text-emerald-700'
                }`}>
                  {status.label}
                </span>

                {/* Acción */}
                <div className="flex justify-center">
                  {(isOverdue || isPending) ? (
                    <MarkAsPaidButton paymentId={payment.id} />
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
