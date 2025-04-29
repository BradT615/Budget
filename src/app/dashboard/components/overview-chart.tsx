"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { getIncomes } from "../income/actions/income";
import { getExpenses } from "../expenses/actions/expenses";
import { addDays, format, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, 
          startOfYear, endOfYear, subMonths, eachMonthOfInterval, isWithinInterval } from "date-fns";

type ChartPeriod = "weekly" | "monthly" | "6month" | "yearly";

type DailyData = {
  date: Date;
  income: number;
  expenses: number;
}

type ChartData = {
  name: string;
  income: number;
  expenses: number;
  balance: number;
}

export default function OverviewChart({ period }: { period: ChartPeriod }) {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [maxValue, setMaxValue] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Get the authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }
        
        // Fetch income and expense data
        const { data: incomeData } = await getIncomes();
        const { data: expenseData } = await getExpenses();
        
        if (!incomeData || !expenseData) {
          // Use demo data if we can't get real data
          generateDemoData(period);
          return;
        }
        
        // Process data based on selected period
        const today = new Date();
        let processedData: ChartData[] = [];
        
        switch (period) {
          case "weekly":
            processedData = generateWeeklyData(incomeData, expenseData, today);
            break;
          case "monthly":
            processedData = generateMonthlyData(incomeData, expenseData, today);
            break;
          case "6month":
            processedData = generate6MonthData(incomeData, expenseData, today);
            break;
          case "yearly":
            processedData = generateYearlyData(incomeData, expenseData, today);
            break;
        }
        
        // Find the max value for the chart scale
        const allValues = processedData.flatMap(item => [item.income, item.expenses, item.balance]);
        setMaxValue(Math.max(...allValues) * 1.2); // Add 20% buffer
        
        setData(processedData);
      } catch (error) {
        console.error("Error fetching chart data:", error);
        // Fallback to demo data on error
        generateDemoData(period);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period, supabase]);

  // Generate weekly data (last 7 days)
  const generateWeeklyData = (incomeData: any[], expenseData: any[], today: Date) => {
    const startDate = startOfWeek(today, { weekStartsOn: 1 }); // Week starts on Monday
    const endDate = endOfWeek(today, { weekStartsOn: 1 });
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Initialize daily data
    const dailyData: DailyData[] = days.map(day => ({
      date: day,
      income: 0,
      expenses: 0
    }));
    
    // Sum income for each day
    incomeData.forEach(income => {
      const incomeDate = new Date(income.date);
      const dayIndex = dailyData.findIndex(day => 
        format(day.date, 'yyyy-MM-dd') === format(incomeDate, 'yyyy-MM-dd')
      );
      
      if (dayIndex !== -1) {
        dailyData[dayIndex].income += income.amount;
      }
    });
    
    // Sum expenses for each day
    expenseData.forEach(expense => {
      const expenseDate = new Date(expense.date);
      const dayIndex = dailyData.findIndex(day => 
        format(day.date, 'yyyy-MM-dd') === format(expenseDate, 'yyyy-MM-dd')
      );
      
      if (dayIndex !== -1) {
        dailyData[dayIndex].expenses += expense.amount;
      }
    });
    
    // Format data for the chart
    return dailyData.map(day => {
      const balance = day.income - day.expenses;
      return {
        name: format(day.date, 'EEE'), // Day of week (e.g., Mon, Tue)
        income: day.income,
        expenses: day.expenses,
        balance: balance
      };
    });
  };
  
  // Generate monthly data (4 weeks)
  const generateMonthlyData = (incomeData: any[], expenseData: any[], today: Date) => {
    // Get the start and end of the current month
    const startDate = startOfMonth(today);
    const endDate = endOfMonth(today);
    
    // Calculate the number of weeks in the month
    const firstDay = startOfWeek(startDate, { weekStartsOn: 1 });
    const lastDay = endOfWeek(endDate, { weekStartsOn: 1 });
    
    // Create an array of week start dates
    const weeks = [];
    let currentWeekStart = firstDay;
    
    while (currentWeekStart <= lastDay) {
      weeks.push(currentWeekStart);
      currentWeekStart = addDays(currentWeekStart, 7);
    }
    
    // Initialize weekly data
    const weeklyData = weeks.map(weekStart => {
      const weekEnd = addDays(weekStart, 6);
      return {
        startDate: weekStart,
        endDate: weekEnd,
        income: 0,
        expenses: 0
      };
    });
    
    // Sum income for each week
    incomeData.forEach(income => {
      const incomeDate = new Date(income.date);
      
      for (let i = 0; i < weeklyData.length; i++) {
        if (isWithinInterval(incomeDate, { 
          start: weeklyData[i].startDate, 
          end: weeklyData[i].endDate 
        })) {
          weeklyData[i].income += income.amount;
          break;
        }
      }
    });
    
    // Sum expenses for each week
    expenseData.forEach(expense => {
      const expenseDate = new Date(expense.date);
      
      for (let i = 0; i < weeklyData.length; i++) {
        if (isWithinInterval(expenseDate, { 
          start: weeklyData[i].startDate, 
          end: weeklyData[i].endDate 
        })) {
          weeklyData[i].expenses += expense.amount;
          break;
        }
      }
    });
    
    // Format data for the chart
    return weeklyData.map((week, index) => {
      const balance = week.income - week.expenses;
      return {
        name: `Week ${index + 1}`,
        income: week.income,
        expenses: week.expenses,
        balance: balance
      };
    });
  };
  
  // Generate 6-month data
  const generate6MonthData = (incomeData: any[], expenseData: any[], today: Date) => {
    // Get data for the last 6 months
    const endDate = endOfMonth(today);
    const startDate = startOfMonth(subMonths(today, 5));
    
    // Create an array of month start dates
    const months = eachMonthOfInterval({ start: startDate, end: endDate });
    
    // Initialize monthly data
    const monthlyData = months.map(month => ({
      month,
      income: 0,
      expenses: 0
    }));
    
    // Sum income for each month
    incomeData.forEach(income => {
      const incomeDate = new Date(income.date);
      
      for (let i = 0; i < monthlyData.length; i++) {
        const monthStart = monthlyData[i].month;
        const monthEnd = endOfMonth(monthStart);
        
        if (isWithinInterval(incomeDate, { start: monthStart, end: monthEnd })) {
          monthlyData[i].income += income.amount;
          break;
        }
      }
    });
    
    // Sum expenses for each month
    expenseData.forEach(expense => {
      const expenseDate = new Date(expense.date);
      
      for (let i = 0; i < monthlyData.length; i++) {
        const monthStart = monthlyData[i].month;
        const monthEnd = endOfMonth(monthStart);
        
        if (isWithinInterval(expenseDate, { start: monthStart, end: monthEnd })) {
          monthlyData[i].expenses += expense.amount;
          break;
        }
      }
    });
    
    // Format data for the chart
    return monthlyData.map(month => {
      const balance = month.income - month.expenses;
      return {
        name: format(month.month, 'MMM'), // Short month name (e.g., Jan, Feb)
        income: month.income,
        expenses: month.expenses,
        balance: balance
      };
    });
  };
  
  // Generate yearly data
  const generateYearlyData = (incomeData: any[], expenseData: any[], today: Date) => {
    // Get data for the current year
    const startDate = startOfYear(today);
    const endDate = endOfYear(today);
    
    // Create an array of month start dates
    const months = eachMonthOfInterval({ start: startDate, end: endDate });
    
    // Initialize monthly data
    const monthlyData = months.map(month => ({
      month,
      income: 0,
      expenses: 0
    }));
    
    // Sum income for each month
    incomeData.forEach(income => {
      const incomeDate = new Date(income.date);
      
      for (let i = 0; i < monthlyData.length; i++) {
        const monthStart = monthlyData[i].month;
        const monthEnd = endOfMonth(monthStart);
        
        if (isWithinInterval(incomeDate, { start: monthStart, end: monthEnd })) {
          monthlyData[i].income += income.amount;
          break;
        }
      }
    });
    
    // Sum expenses for each month
    expenseData.forEach(expense => {
      const expenseDate = new Date(expense.date);
      
      for (let i = 0; i < monthlyData.length; i++) {
        const monthStart = monthlyData[i].month;
        const monthEnd = endOfMonth(monthStart);
        
        if (isWithinInterval(expenseDate, { start: monthStart, end: monthEnd })) {
          monthlyData[i].expenses += expense.amount;
          break;
        }
      }
    });
    
    // Format data for the chart
    return monthlyData.map(month => {
      const balance = month.income - month.expenses;
      return {
        name: format(month.month, 'MMM'), // Short month name (e.g., Jan, Feb)
        income: month.income,
        expenses: month.expenses,
        balance: balance
      };
    });
  };
  
  // Generate demo data when real data isn't available
  const generateDemoData = (period: ChartPeriod) => {
    let demoData: ChartData[] = [];
    
    if (period === "weekly") {
      demoData = [
        { name: "Mon", income: 300, expenses: 200, balance: 100 },
        { name: "Tue", income: 150, expenses: 100, balance: 50 },
        { name: "Wed", income: 0, expenses: 50, balance: -50 },
        { name: "Thu", income: 0, expenses: 150, balance: -150 },
        { name: "Fri", income: 600, expenses: 200, balance: 400 },
        { name: "Sat", income: 0, expenses: 250, balance: -250 },
        { name: "Sun", income: 0, expenses: 100, balance: -100 },
      ];
    } else if (period === "monthly") {
      demoData = [
        { name: "Week 1", income: 1200, expenses: 800, balance: 400 },
        { name: "Week 2", income: 1100, expenses: 900, balance: 200 },
        { name: "Week 3", income: 1300, expenses: 850, balance: 450 },
        { name: "Week 4", income: 1000, expenses: 700, balance: 300 },
      ];
    } else if (period === "6month") {
      demoData = [
        { name: "Jan", income: 4500, expenses: 3200, balance: 1300 },
        { name: "Feb", income: 4200, expenses: 3300, balance: 900 },
        { name: "Mar", income: 4800, expenses: 3400, balance: 1400 },
        { name: "Apr", income: 4300, expenses: 3100, balance: 1200 },
        { name: "May", income: 4600, expenses: 3500, balance: 1100 },
        { name: "Jun", income: 5000, expenses: 3600, balance: 1400 },
      ];
    } else if (period === "yearly") {
      demoData = [
        { name: "Jan", income: 4500, expenses: 3200, balance: 1300 },
        { name: "Feb", income: 4200, expenses: 3300, balance: 900 },
        { name: "Mar", income: 4800, expenses: 3400, balance: 1400 },
        { name: "Apr", income: 4300, expenses: 3100, balance: 1200 },
        { name: "May", income: 4600, expenses: 3500, balance: 1100 },
        { name: "Jun", income: 5000, expenses: 3600, balance: 1400 },
        { name: "Jul", income: 4800, expenses: 3400, balance: 1400 },
        { name: "Aug", income: 5200, expenses: 3800, balance: 1400 },
        { name: "Sep", income: 4900, expenses: 3500, balance: 1400 },
        { name: "Oct", income: 5100, expenses: 3700, balance: 1400 },
        { name: "Nov", income: 5300, expenses: 3900, balance: 1400 },
        { name: "Dec", income: 5800, expenses: 4200, balance: 1600 },
      ];
    }
    
    // Find the max value for the chart scale
    const allValues = demoData.flatMap(item => [item.income, item.expenses, item.balance]);
    setMaxValue(Math.max(...allValues) * 1.2); // Add 20% buffer
    
    setData(demoData);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 20,
          bottom: 30, // Increased to make room for legend
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis domain={[0, maxValue]} />
        <Tooltip 
          formatter={(value: number) => [`${value.toFixed(2)}`, undefined]}
          labelFormatter={(label) => `${label}`}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          wrapperStyle={{ bottom: 25, left: 25,  }}
        />
        <ReferenceLine y={0} stroke="#666" />
        <Line type="monotone" dataKey="income" stroke="#4ade80" strokeWidth={2} name="Income" />
        <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
        <Line type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" name="Net Balance" />
      </LineChart>
    </ResponsiveContainer>
  );
}