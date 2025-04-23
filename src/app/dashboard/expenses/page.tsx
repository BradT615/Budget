import { createClient } from '@/utils/supabase/server'
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import ExpenseList from "./components/expense-list";
import AddExpenseDialog from "./components/add-expense-dialog";

export default async function ExpensesPage() {
  const supabase = await createClient()
  
  // Get the authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Expenses</h1>
          <AddExpenseDialog>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </AddExpenseDialog>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Expense Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseList userId={user?.id} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}