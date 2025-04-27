// src/app/auth/auth-code-error/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg border shadow-sm">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold tracking-tight">Authentication Error</h1>
          
          <p className="text-muted-foreground">
            There was a problem authenticating your account. This could be due to:
          </p>
          
          <ul className="text-sm text-left text-muted-foreground space-y-2">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>An expired or invalid authentication code</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Your email is not on the authorized whitelist</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>A server-side authentication issue</span>
            </li>
          </ul>
        </div>
        
        <div className="flex flex-col space-y-3">
          <Link href="/login" className="w-full">
            <Button className="w-full">
              Return to Login
            </Button>
          </Link>
          
          <p className="text-xs text-center text-muted-foreground">
            If this issue persists, please contact the system administrator
            for assistance.
          </p>
        </div>
      </div>
    </div>
  );
}