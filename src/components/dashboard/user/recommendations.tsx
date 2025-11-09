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
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import type { Order, Enrollment, OrderItem, Item } from '@/lib/types';
import { collection, query, getDocs } from 'firebase/firestore';
import { allItems } from '@/lib/data';

async function fetchOrderItems(firestore: any, userId: string, orderId: string): Promise<string[]> {
    const items: string[] = [];
    const orderItemsRef = collection(firestore, 'users', userId, 'orders', orderId, 'orderItems');
    const querySnapshot = await getDocs(orderItemsRef);
    querySnapshot.forEach((doc) => {
        const item = doc.data() as OrderItem;
        items.push(item.name);
    });
    return items;
}

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
    const generateHistory = async () => {
        if (isLoadingOrders || isLoadingEnrollments || !user) {
            return '';
        }

        let history = '';
        
        if (orders && orders.length > 0) {
            const allItemNames = [];
            for (const order of orders) {
                const itemNames = await fetchOrderItems(firestore, user.uid, order.id);
                allItemNames.push(...itemNames);
            }
            if(allItemNames.length > 0){
                history += `The user has previously purchased these products: ${allItemNames.join(', ')}. `;
            }
        } else {
            history += 'The user has not purchased any products yet. ';
        }
        
        if (enrollments && enrollments.length > 0) {
            const courseNames = enrollments.map(enrollment => {
                const course = allItems.find(c => c.id === enrollment.courseId);
                return course ? course.name : '';
            }).filter(Boolean);
            if(courseNames.length > 0){
                history += `The user is enrolled in these courses: ${courseNames.join(', ')}.`;
            }
        } else {
            history += 'The user is not enrolled in any courses yet.';
        }

        return history;
    };
    
    // This is a bit of a hack to handle the async nature of fetching subcollections
    // In a real app, you might structure this differently.
    const [history, setHistory] = useState('');
    generateHistory().then(setHistory);
    return history;
    
  }, [orders, enrollments, isLoadingOrders, isLoadingEnrollments, firestore, user]);


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
