// @ts-nocheck
export const dynamic = 'force-dynamic'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCLP } from '@/lib/utils'
import { CheckCircle2, AlertTriangle, Clock, Megaphone, Calendar } from 'lucide-react'
import LogoutButton from '@/components/dashboard/LogoutButton'

export const metadata = { title: 'Mi Portal | DOMMO' }

export default async function ResidentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const adminSupabase = await createAdminClient()

  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('*, buildings(*)')
    .eq('email', user.email.trim().toLowerCase())
    .maybeSingle()

  if (!profile) redirect('/login')

  const buildingId = profile.building_id
  if (!buildingId) redirect('/login')

  // Unidad del residente
  const { data: unit } = await adminSupabase
    .from('units')
    .select('*')
    .or(`owner_id.eq.${profile.id},resident_id.eq.${profile.id}`)
    .eq('building_id', buildingId)
    .maybeSingle()

  // Últimos 6 pagos
  const { data: payments } = await adminSupabase
    .from('payments')
    .select('*, fee_periods(*)')
    .eq('unit_id', unit?.id ?? '')
    .order('created_at', { ascending: false })
    .limit(6)

  // Avisos del edificio
  const { data: notices } = await adminSupabase
    .from('notices')
    .select('*')
    .eq('building_id', buildingId)
    .order('pinned', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(5)

  const currentPayment = payments?.[0]
  const building = profile.buildings

  const statusMap = {
    paid:    { label: 'Al día',    icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    pending: { label: 'Pendiente', icon: Clock,         color: 'text-amber-600',  bg: 'bg-amber-50',   border: 'border-amber-200'  },
    overdue: { label: 'Vencido',   icon: AlertTriangle, color: 'text-red-600',    bg: 'bg-red-50',     border: 'border-red-200'    },
  }

  const payStatus = statusMap[currentPayment?.status ?? 'pending']
  const PayIcon = payStatus.icon

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      {/* Header residente */}
      <div className="bg-[#0F6E56] text-white px-6 py-5">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-emerald-200 text-xs mb-0.5">Bienvenido/a</p>
            <h1 className="text-lg font-semibold">{profile.full_name ?? 'Residente'}</h1>
            <p className="text-emerald-200 text-xs mt-0.5">
              {building?.name ?? 'Mi Edificio'} {unit ? `· Depto ${unit.number}` : ''}
            </p>
          </div>
          <LogoutButton />
        </div>
      </div>

      <div className="max-w-xl mx-auto p-5 space-y-4">

        {/* Estado pago actual */}
        <div className={`rounded-xl border p-5 ${payStatus.bg} ${payStatus.border}`}>
          <div className="flex items-center gap-3 mb-3">
            <PayIcon size={20} className={payStatus.color} />
            <div>
              <p className="text-xs text-gray-500">Gasto común del mes</p>
              <p className={`text-sm font-semibold ${payStatus.color}`}>{payStatus.label}</p>
            </div>
            {currentPayment && (
              <div className="ml-auto text-right">
                <p className="text-xl font-semibold text-gray-900">{formatCLP(currentPayment.amount)}</p>
                {currentPayment.status !== 'paid' && currentPayment.fee_periods?.due_date && (
                  <p className="text-xs text-gray-500">
                    Vence {new Date(currentPayment.fee_periods.due_date).toLocaleDateString('es-CL')}
                  </p>
                )}
              </div>
            )}
          </div>

          {currentPayment?.status !== 'paid' && (
            <div className="flex gap-2 mt-3">
              <a href="https://wa.me/" target="_blank"
                className="flex-1 py-2 text-xs text-center font-medium text-white bg-[#0F6E56] rounded-lg hover:bg-[#085041] transition">
                Pagar ahora
              </a>
              <button
                className="flex-1 py-2 text-xs text-center font-medium text-[#0F6E56] bg-white border border-[#0F6E56]/30 rounded-lg hover:bg-[#E1F5EE] transition">
                Ver instrucciones
              </button>
            </div>
          )}
        </div>

        {/* Historial pagos */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Historial de pagos</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {!payments || payments.length === 0 ? (
              <p className="px-4 py-4 text-xs text-gray-400">Sin registros de pago</p>
            ) : payments.map(p => {
              const s = statusMap[p.status] ?? statusMap.pending
              const SIcon = s.icon
              const period = p.fee_periods
              return (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                  <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}>
                    <SIcon size={14} className={s.color} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-800">
                      {period ? new Date(period.period_month + 'T12:00:00').toLocaleDateString('es-CL', { month: 'long', year: 'numeric' }) : '—'}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {p.paid_at ? `Pagado el ${new Date(p.paid_at).toLocaleDateString('es-CL')}` : s.label}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{formatCLP(p.amount)}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Avisos */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <Megaphone size={13} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">Avisos del edificio</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {!notices || notices.length === 0 ? (
              <p className="px-4 py-4 text-xs text-gray-400">Sin avisos recientes</p>
            ) : notices.map(n => (
              <div key={n.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-xs font-semibold text-gray-900">{n.title}</p>
                  {n.category === 'urgent' && (
                    <span className="text-[10px] text-red-700 bg-red-50 px-1.5 py-0.5 rounded-full flex-shrink-0">
                      Urgente
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">{n.body}</p>
                <p className="text-[10px] text-gray-400 mt-1">
                  {new Date(n.published_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Info de contacto */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="text-xs font-semibold text-gray-900 mb-3">Contacto administración</h3>
          <div className="space-y-2">
            <a href="tel:+56900000000"
              className="flex items-center gap-2 text-xs text-[#185FA5] hover:underline">
              📞 Llamar a administración
            </a>
            <a href="mailto:admin@dommo.cl"
              className="flex items-center gap-2 text-xs text-[#185FA5] hover:underline">
              ✉️ Enviar email
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}
