// @ts-nocheck
import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#050C1A] text-white overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#050C1A]/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 h-16 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight">DOMMO</span>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#funcionalidades" className="hover:text-white transition-colors cursor-pointer">Funcionalidades</a>
            <a href="#roles" className="hover:text-white transition-colors cursor-pointer">¿Para quién?</a>
            <a href="#precios" className="hover:text-white transition-colors cursor-pointer">Precios</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-300 hover:text-white transition-colors px-4 py-2">
              Iniciar sesión
            </Link>
            <Link href="/login" className="bg-[#0F6E56] hover:bg-[#0a5540] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95">
              Prueba gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-24 px-6">
        {/* Orbs de fondo */}
        <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-[#0F6E56]/15 blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#0F6E56]/30 bg-[#0F6E56]/10 px-4 py-2 text-sm text-[#5DCAA5] mb-8">
                <span className="w-2 h-2 rounded-full bg-[#5DCAA5] animate-pulse inline-block" />
                Plataforma para comunidades residenciales
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
                Tu edificio,
                <span className="block text-[#5DCAA5]">sin caos.</span>
              </h1>

              <p className="text-lg text-gray-400 leading-relaxed mb-10 max-w-lg">
                Gastos comunes, residentes, mantenciones y comunicados en un solo lugar.
                Más simple que una planilla, más poderoso que cualquier alternativa.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-12">
                <Link href="/login"
                  className="inline-flex items-center justify-center gap-2 bg-[#0F6E56] hover:bg-[#0a5540] text-white font-semibold px-8 py-4 rounded-2xl transition-all hover:scale-105 active:scale-95 text-base">
                  Comenzar gratis — 30 días
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                </Link>
                <a href="#demo"
                  className="inline-flex items-center justify-center gap-2 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white font-medium px-8 py-4 rounded-2xl transition-all text-base">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M10 8l6 4-6 4V8z"/></svg>
                  Ver demo
                </a>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {['MP','JR','CL','AB'].map(i => (
                      <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0F6E56] to-blue-600 border-2 border-[#050C1A] flex items-center justify-center text-[9px] font-bold text-white">{i}</div>
                    ))}
                  </div>
                  <span>+200 administradores activos</span>
                </div>
                <span>·</span>
                <span>★★★★★ 4.9/5</span>
              </div>
            </div>

            {/* Right: Dashboard mockup */}
            <div className="hidden lg:block relative">
              <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden shadow-2xl">
                {/* Topbar mockup */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  </div>
                  <div className="flex-1 mx-4 h-6 rounded-full bg-white/5 flex items-center px-3">
                    <span className="text-[11px] text-gray-500">dommo.app/dashboard</span>
                  </div>
                </div>

                {/* Dashboard preview */}
                <div className="flex">
                  {/* Mini sidebar */}
                  <div className="w-36 bg-white/5 p-3 border-r border-white/5 space-y-1">
                    <div className="text-[10px] font-bold text-[#5DCAA5] px-2 py-1">DOMMO</div>
                    {['Dashboard','Gastos comunes','Propietarios','Mantenciones','Avisos'].map((item, i) => (
                      <div key={item} className={`text-[10px] px-2 py-1.5 rounded-lg ${i===0 ? 'bg-[#0F6E56]/30 text-[#5DCAA5]' : 'text-gray-500'}`}>
                        {item}
                      </div>
                    ))}
                  </div>

                  {/* Main content */}
                  <div className="flex-1 p-4 space-y-3">
                    {/* Alert */}
                    <div className="flex items-center gap-2 text-[10px] bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-red-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                      3 unidades con gasto común vencido
                    </div>

                    {/* KPI cards */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Recaudado', value: '$2.4M', color: 'text-[#5DCAA5]' },
                        { label: 'Pendiente', value: '$680K', color: 'text-amber-400' },
                        { label: 'Unidades', value: '48',    color: 'text-white' },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="bg-white/5 rounded-lg p-2.5 border border-white/5">
                          <p className="text-[9px] text-gray-500 mb-0.5">{label}</p>
                          <p className={`text-sm font-bold ${color}`}>{value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Table preview */}
                    <div className="bg-white/5 rounded-lg border border-white/5 overflow-hidden">
                      <div className="text-[9px] font-semibold text-gray-500 px-3 py-2 border-b border-white/5 uppercase tracking-wider">
                        Pagos pendientes
                      </div>
                      {[
                        { depto: '3B', name: 'R. Saavedra', status: 'Vencido', color: 'text-red-400' },
                        { depto: '7A', name: 'C. Fuentes',  status: 'Urgente', color: 'text-red-400' },
                        { depto: '12C',name: 'L. Morales',  status: 'Pendiente',color:'text-amber-400' },
                      ].map(({ depto, name, status, color }) => (
                        <div key={depto} className="flex items-center gap-2 px-3 py-1.5 border-b border-white/5 last:border-0">
                          <div className="w-6 h-6 rounded bg-[#0F6E56]/30 flex items-center justify-center text-[8px] font-bold text-[#5DCAA5]">{depto}</div>
                          <span className="text-[10px] text-gray-300 flex-1">{name}</span>
                          <span className={`text-[9px] font-medium ${color}`}>{status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-[#0F6E56] text-white text-xs font-bold px-3 py-2 rounded-xl shadow-lg">
                ✓ Depto 201 pagó
              </div>
              <div className="absolute -bottom-4 -left-4 bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-lg">
                🔧 Ascensor: en progreso
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LOGOS / SOCIAL PROOF ── */}
      <section className="border-y border-white/5 py-8 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs text-gray-600 uppercase tracking-widest mb-6">Confían en DOMMO</p>
          <div className="flex justify-center items-center gap-12 flex-wrap text-gray-600 text-sm font-medium">
            {['Edificio Las Palmas','Torres del Maule','Cond. El Roble','Plaza Mayor','Mirasol'].map(n => (
              <span key={n} className="hover:text-gray-400 transition-colors">{n}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEMA / SOLUCIÓN ── */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Administrar un edificio no debería ser así</h2>
            <p className="text-gray-400 max-w-xl mx-auto">La mayoría de los administradores hoy sigue usando planillas, WhatsApp y cuadernos. Hay una mejor forma.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Antes */}
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8">
              <div className="text-red-400 text-sm font-semibold mb-5 flex items-center gap-2">
                <span className="text-lg">😩</span> Sin DOMMO
              </div>
              <ul className="space-y-3 text-sm text-gray-400">
                {[
                  'Planillas de Excel que nadie entiende',
                  'Cobros por WhatsApp o en papel',
                  'Sin registro de quién pagó y cuándo',
                  'Mantenciones perdidas en el chat',
                  'Residentes que no saben nada',
                  'Administrador desbordado',
                ].map(i => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-red-500 mt-0.5 flex-shrink-0">✗</span> {i}
                  </li>
                ))}
              </ul>
            </div>

            {/* Después */}
            <div className="rounded-2xl border border-[#0F6E56]/30 bg-[#0F6E56]/10 p-8">
              <div className="text-[#5DCAA5] text-sm font-semibold mb-5 flex items-center gap-2">
                <span className="text-lg">✨</span> Con DOMMO
              </div>
              <ul className="space-y-3 text-sm text-gray-300">
                {[
                  'Dashboard claro con todo en tiempo real',
                  'Alertas automáticas de morosidad',
                  'Historial completo de pagos',
                  'Mantenciones con seguimiento',
                  'App para residentes incluida',
                  'Administrador tranquilo y organizado',
                ].map(i => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-[#5DCAA5] mt-0.5 flex-shrink-0">✓</span> {i}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── FUNCIONALIDADES ── */}
      <section id="funcionalidades" className="py-24 px-6 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Todo lo que necesitas, nada que no</h2>
            <p className="text-gray-400 max-w-lg mx-auto">Diseñado específicamente para la realidad de las comunidades residenciales en Chile.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: '💳', title: 'Gastos comunes', desc: 'Genera cobros mensuales, registra pagos y visualiza quién debe al instante. Con alertas automáticas para morosos.' },
              { icon: '👥', title: 'Gestión de residentes', desc: 'Ficha completa por unidad: propietario, residente, contactos y historial de pagos en un solo lugar.' },
              { icon: '🔧', title: 'Mantenciones', desc: 'Crea órdenes de trabajo, asigna proveedores, fija fechas y haz seguimiento hasta que esté resuelto.' },
              { icon: '📢', title: 'Comunicados', desc: 'Publica avisos para toda la comunidad. Los residentes los ven en su portal al instante.' },
              { icon: '📊', title: 'Reportes financieros', desc: 'Estado de ingresos, egresos y balance mensual. Listo para presentar en la junta de copropietarios.' },
              { icon: '🏠', title: 'Portal del residente', desc: 'Cada residente tiene su propio acceso para ver su estado de pago, avisos y contactar a la administración.' },
            ].map(({ icon, title, desc }) => (
              <div key={title}
                className="group rounded-2xl border border-white/5 bg-white/[0.03] p-6 hover:border-[#0F6E56]/40 hover:bg-[#0F6E56]/5 transition-all duration-300 cursor-default">
                <div className="text-3xl mb-4">{icon}</div>
                <h3 className="text-base font-bold mb-2 group-hover:text-[#5DCAA5] transition-colors">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROLES ── */}
      <section id="roles" className="py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Una plataforma, cinco experiencias</h2>
            <p className="text-gray-400 max-w-lg mx-auto">Cada persona en el edificio ve exactamente lo que necesita, sin confusión.</p>
          </div>

          <div className="grid md:grid-cols-5 gap-4">
            {[
              { role: 'Super Admin', icon: '🛡️', color: 'border-purple-500/30 bg-purple-500/5', textColor: 'text-purple-400', desc: 'Gestiona todos los edificios desde un panel central.' },
              { role: 'Administrador', icon: '⚙️', color: 'border-[#0F6E56]/30 bg-[#0F6E56]/5', textColor: 'text-[#5DCAA5]', desc: 'Control total del edificio: pagos, mantenciones y comunicados.' },
              { role: 'Comité', icon: '👔', color: 'border-blue-500/30 bg-blue-500/5', textColor: 'text-blue-400', desc: 'Visión financiera y de gestión para supervisar.' },
              { role: 'Residente', icon: '🏠', color: 'border-amber-500/30 bg-amber-500/5', textColor: 'text-amber-400', desc: 'Ve sus pagos, recibe avisos y contacta a la administración.' },
              { role: 'Conserje', icon: '🔑', color: 'border-gray-500/30 bg-gray-500/5', textColor: 'text-gray-400', desc: 'Directorio, reservas y avisos urgentes del día.' },
            ].map(({ role, icon, color, textColor, desc }) => (
              <div key={role} className={`rounded-2xl border p-5 ${color} transition-all hover:scale-105 duration-300`}>
                <div className="text-2xl mb-3">{icon}</div>
                <h3 className={`text-sm font-bold mb-2 ${textColor}`}>{role}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRECIOS ── */}
      <section id="precios" className="py-24 px-6 bg-white/[0.02]">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Precios que no duelen</h2>
            <p className="text-gray-400 max-w-lg mx-auto">40% más barato que la competencia. Sin contratos anuales. Sin letra chica.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                plan: 'Básico',
                price: '$35.000',
                uf: '≈ 1 UF/mes',
                desc: 'Para edificios pequeños que quieren empezar.',
                features: ['Hasta 50 unidades','Dashboard de pagos','Alertas de morosidad','Avisos digitales','App para residentes'],
                cta: 'Empezar gratis',
                featured: false,
              },
              {
                plan: 'Pro',
                price: '$59.000',
                uf: '≈ 1.7 UF/mes',
                desc: 'El más elegido por administradores profesionales.',
                features: ['Hasta 200 unidades','Todo lo del Básico','Reserva espacios comunes','Gestión mantenciones','Contabilidad básica','Soporte WhatsApp','Pago online 1,9%+IVA'],
                cta: 'Probar 30 días gratis',
                featured: true,
              },
              {
                plan: 'Premium',
                price: '$99.000',
                uf: '≈ 2.8 UF/mes',
                desc: 'Para administradoras con múltiples edificios.',
                features: ['Unidades ilimitadas','Todo lo del Pro','Multi-edificio','Remuneraciones','Conciliación bancaria','Reportes avanzados','Onboarding dedicado'],
                cta: 'Contactar',
                featured: false,
              },
            ].map(({ plan, price, uf, desc, features, cta, featured }) => (
              <div key={plan}
                className={`rounded-2xl border p-7 flex flex-col ${
                  featured
                    ? 'border-[#0F6E56] bg-[#0F6E56]/10 relative'
                    : 'border-white/10 bg-white/[0.03]'
                }`}>
                {featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#0F6E56] text-white text-xs font-bold px-4 py-1 rounded-full">
                    Más popular
                  </div>
                )}
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-400 mb-2">{plan}</p>
                  <p className="text-3xl font-bold mb-1">{price}</p>
                  <p className="text-sm text-gray-500">{uf} · {desc}</p>
                </div>
                <ul className="space-y-2.5 flex-1 mb-8">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                      <span className="text-[#5DCAA5] font-bold flex-shrink-0">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/login"
                  className={`text-center py-3.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95 ${
                    featured
                      ? 'bg-[#0F6E56] hover:bg-[#0a5540] text-white'
                      : 'border border-white/10 hover:border-white/20 text-gray-300'
                  }`}>
                  {cta}
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-600 mt-8">
            Comisión pago online: 1,9% + IVA · Sin contratos anuales · Cancela cuando quieras
          </p>
        </div>
      </section>

      {/* ── TESTIMONIOS ── */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Lo que dicen los administradores</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name: 'María González', role: 'Administradora · Edificio Las Palmas', quote: 'Antes pasaba horas persiguiendo pagos por WhatsApp. Ahora DOMMO me avisa automáticamente quién debe y con cuántos días de atraso.', stars: 5 },
              { name: 'Carlos Herrera', role: 'Comité · Torres del Maule', quote: 'Los reportes financieros son claros y puedo verlos desde el celular antes de cada junta. El comité quedó muy conforme.', stars: 5 },
              { name: 'Ana Rodríguez', role: 'Residente · Plaza Mayor', quote: 'Me llega el aviso cuando mi pago está registrado. No más incertidumbre ni llamadas para saber si llegó la transferencia.', stars: 5 },
            ].map(({ name, role, quote, stars }) => (
              <div key={name} className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
                <div className="flex gap-0.5 mb-4">
                  {Array(stars).fill(0).map((_, i) => (
                    <span key={i} className="text-amber-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-sm text-gray-300 leading-relaxed mb-5">"{quote}"</p>
                <div>
                  <p className="text-sm font-semibold text-white">{name}</p>
                  <p className="text-xs text-gray-500">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="rounded-3xl border border-[#0F6E56]/30 bg-[#0F6E56]/10 p-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              ¿Listo para administrar<br />sin estrés?
            </h2>
            <p className="text-gray-400 mb-8 text-lg">
              30 días gratis, sin tarjeta de crédito, sin contratos.<br />
              Configura tu edificio en menos de 10 minutos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/login"
                className="inline-flex items-center justify-center gap-2 bg-[#0F6E56] hover:bg-[#0a5540] text-white font-bold px-10 py-4 rounded-2xl transition-all hover:scale-105 active:scale-95 text-base">
                Comenzar ahora — es gratis
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
              </Link>
              <a href="mailto:hola@dommo.cl"
                className="inline-flex items-center justify-center gap-2 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white font-medium px-8 py-4 rounded-2xl transition-all text-base">
                Hablar con ventas
              </a>
            </div>
            <p className="text-xs text-gray-600 mt-6">Sin tarjeta · Sin contrato · Cancela cuando quieras</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
            <div className="max-w-xs">
              <p className="text-xl font-bold mb-3">DOMMO</p>
              <p className="text-sm text-gray-500 leading-relaxed">
                La plataforma más amigable para administrar comunidades residenciales en Chile.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
              <div>
                <p className="font-semibold mb-3 text-gray-300">Producto</p>
                <ul className="space-y-2 text-gray-500">
                  <li><a href="#funcionalidades" className="hover:text-gray-300 transition-colors">Funcionalidades</a></li>
                  <li><a href="#precios" className="hover:text-gray-300 transition-colors">Precios</a></li>
                  <li><Link href="/login" className="hover:text-gray-300 transition-colors">Iniciar sesión</Link></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-3 text-gray-300">Empresa</p>
                <ul className="space-y-2 text-gray-500">
                  <li><a href="#" className="hover:text-gray-300 transition-colors">Nosotros</a></li>
                  <li><a href="#" className="hover:text-gray-300 transition-colors">Blog</a></li>
                  <li><a href="mailto:hola@dommo.cl" className="hover:text-gray-300 transition-colors">Contacto</a></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-3 text-gray-300">Legal</p>
                <ul className="space-y-2 text-gray-500">
                  <li><a href="#" className="hover:text-gray-300 transition-colors">Términos</a></li>
                  <li><a href="#" className="hover:text-gray-300 transition-colors">Privacidad</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-gray-600">
            <p>© 2026 DOMMO. Hecho con ❤️ en Chile.</p>
            <p>Más simple, más cercano, más tuyo.</p>
          </div>
        </div>
      </footer>

    </main>
  )
}
