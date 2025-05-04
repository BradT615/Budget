// src/app/dashboard/transactions/page.tsx
import { Card, CardContent } from "@/components/ui/card";
import TransactionsList from "./components/transactions-list";
import { getTransactions } from "./actions/transactions";

export default async function TransactionsPage() {
  // Get transactions data
  const { data: transactions, error } = await getTransactions();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pt-6 px-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Transactions</h1>
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md m-3 sm:m-6">
          Error loading transactions: {error.message}
        </div>
      )}
      
      <Card className='m-3 sm:m-6'>
        <CardContent className='py-6'>
          <TransactionsList transactions={transactions || []} />
        </CardContent>
      </Card>
    </div>
  );
}