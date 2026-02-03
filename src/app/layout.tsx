import "@/app/globals.css";
import ChallengeOverlay from "@/components/game/ChallengeOverlay";
import ChatWidget from "@/components/chat/ChatWidget";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { CartProvider } from "@/context/CartContext";
import { Inter, Playfair_Display } from "next/font/google";
import type { Metadata } from "next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VinylVault Records | Vintage & New Vinyl",
  description: "Your premier online record store.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} antialiased min-h-screen flex flex-col bg-background text-foreground`}
      >
        <CartProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <ChallengeOverlay />
          <ChatWidget />
        </CartProvider>
      </body>
    </html>
  );
}
