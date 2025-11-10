
'use client';
import Link from 'next/link';
import { BookOpenCheck, Twitter, Facebook, Instagram } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function Footer() {
  const { toast } = useToast();

  const handleNewsletterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = e.currentTarget.email.value;
    if (email) {
        toast({
            title: "Subscribed!",
            description: "Thanks for subscribing to our newsletter.",
        });
        e.currentTarget.reset();
    }
  };


  return (
    <footer className="bg-card text-card-foreground border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div>
            <Link href="/" className="flex items-center space-x-2">
              <BookOpenCheck className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold font-headline">Learn & Shop</span>
            </Link>
            <p className="mt-4 max-w-xs text-muted-foreground text-sm">
              Your one-stop destination for quality goods and expert-led learning.
            </p>
             <div className="mt-6 flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary"><span className="sr-only">Twitter</span><Twitter className="h-5 w-5" /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><span className="sr-only">Facebook</span><Facebook className="h-5 w-5" /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><span className="sr-only">Instagram</span><Instagram className="h-5 w-5" /></Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:col-span-2">
            <div className="text-sm">
              <p className="font-semibold">Company</p>
              <nav className="mt-4 space-y-2">
                <Link href="/about" className="block text-muted-foreground hover:text-primary">About</Link>
                <Link href="/contact" className="block text-muted-foreground hover:text-primary">Contact</Link>
                <Link href="/signup/vendor" className="block text-muted-foreground hover:text-primary">Become a Vendor</Link>
              </nav>
            </div>
             <div className="text-sm">
              <p className="font-semibold">Shop</p>
              <nav className="mt-4 space-y-2">
                <Link href="/search?type=product" className="block text-muted-foreground hover:text-primary">Products</Link>
                <Link href="/search?type=course" className="block text-muted-foreground hover:text-primary">Courses</Link>
                 <Link href="/search?category=Electronics" className="block text-muted-foreground hover:text-primary">Electronics</Link>
                <Link href="/search?category=Books" className="block text-muted-foreground hover:text-primary">Books</Link>
              </nav>
            </div>
            <div className="text-sm">
                <p className="font-semibold">Support</p>
                <ul className="mt-4 space-y-2">
                     <li>
                        <Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ</Link>
                    </li>
                    <li>
                       <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
                    </li>
                    <li>
                        <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
                    </li>
                </ul>
            </div>
            <div className="text-sm">
                <p className="font-semibold">Stay Updated</p>
                 <p className="mt-4 text-muted-foreground">
                    Subscribe for the latest on products and courses.
                </p>
                <form className="mt-4" onSubmit={handleNewsletterSubmit}>
                    <label htmlFor="footer-email" className="sr-only">Email</label>
                    <div className="flex items-center gap-2">
                        <Input name="email" id="footer-email" type="email" placeholder="Your email" required />
                        <Button type="submit">Go</Button>
                    </div>
                </form>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t pt-8">
          <p className="text-sm text-muted-foreground text-center">&copy; {new Date().getFullYear()} Learn & Shop. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
