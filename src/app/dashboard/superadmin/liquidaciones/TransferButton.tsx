// @ts-nocheck
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle2, Send, X } from 'lucide-react'
import { formatCLP } from '@/lib/utils'

interface TransferButtonProps {
  distributionId: string
  netAmount: number
  buildingName: string
}

export default function TransferButton({ distributionId, netAmount, buildingName }: TransferButtonProps) {
  const [state, setstate]  = useState<'idle' | 'confirm' | 'loading' | 'done'>('idle')
  const [ref, setRef]      = useState('')
  const [notes, setNotes]  = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleTransfer() {
    setstate('loading')

    const { error } = await supabase
      .from('distributions')
      .update({
        status:         'transferred',
        transferred_at: new Date().toISOString(),
        transfer_ref:   ref || null,
        transfer_notes: notes || null,
        updated_at:     new Date().toISOString(),
      })
      .eq('id', distributionId)

    if (!error) {
      setstate('done')
      setTimeout(() => router.refresh(), 600)
    } else {
      setstate('confirm')
    }
  }

  if (state === 'done') {
    return (
      <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
        <CheckCircle2 size={12} /> Marcado
      </span>
    )
  }

  if (state === 'confirm') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        onClick={e => { if (e.target === e.currentTarget) setstate('idle') }}>
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4 animate-fade-in">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Confirmar transferencia</h3>
              <p className="text-xs text-gray-500 mt-0.5">{buildingName}</p>
            </div>
            <button onClick={() => setstate('idle')} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <p className="text-xs text-emerald-700">Monto a transferir</p>
            <p className="text-lg font-bold text-emerald-800">{formatCLP(netAmount)}</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Nº de transferencia / referencia
              </label>
              <input
                value={ref}
                onChange={e => setRef(e.target.value)}
                placeholder="Ej: 00012345678"
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Notas (opcional)
              </label>
              <input
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Ej: Banco Estado, cuenta corriente"
                className="input-field text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setstate('idle')}
              className="btn-ghost flex-1 text-xs">
              Cancelar
            </button>
            <button
              onClick={handleTransfer}
              disabled={state === 'loading'}
              className="btn-primary flex-1 text-xs flex items-center justify-center gap-1.5">
              {state === 'loading'
                ? <><Loader2 size={13} className="animate-spin" /> Guardando...</>
                : <><Send size={13} /> Marcar transferido</>
              }
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setstate('confirm')}
      className="flex items-center gap-1.5 text-[11px] font-medium text-white bg-[#0F6E56] hover:bg-[#085041] px-2.5 py-1.5 rounded-lg transition-all hover:scale-105 active:scale-95"
    >
      <Send size={11} /> Transferir
    </button>
  )
}
