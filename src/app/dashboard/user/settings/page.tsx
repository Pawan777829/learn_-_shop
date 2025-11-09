'use client';

import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, updateDocumentNonBlocking, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import type { UserProfile, Address } from '@/lib/types';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { Separator } from '@/components/ui/separator';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

const addressSchema = z.object({
    id: z.string(),
    fullName: z.string().min(1, "Full name is required"),
    addressLine1: z.string().min(1, "Address is required"),
    addressLine2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zipCode: z.string().min(1, "ZIP Code is required"),
    country: z.string().min(1, "Country is required"),
});

const addressFormSchema = z.object({
  addresses: z.array(addressSchema)
});

export default function SettingsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  // --- Profile Form ---
  const userRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: userProfile, isLoading: isLoadingProfile } = useDoc<UserProfile>(userRef);
  
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: '', lastName: '' },
  });

  useEffect(() => {
    if (userProfile) {
      profileForm.reset({
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
      });
    }
  }, [userProfile, profileForm]);

  function onProfileSubmit(values: z.infer<typeof profileSchema>) {
    if (!userRef) return;
    updateDocumentNonBlocking(userRef, values);
    toast({ title: 'Profile Updated', description: 'Your changes have been saved.' });
  }

  // --- Address Form ---
  const addressesRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'addresses') : null, [firestore, user]);
  const { data: addresses, isLoading: isLoadingAddresses } = useCollection<Address>(addressesRef);

  const addressForm = useForm<z.infer<typeof addressFormSchema>>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: { addresses: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control: addressForm.control,
    name: "addresses"
  });

  useEffect(() => {
    if (addresses) {
      addressForm.reset({ addresses });
    }
  }, [addresses, addressForm]);

  const onAddressSubmit = (values: z.infer<typeof addressFormSchema>) => {
    if (!user) return;
    // This function will now handle saving all addresses, including new and updated ones
    values.addresses.forEach(addr => {
        const addressRef = doc(firestore, 'users', user.uid, 'addresses', addr.id);
        const { id, ...addressData } = addr;
        addDocumentNonBlocking(addressRef, { userId: user.uid, ...addressData, id: addr.id });
    });
    toast({ title: 'Addresses Saved', description: 'Your addresses have been updated.' });
  }
  
  const addNewAddress = () => {
    append({
        id: uuidv4(),
        fullName: '',
        addressLine1: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA',
    });
  }
  
  const removeAddress = (index: number, addressId: string) => {
    if (!user) return;
    const addressRef = doc(firestore, 'users', user.uid, 'addresses', addressId);
    deleteDocumentNonBlocking(addressRef);
    remove(index);
    toast({ title: 'Address Removed' });
  }

  const isLoading = isLoadingProfile || isLoadingAddresses;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold font-headline">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account details and preferences.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your name and contact details.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={profileForm.control} name="firstName" render={({ field }) => (
                  <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={profileForm.control} name="lastName" render={({ field }) => (
                  <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
               <FormField control={profileForm.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email</FormLabel><FormControl><Input disabled value={user?.email || ''} /></FormControl><FormMessage /></FormItem>
                )} />
              <Button type="submit" disabled={profileForm.formState.isSubmitting}>Save Changes</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Addresses</CardTitle>
          <CardDescription>Add, edit, or remove your shipping addresses.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...addressForm}>
            <form onSubmit={addressForm.handleSubmit(onAddressSubmit)} className="space-y-6">
              {fields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-md relative space-y-4">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 text-destructive"
                        onClick={() => removeAddress(index, field.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>

                     <FormField control={addressForm.control} name={`addresses.${index}.fullName`} render={({ field }) => (
                        <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                     )} />
                     <FormField control={addressForm.control} name={`addresses.${index}.addressLine1`} render={({ field }) => (
                        <FormItem><FormLabel>Address Line 1</FormLabel><FormControl><Input placeholder="123 Main St" {...field} /></FormControl><FormMessage /></FormItem>
                     )} />
                     <FormField control={addressForm.control} name={`addresses.${index}.addressLine2`} render={({ field }) => (
                        <FormItem><FormLabel>Address Line 2 (Optional)</FormLabel><FormControl><Input placeholder="Apt, suite, etc." {...field} /></FormControl><FormMessage /></FormItem>
                     )} />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <FormField control={addressForm.control} name={`addresses.${index}.city`} render={({ field }) => (
                            <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="Anytown" {...field} /></FormControl><FormMessage /></FormItem>
                         )} />
                         <FormField control={addressForm.control} name={`addresses.${index}.state`} render={({ field }) => (
                            <FormItem><FormLabel>State</FormLabel><FormControl><Input placeholder="CA" {...field} /></FormControl><FormMessage /></FormItem>
                         )} />
                         <FormField control={addressForm.control} name={`addresses.${index}.zipCode`} render={({ field }) => (
                            <FormItem><FormLabel>ZIP Code</FormLabel><FormControl><Input placeholder="12345" {...field} /></FormControl><FormMessage /></FormItem>
                         )} />
                    </div>
                  </div>
              ))}

              <div className="flex justify-between items-center">
                  <Button type="button" variant="outline" onClick={addNewAddress}>
                    Add New Address
                  </Button>
                  <Button type="submit" disabled={addressForm.formState.isSubmitting}>Save Addresses</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
