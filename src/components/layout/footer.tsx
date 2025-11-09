'use client';
import Link from 'next/link';
import { BookOpenCheck, Twitter, Facebook, Instagram } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Footer() {
  const { toast } = useToast();
  const [activeContent, setActiveContent] = useState<'faq' | 'privacy' | 'terms' | null>(null);

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

  const supportContent = {
    faq: {
      title: 'Frequently Asked Questions',
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold">What is Learn & Shop?</h4>
            <p className="text-muted-foreground">Learn & Shop is a unique platform that combines e-commerce with online learning. You can buy high-quality products and enroll in expert-led courses all in one place.</p>
          </div>
          <div>
            <h4 className="font-semibold">How do I track my order?</h4>
            <p className="text-muted-foreground">You can track your order from your User Dashboard. Go to the "My Recent Orders" section to see the latest status of your purchases.</p>
          </div>
          <div>
            <h4 className="font-semibold">How do I access my courses?</h4>
            <p className="text-muted-foreground">Once you enroll in a course, it will appear in the "My Courses" section of your User Dashboard. You can start learning right away!</p>
          </div>
          <div>
            <h4 className="font-semibold">What is your return policy?</h4>
            <p className="text-muted-foreground">We offer a 30-day easy return policy for most products. Please check the product page for specific details. Course enrollments are generally non-refundable once you've accessed the content.</p>
          </div>
        </div>
      )
    },
    privacy: {
      title: 'Privacy Policy',
      content: (
         <div className="space-y-4 text-muted-foreground">
            <p>Your privacy is important to us. It is Learn & Shop's policy to respect your privacy regarding any information we may collect from you across our website.</p>
            <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.</p>
            <p>We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.</p>
            <p>We don’t share any personally identifying information publicly or with third-parties, except when required to by law.</p>
            <p>Our website may link to external sites that are not operated by us. Please be aware that we have no control over the content and practices of these sites, and cannot accept responsibility or liability for their respective privacy policies.</p>
        </div>
      )
    },
    terms: {
      title: 'Terms of Service',
      content: (
        <div className="space-y-4 text-muted-foreground">
            <h4 className="font-semibold text-foreground">1. Terms</h4>
            <p>By accessing the website at learnandshop.com, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>
            <h4 className="font-semibold text-foreground">2. Use License</h4>
            <p>Permission is granted to temporarily download one copy of the materials (information or software) on Learn & Shop's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.</p>
            <h4 className="font-semibold text-foreground">3. Disclaimer</h4>
            <p>The materials on Learn & Shop's website are provided on an 'as is' basis. Learn & Shop makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
            <h4 className="font-semibold text-foreground">4. Limitations</h4>
            <p>In no event shall Learn & Shop or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Learn & Shop's website.</p>
        </div>
      )
    }
  };

  const currentTitle = activeContent ? supportContent[activeContent].title : '';
  const currentContent = activeContent ? supportContent[activeContent].content : null;

  return (
    <footer className="bg-card text-card-foreground border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Newsletter */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpenCheck className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold font-headline">
                Learn & Shop
              </span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Subscribe to our newsletter for the latest updates on products and courses.
            </p>
            <form className="flex gap-2" onSubmit={handleNewsletterSubmit}>
              <Input name="email" type="email" placeholder="Your email address" className="bg-background" required />
              <Button type="submit">Subscribe</Button>
            </form>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
                <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
                <li><Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Categories</h3>
              <ul className="space-y-2">
                <li><Link href="/search?type=product" className="text-muted-foreground hover:text-primary transition-colors">Products</Link></li>
                <li><Link href="/search?type=course" className="text-muted-foreground hover:text-primary transition-colors">Courses</Link></li>
                <li><Link href="/search?category=Electronics" className="text-muted-foreground hover:text-primary transition-colors">Technology</Link></li>
                <li><Link href="/search?category=Courses" className="text-muted-foreground hover:text-primary transition-colors">Design</Link></li>
              </ul>
            </div>
             <Sheet onOpenChange={(open) => !open && setActiveContent(null)}>
                <div>
                    <h3 className="font-semibold mb-4">Support</h3>
                    <ul className="space-y-2">
                        <li>
                            <SheetTrigger asChild>
                                <button onClick={() => setActiveContent('faq')} className="text-muted-foreground hover:text-primary transition-colors">FAQ</button>
                            </SheetTrigger>
                        </li>
                        <li>
                            <SheetTrigger asChild>
                                <button onClick={() => setActiveContent('privacy')} className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</button>
                            </SheetTrigger>
                        </li>
                        <li>
                             <SheetTrigger asChild>
                                <button onClick={() => setActiveContent('terms')} className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</button>
                            </SheetTrigger>
                        </li>
                    </ul>
                </div>
                <SheetContent className="w-full max-w-lg">
                    <SheetHeader>
                        <SheetTitle className="text-2xl">{currentTitle}</SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="h-[calc(100%-4rem)] pr-6 mt-4">
                        {currentContent}
                    </ScrollArea>
                </SheetContent>
            </Sheet>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Learn & Shop. All Rights Reserved.
          </p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5" /></Link>
            <Link href="#" className="text-muted-foreground hover:text-primary"><Facebook className="h-5 w-5" /></Link>
            <Link href="#" className="text-muted-foreground hover:text-primary"><Instagram className="h-5 w-5" /></Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
