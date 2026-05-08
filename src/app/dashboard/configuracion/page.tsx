// @ts-nocheck

import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function ConfiguracionPage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <header className="border-b border-white/5 bg-black/20">
        <div className="px-8 py-6">
          <p className="text-sm text-gray-400">DOMMO</p>
          <h1 className="mt-2 text-3xl font-bold">Configuración</h1>
        </div>
      </header>

      <section className="p-8">
        <div className="grid gap-6 xl:grid-cols-3">
          <ConfigCard
            title="Mi perfil"
            description="Administra tus datos personales y acceso."
            href="/dashboard/configuracion/perfil"
          />

          <ConfigCard
            title="Comunidad"
            description="Datos generales del condominio o plataforma."
            href="/dashboard/configuracion/comunidad"
          />

          <ConfigCard
            title="Usuarios y roles"
            description="Administra permisos, perfiles y accesos."
            href="/dashboard/configuracion/usuarios"
          />

          <ConfigCard
            title="Planes y módulos"
            description="Activa módulos disponibles para cada comunidad."
            href="/dashboard/configuracion/modulos"
          />

          <ConfigCard
            title="Notificaciones"
            description="Configura correos, WhatsApp y alertas."
            href="/dashboard/configuracion/notificaciones"
          />

          <ConfigCard
            title="Seguridad"
            description="Sesiones, accesos y políticas de seguridad."
            href="/dashboard/configuracion/seguridad"
          />
        </div>
      </section>
    </main>
  )
}

function ConfigCard({
  title,
  description,
  href,
}: {
  title: string
  description: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="block cursor-pointer rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-blue-500/30 hover:bg-white/[0.06]"
    >
      <h2 className="text-xl font-semibold">{title}</h2>

      <p className="mt-3 text-sm leading-6 text-gray-400">
        {description}
      </p>
    </Link>
  )
}