'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, TrendingUp } from 'lucide-react';
import type { Item } from '@/lib/types';

export default function AnalyticsOverview({ listings }: { listings: Item[] }) {

    const totalRevenue = listings?.reduce((acc, item) => {
        // This is a mock calculation. A real app would track actual sales.
        // For now, we'll imagine each item sold 5 times on average.
        return acc + (item.price || 0) * 5;
    }, 0) || 0;

    const totalListings = listings?.length || 0;
    const totalSales = Math.floor(totalListings * 5.8); // Mock data

    return (
        <div className="grid gap-6 md:grid-cols-3">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">${totalRevenue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month (mock data)</p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalListings}</div>
                <p className="text-xs text-muted-foreground">The total number of items you have listed.</p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">+{totalSales.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+19% from last month (mock data)</p>
            </CardContent>
            </Card>
      </div>
    )
}

    