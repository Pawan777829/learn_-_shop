'use client';
import ItemCard from "@/components/item-card";
import { Button } from "@/components/ui/button";
import { allItems } from "@/lib/data";
import type { Item, ItemCategory } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";

// Helper function to render a category section
const CategorySection = ({ title, items, categoryId }: { title: string; items: Item[], categoryId: string }) => (
  <section className="py-12" id={categoryId}>
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold font-headline tracking-tight">
          {title}
        </h2>
        <Button variant="outline" asChild>
          <Link href={`/search?category=${encodeURIComponent(title)}`}>View All</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

  const electronics = getItemsByCategory("Electronics", 4);
  const courses = getItemsByCategory("Courses", 4);
  const accessories = getItemsByCategory("Computers & Accessories", 4);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] min-h-[400px] flex items-center justify-center text-center bg-gray-900 text-white">
        <Image
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Students learning and shopping"
          fill
          className="object-cover opacity-30"
          data-ai-hint="learning shopping"
        />
        <div className="relative z-10 p-4">
          <h1 className="text-4xl font-headline font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            Learn, Shop, and Grow
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-200">
            Your one-stop destination for quality goods and expert-led learning. Discover products that inspire and courses that empower.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="#electronics">Shop Electronics</Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-200">
              <Link href="#courses">Explore Courses</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Sections */}
      {electronics.length > 0 && <CategorySection title="Top Electronics" items={electronics} categoryId="electronics" />}
      {courses.length > 0 && <CategorySection title="Popular Courses" items={courses} categoryId="courses" />}
      {accessories.length > 0 && <CategorySection title="Computers & Accessories" items={accessories} categoryId="accessories" />}
      
    </div>
  );
}
