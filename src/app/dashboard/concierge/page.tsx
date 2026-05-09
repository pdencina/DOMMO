// @ts-nocheck
export const dynamic = 'force-dynamic'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Megaphone, Users, Clock, Phone, AlertTriangle } from 'lucide-react'
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
      .gte('date', new Date().toISOString().split('T')[0]).order('date').limit(6),
  ])

  const now = new Date()
  const timeStr  = now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
  const dateStr  = now.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })
  const urgents  = notices?.filter(n => n.category === 'urgent') ?? []
  const generals = notices?.filter(n => n.category !== 'urgent') ?? []

  return (
    <div className="min-h-screen" style={{ background: '#F8F7F4' }}>

      {/* Header */}
      <div style={{ background: '#185FA5' }} className="text-white px-5 py-5">
        <div className="max-w-2xl mx-auto flex items-start justify-between">
          <div>
            <p className="text-blue-200 text-xs mb-0.5">Conserjería</p>
            <h1 className="text-lg font-bold">{profile.buildings?.name ?? 'DOMMO'}</h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-blue-200 text-xs capitalize">{dateStr}</p>
              <span className="text-blue-100 font-bold text-sm">{timeStr}</span>
            </div>
          </div>
          <LogoutButton variant="light" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">

        {/* Alertas urgentes */}
        {urgents.length > 0 && (
          <div className="space-y-2 animate-fade-in">
            {urgents.map(n => (
              <div key={n.id} className="alert-banner alert-banner-red">
                <AlertTriangle size={15} className="flex-shrink-0" />
                <div>
                  <p className="font-bold text-xs">{n.title}</p>
                  <p className="text-[11px] mt-0.5 opacity-80">{n.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">

          {/* Reservas */}
          <div className="card">
            <div className="section-header">
              <p className="section-title flex items-center gap-1.5">
                <Clock size={13} className="text-gray-400" />
                Reservas próximas
              </p>
            </div>
            {!bookings || bookings.length === 0 ? (
              <p className="px-4 py-5 text-xs text-gray-400 text-center">Sin reservas próximas</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {bookings.map(b => (
                  <div key={b.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="text-center min-w-[40px]">
                      <p className="text-xs font-bold text-gray-900">{b.start_time.slice(0,5)}</p>
                      <p className="text-[10px] text-gray-400">{b.end_time.slice(0,5)}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 capitalize">{b.space}</p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(b.date+'T12:00:00').toLocaleDateString('es-CL',{weekday:'short',day:'numeric',month:'short'})}
                      </p>
                    </div>
                    <span className="pill pill-green text-[9px]">Confirmada</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Avisos generales */}
          <div className="card">
            <div className="section-header">
              <p className="section-title flex items-center gap-1.5">
                <Megaphone size={13} className="text-gray-400" />
                Avisos
              </p>
            </div>
            {generals.length === 0 ? (
              <p className="px-4 py-5 text-xs text-gray-400 text-center">Sin avisos</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {generals.slice(0,4).map(n => (
                  <div key={n.id} className="px-4 py-3">
                    <p className="text-xs font-semibold text-gray-800 truncate">{n.title}</p>
                    <p className="text-[10px] text-gray-500 line-clamp-2 mt-0.5">{n.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Directorio */}
        <div className="card animate-fade-in">
          <div className="section-header">
            <p className="section-title flex items-center gap-1.5">
              <Users size={13} className="text-gray-400" />
              Directorio de unidades
            </p>
            <span className="pill pill-gray">{units?.length ?? 0} dptos</span>
          </div>
          <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
            {(units ?? []).map(u => {
              const owner = Array.isArray(u.profiles) ? u.profiles[0] : u.profiles
              return (
                <div key={u.number} className="table-row-hover flex items-center gap-3 px-4 py-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#E6F1FB] flex items-center justify-center text-xs font-bold text-[#185FA5] flex-shrink-0">
                    {u.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{owner?.full_name ?? 'Sin propietario'}</p>
                    <p className="text-[10px] text-gray-400">Piso {u.floor ?? '—'}</p>
                  </div>
                  {owner?.phone && (
                    <a href={`tel:${owner.phone}`}
                      className="flex items-center gap-1 text-[11px] text-[#185FA5] hover:text-[#0C447C] font-medium transition-colors">
                      <Phone size={11} />
                      {owner.phone}
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
