// src/app/dashboard/expenses/page.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import ExpenseList from "./components/expense-list";
import AddExpenseDialog from "./components/add-expense-dialog";
import { getExpenses } from "./actions/expenses";

export default async function ExpensesPage() {
  // Get expenses data
  const { data: expenses, error } = await getExpenses();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pt-6 px-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Expenses</h1>
        <AddExpenseDialog>
          <Button className='text-sm sm:text-md'>
            <PlusCircle className="mr-1 sm:mr-2 text-md sm:text-lg h-3 w-3 sm:h-4 sm:w-4" />
            Add Expense
          </Button>
        </AddExpenseDialog>
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md">
          Error loading expenses: {error.message}
        </div>
      )}
      
      <Card className='m-3 sm:m-6'>
        <CardContent className='pt-4'>
          <ExpenseList expenses={expenses || []} />
        </CardContent>
      </Card>
    </div>
  );
}