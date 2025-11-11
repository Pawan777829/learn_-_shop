'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
import { allItems } from '@/lib/data';
import type { Item, ItemCategory } from '@/lib/types';
import ItemCard from '@/components/item-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'all';
  const initialType = (searchParams.get('type') as 'product' | 'course' | null) || 'all';
  
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [typeFilter, setTypeFilter] = useState<'all' | 'product' | 'course'>(initialType);
  const [categoryFilter, setCategoryFilter] = useState<string>(initialCategory);
  const [sortOrder, setSortOrder] = useState('relevance');
  const maxPrice = useMemo(() => Math.ceil(Math.max(...allItems.map(item => item.price))), []);
  const [priceRange, setPriceRange] = useState([0, maxPrice]);
  const [ratingFilter, setRatingFilter] = useState(0);

  useEffect(() => {
    setSearchTerm(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setCategoryFilter(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    setTypeFilter(initialType);
  }, [initialType]);
  
  const categories = useMemo(() => {
    let relevantItems = allItems;
    if (typeFilter !== 'all') {
      relevantItems = allItems.filter(item => item.type === typeFilter);
    }
    const allCategories = relevantItems.map(item => item.category);
    return ['all', ...Array.from(new Set(allCategories))];
  }, [typeFilter]);

  // Effect to reset category if it's not available for the selected type
  useEffect(() => {
    if (!categories.includes(categoryFilter)) {
        setCategoryFilter('all');
    }
  }, [categories, categoryFilter]);


  const filteredItems = useMemo(() => {
    let items = allItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];
      const matchesRating = item.rating >= ratingFilter;

      return matchesSearch && matchesType && matchesCategory && matchesPrice && matchesRating;
    });

    switch (sortOrder) {
        case 'price-asc':
            items.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            items.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            items.sort((a, b) => b.rating - a.rating);
            break;
        default: // relevance
            break;
    }

    return items;
  }, [searchTerm, typeFilter, categoryFilter, sortOrder, priceRange, ratingFilter]);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-headline font-bold tracking-tight lg:text-5xl">
          Explore Products & Courses
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Find exactly what you're looking for.
        </p>
      </header>

      <div className="mb-8 p-4 border rounded-lg bg-card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          <Input 
            type="text"
            placeholder="Search by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:col-span-2 lg:col-span-4"
          />
          <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="product">Products</SelectItem>
              <SelectItem value="course">Courses</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
           <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Sort by Relevance</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rating</SelectItem>
            </SelectContent>
          </Select>
          <div className='space-y-2'>
              <Label>Price Range: ${priceRange[0]} - ${priceRange[1]}</Label>
              <Slider
                min={0}
                max={maxPrice}
                step={10}
                value={[priceRange[1]]}
                onValueChange={(value) => setPriceRange([priceRange[0], value[0]])}
              />
          </div>
           <div className='space-y-2'>
              <Label>Minimum Rating: {ratingFilter} stars</Label>
              <Slider
                min={0}
                max={5}
                step={0.5}
                value={[ratingFilter]}
                onValueChange={(value) => setRatingFilter(value[0])}
              />
          </div>

        </div>
      </div>

      <div>
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item: Item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold">No items found</h2>
            <p className="text-muted-foreground mt-2">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SearchPageContent />
        </Suspense>
    )
}
