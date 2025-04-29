// src/app/dashboard/income/components/edit-income-dialog.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, parse } from "date-fns";
import { cn } from "@/utils/utils";
import { useRouter } from "next/navigation";
import { Income, updateIncome } from "../actions/income";

interface EditIncomeDialogProps {
  income: Income;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditIncomeDialog({ 
  income, 
  open, 
  onOpenChange 
}: EditIncomeDialogProps) {
  const [source, setSource] = useState(income.source);
  const [amount, setAmount] = useState(income.amount.toString());
  const [date, setDate] = useState<Date>(
    typeof income.date === 'string' 
      ? parse(income.date, 'yyyy-MM-dd', new Date()) 
      : new Date(income.date)
  );
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!source || !amount || !date) {
      setError("All fields are required");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('id', income.id);
      formData.append('source', source);
      formData.append('amount', amount);
      formData.append('date', format(date, 'yyyy-MM-dd'));
      
      const result = await updateIncome(formData);
      
      if (!result.success) {
        setError(result.error?.message || "Failed to update income");
        return;
      }
      
      // Success
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      console.error('Error updating income:', err);
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-md p-6 sm:p-8">
        <DialogHeader>
          <DialogTitle>Edit Income</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-5">
          {error && (
            <div className="text-red-600 text-sm mb-2">{error}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="source" className="mb-2 block">Source</Label>
            <Input
              id="source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g. Salary, Freelance, etc."
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount" className="mb-2 block">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-3">
            <Label className="mb-1.5 block">Date</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                  disabled={isSubmitting}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
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
          <div className="flex justify-end pt-4">
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Income"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}