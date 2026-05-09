// @ts-nocheck
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Loader2 } from 'lucide-react'

export default function MarkAsPaidButton({ paymentId }: { paymentId: string }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
  const router  = useRouter()
  const supabase = createClient()

  async function handleMark() {
    if (done) return
    setLoading(true)

    const { error } = await supabase
      .from('payments')
      .update({ status: 'paid', paid_at: new Date().toISOString(), payment_method: 'manual' })
      .eq('id', paymentId)

    if (!error) {
      setDone(true)
      setTimeout(() => router.refresh(), 600)
    }
    setLoading(false)
  }

  if (done) {
    return (
      <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
        <CheckCircle2 size={12} /> Pagado
      </span>
    )
  }

  return (
    <button
      onClick={handleMark}
      disabled={loading}
      className="flex items-center gap-1.5 text-[11px] font-medium text-[#185FA5] border border-[#185FA5]/30 bg-[#E6F1FB] px-2.5 py-1 rounded-full hover:bg-[#185FA5] hover:text-white transition-all disabled:opacity-50"
    >
      {loading
        ? <><Loader2 size={11} className="animate-spin" /> Guardando...</>
        : <><CheckCircle2 size={11} /> Marcar pagado</>
      }
    </button>
  )
}
