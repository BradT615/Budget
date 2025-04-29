// src/app/dashboard/savings/components/savings-goals-list.tsx
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/utils/utils";
import { CalendarIcon, Edit, Target, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { SavingsGoal, deleteSavingsGoal } from "../actions/savings-goals";
import EditSavingsGoalDialog from "./edit-savings-goal-dialog";

interface SavingsGoalsListProps {
  goals: SavingsGoal[];
}

export default function SavingsGoalsList({ goals }: SavingsGoalsListProps) {
  const [loading, setLoading] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('id', id);
      
      const result = await deleteSavingsGoal(formData);
      
      if (!result.success) {
        console.error("Failed to delete savings goal:", result.error);
      }
      
      router.refresh();
    } catch (error) {
      console.error('Error deleting savings goal:', error);
    } finally {
      setLoading(false);
    }
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
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No target date";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (goals.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        You don&apos;t have any savings goals yet. Use the &quot;Add Savings Goal&quot; button to create your first goal.
      </div>
    );
  }

  return (
    <>
      {editingGoal && (
        <EditSavingsGoalDialog
          goal={editingGoal}
          open={!!editingGoal}
          onOpenChange={(open) => {
            if (!open) setEditingGoal(null);
          }}
        />
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => {
          const progressPercentage = Math.min(
            100,
            (goal.current_amount / goal.target_amount) * 100
          );
          
          const isCompleted = progressPercentage >= 100;
          const isCloseToTarget = progressPercentage >= 80 && progressPercentage < 100;
          
          return (
            <Card 
              key={goal.id} 
              className={cn(
                "transition-all duration-200 overflow-hidden",
                isCompleted && "border-green-400 bg-green-50 dark:bg-green-950/20"
              )}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1 mr-2">
                    <h3 className="font-semibold text-lg truncate max-w-[200px]" title={goal.name}>
                      {goal.name} 
                      {isCompleted && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Completed
                        </span>
                      )}
                    </h3>
                    
                    <div className="flex items-center text-muted-foreground text-sm">
                      <Target className="h-3.5 w-3.5 mr-1.5" />
                      <span>{formatCurrency(goal.target_amount)}</span>
                    </div>
                    
                    {goal.target_date && (
                      <div className="flex items-center text-muted-foreground text-sm">
                        <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
                        <span>{formatDate(goal.target_date)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-1 flex-shrink-0">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => setEditingGoal(goal)}
                      disabled={loading}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Savings Goal</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete &quot;{goal.name}&quot;? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(goal.id)}
                            className="bg-red-600 text-white hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>{formatCurrency(goal.current_amount)}</span>
                    <span>{formatCurrency(goal.target_amount)}</span>
                  </div>
                  <Progress 
                    value={progressPercentage} 
                    className={cn(
                      "h-2",
                      isCompleted && "bg-green-100 [&>div]:bg-green-500",
                      isCloseToTarget && "bg-yellow-100 [&>div]:bg-yellow-500"
                    )}
                  />
                  <div className="text-center text-sm text-muted-foreground">
                    {progressPercentage.toFixed(0)}% completed
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}