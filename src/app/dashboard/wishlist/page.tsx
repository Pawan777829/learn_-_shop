'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { WishlistItem, Item } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ItemCard from '@/components/item-card';
import { allItems } from '@/lib/data';
import { useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function WishlistPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const wishlistQuery = useMemoFirebase(() => {
        if (!user) return null;
        return collection(firestore, 'users', user.uid, 'wishlist');
    }, [firestore, user]);

    const { data: wishlistItems, isLoading } = useCollection<WishlistItem>(wishlistQuery);
    
    const populatedWishlist = useMemo(() => {
        if (!wishlistItems) return [];
        
        return wishlistItems.map(wishlistItem => {
            return allItems.find(item => item.id === wishlistItem.itemId);
        }).filter((item): item is Item => !!item);

    }, [wishlistItems]);


    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Loading your wishlist...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold font-headline">My Wishlist</h1>
                <p className="text-muted-foreground">
                    Your saved products and courses for later.
                </p>
            </header>

            {populatedWishlist && populatedWishlist.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {populatedWishlist.map(item => (
                        <ItemCard key={item.id} item={item} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <h2 className="text-2xl font-semibold">Your wishlist is empty</h2>
                    <p className="text-muted-foreground mt-2">Browse items and add them to your wishlist!</p>
                    <Button asChild className="mt-6">
                        <Link href="/search">Explore Items</Link>
                    </Button>
                </div>
            )}
        </div>
    )
}

    