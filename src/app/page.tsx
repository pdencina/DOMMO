export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050816] text-white">
      {/* BACKGROUND EFFECT */}
      <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />

      {/* NAVBAR */}
      <header className="relative z-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
          <div className="text-2xl font-bold tracking-tight">DOMMO</div>

          <nav className="hidden gap-8 text-sm text-gray-300 md:flex">
            <a href="#" className="hover:text-white">
              Plataforma
            </a>

            <a href="#" className="hover:text-white">
              Soluciones
            </a>

            <a href="#" className="hover:text-white">
              Precios
            </a>

            <a href="#" className="hover:text-white">
              Contacto
            </a>
          </nav>

          <button className="rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-sm transition hover:bg-white/10">
            Ingresar
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="relative z-10">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
          {/* LEFT */}
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
              Plataforma SaaS para comunidades
            </div>

            <h1 className="text-5xl font-bold leading-tight tracking-tight sm:text-7xl">
              Menos administración.
              <span className="block text-blue-400">
                Más comunidad.
              </span>
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-8 text-gray-400">
              DOMMO conecta residentes, administración, pagos, accesos y
              comunicaciones en una experiencia moderna y simple.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <button className="rounded-2xl bg-blue-500 px-7 py-4 font-semibold text-white transition hover:bg-blue-400">
                Solicitar demo
              </button>

              <button className="rounded-2xl border border-white/10 bg-white/5 px-7 py-4 font-semibold transition hover:bg-white/10">
                Ver plataforma
              </button>
            </div>

            {/* METRICS */}
            <div className="mt-14 grid grid-cols-3 gap-6">
              <Metric value="24/7" label="Disponible" />

              <Metric value="100%" label="Cloud" />

              <Metric value="1 lugar" label="Todo conectado" />
            </div>
          </div>

          {/* RIGHT MOCKUP */}
          <div className="relative flex items-center justify-center">
            <div className="absolute h-[450px] w-[450px] rounded-full bg-blue-500/20 blur-3xl" />

            <div className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur">
              {/* TOP */}
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div>
                  <p className="text-sm text-gray-400">
                    Comunidad
                  </p>

                  <h3 className="mt-1 text-xl font-semibold">
                    Edificio Los Leones
                  </h3>
                </div>

                <div className="rounded-xl bg-green-500/10 px-3 py-2 text-sm text-green-400">
                  Operativo
                </div>
              </div>

              {/* CARDS */}
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <DashboardCard
                  title="Pagos"
                  value="$12.4M"
                  subtitle="Recaudado este mes"
                />

                <DashboardCard
                  title="Morosidad"
                  value="8%"
                  subtitle="Bajo promedio"
                />

                <DashboardCard
                  title="Tickets"
                  value="24"
                  subtitle="Incidencias activas"
                />

                <DashboardCard
                  title="Visitas"
                  value="128"
                  subtitle="Registradas hoy"
                />
              </div>

              {/* ACTIVITY */}
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
                <p className="text-sm text-gray-400">
                  Actividad reciente
                </p>

                <div className="mt-4 space-y-4">
                  <ActivityItem
                    title="Pago recibido"
                    subtitle="Departamento 504"
                  />

                  <ActivityItem
                    title="Nueva visita autorizada"
                    subtitle="Torre B"
                  />

                  <ActivityItem
                    title="Ticket creado"
                    subtitle="Ascensor mantenimiento"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative z-10 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-bold">
              Todo lo que tu comunidad necesita
            </h2>

            <p className="mt-4 text-lg text-gray-400">
              Una plataforma diseñada para modernizar la experiencia completa de
              administración.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <FeatureCard
              title="Pagos Online"
              description="Automatiza cobros y pagos de gastos comunes."
            />

            <FeatureCard
              title="Comunicaciones"
              description="Notificaciones, comunicados y mensajes centralizados."
            />

            <FeatureCard
              title="Control de Acceso"
              description="Visitas, QR, accesos y registros inteligentes."
            />

            <FeatureCard
              title="Mantenciones"
              description="Tickets, incidencias y seguimiento operacional."
            />
          </div>
        </div>
      </section>
    </main>
  )
}

function FeatureCard({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-blue-500/30 hover:bg-white/[0.05]">
      <div className="mb-5 h-14 w-14 rounded-2xl bg-blue-500/10" />

      <h3 className="text-xl font-semibold">{title}</h3>

      <p className="mt-3 text-sm leading-7 text-gray-400">
        {description}
      </p>
    </div>
  )
}

function Metric({
  value,
  label,
}: {
  value: string
  label: string
}) {
  return (
    <div>
      <div className="text-3xl font-bold text-blue-400">
        {value}
      </div>

      <div className="mt-2 text-sm text-gray-400">
        {label}
      </div>
    </div>
  )
}

function DashboardCard({
  title,
  value,
  subtitle,
}: {
  title: string
  value: string
  subtitle: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <p className="text-sm text-gray-400">
        {title}
      </p>

      <div className="mt-3 text-3xl font-bold">
        {value}
      </div>

      <p className="mt-2 text-sm text-gray-500">
        {subtitle}
      </p>
    </div>
  )
}

function ActivityItem({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] p-4">
      <div>
        <p className="font-medium">{title}</p>

        <p className="mt-1 text-sm text-gray-500">
          {subtitle}
        </p>
      </div>

      <div className="h-3 w-3 rounded-full bg-green-400" />
    </div>
  )
}