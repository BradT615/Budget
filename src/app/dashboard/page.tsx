// src/app/dashboard/page.tsx
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OverviewChart from "./components/overview-chart";
import RecentTransactions from "./components/recent-transactions";
import { getIncomes } from "./income/actions/income";
import { getExpenses } from "./expenses/actions/expenses";
import { getSavingsGoals } from "./savings/actions/savings-goals";
import { Progress } from "@/components/ui/progress";
import { ArrowUpRight, ArrowDownRight, DollarSign, Target } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  
  // Get the authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User";
  
  // Fetch data from our database
  const { data: incomes } = await getIncomes();
  const { data: expenses } = await getExpenses();
  const { data: savingsGoals } = await getSavingsGoals();
  
  // Calculate summary statistics
  const totalIncome = incomes?.reduce((sum, item) => sum + item.amount, 0) || 0;
  const totalExpenses = expenses?.reduce((sum, item) => sum + item.amount, 0) || 0;
  const savings = totalIncome - totalExpenses;
  
  // Calculate progress towards total savings goals
  const totalSavingsGoal = savingsGoals?.reduce((sum, goal) => sum + goal.target_amount, 0) || 0;
  const currentSavings = savingsGoals?.reduce((sum, goal) => sum + goal.current_amount, 0) || 0;
  
  let progressPercentage = 0;
  if (totalSavingsGoal > 0) {
    progressPercentage = Math.min(100, (currentSavings / totalSavingsGoal) * 100);
  }
  
  // Get the closest goal to completion (excluding completed ones)
  const incompleteSavingsGoals = savingsGoals?.filter(goal => 
    goal.current_amount < goal.target_amount
  ) || [];
  
  let closestGoal = null;
  let highestPercentage = 0;
  
  for (const goal of incompleteSavingsGoals) {
    const percentage = (goal.current_amount / goal.target_amount) * 100;
    if (percentage > highestPercentage) {
      highestPercentage = percentage;
      closestGoal = goal;
    }
  }
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-w-0 h-full">
      <div className="space-y-6">
        {/* Stick to top of scrollable content */}
        <div className="flex items-center justify-between pt-6 px-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          {user && (
            <p className="text-muted-foreground">
              Welcome back, <span className="font-medium">{displayName}</span>
            </p>
          )}
        </div>
        
        {/* Summary cards - ensure proper responsive layout */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 m-3 sm:m-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="mr-3 rounded-full p-2 bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{formatCurrency(totalIncome)}</div>
                  <p className="text-xs text-muted-foreground">
                    {incomes?.length || 0} income entries
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="mr-3 rounded-full p-2 bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400">
                  <ArrowDownRight className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
                  <p className="text-xs text-muted-foreground">
                    {expenses?.length || 0} expense entries
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Net Savings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="mr-3 rounded-full p-2 bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                  <DollarSign className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{formatCurrency(savings)}</div>
                  <p className="text-xs text-muted-foreground">
                    {savings > 0 ? "Positive" : "Negative"} cash flow
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Savings Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="mr-3 rounded-full p-2 bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400">
                  <Target className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{savingsGoals?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(currentSavings)} saved of {formatCurrency(totalSavingsGoal)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content area - optimize for horizontal scrolling */}
        <div className="grid gap-6 m-3 sm:m-6 lg:grid-cols-7">
          {/* Financial Overview Chart - ensure proper sizing and scrolling */}
          <Card className="lg:col-span-5 w-full min-w-0">
            <CardHeader>
              <CardTitle>Financial Overview</CardTitle>
              <CardDescription>Your income and expenses over time</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Ensure chart container doesn't overflow */}
              <Tabs defaultValue="weekly" className="h-80">
                <TabsList>
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="6month">6 Months</TabsTrigger>
                  <TabsTrigger value="yearly">Yearly</TabsTrigger>
                </TabsList>
                <TabsContent value="weekly" className="h-full">
                  <OverviewChart period="weekly" />
                </TabsContent>
                <TabsContent value="monthly" className="h-full">
                  <OverviewChart period="monthly" />
                </TabsContent>
                <TabsContent value="6month" className="h-full">
                  <OverviewChart period="6month" />
                </TabsContent>
                <TabsContent value="yearly" className="h-full">
                  <OverviewChart period="yearly" />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          {/* Savings Progress - ensure proper sizing */}
          <Card className="lg:col-span-2 w-full min-w-[280px]">
            <CardHeader>
              <CardTitle>Savings Progress</CardTitle>
              <CardDescription>Overall goal completion</CardDescription>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="space-y-8">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <h4 className="text-sm font-medium flex-grow">All Savings Goals</h4>
                    <span className="text-sm font-medium">{progressPercentage.toFixed(0)}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatCurrency(currentSavings)}</span>
                    <span>{formatCurrency(totalSavingsGoal)}</span>
                  </div>
                </div>
                
                {closestGoal && (
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <h4 className="text-sm font-medium flex-grow truncate" title={closestGoal.name}>
                        {closestGoal.name}
                      </h4>
                      <span className="text-sm font-medium">
                        {((closestGoal.current_amount / closestGoal.target_amount) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Progress 
                      value={(closestGoal.current_amount / closestGoal.target_amount) * 100} 
                      className="h-2" 
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatCurrency(closestGoal.current_amount)}</span>
                      <span>{formatCurrency(closestGoal.target_amount)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Closest to completion
                    </div>
                  </div>
                )}
                
                <div className="pt-2">
                  <div className="flex flex-col space-y-4">
                    <div className="rounded-lg border p-4">
                      <div className="text-sm text-muted-foreground">Completed Goals</div>
                      <div className="text-2xl font-bold mt-3 flex items-center">
                        {savingsGoals?.filter(g => g.current_amount >= g.target_amount).length || 0}
                      </div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="text-sm text-muted-foreground">Average Progress</div>
                      <div className="text-2xl font-bold mt-3 flex items-center">
                        {savingsGoals?.length 
                          ? (savingsGoals.reduce((sum, g) => 
                              sum + Math.min(100, (g.current_amount / g.target_amount) * 100), 0) 
                            / savingsGoals.length).toFixed(0)
                          : 0}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Transactions - optimized for scrolling */}
        <Card className="m-3 sm:m-6">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest income and expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentTransactions />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}