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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Chrome } from 'lucide-react';

const signupSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required.' }),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export default function SignupPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  async function onSubmit(values: z.infer<typeof signupSchema>) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      if (user) {
        // Update user profile display name
        await updateProfile(user, {
            displayName: `${values.firstName} ${values.lastName}`
        });

        // Create user document in Firestore
        const userRef = doc(firestore, 'users', user.uid);
        const userData = {
          id: user.uid,
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          dateJoined: new Date().toISOString(),
        };
        setDocumentNonBlocking(userRef, userData, { merge: true });
        toast({
          title: "Account Created!",
          description: "Welcome to Learn & Shop. You are now logged in.",
        })
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

  async function onGoogleSignIn() {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
        if (error.code === 'auth/operation-not-allowed') {
             toast({
                variant: 'destructive',
                title: 'Sign-in method disabled',
                description: "Google Sign-in is not enabled for this project. Please enable it in your Firebase Console under Authentication > Sign-in method.",
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Google Sign-in Failed',
                description: error.message || 'An unexpected error occurred.',
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
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">Create a Customer Account</CardTitle>
          <CardDescription>Join Learn & Shop today to start learning and shopping.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating Account..." : "Sign Up"}
              </Button>
            </form>
          </Form>
           <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-card px-2 text-sm text-muted-foreground">OR</span>
          </div>
          <Button variant="outline" className="w-full" size="lg" onClick={onGoogleSignIn}>
            <Chrome className="mr-2 h-5 w-5" />
            Sign up with Google
          </Button>
          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Log In
              </Link>
            </p>
             <p className="text-muted-foreground mt-2">
              Want to sell on our platform?{' '}
              <Link href="/signup/vendor" className="font-medium text-primary hover:underline">
                Become a Vendor
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
