export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">
      {/* TOPBAR */}
      <header className="border-b border-white/5 bg-black/20 backdrop-blur">
        <div className="flex items-center justify-between px-8 py-5">
          <div>
            <p className="text-sm text-gray-400">
              Comunidad
            </p>

            <h1 className="mt-1 text-2xl font-bold">
              Comunidad DOMMO Demo
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm transition hover:bg-white/[0.06]">
              Exportar
            </button>

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-500 font-semibold">
              P
            </div>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <section className="p-8">
        {/* WELCOME */}
        <div className="mb-10">
          <h2 className="text-4xl font-bold">
            Bienvenido a DOMMO 👋
          </h2>

          <p className="mt-3 text-lg text-gray-400">
            Administra tu comunidad desde una experiencia moderna y centralizada.
          </p>
        </div>

        {/* METRICS */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Recaudación"
            value="$12.400.000"
            subtitle="Este mes"
          />

          <MetricCard
            title="Morosidad"
            value="8%"
            subtitle="Bajo promedio"
          />

          <MetricCard
            title="Tickets"
            value="24"
            subtitle="Incidencias activas"
          />

          <MetricCard
            title="Visitas"
            value="128"
            subtitle="Registradas hoy"
          />
        </div>

        {/* GRID */}
        <div className="mt-8 grid gap-6 xl:grid-cols-3">
          {/* ACTIVITY */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 xl:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">
                  Actividad reciente
                </h3>

                <p className="mt-1 text-sm text-gray-400">
                  Últimos movimientos del sistema
                </p>
              </div>

              <button className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm hover:bg-white/[0.05]">
                Ver todo
              </button>
            </div>

            <div className="space-y-4">
              <ActivityItem
                title="Pago recibido"
                description="Departamento 504 realizó un pago."
                status="Completado"
              />

              <ActivityItem
                title="Nueva visita"
                description="Visita autorizada para Torre B."
                status="Activa"
              />

              <ActivityItem
                title="Ticket generado"
                description="Mantención ascensor principal."
                status="Pendiente"
              />

              <ActivityItem
                title="Nuevo comunicado"
                description="Aviso enviado a residentes."
                status="Publicado"
              />
            </div>
          </div>

          {/* SIDE PANEL */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="text-xl font-semibold">
                Estado plataforma
              </h3>

              <div className="mt-6 flex items-center justify-between rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
                <div>
                  <p className="font-medium">
                    Operativa
                  </p>

                  <p className="mt-1 text-sm text-green-300">
                    Todos los servicios funcionando
                  </p>
                </div>

                <div className="h-3 w-3 rounded-full bg-green-400" />
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="text-xl font-semibold">
                Acciones rápidas
              </h3>

              <div className="mt-6 grid gap-3">
                <QuickButton text="Nuevo comunicado" />
                <QuickButton text="Registrar visita" />
                <QuickButton text="Crear ticket" />
                <QuickButton text="Ver reportes" />
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

function ActivityItem({
  title,
  description,
  status,
}: {
  title: string
  description: string
  status: string
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/20 p-5">
      <div>
        <h4 className="font-medium">
          {title}
        </h4>

        <p className="mt-1 text-sm text-gray-400">
          {description}
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-300">
        {status}
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