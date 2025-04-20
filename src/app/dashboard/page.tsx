import { createClient } from '@/lib/supabase/server'
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OverviewChart from "./components/overview-chart";
import RecentTransactions from "./components/recent-transactions";

export default async function DashboardPage() {
  const supabase = createClient()
  
  // Get the authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  
  // In a real app, you would fetch actual data from your database
  // Example:
  // const { data: incomeData } = await supabase
  //   .from('income')
  //   .select('amount')
  //   .eq('user_id', user?.id);
  // const totalIncome = incomeData?.reduce((sum, item) => sum + item.amount, 0) || 0;
  
  // For demo purposes, we'll use dummy data
  const totalIncome = 2650.00;
  const totalExpenses = 1840.00;
  const savings = totalIncome - totalExpenses;
  const progressPercentage = 32;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          {user && (
            <p className="text-muted-foreground">
              Welcome, {user.email}
            </p>
          )}
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalIncome.toFixed(2)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Savings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${savings.toFixed(2)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Progress to Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressPercentage}%</div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="weekly">
          <TabsList>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="6month">6 Months</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>
          <TabsContent value="weekly" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <OverviewChart period="weekly" />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="monthly" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <OverviewChart period="monthly" />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="6month" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <OverviewChart period="6month" />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="yearly" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <OverviewChart period="yearly" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentTransactions />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}