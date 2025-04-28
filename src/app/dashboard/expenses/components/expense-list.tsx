// src/app/dashboard/expenses/components/expense-list.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ChevronDown, Calendar, DollarSign } from "lucide-react";
import { Expense, deleteExpense } from "../actions/expenses";
import EditExpenseDialog from "./edit-expense-dialog";
import { useRouter } from "next/navigation";

type ExpenseListProps = {
  expenses: Expense[];
};

export default function ExpenseList({ expenses }: ExpenseListProps) {
  const [loading, setLoading] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const router = useRouter();

  // Track window width for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const isMobile = windowWidth < 768;

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('id', id);
      
      const result = await deleteExpense(formData);
      
      if (!result.success) {
        console.error("Failed to delete expense:", result.error);
      }
      
      router.refresh();
    } catch (error) {
      console.error('Error deleting expense:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

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
    return `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}, ${date.getFullYear()}`;
  };

  return (
    <>
      {editingExpense && (
        <EditExpenseDialog
          expense={editingExpense}
          open={!!editingExpense}
          onOpenChange={(open) => {
            if (!open) setEditingExpense(null);
          }}
        />
      )}
      
      <div className="w-full -mx-1 sm:mx-0">
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-base font-medium px-2 sm:px-4 py-3 w-[75%] sm:w-[40%]">Description</TableHead>
              {!isMobile && (
                <>
                  <TableHead className="text-base font-medium text-right w-[20%] px-2 sm:px-4 py-3">Amount</TableHead>
                  <TableHead className="text-base font-medium text-center w-[25%] min-w-[100px] px-2 sm:px-4 py-3">Date</TableHead>
                </>
              )}
              <TableHead className="text-base font-medium text-right w-[25%] sm:w-[15%] px-2 sm:px-4 py-3">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isMobile ? 2 : 4} className="text-center py-8 text-base text-muted-foreground">
                  No expense entries found.
                </TableCell>
              </TableRow>
            ) : (
              expenses.map((expense) => (
                <React.Fragment key={expense.id}>
                  <TableRow className="border-b">
                    <TableCell className="text-base px-2 sm:px-4 py-3 sm:py-4">
                      <div className="flex items-center gap-1 sm:gap-2">
                        {isMobile && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0 min-w-0"
                            onClick={() => toggleRow(expense.id)}
                          >
                            <ChevronDown 
                              className={`h-4 w-4 transition-transform duration-200 ${
                                expandedRows[expense.id] ? 'transform rotate-180' : ''
                              }`} 
                            />
                          </Button>
                        )}
                        <div className={`truncate ${isMobile ? 'max-w-full' : 'max-w-[250px] sm:max-w-[200px] md:max-w-[250px] lg:max-w-[350px]'}`} title={expense.description}>
                          {expense.description}
                        </div>
                      </div>
                    </TableCell>
                    
                    {!isMobile && (
                      <>
                        <TableCell className="text-base px-2 sm:px-4 py-3 sm:py-4 text-right">
                          <span className={expense.amount > 200 ? "text-red-600 font-medium" : ""}>
                            {formatCurrency(expense.amount)}
                          </span>
                        </TableCell>
                        <TableCell className="text-base px-2 sm:px-4 py-3 sm:py-4 text-center whitespace-nowrap min-w-[120px]">
                          {formatDate(expense.date)}
                        </TableCell>
                      </>
                    )}
                    
                    <TableCell className="text-base px-2 sm:px-4 py-3 sm:py-4 text-right">
                      <div className="flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setEditingExpense(expense)}
                          disabled={loading}
                          className="h-8 w-8 mr-1 p-0 min-w-0"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(expense.id)}
                          disabled={loading}
                          className="h-8 w-8 text-red-500 hover:text-red-600 p-0 min-w-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  {isMobile && expandedRows[expense.id] && (
                    <TableRow className="bg-muted/30">
                      <TableCell colSpan={2} className="px-2 sm:px-4 py-2">
                        <div className="flex flex-col space-y-1.5">
                          <div className="flex items-center text-sm">
                            <DollarSign className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                            <span className="font-medium mr-1.5">Amount:</span>
                            <span className={expense.amount > 200 ? "text-red-600 font-medium" : ""}>
                              {formatCurrency(expense.amount)}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                            <span className="font-medium mr-1.5">Date:</span>
                            <span>{formatDate(expense.date)}</span>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}