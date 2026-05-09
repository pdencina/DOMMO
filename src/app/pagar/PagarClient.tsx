// @ts-nocheck
'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Search, Building2, CreditCard, CheckCircle2,
  AlertTriangle, ArrowLeft, ShieldCheck, Loader2,
  MapPin, Hash, X
} from 'lucide-react'

const formatCLP = (n: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)

export default function PagarClient({
  initialCode,
  unitData,
  errorMsg,
  paymentResult,
  paidAmount,
}: {
  initialCode: string
  unitData: any
  errorMsg: string
  paymentResult?: string
  paidAmount: number
}) {
  const [code,       setCode]       = useState(initialCode)
  const [searching,  setSearching]  = useState(false)
  const [payLoading, setPayLoading] = useState(false)
  const [payError,   setPayError]   = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(
    unitData?.payments?.length === 1 ? unitData.payments[0].id : null
  )
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!initialCode) inputRef.current?.focus()
  }, [initialCode])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return
    setSearching(true)
    window.location.href = `/pagar?code=${encodeURIComponent(code.trim().toUpperCase())}`
  }

  async function handlePay() {
    const paymentId = selectedId ?? unitData?.payments?.[0]?.id
    if (!paymentId) return

    setPayLoading(true)
    setPayError('')

    try {
      const res  = await fetch('/api/payments/initiate-public', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ paymentId, returnPath: '/pagar' }),
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        setPayError(data.error ?? 'Error al iniciar el pago')
        setPayLoading(false)
        return
      }

      // Form POST a Transbank
      const form  = document.createElement('form')
      form.method = 'POST'
      form.action = data.url
      const input = document.createElement('input')
      input.type  = 'hidden'
      input.name  = 'token_ws'
      input.value = data.token
      form.appendChild(input)
      document.body.appendChild(form)
      form.submit()
    } catch {
      setPayError('Error de conexión. Intenta de nuevo.')
      setPayLoading(false)
    }
  }

  const selectedPayment = unitData?.payments?.find((p: any) => p.id === selectedId)
    ?? unitData?.payments?.[0]

  return (
    <div className="min-h-screen bg-[#050C1A] text-white">

      {/* Nav */}
      <nav className="border-b border-white/5 bg-[#050C1A]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold hover:opacity-80 transition-opacity">
          DOMMO
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login"
            className="text-sm text-gray-400 hover:text-white transition-colors">
            Iniciar sesión
          </Link>
        </div>
      </nav>

      {/* Resultado de pago */}
      {paymentResult && (
        <div className={`mx-auto max-w-lg mt-6 px-6`}>
          <div className={`rounded-2xl border px-5 py-4 flex items-start gap-3 ${
            paymentResult === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
              : 'bg-red-500/10 border-red-500/30 text-red-200'
          }`}>
            {paymentResult === 'success'
              ? <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" />
              : <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
            }
            <div>
              <p className="text-sm font-bold">
                {paymentResult === 'success' ? '¡Pago exitoso!' :
                 paymentResult === 'rejected' ? 'Pago rechazado' :
                 paymentResult === 'cancelled' ? 'Pago cancelado' : 'Error en el pago'}
              </p>
              <p className="text-xs opacity-80 mt-0.5">
                {paymentResult === 'success'
                  ? `Tu pago de ${formatCLP(paidAmount)} fue procesado. Guarda este comprobante.`
                  : paymentResult === 'rejected'
                  ? 'Tu banco rechazó el pago. Intenta con otra tarjeta o verifica tu saldo.'
                  : paymentResult === 'cancelled'
                  ? 'Cancelaste el proceso. Puedes intentarlo nuevamente.'
                  : 'Ocurrió un error. Intenta de nuevo o contacta a tu administración.'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto px-6 py-10 space-y-6">

        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0F6E56]/20 border border-[#0F6E56]/30 mb-4">
            <CreditCard size={24} className="text-[#5DCAA5]" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Pago rápido</h1>
          <p className="text-sm text-gray-400">
            Ingresa el código de tu departamento para pagar sin necesidad de crear una cuenta.
          </p>
        </div>

        {/* Buscador */}
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="relative">
            <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              ref={inputRef}
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="Ej: LP-101"
              maxLength={20}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-4 text-white text-lg font-mono placeholder-gray-600 outline-none focus:border-[#0F6E56] focus:ring-1 focus:ring-[#0F6E56] transition-all uppercase tracking-wider"
            />
            {code && (
              <button
                type="button"
                onClick={() => { setCode(''); inputRef.current?.focus() }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!code.trim() || searching}
            className="w-full flex items-center justify-center gap-2 bg-[#0F6E56] hover:bg-[#0a5540] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-95"
          >
            {searching
              ? <><Loader2 size={16} className="animate-spin" /> Buscando...</>
              : <><Search size={16} /> Buscar departamento</>
            }
          </button>
        </form>

        {/* Error búsqueda */}
        {errorMsg && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3.5 text-sm text-red-300">
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
            {errorMsg}
          </div>
        )}

        {/* Resultado encontrado */}
        {unitData && (
          <div className="space-y-4 animate-fade-in">

            {/* Info unidad */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#0F6E56]/20 flex items-center justify-center flex-shrink-0">
                  <Building2 size={18} className="text-[#5DCAA5]" />
                </div>
                <div className="flex-1">
                  <p className="text-base font-bold text-white">
                    Depto {unitData.number}
                    {unitData.floor && ` · Piso ${unitData.floor}`}
                  </p>
                  <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-0.5">
                    <MapPin size={12} />
                    {unitData.building?.name} · {unitData.building?.city}
                  </p>
                  {unitData.owner?.full_name && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Propietario: {unitData.owner.full_name}
                    </p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] text-gray-500 mb-0.5">Código</p>
                  <p className="text-sm font-mono font-bold text-[#5DCAA5]">{unitData.payment_code}</p>
                </div>
              </div>

              {/* Deuda */}
              {unitData.payments.length === 0 ? (
                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                  <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-emerald-300">¡Al día!</p>
                    <p className="text-xs text-emerald-400/70">No tienes pagos pendientes.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Si hay múltiples cuotas, mostrar selector */}
                  {unitData.payments.length > 1 && (
                    <p className="text-xs text-amber-400 mb-2 flex items-center gap-1.5">
                      <AlertTriangle size={12} />
                      Tienes {unitData.payments.length} cuotas pendientes. Selecciona cuál pagar:
                    </p>
                  )}

                  {unitData.payments.map((p: any) => {
                    const period   = p.fee_periods
                    const isOver   = p.status === 'overdue'
                    const isSelected = selectedId === p.id || (unitData.payments.length === 1)

                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedId(p.id)}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
                          unitData.payments.length > 1 ? 'cursor-pointer' : ''
                        } ${isSelected
                            ? 'border-[#0F6E56] bg-[#0F6E56]/15'
                            : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                        }`}
                      >
                        {unitData.payments.length > 1 && (
                          <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                            isSelected ? 'border-[#5DCAA5] bg-[#5DCAA5]' : 'border-gray-600'
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white capitalize">
                            {period ? new Date(period.period_month + 'T12:00:00')
                              .toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })
                              : 'Gasto común'}
                          </p>
                          <p className={`text-xs mt-0.5 ${isOver ? 'text-red-400' : 'text-gray-400'}`}>
                            {isOver ? '⚠ Vencido' : period?.due_date
                              ? `Vence ${new Date(period.due_date).toLocaleDateString('es-CL')}`
                              : 'Pendiente'}
                          </p>
                        </div>
                        <p className="text-lg font-bold text-white tabular-nums">
                          {formatCLP(p.amount)}
                        </p>
                      </div>
                    )
                  })}

                  {/* Total si hay múltiples */}
                  {unitData.payments.length > 1 && (
                    <div className="flex justify-between items-center px-1 pt-1">
                      <p className="text-xs text-gray-500">
                        {selectedId ? 'Pagando seleccionada' : 'Deuda total'}
                      </p>
                      <p className="text-base font-bold text-white">
                        {formatCLP(selectedId
                          ? (unitData.payments.find((p: any) => p.id === selectedId)?.amount ?? 0)
                          : unitData.totalDebt
                        )}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Botón pagar */}
            {unitData.payments.length > 0 && (
              <div className="space-y-3">
                {payError && (
                  <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-300">
                    <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                    {payError}
                  </div>
                )}

                <button
                  onClick={handlePay}
                  disabled={payLoading}
                  className="w-full flex items-center justify-center gap-2.5 bg-[#E32125] hover:bg-[#C41A1E] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-95 text-base"
                >
                  {payLoading
                    ? <><Loader2 size={18} className="animate-spin" /> Conectando con WebPay...</>
                    : <><CreditCard size={18} /> Pagar con WebPay</>
                  }
                </button>

                <div className="flex items-center justify-center gap-1.5 text-xs text-gray-600">
                  <ShieldCheck size={13} className="text-emerald-600" />
                  Pago seguro · SSL · Certificado por Transbank Chile
                </div>

                <div className="flex items-center justify-center gap-2">
                  {['Visa', 'Mastercard', 'RedCompra', 'Débito'].map(m => (
                    <span key={m} className="text-[10px] text-gray-600 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ayuda */}
        {!unitData && !errorMsg && (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">
              ¿Dónde encuentro mi código?
            </p>
            <div className="space-y-2.5 text-sm text-gray-500">
              {[
                { icon: '📄', text: 'En el aviso de cobro que envía tu administración' },
                { icon: '📱', text: 'En tu portal de residente DOMMO' },
                { icon: '💬', text: 'Contactando directamente a tu administrador' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-start gap-2.5">
                  <span className="flex-shrink-0">{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Link volver */}
        <div className="text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-400 transition-colors flex items-center justify-center gap-1.5">
            <ArrowLeft size={14} /> Volver al inicio
          </Link>
        </div>

      </div>
    </div>
  )
}
