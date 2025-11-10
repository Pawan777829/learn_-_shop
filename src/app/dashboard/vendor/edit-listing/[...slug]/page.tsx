'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useParams, useRouter } from 'next/navigation';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { placeholderImages } from '@/lib/placeholder-images';
import type { ItemCategory, Item } from '@/lib/types';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const categories: ItemCategory[] = [
  'Electronics',
  'Computers & Accessories',
  'Mobiles & Accessories',
  'Home & Kitchen',
  'Home Appliances',
  'Fashion',
  'Beauty & Personal Care',
  'Health & Household',
  'Sports & Outdoors',
  'Books',
  'Toys & Games',
  'Automotive',
  'Art & Crafts',
  'Software',
  'Courses',
  'Lifestyle',
];

const listingSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  type: z.enum(['product', 'course']),
  category: z.enum(categories),
  imageId: z.string().min(1, 'Please select an image'),
  stock: z.coerce.number().optional(),
}).refine(data => {
    if (data.type === 'product') {
        return data.stock !== undefined && data.stock >= 0;
    }
    return true;
}, {
    message: 'Stock quantity is required for products',
    path: ['stock'],
});


export default function EditListingPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const params = useParams();
    const [type, id] = Array.isArray(params.slug) ? params.slug : [];

    const collectionName = type === 'product' ? 'products' : 'courses';

    const itemRef = useMemoFirebase(() => {
        if (!user || !id) return null;
        // Path updated to top-level vendors collection
        return doc(firestore, 'vendors', user.uid, collectionName, id);
    }, [firestore, user, collectionName, id]);

    const { data: itemData, isLoading } = useDoc<Item>(itemRef);

    const form = useForm<z.infer<typeof listingSchema>>({
        resolver: zodResolver(listingSchema),
    });

    useEffect(() => {
        if (itemData) {
            form.reset({
                ...itemData,
                stock: itemData.stock ?? 0,
            });
        }
    }, [itemData, form]);

    const itemType = form.watch('type');

    async function onSubmit(values: z.infer<typeof listingSchema>) {
        if (!itemRef || !user) {
            toast({ variant: 'destructive', title: 'Error', description: 'Listing reference not found.' });
            return;
        }

        const listingData: Partial<Item> & { name: string; description: string; price: number; type: 'product' | 'course'; category: ItemCategory; imageId: string; stock?: number | undefined; vendorId: string; } = {
            ...values,
            vendorId: user.uid // Ensure vendorId is set for security rule validation
        };
        if (values.type === 'course') {
            delete listingData.stock;
        }

        setDocumentNonBlocking(itemRef, listingData, { merge: true });
        
        toast({ title: 'Listing Updated!', description: `${values.name} has been successfully updated.` });
        router.push('/dashboard/vendor');
    }
    
    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Loading listing...</p>
            </div>
        )
    }
    
    if (!itemData && !isLoading) {
        return <p>Listing not found.</p>
    }

    return (
        <Card className="max-w-3xl mx-auto">
            <CardHeader>
                <CardTitle>Edit Listing</CardTitle>
                <CardDescription>Update the details for your product or course.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField control={form.control} name="type" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Listing Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="product">Product</SelectItem>
                                        <SelectItem value="course">Course</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="e.g., Wireless Pro Headphones" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe your item in detail..." {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="price" render={({ field }) => (
                                <FormItem><FormLabel>Price ($)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            
                            {itemType === 'product' && (
                                <FormField control={form.control} name="stock" render={({ field }) => (
                                    <FormItem><FormLabel>Stock Quantity</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="category" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {categories.map(cat => (
                                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="imageId" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Image</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Select a placeholder image" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {placeholderImages.map(img => (
                                                <SelectItem key={img.id} value={img.id}>{img.description.substring(0, 40)}...</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>Select a representative placeholder image for your listing.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        
                        <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
