// @ts-nocheck

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { webpayTransaction } from '@/lib/transbank'

export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin

  try {
    const adminSupabase = await createAdminClient()
    const token = req.nextUrl.searchParams.get('token_ws')
    const returnPath = req.nextUrl.searchParams.get('returnPath') || '/pagar'

    if (!token) {
      return NextResponse.redirect(
        `${baseUrl}${returnPath}?status=error&message=token_no_recibido`
      )
    }

    const result = await webpayTransaction.commit(token)

    const buyOrder = result.buy_order
    const status = result.status
    const responseCode = result.response_code

    const isApproved = status === 'AUTHORIZED' && responseCode === 0

    const { data: payment } = await adminSupabase
      .from('payments')
      .select('id, notes')
      .eq('notes', `webpay:${buyOrder}`)
      .maybeSingle()

    if (!payment) {
      return NextResponse.redirect(
        `${baseUrl}${returnPath}?status=error&message=pago_no_encontrado`
      )
    }

    if (!isApproved) {
      await adminSupabase
        .from('payments')
        .update({
          status: 'rejected',
          notes: `webpay:${buyOrder} | rejected:${status}`,
        })
        .eq('id', payment.id)

      return NextResponse.redirect(
        `${baseUrl}${returnPath}?status=rejected&paymentId=${payment.id}`
      )
    }

    await adminSupabase
      .from('payments')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        notes: `webpay:${buyOrder} | approved`,
      })
      .eq('id', payment.id)

    return NextResponse.redirect(
      `${baseUrl}${returnPath}?status=success&paymentId=${payment.id}`
    )
  } catch (err: any) {
    console.error('[Transbank confirm-public]', err)

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin

    return NextResponse.redirect(
      `${baseUrl}/pagar?status=error&message=${encodeURIComponent(
        err.message || 'error_confirmando_pago'
      )}`
    )
  }
}