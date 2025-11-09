'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartTooltipContent } from "@/components/ui/chart";

// Mock data for the chart
const data = [
  { month: "Jan", revenue: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Feb", revenue: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Mar", revenue: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Apr", revenue: Math.floor(Math.random() * 5000) + 1000 },
  { month: "May", revenue: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Jun", revenue: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Jul", revenue: Math.floor(Math.random() * 5000) + 1000 },
];

export default function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="month"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
            cursor={false}
            content={<ChartTooltipContent 
                formatter={(value) => `$${value.toLocaleString()}`}
                indicator="dot"
            />}
        />
        <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

    