// @ts-nocheck
export const dynamic = 'force-dynamic'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCLP } from '@/lib/utils'
import Link from 'next/link'
import {
  AlertTriangle, TrendingUp, Users, Wrench,
  Megaphone, CreditCard, ChevronRight, CheckCircle2,
  Building2, Calendar
} from 'lucide-react'

export const metadata = { title: 'Dashboard | DOMMO' }

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

  if (!profile || !['admin', 'committee', 'superadmin'].includes(profile.role)) redirect('/dashboard')

  const buildingId = profile.building_id
  if (!buildingId) redirect('/dashboard')

  const { data: building } = await adminSupabase
    .from('buildings').select('*').eq('id', buildingId).single()

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
    { data: recentPaid },
  ] = await Promise.all([
    adminSupabase.from('fee_periods').select('*').eq('building_id', buildingId).eq('period_month', monthStr).single(),
    adminSupabase.from('payments').select('*, units(number)').eq('building_id', buildingId),
    adminSupabase.from('alerts').select('*').eq('building_id', buildingId).eq('is_read', false).order('created_at', { ascending: false }).limit(10),
    adminSupabase.from('maintenances').select('*').eq('building_id', buildingId).in('status', ['pending','in_progress']).order('priority').limit(4),
    adminSupabase.from('notices').select('*').eq('building_id', buildingId).order('published_at', { ascending: false }).limit(3),
    adminSupabase.from('units').select('id').eq('building_id', buildingId),
    adminSupabase.from('payments').select('*, units(number)').eq('building_id', buildingId).eq('status','paid').order('paid_at', { ascending: false }).limit(4),
  ])

  const totalUnits    = units?.length ?? 0
  const paidCount     = payments?.filter(p => p.status === 'paid').length ?? 0
  const overdueCount  = payments?.filter(p => p.status === 'overdue').length ?? 0
  const pendingCount  = payments?.filter(p => p.status === 'pending').length ?? 0
  const paidAmount    = payments?.filter(p => p.status === 'paid').reduce((s,p) => s + p.amount, 0) ?? 0
  const totalExpected = payments?.reduce((s,p) => s + p.amount, 0) ?? 0
  const collectionPct = totalExpected > 0 ? Math.round((paidAmount / totalExpected) * 100) : 0

  const urgentPayments = payments?.filter(p => p.status === 'overdue' || p.status === 'pending').slice(0, 6) ?? []

  const now = new Date()
  const monthName = now.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })
  const today = now.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="min-h-screen dashboard-bg">

      {/* Topbar */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div>
            <h1 className="text-base font-bold text-gray-900">
              Hola, {profile.full_name?.split(' ')[0] ?? 'Admin'} 👋
            </h1>
            <p className="text-xs text-gray-400 capitalize flex items-center gap-1.5 mt-0.5">
              <Calendar size={11} />
              {today}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {overdueCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full animate-fade-in">
                <AlertTriangle size={12} />
                {overdueCount} vencido{overdueCount !== 1 ? 's' : ''}
              </span>
            )}
            <Link href="/dashboard/avisos?nuevo=1"
              className="btn-primary flex items-center gap-1.5 text-xs">
              <Megaphone size={13} /> Publicar aviso
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto space-y-5">

        {/* Alerta morosidad */}
        {overdueCount > 0 && (
          <div className="alert-banner alert-banner-red animate-fade-in">
            <AlertTriangle size={16} className="flex-shrink-0" />
            <div className="flex-1">
              <span className="font-semibold">{overdueCount} unidades</span> con gasto común vencido.
              {currentPeriod && ` Venció el ${new Date(currentPeriod.due_date).toLocaleDateString('es-CL')}.`}
            </div>
            <Link href="/dashboard/pagos?filter=overdue"
              className="text-xs font-semibold hover:underline flex-shrink-0 flex items-center gap-1">
              Ver ahora <ChevronRight size={12} />
            </Link>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Recaudado este mes', value: formatCLP(paidAmount), sub: `${collectionPct}% del total`, subColor: collectionPct >= 80 ? 'text-emerald-600' : 'text-amber-600', icon: TrendingUp, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', href: '/dashboard/reportes' },
            { label: 'Por cobrar', value: formatCLP(totalExpected - paidAmount), sub: `${overdueCount + pendingCount} unidades`, subColor: 'text-red-500', icon: CreditCard, iconBg: 'bg-red-50', iconColor: 'text-red-500', href: '/dashboard/pagos?filter=overdue' },
            { label: 'Unidades al día', value: `${paidCount} / ${totalUnits}`, sub: 'pagaron este mes', subColor: 'text-gray-400', icon: Users, iconBg: 'bg-blue-50', iconColor: 'text-blue-600', href: '/dashboard/propietarios' },
            { label: 'Mantenciones activas', value: maintenances?.length ?? 0, sub: maintenances?.filter(m => m.priority === 'urgent').length > 0 ? `⚠ ${maintenances.filter(m=>m.priority==='urgent').length} urgente(s)` : 'Sin urgentes', subColor: maintenances?.filter(m => m.priority === 'urgent').length > 0 ? 'text-red-500' : 'text-gray-400', icon: Wrench, iconBg: 'bg-amber-50', iconColor: 'text-amber-600', href: '/dashboard/mantenciones' },
          ].map(({ label, value, sub, subColor, icon: Icon, iconBg, iconColor, href }) => (
            <Link key={label} href={href}
              className="card card-hover p-4 flex items-start gap-3 group">
              <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110`}>
                <Icon size={16} className={iconColor} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 mb-0.5 truncate">{label}</p>
                <p className="text-xl font-bold text-gray-900">{value}</p>
                <p className={`text-[11px] mt-0.5 ${subColor}`}>{sub}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">

          {/* Pagos con alerta */}
          <div className="col-span-2 space-y-4">
            <div className="card">
              <div className="section-header">
                <div>
                  <p className="section-title">Estado de pagos — <span className="capitalize font-normal text-gray-500">{monthName}</span></p>
                </div>
                <Link href="/dashboard/pagos" className="section-action flex items-center gap-1">
                  Ver todos <ChevronRight size={12} />
                </Link>
              </div>

              {/* Barra progreso */}
              <div className="px-4 py-3 border-b border-gray-50">
                <div className="flex rounded-full overflow-hidden h-2 mb-2">
                  <div style={{ width: `${collectionPct}%` }} className="bg-emerald-500 transition-all duration-500" />
                  <div style={{ width: `${totalUnits > 0 ? (pendingCount/totalUnits)*100 : 0}%` }} className="bg-amber-400" />
                  <div className="flex-1 bg-gray-100" />
                </div>
                <div className="flex gap-5 text-[11px] text-gray-500">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/>Pagados: <strong className="text-gray-700">{paidCount}</strong></span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block"/>Pendientes: <strong className="text-gray-700">{pendingCount}</strong></span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400 inline-block"/>Vencidos: <strong className="text-red-600">{overdueCount}</strong></span>
                </div>
              </div>

              {/* Filas */}
              {urgentPayments.length === 0 ? (
                <div className="py-10 text-center">
                  <CheckCircle2 size={24} className="text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 font-medium">Todo al día este mes</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {urgentPayments.map(p => {
                    const unit = p.units
                    const isOverdue = p.status === 'overdue'
                    return (
                      <div key={p.id} className="table-row-hover flex items-center gap-3 px-4 py-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${isOverdue ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                          {unit?.number ?? '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">Depto {unit?.number ?? '—'}</p>
                          <p className="text-[11px] text-gray-400">
                            {isOverdue ? 'Gasto común vencido' : 'Pago pendiente'}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-gray-900 tabular-nums">{formatCLP(p.amount)}</p>
                        <span className={`pill ${isOverdue ? 'pill-red' : 'pill-amber'}`}>
                          {isOverdue ? 'Vencido' : 'Pendiente'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Acciones */}
              <div className="px-4 py-3 border-t border-gray-50 flex gap-2 bg-gray-50/50">
                <Link href="/dashboard/pagos" className="btn-ghost text-xs flex items-center gap-1.5">
                  <CreditCard size={13} /> Gestionar pagos
                </Link>
                <Link href="/dashboard/reportes" className="btn-ghost text-xs flex items-center gap-1.5">
                  <TrendingUp size={13} /> Ver reporte
                </Link>
              </div>
            </div>

            {/* Mantenciones activas */}
            <div className="card">
              <div className="section-header">
                <p className="section-title">Mantenciones activas</p>
                <Link href="/dashboard/mantenciones" className="section-action flex items-center gap-1">
                  Ver todas <ChevronRight size={12} />
                </Link>
              </div>
              {!maintenances || maintenances.length === 0 ? (
                <div className="py-8 text-center">
                  <CheckCircle2 size={20} className="text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Todo en orden</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {maintenances.map(m => (
                    <div key={m.id} className="table-row-hover flex items-center gap-3 px-4 py-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${m.priority==='urgent'?'bg-red-500':m.priority==='high'?'bg-amber-500':'bg-blue-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{m.title}</p>
                        <p className="text-[11px] text-gray-400 capitalize">{m.category} · {m.status==='in_progress'?'En progreso':'Pendiente'}</p>
                      </div>
                      {m.estimated_cost && <p className="text-xs text-gray-500">{formatCLP(m.estimated_cost)}</p>}
                      <span className={`pill ${m.priority==='urgent'?'pill-red':m.priority==='high'?'pill-amber':'pill-blue'}`}>
                        {m.priority==='urgent'?'Urgente':m.priority==='high'?'Alta':'Normal'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="px-4 py-2.5 border-t border-gray-50 bg-gray-50/50">
                <Link href="/dashboard/mantenciones?nueva=1" className="text-xs text-[#0F6E56] hover:underline font-medium flex items-center gap-1">
                  + Nueva mantención
                </Link>
              </div>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="space-y-4">

            {/* Accesos rápidos */}
            <div className="card p-4">
              <p className="text-xs font-bold text-gray-700 mb-3">Accesos rápidos</p>
              <div className="space-y-1">
                {[
                  { href: '/dashboard/propietarios', icon: Users,           label: 'Propietarios',   desc: `${totalUnits} unidades` },
                  { href: '/dashboard/mantenciones', icon: Wrench,          label: 'Mantenciones',   desc: `${maintenances?.length ?? 0} activas` },
                  { href: '/dashboard/avisos',       icon: Megaphone,       label: 'Avisos',         desc: `${notices?.length ?? 0} publicados` },
                  { href: '/dashboard/reportes',     icon: TrendingUp,      label: 'Reportes',       desc: 'Ver finanzas' },
                ].map(({ href, icon: Icon, label, desc }) => (
                  <Link key={href} href={href}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-all group">
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-[#E1F5EE] transition-colors">
                      <Icon size={13} className="text-gray-500 group-hover:text-[#0F6E56] transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-700 group-hover:text-gray-900">{label}</p>
                      <p className="text-[10px] text-gray-400">{desc}</p>
                    </div>
                    <ChevronRight size={12} className="text-gray-300 group-hover:text-gray-400 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Últimos pagos recibidos */}
            <div className="card overflow-hidden">
              <div className="section-header">
                <p className="section-title">Últimos pagos</p>
              </div>
              <div className="divide-y divide-gray-50">
                {!recentPaid || recentPaid.length === 0 ? (
                  <p className="px-4 py-4 text-xs text-gray-400">Sin pagos recientes</p>
                ) : recentPaid.map(p => (
                  <div key={p.id} className="flex items-center gap-2.5 px-4 py-2.5">
                    <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 size={12} className="text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800">Depto {p.units?.number}</p>
                      <p className="text-[10px] text-gray-400">
                        {p.paid_at ? new Date(p.paid_at).toLocaleDateString('es-CL', { day:'numeric', month:'short' }) : ''}
                      </p>
                    </div>
                    <p className="text-xs font-bold text-emerald-700">{formatCLP(p.amount)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Avisos recientes */}
            <div className="card overflow-hidden">
              <div className="section-header">
                <p className="section-title">Avisos</p>
                <Link href="/dashboard/avisos" className="section-action">Ver todos</Link>
              </div>
              <div className="divide-y divide-gray-50">
                {!notices || notices.length === 0 ? (
                  <p className="px-4 py-4 text-xs text-gray-400">Sin avisos</p>
                ) : notices.map(n => (
                  <div key={n.id} className="px-4 py-3">
                    <div className="flex items-start gap-1.5 mb-0.5">
                      {n.category === 'urgent' && <span className="pill pill-red text-[9px] mt-0.5">Urgente</span>}
                      <p className="text-xs font-semibold text-gray-800 truncate">{n.title}</p>
                    </div>
                    <p className="text-[10px] text-gray-400">
                      {new Date(n.published_at).toLocaleDateString('es-CL', { day:'numeric', month:'short' })}
                    </p>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-gray-50 bg-gray-50/50">
                <Link href="/dashboard/avisos?nuevo=1" className="text-xs text-[#0F6E56] hover:underline font-medium">
                  + Publicar aviso
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
