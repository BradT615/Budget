"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

type Expense = {
  id: string;
  amount: number;
  description: string;
  date: string;
};

export default function ExpenseList({ userId }: { userId?: string }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      
      if (userId) {
        // In a real app, you would fetch data from Supabase
        // const { data } = await supabase
        //   .from('expenses')
        //   .select('*')
        //   .eq('user_id', userId)
        //   .order('date', { ascending: false });
        
        // setExpenses(data || []);
      }
      
      // For demo purposes, we'll use dummy data
      const demoExpenses: Expense[] = [
        {
          id: '1',
          amount: 950,
          description: 'Rent',
          date: '2025-04-01'
        },
        {
          id: '2',
          amount: 120,
          description: 'Groceries',
          date: '2025-04-05'
        },
        {
          id: '3',
          amount: 45,
          description: 'Dinner',
          date: '2025-04-10'
        },
        {
          id: '4',
          amount: 35,
          description: 'Transportation',
          date: '2025-04-15'
        }
      ];
      
      setExpenses(demoExpenses);
      setLoading(false);
    };

    fetchExpenses();
  }, [userId, supabase]);

  const handleDelete = async (id: string) => {
    try {
      // In a real app, you would delete from Supabase
      // await supabase
      //   .from('expenses')
      //   .delete()
      //   .eq('id', id)
      //   .eq('user_id', userId);
      
      // For demo purposes, we'll just update the state
      setExpenses(expenses.filter(expense => expense.id !== id));
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  if (loading) {
    return <div>Loading expense data...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Description</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center">
              No expense entries found.
            </TableCell>
          </TableRow>
        ) : (
          expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell>{expense.description}</TableCell>
              <TableCell>${expense.amount.toFixed(2)}</TableCell>
              <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(expense.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}