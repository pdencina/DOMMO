// @ts-nocheck
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const adminSupabase = await createAdminClient()
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('*, buildings(*)')
    .eq('email', user.email.trim().toLowerCase())
    .maybeSingle()

  // Roles que NO usan sidebar (tienen su propio portal)
  const noSidebarRoles = ['resident', 'concierge']
  if (profile && noSidebarRoles.includes(profile.role)) {
    return (
      <div className="min-h-screen bg-[#F8F7F4]">
        {children}
      </div>
    )
  }

  // Roles con sidebar: superadmin, admin, committee
  return (
    <div className="flex h-screen bg-[#F8F7F4] overflow-hidden">
      <Sidebar profile={profile} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
