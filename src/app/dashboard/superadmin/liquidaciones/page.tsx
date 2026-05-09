// @ts-nocheck
export const dynamic = 'force-dynamic'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatCLP } from '@/lib/utils'
import {
  ArrowLeft, TrendingUp, Building2,
  CheckCircle2, Clock, DollarSign, Download
} from 'lucide-react'
import TransferButton from './TransferButton'

export const metadata = { title: 'Liquidaciones | DOMMO' }

export default async function LiquidacionesPage({
  searchParams
}: {
  searchParams: Promise<{ building?: string; status?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const adminSupabase = await createAdminClient()
  const { data: profile } = await adminSupabase
    .from('profiles').select('role').eq('email', user.email.trim().toLowerCase()).maybeSingle()
  if (!profile || profile.role !== 'superadmin') redirect('/dashboard')

  // Todos los edificios para el filtro
  const { data: buildings } = await adminSupabase
    .from('buildings').select('id, name, slug').order('name')

  // Query distribuciones con joins
  let query = adminSupabase
    .from('distributions')
    .select(`
      *,
      buildings(id, name, slug),
      payments(
        id, amount, paid_at, payment_method,
        units(number)
      )
    `)
    .order('created_at', { ascending: false })

  if (params.building) query = query.eq('building_id', params.building)
  if (params.status && params.status !== 'all') query = query.eq('status', params.status)

  const { data: distributions } = await query

  // KPIs globales
  const totalGross    = distributions?.reduce((s, d) => s + d.gross_amount,     0) ?? 0
  const totalComm     = distributions?.reduce((s, d) => s + d.commission_total, 0) ?? 0
  const totalNet      = distributions?.reduce((s, d) => s + d.net_amount,       0) ?? 0
  const pendingNet    = distributions?.filter(d => d.status === 'pending')
                        .reduce((s, d) => s + d.net_amount, 0) ?? 0
  const pendingCount  = distributions?.filter(d => d.status === 'pending').length ?? 0
  const transferCount = distributions?.filter(d => d.status === 'transferred').length ?? 0

  const activeStatus = params.status ?? 'all'

  return (
    <div className="min-h-screen dashboard-bg">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/superadmin"
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
              <ArrowLeft size={15} className="text-gray-500" />
            </Link>
            <div>
              <h1 className="text-base font-bold text-gray-900">Liquidaciones</h1>
              <p className="text-xs text-gray-400">Distribución de pagos entre DOMMO y edificios</p>
            </div>
          </div>
          <button className="btn-ghost flex items-center gap-1.5 text-xs">
            <Download size={13} /> Exportar CSV
          </button>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total recaudado',    value: formatCLP(totalGross),  sub: `${distributions?.length ?? 0} transacciones`, icon: TrendingUp,    iconBg: 'bg-blue-50',    iconColor: 'text-blue-600'    },
            { label: 'Comisión DOMMO',     value: formatCLP(totalComm),   sub: '1,9% + IVA por pago',                         icon: DollarSign,   iconBg: 'bg-purple-50',  iconColor: 'text-purple-600'  },
            { label: 'Neto a edificios',   value: formatCLP(totalNet),    sub: `${transferCount} transferidos`,               icon: Building2,    iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
            { label: 'Por transferir',     value: formatCLP(pendingNet),  sub: `${pendingCount} pendientes`,                  icon: Clock,        iconBg: 'bg-amber-50',   iconColor: 'text-amber-600'   },
          ].map(({ label, value, sub, icon: Icon, iconBg, iconColor }) => (
            <div key={label} className="card p-4 flex items-start gap-3">
              <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={16} className={iconColor} />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 mb-0.5">{label}</p>
                <p className="text-xl font-bold text-gray-900">{value}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Alerta pendientes */}
        {pendingCount > 0 && (
          <div className="alert-banner alert-banner-amber">
            <Clock size={15} className="flex-shrink-0" />
            <p className="flex-1">
              <span className="font-bold">{pendingCount} liquidaciones pendientes</span> por un total de{' '}
              <span className="font-bold">{formatCLP(pendingNet)}</span> neto a transferir a los edificios.
            </p>
          </div>
        )}

        {/* Filtros */}
        <div className="card overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            {/* Filtro por estado */}
            <div className="flex gap-1">
              {[
                { key: 'all',         label: 'Todos',         count: distributions?.length ?? 0 },
                { key: 'pending',     label: 'Por transferir', count: pendingCount },
                { key: 'transferred', label: 'Transferidos',   count: transferCount },
              ].map(f => (
                <Link key={f.key}
                  href={`/dashboard/superadmin/liquidaciones?status=${f.key}${params.building ? `&building=${params.building}` : ''}`}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeStatus === f.key
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}>
                  {f.label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    activeStatus === f.key ? 'bg-white/20 text-white' : 'bg-white text-gray-500'
                  }`}>{f.count}</span>
                </Link>
              ))}
            </div>

            <div className="flex-1" />

            {/* Filtro por edificio */}
            <select
              defaultValue={params.building ?? ''}
              onChange={e => {
                const url = new URL(window.location.href)
                if (e.target.value) url.searchParams.set('building', e.target.value)
                else url.searchParams.delete('building')
                window.location.href = url.toString()
              }}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-600 outline-none focus:border-[#0F6E56]"
            >
              <option value="">Todos los edificios</option>
              {(buildings ?? []).map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Header tabla */}
          <div className="grid grid-cols-[1fr_100px_110px_110px_110px_120px_100px] gap-2 px-4 py-2.5 bg-gray-50/80 text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
            <div>Edificio / Depto</div>
            <div className="text-right">Bruto</div>
            <div className="text-right">Comisión</div>
            <div className="text-right">Neto</div>
            <div className="text-center">Estado</div>
            <div className="text-center">Fecha</div>
            <div className="text-center">Acción</div>
          </div>

          {/* Filas */}
          <div className="divide-y divide-gray-50">
            {!distributions || distributions.length === 0 ? (
              <div className="py-16 text-center">
                <DollarSign size={28} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">Sin liquidaciones aún</p>
                <p className="text-xs text-gray-300 mt-1">Aparecerán aquí cuando los residentes paguen online</p>
              </div>
            ) : distributions.map(d => {
              const building = d.buildings
              const payment  = d.payments
              const unit     = payment?.units
              const isPending = d.status === 'pending'
              const isDone    = d.status === 'transferred'

              return (
                <div key={d.id}
                  className="table-row-hover grid grid-cols-[1fr_100px_110px_110px_110px_120px_100px] gap-2 items-center px-4 py-3.5">

                  {/* Edificio + depto */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#E1F5EE] flex items-center justify-center flex-shrink-0">
                      <Building2 size={14} className="text-[#0F6E56]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">{building?.name ?? '—'}</p>
                      <p className="text-[11px] text-gray-400">Depto {unit?.number ?? '—'} · WebPay</p>
                    </div>
                  </div>

                  {/* Bruto */}
                  <p className="text-xs font-semibold text-gray-900 text-right tabular-nums">
                    {formatCLP(d.gross_amount)}
                  </p>

                  {/* Comisión DOMMO */}
                  <div className="text-right">
                    <p className="text-xs font-semibold text-purple-700 tabular-nums">{formatCLP(d.commission_total)}</p>
                    <p className="text-[10px] text-gray-400">1,9%+IVA</p>
                  </div>

                  {/* Neto edificio */}
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-700 tabular-nums">{formatCLP(d.net_amount)}</p>
                    <p className="text-[10px] text-gray-400">para edificio</p>
                  </div>

                  {/* Estado */}
                  <div className="flex justify-center">
                    <span className={`pill ${isPending ? 'pill-amber' : isDone ? 'pill-green' : 'pill-gray'}`}>
                      {isPending ? 'Pendiente' : isDone ? 'Transferido' : 'Cancelado'}
                    </span>
                  </div>

                  {/* Fecha */}
                  <p className="text-[11px] text-gray-400 text-center">
                    {new Date(d.created_at).toLocaleDateString('es-CL', {
                      day: 'numeric', month: 'short', year: '2-digit'
                    })}
                    {isDone && d.transferred_at && (
                      <span className="block text-emerald-600">
                        ✓ {new Date(d.transferred_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </p>

                  {/* Acción */}
                  <div className="flex justify-center">
                    {isPending
                      ? <TransferButton distributionId={d.id} netAmount={d.net_amount} buildingName={building?.name ?? '?'} />
                      : isDone
                        ? <span className="flex items-center gap-1 text-[11px] text-emerald-600">
                            <CheckCircle2 size={12} /> Listo
                          </span>
                        : <span className="text-[11px] text-gray-300">—</span>
                    }
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer totales */}
          {distributions && distributions.length > 0 && (
            <div className="px-4 py-3 bg-gray-50/60 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                {distributions.length} transacción{distributions.length !== 1 ? 'es' : ''}
              </p>
              <div className="flex gap-6 text-xs">
                <span className="text-gray-500">Bruto: <span className="font-bold text-gray-700">{formatCLP(totalGross)}</span></span>
                <span className="text-purple-600">Comisión: <span className="font-bold">{formatCLP(totalComm)}</span></span>
                <span className="text-emerald-700">Neto total: <span className="font-bold">{formatCLP(totalNet)}</span></span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
