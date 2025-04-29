// src/app/dashboard/savings/components/add-savings-goal-dialog.tsx
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
import { addSavingsGoal } from "../actions/savings-goals";

export default function AddSavingsGoalDialog({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [targetDate, setTargetDate] = useState<Date | undefined>(undefined);
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
    setName("");
    setTargetAmount("");
    setCurrentAmount("");
    setTargetDate(undefined);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!name || !targetAmount) {
      setError("Name and target amount are required");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('targetAmount', targetAmount);
      
      if (currentAmount) {
        formData.append('currentAmount', currentAmount);
      }
      
      if (targetDate) {
        formData.append('targetDate', format(targetDate, 'yyyy-MM-dd'));
      }
      
      const result = await addSavingsGoal(formData);
      
      if (!result.success) {
        setError(result.error?.message || "Failed to add savings goal");
        return;
      }
      
      // Success
      resetForm();
      setOpen(false);
      router.refresh();
    } catch (err) {
      console.error('Error adding savings goal:', err);
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
          <DialogTitle className="text-xl">Add Savings Goal</DialogTitle>
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
            <Label htmlFor="name" className="text-sm font-medium block">
              Goal Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Emergency Fund, Vacation, etc."
              required
              disabled={isSubmitting}
              className="h-11 text-base"
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="targetAmount" className="text-sm font-medium block">
              Target Amount
            </Label>
            <Input
              id="targetAmount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="0.00"
              required
              disabled={isSubmitting}
              className="h-11 text-base"
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="currentAmount" className="text-sm font-medium block">
              Current Amount (optional)
            </Label>
            <Input
              id="currentAmount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              placeholder="0.00"
              disabled={isSubmitting}
              className="h-11 text-base"
            />
          </div>
          
          <div className="space-y-3">
            <Label className="text-sm font-medium block">
              Target Date (optional)
            </Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-11",
                    !targetDate && "text-muted-foreground"
                  )}
                  disabled={isSubmitting}
                  type="button"
                >
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  {targetDate ? format(targetDate, "PPP") : <span>Pick a target date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className={cn(
                "w-auto p-0",
                isMobile && "w-[calc(95vw-2rem)]"
              )} align="center">
                <Calendar
                  mode="single"
                  selected={targetDate}
                  onSelect={(newDate) => {
                    if (newDate) {
                      setTargetDate(newDate);
                      // Force close the calendar immediately
                      setTimeout(() => setCalendarOpen(false), 0);
                    }
                  }}
                  initialFocus
                  disabled={(date) => date < new Date()}
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
              {isSubmitting ? "Adding..." : "Add Goal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}