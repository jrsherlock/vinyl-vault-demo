"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="bg-muted p-8 rounded-full mb-6">
          <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-serif font-bold mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          Looks like you haven't added any records to your collection yet.
        </p>
        <Link 
          href="/catalog" 
          className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-accent hover:text-accent-foreground transition-all"
        >
          Browse Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-serif font-bold mb-12 text-primary">Your Collection</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <div key={item.id} className="group bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-border flex flex-col sm:flex-row gap-6 items-center">
                <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-xl border border-border">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-xs font-serif">VinylVault</div>
                  )}
                </div>
                
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-xl font-serif font-bold mb-1">{item.title}</h3>
                  <p className="text-muted-foreground mb-4">{item.artist}</p>
                  <p className="text-xl font-bold text-primary font-serif">${item.price.toFixed(2)}</p>
                </div>
                
                <div className="flex flex-col items-center sm:items-end gap-6 w-full sm:w-auto">
                  <div className="flex items-center bg-muted rounded-full p-1 border border-border">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 hover:bg-white rounded-full transition-colors text-primary disabled:opacity-30"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center font-bold">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 hover:bg-white rounded-full transition-colors text-primary"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="flex items-center gap-2 text-sm font-medium text-destructive hover:text-destructive/80 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-primary text-primary-foreground rounded-2xl p-8 sticky top-32 shadow-xl">
              <h2 className="text-2xl font-serif font-bold mb-8">Order Summary</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-primary-foreground/70">
                  <span>Subtotal ({cartCount} items)</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-primary-foreground/70">
                  <span>Shipping</span>
                  <span className="font-medium text-accent">FREE</span>
                </div>
                <div className="flex justify-between text-primary-foreground/70">
                  <span>Tax (Calculated at checkout)</span>
                  <span>$0.00</span>
                </div>
                <div className="h-px bg-white/20 my-4" />
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-accent underline decoration-accent/30 decoration-4 underline-offset-4">${cartTotal.toFixed(2)}</span>
                </div>
              </div>
              
              <button className="w-full bg-accent text-accent-foreground py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-lg group">
                Checkout Now
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <p className="text-xs text-center mt-6 opacity-60">
                Secure SSL Encrypted Checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
