'use client';

import { useEffect, useState } from 'react';
import { getFrequentlyBoughtTogether, type FrequentlyBoughtTogetherOutput } from '@/ai/flows/frequently-bought-together';
import { allItems } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getImageById } from '@/lib/placeholder-images';
import { useCart } from '@/context/cart-context';
import type { Item } from '@/lib/types';

export default function FrequentlyBoughtTogether({ productId }: { productId: string }) {
  const [recommendations, setRecommendations] = useState<FrequentlyBoughtTogetherOutput['recommendations']>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchRecommendations() {
      setIsLoading(true);
      try {
        const result = await getFrequentlyBoughtTogether({
          productId,
          allItemsJson: JSON.stringify(allItems),
        });
        setRecommendations(result.recommendations);
      } catch (error) {
        console.error('Error fetching frequently bought together:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecommendations();
  }, [productId]);

  const mainProduct = allItems.find(item => item.id === productId);

  const recommendedItems: (Item | undefined)[] = recommendations.map(rec => 
    allItems.find(item => item.id === rec.id)
  );

  const total = (mainProduct?.price || 0) + recommendedItems.reduce((sum, item) => sum + (item?.price || 0), 0);

  const handleAddAllToCart = () => {
    if (mainProduct) {
        addToCart(mainProduct, 1);
    }
    recommendedItems.forEach(item => {
        if (item) {
            addToCart(item, 1);
        }
    })
  };

  if (isLoading) {
    return (
      <div className="mt-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Finding recommendations...</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null; // Don't render anything if there are no recommendations
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold font-headline mb-6">Frequently Bought Together</h2>
      <Card>
        <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Main Product */}
                {mainProduct && <ItemDisplay item={mainProduct} isMainProduct />}

                {/* Recommended Items */}
                {recommendedItems.map((item, index) => item && (
                    <div key={item.id} className="flex items-center gap-4">
                         <Plus className="h-6 w-6 text-muted-foreground" />
                        <ItemDisplay item={item} reason={recommendations[index]?.reason}/>
                    </div>
                ))}
            
                {/* Total and Add to Cart */}
                <div className="md:ml-auto text-center md:text-left pt-4 md:pt-0">
                    <p className="text-muted-foreground">Total Price:</p>
                    <p className="text-3xl font-bold text-primary">${total.toFixed(2)}</p>
                    <Button className="mt-4" onClick={handleAddAllToCart}>
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Add all to cart
                    </Button>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ItemDisplay({ item, reason, isMainProduct = false }: { item: Item, reason?: string, isMainProduct?: boolean }) {
    const placeholder = getImageById(item.imageId);
    
    return (
        <div className="flex flex-col items-center text-center max-w-40">
            <Link href={`/${item.type}s/${item.id}`}>
                <div className="relative w-24 h-24 mb-2">
                    {placeholder && (
                        <Image
                            src={placeholder.imageUrl}
                            alt={item.name}
                            fill
                            className="rounded-md object-cover"
                            data-ai-hint={placeholder.imageHint}
                        />
                    )}
                </div>
                <p className="text-sm font-medium hover:underline line-clamp-2">{item.name}</p>
            </Link>
             <p className="text-sm font-bold text-primary">${item.price.toFixed(2)}</p>
             {reason && <p className="text-xs text-muted-foreground mt-1 line-clamp-3">"{reason}"</p>}
        </div>
    )
}
