'use client';
import ItemCard from "@/components/item-card";
import { Button } from "@/components/ui/button";
import { allItems } from "@/lib/data";
import type { Item } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";

// Helper function to render a category section
const CategorySection = ({ title, items }: { title: string; items: Item[] }) => (
  <section className="py-12">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold font-headline tracking-tight mb-8">
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  </section>
);

export default function Home() {
  const electronics = allItems.filter((item) => item.category === "Electronics").slice(0, 4);
  const software = allItems.filter((item) => item.category === "Software").slice(0, 4);
  const art = allItems.filter((item) => item.category === "Art").slice(0, 4);

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
              <Link href="#software">Explore Courses</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Sections */}
      <div id="electronics">
        <CategorySection title="Top Electronics" items={electronics} />
      </div>
      <div id="software">
       <CategorySection title="Popular Software Courses" items={software} />
      </div>
       <div id="art">
        <CategorySection title="Creative Arts" items={art} />
      </div>
    </div>
  );
}
