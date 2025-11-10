
'use client';

import { useParams } from 'next/navigation';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import type { Order, OrderItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { getImageById } from '@/lib/placeholder-images';
import Link from 'next/link';

export default function OrderDetailPage() {
    const { id: orderId } = useParams() as { id: string };
    const { user } = useUser();
    const firestore = useFirestore();

    const orderRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, 'users', user.uid, 'orders', orderId);
    }, [firestore, user, orderId]);

    const orderItemsQuery = useMemoFirebase(() => {
        if (!orderRef) return null;
        return query(collection(orderRef, 'orderItems'), orderBy('name'));
    }, [orderRef]);

    const { data: order, isLoading: isLoadingOrder } = useDoc<Order>(orderRef);
    const { data: orderItems, isLoading: isLoadingItems } = useCollection<OrderItem>(orderItemsQuery);

    const isLoading = isLoadingOrder || isLoadingItems;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Loading order details...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-10">
                <h1 className="text-2xl font-bold">Order not found</h1>
                <p className="text-muted-foreground mt-2">The order you are looking for does not exist or you do not have permission to view it.</p>
            </div>
        );
    }
    
    const subtotal = orderItems?.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0;
    const shipping = order.totalAmount > subtotal ? order.totalAmount - subtotal : 0;


    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold font-headline">Order Details</h1>
                <p className="text-muted-foreground">
                    Order #{order.id.substring(0, 7)}
                    <span className="mx-2">•</span>
                    Placed on {new Date(order.orderDate).toLocaleDateString()}
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                     <Card>
                        <CardHeader>
                            <CardTitle>Items Ordered</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {orderItems && orderItems.length > 0 ? (
                                <ul className="space-y-4">
                                    {orderItems.map(item => {
                                        const placeholder = getImageById(item.imageId);
                                        return (
                                            <li key={item.id} className="flex items-center gap-4">
                                                {placeholder && (
                                                    <Image
                                                        src={placeholder.imageUrl}
                                                        alt={item.name}
                                                        width={64}
                                                        height={64}
                                                        className="rounded-md object-cover"
                                                        data-ai-hint={placeholder.imageHint}
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <Link href={`/${item.type}s/${item.id}`} className="font-medium hover:underline">{item.name}</Link>
                                                    <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} x {item.quantity}</p>
                                                </div>
                                                <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                                            </li>
                                        )
                                    })}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground">No items found for this order.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Shipping</span>
                                <span>${shipping.toFixed(2)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>${order.totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-muted-foreground">Status</span>
                                <Badge>{order.status}</Badge>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Shipping Address</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <address className="not-italic text-muted-foreground">
                                <p className="font-semibold text-foreground">{order.shippingInfo.firstName} {order.shippingInfo.lastName}</p>
                                <p>{order.shippingInfo.address}</p>
                                <p>{order.shippingInfo.city}, {order.shippingInfo.zip}</p>
                            </address>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
