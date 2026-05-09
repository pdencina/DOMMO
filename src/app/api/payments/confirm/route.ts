// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { webpayTransaction } from '@/lib/transbank'

export async function POST(req: NextRequest) {
  const adminSupabase = await createAdminClient()
  let token: string | null = null

  try {
    const formData = await req.formData()
    token = formData.get('token_ws') as string
    if (!token) throw new Error('Token Transbank no recibido')

    // Confirmar con Transbank
    const result = await webpayTransaction.commit(token)
    const approved = result.response_code === 0

    // Buscar el pago por buyOrder guardado en notes
    const buyOrderPrefix = result.buy_order.split('-').slice(0,2).join('-')
    const { data: payment } = await adminSupabase
      .from('payments')
      .select('*, units(number, building_id)')
      .like('notes', `webpay:${buyOrderPrefix}%`)
      .single()

    if (!payment) throw new Error('Pago no encontrado en BD: ' + result.buy_order)

    if (approved) {
      // ── 1. Actualizar pago ────────────────────────────────
      await adminSupabase
        .from('payments')
        .update({
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
            installments:       result.installments_number ?? 1,
          }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.id)

      // ── 2. Crear distribución (comisión DOMMO) ────────────
      await adminSupabase.rpc('create_distribution', {
        p_payment_id:       payment.id,
        p_tbk_buy_order:    result.buy_order,
        p_tbk_auth_code:    result.authorization_code,
        p_tbk_card_digits:  result.card_detail?.card_number ?? '****',
        p_tbk_payment_type: result.payment_type_code ?? 'VN',
      })

      // ── 3. Alerta para el admin del edificio ─────────────
      await adminSupabase.from('alerts').insert({
        building_id: payment.units?.building_id ?? payment.building_id,
        unit_id:     payment.unit_id,
        payment_id:  payment.id,
        type:        'payment_received',
        title:       `Pago recibido — Depto ${payment.units?.number}`,
        message:     `Gasto común pagado online $${result.amount.toLocaleString('es-CL')} vía WebPay. Auth: ${result.authorization_code}`,
      })

      // ── 4. Redirigir al residente ─────────────────────────
      const url = new URL('/dashboard/resident', process.env.NEXT_PUBLIC_APP_URL!)
      url.searchParams.set('payment', 'success')
      url.searchParams.set('amount', String(result.amount))
      return NextResponse.redirect(url)

    } else {
      // Pago rechazado — limpiar notes
      await adminSupabase
        .from('payments')
        .update({ notes: null })
        .eq('id', payment.id)

      const url = new URL('/dashboard/resident', process.env.NEXT_PUBLIC_APP_URL!)
      url.searchParams.set('payment', 'rejected')
      url.searchParams.set('code', String(result.response_code))
      return NextResponse.redirect(url)
    }

  } catch (err: any) {
    console.error('[Transbank confirm]', err)
    const url = new URL('/dashboard/resident', process.env.NEXT_PUBLIC_APP_URL!)
    url.searchParams.set('payment', 'error')
    return NextResponse.redirect(url)
  }
}

// Usuario cancela en Transbank → viene por GET sin token
export async function GET() {
  const url = new URL('/dashboard/resident', process.env.NEXT_PUBLIC_APP_URL!)
  url.searchParams.set('payment', 'cancelled')
  return NextResponse.redirect(url)
}
