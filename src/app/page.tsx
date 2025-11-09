'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { allItems } from "@/lib/data";
import ItemCard from "@/components/item-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const products = allItems.filter((item) => item.type === "product").slice(0, 4);
  const courses = allItems.filter((item) => item.type === "course").slice(0, 4);
  const featuredItems = [...products.slice(0, 2), ...courses.slice(0, 2)];

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
              <Link href="#featured">Shop Products</Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-200">
              <Link href="#featured">Explore Courses</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Items Section */}
      <section id="featured" className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold font-headline tracking-tight text-center">
            Featured Products & Courses
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-center">
            Handpicked for you. Quality you can trust.
          </p>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:w-1/2 mx-auto lg:w-1/3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
          </TabsList>
          <div className="mt-8">
            <TabsContent value="all">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {allItems.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="products">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="courses">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {courses.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}