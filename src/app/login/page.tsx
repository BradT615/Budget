import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { LoginButton } from "./components/login-button";
import Image from "next/image"; // Import Next.js Image component

export default async function LoginPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    redirect('/dashboard')
  }
  
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-background">
      {/* Logo - replaced img with Next Image component */}
      <div className="mb-8 flex flex-col items-center">
        <Image
          src="/icon.svg"
          alt="Logo"
          width={96}
          height={96}
          className="text-primary"
        />
      </div>


      {/* App Title and Description */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Budget Tracker</h1>
        <p className="text-muted-foreground text-base">
          Secure budget tracking for authorized users
        </p>
      </div>

      {/* Login Content */}
      <div className="flex flex-col items-center space-y-6 w-full max-w-sm">
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md text-sm text-center">
          Private application — whitelisted users only.
        </div>
        <LoginButton />
      </div>

      {/* Creator Credit */}
      <div className="mt-12 text-center text-md text-muted-foreground">
        Created by <a href="https://www.linkedin.com/in/bradt615/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Brad</a>
      </div>
    </div>
  );
}