import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  switch (profile.role) {
    case 'superadmin':
      redirect('/dashboard/superadmin')

    case 'admin':
      redirect('/dashboard/admin')

    case 'committee':
      redirect('/dashboard/committee')

    case 'resident':
      redirect('/dashboard/resident')

    case 'concierge':
      redirect('/dashboard/concierge')

    default:
      redirect('/login')
  }
}