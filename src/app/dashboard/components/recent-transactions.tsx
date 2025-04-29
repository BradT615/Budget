"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { getIncomes } from "../income/actions/income";
import { getExpenses } from "../expenses/actions/expenses";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type TransactionType = 'income' | 'expense';

type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
};

export default function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      
      try {
        // Get the authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }
        
        // In a production app, we would use server actions, but for this demo
        // we'll call them directly from the client component for simplicity
        const { data: incomeData } = await getIncomes();
        const { data: expenseData } = await getExpenses();
        
        // Transform income entries
        const incomeTransactions: Transaction[] = (incomeData || []).map(income => ({
          id: income.id,
          type: 'income',
          amount: income.amount,
          description: income.source,
          date: income.date
        }));
        
        // Transform expense entries
        const expenseTransactions: Transaction[] = (expenseData || []).map(expense => ({
          id: expense.id,
          type: 'expense',
          amount: expense.amount,
          description: expense.description,
          date: expense.date
        }));
        
        // Combine and sort by date (newest first)
        const allTransactions = [...incomeTransactions, ...expenseTransactions]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 6); // Show only the 6 most recent transactions
        
        setTransactions(allTransactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [supabase]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div 
            key={i} 
            className="animate-pulse flex items-center justify-between rounded-lg border p-4"
          >
            <div className="flex items-center space-x-4">
              <div className="rounded-full h-10 w-10 bg-muted"></div>
              <div className="space-y-2">
                <div className="h-4 w-24 bg-muted rounded"></div>
                <div className="h-3 w-16 bg-muted rounded"></div>
              </div>
            </div>
            <div className="h-4 w-16 bg-muted rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if it's today
    if (date.toDateString() === now.toDateString()) {
      return 'Today';
    }
    
    // Check if it's yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // Otherwise return formatted date
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    });
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="mb-4">No recent transactions found.</p>
        <div className="flex gap-3 justify-center">
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard/income')}
          >
            Add Income
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard/expenses')}
          >
            Add Expense
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
        >
          <div className="flex items-center space-x-4">
            <div className={`rounded-full p-2 ${
              transaction.type === 'income' 
                ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' 
                : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
            }`}>
              {transaction.type === 'income' ? (
                <ArrowUpRight className="h-5 w-5" />
              ) : (
                <ArrowDownRight className="h-5 w-5" />
              )}
            </div>
            <div>
              <p className="font-medium">{transaction.description}</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(transaction.date)}
              </p>
            </div>
          </div>
          <div className={`font-medium ${
            transaction.type === 'income' 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {transaction.type === 'income' ? '+' : '-'}
            {formatCurrency(Math.abs(transaction.amount))}
          </div>
        </div>
      ))}
      
      <div className="flex justify-center pt-4">
        <Button
          variant="outline"
          onClick={() => {
            if (transactions[0]?.type === 'income') {
              router.push('/dashboard/income');
            } else {
              router.push('/dashboard/expenses');
            }
          }}
        >
          View All Transactions
        </Button>
      </div>
    </div>
  );
}