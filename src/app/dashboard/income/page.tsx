// src/app/dashboard/income/page.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import IncomeList from "./components/income-list";
import AddIncomeDialog from "./components/add-income-dialog";
import { getIncomes } from "./actions/income";

// Define searchParams as a Promise directly
type SearchParams = Promise<{ [key: string]: string | string[] | undefined } | undefined>;

export default async function IncomePage(props: { searchParams: SearchParams }) {
  // Get income data
  const { data: incomes, error } = await getIncomes();
  
  // Await the searchParams Promise
  const searchParams = await props.searchParams;
  
  // Check if an income ID is present in the URL for editing
  const editId = searchParams && typeof searchParams.edit === 'string' 
    ? searchParams.edit 
    : undefined;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pt-6 px-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Income</h1>
        <AddIncomeDialog>
          <Button className='text-sm sm:text-md'>
            <PlusCircle className="mr-1 sm:mr-2 text-md sm:text-lg h-3 w-3 sm:h-4 sm:w-4" />
            Add Income
          </Button>
        </AddIncomeDialog>
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md">
          Error loading income data: {error.message}
        </div>
      )}
      
      <Card className='m-3 sm:m-6'>
        <CardContent className='pt-4'>
          <IncomeList incomes={incomes || []} editId={editId} />
        </CardContent>
      </Card>
    </div>
  );
}