import Image from 'next/image';
import { Disc, Users, Music, MapPin } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/60 z-10" />
          <Image 
            src="/images/vvinterior.png"
            alt="Vinyl Records"
            fill
            className="object-cover"
            priority
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-20 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 animate-in slide-in-from-bottom duration-700">
            Our Soul is in the <span className="text-accent underline decoration-wavy underline-offset-8">Groove</span>
          </h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto font-medium text-white/90 animate-in slide-in-from-bottom duration-700 delay-100">
            VinylVault is more than a record store. It's a sanctuary for those who believe music should be felt, not just heard.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-bold tracking-widest uppercase">
              <Disc className="h-4 w-4 animate-spin-slow" /> Our Story
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold leading-tight">
              From a Dusty Attic to Your Turntable
            </h2>
            <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
              <p>
                Founded in 2019 by a small group of audiophiles in Des Moines, VinylVault began with a single mission: to rescue forgotten sounds and share them with a new generation of listeners.
              </p>
              <p>
                What started as a weekend passion project—scouring garage sales and estate auctions—quickly grew into a curated collection of thousands of titles. We believe the ritual of vinyl—the sleeve art, the drop of the needle, the subtle crackle—is the purest way to experience an artist's vision.
              </p>
              <p>
                Today, we operate as both a physical storefront and a digital destination for collectors worldwide, specializing in rare pressings, classic reissues, and the best of the underground.
              </p>
            </div>
          </div>
          
          <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
            <Image 
              src="https://images.unsplash.com/photo-1539375665275-f9ad415ef9ac?q=80&w=1200&auto=format&fit=crop"
              alt="Store Interior"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="bg-muted py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold mb-4">Why VinylVault?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We prioritize quality and curation over quantity. Every record that leaves our store is handled with the respect it deserves.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background p-10 rounded-3xl shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="bg-primary/5 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Music className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-serif font-bold mb-4">Expert Curated</h3>
              <p className="text-muted-foreground leading-relaxed">
                Every album in our inventory is hand-selected by our staff of seasoned crate-diggers and music historians.
              </p>
            </div>
            
            <div className="bg-background p-10 rounded-3xl shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="bg-accent/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-accent-foreground" />
              </div>
              <h3 className="text-2xl font-serif font-bold mb-4">Local Community</h3>
              <p className="text-muted-foreground leading-relaxed">
                We host monthly listening parties and local artist showcases in our Des Moines flagship location.
              </p>
            </div>
            
            <div className="bg-background p-10 rounded-3xl shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="bg-primary/5 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-serif font-bold mb-4">Visit Us</h3>
              <p className="text-muted-foreground leading-relaxed">
                Located in the heart of the East Village, we're open 7 days a week for browsing and private listening sessions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 text-center container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-serif font-bold mb-8">Ready to expand your collection?</h2>
        <a 
          href="/catalog" 
          className="inline-flex items-center justify-center px-10 py-4 bg-primary text-white text-xl font-bold rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl"
        >
          Browse Our Catalog
        </a>
      </section>
    </div>
  );
}
