import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { LoginButton } from "./components/login-button";

export default async function LoginPage() {
  const supabase = await createClient()
  
  // Check if user is already logged in
  const { data: { user } } = await supabase.auth.getUser()
  
  // If user is logged in, redirect to dashboard
  // This is also handled by middleware, but adding here for extra protection
  if (user) {
    redirect('/dashboard')
  }
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Budget Tracker</h1>
          <p className="mt-2 text-gray-600">Sign in to manage your finances</p>
        </div>
        
        <div className="mt-8">
          <LoginButton />
        </div>
      </div>
    </div>
  );
}