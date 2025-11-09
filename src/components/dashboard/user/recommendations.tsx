'use client';

import { useState, useMemo } from 'react';
import { Wand2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getPersonalizedRecommendations } from '@/ai/flows/personalized-recommendations';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { Order, Enrollment } from '@/lib/types';
import { collection, query } from 'firebase/firestore';

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();

  const ordersQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'users', user.uid, 'orders'));
  }, [firestore, user]);

  const enrollmentsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'users', user.uid, 'enrollments'));
  }, [firestore, user]);

  const { data: orders, isLoading: isLoadingOrders } = useCollection<Order>(ordersQuery);
  const { data: enrollments, isLoading: isLoadingEnrollments } = useCollection<Enrollment>(enrollmentsQuery);

  const userHistory = useMemo(() => {
    if (isLoadingOrders || isLoadingEnrollments || !orders || !enrollments) {
      return '';
    }

    let history = '';

    if (orders.length > 0) {
      const productNames = orders.flatMap(order => order.items.map(item => item.name)).join(', ');
      history += `The user has previously purchased these products: ${productNames}. `;
    } else {
      history += 'The user has not purchased any products yet. ';
    }
    
    if (enrollments.length > 0) {
      // NOTE: For a real app, we would fetch course names from the courseId.
      // For this demo, we'll just use the count.
      history += `The user is enrolled in ${enrollments.length} course(s).`;
    } else {
       history += 'The user is not enrolled in any courses yet.';
    }

    return history;
  }, [orders, enrollments, isLoadingOrders, isLoadingEnrollments]);


  async function handleGetRecommendations() {
    setLoading(true);
    setRecommendations('');
    try {
      const result = await getPersonalizedRecommendations({
        userHistory: userHistory || "The user has no purchase or enrollment history yet.",
        userPreferences:
          'Interested in technology, programming, productivity tools, and personal health.',
      });
      setRecommendations(result.recommendations);
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      setRecommendations(
        "Sorry, we couldn't fetch recommendations at this time. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Personalized Recommendations</CardTitle>
          <CardDescription>
            AI-powered suggestions based on your activity.
          </CardDescription>
        </div>
        <Button onClick={handleGetRecommendations} disabled={loading || isLoadingOrders || isLoadingEnrollments}>
          {loading || isLoadingOrders || isLoadingEnrollments ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          Generate
        </Button>
      </CardHeader>
      <CardContent>
        <div className="min-h-[6rem] p-4 bg-muted rounded-lg flex items-center justify-center">
          {loading && (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          )}
          {isLoadingOrders || isLoadingEnrollments && !loading && (
             <p className="text-center text-muted-foreground">
              Analyzing your history...
            </p>
          )}
          {!loading && recommendations && (
            <p className="text-center text-foreground">{recommendations}</p>
          )}
          {!loading && !recommendations && !isLoadingOrders && !isLoadingEnrollments && (
            <p className="text-center text-muted-foreground">
              Click "Generate" to see your personalized recommendations.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
