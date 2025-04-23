"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type SavingsGoal = {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
};

export default function SavingsGoalsList({ userId }: { userId?: string }) {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchGoals = async () => {
      setLoading(true);
      
      if (userId) {
        // In a real app, you would fetch data from Supabase
        // const { data } = await supabase
        //   .from('savings_goals')
        //   .select('*')
        //   .eq('user_id', userId)
        //   .order('created_at', { ascending: false });
        
        // setGoals(data || []);
      }
      
      // For demo purposes, we'll use dummy data
      const demoGoals: SavingsGoal[] = [
        {
          id: '1',
          name: 'Emergency Fund',
          target_amount: 10000,
          current_amount: 5000,
          target_date: '2025-12-31'
        },
        {
          id: '2',
          name: 'Vacation',
          target_amount: 3000,
          current_amount: 1200,
          target_date: '2025-06-30'
        },
        {
          id: '3',
          name: 'New Laptop',
          target_amount: 1500,
          current_amount: 800,
          target_date: '2025-08-15'
        }
      ];
      
      setGoals(demoGoals);
      setLoading(false);
    };

    fetchGoals();
  }, [userId, supabase]);

  const handleDelete = async (id: string) => {
    try {
      // In a real app, you would delete from Supabase
      // await supabase
      //   .from('savings_goals')
      //   .delete()
      //   .eq('id', id)
      //   .eq('user_id', userId);
      
      // For demo purposes, we'll just update the state
      setGoals(goals.filter(goal => goal.id !== id));
    } catch (error) {
      console.error('Error deleting savings goal:', error);
    }
  };

  if (loading) {
    return <div>Loading savings goals...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {goals.length === 0 ? (
        <div className="col-span-full text-center">
          No savings goals found. Add your first goal!
        </div>
      ) : (
        goals.map((goal) => {
          const progressPercentage = (goal.current_amount / goal.target_amount) * 100;
          
          return (
            <Card key={goal.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium text-lg">{goal.name}</h3>
                    {goal.target_date && (
                      <p className="text-sm text-muted-foreground">
                        Target: {new Date(goal.target_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleDelete(goal.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>${goal.current_amount.toFixed(2)}</span>
                    <span>${goal.target_amount.toFixed(2)}</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  <div className="text-center text-sm text-muted-foreground">
                    {progressPercentage.toFixed(0)}% completed
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}