// @ts-nocheck
export const dynamic = 'force-dynamic'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Wrench, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react'
import NewMaintenanceForm from './NewMaintenanceForm'

export const metadata = { title: 'Mantenciones | DOMMO' }

const priorityConfig = {
  urgent:  { label: 'Urgente', class: 'bg-red-50 text-red-700 border-red-200' },
  high:    { label: 'Alta',    class: 'bg-amber-50 text-amber-700 border-amber-200' },
  normal:  { label: 'Normal',  class: 'bg-blue-50 text-blue-700 border-blue-200' },
  low:     { label: 'Baja',    class: 'bg-gray-100 text-gray-600 border-gray-200' },
}

const statusConfig = {
  pending:     { label: 'Pendiente',   icon: Clock,          class: 'text-amber-600' },
  in_progress: { label: 'En progreso', icon: Wrench,         class: 'text-blue-600' },
  done:        { label: 'Completada',  icon: CheckCircle2,   class: 'text-emerald-600' },
  cancelled:   { label: 'Cancelada',   icon: AlertTriangle,  class: 'text-gray-400' },
}

const categories = ['Ascensor', 'Eléctrico', 'Plomería', 'Jardinería', 'Seguridad', 'Pintura', 'Estructura', 'General']

export default async function MantencionesPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string; nueva?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const adminSupabase = await createAdminClient()
  const { data: profile } = await adminSupabase
    .from('profiles').select('building_id, role').eq('email', user.email.trim().toLowerCase()).maybeSingle()

  if (!profile || !profile.building_id) redirect('/dashboard')
  const buildingId = profile.building_id

  let query = adminSupabase
    .from('maintenances')
    .select('*, reporter:profiles!maintenances_reported_by_fkey(full_name)')
    .eq('building_id', buildingId)
    .order('created_at', { ascending: false })

  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status)
  }

  const { data: maintenances } = await query

  const stats = {
    pending:     maintenances?.filter(m => m.status === 'pending').length ?? 0,
    in_progress: maintenances?.filter(m => m.status === 'in_progress').length ?? 0,
    done:        maintenances?.filter(m => m.status === 'done').length ?? 0,
    urgent:      maintenances?.filter(m => m.priority === 'urgent').length ?? 0,
  }

  const showForm = params.nueva === '1'

  const filters = [
    { key: 'all',         label: 'Todas',        count: maintenances?.length ?? 0 },
    { key: 'pending',     label: 'Pendientes',    count: stats.pending },
    { key: 'in_progress', label: 'En progreso',   count: stats.in_progress },
    { key: 'done',        label: 'Completadas',   count: stats.done },
  ]

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/admin" className="text-gray-400 hover:text-gray-600 transition">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-base font-semibold text-gray-900">Mantenciones</h1>
            <p className="text-xs text-gray-400">{maintenances?.length ?? 0} registros</p>
          </div>
        </div>
        <Link
          href="/dashboard/mantenciones?nueva=1"
          className="flex items-center gap-1.5 text-xs text-white bg-[#0F6E56] px-3 py-2 rounded-lg hover:bg-[#085041] transition"
        >
          <Plus size={13} /> Nueva mantención
        </Link>
      </div>

      <div className="p-6 max-w-5xl mx-auto space-y-4">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Pendientes', value: stats.pending, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
            { label: 'En progreso', value: stats.in_progress, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
            { label: 'Completadas', value: stats.done, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
            { label: 'Urgentes', value: stats.urgent, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
          ].map(({ label, value, color, bg, border }) => (
            <div key={label} className={`${bg} border ${border} rounded-xl p-4`}>
              <p className={`text-2xl font-semibold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Formulario nueva mantención */}
        {showForm && (
          <NewMaintenanceForm buildingId={buildingId} categories={categories} />
        )}

        {/* Tabla */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {/* Filtros */}
          <div className="flex border-b border-gray-100 px-4">
            {filters.map(f => (
              <Link key={f.key} href={`/dashboard/mantenciones?status=${f.key}`}
                className={`px-4 py-3 text-xs font-medium border-b-2 transition ${
                  (params.status ?? 'all') === f.key
                    ? 'border-[#0F6E56] text-[#0F6E56]'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}>
                {f.label}
                <span className="ml-1.5 bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded-full">
                  {f.count}
                </span>
              </Link>
            ))}
          </div>

          {!maintenances || maintenances.length === 0 ? (
            <div className="py-16 text-center">
              <Wrench size={28} className="text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">Sin mantenciones en este estado</p>
              <Link href="/dashboard/mantenciones?nueva=1"
                className="mt-3 inline-block text-xs text-[#0F6E56] hover:underline">
                + Crear la primera
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {maintenances.map(m => {
                const priority = priorityConfig[m.priority] ?? priorityConfig.normal
                const status = statusConfig[m.status] ?? statusConfig.pending
                const StatusIcon = status.icon

                return (
                  <div key={m.id} className="flex items-start gap-4 px-4 py-4 hover:bg-gray-50 transition">
                    {/* Prioridad dot */}
                    <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                      m.priority === 'urgent' ? 'bg-red-500' :
                      m.priority === 'high' ? 'bg-amber-500' :
                      m.priority === 'normal' ? 'bg-blue-400' : 'bg-gray-300'
                    }`} />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{m.title}</p>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${priority.class}`}>
                          {priority.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-1.5 line-clamp-1">{m.description ?? '—'}</p>
                      <div className="flex items-center gap-3 text-[10px] text-gray-400">
                        <span className="capitalize">{m.category}</span>
                        {m.assigned_to && <span>· {m.assigned_to}</span>}
                        {m.scheduled_date && <span>· {new Date(m.scheduled_date).toLocaleDateString('es-CL')}</span>}
                        {m.estimated_cost && <span>· Est. ${m.estimated_cost.toLocaleString('es-CL')}</span>}
                      </div>
                    </div>

                    {/* Status */}
                    <div className={`flex items-center gap-1.5 text-xs ${status.class} flex-shrink-0`}>
                      <StatusIcon size={13} />
                      {status.label}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
