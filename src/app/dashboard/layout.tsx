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

  // Sin sidebar: portales propios
  const noSidebar = ['resident', 'concierge']
  if (profile && noSidebar.includes(profile.role)) {
    return <div className="min-h-screen dashboard-bg">{children}</div>
  }

  return (
    <div className="flex h-screen dashboard-bg overflow-hidden">
      <Sidebar profile={profile} />
      <main className="flex-1 overflow-y-auto animate-fade-in">
        {children}
      </main>
    </div>
  )
}
