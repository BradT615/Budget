"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

type Period = "weekly" | "monthly" | "6month" | "yearly";

type ChartData = {
  name: string;
  income: number;
  expenses: number;
}

export default function OverviewChart({ period }: { period: Period }) {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Get the authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      
      // In a real app, you would fetch data from Supabase
      // based on the user ID and selected period
      
      // For demo purposes, we'll use dummy data
      let demoData: ChartData[] = [];
      
      if (period === "weekly") {
        demoData = [
          { name: "Mon", income: 300, expenses: 200 },
          { name: "Tue", income: 150, expenses: 100 },
          { name: "Wed", income: 0, expenses: 50 },
          { name: "Thu", income: 0, expenses: 150 },
          { name: "Fri", income: 600, expenses: 200 },
          { name: "Sat", income: 0, expenses: 250 },
          { name: "Sun", income: 0, expenses: 100 },
        ];
      } else if (period === "monthly") {
        demoData = [
          { name: "Week 1", income: 1200, expenses: 800 },
          { name: "Week 2", income: 1100, expenses: 900 },
          { name: "Week 3", income: 1300, expenses: 850 },
          { name: "Week 4", income: 1000, expenses: 700 },
        ];
      } else if (period === "6month") {
        demoData = [
          { name: "Jan", income: 4500, expenses: 3200 },
          { name: "Feb", income: 4200, expenses: 3300 },
          { name: "Mar", income: 4800, expenses: 3400 },
          { name: "Apr", income: 4300, expenses: 3100 },
          { name: "May", income: 4600, expenses: 3500 },
          { name: "Jun", income: 5000, expenses: 3600 },
        ];
      } else if (period === "yearly") {
        demoData = [
          { name: "Jan", income: 4500, expenses: 3200 },
          { name: "Feb", income: 4200, expenses: 3300 },
          { name: "Mar", income: 4800, expenses: 3400 },
          { name: "Apr", income: 4300, expenses: 3100 },
          { name: "May", income: 4600, expenses: 3500 },
          { name: "Jun", income: 5000, expenses: 3600 },
          { name: "Jul", income: 4800, expenses: 3400 },
          { name: "Aug", income: 5200, expenses: 3800 },
          { name: "Sep", income: 4900, expenses: 3500 },
          { name: "Oct", income: 5100, expenses: 3700 },
          { name: "Nov", income: 5300, expenses: 3900 },
          { name: "Dec", income: 5800, expenses: 4200 },
        ];
      }
      
      setData(demoData);
      setLoading(false);
    };

    fetchData();
  }, [period, supabase]);

  if (loading) {
    return <div>Loading chart data...</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="income" stroke="#4ade80" strokeWidth={2} />
        <Line type="monotone" dataKey="expenses" stroke="#f87171" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}