"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    artist: string;
    price: number;
    genre: string;
    image?: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, isInCart } = useCart();
  const inCart = isInCart(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inCart) {
      addToCart(product);
    }
  };

  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-border flex flex-col h-full">
      <Link href={`/catalog/${product.id}`} className="relative aspect-square block overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground font-serif">VinylVault</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
      </Link>
      
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-auto">
          <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{product.genre}</p>
          <Link href={`/catalog/${product.id}`}>
            <h3 className="font-serif font-bold text-lg leading-snug group-hover:text-primary transition-colors mb-1">
              {product.title}
            </h3>
          </Link>
          <p className="text-muted-foreground text-sm">{product.artist}</p>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-bold text-primary font-serif">${product.price.toFixed(2)}</span>
          <button 
            onClick={handleAddToCart}
            disabled={inCart}
            className={`${
              inCart ? "bg-accent text-accent-foreground cursor-default" : "bg-primary text-white hover:scale-110 active:scale-95 shadow-md"
            } p-2.5 rounded-full transition-all`}
            aria-label={inCart ? "In cart" : "Add to cart"}
          >
            {inCart ? <Check className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
