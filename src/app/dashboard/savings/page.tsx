// src/app/dashboard/savings/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import SavingsGoalsList from "./components/savings-goals-list";
import AddSavingsGoalDialog from "./components/add-savings-goal-dialog";
import { getSavingsGoals } from "./actions/savings-goals";

// Define searchParams as a Promise directly
type SearchParams = Promise<{ [key: string]: string | string[] | undefined } | undefined>;

// Since we're not using searchParams in this component, we can use underscore prefix
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default async function SavingsPage(_props: { searchParams?: SearchParams }) {
  // Get savings goals data
  const { data: goals, error } = await getSavingsGoals();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pt-6 px-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Savings Goals</h1>
        <AddSavingsGoalDialog>
          <Button className='text-sm sm:text-md'>
            <PlusCircle className="mr-1 sm:mr-2 text-md sm:text-lg h-3 w-3 sm:h-4 sm:w-4" />
            Add Savings Goal
          </Button>
        </AddSavingsGoalDialog>
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md m-3 sm:m-6">
          Error loading savings goals: {error.message}
        </div>
      )}
      
      <Card className='m-3 sm:m-6'>
        <CardHeader>
          <CardTitle>Your Savings Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <SavingsGoalsList goals={goals || []} />
        </CardContent>
      </Card>
    </div>
  );
}