'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { allItems } from '@/lib/data';
import { getImageById } from '@/lib/placeholder-images';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ItemCard from '@/components/item-card';
import Reviews from '@/components/reviews';

export default function ProductDetailPage() {
  const { id } = useParams() as { id: string };
  const { addToCart } = useCart();
  const product = allItems.find(item => item.id === id && item.type === 'product');
  const placeholder = product ? getImageById(product.imageId) : null;
  const relatedProducts = allItems.filter(item => item.type === 'product' && item.id !== id).slice(0, 4);

  if (!product || !placeholder) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <p className="text-muted-foreground mt-2">The product you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <div className="relative aspect-video overflow-hidden rounded-lg shadow-lg">
            <Image
              src={placeholder.imageUrl}
              alt={placeholder.description}
              fill
              className="object-cover"
              data-ai-hint={placeholder.imageHint}
            />
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <Badge variant="secondary" className="w-fit mb-2">{product.type}</Badge>
          <h1 className="text-3xl lg:text-4xl font-bold font-headline">{product.name}</h1>
          <p className="text-lg text-muted-foreground mt-2">By {product.vendor}</p>
          <div className="flex items-center gap-2 mt-4">
            <div className="flex items-center text-amber-500">
              {[...Array(Math.floor(product.rating))].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
              {product.rating % 1 !== 0 && <Star className="w-5 h-5 fill-current" style={{ clipPath: `inset(0 ${100 - (product.rating % 1) * 100}% 0 0)` }} />}
              {[...Array(5 - Math.ceil(product.rating))].map((_, i) => <Star key={i} className="w-5 h-5" />)}
            </div>
            <span className="text-muted-foreground text-sm">{product.rating} / 5</span>
          </div>
          <p className="mt-6 text-foreground/80 text-base leading-relaxed">{product.description}</p>
          <p className="text-4xl font-bold text-primary mt-6">${product.price.toFixed(2)}</p>
          <div className="mt-8">
            <Button size="lg" className="h-12 text-lg w-full sm:w-auto" onClick={() => addToCart(product)}>
              <ShoppingCart className="mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>

      <Reviews itemId={id} itemType="product" />

      <div className="mt-20">
          <h2 className="text-2xl font-bold font-headline mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(item => (
                  <ItemCard key={item.id} item={item} />
              ))}
          </div>
      </div>
    </div>
  );
}

    