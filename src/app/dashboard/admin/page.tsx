// src/app/dashboard/admin/page.tsx
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from "@/components/layout/dashboard-layout";
import EmailWhitelistManager from "./components/email-whitelist-manager";
import AdminUsersManager from "./components/admin-users-manager";

export default async function AdminPage() {
  const supabase = await createClient()
  
  // Get the authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Check if the user is an admin using the is_admin function
  const { data, error } = await supabase.rpc('is_admin', {
    user_id: user.id
  })
  
  const isAdmin = !!data
  
  if (!isAdmin) {
    // Redirect non-admin users to dashboard
    redirect('/dashboard')
  }
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
        </div>
        
        <EmailWhitelistManager />
        
        <AdminUsersManager currentAdmin={user.id} />
      </div>
    </DashboardLayout>
  );
}