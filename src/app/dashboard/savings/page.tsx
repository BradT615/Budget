import { createClient } from '@/utils/supabase/server'
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import SavingsGoalsList from "./components/savings-goals-list";
import AddSavingsGoalDialog from "./components/add-savings-goal-dialog";

export default async function SavingsPage() {
  const supabase = await createClient()
  
  // Get the authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Savings Goals</h1>
          <AddSavingsGoalDialog>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Savings Goal
            </Button>
          </AddSavingsGoalDialog>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Your Savings Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <SavingsGoalsList userId={user?.id} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}