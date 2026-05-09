// @ts-nocheck
export const dynamic = 'force-dynamic'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { initials } from '@/lib/utils'
import { UserPlus, Search } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Propietarios' }

export default async function PropietariosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const adminSupabase = await createAdminClient()
  const { data: profile } = await adminSupabase
    .from('profiles').select('building_id').eq('email', user.email.trim().toLowerCase()).maybeSingle()
  const buildingId = profile?.building_id
  if (!buildingId) redirect('/dashboard/admin')

  // Unidades con propietarios y último pago
  const { data: units } = await adminSupabase
    .from('units')
    .select(`
      *,
      owner:profiles!units_owner_id_fkey(id, full_name, email, phone),
      payments(status, amount, updated_at)
    `)
    .eq('building_id', buildingId)
    .order('number', { ascending: true })

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Propietarios</h1>
          <p className="text-sm text-gray-400">{units?.length ?? 0} unidades registradas</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-xs text-white bg-[#0F6E56] rounded-lg hover:bg-[#085041] transition">
          <UserPlus size={13} /> Agregar propietario
        </button>
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre, depto o email..."
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0F6E56] focus:border-[#0F6E56]"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-[44px_1fr_auto_auto_auto] gap-4 px-4 py-2.5 bg-gray-50 text-[10px] font-medium text-gray-400 uppercase tracking-wider">
          <div></div>
          <div>Propietario</div>
          <div>Contacto</div>
          <div className="text-center">Último pago</div>
          <div></div>
        </div>

        <div className="divide-y divide-gray-50">
          {(units ?? []).map(unit => {
            const owner = unit.owner as any
            const payments = unit.payments as any[]
            const lastPayment = payments?.sort((a, b) =>
              new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
            )[0]

            const paymentColor = !lastPayment ? 'gray'
              : lastPayment.status === 'paid' ? 'green'
              : lastPayment.status === 'overdue' ? 'red' : 'amber'

            return (
              <div key={unit.id} className="grid grid-cols-[44px_1fr_auto_auto_auto] gap-4 items-center px-4 py-3 hover:bg-gray-50 transition">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-[#E1F5EE] flex items-center justify-center text-xs font-semibold text-[#0F6E56]">
                  {owner?.full_name ? initials(owner.full_name) : unit.number}
                </div>

                {/* Info */}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {owner?.full_name ?? 'Sin propietario'}
                  </p>
                  <p className="text-xs text-gray-400">Depto {unit.number} · Piso {unit.floor ?? '—'}</p>
                </div>

                {/* Contacto */}
                <div className="text-right">
                  <p className="text-xs text-gray-600">{owner?.email ?? '—'}</p>
                  <p className="text-xs text-gray-400">{owner?.phone ?? '—'}</p>
                </div>

                {/* Estado último pago */}
                <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${
                  paymentColor === 'green' ? 'bg-emerald-50 text-emerald-700'
                  : paymentColor === 'red' ? 'bg-red-50 text-red-700'
                  : paymentColor === 'amber' ? 'bg-amber-50 text-amber-700'
                  : 'bg-gray-100 text-gray-500'
                }`}>
                  {!lastPayment ? 'Sin registro'
                    : lastPayment.status === 'paid' ? 'Al día'
                    : lastPayment.status === 'overdue' ? 'Atrasado'
                    : 'Pendiente'}
                </span>

                {/* Ver detalle */}
                <Link
                  href={`/dashboard/propietarios/${unit.id}`}
                  className="text-xs text-[#185FA5] hover:underline"
                >
                  Ver →
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
