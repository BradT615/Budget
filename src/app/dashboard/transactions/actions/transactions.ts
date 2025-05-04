// src/app/dashboard/transactions/actions/transactions.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { Income } from '../../income/actions/income'
import { Expense } from '../../expenses/actions/expenses'

export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  created_at: string;
};

/**
 * Fetch all transactions (incomes and expenses) for a user
 */
export async function getTransactions(): Promise<{
  data: Transaction[] | null;
  error: Error | null;
}> {
  try {
    const supabase = await createClient();
    
    // Verify the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('Unauthorized') };
    }
    
    // Fetch income data (Row Level Security will ensure we only get this user's data)
    const { data: incomeData, error: incomeError } = await supabase
      .from("income")
      .select("*")
      .eq("user_id", user.id);
      
    if (incomeError) {
      throw incomeError;
    }
    
    // Fetch expense data (Row Level Security will ensure we only get this user's data)
    const { data: expenseData, error: expenseError } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id);
      
    if (expenseError) {
      throw expenseError;
    }
    
    // Transform income entries
    const incomeTransactions: Transaction[] = (incomeData || []).map((income: Income) => ({
      id: income.id,
      type: 'income',
      amount: income.amount,
      description: income.source,
      date: income.date,
      created_at: income.created_at
    }));
    
    // Transform expense entries
    const expenseTransactions: Transaction[] = (expenseData || []).map((expense: Expense) => ({
      id: expense.id,
      type: 'expense',
      amount: expense.amount,
      description: expense.description,
      date: expense.date,
      created_at: expense.created_at
    }));
    
    // Combine and sort by date (newest first)
    const allTransactions = [...incomeTransactions, ...expenseTransactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return { data: allTransactions, error: null };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}