// @ts-nocheck

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createAdminClient, createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function SuperAdminDashboard() {
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
    .select('role, full_name, email')
    .eq('email', user.email)
    .maybeSingle()

  if (!profile || profile.role !== 'superadmin') {
    redirect('/dashboard')
  }

  const { data: communities } = await adminSupabase
    .from('buildings')
    .select('id, name, plan, status, total_units, city')
    .order('created_at', { ascending: false })

  const totalCommunities = communities?.length || 0
  const activeCommunities =
    communities?.filter((community) => community.status === 'active').length || 0

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <header className="border-b border-white/5 bg-black/20 backdrop-blur">
        <div className="flex items-center justify-between px-8 py-5">
          <div>
            <p className="text-sm text-gray-400">Plataforma</p>
            <h1 className="mt-1 text-2xl font-bold">DOMMO Super Admin</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
              SUPER ADMIN
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-500 font-semibold">
              P
            </div>
          </div>
        </div>
      </header>

      <section className="p-8">
        <div className="mb-10">
          <h2 className="text-5xl font-bold">Bienvenido Pablo 👋</h2>

          <p className="mt-4 text-lg text-gray-400">
            Administra toda la plataforma DOMMO desde un solo lugar.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Comunidades"
            value={String(totalCommunities)}
            subtitle="Total registradas"
          />

          <MetricCard
            title="Activas"
            value={String(activeCommunities)}
            subtitle="Clientes operativos"
          />

          <MetricCard
            title="MRR"
            value="$0"
            subtitle="Ingresos mensuales"
          />

          <MetricCard
            title="Estado"
            value="100%"
            subtitle="Plataforma operativa"
          />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 xl:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold">
                  Comunidades registradas
                </h3>

                <p className="mt-2 text-gray-400">
                  Clientes activos dentro de DOMMO.
                </p>
              </div>

              <Link
                href="/dashboard/superadmin/comunidades/nueva"
                className="rounded-2xl bg-blue-500 px-5 py-3 font-medium hover:bg-blue-400"
              >
                Nueva comunidad
              </Link>
            </div>

            <div className="space-y-4">
              {communities?.map((community) => (
                <CommunityCard
                  key={community.id}
                  name={community.name}
                  plan={community.plan}
                  status={community.status}
                  units={`${community.total_units} unidades`}
                  city={community.city}
                />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="text-xl font-semibold">Acciones rápidas</h3>

              <div className="mt-6 grid gap-3">
                <QuickLink
                  href="/dashboard/superadmin/comunidades/nueva"
                  text="Crear comunidad"
                />
                <QuickButton text="Crear administrador" />
                <QuickButton text="Ver usuarios" />
                <QuickButton text="Ver métricas" />
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="text-xl font-semibold">Estado sistema</h3>

              <div className="mt-6 rounded-2xl border border-green-500/20 bg-green-500/10 p-5">
                <p className="font-semibold text-green-300">
                  Todos los servicios operativos
                </p>

                <p className="mt-2 text-sm text-green-400">
                  API, Auth y DB funcionando correctamente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function MetricCard({ title, value, subtitle }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <p className="text-sm text-gray-400">{title}</p>
      <div className="mt-4 text-4xl font-bold">{value}</div>
      <p className="mt-3 text-sm text-gray-500">{subtitle}</p>
    </div>
  )
}

function CommunityCard({ name, plan, status, units, city }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-5">
      <div>
        <h4 className="text-lg font-semibold">{name}</h4>

        <p className="mt-2 text-sm text-gray-400">
          {units} · {city}
        </p>
      </div>

      <div className="text-right">
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-sm text-blue-300">
          {plan}
        </div>

        <p className="mt-2 text-sm text-gray-500">{status}</p>
      </div>
    </div>
  )
}

function QuickLink({ href, text }) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-left transition hover:bg-white/[0.05]"
    >
      {text}
    </Link>
  )
}

function QuickButton({ text }) {
  return (
    <button className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-left transition hover:bg-white/[0.05]">
      {text}
    </button>
  )
}