// src/app/dashboard/expenses/components/add-expense-dialog.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/utils/utils";
import { useRouter } from "next/navigation";
import { addExpense } from "../actions/expenses";

export default function AddExpenseDialog({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  // Check if we're on a mobile device
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup event listener
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setDate(new Date());
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!description || !amount || !date) {
      setError("All fields are required");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('description', description);
      formData.append('amount', amount);
      formData.append('date', format(date, 'yyyy-MM-dd'));
      
      const result = await addExpense(formData);
      
      if (!result.success) {
        setError(result.error?.message || "Failed to add expense");
        return;
      }
      
      // Success
      resetForm();
      setOpen(false);
      router.refresh();
    } catch (err) {
      console.error('Error adding expense:', err);
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          resetForm();
        }
        setOpen(newOpen);
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md max-w-[95vw] p-4 sm:p-6 rounded-lg">
        <DialogHeader className="sm:pb-2 pb-1">
          <DialogTitle className="text-xl">Add Expense</DialogTitle>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm font-medium border border-red-200">
              {error}
            </div>
          )}
          
          <div className="space-y-3">
            <Label htmlFor="description" className="text-sm font-medium block">
              Description
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Rent, Groceries, etc."
              required
              disabled={isSubmitting}
              className="h-11 text-base"
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="amount" className="text-sm font-medium block">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              disabled={isSubmitting}
              className="h-11 text-base"
            />
          </div>
          
          <div className="space-y-3">
            <Label className="text-sm font-medium block">
              Date
            </Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-11",
                    !date && "text-muted-foreground"
                  )}
                  disabled={isSubmitting}
                  type="button"
                >
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className={cn(
                "w-auto p-0",
                isMobile && "w-[calc(95vw-2rem)]"
              )} align="center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    if (newDate) {
                      setDate(newDate);
                      // Force close the calendar immediately
                      setTimeout(() => setCalendarOpen(false), 0);
                    }
                  }}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="flex justify-end pt-4 gap-3">
            <DialogClose asChild>
              <Button 
                type="button" 
                variant="outline" 
                disabled={isSubmitting}
                className="sm:flex-none flex-1 h-11"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="sm:flex-none flex-1 h-11"
            >
              {isSubmitting ? "Adding..." : "Add Expense"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}