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
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useUser } from '@/firebase';
import { useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { Chrome } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    try {
        await signInWithEmailAndPassword(auth, values.email, values.password);
    } catch (error: any) {
        if (error.code === 'auth/operation-not-allowed') {
            toast({
                variant: 'destructive',
                title: 'Sign-in method disabled',
                description: "Email/Password sign-in is not enabled for this project. Please enable it in your Firebase Console under Authentication > Sign-in method.",
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: error.message || 'An unexpected error occurred.',
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
          <CardTitle className="text-3xl font-headline">Log In</CardTitle>
          <CardDescription>Access your Learn & Shop account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                {form.formState.isSubmitting ? 'Logging In...' : 'Log In'}
              </Button>
            </form>
          </Form>
           <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-card px-2 text-sm text-muted-foreground">OR</span>
          </div>
          <Button variant="outline" className="w-full" size="lg" onClick={onGoogleSignIn}>
            <Chrome className="mr-2 h-5 w-5" />
            Sign in with Google
          </Button>
          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-medium text-primary hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
