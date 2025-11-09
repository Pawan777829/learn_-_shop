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
  FormDescription,
} from '@/components/ui/form';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { placeholderImages } from '@/lib/placeholder-images';
import type { Item, ItemCategory } from '@/lib/types';

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


export default function NewListingPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof listingSchema>>({
        resolver: zodResolver(listingSchema),
        defaultValues: {
            name: '',
            description: '',
            price: 0,
            type: 'product',
            category: 'Electronics',
            imageId: '',
            stock: 0,
        },
    });

    const itemType = form.watch('type');

    async function onSubmit(values: z.infer<typeof listingSchema>) {
        if (!user || !firestore) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to create a listing.' });
            return;
        }

        const collectionName = values.type === 'product' ? 'products' : 'courses';
        const listingCollectionRef = collection(firestore, 'vendors', user.uid, collectionName);
        
        const listingData: Partial<Item> & { vendorId: string; vendor: string | null; rating: number; name: string; description: string; price: number; type: 'product' | 'course'; category: ItemCategory; imageId: string; stock?: number | undefined; } = {
            vendorId: user.uid,
            vendor: user.displayName || user.email,
            rating: Math.round((Math.random() * (5 - 3.5) + 3.5) * 10) / 10, // Mock rating
            ...values,
        };

        if (values.type === 'course') {
            delete listingData.stock;
        }

        addDocumentNonBlocking(listingCollectionRef, listingData);
        
        toast({ title: 'Listing Created!', description: `${values.name} has been successfully listed.` });
        router.push('/dashboard/vendor');
    }

    return (
        <Card className="max-w-3xl mx-auto">
            <CardHeader>
                <CardTitle>Create a New Listing</CardTitle>
                <CardDescription>Fill out the details for your new product or course.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField control={form.control} name="type" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Listing Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
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
                            {form.formState.isSubmitting ? 'Creating...' : 'Create Listing'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
