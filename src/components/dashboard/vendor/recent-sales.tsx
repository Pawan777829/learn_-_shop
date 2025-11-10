'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { VendorSale } from "@/app/dashboard/vendor/page";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";

export default function RecentSales({ sales, isLoading }: { sales: VendorSale[], isLoading: boolean }) {
  
  const recentSales = useMemo(() => {
    return [...sales]
      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
      .slice(0, 5);
  }, [sales]);

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary"/>
        </div>
    )
  }

  if (recentSales.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-10">No sales have been made yet.</p>
  }

  return (
    <div className="space-y-8">
      {recentSales.map((sale) => (
        <div className="flex items-center" key={sale.orderId + sale.item.id}>
            <Avatar className="h-9 w-9">
              <AvatarFallback>{sale.user?.firstName?.[0]}{sale.user?.lastName?.[0]}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{sale.user?.firstName} {sale.user?.lastName}</p>
                <p className="text-sm text-muted-foreground truncate" title={sale.item.name}>{sale.item.name}</p>
            </div>
            <div className="ml-auto font-medium">+${(sale.item.price * sale.item.quantity).toFixed(2)}</div>
      </div>
      ))}
    </div>
  );
}
