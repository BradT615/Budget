// src/app/dashboard/admin/page.tsx
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import EmailWhitelistManager from "./components/email-whitelist-manager";
import AdminUsersManager from "./components/admin-users-manager";

// Define searchParams as a Promise directly
type SearchParams = Promise<{ [key: string]: string | string[] | undefined } | undefined>;

// Since we're not using searchParams in this component, we can use underscore prefix
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default async function AdminPage(_props: { searchParams?: SearchParams }) {
  const supabase = await createClient()
  
  // Get the authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Check if the user is an admin using the is_admin function
  const { data: isAdmin, error } = await supabase.rpc('is_admin', {
    user_id: user.id
  })
  
  if (error) {
    console.error('Error checking admin status:', error)
  }
  
  // Redirect non-admin users to dashboard
  if (!isAdmin) {
    redirect('/dashboard')
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pt-6 px-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
      </div>
      
      {/* The components handle data fetching internally */}
      <EmailWhitelistManager />
      <AdminUsersManager />
    </div>
  );
}