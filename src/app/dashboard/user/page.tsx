'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Recommendations from '@/components/dashboard/user/recommendations';
import { useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Order, Enrollment } from '@/lib/types';
import UserCourses from '@/components/dashboard/user/user-courses';

export default function UserDashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const ordersQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'orders'),
      orderBy('orderDate', 'desc'),
      limit(5)
    );
  }, [firestore, user]);

  const enrollmentsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'users', user.uid, 'enrollments');
  }, [firestore, user]);

  const { data: orders, isLoading: isLoadingOrders } = useCollection<Order>(ordersQuery);
  const { data: enrollments, isLoading: isLoadingEnrollments } = useCollection<Enrollment>(enrollmentsQuery);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold font-headline">User Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.displayName || user?.email}! Here's an overview of your account.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>My Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingOrders ? (
              <p>Loading orders...</p>
            ) : orders && orders.length > 0 ? (
              <ul className="space-y-4">
                {orders.map(order => (
                  <li key={order.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Order #{order.id.substring(0, 7)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${order.totalAmount.toFixed(2)}</p>
                      <Badge variant={order.status === 'Delivered' ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">You haven't placed any orders yet.</p>
            )}
          </CardContent>
        </Card>
        
        <UserCourses enrollments={enrollments} isLoading={isLoadingEnrollments} />

      </div>

      <Recommendations />
    </div>
  );
}
