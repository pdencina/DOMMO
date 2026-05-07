export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0B1020] text-white">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-6 py-28 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 backdrop-blur">
              Plataforma SaaS para comunidades
            </div>

            <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
              DOMMO
            </h1>

            <p className="mt-6 text-2xl font-semibold text-blue-400">
              La plataforma moderna para administrar comunidades.
            </p>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-300">
              Controla pagos, residentes, accesos, comunicados y mantenciones
              desde un solo lugar. Todo conectado. Todo simple.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <button className="rounded-xl bg-blue-500 px-6 py-3 font-medium text-white transition hover:bg-blue-400">
                Solicitar demo
              </button>

              <button className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-medium text-white transition hover:bg-white/10">
                Ingresar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="mb-16 max-w-2xl">
          <h2 className="text-4xl font-bold">
            Todo lo que tu comunidad necesita
          </h2>

          <p className="mt-4 text-lg text-gray-400">
            Una experiencia moderna para administradores, residentes y comité.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <FeatureCard
            title="Pagos"
            description="Gestiona gastos comunes y pagos en línea de forma simple."
          />

          <FeatureCard
            title="Comunicados"
            description="Envía anuncios y notificaciones a toda la comunidad."
          />

          <FeatureCard
            title="Accesos"
            description="Control de visitas, QR y accesos inteligentes."
          />

          <FeatureCard
            title="Mantenciones"
            description="Administra tickets, incidencias y solicitudes."
          />
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 md:grid-cols-3 lg:px-8">
          <StatCard value="24/7" label="Acceso desde cualquier lugar" />

          <StatCard value="100%" label="Plataforma cloud" />

          <StatCard value="1 solo lugar" label="Toda tu comunidad conectada" />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-28 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/20 to-slate-900 p-12">
          <div className="max-w-3xl">
            <h2 className="text-4xl font-bold">
              Moderniza la experiencia de tu comunidad
            </h2>

            <p className="mt-6 text-lg text-gray-300">
              DOMMO transforma la administración tradicional en una experiencia
              moderna, simple y conectada.
            </p>

            <div className="mt-10">
              <button className="rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-gray-200">
                Solicitar demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-gray-500 md:flex-row lg:px-8">
          <p>© 2026 DOMMO. Todos los derechos reservados.</p>

          <p>Menos administración. Más comunidad.</p>
        </div>
      </footer>
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-blue-500/30 hover:bg-white/[0.05]">
      <div className="mb-4 h-12 w-12 rounded-xl bg-blue-500/10" />

      <h3 className="text-xl font-semibold">{title}</h3>

      <p className="mt-3 text-sm leading-6 text-gray-400">{description}</p>
    </div>
  )
}

function StatCard({
  value,
  label,
}: {
  value: string
  label: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
      <div className="text-4xl font-bold text-blue-400">{value}</div>

      <div className="mt-3 text-gray-400">{label}</div>
    </div>
  )
}