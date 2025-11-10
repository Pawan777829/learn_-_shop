'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  // Path to the potential vendor document for the current user
  const vendorRef = useMemoFirebase(() => {
    if (!user) return null;
    // The vendor document is now in a top-level 'vendors' collection,
    // with the document ID matching the user's UID.
    return doc(firestore, 'vendors', user.uid);
  }, [firestore, user]);

  const { data: vendorDoc, isLoading: isVendorLoading } = useDoc(vendorRef);

  useEffect(() => {
    if (isUserLoading || isVendorLoading) {
      // Still loading, wait for auth and firestore data
      return;
    }

    if (!user) {
      // If no user is logged in, send them to the login page
      router.replace('/login');
      return;
    }

    if (vendorDoc) {
      // If a vendor document exists, they are a vendor
      router.replace('/dashboard/vendor');
    } else {
      // Otherwise, they are a regular user
      router.replace('/dashboard/user');
    }
  }, [user, vendorDoc, isUserLoading, isVendorLoading, router]);

  // Render a loading state while we determine the user's role
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      <p className="ml-4 text-lg">Redirecting to your dashboard...</p>
    </div>
  );
}
