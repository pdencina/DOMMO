// @ts-nocheck
import Link from 'next/link'
import { randomUUID } from 'crypto'
import { redirect } from 'next/navigation'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import OnboardingClient from './OnboardingClient'

export const dynamic = 'force-dynamic'

export default async function OnboardingPage({ searchParams }) {
  const params = await searchParams
  const errorMessage = params?.error ? decodeURIComponent(params.error) : ''
  const successSlug  = params?.success ?? ''

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const adminSupabase = await createAdminClient()
  const { data: profile } = await adminSupabase
    .from('profiles').select('role, full_name').eq('email', user.email).maybeSingle()

  if (!profile || profile.role !== 'superadmin') redirect('/dashboard')

  // Server action — crea edificio + admin
  async function createCommunity(formData: FormData) {
    'use server'
    const adminSupabase = await createAdminClient()
    const buildingId    = randomUUID()

    const name     = String(formData.get('name') || '').trim()
    const slug     = String(formData.get('slug') || '').trim().toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')
    const address  = String(formData.get('address') || '').trim()
    const city     = String(formData.get('city') || 'Santiago').trim()
    const units    = Number(formData.get('total_units') || 0)
    const plan     = String(formData.get('plan') || 'pro')
    const adminName  = String(formData.get('admin_name') || '').trim()
    const adminEmail = String(formData.get('admin_email') || '').trim().toLowerCase()
    const adminPhone = String(formData.get('admin_phone') || '').trim()
    const adminPass  = String(formData.get('admin_password') || '').trim()

    if (!name || !slug || !adminName || !adminEmail || !adminPass) {
      redirect('/dashboard/superadmin/onboarding?error=Completa todos los campos obligatorios')
    }

    // 1. Edificio
    const { error: buildingErr } = await adminSupabase.from('buildings').insert({
      id: buildingId, name, slug, address, city,
      total_units: units, plan, status: 'active',
    })
    if (buildingErr) {
      redirect(`/dashboard/superadmin/onboarding?error=${encodeURIComponent('Error al crear edificio: ' + buildingErr.message)}`)
    }

    // 2. Usuario admin en Auth
    const { data: authUser, error: authErr } = await adminSupabase.auth.admin.createUser({
      email: adminEmail, password: adminPass, email_confirm: true,
      user_metadata: { full_name: adminName, role: 'admin', building_id: buildingId },
    })
    if (authErr || !authUser?.user) {
      await adminSupabase.from('buildings').delete().eq('id', buildingId)
      redirect(`/dashboard/superadmin/onboarding?error=${encodeURIComponent('Error al crear usuario: ' + (authErr?.message || 'desconocido'))}`)
    }

    // 3. Profile
    const { error: profileErr } = await adminSupabase.from('profiles').insert({
      id: authUser.user.id, building_id: buildingId,
      full_name: adminName, email: adminEmail, phone: adminPhone, role: 'admin',
    })
    if (profileErr) {
      await adminSupabase.auth.admin.deleteUser(authUser.user.id)
      await adminSupabase.from('buildings').delete().eq('id', buildingId)
      redirect(`/dashboard/superadmin/onboarding?error=${encodeURIComponent('Error al crear perfil: ' + profileErr.message)}`)
    }

    redirect(`/dashboard/superadmin/onboarding?success=${slug}`)
  }

  return (
    <OnboardingClient
      onCreateCommunity={createCommunity}
      errorMessage={errorMessage}
      successSlug={successSlug}
      adminName={profile.full_name ?? 'Admin'}
    />
  )
}
