// @ts-nocheck
export const dynamic = 'force-dynamic'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCLP } from '@/lib/utils'
import Link from 'next/link'
import { BarChart2, Users, Wrench, FileText, LogOut } from 'lucide-react'
import LogoutButton from '@/components/dashboard/LogoutButton'

export const metadata = { title: 'Comité | DOMMO' }

export default async function CommitteePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const adminSupabase = await createAdminClient()
  const { data: profile } = await adminSupabase
    .from('profiles').select('*, buildings(*)').eq('email', user.email.trim().toLowerCase()).maybeSingle()

  if (!profile || profile.role !== 'committee') redirect('/dashboard')
  if (!profile.building_id) redirect('/dashboard')

  const buildingId = profile.building_id
  const building = profile.buildings

  const [
    { data: payments },
    { data: maintenances },
    { data: expenses },
    { data: units },
    { data: notices },
  ] = await Promise.all([
    adminSupabase.from('payments').select('status, amount').eq('building_id', buildingId),
    adminSupabase.from('maintenances').select('*').eq('building_id', buildingId).neq('status', 'done').order('priority', { ascending: false }),
    adminSupabase.from('expenses').select('*').eq('building_id', buildingId).order('expense_date', { ascending: false }).limit(8),
    adminSupabase.from('units').select('id').eq('building_id', buildingId),
    adminSupabase.from('notices').select('*').eq('building_id', buildingId).order('published_at', { ascending: false }).limit(4),
  ])

  const totalIncome = payments?.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0) ?? 0
  const totalExpense = expenses?.reduce((s, e) => s + e.amount, 0) ?? 0
  const balance = totalIncome - totalExpense
  const overdueCount = payments?.filter(p => p.status === 'overdue').length ?? 0
  const collectionPct = payments && payments.length > 0
    ? Math.round((payments.filter(p => p.status === 'paid').length / payments.length) * 100) : 0

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-gray-900">Panel Comité</h1>
          <p className="text-xs text-gray-400">{building?.name} · {profile.full_name}</p>
        </div>
        <LogoutButton />
      </div>

      <div className="p-6 max-w-5xl mx-auto space-y-5">

        {/* KPIs solo lectura */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Recaudación', value: formatCLP(totalIncome), sub: `${collectionPct}% del total`, color: 'text-emerald-600' },
            { label: 'Egresos', value: formatCLP(totalExpense), sub: `${expenses?.length ?? 0} gastos`, color: 'text-red-500' },
            { label: 'Balance', value: formatCLP(Math.abs(balance)), sub: balance >= 0 ? 'Superávit' : 'Déficit', color: balance >= 0 ? 'text-emerald-600' : 'text-red-500' },
            { label: 'Morosos', value: overdueCount, sub: `de ${units?.length ?? 0} unidades`, color: 'text-amber-600' },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs text-gray-400 mb-1">{label}</p>
              <p className={`text-xl font-semibold ${color}`}>{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">

          {/* Mantenciones en curso */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
              <Wrench size={13} className="text-amber-500" />
              <h2 className="text-sm font-semibold text-gray-900">Mantenciones activas</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {!maintenances || maintenances.length === 0 ? (
                <p className="px-4 py-4 text-xs text-gray-400">Sin mantenciones activas</p>
              ) : maintenances.map(m => (
                <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    m.priority === 'urgent' ? 'bg-red-500' : m.priority === 'high' ? 'bg-amber-500' : 'bg-blue-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{m.title}</p>
                    <p className="text-[10px] text-gray-400">{m.category} · {m.status === 'in_progress' ? 'En progreso' : 'Pendiente'}</p>
                  </div>
                  {m.estimated_cost && (
                    <p className="text-xs text-gray-500">{formatCLP(m.estimated_cost)}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Últimos gastos */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
              <FileText size={13} className="text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-900">Últimos egresos</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {!expenses || expenses.length === 0 ? (
                <p className="px-4 py-4 text-xs text-gray-400">Sin egresos registrados</p>
              ) : expenses.map(e => (
                <div key={e.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{e.description}</p>
                    <p className="text-[10px] text-gray-400 capitalize">{e.category} · {new Date(e.expense_date).toLocaleDateString('es-CL')}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{formatCLP(e.amount)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Últimos avisos */}
          <div className="col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Avisos del edificio</h2>
            </div>
            <div className="grid grid-cols-2 divide-x divide-gray-50">
              {!notices || notices.length === 0 ? (
                <p className="col-span-2 px-4 py-4 text-xs text-gray-400">Sin avisos</p>
              ) : notices.map(n => (
                <div key={n.id} className="px-4 py-3">
                  <p className="text-xs font-medium text-gray-800 truncate">{n.title}</p>
                  <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{n.body}</p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {new Date(n.published_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
