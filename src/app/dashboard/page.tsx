import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type UserRole =
  | 'superadmin'
  | 'admin'
  | 'committee'
  | 'resident'
  | 'concierge'

type ProfileRole = {
  role: UserRole
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle<ProfileRole>()

  if (error || !profile) {
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