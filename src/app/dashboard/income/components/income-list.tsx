"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
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

type Income = {
  id: string;
  amount: number;
  source: string;
  date: string;
};

export default function IncomeList({ userId }: { userId?: string }) {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchIncomes = async () => {
      setLoading(true);
      
      if (userId) {
        // In a real app, you would fetch data from Supabase
        // const { data } = await supabase
        //   .from('income')
        //   .select('*')
        //   .eq('user_id', userId)
        //   .order('date', { ascending: false });
        
        // setIncomes(data || []);
      }
      
      // For demo purposes, we'll use dummy data
      const demoIncomes: Income[] = [
        {
          id: '1',
          amount: 3000,
          source: 'Salary',
          date: '2025-04-01'
        },
        {
          id: '2',
          amount: 500,
          source: 'Freelance',
          date: '2025-04-10'
        },
        {
          id: '3',
          amount: 100,
          source: 'Dividend',
          date: '2025-04-15'
        }
      ];
      
      setIncomes(demoIncomes);
      setLoading(false);
    };

    fetchIncomes();
  }, [userId, supabase]);

  const handleDelete = async (id: string) => {
    try {
      // In a real app, you would delete from Supabase
      // await supabase
      //   .from('income')
      //   .delete()
      //   .eq('id', id)
      //   .eq('user_id', userId);
      
      // For demo purposes, we'll just update the state
      setIncomes(incomes.filter(income => income.id !== id));
    } catch (error) {
      console.error('Error deleting income:', error);
    }
  };

  if (loading) {
    return <div>Loading income data...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Source</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {incomes.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center">
              No income entries found.
            </TableCell>
          </TableRow>
        ) : (
          incomes.map((income) => (
            <TableRow key={income.id}>
              <TableCell>{income.source}</TableCell>
              <TableCell>${income.amount.toFixed(2)}</TableCell>
              <TableCell>{new Date(income.date).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(income.id)}
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