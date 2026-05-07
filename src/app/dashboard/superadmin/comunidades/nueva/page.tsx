// @ts-nocheck

import Link from 'next/link'
import { randomUUID } from 'crypto'
import { redirect } from 'next/navigation'
import { createAdminClient, createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function NewCommunityPage() {
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

  async function createCommunity(formData: FormData) {
    'use server'

    const adminSupabase = await createAdminClient()

    const name = String(formData.get('name') || '').trim()
    const slug = String(formData.get('slug') || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')

    const address = String(formData.get('address') || '').trim()
    const city = String(formData.get('city') || '').trim()
    const totalUnits = Number(formData.get('total_units') || 0)
    const plan = String(formData.get('plan') || 'starter')
    const status = String(formData.get('status') || 'active')

    if (!name || !slug || !city) {
      redirect('/dashboard/superadmin/comunidades/nueva?error=missing_fields')
    }

    const { error } = await adminSupabase.from('buildings').insert({
      id: randomUUID(),
      name,
      slug,
      address,
      city,
      total_units: totalUnits,
      plan,
      status,
    })

    if (error) {
      redirect('/dashboard/superadmin/comunidades/nueva?error=create_failed')
    }

    redirect('/dashboard/superadmin')
  }

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <header className="border-b border-white/5 bg-black/20 backdrop-blur">
        <div className="flex items-center justify-between px-8 py-5">
          <div>
            <p className="text-sm text-gray-400">Super Admin</p>
            <h1 className="mt-1 text-2xl font-bold">Nueva comunidad</h1>
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
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/[0.03] p-8">
          <div className="mb-8">
            <h2 className="text-4xl font-bold">
              Registrar condominio cliente
            </h2>

            <p className="mt-3 text-gray-400">
              Esta comunidad quedará disponible dentro de DOMMO para luego
              asignarle administradores, residentes y módulos.
            </p>
          </div>

          <form action={createCommunity} className="grid gap-5">
            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Nombre de la comunidad
              </label>

              <input
                name="name"
                required
                placeholder="Edificio Los Leones"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Slug / identificador
              </label>

              <input
                name="slug"
                required
                placeholder="edificio-los-leones"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none focus:border-blue-500"
              />

              <p className="mt-2 text-xs text-gray-500">
                Se usará internamente para identificar la comunidad.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Dirección
              </label>

              <input
                name="address"
                placeholder="Av. Providencia 1234"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Ciudad
                </label>

                <input
                  name="city"
                  required
                  placeholder="Santiago"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Total unidades
                </label>

                <input
                  name="total_units"
                  type="number"
                  min="0"
                  defaultValue="0"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Plan
                </label>

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

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Estado
                </label>

                <select
                  name="status"
                  defaultValue="active"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none focus:border-blue-500"
                >
                  <option value="active">Activo</option>
                  <option value="trial">Trial</option>
                  <option value="suspended">Suspendido</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-4">
              <button
                type="submit"
                className="rounded-2xl bg-blue-500 px-6 py-4 font-semibold hover:bg-blue-400"
              >
                Crear comunidad
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