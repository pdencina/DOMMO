// @ts-nocheck
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'

export default function MarkAsPaidButton({ paymentId }: { paymentId: string }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleMark() {
    setLoading(true)
    const { error } = await supabase
      .from('payments')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        payment_method: 'manual',
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId)

    if (!error) {
      setDone(true)
      router.refresh()
    }
    setLoading(false)
  }

  if (done) {
    return (
      <span className="flex items-center gap-1 text-[10px] text-emerald-600">
        <CheckCircle size={12} /> Marcado
      </span>
    )
  }

  return (
    <button
      onClick={handleMark}
      disabled={loading}
      className="flex items-center gap-1 text-[10px] text-[#185FA5] border border-[#185FA5] px-2 py-1 rounded-lg hover:bg-[#E6F1FB] transition disabled:opacity-50"
    >
      {loading ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle size={11} />}
      {loading ? 'Guardando...' : 'Marcar pagado'}
    </button>
  )
}
