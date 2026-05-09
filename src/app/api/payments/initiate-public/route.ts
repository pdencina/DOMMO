// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { webpayTransaction } from '@/lib/transbank'

export async function POST(req: NextRequest) {
  try {
    const adminSupabase = await createAdminClient()
    const body          = await req.json()
    const paymentId     = body.paymentId as string
    const returnPath    = body.returnPath ?? '/pagar'

    if (!paymentId) return NextResponse.json({ error: 'paymentId requerido' }, { status: 400 })

    const { data: payment } = await adminSupabase
      .from('payments')
      .select('*, units(number, payment_code, building_id), fee_periods(period_month)')
      .eq('id', paymentId)
      .single()

    if (!payment)                  return NextResponse.json({ error: 'Pago no encontrado'  }, { status: 404 })
    if (payment.status === 'paid') return NextResponse.json({ error: 'Pago ya realizado'   }, { status: 400 })

    const buyOrder  = `DOMMO-${paymentId.slice(0, 8).toUpperCase()}-${Date.now()}`
    const sessionId = `PUB-${paymentId.slice(0, 8).toUpperCase()}`
    const amount    = Math.round(payment.amount)
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/confirm-public?returnPath=${encodeURIComponent(returnPath)}`

    // Guardar buyOrder para cruce posterior
    await adminSupabase
      .from('payments')
      .update({ notes: `webpay:${buyOrder}` })
      .eq('id', paymentId)

    const tbk = await webpayTransaction.create(buyOrder, sessionId, amount, returnUrl)

    return NextResponse.json({ url: tbk.url, token: tbk.token })

  } catch (err: any) {
    console.error('[Transbank initiate-public]', err)
    return NextResponse.json({ error: err.message ?? 'Error al iniciar pago' }, { status: 500 })
  }
}
