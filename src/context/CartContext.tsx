"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  title: string;
  artist: string;
  price: number;
  image?: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isInCart: (productId: string) => boolean;
  applyDiscount: (code: string) => boolean;
  discount: { code: string; percent: number } | null;
  removeDiscount: () => void;
  cartSubtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [discount, setDiscount] = useState<{ code: string; percent: number } | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('vinyl-vault-cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart from localStorage", e);
      }
    }
    const savedDiscount = localStorage.getItem('vinyl-vault-discount');
    if (savedDiscount) {
      try {
        setDiscount(JSON.parse(savedDiscount));
      } catch (e) {
        console.error("Failed to parse discount from localStorage", e);
      }
    }
    setIsHydrated(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('vinyl-vault-cart', JSON.stringify(cartItems));
      if (discount) {
        localStorage.setItem('vinyl-vault-discount', JSON.stringify(discount));
      } else {
        localStorage.removeItem('vinyl-vault-discount');
      }
    }
  }, [cartItems, discount, isHydrated]);

  const addToCart = (product: any) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        // According to user requirements: prevent adding duplicates from catalog/detail
        // We'll just return the same items instead of incrementing quantity
        return prevItems;
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const isInCart = (productId: string) => {
    return cartItems.some(item => item.id === productId);
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setDiscount(null);
  };

  const applyDiscount = (code: string): boolean => {
    const normalizeCode = code.toUpperCase().trim();
    if (normalizeCode === 'SAVE10') {
      setDiscount({ code: 'SAVE10', percent: 10 });
      return true;
    }
    if (normalizeCode === 'BACKSTAGE_PASS_90') {
      setDiscount({ code: 'BACKSTAGE_PASS_90', percent: 90 });
      return true;
    }
    // Vinny might call this via tool, so we keep logic here
    return false;
  };

  const removeDiscount = () => {
    setDiscount(null);
  }

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const discountAmount = discount ? (cartSubtotal * discount.percent / 100) : 0;
  const cartTotal = cartSubtotal - discountAmount;

  // Prevent hydration mismatch by not rendering anything cart-related on server
  const value = {
    cartItems: isHydrated ? cartItems : [],
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount: isHydrated ? cartCount : 0,
    cartTotal: isHydrated ? cartTotal : 0,
    isInCart: (productId: string) => isHydrated ? isInCart(productId) : false,
    applyDiscount,
    discount: isHydrated ? discount : null,
    removeDiscount,
    cartSubtotal: isHydrated ? cartSubtotal : 0,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
