'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, TrendingUp, Loader2 } from 'lucide-react';
import type { Item } from '@/lib/types';
import type { VendorSale } from '@/app/dashboard/vendor/page';

export default function AnalyticsOverview({ listings, sales, isLoading }: { listings: Item[], sales: VendorSale[], isLoading: boolean }) {

    const totalRevenue = sales.reduce((acc, sale) => {
        return acc + (sale.item.price * sale.item.quantity);
    }, 0);

    const totalListings = listings?.length || 0;
    const totalSales = sales.reduce((acc, sale) => acc + sale.item.quantity, 0);

    const StatCard = ({ title, value, icon: Icon, note }: { title: string, value: string, icon: React.ElementType, note: string }) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                    <>
                        <div className="text-2xl font-bold">{value}</div>
                        <p className="text-xs text-muted-foreground">{note}</p>
                    </>
                )}
            </CardContent>
        </Card>
    );

    return (
        <div className="grid gap-6 md:grid-cols-3">
            <StatCard 
                title="Total Revenue"
                value={`$${totalRevenue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
                icon={DollarSign}
                note="Revenue generated from all sales."
            />
            <StatCard 
                title="Total Items Sold"
                value={`+${totalSales.toLocaleString()}`}
                icon={TrendingUp}
                note="Total number of individual items sold."
            />
            <StatCard 
                title="Active Listings"
                value={totalListings.toString()}
                icon={Package}
                note="The total number of items you have listed."
            />
      </div>
    )
}
