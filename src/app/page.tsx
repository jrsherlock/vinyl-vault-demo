import Link from "next/link";
import { ArrowRight } from "lucide-react";
import productsData from '@/data/products.json';
import ProductCard from '@/components/products/ProductCard';

export default function Home() {
  const { products } = productsData;
  // Get the last 4 products added as "New Arrivals"
  const newArrivals = products.slice(-4).reverse();

  return (
    <div className="pb-12">
      {/* Hero Section */}
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-12 md:py-20 px-4 relative overflow-hidden">
        <div className="container mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 max-w-2xl">
              <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 leading-tight">
                Discover the warm sound of <span className="text-accent">Vinyl</span>.
              </h1>
              <p className="text-lg md:text-xl mb-8 text-primary-foreground/90">
                From rare vintage pressings to the latest releases.
                Curated for the true audiophile.
              </p>
              <Link 
                href="/catalog" 
                className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-full font-bold hover:bg-white hover:text-primary transition-colors shadow-lg"
              >
                Shop Now <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            <div className="flex-1 w-full max-w-md md:max-w-xl relative animate-in slide-in-from-right duration-700">
              <div className="relative aspect-[4/3] w-full transform md:rotate-3 hover:rotate-0 transition-transform duration-500">
                <img 
                  src="/images/recordpurplerectangle.png" 
                  alt="VinylVault Records"
                  className="object-contain w-full h-full drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
        {/* Background decorative elements */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
      </section>

      {/* Featured Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-serif font-bold mb-8 text-center text-primary">Featured New Arrivals</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link 
            href="/catalog" 
            className="inline-flex items-center gap-2 text-primary font-bold hover:text-accent transition-colors group"
          >
            View Full Collection <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
