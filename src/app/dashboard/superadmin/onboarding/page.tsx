// @ts-nocheck

import Link from 'next/link'
import { randomUUID } from 'crypto'
import { redirect } from 'next/navigation'
import { createAdminClient, createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function OnboardingCommunityPage({ searchParams }) {
  const params = await searchParams
  const errorMessage = params?.error ? decodeURIComponent(params.error) : ''

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
    .select('role')
    .eq('email', user.email)
    .maybeSingle()

  if (!profile || profile.role !== 'superadmin') {
    redirect('/dashboard')
  }

  async function createFullCommunity(formData: FormData) {
    'use server'

    const adminSupabase = await createAdminClient()
    const buildingId = randomUUID()

    const communityName = String(formData.get('community_name') || '').trim()
    const slug = String(formData.get('slug') || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')

    const address = String(formData.get('address') || '').trim()
    const city = String(formData.get('city') || '').trim()
    const totalUnits = Number(formData.get('total_units') || 0)
    const plan = String(formData.get('plan') || 'starter')

    const adminName = String(formData.get('admin_name') || '').trim()
    const adminEmail = String(formData.get('admin_email') || '')
      .trim()
      .toLowerCase()
    const adminPassword = String(formData.get('admin_password') || '').trim()

    if (!communityName || !slug || !city || !adminName || !adminEmail || !adminPassword) {
      redirect('/dashboard/superadmin/onboarding?error=Faltan campos obligatorios')
    }

    const { error: buildingError } = await adminSupabase
      .from('buildings')
      .insert({
        id: buildingId,
        name: communityName,
        slug,
        address,
        city,
        total_units: totalUnits,
        plan,
        status: 'active',
      })

    if (buildingError) {
      redirect(
        `/dashboard/superadmin/onboarding?error=${encodeURIComponent(
          `Error creando comunidad: ${buildingError.message}`
        )}`
      )
    }

    const { data: authUser, error: authError } =
      await adminSupabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          full_name: adminName,
          role: 'admin',
          building_id: buildingId,
        },
      })

    if (authError || !authUser?.user) {
      await adminSupabase.from('buildings').delete().eq('id', buildingId)

      redirect(
        `/dashboard/superadmin/onboarding?error=${encodeURIComponent(
          `Error creando usuario admin: ${authError?.message || 'No se creó el usuario'}`
        )}`
      )
    }

    const { error: profileError } = await adminSupabase
      .from('profiles')
      .insert({
        id: authUser.user.id,
        building_id: buildingId,
        full_name: adminName,
        email: adminEmail,
        role: 'admin',
      })

    if (profileError) {
      await adminSupabase.auth.admin.deleteUser(authUser.user.id)
      await adminSupabase.from('buildings').delete().eq('id', buildingId)

      redirect(
        `/dashboard/superadmin/onboarding?error=${encodeURIComponent(
          `Error creando perfil admin: ${profileError.message}`
        )}`
      )
    }

    redirect('/dashboard/superadmin')
  }

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <header className="border-b border-white/5 bg-black/20 backdrop-blur">
        <div className="flex items-center justify-between px-8 py-5">
          <div>
            <p className="text-sm text-gray-400">Super Admin DOMMO</p>
            <h1 className="mt-1 text-2xl font-bold">Onboarding de condominio</h1>
          </div>

          <Link
            href="/dashboard/superadmin"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm hover:bg-white/[0.06]"
          >
            Volver
          </Link>
        </div>
      </header>

      <section className="p-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/[0.03] p-8">
          <div className="mb-10">
            <h2 className="text-4xl font-bold">Crear condominio completo</h2>

            <p className="mt-3 text-gray-400">
              Crea la comunidad cliente y su primer administrador.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-red-200">
              {errorMessage}
            </div>
          )}

          <form action={createFullCommunity} className="grid gap-8">
            <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
              <h3 className="mb-6 text-2xl font-semibold">Datos del condominio</h3>

              <div className="grid gap-5">
                <input
                  name="community_name"
                  required
                  placeholder="Nombre del condominio"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none focus:border-blue-500"
                />

                <input
                  name="slug"
                  required
                  placeholder="slug-ejemplo"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none focus:border-blue-500"
                />

                <input
                  name="address"
                  placeholder="Dirección"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none focus:border-blue-500"
                />

                <div className="grid gap-5 md:grid-cols-3">
                  <input
                    name="city"
                    required
                    placeholder="Ciudad"
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none focus:border-blue-500"
                  />

                  <input
                    name="total_units"
                    type="number"
                    min="0"
                    defaultValue="0"
                    placeholder="Unidades"
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none focus:border-blue-500"
                  />

                  <select
                    name="plan"
                    defaultValue="starter"
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none focus:border-blue-500"
                  >
                    <option value="starter">Starter</option>
                    <option value="growth">Growth</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
              <h3 className="mb-6 text-2xl font-semibold">Administrador del condominio</h3>

              <div className="grid gap-5">
                <input
                  name="admin_name"
                  required
                  placeholder="Nombre administrador"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none focus:border-blue-500"
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <input
                    name="admin_email"
                    type="email"
                    required
                    placeholder="admin@condominio.cl"
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none focus:border-blue-500"
                  />

                  <input
                    name="admin_password"
                    type="password"
                    required
                    minLength={6}
                    placeholder="Contraseña inicial"
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                type="submit"
                className="rounded-2xl bg-blue-500 px-6 py-4 font-semibold hover:bg-blue-400"
              >
                Crear condominio y administrador
              </button>

              <Link
                href="/dashboard/superadmin"
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-4 font-semibold hover:bg-white/[0.06]"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}