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
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  ChevronDown, 
  Calendar, 
  DollarSign 
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Transaction } from "../actions/transactions";
import { Input } from "@/components/ui/input";

type TransactionsListProps = {
  transactions: Transaction[];
};

export default function TransactionsList({ transactions: initialTransactions }: TransactionsListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
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

  // Filter transactions based on search term and filter type
  useEffect(() => {
    let filtered = initialTransactions;
    
    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === filterType);
    }
    
    // Apply search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(transaction => 
        transaction.description.toLowerCase().includes(term)
      );
    }
    
    setTransactions(filtered);
  }, [searchTerm, filterType, initialTransactions]);

  const isMobile = windowWidth < 768;

  const navigateToEdit = (transaction: Transaction) => {
    if (transaction.type === 'income') {
      router.push(`/dashboard/income?edit=${transaction.id}`);
    } else {
      router.push(`/dashboard/expenses?edit=${transaction.id}`);
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
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterType('all')}
            className="flex-1 sm:flex-none"
          >
            All
          </Button>
          <Button
            variant={filterType === 'income' ? 'default' : 'outline'}
            onClick={() => setFilterType('income')}
            className="flex-1 sm:flex-none"
          >
            Income
          </Button>
          <Button
            variant={filterType === 'expense' ? 'default' : 'outline'}
            onClick={() => setFilterType('expense')}
            className="flex-1 sm:flex-none"
          >
            Expenses
          </Button>
        </div>
      </div>
      
      <div className="w-full -mx-1 sm:mx-0">
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-base font-medium px-2 sm:px-4 py-3 w-[10%] sm:w-[5%]"></TableHead>
              <TableHead className="text-base font-medium px-2 sm:px-4 py-3 w-[65%] sm:w-[45%]">Description</TableHead>
              {!isMobile && (
                <>
                  <TableHead className="text-base font-medium text-right w-[20%] px-2 sm:px-4 py-3">Amount</TableHead>
                  <TableHead className="text-base font-medium text-center w-[20%] min-w-[100px] px-2 sm:px-4 py-3">Date</TableHead>
                </>
              )}
              <TableHead className="text-base font-medium text-right w-[25%] sm:w-[10%] px-2 sm:px-4 py-3">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isMobile ? 3 : 5} className="text-center py-8 text-base text-muted-foreground">
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <React.Fragment key={`${transaction.type}-${transaction.id}`}>
                  <TableRow className="border-b">
                    <TableCell className="px-2 sm:px-4 py-3 sm:py-4">
                      <div className={`flex items-center justify-center rounded-full size-7 ${
                        transaction.type === 'income' 
                          ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' 
                          : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                      }`}>
                        {transaction.type === 'income' ? (
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowDownRight className="h-3.5 w-3.5" />
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-base px-2 sm:px-4 py-3 sm:py-4">
                      <div className="flex items-center gap-1 sm:gap-2">
                        {isMobile && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0 min-w-0"
                            onClick={() => toggleRow(`${transaction.type}-${transaction.id}`)}
                          >
                            <ChevronDown 
                              className={`h-4 w-4 transition-transform duration-200 ${
                                expandedRows[`${transaction.type}-${transaction.id}`] ? 'transform rotate-180' : ''
                              }`} 
                            />
                          </Button>
                        )}
                        <div className={`truncate ${isMobile ? 'max-w-[180px]' : 'max-w-[250px] sm:max-w-[200px] md:max-w-[250px] lg:max-w-[350px]'}`} title={transaction.description}>
                          {transaction.description}
                          <span className="text-xs ml-2 text-muted-foreground capitalize">
                            {transaction.type}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    
                    {!isMobile && (
                      <>
                        <TableCell className="text-base px-2 sm:px-4 py-3 sm:py-4 text-right">
                          <span className={transaction.type === 'income' ? "text-green-600 font-medium dark:text-green-400" : "text-red-600 font-medium dark:text-red-400"}>
                            {transaction.type === 'income' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </span>
                        </TableCell>
                        <TableCell className="text-base px-2 sm:px-4 py-3 sm:py-4 text-center whitespace-nowrap min-w-[120px]">
                          {formatDate(transaction.date)}
                        </TableCell>
                      </>
                    )}
                    
                    <TableCell className="text-base px-2 sm:px-4 py-3 sm:py-4 text-right">
                      <div className="flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigateToEdit(transaction)}
                          className="h-8 px-2"
                        >
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  {isMobile && expandedRows[`${transaction.type}-${transaction.id}`] && (
                    <TableRow className="bg-muted/30">
                      <TableCell colSpan={3} className="px-2 sm:px-4 py-2">
                        <div className="flex flex-col space-y-1.5">
                          <div className="flex items-center text-sm">
                            <DollarSign className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                            <span className="font-medium mr-1.5">Amount:</span>
                            <span className={transaction.type === 'income' ? "text-green-600 font-medium dark:text-green-400" : "text-red-600 font-medium dark:text-red-400"}>
                              {transaction.type === 'income' ? '+' : '-'}
                              {formatCurrency(transaction.amount)}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                            <span className="font-medium mr-1.5">Date:</span>
                            <span>{formatDate(transaction.date)}</span>
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