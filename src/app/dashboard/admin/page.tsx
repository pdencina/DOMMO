// @ts-nocheck

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createAdminClient, createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
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

  if (profile.role !== 'admin') {
    redirect('/dashboard')
  }

  const buildingId = profile.building_id

  const { count: apartmentsCount } = await adminSupabase
    .from('apartments')
    .select('*', { count: 'exact', head: true })
    .eq('building_id', buildingId)

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <header className="border-b border-white/5 bg-black/20 backdrop-blur">
        <div className="flex items-center justify-between px-8 py-6">
          <div>
            <p className="text-sm text-gray-400">Comunidad</p>

            <h1 className="mt-1 text-3xl font-bold">
              {profile.buildings?.name || 'Mi comunidad'}
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              {profile.buildings?.address} · {profile.buildings?.city}
            </p>
          </div>

          <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
            ADMIN COMUNIDAD
          </div>
        </div>
      </header>

      <section className="p-8">
        <div className="mb-10">
          <h2 className="text-5xl font-bold">
            Hola, {profile.full_name?.split(' ')[0] || 'Administrador'} 👋
          </h2>

          <p className="mt-4 text-lg text-gray-400">
            Administra tu comunidad desde DOMMO.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Unidades"
            value={String(apartmentsCount || 0)}
            subtitle={`de ${profile.buildings?.total_units || 0} registradas`}
          />

          <MetricCard
            title="Gastos comunes"
            value="$0"
            subtitle="Pendiente configuración"
          />

          <MetricCard
            title="Tickets"
            value="0"
            subtitle="Incidencias abiertas"
          />

          <MetricCard
            title="Estado"
            value="Activo"
            subtitle={`Plan ${profile.buildings?.plan || 'starter'}`}
          />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 xl:col-span-2">
            <h3 className="text-2xl font-semibold">
              Configuración inicial
            </h3>

            <p className="mt-2 text-gray-400">
              Completa estos pasos para dejar tu comunidad operativa.
            </p>

            <div className="mt-6 grid gap-4">
              <SetupItem
                title="Registrar departamentos"
                description="Carga las unidades, propietarios y residentes."
                href="/dashboard/admin/apartments"
              />

              <SetupItem
                title="Configurar gastos comunes"
                description="Prepara el módulo de cobros mensuales."
                href="/dashboard/pagos"
              />

              <SetupItem
                title="Crear primer comunicado"
                description="Informa a los residentes desde DOMMO."
                href="/dashboard/avisos"
              />

              <SetupItem
                title="Activar mantenciones"
                description="Gestiona tickets e incidencias."
                href="/dashboard/mantenciones"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="text-xl font-semibold">Acciones rápidas</h3>

              <div className="mt-6 grid gap-3">
                <QuickLink href="/dashboard/admin/apartments/new" text="Nuevo departamento" />
                <QuickLink href="/dashboard/admin/apartments" text="Ver departamentos" />
                <QuickLink href="/dashboard/avisos" text="Nuevo aviso" />
                <QuickLink href="/dashboard/mantenciones" text="Nueva mantención" />
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="text-xl font-semibold">Datos comunidad</h3>

              <div className="mt-5 space-y-3 text-sm text-gray-400">
                <p>
                  <span className="text-gray-500">Nombre:</span>{' '}
                  {profile.buildings?.name}
                </p>

                <p>
                  <span className="text-gray-500">Ciudad:</span>{' '}
                  {profile.buildings?.city}
                </p>

                <p>
                  <span className="text-gray-500">Unidades:</span>{' '}
                  {profile.buildings?.total_units}
                </p>

                <p>
                  <span className="text-gray-500">Estado:</span>{' '}
                  {profile.buildings?.status}
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

function SetupItem({ title, description, href }) {
  return (
    <Link
      href={href}
      className="block cursor-pointer rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:border-blue-500/30 hover:bg-white/[0.05]"
    >
      <h4 className="font-semibold">{title}</h4>
      <p className="mt-2 text-sm text-gray-400">{description}</p>
    </Link>
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