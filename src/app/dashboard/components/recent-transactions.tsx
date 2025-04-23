"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { DollarSign, CreditCard } from "lucide-react";

type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
};

export default function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      
      // Get the authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      
      // In a real app, you would fetch data from Supabase
      // For example:
      // const { data: incomeData } = await supabase
      //   .from('income')
      //   .select('id, amount, source, date')
      //   .eq('user_id', user?.id)
      //   .order('date', { ascending: false })
      //   .limit(5);
      
      // For demo purposes, we'll use dummy data
      const demoTransactions: Transaction[] = [
        {
          id: '1',
          type: 'income',
          amount: 1500,
          description: 'Salary',
          date: '2025-04-15'
        },
        {
          id: '2',
          type: 'expense',
          amount: 120,
          description: 'Groceries',
          date: '2025-04-16'
        },
        {
          id: '3',
          type: 'expense',
          amount: 45,
          description: 'Dinner',
          date: '2025-04-17'
        },
        {
          id: '4',
          type: 'income',
          amount: 200,
          description: 'Freelance work',
          date: '2025-04-18'
        },
        {
          id: '5',
          type: 'expense',
          amount: 35,
          description: 'Transportation',
          date: '2025-04-19'
        }
      ];
      
      setTransactions(demoTransactions);
      setLoading(false);
    };

    fetchTransactions();
  }, [supabase]);

  if (loading) {
    return <div>Loading transactions...</div>;
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between rounded-lg border p-4"
        >
          <div className="flex items-center space-x-4">
            <div className={`rounded-full p-2 ${
              transaction.type === 'income' 
                ? 'bg-green-100 text-green-600' 
                : 'bg-red-100 text-red-600'
            }`}>
              {transaction.type === 'income' ? (
                <DollarSign className="h-5 w-5" />
              ) : (
                <CreditCard className="h-5 w-5" />
              )}
            </div>
            <div>
              <p className="font-medium">{transaction.description}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(transaction.date).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className={`font-medium ${
            transaction.type === 'income' 
              ? 'text-green-600' 
              : 'text-red-600'
          }`}>
            {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
}