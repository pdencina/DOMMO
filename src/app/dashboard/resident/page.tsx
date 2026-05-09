// @ts-nocheck
export const dynamic = 'force-dynamic'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCLP } from '@/lib/utils'
import { CheckCircle2, AlertTriangle, Clock, Megaphone, Phone, Mail, LogOut } from 'lucide-react'
import LogoutButton from '@/components/dashboard/LogoutButton'

export const metadata = { title: 'Mi Portal | DOMMO' }

export default async function ResidentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const adminSupabase = await createAdminClient()

  const { data: profile } = await adminSupabase
    .from('profiles').select('*, buildings(*)').eq('email', user.email.trim().toLowerCase()).maybeSingle()

  if (!profile) redirect('/login')

  const buildingId = profile.building_id
  if (!buildingId) redirect('/login')

  const { data: unit } = await adminSupabase
    .from('units').select('*')
    .or(`owner_id.eq.${profile.id},resident_id.eq.${profile.id}`)
    .eq('building_id', buildingId).maybeSingle()

  const { data: payments } = await adminSupabase
    .from('payments').select('*, fee_periods(*)')
    .eq('unit_id', unit?.id ?? '')
    .order('created_at', { ascending: false }).limit(6)

  const { data: notices } = await adminSupabase
    .from('notices').select('*').eq('building_id', buildingId)
    .order('pinned', { ascending: false })
    .order('published_at', { ascending: false }).limit(6)

  const currentPayment = payments?.[0]
  const building = profile.buildings

  const statusMap = {
    paid:    { label: 'Al día',    icon: CheckCircle2,  bg: 'bg-emerald-50', border: 'border-emerald-200', color: 'text-emerald-700', pill: 'pill-green' },
    pending: { label: 'Pendiente', icon: Clock,         bg: 'bg-amber-50',   border: 'border-amber-200',   color: 'text-amber-700',   pill: 'pill-amber' },
    overdue: { label: 'Vencido',   icon: AlertTriangle, bg: 'bg-red-50',     border: 'border-red-200',     color: 'text-red-700',     pill: 'pill-red'   },
  }

  const payStatus = statusMap[currentPayment?.status ?? 'pending']
  const PayIcon   = payStatus.icon

  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Buenos días' : now.getHours() < 20 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="min-h-screen" style={{ background: '#F8F7F4' }}>

      {/* Header */}
      <div style={{ background: '#0F6E56' }} className="text-white px-5 pt-6 pb-8">
        <div className="max-w-lg mx-auto">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-emerald-200 text-xs mb-0.5">{greeting}</p>
              <h1 className="text-xl font-bold">{profile.full_name ?? 'Residente'}</h1>
              <p className="text-emerald-200 text-xs mt-1 flex items-center gap-1.5">
                <span className="dot-live" style={{width:5,height:5}} />
                {building?.name} {unit ? `· Depto ${unit.number}` : ''}
              </p>
            </div>
            <LogoutButton variant="light" />
          </div>

          {/* Card pago actual destacada */}
          <div className={`rounded-2xl p-4 mt-2 ${payStatus.bg} border ${payStatus.border}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <PayIcon size={18} className={payStatus.color} />
                <div>
                  <p className="text-xs text-gray-500">Gasto común del mes</p>
                  <p className={`text-sm font-bold ${payStatus.color}`}>{payStatus.label}</p>
                </div>
              </div>
              {currentPayment && (
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{formatCLP(currentPayment.amount)}</p>
                  {currentPayment.status !== 'paid' && currentPayment.fee_periods?.due_date && (
                    <p className="text-[11px] text-gray-500">
                      Vence {new Date(currentPayment.fee_periods.due_date).toLocaleDateString('es-CL')}
                    </p>
                  )}
                </div>
              )}
            </div>

            {currentPayment?.status !== 'paid' && (
              <div className="flex gap-2 mt-3">
                <button className="flex-1 py-2.5 text-xs font-bold text-white bg-[#0F6E56] rounded-xl hover:bg-[#085041] transition-all active:scale-95">
                  Pagar ahora
                </button>
                <button className="flex-1 py-2.5 text-xs font-medium text-[#0F6E56] bg-white border border-[#0F6E56]/20 rounded-xl hover:bg-emerald-50 transition-all">
                  Cómo pagar
                </button>
              </div>
            )}

            {currentPayment?.status === 'paid' && currentPayment?.paid_at && (
              <p className="text-[11px] text-emerald-600 mt-2 flex items-center gap-1">
                <CheckCircle2 size={11} />
                Pagado el {new Date(currentPayment.paid_at).toLocaleDateString('es-CL')}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-2 space-y-4 pb-8">

        {/* Historial */}
        <div className="card animate-fade-in">
          <div className="section-header">
            <p className="section-title">Historial de pagos</p>
            <span className="pill pill-gray">{payments?.length ?? 0} registros</span>
          </div>
          <div className="divide-y divide-gray-50">
            {!payments || payments.length === 0 ? (
              <p className="px-4 py-5 text-xs text-gray-400 text-center">Sin historial de pagos</p>
            ) : payments.map(p => {
              const s = statusMap[p.status] ?? statusMap.pending
              const SIcon = s.icon
              const period = p.fee_periods
              return (
                <div key={p.id} className="table-row-hover flex items-center gap-3 px-4 py-3">
                  <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}>
                    <SIcon size={14} className={s.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 capitalize">
                      {period ? new Date(period.period_month+'T12:00:00').toLocaleDateString('es-CL',{month:'long',year:'numeric'}) : '—'}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {p.status === 'paid' && p.paid_at
                        ? `Pagado el ${new Date(p.paid_at).toLocaleDateString('es-CL')}`
                        : s.label}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{formatCLP(p.amount)}</p>
                    <span className={`pill ${s.pill} text-[9px]`}>{s.label}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Avisos */}
        <div className="card animate-fade-in">
          <div className="section-header">
            <p className="section-title flex items-center gap-1.5">
              <Megaphone size={13} className="text-gray-400" />
              Avisos del edificio
            </p>
          </div>
          <div className="divide-y divide-gray-50">
            {!notices || notices.length === 0 ? (
              <p className="px-4 py-5 text-xs text-gray-400 text-center">Sin avisos recientes</p>
            ) : notices.map(n => (
              <div key={n.id} className="table-row-hover px-4 py-3">
                <div className="flex items-start gap-2 mb-1">
                  {n.category === 'urgent' && <span className="pill pill-red text-[9px] mt-0.5 flex-shrink-0">Urgente</span>}
                  <p className="text-xs font-semibold text-gray-900">{n.title}</p>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{n.body}</p>
                <p className="text-[10px] text-gray-400 mt-1">
                  {new Date(n.published_at).toLocaleDateString('es-CL', { day:'numeric', month:'long' })}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contacto */}
        <div className="card p-4 animate-fade-in">
          <p className="text-xs font-bold text-gray-700 mb-3">Contacto administración</p>
          <div className="space-y-2">
            <a href="tel:+56900000000"
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-emerald-50 transition-all group">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Phone size={14} className="text-emerald-700" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800">Llamar a administración</p>
                <p className="text-[10px] text-gray-400">Lunes a viernes 9:00 - 18:00</p>
              </div>
            </a>
            <a href="mailto:admin@dommo.cl"
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-blue-50 transition-all group">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Mail size={14} className="text-blue-700" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800">Enviar email</p>
                <p className="text-[10px] text-gray-400">Respuesta en 24 hrs</p>
              </div>
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}
