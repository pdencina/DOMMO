// @ts-nocheck
export const dynamic = 'force-dynamic'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCLP } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, Download, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

export const metadata = { title: 'Reportes | DOMMO' }

export default async function ReportesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const adminSupabase = await createAdminClient()
  const { data: profile } = await adminSupabase
    .from('profiles').select('building_id').eq('email', user.email.trim().toLowerCase()).maybeSingle()
  if (!profile?.building_id) redirect('/dashboard')
  const buildingId = profile.building_id

  // Últimos 6 meses
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - i)
    return d.toISOString().split('T')[0]
  }).reverse()

  const [
    { data: periods },
    { data: allPayments },
    { data: expenses },
    { data: building },
  ] = await Promise.all([
    adminSupabase.from('fee_periods').select('*').eq('building_id', buildingId).in('period_month', months),
    adminSupabase.from('payments').select('*').eq('building_id', buildingId),
    adminSupabase.from('expenses').select('*').eq('building_id', buildingId)
      .gte('expense_date', months[0]),
    adminSupabase.from('buildings').select('name, total_units').eq('id', buildingId).single(),
  ])

  const totalIncome = allPayments?.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0) ?? 0
  const totalExpense = expenses?.reduce((s, e) => s + e.amount, 0) ?? 0
  const balance = totalIncome - totalExpense

  // Por mes
  const monthlyData = months.map(m => {
    const period = periods?.find(p => p.period_month === m)
    const monthPayments = allPayments?.filter(p =>
      period && p.period_id === period.id
    ) ?? []
    const paid   = monthPayments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
    const total  = monthPayments.reduce((s, p) => s + p.amount, 0)
    const pct    = total > 0 ? Math.round((paid / total) * 100) : 0
    const label  = new Date(m + 'T12:00:00').toLocaleDateString('es-CL', { month: 'short', year: '2-digit' })
    return { label, paid, total, pct }
  })

  // Gastos por categoría
  const expenseByCategory = (expenses ?? []).reduce((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount
    return acc
  }, {} as Record<string, number>)

  const maxMonthly = Math.max(...monthlyData.map(m => m.total), 1)

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/admin" className="text-gray-400 hover:text-gray-600 transition">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-base font-semibold text-gray-900">Reportes financieros</h1>
            <p className="text-xs text-gray-400">{building?.name} · Últimos 6 meses</p>
          </div>
        </div>
        <button className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition">
          <Download size={13} /> Exportar PDF
        </button>
      </div>

      <div className="p-6 max-w-5xl mx-auto space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <TrendingUp size={15} className="text-emerald-600" />
              </div>
              <p className="text-xs text-gray-400">Total ingresos</p>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{formatCLP(totalIncome)}</p>
            <p className="text-xs text-gray-400 mt-1">Gastos comunes cobrados</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                <TrendingDown size={15} className="text-red-500" />
              </div>
              <p className="text-xs text-gray-400">Total egresos</p>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{formatCLP(totalExpense)}</p>
            <p className="text-xs text-gray-400 mt-1">{expenses?.length ?? 0} transacciones</p>
          </div>

          <div className={`rounded-xl border p-5 ${balance >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${balance >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
                <DollarSign size={15} className={balance >= 0 ? 'text-emerald-700' : 'text-red-700'} />
              </div>
              <p className={`text-xs ${balance >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>Balance neto</p>
            </div>
            <p className={`text-2xl font-semibold ${balance >= 0 ? 'text-emerald-800' : 'text-red-800'}`}>
              {formatCLP(Math.abs(balance))}
            </p>
            <p className={`text-xs mt-1 ${balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {balance >= 0 ? 'Superávit' : 'Déficit'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">

          {/* Gráfico barras recaudación mensual */}
          <div className="col-span-2 bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-5">Recaudación mensual</h2>
            <div className="flex items-end gap-3 h-36">
              {monthlyData.map(({ label, paid, total, pct }) => (
                <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] text-gray-400 font-medium">{pct}%</span>
                  <div className="w-full flex flex-col justify-end rounded-t-md overflow-hidden bg-gray-100"
                    style={{ height: `${Math.round((total / maxMonthly) * 100)}%`, minHeight: '8px' }}>
                    <div
                      className="bg-[#0F6E56] rounded-t-md w-full transition-all"
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 text-center">{label}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-4 text-[10px] text-gray-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#0F6E56] inline-block" />Recaudado</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-gray-200 inline-block" />Meta</span>
            </div>
          </div>

          {/* Egresos por categoría */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Egresos por categoría</h2>
            {Object.keys(expenseByCategory).length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">Sin egresos registrados</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(expenseByCategory)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 6)
                  .map(([cat, amount]) => {
                    const pct = Math.round((amount / totalExpense) * 100)
                    return (
                      <div key={cat}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600 capitalize">{cat}</span>
                          <span className="text-gray-500 font-medium">{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#185FA5] rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        </div>

        {/* Tabla detalle mensual */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Detalle por mes</h2>
          </div>
          <div className="divide-y divide-gray-50">
            <div className="grid grid-cols-4 px-5 py-2.5 bg-gray-50 text-[10px] font-medium text-gray-400 uppercase tracking-wider">
              <div>Período</div>
              <div className="text-right">Meta</div>
              <div className="text-right">Recaudado</div>
              <div className="text-right">% Cobro</div>
            </div>
            {monthlyData.map(({ label, paid, total, pct }) => (
              <div key={label} className="grid grid-cols-4 px-5 py-3 text-sm hover:bg-gray-50 transition">
                <div className="text-gray-700 capitalize">{label}</div>
                <div className="text-right text-gray-500">{formatCLP(total)}</div>
                <div className="text-right font-medium text-gray-900">{formatCLP(paid)}</div>
                <div className={`text-right font-medium ${pct >= 90 ? 'text-emerald-600' : pct >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                  {pct}%
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
