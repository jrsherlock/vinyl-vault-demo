"use client";

import { useState, useMemo } from 'react';
import productsData from '@/data/products.json';
import ProductCard from '@/components/products/ProductCard';

const GENRES = ["All", "Rock", "Jazz", "Hip Hop", "Electronic", "Indie"];

export default function CatalogPage() {
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [sortBy, setSortBy] = useState("Newest Arrivals");
  const { products } = productsData;

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];
    
    // Filtering
    if (selectedGenre !== "All") {
      result = result.filter(product => product.genre === selectedGenre);
    }
    
    // Sorting
    switch (sortBy) {
      case "Price: Low to High":
        result.sort((a, b) => a.price - b.price);
        break;
      case "Price: High to Low":
        result.sort((a, b) => b.price - a.price);
        break;
      case "Artist A-Z":
        result.sort((a, b) => a.artist.localeCompare(b.artist));
        break;
      case "Newest Arrivals":
      default:
        // Assuming products are already sorted by newest (or use ID/Year if available)
        // For this demo, we'll slice and reverse to simulate "newest"
        result.reverse();
    }
    
    return result;
  }, [selectedGenre, sortBy, products]);

  return (
    <div className="bg-background min-h-screen">
      {/* Catalog Header */}
      <section className="bg-primary pt-32 pb-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">The Vault</h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto mb-10">
            Browse our curated collection of essential vinyl. From jazz masterpieces to electronic pioneers.
          </p>
          
          {/* Genre Picker */}
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {GENRES.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border backdrop-blur-sm ${
                  selectedGenre === genre
                    ? "bg-white text-primary border-white shadow-lg scale-105"
                    : "bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/40"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
          <h2 className="text-2xl font-serif font-bold text-primary">
            {selectedGenre === "All" ? "Full Catalog" : selectedGenre} <span className="text-muted-foreground font-sans text-lg font-normal ml-2">({filteredAndSortedProducts.length} items)</span>
          </h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Sort by:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-muted px-3 py-1.5 rounded-lg font-medium text-primary focus:outline-none cursor-pointer border border-border"
            >
              <option>Newest Arrivals</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Artist A-Z</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredAndSortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredAndSortedProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">No records found in this category.</p>
          </div>
        )}
      </section>
    </div>
  );
}
