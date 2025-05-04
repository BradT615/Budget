// src/app/dashboard/settings/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import UpdateProfileForm from "./components/update-profile-form";
import DeleteAccountSection from "./components/delete-account-section";

export default async function SettingsPage() {
  const supabase = await createClient();
  
  // Get the authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pt-6 px-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
      </div>
      
      <div className="flex justify-center px-3 sm:px-6">
        <div className="w-full max-w-2xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Manage your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UpdateProfileForm user={user} />
            </CardContent>
          </Card>
          
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Actions that cannot be undone
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DeleteAccountSection />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}