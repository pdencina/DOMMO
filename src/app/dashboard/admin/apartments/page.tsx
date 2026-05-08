// @ts-nocheck

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createAdminClient, createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function ApartmentsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const adminSupabase = await createAdminClient()

  const { data: profile } = await adminSupabase
    .from('profiles')
    .select(`
      id,
      role,
      building_id,
      full_name,
      buildings (
        id,
        name
      )
    `)
    .eq('email', user.email)
    .maybeSingle()

  if (!profile) {
    redirect('/dashboard')
  }

  const buildingId = profile.building_id

  const { data: apartments } = await adminSupabase
    .from('apartments')
    .select('*')
    .eq('building_id', buildingId)
    .order('number')

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <header className="border-b border-white/5 bg-black/20">
        <div className="flex items-center justify-between px-8 py-6">
          <div>
            <p className="text-sm text-gray-400">
              {profile.buildings?.name}
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Departamentos
            </h1>
          </div>

          <Link
            href="/dashboard/admin/apartments/new"
            className="rounded-2xl bg-blue-500 px-5 py-3 font-medium hover:bg-blue-400"
          >
            Nuevo departamento
          </Link>
        </div>
      </header>

      <section className="p-8">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03]">
          <div className="border-b border-white/10 px-6 py-5">
            <h2 className="text-xl font-semibold">
              Unidades registradas
            </h2>
          </div>

          <div className="divide-y divide-white/5">
            {apartments?.length === 0 && (
              <div className="p-10 text-center text-gray-400">
                No existen departamentos registrados.
              </div>
            )}

            {apartments?.map((apartment) => (
              <div
                key={apartment.id}
                className="flex items-center justify-between px-6 py-5 hover:bg-white/[0.02]"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">
                      Depto {apartment.number}
                    </h3>

                    <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-xs text-blue-300">
                      {apartment.status}
                    </div>
                  </div>

                  <p className="mt-2 text-sm text-gray-400">
                    Propietario: {apartment.owner_name || 'Sin asignar'}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Residente: {apartment.resident_name || 'Sin asignar'}
                  </p>
                </div>

                <div className="text-right text-sm text-gray-400">
                  <p>
                    Estacionamientos: {apartment.parking_count}
                  </p>

                  <p className="mt-1">
                    Bodegas: {apartment.storage_count}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}