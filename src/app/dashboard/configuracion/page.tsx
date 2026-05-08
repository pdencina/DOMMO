// @ts-nocheck

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createAdminClient, createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function ComunidadConfigPage() {
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
      full_name,
      email,
      role,
      building_id,
      buildings (
        id,
        name,
        slug,
        address,
        city,
        total_units,
        plan,
        status
      )
    `)
    .eq('email', user.email)
    .maybeSingle()

  if (!profile) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <header className="border-b border-white/5 bg-black/20">
        <div className="flex items-center justify-between px-8 py-6">
          <div>
            <p className="text-sm text-gray-400">Configuración</p>
            <h1 className="mt-2 text-3xl font-bold">Comunidad</h1>
          </div>

          <Link
            href="/dashboard/configuracion"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm hover:bg-white/[0.06]"
          >
            Volver
          </Link>
        </div>
      </header>

      <section className="p-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/[0.03] p-8">
          <h2 className="text-3xl font-bold">
            Datos de la comunidad
          </h2>

          <p className="mt-3 text-gray-400">
            Información base asociada al usuario conectado.
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <Info label="Nombre" value={profile.buildings?.name || 'DOMMO Plataforma'} />
            <Info label="Slug" value={profile.buildings?.slug || '-'} />
            <Info label="Dirección" value={profile.buildings?.address || '-'} />
            <Info label="Ciudad" value={profile.buildings?.city || '-'} />
            <Info label="Unidades" value={String(profile.buildings?.total_units || 0)} />
            <Info label="Plan" value={profile.buildings?.plan || '-'} />
            <Info label="Estado" value={profile.buildings?.status || '-'} />
            <Info label="Rol usuario" value={profile.role} />
          </div>
        </div>
      </section>
    </main>
  )
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  )
}