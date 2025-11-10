
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function FAQPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">
          Frequently Asked Questions
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Find answers to common questions about our platform.
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-lg">What is Learn & Shop?</AccordionTrigger>
          <AccordionContent className="text-base text-muted-foreground">
            Learn & Shop is a unique platform that combines e-commerce with online learning. You can buy high-quality products and enroll in expert-led courses all in one place.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger className="text-lg">How do I track my order?</AccordionTrigger>
          <AccordionContent className="text-base text-muted-foreground">
            You can track your order from your User Dashboard. Go to the "My Recent Orders" section to see the latest status of your purchases.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger className="text-lg">How do I access my courses?</AccordionTrigger>
          <AccordionContent className="text-base text-muted-foreground">
            Once you enroll in a course, it will appear in the "My Courses" section of your User Dashboard. You can start learning right away!
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-4">
          <AccordionTrigger className="text-lg">What is your return policy?</AccordionTrigger>
          <AccordionContent className="text-base text-muted-foreground">
            We offer a 30-day easy return policy for most products. Please check the product page for specific details. Course enrollments are generally non-refundable once you've accessed the content.
          </AccordionContent>
        </AccordionItem>
         <AccordionItem value="item-5">
          <AccordionTrigger className="text-lg">How do I become a vendor?</AccordionTrigger>
          <AccordionContent className="text-base text-muted-foreground">
            We're thrilled you want to sell with us! You can sign up to become a vendor by visiting the "Become a Vendor" page from the link in our footer. The process is quick and easy.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
