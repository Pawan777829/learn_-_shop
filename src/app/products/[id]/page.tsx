'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { allItems } from '@/lib/data';
import { getImageById } from '@/lib/placeholder-images';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ItemCard from '@/components/item-card';
import Reviews from '@/components/reviews';
import { useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { Item, WishlistItem } from '@/lib/types';
import { useEffect, useState } from 'react';

export default function ProductDetailPage() {
  const { id } = useParams() as { id: string };
  const { addToCart } = useCart();
  const product = allItems.find(item => item.id === id && item.type === 'product') as Item | undefined;
  const placeholder = product ? getImageById(product.imageId) : null;
  const relatedProducts = allItems.filter(item => item.type === 'product' && item.id !== id).slice(0, 4);
  
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const wishlistItemRef = useMemoFirebase(() => {
    if (!user || !product) return null;
    return doc(firestore, 'users', user.uid, 'wishlist', product.id);
  }, [firestore, user, product]);

  const { data: wishlistItem } = useDoc<WishlistItem>(wishlistItemRef);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    setIsWishlisted(!!wishlistItem);
  }, [wishlistItem]);


  const handleWishlistToggle = async () => {
    if (!user || !product || !wishlistItemRef) {
      toast({ variant: 'destructive', title: 'Please log in', description: 'You need to be logged in to manage your wishlist.' });
      return;
    }

    if (isWishlisted) {
      deleteDocumentNonBlocking(wishlistItemRef);
      toast({ title: 'Removed from Wishlist', description: `${product.name} has been removed from your wishlist.` });
    } else {
      const newItem: WishlistItem = {
        id: product.id,
        userId: user.uid,
        itemId: product.id,
        itemType: 'product',
        addedAt: new Date().toISOString(),
      };
      setDocumentNonBlocking(wishlistItemRef, newItem, { merge: false });
      toast({ title: 'Added to Wishlist', description: `${product.name} has been added to your wishlist.` });
    }
  };


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
          <div className="mt-8 flex items-center gap-4">
            <Button size="lg" className="h-12 text-lg sm:w-auto flex-grow" onClick={() => addToCart(product)}>
              <ShoppingCart className="mr-2" />
              Add to Cart
            </Button>
            <Button variant="outline" size="icon" className="h-12 w-12" onClick={handleWishlistToggle} aria-label="Add to wishlist">
                <Heart className={`h-6 w-6 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
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

    