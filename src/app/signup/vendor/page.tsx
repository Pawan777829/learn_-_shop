'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, writeBatch } from 'firebase/firestore';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';


const vendorSignupSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required.' }),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  businessName: z.string().min(2, { message: 'Business name is required.' }),
  businessDescription: z.string().min(10, { message: 'Please provide a short business description.' }),
});

export default function VendorSignupPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();

  const form = useForm<z.infer<typeof vendorSignupSchema>>({
    resolver: zodResolver(vendorSignupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      businessName: '',
      businessDescription: '',
    },
  });

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  async function onSubmit(values: z.infer<typeof vendorSignupSchema>) {
    try {
      // 1. Create the user account
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      if (user) {
        // Use a batch write to create both user and vendor docs atomically
        const batch = writeBatch(firestore);

        // 2. Create the user document
        const userRef = doc(firestore, 'users', user.uid);
        const userData = {
          id: user.uid,
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          dateJoined: new Date().toISOString(),
        };
        batch.set(userRef, userData, { merge: true });

        // 3. Create the vendor document in the top-level 'vendors' collection
        const vendorId = user.uid; // Use user ID as vendor ID
        const vendorRef = doc(firestore, 'vendors', vendorId);
        const vendorData = {
            id: vendorId,
            userId: user.uid, // Keep userId for reference
            businessName: values.businessName,
            description: values.businessDescription,
            contactEmail: values.email,
        };
        batch.set(vendorRef, vendorData);

        // Commit the batch
        await batch.commit();

        toast({
          title: "Vendor Account Created!",
          description: "Welcome to Learn & Shop. You can now start listing items.",
        });

        // Redirect to vendor dashboard after successful registration
        router.push('/dashboard/vendor');
      }
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed') {
        toast({
            variant: 'destructive',
            title: 'Sign-up method disabled',
            description: "Email/Password sign-up is not enabled for this project. Please enable it in your Firebase Console under Authentication > Sign-in method.",
        });
      } else {
        toast({
            variant: "destructive",
            title: "Signup Failed",
            description: error.message || "An unexpected error occurred. Please try again.",
        });
      }
    }
  }

  if (isUserLoading || user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-8rem)] py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">Become a Vendor</CardTitle>
          <CardDescription>Create an account to start selling your products and courses.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <FormField control={form.control} name="firstName" render={({ field }) => (
                    <FormItem><FormLabel>Your First Name</FormLabel><FormControl><Input placeholder="John" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="lastName" render={({ field }) => (
                    <FormItem><FormLabel>Your Last Name</FormLabel><FormControl><Input placeholder="Doe" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
              </div>

               <FormField control={form.control} name="businessName" render={({ field }) => (
                <FormItem><FormLabel>Business Name</FormLabel><FormControl><Input placeholder="My Awesome Shop" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                
              <FormField control={form.control} name="businessDescription" render={({ field }) => (
                <FormItem><FormLabel>Business Description</FormLabel><FormControl><Textarea placeholder="Tell us about your business..." {...field} /></FormControl><FormMessage /></FormItem>
                )}/>

              <div className="border-t pt-4 space-y-4">
                <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Login Email</FormLabel><FormControl><Input placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating Account..." : "Register as Vendor"}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Log In
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
