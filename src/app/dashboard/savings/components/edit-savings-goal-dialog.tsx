// src/app/dashboard/savings/components/edit-savings-goal-dialog.tsx
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
import { format } from "date-fns";
import { cn } from "@/utils/utils";
import { useRouter } from "next/navigation";
import { SavingsGoal, updateSavingsGoal } from "../actions/savings-goals";

interface EditSavingsGoalDialogProps {
  goal: SavingsGoal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditSavingsGoalDialog({ 
  goal, 
  open, 
  onOpenChange 
}: EditSavingsGoalDialogProps) {
  const [name, setName] = useState(goal.name);
  const [targetAmount, setTargetAmount] = useState(goal.target_amount.toString());
  const [currentAmount, setCurrentAmount] = useState(goal.current_amount.toString());
  const [targetDate, setTargetDate] = useState<Date | undefined>(
    goal.target_date ? new Date(goal.target_date) : undefined
  );
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

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
      formData.append('id', goal.id);
      formData.append('name', name);
      formData.append('targetAmount', targetAmount);
      formData.append('currentAmount', currentAmount || '0');
      
      if (targetDate) {
        formData.append('targetDate', format(targetDate, 'yyyy-MM-dd'));
      }
      
      const result = await updateSavingsGoal(formData);
      
      if (!result.success) {
        setError(result.error?.message || "Failed to update savings goal");
        return;
      }
      
      // Success
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      console.error('Error updating savings goal:', err);
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-md p-6 sm:p-8">
        <DialogHeader>
          <DialogTitle>Edit Savings Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm font-medium border border-red-200">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name" className="mb-2 block">Goal Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Emergency Fund, Vacation, etc."
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetAmount" className="mb-2 block">Target Amount</Label>
            <Input
              id="targetAmount"
              type="number"
              step="0.01"
              min="0"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="0.00"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentAmount" className="mb-2 block">Current Amount</Label>
            <Input
              id="currentAmount"
              type="number"
              step="0.01"
              min="0"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              placeholder="0.00"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-3">
            <Label className="mb-1.5 block">Target Date (optional)</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !targetDate && "text-muted-foreground"
                  )}
                  disabled={isSubmitting}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {targetDate ? format(targetDate, "PPP") : <span>No target date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={targetDate}
                  onSelect={(newDate) => {
                    setTargetDate(newDate);
                    // Force close the calendar immediately
                    setTimeout(() => setCalendarOpen(false), 0);
                  }}
                  initialFocus
                  disabled={(date) => date < new Date()}
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
              {isSubmitting ? "Updating..." : "Update Goal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}