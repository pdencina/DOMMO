// @ts-nocheck
export const dynamic = 'force-dynamic'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Pin, Megaphone } from 'lucide-react'
import NewNoticeForm from './NewNoticeForm'

export const metadata = { title: 'Avisos | DOMMO' }

const categoryConfig = {
  general:  { label: 'General',  class: 'bg-gray-100 text-gray-600' },
  urgent:   { label: 'Urgente',  class: 'bg-red-50 text-red-700' },
  event:    { label: 'Evento',   class: 'bg-blue-50 text-blue-700' },
  rule:     { label: 'Norma',    class: 'bg-amber-50 text-amber-700' },
}

export default async function AvisosPage({
  searchParams,
}: {
  searchParams: Promise<{ nuevo?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const adminSupabase = await createAdminClient()
  const { data: profile } = await adminSupabase
    .from('profiles').select('building_id, full_name').eq('email', user.email.trim().toLowerCase()).maybeSingle()

  if (!profile?.building_id) redirect('/dashboard')
  const buildingId = profile.building_id

  const { data: notices } = await adminSupabase
    .from('notices')
    .select('*')
    .eq('building_id', buildingId)
    .order('pinned', { ascending: false })
    .order('published_at', { ascending: false })

  const showForm = params.nuevo === '1'

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/admin" className="text-gray-400 hover:text-gray-600 transition">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-base font-semibold text-gray-900">Avisos y comunicados</h1>
            <p className="text-xs text-gray-400">{notices?.length ?? 0} publicados</p>
          </div>
        </div>
        <Link
          href="/dashboard/avisos?nuevo=1"
          className="flex items-center gap-1.5 text-xs text-white bg-[#0F6E56] px-3 py-2 rounded-lg hover:bg-[#085041] transition"
        >
          <Megaphone size={13} /> Nuevo aviso
        </Link>
      </div>

      <div className="p-6 max-w-3xl mx-auto space-y-4">

        {showForm && (
          <NewNoticeForm buildingId={buildingId} authorName={profile.full_name ?? 'Admin'} />
        )}

        {!notices || notices.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
            <Megaphone size={28} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Sin avisos publicados aún</p>
            <Link href="/dashboard/avisos?nuevo=1"
              className="mt-3 inline-block text-xs text-[#0F6E56] hover:underline">
              + Crear el primero
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {notices.map(n => {
              const cat = categoryConfig[n.category] ?? categoryConfig.general
              return (
                <div key={n.id}
                  className={`bg-white rounded-xl border overflow-hidden transition hover:shadow-sm ${
                    n.pinned ? 'border-[#0F6E56]/30' : 'border-gray-100'
                  }`}>
                  <div className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {n.pinned && (
                          <Pin size={12} className="text-[#0F6E56] flex-shrink-0" />
                        )}
                        <h3 className="text-sm font-semibold text-gray-900">{n.title}</h3>
                      </div>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${cat.class}`}>
                        {cat.label}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{n.body}</p>

                    <div className="flex items-center gap-3 mt-3 text-[10px] text-gray-400">
                      <span>{new Date(n.published_at).toLocaleDateString('es-CL', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}</span>
                      {n.pinned && <span className="text-[#0F6E56]">· Fijado</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
