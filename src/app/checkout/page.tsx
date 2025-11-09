'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCart } from '@/context/cart-context';
import { useUser, useFirestore, setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

const checkoutSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    zip: z.string().min(5, 'ZIP code must be 5 digits'),
    cardNumber: z.string().min(16, 'Card number must be 16 digits').max(16, 'Card number must be 16 digits'),
    expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Expiry date must be MM/YY'),
    cvc: z.string().min(3, 'CVC must be 3 digits').max(4, 'CVC can be at most 4 digits'),
});

export default function CheckoutPage() {
    const { cartItems, clearCart } = useCart();
    const { user } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shipping = subtotal > 0 ? 15.00 : 0;
    const total = subtotal + shipping;

    const form = useForm<z.infer<typeof checkoutSchema>>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            address: '',
            city: '',
            zip: '',
            cardNumber: '',
            expiryDate: '',
            cvc: '',
        },
    });

    async function onSubmit(values: z.infer<typeof checkoutSchema>) {
        if (!user || !firestore) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'You must be logged in to place an order.',
            });
            return;
        }

        const orderId = uuidv4();
        const orderRef = doc(firestore, 'users', user.uid, 'orders', orderId);

        const orderData = {
            id: orderId,
            userId: user.uid,
            orderDate: new Date().toISOString(),
            totalAmount: total,
            status: 'Processing',
            shippingInfo: {
                firstName: values.firstName,
                lastName: values.lastName,
                address: values.address,
                city: values.city,
                zip: values.zip,
            },
        };
        
        // Create the order document first
        setDocumentNonBlocking(orderRef, orderData, { merge: false });

        // Then, add each cart item as a document in the 'orderItems' subcollection
        const orderItemsRef = collection(firestore, 'users', user.uid, 'orders', orderId, 'orderItems');
        cartItems.forEach(item => {
            const itemToSave = {
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                type: item.type,
                category: item.category,
                vendor: item.vendor,
                imageId: item.imageId,
            };
            addDocumentNonBlocking(orderItemsRef, itemToSave);
        });
        
        // For each course in cart, create an enrollment
        const enrollmentsRef = collection(firestore, 'users', user.uid, 'enrollments');
        cartItems.filter(item => item.type === 'course').forEach(course => {
            const enrollmentId = course.id; // Use course ID as enrollment ID for simplicity
            const enrollmentRef = doc(enrollmentsRef, enrollmentId);
            const enrollmentData = {
                id: enrollmentId,
                userId: user.uid,
                courseId: course.id,
                enrollmentDate: new Date().toISOString(),
                progress: 0,
            };
            setDocumentNonBlocking(enrollmentRef, enrollmentData, { merge: false });
        });

        toast({
            title: 'Order Placed!',
            description: 'Thank you for your purchase.',
        });

        clearCart();
        router.push(`/dashboard/user/orders/${orderId}`);
    }

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-bold">Your cart is empty.</h1>
                <p className="text-muted-foreground mt-2">Add items to your cart to proceed to checkout.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold font-headline mb-6 text-center">Checkout</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Shipping Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="firstName" render={({ field }) => (
                                        <FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="John" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="lastName" render={({ field }) => (
                                        <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Doe" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </div>
                                <FormField control={form.control} name="address" render={({ field }) => (
                                    <FormItem><FormLabel>Address</FormLabel><FormControl><Input placeholder="123 Main St" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-2">
                                        <FormField control={form.control} name="city" render={({ field }) => (
                                            <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="Anytown" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                    <FormField control={form.control} name="zip" render={({ field }) => (
                                        <FormItem><FormLabel>ZIP Code</FormLabel><FormControl><Input placeholder="12345" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField control={form.control} name="cardNumber" render={({ field }) => (
                                    <FormItem><FormLabel>Card Number</FormLabel><FormControl><Input placeholder="**** **** **** 1234" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="expiryDate" render={({ field }) => (
                                        <FormItem><FormLabel>Expiry Date</FormLabel><FormControl><Input placeholder="MM/YY" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="cvc" render={({ field }) => (
                                        <FormItem><FormLabel>CVC</FormLabel><FormControl><Input placeholder="123" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex justify-between">
                                        <span>{item.name} x{item.quantity}</span>
                                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                                <Separator />
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Shipping</span>
                                    <span>${shipping.toFixed(2)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </CardContent>
                        </Card>
                        <Button type="submit" size="lg" className="w-full text-lg h-12" disabled={cartItems.length === 0 || form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? 'Processing...' : `Place Order for $${total.toFixed(2)}`}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
