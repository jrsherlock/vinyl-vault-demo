"use client";

import Link from "next/link";
import { Disc, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const { cartCount } = useCart();

  return (
    <header className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Disc className="h-8 w-8 text-accent animate-spin-slow group-hover:animate-spin" />
            <div className="absolute inset-0 bg-accent/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-2xl font-serif font-bold tracking-tight">
            VinylVault
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 font-medium">
          <Link href="/" className="hover:text-accent transition-colors">
            Home
          </Link>
          <Link href="/catalog" className="hover:text-accent transition-colors">
            Catalog
          </Link>
          <Link href="/about" className="hover:text-accent transition-colors">
            About Us
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/cart"
            className="relative hover:text-accent transition-colors p-2"
          >
            <ShoppingCart className="h-6 w-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-in zoom-in duration-300">
                {cartCount}
              </span>
            )}
          </Link>
          <Link
            href="/account"
            className="hover:text-accent transition-colors p-2"
          >
            <User className="h-6 w-6" />
          </Link>
        </div>
      </div>
    </header>
  );
}
