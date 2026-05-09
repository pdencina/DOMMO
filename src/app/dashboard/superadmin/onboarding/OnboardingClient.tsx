// @ts-nocheck
'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Building2, User, CheckCircle2, ArrowLeft,
  ArrowRight, Loader2, AlertCircle, Copy, ExternalLink
} from 'lucide-react'

const STEPS = [
  { id: 1, label: 'Edificio',      icon: Building2 },
  { id: 2, label: 'Administrador', icon: User },
  { id: 3, label: 'Confirmar',     icon: CheckCircle2 },
]

const PLANS = [
  { value: 'basico',   label: 'Básico',   price: '$35.000/mes', units: 'Hasta 50 unidades' },
  { value: 'pro',      label: 'Pro',      price: '$59.000/mes', units: 'Hasta 200 unidades', featured: true },
  { value: 'premium',  label: 'Premium',  price: '$99.000/mes', units: 'Ilimitadas' },
]

const CITIES = ['Santiago','Valparaíso','Viña del Mar','Concepción','La Serena','Antofagasta','Temuco','Rancagua','Talca','Iquique','Arica','Puerto Montt']

export default function OnboardingClient({ onCreateCommunity, errorMessage, successSlug, adminName }) {
  const [step, setStep] = useState(successSlug ? 3 : 1)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [slugEdited, setSlugEdited] = useState(false)

  // Form state
  const [form, setForm] = useState({
    name: '', slug: '', address: '', city: 'Santiago',
    total_units: '', plan: 'pro',
    admin_name: '', admin_email: '', admin_phone: '', admin_password: '',
  })

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }))

  // Auto-generate slug from name
  function handleNameChange(val: string) {
    set('name', val)
    if (!slugEdited) {
      set('slug', val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-'))
    }
  }

  function copyCredentials() {
    const text = `DOMMO — Acceso al sistema\n\nURL: https://${form.slug || successSlug}.dommo.app\nEmail: ${form.admin_email}\nContraseña: ${form.admin_password}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Validation por paso
  const step1Valid = form.name.length > 0 && form.slug.length > 0 && form.city.length > 0
  const step2Valid = form.admin_name.length > 0 && form.admin_email.includes('@') && form.admin_password.length >= 6

  // Si viene de server action con éxito
  if (successSlug && step < 3) setStep(3)

  return (
    <div className="min-h-screen bg-[#050C1A] text-white">

      {/* Header */}
      <div className="border-b border-white/5 bg-black/20 backdrop-blur-md px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/superadmin"
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            <ArrowLeft size={15} className="text-gray-400" />
          </Link>
          <div>
            <p className="text-xs text-gray-500">Super Admin · DOMMO</p>
            <p className="text-sm font-bold">Registrar nuevo edificio</p>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Hola, {adminName}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Stepper */}
        <div className="flex items-center justify-center mb-10">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            const active   = step === s.id
            const complete = step > s.id || (successSlug && s.id <= 3)
            return (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    complete ? 'bg-[#0F6E56] text-white' :
                    active   ? 'bg-white text-[#050C1A] ring-4 ring-[#0F6E56]/30' :
                               'bg-white/5 text-gray-600'
                  }`}>
                    {complete && !active ? <CheckCircle2 size={18} /> : <Icon size={16} />}
                  </div>
                  <span className={`text-[10px] font-medium ${active ? 'text-white' : complete ? 'text-[#5DCAA5]' : 'text-gray-600'}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-20 h-0.5 mb-5 mx-2 transition-all ${step > s.id ? 'bg-[#0F6E56]' : 'bg-white/10'}`} />
                )}
              </div>
            )
          })}
        </div>

        {/* Error global */}
        {errorMessage && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3.5 mb-6 text-sm text-red-300">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            {errorMessage}
          </div>
        )}

        {/* ── PASO 1: Edificio ── */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold mb-1">Datos del edificio</h2>
              <p className="text-sm text-gray-500">Información básica del condominio o edificio.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Nombre del edificio *</label>
                <input
                  value={form.name}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder="Ej: Condominio Las Palmas"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[#0F6E56] focus:ring-1 focus:ring-[#0F6E56] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Slug (URL del edificio) *
                  <span className="ml-2 text-gray-600 font-normal">→ laspalmas.dommo.app</span>
                </label>
                <input
                  value={form.slug}
                  onChange={e => { setSlugEdited(true); set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'')) }}
                  placeholder="las-palmas"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[#0F6E56] focus:ring-1 focus:ring-[#0F6E56] transition-all font-mono"
                />
                {form.slug && (
                  <p className="text-[11px] text-[#5DCAA5] mt-1.5">
                    ✓ URL: <span className="font-mono">{form.slug}.dommo.app</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Dirección</label>
                <input
                  value={form.address}
                  onChange={e => set('address', e.target.value)}
                  placeholder="Av. Las Condes 1234"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[#0F6E56] transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Ciudad *</label>
                  <select
                    value={form.city}
                    onChange={e => set('city', e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0d1525] px-4 py-3 text-sm text-white outline-none focus:border-[#0F6E56] transition-all"
                  >
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">N° de unidades</label>
                  <input
                    type="number" min="0"
                    value={form.total_units}
                    onChange={e => set('total_units', e.target.value)}
                    placeholder="Ej: 48"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[#0F6E56] transition-all"
                  />
                </div>
              </div>

              {/* Plan selector */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">Plan *</label>
                <div className="grid grid-cols-3 gap-2">
                  {PLANS.map(p => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => set('plan', p.value)}
                      className={`relative rounded-xl border p-3.5 text-left transition-all ${
                        form.plan === p.value
                          ? 'border-[#0F6E56] bg-[#0F6E56]/15'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      {p.featured && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-[#0F6E56] text-white px-2 py-0.5 rounded-full">
                          Popular
                        </span>
                      )}
                      <p className="text-sm font-bold text-white">{p.label}</p>
                      <p className="text-[11px] text-[#5DCAA5] mt-0.5">{p.price}</p>
                      <p className="text-[10px] text-gray-600 mt-0.5">{p.units}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => step1Valid && setStep(2)}
              disabled={!step1Valid}
              className="w-full flex items-center justify-center gap-2 bg-[#0F6E56] hover:bg-[#0a5540] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-95"
            >
              Siguiente: Administrador <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ── PASO 2: Administrador ── */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold mb-1">Administrador del edificio</h2>
              <p className="text-sm text-gray-500">Esta persona tendrá acceso total al panel del edificio.</p>
            </div>

            {/* Resumen edificio */}
            <div className="flex items-center gap-3 bg-[#0F6E56]/10 border border-[#0F6E56]/20 rounded-xl px-4 py-3">
              <Building2 size={16} className="text-[#5DCAA5] flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white">{form.name}</p>
                <p className="text-[11px] text-gray-500">{form.city} · Plan {form.plan} · {form.slug}.dommo.app</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Nombre completo *</label>
                <input
                  value={form.admin_name}
                  onChange={e => set('admin_name', e.target.value)}
                  placeholder="Ej: María González"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[#0F6E56] transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Correo electrónico *</label>
                  <input
                    type="email"
                    value={form.admin_email}
                    onChange={e => set('admin_email', e.target.value)}
                    placeholder="admin@edificio.cl"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[#0F6E56] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Teléfono</label>
                  <input
                    value={form.admin_phone}
                    onChange={e => set('admin_phone', e.target.value)}
                    placeholder="+56 9 1234 5678"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[#0F6E56] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Contraseña inicial *
                  <span className="ml-2 text-gray-600 font-normal">mín. 6 caracteres</span>
                </label>
                <input
                  type="password"
                  value={form.admin_password}
                  onChange={e => set('admin_password', e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[#0F6E56] transition-all"
                />
                {form.admin_password.length > 0 && form.admin_password.length < 6 && (
                  <p className="text-[11px] text-red-400 mt-1.5">Mínimo 6 caracteres</p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white px-6 py-3.5 rounded-xl transition-all text-sm font-medium"
              >
                <ArrowLeft size={15} /> Atrás
              </button>

              {/* Server Action submit */}
              <form action={onCreateCommunity} className="flex-1" onSubmit={() => setLoading(true)}>
                <input type="hidden" name="name"           value={form.name} />
                <input type="hidden" name="slug"           value={form.slug} />
                <input type="hidden" name="address"        value={form.address} />
                <input type="hidden" name="city"           value={form.city} />
                <input type="hidden" name="total_units"    value={form.total_units} />
                <input type="hidden" name="plan"           value={form.plan} />
                <input type="hidden" name="admin_name"     value={form.admin_name} />
                <input type="hidden" name="admin_email"    value={form.admin_email} />
                <input type="hidden" name="admin_phone"    value={form.admin_phone} />
                <input type="hidden" name="admin_password" value={form.admin_password} />
                <button
                  type="submit"
                  disabled={!step2Valid || loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#0F6E56] hover:bg-[#0a5540] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all hover:scale-[1.02] active:scale-95"
                >
                  {loading
                    ? <><Loader2 size={16} className="animate-spin" /> Creando edificio...</>
                    : <>Crear edificio <ArrowRight size={16} /></>
                  }
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── PASO 3: Éxito ── */}
        {(step === 3 || successSlug) && (
          <div className="space-y-6 animate-fade-in text-center">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-[#0F6E56]/20 border border-[#0F6E56]/40 flex items-center justify-center">
                <CheckCircle2 size={36} className="text-[#5DCAA5]" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-2">¡Edificio creado!</h2>
              <p className="text-gray-400 text-sm">
                {form.name || successSlug} está listo. El administrador ya puede iniciar sesión.
              </p>
            </div>

            {/* Credenciales */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Credenciales de acceso</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">URL</span>
                  <span className="text-sm font-mono text-[#5DCAA5]">
                    {(form.slug || successSlug)}.dommo.app
                  </span>
                </div>
                {form.admin_email && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Email</span>
                    <span className="text-sm font-mono text-white">{form.admin_email}</span>
                  </div>
                )}
                {form.admin_password && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Contraseña</span>
                    <span className="text-sm font-mono text-white">{form.admin_password}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Acciones */}
            <div className="flex flex-col gap-3">
              {form.admin_email && (
                <button
                  onClick={copyCredentials}
                  className="flex items-center justify-center gap-2 border border-white/10 hover:border-[#0F6E56]/50 hover:bg-[#0F6E56]/10 text-gray-300 hover:text-white py-3.5 rounded-xl transition-all text-sm font-medium"
                >
                  {copied ? <CheckCircle2 size={15} className="text-[#5DCAA5]" /> : <Copy size={15} />}
                  {copied ? '¡Copiado!' : 'Copiar credenciales'}
                </button>
              )}
              <Link href="/dashboard/superadmin"
                className="flex items-center justify-center gap-2 bg-[#0F6E56] hover:bg-[#0a5540] text-white font-semibold py-3.5 rounded-xl transition-all hover:scale-[1.02]">
                Ver todos los edificios
              </Link>
              <button
                onClick={() => { setForm({ name:'',slug:'',address:'',city:'Santiago',total_units:'',plan:'pro',admin_name:'',admin_email:'',admin_phone:'',admin_password:'' }); setStep(1); setSlugEdited(false) }}
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors py-2"
              >
                + Registrar otro edificio
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
