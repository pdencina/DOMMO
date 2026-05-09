// @ts-nocheck
export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/server'
import PagarClient from './PagarClient'

export const metadata = {
  title: 'Pago rápido | DOMMO',
  description: 'Paga tu gasto común sin necesidad de registrarte',
}

export default async function PagarPage({
  searchParams
}: {
  searchParams: Promise<{ code?: string; payment?: string; amount?: string }>
}) {
  const params = await searchParams
  const code   = params.code?.toUpperCase().trim() ?? ''

  let unitData  = null
  let errorMsg  = ''

  if (code) {
    const adminSupabase = await createAdminClient()

    // Buscar unidad por código
    const { data: unit } = await adminSupabase
      .from('units')
      .select(`
        id, number, floor, payment_code,
        building_id,
        buildings(id, name, slug, city),
        profiles!units_owner_id_fkey(full_name)
      `)
      .eq('payment_code', code)
      .maybeSingle()

    if (!unit) {
      errorMsg = `No encontramos el código "${code}". Verifica e intenta de nuevo.`
    } else {
      // Buscar período vigente y deuda
      const thisMonth = new Date()
      thisMonth.setDate(1)
      const monthStr = thisMonth.toISOString().split('T')[0]

      const { data: currentPeriod } = await adminSupabase
        .from('fee_periods')
        .select('*')
        .eq('building_id', unit.building_id)
        .eq('period_month', monthStr)
        .single()

      const { data: payments } = await adminSupabase
        .from('payments')
        .select('*, fee_periods(period_month, due_date)')
        .eq('unit_id', unit.id)
        .in('status', ['pending', 'overdue'])
        .order('created_at', { ascending: true })

      const totalDebt = (payments ?? []).reduce((s, p) => s + p.amount, 0)

      unitData = {
        id:           unit.id,
        number:       unit.number,
        floor:        unit.floor,
        payment_code: unit.payment_code,
        building:     unit.buildings,
        owner:        Array.isArray(unit.profiles) ? unit.profiles[0] : unit.profiles,
        payments:     payments ?? [],
        totalDebt,
        currentPeriod,
      }
    }
  }

  return (
    <PagarClient
      initialCode={code}
      unitData={unitData}
      errorMsg={errorMsg}
      paymentResult={params.payment}
      paidAmount={params.amount ? Number(params.amount) : 0}
    />
  )
}
