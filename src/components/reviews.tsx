'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, where, orderBy, getDocs, collectionGroup } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { Review, Order } from '@/lib/types';
import ReviewCard from './review-card';
import { Star, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

const reviewSchema = z.object({
  rating: z.number().min(1, 'Rating is required').max(5),
  comment: z.string().min(10, 'Comment must be at least 10 characters'),
});

type ReviewsProps = {
  itemId: string;
  itemType: 'product' | 'course';
};

export default function Reviews({ itemId, itemType }: ReviewsProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isCheckingPurchase, setIsCheckingPurchase] = useState(true);
  const [hasPurchased, setHasPurchased] = useState(false);

  const reviewsCollectionPath = itemType === 'product' ? `products/${itemId}/reviews` : `courses/${itemId}/reviews`;

  const reviewsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, reviewsCollectionPath), orderBy('createdAt', 'desc'));
  }, [firestore, reviewsCollectionPath]);

  const { data: reviews, isLoading: isLoadingReviews } = useCollection<Review>(reviewsQuery);
  
  useEffect(() => {
    const checkPurchase = async () => {
        if (!user || !firestore) {
            setIsCheckingPurchase(false);
            return;
        }

        setIsCheckingPurchase(true);
        let purchased = false;
        try {
            if (itemType === 'product') {
                const ordersCollectionRef = collection(firestore, `users/${user.uid}/orders`);
                const ordersSnapshot = await getDocs(ordersCollectionRef);
                for (const orderDoc of ordersSnapshot.docs) {
                    const order = orderDoc.data() as Order;
                    if (order.items && order.items.some(item => item.id === itemId)) {
                        purchased = true;
                        break;
                    }
                }
            } else { // 'course'
                const enrollmentsRef = collection(firestore, `users/${user.uid}/enrollments`);
                const q = query(enrollmentsRef, where('courseId', '==', itemId));
                const enrollmentsSnapshot = await getDocs(q);
                if (!enrollmentsSnapshot.empty) {
                    purchased = true;
                }
            }
        } catch (error) {
            console.error("Error checking purchase status:", error);
        }
        
        setHasPurchased(purchased);
        setIsCheckingPurchase(false);
    };

    checkPurchase();
  }, [user, firestore, itemId, itemType]);


  const form = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });

  const selectedRating = form.watch('rating');

  function onSubmit(values: z.infer<typeof reviewSchema>) {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to submit a review.' });
      return;
    }

    const reviewsRef = collection(firestore, reviewsCollectionPath);
    const reviewData = {
      ...values,
      userId: user.uid,
      userName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
      itemId: itemId,
      createdAt: new Date().toISOString(),
    };

    addDocumentNonBlocking(reviewsRef, reviewData);
    toast({ title: 'Review Submitted!', description: 'Thanks for your feedback.' });
    form.reset();
  }

  const canShowReviewForm = user && !isCheckingPurchase && hasPurchased;

  return (
    <div className="mt-12 space-y-8">
      <h2 className="text-2xl font-bold font-headline">Customer Reviews</h2>
      
      {canShowReviewForm && (
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Rating</FormLabel>
                    <FormControl>
                      <div
                        className="flex items-center gap-1"
                        onMouseLeave={() => setHoveredRating(0)}
                      >
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-6 w-6 cursor-pointer transition-colors ${
                              (hoveredRating || selectedRating) > i
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-muted-foreground'
                            }`}
                            onMouseEnter={() => setHoveredRating(i + 1)}
                            onClick={() => field.onChange(i + 1)}
                          />
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Comment</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Share your thoughts on this item..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </form>
          </Form>
        </div>
      )}
      
      {isLoadingReviews ? (
         <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Loading reviews...</p>
        </div>
      ) : reviews && reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No reviews yet. Be the first to share your thoughts!</p>
      )}
    </div>
  );
}
