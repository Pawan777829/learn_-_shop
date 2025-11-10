'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { ChartTooltipContent } from "@/components/ui/chart";
import { useMemo } from "react";
import type { VendorSale } from "@/app/dashboard/vendor/page";
import { Loader2 } from "lucide-react";

export default function RevenueChart({ sales, isLoading }: { sales: VendorSale[], isLoading: boolean }) {
  
  const data = useMemo(() => {
    const monthlyRevenue: { [key: string]: number } = {
        "Jan": 0, "Feb": 0, "Mar": 0, "Apr": 0, "May": 0, "Jun": 0,
        "Jul": 0, "Aug": 0, "Sep": 0, "Oct": 0, "Nov": 0, "Dec": 0
    };

    sales.forEach(sale => {
        const month = new Date(sale.orderDate).toLocaleString('default', { month: 'short' });
        monthlyRevenue[month] += sale.item.price * sale.item.quantity;
    });

    return Object.entries(monthlyRevenue).map(([month, revenue]) => ({
        month,
        revenue: Math.floor(revenue) // Using floor for cleaner chart
    }));
  }, [sales]);

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-[350px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

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
