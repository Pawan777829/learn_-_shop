'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { allItems } from "@/lib/data";

const mockSales = [
    {
        name: "Olivia Martin",
        email: "olivia.martin@email.com",
        amount: 1999.00,
        item: allItems[0],
    },
    {
        name: "Jackson Lee",
        email: "jackson.lee@email.com",
        amount: 39.00,
        item: allItems[1],
    },
    {
        name: "Isabella Nguyen",
        email: "isabella.nguyen@email.com",
        amount: 299.00,
        item: allItems[2],
    },
    {
        name: "William Kim",
        email: "will@email.com",
        amount: 99.00,
        item: allItems[3],
    },
    {
        name: "Sofia Davis",
        email: "sofia.davis@email.com",
        amount: 39.00,
        item: allItems[4],
    },
];


export default function RecentSales() {
  return (
    <div className="space-y-8">
      {mockSales.map((sale, index) => (
        <div className="flex items-center" key={index}>
            <Avatar className="h-9 w-9">
            <AvatarFallback>{sale.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{sale.name}</p>
                <p className="text-sm text-muted-foreground">{sale.email}</p>
            </div>
            <div className="ml-auto font-medium">+${sale.amount.toFixed(2)}</div>
      </div>
      ))}
    </div>
  );
}

    