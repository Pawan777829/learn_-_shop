'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUser, useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking } from "@/firebase";
import { collection, doc, collectionGroup, query, where, getDocs } from "firebase/firestore";
import type { Item, Order, OrderItem, UserProfile } from "@/lib/types";
import { Edit, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import AnalyticsOverview from "@/components/dashboard/vendor/analytics-overview";
import RevenueChart from "@/components/dashboard/vendor/revenue-chart";
import RecentSales from "@/components/dashboard/vendor/recent-sales";

export type VendorSale = {
    orderId: string;
    item: OrderItem;
    user: UserProfile | null;
    orderDate: string;
}

export default function VendorDashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [sales, setSales] = useState<VendorSale[]>([]);
  const [isSalesLoading, setIsSalesLoading] = useState(true);

  // Fetch all of the vendor's own listings
  const productsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'vendors', user.uid, 'products');
  }, [firestore, user]);

  const coursesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'vendors', user.uid, 'courses');
  }, [firestore, user]);

  const { data: products, isLoading: isLoadingProducts } = useCollection<Item>(productsQuery);
  const { data: courses, isLoading: isLoadingCourses } = useCollection<Item>(coursesQuery);

  const allListings = useMemo(() => {
    const combined: Item[] = [];
    if (products) combined.push(...products.map(p => ({...p, type: 'product' as const})));
    if (courses) combined.push(...courses.map(c => ({...c, type: 'course' as const})));
    return combined.map((item, index) => ({...item, uniqueId: item.id || `item-${index}`}));
  }, [products, courses]);

  // This is a complex effect to find all sales related to this vendor.
  // It queries all 'orderItems' collections across all users.
  useEffect(() => {
    const fetchSales = async () => {
        if (!user || !firestore || allListings.length === 0) {
            setIsSalesLoading(false);
            return;
        };

        setIsSalesLoading(true);
        const vendorSales: VendorSale[] = [];
        const vendorItemIds = new Set(allListings.map(item => item.id));

        try {
            // Query all 'orderItems' subcollections in the entire database
            const orderItemsGroupRef = collectionGroup(firestore, 'orderItems');
            // Find order items where the item ID is one of the vendor's items
            const q = query(orderItemsGroupRef, where('id', 'in', Array.from(vendorItemIds)));
            const querySnapshot = await getDocs(q);

            const userPromises: Promise<void>[] = [];

            for (const itemDoc of querySnapshot.docs) {
                const item = itemDoc.data() as OrderItem;
                const orderRef = itemDoc.ref.parent.parent; // Gives the /orders/{orderId} document
                
                if (orderRef) {
                    const orderDoc = await getDocs(query(collection(firestore, orderRef.path)));
                    const orderData = orderDoc.docs[0].data() as Order;
                    const userRef = doc(firestore, 'users', orderData.userId);
                    
                    // Create a promise to fetch user data and resolve sales details
                    const userPromise = getDocs(query(collection(firestore, userRef.path))).then(userSnapshot => {
                        const userData = userSnapshot.docs[0].data() as UserProfile;
                         vendorSales.push({
                            orderId: orderData.id,
                            item: item,
                            user: userData,
                            orderDate: orderData.orderDate,
                        });
                    });
                    userPromises.push(userPromise);
                }
            }
            await Promise.all(userPromises);
            setSales(vendorSales);

        } catch (error) {
            console.error("Error fetching vendor sales:", error);
            toast({ variant: 'destructive', title: 'Could not load sales data.' });
        } finally {
            setIsSalesLoading(false);
        }
    }

    if (!isLoadingProducts && !isLoadingCourses) {
        fetchSales();
    }
  }, [user, firestore, allListings, toast, isLoadingProducts, isLoadingCourses]);

  const handleDelete = () => {
    if (!itemToDelete || !user) return;
    
    const collectionName = itemToDelete.type === 'product' ? 'products' : 'courses';
    const docRef = doc(firestore, 'vendors', user.uid, collectionName, itemToDelete.id);

    deleteDocumentNonBlocking(docRef);

    toast({
        title: "Listing Deleted",
        description: `${itemToDelete.name} has been removed.`,
    });
    setItemToDelete(null);
  };
  
  const isLoading = isLoadingProducts || isLoadingCourses || isSalesLoading;

  if (!user) {
    return (
        <div className="flex items-center justify-center h-full">
            <p>Please log in to view your vendor dashboard.</p>
        </div>
    )
  }

  return (
    <>
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold font-headline">Vendor Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your listings and track your sales performance.
        </p>
      </header>

      <AnalyticsOverview listings={allListings} sales={sales} isLoading={isLoading}/>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
            <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <RevenueChart sales={sales} isLoading={isLoading}/>
            </CardContent>
        </Card>
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>Your most recent transactions.</CardDescription>
            </CardHeader>
            <CardContent>
                <RecentSales sales={sales} isLoading={isLoading}/>
            </CardContent>
        </Card>
      </div>


      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>My Listings</CardTitle>
            <CardDescription>
              A list of all your products and courses.
            </CardDescription>
          </div>
          <Button asChild>
            <Link href="/dashboard/vendor/new-listing">Add New Listing</Link>
          </Button>
        </CardHeader>
        <CardContent>
           {isLoadingProducts || isLoadingCourses ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
           ): (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allListings && allListings.length > 0 ? (
                  allListings.map((item) => (
                    <TableRow key={item.uniqueId}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant={item.type === 'product' ? 'secondary' : 'default'}>{item.type}</Badge>
                      </TableCell>
                      <TableCell>${item.price.toFixed(2)}</TableCell>
                      <TableCell>{item.stock ?? 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={`/dashboard/vendor/edit-listing/${item.type}/${item.id}`}>
                                <Edit className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setItemToDelete(item)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      You haven't listed any items yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
           )}
        </CardContent>
      </Card>
    </div>
    <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your listing
                for "{itemToDelete?.name}".
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
