
'use client';

import Image from "next/image";
import type { Item } from "@/lib/types";
import { getImageById } from "@/lib/placeholder-images";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Plus } from "lucide-react";
import { useCart } from "@/context/cart-context";
import Link from "next/link";

type ItemCardProps = {
  item: Item;
};

export default function ItemCard({ item }: ItemCardProps) {
  const placeholder = getImageById(item.imageId);
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking the button
    e.stopPropagation();
    addToCart(item, 1);
  };

  const itemUrl = `/${item.type}s/${item.id}`;

  return (
    <Link href={itemUrl} className="group">
      <Card className="flex flex-col overflow-hidden transition-all duration-200 group-hover:shadow-lg group-hover:-translate-y-1 h-full group-active:scale-[0.98]">
        <CardHeader className="p-0 relative">
          <Badge
            className="absolute top-2 right-2 z-10"
            variant={item.type === "course" ? "default" : "secondary"}
          >
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </Badge>
          {placeholder && (
              <Image
                  src={placeholder.imageUrl}
                  alt={placeholder.description}
                  width={600}
                  height={400}
                  className="object-cover aspect-video"
                  data-ai-hint={placeholder.imageHint}
              />
          )}
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="text-lg font-headline mb-1 leading-tight">{item.name}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground line-clamp-2">
            {item.description}
          </CardDescription>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <div>
            <p className="text-xl font-semibold text-primary">${item.price.toFixed(2)}</p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              <span>{item.rating}</span>
            </div>
          </div>
          <Button size="icon" onClick={handleAddToCart} disabled={item.stock === 0}>
            <Plus className="h-5 w-5" />
            <span className="sr-only">
              {item.type === "course" ? "Enroll" : "Add to Cart"}
            </span>
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
