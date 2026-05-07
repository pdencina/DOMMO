export default function SuperAdminDashboard() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">
      {/* TOPBAR */}
      <header className="border-b border-white/5 bg-black/20 backdrop-blur">
        <div className="flex items-center justify-between px-8 py-5">
          <div>
            <p className="text-sm text-gray-400">
              Plataforma
            </p>

            <h1 className="mt-1 text-2xl font-bold">
              DOMMO Super Admin
            </h1>
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
        {/* HEADER */}
        <div className="mb-10">
          <h2 className="text-5xl font-bold">
            Bienvenido Pablo 👋
          </h2>

          <p className="mt-4 text-lg text-gray-400">
            Administra toda la plataforma DOMMO desde un solo lugar.
          </p>
        </div>

        {/* METRICS */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Comunidades"
            value="1"
            subtitle="Clientes activos"
          />

          <MetricCard
            title="Usuarios"
            value="128"
            subtitle="Usuarios registrados"
          />

          <MetricCard
            title="MRR"
            value="$1.2M"
            subtitle="Ingresos mensuales"
          />

          <MetricCard
            title="Estado"
            value="100%"
            subtitle="Plataforma operativa"
          />
        </div>

        {/* GRID */}
        <div className="mt-8 grid gap-6 xl:grid-cols-3">
          {/* LEFT */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 xl:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold">
                  Comunidades recientes
                </h3>

                <p className="mt-2 text-gray-400">
                  Clientes activos dentro de DOMMO
                </p>
              </div>

              <button className="rounded-2xl bg-blue-500 px-5 py-3 font-medium hover:bg-blue-400">
                Nueva comunidad
              </button>
            </div>

            <div className="space-y-4">
              <CommunityCard
                name="Edificio Los Leones"
                plan="Premium"
                status="Activo"
                units="120 unidades"
              />

              <CommunityCard
                name="DOMMO Plataforma"
                plan="Interno"
                status="Operativo"
                units="Sistema"
              />
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="text-xl font-semibold">
                Acciones rápidas
              </h3>

              <div className="mt-6 grid gap-3">
                <QuickButton text="Crear comunidad" />
                <QuickButton text="Crear administrador" />
                <QuickButton text="Ver usuarios" />
                <QuickButton text="Ver métricas" />
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="text-xl font-semibold">
                Estado sistema
              </h3>

              <div className="mt-6 rounded-2xl border border-green-500/20 bg-green-500/10 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-green-300">
                      Todos los servicios operativos
                    </p>

                    <p className="mt-2 text-sm text-green-400">
                      API, Auth y DB funcionando correctamente.
                    </p>
                  </div>

                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function MetricCard({
  title,
  value,
  subtitle,
}: {
  title: string
  value: string
  subtitle: string
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <p className="text-sm text-gray-400">
        {title}
      </p>

      <div className="mt-4 text-4xl font-bold">
        {value}
      </div>

      <p className="mt-3 text-sm text-gray-500">
        {subtitle}
      </p>
    </div>
  )
}

function CommunityCard({
  name,
  plan,
  status,
  units,
}: {
  name: string
  plan: string
  status: string
  units: string
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-5">
      <div>
        <h4 className="text-lg font-semibold">
          {name}
        </h4>

        <p className="mt-2 text-sm text-gray-400">
          {units}
        </p>
      </div>

      <div className="text-right">
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-sm text-blue-300">
          {plan}
        </div>

        <p className="mt-2 text-sm text-gray-500">
          {status}
        </p>
      </div>
    </div>
  )
}

function QuickButton({
  text,
}: {
  text: string
}) {
  return (
    <button className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-left transition hover:bg-white/[0.05]">
      {text}
    </button>
  )
}