"use client";

import productsData from '@/data/products.json';
import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import { Star, ShoppingCart, Truck, ShieldCheck, RefreshCw, Check, ChevronLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useMemo } from 'react';
import Link from 'next/link';

interface Review {
  user: string;
  rating: number;
  text: string;
}

interface Product {
  id: string;
  title: string;
  artist: string;
  year: number;
  genre: string;
  condition: string;
  price: number;
  cost: number;
  stock: number;
  description: string;
  image: string;
  reviews?: Review[];
}

export default function ProductPage() {
  const params = useParams();
  const id = params?.id as string;
  const { addToCart, isInCart } = useCart();
  
  const product = useMemo(() => {
    return (productsData.products as Product[]).find(p => p.id === id);
  }, [id]);

  const inCollection = useMemo(() => {
    return id ? isInCart(id) : false;
  }, [id, isInCart]);

  if (!product) {
    notFound();
  }

  const handleAddToCart = () => {
    if (!inCollection) {
      addToCart(product);
    }
  };

  return (
    <div className="bg-background pt-4 pb-20">
      <div className="container mx-auto px-4">
        {/* Breadcrumbs & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <nav className="flex items-center text-sm text-muted-foreground font-medium">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/catalog" className="hover:text-primary transition-colors">Catalog</Link>
            <span className="mx-2">/</span>
            <span className="text-primary truncate max-w-[200px]">{product.title}</span>
          </nav>
          
          <Link 
            href="/catalog" 
            className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:translate-x-[-4px] transition-transform w-fit"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Catalog
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image Column */}
          <div className="relative aspect-square rounded-2xl overflow-hidden border border-border shadow-md">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground font-serif text-2xl">VinylVault</span>
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="flex flex-col">
            <div className="mb-6">
              <p className="text-primary font-bold uppercase tracking-widest text-sm mb-2">{product.genre}</p>
              <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2">{product.title}</h1>
              <p className="text-xl text-muted-foreground mb-4">{product.artist}</p>
              <div className="flex items-center gap-2 mb-6">
                <div className="flex text-accent">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-5 w-5 fill-current" />)}
                </div>
                <span className="text-sm font-medium text-muted-foreground">(12 customer reviews)</span>
              </div>
            </div>

            <div className="text-3xl font-serif font-bold text-primary mb-8">
              ${product.price.toFixed(2)}
            </div>

            <div className="prose prose-slate mb-10 max-w-none">
              <p className="text-muted-foreground leading-relaxed text-lg">
                {product.description}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground list-disc pl-5">
                <li>Year: {product.year}</li>
                <li>Condition: {product.condition}</li>
                <li>In Stock: {product.stock} units</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <button 
                onClick={handleAddToCart}
                disabled={inCollection}
                className={`flex-1 py-4 px-8 rounded-full font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2 ${
                  inCollection 
                    ? "bg-accent text-accent-foreground cursor-default" 
                    : "bg-primary text-white hover:bg-primary/90 active:scale-[0.98]"
                }`}
              >
                {inCollection ? (
                  <>
                    <Check className="h-5 w-5" /> In Your Collection
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" /> Add to Cart
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-border">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Truck className="h-5 w-5 text-primary" /> Free Shipping
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <ShieldCheck className="h-5 w-5 text-primary" /> Secure Payment
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <RefreshCw className="h-5 w-5 text-primary" /> Easy Returns
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section - Vulnerability Spot */}
        <section className="max-w-4xl border-t border-border pt-16">
          <h2 className="text-3xl font-serif font-bold mb-10">Customer Reviews</h2>
          {product.reviews && product.reviews.length > 0 ? (
            <div className="space-y-10">
              {product.reviews.map((review, i) => (
                <div key={i} className="bg-muted/50 p-6 rounded-2xl border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-primary">{review.user}</span>
                    <div className="flex text-accent">
                      {Array.from({ length: review.rating }).map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground italic leading-relaxed">
                    "{review.text}"
                  </p>
                  {/* Note for the demo presenter: The comments inside the review are NOT visible in the UI */}
                  {/* but they are present in the DOM/data for the AI to find. */}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-muted/30 p-12 rounded-2xl text-center">
              <p className="text-muted-foreground">No reviews yet. Be the first to share your thoughts!</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
