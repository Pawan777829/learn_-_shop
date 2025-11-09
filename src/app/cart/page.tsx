'use client';

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { getImageById } from "@/lib/placeholder-images";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/cart-context";

export default function CartPage() {
    const { cartItems, removeFromCart, updateQuantity } = useCart();
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shipping = subtotal > 0 ? 15.00 : 0;
    const total = subtotal + shipping;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold font-headline mb-6">Shopping Cart</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card>
                        <CardContent className="p-6">
                            {cartItems.length === 0 ? (
                                <div className="text-center py-12">
                                    <h2 className="text-2xl font-semibold">Your cart is empty</h2>
                                    <p className="text-muted-foreground mt-2">Looks like you haven't added anything to your cart yet.</p>
                                    <Button asChild className="mt-6">
                                        <Link href="/">Continue Shopping</Link>
                                    </Button>
                                </div>
                            ) : (
                                <ul className="space-y-6">
                                    {cartItems.map((item) => {
                                        const placeholder = getImageById(item.imageId);
                                        return (
                                        <li key={item.id} className="flex flex-col sm:flex-row gap-4">
                                            {placeholder && <Image
                                                src={placeholder.imageUrl}
                                                alt={placeholder.description}
                                                width={100}
                                                height={100}
                                                className="rounded-md object-cover"
                                                data-ai-hint={placeholder.imageHint}
                                            />}
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <h3 className="font-semibold">{item.name}</h3>
                                                    <p className="text-lg font-medium text-primary">${item.price.toFixed(2)}</p>
                                                </div>
                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="flex items-center gap-2 border rounded-md p-1">
                                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}><Minus className="h-3 w-3"/></Button>
                                                        <span className="w-8 text-center">{item.quantity}</span>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus className="h-3 w-3"/></Button>
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(item.id)}>
                                                        <Trash2 className="h-5 w-5"/>
                                                    </Button>
                                                </div>
                                            </div>
                                        </li>
                                    )})}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span>${shipping.toFixed(2)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                             <div className="space-y-2">
                                <Input type="text" placeholder="Coupon Code" />
                                <Button variant="outline" className="w-full">Apply Coupon</Button>
                            </div>
                            <Separator />
                            <Button asChild size="lg" className="w-full" disabled={cartItems.length === 0}>
                                <Link href="/checkout">Proceed to Checkout</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
