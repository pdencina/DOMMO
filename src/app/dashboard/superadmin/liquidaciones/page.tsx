// @ts-nocheck
export const dynamic = 'force-dynamic'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatCLP } from '@/lib/utils'
import {
  ArrowLeft, TrendingUp, Building2,
  CheckCircle2, Clock, DollarSign, Download, AlertTriangle
} from 'lucide-react'
import TransferButton from './TransferButton'
import BuildingFilter from './BuildingFilter'

export const metadata = { title: 'Liquidaciones | DOMMO' }

export default async function LiquidacionesPage({
  searchParams
}: {
  searchParams: Promise<{ building?: string; status?: string }>
}) {
  const params        = await searchParams
  const supabase      = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const adminSupabase = await createAdminClient()
  const { data: profile } = await adminSupabase
    .from('profiles').select('role').eq('email', user.email.trim().toLowerCase()).maybeSingle()
  if (!profile || profile.role !== 'superadmin') redirect('/dashboard')

  // Edificios para filtro
  const { data: buildings } = await adminSupabase
    .from('buildings').select('id, name').order('name')

  // Verificar si la tabla distributions existe
  const { data: distributions, error: distError } = await adminSupabase
    .from('distributions')
    .select(`
      *,
      buildings(id, name, slug),
      payments(id, amount, paid_at, units(number))
    `)
    .order('created_at', { ascending: false })
    .limit(200)

  // Si la tabla no existe aún, mostrar instrucción
  if (distError?.code === '42P01') {
    return (
      <div className="min-h-screen dashboard-bg flex items-center justify-center p-6">
        <div className="card max-w-lg w-full p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={24} className="text-amber-600" />
          </div>
          <h2 className="text-base font-bold text-gray-900 mb-2">Tabla pendiente de crear</h2>
          <p className="text-sm text-gray-500 mb-5">
            Ejecuta el SQL de distribuciones en Supabase para activar este módulo.
          </p>
          <div className="bg-gray-900 rounded-xl p-4 text-left mb-5">
            <p className="text-xs text-emerald-400 font-mono">
              → Supabase → SQL Editor → pegar <strong>supabase/distributions.sql</strong> → Run
            </p>
          </div>
          <Link href="/dashboard/superadmin" className="btn-primary text-sm px-6 py-2.5 inline-block">
            Volver al panel
          </Link>
        </div>
      </div>
    )
  }

  // Filtrar en memoria (evita problemas de RLS con joins complejos)
  const filtered = (distributions ?? []).filter(d => {
    if (params.building && d.building_id !== params.building) return false
    if (params.status && params.status !== 'all' && d.status !== params.status) return false
    return true
  })

  const totalGross   = filtered.reduce((s, d) => s + (d.gross_amount     ?? 0), 0)
  const totalComm    = filtered.reduce((s, d) => s + (d.commission_total ?? 0), 0)
  const totalNet     = filtered.reduce((s, d) => s + (d.net_amount       ?? 0), 0)
  const pendingItems = filtered.filter(d => d.status === 'pending')
  const pendingNet   = pendingItems.reduce((s, d) => s + (d.net_amount   ?? 0), 0)
  const doneCount    = filtered.filter(d => d.status === 'transferred').length

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
              <p className="text-xs text-gray-400">Comisiones DOMMO y neto a edificios</p>
            </div>
          </div>
          <button className="btn-ghost flex items-center gap-1.5 text-xs">
            <Download size={13} /> Exportar
          </button>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total recaudado',  value: formatCLP(totalGross),       sub: `${filtered.length} transacciones`,  icon: TrendingUp,  bg: 'bg-blue-50',    color: 'text-blue-600'    },
            { label: 'Comisión DOMMO',   value: formatCLP(totalComm),        sub: '1,9% + IVA por transacción',         icon: DollarSign,  bg: 'bg-purple-50',  color: 'text-purple-600'  },
            { label: 'Neto a edificios', value: formatCLP(totalNet),         sub: `${doneCount} ya transferidos`,       icon: Building2,   bg: 'bg-emerald-50', color: 'text-emerald-600' },
            { label: 'Por transferir',   value: formatCLP(pendingNet),       sub: `${pendingItems.length} pendientes`,  icon: Clock,       bg: 'bg-amber-50',   color: 'text-amber-600'   },
          ].map(({ label, value, sub, icon: Icon, bg, color }) => (
            <div key={label} className="card p-4 flex items-start gap-3">
              <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={16} className={color} />
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
        {pendingItems.length > 0 && (
          <div className="alert-banner alert-banner-amber">
            <Clock size={15} className="flex-shrink-0" />
            <p className="flex-1">
              <span className="font-bold">{pendingItems.length} liquidaciones</span> pendientes por transferir ·{' '}
              Neto total: <span className="font-bold">{formatCLP(pendingNet)}</span>
            </p>
          </div>
        )}

        {/* Tabla */}
        <div className="card overflow-hidden">

          {/* Filtros */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 flex-wrap">
            <div className="flex gap-1">
              {[
                { key: 'all',         label: 'Todos',          count: filtered.length },
                { key: 'pending',     label: 'Por transferir', count: pendingItems.length },
                { key: 'transferred', label: 'Transferidos',   count: doneCount },
              ].map(f => (
                <Link key={f.key}
                  href={`/dashboard/superadmin/liquidaciones?status=${f.key}${params.building ? `&building=${params.building}` : ''}`}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeStatus === f.key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}>
                  {f.label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    activeStatus === f.key ? 'bg-white/20 text-white' : 'bg-white text-gray-500'
                  }`}>{f.count}</span>
                </Link>
              ))}
            </div>
            <div className="flex-1" />
            <BuildingFilter buildings={buildings ?? []} selected={params.building ?? ''} status={activeStatus} />
          </div>

          {/* Header tabla */}
          <div className="grid grid-cols-[1fr_90px_110px_110px_90px_110px_90px] gap-2 px-4 py-2.5 bg-gray-50/80 text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
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
            {filtered.length === 0 ? (
              <div className="py-16 text-center">
                <DollarSign size={28} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400 font-medium">Sin liquidaciones aún</p>
                <p className="text-xs text-gray-300 mt-1">Aparecerán cuando los residentes paguen online</p>
              </div>
            ) : filtered.map(d => {
              const building  = d.buildings
              const unit      = d.payments?.units
              const isPending = d.status === 'pending'
              const isDone    = d.status === 'transferred'

              return (
                <div key={d.id}
                  className="table-row-hover grid grid-cols-[1fr_90px_110px_110px_90px_110px_90px] gap-2 items-center px-4 py-3.5">

                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#E1F5EE] flex items-center justify-center flex-shrink-0">
                      <Building2 size={13} className="text-[#0F6E56]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">{building?.name ?? '—'}</p>
                      <p className="text-[11px] text-gray-400">
                        Depto {unit?.number ?? '—'} · WebPay
                        {d.tbk_auth_code && <span className="ml-1 font-mono text-[10px]">#{d.tbk_auth_code}</span>}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-gray-900 text-right tabular-nums">{formatCLP(d.gross_amount)}</p>

                  <div className="text-right">
                    <p className="text-xs font-semibold text-purple-700 tabular-nums">{formatCLP(d.commission_total)}</p>
                    <p className="text-[10px] text-gray-400">1,9%+IVA</p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-700 tabular-nums">{formatCLP(d.net_amount)}</p>
                    <p className="text-[10px] text-gray-400">para edificio</p>
                  </div>

                  <div className="flex justify-center">
                    <span className={`pill ${isPending ? 'pill-amber' : isDone ? 'pill-green' : 'pill-gray'}`}>
                      {isPending ? 'Pendiente' : isDone ? 'Transferido' : 'Cancelado'}
                    </span>
                  </div>

                  <div className="text-center">
                    <p className="text-[11px] text-gray-400">
                      {new Date(d.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </p>
                    {isDone && d.transferred_at && (
                      <p className="text-[10px] text-emerald-600">
                        ✓ {new Date(d.transferred_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-center">
                    {isPending
                      ? <TransferButton distributionId={d.id} netAmount={d.net_amount} buildingName={building?.name ?? '?'} />
                      : isDone
                        ? <span className="flex items-center gap-1 text-[11px] text-emerald-600"><CheckCircle2 size={11} /> Listo</span>
                        : <span className="text-[11px] text-gray-300">—</span>
                    }
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer totales */}
          {filtered.length > 0 && (
            <div className="px-4 py-3 bg-gray-50/60 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400">{filtered.length} transacción{filtered.length !== 1 ? 'es' : ''}</p>
              <div className="flex gap-5 text-xs">
                <span className="text-gray-500">Bruto: <span className="font-bold text-gray-700">{formatCLP(totalGross)}</span></span>
                <span className="text-purple-700">Comisión: <span className="font-bold">{formatCLP(totalComm)}</span></span>
                <span className="text-emerald-700">Neto: <span className="font-bold">{formatCLP(totalNet)}</span></span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
