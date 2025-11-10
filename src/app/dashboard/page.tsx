'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [hasChecked, setHasChecked] = useState(false);

  const vendorRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'vendors', user.uid);
  }, [firestore, user]);
  
  const userRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: vendorDoc, isLoading: isVendorLoading } = useDoc(vendorRef);
  const { data: userDoc, isLoading: isUserDocLoading } = useDoc(userRef);

  useEffect(() => {
    // Wait until Firebase has checked auth state AND we have tried to fetch the user/vendor docs.
    if (isUserLoading || isVendorLoading || isUserDocLoading) {
      return;
    }

    // If the check has already been performed, do nothing to prevent loops.
    if (hasChecked) {
      return;
    }

    if (!user) {
      // If there's no authenticated user, redirect to login.
      router.replace('/login');
      setHasChecked(true);
      return;
    }

    if (vendorDoc) {
      // If a vendor document exists, they are a vendor.
      router.replace('/dashboard/vendor');
      setHasChecked(true);
    } else if (userDoc) {
      // If a user document exists, they are a regular user.
      router.replace('/dashboard/user');
      setHasChecked(true);
    }
    // If neither document exists yet, we don't redirect. The component will
    // continue showing the loading spinner, and this useEffect will re-run
    // when useDoc provides updated data. This handles the race condition for
    // new user sign-ups.

  }, [user, userDoc, vendorDoc, isUserLoading, isVendorLoading, isUserDocLoading, router, hasChecked]);

  // Render a loading state while we determine the user's role and auth status
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      <p className="ml-4 text-lg">Redirecting to your dashboard...</p>
    </div>
  );
}
