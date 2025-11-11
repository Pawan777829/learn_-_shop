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
import { useAuth, useFirestore } from '@/firebase';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  User,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import { useUser } from '@/firebase';
import { useEffect, useState, useRef } from 'react';
import { Separator } from '@/components/ui/separator';
import { Chrome } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const emailLoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

const phoneLoginSchema = z.object({
    phoneNumber: z.string().min(10, 'Please enter a valid phone number with country code.'),
});

const otpSchema = z.object({
    otp: z.string().min(6, 'OTP must be 6 digits.'),
});


export default function LoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isSubmittingOtp, setIsSubmittingOtp] = useState(false);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);


  const emailForm = useForm<z.infer<typeof emailLoginSchema>>({
    resolver: zodResolver(emailLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const phoneForm = useForm<z.infer<typeof phoneLoginSchema>>({
      resolver: zodResolver(phoneLoginSchema),
      defaultValues: { phoneNumber: '' },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
      resolver: zodResolver(otpSchema),
      defaultValues: { otp: '' },
  });


  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (auth && !recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'invisible',
        });
    }
  }, [auth]);


  // Helper function to create a user profile if it doesn't exist
  const createUserProfileIfNotExists = async (user: User) => {
    const userRef = doc(firestore, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      const { displayName, email, phoneNumber } = user;
      const firstName = displayName?.split(' ')[0] || '';
      const lastName = displayName?.split(' ').slice(1).join(' ') || '';
      
      const userData = {
        id: user.uid,
        firstName: firstName,
        lastName: lastName,
        email: email,
        phoneNumber: phoneNumber,
        dateJoined: new Date().toISOString(),
      };
      setDocumentNonBlocking(userRef, userData, { merge: true });
    }
  };

  async function onEmailSubmit(values: z.infer<typeof emailLoginSchema>) {
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

  async function onPhoneSubmit(values: z.infer<typeof phoneLoginSchema>) {
      if (!recaptchaVerifierRef.current) {
          toast({ variant: 'destructive', title: 'Error', description: 'Recaptcha not initialized.' });
          return;
      }
      try {
          const confirmation = await signInWithPhoneNumber(auth, values.phoneNumber, recaptchaVerifierRef.current);
          setConfirmationResult(confirmation);
          toast({ title: 'OTP Sent!', description: 'Please check your phone for the verification code.' });
      } catch (error: any) {
          console.error("Phone sign in error", error);
          toast({ variant: 'destructive', title: 'Failed to send OTP', description: error.message });
          // Reset recaptcha
          recaptchaVerifierRef.current.render().then((widgetId) => {
            if(auth) {
              // @ts-ignore
              window.grecaptcha.reset(widgetId);
            }
          });
      }
  }

  async function onOtpSubmit(values: z.infer<typeof otpSchema>) {
      if (!confirmationResult) {
          toast({ variant: 'destructive', title: 'Error', description: 'Please request an OTP first.' });
          return;
      }
      setIsSubmittingOtp(true);
      try {
          const result = await confirmationResult.confirm(values.otp);
          await createUserProfileIfNotExists(result.user);
      } catch (error: any) {
          toast({ variant: 'destructive', title: 'Invalid OTP', description: 'The code you entered is incorrect. Please try again.' });
      } finally {
          setIsSubmittingOtp(false);
      }
  }
  
   async function onGoogleSignIn() {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        await createUserProfileIfNotExists(result.user);
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
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="phone">Phone</TabsTrigger>
            </TabsList>
            <TabsContent value="email">
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-6 pt-4">
                  <FormField control={emailForm.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                  )} />
                  <FormField control={emailForm.control} name="password" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                  )} />
                  <Button type="submit" className="w-full" size="lg" disabled={emailForm.formState.isSubmitting}>
                    {emailForm.formState.isSubmitting ? 'Logging In...' : 'Log In with Email'}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            <TabsContent value="phone">
               {!confirmationResult ? (
                  <Form {...phoneForm}>
                    <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-6 pt-4">
                      <FormField control={phoneForm.control} name="phoneNumber" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl><Input placeholder="+1 123 456 7890" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <Button type="submit" className="w-full" size="lg" disabled={phoneForm.formState.isSubmitting}>
                          {phoneForm.formState.isSubmitting ? 'Sending...' : 'Send OTP'}
                      </Button>
                    </form>
                  </Form>
               ) : (
                  <Form {...otpForm}>
                     <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-6 pt-4">
                        <FormField control={otpForm.control} name="otp" render={({ field }) => (
                            <FormItem>
                                <FormLabel>One-Time Password</FormLabel>
                                <FormControl><Input placeholder="123456" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <Button type="submit" className="w-full" size="lg" disabled={isSubmittingOtp}>
                            {isSubmittingOtp ? 'Verifying...' : 'Verify OTP & Log In'}
                        </Button>
                        <Button variant="link" size="sm" onClick={() => setConfirmationResult(null)}>Use a different phone number</Button>
                     </form>
                  </Form>
               )}
            </TabsContent>
          </Tabs>

           <div id="recaptcha-container"></div>
           
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
