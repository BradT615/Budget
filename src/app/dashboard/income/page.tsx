import { createClient } from '@/utils/supabase/server'
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import IncomeList from "./components/income-list";
import AddIncomeDialog from "./components/add-income-dialog";

export default async function IncomePage() {
  const supabase = await createClient()
  
  // Get the authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between pt-6 px-6">
          <h1 className="text-3xl font-bold">Income</h1>
          <AddIncomeDialog>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Income
            </Button>
          </AddIncomeDialog>
        </div>
        
        <Card className='m-3 sm:m-6'>
          <CardHeader>
            <CardTitle>Income Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <IncomeList userId={user?.id} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}