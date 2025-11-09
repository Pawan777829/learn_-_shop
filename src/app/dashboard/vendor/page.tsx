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
import { collection, doc } from "firebase/firestore";
import type { Item } from "@/lib/types";
import { DollarSign, Package, BookOpen, Loader2, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function VendorDashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);

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

  const isLoading = isLoadingProducts || isLoadingCourses;

  const allListings = useMemo(() => {
    const combined: Item[] = [];
    if (products) {
      combined.push(...products.map(p => ({...p, type: 'product' as const})));
    }
    if (courses) {
      combined.push(...courses.map(c => ({...c, type: 'course' as const})));
    }
    // Add id to each item for key prop and deletion logic
    return combined.map((item, index) => ({...item, uniqueId: item.id || `item-${index}`}));
  }, [products, courses]);

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


  const totalRevenue = allListings?.reduce((acc, item) => {
      // This is a mock calculation, a real app would track sales.
      // Here we just sum up the prices of listed items.
      return acc + (item.price || 0);
  }, 0) || 0;
  const totalListings = allListings?.length || 0;
  const productCount = products?.length || 0;
  const courseCount = courses?.length || 0;
  
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

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month (mock data)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalListings}</div>
            <p className="text-xs text-muted-foreground">{productCount} products, {courseCount} courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+1,234</div>
            <p className="text-xs text-muted-foreground">+19% from last month (mock data)</p>
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
           {isLoading ? (
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
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
