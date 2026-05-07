// @ts-nocheck

import { redirect } from 'next/navigation'
import { createAdminClient, createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  const adminSupabase = await createAdminClient()

  const { data: profile, error: profileError } = await adminSupabase
    .from('profiles')
    .select('id, email, full_name, role, building_id')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError || !profile) {
    return (
      <main className="min-h-screen bg-[#050816] p-8 text-white">
        <div className="mx-auto max-w-2xl rounded-3xl border border-red-500/20 bg-red-500/10 p-8">
          <h1 className="text-3xl font-bold">
            Perfil no configurado
          </h1>

          <p className="mt-4 text-red-100">
            Tu usuario existe en Supabase Auth, pero no tiene un perfil válido
            en la tabla <strong>public.profiles</strong>.
          </p>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-gray-300">
            <p>
              Usuario detectado:
            </p>

            <p className="mt-2 font-mono">
              {user.email}
            </p>

            <p className="mt-4">
              Ejecuta nuevamente el script SQL para crear el perfil de este
              usuario.
            </p>
          </div>
        </div>
      </main>
    )
  }

  switch (profile.role) {
    case 'superadmin':
      redirect('/dashboard/superadmin')

    case 'admin':
      redirect('/dashboard/admin')

    case 'committee':
      redirect('/dashboard/committee')

    case 'resident':
      redirect('/dashboard/resident')

    case 'concierge':
      redirect('/dashboard/concierge')

    default:
      return (
        <main className="min-h-screen bg-[#050816] p-8 text-white">
          <div className="mx-auto max-w-2xl rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-8">
            <h1 className="text-3xl font-bold">
              Rol no reconocido
            </h1>

            <p className="mt-4 text-yellow-100">
              El usuario tiene un rol no válido:
            </p>

            <p className="mt-4 rounded-xl bg-black/30 p-4 font-mono">
              {profile.role}
            </p>
          </div>
        </main>
      )
  }
}