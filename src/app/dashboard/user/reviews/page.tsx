'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collectionGroup, query, where, orderBy } from 'firebase/firestore';
import type { Review } from '@/lib/types';
import { Loader2, LogIn } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';

export default function UserReviewsPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    // This is a more complex query. It scans ALL 'reviews' subcollections across
    // both 'products' and 'courses' top-level collections for documents where
    // the userId matches the current user.
    const reviewsQuery = useMemoFirebase(() => {
        if (!user) return null;
        
        // Query across all 'reviews' collection groups
        const reviewsCollectionGroup = collectionGroup(firestore, 'reviews');
        
        return query(
            reviewsCollectionGroup, 
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );

    }, [firestore, user]);

    const { data: reviews, isLoading } = useCollection<Review>(reviewsQuery);

    if (isUserLoading || (isLoading && user)) {
        return (
            <div className="flex items-center justify-center h-full py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Loading your reviews...</p>
            </div>
        );
    }

    if (!user) {
         return (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <h2 className="text-2xl font-semibold">Please Log In</h2>
                <p className="text-muted-foreground mt-2">You need to be logged in to view your reviews.</p>
                <Button asChild className="mt-6">
                    <Link href="/login"><LogIn className="mr-2 h-4 w-4" /> Log In</Link>
                </Button>
            </div>
        );
    }
    
    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold font-headline">My Reviews</h1>
                <p className="text-muted-foreground">A history of all the feedback you've shared.</p>
            </header>

            {reviews && reviews.length > 0 ? (
                <div className="space-y-6">
                    {reviews.map(review => (
                        <Card key={review.id}>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    <Link className="hover:underline" href={`/${review.itemType}s/${review.itemId}`}>
                                        {review.itemName}
                                    </Link>
                                </CardTitle>
                                <CardDescription>
                                    Reviewed {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`h-5 w-5 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`}
                                    />
                                    ))}
                                </div>
                                <p className="text-muted-foreground italic">"{review.comment}"</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                 <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <h2 className="text-2xl font-semibold">You haven't written any reviews yet</h2>
                    <p className="text-muted-foreground mt-2">Share your thoughts on products you've purchased or courses you've taken.</p>
                    <Button asChild className="mt-6">
                        <Link href="/dashboard/user">View My Orders &amp; Courses</Link>
                    </Button>
                </div>
            )}
        </div>
    )
}
