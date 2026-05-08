// @ts-nocheck
export const dynamic = 'force-dynamic'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Megaphone, Users, Clock } from 'lucide-react'
import LogoutButton from '@/components/dashboard/LogoutButton'

export const metadata = { title: 'Conserjería | DOMMO' }

export default async function ConciergePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const adminSupabase = await createAdminClient()
  const { data: profile } = await adminSupabase
    .from('profiles').select('*, buildings(name)').eq('email', user.email.trim().toLowerCase()).maybeSingle()

  if (!profile || profile.role !== 'concierge') redirect('/dashboard')
  const buildingId = profile.building_id
  if (!buildingId) redirect('/dashboard')

  const [
    { data: notices },
    { data: units },
    { data: bookings },
  ] = await Promise.all([
    adminSupabase.from('notices').select('*').eq('building_id', buildingId)
      .order('pinned', { ascending: false }).order('published_at', { ascending: false }).limit(8),
    adminSupabase.from('units').select('number, floor, profiles!units_owner_id_fkey(full_name, phone)')
      .eq('building_id', buildingId).order('number'),
    adminSupabase.from('bookings').select('*').eq('building_id', buildingId)
      .gte('date', new Date().toISOString().split('T')[0]).order('date').limit(5),
  ])

  const now = new Date()

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <div className="bg-[#185FA5] text-white px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-blue-200 text-xs">Conserjería</p>
          <h1 className="text-base font-semibold">{profile.buildings?.name ?? 'DOMMO'}</h1>
          <p className="text-blue-200 text-xs mt-0.5">
            {now.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })} · {now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <LogoutButton variant="light" />
      </div>

      <div className="p-5 max-w-2xl mx-auto space-y-4">

        {/* Avisos urgentes */}
        {notices?.filter(n => n.category === 'urgent').map(n => (
          <div key={n.id} className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2">
            <Megaphone size={14} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-red-800">{n.title}</p>
              <p className="text-xs text-red-700 mt-0.5">{n.body}</p>
            </div>
          </div>
        ))}

        {/* Reservas del día */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <Clock size={13} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">Reservas próximas</h2>
          </div>
          {!bookings || bookings.length === 0 ? (
            <p className="px-4 py-4 text-xs text-gray-400">Sin reservas próximas</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {bookings.map(b => (
                <div key={b.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="w-12 text-center">
                    <p className="text-xs font-bold text-gray-900">{b.start_time.slice(0,5)}</p>
                    <p className="text-[10px] text-gray-400">{b.end_time.slice(0,5)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900 capitalize">{b.space}</p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(b.date + 'T12:00:00').toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <span className="ml-auto text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Confirmada
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Directorio residentes */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <Users size={13} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">Directorio de unidades</h2>
          </div>
          <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
            {(units ?? []).map(u => {
              const owner = Array.isArray(u.profiles) ? u.profiles[0] : u.profiles
              return (
                <div key={u.number} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="w-10 h-10 rounded-lg bg-[#E6F1FB] flex items-center justify-center text-xs font-semibold text-[#185FA5] flex-shrink-0">
                    {u.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{owner?.full_name ?? 'Sin propietario'}</p>
                    <p className="text-[10px] text-gray-400">Piso {u.floor ?? '—'}</p>
                  </div>
                  {owner?.phone && (
                    <a href={`tel:${owner.phone}`} className="text-[10px] text-[#185FA5] hover:underline">
                      {owner.phone}
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Avisos generales */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Avisos del edificio</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {notices?.filter(n => n.category !== 'urgent').slice(0, 4).map(n => (
              <div key={n.id} className="px-4 py-3">
                <p className="text-xs font-medium text-gray-800">{n.title}</p>
                <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
