'use client';
import ItemCard from "@/components/item-card";
import { Button } from "@/components/ui/button";
import { allItems } from "@/lib/data";
import type { Item, ItemCategory } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { Users, Target, BookOpenCheck } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

// Helper function to render a category section
const CategorySection = ({ title, items, categoryId }: { title: string; items: Item[], categoryId: string }) => (
  <section className="py-12 md:py-16" id={categoryId}>
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold font-headline tracking-tight">
          {title}
        </h2>
        <Button variant="outline" asChild>
          <Link href={`/search?category=${encodeURIComponent(title)}`}>View All</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  </section>
);

export default function Home() {
  const getItemsByCategory = (category: ItemCategory, limit: number) => {
    return allItems.filter((item) => item.category === category).slice(0, limit);
  };
  
  const featuredItems = [...getItemsByCategory("Electronics", 2), ...getItemsByCategory("Courses", 2)];
  const electronics = getItemsByCategory("Electronics", 4);
  const courses = getItemsByCategory("Courses", 4);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full h-[70vh] min-h-[500px] flex items-center justify-center text-center bg-gray-900 text-white">
        <Image
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Students learning and shopping"
          fill
          className="object-cover opacity-30"
          priority
          data-ai-hint="learning shopping"
        />
        <div className="relative z-10 p-4 max-w-4xl mx-auto">
          <h1 className="text-4xl font-headline font-extrabold tracking-tight text-white sm:text-5xl md:text-7xl">
            Where Knowledge Meets Opportunity
          </h1>
          <p className="mt-6 mx-auto text-lg text-gray-200 md:text-xl">
            Your one-stop destination for quality goods and expert-led learning. Discover products that inspire and courses that empower your journey.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="h-12 px-8 text-lg">
              <Link href="/search?type=product">Shop Now</Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="h-12 px-8 text-lg">
              <Link href="/search?type=course">Explore Courses</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Items Carousel */}
      <section className="py-12 md:py-20 bg-background">
        <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold font-headline tracking-tight text-center mb-10">Featured Products & Courses</h2>
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {featuredItems.map((item) => (
                  <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                    <div className="p-1 h-full">
                      <ItemCard item={item} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex"/>
              <CarouselNext className="hidden sm:flex"/>
            </Carousel>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-12 md:py-20 bg-card border-y">
        <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold font-headline mb-12">What We Stand For</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
                <div className="flex flex-col items-center p-6">
                <div className="p-4 bg-primary rounded-full mb-4">
                    <Users className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Community</h3>
                <p className="text-muted-foreground">
                    Fostering a supportive network of learners and experts to share ideas and grow together.
                </p>
                </div>
                <div className="flex flex-col items-center p-6">
                <div className="p-4 bg-primary rounded-full mb-4">
                    <Target className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Quality</h3>
                <p className="text-muted-foreground">
                    Curating only the best courses and products to ensure a valuable and effective experience.
                </p>
                </div>
                <div className="flex flex-col items-center p-6">
                <div className="p-4 bg-primary rounded-full mb-4">
                    <BookOpenCheck className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Application</h3>
                <p className="text-muted-foreground">
                    Bridging the gap between theory and practice with hands-on projects and tools.
                </p>
                </div>
            </div>
        </div>
      </section>

      {/* Categories Sections */}
      {electronics.length > 0 && <CategorySection title="Top Electronics" items={electronics} categoryId="electronics" />}
      {courses.length > 0 && <CategorySection title="Popular Courses" items={courses} categoryId="courses" />}
      
    </div>
  );
}
