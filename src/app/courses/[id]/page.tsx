'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { allItems } from '@/lib/data';
import { getImageById } from '@/lib/placeholder-images';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Star, BookOpen, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import ItemCard from '@/components/item-card';


export default function CourseDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const course = allItems.find(item => item.id === id && item.type === 'course');
  const placeholder = course ? getImageById(course.imageId) : null;
  const relatedCourses = allItems.filter(item => item.type === 'course' && item.id !== id).slice(0, 4);

  // Mock lessons for demonstration
  const lessons = [
    { title: 'Introduction to the Course', duration: '15 min' },
    { title: 'Core Concepts of the Subject', duration: '45 min' },
    { title: 'First Project: Building the Foundation', duration: '1 hr 30 min' },
    { title: 'Advanced Topics', duration: '2 hr' },
    { title: 'Final Project and Wrap-up', duration: '3 hr' },
  ];

  if (!course || !placeholder) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Course not found</h1>
        <p className="text-muted-foreground mt-2">The course you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
        {/* Left column for details */}
        <div className="md:col-span-2">
            <div className="relative aspect-video overflow-hidden rounded-lg shadow-lg mb-6">
                <Image
                src={placeholder.imageUrl}
                alt={placeholder.description}
                fill
                className="object-cover"
                data-ai-hint={placeholder.imageHint}
                />
            </div>

            <Badge className="w-fit mb-2">{course.type}</Badge>
            <h1 className="text-3xl lg:text-4xl font-bold font-headline">{course.name}</h1>
            <p className="mt-4 text-foreground/80 text-lg leading-relaxed">{course.description}</p>
            
            <div className="mt-8">
                <h2 className="text-2xl font-bold font-headline mb-4">Course Content</h2>
                <Accordion type="single" collapsible className="w-full">
                    {lessons.map((lesson, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger>{`Section ${index + 1}: ${lesson.title}`}</AccordionTrigger>
                        <AccordionContent>
                        <div className="flex items-center justify-between text-muted-foreground">
                            <p>Detailed content for this lesson will appear here.</p>
                            <span className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4" />
                                {lesson.duration}
                            </span>
                        </div>
                        </AccordionContent>
                    </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>

        {/* Right column for purchase card */}
        <div className="md:col-span-1">
            <div className="sticky top-24">
                <div className="border rounded-lg bg-card text-card-foreground shadow-sm p-6">
                    <p className="text-4xl font-bold text-primary mb-4">${course.price.toFixed(2)}</p>
                    <Button size="lg" className="h-12 text-lg w-full" onClick={() => addToCart(course)}>
                        <BookOpen className="mr-2" />
                        Enroll Now
                    </Button>
                    <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-amber-500 fill-current" />
                            <span>{course.rating} average rating</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <p>By {course.vendor}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
      
       <div className="mt-20">
          <h2 className="text-2xl font-bold font-headline mb-6">Related Courses</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedCourses.map(item => (
                  <ItemCard key={item.id} item={item} />
              ))}
          </div>
      </div>
    </div>
  );
}
