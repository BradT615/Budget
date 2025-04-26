import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { LoginButton } from "./components/login-button";

export default async function LoginPage() {
  const supabase = await createClient()
  
  // Check if user is already logged in
  const { data: { user } } = await supabase.auth.getUser()
  
  // If user is logged in, redirect to dashboard
  if (user) {
    redirect('/dashboard')
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* App Logo */}
        <div className="flex justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-primary"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
              fill="currentColor"
            />
            <path
              d="M15 6H9C8.45 6 8 6.45 8 7V17C8 17.55 8.45 18 9 18H15C15.55 18 16 17.55 16 17V7C16 6.45 15.55 6 15 6ZM14 16H10V12H14V16ZM14 10H10V8H14V10Z"
              fill="currentColor"
            />
          </svg>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Budget Tracker</h1>
          <p className="text-muted-foreground">
            Sign in to manage your personal finances
          </p>
        </div>
        
        <div className="p-8 space-y-6">
          <LoginButton />
          
          <div className="text-sm text-muted-foreground mt-4">
            Securely sign in to access your dashboard
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Budget Tracker
        </div>
      </div>
    </div>
  );
}