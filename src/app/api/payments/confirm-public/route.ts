// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { webpayTransaction } from '@/lib/transbank'

export async function POST(req: NextRequest) {
  const adminSupabase = await createAdminClient()
  const returnPath    = req.nextUrl.searchParams.get('returnPath') ?? '/pagar'

  try {
    const formData = await req.formData()
    const token    = formData.get('token_ws') as string
    if (!token) throw new Error('Token no recibido')

    const result   = await webpayTransaction.commit(token)
    const approved = result.response_code === 0

    const buyOrderPrefix = result.buy_order.split('-').slice(0, 2).join('-')
    const { data: payment } = await adminSupabase
      .from('payments')
      .select('*, units(number, building_id, payment_code)')
      .like('notes', `webpay:${buyOrderPrefix}%`)
      .single()

    if (!payment) throw new Error('Pago no encontrado: ' + result.buy_order)

    const unit = payment.units
    const code = unit?.payment_code ?? ''

    if (approved) {
      // Actualizar pago
      await adminSupabase.from('payments').update({
        status:         'paid',
        paid_at:        new Date(result.transaction_date).toISOString(),
        payment_method: 'webpay',
        notes: JSON.stringify({
          webpay_order:       result.buy_order,
          authorization_code: result.authorization_code,
          card_last_digits:   result.card_detail?.card_number ?? '****',
          amount_paid:        result.amount,
          transaction_date:   result.transaction_date,
          payment_type:       result.payment_type_code,
          public_payment:     true,
        }),
        updated_at: new Date().toISOString(),
      }).eq('id', payment.id)

      // Crear distribución
      await adminSupabase.rpc('create_distribution', {
        p_payment_id:       payment.id,
        p_tbk_buy_order:    result.buy_order,
        p_tbk_auth_code:    result.authorization_code,
        p_tbk_card_digits:  result.card_detail?.card_number ?? '****',
        p_tbk_payment_type: result.payment_type_code ?? 'VN',
      })

      // Alerta para admin
      await adminSupabase.from('alerts').insert({
        building_id: unit?.building_id ?? payment.building_id,
        unit_id:     payment.unit_id,
        payment_id:  payment.id,
        type:        'payment_received',
        title:       `Pago recibido — Depto ${unit?.number} (Pago rápido)`,
        message:     `Gasto común pagado online $${result.amount.toLocaleString('es-CL')} vía WebPay (pago público). Auth: ${result.authorization_code}`,
      })

      const url = new URL(`${process.env.NEXT_PUBLIC_APP_URL}${returnPath}`)
      url.searchParams.set('code',    code)
      url.searchParams.set('payment', 'success')
      url.searchParams.set('amount',  String(result.amount))
      return NextResponse.redirect(url)

    } else {
      await adminSupabase.from('payments').update({ notes: null }).eq('id', payment.id)

      const url = new URL(`${process.env.NEXT_PUBLIC_APP_URL}${returnPath}`)
      url.searchParams.set('code',    code)
      url.searchParams.set('payment', 'rejected')
      return NextResponse.redirect(url)
    }

  } catch (err: any) {
    console.error('[confirm-public]', err)
    const url = new URL(`${process.env.NEXT_PUBLIC_APP_URL}${returnPath}`)
    url.searchParams.set('payment', 'error')
    return NextResponse.redirect(url)
  }
}

export async function GET(req: NextRequest) {
  const returnPath = req.nextUrl.searchParams.get('returnPath') ?? '/pagar'
  const url        = new URL(`${process.env.NEXT_PUBLIC_APP_URL}${returnPath}`)
  url.searchParams.set('payment', 'cancelled')
  return NextResponse.redirect(url)
}
